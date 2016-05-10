/**
 * waterline的使用
 * Created by HeXiaoli on 2016/5/9.
 */

var Waterline = require('waterline');
var mysqlAdapter = require('sails-mysql');
var mongoAdapter = require('sails-mongo');
var models = require('./models/models');

//适配器
var adapters = {
    mongo:mongoAdapter,
    mysql:mysqlAdapter,
    default:'mongo'
};

//连接
var connections = {
    mongo:{
        adapter:'mongo',
        url:'mongodb://localhost:27017/notes'
    },
    mysql:{
        adapter:'mysql',
        url:'mysql://myNote:123456@localhost/notes'
    }
};

////数据集合
//var user = Waterline.Collection.extend({
//    identity:'user',
//    connection:'mysql',
//    schema:true,
//    attributes:{
//        username:{
//            type:'string',
//            required:true
//        },
//        password:{
//            type:'string',
//            required:true
//        },
//        email:{
//            type:'string'
//        },
//        birthday:{
//            type:'date',
//            after:new Date('1991-01-01'),
//            before:function(){
//                return new Date();
//            }
//        },
//        createTime:{
//            type:'date'
//        },
//     migrate:'safe'
//    },
//    //生命周期回调
//    beforeCreate:function(value,cb){
//        value.createTime = new Date();
//        console.log('beforeCreate executed');
//        return cb();
//    }
//});
//
//var note = Waterline.Collection.extend({
//    identity:'note',
//    connection:'mysql',
//    schema:true,
//    attributes:{
//        title:{
//            type:'string',
//            required:true
//        },
//        author:{
//            type:'string',
//            required:true
//        },
//        tag:{
//            type:'string'
//        },
//        content:{
//            type:'string'
//        },
//        createTime:{
//            type:'date'
//        },
//        migrate:'safe'
//    },
//    //生命周期回调
//    beforeCreate:function(value,cb){
//        value.createTime = new Date();
//        console.log('beforeCreate executed');
//        return cb();
//    }
//});

var orm = new Waterline();

//加载数据集合
orm.loadCollection(models.User);
orm.loadCollection(models.Note);

var config = {
    adapters:adapters,
    connections:connections
}

exports.orm = orm;
exports.config = config;

