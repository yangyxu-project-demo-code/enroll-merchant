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
		zn.data.get('/enroll.merchant/my/merchant').then(function (data){
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
	__createMerchant: function (){
		var _dialog = zr.popup.dialog({
            title: '创建活动号',
            closeable: true,
            focus: false,
            content: <zr.form.AjaxForm data={[
				{ name: 'Name', label: '名称', input: zr.input.Input, required: true },
				{ 
					name: 'Is_Public', 
					label: '是否公共活动号', 
					note: '设置为公共活动号, 系统所有人都能查看和报名。',
					input: function (formitem, props){
						return <zr.component.Toggle defaultChecked={!!props.value} onChange={(event)=>formitem.setValue(event.target.checked)} />;
					},
					required: true 
				},
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
			onSubmitError={function (xhr){
				zr.popup.notifier.error("创建失败");
			}}
			buttons={[
				{ value: '创建', icon: 'faEdit', focus: true, type: 'submit' }
			]}/>
        });
	},
	__inviteUser: function (){
		var _dialog = zr.popup.dialog({
            title: '邀请成员',
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
	__inviteOwner: function (){
		var _dialog = zr.popup.dialog({
            title: '邀请管理员',
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
				url: '/enroll.merchant/merchant/inivteOwner'
			}}
			onSubmitSuccess={(data, form)=>{
				if(data) {
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
	__removeOwner: function (name){
		zr.popup.confirm('确定删除管理员 "' + name + '" 吗？','警告', function (){
            zr.popup.loader.loading();
            zn.data.delete('/enroll.merchant/merchant/removeOwner/' + this.state.data.zxnz_UUID + '/' + name).then(function (data){
				if(data){
					this.__loadMerchantInfo();
                	zr.popup.notifier.success('删除成功!');
				}
            }.bind(this));
		}.bind(this), null, {
            cancel: '取消',
            confirm: '确定'
        });
	},
	__removeUser: function (name){
		zr.popup.confirm('确定删除成员 "' + name + '" 吗？','警告', function (){
            zr.popup.loader.loading();
            zn.data.delete('/enroll.merchant/merchant/removeUser/' + this.state.data.zxnz_UUID + '/' + name).then(function (data){
				if(data){
					this.__loadMerchantInfo();
                	zr.popup.notifier.success('删除成功!');
				}
            }.bind(this));
		}.bind(this), null, {
            cancel: '取消',
            confirm: '确定'
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
					<div className="field-label">uuid：</div>
					<div className="field-value">{this.state.data.zxnz_UUID}</div>
				</div>
				<div className="field">
					<div className="field-label">专属二维码：</div>
					<zr.component.QRCode 
						imageSettings={{
							src: zn.setting.$imageSrc(this.state.data.Logo || ''),
							height: 18,
							width: 18,
							excavate: true
						}}
						includeMargin={false} 
						size={128} 
						value={window.location.origin + window.location.pathname + "#/event.bind/" + this.state.data.uuid + '/' + _token.uuid } />
				</div>
				<div className="field">
					<div className="field-label">名称：</div>
					<div className="field-value">{this.state.data.Name}</div>
				</div>
				<div className="field">
					<div className="field-label">是否公共活动号：</div>
					<div className="field-value">
						<zr.component.Toggle defaultChecked={!!this.state.data.Is_Public} onChange={(event)=>{
							zn.data.post('/enroll.merchant/merchant/updateByUUID', {
								data: {
									uuid: this.state.data.zxnz_UUID,
									updates: {
										Is_Public: event.target.checked
									}
								}
							})
						}} />
					</div>
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
				<div className="field">
					<div className="field-label">管理员：</div>
					<div className="field-value">
						<zr.button.Button icon="fa-plus" style={{marginRight: 10}} onClick={this.__inviteOwner} label="邀请管理员" />
						{
							this.state.data.owners.split(',').map(function (name, index){
								if(name) {
									return <span key={index} className="user">{name}<i data-zr-popup-tooltip="移除管理员" onClick={()=>this.__removeOwner(name, index)} className="fa fa-trash" /></span>;
								}
							}.bind(this))
						}
					</div>
				</div>
				<div className="field">
					<div className="field-label">成员：</div>
					<div className="field-value">
						<zr.button.Button icon="fa-plus" style={{marginRight: 10}} onClick={this.__inviteUser} label="邀请成员" />
						{
							this.state.data.users.split(',').map(function (name, index){
								if(name) {
									return <span key={index} className="user">{name}<i data-zr-popup-tooltip="移除成员" onClick={()=>this.__removeUser(name, index)} className="fa fa-trash" /></span>;
								}
							}.bind(this))
						}
					</div>
				</div>
				<div className="field">
					<div className="field-label">图片 (注意：只可以上传图片文件, 非图片文件不可预览)：</div>
					<div className="field-value">
						<zr.uploader.FileUploader 
							value={this.state.data.Imgs}
							types={['image']}
							compress={{
								maxHeight: 375,
								maxWidth: 667
							}}
							onChange={(event)=>{
								zn.data.post('/enroll.merchant/merchant/updateByUUID', {
									data: {
										uuid: this.state.data.zxnz_UUID,
										updates: {
											Imgs: ',' + event.value.join(',') + ','
										}
									}
								}).then(function (data){
									if(data){	
										zr.popup.notifier.success('保存成功!');
									}
								});
							}}
							onComplete={(files)=>{
								this.state.data.Imgs = this.state.data.Imgs + ',' + files.map((file)=>file.tempName).join(',');
								this.forceUpdate();
								zn.data.post('/enroll.merchant/merchant/updateByUUID', {
									data: {
										uuid: this.state.data.zxnz_UUID,
										updates: {
											Imgs: this.state.data.Imgs
										}
									}
								});
							}}  />
					</div>
				</div>
				<div className="field">
					<div className="field-label">视频 (注意：只可以上传视频文件, 非视频文件不可播放)：</div>
					<div className="field-value">
						<zr.uploader.FileUploader 
							compress={{
								maxHeight: 375,
								maxWidth: 667
							}}
							types={['video']}
							value={this.state.data.Videos}
							onChange={(event)=>{
								zn.data.post('/enroll.merchant/merchant/updateByUUID', {
									data: {
										uuid: this.state.data.zxnz_UUID,
										updates: {
											Videos: ',' + event.value.join(',') + ','
										}
									}
								}).then(function (data){
									if(data){	
										zr.popup.notifier.success('保存成功!');
									}
								});
							}}
							onComplete={(files)=>{
								this.state.data.Videos = this.state.data.Videos + ',' + files.map((file)=>file.tempName).join(',');
								this.forceUpdate();
								zn.data.post('/enroll.merchant/merchant/updateByUUID', {
									data: {
										uuid: this.state.data.zxnz_UUID,
										updates: {
											Videos: this.state.data.Videos
										}
									}
								});
							}}  />
					</div>
				</div>
				<div className="field">
					<div className="field-label">附件 (注意：可上传Excel/Word/PPT/PDF等常规文件)：</div>
					<div className="field-value">
						<zr.uploader.FileUploader 
							compress={{
								maxHeight: 375,
								maxWidth: 667
							}}
							value={this.state.data.Attachments}
							onChange={(event)=>{
								zn.data.post('/enroll.merchant/merchant/updateByUUID', {
									data: {
										uuid: this.state.data.zxnz_UUID,
										updates: {
											Attachments: ',' + event.value.join(',') + ','
										}
									}
								}).then(function (data){
									if(data){	
										zr.popup.notifier.success('保存成功!');
									}
								});
							}}
							onComplete={(files)=>{
								this.state.data.Attachments = this.state.data.Attachments + ',' + files.map((file)=>file.tempName).join(',');
								this.forceUpdate();
								zn.data.post('/enroll.merchant/merchant/updateByUUID', {
									data: {
										uuid: this.state.data.zxnz_UUID,
										updates: {
											Attachments: this.state.data.Attachments
										}
									}
								});
							}}  />
					</div>
				</div>
				<div className="field">
					<div className="field-label">描述：</div>
					<div className="field-value">
						<zr.component.CKEditor 
							type="classic"
							data={this.state.data.Description}
							onBlur={(event)=>{
								var _value = event.editor.getData();
								this.state.data.Description = _value;
								this.forceUpdate();
								zn.data.post('/enroll.merchant/merchant/updateByUUID', {
									data: {
										uuid: this.state.data.zxnz_UUID,
										updates: {
											Description: _value
										}
									}
								}).then(function (data){
									if(data){	
										zr.popup.notifier.success('自动保存成功!');
									}
								});
							}} />
					</div>
				</div>
				<div className="field">
					<div className="field-label">说明：</div>
					<div className="field-value">{this.state.data.zxnz_Note}</div>
				</div>
				<div className="field">
					<div className="field-label">创建时间：</div>
					<div className="field-value">{this.state.data.zxnz_Inserted_Time}</div>
				</div>
			</div>;
		}else{
			return <div style={{textAlign: 'center', margin: 10}}>
				<zr.button.Button status="warning" onClick={this.__createMerchant} label="创建活动号" />
			</div>;
		}
	},
	render: function(){
		return (
			<zr.page.Page title="我的活动号" className="enroll-user-main-merchant">
				{
					this.__renderContent()
				}
			</zr.page.Page>
		);
	}
});