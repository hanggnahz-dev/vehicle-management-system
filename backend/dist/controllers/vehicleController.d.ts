import { Request, Response } from 'express';
export declare class VehicleController {
    static getVehicles(req: Request, res: Response): Promise<void>;
    static getVehicleById(req: Request, res: Response): Promise<void>;
    static createVehicle(req: Request, res: Response): Promise<void>;
    static updateVehicle(req: Request, res: Response): Promise<void>;
    static deleteVehicle(req: Request, res: Response): Promise<void>;
    static getCompanies(req: Request, res: Response): Promise<void>;
    static getLicensePlates(req: Request, res: Response): Promise<void>;
    static getExpiringVehicles(req: Request, res: Response): Promise<void>;
    static importVehicles(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=vehicleController.d.ts.map