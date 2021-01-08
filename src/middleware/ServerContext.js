
module.exports = zn.Middleware.ServerContext({
    methods: {
        initial: function (config, server, context){

        },
        requestAccept: function (serverRequest, serverResponse){
            
        },
        sessionVerified: function (request, response, application, context, router, session){
            if(zxnz && zxnz.sql && zxnz.sql.parser) {
                var parser = zxnz.sql.parser,
                    sessionuuid = session.getValue('user').uuid;
                parser.upon('parseUpdates', function (parser, value, data){
                    if(data.table.indexOf('zxnz_enroll_merchant') == 0){
                        value.zxnz_Updated_Time = '{{now()}}';
                        value.zxnz_enroll_merchant_Updated_User = sessionuuid;
                    }
                });

                parser.upon('parseValues', function (parser, value, data){
                    if(data.table.indexOf('zxnz_enroll_merchant') == 0) {
                        value.zxnz_enroll_merchant_Created_User = sessionuuid;
                    }
                });
            }
        }
    }
});