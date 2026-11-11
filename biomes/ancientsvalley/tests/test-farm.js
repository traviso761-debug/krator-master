#!/usr/bin/env node
/* The Terraces' plan (stations/terraces/41d-av-farm.js) in node, on the station's own record (region/station-terraces.json), the metropolis
   kit's farm families (their footprints and the aqueduct's joint) and the crops kit (what the fields grow). Each check has a negative.
   Run: node biomes/ancientsvalley/tests/test-farm.js */
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const ctx={console,Math,JSON};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','core/space/20-core-space.js','kits/crops/src/10-crop-core.js','kits/crops/src/20-crop-records.js','kits/crops/src/22-crop-material.js','kits/crops/src/40-crop-query.js',
 'kits/metropolis/src/40-mp-records.js','kits/metropolis/src/46-mp-designs.js','kits/metropolis/src/46f-mp-farm.js',
 'biomes/ancientsvalley/src/41-av-field.js','biomes/ancientsvalley/stations/terraces/41d-av-farm.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
const RG=JSON.parse(fs.readFileSync(path.join(__dirname,'..','region','station-terraces.json'),'utf8'));
const AV=vm.runInContext('AV',ctx),MP=vm.runInContext('MP',ctx),CROPS=vm.runInContext('CROPS',ctx),KRAND=vm.runInContext('KRAND',ctx);
let fails=0,n=0;const ok=(name,c,neg)=>{n++;const good=!!c&&(neg===undefined||neg===false);if(!good)fails++;console.log((good?' ok   ':' FAIL ')+name+(neg!==undefined?'  (negative '+(neg===false?'fails':'DID NOT FAIL')+')':''));};
const SEED=KRAND.hash(1110,455,899),R=2800,M=AV.model(RG.grid),BASE=RG.site.base,LY=RG.lake.y;
const ground=AV.farmLand({model:M,base:BASE,lakeY:LY,seed:SEED});
/* what the station's stage passes: the families' half extents, the joint, the crops the swlowlands zones can grow that have a card (46z) */
const extent=fam=>{const F=MP.FAMILY[fam],fp=F.footprint;return fp.r!=null&&fam!=='aqueduct'?[fp.r,fp.r]:[fp.w/2,fp.d/2];};
const crops=AV.farmCrops?AV.farmCrops(CROPS):[];
const mk=()=>AV.farm({R,seed:SEED,ground,lakeY:LY,extent,joint:MP.aqueductJoin,crops,hubNear:[0,500]});
const P=mk(),T=P.towers,fam=f=>T.filter(t=>t.family===f);
console.log('hub',Math.round(P.hub.x),Math.round(P.hub.z),'y',P.hub.y.toFixed(1),'| towers',T.length,'| by family',JSON.stringify(MP.FARM_KEYS.map(k=>k+' '+fam(k).length)),'| roads',P.roads.length,'| crossings',P.crossings.length,
 '| pylons',P.pylons.map(l=>l.list.length).join('+'),'| fields',P.fields.length,'(',P.fields.filter(f=>f.orchard).length,'orchards ) | clusters',P.clusters.length,JSON.stringify(P.clusters.reduce((a,c)=>(a[c.kind]=(a[c.kind]||0)+1,a),{})),'| dropped',JSON.stringify(P.dropped),'| crops',crops.length);
