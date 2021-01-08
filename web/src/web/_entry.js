require("znui-react");
require('./_entry.config.js');
znui.react.createApplication('znui.app', {
	storage: {
		tokenKey: 'zxnz_enroll_merchant'
	},
	session: {
		index: '/user.login',
		main: '/main/dashboard'
	},
	components: {
		router: require("znui-react-router"),
		loader: require("znui-react-loader"),
		input: require("znui-react-input"),
		table: require('znui-react-table'),
		button: require('znui-react-button'),
		form: require('znui-react-form'),
		uploader: require('znui-react-uploader'),
		page: require('znui-react-page'),
		pager: require('znui-react-pager'),
		popup: require('znui-react-popup'),
		selector: require('znui-react-selector'),
		captcha: require('znui-react-captcha')
	},
    render: {
		component: 'zr.router.HashRouter',
		components: [],
		main: '/user.login',
		routes: {
			'/user.login': require('./Login.js'),
			'/user.register': require('./Register.js'),
			'/user.forgetpassword': require('./ForgetPassword'),
			'/user.resetpassword/:user_uuid/:expires': require('./ResetPassword'),
			'/user.active/:user_uuid/:expires': require('./Active.js'),
			'/main': {
				exact: false,
				component: require('./Main.js'),
				routes: {
					'/dashboard': require('./main/Dashboard'),
					'/my/events/all': require('./main/event/EventAll'),
					'/my/events/editing': require('./main/event/EventEditing'),
					'/my/events/doing': require('./main/event/EventDoing'),
					'/my/events/inivte': require('./main/event/EventInivte'),
					'/my/events/done': require('./main/event/EventDone'),
					'/event/:zxnz_UUID': require('./main/event/Event'),
					'/my/info': require('./main/my/Info'),
					'/my/inivte': require('./main/my/Merchant.Inivte'),
					'/my/merchant/info': require('./main/my/Merchant'),
					'/my/merchants': require('./main/my/Merchants'),
					'/merchant/info/:zxnz_UUID': require('./main/merchant/Merchant'),
					'/merchant/event/:zxnz_UUID': require('./main/merchant/Events'),
					'/event.fields/:zxnz_UUID': require('./main/event/EventFields'),
					'/event.data/:zxnz_UUID': require('./main/event/EventData'),
					'/event.files/:zxnz_UUID': require('./main/event/EventFiles'),
					'/event.inivte.data/:zxnz_UUID': require('./main/event/EventInivteData')
				}
			}
		}
	}
});