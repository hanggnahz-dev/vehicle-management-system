import type { User, CreateUserData, UpdateUserData, UserResponse } from '../types/user.js';
export declare class UserModel {
    static findAll(): Promise<UserResponse[]>;
    static findById(id: number): Promise<UserResponse | null>;
    static findByEmail(email: string): Promise<User | null>;
    static create(userData: CreateUserData): Promise<UserResponse>;
    static update(id: number, userData: UpdateUserData): Promise<UserResponse | null>;
    static delete(id: number): Promise<boolean>;
    static validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
//# sourceMappingURL=User.d.ts.map