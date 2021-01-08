module.exports = zxnz.Model("User_Log", {
    mixins: [
        zxnz.ref.Base,
        require('../ref/Base')
    ],
    properties: {
        IP: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Action: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        User_UUID: {
            value: null,
            type: ['varchar', 50],
            default: ''
        }
    }
});