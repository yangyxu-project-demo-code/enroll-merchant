require('./EventData.less');
var React = znui.React || require('react');
var COLORS = {
	'0': '#f1ad4d',
	'1': '#06af06',
	'2': '#3498db',
	'-1': '#d9534f'
}
module.exports = React.createClass({
	getInitialState: function (){
		return {
			columns: null,
			fields: [],
			event: {},
			checkedFields: [],
			keys: {

			}
		};
	},
	componentDidMount: function (){
		this.__loadEvent();
	},
	__onStateChange: function (value, data, name){
		zn.data.post('/enroll.merchant/event/updateItem', {
			data: {
				item_uuid: data.zxnz_UUID,
				event_uuid: this.props.request.params.zxnz_UUID,
				updates: {
					[name]: value
				}
			}
		}).then(function (data){
			if(data){
				this._table.data.refresh();
			}
		}.bind(this));
	},
	__sendEmail: function (data, value){
		var _dialog = zr.popup.dialog({
			title: '发送邮件',
			style: {
				width: 640
			},
            closeable: true,
			focus: false,
			content: <zr.form.AjaxForm 
				data={[
					{ name: 'subject', label: '邮件标题', input: zr.input.Input, required: true },
					{ 
						name: 'content', 
						label: '邮件内容', 
						required: true,
						input: function (formitem, props){
							return <zr.component.CKEditor 
								type="classic"
								onChange={(event)=>{
									formitem.setValue(event.editor.getData());
								}} />;
						}
					},
					{ 
						name: 'attachments', 
						label: '附件', 
						input: function (formitem, props){
							return <zr.uploader.FileUploader 
								compress={{
									maxHeight: 375,
									maxWidth: 667
								}}
								onChange={(event)=>{
									formitem.setValue("'" + event.value.join("','") + "'");
								}}  />;
						}
					}
				]}
				submitApi={{
					method: "post",
					url: '/enroll.merchant/email/sendEmail',
					data: {
						tos: value
					}
				}}
				onSubmitSuccess={(data, form)=>{
					if(data){
						_dialog.close();
						zr.popup.notifier.success('发送成功!');
					}
				}}
				onSubmitError={function (){
					zr.popup.notifier.error("发送失败");
				}}
				buttons={[
					{ value: '邮件发送', icon: 'fa-share', focus: true, type: 'submit' }
				]}/>
        });
	},
	__sendWeixin: function (data, value){

	},
	__sendSMS: function (){
		alert('该功能还在开发中');
	},
	__onPayBack: function (data){
		zr.popup.confirm('退款订单不可撤销，确定对微信用户 “'+data.wx_user_name+'” 活动订单发起退款吗？', <span style={{color: 'red'}}>{'警告 - 非常重要'}</span>, function (){
			var _dialog = zr.popup.dialog({
				title: '发起退款',
				style: {
					width: 640
				},
				closeable: true,
				focus: false,
				content: <zr.form.AjaxForm 
					data={[
						{ name: 'refund_desc', label: '退款原因', input: zr.input.Textarea, required: true },
						{ name: 'refund_fee', label: '退款金额（元）', input: zr.input.Input, disabled: true, value: ((+data.Payment_Settlement_Total_fee) / 100).toFixed(2) },
						
					]}
					submitApi={{
						method: "post",
						url: '/enroll.merchant/event.wx/refundEvent',
						data: {
							userid: data.user_uuid,
							openid: data.enroll_user_User_WXOpenID,
							event_uuid: this.props.request.params.zxnz_UUID
						}
					}}
					onSubmitSuccess={(data, form)=>{
						if(data){
							_dialog.close();
							zr.popup.notifier.success(data);
							this._table.data.refresh();
						}
					}}
					onSubmitError={function (){
						zr.popup.notifier.error("发送失败");
					}}
					buttons={[
						{ value: '发起退款', icon: 'fa-share', status: 'danger', focus: true, type: 'submit' }
					]}/>
			});
		}.bind(this), null, {
            cancel: '取消',
            confirm: '确定'
        });
	},
	__loadEvent: function (){
		var _self = this;
		zn.data.get('/enroll.merchant/event/preview.event/' + this.props.request.params.zxnz_UUID).then(function (data){
			if(!data) return;
			var _data = data,
				_event = _data.event,
				_fields = _data.fields,
				_columns = [
					{ 
						label: '操作', 
						name: '_action', 
						width: 60,
						body: function (argv){
							return <div style={{textAlign: 'center', fontSize: 14, lineHeight: 0}}>
								<a style={{ padding: 5 }} href={"#/main/event.data/" + argv.data.zxnz_UUID}><i data-zr-popup-tooltip="报名详情" className="fa fa-info zr-padding-3" /></a>
								<span style={{ padding: 5 }} onClick={()=>_self.__sendWeixin(argv.data)} className="zr-tag primary"><i data-zr-popup-tooltip="发送微信消息" className="fa fa-weixin" /></span>
							</div>;
						}.bind(this)
					},
					{
						label: '确认状态',
						name: 'Confirm_State',
						width: 80,
						body: function (argv){
							return <zr.selector.Select 
									style={{ 
										fontSize: 13, 
										textAlign: 'center', 
										textAlignLast: 'center', 
										color: COLORS[argv.value], 
										borderColor: COLORS[argv.value] 
									}} 
									onChange={(event)=>this.__onStateChange(event.value, argv.data, 'Confirm_State')} 
									value={argv.value} 
									data={[
										{ text: "待确认", value: 0, disabled: true },
										{ text: "已确认", value: 1 }, 
										{ text: "已弃权", value: -1 }, 
										{ text: "等待中", value: 2 }
									]} />;
						}.bind(this)
					},
					{
						label: '签到状态',
						name: 'Checkin_State',
						width: 80,
						body: function (argv){
							return <zr.selector.Select 
									style={{ 
										fontSize: 13, 
										textAlign: 'center', 
										textAlignLast: 'center', 
										color: COLORS[argv.value], 
										borderColor: COLORS[argv.value] 
									}} 
									onChange={(event)=>this.__onStateChange(event.value, argv.data, 'Checkin_State')} 
									value={argv.value} 
									data={[
										{ text: "未签到", value: 0, disabled: true },
										{ text: "已签到", value: 1, disabled: true }, 
										{ text: "已弃权", value: -1 }, 
										{ text: "等待中", value: 2 }
									]} />;
						}.bind(this)
					},
					{
						label: '二维码来源',
						name: 'enroll_merchant_User_UUID',
						width: 100
					},
					{
						label: '微信用户名',
						name: 'wx_user_name',
						width: 100
					},
					{
						label: '系统用户名',
						name: 'enroll_user_User_UUID',
						width: 100
					}
				];
			
			if(_event.Entry_Fee){
				_columns.splice(3, 0, {
					label: '支付状态',
					name: 'Payment_State',
					width: 130,
					body: function (argv){
						var _value = argv.value || 0;
						return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
							<zr.selector.Select 
								style={{ 
									fontSize: 13, 
									textAlign: 'center', 
									textAlignLast: 'center', 
									color: COLORS[_value], 
									borderColor: COLORS[_value] 
								}} 
								disabled={true}
								onChange={(event)=>this.__onStateChange(event.value, argv.data, 'Checkin_State')} 
								value={_value} 
								data={[
									{ text: "待支付", value: 0 },
									{ text: "已支付", value: 1 }, 
									{ text: "退款中", value: -2 },
									{ text: "已退款", value: -1 }
								]} />
							{_value == 1 && <zr.button.Button onClick={()=>this.__onPayBack(argv.data)} status="danger" style={{ width: 70, margin: 5, marginRight: 0, lineHeight: '13px' }} value="退款" />}
						</div>;
					}.bind(this)
				});
			}
			
			_fields = _fields.map(function (item){
				var _temp = item.Type.split('_'),
					_input = _temp[0],
					_type = _temp[1],
					_column = {
						label: item.Label,
						name: item.Name,
						width: item.Width,
						filter: { type: "Input", opts: ['%'] }
					};
				if(item.Type == 'zr.component.GroupTitle') {
					_input = <div style={{color: item.Text_Color}} className="form-group-title">{item.Value}</div>;
				}

				if(_type) {
					this.state.keys[_type] = item.Name;
				}

				switch(item.Type) {
					case 'zr.input.Input_password':
					case 'zr.input.Input_number':
					case 'zr.input.Input_range':
					case 'zr.input.Input_email':
						_column.body = function (argv){
							return <div>
								<span style={{ padding: 5 }} onClick={()=>this.__sendEmail(argv.data, argv.value)} className="zr-tag primary"><i data-zr-popup-tooltip="发送邮件消息" className="fa fa-envelope-o" /></span>
								<span>{argv.value}</span>
							</div>;
						}.bind(this)
						break;
					case 'zr.input.Input_tel':
						_column.body = function (argv){
							return <div>
								<span style={{ padding: 5 }} onClick={()=>this.__sendSMS(argv.data, argv.value)} className="zr-tag primary"><i data-zr-popup-tooltip="发送短信" className="fa fa-mobile" /></span>
								<span>{argv.value}</span>
							</div>;
						}.bind(this)
						break;
					case 'zr.input.Input_url':
					case 'zr.input.Input_month':
					case 'zr.input.Input_week':
					case 'zr.input.Input_date':
					case 'zr.input.Input_time':
					case 'zr.input.Input_datetime-local':
					case 'zr.input.Input_color':
					case 'zr.input.Input_checkbox':
					case 'zr.uploader.FileUploader':
					case 'zr.uploader.ImageUploader':
					case 'zr.selector.Checkboxs':
					case 'zr.selector.Radio':
					case 'zr.selector.Select':
					case 'zr.component.Toggle':
					case 'zr.component.QRCode':
					case 'zr.component.CKEditor':
					case 'zr.component.ImageView':
					case 'zr.component.Text':
					case 'zr.component.GroupTitle':
						break;
				}

				_columns.push(_column);
				return {
					label: item.Label,
					name: item.Name,
					type: _type,
					value: item.Value,
					text: item.Value,
					required: !!item.Required,
					input: _input,
					data: item.Data.split(' '),
					props: JSON.parse(item.Props||'{}')
				}
			}.bind(this));

			this.setState({
				event: _event,
				fields: _fields,
				columns: _columns
			});
		}.bind(this));
	},
	__createItem: function (){
		var _dialog = zr.popup.dialog({
            title: '模拟报名 - 创建临时数据',
            closeable: true,
			focus: false,
			content: <zr.form.AjaxForm 
				merge='data' 
				data={this.state.fields}
				submitApi={{
					method: "post",
					url: '/enroll.merchant/event/submitEvent',
					data: {
						event_uuid: this.props.request.params.zxnz_UUID
					}
				}}
				onSubmitSuccess={(data, form)=>{
					if(data){
						_dialog.close();
						zr.popup.notifier.success('报名成功!');
						this._table.data.refresh();
					}
				}}
				onSubmitError={function (){
					zr.popup.notifier.error("报名失败");
				}}
				buttons={[
					{ value: '模拟提交', icon: 'fa-plus', focus: true, type: 'submit' }
				]}/>
        });
	},
	__trashField: function (){
		if(!this.state.checkedFields.length){
			return alert('请选择数据'), false;
		}
		zr.popup.confirm('确定删除"' + this.state.checkedFields.length + '项"数据吗？','警告', function (){
            zr.popup.loader.loading();
            zn.data.post('/enroll.merchant/event/deleteEventResult', {
				data: {
					event_uuid: this.props.request.params.zxnz_UUID,
					ids: this.state.checkedFields.join(',')
				}
            }).then(function (data){
				if(data){
					this._table.data.refresh();
                	zr.popup.notifier.success('删除成功!');
				}
            }.bind(this));
		}.bind(this), null, {
            cancel: '取消',
            confirm: '确定'
        });
	},
	__refresh: function (){
		this._table.data.refresh();
	},
	__onTableCheckboxChange: function (checks, table){
		this.state.checkedFields = checks;
	},
	__saveAsExcel: function (){
		znui.downloadURL(zn.setting.path('zn.data.host') + '/enroll.merchant/event/saveAsExcel/' + this.props.request.params.zxnz_UUID);
	},
	__sms: function (){

	},
	__email: function (){
		if(!this.state.checkedFields.length){
			return alert('请选择数据'), false;
		}

		if(!this.state.keys.email) {
			return alert('没有邮箱字段'), false;
		}

		var _emails = this.state.checkedFields.map((item)=>item[this.state.keys.email]);
		var _dialog = zr.popup.dialog({
			title: '群发送邮件',
			style: {
				width: 640
			},
            closeable: true,
			focus: false,
			content: <zr.form.AjaxForm 
				data={[
					{ name: 'subject', label: '标题', input: zr.input.Input, required: true },
					{ 
						name: 'tos', 
						label: '发送人', 
						required: true,
						input: function (formitem, props){
							return <zr.selector.Checkboxs 
								data={_emails}
								onChange={(event)=>{
									formitem.setValue(event.value.join(','));
								}} />;
						}
					},
					{ 
						name: 'content', 
						label: '内容', 
						required: true,
						input: function (formitem, props){
							return <zr.component.CKEditor 
								type="classic"
								onChange={(event)=>{
									formitem.setValue(event.editor.getData());
								}} />;
						}
					},
					{ 
						name: 'attachments', 
						label: '附件', 
						input: function (formitem, props){
							return <zr.uploader.FileUploader 
								compress={{
									maxHeight: 375,
									maxWidth: 667
								}}
								onChange={(event)=>{
									formitem.setValue("'" + event.value.join("','") + "'");
								}}  />;
						}
					}
				]}
				submitApi={{
					method: "post",
					url: '/enroll.merchant/email/sendEmail'
				}}
				onSubmitSuccess={(data, form)=>{
					if(data){
						_dialog.close();
						zr.popup.notifier.success('发送成功!');
					}
				}}
				onSubmitError={function (){
					zr.popup.notifier.error("发送失败");
				}}
				buttons={[
					{ value: '邮件发送', icon: 'fa-share', focus: true, type: 'submit' }
				]}/>
        });
	},
	__pageRightRender: function (){
		return <zr.button.Buttons onClick={this.__onToolBarClick} data={[
			{ value: '预览', icon: 'fa-newspaper-o', onClick: this.__createItem },
			{ value: '活动附件', icon: 'fa-folder', onClick: () => window.location.hash = "#/main/event.files/" +this.props.request.params.zxnz_UUID},
			{ value: '导出为Excel', icon: 'fa-download', onClick: this.__saveAsExcel },
			{ value: '邮件', icon: 'fa-envelope-o', onClick: this.__email },
			{ value: '群发邮件', icon: 'fa-envelope', onClick: this.__sms },
			{ value: '删除', icon: 'fa-trash', status: 'danger', onClick: this.__trashField }
		]}/>;
	},
	__onFilterChange: function (filters, data, table){
		this._table.data._argv.data.filters = filters;
		this._table.data.refresh();
	},
	__renderContent: function (){
		if(!this.state.event || !this.state.columns){
			return <zr.loader.Loader title="加载中..." />
		}
		return <zr.table.TablePager 
			ref={(table)=>this._table=table}
			checkbox={true}
			zxnz={true}
			columns={this.state.columns}
			colgroup={{}}
			cellPadding={5}
			className="zr-table-class-normal"
			width="100%"
			fixed={true}
			thead={{
				filter: false
			}}
			tfilter={{}}
			onFilterChange={this.__onFilterChange}
			data={{
				method: 'post',
				url: '/enroll.merchant/event/pagingEventResult',
				data: {
					event_uuid: this.props.request.params.zxnz_UUID
				}
			}}
			keyMaps={{
				pageIndex: 'pageIndex',
				pageSize: 'pageSize'
			}}
			pageIndex={1}
			pageSize={10}
			onCheckboxChange={this.__onTableCheckboxChange} />;
	},
	render:function(){
		return (
			<zr.page.Page title={(this.state.event.zxnz_Label||'Loading ... ') + " - 活动数据报表"} className="enroll-user-main-event-data" rightRender={this.__pageRightRender}>
				{this.__renderContent()}
			</zr.page.Page>
		);
	}
});