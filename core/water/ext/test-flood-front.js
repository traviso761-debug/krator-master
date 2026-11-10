// node core/water/ext/test-flood-front.js - the gorge flood's one law, held across its two modules: core/water's WATER.flood
// (ext/62-core-water-flood.js: the water that rises) and core/hazard's KHAZ.front (22-core-hazard-env.js: the drowning),
// both written from the same law. The flood's own hazard record (S.hazardRecord) is read by KHAZ, and its level, wetness and
// front must agree with the water's at every point and time; each check has a negative (a record whose law was changed).
'use strict';
require('../../shader/06-core-khook.js');require('../../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..','..');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
global.window=global;
eval(['core/rand/08-core-rand.js','core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js',
 'core/water/21-core-water-shore.js','core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js',
 'core/water/ext/62-core-water-flood.js'].map(rd).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
require(path.join(ROOT,'core/tags/50-core-tags.js'));require(path.join(ROOT,'core/tags/52-core-tags-vocab.js'));
eval(rd('core/biome/37-core-traps.js'));
eval(rd('core/hazard/20-core-hazard.js'));eval(rd('core/hazard/21-core-hazard-flow.js'));eval(rd('core/hazard/22-core-hazard-env.js'));
const W=globalThis.WATER,H=globalThis.KHAZ;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};

const FLOODS=[
 {key:'gorge',path:[[0,10,0],[100,8,0],[200,6,40],[260,5.5,40]],w:9,speed:3,start:20,period:600,rise:25,hold:40,fall:90,depth:4.5,base:0,world:7},
 {key:'once',path:[[-50,30,-20],[10,24,35],[80,20,30]],w:6,speed:1.5,start:5,period:null,rise:0,hold:60,fall:30,depth:2,base:.4,world:3},
 {key:'wadi',path:[[0,0,0],[40,-2,0],[40,-4,60],[0,-6,60]],w:4,speed:4,start:-100,period:300,rise:12,hold:0,fall:50,depth:3,base:0,world:11}];
/* the same records across both modules: level, k and the water's presence, at the channel's points over two periods */
function compare(S,rec,pts){let n=0,wet=0,worst=0,kw=0,off=0;
  for(let t=-40;t<1300;t+=6.7)for(const [x,z] of pts){const lw=S.level(x,z,t),lh=H.floodLevel(rec,x,z,t);
    if(lw===null||lh===null){if(lw!==lh)off++;continue;}worst=Math.max(worst,Math.abs(lw-lh));n++;
    const fa=H.frontAt(rec,x,z,t),p=S.project(x,z);kw=Math.max(kw,Math.abs(p.s-fa.s),fa.inside?Math.abs(S.kAt(p.s,t)-fa.k):0);if(fa.k>0)wet++;}
  return {n,wet,worst,kw,off};}
function ptsOf(F){const out=[];for(let i=0;i+1<F.path.length;i++){const a=F.path[i],b=F.path[i+1];for(let u=0;u<=1;u+=.125){const x=a[0]+(b[0]-a[0])*u,z=a[2]+(b[2]-a[2])*u;
  out.push([x,z],[x+F.w*.6,z-F.w*.3],[x-F.w*1.4,z],[x,z+F.w*.95]);}}out.push([F.path[0][0]-F.w*.5,F.path[0][2]],[F.path[F.path.length-1][0]+F.w*.8,F.path[F.path.length-1][2]]);return out;}

/* the k check's negative: the water's fk read a second later than the hazard's must differ somewhere */
function cb0(S,o,pts){let m=0;const rec=S.hazardRecord();for(let t=-40;t<1300;t+=6.7)for(const [x,z] of pts){const fa=H.frontAt(rec,x,z,t);if(fa.inside)m=Math.max(m,Math.abs(S.kAt(S.project(x,z).s,t+1)-fa.k));}return m;}
FLOODS.forEach(o=>{const S=W.flood(o),rec=S.hazardRecord(),pts=ptsOf(o);
  ok(o.key+': the flood\'s hazard record is a KHAZ.front over the water\'s own front fields',rec.tags.hazard.stateFn==='KHAZ.front'&&H.of(rec)&&['w','speed','start','period','rise','hold','fall','depth','base'].every(k=>rec.tags.hazard.front[k]===S.front[k]));
  const c=compare(S,rec,pts);
  ok(o.key+': KHAZ.floodLevel equals the water\'s level ('+c.n+' samples, '+c.wet+' flooded, worst '+c.worst.toExponential(1)+'), and both are null off the channel together',c.worst<1e-9&&c.off===0&&c.n>200&&c.wet>20);
  ok(o.key+': both measure the same arc length s, and the hazard\'s k equals the water\'s fk there (worst '+c.kw.toExponential(1)+')',c.kw<1e-9,!(cb0(S,o,pts)>.05));
  /* the negative: a hazard record whose law was changed (a slower front, a later start) must disagree with the water */
  const bent=JSON.parse(JSON.stringify(rec));bent.id=rec.id+':bent';bent.tags.hazard.front.speed=o.speed*.8;bent.tags.hazard.front.start=o.start+7;
  const cb=compare(S,bent,pts);
  ok(o.key+': a hazard record with a changed law disagrees with the water (worst '+cb.worst.toFixed(2)+' m)',c.worst<1e-9,!(cb.worst>.05));
  /* a walker: under the surface the drowning applies, a metre above it nothing */
  let tPeak=null;for(let t=o.start;t<o.start+2000&&tPeak===null;t+=.5){if(H.frontAt(rec,o.path[0][0],o.path[0][2],t).k===1)tPeak=t;}
  if(tPeak!==null){const x=o.path[0][0],z=o.path[0][2],lv=S.level(x,z,tPeak);
    const below=H.dose(rec,x,z,tPeak,lv-.6),above=H.dose(rec,x,z,tPeak,lv+1);
    ok(o.key+': at the peak a walker in the water drowns and one a metre above the water\'s surface takes nothing',below>0&&above===0,!(below>0)||above!==0);}
});

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
