'use client'

import React, { useState } from 'react'
import { Heart, BookmarkPlus, BookmarkMinus, Copy, Share2, Globe } from 'lucide-react'
import { Affirmation } from '@/types'
import { useUserActivity } from '@/context/UserContext'
import { Button, IconButton } from '@/components/ui/Button'
import { cn, domUtils } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface AffirmationCardProps {
  affirmation: Affirmation
  showActions?: boolean
  showAuthor?: boolean
  showTranslation?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onShare?: (affirmation: Affirmation) => void
}

export const AffirmationCard: React.FC<AffirmationCardProps> = ({
  affirmation,
  showActions = true,
  showAuthor = true,
  showTranslation = true,
  className,
  size = 'md',
  onShare,
}) => {
  const { activity, addFavorite, removeFavorite, toggleLike } = useUserActivity()
  const [showEnglish, setShowEnglish] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const isFavorite = activity.favorites.includes(affirmation.id)
  const isLiked = activity.likes.includes(affirmation.id)
  const hasEnglish = Boolean(affirmation.textEn)

  // サイズ別スタイル
  const sizeStyles = {
    sm: {
      container: 'p-4 min-h-[120px]',
      text: 'text-sm leading-relaxed',
      author: 'text-xs',
      button: 'h-8 w-8',
    },
    md: {
      container: 'p-6 min-h-[160px]',
      text: 'text-base leading-relaxed',
      author: 'text-sm',
      button: 'h-10 w-10',
    },
    lg: {
      container: 'p-8 min-h-[200px]',
      text: 'text-lg leading-relaxed',
      author: 'text-base',
      button: 'h-12 w-12',
    },
    xl: {
      container: 'p-10 min-h-[240px]',
      text: 'text-xl leading-relaxed',
      author: 'text-lg',
      button: 'h-14 w-14',
    },
  }

  const currentSize = sizeStyles[size]

  // お気に入りの切り替え
  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFavorite(affirmation.id)
    } else {
      addFavorite(affirmation.id)
    }
  }

  // いいねの切り替え
  const handleLikeToggle = () => {
    toggleLike(affirmation.id)
  }

  // コピー機能
  const handleCopy = async () => {
    const textToCopy = showEnglish && affirmation.textEn
      ? `${affirmation.textEn}\n${affirmation.text}`
      : affirmation.text

    const success = await domUtils.copyToClipboard(textToCopy)
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  // シェア機能
  const handleShare = () => {
    if (onShare) {
      onShare(affirmation)
    }
  }

  // 言語切り替え
  const toggleLanguage = () => {
    if (hasEnglish) {
      setShowEnglish(!showEnglish)
    }
  }

  // テキスト表示の決定
  const displayText = showEnglish && affirmation.textEn ? affirmation.textEn : affirmation.text

  return (
    <motion.div
      className={cn(
        'affirmation-card rounded-3xl',
        'flex flex-col justify-between',
        'transition-all duration-300',
        currentSize.container,
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {/* メインテキスト */}
      <div className="flex-1 flex items-center justify-center">
        <motion.p
          key={showEnglish ? 'en' : 'ja'} // 言語切り替え時のアニメーション用
          className={cn(
            'text-center font-medium',
            'text-textPrimary',
            currentSize.text
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {displayText}
        </motion.p>
      </div>

      {/* 著者・出典情報 */}
      {showAuthor && (affirmation.author || affirmation.source) && (
        <div className="mt-4 text-center">
          <p className={cn('text-textSecondary italic', currentSize.author)}>
            {affirmation.author && `— ${affirmation.author}`}
            {affirmation.author && affirmation.source && ' '}
            {affirmation.source && `（${affirmation.source}）`}
          </p>
        </div>
      )}

      {/* カテゴリー情報 */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
          {affirmation.categories.theme}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/10 text-secondary">
          {affirmation.categories.scene}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
          {affirmation.categories.ageGroup}
        </span>
      </div>

      {/* アクションボタン */}
      {showActions && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {/* いいねボタン */}
          <IconButton
            icon={
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors',
                  isLiked ? 'fill-red-500 text-red-500' : 'text-textSecondary hover:text-red-500'
                )}
              />
            }
            variant="ghost"
            size="md"
            aria-label={isLiked ? 'いいねを取り消す' : 'いいねする'}
            onClick={handleLikeToggle}
            className={cn(currentSize.button, 'hover:bg-red-50 dark:hover:bg-red-900/20')}
          />

          {/* お気に入りボタン */}
          <IconButton
            icon={
              isFavorite ? (
                <BookmarkMinus className="w-5 h-5 fill-primary text-primary" />
              ) : (
                <BookmarkPlus className="w-5 h-5 text-textSecondary hover:text-primary" />
              )
            }
            variant="ghost"
            size="md"
            aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            onClick={handleFavoriteToggle}
            className={cn(currentSize.button, 'hover:bg-primary/10')}
          />

          {/* 言語切り替えボタン（英語版がある場合） */}
          {showTranslation && hasEnglish && (
            <IconButton
              icon={<Globe className="w-5 h-5" />}
              variant="ghost"
              size="md"
              aria-label={showEnglish ? '日本語で表示' : '英語で表示'}
              onClick={toggleLanguage}
              className={cn(
                currentSize.button,
                'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                showEnglish ? 'text-blue-600' : 'text-textSecondary hover:text-blue-600'
              )}
            />
          )}

          {/* コピーボタン */}
          <IconButton
            icon={<Copy className="w-5 h-5" />}
            variant="ghost"
            size="md"
            aria-label="テキストをコピー"
            onClick={handleCopy}
            className={cn(
              currentSize.button,
              'hover:bg-green-50 dark:hover:bg-green-900/20',
              copySuccess ? 'text-green-600' : 'text-textSecondary hover:text-green-600'
            )}
          />

          {/* シェアボタン */}
          {onShare && (
            <IconButton
              icon={<Share2 className="w-5 h-5" />}
              variant="ghost"
              size="md"
              aria-label="シェアする"
              onClick={handleShare}
              className={cn(currentSize.button, 'hover:bg-orange-50 dark:hover:bg-orange-900/20 text-textSecondary hover:text-orange-600')}
            />
          )}
        </div>
      )}

      {/* コピー成功メッセージ */}
      {copySuccess && (
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <span className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
            コピーしました！
          </span>
        </motion.div>
      )}

      {/* 言語表示インジケーター */}
      {showTranslation && hasEnglish && showEnglish && (
        <div className="mt-2 text-center">
          <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
            English
          </span>
        </div>
      )}
    </motion.div>
  )
}

// コンパクト版（リスト表示用）
export interface CompactAffirmationCardProps extends Omit<AffirmationCardProps, 'size' | 'showActions'> {
  onClick?: () => void
}

export const CompactAffirmationCard: React.FC<CompactAffirmationCardProps> = ({
  affirmation,
  onClick,
  className,
  ...props
}) => {
  const { activity } = useUserActivity()
  const isFavorite = activity.favorites.includes(affirmation.id)
  const isLiked = activity.likes.includes(affirmation.id)

  return (
    <motion.div
      className={cn(
        'bg-surface rounded-2xl p-4 shadow-sm hover:shadow-md',
        'cursor-pointer transition-all duration-200',
        'border border-transparent hover:border-primary/20',
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <p className="text-sm text-textPrimary line-clamp-3">
        {affirmation.text}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
            {affirmation.categories.theme}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isLiked && <Heart className="w-4 h-4 fill-red-500 text-red-500" />}
          {isFavorite && <BookmarkPlus className="w-4 h-4 fill-primary text-primary" />}
        </div>
      </div>
    </motion.div>
  )
}