'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import {
  Affirmation,
  AffirmationFilters,
  AffirmationContextValue,
  ThemeCategory,
  SceneCategory,
  AgeGroup
} from '@/types'
import { AffirmationService, UserService } from '@/lib/affirmationService'
import { useUser } from './UserContext'

// Context作成
const AffirmationContext = createContext<AffirmationContextValue | null>(null)

// Provider Props
interface AffirmationProviderProps {
  children: ReactNode
}

// Provider Component
export const AffirmationProvider: React.FC<AffirmationProviderProps> = ({ children }) => {
  const { settings } = useUser()

  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [filteredAffirmations, setFilteredAffirmations] = useState<Affirmation[]>([])
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null)
  const [filters, setFilters] = useState<AffirmationFilters>({})
  const [isInitialized, setIsInitialized] = useState(false)

  // サービス初期化
  useEffect(() => {
    const initialize = async () => {
      try {
        await AffirmationService.initialize()
        const allAffirmations = AffirmationService.getAllAffirmations()

        setAffirmations(allAffirmations)
        setFilteredAffirmations(allAffirmations)

        // 初回の推薦アファメーション設定
        const recommended = AffirmationService.getRecommendedAffirmation()
        setCurrentAffirmation(recommended)

        setIsInitialized(true)
        console.log('AffirmationContext initialized successfully')
      } catch (error) {
        console.error('Failed to initialize AffirmationContext:', error)
        setIsInitialized(true) // エラーでも初期化完了とする
      }
    }

    initialize()
  }, [])

  // フィルター変更時の処理
  useEffect(() => {
    if (!isInitialized) return

    try {
      const filtered = AffirmationService.getFiltered(filters)
      setFilteredAffirmations(filtered)
    } catch (error) {
      console.error('Failed to apply filters:', error)
    }
  }, [filters, affirmations, isInitialized])

  // ランダムアファメーション取得
  const getRandomAffirmation = useCallback((): Affirmation | null => {
    if (!isInitialized) return null

    try {
      // フィルターが設定されている場合はフィルター済みから選択
      const source = Object.keys(filters).length > 0 ? filteredAffirmations : affirmations

      if (source.length === 0) {
        return null
      }

      const randomIndex = Math.floor(Math.random() * source.length)
      return source[randomIndex]
    } catch (error) {
      console.error('Failed to get random affirmation:', error)
      return null
    }
  }, [isInitialized, filters, filteredAffirmations, affirmations])

  // 今日の特別メッセージ取得
  const getDailySpecialMessage = useCallback((): Affirmation | null => {
    if (!isInitialized) return null

    try {
      return AffirmationService.getDailySpecialMessage()
    } catch (error) {
      console.error('Failed to get daily special message:', error)
      return null
    }
  }, [isInitialized])

  // フィルター設定
  const handleSetFilters = useCallback((newFilters: Partial<AffirmationFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }))
  }, [])

  // 検索機能
  const searchAffirmations = useCallback((query: string) => {
    const searchFilters: AffirmationFilters = {
      ...filters,
      searchQuery: query.trim(),
    }
    setFilters(searchFilters)
  }, [filters])

  // 現在のアファメーションを更新
  const refreshCurrentAffirmation = useCallback(() => {
    if (!isInitialized) return

    try {
      // 現在の時刻と設定に基づいた推薦アファメーション
      const recommended = AffirmationService.getRecommendedAffirmation()

      // フィルターが設定されている場合は、フィルターも考慮
      if (Object.keys(filters).length > 0) {
        const filtered = AffirmationService.getFiltered({
          ...filters,
          ageGroup: settings.age,
          language: settings.language,
        })

        if (filtered.length > 0) {
          const randomFiltered = filtered[Math.floor(Math.random() * filtered.length)]
          setCurrentAffirmation(randomFiltered)
          return
        }
      }

      setCurrentAffirmation(recommended)
    } catch (error) {
      console.error('Failed to refresh current affirmation:', error)
    }
  }, [isInitialized, filters, settings.age, settings.language])

  // 設定変更時に現在のアファメーションを更新
  useEffect(() => {
    if (isInitialized) {
      refreshCurrentAffirmation()
    }
  }, [settings.age, settings.language, isInitialized, refreshCurrentAffirmation])

  // Context Value
  const contextValue: AffirmationContextValue = {
    affirmations,
    filteredAffirmations,
    currentAffirmation,
    filters,
    getRandomAffirmation,
    getDailySpecialMessage,
    setFilters: handleSetFilters,
    searchAffirmations,
    refreshCurrentAffirmation,
  }

  // 初期化完了まで何も表示しない
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-secondary">アファメーションを準備中...</p>
        </div>
      </div>
    )
  }

  return (
    <AffirmationContext.Provider value={contextValue}>
      {children}
    </AffirmationContext.Provider>
  )
}

