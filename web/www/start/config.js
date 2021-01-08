(function (zn){

    zn.setting.setKey('zn.data', {
        host: 'http://127.0.0.1:8800'
    });

    zn.setting.setKey('enroll.user', {
        api: 'http://127.0.0.1:8900',
        submit: 'http://enroll-user.shqzx-activity.com/web.html#/event/submit/',
        checkin: 'http://enroll-user.shqzx-activity.com/web.html#/event/checkin/',
    });

    zn.setting.setKey('zr.uploader', {
        host: 'http://127.0.0.1:8800',
        uploadHost: '',
        fetchHost: '',
        downloadHost: '',
        uploadApi: '/zxnz.core.fs/upload/files',
        fetchApi: '/zxnz.core.fs/fetch/file/',
        fetchsApi: '/zxnz.core.fs/fetch/files/',
        fetchImageApi: '/zxnz.core.fs/fetch/image/',
        downloadApi: '/zxnz.core.fs/download/file/'
    });
    
    zn.setting.$imageSrc = function (uuid){
        return zn.setting.path('zr.uploader.host') + zn.setting.path('zr.uploader.fetchImageApi') + uuid;
    }

})(zn);