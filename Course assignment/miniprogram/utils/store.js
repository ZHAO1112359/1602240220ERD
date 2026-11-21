// 数据访问层：用小程序本地缓存模拟数据库持久化
// 对应设计中的 patient/doctor/schedule/slot/appointment 五张表
const KEY = 'dental_clinic_db_v1'

function fmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function initDB() {
  const now = new Date()
  const dates = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    dates.push(fmtDate(d))
  }
  // 待确认演示记录放在昨天，确保任何时间打开都满足“预约时刻已过”
  const y = new Date(now); y.setDate(now.getDate() - 1)
  const past = fmtDate(y)
  const db = {
    dates: dates,
    appointments: [
      { id: 'a1', name: '陈女士', phone: '138****2210', doctorId: 'd1', date: past, time: '09:00', status: 'BOOKED', confirmResult: '', note: '左下后牙疼痛', registerTime: '前日 15:20' },
      { id: 'a2', name: '刘先生', phone: '139****7781', doctorId: 'd2', date: past, time: '09:30', status: 'BOOKED', confirmResult: '', note: '复诊调整牙套', registerTime: '前日 16:05' },
      { id: 'a3', name: '赵女士', phone: '137****0093', doctorId: 'd3', date: past, time: '10:00', status: 'BOOKED', confirmResult: '', note: '洁牙', registerTime: '昨日 08:40' },
      { id: 'a4', name: '孙先生', phone: '136****4412', doctorId: 'd1', date: dates[1], time: '14:00', status: 'BOOKED', confirmResult: '', note: '补牙', registerTime: '今日 09:02' }
    ]
  }
  wx.setStorageSync(KEY, db)
  return db
}

function initIfNeeded() {
  try {
    const db = wx.getStorageSync(KEY)
    if (!db || !db.appointments) initDB()
  } catch (e) {
    initDB()
  }
}

function loadDB() {
  initIfNeeded()
  return wx.getStorageSync(KEY)
}

function saveDB(db) {
  wx.setStorageSync(KEY, db)
}

function resetDB() {
  wx.removeStorageSync(KEY)
  initDB()
}

module.exports = { initDB, initIfNeeded, loadDB, saveDB, resetDB, KEY }
