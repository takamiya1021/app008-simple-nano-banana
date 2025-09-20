/**
 * DrawingManager - 描画機能を管理するクラス
 * 画像の上に描画レイヤーを追加し、線や図形での指示エリア指定を可能にする
 */

class DrawingManager {
    constructor(imageIndex) {
        this.imageIndex = imageIndex;
        this.canvas = document.getElementById(`drawing-canvas-${imageIndex}`);
        this.ctx = this.canvas.getContext('2d');
        this.img = document.getElementById(`preview-img-${imageIndex}`);
        this.drawingTools = document.getElementById(`drawing-tools-${imageIndex}`);

        // 描画状態
        this.isDrawing = false;
        this.isDrawingModeActive = false; // 描画モードの状態管理
        this.startX = 0;
        this.startY = 0;
        this.currentTool = 'pen';
        this.currentColor = '#ff0000';
        this.lineWidth = 3;

        // パス保存（フリーハンド用）
        this.currentPath = [];
        this.allPaths = [];

        // 図形描画用の一時Canvas
        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');

        this.initializeCanvas();
        this.bindEvents();
    }

    /**
     * Canvas初期化
     */
    initializeCanvas() {
        // 画像サイズに合わせてCanvasサイズを設定
        const updateCanvasSize = () => {
            const rect = this.img.getBoundingClientRect();
            this.canvas.width = this.img.naturalWidth;
            this.canvas.height = this.img.naturalHeight;
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';

            // 一時Canvasも同じサイズに
            this.tempCanvas.width = this.canvas.width;
            this.tempCanvas.height = this.canvas.height;

            // 既存の描画を復元
            this.redrawAllPaths();
        };

        // 初期設定
        updateCanvasSize();

        // リサイズ時の更新
        window.addEventListener('resize', updateCanvasSize);

        // 画像読み込み完了時の更新
        this.img.addEventListener('load', updateCanvasSize);
    }

    /**
     * イベントハンドラー設定
     */
    bindEvents() {
        // 描画モード切り替え
        const toggleBtn = document.getElementById(`toggle-drawing-${this.imageIndex}`);
        toggleBtn.addEventListener('click', () => this.toggleDrawingMode());

        // 描画完了
        const doneBtn = document.getElementById(`drawing-done-${this.imageIndex}`);
        doneBtn.addEventListener('click', () => this.finishDrawing());

        // 消去
        const clearBtn = document.getElementById(`clear-drawing-${this.imageIndex}`);
        clearBtn.addEventListener('click', () => this.clearDrawing());

        // ツール選択
        this.drawingTools.addEventListener('click', (e) => {
            e.preventDefault(); // デフォルト動作を防ぐ
            e.stopPropagation(); // イベントバブリングを停止

            if (e.target.classList.contains('tool-btn')) {
                this.selectTool(e.target.dataset.tool);
                this.updateToolButtons();
            }
            if (e.target.classList.contains('color-btn')) {
                this.selectColor(e.target.dataset.color);
                this.updateColorButtons();
            }
        });

        // Canvas描画イベント
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // タッチイベント（モバイル対応）
        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.draw(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
    }

    /**
     * 描画モード切り替え
     */
    toggleDrawingMode() {
        const fileInput = document.getElementById(`reference-image-${this.imageIndex}`);
        const uploadArea = document.getElementById(`image-upload-area-${this.imageIndex}`);

        if (this.isDrawingModeActive) {
            // 描画モード終了
            this.canvas.classList.add('hidden');
            this.drawingTools.classList.add('hidden');
            this.isDrawingModeActive = false;
            document.getElementById(`toggle-drawing-${this.imageIndex}`).textContent = '🎨 描画モード';

            // ファイル入力を再有効化
            fileInput.style.pointerEvents = 'auto';
            uploadArea.classList.remove('drawing-mode-active');
        } else {
            // 描画モード開始
            this.canvas.classList.remove('hidden');
            this.drawingTools.classList.remove('hidden');
            this.isDrawingModeActive = true;
            document.getElementById(`toggle-drawing-${this.imageIndex}`).textContent = '👁️ 表示モード';

            // ファイル入力を無効化
            fileInput.style.pointerEvents = 'none';
            uploadArea.classList.add('drawing-mode-active');
        }
    }

    /**
     * 座標取得（マウス・タッチ対応）
     */
    getCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    /**
     * 描画開始
     */
    startDrawing(e) {
        if (e.preventDefault) e.preventDefault();

        this.isDrawing = true;
        const coords = this.getCoordinates(e);
        this.startX = coords.x;
        this.startY = coords.y;

        if (this.currentTool === 'pen') {
            this.currentPath = [{ x: coords.x, y: coords.y }];
        }
    }

    /**
     * 描画中
     */
    draw(e) {
        if (!this.isDrawing) return;
        if (e.preventDefault) e.preventDefault();

        const coords = this.getCoordinates(e);

        switch (this.currentTool) {
            case 'pen':
                this.currentPath.push({ x: coords.x, y: coords.y });
                this.drawFreeLine(this.currentPath);
                break;
            case 'eraser':
                this.erase(coords.x, coords.y);
                break;
            case 'line':
            case 'rect':
            case 'circle':
                this.drawPreview(coords.x, coords.y);
                break;
        }
    }

    /**
     * 描画終了
     */
    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        if (this.currentTool === 'pen' && this.currentPath.length > 0) {
            this.allPaths.push({
                type: 'pen',
                color: this.currentColor,
                lineWidth: this.lineWidth,
                points: [...this.currentPath]
            });
        } else if (['line', 'rect', 'circle'].includes(this.currentTool)) {
            this.finalizeShape();
        }
    }

