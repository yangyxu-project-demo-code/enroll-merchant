module.exports = zxnz.Model("Merchant_Member", {
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
        User_UUID: {
            value: null,
            type: ['varchar', 50],
            default: 0
        },
        Name: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Level: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        ID: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Member_Code: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Birthday: {
            value: null,
            type: ['datetime'],
            default: null
        },
        Sex: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Age: {
            value: null,
            type: ['int', 10],
            default: 0
        },
        Mobile: {
            value: null,
            type: ['varchar', 20],
            default: ''
        },
        Email: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        School: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        School_Address: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        School_PostCode: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Grade: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        City: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        District: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Town: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Home_Address: {
            value: null,
            type: ['varchar', 200],
            default: ''
        },
        Home_PostCode: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Note: {
            value: null,
            type: ['varchar', 1000],
            default: ''
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
        }
    }
});