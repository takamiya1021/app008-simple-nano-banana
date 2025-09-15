# AI画像生成ツール 技術設計書

## 1. システム概要

### 1.1 アプリケーション概要
- **名称**: AI Image Generator (nano-banana)
- **目的**: Gemini 2.5 Flash Image APIを使用したシンプルで使いやすいAI画像生成ツール
- **対象ユーザー**: AIを使った画像生成を手軽に体験したいユーザー
- **主要価値**: テキスト+参考画像による高品質な画像生成

### 1.2 システム要件
- **非機能要件**:
  - セキュリティ: OWASP準拠（85%）、APIキー暗号化保存
  - パフォーマンス: 画像生成5-10秒、UI応答0.3秒以内
  - 可用性: 24/7稼働（Vercel）、ダウンタイム月1%未満
  - 拡張性: 月10万リクエスト対応可能
  - ユーザビリティ: レスポンシブ対応、直感的UI

## 2. システムアーキテクチャ

### 2.1 全体構成
```
[Browser] ⟷ [Frontend (SPA)] ⟷ [Gemini API]
    ↓
[LocalStorage (暗号化)]
```

### 2.2 技術スタック

#### フロントエンド
- **HTML5**: セマンティックマークアップ、メタタグ対応
- **CSS3**:
  - フレックスボックス、グリッドレイアウト
  - CSS変数、アニメーション、トランジション
  - レスポンシブデザイン（モバイルファースト）
- **JavaScript (ES6+)**:
  - クラスベース設計
  - Async/Await非同期処理
  - モジュール化（単一クラス構成）

#### API連携
- **Gemini 2.5 Flash Image Preview API**
- **認証**: APIキーベース（x-goog-api-key）
- **通信**: Fetch API、JSON形式
- **エラーハンドリング**: 堅牢なエラー処理とフォールバック

#### セキュリティ
- **暗号化**: CryptoJS AES暗号化
- **CSP**: Content Security Policy設定
- **SRI**: Subresource Integrity（外部ライブラリ検証）
- **HTTP Security Headers**: Vercel設定

#### デプロイメント
- **プラットフォーム**: Vercel
- **CDN**: 自動グローバル配信
- **SSL/TLS**: 自動HTTPS化
- **キャッシュ**: 静的アセット1年キャッシュ

### 2.3 データフロー

#### 画像生成フロー
```
1. ユーザー入力（プロンプト + 参考画像）
2. バリデーション（文字数、ファイルサイズ）
3. APIリクエスト構築（マルチパート）
4. Gemini API呼び出し
5. レスポンス処理（画像 or エラー）
6. 結果表示（成功 or フォールバック）
```

#### データ永続化フロー
```
1. ユーザーデータ（APIキー、履歴）
2. AES暗号化
3. LocalStorage保存
4. 次回起動時復号化読み込み
```

## 3. 詳細設計

### 3.1 フロントエンドアーキテクチャ

#### コンポーネント構成
```
AIImageGenerator (メインクラス)
├── 初期化 (constructor)
├── DOM管理 (initializeElements)
├── イベント管理 (bindEvents)
├── 設定管理 (save/load/clearSettings)
├── 画像管理 (upload/preview/remove)
├── API通信 (generateImage)
├── セキュリティ (encrypt/decryptData)
└── UI管理 (notification/updateUI)
```

#### 状態管理
```javascript
{
  apiKey: string,           // 暗号化保存
  selectedModel: string,    // 固定値
  promptHistory: array,     // 最大20件、暗号化保存
  selectedImages: array,    // 最大3枚、一時保存
  currentGeneratedImage: string // 結果画像URL
}
```

### 3.2 API設計

#### Gemini API仕様
```javascript
// エンドポイント
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent

// リクエスト構造
{
  contents: [{
    parts: [
      { text: "Generate an image: [プロンプト][サイズ指定]" },
      { inlineData: { mimeType: "image/jpeg", data: "[base64]" } } // 参考画像
    ]
  }]
}

// レスポンス構造
{
  candidates: [{
    content: {
      parts: [
        { inlineData: { mimeType: "image/png", data: "[base64]" } }
      ]
    }
  }]
}
```

