require('./EventDone.less');
var React = znui.React || require('react');

module.exports = React.createClass({
	__downloadAsExcel: function (data){
		znui.downloadURL(zn.setting.path('zn.data.host') + '/enroll.merchant/event/saveAsExcel/' + data.zxnz_UUID);
	},
	__pageRightRender: function (){
		return null;
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
						return <div style={{textAlign: 'center', fontSize: 14}}>
							{ !!argv.data.Table_Generated && <a style={{padding: 3}} href={"#/main/event.data/" + argv.data.zxnz_UUID}><i data-zr-popup-tooltip="查询活动报表" className="fa fa-list-alt zr-padding-3" /></a> }
							{ !!argv.data.Table_Generated && <span style={{ padding: 3 }} onClick={()=>this.__downloadAsExcel(argv.data)} className="zr-tag primary"><i data-zr-popup-tooltip="导出为Excel" className="fa fa-download" /></span> }
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
						return <span>已结束</span>;
					}
				},
				{ 
					label: '发布状态', 
					width: 100,
					name: 'Table_Generated',
					body: function (argv){
						return <span style={{color: 'green'}}>下线</span>;
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
				url: '/enroll.merchant/my/doneEvents',
				data: {
					
				}
			}}
			tfilter={{}}
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
			<zr.page.Page title="活动 - 已结束" className="enroll-user-main-merchant-event-all" rightRender={this.__pageRightRender}>
				{this.__renderContent()}
			</zr.page.Page>
		);
	}
});