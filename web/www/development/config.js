(function (zn){

    zn.setting.data({
        'zn.data': {
            host: 'http://enroll-merchant-api.shqzx-activity.com'
        },
        'zr.uploader': {
            host: 'http://enroll-merchant-api.shqzx-activity.com',
            uploadHost: '',
            fetchHost: '',
            downloadHost: '',
            uploadApi: '/zxnz.core.fs/upload/files',
            fetchApi: '/zxnz.core.fs/fetch/file/',
            fetchsApi: '/zxnz.core.fs/fetch/files/',
            fetchImageApi: '/zxnz.core.fs/fetch/image/',
            downloadApi: '/zxnz.core.fs/download/file/'
        }
    });

    zn.setting.$imageSrc = function (uuid){
        return zn.setting.path('zr.uploader.host') + zn.setting.path('zr.uploader.fetchImageApi') + uuid;
    }

    zn.setting.setKey('enroll.user', {
        submit: 'http://enroll-user.shqzx-activity.com/web.html#/event/submit/',
        checkin: 'http://enroll-user.shqzx-activity.com/web.html#/event/checkin/',
    });

})(zn);