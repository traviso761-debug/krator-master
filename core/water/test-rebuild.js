// node core/water/test-rebuild.js — core/water's final-rebuild items (2026-10-26): W1 the curtain's clean sides (a margin and a side fade in
// metres), W2 spray scaled to the drop, W3 a fall that follows a sloped face, W4 drawPools' gradient, W5 WATER.rideGLSL / rideOn (instanced
// floaters heave on the GPU), R9 wetness (Lagarde), puddles in baked hollows and rain rings (WATER.rainRippleGLSL) on puddles and water, the
// rain-cover hook. Each new function against its twin (the shader's own text run in glsl-interp.js) and with a negative control; each option's
// absence leaves the old text (test-gaps.js holds the snapshot of every default).
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const {glslProgram}=require('./glsl-interp.js');
const files=['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/21-core-water-shore.js',
 'core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js','core/water/ext/53-core-water-terraces.js','core/water/ext/53b-core-water-terraces-draw.js'];
global.window=global;
eval(files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=ATMOS,W=WATER,PW=A.PRESETS.waves;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const fx=v=>v.toExponential(1);

// ---------------------------------------------------------------- a three.js stub (test-gaps.js's): what the drawings touch
class Color{constructor(h){h=h==null?0:h;this.r=((h>>16)&255)/255;this.g=((h>>8)&255)/255;this.b=(h&255)/255;}}
class V2{constructor(x,y){this.x=x||0;this.y=y||0;}set(x,y){this.x=x;this.y=y;return this;}}
class V3{constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}}
class V4{constructor(x,y,z,w){this.x=x||0;this.y=y||0;this.z=z||0;this.w=w||0;}set(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w;return this;}}
class BA{constructor(a,n){this.array=a;this.itemSize=n;this.updateRange={};}setUsage(){}}
class F32 extends BA{constructor(a,n){super(Float32Array.from(a),n);}}
class BG{constructor(){this.attributes={};this.index=null;}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=Array.from(i);}computeBoundingSphere(){}rotateX(){return this;}translate(){return this;}}
class Mat{constructor(o){Object.assign(this,{transparent:false,depthWrite:true,roughness:1,metalness:0,envMapIntensity:1,normalScale:new V2(1,1),userData:{}},o||{});}customProgramCacheKey(){return'';}onBeforeCompile(){}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.position=new V3();this.renderOrder=0;this.name='';}raycast(){}updateMatrixWorld(){}}
class DataTexture{constructor(d,w,h){this.image={data:d,width:w,height:h};}}
const T3={Color,Vector2:V2,Vector3:V3,Vector4:V4,BufferGeometry:BG,InstancedBufferGeometry:BG,Float32BufferAttribute:F32,InstancedBufferAttribute:BA,CircleGeometry:BG,
 MeshStandardMaterial:Mat,MeshLambertMaterial:Mat,Mesh,DataTexture,DynamicDrawUsage:1,RGBAFormat:1,UnsignedByteType:1,LinearFilter:1,ClampToEdgeWrapping:1,DoubleSide:2,
 Frustum:class{setFromProjectionMatrix(){}intersectsBox(){return true;}},Matrix4:class{multiplyMatrices(){}},Box3:class{constructor(){this.min=new V3();this.max=new V3();}}};
const SCENE={children:[],add(m){this.children.push(m);}};
A.T=T3;A.h={scene:SCENE,THREE:T3};A.U={waveTime:{value:0},waveAmp:{value:1},rain:{value:0}};A.hooks=A.hooks||[];A.skyEnv=null;
A.PRESETS.smoke=Object.assign(A.PRESETS.smoke||{},{spray:{index:0}});A.smoke=(list,o)=>({smoke:list,o});A.clock=A.clock||{t:0};
const VS='#include <common>\n#include <beginnormal_vertex>\n#include <begin_vertex>\n#include <project_vertex>\n',FS='#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <metalnessmap_fragment>\n#include <normal_fragment_begin>\n#include <emissivemap_fragment>\n';
const compiled=m=>{const sh={uniforms:{},vertexShader:VS,fragmentShader:FS};m.onBeforeCompile(sh,null);return{key:m.customProgramCacheKey(),vs:sh.vertexShader,fs:sh.fragmentShader,uniforms:sh.uniforms};};
const GP=(text,t,extra)=>glslProgram(A.waveGLSL()+'\n'+text,Object.assign({atmWaveT:A.waveWrap(t),atmWaveAmp:PW.amp,cameraPosition:[0,0,0]},extra||{}));
const texOf1=M=>(s,uv)=>{const fx=uv[0]*M.nx-.5,fz=uv[1]*M.nz-.5,i0=Math.floor(fx),j0=Math.floor(fz),ax=fx-i0,az=fz-j0,C=(i,j)=>M.data[Math.min(M.nz-1,Math.max(0,j))*M.nx+Math.min(M.nx-1,Math.max(0,i))]/255;
 const v=(C(i0,j0)*(1-ax)+C(i0+1,j0)*ax)*(1-az)+(C(i0,j0+1)*(1-ax)+C(i0+1,j0+1)*ax)*az;return[v,0,0,1];};

