// node core/atmos/wx/test-cells.js [--write]: the weather cells' contract (W5), pure data, no browser.
// Each check that can go wrong has a negative: the check fails on a faulty input and passes on the fixed one (tools/ktest.js).
// golden-cells.json beside this file holds the vectors the Godot twin (godot/krator/atmos_cells.gd,
// godot/tests/atmos/cells_test.gd) is held to; --write rewrites it (only after a change meant to move the cells).
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const T=require('../../../tools/ktest.js')(__filename);
const ROOT=path.join(__dirname,'..','..','..'),AT=path.join(__dirname,'..');
const FR=[path.join(ROOT,'core','rand','08-core-rand.js'),path.join(ROOT,'core','shader','06-core-khook.js'),path.join(ROOT,'core','shader','06b-core-kcolor.js'),
 path.join(AT,'89-atmos-0-core.js'),path.join(AT,'89-atmos-0p-presets.js'),path.join(AT,'89-atmos-4-weather.js'),
 path.join(AT,'sky','89-atmos-e-skymodel.js'),path.join(AT,'sky','89-atmos-f-skypresets.js'),path.join(AT,'sky','89-atmos-g-sky.js')];
global.window=global;
const src=fs.readFileSync.bind(fs);
eval(FR.map(f=>src(f,'utf8')).join('\n')+';global.ATMOS=ATMOS;global.KRAND=KRAND;');
const A=ATMOS;
// the sky's chunk before the cells file is listed: the text every other page keeps
const skyBefore=A.skyGLSL(),shadeBefore=A.cloudShadeGLSL();
eval(src(path.join(__dirname,'89-atmos-wx-cells.js'),'utf8'));
const CROPS_SRC=path.join(ROOT,'kits','crops','src','10-crop-core.js');
let CR=null;if(fs.existsSync(CROPS_SRC)){(0,eval)(src(CROPS_SRC,'utf8'));CR=globalThis.CROPS;}   /* the kit's own globalThis.CROPS */
const near=(a,b,e)=>Math.abs(a-b)<(e==null?1e-12:e);

// ---- the sky chunk: unchanged without the cells; with them, the map's lines in both the sky and the shade
T.ok('without the cells file the sky chunk has no coverage map',skyBefore.indexOf('atmWx')<0&&shadeBefore.indexOf('atmWx')<0);
T.ok('with it, the sky and the cloud shade both read the map',A.skyGLSL().indexOf('atmCloudCoverAt(n,xz,wm)')>0&&A.cloudShadeGLSL().indexOf('atmCloudCoverAt(atmCloudField(Q,3),Q,m)')>0);

// ---- the climate
const sum=w=>A.WX_KINDS.reduce((s,k)=>s+w[k],0)+w.clear;
const wT=A.wxWeights({},{warmth:.55,aridity:.3}),wD=A.wxWeights({dry:true},{warmth:.9,aridity:.95}),wC=A.wxWeights({cold:true},{warmth:.1,aridity:.4}),
 wF=A.wxWeights({cold:true,frozen:true},{warmth:.5,aridity:.4}),wA=A.wxWeights({ash:true},{warmth:.6,aridity:.5});
T.ok('the weights sum to 1 in every climate',[wT,wD,wC,wF,wA].every(w=>near(sum(w),1,1e-12)));
T.neg('a desert raises dust over rain, a temperate place rain over dust',w=>w.dust>w.rain,wT,wD);
T.neg('a cold climate snows more than it rains',w=>w.snow>w.rain,wT,wC);
T.neg('a frozen climate never rains',w=>w.rain===0&&w.storm===0&&w.snow>0,wC.rain>0?wC:wT,wF);
T.neg('ash only where the climate has it',w=>w.ash>0,wT,wA);
T.neg('warmer wet ground storms more',w=>w.storm/(w.rain+w.storm)>.3,A.wxWeights({},{warmth:.1,aridity:.2}),A.wxWeights({},{warmth:.95,aridity:.2}));
if(CR){const sw=A.wxAxesFromCrops(CR,'swbay'),sd=A.wxAxesFromCrops(CR,'sedesert');
 T.ok('the crops kit gives axes for its biomes',!!sw&&!!sd,JSON.stringify({sw,sd}));
 T.neg('the crops axes: sedesert is drier than swbay',a=>a&&a.aridity>.6,sw,sd);
 T.ok('a biome the crops kit lacks gives null',A.wxAxesFromCrops(CR,'no-such-biome')===null);}
