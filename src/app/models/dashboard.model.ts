export interface DashboardSummary {
    totalProducts: number;
    totalStock: number;
    expiredBatches: number;
    expiredQuantity: number;
    lowStockProducts: number;
    picksThisMonth: number;
}

export interface LowStockAlert {
    productId: string;
    productName: string;
    sku: string;
    unit: string;
    currentStock: number;
    minStockThreshold: number;
}

export interface ExpiringBatch {
    id: string;
    batchNumber: string;
    productName: string;
    quantityRemaining: number;
    expiryDate: string;
}

export interface DashboardData {
    summary: DashboardSummary;
    lowStockAlerts: LowStockAlert[];
    expiringBatches: ExpiringBatch[];
}
