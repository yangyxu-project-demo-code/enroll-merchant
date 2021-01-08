require('./Dashboard.less');
var React = znui.React || require('react');

module.exports = React.createClass({
	getInitialState: function (){
		return {
			merchants: [],
			events: [],
			all: 0,
			editing: 0,
			notStart: 0,
			doing: 0,
			done: 0
		};
	},
	componentDidMount: function (){
		this.__loadDashboard();
	},
	__loadDashboard: function (){
		zn.data.get('/enroll.merchant/my/dashboard').then(function (data){
			if(!data) return;
			var _data = data,
				_events = _data.events;
			for(var event of _events){
				if(event.Table_Generated){
					if((new Date(event.End_Time)).getTime() < Date.now()) {
						this.state.done = this.state.done + 1;
					}else if((new Date(event.Start_Time)).getTime() > Date.now()){
						this.state.notStart = this.state.notStart + 1;
					}else {
						this.state.doing = this.state.doing + 1;
					}
				}else{
					this.state.editing = this.state.editing + 1;
				}
			}
			this.state.all = _events.length;
			this.state.merchants = _data.merchants;
			this.state.events = _events;
			this.forceUpdate();
		}.bind(this));
	},
	render:function(){
		return (
			<zr.page.Page canBack={false} title="主页面" className="enroll-merchant-main-dashboard" rightRender={this.__pageRightRender}>
				<div className="main-dashboard">
					<div className="title">活动</div>
					<div className="row ">
						<div className="col-item number-item" onClick={()=>znui.app.session.relativeJump('/main/my/events/all')}>
							<div className="value">
								<div className="detail">
									<div className="count">{this.state.all}</div>
									<div className="tip">所有活动</div>
								</div>
								<i className="fa fa-th-list icon" />
							</div>
						</div>
						<div className="col-item number-item" onClick={()=>znui.app.session.relativeJump('/main/my/events/editing')}>
							<div className="value">
								<div className="detail">
									<div className="count">{this.state.editing}</div>
									<div className="tip">编辑中</div>
								</div>
								<i className="fa fa-edit icon" />
							</div>
						</div>
						<div className="col-item number-item" onClick={()=>znui.app.session.relativeJump('/main/my/events/doing')}>
							<div className="value">
								<div className="detail">
									<div className="count">{this.state.doing}</div>
									<div className="tip">进行中</div>
								</div>
								<i className="fa fa-clock-o icon" />
							</div>
						</div>
						<div className="col-item number-item" onClick={()=>znui.app.session.jump('/main/my/events/done')}>
							<div className="value">
								<div className="detail">
									<div className="count">{this.state.done}</div>
									<div className="tip">已结束</div>
								</div>
								<i className="fa fa-font-awesome icon" />
							</div>
						</div>
					</div>
					<div className="title">
						<span>所属组</span>
					</div>
					<div className="row ">
						{
							this.state.merchants.map(function (item, index){
								return <div key={index} className="col-item number-item" onClick={()=>znui.app.session.jump('/main/merchant/event/' + item.zxnz_UUID)}>
									<div className="value">
										<div className="detail">
											<div className="count">{0}<span className="unit">个</span></div>
											<div className="tip">{item.Name}</div>
										</div>
										<i className="fa fa-institution icon" />
									</div>
								</div>;
							})
						}
					</div>
					<div className="title">
						<span>操作日志</span>
					</div>
				</div>
			</zr.page.Page>
		);
	}
});