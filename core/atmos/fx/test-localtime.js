// node core/atmos/fx/test-localtime.js -- particles on a local clock and gravity (fx/89-atmos-fx-localtime.js): the data is
// deterministic on core/rand, a stopped particle never moves, a stilled zone's core hangs while its outside runs, heavy gravity
// makes a fall short and dust flat; each check with a negative. The drawing is checked on core/atmos/fxdemo (verify.py).
'use strict';
const fs=require('fs'),path=require('path');global.window=global;
require(path.join(__dirname,'..','..','rand','08-core-rand.js'));
const src=[path.join(__dirname,'..','89-atmos-0-core.js'),path.join(__dirname,'..','89-atmos-0p-presets.js'),path.join(__dirname,'89-atmos-fx-localtime.js')];
eval(src.map(f=>fs.readFileSync(f,'utf8')).join('\n')+';global.ATMOS=ATMOS;');
const N=require(path.join(__dirname,'..','..','anomaly','20-core-anomaly.js'));
const A=global.ATMOS;let bad=0;const ok=(n,p,neg)=>{const r=!!p&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+n+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const ALL=[{kind:'drops',at:[0,0,0],r:20,h:30,n:50},{kind:'motes',at:[0,0,0],r:20,h:6,n:50},{kind:'steam',at:[0,0,0],n:30},
 {kind:'curtain',lip:[[-5,0,25],[5,0,25]],dir:[0,1],speed:2,drop:25,n:60},{kind:'burst',at:[0,5,0],r:12,n:40},{kind:'birds',at:[0,30,0],r:30,n:8},{kind:'pall',at:[0,0,0],r:40,n:20}];
const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);
const moved=(D,t0,t1)=>{let m=0;for(let i=0;i<D.n;i++)m=Math.max(m,dist(A.localFxAt(D,i,t0),A.localFxAt(D,i,t1)));return m;};

const D1=A.localFxData(ALL,{seed:5}),D2=A.localFxData(ALL,{seed:5}),D3=A.localFxData(ALL,{seed:6});
ok('the same emitters and seed give the same particles; another seed others',JSON.stringify(D1)===JSON.stringify(D2)&&D1.n===258,JSON.stringify(D1)===JSON.stringify(D3));
ok('an unknown kind is refused',throws(()=>A.localFxData([{kind:'sparkle',at:[0,0,0]}])),throws(()=>A.localFxData([{kind:'drops',at:[0,0,0]}])));
const allFinite=D=>[D.ipos,D.pp,D.pv,D.pg].every(a=>a.every(Number.isFinite));
ok('every attribute is a finite number',allFinite(D1),allFinite({ipos:[NaN],pp:[],pv:[],pg:[]}));

// stopped (rate 0): nothing moves in a thousand seconds; running (rate 1): every kind moves
const Ds=A.localFxData(ALL,{rate:()=>0}),Dr=A.localFxData(ALL,{rate:()=>1});
ok('at rate 0 no particle of any kind moves in 1,000 s',moved(Ds,0,1000)===0,moved(Dr,0,1000)===0);
const kindsMove=ALL.map((e,j)=>{const D=A.localFxData([e],{rate:()=>1});return moved(D,0,.7)>.01;});
ok('at rate 1 every kind moves',kindsMove.every(Boolean),!kindsMove.some(Boolean));

// a stilled zone from core/anomaly: the core hangs, the outside runs, the rim is slow
const R=N.create({seed:1});R.add({kind:'time',shape:{type:'circle',at:[0,0],r:300},time:1e-4,rim:100});
const rate=(x,y,z)=>R.at(x,y,z).time;
const rain=[{kind:'drops',at:[0,0,0],r:20,h:30,n:80},{kind:'drops',at:[1000,0,0],r:20,h:30,n:80},{kind:'drops',at:[260,0,0],r:5,h:30,n:80}];
const Dz=A.localFxData(rain,{rate}),part=(D,a,b)=>({n:b-a,ipos:D.ipos.slice(3*a,3*b),pp:D.pp.slice(4*a,4*b),pv:D.pv.slice(4*a,4*b),pg:D.pg.slice(4*a,4*b)});
const core=part(Dz,0,80),out=part(Dz,80,160),rim=part(Dz,160,240);
ok('in the Stilled Ground\'s core the rain hangs (under a centimetre in ten seconds); outside it falls',moved(core,0,10)<.01&&moved(out,0,1)>1,moved(core,0,10)>=.01);
ok('at the rim it falls, slowly',moved(rim,0,1)>moved(core,0,1)&&moved(rim,0,1)<moved(out,0,1),moved(rim,0,1)>=moved(out,0,1));

