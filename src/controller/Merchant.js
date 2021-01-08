var T_EVENT = "zxnz_enroll_merchant_Event";
var T_USER = "zxnz_enroll_merchant_User";
var T_MERCHANT = "zxnz_enroll_merchant_Merchant";
var T_MERCHANT_INIVTE = "zxnz_enroll_merchant_Merchant_Inivte";
var node_fs = require('fs');
var node_path = require('path');
var node_pinyin = require('chinese-to-pinyin');
module.exports = zn.Controller('merchant', {
    validate: true,
    methods: {
        pagingEvents: {
            method: 'GET/POST',
            argv: {
                merchant_uuid: null
            },
            value: function (request, response, application, context, router){
                var _filters = request.getJSON('filters');
                _filters.Merchant_UUID = {
                    value: request.getValue('merchant_uuid'),
                    opt: '='
                }
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.paging({
                        table: T_EVENT,
                        fields: [
                            'zxnz_UUID, zxnz_Label, Roles, Show_Count, Table_Name, Unique_Check, Email_Enabled, Footer_Title, Owner, Error_Message, Success_Message',
                            'Attachments, Is_Public, Comment, Description, Text_Color, Background_Image, zxnz_Inserted_Time, Max_Count, Count, zxnz_Note, Status, Table_Generated',
                            'Start_Time, End_Time, Checkin_Start_Time, Checkin_End_Time',
                            'Address, Address_TX_Gcj02, Entry_Fee',
                            'zxnz_enroll_merchant_Created_User, zxnz_enroll_merchant_Updated_User',
                            'enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Created_User) as Created_User',
                            'enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Updated_User) as Updated_User'
                        ],
                        pageIndex: request.getValue('pageIndex'),
                        pageSize: request.getValue('pageSize'),
                        where: _filters,
                        order: {
                            zxnz_Inserted_Time: 'desc',
                            zxnz_Updated_Time: 'desc'
                        }
                    }))
                    .commit()
                    .then(function (data){
                        response.success(data);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        createMerchant: {
            method: 'GET/POST',
            argv: {
                Name: null
            },
            value: function (request, response, application, context, router, session){
                var _values = request.getValue();
                _values.Owner = session.getValue('user').uuid;
                _values.zxnz_UUID = zn.uuid();
                _values.Table_Prefix = 'zxnz_enroll_merchant_' + node_pinyin(_values.Name||'', { removeTone: true, firstCharacter: true, filterChinese: true, removeSpace: true });
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.insert({
                        table: T_MERCHANT,
                        values: _values
                    })+ zxnz.sql.update({
                        table: T_USER,
                        updates: {
                            Merchant_UUID: _values.zxnz_UUID
                        },
                        where: {
                            zxnz_UUID: _values.Owner
                        }
                    }))
                    .commit()
                    .then(function (data){
                        response.success(data);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        inivteUser: {
            method: 'GET/POST',
            argv: {
                merchant_uuid: null,
                email: null,
                description: null
            },
            value: function (request, response, application, context, router, session){
                var _user = null,
                    _email = request.getValue('email'),
                    _merchant_uuid = request.getValue('merchant_uuid');

                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_USER,
                        where:{
                            Email: _email
                        }
                    }))
                    .query('validate user: ', function (sql, data){
                        _user = data[0];
                        if(!_user){
                            throw new Error('系统中未查到该用户');
                        }
                        return zxnz.sql.select({
                            table: T_MERCHANT,
                            where: "zxnz_UUID='" + _merchant_uuid + "' and locate(concat(',', '{0}', ','), Users)<>0".format(_user.zxnz_UUID)
                        });
                    })
                    .query('Validate User: ', function (sql, data){
                        if(data.length){
                            throw new Error('该用户已经是成员');
                        }

                        return zxnz.sql.update({
                            table: T_MERCHANT,
                            updates: "Users = replace(concat(Users, '," + _user.zxnz_UUID + ",'), ',,', ',')",
                            where: {
                                zxnz_UUID: _merchant_uuid
                            }
                        }) + zxnz.sql.insert({
                            table: T_MERCHANT_INIVTE,
                            values: {
                                User_Email: _email,
                                User_UUID: _user.zxnz_UUID,
                                Merchant_UUID: _merchant_uuid,
                                Role: 'Users',
                                Description: request.getValue('description')
                            }
                        });
                    })
                    .commit()
                    .then(function (data){
                        var _emailRegisterActiveHtmlTemplate = node_fs.readFileSync(node_path.resolve(__dirname, '../template/email.merchant.inivte.html'),'utf-8');
                        context.mailTransporter.sendMail({
                            from: "报名活动号 <shqzx.activity@qq.com>",
                            to: _email,
                            subject: "报名活动号 - 活动号成员邀请",
                            html: _emailRegisterActiveHtmlTemplate.format({
                                name: _user.Name,
                                note: request.getValue('description')
                            }),
                        }, function (err,info){
                            if(err){
                                zn.error(err);
                                response.error("邀请失败：" + err.message);
                            }else {
                                response.success("邀请成功：等待用户确认！");
                            }
                        });
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        removeUser: {
            method: 'DELETE',
            route: 'removeUser/:merchant_uuid/:name',
            argv: {
                merchant_uuid: null,
                name: null
            },
            value: function (request, response, application, context, router, session){
                var _user = null,
                    _name = request.getValue('name'),
                    _merchant_uuid = request.getValue('merchant_uuid');

                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_USER,
                        where:{
                            Name: _name
                        }
                    }))
                    .query('validate user: ', function (sql, data){
                        _user = data[0];
                        if(!_user){
                            throw new Error('系统中未查到该用户');
                        }

                        return zxnz.sql.update({
                            table: T_MERCHANT,
                            updates: "Users = replace(Users, '," + _user.zxnz_UUID + ",', ',')",
                            where: {
                                zxnz_UUID: _merchant_uuid
                            }
                        });
                    })
                    .commit()
                    .then(function (data){
                        response.success("删除成功");
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        inivteOwner: {
            method: 'GET/POST',
            argv: {
                merchant_uuid: null,
                email: null,
                description: null
            },
            value: function (request, response, application, context, router, session){
                var _user = null,
                    _email = request.getValue('email'),
                    _merchant_uuid = request.getValue('merchant_uuid');

                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_USER,
                        where:{
                            Email: _email
                        }
                    }))
                    .query('validate user: ', function (sql, data){
                        _user = data[0];
                        if(!_user){
                            throw new Error('系统中未查到该用户');
                        }
                        return zxnz.sql.select({
                            table: T_MERCHANT,
                            where: "zxnz_UUID='" + _merchant_uuid + "' and locate(concat(',', '{0}', ','), Owners)<>0".format(_user.zxnz_UUID)
                        });
                    })
                    .query('Validate User: ', function (sql, data){
                        if(data.length){
                            throw new Error('该用户已经是管理员');
                        }

                        return zxnz.sql.update({
                            table: T_MERCHANT,
                            updates: "Owners = replace(concat(Owners, '," + _user.zxnz_UUID + ",'), ',,', ',')",
                            where: {
                                zxnz_UUID: _merchant_uuid
                            }
                        }) + zxnz.sql.insert({
                            table: T_MERCHANT_INIVTE,
                            values: {
                                User_Email: _email,
                                User_UUID: _user.zxnz_UUID,
                                Merchant_UUID: _merchant_uuid,
                                Role: 'Owners',
                                Description: request.getValue('description')
                            }
                        });
                    })
                    .commit()
                    .then(function (data){
                        var _emailRegisterActiveHtmlTemplate = node_fs.readFileSync(node_path.resolve(__dirname, '../template/email.merchant.inivte.html'),'utf-8');
                        context.mailTransporter.sendMail({
                            from: "报名活动号 <shqzx.activity@qq.com>",
                            to: _email,
                            subject: "报名活动号 - 活动号管理员邀请",
                            html: _emailRegisterActiveHtmlTemplate.format({
                                name: _user.Name,
                                note: request.getValue('description')
                            }),
                        }, function (err,info){
                            if(err){
                                zn.error(err);
                                response.error("邀请失败：" + err.message);
                            }else {
                                response.success("邀请成功：等待用户确认！");
                            }
                        });
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        removeOwner: {
            method: 'DELETE',
            route: 'removeOwner/:merchant_uuid/:name',
            argv: {
                merchant_uuid: null,
                name: null
            },
            value: function (request, response, application, context, router, session){
                var _user = null,
                    _name = request.getValue('name'),
                    _merchant_uuid = request.getValue('merchant_uuid');

                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_USER,
                        where:{
                            Name: _name
                        }
                    }))
                    .query('validate user: ', function (sql, data){
                        _user = data[0];
                        if(!_user){
                            throw new Error('系统中未查到该用户');
                        }

                        return zxnz.sql.update({
                            table: T_MERCHANT,
                            updates: "Owners = replace(Owners, '," + _user.zxnz_UUID + ",', ',')",
                            where: {
                                zxnz_UUID: _merchant_uuid
                            }
                        });
                    })
                    .commit()
                    .then(function (data){
                        response.success("删除成功");
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        updateByUUID: {
            method: 'POST',
            argv: {
                updates: null,
                uuid: null
            },
            value: function (request, response, application, context, router){
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.update({
                        table: T_MERCHANT,
                        updates: request.getJSON('updates'),
                        where: {
                            zxnz_UUID: request.getValue('uuid')
                        }
                    }))
                    .commit()
                    .then(function (data){
                        response.success(data);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        getMerchant: {
            method: 'GET/POST',
            route: '/info/:merchant_uuid',
            value: function (request, response, application, context, router){
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_MERCHANT,
                        fields: [
                            '*'
                        ],
                        where: {
                            zxnz_UUID: request.getValue('merchant_uuid')
                        }
                    }))
                    .commit()
                    .then(function (data){
                        response.success(data[0]);
                    }, function (err){
                        response.error(err);
                    });
            }
        }
    }
});