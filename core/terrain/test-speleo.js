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
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
