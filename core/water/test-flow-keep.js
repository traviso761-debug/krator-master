// node core/water/test-flow-keep.js — drawFlow({keep}) (2026-10-27, eastabyss's delta): a ribbon fades out where the host says other water already
// lies (a lake, a marsh pool), so a channel never rides over it. Sampled per ribbon vertex; with a negative; without it the text is the old one
// (test-gaps.js holds the default's hash).
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const {glslProgram}=require('./glsl-interp.js');
const files=['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/21-core-water-shore.js',
 'core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js'];
global.window=global;
eval(files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=ATMOS,W=WATER;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
class Color{constructor(h){h=h==null?0:h;this.r=((h>>16)&255)/255;this.g=((h>>8)&255)/255;this.b=(h&255)/255;}}
class V2{constructor(x,y){this.x=x||0;this.y=y||0;}}
class V3{constructor(){this.x=0;this.y=0;this.z=0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}}
class F32{constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;}}
class BG{constructor(){this.attributes={};this.index=null;}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=Array.from(i);}computeBoundingSphere(){}}
class Mat{constructor(o){Object.assign(this,{transparent:false,depthWrite:true,userData:{}},o||{});}customProgramCacheKey(){return'';}onBeforeCompile(){}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.position=new V3();this.name='';}raycast(){}}
const T3={Color,Vector2:V2,Vector3:V3,BufferGeometry:BG,Float32BufferAttribute:F32,MeshStandardMaterial:Mat,Mesh,DoubleSide:2};
A.T=T3;A.h={scene:{add(){}},THREE:T3};A.U={waveTime:{value:0},waveAmp:{value:1},rain:{value:0}};A.hooks=[];A.skyEnv=null;
const FS='#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_begin>\n',VS='#include <common>\n#include <begin_vertex>\n';
const compiled=m=>{const sh={uniforms:{},vertexShader:VS,fragmentShader:FS};m.onBeforeCompile(sh,null);return{key:m.customProgramCacheKey(),vs:sh.vertexShader,fs:sh.fragmentShader};};
// a channel running +x into a lake whose shore is x = 100: kept on land, gone 30 m into the lake
const mk=()=>W.flow({name:'channel',pts:[[0,0,.1],[60,0,.1],[100,0,.1],[150,0,.1]],width:20,speed:.7,densify:5});
const shore=x=>{const t=Math.min(1,Math.max(0,(x-70)/60));return 1-t*t*(3-2*t);};   /* 1 on land (x < 70), 0 in the lake (x > 130) */
{const D0=W.drawFlow(mk(),{}),D1=W.drawFlow(mk(),{keep:(x,z)=>shore(x)}),c0=compiled(D0.material),c1=compiled(D1.material),K=D1.mesh.geometry.attributes.wtrKeep.array,P=D1.ribbon.pos;
 let e=0;for(let i=0;i<K.length;i++)e=Math.max(e,Math.abs(K[i]-shore(P[i*3])));
 ok('keep: sampled at each of the ribbon\'s '+K.length+' vertices ('+e.toExponential(1)+' off the host\'s function, float32), 1 up the channel, 0 out in the lake',e<1e-6&&K[0]===1&&K[K.length-1]===0,false);
 const line=c1.fs.slice(c1.fs.indexOf('diffuseColor.a*=vWtrK;'));ok('...the alpha times it after every other alpha line (just before the roughness), its program keyed apart; the record says keep',
  c1.fs.includes('diffuseColor.a*=vWtrK;\n#include <roughnessmap_fragment>')&&c1.vs.includes('vWtrK=wtrKeep;')&&c1.key!==c0.key&&D1.S.ribbonOpt.keep===true&&line.length>0,false);
 const G=glslProgram('float a(float vWtrK){vec4 diffuseColor=vec4(1.0,1.0,1.0,0.8);diffuseColor.a*=vWtrK;return diffuseColor.a;}',{});
 ok('...negative: without keep there is no attribute, no line and no record (the old ribbon); in the line, half kept is half the alpha ('+G.run('a',.5).toFixed(2)+')',
  !D0.mesh.geometry.attributes.wtrKeep&&!c0.fs.includes('vWtrK')&&!D0.S.ribbonOpt.keep&&Math.abs(G.run('a',.5)-.4)<1e-12,false);
 const Do=W.drawFlow(mk(),{keep:(x,z)=>shore(x),transparent:false}),co=compiled(Do.material);
 ok('an opaque ribbon discards where less than half is kept',co.fs.includes('if(vWtrK<0.5)discard;'),co.fs.includes('diffuseColor.a*=vWtrK;'));}
// ---- refine (2026-10-27, the core pass): rows where keep changes, not along the whole line
{const coarse=()=>W.flow({name:'coarse channel',pts:[[0,0,.1],[60,0,.1],[150,0,.1],[400,0,.1]],width:20,speed:.7});
 const keepR=(x,z)=>shore(x),R0=W.drawFlow(coarse(),{keep:keepR,step:30}),R1=W.drawFlow(coarse(),{keep:keepR,step:30,refine:true});
 const rowsX=D=>{const r=D.ribbon,out=[];for(let i=0;i<r.rows;i++)out.push(r.pos[i*(r.across+1)*3]);return out;},x0=rowsX(R0),x1=rowsX(R1);
 const jump=xs=>{let m=0;for(let i=1;i<xs.length;i++)m=Math.max(m,Math.abs(shore(xs[i])-shore(xs[i-1])));return m;};
 ok('refine: rows where keep changes ('+x1.length+' rows, '+x0.length+' without), keep never steps more than tol + a little between rows ('+jump(x1).toFixed(3)+'; without: '+jump(x0).toFixed(3)+')',
  jump(x1)<=.1&&jump(x0)>.3&&x1.length<x0.length+40,false);
 ok('...the long reach where keep is constant keeps its 30 m rows (rows past x 150: '+x1.filter(x=>x>150).length+'), and the record keeps tol and min, not the function',
  x1.filter(x=>x>150).length===x0.filter(x=>x>150).length&&JSON.stringify(R1.S.ribbonOpt.refine)==='{"tol":0.08,"min":2}',false);
 const R2=W.drawFlow(coarse(),{keep:keepR,step:30});ok('...negative: without refine the ribbon is the old one (same rows as before)',JSON.stringify(R2.ribbon.pos)===JSON.stringify(R0.ribbon.pos)&&!R2.S.ribbonOpt.refine,false);}
console.log(bad?'\n'+bad+' FAILED':'\nall passed');process.exit(bad?1:0);
