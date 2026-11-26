// node core/water/test-plume.js — a tint field carried on a current (core/water/ext/61, 2026-11-02; the owner on swlowlands' delta: the river's silt should swirl
// and mix into the clear water, not stop at an edge). The shader's text against its twin, that the plume moves with its current and mixes (with negatives), and
// that nothing moves without the option.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const {glslProgram}=require('./glsl-interp.js');
const files=['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/21-core-water-shore.js',
 'core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js'];
global.window=global;
eval(files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=ATMOS,W=WATER;
let bad=0;const ok=(name,pass)=>{if(!pass)bad++;console.log((pass?'PASS  ':'FAIL  ')+name);};
class Color{constructor(h){h=h==null?0:h;this.r=((h>>16)&255)/255;this.g=((h>>8)&255)/255;this.b=(h&255)/255;}getHexString(){return'000000';}}
class V2{constructor(x,y){this.x=x||0;this.y=y||0;}set(x,y){this.x=x;this.y=y;return this;}}
class V3{constructor(){this.x=0;this.y=0;this.z=0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}}
class F32{constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;this.updateRange={};}setUsage(){return this;}}
class BG{constructor(){this.attributes={};this.index=null;}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=Array.from(i);}computeBoundingSphere(){}}
class Mat{constructor(o){Object.assign(this,{transparent:false,depthWrite:true,userData:{},normalScale:new V2(1,1)},o||{});}customProgramCacheKey(){return'';}onBeforeCompile(){}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.position=new V3();this.name='';}raycast(){}}
const T3={Color,Vector2:V2,Vector3:V3,Vector4:class{set(){}},BufferGeometry:BG,InstancedBufferGeometry:BG,Float32BufferAttribute:F32,InstancedBufferAttribute:F32,MeshStandardMaterial:Mat,Mesh,DoubleSide:2,
 DataTexture:class{constructor(d,w,h){this.image={data:d,width:w,height:h};}},RGBAFormat:1,UnsignedByteType:1,LinearFilter:1,ClampToEdgeWrapping:1,
 Frustum:class{setFromProjectionMatrix(){}intersectsBox(){return true;}},Matrix4:class{multiplyMatrices(){}},Box3:class{constructor(){this.min=new V3();this.max=new V3();}}};
A.T=T3;A.h={scene:{add(){}},THREE:T3};A.U={waveTime:{value:0},waveAmp:{value:1},rain:{value:0}};A.hooks=[];A.skyEnv=null;
const FS='#include <common>\nvoid main(){\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <metalnessmap_fragment>\n#include <normal_fragment_begin>\n#include <normal_fragment_maps>\n#include <emissivemap_fragment>\n',VS='#include <common>\n#include <beginnormal_vertex>\n#include <begin_vertex>\n#include <project_vertex>\n';
const compiled=m=>{const sh={uniforms:{},vertexShader:VS,fragmentShader:FS};m.onBeforeCompile(sh,null);return{key:m.customProgramCacheKey(),fs:sh.fragmentShader,vs:sh.vertexShader,u:Object.keys(sh.uniforms).sort().join(',')};};

// the case: a sea with a river mouth at the origin, its silt a plume fading over 300 m to the +x side, the current running out along +x
const BOX=[-200,-400,800,400],PLUME=0x6a5a3c;
const tint={box:BOX,cell:8,at:(x,z)=>{const d=Math.hypot(x,z*1.8);const a=.85*Math.max(0,1-d/300);return a<.004?null:{c:PLUME,a};}};
const curr=(x,z)=>x<0?null:[.5,.1*Math.sign(z)];
const plain=()=>W.open({name:'sea',level:0,swell:[[.05,22,35,0,.03]],field:0,bounds:BOX,tint});
const S0=plain(),k0=compiled(W.draw(S0,{}).material);
eval(fs.readFileSync(path.join(ROOT,'core/water/ext/61-core-water-plume.js'),'utf8'));
ok('loading ext/61 changes no drawing: a tint without tintFlow draws the same shader, key and uniforms',JSON.stringify(compiled(W.draw(plain(),{}).material))===JSON.stringify(k0));
const S=W.open({name:'sea',level:0,swell:[[.05,22,35,0,.03]],field:0,bounds:BOX,tint,tintFlow:{v:curr,period:60,swirl:.12,scale:140,fil:.45,filScale:45}});
const k1=compiled(W.draw(S,{}).material);
ok('with tintFlow the shader reads wtrTintFlow and takes its current as wtrTintV (the negative: the plain one does not)',/wtrTintFlow\(vWtrP\)/.test(k1.fs)&&/wtrTintV/.test(k1.u)&&!/wtrTintFlow/.test(k0.fs)&&k1.key!==k0.key);

