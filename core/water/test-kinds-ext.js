// node core/water/test-kinds-ext.js — the planned biomes' water (core/water/ext/54 and 54b, 2026-10-26): the looks (Outlands brine, the Godthrone's
// blood water, the SW highlands' gin-clear river and karst springs), the salt pan, the ice with its salt rim and drifts, the bloodfalls out from
// under the ice, riverweed and comb-weed, the seep dam. Each check has a negative control; each shader chunk is run as text (glsl-interp.js) against
// its twin. First: loading the fragments moves nothing (the export of a scene made without them is the same after they load).
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const {glslProgram}=require('./glsl-interp.js');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const CORE=['core/rand/08-core-rand.js','core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js',
 'core/water/21-core-water-shore.js','core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js'];
const EXT=['core/water/ext/54-core-water-kinds-ext.js','core/water/ext/54b-core-water-kinds-ext-draw.js'];
global.window=global;
eval(CORE.map(rd).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;global.KRAND=KRAND;');
const A=ATMOS,W=WATER,PW=A.PRESETS.waves;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const fx=v=>v.toExponential(1),maxErr=(a,b)=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));

// ---------------------------------------------------------------- a three.js stub (test-rebuild.js's, with InstancedMesh)
class Color{constructor(h){h=h==null?0:h;this.r=((h>>16)&255)/255;this.g=((h>>8)&255)/255;this.b=(h&255)/255;}getHexString(){return'000000';}}
class V2{constructor(x,y){this.x=x||0;this.y=y||0;}set(x,y){this.x=x;this.y=y;return this;}}
class V3{constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}}
class BA{constructor(a,n){this.array=a;this.itemSize=n;}setUsage(){}}
class F32 extends BA{constructor(a,n){super(Float32Array.from(a),n);}}
class BG{constructor(){this.attributes={};this.index=null;}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=Array.from(i);}computeBoundingSphere(){}rotateX(){return this;}translate(){return this;}}
class Mat{constructor(o){Object.assign(this,{transparent:false,depthWrite:true,roughness:1,metalness:0,envMapIntensity:1,normalScale:new V2(1,1),userData:{}},o||{});this.color=new Color(this.color);}customProgramCacheKey(){return'';}onBeforeCompile(){}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.position=new V3();this.renderOrder=0;this.name='';}raycast(){}updateMatrixWorld(){}}
class IMesh extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={array:new Float32Array(16*n),needsUpdate:false};}}
class DataTexture{constructor(d,w,h){this.image={data:d,width:w,height:h};}}
const T3={Color,Vector2:V2,Vector3:V3,BufferGeometry:BG,Float32BufferAttribute:F32,InstancedBufferAttribute:BA,CircleGeometry:BG,MeshStandardMaterial:Mat,Mesh,InstancedMesh:IMesh,
 DataTexture,RGBAFormat:1,UnsignedByteType:1,LinearFilter:1,ClampToEdgeWrapping:1,DoubleSide:2};
const SCENE={children:[],add(m){this.children.push(m);}};
A.T=T3;A.h={scene:SCENE,THREE:T3};A.U={waveTime:{value:0},waveAmp:{value:1},rain:{value:0}};A.hooks=[];A.skyEnv=null;A.clock=A.clock||{t:0};
A.PRESETS.smoke=Object.assign(A.PRESETS.smoke||{},{spray:{index:0}});A.smoke=(list,o)=>({smoke:list,o});
const VS='#include <common>\n#include <beginnormal_vertex>\n#include <begin_vertex>\n#include <project_vertex>\n',FS='#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <metalnessmap_fragment>\n#include <normal_fragment_begin>\n#include <emissivemap_fragment>\n';
const compiled=m=>{const sh={uniforms:{},vertexShader:VS,fragmentShader:FS};m.onBeforeCompile(sh,null);return{key:m.customProgramCacheKey(),vs:sh.vertexShader,fs:sh.fragmentShader,uniforms:sh.uniforms};};
const GP=(text,t,extra)=>glslProgram(A.waveGLSL()+'\n'+text,Object.assign({atmWaveT:A.waveWrap(t),atmWaveAmp:PW.amp,cameraPosition:[0,0,0]},extra||{}));
// a texture as the GPU filters it (bilinear over the texel centres, clamped): W.tintSample's maths without its zero outside (the chunk tests that itself)
const texOf=M=>(s,uv)=>{const fx=uv[0]*M.nx-.5,fz=uv[1]*M.nz-.5,i0=Math.floor(fx),j0=Math.floor(fz),ax=fx-i0,az=fz-j0,C=(i,j,k)=>M.data[(Math.min(M.nz-1,Math.max(0,j))*M.nx+Math.min(M.nx-1,Math.max(0,i)))*4+k]/255;
 return[0,1,2,3].map(k=>(C(i0,j0,k)*(1-ax)+C(i0+1,j0,k)*ax)*(1-az)+(C(i0,j0+1,k)*(1-ax)+C(i0+1,j0+1,k)*ax)*az);};
