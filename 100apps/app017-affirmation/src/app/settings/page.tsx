'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { UserProvider, useUser, useUserActivity } from '@/context/UserContext'
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Moon,
  Sun,
  Globe,
  Bell,
  Download,
  Trash2,
  Info,
  Heart,
  Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SettingsPageContent: React.FC = () => {
  const { settings, updateSettings } = useUser()
  const { activity, clearAllFavorites, clearAllLikes } = useUserActivity()
  const [isDark, setIsDark] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // ダークモード状態の取得
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  // ダークモード切り替え
  const toggleDarkMode = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('darkMode', newIsDark.toString())
  }

  // 年代変更
  const handleAgeChange = (age: string) => {
    updateSettings({ age: age as any })
  }

  // 言語変更
  const handleLanguageChange = (language: string) => {
    updateSettings({ language: language as 'ja' | 'en' })
  }

  // データリセット
  const handleResetData = () => {
    clearAllFavorites()
    clearAllLikes()
    setShowResetConfirm(false)

    // 成功メッセージを表示（簡易実装）
    alert('データをリセットしました')
  }

  // PWAインストール
  const handleInstallPWA = () => {
    // PWAインストール処理（実際のPWAでは deferredPrompt を使用）
    alert('ブラウザメニューから「ホーム画面に追加」を選択してください')
  }

  // データエクスポート
  const handleExportData = () => {
    const data = {
      settings,
      activity,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `affirmation-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const ageOptions = [
    { value: '20代', label: '20代' },
    { value: '30代', label: '30代' },
    { value: '40代', label: '40代' },
    { value: '50代', label: '50代' },
    { value: '60代', label: '60代' },
    { value: '全年代', label: '年代指定なし' }
  ]

  const languageOptions = [
    { value: 'ja', label: '日本語' },
    { value: 'en', label: 'English' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header
        title="設定"
        showBackButton={true}
        showThemeToggle={false}
        onBackClick={() => window.history.back()}
      />

      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* ページヘッダー */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-500 rounded-full flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gradient">設定</h1>
              </div>
              <p className="text-textSecondary">
                アプリをあなた好みにカスタマイズしましょう
              </p>
            </motion.div>
          </div>

          {/* 個人設定 */}
          <motion.section
            className="bg-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-textPrimary">個人設定</h2>
              </div>

              <div className="space-y-4">
                <Select
                  label="年代"
                  options={ageOptions}
                  value={settings.age}
                  onChange={(e) => handleAgeChange(e.target.value)}
                  helperText="年代に適したアファメーションを推薦します"
                />

                <Select
                  label="言語"
                  options={languageOptions}
                  value={settings.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  helperText="アプリの表示言語を選択してください"
                />
              </div>
            </div>
          </motion.section>

          {/* テーマ・外観 */}
          <motion.section
            className="bg-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="w-5 h-5 text-secondary" />
                <h2 className="text-lg font-semibold text-textPrimary">テーマ・外観</h2>
              </div>

              <div className="space-y-4">
                {/* ダークモード */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isDark ? (
                      <Moon className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <div className="font-medium text-textPrimary">ダークモード</div>
                      <div className="text-sm text-textSecondary">
                        {isDark ? '夜間に目に優しい表示' : '明るく見やすい表示'}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isDark ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={toggleDarkMode}
                    className="ml-auto"
                  >
                    {isDark ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* データ・プライバシー */}
          <motion.section
            className="bg-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-textPrimary">データ・プライバシー</h2>
              </div>

              <div className="space-y-4">
                {/* データ統計 */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {activity.favorites.length}
                      </div>
                      <div className="text-xs text-textSecondary">お気に入り</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-500">
                        {activity.likes.length}
                      </div>
                      <div className="text-xs text-textSecondary">いいね</div>
                    </div>
                  </div>
                </div>

                {/* データ操作 */}
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDataModal(true)}
                    className="w-full justify-start"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    データの詳細を見る
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportData}
                    className="w-full justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    データをエクスポート
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    データをリセット
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* PWA */}
          <motion.section
            className="bg-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Download className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-textPrimary">アプリとして使用</h2>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-textSecondary">
                  このアプリをホーム画面に追加すると、ネイティブアプリのように使用できます。
                  オフラインでも利用可能です。
                </div>

                <Button
                  variant="primary"
                  onClick={handleInstallPWA}
                  className="w-full"
                >
                  ホーム画面に追加
                </Button>
              </div>
            </div>
          </motion.section>

          {/* アプリ情報 */}
          <motion.section
            className="bg-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="p-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-textPrimary">Daily Affirmation</span>
                </div>
                <div className="text-sm text-textSecondary">Version 1.0.0</div>
                <div className="text-xs text-textSecondary">
                  心を支える毎日のアファメーション
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <Navigation />

      {/* データ詳細モーダル */}
      <AnimatePresence>
        {showDataModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDataModal(false)}
          >
            <motion.div
              className="bg-surface rounded-2xl p-6 mx-4 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-textPrimary">データの詳細</h3>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-textPrimary mb-2">保存されているデータ</h4>
                  <ul className="space-y-1 text-textSecondary">
                    <li>• 個人設定（年代、言語設定）</li>
                    <li>• お気に入りのアファメーション</li>
                    <li>• いいねしたアファメーション</li>
                    <li>• アプリの使用統計</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-textPrimary mb-2">プライバシー</h4>
                  <ul className="space-y-1 text-textSecondary">
                    <li>• データはお使いのデバイスにのみ保存されます</li>
                    <li>• 外部サーバーには送信されません</li>
                    <li>• 個人を特定する情報は収集しません</li>
                  </ul>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => setShowDataModal(false)}
                className="w-full mt-6"
              >
                閉じる
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* データリセット確認 */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              className="bg-surface rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-textPrimary mb-2">
                    データをリセット
                  </h3>
                  <p className="text-sm text-textSecondary">
                    お気に入りやいいねなど、すべての個人データが削除されます。
                    この操作は元に戻せません。
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleResetData}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    リセット
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <UserProvider>
      <SettingsPageContent />
    </UserProvider>
  )
}