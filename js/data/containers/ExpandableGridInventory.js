// ============================================
// ExpandableGridInventory — 可扩展行数的固体容器
// 继承 GridInventory，支持动态追加行
// pivot 在左上角，每个格子只存一个物品
// ============================================

class ExpandableGridInventory extends GridInventory {
    constructor(initialWidth, initialHeight, options = {}) {
        super(initialWidth, initialHeight, options);
        this._minRows = initialHeight || 4;
        this._maxRows = options.maxRows || Infinity;
    }

    addRow() {
        if (this._height >= this._maxRows) {
            console.warn('[ExpandableGridInventory] 已达最大行数限制');
            return false;
        }
        const newRow = [];
        for (let x = 0; x < this._width; x++) {
            newRow.push(null);
        }
        this._grid.push(newRow);
        this._height++;
        return true;
    }

    addRows(n) {
        for (let i = 0; i < n; i++) {
            if (!this.addRow()) break;
        }
    }

    get rowCount() {
        return this._height;
    }

    get minRows() {
        return this._minRows;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExpandableGridInventory;
}
