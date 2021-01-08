require('./Login.less');
var React = znui.React || require('react');
module.exports = React.createClass({
	getInitialState: function (){
		return {
			base: {
				"company_title": "报名活动号 - 活动管理",
				"company_tm": "上海佑洋信息科技有限公司 @2019 - @2020",
				"client_qr_image": "./images/qrcode_for_gh_08.jpg",
				"client_qr_image1": "./images/gh_520145a4645e_344_1.jpg",
				"login_background_image": "./images/enroll-bg.jpg"
			},
			checkboxChecked: false,
			captchaChecked: false
		};
	},
	componentDidMount: function (){
		if(znui.app.storage.getItem('enroll.merchant.token')) {
			znui.app.session.doMain();
		}
	},
	__onLogin: function (event){
		event.preventDefault();
		if(this.state.btnDisabled || !this.state.captchaChecked) return;
		var _form = event.target.form;
		var _name = _form['name'].value,
			_password = _form['password'].value;
		if(!_name||_name.length<2){
			zr.popup.notifier.warning('请输入长度不少于2位的用户名');
			_form['name'].focus();
			return false;
		}
		if(!_password||_password.length<2){
			zr.popup.notifier.warning('请输入长度不少于2位的密码');
			_form['password'].focus();
			return false;
		}

		zr.popup.loader.create({
			title: '登录中 ...'
		});
		zn.data.post('/enroll.merchant/auth/login', {
			data: {
				name: _name,
				password: _password
			}
		}).then(function (message){
			if(message){
				zr.popup.notifier.success(message);
				if(this.state.checkboxChecked){
					znui.app.storage.setItem('enroll.merchant.account', {name: _name, password: _password});
				}
				znui.app.session.doMain();
			} else {
				this.capchan.refresh();
			}
		}.bind(this));
	},
	__onCaptchaChange: function (event){
		this.state.captchaChecked = event.checked;
		this.forceUpdate();
	},
	__onCaptchaRefresh: function (event){
		
	},
	__onCheckBoxChange: function (event){
		this.state.checkboxChecked = event.target.checked;
	},
	render:function(){
		if(!this.state.base){
			return <zr.loader.Loader content="正在加载基础信息..." loader="timer" />;
		}
		var _account = znui.app.storage.getItem('enroll.merchant.account') || {};
		return (
			<div className="enroll-user-login">
				<img className="background-image" src={this.state.base.login_background_image} />
				<div className="section-head">
					<div className="warp">
						<div className="head-left">
							<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bullhorn" className="company-logo svg-inline--fa fa-bullhorn fa-w-18 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M576 240c0-23.63-12.95-44.04-32-55.12V32.01C544 23.26 537.02 0 512 0c-7.12 0-14.19 2.38-19.98 7.02l-85.03 68.03C364.28 109.19 310.66 128 256 128H64c-35.35 0-64 28.65-64 64v96c0 35.35 28.65 64 64 64h33.7c-1.39 10.48-2.18 21.14-2.18 32 0 39.77 9.26 77.35 25.56 110.94 5.19 10.69 16.52 17.06 28.4 17.06h74.28c26.05 0 41.69-29.84 25.9-50.56-16.4-21.52-26.15-48.36-26.15-77.44 0-11.11 1.62-21.79 4.41-32H256c54.66 0 108.28 18.81 150.98 52.95l85.03 68.03a32.023 32.023 0 0 0 19.98 7.02c24.92 0 32-22.78 32-32V295.13C563.05 284.04 576 263.63 576 240zm-96 141.42l-33.05-26.44C392.95 311.78 325.12 288 256 288v-96c69.12 0 136.95-23.78 190.95-66.98L480 98.58v282.84z"></path></svg>
							<div className="company-title">{this.state.base.company_title}</div>
						</div>
						<div className="head-right">
							<ul className="link-nav">
								<li className="register"><a href="#/user.register">在线注册</a></li>
							</ul>
						</div>
					</div>
				</div>
				<div className="section-body zr-scroll-webkit">
					<div className="warp" style={{justifyContent: 'space-around'}}>
						<div className="intro">
							<div className="qr">
								<div className="title">微信公众号</div>
								{this.state.base.client_qr_image && <img className="qr-image" src={this.state.base.client_qr_image} />}
								<span className="hint">扫一扫立即关注</span>
							</div>
							<div className="qr">
								<div className="title">微信小程序</div>
								{this.state.base.client_qr_image && <img className="qr-image" src={this.state.base.client_qr_image1} />}
								<span className="hint">扫一扫使用小程序</span>
							</div>
						</div>
						<div className="form-dialog">
							<form className="form">
								<div className="dialog-title">商户 - 登录</div>
								<div className="form-item">
									<i className="fa fa-user" />
									<input name="name" type="input" value={_account.name} placeholder="用户名/手机号/邮箱" required={true} />
								</div>
								<div className="form-item">
									<i className="fa fa-lock" />
									<input name="password" type="password" value={_account.password} placeholder="密码" required={true} />
								</div>
								<zr.captcha.RandomCaptcha ref={(drc)=>this.capchan = drc } onRefresh={this.__onCaptchaRefresh} onChange={this.__onCaptchaChange} placeholder="请输入验证码" length={6} />
								<div className="form-tips">
									<label><input onChange={this.__onCheckBoxChange} type="checkbox" />记住密码</label>
									<a href="#/user.forgetpassword">忘记密码</a>
								</div>
								<button disabled={!this.state.captchaChecked} onClick={this.__onLogin} className={"btn-login " + ((!this.state.captchaChecked) ? 'disabled': false)}>登 录</button>
							</form>
						</div>
					</div>
				</div>
				<div className="section-foot">
					<div className="warp">
						<div className="TM"><a href="http://www.youyangit.com"><img src="./images/youyangit-logo.png" />上海佑洋信息科技有限公司</a>  @2019 - @2020</div>
					</div>
				</div>
			</div>
		);
	}
});
