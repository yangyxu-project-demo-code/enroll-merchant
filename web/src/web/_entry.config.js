var CODE_MESSAGE = {
	200: '服务器成功返回请求的数据。',
	201: '新建或修改数据成功。',
	202: '一个请求已经进入后台排队（异步任务）。',
	204: '删除数据成功。',
	400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
	401: '用户没有权限（令牌、用户名、密码错误）。',
	403: '用户得到授权，但是访问是被禁止的。',
	404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
	406: '请求的格式不可得。',
	410: '请求的资源被永久删除，且不会再得到的。',
	422: '当创建一个对象时，发生一个验证错误。',
	500: '服务器发生错误，请检查服务器。',
	502: '网关错误。',
	503: '服务不可用，服务器暂时过载或维护。',
	504: '网关超时。',
};

require("react-toggle/style.css");
zn.path(window, 'zr.component', zn.extend({
	Toggle: require('react-toggle').default,
	QRCode: require('qrcode.react'),
	CKEditor: require('ckeditor4-react')
}, require('../_component/_entry')));
zn.data.zncaller.defaults.withCredentials = true
zn.data.zncaller.defaults.timeout = 10000;
zn.data.zncaller.interceptors.response.use(function (response){
	zr.popup.loader.close();
	if(response.status == 200){
		if(response.data){
			if(response.data.code == 200){
				return response.data.result;
			}else{
				if(response.data.code == 401) {
					znui.app.storage.clear();
					znui.app.session.doIndex();
					return zr.popup.notifier.error(response.data.detail), null;
				}else{
					var _message = null;
					if(response.data && response.data.result) {
						if(typeof response.data.result == 'string'){
							_message = response.data.result;
						}else if(typeof response.data.result == 'object'){
							_message = response.data.result.message;
						}
					}else if(response.data.detail){
						_message = response.data.detail;
					}else if(response.data.message){
						_message = response.data.message;
					}

					return zr.popup.notifier.error(_message), null;
				}
			}
		}else{
			return zr.popup.notifier.error(response.responseText), null;
		}
	}else{
		return zr.popup.notifier.error(CODE_MESSAGE[response.status]), null;
	}
}, function (error){
	zr.popup.loader.close();
	if (error.code === 'ECONNABORTED') {
		zr.popup.notifier.error('服务请求超时');
	}else if(error.code === 'ERR_CONNECTION_REFUSED'){
		zr.popup.notifier.error('服务器服务不可用');
	}else{
		zr.popup.notifier.error(error.message);
	}

	return Promise.reject(error), false;
});