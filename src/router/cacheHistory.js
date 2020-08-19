var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var util = require('../utils/util');
var spiderHttp = require('../spider/index')
var spiderFormat = require('../spider/format')
const cheerio = require('cheerio');
var handlebars = require("handlebars")

module.exports = function (app) {
    //存储消息
    app.get('/cacheList', function (req, res) {
        fs.readdir(path.join(__dirname, '../history/'), function (err, files) {
            var arr = []
            files.forEach(function (v) {
                var date = v.split('.txt')[0]
                arr.push({
                    fileName: date,
                    weekDay: util.getDayOfWeek(date)
                })
            })
            var template = util.getTemplate(path.resolve(__dirname, '../cache.html'))
            let $ = cheerio.load(template, { decodeEntities: false });
            var con = handlebars.compile($("#listTemplate").html())({list: arr});

            $('body').attr('id','index-container')
            $('#root').append(con)
            res.send($.html());
        });
    })

    app.get('/clearHistoryMessage', function (req, res) {
        util.setHistory({})
        res.status(200)
        res.json({success: true})
    })
}