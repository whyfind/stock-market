var express = require("express");
var router = express.Router();
var util = require('../utils/util');
var spiderHttp = require('../spider/index')
var spiderFormat = require('../spider/format')

module.exports = function (app) {

    var timer = null
    var startHistory = function(){
        var webConfig = util.getWebConfig()
        var map = {
            shanghai: false,
            shanghList: [],
            shenzhen: false,
            shenzhenList: [],
        }
        var save = function(){
            if(map.shenzhen && map.shanghai){
                var list = spiderFormat.listFilter(map.shenzhenList.concat(map.shanghList))
                var fileName = util.formatDate(new Date()) + '.txt'
                var mapList = util.getHistory(fileName)
                list.forEach(function (v) {
                    if(!mapList[v.id]){
                        mapList[v.id] = v
                    }
                })
                util.setHistory(mapList, fileName)
            }
        }
        timer = setInterval( function () {
            if(webConfig.settingMessage == 'no'){
                clearInterval(timer)
                return
            }
            console.log('发出请求，运行一次~')
            spiderHttp.getShangHaiHtml(
                function (list) {
                    map.shanghai = true
                    map.shanghList = list
                    save()
                }
            )
            spiderHttp.getShenZhenHtml(
                function (list) {
                    map.shenzhen = true
                    map.shenzhenList = list
                    save()
                }
            )
        }, 20000)
    }

    //刷新时间页面
    app.get('/SettingMessage', function (req, res) {
        var webConfig = util.getWebConfig()
        webConfig.isSettingMessage = req.query.settingMessage || false
        util.setWebConfig(webConfig)

        if(req.query.settingMessage == 'yes'){
            console.log('开始信息存储功能~')
            startHistory()
        }else{
            console.log('关闭信息存储功能~')
            clearInterval(timer)
        }

        res.status(200)
        res.json({success: true})
    })
}