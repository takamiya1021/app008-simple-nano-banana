import { Affirmation, AffirmationFilters, ThemeCategory, SceneCategory, AgeGroup, Language } from '@/types'
import { UserActivityStorage, UserSettingsStorage } from './storage'
import affirmationsData from '@/data/affirmations.json'

export class AffirmationService {
  private static affirmations: Affirmation[] = []
  private static isInitialized = false

  /**
   * サービスの初期化
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // JSONデータからアファメーションを読み込み
      this.affirmations = affirmationsData.affirmations as Affirmation[]

      // ユーザー追加のアファメーションも統合
      const userActivity = UserActivityStorage.get()
      if (userActivity.userAffirmations.length > 0) {
        this.affirmations = [...this.affirmations, ...userActivity.userAffirmations]
      }

      this.isInitialized = true
      console.log(`Loaded ${this.affirmations.length} affirmations`)
    } catch (error) {
      console.error('Failed to initialize AffirmationService:', error)
      throw error
    }
  }

  /**
   * 全アファメーションを取得
   */
  static getAllAffirmations(): Affirmation[] {
    if (!this.isInitialized) {
      throw new Error('AffirmationService is not initialized')
    }
    return [...this.affirmations]
  }

  /**
   * IDでアファメーションを取得
   */
  static getById(id: string): Affirmation | null {
    if (!this.isInitialized) {
      throw new Error('AffirmationService is not initialized')
    }
    return this.affirmations.find(aff => aff.id === id) || null
  }

  /**
   * フィルターに基づいてアファメーションを取得
   */
  static getFiltered(filters: AffirmationFilters): Affirmation[] {
    if (!this.isInitialized) {
      throw new Error('AffirmationService is not initialized')
    }

    let filtered = [...this.affirmations]

    // テーマフィルター
    if (filters.theme) {
      filtered = filtered.filter(aff => aff.categories.theme === filters.theme)
    }

    // シーンフィルター
    if (filters.scene) {
      filtered = filtered.filter(aff => aff.categories.scene === filters.scene)
    }

    // 年代フィルター
    if (filters.ageGroup) {
      filtered = filtered.filter(aff => aff.categories.ageGroup === filters.ageGroup)
    }

    // 言語フィルター
    if (filters.language) {
      filtered = filtered.filter(aff => aff.language === filters.language)
    }

    // お気に入りフィルター
    if (filters.onlyFavorites) {
      const userActivity = UserActivityStorage.get()
      filtered = filtered.filter(aff => userActivity.favorites.includes(aff.id))
    }

    // 検索クエリフィルター
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(aff =>
        aff.text.toLowerCase().includes(query) ||
        (aff.textEn && aff.textEn.toLowerCase().includes(query)) ||
        (aff.author && aff.author.toLowerCase().includes(query))
      )
    }

