/**
 *
 * 后台上帝类。主要进行所有后台核心逻辑处理对象接口;
 * 主要提供的接口为:
 * 1、获取所有的设置的项目信息;
 * 2、项目指标获取
 * 3、项目启动操作
 * 4、项目停止操作;
 * 5、添加项目操作;
 * 6、删除项目操作;
 *
 * auth: liyangli
 * date: 17/5/19 上午9:22 .
 */
"use strict";
const pm2 = require("pm2");
const fs = require("fs");

class God{
    constructor(ev){
        this.filePath = "./config.json";
        this.ev = ev;
        this.attrs = {
            START: "start",
            STOP: "stop",
            RESTART: "restart",
            DISCONNECT: "disconnect",
            LIST: "list",
            DESCRIBE: "describe"
        };
        this._pm2EventBind();
    }

    /**
     * pm2相关事件绑定
     * @private
     */
    _pm2EventBind(){
       const self = this;
       pm2.connect(function(err){
           if(err){
               console.error(err);
               process.exit(2);
           }
           console.info(self.attrs);
           for(let i in self.attrs){
               let attr = self.attrs[i];
               self.ev.on(attr,function(process){

                   const callback = function(err,result){
                       //对应回调方法;
                       self.ev.emit(attr+"Finish",err,result);
                   };

                   if(attr != "list"){
                       pm2[attr](process,callback);
                   }else{
                       pm2[attr](callback);
                   }

               });
           }


       });
    }

    /**
     * 获取所有的设置的项目信息;
     * 主要处理步骤:
     * 1、获取统计配置文件中相关数据;
     */
    findList(){
        const self = this;
        //异步方式进行读取配置文件
        fs.readFile(this.filePath,'UTF-8',function(err,data){
            //需要把数据给抛出来;
            self.ev.emit("findListFinish",err,data);
        });
        
    }

    /**
     * 保存和修改对应数据
     * @param saveObj 保存的对象。每次都是批量进行操作
     */
    saveModifyData(saveObj){
        const self = this;
        fs.writeFile(this.filePath,JSON.stringify(saveObj),function(err){
            //写入成功;
            self.ev.emit("saveModifyDataFinish",err);
        });
    }

    /**
     * 获取指定进程的的实时指标数据
     * @param names 项目进程名称
     */
    findMonitor(){
        const self = this;
        self.ev.emit(self.attrs.LIST);
        self.ev.on(self.attrs.LIST+"Finish",(err,result)=>{
           if(err){
               console.error(err);
               return;
           } 
           if(!result){
               return;
           } 
           //对应数据;进行处理; 
        });
    }
    
}


module.exports = God;