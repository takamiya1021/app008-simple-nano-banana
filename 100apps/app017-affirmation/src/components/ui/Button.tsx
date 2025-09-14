'use client'

import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

// ボタンのバリアント定義
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'ghost'
  | 'outline'

// ボタンのサイズ定義
export type ButtonSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

// スタイルマッピング
const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary text-white
    hover:bg-primary/90
    active:bg-primary/80
    shadow-sm hover:shadow-md
    border-transparent
  `,
  secondary: `
    bg-secondary text-textPrimary
    hover:bg-secondary/90
    active:bg-secondary/80
    shadow-sm hover:shadow-md
    border-transparent
  `,
  accent: `
    bg-accent text-white
    hover:bg-accent/90
    active:bg-accent/80
    shadow-sm hover:shadow-md
    border-transparent
  `,
  ghost: `
    bg-transparent text-textPrimary
    hover:bg-surface/50
    active:bg-surface/70
    border-transparent
  `,
  outline: `
    bg-transparent text-textPrimary
    border-2 border-primary/20
    hover:border-primary/40 hover:bg-primary/5
    active:bg-primary/10
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-base h-10',
  lg: 'px-6 py-3 text-lg h-12',
  xl: 'px-8 py-4 text-xl h-14',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        className={cn(
          // ベーススタイル
          `
            inline-flex items-center justify-center
            font-medium rounded-xl
            border transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
            touch-manipulation tap-highlight-transparent
            select-none
          `,
          // バリアントスタイル
          variantStyles[variant],
          // サイズスタイル
          sizeStyles[size],
          // ローディング時の追加スタイル
          isLoading && 'cursor-wait',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* 左アイコンまたはローディングスピナー */}
        {isLoading ? (
          <div className="mr-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          </div>
        ) : leftIcon ? (
          <div className="mr-2 flex items-center">{leftIcon}</div>
        ) : null}

        {/* ボタンテキスト */}
        <span className={isLoading ? 'opacity-70' : ''}>
          {children}
        </span>

        {/* 右アイコン */}
        {rightIcon && !isLoading && (
          <div className="ml-2 flex items-center">{rightIcon}</div>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// プリセットボタンコンポーネント
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
)

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
)

export const AccentButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="accent" {...props} />
)

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
)

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
)

// アイコンボタン（正方形）
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'md', ...props }, ref) => {
    const iconSizeStyles: Record<ButtonSize, string> = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-14 h-14',
    }

    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          'p-0',
          iconSizeStyles[size],
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-center">
          {icon}
        </div>
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

// フローティングアクションボタン
export interface FABProps extends Omit<ButtonProps, 'size' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const FloatingActionButton: React.FC<FABProps> = ({
  icon,
  className,
  ...props
}) => (
  <Button
    size="lg"
    className={cn(
      'rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl',
      'fixed bottom-6 right-6 z-50',
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-center">
      {icon}
    </div>
  </Button>
)