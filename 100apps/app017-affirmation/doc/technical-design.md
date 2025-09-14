# アファメーションアプリ 技術設計書

## 🏗️ 技術アーキテクチャ

### 技術スタック

#### フロントエンド
- **Next.js 15**: App Router、SSG対応
- **TypeScript**: 型安全性確保
- **Tailwind CSS**: レスポンシブデザイン
- **Framer Motion**: スムーズなアニメーション

#### PWA対応
- **next-pwa**: サービスワーカー自動生成
- **Web App Manifest**: インストール可能なアプリ化

#### データ管理
- **localStorage**: ユーザー設定・お気に入り保存
- **IndexedDB**: アファメーション大容量データ保存
- **React Context**: アプリ全体の状態管理

#### 開発・品質管理
- **ESLint**: コード品質維持
- **Prettier**: コードフォーマット統一
- **Vercel**: デプロイ・ホスティング

## 📊 データモデル設計

### アファメーション（Affirmation）
```typescript
interface Affirmation {
  id: string;
  text: string;
  textEn?: string; // 英語原文
  author?: string;
  source?: string;
  categories: {
    theme: ThemeCategory;
    scene: SceneCategory;
    ageGroup: AgeGroup;
  };
  language: 'ja' | 'en';
  createdAt: string;
  isUserAdded: boolean; // ユーザー追加アファメーション
}

type ThemeCategory = '自信' | '愛' | '成功' | '健康';
type SceneCategory = '朝' | '夜' | '仕事';
type AgeGroup = '20代' | '30代' | '40代' | '50代' | '60代以上';
```

### ユーザー設定（UserSettings）
```typescript
interface UserSettings {
  age: AgeGroup;
  designTheme: 'healing' | 'empowerment' | 'minimal';
  colorTheme: string; // カラーテーマID
  isDarkMode: boolean;
  language: 'ja' | 'en';
  notifications: {
    enabled: boolean;
    morningTime?: string;
    eveningTime?: string;
  };
}
```

### ユーザーアクティビティ（UserActivity）
```typescript
interface UserActivity {
  favorites: string[]; // お気に入りアファメーションID
  likes: string[]; // いいねしたアファメーションID
  userAffirmations: Affirmation[]; // ユーザー追加アファメーション
  dailySpecialMessage?: {
    date: string;
    affirmationId: string;
  };
  lastVisit: string;
}
```

## 🗂️ ファイル構成設計

```
app017-affirmation/
├── public/
│   ├── icons/ # PWAアイコン
│   ├── manifest.json
│   └── sw.js # サービスワーカー
├── src/
│   ├── app/
│   │   ├── layout.tsx # ルートレイアウト
│   │   ├── page.tsx # ホーム（アファメーション表示）
│   │   ├── favorites/page.tsx # お気に入り一覧
│   │   ├── categories/page.tsx # カテゴリー選択
│   │   ├── settings/page.tsx # 設定画面
│   │   ├── add-affirmation/page.tsx # アファメーション追加
│   │   └── daily-special/page.tsx # 今日の特別なメッセージ
│   ├── components/
│   │   ├── ui/ # 基本UIコンポーネント
│   │   ├── affirmation/ # アファメーション関連
│   │   ├── layout/ # レイアウト関連
│   │   └── settings/ # 設定関連
│   ├── data/
│   │   ├── affirmations.json # 初期アファメーションデータ
│   │   └── themes.ts # デザインテーマ定義
│   ├── lib/
│   │   ├── storage.ts # ローカルストレージ操作
│   │   ├── affirmationService.ts # アファメーション管理
│   │   ├── userService.ts # ユーザーデータ管理
│   │   └── utils.ts # ユーティリティ関数
│   ├── hooks/
│   │   ├── useAffirmations.ts # アファメーション操作
│   │   ├── useUserSettings.ts # ユーザー設定
│   │   └── useLocalStorage.ts # ローカルストレージ
│   ├── context/
│   │   ├── UserContext.tsx # ユーザー状態管理
│   │   └── ThemeContext.tsx # テーマ管理
│   └── types/
│       └── index.ts # TypeScript型定義
├── doc/
├── screenshots/
└── package.json
```

## 🎨 UI/UXアーキテクチャ

### レスポンシブ設計
```typescript
// Tailwind CSS ブレイクポイント
const breakpoints = {
  sm: '640px',  // 小型スマホ
  md: '768px',  // 大型スマホ・小型タブレット
  lg: '1024px', // タブレット
  xl: '1280px'  // デスクトップ
} as const;

// モバイルファーストデザイン
// 基本: スマホ縦向け (375px～414px)
// 対応: タブレット横向け (1024px～)
```

### カラーテーマシステム
```typescript
interface ColorTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
}

const colorThemes: ColorTheme[] = [
  {
    id: 'warm-healing',
    name: '温かみのある癒し',
    colors: {
      primary: '#F4A261', // 温かいオレンジ
      secondary: '#E9C46A', // 優しい黄色
      background: '#F8F9FA', // 純白に近いクリーム
      surface: '#FFFFFF',
      text: '#2A2A2A',
      textSecondary: '#6B6B6B',
      accent: '#E76F51', // アクセントオレンジ
    }
  },
  // その他のテーマ...
];
```

