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
