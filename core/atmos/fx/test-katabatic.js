// node core/atmos/fx/test-katabatic.js -- the katabatic wind (89-atmos-fx-katabatic.js): its state by the hour is pure and does what its
// options say; bound, its frame hook turns the base wind and raises the gusts after the weather's hook, and stop() puts the day back.
// Each check has a negative. The drawing (the foliage, smoke and snow riding the wind) is checked in the pages that take it.
'use strict';
const fs=require('fs'),path=require('path');global.window=global;
const src=[path.join(__dirname,'..','89-atmos-0-core.js'),path.join(__dirname,'..','89-atmos-0p-presets.js'),path.join(__dirname,'89-atmos-fx-katabatic.js')];
eval(src.map(f=>fs.readFileSync(f,'utf8')).join('\n')+';global.ATMOS=ATMOS;');   /* as test-fx.js loads them: one script */
const A=global.ATMOS;let bad=0;const ok=(n,p,neg)=>{const r=p&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+n+(neg?' (its negative passed)':''));};
const P=A.PRESETS.wind,calm=Math.hypot(P.base[0],P.base[1]);
const O={from:[-.55,-.83],speed:3,on:21,off:5,ramp:1,gust:.9};
// 1. the state by the hour: full from 21:00 to 05:00, none by day, ramps between
const st=h=>A.katabaticAt(h,O);
ok('full gale at 02:00 and 22:00, none at 14:00',st(2).k>.999&&st(22).k>.999&&st(14).k<1e-9,st(14).k>0);
ok('it rises over the hour before 21:00 and eases over the hour after 05:00',st(20.5).k>.3&&st(20.5).k<.7&&st(5.5).k>.3&&st(5.5).k<.7&&st(19.9).k<1e-9&&st(6.1).k<1e-9,st(20.5).k===1);
// 2. it blows toward -from at speed x calm (before the weather's scale)
{const w=st(2).wind,m=Math.hypot(w[0],w[1]),u=O.from,dot=-(w[0]*u[0]+w[1]*u[1])/m/Math.hypot(u[0],u[1]);
 ok('at full it blows away from `from`, speed x the calm base',dot>.999&&Math.abs(m-3*calm)<1e-6,dot<0);}
ok('by day the base wind is the presets\' own',Math.abs(st(14).wind[0]-P.base[0])<1e-9&&Math.abs(st(14).wind[1]-P.base[1])<1e-9,false);
ok('the gust floor follows k',Math.abs(st(2).gust-.9)<1e-9&&st(14).gust===0,st(14).gust>0);
// 3. bound: a stub host (the core's own windBase and U, no THREE): the hook moves itself behind the weather's, then sets the base and the gusts
const V=(x,y)=>({x,y,set(a,b){this.x=a;this.y=b;return this;}});
A.windBase=V(P.base[0],P.base[1]);A.U={gustAmp:{value:.5}};A.hooks=[];A.fx=A.fx||[];
const weather=()=>{A.U.gustAmp.value=.55;};   /* the weather's hook writes the gusts every frame */
const K=A.katabatic(O);A.hook(weather);
const frame=h=>{for(const fn of A.hooks.slice())fn(0,h,1/60);};
frame(2);frame(2);
ok('the hook runs after the weather\'s (moved to the end on its first frame)',A.hooks[A.hooks.length-1]!==weather&&A.hooks.indexOf(weather)<A.hooks.length-1,A.hooks[A.hooks.length-1]===weather);
ok('at 02:00 the base wind is the gale, the gusts its floor over the weather\'s',Math.abs(Math.hypot(A.windBase.x,A.windBase.y)-3*calm)<1e-6&&A.U.gustAmp.value===.9,A.U.gustAmp.value===.55);
frame(14);
ok('at 14:00 the base wind is the day\'s again, the gusts the weather\'s',Math.abs(A.windBase.x-P.base[0])<1e-9&&A.U.gustAmp.value===.55,Math.abs(A.windBase.x-P.base[0])>1e-6);
ok('its record carries the options for the export',K.rec.type==='katabatic'&&K.rec.on===21&&K.rec.speed===3&&A.fx.indexOf(K.rec)>=0,!K.rec);
frame(2);K.stop();frame(2);
ok('stop() unhooks it and puts the day\'s base back',A.hooks.length===1&&Math.abs(A.windBase.x-P.base[0])<1e-9,A.hooks.length>1);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
