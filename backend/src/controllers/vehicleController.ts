import { Request, Response } from 'express'
import { VehicleModel } from '../models/Vehicle.js'
import type { CreateVehicleData, UpdateVehicleData, VehicleFilter } from '../types/vehicle.js'
import { validateVehicleData, validateUpdateVehicleData } from '../utils/validation.js'

export class VehicleController {
  // 获取车辆列表
  static async getVehicles(req: Request, res: Response): Promise<void> {
    try {
      const filter: VehicleFilter = {
        company_name: req.query.company_name as string,
        license_plate: req.query.license_plate as string,
        status: req.query.status as string,
      }

      console.log('控制器接收到的查询参数:', req.query)
      console.log('初始filter:', filter)
      console.log('status参数类型:', typeof filter.status)
      console.log('status参数值:', filter.status)

      // 分页参数
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 20

      // 移除空值
      Object.keys(filter).forEach(key => {
        const value = filter[key as keyof VehicleFilter]
        console.log(`处理参数 ${key}:`, value, '类型:', typeof value)
        if (
          value === undefined ||
          value === ''
        ) {
          console.log(`删除空参数: ${key}`)
          delete filter[key as keyof VehicleFilter]
        }
      })

      console.log('处理后的filter:', filter)
      console.log('最终filter对象键:', Object.keys(filter))

      const result = await VehicleModel.findAllWithPagination(filter, page, pageSize)
      res.json({
        success: true,
        data: result.vehicles,
        pagination: {
          page,
          pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / pageSize),
        },
        message: '获取车辆列表成功',
      })
    } catch (error) {
      console.error('获取车辆列表失败:', error)
      res.status(500).json({
        success: false,
        message: '获取车辆列表失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 根据ID获取车辆
  static async getVehicleById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: '无效的车辆ID',
        })
        return
      }

      const vehicle = await VehicleModel.findById(id)

      if (!vehicle) {
        res.status(404).json({
          success: false,
          message: '车辆不存在',
        })
        return
      }

