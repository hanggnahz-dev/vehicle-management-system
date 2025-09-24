<template>
  <div class="home">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用慧安行车辆管理系统</span>
        </div>
      </template>
      <div class="welcome-content">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-statistic title="公司数量" :value="companyCount" />
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-statistic title="车辆总数" :value="vehicleCount" />
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <el-statistic title="正常车辆" :value="normalCount" value-style="color: #67c23a" />
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <el-statistic title="即将到期" :value="expiringCount" value-style="color: #e6a23c" />
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <el-statistic title="已过期" :value="expiredCount" value-style="color: #f56c6c" />
          </el-col>
        </el-row>
        <el-divider />
        <el-button type="primary" @click="fetchData">刷新数据</el-button>
      </div>
    </el-card>

    <el-card class="data-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>各公司车辆统计</span>
        </div>
      </template>
      <el-table :data="companyVehicleData" style="width: 100%" v-loading="loading">
        <el-table-column prop="company_name" label="公司名称" min-width="200" />
        <el-table-column prop="vehicle_count" label="车辆数量" min-width="120">
          <template #default="scope">
            <el-tag type="primary">{{ scope.row.vehicle_count }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="normal_count" label="正常" min-width="100">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.normal_count > 0">{{
              scope.row.normal_count
            }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="expiring_count" label="即将到期" min-width="120">
          <template #default="scope">
            <el-tag type="warning" v-if="scope.row.expiring_count > 0">{{
              scope.row.expiring_count
            }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="expired_count" label="已过期" min-width="100">
          <template #default="scope">
            <el-tag type="danger" v-if="scope.row.expired_count > 0">{{
              scope.row.expired_count
            }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useVehicleStore } from '@/stores/vehicle'

const vehicleStore = useVehicleStore()

const companyCount = ref(0)
const vehicleCount = ref(0)
const normalCount = ref(0)
const expiringCount = ref(0)
const expiredCount = ref(0)
const loading = ref(false)
const companyVehicleData = ref<
  Array<{
    company_name: string
    vehicle_count: number
    normal_count: number
    expiring_count: number
    expired_count: number
  }>
>([])

// 计算车辆状态
const getVehicleStatus = (inspectionDate: string) => {
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

// 统计各公司车辆数量
const calculateCompanyStats = (vehicles: any[]) => {
  const companyStats: {
    [key: string]: {
      vehicle_count: number
      normal_count: number
      expiring_count: number
      expired_count: number
    }
  } = {}

  vehicles.forEach(vehicle => {
    const company = vehicle.company_name
    if (!companyStats[company]) {
      companyStats[company] = {
        vehicle_count: 0,
        normal_count: 0,
        expiring_count: 0,
        expired_count: 0,
      }
    }

    companyStats[company].vehicle_count++
    const status = getVehicleStatus(vehicle.inspection_date)
    if (status === 'normal') {
      companyStats[company].normal_count++
    } else if (status === 'expiring') {
      companyStats[company].expiring_count++
    } else {
      companyStats[company].expired_count++
    }
  })

  return Object.entries(companyStats).map(([company_name, stats]) => ({
    company_name,
    ...stats,
  }))
}

const fetchData = async () => {
  try {
    loading.value = true

    // 获取所有车辆数据用于统计
    const allVehiclesData = await vehicleStore.fetchAllVehicles()
    vehicleCount.value = allVehiclesData.total

    // 获取公司数据
    await vehicleStore.fetchCompanies()
    companyCount.value = vehicleStore.companies.length

    // 计算各公司车辆统计
    companyVehicleData.value = calculateCompanyStats(allVehiclesData.vehicles)

    // 计算车辆状态统计
    let normal = 0
    let expiring = 0
    let expired = 0

    allVehiclesData.vehicles.forEach((vehicle: any) => {
      const status = getVehicleStatus(vehicle.inspection_date)
      if (status === 'normal') {
        normal++
      } else if (status === 'expiring') {
        expiring++
      } else {
        expired++
      }
    })

    normalCount.value = normal
    expiringCount.value = expiring
    expiredCount.value = expired

    ElMessage.success('数据获取成功')
  } catch (error) {
    ElMessage.error('数据获取失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.welcome-card,
.data-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-card,
  .data-card {
    max-width: 100%;
    margin: 0;
  }

  .welcome-content {
    padding: 10px;
  }

  .welcome-content .el-row {
    margin: 0 -10px;
  }

  .welcome-content .el-col {
    padding: 0 10px;
    margin-bottom: 20px;
  }

  .data-card {
    margin-top: 10px !important;
  }
}

@media (max-width: 480px) {
  .welcome-content {
    padding: 5px;
  }

  .welcome-content .el-row {
    margin: 0 -5px;
  }

  .welcome-content .el-col {
    padding: 0 5px;
    margin-bottom: 15px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
