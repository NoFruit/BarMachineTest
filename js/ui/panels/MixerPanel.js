// ============================================
// MixerPanel — 调酒机面板
// 左侧：桶形固体缓存 + 实时平均四维 + 清空/导出
// 中间：机器名 + 运行按钮 + 液体产物缓存 + 产物四维显示
// 右侧：椭圆液体缓存 + 导入/清空/导出 + 液体四维显示
// ============================================

class MixerPanel {
    constructor(containerOrId, mixer, options = {}) {
        if (typeof containerOrId === 'string') {
            this._container = document.getElementById(containerOrId);
        } else {
            this._container = containerOrId;
        }
        if (!this._container) {
            throw new Error('[MixerPanel] 容器不存在: ' + containerOrId);
        }

        this._mixer = mixer;
        this._onRun = options.onRun || null;
        this._onClearSolid = options.onClearSolid || null;
        this._onExportSolid = options.onExportSolid || null;
        this._onImportLiquid = options.onImportLiquid || null;
        this._onClearLiquid = options.onClearLiquid || null;
        this._onExportLiquid = options.onExportLiquid || null;
        this._onExportProduct = options.onExportProduct || null;
        this._getShell = options.getShell || null;

        this._importModal = null;
        this._initDOM();
        this.render();
    }

    _initDOM() {
        this._container.classList.add('mixer-panel');
        this._container.innerHTML = '';

        // ===== 左侧：固体缓存区 =====
        const leftSection = document.createElement('div');
        leftSection.className = 'dist-section dist-solid-section';

        const solidBarrel = document.createElement('div');
        solidBarrel.className = 'dist-barrel';
        solidBarrel.innerHTML = `
            <div class="barrel-top"></div>
            <div class="barrel-body">
                <div class="barrel-label">固体缓存</div>
                <div class="barrel-count" id="mixer-solid-count">0 个</div>
            </div>
            <div class="barrel-bottom"></div>
        `;

        // 平均四维显示
        const avgAttrs = document.createElement('div');
        avgAttrs.className = 'mixer-attrs';
        avgAttrs.innerHTML = `
            <div class="mixer-attr-row"><span class="mixer-attr-label">A</span><span id="mixer-avg-a">-</span></div>
            <div class="mixer-attr-row"><span class="mixer-attr-label">B</span><span id="mixer-avg-b">-</span></div>
            <div class="mixer-attr-row"><span class="mixer-attr-label">C</span><span id="mixer-avg-c">-</span></div>
            <div class="mixer-attr-row"><span class="mixer-attr-label">D</span><span id="mixer-avg-d">-</span></div>
        `;

        const solidActions = document.createElement('div');
        solidActions.className = 'dist-actions';

        const btnClearSolid = document.createElement('button');
        btnClearSolid.className = 'dist-btn';
        btnClearSolid.textContent = '清空';
        btnClearSolid.addEventListener('click', () => { if (this._onClearSolid) this._onClearSolid(); });

        const btnExportSolid = document.createElement('button');
        btnExportSolid.className = 'dist-btn';
        btnExportSolid.textContent = '导出';
        btnExportSolid.addEventListener('click', () => { if (this._onExportSolid) this._onExportSolid(); });

        solidActions.appendChild(btnClearSolid);
        solidActions.appendChild(btnExportSolid);
        leftSection.appendChild(solidBarrel);
        leftSection.appendChild(avgAttrs);
        leftSection.appendChild(solidActions);

        // ===== 中间：控制区 + 产品槽 =====
        const centerSection = document.createElement('div');
        centerSection.className = 'dist-section dist-center-section';

        const machineName = document.createElement('div');
        machineName.className = 'dist-machine-name';
        machineName.textContent = this._mixer ? this._mixer.name : '调酒机';

        // 运行按钮
        const runBtn = document.createElement('button');
        runBtn.className = 'dist-run-btn';
        runBtn.textContent = '▶ 启动调酒机';
        runBtn.addEventListener('click', () => { if (this._onRun) this._onRun(); });

        // 产物液体罐
        const productArea = document.createElement('div');
        productArea.className = 'mixer-product-area';
        productArea.innerHTML = '<div class="mixer-product-label">产物缓存</div>';

        this._productCan = document.createElement('div');
        this._productCan.className = 'dist-can';
        this._productCan.innerHTML = `
            <div class="can-body">
                <div class="can-label">产物液体</div>
                <div class="can-inner">
                    <div class="can-fill" id="mixer-product-fill"></div>
                </div>
                <div class="can-info" id="mixer-product-info">0 / 999</div>
            </div>
        `;
        productArea.appendChild(this._productCan);

        // 产物四维显示
        const prodAttrs = document.createElement('div');
        prodAttrs.className = 'mixer-attrs';
        prodAttrs.innerHTML = `
            <div class="mixer-attr-row"><span class="mixer-attr-label">A</span><span id="mixer-prod-a">-</span></div>
            <div class="mixer-attr-row"><span class="mixer-attr-label">B</span><span id="mixer-prod-b">-</span></div>
            <div class="mixer-attr-row"><span class="mixer-attr-label">C</span><span id="mixer-prod-c">-</span></div>
            <div class="mixer-attr-row"><span class="mixer-attr-label">D</span><span id="mixer-prod-d">-</span></div>
        `;

        // 产物操作按钮
        const productActions = document.createElement('div');
        productActions.className = 'dist-actions';

        const btnExportProduct = document.createElement('button');
        btnExportProduct.className = 'dist-btn';
        btnExportProduct.textContent = '导出';
        btnExportProduct.addEventListener('click', () => { if (this._onExportProduct) this._onExportProduct(); });

        productActions.appendChild(btnExportProduct);

        centerSection.appendChild(machineName);
        centerSection.appendChild(runBtn);
        centerSection.appendChild(productArea);
        centerSection.appendChild(prodAttrs);
        centerSection.appendChild(productActions);

        // ===== 右侧：液体缓存区 =====
        const rightSection = document.createElement('div');
        rightSection.className = 'dist-section dist-liquid-section';

        const liquidCan = document.createElement('div');
        liquidCan.className = 'dist-can';
        liquidCan.innerHTML = `
            <div class="can-body">
                <div class="can-label">液体缓存</div>
                <div class="can-inner">
                    <div class="can-fill" id="mixer-can-fill"></div>
                </div>
                <div class="can-info" id="mixer-liquid-info">0 / 999</div>
            </div>
        `;

        // 液体四维显示
        const liqAttrs = document.createElement('div');
        liqAttrs.className = 'mixer-attrs';
        liqAttrs.innerHTML = `
            <div class="mixer-attr-row"><span class="mixer-attr-label">A</span><span id="mixer-liq-a">-</span></div>
            <div class="mixer-attr-row"><span class="mixer-attr-label">B</span><span id="mixer-liq-b">-</span></div>
            <div class="mixer-attr-row"><span class="mixer-attr-label">C</span><span id="mixer-liq-c">-</span></div>
            <div class="mixer-attr-row"><span class="mixer-attr-label">D</span><span id="mixer-liq-d">-</span></div>
        `;

        const liquidActions = document.createElement('div');
        liquidActions.className = 'dist-actions';

        const btnImport = document.createElement('button');
        btnImport.className = 'dist-btn';
        btnImport.textContent = '导入';
        btnImport.addEventListener('click', () => this._openImportModal());

        const btnClearLiquid = document.createElement('button');
        btnClearLiquid.className = 'dist-btn';
        btnClearLiquid.textContent = '清空';
        btnClearLiquid.addEventListener('click', () => { if (this._onClearLiquid) this._onClearLiquid(); });

        const btnExportLiquid = document.createElement('button');
        btnExportLiquid.className = 'dist-btn';
        btnExportLiquid.textContent = '导出';
        btnExportLiquid.addEventListener('click', () => { if (this._onExportLiquid) this._onExportLiquid(); });

        liquidActions.appendChild(btnImport);
        liquidActions.appendChild(btnClearLiquid);
        liquidActions.appendChild(btnExportLiquid);

        rightSection.appendChild(liquidCan);
        rightSection.appendChild(liqAttrs);
        rightSection.appendChild(liquidActions);

        // ===== 导入液体模态框 =====
        this._importModal = document.createElement('div');
        this._importModal.className = 'mixer-import-overlay';
        this._importModal.innerHTML = `
            <div class="mixer-import-panel">
                <div class="mixer-import-header">
                    <span>◆ 导入液体 ◆</span>
                    <button class="mixer-import-close">&times;</button>
                </div>
                <div class="mixer-import-body" id="mixer-import-body">
                    <div class="placeholder-text">[ 无可导入液体 ]</div>
                </div>
                <div class="mixer-import-actions">
                    <button class="btn-wasteland" id="mixer-import-confirm">确认</button>
                    <button class="btn-wasteland" id="mixer-import-cancel">取消</button>
                </div>
                <div class="corner-deco tl"></div>
                <div class="corner-deco tr"></div>
                <div class="corner-deco bl"></div>
                <div class="corner-deco br"></div>
            </div>
        `;
        this._container.appendChild(this._importModal);

        this._importModal.querySelector('.mixer-import-close').addEventListener('click', () => this._closeImportModal());
        this._importModal.querySelector('#mixer-import-cancel').addEventListener('click', () => this._closeImportModal());
        this._importModal.querySelector('#mixer-import-confirm').addEventListener('click', () => this._confirmImport());
        this._importModal.addEventListener('click', (e) => {
            if (e.target === this._importModal) this._closeImportModal();
        });

        // 组装
        const body = document.createElement('div');
        body.className = 'distiller-body';
        body.appendChild(leftSection);
        body.appendChild(centerSection);
        body.appendChild(rightSection);
        this._container.appendChild(body);
    }

