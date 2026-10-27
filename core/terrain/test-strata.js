// node core/terrain/test-strata.js — the strata module's contract (35-core-strata.js), each check with a broken input that
// must fail, and the golden vectors kstrata.gd is held to (golden-strata.json).
//   node core/terrain/test-strata.js           'all passed'
//   node core/terrain/test-strata.js --write   rewrite golden-strata.json
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'35-core-strata.js'),'utf8'));
const K=KSTRATA,GOLD=path.join(__dirname,'golden-strata.json');
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const FLAT={dip:[0,0,0],warp:[0,0]};

// ---- the source: [G data]
const src=fs.readFileSync(path.join(__dirname,'35-core-strata.js'),'utf8').replace(/\/\/[^\n]*/g,'');
ok('the data side touches no THREE, DOM, Math.random, sin, cos, exp or pow',!/THREE|document\.|Math\.(random|sin|cos|exp|pow)\b|getImageData/.test(src),
  /THREE|document\./.test('var c=document.createElement("canvas")')===false);

// ---- step 1: the legacy column is today's BIO.strata column, bed for bed (sedesert's fragment run with stubs)
const OLD=path.join(__dirname,'..','..','biomes','sedesert','src','35-core-strata.js');
if(fs.existsSync(OLD)){
  const Color=function(h){this.r=((h>>16)&255)/255;this.g=((h>>8)&255)/255;this.b=(h&255)/255;};
  Color.prototype.clone=function(){const c=new Color(0);c.r=this.r;c.g=this.g;c.b=this.b;return c;};
  Color.prototype.convertSRGBToLinear=function(){return this;};
  const canvas=()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}})});
  const T={Color,CanvasTexture:function(){},Vector2:function(){},Vector3:function(){}};
  global.document={createElement:canvas};
  global.BIO={host:{THREE:T},fn:{smooth:(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}},canvasTex:()=>({})};
  eval(fs.readFileSync(OLD,'utf8'));
  const cmp=(seed,colM)=>{const o=BIO.strata({seed,columnM:colM,private:true}),n=K.create({seed,legacy:{columnM:colM}});
    return o.beds.length===n.beds.length&&o.beds.every((b,i)=>b.y0===n.beds[i].y0&&b.th===n.beds[i].th&&b.kind===n.beds[i].kind&&
      b.c.r===n.beds[i].colour[0]&&b.c.g===n.beds[i].colour[1]&&b.c.b===n.beds[i].colour[2]);};
  ok('legacy: the column is BIO.strata\'s, bed for bed and colour for colour (seeds 4711, 3, 120 m and 180 m)',cmp(4711,180)&&cmp(3,120)&&cmp(99,150),
    (()=>{const o=BIO.strata({seed:4711,columnM:180,private:true}),n=K.create({seed:4712,legacy:{columnM:180}});return o.beds[0].th===n.beds[0].th;})());
  const o=BIO.strata({seed:4711,columnM:180,private:true}),n=K.create({seed:4711,legacy:{columnM:180}});
  ok('legacy: colorAt(y) is today\'s S.colorAt(y), the column repeating every columnM',[0,7.3,90,179.9,180,250,-33].every(y=>{const a=o.colorAt(y),b=n.colorAt(y);return a.r===b[0]&&a.g===b[1]&&a.b===b[2];}),
    (()=>{const a=o.colorAt(200),b=n.colorAt(200+3);return a.r===b[0]&&a.g===b[1]&&a.b===b[2]&&o.colorAt(200).r!==o.colorAt(203).r;})());
  delete global.document;delete global.BIO;
}else console.log('SKIP  legacy vs biomes/sedesert/src/35-core-strata.js (not in this checkout)');

// ---- determinism and draws by hash
const A=K.create({seed:5,recipe:'canyon',range:[0,600]}),A2=K.create({seed:5,recipe:'canyon',range:[0,600]}),B=K.create({seed:6,recipe:'canyon',range:[0,600]});
ok('the same options give the same records',JSON.stringify(A.export())===JSON.stringify(A2.export()),JSON.stringify(A.export())===JSON.stringify(B.export()));
const Atall=K.create({seed:5,recipe:'canyon',range:[0,1200]});
ok('a thicker formation keeps the beds below (each bed from its own hash, not the draws before)',
  A.beds.slice(0,-1).every((b,i)=>b.y0===Atall.beds[i].y0&&b.th===Atall.beds[i].th&&b.kind===Atall.beds[i].kind),
  A.beds.slice(0,-1).every((b,i)=>b.th===B.beds[i]&&b.th));
