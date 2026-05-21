// ============================================
// DistillerPanel — 基酒机面板
// 左侧：桶形固体缓存（清空/导出）
// 中间：机器名 + 转换比例配置 + 启动按钮
// 右侧：椭圆液体缓存 + 进度条 + 容量配置 + 清空/导出
// ============================================

class DistillerPanel {
    constructor(containerOrId, distiller, options = {}) {
        if (typeof containerOrId === 'string') {
            this._container = document.getElementById(containerOrId);
        } else {
            this._container = containerOrId;
        }
        if (!this._container) {
            throw new Error('[DistillerPanel] 容器不存在: ' + containerOrId);
        }

        this._distiller = distiller;
        this._onRun = options.onRun || null;
        this._onClearSolid = options.onClearSolid || null;
        this._onExportSolid = options.onExportSolid || null;
        this._onClearLiquid = options.onClearLiquid || null;
        this._onExportLiquid = options.onExportLiquid || null;
        this._onConfigChange = options.onConfigChange || null;

        this._initDOM();
        this.render();
    }

    _initDOM() {
        this._container.classList.add('distiller-panel');
        this._container.innerHTML = '';

        // ===== 左侧：固体缓存区（桶形） =====
        const leftSection = document.createElement('div');
        leftSection.className = 'dist-section dist-solid-section';

        const solidBarrel = document.createElement('div');
        solidBarrel.className = 'dist-barrel';
        solidBarrel.innerHTML = `
            <div class="barrel-top"></div>
            <div class="barrel-body">
                <div class="barrel-label">固体缓存</div>
                <div class="barrel-count" id="dist-solid-count">0 个</div>
            </div>
            <div class="barrel-bottom"></div>
        `;

        const solidActions = document.createElement('div');
        solidActions.className = 'dist-actions';

        const btnClearSolid = document.createElement('button');
        btnClearSolid.className = 'dist-btn';
        btnClearSolid.textContent = '清空';
        btnClearSolid.addEventListener('click', () => {
            if (this._onClearSolid) this._onClearSolid();
        });

        const btnExportSolid = document.createElement('button');
        btnExportSolid.className = 'dist-btn';
        btnExportSolid.textContent = '导出';
        btnExportSolid.addEventListener('click', () => {
            if (this._onExportSolid) this._onExportSolid();
        });

        solidActions.appendChild(btnClearSolid);
        solidActions.appendChild(btnExportSolid);
        leftSection.appendChild(solidBarrel);
        leftSection.appendChild(solidActions);

        // ===== 中间：控制区 =====
        const centerSection = document.createElement('div');
        centerSection.className = 'dist-section dist-center-section';

        const machineName = document.createElement('div');
        machineName.className = 'dist-machine-name';
        machineName.textContent = this._distiller ? this._distiller.name : '基酒机';

        // 转换比例配置
        const rateConfig = document.createElement('div');
        rateConfig.className = 'dist-config-row';
        rateConfig.innerHTML = '<label>转换比例</label>';

        const rateInputWrap = document.createElement('div');
        rateInputWrap.className = 'config-input-wrap';

        const btnRateDown = document.createElement('button');
        btnRateDown.className = 'config-arrow';
        btnRateDown.innerHTML = '◀';
        btnRateDown.addEventListener('click', () => this._adjustRate(-0.1));

        this._rateInput = document.createElement('input');
        this._rateInput.type = 'number';
        this._rateInput.className = 'config-input';
        this._rateInput.step = '0.1';
        this._rateInput.min = '0';
        this._rateInput.value = '0.5';
        this._rateInput.addEventListener('change', () => this._updateRateFromInput());

        const btnRateUp = document.createElement('button');
        btnRateUp.className = 'config-arrow';
        btnRateUp.innerHTML = '▶';
        btnRateUp.addEventListener('click', () => this._adjustRate(0.1));

        rateInputWrap.appendChild(btnRateDown);
        rateInputWrap.appendChild(this._rateInput);
        rateInputWrap.appendChild(btnRateUp);
        rateConfig.appendChild(rateInputWrap);

        // 启动按钮
        const runBtn = document.createElement('button');
        runBtn.className = 'dist-run-btn';
        runBtn.textContent = '▶ 启动基酒机';
        runBtn.addEventListener('click', () => {
            if (this._onRun) this._onRun();
        });

        centerSection.appendChild(machineName);
        centerSection.appendChild(rateConfig);
        centerSection.appendChild(runBtn);

        // ===== 右侧：液体缓存区（椭圆罐头） =====
        const rightSection = document.createElement('div');
        rightSection.className = 'dist-section dist-liquid-section';

        const liquidCan = document.createElement('div');
        liquidCan.className = 'dist-can';
        liquidCan.innerHTML = `
            <div class="can-body">
                <div class="can-label">液体缓存</div>
                <div class="can-inner">
                    <div class="can-fill" id="dist-can-fill"></div>
                </div>
                <div class="can-info" id="dist-liquid-info">0 / 200</div>
            </div>
        `;

        const liquidActions = document.createElement('div');
        liquidActions.className = 'dist-actions';

        const btnClearLiquid = document.createElement('button');
        btnClearLiquid.className = 'dist-btn';
        btnClearLiquid.textContent = '清空';
        btnClearLiquid.addEventListener('click', () => {
            if (this._onClearLiquid) this._onClearLiquid();
        });

        const btnExportLiquid = document.createElement('button');
        btnExportLiquid.className = 'dist-btn';
        btnExportLiquid.textContent = '导出';
        btnExportLiquid.addEventListener('click', () => {
            if (this._onExportLiquid) this._onExportLiquid();
        });

        liquidActions.appendChild(btnClearLiquid);
        liquidActions.appendChild(btnExportLiquid);

        rightSection.appendChild(liquidCan);
        rightSection.appendChild(liquidActions);

        // 组装
        const body = document.createElement('div');
        body.className = 'distiller-body';
        body.appendChild(leftSection);
        body.appendChild(centerSection);
        body.appendChild(rightSection);
        this._container.appendChild(body);
    }

