// ============================================
// UIManager — UI 总控
// 协调 GameData、LogPanel、EditableInventoryPanel、DistillerPanel
// 添加/删除/基酒机运行 已接入数据层
// ============================================

class UIManager {
    constructor() {
        this._gameData = new GameData();
        this._logPanel = null;
        this._inventoryPanel = null;
        this._machinePanel = null;
        this._currentMachinePanel = null;
        this._liquidShellPanel = null;

        // 添加物品面板状态
        this._addItemOverlay = null;
        this._addItemTargetX = null;
        this._addItemTargetY = null;
    }

    init() {
        this._initLogPanel();
        this._initInventoryPanel();
        this._initMachinePanel();
        this._initLiquidShellPanel();
        this._initAddItemPanel();

        this.log('系统初始化完成。废土控制台已启动。');
        this.log(`仓库已加载，共 ${this._gameData.warehouse.getOccupiedCells().length} 个物品。`);
        this._logMachineSwitch();
    }

    // --- 日志 ---

    _initLogPanel() {
        this._logPanel = new LogPanel('panel-footer', {
            maxLines: 40,
            timestamp: true
        });
    }

    log(text) {
        if (this._logPanel) this._logPanel.log(text);
    }

    // --- TakeOut / Delete ---

    TakeOut(materialId, x, y) {
        const def = MaterialConfig.get(materialId);
        const name = def ? def.name : materialId;

        // 1. 从仓库取出
        const removedId = this._gameData.warehouse.removeAt(x, y);
        if (!removedId) return;

        // 2. 中间层：尝试交给当前激活的机器
        const machine = this._gameData.activeMachine;
        if (machine && machine.canAcceptSolid(removedId)) {
            const result = machine.throwInSolid(removedId);
            if (result.success) {
                this.log(`取出: ${name} 从仓库 → ${machine.name}`);
                this._inventoryPanel.refresh();
                if (this._currentMachinePanel) this._currentMachinePanel.refresh();
                return;
            }
        }

        // 3. 无机器接收，放回仓库原位
        this._gameData.warehouse.addAt(x, y, removedId);
        this.log(`取出: ${name} — 无机器接收，物品保留在仓库 [${x}, ${y}]`);
        this._inventoryPanel.refresh();
    }

    Delete(materialId, x, y) {
        const removedId = this._gameData.warehouse.removeAt(x, y);
        if (!removedId) return;
        const def = MaterialConfig.get(removedId);
        const name = def ? def.name : removedId;
        this.log(`删除: 从 [${x}, ${y}] 移除 ${name}`);
        this._inventoryPanel.refresh();
    }

    // --- 背包面板 ---

    _initInventoryPanel() {
        const warehouse = this._gameData.warehouse;

        this._inventoryPanel = new EditableInventoryPanel('panel-left', {
            getSnapshot: () => warehouse.inventory.getSnapshot(),
            getDimensions: () => ({ width: warehouse.width, height: warehouse.height }),
            onCellClick: (data) => {
                if (data.action === 'add') {
                    this._openAddItemPanel(data.x, data.y);
                } else if (data.action === 'take') {
                    this.TakeOut(data.materialId, data.x, data.y);
                } else if (data.action === 'delete') {
                    this.Delete(data.materialId, data.x, data.y);
                }
            },
            onAddRow: () => {
                const inv = warehouse.inventory;
                if (typeof inv.addRow === 'function') {
                    const success = inv.addRow();
                    if (success) {
                        this.log(`仓库已扩展，当前共 ${inv.rowCount} 行`);
                        this._inventoryPanel.refresh();
                    }
                } else {
                    this.log('[警告] 仓库不支持扩展');
                }
            }
        });
    }

    // --- 机器面板 ---

    _initMachinePanel() {
        this._machinePanel = new MachinePanel('panel-center', {
            onSwitch: (dir) => this._switchMachine(dir)
        });
        this._renderCurrentMachine();
    }

