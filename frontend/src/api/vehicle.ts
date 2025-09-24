import api from './user'
import type { Vehicle, CreateVehicleData, UpdateVehicleData, VehicleFilter } from '@/stores/vehicle'

// API响应类型
interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export const vehicleApi = {
  // 获取车辆列表
  getVehicles: (filter?: VehicleFilter, page: number = 1, pageSize: number = 20) => {
    const params = new URLSearchParams()
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())
    return api.get<ApiResponse<Vehicle[]>>(`/vehicles?${params.toString()}`)
  },

  // 根据ID获取车辆
  getVehicleById: (id: number) => api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`),

  // 创建车辆
  createVehicle: (vehicleData: CreateVehicleData) =>
    api.post<ApiResponse<Vehicle>>('/vehicles', vehicleData),

  // 更新车辆
  updateVehicle: (id: number, vehicleData: UpdateVehicleData) =>
    api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, vehicleData),

  // 删除车辆
  deleteVehicle: (id: number) => api.delete(`/vehicles/${id}`),

  // 获取公司列表
  getCompanies: () => api.get<ApiResponse<string[]>>('/vehicles/meta/companies'),

  // 获取车牌号列表
  getLicensePlates: (query?: string, companyName?: string) => {
    const params = new URLSearchParams()
    if (query) params.append('query', query)
    if (companyName) params.append('company_name', companyName)
    return api.get<ApiResponse<string[]>>(`/vehicles/meta/license-plates?${params.toString()}`)
  },

  // 获取即将到期的车辆
  getExpiringVehicles: (days: number = 7) =>
    api.get<ApiResponse<Vehicle[]>>(`/vehicles/meta/expiring?days=${days}`),

  // 批量导入车辆
  importVehicles: (vehiclesData: CreateVehicleData[]) =>
    api.post<
      ApiResponse<{
        created: Vehicle[]
        updated: Vehicle[]
        errors: Array<{ vehicle: CreateVehicleData; error: string }>
        summary: {
          total: number
          created: number
          updated: number
          errors: number
          success: number
        }
      }>
    >('/vehicles/import', vehiclesData),
}
