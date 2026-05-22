// ============================================
// Material 材料基类
// 物理形态(state): solid | liquid
// 功能分类(category): trash | base_liquor 等
// 四维属性: A, B, C, D（初始后不可修改）
// 价值属性: value
// 稀有度: rarity（1-4，由四维非零个数决定）
// ============================================

class Material {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description || '由系统生成的材料。';
        this.category = config.category;
        this.state = config.state;
        this.rarity = config.rarity ?? 1;
        this.color = config.color || Material.RARITY_COLORS[this.rarity] || '#888';

        // 固体特有：形状 (w, h) 单位：格子数
        if (this.isSolid()) {
            this.shape = config.shape || { w: 1, h: 1 };
        } else {
            this.shape = null;
        }

        // 四维属性 — 固有，创建后不可修改
        this.A = config.A ?? 0;
        this.B = config.B ?? 0;
        this.C = config.C ?? 0;
        this.D = config.D ?? 0;

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

    // --- 稀有度系统 ---

    static RARITY_COLORS = {
        1: '#c8c8c8', // 白
        2: '#5a9fd4', // 蓝
        3: '#9b59b6', // 紫
        4: '#e67e22'  // 橙
    };

    static RARITY_WEIGHTS = [0, 0.50, 0.30, 0.15, 0.05]; // 索引0占位

    // 由四维计算稀有度
    static getRarity(attrs) {
        const count = [attrs.A, attrs.B, attrs.C, attrs.D].filter(v => v !== 0).length;
        return Math.max(1, Math.min(4, count));
    }

    // 按权重随机稀有度
    static randomRarity() {
        const r = Math.random();
        let cumulative = 0;
        for (let i = 1; i <= 4; i++) {
            cumulative += Material.RARITY_WEIGHTS[i];
            if (r < cumulative) return i;
        }
        return 1;
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

    // 完全随机四维（[-3,3]，不受稀有度约束）
    static randomAttrs() {
        const rand = () => Math.floor(Math.random() * 7) - 3;
        return { A: rand(), B: rand(), C: rand(), D: rand() };
    }

    // 根据稀有度生成四维：恰好 rarity 个属性非零
    static randomAttrsByRarity(rarity) {
        const nonZeroValues = [-3, -2, -1, 1, 2, 3];
        const randNonZero = () => nonZeroValues[Math.floor(Math.random() * nonZeroValues.length)];

        const positions = [0, 1, 2, 3];
        // Fisher-Yates shuffle
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        const selected = positions.slice(0, Math.max(1, Math.min(4, rarity)));

        const attrs = { A: 0, B: 0, C: 0, D: 0 };
        const keys = ['A', 'B', 'C', 'D'];
        for (const pos of selected) {
            attrs[keys[pos]] = randNonZero();
        }
        return attrs;
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

    // 确定性 ID：由稀有度、价值、四维编码
    static computeId(rarity, value, attrs) {
        const sign = (n) => n >= 0 ? `+${n}` : n;
        return `R${rarity}_V${value}_A${sign(attrs.A)}B${sign(attrs.B)}C${sign(attrs.C)}D${sign(attrs.D)}`;
    }

    // 确定性名称：由 ID 哈希映射到词库
    static nameFromId(id, style = 'wasteland') {
        const hash = Material._hashString(id);
        if (style === 'liquor') {
            const prefixes = ['烈', '陈', '苦', '甘', '浊', '醇', '酸', '香'];
            const suffixes = ['酿', '酒', '露', '液', '浆', '饮', '泉', '醇'];
            const p = prefixes[hash % prefixes.length];
            const s = suffixes[(hash >> 4) % suffixes.length];
            const n = (hash % 90) + 10;
            return `${p}${s}-${n}`;
        }
        const prefixes = ['锈迹', '破损', '老旧', '废弃', '残破', '扭曲', '烧焦', '腐蚀', '碎裂', '变形', '锈蚀'];
        const types = ['零件', '金属片', '齿轮', '螺丝', '电路', '管道', '板材', '线圈', '容器', '工具', '轴承', '阀门'];
        const p = prefixes[hash % prefixes.length];
        const t = types[(hash >> 4) % types.length];
        const n = (hash % 900) + 100;
        return `${p}${t}-${n}`;
    }

    // 简单字符串哈希（确定性）
    static _hashString(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) - h) + str.charCodeAt(i);
            h |= 0;
        }
        return Math.abs(h);
    }

    // 生成完整材料定义对象
    // config: { state, category, rarity, value, attrs, id, name, ... }
    // 配置项：state, category（外界决定）
    // 可选项：rarity, value, attrs, id, name（外界可传，没传内部处理）
    // 内部决定：color（由稀有度映射）
    static generateDef(config = {}) {
        const state = config.state || 'solid';
        const category = config.category || (state === 'liquid' ? 'base_liquor' : 'trash');
        const description = '由系统生成的材料。';
        const shape = { w: 1, h: 1 };

        // 四维 → 稀有度 是单向决定关系
        let attrs, rarity;
        if (config.attrs) {
            attrs = { ...config.attrs };
            rarity = Material.getRarity(attrs);
        } else {
            rarity = config.rarity || Material.randomRarity();
            attrs = Material.randomAttrsByRarity(rarity);
            rarity = Material.getRarity(attrs);
        }

        const value = config.value ?? Material.randomValue();

        const id = config.id || Material.computeId(rarity, value, attrs);
        const name = config.name || Material.nameFromId(id, state === 'liquid' ? 'liquor' : 'wasteland');
        const color = Material.RARITY_COLORS[rarity];

        const def = {
            id, name, description, category, state, rarity,
            A: attrs.A, B: attrs.B, C: attrs.C, D: attrs.D,
            value, color
        };
        if (state === 'solid') {
            def.shape = shape;
        }
        return def;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Material;
}
