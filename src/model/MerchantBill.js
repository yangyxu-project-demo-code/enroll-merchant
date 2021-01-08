module.exports = zxnz.Model("Merchant_Bill", {
    mixins: [
        zxnz.ref.Base,
        require('../ref/Base')
    ],
    properties: {
        User_UUID: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        User_Email: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Merchant_UUID: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Owner_UUID: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Role: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Description: {
            value: null,
            type: ['varchar', 2000],
            default: ''
        },
        Status: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        }
    }
});