ok('the crops: at least six with cards, field crops and tree crops ('+crops.map(c=>c.id).join(', ')+')',crops.length>=6&&crops.some(c=>c.form==='tree')&&crops.some(c=>c.form!=='tree')&&crops.every(c=>c.card),crops.length&&!crops.every(c=>c.card&&c.card.indexOf('card')===0));
ok('the plan: every family stands, pods the most, twenty modules of aqueduct or more',MP.FARM_KEYS.every(k=>fam(k).length>0)&&fam('pod').length>=20&&fam('aqueduct').length>=20,false);
/* the pods on their plinths: a building stands where the raw ground under its box varies by under 7 m (its pad levels that), its y the ground at its centre */
const under=t=>{let lo=1e9,hi=-1e9;for(let a=-1;a<=1;a+=.5)for(let b=-1;b<=1;b+=.5){const lx=a*(t.rx-6),lz=b*(t.rz-6),x=t.x+lx*t.c+lz*t.s,z=t.z-lx*t.s+lz*t.c,h=ground(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}return{lo,hi};};
/* a honeycomb's pod stands on its array's level instead: the ground under its box within 5 m of it (the relief cuts and fills the rest, the walks with it) */
const arrOf=t=>t.array!=null&&(P.clusters.find(c=>c.id===t.array)||{});
const seated=L=>L.filter(t=>t.family!=='aqueduct').every(t=>{const u=under(t);if(t.array!=null){const A=arrOf(t);return Math.abs(t.y-A.y)<.01&&u.lo>=A.y-5.01&&u.hi<=A.y+5.01;}return Math.abs(t.y-ground(t.x,t.z))<.01&&u.hi-u.lo<(t.family==='stack'?10.5:7);});
{const ai=T.findIndex(q=>q.array!=null),ni=T.findIndex(q=>q.family==='pod'&&q.array==null);
 ok('every building on a level plinth: its y the ground at its centre (a honeycomb pod on its array level), under 7 m of fall under its box (a stack 10.5)',seated(T),
  seated(T.map((t,i)=>i===ai?Object.assign({},t,{y:t.y+5}):t))||seated(T.map((t,i)=>i===ni?Object.assign({},t,{y:t.y+5}):t)));}
/* the honeycombs: three arrays or more of twelve pods or more, each pod on the 53 m hex lattice round its array's centre (a flat to flat walk of 8 m
   between neighbours), no two pods closer than 52 m, and no building's walls (its box less the 6 m margin) inside another's */
{const AR=P.clusters.filter(c=>c.kind==='array'),pods=fam('pod'),onLat=L=>L.filter(t=>t.array!=null).every(t=>{const A=arrOf(t),q=(t.x-A.x)/(53*Math.cos(Math.PI/6)),r=(t.z-A.z-q*26.5)/53;return Math.abs(q-Math.round(q))<.01&&Math.abs(r-Math.round(r))<.01;});
 const apart=L=>{for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)if(Math.hypot(L[i].x-L[j].x,L[i].z-L[j].z)<52)return false;return true;};
 /* two pods are hexes (45 m across the flats, the flats' normals at 30, 90, 150 degrees): they overlap when every normal finds them closer than that */
 const hexHit=(a,b)=>[30,90,150].every(d=>{const t=d*Math.PI/180;return Math.abs((b.x-a.x)*Math.cos(t)+(b.z-a.z)*Math.sin(t))<45;});
 const hard=t=>({x:t.x,z:t.z,c:t.c,s:t.s,rx:t.rx-6,rz:t.rz-6}),overlap=L=>{for(let i=0;i<L.length;i++)for(let j=0;j<L.length;j++){if(i===j||L[i].family==='aqueduct'||L[j].family==='aqueduct')continue;const a=hard(L[i]),b=L[j];if(a.rx+6===32&&L[i].family==='pod'&&b.family==='pod'){if(hexHit(L[i],b))return true;continue;}if(Math.hypot(a.x-b.x,a.z-b.z)>a.rx+a.rz+b.rx+b.rz)continue;
   for(const[cx,cz]of[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]){const lx=cx*(b.rx-6),lz=cz*(b.rz-6);if(AV.farmBoxD(a,b.x+lx*b.c+lz*b.s,b.z-lx*b.s+lz*b.c)<0)return true;}}return false;};
 const good=L=>AR.length>=3&&AR.every(A=>A.members.length>=12)&&onLat(L)&&apart(L.filter(t=>t.family==='pod'))&&!overlap(L);
 const shove=T.map(t=>t===pods.find(q=>q.array!=null)?Object.assign({},t,{x:t.x+20}):t);
 ok('the honeycombs: '+AR.length+' arrays of '+AR.map(A=>A.members.length).join(', ')+' pods on the hex lattice, '+pods.length+' pods in all, none closer than 52 m, no walls overlapping',good(T),good(shove));}
/* nothing in a road: no building's box within the carriageway (half its width and 1 m); the aqueduct's piers apart from its arches */
const J=MP.aqueductJoin,piers=t=>{const out=[];for(let k=0;k<=J.arches;k++){const u=-J.len/2+k*J.span;out.push({x:t.x+u*t.c,z:t.z-u*t.s,c:t.c,s:t.s,rx:J.pier/2+.3,rz:J.depth/2+.3});}return out;};
const inRoad=(L,roads)=>{let bad=[];for(const r of roads)for(let i=0;i+1<r.pts.length;i++){const a=r.pts[i],b=r.pts[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let q=0;q<=l;q+=3){const x=a[0]+(b[0]-a[0])*q/l,z=a[1]+(b[1]-a[1])*q/l;
  for(const t of L){if(Math.hypot(t.x-x,t.z-z)>t.padR+r.w)continue;const boxes=t.family==='aqueduct'?piers(t):[{x:t.x,z:t.z,c:t.c,s:t.s,rx:t.rx-6,rz:t.rz-6}];if(boxes.some(B=>AV.farmBoxD(B,x,z)<r.w/2+1))bad.push(t.id+' in '+r.id);}}}return [...new Set(bad)];};
{const bad=inRoad(T,P.roads),tr=P.roads.find(r=>r.kind==='trunk'),p0=fam('pod')[0],moved=Object.assign({},p0,{x:tr.pts[3][0],z:tr.pts[3][1]});
 ok('nothing stands in a road ('+P.roads.length+' roads'+(bad.length?'; '+bad.slice(0,4).join(', '):'')+')',!bad.length,!inRoad([moved],[tr]).length);}
