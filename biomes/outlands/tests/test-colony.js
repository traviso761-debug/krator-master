// node biomes/outlands/tests/test-colony.js : the colony pass (src/48-outl-colony.js), PLAN.md section 4.
// Same seeds give the same colonies and owners; a window finds the colonies a wider box finds there; every owner reaches and is
// allowed at its point; the owner is the least power distance (checked by a scan without the index); seams are symmetric and lie
// on borders between two colonies; no point has two owners; types are picked only where their core is.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const ctx={console,Math};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','core/space/20-core-space.js','biomes/outlands/src/48-outl-colony.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
const {OUTLCOL,KRAND}=ctx;
let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);};
// a slope: the veil's core high (z < -800), its reach to z 400; the mast's core between; the copper's low (z > 600); a wadi strip at |x-300| < 20
const allow=(t,x,z)=>{const wadi=Math.abs(x-300+40*Math.sin(z/300))<20;
  if(t==='wadi')return wadi?2:Math.abs(x-300)<45?1:0;
  if(wadi)return 0;
  if(t==='veil')return z<-800?2:z<400?1:0;
  if(t==='mast')return z>-1100&&z<900?2:0;
  if(t==='copper')return z>600?2:0;return 0;};
const types=[{key:'veil',reach:[60,560]},{key:'mast',reach:[50,420]},{key:'copper',reach:[40,380]},{key:'wadi',reach:[40,260],share:3}];
const box=[-2500,-2500,2500,2500],O={seed:4711,box,types,allow};
const A=OUTLCOL.create(O),B=OUTLCOL.create(O);
ok(A.colonies.length>20,'colonies drawn: '+A.colonies.length);
ok(JSON.stringify(A.records())===JSON.stringify(B.records()),'the same seed gives the same colonies');
// every type's colonies stand on that type's core
ok(A.colonies.every(C=>allow(C.type,C.x,C.z)===2),'every colony is seeded on its type\'s core');
ok(['veil','mast','copper','wadi'].every(t=>A.colonies.some(C=>C.type===t)),'all four types drawn');
// a window: the colonies a narrower box draws, in the region both cover, are the wider box's
{const W=OUTLCOL.create(Object.assign({},O,{box:[-500,-500,500,500]})),key=C=>C.id+':'+C.type+':'+C.x.toFixed(3)+':'+C.R.toFixed(3);
 const inA=new Set(A.colonies.filter(C=>Math.abs(C.x)<1200&&Math.abs(C.z)<1200).map(key));
 const inW=W.colonies.filter(C=>Math.abs(C.x)<1200&&Math.abs(C.z)<1200).map(key);
 ok(inW.length>0&&inW.every(k=>inA.has(k)),'a window finds the same colonies ('+inW.length+')');
 let same=true;const a={},w={};for(let k=0;k<400;k++){const x=(KRAND.unit(KRAND.hash(9,k,1))-.5)*900,z=(KRAND.unit(KRAND.hash(9,k,2))-.5)*900;
  A.at(x,z,a);W.at(x,z,w);if((a.c&&a.c.id)!==(w.c&&w.c.id))same=false;}
 ok(same,'a window gives the same owner at 400 points');}
// owners against a scan; seams
{let bad=0,seams=0,seamBad=0,unclaimed=0,dets=0;const r={},r2={};
 for(let k=0;k<6000;k++){const x=(KRAND.unit(KRAND.hash(17,k,1))-.5)*4800,z=(KRAND.unit(KRAND.hash(17,k,2))-.5)*4800;
  A.at(x,z,r);B.at(x,z,r2);if((r.c&&r.c.id)!==(r2.c&&r2.c.id)||r.seam!==r2.seam)dets++;
  if(!r.c){unclaimed++;continue;}
  if(!allow(r.c.type,x,z)||!(r.d<r.c.R))bad++;
  if(r.seam){seams++;if(!r.c2||!(r.gap<A.seamWidth(r.c,r.c2)/2))seamBad++;}}
 ok(!dets,'the same point gives the same owner and seam on two builds');
 ok(!bad,'every owner reaches its point and is allowed there ('+(6000-unclaimed)+' claimed, '+unclaimed+' unclaimed)');
 ok(seams>0&&!seamBad,'seams lie between two colonies, inside half the pair\'s width ('+seams+' seam points)');}
// the power rule, with no warp (so the scan sees the same point): the owner is the least d^2 - R^2 of the colonies reaching and allowed
{const N=OUTLCOL.create(Object.assign({},O,{warp:0})),r={};let bad=0;
 for(let k=0;k<3000;k++){const x=(KRAND.unit(KRAND.hash(23,k,1))-.5)*4800,z=(KRAND.unit(KRAND.hash(23,k,2))-.5)*4800;N.at(x,z,r);
  let best=null,bp=Infinity;for(const C of N.colonies){const dd=(x-C.x)**2+(z-C.z)**2;if(dd>=C.R*C.R||!allow(C.type,x,z))continue;const p=dd-C.R*C.R;if(p<bp){bp=p;best=C;}}
  if((best&&best.id)!==(r.c&&r.c.id))bad++;}
 ok(!bad,'the owner is the least power distance (a scan of every colony agrees at 3000 points)');}
// the seam width is symmetric and in range
{let bad=0;for(let k=0;k+1<A.colonies.length;k++){const a=A.colonies[k],b=A.colonies[k+1],w1=A.seamWidth(a,b),w2=A.seamWidth(b,a);if(w1!==w2||w1<2||w1>8)bad++;}
 ok(!bad,'seam widths symmetric, 2-8 m');}
// an old colony reaches farther than a young one of its type
{const v=A.colonies.filter(C=>C.type==='veil').sort((a,b)=>a.age-b.age);ok(v.length>1&&v[0].R<v[v.length-1].R,'age as size: the youngest veil colony '+v[0].R.toFixed(0)+' m, the oldest '+v[v.length-1].R.toFixed(0)+' m');}
// explicit seeds: kept on their type's core, dropped off it, the same on two builds
{const seeds=[{id:'a',x:300-40*Math.sin(5),z:1500,type:'wadi'},{id:'b',x:-1500,z:1500,type:'wadi'}],S1=OUTLCOL.create(Object.assign({},O,{seeds})),S2=OUTLCOL.create(Object.assign({},O,{seeds}));
 const k=S1.colonies.filter(c=>c.id[0]==='s');ok(k.length===1&&k[0].id==='sa'&&JSON.stringify(S1.records())===JSON.stringify(S2.records()),'an explicit seed is kept on its core (sa), dropped off it (sb), the same twice');}
// negative: an allow() that never allows makes no colony and claims nothing
{const E=OUTLCOL.create(Object.assign({},O,{allow:()=>0}));ok(E.colonies.length===0&&!E.at(0,0).c,'negative: nothing allowed, no colony');}
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
