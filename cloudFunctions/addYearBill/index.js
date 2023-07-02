// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

// 日志
const log = cloud.logger();

// 获取到数据库的引用
const db = cloud.database();
// 获取集合的引用
const yearBills = db.collection("yearBills");
// 查询对象
const _ = db.command;



// 云函数入口函数
exports.main = async (event, context) => {
    // 解构用户信息, 拿到 openId
    let {
        userInfo: {
            openId: _openid
        }
    } = event;
    delete event.userInfo;
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
    var date = event.date.split("-")[1];
    var enMonth =
        date == 1 ? "Jan" :
        date == 2 ? "Feb" :
        date == 3 ? "Mar" :
        date == 4 ? "Apr" :
        date == 5 ? "May" :
        date == 6 ? "Jun" :
        date == 7 ? "Jul" :
        date == 8 ? "Aug" :
        date == 9 ? "Sep" :
        date == 10 ? "Oct" :
        date == 11 ? "Nov" : "Dec";

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
                yearExpendTypes: key == "Expend" ? {
                    [event.type]: {
                        "type": event.type,
                        "value": event.moneyStr,
                        "iconPath": event.iconPath
                    },
                } : {},
                // 年度收入排行版
                yearIncomeTypes: key == "Income" ? {
                    [event.type]: {
                        "type": event.type,
                        "value": event.moneyStr,
                        "iconPath": event.iconPath
                    },
                } : {},

                // 每一个月份的数据
                everyMonth: {
                    [enMonth]: {
                        month: Number(date), //月份
                        monthExpend: key == "Expend" ? event.moneyStr : 0,
                        monthIncome: key == "Income" ? event.moneyStr : 0,
                        monthExpendTypes: key == "Expend" ? {
                            [event.type]: {
                                "type": event.type,
                                "value": event.moneyStr,
                                "iconPath": event.iconPath
                            },
                        } : {},
                        monthIncomeTypes: key == "Income" ? {
                            [event.type]: {
                                "type": event.type,
                                "value": event.moneyStr,
                                "iconPath": event.iconPath
                            },
                        } : {},
                    }
                }
            }
        })
    }
    // 年度账单存在, 自增
    else {
        // 判断是收入或支出

        return await yearBills.doc(res.data[0]._id).update({
            data: {
                // 月份
                ["everyMonth." + enMonth + ".month"]: Number(date),
                // 收入或支出 monthExpend
                ["everyMonth." + enMonth + ".month" + key]: _.inc(event.moneyStr),

                // 收入或支出 monthExpend.type
                ["everyMonth." + enMonth + ".month" + key + "Types." + event.type + ".type"]: event.type,
                // 收入或支出 monthExpend.value
                ["everyMonth." + enMonth + ".month" + key + "Types." + event.type + ".value"]: _.inc(event.moneyStr),
                ["everyMonth." + enMonth + ".month" + key + "Types." + event.type + ".iconPath"]: event.iconPath,
                
                ["year" + key + "Types" + "." + event.type + ".type"]: event.type,
                ["year" + key + "Types" + "." + event.type + ".value"]: _.inc(event.moneyStr),
                ["year" + key + "Types" + "." + event.type + ".iconPath"]:  event.iconPath

            }
        })
    }
}



// 年的数据格式
// year: 2022; // 年
// yearExpend: { // 年度支出排行版
//     "条目1": {},
//     "条目2": {} 
// }
// yearIncome: { // 年度收入排行版
//     "条目1": {} ,
//     "条目2": {} 
// }

// everyMonth: { "Jan": {
//     month: 1, //月份
//     monthExpend: "月支出",
//     monthIncome: "月收入",
//     monthExpendTypes: { // 月度支出排行版
//         "条目1": {type: "", value},
//         "条目2": {type: "", value} 
//     },
//     monthincomeTypes: { // 月度支出排行版
//         "条目1": {type: "", value},
//         "条目2": {type: "", value} 
//     },
// }}