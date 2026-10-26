// node core/water/test-gaps.js [--golden-from <dir>] — the water gaps closed 2026-10-21: (a) NEUTRALITY: every new option's default
// reproduces the previous output exactly (the shaders' text, the meshes' arrays, the materials' state, the export), checked as
// hashes of a snapshot taken from the code as it stood before the change (GOLDEN below; `--golden-from <dir>` prints a new one
// from fragments copied into <dir>); (b) each option, with a negative control, in test-water.js and here (the new fragments in
// core/water/ext/ run here, with a three.js stub: no GPU).
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.join(__dirname,'..','..');
const argv=process.argv.slice(2),gi=argv.indexOf('--golden-from'),FROM=gi>=0?argv[gi+1]:null;
const rd=f=>fs.readFileSync(f,'utf8');
const W_DIR=FROM||path.join(ROOT,'core/water');
const files=[path.join(ROOT,'core/atmos/89-atmos-0-core.js'),path.join(ROOT,'core/atmos/89-atmos-0p-presets.js'),path.join(ROOT,'core/atmos/89-atmos-a-waves.js'),
 ...['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js'].map(f=>path.join(W_DIR,f))];
const EXT=FROM?[]:['53-core-water-terraces.js','53b-core-water-terraces-draw.js'].map(f=>path.join(ROOT,'core/water/ext',f)).filter(f=>fs.existsSync(f));
global.window=global;
eval(files.concat(EXT).map(rd).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=ATMOS,W=WATER;

// ---------------------------------------------------------------- a three.js stub: what the drawings touch, and records what they set
class Color{constructor(h){h=h==null?0:h;this.r=((h>>16)&255)/255;this.g=((h>>8)&255)/255;this.b=(h&255)/255;}getHexString(){return'000000';}}
class V2{constructor(x,y){this.x=x||0;this.y=y||0;}set(x,y){this.x=x;this.y=y;return this;}}
class V3{constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}}
class V4{constructor(x,y,z,w){this.x=x||0;this.y=y||0;this.z=z||0;this.w=w||0;}set(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w;return this;}}
class BA{constructor(a,n){this.array=a;this.itemSize=n;this.updateRange={};}setUsage(){}}
class F32 extends BA{constructor(a,n){super(Float32Array.from(a),n);}}
class BG{constructor(){this.attributes={};this.index=null;}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=Array.from(i);}computeBoundingSphere(){}rotateX(){return this;}translate(x,y,z){this.t=[x,y,z];return this;}}
class IBG extends BG{}
class Circle extends BG{constructor(r,n){super();this.r=r;this.n=n;}}
class Mat{constructor(o){Object.assign(this,{transparent:false,depthWrite:true,polygonOffset:false,polygonOffsetFactor:0,polygonOffsetUnits:0,roughness:1,metalness:0,envMapIntensity:1,normalScale:new V2(1,1),color:new Color(0xffffff),userData:{}},o||{});}
 customProgramCacheKey(){return'';}onBeforeCompile(){}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.position=new V3();this.renderOrder=0;this.name='';this.visible=true;}raycast(){return'three';}updateMatrixWorld(){}}
class Points extends Mesh{}
class DataTexture{constructor(d,w,h){this.image={data:d,width:w,height:h};}}
const THREE_STUB={Color,Vector2:V2,Vector3:V3,Vector4:V4,BufferGeometry:BG,InstancedBufferGeometry:IBG,Float32BufferAttribute:F32,InstancedBufferAttribute:BA,CircleGeometry:Circle,
 MeshStandardMaterial:Mat,MeshLambertMaterial:Mat,Mesh,Points,DataTexture,DynamicDrawUsage:1,RGBAFormat:1,UnsignedByteType:1,LinearFilter:1,ClampToEdgeWrapping:1,DoubleSide:2,
 Frustum:class{setFromProjectionMatrix(){}intersectsBox(){return true;}},Matrix4:class{multiplyMatrices(){}},Box3:class{constructor(){this.min=new V3();this.max=new V3();}}};
const SCENE={children:[],add(m){this.children.push(m);}};
A.T=THREE_STUB;A.h={scene:SCENE,THREE:THREE_STUB};A.U={waveTime:{value:0},waveAmp:{value:1}};A.hooks=A.hooks||[];A.skyEnv=null;
A.PRESETS.smoke=Object.assign(A.PRESETS.smoke||{},{spray:{index:0}});A.smoke=(list,o)=>({smoke:list,o});
A.clock=A.clock||{t:0};
const VS='#include <common>\n#include <beginnormal_vertex>\n#include <begin_vertex>\n#include <project_vertex>\n',FS='#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <metalnessmap_fragment>\n#include <normal_fragment_begin>\n#include <emissivemap_fragment>\n';
// a material's compiled text as the stub sees it
const compiled=m=>{const sh={uniforms:{},vertexShader:VS,fragmentShader:FS};m.onBeforeCompile(sh,null);return{key:m.customProgramCacheKey(),vs:sh.vertexShader,fs:sh.fragmentShader,uniforms:Object.keys(sh.uniforms).sort()};};
const geo=g=>{const o={idx:g.index};for(const k of Object.keys(g.attributes).sort())o[k]=Array.from(g.attributes[k].array);return o;};
const meshInfo=m=>({name:m.name,ro:m.renderOrder,ud:Object.keys(m.userData).sort().filter(k=>k!=='water'),rc:String(m.raycast).slice(0,40),pos:[m.position.x,m.position.y,m.position.z],
 mat:{t:m.material.transparent,dw:m.material.depthWrite,po:m.material.polygonOffset,pf:m.material.polygonOffsetFactor,pu:m.material.polygonOffsetUnits,r:m.material.roughness,me:m.material.metalness,sd:m.material.side||0},
 c:compiled(m.material)});
const H=x=>crypto.createHash('sha256').update(JSON.stringify(x,(k,v)=>typeof v==='number'&&!isFinite(v)?String(v):v)).digest('hex').slice(0,16);

