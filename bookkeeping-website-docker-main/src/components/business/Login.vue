<template>
  <div class="login-container">
    <!-- 登录按钮/用户信息 -->
    <div v-if="!authStore.isLoggedIn" class="login-button-container">
      <el-button type="primary" @click="showLoginDialog = true">
        <el-icon><User /></el-icon>
        登录
      </el-button>
    </div>
    
    <!-- 已登录状态 -->
    <div v-else class="user-info">
      <el-dropdown @command="handleDropdownCommand">
        <span class="user-name">
          {{ authStore.userInfo.name }}
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="settings">设置</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <!-- 登录对话框 -->
    <el-dialog
      v-model="showLoginDialog"
      :title="activeDialog === 'login' ? '登录' : '注册'"
      width="400px"
    >
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
          <el-button type="primary" @click="handleLogin" :loading="loading">
            登录
          </el-button>
          <el-button @click="showLoginDialog = false">取消</el-button>
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
          <el-button type="primary" @click="handleRegister" :loading="loading">
            注册
          </el-button>
          <el-button @click="showLoginDialog = false">取消</el-button>
        </el-form-item>
        <el-form-item class="login-link">
          <span>已有账号？</span>
          <el-link @click="switchToLogin">立即登录</el-link>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { User, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../utils/api'

const router = useRouter()
const authStore = useAuthStore()

// 登录状态
const showLoginDialog = ref(false)
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

// 初始化时检查本地存储中的用户信息
const initUser = async () => {
  await authStore.initUser()
}

// 处理登录
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const response = await api.auth.login(loginForm.username, loginForm.password)
    
    loading.value = false
    
    if (response.success) {
      showLoginDialog.value = false
      
      // 使用 authStore 登录
      await authStore.login(
        { id: response.data.user.id, username: response.data.user.username },
        response.data.token
      )
      
      ElMessage.success('登录成功')
      
      // 检查是否有保存的重定向路径
      const redirectPath = localStorage.getItem('redirectPath')
      if (redirectPath && redirectPath !== '/login') {
        localStorage.removeItem('redirectPath')
        router.push(redirectPath)
      } else {
        router.push('/')
      }
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
      showLoginDialog.value = false
      
      // 使用 authStore 登录
      await authStore.login(
        { id: response.data.user.id, username: response.data.user.username },
        response.data.token
      )
      
      ElMessage.success('注册成功')
      
      // 检查是否有保存的重定向路径
      const redirectPath = localStorage.getItem('redirectPath')
      if (redirectPath && redirectPath !== '/login') {
        localStorage.removeItem('redirectPath')
        router.push(redirectPath)
      } else {
        router.push('/')
      }
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

// 处理下拉菜单命令
const handleDropdownCommand = (command) => {
  switch (command) {
    case 'profile':
      console.log('个人中心')
      break
    case 'settings':
      console.log('设置')
      break
    case 'logout':
      handleLogout()
      break
    default:
      break
  }
}

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm('请在设置中导出数据以免数据丢失，确定要退出登录吗？', '退出登录提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(() => {
    // 使用 authStore 退出登录
    authStore.logout()
    
    ElMessage.success('退出登录成功')
    
    // 立即重定向到登录页面
    router.push('/login')
  })
  .catch(() => {
    console.log('用户取消退出登录')
  })
}

// 初始化用户
onMounted(async () => {
  await initUser()
})

// 监听登录状态变化
watch(() => authStore.isLoggedIn, (newValue) => {
  if (newValue) {
    console.log('用户已登录:', authStore.userInfo)
  } else {
    console.log('用户已退出')
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
}

.login-button-container {
  margin-left: auto;
}

.user-info {
  margin-left: auto;
}

.user-name {
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-name:hover {
  color: #409eff;
}
</style>