### デザインテーマシステム
```typescript
interface DesignTheme {
  id: 'healing' | 'empowerment' | 'minimal';
  name: string;
  typography: {
    fontFamily: string;
    weights: number[];
    sizes: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}
```

## 🔄 状態管理設計

### Context構造
```typescript
// UserContext
interface UserContextValue {
  settings: UserSettings;
  activity: UserActivity;
  updateSettings: (settings: Partial<UserSettings>) => void;
  addFavorite: (affirmationId: string) => void;
  removeFavorite: (affirmationId: string) => void;
  toggleLike: (affirmationId: string) => void;
  addUserAffirmation: (affirmation: Omit<Affirmation, 'id'>) => void;
}

// AffirmationContext
interface AffirmationContextValue {
  affirmations: Affirmation[];
  filteredAffirmations: Affirmation[];
  currentAffirmation: Affirmation | null;
  filters: {
    theme?: ThemeCategory;
    scene?: SceneCategory;
    ageGroup?: AgeGroup;
  };
  getRandomAffirmation: () => Affirmation;
  getDailySpecialMessage: () => Affirmation;
  setFilters: (filters: Partial<typeof filters>) => void;
  searchAffirmations: (query: string) => void;
}
```

## 💾 ローカルストレージ設計

### データ永続化戦略
```typescript
// localStorage キー設計
const STORAGE_KEYS = {
  USER_SETTINGS: 'affirmation-app-settings',
  USER_ACTIVITY: 'affirmation-app-activity',
  AFFIRMATIONS_CACHE: 'affirmation-app-affirmations',
  THEME_PREFERENCE: 'affirmation-app-theme',
  LAST_SYNC: 'affirmation-app-last-sync',
} as const;

// IndexedDB スキーマ
interface DBSchema {
  affirmations: {
    key: string; // affirmationId
    value: Affirmation;
    indexes: {
      'theme': ThemeCategory;
      'scene': SceneCategory;
      'ageGroup': AgeGroup;
      'language': 'ja' | 'en';
    };
  };
  userAffirmations: {
    key: string;
    value: Affirmation;
  };
}
```

### オフライン戦略
- **初回ロード**: 全アファメーションをIndexedDBにキャッシュ
- **データアクセス**: IndexedDB → メモリキャッシュ → 表示
- **ユーザーデータ**: localStorageでリアルタイム保存
- **Service Worker**: 静的リソースキャッシュ

## 🚀 PWA設定

### マニフェスト設計
```json
{
  "name": "Daily Affirmation - 心の支え",
  "short_name": "Affirmation",
  "description": "日々の励ましと心の支えを提供するアファメーションアプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8F9FA",
  "theme_color": "#F4A261",
  "orientation": "portrait-primary",
  "categories": ["lifestyle", "health"],
  "lang": "ja",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### サービスワーカー戦略
- **キャッシュファースト**: 静的リソース（CSS, JS, 画像）
- **ネットワークファースト**: 動的コンテンツ（設定変更等）
- **オフライン対応**: 全機能をオフラインで利用可能

## ⚡ パフォーマンス最適化

### レンダリング最適化
- **React.memo**: アファメーション表示コンポーネント
- **useMemo**: フィルタリング処理
- **useCallback**: イベントハンドラー
- **Suspense**: 遅延読み込み対応

### バンドル最適化
- **Code Splitting**: ページ単位でのJSバンドル分割
- **Tree Shaking**: 未使用コード除去
- **Image Optimization**: Next.js Image コンポーネント使用

### データ最適化
- **仮想化**: 大量リスト表示時の仮想スクロール
- **インデックス**: IndexedDBクエリ最適化
- **圧縮**: gzip圧縮による転送量削減

## 🔒 セキュリティ・プライバシー

### データプライバシー
- **ローカル保存のみ**: 個人データの外部送信なし
- **暗号化**: 機密データのローカル暗号化
- **GDPR準拠**: プライバシーポリシー整備

### セキュリティ措置
- **Content Security Policy**: XSS攻撃対策
- **HTTPS必須**: 本番環境でのHTTPS強制
- **入力検証**: ユーザー入力データの適切な検証

## 📱 プラットフォーム対応

### iOS対応
- **iOS Safari**: フル機能対応
- **iOS PWA**: ホーム画面追加時の最適化
- **Safe Area**: iPhone X以降のセーフエリア対応

### Android対応
- **Chrome for Android**: PWA基本機能
- **Samsung Internet**: 代替ブラウザ対応
- **WebAPK**: Androidでのアプリライクな体験

### ブラウザサポート
- **モダンブラウザ**: Chrome 90+, Firefox 90+, Safari 14+
- **Progressive Enhancement**: 古いブラウザでも基本機能利用可能