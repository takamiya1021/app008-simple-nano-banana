# nano-banana - 技術仕様書

## システム概要

### アーキテクチャ
- **フロントエンド**: SPA（Single Page Application）
- **API連携**: 直接REST API呼び出し
- **データ管理**: ブラウザストレージ（LocalStorage）
- **認証**: APIキーベース認証

### 技術スタック
- HTML5 + CSS3 + Vanilla JavaScript
- Gemini 2.5 Flash Image API
- Progressive Web App (PWA)

## APIエンドポイント仕様

### Gemini 2.5 Flash Image API
```
エンドポイント: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent
メソッド: POST
認証: x-goog-api-key ヘッダー
```

### リクエスト形式
```json
{
  "contents": [{
    "parts": [
      { "text": "プロンプトテキスト" }
    ]
  }]
}
```

### レスポンス形式
```json
{
  "candidates": [{
    "content": {
      "parts": [
        {
          "text": "説明テキスト"
        },
        {
          "inlineData": {
            "mimeType": "image/png",
            "data": "base64画像データ"
          }
        }
      ]
    }
  }]
}
```

## ファイル構成

```
/
├── index.html          # メインHTMLファイル
├── css/
│   └── style.css      # スタイルシート
├── js/
│   └── app.js         # メインJavaScriptファイル
├── manifest.json      # PWA設定
├── doc/               # ドキュメント
│   ├── requirements.md
│   ├── technical-specs.md
│   └── implementation-plan.md
└── backup/            # 旧版バックアップ
```

## データモデル

### APIキー設定
```javascript
// LocalStorage形式
{
  "gemini_api_key": "暗号化されたAPIキー",
  "key_set": true
}
```

### アプリケーション設定
```javascript
// LocalStorage形式
{
  "app_settings": {
    "last_prompt": "最後のプロンプト",
    "generation_count": 0
  }
}
```

## コンポーネント設計

### 1. APIキー管理コンポーネント
**責任**: APIキーの入力、保存、検証
**メソッド**:
- `saveApiKey()`: APIキーの暗号化保存
- `loadApiKey()`: APIキーの復号化読み込み
- `validateApiKey()`: APIキー形式の検証

### 2. プロンプト入力コンポーネント
**責任**: テキストプロンプトの入力と検証
**メソッド**:
- `validatePrompt()`: プロンプト文字数チェック
- `getPrompt()`: プロンプト取得
- `clearPrompt()`: プロンプトクリア

### 3. 画像生成コンポーネント
**責任**: API呼び出しと画像生成
**メソッド**:
- `generateImage()`: 画像生成API呼び出し
- `handleApiResponse()`: レスポンス処理
- `displayImage()`: 画像表示

### 4. エラーハンドリングコンポーネント
**責任**: エラーの統一処理と表示
**メソッド**:
- `handleError()`: エラーの分類と処理
- `showErrorMessage()`: ユーザーフレンドリーなエラー表示

## セキュリティ仕様

### Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;
               connect-src 'self' generativelanguage.googleapis.com;">
```

### APIキーの保護
- LocalStorageでの暗号化保存
- メモリ上での適切なクリア
- コンソールログからの除外

### XSS対策
- ユーザー入力のサニタイズ
- innerHTML使用時のエスケープ処理
- DOMPurifyライブラリ（必要に応じて）

## パフォーマンス仕様

### ローディング時間
- 初回ロード: 3秒以内
- 画像生成: 30秒以内（API依存）
- UI応答性: 100ms以内

### メモリ使用量
- 最大メモリ使用量: 50MB以内
- 生成画像の効率的な管理
- 不要なオブジェクトの適切な解放

## エラーハンドリング仕様

### APIエラー分類
- **400 Bad Request**: プロンプト形式エラー
- **401 Unauthorized**: APIキー認証エラー
- **403 Forbidden**: API使用権限エラー
- **429 Too Many Requests**: レート制限エラー
- **500 Internal Server Error**: サーバーエラー
- **503 Service Unavailable**: サービス一時停止

### ユーザー向けエラーメッセージ
```javascript
const ERROR_MESSAGES = {
  400: "プロンプトの内容を確認してください",
  401: "APIキーが正しくありません",
  403: "API利用権限を確認してください",
  429: "しばらく時間をおいて再試行してください",
  500: "サーバーエラーが発生しました",
  503: "サービスが一時的に利用できません"
};
```

## ブラウザ対応

### 対応ブラウザ
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### モバイル対応
- iOS Safari 14+
- Android Chrome 90+
- レスポンシブデザイン対応

## 開発・デプロイメント

### 開発環境
- ローカル開発サーバー（Python http.server）
- ブラウザ開発者ツール
- Gitバージョン管理

### デプロイメント
- 静的ファイルホスティング
- Vercel/Netlify対応
- HTTPS必須

## 監視・ログ

### クライアントサイドログ
- エラーログの記録
- パフォーマンスメトリクス
- ユーザーアクションの追跡

### プライバシー配慮
- 個人情報の非収集
- APIキーの非送信
- 最小限のデータ収集

## テスト仕様

### 単体テスト対象
- APIキー暗号化/復号化
- プロンプト検証
- エラーハンドリング
- ユーティリティ関数

### 統合テスト対象
- API呼び出しフロー
- UI操作フロー
- エラー処理フロー

### ブラウザテスト
- 主要ブラウザでの動作確認
- レスポンシブデザイン確認
- パフォーマンステスト