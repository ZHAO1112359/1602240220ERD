const biz = require('../../utils/biz.js')
Page({
  data: { list: [], statusMap: biz.STATUS_TEXT, doctorName: biz.doctorName },
  onShow() {
    const list = biz.myAppointments().map(a => Object.assign({}, a, {
      statusText: biz.STATUS_TEXT[a.status], doctor: biz.doctorName(a.doctorId)
    }))
    this.setData({ list: list })
  },
  goBook() { wx.navigateTo({ url: '/pages/book/book' }) }
})
