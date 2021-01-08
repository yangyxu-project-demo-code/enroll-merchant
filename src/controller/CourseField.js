var T_COURSE_FIELD = "zxnz_enroll_merchant_Course_Field";
module.exports = zn.Controller('course.field', {
    validate: true,
    methods: {
        orderField: {
            method: 'GET/POST',
            argv: {
                field_id: null,
                order: 'up'
            },
            value: function (request, response, chain){
                var _field_id = request.getValue('field_id'),
                    _order = request.getValue('order'),
                    _field = null;
                zxnz.store.beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: T_COURSE_FIELD,
                        where: { 
                            zxnz_ID: _field_id 
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
                                    table: T_COURSE_FIELD,
                                    updates: { 
                                        Field_Order: _field.Field_Order 
                                    },
                                    where: { 
                                        Field_Order: _field.Field_Order - 1, 
                                        Event_Id: _field.Event_Id 
                                    }
                                }) + zxnz.sql.update({
                                    table: T_COURSE_FIELD,
                                    updates: {
                                        Field_Order: (_field.Field_Order - 1)
                                    },
                                    where: { 
                                        zxnz_ID: _field_id 
                                    }
                                });
                            }
                        }else {
                            return zn.sql.update({
                                table: T_COURSE_FIELD,
                                updates: { 
                                    Field_Order: _field.Field_Order 
                                },
                                where: { 
                                    Field_Order: _field.Field_Order + 1, 
                                    Event_Id: _field.Event_Id 
                                }
                            }) + zn.sql.update({
                                table: T_COURSE_FIELD,
                                updates: {
                                    Field_Order: (_field.Field_Order + 1)
                                },
                                where: { 
                                    zxnz_ID: _field_id 
                                }
                            });
                        }
                    }).commit().then(function (){
                        response.success('排序成功');
                    }, function (err){
                        response.error(err);
                    });
            }
        }
    }
});