ok('the column fills the formation exactly (the last bed clipped)',Math.abs(A.beds.at(-1).y0+A.beds.at(-1).th-600)<1e-9,Math.abs(A.beds.at(-1).y0+A.beds.at(-1).th-599)<1e-9);

// ---- the stratigraphic height
const F0=K.create(Object.assign({seed:1,recipe:'canyon',range:[0,500]},FLAT));
ok('with no warp, dip, fold or fault yy is y',[[0,10,0],[123.4,77.7,-55]].every(p=>F0.yy(...p)===p[1]),F0.yy(1,10,1)===11);
const Dp=K.create({seed:1,recipe:'canyon',range:[0,500],dip:[1,0,.02],warp:[0,0]});
ok('the dip lifts the beds along its direction (yy rises .02 per metre east)',Math.abs(Dp.yy(100,10,0)-12)<1e-12&&Math.abs(Dp.yy(0,10,100)-10)<1e-12,Math.abs(Dp.yy(100,10,0)-10)<1e-12);
const Wp=K.create({seed:1,recipe:'canyon',range:[0,500],dip:[0,0,0]});
let wmax=0,wmin=0;for(let i=0;i<400;i++){const d=Wp.yy(i*37.1,0,i*11.3);wmax=Math.max(wmax,d);wmin=Math.min(wmin,d);}
ok('the warp moves a bed by under warp[0]/2+warp[1]/2 metres, both ways',wmax<5.6&&wmin>-5.6&&wmax>1&&wmin<-1,wmax>5.6);
ok('the warp is continuous (10 cm apart, under 5 cm of yy)',[...Array(200).keys()].every(i=>Math.abs(Wp.yy(i*13.7,0,i*3.1)-Wp.yy(i*13.7+.1,0,i*3.1))<.05),Math.abs(Wp.yy(0,0,0)-Wp.yy(40,0,0))<.05&&false);
const T=K.table(9);
ok('the noise lattice repeats every P cells and stays in [0,1]',Math.abs(K.noise(T,0,3.3,4.4)-K.noise(T,0,3.3+K.P,4.4-K.P))<1e-12&&[...T].every(v=>v>=0&&v<=255),K.noise(T,0,3.3,4.4)===K.noise(T,0,4.3,4.4));
ok('the noise is the table at a lattice point (k/255)',K.noise(T,2,5,7)===T[(7*K.P+5)*4+2]/255,K.noise(T,2,5,7)===T[(7*K.P+5)*4+1]/255&&T[(7*K.P+5)*4+1]!==T[(7*K.P+5)*4+2]);

// ---- folds and faults
const Fd=K.create({seed:1,recipe:'ringfold',range:[-1000,1000],dip:[0,0,0],warp:[0,0],fold:{dir:[0,1],wl:1000,amp:100}});
ok('a fold: the crest brings lower beds up (yy = y - amp), the trough higher (y + amp)',Math.abs(Fd.yy(0,0,0)+100)<1e-9&&Math.abs(Fd.yy(500,0,0)-100)<1e-9,Math.abs(Fd.yy(0,0,0))<1e-9);
ok('a fold runs along its axis (no change along dir)',Math.abs(Fd.yy(120,0,0)-Fd.yy(120,0,777))<1e-9,Math.abs(Fd.yy(120,0,0)-Fd.yy(240,0,0))<1e-9);
const Fs=K.create({seed:1,recipe:'ringfold',range:[-1000,1000],dip:[0,0,0],warp:[0,0],fold:{dir:[0,1],wl:1000,amp:100,sharp:1}});
ok('a chevron fold (sharp 1) is straight-limbed: zero at the quarter, half amp at an eighth',Math.abs(Fs.yy(250,0,0))<1e-9&&Math.abs(Fs.yy(125,0,0)+50)<1e-9,Math.abs(Fd.yy(125,0,0)+50)<1e-9);
ok('the fold profile is smooth (no kink at the crest)',Math.abs(K.wave(.001,0)-K.wave(-.001,0))<1e-9&&Math.abs(1-K.wave(.01,0))<.01,Math.abs(1-K.wave(.01,1))<.01);
const Ft=K.create({seed:1,recipe:'canyon',range:[0,500],dip:[0,0,0],warp:[0,0],faults:[{a:[0,0],b:[0,100],throw:12,w:1,taper:50}]});
ok('a fault: beds left of a->b stand throw lower (yy + throw), none to the right',Math.abs(Ft.yy(10,0,50)-12)<1e-9&&Math.abs(Ft.yy(-10,0,50))<1e-9,Math.abs(Ft.yy(-10,0,50)-12)<1e-9);
ok('a fault fades past its ends over taper metres',Math.abs(Ft.yy(10,0,125)-6)<1e-9&&Math.abs(Ft.yy(10,0,200))<1e-9,Math.abs(Ft.yy(10,0,200)-12)<1e-9);

