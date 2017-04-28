/**
 *
 * auth: liyangli
 * date: 17/4/27 下午4:06 .
 */
"use strict";
var cp = require("child_process");
cp.exec('ifconfig eth',function(err,result){
    //体现具体数据
    console.info(result);
});