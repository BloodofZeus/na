import React, { createContext, useContext, useState, useEffect } from 'react';
import networkStatus from './network';
import syncManager from './sync';
import dbManager from './db';

const PWAContext = createContext();

export const PWAProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    initPWA();
  }, []);

  const initPWA = async () => {
    try {
      await dbManager.init();
      console.log('[PWA] IndexedDB initialized');

      const unsubscribeNetwork = networkStatus.subscribe((online) => {
        setIsOnline(online);
      });

      const unsubscribeSync = syncManager.subscribe((data) => {
        if (data.type === 'SYNC_START') {
          setIsSyncing(true);
        } else if (data.type === 'SYNC_COMPLETE' || data.type === 'SYNC_ERROR') {
          setIsSyncing(false);
        } else if (data.type === 'PENDING_COUNT') {
          setPendingOrdersCount(data.count);
        }
      });

      registerServiceWorker();
      setupInstallPrompt();
      checkIfInstalled();

      return () => {
        unsubscribeNetwork();
        unsubscribeSync();
      };
    } catch (error) {
      console.error('[PWA] Initialization error:', error);
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        
        console.log('[PWA] Service Worker registered:', registration.scope);
        setSwRegistration(registration);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[PWA] New service worker found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New service worker installed, update available');
            }
          });
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] Service worker controller changed, reloading...');
          window.location.reload();
        });
      } catch (error) {
        console.warn('[PWA] Service Worker registration failed (this is normal in development):', error.message);
      }
    }
  };

  const setupInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      console.log('[PWA] Install prompt available');
      setInstallPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      setIsInstalled(true);
      setInstallPrompt(null);
    });
  };

  const checkIfInstalled = () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] Running as installed app');
      setIsInstalled(true);
    }
  };

  const promptInstall = async () => {
    if (!installPrompt) {
      console.log('[PWA] Install prompt not available');
      return false;
    }

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log('[PWA] Install prompt outcome:', outcome);
      
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Install prompt error:', error);
      return false;
    }
  };

  const triggerSync = async () => {
    await syncManager.syncPendingOrders();
  };

  const value = {
    isOnline,
    isSyncing,
    pendingOrdersCount,
    installPrompt,
    isInstalled,
    swRegistration,
    promptInstall,
    triggerSync,
    dbManager,
    syncManager,
    networkStatus
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};

export default PWAContext;
