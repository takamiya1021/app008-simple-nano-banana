'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// Spinner Component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
    gray: 'text-gray-500'
  }

  return (
    <div className={cn('animate-spin', sizeClasses[size], colorClasses[color], className)}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

// Full Screen Loading
interface FullScreenLoadingProps {
  message?: string
  showLogo?: boolean
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  message = '読み込み中...',
  showLogo = true
}) => {
  return (
    <div className="fixed inset-0 bg-primary/5 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4 p-8">
        {showLogo && (
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gradient">Daily Affirmation</h2>
          </div>
        )}

        <Spinner size="lg" />

        <p className="text-textSecondary font-medium">{message}</p>
      </div>
    </div>
  )
}

// Skeleton Loading Components
interface SkeletonProps {
  className?: string
  animate?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  animate = true
}) => {
  return (
    <div
      className={cn(
        'bg-gray-300 dark:bg-gray-700 rounded',
        animate && 'animate-pulse',
        className
      )}
    />
  )
}

// Affirmation Card Skeleton
export const AffirmationCardSkeleton: React.FC = () => {
  return (
    <div className="affirmation-card p-8 min-h-[200px] rounded-3xl">
      <div className="flex flex-col justify-between h-full space-y-6">
        {/* Main text skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 w-full">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full mx-auto" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
          </div>
        </div>

        {/* Author skeleton */}
        <div className="text-center">
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>

        {/* Categories skeleton */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// List Skeleton
interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  className?: string
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 3,
  showAvatar = false,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-surface rounded-lg">
          {showAvatar && <Skeleton className="h-12 w-12 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Inline Loading (for buttons)
interface InlineLoadingProps {
  size?: 'sm' | 'md'
  className?: string
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 'sm',
  className
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Spinner size={size} />
      <span className="text-sm">処理中...</span>
    </div>
  )
}

// Loading with progress
interface LoadingWithProgressProps {
  progress: number
  message?: string
  className?: string
}

export const LoadingWithProgress: React.FC<LoadingWithProgressProps> = ({
  progress,
  message = 'データを読み込み中...',
  className
}) => {
  return (
    <div className={cn('text-center space-y-4', className)}>
      <Spinner size="lg" />

      <div className="space-y-2">
        <p className="text-textSecondary font-medium">{message}</p>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        <p className="text-xs text-textSecondary">
          {Math.round(progress)}% 完了
        </p>
      </div>
    </div>
  )
}

// Loading States for Different Scenarios
export const LoadingStates = {
  // Data fetching
  DataLoading: () => (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-2">
        <Spinner size="md" />
        <p className="text-sm text-textSecondary">データを読み込み中...</p>
      </div>
    </div>
  ),

  // App initialization
  AppLoading: () => (
    <FullScreenLoading
      message="アプリを準備中..."
      showLogo={true}
    />
  ),

  // Content loading
  ContentLoading: () => (
    <div className="space-y-6 p-6">
      <AffirmationCardSkeleton />
    </div>
  ),

  // Search loading
  SearchLoading: () => (
    <div className="flex items-center justify-center py-4">
      <div className="text-center space-y-2">
        <Spinner size="sm" />
        <p className="text-xs text-textSecondary">検索中...</p>
      </div>
    </div>
  ),
}