var express = require("express");
var router = express.Router();
var util = require('../utils/util');
const cheerio = require('cheerio');
var path = require("path")
var querystring = require('querystring');

module.exports=function(app){
    app.get('/SettingTime', function (req, res) {
        var webConfig = util.getWebConfig()
        let $ = util.getIndexPage()
        $('body').append($('#settingTimeForm').html())
        $('#refreshTime').val( webConfig.refreshTime || "")
        $('#coverTime').val( webConfig.coverTime || "")
        res.send($.html());
    })
    app.post('/submitSettingTime', function (req, res) {
        var body = "";
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
            // 解析参数
            body = querystring.parse(body);
            // 设置响应头部信息及编码
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            res.write("设置刷新时间成功:" + body.refreshTime + "秒</br>" + "设置备份时间成功:" + body.coverTime + "秒");
            var webConfig = util.getWebConfig()
            webConfig.refreshTime = body.refreshTime || ''
            webConfig.coverTime = body.coverTime || ''
            util.setWebConfig(webConfig)
            res.end();
        });
    })
}