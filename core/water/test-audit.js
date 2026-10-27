// node core/water/test-audit.js — WATER.audit and the placement helpers (ext/57, 2026-10-27; PRACTICE.md section 2, items 1 and 3): a synthetic
// case for every rule that must pass clean, and a broken input that must fail it; lipAt, toeAt and levelFromDownstream on a cliff, and
// fallsOf({ground}) placing a fall there where the plain fallsOf leaves its lip 10 m back from the edge.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const files=['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/21-core-water-shore.js',
 'core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js','core/water/ext/55-core-water-confluence.js','core/water/ext/57-core-water-audit.js'];
global.window=global;
eval(files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=ATMOS,W=WATER;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
// a three.js stub: enough for drawFlow and drawFall to record what the audit reads (S.keepAt, D.plungeR)
class Color{constructor(h){h=h==null?0:h;this.r=((h>>16)&255)/255;this.g=((h>>8)&255)/255;this.b=(h&255)/255;}}
class V2{constructor(x,y){this.x=x||0;this.y=y||0;}set(x,y){this.x=x;this.y=y;return this;}}
class V3{constructor(){this.x=0;this.y=0;this.z=0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}}
class F32{constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;}}
class BG{constructor(){this.attributes={};this.index=null;}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=Array.from(i);}computeBoundingSphere(){}rotateX(){return this;}translate(){return this;}}
class Circle extends BG{constructor(r){super();this.r=r;}}
class Mat{constructor(o){Object.assign(this,{transparent:false,depthWrite:true,userData:{},normalScale:new V2(1,1)},o||{});}customProgramCacheKey(){return'';}onBeforeCompile(){}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.position=new V3();this.name='';this.renderOrder=0;}raycast(){}}
const T3={Color,Vector2:V2,Vector3:V3,BufferGeometry:BG,Float32BufferAttribute:F32,CircleGeometry:Circle,MeshStandardMaterial:Mat,Mesh,DoubleSide:2};
A.T=T3;A.h={scene:{add(){}},THREE:T3};A.U={waveTime:{value:0},waveAmp:{value:1},rain:{value:0}};A.hooks=[];A.skyEnv=null;
const reset=()=>{W.surfaces.length=0;W.groups.length=0;(W.drawn||[]).length=0;};
const rules=F=>[...new Set(F.map(f=>f.rule))].sort().join(',');
const has=(F,r)=>F.some(f=>f.rule===r),only=(F,r)=>F.length>0&&F.every(f=>f.rule===r);

// ---- the ground: a bed falling 1 cm a metre east, a channel 8 m wide whose banks rise .6 m a metre past |z| = 4; a cliff from x 100 to 102
// (49 m to 9 m: 20 m a metre); a second channel along z at x = 300 for the crossing
const bed=x=>x<100?50-.01*x:x<102?49-20*(x-100):9.02-.01*(x-102);
const bank=d=>Math.min(30,Math.max(0,(Math.abs(d)-4)*.6));
const G1=(x,z)=>bed(x)+bank(z);
const line=(xs,over)=>W.levelFromDownstream(xs.map(x=>[x,0]),G1,{over:over==null?.6:over});

// ---- the helpers
{const L=[[0,0],[200,0]],lip=W.lipAt(L,G1),toe=W.toeAt(L,G1,lip);
 ok('lipAt: the first drop of a metre in a metre is the cliff\'s edge (x '+lip.x.toFixed(3)+', ground '+lip.y.toFixed(2)+')',Math.abs(lip.x-100)<.01&&Math.abs(lip.y-49)<.15,W.lipAt([[0,0],[90,0]],G1));
 ok('toeAt: the ground levels off at the cliff\'s foot (x '+toe.x.toFixed(2)+'); negative: from the top of the reach the toe is not the foot',Math.abs(toe.x-102)<1.01,Math.abs(W.toeAt(L,G1,10).x-102)<1.01);
 const near=W.lipAt([[0,0],[200,0]],(x,z)=>G1(x,z)-(x>40&&x<42?20*(x-40):x>=42?40:0),{near:95});
 ok('lipAt {near}: of two drops, the one nearest the point (x '+near.x.toFixed(2)+')',Math.abs(near.x-100)<.05,Math.abs(W.lipAt([[0,0],[200,0]],(x,z)=>G1(x,z)-(x>40&&x<42?20*(x-40):x>=42?40:0)).x-100)<.05);
 const P=line([0,20,40,60,80,100,101,102,120,140,160,180,200]),mono=P.every((p,i)=>!i||p[2]<=P[i-1][2]),over=P.every(p=>p[2]>=G1(p[0],p[1])+.6-1e-9);
 const bump=(x,z)=>G1(x,z)+(x>130&&x<150?3:0),Pb=W.levelFromDownstream(P,bump,{over:.6});
 ok('levelFromDownstream: never rising, never under the ground + over; over a bump downstream the reach above is held at the bump\'s level',
  mono&&over&&Pb.every((p,i)=>!i||p[2]<=Pb[i-1][2])&&Math.abs(Pb[8][2]-(bump(140,0)+.6))<1e-9&&Pb[7][2]>=Pb[8][2],
  P.some((p,i)=>i&&p[2]>P[i-1][2]));
 const Pe=W.levelFromDownstream([[0,0],[10,0]],(x,z)=>0,{over:.5,end:2});ok('levelFromDownstream {end}: the last level at least the water it runs into',Pe[1][2]===2&&Pe[0][2]===2,Pe[1][2]===.5);}