let seed=4242;const rnd=()=>{seed=(seed*1103515245+12345)>>>0;return seed/4294967296;};

// ================================================================ 0. loading the fragments moves nothing
const O=W.open({name:'sea',swell:'ringsea',field:.5,bounds:[-200,-200,200,200]}),Fl=W.flow({name:'brook',pts:[[0,0,5],[50,0,4],[90,20,1]],width:5,speed:1}),
 Fa=W.fall({name:'drop',lip:[[0,0,30],[0,8,30]],dir:[1,0],drop:12}),St=W.still({name:'tank',level:2,bounds:[0,0,4,4],gradient:{centre:0x113344,rim:0x88aacc}});
const before=JSON.stringify(W.export()),presets0=JSON.stringify(W.PRESETS),draw0=compiled(W.drawStill(St,{}).material).fs;
eval(EXT.map(rd).join('\n'));
ok('loading ext/54 and 54b leaves the export of a scene made without them byte for byte ('+before.length+' chars), PRESETS and drawStill\'s shader as they were',
 JSON.stringify(W.export())===before&&JSON.stringify(W.PRESETS)===presets0&&compiled(W.drawStill(St,{}).material).fs===draw0,false);
const Wb=W.withLook(W.still({name:'tank2',level:2,bounds:[0,0,4,4]}),'brine');
ok('...negative: a surface given a look (and only it) gains a look record in the export; the looks are not in PRESETS',
 W.export().surfaces.find(s=>s.name==='tank2').look.preset==='brine'&&!W.export().surfaces.find(s=>s.name==='tank').look&&!('LOOKS' in W.PRESETS)&&!JSON.stringify(W.export().presets).includes('4e1c14'),false);

// ================================================================ 1. the looks
{const hx=c=>W.hexOf(c),br=t=>W.rampAt('brine',t);
 ok('brine: the ramp runs deep red-brown (t 0: #'+hx(br(0)).toString(16)+') to turquoise (t .62: green and blue over red) to a white rim (t 1: #'+hx(br(1)).toString(16)+')',
  hx(br(0))===0x4e1c14&&br(.62)[1]>br(.62)[0]&&br(.62)[2]>br(.62)[0]&&hx(br(1))===0xf2efe6&&br(0)[0]>br(0)[2],false);
 ok('...negative: the blood ramp is red at every t (r over g and b), the clear river green at every t (g the largest)',
  [0,.3,.6,.9,1].every(t=>{const c=W.rampAt('blood',t);return c[0]>c[1]&&c[0]>c[2];})&&[0,.5,1].every(t=>{const c=W.rampAt('clear',t);return c[1]>=c[0]&&c[1]>=c[2];}),[0,.5,1].some(t=>{const c=W.rampAt('blood',t);return c[1]>c[0];}));
 ok('clarity: the bed shows through 3 m of the gin-clear river ('+W.clarityAt('clear',3).toFixed(3)+') and not through 3 m of brine ('+W.clarityAt('brine',3).toFixed(3)+') or blood water ('+W.clarityAt('blood',3).toExponential(1)+')',
  W.clarityAt('clear',3)>.75&&W.clarityAt('brine',3)<.2&&W.clarityAt('blood',3)<.01,W.clarityAt('clear',0)!==1);
 const S=W.open({name:'salt lake',level:2241,bounds:[0,0,100,100],tint:W.lookTint({look:'brine',box:[0,0,100,100],cell:2,depth:(x,z)=>x/10})});
 const t0=S.tintAt(1,50),t1=S.tintAt(90,50),near=W.rampAt('brine',W.lookT('brine',.1)),deep=W.rampAt('brine',0);
 ok('lookTint: a salt lake 0 to 10 m deep is near-white at its edge ('+t0.slice(0,3).map(v=>v.toFixed(2))+') and red-brown in the deep ('+t1.slice(0,3).map(v=>v.toFixed(2))+') through WATER.open\'s own tint field',
  maxErr(t0.slice(0,3),near)<.02&&maxErr(t1.slice(0,3),deep)<.01&&t1[3]===1,maxErr(t0.slice(0,3),t1.slice(0,3))<.2);
 const d=W.lookDraw('clear','flow'),dO=W.lookDraw('brine','open',{roughness:.3}),dS=W.lookDraw('spring','still');
 ok('lookDraw: options for each drawing (the clear flow transparent in its mid colour, the brine open water deep and shallow from the ramp, o over them, a still\'s opacity)',
  d.transparent===true&&d.color===W.lookHex('clear',.45)&&dO.deep===W.lookHex('brine',0)&&dO.shallow===W.lookHex('brine',.7)&&dO.roughness===.3&&dS.opacity===.62,W.lookDraw('clear','flow',{transparent:false}).transparent!==false);
 const g=W.lookGradient('brine',{from:.1,to:.7});
 ok('lookGradient: two stops of the ramp as a still\'s gradient, which drawStill draws (its shader mixes the two)',g.centre===W.lookHex('brine',.1)&&g.rim===W.lookHex('brine',.7)&&
  /wtrStillT/.test(compiled(W.drawStill(W.still({name:'brine pool',level:0,bounds:[0,0,9,9],gradient:g}),{}).material).fs),g.centre===g.rim);
 let threw=false;try{W.rampAt('no such look',.5);}catch(e){threw=true;}ok('...a look that does not exist is refused',threw,false);}

