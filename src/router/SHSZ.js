var express = require("express");
var router = express.Router();
var util = require('../utils/util');
var spiderHttp = require('../spider/index')
var spiderFormat = require('../spider/format')

module.exports = function (app) {
    //所有的数据接口
    app.get('/all', function (req, res) {
        var map = {
            shanghai: false,
            shanghList: [],
            shenzhen: false,
            shenzhenList: [],
        }
        var all = function() {
            if(map.shenzhen && map.shanghai){
                var html = spiderFormat.renderList(map.shenzhenList.concat(map.shanghList))
                res.send(html);
            }
        }
        spiderHttp.getShangHaiHtml(
            function (list) {
                map.shanghai = true
                map.shanghList = list
                all()
            }
        )
        spiderHttp.getShenZhenHtml(
            function (list) {
                map.shenzhen = true
                map.shenzhenList = list
                all()
            }
        )
    })


    //上海的数据接口
    app.get('/ShangHai', function (req, res) {
        spiderHttp.getShangHaiHtml(
            function (list) {
                var html = spiderFormat.renderList(list)
                res.send(html);
            }
        )
    })

    //深圳的数据接口
    app.get('/ShenZhen', function (req, res) {
        spiderHttp.getShenZhenHtml(
            function (list) {
                var html = spiderFormat.renderList(list)
                res.send(html);
            }
        )
    })
}