export type UserRole = 'admin' | 'superadmin' | 'user';

export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    lastLoginAt: string | null;
    deletedAt: string | null;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface UserResponse {
    status: string;
    data: User[];
}
