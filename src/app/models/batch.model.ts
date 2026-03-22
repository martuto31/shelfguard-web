import { Product } from './product.model';
import { Supplier } from './supplier.model';

export interface Batch {
    id: string;
    productId: string | Product;
    batchNumber: string;
    quantityReceived: number;
    quantityRemaining: number;
    expiryDate: string;
    receivedAt: string;
    supplierId: string | Supplier;
    notes: string;
}

export interface CreateBatchBody {
    productId: string;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
    supplierId?: string;
    notes?: string;
}

export interface PickSuggestion {
    batchId: string;
    batchNumber: string;
    expiryDate: string;
    quantityToPick: number;
    quantityRemainingAfter: number;
    daysUntilExpiry: number;
}

export interface PickResult {
    suggestions: PickSuggestion[];
    totalQuantity: number;
    expiredCount: number;
}
