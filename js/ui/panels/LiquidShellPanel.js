// ============================================
// LiquidShellPanel — 液体容器壳面板（右侧）
// 显示每个 tank 的文字信息、假进度条（上限999）、颜色区分
// 底部提供清空所有液体的按钮
// ============================================

class LiquidShellPanel {
    constructor(containerId, liquidShell, options = {}) {
        this._container = document.getElementById(containerId);
        if (!this._container) {
            throw new Error('[LiquidShellPanel] 容器不存在: ' + containerId);
        }

        this._shell = liquidShell;
        this._onClearAll = options.onClearAll || null;
        this._initDOM();
        this.render();
    }

    _initDOM() {
        this._container.innerHTML = '';
        this._container.classList.add('liquid-shell-panel');

        const header = document.createElement('div');
        header.className = 'panel-header';
        header.innerHTML = '<span>液体容器壳</span><span class="status-light"></span>';
        this._container.appendChild(header);

        this._body = document.createElement('div');
        this._body.className = 'panel-body liquid-shell-body';
        this._container.appendChild(this._body);

        // 底部操作区：清空按钮
        this._footer = document.createElement('div');
        this._footer.className = 'liquid-shell-footer';
        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-wasteland btn-clear-all';
        clearBtn.textContent = '清空全部液体';
        clearBtn.addEventListener('click', () => this._handleClearAll());
        this._footer.appendChild(clearBtn);
        this._container.appendChild(this._footer);
    }

    _handleClearAll() {
        if (this._shell.tankCount === 0) return;
        this._shell.clearAll();
        if (this._onClearAll) this._onClearAll();
        this.render();
    }

    render() {
        const tanks = this._shell.getTanks();
        if (tanks.length === 0) {
            this._body.innerHTML = '<div class="placeholder-text">[ 无液体 ]</div>';
            return;
        }

        this._body.innerHTML = '';
        for (const tank of tanks) {
            const card = document.createElement('div');
            card.className = 'liquid-tank-card';

            // 头部信息：名称 + 体积
            const infoRow = document.createElement('div');
            infoRow.className = 'tank-info-row';
            infoRow.innerHTML = `<span class="tank-name" style="color:${tank.color}">${tank.name}</span>` +
                `<span class="tank-volume">${tank.volume.toFixed(1)} / 999</span>`;
            card.appendChild(infoRow);

            // 进度条
            const barWrap = document.createElement('div');
            barWrap.className = 'tank-bar-wrap';
            const barFill = document.createElement('div');
            barFill.className = 'tank-bar-fill';
            barFill.style.width = `${(tank.fillRatio * 100).toFixed(1)}%`;
            barFill.style.backgroundColor = tank.color;
            barWrap.appendChild(barFill);
            card.appendChild(barWrap);

            // 悬浮提示
            card.addEventListener('mouseenter', () => {
                if (!tooltipManager) return;
                const mat = tank.materialId ? MaterialConfig.get(tank.materialId) : null;
                const lines = [
                    { label: '体积', value: `${tank.volume.toFixed(1)} / 999` },
                    { label: '占比', value: `${(tank.fillRatio * 100).toFixed(1)}%` }
                ];
                if (mat) {
                    lines.push({ label: '稀有度', value: `R${mat.rarity ?? 1}` });
                    lines.push({ label: '四维', value: `A:${mat.A} B:${mat.B} C:${mat.C} D:${mat.D}` });
                    lines.push({ label: '价值', value: mat.value });
                }
                tooltipManager.show(card, {
                    title: tank.name,
                    color: tank.color,
                    lines
                });
            });
            card.addEventListener('mouseleave', () => {
                if (tooltipManager) tooltipManager.hide();
            });

            this._body.appendChild(card);
        }
    }

    refresh() {
        this.render();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiquidShellPanel;
}
