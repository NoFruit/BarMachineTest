// ============================================
// Mixer — 调酒机
// 接收固体原料 + 基酒液体，通过四元素相加生成酒产品
// 固体缓存：多种原料，实时计算平均四维
// 液体缓存：单一液体，保持四维显示
// 产物缓存：液体罐，运行后生成新液态酒品
// ============================================

class Mixer extends Machine {
    constructor(id, name) {
        super(id, name, 'mixer');
        this._productLiquidBuffer = new LiquidTank(Infinity);

    }

    get productLiquidBuffer() { return this._productLiquidBuffer; }

    // --- 固体平均四维（实时计算）---

    getSolidAvgAttrs() {
        const cells = this._solidBuffer.getOccupiedCells();
        if (cells.length === 0) return null;

        let sumA = 0, sumB = 0, sumC = 0, sumD = 0;
        for (const cell of cells) {
            const def = MaterialConfig.get(cell.materialId);
            if (def) {
                sumA += def.A;
                sumB += def.B;
                sumC += def.C;
                sumD += def.D;
            }
        }
        const n = cells.length;
        return {
            A: Math.round(sumA / n),
            B: Math.round(sumB / n),
            C: Math.round(sumC / n),
            D: Math.round(sumD / n)
        };
    }

    // --- 液体四维 ---

    getLiquidAttrs() {
        const content = this._liquidBuffer.getContent();
        if (!content) return null;
        const def = MaterialConfig.get(content.materialId);
        return def ? { A: def.A, B: def.B, C: def.C, D: def.D } : null;
    }

    // --- 产物液体缓存 ---

    exportProductLiquid(volume) {
        return this._productLiquidBuffer.pourOut(volume);
    }

    clearProductLiquid() {
        this._productLiquidBuffer.clear();
    }

    // --- 液体导入（带回滚）---

    importLiquid(shell, materialId, volume) {
        if (volume <= 0) {
            return { success: false, reason: 'invalid_volume', poured: 0 };
        }

        // 1. 先检查机器液体缓存剩余空间
        const remaining = this._liquidBuffer.getRemaining();
        if (remaining <= 0) {
            return { success: false, reason: 'machine_liquid_full', poured: 0 };
        }
        const requestVolume = Math.min(volume, remaining);

        // 2. 从右侧壳倒出
        const outResult = shell.pourOut(materialId, requestVolume);
        if (!outResult.success || outResult.poured <= 0) {
            return { success: false, reason: outResult.reason || 'shell_pour_out_failed', poured: 0 };
        }

        // 3. 倒入机器液体缓存
        const inResult = this._liquidBuffer.pourIn(materialId, outResult.poured);
        if (inResult.poured <= 0) {
            // 回滚：把液体还回 shell
            shell.pourIn(materialId, outResult.poured);
            return { success: false, reason: 'machine_pour_in_failed', poured: 0 };
        }

        return {
            success: true,
            materialId,
            poured: inResult.poured,
            reason: 'ok'
        };
    }

    // --- 核心运行逻辑 ---

    run() {
        // 检查前提
        const solidCells = this._solidBuffer.getOccupiedCells();
        if (solidCells.length === 0) {
            return { success: false, reason: 'empty_solid', msg: '固体缓存为空' };
        }
        const liquidContent = this._liquidBuffer.getContent();
        if (!liquidContent || liquidContent.volume <= 0) {
            return { success: false, reason: 'empty_liquid', msg: '液体缓存为空' };
        }
        const productContent = this._productLiquidBuffer.getContent();
        if (productContent && productContent.volume > 0) {
            return { success: false, reason: 'product_buffer_full', msg: '产物缓存已有液体，请先导出' };
        }

        // 计算固体平均四维
        const solidAvg = this.getSolidAvgAttrs();
        // 获取液体四维
        const liquidDef = MaterialConfig.get(liquidContent.materialId);
        const liquidAttrs = liquidDef ? { A: liquidDef.A, B: liquidDef.B, C: liquidDef.C, D: liquidDef.D } : { A: 0, B: 0, C: 0, D: 0 };

        // 新四维 = 液体四维 + 固体平均四维
        const newA = liquidAttrs.A + solidAvg.A;
        const newB = liquidAttrs.B + solidAvg.B;
        const newC = liquidAttrs.C + solidAvg.C;
        const newD = liquidAttrs.D + solidAvg.D;

        // 产物体积 = 输入基酒体积
        const productVolume = liquidContent.volume;

        // 生成新产品
        const productId = Material.randomId('LIQ_PROD_');
        const productName = Material.randomName('liquor');
        const productValue = Material.randomValue(20, 119);

        MaterialConfig.set(productId, {
            id: productId,
            name: productName,
            description: '由调酒机酿造的特殊酒品。',
            category: 'product',
            state: 'liquid',
            shape: { w: 1, h: 1 },
            A: newA, B: newB, C: newC, D: newD,
            value: productValue,
            color: Material.randomColor('liquor')
        });

        // 放入产物液体缓存
        this._productLiquidBuffer.pourIn(productId, productVolume);

        // 消耗原料：清空固体和液体缓存
        this._solidBuffer.clear();
        this._liquidBuffer.clear();

        return {
            success: true,
            productId,
            productName,
            value: productValue,
            volume: productVolume,
            attrs: { A: newA, B: newB, C: newC, D: newD },
            msg: `调酒机运行完成，产出 [${productName}] 价值:${productValue} 体积:${productVolume.toFixed(1)} [A${newA} B${newB} C${newC} D${newD}]`
        };
    }

    // --- 清空/导出代理 ---

    clearSolid() { this._solidBuffer.clear(); }
    clearLiquid() { this._liquidBuffer.clear(); }

    takeSolidAt(x, y) { return this._solidBuffer.removeAt(x, y); }
    exportLiquid(volume) { return this._liquidBuffer.pourOut(volume); }

    // --- 状态查询 ---

    getStatus() {
        const base = super.getStatus();
        const productContent = this._productLiquidBuffer.getContent();
        return {
            ...base,
            solidAvgAttrs: this.getSolidAvgAttrs(),
            liquidAttrs: this.getLiquidAttrs(),
            product: productContent ? {
                materialId: productContent.materialId,
                volume: productContent.volume,
                def: MaterialConfig.get(productContent.materialId)
            } : null,
            productVolume: productContent ? productContent.volume : 0
        };
    }

    // --- 序列化 ---

    toJSON() {
        return {
            ...super.toJSON(),
            productLiquid: this._productLiquidBuffer.getContent()
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Mixer;
}
