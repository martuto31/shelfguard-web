export interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    unit: string;
    minStockThreshold: number;
}

export interface CreateProductBody {
    name: string;
    sku: string;
    category?: string;
    unit?: string;
    minStockThreshold?: number;
}
