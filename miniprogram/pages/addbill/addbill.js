// 图标的基准路径
const baseIconUrl = "../../assets/icons/";

// 构建账单对象 {条目, 金额, 日期, 图标}
let bill = {
    // 金额字符串 (给自定义键盘输入的)
    moneyStr: "",
}

// 数据库 bills表
const bills = wx.cloud.database().collection("bills");
// 查询对象实例
const _ = wx.cloud.database().command;

// 是否是收入账单  false支出, true收入
let isIncome = false;


Page({
    // 初始数据
    data: {
        // 条目
        type: "",
        // 弹出层
        showPopUp: false,
        // 支出条目数据
        entry: [{
            type: "餐饮",
            iconPath: baseIconUrl + "canyin.png"
        }, {
            type: "购物",
            iconPath: baseIconUrl + "gouwu.png"
        }, {
            type: "日用",
            iconPath: baseIconUrl + "zhijin.png"
        }, {
            type: "交通",
            iconPath: baseIconUrl + "gonggongjiaotong.png"
        }, {
            type: "蔬菜",
            iconPath: baseIconUrl + "chishucai.png"
        }, {
            type: "水果",
            iconPath: baseIconUrl + "shuiguo.png"
        }, {
            type: "零食",
            iconPath: baseIconUrl + "snacks.png"
        }, {
            type: "运动",
            iconPath: baseIconUrl + "qihang.png"
        }, {
            type: "娱乐",
            iconPath: baseIconUrl + "changge.png"
        }, {
            type: "通信",
            iconPath: baseIconUrl + "dianhua.png"
        }, {
            type: "服饰",
            iconPath: baseIconUrl + "yifu.png"
        }, {
            type: "美容",
            iconPath: baseIconUrl + "meirongxihu.png"
        }, {
            type: "住房",
            iconPath: baseIconUrl + "zhufang.png"
        }, {
            type: "居家",
            iconPath: baseIconUrl + "jujia.png"
        }, {
            type: "孩子",
            iconPath: baseIconUrl + "paxingdeyinger.png"
        }, {
            type: "长辈",
            iconPath: baseIconUrl + "changbei.png"
        }, {
            type: "社交",
            iconPath: baseIconUrl + "gouwu.png"
        }, {
            type: "旅行",
            iconPath: baseIconUrl + "lvhang-.png"
        }, {
            type: "烟酒",
            iconPath: baseIconUrl + "yanjiu.png"
        }, {
            type: "数码",
            iconPath: baseIconUrl + "shumatubiaozhizuochunsezhuanqu-.png"
        }, {
            type: "汽车",
            iconPath: baseIconUrl + "iconfontzhizuobiaozhun06.png"
        }, {
            type: "医疗",
            iconPath: baseIconUrl + "yiliao.png"
        }, {
            type: "书籍",
            iconPath: baseIconUrl + "shuji.png"
        }, {
            type: "学习",
            iconPath: baseIconUrl + "xuexi.png"
        }, {
            type: "宠物",
            iconPath: baseIconUrl + "chongwu.png"
        }, {
            type: "礼金",
            iconPath: baseIconUrl + "cash-gift.png"
        }, {
            type: "礼物",
            iconPath: baseIconUrl + "liwuhuodong.png"
        }, {
            type: "办公",
            iconPath: baseIconUrl + "bangong.png"
        }, {
            type: "维修",
            iconPath: baseIconUrl + "weixiu.png"
        }, {
            type: "捐赠",
            iconPath: baseIconUrl + "gongyijuankuan.png"
        }, {
            type: "彩票",
            iconPath: baseIconUrl + "caipiao.png"
        }, {
            type: "亲友",
            iconPath: baseIconUrl + "pengyou.png"
        }, {
            type: "快递",
            iconPath: baseIconUrl + "kuaidiyuan-xianxing.png"
        }, {
            type: "其他",
            iconPath: baseIconUrl + "qitachuku.png"
        }],
        // 收入条目数据
        incomeEntry: [{
            type: "工资",
            iconPath: baseIconUrl + "gongzi.png"
        }, {
            type: "兼职",
            iconPath: baseIconUrl + "jianzhi.png"
        }, {
            type: "理财",
            iconPath: baseIconUrl + "licai.png"
        }, {
            type: "礼金",
            iconPath: baseIconUrl + "cash-gift.png"
        }, {
            type: "其他",
            iconPath: baseIconUrl + "qitaruku.png"
        }],
        // 键盘输入金额
        money: 0,
        // 账单的时间
        date: "今天"
    },

    // 切换标签页的方法
    onChangeTab(evt) {},
    // 关闭弹出层
    onClosePopUp() {
        this.setData({
            showPopUp: false
        })
    },

    // 点击键盘
    onkeyboard(evt) {
        let key = evt.target.dataset.key;
        console.log(key);

        if (!isNaN(key)) { // 点击数字
            bill.moneyStr += key;

        } else if (key == "删除") { // 删除按钮
            bill.moneyStr = bill.moneyStr.slice(0, -1);

        } else if (key == "完成") { // 完成按钮

            // 金额不能为0 
            if (!bill.moneyStr) {
                wx.showToast({
                    title: "金额不能为0",
                    icon: "error"
                })
                return;
            }

            // in运算 判断一个属性是否在对象中
            // 判断账单中是否有日期, 如果没有日期
            if (!("date" in bill)) {
                // 以今天作为日期
                bill.date = new Date().toLocaleDateString().replace(/\//g, "-");
            }

            // 判断 收入还是支出
            if (isIncome) { // 收入
                bill.moneyStr = -1 * bill.moneyStr;
            }

            // 把账单插入到数据库...
            // 调用云函数
            wx.cloud.callFunction({
                // 要调用的云函数的名称
                name: "addOneBill",
                // 云函数的参数
                data: bill,
                success: res => {
                    // TODO.... 金额初始化
                    bill.moneyStr = "";
                    bill.text = "";

                    this.setData({
                        money: 0,
                        type: "",
                    })
                },
                fail: err => {
                    console.log(err);
                }
            })
            console.log(bill);
            wx.cloud.callFunction({
                // 要调用的云函数的名称
                name: "addYearBill",
                // 云函数的参数
                data: bill,
                success: res => {
                    console.log(res);
                },
                fail: err => {
                    console.log(err);
                }
            })
            // this.pupleCloud(bill);

            // 关闭弹出层
            this.setData({
                showPopUp: false,
            })

            return;
        }

        // 更新 金额字符串 到 data中
        this.setData({
            money: bill.moneyStr || 0
        })
    },

    // 修改账单日期
    bindDateChange(evt) {
        // 给账单对象添加一个修改后的日期
        bill.date = evt.detail.value
        // console.log(bill);

        this.setData({
            date: evt.detail.value
        })
    },

    // 修改账单条目
    changeBillText(evt) {
        // console.log(evt.detail.value);

        // 把输入的备注 替换掉 原本的条目
        bill.text = evt.detail.value
    },


    // 显示弹出层的方法
    addBill(evt) {
        // 条目数据 {type: "", iconPath: ""}
        // console.log(evt.currentTarget.dataset.entry);

        // 判断是否是收入  
        isIncome = evt.currentTarget.dataset.isincome;

        // 把当前的条目和图标, 加入账单对象中
        let {
            type,
            iconPath
        } = evt.currentTarget.dataset.entry;

        bill.type = type;
        bill.iconPath = iconPath;
        // console.log(bill);

        // 显示弹出层
        this.setData({
            showPopUp: true
        })
        // Object.assign()   {...obj}
    },

    async pupleCloud(event) { // 解构用户信息, 拿到 openId
        // let {
        //     userInfo: {
        //         openId: _openid
        //     }
        // } = event;
        // delete event.userInfo;
        // 把账单金额转number类型
        event.moneyStr = Number(event.moneyStr);

        // event = {moneyStr, type, iconPath, title}

        // 判断是收入还是支出
        let key;
        if (event.moneyStr > 0) { // 支出
            key = "Expend";
        } else {
            key = "Income"
        }

        // 判断是几月份 event.date => "2022-12-31"
        var enMonth;
        switch (event.date.split("-")[1]) {
            case "1":
                enMonth = "Jan"
                break;
            case "2":
                enMonth = "Feb"
                break;
            case "3":
                enMonth = "Mar"
                break;
            case "4":
                enMonth = "Apr"
                break;
            case "5":
                enMonth = "May"
                break;
            case "6":
                enMonth = "Jun"
                break;
            case "7":
                enMonth = "Jul"
                break;
            case "8":
                enMonth = "Aug"
                break;
            case "9":
                enMonth = "Sep"
                break;
            case "10":
                enMonth = "Oct"
                break;
            case "11":
                enMonth = "Nov"
                break;
            case "12":
                enMonth = "Dec"
                break;
        }
        console.log(enMonth);


        // 先查询数据库中是否存在今日账单 
        let res = await yearBills.where({
            // event.date => "2022-12-31"
            year: event.date.split("-").shift(),
        }).get();

        // 如果账单不存在 res = {data: []}
        if (res.data.length == 0) {

            return await yearBills.add({
                data: {
                    // 数据一定要加 _openid(用户id)
                    _openid,
                    // 年份 2022
                    year: event.date.split("-").shift(),

                    //  年度支出排行版
                    yearExpend: key == "Expend" ? {
                        [event.type]: {
                            "type": event.type,
                            "value": event.moneyStr
                        },
                    } : {},
                    // 年度收入排行版
                    yearIncome: key == "Income" ? {
                        [event.type]: {
                            "type": event.type,
                            "value": event.moneyStr
                        },
                    } : {},

                    // 每一个月份的数据
                    everyMonth: {
                        [enMonth]: {
                            month: event.date.split("-")[1], //月份
                            monthExpend: key == "Expend" ? event.moneyStr : 0,
                            monthIncome: key == "InCome" ? event.moneyStr : 0,
                            onthExpendTypes: key == "Expend" ? {
                                [event.type]: {
                                    "type": event.type,
                                    "value": event.moneyStr
                                },
                            } : {},
                            monthIncomeTypes: key == "Income" ? {
                                [event.type]: {
                                    "type": event.type,
                                    "value": event.moneyStr
                                },
                            } : {},
                        }
                    }
                }
            })
        } else {

        }
    }
});