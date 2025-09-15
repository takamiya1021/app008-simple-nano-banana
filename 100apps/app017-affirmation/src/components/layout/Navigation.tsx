'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Heart,
  Search,
  Plus,
  Settings,
  Star,
  Filter,
  Calendar,
  User
} from 'lucide-react'

interface NavigationItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number | string
}

interface NavigationProps {
  className?: string
  variant?: 'bottom' | 'sidebar'
  showLabels?: boolean
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: '/',
    label: 'ホーム',
    icon: <Home className="w-5 h-5" />
  },
  {
    href: '/daily-special',
    label: '今日の特別',
    icon: <Star className="w-5 h-5" />
  },
  {
    href: '/categories',
    label: 'カテゴリ',
    icon: <Filter className="w-5 h-5" />
  },
  {
    href: '/favorites',
    label: 'お気に入り',
    icon: <Heart className="w-5 h-5" />
  },
  {
    href: '/add-affirmation',
    label: '追加',
    icon: <Plus className="w-5 h-5" />
  }
]

export const Navigation: React.FC<NavigationProps> = ({
  className,
  variant = 'bottom',
  showLabels = true
}) => {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const navigationContent = (
    <>
      {NAVIGATION_ITEMS.map((item) => {
        const active = isActive(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center justify-center p-3 rounded-lg transition-all duration-200',
              variant === 'bottom' ? 'flex-col space-y-1' : 'flex-row space-x-3 w-full',

              // Active states
              active
                ? 'text-primary bg-primary/10 scale-105'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5',

              // Interactive states
              'active:scale-95 tap-highlight-transparent',

              // Focus states
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2'
            )}
          >
            <div className={cn('relative', active && 'animate-gentle-pulse')}>
              {item.icon}

              {/* Badge */}
              {item.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>

            {showLabels && (
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  variant === 'bottom' ? 'text-center' : '',
                  active ? 'text-primary' : 'text-gray-600 dark:text-gray-300'
                )}
              >
                {item.label}
              </span>
            )}
          </Link>
        )
      })}
    </>
  )

  if (variant === 'bottom') {
    return (
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30',
          'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm',
          'border-t border-gray-200 dark:border-gray-700',
          'safe-area-inset-bottom',
          className
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navigationContent}
          </div>
        </div>
      </nav>
    )
  }

  // Sidebar variant
  return (
    <nav
      className={cn(
        'fixed left-0 top-0 bottom-0 z-20 w-64',
        'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
        'safe-area-inset-left',
        className
      )}
    >
      <div className="p-6 space-y-2">
        {navigationContent}
      </div>
    </nav>
  )
}

// タブバー風のナビゲーション
export const TabNavigation: React.FC<{
  items: Array<{ key: string; label: string; icon: React.ReactNode }>
  activeKey: string
  onChange: (key: string) => void
  className?: string
}> = ({ items, activeKey, onChange, className }) => {
  return (
    <div
      className={cn(
        'flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={cn(
            'flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all duration-200',
            'text-sm font-medium',
            activeKey === item.key
              ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
              : 'text-textSecondary hover:text-textPrimary'
          )}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

// ブレッドクラム
interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg className="w-4 h-4 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}

          {item.href ? (
            <Link
              href={item.href}
              className="text-textSecondary hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-textPrimary font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// ファブ（フローティングアクションボタン）
interface FabProps {
  onClick: () => void
  icon: React.ReactNode
  label?: string
  className?: string
}

export const Fab: React.FC<FabProps> = ({ onClick, icon, label, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-20 right-6 z-30',
        'w-14 h-14 bg-primary text-white rounded-full shadow-lg',
        'flex items-center justify-center',
        'hover:bg-primary/90 active:scale-95',
        'transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-primary/50',
        className
      )}
      aria-label={label}
    >
      {icon}
    </button>
  )
}

// ページナビゲーション（前へ・次へ）
interface PageNavigationProps {
  prevHref?: string
  nextHref?: string
  prevLabel?: string
  nextLabel?: string
  className?: string
}

export const PageNavigation: React.FC<PageNavigationProps> = ({
  prevHref,
  nextHref,
  prevLabel = '前へ',
  nextLabel = '次へ',
  className
}) => {
  return (
    <nav className={cn('flex items-center justify-between', className)}>
      {prevHref ? (
        <Link
          href={prevHref}
          className="flex items-center space-x-2 text-textSecondary hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>{prevLabel}</span>
        </Link>
      ) : (
        <div />
      )}

      {nextHref ? (
        <Link
          href={nextHref}
          className="flex items-center space-x-2 text-textSecondary hover:text-primary transition-colors"
        >
          <span>{nextLabel}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}