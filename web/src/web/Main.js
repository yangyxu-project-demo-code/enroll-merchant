require('./Main.less');
var React = znui.React || require('react');
module.exports = React.createClass({
	getInitialState:function(){
		return {
			menus: [],
			base: {
				"company_title": "报名活动号 - 活动管理",
				"company_tm": "上海佑洋信息科技有限公司 @2019 - @2020"
			},
			user: {}
		};
	},
	componentDidMount: function (){
		this.__loadSessionInfo();
	},
	__loadSessionInfo: function (){
		zn.data.get('/enroll.merchant/my/info').then(function (data){
			if(data){
				znui.app.storage.setToken(data);
				this.setState({
					user: data
				});
			}else{	
				znui.app.storage.clear();
				znui.app.session.doIndex();
			}
		}.bind(this));
	},
	__onSignOut: function (){
		zr.popup.confirm('确定要退出系统？', '提示', function (){
			zn.data.post('/enroll.merchant/auth/logout').then(function (){
				znui.app.storage.clear();
				znui.app.session.doIndex();
			});
		});
	},
	__onCompanyClick: function (){
		znui.app.session.doMain();
	},
	render:function(){
		/*
		if(!zn.react.session.validate()){ return false; }
		if(!this.state.base){
			return <zr.loader.Loader content="正在加载中..." loader="timer" />;
		}*/
		var _path = this.props.request.path;
		return (
			<div className="enroll-user-main">
				<div className="section-head">
					<div className="warp">
						<div className="head-left" title="跳转主页面" onClick={this.__onCompanyClick}>
							<div className="wap">
								<i onClick={this.__onMenuClick} className="fa fa-bars" />
								<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bullhorn" className="company-logo svg-inline--fa fa-bullhorn fa-w-18 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M576 240c0-23.63-12.95-44.04-32-55.12V32.01C544 23.26 537.02 0 512 0c-7.12 0-14.19 2.38-19.98 7.02l-85.03 68.03C364.28 109.19 310.66 128 256 128H64c-35.35 0-64 28.65-64 64v96c0 35.35 28.65 64 64 64h33.7c-1.39 10.48-2.18 21.14-2.18 32 0 39.77 9.26 77.35 25.56 110.94 5.19 10.69 16.52 17.06 28.4 17.06h74.28c26.05 0 41.69-29.84 25.9-50.56-16.4-21.52-26.15-48.36-26.15-77.44 0-11.11 1.62-21.79 4.41-32H256c54.66 0 108.28 18.81 150.98 52.95l85.03 68.03a32.023 32.023 0 0 0 19.98 7.02c24.92 0 32-22.78 32-32V295.13C563.05 284.04 576 263.63 576 240zm-96 141.42l-33.05-26.44C392.95 311.78 325.12 288 256 288v-96c69.12 0 136.95-23.78 190.95-66.98L480 98.58v282.84z"></path></svg>
							</div>
							<div className="web">
							<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bullhorn" className="company-logo svg-inline--fa fa-bullhorn fa-w-18 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M576 240c0-23.63-12.95-44.04-32-55.12V32.01C544 23.26 537.02 0 512 0c-7.12 0-14.19 2.38-19.98 7.02l-85.03 68.03C364.28 109.19 310.66 128 256 128H64c-35.35 0-64 28.65-64 64v96c0 35.35 28.65 64 64 64h33.7c-1.39 10.48-2.18 21.14-2.18 32 0 39.77 9.26 77.35 25.56 110.94 5.19 10.69 16.52 17.06 28.4 17.06h74.28c26.05 0 41.69-29.84 25.9-50.56-16.4-21.52-26.15-48.36-26.15-77.44 0-11.11 1.62-21.79 4.41-32H256c54.66 0 108.28 18.81 150.98 52.95l85.03 68.03a32.023 32.023 0 0 0 19.98 7.02c24.92 0 32-22.78 32-32V295.13C563.05 284.04 576 263.63 576 240zm-96 141.42l-33.05-26.44C392.95 311.78 325.12 288 256 288v-96c69.12 0 136.95-23.78 190.95-66.98L480 98.58v282.84z"></path></svg>
								<div className="company-title">{this.state.base.company_title}</div>
							</div>
						</div>
						<div className="head-right">
							<ul className="link-nav">
								<li><a href={this.state.base.company_website}>官网</a></li>
							</ul>
							<div className="user-session" >
								<figure className="avatar" onClick={()=>znui.app.session.jump('/main/my/info')}>
									<img data-zr-popup-tooltip="查看我的个人信息" src={'./images/default-avatar.png'} />
								</figure>
								<span className="name">{this.state.user.name}</span>
								<i className="fa fa-angle-down" onClick={this.__onSessionClick} />
							</div>
							<div className="icons">
								<i onClick={this.__onMessage} className="fa fa-comment-o" data-zr-popup-tooltip="消息" />
								<i onClick={this.__onSetting} className="fa fa-gear" data-zr-popup-tooltip="设置" />
								<i onClick={this.__onSignOut} className="sign-out fa fa-sign-out" data-zr-popup-tooltip="注销" />
							</div>
						</div>
					</div>
				</div>
				<div className="section-body">
					<div className="warp inner-content">
						<div className="navigation-view zr-scroll-webkit">
							<ul className="fn-menu">
								{
									[
										{
											label: '活动号',
											items: [
												{
													label: '我的活动号',
													icon: 'fa-bullhorn',
													href: '/my/merchant/info'
												},
												{
													label: '所属活动号',
													icon: 'fa-usb',
													href: '/my/merchants'
												}
											]
										},
										{
											label: '活动',
											items: [
												{
													label: '所有活动',
													icon: 'fa-th-list',
													href: '/my/events/all'
												},
												{
													label: '编辑中',
													icon: 'fa-edit',
													href: '/my/events/editing'
												},
												{
													label: '报名中',
													icon: 'fa-clock-o',
													href: '/my/events/doing'
												},
												{
													label: '被邀请',
													icon: 'fa-paper-plane-o',
													href: '/my/events/inivte'
												},
												{
													label: '已结束',
													icon: 'fa-font-awesome',
													href: '/my/events/done'
												}
											]
										},
										{
											label: '我的',
											items: [
												{
													label: '账号信息',
													icon: 'fa-user-circle',
													href: '/my/info'
												}
											]
										}
									].map(function (item, index){
										return <li key={index} className="menu-group">
											<div className="group-label">{item.label}</div>
											<ul className="group-items">
												{
													item.items.map(function (item, index){
														return <li className={"menu-item " + (_path.indexOf('/main' + item.href) != -1 ? 'actived': '')} key={index}>
															<a className="link" href={ '#/main' + item.href }><i className={"icon fa " + item.icon}/>{item.label}</a>
														</li>;
													})
												}
											</ul>
										</li>;
									})
								}
							</ul>
						</div>
						<div className="page-view">
							{<zr.router.Route {...this.props} />}
						</div>
					</div>
				</div>
				<div className="section-foot">
					<div className="warp">
						<div className="TM"><a href="http://www.youyangit.com"><img src="./images/youyangit-logo.png" />上海佑洋信息科技有限公司</a> @2019 - @2020</div>
					</div>
				</div>
			</div>
		);
	}
});