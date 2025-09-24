import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// 获取车辆列表
router.get('/', authenticateToken, VehicleController.getVehicles);
// 根据ID获取车辆
router.get('/:id', authenticateToken, VehicleController.getVehicleById);
// 创建车辆
router.post('/', authenticateToken, VehicleController.createVehicle);
// 更新车辆
router.put('/:id', authenticateToken, VehicleController.updateVehicle);
// 删除车辆
router.delete('/:id', authenticateToken, VehicleController.deleteVehicle);
// 获取公司列表
router.get('/meta/companies', authenticateToken, VehicleController.getCompanies);
// 获取车牌号列表
router.get('/meta/license-plates', authenticateToken, VehicleController.getLicensePlates);
// 获取即将到期的车辆
router.get('/meta/expiring', authenticateToken, VehicleController.getExpiringVehicles);
// 批量导入车辆
router.post('/import', authenticateToken, VehicleController.importVehicles);
export default router;
//# sourceMappingURL=vehicleRoutes.js.map