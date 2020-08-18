var express = require("express");
var router = express.Router();
var util = require('../utils/util');
const cheerio = require('cheerio');
var path = require("path")

var settingTime = router.get('/SettingTime', function (req, res) {
        var webConfig = util.getWebConfig()
        var template = util.getTemplate(path.resolve(__dirname, '../index.html'))
        let $ = cheerio.load(template, { decodeEntities: false });
        $('body').append($('#settingTimeForm').html())
        $('#refreshTime').val( webConfig.refreshTime || "")
        res.send($.html());
    })
module.exports = settingTime