var fs = require("fs")
var path = require("path")

//读取配置文件
const getWebConfig = () =>{
    var data = {}
    try{
        data = fs.readFileSync(path.join(__dirname, '../config/webConfig.json'));
        data = data.toString()
        data = JSON.parse(data)
    }catch(e){
        data = {}
        console.log(e.message)
    }
    return data
}

//设置配置文件
const setWebConfig = (webConfig) => {
    fs.writeFile(path.join(__dirname, '../config/webConfig.json'), JSON.stringify(webConfig),  function(err) {
        if (err) {
            return console.error(err);
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
        console.log(e.message)
    }
    return data
}

module.exports = {
    getWebConfig: getWebConfig,
    setWebConfig: setWebConfig,
    getTemplate: getTemplate,
}