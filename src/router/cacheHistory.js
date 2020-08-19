var express = require("express");
var router = express.Router();
var util = require('../utils/util');
var spiderHttp = require('../spider/index')
var spiderFormat = require('../spider/format')

module.exports = function (app) {
    //历史消息
    app.get('/historyInfo', function (req, res) {
        var history = util.getHistory()
        var arr = []
        Object.keys(history).forEach(function (v) {
            arr.push(history[v])
        })
        var html = spiderFormat.renderList(arr, true)
        res.send(html);
    })

    app.get('/clearHistoryMessage', function (req, res) {
        util.setHistory({})
        res.status(200)
        res.json({success: true})
    })
}