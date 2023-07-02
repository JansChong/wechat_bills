// data 即 res.data
module.exports.fillMonth = function (data, year) {
    // 每个月份的数组
    let monthArr = [];
    // 开始日期
    let start = new Date(year, 11);

    // res.data[0] 传参 => data => undefined
    // 把获取到的数据的月份, 存入数组中
    if (data) {
        for (let key in data.everyMonth) {
            monthArr.push(data.everyMonth[key])
        }
    }

    for (var i = 0; i < monthArr.length - 1; i++) {
        for (var j = 0; j < monthArr.length - 1 - i; j++) {
            if (monthArr[j].month < monthArr[j + 1].month) {
                let temp = monthArr[j];
                monthArr[j] = monthArr[j + 1];
                monthArr[j + 1] = temp;
            }
        }
    }
    // console.log("3个月", monthArr); [{12}, {2}, {1}]

    // 遍历月份数组, 月份补全 [{}]
    for (var i = 0; i < 12; i++) {
        // 如果今年没有月份数据, 就是空数组
        if (!monthArr[i] || monthArr[i].month != start.getMonth() + 1 - i) {
            let obj = {
                month: start.getMonth() + 1 - i,
                monthExpend: 0,
                monthIncome: 0,
            }
            monthArr.splice(i, 0, obj)
        }
    }

    return monthArr;
}