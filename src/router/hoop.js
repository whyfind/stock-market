var express = require("express");
var router = express.Router();
var util = require('../utils/util');
var spiderHttp = require('../spider/index')
var spiderFormat = require('../spider/format')

module.exports = function (app) {

    var timer = null
    var startMemory = function(){
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
                if(list.length == 0){
                    return
                }
                //一直开启备份信息
                var fileName = '../recover/' + util.formatDate(new Date()) + '.txt'
                var mapList = util.getMemory(fileName)
                list.forEach(function (v) {
                    if(!mapList[v.id]){
                        mapList[v.id] = v
                    }
                })
                util.setMemory(mapList, fileName)
                //开启挂机信息
                if(webConfig.isSettingMessage == 'yes'){
                    var fileName = '../history/' + util.formatDate(new Date()) + '.txt'
                    var mapList = util.getMemory(fileName)
                    list.forEach(function (v) {
                        if(!mapList[v.id]){
                            mapList[v.id] = v
                        }
                    })
                    util.setMemory(mapList, fileName)
                }
            }
        }
        timer = setInterval( function () {
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
        }, (webConfig.coverTime * 1000) || 30000)
    }
    console.log('开始信息备份~')
    startMemory()
    //刷新时间页面
    app.get('/SettingMessage', function (req, res) {
        var webConfig = util.getWebConfig()
        webConfig.isSettingMessage = req.query.settingMessage || false
        util.setWebConfig(webConfig)

        if(req.query.settingMessage == 'yes'){
            console.log('开始挂机功能~')
        }else{
            console.log('关闭挂机功能~')
        }
        res.status(200)
        res.json({success: true})
    })
}