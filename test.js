var cp = require('child_process')
var path = require('path')
var fs = require('fs')
var initApp = function() {
    var vbsPath = path.join(__dirname, 'vb.message.vbs')

    cp.exec('mshta "javascript:var sh=new ActiveXObject("WScript.Shell"); sh.Popup("Message!", 10, "Title!", 64 );close()"')
}

initApp()