'use client'

import React, { useMemo, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { AffirmationList, ViewMode, SortOption } from '@/components/affirmation/AffirmationList'
import { Button } from '@/components/ui/Button'
import { UserProvider } from '@/context/UserContext'
import { AffirmationProvider, useAffirmations } from '@/context/AffirmationContext'
import { useUserActivity } from '@/context/UserContext'
import { Heart, Trash2, Edit3, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FavoritesPageContent: React.FC = () => {
  const { affirmations } = useAffirmations()
  const { activity, removeFavorite, clearAllFavorites } = useUserActivity()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // お気に入りアファメーション
  const favoriteAffirmations = useMemo(() => {
    return affirmations.filter(affirmation =>
      activity.favorites.includes(affirmation.id)
    )
  }, [affirmations, activity.favorites])

  // アファメーション詳細表示
  const handleAffirmationClick = (affirmation: any) => {
    console.log('お気に入りアファメーション詳細:', affirmation)
  }

  // シェア機能
  const handleShare = (affirmation: any) => {
    if (navigator.share) {
      navigator.share({
        title: 'Daily Affirmation - お気に入り',
        text: `${affirmation.text}\n\n私のお気に入りのアファメーションです ✨`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${affirmation.text}\n\n私のお気に入りのアファメーションです ✨`)
    }
  }

  // 全削除確認
  const handleClearAll = () => {
    if (favoriteAffirmations.length > 0) {
      setShowClearConfirm(true)
    }
  }

  // 全削除実行
  const confirmClearAll = () => {
    clearAllFavorites()
    setShowClearConfirm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header
        title="お気に入り"
        showBackButton={true}
        onBackClick={() => window.history.back()}
      />

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* ページヘッダー */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <h1 className="text-2xl font-bold text-gradient">お気に入り</h1>
            </div>
            <p className="text-textSecondary">
              あなたの心に響いたアファメーションコレクション
            </p>
          </motion.div>
        </div>

        {/* 統計・アクション */}
        {favoriteAffirmations.length > 0 && (
          <motion.div
            className="bg-surface rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {favoriteAffirmations.length}
                  </div>
                  <div className="text-sm text-textSecondary">お気に入り</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {activity.likes.length}
                  </div>
                  <div className="text-sm text-textSecondary">いいね</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  全削除
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* お気に入り一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {favoriteAffirmations.length > 0 ? (
            <AffirmationList
              affirmations={favoriteAffirmations}
              loading={false}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onAffirmationClick={handleAffirmationClick}
              onShare={handleShare}
              showSortControls={true}
              showViewControls={true}
              emptyMessage="お気に入りのアファメーションがありません"
              itemsPerPage={10}
            />
          ) : (
            // 空状態
            <div className="text-center py-16">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-12 h-12 text-gray-400" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-textPrimary">
                    お気に入りはまだありません
                  </h3>
                  <p className="text-textSecondary max-w-md mx-auto">
                    アファメーションを読んで、心に響いたものを
                    <Heart className="w-4 h-4 inline mx-1 fill-red-500 text-red-500" />
                    ボタンでお気に入りに追加してみましょう
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="primary"
                    onClick={() => window.location.href = '/'}
                    className="flex items-center space-x-2"
                  >
                    <Heart className="w-4 h-4" />
                    <span>ホームでアファメーションを見る</span>
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = '/categories'}
                    className="flex items-center space-x-2"
                  >
                    <span>カテゴリから探す</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>

      <Navigation />

      {/* 全削除確認モーダル */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowClearConfirm(false)}
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
                    すべてのお気に入りを削除
                  </h3>
                  <p className="text-sm text-textSecondary">
                    {favoriteAffirmations.length}件のお気に入りがすべて削除されます。
                    この操作は元に戻せません。
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={confirmClearAll}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    削除する
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

export default function FavoritesPage() {
  return (
    <UserProvider>
      <AffirmationProvider>
        <FavoritesPageContent />
      </AffirmationProvider>
    </UserProvider>
  )
}