// ---- a clean scene, then each rule broken
const good=()=>{reset();return W.flow({name:'river',pts:line([0,20,40,60,80]),width:10,speed:1});};
{const F0=good(),f=W.audit({ground:G1});ok('a carved channel with its levels from downstream: no finding ('+f.length+')',f.length===0,false);void F0;}
{reset();const P=line([0,20,40,60,80]);P[2][2]+=.5;W.flow({name:'river',pts:P,width:10});const f=W.audit({ground:G1});
 ok('flow-rise: a level raised .5 m, .3 m over the one above it',only(f,'flow-rise')&&Math.abs(f.find(f=>f.rule==='flow-rise').by-.3)<1e-6,(good(),has(W.audit({ground:G1}),'flow-rise')));}
{reset();const P=line([0,20,40,60,80]);P[3][2]-=1.2;P[4][2]-=1.2;W.flow({name:'river',pts:P,width:10});const f=W.audit({ground:G1});
 ok('flow-under: a reach sunk 1.2 m under its bed (by '+Math.max(...f.filter(f=>f.rule==='flow-under').map(f=>f.by)).toFixed(2)+')',has(f,'flow-under'),false);}
{reset();const wide=(x,z)=>bed(x)+Math.min(30,Math.max(0,(Math.abs(z)-20)*.6));W.flow({name:'river',pts:W.levelFromDownstream([[0,0],[80,0]],wide,{over:.6}),width:10});
 const f=W.audit({ground:wide}),pk=f.filter(f=>f.rule==='flow-pocket');
 ok('flow-slab and flow-pocket: a 10 m ribbon in a 40 m carve (edge .6 m over the ground; under the level '+Math.max(...pk.map(f=>f.by))+' m past the ribbon)',has(f,'flow-slab')&&pk.length&&pk.every(f=>f.by>=12),(good(),has(W.audit({ground:G1}),'flow-pocket')));}
{reset();const step=(x,z)=>bed(x)+(Math.abs(z)<6.6?0:2);W.flow({name:'river',pts:W.levelFromDownstream([[0,0],[80,0]],step,{over:.6}),width:10});
 ok('flow-slab without a pocket: a ribbon\'s edge .6 m over a bank that rises sheer just past it',only(W.audit({ground:step}),'flow-slab'),false);}
{reset();const shelf=(x,z)=>bed(x)+(Math.abs(z)<18?.4:5);W.flow({name:'river',pts:W.levelFromDownstream([[0,0],[80,0]],(x,z)=>bed(x),{over:.6}),width:10});
 ok('flow-pocket without a slab: a shelf .2 m under the level out to 18 m',only(W.audit({ground:shelf}),'flow-pocket'),false);}

// still water: a bowl round (0, 300)
{const bowl=(x,z)=>5+.1*(x*x+(z-300)*(z-300)),pool=lv=>{reset();return W.still({name:'pool',level:lv,bounds:[-5,295,5,305]});};
 pool(7);const f0=W.audit({ground:bowl});pool(8);const f1=W.audit({ground:bowl});pool(4.9);const f2=W.audit({ground:bowl});
 ok('still: a pool at 7 m in a bowl whose rim is 7.5 m and floor 5 m passes; at 8 m it floats over its rim (still-rim)',f0.length===0&&only(f1,'still-rim'),false);
 ok('still-floor: at 4.9 m it lies under its floor everywhere',has(f2,'still-floor'),has(f0,'still-floor'));
 /* a pool at a river's mouth: its rim under the river's water is not a fault */
 reset();W.still({name:'mouth pool',level:8,bounds:[-5,295,5,305]});W.still({name:'over it',level:9,poly:[[-30,270],[30,270],[30,330],[-30,330]]});
 const f3=W.audit({ground:bowl,surfaces:[W.surfaces[0]]});ok('still-rim: not where another surface\'s water lies past the rim',!has(f3,'still-rim'),false);}

