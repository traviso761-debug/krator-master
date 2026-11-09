// ================================================================= ISLE DEMO — the expedition camps' shores: where a town's crew lands on another isle
// [G data] settlements/isle-demo 47x sends each town's crew by boat to a forest island (PLAN.md section 12; the owner,
// 2026-11-09). The sim knows no land: this is the page's answer (ISLE.hooks.expeditionShore). The ISLANDS below are the
// survey of 2026-11-09 (the region's landmasses on the sea router's grid; PLAN.md 12's table): for each town, shore points
// on the forest islands nearest it, nearest first. At the first call for a town the candidates are tried in order: the
// shore found from the point with a sea route to the town's trade landing (48 shoreOf, as the coastal hamlets'), the camp
// 150 m inland of it, dry and FOREST_MIN forest round it over the crew's near range (48's rule for a lumber stand), at
// least APART from every village, town and earlier camp; the first that passes is the shore (cached: the probe and
// verify.py read ISLE_EXPEDITIONS.shores). The forest the camp works is the isles kit's zones (forest where dry and off
// the town), the same function the lumber villages' crews range over.
//   ISLE_EXPEDITIONS.shoreFor(townName, n, kind) -> {x, z, shore: {x, z, ux, uz}, seaKm, forest(x, z), h(x, z), name, node?, from, kind} | null
//                          kind 'forest' (above), 'vents' (a geyser vent off the town's own island: the camp on the routed
//                          shore nearest it, the diggers' node the vent), 'reef' (a routed shore of the forest islands, the
//                          divers' node its best fishing reef within 1.5 km seaward); the same shore every season
//   ISLE_EXPEDITIONS.shores               the shores found so far by town and kind ('Kautoa|forest')
//   ISLE_EXPEDITIONS.onPitch(fn), onStrike(fn)   fn(C): the sim's camp record, for the drawing (88h, 88c)
var ISLE_EXPEDITIONS=(function(){'use strict';
const ISLANDS={
 Kautoa:[{name:'the forest island east',pts:[[60800,-53000],[61800,-57000],[63200,-61000],[59200,-45500],[64500,-65000]]},   /* 4,196 km2, 93 % forest; Kautoa's lumber village on its near shore */
         {name:'the islet north-east',pts:[[62000,-82500]]}],
 Valapo:[{name:'the forest island west',pts:[[-24400,33084],[-26500,30000],[-22500,36500],[-29000,27000]]},   /* 1,234 km2, 93 % forest, half rainforest */
         {name:'the jungle island far west',pts:[[-59970,48948],[-61500,45000]]}]};   /* 599 km2, 99 % forest, 60 % hypertropic */
const FOREST_MIN=.5,FOREST_R=1500,APART=3000,INLAND=150;
const shores={},pitchL=[],strikeL=[];
const H=(x,z)=>WORLD.H(x,z),HL=(x,z)=>WORLD.Hland?WORLD.Hland(x,z):WORLD.H(x,z),wet=(x,z)=>WORLD.water(x,z)>HL(x,z)-1.2;
const forest=(x,z)=>{if(!WORLD.inside(x,z)||wet(x,z)||WORLD.townW(x,z))return 0;const f=RINGISLES.zones(x,z).forest;return f>.6?f:0;};
const forestAround=(x,z)=>{let n=0,k=0;for(let dz=-FOREST_R;dz<=FOREST_R;dz+=150)for(let dx=-FOREST_R;dx<=FOREST_R;dx+=150){if(dx*dx+dz*dz>FOREST_R*FOREST_R)continue;n++;if(forest(x+dx,z+dz)>0)k++;}return n?k/n:0;};
function taken(){const V=[],C=[];const M=ISLE_HAMLETS.made;if(M)for(const E of M.villages)if(E.village&&E.village.site)V.push([E.village.site.x,E.village.site.z]);
 for(const k in shores)for(const s of shores[k])if(!s.none)C.push([s.x,s.z]);if(typeof ISLE!=='undefined'&&ISLE.SIM&&ISLE.SIM.exp)for(const c of ISLE.SIM.exp.camps)C.push([c.site.x,c.site.z]);return{V,C};}
const CAMP_APART=1000;   /* a camp of another kind may share an island, not a beach */
const okSite=(x,z,used)=>!(wet(x,z)||WORLD.townW(x,z))&&!used.V.some(q=>Math.hypot(q[0]-x,q[1]-z)<APART)&&!used.C.some(q=>Math.hypot(q[0]-x,q[1]-z)<CAMP_APART);
/* the shore of a point with a sea route to the berth: the point itself if it is near the sea, else the nearest point within
   `reach` m (16 bearings, 500 m steps) that is */
function routedShore(x,z,berth,reach){const s0=ISLE_HAMLETS.shoreOf({x,z},berth);if(s0&&s0.path)return s0;
 for(let r=500;r<=(reach||4000);r+=500)for(let a=0;a<16;a++){const px=x+Math.cos(a*Math.PI/8)*r,pz=z+Math.sin(a*Math.PI/8)*r;if(wet(px,pz))continue;const sh=ISLE_HAMLETS.shoreOf({x:px,z:pz},berth);if(sh&&sh.path)return sh;}
 return null;}
/* the forest's: the survey's candidate points, a sea route, dry forested ground inland of the shore, apart */
function forestShore(townName,berth,used,tried){
 for(const I of ISLANDS[townName]||[])for(const p of I.pts){const sh=ISLE_HAMLETS.shoreOf({x:p[0],z:p[1]},berth);const r={island:I.name,at:p,shore:!!sh,route:!!(sh&&sh.path)};tried.push(r);if(!sh||!sh.path)continue;
  const x=sh.x-sh.ux*INLAND,z=sh.z-sh.uz*INLAND;r.site=[Math.round(x),Math.round(z)];if(!okSite(x,z,used)){r.why='wet, a town, or too near a village or camp';continue;}
  const f=forestAround(x,z);r.forest=Math.round(f*100)/100;if(f<FOREST_MIN){r.why='thin forest';continue;}
  return{x,z,shore:{x:sh.x,z:sh.z,ux:sh.ux,uz:sh.uz},seaKm:Math.round(sh.path.len/100)/10,forest,h:H,name:I.name};}
 /* every candidate taken (a village on the beach: Valapo's clove plantation, 2026-11-09): rings round each island's first
    point, RING_STEP m apart out to RING_MAX, RING_N bearings, on forested ground only, nearest first */
 for(const I of ISLANDS[townName]||[]){const p=I.pts[0];for(let r=RING_STEP;r<=RING_MAX;r+=RING_STEP)for(let a=0;a<RING_N;a++){const px=p[0]+Math.cos(a/RING_N*2*Math.PI)*r,pz=p[1]+Math.sin(a/RING_N*2*Math.PI)*r;
  if(!(forest(px,pz)>0))continue;const sh=ISLE_HAMLETS.shoreOf({x:px,z:pz},berth),q={island:I.name,ring:[Math.round(px),Math.round(pz)],route:!!(sh&&sh.path)};tried.push(q);if(!sh||!sh.path)continue;
  const x=sh.x-sh.ux*INLAND,z=sh.z-sh.uz*INLAND;if(!okSite(x,z,used)){q.why='too near';continue;}const f=forestAround(x,z);if(f<FOREST_MIN){q.why='thin forest';continue;}
  return{x,z,shore:{x:sh.x,z:sh.z,ux:sh.ux,uz:sh.uz},seaKm:Math.round(sh.path.len/100)/10,forest,h:H,name:I.name};}}
 return null;}
const RING_STEP=2500,RING_MAX=7500,RING_N=12;
/* the vents': a geyser vent of the isles off the town's own island (`VENT_OFF` m from the town at least), nearest the town's
   landing first; the camp on the routed shore nearest it (within VENT_WALK m), the diggers' node at the vent */
const VENT_OFF=15000,VENT_WALK=5000;
function ventShore(townName,berth,used,tried){const P=ISLE_HAMLETS.parentOf(townName),V=(WORLD.VENTS||[]).filter(v=>Math.hypot(v[0]-P[0],v[1]-P[1])>=VENT_OFF).sort((a,b)=>Math.hypot(a[0]-berth.x,a[1]-berth.z)-Math.hypot(b[0]-berth.x,b[1]-berth.z));
 for(const v of V){const sh=routedShore(v[0],v[1],berth,VENT_WALK),r={vent:[Math.round(v[0]),Math.round(v[1])],route:!!sh};tried.push(r);if(!sh)continue;
  const x=sh.x-sh.ux*INLAND,z=sh.z-sh.uz*INLAND,walk=Math.hypot(v[0]-x,v[1]-z);r.site=[Math.round(x),Math.round(z)];r.walk=Math.round(walk);if(walk>VENT_WALK||!okSite(x,z,used)){r.why=walk>VENT_WALK?'too far to walk':'wet, a town, or too near';continue;}
  return{x,z,shore:{x:sh.x,z:sh.z,ux:sh.ux,uz:sh.uz},seaKm:Math.round(sh.path.len/100)/10,forest,h:H,name:'the vents at '+Math.round(v[0]/1000)+','+Math.round(v[1]/1000)+' km',node:{x:v[0],z:v[1]}};}
 return null;}
/* the reef's: the forest islands' routed shores again, the divers' node the best fishing reef (the isles kit's gather
   `fish`, REEF_MIN at least) within REEF_R m of the beach, seaward */
const REEF_MIN=.5,REEF_R=1500;
function reefShore(townName,berth,used,tried){
 for(const I of ISLANDS[townName]||[])for(const p of I.pts){const sh=ISLE_HAMLETS.shoreOf({x:p[0],z:p[1]},berth);const r={island:I.name,at:p,route:!!(sh&&sh.path)};tried.push(r);if(!sh||!sh.path)continue;
  const x=sh.x-sh.ux*INLAND,z=sh.z-sh.uz*INLAND;if(!okSite(x,z,used)){r.why='too near';continue;}
  let best=null;for(let d=100;d<=REEF_R;d+=100)for(const a of [-.6,-.3,0,.3,.6]){const c=Math.cos(a),s2=Math.sin(a),ux=sh.ux*c-sh.uz*s2,uz=sh.ux*s2+sh.uz*c,px=sh.x+ux*d,pz=sh.z+uz*d;
   if(!WORLD.inside(px,pz))continue;const g=RINGISLES.gather(px,pz).fish||0;if(g>=REEF_MIN&&(!best||g>best.g))best={x:px,z:pz,g};}
  r.reef=best?Math.round(best.g*100)/100:0;if(!best){r.why='no reef';continue;}
  return{x,z,shore:{x:sh.x,z:sh.z,ux:sh.ux,uz:sh.uz},seaKm:Math.round(sh.path.len/100)/10,forest,h:H,name:I.name+'\'s reef',node:{x:best.x,z:best.z}};}
 return null;}
function shoreFor(townName,n,kind){kind=kind||'forest';const M=ISLE_HAMLETS.made,berth=M&&M.berths&&M.berths[townName];if(!berth)return null;
 const key=townName+'|'+kind,L=shores[key]||(shores[key]=[]),had=L.find(x=>!x.none);if(had)return had;   /* the same shore each season: the stands, the vent and the bed are the town's */
 const used=taken(),tried=[],out=kind==='vents'?ventShore(townName,berth,used,tried):kind==='reef'?reefShore(townName,berth,used,tried):forestShore(townName,berth,used,tried);
 if(!out){L.push({n,kind,none:true,tried});return null;}
 Object.assign(out,{from:townName,n,kind,tried});L.push(out);return out;}
if(typeof ISLE!=='undefined'&&ISLE.hooks){ISLE.hooks.expeditionShore=(t,n,k)=>shoreFor(t,n,k);ISLE.hooks.expeditionPitched=C=>{for(const f of pitchL)try{f(C);}catch(e){}};ISLE.hooks.expeditionStruck=C=>{for(const f of strikeL)try{f(C);}catch(e){}};}
return{ISLANDS,shoreFor,shores,forest,forestAround,onPitch:f=>pitchL.push(f),onStrike:f=>strikeL.push(f),FOREST_MIN,APART,CAMP_APART,REEF_MIN};})();
