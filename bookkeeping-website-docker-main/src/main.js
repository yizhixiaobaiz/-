import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'
import router from './router'

// 初始化函数，处理localStorage中的旧数据
const initializeApp = () => {
  // 确保在浏览器环境中运行
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      // 检查是否存在旧格式的用户数据
      const users = localStorage.getItem('users')
      if (users) {
        try {
          // 尝试解析为JSON
          const parsedUsers = JSON.parse(users)
          // 如果是数组且长度大于0，说明是旧格式
          if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
            console.log('发现旧格式的用户数据，需要清空')
            // 清空所有localStorage数据
            localStorage.clear()
            console.log('LocalStorage已清空，准备重新初始化')
          }
        } catch (error) {
          // 如果解析失败，可能是新的加密格式，不需要处理
          console.log('用户数据可能已经是加密格式，无需处理')
        }
      }
    } catch (error) {
      console.error('初始化应用时出错:', error)
    }
  }
}

// 执行初始化
initializeApp()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')