else console.log('SKIP  the crops axes: kits/crops/src/10-crop-core.js not found');

// ---- the cells
const S=A.wxSystem({seed:20261123,climate:{},axes:{warmth:.6,aridity:.3},wind:[.8,.35]});
T.ok('the steering wind follows the base wind at the preset speed',near(Math.hypot(S.vx,S.vz),S.P.speed,1e-9)&&near(S.vx/S.vz,.8/.35,1e-9));
const c0=A.wxCell(S,0,0,0,0)||A.wxCell(S,0,0,1,500)||A.wxCell(S,1,0,2,900);
T.ok('some slot is live',!!c0);
// a cell is the same whoever asks and in whatever order
{const a=A.wxCells(S,c0.x,c0.z,c0.born+10,0),b=(A.wxCells(S,-40000,40000,3000,0),A.wxCells(S,c0.x,c0.z,c0.born+10,0));
 T.ok('the cells near a point are the same on a second ask',JSON.stringify(a)===JSON.stringify(b)&&a.length>0,a.length);}
// a cell drifts with the steering wind plus its own wander, and keeps its id through its life
{const L=A.wxCells(S,0,0,4000,30000);let good=0,tested=0;
 for(const c of L){const t2=c.born+c.life*Math.min(.95,c.age+.05),d=A.wxCell(S,c.ix,c.iz,c.k,t2);if(!d)continue;tested++;
  if(d.id===c.id&&near(d.x-c.x,(S.vx+c.jx)*(t2-4000),1e-6)&&near(d.z-c.z,(S.vz+c.jz)*(t2-4000),1e-6))good++;}
 T.ok('a cell rides the wind (and its own wander) and keeps its id',tested>0&&good===tested,good+'/'+tested);}
// the envelope: nothing before birth or after death
T.neg('a cell exists only within its life',c=>{const before=A.wxCell(S,c.ix,c.iz,c.k,c.born-1),after=A.wxCell(S,c.ix,c.iz,c.k,c.born+c.life+1);
 return !(before&&before.id===c.id)&&!(after&&after.id===c.id);},{id:c0.id,ix:c0.ix,iz:c0.iz,k:c0.k,born:c0.born+200,life:c0.life},c0);

// ---- weatherAt: deterministic, smooth, and the wet ground remembers
const at=(x,z,t)=>A.weatherAt(x,z,t,S);
T.ok('weatherAt is the same twice',JSON.stringify(at(1234,-567,8901))===JSON.stringify(at(1234,-567,8901)));
{let found=null;for(let t=0;t<40000&&!found;t+=300)for(let x=-20000;x<=20000&&!found;x+=2500){const w=at(x,0,t);if(w.rain>.5)found={x,t,w};}
 T.ok('somewhere, some time, it rains hard',!!found);
 if(found){let mx=0;for(let k=1;k<=60;k++){const a=at(found.x,0,found.t+k-1),b=at(found.x,0,found.t+k);mx=Math.max(mx,Math.abs(a.rain-b.rain));}
  T.ok('the rain at a place changes smoothly (under 0.05 a second)',mx<.05,mx);
  let after=null;for(let t=found.t;t<found.t+6000;t+=30){const w=at(found.x,0,t);if(w.rain<.05){after=w;break;}}
  T.neg('after the rain stops the ground is still wet (wet > rain)',w=>w&&w.wet>w.rain+.1,{rain:.02,wet:.02},after);}}
T.neg('the wind rises under a storm',w=>w.wind>1.5,{wind:1},(()=>{for(let t=0;t<60000;t+=200)for(let x=-30000;x<=30000;x+=3000){const w=at(x,9000,t);if(w.storm>.8)return w;}return null;})());

// ---- the coverage map agrees with the point samples, texel by texel, exactly
{const n=16,sp=48000,cx=3000,cz=-1500,t=5555,m=A.wxCoverMap(S,t,cx,cz,{n,span:sp}),cells=A.wxCells(S,cx,cz,t,sp*.7072);let bad=0,lit=0;
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const ch=A.wxSample(S,cells,cx+((i+.5)/n-.5)*sp,cz+((j+.5)/n-.5)*sp),p=(j*n+i)*4;if(m[p]>0)lit++;
  if(Math.abs(m[p]-Math.fround(ch.cover))>1e-6||Math.abs(m[p+1]-Math.fround(ch.dark))>1e-6)bad++;}
 T.ok('the coverage map equals the sample at every texel',bad===0&&lit>0,bad+' bad, '+lit+' clouded');}

