import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useRecordStore } from './record'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const userInfo = reactive({
    name: '用户',
    id: ''
  })
  
  const LOGIN_TIMEOUT = 30 * 60 * 1000 // 30分钟
  
  const setToken = (token) => {
    localStorage.setItem('token', token)
  }
  
  const getToken = () => {
    return localStorage.getItem('token')
  }
  
  const removeToken = () => {
    localStorage.removeItem('token')
  }
  
  const initUser = async () => {
    const token = getToken()
    let initialized = false
    
    if (token) {
      try {
        const response = await api.auth.verify()
        if (response.success) {
          isLoggedIn.value = true
          userInfo.name = response.data.user.username
          userInfo.id = response.data.user.id
          initialized = true
        }
      } catch (error) {
        console.error('验证令牌失败:', error)
        removeToken()
      }
    }
    
    // 如果还没有初始化，尝试从 localStorage 读取
    if (!initialized) {
      const savedUser = localStorage.getItem('currentUser')
      const loginTime = localStorage.getItem('loginTime')
      
      if (savedUser && loginTime) {
        try {
          const user = JSON.parse(savedUser)
          const loginTimestamp = parseInt(loginTime)
          const now = Date.now()
          
          if (now - loginTimestamp <= LOGIN_TIMEOUT) {
            isLoggedIn.value = true
            userInfo.name = user.username
            userInfo.id = user.id
            
            localStorage.setItem('loginTime', now.toString())
            sessionStorage.setItem('loginTime', now.toString())
            initialized = true
          } else {
            logout()
          }
        } catch (error) {
          console.error('解析用户信息失败:', error)
        }
      }
    }
  }
  
  const login = async (userData, token) => {
    isLoggedIn.value = true
    userInfo.name = userData.username
    userInfo.id = userData.id
    
    localStorage.setItem('currentUser', JSON.stringify(userData))
    localStorage.setItem('loginTime', Date.now().toString())
    sessionStorage.setItem('currentUser', JSON.stringify(userData))
    sessionStorage.setItem('loginTime', Date.now().toString())
    
    if (token) {
      setToken(token)
    }
  }
  
  const logout = () => {
    isLoggedIn.value = false
    userInfo.name = '用户'
    userInfo.id = ''
    
    removeToken()
    localStorage.removeItem('currentUser')
    localStorage.removeItem('loginTime')
    localStorage.removeItem('redirectPath')
    sessionStorage.removeItem('currentUser')
    sessionStorage.removeItem('loginTime')
  }
  
  return {
    isLoggedIn,
    userInfo,
    setToken,
    getToken,
    removeToken,
    initUser,
    login,
    logout
  }
})
