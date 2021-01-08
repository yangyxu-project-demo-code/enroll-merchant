module.exports = {
    mode: 'production',
    host: '0.0.0.0',
    port: 8800,
    root: './',
    web_root: './web/www/',
    node_modules: [
        'zxnz-core-base',
        'zxnz-core-fs',
        'zxnz-core-wechat'
    ],
    session: {
        redis: {
            expire: 60 * 60 * 8,
            host: '127.0.0.1',
            port: 6379
        }
    },
    databases: [
        {
            default: true,
            modules: ['@zeanium/database-mysql'],
            port: 3306,
            host: '127.0.0.1',
            user: 'root',
            password: 'xxx',
            database:'xxx'
        }
    ],
    wx: {
        ID: 'gh_a527c960a5da',
        Key: '05d519de985e4092ac6d99066b07a1b2',
        MchId: '1602660244',
        AppID: 'wx89943c5323b5ee11',
        AppSecret: 'a39dba7b0717b0d1cd5f2ca32b446d2b',
        CallBackUrl: 'http://enroll-user-api.youyangit.com/zxnz.core.wechat/wx/validate',
        Token: 'enroll2020',
        EncodingAESKey: '9NBuI9DKoIaAZHVgHfYHmViRe6wah8zafeTjIwrfpL9',
        Pfx: './1602660244_20200912_cert/apiclient_cert.p12',
        WXHOST: "https://api.weixin.qq.com/cgi-bin"
    }
};