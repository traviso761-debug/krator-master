// node core/world/test-streams.js — the small streams' trace (44-world-streams.js; core/world/PLAN-RELIEF.md P3) on
// synthetic land, each check with an input that must fail it: a valley gathers one trunk with its side streams; an even
// slope starts none (D8 alone ran a ruler-straight stream down every column); every bed falls and a reversed line fails
// the check; every line ends in a lake, a channel, the edge or a line traced before it; wet by its catchment's rain.
const fs=require('fs'),path=require('path');
global.window=global;
for(const f of [['..','rand','08-core-rand.js'],['40-world-smooth.js'],['44-world-streams.js']])eval(fs.readFileSync(path.join(__dirname,...f),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const nx=120,ny=160,cell=250,n=nx*ny;
// land: a valley down the middle (x = 60), falling to the south edge (j = ny-1), its sides 3 %, its floor 1.5 %, a little
// roll (integer hash, no Math.random) so D8 has something to choose by
const roll=(i,j)=>(KRAND.vnoise(i/3.7,j/3.7,.5,11)-.5)*6;
function grid(f,o){const E=new Float32Array(n),K=new Uint8Array(n),RW=new Float32Array(n),RM=new Float32Array(n);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const c=j*nx+i;E[c]=f(i,j);RM[c]=o.rain==null?900:o.rain;RW[c]=Math.max(RM[c],150)*cell*cell/1e6/16;
  if(o.lake&&Math.hypot(i-o.lake[0],j-o.lake[1])<o.lake[2])K[c]=1;}
 return{nx,ny,cell,x0:0,z0:0,E,K,RW,RM,amin:3e4/150,chanMin:3e4,wetMM:450,minLen:1000,incise:{k:8,sigma:1.5,iters:2}};}
const valley=(i,j)=>(ny-j)*cell*.015+Math.abs(i-60)*cell*.03+roll(i,j);
const R=WSTREAMS.trace(grid(valley,{}));
const S={cell,x0:0,z0:0},D=R.lines.map(L=>WSTREAMS.decode(L,S));
console.log('      valley: '+R.lines.length+' lines, '+R.heads+' heads, '+R.cells+' stream cells');
// the trunk: the longest line runs down the valley's floor (within 3 cells of x = 60 over its lower half)
const trunk=D.reduce((a,b)=>b.length>a.length?b:a,[]);
const low=trunk.filter(p=>p[1]>ny*cell/2);
ok('a valley gathers one trunk down its floor ('+trunk.length+' vertices, '+low.length+' in its lower half)',low.length>20&&low.every(p=>Math.abs(p[0]/cell-60)<=3),false);
ok('side streams join it: '+R.lines.filter(L=>L.e==='j').length+' lines end at a junction',R.lines.filter(L=>L.e==='j').length>=4,false);
// an even slope: no convergence, no stream; the old rule (converge 0, no incision) runs one down every few columns
const plane=(i,j)=>(ny-j)*cell*.03;
const P0=WSTREAMS.trace(Object.assign(grid(plane,{}),{converge:0,incise:null})),P1=WSTREAMS.trace(grid(plane,{}));
ok('an even slope starts no stream ('+P1.lines.length+'), where D8 alone ran '+P0.lines.length+' parallel lines',P1.lines.length===0,P0.lines.length<10);
// beds fall; a reversed line fails
ok('every bed falls from its head to its mouth ('+WSTREAMS.check(D).length+' problems)',WSTREAMS.check(D).length===0&&D.length>0,
 WSTREAMS.check([trunk.slice().reverse()]).length===0);
// every line ends in a lake, a channel, the edge or a line traced before it: a junction's mouth is a vertex of an earlier line
const at=new Map();let endsOk=true;
R.lines.forEach((L,k)=>{const P=D[k],m=P[P.length-1];
 if(L.e==='j'){const o=at.get(m[0]+','+m[1]);if(o==null||o>=k)endsOk=false;}
 else if(L.e==='x'){if(!(m[1]>=(ny-1)*cell||m[0]<=0||m[0]>=(nx-1)*cell||m[1]<=0))endsOk=false;}
 for(let v=0;v<P.length-1;v++)if(!at.has(P[v][0]+','+P[v][1]))at.set(P[v][0]+','+P[v][1],k);});
ok('every line ends at the edge or on a line traced before it',endsOk,false);
// into a lake: the same valley with a lake across its floor halfway down
const RL=WSTREAMS.trace(grid(valley,{lake:[60,100,6]}));
ok('a valley with a lake: '+RL.lines.filter(L=>L.e==='w').length+' lines end in it',RL.lines.filter(L=>L.e==='w').length>=1,false);
// a depression on the floor (150 m deep: on the valley's fall a shallower cone spills on its low side, no basin): the trunk ends where it enters it ('p') and starts again at its outlet, never
// across its filled flat; with the rule off (pit: 1e9) a line runs straight across it
const pit=(i,j)=>valley(i,j)-(Math.hypot(i-60,j-80)<6?150*(1-Math.hypot(i-60,j-80)/6):0);
const RP=WSTREAMS.trace(grid(pit,{})),DP=RP.lines.map(L=>WSTREAMS.decode(L,S)),inPit=p=>Math.hypot(p[0]/cell-60,p[1]/cell-80)<3;   /* its deep middle: filled by over 1.5 m whatever the spill */
const RP0=WSTREAMS.trace(Object.assign(grid(pit,{}),{pit:1e9})),DP0=RP0.lines.map(L=>WSTREAMS.decode(L,S));
const across=D=>D.some(P=>P.slice(0,-1).some(inPit));
ok('a depression: '+RP.lines.filter(L=>L.e==='p').length+' lines end in it, one starts at its outlet, none runs across it ('+RP.pits+' depression cells)',
 RP.lines.some(L=>L.e==='p')&&!across(DP)&&DP.some(P=>P[0][1]/cell>80&&Math.abs(P[0][0]/cell-60)<9)&&WSTREAMS.check(DP).length===0,across(DP0)===false);
// the tarns (relief P7): the deep depression holds one, at its spill less 0.3 m, its rows taking in its deepest cell; a dry
// land's (250 mm) holds none
{const T=RP.ponds,Td=WSTREAMS.trace(grid(pit,{rain:250})).ponds,t=T[0];
 const deep=t&&WSTREAMS.pondRows(t).some(([j,i0,i1])=>j===80&&i0<=60&&i1>=60);
 ok('a depression holds a tarn ('+T.length+': level '+(t?(t.l/10).toFixed(1):'-')+' m, '+(t?(t.d/10).toFixed(0):'-')+' m deep), a dry one none ('+Td.length+')',
  T.length===1&&deep&&t.d>=20&&Td.length===0,false);}
// the fans (relief P13): a stream falling 8 % onto a 1 % plain lays one at the break; an even slope none; a fan is nothing
// behind its apex and continuous
{const line=g=>{const P=[];let bed=500;for(let k=0;k<=60;k++){P.push([0,k*50,.5,bed]);bed-=50*g(k*50);}return {pts:P};};
 const F=WSTREAMS.fans([line(z=>z<1500?.08:.01)]),N=WSTREAMS.fans([line(()=>.03)]),f=F[0];
 let worst=0,p=null;if(f)for(let s=-f.R;s<=f.R;s+=.25){const v=WSTREAMS.fanAt(f,f.x+s*.6,f.z+s*.8);if(p!=null)worst=Math.max(worst,Math.abs(v-p));p=v;}
 ok('a fan where a stream leaves steep ground ('+F.length+(f?', apex at '+f.z+' m, '+Math.round(f.R)+' m across, '+f.H.toFixed(1)+' m high':'')+'), none on an even slope ('+N.length+')',
  F.length===1&&Math.abs(f.z-1500)<=150&&N.length===0,false);
 ok('a fan: nothing behind its apex, full below it, continuous (the steepest 25 cm step '+worst.toFixed(3)+' m)',
  f&&WSTREAMS.fanAt(f,f.x,f.z-f.R*.4)===0&&WSTREAMS.fanAt(f,f.x,f.z+f.R*.3)>f.H*.3&&worst<.1,false);}
// wet by its catchment's rain
const wet=WSTREAMS.trace(grid(valley,{rain:900})),dry=WSTREAMS.trace(grid(valley,{rain:250}));
ok('wet by rain: at 900 mm '+wet.lines.filter(L=>L.w).length+'/'+wet.lines.length+' wet, at 250 mm '+dry.lines.filter(L=>L.w).length+'/'+dry.lines.length,
 wet.lines.every(L=>L.w)&&dry.lines.length>0&&dry.lines.every(L=>!L.w),false);
ok('a dry land starts its streams further down (fewer stream cells at 250 mm: '+dry.cells+' to '+wet.cells+')',dry.cells<wet.cells,false);
// the strength: 0 at the head, rising downstream to the mouth
ok('a line\'s strength never falls downstream',D.every(P=>P.every((p,k)=>!k||p[2]>=P[k-1][2]-1e-9)),false);
// the same input, the same lines
ok('deterministic: two traces give the same lines',JSON.stringify(WSTREAMS.trace(grid(valley,{})).lines)===JSON.stringify(R.lines),false);
console.log(bad?bad+' FAILED':'all passed');
process.exit(bad?1:0);
