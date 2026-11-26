// node core/biome/test-fire.js [--write] — KFIRE (38-core-fire.js), each check with a negative.
// The first checks load crater-drylands' original fire fragment (frozen: core/biome/ref/craterdry-fire-52.js.txt, the kit's
// src/52 as it was before it moved onto KFIRE, 2026-11-09) on the biome core and prove KFIRE gives the kit's grids bit for bit from the
// same ground, burnability and fires: crater-drylands' output must match KFIRE's (README.md, "Fire"). Then the kit's src/52 as it is now
// (an adapter onto KFIRE, with the kit's own inputs) is loaded on its own and proved to give the frozen fragment's grids and live fire. Then the model's own rules, and golden-fire.json (the Godot twin's vectors,
// kfire_test.gd): --write rewrites it, a plain run checks it is current.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const D=__dirname,REPO=path.join(D,'..','..'),read=f=>fs.readFileSync(path.join(REPO,f),'utf8');
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const ctx={console,Math,Float32Array,Int16Array,Int32Array,Uint8Array,Object,Array,Infinity};vm.createContext(ctx);
vm.runInContext(read('core/rand/08-core-rand.js'),ctx);
vm.runInContext(read('core/biome/10-core-head.js'),ctx);
vm.runInContext('var CRATERDRY={};',ctx);
vm.runInContext(read('core/biome/ref/craterdry-fire-52.js.txt'),ctx);   /* the frozen reference: never edited */
vm.runInContext(read('core/biome/38-core-fire.js'),ctx);
const {BIO,KFIRE,KRAND,CRATERDRY}=ctx,{fbm,smooth}=BIO.fn;
ok('before any history, ageAt is NEVER and frontAt -1',KFIRE.ageAt(0,0)===KFIRE.NEVER&&KFIRE.frontAt(0,0)===-1,KFIRE.current!==null);
// a test ground on the biome core's host: hills, granite kopjes, washes, a wet seep and a pond
const host={terrainH:(x,z)=>30*fbm(x*.004,z*.004,11,3)+6*Math.sin(x*.01)*Math.cos(z*.013),waterH:(x,z)=>Math.hypot(x+300,z-200)<60?host.terrainH(x,z)+1:-1e9,
  fields:{rock:(x,z)=>smooth(.62,.75,fbm(x*.006+1,z*.006,17,2)),flow:(x,z)=>smooth(.08,0,Math.abs(Math.sin(x*.003+z*.002))),wet:(x,z)=>smooth(150,40,Math.hypot(x-250,z+150))}};
BIO.host=host;
const W=[-.56,-.83],HOSTF=[{ago:.3,x:-150,z:120,frac:.07},{ago:2.2,x:300,z:-100,frac:.09,veer:.2},{ago:4.8,x:-60,z:-420,frac:.08}];
const kit=CRATERDRY.fireHistory({R:1000,cell:20,wind:W,fires:HOSTF.map(f=>Object.assign({},f)),old:6,seed:777});
// KFIRE from the same inputs: the kit's burnability (its formula on its fields, its BIO fbm patch), its terrain, its fires
// (as the kit lit them: the six old ones are its own draws), and its edge warp
const kitPatch=(x,z)=>.5+.9*smooth(.28,.72,fbm(x*.0042+7,z*.0042-3,521,2));
const kitWarp=cs=>(x,z)=>[x+cs*1.1*(fbm(x*.021+3,z*.021,532,2)-.5),z+cs*1.1*(fbm(x*.021,z*.021-5,533,2)-.5)];
const opts=(o)=>Object.assign({R:1000,cell:20,wind:W,height:BIO.terrainH,burn:KFIRE.burnFromFields(BIO.field,BIO.depth,kitPatch),
  fires:kit.fires.map(f=>({ago:f.ago,x:f.x,z:f.z,frac:f.frac,veer:f.veer})),old:0,warp:kitWarp(20)},o||{});