#### エラーハンドリング戦略（拡張版）
- **APIエラー**: HTTP 4xx/5xx → 詳細エラー分析 → ユーザー向け翻訳 → フォールバック画像生成
- **ネットワークエラー**: タイムアウト → 自動リトライ → 手動リトライ機能
- **バリデーションエラー**: クライアント側 → 即座にユーザー通知 → 改善提案表示
- **コンテンツフィルター**: 不適切プロンプト検出 → 安全なプロンプト例提示
- **ログ出力**: 機密情報除外、デバッグ情報のみ

### 3.3 セキュリティ設計

#### 暗号化仕様
```javascript
// 暗号化キー
encryptionKey: 'nano-banana-secure-key-2024'

// 暗号化方式
AES暗号化: CryptoJS.AES.encrypt(data, key)
復号化: CryptoJS.AES.decrypt(encrypted, key)

// 保存対象
- APIキー設定
- プロンプト履歴
```

#### セキュリティヘッダー
```javascript
// CSP (Content Security Policy)
default-src 'self';
script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com;
style-src 'self' 'unsafe-inline' fonts.googleapis.com;
connect-src 'self' generativelanguage.googleapis.com;

// HTTP Security Headers (Vercel)
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

#### データ保護
- **APIキー**: ローカル暗号化保存、サーバー送信なし
- **画像データ**: 一時メモリ保存、永続化なし
- **ログ**: 機密情報自動除外、開発用のみ

### 3.4 UI/UX設計

#### レスポンシブ設計
```css
/* ブレークポイント */
Mobile: 320px-768px
Tablet: 768px-1024px
Desktop: 1024px+

/* レイアウト */
Grid System: CSS Grid + Flexbox
Container: max-width 1200px
Spacing: 1.5rem基準
```

#### インタラクション設計
```javascript
// アニメーション
hover: transform translateY(-2px), 0.2s ease
focus: box-shadow, border-color change
loading: spinner rotation
notification: slide-in from right

// フィードバック
success: 緑色通知、3秒表示
error: 赤色通知、3秒表示
progress: スピナー、進行状況表示
```

## 4. データモデル

### 4.1 設定データ
```javascript
Settings {
  apiKey: string,        // AES暗号化
  selectedModel: string  // 固定値 "gemini-2.5-flash-image"
}
```

### 4.2 履歴データ
```javascript
PromptHistory {
  history: string[],     // 最大20件
  encrypted: boolean     // AES暗号化フラグ
}
```

### 4.3 画像データ
```javascript
ImageData {
  file: File,           // 元ファイル
  dataUrl: string,      // Base64 DataURL
  name: string,         // ファイル名
  size: number,         // ファイルサイズ（10MB制限）
  mimeType: string      // MIMEタイプ
}
```

## 5. パフォーマンス設計

### 5.1 最適化戦略
- **画像処理**: クライアント側リサイズ、Base64変換
- **キャッシュ**: 静的ファイル1年キャッシュ
- **遅延読み込み**: 必要時のみAPI呼び出し
- **メモリ管理**: 不要なデータ自動クリア

### 5.2 制限値設定
```javascript
// ファイル制限
max_file_size: 10MB
max_images: 3枚
max_prompt_length: 500文字
max_history: 20件

// API制限
request_timeout: 30秒
retry_count: 1回
rate_limit: ユーザー任意
```

## 6. エラー処理・フォールバック

### 6.1 拡張エラーハンドリング戦略
```javascript
// 新しいエラーハンドリングフロー
1. エラー検出・分類
2. 詳細エラー分析
3. ユーザー向けメッセージ生成
4. 改善提案・代替案提示
5. リトライ機能提供
6. フォールバック実行（必要時）
```

### 6.2 詳細エラーメッセージ機能
```javascript
ErrorAnalyzer {
  analyzeApiError(response) {
    // HTTPステータス、レスポンス内容の詳細解析
    // Gemini固有エラーコードの翻訳
    // ユーザー理解しやすい表現に変換
  }

  generateUserFriendlyMessage(errorType, details) {
    // 技術的エラー → 一般ユーザー向けメッセージ
    // 具体的な解決策提示
  }
}
```

### 6.3 プロンプト改善提案機能
```javascript
PromptAnalyzer {
  detectUnsafeContent(prompt) {
    // 不適切コンテンツ検出
    // 著作権侵害可能性チェック
    // 安全性フィルター適用
  }

  suggestImprovements(issues) {
    // 具体的改善案生成
    // 代替表現提案
    // 安全なプロンプト例提示
  }
}
```

### 6.4 安全なプロンプト例データベース
```javascript
SafePromptExamples {
  categories: {
    landscape: ["美しい自然風景", "夕焼けの海岸"],
    abstract: ["カラフルな抽象アート", "幾何学模様"],
    objects: ["シンプルな静物画", "モダンな家具"]
  },

  getRandomExample(category) {
    // カテゴリ別ランダム例提示
  }
}
```

### 6.5 リトライ機能
```javascript
RetryManager {
  attemptCount: 0,
  maxRetries: 3,

  async retry(operation, withImprovements = false) {
    // 自動リトライ機能
    // プロンプト改善後のリトライ
    // 段階的エラー対応
  }
}
```

### 6.6 従来のフォールバック戦略
```javascript
// API失敗時の最終手段
1. 詳細エラー分析・改善提案実行
2. リトライ機能提供
3. フォールバック画像生成（Canvas）
4. デモモード表示
5. ユーザー体験継続