// ================================================================ W1: the curtain's sides
{const F=W.fall({name:'w1',lip:[[0,0,30],[0,12,30]],dir:[1,0],speed:2,drop:20});
 const C0=W.curtain(F,{}),C1=W.curtain(F,{margin:1.5});
 const a=[C1.pos[0],C1.pos[1],C1.pos[2]],b=[C1.pos[C1.cols*3],C1.pos[C1.cols*3+1],C1.pos[C1.cols*3+2]];
 ok('W1: a margin of 1.5 m widens the curtain 1.5 m past each end of the lip (top row from z '+a[2].toFixed(3)+' to '+b[2].toFixed(3)+'), u from '+C1.uv[0].toFixed(3)+' to '+C1.uv[C1.cols*2].toFixed(3)+', the same vertex count',
  Math.abs(a[2]+1.5)<1e-9&&Math.abs(b[2]-13.5)<1e-9&&Math.abs(C1.uv[0]+1.5/12)<1e-12&&C1.count===C0.count,false);
 ok('...without one the arrays are the old ones (u 0..1, the lip\'s ends)',JSON.stringify(C0)===JSON.stringify(W.curtain(F,{margin:0}))&&C0.uv[0]===0&&C0.pos[2]===0,JSON.stringify(C0)===JSON.stringify(C1));
 const opt=W.sideOpt({rows:28,cols:6},{margin:1.5,edge:2}),txt=W.sideGLSL(opt,'12.0'),P=GP('float side(vec2 vWtrUF){return '+txt+';}',0);let e=0;
 for(const u of[-.125,-.05,0,.04,.1,.3,.5,.9,1.05,1.125])e=Math.max(e,Math.abs(P.run('side',[u,.5])-W.curtainSide(u,12,1.5,2)));
 ok('W1: the side fade in metres (the shader\'s text) equals W.curtainSide ('+fx(e)+'): 0 at the margin\'s edge ('+W.curtainSide(-.125,12,1.5,2)+'), 1 two metres in ('+W.curtainSide(2/12,12,1.5,2)+')',
  e<1e-12&&W.curtainSide(-.125,12,1.5,2)===0&&W.curtainSide(2/12,12,1.5,2)===1,false);
 ok('...negative: the old fade over 8% of u is not it ('+Math.abs(GP('float side(vec2 vWtrUF){return '+W.sideGLSL({},'12.0')+';}',0).run('side',[.04,.5])-W.curtainSide(.04,12,1.5,2)).toFixed(3)+' off at u .04); with no option the text is the old one',
  W.sideGLSL({},'12.0')==='smoothstep(0.0,0.08,vWtrUF.x)*smoothstep(1.0,0.92,vWtrUF.x)'&&Math.abs(GP('float side(vec2 vWtrUF){return '+W.sideGLSL({},'12.0')+';}',0).run('side',[.04,.5])-W.curtainSide(.04,12,1.5,2))>.05,false);
 const D=W.drawFall(F,{margin:1.5}),c=compiled(D.material),D0=W.drawFall(W.fall({name:'w1b',lip:[[0,0,30],[0,12,30]],dir:[1,0],speed:2,drop:20}),{});
 ok('W1: drawFall({margin}) draws the wide curtain with the metre fade, records it for the export (curtain '+JSON.stringify(F.curtainOpt)+') and keys its program apart',
  /min\(vWtrUF\.x,1\.0-vWtrUF\.x\)\*12\.0/.test(c.fs)&&F.curtainOpt.margin===1.5&&W.export().surfaces.find(s=>s.name==='w1').curtain.margin===1.5&&c.key!==compiled(D0.material).key,/min\(vWtrUF/.test(compiled(D0.material).fs));
 const L=[W.fall({name:'w1c',lip:[[50,0,30],[50,8,30]],dir:[1,0],speed:2,drop:12}),W.fall({name:'w1d',lip:[[90,0,20],[90,20,20]],dir:[1,0],speed:2,drop:6})];
 const DD=W.drawFalls(L,{margin:1.2}),cf=compiled(DD.mesh.material).fs;
 ok('W1: drawFalls({margin}) widens every curtain (the merged arrays: '+DD.merged.curtain.uv[0].toFixed(4)+' = -1.2/8) and fades by each fall\'s own lip width (from its streak scale)',
  Math.abs(DD.merged.curtain.uv[0]+1.2/8)<1e-9&&/min\(vWtrUF\.x,1\.0-vWtrUF\.x\)\*\(vWtrFP\.x\*/.test(cf)&&L[1].curtainOpt.margin===1.2,!/vWtrFP\.x\*/.test(cf));
 const CF=W.flow({name:'w1chute',pts:[[0,0,40],[10,0,40],[14,0,20],[22,0,20]],width:6,speed:1}),fc=compiled(W.drawFlow(CF,{chute:.35}).material),rec=CF.ribbonOpt.chute,fo=compiled(W.drawFlow(CF,{chute:.35,transparent:false}).material),f0=compiled(W.drawFlow(CF,{}).material);
 ok('W1: drawFlow({chute}) lets the ribbon give way down a chute steeper than the falls\' steep (faded when transparent, discarded when opaque), records it, keys it apart; without it the old text',
  /1\.0-smoothstep\(0\.297\d*,0\.35,vWtrS\)/.test(fc.fs)&&/if\(vWtrS>=0\.35\)discard;/.test(fo.fs)&&rec===.35&&fc.key!==f0.key&&!/1\.0-smoothstep\([^)]*,vWtrS\)/.test(f0.fs)&&!/discard/.test(f0.fs),/discard/.test(f0.fs));
 W.surfaces.length=0;W.drawn.length=0;}

// ================================================================ W2: spray scaled to the drop
{const big=W.fall({name:'w2big',lip:[[0,-13,90],[0,13,90]],dir:[-1,0],speed:2,drop:70,foot:[-30,0,20],fit:true,spread:6}),small=W.fall({name:'w2s',lip:[[0,0,5],[0,10,5]],dir:[1,0],speed:2,drop:2.5}),
  mid=W.fall({name:'w2m',lip:[[0,0,10],[0,18,10]],dir:[1,0],speed:2,drop:6});
 const pb=W.fallSpray(big),ps=W.fallSpray(small),pm=W.fallSpray(mid),P=W.plunge(big),ys=pb.map(p=>p[1]);
 ok('W2: a 70 m fall throws '+pb.length+' emitters in a column '+(Math.max(...ys)-Math.min(...ys)).toFixed(1)+' m tall over its foot (max 24); a 6 m fall '+pm.length+' at one height; a 2.5 m one, '+ps.length,
  pb.length>=12&&pb.length<=24&&Math.max(...ys)-Math.min(...ys)>15&&new Set(pm.map(p=>p[1])).size===1&&pm.length>=2&&ps.length===1,pb.length===3);
 ok('...deterministic and inside the plunge\'s reach: every emitter within '+(P.r*1.5).toFixed(1)+' m of the curtain\'s foot line; max: 6 caps it ('+W.fallSpray(big,{max:6}).length+')',
  JSON.stringify(pb)===JSON.stringify(W.fallSpray(big))&&pb.every(p=>Math.abs(p[0]-P.x)<=P.r*1.5)&&W.fallSpray(big,{max:6}).length<=6,false);
 const D=W.drawFall(big,{spray:'drop'}),D0=W.drawFall(mid,{});
 ok('W2: drawFall({spray: \'drop\'}) hands core/atmos '+D.spray.smoke.length+' emitters; with no option the three fixed ones ('+D0.spray.smoke.length+')',D.spray.smoke.length===pb.length&&D0.spray.smoke.length===3,D.spray.smoke.length===3);
 W.surfaces.length=0;W.drawn.length=0;}

// ================================================================ W3: a fall that follows a sloped face
{const lip=[[2092,-13,90],[2092,13,90]],foot=[2000,0,20];
 const arc=W.fall({name:'arc',lip,dir:[-1,0],drop:70,foot,fit:true}),face=W.fall({name:'face',lip,dir:[-1,0],drop:70,foot,fit:true,face:true});
 const mA=arc.curtainAt(.5,.5),mF=face.curtainAt(.5,.5),fA=arc.curtainAt(.5,1),fF=face.curtainAt(.5,1);
 ok('W3: the fitted ARC half way along hovers '+(mA[1]-55).toFixed(1)+' m over the straight face from lip to foot; the FACE fall is on it ('+(mF[1]-55).toFixed(3)+' m), and both land on the foot ('+fF.map(v=>v.toFixed(2))+')',
  Math.abs(mA[1]-55-17.5)<.5&&Math.abs(mF[1]-55)<1e-9&&Math.abs(fF[0]-2000)<1e-9&&Math.abs(fF[1]-20)<1e-9&&Math.abs(fA[0]-2000)<1e-6,Math.abs(mA[1]-55)<1);
 // a concave face: steep at the top, easing out; the ground under the run
 const gr=(x,z)=>20+70*Math.pow((x-2000)/92,2),cv=W.fall({name:'cv',lip,dir:[-1,0],drop:70,foot,fit:true,face:gr,faceLift:.4});let off=0,mono=true;
 for(let i=0;i<=40;i++){const f=i/40,p=cv.curtainAt(.5,f),g=gr(p[0],p[2]);if(i>0&&i<40)off=Math.max(off,Math.abs(p[1]-g-.4));if(i>0&&p[1]>cv.curtainAt(.5,(i-1)/40)[1]+1e-9)mono=false;}
 ok('W3: a face from the ground (a function): the curtain runs '+(.4).toFixed(1)+' m over it (worst off '+off.toFixed(2)+' m between 24 samples), never rising, ends on lip and foot',off<.6&&mono&&Math.abs(cv.curtainAt(.5,0)[1]-90)<1e-9&&Math.abs(cv.curtainAt(.5,1)[1]-20)<1e-9,false);
 let dmax=0;for(const f of[.1,.37,.62,.9]){const n=cv.curtainNormal(f),h=1e-5,p0=cv.curtainAt(.5,f-h),p1=cv.curtainAt(.5,f+h),t=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],tl=Math.hypot(...t);dmax=Math.max(dmax,Math.abs((n[0]*t[0]+n[1]*t[1]+n[2]*t[2])/tl));}
 ok('W3: its normal is square to the face (worst |n.t| '+fx(dmax)+') and faces out of it (down the run and up)',dmax<1e-6&&cv.curtainNormal(.5)[0]<0&&cv.curtainNormal(.5)[1]>0,false);
 const X=W.export().surfaces,rec=X.find(s=>s.name==='cv'),back=W.fall({name:'cv2',lip,dir:[-1,0],drop:70,foot,fit:true,face:rec.face});
 ok('W3: the export carries the face\'s drops ('+rec.face.length+' samples) and a fall rebuilt from them is the same curtain; the arc\'s record has none',
  JSON.stringify(W.curtain(back,{}))===JSON.stringify(W.curtain(cv,{}))&&!('face' in X.find(s=>s.name==='arc')),'face' in X.find(s=>s.name==='arc'));
 const nf=W.fall({name:'nofoot',lip,dir:[-1,0],drop:70,face:true});
 ok('...negative: a face with no foot (no run) is ignored: the curtain arcs',nf.face===null&&JSON.stringify(nf.curtainAt(.5,.5))===JSON.stringify(W.fall({name:'nf2',lip,dir:[-1,0],drop:70}).curtainAt(.5,.5)),nf.face!==null);
 W.surfaces.length=0;}

