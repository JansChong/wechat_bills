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
  return await bills.where({
      _id: _.neq("")
  }).remove();
}