require('./EventEditing.less');
var React = znui.React || require('react');

module.exports = React.createClass({
	getInitialState: function (){
		return {
			
		};
	},
	__updateItem: function (data){
		var _dialog = zr.popup.dialog({
			title: '修改活动',
			style: {
				width: 640
			},
            closeable: true,
			focus: false,
			content: <zr.form.AjaxForm 
				merge='updates' 
				data={[
					{ name: 'zxnz_Label', label: '活动名称', input: zr.input.Input, required: true },
					{ 
						name: 'Entry_Fee', 
						label: '活动报名费', 
						hint: '系统暂时只支持微信登录入口的微信支付，活动报名者可通过微信登录入口进行费用支付，取决于您活动是否需要报名中支付相关费用。',
						input: function (formitem, props){
							return <zr.input.Input type="number" value={props.value} onChange={(event)=>formitem.setValue(event.target.value)} />;
						}
					},
					{ 
						name: 'Address', 
						label: '活动地址', 
						hint: '活动举办及签到地址',
						input: zr.input.Textarea 
					},
					{ 
						name: 'Max_Count', 
						label: '最大限制（预计活动报名总人数）', 
						input: function (formitem, props){
							return <zr.input.Input type="number" value={props.value} onChange={(event)=>formitem.setValue(event.target.value)} />;
						},
						required: true 
					},
					{ 
						name: 'Roles', 
						label: '报名人角色', 
						input: function (formitem, props){
							return <zr.selector.Checkboxs 
								data={[
									{ value: 'student', text: '学生' },
									{ value: 'parent', text: '家长' },
									{ value: 'teacher', text: '老师' },
									{ value: 'other', text: '其他' }
								]} 
								value={props.value} 
								onChange={(event)=>{
									var _value = event.value;
									if(typeof _value != 'string'){
										_value = _value.join(',');
									}
									formitem.setValue(_value);
								}} />;
						},
						required: true 
					},
					{ 
						name: 'Start_Time', 
						label: '报名开始时间', 
						input: function (formitem, props){
							return <zr.input.Input type="datetime-local" value={props.value} onChange={(event)=>formitem.setValue(event.target.value)} />;
						},
						required: true 
					},
					{ 
						name: 'End_Time', 
						label: '报名截止时间', 
						input: function (formitem, props){
							return <zr.input.Input type="datetime-local" value={props.value} onChange={(event)=>formitem.setValue(event.target.value)} />;
						},
						required: true 
					},
					{ 
						name: 'Checkin_Start_Time', 
						label: '活动开始时间 - 活动举办时间', 
						input: function (formitem, props){
							return <zr.input.Input type="datetime-local" value={props.value} onChange={(event)=>formitem.setValue(event.target.value)} />;
						}
					},
					{ 
						name: 'Checkin_End_Time', 
						label: '活动结束时间 - 活动举办时间', 
						input: function (formitem, props){
							return <zr.input.Input type="datetime-local" value={props.value} onChange={(event)=>formitem.setValue(event.target.value)} />;
						}
					},
					{ 
						name: 'Is_Public', 
						label: '是否公开报名', 
						input: function (formitem, props){
							return <zr.component.Toggle defaultChecked={!!props.value} onChange={(event)=>formitem.setValue(event.target.checked)} />;
						}
					},
					{ 
						name: 'Show_Count', 
						label: '显示余量', 
						input: function (formitem, props){
							return <zr.component.Toggle defaultChecked={!!props.value} onChange={(event)=>formitem.setValue(event.target.checked)} />;
						}
					},
					{ 
						name: 'Unique_Check', 
						label: '唯一性验证', 
						input: function (formitem, props){
							return <zr.component.Toggle defaultChecked={!!props.value} onChange={(event)=>formitem.setValue(event.target.checked)} />;
						}
					},
					{ 
						name: 'Email_Enabled', 
						label: '发送邮件', 
						input: function (formitem, props){
							return <zr.component.Toggle defaultChecked={!!props.value} onChange={(event)=>formitem.setValue(event.target.checked)} />;
						}
					},
					{ name: 'Success_Message', label: '成功消息', input: zr.input.Textarea },
					{ name: 'Error_Message', label: '失败消息', input: zr.input.Textarea },
					{ name: 'Footer_Title', label: '页脚标题', input: zr.input.Textarea },
					{ 
						name: 'Text_Color', 
						label: '文字颜色', 
						input: zr.input.Input,
						type: 'color'
					},
					{ name: 'Comment', label: '备注', input: zr.input.Textarea }
				]}
				value={data}
				submitApi={{
					method: "post",
					url: '/enroll.merchant/event/updateEvent',
					data: {
						event_uuid: data.zxnz_UUID
					}
				}}
				onSubmitSuccess={(data, form)=>{
					if(data){
						_dialog.close();
						zr.popup.notifier.success('修改成功!');
						this._table.data.refresh();
					}
				}}
				onSubmitError={function (xhr){
					zr.popup.notifier.error("修改失败");
				}}
				buttons={[
					{ value: '修改活动', icon: 'faEdit', focus: true, type: 'submit' }
				]}/>
        });
	},
	__downloadAsExcel: function (data){
		znui.downloadURL(zn.setting.path('zn.data.host') + '/enroll.merchant/event/saveAsExcel/' + data.zxnz_UUID);
	},
	__trashEvent: function (data){
		zr.popup.confirm('确定删除活动 "' + data.zxnz_Label + '" 吗？','警告', function (){
            zr.popup.loader.loading('删除中 ... ');
            zn.data.delete('/enroll.merchant/event/delete/' + data.zxnz_UUID).then(function (data){
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
	__pageRightRender: function (){
		return null;
	},
	__deployEvent: function (data){
		zr.popup.confirm('确定发布活动 "' + data.zxnz_Label + '" 吗？','警告', function (){
            zr.popup.loader.loading({
				title: '发布中...'
			});
			zn.data.get('/enroll.merchant/event/deploy/' + data.zxnz_UUID).then(function (data){
				if(data){
					this._table.data.refresh();
					zr.popup.notifier.success('发布成功!');
				}
			}.bind(this));
		}.bind(this), null, {
            cancel: '取消',
            confirm: '确定'
        });
	},
	__onFilterChange: function (filters, data, table){
		this._table.data._argv.data.filters = filters;
		this._table.data.refresh();
	},
	__renderContent: function (){
		var _token = znui.app.storage.getToken() || {};
		return <zr.table.TablePager 
			ref={(table)=>this._table=table}
			checkbox={false}
			zxnz={true}
			width="100%"
			columns={[
				{ 
					label: '操作', 
					name: '_action', 
					width: 120,
					body: function (argv){
						var _token = znui.app.storage.getToken() || {},
							_isOwner = _token.uuid == argv.data.zxnz_enroll_merchant_Created_User;
						return <div style={{textAlign: 'center', fontSize: 14}}>
							<a style={{padding: 3}} href={"#/main/event.fields/" + argv.data.zxnz_UUID}><i data-zr-popup-tooltip="活动定义字段" className="fa fa-wpforms zr-padding-3" /></a>
							{ !!_isOwner && <span style={{ padding: 3, color: '#de1d17' }} onClick={()=>this.__trashEvent(argv.data)} className="zr-tag danger"><i data-zr-popup-tooltip="删除活动" className="fa fa-trash" /></span>}
							{ !!_isOwner && <span style={{ padding: 3, color: '#dc8408' }} onClick={()=>this.__updateItem(argv.data)} className="zr-tag danger"><i data-zr-popup-tooltip="修改活动" className="fa fa-edit" /></span>}
						</div>;
					}.bind(this)
				},
				{ 
					label: '报名码', 
					name: 'QRCode', 
					width: 90,
					body: function (argv){
						return <div style={{ padding: 5, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
							<zr.component.QRCode 
								imageSettings={ argv.data.Logo ? {
									src: zn.setting.$imageSrc(argv.data.Logo || ''),
									height: 10,
									width: 10,
									excavate: true
								} : null }
								includeMargin={false} 
								size={64} 
								value={zn.setting.path('enroll.user.submit') + argv.data.zxnz_UUID + '/' + _token.uuid} />
						</div>;
					}
				},
				{ 
					label: '签到核销码', 
					name: 'QRCode', 
					width: 90,
					body: function (argv){
						return <div style={{ padding: 5, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
							<zr.component.QRCode 
								imageSettings={ argv.data.Logo ? {
									src: zn.setting.$imageSrc(argv.data.Logo || ''),
									height: 10,
									width: 10,
									excavate: true
								} : null }
								bgColor={"#2c89e8"} 
								fgColor={"#fcfcfc"}
								includeMargin={false} 
								size={64} 
								value={zn.setting.path('enroll.user.checkin') + argv.data.zxnz_UUID + '/' + _token.uuid} />
						</div>;
					}
				},
				{ 
					label: '活动名称', 
					name: 'zxnz_Label', 
					width: 400,
					filter: { type: "Input", opts: ['%'] },
					body: function (argv){
						return <div>
							<a data-zr-popup-tooltip={argv.value} href={"#/main/event/" + argv.data.zxnz_UUID}>{argv.value}</a>
						</div>;
					}
				},
				{ 
					label: '举办/签到地址', 
					width: 300,
					name: 'Address',
					body: function (argv){
						return <div data-zr-popup-tooltip={argv.value}>
							{argv.value}
						</div>;
					}
				},
				{ 
					label: '报名费用(元)', 
					width: 100,
					name: 'Entry_Fee' 
				},
				{ 
					label: '是否公开', 
					name: 'Is_Public',
					width: 70,
					body: function (argv){
						return <div style={{display: 'flex'}}>
							<zr.component.Toggle 
								disabled={true}
								checked={!!argv.value} />
						</div>;
					}.bind(this)
				},
				{ 
					label: '所属活动号', 
					width: 160,
					name: 'Merchant' 
				},
				{ 
					label: '预计(人)', 
					width: 80,
					name: 'Max_Count' 
				},
				{ 
					label: '已报名(人)', 
					width: 80,
					name: 'Count',
					body: function (argv){
						return <div>
							<span style={{color: (argv.value==argv.data.Max_Count?'#2de82d':'#f71717'), fontSize: 18, padding: 5}}>{argv.value}</span>
							<span>({(argv.value/argv.data.Max_Count).toFixed(4) * 100}%)</span>
						</div>
					}
				},
				{ 
					label: '状态', 
					width: 80,
					name: 'Status',
					body: function (argv){
						switch(argv.value){
							case 0: 
								return <span>待发布</span>;
							case 1: 
								return <span>已部署</span>;
							case -1: 
								return <span>已下线</span>;
						}
					}
				},
				{ 
					label: '发布状态', 
					width: 100,
					name: 'Table_Generated',
					body: function (argv){
						switch(argv.value){
							case 0: 
								return <zr.button.Button status="danger" icon="fa-link" style={{padding: '2px 8px'}} onClick={()=>this.__deployEvent(argv.data)} label="发布" />;
							case -1: 
								return <span>重新发布</span>;
							case 1: 
								return <span style={{color: 'green'}}><i className="fa fa-check" style={{display:'inline', padding: 3}} />正常</span>;
						}
					}.bind(this)
				},
				{ 
					label: '开始时间', 
					name: 'Start_Time', 
					width: 135,
					filter: { 
						input: zr.input.Input,
						type: 'date',
						opts: ['>', '>=', '<', '<='] 
					}
				},
				{ 
					label: '结束时间', 
					name: 'End_Time', 
					width: 135,
					filter: { 
						input: zr.input.Input,
						type: 'date',
						opts: ['>', '>=', '<', '<='] 
					}
				},
				{ 
					label: '创建时间', 
					name: 'zxnz_Inserted_Time', 
					width: 135,
					filter: { 
						input: zr.input.Input,
						type: 'date',
						opts: ['>', '>=', '<', '<='] 
					}
				},
				{ label: '创建人', name: 'Created_User', width: 100 },
				{ label: '活动备注', name: 'Comment', width: 400 }
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
				url: '/enroll.merchant/my/editingEvents',
				data: {
					
				}
			}}
			tfilter={{

			}}
			onFilterChange={this.__onFilterChange}
			keyMaps={{
				pageIndex: 'pageIndex',
				pageSize: 'pageSize'
			}}
			pageIndex={1}
			pageSize={10} />;
	},
	render:function(){
		return (
			<zr.page.Page title="活动 - 编辑中 ... " className="enroll-user-main-merchant-event-all" rightRender={this.__pageRightRender}>
				{this.__renderContent()}
			</zr.page.Page>
		);
	}
});