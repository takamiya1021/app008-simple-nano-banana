/**
 * nano-banana AI画像生成アプリ
 * シンプルで確実に動作するバージョン
 */

class NanoBananaApp {
    constructor() {
        this.apiKey = '';
        this.isGenerating = false;
        this.elements = {};
        this.promptHistory = [];
        this.currentImageSize = '1:1';
        this.referenceImages = [null, null]; // 最大2枚の参考画像
        this.lastPrompt = '';
        this.currentMode = 'freeform'; // 現在の生成モード

        // 設定
        this.config = {
            maxPromptLength: 5000,
            maxHistoryItems: 10,
            apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent'
        };
    }

    /**
     * アプリ初期化
     */
    async init() {
        this.bindElements();
        this.bindEvents();
        this.loadApiKey();
        this.loadPromptHistory();
        this.updateUI();

        console.log('nano-banana アプリが初期化されました');
    }

    /**
     * DOM要素の取得
     */
    bindElements() {
        this.elements = {
            // APIキー関連
            apiKeyInput: document.getElementById('api-key'),
            saveApiKeyBtn: document.getElementById('save-api-key'),
            deleteApiKeyBtn: document.getElementById('clear-api-key'),
            apiStatus: document.getElementById('api-status'),

            // プロンプト関連
            promptInput: document.getElementById('prompt'),
            charCount: document.getElementById('char-count'),
            promptHistorySelect: document.getElementById('prompt-history-select'),
            clearHistoryBtn: document.getElementById('clear-history'),
            imageSizeSelect: document.getElementById('image-size-select'),

            // 参考画像関連
            referenceImageInput1: document.getElementById('reference-image-1'),
            referenceImageInput2: document.getElementById('reference-image-2'),
            imageUploadArea1: document.getElementById('image-upload-area-1'),
            imageUploadArea2: document.getElementById('image-upload-area-2'),
            imagePreview1: document.getElementById('image-preview-1'),
            imagePreview2: document.getElementById('image-preview-2'),
            previewImg1: document.getElementById('preview-img-1'),
            previewImg2: document.getElementById('preview-img-2'),
            removeImageBtn1: document.getElementById('remove-image-1'),
            removeImageBtn2: document.getElementById('remove-image-2'),

            // 制御ボタン
            generateBtn: document.getElementById('generate-btn'),

            // 結果表示関連
            resultArea: document.getElementById('result-area'),
            resultControls: document.getElementById('result-controls'),
            downloadBtn: document.getElementById('download-btn'),
            regenerateBtn: document.getElementById('regenerate-btn'),

            // UI状態管理
            loading: document.getElementById('loading'),
            errorMessage: document.getElementById('error-message'),
            errorText: document.getElementById('error-text'),
            closeError: document.getElementById('close-error'),

            // テンプレート機能
            modeTabs: document.querySelectorAll('.mode-tab'),
            promptSection: document.querySelector('.prompt-section'),
            template5Form: document.querySelector('.template5-form'),
            template6Form: document.querySelector('.template6-form'),

            // Template 5 要素
            t5Element1: document.getElementById('t5-element1'),
            t5Element2: document.getElementById('t5-element2'),
            t5Integration: document.getElementById('t5-integration'),
            t5Preview: document.getElementById('t5-preview'),
            generateTemplate5Btn: document.getElementById('generate-template5'),

            // Template 6 要素
            t6Style: document.getElementById('t6-style'),
            t6Foreground: document.getElementById('t6-foreground'),
            t6Background: document.getElementById('t6-background'),
            t6Text: document.getElementById('t6-text'),
            t6Mood: document.getElementById('t6-mood'),
            t6Aspect: document.getElementById('t6-aspect'),
            t6Preview: document.getElementById('t6-preview'),
            generateTemplate6Btn: document.getElementById('generate-template6')
        };
    }

    /**
     * イベントハンドラーの設定
     */
    bindEvents() {
        // APIキー管理
        this.elements.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.elements.deleteApiKeyBtn.addEventListener('click', () => this.deleteApiKey());

        // プロンプト入力
        this.elements.promptInput.addEventListener('input', () => this.updateCharCount());

        // プロンプト履歴
        this.elements.promptHistorySelect.addEventListener('change', () => this.selectFromHistory());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearPromptHistory());

        // 画像サイズ選択
        this.elements.imageSizeSelect.addEventListener('change', () => this.updateImageSize());

