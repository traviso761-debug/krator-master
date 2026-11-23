#!/usr/bin/env node
/* settlements/xanadu/tests/test-citadel-rooms.js: XS2 (STACK-PLAN.md section 9), Erewhon's citadel's room graph
   (settlements/xanadu/citadel/rooms/89yr-xa-citadel-rooms.js) on the vertical stack's room table (core/interiors KROOMLIGHT).
   The graph is checked against what the page draws (citadel-load.js runs the kit's 78d and 78n under a recording stub), then
   the table: every room reachable on foot or named dark; the Pleasure Dome's oculus lights its own room and only what an open
   portal joins to it; a windowless store at daylight 0; a jali window a reduced aperture; pickPool never reaches through a
   wall. Each claim has a negative: the check fails on a fault and passes on the fix (tools/ktest.js).
   Run: node settlements/xanadu/tests/test-citadel-rooms.js */
'use strict';
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
const {load,ROOT}=require('./citadel-load.js');
const L=load(),{G,KROOMLIGHT,XACITR,drawn}=L;
const clone=o=>JSON.parse(JSON.stringify(o));
const near=(a,b,e)=>Math.abs(a-b)<=(e==null?.011:e);
const byId={};for(const r of G.rooms)byId[r.id]=r;
const site=id=>G.sites.find(s=>s.id===id);
const table=(g,o)=>KROOMLIGHT.buildTable(XACITR.tableInput(g||G,o));
const T0=table();

/* ---------------------------------------------------------------- 1. the data is the page's */
{
 /* the windows: per building, the same panes xcPlan draws (where, sill, width, glass height) and the same jali cards */
 const panesMatch=g=>XACITR.SITES.filter(S=>S.id!=='dome').every(S=>{const s=site(S.id),mine=g.windows.filter(w=>w.room.indexOf('cit.'+S.id+'.')===0),P=drawn.cit[S.id].panes;
  if(mine.length!==P.length||mine.filter(w=>w.jali).length!==drawn.cit[S.id].jali)return false;
  return P.every(p=>mine.some(w=>near(w.at[0]-s.at[0],p.x)&&near(w.at[2]-s.at[1],p.z)&&near(w.sill,p.y)&&near(w.w,p.w)&&near(w.h,p.h)));});
 T.neg('every citadel window is a pane xcPlan draws, the jali where it sets a jali card ('+G.windows.filter(w=>w.kind==='window'&&w.room.indexOf('cit.dome.')<0).length+')',
  panesMatch,(()=>{const g=clone(G);g.windows.splice(g.windows.findIndex(w=>w.room==='cit.palace.audience'),1);return g;})(),G);
 /* the Dome: 78d's clerestory and skylight glass, the drum's panes, the gored domes' eyes, the chandeliers */
 const ds=site('dome'),dx=ds.at[0],dz=ds.at[1]+ds.oz;
 const domeMatch=g=>{const cl=g.windows.filter(w=>w.kind==='clerestory'),dr=g.windows.filter(w=>w.kind==='drum'),sk=g.skylights,lm=g.lamps.filter(l=>l.room.indexOf('cit.dome.')===0);
  const glassX=drawn.dome.glass.filter(a=>!(a[3]>10));   /* the clerestory's (the stair hall's skylight is 16 m wide) */
  const okCl=cl.length===glassX.length&&glassX.every(a=>cl.some(w=>near(w.at[0]-dx,a[0],.02)&&near(w.at[2]-dz,a[2],.02)&&near(w.sill,a[1])&&near(w.h,a[4],.02)));
  const okDr=dr.length===drawn.dome.panes.length&&drawn.dome.panes.every(a=>dr.some(w=>near(w.at[0]-dx,a[0],.02)&&near(w.at[2]-dz,a[2],.02)&&near(w.sill,a[1],.02)));
  const eyes=drawn.dome.gores.map(q=>({x:q.x,z:q.z,y:q.y+q.r*(q.hk==null?1:q.hk)*Math.cos(.13),r:q.r*Math.sin(.13)}));
  const okSk=eyes.every(e=>sk.some(s=>near(s.at[0]-dx,e.x)&&near(s.at[2]-dz,e.z)&&near(s.at[1],e.y)&&s.r!=null&&near(s.r,e.r,.002)))&&
   drawn.dome.glass.filter(a=>a[3]>10).every(a=>sk.some(s=>s.w===a[3]&&s.d===a[5]&&near(s.at[0]-dx,a[0])&&near(s.at[2]-dz,a[2])))&&sk.length===eyes.length+1;
  const okLm=lm.length===drawn.dome.chandeliers.length&&drawn.dome.chandeliers.every(c=>lm.some(l=>near(l.x-dx,c[0])&&near(l.z-dz,c[2])&&near(l.hang,c[1])&&l.size===c[3]&&l.drop===c[4]));
  return okCl&&okDr&&okSk&&okLm;};
 T.neg('the Dome\'s clerestory ('+G.windows.filter(w=>w.kind==='clerestory').length+'), drum ('+G.windows.filter(w=>w.kind==='drum').length+'), skylights ('+G.skylights.length+') and chandeliers are 78d\'s',
  domeMatch,(()=>{const g=clone(G);g.skylights[0].at[0]+=1.5;return g;})(),G);
 /* the sites are 87-er-layout's CIT_SITES */
 const lay=fs.readFileSync(path.join(ROOT,'settlements/xanadu/targets/erewhon/87-er-layout.js'),'utf8'),re=/\{key:'(xa_[a-z_]+)',w:[\d.]+,d:[\d.]+,v:\d+,t:\[[^\]]+\],at:\[(-?[\d.]+),(-?[\d.]+)\]/g,CS={};
 let m;while((m=re.exec(lay)))CS[m[1]]=[+m[2],+m[3]];
 const sitesMatch=S=>Object.keys(CS).length===S.length&&S.every(s=>CS[s.key]&&CS[s.key][0]===s.at[0]&&CS[s.key][1]===s.at[1]);
 T.neg('the ten sites stand where 87-er-layout CIT_SITES puts them',sitesMatch,XACITR.SITES.map((s,i)=>i===3?Object.assign({},s,{at:[s.at[0]+8,s.at[1]]}):s),XACITR.SITES);
}

