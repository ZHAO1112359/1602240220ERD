const biz = require('../../utils/biz.js')
const store = require('../../utils/store.js')
Page({
  data: {
    doctors: biz.DOCTORS, dates: [],
    doctorId: '', date: '', time: '', name: '', phone: '', note: '',
    step: 1, dateLabels: [], slotList: []
  },
  onLoad() {
    store.initIfNeeded()
    const db = store.loadDB()
    const labels = db.dates.map((d, i) => (i === 0 ? '今天 ' : i === 1 ? '明天 ' : '后天 ') + d.slice(5))
    this.setData({ dates: db.dates, dateLabels: labels })
  },
  // 预计算时段可用性（WXML 不支持调用函数，需在此生成带 disabled 标志的列表）
  refreshSlots() {
    const db = store.loadDB()
    const list = biz.TIMES.map(t => ({
      t: t,
      disabled: biz.isBooked(this.data.doctorId, this.data.date, t, db.appointments)
    }))
    this.setData({ slotList: list })
  },
  pickDoctor(e) {
    this.setData({ doctorId: e.currentTarget.dataset.id, time: '', step: 2 }, () => this.refreshSlots())
  },
  pickDate(e) {
    this.setData({ date: e.currentTarget.dataset.d, time: '', step: 3 }, () => this.refreshSlots())
  },
  pickTime(e) {
    if (e.currentTarget.dataset.disabled) return
    this.setData({ time: e.currentTarget.dataset.t, step: 4 })
  },
  onName(e) { this.setData({ name: e.detail.value }) },
  onPhone(e) { this.setData({ phone: e.detail.value }) },
  onNote(e) { this.setData({ note: e.detail.value }) },
  submit() {
    if (!this.data.name.trim() || !this.data.phone.trim()) {
      wx.showToast({ title: '请填写姓名和手机号', icon: 'none' }); return
    }
    const r = biz.bookAppointment(
      { name: this.data.name, phone: this.data.phone, note: this.data.note },
      this.data.doctorId, this.data.date, this.data.time
    )
    if (!r.ok) { wx.showToast({ title: r.msg, icon: 'none' }); return }
    wx.showToast({ title: '预约成功', icon: 'success' })
    setTimeout(() => wx.navigateTo({ url: '/pages/mine/mine' }), 800)
  }
})
