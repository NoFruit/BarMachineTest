// ============================================
// 材料配置 — 废土世界材料定义
// 每个物品独立，无堆叠概念
// 固有属性：id, name, description, category, state, shape, A, B, C, D, value
// ============================================

const MaterialConfig = {
    // 初始材料定义
    definitions: {
        'MAT_A': {
            id: 'MAT_A',
            name: '废铁片',
            description: '一块锈迹斑斑的金属碎片。',
            category: 'trash',
            state: 'solid',
            shape: { w: 1, h: 1 },
            A: 3, B: -2, C: 1, D: -1,
            value: 12,
            color: '#8b8680'
        },
        'MAT_B': {
            id: 'MAT_B',
            name: '旧电路板',
            description: '老旧电路板，芯片还能用。',
            category: 'trash',
            state: 'solid',
            shape: { w: 1, h: 1 },
            A: 1, B: 1, C: 2, D: 3,
            value: 28,
            color: '#3a5a3a'
        },
        'MAT_C': {
            id: 'MAT_C',
            name: '破损齿轮',
            description: '缺了几个齿的金属齿轮。',
            category: 'trash',
            state: 'solid',
            shape: { w: 1, h: 1 },
            A: 2, B: 2, C: 1, D: 1,
            value: 18,
            color: '#6b6050'
        },
        'LIQ_BASE_1': {
            id: 'LIQ_BASE_1',
            name: '粗制基酒',
            description: '蒸馏过一次的烈性液体。',
            category: 'base_liquor',
            state: 'liquid',
            A: 0, B: 0, C: 2, D: 3,
            value: 45,
            color: '#c8a848'
        },
        'LIQ_BASE_2': {
            id: 'LIQ_BASE_2',
            name: '过滤原液',
            description: '经过过滤的透明液体。',
            category: 'base_liquor',
            state: 'liquid',
            A: 1, B: 2, C: 1, D: 1,
            value: 38,
            color: '#a8c8d8'
        },
        // 基酒 — 特殊液体，基酒机专用产出
        'BASE_LIQUOR': {
            id: 'BASE_LIQUOR',
            name: '基酒',
            description: '由基酒机产出的标准基酒液体。',
            category: 'base_liquor',
            state: 'liquid',
            A: 0, B: 0, C: 0, D: 0,
            value: 1,
            color: '#c8a848'
        }
    },

    // 按ID获取材料定义
    get(id) {
        return this.definitions[id] || null;
    },

    // 添加/覆盖材料定义（自动 clamp 四维到 [-3, 3]）
    set(id, def) {
        if (def && typeof def.A === 'number') def.A = Math.max(-3, Math.min(3, def.A));
        if (def && typeof def.B === 'number') def.B = Math.max(-3, Math.min(3, def.B));
        if (def && typeof def.C === 'number') def.C = Math.max(-3, Math.min(3, def.C));
        if (def && typeof def.D === 'number') def.D = Math.max(-3, Math.min(3, def.D));
        this.definitions[id] = def;
    },

    // 获取所有固体材料
    getAllSolids() {
        return Object.values(this.definitions).filter(m => m.state === 'solid');
    },

    // 获取所有液体材料
    getAllLiquids() {
        return Object.values(this.definitions).filter(m => m.state === 'liquid');
    },

    // 随机名字生成词库
    _namePrefixes: ['锈迹', '破损', '老旧', '废弃', '残破', '扭曲', '烧焦', '腐蚀', '碎裂', '变形', '锈蚀', '废弃'],
    _nameTypes:   ['零件', '金属片', '齿轮', '螺丝', '电路', '管道', '板材', '线圈', '容器', '工具', '轴承', '阀门'],

    generateRandomName() {
        const p = this._namePrefixes[Math.floor(Math.random() * this._namePrefixes.length)];
        const t = this._nameTypes[Math.floor(Math.random() * this._nameTypes.length)];
        const n = Math.floor(Math.random() * 900) + 100;
        return `${p}${t}-${n}`;
    },

    generateRandomId() {
        return 'MAT_' + Math.random().toString(36).slice(2, 8).toUpperCase();
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaterialConfig;
}
