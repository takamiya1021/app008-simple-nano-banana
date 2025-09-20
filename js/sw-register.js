/**
 * Service Worker登録スクリプト
 * PWA対応のためのService Worker登録処理
 */

// Service Worker登録（PWA対応）- 一時的に無効化してテスト
if ('serviceWorker' in navigator && false) { // falseで無効化
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

console.log('Service Worker完全無効化済み - オンライン専用アプリのため不要');

// 既存のService Workerを無効化
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
            console.log('既存のService Worker無効化:', registration.scope);
            registration.unregister();
        });
    });
}