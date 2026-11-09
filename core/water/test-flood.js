// node core/water/test-flood.js - the gorge flood (core/water/ext/62-core-water-flood.js, 62b draw), each check with a broken input that must
// fail. The law (KHAZ.front, written out in 62's header) is written again here from its text and the record is held to it; its GLSL
// (WATER.floodGLSL) is run as text in glsl-interp.js against S.levelAt. First: loading the fragments moves nothing.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const {glslProgram}=require('./glsl-interp.js');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
global.window=global;
eval(['core/rand/08-core-rand.js','core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js',
 'core/water/21-core-water-shore.js','core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js'].map(rd).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=ATMOS,W=WATER;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};

// ---------------------------------------------------------------- loading moves nothing
const RIV=W.flow({name:'The gorge\'s stream',pts:[[0,0,9.6],[100,0,7.6],[200,40,5.6]],width:4,speed:1});
const POOL=W.still({name:'A pool on the bench',level:30,bounds:[50,20,60,30]});
const SEA=W.open({name:'The sea',level:0,swell:[],field:0,bounds:[400,-100,600,100]});
const pts0=[[0,0],[50,1],[55,25],[500,0],[300,300],[150,20]],X0=JSON.stringify(W.export()),Q0=pts0.map(p=>[W.at(p[0],p[1]),W.heightAt(p[0],p[1],3)]);
eval(['core/water/ext/62-core-water-flood.js','core/water/ext/62b-core-water-flood-draw.js'].map(rd).join('\n'));
ok('loading 62 and 62b moves no export and no query of a scene made without them',JSON.stringify(W.export())===X0&&pts0.every((p,i)=>W.at(p[0],p[1])===Q0[i][0]&&W.at(p[0],p[1],3)===Q0[i][0]&&W.heightAt(p[0],p[1],3)===Q0[i][1]));
{const f0=W.flood;eval(rd('core/water/ext/62-core-water-flood.js'));ok('loading 62 twice is a no-op',W.flood===f0,W.flood!==f0);}
ok('62 throws clearly without core/water',(()=>{try{new Function('WATER',rd('core/water/ext/62-core-water-flood.js'))(undefined);return false;}catch(e){return/20-core-water/.test(e.message);}})());

// ---------------------------------------------------------------- the law, written again from 62's header
const ref=(F,x,z,t)=>{const P=F.path;let best=null,acc=0;
 for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],ex=b[0]-a[0],ez=b[2]-a[2],l=Math.sqrt(ex*ex+ez*ez),u=l>0?Math.min(1,Math.max(0,((x-a[0])*ex+(z-a[2])*ez)/(l*l))):0,
   q=Math.sqrt((x-a[0]-ex*u)**2+(z-a[2]-ez*u)**2);if(!best||q<best.q)best={q,s:acc+u*l,y:a[1]+(b[1]-a[1])*u};acc+=l;}
 const smooth=(a,b,v)=>{if(b<=a)return v<a?0:1;const k=Math.min(1,Math.max(0,(v-a)/(b-a)));return k*k*(3-2*k);};
 let u=t-F.start;if(F.period!=null){u=((u%F.period)+F.period)%F.period;if(u>=F.period)u-=F.period;}
 const v=u-best.s/F.speed,R=F.rise,H=F.hold,D=F.fall,fk=v<0?0:v<R?smooth(0,R,v):v<R+H?1:v<R+H+D?1-smooth(R+H,R+H+D,v):0;
 return{s:best.s,q:best.q,level:best.y+F.base+F.depth*fk,fk};};
