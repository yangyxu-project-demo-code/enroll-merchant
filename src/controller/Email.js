module.exports = zn.Controller('email', {
    validate: true,
    methods: {
        sendEmail: {
            method: 'GET/POST',
            argv: {
                subject: null,
                tos: null,
                content: null
            },
            value: function (request, response, application, context, router){
                var _values = request.getValue();
                if(_values.attachments && _values.attachments.length){
                    zxnz.store
                    .beginPoolTransaction()
                    .query(zxnz.sql.select({
                        table: 'zxnz_core_fs_File',
                        fields: 'zxnz_core_fs_file_Name, zxnz_core_fs_file_Saved_Path',
                        where: "zxnz_core_fs_file_Temp_Name in ({0})".format(_values.attachments)
                    }))
                    .commit()
                    .then(function (data){
                        var _files = data.map((file)=> {
                            return {
                                filename: file.zxnz_core_fs_file_Name,
                                path: file.zxnz_core_fs_file_Saved_Path
                            };
                        });
                        context.mailTransporter.sendMail({
                            from: "报名活动号 <shqzx.activity@qq.com>",
                            to: _values.tos,
                            subject: _values.subject,
                            html: _values.content,
                            attachments: _files
                        }, function (err,info){
                            if(err){
                                response.error(err);
                            }else {
                                response.success(info);
                            }
                        });
                    });
                }else{
                    context.mailTransporter.sendMail({
                        from: "报名活动号 <shqzx.activity@qq.com>",
                        to: _values.tos,
                        subject: _values.subject,
                        html: _values.content
                    }, function (err,info){
                        if(err){
                            response.error(err);
                        }else {
                            response.success(info);
                        }
                    });
                }
            }
        }
    }
});