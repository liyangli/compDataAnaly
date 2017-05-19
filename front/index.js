/**
 *
 * 前端vux处理类
 * auth: liyangli
 * date: 17/5/19 下午1:43 .
 */

(function(){
    "use strict";


    var FileList = {
        template: '<div style="height:100%;">' +
        '<div class="panel panel-primary" style="height:100%;margin-bottom: 0px;">' +
        '<div class="panel-heading">' +
        '<div class="caption">程序集中管理</div>' +
        '<div class="tools">' +
        '<a class="glyphicon glyphicon-plus" v-on:click="add()"></a>' +
        '<a class="glyphicon glyphicon-minus" v-on:click="del()"></a>' +
        '</div>' +
        '</div>' +
        '<div class="panel-body index-panel" id="content">' +
        '<table class="table table-bordered table-striped table-responsive">' +
        '<tr >' +
        '<th width="30px"><input type="checkbox" v-model="allBoxFlag" v-on:click="checkAll()"></th>' +
        '<th width="100px">名称</th>' +
        '<th width="200px">创建时间</th>' +
        '<th width="100px">状态</th>' +
        '<th width="100px">CPU</th>' +
        '<th width="100px">内存</th>' +
        '<th>文件名称</th>' +
        '<th width="100px">文件大小</th>' +
        '<th width="100px">操作</th>' +
        '</tr></table><div class="div-con"><table class="table" >' +
        '<tr v-for="sys in list">' +
        '<td width="30px"><input type="checkbox" v-model="sys.flag"></td>' +
        '<td width="100px">{{sys.name}}</td>' +
        '<td width="200px">{{sys.time}}</td>' +
        '<td width="100px">{{sys.status}}</td>' +
        '<td width="100px">{{sys.cpu}}</td>' +
        '<td width="100px">{{sys.mem}}</td>' +
        '<td>{{sys.fileName}}</td>' +
        '<td width="100px">{{sys.fileSize}}</td>' +
        '<td width="100px" class="opear-con"><a class="glyphicon glyphicon-edit"></a><a class="glyphicon glyphicon-minus"></a></td>' +
        '</tr>' +
        '</table></div>' +
        '</div> ' +
        '<div class="panel-footer text-center">BH-V0.0.1</div>' +
        '</div> ' +
        '</div>',
        data: function(){
            return {
                list: [{
                    name: 'demo',
                    time: '2017-01-12 12:12:12',
                    status: 1,
                    cpu: '12%',
                    mem: '124M',
                    fileName: 'demo.js',
                    fileSize: '12kp'
                }],
                allBoxFlag: false
            }
        },
        created: function(){
            //一开始加载就需要从后台后去所有的数据
            var agent = new Agent();
            agent.findList(this);
        },
        methods: {
           add: function(){
               this.list.push({
                   name: 'demo',
                   time: new Date(),
                   status: 1,
                   cpu: '12%',
                   mem: '124M',
                   fileName: 'demo.js',
                   fileSize: '12kp'
               });
           },
           del: function(){
               this.list.pop();
           },
            checkAll: function(){
                var allBoxFlag = this.allBoxFlag;
                for(var i in this.list){
                    var sys = this.list[i];
                    sys.flag = allBoxFlag;
                }
            }
        }
    };

    var app = new Vue({
        el: '#app',
        data: {

        },
        components: {
            'file-list': FileList
        }
    });
    
})();
