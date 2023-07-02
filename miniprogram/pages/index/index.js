// 数据库的引用
const db = wx.cloud.database();
// 集合的引用
const bills = db.collection("bills");
// 查询对象实例
const _ = db.command;

Page({
    data: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
    },

    // 修改时间选择器
    bindDateChange(evt) {
        let arr = evt.detail.value.split("-"); // [2022, 12]

        // 修改页面的初始数据
        this.setData({
            year: arr[0], // 2022
            month: arr[1] // 12
        })

        this.getBillByMonth();

    },

    // 根据月份获取账单
    getBillByMonth() {

        // 对数据进行降序排序并返回  语法: collection.orderBy(value, string).get()
        bills.where({
            // year month    2022-12-1 >= date > 2022-13-1
            date: _.gte(new Date(this.data.year, this.data.month-1, 1)).and(_.lt(new Date(this.data.year, this.data.month, 1)))
        }).orderBy("date", "desc").get().then(res => {
            // 把日期对象, 转字符串
            for (var i = 0; i < res.data.length; i++) {
                res.data[i].date = res.data[i].date.toLocaleDateString();
            }

            console.log(res.data);
            // 数据发送到视图层
            this.setData({
                bills: res.data
            })
        })
    },

    /**
     * 页面显示
     */
    onShow() {
        // 根据月份获取账单
        this.getBillByMonth();
    }
});