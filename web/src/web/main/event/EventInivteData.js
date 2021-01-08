require('./EventInivteData.less');
var React = znui.React || require('react');

module.exports = React.createClass({
	getInitialState: function (){
		return {
			columns: null,
			fields: [],
			event: {}
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
		}.bind(this))
	},
	__loadEvent: function (){
		zn.data.get('/enroll.merchant/event/preview.event/' + this.props.request.params.zxnz_UUID).then(function (data){
			if(!data) return;
			var _data = data,
				_event = _data.event,
				_fields = _data.fields,
				_columns = [
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
										{ text: "待确认", value: 0 },
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
										{ text: "未签到", value: 0 },
										{ text: "已签到", value: 1 }, 
										{ text: "已弃权", value: -1 }, 
										{ text: "等待中", value: 2 }
									]} />;
						}.bind(this)
					},
					{
						label: '支付状态',
						name: 'Payment_State',
						width: 80,
						body: function (argv){
							var _value = argv.value || 0;
							return <zr.selector.Select 
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
										{ text: "已退款", value: -1 }
									]} />;
						}.bind(this)
					},
					{
						label: '二维码来源',
						name: 'enroll_merchant_User_UUID',
						width: 120
					},
					{
						label: '微信用户名',
						name: 'wx_user_name',
						width: 120
					},
					{
						label: '系统用户名',
						name: 'enroll_user_User_UUID',
						width: 120
					}
				];
			
			_fields = _fields.map(function (item){
				var _temp = item.Type.split('_'),
					_input = _temp[0],
					_type = _temp[1];
				if(item.Type == 'zr.component.GroupTitle') {
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
	__trashField: function (){
		if(!this.state.checkedFields.length){
			return alert('请选择字段'), false;
		}
		zr.popup.confirm('确定删除"' + this.state.checkedFields.length + '项"数据吗？','警告', function (){
            zr.popup.loader.loading();
            zn.data.delete('/zxnz.core.base/define.table/deleteFields', {
				params: {
					fields: this.state.checkedFields.join(',')
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
		this.state.checkedFields = checks.map((check)=>check.zxnz_ID);
	},
	__saveAsExcel: function (){
		znui.downloadURL(zn.setting.path('zn.data.host') + '/enroll.merchant/event/saveAsExcel/' + this.props.request.params.zxnz_UUID + "?myself=true");
	},
	__pageRightRender: function (){
		return <zr.button.Buttons onClick={this.__onToolBarClick} data={[
			{ value: '导出为Excel', icon: 'fa-download', onClick: this.__saveAsExcel },
			{ value: '批量删除', icon: 'fa-trash', status: 'danger', onClick: this.__trashField }
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
					myself: true,
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