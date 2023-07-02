import * as echarts from '../../components/ec-canvas/echarts.min';
import {fillMonth} from "../../utils/fillMonth";


// 获取数据库的引用
const db = wx.cloud.database();
// 账单集合
const bills = db.collection("bills");
const yearBills = db.collection("yearBills");
// 查询实例
const _ = db.command;

// 收入 or 支出
let isIncome = 0;
let rore = "支出";
// 周  月  年
let range = 0;

// 图表的初始化对象
let chart;
// 图表数据
let series = [];
let echartTitle;
let echartGrid;


// 这个方法初始化比较晚, 在初始化之前 把 series 和 echartTitle 构造好即可
function initChart(canvas, width, height, dpr) {
    chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // 像素
    });
    canvas.setChart(chart);

    // 图标的 setOption 对象
    var option = {
        color: ['#3d3a4f', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
        grid: {
            right: 45,
            ...echartGrid
        },
        title: {
            padding: [10, 5],
            textStyle: {
                fontWeight: "normal",
                fontSize: "14px",
                color: "#555"
            },
            ...echartTitle
        },
        xAxis: {
            // 是否显示x坐标轴
            show: true,

            // 'category' 类目轴，适用于离散的类目数据。
            // 'value' 数值轴，适用于连续数据。
            // 'time' 时间轴，
            // 'log' 对数轴。
            type: "time",

            name: "日期", // x轴名称
            nameLocation: "end", // x轴位置 start | center(middle) | end
            nameTextStylt: {
                color: "#555",
                fontSize: "14px"
            }, // x轴名称的样式
            nameGap: 15, // 名称和轴线的距离

            // 类目轴中 boundaryGap 可以配置为 true 和 false。默认为 true，这时候刻度只是作为分隔线，标签和数据点都会在两个刻度之间的带(band)中间。
            // boundaryGap: true,
            // 非类目轴，包括时间，数值，对数轴，boundaryGap是一个两个值的数组，分别表示数据最小值和最大值的延伸范围，可以直接设置数值或者相对的百分比，在设置 min 和 max 后无效
            boundaryGap: ["0%", "0%"], // 非类目轴, 把x坐标分成等分成两份, 每一份分100%, 然后按照百分比决定数据的显示区间

            // 定义 x坐标轴的最小刻度和最大刻度 (建议由数据自动分配)
            // min: "2022-12-9",
            // max: "2022-12-11"

            // 坐标轴的分割段数，需要注意的是这个分割段数只是个预估值，最后实际显示的段数会在这个基础上根据分割后坐标轴刻度显示的易读程度作调整。
            // splitNumber: 12,

            // x坐标轴的最小间隔大小 和 最大间隔大小
            minInterval: 3600 * 24 * 1000, // 两天作为一个最小刻度 (显示的刻度最小不可以小于两天 <即刻度不能一天一天显示> )
            // maxInterval: 3600 * 12 * 1000,  // 一天作为一个最大刻度, (即显示的刻度不能大于1天)
            // interval: 3600 * 12 * 1000,

            // 坐标轴是否是静态无法交互。
            // silent: false,

            // 坐标轴的标签是否响应和触发鼠标事件
            // triggerEvent: false,

            // 坐标轴线相关配置
            axisLine: {
                // 是否显示坐标轴线
                show: true,

                // 设置轴线两边的箭头 "none" || "arrow",
                // symbol: "arrow", // 当值为一个字符串, 表示左右箭头都相同
                symbol: ["none", "arrow"], // 当值为一个长度为2的数组时, 分别表示左右两端的箭头
                symbolSize: 5,
            },

            // 坐标轴 刻度相关配置
            axisTick: {
                // 刻度朝向
                inside: true,
                // 刻度长度
                length: 6,
                // 刻度的样式
                lineStyle: {},
            },

            // 坐标轴 刻度标签相关配置
            axisLabel: {
                // 刻度标签与轴线之间的距离
                margin: 8,

                // 刻度标签的内容格式器  string || Function
                // formatter: "{value}kg",

                // formatter: function(val, idx){
                //   // 格式化刻度标签
                //   const date = new Date(val);
                //   const text = [date.getMonth()+1, date.getDate()].join("月") + "日";
                //   return text; // 12月9日
                // }

                // 对于时间轴（type: 'time'），formatter 的字符串模板支持多种形式：
                // formatter: "{MM}月{dd}日",
                formatter: "{dd}日",
            },

            // 类目数据，在类目轴（type: 'category'）中有效。
            // data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
        },
        yAxis: {},
        // 图表的数据
        series
    };
    chart.setOption(option);
    return chart;
}

