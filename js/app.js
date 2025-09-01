// AI画像生成アプリのメイン機能
class AIImageGenerator {
    constructor() {
        this.apiKey = '';
        this.selectedModel = 'gemini-2.5-flash-image'; // 固定モデル
        this.promptHistory = [];
        this.selectedImage = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
    }
    
    // DOM要素の初期化
    initializeElements() {
        this.elements = {
            apiKey: document.getElementById('api-key'),
            apiStatus: document.getElementById('api-status'),
            saveConfig: document.getElementById('save-config'),
            promptText: document.getElementById('prompt-text'),
            charCount: document.getElementById('char-count'),
            promptHistorySelect: document.getElementById('prompt-history-select'),
            imageUpload: document.getElementById('image-upload'),
            fileInput: document.getElementById('file-input'),
            imagePreview: document.getElementById('image-preview'),
            previewImg: document.getElementById('preview-img'),
            removeImage: document.getElementById('remove-image'),
            generateBtn: document.getElementById('generate-btn'),
            resetBtn: document.getElementById('reset-btn'),
            resultArea: document.getElementById('result-area'),
            resultControls: document.getElementById('result-controls'),
            downloadBtn: document.getElementById('download-btn'),
            regenerateBtn: document.getElementById('regenerate-btn'),
            loading: document.getElementById('loading')
        };
    }
    
    // イベントリスナーの設定
    bindEvents() {
        // API設定の保存
        this.elements.saveConfig.addEventListener('click', () => this.saveSettings());
        
        // プロンプト入力の文字数カウント
        this.elements.promptText.addEventListener('input', () => this.updateCharCount());
        
        // 履歴選択
        this.elements.promptHistorySelect.addEventListener('change', () => this.selectFromHistory());
        
        // 画像アップロード
        this.elements.imageUpload.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleImageSelect(e));
        
        // ドラッグ&ドロップ
        this.elements.imageUpload.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.imageUpload.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.elements.imageUpload.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 画像削除
        this.elements.removeImage.addEventListener('click', () => this.removeImage());
        
        // 生成開始
        this.elements.generateBtn.addEventListener('click', () => this.generateImage());
        
        // 設定リセット
        this.elements.resetBtn.addEventListener('click', () => this.resetSettings());
        
        // ダウンロード
        this.elements.downloadBtn.addEventListener('click', () => this.downloadImage());
        
        // 再生成
        this.elements.regenerateBtn.addEventListener('click', () => this.generateImage());
        
