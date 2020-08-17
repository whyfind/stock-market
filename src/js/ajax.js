
var Ajax = function(type,url,ops){

    // 先处理默认属性
    ops.type = ops.type || "get";
    ops.data = ops.data || {};
    // 根据当前的请求方式，决定是否需要拼接数据，处理url

    var dataStr = ''; //数据拼接字符串
    ops.data['_'] = new Date().getTime();

    Object.keys(ops.data).forEach(key => {
        dataStr += key + '=' + ops.data[key] + '&';
    })
    if (dataStr !== '') {
        dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
    }
    if (type == 'GET') {
        if (dataStr !== '') {
            ops.url = url + '?' + dataStr;
        }
    }


    // 创建xhr对象
    var xhr = new XMLHttpRequest();
    // 开启请求
    xhr.open(ops.type, ops.url);
    // 根据类型决定send的内容及内容数据格式
    if(ops.type == "get"){
        xhr.send();
    }else{
        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xhr.send(ops.data);
    }
    // 开启监听
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            // 执行回调函数，取出数据
            ops.success(xhr.responseText);
        }
    }
}
var Http = {}
Http.get = (options) => {
    return Ajax('GET', options.url, options)
}
Http.post = (options) => {
    if(options.dataType && options.dataType.toLowerCase() == 'json'){
        return Ajax('SUBMIT', options.url, options)
    }else {
        return Ajax('POST', options.url, options)
    }
}
Http.upload = (options) => {
    return Ajax('UPLOAD', options.url, options)
}
window.Http = Http