Page({
    data: {
        // echarts对象, 这里初始化
        ec: {
            onInit: initChart
        },

        // 收入或支出
        rore,

        // 排行版
        showList: []
    },

    // 切换收入支出的方法
    toggleIsIncome(evt) {
        isIncome = evt.detail.index; // 标签页的索引
        rore = isIncome ? "收入" : "支出"

        this.setData({
            rore
        })

        this.getEchartDate()
    },

    // 切换日期的方法
    toggleDate(evt) {
        range = evt.detail.index;
        this.getEchartDate()
    },
    onLoad() {
        console.log("页面加载");
        this.setData({
            ec: {
                onInit: initChart
            },
        })
        console.log("162".chart);

    },

    // 页面显示, 更新数据
    onShow() {
        console.log("页面显示");
        // 调用图表数据
        this.getEchartDate();
        console.log("171", chart);
    },

    // 获取 周和月 数据的方法
    getEchartDate() {
        // 默认查询 一周(week)的支出(false)
        // console.log(isIncome, range); // 0支出  0周

        // 获取到页面的初始数据(周)
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth(); // 11
        let date = today.getDate();

        // 查询条件 (周, 月, 年)
        let condition;
        // 收入支出
        let str = isIncome ? "income" : "expend";
        series = [];

        // 获取一周或者一个月
        switch (range) {
            // 获取7天
            case 0:
                condition = _.gte(new Date(year, month, date - 6)).and(_.lt(new Date(year, month, date + 1)));
                break;
            // 获取30天
            case 1:
                condition = _.gte(new Date(year, month, 1)).and(_.lt(new Date(year, month + 1, 1)));
                break;
            // 获取一年的数据
            case 2:
                // 处理年的数据
                this.getYearDate()
                return;
        }

        // 查询的账单 (周或月)
        bills.where({
            date: condition
        }).orderBy("date", "desc").get().then(res => {

            // 修改总金额
            this.changeTotal(res.data);

            // 图表数据 [, 29, 27, 24]  缺30, 28, 26, 25
            let echartData = {
                // data:[['2022/12/23', 249], ['2022/12/24', 72],['2022/12/25', 316], ['2022/12/26', "0"], ['2022/12/27', "0"], ['2022/12/28', 69]],
                type: "line"
            }

            // 弥补账单空日期
            // 图表数据 15, 8, 3, 1
            // console.log("周月数据 =>", res.data);

            let copyResData = [...res.data];

            // 一天
            let oneday = 24 * 3600 * 1000;
            // 自减日期:  --count * oneDay
            let count = 0;

            // 根据 周 或者 月 计算天数
            let length = range == 0 ? 7 : (new Date(year, month + 1) - new Date(year, month)) / (24 * 3600 * 1000);

            // 开始的日期
            let start = range == 0 ? today : new Date(new Date(year, month + 1).getTime() - oneday);

            for (let i = 0; i < length; i++) {
                // 如果没有日期 // 31号 => []
                if (!copyResData[i]) {
                    copyResData.splice(i, 0, {
                        date: new Date(start.getTime() + oneday * count),
                        [str]: 0
                    })
                }
                // 如果日期对不上
                else if (copyResData[i].date.getDate() != new Date(start.getTime() + oneday * count).getDate()) {
                    copyResData.splice(i, 0, {
                        date: new Date(start.getTime() + oneday * count),
                        [str]: 0
                    })
                }
                count--;
            }
            // console.log(copyResData);


            // 构造图表所需的 series.data
            echartData.data = copyResData.map(v => {
                // 日期 支出
                return [v.date.toLocaleDateString(), Math.abs(v[str])]
            })
            // console.log(echartData);
            // 把对象插入图表数据中 // [{data, name, type}]
            series.push(echartData);

            // 如果echarts已经初始化了
            if (chart) {
                // 只更新图表
                chart.setOption({
                    // 动态修改日期
                    xAxis: {
                        axisLabel: {
                            formatter: "{dd}日",
                        }
                    },
                    series: series
                })
            }
        })
    },

    // 获取一年的数据
    getYearDate() {
        series = [];

        yearBills.where({
            year: _.eq(String(new Date().getFullYear()))
        }).get().then(res => {
            console.log(res);
            // 计算总金额
            this.changeTotal(res.data);

            // echarts需要的年度数据
            let echartData = {
                // data:[['2022/12/23', 249], ['2022/12/24', 72],['2022/12/25', 316], ['2022/12/26', "0"], ['2022/12/27', "0"], ['2022/12/28', 69]],
                type: "line"
            }
            // 收入支出
            let str = isIncome ? "Income" : "Expend";

            // 日期补全 
            let monthArr = fillMonth(res.data[0], new Date().getFullYear())
            console.log("每月数组 =>", monthArr);

            echartData.data = monthArr.map(v => {
                return [String(`${new Date().getFullYear()}-${v.month}-1`), Math.abs(v["month" + str] || 0)]
            })
            // console.log("echarts图表_年度 =>", echartData.data);

            // 修改表格数据
            chart.setOption({
                // 动态修改日期
                xAxis: {
                    axisLabel: {
                        formatter: "{M}月",
                    }
                },
                // 数据
                series: [echartData]
            })

        })
    },

    // 修改 总金额 和 排行版 的列表
    changeTotal(arr) {
        // console.log(arr);

        // 计算一个月有几天的参数
        let year = new Date().getFullYear();
        let month = new Date().getMonth();

        // 判断是 (周)月、 年
        let str = "";
        // 总金额
        let total = 0;
        // 平均数的除数 
        let num;
        // 图表的表头
        let title;

        // 收支排行榜
        let list = {};
        let showList = [];

        // 周
        if (range == 0) {
            str += "day"
            num = 7; // 一周有7天
            title = "最近7天"
        }
        // 月
        else if (range == 1) {
            str += "day"
            // 计算一个月有几天
            num = (new Date(year, month + 1) - new Date(year, month)) / (24 * 3600 * 1000);
            title = (month + 1) + "月份"
        }
        // 年
        else {
            str += "year"
            num = 12; // 一年有12个月份
            title = year + "年"
        };

        // 是收入还是支出
        str += isIncome ? "Income" : "Expend";

        for (let v of arr) { // arr = [{},{},{}]
            // console.log(v); // { }
            let puppet = v[str + "Types"];

            // 遍历收入或支出对象
            for (let i in puppet) {
                // 判断当前的属性是否在list 对象中
                if (i in list) {
                    list[i].value += Math.abs(puppet[i].value);
                } else {
                    list[i] = puppet[i]
                    // 修改收入, 变成正数
                    list[i].value = Math.abs(puppet[i].value)
                }

                // 总金额累加
                total += Math.abs(puppet[i].value);
            }
        }
        console.log(list);
        for (let i in list) {
            showList.push(list[i])
        }
        
        // 排序
        for (var i = 0; i < showList.length - 1; i++) {
            for (var j = 0; j < showList.length - 1 - i; j++) {
                if (showList[j].value < showList[j + 1].value) {
                    let temp = showList[j];
                    showList[j] = showList[j + 1];
                    showList[j + 1] = temp;
                }
            }
        }
        console.log(showList);

        this.setData({
            showList,
            title
        })

        echartGrid = {
            left: total >= 1000 ? "50" : "40",
        }

        // 初始化echarts用的title
        echartTitle = {
            text: `总${rore}: ${total}`,
            subtext: `平均值: ${(total / num).toFixed(2)}${range == 2 ? "元/月" : "元/天"}`
        }

        // 点击切换用的title
        if (chart) {
            chart.setOption({
                title: echartTitle,
                grid: echartGrid
            })
        }


    }
});