// ---------------------------------------------------------------- the snapshot (every default the pages take)
const SNAP=()=>{const out={},put=(k,v)=>{out[k]=H(v);};
 const ground=(x,z)=>-6+.012*x+3*Math.sin(x*.01)*Math.cos(z*.013)+(x<-250?9:0);
 // open: no bed, bed, transparent, a shore grid, a mask, a window, an origin
 const O1=W.open({name:'sea0',swell:'ringsea',field:.5});put('glsl.open',W.glsl(O1));put('draw.open',meshInfo(W.draw(O1,{color:0x06222e}).mesh));
 const O2=W.open({name:'sea1',swell:'ringsea',field:.5,level:.2,bed:ground,bedBox:[-300,-300,300,300],bedCell:6,bounds:[-300,-300,300,300]});put('glsl.bed',W.glsl(O2));
 const D2=W.draw(O2,{color:0x06222e,shallow:0x336655,deep:0x0a2030,transparent:true,surf:120,renderOrder:2});put('draw.bed',meshInfo(D2.mesh));
 const O3=W.open({name:'sea2',swell:'ringsea',field:.5,bed:ground,bedBox:[-300,-300,300,300],shore:{cell:5,seeds:[[100,0],[140,60]],band:60}});put('glsl.shore',W.glsl(O3));
 put('shore.bytes',Array.from(O3.bed.data));put('shore.wet',[O3.bed.wetCells,O3.bed.clip,O3.bed.band]);put('draw.shore',meshInfo(W.draw(O3,{}).mesh));
 const mk=new Uint8Array(20*20).fill(0);for(let i=5;i<15;i++)for(let j=3;j<12;j++)mk[j*20+i]=255;
 const O4=W.open({name:'sea3',swell:[],field:0,level:0,mask:{x0:-100,z0:-100,cell:10,nx:20,nz:20,data:mk}});put('glsl.mask',W.glsl(O4));put('draw.mask',meshInfo(W.draw(O4,{origin:64,hideEmpty:true}).mesh));
 const O5=W.open({name:'sea4',swell:'ringsea',field:.3,bed:ground,shore:{window:400,cell:8,seeds:[[200,0]]}});put('glsl.window',W.glsl(O5));put('window.blank',Array.from(O5.bed.data).slice(0,64));
 W.moveShore(O5,20,0);put('window.bytes',Array.from(O5.bed.data));
 // flow
 const pts=[];for(let i=0;i<=24;i++)pts.push([i*14,6*Math.sin(i*.5),20-i*.8-(i>12?(i-12)*.9:0)]);
 const F=W.flow({name:'river',pts,width:8,speed:1.4});put('flow.pts',F.pts);put('flow.ribbon',W.ribbon(F,{}));put('flow.glsl',W.flowGLSL());
 const DF=W.drawFlow(F,{});put('draw.flow',[meshInfo(DF.mesh),geo(DF.mesh.geometry)]);
 const DF2=W.drawFlow(W.flow({name:'river2',pts,width:[6,7,8].concat(Array(22).fill(9)).slice(0,25),speed:1}),{origin:true,transparent:false,renderOrder:4,shallow:0x445566,deep:0x112233});put('draw.flow2',[meshInfo(DF2.mesh),geo(DF2.mesh.geometry)]);
 const nrm=[];for(const t of[0,12.3,401.7])for(const sl of[0,.02,.06,.2])nrm.push(W.flowNormal(31,-17,1.2,.4,sl,t),W.flowFoam(sl,.4));put('flow.twins',nrm);
 const FS_=W.fallsOf(W.flow({name:'steps',pts:[[0,0,40],[10,0,40],[14,0,20],[22,0,20],[26,0,5],[40,0,5]],width:6,speed:1}),{steep:.5,minDrop:3});
 put('fallsOf',FS_.map(f=>({name:f.name,lip:f.lip,dir:f.dir,speed:f.speed,drop:f.drop})));
 // fall and still
 const FL=W.fall({name:'cataract',lip:[[0,0,60],[0,20,60]],dir:[1,0],speed:2.5,drop:45});put('fall.rec',[FL.tFall,FL.lipW,FL.spread,FL.speed,FL.plunge]);put('fall.curtain',W.curtain(FL,{}));put('fall.glsl',W.fallGLSL(FL));
 const DFa=W.drawFall(FL,{});put('draw.fall',[meshInfo(DFa.mesh),meshInfo(DFa.plunge),geo(DFa.mesh.geometry),!!DFa.spray]);
 const DFb=W.drawFall(W.fall({name:'cat2',lip:[[0,0,30],[0,9,30]],dir:[0,1],drop:12}),{plunge:false,rows:10,cols:3,color:0xaabbcc,opacity:.8});put('draw.fall2',[meshInfo(DFb.mesh),geo(DFb.mesh.geometry)]);
 const ST=W.still({name:'poolL',level:3,poly:[[0,0],[20,0],[20,8],[8,8],[8,20],[0,20]],fountain:[4,4]});put('still.mesh',W.stillMesh(ST));put('still.glsl',W.stillGLSL(ST));
 const DS=W.drawStill(ST,{color:0x336655,opacity:.7});put('draw.still',[meshInfo(DS.mesh),geo(DS.mesh.geometry)]);
 const DS2=W.drawStill(W.still({name:'box',level:1,bounds:[0,0,9,9]}),{});put('draw.still2',[meshInfo(DS2.mesh),geo(DS2.mesh.geometry)]);
 put('stillMaterial',compiled(W.stillMaterial({color:0x123456})));
 // wetGround: a ground whose own hook was written first
 const G1=new THREE_STUB.MeshLambertMaterial({});G1.onBeforeCompile=function(sh){sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nPAGE;');};
 W.wetGround(G1,{surface:O3});put('wetGround.page',compiled(G1));
 const G2=new THREE_STUB.MeshLambertMaterial({});W.wetGround(G2,{});put('wetGround.rain',compiled(G2));
 put('export',JSON.parse(JSON.stringify(W.export())));
 return out;};
const snap=SNAP();
if(FROM){console.log(JSON.stringify(snap,null,1));process.exit(0);}

// ---------------------------------------------------------------- the golden (taken from the fragments as of 2026-10-20, before the gaps)
const GOLDEN=require('./test-gaps.golden.json');
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-9);
{const keys=Object.keys(GOLDEN),miss=keys.filter(k=>snap[k]!==GOLDEN[k]);
 ok('neutral by default: '+keys.length+' snapshots of the shaders\' text, the meshes, the materials and the export are what they were before the options ('+(miss.length?'differ: '+miss.join(', '):'all equal')+')',!miss.length,false);
 // the negative: the snapshot does see a change (one surface with the option on differs)
 const o1=W.open({name:'neg',swell:'ringsea',field:.5,bed:(x,z)=>-6+.012*x,bedBox:[-300,-300,300,300],bedCell:6});
 const a=H(meshInfo(W.draw(o1,{color:0x06222e}).mesh)),b=H(meshInfo(W.draw(o1,{color:0x06222e,surf:false}).mesh));
 ok('the snapshot sees a changed option (surf:false changes the compiled text: negative control)',a!==b,a===b);}