// ---- formations
const St=K.create({seed:2,formations:[{recipe:'megabreccia',base:0,top:300},{recipe:'loess',th:100},{recipe:'tibasalt'}],range:[0,700]});
ok('formations stack: base from the one below, top from th, the last to range[1]',St.formations.map(f=>[f.base,f.top].join('-')).join(' ')==='0-300 300-400 400-700',
  St.formations[2].top===800);
ok('a point finds its formation by yy',(()=>{const g=K.create({seed:2,formations:[{recipe:'megabreccia',base:0,top:300},{recipe:'loess',th:100},{recipe:'tibasalt'}],range:[0,700],dip:[0,0,0],warp:[0,0]});
  return g.at(0,150,0).recipe==='megabreccia'&&g.at(0,350,0).recipe==='loess'&&g.at(0,500,0).recipe==='tibasalt'&&g.at(0,-50,0).formation===0&&g.at(0,9e3,0).formation===2;})(),
  St.at(0,350,0).recipe==='tibasalt');
const Ou=K.create({seed:3,formations:[{recipe:'outland',base:0,top:1000}]});
ok('a suite splits its formation by shares (outland: red beds, tuffs, basalt on top)',Ou.formations.map(f=>f.recipe+':'+f.base.toFixed(0)+'-'+f.top.toFixed(0)).join(' ')==='outland-redbeds:0-350 outland-tuff:350-700 outland-basalt:700-1000',
  Ou.formations[0].recipe==='outland-basalt');
ok('the outland recipe carries its copper bands, turquoise and white altered zones',['copper','turq','altered'].every(k=>Ou.kinds.some(q=>q.kind===k)),Ou.kinds.some(q=>q.kind==='bead'));
ok('a bad stack throws: an unknown recipe, top under base, overlap, a middle formation with no top',
  throws(()=>K.create({recipe:'nope'}))&&throws(()=>K.create({formations:[{recipe:'canyon',base:10,top:5}]}))&&
  throws(()=>K.create({formations:[{recipe:'canyon',base:0,top:50},{recipe:'loess',base:40,top:90}]}))&&throws(()=>K.create({formations:[{recipe:'canyon'},{recipe:'loess'}]})),
  throws(()=>K.create({formations:[{recipe:'canyon',base:0,top:50},{recipe:'loess',base:50,top:90}]})));
ok('a formation too thick for its recipe throws rather than hang',throws(()=>K.create({recipe:'tibasalt',range:[0,5e6]})),throws(()=>K.create({recipe:'tibasalt',range:[0,5e3]})));
const Fp=K.create(Object.assign({seed:4,formations:[{recipe:'canyon',base:0,top:200,flip:true}]},FLAT)),Fn=K.create(Object.assign({seed:4,formations:[{recipe:'canyon',base:0,top:200}]},FLAT));
ok('flip reads the beds top-down (the overturned flap)',[3,55.5,140].every(y=>Fp.at(0,y,0).bed===Fn.at(0,200-y,0).bed&&Math.abs(Fp.at(0,y,0).f-(1-Fn.at(0,200-y,0).f))<1e-9),Fp.at(0,3,0).bed===Fn.at(0,3,0).bed);
const Rp=K.create(Object.assign({seed:4,formations:[{recipe:'canyon',base:0,top:1000,repeat:150}]},FLAT));
ok('repeat: the column comes round every repeat metres',[1,77,149].every(y=>Rp.at(0,y,0).bed===Rp.at(0,y+150,0).bed&&Rp.at(0,y,0).bed===Rp.at(0,y+600,0).bed),Rp.at(0,1,0).bed===Rp.at(0,76,0).bed);
const Tn=K.create(Object.assign({seed:4,formations:[{recipe:'canyon',base:0,top:300,tint:[1,.5,.5]}]},FLAT));
ok('a formation\'s tint multiplies its beds\' colours',Fn.beds.slice(0,-1).every((b,i)=>Math.abs(Tn.beds[i].colour[1]*2-b.colour[1])<1e-9),Tn.beds[0].colour[1]===Fn.beds[0].colour[1]);