        // サンプルプロンプト
        document.querySelectorAll('.sample-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectSamplePrompt(btn.dataset.prompt));
            btn.addEventListener('mouseenter', () => this.showSampleExplanation(btn.dataset.explanation));
            btn.addEventListener('mouseleave', () => this.hideSampleExplanation());
        });

        // 参考画像アップロード（画像1）
        this.elements.referenceImageInput1.addEventListener('change', (e) => this.handleImageSelect(e, 0));
        this.elements.imageUploadArea1.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.imageUploadArea1.addEventListener('drop', (e) => this.handleImageDrop(e, 0));
        this.elements.removeImageBtn1.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeReferenceImage(0);
        });

        // 参考画像アップロード（画像2）
        this.elements.referenceImageInput2.addEventListener('change', (e) => this.handleImageSelect(e, 1));
        this.elements.imageUploadArea2.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.imageUploadArea2.addEventListener('drop', (e) => this.handleImageDrop(e, 1));
        this.elements.removeImageBtn2.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeReferenceImage(1);
        });

        // 画像生成
        this.elements.generateBtn.addEventListener('click', () => this.generateImage());

        // 結果操作
        this.elements.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.elements.regenerateBtn.addEventListener('click', () => this.regenerateImage());

        // エラー閉じる
        this.elements.closeError.addEventListener('click', () => this.hideError());

        // テンプレート機能
        this.elements.modeTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchMode(tab.dataset.mode));
        });

        // Template 5 イベント
        if (this.elements.t5Element1) {
            this.elements.t5Element1.addEventListener('input', () => this.updateTemplate5Preview());
            this.elements.t5Element2.addEventListener('input', () => this.updateTemplate5Preview());
            this.elements.t5Integration.addEventListener('input', () => this.updateTemplate5Preview());
            this.elements.generateTemplate5Btn.addEventListener('click', () => this.generateTemplate5());
        }

        // Template 6 イベント
        if (this.elements.t6Style) {
            this.elements.t6Style.addEventListener('change', () => this.updateTemplate6Preview());
            this.elements.t6Foreground.addEventListener('input', () => this.updateTemplate6Preview());
            this.elements.t6Background.addEventListener('input', () => this.updateTemplate6Preview());
            this.elements.t6Text.addEventListener('input', () => this.updateTemplate6Preview());
            this.elements.t6Mood.addEventListener('change', () => this.updateTemplate6Preview());
            this.elements.t6Aspect.addEventListener('change', () => this.updateTemplate6Preview());
            this.elements.generateTemplate6Btn.addEventListener('click', () => this.generateTemplate6());
        }
    }

    /**
     * APIキーの保存
     */
    saveApiKey() {
        const apiKey = this.elements.apiKeyInput.value.trim();

        if (!apiKey) {
            this.showError('APIキーを入力してください');
            return;
        }

        if (!this.validateApiKey(apiKey)) {
            this.showError('APIキーの形式が正しくありません');
            return;
        }

        // 暗号化保存（簡易版）
        const encoded = btoa(apiKey);
        localStorage.setItem('nano_banana_api_key', encoded);

        this.apiKey = apiKey;
        this.elements.apiKeyInput.value = '';
        this.updateUI();

        console.log('APIキーが保存されました');
    }

    /**
     * APIキーの削除
     */
    deleteApiKey() {
        localStorage.removeItem('nano_banana_api_key');
        this.apiKey = '';
        this.elements.apiKeyInput.value = '';
        this.updateUI();

        console.log('APIキーが削除されました');
    }

    /**
     * APIキーの読み込み
     */
    loadApiKey() {
        const encoded = localStorage.getItem('nano_banana_api_key');
        if (encoded) {
            try {
                this.apiKey = atob(encoded);
                console.log('APIキーが読み込まれました');
            } catch (e) {
                console.error('APIキーの読み込みエラー:', e);
                localStorage.removeItem('nano_banana_api_key');
            }
        }
    }

    /**
     * APIキーの形式検証
     */
    validateApiKey(apiKey) {
        // Gemini APIキーは通常 "AIzaSy" で始まる39文字
        return /^AIzaSy[A-Za-z0-9_-]{33}$/.test(apiKey);
    }

    /**
     * 文字数カウンターの更新
     */
    updateCharCount() {
        const length = this.elements.promptInput.value.length;
        this.elements.charCount.textContent = length;

        // 制限チェック
        if (length > this.config.maxPromptLength) {
            this.elements.charCount.style.color = '#e53e3e';
        } else {
            this.elements.charCount.style.color = '#718096';
        }

        this.updateUI();
    }

    /**
     * UI状態の更新
     */
    updateUI() {
        // APIキー設定状態に応じたボタン制御
        if (this.apiKey) {
            // APIキー設定済み
            this.elements.apiStatus.classList.remove('hidden');
            this.elements.saveApiKeyBtn.disabled = true;
            this.elements.deleteApiKeyBtn.disabled = false;
        } else {
            // APIキー未設定
            this.elements.apiStatus.classList.add('hidden');
            this.elements.saveApiKeyBtn.disabled = false;
            this.elements.deleteApiKeyBtn.disabled = true;
        }

        // 生成ボタンの有効性
        const prompt = this.elements.promptInput.value.trim();
        const canGenerate = this.apiKey &&
                           prompt &&
                           prompt.length <= this.config.maxPromptLength &&
                           !this.isGenerating;

        this.elements.generateBtn.disabled = !canGenerate;
    }

    /**
     * 画像生成メイン処理
     */
    async generateImage() {
        const prompt = this.elements.promptInput.value.trim();

        if (!this.validateGeneration(prompt)) {
            return;
        }

        this.isGenerating = true;
        this.showLoading();
        this.updateUI();

        try {
            console.log('画像生成開始:', prompt);

            const imageData = await this.callGeminiAPI(prompt, this.currentImageSize, this.referenceImages);
            this.displayImage(imageData);

            // 履歴に追加
            this.addToPromptHistory(prompt);
            this.lastPrompt = prompt;

            console.log('画像生成完了');

        } catch (error) {
            console.error('画像生成エラー:', error);
            this.showError(this.getErrorMessage(error));

        } finally {
            this.isGenerating = false;
            this.hideLoading();
            this.updateUI();
        }
    }

    /**
     * 生成前の検証
     */
    validateGeneration(prompt) {
        if (!this.apiKey) {
            this.showError('APIキーを設定してください');
            return false;
        }

        if (!prompt) {
            this.showError('プロンプトを入力してください');
            return false;
        }

        if (prompt.length > this.config.maxPromptLength) {
            this.showError(`プロンプトは${this.config.maxPromptLength}文字以内にしてください`);
            return false;
        }

        return true;
    }

    /**
     * Gemini API呼び出し
     */
    async callGeminiAPI(prompt, imageSize = '1:1', referenceImages = [null, null]) {
        // プロンプトにサイズ指定を追加（元の動作する形式）
        const sizePrompt = this.getSizePrompt(imageSize);
        const enhancedPrompt = `${prompt}${sizePrompt}`;

        const parts = [{ text: enhancedPrompt }];

        // 参考画像がある場合は追加（最大2枚）
        referenceImages.forEach((referenceImage, index) => {
            if (referenceImage) {
                parts.push({
                    inlineData: {
                        mimeType: referenceImage.type,
                        data: referenceImage.data
                    }
                });
                console.log(`参考画像${index + 1}をAPIリクエストに追加`);
            }
        });

        const requestBody = {
            contents: [{
                parts: parts
            }]
        };

        console.log('API リクエスト:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(this.config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': this.apiKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API エラー:', response.status, errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('API レスポンス:', data);

        return this.extractImageFromResponse(data);
    }

    /**
     * レスポンスから画像データを抽出
     */
    extractImageFromResponse(response) {
        try {
            // レスポンス構造の確認
            if (!response.candidates || !response.candidates[0]) {
                throw new Error('無効なレスポンス構造');
            }

            const candidate = response.candidates[0];
            if (!candidate.content || !candidate.content.parts) {
                throw new Error('コンテンツが見つかりません');
            }

            // 画像データを探す
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    return {
                        data: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png'
                    };
                }
            }

            throw new Error('画像データが見つかりません');

        } catch (error) {
            console.error('画像抽出エラー:', error);
            throw new Error('レスポンスの処理に失敗しました');
        }
    }

    /**
     * 画像の表示
     */
    displayImage(imageData) {
        const imageUrl = `data:${imageData.mimeType};base64,${imageData.data}`;

        this.elements.resultArea.innerHTML = `
            <img src="${imageUrl}" alt="生成された画像" class="result-image" id="generated-image">
        `;

        this.elements.resultControls.classList.remove('hidden');
        this.currentImageData = imageData;

        console.log('画像表示完了');
    }

    /**
     * 画像のダウンロード
     */
    downloadImage() {
        if (!this.currentImageData) {
            this.showError('ダウンロード可能な画像がありません');
            return;
        }

        try {
            const link = document.createElement('a');
            const imageUrl = `data:${this.currentImageData.mimeType};base64,${this.currentImageData.data}`;

            link.href = imageUrl;
            link.download = `nano-banana-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('画像ダウンロード完了');

        } catch (error) {
            console.error('ダウンロードエラー:', error);
            this.showError('ダウンロードに失敗しました');
        }
    }

    /**
     * エラーメッセージの取得
     */
    getErrorMessage(error) {
        if (error.message.includes('400')) {
            return 'リクエストの形式が正しくありません';
        } else if (error.message.includes('401')) {
            return 'APIキーが正しくありません';
        } else if (error.message.includes('403')) {
            return 'API利用権限を確認してください';
        } else if (error.message.includes('429')) {
            return 'リクエストが多すぎます。しばらく待ってから再試行してください';
        } else if (error.message.includes('500')) {
            return 'サーバーエラーが発生しました';
        } else {
            return '画像生成に失敗しました';
        }
    }

    /**
     * ローディング表示
     */
    showLoading() {
        this.elements.loading.classList.remove('hidden');
    }

    /**
     * ローディング非表示
     */
    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }

    /**
     * エラー表示
     */
    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
    }

    /**
     * エラー非表示
     */
    hideError() {
        this.elements.errorMessage.classList.add('hidden');
    }

    /**
     * プロンプト履歴の読み込み
     */
    loadPromptHistory() {
        const saved = localStorage.getItem('nano_banana_prompt_history');
        if (saved) {
            try {
                this.promptHistory = JSON.parse(saved);
                this.updateHistorySelect();
            } catch (e) {
                console.error('履歴読み込みエラー:', e);
                this.promptHistory = [];
            }
        }
    }

    /**
     * プロンプト履歴への追加
     */
    addToPromptHistory(prompt) {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || trimmedPrompt.length < 5) {
            return; // 短すぎるプロンプトは保存しない
        }

        // 重複除去
        this.promptHistory = this.promptHistory.filter(item => item !== trimmedPrompt);

        // 先頭に追加
        this.promptHistory.unshift(trimmedPrompt);

        // 最大件数制限
        if (this.promptHistory.length > this.config.maxHistoryItems) {
            this.promptHistory = this.promptHistory.slice(0, this.config.maxHistoryItems);
        }

        this.savePromptHistory();
        this.updateHistorySelect();
    }

    /**
     * プロンプト履歴の保存
     */
    savePromptHistory() {
        try {
            localStorage.setItem('nano_banana_prompt_history', JSON.stringify(this.promptHistory));
        } catch (e) {
            console.error('履歴保存エラー:', e);
        }
    }

    /**
     * 履歴選択肢の更新
     */
    updateHistorySelect() {
        const select = this.elements.promptHistorySelect;

        // 既存のオプション（最初のオプション以外）を削除
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        // 履歴アイテムを追加
        this.promptHistory.forEach((prompt, index) => {
            const option = document.createElement('option');
            option.value = prompt;
            // 長いプロンプトは省略表示
            const displayText = prompt.length > 50
                ? prompt.substring(0, 50) + '...'
                : prompt;
            option.textContent = `${index + 1}. ${displayText}`;
            select.appendChild(option);
        });
    }

    /**
     * 履歴からの選択
     */
    selectFromHistory() {
        const selectedValue = this.elements.promptHistorySelect.value;
        if (selectedValue) {
            this.elements.promptInput.value = selectedValue;
            this.updateCharCount();
            this.updateUI();

            // 選択をリセット
            this.elements.promptHistorySelect.value = '';
        }
    }

    /**
     * プロンプト履歴のクリア
     */
    clearPromptHistory() {
        this.promptHistory = [];
        this.savePromptHistory();
        this.updateHistorySelect();
        console.log('プロンプト履歴がクリアされました');
    }

    /**
     * サイズプロンプトを生成（元の動作する形式）
     */
    getSizePrompt(sizeRatio) {
        switch(sizeRatio) {
            case '1:1':
                return ' in square format (1:1 aspect ratio)';
            case '9:16':
                return ' in portrait format (9:16 aspect ratio, vertical)';
            case '16:9':
                return ' in landscape format (16:9 aspect ratio, horizontal)';
            case '4:3':
                return ' in landscape format (4:3 aspect ratio, horizontal)';
            case '3:4':
                return ' in portrait format (3:4 aspect ratio, vertical)';
            default:
                return ' in square format (1:1 aspect ratio)';
        }
    }

    /**
     * 画像サイズの更新
     */
    updateImageSize() {
        this.currentImageSize = this.elements.imageSizeSelect.value;
        console.log('画像サイズ更新:', this.currentImageSize);
    }

    /**
     * サンプルプロンプトの選択
     */
    selectSamplePrompt(prompt) {
        this.elements.promptInput.value = prompt;
        this.updateCharCount();
        this.updateUI();
        console.log('サンプルプロンプト選択:', prompt.substring(0, 50) + '...');
    }

    /**
     * サンプル解説の表示
     */
    showSampleExplanation(explanation) {
        const content = document.getElementById('sample-explanation-content');
        if (content && explanation) {
            content.innerHTML = `<strong>💡 ポイント:</strong> ${explanation}`;
        }
    }

    /**
     * サンプル解説の非表示
     */
    hideSampleExplanation() {
        const content = document.getElementById('sample-explanation-content');
        if (content) {
            content.innerHTML = '<strong>💡 ポイント:</strong> ボタンにマウスを乗せると、効果的なプロンプトの書き方のコツが表示されます';
        }
    }

    /**
     * 画像選択処理
     */
    handleImageSelect(event, imageIndex) {
        const file = event.target.files[0];
        if (file) {
            this.processImage(file, imageIndex);
        }
    }

    /**
     * ドラッグオーバー処理
     */
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.add('dragover');
    }

    /**
     * ドロップ処理
     */
    handleImageDrop(event, imageIndex) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('dragover');

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                this.processImage(file, imageIndex);
            } else {
                this.showError('画像ファイルを選択してください');
            }
        }
    }

    /**
     * 画像処理
     */
    async processImage(file, imageIndex) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = e.target.result.split(',')[1];
                this.referenceImages[imageIndex] = {
                    type: file.type,
                    data: base64Data
                };

                // プレビュー表示（動的に要素を取得）
                const previewImg = document.getElementById(`preview-img-${imageIndex + 1}`);
                const uploadArea = document.getElementById(`image-upload-area-${imageIndex + 1}`);
                const imagePreview = document.getElementById(`image-preview-${imageIndex + 1}`);

                previewImg.src = e.target.result;
                uploadArea.querySelector('.upload-placeholder').style.display = 'none';
                imagePreview.classList.remove('hidden');

                console.log(`参考画像${imageIndex + 1}設定完了`);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('画像処理エラー:', error);
            this.showError('画像の処理に失敗しました');
        }
    }

    /**
     * 参考画像を削除
     */
    removeReferenceImage(imageIndex) {
        this.referenceImages[imageIndex] = null;

        // 動的に要素を取得して削除処理
        const referenceImageInput = document.getElementById(`reference-image-${imageIndex + 1}`);
        const uploadArea = document.getElementById(`image-upload-area-${imageIndex + 1}`);
        const imagePreview = document.getElementById(`image-preview-${imageIndex + 1}`);

        referenceImageInput.value = '';
        uploadArea.querySelector('.upload-placeholder').style.display = 'block';
        imagePreview.classList.add('hidden');

        console.log(`参考画像${imageIndex + 1}削除完了`);
    }

    /**
     * 再生成処理
     */
    async regenerateImage() {
        if (!this.lastPrompt) {
            this.showError('再生成するプロンプトがありません');
            return;
        }

        if (!this.validateGeneration(this.lastPrompt)) {
            return;
        }

        this.isGenerating = true;
        this.showLoading();
        this.updateUI();

        try {
            console.log('画像再生成開始:', this.lastPrompt);

            const imageData = await this.callGeminiAPI(this.lastPrompt, this.currentImageSize, this.referenceImages);
            this.displayImage(imageData);

            console.log('画像再生成完了');

        } catch (error) {
            console.error('画像再生成エラー:', error);
            this.showError(this.getErrorMessage(error));

        } finally {
            this.isGenerating = false;
            this.hideLoading();
            this.updateUI();
        }
    }

    /**
     * モード切り替え
     */
    switchMode(mode) {
        // すべてのタブのactiveクラスを削除
        this.elements.modeTabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // クリックされたタブにactiveクラスを追加
        const activeTab = document.querySelector(`[data-mode="${mode}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // フォーム表示/非表示の制御
        this.elements.promptSection.classList.toggle('hidden', mode !== 'freeform');
        this.elements.template5Form.classList.toggle('hidden', mode !== 'template5');
        this.elements.template6Form.classList.toggle('hidden', mode !== 'template6');

        // 現在のモードを記録
        this.currentMode = mode;

        console.log('モード切り替え:', mode);
    }

    /**
     * Template 5のプロンプトプレビュー更新
     */
    updateTemplate5Preview() {
        const element1 = this.elements.t5Element1.value.trim();
        const element2 = this.elements.t5Element2.value.trim();
        const integration = this.elements.t5Integration.value.trim();

        if (!element1 || !element2) {
            this.elements.t5Preview.textContent = 'フォームを入力すると、ここにプロンプトが表示されます';
            return;
        }

        const prompt = `Using the provided images, place ${element2} onto ${element1}. Ensure that the features of ${element1} remain completely unchanged. The added element should ${integration || 'integrate naturally'}.`;

        this.elements.t5Preview.textContent = prompt;
    }

    /**
     * Template 6のプロンプトプレビュー更新
     */
    updateTemplate6Preview() {
        const style = this.elements.t6Style.value;
        const foreground = this.elements.t6Foreground.value.trim();
        const background = this.elements.t6Background.value.trim();
        const text = this.elements.t6Text.value.trim();
        const mood = this.elements.t6Mood.value;
        const aspect = this.elements.t6Aspect.value;

        if (!foreground || !background) {
            this.elements.t6Preview.textContent = 'フォームを入力すると、ここにプロンプトが表示されます';
            return;
        }

        let prompt = `A single comic book panel in a ${style} style. In the foreground, ${foreground}. In the background, ${background}.`;

        if (text) {
            prompt += ` The panel has a caption box with the text '${text}'.`;
        }

        prompt += ` The lighting creates a ${mood} mood. ${aspect}.`;

        this.elements.t6Preview.textContent = prompt;
    }

    /**
     * Template 5での画像生成
     */
    async generateTemplate5() {
        const element1 = this.elements.t5Element1.value.trim();
        const element2 = this.elements.t5Element2.value.trim();
        const integration = this.elements.t5Integration.value.trim();

        if (!element1 || !element2) {
            this.showError('保持する要素と追加する要素の両方を入力してください');
            return;
        }

        // 2枚の画像が必要
        if (!this.referenceImages[0] || !this.referenceImages[1]) {
            this.showError('Template 5では2枚の参考画像が必要です');
            return;
        }

        const prompt = `Using the provided images, place ${element2} onto ${element1}. Ensure that the features of ${element1} remain completely unchanged. The added element should ${integration || 'integrate naturally'}.`;

        await this.performGeneration(prompt);
    }

    /**
     * Template 6での画像生成
     */
    async generateTemplate6() {
        const style = this.elements.t6Style.value;
        const foreground = this.elements.t6Foreground.value.trim();
        const background = this.elements.t6Background.value.trim();
        const text = this.elements.t6Text.value.trim();
        const mood = this.elements.t6Mood.value;
        const aspect = this.elements.t6Aspect.value;

        if (!foreground || !background) {
            this.showError('前景のキャラクターと背景の詳細を入力してください');
            return;
        }

        let prompt = `A single comic book panel in a ${style} style. In the foreground, ${foreground}. In the background, ${background}.`;

        if (text) {
            prompt += ` The panel has a caption box with the text '${text}'.`;
        }

        prompt += ` The lighting creates a ${mood} mood. ${aspect}.`;

        await this.performGeneration(prompt);
    }

    /**
     * 共通の生成処理
     */
    async performGeneration(prompt) {
        if (!this.validateGeneration(prompt)) {
            return;
        }

        this.isGenerating = true;
        this.showLoading();
        this.updateUI();

        try {
            console.log('テンプレート生成開始:', prompt);

            const imageData = await this.callGeminiAPI(prompt, this.currentImageSize, this.referenceImages);
            this.displayImage(imageData);

            // プロンプト履歴に追加
            this.addToPromptHistory(prompt);

            // 再生成用に記録
            this.lastPrompt = prompt;

            console.log('テンプレート生成完了');

        } catch (error) {
            console.error('テンプレート生成エラー:', error);
            this.showError(this.getErrorMessage(error));

        } finally {
            this.isGenerating = false;
            this.hideLoading();
            this.updateUI();
        }
    }
}

/**
 * アプリ初期化
 */
document.addEventListener('DOMContentLoaded', () => {
    const app = new NanoBananaApp();
    app.init();
});