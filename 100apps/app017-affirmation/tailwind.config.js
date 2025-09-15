/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // ダークモード対応（classベース）
  theme: {
    extend: {
      // カスタムカラーパレット（温かみのある癒し系）
      colors: {
        // ライトモード
        primary: '#F4A261',     // 温かいオレンジ
        secondary: '#E9C46A',   // 優しい黄色
        accent: '#E76F51',      // アクセントオレンジ
        surface: '#FFFFFF',     // 白い表面
        background: '#F8F9FA',  // 明るい背景
        textPrimary: '#2A2A2A', // 主要テキスト
        textSecondary: '#6B6B6B', // 副次テキスト

        // ダークモード
        'dark-primary': '#D4924A',     // ダーク用オレンジ
        'dark-secondary': '#C9A952',   // ダーク用黄色
        'dark-accent': '#C7553E',      // ダーク用アクセント
        'dark-surface': '#1F2937',     // ダーク表面
        'dark-background': '#111827',  // ダーク背景
        'dark-textPrimary': '#F9FAFB', // ダーク主要テキスト
        'dark-textSecondary': '#D1D5DB', // ダーク副次テキスト
      },

      // フォントファミリー
      fontFamily: {
        'sans': ['Inter', 'Noto Sans JP', 'ui-sans-serif', 'system-ui'],
        'heading': ['Inter', 'Noto Sans JP', 'ui-sans-serif', 'system-ui'],
      },

      // カスタムスペーシング
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },

      // カスタム境界線半径
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },

      // カスタムシャドウ
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },

      // アニメーション
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      // ブレイクポイント（モバイルファースト）
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    // フォーム要素のスタイリング
    require('@tailwindcss/forms'),
    // アスペクト比ユーティリティ
    require('@tailwindcss/aspect-ratio'),
  ],
}