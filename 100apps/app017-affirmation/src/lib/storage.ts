import { UserSettings, UserActivity, AgeGroup, DesignTheme, ColorTheme } from '@/types'

// ストレージキーの定数
export const STORAGE_KEYS = {
  USER_SETTINGS: 'affirmation-app-settings',
  USER_ACTIVITY: 'affirmation-app-activity',
  AFFIRMATIONS_CACHE: 'affirmation-app-affirmations',
  THEME_PREFERENCE: 'affirmation-app-theme',
  LAST_SYNC: 'affirmation-app-last-sync',
} as const

// デフォルト設定
export const DEFAULT_USER_SETTINGS: UserSettings = {
  age: '30代',
  designTheme: 'healing',
  colorTheme: 'warm-healing',
  isDarkMode: false,
  language: 'ja',
  notifications: {
    enabled: false,
    morningTime: '08:00',
    eveningTime: '21:00',
  },
}

export const DEFAULT_USER_ACTIVITY: UserActivity = {
  favorites: [],
  likes: [],
  userAffirmations: [],
  lastVisit: new Date().toISOString(),
}

// ローカルストレージ操作のユーティリティクラス
export class StorageService {
  /**
   * 安全にデータを取得
   */
  static get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
      return defaultValue
    }

    try {
      const stored = localStorage.getItem(key)
      if (stored === null) {
        return defaultValue
      }

      return JSON.parse(stored) as T
    } catch (error) {
      console.warn(`Failed to parse stored data for key "${key}":`, error)
      return defaultValue
    }
  }

  /**
   * 安全にデータを保存
   */
  static set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Failed to store data for key "${key}":`, error)
      return false
    }
  }

  /**
   * データを削除
   */
  static remove(key: string): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Failed to remove data for key "${key}":`, error)
      return false
    }
  }

  /**
   * すべてのアプリデータをクリア
   */
  static clearAppData(): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Failed to clear app data:', error)
      return false
    }
  }

  /**
   * ストレージ容量をチェック
   */
  static checkStorageQuota(): { used: number; quota: number; percentage: number } {
    if (typeof window === 'undefined' || !navigator.storage?.estimate) {
      return { used: 0, quota: 0, percentage: 0 }
    }

    try {
      navigator.storage.estimate().then(estimate => {
        const used = estimate.usage || 0
        const quota = estimate.quota || 0
        const percentage = quota > 0 ? (used / quota) * 100 : 0

        return { used, quota, percentage }
      })
    } catch (error) {
      console.error('Failed to check storage quota:', error)
    }

    return { used: 0, quota: 0, percentage: 0 }
  }
}

// ユーザー設定専用の操作
export class UserSettingsStorage {
  /**
   * ユーザー設定を取得
   */
  static get(): UserSettings {
    return StorageService.get(STORAGE_KEYS.USER_SETTINGS, DEFAULT_USER_SETTINGS)
  }

  /**
   * ユーザー設定を保存
   */
  static set(settings: UserSettings): boolean {
    return StorageService.set(STORAGE_KEYS.USER_SETTINGS, settings)
  }

  /**
   * 設定を部分的に更新
   */
  static update(partialSettings: Partial<UserSettings>): boolean {
    const currentSettings = this.get()
    const updatedSettings: UserSettings = {
      ...currentSettings,
      ...partialSettings,
    }
    return this.set(updatedSettings)
  }

  /**
   * 年齢設定を更新
   */
  static updateAge(age: AgeGroup): boolean {
    return this.update({ age })
  }

  /**
   * テーマ設定を更新
   */
  static updateTheme(designTheme: DesignTheme, colorTheme?: ColorTheme): boolean {
    const update: Partial<UserSettings> = { designTheme }
    if (colorTheme) {
      update.colorTheme = colorTheme
    }
    return this.update(update)
  }

  /**
   * ダークモード切り替え
   */
  static toggleDarkMode(): boolean {
    const currentSettings = this.get()
    return this.update({ isDarkMode: !currentSettings.isDarkMode })
  }

  /**
   * 初回起動判定（年齢が設定されていない場合）
   */
  static isFirstTime(): boolean {
    const settings = this.get()
    // デフォルト値と同じかどうかで判定
    return settings.age === DEFAULT_USER_SETTINGS.age &&
           Object.keys(settings).length === Object.keys(DEFAULT_USER_SETTINGS).length
  }
}

// ユーザーアクティビティ専用の操作
export class UserActivityStorage {
  /**
   * ユーザーアクティビティを取得
   */
  static get(): UserActivity {
    return StorageService.get(STORAGE_KEYS.USER_ACTIVITY, DEFAULT_USER_ACTIVITY)
  }