// フォールバック画像仕様
サイズ: 512x512px
形式: PNG
内容: グラデーション背景 + プロンプトテキスト
```

### 6.7 エラー分類（拡張版）
- **ユーザーエラー**: バリデーション失敗 → 即座に通知 + 改善提案
- **コンテンツエラー**: 不適切プロンプト → 具体的理由説明 + 安全な例提示
- **APIエラー**: サーバー側問題 → 詳細分析 + リトライ + フォールバック
- **ネットワークエラー**: 接続問題 → 自動リトライ + 手動リトライ + フォールバック
- **システムエラー**: 予期しないエラー → ログ記録 + 汎用エラー表示 + リトライ

## 7. 運用・監視

### 7.1 ログ設計
```javascript
// 出力対象
API Response Status: HTTP ステータス
Generation Success/Failure: 成功/失敗
Error Messages: エラー内容（機密情報除外）

// 除外対象
API Key: セキュリティ
Request Body Details: プライバシー
User Prompt Content: プライバシー
```

### 7.2 メトリクス
- **成功率**: 画像生成成功/失敗の比率
- **レスポンス時間**: API応答時間
- **エラー率**: API/システムエラー発生率
- **ユーザー行動**: 生成回数、履歴使用率

## 8. セキュリティ詳細

### 8.1 脅威分析
- **XSS攻撃**: CSP、入力サニタイゼーション
- **データ漏洩**: 暗号化、ローカル保存
- **API乱用**: レート制限、バリデーション
- **中間者攻撃**: HTTPS強制、SRI

### 8.2 プライバシー保護
- **データ最小化**: 必要最小限のデータ収集
- **ローカル処理**: サーバー側データ送信なし
- **透明性**: セキュリティ情報の明示
- **ユーザー制御**: 設定リセット、データ削除機能

## 9. 拡張性・保守性

### 9.1 モジュール設計
```javascript
// 単一責任原則
Settings Module: 設定管理専用
Image Module: 画像処理専用
API Module: API通信専用
UI Module: インターフェース専用
Security Module: セキュリティ専用
```

### 9.2 設定外部化
```javascript
// 設定可能項目
API_ENDPOINT: 環境変数
ENCRYPTION_KEY: 設定ファイル
MAX_FILE_SIZE: 設定ファイル
UI_THEME: ユーザー設定
```

### 9.3 テスト戦略
- **Unit Test**: 個別メソッドテスト
- **Integration Test**: API連携テスト
- **E2E Test**: ユーザーシナリオテスト
- **Security Test**: セキュリティ脆弱性テスト

## 10. デプロイ・インフラ

### 10.1 Vercelデプロイ設定
```json
{
  "headers": [セキュリティヘッダー],
  "cleanUrls": true,
  "trailingSlash": false,
  "functions": {},
  "rewrites": []
}
```

### 10.2 CI/CD
- **ビルド**: 静的ファイル最適化
- **テスト**: 自動テスト実行
- **デプロイ**: Vercel自動デプロイ
- **監視**: エラーレポート、パフォーマンス監視

---

**📝 作成日**: 2024年9月15日
**🔄 更新**: プロジェクト完成後の技術仕様書（後付け作成）
**👨‍💻 作成者**: Claude Code CLI