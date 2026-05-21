// ============================================
// Distiller — 基酒机
// 将固体缓存内所有物品的价值总和，按转换比例换算为基酒液体体积
// 只允许产出特殊液体 "BASE_LIQUOR"（基酒）
// 机器上游（固体投入）和下游（液体导出）均对机器本身模糊
// ============================================

class Distiller extends Machine {
    constructor(id, name) {
        super(id, name, 'distiller');

        // 转换比例：1价值 = 多少体积基酒
        this._conversionRate = 0.5;
    }

    // --- 配置 ---

    get conversionRate() { return this._conversionRate; }
    set conversionRate(v) {
        const n = parseFloat(v);
        if (!isNaN(n) && n >= 0) this._conversionRate = n;
    }

    // --- 核心运行逻辑 ---

    run() {
        const solids = this._solidBuffer.getOccupiedCells();
        if (solids.length === 0) {
            return { success: false, reason: 'empty_solid', msg: '固体缓存为空' };
        }

        // 遍历所有固体，累加价值
        let totalValue = 0;
        for (const cell of solids) {
            const def = MaterialConfig.get(cell.materialId);
            if (def) totalValue += def.value;
        }

        // 计算应产出的基酒体积
        const produceVolume = totalValue * this._conversionRate;

        // 清空固体缓存
        this._solidBuffer.clear();

        // 投入基酒液体（BASE_LIQUOR 是固定ID）
        const result = this._liquidBuffer.pourIn('BASE_LIQUOR', produceVolume);

        return {
            success: result.success || result.poured > 0,
            reason: result.reason,
            totalValue,
            produceVolume: result.poured,
            remainingRequest: result.remaining,
            msg: `基酒机运行：总价值 ${totalValue} × 比例 ${this._conversionRate} = 产出 ${result.poured.toFixed(2)} 体积基酒`
        };
    }

    // --- 固体缓存公开接口 ---

    // 投入固体（外部调用，如从仓库转入）
    putSolid(materialId) {
        return this._solidBuffer.add(materialId);
    }

    // 取出固体（从指定位置）
    takeSolidAt(x, y) {
        return this._solidBuffer.removeAt(x, y);
    }

    // 删除固体（从指定位置）
    removeSolidAt(x, y) {
        return this._solidBuffer.removeAt(x, y);
    }

    // 清空固体缓存
    clearSolid() {
        this._solidBuffer.clear();
    }

    // --- 液体缓存公开接口 ---

    // 投入液体
    putLiquid(materialId, volume) {
        return this._liquidBuffer.pourIn(materialId, volume);
    }

    // 导出液体（倒出指定体积）
    exportLiquid(volume) {
        return this._liquidBuffer.pourOut(volume);
    }

    // 清空液体缓存
    clearLiquid() {
        this._liquidBuffer.clear();
    }

    // --- 查询 ---

    getStatus() {
        const base = super.getStatus();
        return {
            ...base,
            conversionRate: this._conversionRate
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Distiller;
}
