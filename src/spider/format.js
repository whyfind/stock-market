const cheerio = require('cheerio');
var util = require('../utils/util');
var path = require("path")
var handlebars = require("handlebars")

var renderKey = function (content, key) {
    var reg = new RegExp(key, 'g');//g就是代表全部bai
    return content.replace(reg, '<span style="color: red;font-weight: bold;">'+ key + '</span>')
}

var listFilter = function (list,isCache) {
    var arr = []
    var webConfig = util.getWebConfig()
    var filter = webConfig.filter.split(" ")
    var defaultFilter = webConfig.defaultFilter.split(" ")

    list.forEach(function (v, index) {
        v.code =  v.code ? '('+v.code +')' : ''
        v.index = index + 1
        v.question = v.question || ''
        v.text = v.text || ''

        //如果没有设置过滤关键词
        if(!webConfig.filter){
            arr.push(v)
        }else{
            filter.forEach(function(key){
                var flag = false
                defaultFilter.forEach(function(noItem){
                    if(v.text.indexOf(noItem) >= 0){
                        flag = true //回答中包含不是 没有 无法 还未 不推送
                    }
                })

                //问题当中有关键词 并且 回答中不包含
                if((v.question.indexOf(key) >= 0 || v.text.indexOf(key) >= 0) && !flag){
                    v.question = renderKey(v.question, key)
                    v.text = renderKey(v.text, key)
                    if(!isCache){
                        //(没有历史记录 或者 没有历史通知)
                        if((!webConfig[v.type] || webConfig[v.type].indexOf(v.id) < 0)){
                            v.isNotify = true
                        }
                        arr.push(v)
                    }else{
                        arr.push(v)
                    }
                }
            })
        }
    })
    return arr
}

//统一根据数据渲染
var renderList = function(list, isCache, title){
    var arr = list
    var notification = "<script>"
    var webConfig = util.getWebConfig()
    var html = ''
    if(!isCache){
        arr = listFilter(list,isCache)
        //如果不是渲染历史 则不需刷新
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

    let $ = util.getIndexPage();
    var con = handlebars.compile($("#listTemplate").html())({list: arr,title: title});
    $('#root').append(html + con)
    return $.html()
}

module.exports = {
    listFilter,
    renderList
}