// ================================================================ the options, each with its negative control
const RAY=(ox,oy,oz,dx,dy,dz)=>{const l=Math.hypot(dx,dy,dz);return{ray:{origin:{x:ox,y:oy,z:oz},direction:{x:dx/l,y:dy/l,z:dz/l}},near:0,far:1e9};};
const finish=()=>{console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);};
// ---- gap 1: rapids per flow (the GLSL against the twins is in test-water.js)
{const pts=[[0,0,50],[100,0,45],[200,0,40]],F=W.flow({name:'g1 torrent',pts,width:6,speed:3,rapids:[.2,1]}),F0=W.flow({name:'g1 brook',pts,width:6,speed:3});
 const D=W.drawFlow(F0,{rapids:[.1,.3]}),D0=W.drawFlow(W.flow({name:'g1 plain',pts,width:6}),{}),Dr=W.drawFlow(F,{});
 const fs=m=>compiled(m.material).fs;
 ok('gap 1: flow({rapids}) is the record ('+JSON.stringify(F.rapids)+') and drawFlow reads it: its fragment holds smoothstep(0.2,1.0,slope), the plain flow\'s the preset\'s 0.015,0.12',
  F.rapids[0]===.2&&/smoothstep\(0\.2,1\.0,slope\)/.test(fs(Dr.mesh))&&/smoothstep\(0\.015,0\.12,slope\)/.test(fs(D0.mesh))&&!/smoothstep\(0\.2,1\.0,slope\)/.test(fs(D0.mesh)),false);
 ok('...drawFlow({rapids}) overrides and records it on the flow ('+JSON.stringify(F0.rapids)+'); the export lists a band only for a flow that has one',
  JSON.stringify(F0.rapids)==='[0.1,0.3]'&&/smoothstep\(0\.1,0\.3,slope\)/.test(fs(D.mesh))&&JSON.stringify(W.export().surfaces.find(s=>s.name==='g1 torrent').rapids)==='[0.2,1]'&&!('rapids' in W.export().surfaces.find(s=>s.name==='g1 plain')),
  'rapids' in W.export().surfaces.find(s=>s.name==='g1 plain'));
 ok('...two flows with two bands draw as two programs (distinct cache keys): the page needs no preset write',compiled(Dr.mesh.material).key!==compiled(D0.mesh.material).key&&W.PRESETS.flow.rapids[1]===.12,compiled(Dr.mesh.material).key===compiled(D0.mesh.material).key);}
// ---- gap 2: a width profile along the line
{const L=[[0,0,10],[50,0,9],[100,0,8],[150,0,7],[200,0,6]];
 const prof=W.flow({name:'g2 profile',pts:L,width:[[0,4],[100,10],[200,4]]}),fn=W.flow({name:'g2 fn',pts:L,width:s=>2+s/100}),arr=W.flow({name:'g2 array',pts:L,width:[5,6,7,8,9]}),sc=W.flow({name:'g2 scalar',pts:L,width:8});
 const w=F=>F.pts.map(p=>p.w);
 ok('gap 2: a profile [[s, w]] over the metres along the line ('+w(prof)+'), a function of s ('+w(fn)+'), a per-point array ('+w(arr)+') and a scalar ('+w(sc)+') all give each point its width',
  JSON.stringify(w(prof))==='[4,7,10,7,4]'&&JSON.stringify(w(fn))==='[2,2.5,3,3.5,4]'&&JSON.stringify(w(arr))==='[5,6,7,8,9]'&&w(sc).every(v=>v===8),w(prof)[1]!==7);
 const dn=W.flow({name:'g2 dense',pts:L,width:[[0,4],[100,10],[200,4]],densify:25}),da=W.flow({name:'g2 dense arr',pts:[[0,0,5],[100,0,4]],width:[4,10],densify:50});
 ok('...densify puts a point every 25 m so a profile that breathes faster than the line\'s vertices is drawn as it is ('+dn.pts.length+' points: '+w(dn).map(v=>v.toFixed(1))+'), a per-point array spreading over them ('+w(da)+')',
  dn.pts.length===9&&Math.abs(dn.pts[1].w-5.5)<1e-9&&Math.abs(dn.pts[4].w-10)<1e-9&&JSON.stringify(w(da))==='[4,7,10]'&&dn.pts.every((p,i)=>Math.abs(p.x-i*25)<1e-9),dn.pts.length===5);
 const R=W.ribbon(prof,{across:2,step:1e9}),across=i=>Math.hypot(R.pos[(i*3+2)*3]-R.pos[(i*3)*3],R.pos[(i*3+2)*3+2]-R.pos[(i*3)*3+2]);
 ok('...the ribbon is as wide as the channel there plus its margins ('+[0,1,2].map(i=>across(i).toFixed(1))+' m at the first three rows: 4, 7, 10 + 3)',Math.abs(across(0)-7)<1e-9&&Math.abs(across(1)-10)<1e-9&&Math.abs(across(2)-13)<1e-9,Math.abs(across(0)-4)<1e-9);
 ok('...a one-point-too-short array holds its last value (it was undefined, then NaN, before)',w(W.flow({name:'g2 short',pts:L,width:[5,6]})).every(v=>isFinite(v))&&w(W.flow({name:'g2 short2',pts:L,width:[5,6]}))[4]===6,false);}
// ---- gap 3: the depth bias
{const pts=[[0,0,2],[100,0,2]],F=W.flow({name:'g3 flow',pts,width:6}),a=W.drawFlow(F,{}),b=W.drawFlow(F,{depthBias:2}),c=W.drawFlow(F,{depthBias:[1.5,3],depthWrite:true});
 const m=x=>x.material;
 ok('gap 3: a flow with depthBias n is polygon-offset toward the camera (factor '+m(b).polygonOffsetFactor+', units '+m(b).polygonOffsetUnits+'); [factor, units] sets both; depthWrite overrides; none of it without the option',
  m(b).polygonOffset&&m(b).polygonOffsetFactor===-2&&m(b).polygonOffsetUnits===-2&&m(c).polygonOffsetFactor===-1.5&&m(c).polygonOffsetUnits===-3&&m(c).depthWrite===true&&!m(a).polygonOffset&&m(a).depthWrite===false,m(a).polygonOffset);
 const O=W.open({name:'g3 sea',swell:[],field:0,level:2}),Do=W.draw(O,{depthBias:-4}),Dn=W.draw(O,{}),S=W.still({name:'g3 pool',level:2,bounds:[0,0,5,5]}),Ds=W.drawStill(S,{depthBias:1}),Dfl=W.drawFall(W.fall({name:'g3 fall',lip:[[0,0,5],[0,4,5]],dir:[1,0],drop:5}),{depthBias:1});
 ok('...the open surface pushed back (-4 -> factor +4), a still pool and a fall with the same option; the open surface\'s default is untouched',
  m(Do.mesh).polygonOffsetFactor===4&&m(Do.mesh).polygonOffset&&!m(Dn.mesh).polygonOffset&&m(Ds.mesh).polygonOffsetFactor===-1&&m(Dfl.mesh).polygonOffsetFactor===-1&&m(Dfl.plunge).polygonOffsetFactor===-1,m(Dn.mesh).polygonOffset);
 ok('...the bias is a record in the export (the flow\'s ribbon option, the open surface\'s draw record) and a plain flow\'s ribbon option has none',
  JSON.stringify(W.export().surfaces.find(s=>s.name==='g3 flow').ribbon.depthBias)==='[1.5,3]'&&JSON.stringify(W.export().surfaces.find(s=>s.name==='g3 sea').draw)==='{"depthBias":-4}'&&!('depthBias' in (W.export().surfaces.find(s=>s.name==='g1 plain').ribbon||{})),false);}
