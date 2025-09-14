// アファメーション関連の型定義
export type ThemeCategory = '自信' | '愛' | '成功' | '健康'
export type SceneCategory = '朝' | '夜' | '仕事'
export type AgeGroup = '20代' | '30代' | '40代' | '50代' | '60代以上'
export type Language = 'ja' | 'en'

export interface Affirmation {
  id: string
  text: string
  textEn?: string // 英語原文
  author?: string
  source?: string
  categories: {
    theme: ThemeCategory
    scene: SceneCategory
    ageGroup: AgeGroup
  }
  language: Language
  createdAt: string
  isUserAdded: boolean // ユーザー追加アファメーション
}

// ユーザー設定関連の型定義
export type DesignTheme = 'healing' | 'empowerment' | 'minimal'
export type ColorTheme = 'warm-healing' | 'cool-blue' | 'nature-green' | 'sunset-orange' | 'custom'

export interface UserSettings {
  age: AgeGroup
  designTheme: DesignTheme
  colorTheme: ColorTheme
  isDarkMode: boolean
  language: Language
  notifications: {
    enabled: boolean
    morningTime?: string
    eveningTime?: string
  }
}

// ユーザーアクティビティ関連の型定義
export interface UserActivity {
  favorites: string[] // お気に入りアファメーションID
  likes: string[] // いいねしたアファメーションID
  userAffirmations: Affirmation[] // ユーザー追加アファメーション
  dailySpecialMessage?: {
    date: string
    affirmationId: string
  }
  lastVisit: string
}

// フィルター関連の型定義
export interface AffirmationFilters {
  theme?: ThemeCategory
  scene?: SceneCategory
  ageGroup?: AgeGroup
  language?: Language
  onlyFavorites?: boolean
  searchQuery?: string
}

// UI関連の型定義
export type SortOption = 'latest' | 'oldest' | 'popular' | 'alphabetical'
export type ViewMode = 'list' | 'grid' | 'card'

// コンテキスト関連の型定義
export interface UserContextValue {
  settings: UserSettings
  activity: UserActivity
  updateSettings: (settings: Partial<UserSettings>) => void
  addFavorite: (affirmationId: string) => void
  removeFavorite: (affirmationId: string) => void
  toggleLike: (affirmationId: string) => void
  addUserAffirmation: (affirmation: Omit<Affirmation, 'id' | 'createdAt' | 'isUserAdded'>) => void
}

export interface AffirmationContextValue {
  affirmations: Affirmation[]
  filteredAffirmations: Affirmation[]
  currentAffirmation: Affirmation | null
  filters: AffirmationFilters
  getRandomAffirmation: () => Affirmation | null
  getDailySpecialMessage: () => Affirmation | null
  setFilters: (filters: Partial<AffirmationFilters>) => void
  searchAffirmations: (query: string) => void
  refreshCurrentAffirmation: () => void
}

// ローカルストレージ関連の型定義
export interface StorageData {
  userSettings: UserSettings
  userActivity: UserActivity
}

// テーマ関連の型定義
export interface ColorThemeConfig {
  id: ColorTheme
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    textPrimary: string
    textSecondary: string
  }
}

export interface DesignThemeConfig {
  id: DesignTheme
  name: string
  typography: {
    fontFamily: string
    sizes: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// API・データ関連の型定義
export interface AffirmationData {
  affirmations: Affirmation[]
}

// エラー関連の型定義
export interface AppError {
  code: string
  message: string
  details?: any
}

// ユーティリティ型
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>