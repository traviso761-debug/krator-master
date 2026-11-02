// node core/water/test-network.js — a flow network (core/water/ext/59 and 59b, 2026-10-27, PRACTICE.md section 2 item 2): joins, confluences, forks
// and mouths wired from one graph. The case: a river with a tributary, a fork into two distributaries at its end, both ending in a lake. Judged by
// the joins found, the discs shared, the mouths' fades, and WATER.audit's overlap rule (ext/57) with the hand-drawn ribbons as the negative.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const files=['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/21-core-water-shore.js',
 'core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js','core/water/ext/55-core-water-confluence.js','core/water/ext/55b-core-water-confluence-draw.js',
 'core/water/ext/57-core-water-audit.js'];
global.window=global;
eval(files.map(rd).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=ATMOS,W=WATER;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
class Color{constructor(h){h=h==null?0:h;this.r=((h>>16)&255)/255;this.g=((h>>8)&255)/255;this.b=(h&255)/255;}getHexString(){return'000000';}}
class V2{constructor(x,y){this.x=x||0;this.y=y||0;}set(x,y){this.x=x;this.y=y;return this;}}
class V3{constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}}
class BA{constructor(a,n){this.array=a;this.itemSize=n;}setUsage(){}}
class F32 extends BA{constructor(a,n){super(Float32Array.from(a),n);}}
class BG{constructor(){this.attributes={};this.index=null;}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=Array.from(i);}computeBoundingSphere(){}rotateX(){return this;}translate(){return this;}}
class Mat{constructor(o){Object.assign(this,{transparent:false,depthWrite:true,roughness:1,metalness:0,envMapIntensity:1,normalScale:new V2(1,1),userData:{}},o||{});this.color=new Color(this.color);}customProgramCacheKey(){return'';}onBeforeCompile(){}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.position=new V3();this.renderOrder=0;this.name='';}raycast(){}updateMatrixWorld(){}}
const T3={Color,Vector2:V2,Vector3:V3,BufferGeometry:BG,Float32BufferAttribute:F32,CircleGeometry:BG,MeshStandardMaterial:Mat,Mesh,DoubleSide:2};
const SCENE={children:[],add(m){this.children.push(m);}};
A.T=T3;A.h={scene:SCENE,THREE:T3};A.U={waveTime:{value:0},waveAmp:{value:1},rain:{value:0}};A.hooks=[];A.skyEnv=null;A.clock=A.clock||{t:0};
const VS='#include <common>\n#include <beginnormal_vertex>\n#include <begin_vertex>\n#include <project_vertex>\n',FS='#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <metalnessmap_fragment>\n#include <normal_fragment_begin>\n#include <emissivemap_fragment>\n';
const compiled=m=>{const sh={uniforms:{},vertexShader:VS,fragmentShader:FS};m.onBeforeCompile(sh,null);return{key:m.customProgramCacheKey(),vs:sh.vertexShader,fs:sh.fragmentShader};};
const before=JSON.stringify(W.export());
eval(rd('core/water/ext/59-core-water-network.js')+'\n'+rd('core/water/ext/59b-core-water-network-draw.js'));
ok('loading ext/59 and 59b moves nothing (the export of a scene made before)',JSON.stringify(W.export())===before,false);

// ---- the case: a river down z (x = 0, 20 m wide) from z -400 to its fork at z 200; a tributary from the east ending on its bank at z -100;
// two distributaries from the fork (0, 200) fanning to a lake beyond z 420 (an open surface)
const yR=z=>10-(z+400)*.002,chan=(d,hw,y)=>d<hw?y-1:y+.4+(d-hw)*.25;
const mk=()=>{const river=W.flow({name:'river',pts:Array.from({length:31},(_,k)=>[0,-400+20*k,yR(-400+20*k)]),width:24,speed:1});
 const trib=W.flow({name:'tributary',pts:[[260,-160,10.8],[160,-130,10.3],[80,-110,9.9],[12,-100,yR(-100)+.01]],width:12,speed:1.3});
 const dist=s=>W.flow({name:s>0?'east channel':'west channel',pts:Array.from({length:21},(_,k)=>{const t=k/20,z=200+300*t;return[s*140*t*t*(3-2*t),z,yR(200)-.1-t*.5];}),width:18,speed:.7});
 return[river,trib,dist(1),dist(-1)];};
