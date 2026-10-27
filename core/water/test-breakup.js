// node core/water/test-breakup.js — natural ripples on open and still water (core/water/ext/56, 2026-10-27; the owner: eastabyss's salt lake shaded in a
// regular grid). The shader's text against its twin, the regularity it breaks (with a negative), and that nothing moves without it.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const {glslProgram}=require('./glsl-interp.js');
const files=['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/21-core-water-shore.js',
 'core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js'];
global.window=global;
eval(files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=ATMOS,W=WATER,PW=A.PRESETS.waves;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
class Color{constructor(h){h=h==null?0:h;this.r=((h>>16)&255)/255;this.g=((h>>8)&255)/255;this.b=(h&255)/255;}getHexString(){return'000000';}}
class V2{constructor(x,y){this.x=x||0;this.y=y||0;}set(x,y){this.x=x;this.y=y;return this;}}
class V3{constructor(){this.x=0;this.y=0;this.z=0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}}
class F32{constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;this.updateRange={};}setUsage(){return this;}}
class BG{constructor(){this.attributes={};this.index=null;}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=Array.from(i);}computeBoundingSphere(){}}
class Mat{constructor(o){Object.assign(this,{transparent:false,depthWrite:true,userData:{},normalScale:new V2(1,1)},o||{});}customProgramCacheKey(){return'';}onBeforeCompile(){}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.position=new V3();this.name='';}raycast(){}}
const T3={Color,Vector2:V2,Vector3:V3,BufferGeometry:BG,InstancedBufferGeometry:BG,Float32BufferAttribute:F32,InstancedBufferAttribute:F32,MeshStandardMaterial:Mat,Mesh,DoubleSide:2,
 DataTexture:class{constructor(d,w,h){this.image={data:d,width:w,height:h};}},RGBAFormat:1,UnsignedByteType:1,LinearFilter:1,ClampToEdgeWrapping:1,
 Frustum:class{setFromProjectionMatrix(){}intersectsBox(){return true;}},Matrix4:class{multiplyMatrices(){}},Box3:class{constructor(){this.min=new V3();this.max=new V3();}}};
A.T=T3;A.h={scene:{add(){}},THREE:T3};A.U={waveTime:{value:0},waveAmp:{value:1},rain:{value:0}};A.hooks=[];A.skyEnv=null;
const FS='#include <common>\nvoid main(){\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_begin>\n#include <normal_fragment_maps>\n#include <emissivemap_fragment>\n',VS='#include <common>\n#include <begin_vertex>\n#include <project_vertex>\n';
const compiled=m=>{const sh={uniforms:{},vertexShader:VS,fragmentShader:FS};m.onBeforeCompile(sh,null);return{key:m.customProgramCacheKey(),fs:sh.fragmentShader};};

// the case: eastabyss's salt lake, its three swells and no share of the wave field, and a still pool
const SWELL=[[.05,22,35,0,.03],[.03,13,-50,1.3,.03],[.012,6,80,2.2,.02]];
const L=W.open({name:'lake',level:0,swell:SWELL,field:0,bounds:[-500,-500,500,500]}),P=W.still({name:'pool',level:0,bounds:[0,0,40,40]});
const dL0=W.draw(L,{}),dP0=W.drawStill(P,{}),k0=compiled(dL0.material),s0=compiled(dP0.material);
eval(fs.readFileSync(path.join(ROOT,'core/water/ext/56-core-water-breakup.js'),'utf8'));
ok('loading ext/56 changes no drawing (the lake\'s and the pool\'s shaders and keys as they were)',JSON.stringify(compiled(W.draw(L,{}).material))===JSON.stringify(k0)&&JSON.stringify(compiled(W.drawStill(P,{}).material))===JSON.stringify(s0),false);

