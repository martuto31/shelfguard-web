export interface AnalyticsSummary {
    totalProducts: number;
    totalStock: number;
    expiredBatches: number;
    expiredQuantity: number;
    lowStockProducts: number;
    picksThisMonth: number;
    wasteRate: number;
}

export interface StockByProduct {
    productId: string;
    productName: string;
    sku: string;
    category: string;
    unit: string;
    totalRemaining: number;
    minStockThreshold: number;
    isLowStock: boolean;
    activeBatches: number;
    earliestExpiry: string | null;
}

export interface ExpiryRiskLevel {
    count: number;
    quantity: number;
}

export interface ExpiryRisk {
    expired: ExpiryRiskLevel;
    critical: ExpiryRiskLevel;
    warning: ExpiryRiskLevel;
    monitor: ExpiryRiskLevel;
    safe: ExpiryRiskLevel;
}

export interface WasteByProduct {
    productId: string;
    productName: string;
    sku: string;
    totalReceived: number;
    totalWasted: number;
    wasteRate: number;
}

export interface SupplierScore {
    supplierId: string;
    supplierName: string;
    totalBatches: number;
    avgShelfLifeDays: number;
    wastedQuantity: number;
}

export interface MonthlyMovement {
    month: string;
    totalIn: number;
    totalOut: number;
}

export interface AnalyticsData {
    summary: AnalyticsSummary;
    stockByProduct: StockByProduct[];
    expiryRisk: ExpiryRisk;
    wasteByProduct: WasteByProduct[];
    supplierPerformance: SupplierScore[];
    movementsByMonth: MonthlyMovement[];
}
