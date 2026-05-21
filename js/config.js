// ============================================
// 版面配置
// ============================================

const LayoutConfig = {
    // 三列版面宽度比例 (左:中:右 = 1:2:1)
    columnRatios: {
        left: 1,
        center: 2,
        right: 1
    },

    // 底部版面高度占比（相对于剩余高度）
    footerHeightRatio: 0.18,

    // 主内容区高度占比（1 - footerHeightRatio）
    mainHeightRatio: 0.82,

    // 版面间距（px）
    gap: 8,

    // 内边距（px）
    padding: 16,

    // 边框宽度（px）
    borderWidth: 2,

    // 圆角（px）
    borderRadius: 4,

    // 颜色配置（废土风格）
    colors: {
        bgBase: '#1a1612',
        bgPanel: '#252019',
        bgPanelHover: '#2e2820',
        borderRust: '#6b4423',
        borderHighlight: '#8b6914',
        textPrimary: '#d4c8a8',
        textSecondary: '#a09070',
        textMuted: '#6b6048',
        accentRust: '#8b4513',
        accentAmber: '#b8860b',
        accentDanger: '#8b2500',
        shadow: '#0d0b08'
    },

    // 字体配置
    fonts: {
        primary: "'Courier New', 'SimSun', monospace",
        title: "'Impact', 'Arial Black', 'SimHei', sans-serif"
    },

    // 各版面功能标识（预留接口）
    panels: {
        left: { id: 'panel-left', name: '左侧功能板', module: null },
        center: { id: 'panel-center', name: '中央主功能板', module: null },
        right: { id: 'panel-right', name: '右侧功能板', module: null },
        footer: { id: 'panel-footer', name: '底部信息板', module: null }
    },

    // 二级菜单配置
    subMenu: {
        widthRatio: 0.6,
        heightRatio: 0.7,
        animationDuration: 300
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayoutConfig;
}