// ================================================================ W4: drawPools' gradient
{const p1=W.still({name:'g1',level:2,poly:[[0,0],[40,0],[40,20],[0,20]],gradient:{centre:0xaa8844,rim:0x223322,power:1.6}}),p2=W.still({name:'g2',level:3,bounds:[100,100,110,108]}),
  p3=W.still({name:'g3',level:1,bounds:[200,0,230,30]});
 const P=GP(W.poolGLSL,0);let e=0,neg=0;
 for(const S of[p1])for(const[x,z]of[[20,10],[0,0],[33,4],[10,19],[-30,5]]){const g=S.gradient,v=P.run('wtrPoolT',[x,z],[g.at[0],g.at[1],1/g.radius,g.power]);e=Math.max(e,Math.abs(v-S.gradientT(x,z)));neg=Math.max(neg,Math.abs(P.run('wtrPoolT',[x,z],[g.at[0],g.at[1],1/g.radius,1])-S.gradientT(x,z)));}
 ok('W4: the pools\' gradient step (wtrPoolT, the per-vertex record) equals each pool\'s gradientT ('+fx(e)+'); negative: power 1 for 1.6 is off by '+neg.toFixed(3),e<1e-12&&neg>.02,false);
 const D=W.drawPools([p1,p2,p3],{gradient:{centre:0x112233,rim:0x445566}}),G=D.mesh.geometry.attributes,c=compiled(D.material);
 const n1=W.stillMesh(p1).pos.length/3,ga=G.wtrGA.array;
 ok('W4: drawPools keeps a pool\'s own gradient and gives o.gradient to the others (their own middles: g3 at '+p3.gradient.at+'), each pool\'s (x, z, 1/r, power) on its vertices, the colour step in the fragment',
  ga[0]===Math.fround(p1.gradient.at[0])&&Math.abs(ga[3]-1.6)<1e-6&&Math.abs(ga[n1*4]-105)<1e-6&&p3.gradient.at[0]===215&&/wtrPoolT\(vWtrW\.xz,vWtrGA\)/.test(c.fs)&&/attribute vec4 wtrGA/.test(c.vs),false);
 const q1=W.still({name:'q1',level:2,bounds:[0,0,5,5]}),D0=W.drawPools([q1],{}),c0=compiled(D0.material);
 ok('...without gradients the mesh has no gradient attributes and the shader no step (the old text)',!D0.mesh.geometry.attributes.wtrGA&&!/wtrPool/.test(c0.fs)&&!/wtrGA/.test(c0.vs),!!D0.mesh.geometry.attributes.wtrGA);
 W.surfaces.length=0;W.drawn.length=0;}

