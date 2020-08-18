var express = require("express");
var router = express.Router();
var util = require('../utils/util');

var clearHistoryMessage = router.get('/clearHistoryMessage', function (req, res) {
        util.setHistory({})
        res.status(200)
        res.json({success: true})
})
module.exports = clearHistoryMessage