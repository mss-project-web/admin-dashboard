export type UserRole = 'admin' | 'superadmin' | 'user';

export type Department = string;

export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    lastLoginAt: string | null;
    deletedAt: string | null;
    mustChangePassword?: boolean;
    role: UserRole;
    departments?: Department[];
    createdAt: string;
    updatedAt: string;
}

export interface UserResponse {
    status: string;
    data: User[];
}
