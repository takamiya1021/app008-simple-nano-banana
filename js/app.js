// エラー分析・詳細メッセージ生成クラス
class ErrorAnalyzer {
    constructor() {
        this.geminiErrorCodes = {
            // 400系エラー
            400: {
                type: 'validation',
                title: 'リクエストエラー',
                message: 'プロンプトまたは画像データに問題があります'
            },
            403: {
                type: 'permission',
                title: 'APIキーエラー',
                message: 'Gemini APIキーが無効または権限がありません'
            },
            429: {
                type: 'rate_limit',
                title: 'API使用制限',
                message: 'APIの使用量制限に達しました。しばらく待ってから再試行してください'
            },
            // 500系エラー
            500: {
                type: 'server',
                title: 'サーバーエラー',
                message: 'Gemini APIサーバーで一時的な問題が発生しています'
            },
            503: {
                type: 'unavailable',
                title: 'サービス利用不可',
                message: 'Gemini APIサービスが一時的に利用できません'
            }
        };

        this.contentFilters = {
            'SAFETY': {
                title: 'コンテンツ安全性',
                message: 'プロンプトに安全でない内容が含まれている可能性があります',
                suggestion: '暴力的、性的、または有害な表現を避けて、より中性的な表現に変更してください'
            },
            'PROHIBITED': {
                title: '禁止コンテンツ',
                message: 'プロンプトに禁止されたコンテンツが含まれています',
                suggestion: '著作権のあるキャラクターや実在人物の名前を避け、一般的な説明を使用してください'
            },
            'BLOCKED': {
                title: 'ブロックされたコンテンツ',
                message: 'このプロンプトは安全性フィルターによってブロックされました',
                suggestion: 'より具体的で建設的な表現に変更し、曖昧な表現を避けてください'
            }
        };
    }

    // APIエラーレスポンスの詳細解析
    analyzeApiError(response, responseText) {
        let errorData;
        try {
            errorData = JSON.parse(responseText);
        } catch (e) {
            errorData = { message: responseText };
        }

        const statusCode = response.status;
        const baseInfo = this.geminiErrorCodes[statusCode] || {
            type: 'unknown',
            title: 'エラー',
            message: '予期しないエラーが発生しました'
        };

        return {
            status: statusCode,
            type: baseInfo.type,
            title: baseInfo.title,
            message: baseInfo.message,
            details: this.extractErrorDetails(errorData),
            suggestions: this.generateSuggestions(statusCode, errorData),
            canRetry: this.isRetryable(statusCode)
        };
    }

    // エラー詳細の抽出
    extractErrorDetails(errorData) {
        const details = [];

        // Gemini API固有のエラー構造を解析
        if (errorData.error) {
            if (errorData.error.message) {
                details.push(`詳細: ${errorData.error.message}`);
            }
            if (errorData.error.code) {
                details.push(`エラーコード: ${errorData.error.code}`);
            }
            if (errorData.error.status) {
                details.push(`ステータス: ${errorData.error.status}`);
            }
        }

        // candidates情報の確認
        if (errorData.candidates && errorData.candidates.length > 0) {
            const candidate = errorData.candidates[0];
            if (candidate.finishReason) {
                const filterInfo = this.analyzeFinishReason(candidate.finishReason);
                if (filterInfo) {
                    details.push(filterInfo);
                }
            }
        }

        return details;
    }

    // finishReasonの分析
    analyzeFinishReason(finishReason) {
        const reasons = {
            'SAFETY': 'コンテンツが安全性フィルターによってブロックされました',
            'RECITATION': '著作権保護により生成が停止されました',
            'MAX_TOKENS': 'トークン数の制限に達しました',
            'PROHIBITED_CONTENT': '禁止されたコンテンツが検出されました'
        };

        return reasons[finishReason] || null;
    }

