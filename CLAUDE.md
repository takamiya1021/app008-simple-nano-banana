# app008-simplenano-banana プロジェクト設定

## プロジェクト情報
- **名称**: AI Image Generator (nano-banana)
- **GitHub**: https://github.com/takamiya1021/app008-simple-nano-banana.git
- **概要**: Gemini 2.5 Flash Image APIを使用したAI画像生成ツール

## Git操作時の必須チェックリスト（再発防止）

### 🚨 Git操作前チェック（必須実行）
Git pull/push/merge前に以下を必ず確認：

```bash
# 1. 現在のリモートURL確認
git remote -v

# 2. 現在のブランチ確認
git branch

# 3. 現在のプロジェクトディレクトリ確認
pwd

# 4. 期待値との照合
echo "期待値: https://github.com/takamiya1021/app008-simple-nano-banana.git"
echo "現在値: $(git remote get-url origin)"
```

### ✅ 正しい設定値
- **リモートURL**: `https://github.com/takamiya1021/app008-simple-nano-banana.git`
- **ブランチ**: `main`
- **ディレクトリ**: `/home/ustar-wsl-2-2/projects/100apps/app008-simplenano-banana`

### 🚫 Git操作の禁止条件
以下の場合はGit操作を中止し、設定確認を必須とする：
- リモートURLが期待値と異なる
- 予期しないファイルがgit statusに表示される
- 他プロジェクトのファイルが混入している

## 過去の問題事例
### app017-affirmation混入事件（2025-09-15）
- **原因**: リモートURLが`app002a-simple-nano-banana`に誤設定
- **結果**: app017-affirmationファイル39個が誤って混入
- **対策**: 上記チェックリストによる事前確認の徹底

## 開発環境設定
- **サーバー**: Python HTTP Server (port 8000, 8001)
- **言語**: HTML5, CSS3, JavaScript ES6+
- **API**: Gemini 2.5 Flash Image Preview API

## 実装済み機能
- ✅ 詳細エラーメッセージ機能（ErrorAnalyzer class）
- ✅ API key暗号化保存
- ✅ 画像アップロード・プレビュー
- ✅ PWA対応（Service Worker, Manifest）

## 今後の実装予定
- [ ] プロンプト改善提案機能
- [ ] 安全なプロンプト例データベース
- [ ] リトライ機能

---
**作成日**: 2025-09-15
**最終更新**: Git設定修正・再発防止策追加