// ================================================================ W5: rideGLSL / rideOn
{const S=W.open({name:'lake',level:1.5,swell:[[.05,22,35,0,.03],[.03,13,-50,1.3,.03],[.012,6,80,2.2,.02]],field:0,bounds:[-500,-500,500,500],
   bed:(x,z)=>-4+x*.004,bedBox:[-500,-500,500,500],bedCell:8});
 const U=W.uniformsOf(S),tex=(s,uv)=>{const B=S.bed,fx_=uv[0]*B.nx-.5,fz=uv[1]*B.nz-.5,i0=Math.floor(fx_),j0=Math.floor(fz),ax=fx_-i0,az=fz-j0,C=(i,j,k)=>B.data[(Math.min(B.nz-1,Math.max(0,j))*B.nx+Math.min(B.nx-1,Math.max(0,i)))*4+k]/255;
  return[0,1,2,3].map(k=>(C(i0,j0,k)*(1-ax)+C(i0+1,j0,k)*ax)*(1-az)+(C(i0,j0+1,k)*(1-ax)+C(i0+1,j0+1,k)*ax)*az);};void U;
 let e=0,neg=0;for(const t of[2.2,77.7,1e5+.3]){const P=GP(W.rideGLSL(S),t,{wtrLevel:S.levelAt(t),wtrBase:S.base,texture2D:tex,wtrBed:'bed'});
  for(const[x,z]of[[0,0],[13.3,-41],[-250,120],[400,-399]]){const v=P.run('wtrRide',[x,z]),c=S.heightAt(x,z,t)-S.levelAt(t);e=Math.max(e,Math.abs(v-c));neg=Math.max(neg,Math.abs(v-(S.heightAt(x,z,t+1)-S.levelAt(t))));}}
 ok('W5: wtrRide (WATER.rideGLSL, the vertex chunk) equals heightAt - level at 12 points and three times ('+fx(e)+'); negative: a clock 1 s off is '+neg.toFixed(4)+' m out',e<1e-6&&neg>1e-3,false);
 const m=new Mat({});m.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nPAGE;');};W.rideOn(m,S,{weight:'aBob'});
 const c=compiled(m),m2=new Mat({});W.rideOn(m2,S,{});m2.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nLATE;');};const c2=compiled(m2);
 ok('W5: rideOn hooks the material after the page\'s own hook (assigned before or after), lifts each instance by wtrRide at its centre times its weight over its y scale, with the surface\'s uniforms',
  /PAGE;/.test(c.vs)&&/wtrRide\(wtrRc\.xz\)\*aBob\/wtrRs/.test(c.vs)&&/attribute float aBob/.test(c.vs)&&'wtrLevel' in c.uniforms&&'wtrBed' in c.uniforms&&'atmWaveT' in c.uniforms&&/LATE;/.test(c2.vs)&&/wtrRide\(wtrRc\.xz\)\/wtrRs/.test(c2.vs)&&c.key!==c2.key,
  /aBob/.test(c2.vs));
 W.surfaces.length=0;}