    /**
     * フリーハンド描画
     */
    drawFreeLine(path) {
        this.redrawAllPaths();

        if (path.length < 2) return;

        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);

        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }

        this.ctx.stroke();
    }

    /**
     * 図形プレビュー描画
     */
    drawPreview(endX, endY) {
        this.redrawAllPaths();

        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();

        switch (this.currentTool) {
            case 'line':
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(endX, endY);
                break;
            case 'rect':
                const width = endX - this.startX;
                const height = endY - this.startY;
                this.ctx.rect(this.startX, this.startY, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(
                    Math.pow(endX - this.startX, 2) + Math.pow(endY - this.startY, 2)
                );
                this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                break;
        }

        this.ctx.stroke();
    }

    /**
     * 図形確定
     */
    finalizeShape() {
        const coords = this.getCoordinates(event);

        this.allPaths.push({
            type: this.currentTool,
            color: this.currentColor,
            lineWidth: this.lineWidth,
            startX: this.startX,
            startY: this.startY,
            endX: coords.x,
            endY: coords.y
        });

        this.redrawAllPaths();
    }

    /**
     * 消しゴム機能
     */
    erase(x, y) {
        const eraseRadius = 10;
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, eraseRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * 全パス再描画
     */
    redrawAllPaths() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.allPaths.forEach(path => {
            this.ctx.strokeStyle = path.color;
            this.ctx.lineWidth = path.lineWidth;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.ctx.beginPath();

            switch (path.type) {
                case 'pen':
                    if (path.points.length < 2) break;
                    this.ctx.moveTo(path.points[0].x, path.points[0].y);
                    for (let i = 1; i < path.points.length; i++) {
                        this.ctx.lineTo(path.points[i].x, path.points[i].y);
                    }
                    break;
                case 'line':
                    this.ctx.moveTo(path.startX, path.startY);
                    this.ctx.lineTo(path.endX, path.endY);
                    break;
                case 'rect':
                    const width = path.endX - path.startX;
                    const height = path.endY - path.startY;
                    this.ctx.rect(path.startX, path.startY, width, height);
                    break;
                case 'circle':
                    const radius = Math.sqrt(
                        Math.pow(path.endX - path.startX, 2) + Math.pow(path.endY - path.startY, 2)
                    );
                    this.ctx.arc(path.startX, path.startY, radius, 0, 2 * Math.PI);
                    break;
            }

            this.ctx.stroke();
        });
    }

    /**
     * 描画消去
     */
    clearDrawing() {
        this.allPaths = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 描画完了
     */
    finishDrawing() {
        const fileInput = document.getElementById(`reference-image-${this.imageIndex}`);
        const uploadArea = document.getElementById(`image-upload-area-${this.imageIndex}`);

        // 描画ツールのみを非表示にし、Canvasは表示したまま
        this.drawingTools.classList.add('hidden');
        this.isDrawingModeActive = false; // 状態をリセット
        document.getElementById(`toggle-drawing-${this.imageIndex}`).textContent = '🎨 描画モード';

        // ファイル入力を再有効化
        fileInput.style.pointerEvents = 'auto';
        uploadArea.classList.remove('drawing-mode-active');

        // AI指示用のプロンプト生成
        if (this.allPaths.length > 0) {
            this.generateAIInstructions();
        }
    }

    /**
     * AI指示プロンプト生成
     */
    generateAIInstructions() {
        const colorNames = {
            '#ff0000': '赤い線',
            '#0000ff': '青い線',
            '#00ff00': '緑の線',
            '#ffff00': '黄色い線',
            '#000000': '黒い線'
        };

        const usedColors = [...new Set(this.allPaths.map(path => path.color))];

        if (usedColors.length > 0) {
            const instructions = usedColors.map(color => {
                const colorName = colorNames[color] || '線';
                return `${colorName}で囲んだ・指示した部分`;
            }).join('と');

            // プロンプト入力欄に追加
            const promptInput = document.getElementById('prompt');
            const currentPrompt = promptInput.value.trim();
            const addition = `\n\n【指示エリア】: ${instructions}を重視して`;

            if (currentPrompt) {
                promptInput.value = currentPrompt + addition;
            } else {
                promptInput.value = `画像${this.imageIndex}の${instructions}を重視して生成してください。`;
            }

            // 文字数更新
            const app = document.querySelector('#prompt')?.__vue__ || window.app;
            if (app && app.updateCharCount) {
                app.updateCharCount();
            } else {
                // 手動で文字数イベントを発火
                promptInput.dispatchEvent(new Event('input'));
            }

            console.log(`画像${this.imageIndex}に描画指示を追加:`, instructions);
        }
    }

    /**
     * 画像と描画を合成してエクスポート
     */
    exportCompositeImage() {
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');

        exportCanvas.width = this.img.naturalWidth;
        exportCanvas.height = this.img.naturalHeight;

        // 元画像を描画
        exportCtx.drawImage(this.img, 0, 0);

        // 描画レイヤーを重ねる
        exportCtx.drawImage(this.canvas, 0, 0);

        return exportCanvas.toDataURL('image/png');
    }

    /**
     * ツールボタン状態更新
     */
    updateToolButtons() {
        this.drawingTools.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === this.currentTool);
        });
    }

    /**
     * カラーボタン状態更新
     */
    updateColorButtons() {
        this.drawingTools.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === this.currentColor);
        });
    }

    /**
     * ツール選択
     */
    selectTool(tool) {
        this.currentTool = tool;
    }

    /**
     * 色選択
     */
    selectColor(color) {
        this.currentColor = color;
    }
}

// グローバルスコープに登録
window.DrawingManager = DrawingManager;