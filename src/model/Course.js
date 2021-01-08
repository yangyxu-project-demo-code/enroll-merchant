module.exports = zxnz.Model("Course", {
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
        Parent_Id: {
            value: null,
            type: ['bigint', 20],
            default: 0
        },
        Status: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Type: {
            value: null,
            type: ['int', 10],
            default: 0
        },
        Max_Count: {
            value: null,
            type: ['int', 10],
            default: 0
        },
        Count: {
            value: null,
            type: ['int', 10],
            default: 0
        },
        Start_Time: {
            value: null,
            type: ['datetime'],
            default: null
        },
        End_Time: {
            value: null,
            type: ['datetime'],
            default: null
        },
        Table_Name: {
            value: null,
            type: ['varchar', 100],
            default: ''
        },
        Table_Generated: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Show_Count: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Unique_Check: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Email_Enabled: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Footer_Title: {
            value: null,
            type: ['varchar', 100],
            default: ''
        },
        Owner: {
            value: null,
            type: ['varchar', 50],
            default: ''
        },
        Error_Message: {
            value: null,
            type: ['longtext']
        },
        Success_Message: {
            value: null,
            type: ['longtext']
        },
        Attachments: {
            value: null,
            type: ['varchar', 2000],
            default: ','
        },
        Comment: {
            value: null,
            type: ['varchar', 1000],
            default: ''
        },
        Background_Image: {
            value: null,
            type: ['varchar', 100],
            default: ''
        },
        Text_Color: {
            value: null,
            type: ['varchar', 10],
            default: '#2D2A2A'
        }
    }
});