const kf=KFIRE.history(opts());
const same=(a,b)=>a.length===b.length&&Buffer.compare(Buffer.from(a.buffer,a.byteOffset,a.byteLength),Buffer.from(b.buffer,b.byteOffset,b.byteLength))===0;
ok('the kit made a real mosaic (every stage present, '+kit.fires.length+' fires)',Object.values(kit.shares()).every(v=>v>0),kit.fires.length<9);
ok('the burnability grid is the kit\'s, bit for bit',same(kf.base,kit.base)&&same(kf.H,kit.H),false);
ok('every cell\'s age (last) and fire (id) are the kit\'s',same(kf.last,kit.last)&&same(kf.id,kit.id),false);
ok('the newest fire\'s front is the kit\'s',same(kf.front,kit.front),false);
let lk=0;for(let i=0;i<4000;i++){const x=(i*37.3%2000)-1000,z=(i*91.7%2000)-1000;if(kf.ageAt(x,z)!==kit.ageAt(x,z)||kf.frontAt(x,z)!==kit.frontAt(x,z)||kf.fireAt(x,z).fire!==kit.fireAt(x,z).fire)lk++;}
ok('ageAt, fireAt and frontAt answer as the kit\'s at 4000 points',lk===0,false);
ok('the shares are the kit\'s',JSON.stringify(kf.shares())===JSON.stringify(kit.shares()),false);
// negatives: the comparison sees a change
const kfW=KFIRE.history(opts({wind:[.56,.83]}));
ok('a reversed wind is seen by the comparison',true,same(kfW.last,kit.last));
const kfF=KFIRE.history(opts({fires:opts().fires.map((f,i)=>i===2?Object.assign({},f,{frac:f.frac*1.3}):f)}));
ok('one fire 30% larger is seen by the comparison',true,same(kfF.id,kit.id));
// the live fire: KFIRE.run on the history is CRATERDRY.fireRun on the kit's
const kitRun=CRATERDRY.fireRun({x:200,z:300,maxT:900}),kRun=KFIRE.run(kf,{x:200,z:300,maxT:900});
ok('a live fire arrives where and when the kit\'s does ('+kRun.order.length+' cells)',kitRun.ok&&kRun.ok&&same(kRun.arrive,kitRun.arrive)&&kRun.order.join()===kitRun.order.join(),false);
const kRun2=KFIRE.run(kf,{x:-400,z:300,maxT:900});ok('a fire lit elsewhere is seen by the comparison',true,kRun2.ok&&same(kRun2.arrive,kitRun.arrive));
const rockAt=(()=>{for(let i=0;i<kf.N*kf.N;i++)if(kf.base[i]===0&&Math.hypot(kf.x0+(i%kf.N)*20,kf.z0+Math.floor(i/kf.N)*20)<900){
  let all=true;for(let dj=-2;dj<=2;dj++)for(let di=-2;di<=2;di++){const k=i+dj*kf.N+di;if(kf.base[k]*KFIRE.fuelK(kf.last[k])>.2)all=false;}if(all)return[kf.x0+(i%kf.N)*20,kf.z0+Math.floor(i/kf.N)*20];}return null;})();
ok('a fire lit on rock or water does not take, as the kit\'s does not',rockAt&&!KFIRE.run(kf,{x:rockAt[0],z:rockAt[1]}).ok&&!CRATERDRY.fireRun({x:rockAt[0],z:rockAt[1]}).ok,!kRun.ok);
ok('the live fire\'s ignition burns at once and the far side is unburnt then',kRun.state(kRun.x,kRun.z,1)==='burning'&&kRun.state(kRun.x,kRun.z,1e5)==='burnt'&&kRun.state(-900,-900,1)==='unburnt',kRun.state(kRun.x,kRun.z,1)==='unburnt');
const [r0,r1]=kRun.range(0,300);ok('range(0,300) is the cells caught in the first five minutes',kRun.order.slice(r0,r1).every(c=>kRun.arrive[c]<300)&&(r1>=kRun.order.length||kRun.arrive[kRun.order[r1]]>=300),r1===0);
// THE KIT ON KFIRE (crater-drylands' src/52 as it is now: an adapter onto KFIRE with the kit's own burnability, warp and old fires), in a context
// of its own on the same ground: the frozen fragment's grids, lookups and live fire, bit for bit. The kit's pages keep their fires by this
{const c2={console,Math,Float32Array,Int16Array,Int32Array,Uint8Array,Object,Array,Infinity};vm.createContext(c2);
 vm.runInContext(read('core/rand/08-core-rand.js'),c2);vm.runInContext(read('core/biome/10-core-head.js'),c2);vm.runInContext(read('core/biome/38-core-fire.js'),c2);
 vm.runInContext('var CRATERDRY={};',c2);vm.runInContext(read('biomes/crater-drylands/src/52-biome-craterdry-fire.js'),c2);
 c2.BIO.host=host;const K2=c2.CRATERDRY,ad=K2.fireHistory({R:1000,cell:20,wind:W,fires:HOSTF.map(f=>Object.assign({},f)),old:6,seed:777});
 ok('the kit on KFIRE: every grid is the frozen fragment\'s ('+ad.fires.length+' fires)',same(ad.base,kit.base)&&same(ad.H,kit.H)&&same(ad.last,kit.last)&&same(ad.id,kit.id)&&same(ad.front,kit.front),false);
 let lk2=0;for(let i=0;i<4000;i++){const x=(i*37.3%2000)-1000,z=(i*91.7%2000)-1000;if(K2.ageAt(x,z)!==kit.ageAt(x,z)||K2.frontAt(x,z)!==kit.frontAt(x,z)||K2.fireAt(x,z).fire!==kit.fireAt(x,z).fire)lk2++;}
 ok('the kit on KFIRE: its lookups answer as the frozen fragment\'s at 4000 points, and its shares',lk2===0&&JSON.stringify(ad.shares())===JSON.stringify(kit.shares()),false);
 const aRun=K2.fireRun({x:200,z:300,maxT:900});
 ok('the kit on KFIRE: a live fire arrives where and when the frozen fragment\'s does',aRun.ok&&same(aRun.arrive,kitRun.arrive)&&aRun.order.join()===kitRun.order.join(),false);
 const adS=K2.fireHistory({R:1000,cell:20,wind:W,fires:HOSTF.map(f=>Object.assign({},f)),old:6,seed:778});
 ok('the kit on KFIRE: another seed lights other old fires, and the comparison sees it',true,same(adS.last,kit.last));}

