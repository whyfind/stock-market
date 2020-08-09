console.log('你好啊！my name is dorsey');

const https = require('https');
const cheerio = require('cheerio');
const request = require('request');
var querystring = require('querystring');
var fs = require("fs")



var createNotify = "<script>let audio = document.createElement('audio');audio.src = '/dog.mp3';document.body.appendChild(audio);" +
"Notification.requestPermission(res =>{ console.log(res); });"+
"function createNotify(title,options) {\n" +
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
    "};</script>"


var htmlTest = ''

var readFile = function(fileName){
    var data = ''
    try{
        data = fs.readFileSync(fileName);
        data = data.toString()
    }catch{
        data = ''
    }
    return data
}

var getHistoryId = function(){
    var data = {}
    try{
        data = fs.readFileSync('historyId.json');
        data = data.toString()
        data = JSON.parse(data)
    }catch{
        data = {}
    }

    return data
}

var getFilterArray = function(){
    var str = readFile('filter.txt')
    str = str.split(' ')
    return str
}

var renderListFilter = function(list){
    var arr = []
    var notification = "<script>"
    var historyId = getHistoryId()
    list.forEach(function (v, index) {
        var renderPush = function(v){
            var code = v.code ? '('+v.code +')' : ''
            var title = '<h1>' + v.title + code +'</h1>'
            var question = '<p><h2 style="float:left;margin:0;">问：</h2>'+ '<p style="line-height: 35px;font-size: 18px;">' +(v.question || "") + '</p</p>'
            var text = '<p><h2 style="float:left;margin:0;">答：</h2>'+ '<p style="line-height: 35px;font-size: 18px;">' + (v.text || "") +'</p></p>'
            var time = '<p style="color: #1818fd;">'+ (v.time || '') +'</p>'
            arr.push('<div style="border-bottom: 1px dashed #999;">' + title + question + text + time + '</div>')
        }
        var notify = function(v){
            historyId[v.type] = historyId[v.type] || []
            historyId[v.type].push(v.id)
            notification += "setTimeout(function(){createNotify('"+ v.title +"',{body:'有需要您关注的信息'})}, 0);audio.play();"
        }
        v.question = v.question || ''
        v.text = v.text || ''

        if(!readFile('filter.txt')){
            renderPush(v)
        }else{
           var str = getFilterArray()
           str.forEach(function(item){
                if(v.text.indexOf(item) >= 0 || v.question.indexOf(item) >= 0){
                    renderPush(v)
                    //没有历史记录 或者 没有历史通知
                    if(!historyId[v.type] || historyId[v.type].indexOf(v.id) < 0){
                        notify(v)
                    }
                }
           })
        }
    })
    notification += "</script>"

    var data = readFile('time.txt')
    var time = (isNumber(data) ? (data || 60) : 60) * 1000
    var reload = '<script>setTimeout(function(){window.location.reload()},'+ time +');</script>'

    fs.writeFile('historyId.json', JSON.stringify(historyId),  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("数据写入成功！");
        console.log("--------我是分割线-------------")
        console.log("读取写入的数据！");
    });
    var con = '<div>' + arr.join('') + '</div>';
    htmlTest = arr.length ? (con + createNotify + notification + reload) : '<h1 style="text-align: center;">暂无关键字匹配的数据。</h1>';
}

var getShangHaiHtml = function (callback) {
    let url = 'https://sns.sseinfo.com/ajax/feeds.do?type=11&pageSize=10&lastid=-1&show=1&page=1&_=' + new Date().getTime();
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
            let $ = cheerio.load(html, { decodeEntities: false });
            var list = []
            $('.m_feed_item').each(function (index,v) {
                list.push({
                    title: $(v).find('.m_qa_detail .m_feed_txt a').html(),
                    text: $(v).find('.m_feed_detail.m_qa .m_feed_txt').html(),
                    question: $(v).find('.m_feed_detail.m_qa_detail .m_feed_txt').html(),
                    id: $(v).find('.m_qa .m_feed_txt').attr('id').split('-')[1],
                    type: 'ShangHai',
                    time: $(v).find('.m_qa .m_feed_from').html(),
                })
            })
            renderListFilter(list)
            callback()
        });
    });
}

