var T_COURSE = "zxnz_enroll_merchant_Course";
var T_COURSE_FIELD = "zxnz_enroll_merchant_Course_Field";
var T_TYPE = "zxnz_enroll_merchant_Type";
var T_MERCHANT = "zxnz_enroll_merchant_Merchant";
var node_officegen = require('officegen');

module.exports = zn.Controller('course', {
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
                        var _type = data[0];
                        if(!_type){
                            return response.error('未查到该组织'), false;
                        }

                        _values.Table_Name = _type.Table_Prefix + '_' + zn.date.nowDateString() + '_' + zn.util.randomNumbers(6)
                        return zxnz.sql.insert({
                            table: T_COURSE,
                            values: _values
                        });
                    }, function (err, data){
                        if(err){
                            return response.error(err);
                        }else {
                            return response.success("创建成功");
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
        pagingEventResult: {
            method: 'GET/POST',
            argv: {
                event_uuid: null
            },
            value: function (request, response, application, context, router){
                var _values = request.getValue(),
                    _event_uuid = request.getValue('event_uuid');
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_COURSE,
                        where: {
                            zxnz_UUID: _event_uuid
                        }
                    }))
                    .query('Paging Event Data: ', function (sql, data){
                        if(!data[0]){
                            return new Error('未查到该活动');
                        }else {
                            _values.table = data[0].Table_Name;
                            _values.fields = "*";
                            return zxnz.sql.paging(_values);
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
        deleteEventResult: {
            method: 'GET/POST',
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
                        table: 'zn_plugin_survey_event',
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
                                table: T_COURSE,
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
            argv: {
                event_uuid: null
            },
            value: function (request, response, application, context, router){
                var _event_uuid = request.getValue('event_uuid');
                var _data = {};
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_COURSE,
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
                                table: _data.event.table_name
                            }) + zxnz.sql.select({
                                table: T_COURSE_FIELD,
                                where: { Event_Id: _data.event.zxnz_ID },
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
                        //_sheet0.name = _data.event.zn_title;
                        _sheet0.data[0] = [];
                        _fields.push({ title: '提交时间', name: 'zxnz_Inserted_Time' })
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
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.paging({
                        table: T_COURSE,
                        pageIndex: request.getValue('pageIndex'),
                        pageSize: request.getValue('pageSize'),
                        where:{
                            Event_UUID: request.getValue('event_uuid')
                        },
                        order: {
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
        getEventFields: {
            method: 'GET/POST',
            argv: {
                event_uuid: null
            },
            value: function (request, response, application, context, router){
                var _event_uuid = request.getValue('event_uuid');
                var _data = {};
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_COURSE,
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
                                table: T_COURSE_FIELD,
                                where: {
                                    event_id: _data.event.zxnz_ID,
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
            method: 'GET/POST',
            value: function (request, response, application, context, router){
                var _value = request.getValue();
                /*
                _value.name = node_pinyin(_value.title, { noTone: true, filterChinese: true }).split(' ').join('_') + '_' +zn.util.getRandomNumbers();
                _value.name = _value.replace(/\(/g, '_');
                _value.name = _value.replace(/\)/g, '_');
                _value.name = _value.replace(/\:/g, '_');
                _value.name = _value.replace(/\,/g, '_');
                _value.name = _value.replace(/\,/g, '_');
                */
                _value.name = "zn_table_field_name_" + zn.util.getRandomNumbers();
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.insert({
                        table: T_COURSE_FIELD,
                        values: _value
                    }))
                    .commit()
                    .then(function (data, fields){
                        response.success(data);
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        deployEvent: {
            method: 'GET/POST',
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
                        table: 'zn_plugin_survey_event',
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
                            table: 'zn_plugin_survey_event_field',
                            where: {
                                Event_Id: data[0].zxnz_ID
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
                        __fields['zn_plugin_survey_status'] = {
                            type: ["int", 11],
                            default: 0
                        };
                        __fields['zn_plugin_wechat_open_id'] = {
                            type: ["varchar", 50],
                            default: ''
                        };
                        _fields.map(function(field){
                            __fields[field.Name] = {
                                //type: JSON.parse(field.field_type),
                                type: ["text"]
                            };
                        });
                        return zxnz.Model(_data.event.Table_Name, {
                            mixins: [
                                zxnz.ref.Base
                            ],
                            properties: __fields
                        }).getCreateSql() + zxnz.sql.update({
                            table: T_COURSE,
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
                            table: T_COURSE,
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
            }
        }
    }
});