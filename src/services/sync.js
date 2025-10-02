import dbManager from './db';
import { createOrder } from './api';
import networkStatus from './network';

class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = new Set();
    this.pendingCount = 0;
    
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_ORDERS') {
          this.syncPendingOrders();
        }
      });
    }

    networkStatus.subscribe((online) => {
      if (online) {
        console.log('[Sync] Network online, starting sync...');
        setTimeout(() => this.syncPendingOrders(), 1000);
      }
    });

    await this.updatePendingCount();
  }

  async updatePendingCount() {
    try {
      const pending = await dbManager.getPendingOrders();
      this.pendingCount = pending.length;
      this.notifySyncListeners({
        type: 'PENDING_COUNT',
        count: this.pendingCount
      });
    } catch (error) {
      console.error('[Sync] Failed to update pending count:', error);
    }
  }

  async syncPendingOrders() {
    if (this.isSyncing) {
      console.log('[Sync] Sync already in progress');
      return;
    }

    if (!networkStatus.getStatus()) {
      console.log('[Sync] Offline, cannot sync');
      return;
    }

    this.isSyncing = true;
    this.notifySyncListeners({ type: 'SYNC_START' });

    try {
      const pendingOrders = await dbManager.getPendingOrders();
      console.log(`[Sync] Found ${pendingOrders.length} pending orders`);

      if (pendingOrders.length === 0) {
        this.isSyncing = false;
        this.notifySyncListeners({ type: 'SYNC_COMPLETE', synced: 0, failed: 0 });
        return;
      }

      let synced = 0;
      let failed = 0;

      for (const order of pendingOrders) {
        try {
          console.log(`[Sync] Syncing order ${order.id}`);
          
          const orderData = {
            id: order.id,
            staff: order.staff,
            total: order.total,
            items: order.payload?.items || [],
            timestamp: order.timestamp
          };

          const result = await createOrder(orderData);
          
          if (result.ok) {
            await dbManager.markOrderSynced(order.id);
            synced++;
            console.log(`[Sync] Order ${order.id} synced successfully`);
          } else {
            failed++;
            console.error(`[Sync] Failed to sync order ${order.id}:`, result.error);
          }
        } catch (error) {
          failed++;
          console.error(`[Sync] Error syncing order ${order.id}:`, error);
        }
      }

      await this.updatePendingCount();
      
      this.notifySyncListeners({
        type: 'SYNC_COMPLETE',
        synced,
        failed
      });

      console.log(`[Sync] Sync complete: ${synced} synced, ${failed} failed`);
    } catch (error) {
      console.error('[Sync] Sync failed:', error);
      this.notifySyncListeners({ type: 'SYNC_ERROR', error });
    } finally {
      this.isSyncing = false;
    }
  }

  subscribe(callback) {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  notifySyncListeners(data) {
    this.syncListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[Sync] Listener error:', error);
      }
    });
  }

  async saveOfflineOrder(orderData) {
    try {
      const offlineOrder = {
        ...orderData,
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: orderData.timestamp || new Date().toISOString(),
        synced: false,
        payload: {
          items: orderData.items || []
        }
      };

      await dbManager.saveOrder(offlineOrder);
      await this.updatePendingCount();
      
      console.log('[Sync] Order saved offline:', offlineOrder.id);
      
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if ('sync' in registration) {
            await registration.sync.register('sync-orders');
            console.log('[Sync] Background sync registered');
          }
        } catch (error) {
          console.log('[Sync] Background sync not available, will sync manually');
        }
      }

      return offlineOrder;
    } catch (error) {
      console.error('[Sync] Failed to save offline order:', error);
      throw error;
    }
  }

  getPendingCount() {
    return this.pendingCount;
  }

  getSyncStatus() {
    return this.isSyncing;
  }
}

const syncManager = new SyncManager();

export default syncManager;
