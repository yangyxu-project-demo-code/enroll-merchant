module.exports = zxnz.Model("Event", {
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
        Is_Public: {
            value: null,
            type: ['tinyint', 1],
            default: 0
        },
        Checkin_Start_Time: {
            value: null,
            type: ['datetime'],
            default: null
        },
        Checkin_End_Time: {
            value: null,
            type: ['datetime'],
            default: null
        },
        Checkin_Count: {
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
        Roles: {
            value: null,
            type: ['varchar', 100],
            default: ''
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
        Error_Message: {
            value: null,
            type: ['varchar', 1000],
            default: ''
        },
        Success_Message: {
            value: null,
            type: ['varchar', 1000],
            default: ''
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
        Description: {
            value: null,
            type: ['longtext']
        },
        Logo: {
            value: null,
            type: ['varchar', 50],
            default: ''
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
        Background_Image: {
            value: null,
            type: ['varchar', 100],
            default: ''
        },
        Entry_Fee: {
            value: null,
            type: ['decimal', [0,2]],
            default: 0
        },
        Address: {
            value: null,
            type: ['varchar', 500],
            default: ''
        },
        Address_TX_Gcj02: {
            value: null,
            type: ['varchar', 50],
            default: ','
        },
        Text_Color: {
            value: null,
            type: ['varchar', 10],
            default: '#2D2A2A'
        }
    }
});