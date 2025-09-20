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
        this.referenceImages = [null, null]; // 最大2枚の参考画像
        this.lastPrompt = '';
        this.currentMode = 'freeform'; // 現在の生成モード
        this.explanationTimeout = null; // サンプル説明表示用タイマー
        this.drawingManagers = []; // 描画マネージャー
        this.deferredPrompt = null; // PWAインストールプロンプト

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
        await this.loadApiKey();  // awaitを追加して読み込み完了を待つ
        this.loadPromptHistory();
        this.updateUI();
        this.initPWAInstall(); // PWAインストール機能の初期化

        // 初期モード（フリーフォーム）に設定
        this.switchMode('freeform');

        console.log('nano-banana アプリが初期化されました');
    }

    /**
     * DOM要素の取得
     */
    bindElements() {
        this.elements = {
            // APIキー関連
            apiKeyInput: document.getElementById('api-key'),
            apiInputContainer: document.querySelector('.api-input-container'),
            pasteApiKeyBtn: document.getElementById('paste-api-key'),
            saveApiKeyBtn: document.getElementById('save-api-key'),
            deleteApiKeyBtn: document.getElementById('clear-api-key'),
            apiStatus: document.getElementById('api-status'),

            // プロンプト関連
            promptInput: document.getElementById('prompt'),
            charCount: document.getElementById('char-count'),
            promptHistorySelect: document.getElementById('prompt-history-select'),
            clearHistoryBtn: document.getElementById('clear-history'),

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
            template7Form: document.querySelector('.template7-form'),
            template8Form: document.querySelector('.template8-form'),

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
            generateTemplate6Btn: document.getElementById('generate-template6'),

            // Template 7 要素
            t7Style: document.getElementById('t7-style'),
            t7Subject: document.getElementById('t7-subject'),
            t7Characteristics: document.getElementById('t7-characteristics'),
            t7Background: document.getElementById('t7-background'),
            t7Preview: document.getElementById('t7-preview'),
            generateTemplate7Btn: document.getElementById('generate-template7'),

            // Template 8 要素
            t8Text: document.getElementById('t8-text'),
            t8DesignType: document.getElementById('t8-design-type'),
            t8FontStyle: document.getElementById('t8-font-style'),
            t8Placement: document.getElementById('t8-placement'),
            t8ColorTheme: document.getElementById('t8-color-theme'),
            t8Preview: document.getElementById('t8-preview'),
            generateTemplate8Btn: document.getElementById('generate-template8'),

            // 参考画像セクション
            referenceImageSection: document.querySelector('.reference-image-section')
        };
    }

    /**
     * イベントハンドラーの設定
     */
    bindEvents() {
        // APIキー管理
        this.elements.pasteApiKeyBtn.addEventListener('click', () => this.pasteApiKey());
        this.elements.saveApiKeyBtn.addEventListener('click', async () => await this.saveApiKey());
        this.elements.deleteApiKeyBtn.addEventListener('click', () => this.deleteApiKey());

        // プロンプト入力
        this.elements.promptInput.addEventListener('input', () => this.updateCharCount());

        // プロンプト履歴
        this.elements.promptHistorySelect.addEventListener('change', () => this.selectFromHistory());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearPromptHistory());


        // サンプルプロンプト
        document.querySelectorAll('.sample-btn').forEach(btn => {
            // クリック・タップイベント（プロンプト選択＋説明表示）
            btn.addEventListener('click', () => {
                this.selectSamplePrompt(btn.dataset.prompt);
                this.showSampleExplanation(btn.dataset.explanation);
            });
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
            this.elements.generateTemplate5Btn.addEventListener('click', async () => await this.generateTemplate5());
        }

        // Template 6 イベント
        console.log('🔍 Template 6 要素チェック:', {
            t6Style: this.elements.t6Style,
            generateTemplate6Btn: this.elements.generateTemplate6Btn
        });

        if (this.elements.t6Style) {
            console.log('✅ Template 6 イベント設定開始');
            this.elements.t6Style.addEventListener('change', () => this.updateTemplate6Preview());
            this.elements.t6Foreground.addEventListener('input', () => this.updateTemplate6Preview());
            this.elements.t6Background.addEventListener('input', () => this.updateTemplate6Preview());
            this.elements.t6Text.addEventListener('input', () => this.updateTemplate6Preview());
            this.elements.t6Mood.addEventListener('change', () => this.updateTemplate6Preview());
            this.elements.t6Aspect.addEventListener('change', () => this.updateTemplate6Preview());
            this.elements.generateTemplate6Btn.addEventListener('click', async () => await this.generateTemplate6());

            console.log('✅ Template 6 イベント設定完了');
        } else {
            console.error('❌ Template 6 要素が見つかりません');
        }

        // Template 7 イベント
        if (this.elements.t7Style) {
            console.log('✅ Template 7 イベント設定開始');
            this.elements.t7Style.addEventListener('change', () => this.updateTemplate7Preview());
            this.elements.t7Subject.addEventListener('input', () => this.updateTemplate7Preview());
            this.elements.t7Characteristics.addEventListener('input', () => this.updateTemplate7Preview());
            this.elements.t7Background.addEventListener('change', () => this.updateTemplate7Preview());
            this.elements.generateTemplate7Btn.addEventListener('click', async () => await this.generateTemplate7());

            console.log('✅ Template 7 イベント設定完了');
        } else {
            console.error('❌ Template 7 要素が見つかりません');
        }

        // Template 8 イベント
        if (this.elements.t8Text) {
            console.log('✅ Template 8 イベント設定開始');
            this.elements.t8Text.addEventListener('input', () => this.updateTemplate8Preview());
            this.elements.t8DesignType.addEventListener('change', () => this.updateTemplate8Preview());
            this.elements.t8FontStyle.addEventListener('change', () => this.updateTemplate8Preview());
            this.elements.t8Placement.addEventListener('change', () => this.updateTemplate8Preview());
            this.elements.t8ColorTheme.addEventListener('change', () => this.updateTemplate8Preview());
            this.elements.generateTemplate8Btn.addEventListener('click', async () => await this.generateTemplate8());

            console.log('✅ Template 8 イベント設定完了');
        } else {
            console.error('❌ Template 8 要素が見つかりません');
        }
    }

    /**
     * クリップボードからAPIキーをペースト（改善版）
     */
    async pasteApiKey() {
        console.log('📋 貼り付けボタンがクリックされました');

        // まず基本的な確認
        if (!navigator.clipboard) {
            console.warn('❌ Clipboard API が利用できません');
            this.fallbackPaste();
            return;
        }

        try {
            console.log('🔄 クリップボード読み取り試行中...');
            const text = await navigator.clipboard.readText();
            console.log('📝 クリップボード内容:', text ? `${text.substring(0, 10)}...` : '空');

            if (text && text.trim()) {
                this.elements.apiKeyInput.value = text.trim();
                this.showNotification('📋 APIキーが貼り付けられました', 'success');
                console.log('✅ 貼り付け成功');

                // 貼り付け後に保存ボタンを強調表示
                this.elements.saveApiKeyBtn.focus();
            } else {
                console.warn('⚠️ クリップボードが空です');
                this.showNotification('クリップボードが空です', 'error');
            }
        } catch (error) {
            console.error('❌ Clipboard API エラー:', error.name, error.message);
            this.fallbackPaste();
        }
    }

    /**
     * 貼り付けのフォールバック処理
     */
    fallbackPaste() {
        console.log('🔄 フォールバック処理実行');

        // 入力フィールドにフォーカス＋選択して手動貼り付けを促す
        this.elements.apiKeyInput.focus();
        this.elements.apiKeyInput.select();

        this.showNotification(
            '📋 手動で貼り付けてください\n\n' +
            '方法1: Ctrl+V で貼り付け\n' +
            '方法2: 右クリック → 貼り付け\n' +
            '方法3: 長押しで貼り付けメニュー',
            'info'
        );
    }

    /**
     * 通知メッセージを表示
     */
    showNotification(message, type = 'info') {
        // 既存のエラー表示機能を拡張
        const errorElement = this.elements.errorMessage;
        const textElement = this.elements.errorText;

        if (errorElement && textElement) {
            textElement.textContent = message;

            // タイプに応じて色を変更
            errorElement.className = `notification notification-${type}`;
            errorElement.classList.remove('hidden');

            // 3秒後に自動で非表示
            setTimeout(() => {
                errorElement.classList.add('hidden');
            }, 3000);
        }
    }



    /**
     * AES暗号化
     */
    async encryptAES(text) {
        try {
            const password = 'nano-banana-2024-secure-key-v1';
            const encoder = new TextEncoder();
            const data = encoder.encode(text);

            // パスワードからキーを導出
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: encoder.encode('nano-banana-salt'),
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt']
            );

            // 初期化ベクトルを生成
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // 暗号化
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );

            // IV + 暗号化データを結合してBase64エンコード
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);

            // 安全なBase64エンコード
            let binary = '';
            for (let i = 0; i < combined.length; i++) {
                binary += String.fromCharCode(combined[i]);
            }
            return btoa(binary);
        } catch (error) {
            console.error('AES暗号化エラー:', error);
            throw error;
        }
    }

    /**
     * AES復号化
     */
    async decryptAES(encryptedData) {
        try {
            const password = 'nano-banana-2024-secure-key-v1';
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();

            // Base64デコード
            const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

            // IVと暗号化データを分離
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);

            // パスワードからキーを導出
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: encoder.encode('nano-banana-salt'),
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );

            // 復号化
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                encrypted
            );

            return decoder.decode(decrypted);
        } catch (e) {
            console.error('復号化エラー:', e);
            return null;
        }
    }

    /**
     * APIキーの保存
     */
    async saveApiKey(apiKeyParam = null) {
        const apiKey = apiKeyParam || this.elements.apiKeyInput.value.trim();

        if (!apiKey) {
            this.showError('APIキーを入力してください');
            return;
        }

        if (!this.validateApiKey(apiKey)) {
            this.showError('APIキーの形式が正しくありません');
            return;
        }

        try {
            const encoded = await this.encryptAES(apiKey);
            localStorage.setItem('nano_banana_api_key', encoded);
            this.apiKey = apiKey;
            this.elements.apiKeyInput.value = '';
            this.updateUI();
        } catch (error) {
            this.showError('APIキーの保存に失敗しました');
        }
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
    async loadApiKey() {
        const encoded = localStorage.getItem('nano_banana_api_key');
        if (encoded) {
            try {
                // 旧形式（Base64）の場合の互換性処理
                if (encoded.startsWith('QUl6YVN5')) {
                    // 旧形式を検出（Base64エンコードで「AIzaSy」で始まる）
                    this.apiKey = atob(encoded);
                    // 新形式で再保存
                    await this.saveApiKey(this.apiKey);
                } else {
                    // 新形式（AES暗号化）
                    const decrypted = await this.decryptAES(encoded);
                    if (decrypted) {
                        this.apiKey = decrypted;
                    } else {
                        throw new Error('復号化失敗');
                    }
                }
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
            this.elements.apiInputContainer.classList.add('api-configured');
            this.elements.saveApiKeyBtn.disabled = true;
            this.elements.deleteApiKeyBtn.disabled = false;
        } else {
            // APIキー未設定
            this.elements.apiStatus.classList.add('hidden');
            this.elements.apiInputContainer.classList.remove('api-configured');
            this.elements.saveApiKeyBtn.disabled = false;
            this.elements.deleteApiKeyBtn.disabled = true;
        }

        // フリーフォーム生成ボタンの有効性（フリーフォームモードのみ）
        if (this.elements.generateBtn) {
            if (this.currentMode === 'freeform') {
                const prompt = this.elements.promptInput.value.trim();
                const canGenerate = this.apiKey &&
                                   prompt &&
                                   prompt.length <= this.config.maxPromptLength &&
                                   !this.isGenerating;
                this.elements.generateBtn.disabled = !canGenerate;
            } else {
                // フリーフォームモード以外では無効化
                this.elements.generateBtn.disabled = true;
            }
        }
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

            const imageData = await this.callGeminiAPI(prompt, '1:1', this.prepareImagesForAPI());
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
     * Gemini API呼び出し（参照画像方式によるアスペクト比制御）
     */
    async callGeminiAPI(prompt, imageSize = '1:1', referenceImages = [null, null]) {
        // フリーフォームモードではプロンプトにサイズ指定を追加しない
        const enhancedPrompt = prompt;

        console.log('🎯 画像生成開始:', imageSize);

        // partsの配列を初期化（プロンプトテキストを最初に配置）
        const parts = [{ text: enhancedPrompt }];

        // ユーザーの参考画像がある場合は追加（最大2枚）
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

        // Template 6の場合：ユーザー画像がない時のみアスペクト比制御用参照画像を追加
        if (this.currentMode === 'template6' && imageSize !== '1:1') {
            const hasUserImages = referenceImages.some(img => img !== null);
            if (!hasUserImages) {
                const aspectRatioReference = this.generateReferenceImage(imageSize);
                parts.push({
                    inlineData: {
                        mimeType: aspectRatioReference.type,
                        data: aspectRatioReference.data
                    }
                });
                console.log('📐 コミックパネルモード：ユーザー画像なし → アスペクト比制御用参照画像を自動生成（サイズ:', imageSize, '）');
            } else {
                console.log('📐 コミックパネルモード：ユーザー画像あり → システム自動生成はスキップ');
            }
        }

        // モード別の参照画像処理ログ
        if (this.currentMode === 'freeform') {
            console.log('📐 フリーフォームモード：参照画像なしで生成');
        } else if (this.currentMode === 'template5') {
            console.log('📐 詳細保持合成モード：ユーザー参考画像のみで生成');
        } else if (this.currentMode === 'template6') {
            const hasUserImages = referenceImages.some(img => img !== null);
            if (hasUserImages) {
                console.log('📐 コミックパネルモード：ユーザー参考画像で生成（システム自動生成なし）');
            } else if (imageSize !== '1:1') {
                console.log('📐 コミックパネルモード：アスペクト比制御用参照画像で生成');
            } else {
                console.log('📐 コミックパネルモード：参照画像なしで生成（1:1正方形）');
            }
        }

        const requestBody = {
            contents: [{
                parts: parts
            }]
        };

        console.log('API リクエスト送信中...');

        // タイムアウト制御用のAbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.warn('⏱️ API リクエストタイムアウト (60秒)');
            controller.abort();
        }, 60000); // 60秒でタイムアウト

        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId); // 成功時はタイムアウトをクリア

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API エラー:', response.status, errorText);

            // 詳細エラー情報を含むエラーオブジェクトを作成
            const error = new Error(`API Error: ${response.status}`);
            error.status = response.status;
            error.responseText = errorText;

            // エラーレスポンスをJSONとして解析を試行
            try {
                const errorData = JSON.parse(errorText);
                error.errorData = errorData;
                console.error('詳細エラー情報:', errorData);
            } catch (e) {
                // JSONでない場合はそのまま
                console.error('エラーレスポンス（テキスト）:', errorText);
            }

            throw error;
        }

            const data = await response.json();
            console.log('API レスポンス:', data);

            const imageData = this.extractImageFromResponse(data);

            return imageData;

        } catch (error) {
            clearTimeout(timeoutId); // エラー時もタイムアウトをクリア

            if (error.name === 'AbortError') {
                console.error('⏱️ API リクエストがタイムアウトしました');
                throw new Error('リクエストがタイムアウトしました。もう一度お試しください。');
            }

            console.error('API リクエストエラー:', error);
            throw error;
        }
    }

    /**
     * レスポンスから画像データを抽出
     */
    extractImageFromResponse(response) {
        try {
            console.log('🔍 レスポンス構造デバッグ:', JSON.stringify(response, null, 2));

            // レスポンス構造の確認
            if (!response.candidates || !response.candidates[0]) {
                console.error('❌ candidates が見つかりません');
                throw new Error('無効なレスポンス構造');
            }

            const candidate = response.candidates[0];
            console.log('🔍 candidate 構造:', JSON.stringify(candidate, null, 2));

            // 安全フィルターチェック
            if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'IMAGE_SAFETY') {
                throw new Error('🚫 不適切な表現が検出されました。暴力的・性的・危険な内容を含む表現は生成できません。別の表現で試してください。');
            }

            if (!candidate.content || !candidate.content.parts) {
                console.error('❌ content.parts が見つかりません');
                if (candidate.finishReason) {
                    throw new Error(`🚫 画像生成が拒否されました（理由: ${candidate.finishReason}）。プロンプトの内容を確認してください。`);
                }
                throw new Error('コンテンツが見つかりません');
            }

            console.log('🔍 parts の内容:', candidate.content.parts);

            // 画像データを探す
            for (let i = 0; i < candidate.content.parts.length; i++) {
                const part = candidate.content.parts[i];
                console.log(`🔍 part[${i}]:`, Object.keys(part));

                if (part.inlineData) {
                    console.log('✅ inlineData 発見!');
                    return {
                        data: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png'
                    };
                }

                // 他の可能性もチェック
                if (part.blob) {
                    console.log('✅ blob データ発見!');
                    return {
                        data: part.blob.data,
                        mimeType: part.blob.mimeType || 'image/png'
                    };
                }

                if (part.image) {
                    console.log('✅ image データ発見!');
                    return {
                        data: part.image.data,
                        mimeType: part.image.mimeType || 'image/png'
                    };
                }
            }

            console.error('❌ 画像データが見つかりません。利用可能なキー:',
                candidate.content.parts.map(p => Object.keys(p)));
            throw new Error('画像データが見つかりません');

        } catch (error) {
            console.error('画像抽出エラー:', error);
            // 安全フィルターエラーはそのまま再スロー
            if (error.message && error.message.includes('不適切な表現が検出されました')) {
                throw error;
            }
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
     * エラーメッセージの取得（詳細版）
     */
    getErrorMessage(error) {
        console.log('エラー詳細分析:', error);
        // 安全フィルターエラーはそのまま返す
        if (error.message && error.message.includes('不適切な表現が検出されました')) {
            return error.message;
        }

        // ステータスコード別の詳細メッセージ
        const status = error.status || 0;
        let baseMessage = '';
        let suggestion = '';
        let errorCode = `[エラーコード: ${status}]`;

        switch (status) {
            case 400:
                baseMessage = '❌ リクエストの形式が正しくありません';
                suggestion = '💡 対処法:\n• プロンプトの内容を確認してください\n• 画像ファイルが正しい形式か確認してください\n• 画像サイズが適切か確認してください';
                break;

            case 401:
                baseMessage = '🔑 APIキーが正しくありません';
                suggestion = '💡 対処法:\n• APIキーを再確認してください\n• Google AI Studioで新しいAPIキーを生成してください\n• APIキーが有効期限内か確認してください';
                break;

            case 403:
                baseMessage = '🚫 API利用権限がありません';
                suggestion = '💡 対処法:\n• Gemini APIが有効になっているか確認してください\n• 課金設定が完了しているか確認してください\n• APIの使用制限に達していないか確認してください';
                break;

            case 429:
                baseMessage = '⏰ リクエスト制限に達しました';
                suggestion = '💡 対処法:\n• 1-2分待ってから再試行してください\n• 連続生成を控えめにしてください\n• 後で時間をおいて試してください';
                break;

            case 500:
            case 502:
            case 503:
                baseMessage = '🔧 Googleサーバーで問題が発生しています';
                suggestion = '💡 対処法:\n• しばらく時間をおいて再試行してください\n• Google AI Studioのステータスページを確認してください\n• 数分後に再度お試しください';
                break;

            default:
                baseMessage = '❗ 画像生成に失敗しました';
                // 詳細エラー情報から原因を推測
                const errorText = error.responseText || error.message || '';
                if (errorText.includes('quota')) {
                    suggestion = '💡 対処法:\n• API使用量制限に達している可能性があります\n• Google Cloud Consoleで使用量を確認してください';
                    errorCode = '[エラーコード: QUOTA_EXCEEDED]';
                } else if (errorText.includes('safety')) {
                    suggestion = '💡 対処法:\n• プロンプトの内容を調整してください\n• より適切な表現に変更してお試しください';
                    errorCode = '[エラーコード: SAFETY_FILTER]';
                } else if (errorText.includes('network') || errorText.includes('timeout')) {
                    suggestion = '💡 対処法:\n• インターネット接続を確認してください\n• しばらく時間をおいて再試行してください';
                    errorCode = '[エラーコード: NETWORK_ERROR]';
                } else {
                    suggestion = '💡 対処法:\n• プロンプトを短くしてみてください\n• 参考画像のサイズを小さくしてみてください\n• しばらく時間をおいて再試行してください';
                }
        }

        // 詳細エラー情報があれば追加
        let detailInfo = '';
        if (error.errorData) {
            try {
                const errorData = error.errorData;
                if (errorData.error && errorData.error.message) {
                    detailInfo = `\n\n📋 詳細情報: ${errorData.error.message}`;
                }
            } catch (e) {
                // JSON解析エラーは無視
            }
        }

        return `${baseMessage} ${errorCode}\n\n${suggestion}${detailInfo}`;
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

            // タイマーをクリア（永続表示のため）
            clearTimeout(this.explanationTimeout);
            // タイマーを設定しない（永続表示）
        }
    }

    /**
     * サンプル解説の非表示
     */
    hideSampleExplanation() {
        const content = document.getElementById('sample-explanation-content');
        if (content) {
            content.innerHTML = '<strong>💡 ポイント:</strong> サンプルプロンプトをクリックすると、効果的な書き方のコツが表示されます';
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

                // 画像読み込み完了後に描画マネージャー初期化（srcを設定する前に設定）
                previewImg.onload = () => {
                    console.log(`画像${imageIndex + 1}読み込み完了、描画マネージャーを初期化します`);

                    // 描画ボタンが存在するか確認
                    const drawingBtn = document.getElementById(`toggle-drawing-${imageIndex + 1}`);
                    if (drawingBtn) {
                        console.log(`描画ボタン発見:`, drawingBtn);
                        drawingBtn.style.display = 'inline-block';  // 強制的に表示
                    } else {
                        console.error(`描画ボタンが見つかりません: toggle-drawing-${imageIndex + 1}`);
                    }

                    this.initializeDrawingManager(imageIndex + 1);
                };

                // onloadハンドラー設定後にsrcを設定
                previewImg.src = e.target.result;
                uploadArea.querySelector('.upload-placeholder').style.display = 'none';
                imagePreview.classList.remove('hidden');

                // キャッシュされた画像の場合、onloadが発火しない可能性があるため追加チェック
                if (previewImg.complete && previewImg.naturalHeight !== 0) {
                    console.log(`画像${imageIndex + 1}は既に読み込み済み、即座に描画マネージャーを初期化します`);

                    const drawingBtn = document.getElementById(`toggle-drawing-${imageIndex + 1}`);
                    if (drawingBtn) {
                        console.log(`描画ボタン発見（即座実行）:`, drawingBtn);
                        drawingBtn.style.display = 'inline-block';
                    } else {
                        console.error(`描画ボタンが見つかりません（即座実行）: toggle-drawing-${imageIndex + 1}`);
                    }

                    this.initializeDrawingManager(imageIndex + 1);
                }

                console.log(`参考画像${imageIndex + 1}設定完了`);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('画像処理エラー:', error);
            this.showError('画像の処理に失敗しました');
        }
    }

    /**
     * 描画マネージャー初期化
     */
    initializeDrawingManager(imageIndex) {
        // DrawingManagerが存在するか確認
        if (typeof DrawingManager === 'undefined') {
            console.warn('DrawingManagerクラスが見つかりません。drawing.jsが読み込まれているか確認してください。');
            return;
        }

        // 既存のマネージャーを削除
        if (this.drawingManagers[imageIndex - 1]) {
            delete this.drawingManagers[imageIndex - 1];
        }

        // 新しい描画マネージャーを作成
        try {
            this.drawingManagers[imageIndex - 1] = new DrawingManager(imageIndex);
            console.log(`描画マネージャー${imageIndex}初期化完了`);

            // 描画ボタンが表示されているか確認
            const toggleBtn = document.getElementById(`toggle-drawing-${imageIndex}`);
            if (toggleBtn) {
                console.log(`描画ボタン${imageIndex}が見つかりました:`, toggleBtn);
            } else {
                console.warn(`描画ボタン${imageIndex}が見つかりません`);
            }
        } catch (error) {
            console.error(`描画マネージャー${imageIndex}初期化エラー:`, error);
        }
    }

    /**
     * 参考画像を削除
     */
    removeReferenceImage(imageIndex) {
        this.referenceImages[imageIndex] = null;

        // 描画マネージャーも削除
        if (this.drawingManagers[imageIndex]) {
            delete this.drawingManagers[imageIndex];
        }

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
     * API送信用画像データ準備（描画レイヤー合成）
     */
    prepareImagesForAPI() {
        const preparedImages = [];

        for (let i = 0; i < this.referenceImages.length; i++) {
            if (this.referenceImages[i] !== null) {
                // 描画マネージャーがあり、描画データがある場合は合成画像を使用
                if (this.drawingManagers[i] && this.drawingManagers[i].allPaths.length > 0) {
                    try {
                        const compositeImageData = this.drawingManagers[i].exportCompositeImage();
                        const base64Data = compositeImageData.split(',')[1];
                        preparedImages.push({
                            type: 'image/png',
                            data: base64Data
                        });
                        console.log(`画像${i + 1}: 描画レイヤー付きで送信`);
                    } catch (error) {
                        console.error(`画像${i + 1}合成エラー:`, error);
                        // エラー時は元画像を使用
                        preparedImages.push(this.referenceImages[i]);
                    }
                } else {
                    // 描画データがない場合は元画像をそのまま使用
                    preparedImages.push(this.referenceImages[i]);
                }
            }
        }

        return preparedImages;
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

            const imageData = await this.callGeminiAPI(this.lastPrompt, '1:1', this.referenceImages);
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
        this.elements.template7Form.classList.toggle('hidden', mode !== 'template7');
        this.elements.template8Form.classList.toggle('hidden', mode !== 'template8');

        // 参考画像セクションは全モードで表示（モードごとに適切な説明で表示）
        if (this.elements.referenceImageSection) {
            this.elements.referenceImageSection.classList.remove('hidden');
            this.updateReferenceImageSectionTitle(mode);
        }

        // 現在のモードを記録
        this.currentMode = mode;

        console.log('モード切り替え:', mode);
    }

    /**
     * 参考画像セクションのタイトルをモードに応じて更新
     */
    updateReferenceImageSectionTitle(mode) {
        const titleElement = this.elements.referenceImageSection.querySelector('h2');
        if (!titleElement) return;

        switch(mode) {
            case 'freeform':
                titleElement.textContent = '参考画像（オプション - 最大2枚）';
                break;
            case 'template5':
                titleElement.textContent = '参考画像（必須 - 2枚）';
                break;
            case 'template6':
                titleElement.textContent = '参考画像（オプション - 最大2枚）';
                break;
            case 'template7':
                titleElement.textContent = '参考画像（オプション - 最大2枚）';
                break;
            case 'template8':
                titleElement.textContent = '参考画像（オプション - 最大2枚）';
                break;
            default:
                titleElement.textContent = '参考画像（オプション - 最大2枚）';
        }
    }

    /**
     * Template 6専用：アスペクト比制御用参照画像を生成
     */
    generateReferenceImage(aspectRatio) {
        // アスペクト比から幅と高さを計算
        const { width, height } = this.getAspectRatioDimensions(aspectRatio);

        // キャンバスを作成
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        // 白い背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 細い黒い外枠（境界を明示）
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);

        // 内側に「安全エリア」を示すグリッド
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        const gridMargin = 16;

        // 縦線
        for (let i = 1; i < 4; i++) {
            const x = gridMargin + (width - gridMargin * 2) * i / 4;
            ctx.beginPath();
            ctx.moveTo(x, gridMargin);
            ctx.lineTo(x, height - gridMargin);
            ctx.stroke();
        }

        // 横線
        for (let i = 1; i < 3; i++) {
            const y = gridMargin + (height - gridMargin * 2) * i / 3;
            ctx.beginPath();
            ctx.moveTo(gridMargin, y);
            ctx.lineTo(width - gridMargin, y);
            ctx.stroke();
        }

        // 中央にアスペクト比テキストを大きく描画
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.min(width, height) / 8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(aspectRatio, width / 2, height / 2);

        // 「FIT CONTENT HERE」の指示テキスト
        ctx.fillStyle = '#666666';
        ctx.font = `${Math.min(width, height) / 16}px Arial`;
        ctx.fillText('FIT CONTENT HERE', width / 2, height / 2 + Math.min(width, height) / 12);

        // Base64データを取得
        const dataURL = canvas.toDataURL('image/png');
        const base64Data = dataURL.split(',')[1];

        console.log(`🎯 Template 6用参照画像生成 - ${aspectRatio} (${width}x${height})`);

        return {
            type: 'image/png',
            data: base64Data
        };
    }

    /**
     * アスペクト比から最適な寸法を計算
     */
    getAspectRatioDimensions(aspectRatio) {
        // 基準サイズ（APIの制限内で適切なサイズ）
        const baseSize = 512;

        switch(aspectRatio) {
            case '1:1':
                return { width: baseSize, height: baseSize };
            case '16:9':
                // 16:9 = 1.777... なので width基準
                return { width: baseSize, height: Math.round(baseSize * 9 / 16) };
            case '9:16':
                // 9:16 = 0.5625 なので height基準
                return { width: Math.round(baseSize * 9 / 16), height: baseSize };
            default:
                return { width: baseSize, height: baseSize };
        }
    }

    /**
     * Template 5のプロンプトプレビュー更新（翻訳なし）
     */
    updateTemplate5Preview() {
        const element1 = this.elements.t5Element1.value.trim();
        const element2 = this.elements.t5Element2.value.trim();
        const integration = this.elements.t5Integration.value.trim();

        if (!element1 || !element2) {
            this.elements.t5Preview.value = 'フォームを入力すると、ここにプロンプトが表示されます';
            this.currentTemplate5Prompt = null;
            return;
        }

        // プレビューでは翻訳せず、日本語のまま表示
        const prompt = `Using the provided images, place ${element2} onto ${element1}. Ensure that the features of ${element1} remain completely unchanged. The added element should ${integration || 'integrate naturally'}.`;

        // プロンプト本体を保存（生成時に使用）
        this.currentTemplate5Prompt = prompt;

        this.elements.t5Preview.value = prompt;
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
        const aspectDetails = this.getTemplate6AspectDetails(aspect);

        if (!foreground || !background) {
            this.elements.t6Preview.value = 'フォームを入力すると、ここにプロンプトが表示されます';
            this.currentTemplate6Prompt = null;
            return;
        }

        let prompt = `A single comic book panel in a ${style} style. In the foreground, ${foreground}. In the background, ${background}.`;

        if (text) {
            prompt += ` The panel has a caption box with the text '${text}'.`;
        }

        prompt += ` The lighting creates a ${mood} mood. ${aspectDetails.promptSuffix}`;

        // プロンプト本体を保存（生成時に使用）
        this.currentTemplate6Prompt = prompt;

        console.log('🔍 DEBUG: プロンプト作成完了:', prompt);
        console.log('🔍 DEBUG: プロンプト長:', prompt.length);

        this.elements.t6Preview.value = prompt;

        console.log('🔍 DEBUG: DOM表示後の内容:', this.elements.t6Preview.textContent);
        console.log('🔍 DEBUG: DOM表示後の長さ:', this.elements.t6Preview.textContent.length);
    }

    /**
     * 複数テキストを1回で翻訳（高速版）
     */
    async translateMultipleTexts(texts) {
        if (!this.apiKey) {
            return texts; // APIキーがない場合はそのまま返す
        }

        try {
            const textList = texts.map((text, index) => `${index + 1}. ${text}`).join('\n');

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Translate the following numbered texts to English. Return only the translations in the same order, one per line:\n\n${textList}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 5000
                    }
                })
            });

            if (!response.ok) {
                console.error('Translation failed, using original texts');
                return texts;
            }

            const data = await response.json();
            const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            const translatedArray = translatedText.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim());

            return translatedArray.length === texts.length ? translatedArray : texts;
        } catch (error) {
            console.error('Translation error:', error);
            return texts;
        }
    }


    /**
     * 日本語を英語に翻訳（簡易版）
     */
    async translateToEnglish(text) {
        // Gemini APIを使用して翻訳
        console.log('🔍 DEBUG: translateToEnglish 開始');
        console.log('🔍 DEBUG: 入力テキスト:', text);
        console.log('🔍 DEBUG: 入力テキスト長:', text.length);

        if (!this.apiKey) {
            console.log('🔍 DEBUG: APIキーなし、そのまま返す');
            return text; // APIキーがない場合はそのまま返す
        }

        try {
            const apiPrompt = `Translate Japanese to English. Keep English unchanged.
Text: ${text}
Translation:`;
            console.log('🔍 DEBUG: API送信プロンプト:', apiPrompt);
            console.log('🔍 DEBUG: API送信プロンプト長:', apiPrompt.length);

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: apiPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 5000
                    }
                })
            });

            if (!response.ok) {
                console.error('Translation failed, using original text');
                return text;
            }

            const data = await response.json();
            console.log('🔍 DEBUG: API レスポンス:', data);
            const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
            console.log('🔍 DEBUG: 翻訳結果:', translated);
            console.log('🔍 DEBUG: 翻訳結果長:', translated.length);
            return translated;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }

    /**
     * Template 5での画像生成
     */
    async generateTemplate5() {
        const element1 = this.elements.t5Element1.value.trim();
        const element2 = this.elements.t5Element2.value.trim();

        if (!element1 || !element2) {
            this.showError('保持する要素と追加する要素の両方を入力してください');
            return;
        }

        if (!this.referenceImages[0] || !this.referenceImages[1]) {
            this.showError('Template 5では2枚の参考画像が必要です');
            return;
        }

        // 自動翻訳スイッチの状態を確認
        const autoTranslate = document.getElementById('t5-auto-translate').checked;

        // プレビューに表示されているプロンプトを取得
        const originalPrompt = this.elements.t5Preview.value;

        let finalPrompt;

        if (autoTranslate) {
            // 自動翻訳ON：翻訳してから生成
            this.elements.t5Preview.value = '翻訳しています...';
            const translatedPrompt = await this.translateToEnglish(originalPrompt);
            this.elements.t5Preview.value = translatedPrompt;
            await new Promise(resolve => setTimeout(resolve, 500));
            finalPrompt = this.elements.t5Preview.value;
        } else {
            // 自動翻訳OFF：そのまま生成
            finalPrompt = originalPrompt;
        }

        console.log('🎯 最終プロンプト:', finalPrompt);

        await this.performGeneration(finalPrompt);
    }

    /**
     * Template 6での画像生成
     */
    async generateTemplate6() {
        const foreground = this.elements.t6Foreground.value.trim();
        const background = this.elements.t6Background.value.trim();
        const aspect = this.elements.t6Aspect.value;

        if (!foreground || !background) {
            this.showError('前景のキャラクターと背景の詳細を入力してください');
            return;
        }

        // 自動翻訳スイッチの状態を確認
        const autoTranslate = document.getElementById('t6-auto-translate').checked;

        // プレビューに表示されているプロンプトを取得
        const originalPrompt = this.elements.t6Preview.value;

        let finalPrompt;

        if (autoTranslate) {
            // 自動翻訳ON：翻訳してから生成
            this.elements.t6Preview.value = '翻訳しています...';
            const translatedPrompt = await this.translateToEnglish(originalPrompt);
            this.elements.t6Preview.value = translatedPrompt;
            await new Promise(resolve => setTimeout(resolve, 500));
            finalPrompt = this.elements.t6Preview.value;
        } else {
            // 自動翻訳OFF：そのまま生成
            finalPrompt = originalPrompt;
        }

        const { aspectRatio } = this.getTemplate6AspectDetails(aspect);
        this.currentImageSize = aspectRatio;
        await this.performGeneration(finalPrompt, aspectRatio);
    }

    /**
     * 共通の生成処理
     */
    async performGeneration(prompt, overrideSizeRatio = null) {
        if (!this.validateGeneration(prompt)) {
            return;
        }

        this.isGenerating = true;
        this.showLoading();
        this.updateUI();

        try {
            console.log('テンプレート生成開始:', prompt);

            const targetAspect = overrideSizeRatio || this.currentImageSize;
            const imageData = await this.callGeminiAPI(prompt, targetAspect, this.prepareImagesForAPI());
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

    /**
     * Template6 アスペクト設定
     */
    getTemplate6AspectDetails(aspectLabel) {
        switch (aspectLabel) {
            case 'Landscape':
                return {
                    promptSuffix: 'Use a cinematic landscape layout with a 16:9 aspect ratio.',
                    aspectRatio: '16:9'
                };
            case 'Portrait':
                return {
                    promptSuffix: 'Use a tall portrait layout with a 9:16 aspect ratio.',
                    aspectRatio: '9:16'
                };
            case 'Square':
            default:
                return {
                    promptSuffix: 'Use a perfectly square layout with a 1:1 aspect ratio.',
                    aspectRatio: '1:1'
                };
        }
    }

    /**
     * Template 7のプロンプトプレビュー更新
     */
    updateTemplate7Preview() {
        const style = this.elements.t7Style.value;
        const subject = this.elements.t7Subject.value.trim();
        const characteristics = this.elements.t7Characteristics.value.trim();
        const background = this.elements.t7Background.value;

        if (!subject) {
            this.elements.t7Preview.value = 'フォームを入力すると、ここにプロンプトが表示されます';
            this.currentTemplate7Prompt = null;
            return;
        }

        const prompt = this.buildTemplate7Prompt(style, subject, characteristics, background);

        // プロンプト本体を保存（生成時に使用）
        this.currentTemplate7Prompt = prompt;

        this.elements.t7Preview.value = prompt;
    }

    /**
     * Template 7のプロンプトを構築
     */
    buildTemplate7Prompt(style, subject, characteristics, background) {
        let prompt = `A ${style} style sticker featuring ${subject}`;

        if (characteristics) {
            prompt += ` with ${characteristics}`;
        }

        prompt += '. The design should have clean edges, vibrant colors, and work well as a standalone sticker.';
        prompt += ` ${this.getTemplate7BackgroundSuffix(background)}`;

        return prompt;
    }

    /**
     * Template 7背景オプションの文字列を取得
     */
    getTemplate7BackgroundSuffix(background) {
        const backgroundOptions = {
            'transparent': 'transparent background.',
            'solid': 'solid color background.',
            'none': 'no background.'
        };
        return backgroundOptions[background] || 'transparent background.';
    }

    /**
     * Template 7での画像生成
     */
    async generateTemplate7() {
        const subject = this.elements.t7Subject.value.trim();

        if (!subject) {
            this.showError('主題を入力してください');
            return;
        }

        // 自動翻訳スイッチの状態を確認
        const autoTranslate = document.getElementById('t7-auto-translate').checked;

        // プレビューに表示されているプロンプトを取得
        const originalPrompt = this.elements.t7Preview.value;

        let finalPrompt;

        if (autoTranslate) {
            // 自動翻訳ON：翻訳してから生成
            this.elements.t7Preview.value = '翻訳しています...';
            const translatedPrompt = await this.translateToEnglish(originalPrompt);
            this.elements.t7Preview.value = translatedPrompt;
            await new Promise(resolve => setTimeout(resolve, 500));
            finalPrompt = this.elements.t7Preview.value;
        } else {
            // 自動翻訳OFF：そのまま生成
            finalPrompt = originalPrompt;
        }

        console.log('🎯 Template 7 最終プロンプト:', finalPrompt);

        await this.performGeneration(finalPrompt);
    }

    /**
     * Template 8のプロンプトプレビュー更新
     */
    updateTemplate8Preview() {
        const text = this.elements.t8Text.value.trim();
        const designType = this.elements.t8DesignType.value;
        const fontStyle = this.elements.t8FontStyle.value;
        const placement = this.elements.t8Placement.value;
        const colorTheme = this.elements.t8ColorTheme.value;

        if (!text) {
            this.elements.t8Preview.value = 'フォームを入力すると、ここにプロンプトが表示されます';
            this.currentTemplate8Prompt = null;
            return;
        }

        const prompt = this.buildTemplate8Prompt(text, designType, fontStyle, placement, colorTheme);

        // プロンプト本体を保存（生成時に使用）
        this.currentTemplate8Prompt = prompt;

        this.elements.t8Preview.value = prompt;
    }

    /**
     * Template 8のプロンプトを構築
     */
    buildTemplate8Prompt(text, designType, fontStyle, placement, colorTheme) {
        const components = [
            `Create a ${designType} with the text '${text}' in ${fontStyle} font.`,
            `Position the text ${placement} with ${colorTheme} color scheme.`,
            'The design should be clean and readable.'
        ];

        return components.join(' ');
    }

    /**
     * Template 8の入力バリデーション
     */
    validateTemplate8Input(text) {
        if (!text) {
            this.showError('テキスト内容を入力してください');
            return false;
        }

        if (text.length > 100) {
            this.showError('テキストは100文字以内にしてください');
            return false;
        }

        return true;
    }

    /**
     * Template 8での画像生成
     */
    async generateTemplate8() {
        const text = this.elements.t8Text.value.trim();

        if (!this.validateTemplate8Input(text)) {
            return;
        }

        // 自動翻訳スイッチの状態を確認
        const autoTranslate = document.getElementById('t8-auto-translate').checked;

        // プレビューに表示されているプロンプトを取得
        const originalPrompt = this.elements.t8Preview.value;

        let finalPrompt;

        if (autoTranslate) {
            // 自動翻訳ON：翻訳してから生成
            this.elements.t8Preview.value = '翻訳しています...';
            const translatedPrompt = await this.translateToEnglish(originalPrompt);
            this.elements.t8Preview.value = translatedPrompt;
            await new Promise(resolve => setTimeout(resolve, 500));
            finalPrompt = this.elements.t8Preview.value;
        } else {
            // 自動翻訳OFF：そのまま生成
            finalPrompt = originalPrompt;
        }

        console.log('🎯 Template 8 最終プロンプト:', finalPrompt);

        await this.performGeneration(finalPrompt);
    }

    /**
     * PWAインストール機能の初期化
     */
    initPWAInstall() {
        // インストールプロンプトイベントをキャプチャ
        window.addEventListener('beforeinstallprompt', (e) => {
            // デフォルトのプロンプトを防ぐ
            e.preventDefault();
            // 後で使用するために保存
            this.deferredPrompt = e;
            console.log('PWAインストールプロンプトをキャプチャしました');

            // インストールボタンを表示（初回のみ自動表示）
            if (!localStorage.getItem('pwa-install-dismissed')) {
                this.showInstallPrompt();
            }
        });

        // インストール成功時の処理
        window.addEventListener('appinstalled', () => {
            console.log('PWAがインストールされました');
            this.deferredPrompt = null;
            this.hideInstallPrompt();
        });

        // すでにPWAとしてインストールされているかチェック
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('PWAモードで実行中');
        }
    }

    /**
     * インストールプロンプトの表示
     */
    showInstallPrompt() {
        if (!this.deferredPrompt) return;

        // インストール通知バナーを作成
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-banner-content">
                <div class="pwa-banner-icon">📱</div>
                <div class="pwa-banner-text">
                    <strong>nano-bananaをインストール</strong>
                    <p>ホーム画面に追加してアプリとして使用できます</p>
                </div>
                <div class="pwa-banner-actions">
                    <button id="pwa-install-btn" class="btn btn-primary btn-small">インストール</button>
                    <button id="pwa-dismiss-btn" class="btn btn-secondary btn-small">後で</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // インストールボタンのクリックハンドラ
        document.getElementById('pwa-install-btn').addEventListener('click', async () => {
            if (!this.deferredPrompt) return;

            // プロンプトを表示
            this.deferredPrompt.prompt();

            // ユーザーの選択を待つ
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`ユーザーの選択: ${outcome}`);

            if (outcome === 'accepted') {
                console.log('PWAインストールが承認されました');
            } else {
                console.log('PWAインストールがキャンセルされました');
            }

            // プロンプトを再利用できないのでクリア
            this.deferredPrompt = null;
            this.hideInstallPrompt();
        });

        // 後でボタンのクリックハンドラ
        document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
            localStorage.setItem('pwa-install-dismissed', 'true');
            this.hideInstallPrompt();
        });

        // アニメーション付きで表示
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    /**
     * インストールプロンプトを非表示
     */
    hideInstallPrompt() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

}

/**
 * アプリ初期化
 */
document.addEventListener('DOMContentLoaded', () => {
    const app = new NanoBananaApp();
    app.init();
    // グローバルスコープに登録（デバッグ用）
    window.app = app;
});
