var T_USER = "zxnz_enroll_merchant_User";
var T_USER_Log = "zxnz_enroll_merchant_User_Log";
module.exports = zn.Controller('user', {
    validate: true,
    methods: {
        info: {
            method: 'GET',
            value: function (request, response, application, context, router, session){
                var _user = request.session.getValue('user');
                zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
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
                                User_UUID: _user.zxnz_UUID
                            }
                        });
                    })
                    .commit()
                    .then(function (){

                        response.success('登录成功');
                    }, function (err){
                        response.error(err);
                    });
            }
        }
    }
});