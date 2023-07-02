// app.js
App({
    /**
     * 小程序初始化(全局只触发一次)
     */
    onLaunch(){
        if(!wx.cloud){ // 如果不支持 wx.cloud
            wx.showToast({
              title: '当前版本不支持云开发, 请升级基础调试库2.2.3及以上',
            })
        }else{
            wx.cloud.init({
                env: "test-7g6ahfy1fcdf72f9"
            })
        }
    }
})
