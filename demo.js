/**
 *
 * auth: liyangli
 * date: 17/4/27 下午2:50 .
 */
"use strict";
const events = require('events');
const moment = require('moment');
class Person extends events.EventEmitter{
    main(){
        //进行事件的绑定;主要进行针对其他操作时能够进行触发该动作;
        this.on("nameChange",function(data){
            console.info("Person 中nameChange->"+data);
        });
        for(let i=0;i<100;i++){
            this.on("name_"+i,function(data){
                console.info("i is "+i+",data->"+data);
            })
        }
    }
}

class Dog extends events.EventEmitter{
    wowo(person){
        console.info("Dog is wowo, 进行触发person name Changed");
        person.emit("nameChange","Dog wowo");
        for(let k =10;k<20;k++){
            person.emit("name_"+k,k,"for 方式处理");
        }
        person.emit("nameChange","Dog wowo");
    }
}

var nn = "select name from t_demo where time > '${time}'and time <= '${time}'";
var rep = new RegExp("\\$\\{time\\}","g");
let value = nn.replace(rep,"liyangli");
console.info(value);
/*console.info(process.uptime());*/

console.info(moment().format('YYYY-MM-DD hh:mm:ss'));
console.info(moment().subtract(1,'days').format('YYYY-MM-DD hh:mm:ss'));

/*let person = new Person();
person.main();

let dog = new Dog();
dog.wowo(person);*/