const GORGE={key:'gorge',name:'The red gorge flood',path:[[0,10,0],[100,8,0],[200,6,40],[260,5.5,40]],w:9,speed:3,start:20,period:600,rise:25,hold:40,fall:90,depth:4.5,base:0,world:7};
const FL=W.flood(GORGE);
ok('a flood is a surface of kind flood carrying the law\'s record',FL.kind==='flood'&&W.surfaces.includes(FL)&&FL.front.w===9&&FL.front.period===600&&FL.front.base===0&&Math.abs(FL.length-(100+Math.hypot(100,40)+60))<1e-9);
{let worst=0,n=0,wet=0;for(let t=-30;t<1400;t+=7.3)for(const [x,z] of [[0,0],[3,-4],[50,8.9],[100,0],[120,10],[150,20],[199,38],[230,46],[260,40],[268,40],[-5,2],[130,9]]){
  const r=ref(FL.front,x,z,t),l=FL.level(x,z,t);if(r.q>9){if(l!==null)worst=1;continue;}worst=Math.max(worst,Math.abs(l-r.level));n++;if(r.fk>0)wet++;}
 ok('S.level equals the law written from its text ('+n+' samples in the channel, '+wet+' under the flood, worst '+worst.toExponential(1)+'), null off the channel',worst<1e-12&&wet>40&&n>500);
 const F2=Object.assign({},FL.front,{rise:35});let w2=0;for(let t=0;t<400;t+=3.1)w2=Math.max(w2,Math.abs(ref(F2,100,0,t).level-FL.level(100,0,t)));
 ok('the comparison catches a changed rise',w2>1e-3,false);}
{const once=W.flood({key:'once',path:[[0,0,0],[300,-15,0]],w:5,speed:2,start:10,rise:0,hold:30,fall:0,depth:3,base:.4}),c=[];
 for(const t of[0,9.9,10,40,39.99,40.01,60,180,1e5])c.push(once.levelAt(0,t)-once.bedAt(0));
 ok('once (period null), with no rise and no fall: base before the front, base + depth while it holds, base after ('+c.map(v=>v.toFixed(1)).join(' ')+')',
  c[0]===.4&&c[1]===.4&&c[2]===3.4&&c[4]===3.4&&c[5]===.4&&c[8]===.4&&once.wet(150,0,0)&&Math.abs(once.levelAt(100,60)-once.bedAt(100)-3.4)<1e-12&&Math.abs(once.levelAt(100,89.9)-once.bedAt(100)-3.4)<1e-12&&Math.abs(once.levelAt(100,90.1)-once.bedAt(100)-.4)<1e-12);
 ok('the front runs down the channel at its speed: s = 100 floods 50 s after s = 0',once.kAt(100,10+50)===1&&once.kAt(100,10+49.9)===0&&once.frontAt(35).head===50,once.kAt(100,10+49.9)===1);
 ok('the bed is the path\'s y by arc length',once.bedAt(150)===-7.5&&once.bedAt(-5)===0&&once.bedAt(400)===-15);}
ok('with base 0 the channel is dry before the front and after it, wet under it',!FL.wet(100,0,0)&&FL.wet(100,0,20+100/3+30)&&!FL.wet(100,0,20+100/3+160)&&FL.heightAt(100,0,0)===null&&FL.heightAt(100,0,20+100/3+30)>8);
{const a=FL.frontAt(20+60);ok('frontAt: the head at u speed, the crest behind it, the tail behind that',a.u===60&&a.head===180&&a.crest[1]===105&&a.crest[0]===0&&a.tail===0);}
ok('a bad path, w, speed, period or a negative time throws',throws(()=>W.flood({path:[[0,0,0]],w:1,speed:1}))&&throws(()=>W.flood({path:[[0,0,0],[1,0,0]],w:0,speed:1}))&&throws(()=>W.flood({path:[[0,0,0],[1,0,0]],w:1,speed:0}))&&
 throws(()=>W.flood({path:[[0,0,0],[1,0,0]],w:1,speed:1,period:0}))&&throws(()=>W.flood({path:[[0,0,0],[1,0,0]],w:1,speed:1,rise:-1}))&&throws(()=>W.flood({path:[[0,0,0],[0,5,0]],w:1,speed:1})));
ok('a point past an end is in the channel within w of it (a round cap), not beyond',FL.contains(-8,0)&&!FL.contains(-10,0)&&FL.contains(-6,6)&&!FL.contains(-7,7));
ok('flowAt runs down the path at its speed while wet, nothing while dry',(()=>{const f=FL.flowAt(50,0,20+50/3+30);return Math.abs(f[0]-3)<1e-12&&f[2]===3&&Math.abs(f[3]-.02)<1e-12;})()&&FL.flowAt(50,0,0)[2]===0);