// ---- the recipes' rules
const between=(S)=>{const B=S.formations.flatMap(f=>f.beds||[]),k=S.kinds;let n=0;for(let i=1;i<B.length;i++){const a=K.recipe(k[B[i][2]].recipe).kinds[k[B[i][2]].kind],b=K.recipe(k[B[i-1][2]].recipe).kinds[k[B[i-1][2]].kind];if(a.between&&b.between)n++;}return n;};
const big=r=>K.create({seed:11,recipe:r,range:[0,4000]});
ok('a between kind never follows another (bead horizons, boles, partings)',['tibasalt','outland','pillar','loess','tibasalt-ponded'].every(r=>between(big(r))===0),
  (()=>{K.add({name:'_nb',main:'a',kinds:{a:{p:.2,th:[1,2],col:[0x808080]},b:{p:.8,th:[.1,.2],col:[0x404040]}}});const B=big('_nb').beds;return !B.some((q,i)=>i&&q.kind==='b'&&B[i-1].kind==='b');})());
const Pi=big('pillar'),seq=Pi.beds.filter(b=>b.kind!=='parting').map(b=>b.kind);
ok('pillar: the thick beds alternate red and white',seq.length>50&&seq.every((k,i)=>i===0||k!==seq[i-1]),(()=>{const c=big('canyon').beds.map(b=>b.kind);return c.every((k,i)=>i===0||k!==c[i-1]);})());
const Tb=K.create({seed:12,formations:[{recipe:'tibasalt',base:6000,top:11000}],dip:[0,0,0]});
const cnt=(lo,hi,f)=>{let n=0,t=0;for(let y=lo;y<hi;y+=.25){const a=Tb.at(31,y,47);if(f(a))n++;t++;}return n/t;};
ok('tibasalt: bead beds are fresh orange and black above the dry-cold line, palagonite under it',
  cnt(9000,11000,a=>a.kind==='palagonite')===0&&cnt(9000,11000,a=>a.kind==='bead'||a.kind==='beadblack')>.02&&cnt(6000,8000,a=>a.kind==='palagonite')>.02&&cnt(6000,8000,a=>a.kind==='bead')===0,
  cnt(6000,8000,a=>a.kind==='bead')>0);
const Tl=K.create({seed:12,formations:[{recipe:'tibasalt-ponded',base:0,top:3000}],alter:[{kinds:'*',to:'laterite',below:500,band:40}],dip:[0,0,0]});
ok('an alteration the page passes replaces the recipe\'s (Godstep\'s laterite at the wet low end)',Tl.at(5,200,5).kind==='laterite'&&Tl.at(5,200,5).altered&&Tl.at(5,2000,5).kind!=='laterite',Tl.at(5,2000,5).kind==='laterite');
ok('hardness: flows stand hard, bead beds soft (ledges and recesses)',(()=>{const f=Tb.kinds.find(k=>k.kind==='flow'),b=Tb.kinds.find(k=>k.kind==='bead');return f.hard>.8&&b.hard<.3;})(),Tb.kinds.find(k=>k.kind==='flow').hard<.5);
ok('ponded flows are thicker than the flank\'s thin flows (colonnades)',(()=>{const m=S=>{const B=S.beds.filter(b=>b.kind==='flow');return B.reduce((a,b)=>a+b.th,0)/B.length;};return m(big('tibasalt-ponded'))>2*m(big('tibasalt'));})(),false);
ok('crest is the megabreccia (an alias)',K.recipe('crest')===K.recipe('megabreccia'),K.recipe('crest')===K.recipe('loess'));

