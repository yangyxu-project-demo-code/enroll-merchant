require('@zeanium/core');
var argv = zn.convertArrayArgv(process.argv).argv;
var _path = argv['znui-react.path'] || '';
module.exports = require(_path + 'znui-react/webpack').zxnz.application.development(function (config) {
    
});