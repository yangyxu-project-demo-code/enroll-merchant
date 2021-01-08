require('./Merchants.less');
var React = znui.React || require('react');

module.exports = React.createClass({
	getInitialState: function (){
		return {

		};
	},
	__createField: function (){
		var _dialog = zr.popup.dialog({
            title: '申请加入组',
            closeable: true,
            focus: false,
            content: <zr.form.AjaxForm data={[
				{ name: 'Merchant_UUID', label: '组ID', input: zr.input.Input, required: true }
			]}
			submitApi={{
				method: "post",
				url: '/enroll.merchant/merchant/join'
			}}
			onSubmitSuccess={(data, form)=>{
				if(data){
					_dialog.close();
					zr.popup.notifier.success('加入成功!');
					this._table.data.refresh();
				}
			}}
			onSubmitError={function (xhr){
				zr.popup.notifier.error("加入失败");
			}}
			buttons={[
				{ value: '加入', icon: 'fa-plus', focus: true, type: 'submit' }
			]}/>
        });
	},
	__pageRightRender: function (){
		return <zr.button.Buttons onClick={this.__onToolBarClick} data={[
			{ value: '申请加入组', icon: 'fa-plus', onClick: this.__createField }
		]}/>;
	},
	render:function(){
		return (
			<zr.page.Page title="所属活动号" className="enroll-user-main-merchants" rightRender={this.__pageRightRender}>
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
								return <div style={{textAlign: 'center', fontSize: 14}}>
									<a style={{padding: 5}} href={"#/main/merchant/event/" + argv.data.zxnz_UUID}><i data-zr-popup-tooltip="活动" className="fa fa-list-alt zr-padding-3" /></a>
									<a style={{padding: 5}} href={"#/main/merchant/users/" + argv.data.zxnz_UUID}><i data-zr-popup-tooltip="会员" className="fa fa-users zr-padding-3" /></a>
								</div>;
							}.bind(this)
						},
						{ 
							label: '名称', 
							name: 'Name', 
							width: 500,
							body: function (argv){
								return <div data-zr-popup-tooltip={argv.value} style={{display: 'flex', alignItems: 'center'}}>
									{argv.data.Logo && <img style={{ borderRadius: 32, width: 32, height: 32, margin: 5 }} src={zn.setting.$imageSrc(argv.data.Logo)} />}
									<a href={"#/main/merchant/info/" + argv.data.zxnz_UUID}>{argv.value}</a>
								</div>;
							}
						},
						{ 
							label: '是否公开', 
							name: 'Is_Public',
							width: 70,
							body: function (argv){
								return <div style={{display: 'flex'}}><zr.component.Toggle disabled={true} checked={!!argv.value} /></div>;
							}.bind(this)
						},
						{ label: '创建时间', name: 'zxnz_Inserted_Time', width: 120 },
						{ label: '创建人', name: 'Created_User', width: 80 },
						{ label: '备注', name: 'zxnz_Note' }
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
						url: '/enroll.merchant/my/pagingMerchants'
					}}
					keyMaps={{
						pageIndex: 'pageIndex',
						pageSize: 'pageSize',
						data: "items"
					}}
					pageIndex={1}
					pageSize={10} />
			</zr.page.Page>
		);
	}
});