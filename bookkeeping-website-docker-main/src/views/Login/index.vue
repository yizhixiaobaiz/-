<template>
  <div class="login-page">
    <div class="login-container">
      <h1 class="login-title">个人记账应用</h1>
      <div class="login-form">
        <!-- 登录表单 -->
        <el-form v-if="activeDialog === 'login'" :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">
              登录
            </el-button>
          </el-form-item>
          <el-form-item class="register-link">
            <span>还没有账号？</span>
            <el-link @click="switchToRegister">立即注册</el-link>
          </el-form-item>
        </el-form>
        
        <!-- 注册表单 -->
        <el-form v-else :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleRegister" :loading="loading" class="login-button">
              注册
            </el-button>
          </el-form-item>
          <el-form-item class="login-link">
            <span>已有账号？</span>
            <el-link @click="switchToLogin">立即登录</el-link>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../utils/api'
import recordStore from '../../utils/recordStore'

const router = useRouter()
const authStore = useAuthStore()
const activeDialog = ref('login') // login or register
const loading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 登录表单规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 注册表单规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 检查用户是否已登录
const checkLoginStatus = async () => {
  await authStore.initUser()
  
  if (authStore.isLoggedIn) {
    // 重定向到之前的页面或首页
    const redirectPath = localStorage.getItem('redirectPath') || '/'
    localStorage.removeItem('redirectPath')
    router.push(redirectPath)
  }
}

// 处理登录
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const response = await api.auth.login(loginForm.username, loginForm.password)
    
    loading.value = false
    
    if (response.success) {
      await authStore.login(
        { id: response.data.user.id, username: response.data.user.username },
        response.data.token
      )
      
      ElMessage.success('登录成功')
      
      const redirectPath = localStorage.getItem('redirectPath') || '/'
      localStorage.removeItem('redirectPath')
      router.push(redirectPath)
    }
  } catch (error) {
    loading.value = false
    ElMessage.error(error.message || '登录失败')
  }
}

// 处理注册
const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    const response = await api.auth.register(registerForm.username, registerForm.password)
    
    loading.value = false
    
    if (response.success) {
      await authStore.login(
        { id: response.data.user.id, username: response.data.user.username },
        response.data.token
      )
      
      ElMessage.success('注册成功')
      
      const redirectPath = localStorage.getItem('redirectPath') || '/'
      localStorage.removeItem('redirectPath')
      router.push(redirectPath)
    }
  } catch (error) {
    loading.value = false
    ElMessage.error(error.message || '注册失败')
  }
}

// 切换到登录表单
const switchToLogin = () => {
  activeDialog.value = 'login'
}

// 切换到注册表单
const switchToRegister = () => {
  activeDialog.value = 'register'
}

// 初始化时检查登录状态
onMounted(async () => {
  await checkLoginStatus()
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-size: 24px;
  font-weight: bold;
}

.login-form {
  width: 100%;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.register-link,
.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
}

.register-link span,
.login-link span {
  margin-right: 5px;
}
</style>