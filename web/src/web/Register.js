require('./Register.less');
var React = znui.React || require('react');
module.exports = React.createClass({
	getInitialState: function (){
		return {
			submited: false,
			btnDisabled: true,
			captchaChecked: false,
			data: {},
			base: {
				"company_title": "报名活动号 - 活动管理",
				"company_tm": "上海佑洋信息科技有限公司 @2019 - @2020",
				"client_qr_image": "./images/qrcode_for_gh_08.jpg",
				"login_background_image": "./images/register-bg.jpg"
			}
		};
	},
	__onRegister: function (event){
		event.preventDefault();
		if(this.state.btnDisabled || !this.state.captchaChecked) return;
		zr.popup.loader.create({
			title: '注册中...'
		});
		this.state.data.url = window.location.origin + window.location.pathname;
		zn.data.post('/enroll.merchant/auth/registerByEmail', {
			data: this.state.data
		}).then(function (data){
			if(data){
				this.state.submited = true;
				this.forceUpdate();
			}else{
				this.capchan.refresh();
			}
		}.bind(this));
	},
	__onInputBlur: function (event){
		var _target = event.target,
			_name = _target.name,
			_value = _target.value;
		if(!_value.length) return;
		if(_value.length < 2){
			this.state.data[_name] = null;
			delete this.state.data[_name];
			alert('必须大于两个字且真实有效！');
			return false;
		}
		switch(_name){
			case 'email':
				var reg = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
				if(!reg.test(_value)){
					this.state.data[_name] = null;
					delete this.state.data[_name];
					alert('电子邮箱格式错误，请重新输入！')
					return false;
				}
				break;
			case 'password':
				if(_value.length < 6){
					this.state.data[_name] = null;
					delete this.state.data[_name];
					alert('密码长度必须6位以上数字或字母的组合！')
					return false;
				}
				break;
		}
		this.state.data[_name] = _value;
		if(Object.keys(this.state.data).length == 3){
			this.state.btnDisabled = false;
		}else{
			this.state.btnDisabled = true;
		}
		this.forceUpdate();
	},
	__onCaptchaChange: function (event){
		this.state.captchaChecked = event.checked;
		this.forceUpdate();
	},
	render:function(){
		return (
			<div className="enroll-user-register">
				<img className="background-image" src={this.state.base.login_background_image} />
				<div className="section-head">
					<div className="warp">
						<div className="head-left">
							<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bullhorn" className="company-logo svg-inline--fa fa-bullhorn fa-w-18 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M576 240c0-23.63-12.95-44.04-32-55.12V32.01C544 23.26 537.02 0 512 0c-7.12 0-14.19 2.38-19.98 7.02l-85.03 68.03C364.28 109.19 310.66 128 256 128H64c-35.35 0-64 28.65-64 64v96c0 35.35 28.65 64 64 64h33.7c-1.39 10.48-2.18 21.14-2.18 32 0 39.77 9.26 77.35 25.56 110.94 5.19 10.69 16.52 17.06 28.4 17.06h74.28c26.05 0 41.69-29.84 25.9-50.56-16.4-21.52-26.15-48.36-26.15-77.44 0-11.11 1.62-21.79 4.41-32H256c54.66 0 108.28 18.81 150.98 52.95l85.03 68.03a32.023 32.023 0 0 0 19.98 7.02c24.92 0 32-22.78 32-32V295.13C563.05 284.04 576 263.63 576 240zm-96 141.42l-33.05-26.44C392.95 311.78 325.12 288 256 288v-96c69.12 0 136.95-23.78 190.95-66.98L480 98.58v282.84z"></path></svg>
							<div className="company-title">{this.state.base.company_title}</div>
						</div>
						<div className="head-right">
							<ul className="link-nav">
								<li className="login"><a href="#/user.login">登    录</a></li>
							</ul>
						</div>
					</div>
				</div>
				<div className="section-body zr-scroll-webkit">
					{
						this.state.submited ? <div className="warp" style={{width: 780}}>
							<div className="submited">
								<p>尊敬的 <span style={{color: '#4b4eab'}}>{this.state.data.name}</span> 您好: </p>
								<div style={{ margin: '50px 0px', textIndent: 32, color: '#098609'}}>
									恭喜您已经成功注册账号。系统启用实名认证机制，在登录系统之前，您必须登录您的注册邮箱({this.state.data.email})，点击系统发送的激活链接进行账号激活，谢谢您的配合。
								</div>
								<div style={{ float: 'right', color: '#2c89e8'}}>
									报名活动号
								</div>
							</div>
						</div> : <div className="warp" style={{width: 780}}>
							<div className="intro">
								<div className="qr">
									<div style={{fontSize:20,margin: 10}}>微信公众号</div>
									{this.state.base.client_qr_image && <img className="qr-image" src={this.state.base.client_qr_image} />}
									<span>扫一扫立即关注</span>
								</div>
							</div>
							<div className="form-dialog">
								<form className="form">
									<div className="dialog-title">商户 - 注册</div>
									<div className="form-item">
										<i className="fa fa-user" />
										<input name="name" onBlur={this.__onInputBlur} type="input" placeholder="用户名" required={true} />
									</div>
									<div className="form-item">
										<i className="fa fa-envelope" />
										<input name="email" onBlur={this.__onInputBlur} type="input" placeholder="电子邮箱" required={true} />
									</div>
									<div className="form-item">
										<i className="fa fa-lock" />
										<input name="password" onBlur={this.__onInputBlur} type="password" placeholder="密码" required={true} />
									</div>
									<zr.captcha.RandomCaptcha ref={(drc)=>this.capchan = drc } onChange={this.__onCaptchaChange} placeholder="请输入验证码" length={6} />
									<button disabled={this.state.btnDisabled||!this.state.captchaChecked} onClick={this.__onRegister} className={"btn-login " + ((this.state.btnDisabled||!this.state.captchaChecked) ? 'disabled': false)}>免 费 注 册</button>
								</form>
							</div>
						</div>
					}
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
