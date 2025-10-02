const CACHE_VERSION = 'v1';
const STATIC_CACHE = `shawarma-boss-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `shawarma-boss-dynamic-${CACHE_VERSION}`;
const API_CACHE = `shawarma-boss-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.png'
];

const API_CACHEABLE = [
  '/api/menu',
  '/api/staff'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.error('[SW] Failed to cache static assets:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('shawarma-boss-') && 
                   name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE && 
                   name !== API_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    if (url.pathname.startsWith('/api/orders') && request.method === 'POST') {
      event.respondWith(handleOfflineOrder(request));
      return;
    }
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleDynamicAsset(request));
  }
});

async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Failed to fetch static asset:', error);
    return new Response('Offline - Asset not available', { status: 503 });
  }
}

async function handleDynamicAsset(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    if (request.destination === 'document') {
      const indexCached = await cache.match('/index.html');
      if (indexCached) {
        return indexCached;
      }
    }
    
    return new Response('Offline - Content not available', { status: 503 });
  }
}

async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(API_CACHE);
  
  const isCacheable = API_CACHEABLE.some(path => url.pathname.startsWith(path));
  
  try {
    const response = await fetch(request);
    
    if (response.ok && isCacheable) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, checking cache for:', url.pathname);
    
    if (isCacheable) {
      const cached = await cache.match(request);
      if (cached) {
        console.log('[SW] Returning cached API response');
        return cached;
      }
    }
    
    return new Response(JSON.stringify({ 
      error: 'Offline - Server not available',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleOfflineOrder(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('[SW] Offline order detected, will be queued by app');
    
    return new Response(JSON.stringify({
      ok: false,
      offline: true,
      message: 'Order saved locally. Will sync when online.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('[SW] Background sync triggered for orders');
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  console.log('[SW] Syncing pending orders...');
  
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_ORDERS'
      });
    });
  });
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_MENU') {
    event.waitUntil(
      caches.open(API_CACHE).then((cache) => {
        return cache.put('/api/menu', new Response(JSON.stringify(event.data.menu), {
          headers: { 'Content-Type': 'application/json' }
        }));
      })
    );
  }
});
