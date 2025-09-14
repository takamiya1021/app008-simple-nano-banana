'use client'

import React, { forwardRef, InputHTMLAttributes, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Base Input Props
interface BaseInputProps {
  label?: string
  error?: string
  helperText?: string
  className?: string
  containerClassName?: string
}

// Text Input Props
interface TextInputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  variant?: 'default' | 'search'
}

// Select Props
interface SelectProps extends BaseInputProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
}

// Text Input Component
export const Input = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, className, containerClassName, variant = 'default', ...props }, ref) => {
    const inputClasses = cn(
      // Base styles
      'flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200',
      'placeholder:text-textSecondary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',

      // Variant styles
      {
        'border-gray-300 dark:border-gray-600 bg-surface text-textPrimary': variant === 'default',
        'border-gray-300 dark:border-gray-600 bg-surface text-textPrimary pl-10': variant === 'search',
      },

      // State styles
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : 'focus:border-primary focus:ring-primary/20',
      'focus:ring-2',

      className
    )

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-textPrimary">
            {label}
          </label>
        )}

        <div className="relative">
          {variant === 'search' && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}

          <input
            className={inputClasses}
            ref={ref}
            {...props}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 flex items-center mt-1">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-sm text-textSecondary">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Select Component
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, containerClassName, options, placeholder, ...props }, ref) => {
    const selectClasses = cn(
      // Base styles
      'flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200',
      'bg-surface text-textPrimary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',

      // State styles
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20',
      'focus:ring-2',

      className
    )

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-textPrimary">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            className={selectClasses}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-4 w-4 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 flex items-center mt-1">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-sm text-textSecondary">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

// Textarea Component
interface TextareaProps extends BaseInputProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, containerClassName, resize = 'vertical', ...props }, ref) => {
    const textareaClasses = cn(
      // Base styles
      'flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200',
      'placeholder:text-textSecondary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      'bg-surface text-textPrimary',

      // Resize styles
      {
        'resize-none': resize === 'none',
        'resize': resize === 'both',
        'resize-x': resize === 'horizontal',
        'resize-y': resize === 'vertical',
      },

      // State styles
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20',
      'focus:ring-2',

      className
    )

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-textPrimary">
            {label}
          </label>
        )}

        <textarea
          className={textareaClasses}
          ref={ref}
          {...props}
        />

        {error && (
          <p className="text-sm text-red-500 flex items-center mt-1">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-sm text-textSecondary">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'