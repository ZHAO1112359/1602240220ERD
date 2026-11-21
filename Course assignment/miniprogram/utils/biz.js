// 业务逻辑层：对应预约就诊控制、到诊确认控制，落实业务规则与状态迁移
const store = require('./store.js')

const DOCTORS = [
  { id: 'd1', name: '张医生', dept: '补牙 / 根管' },
  { id: 'd2', name: '李医生', dept: '正畸 / 修复' },
  { id: 'd3', name: '王医生', dept: '洁牙 / 牙周' }
]
const TIMES = ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30']

const STATUS_TEXT = {
  BOOKED: '已预约', PENDING_CONFIRM: '待确认', DELAYED: '延迟到诊',
  RESCHEDULED: '已改期', NO_SHOW: '爽约', FINISHED: '已就诊', CANCELLED: '已取消'
}
const RESULT_TEXT = { COMING: '要来', NOT_COMING: '不来', RESCHEDULE: '改期', UNREACHABLE: '联系不上' }

function doctorName(id) {
  const d = DOCTORS.find(x => x.id === id)
  return d ? d.name : ''
}

function isBooked(doctorId, date, time, appointments) {
  const list = appointments || store.loadDB().appointments
  return list.some(a => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'CANCELLED')
}

// UC-01 预约就诊控制：校验时段互斥与重复预约，登记预约并占用时段
function bookAppointment(patient, doctorId, date, time) {
  const db = store.loadDB()
  if (isBooked(doctorId, date, time, db.appointments)) {
    return { ok: false, msg: '该时段已被预约或服务已取消' }
  }
  if (db.appointments.some(a => a.phone === patient.phone && a.date === date && a.time === time)) {
    return { ok: false, msg: '该患者在此已有预约' }
  }
  const a = {
    id: 'a' + Date.now(), name: patient.name, phone: patient.phone, note: patient.note || '',
    doctorId, date, time, status: 'BOOKED', confirmResult: '',
    confirmTime: '', operator: '', registerTime: '刚刚'
  }
  db.appointments.push(a)
  store.saveDB(db)
  return { ok: true, data: a, msg: '预约成功' }
}

// UC-02 到诊确认控制：筛出“预约时刻已过、状态仍为已预约”的过点未到记录
function isPastDue(a) {
  const t = new Date(a.date.replace(/-/g, '/') + ' ' + a.time + ':00').getTime()
  return t < Date.now()
}

function buildPendingList() {
  const db = store.loadDB()
  const pending = db.appointments.filter(a => {
    if (a.status === 'PENDING_CONFIRM') return true   // 已在名单中、尚未确认
    if (a.status !== 'BOOKED') return false           // 其他状态不进名单
    return isPastDue(a)                               // 仅过点未到者进名单
  })
  // 进入名单后状态置为待确认
  let changed = false
  pending.forEach(a => { if (a.status === 'BOOKED') { a.status = 'PENDING_CONFIRM'; changed = true } })
  if (changed) store.saveDB(db)
  return pending
}

// UC-02 确认：把前台回报的确认结果映射为状态迁移，落实爽约口径
function confirmAppointment(id, result) {
  const db = store.loadDB()
  const a = db.appointments.find(x => x.id === id)
  if (!a) return { ok: false, msg: '预约记录不存在' }
  const map = {
    COMING: 'DELAYED', RESCHEDULE: 'RESCHEDULED',
    NOT_COMING: 'NO_SHOW', UNREACHABLE: 'NO_SHOW'
  }
  if (!map[result]) return { ok: false, msg: '无效的确认结果' }
  a.status = map[result]
  a.confirmResult = result
  a.confirmTime = '刚刚'
  a.operator = '前台'
  store.saveDB(db)
  return { ok: true, data: a, msg: '已记录：' + RESULT_TEXT[result] + '，状态更新为' + STATUS_TEXT[a.status] }
}

function getAppointment(id) {
  return store.loadDB().appointments.find(x => x.id === id)
}

function allAppointments() {
  return store.loadDB().appointments
}

// 我的预约：演示模式下用最近一次提交作为“我的”
function myAppointments() {
  const list = store.loadDB().appointments
  return list.length ? [list[list.length - 1]] : []
}

// 运营统计：仅 NO_SHOW 计入爽约；DELAYED/RESCHEDULED 为挽回
function getStats() {
  const list = allAppointments()
  const noShow = list.filter(a => a.status === 'NO_SHOW').length
  const saved = list.filter(a => a.status === 'DELAYED' || a.status === 'RESCHEDULED').length
  const rate = list.length ? Math.round(noShow / list.length * 100) : 0
  return { total: list.length, noShow, saved, rate }
}

module.exports = {
  DOCTORS, TIMES, STATUS_TEXT, RESULT_TEXT,
  doctorName, isBooked, bookAppointment, buildPendingList,
  confirmAppointment, getAppointment, allAppointments, myAppointments, getStats
}
