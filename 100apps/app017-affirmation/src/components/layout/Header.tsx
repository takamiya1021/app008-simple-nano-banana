'use client'

import React, { useState } from 'react'
import { Button, IconButton } from '@/components/ui/Button'
import { Heart, Settings, Sun, Moon, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  showSettingsButton?: boolean
  showThemeToggle?: boolean
  onBackClick?: () => void
  onSettingsClick?: () => void
  className?: string
  transparent?: boolean
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Daily Affirmation',
  showBackButton = false,
  showSettingsButton = true,
  showThemeToggle = true,
  onBackClick,
  onSettingsClick,
  className,
  transparent = false
}) => {
  const { isDark, toggleDarkMode } = useTheme()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // 戻るボタンのハンドル
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      window.history.back()
    }
  }

  // 設定ボタンのハンドル
  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick()
    } else {
      // デフォルトの設定ページに遷移
      window.location.href = '/settings'
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        transparent
          ? 'bg-transparent'
          : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700',
        'safe-area-inset-top',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 左側: ロゴ・タイトル */}
          <div className="flex items-center space-x-3">
            {showBackButton ? (
              <IconButton
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>}
                variant="ghost"
                size="md"
                onClick={handleBackClick}
                aria-label="戻る"
                className="text-gray-900 dark:text-gray-100"
              />
            ) : (
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
              </Link>
            )}

            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gradient hidden sm:block">
                {title}
              </h1>
              <h1 className="text-lg font-bold text-gradient sm:hidden">
                Affirmation
              </h1>
            </Link>
          </div>

          {/* 右側: アクションボタン */}
          <div className="flex items-center space-x-2">
            {/* デスクトップメニュー */}
            <div className="hidden sm:flex items-center space-x-2">
              {showThemeToggle && (
                <IconButton
                  icon={isDark ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                  variant="ghost"
                  size="md"
                  onClick={toggleDarkMode}
                  aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
                  className="text-gray-900 dark:text-gray-100"
                />
              )}

              {showSettingsButton && (
                <IconButton
                  icon={<Settings className="w-5 h-5" />}
                  variant="ghost"
                  size="md"
                  onClick={handleSettingsClick}
                  aria-label="設定"
                  className="text-gray-900 dark:text-gray-100"
                />
              )}
            </div>

            {/* モバイルメニューボタン */}
            <div className="sm:hidden">
              <IconButton
                icon={showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                variant="ghost"
                size="md"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="メニュー"
                className="text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 py-4 bg-white dark:bg-gray-900">
            <div className="flex flex-col space-y-3">
              {showThemeToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggleDarkMode()
                    setShowMobileMenu(false)
                  }}
                  className="justify-start text-gray-900 dark:text-gray-100"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                      ライトモード
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      ダークモード
                    </>
                  )}
                </Button>
              )}

              {showSettingsButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSettingsClick()
                    setShowMobileMenu(false)
                  }}
                  className="justify-start text-gray-900 dark:text-gray-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  設定
                </Button>
              )}

              {/* 追加のメニュー項目 */}
              <Link href="/favorites">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(false)}
                  className="justify-start w-full text-gray-900 dark:text-gray-100"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  お気に入り
                </Button>
              </Link>

              <Link href="/categories">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(false)}
                  className="justify-start w-full text-gray-900 dark:text-gray-100"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 7-2 7m-7-7v11" />
                  </svg>
                  カテゴリ
                </Button>
              </Link>

              <Link href="/add-affirmation">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(false)}
                  className="justify-start w-full text-gray-900 dark:text-gray-100"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  アファメーション追加
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// ヘッダーのバリアント
export const SimpleHeader: React.FC<Pick<HeaderProps, 'title' | 'className'>> = ({
  title = 'Daily Affirmation',
  className
}) => {
  return (
    <div className={cn('text-center py-6', className)}>
      <div className="flex items-center justify-center space-x-2 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gradient">
          {title}
        </h1>
      </div>
      <p className="text-textSecondary text-sm">
        あなたの心を支える、毎日のアファメーション
      </p>
    </div>
  )
}

// PWA用ヘッダー（ネイティブアプリ風）
export const PWAHeader: React.FC<HeaderProps> = (props) => {
  return (
    <Header
      {...props}
      transparent={false}
      className={cn(
        'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
        props.className
      )}
    />
  )
}