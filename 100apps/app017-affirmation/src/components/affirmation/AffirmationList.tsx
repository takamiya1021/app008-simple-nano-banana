'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { CompactAffirmationCard, AffirmationCard } from './AffirmationCard'
import { ListSkeleton } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { Grid, List, SortAsc, SortDesc } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Affirmation } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

export type SortOption = 'latest' | 'oldest' | 'alphabetical' | 'likes' | 'random'
export type ViewMode = 'grid' | 'list'

interface AffirmationListProps {
  affirmations: Affirmation[]
  loading?: boolean
  onAffirmationClick?: (affirmation: Affirmation) => void
  onShare?: (affirmation: Affirmation) => void
  sortBy?: SortOption
  onSortChange?: (sort: SortOption) => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  showSortControls?: boolean
  showViewControls?: boolean
  emptyMessage?: string
  className?: string
  itemsPerPage?: number
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'latest', label: '新しい順' },
  { value: 'oldest', label: '古い順' },
  { value: 'alphabetical', label: 'あいうえお順' },
  { value: 'likes', label: 'いいね数順' },
  { value: 'random', label: 'ランダム' },
]

export const AffirmationList: React.FC<AffirmationListProps> = ({
  affirmations,
  loading = false,
  onAffirmationClick,
  onShare,
  sortBy = 'latest',
  onSortChange,
  viewMode = 'list',
  onViewModeChange,
  showSortControls = true,
  showViewControls = true,
  emptyMessage = 'アファメーションが見つかりません',
  className,
  itemsPerPage = 20
}) => {
  const [currentPage, setCurrentPage] = useState(1)

  // ソート処理
  const sortedAffirmations = useMemo(() => {
    const sorted = [...affirmations]

    switch (sortBy) {
      case 'latest':
        return sorted.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'oldest':
        return sorted.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      case 'alphabetical':
        return sorted.sort((a, b) => a.text.localeCompare(b.text, 'ja'))
      case 'likes':
        // 実際のいいね数は UserContext から取得する必要があるが、
        // ここではサンプルとして適当な処理
        return sorted.sort((a, b) => (b.id.length - a.id.length))
      case 'random':
        return sorted.sort(() => Math.random() - 0.5)
      default:
        return sorted
    }
  }, [affirmations, sortBy])

  // ページネーション処理
  const totalPages = Math.ceil(sortedAffirmations.length / itemsPerPage)
  const paginatedAffirmations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedAffirmations.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedAffirmations, currentPage, itemsPerPage])

  // ページ変更
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // スクロール位置をトップに戻す
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ソート変更時のページリセット
  const handleSortChange = useCallback((newSort: SortOption) => {
    setCurrentPage(1)
    onSortChange?.(newSort)
  }, [onSortChange])

  // ビューモード変更時のページリセット
  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setCurrentPage(1)
    onViewModeChange?.(newMode)
  }, [onViewModeChange])

  // ローディング状態
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <ListSkeleton items={5} />
      </div>
    )
  }

  // 空状態
  if (affirmations.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
            <List className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-textSecondary font-medium">{emptyMessage}</p>
          <p className="text-sm text-textSecondary">
            フィルターを変更するか、新しいアファメーションを追加してみてください
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* コントロールバー */}
      {(showSortControls || showViewControls) && (
        <div className="flex items-center justify-between bg-surface rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* 結果件数 */}
            <div className="text-sm text-textSecondary">
              {affirmations.length}件のアファメーション
              {totalPages > 1 && (
                <span className="ml-2">
                  (ページ {currentPage} / {totalPages})
                </span>
              )}
            </div>

            {/* ソートコントロール */}
            {showSortControls && (
              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4 text-textSecondary" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent text-textPrimary focus:ring-2 focus:ring-primary/50"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ビューコントロール */}
          {showViewControls && (
            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                className="p-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* アファメーションリスト */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${currentPage}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
              : 'space-y-4'
          )}
        >
          {paginatedAffirmations.map((affirmation, index) => (
            <motion.div
              key={affirmation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              {viewMode === 'grid' ? (
                <AffirmationCard
                  affirmation={affirmation}
                  size="md"
                  showActions={true}
                  showAuthor={true}
                  showTranslation={true}
                  onShare={onShare}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onAffirmationClick?.(affirmation)}
                />
              ) : (
                <CompactAffirmationCard
                  affirmation={affirmation}
                  onClick={() => onAffirmationClick?.(affirmation)}
                  showAuthor={true}
                  showTranslation={false}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          {/* 前へボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            前へ
          </Button>

          {/* ページ番号 */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number

              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          {/* 次へボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            次へ
          </Button>
        </div>
      )}

      {/* ページ情報 */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-textSecondary">
          ページ {currentPage} / {totalPages} • 全 {affirmations.length} 件
        </div>
      )}
    </div>
  )
}

// ヘルパーコンポーネント：シンプルなリスト表示
interface SimpleAffirmationListProps {
  affirmations: Affirmation[]
  onAffirmationClick?: (affirmation: Affirmation) => void
  loading?: boolean
  className?: string
}

export const SimpleAffirmationList: React.FC<SimpleAffirmationListProps> = ({
  affirmations,
  onAffirmationClick,
  loading = false,
  className
}) => {
  if (loading) {
    return <ListSkeleton items={3} className={className} />
  }

  return (
    <div className={cn('space-y-3', className)}>
      {affirmations.map((affirmation) => (
        <CompactAffirmationCard
          key={affirmation.id}
          affirmation={affirmation}
          onClick={() => onAffirmationClick?.(affirmation)}
          showAuthor={false}
          showTranslation={false}
        />
      ))}
    </div>
  )
}