require('./Info.less');
var React = znui.React || require('react');

module.exports = React.createClass({
	getInitialState: function (){
		return {
			data: {}
		};
	},
	componentDidMount: function (){
		this.__loadMerchantInfo();
	},
	__loadMerchantInfo: function (){
		zn.data.get('/enroll.merchant/my/info').then(function (data){
			if(data){
				this.setState({
					data: data
				});
			}
		}.bind(this));
	},
	__createMerchant: function (){
		var _dialog = zr.popup.dialog({
            title: '创建组织',
            closeable: true,
            focus: false,
            content: <zr.form.AjaxForm data={[
				{ name: 'Name', label: '名称', input: zr.input.Input, required: true },
				{ name: 'Description', label: '描述', input: zr.input.Textarea},
				{ name: 'zxnz_Note', label: '备注', input: zr.input.Textarea }
			]}
			submitApi={{
				method: "post",
				url: '/enroll.merchant/merchant/createMerchant'
			}}
			onSubmitSuccess={(data, form)=>{
				if(data){
					_dialog.close();
					this.__loadMerchantInfo();
					zr.popup.notifier.success('创建成功!');
				}
			}}
			onSubmitError={function (){
				zr.popup.notifier.error("创建失败");
			}}
			buttons={[
				{ value: '创建', icon: 'faEdit', focus: true, type: 'submit' }
			]}/>
        });
	},
	__inviteUser: function (){
		var _dialog = zr.popup.dialog({
            title: '邀请用户',
            closeable: true,
			focus: false,
            content: <zr.form.AjaxForm data={[
				{ name: 'email', label: '用户邮箱', input: zr.input.Input, required: true },
				{ name: 'description', label: '描述', input: zr.input.Textarea, required: true }
			]}
			hiddens={{
				merchant_uuid: this.state.data.zxnz_UUID
			}}
			submitApi={{
				method: "post",
				url: '/enroll.merchant/merchant/inivteUser'
			}}
			onSubmitSuccess={(data, form)=>{
				if(data){
					_dialog.close();
					this.__loadMerchantInfo();
					zr.popup.notifier.success('邀请发送成功：等待对方确认中!');
				}
			}}
			onSubmitError={function (response){
				zr.popup.notifier.error("邀请发送失败");
			}}
			buttons={[
				{ value: '发送邀请', icon: 'faEdit', focus: true, type: 'submit' }
			]}/>
        });
	},
	__renderContent: function (){
		if(!this.state.data){
			return <zr.loader.Loader title="加载中..." />
		}
		if(this.state.data && Object.keys(this.state.data).length){
			return <div className="detail-info">
				<div className="field">
					<div className="field-label">uuid：</div>
					<div className="field-value">{this.state.data.uuid}</div>
				</div>
				<div className="field">
					<div className="field-label">姓名：</div>
					<div className="field-value">{this.state.data.name}</div>
				</div>
				<div className="field">
					<div className="field-label">电话号码：</div>
					<div className="field-value">{this.state.data.mobile}</div>
				</div>
				<div className="field">
					<div className="field-label">邮箱：</div>
					<div className="field-value">{this.state.data.email}</div>
				</div>
				<div className="field">
					<div className="field-label">激活时间：</div>
					<div className="field-value">{this.state.data.actived_time}</div>
				</div>
				<div className="field">
					<div className="field-label">最近一次登录时间：</div>
					<div className="field-value">{this.state.data.login_last_time}</div>
				</div>
			</div>;
		}else{
			return <div style={{textAlign: 'center', margin: 10}}>
				<zr.button.Button status="warning" onClick={this.__createMerchant} label="创建组" />
			</div>;
		}
	},
	render: function(){
		return (
			<zr.page.Page title="个人信息" className="enroll-user-main-my-info">
				{
					this.__renderContent()
				}
			</zr.page.Page>
		);
	}
});