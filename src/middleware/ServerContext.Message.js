/**
 * Created by yangyxu on 7/14/15.
 */
var node_redis = require('redis');
module.exports = zn.Class({
    properties: {
        redisClient: null
    },
    methods: {
        init: function (config, serverContext){
            try {
                var _client = this._redisClient = node_redis.createClient(config);
                _client.on('error', function (err){
                    zn.error('Redis Client Error: ', err);
                });
                _client.on('ready', function (){
                    zn.info('Redis Client Ready: ');
                });
                _client.on('connect', function (){
                    zn.info('Redis Client Connect: ');
                });
                _client.on('reconnecting', function (){
                    zn.info('Redis Client Reconnecting: ');
                });
                _client.on('end', function (){
                    zn.error('Redis Client End: ');
                });
                _client.on('warning', function (){
                    zn.warn('Redis Client Warning: ');
                });
                _client.select("1", function (err){
                    if(err){
                        return false;
                    }else{
                        zn.trace('connect success.');
                    }
                });
            } catch (err) {
                zn.error('Redis Client Error: ', err);
            }
        },
        getIds: function (success, error){
            return this._redisClient.keys("*", function (){

            }), this;
        },
        getSession: function (sessionId, success, error){
            this._redisClient.get(sessionId, function (err, value){
                if(!err) {
                    var _session = this.newSession();
                    _session.setProps(JSON.parse(value));
                    _session.updateExpiresTime();
                    _session.save();
                    success && success(_session);
                }else{
                    error && error(err);
                }
            }.bind(this));

            return this;
        },
        removeSession: function (sessionId){
            return this._redisClient.expire(sessionId, -1), this;
        },
        saveSession: function (session){
            var _id = session.getId();
            this._redisClient.set(_id, session.serialize());
            this._redisClient.expire(_id, this._config.expire || 60 * 30);
            return this;
        },
        empty: function (){
            
        },
        size: function (success, error){
            this._redisClient.keys('*', function (){

            });
        }
    }
});