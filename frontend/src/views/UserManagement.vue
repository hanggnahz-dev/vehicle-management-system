<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </div>
      </template>

      <!-- 用户列表 -->
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)"> 编辑 </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
              :disabled="isAdminUser(scope.row)"
              :title="isAdminUser(scope.row) ? '禁止删除管理员用户' : ''"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog v-model="showAddDialog" :title="editingUser ? '编辑用户' : '添加用户'" width="500px">
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="editingUser ? '留空则不修改密码' : '请输入密码'"
          >
            <template #suffix>
              <el-icon @click="showPassword = !showPassword" style="cursor: pointer">
                <View v-if="!showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="editingUser">
          <el-input
            v-model="userForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入密码"
          >
            <template #suffix>
              <el-icon @click="showConfirmPassword = !showConfirmPassword" style="cursor: pointer">
                <View v-if="!showConfirmPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="userForm.status"
            placeholder="请选择状态"
            style="width: 100%"
            :disabled="editingUser && isAdminUser(editingUser)"
          >
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
          </el-select>
          <div v-if="editingUser && isAdminUser(editingUser)" class="admin-protection-tip">
            <el-text type="warning" size="small">管理员用户状态不可修改</el-text>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingUser ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { User } from '@/stores/user'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const showAddDialog = ref(false)
const editingUser = ref<User | null>(null)
const userFormRef = ref()
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 用户表单
const userForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  status: 'active' as 'active' | 'inactive',
})

// 表单验证规则
const userRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  password: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!editingUser.value && !value) {
          callback(new Error('请输入密码'))
        } else if (value && (value.length < 6 || value.length > 100)) {
          callback(new Error('密码长度在 6 到 100 个字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (editingUser.value && userForm.password && !value) {
          callback(new Error('请确认密码'))
        } else if (editingUser.value && userForm.password && value !== userForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 计算属性
const users = computed(() => userStore.users)

// 方法
const loadUsers = async () => {
  try {
    loading.value = true
    await userStore.fetchUsers()
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 检查用户是否为管理员
const isAdminUser = (user: User): boolean => {
  return user.roles?.includes('admin') || false
}

const handleEdit = (user: User) => {
  editingUser.value = user
  Object.assign(userForm, {
    name: user.name,
    email: user.email,
    password: '',
    confirmPassword: '',
    status: user.status,
  })
  showAddDialog.value = true
}

const handleDelete = async (user: User) => {
  // 检查是否为管理员用户
  if (isAdminUser(user)) {
    ElMessage.warning('禁止删除管理员用户')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除用户 "${user.name}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await userStore.deleteUser(user.id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true

    // 编辑用户时，如果输入了密码，需要确认密码一致
    if (editingUser.value && userForm.password && userForm.password !== userForm.confirmPassword) {
      ElMessage.error('两次输入的密码不一致')
      return
    }

    // 准备提交的数据，不包含确认密码字段
    const submitData: any = {
      name: userForm.name,
      email: userForm.email,
      status: userForm.status,
    }

    // 只有在有密码的情况下才添加密码字段
    if (userForm.password && userForm.password.trim() !== '') {
      submitData.password = userForm.password
    }

    if (editingUser.value) {
      await userStore.updateUser(editingUser.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await userStore.createUser(submitData)
      ElMessage.success('添加成功')
    }

    showAddDialog.value = false
    resetForm()
    loadUsers()
  } catch (error) {
    ElMessage.error(editingUser.value ? '更新失败' : '添加失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  editingUser.value = null
  Object.assign(userForm, {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: 'active',
  })
  showPassword.value = false
  showConfirmPassword.value = false
}

// 生命周期
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-protection-tip {
  margin-top: 8px;
}
</style>