// the twin and the text: the sampler is the bilinear the GPU filters with, on the tint's and the current's bytes
{const T=S.tint,B=W.bakeTintFlow(S),uvTo=(R,uv)=>[R.x0+uv[0]*R.cell*R.nx,R.z0+uv[1]*R.cell*R.nz];
 const tex=(smp,uv)=>{const R=smp==='tint'?T:B;return W.tintSample(R,...uvTo(R,uv));};
 let e=0;for(const t of[3.3,47.9,401.25]){const G=glslProgram(W.glsl(S)+'\n'+W.tintFlowGLSL(S),{atmWaveT:A.waveWrap(t),atmWaveAmp:A.PRESETS.waves.amp,texture2D:tex,texture2DLodEXT:(s,uv)=>tex(s,uv),wtrTint:'tint',wtrTintV:'flow',
   wtrLevel:0,wtrBase:0,cameraPosition:[0,0,0]});
  for(let k=0;k<60;k++){const x=-150+900*((k*37)%60)/60,z=-300+600*((k*11)%60)/60,a=G.run('wtrTintFlow',[x,z]),b=W.tintFlowAt(S,x,z,A.waveWrap(t));e=Math.max(e,...a.map((v,i)=>Math.abs(v-b[i])));}}
 ok('wtrTintFlow (the shader\'s text) equals WATER.tintFlowAt at 180 points and three times ('+e.toExponential(1)+')',e<1e-9);}

// it is carried: a flow map's picture is the laid field read upstream, so the plume stands downstream of where it was laid (its mass centre along the
// current), and a reversed current carries it the other way (the negative); and it is alive: the eddies turn over, so the same points change with time
{const cen=(Sx,t)=>{let m=0,mx=0;for(let x=-195;x<800;x+=5)for(let z=-200;z<=200;z+=10){const a=Sx?W.tintFlowAt(Sx,x,z,t)[3]:S0.tintAt(x,z)[3];m+=a;mx+=a*x;}return mx/m;};
 const mk=vx=>W.open({name:'sea',level:0,swell:[[.05,22,35,0,.03]],field:0,bounds:BOX,tint,tintFlow:{v:(x,z)=>[vx,0],period:60,swirl:0}});
 const c0=cen(null,0),c1=cen(mk(.5),77),cR=cen(mk(-.5),77);
 ok('the plume is carried down its current: mass centre '+c0.toFixed(0)+' m laid, '+c1.toFixed(0)+' m carried, '+cR.toFixed(0)+' m on a reversed current (the negative)',c1>c0+8&&cR<c0-8);
 const P=W.period()/W.bakeTintFlow(S).n;let ch=0,chS=0;for(let k=0;k<200;k++){const x=20+k,z=10;ch+=Math.abs(W.tintFlowAt(S,x,z,.4*P)[3]-W.tintFlowAt(S,x,z,.4*P+W.period()/4)[3]);chS+=Math.abs(S0.tintAt(x,z)[3]-S0.tintAt(x,z)[3]);}
 ok('it is alive: the eddies turn over, so the same phase a quarter loop on reads differently ('+ch.toFixed(2)+'; a still tint: '+chS+', the negative)',ch>1&&chS===0);}

// it mixes: across the plume the alpha breaks into filaments (its variation along a line well above the smooth field's), and it never goes over 1
{let rough=0,smooth=0,mx=0,n=0;let pa=null,pb=null;for(let z=-200;z<=200;z+=2){const a=W.tintFlowAt(S,120,z,90)[3],b=S0.tintAt(120,z)[3];if(pa!=null){rough+=Math.abs(a-pa);smooth+=Math.abs(b-pb);}pa=a;pb=b;mx=Math.max(mx,a);n++;}
 ok('the plume breaks into filaments across its width ('+rough.toFixed(2)+' against the laid field\'s '+smooth.toFixed(2)+')',rough>smooth*1.5);
 ok('alpha stays within 0..1 (max '+mx.toFixed(3)+')',mx<=1+1e-9);}

// the swirl has no divergence: the curl term alone moves no water in or out of a small box
{const F=W.bakeTintFlow(S).F,e=.5,X=500,Z=380;let flux=0;const v=(x,z)=>{const q=W.tintFlowVel(S,x,z);return q;};
 const out=W.open({name:'calm',level:0,swell:[[.05,22,35,0,.03]],field:0,bounds:BOX,tint,tintFlow:{v:null,swirl:.12,scale:140}});
 for(let k=0;k<40;k++){const s=-20+k;flux+=W.tintFlowVel(out,X+20,Z+s)[0]-W.tintFlowVel(out,X-20,Z+s)[0]+W.tintFlowVel(out,X+s,Z+20)[1]-W.tintFlowVel(out,X+s,Z-20)[1];}
 const sw=Math.abs(W.tintFlowVel(out,X,Z,0)[0])+Math.abs(W.tintFlowVel(out,X,Z,0)[1]);
 ok('the swirl turns the water without gathering it (net flux '+flux.toExponential(1)+' against a speed of '+sw.toFixed(3)+' m/s)',Math.abs(flux)<.05*40*sw+1e-3&&sw>0);}

console.log(bad?bad+' FAILED':'OK');process.exit(bad?1:0);