// ================================================================ 2. the polygon cells (the pan's crust, the ice's cracks)
{const P=GP(W.cellsGLSL+'\nvec4 cells(vec2 p,float c,float j){return wtrCells(p,c,j);}\nfloat crack(vec2 p,float c,float j,float w){return wtrCrack(wtrCells(p,c,j),w);}',0);let e=0,e2=0,n=0,on=0,onWide=0;
 for(let i=0;i<300;i++){const x=-60+120*rnd(),z=-60+120*rnd(),C=W.cellsAt(x,z,3,.85),G=P.run('cells',[x,z],3,.85);e=Math.max(e,maxErr(C,G));e2=Math.max(e2,Math.abs(P.run('crack',[x,z],3,.85,.07)-W.crackOf(C,.07)));
  n++;if(W.crackOf(C,.07)>.5)on++;if(W.crackOf(C,.5)>.5)onWide++;}
 ok('wtrCells and wtrCrack (the shader\'s text) equal W.cellsAt and W.crackOf at 300 points ('+fx(e)+', '+fx(e2)+'); cracks are thin lines ('+(100*on/n).toFixed(1)+'% of the ground at width .07)',
  e<1e-9&&e2<1e-9&&on/n>.02&&on/n<.25,false);
 ok('...negative: a crack width of .5 cell covers far more ('+(100*onWide/n).toFixed(1)+'%)',onWide>on*2.5,false);
 const C=W.cellsAt(10.2,4.7,3,.85),C2=W.cellsAt(10.2+1e-3,4.7,3,.85);ok('the cells are a function of the point alone (the same index a millimetre away, f1 < f2)',C[2]===C2[2]&&C[3]===C2[3]&&C[0]<=C[1],false);}

