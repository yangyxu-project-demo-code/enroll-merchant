require('./EventFields.less');
var React = znui.React || require('react');
var TYPES = {
	'zr.input.Input': '单行输入',
	'zr.input.Textarea': '多行输入',
	'zr.input.Input_password': '密码',
	'zr.input.Input_number': '数字',
	'zr.input.Input_range': '数字范围',
	'zr.input.Input_email': '邮箱',
	'zr.input.Input_tel': '电话',
	'zr.input.Input_url': '网站链接',
	'zr.component.GroupTitle': '组标题[开发中]',
	'zr.component.Text': '文字描述[开发中]',
	'zr.component.ImageView': '图片预览[开发中]',
	'zr.component.CKEditor': '文本编辑器[开发中]',
	'zr.component.QRCode': '自定义二维码[开发中]',
	'zr.component.Toggle': '是否单选[开发中]',
	'zr.selector.Select': '下拉单选',
	'zr.selector.Radio': '列表单选',
	'zr.selector.Checkboxs': '多选',
	'zr.uploader.ImageUploader': '上传单图片',
	'zr.uploader.FileUploader': '上传多文件',
	'zr.input.Input_month': '月选择',
	'zr.input.Input_week': '周选择',
	'zr.input.Input_date': '日期',
	'zr.input.Input_time': '时间',
	'zr.input.Input_datetime-local': '日期-时间',
	'zr.input.Input_color': '颜色',
	'zr.input.Input_checkbox': '是否单选(暂时不要用)'
};

var A_TYPES = [];
for(var key in TYPES){
	A_TYPES.push({
		text: TYPES[key],
		value: key
	});
}