// the model's own rules, on a flat even field (no kit)
const flat=o=>KFIRE.history(Object.assign({R:600,cell:20,height:()=>0,burn:()=>1,old:0,warp:null},o));
ok('old:0 lights no old fires (0 is a value, not a default)',flat({}).fires.length===0,flat({old:undefined}).fires.length!==8);
const one=flat({wind:[1,0],fires:[{ago:3,x:0,z:0,frac:.1}]});
const reach=(h,dx)=>{let m=0;for(let i=0;i<h.N*h.N;i++)if(h.id[i]===0)m=Math.max(m,dx*(h.x0+(i%h.N)*h.cs));return m;};
ok('a fire runs downwind (east '+reach(one,1)+' m) further than upwind (west '+reach(one,-1)+' m)',reach(one,1)>2*reach(one,-1),false);
const oneW=flat({wind:[-1,0],fires:[{ago:3,x:0,z:0,frac:.1}]});ok('the reversed wind runs it west',true,reach(oneW,1)>reach(oneW,-1));
// a fresh burn stops the next fire: a fire 0.1 years ago next to one 0.3 years ago cannot enter it; next to one 5 years ago it can
const pair=a=>flat({wind:[1,0],fires:[{ago:a,x:-150,z:0,frac:.12},{ago:.1,x:-250,z:0,frac:.25}]});
const fresh=pair(.3),old=pair(5);const ofFresh=fresh.fires.find(f=>f.ago===.3).cells,ofOld=old.fires.find(f=>f.ago===5);
let leftOld=0;for(let i=0;i<old.id.length;i++)if(old.last[i]===Math.fround(5))leftOld++;
let leftFresh=0;for(let i=0;i<fresh.id.length;i++)if(fresh.last[i]===Math.fround(.3))leftFresh++;
ok('a fire does not burn into ground burnt three months before it ('+leftFresh+' of '+ofFresh+' cells kept)',leftFresh===ofFresh,false);
ok('it does burn through ground five years old ('+leftOld+' of '+ofOld.cells+' cells kept)',true,leftOld===ofOld.cells);
ok('nothing burns where the burnability is 0',(()=>{const h=flat({burn:(x,z)=>x>0?0:1,fires:[{ago:2,x:-100,z:0,frac:.3}],wind:[1,0]});for(let i=0;i<h.id.length;i++)if(h.id[i]>=0&&h.x0+(i%h.N)*h.cs>0)return false;return true;})(),
  (()=>{const h=flat({burn:()=>1,fires:[{ago:2,x:-100,z:0,frac:.3}],wind:[1,0]});for(let i=0;i<h.id.length;i++)if(h.id[i]>=0&&h.x0+(i%h.N)*h.cs>0)return false;return true;})());
