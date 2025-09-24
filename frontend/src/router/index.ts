import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/vehicles',
      name: 'vehicles',
      component: () => import('@/views/VehicleManagement.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UserManagement.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 如果路由需要认证
  if (to.meta.requiresAuth !== false) {
    // 检查是否已登录
    if (!authStore.isAuthenticated) {
      // 尝试从本地存储恢复认证状态
      await authStore.initAuth()

      if (!authStore.isAuthenticated) {
        // 未登录，重定向到登录页
        next({
          path: '/login',
          query: { redirect: to.fullPath },
        })
        return
      }
    }

    // 检查是否需要admin权限
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      // 权限不足，重定向到首页
      next('/')
      return
    }
  } else {
    // 如果已登录用户访问登录页，重定向到首页
    if (to.path === '/login' && authStore.isAuthenticated) {
      next('/')
      return
    }
  }

  next()
})

export default router
