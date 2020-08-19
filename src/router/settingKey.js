var express = require("express");
var router = express.Router();
var util = require('../utils/util');
const cheerio = require('cheerio');
var path = require("path")
var querystring = require('querystring');

module.exports = function (app) {
    app.get('/Setting', function (req, res) {
        var webConfig = util.getWebConfig()
        let $ = util.getIndexPage()
        $('body').append($('#settingKeyForm').html())
        $('#defaultFilter').html(webConfig.defaultFilter || "")
        $('#filter').html(webConfig.filter || "")
        $('#watermark').html(webConfig.watermark || "")
        res.send($.html());
    })

    app.post('/submitSetting', function (req, res) {
        var body = "";
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
            // 解析参数
            body = querystring.parse(body);
            body.filter = body.filter || ''
            body.defaultFilter = body.defaultFilter || ''
            body.watermark = body.watermark || ''
            // 设置响应头部信息及编码
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            res.write("设置默认非成功：" + body.defaultFilter + "</br>设置关键词成功：" + body.filter + "</br>设置水印值成功：" + body.watermark);
            var webConfig = util.getWebConfig()
            webConfig.filter = body.filter
            webConfig.defaultFilter = body.defaultFilter
            webConfig.watermark = body.watermark
            util.setWebConfig(webConfig)
            res.end();
        });
    })
}