// ---------------------------------------------------------------- the queries
{const tw=20+100/3+30,tw0=20+100/3+300;
 ok('WATER.at(x, z, t) answers the flood where it stands over the stream; without t, or dry, the stream as before',W.at(100,0,tw)===FL&&W.at(100,0)===RIV&&W.at(100,0,tw0)===RIV);
 ok('WATER.heightAt is the higher: the flood\'s level over the stream, the stream when the flood is gone',Math.abs(W.heightAt(100,0,tw)-FL.level(100,0,tw))<1e-12&&W.heightAt(100,0,tw)>RIV.heightAt(100,0)&&W.heightAt(100,0,tw0)===RIV.heightAt(100,0),W.heightAt(100,0,tw0)!==RIV.heightAt(100,0));
 ok('off the channel nothing changes (the pool on the bench, the sea)',W.at(55,25,tw)===POOL&&W.heightAt(55,25,tw)===30&&W.at(500,0,tw)===SEA);}

// ---------------------------------------------------------------- the hazard and the export: one record
{const H=FL.hazard(),Rr=FL.hazardRecord();
 const inPoly=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++)if((P[i][1]>z)!==(P[j][1]>z)&&x<(P[j][0]-P[i][0])*(z-P[i][1])/(P[j][1]-P[i][1])+P[i][0])c=!c;return c;};
 const at=Rr.at;let inside=0,outside=0,n=0;for(let x=-20;x<=280;x+=4)for(let z=-20;z<=60;z+=2.5){const c=FL.contains(x,z),p=inPoly(H.shape.pts,x-at[0],z-at[2]);n++;if(c&&!p)inside++;if(!c&&p&&ref(FL.front,x,z,0).q>9+3)outside++;}
 ok('the hazard body: drown on stateFn KHAZ.front with the same front record; its polygon holds every channel point ('+inside+' missed) and nothing 3 m past it ('+outside+' of '+n+')',
  H.kind==='drown'&&H.stateFn==='KHAZ.front'&&JSON.stringify(H.front)===JSON.stringify(FL.front)&&H.shape.type==='poly'&&inside===0&&outside===0&&H.shape.y0+at[1]<5.5&&H.shape.y1+at[1]>10+4.5&&Rr.tags.hazard.kind==='drown'&&Rr.id==='flood:gorge');
 const X=W.export(),o=X.surfaces[FL.id],j=JSON.parse(JSON.stringify(X));
 ok('WATER.export lists the flood with the whole record (the same fields the hazard reads); plain data',o.kind==='flood'&&o.key==='gorge'&&['path','w','speed','start','period','rise','hold','fall','depth','base'].every(k=>JSON.stringify(o[k])===JSON.stringify(H.front[k]))&&o.law&&JSON.stringify(j)===JSON.stringify(X));
 ok('WATER.frontLevel on the bare record is S.levelAt (a port\'s twin)',W.frontLevel(H.front,150,123)===FL.levelAt(150,123)&&W.frontProject(H.front,120,10).s===FL.project(120,10).s);}

// ---------------------------------------------------------------- the GLSL: the same law as text
{let worst=0,n=0;for(const F of [FL,W.flood({key:'g2',path:[[0,0,0],[80,-4,30]],w:4,speed:1.5,start:-7,period:240.5,rise:12,hold:0,fall:40,depth:2,base:.3}),W.flood({key:'g3',path:[[0,0,0],[50,-1,0]],w:3,speed:2,start:5,rise:0,hold:10,fall:0,depth:1})]){
  const P=glslProgram(W.floodGLSL(F),{});for(let t=-40;t<1300;t+=3.7)for(let s=0;s<=F.length;s+=F.length/9){const b=F.bedAt(s);worst=Math.max(worst,Math.abs(P.run('wfLevel',s,b,t)-F.levelAt(s,t)));n++;}}
 ok('the flood GLSL (wfLevel) equals S.levelAt ('+n+' samples over three floods: periodic, a negative start, once with no rise or fall; worst '+worst.toExponential(1)+')',worst<1e-12);
 const P=glslProgram(W.floodGLSL(FL).replace('/3.0;','/3.5;'),{});let w2=0;for(let t=0;t<300;t+=3.7)w2=Math.max(w2,Math.abs(P.run('wfLevel',150,FL.bedAt(150),t)-FL.levelAt(150,t)));
 ok('the GLSL comparison catches a changed speed',w2>1e-3,false);}

