export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        🎉 アファメーションアプリ テスト画面
      </h1>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-lg mb-4">
          アプリが正常に動作しています！
        </p>

        <div className="space-y-2 text-sm text-gray-600">
          <p>✅ Next.js 15.1.0</p>
          <p>✅ TypeScript</p>
          <p>✅ Tailwind CSS v3</p>
          <p>✅ レスポンシブデザイン</p>
        </div>

        <div className="mt-6">
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            メインページに戻る
          </a>
        </div>
      </div>

      <div className="mt-8 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          アクセス方法
        </h2>
        <div className="bg-gray-100 rounded-lg p-4 text-sm">
          <p><strong>メインページ:</strong> http://172.22.157.213:3005/</p>
          <p><strong>テストページ:</strong> http://172.22.157.213:3005/test</p>
        </div>
      </div>
    </div>
  )
}