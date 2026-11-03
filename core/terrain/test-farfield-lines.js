// node core/terrain/test-farfield-lines.js — far lines (44b-core-farfield-lines.js, KFAR.streaks), each check with a negative.
// The draw (host/44b-core-farfield-lines-draw.js) is compiled and counted on SwiftShader by core/atmos/check_shimmer.py.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'44-core-farfield.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
ok('without the file there are no streaks (it is opt-in)',typeof KFAR.streaks==='undefined',false);
eval(fs.readFileSync(path.join(__dirname,'44b-core-farfield-lines.js'),'utf8'));
const lines=[{a:[1000,500,20000],b:[1050,2500,20200]},{a:[3000,600,20000],b:[3020,2400,20150],w:60,lag:.5,wobble:10}];
const S=KFAR.streaks({world:4,lines,range:[3000,40000]});
ok('one item a line, its ends and width kept',S.count===2&&S.a[0]===1000&&S.b[4]===2400&&S.w[0]===40&&Math.abs(S.w[1]-60)<=10,S.count!==2);
const sh=KFAR.streaks({world:4,lines,shape:(x,z,y)=>y*2});ok('shape sets the ends on the relief as drawn',sh.a[1]===1000&&sh.b[1]===5000,false);
ok('the same world, the same lines; another world, another wobble',JSON.stringify(KFAR.streaks({world:4,lines}).w)===JSON.stringify(KFAR.streaks({world:4,lines}).w)&&KFAR.streaks({world:5,lines}).w[1]!==S.w[1],false);
const lo=KFAR.streakAt(S,0,0,20000),hi=KFAR.streakAt(S,0,1,20000);
ok('dry a line keeps half its width and a third of its darkness; wet all of it',Math.abs(lo.w-20)<1e-6&&Math.abs(hi.w-40)<1e-6&&Math.abs(lo.alpha/hi.alpha-.33)<1e-6,lo.w===hi.w);
ok('a lagging line waits for its value',KFAR.streakAt(S,1,.5,20000).w===KFAR.streakAt(S,1,0,20000).w&&KFAR.streakAt(S,1,1,20000).w>KFAR.streakAt(S,1,.75,20000).w,false);
ok('the range fades it at both ends',KFAR.streakAt(S,0,1,2000).alpha===0&&KFAR.streakAt(S,0,1,41000).alpha===0&&KFAR.streakAt(S,0,1,20000).alpha>0,KFAR.streakAt(S,0,1,20000).alpha===0);
const X=KFAR.itemsExport([S]),Y=KFAR.itemsLoad?KFAR.itemsLoad(JSON.parse(JSON.stringify(X))):null;
ok('itemsExport carries a set of kind line',X.sets[0].kind==='line'&&X.sets[0].a.length===6&&Y[0].count===2&&KFAR.streaksOf(Y[0]).a instanceof Float32Array&&KFAR.streaksOf(Y[0]).a[3]===3000,false);
ok('no lines, a bad end, a width of 0 throw',throws(()=>KFAR.streaks({lines:[]}))&&throws(()=>KFAR.streaks({lines:[{a:[0,0],b:[1,1,1]}]}))&&throws(()=>KFAR.streaks({lines:[{a:[0,0,0],b:[1,1,1],w:0}]})),throws(()=>KFAR.streaks({lines})));
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
