module.exports = zn.ControllerService({
    methods: {
        init: function (context, application){
            this.context = context;
            this.application = application;
        },
        refundApplySuccess: function (event, data){
            var wx = this.context.wx;
            console.log(event, data);
            return wx.accessTokenRequest('template.send', {
                touser: data.enroll_user_User_WXOpenID,
                template_id: "_aFYizrJS7NuZmRzkf9AfMey5RHt9mC4Y8cDzq75jHQ",
                topcolor: "#FF0000",
                data: {
                    first: {
                        value: "您的活动“" + event.zxnz_Label + "”报名费退款申请已处理，请注意查收。",
                        color: "#173177"
                    },
                    keyword1: {
                        value: data.refund_desc,
                        color: "#173177"
                    },
                    keyword2: {
                        value: '￥' + (+data.refund_fee * 100).toFixed(2) + '元',
                        color: "#173177"
                    },
                    remark: {
                        value: "备注：如有疑问，请致电活动负责人。",
                        color: "#173177"
                    }
                }
            });
        },
        refundSuccess: function (event, data){
            var wx = this.context.wx;
            return wx.accessTokenRequest('template.send', {
                touser: data.enroll_user_User_WXOpenID,
                template_id: "ccDWkzYwoLqUsowncks6xvjUdNJ6WEcloR2w-3OhaeI",
                topcolor: "#FF0000",
                data: {
                    first: {
                        value: "您的订单退款成功，请注意查收",
                        color: "#173177"
                    },
                    keyword1: {
                        value: data.Payment_Order_Code,
                        color: "#173177"
                    },
                    keyword2: {
                        value: event.zxnz_Label,
                        color: "#173177"
                    },
                    keyword3: {
                        value: data.Payment_Refund_Fee,
                        color: "#173177"
                    },
                    remark: {
                        value: "感谢您的支持！",
                        color: "#173177"
                    }
                }
            });
        }
    }
});