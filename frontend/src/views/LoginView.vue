<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>🚗 车辆管理系统</h2>
        <p>请登录以继续</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe" size="large"> 记住密码 </el-checkbox>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <!-- 演示账号信息已删除 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

// 表单验证规则
const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
}

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    await authStore.login(loginForm.email, loginForm.password)

    // 处理记住密码功能
    if (loginForm.rememberMe) {
      // 保存登录信息到localStorage
      localStorage.setItem('rememberedEmail', loginForm.email)
      localStorage.setItem('rememberedPassword', loginForm.password)
      localStorage.setItem('rememberMe', 'true')
    } else {
      // 清除保存的登录信息
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberedPassword')
      localStorage.removeItem('rememberMe')
    }

    ElMessage.success('登录成功')

    // 登录成功后跳转到首页
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查邮箱和密码')
  } finally {
    loading.value = false
  }
}

// 页面加载时检查是否有保存的登录信息
onMounted(() => {
  const rememberedEmail = localStorage.getItem('rememberedEmail')
  const rememberedPassword = localStorage.getItem('rememberedPassword')
  const rememberMe = localStorage.getItem('rememberMe')

  if (rememberedEmail && rememberedPassword && rememberMe === 'true') {
    loginForm.email = rememberedEmail
    loginForm.password = rememberedPassword
    loginForm.rememberMe = true
  }
})
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  z-index: 9999;
}

.login-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.login-form {
  margin-bottom: 20px;
}

.login-options {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 演示账号样式已删除 */

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 10px;
  }
  
  .login-box {
    padding: 30px 20px;
    max-width: 100%;
  }
  
  .login-header h2 {
    font-size: 20px;
  }
  
  .login-header p {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 5px;
  }
  
  .login-box {
    padding: 20px 15px;
    border-radius: 8px;
  }

  .login-header h2 {
    font-size: 18px;
  }
  
  .login-header p {
    font-size: 12px;
  }
  
  .login-button {
    height: 40px;
    font-size: 14px;
  }
}

/* 横屏手机适配 */
@media (max-width: 768px) and (orientation: landscape) {
  .login-container {
    align-items: flex-start;
    padding-top: 10px;
  }
  
  .login-box {
    margin-top: 20px;
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style>
