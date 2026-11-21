const biz = require('../../utils/biz.js')
Page({
  data: { list: [], doctorName: biz.doctorName },
  onShow() {
    const list = biz.allAppointments().map(a => Object.assign({}, a, {
      doctor: biz.doctorName(a.doctorId), statusText: biz.STATUS_TEXT[a.status],
      resultText: a.confirmResult ? biz.RESULT_TEXT[a.confirmResult] : ''
    }))
    this.setData({ list: list })
  }
})
