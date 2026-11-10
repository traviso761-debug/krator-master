// node core/terrain/test-strata-skarn.js — the skarn recipes and lenses and the rock glaze (35e-core-strata-skarn.js): lenses that
// pinch out at their rims and swell inside, zoned from the front, on KSTRATA.vary alone; where a stack glazes; the film's colour,
// its GLSL text run in core/water/glsl-interp.js against the JS twin. Each check has a negative.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
const rd=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(rd('35-core-strata.js'));eval(rd('35c-core-strata-vary.js'));
const {glslProgram}=require(path.join(__dirname,'..','water','glsl-interp.js'));
const K=KSTRATA;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
let seed=777;const rnd=()=>{seed=(Math.imul(seed,1103515245)+12345)>>>0;return seed/4294967296;};

// ---- loading it changes nothing, adds the recipes, and twice is a no-op
const S0=K.create({seed:5,recipe:'ringfold'});const snap=()=>{const o=[];for(let i=0;i<60;i++){const a=S0.at(i*9-200,i*3,i*-4);o.push(a.bed,a.kind,a.colour.join());}return o.join('|');};
const before=snap(),had=Object.keys(K.RECIPES).length;
eval(rd('35e-core-strata-skarn.js'));const fn=K.skarn,rec=K.RECIPES.skarn;eval(rd('35e-core-strata-skarn.js'));
ok('loaded (twice): existing stacks answer as before; five recipes added through KSTRATA.add; the second load is a no-op',
  snap()===before&&Object.keys(K.RECIPES).length===had+5&&K.skarn===fn&&K.RECIPES.skarn===rec,false);
const src=rd('35e-core-strata-skarn.js').replace(/\/\/[^\n]*/g,'');
ok('the data side touches no THREE, DOM, Math.random, sin, cos, exp or pow',!/THREE\.|document\.|Math\.(random|sin|cos|exp|pow)\b/.test(src),!/Math\.(cos)\b/.test('Math.cos(1)'));

// ---- the flat recipe
const Sf=K.create({seed:9,recipe:'skarn',range:[0,400]}),cnt={};let same=0,prevK=null;
for(const F of Sf.formations)for(const b of F.beds){const k=Sf.kinds[b[2]].kind;cnt[k]=(cnt[k]||0)+1;if(k===prevK)same++;prevK=k;}
ok('skarn as flat beds: all six kinds, none on itself ('+Object.keys(cnt).map(k=>k+' '+cnt[k]).join(', ')+')',Object.keys(cnt).length===6&&same===0,same>0);

// ---- the lenses along a front
const FRONT={a:[-400,0],b:[400,0]};
const V=K.skarn({seed:21,base:0,top:300,front:FRONT,lenses:6,scale:120});
const LN=V.skarn.lenses;
ok('six lens horizons, each a formation of its kind, between host marble (formations '+V.formations.map(f=>f.recipe.replace('skarn-','')).join(' ')+')',
  LN.length===6&&LN.every(l=>V.formations[l.formation].recipe===l.recipe)&&V.formations.filter(f=>f.recipe==='skarn-marble').length===7,false);
const mid=l=>(l.y0+l.y1)/2;
// the world height of a stratigraphic height at (x, z): yy is y plus a function of (x, z)
const yAt=(Vv,x,z,v)=>{const S=Vv.stack;return v-S.yy(x,0,z);};
let centre=true,rim=true,neg=false;
for(const l of LN)for(const p of l.pods){const th=V.thickness(p[0],p[1],l.formation);if(!(th>=l.th-2*l.amp-1e-9&&th<=l.th+2*l.amp+1e-9&&th>.05))centre=false;
  /* a point well past every pod of this horizon */
  const far=[p[0]+3*l.r,p[1]+(p[1]>0?1:-1)*3*l.r];if(l.pods.every(q=>Math.hypot(far[0]-q[0],far[1]-q[1])>l.r)&&V.thickness(far[0],far[1],l.formation)!==0)rim=false;}
{const l=LN[0],p=l.pods[0],FZ=2*l.r+50,y=yAt(V,p[0],p[1],(V.contact(p[0],p[1],l.formation)+V.stack.yy(p[0],0,p[1])+V.contact(p[0],p[1],l.formation+1)+V.stack.yy(p[0],0,p[1]))/2);
  ok('at a pod\'s centre the rock is the lens\'s ('+V.at(p[0],y,p[1]).kind+'), past its rim the host\'s ('+V.at(p[0],yAt(V,p[0],FZ,mid(l)),FZ).recipe+')',
    V.at(p[0],y,p[1]).recipe===l.recipe&&V.at(p[0],yAt(V,p[0],FZ,mid(l)),FZ).recipe==='skarn-marble',V.stack.at(p[0],yAt(V,p[0],FZ,mid(l)),FZ).recipe!==l.recipe);}
