// ============================================
// 容器配置 — Grid / Tank 等容器的默认参数
// ============================================

const ContainerConfig = {
    // 固体容器（GridInventory）默认配置
    grid: {
        defaultWidth: 5,
        defaultHeight: 8,
        cellSize: 48,
        cellGap: 4,
        maxStackDefault: 99
    },

    // 液体容器（LiquidTank）默认配置
    tank: {
        defaultCapacity: 100.0,
        capacityStep: 50.0,
        precision: 2
    },

    // 仓库（Warehouse）配置
    warehouse: {
        gridWidth: 8,
        gridHeight: 10
    },

    // 机器默认缓存配置
    machine: {
        solidBuffer: {
            gridWidth: 4,
            gridHeight: 4
        },
        liquidBuffer: {
            capacity: 200.0
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContainerConfig;
}
