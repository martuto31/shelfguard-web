export enum Role {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
    WORKER = 'WORKER',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    organizationId: string;
    active: boolean;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface RegisterBody {
    name: string;
    email: string;
    password: string;
    organizationName: string;
}

export interface CreateUserBody {
    name: string;
    email: string;
    password: string;
    role: Role;
}

export interface UpdateUserBody {
    name?: string;
    role?: Role;
    active?: boolean;
}