// Custom Hook
export const useAffirmations = (): AffirmationContextValue => {
  const context = useContext(AffirmationContext)

  if (!context) {
    throw new Error('useAffirmations must be used within an AffirmationProvider')
  }

  return context
}

// 便利なカスタムフック
export const useCurrentAffirmation = () => {
  const { currentAffirmation, refreshCurrentAffirmation } = useAffirmations()

  return {
    currentAffirmation,
    refreshCurrentAffirmation,
  }
}

export const useAffirmationFilters = () => {
  const { filters, setFilters, filteredAffirmations } = useAffirmations()

  const clearFilters = () => {
    setFilters({})
  }

  const setThemeFilter = (theme: ThemeCategory | undefined) => {
    setFilters({ theme })
  }

  const setSceneFilter = (scene: SceneCategory | undefined) => {
    setFilters({ scene })
  }

  const setAgeGroupFilter = (ageGroup: AgeGroup | undefined) => {
    setFilters({ ageGroup })
  }

  const setFavoritesOnly = (onlyFavorites: boolean) => {
    setFilters({ onlyFavorites })
  }

  return {
    filters,
    filteredAffirmations,
    setFilters,
    clearFilters,
    setThemeFilter,
    setSceneFilter,
    setAgeGroupFilter,
    setFavoritesOnly,
  }
}

export const useAffirmationSearch = () => {
  const { searchAffirmations, filteredAffirmations } = useAffirmations()

  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const search = (query: string) => {
    if (query.trim()) {
      searchAffirmations(query)

      // 検索履歴に追加（重複除去）
      setSearchHistory(prev => {
        const newHistory = [query.trim(), ...prev.filter(h => h !== query.trim())]
        return newHistory.slice(0, 10) // 最新10件のみ保持
      })
    }
  }

  const clearSearch = () => {
    searchAffirmations('')
  }

  return {
    search,
    clearSearch,
    searchResults: filteredAffirmations,
    searchHistory,
  }
}

export const useDailySpecial = () => {
  const { getDailySpecialMessage } = useAffirmations()
  const [dailyMessage, setDailyMessage] = useState<Affirmation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshDailyMessage = async () => {
    setIsLoading(true)
    try {
      const message = getDailySpecialMessage()
      setDailyMessage(message)
    } catch (error) {
      console.error('Failed to refresh daily message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshDailyMessage()
  }, [getDailySpecialMessage])

  return {
    dailyMessage,
    refreshDailyMessage,
    isLoading,
  }
}

export const useRandomAffirmation = () => {
  const { getRandomAffirmation } = useAffirmations()

  const [randomAffirmation, setRandomAffirmation] = useState<Affirmation | null>(null)

  const getNext = () => {
    const next = getRandomAffirmation()
    setRandomAffirmation(next)
    return next
  }

  useEffect(() => {
    // 初回読み込み
    getNext()
  }, [getRandomAffirmation])

  return {
    randomAffirmation,
    getNext,
  }
}