module.exports = zxnz.Model("User", {
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
        Name: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Real_Name: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Password: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Mobile: {
            value: null,
            type: ['varchar', 20],
            default: ''
        },
        Mobile_Verified: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Email: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Email_Verified: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        State: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Actived: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Actived_Time: {
            value: null,
            type: ['datetime'],
            default: null
        },
        Login_Count: {
            value: null,
            type: ['tinyint', 2],
            default: 0
        },
        Login_Last_Time: {
            value: null,
            type: ['datetime'],
            default: null
        },
        Login_Deadline: {
            value: null,
            type: ['datetime'],
            default: null
        }
    }
});