var T_EVENT = "zxnz_enroll_merchant_Event";
var T_EVENT_FIELD = "zxnz_enroll_merchant_Event_Field";
var T_TYPE = "zxnz_enroll_merchant_Type";
var T_USER = "zxnz_enroll_merchant_User";
var T_MERCHANT = "zxnz_enroll_merchant_Merchant";
var node_path = require('path');
var node_fs = require('fs');
var node_officegen = require('officegen');
var node_pinyin = require('chinese-to-pinyin');
var BaseRef = require('../ref/Base');

module.exports = zn.Controller('event', {
    validate: true,
    methods: {
        createEvent: {
            method: 'GET/POST',
            argv: {
                values: null
            },
            value: function (request, response, application, context, router){
                var _values = request.getValue('values');
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_MERCHANT,
                        where: { zxnz_UUID: _values.Merchant_UUID }
                    }))
                    .query('validate', function (sql, data){
                        var _merchant = data[0];
                        if(!_merchant){
                            return response.error('未查到该组织'), false;
                        }
                        _values.zxnz_UUID = zn.uuid();
                        _values.Table_Name = _merchant.Table_Prefix + '_event_' + zn.date.nowDateString() + "_" + zn.util.randomNumbers(6);
                        return zxnz.sql.insert({
                            table: T_EVENT,
                            values: _values
                        });
                    })
                    .commit()
                    .then(function (data){
                        response.success(data);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        deleteEvent: {
            method: 'DELETE',
            route: '/delete/:event_uuid',
            value: function (request, response, application, context, router){
                var _event_uuid = request.getValue('event_uuid');
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: { zxnz_UUID: _event_uuid }
                    }))
                    .query('validate', function (sql, data){
                        var _event = data[0];
                        if(!_event){
                            return response.error('未查到该活动'), false;
                        }
                        if(_event.Table_Generated){
                            return response.error('该活动正在进行中, 不允许删除！'), false;
                        }
                        return zxnz.sql.delete({
                            table: T_EVENT,
                            where: { zxnz_UUID: _event_uuid }
                        }) + zxnz.sql.delete({
                            table: T_EVENT_FIELD,
                            where: { Event_UUID: _event_uuid }
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
        updateEvent: {
            method: 'POST',  
            argv: {
                event_uuid: null,
                updates: null
            },
            value: function (request, response){
                zxnz.store.beginPoolTransaction()
                    .query(zxnz.sql.update({
                        table: T_EVENT,
                        updates: request.getJSON('updates'),
                        where: { 
                            zxnz_UUID: request.getValue('event_uuid')
                        }
                    }))
                    .commit()
                    .then(function (){
                        response.success('更新成功');
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        updateItem: {
            method: 'POST',  
            argv: {
                event_uuid: null,
                item_uuid: null,
                updates: null
            },
            value: function (request, response){
                zxnz.store.beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        fields: 'Table_Name',
                        where: { 
                            zxnz_UUID: request.getValue('event_uuid')
                        }
                    }))
                    .query('Paging Event Data: ', function (sql, data){
                        if(!data[0]){
                            return new Error('未查到该活动');
                        }else {
                            return zxnz.sql.update({
                                table: data[0].Table_Name,
                                updates: request.getJSON('updates'),
                                where: {
                                    zxnz_UUID: request.getValue('item_uuid')
                                }
                            });
                        }
                    })
                    .commit()
                    .then(function (){
                        response.success('更新成功');
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        pagingEventResult: {
            method: 'GET/POST',
            argv: {
                event_uuid: null
            },
            value: function (request, response, application, context, router, session){
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: {
                            zxnz_UUID: request.getValue('event_uuid')
                        }
                    }))
                    .query('Paging Event Data: ', function (sql, data){
                        if(!data[0]){
                            return new Error('未查到该活动');
                        }else {
                            var _filters = request.getJSON('filters');
                            if(request.getValue('myself')) {
                                _filters.enroll_merchant_User_UUID = {
                                    opt: '=',
                                    value: request.session.getValue('user').uuid
                                }
                            }
                            return zxnz.sql.paging({
                                table: data[0].Table_Name,
                                fields: [
                                    '*',
                                    'zxnz_core_wechat_convert_user_name(enroll_user_User_WXOpenID) as wx_user_name',
                                    'enroll_user_convert_user_uuid(enroll_user_User_UUID) as enroll_user_User_UUID, enroll_user_User_UUID as user_uuid',
                                    'enroll_merchant_convert_user_uuid(enroll_merchant_User_UUID) as enroll_merchant_User_UUID, enroll_merchant_User_UUID as merchant_user_uuid'
                                ],
                                where: _filters,
                                pageIndex: request.getValue('pageIndex'),
                                pageSize: request.getValue('pageSize'),
                                order: request.getJSON('order')
                            });
                        }
                    })
                    .commit()
                    .then(function (data){
                        response.success(data);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        deleteEventResult: {
            method: 'POST',
            argv: {
                event_uuid: null,
                ids: null
            },
            value: function (request, response, application, context, router){
                var _event_uuid = request.getValue('event_uuid');
                var _ids = request.getValue("ids");
                var _event = null;
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: {
                            zxnz_UUID: _event_uuid
                        }
                    }))
                    .query('Select Field', function (sql, data){
                        _event = data[0];
                        if(!_event){
                            return new Error('未查到该活动');
                        }else {
                            _ids = _ids.split(',').map(function (item){
                                if(item){
                                    return item;
                                }
                            });
                            return zxnz.sql.delete({
                                table: _event.Table_Name,
                                where: "zxnz_ID in (" + _ids.join(',') + ")"
                            }) + zxnz.sql.update({
                                table: T_EVENT,
                                updates: "count = count - " + (_ids.length).toString(),
                                where: {
                                    zxnz_UUID: _event_uuid
                                }
                            });
                        }
                    })
                    .commit()
                    .then(function (data, fields){
                        response.success(data);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        downloadEventResult: {
            method: 'GET/POST',
            route: '/saveAsExcel/:event_uuid',
            argv: {
                event_uuid: null
            },
            value: function (request, response, application, context, router){
                var _filters = request.getJSON('filters');
                var _event_uuid = request.getValue('event_uuid');
                var _data = {};
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: {
                            zxnz_UUID: _event_uuid
                        }
                    }))
                    .query('Select Field', function (sql, data){
                        if(!data[0]){
                            return new Error('未查到该活动');
                        }else {
                            _data.event = data[0];
                            if(request.getValue('myself')) {
                                _filters.enroll_merchant_User_UUID = request.session.getValue('user').uuid;
                            }
                            return zxnz.sql.select({
                                table: _data.event.Table_Name,
                                where: _filters
                            }) + zxnz.sql.select({
                                table: T_EVENT_FIELD,
                                where: {
                                    Event_UUID: _data.event.zxnz_UUID
                                },
                                order: {
                                    Field_Order: 'asc'
                                }
                            });
                        }
                    })
                    .commit()
                    .then(function (data, fields){
                        var _rows = data[0], _fields = data[1], _fk = [];
                        var _xlsx = node_officegen('xlsx'),
                            _sheet0 = _xlsx.makeNewSheet();
                        _sheet0.name = _data.event.zxnz_Label;
                        _sheet0.data[0] = [];
                        _fields.push({ Label: '提交时间', Name: 'zxnz_Inserted_Time' })
                        _fields.forEach(function (field){
                            _sheet0.data[0].push(field.Label);
                            _fk.push(field.Name);
                        });
                        _rows.forEach(function (row, index){
                            _sheet0.data.push(_fk.map(function (key){
                                return row[key];
                            }));
                        });
                        response.writeHead(200, {
                            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            'Content-disposition': 'attachment; filename=' + encodeURI(_data.event.zxnz_Label) + '.xlsx'
                        });
                        _xlsx.generate(response._serverResponse);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        pagingEventFields: {
            method: 'GET/POST',
            argv: {
                event_uuid: null
            },
            value: function (request, response, application, context, router){
                var _filters = request.getJSON('filters');
                _filters.Event_UUID = {
                    value: request.getValue('event_uuid'),
                    opt: '='
                }
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.paging({
                        table: T_EVENT_FIELD,
                        fields: [
                            'zxnz_UUID, Label, Name, Type, Hint, Attrs, Data, Props, Repeat_Verify, Required, Value, Width, zxnz_Updated_Time, zxnz_Inserted_Time, zxnz_Note',
                            'zxnz_enroll_merchant_Created_User, enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Created_User) as Created_User',
                            'zxnz_enroll_merchant_Updated_User, enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Updated_User) as Updated_User'
                        ],
                        pageIndex: request.getValue('pageIndex'),
                        pageSize: request.getValue('pageSize'),
                        where: _filters,
                        order: {
                            Field_Order: 'asc',
                            zxnz_Inserted_Time: 'asc',
                            zxnz_Updated_Time: 'asc'
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
        previewEvent: {
            method: 'GET/POST',
            route: '/preview.event/:event_uuid',
            argv: {
                event_uuid: null
            },
            value: function (request, response, application, context, router){
                var _event_uuid = request.getValue('event_uuid');
                var _data = {};
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        fields: [
                            'zxnz_UUID, zxnz_Label, Roles, Show_Count, Table_Name, Unique_Check, Email_Enabled, Footer_Title, Owner, Error_Message, Success_Message',
                            'Attachments, Description, Is_Public, Comment, Text_Color, zxnz_Inserted_Time, Max_Count, Count, zxnz_Note, Status, Table_Generated',
                            'Background_Image, Logo, Imgs, Videos',
                            'Start_Time, End_Time, Checkin_Start_Time, Checkin_End_Time',
                            'Address, Address_TX_Gcj02, Entry_Fee',
                            'enroll_merchant_convert_merchant_uuid(Merchant_UUID) as Merchant',
                            'zxnz_enroll_merchant_Created_User, zxnz_enroll_merchant_Updated_User',
                            'enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Created_User) as Created_User',
                            'enroll_merchant_convert_user_uuid(zxnz_enroll_merchant_Updated_User) as Updated_User'
                        ],
                        where: {
                            zxnz_UUID: _event_uuid
                        }
                    }))
                    .query('Select Field', function (sql, data){
                        if(!data[0]){
                            return new Error('未查到该活动');
                        }else {
                            _data.event = data[0];
                            return zxnz.sql.select({
                                table: T_EVENT_FIELD,
                                fields: 'zxnz_UUID, Label, Name, Type, Width, Required, Hint, Value, Data, Props, Attrs, Text_Color, Field_Order',
                                where: {
                                    Event_UUID: _event_uuid,
                                    zxnz_Deleted: 0
                                },
                                order: {
                                    Field_Order: 'asc'
                                }
                            })
                        }
                    })
                    .commit()
                    .then(function (data, fields){
                        _data.fields = data;
                        response.success(_data);
                    }, function (err){
                        response.error(err);
                    });
            }
        }, 
        getEvent: {
            method: 'GET/POST',
            route: '/getEvent/:event_uuid',
            argv: {
                event_uuid: null
            },
            value: function (request, response, application, context, router){
                var _event_uuid = request.getValue('event_uuid');
                var _data = {};
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: {
                            zxnz_UUID: _event_uuid
                        }
                    }))
                    .query('Select Field', function (sql, data){
                        if(!data[0]){
                            return new Error('未查到该活动');
                        }else {
                            _data.event = data[0];
                            return zxnz.sql.select({
                                table: T_EVENT_FIELD,
                                where: {
                                    Event_UUID: _event_uuid,
                                    zxnz_Deleted: 0
                                },
                                order: {
                                    Field_Order: 'asc'
                                }
                            })
                        }
                    })
                    .commit()
                    .then(function (data, fields){
                        _data.fields = data;
                        response.success(_data);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        createEventField: {
            method: 'POST',
            argv: {
                Label: null,
                Type: null
            },
            value: function (request, response, application, context, router){
                var _value = request.getValue(),
                    _name = node_pinyin(_value.Label||'', { removeTone: true, firstCharacter: true, filterChinese: true, removeSpace: true });
                _name = _name+ '_' + zn.util.getRandomNumbers();
                _name = _name.replace(/\(/g, '_');
                _name = _name.replace(/\)/g, '_');
                _name = _name.replace(/\:/g, '_');
                _name = _name.replace(/\,/g, '_');
                _name = _name.replace(/\,/g, '_');

                _value.zxnz_UUID = zn.uuid();
                _value.Name = "zxnz_event_field__" + _value.Type.replace(/\./g, '$') + '__' + zn.util.getTime();
                _value.En_Name = _name;
                zxnz.store.beginPoolTransaction()
                    .query([
                        zxnz.sql.select({
                            table: T_EVENT,
                            fileds: [ '*' ],
                            where: {
                                zxnz_UUID: _value.Event_UUID
                            }
                        })
                    ])
                    .query('V: ', function (sql, data){
                        if(!data.length){
                            throw new Error('活动不存在');
                        }

                        var _sql = zxnz.sql.insert({
                            table: T_EVENT_FIELD,
                            values: _value
                        });

                        if(data[0].Table_Generated) {
                            _sql = _sql + "alter table {0} add column {1} TEXT default NULL;".format(data[0].Table_Name, _value.Name);
                        }

                        return _sql;
                    })
                    .commit()
                    .then(function (){
                        response.success('添加成功');
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
                        table: T_EVENT,
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
        deployEvent: {
            method: 'GET/POST',
            route: '/deploy/:event_uuid',
            argv: {
                event_uuid: null
            },
            value: function (request, response, application, context, router){
                var _event_uuid = request.getValue('event_uuid'),
                    _force = request.getValue('force'),
                    _data = {};

                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: {
                            zxnz_UUID: _event_uuid
                        }
                    }))
                    .query('Select Fields: ', function (sql, data, fields){
                        if(!data[0]){
                            return new Error('活动不存在');
                        }

                        if(data[0].Table_Generated && !_force){
                            return new Error('活动已经发布');
                        }

                        _data.event = data[0];
                        return zxnz.sql.select({
                            table: T_EVENT_FIELD,
                            where: {
                                Event_UUID: _data.event.zxnz_UUID
                            },
                            order: {
                                Field_Order: 'asc'
                            }
                        });
                    })
                    .query('create table', function (sql, rows){
                        if(!rows.length){
                            return new Error('该活动没有字段信息，请先添加字段!');
                        }
                        var _fields = rows, 
                            __fields = {};
                        _fields.map(function(field){
                            __fields[field.Name] = {
                                //type: JSON.parse(field.Field_Type),
                                type: ["text"]
                            };
                        });
                        __fields['Confirm_State'] = {
                            type: ["tinyint", 1],
                            default: 0
                        }
                        __fields['Checkin_State'] = {
                            type: ["tinyint", 1],
                            default: 0
                        }
                        __fields['Checkin_Time'] = {
                            type: ["datetime"],
                            default: null
                        }
                        __fields['Checkin_Address'] = {
                            type: ["varchar", 100],
                            default: ''
                        }
                        __fields['Checkin_Signature'] = {
                            type: ["longtext"]
                        }
                        __fields['Payment_State'] = {
                            type: ["tinyint", 1],
                            default: 0
                        }
                        __fields['Payment_Time'] = {
                            type: ["datetime"],
                            default: null
                        }
                        __fields['Payment_Order_Code'] = {
                            type: ["varchar", 100],
                            default: ''
                        }
                        __fields['Payment_Transaction_Id'] = {
                            type: ["varchar", 100],
                            default: ''
                        }
                        __fields['Payment_Settlement_Total_fee'] = {
                            type: ["decimal", [10,2]],
                            default: 0
                        }
                        __fields['Payment_Refund_Out_No'] = {
                            type: ["varchar", 100],
                            default: ''
                        }
                        __fields['Payment_Refund_Id'] = {
                            type: ["varchar", 100],
                            default: ''
                        }
                        __fields['Payment_Refund_Fee'] = {
                            type: ["decimal", [10,2]],
                            default: 0
                        }
                        __fields['enroll_user_User_UUID'] = {
                            type: ["varchar", 50],
                            default: ''
                        }
                        __fields['enroll_user_User_WXOpenID'] = {
                            type: ["varchar", 50],
                            default: ''
                        }
                        __fields['enroll_merchant_User_UUID'] = {
                            type: ["varchar", 50],
                            default: ''
                        }

                        return zxnz.Model(_data.event.Table_Name, {
                            mixins: [
                                zxnz.ref.Base,
                                BaseRef
                            ],
                            properties: __fields
                        }).getCreateModelSql()+ zxnz.sql.update({
                            table: T_EVENT,
                            where: { 
                                zxnz_UUID: _event_uuid 
                            },
                            updates: { 
                                Table_Generated: 1, 
                                Status: 1, 
                                Count: 0 
                            }
                        });
                    })
                    .commit()
                    .then(function (data){
                        response.success(data);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        getEventsByType: {
            method: 'GET/POST',
            argv: {

            },
            value: function (request, response, application, context, router){
                var _type = request.getValue('type'),
                    _status = request.getValue('status'),
                    _where = ['zxnz_Deleted=0 and Parent_Id=0'];
                if(_status !== undefined && _status != 100){
                    if(_status != -1){
                        _where.push(' and Status=' + _status);
                    }else {
                        _where.push(' and Status=1 and UNIX_TIMESTAMP(End_Time)<UNIX_TIMESTAMP(now())');
                    }
                }
                if(_type){
                    _where.push(' and Type=' + _type);
                }
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.paging({
                        table: T_EVENT,
                        where: _where,
                        pageIndex: request.getValue('pageIndex'),
                        pageSize: request.getValue('pageSize'),
                        order: {
                            zxnz_Inserted_Time: 'desc'
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
                event_uuid: null,
                email: null,
                description: null
            },
            value: function (request, response, application, context, router, session){
                var _user = null,
                    _email = request.getValue('email'),
                    _event_uuid = request.getValue('event_uuid');

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
                            table: T_EVENT,
                            where: "zxnz_UUID='" + _event_uuid + "' and locate(concat(',', '{0}', ','), Users)<>0".format(_user.zxnz_UUID)
                        });
                    })
                    .query('Validate User: ', function (sql, data){
                        if(data.length){
                            throw new Error('该用户已经是成员');
                        }

                        return zxnz.sql.update({
                            table: T_EVENT,
                            updates: "Users = replace(concat(Users, '," + _user.zxnz_UUID + ",'), ',,', ',')",
                            where: {
                                zxnz_UUID: _event_uuid
                            }
                        });
                    })
                    .commit()
                    .then(function (data){
                        var _emailRegisterActiveHtmlTemplate = node_fs.readFileSync(node_path.resolve(__dirname, '../template/email.merchant.inivte.html'),'utf-8');
                        context.mailTransporter.sendMail({
                            from: "报名活动号 <shqzx.activity@qq.com>",
                            to: _email,
                            subject: "报名活动号 - 活动成员邀请",
                            html: _emailRegisterActiveHtmlTemplate.format({
                                name: _user.Name,
                                note: request.getValue('description')
                            }),
                        }, function (err){
                            if(err){
                                zn.error(err);
                                response.error("邀请失败：" + err.message);
                            }else {
                                response.success("邀请成功");
                            }
                        });
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        removeUser: {
            method: 'DELETE',
            route: 'removeUser/:event_uuid/:name',
            argv: {
                event_uuid: null,
                name: null
            },
            value: function (request, response, application, context, router, session){
                var _user = null,
                    _name = request.getValue('name'),
                    _event_uuid = request.getValue('event_uuid');

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
                            table: T_EVENT,
                            updates: "Users = replace(Users, '," + _user.zxnz_UUID + ",', ',')",
                            where: {
                                zxnz_UUID: _event_uuid
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
                event_uuid: null,
                email: null,
                description: null
            },
            value: function (request, response, application, context, router, session){
                var _user = null,
                    _email = request.getValue('email'),
                    _event_uuid = request.getValue('event_uuid');
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
                            table: T_EVENT,
                            where: "zxnz_UUID='" + _event_uuid + "' and locate(concat(',', '{0}', ','), Owners)<>0".format(_user.zxnz_UUID)
                        });
                    })
                    .query('Validate User: ', function (sql, data){
                        if(data.length){
                            throw new Error('该用户已经是管理员');
                        }

                        return zxnz.sql.update({
                            table: T_EVENT,
                            updates: "Owners = replace(concat(Owners, '," + _user.zxnz_UUID + ",'), ',,', ',')",
                            where: {
                                zxnz_UUID: _event_uuid
                            }
                        });
                    })
                    .commit()
                    .then(function (data){
                        response.success("邀请成功");
                        var _emailRegisterActiveHtmlTemplate = node_fs.readFileSync(node_path.resolve(__dirname, '../template/email.merchant.inivte.html'),'utf-8');
                        context.mailTransporter.sendMail({
                            from: "报名活动号 <shqzx.activity@qq.com>",
                            to: _email,
                            subject: "报名活动号 - 活动管理员邀请",
                            html: _emailRegisterActiveHtmlTemplate.format({
                                name: _user.Name,
                                note: request.getValue('description')
                            }),
                        }, function (err){
                            if(err){
                                zn.error('邮件发送失败： ', err);
                            }else {
                                zn.success('邮件发送成功！');
                            }
                        });
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        removeOwner: {
            method: 'DELETE',
            route: 'removeOwner/:event_uuid/:name',
            argv: {
                event_uuid: null,
                name: null
            },
            value: function (request, response, application, context, router, session){
                var _user = null,
                    _name = request.getValue('name'),
                    _event_uuid = request.getValue('event_uuid');

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
                            table: T_EVENT,
                            updates: "Owners = replace(Owners, '," + _user.zxnz_UUID + ",', ',')",
                            where: {
                                zxnz_UUID: _event_uuid
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
        submitEvent: {
            method: 'GET/POST',
            argv: {
                event_uuid: null,
                data: null
            },
            value: function (request, response, application, context, router){
                var _user = request.session.getValue('user');
                var _event_uuid = request.getValue('event_uuid'),
                    _data = request.getJSON('data'),
                    _value = {};
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT,
                        where: { 
                            zxnz_UUID: _event_uuid, 
                            Table_Generated: 1,
                            Start_Time: {
                                name: 'UNIX_TIMESTAMP(Start_Time)',
                                opt: '<=',
                                value: '{{UNIX_TIMESTAMP(now())}}'
                            },
                            End_Time: {
                                name: 'UNIX_TIMESTAMP(End_Time)',
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

                        if(_value.event.Count == _value.event.Max_Count){
                            return new Error(_value.event.Error_Message || '报名已满');
                        }

                        return zxnz.sql.select({
                            table: _value.event.Table_Name,
                            where: {
                                enroll_user_User_UUID: _user.uuid
                            }
                        });
                    })
                    .query('insert', function (sql, data){
                        if(data[0] && _value.event.Unique_Check){
                            return new Error('您已经提交报名');
                        }else {
                            _data.enroll_user_User_UUID = _user.uuid;
                            _data.enroll_merchant_User_UUID = request.getValue('merchant_user_uuid') || '';
                            _data.zxnz_UUID = zn.uuid();
                            return zxnz.sql.insert({
                                table: _value.event.Table_Name,
                                values: _data
                            }) + zxnz.sql.update({
                                table: T_EVENT,
                                updates: 'Count=Count+1',
                                where: { zxnz_UUID: _event_uuid }
                            });
                        }
                    })
                    .commit()
                    .then(function (data){
                        _value.event.Table_Name = null;
                        delete _value.event.Table_Name;
                        _value.event.Table_Generated = null;
                        delete _value.event.Table_Generated;
                        response.success(_value);
                    }, function (err){
                        response.error(err);
                    });
            }
        }
    }
});