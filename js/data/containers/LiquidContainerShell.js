// ============================================
// LiquidContainerShell — 液体容器外壳（阵列）
// 管理 LiquidTank 列表，按需创建新容器
// 同一种液体可分散在多个 tank 中，倒入时找最后一个匹配的
// 维护 totals 缓存，倒出时优先从较空容器开始，自动清理空容器
// ============================================

class LiquidContainerShell {
    constructor() {
        this._tanks = [];
        this._totals = {}; // { materialId: totalVolume }
    }

    // --- 核心接口 ---

    /**
     * 倒入液体
     * 从后往前找同类型 tank，倒入最后一个匹配的；
     * 若列表中无此类型，创建新 tank（容量无限）
     */
    pourIn(materialId, volume) {
        if (volume <= 0) {
            return { success: false, reason: 'invalid_volume', poured: 0 };
        }

        // 从后往前找同类型的 tank
        for (let i = this._tanks.length - 1; i >= 0; i--) {
            const content = this._tanks[i].getContent();
            if (content && content.materialId === materialId) {
                const result = this._tanks[i].pourIn(materialId, volume);
                if (result.poured > 0) {
                    this._addTotal(materialId, result.poured);
                }
                return result;
            }
        }

        // 无匹配类型，新建 tank（容量无限）
        const newTank = new LiquidTank(Infinity);
        this._tanks.push(newTank);
        const result = newTank.pourIn(materialId, volume);
        if (result.poured > 0) {
            this._addTotal(materialId, result.poured);
        }
        return result;
    }

    /**
     * 被动导出：按 materialId 和 volume 请求
     * 若请求量超过总量，直接拒绝
     * 否则从较空的容器开始逐个倒出，倒空后自动移除
     */
    pourOut(materialId, volume) {
        if (volume <= 0) {
            return { success: false, reason: 'invalid_volume', poured: 0 };
        }

        const available = this._totals[materialId] || 0;
        if (volume > available) {
            return { success: false, reason: 'insufficient_total', requested: volume, available, poured: 0 };
        }

        // 收集所有该类型的 tank，按当前液体量升序（较空的优先）
        const matchingTanks = [];
        for (let i = 0; i < this._tanks.length; i++) {
            const tank = this._tanks[i];
            if (tank.getMaterialId() === materialId) {
                matchingTanks.push({ index: i, tank, volume: tank.getVolume() });
            }
        }

        if (matchingTanks.length === 0) {
            return { success: false, reason: 'material_not_found', poured: 0 };
        }

        // 按当前液体量升序排序，较空的优先倒出
        matchingTanks.sort((a, b) => a.volume - b.volume);

        let remainingToPour = volume;
        let totalPoured = 0;
        const emptiedIndices = [];

        for (const { index, tank } of matchingTanks) {
            if (remainingToPour <= 0) break;
            const result = tank.pourOut(remainingToPour);
            if (result.poured > 0) {
                totalPoured += result.poured;
                remainingToPour -= result.poured;
                if (tank.isEmpty) {
                    emptiedIndices.push(index);
                }
            }
        }

        // 更新 totals
        this._addTotal(materialId, -totalPoured);

        // 从后往前移除空容器，避免索引错乱
        if (emptiedIndices.length > 0) {
            emptiedIndices.sort((a, b) => b - a);
            for (const idx of emptiedIndices) {
                this._tanks.splice(idx, 1);
            }
        }

        return {
            success: totalPoured > 0,
            materialId,
            poured: totalPoured,
            remaining: volume - totalPoured
        };
    }

    // --- 管理接口 ---

    /**
     * 清空所有液体和容器
     */
    clearAll() {
        this._tanks = [];
        this._totals = {};
    }

    // --- 查询接口 ---

    get tankCount() {
        return this._tanks.length;
    }

    /**
     * 获取某种液体的总量
     */
    getTotal(materialId) {
        return this._totals[materialId] || 0;
    }

    /**
     * 获取所有液体总量副本
     */
    getAllTotals() {
        return { ...this._totals };
    }

    getTanks() {
        return this._tanks.map((tank, index) => {
            const content = tank.getContent();
            const mat = content ? MaterialConfig.get(content.materialId) : null;
            return {
                index,
                materialId: content ? content.materialId : null,
                name: mat ? mat.name : (content ? content.materialId : '空'),
                volume: content ? content.volume : 0,
                capacity: tank.capacity,
                color: mat ? (mat.color || '#888') : '#555',
                fillRatio: tank.capacity === Infinity
                    ? Math.min(content ? content.volume / 999 : 0, 1)
                    : (tank.capacity > 0 ? (content ? content.volume / tank.capacity : 0) : 0)
            };
        });
    }

    // --- 内部 ---

    _addTotal(materialId, delta) {
        this._totals[materialId] = (this._totals[materialId] || 0) + delta;
        if (this._totals[materialId] <= 0.0001) {
            delete this._totals[materialId];
        }
    }

    // --- 序列化 ---

    toJSON() {
        return {
            tanks: this._tanks.map(tank => tank.getContent()),
            totals: { ...this._totals }
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiquidContainerShell;
}