// ---------------------------------------------------------------- the drawing, on a three.js stub (test-kinds-ext.js's; no GPU: not judged by eye)
{class Color{constructor(h){h=h==null?0:h;this.r=((h>>16)&255)/255;this.g=((h>>8)&255)/255;this.b=(h&255)/255;}getHexString(){return'000000';}}
 class V2{constructor(x,y){this.x=x||0;this.y=y||0;}}
 class BA{constructor(a,n){this.array=a;this.itemSize=n;}}
 class F32 extends BA{constructor(a,n){super(Float32Array.from(a),n);}}
 class BG{constructor(){this.attributes={};this.index=null;}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=Array.from(i);}computeBoundingSphere(){this.boundingSphere={radius:1};}}
 class Mat{constructor(o){Object.assign(this,{transparent:false,depthWrite:true,roughness:1,metalness:0,envMapIntensity:1,normalScale:new V2(1,1),userData:{}},o||{});this.color=new Color(this.color);}customProgramCacheKey(){return'';}onBeforeCompile(){}}
 class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.renderOrder=0;this.name='';}raycast(){}}
 const T3={Color,Vector2:V2,BufferGeometry:BG,Float32BufferAttribute:F32,MeshStandardMaterial:Mat,Mesh};
 const SCENE={children:[],add(m){this.children.push(m);}};
 A.T=T3;A.h={scene:SCENE,THREE:T3};A.U={waveTime:{value:0},waveAmp:{value:1},rain:{value:0}};A.hooks=[];A.skyEnv=null;
 const VS='#include <common>\n#include <beginnormal_vertex>\n#include <begin_vertex>\n#include <project_vertex>\n',FS='#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <metalnessmap_fragment>\n#include <normal_fragment_begin>\n#include <emissivemap_fragment>\n';
 const D=W.drawFlood(FL,{step:5,across:4}),g=D.mesh.geometry,R=D.ribbon,sh={uniforms:{},vertexShader:VS,fragmentShader:FS};D.material.onBeforeCompile(sh,null);
 const fl=g.attributes.wtrFlood.array;let bedOk=true;for(let i=0;i<R.count;i++)if(Math.abs(fl[i*3+1]-FL.bedAt(fl[i*3]))>1e-4)bedOk=false;
 const w0=Math.hypot(R.pos[0]-R.pos[R.cols*3-3],R.pos[2]-R.pos[R.cols*3-1]);
 ok('drawFlood: one ribbon, '+R.rows+' rows of '+R.cols+', 2 (w + margin) wide ('+w0.toFixed(2)+' m), each vertex at its row\'s bed with its s and bed y',SCENE.children.includes(D.mesh)&&R.rows===Math.ceil(FL.length/5)+1&&R.cols===5&&Math.abs(w0-19)<1e-9&&bedOk&&fl[fl.length-3]===Math.fround(FL.length)&&W.drawn.includes(D));
 ok('its vertex shader lifts by the law\'s text (wfLevel) on the flood clock, and keeps the flow look (wtrFlowN, wtrFlowFoam)',sh.vertexShader.includes(W.floodGLSL(FL))&&/transformed\.y=vWtrD>/.test(sh.vertexShader)&&sh.uniforms.wtrFloodT===W.floodUniforms({})&&
  sh.fragmentShader.includes('wtrFlowN(vWtrW.xz')&&sh.fragmentShader.includes('wtrFlowFoam(vWtrS,vWtrB)')&&/discard/.test(sh.fragmentShader)&&D.material.customProgramCacheKey().startsWith('wtr-flood:'));
 const P=glslProgram(W.floodGLSL(FL),{});let worst=0;for(let i=0;i<R.count;i+=7)for(const t of[0,55,87.3,140,600.5])worst=Math.max(worst,Math.abs(P.run('wfLevel',R.flood[i*3],R.flood[i*3+1],t)-FL.levelAt(R.flood[i*3],t)));
 ok('at every ribbon vertex the shader\'s level is S.levelAt of its row (worst '+worst.toExponential(1)+')',worst<1e-12);
 const U={value:5},sh2={uniforms:{},vertexShader:VS,fragmentShader:FS};W.drawFlood(FL,{uniforms:{uT:U}}).material.onBeforeCompile(sh2,null);
 ok('a page\'s own clock (o.uniforms.uT) drives it; a still pool cannot be drawn as a flood',sh2.uniforms.wtrFloodT===U&&throws(()=>W.drawFlood(POOL,{})));}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