    _initLiquidShellPanel() {
        this._liquidShellPanel = new LiquidShellPanel('panel-right', this._gameData.liquidShell, {
            onClearAll: () => {
                this.log('[液体容器壳] 全部液体已清空');
            }
        });
    }

    _renderCurrentMachine() {
        const machine = this._gameData.activeMachine;
        if (!machine) return;

        this._machinePanel.setMachine(machine);
        this._machinePanel.clearContent();

        // 清空并销毁旧的机器面板控制器
        if (this._currentMachinePanel) {
            this._currentMachinePanel = null;
        }

        const contentArea = this._machinePanel.getContentArea();

        if (machine.type === 'distiller') {
            this._currentMachinePanel = new DistillerPanel(contentArea, machine, {
                onRun: () => this._runDistiller(),
                onClearSolid: () => this._clearDistillerSolid(),
                onExportSolid: () => this._exportDistillerSolid(),
                onClearLiquid: () => this._clearDistillerLiquid(),
                onExportLiquid: () => this._exportDistillerLiquid(),
                onConfigChange: (key, value) => {
                    this.log(`[基酒机] 配置更新: ${key} = ${value}`);
                }
            });
        } else if (machine.type === 'mixer') {
            this._currentMachinePanel = new MixerPanel(contentArea, machine, {
                onRun: () => this._runMixer(),
                onClearSolid: () => this._clearMixerSolid(),
                onExportSolid: () => this._exportMixerSolid(),
                onImportLiquid: (materialId, volume) => this._importMixerLiquid(materialId, volume),
                onClearLiquid: () => this._clearMixerLiquid(),
                onExportLiquid: () => this._exportMixerLiquid(),
                onExportProduct: () => this._exportMixerProductLiquid(),
                getShell: () => this._gameData.liquidShell
            });
        } else if (machine.type === 'blank') {
            this._currentMachinePanel = new BlankPanel(contentArea, machine, {});
        }
    }

    _switchMachine(direction) {
        this._gameData.switchMachine(direction);
        this._renderCurrentMachine();
        const m = this._gameData.activeMachine;
        if (m) {
            this.log(`切换到: [${m.name}]`);
        }
    }

