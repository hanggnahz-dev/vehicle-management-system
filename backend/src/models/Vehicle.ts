import { getDatabase } from '../config/database.js'
import type {
  Vehicle,
  CreateVehicleData,
  UpdateVehicleData,
  VehicleResponse,
  VehicleFilter,
} from '../types/vehicle.js'

export class VehicleModel {
  // 计算车辆状态
  private static getVehicleStatus(inspectionDate: string): string {
    const today = new Date()
    const inspection = new Date(inspectionDate)
    const diffTime = inspection.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 7) {
      return 'normal'
    } else if (diffDays >= 0) {
      return 'expiring'
    } else {
      return 'expired'
    }
  }
  // 获取所有车辆
  static async findAll(filter?: VehicleFilter): Promise<VehicleResponse[]> {
    let query = `
      SELECT id, company_name, license_plate, inspection_date, created_at, updated_at 
      FROM vehicles 
      WHERE 1=1
    `
    const params: any[] = []

    if (filter) {
      if (filter.company_name) {
        query += ' AND company_name = ?'
        params.push(filter.company_name)
      }

      if (filter.license_plate) {
        query += ' AND license_plate LIKE ?'
        params.push(`%${filter.license_plate}%`)
      }
    }

    query += ' ORDER BY created_at DESC'

    const db = await getDatabase()
    const rows = (await db.all(query, params)) as Vehicle[]

    return rows.map(vehicle => ({
      id: vehicle.id,
      company_name: vehicle.company_name,
      license_plate: vehicle.license_plate,
      inspection_date: vehicle.inspection_date,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at,
    }))
  }

  // 获取车辆列表（带分页）
  static async findAllWithPagination(
    filter?: VehicleFilter,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ vehicles: VehicleResponse[]; total: number }> {
    const db = await getDatabase()

    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (filter) {
      if (filter.company_name) {
        whereClause += ' AND company_name = ?'
        params.push(filter.company_name)
      }

      if (filter.license_plate) {
        whereClause += ' AND license_plate LIKE ?'
        params.push(`%${filter.license_plate}%`)
      }

      // 状态筛选：直接在SQL中计算
      if (filter.status) {
        console.log('状态筛选条件:', filter.status)
        if (filter.status === 'normal') {
          // 正常：审证日期距离今天超过7天
          whereClause += ' AND (julianday(inspection_date) - julianday("now")) > 7'
        } else if (filter.status === 'expiring') {
          // 即将到期：审证日期距离今天0-7天
          whereClause +=
            ' AND (julianday(inspection_date) - julianday("now")) >= 0 AND (julianday(inspection_date) - julianday("now")) <= 7'
        } else if (filter.status === 'expired') {
          // 已过期：审证日期距离今天小于0天
          whereClause += ' AND (julianday(inspection_date) - julianday("now")) < 0'
        }
      }
    }

    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM vehicles ${whereClause}`
    console.log('COUNT查询SQL:', countQuery)
    console.log('COUNT查询参数:', params)
    const countResult = (await db.get(countQuery, params)) as { total: number }
    const total = countResult.total
    console.log('查询到的总数:', total)

    // 计算偏移量
    const offset = (page - 1) * pageSize

    // 获取分页数据
    const dataQuery = `
      SELECT id, company_name, license_plate, inspection_date, created_at, updated_at 
      FROM vehicles 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `
    const dataParams = [...params, pageSize, offset]
    console.log('DATA查询SQL:', dataQuery)
    console.log('DATA查询参数:', dataParams)
    const rows = (await db.all(dataQuery, dataParams)) as Vehicle[]
    console.log('查询到的车辆数据:', rows)

    const vehicles = rows.map(vehicle => ({
      id: vehicle.id,
      company_name: vehicle.company_name,
      license_plate: vehicle.license_plate,
      inspection_date: vehicle.inspection_date,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at,
    }))

    return { vehicles, total }
  }

  // 根据ID获取车辆
  static async findById(id: number): Promise<VehicleResponse | null> {
    const db = await getDatabase()
    const vehicle = (await db.get(
      'SELECT id, company_name, license_plate, inspection_date, created_at, updated_at FROM vehicles WHERE id = ?',
      [id]
    )) as Vehicle | undefined

    if (!vehicle) {
      return null
    }

    return {
      id: vehicle.id,
      company_name: vehicle.company_name,
      license_plate: vehicle.license_plate,
      inspection_date: vehicle.inspection_date,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at,
    }
  }

  // 根据车牌号获取车辆
  static async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const db = await getDatabase()
    const vehicle = (await db.get('SELECT * FROM vehicles WHERE license_plate = ?', [
      licensePlate,
    ])) as Vehicle | undefined

    return vehicle || null
  }

  // 创建车辆
  static async create(vehicleData: CreateVehicleData): Promise<VehicleResponse> {
    const { company_name, license_plate, inspection_date } = vehicleData

    const db = await getDatabase()
    const result = await db.run(
      'INSERT INTO vehicles (company_name, license_plate, inspection_date) VALUES (?, ?, ?)',
      [company_name, license_plate, inspection_date]
    )

    const newVehicle = await this.findById(result.lastID!)
    if (!newVehicle) {
      throw new Error('创建车辆失败')
    }

    return newVehicle
  }

  // 更新车辆
  static async update(id: number, vehicleData: UpdateVehicleData): Promise<VehicleResponse | null> {
    const fields: string[] = []
    const values: any[] = []

    if (vehicleData.company_name !== undefined) {
      fields.push('company_name = ?')
      values.push(vehicleData.company_name)
    }

    if (vehicleData.license_plate !== undefined) {
      fields.push('license_plate = ?')
      values.push(vehicleData.license_plate)
    }

    if (vehicleData.inspection_date !== undefined) {
      fields.push('inspection_date = ?')
      values.push(vehicleData.inspection_date)
    }

    if (fields.length === 0) {
      return await this.findById(id)
    }

    values.push(id)

    const db = await getDatabase()
    await db.run(`UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`, values)

    return await this.findById(id)
  }

  // 删除车辆
  static async delete(id: number): Promise<boolean> {
    const db = await getDatabase()
    const result = await db.run('DELETE FROM vehicles WHERE id = ?', [id])

    return result.changes! > 0
  }

  // 批量导入车辆（存在则更新，不存在则插入）
  static async batchUpsert(vehiclesData: CreateVehicleData[]): Promise<{
    created: VehicleResponse[]
    updated: VehicleResponse[]
    errors: Array<{ vehicle: CreateVehicleData; error: string }>
  }> {
    const created: VehicleResponse[] = []
    const updated: VehicleResponse[] = []
    const errors: Array<{ vehicle: CreateVehicleData; error: string }> = []

    for (const vehicleData of vehiclesData) {
      try {
        // 检查车牌号是否已存在
        const existingVehicle = await this.findByLicensePlate(vehicleData.license_plate)

        if (existingVehicle) {
          // 存在则更新
          const updatedVehicle = await this.update(existingVehicle.id, vehicleData)
          if (updatedVehicle) {
            updated.push(updatedVehicle)
          }
        } else {
          // 不存在则插入
          const newVehicle = await this.create(vehicleData)
          created.push(newVehicle)
        }
      } catch (error) {
        console.error(`导入车辆失败: ${vehicleData.license_plate}`, error)
        errors.push({
          vehicle: vehicleData,
          error: error instanceof Error ? error.message : '未知错误',
        })
      }
    }

    return { created, updated, errors }
  }

  // 批量导入车辆（旧方法，保持兼容性）
  static async batchCreate(vehiclesData: CreateVehicleData[]): Promise<VehicleResponse[]> {
    const results: VehicleResponse[] = []

    for (const vehicleData of vehiclesData) {
      try {
        const vehicle = await this.create(vehicleData)
        results.push(vehicle)
      } catch (error) {
        console.error(`导入车辆失败: ${vehicleData.license_plate}`, error)
        // 继续处理其他车辆
      }
    }

    return results
  }

  // 获取公司列表
  static async getCompanies(): Promise<string[]> {
    const db = await getDatabase()
    const rows = (await db.all(
      'SELECT DISTINCT company_name FROM vehicles ORDER BY company_name'
    )) as any[]

    return rows.map((row: any) => row.company_name)
  }

  // 获取车牌号列表
  static async getLicensePlates(query?: string, companyName?: string): Promise<string[]> {
    const db = await getDatabase()

    let sql = 'SELECT DISTINCT license_plate FROM vehicles WHERE 1=1'
    const params: any[] = []

    // 如果指定了公司名称，按公司过滤
    if (companyName) {
      sql += ' AND company_name = ?'
      params.push(companyName)
    }

    // 如果提供了查询字符串，进行模糊匹配
    if (query && query.trim()) {
      sql += ' AND license_plate LIKE ?'
      params.push(`%${query.trim()}%`)
    }

    sql += ' ORDER BY license_plate LIMIT 20' // 限制返回数量，避免过多结果

    const rows = (await db.all(sql, params)) as any[]
    return rows.map((row: any) => row.license_plate)
  }

  // 检查审证日期即将到期的车辆
  static async getExpiringVehicles(days: number = 30): Promise<VehicleResponse[]> {
    const db = await getDatabase()
    const rows = (await db.all(
      `SELECT id, company_name, license_plate, inspection_date, created_at, updated_at 
       FROM vehicles 
       WHERE inspection_date <= date('now', '+${days} days') 
       AND inspection_date >= date('now')
       ORDER BY inspection_date ASC`
    )) as Vehicle[]

    return rows.map(vehicle => ({
      id: vehicle.id,
      company_name: vehicle.company_name,
      license_plate: vehicle.license_plate,
      inspection_date: vehicle.inspection_date,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at,
    }))
  }
}
