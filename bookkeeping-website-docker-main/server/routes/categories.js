const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { pool } = require('../config/database')

// 获取所有分类
router.get('/', auth, async (req, res) => {
  try {
    const [categories] = await pool.execute(
      `SELECT id, name, type, created_at 
       FROM categories 
       WHERE user_id = ? 
       ORDER BY type, name`,
      [req.userId]
    )
    
    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('获取分类错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取分类失败' 
    })
  }
})

// 添加分类
router.post('/', auth, async (req, res) => {
  try {
    const { name, type } = req.body
    
    if (!name || !type) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要字段' 
      })
    }
    
    // 检查分类是否已存在
    const [existingCategories] = await pool.execute(
      'SELECT id FROM categories WHERE user_id = ? AND name = ? AND type = ?',
      [req.userId, name, type]
    )
    
    if (existingCategories.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '分类已存在' 
      })
    }
    
    await pool.execute(
      'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
      [req.userId, name, type]
    )
    
    res.json({
      success: true,
      message: '添加分类成功'
    })
  } catch (error) {
    console.error('添加分类错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '添加分类失败' 
    })
  }
})

// 更新分类
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { name, type } = req.body
    
    await pool.execute(
      'UPDATE categories SET name = ?, type = ? WHERE id = ? AND user_id = ?',
      [name, type, id, req.userId]
    )
    
    res.json({
      success: true,
      message: '更新分类成功'
    })
  } catch (error) {
    console.error('更新分类错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '更新分类失败' 
    })
  }
})

// 删除分类
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    
    await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, req.userId]
    )
    
    res.json({
      success: true,
      message: '删除分类成功'
    })
  } catch (error) {
    console.error('删除分类错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '删除分类失败' 
    })
  }
})

module.exports = router