// ---- megabreccia: blocks, matrix, nests
const Mb=K.create({seed:21,formations:[{recipe:'megabreccia',base:-1e4,top:1e4}]});
const tally={};let n=0;for(let i=0;i<4000;i++){const a=Mb.at((i*37.31)%900,(i*7.77)%600,(i*13.13)%700);tally[a.kind]=(tally[a.kind]||0)+1;n++;}
ok('megabreccia: no beds, blocks of six rocks in a grey matrix (matrix 3-25% of the points)',Mb.formations[0].beds==null&&Object.keys(tally).filter(k=>k!=='matrix'&&k!=='fine').length>=6&&tally.matrix/n>.03&&tally.matrix/n<.25,!tally.matrix);
ok('a fine block is a breccia of its own (no point is the fine kind itself)',!tally.fine,(tally.fine|0)>0);
const b0=Mb.at(100,100,100),b1=Mb.at(100.2,100.1,100.3);
ok('a block is one cell over its interior, its colour banded by its own tilted bedding',b0.cell&&b1.cell&&b0.cell.join()===b1.cell.join()&&b0.bed===-1,b0.bed!==-1);
const Mf=K.create({seed:21,formations:[{recipe:'megabreccia',base:-1e4,top:1e4}],alter:[{kinds:['tibasalt'],to:'matrix',below:1e5,band:0}]});
ok('an alteration reaches blocks too',(()=>{for(let i=0;i<500;i++)if(Mf.at(i*17.1,i*3.3,i*9.1).kind==='tibasalt')return false;return true;})(),(()=>{for(let i=0;i<500;i++)if(Mb.at(i*17.1,i*3.3,i*9.1).kind==='tibasalt')return false;return true;})());

// ---- terrace (ledges, S4's first cut)
const Tr=K.create(Object.assign({seed:5,recipe:'canyon',range:[0,600]},FLAT));
let mono=true,moved=0;for(let h=0;h<600;h+=.05){const a=Tr.terrace(3,4,h),b=Tr.terrace(3,4,h+.05);if(b<a-1e-12)mono=false;moved=Math.max(moved,Math.abs(a-h));}
ok('terrace is a monotone map of h (no new hollows) and moves the ground',mono&&moved>.2,moved===0);
ok('terrace leaves bed boundaries where they are, and k 0 changes nothing',Tr.beds.slice(1,30).every(b=>Math.abs(Tr.terrace(0,0,b.y0)-b.y0)<1e-9)&&Tr.terrace(0,0,123.4,0)===123.4,Tr.terrace(0,0,Tr.beds[3].y0+Tr.beds[3].th*.3)===Tr.beds[3].y0+Tr.beds[3].th*.3);
ok('terrace eases the foot of a hard bed into a bench (flatter than 1:1 there)',(()=>{const b=Tr.beds.find(q=>q.kind==='sand'&&q.th>5),d=Tr.terrace(0,0,b.y0+.05)-Tr.terrace(0,0,b.y0);return d<.05*.75;})(),false);

// ---- the records: load(export()) is the same stack
const Gx=K.create({seed:31,formations:[{recipe:'outland',base:-200,top:900},{recipe:'tibasalt',th:500,flip:true}],fold:{dir:[1,.3],wl:2400,amp:60,sharp:.4},
  faults:[{a:[-100,-300],b:[200,400],throw:-25,w:3,taper:80}]});
const Gl=K.load(JSON.parse(JSON.stringify(Gx.export())));
const PTS=[];for(let k=0;k<300;k++)PTS.push([-700+k*5.137,-250+((k*53)%300)*4.21,-600+((k*29)%300)*3.91]);
ok('load(export()) gives the same point for point',PTS.every(p=>JSON.stringify(Gx.at(...p))===JSON.stringify(Gl.at(...p))),
  JSON.stringify(Gx.at(1,2,3))===JSON.stringify(Gl.at(1,2,4))&&false);
ok('load refuses what is not a krator-strata record',throws(()=>K.load({format:'krator-field'})),throws(()=>K.load(Gx.export())));

