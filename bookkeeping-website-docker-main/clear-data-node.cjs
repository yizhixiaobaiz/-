// Node.js脚本：清除所有应用数据的模拟

const fs = require('fs')
const path = require('path')

console.log('开始清除应用数据...')

// 模拟localStorage的清除操作
// 在实际浏览器环境中，这些数据会存储在localStorage中
// 这里我们只是模拟清除操作

console.log('清除用户信息: users')
console.log('清除当前用户: currentUser')

// 模拟清除所有用户的记录数据
console.log('清除记录数据: expense-tracker-records')
console.log('清除记录数据: expense-tracker-records-*')

console.log('数据清除完成！')
console.log('现在可以重新启动应用开始正常使用')

// 提示用户在浏览器中清除localStorage
console.log('\n注意：请在浏览器中按F12打开开发者工具，在Console标签页中运行以下代码来清除实际的localStorage数据：')
console.log('localStorage.removeItem(\'users\'); localStorage.removeItem(\'currentUser\'); Object.keys(localStorage).forEach(key => { if (key.startsWith(\'expense-tracker-records\')) { localStorage.removeItem(key) } }); console.log(\'数据清除完成！\')')
