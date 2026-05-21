// ============================================
// BlankMachine — 空白机器
// 无实际功能，仅作为占位机器
// ============================================

class BlankMachine extends Machine {
    constructor(id, name) {
        super(id, name, 'blank');
    }

    run() {
        return { success: false, reason: 'blank_machine' };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlankMachine;
}