    // --- 配置调整 ---

    _adjustRate(delta) {
        let v = parseFloat(this._rateInput.value) || 0;
        v = Math.max(0, Math.round((v + delta) * 10) / 10);
        this._rateInput.value = v;
        if (this._distiller) this._distiller.conversionRate = v;
        if (this._onConfigChange) this._onConfigChange('rate', v);
    }

    _updateRateFromInput() {
        let v = parseFloat(this._rateInput.value) || 0;
        v = Math.max(0, v);
        this._rateInput.value = v;
        if (this._distiller) this._distiller.conversionRate = v;
        if (this._onConfigChange) this._onConfigChange('rate', v);
    }

    // --- 渲染 ---

    render() {
        if (!this._distiller) return;

        const status = this._distiller.getStatus();

        // 固体数量
        const solidCountEl = document.getElementById('dist-solid-count');
        if (solidCountEl) solidCountEl.textContent = status.solidCount + ' 个';

        // 液体进度条（假上限 999）
        const fillEl = document.getElementById('dist-can-fill');
        if (fillEl) {
            const pct = Math.min(100, Math.round(status.liquidVolume / 999 * 100));
            fillEl.style.height = pct + '%';
        }

        // 液体信息（假上限 999）
        const infoEl = document.getElementById('dist-liquid-info');
        if (infoEl) {
            infoEl.textContent = `${status.liquidVolume.toFixed(1)} / 999`;
        }

        // 同步输入框
        if (this._rateInput && this._distiller) {
            this._rateInput.value = this._distiller.conversionRate;
        }
    }

    refresh() {
        this.render();
    }

    setDistiller(d) {
        this._distiller = d;
        this.render();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DistillerPanel;
}
