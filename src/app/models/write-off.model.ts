export interface ExpiredBatch {
    batchId: string;
    batchNumber: string;
    productId: string;
    productName: string;
    sku: string;
    unit: string;
    quantityRemaining: number;
    expiryDate: string;
    daysExpired: number;
}

export interface ActiveBatch {
    batchId: string;
    batchNumber: string;
    productId: string;
    productName: string;
    sku: string;
    unit: string;
    quantityRemaining: number;
    expiryDate: string;
    daysUntilExpiry: number;
}

export interface WriteOffItem {
    batchId: string;
    productId: string;
    quantity: number;
    reason: string;
}

export interface WriteOffRow extends ExpiredBatch {
    selected: boolean;
    writeOffQuantity: number;
}

export interface ManualWriteOffRow extends ActiveBatch {
    selected: boolean;
    writeOffQuantity: number;
}