    return filtered
  }

  /**
   * ランダムなアファメーションを取得
   */
  static getRandomAffirmation(filters?: AffirmationFilters): Affirmation | null {
    const affirmations = filters ? this.getFiltered(filters) : this.getAllAffirmations()

    if (affirmations.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * affirmations.length)
    return affirmations[randomIndex]
  }

  /**
   * ユーザーの設定に基づいた推薦アファメーションを取得
   */
  static getRecommendedAffirmation(): Affirmation | null {
    const userSettings = UserSettingsStorage.get()
    const userActivity = UserActivityStorage.get()

    // 現在の時刻に基づいてシーンを決定
    const now = new Date()
    const hour = now.getHours()
    let scene: SceneCategory = '朝'

    if (hour >= 6 && hour < 12) {
      scene = '朝'
    } else if (hour >= 18 && hour < 24) {
      scene = '夜'
    } else if (hour >= 9 && hour < 18) {
      scene = '仕事'
    }

    const filters: AffirmationFilters = {
      ageGroup: userSettings.age,
      scene: scene,
      language: userSettings.language,
    }

    return this.getRandomAffirmation(filters)
  }

  /**
   * 今日の特別なメッセージを取得
   */
  static getDailySpecialMessage(): Affirmation | null {
    // 既存の今日の特別メッセージをチェック
    const todaySpecialId = UserActivityStorage.getTodaySpecialMessage()
    if (todaySpecialId) {
      return this.getById(todaySpecialId)
    }

    // 新しい特別メッセージを生成
    const userActivity = UserActivityStorage.get()
    const userSettings = UserSettingsStorage.get()

    // いいねした中から最も多いテーマを特定
    const likedAffirmations = userActivity.likes
      .map(id => this.getById(id))
      .filter((aff): aff is Affirmation => aff !== null)

    if (likedAffirmations.length > 0) {
      // いいねした中でテーマの出現頻度をカウント
      const themeCount: Record<ThemeCategory, number> = {
        '自信': 0,
        '愛': 0,
        '成功': 0,
        '健康': 0,
      }

      likedAffirmations.forEach(aff => {
        themeCount[aff.categories.theme]++
      })

      // 最も多いテーマを特定
      const mostLikedTheme = Object.entries(themeCount).reduce((max, [theme, count]) =>
        count > max.count ? { theme: theme as ThemeCategory, count } : max,
        { theme: '自信' as ThemeCategory, count: 0 }
      ).theme

      // そのテーマから年代に適したアファメーションを選択
      const specialFilters: AffirmationFilters = {
        theme: mostLikedTheme,
        ageGroup: userSettings.age,
        language: userSettings.language,
      }

      const specialMessage = this.getRandomAffirmation(specialFilters)

      if (specialMessage) {
        UserActivityStorage.setDailySpecialMessage(specialMessage.id)
        return specialMessage
      }
    }

    // いいねがない場合は推薦アファメーションを特別メッセージとして使用
    const recommendedMessage = this.getRecommendedAffirmation()
    if (recommendedMessage) {
      UserActivityStorage.setDailySpecialMessage(recommendedMessage.id)
    }

    return recommendedMessage
  }

  /**
   * 検索機能
   */
  static search(query: string, filters?: Omit<AffirmationFilters, 'searchQuery'>): Affirmation[] {
    const searchFilters: AffirmationFilters = {
      ...filters,
      searchQuery: query,
    }
    return this.getFiltered(searchFilters)
  }

  /**
   * 人気のアファメーション（いいね数順）を取得
   */
  static getPopularAffirmations(limit: number = 10): Affirmation[] {
    const userActivity = UserActivityStorage.get()
    const likedCounts: Record<string, number> = {}

    // いいね数をカウント（将来的には全ユーザーのデータを集計）
    userActivity.likes.forEach(id => {
      likedCounts[id] = (likedCounts[id] || 0) + 1
    })

    return this.getAllAffirmations()
      .map(aff => ({
        affirmation: aff,
        likeCount: likedCounts[aff.id] || 0
      }))
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, limit)
      .map(item => item.affirmation)
  }

  /**
   * カテゴリ別の統計を取得
   */
  static getCategoryStats(): {
    themes: Record<ThemeCategory, number>
    scenes: Record<SceneCategory, number>
    ageGroups: Record<AgeGroup, number>
    languages: Record<Language, number>
  } {
    const affirmations = this.getAllAffirmations()

    const stats = {
      themes: { '自信': 0, '愛': 0, '成功': 0, '健康': 0 } as Record<ThemeCategory, number>,
      scenes: { '朝': 0, '夜': 0, '仕事': 0 } as Record<SceneCategory, number>,
      ageGroups: { '20代': 0, '30代': 0, '40代': 0, '50代': 0, '60代以上': 0 } as Record<AgeGroup, number>,
      languages: { 'ja': 0, 'en': 0 } as Record<Language, number>,
    }

    affirmations.forEach(aff => {
      stats.themes[aff.categories.theme]++
      stats.scenes[aff.categories.scene]++
      stats.ageGroups[aff.categories.ageGroup]++
      stats.languages[aff.language]++
    })

    return stats
  }

  /**
   * ユーザー追加のアファメーションを追加
   */
  static addUserAffirmation(affirmationData: Omit<Affirmation, 'id' | 'createdAt' | 'isUserAdded'>): boolean {
    try {
      const newAffirmation: Affirmation = {
        ...affirmationData,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        isUserAdded: true,
      }

      // メモリ内の配列に追加
      this.affirmations.push(newAffirmation)

      // ローカルストレージにも保存
      UserActivityStorage.addUserAffirmation(newAffirmation)

      console.log('User affirmation added successfully:', newAffirmation.id)
      return true
    } catch (error) {
      console.error('Failed to add user affirmation:', error)
      return false
    }
  }

  /**
   * ユーザー追加のアファメーションを削除
   */
  static removeUserAffirmation(affirmationId: string): boolean {
    try {
      const affirmation = this.getById(affirmationId)
      if (!affirmation || !affirmation.isUserAdded) {
        console.warn('Cannot remove non-user affirmation:', affirmationId)
        return false
      }

      // メモリ内の配列から削除
      this.affirmations = this.affirmations.filter(aff => aff.id !== affirmationId)

      // ローカルストレージからも削除
      UserActivityStorage.removeUserAffirmation(affirmationId)

      console.log('User affirmation removed successfully:', affirmationId)
      return true
    } catch (error) {
      console.error('Failed to remove user affirmation:', error)
      return false
    }
  }

  /**
   * サービスの再初期化（設定変更時などに使用）
   */
  static async reinitialize(): Promise<void> {
    this.isInitialized = false
    this.affirmations = []
    await this.initialize()
  }

  /**
   * デバッグ用：すべてのデータをコンソールに出力
   */
  static debug(): void {
    console.group('AffirmationService Debug Info')
    console.log('Initialized:', this.isInitialized)
    console.log('Total Affirmations:', this.affirmations.length)
    console.log('Category Stats:', this.getCategoryStats())
    console.log('User Activity:', UserActivityStorage.get())
    console.log('User Settings:', UserSettingsStorage.get())
    console.groupEnd()
  }
}

