const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'expense_tracker_2024',
  database: process.env.DB_NAME || 'expense_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  // 强制使用utf8mb4编码
  connectAttributes: {
    charset: 'utf8mb4'
  }
})

// 设置连接编码
pool.on('connection', function (connection) {
  connection.query("SET NAMES utf8mb4")
  connection.query("SET CHARACTER SET utf8mb4")
  connection.query("SET character_set_connection=utf8mb4")
})

const testConnection = async () => {
  const connection = await pool.getConnection()
  console.log('数据库连接成功')
  connection.release()
}

module.exports = {
  pool,
  testConnection
}
