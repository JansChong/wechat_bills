// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

// 获取到数据库的引用
const db = cloud.database();
// 获取集合的引用
const bills = db.collection("bills");
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

    // 先查询数据库中是否存在今日账单 
    let res = await bills.where({
        // event.date
        date: new Date(event.date)
    }).get();


    // 如果账单不存在 res = { data: [] }
    if (res.data.length == 0) {

        // 判断是收入还是支出
        if (event.moneyStr > 0) {
            var expend = event.moneyStr;
        } else {
            var income = event.moneyStr;
        }
        // 新建账单
        return await bills.add({
            data: {
                // 数据一定要加 _openid(用户id)
                _openid,
                date: new Date(event.date),
                data: [event],
                expend: expend || 0,
                income: income || 0,
                
                dayExpendTypes: !expend ? {} : { // 每日支出排行榜
                    [event.type]: {
                        "type": event.type,
                        "value": event.moneyStr,
                        "iconPath": event.iconPath
                    }
                },
                dayIncomeTypes: !income ? {} : { // 每日收入排行榜
                    [event.type]: {
                        "type": event.type,
                        "value": event.moneyStr,
                        "iconPath": event.iconPath
                    }
                },

            }
        })
    }
    // 如果存在 res = { data: [{}] }
    else {
        // 动态键名, 记录收入或支出
        var key = "";

        // 判断是收入还是支出
        if (event.moneyStr > 0) {
            key = "Expend"
        } else {
            key = "Income"
        }

        // 账单+1
        return await bills.doc(res.data[0]._id).update({
            data: {
                // 新数据插入data
                data: _.unshift(event),
                // 金额自增
                [key.toLocaleLowerCase()]: _.inc(event.moneyStr),

                // 修改每日条目的数据 => 如果不存在类目则新增, 如果存在金额就自增
                ["day" + key + "Types." + event.type + ".type"]: event.type,
                ["day" + key + "Types." + event.type + ".value"]: _.inc(event.moneyStr),
                ["day" + key + "Types." + event.type + ".iconPath"]: event.iconPath
            }
        })
    }



}