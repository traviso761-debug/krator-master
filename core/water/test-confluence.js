// node core/water/test-confluence.js — a tributary meeting its river as one water (core/water/ext/55 and 55b, 2026-10-27): the shore is the
// ground's (rounded where it is), no foam line across the mouth, one current that turns smoothly (the ripples merge instead of shearing), a
// rim that is the ribbons' own numbers (they cross-fade on the same water), the drawing in drawFlow's own text. Each check has a negative.
// The case is the SW highlands' (biomes/swhighlands station 1: the cave stream into the fold river), made synthetic: a river running +z,
// a stream entering from +x at a right angle, the ground carved by both channels and joined with a smooth minimum.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const {glslProgram}=require('./glsl-interp.js');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const CORE=['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js',
 'core/water/21-core-water-shore.js','core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js'];
const EXT=['core/water/ext/55-core-water-confluence.js','core/water/ext/55b-core-water-confluence-draw.js'];
global.window=global;
eval(CORE.map(rd).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=ATMOS,W=WATER,PW=A.PRESETS.waves;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const fx=v=>v.toExponential(1);

// ---------------------------------------------------------------- a three.js stub (test-rebuild.js's)
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

// ---------------------------------------------------------------- the case
// the river: x = 0, running +z, 8 m half width (+2.5 m held under the banks: the ribbon's width), level 10 falling 1 cm per 10 m; the stream:
// along z = 0 from x = 140 to the river's water edge (WATER.join tuck 1: x = 8), 3.4 m half width, its level the river's at the mouth
const HW=8,HT=3.4,HOLD=2.5,yR=z=>10-z*.001;
const river=W.flow({name:'river',pts:Array.from({length:21},(_,k)=>[0,-200+20*k,yR(-200+20*k)]),width:2*(HW+HOLD),speed:1.2});
const stream=W.flow({name:'stream',pts:[[140,0,10.6],[100,0,10.4],[60,0,10.15],[30,0,10.02],[HW,0,yR(0)+.002]],width:2*(HT+HOLD),speed:1.6});
const smin=(a,b,k)=>{const q=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-q*q*k*.25;};
const chan=(d,hw,y,dep)=>d<hw?y-dep*(1-.55*(d/hw)*(d/hw))-.15:y+.35+(d-hw)*.22+Math.max(0,d-hw-5)*.9;
const PIT=[0,0];   /* a hollow on the land inside the disc, below the water's level, cut off from the channels */
const ground=(x,z)=>{const dr=Math.abs(x),ds=x<HW?Math.hypot(x-HW,z):Math.abs(z),g=smin(chan(dr,HW,yR(z),1.1),chan(ds,HT,yR(0),.6),FILLET);
 const dp=Math.hypot(x-PIT[0],z-PIT[1]);return dp<3?Math.min(g,9.2+dp*.1):g;};
let FILLET=6;PIT[0]=24;PIT[1]=-17;

// ================================================================ 0. loading the fragments moves nothing
const dF=compiled(W.drawFlow(river,{}).material).fs,before=JSON.stringify(W.export());
eval(EXT.map(rd).join('\n'));
ok('loading ext/55 and 55b leaves the export of a scene made without them and drawFlow\'s shader as they were',JSON.stringify(W.export())===before&&compiled(W.drawFlow(river,{}).material).fs===dF,false);
let threw=0;try{W.confluence({flows:[river],at:[HW,0],ground});}catch(e){threw++;}try{W.confluence({flows:[river,stream],at:[HW,0]});}catch(e){threw++;}
ok('...a confluence of one flow, or one without the ground, is refused',threw===2,false);

const C=W.confluence({name:'the mouth',flows:[river,stream],at:[HW,0],r:30,ground}),own=(S,x,z)=>{const q=S.nearest(x,z),a=q.a,b=q.b,u=q.u,v=a.v+(b.v-a.v)*u;
 return{y:a.y+(b.y-a.y)*u,vx:q.ex/q.L*v,vz:q.ez/q.L*v,slope:a.slope,bank:(a.w+(b.w-a.w)*u)/2-q.d};};
const ribbonBank=(x,z)=>Math.max(own(river,x,z).bank,own(stream,x,z).bank);

// ================================================================ 1. the shore is the ground's
{let agree=0,tot=0;for(let j=0;j<C.n;j++)for(let i=0;i<C.n;i++){const id=j*C.n+i,x=C.x0+i*C.cell,z=C.z0+j*C.cell;if(C.fade[id]<1)continue;const lvl=C.y[id],gw=ground(x,z)<lvl-.05,gd=ground(x,z)>lvl+.05;
  if(!gw&&!gd)continue;if(Math.hypot(x-PIT[0],z-PIT[1])<4)continue;tot++;if((C.bank[id]>0)===(gw&&C.union[id]>0))agree++;}
 ok('inside the disc the water is where the ground lies under the level, inside the channels\' rounded union: '+agree+' of '+tot+' vertices (land wherever the ground rises over it)',agree===tot&&tot>1000,false);}
{/* the SW highlands' case: the river's level stands over a low valley floor on one side (the ground 1.5 m under it out past the disc) */
 const low=(x,z)=>x>-HW-1&&Math.abs(z)>HT+1?Math.min(ground(x,z),yR(z)-1.5):ground(x,z),CL=W.confluence({name:'low floor',flows:[river,stream],at:[HW,0],r:30,ground:low});W.groups.pop();
 let out=0,inn=0;for(let j=0;j<CL.n;j++)for(let i=0;i<CL.n;i++){const id=j*CL.n+i;if(CL.fade[id]<1)continue;const x=CL.x0+i*CL.cell,z=CL.z0+j*CL.cell;if(CL.bank[id]>0){inn++;if(ribbonBank(x,z)<-HT)out++;}}
 const c2=CL.at(HW+HOLD+1/Math.SQRT2,HT+HOLD+1/Math.SQRT2).bank;
 ok('over a valley floor lower than the water the water stays in its channels (no vertex more than a stream\'s half width past both ribbons: '+out+' of '+inn+'), its corner filleted (1 m out on the diagonal of the ribbons\' corner: bank '+c2.toFixed(2)+' m)',out===0&&inn>500&&c2>0,false);
 const CG=W.confluence({name:'ground only',flows:[river,stream],at:[HW,0],r:30,ground:low,round:1e-3});W.groups.pop();const c3=CG.at(HW+HOLD+1/Math.SQRT2,HT+HOLD+1/Math.SQRT2).bank;
 ok('...negative: with a near-zero fillet that corner is land ('+c3.toFixed(2)+' m): the union\'s fillet rounds it, not the ground',c3<0,false);}
{const pw=C.at(PIT[0],PIT[1]);ok('a hollow under the level but cut off from the channels stays dry (bank '+pw.bank.toFixed(2)+' m at its middle, its ground '+(ground(PIT[0],PIT[1])-pw.y).toFixed(2)+' m under the level)',pw.bank<0&&ground(PIT[0],PIT[1])<pw.y,false);}
// the corners: down the diagonal out of the corner the two straight banks make (x = 8 + 3.4 + ..., z = 3.4 + ...)
const corner=k=>{const x=HW+k/Math.SQRT2,z=HT+k/Math.SQRT2;return{c:C.at(x,z).bank,r:ribbonBank(x,z)};};
{const c0=corner(0),c2=corner(2);ok('the corners are round: at the strips\' corner the water reaches '+c0.c.toFixed(2)+' m on (the strips: '+(c0.r-HOLD).toFixed(2)+' m, a point), and 2 m out along the diagonal it is still water ('+c2.c.toFixed(2)+' m) where the strips have land',
  c0.c>1&&c2.c>0&&c2.r-HOLD<0,false);
 const C0=W.confluence({name:'square ground',flows:[river,stream],at:[HW,0],r:30,ground:(x,z)=>{const d=Math.max(own(river,x,z).bank,own(stream,x,z).bank)-HOLD;return d>0?yR(z)-.8:yR(z)+.5;}});
 W.groups.pop();const s2=C0.at(HW+2/Math.SQRT2,HT+2/Math.SQRT2).bank;
 ok('...negative: over ground cut square to the strips the corner stays square (2 m out on the diagonal: bank '+s2.toFixed(2)+' m, land)',s2<0,false);}

// ================================================================ 2. no line across the mouth
{let cf=0,rf=0;for(let z=-HT;z<=HT;z+=.25){const x=HW+.6,q=C.at(x,z);cf=Math.max(cf,W.flowFoam(q.slope,q.bank)+C.meet*q.meet);rf=Math.max(rf,W.flowFoam(own(river,x,z).slope,own(river,x,z).bank-HOLD));}
 ok('across the mouth the bank is far (the foam there '+cf.toFixed(3)+': only the currents\' meeting, under .2), where the river\'s ribbon has its bank foam ('+rf.toFixed(2)+')',cf<.2&&rf>.4,false);
 let sh=1e9;for(let z=-HT;z<=HT;z+=.25)sh=Math.min(sh,C.at(HW+.6,z).bank);ok('...and it is deep water colour there (the bank '+sh.toFixed(2)+' m off at least: drawFlow\'s shallow tint ends at 3.5 m)',sh>3,false);
 const q=C.at(HW+6,HT+6.5),qs=C.at(HW+40,HT+1);ok('foam where there is shore: the stream\'s own bank 1 m in ('+W.flowFoam(qs.slope,1).toFixed(2)+' at bank 1) is unchanged; the land beyond is drawn by no one ('+q.bank.toFixed(1)+' m)',q.bank<-.5,false);}

// ================================================================ 3. one current: the stream turns into the river; the ripples merge
const turn=Cx=>{let prev=null,maxStep=0,mono=true,last=null;for(let x=26;x>=-4;x-=.5){const q=Cx.at(x,0),a=Math.atan2(q.vz,q.vx);if(prev!=null){let d=a-prev;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;maxStep=Math.max(maxStep,Math.abs(d)/.5);if(last!=null&&Math.sign(d)!==0&&Math.sign(d)!==last&&Math.abs(d)>1e-3)mono=false;if(Math.abs(d)>1e-3)last=Math.sign(d);}prev=a;}return{maxStep,mono,a0:Math.atan2(Cx.at(26,0).vz,Cx.at(26,0).vx),a1:Math.atan2(Cx.at(-4,0).vz,Cx.at(-4,0).vx)};};
const shear=Cx=>{let g=0;const T=W.period()/W.PRESETS.flow.phases;for(let j=1;j+1<Cx.n;j++)for(let i=1;i+1<Cx.n;i++){const id=j*Cx.n+i;if(Cx.bank[id]<.5||Cx.fade[id]<1)continue;
  const dx=Math.hypot(Cx.vx[id+1]-Cx.vx[id-1],Cx.vz[id+1]-Cx.vz[id-1])/(2*Cx.cell),dz=Math.hypot(Cx.vx[id+Cx.n]-Cx.vx[id-Cx.n],Cx.vz[id+Cx.n]-Cx.vz[id-Cx.n])/(2*Cx.cell);g=Math.max(g,Math.max(dx,dz)*T);}return g;};
{const t=turn(C),C1=W.confluence({name:'unblurred',flows:[river,stream],at:[HW,0],r:30,ground,blur:0,reach:.3});W.groups.pop();const t1=turn(C1),s=shear(C),s1=shear(C1);
 ok('down the stream\'s line the current turns from the stream\'s (heading '+(t.a0*180/Math.PI).toFixed(0)+' deg) to the river\'s ('+(t.a1*180/Math.PI).toFixed(0)+' deg) one way, at most '+(t.maxStep*180/Math.PI).toFixed(1)+' deg a metre',
  Math.abs(Math.abs(t.a0)-Math.PI)<.05&&Math.abs(t.a1-Math.PI/2)<15*Math.PI/180&&t.mono&&t.maxStep<.25,false);
 ok('the ripples merge: over a ripple phase ('+(W.period()/W.PRESETS.flow.phases).toFixed(0)+' s) neighbouring water drifts apart by at most '+s.toFixed(2)+' m a metre (the stretch the flow map puts in the ripples)',s<1.2,false);
 ok('...negative: without the blur (the currents switched where the channels meet) it turns '+(t1.maxStep*180/Math.PI).toFixed(0)+' deg in a metre and shears '+s1.toFixed(2)+' m a metre',t1.maxStep>t.maxStep*2.5&&s1>s*2,false);}

// ================================================================ 4. the rim is the ribbons' own
{let e={y:0,v:0,s:0,b:0},n=0,eM=0;for(let k=0;k<720;k++){const a=k/720*2*Math.PI,x=HW+29.9*Math.cos(a),z=29.9*Math.sin(a),q=C.at(x,z);if(q.fade>.002)continue;
  const R=own(river,x,z),S=own(stream,x,z),O=R.bank>S.bank?R:S;if(O.bank<0)continue;n++;
  e.y=Math.max(e.y,Math.abs(q.y-O.y));e.v=Math.max(e.v,Math.hypot(q.vx-O.vx,q.vz-O.vz));e.s=Math.max(e.s,Math.abs(q.slope-O.slope));e.b=Math.max(e.b,Math.abs(q.bank-O.bank));}
 ok('at its rim ('+n+' points in the water) the confluence carries the ribbon\'s own numbers: level '+fx(e.y)+' m, current '+fx(e.v)+' m/s, slope '+fx(e.s)+', bank '+fx(e.b)+' m (the two cross-fade on the same water)',n>10&&e.y<1e-3&&e.v<.02&&e.b<.15,false);
 const q=C.at(HW+12,0),O=own(stream,HW+12,0);ok('...negative: inside, it is its own water (12 m up the stream its current is '+Math.hypot(q.vx-O.vx,q.vz-O.vz).toFixed(2)+' m/s off the ribbon\'s, its bank '+(q.bank-O.bank).toFixed(1)+' m)',Math.hypot(q.vx-O.vx,q.vz-O.vz)>.05||Math.abs(q.bank-O.bank)>1,false);}
{const P=glslProgram('float fade(vec3 vWtrW){return '+W.ribbonFadeGLSL(C)+';}',{});let e=0;for(let k=0;k<200;k++){const x=HW-40+80*(k%17)/17,z=-40+80*Math.floor(k/17)/12;e=Math.max(e,Math.abs(P.run('fade',[x,0,z])-(1-C.fadeAt(x,z))));}
 ok('the ribbons\' fade (the shader\'s text) is 1 - the disc\'s weight ('+fx(e)+'): 0 in the middle, 1 past the rim',e<1e-12&&C.fadeAt(HW,0)===1&&C.fadeAt(HW+31,0)===0,false);}

// ================================================================ 5. the drawing
{const M=C.mesh();let e=0,up=true;for(let k=0;k<300;k++){const x=HW-30+60*((k*37)%300)/300,z=-30+60*((k*91)%300)/300,q=C.at(x,z);
  // the triangle the point is in, by the index list's split: its barycentric mix of the per-vertex values
  const fx=(x-C.x0)/C.cell,fz=(z-C.z0)/C.cell,i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,a=j*C.n+i,b=a+C.n,c=a+1,d=b+1,tri=u+v<=1?[[a,1-u-v],[c,u],[b,v]]:[[d,u+v-1],[b,1-u],[c,1-v]];
  const val=K=>tri.reduce((s,[id,w])=>s+K[id]*w,0);e=Math.max(e,Math.abs(val(M.bank)-q.bank),Math.abs(val(M.slope)-q.slope),Math.abs(tri.reduce((s,[id,w])=>s+M.pos[id*3+1]*w,0)-q.y));}
 for(let t=0;t<M.idx.length;t+=3){const p=M.idx.slice(t,t+3).map(k=>[M.pos[k*3],M.pos[k*3+2]]),cr=(p[1][1]-p[0][1])*(p[2][0]-p[0][0])-(p[1][0]-p[0][0])*(p[2][1]-p[0][1]);if(cr<=0){up=false;break;}}
 ok('the mesh: C.at is its triangles\' interpolation ('+fx(e)+'), every triangle faces up, '+M.idx.length/3+' of '+2*(C.n-1)*(C.n-1)+' quads\' triangles drawn (the land and the disc\'s corners skipped)',e<1e-9&&up&&M.idx.length/3<2*(C.n-1)*(C.n-1)*.8,false);}
{const opt={shallow:0x6a9a86,deep:0x1e4a42,color:0xffffff,roughness:.2},D=W.drawConfluence(C,opt),c=compiled(D.material),R=W.drawFlow(river,opt),cr=compiled(R.material);
 const tx=s=>s.slice(s.indexOf('diffuseColor.rgb=mix('),s.indexOf('diffuseColor.a*=')),same=['wtrFlowN(vWtrW.xz,vWtrF,vWtrS)','float wtrP0=fract(','roughnessFactor=mix(roughnessFactor,0.8,wtrFoamK);'].every(t=>c.fs.includes(t)&&cr.fs.includes(t));
 ok('drawConfluence draws the river\'s water with drawFlow\'s own text (the colour from the bank, the ripples by wtrFlowN, the foam\'s roughness), its alpha times the disc\'s weight',tx(c.fs)===tx(cr.fs)&&same&&/\*vWtrA;/.test(c.fs)&&/wtrFoamK=wtrFb\*/.test(c.fs)&&D.mesh.name==='water:the mouth',
  tx(compiled(W.drawConfluence(C,{shallow:0x112233}).material).fs)===tx(cr.fs));
 const keyR=cr.key,Ropq=W.drawFlow(stream,{transparent:false});W.fadeRibbons(C,[R,Ropq]);const pr=compiled(R.material),po=compiled(Ropq.material),R2=W.drawFlow(stream,opt);
 ok('fadeRibbons: a ribbon fades out in the disc (alpha x the fade), an opaque one discards, their keys change; a ribbon not passed is untouched',pr.fs.includes('diffuseColor.a*='+W.ribbonFadeGLSL(C)+';')&&po.fs.includes('discard;')&&pr.key!==keyR&&!compiled(R2.material).fs.includes(W.ribbonFadeGLSL(C)),false);}

// ================================================================ 6. the queries, the export, determinism
{const g=W.export().groups.find(x=>x.kind==='confluence');
 ok('WATER.groups holds it (heightAt and flowAt on its water, null on its land); the export carries its grid ('+g.n+' x '+g.n+')',C.heightAt(HW+2,0)!=null&&C.heightAt(HW+6,HT+8)==null&&C.flowAt(HW+2,0)[2]>0&&g.y.length===g.n*g.n&&g.flows[1]===stream.id,false);
 const C2=W.confluence({name:'again',flows:[river,stream],at:[HW,0],r:30,ground});W.groups.pop();
 ok('the same flows and ground give the same confluence',JSON.stringify(Array.from(C2.vx))===JSON.stringify(Array.from(C.vx))&&JSON.stringify(Array.from(C2.bank))===JSON.stringify(Array.from(C.bank)),false);}

console.log(bad?'\n'+bad+' FAILED':'\nall passed');process.exit(bad?1:0);
