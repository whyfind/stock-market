console.log('你好！欢迎使用废废的小工具~');
const cheerio = require('cheerio');
var util = require('./utils/util');
var path = require("path")

var express = require('express');
var app = express();
app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './css')));
app.use(express.static(path.join(__dirname, './js')));

var SHSZ = require('./router/SHSZ')(app) //上证深交
var historyMessage = require('./router/cache')(app) //挂机的历史消息操作
var keySetting = require('./router/settingKey')(app) //关键词设置
var timeSetting = require('./router/settingTime')(app) //时间设置
var hoop = require('./router/hoop')(app) //外挂

var config = util.getWebConfig()
config.isSettingMessage = 'no'
util.setWebConfig(config)


//  主页
app.get('/', function (req, res) {
    var $ = util.getIndexPage()
    $('body').append($('#index').html())
    res.send($.html());
})

//  POST 请求
app.post('/', function (req, res) {
    res.send('Hello POST');
})

app.get('/list_user', function (req, res) {
    res.send('用户列表页面');
})

app.get('/ab*cd', function(req, res) {
    res.send('正则匹配');
})

var server = app.listen(8082, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