// ---- gap 4: surf:false, surfDepth, ramp
{const ground=(x,z)=>-.3+.004*x,mk=(n,o)=>{const S=W.open({name:n,swell:[],field:0,level:0,bed:ground,bedBox:[-100,-100,100,100],bedCell:4,bounds:[-100,-100,100,100]});return{S,D:W.draw(S,o)};};
 const lap=/wtrFoamK=max\(wtrFoamK,0\.55\*/,fsOf=D=>compiled(D.mesh.material).fs;
 const a=mk('g4 default',{}),b=mk('g4 off',{surf:false}),c=mk('g4 depth',{surfDepth:.5}),d=mk('g4 band',{surfDepth:[.2,.9],ramp:[.1,3]});
 ok('gap 4: the lap\'s white bands are in the fragment by default (smoothstep 0.1..1.4), gone with surf:false, and bounded by surfDepth (a number n: 0.1..n; [lo, hi])',
  lap.test(fsOf(a.D))&&/smoothstep\(0\.1,1\.4,wtrDp\)/.test(fsOf(a.D))&&!lap.test(fsOf(b.D))&&/smoothstep\(0\.1,0\.5,wtrDp\)/.test(fsOf(c.D))&&/smoothstep\(0\.2,0\.9,wtrDp\)/.test(fsOf(d.D)),lap.test(fsOf(b.D)));
 ok('...the ramp [a, b] replaces smoothstep(0.5, 9.0) of shallow to deep (default text kept)',/mix\(vec3\([^)]*\),vec3\([^)]*\),smoothstep\(0\.5,9\.0,wtrDp\)\)/.test(fsOf(a.D))&&/smoothstep\(0\.1,3\.0,wtrDp\)\)/.test(fsOf(d.D)),!/smoothstep\(0\.1,3\.0,wtrDp\)\)/.test(fsOf(d.D)));
 // the exported depth is the ground's, with no clamp at 1.4 m: the bed keeps the true depth of the shallows when the lap is off
 const x=-60,truth=0-ground(x,0),clamped=Math.max(truth,1.4);   // the workaround baked min(ground, -1.4): depth >= 1.4
 ok('...with the lap off the baked bed need not lie: depth at x = -60 is '+b.S.depthAt(x,0,0).toFixed(3)+' m (the ground\'s '+truth.toFixed(3)+'), where the workaround\'s clamp would say '+clamped.toFixed(2),Math.abs(b.S.depthAt(x,0,0)-truth)<.03&&clamped-truth>.8,Math.abs(b.S.depthAt(x,0,0)-clamped)<.03);
 const ex=n=>W.export().surfaces.find(s=>s.name===n);
 ok('...the choices are in the export ('+JSON.stringify(ex('g4 off').draw)+', '+JSON.stringify(ex('g4 band').draw)+') and a default surface\'s record carries none',ex('g4 off').draw.surf===false&&ex('g4 band').draw.ramp[1]===3&&!('draw' in ex('g4 default')),'draw' in ex('g4 default'));}
