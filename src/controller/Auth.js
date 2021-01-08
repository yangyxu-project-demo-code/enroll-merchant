var node_fs = require('fs');
var node_path = require('path');
var T_USER = "zxnz_enroll_merchant_User";
var T_USER_Log = "zxnz_enroll_merchant_User_Log";
module.exports = zn.Controller('auth', {
    validate: true,
    methods: {
        login: {
            validate: false,
            method: 'GET/POST',
            argv: {
                name: null,
                password: null
            },
            value: function (request, response, application, context, router){
                var _value = request.getValue();
                    _user = null,
                    _transaction = zxnz.store.beginPoolTransaction();
                _transaction.query(zxnz.sql.select({
                    table: T_USER,
                    where: "Password='{0}' and (Real_Name='{1}' or Name='{1}' or Email='{1}' or Mobile='{1}')".format(_value.password, _value.name)
                })).query("Validate User: ", function (sql, data, fields){
                    if(!data.length){
                        return new Error('用户名或密码错误！');
                    }
                    _user = data[0];
                    if(!+_user.Actived) {
                        return new Error('账号还未激活，请激活后再登录！');
                    }
                    return zxnz.sql.insert({
                        table: T_USER_Log,
                        values: {
                            IP: request.getClientIp(),
                            Action: 'Login',
                            User_UUID: _user.zxnz_UUID
                        }
                    }) + zxnz.sql.update({
                        table: T_USER,
                        updates: {
                            Login_Last_Time: "{{now()}}",
                            Login_Count: "{{Login_Count+1}}"
                        }
                    });
                });
                
                _transaction.commit().then(function (){
                    response.createSession({
                        values: {
                            user: {
                                name: _user.Name,
                                id: _user.zxnz_ID,
                                uuid: _user.zxnz_UUID,
                                merchant_uuid: _user.Merchant_UUID
                            }
                        }
                    }, {
                        zxnz_enroll_merchant_user_profile: context.sessionContext.jwtSign({
                            name: _user.Name,
                            uuid: _user.zxnz_UUID,
                            merchant_uuid: _user.Merchant_UUID,
                            email: _user.Email
                        })
                    });
    
                    response.success('登录成功');
                }, function (err){
                    response.error(err);
                });
            }
        },
        registerByEmail: {
            validate: false,
            method: 'GET/POST',
            argv: {
                url: null,
                name: null,
                email: null,
                password: null
            },
            value: function (request, response, application, context, router){
                var _value = request.getValue();
                    _uuid = zn.uuid(),
                    _transaction = zxnz.store.beginPoolTransaction();

                _transaction.query(zxnz.sql.select({
                    table: T_USER,
                    where: {
                        Name: {
                            andOr: 'or',
                            opt: '=',
                            value: _value.name
                        },
                        Email: {
                            andOr: 'or',
                            opt: '=',
                            value: _value.email
                        }
                    }
                })).query("Validate User: ", function (sql, data, fields){
                    if(data.length){
                        return new Error('邮箱账号或者用户已经存在, 请重新输入！');
                    }
                    return zxnz.sql.insert({
                        table: T_USER,
                        values: {
                            zxnz_UUID: _uuid,
                            Name: _value.name,
                            Email: _value.email,
                            Password: _value.password
                        }
                    }) + zxnz.sql.insert({
                        table: T_USER_Log,
                        values: {
                            IP: request.getClientIp(),
                            Action: 'RegisterByEmail',
                            User_UUID: _uuid
                        }
                    });
                });
                
                _transaction.commit().then(function (){
                    var _emailRegisterActiveHtmlTemplate = node_fs.readFileSync(node_path.resolve(__dirname, '../template/email.register.active.html'),'utf-8');
                    context.mailTransporter.sendMail({
                        from: "报名活动号 <shqzx.activity@qq.com>",
                        to: _value.email,
                        subject: "报名活动号 - 账号激活",
                        html: _emailRegisterActiveHtmlTemplate.format({
                            name: _value.name,
                            href: _value.url +  "#/user.active/" + _uuid + "/" + (new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).getTime()
                        })
                    }, function (err,info){
                        if(err){
                            zn.error(err);
                            response.error("注册失败：" + err.message);
                        }else {
                            response.success("注册成功：请您尽快登陆邮箱进行账号激活！");
                        }
                    });
                }, function (err){
                    response.error(err);
                });
            }
        },
        forgetPasswordByEmail: {
            validate: false,
            method: 'GET/POST',
            argv: {
                email: null,
                url: null
            },
            value: function (request, response, application, context, router){
                var _transaction = zxnz.store.beginPoolTransaction(),
                    _user = null;
                _transaction.query(zxnz.sql.select({
                    table: T_USER,
                    where: {
                        Email: request.getValue('email')
                    }
                })).query("Validate User: ", function (sql, data, fields){
                    if(!data.length){
                        return new Error('邮箱账号不存在, 请重新输入！');
                    }
                    _user = data[0];
                    return zxnz.sql.insert({
                        table: T_USER_Log,
                        values: {
                            IP: request.getClientIp(),
                            Action: 'ForgetPasswordByEmail',
                            User_UUID: _user.zxnz_UUID
                        }
                    });
                });
                
                _transaction.commit().then(function (){
                    var _emailRegisterActiveHtmlTemplate = node_fs.readFileSync(node_path.resolve(__dirname, '../template/email.forget.password.html'),'utf-8');
                    context.mailTransporter.sendMail({
                        from: "报名活动号 <shqzx.activity@qq.com>",
                        to: _user.Email,
                        subject: "报名活动号 - 密码找回",
                        html: _emailRegisterActiveHtmlTemplate.format({
                            name: _user.Name,
                            href: request.getValue('url') +  "#/user.resetpassword/" + _user.zxnz_UUID + "/" + (new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).getTime()
                        }),
                    }, function (err){
                        if(err){
                            zn.error(err);
                            response.error("发送失败：" + err.message);
                        }else {
                            response.success("发送成功：请您尽快登陆邮箱进行重置密码！");
                        }
                    });
                }, function (err){
                    response.error(err);
                });
            }
        },
        activeUserAccount: {
            validate: false,
            method: 'GET',
            route: '/user.active/:user_uuid/:expires',
            argv: {
                user_uuid: null,
                expires: null
            },
            value: function (request, response, application, context, router){
                var _user = null,
                    _user_uuid = request.getValue('user_uuid'),
                    _expires = request.getValue('expires');
                
                if(+_expires < Date.now()) {
                    return response.error('该链接已失效');
                }
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_USER,
                        where: "zxnz_UUID='{0}' and Actived=0".format(_user_uuid)
                    }))
                    .query("Validate User: ", function (sql, data, fields){
                        if(!data.length){
                            return new Error('该链接无效');
                        }
                        _user = data[0];
                        if(+_user.Actived) {
                            return new Error('账号已经激活，请直接登录！');
                        }
                        return zxnz.sql.update({
                            table: T_USER,
                            updates: {
                                Actived: 1,
                                Actived_Time: "{{now()}}",
                                Email_Verified: 1
                            },
                            where: {
                                zxnz_UUID: _user_uuid
                            }
                        }) + zxnz.sql.insert({
                            table: T_USER_Log,
                            values: {
                                IP: request.getClientIp(),
                                Action: 'ActiveUserAccount',
                                User_UUID: _user_uuid
                            }
                        });
                    })
                    .commit()
                    .then(function (){
                        response.success('激活成功');
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        updateUserPassword: {
            validate: false,
            method: 'POST',
            route: '/user.updatePassword/:user_uuid',
            argv: {
                pwd: null,
                expires: null
            },
            value: function (request, response, application, context, router){
                var _user = null,
                    _user_uuid = request.getValue('user_uuid'),
                    _pwd = request.getValue('pwd'),
                    _expires = request.getValue('expires');
                if(+_expires < Date.now()) {
                    return response.error('该链接已失效');
                }
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_USER,
                        where: "zxnz_UUID='{0}' and Actived=1".format(_user_uuid)
                    })).query("Validate User: ", function (sql, data, fields){
                        if(!data.length){
                            return new Error('该链接无效');
                        }
                        _user = data[0];
                        return zxnz.sql.update({
                            table: T_USER,
                            updates: {
                                Password: _pwd
                            },
                            where: {
                                zxnz_UUID: _user_uuid
                            }
                        }) + zxnz.sql.insert({
                            table: T_USER_Log,
                            values: {
                                IP: request.getClientIp(),
                                Action: 'UpdateUserPassword',
                                User_UUID: _user_uuid
                            }
                        });
                    })
                    .commit()
                    .then(function (){
                        response.success('密码修改成功');
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        logout: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                response.invalidateSession();
                response.success('Logout Success.');
            }
        },
        checkUser: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var cookie = request.getCookie('zxnz_enroll_user_profile');
                response.success(context.sessionContext.jwtVerifyToken(cookie._value));
            }
        },
        sessionVerify: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                request.sessionVerify(function (session){
                    response.success('verify success.');
                }, function(){
                    response.error('verify error.');
                });
            }
        }
    }
});