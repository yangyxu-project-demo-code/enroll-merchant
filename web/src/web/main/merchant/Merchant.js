require('./Merchant.less');
var React = znui.React || require('react');

module.exports = React.createClass({
	getInitialState: function (){
		return {
			data: null
		};
	},
	componentDidMount: function (){
		this.__loadMerchantInfo();
	},
	__loadMerchantInfo: function (){
		zn.data.get('/enroll.merchant/merchant/info/' + this.props.request.params.zxnz_UUID).then(function (data){
			if(data){
				this.setState({
					data: data
				});
			}else{
				this.setState({
					data: {}
				});
			}
		}.bind(this));
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
			var _token = znui.app.storage.getToken() || {};
			return <div className="detail-info">
				<div className="field">
					<div className="field-label">专属二维码：</div>
					<zr.component.QRCode 
						imageSettings={ this.state.data.Logo ? {
							src: zn.setting.$imageSrc(this.state.data.Logo),
							height: 10,
							width: 10,
							excavate: true
						} : null }
						includeMargin={false} 
						size={128} 
						value={window.location.origin + window.location.pathname + "#/event.bind/" + this.state.data.zxnz_UUID + '/' + _token.uuid} />
				</div>
				<div className="field">
					<div className="field-label">名称：</div>
					<div className="field-value">{this.state.data.Name}</div>
				</div>
				<div className="field">
					<div className="field-label">Logo：</div>
					<div className="field-value">
						<zr.uploader.ImageUploader 
							value={this.state.data.Logo}
							compress={{
								maxWidth: 64,
								maxHeight: 64
							}}
							onComplete={(file)=>{
								zn.data.post('/enroll.merchant/merchant/updateByUUID', {
									data: {
										uuid: this.state.data.zxnz_UUID,
										updates: {
											Logo: file.tempName
										}
									}
								})
							}}  />
					</div>
				</div>
				{
					/**
					 * 
					 <div className="field">
					<div className="field-label">管理员：</div>
					<div className="field-value">
						{
							this.state.data.Owners.map(function (user, index){
								return <span key={index} className="user">{user.Name}</span>;
							})
						}
					</div>
				</div>
				<div className="field">
					<div className="field-label">成员：</div>
					<div className="field-value">
						{
							this.state.data.Users.map(function (user, index){
								return <span key={index} className="user">{user.Name}</span>;
							})
						}
					</div>
				</div>
					 */
				}
				<div className="field">
					<div className="field-label">描述：</div>
					<div className="field-value" contentEditable='false' dangerouslySetInnerHTML={{ __html: this.state.data.Description }}></div>
				</div>
				<div className="field">
					<div className="field-label">备注：</div>
					<div className="field-value">{this.state.data.zxnz_Note}</div>
				</div>
				<div className="field">
					<div className="field-label">创建时间：</div>
					<div className="field-value">{this.state.data.zxnz_Inserted_Time}</div>
				</div>
			</div>;
		}else{
			return <div style={{textAlign: 'center', margin: 10}}>
				未找到改活动号，请您核实！
			</div>;
		}
	},
	render: function(){
		return (
			<zr.page.Page title={this.state.data?this.state.data.Name:'Loading ...... '} className="enroll-user-main-merchant">
				{
					this.__renderContent()
				}
			</zr.page.Page>
		);
	}
});