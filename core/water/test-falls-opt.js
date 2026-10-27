// node core/water/test-falls-opt.js — drawFall's options for tall falls (2026-10-27, the Rift jungle's 160 m and 87 m cliffs): plungeR (the churn
// disc sized to the pool it lands in, its rim faded) and footK (the curtain's alpha held toward its foot instead of thinning). Each against the
// shader's own text in glsl-interp.js, with negatives; without them the text is the old one (test-gaps.js holds the default's hash).
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
class BG{constructor(){this.attributes={};this.index=null;this.pos=null;}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=Array.from(i);}computeBoundingSphere(){}rotateX(){return this;}translate(x,y,z){this.t=[x,y,z];return this;}}
class CG extends BG{constructor(r){super();this.r=r;}}
class Mat{constructor(o){Object.assign(this,{transparent:false,depthWrite:true,userData:{}},o||{});}customProgramCacheKey(){return'';}onBeforeCompile(){}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.position=new V3();this.name='';}raycast(){}}
const T3={Color,Vector2:V2,Vector3:V3,BufferGeometry:BG,Float32BufferAttribute:F32,CircleGeometry:CG,MeshStandardMaterial:Mat,Mesh,DoubleSide:2};
A.T=T3;A.h={scene:{add(){}},THREE:T3};A.U={waveTime:{value:0},waveAmp:{value:1},rain:{value:0}};A.hooks=[];A.skyEnv=null;
const FS='#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_begin>\n',VS='#include <common>\n#include <begin_vertex>\n';
const compiled=m=>{const sh={uniforms:{},vertexShader:VS,fragmentShader:FS};m.onBeforeCompile(sh,null);return{key:m.customProgramCacheKey(),fs:sh.fragmentShader};};
const mk=()=>W.fall({name:'cliff',lip:[[0,0,160],[0,26,160]],dir:[1,0],speed:2.5,drop:150});

// ---- plungeR
{const D0=W.drawFall(mk(),{}),D1=W.drawFall(mk(),{plungeR:30}),P=W.plunge(mk()),c0=compiled(D0.plunge.material),c1=compiled(D1.plunge.material);
 ok('plungeR: the disc is the given radius (30 m, not '+(P.r*2.4).toFixed(0)+' m) and keys its program apart',D1.plunge.geometry.r===30&&D0.plunge.geometry.r===P.r*2.4&&c1.key!==c0.key,false);
 const line=c1.fs.slice(c1.fs.indexOf('diffuseColor.a*=1.0-smoothstep('));const G=glslProgram('float rim(vec3 vWtrW){float a=1.0;'+line.slice(0,line.indexOf(';')+1).replace('diffuseColor.a','a')+'return a;}',{});
 const at=d=>G.run('rim',[P.x+d,P.y,P.z]);
 ok('...its rim fades over the outer quarter: whole to 22.5 m ('+at(22).toFixed(3)+'), half way at 26.25 m ('+at(26.25).toFixed(3)+'), nothing at 30 m ('+at(30).toFixed(3)+')',at(22)===1&&Math.abs(at(26.25)-.5)<1e-9&&at(30)===0,c0.fs.includes('diffuseColor.a*=1.0-smoothstep('));}

// ---- footK
{const S=mk(),c0=compiled(W.drawFall(S,{lipK:.85}).material),c1=compiled(W.drawFall(mk(),{lipK:.85,footK:.8}).material);
 const alpha=(fs,f,st)=>{const a=fs.indexOf('diffuseColor.a=');const body=fs.slice(a,fs.indexOf('\n',a)).replace(/wtrSt/g,'st');
  return glslProgram('float al(vec2 vWtrUF,float st){vec4 diffuseColor=vec4(1.0);'+body+'return diffuseColor.a;}',{}).run('al',[.5,f],st);};
 ok('footK: the curtain holds its alpha toward the foot (at f .9, a thin streak: '+alpha(c1.fs,.9,.2).toFixed(2)+'; without it '+alpha(c0.fs,.9,.2).toFixed(2)+')',alpha(c1.fs,.9,.2)>alpha(c0.fs,.9,.2)*2&&alpha(c1.fs,.9,.2)>.6,false);
 ok('...at the lip it changes nothing (f 0: '+alpha(c1.fs,0,.2).toFixed(3)+' and '+alpha(c0.fs,0,.2).toFixed(3)+'); its program is keyed apart',Math.abs(alpha(c1.fs,0,.2)-alpha(c0.fs,0,.2))<1e-12&&c1.key!==c0.key,!c0.fs.includes('mix(1.0,0.6,smoothstep(0.55,1.0,vWtrUF.y))'));}

console.log(bad?'\n'+bad+' FAILED':'\nall passed');process.exit(bad?1:0);
