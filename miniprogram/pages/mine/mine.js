import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const db = wx.cloud.database();
const user = db.collection("user");

// 用户头像
let userAvatar = "";
let openId = "";

Page({
    data: {
        sex: "male",
        birthday: "",
        city: "",

        // 默认头像
        defaultAvatarUrl: "../../assets/icons/avatar.png",
        // 用于修改临时头像
        temAvatarUrl: "",

        showShare: false,
        showPopup: false,


        options: [{
                name: '微信',
                icon: 'wechat',
                openType: 'share'
            },
            {
                name: '微博',
                icon: 'weibo'
            },
            {
                name: 'QQ',
                icon: 'qq',
            },
            {
                name: '复制链接',
                icon: 'link'
            },
            {
                name: '分享海报',
                icon: 'poster'
            },
            {
                name: '小程序',
                icon: 'weapp-qrcode',
                openType: 'share'
            },
        ],
    },
    onLoad() {
        // 进入页面执行的方法
        this.enterView();
    },

    // 进入页面, 获取用户数据
    async enterView() {
        // 获取用户openId
        // openId是用户id, 每个用户的openId唯一的
        // o7Ez_47YYb69zDdKuszPBcx6zhcg 小
        // o7Ez_4-0XdLJIecJ0jqF4u55CIpk 主
        openId = await wx.cloud.callFunction({
            name: "getUserOpenId"
        }).then(res => res.result.openid);

        // 通过openid, 获取用户信息
        let userInfo = await user.doc(openId).get()
            .then(res => res.data)
            .catch(err => new Object())

        console.log(userInfo);

        // 用户数据发送到视图层
        this.setData({
            userInfo,
            // 有了自己的头像, 清空默认头像
            defaultAvatarUrl: userInfo.avatarUrl ? "" : "../../assets/icons/avatar.png"
        })
    },

    // 显示分享面板
    onShare(event) {
        this.setData({
            showShare: true
        });
    },

    // 显示弹出层的方法
    showPopup() {
        this.setData({
            showPopup: true
        });
    },
    // 取消弹出层
    onClose() {
        this.setData({
            showShare: false,
            showPopup: false
        });
    },

    // 选中分享方式
    onSelect(event) {
        Toast(event.detail.name);
        this.onClose();
    },
    // 选中性别
    onSelectSex(evt) {
        console.log(evt.detail);
        this.setData({
            sex: evt.detail
        })
    },

    // 修改生日
    changBirthday(evt) {
        console.log(evt);
        this.setData({
            birthday: evt.detail.value
        })
    },
    // 修改地区
    changCity(evt) {
        console.log(evt);
        this.setData({
            city: evt.detail.value.join("")
        })
    },

    // 获取用户头像
    getAvatar(evt) {
        userAvatar = evt.detail.avatarUrl;

        this.setData({
            temAvatarUrl: userAvatar
        })
    },

    // 提交表单数据
    onFinish(evt) {
        wx.showModal({
            content: '确认更新个人信息?',
            complete: (res) => {
                // 点击确定
                if (res.confirm) {
                    this.onSubmit(evt.detail.value)
                }
            }
        })

    },

    // 上传头像和用户数据
    async onSubmit(obj) {
        // 删除两个无用的属性
        delete obj.male;
        delete obj.female;

        // 如果没有更改头像, 只需要更新局部数据
        if (!userAvatar) {
            // 把用户数据 更新 到 user数据库 的记录中
            user.doc(openId).update({
                data: obj
            }).then(res => {
                console.log(res)
                // 更新数据
                this.enterView();
            })
        } else {


            // 先删除原来的头像
            await wx.cloud.deleteFile({
                    fileList: [this.data.userInfo.avatarUrl]
                }).then(res => console.log("删除成功"))
                .catch(err => {})

            // 点击保存按钮, 先把用户头像上传到云存储, 然后才可以得到永久的云文件id 而不是文件的临时路径
            let fileID = await wx.cloud.uploadFile({
                    cloudPath: 'userAvatar/' + Date.now() + '.png', // 文件夹/文件名.文件后缀
                    filePath: userAvatar, // 文件的临时路径
                }).then(res => res.fileID)
                .catch(err => "")

            console.log(fileID);

            // 用户头像 换成 云存储的文件id
            obj.avatarUrl = fileID;

            // 把用户数据 更新 到 user数据库 的记录中
            user.doc(openId).set({
                data: obj
            }).then(res => {
                console.log(res)
                // 更新数据
                this.enterView();
            })

        }


        // 关闭弹出层
        this.setData({
            showPopup: false
        })
    }
});