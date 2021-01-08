module.exports = zxnz.Model("Event_Field", {
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
        Event_UUID: {
            value: null,
            type: ['varchar', 50],
            default: 0
        },
        Repeat_Verify: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Field_Order: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Field_Type: {
            value: null,
            type: ['varchar', 100],
            default: '["varchat", 200]'
        },
        Field_Convert: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Field_Default: {
            value: null,
            type: ['varchar', 200],
            default: ''
        },
        Label: {
            value: null,
            type: ['varchar', 100],
            default: ''
        },
        Name: {
            value: null,
            type: ['varchar', 100],
            default: ''
        },
        En_Name: {
            value: null,
            type: ['varchar', 100],
            default: ''
        },
        Text_Color: {
            value: null,
            type: ['varchar', 10],
            default: ''
        },
        Type: {
            value: null,
            type: ['varchar', 100],
            default: ''
        },
        Width: {
            value: null,
            type: ['int', 10],
            default: 160
        },
        Required: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Value: {
            value: null,
            type: ['varchar', 2000],
            default: ''
        },
        Data: {
            value: null,
            type: ['varchar', 2000],
            default: ''
        },
        Props: {
            value: null,
            type: ['varchar', 2000],
            default: ''
        },
        Attrs: {
            value: null,
            type: ['varchar', 2000],
            default: ''
        }
    }
});