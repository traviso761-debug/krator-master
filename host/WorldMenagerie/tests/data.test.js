import {dataValue,resolveCity,DATA_FN} from '../src/core/data.js';
import {eq,near,ok,deepEq,readJSON} from './assert.js';
const city=readJSON('../data/cities/iziz.json');
export const tests={
  'numbers pass through, strings evaluate, _ keys are dropped'(){deepEq(dataValue({a:1,b:"a+1",_:"note",c:["Math.PI","rad(180)"]},{...DATA_FN,a:1}),{a:1,b:2,c:[Math.PI,Math.PI]});},
  'a bad expression names itself'(){let m='';try{dataValue('nope(',{...DATA_FN});}catch(e){m=e.message;}ok(m.includes('data expression "nope("'),m);},
  'iziz.json resolves to the values the code used to hard-code'(){const C=resolveCity(city);eq(C.WORLD,1400);eq(C.PLATEAU,18);deepEq(C.PALACE,{x:80,z:-60});deepEq(C.TPAD,{x:208,z:58});
    near(C.SPA,315*Math.PI/180);near(C.SP.x,455*Math.cos(315*Math.PI/180));near(C.GATES[1],205*Math.PI/180);eq(C.STATUES.length,11);eq(C.STATUES[6][5],'terrace');near(C.STATUES[1][0],140);
    ok(!('Math' in C)&&!('rad' in C));eq(C.wall.base,235);},
  'views resolve with ground()'(){const C=resolveCity(city);const v=dataValue(city.views['Arena'],{...C,...DATA_FN,ground:(x,z)=>100});eq(v.length,6);near(v[1],148);near(v[0],C.ARENA.x-60);},
};
