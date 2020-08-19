const cheerio = require('cheerio');
var util = require('../utils/util');
var path = require("path")
var handlebars = require("handlebars")

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

    var template = util.getTemplate(path.resolve(__dirname, '../index.html'))
    let $ = cheerio.load(template, { decodeEntities: false });
    var con = handlebars.compile($("#listTemplate").html())({list: arr,isCache: isCache});

    $('#root').append(html + con)
    return $.html()
}

module.exports = {
    listFilter,
    renderList
}