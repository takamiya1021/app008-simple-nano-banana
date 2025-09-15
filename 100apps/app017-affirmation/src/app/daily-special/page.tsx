'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { AffirmationCard } from '@/components/affirmation/AffirmationCard'
import { Button } from '@/components/ui/Button'
import { UserProvider } from '@/context/UserContext'
import { AffirmationProvider, useAffirmations, useDailySpecial } from '@/context/AffirmationContext'
import { useUserActivity, useUser } from '@/context/UserContext'
import { Sparkles, RefreshCw, Calendar, TrendingUp, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDate } from '@/lib/utils'

const DailySpecialPageContent: React.FC = () => {
  const { settings } = useUser()
  const { activity } = useUserActivity()
  const { dailyMessage, refreshDailyMessage, isLoading } = useDailySpecial()
  const [showPersonalization, setShowPersonalization] = useState(false)

  // 個人化された推奨理由を生成
  const getPersonalizationReason = () => {
    if (!dailyMessage) return null

    const reasons = []

    if (dailyMessage.categories.ageGroup === settings.age) {
      reasons.push(`${settings.age}向けのメッセージ`)
    }

    if (activity.favorites.length > 0) {
      reasons.push('お気に入りの傾向に基づく')
    }

    const currentHour = new Date().getHours()
    if (currentHour < 12 && dailyMessage.categories.scene === '朝') {
      reasons.push('朝の時間にピッタリ')
    } else if (currentHour >= 18 && dailyMessage.categories.scene === '夜') {
      reasons.push('夜の時間にピッタリ')
    }

    return reasons
  }

  const personalizationReasons = getPersonalizationReason()

  // シェア機能
  const handleShare = (affirmation: any) => {
    const today = formatDate.japanese(new Date())
    if (navigator.share) {
      navigator.share({
        title: 'Daily Affirmation - 今日の特別なメッセージ',
        text: `${today}の特別なメッセージ:\n\n${affirmation.text}\n\n#DailyAffirmation`,
        url: window.location.href
      })
    }
  }

  // 統計データ（サンプル）
  const stats = {
    consecutiveDays: 7, // 連続利用日数
    totalFavorites: activity.favorites.length,
    totalLikes: activity.likes.length,
    weeklyGoal: 7,
    currentStreak: 3
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header
        title="今日の特別なメッセージ"
        showBackButton={true}
        onBackClick={() => window.history.back()}
      />

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* ページヘッダー */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient">今日の特別なメッセージ</h1>
            </div>

            <div className="space-y-2">
              <p className="text-lg text-primary font-semibold">
                {formatDate.japanese(new Date())}
              </p>
              <p className="text-textSecondary">
                あなただけに選ばれた、今日の心に響くメッセージ
              </p>
            </div>
          </motion.div>
        </div>

        {/* 統計カード */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-surface rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-500 mb-1">
              {stats.consecutiveDays}
            </div>
            <div className="text-xs text-textSecondary">連続利用日数</div>
          </div>

          <div className="bg-surface rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-pink-500 mb-1">
              {stats.totalFavorites}
            </div>
            <div className="text-xs text-textSecondary">お気に入り</div>
          </div>

          <div className="bg-surface rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-red-500 mb-1">
              {stats.totalLikes}
            </div>
            <div className="text-xs text-textSecondary">いいね</div>
          </div>

          <div className="bg-surface rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {Math.round((stats.currentStreak / stats.weeklyGoal) * 100)}%
            </div>
            <div className="text-xs text-textSecondary">週間目標</div>
          </div>
        </motion.div>

        {/* パーソナライズ理由 */}
        {personalizationReasons && personalizationReasons.length > 0 && (
          <motion.div
            className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
                  あなたに最適化されました
                </h3>
                <div className="flex flex-wrap gap-2">
                  {personalizationReasons.map((reason, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/60 dark:bg-gray-800/60 text-purple-700 dark:text-purple-300"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 今日の特別メッセージ */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-textPrimary mb-2">
              ✨ 今日のあなたへの特別なメッセージ
            </h2>
          </div>

          <div className="max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {dailyMessage ? (
                <motion.div
                  key={dailyMessage.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <AffirmationCard
                    affirmation={dailyMessage}
                    size="xl"
                    showActions={true}
                    showAuthor={true}
                    showTranslation={true}
                    onShare={handleShare}
                    className="shadow-2xl border-2 border-purple-200 dark:border-purple-800"
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="affirmation-card p-8 min-h-[240px] rounded-3xl flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center space-y-4">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto"></div>
                    <p className="text-textSecondary">
                      今日の特別なメッセージを準備中...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* アクションボタン */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={refreshDailyMessage}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3"
          >
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.div>
            <span>別のメッセージを見る</span>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2 px-6 py-3"
          >
            <Calendar className="w-5 h-5" />
            <span>ホームに戻る</span>
          </Button>
        </motion.div>

        {/* 今日のヒント */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-sm">💡</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                今日のヒント
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                アファメーションは朝起きてすぐや、夜寝る前に読むと効果的です。
                心を静めて、言葉の一つ一つを味わいながら読んでみましょう。
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Navigation />
    </div>
  )
}

export default function DailySpecialPage() {
  return (
    <UserProvider>
      <AffirmationProvider>
        <DailySpecialPageContent />
      </AffirmationProvider>
    </UserProvider>
  )
}