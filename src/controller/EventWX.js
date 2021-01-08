var T_EVENT = "zxnz_enroll_merchant_Event";
var T_EVENT_FIELD = "zxnz_enroll_merchant_Event_Field";
var T_EVENT_ENROLL = "zxnz_enroll_user_User_Event_Enroll";
var T_EVENT_SUBSCRIBE = "zxnz_enroll_user_User_Event_Subscribe";
var T_WECHAT_USER = "zxnz_core_wechat_User";
var T_MERCHANT = "zxnz_enroll_merchant_Merchant";
var T_MERCHANT_SUBSCRIBE = "zxnz_enroll_user_User_Merchant_Subscribe";
var node_fs = require('fs');
var node_path = require('path');
var EventWXTemplate = require('./EventWX.Template');
module.exports = zn.Controller('event.wx', {
    validate: false,
    methods: {
        init: function (context, application){
            this.template = new EventWXTemplate(context, application);
        },
        refundEvent: {
            method: 'GET/POST',
            argv: {
                userid: null,
                openid: null,
                event_uuid: null,
                refund_desc: null
            },
            value: function (request, response, application, context, router){
                var _userid = request.getValue('userid');
                var _openid = request.getValue('openid');
                var _refund_desc = request.getValue('refund_desc');
                var _event_uuid = request.getValue('event_uuid'),
                    _value = {};
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: { 
                            zxnz_UUID: _event_uuid, 
                            Table_Generated: 1
                        }
                    }))
                    .query('validate', function (sql, data){
                        if(!data[0]){
                            return new Error('未查到该活动或活动已经结束');
                        }
                        _value.event = data[0];
                        return zxnz.sql.select({
                            table: _value.event.Table_Name,
                            where: {
                                enroll_user_User_UUID: _userid,
                                enroll_user_User_WXOpenID: _openid
                            }
                        });
                    })
                    .query('insert', function (sql, data){
                        var _order = data[0];
                        if(!_order){
                            return new Error('该活动您未报名');
                        }
                        if(!_order.Payment_State) {
                            return new Error('您还未支付该活动，无法发起退款');
                        }
                        _value.order = _order;
                        var _out_refund_no = (zn.date.nowDateString() + zn.util.randomNumbers(6)),
                            _argv = {};
                        if(_order.Payment_Transaction_Id) {
                            _argv.transaction_id = _order.Payment_Transaction_Id;
                        }else{
                            _argv.out_trade_no = _order.Payment_Order_Code;
                        }
                        _argv.total_fee = _order.Payment_Settlement_Total_fee;
                        _argv.refund_fee = _order.Payment_Settlement_Total_fee;
                        _argv.out_refund_no = _out_refund_no;
                        _argv.notify_url = 'http://enroll-merchant-api.shqzx-activity.com/enroll.merchant/event.wx/refundPaySuccessNotify/' + _event_uuid + '/' + _order.Payment_Order_Code;
                        if(_argv.refund_desc){
                            _argv.refund_desc = _refund_desc;
                        }

                        _value.order.refund_desc = _refund_desc;
                        _value.order.refund_fee = _argv.refund_fee;
                        return context.wx.refund(_argv);
                    })
                    .query('update order', function (sql, data){
                        return zxnz.sql.update({
                            table: _value.event.Table_Name,
                            updates: {
                                Payment_State: -2,
                                Payment_Refund_Out_No: data.out_refund_no,
                                Payment_Refund_Id: data.refund_id,
                                Payment_Refund_Fee: data.refund_fee
                            },
                            where: {
                                enroll_user_User_UUID: _userid,
                                enroll_user_User_WXOpenID: _openid
                            }
                        });
                    })
                    .commit()
                    .then(function (){
                        response.success('退款申请已提交, 需等待银行处理, 正常情况需要等待1~3个工作日, 退款成功系统会及时通知客户。');
                        console.log(_value);
                        this.template.refundApplySuccess(_value.event, _value.order).then(function (data){
                            zn.info(data);
                        });
                    }.bind(this), function (err){
                        response.error(err);
                    });
            }
        },
        refundPaySuccessNotify: {
            method: 'GET/POST',
            route: '/refundPaySuccessNotify/:event_uuid/:trade_no',
            argv: {
                event_uuid: null,
                trade_no: null
            },
            value: function (request, response, application, context, router){
                var _values = request.getValue();
                zn.trace('refundPaySuccessNotify parameters: ', _values);
                var _trade_no = request.getValue('trade_no');
                var _event_uuid = request.getValue('event_uuid'),
                    _value = {};
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: { 
                            zxnz_UUID: _event_uuid, 
                            Table_Generated: 1
                        }
                    }))
                    .query('validate', function (sql, data){
                        if(!data[0]){
                            return new Error('未查到该活动');
                        }
                        _value.event = data[0];
                        return zxnz.sql.select({
                            table: _value.event.Table_Name,
                            where: {
                                Payment_Order_Code: _trade_no
                            }
                        });
                    })
                    .query('insert', function (sql, data){
                        if(!data[0]){
                            return new Error('该活动您未报名');
                        }

                        if(data[0].Payment_State == -1) {
                            return new Error('该活动订单已经全额退款');
                        }

                        if(data[0].Payment_State !== -2) {
                            return new Error('活动订单不允许退款操作');
                        }
                        _value.data = data[0];
                        return zxnz.sql.update({
                            table: _value.event.Table_Name,
                            updates: {
                                Payment_State: -1
                            },
                            where: {
                                Payment_Order_Code: _trade_no
                            }
                        });
                    })
                    .commit()
                    .then(function (){
                        response.success('退款成功');
                        this.template.refundSuccess(_value.event, _value.data).then(function (data){
                            zn.info(data);
                        });
                    }.bind(this), function (err){
                        response.error(err);
                    });
            }
        },
        eventNotify: {
            method: 'GET/POST',
            argv: {
                userid: null,
                openid: null,
                event_uuid: null,
                signature: null
            },
            value: function (request, response, application, context, router){
                var _userid = request.getValue('userid');
                var _openid = request.getValue('openid');
                var _event_uuid = request.getValue('event_uuid'),
                    _signature = request.getValue('signature'),
                    _value = {};
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: { 
                            zxnz_UUID: _event_uuid, 
                            Table_Generated: 1,
                            Checkin_Start_Time: {
                                name: 'UNIX_TIMESTAMP(Checkin_Start_Time)',
                                opt: '<=',
                                value: '{{UNIX_TIMESTAMP(now())}}'
                            },
                            Checkin_End_Time: {
                                name: 'UNIX_TIMESTAMP(Checkin_End_Time)',
                                opt: '>=',
                                value: '{{UNIX_TIMESTAMP(now())}}'
                            }
                        }
                    }))
                    .query('validate', function (sql, data){
                        if(!data[0]){
                            return new Error('未查到该活动或活动已经结束');
                        }
                        _value.event = data[0];
                        return zxnz.sql.select({
                            table: _value.event.Table_Name,
                            where: {
                                enroll_user_User_UUID: _userid,
                                enroll_user_User_WXOpenID: _openid
                            }
                        }) + zxnz.sql.select({
                            table: T_WECHAT_USER,
                            where: {
                                openid: _openid
                            }
                        });
                    })
                    .query('insert', function (sql, data){
                        if(!data[0][0]){
                            return new Error('该活动您未报名');
                        }else {
                            _value.data = data[0][0];
                            _value.data.user = data[1][0];
                            return zxnz.sql.update({
                                table: _value.event.Table_Name,
                                updates: {
                                    Checkin_State: 1,
                                    Checkin_Time: '{{now()}}',
                                    Checkin_Address: request.getValue('address') || '',
                                    Checkin_Signature: _signature
                                },
                                where: {
                                    enroll_user_User_UUID: _userid,
                                    enroll_user_User_WXOpenID: _openid
                                }
                            }) + zxnz.sql.update({
                                table: T_EVENT,
                                updates: 'Checkin_Count=Checkin_Count+1',
                                where: { zxnz_UUID: _event_uuid }
                            });
                        }
                    })
                    .commit()
                    .then(function (data){
                        response.success('签到成功');
                        this.template.checkinSuccess(_value.event, _value.data).then(function (data){
                            zn.info(data);
                        });
                    }.bind(this), function (err){
                        response.error(err);
                    });
            }
        },
        checkin: {
            method: 'GET/POST',
            argv: {
                userid: null,
                openid: null,
                event_uuid: null,
                signature: null
            },
            value: function (request, response, application, context, router){
                var _userid = request.getValue('userid');
                var _openid = request.getValue('openid');
                var _event_uuid = request.getValue('event_uuid'),
                    _signature = request.getValue('signature'),
                    _value = {};
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: { 
                            zxnz_UUID: _event_uuid, 
                            Table_Generated: 1,
                            Checkin_Start_Time: {
                                name: 'UNIX_TIMESTAMP(Checkin_Start_Time)',
                                opt: '<=',
                                value: '{{UNIX_TIMESTAMP(now())}}'
                            },
                            Checkin_End_Time: {
                                name: 'UNIX_TIMESTAMP(Checkin_End_Time)',
                                opt: '>=',
                                value: '{{UNIX_TIMESTAMP(now())}}'
                            }
                        }
                    }))
                    .query('validate', function (sql, data){
                        if(!data[0]){
                            return new Error('未查到该活动或活动已经结束');
                        }
                        _value.event = data[0];
                        return zxnz.sql.select({
                            table: _value.event.Table_Name,
                            where: {
                                enroll_user_User_UUID: _userid,
                                enroll_user_User_WXOpenID: _openid
                            }
                        }) + zxnz.sql.select({
                            table: T_WECHAT_USER,
                            where: {
                                openid: _openid
                            }
                        });
                    })
                    .query('insert', function (sql, data){
                        if(!data[0][0]){
                            return new Error('该活动您未报名');
                        }else {
                            _value.data = data[0][0];
                            _value.data.user = data[1][0];
                            return zxnz.sql.update({
                                table: _value.event.Table_Name,
                                updates: {
                                    Checkin_State: 1,
                                    Checkin_Time: '{{now()}}',
                                    Checkin_Address: request.getValue('address') || '',
                                    Checkin_Signature: _signature
                                },
                                where: {
                                    enroll_user_User_UUID: _userid,
                                    enroll_user_User_WXOpenID: _openid
                                }
                            }) + zxnz.sql.update({
                                table: T_EVENT,
                                updates: 'Checkin_Count=Checkin_Count+1',
                                where: { zxnz_UUID: _event_uuid }
                            });
                        }
                    })
                    .commit()
                    .then(function (data){
                        response.success('签到成功');
                        this.template.checkinSuccess(_value.event, _value.data).then(function (data){
                            zn.info(data);
                        });
                    }.bind(this), function (err){
                        response.error(err);
                    });
            }
        }
    }
});