// ================================================================ 3. the salt pan (Outlands C5)
{const P=W.pan({name:'pan',bounds:[0,0,60,60],level:2241}),G=GP(W.panGLSL(P)+'\nvec4 pan(vec2 p,float w){return wtrPan(p,w);}',0);let e=0;const film={};
 for(const wet of[0,.2,.6,1]){let f5=0;for(let i=0;i<200;i++){const x=60*rnd(),z=60*rnd(),a=W.panAt(P,x,z,wet),g=G.run('pan',[x,z],wet);e=Math.max(e,maxErr(a.colour.concat([a.film]),g));if(a.film>.5)f5++;}film[wet]=f5/200;}
 ok('wtrPan (the shader\'s text) equals W.panAt\'s colour and film at 800 points over four wetnesses ('+fx(e)+')',e<1e-9,false);
 ok('the brine spreads as the weather wets: the share under a film '+Object.keys(film).map(k=>k+': '+(100*film[k]).toFixed(0)+'%').join(', ')+'; dry crust has none',
  film[0]===0&&film[.2]>0&&film[.6]>film[.2]&&film[1]>film[.6]&&film[1]<.9,false);
 let crackWet=1,dryIs=1;for(let i=0;i<400;i++){const x=60*rnd(),z=60*rnd(),a=W.panAt(P,x,z,.35);if(a.crack>.999)crackWet=Math.min(crackWet,a.film);const d=W.panAt(P,x,z,0);if(d.crack>.999)dryIs=Math.min(dryIs,W.hexOf(d.colour)===W.hexOf(W.rgbOf(P.colours.crack))?1:0);}
 ok('the cracks wet first: at wetness .35 every crack line is under brine (least film on a crack '+crackWet.toFixed(3)+'), and dry it is the crack colour',crackWet>.99&&dryIs===1,false);
 const pts=[];for(let i=0;i<300;i++)pts.push([60*rnd(),60*rnd()]);
 const P1=W.pan({name:'pan wet',bounds:[0,0,60,60],level:2241,wet:1}),P0=W.pan({name:'pan dry',bounds:[0,0,60,60],level:2241,wet:0});
 const hw=pts.map(p=>P1.heightAt(p[0],p[1])).filter(h=>h!=null);
 ok('heightAt: after rain the flooded cells hold brine ('+hw.length+' of 300 points, at level + film: max '+(Math.max(...hw)-2241).toFixed(3)+' m), dry the pan holds none, and off the pan none',
  hw.length>30&&hw.every(h=>h>2241&&h<=2241+P1.film+1e-12)&&pts.every(p=>P0.heightAt(p[0],p[1])==null)&&P1.heightAt(-5,5)==null,false);
 A.W={wet:.8};const P3=W.pan({name:'far pan',bounds:[1000,1000,1060,1060],level:0});ok('...the pan follows the weather (W.wet, core/atmos) when it is not given a wetness ('+P.wetNow()+'); WATER.at finds a pan only where no other water is (it ranks last)',P.wetNow()===.8&&W.at(30,30)!==P&&W.at(1030,1030)===P3,P1.wetNow()!==1);
 const D=W.drawPan(P,{}),c=compiled(D.material);A.W={wet:.3};A.hooks.forEach(h=>h(0,12,0));
 ok('drawPan: the pan\'s chunk in the fragment, its colour and roughness from it, the wetness uniform following W.wet each frame ('+D.uniforms.wtrPanWet.value+')',
  c.fs.includes('vec4 wtrPan(')&&/diffuseColor\.rgb=wtrPn\.rgb/.test(c.fs)&&/roughnessFactor=mix\(0\.85,0\.08/.test(c.fs)&&c.uniforms.wtrPanWet===D.uniforms.wtrPanWet&&D.uniforms.wtrPanWet.value===.3&&D.mesh.name==='water:pan',
  compiled(W.drawPan(W.pan({name:'pan2',bounds:[0,0,9,9],cell:5}),{}).material).key===c.key);
 const ex=W.export().surfaces.find(s=>s.name==='pan');ok('the export carries the pan\'s record (kind, cell, crack, flood, colours, the brine colour)',ex.kind==='pan'&&ex.cell===3&&ex.flood===.55&&ex.brine.length===3&&ex.colours.salt==='#efeae0',false);
 A.W=null;}

// ================================================================ 4. the ice (C7): black ice, a salt rim, drifts by cell
{const poly=W.circlePoly(0,0,160,32),I=W.ice({name:'tarn',poly,level:4100,rim:{salt:true},drifts:{wind:30},seed:91}),I2=W.ice({name:'tarn again',poly,level:4100,rim:{salt:true},drifts:{wind:30},seed:91});
 ok('the drifts are placed by cell from the seed (KRAND.hash, never draw order): '+I.drifts.length+' drifts, the same twice',I.drifts.length>20&&JSON.stringify(I.drifts)===JSON.stringify(I2.drifts),
  JSON.stringify(W.ice({name:'other',poly,level:4100,drifts:{wind:30},seed:92}).drifts)===JSON.stringify(I.drifts));
 const big=W.ice({name:'big',poly:W.circlePoly(0,0,400,48),level:4100,drifts:{wind:30},seed:91}),key=d=>d.x.toFixed(9)+','+d.z.toFixed(9),bs=new Set(big.drifts.map(key));
 ok('...a larger lake keeps every drift of the smaller one inside it (the cells do not depend on the box): '+I.drifts.filter(d=>bs.has(key(d))).length+' of '+I.drifts.length,I.drifts.every(d=>bs.has(key(d))),false);
 const d0=I.drifts[0],rimE=I.rimAt(160*Math.cos(.1)*.999,160*Math.sin(.1)*.999),rimI=I.rimAt(0,0);
 ok('a drift stands on the ice (heightAt at its centre '+(I.heightAt(d0.x,d0.z)-4100).toFixed(3)+' m over the level = its depth), steep on the lee; off the ice null',
  Math.abs(I.heightAt(d0.x,d0.z)-4100-d0.depth)<1e-9&&I.heightAt(500,0)==null&&W.driftShape(d0,d0.x+Math.cos(d0.yaw)*d0.len*.25,d0.z+Math.sin(d0.yaw)*d0.len*.25)<W.driftShape(d0,d0.x-Math.cos(d0.yaw)*d0.len*.25,d0.z-Math.sin(d0.yaw)*d0.len*.25),false);
 ok('the salt rim is white at the shore ('+rimE.toFixed(3)+') and gone a rim-width in ('+rimI+'); without salt there is none',rimE>.99&&rimI===0&&W.ice({name:'fresh',poly,level:0,drifts:false}).rimAt(160*.999,0)===0,false);
 const M=I.bake(2),G=GP(W.iceGLSL(I,M)+'\nvec3 ice(vec2 p){return wtrIce(p);}',0,{texture2D:texOf(M),wtrIceMap:0});let e=0;
 for(let i=0;i<300;i++){const x=-170+340*rnd(),z=-170+340*rnd();e=Math.max(e,maxErr(G.run('ice',[x,z]),W.iceShade(I,M,x,z)));}
 const onD=W.iceShade(I,M,d0.x,d0.z),snow=W.rgbOf(I.colours.snow);
 ok('wtrIce (the shader\'s text, the bake as its texture) equals W.iceShade at 300 points ('+fx(e)+'); white over a drift, dark ice between',e<1e-9&&maxErr(onD,snow)<.05&&W.iceColour(I,0,0,0)[0]<.15,false);
 ok('...negative: the bake\'s colour is the exact colour where the field is smooth (it differs from colourAt by under 0.05 a channel at the drift centre: '+fx(maxErr(onD,I.colourAt(d0.x,d0.z)))+'), and an ice without salt draws no rim',
  maxErr(onD,I.colourAt(d0.x,d0.z))<.05&&!W.iceGLSL(W.ice({name:'fresh2',poly,level:0,drifts:false}),M).includes(W.rgbOf(I.colours.salt).map(v=>String(v))[0]+','),false);
 const DM=W.driftMesh(I,{res:6,lift:.01}),ys=[];for(let i=1;i<DM.pos.length;i+=3)ys.push(DM.pos[i]);
 ok('driftMesh: '+DM.count+' vertices ('+I.drifts.length+' drifts x 49), from the ice (+ lift) to the deepest drift',DM.count===I.drifts.length*49&&Math.abs(Math.min(...ys)-4100.01)<1e-6&&Math.max(...ys)-4100.01<=I.maxDrift+1e-9&&Math.max(...ys)-4100.01>I.maxDrift*.8&&DM.idx.length===I.drifts.length*216,false);
 const D=W.drawIce(I,{}),c=compiled(D.material),D2=W.drawIce(W.ice({name:'bare',poly,level:0,drifts:false}),{});
 ok('drawIce: the ice\'s chunk and its bake as a texture, the drifts as a second mesh; an ice without drifts draws one mesh',c.fs.includes('vec3 wtrIce(')&&c.uniforms.wtrIceMap.value===D.texture&&D.drifts&&D.drifts.name==='water:tarn drifts',!!D2.drifts);
 const ex=W.export().surfaces.find(s=>s.name==='tarn');ok('the export carries the ice and every drift record (Godot places them as they are)',ex.kind==='ice'&&ex.drifts.length===I.drifts.length&&ex.rim.salt===true&&ex.maxDrift===I.maxDrift,false);}

// ================================================================ 5. the bloodfalls (the Godthrone)
{ok('rust: none at the mouth, 1 - 1/e after tau seconds in the air',W.rustAt(0,3)===0&&Math.abs(W.rustAt(3,3)-(1-Math.exp(-1)))<1e-15,W.rustAt(-1,3)!==0);
 const mouth=[100,200,5400],B=W.underIceFall({name:'bloodfalls',mouth,dir:[0,1],width:4,drop:24,foot:[100,214,5376],ice:{top:5440},seed:7});
 const fresh=W.rgbOf(W.LOOKS.blood.fresh),c0=B.colourAt(0),c1=B.colourAt(1);
 ok('the curtain is fresh grey-green at the mouth (rust '+B.rustF(0).toFixed(3)+') and blood-red at its foot (rust '+B.rustF(1).toFixed(3)+'; #'+W.hexOf(c1).toString(16)+')',
  B.rustF(0)<.2&&B.rustF(1)>.7&&c1[0]>2*c1[1]&&maxErr(c0,fresh)<.1,maxErr(c0,c1)<.2);
 const R=W.rustGLSL(B),P=GP('vec3 run(vec3 base,float fy){vec4 diffuseColor=vec4(base,1.0);vec2 vWtrUF=vec2(0.5,fy);'+R+'return diffuseColor.rgb;}',0);let e=0;
 for(const fy of[0,.1,.33,.5,.77,1])e=Math.max(e,maxErr(P.run('run',W.rampAt('blood',.8),fy),B.colourAt(fy)));
 ok('the rust line (the shader\'s text over the curtain\'s colour) equals B.colourAt down the fall ('+fx(e)+')',e<1e-9,false);
 ok('the fall leaves from under the ice: a lip across the mouth at its height, down a face to the foot (W.fall face), its colour record a look',
  B.fall.lip[0][2]===5400&&Math.abs(B.fall.lipW-4)<1e-9&&B.fall.face&&B.fall.face[B.fall.face.length-1]===-24&&B.fall.look.preset==='blood',false);
 ok('the stain: on the face under the mouth ('+B.stainAt(100,5390,201).toFixed(2)+'), on the fan below the foot ('+B.stainAt(100,5376.2,220).toFixed(2)+'), a little above the mouth on the ice ('+B.stainAt(100,5401,200).toFixed(2)+')',
  B.stainAt(100,5390,201)>.99&&B.stainAt(100,5376.2,220)>.3&&B.stainAt(100,5401,200)>0,false);
 ok('...negative: none beside the curtain ('+B.stainAt(130,5390,201)+'), high on the ice ('+B.stainAt(100,5430,200)+') or past the fan ('+B.stainAt(100,5376,214+B.stain.length+1)+')',
  B.stainAt(130,5390,201)===0&&B.stainAt(100,5430,200)===0&&B.stainAt(100,5376,214+B.stain.length+1)===0,false);
 const B2=W.underIceFall({name:'bloodfalls2',mouth,dir:[0,1],width:4,drop:24,foot:[100,214,5376],seed:7});
 ok('icicles over the mouth ('+B.icicles.length+'), the same from the same seed, red-stained near the mouth only',JSON.stringify(B.icicles)===JSON.stringify(B2.icicles)&&B.icicles.every(i=>i.y>5400)&&B.icicles.some(i=>i.stain>.9)&&B.icicles.some(i=>i.stain<.1),
  JSON.stringify(W.underIceFall({name:'bf3',mouth,dir:[0,1],width:4,drop:24,foot:[100,214,5376],seed:8}).icicles)===JSON.stringify(B.icicles));
 ok('the red pool at the foot is a still with the blood gradient (WATER.at finds it), and the rust terraces step down the fan',W.at(100,214)===B.pool&&B.pool.gradient.centre===W.lookHex('blood',.2)&&B.terraces.length===4,false);
 const D=W.drawBloodFall(B,{}),c=compiled(D.material),D0=W.drawFall(W.fall({name:'plain',lip:B.fall.lip,dir:[0,1],drop:24}),{}),c0f=compiled(D0.material);
 ok('drawBloodFall: the fall\'s own shader with the rust line before its foam, its key apart, the pool drawn',c.fs.indexOf(R)>0&&c.fs.indexOf(R)<c.fs.indexOf('wtrFallFoam(vWtrUF.y')&&c.key!==c0f.key&&c.key.startsWith(c0f.key.split(':')[0])&&D.pool&&D.pool.mesh,c0f.fs.includes(R));
 const gx=W.export().groups.find(g=>g.kind==='bloodfall');ok('the export lists the bloodfall group (the fall\'s and the pool\'s ids, the stain, the icicles)',gx&&gx.fall===B.fall.id&&gx.pool===B.pool.id&&gx.icicles.length===B.icicles.length,false);}

// ================================================================ 6. riverweed and comb-weed
{const pts=[[0,0,100],[60,0,99],[90,0,95],[140,0,94.5],[200,10,94]],F=W.flow({name:'red river',pts,width:10,speed:[1,1,1.6,.2,.2]}),R=W.weed(F,{look:'bloodriver'});
 const F2=W.flow({name:'red river',pts:pts.concat([[260,20,92]]),width:10,speed:[1,1,1.6,.2,.2,.2]}),R2=W.weed(F2,{look:'bloodriver'});
 ok('riverweed down the red river: '+R.length+' blades, the same twice, and a longer line keeps the shorter one\'s weed (each step indexed by its place)',
  R.length>200&&JSON.stringify(R)===JSON.stringify(W.weed(F,{look:'bloodriver'}))&&JSON.stringify(R2.slice(0,R.length))===JSON.stringify(R),JSON.stringify(W.weed(F,{look:'bloodriver',seed:5}))===JSON.stringify(R));
 const inR=R.every(r=>{const n=F.nearest(r.x,r.z);return n.d<=5+.76;}),col=new Set(R.map(r=>r.c));
 ok('every blade lies in the river (within its half width of the line) and under the surface, in the riverweed\'s crimsons and purples ('+[...col].join(' ')+')',inR&&R.every(r=>r.y<F.heightAt(r.x,r.z))&&[...col].every(c=>W.LOOKS.bloodriver.weed.colours.includes(c)),false);
 const at=(L,a,b)=>L.filter(r=>r.x>=a&&r.x<b).length/((b-a)/1.5);
 ok('denser in the rapids (60 to 90 m, slope .13: '+at(R,62,88).toFixed(2)+' a step) than on the flat ('+at(R,95,135).toFixed(2)+')',at(R,62,88)>at(R,95,135)*1.25,false);
 const C=W.weed(F,{look:'clear'});ok('comb-weed (the gin-clear rivers) only where the current runs over .3 m/s: '+C.length+' blades, none in the slow reach past 140 m',C.length>0&&C.every(r=>r.x<142),R.every(r=>r.x<142));
 let threw=false;try{W.weed(F,{look:'brine'});}catch(e){threw=true;}ok('...a look without weed is refused',threw,false);
 const D=W.drawWeed(R,{}),c=compiled(D.material),M=D.mesh.instanceMatrix.array,P=GP(W.weedGLSL(.12),211.7);let e=0;
 for(let i=0;i<40;i++){const x=200*rnd(),z=20*rnd(),u=rnd();e=Math.max(e,Math.abs(P.run('wtrWeedSway',[x,z],u)-W.weedSway(x,z,A.waveWrap(211.7),u,.12)));}
 ok('drawWeed: one instanced mesh, each blade at its root along its yaw (instance 7 at '+[M[7*16+12],M[7*16+13],M[7*16+14]].map(v=>v.toFixed(2))+'), coloured, the sway (the shader\'s text) equal to W.weedSway ('+fx(e)+')',
  D.mesh.count===R.length&&Math.abs(M[7*16+12]-R[7].x)<1e-3&&Math.abs(M[7*16+14]-R[7].z)<1e-3&&D.mesh.instanceColor.array.length===R.length*3&&c.vs.includes('wtrWeedSway(wtrRt,position.x)')&&e<1e-9,false);}

// ================================================================ 7. the seep dam (the SW highlands' landslide lake)
{const bed=(x,z)=>2878-281*Math.max(0,Math.min(1,(-z-50)/1500))*Math.exp(-Math.pow((x-300)/250,2));
 const o={name:'Sarez',crest:[[0,0],[300,-10],[600,0]],crestY:3000,toeY:2700,level:2878,dir:[0,1],thickness:500,valley:[[300,-80],[310,-2000]],snags:{count:12,width:80},bed,seed:3};
 const D=W.seepDam(o),D2=W.seepDam(Object.assign({},o,{name:'Sarez again'}));
 let threw='';try{W.seepDam(Object.assign({},o,{level:2999}));}catch(e){threw=e.message;}
 ok('it seeps and never spills: a lake within the freeboard of the crest is refused ('+threw.slice(0,60)+'...)',/spill/.test(threw),false);
 let ok2=true;try{W.seepDam(Object.assign({},o,{name:'low',level:2990,freeboard:5}));}catch(e){ok2=false;}ok('...negative: 10 m under the crest with a 5 m freeboard is a dam',ok2,false);
 ok('springs low on the downstream face ('+D.springs.length+': '+D.springs.map(s=>s.y.toFixed(0)).join(', ')+' m), under the lake and over the toe, their seep summing to the total',
  D.springs.every(s=>s.y<2878&&s.y>2700&&s.d>0&&s.d<250)&&Math.abs(D.springs.reduce((a,s)=>a+s.q,0)-1)<1e-12&&JSON.stringify(D.springs)===JSON.stringify(D2.springs),false);
 ok('a thread fall from each spring down the dam\'s face to the toe (lips at the springs, the face from the ground, the foot on the toe)',
  D.threads.length===D.springs.length&&D.threads.every((F,k)=>F.kind==='fall'&&F.lip[0][2]===D.springs[k].y&&F.foot[2]===2700&&F.face&&Math.abs(F.face[F.face.length-1]-(2700-D.springs[k].y))<1e-9),false);
 const gc=D.groundAt(300,-10),gt=D.groundAt(300,-10+249.9);
 ok('groundAt: the crest on top ('+gc.toFixed(1)+' m, hummocks on it), the toe at the downstream edge ('+gt.toFixed(1)+'), null off the dam; '+D.hummocks.length+' hummocks',gc>=3000&&Math.abs(gt-2700)<10&&D.groundAt(300,400)==null,false);
 const s0=D.springs[0];ok('the wet face: a streak below each spring ('+D.seepAt(s0.x,s0.z+5).toFixed(2)+'), dry between them and above them',D.seepAt(s0.x,s0.z+5)>.9&&D.seepAt(s0.x,s0.z-30)===0&&D.seepAt(s0.x,s0.z+5,s0.y+5)===0,false);
 ok('drowned trees along the old valley ('+D.snags.length+'), each where the lake is between 1 m and its height deep, so its top stands out of the water',D.snags.length>0&&D.snags.every(s=>2878-s.y0>=1&&2878-s.y0<=s.h-.5),false);
 const gx=W.export().groups.find(g=>g.name==='Sarez');ok('the export lists the dam (springs, the threads\' ids, hummocks, snags)',gx&&gx.threads.length===D.threads.length&&gx.snags.length===D.snags.length,false);}

// ================================================================ 8. a karst spring and the gin-clear stream
{const K=W.karstSpring({name:'Blue Eye',at:[500,-500,410],r:7,dir:[0,1],run:80,seed:2});
 ok('the spring pool is a still at the vent (WATER.at), its boil the fountain\'s rings at the vent, its colour the spring look\'s gradient',W.at(500,-500)===K.pool&&K.pool.fountain[0]===500&&K.pool.gradient.centre===W.lookHex('spring',0)&&/wtrStillN/.test(W.stillGLSL(K.pool))&&W.stillGLSL(K.pool).includes('dv=p-vec2(500.0,-500.0)'),
  W.stillGLSL(W.karstSpring({name:'still eye',at:[700,-500,400],boil:false}).pool).includes('dv=p-vec2'));
 ok('the stream leaves at the outlet, falling, with the clear look (lookDraw gives its drawing), in the export as a group',W.at(500,-460)===K.flow&&K.flow.look.preset==='clear'&&K.flow.pts[1].y<410&&W.export().groups.some(g=>g.kind==='karstspring'&&g.flow===K.flow.id),false);}

console.log(bad?'\n'+bad+' FAILED':'\nall passed');process.exit(bad?1:0);
