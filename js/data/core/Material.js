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
        const attrs = Material.randomAttrs();
        this.A = config.A ?? attrs.A;
        this.B = config.B ?? attrs.B;
        this.C = config.C ?? attrs.C;
        this.D = config.D ?? attrs.D;

        // 价值属性
        this.value = config.value ?? Material.randomValue();
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

    // --- 随机生成静态方法 ---

    static randomId(prefix = 'MAT_') {
        return prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
    }

    static randomName(style = 'wasteland') {
        if (style === 'wasteland') {
            const prefixes = ['锈迹', '破损', '老旧', '废弃', '残破', '扭曲', '烧焦', '腐蚀', '碎裂', '变形', '锈蚀'];
            const types = ['零件', '金属片', '齿轮', '螺丝', '电路', '管道', '板材', '线圈', '容器', '工具', '轴承', '阀门'];
            const p = prefixes[Math.floor(Math.random() * prefixes.length)];
            const t = types[Math.floor(Math.random() * types.length)];
            const n = Math.floor(Math.random() * 900) + 100;
            return `${p}${t}-${n}`;
        }
        if (style === 'liquor') {
            const prefixes = ['烈', '陈', '苦', '甘', '浊', '醇', '酸', '香'];
            const suffixes = ['酿', '酒', '露', '液', '浆', '饮', '泉', '醇'];
            const p = prefixes[Math.floor(Math.random() * prefixes.length)];
            const s = suffixes[Math.floor(Math.random() * suffixes.length)];
            const n = Math.floor(Math.random() * 90) + 10;
            return `${p}${s}-${n}`;
        }
        return '未命名-' + Math.floor(Math.random() * 1000);
    }

    static randomAttrs() {
        const rand = () => Math.floor(Math.random() * 7) - 3;
        return { A: rand(), B: rand(), C: rand(), D: rand() };
    }

    static randomValue(min = 10, max = 59) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomColor(palette = 'wasteland') {
        if (palette === 'wasteland') {
            const colors = ['#8b8680', '#6b6050', '#5a5a3a', '#4a5a6a', '#6a4a5a', '#5a6a4a', '#7a6a4a', '#4a7a6a'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        if (palette === 'liquor') {
            const colors = ['#c8a848', '#a87040', '#8b4040', '#6a8b40', '#408b6a', '#406a8b', '#6a408b', '#8b6a40'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        return '#888';
    }

    // 生成完整材料定义对象
    static generateDef(options = {}) {
        const state = options.state || 'solid';
        const id = options.id || Material.randomId(options.idPrefix || (state === 'liquid' ? 'LIQ_' : 'MAT_'));
        const name = options.name || Material.randomName(options.nameStyle || (state === 'liquid' ? 'liquor' : 'wasteland'));
        const attrs = options.attrs || Material.randomAttrs();
        const value = options.value ?? Material.randomValue(options.valueMin, options.valueMax);
        const color = options.color || Material.randomColor(options.colorPalette || (state === 'liquid' ? 'liquor' : 'wasteland'));

        const def = {
            id,
            name,
            description: options.description || '',
            category: options.category || (state === 'liquid' ? 'base_liquor' : 'trash'),
            state,
            A: attrs.A, B: attrs.B, C: attrs.C, D: attrs.D,
            value,
            color
        };
        if (state === 'solid') {
            def.shape = options.shape || { w: 1, h: 1 };
        }
        return def;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Material;
}
