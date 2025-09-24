import { Request, Response } from 'express';
export declare class RoleController {
    static getRoles(req: Request, res: Response): Promise<void>;
    static getRoleById(req: Request, res: Response): Promise<void>;
    static createRole(req: Request, res: Response): Promise<void>;
    static updateRole(req: Request, res: Response): Promise<void>;
    static deleteRole(req: Request, res: Response): Promise<void>;
    static getRoleUsers(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=roleController.d.ts.map