    // 解決提案の生成
    generateSuggestions(statusCode, errorData) {
        const suggestions = [];

        switch (statusCode) {
            case 400:
                suggestions.push('プロンプトを見直し、より具体的で明確な表現に変更してください');
                suggestions.push('参考画像のファイルサイズを確認し、10MB以下にしてください');
                break;
            case 403:
                suggestions.push('Gemini APIキーが正しく設定されているか確認してください');
                suggestions.push('APIキーの使用権限を確認してください');
                break;
            case 429:
                suggestions.push('しばらく時間をおいてから再試行してください');
                suggestions.push('API使用量を確認し、制限内で利用してください');
                break;
            case 500:
            case 503:
                suggestions.push('しばらく時間をおいてから再試行してください');
                suggestions.push('問題が続く場合は、デモモードをご利用ください');
                break;
        }

        // コンテンツフィルター関連の提案
        if (errorData.candidates) {
            suggestions.push('より中性的で建設的な表現を使用してください');
            suggestions.push('具体的すぎる人物名や著作物名を避けてください');
        }

        return suggestions;
    }

    // リトライ可能かどうかの判定
    isRetryable(statusCode) {
        const retryableCodes = [408, 429, 500, 502, 503, 504];
        return retryableCodes.includes(statusCode);
    }

    // ユーザー向けエラーメッセージの生成
    generateUserFriendlyMessage(errorInfo) {
        let message = `**${errorInfo.title}**\n\n${errorInfo.message}`;

        if (errorInfo.details.length > 0) {
            message += '\n\n**詳細情報:**\n';
            errorInfo.details.forEach(detail => {
                message += `• ${detail}\n`;
            });
        }

        if (errorInfo.suggestions.length > 0) {
            message += '\n**解決方法:**\n';
            errorInfo.suggestions.forEach(suggestion => {
                message += `• ${suggestion}\n`;
            });
        }

        if (errorInfo.canRetry) {
            message += '\n💡 このエラーは再試行で解決する可能性があります。';
        }

        return message;
    }
}