var getShenZhenHtml = function (callback) {
    var data = {
        pageNo: 1,
        pageSize: 10,
        searchTypes: '11,11,',
        market: '',
        industry: '',
        stockCode: ''
    }
    request({
        url: 'http://irm.cninfo.com.cn/ircs/index/search',//请求路径
        method: "POST",//请求方式，默认为get
        headers: {//设置请求头
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: JSON.stringify(data)//post参数字符串
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var list = []
            JSON.parse(body).results.forEach(function (v) {
                list.push({
                    title: v.companyShortName,
                    code: v.stockCode,
                    text: v.attachedContent,
                    id: v.esId,
                    type: 'ShenZhen',
                    time: v.packageDate,
                    question: v.mainContent
                })
            })
            renderListFilter(list)
            callback()
        }else{
            console.log(error)
        }
    }); 
}


var express = require('express');
const { isNumber } = require('util');
var app = express();
app.use(express.static('./public'));

app.get('/ShangHai', function (req, res) {
    console.log("ShangHai 交易所 请求");
    getShangHaiHtml(
        function () {
            res.send(htmlTest);
        }
    )
})


app.get('/ShenZhen', function (req, res) {
    console.log("ShenZhen 交易所 请求");
    getShenZhenHtml(
        function () {
            res.send(htmlTest);
        }
    )
})


app.get('/Setting', function (req, res) {
    console.log("设置过滤文本 请求");
    var data = readFile('filter.txt')
    var postHTML = 
    '<html><head><meta charset="utf-8"><title>StockMarket实例</title></head>' +
    '<body>' +
    '<form method="post" action="/submitSetting">' +
    '关键词： <textarea name="name" style="width: 300px;height: 200px;">'+ data +'</textarea><br>' +
    '<input type="submit" style="width: 100px;height: 30px; margin-top: 10px;">' +
    '</form>' +
    '</body></html>';
    res.send(postHTML);
})


app.get('/SettingTime', function (req, res) {
    console.log("设置过滤文本 请求");
    var data = readFile('time.txt')
    var postHTML = 
    '<html><head><meta charset="utf-8"><title>StockMarket实例</title></head>' +
    '<body>' +
    '<form method="post" action="/submitSettingTime">' +
    '刷新时间： <input name="name" value="'+ data +'">秒</br>'+
    '<input type="submit" style="width: 100px;height: 30px; margin-top: 10px;">' +
    '</form>' +
    '</body></html>';
    res.send(postHTML);
})

//  主页输出 "Hello World"
app.get('/', function (req, res) {
    var html = '<h1 style="text-align: center;"><a target="_blank" href="/ShangHai">上海</a></h1>'
    html += '<h1 style="text-align: center;"><a target="_blank" href="/ShenZhen">深圳</a></h1>'
    html += '<h1 style="text-align: center;"><a target="_blank" href="/Setting">设置过滤文本</a></h1>'
    html += '<h1 style="text-align: center;"><a target="_blank" href="/SettingTime">设置刷新时间</a></h1>'
    res.send(html);
})


//  POST 请求
app.post('/', function (req, res) {
    console.log("主页 POST 请求");
    res.send('Hello POST');
})

//  /del_user 页面响应
app.post('/submitSetting', function (req, res) {
    console.log("设置 请求");
    var body = "";
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
        
      
        res.write("设置成功:" + body.name);
        fs.writeFile('filter.txt', body.name,  function(err) {
            if (err) {
                return console.error(err);
            }
            console.log("数据写入成功！");
            console.log("--------我是分割线-------------")
            console.log("读取写入的数据！");
        
            });
        
        res.end();
    });
})

//  /del_user 页面响应
app.post('/submitSettingTime', function (req, res) {
    console.log("设置 请求");
    var body = "";
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
        
      
        res.write("设置刷新时间成功:" + body.name + "秒");
        fs.writeFile('time.txt', body.name,  function(err) {
            if (err) {
                return console.error(err);
            }
            console.log("数据写入成功！");
            console.log("--------我是分割线-------------")
            console.log("读取写入的数据！");
        
            });
        
        res.end();
    });
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
