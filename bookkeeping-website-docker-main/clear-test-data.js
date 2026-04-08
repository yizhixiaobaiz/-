// 清除测试数据的脚本

console.log('开始清除测试数据...')

// 清除所有用户的记录数据
const keys = Object.keys(localStorage)
keys.forEach(key => {
  if (key.startsWith('expense-tracker-records')) {
    const records = JSON.parse(localStorage.getItem(key) || '[]')
    const nonTestRecords = records.filter(record => !record.note || !record.note.includes('测试'))
    if (nonTestRecords.length !== records.length) {
      localStorage.setItem(key, JSON.stringify(nonTestRecords))
      console.log(`清除用户 ${key.replace('expense-tracker-records-', '')} 的测试数据，保留 ${nonTestRecords.length} 条非测试记录`)
    }
  }
})

console.log('测试数据清除完成！')
console.log('现在登录后不会再看到默认的测试数据了')

// 提示用户在浏览器中运行此代码
console.log('\n请在浏览器中按F12打开开发者工具，在Console标签页中运行以下代码来清除实际的测试数据：')
console.log('const keys = Object.keys(localStorage); keys.forEach(key => { if (key.startsWith(\'expense-tracker-records\')) { const records = JSON.parse(localStorage.getItem(key) || \'[]\'); const nonTestRecords = records.filter(record => !record.note || !record.note.includes(\'测试\')); if (nonTestRecords.length !== records.length) { localStorage.setItem(key, JSON.stringify(nonTestRecords)); console.log(`清除用户 ${key.replace(\'expense-tracker-records-\', \'\')} 的测试数据`); } } }); console.log(\'测试数据清除完成！\')')
