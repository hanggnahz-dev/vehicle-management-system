import { defineStore } from 'pinia'
import { ref } from 'vue'
import { vehicleApi } from '@/api/vehicle'

export interface Vehicle {
  id: number
  company_name: string
  license_plate: string
  inspection_date: string
  created_at: string
  updated_at: string
}

export interface CreateVehicleData {
  company_name: string
  license_plate: string
  inspection_date: string
}

export interface UpdateVehicleData {
  company_name?: string
  license_plate?: string
  inspection_date?: string
}

export interface VehicleFilter {
  company_name?: string
  license_plate?: string
  status?: string
}

export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export const useVehicleStore = defineStore('vehicle', () => {
  const vehicles = ref<Vehicle[]>([])
  const companies = ref<string[]>([])
  const licensePlates = ref<string[]>([])
  const loading = ref(false)
  const pagination = ref<PaginationInfo>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchVehicles = async (filter?: VehicleFilter, page: number = 1, pageSize: number = 20) => {
    try {
      loading.value = true
      const response = await vehicleApi.getVehicles(filter, page, pageSize)
      // API返回格式: {success: true, data: [...], pagination: {...}}
      // axios response.data 包含整个API响应
      const apiResponse = response.data as any
      vehicles.value = apiResponse.data
      pagination.value = apiResponse.pagination
    } catch (error) {
      console.error('获取车辆列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchVehicleById = async (id: number) => {
    try {
      const response = await vehicleApi.getVehicleById(id)
      // API返回格式: {success: true, data: {...}}
      // axios response.data 包含整个API响应
      return (response.data as any).data
    } catch (error) {
      console.error('获取车辆详情失败:', error)
      throw error
    }
  }

  const createVehicle = async (vehicleData: CreateVehicleData) => {
    try {
      loading.value = true
      const response = await vehicleApi.createVehicle(vehicleData)
      // API返回格式: {success: true, data: {...}}
      // axios response.data 包含整个API响应
      const newVehicle = response.data.data
      vehicles.value.unshift(newVehicle)
      return newVehicle
    } catch (error) {
      console.error('创建车辆失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateVehicle = async (id: number, vehicleData: UpdateVehicleData) => {
    try {
      loading.value = true
      const response = await vehicleApi.updateVehicle(id, vehicleData)
      // API返回格式: {success: true, data: {...}}
      // axios response.data 包含整个API响应
      const updatedVehicle = response.data.data
      const index = vehicles.value.findIndex(vehicle => vehicle.id === id)
      if (index !== -1) {
        vehicles.value[index] = updatedVehicle
      }
      return updatedVehicle
    } catch (error) {
      console.error('更新车辆失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteVehicle = async (id: number) => {
    try {
      loading.value = true
      await vehicleApi.deleteVehicle(id)
      vehicles.value = vehicles.value.filter(vehicle => vehicle.id !== id)
    } catch (error) {
      console.error('删除车辆失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await vehicleApi.getCompanies()
      // API返回格式: {success: true, data: [...]}
      // axios response.data 包含整个API响应
      companies.value = (response.data as any).data
      console.log('公司列表获取成功:', (response.data as any).data)
    } catch (error) {
      console.error('获取公司列表失败:', error)
      throw error
    }
  }

  const fetchLicensePlates = async (query?: string, companyName?: string) => {
    try {
      const response = await vehicleApi.getLicensePlates(query, companyName)
      licensePlates.value = (response.data as any).data
      console.log('获取车牌号列表成功:', licensePlates.value)
    } catch (error) {
      console.error('获取车牌号列表失败:', error)
      throw error
    }
  }

  const fetchExpiringVehicles = async (days: number = 30) => {
    try {
      const response = await vehicleApi.getExpiringVehicles(days)
      // API返回格式: {success: true, data: [...]}
      // axios response.data 包含整个API响应
      return (response.data as any).data
    } catch (error) {
      console.error('获取即将到期车辆失败:', error)
      throw error
    }
  }

  const fetchAllVehicles = async () => {
    try {
      loading.value = true
      const response = await vehicleApi.getVehicles({}, 1, 10000) // 获取所有数据
      const apiResponse = response.data as any
      return {
        vehicles: apiResponse.data,
        total: apiResponse.pagination.total,
      }
    } catch (error) {
      console.error('获取所有车辆数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const importVehicles = async (vehiclesData: CreateVehicleData[]) => {
    try {
      loading.value = true
      const response = await vehicleApi.importVehicles(vehiclesData)
      // 重新加载车辆列表
      await fetchVehicles()
      // API返回格式: {success: true, data: [...]}
      // axios response.data 包含整个API响应
      return (response.data as any).data
    } catch (error) {
      console.error('导入车辆失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    vehicles,
    companies,
    licensePlates,
    loading,
    pagination,
    fetchVehicles,
    fetchVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    fetchCompanies,
    fetchLicensePlates,
    fetchExpiringVehicles,
    fetchAllVehicles,
    importVehicles,
  }
})