    // --- 导入模态框 ---

    _openImportModal() {
        const shell = this._getShell ? this._getShell() : null;
        const body = this._importModal.querySelector('#mixer-import-body');

        if (!shell || shell.tankCount === 0) {
            body.innerHTML = '<div class="placeholder-text">[ 右侧无液体可导入 ]</div>';
            this._importModal.classList.add('active');
            return;
        }

        const tanks = shell.getTanks();
        let html = '';
        for (const tank of tanks) {
            const checked = html === '' ? 'checked' : '';
            html += `
                <label class="mixer-import-item">
                    <input type="radio" name="mixer-import-target" value="${tank.materialId}" ${checked}>
                    <span class="mixer-import-name" style="color:${tank.color}">${tank.name}</span>
                    <span class="mixer-import-amount">可用: ${tank.volume.toFixed(1)}</span>
                </label>
            `;
        }
        html += `
            <div class="mixer-import-volume-row">
                <label>导入量</label>
                <input type="number" id="mixer-import-volume" class="config-input" value="50" min="1" step="1">
            </div>
        `;
        body.innerHTML = html;
        this._importModal.classList.add('active');
    }

    _closeImportModal() {
        this._importModal.classList.remove('active');
    }

    _confirmImport() {
        const selected = this._importModal.querySelector('input[name="mixer-import-target"]:checked');
        const volumeInput = this._importModal.querySelector('#mixer-import-volume');
        if (!selected || !volumeInput) {
            this._closeImportModal();
            return;
        }
        const materialId = selected.value;
        const volume = parseFloat(volumeInput.value) || 0;
        if (volume > 0 && this._onImportLiquid) {
            this._onImportLiquid(materialId, volume);
        }
        this._closeImportModal();
    }

