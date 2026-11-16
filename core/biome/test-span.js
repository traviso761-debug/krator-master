// node core/biome/test-span.js — KSPAN (45-core-span.js): catenaries between two anchors, each check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'45-core-span.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const K=KSPAN,near=(p,q,e)=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])<(e||1e-6);
const arc=(S,n)=>{const P=K.points(S,n||2000);let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1],P[i][2]-P[i-1][2]);return L;};
// a loom-chasms cable: 200 m across a rift, the far anchor 30 m lower
const A=[0,700,0],B=[120,670,160],S=K.solve(A,B,{length:260});
ok('the curve meets both anchors',near(K.at(S,0),A)&&near(K.at(S,1),B),near(K.at(S,1),A));
ok('its length is the length asked (arc '+arc(S).toFixed(3)+' m)',Math.abs(arc(S)-260)<.01&&Math.abs(S.length-260)<1e-6,Math.abs(arc(K.solve(A,B,{length:230}))-260)<.01);
ok('it hangs under the chord, lowest between the anchors',K.low(S).p[1]<670&&K.low(S).t>0&&K.low(S).t<1&&S.sag>20,false);
const Sg=K.solve(A,B,{sag:12});ok('solved by sag: 12 m under the chord\'s midpoint',Math.abs(Sg.sag-12)<1e-6&&Math.abs((A[1]+B[1])/2-K.at(Sg,.5)[1]-12)<1e-6,false);
const Sl=K.solve(A,B,{});ok('by default 4% of slack',Math.abs(Sl.length-Math.hypot(200,30)*1.04)<1e-6,false);
ok('more slack, more sag',K.solve(A,B,{slack:.1}).sag>K.solve(A,B,{slack:.02}).sag,K.solve(A,B,{slack:.1}).sag<=K.solve(A,B,{slack:.02}).sag);
const up=K.solve(A,B,{length:260,up:true});
ok('up: a buoyant cable arches over the chord, the mirror of the hanging one',near(K.at(up,0),A)&&near(K.at(up,1),B)&&K.at(up,.5)[1]>(A[1]+B[1])/2+20&&Math.abs(arc(up)-260)<.01,false);
const tg=K.tangent(S,0),fd=K.at(S,1e-6);ok('the tangent is the curve\'s direction',Math.abs(Math.hypot(...tg)-1)<1e-12&&near([A[0]+tg[0]*1e-6*S.D/Math.hypot(tg[0],tg[2]),0,0],[fd[0],0,0],1e-6)&&tg[1]<0,false);
const T=K.tension(S,40);ok('tension: the horizontal part is w c, the ends more, the higher end the most',Math.abs(T.H-40*S.c)<1e-9&&T.a>T.H&&T.b>T.H&&T.a>T.b,false);
const ST=K.strands({a0:[0,700,0],a1:[0,640,0],b0:[200,690,0],b1:[200,630,0],n:6,slack:[.02,.08],seed:4});
ok('strands: a curtain of n spans between two anchor lines, each its own slack by hash',ST.length===6&&ST.every((s,i)=>s.i===i&&near(K.at(s,0),[0,700-12*i,0])&&s.length>s.D)&&new Set(ST.map(s=>s.length.toFixed(6))).size===6,false);
ok('the same seed the same curtain; another, another',JSON.stringify(K.strands({a0:[0,700,0],a1:[0,640,0],b0:[200,690,0],b1:[200,630,0],n:6,seed:4}))===JSON.stringify(K.strands({a0:[0,700,0],a1:[0,640,0],b0:[200,690,0],b1:[200,630,0],n:6,seed:4}))&&JSON.stringify(K.strands({a0:[0,700,0],a1:[0,640,0],b0:[200,690,0],b1:[200,630,0],n:6,seed:5}))!==JSON.stringify(K.strands({a0:[0,700,0],a1:[0,640,0],b0:[200,690,0],b1:[200,630,0],n:6,seed:4})),false);
ok('a span is plain JSON',JSON.stringify(K.at(JSON.parse(JSON.stringify(S)),.3))===JSON.stringify(K.at(S,.3)),false);
ok('bad spans throw: shorter than the chord, no run, no sag',throws(()=>K.solve(A,B,{length:100}))&&throws(()=>K.solve([0,0,0],[0,9,0],{}))&&throws(()=>K.solve(A,B,{sag:0})),throws(()=>K.solve(A,B,{length:300})));
ok('the fragment uses no THREE, no DOM, no Math.random',!/THREE\.|document\.|Math\.random\(/.test(fs.readFileSync(path.join(__dirname,'45-core-span.js'),'utf8')),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
