module.exports = zxnz.Model("Merchant", {
    mixins: [
        zxnz.ref.Base,
        require('../ref/Base')
    ],
    properties: {
        Actived: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Verified: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Is_Public: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Label: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Name: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Account: {
            value: null,
            type: ['decimal', [ 10,2 ]],
            default: 0
        },
        Account_In: {
            value: null,
            type: ['decimal', [ 10,2 ]],
            default: 0
        },
        Account_Out: {
            value: null,
            type: ['decimal', [ 10,2 ]],
            default: 0
        },
        Table_Prefix: {
            value: null,
            type: ['varchar', 50],
            default: 'zxnz_enroll_merchant_Merchant_'
        },
        Logo: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Video: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Attachments: {
            value: null,
            type: ['varchar', 2000],
            default: ','
        },
        Description: {
            value: null,
            type: ['longtext']
        },
        Imgs: {
            value: null,
            type: ['varchar', 2000],
            default: ','
        },
        Videos: {
            value: null,
            type: ['varchar', 2000],
            default: ','
        },
        Owner: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Owners: {
            value: null,
            type: ['varchar', 2000],
            default: ','
        },
        Users: {
            value: null,
            type: ['varchar', 2000],
            default: ','
        },
        Status: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        }
    }
});