/* the aqueduct continuous: each module's east end the next's west end, within 0.6 m; the channel level but for its fall; every module on its contour */
const chain=L=>{let worst=0,step=0;for(let i=1;i<L.length;i++){worst=Math.max(worst,Math.hypot(L[i-1].b[0]-L[i].a[0],L[i-1].b[1]-L[i].a[1]));step=Math.max(step,Math.abs(L[i-1].y-L[i].y));}return{worst,step};};
{const A=P.aqueduct.modules,c=chain(A),off=A.reduce((m,t)=>Math.max(m,Math.abs(ground(t.x,t.z)-t.y)),0),gap=A.filter((t,i)=>i!==Math.floor(A.length/2)),cg=chain(gap);
 ok('the aqueduct is continuous: '+A.length+' modules, the worst joint '+c.worst.toFixed(2)+' m apart, the channel stepping '+c.step.toFixed(3)+' m, on its contour within '+off.toFixed(1)+' m',A.length>=20&&c.worst<.6&&c.step<.05&&off<10,cg.worst<.6);}
/* a road meets the aqueduct under an arch: its crossing in an arch's clear span */
const under2=(X,mods)=>X.every(x=>{const t=mods.find(m=>m.id===x.module),u=(x.x-t.x)*t.c-(x.z-t.z)*t.s,A=J.archAt(u);return !!A&&Math.abs(u-A.c)<=A.half-5;});
ok('every road crosses the aqueduct under an arch ('+P.crossings.length+' crossings)',under2(P.crossings,P.aqueduct.modules),P.crossings.length?under2(P.crossings.map(x=>{const t=P.aqueduct.modules.find(m=>m.id===x.module),u=(x.x-t.x)*t.c-(x.z-t.z)*t.s,k=Math.round((u+J.len/2)/J.span),d=-J.len/2+k*J.span-u;return Object.assign({},x,{x:x.x+d*t.c,z:x.z-d*t.s});}),P.aqueduct.modules):false);
/* the pylons clear of the pads, the roads and the aqueduct */
const pyl=P.pylons.reduce((a,l)=>a.concat(l.list),[]),pyBad=L=>L.filter(p=>T.some(t=>t.family!=='aqueduct'&&AV.farmBoxD(t,p.x,p.z)<10)||P.roadD(p.x,p.z)<5||P.aqD(p.x,p.z)<12).length;
ok('the pylons stand clear of the buildings, the roads and the aqueduct ('+pyl.length+' pylons, '+pyl.filter(p=>p.state==='up').length+' standing)',pyl.length>=14&&!pyBad(pyl),pyBad(pyl.concat([{x:fam('pod')[0].x,z:fam('pod')[0].z}]))===0);
/* the fields clear of everything, both orchards and fields */
const fBad=L=>L.filter(f=>{const ca=Math.cos(f.yaw),sa=Math.sin(f.yaw);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const x=f.x+a*f.w/2*ca-b*f.d/2*sa,z=f.z+a*f.w/2*sa+b*f.d/2*ca;if(T.some(t=>t.family!=='aqueduct'&&AV.farmBoxD(t,x,z)<2)||P.roadD(x,z)<1)return true;}return false;}).length;
ok('the fields stand clear of the buildings and the roads ('+P.fields.length+' fields, '+P.fields.filter(f=>f.orchard).length+' orchards)',P.fields.length>=150&&P.fields.some(f=>f.orchard)&&P.fields.some(f=>!f.orchard)&&!fBad(P.fields),fBad(P.fields.concat([Object.assign({},P.fields[0],{x:fam('pod')[0].x,z:fam('pod')[0].z})]))===0);
ok('the ruin shares: under a tenth whole, most of the glass gone, and the aqueduct mostly standing',fam('pod').filter(t=>t.state==='intact').length/fam('pod').length<.15&&fam('aqueduct').filter(t=>/intact|gutted|crown/.test(t.state)).length/fam('aqueduct').length>.6,false);
ok('the plan is deterministic',JSON.stringify(mk().towers.map(t=>[t.id,t.x,t.z,t.state]))===JSON.stringify(T.map(t=>[t.id,t.x,t.z,t.state])),false);
console.log(fails?fails+' FAILED of '+n:'all '+n+' passed');process.exit(fails?1:0);