// ---- gap 5 (data): the tint field and the gradient in the records; (the GLSL is in test-water.js)
{const S=W.open({name:'g5 tint',swell:[],field:0,level:0,tint:{box:[0,0,40,40],cell:10,at:(x,z)=>x<20?null:{c:0x336699,a:.5}}}),ex=W.export().surfaces.find(s=>s.name==='g5 tint');
 const D=W.draw(S,{});const U=D.uniforms;
 ok('gap 5: the tint is baked to '+S.tint.nx+' x '+S.tint.nz+' premultiplied bytes ('+Array.from(S.tint.data.slice(8,12))+' in a coloured cell), a texture uniform, a line in the fragment after the depth ramp, and a record in the export',
  S.tint.nx===4&&S.tint.data[2*4]===Math.round(0x33*.5)&&S.tint.data[3]===0&&S.tint.data[2*4+3]===128&&U.wtrTint&&/wtrTintAt\(vWtrP\)/.test(compiled(D.mesh.material).fs)&&ex.tint.nx===4&&!/wtrTint/.test(compiled(W.draw(W.open({name:'g5 plain',swell:[],field:0}),{}).mesh.material).fs),false);
 const raw=W.open({name:'g5 raw',swell:[],field:0,tint:{x0:0,z0:0,cell:10,nx:2,nz:2,data:new Uint8Array([255,0,0,255, 0,0,0,0, 0,0,0,0, 0,255,0,255])}});
 ok('...or raw bytes ({x0, z0, cell, nx, nz, data}), read as the twin reads them (red corner '+raw.tintAt(5,5)+')',raw.tintAt(5,5)[0]===1&&raw.tintAt(5,5)[3]===1&&raw.tintAt(15,5)[3]===0&&raw.tintAt(-1,5)[3]===0,raw.tintAt(15,5)[3]===1);
 const g=W.still({name:'g5 grad',level:1,bounds:[0,0,10,10],gradient:{centre:0x111111,rim:0xeeeeee,power:2}}),Dg=W.drawStill(g,{}),Dp=W.drawStill(W.still({name:'g5 flat',level:1,bounds:[0,0,10,10]}),{}),Dt=W.drawStill(g,{tint:0x808080});
 ok('...the pool\'s gradient is a line in the fragment (replacing the colour), a tint multiplies it, a plain pool has neither and its program is the old one; the gradient is in the export',
  /wtrStillT\(vWtrW\.xz\)/.test(compiled(Dg.mesh.material).fs)&&/diffuseColor\.rgb\*=vec3/.test(compiled(Dt.mesh.material).fs)&&!/wtrStillT/.test(compiled(Dp.mesh.material).fs)&&!/diffuseColor\.rgb=mix\(vec3/.test(compiled(Dp.mesh.material).fs)&&W.export().surfaces.find(s=>s.name==='g5 grad').gradient.power===2&&
  compiled(Dg.mesh.material).key!==compiled(Dp.mesh.material).key,false);}
// ---- gap 6: pick
{const F=W.flow({name:'g6 flow',pts:[[0,0,2],[100,0,2]],width:6}),a=W.drawFlow(F,{}),b=W.drawFlow(F,{pick:true});
 ok('gap 6: a flow\'s mesh is skipped by the probe and its ray cast is a no-op by default; with pick:true it keeps the engine\'s ray cast, no probeSkip, and names itself for click-to-inspect',
  a.mesh.userData.probeSkip===true&&String(a.mesh.raycast)==='()=>{}'&&!b.mesh.userData.probeSkip&&b.mesh.raycast()==='three'&&b.mesh.userData.inspectLabel==='g6 flow'&&a.mesh.userData.inspectLabel===undefined,b.mesh.userData.probeSkip);
 const O=W.open({name:'g6 sea',swell:[],field:0,level:3,bounds:[-100,-100,100,100]}),Dn=W.draw(O,{}),Dp=W.draw(O,{pick:true}),hits=[],miss=[],none=[];
 Dp.mesh.raycast(RAY(10,40,-20,.2,-1,.1),hits);Dp.mesh.raycast(RAY(500,40,0,0,-1,0),miss);Dn.mesh.raycast(RAY(10,40,-20,.2,-1,.1),none);
 ok('...an open surface\'s grid has no shape, so pick:true casts the ray at the plane of its level: a ray from (10, 40, -20) lands at y = '+(hits[0]&&hits[0].point.y)+', '+(hits[0]&&hits[0].distance.toFixed(2))+' m along; one outside its bounds hits nothing; the default casts nothing',
  hits.length===1&&Math.abs(hits[0].point.y-3)<1e-9&&Math.abs(hits[0].distance-37*Math.hypot(.2,1,.1))<1e-9&&Math.abs(hits[0].point.x-(10+.2*37))<1e-9&&miss.length===0&&none.length===0&&Dp.mesh.userData.inspectLabel==='g6 sea'&&!Dp.mesh.userData.probeSkip&&Dn.mesh.userData.probeSkip===true,hits.length===0);
 // the waves lift it: the hit is on the surface heightAt gives
 const W2=W.open({name:'g6 swell',swell:'ringsea',field:.5,level:0}),D2=W.draw(W2,{pick:true}),h2=[];D2.mesh.raycast(RAY(100,60,50,.05,-1,.02),h2);
 const ht=h2.length?W2.heightAt(h2[0].point.x,h2[0].point.z,A.clock.t):NaN;
 ok('...and the hit is on the waves: its height is heightAt there ('+(h2[0]&&h2[0].point.y.toFixed(3))+' vs '+ht.toFixed(3)+')',h2.length===1&&Math.abs(h2[0].point.y-ht)<1e-6&&Math.abs(h2[0].point.y)>1e-4,h2.length===1&&Math.abs(h2[0].point.y)<1e-6);}
// ---- gap 7: fallsOf's foot, a fall that fits its chute, tall drops, merged falls
{const F=W.flow({name:'g7 steps',pts:[[0,0,40],[10,0,40],[14,0,20],[22,0,20],[26,0,5],[40,0,5]],width:6,speed:1}),fs=W.fallsOf(F,{steep:.5,minDrop:3}),fit=W.fallsOf(F,{steep:.5,minDrop:3,fit:true});
 ok('gap 7: fallsOf gives each fall the chute\'s foot [x, z, y] and its run ('+fs.map(f=>JSON.stringify(f.foot)+' run '+f.run.toFixed(2)).join(', ')+'), additive: the old keys are what they were',
  fs.length===2&&JSON.stringify(fs[0].foot)==='[14,0,20]'&&JSON.stringify(fs[1].foot)==='[26,0,5]'&&Math.abs(fs[0].run-4)<1e-9&&Math.abs(fs[1].run-4)<1e-9&&fs[0].fit===undefined&&fit[0].fit===true&&Object.keys(fs[0]).sort().join()==='drop,dir,foot,lip,name,run,speed'.split(',').sort().join(),false);
 const A0=W.fall(fs[0]),A1=W.fall(Object.assign({},fit[0],{name:'g7 fit'})),foot=A1.curtainAt(.5,1);
 ok('...W.fall keeps the foot and run (export lists them), and {fit: true} sets the speed to run / tFall ('+A1.speed.toFixed(3)+') so the curtain lands on the foot ('+foot.map(v=>v.toFixed(3))+'), where the line\'s own speed (1 m/s) lands '+A0.curtainAt(.5,1)[0].toFixed(2)+' m out',
  A0.run===4&&Math.abs(A1.speed-4/A1.tFall)<1e-12&&Math.abs(foot[0]-14)<1e-9&&Math.abs(foot[2]-0)<1e-9&&Math.abs(foot[1]-20)<1e-9&&Math.abs(A0.curtainAt(.5,1)[0]-14)>1&&W.export().surfaces.find(s=>s.name==='g7 fit').run===4,Math.abs(A0.curtainAt(.5,1)[0]-14)<1e-9);}
{// a 70 m cataract (oidong), a 30 m fall (Throne): the curtain's numbers hold
 for(const[drop,lipW,sp]of[[70,30,4],[30,12,2.5]]){const S=W.fall({name:'g7 tall '+drop,lip:[[0,0,100],[0,lipW,100]],dir:[1,0],speed:sp,drop}),M=W.curtain(S,{});let mono=true,fin=true,unit=true,wid=true;
  for(let r=0;r<=M.rows;r++){const k=r*(M.cols+1);if(r>0&&!(M.pos[k*3+1]<M.pos[(k-M.cols-1)*3+1]))mono=false;
   for(let c=0;c<=M.cols;c++){const q=(k+c)*3;fin=fin&&isFinite(M.pos[q])&&isFinite(M.pos[q+1])&&isFinite(M.pos[q+2]);unit=unit&&Math.abs(Math.hypot(M.nrm[q],M.nrm[q+1],M.nrm[q+2])-1)<1e-9;}}
  const top=S.curtainAt(.5,0),bot=S.curtainAt(.5,1),P=W.plunge(S);let st=0,fin2=true;for(const t of[0,77,1e5+.5])for(const u of[0,.5,1])for(const fl of[0,.3,1]){const v=W.fallStreak(u,fl,t,S),ff=W.fallFoam(fl,v);st=Math.max(st,Math.abs(v));fin2=fin2&&isFinite(v)&&ff>=0&&ff<=1;}
  const pl=W.plungeAt(S,P.x+3,P.z,5);
  ok('gap 7, a '+drop+' m fall: the curtain leaves the lip at y '+top[1]+' and lands at y '+bot[1].toFixed(6)+' after '+S.tFall.toFixed(2)+' s ('+(M.rows)+' rows, '+(drop/M.rows).toFixed(2)+' m a row), descends every row, every normal is unit, the foot is '+(bot[0]).toFixed(2)+' m out, the pool\'s radius '+P.r.toFixed(1)+' m, streaks and foam stay in range',
   Math.abs(top[1]-100)<1e-12&&Math.abs(bot[1]-(100-drop))<1e-9&&Math.abs(bot[0]-sp*S.tFall)<1e-9&&mono&&fin&&unit&&fin2&&st<=1.0001&&P.r>=Math.max(lipW,drop*.05)-1e-9&&isFinite(pl[0])&&Math.abs(S.tFall-Math.sqrt(2*drop/9.81))<1e-12,false);
  const rows=W.curtainRows(S,{rowStep:1}),M2=W.curtain(S,{rowStep:1}),dr=W.drawFall(S,{rowStep:2});
  ok('...rowStep: 1 gives a row a metre ('+rows+' rows, '+M2.rows+' built; the default stays '+W.PRESETS.fall.rows+', and a small fall is not coarsened)',rows===Math.max(28,drop)&&M2.rows===rows&&W.curtainRows(S,{})===28&&W.curtainRows(S,{rows:9,rowStep:1})===9&&W.curtainRows(W.fall({name:'g7 small',lip:[[0,0,9],[0,3,9]],dir:[1,0],drop:5}),{rowStep:1})===28&&S.curtainOpt.rows===Math.max(28,drop/2),rows===28);
  W.surfaces.splice(W.surfaces.indexOf(S),1);}}
{// merged falls: many falls in two meshes, the arrays the per-fall curtains' concatenated
 const list=[];for(let i=0;i<5;i++)list.push(W.fall({name:'g7 m'+i,lip:[[100*i,0,60-5*i],[100*i,10+2*i,60-5*i]],dir:[1,0],speed:1.5+.2*i,drop:8+5*i}));
 const before=SCENE.children.length,M=W.mergedFalls(list,{}),D=W.drawFalls(list,{name:'g7 staircase'}),added=SCENE.children.length-before;
 let nv=0,sum=0,sumM=0;for(const S of list){const c=W.curtain(S,{});nv+=c.count;for(let i=1;i<c.pos.length;i+=3)sum+=c.pos[i];}for(let i=1;i<M.curtain.pos.length;i+=3)sumM+=M.curtain.pos[i];
 ok('gap 7, merged falls: '+list.length+' falls draw as '+added+' meshes ('+M.curtain.count+' curtain vertices = the '+nv+' of the five curtains, sums '+Math.abs(sum-sumM).toExponential(1)+' apart; '+M.plunge.count+' plunge-disc vertices), each fall\'s streak scale and fall time per vertex',
  added===2&&M.curtain.count===nv&&Math.abs(sum-sumM)<1e-9&&M.curtain.fp.length===nv*2&&M.curtain.fp[0]===list[0].lipW*W.PRESETS.fall.streak.across&&M.curtain.fp[M.curtain.fp.length-1]===list[4].tFall&&M.plunge.count===5*49&&M.curtain.idx.length===list.reduce((a,S)=>a+W.curtain(S,{}).idx.length,0)&&D.spray&&D.spray.smoke.length===15,false);
 const b2=SCENE.children.length;for(const S of list)W.drawFall(S,{});
 ok('...against drawing them one at a time: '+(SCENE.children.length-b2)+' meshes for the same five (negative control: the old cost, 2 each)',SCENE.children.length-b2===10&&added===2,SCENE.children.length-b2===added);
 const idxOK=M.curtain.idx.every(k=>k>=0&&k<M.curtain.count)&&M.plunge.idx.every(k=>k>=0&&k<M.plunge.count);
 let up=true;for(let i=0;i<M.plunge.idx.length;i+=3){const a=M.plunge.idx[i]*3,b=M.plunge.idx[i+1]*3,c=M.plunge.idx[i+2]*3,ny=(M.plunge.pos[b+2]-M.plunge.pos[a+2])*(M.plunge.pos[c]-M.plunge.pos[a])-(M.plunge.pos[b]-M.plunge.pos[a])*(M.plunge.pos[c+2]-M.plunge.pos[a+2]);if(!(ny>0))up=false;}
 ok('...every index is in range and every disc triangle faces up',idxOK&&up,!idxOK);
}
// ---- gap 8: the stepped river
W.surfaces.length=0;   // the queries below ask which surface holds a point: none of the earlier tests' may
{const T=W.terraces({name:'g8 river',line:[[0,0],[40,0],[80,30],[120,30],[160,0],[200,0]],levels:[10,8.5,7,5,4],riser:2,width:6}),n0=W.surfaces.length;
 ok('gap 8, terraces: five levels make '+T.pools.length+' pools (still polygons) and '+T.falls.length+' risers (falls), registered as ordinary surfaces ('+T.pools.concat(T.falls).map(S=>S.kind).join(',')+') and as a group in the export',
  T.pools.length===5&&T.falls.length===4&&T.pools.every(p=>p.kind==='still'&&p.poly.length>=4)&&T.falls.every(f=>f.kind==='fall')&&W.groups.includes(T)&&W.export().groups.length===1&&W.export().groups[0].pools.length===5,false);
 const drop=T.falls.reduce((a,f)=>a+f.drop,0);
 ok('...the levels, the drops ('+T.falls.map(f=>f.drop)+' = '+drop+' m, the top to the bottom tread) and, at each riser, the curtain\'s foot on the next tread\'s level at the next pool\'s edge',
  T.pools.map(p=>p.level).join()==='10,8.5,7,5,4'&&Math.abs(drop-6)<1e-12&&T.falls.every((f,i)=>{const e=f.curtainAt(.5,1);return Math.abs(e[1]-T.pools[i+1].level)<1e-9&&Math.abs(e[0]-f.foot[0])<1e-9&&Math.abs(e[2]-f.foot[1])<1e-9&&Math.abs(f.lip[0][2]-T.pools[i].level)<1e-12;}),false);
 // linked: the group's heightAt, W.at and W.heightAt over treads and riser faces
 const cum=[0];for(let i=1;i<T.line.length;i++)cum.push(cum[i-1]+Math.hypot(T.line[i][0]-T.line[i-1][0],T.line[i][1]-T.line[i-1][1]));
 const pt=s=>{let i=0;while(i+2<cum.length&&cum[i+1]<s)i++;const u=(s-cum[i])/(cum[i+1]-cum[i]);return[T.line[i][0]+(T.line[i+1][0]-T.line[i][0])*u,T.line[i][1]+(T.line[i+1][1]-T.line[i][1])*u];},pr=T.risers[0],pm=pt(pr.s0+pr.run/2),pe=pt(pr.s0+.5);
 ok('...linked: over a tread heightAt is its level ('+T.heightAt(10,0)+'), W.at names the pool ('+(W.at(10,0)&&W.at(10,0).name)+'), W.heightAt agrees; on a riser\'s face the group gives the slope between ('+T.heightAt(pm[0],pm[1]).toFixed(3)+' half way between '+pr.y0+' and '+pr.y1+') and W.heightAt asks the group; off the water null',
  T.heightAt(10,0)===10&&W.at(10,0)===T.pools[0]&&W.heightAt(10,0,0)===10&&Math.abs(T.heightAt(pm[0],pm[1])-(pr.y0+pr.y1)/2)<1e-9&&Math.abs(W.heightAt(pm[0],pm[1],0)-(pr.y0+pr.y1)/2)<1e-9&&T.heightAt(10,9)===null&&W.heightAt(10,9,0)===null&&T.at(10,0).kind==='tread'&&T.at(pe[0],pe[1]).kind==='riser'&&T.at(pe[0],pe[1]).surface===T.falls[0],
  T.heightAt(10,9)!==null);
 const fa=T.flowAt(10,0),fr=T.flowAt(pm[0],pm[1]);
 ok('...the current: slow down a tread ('+fa.map(v=>v.toFixed(2))+'), the fall\'s speed down a riser ('+fr[2].toFixed(2)+' m/s, slope '+fr[3].toFixed(2)+'); W.flowAt asks the group',fa[2]===.3&&fa[0]===.3&&Math.abs(fr[2]-T.falls[0].speed)<1e-9&&Math.abs(fr[3]-1.5/2)<1e-9&&W.flowAt(10,0)[2]===.3&&W.flowAt(10,9)[2]===0,W.flowAt(10,9)[2]!==0);
 // across a bend: the pool follows the line (its polygon has the corner's vertices, bisector-widened)
 const bendPool=T.pools.find(p=>p.poly.some(q=>Math.abs(q[0]-80)<8&&Math.abs(q[1]-30)<8));
 ok('...the pools follow the bends (the pool over the corner at (80, 30) has '+bendPool.poly.length+' vertices; its triangles all face up: '+(()=>{const M=W.stillMesh(bendPool);let up=true;for(let i=0;i<M.idx.length;i+=3){const a=M.idx[i]*3,b=M.idx[i+1]*3,c=M.idx[i+2]*3;if(!(((M.pos[b+2]-M.pos[a+2])*(M.pos[c]-M.pos[a])-(M.pos[b]-M.pos[a])*(M.pos[c+2]-M.pos[a+2]))>0))up=false;}return up;})()+')',
  bendPool.poly.length>=8&&(()=>{const M=W.stillMesh(bendPool);for(let i=0;i<M.idx.length;i+=3){const a=M.idx[i]*3,b=M.idx[i+1]*3,c=M.idx[i+2]*3;if(!(((M.pos[b+2]-M.pos[a+2])*(M.pos[c]-M.pos[a])-(M.pos[b]-M.pos[a])*(M.pos[c+2]-M.pos[a+2]))>0))return false;}return true;})(),false);
 // explicit treads, a function width, per-tread widths
 const T2=W.terraces({name:'g8 explicit',line:[[0,0],[100,0]],treads:[{s0:0,s1:40,y:5,w:8},{s0:50,s1:100,y:2}],width:s=>4+s/50});
 ok('...explicit treads (s0, s1, y, w) and a width function (a '+T2.treads[0].w+' m tread by its own w, '+T2.treads[1].w+' m by the function at its middle), the riser run '+T2.risers[0].run+' m',T2.treads[0].w===8&&Math.abs(T2.treads[1].w-(4+75/50))<1e-9&&T2.risers[0].run===10&&T2.falls[0].drop===3&&Math.abs(T2.falls[0].speed-10/T2.falls[0].tFall)<1e-12,false);
 // drawn: pools one mesh, falls two
 const b0=SCENE.children.length,Dr=W.drawTerraces(T,{}),added=SCENE.children.length-b0,perOne=(()=>{const c0=SCENE.children.length;for(const p of T.pools)W.drawStill(p,{});for(const f of T.falls)W.drawFall(f,{});return SCENE.children.length-c0;})();
 ok('...drawn in '+added+' meshes (the five pools one, the four falls two plus a spray) where the old calls make '+perOne+'',added===3&&perOne===5+4*2&&Dr.pools.mesh.geometry.index.length===T.pools.reduce((a,p)=>a+W.stillMesh(p).idx.length,0),added===perOne);
 // negatives: levels that do not descend, treads that overlap or have no length, a line shorter than its risers
 const thrown=f=>{try{f();return false;}catch(e){return true;}},n1=W.surfaces.length;
 ok('negatives: levels that climb, overlapping treads, an empty tread and risers longer than the line are refused, and none leaves a surface behind',
  thrown(()=>W.terraces({line:[[0,0],[100,0]],levels:[5,6]}))&&thrown(()=>W.terraces({line:[[0,0],[100,0]],treads:[{s0:0,s1:60,y:5},{s0:50,s1:100,y:2}]}))&&thrown(()=>W.terraces({line:[[0,0],[100,0]],treads:[{s0:0,s1:0,y:5}]}))&&thrown(()=>W.terraces({line:[[0,0],[3,0]],levels:[5,4,3],riser:2}))&&W.surfaces.length===n1,false);
 W.groups.length=0;}
// ---- gap 9: edge seeds, staged bake
{// a deep sea in the west, a shallow shelf, land in the east; a lake-sized hollow inland below the level that the sea cannot reach
 const ground=(x,z)=>x<-200?-30:x<0?-30+(x+200)*.14:x<150?-2+x*.05+Math.abs(z)*.01:(Math.hypot(x-260,z-60)<40?-4:30);
 const box=[-600,-300,400,300],cell=8,base={ground,level:0,box,cell,band:60};
 const man=W.shoreGrid(Object.assign({seeds:[[-500,0]]},base)),edge=W.shoreGrid(Object.assign({seeds:'edge'},base)),all=W.shoreGrid(Object.assign({seeds:null},base));
 const same=man.data.every((v,k)=>v===edge.data[k]);
 ok('gap 9, seeds:\'edge\': the sea floods from the deep cells of the box\'s rim with no hand-placed point ('+edge.wetCells+' wet cells; the hand-seeded grid\'s '+man.wetCells+', the same bytes: '+same+'), the inland hollow stays dry',
  same&&edge.wetCells===man.wetCells&&edge.seeded&&!(edge.dist[Math.floor((60-box[1])/cell)*edge.nx+Math.floor((260-box[0])/cell)]>0),false);
 ok('...negative: with no seeds every cell under the level is wet, the hollow too ('+all.wetCells+' > '+edge.wetCells+')',all.wetCells>edge.wetCells&&all.dist[Math.floor((60-box[1])/cell)*all.nx+Math.floor((260-box[0])/cell)]>0,all.wetCells===edge.wetCells);
 const shallow=W.shoreGrid(Object.assign({seeds:{edge:true,depth:40}},base)),w=W.shoreGrid(Object.assign({seeds:{edge:true,sides:'w'}},base)),e=W.shoreGrid(Object.assign({seeds:{edge:true,sides:'e'}},base)),pts=W.shoreGrid(Object.assign({seeds:{edge:true,depth:40,points:[[-500,0]]}},base));
 ok('...{edge: true, depth, sides, points}: a rim never deep enough seeds nothing ('+shallow.wetCells+' cells), sides \'w\' is the sea\'s rim ('+w.wetCells+'), the east rim is land ('+e.wetCells+'), and extra points seed a sea whose rim is too shallow ('+pts.wetCells+')',
  shallow.wetCells===0&&w.wetCells===man.wetCells&&e.wetCells===0&&pts.wetCells===man.wetCells,w.wetCells===0);
 // staged: the same bytes however the budget is spent
 const J=W.shoreGridJob(Object.assign({seeds:'edge'},base));let calls=0,left0=J.left();while(!J.step(0)){calls++;if(calls>1e5)break;}
 ok('...the grid as a job: '+calls+' calls of step(0) (the sampling a row at a time, then the flood, each transform, the bytes) end on the very bytes and distances of the one-shot grid; step() runs it whole; left() counts down',
  J.done&&calls>=5&&J.G.data.every((v,k)=>v===edge.data[k])&&J.G.dist.every((v,k)=>v===edge.dist[k])&&J.G.wetCells===edge.wetCells&&left0>5&&J.left()===0&&W.shoreGridJob(Object.assign({seeds:'edge'},base)).step()===true,false);
 // a window surface on edge seeds, baked staged by shoreJob
 const S=W.open({name:'g9 window',swell:[],field:0,level:0,bed:ground,shore:{window:400,cell:8,seeds:'edge',band:60}});
 const j1=W.shoreJob(S,-380,0);let s1=0;while(!j1.step(1e9))s1++;const B1=S.bed.data.slice(),j2=W.shoreJob(S,-380,0,{staged:true,ms:0});let s2=0;while(!j2.step(1e9)){s2++;if(s2>1e4)break;}
 ok('...a shore window re-baked through shoreJob on edge seeds: unstaged it finishes in the call that has the last sample, staged ('+s2+' further calls) it spreads the finish, the bytes the same',
  B1.every((v,k)=>v===S.bed.data[k])&&s2>=4&&s1===0&&!S.bed.blank,false);}
// ---- gap 10: wetGround, in either order
{const Hk=function(sh){sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nPAGE_HOOK;');};
 const before=new THREE_STUB.MeshLambertMaterial({});before.onBeforeCompile=Hk;W.wetGround(before,{});
 const after=new THREE_STUB.MeshLambertMaterial({});W.wetGround(after,{});after.onBeforeCompile=Hk;
 const plain=new THREE_STUB.MeshLambertMaterial({});plain.onBeforeCompile=Hk;
 const fb=compiled(before).fs,fa=compiled(after).fs;
 ok('gap 10, wetGround is order-independent: the page\'s hook assigned before the call and after it both compile with the page\'s line and the wet chunk (before: '+/PAGE_HOOK/.test(fb)+'/'+/wtrWetGround/.test(fb)+', after: '+/PAGE_HOOK/.test(fa)+'/'+/wtrWetGround/.test(fa)+'), the page\'s line first, the same text, and the cache key follows the hook',
  /PAGE_HOOK/.test(fa)&&/wtrWetGround/.test(fa)&&fa===fb&&fa.indexOf('PAGE_HOOK')<fa.indexOf('wtrWG=')&&compiled(after).key.indexOf('wtr-wet')>0,false);
 ok('...negative: a material that never called it has no wet chunk, and a hook reassigned replaces the page\'s but not the wet one (the last assignment wins as the page\'s)',
  !/wtrWetGround/.test(compiled(plain).fs)&&(()=>{const m=new THREE_STUB.MeshLambertMaterial({});W.wetGround(m,{});m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nSECOND;');};m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nTHIRD;');};const t=compiled(m).fs;return /THIRD/.test(t)&&!/SECOND/.test(t)&&/wtrWetGround/.test(t);})(),false);}
