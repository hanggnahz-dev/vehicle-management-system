import type { Vehicle, CreateVehicleData, UpdateVehicleData, VehicleResponse, VehicleFilter } from '../types/vehicle.js';
export declare class VehicleModel {
    static findAll(filter?: VehicleFilter): Promise<VehicleResponse[]>;
    static findById(id: number): Promise<VehicleResponse | null>;
    static findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
    static create(vehicleData: CreateVehicleData): Promise<VehicleResponse>;
    static update(id: number, vehicleData: UpdateVehicleData): Promise<VehicleResponse | null>;
    static delete(id: number): Promise<boolean>;
    static batchCreate(vehiclesData: CreateVehicleData[]): Promise<VehicleResponse[]>;
    static getCompanies(): Promise<string[]>;
    static getLicensePlates(): Promise<string[]>;
    static getExpiringVehicles(days?: number): Promise<VehicleResponse[]>;
}
//# sourceMappingURL=Vehicle.d.ts.map