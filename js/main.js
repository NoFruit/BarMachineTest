// ============================================
// 主逻辑 / 版面控制器
// ============================================

(function () {
    'use strict';

    // 当前状态
    const State = {
        subMenuOpen: false,
        activePanel: 'center',
        modules: {}
    };

    // DOM 元素缓存
    const DOM = {};

    // 初始化
    function init() {
        cacheDOM();
        bindEvents();
        applyLayout();
        console.log('[Main] 废土控制台初始化完成');
    }

    function cacheDOM() {
        DOM.container = document.getElementById('game-container');
        DOM.mainArea = document.getElementById('main-area');
        DOM.leftPanel = document.getElementById('panel-left');
        DOM.centerPanel = document.getElementById('panel-center');
        DOM.rightPanel = document.getElementById('panel-right');
        DOM.footerPanel = document.getElementById('panel-footer');
        DOM.subMenuBtn = document.getElementById('btn-submenu');
        DOM.subMenuOverlay = document.getElementById('submenu-overlay');
        DOM.subMenuClose = document.getElementById('btn-submenu-close');
    }

    function bindEvents() {
        if (DOM.subMenuBtn) {
            DOM.subMenuBtn.addEventListener('click', openSubMenu);
        }
        if (DOM.subMenuClose) {
            DOM.subMenuClose.addEventListener('click', closeSubMenu);
        }
        if (DOM.subMenuOverlay) {
            DOM.subMenuOverlay.addEventListener('click', function (e) {
                if (e.target === DOM.subMenuOverlay) closeSubMenu();
            });
        }
        window.addEventListener('resize', applyLayout);
    }

    // 应用版面尺寸
    function applyLayout() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cfg = LayoutConfig;
        const totalRatio = cfg.columnRatios.left + cfg.columnRatios.center + cfg.columnRatios.right;

        const gapTotal = cfg.gap * 4;
        const availableW = w - gapTotal;
        const unitW = availableW / totalRatio;

        const leftW = unitW * cfg.columnRatios.left;
        const centerW = unitW * cfg.columnRatios.center;
        const rightW = unitW * cfg.columnRatios.right;

        const mainH = h * cfg.mainHeightRatio - cfg.gap * 2;
        const footerH = h * cfg.footerHeightRatio - cfg.gap * 2;

        if (DOM.leftPanel) DOM.leftPanel.style.width = leftW + 'px';
        if (DOM.centerPanel) DOM.centerPanel.style.width = centerW + 'px';
        if (DOM.rightPanel) DOM.rightPanel.style.width = rightW + 'px';
        if (DOM.mainArea) DOM.mainArea.style.height = mainH + 'px';
        if (DOM.footerPanel) {
            DOM.footerPanel.style.height = footerH + 'px';
            DOM.footerPanel.style.width = (w - cfg.gap * 2) + 'px';
        }
    }

    // 打开二级菜单
    function openSubMenu() {
        if (!DOM.subMenuOverlay) return;
        DOM.subMenuOverlay.classList.add('active');
        State.subMenuOpen = true;
        console.log('[Main] 二级菜单已打开');
    }

    // 关闭二级菜单
    function closeSubMenu() {
        if (!DOM.subMenuOverlay) return;
        DOM.subMenuOverlay.classList.remove('active');
        State.subMenuOpen = false;
        console.log('[Main] 二级菜单已关闭');
    }

    // === 预留接口：模块挂载 ===

    // 向指定版面挂载功能模块
    window.mountModule = function (panelId, moduleName, renderFn) {
        const panel = document.getElementById(panelId);
        if (!panel) {
            console.warn('[Main] 版面不存在:', panelId);
            return false;
        }
        State.modules[panelId] = {
            name: moduleName,
            render: renderFn
        };
        renderFn(panel);
        console.log('[Main] 模块已挂载:', panelId, '->', moduleName);
        return true;
    };

    // 卸载模块
    window.unmountModule = function (panelId) {
        delete State.modules[panelId];
        const panel = document.getElementById(panelId);
        if (panel) panel.innerHTML = '';
        console.log('[Main] 模块已卸载:', panelId);
    };

    // 获取当前状态
    window.getGameState = function () {
        return { ...State };
    };

    // DOMContentLoaded 时初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