// open water: a lake in a bowl round (0, 1000), ground under the level inside r = 100; its mask a disc on 8 m cells
{const C=[0,1000],bowl=(x,z)=>(Math.hypot(x-C[0],z-C[1])-100)*.05,mask=(R,inv)=>{const x0=-201,z0=799,cell=8,n=50,d=new Uint8Array(n*n);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const r=Math.hypot(x0+(i+.5)*cell-C[0],z0+(j+.5)*cell-C[1]);d[j*n+i]=(inv?r>=R:r<R)?255:0;}return{x0,z0,cell,nx:n,nz:n,data:d};};
 const lake=(R,more)=>{reset();W.open({name:'lake',level:0,swell:[],field:0,bounds:[-200,800,199,1199],mask:mask(R)});if(more)W.open({name:'marsh',level:0,swell:[],field:0,bounds:[-200,800,199,1199],mask:mask(R,true)});};
 lake(112);const f0=W.audit({ground:bowl,surfaces:[W.surfaces[0]]});lake(70);const f1=W.audit({ground:bowl,surfaces:[W.surfaces[0]]});lake(70,true);const f2=W.audit({ground:bowl,surfaces:[W.surfaces[0]]});
 const e1=f1.filter(f=>f.rule==='open-edge');
 ok('open-edge: a mask out past the shore passes ('+f0.length+'); one cut at r 70 m leaves a straight edge over ground 1.5 m under the level ('+e1.length+' points, worst '+Math.max(...e1.map(f=>f.by)).toFixed(2)+' m)',
  f0.length===0&&e1.length>20&&Math.max(...e1.map(f=>f.by))>1.2,false);
 ok('open-edge: not where another surface (the marsh outside it) owns that ground',!has(f2,'open-edge'),false);
 reset();W.open({name:'box lake',level:0,swell:[],field:0,bounds:[-50,950,50,1050]});const f4=W.audit({ground:bowl}),f5=W.audit({ground:bowl,extent:[-400,600,400,1400]});
 ok('open-edge: a box ending inside the lake is a cut only inside o.extent (the map\'s own edge is not)',!has(f4,'open-edge')&&has(f5,'open-edge'),false);}

// two flows crossing: an overlap, unless a join says so; a channel into a lake: an overlap, unless its keep fades it there
{const G2=(x,z)=>Math.min(10+bank(z),10+bank(x-300)),mk=()=>{reset();const a=W.flow({name:'east',pts:[[200,0,10.6],[400,0,10.6]],width:10}),b=W.flow({name:'south',pts:[[300,-100,10.6],[300,100,10.6]],width:10});return[a,b];};
 mk();const f0=W.audit({ground:G2});const[a,b]=mk(),f1=W.audit({ground:G2,joins:[['east','south']]}),f2=W.audit({ground:G2,joins:[[a,b]]});
 ok('overlap: two ribbons crossing ('+f0.filter(f=>f.rule==='overlap').length+' points, other '+(f0.find(f=>f.rule==='overlap')||{}).other+'); none when a join names them',has(f0,'overlap')&&!has(f1,'overlap')&&!has(f2,'overlap'),false);
 const lk=()=>{reset();W.open({name:'lake',level:0,swell:[],field:0,bounds:[100,-200,400,200]});return W.flow({name:'channel',pts:[[0,0,.6],[99,0,.6],[160,0,.6]],width:10});};
 /* the lake fills its box; outside it, and up the channel, the ground stands over it */
 const GLc=(x,z)=>x<100?bank(z):x<=400&&Math.abs(z)<=200?-3:5;lk();const g0=W.audit({ground:GLc});
 const F=lk(),D=W.drawFlow(F,{keep:(x,z)=>x<100?1:0}),g1=W.audit({ground:GLc});lk();const g2=W.audit({ground:GLc,keep:{channel:(x,z)=>x<100?1:0}});
 ok('overlap: a channel run 60 m over a lake; none once drawFlow({keep}) fades it there (the record\'s keepAt) or o.keep names it',has(g0,'overlap')&&F.keepAt&&!has(g1,'overlap')&&!has(g2,'overlap'),!D.mesh);}
// a confluence: the tributary's ribbon inside the river's, allowed inside the disc
{const GC=(x,z)=>Math.min(10+bank(z),z<0?10+bank(x-100):99),mk=()=>{reset();const R=W.flow({name:'river',pts:[[0,0,10.6],[200,0,10.6]],width:10}),S=W.flow({name:'trib',pts:[[100,-60,10.6],[100,-1,10.6]],width:8});return[R,S];};
 mk();const f0=W.audit({ground:GC}).filter(f=>f.rule==='overlap');const[R,S]=mk();W.confluence({name:'mouth',flows:[R,S],at:[100,-1],ground:GC});const f1=W.audit({ground:GC}).filter(f=>f.rule==='overlap');
 ok('overlap: a tributary into its river ('+f0.length+' points); none inside a confluence over the mouth',f0.length>0&&f1.length===0,false);}

