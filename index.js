console.log('你好啊！my name is dorsey');

const https = require('https');
const cheerio = require('cheerio');

let url = 'https://sns.sseinfo.com/ajax/feeds.do?type=11&pageSize=10&lastid=-1&show=1&page=1&_=' + new Date().getTime();

var  script = "<script>Notification.requestPermission(res =>{ console.log(res); });function createNotify(title,options) {\n" +
    "\n" +
    "    var PERMISSON_GRANTED = 'granted';\n" +
    "    var PERMISSON_DENIED = 'denied';\n" +
    "    var PERMISSON_DEFAULT = 'default';\n" +
    "\n" +
    "    if (Notification.permission === PERMISSON_GRANTED) {\n" +
    "        notify(title,options);\n" +
    "    } else {\n" +
    "        Notification.requestPermission(function (res) {\n" +
    "            if (res === PERMISSON_GRANTED) {\n" +
    "                notify(title,options);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "    function notify($title,$options) {\n" +
    "        var notification = new Notification($title, $options);\n" +
    "    }\n" +
    "};setTimeout(function(){createNotify('测试通知',{body:'啊啊啊啊啊啊啊啊啊啊啊啊'})}, 10000)</script>"


var htmlTest = ''
var getHtml = function (callback) {
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
            $('.m_feed_item').each(function (index,v) {
                arr.push('<p>' + '<h1>' +$(v).find('.m_qa_detail .m_feed_txt a').html()+ '</h1>' + $(v).find('.m_qa .m_feed_txt').html()+'</p>')
            })
            let result = [];
            htmlTest = arr.join('') + script

            callback()
        });
    });
}


var express = require('express');
var app = express();
app.use('/public', express.static('public'));

//  主页输出 "Hello World"
app.get('/', function (req, res) {
    console.log("主页 GET 请求");
    getHtml(
        function () {
            res.send(htmlTest);
        }
    )
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