  /**
   * ユーザーアクティビティを保存
   */
  static set(activity: UserActivity): boolean {
    return StorageService.set(STORAGE_KEYS.USER_ACTIVITY, activity)
  }

  /**
   * アクティビティを部分的に更新
   */
  static update(partialActivity: Partial<UserActivity>): boolean {
    const currentActivity = this.get()
    const updatedActivity: UserActivity = {
      ...currentActivity,
      ...partialActivity,
      lastVisit: new Date().toISOString(), // 常に最新の訪問時刻を記録
    }
    return this.set(updatedActivity)
  }

  /**
   * お気に入りに追加
   */
  static addFavorite(affirmationId: string): boolean {
    const activity = this.get()
    if (!activity.favorites.includes(affirmationId)) {
      return this.update({
        favorites: [...activity.favorites, affirmationId]
      })
    }
    return true
  }

  /**
   * お気に入りから削除
   */
  static removeFavorite(affirmationId: string): boolean {
    const activity = this.get()
    return this.update({
      favorites: activity.favorites.filter(id => id !== affirmationId)
    })
  }

  /**
   * いいねをトグル
   */
  static toggleLike(affirmationId: string): boolean {
    const activity = this.get()
    const isLiked = activity.likes.includes(affirmationId)

    return this.update({
      likes: isLiked
        ? activity.likes.filter(id => id !== affirmationId)
        : [...activity.likes, affirmationId]
    })
  }

  /**
   * ユーザー追加アファメーションを追加
   */
  static addUserAffirmation(affirmation: UserActivity['userAffirmations'][0]): boolean {
    const activity = this.get()
    return this.update({
      userAffirmations: [...activity.userAffirmations, affirmation]
    })
  }

  /**
   * ユーザー追加アファメーションを削除
   */
  static removeUserAffirmation(affirmationId: string): boolean {
    const activity = this.get()
    return this.update({
      userAffirmations: activity.userAffirmations.filter(aff => aff.id !== affirmationId)
    })
  }

  /**
   * 今日の特別メッセージを設定
   */
  static setDailySpecialMessage(affirmationId: string): boolean {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD形式
    return this.update({
      dailySpecialMessage: {
        date: today,
        affirmationId
      }
    })
  }

  /**
   * 今日の特別メッセージを取得
   */
  static getTodaySpecialMessage(): string | null {
    const activity = this.get()
    const today = new Date().toISOString().split('T')[0]

    if (activity.dailySpecialMessage?.date === today) {
      return activity.dailySpecialMessage.affirmationId
    }

    return null
  }
}

// データマイグレーション用ユーティリティ
export class StorageMigration {
  private static readonly MIGRATION_VERSION_KEY = 'affirmation-app-migration-version'
  private static readonly CURRENT_VERSION = 1

  /**
   * データマイグレーションを実行
   */
  static async migrate(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false
    }

    try {
      const currentVersion = StorageService.get(this.MIGRATION_VERSION_KEY, 0)

      if (currentVersion < this.CURRENT_VERSION) {
        // 必要に応じてマイグレーション処理を実行
        await this.migrateToVersion1()

        StorageService.set(this.MIGRATION_VERSION_KEY, this.CURRENT_VERSION)
        console.log('Storage migration completed successfully')
      }

      return true
    } catch (error) {
      console.error('Storage migration failed:', error)
      return false
    }
  }

  /**
   * バージョン1へのマイグレーション
   */
  private static async migrateToVersion1(): Promise<void> {
    // 現在は初期バージョンなので、特に処理なし
    // 将来的にデータ構造が変わった場合にマイグレーション処理を追加
  }
}

// エラーハンドリング用のユーティリティ
export class StorageError extends Error {
  constructor(message: string, public readonly key?: string, public readonly operation?: string) {
    super(message)
    this.name = 'StorageError'
  }
}

// ストレージの状態を監視するユーティリティ
export class StorageMonitor {
  private static listeners: Map<string, ((value: any) => void)[]> = new Map()

  /**
   * ストレージの変更を監視
   */
  static subscribe<T>(key: string, callback: (value: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }

    this.listeners.get(key)!.push(callback)

    // アンサブスクライブ関数を返す
    return () => {
      const callbacks = this.listeners.get(key)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  /**
   * 変更を通知
   */
  static notify<T>(key: string, value: T): void {
    const callbacks = this.listeners.get(key)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(value)
        } catch (error) {
          console.error('Storage monitor callback error:', error)
        }
      })
    }
  }
}