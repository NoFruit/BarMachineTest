// ============================================
// Warehouse — 仓库
// 数据层即为 ExpandableGridInventory（固体容器）
// 每个格子只存一个物品，无堆叠
// ============================================

class Warehouse {
    constructor() {
        const cfg = ContainerConfig.warehouse;
        this._inventory = new ExpandableGridInventory(cfg.gridWidth, cfg.gridHeight);
    }

    get inventory() { return this._inventory; }
    get width() { return this._inventory.width; }
    get height() { return this._inventory.height; }

    getCell(x, y) {
        return this._inventory.getCell(x, y);
    }

    getSnapshot() {
        return this._inventory.getSnapshot();
    }

    getOccupiedCells() {
        return this._inventory.getOccupiedCells();
    }

    getEmptyCount() {
        return this._inventory.getEmptyCount();
    }

    add(materialId) {
        return this._inventory.add(materialId);
    }

    addAt(x, y, materialId) {
        return this._inventory.addAt(x, y, materialId);
    }

    removeAt(x, y) {
        return this._inventory.removeAt(x, y);
    }

    clear() {
        this._inventory.clear();
    }

    toJSON() {
        return { grid: this._inventory.getSnapshot() };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Warehouse;
}
