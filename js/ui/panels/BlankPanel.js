// ============================================
// BlankPanel — 空白机器面板
// 无实际内容，仅显示占位状态
// ============================================

class BlankPanel {
    constructor(container, blankMachine, options = {}) {
        if (typeof container === 'string') {
            this._container = document.getElementById(container);
        } else {
            this._container = container;
        }
        if (!this._container) {
            throw new Error('[BlankPanel] 容器不存在');
        }

        this._blankMachine = blankMachine;
        this._initDOM();
        this.render();
    }

    _initDOM() {
        this._container.innerHTML = '';
    }

    render() {
        this._container.innerHTML = '';
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-text';
        placeholder.textContent = '[ 空白机器 ]';
        placeholder.style.height = '100%';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        this._container.appendChild(placeholder);
    }

    refresh() {
        this.render();
    }

    clearContent() {
        this._container.innerHTML = '';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlankPanel;
}
