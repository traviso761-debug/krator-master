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
//   ISLE_EXPEDITIONS.shoreFor(townName, n) -> {x, z, shore: {x, z, ux, uz}, seaKm, forest(x, z), h(x, z), name, from} | null
//   ISLE_EXPEDITIONS.shores               the shores found so far by town
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
function taken(){const L=[];const M=ISLE_HAMLETS.made;if(M)for(const E of M.villages)if(E.village&&E.village.site)L.push([E.village.site.x,E.village.site.z]);
 for(const t in shores)for(const s of shores[t])if(!s.none)L.push([s.x,s.z]);if(typeof ISLE!=='undefined'&&ISLE.SIM&&ISLE.SIM.exp)for(const C of ISLE.SIM.exp.camps)L.push([C.site.x,C.site.z]);return L;}
function shoreFor(townName,n){const M=ISLE_HAMLETS.made,berth=M&&M.berths&&M.berths[townName];if(!berth)return null;
 const L=shores[townName]||(shores[townName]=[]),had=L.find(x=>x.n===n&&!x.none);if(had)return had;   /* asked again (verify.py, then the sim): the same shore, not one kept apart from itself */
 const used=taken(),tried=[];
 for(const I of ISLANDS[townName]||[])for(const p of I.pts){const sh=ISLE_HAMLETS.shoreOf({x:p[0],z:p[1]},berth);const r={island:I.name,at:p,shore:!!sh,route:!!(sh&&sh.path)};tried.push(r);if(!sh||!sh.path)continue;
  const x=sh.x-sh.ux*INLAND,z=sh.z-sh.uz*INLAND;r.site=[Math.round(x),Math.round(z)];if(wet(x,z)||WORLD.townW(x,z)){r.why='wet or town';continue;}
  const f=forestAround(x,z);r.forest=Math.round(f*100)/100;if(f<FOREST_MIN){r.why='thin forest';continue;}
  if(used.some(q=>Math.hypot(q[0]-x,q[1]-z)<APART)){r.why='too near a village or camp';continue;}
  const out={x,z,shore:{x:sh.x,z:sh.z,ux:sh.ux,uz:sh.uz},seaKm:Math.round(sh.path.len/100)/10,forest,h:H,name:I.name,from:townName,n,tried};L.push(out);return out;}
 L.push({n,none:true,tried});return null;}
if(typeof ISLE!=='undefined'&&ISLE.hooks){ISLE.hooks.expeditionShore=(t,n)=>shoreFor(t,n);ISLE.hooks.expeditionPitched=C=>{for(const f of pitchL)try{f(C);}catch(e){}};ISLE.hooks.expeditionStruck=C=>{for(const f of strikeL)try{f(C);}catch(e){}};}
return{ISLANDS,shoreFor,shores,forest,forestAround,onPitch:f=>pitchL.push(f),onStrike:f=>strikeL.push(f),FOREST_MIN,APART};})();
