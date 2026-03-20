export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
}

export interface CreateSupplierBody {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
}