// ---- strikes: by the clock, not the frame rate
{let t0=null,stormy=null;for(let t=0;t<80000&&!stormy;t+=400)for(let x=-24000;x<=24000&&!stormy;x+=4000){const w=at(x,0,t);if(w.storm>.7){stormy={x,t};}}
 T.ok('a storm is found to strike',!!stormy);
 if(stormy){t0=stormy.t-60;const big=A.wxStrikes(S,t0,t0+120,stormy.x,0,16000);
  const step=dt=>{const out=[];for(let t=t0;t<t0+120-1e-9;t+=dt)out.push(...A.wxStrikes(S,t,Math.min(t0+120,t+dt),stormy.x,0,16000));return out;};
  const key=L=>L.map(s=>s.seed+':'+s.t.toFixed(6)).join();
  T.ok('a storm strikes within two minutes',big.length>0,big.length);
  T.ok('the same strikes at 60 fps, 13 fps and in one step',key(step(1/60))===key(big)&&key(step(1/13))===key(big));
  T.ok('each strike lies in a storm',big.every(s=>at(s.x,s.z,s.t).storm>.05));
  T.neg('strikes come in time order',L=>L.every((s,i)=>!i||L[i-1].t<=s.t),big.slice().reverse().concat(big.length<2?[{t:-1},{t:-2}]:[]),big);}}

// ---- shafts: the nearest precipitating cells, never a fog or dust cell
{const L=A.wxShafts(S,0,0,9000);T.ok('the shafts are precipitating cells, at most the preset count',L.length<=S.P.shafts.max&&L.every(s=>['rain','storm','snow','ash'].includes(s.kind)),JSON.stringify(L.map(s=>s.kind)));}

// ---- the weather step takes the live sample as it is, and eases away from it
{const W=A.weatherState('live');W.live=at(1000,1000,7000);A.weatherStep(W,14,1/60);
 T.ok('live: W is the sample',W.rain===W.live.rain&&W.wet===W.live.wet&&W.wind===W.live.wind);
 W.mode='clear';W.rain=1;A.weatherStep(W,14,1/60);T.ok('switching to clear eases from it',W.rain<1&&W.rain>.9);}

// ---- the golden vectors (the Godot twin's)
const golden={note:'core/atmos/wx/test-cells.js: the weather cells, for godot/tests/atmos/cells_test.gd',preset:A.PRESETS.wxcells,
 systems:[{seed:20261123,climate:{},axes:{warmth:.6,aridity:.3},wind:[.8,.35]},{seed:7,climate:{dry:true},axes:{warmth:.9,aridity:.9},wind:[-.5,.6]},{seed:99,climate:{cold:true,ash:true},axes:{warmth:.2,aridity:.5},wind:[0,1]}].map(o=>{
  const Y=A.wxSystem(o);const pts=[];for(let i=0;i<24;i++){const x=(i*7919%40000)-20000,z=(i*104729%36000)-18000,t=i*1777.5;pts.push({x,z,t,w:A.weatherAt(x,z,t,Y)});}
  const cells=[];for(let k=0;k<6;k++)for(const t of [0,2500,9000,33333])cells.push({ix:k-2,iz:1-k,k,t,c:A.wxCell(Y,k-2,1-k,k,t)});
  const map=A.wxCoverMap(Y,4321,500,-700,{n:16,span:48000});
  return{input:o,weights:Y.weights,cum:Y.cum,vx:Y.vx,vz:Y.vz,reach:Y.reach,virga:Y.virga,points:pts,cells,
   strikes:A.wxStrikes(Y,0,3000,0,0,20000),shafts:A.wxShafts(Y,0,0,3000),map16:Array.from(map).map(v=>Math.round(v*1e6)/1e6)};})};
const GP=path.join(__dirname,'golden-cells.json'),text=JSON.stringify(golden);
if(process.argv.includes('--write')){fs.writeFileSync(GP,text+'\n');console.log('wrote '+GP);}
const have=fs.existsSync(GP)?fs.readFileSync(GP,'utf8').trim():'';
T.ok('the golden vectors are current (node core/atmos/wx/test-cells.js --write after a change meant to move them)',have===text,
 crypto.createHash('sha256').update(text).digest('hex').slice(0,12)+' vs '+crypto.createHash('sha256').update(have).digest('hex').slice(0,12));
T.done();
