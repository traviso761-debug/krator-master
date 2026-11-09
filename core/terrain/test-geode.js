// node core/terrain/test-geode.js — geodes in a flow top's band and a walk-in geode in a fallen block (39f-core-geode.js, KGEODE), each check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
for(const f of['../rand/08-core-rand.js','39-core-cavern.js','39f-core-geode.js'])eval(fs.readFileSync(path.join(__dirname,f),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
// a stepped wall: a flat floor at 0 for x < 0, a cliff rising to 40 m over x 0..20 (steep), a bench at 40 for x > 20; one band under the bench
const ground=(x,z)=>x<0?0:x>20?40:x*2;
const normal=(x,z)=>{if(x<0||x>20)return[0,1,0];const l=Math.hypot(2,1);return[-2/l,1/l,0];};
const bands=[{id:'flow 1',y0:30,y1:39.7}];
const o={box:[-80,-60,60,60],world:5,cell:2,bands,ground,normal};
const R=KGEODE.scatter(o),W=R.filter(r=>r.kind==='wall'),L=R.filter(r=>r.kind==='loose');
ok('geodes in the wall and on the ground below ('+W.length+' wall, '+L.length+' loose)',W.length>10&&L.length>10,R.length===0);
ok('every wall geode in the band, on the cliff, split, facing out of it',W.every(r=>r.y>=30&&r.y<=39.7&&r.x>=0&&r.x<=20&&r.split&&r.n[0]<0),W.length===0);
ok('every loose geode on gentle ground within 60 m under the band (the floor, not the bench over it)',L.every(r=>r.y<30&&r.y>=30-60&&normal(r.x,r.z)[1]>.9),L.length===0);
ok('loose geodes lie whole and broken (both)',L.some(r=>r.split)&&L.some(r=>!r.split),false);
ok('the same box and world, the same geodes; another world, others',JSON.stringify(KGEODE.scatter(o))===JSON.stringify(R)&&JSON.stringify(KGEODE.scatter(Object.assign({},o,{world:6})))!==JSON.stringify(R),false);
ok('a tile placed alone gets what the whole box gets there',(()=>{const T=KGEODE.scatter(Object.assign({},o,{box:[0,0,30,30]})),ids=new Set(R.map(r=>r.id));return T.length>0&&T.every(r=>ids.has(r.id)&&JSON.stringify(r)===JSON.stringify(R.find(q=>q.id===r.id)));})(),false);
ok('no band, no geodes',KGEODE.scatter(Object.assign({},o,{bands:[]})).length===0,KGEODE.scatter(Object.assign({},o,{bands:[]})).length>0);
ok('no wall geodes on flat ground (a flat world)',KGEODE.scatter(Object.assign({},o,{ground:()=>35,normal:()=>[0,1,0]})).filter(r=>r.kind==='wall').length===0,false);
ok('near filters cells out',KGEODE.scatter(Object.assign({},o,{near:()=>false})).length===0,false);
ok('refuses a missing box or ground',throws(()=>KGEODE.scatter({ground,normal}))&&throws(()=>KGEODE.scatter({box:o.box})),false);
// the walk-in geode: a block on the floor at the wall's foot, its broken face to the west (away from the wall)
const C=KCAVERN.create({ground,cell:.5,chunk:16,seed:3});
const Bk=KGEODE.block(C,{id:'blk',x:-12,z:0,ground,face:Math.PI,world:5});C.build();
const P=Bk.pocket;
ok('the block stands on the ground (its foot under it, its top over it)',Bk.y0<ground(-12,0)&&Bk.y1>ground(-12,0)+5,false);
ok('the pocket is open inside and the block is rock round it',C.sdf(P.c[0],P.y+P.h*.45,P.c[2])>.5&&C.sdf(-12+3.5*Math.cos(Math.PI/2),3,3.5)<0,C.sdf(P.c[0],P.y+P.h*.45,P.c[2])<=0);
ok('the pocket opens on the broken face (the door is in the open)',C.sdf(P.door[0]-.3,P.y+1.5,P.door[1])>0,false);
ok('the back of the block is rock (the pocket does not run through it)',C.sdf(-12+2.5,P.y+1.5,0)<0,C.sdf(-12+2.5,P.y+1.5,0)>=0);
const D=KGEODE.line(C,Bk,{world:5,n:600});
ok('the lining: amethyst points on the wall of the pocket, aimed in ('+D.length+' of 600; the rest leave by the broken face)',D.length>300&&D.length<600&&D.every(q=>Math.abs(C.sdf(q.x,q.y,q.z))<.15&&q.mineral==='amethyst'),D.length===0);
ok('no point grows out of the broken face (every one inside the plan of the block)',D.every(q=>q.x>-12-4.1),false);
ok('the same pocket, the same lining',JSON.stringify(KGEODE.line(C,Bk,{world:5,n:600}))===JSON.stringify(D),false);
ok('refuses a built cavern or no ground',throws(()=>KGEODE.block(null,{x:0,z:0,ground}))&&throws(()=>KGEODE.block(KCAVERN.create({ground,cell:1}),{x:0,z:0})),false);
ok('one mineral unless a palette is given; shapes are ovals',R.every(r=>r.mineral==='amethyst'&&r.shape[0]===1&&r.shape[1]>=.62&&r.shape[1]<=1),false);
{const pal={amethyst:3,celestine:1,watermelon:1},M=KGEODE.scatter(Object.assign({},o,{minerals:pal})),c={};M.forEach(r=>c[r.mineral]=(c[r.mineral]||0)+1);
 ok('a palette draws only its minerals, the heavier more often ('+JSON.stringify(c)+')',M.every(r=>pal[r.mineral])&&c.amethyst>c.celestine&&c.celestine>0&&c.watermelon>0,M.some(r=>!pal[r.mineral]));
 ok('a palette changes the mineral, not the place',M.length===R.length&&M.every((r,i)=>r.id===R[i].id&&r.x===R[i].x&&r.r===R[i].r),false);
 ok('refuses a mineral it does not know',throws(()=>KGEODE.scatter(Object.assign({},o,{minerals:{ruby:1}}))),false);
 ok('every mineral has a crust and a rind, and ORDER lists them all',KGEODE.ORDER.length===Object.keys(KGEODE.MINERALS).length&&KGEODE.ORDER.every(k=>KGEODE.MINERALS[k].crust&&KGEODE.MINERALS[k].rind),false);}
ok('the lining grows deeper inward: depth 0..1, the deep points longer than at the rim',D.every(q=>q.depth>=0&&q.depth<=1)&&(()=>{const a=D.filter(q=>q.depth<.3),b=D.filter(q=>q.depth>.7),m=x=>x.reduce((s,q)=>s+q.len,0)/x.length;return a.length&&b.length&&m(b)>m(a);})(),false);
ok('some broken loose geodes lie with their other half beside them, on the ground',L.some(r=>r.pair)&&L.filter(r=>r.pair).every(r=>r.split&&Math.abs(r.pair.y-ground(r.pair.x,r.pair.z))<1e-9&&Math.hypot(r.pair.x-r.x,r.pair.z-r.z)>r.r*2),false);
{const S=[{x:0,z:0,R:40,s:1},{x:200,z:0,R:30,s:.5},{x:-200,z:50,R:30,s:0}],o2={sources:S,world:3,ground,normal,n:[1,4]},V=KGEODE.around(o2);
 ok('pockets round the vents ('+V.length+'), bismuth by default, each within reach of its source and on the ground',V.length>0&&V.every(r=>r.kind==='vent'&&r.split&&r.mineral==='bismuth'&&Math.hypot(r.x-S[r.source].x,r.z-S[r.source].z)<=S[r.source].R*.6+1e-9&&Math.abs(r.y-ground(r.x,r.z))<1e-9),V.length===0);
 ok('a source of no strength has none; the same sources, the same pockets',V.every(r=>r.source!==2)&&JSON.stringify(KGEODE.around(o2))===JSON.stringify(V),false);
 ok('refuses no sources and a mineral it does not know',throws(()=>KGEODE.around({ground,normal}))&&throws(()=>KGEODE.around(Object.assign({},o2,{minerals:{ruby:1}}))),false);}
ok('the export is plain JSON',KGEODE.export(R).records.length===R.length&&KGEODE.export(R).format==='krator-geodes',false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
