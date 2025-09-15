import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSSのクラス名を効率的にマージ
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 日付フォーマット関連のユーティリティ
 */
export const formatDate = {
  /**
   * 日本語の日付フォーマット（2024年12月31日）
   */
  japanese: (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  /**
   * 相対時間フォーマット（3時間前、昨日など）
   */
  relative: (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`

    return formatDate.japanese(d)
  },

  /**
   * 時刻フォーマット（09:30）
   */
  time: (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  },

  /**
   * ISO日付のみ（YYYY-MM-DD）
   */
  isoDate: (date: Date | string) => {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }
}

/**
 * 数値フォーマット関連のユーティリティ
 */
export const formatNumber = {
  /**
   * 日本語の数値フォーマット（1,234）
   */
  japanese: (num: number) => {
    return num.toLocaleString('ja-JP')
  },

  /**
   * パーセンテージフォーマット（85%）
   */
  percentage: (num: number, decimals: number = 0) => {
    return `${num.toFixed(decimals)}%`
  },

  /**
   * ファイルサイズフォーマット（1.2MB）
   */
  fileSize: (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'

    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
}

/**
 * 文字列操作のユーティリティ
 */
export const stringUtils = {
  /**
   * テキストの切り詰め
   */
  truncate: (text: string, maxLength: number, suffix: string = '...') => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - suffix.length) + suffix
  },

  /**
   * 改行をHTMLの<br>に変換
   */
  lineBreaksToBr: (text: string) => {
    return text.replace(/\n/g, '<br>')
  },

  /**
   * HTMLタグを除去
   */
  stripHtml: (html: string) => {
    return html.replace(/<[^>]*>/g, '')
  },

  /**
   * 文字列をケバブケースに変換
   */
  toKebabCase: (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  },

  /**
   * 文字列の最初の文字を大文字に
   */
  capitalize: (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

/**
 * 配列操作のユーティリティ
 */
export const arrayUtils = {
  /**
   * 配列をランダムにシャッフル
   */
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  },

  /**
   * 配列から重複を除去
   */
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)]
  },

  /**
   * 配列をチャンクに分割
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  },

  /**
   * 配列からランダムな要素を取得
   */
  random: <T>(array: T[]): T | undefined => {
    if (array.length === 0) return undefined
    return array[Math.floor(Math.random() * array.length)]
  }
}

/**
 * オブジェクト操作のユーティリティ
 */
export const objectUtils = {
  /**
   * オブジェクトから指定されたキーのみを抽出
   */
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key]
      }
    }
    return result
  },

  /**
   * オブジェクトから指定されたキーを除外
   */
  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj }
    for (const key of keys) {
      delete result[key]
    }
    return result
  },

  /**
   * 深いマージ
   */
  deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = objectUtils.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key] as T[Extract<keyof T, string>]
      }
    }

    return result
  }
}

/**
 * 色関連のユーティリティ
 */
export const colorUtils = {
  /**
   * HEXカラーをRGBAに変換
   */
  hexToRgba: (hex: string, alpha: number = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return null

    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
  },

  /**
   * 色の明度を判定（暗い色かどうか）
   */
  isDark: (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return false

    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)

    // YIQ equation for luminance
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq < 128
  }
}

/**
 * デバイス・ブラウザ検出のユーティリティ
 */
export const deviceUtils = {
  /**
   * モバイルデバイスの検出
   */
  isMobile: () => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },

  /**
   * タッチデバイスの検出
   */
  isTouch: () => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  /**
   * iOS の検出
   */
  isIOS: () => {
    if (typeof window === 'undefined') return false
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  },

  /**
   * PWA の検出（スタンドアロンモード）
   */
  isPWA: () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches
  }
}

/**
 * DOM操作のユーティリティ
 */
export const domUtils = {
  /**
   * 要素が表示領域に入っているかチェック
   */
  isInViewport: (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  },

  /**
   * スムーズスクロール
   */
  scrollTo: (element: HTMLElement | string, offset: number = 0) => {
    const target = typeof element === 'string' ? document.querySelector(element) : element
    if (!target) return

    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  },

  /**
   * クリップボードにコピー
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    if (!navigator.clipboard) {
      // フォールバック
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }

    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Failed to copy text: ', err)
      return false
    }
  }
}

/**
 * 睡眠・待機のユーティリティ
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * デバウンス関数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitFor: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), waitFor)
  }
}

/**
 * スロットル関数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}