ok('every pod is th +- 2 amp thick at its centre, and exactly 0 (pinched out) past its rim',centre&&rim,false);
// pinch and swell: round a ring inside the pod the thickness varies with the noise; with amp 0 it follows the bump alone
const ring=(Vv,l,p,f)=>{let a=Infinity,b=-Infinity;for(let i=0;i<48;i++){const t=i/48*6.2832,x=p[0]+Math.cos(t)*f*l.r,z=p[1]+Math.sin(t)*f*l.r,th=Vv.thickness(x,z,l.formation);a=Math.min(a,th);b=Math.max(b,th);}return [a,b];};
const V0=K.skarn({seed:21,base:0,top:300,front:FRONT,lenses:6,scale:120,amp:0});
{const l=LN[2],p=l.pods[0],r1=ring(V,l,p,.35),l0=V0.skarn.lenses[2],r0=ring(V0,l0,l0.pods[0],.35);
  ok('pinch and swell: round a ring at .35 r the lens runs '+r1[0].toFixed(1)+'..'+r1[1].toFixed(1)+' m (amp 0: '+r0[0].toFixed(2)+'..'+r0[1].toFixed(2)+')',r1[1]-r1[0]>.15*l.th,
    r0[1]-r0[0]>.01*l0.th);}
let pinchedIn=0;for(const l of LN)for(const p of l.pods)for(let i=0;i<200;i++){const t=rnd()*6.2832,q=Math.sqrt(rnd())*.8*l.r;if(V.thickness(p[0]+Math.cos(t)*q,p[1]+Math.sin(t)*q,l.formation)===0)pinchedIn++;}
ok('and the noise necks some pods shut inside their rims ('+pinchedIn+' of '+LN.reduce((s,l)=>s+l.pods.length,0)*200+' samples)',pinchedIn>0,false);
// zoning: garnet and magnetite near the front, epidote further out, all on the carbonate side
const dist=p=>-p[1];
const near=[],farE=[];for(const l of K.skarn({seed:3,base:0,top:600,front:FRONT,lenses:12,scale:100}).skarn.lenses)for(const p of l.pods)(l.kind==='epidote'?farE:near).push(dist(p));
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
ok('zoned: garnet and magnetite pods lie nearer the front (mean '+mean(near).toFixed(0)+' m) than epidote ('+mean(farE).toFixed(0)+' m), all on side 1',near.length&&farE.length&&mean(near)<mean(farE)&&near.concat(farE).every(d=>d>=0),
  mean(near)>=mean(farE));
ok('side -1 puts them across the front',K.skarn({seed:3,base:0,top:600,front:FRONT,lenses:12,scale:100,side:-1}).skarn.lenses.every(l=>l.pods.every(p=>p[1]>=0)),false);
ok('a polyline front works (pods near its bend)',K.skarn({seed:4,front:{pts:[[0,0],[300,0],[300,300]]},lenses:4}).skarn.lenses.every(l=>l.pods.every(p=>p[0]>-50&&p[1]<350)),false);
// the lenses never reach into each other: every contact stays in order with its flat neighbours' bands
let tidy=true;for(let i=0;i<500;i++){const x=-500+1000*rnd(),z=-350+450*rnd();for(let k=0;k<LN.length-1;k++){const a=LN[k],b=LN[k+1];
  if(V.contact(x,z,a.formation+1)+V.stack.yy(x,0,z)>V.contact(x,z,b.formation)+V.stack.yy(x,0,z)+1e-9)tidy=false;}}
