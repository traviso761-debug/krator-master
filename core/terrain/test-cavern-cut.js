// node core/terrain/test-cavern-cut.js — the rock cut lifted from the Zeijani kit (host/39h-core-cavern-cut.js), each check with a
// negative: the floors each primitive opens above, the weight drawRock writes, the cut boxes, the rule (KCAVERN.cut.discards), and the
// KHOOK layer compiled on the real three.js r128 chunks.
'use strict';
const fs=require('fs'),path=require('path');
if(typeof window==='undefined')global.window=global;
const R=require(path.join(__dirname,'..','shader','r128.js'));global.THREE=R.THREE;
for(const f of [['rand','08-core-rand.js'],['walk','20-core-walk.js'],['terrain','39-core-cavern.js'],['shader','06-core-khook.js'],['terrain','host','39h-core-cavern-cut.js']])
 eval(fs.readFileSync(path.join(__dirname,'..',...f),'utf8'));
let bad=0,n=0;const ok=(name,pass,neg,d)=>{n++;const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(d!=null?'  ['+d+']':'')+(neg?' (its negative passed)':''));};
// ---- a small cavern: a tube at y 0, a room on it at 4.5, a stair between, a hall, a shaft, a monolith in the hall
const C=KCAVERN.create({ground:()=>40,cell:.5,chunk:16,seed:3,walk:KWALK.create()});
C.tube({id:'t',pts:[[-20,0,0],[20,0,0]],w:5,h:4});
C.room({id:'r',poly:[[-6,5],[6,5],[6,12],[-6,12]],y:4.5,h:3});
C.stair({id:'s',a:[0,0,2],b:[0,4.5,6.5],w:1.6,h:2.4});
C.hall({id:'h',c:[30,-.5,0],rx:8,rz:6,h:7});
C.shaft({id:'sh',c:[-15,-4],y0:0,y1:42,r0:1.5,r1:1.5});
C.monolith({id:'m',poly:[[29,-1],[31,-1],[31,1],[29,1]],y0:-1,y1:6});
C.build();
const by=id=>C.prims.find(p=>p.id===id);
ok('cutFloor: a tube opens over its lowest point',KCAVERN.cutFloor(by('t'))===0,false);
ok('cutFloor: a room over its floor',KCAVERN.cutFloor(by('r'))===4.5,false);
ok('cutFloor: a stair over its foot',KCAVERN.cutFloor(by('s'))===0,KCAVERN.cutFloor(by('s'))===4.5);
ok('cutFloor: a hall over its floor\'s centre',KCAVERN.cutFloor(by('h'))===-.5,false);
ok('cutFloor: a shaft opens whole above its foot (y0 - 2, so over y0)',KCAVERN.cutFloor(by('sh'))===-2,false);
ok('cutFloor: a monolith is no void: null (negative)',KCAVERN.cutFloor(by('m'))===null,KCAVERN.cutFloor(by('m'))!==null);
// ---- the weight drawRock writes: each vertex its own void's floor, the ground NONE
const W=KCAVERN.cutWeight(C),out=[0];
const ch={prim:new Uint16Array([by('r').i,by('t').i,65535,by('m').i])};
const vals=[0,1,2,3].map(i=>(W(0,0,0,0,1,0,ch,i,out),out[0]));
ok('cutWeight: a room\'s vertex carries 4.5, the tube\'s 0',vals[0]===4.5&&vals[1]===0,false,vals.join());
ok('cutWeight: the ground and a monolith carry NONE',vals[2]===KCAVERN.CUT_NONE&&vals[3]===KCAVERN.CUT_NONE,vals[2]!==KCAVERN.CUT_NONE);
const Wown=KCAVERN.cutWeight(C,{own:P=>P.kind!=='tube',attr:1}),o2=[0,0];Wown(0,0,0,0,1,0,ch,1,o2);
ok('cutWeight: own() leaves a kind out (the tube opens only in boxes), at its attribute index',o2[1]===KCAVERN.CUT_NONE&&o2[0]===0,false);
// ---- the rule
const S=KCAVERN.cut;S.set(false);
ok('off: nothing is cut',!S.discards(0,9,8,4.5),false);
S.set(true);S.above(2);
ok('on: a room\'s wall over floor + 2 opens',S.discards(0,7,8,4.5),false);
ok('on: under floor + 2 stays (negative)',!S.discards(0,6,8,4.5),S.discards(0,6,8,4.5));
ok('on: the tube\'s crown over 0 + 2 opens, whatever the level above',S.discards(0,3,0,0),false);
ok('on: rock with no void of its own stays without a box',!S.discards(30,5,0,KCAVERN.CUT_NONE),false);
S.boxes([{x:30,z:0,hw:3,hd:2,ry:Math.PI/2,floor:-1,top:5.5}]);
ok('a box opens rock with no void of its own over its floor + 2, turned (hd now along x)',S.discards(31.5,4,0,KCAVERN.CUT_NONE)&&!S.discards(32.5,4,0,KCAVERN.CUT_NONE),S.discards(32.5,4,0,KCAVERN.CUT_NONE));
ok('a box\'s top shuts the cut over it',!S.discards(30,6,0,KCAVERN.CUT_NONE),S.discards(30,6,0,KCAVERN.CUT_NONE));
const many=[];for(let i=0;i<40;i++)many.push({x:i,z:0,hw:1,hd:1,floor:0});
ok('at most 32 boxes are kept (the shader\'s arrays)',S.boxes(many)===32,S.boxes(many)!==32);
const A=S.U.uKCutA.value,B=S.U.uKCutB.value;
ok('the uniforms carry each box: centre, half sizes; turn, floor, top (none: 1e6)',A[3].x===3&&A[3].z===1&&B[3].x===1&&B[3].z===0&&B[3].w===KCAVERN.CUT_NONE,false);
S.boxes([]);ok('boxes([]) clears every slot (half width 0)',A.every(a=>a.z===0),false);
// ---- the layer on the real r128 chunks
const m=new THREE.MeshStandardMaterial();KCAVERN.cutLayer(m);KCAVERN.cutLayer(m);
const sh=R.compile(m);
ok('the layer adds the attribute, the varyings and the discard',/attribute float aKCut/.test(sh.vs)&&/vKCutW=\(modelMatrix\*kcw\)/.test(sh.vs)&&/discard/.test(sh.fs)&&/uniform vec4 uKCutA\[32\]/.test(sh.fs),false);
ok('the uniforms are the shared ones (one write reaches every material)',sh.uniforms.uKCutOn===S.U.uKCutOn&&sh.uniforms.uKCutA===S.U.uKCutA,false);
ok('a second cutLayer on the same material adds nothing',(sh.fs.match(/uniform float uKCutOn/g)||[]).length===1,false);
ok('it resolves against the real chunks',!/#include/.test(R.resolve(sh.vs)+R.resolve(sh.fs)),false);
const m2=new THREE.MeshStandardMaterial();KCAVERN.cutLayer(m2,{attr:'aZ'});const sh2=R.compile(m2);
ok('another attribute name is taken as given',/attribute float aZ;/.test(sh2.vs)&&/vKCut=aZ/.test(sh2.vs)&&!/attribute float aKCut/.test(sh2.vs),false);
let threw=false;try{const pm=new THREE.MeshStandardMaterial();KCAVERN.cutLayer(pm);const s=R.shader('standard');s.fragmentShader=s.fragmentShader.replace('#include <clipping_planes_fragment>','');pm.onBeforeCompile(s,R.RENDERER);}catch(e){threw=/anchor|missing/.test(e.message);}
ok('a material without the anchors throws (KHOOK; negative)',threw,!threw);
console.log((n-bad)+' of '+n+' passed');process.exit(bad?1:0);
