import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

// 登录超时时间（毫秒）
const LOGIN_TIMEOUT = 30 * 60 * 1000 // 30分钟

// 检查登录状态的简单函数（不依赖 Pinia store）
const checkLoginStatusSimple = () => {
  // 优先从 localStorage 获取用户信息和时间戳
  const currentUser = localStorage.getItem('currentUser')
  let loginTime = localStorage.getItem('loginTime')
  
  // 如果 localStorage 没有，尝试从 sessionStorage 获取
  if (!currentUser || !loginTime) {
    loginTime = sessionStorage.getItem('loginTime')
  }
  
  if (!currentUser || !loginTime) {
    return false
  }
  
  // 检查登录是否超时
  const now = Date.now()
  const loginTimestamp = parseInt(loginTime)
  
  if (now - loginTimestamp > LOGIN_TIMEOUT) {
    // 登录超时，清除登录状态
    localStorage.removeItem('currentUser')
    localStorage.removeItem('loginTime')
    localStorage.removeItem('token')
    sessionStorage.removeItem('currentUser')
    sessionStorage.removeItem('loginTime')
    return false
  }
  
  return true
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login/index.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home/index.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/records',
      name: 'records',
      component: () => import('../views/Records/index.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/Statistics/index.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings/index.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ai',
      name: 'ai',
      component: () => import('../views/AI/index.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/skills',
      name: 'skills',
      component: () => import('../views/Skills/index.vue'),
      meta: { requiresAuth: true }
    },
    // 404页面
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 检查登录状态
    if (checkLoginStatusSimple()) {
      next()
    } else {
      // 未登录或登录超时，重定向到登录页
      // 保存重定向路径
      localStorage.setItem('redirectPath', to.fullPath)
      
      // 检查是否是登录超时
      const loginTime = localStorage.getItem('loginTime') || sessionStorage.getItem('loginTime')
      if (loginTime) {
        ElMessage.warning('登录已超时，请重新登录')
      } else {
        ElMessage.info('请先登录后再访问')
      }
      
      next('/login')
    }
  } else {
    // 不需要认证的页面（如登录页）
    // 如果已登录且访问登录页，重定向到首页
    if (to.path === '/login' && checkLoginStatusSimple()) {
      next('/')
    } else {
      next()
    }
  }
})

export default router