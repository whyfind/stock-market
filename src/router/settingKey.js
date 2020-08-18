var express = require("express");
var router = express.Router();
var util = require('../utils/util');
const cheerio = require('cheerio');
var path = require("path")

var settingKey = router.get('/Setting', function (req, res) {
        var webConfig = util.getWebConfig()
        var template = util.getTemplate(path.resolve(__dirname, '../index.html'))
        let $ = cheerio.load(template, { decodeEntities: false });
        $('body').append($('#settingKeyForm').html())
        $('#defaultFilter').html(webConfig.defaultFilter || "")
        $('#filter').html(webConfig.filter || "")
        res.send($.html());
    })
module.exports = settingKey