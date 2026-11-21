const store = require('../../utils/store.js')
Page({
  data: {},
  onLoad() { store.initIfNeeded() },
  goPatient() { wx.navigateTo({ url: '/pages/book/book' }) },
  goStaff() { wx.navigateTo({ url: '/pages/pending/pending' }) },
  goMine() { wx.navigateTo({ url: '/pages/mine/mine' }) },
  goStats() { wx.navigateTo({ url: '/pages/stats/stats' }) },
  reset() {
    wx.showModal({
      title: '重置演示数据', content: '将恢复初始预约记录，确认继续？',
      success: (r) => {
        if (r.confirm) { store.resetDB(); wx.showToast({ title: '已重置', icon: 'success' }) }
      }
    })
  }
})
