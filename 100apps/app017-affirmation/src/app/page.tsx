'use client'

import React from 'react'
import { AffirmationProvider } from '@/context/AffirmationContext'
import { UserProvider } from '@/context/UserContext'
import { AffirmationCard } from '@/components/affirmation/AffirmationCard'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Button } from '@/components/ui/Button'
import { Shuffle } from 'lucide-react'
import { arrayUtils } from '@/lib/utils'
import { Affirmation } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function HomePage() {
  const [currentAffirmation, setCurrentAffirmation] = React.useState<Affirmation | null>(null)
  const [affirmations, setAffirmations] = React.useState<Affirmation[]>([])

  // アファメーションデータの読み込み
  React.useEffect(() => {
    const loadAffirmations = async () => {
      try {
        const response = await fetch('/data/affirmations.json')
        const data = await response.json()
        setAffirmations(data.affirmations)
        // 初回はランダムなアファメーションを表示
        const randomAffirmation = arrayUtils.random(data.affirmations)
        setCurrentAffirmation(randomAffirmation || data.affirmations[0])
      } catch (error) {
        console.error('アファメーションの読み込みに失敗しました:', error)
        // フォールバック用のサンプルデータ
        const fallbackAffirmation: Affirmation = {
          id: 'sample-001',
          text: '今日も素晴らしい一日が始まります。あなたには無限の可能性があります。',
          textEn: 'Today is the beginning of another wonderful day. You have infinite possibilities.',
          categories: {
            theme: '自信',
            scene: '朝',
            ageGroup: '全年代'
          },
          author: 'システム',
          source: 'サンプル',
          tags: ['自信', '可能性', '朝'],
          createdAt: new Date().toISOString(),
          isUserGenerated: false
        }
        setCurrentAffirmation(fallbackAffirmation)
      }
    }

    loadAffirmations()
  }, [])

  // 新しいアファメーションを取得
  const getNewAffirmation = () => {
    if (affirmations.length > 0) {
      const newAffirmation = arrayUtils.random(affirmations.filter(a => a.id !== currentAffirmation?.id))
      setCurrentAffirmation(newAffirmation || affirmations[0])
    }
  }

  // シェア機能
  const handleShare = (affirmation: Affirmation) => {
    if (navigator.share) {
      navigator.share({
        title: 'Daily Affirmation',
        text: affirmation.text,
        url: window.location.href
      })
    } else {
      // フォールバック：クリップボードにコピー
      navigator.clipboard.writeText(`${affirmation.text}\n\n- ${affirmation.author || ''}`)
    }
  }

  return (
    <UserProvider>
      <AffirmationProvider>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Header
            title="Daily Affirmation"
            showBackButton={false}
            showSettingsButton={true}
            showThemeToggle={true}
          />

          <main className="pb-24">

            {/* メインコンテンツ */}
            <div className="px-4 pb-8">
              <div className="max-w-md mx-auto">
                {/* コンテンツを固定レイアウトに */}
                <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 280px)' }}>

                  {/* 今日の日付 */}
                  <div className="text-center mb-8">
                    <p className="text-lg text-textSecondary mb-2">
                      {new Date().toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                    <h2 className="text-xl font-semibold text-primary">
                      今日のあなたへ
                    </h2>
                  </div>

                  {/* アファメーションカードエリア（4-5行想定） */}
                  <div className="flex-1 flex items-center justify-center mb-4">
                    <div className="w-full" style={{ minHeight: '140px' }}>
                      <AnimatePresence mode="wait">
                        {currentAffirmation && (
                          <motion.div
                            key={currentAffirmation.id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{
                              duration: 0.5,
                              ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
                            }}
                          >
                            <AffirmationCard
                              affirmation={currentAffirmation}
                              size="lg"
                              showActions={true}
                              showAuthor={true}
                              showTranslation={true}
                              onShare={handleShare}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* 新しいメッセージボタン（固定位置） */}
                  <div className="flex justify-center">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={getNewAffirmation}
                      className="flex items-center space-x-2 px-8 py-3 transition-all duration-200 hover:scale-105 active:scale-95"
                      disabled={!affirmations.length}
                    >
                      <motion.div
                        animate={{ rotate: affirmations.length > 0 ? 0 : 0 }}
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Shuffle className="w-5 h-5" />
                      </motion.div>
                      <span>新しいメッセージ</span>
                    </Button>
                  </div>

                </div>

                {/* ステータス表示（デバッグ用） */}
                <div className="mt-8 p-4 bg-surface rounded-lg shadow-sm opacity-70">
                  <h3 className="text-sm font-semibold text-textSecondary mb-2">
                    システム情報
                  </h3>
                  <div className="text-xs text-textSecondary space-y-1">
                    <p>読み込み済みアファメーション: {affirmations.length}件</p>
                    <p>現在のアファメーション ID: {currentAffirmation?.id || '未選択'}</p>
                  </div>
                </div>

                {/* 利用方法の簡単な説明 */}
                <div className="text-center text-sm text-textSecondary space-y-2">
                  <p>💡 このアプリをホーム画面に追加すると、いつでも励ましの言葉を見ることができます</p>
                  <p>🌙 寝る前にはダークモードがおすすめです</p>
                </div>
              </div>
            </div>
          </main>

          <Navigation />
        </div>
      </AffirmationProvider>
    </UserProvider>
  )
}