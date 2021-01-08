require('./EventFiles.less');
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
			originData: null,
			data: null,
			event: {},
			root: '',
			currPath: '',
			paths: ['/']
		};
	},
	componentDidMount: function (){
		this.__loadEvent();
	},
	__loadEvent: function (){
		zn.data.get('/enroll.merchant/event/preview.event/' + this.props.request.params.zxnz_UUID).then(function (data){
			if(!data) return;
			var _root = '/' + data.event.Merchant + '/' + data.event.zxnz_Label + '_' + data.event.zxnz_Inserted_Time;
			this.setState({
				root: _root,
				event: data.event
			});
			this.__loadFiles(_root);
		}.bind(this));
	},
	__loadFiles: function (folder){
		this.state.currPath = folder || this.state.root;
		zn.data.post(zn.setting.path('enroll.user.api') + '/zxnz.core.fs/folder/filelist', {
			data: {
				folder: this.state.currPath
			}
		}).then(function (data){
			if(!data) return;
			this.setState({
				data: data,
				originData: data.slice(0)
			});
		}.bind(this));
	},
	__pageRightRender: function (){
		return <zr.button.Buttons onClick={this.__onToolBarClick} data={[
			{ value: '打包下载', icon: 'fa-download', onClick: this.__saveAsExcel }
		]}/>;
	},
	__toPath: function (value){
		var _paths = this.state.paths.filter(function (path, index){
			if(index < value || index == value){
				return true;
			}
			return false;
		});
		this.state.paths = _paths;
		this.__loadFiles(this.state.root + _paths.join(''));
	},
	__downloadFile: function (path){
		znui.downloadURL(zn.setting.path('enroll.user.api') + '/zxnz.core.fs/download/bypath?path=' + path);
	},
	__onSearchEnter: function (event){
		var _value = event.value;
		if(_value){
			this.setState({
				data: this.state.originData.filter(function (item){
					if(item.name.indexOf(_value) != -1){
						return true;
					}
					return false;
				})
			})
		}else{
			this.setState({
				data: this.state.originData
			});
		}
	},
	__folderDownload: function (file){
		znui.downloadURL(zn.setting.path('enroll.user.api') + '/zxnz.core.fs/download/downloadZipByFolder?folder=' + this.state.currPath + '/' + file + '&name=' + file);
	},
	__renderContent: function (){
		if(this.state.data){
			return (
				<div className="file-viewer">
					<div className="header">
						<div className="paths">
							{
								this.state.paths.map(function (item, index){
									return <span onClick={()=>this.__toPath(index)} className="path" key={index}>{item}</span>;
								}.bind(this))
							}
						</div>
						<zr.input.SearchInput onEnter={this.__onSearchEnter} />
					</div>
					<ul className="file-list">
						{

							this.state.data.map(function (file, index){
								return <li key={index} className="file">
									<span className="file-type"><i className={'fa ' + (file.isDirectory?'fa-folder-o':'fa-file-o')} /></span>
									{
										file.isDirectory ? 
										<div className="folder">
											<i data-zr-popup-tooltip="下载为压缩包" style={{ padding: 5, cursor: 'pointer' }} className="fa fa-download" onClick={()=>this.__folderDownload(file.name)} />
											<span 
											onClick={()=>{
												this.state.paths.push(file.name);
												this.forceUpdate();
												this.__loadFiles(this.state.root + '/' + file.name);
											}} className="name">{file.name}</span>
										</div> : 
										<span 
											onClick={()=>this.__downloadFile(this.state.currPath + '/' + file.name)} 
											className="name">{file.name} - ({znui.react.stringifyFileSize(file.stat.size)})</span>
									}
								</li>;
							}.bind(this))
						}
					</ul>
				</div>
			);
		}
	},
	render:function(){
		return (
			<zr.page.Page title={(this.state.event.zxnz_Label||'Loading ... ') + " - 活动附件"} className="enroll-user-main-event-files" >
				{this.__renderContent()}
			</zr.page.Page>
		);
	}
});