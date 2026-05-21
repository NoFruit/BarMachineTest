// ============================================
// LogPanel — 底部日志面板
// 唯一暴露接口: log(text) — 显示一行文字
// 其余全部封装，不暴露内部结构
// ============================================

class LogPanel {
    constructor(containerId, options = {}) {
        this._container = document.getElementById(containerId);
        if (!this._container) {
            throw new Error('[LogPanel] 容器不存在: ' + containerId);
        }

        this._maxLines = options.maxLines || 50;
        this._lineHeight = options.lineHeight || 22;
        this._timestamp = options.timestamp !== false;

        this._lines = [];
        this._initDOM();
    }

    // --- 私有方法 ---

    _initDOM() {
        this._container.classList.add('log-panel');

        this._inner = document.createElement('div');
        this._inner.className = 'log-panel-inner';

        this._list = document.createElement('div');
        this._list.className = 'log-list';

        this._inner.appendChild(this._list);
        this._container.appendChild(this._inner);
    }

    _formatTime() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        return `[${h}:${m}:${s}]`;
    }

    _renderLine(text) {
        const line = document.createElement('div');
        line.className = 'log-line';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = this._formatTime();

        const textSpan = document.createElement('span');
        textSpan.className = 'log-text';
        textSpan.textContent = text;

        line.appendChild(timeSpan);
        line.appendChild(textSpan);
        return line;
    }

    _prune() {
        while (this._lines.length > this._maxLines) {
            const old = this._lines.shift();
            if (old && old.parentNode) {
                old.parentNode.removeChild(old);
            }
        }
    }

    _scrollToBottom() {
        this._inner.scrollTop = this._inner.scrollHeight;
    }

    // --- 唯一公开接口 ---

    /**
     * 显示一行日志文字
     * @param {string} text - 要显示的文字
     */
    log(text) {
        if (!text) return;
        const lineEl = this._renderLine(String(text));
        this._list.appendChild(lineEl);
        this._lines.push(lineEl);
        this._prune();
        this._scrollToBottom();
    }

    /**
     * 清空日志
     */
    clear() {
        this._list.innerHTML = '';
        this._lines = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LogPanel;
}
