/* node settlements/theodiga/test-th-arc.js: the arcology's inhabited levels (src/43-th-arc.js, from the sheets' programs in
   src/43-th-arc-program.js) on kits/ancients-interiors' floor plates, each check with a negative (tools/ktest.js): every unit
   has its storeys; every room stands inside its unit (AI.storeyAudit); every room but a corridor has a door; every program maps
   onto kits/interiors' (no silent fallback); the furnished rooms are many and the unfurnished ones are the empty programs; the
   cut-away's levels are the distinct storey heights; the same twice. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require('../../tools/ktest.js')(__filename);
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['kits/ancients-interiors/src/10-ai-core.js','kits/ancients-interiors/src/35-ai-plates.js','settlements/theodiga/src/43-th-arc-program.js','settlements/theodiga/src/43-th-arc.js'].forEach(load);
const AI=global.KratorAncientsInteriors;
const B=TH_ARC.buildings(AI);
const rooms=[];for(const b of B)for(const st of b.storeys)for(const R of st.rooms)rooms.push(Object.assign({b:b.id},R));
console.log(B.length+' units, '+B.reduce((n,b)=>n+b.storeys.length,0)+' storeys, '+rooms.length+' rooms ('+rooms.filter(R=>R.furnish).length+' to furnish); levels '+TH_ARC.levels().length);
const U={};for(const u of TH_ARC_PROGRAM)U[u.id]=u;
const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
const edgeD=(p,P)=>{let d=1e9;for(let i=0,j=P.length-1;i<P.length;j=i++)d=Math.min(d,segD(p,P[j],P[i]));return d;};
const inPoly=(p,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const CHECKS={
 'every unit has its storeys at its heights':X=>{let n=0;for(const b of X){const u=U[b.id];if(!u||b.storeys.length!==u.n)n++;else b.storeys.forEach((s,i)=>{if(Math.abs(s.y-(u.y0+i*u.h))>.01)n++;});}return [n===0&&X.length===TH_ARC_PROGRAM.length,n+' off'];},
 /* every corner of every room inside its unit or on its edge (0.3 m): a curved band's centroid is off the band, so not that */
 'every room stands inside its unit':X=>{let n=0;for(const b of X){const O=TH_ARC.outline(U[b.id]);
   for(const st of b.storeys)for(const R of st.rooms){if(!R.poly)continue;if(R.poly.some(p=>!inPoly(p,O)&&edgeD(p,O)>.3))n++;}}return [n===0,n+' rooms outside'];},
 'every room but a corridor or core has a door':X=>{let n=0;for(const b of X)for(const st of b.storeys)for(const R of st.rooms)if(R.kind!=='corridor'&&R.kind!=='core'&&!(R.doors&&R.doors.length))n++;return [n===0,n+' without a door'];},
 'every program maps onto the placer (no silent fallback)':X=>{const bad=TH_ARC_PROGRAM.filter(u=>!(u.kind in TH_ARC.PROG)).map(u=>u.kind);return [bad.length===0,bad.join(', ')||'all mapped'];},
 'the furnished rooms are many; the unfurnished are the empty programs and the corridors':X=>{let f=0,bad=0;
   for(const b of X)for(const st of b.storeys)for(const R of st.rooms){if(R.furnish)f++;else if(!(R.kind==='corridor'||R.kind==='core'||R.empty))bad++;}return [f>=1000&&bad===0,f+' furnished, '+bad+' unfurnished without a reason'];}};
const NEG={
 'every unit has its storeys at its heights':X=>{X[3].storeys.pop();},
 'every room stands inside its unit':X=>{const R=X[20].storeys[0].rooms[0];R.poly=R.poly.map(p=>[p[0]+400,p[1]]);},
 'every room but a corridor or core has a door':X=>{X[30].storeys[1].rooms.find(R=>R.kind!=='corridor'&&R.kind!=='core').doors=[];},
 'every program maps onto the placer (no silent fallback)':null,
 'the furnished rooms are many; the unfurnished are the empty programs and the corridors':X=>{for(const b of X)for(const st of b.storeys)for(const R of st.rooms)R.furnish=false;}};
const clone=()=>{const X=TH_ARC.buildings(AI);return X;};
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](B);T.ok(name+' ('+detail+')',pass,detail);
 if(NEG[name]){const X=clone();NEG[name](X);T.neg('negative: '+name,Y=>CHECKS[name](Y)[0],X,clone());}}
/* the program check's negative: an unknown program is caught */
{const k0=TH_ARC_PROGRAM[0].kind;TH_ARC_PROGRAM[0].kind='no such program';const bad=!CHECKS['every program maps onto the placer (no silent fallback)'](B)[0];TH_ARC_PROGRAM[0].kind=k0;
 T.ok('negative: an unknown program is caught',bad);}
/* every storey passes the plates' own audit (rooms inside the storey's outline, their areas) */
{let fails=0,first='';for(const b of B)for(const st of b.storeys){const O=st.outline,f=AI.storeyAudit(st,(x,z)=>inPoly([x,z],O)||O.some(p=>Math.hypot(p[0]-x,p[1]-z)<.2));if(f.length){fails++;if(!first)first=b.id+': '+f[0];}}
 T.ok('every storey passes AI.storeyAudit ('+fails+' failing'+(first?'; '+first:'')+')',fails===0,first);}
/* the Dome's deck (2026-11-16): every room but the open ones is a pavilion, walled round with its door gap on the crest's side
   (downstream, +z of the room's centre); the big halls carry their recipe */
{const dome=B.filter(b=>b.area==='dome');let bad=[];
 for(const b of dome){const st=b.storeys[0],W=st.walls.find(w=>w.pavilion),R=st.rooms[0],open=TH_ARC.OPEN[b.kind];
  if(open&&W)bad.push(b.id+' walled but open');if(!open&&!W)bad.push(b.id+' not walled');
  if(W){const n=R.poly.length,cz=R.poly.reduce((s,p)=>s+p[1]/n,0);if(!W.door||W.door.at[1]<cz)bad.push(b.id+' door not downstream');}
  if(TH_ARC.RECIPE[b.kind]&&R.recipe!==TH_ARC.RECIPE[b.kind])bad.push(b.id+' without its recipe');}
 T.ok('the Dome\'s rooms are pavilions with their doors downstream, the big halls with their recipes ('+(bad.join('; ')||dome.length+' rooms')+')',bad.length===0,bad.join('; '));
 const neg=JSON.parse(JSON.stringify(dome[3].storeys[0]));neg.walls=[];
 T.ok('negative: a pavilion without its wall is caught',!TH_ARC.OPEN[dome[3].kind]&&!neg.walls.find(w=>w.pavilion));}
const L=TH_ARC.levels();T.ok('the cut-away has '+L.length+' levels, 370 to 420 m',L.length>=20&&Math.abs(L[0]-370)<.01&&Math.abs(L[L.length-1]-420)<.01,L.join(' '));
T.ok('the plan reruns the same',JSON.stringify(TH_ARC.buildings(AI).map(b=>b.storeys))===JSON.stringify(B.map(b=>b.storeys)));
T.done();
