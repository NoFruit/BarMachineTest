// ============================================
// LiquidTank — 液体容器
// 只存储液体材料，float 体积存储
// 禁止融合：不同 materialId 不能共存于同一容器
// 非同类液体不准倒入
// ============================================

class LiquidTank {
    constructor(capacity, options = {}) {
        this._capacity = capacity || ContainerConfig.tank.defaultCapacity;
        this._precision = options.precision || ContainerConfig.tank.precision;

        // 当前存储：{ materialId, volume }
        // 一次只能存一种液体
        this._content = null;
    }

    // --- 私有方法 ---

    _canAcceptMaterial(materialId) {
        const def = MaterialConfig.get(materialId);
        if (!def) return false;
        return def.state === 'liquid';
    }

    _round(value) {
        const p = Math.pow(10, this._precision);
        return Math.round(value * p) / p;
    }

    // --- 公开查询接口 ---

    get capacity() { return this._capacity; }
    get isEmpty() { return this._content === null; }

    // 获取当前内容（只读副本）
    getContent() {
        return this._content ? { ...this._content } : null;
    }

    // 当前液体体积
    getVolume() {
        return this._content ? this._content.volume : 0;
    }

    // 当前液体ID
    getMaterialId() {
        return this._content ? this._content.materialId : null;
    }

    // 剩余空间
    getRemaining() {
        return this._round(this._capacity - this.getVolume());
    }

    // 填充比例 0~1
    getFillRatio() {
        if (this._capacity <= 0) return 0;
        return this.getVolume() / this._capacity;
    }

    // --- 修改接口 ---

    // 倒入液体
    // 规则：空容器可接受任何液体；有液体时只接受同种材料
    pourIn(materialId, volume) {
        if (!this._canAcceptMaterial(materialId)) {
            console.warn('[LiquidTank] 非液体材料不可倒入:', materialId);
            return { success: false, reason: 'not_liquid', poured: 0 };
        }

        if (volume <= 0) {
            return { success: false, reason: 'invalid_volume', poured: 0 };
        }

        // 容器已有液体且不同种类 → 禁止融合
        if (this._content && this._content.materialId !== materialId) {
            console.warn('[LiquidTank] 融合禁止：容器已有', this._content.materialId, '不可倒入', materialId);
            return { success: false, reason: 'fusion_forbidden', poured: 0 };
        }

        // 计算实际可倒入量
        const remaining = this.getRemaining();
        const canPour = Math.min(volume, remaining);

        if (canPour <= 0) {
            return { success: false, reason: 'tank_full', poured: 0 };
        }

        // 首次倒入或追加
        if (!this._content) {
            this._content = { materialId, volume: this._round(canPour) };
        } else {
            this._content.volume = this._round(this._content.volume + canPour);
        }

        const fullyAccepted = (canPour >= volume);
        return {
            success: fullyAccepted,
            reason: fullyAccepted ? 'ok' : 'partial',
            poured: canPour,
            remaining: volume - canPour
        };
    }

    // 倒出液体
    pourOut(volume) {
        if (!this._content || this._content.volume <= 0) {
            return { success: false, reason: 'empty', poured: 0 };
        }

        const canPour = Math.min(volume, this._content.volume);
        this._content.volume = this._round(this._content.volume - canPour);

        const result = {
            success: true,
            materialId: this._content.materialId,
            poured: canPour
        };

        // 倒空了
        if (this._content.volume <= 0) {
            this._content = null;
        }

        return result;
    }

    // 强制清空（不返回材料）
    clear() {
        this._content = null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiquidTank;
}
