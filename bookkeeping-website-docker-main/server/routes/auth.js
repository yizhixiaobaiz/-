const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/database')

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here'

// 用户注册
router.post('/register', async (req, res) => {
  console.log('收到注册请求:', req.body)
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      })
    }
    
    // 检查用户是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名已存在' 
      })
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 创建用户
    const userId = Date.now().toString()
    await pool.execute(
      'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
      [userId, username, hashedPassword]
    )
    
    // 为新用户添加默认分类
    const defaultCategories = [
      ['工资', 'income'],
      ['奖金', 'income'],
      ['投资', 'income'],
      ['其他', 'income'],
      ['餐饮', 'expense'],
      ['交通', 'expense'],
      ['购物', 'expense'],
      ['娱乐', 'expense'],
      ['其他', 'expense']
    ]
    
    for (const [name, type] of defaultCategories) {
      await pool.execute(
        'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
        [userId, name, type]
      )
    }
    
    // 生成 JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
    
    res.json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: userId,
          username
        }
      }
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '注册失败' 
    })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  console.log('收到登录请求:', req.body)
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      })
    }
    
    // 查找用户
    const [users] = await pool.execute(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    )
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      })
    }
    
    const user = users[0]
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      })
    }
    
    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username
        }
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '登录失败' 
    })
  }
})

// 验证令牌
router.get('/verify', require('../middleware/auth'), async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username FROM users WHERE id = ?',
      [req.userId]
    )
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      })
    }
    
    res.json({
      success: true,
      data: {
        user: users[0]
      }
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '验证失败' 
    })
  }
})

module.exports = router
