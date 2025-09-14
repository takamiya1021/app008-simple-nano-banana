'use client'

import React, { useState, useCallback } from 'react'
import { Select, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ThemeCategory,
  SceneCategory,
  AgeGroup,
  AffirmationFilters
} from '@/types'

interface FilterBarProps {
  filters: AffirmationFilters
  onFiltersChange: (filters: Partial<AffirmationFilters>) => void
  onSearch: (query: string) => void
  onClear: () => void
  className?: string
}

// フィルター選択肢の定義
const THEME_OPTIONS = [
  { value: '', label: 'すべてのテーマ' },
  { value: '自信', label: '自信・自己肯定' },
  { value: '愛', label: '愛・人間関係' },
  { value: '成功', label: '成功・達成' },
  { value: '健康', label: '健康・ウェルネス' },
  { value: '平和', label: '平和・穏やか' },
  { value: '成長', label: '成長・学び' },
  { value: '感謝', label: '感謝・満足' },
  { value: '希望', label: '希望・未来' },
]

const SCENE_OPTIONS = [
  { value: '', label: 'すべてのシーン' },
  { value: '朝', label: '朝・起床時' },
  { value: '夜', label: '夜・就寝前' },
  { value: '仕事', label: '仕事・勉強中' },
  { value: '移動', label: '移動・通勤中' },
  { value: '休息', label: '休憩・リラックス時' },
  { value: '困難', label: '困難・挑戦時' },
  { value: '一般', label: '日常・いつでも' },
]

const AGE_GROUP_OPTIONS = [
  { value: '', label: 'すべての年代' },
  { value: '20代', label: '20代向け' },
  { value: '30代', label: '30代向け' },
  { value: '40代', label: '40代向け' },
  { value: '50代', label: '50代向け' },
  { value: '60代', label: '60代向け' },
  { value: '全年代', label: '全年代向け' },
]

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')

  // アクティブなフィルター数をカウント
  const activeFiltersCount = Object.values(filters).filter(value =>
    value !== undefined && value !== '' && value !== false
  ).length

  // 検索実行
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }, [onSearch])

  // フィルター変更
  const handleFilterChange = useCallback((key: keyof AffirmationFilters, value: any) => {
    onFiltersChange({ [key]: value || undefined })
  }, [onFiltersChange])

  // 全クリア
  const handleClearAll = useCallback(() => {
    setSearchQuery('')
    onClear()
  }, [onClear])

  // お気に入りのみの切り替え
  const toggleFavoritesOnly = useCallback(() => {
    handleFilterChange('onlyFavorites', !filters.onlyFavorites)
  }, [filters.onlyFavorites, handleFilterChange])

  return (
    <div className={cn('bg-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      {/* メインフィルターバー */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          {/* 検索入力 */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="キーワードで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery)
                }
              }}
              variant="search"
              className="border-0 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* 検索ボタン */}
          <Button
            variant="primary"
            size="md"
            onClick={() => handleSearch(searchQuery)}
            className="px-4"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* 詳細フィルター切り替え */}
          <Button
            variant="ghost"
            size="md"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'relative px-3',
              activeFiltersCount > 0 && 'text-primary'
            )}
          >
            <Filter className="w-4 h-4" />
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 ml-1" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-1" />
            )}

            {/* アクティブフィルター数のバッジ */}
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* クリアボタン */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-gray-500 hover:text-red-500 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 展開された詳細フィルター */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* テーマフィルター */}
            <Select
              label="テーマ"
              options={THEME_OPTIONS}
              value={filters.theme || ''}
              onChange={(e) => handleFilterChange('theme', e.target.value as ThemeCategory)}
              placeholder="テーマを選択"
            />

            {/* シーンフィルター */}
            <Select
              label="シーン"
              options={SCENE_OPTIONS}
              value={filters.scene || ''}
              onChange={(e) => handleFilterChange('scene', e.target.value as SceneCategory)}
              placeholder="シーンを選択"
            />

            {/* 年代フィルター */}
            <Select
              label="年代"
              options={AGE_GROUP_OPTIONS}
              value={filters.ageGroup || ''}
              onChange={(e) => handleFilterChange('ageGroup', e.target.value as AgeGroup)}
              placeholder="年代を選択"
            />
          </div>

          {/* 追加オプション */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* お気に入りのみ */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlyFavorites || false}
                onChange={toggleFavoritesOnly}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-textPrimary">お気に入りのみ</span>
            </label>

            {/* 英語版ありのみ */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasEnglish || false}
                onChange={() => handleFilterChange('hasEnglish', !filters.hasEnglish)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-textPrimary">英語版あり</span>
            </label>

            {/* ユーザー投稿のみ */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlyUserGenerated || false}
                onChange={() => handleFilterChange('onlyUserGenerated', !filters.onlyUserGenerated)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-textPrimary">自分の投稿のみ</span>
            </label>
          </div>

          {/* 適用・クリアボタン */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-textSecondary">
              {activeFiltersCount > 0
                ? `${activeFiltersCount}個のフィルターが適用中`
                : 'フィルターなし'
              }
            </p>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={activeFiltersCount === 0}
              >
                すべてクリア
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                適用
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* アクティブフィルターの表示（簡略版） */}
      {!isExpanded && activeFiltersCount > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <div className="flex flex-wrap gap-2">
            {filters.theme && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                テーマ: {filters.theme}
                <button
                  onClick={() => handleFilterChange('theme', undefined)}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.scene && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/10 text-secondary">
                シーン: {filters.scene}
                <button
                  onClick={() => handleFilterChange('scene', undefined)}
                  className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.ageGroup && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                年代: {filters.ageGroup}
                <button
                  onClick={() => handleFilterChange('ageGroup', undefined)}
                  className="ml-1 hover:bg-accent/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.onlyFavorites && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                お気に入りのみ
                <button
                  onClick={() => handleFilterChange('onlyFavorites', false)}
                  className="ml-1 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}