// the Press: heavy gravity
const fall=g=>A.localFxData([{kind:'curtain',lip:[[0,0,30],[0,0,30]],dir:[1,0],speed:3,drop:30,n:40}],{g:()=>g});
const run=D=>{let m=0;for(let i=0;i<D.n;i++)for(let t=0;t<5;t+=.02)m=Math.max(m,A.localFxAt(D,i,t)[0]);return m;};
ok('under 3 g a fall runs shorter from its lip (hitting hard and short)',run(fall(3))<run(fall(1))*.7,run(fall(3))>=run(fall(1)));
const meanY=(D,t)=>{let s=0;for(let i=0;i<D.n;i++)s+=A.localFxAt(D,i,t)[1];return s/D.n;};
const dust=g=>A.localFxData([{kind:'motes',at:[0,0,0],r:20,h:6,n:100}],{g:()=>g}),pall=g=>A.localFxData([{kind:'pall',at:[0,0,0],r:40,h:1.2,n:30}],{g:()=>g});
ok('under 3 g the dust lies flat (a ninth of its height) and the pall a third',Math.abs(meanY(dust(3),0)*9-meanY(dust(1),0))<1e-9&&Math.abs(meanY(pall(3),0)*3-meanY(pall(1),0))<1e-9,meanY(dust(3),0)>=meanY(dust(1),0));
ok('a reversed zone\'s gravity is taken as its size (the fall still falls; the lift is a later kind)',fall(-3).pg[0]===3,fall(-3).pg[0]<0);

// the held explosion: at rate 0 it stays at its phase; at rate 1 it loops
const B=e=>A.localFxData([{kind:'burst',at:[0,0,0],r:10,period:4,phase:.3,n:20}],{rate:()=>e});
ok('a burst at rate 0 holds at its phase; at rate 1 it is back where it was after one period',moved(B(0),0,123)===0&&moved(B(1),0,4)<1e-9&&moved(B(1),0,2)>1,moved(B(1),0,2)<=1);

// the sizes are the presets', and a curtain is a sheet: at any moment the water near the lip spans the lip (its place across
// the lip and its phase are separate seeds)
const P=A.PRESETS.localfx,sizeOk=ALL.every(e=>{const D=A.localFxData([e]);for(let i=0;i<D.n;i++){const s=D.pg[4*i+1]/P.size[e.kind];if(s<.69||s>1.31)return false;}return true;});
ok('every particle\'s size is its kind\'s preset, give or take 30%',sizeOk,ALL.every(e=>{const D=A.localFxData([e]);return D.pg[1]===e.at[2];}));
const sheet=t=>{const D=A.localFxData([{kind:'curtain',lip:[[0,0,30],[20,0,30]],dir:[0,1],speed:2,drop:30,n:400}],{rate:()=>1});const xs=[];for(let i=0;i<D.n;i++){const p=A.localFxAt(D,i,t);if(p[1]>25)xs.push(p[0]);}return Math.max(...xs)-Math.min(...xs);};
ok('a curtain is a sheet: the water in its top fifth spans the lip at any moment',sheet(0)>16&&sheet(3.3)>16,sheet(0)<16);
const fl=A.localFxData([{kind:'birds',at:[0,30,0],r:400,n:20},{kind:'birds',at:[0,30,0],r:40,n:20}],{rate});
ok('birds read the field on their circle: a flock round the zone runs, one inside it hangs',fl.pp.slice(0,80).filter((v,i)=>i%4===3).every(r=>r===1)&&fl.pp.slice(80).filter((v,i)=>i%4===3).every(r=>r<1e-3),fl.pp.slice(0,80).filter((v,i)=>i%4===3).some(r=>r<1));const G=A.localFxGLSL();
ok('the shaders carry no sin hash and the presets\' numbers',!/fract\(\s*sin/.test(G.vs+G.fs)&&G.vs.indexOf(A.glf(A.PRESETS.localfx.fall))>0&&G.vs.indexOf('pv.w/sqrt(g)')>0,/fract\(\s*sin/.test(G.vs+G.fs));
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