ok('a fire asked where nothing will burn fails and is kept',flat({burn:()=>0,fires:[{ago:2,x:0,z:0,frac:.1}]}).fires[0].failed===true,flat({fires:[{ago:2,x:0,z:0,frac:.1}]}).fires[0].failed);
// the old fires: lit by KRAND.hash of (seed, fire, try, salt), not by a draw order
const A=flat({old:8,seed:5}),B=flat({old:8,seed:5}),C=flat({old:8,seed:6});
BIO.fn.reseed(123);const A2=flat({old:8,seed:5});
ok('old fires: the same seed lights the same fires, whatever the PRNG state',same(A.last,B.last)&&same(A.last,A2.last)&&A.fires.length===8,false);
ok('a new seed lights others',true,same(A.last,C.last));
const ign=h=>h.fires.map(f=>f.ix+','+f.iz).sort().join(' ');
const A6=flat({old:6,seed:5,burn:()=>1});const firstSix=o=>{const p=[];for(let k=0;k<o;k++){const U=(a,b,c)=>KRAND.unit(KRAND.hash(5,a,b,c));const a=Math.PI*2*U(k,0,1),d=600*.88*Math.sqrt(U(k,0,2));p.push([Math.cos(a)*d,Math.sin(a)*d]);}return p;};
ok('fire k is asked at the same point whatever the count of old fires',JSON.stringify(firstSix(6))===JSON.stringify(firstSix(8).slice(0,6))&&A6.fires.length===6,ign(A6)===ign(A));
ok('stages: fresh char, then bloom, regrowth, mature',KFIRE.stages(.1).char>.9&&KFIRE.stages(1.5).bloom>.9&&KFIRE.stages(4).regrow>.9&&KFIRE.stages(20).mature>.9,KFIRE.stages(20).char>0);
ok('fuel: none in the first year, full by six',KFIRE.fuelK(.5)===0&&KFIRE.fuelK(6)===1&&KFIRE.fuelK(30)>1,KFIRE.fuelK(3)===0);
ok('KFIRE.current is the newest history',KFIRE.current===A6&&KFIRE.ageAt(0,0)===A6.ageAt(0,0),KFIRE.current===C);

// the golden vectors for the Godot twin (kfire.gd): ground, burnability and warp all on KRAND, so GDScript can make them
const G={R:600,cell:20,seed:4242,wind:[-.56,-.83],old:5,fires:[{ago:.4,x:-120,z:90,frac:.08},{ago:1.5,x:200,z:-60,frac:.1,veer:.25}],
  hseed:31,rseed:41};
const gH=(x,z)=>40*KRAND.fbm(x*.003,z*.003,0,3,G.hseed),gRock=(x,z)=>smooth(.6,.72,KRAND.fbm(x*.005+2,z*.005,0,2,G.rseed));
const gold=KFIRE.history({R:G.R,cell:G.cell,seed:G.seed,wind:G.wind,old:G.old,fires:G.fires.map(f=>Object.assign({},f)),height:gH,
  burn:(x,z)=>KFIRE.burnK(gRock(x,z),0,smooth(200,40,Math.hypot(x-150,z+200)),gH(x,z)<4,KFIRE.patch(521)(x,z))});
const RP=[[-200,-150],[250,250],[-300,300],[0,-400],[400,0]].find(p=>KFIRE.run(gold,{x:p[0],z:p[1],maxT:60}).ok);
const gRun=KFIRE.run(gold,{x:RP[0],z:RP[1],maxT:1200});
const sha=a=>crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
const pts=[];for(let i=0;i<64;i++){const x=Math.round(((i*131.7)%1200-600)*10)/10,z=Math.round(((i*71.3)%1200-600)*10)/10;pts.push([x,z,gold.ageAt(x,z),gold.fireAt(x,z).fire,gold.frontAt(x,z),gRun.at(x,z)]);}
const golden={version:1,note:'core/biome/test-fire.js --write; the recipe is in that file and in kfire_test.gd',case:G,N:gold.N,inside:gold.inside,
  fires:gold.fires.map(f=>({ago:f.ago,frac:f.frac,veer:f.veer,ix:f.ix==null?-1:f.ix,iz:f.iz==null?-1:f.iz,cells:f.cells,failed:!!f.failed})),
  sha:{H:sha(gold.H),base:sha(gold.base),last:sha(gold.last),id:sha(gold.id),front:sha(gold.front),arrive:sha(gRun.arrive),order:sha(new Int32Array(gRun.order))},
  last:Array.from(gold.last),id:Array.from(gold.id),run:{x:RP[0],z:RP[1],maxT:1200,ok:gRun.ok,n:gRun.order.length,order:gRun.order},points:pts,shares:gold.shares()};
const GF=path.join(D,'golden-fire.json'),txt=JSON.stringify(golden)+'\n';
ok('the golden case is a mosaic (every stage present)',Object.values(gold.shares()).every(v=>v>0),false);
if(process.argv.includes('--write')){fs.writeFileSync(GF,txt);console.log('wrote '+path.relative(REPO,GF).replace(/\\/g,'/'));}
else ok('golden-fire.json is current (else: node core/biome/test-fire.js --write)',fs.existsSync(GF)&&fs.readFileSync(GF,'utf8')===txt,false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
