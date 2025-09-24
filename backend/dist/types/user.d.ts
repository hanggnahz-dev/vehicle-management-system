export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}
export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    status?: 'active' | 'inactive';
}
export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    status?: 'active' | 'inactive';
}
export interface UserResponse {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=user.d.ts.map