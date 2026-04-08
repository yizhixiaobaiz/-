// 清除所有应用数据的脚本

console.log('开始清除应用数据...')

// 清除用户信息
localStorage.removeItem('users')
localStorage.removeItem('currentUser')

// 清除所有用户的记录数据
const keys = Object.keys(localStorage)
keys.forEach(key => {
  if (key.startsWith('expense-tracker-records')) {
    localStorage.removeItem(key)
    console.log(`清除记录数据: ${key}`)
  }
})

console.log('数据清除完成！')
console.log('现在可以重新启动应用开始正常使用')