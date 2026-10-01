// node core/terrain/test-carve.js — the carve module's contract on a synthetic cliff, each check
// with a broken input that must fail. Needs no browser; the mesh test loads a three.min.js if one is found.
const fs=require('fs'),path=require('path');
global.window=global;eval(fs.readFileSync(path.join(__dirname,'36-core-carve.js'),'utf8'));
const C=KCARVE.create(),FLOOR=10,TOP=60;
const base=(x,z)=>z<-1?TOP:FLOOR;                                  // a straight cliff: rock north of z = -1
const Q=C.add({id:'a',c:[0,-1],n:[0,1],hw:12,depth:10,h:19,floorY:FLOOR,base});
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
ok('the void is open half way in',!C.rockAt(0,FLOOR+8,-5),C.rockAt(0,FLOOR+8+40,-5)===false);
ok('rock over the ceiling',C.rockAt(0,C.covered(0,-5)+2,-5),C.rockAt(0,TOP+5,-5));
ok('the patch\'s rock fills its margin beside the void, up to the cliff top',C.rockAt(15,30,-5)&&!C.rockAt(15,TOP+.5,-5),C.rockAt(15,TOP+3,-5));
ok('the recess runs pad metres behind the void',C.recessD(0,-1-Q.depth-1)<0,C.recessD(0,-1-Q.depth-Q.pad-1)<0);
ok('covered only under the hood',C.covered(0,-5)!==null&&C.covered(0,5)===null,C.covered(40,-5)!==null);
ok('the floor under the hood sees less sky',C.floorOcc(0,-8)<.6&&C.floorOcc(0,20)===1,C.floorOcc(40,-8)<1);
ok('the hood shades its floor from a high sun',C.floorSun(0,FLOOR,-8,[0,1,.3])<.5,C.floorSun(0,FLOOR,20,[0,1,.3])<.5);
ok('a low sun shines in under the hood',C.floorSun(0,FLOOR,-8,[0,1,1.6])>.5,C.floorSun(0,FLOOR,-8,[0,1,.3])>.5);
C.kind('slot',{plan:(L,Q)=>Math.max(Math.abs(L.u)-Q.hw,L.q-Q.depth,-L.q-1),ceil:(Q)=>Q.floorY+Q.h,occ:.7});
C.add({id:'s',kind:'slot',c:[60,-1],n:[0,1],hw:1.5,depth:6,h:8,floorY:FLOOR,base});
ok('a registered kind carves',!C.rockAt(60,FLOOR+4,-4)&&C.rockAt(60,FLOOR+12,-4),!C.rockAt(60,FLOOR+4,-12)&&C.rockAt(60,FLOOR+12,-12));
let threw=false;try{C.add({id:'x',kind:'nope',c:[0,0],n:[0,1],hw:1,depth:1,h:1,floorY:0,base})}catch(e){threw=true;}ok('an unknown kind is refused',threw,false);
ok('instances are independent',KCARVE.patches.length===0&&C.patches.length===2,false);
const T3=['../../biomes/sedesert/three.min.js'].map(p=>path.join(__dirname,p)).find(p=>fs.existsSync(p));
if(T3){const THREE=require(T3);global.performance=global.performance||{now:Date.now};C.get('s').cell=1;Q.cell=1;
 const M=C.mesh(null,{THREE,sun:[0,1,1.2]}),g=M[0].geometry,o=g.attributes.aOcc.array,s=g.attributes.aSun.array;
 ok('meshes one per patch, with occlusion and sun',M.length===2&&g.index.count>0&&Math.min(...o)<.6&&Math.min(...s)<.5,false);}
else console.log('skip  mesh (no three.min.js found)');
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
