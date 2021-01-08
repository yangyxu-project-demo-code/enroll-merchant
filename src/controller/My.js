var T_MERCHANT = "zxnz_enroll_merchant_Merchant";
var T_MERCHANT_INIVTE = "zxnz_enroll_merchant_Merchant_Inivte";
var T_EVENT = "zxnz_enroll_merchant_Event";
var T_COURSE = "zxnz_enroll_merchant_Course";
var T_USER = "zxnz_enroll_merchant_User";
var T_USER_Log = "zxnz_enroll_merchant_User_Log";
module.exports = zn.Controller('my', {
    validate: true,
    methods: {
        dashboard: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user'),
                    _data = {},
                    _transaction = zxnz.store.beginPoolTransaction();
                _transaction.query(zxnz.sql.select({
                    table: T_MERCHANT,
                    fields: 'zxnz_UUID, zxnz_Note, Name, Description, Status',
                    where: "Owner='{0}' or locate(concat(',', '{0}', ','), Users)<>0".format(_user.uuid)
                }))
                .query('Paging Events: ', function (sql, data){
                    if(!data.length){
                        return new Error('未找到活动组织！');
                    }
                    _data.merchants = data;
                    var _ids = data.map(function (item){
                        return item.zxnz_UUID;
                    });
                    return zxnz.sql.select({
                        table: T_EVENT,
                        fields: [
                            'zxnz_UUID, zxnz_Label, Roles, Show_Count, Table_Name, Unique_Check, Email_Enabled, Footer_Title, Owner, Error_Message, Success_Message',
                            'Attachments, Description, Is_Public, Comment, Text_Color, Background_Image, zxnz_Inserted_Time, Max_Count, Count, zxnz_Note, Status, Table_Generated',
                            'Start_Time, End_Time, Checkin_Start_Time, Checkin_End_Time',
                            'zxnz_enroll_merchant_Created_User, zxnz_enroll_merchant_Updated_User',
                            'Address, Address_TX_Gcj02, Entry_Fee',
                            'enroll_merchant_convert_merchant_uuid(Merchant_UUID) as Merchant',
                            'enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Created_User) as Created_User',
                            'enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Updated_User) as Updated_User'
                        ],
                        where: {
                            Merchant_UUID: {
                                opt: 'in',
                                value: _ids
                            }
                        }
                    });
                })
                .commit()
                .then(function (data){
                    _data.events = data;
                    response.success(_data);
                }, function (err){
                    response.error(err);
                });
            }
        },
        info: {
            method: 'GET',
            value: function (request, response, application, context, router, session){
                var _user = request.session.getValue('user');
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_USER,
                        where: "zxnz_UUID='{0}'".format(_user.uuid)
                    })).query("Validate User: ", function (sql, data, fields){
                        if(!data.length){
                            return new Error('账号不存在！');
                        }
                        _user = data[0];
                        if(!+_user.Actived) {
                            return new Error('账号还未激活，请激活后再登录！');
                        }
                        return zxnz.sql.insert({
                            table: T_USER_Log,
                            values: {
                                IP: request.getClientIp(),
                                Action: 'my.info',
                                User_UUID: _user.zxnz_UUID
                            }
                        });
                    })
                    .commit()
                    .then(function (){
                        response.success({
                            uuid: _user.zxnz_UUID,
                            merchant: _user.Merchant_UUID,
                            name: _user.Name,
                            mobile: _user.Mobile,
                            mobile_verified: _user.Mobile_Verified,
                            email: _user.Email,
                            email_verified: _user.Email_Verified,
                            actived_time: _user.Actived_Time,
                            login_last_time: _user.Login_Last_Time
                        });
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        merchant: {
            method: 'GET',
            value: function (request, response, application, context, router, session){
                var _user = request.session.getValue('user');
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_USER,
                        where: "zxnz_UUID='{0}'".format(_user.uuid)
                    })).query("Validate User: ", function (sql, data, fields){
                        if(!data.length){
                            return new Error('账号不存在！');
                        }
                        _user = data[0];

                        if(!_user.Merchant_UUID) {
                            return new Error('商户账号还未注册');
                        }
                        return zxnz.sql.select({
                            table: T_MERCHANT,
                            fields: [
                                '*',
                                'enroll_merchant_convert_user_uuids(Users) as users',
                                'enroll_merchant_convert_user_uuids(Owners) as owners'
                            ],
                            where: {
                                zxnz_UUID: _user.Merchant_UUID
                            }
                        });
                    })
                    .commit()
                    .then(function (data){
                        response.success(data[0]);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        getMerchants: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user'),
                    _transaction = zxnz.store.beginPoolTransaction();
                _transaction.query(zxnz.sql.select({
                    table: T_MERCHANT,
                    where: "Owner='{0}' or locate(concat(',', '{0}', ','), Users)<>0".format(_user.uuid)
                }))
                .commit()
                .then(function (data, fields){
                    response.success(data);
                }, function (err){
                    response.error(err);
                });
            }
        },
        pagingMerchants: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user'),
                    _transaction = zxnz.store.beginPoolTransaction();
                _transaction.query(zxnz.sql.paging({
                    table: T_MERCHANT,
                    fields: [
                        'zxnz_UUID, Name, Logo, Video, zxnz_Inserted_Time, Description, zxnz_Note, enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Created_User) as Created_User, zxnz_enroll_merchant_Created_User'
                    ],
                    pageIndex: request.getValue('pageIndex'),
                    pageSize: request.getValue('pageSize'),
                    where: "Owner='{0}' or locate(concat(',', '{0}', ','), Users)<>0".format(_user.uuid)
                }))
                .commit()
                .then(function (data, fields){
                    response.success(data);
                }, function (err){
                    response.error(err);
                });
            }
        },
        allEvents: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user'),
                    _filters = request.getJSON('filters'),
                    _transaction = zxnz.store.beginPoolTransaction();
                _transaction.query(zxnz.sql.select({
                    table: T_MERCHANT,
                    fields: 'zxnz_UUID',
                    where: "Owner='{0}' or locate(concat(',', '{0}', ','), Users)<>0".format(_user.uuid)
                }))
                .query('Paging Events: ', function (sql, data){
                    if(!data.length){
                        return new Error('未找到活动组织！');
                    }
                    var _ids = data.map(function (item){
                        return item.zxnz_UUID;
                    });
                    _filters.Merchant = {
                        name: "locate(Merchant_UUID, '{0}')".format(',' + _ids.join(',') + ','),
                        opt: '<>',
                        value: 0
                    };
                    return zxnz.sql.paging({
                        table: T_EVENT,
                        fields: [
                            'zxnz_UUID, zxnz_Label, Roles, Show_Count, Table_Name, Unique_Check, Email_Enabled, Footer_Title, Owner, Error_Message, Success_Message',
                            'Attachments, Logo, Description, Is_Public, Comment, Text_Color, Background_Image, zxnz_Inserted_Time, Max_Count, Count, zxnz_Note, Status, Table_Generated',
                            'Start_Time, End_Time, Checkin_Start_Time, Checkin_End_Time',
                            'zxnz_enroll_merchant_Created_User, zxnz_enroll_merchant_Updated_User',
                            'Address, Address_TX_Gcj02, Entry_Fee',
                            'enroll_merchant_convert_merchant_uuid(Merchant_UUID) as Merchant',
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
                    });
                })
                .commit()
                .then(function (data, fields){
                    response.success(data);
                }, function (err){
                    response.error(err);
                });
            }
        },
        editingEvents: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user'),
                    _filters = request.getJSON('filters'),
                    _transaction = zxnz.store.beginPoolTransaction();
                _transaction.query(zxnz.sql.select({
                    table: T_MERCHANT,
                    fields: 'zxnz_UUID',
                    where: "Owner='{0}' or locate(concat(',', '{0}', ','), Users)<>0".format(_user.uuid)
                }))
                .query('Paging Events: ', function (sql, data){
                    if(!data.length){
                        return new Error('未找到活动组织！');
                    }
                    var _ids = data.map(function (item){
                        return item.zxnz_UUID;
                    });
                    _filters.Merchant = {
                        name: "locate(Merchant_UUID, '{0}')".format(',' + _ids.join(',') + ','),
                        opt: '<>',
                        value: 0
                    };
                    _filters.Table_Generated = {
                        opt: '=',
                        value: 0
                    };
                    _filters.Status = {
                        opt: '=',
                        value: 0
                    };
                    return zxnz.sql.paging({
                        table: T_EVENT,
                        fields: [
                            'zxnz_UUID, zxnz_Label, Roles, Show_Count, Table_Name, Unique_Check, Email_Enabled, Footer_Title, Owner, Error_Message, Success_Message',
                            'Attachments, Logo, Description, Is_Public, Comment, Text_Color, Background_Image, zxnz_Inserted_Time, Max_Count, Count, zxnz_Note, Status, Table_Generated',
                            'Start_Time, End_Time, Checkin_Start_Time, Checkin_End_Time',
                            'Address, Address_TX_Gcj02, Entry_Fee',
                            'zxnz_enroll_merchant_Created_User, zxnz_enroll_merchant_Updated_User',
                            'enroll_merchant_convert_merchant_uuid(Merchant_UUID) as Merchant',
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
                    });
                })
                .commit()
                .then(function (data, fields){
                    response.success(data);
                }, function (err){
                    response.error(err);
                });
            }
        },
        doingEvents: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user'),
                    _filters = request.getJSON('filters'),
                    _transaction = zxnz.store.beginPoolTransaction();
                _transaction.query(zxnz.sql.select({
                    table: T_MERCHANT,
                    fields: 'zxnz_UUID',
                    where: "Owner='{0}' or locate(concat(',', '{0}', ','), Users)<>0".format(_user.uuid)
                }))
                .query('Paging Events: ', function (sql, data){
                    if(!data.length){
                        return new Error('未找到活动组织！');
                    }
                    var _ids = data.map(function (item){
                        return item.zxnz_UUID;
                    });
                    _filters.Merchant = {
                        name: "locate(Merchant_UUID, '{0}')".format(',' + _ids.join(',') + ','),
                        opt: '<>',
                        value: 0
                    };
                    _filters.Table_Generated = {
                        opt: '=',
                        value: 1
                    };
                    _filters.Start_Time = {
                        name: 'UNIX_TIMESTAMP(Start_Time)',
                        opt: '<=',
                        value: '{{UNIX_TIMESTAMP(now())}}'
                    };
                    _filters.End_Time = {
                        name: 'UNIX_TIMESTAMP(End_Time)',
                        opt: '>=',
                        value: '{{UNIX_TIMESTAMP(now())}}'
                    };
                    return zxnz.sql.paging({
                        table: T_EVENT,
                        fields: [
                            'zxnz_UUID, zxnz_Label, Roles, Show_Count, Table_Name, Unique_Check, Email_Enabled, Footer_Title, Owner, Error_Message, Success_Message',
                            'Attachments, Logo, Description, Is_Public, Comment, Text_Color, Background_Image, zxnz_Inserted_Time, Max_Count, Count, zxnz_Note, Status, Table_Generated',
                            'Start_Time, End_Time, Checkin_Start_Time, Checkin_End_Time',
                            'Address, Address_TX_Gcj02, Entry_Fee',
                            'zxnz_enroll_merchant_Created_User, zxnz_enroll_merchant_Updated_User',
                            'enroll_merchant_convert_merchant_uuid(Merchant_UUID) as Merchant',
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
                    });
                })
                .commit()
                .then(function (data, fields){
                    response.success(data);
                }, function (err){
                    response.error(err);
                });
            }
        },
        doneEvents: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user'),
                    _filters = request.getJSON('filters'),
                    _transaction = zxnz.store.beginPoolTransaction();
                _transaction.query(zxnz.sql.select({
                    table: T_MERCHANT,
                    fields: 'zxnz_UUID',
                    where: "Owner='{0}' or locate(concat(',', '{0}', ','), Users)<>0".format(_user.uuid)
                }))
                .query('Paging Events: ', function (sql, data){
                    if(!data.length){
                        return new Error('未找到活动组织！');
                    }
                    var _ids = data.map(function (item){
                        return item.zxnz_UUID;
                    });
                    _filters.Merchant = {
                        name: "locate(Merchant_UUID, '{0}')".format(',' + _ids.join(',') + ','),
                        opt: '<>',
                        value: 0
                    };
                    _filters.Table_Generated = {
                        opt: '=',
                        value: 1
                    };
                    _filters.Status = {
                        opt: '=',
                        value: 1
                    };
                    _filters.End_Time = {
                        name: 'UNIX_TIMESTAMP(End_Time)',
                        opt: '<',
                        value: '{{UNIX_TIMESTAMP(now())}}'
                    };
                    return zxnz.sql.paging({
                        table: T_EVENT,
                        fields: [
                            'zxnz_UUID, zxnz_Label, Roles, Show_Count, Table_Name, Unique_Check, Email_Enabled, Footer_Title, Owner, Error_Message, Success_Message',
                            'Attachments, Logo, Description, Is_Public, Comment, Text_Color, Background_Image, zxnz_Inserted_Time, Max_Count, Count, zxnz_Note, Status, Table_Generated',
                            'Start_Time, End_Time, Checkin_Start_Time, Checkin_End_Time',
                            'Address, Address_TX_Gcj02, Entry_Fee',
                            'zxnz_enroll_merchant_Created_User, zxnz_enroll_merchant_Updated_User',
                            'enroll_merchant_convert_merchant_uuid(Merchant_UUID) as Merchant',
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
                    });
                })
                .commit()
                .then(function (data, fields){
                    response.success(data);
                }, function (err){
                    response.error(err);
                });
            }
        },
        inivteEvents: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user'),
                    _filters = request.getJSON('filters'),
                    _transaction = zxnz.store.beginPoolTransaction();
                _transaction.query('Paging Events: ', function (sql, data){
                    _filters.Users = {
                        name: "locate(',{0},', Users)".format(_user.uuid),
                        opt: '<>',
                        value: 0
                    };
                    return zxnz.sql.paging({
                        table: T_EVENT,
                        fields: [
                            'zxnz_UUID, zxnz_Label, Roles, Show_Count, Table_Name, Unique_Check, Email_Enabled, Footer_Title, Owner, Error_Message, Success_Message',
                            'Attachments, Logo, Description, Is_Public, Comment, Text_Color, Background_Image, zxnz_Inserted_Time, Max_Count, Count, zxnz_Note, Status, Table_Generated',
                            'Start_Time, End_Time, Checkin_Start_Time, Checkin_End_Time',
                            'Address, Address_TX_Gcj02, Entry_Fee',
                            'zxnz_enroll_merchant_Created_User, zxnz_enroll_merchant_Updated_User',
                            'enroll_merchant_convert_merchant_uuid(Merchant_UUID) as Merchant',
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
                    });
                })
                .commit()
                .then(function (data, fields){
                    response.success(data);
                }, function (err){
                    response.error(err);
                });
            }
        },
        pagingAllEvents: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user'),
                    _transaction = zxnz.store.beginPoolTransaction();
                _transaction.query(zxnz.sql.select({
                    table: T_MERCHANT,
                    fields: 'zxnz_UUID',
                    where: "Owner='{0}' or locate(concat(',', '{0}', ','), Users)<>0".format(_user.uuid)
                }))
                .query('Paging Events: ', function (sql, data){
                    if(!data.length){
                        return new Error('未找到活动组织！');
                    }
                    var _ids = data.map(function (item){
                        return item.zxnz_UUID;
                    });
                    return zxnz.sql.paging({
                        table: T_EVENT,
                        fields: [
                            'zxnz_UUID, zxnz_Label, Roles, Show_Count, Table_Name, Unique_Check, Email_Enabled, Footer_Title, Owner, Error_Message, Success_Message',
                            'Attachments, Logo, Description, Is_Public, Comment, Text_Color, Background_Image, zxnz_Inserted_Time, Max_Count, Count, zxnz_Note, Status, Table_Generated',
                            'Start_Time, End_Time, Checkin_Start_Time, Checkin_End_Time',
                            'Address, Address_TX_Gcj02, Entry_Fee',
                            'zxnz_enroll_merchant_Created_User, zxnz_enroll_merchant_Updated_User',
                            'enroll_merchant_convert_merchant_uuid(Merchant_UUID) as Merchant',
                            'enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Created_User) as Created_User',
                            'enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Updated_User) as Updated_User'
                        ],
                        pageIndex: request.getValue('pageIndex'),
                        pageSize: request.getValue('pageSize'),
                        where: "locate(Merchant_UUID, '{0}')<>0".format(',' + _ids.join(',') + ','),
                        order: {
                            zxnz_Inserted_Time: 'asc',
                            zxnz_Updated_Time: 'asc'
                        }
                    });
                })
                .commit()
                .then(function (data, fields){
                    response.success(data);
                }, function (err){
                    response.error(err);
                });
            }
        },
        pagingInivtes: {
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user'),
                    _where = "User_UUID='{0}'".format(_user.uuid) + " or zxnz_enroll_merchant_Created_User='{0}'".format(_user.uuid);

                zxnz.store.beginPoolTransaction().query(zxnz.sql.paging({
                    table: T_MERCHANT_INIVTE,
                    fields: [
                        '*',
                        'enroll_merchant_convert_merchant_uuid(Merchant_UUID) as merchant',
                        'enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Created_User) as inviter',
                        'enroll_merchant_convert_user_uuid(User_UUID) as invitor'
                    ],
                    pageIndex: request.getValue('pageIndex'),
                    pageSize: request.getValue('pageSize'),
                    where: _where,
                    order: {
                        zxnz_Inserted_Time: 'desc',
                        zxnz_Updated_Time: 'desc'
                    }
                }))
                .commit()
                .then(function (data, fields){
                    response.success(data);
                }, function (err){
                    response.error(err);
                });
            }
        }
    }
});