'use client'

import React, { useState, useRef } from 'react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { AffirmationCard } from '@/components/affirmation/AffirmationCard'
import { UserProvider } from '@/context/UserContext'
import { AffirmationProvider } from '@/context/AffirmationContext'
import { Affirmation, ThemeCategory, SceneCategory, AgeGroup } from '@/types'
import { Plus, Eye, Save, RefreshCw, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AddAffirmationPageContent: React.FC = () => {
  const [formData, setFormData] = useState({
    text: '',
    textEn: '',
    author: '',
    source: '',
    theme: '' as ThemeCategory | '',
    scene: '' as SceneCategory | '',
    ageGroup: '' as AgeGroup | '',
    tags: [] as string[]
  })

  const [previewAffirmation, setPreviewAffirmation] = useState<Affirmation | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // フォーム選択肢
  const themeOptions = [
    { value: '', label: 'テーマを選択してください' },
    { value: '自信', label: '自信・自己肯定' },
    { value: '愛', label: '愛・人間関係' },
    { value: '成功', label: '成功・達成' },
    { value: '健康', label: '健康・ウェルネス' },
    { value: '平和', label: '平和・穏やか' },
    { value: '成長', label: '成長・学び' },
    { value: '感謝', label: '感謝・満足' },
    { value: '希望', label: '希望・未来' }
  ]

  const sceneOptions = [
    { value: '', label: 'シーンを選択してください' },
    { value: '朝', label: '朝・起床時' },
    { value: '夜', label: '夜・就寝前' },
    { value: '仕事', label: '仕事・勉強中' },
    { value: '移動', label: '移動・通勤中' },
    { value: '休息', label: '休憩・リラックス時' },
    { value: '困難', label: '困難・挑戦時' },
    { value: '一般', label: '日常・いつでも' }
  ]

  const ageGroupOptions = [
    { value: '', label: '年代を選択してください' },
    { value: '20代', label: '20代向け' },
    { value: '30代', label: '30代向け' },
    { value: '40代', label: '40代向け' },
    { value: '50代', label: '50代向け' },
    { value: '60代', label: '60代向け' },
    { value: '全年代', label: '全年代向け' }
  ]

  // バリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.text.trim()) {
      newErrors.text = 'アファメーションの内容を入力してください'
    } else if (formData.text.length < 10) {
      newErrors.text = '10文字以上で入力してください'
    } else if (formData.text.length > 200) {
      newErrors.text = '200文字以内で入力してください'
    }

    if (!formData.theme) {
      newErrors.theme = 'テーマを選択してください'
    }

    if (!formData.scene) {
      newErrors.scene = 'シーンを選択してください'
    }

    if (!formData.ageGroup) {
      newErrors.ageGroup = '年代を選択してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // プレビュー作成
  const createPreview = () => {
    if (!validateForm()) return

    const preview: Affirmation = {
      id: `user-${Date.now()}`,
      text: formData.text.trim(),
      textEn: formData.textEn.trim() || undefined,
      author: formData.author.trim() || undefined,
      source: formData.source.trim() || 'あなたの投稿',
      categories: {
        theme: formData.theme as ThemeCategory,
        scene: formData.scene as SceneCategory,
        ageGroup: formData.ageGroup as AgeGroup
      },
      tags: formData.tags,
      createdAt: new Date().toISOString(),
      isUserGenerated: true
    }

    setPreviewAffirmation(preview)
    setShowPreview(true)
  }

  // 保存
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // ここで実際にはサーバーやローカルストレージに保存
      await new Promise(resolve => setTimeout(resolve, 1500)) // 保存処理のシミュレーション

      setSubmitSuccess(true)

      // 3秒後にフォームをリセット
      setTimeout(() => {
        setFormData({
          text: '',
          textEn: '',
          author: '',
          source: '',
          theme: '',
          scene: '',
          ageGroup: '',
          tags: []
        })
        setPreviewAffirmation(null)
        setShowPreview(false)
        setSubmitSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('保存エラー:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // フォーム入力変更
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // エラークリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // サンプルテキスト挿入
  const insertSample = () => {
    const samples = [
      '私は毎日新しい可能性を見つけ、成長し続けています。',
      '私には無限の可能性があり、夢を実現する力があります。',
      '今日という日は、私にとって特別で価値のある一日です。',
      '私は自分を愛し、他者を愛し、愛に満ちた人生を送っています。'
    ]
    const sample = samples[Math.floor(Math.random() * samples.length)]
    setFormData(prev => ({ ...prev, text: sample }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header
        title="アファメーション追加"
        showBackButton={true}
        onBackClick={() => window.history.back()}
      />

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* ページヘッダー */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient">新しいアファメーション</h1>
            </div>
            <p className="text-textSecondary">
              あなたの心に響く言葉をみんなとシェアしましょう
            </p>
          </motion.div>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* 成功メッセージ */}
          <AnimatePresence>
            {submitSuccess && (
              <motion.div
                className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-2xl p-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  アファメーションが保存されました！
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  ありがとうございます。あなたの言葉が誰かの心を支えます。
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* フォーム */}
          <motion.div
            className="bg-surface rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-6 space-y-6">
              {/* メインテキスト */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-textPrimary">
                    アファメーション <span className="text-red-500">*</span>
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertSample}
                    className="text-xs flex items-center space-x-1"
                  >
                    <Lightbulb className="w-3 h-3" />
                    <span>サンプル</span>
                  </Button>
                </div>
                <Textarea
                  ref={textareaRef}
                  placeholder="心に響くアファメーションを入力してください..."
                  value={formData.text}
                  onChange={(e) => handleInputChange('text', e.target.value)}
                  error={errors.text}
                  rows={4}
                  className="resize-none"
                />
                <div className="mt-1 text-right">
                  <span className={`text-xs ${formData.text.length > 180 ? 'text-red-500' : 'text-textSecondary'}`}>
                    {formData.text.length}/200
                  </span>
                </div>
              </div>

              {/* 英語版（オプション） */}
              <Input
                label="英語版（オプション）"
                placeholder="English version (optional)"
                value={formData.textEn}
                onChange={(e) => handleInputChange('textEn', e.target.value)}
                helperText="英語版があると海外の方にも届きます"
              />

              {/* カテゴリ選択 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="テーマ"
                  options={themeOptions}
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  error={errors.theme}
                />

                <Select
                  label="シーン"
                  options={sceneOptions}
                  value={formData.scene}
                  onChange={(e) => handleInputChange('scene', e.target.value)}
                  error={errors.scene}
                />

                <Select
                  label="年代"
                  options={ageGroupOptions}
                  value={formData.ageGroup}
                  onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                  error={errors.ageGroup}
                />
              </div>

              {/* 著者・出典 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="著者（オプション）"
                  placeholder="例: 心理学者 田中太郎"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                />

                <Input
                  label="出典（オプション）"
                  placeholder="例: 書籍「心の力」より"
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                />
              </div>
            </div>

            {/* アクションボタン */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex flex-col sm:flex-row gap-3">
              <Button
                variant="ghost"
                onClick={createPreview}
                disabled={!formData.text.trim()}
                className="flex items-center space-x-2 sm:order-1"
              >
                <Eye className="w-4 h-4" />
                <span>プレビュー</span>
              </Button>

              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.text.trim()}
                className="flex items-center space-x-2 sm:order-2 flex-1"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.div>
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>保存する</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* プレビュー */}
          <AnimatePresence>
            {showPreview && previewAffirmation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-textPrimary">プレビュー</h3>
                  <p className="text-sm text-textSecondary">実際の表示はこのようになります</p>
                </div>

                <AffirmationCard
                  affirmation={previewAffirmation}
                  size="lg"
                  showActions={false}
                  showAuthor={true}
                  showTranslation={true}
                  className="max-w-md mx-auto"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ガイドライン */}
          <motion.div
            className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
              📝 良いアファメーションのコツ
            </h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li>• ポジティブで前向きな言葉を使いましょう</li>
              <li>• 現在形で書くと効果的です（「〜します」「〜です」）</li>
              <li>• 具体的で、心に響く表現を心がけましょう</li>
              <li>• 他の人を傷つけるような内容は避けてください</li>
              <li>• 自分が本当に信じられる言葉を選びましょう</li>
            </ul>
          </motion.div>
        </div>
      </main>

      <Navigation />
    </div>
  )
}

export default function AddAffirmationPage() {
  return (
    <UserProvider>
      <AffirmationProvider>
        <AddAffirmationPageContent />
      </AffirmationProvider>
    </UserProvider>
  )
}