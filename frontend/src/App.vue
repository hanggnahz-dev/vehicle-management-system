<template>
  <div id="app">
    <el-container>
      <el-header v-if="authStore.isAuthenticated">
        <div class="header-content">
          <!-- 桌面端导航 -->
          <el-menu
            mode="horizontal"
            :default-active="$route.path"
            router
            class="header-menu desktop-menu"
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/vehicles">车辆管理</el-menu-item>
            <el-menu-item v-if="authStore.isAdmin" index="/users">用户管理</el-menu-item>
          </el-menu>

          <!-- 手机端汉堡菜单 -->
          <div class="mobile-menu-trigger" @click="showMobileMenu = !showMobileMenu">
            <el-icon><Menu /></el-icon>
          </div>

          <div class="user-info">
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-icon><User /></el-icon>
                <span class="user-name">{{ authStore.user?.name || '用户' }}</span>
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

        <!-- 手机端菜单 -->
        <div v-if="showMobileMenu" class="mobile-menu" @click="showMobileMenu = false">
          <div class="mobile-menu-content" @click.stop>
            <div class="mobile-menu-header">
              <h3>导航菜单</h3>
              <el-button text @click="showMobileMenu = false">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <el-menu
              :default-active="$route.path"
              router
              class="mobile-menu-list"
              @select="showMobileMenu = false"
            >
              <el-menu-item index="/">
                <el-icon><House /></el-icon>
                <span>首页</span>
              </el-menu-item>
              <el-menu-item index="/vehicles">
                <el-icon><Van /></el-icon>
                <span>车辆管理</span>
              </el-menu-item>
              <el-menu-item v-if="authStore.isAdmin" index="/users">
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </el-menu-item>
            </el-menu>
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ArrowDown, Menu, Close, House, Van } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

// 手机端菜单显示状态
const showMobileMenu = ref(false)

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
  position: relative;
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
  font-size: 18px;
  margin: 0 6px;
}

.user-name {
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

/* 手机端菜单触发器 */
.mobile-menu-trigger {
  display: none;
  cursor: pointer;
  padding: 10px;
  font-size: 20px;
  color: #606266;
}

.mobile-menu-trigger:hover {
  color: #409eff;
}

/* 手机端菜单 */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: none;
}

.mobile-menu-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background-color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.mobile-menu-header h3 {
  margin: 0;
  color: #303133;
}

.mobile-menu-list {
  border: none;
}

.mobile-menu-list .el-menu-item {
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
}

.mobile-menu-list .el-menu-item .el-icon {
  margin-right: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .desktop-menu {
    display: none !important;
  }

  .mobile-menu-trigger {
    display: block;
  }

  .mobile-menu {
    display: block;
  }

  .user-name {
    display: none;
  }
  
  .user-dropdown .el-icon {
    font-size: 20px;
    margin: 0 4px;
  }

  .user-info {
    padding-right: 10px;
  }

  .el-main {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .el-header {
    height: 50px;
    line-height: 50px;
  }

  .mobile-menu-content {
    width: 100%;
  }

  .el-main {
    padding: 5px;
  }
}

/* 平板端适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .el-main {
    padding: 15px;
  }
}
</style>