// the twin and the text
{const t=211.7,G=glslProgram(A.waveGLSL()+'\n'+W.breakupGLSL({}),{atmWaveT:A.waveWrap(t),atmWaveAmp:PW.amp,cameraPosition:[0,0,0]});let e=0;
 let seed=9;const rnd=()=>{seed=(seed*1103515245+12345)>>>0;return seed/4294967296;};
 for(let i=0;i<120;i++){const x=-300+600*rnd(),z=-300+600*rnd(),n=L.normalAt(x,z,t,30,.02);e=Math.max(e,...G.run('wtrBreakup',n,[x,z]).map((v,k)=>Math.abs(v-W.breakup(n,x,z,A.waveWrap(t))[k])));}
 ok('wtrBreakup (the shader\'s text) equals WATER.breakup at 120 points on the lake ('+e.toExponential(1)+')',e<1e-12,false);}
// the regularity: the shading slope along a line, against itself one dominant wavelength (22 m) on
const corr=(fn)=>{const a=[],b=[];for(let x=-200;x<200;x+=.5){a.push(fn(x));b.push(fn(x+22));}const m=v=>v.reduce((s,q)=>s+q,0)/v.length,ma=m(a),mb=m(b);
 let c=0,va=0,vb=0;for(let i=0;i<a.length;i++){c+=(a[i]-ma)*(b[i]-mb);va+=(a[i]-ma)**2;vb+=(b[i]-mb)**2;}return c/Math.sqrt(va*vb);};
{const t=31.4,z=7,d=[Math.cos(35*Math.PI/180),Math.sin(35*Math.PI/180)],slope=n=>-(n[0]*d[0]+n[2]*d[1])/n[1];
 const reg=corr(x=>slope(L.normalAt(x*d[0],z+x*d[1],t,30,.02))),brk=corr(x=>{const px=x*d[0],pz=z+x*d[1];return slope(W.breakup(L.normalAt(px,pz,t,30,.02),px,pz,A.waveWrap(t)));});
 ok('the stripes break up: one wavelength on, the lake\'s slope repeats itself '+(100*reg).toFixed(0)+'% without the breakup and '+(100*brk).toFixed(0)+'% with it',brk<reg*.6&&reg>.4,false);
 const w=W.breakup([0,1,0],12,34,A.waveWrap(t));ok('...and still water gains ripples of its own (a flat normal leans '+(Math.acos(w[1])*180/Math.PI).toFixed(1)+' degrees), never far (under 10)',w[1]<1-1e-6&&Math.acos(w[1])<10*Math.PI/180,false);}
// the patch
{const D=W.draw(L,{}),Q=W.drawStill(P,{});const n=W.breakupAll({});const c=compiled(D.material),s=compiled(Q.material);
 ok('breakupAll patches the open and still drawings ('+n+'): wtrBreakup at the open water\'s position (vWtrP) and the pool\'s (vWtrW.xz), their keys apart',
  n>=4&&c.fs.includes('wtrBreakup(wtrBn,vWtrP)')&&s.fs.includes('wtrBreakup(wtrBn,vWtrW.xz)')&&c.key!==k0.key&&s.key!==s0.key&&c.fs.indexOf('wtrBreakup(wtrBn')>c.fs.indexOf('#include <normal_fragment_begin>'),false);
 /* the clock is declared once in each fragment: open water's fragment had none (its compile failed in the page: atmWaveT undeclared) */
 const decl=s=>(s.match(/uniform float atmWaveT;/g)||[]).length+(s.match(/#include <atmos_waves>/g)||[]).length;
 const after=t=>{const m=t.search(/#include <atmos_waves>|uniform float atmWaveT;/),b=t.indexOf('vec3 wtrBreakup(');return m>=0&&b>m&&b<t.indexOf('void main(');};
 ok('...the chunk comes after the clock\'s declaration and before main in both (the clock declared once in each: '+decl(c.fs)+', '+decl(s.fs)+'); first put after <common>, it ran ahead of the clock and the open water failed to compile in the page',
  after(c.fs)&&after(s.fs)&&decl(c.fs)===1&&decl(s.fs)===1,c.fs.indexOf('vec3 wtrBreakup(')<c.fs.search(/#include <atmos_waves>/));
 const before=compiled(D.material).fs;W.breakupOn(D.material,{amp:.2});ok('...once only (a second call changes nothing)',compiled(D.material).fs===before,false);}
console.log(bad?'\n'+bad+' FAILED':'\nall passed');process.exit(bad?1:0);
