// node core/world/test-golden-relief.js [--write] — the relief's golden vectors (core/world/PLAN-RELIEF.md P9): what each
// module gives for fixed inputs, kept in golden-relief.json, so a port (GDScript: GODOT-PLAN.md) proves it gives the same
// land, and a change to any module that moves the land shows here. Values to 1e-6 (a port's float order may differ in the
// last bits; the checks allow 1e-6); strings and integers exactly. --write takes a new snapshot (after a change meant to
// move the land, and checked). The negative: one value nudged by 1e-5 is caught.
const fs=require('fs'),path=require('path');
global.window=global;
for(const f of [['..','rand','08-core-rand.js'],['..','terrain','37-core-stacks.js'],['40-world-smooth.js'],['43-world-relief.js'],['44-world-streams.js'],['43b-world-landforms.js']])
 eval(fs.readFileSync(path.join(__dirname,...f),'utf8'));
const r6=v=>typeof v==='number'?Math.round(v*1e6)/1e6:v,R=a=>a.map(r6);
function snapshot(){const G={};
 // WSMOOTH: a curve through a zigzag with its meander, a line (relaxed), the contour smoothing on a staircase grid
 const Z=[[0,0,1],[250,0,2],[500,250,3],[750,250,4],[1000,500,5],[1250,500,6]];
 G.curve=WSMOOTH.curve(Z,{step:60,meander:{amp:20,wave:150,seed:KRAND.child(7,'streams'),ox:1e6,oz:2e6}}).map(R);
 G.line=WSMOOTH.line(Z,{step:80,relax:4}).map(R);
 {const nx=24,ny=20,E=new Float64Array(nx*ny);for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)E[j*nx+i]=100*Math.floor((i+.6*j)/4);
  G.heights=R(Array.from(WSMOOTH.heights(E,nx,ny,{px:4,cell:500})).filter((_,k)=>k%7===0));}
 // WRELIEF: the benches, the erosion filter and the peaks at 300 points (a world-absolute frame)
 WRELIEF.init({ox:2000000,oz:3000000,seed:7});const S={terr:.75,step:55,gully:1,peak:1},pts=[];
 for(let k=0;k<300;k++){const x=(k*7919)%40000,z=(k*104729)%40000;pts.push([x,z]);}
 G.bench=pts.map(([x,z])=>r6(WRELIEF.bench(500+.05*x,x,z,S,600,0)));
 G.erode=pts.map(([x,z])=>r6(WRELIEF.erode(500,x,z,-.15,.05,S,800,0)));
 G.peaks=pts.map(([x,z])=>r6(WRELIEF.peaks(0,x,z,S,1200,.8,0)));
 G.caprock=pts.map(([x,z])=>r6(WRELIEF.caprock(x,z,S,600)));
 // WSTREAMS: the trace on a valley with a depression, its lines as region.json keeps them, their decode, the tarns
 {const nx=60,ny=80,cell=250,n=nx*ny,E=new Float32Array(n),K=new Uint8Array(n),RW=new Float32Array(n),RM=new Float32Array(n);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const c=j*nx+i,d=Math.hypot(i-30,j-40);E[c]=(ny-j)*cell*.015+Math.abs(i-30)*cell*.03+(KRAND.vnoise(i/3.7,j/3.7,.5,11)-.5)*6-(d<5?120*(1-d/5):0);
   RM[c]=900;RW[c]=900*cell*cell/1e6/16;}
  const T=WSTREAMS.trace({nx,ny,cell,x0:0,z0:0,E,K,RW,RM,amin:200,chanMin:3e4,wetMM:450,minLen:1000,incise:{k:8,sigma:1.5,iters:2}});
  G.trace={lines:T.lines,ponds:T.ponds,cells:T.cells,heads:T.heads};
  G.decode=WSTREAMS.decode(T.lines[0],{cell,x0:0,z0:0}).map(R);}
 // WLAND: the records a savanna and the High Rift place, and the land with them at points
 {const ground=(x,z)=>100+.01*x+20*KRAND.vnoise(x/3000,z/3000,.5,3);
  WLAND.reset();WLAND.init({ox:0,oz:0,seed:77,ground,styleName:()=>'savanna',overlay:()=>'',caprock:()=>1,keep:()=>false,sites:[]});
  const A=WLAND.list(0,0,12000,12000);G.records=A.map(B=>[B.id,r6(B.x),r6(B.z),r6(B.top==null?0:B.top),r6(B.R)]);
  G.land=A.slice(0,20).map(B=>r6(WLAND.apply(ground(B.x,B.z),B.x+B.R*.3,B.z,0)));
  WLAND.reset();WLAND.init({ox:0,oz:0,seed:77,ground,styleName:()=>'steps',overlay:()=>'high rift',caprock:()=>0,keep:()=>false,sites:[]});
  const F=WLAND.list(0,0,12000,12000);G.fissures=F.map(B=>[B.id,r6(B.x),r6(B.z),r6(B.w),r6(B.d)]);
  G.cut=F.slice(0,20).map(B=>r6(WLAND.apply(ground(B.x,B.z),B.x+1,B.z,0)));}
 return G;}
const file=path.join(__dirname,'golden-relief.json'),G=snapshot();
if(process.argv.includes('--write')){fs.writeFileSync(file,JSON.stringify(G,null,0)+'\n');console.log('wrote '+file);process.exit(0);}
const GOLD=JSON.parse(fs.readFileSync(file,'utf8'));
function diff(a,b,at){if(typeof a==='number'&&typeof b==='number')return Math.abs(a-b)<=1e-6?null:at+': '+a+' against '+b;
 if(Array.isArray(a)&&Array.isArray(b)){if(a.length!==b.length)return at+': '+a.length+' values against '+b.length;for(let i=0;i<a.length;i++){const d=diff(a[i],b[i],at+'['+i+']');if(d)return d;}return null;}
 if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const d=diff(a[k],b[k],at+'.'+k);if(d)return d;}return null;}
 return a===b?null:at+': '+JSON.stringify(a)+' against '+JSON.stringify(b);}
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
for(const k of Object.keys(GOLD)){const d=diff(G[k],GOLD[k],k);ok(k+(d?': '+d:': as the golden'),!d,false);}
{const N=JSON.parse(JSON.stringify(G));N.peaks[3]+=1e-5;ok('negative: a value nudged by 1e-5 is caught',diff(N,GOLD,'')!==null,false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
