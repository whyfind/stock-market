console.log('你好啊！my name is dorsey');

const https = require('https');
const cheerio = require('cheerio');

let url = 'https://sns.sseinfo.com/ajax/feeds.do?page=1&type=10&pageSize=10&lastid=-1&show=1&_=1596535665526';

var htmlTest = 'ceshi'
https.get(url, function (res) {
    let chunks = [],
        size = 0;
    res.on('data', function (chunk) {
        chunks.push(chunk);
        size += chunk.length;
    });

    res.on('end', function () {
        console.log('数据包传输完毕');
        let data = Buffer.concat(chunks, size);
        let html = data.toString();

        let $ = cheerio.load(html);
        var arr = []
        $('#feedall').find('.m_feed_item').each(function (index,v) {
            arr.push('<p>' + $(v).find('.m_feed_txt').html()+'</p>')
        })
        let result = [];
        console.log(arr.join(''))
        htmlTest = 'ces'
    });
});


var express = require('express');
var app = express();
app.use('/public', express.static('public'));

//  主页输出 "Hello World"
app.get('/', function (req, res) {
    console.log("主页 GET 请求");
    res.send(htmlTest);
})


//  POST 请求
app.post('/', function (req, res) {
    console.log("主页 POST 请求");
    res.send('Hello POST');
})

//  /del_user 页面响应
app.get('/del_user', function (req, res) {
    console.log("/del_user 响应 DELETE 请求");
    res.send('删除页面');
})

//  /list_user 页面 GET 请求
app.get('/list_user', function (req, res) {
    console.log("/list_user GET 请求");
    res.send('用户列表页面');
})

// 对页面 abcd, abxcd, ab123cd, 等响应 GET 请求
app.get('/ab*cd', function(req, res) {
    console.log("/ab*cd GET 请求");
    res.send('正则匹配');
})


var server = app.listen(8082, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})
