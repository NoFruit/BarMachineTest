// ============================================
// TooltipManager — 全局悬浮提示管理器
// 单例，管理一个共享的 tooltip DOM 元素
// 鲁棒策略：实时检测 anchor 是否仍在 DOM 中，
// 同时监听全局 click/scroll， anchor 消失或点击外部时自动隐藏
// ============================================

class TooltipManager {
    constructor() {
        this._el = null;
        this._rafId = null;
        this._currentAnchor = null;
        this._initDOM();
        this._bindGlobal();
    }

    _initDOM() {
        this._el = document.createElement('div');
        this._el.className = 'wasteland-tooltip';
        this._el.style.position = 'fixed';
        this._el.style.pointerEvents = 'none';
        this._el.style.zIndex = '9999';
        this._el.style.opacity = '0';
        this._el.style.transition = 'opacity 0.12s ease-out';
        document.body.appendChild(this._el);
    }

    _bindGlobal() {
        // 点击外部时隐藏
        document.addEventListener('click', (e) => {
            if (!this._currentAnchor) return;
            if (this._currentAnchor.contains(e.target)) return;
            if (this._el.contains(e.target)) return;
            this.hide();
        });
        // 滚动时重新定位
        document.addEventListener('scroll', () => {
            if (this._currentAnchor && document.contains(this._currentAnchor)) {
                this._position(this._currentAnchor);
            } else {
                this.hide();
            }
        }, true);
    }

    /**
     * 显示 tooltip
     * @param {HTMLElement} anchor - 触发元素（用于定位）
     * @param {Object} data - 显示内容
     *   data.title {string} 标题
     *   data.lines {Array<{label:string, value:string}>} 信息行
     *   data.color {string} 可选，标题颜色
     */
    show(anchor, data) {
        this.hide();
        this._currentAnchor = anchor;
        this._el.innerHTML = this._buildHTML(data);
        this._position(anchor);
        this._el.style.opacity = '1';
        this._startWatch();
    }

    hide() {
        this._el.style.opacity = '0';
        this._currentAnchor = null;
        this._stopWatch();
    }

    // --- 实时检测 anchor 是否还在 DOM 中 ---

    _startWatch() {
        this._stopWatch();
        const check = () => {
            if (!this._currentAnchor) return;
            if (!document.contains(this._currentAnchor)) {
                this.hide();
                return;
            }
            this._rafId = requestAnimationFrame(check);
        };
        this._rafId = requestAnimationFrame(check);
    }

    _stopWatch() {
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    // --- 内部 ---

    _buildHTML(data) {
        const color = data.color || '#d4c8a8';
        let html = `<div class="tooltip-header" style="color:${color}">${this._esc(data.title)}</div>
<div class="tooltip-divider"></div>`;
        if (data.lines && data.lines.length > 0) {
            for (const line of data.lines) {
                html += `<div class="tooltip-line"><span class="tooltip-label">${this._esc(line.label)}</span><span class="tooltip-value">${this._markNegative(this._esc(line.value))}</span></div>`;
            }
        }
        return html;
    }

    _esc(str) {
        if (typeof str !== 'string') return String(str);
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    _markNegative(str) {
        // 给负数加醒目样式（已转义后的文本）
        return str.replace(/-([0-9]+)/g, '<span class="tooltip-negative">-$1</span>');
    }

    _position(anchor) {
        const rect = anchor.getBoundingClientRect();
        const tipRect = this._el.getBoundingClientRect();
        const pad = 8;

        // 默认显示在元素右侧
        let left = rect.right + pad;
        let top = rect.top;

        // 如果右侧超出屏幕，则显示在左侧
        if (left + tipRect.width > window.innerWidth) {
            left = rect.left - tipRect.width - pad;
        }
        // 如果左侧超出屏幕，则显示在下方
        if (left < 0) {
            left = rect.left;
            top = rect.bottom + pad;
        }
        // 如果下方超出屏幕，则显示在上方
        if (top + tipRect.height > window.innerHeight) {
            top = rect.top - tipRect.height - pad;
        }
        // 顶部保护
        if (top < 0) top = pad;

        this._el.style.left = left + 'px';
        this._el.style.top = top + 'px';
    }
}

// 全局单例
const tooltipManager = new TooltipManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TooltipManager, tooltipManager };
}
