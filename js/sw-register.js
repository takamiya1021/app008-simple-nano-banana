/**
 * Service Worker登録スクリプト
 * PWA対応のためのService Worker登録処理
 */

// Service Worker登録（PWA対応）
if ('serviceWorker' in navigator) { // PWAインストール機能のために有効化
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker登録成功:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker登録失敗:', error);
            });
    });
}

// Service Worker状態をログに記録
console.log('Service Worker有効化 - PWAインストール機能のため');