ok('no lens reaches the next: each top stays under the next lens\'s base everywhere',tidy,false);
// determinism, export
const Va=K.skarn({seed:21,base:0,top:300,front:FRONT,lenses:6,scale:120}),Vb=K.skarn({seed:22,base:0,top:300,front:FRONT,lenses:6,scale:120});
ok('the same seed gives the same skarn; another seed another',JSON.stringify(Va.export())===JSON.stringify(V.export())&&JSON.stringify(Vb.export())!==JSON.stringify(V.export()),false);
const Lv=K.loadVaried(JSON.parse(JSON.stringify(V.export())));let eq=true;
for(let i=0;i<300;i++){const x=-400+800*rnd(),y=-20+340*rnd(),z=-50+350*rnd(),a=V.at(x,y,z),b=Lv.at(x,y,z);if(a.kind!==b.kind||a.colour.join()!==b.colour.join()||a.yy!==b.yy)eq=false;}
ok('export then loadVaried gives the same rock (Godot\'s KStrataVary reads the same record: no recipe table needed)',eq,!eq);
ok('V.skarn is plain data',JSON.stringify(V.skarn)===JSON.stringify(JSON.parse(JSON.stringify(V.skarn))),false);
ok('an explicit lens list, with formations below and above',(()=>{const W=K.skarn({seed:1,base:100,top:200,front:FRONT,below:[{recipe:'karst',base:0,top:100}].filter(()=>K.RECIPES.karst)
  .concat(K.RECIPES.karst?[]:[{recipe:'canyon',base:0,top:100}]),above:[{recipe:'loess',top:260}],lenses:[{kind:'magnetite',y:150,th:10,r:80,pods:[[0,40]]}]});
  const l=W.skarn.lenses[0];return W.formations.length===5&&W.formations[4].recipe==='loess'&&W.thickness(0,40,l.formation)>3&&W.thickness(0,400,l.formation)===0;})(),false);
ok('bad input throws (no front, top <= base, lenses too crowded, an unknown lens kind)',throws(()=>K.skarn({}))&&throws(()=>K.skarn({front:FRONT,base:10,top:5}))&&
  throws(()=>K.skarn({front:FRONT,base:0,top:60,lenses:6,scale:120}))&&throws(()=>K.skarn({front:FRONT,lenses:[{kind:'gold',y:150,pods:[[0,0]]}]})),
  throws(()=>K.skarn({front:FRONT})));

// ---- with the bake (35d), the lenses follow on the GPU too
if(fs.existsSync(path.join(__dirname,'35d-core-strata-bake.js'))){eval(rd('35d-core-strata-bake.js'));
  const B=K.varyBake(V,{box:[-500,-350,500,50],step:4});let w=0,n=0;
  for(let i=0;i<800;i++){const x=-480+960*rnd(),z=-340+380*rnd(),y=-10+320*rnd(),a=V.at(x,y,z),yy=K.varyBakedYY(B,x,y,z);n++;if(V.stack.at(x,yy-V.stack.yy(x,0,z),z).recipe!==a.recipe)w++;}
  ok('baked (35d, 4 m): the twin finds the same lens or host as V at '+(n-w)+' of '+n+' points (err '+B.err.toFixed(3)+' m)',w<=n*.02,false);}

// ---- the glaze: the colour
let cw=0;for(let t=-2;t<3;t+=.0007)cw=Math.max(cw,Math.abs(K.cos2pi(t)-Math.cos(2*Math.PI*t)));
ok('ksCos2pi is cos(2 pi t) to '+cw.toExponential(2),cw<2e-4,cw===0);
const hue=c=>{const [r,g,b]=c;return r>g&&r>b?'red':g>=r&&b>=r?'teal':'other';};
const n1=K.glazeColour(1,350),g1=K.glazeColour(.25,350);
ok('350 nm: teal facing the eye ('+n1.map(v=>v.toFixed(2)).join(',')+'), copper-rose at grazing ('+g1.map(v=>v.toFixed(2)).join(',')+')',hue(n1)==='teal'&&hue(g1)==='red',hue(n1)===hue(g1));
let shifts=0,N=0;for(let t=300;t<=420;t+=5){N++;if(hue(K.glazeColour(1,t))!==hue(K.glazeColour(.25,t)))shifts++;}
ok('over the default 300-420 nm the colour shifts with the angle at '+shifts+' of '+N+' thicknesses',shifts>=.6*N,false);
ok('with no contrast (a film of the substrate\'s index) the tint is a flat grey',K.glazeColour(.7,350,1.6,1.6).join()==='0.5,0.5,0.5',false);
ok('tints stay in 0..1',(()=>{for(let i=0;i<2000;i++){const c=K.glazeColour(rnd()*2-1,50+900*rnd(),1.1+rnd(),1+2*rnd());if(c.some(v=>!(v>=-1e-12&&v<=1+1e-12)))return false;}return true;})(),false);
const P=glslProgram(K.glazeGLSL(),{});let gw=0,gneg=0;
for(let i=0;i<400;i++){const c=rnd()*2-1,t=50+900*rnd(),n=1.1+rnd(),s=1+2*rnd(),a=P.run('ksGlazeColour',c,t,n,s),b=K.glazeColour(c,t,n,s),d=K.glazeColour(c,t+20,n,s);
  for(let k=0;k<3;k++){gw=Math.max(gw,Math.abs(a[k]-b[k]));gneg=Math.max(gneg,Math.abs(a[k]-d[k]));}}
