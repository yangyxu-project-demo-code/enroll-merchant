module.exports = zxnz.Model("Type", {
    mixins: [
        zxnz.ref.Base,
        require('../ref/Base')
    ],
    properties: {
        Merchant_UUID: {
            value: null,
            type: ['varchar', 50],
            default: 0
        },
        Module: {
            value: null,
            type: ['varchar', 50],
            default: 0
        },
        Status: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Table_Prefix: {
            value: null,
            type: ['varchar', 50],
            default: 'zxnz_enroll_merchant_Event_'
        },
        Label: {
            value: null,
            type: ['varchar', 100],
            default: ''
        }
    }
});