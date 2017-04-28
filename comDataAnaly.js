/**
 *
 * 程序分析入口;
 * 程序启动时就会自动进行设定。
 * 该程序需要定时进行启动起来。每次启动后执行的步骤为:
 * 1、获取数据库中对应配置数据;
 * 2、根据对应数据库中获取到的数据进行设定统计数据并且入库操作
 * auth: liyangli
 * date: 17/4/27 下午1:47 .
 */
"use strict";
const mysql = require("mysql");
const events = require('events');
const settings = require("./settings");
const Promise = require("promise");
const moment = require("moment");
/**
 * 打印异常堆栈
 */
process.on('uncaughtException', function(err) {
    console.log(err.stack);
});
/**
 * 组件数据处理类;执行的入口
 */
class ComDataDeal extends events.EventEmitter{


    /**
     * 事件的绑定;主要针对数据访问完成后进行监测对应数据是否存在。如果存在了进行处理分析。然后进行设定入库
     * @private
     */
    _bindEvent(){
        let self = this;
        self.on("dataInitSuc",function(result){
            //开始进行处理具体数据
            self._dealData(result);
        });
    }
    
    _dealData(result){
        for(var i in result){
            //每一行数据;需要动态进行获取数据库数据,进行查看
        }        
    }
    /**
     * 获取数据库连接池
     */
    _connPool(){
        var mysql_pool = mysql.createPool(
            {
                host : settings.mysql.host,
                user :  settings.mysql.username,
                password :settings.mysql.password,
                database : settings.mysql.database,
                port: settings.mysql.port|| 3306 ,
                connectionLimit:settings.mysql.pool.connectionLimit ,
                waitForConnections: settings.mysql.pool.waitForConnections,
                acquireTimeout:settings.mysql.pool.acquireTimeout,
                debug: settings.mysql.pool.debug
            }
        );
        return mysql_pool;
    };
    main(){
        this._bindEvent();
        console.info("=========================start=====================================");
        console.info("============%s  开始进行启动分析处理功能=============================",moment().format('YYYY-MM-DD hh:mm:ss'));
        //开始进行读取数据库中对应数据;
        var connPool = this._connPool();
        var em = new events.EventEmitter();
        //交给具体的读取的功能进行处理
        let readDB = new ReadDB(connPool,em);
         new WriteDB(connPool,em);

        readDB.read();
        
    }
}

/**
 * 主要负责进行读取数据库中配置文件信息;设定完成后触发对应写入操作
 */
class ReadDB {


    constructor(cp,em){
        this.connPool = cp;
        this.tableName = "t_runParams";
        this.eventEmitter = em;
    }

    /**
     * 获取指定表中所有的数据
     * @private
     */
    _findAll(conn){
        var self = this;
        var promise = new Promise(function(fullfill,reject){
            var sql = "select * from "+ self.tableName;
            conn.query(sql,function(err,result){
                conn.release();
                if(err){
                    reject(err);
                }else{
                    fullfill(result);
                }

            });
        });
        
        
        return promise;

    }

    /**
     * 获取对应数据库连接
     * @returns {Function|*}
     * @private
     */
    _getConn(){
        var self = this;
        var promise = new Promise(function(fulfill,reject){
            self.connPool.getConnection(function(err,conn){
                if(err){
                    reject(err);
                }else{
                    fulfill(conn);
                }
            });
        });
        
        return promise;
    }

    /**
     * 开始读取参数数据
     */
    read(){
        //1、读取所有的参数数据;
        //2、读取完成后进行触发对应读取完毕事件。交给具体入库数据进行操作处理
        var self = this;
        self._getConn().then(function(conn){
            //连接正常了。需要进行获取所有的数据;
            return self._findAll(conn);
        },function(err){
            console.error("%s 出现错误,错误信息为->%s",err);
        }).then(function(result){
            //触发对应处理事件;主要进行设定具体的处理事件。处理完成后再进行入库操作;
            self._dealRunParams(result);
        },function(err){
            console.error("%s 出现错误,错误信息为->%s",err);
        });
    }

    /**
     * 根据查询条件进行获取对应数据,
     * 需要进行动态替换掉设定时间位置
     * 支持转换的参数有${time} ${preTime} ${nextTime}
     * 例如
     * select name ,age from t_from _cp where reportTime > '${time}' and 1=1 group by name;
     * 针对事件则直接通用的方式${time};
     * 后续再进行支持其他方式进行操作；
     *
     * @param filterCondition 查询条件
     * @param conn 连接对象
     * @returns {*} Promsie对象
     * @private
     */
    _findConditionResult(filterCondition,conn){
        let sql = filterCondition.replace(new RegExp("\\$\\{time\\}","g"),moment().format('YYYY-MM-DD'))
            .replace(new RegExp("\\$\\{preTime\\}","g"),moment().subtract('1',"days").format('YYYY-MM-DD'))
            .replace(new RegExp("\\$\\{nextTime\\}","g"),moment().add('1',"days").format('YYYY-MM-DD'));
        return new Promise(function(fullfile,reject){
            //开始根据具体的sql进行执行操作；
            console.info("开始执行对应统计数据的sql====================");
            console.info(sql);
            conn.query(sql,function(err,result){
                //表明进行查询完毕了
                conn.release();
                if(err){
                    reject(err);
                }else{
                    fullfile(result);
                }
            });
        });
    }

