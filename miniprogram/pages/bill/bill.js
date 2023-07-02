import {fillMonth} from "../../utils/fillMonth"


Page({

    data: {
        year: new Date().getFullYear()
    },

    onShow() {
        // 获取年度账单
        this.getYearBill();
    },

    // 日期选择器修改年份
    changeYear(v) {
        this.setData({
            year: v.detail.value
        })

        // 根据年份获取年度账单
        this.getYearBill(v.detail.value);
    },


    // 清空 bills 数据库
    delAll() {
        wx.cloud.callFunction({
            name: "delAllBills",
            success: res => console.log(res)
        })
    },

    // 获取年度账单
    getYearBill(year = new Date().getFullYear()) {
        year = String(year);

        wx.cloud.callFunction({
            name: 'getYearBills',
            // 传递给云函数的 event 参数
            data: {year}
        }).then(res => {
            res = res.result;
            console.log("拿到指定年份的账单", res); // {data: array(0)}  或 {data: array(1)} 
            

            // 月份补全
            let monthArr = fillMonth(res.data[0], year)
            console.log(monthArr);

            // 年度收入 和 年度支出
            let yearExpend = 0;
            let yearIncome = 0;

            // res.data = [] 或 [{2022},{2023}]
            // 如果有年度数据, 才计算
            if(res.data.length){
                let obj = res.data[0].everyMonth;
                for(let key in obj){
                    
                    // 如果某个月份只有支出或收入
                    obj[key].monthExpend = obj[key].monthExpend || 0;
                    obj[key].monthIncome = obj[key].monthIncome || 0;
                    
                    yearExpend += obj[key].monthExpend;
                    yearIncome += Math.abs(obj[key].monthIncome || 0);
                }
            }

            // 把月份数组发送到视图层
            this.setData({
                monthArr,
                yearExpend: yearExpend.toFixed(2),
                yearIncome: yearIncome.toFixed(2)
            })

            



        })
    }
});