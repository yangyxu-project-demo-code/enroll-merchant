require('./Event.less');
var React = znui.React || require('react');

module.exports = React.createClass({
	getInitialState: function (){
		return {
			event: null,
			fields: null
		};
	},
	componentDidMount: function (){
		this.__loadEventInfo();
	},
	__loadEventInfo: function (){
		zn.data.get('/enroll.merchant/event/preview.event/' + this.props.request.params.zxnz_UUID).then(function (data){
			if(data){
				this.setState(data);
			}else{
				this.setState({
					event: {},
					fields: []
				});
			}
		}.bind(this));
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
				event_uuid: this.state.event.zxnz_UUID
			}}
			submitApi={{
				method: "post",
				url: '/enroll.merchant/event/inivteUser'
			}}
			onSubmitSuccess={(data, form)=>{
				if(data){
					_dialog.close();
					this.__loadEventInfo();
					zr.popup.notifier.success('邀请发送成功');
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
				event_uuid: this.state.event.zxnz_UUID
			}}
			submitApi={{
				method: "post",
				url: '/enroll.merchant/event/inivteOwner'
			}}
			onSubmitSuccess={(data, form)=>{
				if(data) {
					_dialog.close();
					this.__loadEventInfo();
					zr.popup.notifier.success('邀请发送成功');
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
            zn.data.delete('/enroll.merchant/event/removeOwner/' + this.state.event.zxnz_UUID + '/' + name).then(function (data){
				if(data){
					this.__loadEventInfo();
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
            zn.data.delete('/enroll.merchant/event/removeUser/' + this.state.event.zxnz_UUID + '/' + name).then(function (data){
				if(data){
					this.__loadEventInfo();
                	zr.popup.notifier.success('删除成功!');
				}
            }.bind(this));
		}.bind(this), null, {
            cancel: '取消',
            confirm: '确定'
        });
	},
	__renderContent: function (){
		if(!this.state.event){
			return <zr.loader.Loader title="加载中..." />
		}
		if(this.state.event && Object.keys(this.state.event).length){
			var _token = znui.app.storage.getToken() || {};
			var _event = this.state.event;
			return <div className="detail-info">
				<div className="field">
					<div className="field-label">uuid：</div>
					<div className="field-value">{_event.zxnz_UUID}</div>
				</div>
				<div className="field">
					<div className="field-label">专属二维码：</div>
					<zr.component.QRCode 
						imageSettings={{
							src: zn.setting.$imageSrc(_event.Logo || ''),
							height: 18,
							width: 18,
							excavate: true
						}}
						includeMargin={false} 
						size={128} 
						value={window.location.origin + window.location.pathname + "#/event.bind/" + _event.zxnz_UUID + '/' + _token.uuid} />
				</div>
				<div className="field">
					<div className="field-label">名称：</div>
					<div className="field-value">{_event.zxnz_Label}</div>
				</div>
				<div className="field">
					<div className="field-label">地址：</div>
					<div className="field-value">{_event.Address}</div>
				</div>
				<div className="field">
					<div className="field-label">报名费：</div>
					<div className="field-value">{_event.Entry_Fee.toFixed(2)} 元 </div>
				</div>
				<div className="field">
					<div className="field-label">报名持续时间：</div>
					<div className="field-value">{_event.Start_Time} ~ {_event.End_Time}</div>
				</div>
				<div className="field">
					<div className="field-label">活动持续时间：</div>
					<div className="field-value">{_event.Checkin_Start_Time} ~ {_event.Checkin_End_Time}</div>
				</div>
				<div className="field">
					<div className="field-label">管理员：</div>
					<div className="field-value">
						<zr.button.Button icon="fa-plus" style={{marginRight: 10}} onClick={this.__inviteOwner} label="邀请管理员" />
						{
							_event.owners && _event.owners.split(',').map(function (name, index){
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
							_event.users && _event.users.split(',').map(function (name, index){
								if(name) {
									return <span key={index} className="user">{name}<i data-zr-popup-tooltip="移除成员" onClick={()=>this.__removeUser(name, index)} className="fa fa-trash" /></span>;
								}
							}.bind(this))
						}
					</div>
				</div>
				<div className="field">
					<div className="field-label">Logo：</div>
					<div className="field-value">
						<zr.uploader.ImageUploader 
							value={_event.Logo}
							compress={{
								maxHeight: 64,
								maxWidth: 64
							}}
							onComplete={(file)=>{
								zn.data.post('/enroll.merchant/event/updateByUUID', {
									data: {
										uuid: _event.zxnz_UUID,
										updates: {
											Logo: file.tempName
										}
									}
								})
							}} />
					</div>
				</div>
				<div className="field">
					<div className="field-label">背景图片：</div>
					<div className="field-value">
						<zr.uploader.ImageUploader 
							value={_event.Background_Image}
							compress={{
								maxHeight: 375,
								maxWidth: 667
							}}
							onComplete={(file)=>{
								zn.data.post('/enroll.merchant/event/updateByUUID', {
									data: {
										uuid: _event.zxnz_UUID,
										updates: {
											Background_Image: file.tempName
										}
									}
								})
							}}  />
					</div>
				</div>
				<div className="field">
					<div className="field-label">图片 (注意：只可以上传图片文件, 非图片文件不可预览)：</div>
					<div className="field-value">
						<zr.uploader.FileUploader 
							value={_event.Imgs}
							types={['image']}
							compress={{
								maxHeight: 375,
								maxWidth: 667
							}}
							onChange={(event)=>{
								zn.data.post('/enroll.merchant/event/updateByUUID', {
									data: {
										uuid: this.state.event.zxnz_UUID,
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
								this.state.event.Imgs = this.state.event.Imgs + ',' + files.map((file)=>file.tempName).join(',');
								this.forceUpdate();
								zn.data.post('/enroll.merchant/event/updateByUUID', {
									data: {
										uuid: this.state.event.zxnz_UUID,
										updates: {
											Imgs: this.state.event.Imgs
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
							value={this.state.event.Videos}
							onChange={(event)=>{
								zn.data.post('/enroll.merchant/event/updateByUUID', {
									data: {
										uuid: this.state.event.zxnz_UUID,
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
								this.state.event.Videos = this.state.event.Videos + ',' + files.map((file)=>file.tempName).join(',');
								this.forceUpdate();
								zn.data.post('/enroll.merchant/event/updateByUUID', {
									data: {
										uuid: this.state.event.zxnz_UUID,
										updates: {
											Videos: this.state.event.Videos
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
							value={this.state.event.Attachments}
							onChange={(event)=>{
								zn.data.post('/enroll.merchant/event/updateByUUID', {
									data: {
										uuid: this.state.event.zxnz_UUID,
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
								this.state.event.Attachments = this.state.event.Attachments + ',' + files.map((file)=>file.tempName).join(',');
								this.forceUpdate();
								zn.data.post('/enroll.merchant/event/updateByUUID', {
									data: {
										uuid: this.state.event.zxnz_UUID,
										updates: {
											Attachments: this.state.event.Attachments
										}
									}
								});
							}}  />
					</div>
				</div>
				<div className="field">
					<div className="field-label">活动描述：</div>
					<div className="field-value">
						<zr.component.CKEditor 
							type="classic"
							data={_event.Description}
							onBlur={(event)=>{
								var _value = event.editor.getData();
								this.state.event.Description = _value;
								this.forceUpdate();
								zn.data.post('/enroll.merchant/event/updateByUUID', {
									data: {
										uuid: this.state.event.zxnz_UUID,
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
					<div className="field-label">备注：</div>
					<div className="field-value">{_event.Comment}</div>
				</div>
				<div className="field">
					<div className="field-label">创建时间：</div>
					<div className="field-value">{_event.zxnz_Inserted_Time}</div>
				</div>
				<div className="field">
					<div className="field-label">修改时间：</div>
					<div className="field-value">{_event.zxnz_Updated_Time}</div>
				</div>
			</div>;
		}else{
			return <div style={{textAlign: 'center', margin: 10}}>
				未找到改活动，请您核实！
			</div>;
		}
	},
	render: function(){
		return (
			<zr.page.Page title={this.state.event?this.state.event.zxnz_Label:'Loading ...... '} className="enroll-user-main-merchant">
				{
					this.__renderContent()
				}
			</zr.page.Page>
		);
	}
});