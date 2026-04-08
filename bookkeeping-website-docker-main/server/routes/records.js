const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { pool } = require('../config/database')

// 获取所有记录
router.get('/', auth, async (req, res) => {
  try {
    const [records] = await pool.execute(
      `SELECT id, type, category, amount, date, datetime, note, created_at, updated_at 
       FROM records 
       WHERE user_id = ? 
       ORDER BY datetime DESC`,
      [req.userId]
    )
    
    res.json({
      success: true,
      data: records
    })
  } catch (error) {
    console.error('获取记录错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取记录失败' 
    })
  }
})

// 添加记录
router.post('/', auth, async (req, res) => {
  try {
    const { type, category, amount, date, note } = req.body
    
    if (!type || !category || !amount || !date) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要字段' 
      })
    }
    
    const id = Date.now().toString()
    const datetime = date.includes(' ') ? date : `${date} ${new Date().toTimeString().slice(0, 8)}`
    
    await pool.execute(
      `INSERT INTO records (id, user_id, type, category, amount, date, datetime, note) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.userId, type, category, amount, date, datetime, note || '']
    )
    
    res.json({
      success: true,
      message: '添加记录成功',
      data: {
        id,
        type,
        category,
        amount,
        date,
        datetime,
        note
      }
    })
  } catch (error) {
    console.error('添加记录错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '添加记录失败' 
    })
  }
})

// 更新记录
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { type, category, amount, date, note } = req.body
    
    // 检查记录是否存在且属于当前用户
    const [existingRecords] = await pool.execute(
      'SELECT id FROM records WHERE id = ? AND user_id = ?',
      [id, req.userId]
    )
    
    if (existingRecords.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '记录不存在' 
      })
    }
    
    const datetime = date.includes(' ') ? date : `${date} ${new Date().toTimeString().slice(0, 8)}`
    
    await pool.execute(
      `UPDATE records 
       SET type = ?, category = ?, amount = ?, date = ?, datetime = ?, note = ? 
       WHERE id = ? AND user_id = ?`,
      [type, category, amount, date, datetime, note || '', id, req.userId]
    )
    
    res.json({
      success: true,
      message: '更新记录成功'
    })
  } catch (error) {
    console.error('更新记录错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '更新记录失败' 
    })
  }
})

// 删除记录
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await pool.execute(
      'DELETE FROM records WHERE id = ? AND user_id = ?',
      [id, req.userId]
    )
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '记录不存在' 
      })
    }
    
    res.json({
      success: true,
      message: '删除记录成功'
    })
  } catch (error) {
    console.error('删除记录错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '删除记录失败' 
    })
  }
})

// 获取统计数据
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    
    let query = `SELECT type, SUM(amount) as total, category 
                 FROM records 
                 WHERE user_id = ?`
    const params = [req.userId]
    
    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }
    
    query += ' GROUP BY type, category'
    
    const [stats] = await pool.execute(query, params)
    
    const income = stats
      .filter(s => s.type === 'income')
      .reduce((sum, s) => sum + parseFloat(s.total), 0)
    
    const expense = stats
      .filter(s => s.type === 'expense')
      .reduce((sum, s) => sum + parseFloat(s.total), 0)
    
    res.json({
      success: true,
      data: {
        income,
        expense,
        balance: income - expense,
        details: stats
      }
    })
  } catch (error) {
    console.error('获取统计错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取统计失败' 
    })
  }
})

module.exports = router
