const https = require('https');
const http = require('http');
const request = require('request');
var querystring = require('querystring');

let ajax = {}

ajax.request = (option, params, success, error) =>{
    var content = querystring.stringify(//序列化一个对象
        params
    );
    var res = http.request(option,function (res) {
        let chunks = [],
            size = 0;
        res.on('data', function (chunk) {
            chunks.push(chunk);
            size += chunk.length;
        });
        res.on('end',function(){
            let data = Buffer.concat(chunks, size);
            success && success(data)
        });
    })
    res.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`);
        error && error(`${e.message}`)
    });
    res.write(content)
    res.end();
}

module.exports = ajax