      res.json({
        success: true,
        data: vehicle,
        message: '获取车辆信息成功',
      })
    } catch (error) {
      console.error('获取车辆信息失败:', error)
      res.status(500).json({
        success: false,
        message: '获取车辆信息失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 创建车辆
  static async createVehicle(req: Request, res: Response): Promise<void> {
    try {
      const vehicleData: CreateVehicleData = req.body

      // 验证数据
      const { error } = validateVehicleData(vehicleData)
      if (error) {
        res.status(400).json({
          success: false,
          message: '数据验证失败',
          error: error.details[0].message,
        })
        return
      }

      // 检查车牌号是否已存在
      const existingVehicle = await VehicleModel.findByLicensePlate(vehicleData.license_plate)
      if (existingVehicle) {
        res.status(409).json({
          success: false,
          message: '车牌号已存在',
        })
        return
      }

      const newVehicle = await VehicleModel.create(vehicleData)

      res.status(201).json({
        success: true,
        data: newVehicle,
        message: '车辆创建成功',
      })
    } catch (error) {
      console.error('创建车辆失败:', error)
      res.status(500).json({
        success: false,
        message: '创建车辆失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 更新车辆
  static async updateVehicle(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id)
      const vehicleData: UpdateVehicleData = req.body

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: '无效的车辆ID',
        })
        return
      }

      // 验证数据
      const { error } = validateUpdateVehicleData(vehicleData)
      if (error) {
        res.status(400).json({
          success: false,
          message: '数据验证失败',
          error: error.details[0].message,
        })
        return
      }

      // 检查车辆是否存在
      const existingVehicle = await VehicleModel.findById(id)
      if (!existingVehicle) {
        res.status(404).json({
          success: false,
          message: '车辆不存在',
        })
        return
      }

      // 如果更新车牌号，检查新车牌号是否已存在
      if (
        vehicleData.license_plate &&
        vehicleData.license_plate !== existingVehicle.license_plate
      ) {
        const licenseExists = await VehicleModel.findByLicensePlate(vehicleData.license_plate)
        if (licenseExists) {
          res.status(409).json({
            success: false,
            message: '车牌号已存在',
          })
          return
        }
      }

      const updatedVehicle = await VehicleModel.update(id, vehicleData)

      res.json({
        success: true,
        data: updatedVehicle,
        message: '车辆更新成功',
      })
    } catch (error) {
      console.error('更新车辆失败:', error)
      res.status(500).json({
        success: false,
        message: '更新车辆失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 删除车辆
  static async deleteVehicle(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: '无效的车辆ID',
        })
        return
      }

      // 检查车辆是否存在
      const existingVehicle = await VehicleModel.findById(id)
      if (!existingVehicle) {
        res.status(404).json({
          success: false,
          message: '车辆不存在',
        })
        return
      }

      const deleted = await VehicleModel.delete(id)

      if (!deleted) {
        res.status(500).json({
          success: false,
          message: '删除车辆失败',
        })
        return
      }

      res.json({
        success: true,
        message: '车辆删除成功',
      })
    } catch (error) {
      console.error('删除车辆失败:', error)
      res.status(500).json({
        success: false,
        message: '删除车辆失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 获取公司列表
  static async getCompanies(req: Request, res: Response): Promise<void> {
    try {
      const companies = await VehicleModel.getCompanies()
      res.json({
        success: true,
        data: companies,
        message: '获取公司列表成功',
      })
    } catch (error) {
      console.error('获取公司列表失败:', error)
      res.status(500).json({
        success: false,
        message: '获取公司列表失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 获取车牌号列表
  static async getLicensePlates(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.query as string
      const companyName = req.query.company_name as string

      const licensePlates = await VehicleModel.getLicensePlates(query, companyName)
      res.json({
        success: true,
        data: licensePlates,
        message: '获取车牌号列表成功',
      })
    } catch (error) {
      console.error('获取车牌号列表失败:', error)
      res.status(500).json({
        success: false,
        message: '获取车牌号列表失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 获取即将到期的车辆
  static async getExpiringVehicles(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30
      const vehicles = await VehicleModel.getExpiringVehicles(days)
      res.json({
        success: true,
        data: vehicles,
        message: `获取${days}天内即将到期的车辆成功`,
      })
    } catch (error) {
      console.error('获取即将到期车辆失败:', error)
      res.status(500).json({
        success: false,
        message: '获取即将到期车辆失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 批量导入车辆（存在则更新，不存在则插入）
  static async importVehicles(req: Request, res: Response): Promise<void> {
    try {
      const vehiclesData: CreateVehicleData[] = req.body

      if (!Array.isArray(vehiclesData) || vehiclesData.length === 0) {
        res.status(400).json({
          success: false,
          message: '导入数据格式错误',
        })
        return
      }

      // 验证每个车辆数据
      for (const vehicleData of vehiclesData) {
        const { error } = validateVehicleData(vehicleData)
        if (error) {
          res.status(400).json({
            success: false,
            message: `车辆数据验证失败: ${vehicleData.license_plate}`,
            error: error.details[0].message,
          })
          return
        }
      }

      const results = await VehicleModel.batchUpsert(vehiclesData)
      const totalProcessed = results.created.length + results.updated.length

      res.json({
        success: true,
        data: {
          created: results.created,
          updated: results.updated,
          errors: results.errors,
          summary: {
            total: vehiclesData.length,
            created: results.created.length,
            updated: results.updated.length,
            errors: results.errors.length,
            success: totalProcessed,
          },
        },
        message: `导入完成：新增${results.created.length}条，更新${results.updated.length}条，失败${results.errors.length}条`,
      })
    } catch (error) {
      console.error('批量导入车辆失败:', error)
      res.status(500).json({
        success: false,
        message: '批量导入车辆失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }
}
