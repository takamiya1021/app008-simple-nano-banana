'use client'

import React, { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { FilterBar } from '@/components/affirmation/FilterBar'
import { AffirmationList } from '@/components/affirmation/AffirmationList'
import { UserProvider } from '@/context/UserContext'
import { AffirmationProvider, useAffirmations } from '@/context/AffirmationContext'
import { AffirmationFilters, SortOption, ViewMode } from '@/types'
import { Button } from '@/components/ui/Button'
import { Filter, Grid, List, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const CategoryPageContent: React.FC = () => {
  const { affirmations, filteredAffirmations, filters, setFilters, searchAffirmations } = useAffirmations()
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showFilters, setShowFilters] = useState(false)

  // フィルター適用済みのアファメーション
  const displayAffirmations = useMemo(() => {
    if (Object.keys(filters).length > 0) {
      return filteredAffirmations
    }
    return affirmations
  }, [affirmations, filteredAffirmations, filters])

  // フィルター変更
  const handleFiltersChange = (newFilters: Partial<AffirmationFilters>) => {
    setFilters(newFilters)
  }

  // 検索実行
  const handleSearch = (query: string) => {
    searchAffirmations(query)
  }

  // フィルター全クリア
  const handleClearFilters = () => {
    setFilters({})
  }

  // アファメーションクリック
  const handleAffirmationClick = (affirmation: any) => {
    // 詳細モーダルまたは詳細ページへの遷移
    console.log('アファメーション詳細:', affirmation)
  }

  // シェア機能
  const handleShare = (affirmation: any) => {
    if (navigator.share) {
      navigator.share({
        title: 'Daily Affirmation',
        text: affirmation.text,
        url: window.location.href
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header
        title="カテゴリ選択"
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
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient">カテゴリから選ぶ</h1>
            </div>
            <p className="text-textSecondary">
              テーマ・シーン・年代でアファメーションを絞り込んで探せます
            </p>
          </motion.div>
        </div>

        {/* クイックフィルターボタン */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <Button
              variant={filters.theme === '自信' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFiltersChange({ theme: filters.theme === '自信' ? undefined : '自信' })}
              className="flex items-center space-x-2"
            >
              <span>💪</span>
              <span>自信</span>
            </Button>

            <Button
              variant={filters.theme === '愛' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFiltersChange({ theme: filters.theme === '愛' ? undefined : '愛' })}
              className="inline-flex items-center gap-1 whitespace-nowrap min-w-0"
            >
              <Heart className="w-4 h-4 shrink-0" />
              <span className="shrink-0">愛・感謝</span>
            </Button>

            <Button
              variant={filters.scene === '朝' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFiltersChange({ scene: filters.scene === '朝' ? undefined : '朝' })}
              className="flex items-center space-x-2"
            >
              <span>🌅</span>
              <span>朝</span>
            </Button>

            <Button
              variant={filters.scene === '夜' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFiltersChange({ scene: filters.scene === '夜' ? undefined : '夜' })}
              className="flex items-center space-x-2"
            >
              <span>🌙</span>
              <span>夜</span>
            </Button>

            <Button
              variant={filters.onlyFavorites ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFiltersChange({ onlyFavorites: !filters.onlyFavorites })}
              className="flex items-center space-x-2"
            >
              <Heart className={`w-4 h-4 ${filters.onlyFavorites ? 'fill-current' : ''}`} />
              <span>お気に入り</span>
            </Button>
          </div>
        </motion.div>

        {/* 詳細フィルター */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            onClear={handleClearFilters}
          />
        </motion.div>

        {/* 結果表示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AffirmationList
            affirmations={displayAffirmations}
            loading={false}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAffirmationClick={handleAffirmationClick}
            onShare={handleShare}
            showSortControls={true}
            showViewControls={true}
            emptyMessage="条件に合うアファメーションが見つかりません"
            itemsPerPage={12}
          />
        </motion.div>
      </main>

      <Navigation />
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <UserProvider>
      <AffirmationProvider>
        <CategoryPageContent />
      </AffirmationProvider>
    </UserProvider>
  )
}