        // Enterキーでの生成（Shift+Enterは改行）
        this.elements.promptText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.generateImage();
            }
        });
    }
    
    // 設定の保存
    saveSettings() {
        this.apiKey = this.elements.apiKey.value.trim();
        
        if (!this.apiKey) {
            this.showNotification('APIキーを入力してください', 'error');
            return;
        }
        
        const settings = {
            apiKey: this.apiKey,
            selectedModel: this.selectedModel // 固定値
        };
        
        localStorage.setItem('ai-image-generator-settings', JSON.stringify(settings));
        this.updateApiStatus();
        this.showNotification('設定を保存しました', 'success');
    }
    
    // 設定の読み込み
    loadSettings() {
        const saved = localStorage.getItem('ai-image-generator-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.apiKey = settings.apiKey || '';
            // selectedModelは固定のため読み込みのみ（UI更新不要）
            
            this.elements.apiKey.value = this.apiKey;
        }
        
        // APIキーの状態を更新
        this.updateApiStatus();
        
        // プロンプト履歴の読み込み
        const historyData = localStorage.getItem('ai-image-generator-history');
        if (historyData) {
            this.promptHistory = JSON.parse(historyData);
            this.updateHistorySelect();
        }
    }
    
    // 文字数カウントの更新
    updateCharCount() {
        const count = this.elements.promptText.value.length;
        this.elements.charCount.textContent = count;
        
        if (count > 500) {
            this.elements.charCount.style.color = '#e53e3e';
        } else if (count > 400) {
            this.elements.charCount.style.color = '#dd6b20';
        } else {
            this.elements.charCount.style.color = '#718096';
        }
    }
    
    // 履歴からの選択
    selectFromHistory() {
        const selectedPrompt = this.elements.promptHistorySelect.value;
        if (selectedPrompt) {
            this.elements.promptText.value = selectedPrompt;
            this.updateCharCount();
        }
    }
    
    // 履歴セレクトボックスの更新
    updateHistorySelect() {
        const select = this.elements.promptHistorySelect;
        // 既存のオプションをクリア（最初のオプションは残す）
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // 履歴を逆順（新しいものから）で追加
        [...this.promptHistory].reverse().forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt;
            option.textContent = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
            select.appendChild(option);
        });
    }
    
    // ドラッグオーバーの処理
    handleDragOver(e) {
        e.preventDefault();
        this.elements.imageUpload.classList.add('dragover');
    }
    
    // ドラッグリーブの処理
    handleDragLeave(e) {
        e.preventDefault();
        this.elements.imageUpload.classList.remove('dragover');
    }
    
    // ドロップの処理
    handleDrop(e) {
        e.preventDefault();
        this.elements.imageUpload.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processImageFile(files[0]);
        }
    }
    
    // 画像選択の処理
    handleImageSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processImageFile(file);
        }
    }
    
    // 画像ファイルの処理
    processImageFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('画像ファイルを選択してください', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB制限
            this.showNotification('ファイルサイズは10MB以下にしてください', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.selectedImage = e.target.result;
            this.elements.previewImg.src = this.selectedImage;
            this.elements.imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
    
    // 画像の削除
    removeImage() {
        this.selectedImage = null;
        this.elements.imagePreview.classList.add('hidden');
        this.elements.fileInput.value = '';
    }
    
    // 画像生成（実際のAPI）
    async generateImage() {
        const prompt = this.elements.promptText.value.trim();
        
        if (!prompt) {
            this.showNotification('プロンプトを入力してください', 'error');
            return;
        }
        
        if (!this.apiKey) {
            this.showNotification('APIキーを設定してください', 'error');
            return;
        }
        
        if (prompt.length > 500) {
            this.showNotification('プロンプトは500文字以内にしてください', 'error');
            return;
        }
        
        // 履歴に追加
        this.addToHistory(prompt);
        
        // ローディング表示
        this.elements.loading.classList.remove('hidden');
        this.elements.generateBtn.disabled = true;
        
        try {
            // 実際のGemini API呼び出し
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${this.apiKey}`;
            
            const requestBody = {
                contents: [{
                    parts: [
                        { text: prompt }
                    ]
                }]
            };
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const responseData = await response.json();
            console.log('API Response:', responseData);
            
            // レスポンスから画像を処理（公式ドキュメント準拠）
            if (responseData.candidates && responseData.candidates.length > 0) {
                const candidate = responseData.candidates[0];
                const parts = candidate.content.parts;
                
                // Base64画像データを探す（公式ドキュメントの方式）
                const imagePart = parts.find(part => part.inlineData);
                
                if (imagePart && imagePart.inlineData) {
                    const base64Image = imagePart.inlineData.data;
                    const mimeType = imagePart.inlineData.mimeType || 'image/png';
                    const imageUrl = `data:${mimeType};base64,${base64Image}`;
                    
                    console.log('Generated image found!');
                    this.displayResult(imageUrl);
                    this.showNotification('画像生成が成功しました！', 'success');
                } else {
                    // テキストレスポンスの場合
                    const textContent = parts.map(part => part.text || '').join('');
                    console.log('Text response received:', textContent);
                    console.log('API parts structure:', JSON.stringify(parts, null, 2));
                    
                    // parts配列の詳細をチェック
                    parts.forEach((part, index) => {
                        console.log(`Part ${index}:`, JSON.stringify(part, null, 2));
                    });
                    
                    this.showNotification('画像生成に失敗しました。プロンプトを変更してお試しください。', 'error');
                    
                    // フォールバック：デモ画像を表示
                    await this.generateFallbackImage(prompt);
                }
            } else {
                throw new Error('No valid response from API');
            }
            
        } catch (error) {
            console.error('生成エラー:', error);
            this.showNotification(`画像生成エラー: ${error.message}`, 'error');
            
            // エラー時のフォールバック：デモ画像を生成
            await this.generateFallbackImage(prompt);
        } finally {
            this.elements.loading.classList.add('hidden');
            this.elements.generateBtn.disabled = false;
        }
    }
    
    // フォールバック画像生成（デモ版）
    async generateFallbackImage(prompt) {
        // 2秒待機してAPI風の動作をシミュレート
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // デモ画像の生成
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // グラデーション背景
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        const randomColor1 = colors[Math.floor(Math.random() * colors.length)];
        const randomColor2 = colors[Math.floor(Math.random() * colors.length)];
        
        gradient.addColorStop(0, randomColor1);
        gradient.addColorStop(1, randomColor2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // テキスト描画
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DEMO MODE', 256, 180);
        ctx.font = '16px Arial';
        ctx.fillText('Gemini 2.5 Flash Image', 256, 210);
        ctx.fillText('(nano-banana)', 256, 230);
        
        // プロンプトを分割して描画
        ctx.font = '14px Arial';
        const words = prompt.split(' ');
        let line = '';
        let y = 270;
        
        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 450 && line !== '') {
                ctx.fillText(line.trim(), 256, y);
                line = word + ' ';
                y += 20;
                if (y > 450) break;
            } else {
                line = testLine;
            }
        }
        if (line.trim() !== '') {
            ctx.fillText(line.trim(), 256, y);
        }
        
        const generatedImageUrl = canvas.toDataURL('image/png');
        this.displayResult(generatedImageUrl);
    }
    
    // API呼び出しのシミュレーション
    simulateAPICall() {
        return new Promise(resolve => {
            setTimeout(resolve, 2000 + Math.random() * 3000); // 2-5秒のランダムな待機
        });
    }
    
    // 結果の表示
    displayResult(imageUrl) {
        this.elements.resultArea.innerHTML = `<img src="${imageUrl}" alt="Generated Image">`;
        this.elements.resultControls.classList.remove('hidden');
        this.currentGeneratedImage = imageUrl;
        
        // 結果まで自動スクロール
        this.elements.resultArea.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 履歴への追加
    addToHistory(prompt) {
        if (!this.promptHistory.includes(prompt)) {
            this.promptHistory.unshift(prompt);
            if (this.promptHistory.length > 20) { // 最大20件
                this.promptHistory.pop();
            }
            localStorage.setItem('ai-image-generator-history', JSON.stringify(this.promptHistory));
            this.updateHistorySelect();
        }
    }
    
    // 画像のダウンロード
    downloadImage() {
        if (this.currentGeneratedImage) {
            const link = document.createElement('a');
            link.download = `ai-generated-image-${Date.now()}.png`;
            link.href = this.currentGeneratedImage;
            link.click();
        }
    }
    
    // 設定のリセット
    resetSettings() {
        if (confirm('設定をリセットしますか？')) {
            localStorage.removeItem('ai-image-generator-settings');
            localStorage.removeItem('ai-image-generator-history');
            
            this.elements.apiKey.value = '';
            this.elements.promptText.value = '';
            this.updateCharCount();
            this.removeImage();
            
            this.apiKey = '';
            this.promptHistory = [];
            this.updateHistorySelect();
            this.updateApiStatus();
            
            this.elements.resultArea.innerHTML = '<div class="result-placeholder"><p>生成された画像がここに表示されます</p></div>';
            this.elements.resultControls.classList.add('hidden');
            
            this.showNotification('設定をリセットしました', 'success');
        }
    }
    
    // 通知の表示
    showNotification(message, type = 'info') {
        // 簡易的な通知表示
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#48bb78';
                break;
            case 'error':
                notification.style.background = '#e53e3e';
                break;
            default:
                notification.style.background = '#4299e1';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // アニメーション
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // APIキーの状態表示を更新
    updateApiStatus() {
        if (this.apiKey && this.apiKey.trim().length > 0) {
            this.elements.apiStatus.classList.remove('hidden');
        } else {
            this.elements.apiStatus.classList.add('hidden');
        }
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new AIImageGenerator();
});