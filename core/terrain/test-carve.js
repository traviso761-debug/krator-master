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
 ok('meshes one per patch, with occlusion and sun',M.length===2&&g.index.count>0&&Math.min(...o)<.6&&Math.min(...s)<.5,false);
 // gridNormals (opt-in): the same vertices and triangles, the normals near the sampled ones on average (negative: flipped)
 const G=C.mesh(null,{THREE,sun:[0,1,1.2],gridNormals:true})[0].geometry,na=g.attributes.normal.array,nb=G.attributes.normal.array,pa=g.attributes.position.array,pb=G.attributes.position.array;
 let same=pa.length===pb.length&&G.index.count===g.index.count,dot=0;for(let i=0;same&&i<pa.length;i++)if(pa[i]!==pb[i])same=false;
 for(let i=0;same&&i<na.length;i+=3)dot+=na[i]*nb[i]+na[i+1]*nb[i+1]+na[i+2]*nb[i+2];dot/=na.length/3;
 ok('gridNormals: the same mesh, normals near the sampled ones (mean cos '+dot.toFixed(3)+')',same&&dot>.95,-dot>.95);
 // attrs (opt-in, 2026-10-26): the host's attributes on the patch's vertices (negative: none asked, none added)
 const U=C.mesh(null,{THREE,attrs:{uv:{size:2,fn:(x,y,z)=>[x,z]}}})[0].geometry;ok('attrs: a uv from the vertex x and z',U.attributes.uv&&U.attributes.uv.array[0]===U.attributes.position.array[0]&&U.attributes.uv.array[1]===U.attributes.position.array[2],!!g.attributes.uv);}
else console.log('skip  mesh (no three.min.js found)');
// ---- a cave mouth in a hillside (fold, minSteep, keepOut, face, cut, site; 2026-10-26)
{const H=KCARVE.create(),hill=(x,z)=>FLOOR+Math.max(0,-z)*.6;            // a slope rising north at .6
 const F=H.face({c:[0,0],r:20,floorY:FLOOR,slope:3,maxCut:12,open:[0,-1]});
 ok('face: the floor inside its radius',H.cut(F,0,-5,hill(0,-5))===FLOOR,H.cut(F,0,-5,hill(0,-5))>FLOOR+1);
 ok('face: never more than maxCut under the natural ground',H.cut(F,0,-60,hill(0,-60))>=hill(0,-60)-12-1e-9,hill(0,-60)-FLOOR<=12);
 ok('face: far off, the ground is untouched',H.cut(F,0,-400,hill(0,-400))===hill(0,-400),false);
 const S=H.site({base:hill,floorAt:()=>FLOOR,from:[0,40],to:[0,-200],r:20,face:22});
 ok('site: the back wall stands about 22 m',Math.abs(S.face-22)<1.3,Math.abs(hill(0,-20)-FLOOR-22)<1.3);
 const Q2=H.add({id:'m',c:[0,-30],n:[0,1],hw:6,depth:14,h:8,floorY:FLOOR,base:hill,margin:6,pad:2});
 const st=H.minSteep(Q2);ok('minSteep: the rise the margin needs ('+st.toFixed(1)+':1)',st>2&&st<80,false);
 const g=(x,z,k)=>H.fold(hill(x,z),x,z,{steep:k});
 let gapK=0,gap3=0;for(let x=-14;x<=14;x+=.5)for(let z=-50;z<=-25;z+=.5){const d=H.recessD(x,z);if(d<=.5||d>=Q2.margin-Q2.pad)continue;if(hill(x,z)-g(x,z,Math.max(st,40))>1e-6&&d>(hill(x,z)-FLOOR)/Math.max(st,40)+1e-6)gapK++;if(hill(x,z)-g(x,z,3)>.5)gap3++;}
 ok('fold at minSteep: back on the natural ground within the margin (no trench round the hood)',gapK===0,gap3===0);
 ok('fold: the floor under the hood',g(0,-35,40)===FLOOR,false);
 ok('keepOut: inside the plan and margin, not far off',H.keepOut(0,-35)&&!H.keepOut(0,40),H.keepOut(60,40));}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
