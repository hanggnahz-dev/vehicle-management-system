import type { Role, CreateRoleData, UpdateRoleData, RoleResponse } from '../types/role.js';
export declare class RoleModel {
    static findAll(): Promise<RoleResponse[]>;
    static findById(id: number): Promise<RoleResponse | null>;
    static findByName(name: string): Promise<Role | null>;
    static create(roleData: CreateRoleData): Promise<RoleResponse>;
    static update(id: number, roleData: UpdateRoleData): Promise<RoleResponse | null>;
    static delete(id: number): Promise<boolean>;
    static getRoleUsers(roleId: number): Promise<any[]>;
}
//# sourceMappingURL=Role.d.ts.map