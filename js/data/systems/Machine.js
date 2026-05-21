// ============================================
// Machine — 机器基类
// 包含固体缓存(GridInventory)与液体缓存(LiquidTank)
// 提供通用配置接口，不处理具体转换逻辑
// ============================================

class Machine {
    constructor(id, name, type = 'generic') {
        this._id = id;
        this._name = name;
        this._type = type;
        this._isActive = false;

        const solidCfg = ContainerConfig.machine.solidBuffer;
        const liquidCfg = ContainerConfig.machine.liquidBuffer;

        this._solidBuffer = new GridInventory(solidCfg.gridWidth, solidCfg.gridHeight);
        this._liquidBuffer = new LiquidTank(Infinity);
    }

    get id() { return this._id; }
    get name() { return this._name; }
    get type() { return this._type; }
    get isActive() { return this._isActive; }
    set isActive(v) { this._isActive = !!v; }

    // --- 固体缓存 ---
    get solidBuffer() { return this._solidBuffer; }

    // --- 液体缓存 ---
    get liquidBuffer() { return this._liquidBuffer; }

    // --- 配置 ---

    getStatus() {
        const solidCells = this._solidBuffer.getOccupiedCells();
        const liquidContent = this._liquidBuffer.getContent();
        return {
            id: this._id,
            name: this._name,
            type: this._type,
            isActive: this._isActive,
            solidCount: solidCells.length,
            solidItems: solidCells,
            liquid: liquidContent,
            liquidVolume: this._liquidBuffer.getVolume(),
            liquidCapacity: this._liquidBuffer.capacity,
            liquidRatio: this._liquidBuffer.getFillRatio()
        };
    }

    // --- 固体投入接口 ---

    canAcceptSolid(materialId) {
        const def = MaterialConfig.get(materialId);
        return def && def.state === 'solid';
    }

    throwInSolid(materialId) {
        if (!this.canAcceptSolid(materialId)) {
            return { success: false, reason: 'not_solid' };
        }
        const pos = this._solidBuffer.add(materialId);
        return pos
            ? { success: true, position: pos }
            : { success: false, reason: 'solid_buffer_full' };
    }

    // --- 运行（子类重写）---

    run() {
        // 基类空实现
        return { success: false, reason: 'not_implemented' };
    }

    // --- 序列化 ---

    toJSON() {
        return {
            id: this._id,
            name: this._name,
            type: this._type,
            solidBuffer: this._solidBuffer.getSnapshot(),
            liquidBuffer: this._liquidBuffer.getContent()
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Machine;
}
