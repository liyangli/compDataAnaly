/**
 *
 * 代理类。主要为了方便进行对应切换到不同方式进行展示处理
 * auth: liyangli
 * date: 17/5/19 下午5:12 .
 */
"use strict";


var Agent = function(){
    //对应执行的方式;

    const EventEmmit = require('events');
    const God = require('./back/god.js');
    this.ev = new EventEmmit();
    this.god = new  God(this.ev);
    /*try {

    } catch (e) {
        //表明不存在。进行通过异步方式进行获取相关数据;主要可以针对http方式继续处理;
        throw e;
    }*/

};
Agent.prototype = {
    /**
     * 查询所有的设定好的数据
     * @param vm vue对应组件对象
     */
    findList: function(vm){
        this.god.findList();
        this.ev.on("findListFinish",function(err,result){
            if(err){
                console.error(err);
                return;
            }
            //需要把组装的数据进行返回出去
            if(!result){
                console.info("数据不存在");
            }
            vm.list = JSON.parse(result);
        });
    },
    /**
     * 添加或者修改对应数据
     * @param vm
     */
    addOrModify: function(vm){
        
    }
};


var agent = new Agent();
var vm = {};
agent.findList(vm);