const segD=(px,pz,P)=>{let d=1e9;for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],ex=b.x-a.x,ez=b.z-a.z,l2=ex*ex+ez*ez||1,u=Math.max(0,Math.min(1,((px-a.x)*ex+(pz-a.z)*ez)/l2));d=Math.min(d,Math.hypot(px-a.x-ex*u,pz-a.z-ez*u));}return d;};
let FL=mk();const ground=(x,z)=>{let g=14;for(const S of FL){const hw=S.pts[0].w/2-2;g=Math.min(g,chan(segD(x,z,S.pts),hw,S.heightAt(x,z)));}return z>420?Math.min(g,8):g;};
const lake=()=>W.open({name:'lake',level:yR(200)-.6,field:0,bounds:[-400,420,400,900]});

// ---- 1. the graph
{const L=lake(),N=W.network({flows:[{flow:FL[0]},{flow:FL[1],parent:0},{flow:FL[2],parent:'river'},{flow:FL[3],parent:FL[0]}],ground,open:[L]});
 const J=k=>N.joins.find(j=>j.child===k);
 ok('the joins: the tributary ends on the river (kind '+J(1).kind+'), the channels start from it ('+J(2).kind+', '+J(3).kind+'), a parent by index, name or record',
  J(1).kind==='tributary'&&J(2).kind==='distributary'&&J(3).kind==='distributary'&&J(1).parent===0&&J(2).parent===0&&J(3).parent===0,false);
 ok('the fork\'s siblings share one disc (river + both channels), the tributary has its own: '+N.confluences.length+' discs, members '+N.confluences.map(C=>'['+C.members+']').join(' '),
  N.confluences.length===2&&N.confluences.some(C=>C.members.length===3&&C.members.includes(2)&&C.members.includes(3)),false);
 const fk=N.confluences.find(C=>C.members.length===3);
 ok('the fork\'s disc reaches past the channels\' overlap (overlap '+J(2).overlap+' m; the disc r '+fk.r.toFixed(0)+' m round '+fk.mouth.map(v=>v.toFixed(0))+')',J(2).overlap>10&&fk.r>J(2).overlap*.5+12,false);
 ok('the mouths: both channels fade into the lake (keep 1 up the channel, 0 out in the lake), the river ends at the fork and has none',
  N.keep[2]&&N.keep[3]&&!N.keep[0]&&N.keep[2](70,300)===1&&N.keep[2](140,500)===0&&N.mouths.length===2,false);
 ok('the order: each child drawn over its parent ('+N.order+')',N.order[1]>N.order[0]&&N.order[2]>N.order[0],false);
 const D=W.drawNetwork(N,{flow:{shallow:0x6f9a8a,deep:0x1d3f44}});
 const fsT=D.flows.map(d=>compiled(d.material).fs);
 ok('drawNetwork: every flow drawn, the channels with their keep (refined rows), each disc drawn and fading its own members (the tributary\'s disc does not touch the channels)',
  D.flows.length===4&&D.confluences.length===2&&D.flows[2].mesh.geometry.attributes.wtrKeep&&D.flows[2].S.ribbonOpt.refine&&
  fsT[2].includes(W.ribbonFadeGLSL(fk))&&!fsT[1].includes(W.ribbonFadeGLSL(fk))&&fsT[0].includes(W.ribbonFadeGLSL(fk)),false);
 const ov=W.audit({ground}).filter(f=>f.rule==='overlap');
 ok('the audit finds no overlap left in the network ('+ov.length+')',ov.length===0,false);}
// ---- 2. negatives
{W.surfaces.length=0;W.groups.length=0;W.drawn.length=0;FL=mk();const L=lake();FL.forEach(S=>W.drawFlow(S,{}));
 const ov=W.audit({ground}).filter(f=>f.rule==='overlap');ok('...negative: the same flows drawn loose overlap at the fork, the tributary\'s mouth and over the lake ('+ov.length+' overlap findings)',ov.length>5,false);
 let msg='';try{const S=W.flow({name:'short stream',pts:[[300,0,11],[60,0,10.2]],width:10,speed:1});W.network({flows:[{flow:FL[0]},{flow:S,parent:0}],ground});}catch(e){msg=e.message;}
 ok('a child that does not reach its parent is refused ('+msg.slice(0,70)+')',/does not reach/.test(msg),false);}
console.log(bad?'\n'+bad+' FAILED':'\nall passed');process.exit(bad?1:0);
