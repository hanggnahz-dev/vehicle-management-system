import { getDatabase } from '../config/database.js';
export class VehicleModel {
    // 获取所有车辆
    static async findAll(filter) {
        let query = `
      SELECT id, company_name, license_plate, inspection_date, created_at, updated_at 
      FROM vehicles 
      WHERE 1=1
    `;
        const params = [];
        if (filter) {
            if (filter.company_name) {
                query += ' AND company_name LIKE ?';
                params.push(`%${filter.company_name}%`);
            }
            if (filter.license_plate) {
                query += ' AND license_plate LIKE ?';
                params.push(`%${filter.license_plate}%`);
            }
        }
        query += ' ORDER BY created_at DESC';
        const db = await getDatabase();
        const rows = await db.all(query, params);
        return rows.map(vehicle => ({
            id: vehicle.id,
            company_name: vehicle.company_name,
            license_plate: vehicle.license_plate,
            inspection_date: vehicle.inspection_date,
            created_at: vehicle.created_at,
            updated_at: vehicle.updated_at,
        }));
    }
    // 根据ID获取车辆
    static async findById(id) {
        const db = await getDatabase();
        const vehicle = await db.get('SELECT id, company_name, license_plate, inspection_date, created_at, updated_at FROM vehicles WHERE id = ?', [id]);
        if (!vehicle) {
            return null;
        }
        return {
            id: vehicle.id,
            company_name: vehicle.company_name,
            license_plate: vehicle.license_plate,
            inspection_date: vehicle.inspection_date,
            created_at: vehicle.created_at,
            updated_at: vehicle.updated_at,
        };
    }
    // 根据车牌号获取车辆
    static async findByLicensePlate(licensePlate) {
        const db = await getDatabase();
        const vehicle = await db.get('SELECT * FROM vehicles WHERE license_plate = ?', [
            licensePlate,
        ]);
        return vehicle || null;
    }
    // 创建车辆
    static async create(vehicleData) {
        const { company_name, license_plate, inspection_date } = vehicleData;
        const db = await getDatabase();
        const result = await db.run('INSERT INTO vehicles (company_name, license_plate, inspection_date) VALUES (?, ?, ?)', [company_name, license_plate, inspection_date]);
        const newVehicle = await this.findById(result.lastID);
        if (!newVehicle) {
            throw new Error('创建车辆失败');
        }
        return newVehicle;
    }
    // 更新车辆
    static async update(id, vehicleData) {
        const fields = [];
        const values = [];
        if (vehicleData.company_name !== undefined) {
            fields.push('company_name = ?');
            values.push(vehicleData.company_name);
        }
        if (vehicleData.license_plate !== undefined) {
            fields.push('license_plate = ?');
            values.push(vehicleData.license_plate);
        }
        if (vehicleData.inspection_date !== undefined) {
            fields.push('inspection_date = ?');
            values.push(vehicleData.inspection_date);
        }
        if (fields.length === 0) {
            return await this.findById(id);
        }
        values.push(id);
        const db = await getDatabase();
        await db.run(`UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`, values);
        return await this.findById(id);
    }
    // 删除车辆
    static async delete(id) {
        const db = await getDatabase();
        const result = await db.run('DELETE FROM vehicles WHERE id = ?', [id]);
        return result.changes > 0;
    }
    // 批量导入车辆
    static async batchCreate(vehiclesData) {
        const results = [];
        for (const vehicleData of vehiclesData) {
            try {
                const vehicle = await this.create(vehicleData);
                results.push(vehicle);
            }
            catch (error) {
                console.error(`导入车辆失败: ${vehicleData.license_plate}`, error);
                // 继续处理其他车辆
            }
        }
        return results;
    }
    // 获取公司列表
    static async getCompanies() {
        const db = await getDatabase();
        const rows = await db.all('SELECT DISTINCT company_name FROM vehicles ORDER BY company_name');
        return rows.map((row) => row.company_name);
    }
    // 获取车牌号列表
    static async getLicensePlates() {
        const db = await getDatabase();
        const rows = await db.all('SELECT DISTINCT license_plate FROM vehicles ORDER BY license_plate');
        return rows.map((row) => row.license_plate);
    }
    // 检查审证日期即将到期的车辆
    static async getExpiringVehicles(days = 30) {
        const db = await getDatabase();
        const rows = await db.all(`SELECT id, company_name, license_plate, inspection_date, created_at, updated_at 
       FROM vehicles 
       WHERE inspection_date <= date('now', '+${days} days') 
       AND inspection_date >= date('now')
       ORDER BY inspection_date ASC`);
        return rows.map(vehicle => ({
            id: vehicle.id,
            company_name: vehicle.company_name,
            license_plate: vehicle.license_plate,
            inspection_date: vehicle.inspection_date,
            created_at: vehicle.created_at,
            updated_at: vehicle.updated_at,
        }));
    }
}
//# sourceMappingURL=Vehicle.js.map