'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  setTheme: (theme: Theme) => void
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system'
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [isDark, setIsDark] = useState(false)

  // システムテーマの監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(mediaQuery.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // 初期化: localStorage からテーマを読み込み
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setTheme(stored)
    } else {
      setTheme('system')
    }
  }, [])

  // テーマ適用関数
  const applyTheme = (actualTheme: 'light' | 'dark') => {
    const root = document.documentElement
    const isDarkMode = actualTheme === 'dark'

    setIsDark(isDarkMode)
    root.classList.toggle('dark', isDarkMode)
  }

  // テーマ変更時の処理
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(systemPrefersDark ? 'dark' : 'light')
    } else {
      applyTheme(theme)
    }

    // localStorage に保存
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  const toggleDarkMode = () => {
    // シンプルなダークモード切り替え（light ↔ dark）
    setTheme(prev => {
      if (prev === 'dark') return 'light'
      if (prev === 'light') return 'dark'
      // system の場合は現在の実際の状態に基づいて切り替え
      return isDark ? 'light' : 'dark'
    })
  }

  const value: ThemeContextType = {
    theme,
    isDark,
    setTheme: handleSetTheme,
    toggleDarkMode
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// テーマ切り替え用のカスタムフック
export const useThemeToggle = () => {
  const { toggleDarkMode } = useTheme()
  return toggleDarkMode
}

// 現在のテーマ状態を取得するカスタムフック
export const useIsDark = () => {
  const { isDark } = useTheme()
  return isDark
}