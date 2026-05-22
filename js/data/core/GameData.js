// ============================================
// GameData — 全局数据容器
// 包裹所有游戏数据，留出未来在外侧再包一层的可能
// ============================================

class GameData {
    constructor() {
        this._warehouse = null;
        this._machines = [];
        this._activeMachineIndex = 0;
        this._init();
    }

    _init() {
        this._warehouse = new Warehouse();
        this._liquidShell = new LiquidContainerShell();

        // 创建基酒机、调酒机和空白机器
        this._machines.push(new Distiller('DIST_01', '基酒机'));
        this._machines.push(new Mixer('MIX_01', '调酒机'));
        this._machines.push(new BlankMachine('BLANK_01', '空白机器'));
        this._machines[0].isActive = true;
    }

    get warehouse() { return this._warehouse; }
    get liquidShell() { return this._liquidShell; }

    get machines() { return [...this._machines]; }
    get machineCount() { return this._machines.length; }

    get activeMachine() {
        if (this._machines.length === 0) return null;
        return this._machines[this._activeMachineIndex];
    }

    get activeMachineIndex() { return this._activeMachineIndex; }

    switchMachine(direction) {
        if (this._machines.length <= 1) return this.activeMachine;
        const old = this.activeMachine;
        if (old) old.isActive = false;

        if (direction === 'next') {
            this._activeMachineIndex = (this._activeMachineIndex + 1) % this._machines.length;
        } else if (direction === 'prev') {
            this._activeMachineIndex = (this._activeMachineIndex - 1 + this._machines.length) % this._machines.length;
        }

        const next = this.activeMachine;
        if (next) next.isActive = true;
        return next;
    }

    getMachine(id) {
        return this._machines.find(m => m.id === id) || null;
    }

    toJSON() {
        return {
            warehouse: this._warehouse.toJSON(),
            machines: this._machines.map(m => m.toJSON()),
            activeMachineIndex: this._activeMachineIndex
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameData;
}
