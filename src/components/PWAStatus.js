import React from 'react';
import { usePWA } from '../services/PWAContext';
import '../styles/PWAStatus.css';

const PWAStatus = () => {
  const { 
    isOnline, 
    isSyncing, 
    pendingOrdersCount, 
    installPrompt, 
    isInstalled,
    promptInstall,
    triggerSync
  } = usePWA();

  return (
    <div className="pwa-status d-flex align-items-center gap-2">
      {!isInstalled && installPrompt && (
        <button 
          className="btn btn-sm btn-success"
          onClick={promptInstall}
          title="Install Shawarma Boss POS"
        >
          <i className="fas fa-download me-1"></i>
          Install App
        </button>
      )}

      {isInstalled && (
        <span className="badge bg-info" title="Running as installed app">
          <i className="fas fa-mobile-alt"></i> Installed
        </span>
      )}

      {!isOnline && (
        <span className="badge bg-warning text-dark" title="You are offline">
          <i className="fas fa-wifi-slash me-1"></i>
          Offline
        </span>
      )}

      {isOnline && (
        <span className="badge bg-success" title="You are online">
          <i className="fas fa-wifi me-1"></i>
          Online
        </span>
      )}

      {isSyncing && (
        <span className="badge bg-primary" title="Syncing pending orders">
          <i className="fas fa-sync fa-spin me-1"></i>
          Syncing...
        </span>
      )}

      {pendingOrdersCount > 0 && (
        <button
          className="btn btn-sm btn-warning"
          onClick={triggerSync}
          disabled={!isOnline || isSyncing}
          title={`${pendingOrdersCount} orders pending sync`}
        >
          <i className="fas fa-cloud-upload-alt me-1"></i>
          {pendingOrdersCount} Pending
        </button>
      )}
    </div>
  );
};

export default PWAStatus;