// ユーザー関連のサービス
export class UserService {
  /**
   * お気に入りの追加・削除
   */
  static toggleFavorite(affirmationId: string): boolean {
    const userActivity = UserActivityStorage.get()
    const isFavorite = userActivity.favorites.includes(affirmationId)

    if (isFavorite) {
      return UserActivityStorage.removeFavorite(affirmationId)
    } else {
      return UserActivityStorage.addFavorite(affirmationId)
    }
  }

  /**
   * いいねの追加・削除
   */
  static toggleLike(affirmationId: string): boolean {
    return UserActivityStorage.toggleLike(affirmationId)
  }

  /**
   * ユーザーの好みを分析
   */
  static analyzeUserPreferences(): {
    favoriteThemes: ThemeCategory[]
    favoriteScenes: SceneCategory[]
    totalLikes: number
    totalFavorites: number
  } {
    const userActivity = UserActivityStorage.get()

    // いいねしたアファメーションのテーマ分析
    const likedAffirmations = userActivity.likes
      .map(id => AffirmationService.getById(id))
      .filter((aff): aff is Affirmation => aff !== null)

    const themeCount: Record<ThemeCategory, number> = { '自信': 0, '愛': 0, '成功': 0, '健康': 0 }
    const sceneCount: Record<SceneCategory, number> = { '朝': 0, '夜': 0, '仕事': 0 }

    likedAffirmations.forEach(aff => {
      themeCount[aff.categories.theme]++
      sceneCount[aff.categories.scene]++
    })

    // 上位テーマとシーンを抽出
    const favoriteThemes = Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .filter(([,count]) => count > 0)
      .map(([theme]) => theme as ThemeCategory)

    const favoriteScenes = Object.entries(sceneCount)
      .sort(([,a], [,b]) => b - a)
      .filter(([,count]) => count > 0)
      .map(([scene]) => scene as SceneCategory)

    return {
      favoriteThemes,
      favoriteScenes,
      totalLikes: userActivity.likes.length,
      totalFavorites: userActivity.favorites.length,
    }
  }

  /**
   * 初回セットアップが必要かチェック
   */
  static needsInitialSetup(): boolean {
    return UserSettingsStorage.isFirstTime()
  }

  /**
   * 初回セットアップを完了
   */
  static completeInitialSetup(age: AgeGroup): boolean {
    return UserSettingsStorage.updateAge(age)
  }
}