/**
 * nano-banana Service Worker
 * PWA対応のためのキャッシュ戦略とオフライン対応
 */

const CACHE_NAME = 'nano-banana-v1.1.0';
const STATIC_CACHE_NAME = 'nano-banana-static-v1.1.0';
const API_CACHE_NAME = 'nano-banana-api-v1.1.0';

// キャッシュするファイル一覧
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/manifest.json'
];

// API関連のURL（キャッシュしない）
const API_URLS = [
    'generativelanguage.googleapis.com'
];

/**
 * Service Workerインストール時
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Install event');

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Cache installation failed:', error);
            })
    );
});

/**
 * Service Workerアクティベート時
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // 古いキャッシュを削除
                        if (cacheName !== STATIC_CACHE_NAME &&
                            cacheName !== API_CACHE_NAME &&
                            cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Activated successfully');
                return self.clients.claim();
            })
    );
});

/**
 * フェッチイベント処理
 */
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // APIリクエストの場合はキャッシュしない（常にネットワーク）
    if (isApiRequest(url)) {
        event.respondWith(
            fetch(request)
                .catch((error) => {
                    console.error('[SW] API fetch failed:', error);
                    throw error;
                })
        );
        return;
    }

    // 静的アセットの場合はキャッシュファースト戦略
    if (isStaticAsset(url)) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[SW] Serving from cache:', request.url);
                        return cachedResponse;
                    }

                    return fetch(request)
                        .then((response) => {
                            // 正常なレスポンスの場合のみキャッシュ
                            if (response.ok) {
                                const responseToCache = response.clone();
                                caches.open(STATIC_CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseToCache);
                                    });
                            }
                            return response;
                        })
                        .catch((error) => {
                            console.error('[SW] Fetch failed:', error);

                            // オフライン時のフォールバック
                            if (request.destination === 'document') {
                                return caches.match('/index.html');
                            }

                            throw error;
                        });
                })
        );
        return;
    }

    // その他のリクエストはネットワーク優先
    event.respondWith(
        fetch(request)
            .catch((error) => {
                console.error('[SW] Network request failed:', error);
                return caches.match(request);
            })
    );
});

/**
 * APIリクエストかどうかを判定
 */
function isApiRequest(url) {
    return API_URLS.some(apiUrl => url.hostname.includes(apiUrl));
}

/**
 * 静的アセットかどうかを判定
 */
function isStaticAsset(url) {
    // 同一オリジンの場合
    if (url.origin === self.location.origin) {
        const pathname = url.pathname;
        return pathname === '/' ||
               pathname.endsWith('.html') ||
               pathname.endsWith('.css') ||
               pathname.endsWith('.js') ||
               pathname.endsWith('.json') ||
               pathname.endsWith('.svg') ||
               pathname.endsWith('.png') ||
               pathname.endsWith('.jpg') ||
               pathname.endsWith('.jpeg') ||
               pathname.endsWith('.gif') ||
               pathname.endsWith('.webp');
    }
    return false;
}

/**
 * プッシュ通知（将来の拡張用）
 */
self.addEventListener('push', (event) => {
    console.log('[SW] Push event received');

    if (event.data) {
        const data = event.data.json();
        const title = data.title || 'nano-banana';
        const options = {
            body: data.body || '新しい機能が追加されました',
            icon: data.icon || '/manifest.json',
            badge: '/manifest.json',
            tag: 'nano-banana-notification',
            renotify: true
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

/**
 * 通知クリック処理（将来の拡張用）
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');

    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clients) => {
                // 既に開いているウィンドウがあればフォーカス
                for (const client of clients) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }

                // ない場合は新しいウィンドウを開く
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

/**
 * メッセージ処理
 */
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;

            case 'GET_VERSION':
                event.ports[0].postMessage({
                    type: 'VERSION',
                    version: CACHE_NAME
                });
                break;

            case 'CLEAR_CACHE':
                caches.keys().then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => caches.delete(cacheName))
                    );
                }).then(() => {
                    event.ports[0].postMessage({
                        type: 'CACHE_CLEARED',
                        success: true
                    });
                });
                break;

            default:
                console.log('[SW] Unknown message type:', event.data.type);
        }
    }
});

console.log('[SW] Service Worker loaded successfully');