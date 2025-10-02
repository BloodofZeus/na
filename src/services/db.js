const DB_NAME = 'ShawarmaBosPOS';
const DB_VERSION = 1;

const STORES = {
  ORDERS: 'orders',
  MENU: 'menu',
  STAFF: 'staff',
  SYNC_QUEUE: 'syncQueue'
};

class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORES.ORDERS)) {
          const ordersStore = db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
          ordersStore.createIndex('timestamp', 'timestamp', { unique: false });
          ordersStore.createIndex('synced', 'synced', { unique: false });
          ordersStore.createIndex('staff', 'staff', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.MENU)) {
          const menuStore = db.createObjectStore(STORES.MENU, { keyPath: 'id' });
          menuStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.STAFF)) {
          const staffStore = db.createObjectStore(STORES.STAFF, { keyPath: 'username' });
          staffStore.createIndex('role', 'role', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        console.log('IndexedDB stores created');
      };
    });
  }

  async saveOrder(order) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.ORDERS], 'readwrite');
    const store = transaction.objectStore(STORES.ORDERS);
    
    const orderWithMetadata = {
      ...order,
      savedAt: new Date().toISOString(),
      synced: 0
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(orderWithMetadata);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getOrders() {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.ORDERS], 'readonly');
    const store = transaction.objectStore(STORES.ORDERS);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOrders() {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.ORDERS], 'readonly');
    const store = transaction.objectStore(STORES.ORDERS);
    const index = store.index('synced');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(0));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markOrderSynced(orderId) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.ORDERS], 'readwrite');
    const store = transaction.objectStore(STORES.ORDERS);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(orderId);
      
      getRequest.onsuccess = () => {
        const order = getRequest.result;
        if (order) {
          order.synced = 1;
          order.syncedAt = new Date().toISOString();
          
          const putRequest = store.put(order);
          putRequest.onsuccess = () => resolve(true);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(false);
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteOrder(orderId) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.ORDERS], 'readwrite');
    const store = transaction.objectStore(STORES.ORDERS);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(orderId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async saveMenu(menuItems) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.MENU], 'readwrite');
    const store = transaction.objectStore(STORES.MENU);
    
    await store.clear();
    
    const promises = menuItems.map(item => {
      return new Promise((resolve, reject) => {
        const request = store.put({
          ...item,
          lastUpdated: new Date().toISOString()
        });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
    
    return Promise.all(promises);
  }

  async getMenu() {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.MENU], 'readonly');
    const store = transaction.objectStore(STORES.MENU);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveStaff(staffList) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.STAFF], 'readwrite');
    const store = transaction.objectStore(STORES.STAFF);
    
    await store.clear();
    
    const promises = staffList.map(staff => {
      return new Promise((resolve, reject) => {
        const request = store.put(staff);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
    
    return Promise.all(promises);
  }

  async getStaff() {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.STAFF], 'readonly');
    const store = transaction.objectStore(STORES.STAFF);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addToSyncQueue(type, data) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    
    return new Promise((resolve, reject) => {
      const request = store.add({
        type,
        data,
        timestamp: new Date().toISOString(),
        retries: 0
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue() {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.SYNC_QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeSyncQueueItem(id) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll() {
    if (!this.db) await this.init();
    
    const stores = [STORES.ORDERS, STORES.MENU, STORES.STAFF, STORES.SYNC_QUEUE];
    
    const promises = stores.map(storeName => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    });
    
    return Promise.all(promises);
  }
}

const dbManager = new IndexedDBManager();

export default dbManager;