// ---- gap 11: spray from a flow
{const flat=W.flow({name:'g11 flat',pts:[[0,0,5],[100,0,5],[200,0,5]],width:6}),
  steep=W.flow({name:'g11 steep',pts:Array.from({length:21},(_,i)=>[i*20,0,100-(i>=8&&i<=14?(i-8)*3:i>14?18:0)]),width:6,rapids:[.05,.2]});
 const a=W.sprayPoints(flat),b=W.sprayPoints(steep),c=W.sprayPoints(steep,{every:5,max:3}),d=W.sprayPoints(steep,{min:.5});
 ok('gap 11: sprayPoints puts emitters where a flow is steep (over the middle of its band by default): none on a flat river ('+a.length+'), '+b.length+' on the cascade at least 40 m apart, max respected ('+c.length+'), none over a slope it never reaches ('+d.length+')',
  a.length===0&&b.length>=3&&b.every((p,i)=>i===0||Math.hypot(p[0]-b[i-1][0],p[2]-b[i-1][2])>=40-1e-9)&&c.length===3&&d.length===0&&b.every(p=>steep.pts.some(q=>q.x===p[0]&&q.slope>=.125-1e-9)),false);
 const Dn=W.drawFlow(steep,{}),Ds=W.drawFlow(steep,{spray:true}),Dm=W.drawFlow(steep,{spray:{every:20,max:5,lift:2}}),Df=W.drawFlow(flat,{spray:true});
 ok('...drawFlow({spray}) hands them to core/atmos\'s smoke as \'spray\' ('+(Ds.spray&&Ds.spray.smoke.length)+' emitters; options {every, min, max, lift}: '+(Dm.spray&&Dm.spray.smoke.length)+', lift '+(Dm.spray&&(Dm.spray.smoke[0][1]-steep.pts.find(p=>p.x===Dm.spray.smoke[0][0]).y))+'); no spray without the option, none from a flat river',
  Dn.spray===undefined&&Ds.spray&&Ds.spray.smoke.length===b.length&&Ds.spray.smoke.every(p=>p[3]==='spray')&&Dm.spray.smoke.length===5&&Math.abs(Dm.spray.smoke[0][1]-steep.pts.find(p=>p.x===Dm.spray.smoke[0][0]).y-2)<1e-9&&Df.spray===undefined,false);}
finish();
