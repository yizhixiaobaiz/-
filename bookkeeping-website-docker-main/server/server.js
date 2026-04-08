const express = require('express')
const cors = require('cors')
const db = require('./config/database')
const authRoutes = require('./routes/auth')
const recordRoutes = require('./routes/records')
const categoryRoutes = require('./routes/categories')
const aiRoutes = require('./routes/ai')
const skillRoutes = require('./routes/skills')

const app = express()

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 带重试的数据库连接测试
const connectWithRetry = async (retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await db.testConnection()
      console.log('数据库连接成功')
      return true
    } catch (error) {
      console.log(`数据库连接失败 (尝试 ${i + 1}/${retries}):`, error.message)
      if (i < retries - 1) {
        console.log(`等待 ${delay/1000} 秒后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  console.error('数据库连接失败，已达到最大重试次数')
  return false
}

// 启动服务器
const startServer = async () => {
  // 先连接数据库
  const dbConnected = await connectWithRetry()
  
  if (!dbConnected) {
    console.error('无法连接到数据库，服务器启动失败')
    process.exit(1)
  }
  
  // 路由
  app.use('/api/auth', authRoutes)
  app.use('/api/records', recordRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/ai', aiRoutes)
  app.use('/api/skills', skillRoutes)
  
  // 健康检查
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
  
  // 错误处理中间件
  app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(500).json({ 
      success: false, 
      message: err.message || '服务器内部错误' 
    })
  })
  
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`)
  })
}

startServer()
