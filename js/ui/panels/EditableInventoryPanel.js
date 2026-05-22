// ============================================
// EditableInventoryPanel — 可编辑背包面板
// 点击方框内部 → TakeOut（仅log）
// 点击 × 按钮 → Delete（从背包移除）
// hover 显示悬浮框：名称 + 四维 [A,B,C,D] + 价值
// ============================================

class EditableInventoryPanel {
    constructor(containerId, options = {}) {
        this._container = document.getElementById(containerId);
        if (!this._container) {
            throw new Error('[EditableInventoryPanel] 容器不存在: ' + containerId);
        }

        this._cellSize = options.cellSize || 48;
        this._cellGap = options.cellGap || 4;
        this._getSnapshot = options.getSnapshot || null;
        this._getDimensions = options.getDimensions || null;
        this._onCellClick = options.onCellClick || null;
        this._onAddRow = options.onAddRow || null;

        this._scrollArea = null;
        this._gridEl = null;
        this._initDOM();
        this.render();
    }

    _initDOM() {
        this._container.classList.add('editable-inventory-panel');
        this._container.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'panel-header';
        header.innerHTML = '<span>编辑背包</span><span class="status-light"></span>';
        this._container.appendChild(header);

        this._scrollArea = document.createElement('div');
        this._scrollArea.className = 'edit-inv-scroll';

        this._gridEl = document.createElement('div');
        this._gridEl.className = 'editable-inventory-grid';

        const rowAddArea = document.createElement('div');
        rowAddArea.className = 'row-add-area';

        const rowAddBtn = document.createElement('button');
        rowAddBtn.className = 'row-add-btn';
        rowAddBtn.innerHTML = '+';
        rowAddBtn.title = '追加一行';
        rowAddBtn.addEventListener('click', () => this._handleAddRow());

        const rowAddLabel = document.createElement('span');
        rowAddLabel.className = 'row-add-label';
        rowAddLabel.textContent = '添加行';

        rowAddArea.appendChild(rowAddBtn);
        rowAddArea.appendChild(rowAddLabel);

        this._scrollArea.appendChild(this._gridEl);
        this._scrollArea.appendChild(rowAddArea);
        this._container.appendChild(this._scrollArea);
    }

    _createCell(x, y, materialId) {
        const cell = document.createElement('div');
        cell.className = 'edit-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.style.width = this._cellSize + 'px';
        cell.style.height = this._cellSize + 'px';

        if (materialId) {
            cell.classList.add('occupied');
            const def = MaterialConfig.get(materialId);

            // 物品图标区域 — 点击触发 TakeOut
            const icon = document.createElement('div');
            icon.className = 'edit-cell-icon';
            icon.style.backgroundColor = def ? def.color : '#666';
            icon.textContent = def ? def.name.charAt(0) : '?';
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this._onCellClick) {
                    this._onCellClick({ action: 'take', x, y, materialId });
                }
            });
            cell.appendChild(icon);

            // 悬浮提示
            cell.addEventListener('mouseenter', () => {
                if (!def || !tooltipManager) return;
                tooltipManager.show(cell, {
                    title: def.name,
                    color: def.color || '#d4c8a8',
                    lines: [
                        { label: '稀有度', value: `R${def.rarity ?? 1}` },
                        { label: '四维', value: `A:${def.A} B:${def.B} C:${def.C} D:${def.D}` },
                        { label: '价值', value: def.value },
                        { label: '状态', value: def.state === 'solid' ? '固体' : '液体' }
                    ]
                });
            });
            cell.addEventListener('mouseleave', () => {
                if (tooltipManager) tooltipManager.hide();
            });

            // 删除按钮 — 更偏更大
            const delBtn = document.createElement('span');
            delBtn.className = 'edit-cell-delete';
            delBtn.innerHTML = '×';
            delBtn.title = '删除物品';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this._onCellClick) {
                    this._onCellClick({ action: 'delete', x, y, materialId });
                }
            });
            cell.appendChild(delBtn);
        } else {
            cell.classList.add('empty');
            const plus = document.createElement('span');
            plus.className = 'edit-cell-plus';
            plus.innerHTML = '+';
            cell.appendChild(plus);
            cell.title = '空格子 — 点击添加物品';
            cell.addEventListener('click', () => {
                if (this._onCellClick) {
                    this._onCellClick({ action: 'add', x, y });
                }
            });
        }

        return cell;
    }

    _handleAddRow() {
        if (this._onAddRow) {
            this._onAddRow();
        }
    }

    render() {
        if (!this._getSnapshot || !this._getDimensions) return;
        const snapshot = this._getSnapshot();
        const dims = this._getDimensions();
        const w = dims.width;
        const h = dims.height;

        this._gridEl.innerHTML = '';
        this._gridEl.style.display = 'grid';
        this._gridEl.style.gridTemplateColumns = `repeat(${w}, ${this._cellSize}px)`;
        this._gridEl.style.gap = this._cellGap + 'px';

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const materialId = snapshot[y] ? snapshot[y][x] : null;
                const cellEl = this._createCell(x, y, materialId);
                this._gridEl.appendChild(cellEl);
            }
        }
    }

    refresh() {
        this.render();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EditableInventoryPanel;
}
