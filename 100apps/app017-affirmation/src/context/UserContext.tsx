'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserSettings, UserActivity, UserContextValue, AgeGroup, DesignTheme, ColorTheme, Affirmation } from '@/types'
import { UserSettingsStorage, UserActivityStorage, StorageMigration } from '@/lib/storage'
import { UserService } from '@/lib/affirmationService'

// Context作成
const UserContext = createContext<UserContextValue | null>(null)

// Provider Props
interface UserProviderProps {
  children: ReactNode
}

// Provider Component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(UserSettingsStorage.get())
  const [activity, setActivity] = useState<UserActivity>(UserActivityStorage.get())
  const [isInitialized, setIsInitialized] = useState(false)

  // 初期化処理
  useEffect(() => {
    const initialize = async () => {
      try {
        // データマイグレーションを実行
        await StorageMigration.migrate()

        // 最新のデータを読み込み
        const latestSettings = UserSettingsStorage.get()
        const latestActivity = UserActivityStorage.get()

        setSettings(latestSettings)
        setActivity(latestActivity)
        setIsInitialized(true)

        console.log('UserContext initialized successfully')
      } catch (error) {
        console.error('Failed to initialize UserContext:', error)
        setIsInitialized(true) // エラーでも初期化完了とする
      }
    }

    initialize()
  }, [])

  // ダークモードのシステム設定検知
  useEffect(() => {
    if (!isInitialized) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // ユーザーが明示的に設定していない場合のみシステム設定を適用
      const currentSettings = UserSettingsStorage.get()
      if (currentSettings === UserSettingsStorage.get()) {
        updateSettings({ isDarkMode: e.matches })
      }
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [isInitialized])

  // 設定更新関数
  const updateSettings = (partialSettings: Partial<UserSettings>) => {
    const updatedSettings: UserSettings = {
      ...settings,
      ...partialSettings,
    }

    setSettings(updatedSettings)
    UserSettingsStorage.set(updatedSettings)

    // ダークモードの変更をHTMLに反映
    if (partialSettings.isDarkMode !== undefined) {
      document.documentElement.classList.toggle('dark', partialSettings.isDarkMode)
    }

    console.log('User settings updated:', partialSettings)
  }

  // アクティビティ更新のヘルパー関数
  const updateActivity = (partialActivity: Partial<UserActivity>) => {
    const updatedActivity: UserActivity = {
      ...activity,
      ...partialActivity,
      lastVisit: new Date().toISOString(),
    }

    setActivity(updatedActivity)
    UserActivityStorage.set(updatedActivity)
  }

  // お気に入りに追加
  const addFavorite = (affirmationId: string) => {
    if (!activity.favorites.includes(affirmationId)) {
      const updatedFavorites = [...activity.favorites, affirmationId]
      updateActivity({ favorites: updatedFavorites })
      UserActivityStorage.addFavorite(affirmationId)
    }
  }

  // お気に入りから削除
  const removeFavorite = (affirmationId: string) => {
    const updatedFavorites = activity.favorites.filter(id => id !== affirmationId)
    updateActivity({ favorites: updatedFavorites })
    UserActivityStorage.removeFavorite(affirmationId)
  }

  // いいねの切り替え
  const toggleLike = (affirmationId: string) => {
    const isLiked = activity.likes.includes(affirmationId)
    const updatedLikes = isLiked
      ? activity.likes.filter(id => id !== affirmationId)
      : [...activity.likes, affirmationId]

    updateActivity({ likes: updatedLikes })
    UserActivityStorage.toggleLike(affirmationId)
  }

  // ユーザー追加アファメーション
  const addUserAffirmation = (affirmationData: Omit<Affirmation, 'id' | 'createdAt' | 'isUserAdded'>) => {
    const newAffirmation: Affirmation = {
      ...affirmationData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isUserAdded: true,
    }

    const updatedUserAffirmations = [...activity.userAffirmations, newAffirmation]
    updateActivity({ userAffirmations: updatedUserAffirmations })
    UserActivityStorage.addUserAffirmation(newAffirmation)
  }

  // Context Value
  const contextValue: UserContextValue = {
    settings,
    activity,
    updateSettings,
    addFavorite,
    removeFavorite,
    toggleLike,
    addUserAffirmation,
  }

  // 初期化完了まで何も表示しない
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-secondary">アプリを準備中...</p>
        </div>
      </div>
    )
  }

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

// Custom Hook
export const useUser = (): UserContextValue => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}

// 便利なカスタムフック
export const useUserSettings = () => {
  const { settings, updateSettings } = useUser()
  return { settings, updateSettings }
}

export const useUserActivity = () => {
  const { activity, addFavorite, removeFavorite, toggleLike, addUserAffirmation } = useUser()
  return { activity, addFavorite, removeFavorite, toggleLike, addUserAffirmation }
}

export const useDarkMode = () => {
  const { settings, updateSettings } = useUser()

  const toggleDarkMode = () => {
    updateSettings({ isDarkMode: !settings.isDarkMode })
  }

  return {
    isDarkMode: settings.isDarkMode,
    toggleDarkMode,
  }
}

export const useTheme = () => {
  const { settings, updateSettings } = useUser()

  const updateTheme = (designTheme: DesignTheme, colorTheme?: ColorTheme) => {
    const updates: Partial<UserSettings> = { designTheme }
    if (colorTheme) {
      updates.colorTheme = colorTheme
    }
    updateSettings(updates)
  }

  return {
    designTheme: settings.designTheme,
    colorTheme: settings.colorTheme,
    updateTheme,
  }
}

export const useInitialSetup = () => {
  const { settings, updateSettings } = useUser()

  const needsInitialSetup = UserService.needsInitialSetup()

  const completeSetup = (age: AgeGroup) => {
    updateSettings({ age })
    return UserService.completeInitialSetup(age)
  }

  return {
    needsInitialSetup,
    completeSetup,
    currentAge: settings.age,
  }
}