    _runDistiller() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'distiller') return;

        this.log('[基酒机] 启动运行...');
        const result = machine.run();
        this.log(result.msg || result.reason);
        if (this._currentMachinePanel) this._currentMachinePanel.refresh();
    }

    _clearDistillerSolid() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'distiller') return;
        machine.clearSolid();
        this.log('[基酒机] 固体缓存已清空');
        if (this._currentMachinePanel) this._currentMachinePanel.refresh();
    }

    _exportDistillerSolid() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'distiller') return;
        // 导出固体：遍历取出并放回仓库（简化实现）
        const solids = machine.solidBuffer.getOccupiedCells();
        let count = 0;
        for (const cell of solids) {
            const id = machine.takeSolidAt(cell.x, cell.y);
            if (id) {
                this._gameData.warehouse.add(id);
                count++;
            }
        }
        this.log(`[基酒机] 导出固体 ${count} 个到仓库`);
        if (this._currentMachinePanel) this._currentMachinePanel.refresh();
        this._inventoryPanel.refresh();
    }

    _clearDistillerLiquid() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'distiller') return;
        machine.clearLiquid();
        this.log('[基酒机] 液体缓存已清空');
        if (this._currentMachinePanel) this._currentMachinePanel.refresh();
    }

    _exportDistillerLiquid() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'distiller') return;

        const content = machine.liquidBuffer.getContent();
        if (!content) {
            this.log('[基酒机] 液体缓存为空，无法导出');
            return;
        }

        // 1. 从基酒机倒出全部液体
        const result = machine.exportLiquid(content.volume);
        if (!result.success || result.poured <= 0) {
            this.log('[基酒机] 液体导出失败');
            return;
        }

        // 2. 中间层：倒入液体容器壳
        const shell = this._gameData.liquidShell;
        const pourResult = shell.pourIn(result.materialId, result.poured);

        if (pourResult.success || pourResult.poured > 0) {
            this.log(`[基酒机] 导出液体 ${result.poured.toFixed(1)} 体积 → 液体容器壳`);
        } else {
            this.log(`[基酒机] 液体倒入容器壳失败: ${pourResult.reason}`);
        }

        this._currentMachinePanel.refresh();
        this._liquidShellPanel.refresh();
    }

    // --- 调酒机 ---

    _runMixer() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'mixer') return;

        this.log('[调酒机] 启动酿造...');
        const result = machine.run();
        this.log(result.msg || result.reason);
        if (this._currentMachinePanel) this._currentMachinePanel.refresh();
        this._inventoryPanel.refresh();
    }

    _clearMixerSolid() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'mixer') return;
        machine.clearSolid();
        this.log('[调酒机] 固体缓存已清空');
        if (this._currentMachinePanel) this._currentMachinePanel.refresh();
    }

    _exportMixerSolid() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'mixer') return;
        const solids = machine.solidBuffer.getOccupiedCells();
        let count = 0;
        for (const cell of solids) {
            const id = machine.takeSolidAt(cell.x, cell.y);
            if (id) {
                this._gameData.warehouse.add(id);
                count++;
            }
        }
        this.log(`[调酒机] 导出固体 ${count} 个到仓库`);
        if (this._currentMachinePanel) this._currentMachinePanel.refresh();
        this._inventoryPanel.refresh();
    }

    _importMixerLiquid(materialId, volume) {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'mixer') return;

        const shell = this._gameData.liquidShell;
        const result = machine.importLiquid(shell, materialId, volume);

        if (result.success) {
            this.log(`[调酒机] 导入液体 ${result.materialId} ${result.poured.toFixed(1)} 体积`);
        } else {
            this.log(`[调酒机] 液体导入失败: ${result.reason}`);
        }

        if (this._currentMachinePanel) this._currentMachinePanel.refresh();
        this._liquidShellPanel.refresh();
    }

    _clearMixerLiquid() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'mixer') return;
        machine.clearLiquid();
        this.log('[调酒机] 液体缓存已清空');
        if (this._currentMachinePanel) this._currentMachinePanel.refresh();
    }

    _exportMixerLiquid() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'mixer') return;

        const content = machine.liquidBuffer.getContent();
        if (!content) {
            this.log('[调酒机] 液体缓存为空，无法导出');
            return;
        }

        const result = machine.exportLiquid(content.volume);
        if (!result.success || result.poured <= 0) {
            this.log('[调酒机] 液体导出失败');
            return;
        }

        const shell = this._gameData.liquidShell;
        const pourResult = shell.pourIn(result.materialId, result.poured);

        if (pourResult.success || pourResult.poured > 0) {
            this.log(`[调酒机] 导出液体 ${result.poured.toFixed(1)} 体积 → 液体容器壳`);
        } else {
            this.log(`[调酒机] 液体倒入容器壳失败: ${pourResult.reason}`);
        }

        this._currentMachinePanel.refresh();
        this._liquidShellPanel.refresh();
    }

    _exportMixerProductLiquid() {
        const machine = this._gameData.activeMachine;
        if (!machine || machine.type !== 'mixer') return;

        const content = machine.productLiquidBuffer.getContent();
        if (!content) {
            this.log('[调酒机] 产物缓存为空，无法导出');
            return;
        }

        const result = machine.exportProductLiquid(content.volume);
        if (!result.success || result.poured <= 0) {
            this.log('[调酒机] 产物液体导出失败');
            return;
        }

        const shell = this._gameData.liquidShell;
        const pourResult = shell.pourIn(result.materialId, result.poured);

        if (pourResult.success || pourResult.poured > 0) {
            this.log(`[调酒机] 导出产物液体 ${result.poured.toFixed(1)} 体积 → 液体容器壳`);
        } else {
            this.log(`[调酒机] 产物液体倒入容器壳失败: ${pourResult.reason}`);
        }

        this._currentMachinePanel.refresh();
        this._liquidShellPanel.refresh();
    }

    // --- 添加物品面板 ---

    _initAddItemPanel() {
        this._addItemOverlay = document.getElementById('add-item-overlay');
        if (!this._addItemOverlay) return;

        document.getElementById('btn-add-item-close').addEventListener('click', () => this._closeAddItemPanel());
        document.getElementById('btn-add-item-cancel').addEventListener('click', () => this._closeAddItemPanel());
        document.getElementById('btn-add-item-confirm').addEventListener('click', () => this._confirmAddItem());

        this._addItemOverlay.addEventListener('click', (e) => {
            if (e.target === this._addItemOverlay) this._closeAddItemPanel();
        });
    }

    _openAddItemPanel(x, y) {
        this._addItemTargetX = x;
        this._addItemTargetY = y;
        this._clearAddItemForm();
        this._addItemOverlay.classList.add('active');
    }

    _closeAddItemPanel() {
        this._addItemOverlay.classList.remove('active');
        this._addItemTargetX = null;
        this._addItemTargetY = null;
    }

    _clearAddItemForm() {
        document.getElementById('input-item-id').value = '';
        document.getElementById('input-item-name').value = '';
        document.getElementById('input-item-a').value = '';
        document.getElementById('input-item-b').value = '';
        document.getElementById('input-item-c').value = '';
        document.getElementById('input-item-d').value = '';
        document.getElementById('input-item-value').value = '';
    }

    _confirmAddItem() {
        const idInput = document.getElementById('input-item-id').value.trim();
        const nameInput = document.getElementById('input-item-name').value.trim();
        const a = document.getElementById('input-item-a').value;
        const b = document.getElementById('input-item-b').value;
        const c = document.getElementById('input-item-c').value;
        const d = document.getElementById('input-item-d').value;
        const val = document.getElementById('input-item-value').value;

        const id = idInput || MaterialConfig.generateRandomId();
        const name = nameInput || MaterialConfig.generateRandomName();
        const A = a !== '' ? parseInt(a, 10) : Math.floor(Math.random() * 7) - 3;
        const B = b !== '' ? parseInt(b, 10) : Math.floor(Math.random() * 7) - 3;
        const C = c !== '' ? parseInt(c, 10) : Math.floor(Math.random() * 7) - 3;
        const D = d !== '' ? parseInt(d, 10) : Math.floor(Math.random() * 7) - 3;
        const value = val !== '' ? parseInt(val, 10) : Math.floor(Math.random() * 50) + 10;

        MaterialConfig.set(id, {
            id, name, description: '', category: 'trash', state: 'solid',
            shape: { w: 1, h: 1 }, A, B, C, D, value,
            color: this._randomColor()
        });

        const warehouse = this._gameData.warehouse;
        if (this._addItemTargetX !== null && this._addItemTargetY !== null) {
            warehouse.addAt(this._addItemTargetX, this._addItemTargetY, id);
        } else {
            warehouse.add(id);
        }

        this.log(`添加物品: ${name} [A${A} B${B} C${C} D${D}] 价值:${value} — 位置 [${this._addItemTargetX}, ${this._addItemTargetY}]`);
        this._inventoryPanel.refresh();
        this._closeAddItemPanel();
    }

    _randomColor() {
        const colors = ['#8b8680', '#6b6050', '#5a5a3a', '#4a5a6a', '#6a4a5a', '#5a6a4a', '#7a6a4a', '#4a7a6a'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    _logMachineSwitch() {
        const m = this._gameData.activeMachine;
        if (m) this.log(`当前机器: [${m.id}] ${m.name}`);
    }

    get gameData() {
        return this._gameData;
    }
}

let uiManager = null;

function initUI() {
    uiManager = new UIManager();
    uiManager.init();
    window.uiManager = uiManager;
    window.gameLog = (text) => uiManager.log(text);
    window.TakeOut = (materialId, x, y) => uiManager.TakeOut(materialId, x, y);
    window.Delete = (materialId, x, y) => uiManager.Delete(materialId, x, y);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
