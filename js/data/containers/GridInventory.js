// ============================================
// GridInventory — 固体容器（2D背包）
// 每个格子只存一个物品（无堆叠）
// 内部使用二维数组，不对外暴露数据流转接口
// ============================================

class GridInventory {
    constructor(width, height, options = {}) {
        this._width = width || ContainerConfig.grid.defaultWidth;
        this._height = height || ContainerConfig.grid.defaultHeight;
        this._cellSize = options.cellSize || ContainerConfig.grid.cellSize;
        this._cellGap = options.cellGap || ContainerConfig.grid.cellGap;

        // 内部网格：每个格子存 materialId 字符串 或 null
        this._grid = [];
        this._clearGrid();
    }

    _clearGrid() {
        this._grid = [];
        for (let y = 0; y < this._height; y++) {
            const row = [];
            for (let x = 0; x < this._width; x++) {
                row.push(null);
            }
            this._grid.push(row);
        }
    }

    _isValidPos(x, y) {
        return x >= 0 && x < this._width && y >= 0 && y < this._height;
    }

    _canAcceptMaterial(materialId) {
        const def = MaterialConfig.get(materialId);
        if (!def) return false;
        return def.state === 'solid';
    }

    // --- 公开查询接口 ---

    get width() { return this._width; }
    get height() { return this._height; }
    get cellSize() { return this._cellSize; }
    get cellGap() { return this._cellGap; }

    getCell(x, y) {
        if (!this._isValidPos(x, y)) return null;
        return this._grid[y][x];
    }

    getSnapshot() {
        return this._grid.map(row => row.map(cell => cell));
    }

    findMaterial(materialId) {
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                if (this._grid[y][x] === materialId) {
                    return { x, y, materialId };
                }
            }
        }
        return null;
    }

    getOccupiedCells() {
        const list = [];
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                const id = this._grid[y][x];
                if (id) {
                    list.push({ x, y, materialId: id });
                }
            }
        }
        return list;
    }

    getEmptyCount() {
        let count = 0;
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                if (this._grid[y][x] === null) count++;
            }
        }
        return count;
    }

    // --- 修改接口 ---

    /**
     * 放入材料到第一个空位
     * @returns {object|null} 放置位置 {x,y} 或 null（无空位）
     */
    add(materialId) {
        if (!this._canAcceptMaterial(materialId)) {
            console.warn('[GridInventory] 非固体材料不可放入:', materialId);
            return null;
        }
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                if (this._grid[y][x] === null) {
                    this._grid[y][x] = materialId;
                    return { x, y };
                }
            }
        }
        console.warn('[GridInventory] 空间不足');
        return null;
    }

    /**
     * 放入材料到指定位置
     */
    addAt(x, y, materialId) {
        if (!this._isValidPos(x, y)) return false;
        if (!this._canAcceptMaterial(materialId)) return false;
        if (this._grid[y][x] !== null) return false;
        this._grid[y][x] = materialId;
        return true;
    }

    removeAt(x, y) {
        if (!this._isValidPos(x, y)) return null;
        const id = this._grid[y][x];
        if (!id) return null;
        this._grid[y][x] = null;
        return id;
    }

    clear() {
        this._clearGrid();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridInventory;
}
