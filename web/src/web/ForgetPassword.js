require('./ResetPassword.less');
var React = znui.React || require('react');
module.exports = React.createClass({
	getInitialState: function (){
		return {
			submited: false,
			btnDisabled: true,
			data: {},
			base: {
				"company_title": "报名活动号 - 找回密码",
				"company_tm": "上海佑洋信息科技有限公司 @2019 - @2020",
				"login_background_image": "./images/register-bg.jpg"
			}
		};
	},
	componentDidMount: function (){
		
	},
	render:function(){
		return (
			<div className="enroll-user-resetpassword">
				<img className="background-image" src={this.state.base.login_background_image} />
				<div className="section-head">
					<div className="warp">
						<div className="head-left">
							<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bullhorn" className="company-logo svg-inline--fa fa-bullhorn fa-w-18 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M576 240c0-23.63-12.95-44.04-32-55.12V32.01C544 23.26 537.02 0 512 0c-7.12 0-14.19 2.38-19.98 7.02l-85.03 68.03C364.28 109.19 310.66 128 256 128H64c-35.35 0-64 28.65-64 64v96c0 35.35 28.65 64 64 64h33.7c-1.39 10.48-2.18 21.14-2.18 32 0 39.77 9.26 77.35 25.56 110.94 5.19 10.69 16.52 17.06 28.4 17.06h74.28c26.05 0 41.69-29.84 25.9-50.56-16.4-21.52-26.15-48.36-26.15-77.44 0-11.11 1.62-21.79 4.41-32H256c54.66 0 108.28 18.81 150.98 52.95l85.03 68.03a32.023 32.023 0 0 0 19.98 7.02c24.92 0 32-22.78 32-32V295.13C563.05 284.04 576 263.63 576 240zm-96 141.42l-33.05-26.44C392.95 311.78 325.12 288 256 288v-96c69.12 0 136.95-23.78 190.95-66.98L480 98.58v282.84z"></path></svg>
							<div className="company-title">{this.state.base.company_title}</div>
						</div>
						<div className="head-right">
							<ul className="link-nav">
								<li className="login"><a href="#/user.login">登录</a></li>
							</ul>
						</div>
					</div>
				</div>
				<div className="section-body zr-scroll-webkit">
					{
						this.state.submited ? <div className="warp" style={{width: 640}}>
							<div className="submited">
								<p>尊敬的用户您好: </p>
								<div style={{ margin: '50px 0px', textIndent: 32, color: '#098609'}}>
									系统已经成功发送重置密码连接到您邮箱，请通过重置链接找回密码，谢谢。
								</div>
								<div style={{ float: 'right', color: '#2c89e8'}}>
									报名活动号
								</div>
							</div>
						</div> : <div className="warp form-dialog" style={{width: 640, justifyContent: 'center'}}>
							<div>
								<zr.form.AjaxForm 
									data={[
										{ name: 'email', type: 'email', label: '邮箱', input: zr.input.Input, required: true }
									]}
									submitApi={{
										method: "post",
										url: '/enroll.merchant/auth/forgetPasswordByEmail',
										data: {
											url: window.location.origin + window.location.pathname,
										}
									}}
									onSubmitSuccess={(data, form)=>{
										if(data){
											this.setState({
												submited: true
											});
											zr.popup.notifier.success('发送成功!');
										}
									}}
									onSubmitError={function (response){
										zr.popup.notifier.error("发送失败");
									}}
									buttons={[
										{ value: '发送', icon: 'fa-edit', focus: true, type: 'submit' }
									]}/>
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
