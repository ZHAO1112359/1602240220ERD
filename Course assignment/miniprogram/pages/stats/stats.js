const biz = require('../../utils/biz.js')
Page({
  data: { stats: {}, target: '≤ 5%' },
  onShow() { this.setData({ stats: biz.getStats() }) }
})
