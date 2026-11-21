const biz = require('../../utils/biz.js')
Page({
  data: { list: [], doctorName: biz.doctorName },
  onShow() { this.load() },
  load() {
    const list = biz.buildPendingList().map(a => Object.assign({}, a, {
      doctor: biz.doctorName(a.doctorId), statusText: biz.STATUS_TEXT[a.status]
    }))
    this.setData({ list: list })
  },
  goConfirm(e) { wx.navigateTo({ url: '/pages/confirm/confirm?id=' + e.currentTarget.dataset.id }) },
  goAll() { wx.navigateTo({ url: '/pages/all/all' }) },
  goStats() { wx.navigateTo({ url: '/pages/stats/stats' }) }
})
