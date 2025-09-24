<template>
  <div class="vehicle-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="page-title">车辆管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              添加车辆
            </el-button>
            <el-button type="success" @click="showImportDialog = true">
              <el-icon><Upload /></el-icon>
              导入数据
            </el-button>
          </div>
        </div>
      </template>
      <!-- 搜索筛选区域 -->
      <el-form :model="searchForm" :inline="!isMobile" class="search-form">
        <el-form-item label="公司名称">
          <el-autocomplete
            v-model="searchForm.company_name"
            :fetch-suggestions="queryCompanySuggestions"
            placeholder="请输入或选择公司名称"
            clearable
            :style="isMobile ? 'width: 100%' : 'width: 200px'"
            @select="handleCompanySelect"
            @clear="handleCompanyClear"
            @input="handleCompanyInput"
          />
        </el-form-item>
        <el-form-item label="车牌号码">
          <el-input
            v-model="searchForm.license_plate"
            placeholder="请输入车牌号码进行查询"
            clearable
            :style="isMobile ? 'width: 100%' : 'width: 200px'"
            @input="handleLicensePlateInput"
            @clear="handleLicensePlateClear"
          />
        </el-form-item>
        <el-form-item label="车辆状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            :style="isMobile ? 'width: 100%' : 'width: 120px'" @change="handleStatusChange"
          >
            <el-option label="正常" value="normal" />
            <el-option label="即将到期" value="expiring" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons-item">
          <div class="search-buttons">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <!-- 车辆列表 -->
      <el-table
        :data="vehicles"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="company_name" label="公司名称" min-width="150" sortable="custom" />
        <el-table-column prop="license_plate" label="车牌号码" min-width="120" sortable="custom" />
        <el-table-column prop="inspection_date" label="审证日期" min-width="120" sortable="custom">
          <template #default="scope">
            {{ formatDate(scope.row.inspection_date) }}
          </template>
        </el-table-column>
        <el-table-column label="车辆状态" min-width="120" sortable="custom" prop="status">
          <template #default="scope">
            <el-tag :type="getVehicleStatus(scope.row.inspection_date).type">
              {{ getVehicleStatus(scope.row.inspection_date).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)"> 编辑 </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 添加/编辑车辆对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingVehicle ? '编辑车辆' : '添加车辆'"
      :width="isMobile ? '95%' : '500px'"
      :fullscreen="isMobile"
    >
      <el-form :model="vehicleForm" :rules="vehicleRules" ref="vehicleFormRef" label-width="100px">
        <el-form-item label="公司名称" prop="company_name">
          <el-autocomplete
            v-model="vehicleForm.company_name"
            :fetch-suggestions="queryCompanySuggestions"
            placeholder="请输入或选择公司名称"
            clearable
            style="width: 100%"
            @select="handleCompanySelect"
            @clear="handleCompanyClear"
            @input="handleCompanyInput"
          />
        </el-form-item>
        <el-form-item label="车牌号码" prop="license_plate">
          <el-input
            v-model="vehicleForm.license_plate"
            placeholder="请输入车牌号码"
            :disabled="editingVehicle"
          />
        </el-form-item>
        <el-form-item label="审证日期" prop="inspection_date">
          <el-date-picker
            v-model="vehicleForm.inspection_date"
            type="date"
            placeholder="请选择审证日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :shortcuts="dateShortcuts"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingVehicle ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
    <!-- 导入数据对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入车辆数据"
      :width="isMobile ? '95%' : '600px'"
      :fullscreen="isMobile"
    >
      <div class="import-container">
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          accept=".xlsx,.xls,.csv"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 .xlsx、.xls、.csv 格式文件</div>
          </template>
        </el-upload>
        <div class="import-tips">
          <h4>导入说明：</h4>
          <ul>
            <li>文件格式：Excel (.xlsx, .xls) 或 CSV</li>
            <li>必需字段：公司名称、车牌号码、审证日期</li>
            <li>审证日期格式：YYYY-MM-DD</li>
            <li><strong>导入规则：</strong></li>
            <li style="margin-left: 20px">• 如果车牌号码已存在，将更新该车辆信息</li>
            <li style="margin-left: 20px">• 如果车牌号码不存在，将新增该车辆</li>
            <li style="margin-left: 20px">• 支持批量导入，自动处理重复数据</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="importing"> 导入 </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Search, Refresh, UploadFilled } from '@element-plus/icons-vue'
