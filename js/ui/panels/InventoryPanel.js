// ============================================
// InventoryPanel — 左侧仓库格子面板
// 传统格子背包样式，一个格子一堆物品
// 从 Warehouse 获取数据渲染，但只读，不直接操作数据
// 点击格子 → 调用 onCellClick 回调（由外部接到 log）
// ============================================

class InventoryPanel {
    constructor(containerId, warehouse, options = {}) {
        this._container = document.getElementById(containerId);
        if (!this._container) {
            throw new Error('[InventoryPanel] 容器不存在: ' + containerId);
        }

        this._warehouse = warehouse;
        this._cellSize = options.cellSize || 48;
        this._cellGap = options.cellGap || 4;
        this._onCellClick = options.onCellClick || null;

        this._gridEl = null;
        this._initDOM();
        this.render();
    }

    // --- 私有方法 ---

    _initDOM() {
        this._container.classList.add('inventory-panel');
        this._container.innerHTML = '';

        // 头部
        const header = document.createElement('div');
        header.className = 'panel-header';
        header.innerHTML = '<span>仓库</span><span class="status-light"></span>';
        this._container.appendChild(header);

        // 网格容器
        const body = document.createElement('div');
        body.className = 'panel-body';
        body.style.display = 'flex';
        body.style.alignItems = 'center';
        body.style.justifyContent = 'center';

        this._gridEl = document.createElement('div');
        this._gridEl.className = 'inventory-grid';
        body.appendChild(this._gridEl);
        this._container.appendChild(body);
    }

    _createCell(x, y, cellData) {
        const cell = document.createElement('div');
        cell.className = 'inv-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.style.width = this._cellSize + 'px';
        cell.style.height = this._cellSize + 'px';

        if (cellData) {
            cell.classList.add('occupied');
            const def = MaterialConfig.get(cellData.materialId);

            // 图标/缩略
            const icon = document.createElement('div');
            icon.className = 'inv-cell-icon';
            icon.style.backgroundColor = def ? def.color : '#666';
            icon.textContent = def ? def.name.charAt(0) : '?';
            cell.appendChild(icon);

            // 数量
            if (cellData.quantity > 1) {
                const qty = document.createElement('span');
                qty.className = 'inv-cell-qty';
                qty.textContent = cellData.quantity;
                cell.appendChild(qty);
            }

            // tooltip 数据
            cell.title = def ? `${def.name} ×${cellData.quantity}` : cellData.materialId;
        } else {
            cell.classList.add('empty');
        }

        // 点击事件
        cell.addEventListener('click', () => {
            this._handleClick(x, y, cellData);
        });

        return cell;
    }

    _handleClick(x, y, cellData) {
        if (!cellData) {
            if (this._onCellClick) this._onCellClick(null, x, y);
            return;
        }

        const def = MaterialConfig.get(cellData.materialId);
        const info = {
            x, y,
            materialId: cellData.materialId,
            quantity: cellData.quantity,
            name: def ? def.name : cellData.materialId,
            description: def ? def.description : '',
            category: def ? def.category : '',
            state: def ? def.state : ''
        };

        if (this._onCellClick) {
            this._onCellClick(info, x, y);
        }
    }

    // --- 公开接口 ---

    render() {
        if (!this._warehouse) return;

        const snapshot = this._warehouse.getSnapshot();
        const w = this._warehouse.width;
        const h = this._warehouse.height;

        this._gridEl.innerHTML = '';
        this._gridEl.style.display = 'grid';
        this._gridEl.style.gridTemplateColumns = `repeat(${w}, ${this._cellSize}px)`;
        this._gridEl.style.gridTemplateRows = `repeat(${h}, ${this._cellSize}px)`;
        this._gridEl.style.gap = this._cellGap + 'px';

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const cellData = snapshot[y][x];
                const cellEl = this._createCell(x, y, cellData);
                this._gridEl.appendChild(cellEl);
            }
        }
    }

    /**
     * 刷新渲染（外部数据变化后调用）
     */
    refresh() {
        this.render();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventoryPanel;
}
