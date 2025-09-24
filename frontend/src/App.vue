<template>
  <div id="app">
    <el-container>
      <el-header v-if="authStore.isAuthenticated">
        <div class="header-content">
          <el-menu mode="horizontal" :default-active="$route.path" router class="header-menu">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/vehicles">车辆管理</el-menu-item>
            <el-menu-item v-if="authStore.isAdmin" index="/users">用户管理</el-menu-item>
          </el-menu>
          <div class="user-info">
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-icon><User /></el-icon>
                {{ authStore.user?.name || '用户' }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

onMounted(async () => {
  // 初始化认证状态
  await authStore.initAuth()

  // 如果已登录，获取用户信息
  if (authStore.isAuthenticated) {
    userStore.fetchUserInfo()
  }
})

// 处理用户下拉菜单命令
const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })

      authStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-menu {
  border-bottom: 1px solid #e6e6e6;
  flex: 1;
}

.user-info {
  padding-right: 20px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.user-dropdown:hover {
  color: #409eff;
}

.user-dropdown .el-icon {
  margin: 0 4px;
}

.el-header {
  padding: 0;
  height: 60px;
  line-height: 60px;
}

.el-main {
  padding: 20px;
}
</style>