import { useVehicleStore } from '@/stores/vehicle'
import type { Vehicle, CreateVehicleData, VehicleFilter } from '@/stores/vehicle'
import { parseFile } from '@/utils/fileParser'
const vehicleStore = useVehicleStore()
// 响应式检测
const isMobile = ref(false)
// 检测屏幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}
// 日期快捷选择配置
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      return today
    },
  },
  {
    text: '明天',
    value: () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    },
  },
  {
    text: '一周后',
    value: () => {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      return nextWeek
    },
  },
  {
    text: '一个月后',
    value: () => {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return nextMonth
    },
  },
  {
    text: '三个月后',
    value: () => {
      const nextQuarter = new Date()
      nextQuarter.setMonth(nextQuarter.getMonth() + 3)
      return nextQuarter
    },
  },
  {
    text: '一年后',
    value: () => {
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      return nextYear
    },
  },
]
// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const importing = ref(false)
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const editingVehicle = ref<Vehicle | null>(null)
const selectedVehicles = ref<Vehicle[]>([])
// 文件导入相关
const selectedFile = ref<File | null>(null)
const uploadRef = ref()
// 分页数据
const currentPage = ref(1)
const pageSize = ref(20)
const total = computed(() => vehicleStore.pagination.total)
// 排序数据
const sortField = ref<string>('')
const sortOrder = ref<'ascending' | 'descending' | null>(null)
// 搜索表单
const searchForm = reactive<VehicleFilter & { status?: string }>({
  company_name: '',
  license_plate: '',
  status: undefined,
})
// 车辆表单
const vehicleForm = reactive<CreateVehicleData>({
  company_name: '',
  license_plate: '',
  inspection_date: '',
})
// 表单验证规则
const vehicleRules = {
  company_name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' },
    { min: 2, max: 100, message: '公司名称长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  license_plate: [
    { required: true, message: '请输入车牌号码', trigger: 'blur' },
    { min: 5, max: 20, message: '车牌号码长度在 5 到 20 个字符', trigger: 'blur' },
  ],
  inspection_date: [{ required: true, message: '请选择审证日期', trigger: 'change' }],
}
// 计算属性
const vehicles = computed(() => vehicleStore.vehicles)
const companies = computed(() => {
  console.log('计算属性 companies 被调用，当前值:', vehicleStore.companies)
  return vehicleStore.companies
})
// 方法
const loadVehicles = async () => {
  try {
    loading.value = true
    const filter: VehicleFilter = {
      company_name: searchForm.company_name,
      status: searchForm.status,
      license_plate: searchForm.license_plate,
    }
    console.log('前端发送的筛选条件:', filter)
    await vehicleStore.fetchVehicles(filter, currentPage.value, pageSize.value)
    console.log('后端返回的车辆数据:', vehicleStore.vehicles)
    // 状态筛选现在由后端处理，前端只需要处理排序
    let sortedVehicles = [...vehicleStore.vehicles]
    if (sortField.value && sortOrder.value) {
      sortedVehicles = sortVehicles(sortedVehicles, sortField.value, sortOrder.value)
      vehicleStore.vehicles = sortedVehicles
    }
  } catch (error) {
    ElMessage.error('加载车辆列表失败')
  } finally {
    loading.value = false
  }
}
const loadMetaData = async () => {
  try {
    // 初始化时只加载公司列表
    await vehicleStore.fetchCompanies()
    console.log('元数据加载成功:', {
      companies: vehicleStore.companies,
    })
  } catch (error) {
    console.error('加载元数据失败:', error)
    ElMessage.error('加载元数据失败')
  }
}
// 公司名称自动完成相关方法
const queryCompanySuggestions = (queryString: string, callback: (suggestions: any[]) => void) => {
  // 如果没有查询字符串，显示所有公司
  if (!queryString || queryString.trim() === '') {
    const suggestions = companies.value.map(company => ({ value: company }))
    callback(suggestions)
    return
  }
  // 有查询字符串时，进行模糊匹配
  const suggestions = companies.value
    .filter(company => company.toLowerCase().includes(queryString.toLowerCase()))
    .map(company => ({ value: company }))
  callback(suggestions)
}
const handleCompanySelect = async (item: any) => {
  console.log('公司选择:', item.value)
  await handleCompanyChange(item.value)
}
const handleCompanyClear = async () => {
  console.log('清空公司选择')
  await handleCompanyChange('')
}
const handleCompanyInput = (value: string) => {
  console.log('公司输入:', value)
  // 当用户手动输入时，进行实时搜索（但不包括从下拉选择的情况）
  // 注意：这里不调用loadVehicles()，因为选择时会通过@select事件处理
  // 只有用户手动输入时才需要实时搜索
}
const handleCompanyFocus = () => {
  console.log('公司名称获得焦点，显示所有公司列表')
  // 当获得焦点时，触发查询以显示所有公司
  // 这里不需要特殊处理，因为queryCompanySuggestions已经支持空字符串显示所有公司
}
// 车牌号输入相关方法
const handleLicensePlateClear = () => {
  console.log('清空车牌号码选择')
  currentPage.value = 1
  loadVehicles()
}
const handleLicensePlateInput = (value: string) => {
  console.log('车牌号码输入:', value)
  // 当用户输入时，直接进行搜索
  currentPage.value = 1
  loadVehicles()
}
const handleCompanyChange = async (companyName: string) => {
  console.log('公司选择改变:', companyName)
  // 更新搜索表单中的公司名称
  searchForm.company_name = companyName
  console.log('更新后的搜索表单:', searchForm)
  // 当选择公司时，重新加载车辆列表
  currentPage.value = 1
  loadVehicles()
}
const handleSearch = () => {
  currentPage.value = 1
  loadVehicles()
}
const handleStatusChange = (status: string) => {
  console.log('车辆状态改变:', status)
  // 当状态改变时，重新加载车辆列表
  currentPage.value = 1
  loadVehicles()
}
const handleReset = async () => {
  Object.assign(searchForm, {
    company_name: '',
    license_plate: '',
    status: undefined,
  })
  currentPage.value = 1
  // 重置排序状态
  sortField.value = ''
  sortOrder.value = null
  // 重新加载车辆列表
  loadVehicles()
}
const handleEdit = (vehicle: Vehicle) => {
  editingVehicle.value = vehicle
  Object.assign(vehicleForm, {
    company_name: vehicle.company_name,
    license_plate: vehicle.license_plate,
    inspection_date: vehicle.inspection_date,
  })
  showAddDialog.value = true
}
const handleDelete = async (vehicle: Vehicle) => {
  try {
    await ElMessageBox.confirm(`确定要删除车辆 "${vehicle.license_plate}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await vehicleStore.deleteVehicle(vehicle.id)
    ElMessage.success('删除成功')
    loadVehicles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
const handleSubmit = async () => {
  try {
    submitting.value = true
    if (editingVehicle.value) {
      await vehicleStore.updateVehicle(editingVehicle.value.id, vehicleForm)
      ElMessage.success('更新成功')
    } else {
      await vehicleStore.createVehicle(vehicleForm)
      ElMessage.success('添加成功')
    }
    showAddDialog.value = false
    resetForm()
    loadVehicles()
  } catch (error) {
    ElMessage.error(editingVehicle.value ? '更新失败' : '添加失败')
  } finally {
    submitting.value = false
  }
}
const resetForm = () => {
  editingVehicle.value = null
  Object.assign(vehicleForm, {
    company_name: '',
    license_plate: '',
    inspection_date: '',
    status: 'active',
  })
}
const handleSelectionChange = (selection: Vehicle[]) => {
  selectedVehicles.value = selection
}
const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadVehicles()
}
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadVehicles()
}
// 排序处理
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  sortField.value = prop || ''
  sortOrder.value = order as 'ascending' | 'descending' | null
  currentPage.value = 1 // 排序时重置到第一页
  loadVehicles()
}
// 车辆排序函数
const sortVehicles = (vehicles: Vehicle[], field: string, order: 'ascending' | 'descending') => {
  return [...vehicles].sort((a, b) => {
    let aValue: any
    let bValue: any
    switch (field) {
      case 'id':
        aValue = a.id
        bValue = b.id
        break
      case 'company_name':
        aValue = a.company_name
        bValue = b.company_name
        break
      case 'license_plate':
        aValue = a.license_plate
        bValue = b.license_plate
        break
      case 'inspection_date':
        aValue = new Date(a.inspection_date)
        bValue = new Date(b.inspection_date)
        break
      case 'status':
        // 状态排序：基于审证日期计算状态优先级
        const aStatus = getVehicleStatus(a.inspection_date)
        const bStatus = getVehicleStatus(b.inspection_date)
        // 状态优先级：正常(0) > 即将到期(1) > 已过期(2)
        const statusOrder = { 正常: 0, 即将到期: 1, 已过期: 2 }
        aValue = statusOrder[aStatus.text as keyof typeof statusOrder]
        bValue = statusOrder[bStatus.text as keyof typeof statusOrder]
        break
      default:
        return 0
    }
    if (aValue < bValue) {
      return order === 'ascending' ? -1 : 1
    }
    if (aValue > bValue) {
      return order === 'ascending' ? 1 : -1
    }
    return 0
  })
}
const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
  console.log('文件选择:', file.raw)
}
const beforeUpload = (file: File) => {
  const isExcel =
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'
  const isCSV = file.type === 'text/csv'
  if (!isExcel && !isCSV) {
    ElMessage.error('只能上传 Excel 或 CSV 文件!')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}
const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }
  try {
    importing.value = true
    // 解析文件
    const parseResult = await parseFile(selectedFile.value)
    if (parseResult.errors.length > 0) {
      ElMessage.error(`文件解析失败：${parseResult.errors.join('; ')}`)
      return
    }
    if (parseResult.data.length === 0) {
      ElMessage.warning('文件中没有有效数据')
      return
    }
    // 显示确认对话框
    const confirmResult = await ElMessageBox.confirm(
      `文件解析成功，共找到 ${parseResult.data.length} 条数据。\n\n导入规则：\n• 如果车牌号码已存在，将更新该车辆信息\n• 如果车牌号码不存在，将新增该车辆\n\n是否继续导入？`,
      '确认导入',
      {
        confirmButtonText: '确认导入',
        cancelButtonText: '取消',
        type: 'info',
      }
    )
    if (confirmResult !== 'confirm') {
      return
    }
    // 调用导入API
    const result = await vehicleStore.importVehicles(parseResult.data)
    // 显示导入结果
    const { summary } = result
    let message = `导入完成！\n`
    message += `总计：${summary.total} 条\n`
    message += `新增：${summary.created} 条\n`
    message += `更新：${summary.updated} 条\n`
    message += `失败：${summary.errors} 条`
    if (summary.errors > 0) {
      ElMessage.warning(message)
    } else {
      ElMessage.success(message)
    }
    // 关闭对话框并刷新数据
    showImportDialog.value = false
    selectedFile.value = null
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
    // 刷新车辆列表
    await loadVehicles()
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    importing.value = false
  }
}
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
// 计算车辆状态
const getVehicleStatus = (inspectionDate: string) => {
  const today = new Date()
  const inspection = new Date(inspectionDate)
  const diffTime = inspection.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays > 7) {
    return { type: 'success', text: '正常', color: 'green' }
  } else if (diffDays >= 0) {
    return { type: 'warning', text: '即将到期', color: 'orange' }
  } else {
    return { type: 'danger', text: '已过期', color: 'red' }
  }
}
// 将状态值转换为状态文本
const getStatusText = (statusValue: string) => {
  switch (statusValue) {
    case 'normal':
      return '正常'
    case 'expiring':
      return '即将到期'
    case 'expired':
      return '已过期'
    default:
      return ''
  }
}
// 生命周期
onMounted(() => {
  // 初始化时只加载公司列表和车牌号码列表，不加载车辆列表
  loadMetaData()
  // 初始化响应式检测
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>
<style scoped>
.vehicle-management {
  max-width: 1200px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
.import-container {
  text-align: center;
}
.import-tips {
  margin-top: 20px;
  text-align: left;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}
.import-tips h4 {
  margin: 0 0 10px 0;
  color: #409eff;
}
.empty-tip {
  margin: 40px 0;
  text-align: center;
}
.import-tips ul {
  margin: 0;
  padding-left: 20px;
}
.import-tips li {
  margin-bottom: 5px;
  color: #606266;
}
/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    display: none;
  }
  .vehicle-management {
    max-flex: 1;
    margin: 0;
  }
  
  .card-header {
    flex-direction: row;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-buttons {
    flex: 1;
    display: flex;
    gap: 10px;
  }
  
  .header-buttons .el-button {
    flex: 1;
  }
  
  .search-form {
    padding: 15px;
  }
  
  .search-form .el-form-item {
    margin-bottom: 15px;
    flex: 1;
  }
  
  .search-form .el-form-item__label {
    width: 100% !important;
    text-align: left;
    margin-bottom: 5px;
  }
  
  .search-form .el-form-item__content {
    width: 100% !important;
  }
  
  .search-buttons-item {
    flex: 1;
  }
  
  .search-buttons {
    flex: 1;
    display: flex;
    gap: 10px;
  }
  
  .search-buttons .el-button {
    flex: 1;
  }
  
  .pagination-container {
    text-align: center;
    margin-top: 15px;
  }
  
  .pagination-container .el-pagination {
    justify-content: center;
  }
  
  /* 表格底部修复 */
  .el-table {
    margin-bottom: 0;
  }
  
  .el-card__body {
    padding-bottom: 15px;
  }
}
@media (max-width: 480px) {
  .page-title {
    display: none;
  }
  .card-header {
    gap: 10px;
  }
  
  .header-buttons {
    flex-direction: row;
    gap: 8px;
  }
  
  .header-buttons .el-button {
    flex: 1;
  }
  
  .search-form {
    padding: 10px;
  }
  
  .search-form .el-form-item {
    margin-bottom: 12px;
  }
  
  .search-buttons {
    gap: 8px;
  }
  
  .import-tips {
    padding: 10px;
  }
  
  .pagination-container {
    margin-top: 10px;
  }
}

/* 表格排序图标修复 */
.el-table .el-table__header-wrapper .el-table__header th .cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-table .el-table__header-wrapper .el-table__header th .cell .el-table__column-sort {
  margin-left: auto;
  flex-shrink: 0;
}
</style>
