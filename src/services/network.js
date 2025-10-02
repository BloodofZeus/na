class NetworkStatus {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    
    this.init();
  }

  init() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  handleOnline() {
    console.log('[Network] Connection restored');
    this.isOnline = true;
    this.notifyListeners(true);
  }

  handleOffline() {
    console.log('[Network] Connection lost');
    this.isOnline = false;
    this.notifyListeners(false);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(online) {
    this.listeners.forEach(callback => {
      try {
        callback(online);
      } catch (error) {
        console.error('[Network] Listener error:', error);
      }
    });
  }

  getStatus() {
    return this.isOnline;
  }
}

const networkStatus = new NetworkStatus();

export default networkStatus;
