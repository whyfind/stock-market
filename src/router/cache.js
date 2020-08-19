var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var util = require('../utils/util');
var spiderHttp = require('../spider/index')
var spiderFormat = require('../spider/format')
const cheerio = require('cheerio');
var handlebars = require("handlebars")

var typeMapDir = {
    HISTORY: '../history/',
    RECOVER: '../recover/'
}

module.exports = function (app) {
    //存储消息
    app.get('/cache', function (req, res) {
        var dir = typeMapDir[req.query.type], title = ''
        if(req.query.type == 'HISTORY'){
            title = '存储消息列表'
        }else if(req.query.type == 'RECOVER'){
            title = '备份消息列表'
        }
        fs.readdir(path.join(__dirname, dir), function (err, files) {
            var arr = []
            files.forEach(function (v) {
                var date = v.split('.txt')[0]
                arr.push({
                    fileName: date,
                    weekDay: util.getDayOfWeek(date)
                })
            })
            var map = {
                list:arr,
                title: title,
                type: req.query.type
            }

            let $ = util.getCachePage();
            var con = handlebars.compile($("#listTemplate").html())(map);

            $('body').attr('id','index-container')
            $('#root').append(con)
            res.send($.html());
        });
    })

    app.get('/clearCache', function (req, res) {
        var type = req.query.type
        var dir = typeMapDir[type]
        util.clearMemory(dir)
        res.status(200)
        res.json({success: true})
    })

    app.get('/clearCacheItem', function (req, res) {
        var type = req.query.type
        var date = req.query.date
        var dir = typeMapDir[type] + date + '.txt'
        util.clearMemoryItem(dir)
        res.status(200)
        res.json({success: true})
    })

    app.get('/getCacheItem', function (req, res) {
        var date = req.query.date
        var type = req.query.type
        var fileName = typeMapDir[type] + date + '.txt'
        var map = util.getMemory(fileName)
        var list = []
        Object.keys(map).forEach(function (v,index) {
            map[v].index = index + 1
            list.push(map[v])
        })
        var html = spiderFormat.renderList(list, true)
        res.send(html);
    })

}