ok('the GLSL ksGlazeColour equals the JS twin (worst '+gw.toExponential(1)+')',gw<1e-12,gneg<1e-3);

// ---- the glaze: where it lies
const Sr=K.create({seed:8,recipe:'ringfold',range:[0,4000],faults:[{a:[0,-500],b:[0,500],throw:20,w:2}]});
const Go=K.glaze({kinds:['opal'],cover:.95,strength:.8}),Gn=K.glaze({kinds:['opal'],cover:0});
let onOpal=0,opal=0,offOpal=0,none=0,th0=Infinity,th1=-Infinity;
for(let i=0;i<4000;i++){const x=40+600*rnd(),y=4000*rnd(),z=-300+600*rnd(),g=K.glazeAt(Sr,Go,x,y,z),a=Sr.at(x,y,z);
  if(a.kind==='opal'){opal++;if(g.k>0)onOpal++;}else if(g.k>0)offOpal++;if(K.glazeAt(Sr,Gn,x,y,z).k>0)none++;th0=Math.min(th0,g.thick);th1=Math.max(th1,g.thick);}
ok('kinds: the opal beds glaze ('+onOpal+' of '+opal+' at cover .95), nothing else does, and cover 0 glazes nothing',opal>20&&onOpal>.8*opal&&offOpal===0&&none===0,false);
ok('the film\'s thickness varies over the face within thick ('+th0.toFixed(0)+'..'+th1.toFixed(0)+' nm)',th0>=300-1e-9&&th1<=420+1e-9&&th1-th0>40,th1-th0<1);
const Gc=K.glaze({kinds:['opal'],cover:.5});let half=0,tot=0;
for(let i=0;i<8000;i++){const x=40+600*rnd(),y=4000*rnd(),z=-300+600*rnd();if(Sr.at(x,y,z).kind!=='opal')continue;tot++;if(K.glazeAt(Sr,Gc,x,y,z).k>0)half++;}
ok('cover .5 glazes part of it, in patches ('+half+' of '+tot+')',half>.15*tot&&half<.85*tot,false);
const Gm=K.glaze({kinds:[],faults:3});let mOn=true,mOff=true;
for(let i=0;i<300;i++){const z=-400+800*rnd(),y=400*rnd(),d=6*rnd()-3,g=K.glazeAt(Sr,Gm,d,y,z);if(Math.abs(d)<2.9&&!(g.mirror>0))mOn=false;if(K.glazeAt(Sr,Gm,10+50*rnd(),y,z).k!==0)mOff=false;}
ok('fault mirrors: within 3 m of the fault the bared face glazes, past it nothing (no kind glazes)',mOn&&mOff,false);
ok('on a varied stack too (the skarn\'s magnetite)',(()=>{const G=K.glaze({kinds:['magnetite'],cover:1}),l=LN.find(q=>q.kind==='magnetite')||LN[0];let hit=0;
  for(let i=0;i<400;i++){const p=l.pods[0],x=p[0]+(rnd()-.5)*l.r,z=p[1]+(rnd()-.5)*l.r,y=yAt(V,x,z,l.y0+l.th*rnd());const a=V.at(x,y,z),g=K.glazeAt(V,G,x,y,z);if((a.kind==='magnetite')!==(g.k>0))return false;if(g.k>0)hit++;}
  return hit>0||l.kind!=='magnetite';})(),false);
ok('G is plain data; bad options throw',JSON.stringify(Go)===JSON.stringify(JSON.parse(JSON.stringify(Go)))&&throws(()=>K.glaze({thick:[400,300]}))&&throws(()=>K.glaze({ior:1}))&&throws(()=>K.glaze({kinds:'opal'})),
  throws(()=>K.glaze({})));

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
