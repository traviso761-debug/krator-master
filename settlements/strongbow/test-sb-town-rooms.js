// node settlements/strongbow/test-sb-town-rooms.js — the town's buildings walked into (about 2 minutes): Strongbow's town
// (src/40-sb-town.js) with the scrap Xanadu set's interiors (kits/interiors/sets/xanadu-scrap.js) planned in place on core/walk
// by SB_ROOMS.town (src/33-sb-rooms.js): turned, raised onto the ground the page stands them on, a stoop down from every street
// door that stands over the street. A walker with core/host's step (0.7 m) on a 0.2 m grid comes to each building's doors from
// the street and must reach every floor of it (bar the slivers narrower than a walker, the ladders' rungs and the tank's roof room,
// which the set leaves to the host's climb). The negatives: a stoop taken away leaves a building on a slope shut; the doorways
// blocked, no room is reached. Needs kits/interiors/dist/interiors-core.js (git lfs pull --include="kits/interiors/dist/*").
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const TT=require('./test-sb-town.js');
for(const f of ['core/walk/20-core-walk.js','kits/ancients-interiors/src/10-ai-core.js','kits/ancients-interiors/src/35-ai-plates.js','settlements/strongbow/src/32-sb-walk.js','settlements/strongbow/src/33-sb-rooms.js'])
 vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
const core=path.join(ROOT,'kits','interiors','dist','interiors-core.js');
if(/^version https:\/\/git-lfs/.test(fs.readFileSync(core,'utf8').slice(0,40))){console.log('FAIL kits/interiors/dist/interiors-core.js is a Git LFS pointer: git lfs pull --include="kits/interiors/dist/*"');process.exit(1);}
const IX=global.KratorInteriors=require(core);(0,eval)(fs.readFileSync(path.join(ROOT,'kits','interiors','sets','xanadu-scrap.js'),'utf8'));
const P=STRONGBOW.plan({seed:1647}),ground=(x,z)=>P.frame.ground(x,z),town=TT.T;
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
/* the known misses: a building turned near 45 degrees whose 0.9 m stair, its walls core/walk's axis-aligned blocks, narrows below a
   walker (the set's STEEP stair; the kit's geometry is whole): the walk is core/walk's approximation, not the building */
const KNOWN=2;
const W=KWALK.create(),RT=SB_ROOMS.town(W,town,IX,ground);
for(const b of SB_ROOMS.solids(town,RT.ids))W.block(b.box,'sb.town.solid');
ok(RT.placed.length+RT.skipped===town.lots.length&&RT.placed.length>=town.lots.length*.95,'the town\'s '+town.lots.length+' buildings: '+RT.placed.length+' with their interiors, '+RT.skipped+' without (an open or skipped def: solid)');
const wide=F=>{const Q=F.pts;let a=0,L=0;for(let i=0;i<Q.length;i++){const p=Q[i],q=Q[(i+1)%Q.length];a+=p[0]*q[1]-q[0]*p[1];L=Math.max(L,Math.hypot(q[0]-p[0],q[1]-p[1]));}return Math.abs(a/2)/(L||1)>=.5;};
const roomsOf=P2=>W.floors.filter(F=>F.kind==='poly'&&(F.name||'').startsWith(P2.id+'.')&&!/\.entry$|\.stair\./.test(F.name)&&!/\.top($|\.)/.test(F.name)&&wide(F));
/* a building's own window: the records within 3 m of its rooms and stoops, in a small core/walk (the whole town's are 236k blocks) */
function walkIn(P2,o){o=o||{};const fl=roomsOf(P2),st=o.steps||P2.steps,b=[1e9,-1e9,1e9,-1e9];
 for(const F of fl)for(const p of F.pts){b[0]=Math.min(b[0],p[0]);b[1]=Math.max(b[1],p[0]);b[2]=Math.min(b[2],p[1]);b[3]=Math.max(b[3],p[1]);}
 for(const q of st){b[0]=Math.min(b[0],q[0]);b[1]=Math.max(b[1],q[0]);b[2]=Math.min(b[2],q[2]);b[3]=Math.max(b[3],q[2]);}
 const box=[b[0]-3,b[1]+3,b[2]-3,b[3]+3],inB=q=>q[1]>=box[0]&&q[0]<=box[1]&&q[3]>=box[2]&&q[2]<=box[3],K=KWALK.create(),M=new Map();
 for(const F of W.floors){if(o.skip&&o.skip(F))continue;const bb=F.kind==='rect'?F.rect:F.kind==='poly'?F.bbox:[Math.min(F.a[0],F.b[0])-F.w,Math.max(F.a[0],F.b[0])+F.w,Math.min(F.a[1],F.b[1])-F.w,Math.max(F.a[1],F.b[1])+F.w];if(!inB(bb))continue;
  M.set(F.kind==='rect'?K.floor({rect:F.rect,y:F.y,name:F.name}):F.kind==='poly'?K.poly({pts:F.pts,name:F.name}):K.strip({a:F.a,b:F.b,w:F.w,name:F.name}),F);}
 for(const B of W.blocks)if(inB(B.box))K.block(B.box);for(const B of (o.extra||[]))K.block(B);
 const got=new Set(K.reach(st,{cell:.2,step:.7,box,ground}).reached.map(r=>M.get(r)));return {fl,miss:fl.filter(F=>!got.has(F))};}
let n=0,floors=0;const bad=[];const t0=Date.now();
for(const P2 of RT.placed){if(!P2.steps.length)continue;n++;const r=walkIn(P2);floors+=r.fl.length;if(r.miss.length)bad.push(P2.id+' '+P2.item+' (ry '+(P2.inst.ry*180/Math.PI).toFixed(0)+'): '+r.miss.length+'/'+r.fl.length);}
ok(bad.length<=KNOWN,'every floor of '+(n-bad.length)+' of '+n+' buildings reached from the street ('+floors+' floors, '+((Date.now()-t0)/1000).toFixed(0)+' s)'+(bad.length?'; short: '+bad.join('; '):''));
/* a stoop: some building stands over its street; without the stoop its door is out of reach */
{const S2=RT.placed.filter(q=>W.floors.some(F=>(F.name||'').startsWith(q.id+'.stoop.'))),q=S2[0];
 const stoops=W.floors.filter(F=>(F.name||'').startsWith(q.id+'.stoop.')).length;
 const r=walkIn(q,{skip:F=>(F.name||'').startsWith(q.id+'.stoop.'),steps:q.steps.map(s=>[s[0],ground(s[0],s[2]),s[2]])});
 ok(S2.length>0&&r.miss.length===r.fl.length,'negative: '+S2.length+' buildings stand over their street with stoops; '+q.id+' ('+q.item+') without its '+stoops+' reaches '+(r.fl.length-r.miss.length)+' of '+r.fl.length+' floors');}
/* the doorways blocked: nothing inside */
{const q=RT.placed.find(p=>p.item==='xa_scrap_house'),it=IX.sets.byName['xanadu-scrap'].forDef('xa_scrap_house',0),c=Math.cos(q.inst.ry),s=Math.sin(q.inst.ry);
 const ex=IX.sets.byName['xanadu-scrap'].doors.xa_scrap_house.map(R=>{const x=q.inst.x+R[0]*c+R[2]*s,z=q.inst.z-R[0]*s+R[2]*c;return [x-1,x+1,z-1,z+1,q.y-1,q.y+3];});
 const r=walkIn(q,{extra:ex});ok(r.miss.length===r.fl.length,'negative: '+q.id+'\'s doorway blocked, the walker reaches none of its '+r.fl.length+' floors');}
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