    /**
     * 处理对应运行参数;
     * 该方法主要操作步骤:
     * 1、根据具体的统计维度进行获取对应查询条件数据;
     * 2、根据获取到的数据进行分析
     * 3、通知具体入库操作writeDB事件
     * @param runParam
     * @private
     */
    _dealRunParam(runParam){
        let filterCondition = runParam.filterCondition;
        let self = this;
        //执行查询动作
        this._getConn().then(function(conn){
            //进行根据查询条件进行执行相关操作
            return self._findConditionResult(filterCondition,conn);
        },function(err){
           console.error("连接数据库出现错误->%s",err);
        }).then(function(result){
            //进行事件通知。进行告知数据查询完毕;进行统一进行处理;
            self.eventEmitter.emit("dealStatis",result,runParam);
        },function(err){
            console.error("数据查询时出现问题->%s",err);
        });
    }

    /**
     * 处理运行参数所有数据;主要进行根据数据进行动态统计需要展示的数据;
     * @param result
     * @private
     */
    _dealRunParams(result){
       for(let i in result){
           //运行参数对象
           var runParam = result[i];
           var status = runParam.status;
           if(status === 2){
               //表明是丢弃掉的数据
               continue;
           }
           var filterConfition = runParam.filterCondition;
           if(!filterConfition){
               continue;
           }
           this._dealRunParam(runParam);
       }
    }
}
/**
 * 主要进行写入到数据库中。监听具体时间。由readDB进行出发完成动作后进行出发动作
 */
class WriteDB {
    constructor(cp,em){
        this.connPool = cp;
        this.eventEmmiter = em;
        this.runNum = 0;
        this._bindEvent();
    }

    /**
     * 基础事件绑定;主要对外提供的是数据组装完毕后直接交给具体处理方法进行处理
     * @private
     */
    _bindEvent(){
        let self = this;
        this.eventEmmiter.on("dealStatis",function(result,runParam){
            self._dealData(result,runParam);
        });
    }

    _dealData(result,runParam){
        console.info(result);
        console.info(runParam);
        console.info("========================");
        if(!result){
            return;
        }
        //统计维度字段
        let statisLatitude = runParam.statisLatitude;
        //统计表
        let statisTable = runParam.statisTable;

        let totalSize = result.length;
        //真正处理数据;
        for(let i in result){
            let obj = result[i];
            let val ;
            //obj中知会含有两个参数;如果含有多个参数表明存在问题
            for(let k in obj){
                if(k == statisLatitude){
                    //表明该属性为具体统计类型
                    continue;
                }
                //表明该属性为具体的统计值
                val = obj[k];
            }
            let type = obj[statisLatitude];//字段类型
            //开启写入数据库操作
            this._writeDB(val,type,statisTable,statisLatitude,runParam.id,totalSize);
        }
    }

    /**
     * 获取对应数据库连接
     * @returns {Function|*}
     * @private
     */
    _getConn(){
        var self = this;
        var promise = new Promise(function(fulfill,reject){
            self.connPool.getConnection(function(err,conn){
                if(err){
                    reject(err);
                }else{
                    fulfill(conn);
                }
            });
        });

        return promise;
    }

    /**
     * 真正入库动作
     * @param val 值
     * @param type 类型
     * @param statisTable 统计表
     * @param statisLatitude 统计列
     * @private
     */
    _writeDB(val,type,statisTable,statisLatitude,tagId,total){
        let sql = "insert into "+statisTable+"("+statisLatitude+",statisCount,tagId,time) values(?,?,?,?)";
        let self = this;
        this._getConn().then(function(conn){
            //开始执行真正的入库操作;
            conn.query(sql,[type,val,tagId,moment().format('YYYY-MM-DD')],function(err,result){
                //执行的结果。如果失败了就直接设定出来;
                if(err){
                    console.error("插入数据出现了错误。。->%s",err);
                }
                self.runNum ++;
                console.log("runNum->%s,total->%s",self.runNum,total);
                if(self.runNum >= total){
                    process.exit(1);
                }
            });
            //全部执行完成后进行把进程kill掉。

        },function(err){
            console.error("获取数据库连接出现问题了->%s",err);
        });
    }


}

let comDataDeal = new ComDataDeal();
comDataDeal.main();