// AI画像生成アプリのメイン機能
class AIImageGenerator {
    constructor() {
        this.apiKey = '';
        this.selectedModel = 'gemini-2.5-flash-image'; // 固定モデル
        this.promptHistory = [];
        this.selectedImages = []; // 複数画像対応
        this.encryptionKey = 'nano-banana-secure-key-2024'; // アプリ固有の暗号化キー
        this.errorAnalyzer = new ErrorAnalyzer(); // エラー分析機能

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
            clearConfig: document.getElementById('clear-config'),
            promptText: document.getElementById('prompt-text'),
            charCount: document.getElementById('char-count'),
            promptHistorySelect: document.getElementById('prompt-history-select'),
            imageUpload: document.getElementById('image-upload'),
            fileInput: document.getElementById('file-input'),
            imagesPreview: document.getElementById('images-preview'),
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
        
        // API設定の解除
        this.elements.clearConfig.addEventListener('click', () => this.clearSettings());
        
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
        
        // 画像削除は動的に追加されるボタンで処理
        
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
    
    // セキュアな暗号化保存
    encryptData(data) {
        try {
            return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
        } catch (error) {
            console.error('暗号化エラー');
            return null;
        }
    }
    
    // セキュアな復号化読み取り
    decryptData(encryptedData) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('復号化エラー');
            return null;
        }
    }
    
    // 設定の保存
    saveSettings() {
        this.apiKey = this.elements.apiKey.value.trim();
        
        if (!this.apiKey) {
            this.showNotification('Gemini APIキーを入力してください', 'error');
            return;
        }
        
        const settings = {
            apiKey: this.apiKey,
            selectedModel: this.selectedModel // 固定値
        };
        
        // 暗号化してlocalStorageに保存
        const encryptedSettings = this.encryptData(settings);
        if (encryptedSettings) {
            localStorage.setItem('ai-image-generator-settings', encryptedSettings);
            this.updateApiStatus();
            this.showNotification('設定を保存しました', 'success');
        } else {
            this.showNotification('設定の保存に失敗しました', 'error');
        }
    }
    
    // 設定の読み込み
    loadSettings() {
        const saved = localStorage.getItem('ai-image-generator-settings');
        if (saved) {
            // 暗号化された設定を復号化
            const settings = this.decryptData(saved);
            if (settings) {
                this.apiKey = settings.apiKey || '';
                this.elements.apiKey.value = this.apiKey;
            } else {
                // 復号化失敗時は設定をリセット
                localStorage.removeItem('ai-image-generator-settings');
                console.warn('設定の復号化に失敗したため、設定をリセットしました');
            }
        }
        
        // APIキーの状態を更新
        this.updateApiStatus();
        
        // プロンプト履歴の読み込み（暗号化対応）
        const historyData = localStorage.getItem('ai-image-generator-history');
        if (historyData) {
            try {
                // 履歴データが暗号化されているか確認
                const decryptedHistory = this.decryptData(historyData);
                if (decryptedHistory && Array.isArray(decryptedHistory)) {
                    this.promptHistory = decryptedHistory;
                } else {
                    // 古い形式（平文）の場合
                    this.promptHistory = JSON.parse(historyData);
                }
                this.updateHistorySelect();
            } catch (error) {
                console.warn('履歴の読み込みに失敗しました');
                this.promptHistory = [];
            }
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
    
    // ドロップの処理（複数対応）
    handleDrop(e) {
        e.preventDefault();
        this.elements.imageUpload.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.processImageFiles(files);
    }
    
    // 画像選択の処理（複数対応）
    handleImageSelect(e) {
        const files = Array.from(e.target.files);
        this.processImageFiles(files);
    }
    
    // 複数画像ファイルの処理
    processImageFiles(files) {
        // 画像ファイルのみフィルタリング
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showNotification('画像ファイルを選択してください', 'error');
            return;
        }
        
        // 現在の画像数と新しい画像数の合計が3枚以下かチェック
        if (this.selectedImages.length + imageFiles.length > 3) {
            this.showNotification('参考画像は最大3枚までです', 'error');
            return;
        }
        
        // 各ファイルを処理
        imageFiles.forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB制限
                this.showNotification(`${file.name}: ファイルサイズは10MB以下にしてください`, 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                console.log(`ファイル読み込み完了: ${file.name}`);
                console.log(`DataURL先頭: ${dataUrl.substring(0, 50)}...`);

                const imageData = {
                    file: file,
                    dataUrl: dataUrl,
                    name: file.name,
                    size: file.size,
                    type: file.type
                };

                this.selectedImages.push(imageData);
                console.log(`画像配列に追加: ${this.selectedImages.length}件`);
                this.updateImagePreviews();
            };

            reader.onerror = (e) => {
                console.error(`ファイル読み込みエラー: ${file.name}`, e);
                this.showNotification(`${file.name}の読み込みに失敗しました`, 'error');
            };

            reader.readAsDataURL(file);
        });
    }
    
    // 画像プレビューの更新
    updateImagePreviews() {
        const previewContainer = this.elements.imagesPreview;
        previewContainer.innerHTML = '';

        this.selectedImages.forEach((imageData, index) => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'image-preview-item';

            // 画像要素を直接作成してエラーハンドリングを追加
            const img = document.createElement('img');
            img.src = imageData.dataUrl;
            img.alt = imageData.name;
            img.className = 'preview-image';

            // 画像読み込みエラー時の処理
            img.onerror = (e) => {
                console.error(`画像の読み込みに失敗: ${imageData.name}`, e);
                console.error(`DataURL: ${imageData.dataUrl.substring(0, 100)}...`);
                img.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'image-error';
                errorDiv.style.cssText = `
                    width: 100%;
                    height: 100px;
                    background: #f56565;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    margin-bottom: 0.5rem;
                    font-size: 0.8rem;
                `;
                errorDiv.textContent = '画像読み込みエラー';
                img.parentNode.insertBefore(errorDiv, img);
            };

            // 画像読み込み成功時の処理
            img.onload = () => {
                console.log(`画像読み込み成功: ${imageData.name}`);
            };

            const imageInfo = document.createElement('div');
            imageInfo.className = 'image-info';

            const imageName = document.createElement('span');
            imageName.className = 'image-name';
            imageName.textContent = imageData.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-danger btn-small remove-image-btn';
            removeBtn.textContent = '削除';
            removeBtn.addEventListener('click', () => this.removeImage(index));

            imageInfo.appendChild(imageName);
            imageInfo.appendChild(removeBtn);

            previewDiv.appendChild(img);
            previewDiv.appendChild(imageInfo);
            previewContainer.appendChild(previewDiv);
        });

        // アップロードエリアの表示/非表示
        if (this.selectedImages.length >= 3) {
            this.elements.imageUpload.style.display = 'none';
        } else {
            this.elements.imageUpload.style.display = 'block';
        }
    }
    
    // 指定した画像の削除
    removeImage(index) {
        this.selectedImages.splice(index, 1);
        this.updateImagePreviews();
        
        // ファイル入力をリセット
        this.elements.fileInput.value = '';
    }
    
    // サイズプロンプトを生成
    getSizePrompt(sizeRatio) {
        switch(sizeRatio) {
            case '1:1':
                return ' in square format (1:1 aspect ratio)';
            case '9:16':
                return ' in portrait format (9:16 aspect ratio, vertical)';
            case '16:9':
                return ' in landscape format (16:9 aspect ratio, horizontal)';
            default:
                return ' in square format (1:1 aspect ratio)';
        }
    }
    
    // 画像生成（実際のAPI）
    async generateImage() {
        const prompt = this.elements.promptText.value.trim();
        
        if (!prompt) {
            this.showNotification('プロンプトを入力してください', 'error');
            return;
        }
        
        if (!this.apiKey) {
            this.showNotification('Gemini APIキーを設定してください', 'error');
            return;
        }
        
        if (prompt.length > 500) {
            this.showNotification('プロンプトは500文字以内にしてください', 'error');
            return;
        }
        
        // 選択されたサイズを取得
        const selectedSize = document.getElementById('image-size-select').value;
        const sizePrompt = this.getSizePrompt(selectedSize);
        
        // 履歴に追加
        this.addToHistory(prompt);
        
        // ローディング表示
        this.elements.loading.classList.remove('hidden');
        this.elements.generateBtn.disabled = true;
        
        try {
            // 実際のGemini API呼び出し
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent`;
            
            const requestBody = {
                contents: [{
                    parts: [
                        { text: `Generate an image: ${prompt}${sizePrompt}` }
                    ]
                }]
            };
            
            // 参考画像がある場合はリクエストに追加（最大3枚）
            if (this.selectedImages.length > 0) {
                this.selectedImages.forEach(imageData => {
                    // Base64データからMIMEタイプとデータを抽出
                    const base64Match = imageData.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
                    if (base64Match) {
                        const mimeType = base64Match[1];
                        const base64Data = base64Match[2];
                        
                        // 画像データをpartsに追加
                        requestBody.contents[0].parts.push({
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        });
                    }
                });
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorText = await response.text();

                // 詳細エラー分析
                const errorInfo = this.errorAnalyzer.analyzeApiError(response, errorText);

                // セキュアなログ出力（APIキーを除外）
                console.error('API Error Analysis:', {
                    status: errorInfo.status,
                    type: errorInfo.type,
                    title: errorInfo.title,
                    canRetry: errorInfo.canRetry
                });
                console.error('Request URL:', endpoint);

                // 詳細エラーダイアログを表示
                this.showDetailedErrorDialog(errorInfo);

                // 従来のエラー処理も継続（フォールバック用）
                throw new Error(errorInfo.message);
            }
            
            const responseData = await response.json();
            console.log('API Response:', responseData);
            console.log('API Response Structure:', JSON.stringify(responseData, null, 2));
            
            // レスポンスから画像を処理（公式ドキュメント準拠）
            if (responseData.candidates && responseData.candidates.length > 0) {
                const candidate = responseData.candidates[0];
                
                if (candidate.content && candidate.content.parts) {
                    const parts = candidate.content.parts;
                    let imageFound = false;
                    
                    // 各パートをチェックして画像データを探す
                    for (const part of parts) {
                        if (part.inlineData) {
                            // 画像データが見つかった
                            const base64Image = part.inlineData.data;
                            const mimeType = part.inlineData.mimeType || 'image/png';
                            const imageUrl = `data:${mimeType};base64,${base64Image}`;
                            
                            console.log('Generated image found!');
                            this.displayResult(imageUrl);
                            this.showNotification('画像生成が成功しました！', 'success');
                            imageFound = true;
                            break;
                        }
                    }
                    
                    if (!imageFound) {
                        // 画像が含まれていない場合
                        console.log('No image in response, checking for text...');
                        const textContent = parts.map(part => part.text || '').join('');
                        console.log('Text response:', textContent);
                        
                        this.showNotification('画像生成に失敗しました。プロンプトを変更してお試しください。', 'error');
                        await this.generateFallbackImage(prompt);
                    }
                } else {
                    console.error('Unexpected response structure:', responseData);
                    this.showNotification('予期しないレスポンス形式です', 'error');
                    await this.generateFallbackImage(prompt);
                }
            } else if (responseData.error) {
                console.error('API Error:', responseData.error);
                this.showNotification(`エラー: ${responseData.error.message || 'APIエラーが発生しました'}`, 'error');
                await this.generateFallbackImage(prompt);
            } else {
                // candidatesが存在しない場合
                console.log('No candidates in response - possibly model limitation');
                console.log('Response only contains metadata:', responseData);
                this.showNotification('このモデルでは画像生成がサポートされていない可能性があります', 'error');
                await this.generateFallbackImage(prompt);
            }
            
        } catch (error) {
            // 機密情報を含まないセキュアなエラーログ
            console.error('生成エラーが発生しました');
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
            // 履歴も暗号化して保存
            const encryptedHistory = this.encryptData(this.promptHistory);
            if (encryptedHistory) {
                localStorage.setItem('ai-image-generator-history', encryptedHistory);
            }
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
            this.selectedImages = [];
            this.updateImagePreviews();
            
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

    // 詳細エラーダイアログの表示
    showDetailedErrorDialog(errorInfo) {
        // 詳細エラー表示用のモーダルダイアログ
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1002;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            margin: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;

        const userMessage = this.errorAnalyzer.generateUserFriendlyMessage(errorInfo);
        const formattedMessage = userMessage.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        dialog.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #e53e3e; margin: 0 0 16px 0; font-size: 1.2rem;">
                    🚨 ${errorInfo.title}
                </h3>
                <div style="line-height: 1.6; color: #4a5568;">
                    ${formattedMessage}
                </div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                ${errorInfo.canRetry ?
                    '<button id="retry-btn" style="background: #4299e1; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">再試行</button>' :
                    ''
                }
                <button id="close-error-dialog" style="background: #718096; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">閉じる</button>
            </div>
        `;

        modal.appendChild(dialog);
        document.body.appendChild(modal);

        // イベントリスナー
        const closeBtn = dialog.querySelector('#close-error-dialog');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        const retryBtn = dialog.querySelector('#retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                this.generateImage(); // 再試行
            });
        }

        // モーダル背景クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // API設定の解除
    clearSettings() {
        if (confirm('Gemini APIキー設定を解除しますか？')) {
            // LocalStorageから設定を削除
            localStorage.removeItem('ai-image-generator-settings');
            
            // UIをリセット
            this.apiKey = '';
            this.elements.apiKey.value = '';
            this.updateApiStatus();
            
            this.showNotification('Gemini APIキー設定を解除しました', 'success');
        }
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

    // サービスワーカーの登録（PWA対応）
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('PWA: サービスワーカー登録成功:', registration);
            })
            .catch(error => {
                console.log('PWA: サービスワーカー登録失敗:', error);
            });
    }

    // PWAインストールプロンプト
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA: インストールプロンプトが利用可能');
        e.preventDefault();
        deferredPrompt = e;

        // インストールバナーを表示（3秒後）
        setTimeout(() => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('PWA: インストールが受け入れられました');
                    } else {
                        console.log('PWA: インストールが拒否されました');
                    }
                    deferredPrompt = null;
                });
            }
        }, 3000);
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA: アプリがインストールされました');
        deferredPrompt = null;
    });
});