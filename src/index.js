console.log('你好！欢迎使用废废的小工具~');
const https = require('https');
const cheerio = require('cheerio');
var querystring = require('querystring');

var util = require('./utils/util');
var ajax = require('./utils/http');
var path = require("path")
var handlebars = require("handlebars")

var express = require('express');
var app = express();
app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './css')));
app.use(express.static(path.join(__dirname, './js')));

var timer = null

var listFilter = function (list) {
    var arr = []
    var webConfig = util.getWebConfig()

    list.forEach(function (v, index) {
        v.code =  v.code ? '('+v.code +')' : ''
        v.index = index + 1
        v.question = v.question || ''
        v.text = v.text || ''

        //如果没有设置过滤关键词
        if(!webConfig.filter){
            arr.push(v)
        }else{
            var filter = webConfig.filter.split(" ")
            var defaultFilter = webConfig.defaultFilter.split(" ")
            filter.forEach(function(item){
                var flag = false
                defaultFilter.forEach(function(noItem){
                    if(v.text.indexOf(noItem) >= 0){
                        flag = true //回答中包含不是 没有 无法 还未 不推送
                    }
                })

                //问题当中有关键词 并且 回答中不包含
                if((v.question.indexOf(item) >= 0 || v.text.indexOf(item) >= 0) && !flag){
                    arr.push(v)
                    //(没有历史记录 或者 没有历史通知)
                    if((!webConfig[v.type] || webConfig[v.type].indexOf(v.id) < 0)){
                        v.isNotify = true
                    }
                }
            })
        }
    })
    return arr
}

var clearHistoryMessage = require('./router/history')
var settingKey = require('./router/settingKey')
var settingTime = require('./router/settingTime')
app.use('/',clearHistoryMessage)
app.use('/',settingKey)
app.use('/',settingTime)

//统一根据数据渲染
var renderList = function(list, isCache){
    var arr = listFilter(list)
    var notification = "<script>"
    var webConfig = util.getWebConfig()
    var html = ''
    //如果不是渲染历史 则不需刷新
    if(!isCache){
        arr.forEach(function (v, index) {
            if(v.isNotify){
                webConfig[v.type] = webConfig[v.type] || []
                webConfig[v.type].push(v.id)
                notification += "setTimeout(function(){createNotify('"+ v.title +"',{body:'有需要您关注的信息'})}, 0);" +
                    'var myVideo=document.getElementById("myAudio");myVideo.addEventListener("canplay",function(){myVideo.play();});'
            }
        })
        notification += "</script>"

        var data = webConfig.refreshTime
        var time = (isNaN(Number(data)) ? 60: data) * 1000
        var reload = '<script>setTimeout(function(){window.location.reload()},'+ time +');</script>'
        util.setWebConfig(webConfig)
        html = notification + reload;
    }

    var template = util.getTemplate(path.resolve(__dirname, './index.html'))
    let $ = cheerio.load(template, { decodeEntities: false });
    var con = handlebars.compile($("#listTemplate").html())({list: arr,isCache: isCache});

    $('#root').append(html + con)
    return $.html()
}

//获取上海的数据
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
            callback(list)
        });
    });
}

//获取深圳的数据
var getShenZhenHtml = function (callback) {
    var params = {
        pageNo: 1,
        pageSize: 10,
        searchTypes: '11,',
        market: '',
        industry: '',
        stockCode: ''
    };
    var option = {
        method: 'post',
        host: 'irm.cninfo.com.cn',
        prot: '80',
        path: '/ircs/index/search',
        headers: {// 必选信息
            "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
        },
    };
    ajax.request(option, params, function (res) {
        var list = []
        JSON.parse(res).results.forEach(function (v) {
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
        callback(list)
    })
}


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
            var list = listFilter(map.shenzhenList.concat(map.shanghList))
            var mapList = util.getHistory()
            list.forEach(function (v) {
                if(!mapList[v.id]){
                    mapList[v.id] = v
                }
            })
            util.setHistory(mapList)
        }
    }
     timer = setInterval( function () {
         if(webConfig.settingMessage == 'no'){
             clearInterval(timer)
             return
         }
         console.log('发出请求，运行一次~')
        getShangHaiHtml(
            function (list) {
                map.shanghai = true
                map.shanghList = list
                save()
            }
        )
         getShenZhenHtml(
             function (list) {
                 map.shenzhen = true
                 map.shenzhenList = list
                 save()
             }
         )
    }, 20000)
}

//历史消息
app.get('/historyInfo', function (req, res) {
    var history = util.getHistory()
    var arr = []
    Object.keys(history).forEach(function (v) {
        arr.push(history[v])
    })
    var html = renderList(arr, true)
    res.send(html);
})


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
            var html = renderList(map.shenzhenList.concat(map.shanghList))
            res.send(html);
        }
    }
    getShangHaiHtml(
        function (list) {
            map.shanghai = true
            map.shanghList = list
            all()
        }
    )
    getShenZhenHtml(
        function (list) {
            map.shenzhen = true
            map.shenzhenList = list
            all()
        }
    )
})


//上海的数据接口
app.get('/ShangHai', function (req, res) {
    getShangHaiHtml(
        function (list) {
            var html = renderList(list)
            res.send(html);
        }
    )
})

//深圳的数据接口
app.get('/ShenZhen', function (req, res) {
    getShenZhenHtml(
        function (list) {
            var html = renderList(list)
            res.send(html);
        }
    )
})

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



//  主页
app.get('/', function (req, res) {
    var template = util.getTemplate(path.resolve(__dirname, './index.html'))
    let $ = cheerio.load(template, { decodeEntities: false });
    $('body').attr('id','index-container')
    $('body').append($('#index').html())
    res.send($.html());
})


//  POST 请求
app.post('/', function (req, res) {
    res.send('Hello POST');
})

//更新关键词
app.post('/submitSetting', function (req, res) {
    var body = "";
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        body.filter = body.filter || ''
        body.defaultFilter = body.defaultFilter || ''
        // 设置响应头部信息及编码
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
        res.write("设置默认非成功：" + body.defaultFilter + "</br>设置关键词成功：" + body.filter);
        var webConfig = util.getWebConfig()
        webConfig.filter = body.filter
        webConfig.defaultFilter = body.defaultFilter
        util.setWebConfig(webConfig)
        res.end();
    });
})

//更新刷新时间
app.post('/submitSettingTime', function (req, res) {
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
        var webConfig = util.getWebConfig()
        webConfig.refreshTime = body.name || ''
        util.setWebConfig(webConfig)
        res.end();
    });
})

app.get('/list_user', function (req, res) {
    res.send('用户列表页面');
})

app.get('/ab*cd', function(req, res) {
    res.send('正则匹配');
})

var server = app.listen(8082, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