    // --- 渲染 ---

    render() {
        if (!this._mixer) return;
        const status = this._mixer.getStatus();

        // 固体数量
        const solidCountEl = document.getElementById('mixer-solid-count');
        if (solidCountEl) solidCountEl.textContent = status.solidCount + ' 个';

        // 平均四维
        if (status.solidAvgAttrs) {
            this._setText('mixer-avg-a', status.solidAvgAttrs.A);
            this._setText('mixer-avg-b', status.solidAvgAttrs.B);
            this._setText('mixer-avg-c', status.solidAvgAttrs.C);
            this._setText('mixer-avg-d', status.solidAvgAttrs.D);
        } else {
            this._setText('mixer-avg-a', '-');
            this._setText('mixer-avg-b', '-');
            this._setText('mixer-avg-c', '-');
            this._setText('mixer-avg-d', '-');
        }

        // 液体进度条（假上限 999）
        const fillEl = document.getElementById('mixer-can-fill');
        if (fillEl) {
            const pct = Math.min(100, Math.round(status.liquidVolume / 999 * 100));
            fillEl.style.height = pct + '%';
        }

        // 液体信息（假上限 999）
        const infoEl = document.getElementById('mixer-liquid-info');
        if (infoEl) {
            infoEl.textContent = `${status.liquidVolume.toFixed(1)} / 999`;
        }

        // 液体四维
        if (status.liquidAttrs) {
            this._setText('mixer-liq-a', status.liquidAttrs.A);
            this._setText('mixer-liq-b', status.liquidAttrs.B);
            this._setText('mixer-liq-c', status.liquidAttrs.C);
            this._setText('mixer-liq-d', status.liquidAttrs.D);
        } else {
            this._setText('mixer-liq-a', '-');
            this._setText('mixer-liq-b', '-');
            this._setText('mixer-liq-c', '-');
            this._setText('mixer-liq-d', '-');
        }

        // 产物液体进度条（假上限 999）
        const prodFillEl = document.getElementById('mixer-product-fill');
        if (prodFillEl) {
            const pct = Math.min(100, Math.round(status.productVolume / 999 * 100));
            prodFillEl.style.height = pct + '%';
        }

        // 产物液体信息（假上限 999）
        const prodInfoEl = document.getElementById('mixer-product-info');
        if (prodInfoEl) {
            prodInfoEl.textContent = `${status.productVolume.toFixed(1)} / 999`;
        }

        // 产物四维
        if (status.product && status.product.def) {
            this._setText('mixer-prod-a', status.product.def.A);
            this._setText('mixer-prod-b', status.product.def.B);
            this._setText('mixer-prod-c', status.product.def.C);
            this._setText('mixer-prod-d', status.product.def.D);
        } else {
            this._setText('mixer-prod-a', '-');
            this._setText('mixer-prod-b', '-');
            this._setText('mixer-prod-c', '-');
            this._setText('mixer-prod-d', '-');
        }
    }

    _setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    refresh() {
        this.render();
    }

    setMixer(m) {
        this._mixer = m;
        this.render();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MixerPanel;
}
