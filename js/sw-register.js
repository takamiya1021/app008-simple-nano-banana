/**
 * Service Worker登録スクリプト
 * PWA対応のためのService Worker登録処理
 */

// Service Worker登録（PWA対応）
if ('serviceWorker' in navigator && false) { // falseで無効化 - PWAインストールはmanifest.jsonのみで可能
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
console.log('Service Worker無効化 - 画像生成API干渉回避のため');