// ---- the shader half bakes what the data half says (host/35-core-strata-shade.js with a stub THREE; the GPU check against
// S.at is a page's: #define KSTRATA_RAW makes strataColor the bed's own colour)
{const V=function(a,b,c,d){this.x=a;this.y=b;this.z=c;this.w=d;};
 const TH={Color:function(r,g,b){this.r=r;this.g=g;this.b=b;this.convertSRGBToLinear=function(){return this;};},Vector2:V,Vector3:V,Vector4:V,
   DataTexture:function(d,w,h){this.image={data:d,width:w,height:h};},RGBAFormat:1,NearestFilter:1,ClampToEdgeWrapping:1};
 eval(fs.readFileSync(path.join(__dirname,'host','35-core-strata-shade.js'),'utf8'));
 const S=K.create({seed:12,formations:[{recipe:'megabreccia',base:0,top:200},{recipe:'tibasalt',top:600}],alter:[{kinds:['bead'],to:'palagonite',below:500,band:10}]});
 const M=K.shade(S,{THREE:TH}),col=M.uniforms.uKSCol.value.image,bed=M.uniforms.uKSBed.value.image,alt=M.uniforms.uKSAlt.value.image;
 const tex=y=>Math.floor((y-S.range[0])/M.res);
 const qb=S.bedAt(400.1),ti=tex(400.1)*4,kk=qb.edge>.3?1:0;
 ok('shade: the column texture holds each bed\'s colour where the data half puts it',kk&&Math.abs(col.data[ti]-Math.round(qb.colour[0]*255))<=1&&bed.data[ti+3]===0,
   Math.abs(col.data[tex(100)*4]-Math.round(qb.colour[0]*255))<=1&&bed.data[tex(100)*4+3]===0);
 ok('shade: blocks are flagged, the alteration baked for the bead beds only',bed.data[tex(100)*4+3]===255&&[...Array(M.texels).keys()].some(i=>alt.data[i*4+3]===255)&&
   [...Array(M.texels).keys()].every(i=>alt.data[i*4+3]===0||S.kinds[S.bedAt(S.range[0]+(i+.5)*M.res).kid].kind==='bead'),bed.data[tex(400)*4+3]===255);
 ok('shade: the GLSL keeps today\'s entry points (strataColor, the varyings) and the raw switch',/vec3 strataColor\(vec3 wp,vec3 wn\)/.test(M.parsFragment)&&/KSTRATA_RAW/.test(M.parsFragment)&&M.parsVertex==='varying vec3 vSWP;varying vec3 vSWN;',
   /uSCol/.test(M.parsFragment));}

// ---- golden vectors (kstrata.gd is held to these)
const cases=[
  {name:'canyon',opt:{seed:4711,recipe:'canyon',range:[0,400]}},
  {name:'outland',opt:{seed:31,formations:[{recipe:'outland',base:-200,top:900},{recipe:'tibasalt',th:500,flip:true}],fold:{dir:[1,.3],wl:2400,amp:60,sharp:.4},faults:[{a:[-100,-300],b:[200,400],throw:-25,w:3,taper:80}]}},
  {name:'tibasalt',opt:{seed:12,formations:[{recipe:'tibasalt',base:7500,top:9500}]}},
  {name:'wouterwall',opt:{seed:21,formations:[{recipe:'megabreccia',base:-1e4,top:300},{recipe:'loess',top:500}],range:[0,500]}},
  {name:'ringfold',opt:{seed:8,recipe:'ringfold',range:[-800,800],fold:{dir:[0,1],wl:1500,amp:300,sharp:.6,at:[40,0],phase:.1}}},
  {name:'legacy',opt:{seed:4711,legacy:{columnM:180}}}];
const golden=()=>({cases:cases.map(c=>{const S=K.create(c.opt),G=[];
  for(let k=0;k<120;k++){const p=[-650+k*11.37,(c.name==='tibasalt'?7400:-250)+((k*41)%120)*(c.name==='tibasalt'?17.3:9.71),-500+((k*67)%120)*8.53],a=S.at(...p);
    G.push({p,yy:a.yy,formation:a.formation,bed:a.bed,kid:a.kid,colour:a.colour,hard:a.hard,f:a.f,edge:a.edge,altered:a.altered,cell:a.cell,terrace:S.terrace(p[0],p[2],p[1])});}
  return {name:c.name,strata:S.export(),points:G};})});
if(process.argv.includes('--write')){fs.writeFileSync(GOLD,JSON.stringify(golden())+'\n');console.log('wrote '+GOLD);}
if(fs.existsSync(GOLD)){const g=JSON.parse(fs.readFileSync(GOLD,'utf8')),now=JSON.parse(JSON.stringify(golden()));
  ok('the golden file is what this module gives now',JSON.stringify(g)===JSON.stringify(now),JSON.stringify(g.cases[0].points[0])===JSON.stringify(now.cases[0].points[1]));
}else ok('golden-strata.json exists (node core/terrain/test-strata.js --write)',false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