/* ---------------------------------------------------------------- 2. data only, stable ids */
{
 const src=fs.readFileSync(path.join(ROOT,'settlements/xanadu/citadel/rooms/89yr-xa-citadel-rooms.js'),'utf8');
 T.ok('the fragment is [G data]: no THREE, no DOM, no Math.random',/\[G data\]/.test(src.split('\n')[0])&&!/\bTHREE\.|\bdocument\s*\.|\bwindow\s*[.[]|Math\.random|getImageData/.test(src.replace(/\/\/[^\n]*/g,'')));
 const again=load().G;
 T.ok('two builds give the same graph, byte for byte',JSON.stringify(again)===JSON.stringify(G));
 const idsOk=g=>{const all=[].concat(g.rooms,g.portals,g.windows,g.skylights,g.lamps).map(o=>o.id);if(new Set(all).size!==all.length)return false;const R=new Set(g.rooms.map(r=>r.id));
  return g.portals.every(p=>R.has(p.a)&&(p.b==null||R.has(p.b)))&&[].concat(g.windows,g.skylights,g.lamps).every(o=>R.has(o.room))&&g.rooms.every(r=>r.doors.every(d=>d.out||R.has(d.to)));};
 T.neg('every id unique and named (no counter), every portal, window, skylight and lamp on a room that exists',idsOk,(()=>{const g=clone(G);g.lamps[0].room='cit.dome.nowhere';return g;})(),G);
}

/* ---------------------------------------------------------------- 3. every room reachable on foot, or named dark */
{
 const reach=g=>{const adj={},seen=new Set(),Q=[];for(const r of g.rooms)adj[r.id]=[];
  for(const p of g.portals){if(!p.walk)continue;if(p.b){adj[p.a].push(p.b);adj[p.b].push(p.a);}else if(p.out)Q.push(p.a);}
  for(const r of Q)seen.add(r);while(Q.length){const u=Q.shift();for(const v of adj[u])if(!seen.has(v)){seen.add(v);Q.push(v);}}
  return g.rooms.filter(r=>!seen.has(r.id)).map(r=>r.id);};
 const unreached=reach(G);
 const reachOk=g=>reach(g).every(id=>g.dark[id]);
 T.neg('every room ('+G.rooms.length+') reachable on foot from outside through its doors, arches and flights, or named dark ('+unreached.length+' unreached)',
  reachOk,(()=>{const g=clone(G);g.portals=g.portals.filter(p=>p.a!=='cit.vizier.archive'&&p.b!=='cit.vizier.archive');return g;})(),G);
 const darkOk=g=>{const t=KROOMLIGHT.buildTable(XACITR.tableInput(g)),z=t.order.filter(id=>t.byId[id].interior&&t.byId[id].daylight===0);
  return z.length===Object.keys(g.dark).length&&z.every(id=>g.dark[id]);};
 T.neg('the rooms at daylight 0 (the leaves shut) are exactly the '+Object.keys(G.dark).length+' named dark, each with its reason',
  darkOk,(()=>{const g=clone(G);delete g.dark['cit.temple.hall'];return g;})(),G);
 const lit=T0.order.filter(id=>T0.byId[id].interior&&T0.byId[id].daylight>0).length;
 T.ok('the leaves open, every room but the Ramp\'s tower and its landings takes some daylight',(()=>{const t=table(G,{leaves:'open'});
  return t.order.filter(id=>t.byId[id].interior&&t.byId[id].daylight===0).every(id=>/^cit\.palace\.ramp/.test(id));})());
 console.log('      rooms '+G.rooms.length+' ('+G.rooms.filter(r=>!r.outdoor).length+' roofed, '+G.rooms.filter(r=>r.outdoor).length+' open courts and terraces); by day, leaves shut: '+lit+' lit, '+Object.keys(G.dark).length+' dark');
}

/* ---------------------------------------------------------------- 4. the oculus: a skylight portal on its own room */
{
 const oc=G.skylights.find(s=>s.kind==='oculus');
 /* where it is: inside the hall's plan by more than its radius and a metre, and over no other room */
 const under=(g,s)=>g.rooms.filter(r=>r.id!==s.room&&!r.outdoor&&r.box[1]<s.at[1]&&r.rects.some(q=>s.at[0]+s.r+1>q[0]&&s.at[0]-s.r-1<q[1]&&s.at[2]+s.r+1>q[2]&&s.at[2]-s.r-1<q[3])).map(r=>r.id);
 const placeOk=g=>{const s=g.skylights.find(q=>q.kind==='oculus'),R=g.rooms.find(r=>r.id===s.room),b=R.box,e=s.r+1;
  return s.open===true&&R.skylight===true&&s.at[0]-e>b[0]&&s.at[0]+e<b[3]&&s.at[2]-e>b[2]&&s.at[2]+e<b[5]&&s.at[1]<=b[4]+1e-6&&under(g,s).length===0;};
 T.neg('the oculus ('+oc.r+' m radius at '+oc.at[1]+' m) opens on the Hall of Feasts alone: a metre round it is over no other room',
  placeOk,(()=>{const g=clone(G);const s=g.skylights.find(q=>q.kind==='oculus');s.room='cit.dome.cage';g.rooms.find(r=>r.id==='cit.dome.cage').skylight=true;return g;})(),G);
 /* the light: the oculus the only sky (no window, no door out, no other skylight, no open court): it lights the hall and only
    what open portals join to it, the hall the brightest; a room with no open way to the hall stays at 0 */
 const onlyOculus=g=>{const h=clone(g),keep=new Set(h.rooms.filter(r=>!r.outdoor).map(r=>r.id));h.windows=[];
  h.skylights=h.skylights.filter(s=>s.kind==='oculus');const sk=new Set(h.skylights.map(s=>s.room));
  h.rooms=h.rooms.filter(r=>keep.has(r.id)).map(r=>Object.assign(r,{skylight:sk.has(r.id),doors:r.doors.filter(d=>!d.out&&keep.has(d.to))}));return h;};
 const comp=(g,from)=>{const seen=new Set([from]),Q=[from],R={};for(const r of g.rooms)R[r.id]=r;
  while(Q.length){const u=Q.shift();for(const d of R[u].doors)if(!d.leaf&&d.to&&!seen.has(d.to)){seen.add(d.to);Q.push(d.to);}}return seen;};
 const oculusOk=g=>{const h=onlyOculus(g),t=KROOMLIGHT.buildTable(XACITR.tableInput(h)),room=h.skylights[0].room,C=comp(h,'cit.dome.hall'),H=t.byId['cit.dome.hall'];
  const lit=t.order.filter(id=>t.byId[id].daylight>0);
  return room==='cit.dome.hall'&&H.hop===0&&H.daylight>=.66&&lit.every(id=>C.has(id)&&(id==='cit.dome.hall'||(t.byId[id].hop>=1&&t.byId[id].daylight<H.daylight)))&&
   t.order.filter(id=>!C.has(id)).every(id=>t.byId[id].daylight===0)&&lit.length<h.rooms.filter(r=>r.building==='dome').length;};
 T.neg('the oculus alone lights the hall (hop 0) and only the rooms an open portal chain joins to it, each dimmer; the rest of the Dome stays at 0',
  oculusOk,(()=>{const g=clone(G);const c=g.rooms.find(r=>r.id==='cit.dome.cage');c.doors.push({to:'cit.dome.cage',out:false,w:1,open:true,leaf:false,walk:false,portal:'x'});
   g.skylights.push({id:'leak',room:'cit.dome.cage',kind:'oculus',at:[0,0,0],x:0,y:0,z:0,r:1,open:true});return g;})(),G);
 {const h=onlyOculus(G),t=KROOMLIGHT.buildTable(XACITR.tableInput(h)),C=comp(h,'cit.dome.hall');
  console.log('      the oculus alone: the hall '+t.byId['cit.dome.hall'].daylight+'; lit with it '+t.order.filter(id=>t.byId[id].daylight>0&&id!=='cit.dome.hall').map(id=>id.slice(9)+' '+t.byId[id].daylight).join(', ')+
   '; dark '+t.order.filter(id=>!C.has(id)).length);}
 /* the pool: in the hall the oculus is a near light; next door behind a shut leaf (the harem school, its door on the hall a
    leaf), at the point of the school nearest the oculus, it is not, though it is in range there (the oculus the only candidate:
    the gate, not the ranking, is what is checked; the oculus is 41 m up, a column of light to KROOMLIGHT.pickPool) */
 const P=XACITR.pool(G),hall=byId['cit.dome.hall'];
 const eyeIn=r=>[Math.min(Math.max(oc.x,r.box[0]+.5),r.box[3]-.5),r.box[1]+1.6,Math.min(Math.max(oc.z,r.box[2]+.5),r.box[5]-.5)];
 const pickOc=(tb,eye)=>KROOMLIGHT.pickPool({eye:eyeIn(byId[eye]),eyeRoom:eye,table:tb,windows:P.windows.filter(w=>w.x===oc.x&&w.z===oc.z&&w.y===oc.y),lamps:[],sunUp:1,count:8,maxWindows:4})
  .some(p=>p.kind==='window'&&near(p.at[0],oc.x)&&near(p.at[2],oc.z));
 const sch=byId['cit.dome.school'],e=eyeIn(sch),d=Math.hypot(e[0]-oc.x,Math.max(0,e[1]-oc.at[1]),e[2]-oc.z);   /* a skylight's reach: across, the column down from it */
 const ocPool=tb=>d<26&&sch.doors.some(q=>q.to===hall.id&&q.leaf)&&pickOc(tb,hall.id)&&!pickOc(tb,sch.id)&&!pickOc(tb,'cit.dome.cage');
 T.neg('pickPool: the oculus is a light of the hall\'s pool by day, not of the school\'s behind its shut door ('+d.toFixed(1)+' m from its column)',
  ocPool,(()=>{const t=clone(T0);t.byId[sch.id].portals.push(hall.id);return t;})(),T0);
}

/* ---------------------------------------------------------------- 5. a windowless store stays dark; a jali lets less in */
{
 const stores=G.rooms.filter(r=>r.kind==='store'&&!G.windows.some(w=>w.room===r.id)).map(r=>r.id);
 const storeOk=g=>{const t=KROOMLIGHT.buildTable(XACITR.tableInput(g));return stores.length>0&&stores.every(id=>t.byId[id].daylight===0&&t.byId[id].windowCount===0&&t.byId[id].hop===-1);};
 T.neg('the windowless stores ('+stores.map(s=>s.slice(4)).join(', ')+') stay at daylight 0 behind their shut doors',
  storeOk,(()=>{const g=clone(G);for(const r of g.rooms)for(const d of r.doors)if(r.id==='cit.kitchens.ice'||d.to==='cit.kitchens.ice'){d.leaf=false;d.open=true;}return g;})(),G);
 const J=G.windows.filter(w=>w.jali),jOk=g=>g.windows.every(w=>w.jali?(w.aperture<1&&w.aperture>=XACITR.JALI):w.aperture===1);
 T.neg('a jali window ('+J.length+' of '+G.windows.length+') is a window of reduced aperture ('+Math.min(...J.map(w=>w.aperture))+'..'+Math.max(...J.map(w=>w.aperture))+'), a glazed one 1',
  jOk,(()=>{const g=clone(G);g.windows.find(w=>w.jali).aperture=1;return g;})(),G);
 const glazed=(()=>{const g=clone(G);for(const w of g.windows)w.aperture=1;return KROOMLIGHT.buildTable(XACITR.tableInput(g));})();
 const jr=[...new Set(J.map(w=>w.room))].filter(id=>!G.windows.some(w=>w.room===id&&!w.jali)&&T0.byId[id].hop===0);
 T.ok('a room lit through jali alone ('+jr.length+') is dimmer than if its windows were clear glass (the Divan '+T0.byId['cit.vizier.divan'].daylight+' against '+glazed.byId['cit.vizier.divan'].daylight+')',
  jr.length>0&&jr.every(id=>T0.byId[id].daylight<glazed.byId[id].daylight||glazed.byId[id].daylight>=.92));
}

/* ---------------------------------------------------------------- 6. no cross-wall light */
{
 const P=XACITR.pool(G),eyeAt=r=>[(r.box[0]+r.box[3])/2,r.box[1]+1.6,(r.box[2]+r.box[5])/2];
 const openNb={};for(const r of G.rooms)openNb[r.id]=new Set(r.doors.filter(d=>!d.leaf&&d.to).map(d=>d.to));
 const poolOk=tb=>G.rooms.filter(r=>!r.outdoor).every(r=>KROOMLIGHT.pickPool({eye:eyeAt(r),eyeRoom:r.id,table:tb,windows:P.windows,lamps:P.lamps,sunUp:.5,count:10,maxWindows:4})
  .every(p=>p.room===r.id||openNb[r.id].has(p.room)));
 T.neg('pickPool from the centre of every roofed room picks only that room\'s lights and its open portals\' (a leaf shut is a wall)',
  poolOk,(()=>{const t=table(G,{leaves:'open'});return t;})(),T0);
 /* rooms that share a wall and no portal: a lamp five times as bright half a metre behind it is never picked */
 const pairs=[];for(const a of G.rooms)for(const b of G.rooms){if(a.id>=b.id||a.outdoor||b.outdoor||a.building!==b.building)continue;
  if(a.doors.some(d=>d.to===b.id))continue;const A=a.box,B=b.box;if(!(A[1]<B[4]-.3&&B[1]<A[4]-.3))continue;
  const sx=Math.min(A[3],B[3])-Math.max(A[0],B[0]),sz=Math.min(A[5],B[5])-Math.max(A[2],B[2]);
  if(near(A[3],B[0],.7)&&sz>2)pairs.push([a,b,[A[3]-.5,(Math.max(A[2],B[2])+Math.min(A[5],B[5]))/2],[B[0]+.5]]);
  else if(near(A[5],B[2],.7)&&sx>2)pairs.push([a,b,[(Math.max(A[0],B[0])+Math.min(A[3],B[3]))/2,A[5]-.5],[null,B[2]+.5]]);}
 const wallOk=tb=>pairs.length>20&&pairs.every(([a,b,e,o])=>{const eye=[e[0],a.box[1]+1.6,e[1]],lx=o[0]==null?e[0]:o[0],lz=o[0]==null?o[1]:e[1];
  const picks=KROOMLIGHT.pickPool({eye,eyeRoom:a.id,table:tb,windows:[],lamps:P.lamps.concat([{room:b.id,x:lx,y:eye[1],z:lz,amp:5,r:14}]),sunUp:0,count:8});
  return!picks.some(p=>p.room===b.id);});
 T.neg('rooms sharing a wall with no portal ('+pairs.length+' pairs): a lamp five times as bright half a metre behind it is never picked',
  wallOk,(()=>{const t=clone(T0),[a,b]=pairs[0];t.byId[a.id].portals.push(b.id);return t;})(),T0);
}

/* ---------------------------------------------------------------- 7. the counts (STACK-PLAN.md section 9, XS2's row) */
{
 const n=k=>G.rooms.filter(r=>r.building===k).length,by=XACITR.SITES.map(s=>s.id+' '+n(s.id)).join(', ');
 const lampsIn=G.lamps.filter(l=>!byId[l.room].outdoor).length;
 console.log('      by building: '+by);
 console.log('      portals '+G.portals.length+' ('+G.portals.filter(p=>p.leaf).length+' with a leaf, '+G.portals.filter(p=>!p.leaf).length+' open), windows '+G.windows.length+
  ' ('+G.windows.filter(w=>w.jali).length+' jali), skylights '+G.skylights.length+' (the oculus, four gored eyes, the stair hall\'s), lamps '+G.lamps.length+' ('+lampsIn+' indoors, '+(G.lamps.length-lampsIn)+' in courts)');
 T.ok('the counts: '+G.rooms.length+' rooms, '+G.lamps.length+' lamps',G.rooms.length>150&&G.lamps.length>=20&&G.skylights.length===6);
}
T.done();
