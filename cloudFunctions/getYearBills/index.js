// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const yearBills = db.collection("yearBills");
const _ = db.command;

// 云函数入口函数
exports.main = async (evt) => {

    return await yearBills.where({
        year: evt.year,
    }).get()
}