module.exports = React.createClass({
	getInitialState: function (){
		return {
			columns: [],
			fields: [],
			event: {}
		};
	},
	componentDidMount: function (){
		this.__loadEvent();
	},
	__loadEvent: function (){
		zn.data.get('/enroll.merchant/event/preview.event/' + this.props.request.params.zxnz_UUID).then(function (data){
			if(!data) return;
			var _data = data,
				_event = _data.event,
				_fields = _data.fields,
				_columns = [];
			
			_fields = _fields.map(function (item){
				var _temp = item.Type.split('_'),
					_input = _temp[0],
					_type = _temp[1];
				if(item.Type == 'FromGroupTitle') {
					_input = <div style={{color: item.Text_Color}} className="form-group-title">{item.Value}</div>;
				}
				_columns.push({
					label: item.Label,
					name: item.Name,
					width: item.Width,
					filter: { type: "Input", opts: ['%'] }
				});
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
			});

			this.setState({
				event: _event,
				fields: _fields,
				columns: _columns
			});
		}.bind(this));
	},
	__createField: function (){
		var _dialog = zr.popup.dialog({
			title: '创建字段',
			style: {
				width: 640
			},
            closeable: true,
			focus: false,
			content: <zr.form.AjaxForm 
				data={[
					{ name: 'Label', label: '名称', input: zr.input.Input, required: true },
					{ 
						name: 'Type', 
						label: '字段类型',
						required: true,
						input: function (formitem, props){
							return <zr.selector.Select 
								dataType="String"
								data={A_TYPES} 
								onChange={(event)=>formitem.setValue(event.value)} />;
						}
					},
					{ 
						name: 'Required', 
						label: '是否必填字段', 
						input: function (formitem, props){
							return <zr.component.Toggle defaultChecked={props.value} onChange={(event)=>formitem.setValue(event.target.checked)} />;
						}
					},
					{ name: 'Hint', label: '提示信息', input: zr.input.Textarea },
					{ 
						name: 'Width', 
						label: '表格宽度', 
						input: zr.input.Input,
						value: 150,
						type: 'number'
					},
					{ 
						name: 'Text_Color', 
						label: '文字颜色', 
						input: zr.input.Input,
						type: 'color'
					},
					{ name: 'Data', label: '数据源', input: zr.input.Textarea },
					{ name: 'Props', label: '属性', input: zr.input.Textarea },
					{ name: 'zxnz_Note', label: '字段说明', input: zr.input.Textarea }
				]}
				submitApi={{
					method: "post",
					url: '/enroll.merchant/event/createEventField',
					data: {
						Event_UUID: this.props.request.params.zxnz_UUID
					}
				}}
				onSubmitSuccess={(data, form)=>{
					if(data){
						_dialog.close();
						zr.popup.notifier.success('创建成功!');
						this._table.data.refresh();
					}
				}}
				onSubmitError={function (response){
					zr.popup.notifier.error("创建失败");
				}}
				buttons={[
					{ value: '创建字段', icon: 'faEdit', focus: true, type: 'submit' }
				]}/>
        });
	},
	__updateField: function (data){
		var _dialog = zr.popup.dialog({
			title: '修改字段',
			style: {
				width: 640
			},
            closeable: true,
			focus: false,
			content: <zr.form.AjaxForm 
				data={[
					{ name: 'Label', label: '名称', input: zr.input.Input, required: true },
					{ 
						name: 'Type', 
						label: '字段类型',
						required: true,
						input: function (formitem, props){
							return <zr.selector.Select 
								dataType="String"
								data={A_TYPES} 
								value={props.value} 
								onChange={(event)=>formitem.setValue(event.value)} />;
						}
					},
					{ 
						name: 'Required', 
						label: '是否必填字段', 
						input: function (formitem, props){
							return <zr.component.Toggle checked={!!props.value} onChange={(event)=>formitem.setValue(event.target.checked)} />;
						}
					},
					{ name: 'Hint', label: '提示信息', input: zr.input.Textarea },
					{ 
						name: 'Width', 
						label: '表格宽度', 
						input: zr.input.Input,
						type: 'number'
					},
					{ 
						name: 'Text_Color', 
						label: '文字颜色', 
						input: zr.input.Input,
						type: 'color'
					},
					{ name: 'Value', label: '值', input: zr.input.Textarea },
					{ name: 'Data', label: '数据源', input: zr.input.Textarea },
					{ name: 'Props', label: '属性', input: zr.input.Textarea },
					{ name: 'zxnz_Note', label: '字段说明', input: zr.input.Textarea }
				]}
				value={data}
				submitApi={{
					method: "post",
					url: '/enroll.merchant/event.field/update/' + data.zxnz_UUID
				}}
				onSubmitSuccess={(data, form)=>{
					if(data){
						_dialog.close();
						zr.popup.notifier.success('修改成功!');
						this._table.data.refresh();
					}
				}}
				onSubmitError={function (response){
					zr.popup.notifier.error("修改失败");
				}}
				buttons={[
					{ value: '修改字段', status: 'danger', icon: 'faEdit', focus: true, type: 'submit' }
				]}/>
        });
	},
	__trashItem: function (data){
		var _event_uuid = this.props.request.params.zxnz_UUID;
		zr.popup.confirm('非常严重：删除该字段将清空改列数据, 确定删除"' + data.Label + '"吗？','警告', function (){
            zr.popup.loader.loading('删除中 ... ');
            zn.data.post('/enroll.merchant/event.field/delete/' + data.zxnz_UUID, {
				data: {
					event_uuid: _event_uuid
				}
			}).then(function (data){
				if(data){
					this._table.data.refresh();
					zr.popup.notifier.success('删除成功!');
					zr.popup.loader.close();
				}
            }.bind(this));
		}.bind(this), null, {
            cancel: '取消',
            confirm: '确定'
        });
	},
	__upItem: function (data){
		zr.popup.loader.loading('上移中 ... ');
		zn.data.get('/enroll.merchant/event.field/order/' + data.zxnz_UUID+"?order=up").then(function (data){
			if(data){
				this._table.data.refresh();
				zr.popup.notifier.success('上移成功!');
			}
		}.bind(this));
	},
	__downItem: function (data){
		zr.popup.loader.loading('下移中 ... ');
		zn.data.get('/enroll.merchant/event.field/order/' + data.zxnz_UUID+"?order=down").then(function (data){
			if(data){
				this._table.data.refresh();
				zr.popup.notifier.success('下移成功!');
			}
		}.bind(this));
	},
	__preview: function (){
		zn.data.get('/enroll.merchant/event/preview.event/' + this.props.request.params.zxnz_UUID).then(function (data){
			if(!data) return;
			var _data = data,
				_event = _data.event,
				_fields = _data.fields;
			
			_fields = _fields.map(function (item){
				var _temp = item.Type.split('_'),
					_input = _temp[0],
					_type = _temp[1];
				if(item.Type == 'FromGroupTitle') {
					_input = <div style={{color: item.Text_Color}} className="form-group-title">{item.Value}</div>;
				}
				return {
					label: item.Label,
					name: item.Name,
					type: _type,
					value: item.Value,
					text: item.Value,
					required: !!item.Required,
					hint: item.Hint,
					input: _input,
					data: item.Data.split(' '),
					props: JSON.parse(item.Props||'{}')
				}
			});

			zr.popup.dialog({
				title: '表单预览 - ' + _event.zxnz_Label,
				style: {
					width: 640
				},
				closeable: true,
				focus: false,
				content: <zr.form.AjaxForm 
					data={_fields}
					buttons={[
						{ value: '提交', icon: 'faEdit', focus: true, type: 'submit' }
					]}/>
			});
		}.bind(this));
	},
	__pageRightRender: function (){
		return <zr.button.Buttons onClick={this.__onToolBarClick} data={[
			{ value: '创建字段', icon: 'fa-plus', onClick: this.__createField },
			{ value: '表单预览', icon: 'fa-compress', onClick: this.__preview }
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
			zxnz={true}
			width="100%"
			columns={[
				{ 
					label: '操作', 
					name: '_action', 
					width: 100,
					body: function (argv){
						return <div style={{textAlign: 'center'}}>
							<span style={{ margin: 5 }} onClick={()=>this.__trashItem(argv.data)} className="zr-tag danger"><i data-zr-popup-tooltip="删除字段" className="fa fa-trash zr-padding-3" /></span>
							<span style={{ margin: 5 }} onClick={()=>this.__updateField(argv.data)} className="zr-tag primary"><i data-zr-popup-tooltip="更新字段" className="fa fa-edit zr-padding-3" /></span>
							<span style={{ margin: 5 }} onClick={()=>this.__upItem(argv.data)} className="zr-tag danger"><i data-zr-popup-tooltip="上移" className="fa fa-angle-up zr-padding-3" /></span>
							<span style={{ margin: 5 }} onClick={()=>this.__downItem(argv.data)} className="zr-tag primary"><i data-zr-popup-tooltip="下移" className="fa fa-angle-down zr-padding-3" /></span>
						</div>;
					}.bind(this)
				},
				{ 
					label: '名称', 
					name: 'Label', 
					width: 300,
					filter: { type: "Input", opts: ['%'] },
					body: function (argv){
						return <div data-zr-popup-tooltip={argv.value}>
							{argv.value}
						</div>;
					}
				},
				{ 
					label: '类型', 
					name: 'Type',
					width: 120,
					body: function (argv){
						return <span style={{fontWeight: 'bolder', color: '#2c89e8'}}>{TYPES[argv.value]}</span>;
					}
				},
				{ 
					name: 'Width', 
					label: '表格宽度', 
					width: 100
				},
				{ 
					label: '是否必填', 
					name: 'Required',
					width: 70,
					body: function (argv){
						return <div style={{display: 'flex'}}><zr.component.Toggle disabled={true} checked={!!argv.value} /></div>;
					}.bind(this)
				},
				{ label: '提示信息', name: 'Hint' },
				{ label: '值', name: 'Value' },
				{ label: '数据源', name: 'Data' },
				{ label: '属性', name: 'Props' },
				{ label: '创建时间', name: 'zxnz_Inserted_Time', width: 120 },
				{ label: '创建人', name: 'Created_User', width: 100 },
				{ label: '描述', name: 'zxnz_Note' }
			]}
			colgroup={{}}
			cellPadding={5}
			className="zr-table-class-normal"
			fixed={true}
			thead={{
				filter: true
			}}
			data={{
				method: 'post',
				url: '/enroll.merchant/event/pagingEventFields',
				data: {
					event_uuid: this.props.request.params.zxnz_UUID
				}
			}}
			tfilter={{}}
			onFilterChange={this.__onFilterChange}
			keyMaps={{
				pageIndex: 'pageIndex',
				pageSize: 'pageSize'
			}}
			pageIndex={1}
			pageSize={10} />
	},
	render:function(){
		return (
			<zr.page.Page title={(this.state.event.zxnz_Label||'Loading ... ') + " - 活动定义字段"} className="enroll-user-main-event-fields" rightRender={this.__pageRightRender}>
				{this.__renderContent()}
			</zr.page.Page>
		);
	}
});