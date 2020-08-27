var fs = require("fs")
var path = require("path")
var cheerio = require("cheerio")

function getDayOfWeek(dayValue){
    var day = new Date(Date.parse(dayValue.replace(/-/g, '/'))); //将日期值格式化
    var today = new Array("星期天","星期一","星期二","星期三","星期四","星期五","星期六");
    return today[day.getDay()] //day.getDay();根据Date返一个星期中的某一天，其中0为星期日
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}
let config = null
//读取配置文件
const getWebConfig = () =>{
    if(config){
        return config
    }
    var data = {}
    try{
        data = fs.readFileSync(path.join(__dirname, '../config/webConfig.json'));
        data = data.toString()
        data = JSON.parse(data.toString())
        config = data
    }catch(e){
        data = {}
        console.log('获取配置文件',e.message)
    }
    return data
}

//设置配置文件
const setWebConfig = (webConfig) => {
    config = webConfig
    fs.writeFile(path.join(__dirname, '../config/webConfig.json'), JSON.stringify(webConfig),  function(err) {
        if (err) {
            return console.error('设置配置文件',err);
        }
    });
}

//读取模板
const getTemplate = (path) =>{
    var data = ''
    try{
        data = fs.readFileSync(path);
        data = data.toString()
    }catch(e){
        data = ''
        console.log('读取模板',e.message)
    }
    return data
}

//读取模板
const getMemory = (fileName) =>{
    var data = {}
    try{
        data = fs.readFileSync(path.join(__dirname, fileName));
        data = data.toString()
        data = JSON.parse(data)
    }catch(e){
        data = {}
        console.log('读取挂机内容',e.message)
    }
    return data
}

//设置配置文件
const setMemory = (webConfig, fileName) => {
    fs.writeFile(path.join(__dirname, fileName), JSON.stringify(webConfig),  function(err) {
        if (err) {
            return   console.log('设置挂机内容',err)
        }
    });
}

//清除目录下的文件
const clearMemory = (fileName) => {
    var files = [];
    var deletePath = path.join(__dirname, fileName)
    if( fs.existsSync(deletePath) ) {
        files = fs.readdirSync(deletePath);
        files.forEach(function(file,index){
            var curPath = deletePath + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                clearMemory(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
    }
}

const clearMemoryItem = (fileName) => {
    if(fs.existsSync(path.join(__dirname, fileName)) ){
        fs.unlinkSync(path.join(__dirname, fileName))
    }
}

var pageInit = function(){
    var config = getWebConfig()
    var script = '<script type="application/javascript">'
    script += 'window.watermark="' + config.watermark + '";'
    script += 'window.refreshTime="' + config.refreshTime + '";'
    script += '</script>'
    return script
}

var getIndexPage = function(){
    var template = getTemplate(path.resolve(__dirname, '../index.html'))
    let $ = cheerio.load(template, { decodeEntities: false });
    $('body').attr('id','index-container')
    var script = pageInit()
    $('body').prepend(script)
    return $
}

var getCachePage = function(){
    var template = getTemplate(path.resolve(__dirname, '../cache.html'))
    let $ = cheerio.load(template, { decodeEntities: false });
    $('body').attr('id','index-container')
    var script = pageInit()
    $('body').prepend(script)
    return $
}

module.exports = {
    getWebConfig: getWebConfig,
    setWebConfig: setWebConfig,
    getTemplate: getTemplate,
    getMemory: getMemory,
    setMemory: setMemory,
    clearMemory: clearMemory,
    clearMemoryItem: clearMemoryItem,
    getDayOfWeek: getDayOfWeek,
    formatDate: formatDate,
    getIndexPage: getIndexPage,
    getCachePage: getCachePage,
}