// falls: a river over the cliff at x 100. The line with a vertex at the lip and the toe (lipAt, toeAt), its levels from downstream
{const L0=[[0,0],[200,0]],lip=W.lipAt(L0,G1),toe=W.toeAt(L0,G1,lip);
 const xs=[0,20,40,60,80,lip.x,toe.x,120,140,160,180,200],mkF=()=>{reset();return W.flow({name:'river',pts:line(xs,.5),width:10,speed:1});};
 const F=mkF(),plain=W.fallsOf(F)[0],placed=W.fallsOf(F,{ground:G1,fit:true})[0];
 ok('fallsOf {ground}: on a line with a vertex at the edge, the lip there at the line\'s surface ('+placed.lip[0][2].toFixed(2)+' m) and the foot at the toe (x '+placed.foot[0].toFixed(2)+')',
  Math.abs((placed.lip[0][0]+placed.lip[1][0])/2-lip.x)<.01&&Math.abs(placed.lip[0][2]-(G1(lip.x,0)+.5))<.02&&Math.abs(placed.foot[0]-toe.x)<.01,false);
 const fall=o=>{const Fl=mkF();const X=W.fall(Object.assign({},placed,o||{}));return[Fl,X];};
 fall();const a0=W.audit({ground:G1,plungeR:{[placed.name]:4}});
 ok('a fall placed by them, its plunge disc (4 m) inside the river below: no finding ('+rules(a0)+')',a0.length===0,false);
 fall();const a1=W.audit({ground:G1});
 ok('fall-plunge: the default disc (2.4 x its radius, '+(W.plunge(W.surfaces[1]).r*2.4).toFixed(0)+' m) over the dry banks',only(a1,'fall-plunge'),false);
 fall({lip:placed.lip.map(p=>[p[0],p[1],p[2]+2])});const a2=W.audit({ground:G1,plungeR:{[placed.name]:4}});
 ok('fall-lip-y: the lip 2 m over the river\'s surface',has(a2,'fall-lip-y')&&!has(a2,'fall-lip'),false);
 fall({lip:placed.lip.map(p=>[p[0]-5,p[1],p[2]]),speed:.5,fit:false,foot:null});const a3=W.audit({ground:G1,plungeR:{[placed.name]:4}});
 ok('fall-lip and fall-curtain: the lip 5 m back from the edge, the curtain falling into the cliff top ('+rules(a3)+')',has(a3,'fall-lip')&&has(a3,'fall-curtain'),false);
 /* the coarse line: no vertex at the edge, so the plain fallsOf puts its lip at the last vertex, 10 m short */
 reset();const Fc=W.flow({name:'river',pts:line([0,15,30,45,60,75,90,105,120,135,150],.5),width:10,speed:1}),pc=W.fallsOf(Fc)[0];W.fall(pc);
 const a4=W.audit({ground:G1,surfaces:W.surfaces.filter(S=>S.kind==='fall'),plungeR:{[pc.name]:4}}),lp=a4.find(f=>f.rule==='fall-lip');
 ok('fall-lip: the plain fallsOf on a line with no vertex at the edge leaves the lip '+(lp?lp.by.toFixed(1):'?')+' m back; the line itself sinks under the cliff top (flow-under)',
  lp&&lp.by>9&&has(W.audit({ground:G1,surfaces:[Fc]}),'flow-under'),false);
 /* drawFall records its disc's radius (D.plungeR) and the audit reads it */
 const[Fd,Xd]=fall();W.drawn.length=0;const Dd=W.drawFall(Xd,{plungeR:4,spray:false}),a5=W.audit({ground:G1});
 ok('drawFall({plungeR}) records the disc it drew; the audit takes it (D.plungeR '+Dd.plungeR+', '+a5.length+' findings)',Dd.plungeR===4&&a5.length===0,false);void Fd;}

// the summary and the record shape
{reset();const P=line([0,20,40,60,80]);P[2][2]+=.5;P[3][2]+=.5;W.flow({name:'river',pts:P,width:10});const f=W.audit({ground:G1}),S=W.auditSummary(f);
 ok('findings are plain records {rule, surface, id, x, z, by}; auditSummary groups them, worst first',f.every(r=>typeof r.rule==='string'&&r.surface==='river'&&typeof r.x==='number'&&typeof r.by==='number')&&
  S.length===new Set(f.map(r=>r.rule)).size&&S.every((s,i)=>!i||s.by<=S[i-1].by)&&JSON.parse(JSON.stringify(f)).length===f.length,false);
 let threw=false;try{W.audit({});}catch(e){threw=true;}ok('audit without a ground throws',threw,false);}
console.log(bad?'\n'+bad+' FAILED':'\nall passed');process.exit(bad?1:0);