// ================================================================ R9: hollows, puddles, the wet look, rain rings, the cover hook
{const h=(x,z)=>.002*x+.3*Math.sin(x*.05)*Math.cos(z*.04)-(Math.hypot(x-60,z+40)<14?.6*(1-Math.hypot(x-60,z+40)/14):0)+(x>150?(x-150)*.5:0);
 const M=W.hollows({h,box:[-100,-100,200,100],cell:2,blur:20,depth:.4});
 ok('R9: WATER.hollows bakes '+M.nx+' x '+M.nz+' cells ('+M.data.length+' bytes): the dug hollow at (60, -40) is deep ('+W.hollowAt(M,60,-40).toFixed(2)+'), a crest is not ('+W.hollowAt(M,31.4,0).toFixed(2)+'), the steep slope past x 150 never is ('+W.hollowAt(M,180,0).toFixed(2)+')',
  M.nx===150&&M.nz===100&&W.hollowAt(M,60,-40)>.8&&W.hollowAt(M,31.4,0)<.05&&W.hollowAt(M,180,0)===0,W.hollowAt(M,60,-40)<.5);
 ok('...deterministic, and 0 outside its box',JSON.stringify(Array.from(M.data))===JSON.stringify(Array.from(W.hollows({h,box:[-100,-100,200,100],cell:2,blur:20,depth:.4}).data))&&W.hollowAt(M,-101,0)===0&&W.hollowAt(M,0,101)===0,false);
 const P=GP(W.puddleGLSL(M),0,{texture2D:texOf1(M),wtrHollowT:'h'});let e=0;
 for(const wet of[0,.3,.7,1])for(const[x,z]of[[60,-40],[55,-36],[-31.4,0],[10,10],[-99,99],[150,0]])e=Math.max(e,Math.abs(P.run('wtrPuddle',[x,z],wet)-W.puddleAt(M,x,z,wet)));
 const pd=w=>W.puddleAt(M,60,-40,w),rim=w=>W.puddleAt(M,51,-40,w);
 ok('R9: the puddle (wtrPuddle over the texture) equals W.puddleAt ('+fx(e)+'); it fills as the ground wets: the deepest point '+[0,.3,.6,1].map(w=>pd(w).toFixed(2)).join(' -> ')+', nearer the rim '+[0,.3,.6,1].map(w=>rim(w).toFixed(2)).join(' -> '),
  e<1e-9&&pd(0)===0&&pd(1)===1&&rim(.3)<pd(.3)&&rim(1)>rim(.3),pd(0)>0);
 const Pb=GP(W.puddleGLSL(Object.assign({},M,{x0:M.x0+20})),0,{texture2D:texOf1(M),wtrHollowT:'h'});
 ok('...negative: the same bytes placed 20 m off are not the twin ('+Math.abs(Pb.run('wtrPuddle',[60,-40],1)-W.puddleAt(M,60,-40,1)).toFixed(2)+')',Math.abs(Pb.run('wtrPuddle',[60,-40],1)-W.puddleAt(M,60,-40,1))>.3,false);
 // the wet look (Lagarde)
 const L=GP(W.wetLookGLSL(),0);let el=0;
 for(const[r,w,p,fl,por]of[[.9,0,0,0,.7],[.9,1,0,0,.7],[.6,.5,.3,0,.4],[.8,1,1,0,1],[.7,.2,0,.6,.7]]){const tw=W.wetLook(r,w,p,por,fl);el=Math.max(el,Math.abs(L.run('wtrWetDarkL',w,p,por)-tw[0]),Math.abs(L.run('wtrWetRoughL',r,w,p,fl)-tw[1]));}
 const dry=W.wetLook(.9,0,0,.7,0),wet=W.wetLook(.9,1,0,.7,0),pud=W.wetLook(.9,1,1,.7,0);
 ok('R9: the wet look\'s GLSL equals W.wetLook ('+fx(el)+'): dry albedo x'+dry[0]+' rough '+dry[1]+'; wet x'+wet[0].toFixed(3)+' rough '+wet[1].toFixed(3)+'; a puddle x'+pud[0].toFixed(3)+' rough '+pud[1].toFixed(3),
  el<1e-12&&dry[0]===1&&Math.abs(dry[1]-.9)<1e-12&&wet[0]<.6&&wet[1]<.4&&pud[1]<.05&&pud[0]<wet[0],false);
 // rain rings
 let er=0,act=0,dark=0;for(const t of[.4,33.3,1e5+.21])for(const rain of[0,.4,1]){const R=GP(W.rainRippleGLSL(),t);for(const[x,z]of[[0,0],[1.234,-.77],[-17.3,40.1],[300.05,-2.2],[5.5,5.5]]){
   const g=R.run('wtrRainRipple',[x,z],rain),c=W.rainRipple(x,z,t,rain);er=Math.max(er,Math.abs(g[0]-c[0]),Math.abs(g[1]-c[1]));if(rain===1)act=Math.max(act,Math.hypot(c[0],c[1]));if(rain===0)dark=Math.max(dark,Math.hypot(c[0],c[1]));}}
 const off=W.rainRipple(1.234,-.77,33.3+.5,1),on=W.rainRipple(1.234,-.77,33.3,1);
 ok('R9: rain rings (WATER.rainRippleGLSL) equal W.rainRipple at 15 points x 3 times x 3 rains ('+fx(er)+'): up to '+act.toFixed(3)+' of slope in full rain, none dry ('+dark+'); negative: half a second later the slope moves ('+Math.hypot(off[0]-on[0],off[1]-on[1]).toFixed(3)+')',
  er<1e-9&&act>.05&&dark===0&&Math.hypot(off[0]-on[0],off[1]-on[1])>1e-3,false);
 let cnt=r=>{let n=0;for(let i=0;i<400;i++){const g=W.rainRipple(i*.137,i*.291,12.5,r);if(Math.hypot(g[0],g[1])>.01)n++;}return n;};
 ok('...more rain, more rings: '+cnt(.2)+' of 400 points ring at rain .2, '+cnt(1)+' at rain 1; the normal takes the slope (W.rainNormal: flat + (.1, 0) -> '+W.rainNormal([0,1,0],[.1,0]).map(v=>v.toFixed(3))+')',
  cnt(1)>cnt(.2)&&Math.abs(W.rainNormal([0,1,0],[.1,0])[0]+.1/Math.hypot(.1,1))<1e-12,false);
 const Rn=GP(W.rainRippleGLSL(),0);const nn=Rn.run('wtrRainN',[.2,.95,-.1],[.05,-.02]),tn=W.rainNormal([.2,.95,-.1],[.05,-.02]);
 ok('R9: wtrRainN equals W.rainNormal ('+fx(Math.max(...nn.map((v,k)=>Math.abs(v-tn[k]))))+')',Math.max(...nn.map((v,k)=>Math.abs(v-tn[k])))<1e-12,false);
 // wetGround with the model: puddles, ripples, the cover; idempotent
 A.U.waveTime={value:0};
 const g1=new Mat({});g1.onBeforeCompile=function(sh){sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nPAGE;');};
 W.wetGround(g1,{rain:true,puddles:M});W.wetGround(g1,{rain:true});const c1=compiled(g1);
 ok('R9: wetGround({puddles}) compiles the hollow lookup, the puddle, the wet look, the rings and the cover (open sky without core/atmos\'s map), after the page\'s hook; a second call (bindWeather\'s) adds no second chunk',
  /PAGE;/.test(c1.fs)&&/wtrPuddle\(vWtrW\.xz,wtrRain\*wtrOk\)/.test(c1.fs)&&/wtrWetDarkL/.test(c1.fs)&&/wtrRainRipple\(vWtrW\.xz,wtrRainNow\*wtrOk\)/.test(c1.fs)&&/float wtrOpen\(vec3 p\)\{return 1\.0;\}/.test(c1.fs)&&
  (c1.fs.match(/uniform float wtrRain;/g)||[]).length===1&&'wtrHollowT' in c1.uniforms&&'wtrRainNow' in c1.uniforms&&'atmWaveT' in c1.uniforms&&/\|lag:/.test(c1.key),false);
 const g2=new Mat({});W.wetGround(g2,{rain:true});const c2=compiled(g2);
 ok('...negative: plain wetGround({rain}) is the old chunk (no puddle, no rings, no Lagarde) and an earlier call\'s options are kept when a later one adds porosity',
  !/wtrPuddle|wtrRainRipple|wtrWetDarkL/.test(c2.fs)&&/wtrWetAlbedo/.test(c2.fs)&&(()=>{W.wetGround(g2,{porosity:.5});return /wtrWetDarkL\(wtrW,wtrPd,0\.5\)/.test(compiled(g2).fs);})(),/wtrPuddle/.test(c2.fs));
 // the cover hook: core/atmos's rain occlusion map, when the page has it
 A.rainCoverGLSL=()=>'uniform sampler2D atmRainCover;float atmRainOpen(vec3 p){return 0.25;}';A.rainCoverUniforms=u=>{u.atmRainCover={value:'map'};};
 const g3=new Mat({});W.wetGround(g3,{puddles:M});const c3=compiled(g3);const st=W.drawStill(W.still({name:'rainpool',level:0,bounds:[0,0,4,4]}),{rain:true}),cs=compiled(st.material);
 ok('R9: with core/atmos\'s cover (ATMOS.rainCoverGLSL/rainCoverUniforms) the ground and the water read it (wtrOpen calls atmRainOpen, its uniform added, the program keyed apart)',
  /return atmRainOpen\(p\)/.test(c3.fs)&&'atmRainCover' in c3.uniforms&&/\|rainc/.test(c3.key)&&/wtrRainN\(wtrStillN\(vWtrW\.xz\),wtrRainRipple\(vWtrW\.xz,wtrRainNow\*wtrOpen\(vWtrW\)\)\)/.test(cs.fs)&&'atmRainCover' in cs.uniforms,false);
 delete A.rainCoverGLSL;delete A.rainCoverUniforms;
 const s0=W.drawStill(W.still({name:'dry',level:0,bounds:[0,0,4,4]}),{}),cs0=compiled(s0.material);
 const F=W.flow({name:'rf',pts:[[0,0,1],[30,0,.5],[60,5,0]],width:6,speed:1}),df=compiled(W.drawFlow(F,{rain:true}).material),po=compiled(W.drawPools([W.still({name:'rp',level:0,bounds:[9,9,12,12]})],{rain:true}).material),
  sm=compiled(W.stillMaterial({rain:true})),op=compiled(W.draw(W.open({name:'ro',swell:[],field:0,level:0,bounds:[0,0,50,50]}),{rain:true}).material);
 ok('R9: rain: true rings the still pool, the flow, the merged pools, stillMaterial\'s tops and open water; a drawing without it has no ring (the old text)',
  [df,po,sm,op].every(c=>/wtrRainRipple\(/.test(c.fs)&&'wtrRainNow' in c.uniforms)&&!/wtrRain/.test(cs0.fs),/wtrRain/.test(cs0.fs));
 W.surfaces.length=0;W.drawn.length=0;}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
