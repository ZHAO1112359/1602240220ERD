const store = require('./utils/store.js')

App({
  onLaunch() {
    // 首次启动时初始化演示数据到本地存储（模拟数据库）
    store.initIfNeeded()
  },
  globalData: {}
})
