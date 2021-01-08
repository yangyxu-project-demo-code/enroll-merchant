var T_EVENT = "zxnz_enroll_merchant_Event";
var T_EVENT_FIELD = "zxnz_enroll_merchant_Event_Field";
module.exports = zn.Controller('event.field', {
    validate: true,
    methods: {
        updateField: {
            method: 'POST',  
            route: '/update/:zxnz_UUID',
            argv: {
                zxnz_UUID: null
            },
            value: function (request, response, chain){
                var _value = request.getValue();
                zxnz.store.beginPoolTransaction()
                    .query(zxnz.sql.update({
                        table: T_EVENT_FIELD,
                        updates: _value,
                        where: { 
                            zxnz_UUID: _value.zxnz_UUID
                        }
                    }))
                    .commit()
                    .then(function (){
                        response.success('成功');
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        deleteField: {
            method: 'POST',
            route: '/delete/:field_uuid',
            argv: {
                field_uuid: null,
                event_uuid: null
            },
            value: function (request, response, chain){
                var _field_uuid = request.getValue('field_uuid');
                var _event_uuid = request.getValue('event_uuid');
                zxnz.store.beginPoolTransaction()
                    .query([
                        zxnz.sql.select({
                            table: T_EVENT,
                            fileds: [ '*' ],
                            where: {
                                zxnz_UUID: _event_uuid
                            }
                        }),
                        zxnz.sql.select({
                            table: T_EVENT_FIELD,
                            fileds: [ '*' ],
                            where: {
                                zxnz_UUID: _field_uuid
                            }
                        })
                    ])
                    .query('V: ', function (sql, data){
                        if(!data[0].length){
                            throw new Error('活动不存在');
                        }

                        var _sql = zxnz.sql.delete({
                            table: T_EVENT_FIELD,
                            where: { 
                                zxnz_UUID: _field_uuid 
                            }
                        });

                        if(data[0][0].Table_Generated) {
                            _sql = _sql + "alter table {0} drop column {1};".format(data[0][0].Table_Name, data[1][0].Name);
                        }

                        return _sql;
                    })
                    .commit()
                    .then(function (){
                        response.success('删除成功');
                    }, function (err){
                        response.error(err);
                    });
            }
        },
        orderField: {
            method: 'GET',
            route: '/order/:field_uuid',
            argv: {
                field_uuid: null,
                order: 'up'
            },
            value: function (request, response, chain){
                var _field_uuid = request.getValue('field_uuid'),
                    _order = request.getValue('order'),
                    _field = null;
                zxnz.store.beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_EVENT_FIELD,
                        where: { 
                            zxnz_UUID: _field_uuid 
                        }
                    }))
                    .query('validate', function (sql, data){
                        _field = data[0];
                        if(!_field){
                            return new Error('未查到该字段');
                        }

                        if(_order=='up'){
                            if(_field.Field_Order == 1){
                                return new Error('已经是最高');
                            }else {
                                return zxnz.sql.update({
                                    table: T_EVENT_FIELD,
                                    updates: { 
                                        Field_Order: _field.Field_Order 
                                    },
                                    where: { 
                                        Field_Order: _field.Field_Order - 1, 
                                        Event_UUID: _field.Event_UUID 
                                    }
                                }) + zxnz.sql.update({
                                    table: T_EVENT_FIELD,
                                    updates: {
                                        Field_Order: (_field.Field_Order - 1)
                                    },
                                    where: { 
                                        zxnz_UUID: _field_uuid 
                                    }
                                });
                            }
                        }else {
                            return zxnz.sql.update({
                                table: T_EVENT_FIELD,
                                updates: { 
                                    Field_Order: _field.Field_Order 
                                },
                                where: { 
                                    Field_Order: _field.Field_Order + 1, 
                                    Event_UUID: _field.Event_UUID 
                                }
                            }) + zxnz.sql.update({
                                table: T_EVENT_FIELD,
                                updates: {
                                    Field_Order: (_field.Field_Order + 1)
                                },
                                where: { 
                                    zxnz_UUID: _field_uuid 
                                }
                            });
                        }
                    })
                    .commit()
                    .then(function (){
                        response.success('排序成功');
                    }, function (err){
                        response.error(err);
                    });
            }
        }
    }
});