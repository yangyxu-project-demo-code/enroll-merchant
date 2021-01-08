require('./Merchant.Inivte.less');
var React = znui.React || require('react');

module.exports = React.createClass({
	getInitialState: function (){
		return {
			checkedFields: []
		};
	},
	componentDidMount: function (){

	},
	__createField: function (){
		var _dialog = zr.popup.dialog({
            title: '创建组织',
            closeable: true,
            focus: false,
            content: <zr.form.AjaxForm data={[
				{ name: 'Name', label: '名称', input: zr.input.Input, required: true },
				{ name: 'Users', label: '参与用户', input: zr.input.Input, required: true },
				{ name: 'Description', label: '描述', input: zr.input.Textarea},
				{ name: 'zxnz_Note', label: '备注', input: zr.input.Textarea }
			]}
			submitApi={{
				method: "post",
				url: '/enroll.merchant/league/createLeague'
			}}
			onSubmitSuccess={(data, form)=>{
				if(data){
					_dialog.close();
					zr.popup.notifier.success('创建成功!');
					this._table.data.refresh();
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
	__trashField: function (){
		if(!this.state.checkedFields.length){
			return alert('请选择字段'), false;
		}
		zr.popup.confirm('确定删除"' + this.state.checkedFields.length + '项"数据吗？','警告', function (){
            zr.popup.loader.loading('Deleteing ... ');
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
	__pageRightRender: function (){
		return <zr.button.Tab onClick={this.__onToolBarClick} data={[
			{ value: '我邀请', onClick: this.__createField },
			{ value: '邀请我', onClick: this.__trashField }
		]}/>;
	},
	render:function(){
		var _token = znui.app.storage.getToken() || {};
		return (
			<zr.page.Page title="活动号邀请" className="enroll-user-main-merchant-inivte" rightRender={this.__pageRightRender}>
				<zr.table.TablePager 
					ref={(table)=>this._table=table}
					checkbox={false}
					zxnz={true}
					width="100%"
					columns={[
						{ 
							label: '操作', 
							name: '_action', 
							width: 70,
							body: function (argv){
								return <div style={{textAlign: 'center'}}>
									<span style={{ margin: 5 }} onClick={()=>this.__trashItem(argv.data)} className="zr-tag danger"><i data-zr-popup-tooltip="Delete" className="fa fa-trash zr-padding-3" /></span>
									<span style={{ margin: 5 }} onClick={()=>this.__updateItem(argv.data)} className="zr-tag primary"><i data-zr-popup-tooltip="Update" className="fa fa-edit zr-padding-3" /></span>
								</div>;
							}.bind(this)
						},
						{ label: '被邀请人', name: 'invitor', width: 80 },
						{ label: '邀请角色', name: 'invitor', width: 80 },
						{ label: '活动号', name: 'merchant', width: 200 },
						{ 
							label: '状态', 
							name: 'Status',
							width: 150,
							body: function (argv){
								var _value = +argv.value,
									_uuid = _token.uuid || '';
								switch(_value) {
									case 0:
										if(_uuid == argv.data.User_UUID) {
											return <div>
												待处理
												<span>接受</span>
												<span>拒绝</span>
											</div>;
										}else{
											return <span>待处理</span>
										}
									case 1:
										return <span>已接受</span>;
									case -1:
										return <span>已拒绝</span>;
								}
							}.bind(this)
						},
						{ label: '邀请时间', width: 120, name: 'zxnz_Inserted_Time' },
						{ label: '邀请人', width: 80, name: 'inviter' },
						{ label: '描述', name: 'Description', width: 200 }
					]}
					colgroup={{}}
					cellPadding={5}
					className="zr-table-class-normal"
					fixed={true}
					thead={{
						filter: true
					}}
					data={{
						method: 'get',
						url: '/enroll.merchant/my/pagingInivtes'
					}}
					keyMaps={{
						pageIndex: 'pageIndex',
						pageSize: 'pageSize'
					}}
					pageIndex={1}
					pageSize={10}
					onCheckboxChange={this.__onTableCheckboxChange}/>
			</zr.page.Page>
		);
	}
});