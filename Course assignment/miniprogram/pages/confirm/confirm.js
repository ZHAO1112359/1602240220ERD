const biz = require('../../utils/biz.js')
Page({
  data: { a: null, resultText: biz.RESULT_TEXT },
  onLoad(options) {
    const a = biz.getAppointment(options.id)
    if (a) this.setData({ a: Object.assign({}, a, { doctor: biz.doctorName(a.doctorId) }) })
  },
  doConfirm(e) {
    const r = biz.confirmAppointment(this.data.a.id, e.currentTarget.dataset.r)
    if (!r.ok) { wx.showToast({ title: r.msg, icon: 'none' }); return }
    wx.showToast({ title: r.msg, icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1000)
  }
})
