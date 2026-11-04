// node core/terrain/test-speleo.js — speleothems in a cavern (39b-core-speleo.js, KSPELEO), each check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'39-core-cavern.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'39b-core-speleo.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const S=KSPELEO;
// the hold: a big hall 40 m under the ground, a low passage beside it, a light well open to the sky
const C=KCAVERN.create({ground:()=>40,cell:1,chunk:16,seed:3});
C.hall({id:'hold',c:[0,0,0],rx:40,rz:30,h:16,belly:0,throat:{r0:3,r1:4,top:41}});C.tube({id:'low',pts:[[40,0,0],[80,0,0]],w:4,h:2.2});C.build();
const box=[-45,-35,85,35],R=S.place(C,{box,y:1,world:9});
const by=k=>R.filter(r=>r.kind===k);
ok('the hold gets speleothems ('+R.length+': '+S.KINDS.map(k=>k+' '+by(k).length).join(', ')+')',by('chandelier').length>5&&by('stalactite').length>0,R.length<5);
let fixed=true;R.forEach(r=>{const up=r.kind==='stalagmite'||r.kind==='column';const above=C.sdf(r.x,r.y+(up?-.1:.1),r.z),below=C.sdf(r.x,r.y+(up?.1:-.1),r.z);if(!(above<=0&&below>0))fixed=false;});
ok('each is fixed on rock: hung ones at the roof, standing ones on the floor',fixed,false);
ok('a chandelier hangs where the roof is high, never in the low passage',by('chandelier').every(r=>r.roof-r.floor>=3&&r.x<41),by('chandelier').some(r=>r.x>45));
ok('a hung one never reaches the floor; a column spans it',by('stalactite').concat(by('chandelier')).every(r=>r.len<r.roof-r.floor)&&by('column').every(r=>Math.abs(r.len-(r.roof-r.floor))<1e-9),false);
ok('nothing under the light well (no roof there) or in rock',R.every(r=>Math.hypot(r.x,r.z)>3.2)&&S.place(C,{box:[-2,-2,2,2],y:1,world:9}).length===0,false);
ok('outside the voids nothing',S.place(C,{box:[200,200,260,260],y:1,world:9}).length===0,false);
const Col=S.place(C,{box:[45,-3,80,3],y:1,world:9,cell:2,kinds:{stalactite:{p:1,len:[1.2,2],r:[.1,.2],minGap:1},stalagmite:{p:1,len:[1.2,2],r:[.2,.3]}}});
ok('where a stalactite and its stalagmite would meet, a column spans floor to roof ('+Col.length+')',Col.length>0&&Col.every(r=>r.kind==='column'&&Math.abs(r.y-r.floor)<1e-9&&Math.abs(r.y+r.len-r.roof)<1e-9),Col.some(r=>r.kind!=='column'));
// determinism by cell: a tile placed alone is the whole placement cropped
const T=S.place(C,{box:[0,0,24,24],y:1,world:9}),crop=R.filter(r=>r.x>=0&&r.x<24&&r.z>=0&&r.z<24);
ok('a tile placed alone gets exactly what the whole hold has there',JSON.stringify(T)===JSON.stringify(crop)&&T.length>0,T.length===0);
ok('another world, another placement',JSON.stringify(S.place(C,{box,y:1,world:10}))!==JSON.stringify(R),false);
ok('accept has the last word',S.place(C,{box,y:1,world:9,accept:r=>r.kind!=='chandelier'}).every(r=>r.kind!=='chandelier'),false);
ok('kinds are the kit\'s: a cave of stalactites only',S.place(C,{box,y:1,world:9,kinds:{stalactite:{p:.5,len:[.5,1],r:[.1,.2]}}}).every(r=>r.kind==='stalactite'),false);
ok('a bad box, y, cell, kind or range throws',throws(()=>S.place(C,{box:[0,0,0,0],y:1}))&&throws(()=>S.place(C,{box,y:null}))&&throws(()=>S.place(C,{box,y:1,cell:0}))&&
  throws(()=>S.place(C,{box,y:1,kinds:{column:{p:1,len:[1,2],r:[1,2]}}}))&&throws(()=>S.place(C,{box,y:1,kinds:{stalactite:{p:1,len:[2,1],r:[1,2]}}}))&&throws(()=>S.place({},{box,y:1})),
  throws(()=>S.place(C,{box,y:1})));
