import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController.js';
const router = Router();
// 获取车辆列表
router.get('/', VehicleController.getVehicles);
// 根据ID获取车辆
router.get('/:id', VehicleController.getVehicleById);
// 创建车辆
router.post('/', VehicleController.createVehicle);
// 更新车辆
router.put('/:id', VehicleController.updateVehicle);
// 删除车辆
router.delete('/:id', VehicleController.deleteVehicle);
// 获取公司列表
router.get('/meta/companies', VehicleController.getCompanies);
// 获取车牌号列表
router.get('/meta/license-plates', VehicleController.getLicensePlates);
// 获取即将到期的车辆
router.get('/meta/expiring', VehicleController.getExpiringVehicles);
// 批量导入车辆
router.post('/import', VehicleController.importVehicles);
export default router;
//# sourceMappingURL=vehicleRoutes.js.map