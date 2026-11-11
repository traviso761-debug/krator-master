// node core/clock/test-flush.js — KCLOCK.flush (opt/21-core-clock-flush.js), each check with a negative; --write rewrites
// golden-flush.json, which kseason_flush_test.gd holds kseason.gd's KSeason.flush to.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'20-core-clock.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const before=JSON.stringify([0,40,100,200,300].map(d=>KCLOCK.season(d,12,{sharp:2})));
eval(fs.readFileSync(path.join(__dirname,'opt','21-core-clock-flush.js'),'utf8'));
ok('loaded, KCLOCK.season answers exactly as before',JSON.stringify([0,40,100,200,300].map(d=>KCLOCK.season(d,12,{sharp:2})))===before,false);
const F=(d,o)=>KCLOCK.flush(d,0,o),W=(d,o)=>KCLOCK.season(d,0,o).wet;
// the onset: the first day the wet rises through .5
const onset=o=>{for(let d=1;d<=366;d+=.25)if(W(d-.25,o)<.5&&W(d,o)>=.5)return d;return null;};
for(const o of [{sharp:2},{},{lagD:30,sharp:3},{latitude:20},{wetIn:'winter',sharp:2}]){
  const d0=onset(o),k=JSON.stringify(o);
  ok('since is 0 at the onset of the rains '+k+' (day '+d0+')',d0!=null&&Math.min(F(d0,o).since,365-F(d0,o).since)<.3,false);
  ok('  and the flush is full a week in, gone by six weeks '+k,F(d0+8,o).flush>.99&&F(d0+42,o).flush===0&&F(d0-1,o).flush===0,F(d0+100,o).flush>0);}
ok('sharp does not move the onset',Math.abs(onset({sharp:4})-onset({}))<.3,false);
ok('the pulse\'s shape: rise, hold and fade in days',Math.abs(F(onset({})+2.5,{}).flush-.5)<.1&&F(onset({})+3,{rise:2}).flush===1&&F(onset({})+20,{hold:5,fade:5}).flush===0,false);
ok('the flush is 0..1 every day of the year, and comes once',(()=>{let n=0,p=0;for(let d=0;d<365;d+=.5){const f=F(d,{sharp:2}).flush;if(f<0||f>1)return false;if(f>.5&&p<=.5)n++;p=f;}return n===1;})(),false);
const cases=[];for(let i=0;i<60;i++){const o=[{sharp:2},{lagD:20},{latitude:15,rise:3},{wetIn:'winter',hold:10,fade:6}][i%4],d=i*6.7,h=(i*5)%24;cases.push({day:d,hour:h,o,out:KCLOCK.flush(d,h,o)});}
const G=path.join(__dirname,'golden-flush.json'),gold={format:'krator-flush-golden',version:1,cases};
if(process.argv.includes('--write'))fs.writeFileSync(G,JSON.stringify(gold)+'\n');
ok('golden-flush.json is the module\'s output (--write rewrites it)',fs.existsSync(G)&&fs.readFileSync(G,'utf8')===JSON.stringify(gold)+'\n',false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
