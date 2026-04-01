export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
    id: string;
    batchId: { id: string; batchNumber: string } | string;
    productId: { id: string; name: string; sku: string } | string;
    type: MovementType;
    quantity: number;
    reason: string;
    performedBy: { id: string; name: string } | string;
    createdAt: string;
}