// the mesh
const M=S.mesh(R),n=M.pos.length/3;let finite=true,inRange=true;for(const v of M.pos)if(!isFinite(v))finite=false;for(const i of M.idx)if(i>=n)inRange=false;
ok('the mesh is finite triangles over its own vertices ('+(M.idx.length/3)+' tris)',finite&&inRange&&M.idx.length%3===0&&M.kind.length===n&&M.nrm.length===M.pos.length,M.idx.length===0);
const one=S.mesh([by('chandelier')[0]]),lo=Math.min(...Array.from(one.pos).filter((v,i)=>i%3===1)),c0=by('chandelier')[0];
ok('a chandelier\'s blades fan down from the roof, no lower than its length',lo<c0.y-c0.len*.4&&lo>=c0.y-c0.len-1e-6,lo>c0.y-.1);
ok('an unknown kind does not mesh',throws(()=>S.mesh([{kind:'drapery',x:0,y:0,z:0,len:1,r:1}])),throws(()=>S.mesh(R)));
// blocks and export
const Bk=S.blocks(R);ok('stalagmites and columns block a walker; hung ones do not',Bk.length===by('stalagmite').length+by('column').length&&Bk.every(b=>b.box[4]<b.box[5]),Bk.length===R.length);
const E=S.export(R);ok('the export is the records',E.format==='krator-speleo'&&E.records.length===R.length&&JSON.stringify(E.records)===JSON.stringify(R),false);
// ---- the limestone dress: a flat-floored hall and a passage whose floor falls 6 m in 60
const L=KCAVERN.create({ground:()=>40,cell:1,chunk:16,seed:5});L.hall({id:'h',c:[0,0,0],rx:30,rz:24,h:12,belly:0});L.tube({id:'t',pts:[[30,0,0],[90,-6,0]],w:10,h:5});L.build();
const RL=S.place(L,{box:[-32,-26,92,26],y:1.5,world:4,cell:2,kinds:S.LIMESTONE}),k=n=>RL.filter(r=>r.kind===n);
ok('the limestone kinds all come ('+['stalactite','stalagmite','column','straw','curtain','flowstone','rimstone'].map(n=>n+' '+k(n).length).join(', ')+')',['straw','curtain','flowstone','rimstone','stalactite'].every(n=>k(n).length>0),k('chandelier').length>0);
let roofOk=true,floorOk=true;k('straw').concat(k('curtain')).forEach(r=>{if(!(L.sdf(r.x,r.y+.1,r.z)<=0&&L.sdf(r.x,r.y-.1,r.z)>0))roofOk=false;});
k('flowstone').concat(k('rimstone')).forEach(r=>{if(!(L.sdf(r.x,r.y-.1,r.z)<=0&&L.sdf(r.x,r.y+.1,r.z)>0))floorOk=false;});
ok('straws and curtains hang from the roof, flowstone and rimstone lie on the floor',roofOk&&floorOk,false);
ok('rimstone only where the floor falls, its dams stepping down it',k('rimstone').every(r=>r.slope>=.03&&r.x>29&&r.dams.every((D,i)=>i===0||D.y<r.dams[i-1].y)),k('rimstone').some(r=>r.x<25));
ok('a straw cluster is many thin straws within its spread',k('straw').every(r=>r.arms.length>=6&&r.arms.every(A=>Math.hypot(A.dx,A.dz)<=r.r+1e-9&&A.len<=r.roof-r.floor)),false);
const ML=S.mesh(RL);let fin2=true;for(const v of ML.pos)if(!isFinite(v))fin2=false;let rng2=true;for(const i of ML.idx)if(i>=ML.pos.length/3)rng2=false;
ok('the limestone mesh is finite triangles ('+(ML.idx.length/3)+')',fin2&&rng2&&ML.idx.length>0&&new Set(ML.kind).size>=5,false);
ok('the hypogene preset holds none of them',S.place(C,{box,y:1,world:9}).every(r=>['straw','curtain','flowstone','rimstone'].indexOf(r.kind)<0),false);
// ---- the crystal caves (2026-11-03): the old presets are byte-identical to the module before them
const fnv=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(16);};
const mstr=x=>{const M=S.mesh(x);return [Array.from(M.pos).map(v=>v.toFixed(5)).join(','),Array.from(M.idx).join(','),Array.from(M.kind).join(',')].join('|');};
ok('the hypogene and limestone presets are unchanged (records, meshes, blocks)',fnv(JSON.stringify(R))==='402d7320'&&fnv(JSON.stringify(RL))==='8550bf20'&&fnv(mstr(R))==='73da9a65'&&fnv(mstr(RL))==='3729dbb8'&&fnv(JSON.stringify(S.blocks(R).concat(S.blocks(RL))))==='a2ddd66',false);
ok('and they hold no crystal kind',R.concat(RL).every(r=>['beam','block','druse'].indexOf(r.kind)<0),false);
// a Naica: a hall 60 x 40 m, 18 m high, 60 m down, dressed with SELENITE
const N=KCAVERN.create({ground:()=>60,cell:1,chunk:16,seed:6});N.hall({id:'naica',c:[0,0,0],rx:30,rz:20,h:18,belly:0});N.build();
const RN=S.place(N,{box:[-32,-22,32,22],y:2,world:5,cell:2,kinds:S.SELENITE}),kn=q=>RN.filter(r=>r.kind===q);
ok('the Naica preset grows beams, blocks and druse ('+['beam','block','druse'].map(q=>q+' '+kn(q).length).join(', ')+')',kn('beam').length>3&&kn('block').length>0&&kn('druse').length>0,kn('beam').length===0);
const end=b=>[b.x+Math.cos(b.el)*Math.cos(b.az)*b.len,b.y+b.r*.5+Math.sin(b.el)*b.len,b.z+Math.cos(b.el)*Math.sin(b.az)*b.len];
ok('every beam rises from the floor and ends inside the void (it stops at the rock it reaches)',kn('beam').every(b=>{const e=end(b);return Math.abs(b.y-b.floor)<1e-9&&N.sdf(e[0],e[1],e[2])>0&&b.len<=14+1e-9&&b.el>=.05-1e-9;}),false);
ok('the beams are selenite, as long as Earth\'s and no longer than the preset ('+Math.max(...kn('beam').map(b=>b.len)).toFixed(1)+' m longest)',kn('beam').every(b=>b.mineral==='selenite')&&Math.max(...kn('beam').map(b=>b.len))>=4,false);
let dok=true;kn('druse').forEach(r=>r.pts.forEach(D=>{if(!(N.sdf(r.x+D.dx,D.y+(D.up?-.1:.1),r.z+D.dz)<=0&&N.sdf(r.x+D.dx,D.y+(D.up?.1:-.1),r.z+D.dz)>0))dok=false;}));
kn('block').forEach(r=>r.parts.forEach(B=>{if(!(N.sdf(r.x+B.dx,B.y-.1,r.z+B.dz)<=0&&N.sdf(r.x+B.dx,B.y+.1,r.z+B.dz)>0))dok=false;}));
ok('druse points stand on their own floor or hang from their own roof; block crystals stand on theirs',dok,false);
const MN=S.mesh(RN);let f3=true;for(const v of MN.pos)if(!isFinite(v))f3=false;
ok('the crystal mesh is finite triangles of the new kinds ('+(MN.idx.length/3)+')',f3&&MN.idx.length>0&&[8,9,10].every(q=>Array.from(MN.kind).indexOf(q)>=0),false);
const BN=S.blocks(RN);ok('beams and blocks block a walker; druse does not',BN.length===kn('beam').length+kn('block').length&&BN.every(b=>b.box[0]<b.box[1]&&b.box[4]<b.box[5]),BN.length===RN.length);
const TN=S.place(N,{box:[0,0,16,16],y:2,world:5,cell:2,kinds:S.SELENITE}),cN=RN.filter(r=>r.x>=0&&r.x<16&&r.z>=0&&r.z<16);
ok('a crystal tile placed alone gets what the whole cave has there',JSON.stringify(TN)===JSON.stringify(cN)&&TN.length>0,false);
// a geode: a room 3 m across in basalt, lined with amethyst; a vug half a metre across with quartz and topaz
const Gd=KCAVERN.create({ground:()=>20,cell:.25,chunk:16,seed:7});Gd.hall({id:'geode',c:[0,0,0],rx:1.6,rz:1.4,h:2.6,belly:.3});Gd.build();
const RG=S.place(Gd,{box:[-1.6,-1.4,1.6,1.4],y:.8,world:2,cell:.4,kinds:S.AMETHYST});
ok('a geode is lined with amethyst druse ('+RG.length+')',RG.length>5&&RG.filter(r=>r.kind==='druse').every(r=>r.mineral==='amethyst')&&RG.filter(r=>r.kind==='druse').length>RG.length*.6,RG.length===0);
ok('the other presets name their minerals',S.CALCITE.druse.mineral==='calcite'&&S.CALCITE.beam.mineral==='celestine'&&S.VUG.druse.mineral==='quartz'&&S.VUG.block.mineral==='topaz',false);
ok('a crystal kind with a bad range throws',throws(()=>S.place(N,{box:[-32,-22,32,22],y:2,kinds:{beam:{p:1,len:[9,2],r:[.2,.4]}}})),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
