// ============================================
// Material 材料基类
// 物理形态(state): solid | liquid
// 功能分类(category): trash | base_liquor 等
// 四维属性: A, B, C, D（初始后不可修改）
// 价值属性: value
// ============================================

class Material {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description || '';
        this.category = config.category;
        this.state = config.state;
        this.color = config.color || '#888';

        // 固体特有：形状 (w, h) 单位：格子数
        if (this.isSolid()) {
            this.shape = config.shape || { w: 1, h: 1 };
        } else {
            this.shape = null;
        }

        // 四维属性 — 固有，创建后不可修改
        this.A = config.A ?? Math.floor(Math.random() * 7) - 3;
        this.B = config.B ?? Math.floor(Math.random() * 7) - 3;
        this.C = config.C ?? Math.floor(Math.random() * 7) - 3;
        this.D = config.D ?? Math.floor(Math.random() * 7) - 3;

        // 价值属性
        this.value = config.value ?? 10;
    }

    isSolid() {
        return this.state === 'solid';
    }

    isLiquid() {
        return this.state === 'liquid';
    }

    getAttrs() {
        return { A: this.A, B: this.B, C: this.C, D: this.D };
    }

    getGridSize() {
        if (this.isSolid() && this.shape) {
            return this.shape.w * this.shape.h;
        }
        return 0;
    }

    static fromConfig(materialId) {
        const cfg = MaterialConfig.get(materialId);
        if (!cfg) {
            console.warn('[Material] 未知材料ID:', materialId);
            return null;
        }
        return new Material(cfg);
    }

    static getDef(materialId) {
        return MaterialConfig.get(materialId);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Material;
}
