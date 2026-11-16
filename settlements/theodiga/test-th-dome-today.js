/* node settlements/theodiga/test-th-dome-today.js: the Dome as the faith keeps it (src/44-th-dome-today.js), each check with a
   negative (tools/ktest.js): each Pilgrims' Stair climbs from the kora (400) to the deck (420) in unbroken flights at one grade;
   its well lies in its stair head on the sheet (TH_ARC_PROGRAM) and on the deck inside the drum, outside the hall; its shaft
   is clear of the crest's blocks and leaves the kora 6 m; a flight over another leaves headroom; the deck's cut cells hold the
   whole well; the panes are hashed, every tint used; the same twice. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require('../../tools/ktest.js')(__filename);
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','settlements/theodiga/src/43-th-arc-program.js','settlements/theodiga/src/44-th-dome-today.js'].forEach(load);
const zc=x=>-140*(1-Math.pow(x/320,2)),CX=0,CZ=zc(0)-65,DECK_R=124,DRUM_R=120,HALL_R=44;
const S=TH_DOME_TODAY.stairs({zc,H:400,deckY:420});
console.log(S.map(s=>s.id+': well '+[s.well.x0,s.well.x1,s.well.z0,s.well.z1].map(v=>v.toFixed(1)).join(' ')+', kora '+s.kora.toFixed(1)+' m').join('; '));
const clone=()=>JSON.parse(JSON.stringify(S));
const fault=f=>{const X=clone();f(X);return X;};
const HEAD={'th.dome.stair.east':'th.arc.dome.8','th.dome.stair.west':'th.arc.dome.9'};
const U={};for(const u of TH_ARC_PROGRAM)U[u.id]=u;
const BL=TH_DOME_TODAY.blocks(zc),hit=(a,b)=>a.x0<b.x1&&a.x1>b.x0&&a.z0<b.z1&&a.z1>b.z0;
const corners=w=>[[w.x0,w.z0],[w.x1,w.z0],[w.x1,w.z1],[w.x0,w.z1]];
const CHECKS={
 'each stair climbs from the kora (400) to the deck (420) in unbroken flights at a grade of 0.5':X=>{let bad=[];
   for(const s of X){const F=s.flights;if(F[0].a[1]!==400||F[F.length-1].b[1]!==420)bad.push(s.id+' ends');
    F.forEach((f,i)=>{const g=Math.abs((f.b[1]-f.a[1])/(f.b[0]-f.a[0]));if(Math.abs(g-.5)>1e-6)bad.push(s.id+' grade '+g);if(i&&Math.abs(F[i-1].b[1]-f.a[1])>1e-6)bad.push(s.id+' break at '+i);
     if(i&&Math.abs(F[i-1].b[0]-f.a[0])>1e-6)bad.push(s.id+' turn '+i);});}
   return [bad.length===0,bad.join('; ')||'2 stairs, 5 flights each'];},
 'each well lies in its stair head on the sheet, on the deck inside the drum and outside the hall':X=>{let bad=[];
   for(const s of X){const u=U[HEAD[s.id]],w=s.well;if(!u||w.x0<u.x0-.01||w.x1>u.x1+.01||w.z0<u.z0-.01||w.z1>u.z1+.01)bad.push(s.id+' outside its head');
    for(const p of corners(w)){const r=Math.hypot(p[0]-CX,p[1]-CZ);if(r>=DRUM_R||r<=HALL_R)bad.push(s.id+' corner at r '+r.toFixed(1));}}
   return [bad.length===0,bad.join('; ')||'inside'];},
 'each shaft is clear of the crest\'s blocks and leaves the kora 6 m':X=>{let bad=[];
   for(const s of X){const w=s.well;if(BL.A.concat(BL.B).some(b=>hit(w,b)))bad.push(s.id+' in a block');
    const zB=Math.min(...BL.B.filter(b=>b.x0<w.x1&&b.x1>w.x0).map(b=>b.z0));if(zB-w.z1<6-1e-6)bad.push(s.id+' kora '+(zB-w.z1).toFixed(1));}
   return [bad.length===0,bad.join('; ')||'clear'];},
 'a flight over another leaves 2.2 m of headroom':X=>{let worst=1e9;
   for(const s of X){const F=s.flights;for(let i=0;i<F.length;i++)for(let j=i+1;j<F.length;j++){const a=F[i],b=F[j];
    if(Math.abs(a.a[2]-b.a[2])>(a.w+b.w)/2)continue;
    const ax=[Math.min(a.a[0],a.b[0]),Math.max(a.a[0],a.b[0])],bx=[Math.min(b.a[0],b.b[0]),Math.max(b.a[0],b.b[0])];if(ax[1]<=bx[0]||bx[1]<=ax[0])continue;
    worst=Math.min(worst,Math.min(b.a[1],b.b[1])-.45-Math.max(a.a[1],a.b[1]));}}
   return [worst>=2.2,'least '+worst.toFixed(2)+' m'];}};
const NEG={
 'each stair climbs from the kora (400) to the deck (420) in unbroken flights at a grade of 0.5':X=>{X[0].flights[2].a[1]+=1;X[0].flights[2].b[1]+=1;},
 'each well lies in its stair head on the sheet, on the deck inside the drum and outside the hall':X=>{X[1].well.z1+=6;},
 'each shaft is clear of the crest\'s blocks and leaves the kora 6 m':X=>{X[0].well.z0-=4;},
 'a flight over another leaves 2.2 m of headroom':X=>{const f=X[0].flights[2];f.a[1]-=6;f.b[1]-=6;}};
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](S);T.ok(name+' ('+detail+')',pass,detail);T.neg('negative: '+name,Y=>CHECKS[name](Y)[0],fault(NEG[name]),clone());}
/* the deck's cut: every sample point of the well lies in a cut cell, and the cut is one block a well */
{const o={nu:72,nv:12,R:DECK_R,cx:CX,cz:CZ},C=TH_DOME_TODAY.cells(S.map(s=>s.well),o),TAU=2*Math.PI;
 const inCut=(cs,x,z)=>{const a=(Math.atan2(z-CZ,x-CX)+TAU)%TAU,i=Math.floor(a/TAU*72),j=Math.floor(Math.hypot(x-CX,z-CZ)/DECK_R*12);return cs.some(c=>i>=c.i0&&i<=c.i1&&j>=c.j0&&j<=c.j1);};
 const covers=cs=>S.every(s=>{const w=s.well;for(let a=0;a<=10;a++)for(let b=0;b<=10;b++)if(!inCut(cs,w.x0+(w.x1-w.x0)*a/10,w.z0+(w.z1-w.z0)*b/10))return false;return true;});
 T.ok('the deck\'s cut holds every well whole ('+C.map(c=>'cells '+c.i0+'-'+c.i1+' x '+c.j0+'-'+c.j1).join(', ')+')',C.length===S.length&&covers(C));
 const shrunk=C.map(c=>Object.assign({},c,{i1:c.i0}));T.ok('negative: a cut a cell short is caught',!covers(shrunk));}
/* the panes: hashed by cell, every tint used over the frame's cells, the same twice */
{const n=TH_DOME_TODAY.PALETTE.length,seen=new Array(n).fill(0);for(let i=0;i<144;i++)for(let j=0;j<42;j++)seen[TH_DOME_TODAY.pane(9270,i,j)]++;
 T.ok('every salvaged tint is used ('+seen.join(' ')+')',seen.every(v=>v>0));
 T.ok('a pane\'s tint is its cell\'s alone',TH_DOME_TODAY.pane(9270,17,9)===TH_DOME_TODAY.pane(9270,17,9)&&[...Array(50).keys()].some(k=>TH_DOME_TODAY.pane(9270,k,9)!==TH_DOME_TODAY.pane(9270,17,9)));}
T.ok('the records rerun the same',JSON.stringify(TH_DOME_TODAY.stairs({zc,H:400,deckY:420}))===JSON.stringify(S));
T.done();
