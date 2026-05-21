// ============================================
// MachinePanel — 中间机器面板
// 显示当前机器信息，左右箭头切换机器
// 切换时调用 onSwitch 回调（由外部接到 log）
// 中间内容区留给机器自己绘制，当前为空白
// ============================================

class MachinePanel {
    constructor(containerId, options = {}) {
        this._container = document.getElementById(containerId);
        if (!this._container) {
            throw new Error('[MachinePanel] 容器不存在: ' + containerId);
        }

        this._onSwitch = options.onSwitch || null;
        this._currentMachine = null;

        this._titleEl = null;
        this._contentEl = null;
        this._initDOM();
    }

    // --- 私有方法 ---

    _initDOM() {
        this._container.classList.add('machine-panel');
        this._container.innerHTML = '';

        // 头部：左箭头 + 标题 + 右箭头
        const header = document.createElement('div');
        header.className = 'panel-header machine-header';

        const btnPrev = document.createElement('button');
        btnPrev.className = 'machine-nav-btn';
        btnPrev.innerHTML = '&#9664;';
        btnPrev.title = '上一台机器';
        btnPrev.addEventListener('click', () => this._handleSwitch('prev'));

        this._titleEl = document.createElement('span');
        this._titleEl.className = 'machine-title';
        this._titleEl.textContent = '机器';

        const btnNext = document.createElement('button');
        btnNext.className = 'machine-nav-btn';
        btnNext.innerHTML = '&#9654;';
        btnNext.title = '下一台机器';
        btnNext.addEventListener('click', () => this._handleSwitch('next'));

        header.appendChild(btnPrev);
        header.appendChild(this._titleEl);
        header.appendChild(btnNext);
        this._container.appendChild(header);

        // 内容区（机器自定义绘制区）
        this._contentEl = document.createElement('div');
        this._contentEl.className = 'panel-body machine-body';
        this._container.appendChild(this._contentEl);
    }

    _handleSwitch(direction) {
        if (this._onSwitch) {
            this._onSwitch(direction);
        }
    }

    // --- 公开接口 ---

    /**
     * 设置当前显示的机器
     * @param {Machine|null} machine
     */
    setMachine(machine) {
        this._currentMachine = machine;
        if (machine) {
            this._titleEl.textContent = machine.name;
        } else {
            this._titleEl.textContent = '无机器';
        }
    }

    /**
     * 获取机器自定义绘制区 DOM 元素
     * 机器类可通过此元素自行渲染内容
     */
    getContentArea() {
        return this._contentEl;
    }

    /**
     * 清空内容区
     */
    clearContent() {
        this._contentEl.innerHTML = '';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MachinePanel;
}
