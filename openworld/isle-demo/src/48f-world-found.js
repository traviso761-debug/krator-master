// ================================================================= ISLE DEMO — founding on the map: the sim's hooks for a farming camp that becomes a hamlet
// [G data] settlements/isle-demo 47f founds a FARMING CAMP from a town's refugee households that waited for a house, and
// after its days converts it to a hamlet whose HIGHWAY its own hands build (PLAN.md section 11 step 5; the owner,
// 2026-11-09: "highways are buildable when a farming camp converts to a farming hamlet"). The sim knows no land: these
// hooks (ISLE.hooks) are the page's answers, on the same survey, layout and routing the hamlets of 48 and 48r were made
// with, so a founded hamlet stands and is joined as a baked one would be.
//   farmSite(townName, n)        the hinterland survey of 48 (dry, gentle, off-town cells that take the town's staples, 2 to
//                                14 km out, 3 km from every village, farmstead and camp so far) -> {x, z, y, ground} | null
//   layVillage(spec, camp)       core/hamlet's village on the camp's site with its farmland and holdings (48's farming
//                                layout), entered in ISLE_HAMLETS.made so the drawing (88h) and the checks see it
//   routeRoad(village, spec)     one road to the network as it stands (48r ISLE_ROADS.join): the record the hamlet builds
//   roadBuilt(road, report)      the built road into the world (41 WORLD.addRoad), the ground over it drawn again (81)
//   founded(report, camp, lay)   the new hamlet named: its entry in `made` named, the listeners told (88h draws it)
// Nothing here runs until the sim's step calls a hook; a page without the sim installs none.
//   ISLE_FOUND.onAdd(fn)   fn(E, X) when a founded village enters `made` (E: its made entry; X: the sim's report)
//   ISLE_FOUND.log         what the hooks did, for the probe and verify.py
var ISLE_FOUND=(function(){'use strict';
const log=[],listeners=[];
const dims=(()=>{let f=null;return k=>{if(!f){const IDIMS=ISK.dims(),CATK=(typeof CAT!=='undefined'&&CAT&&CAT.ASSET_BY_KEY)||{};f=k=>{const d=IDIMS[k];if(d)return{w:d.w,d:d.d,h:d.h};const a=CATK[k];return a?{w:a.w,d:a.d,h:a.h}:null;};}return f(k);};})();
const HM=ISLE_HAMLETS,H=HM.H,slope=HM.slope,groundOk=HM.groundOk,world=()=>4242;
const camps=()=>(typeof ISLE!=='undefined'&&ISLE.SIM&&ISLE.SIM.found?ISLE.SIM.found.camps:[]);
/* the survey: 48's farm site, every village, resource and camp so far taken */
function farmSite(townName,n){const M=HM.made;if(!M)return null;const P=HM.parentOf(townName);if(!P)return null;
 const sp={id:townName+':farmcamp'+n,parent:townName,crops:'staples'},crops=HM.cropRows(sp);if(!crops.length){log.push({op:'no crops',town:townName});return null;}
 const out={villages:M.villages.concat(camps().map(C=>({village:{site:{x:C.site.x,z:C.site.z}}}))),resources:M.resources};
 const c=HM.farmSite(sp,P,out,crops);log.push({op:'farm site',town:townName,n,at:c?[Math.round(c.x),Math.round(c.z)]:null,fit:c?c.fit:null});
 if(!c)return null;return{x:c.x,z:c.z,y:H(c.x,c.z),ground:{ok:groundOk,h:H,slope},avoid:null,fit:c.fit};}
/* the layout: 48's farming village on the camp's site (its lanes toward the town, the farmland FARM.off m beyond it) */
function layVillage(spec,C){const M=HM.made;if(!M)return{error:'the hamlets are not made (48t)'};const P=HM.parentOf(spec.parent);if(!P)return{error:'no parent '+spec.parent};
 const start=[spec.site.x,spec.site.z],dx=P[0]-start[0],dz=P[1]-start[1],L0=Math.hypot(dx,dz)||1,ux=dx/L0,uz=dz/L0;
 const site={x:start[0],z:start[1]},rp={x:start[0]-ux*HM.FARM.off,z:start[1]-uz*HM.FARM.off};
 const vspec={id:spec.id,world:world(),culture:'islander_east',focus:'farming',site,link:{x:site.x+ux*400,z:site.z+uz*400},resource:{x:rp.x,z:rp.z,workers:spec.hands},dims,
  ground:{ok:groundOk},siteReach:900,worksOut:['ie-farm'],vacant:typeof ISLE!=='undefined'&&ISLE.TUNE&&ISLE.TUNE.sim.hamlets.grow?ISLE.TUNE.sim.hamlets.grow.vacant:0};
 const v=KHAMLET.village(vspec);if(v.error){log.push({op:'layout failed',id:spec.id,why:v.error});return{village:v,resource:null,error:v.error};}
 const res=ISLE.farmlandOf(spec,v,{world:world(),centre:rp,ground:{ok:groundOk,h:H,slope}});
 const E={spec,village:v,resource:res,parent:P,road:null,sea:null,founded:C?C.id:true,name:null,gloss:null};M.villages.push(E);M.resources.push(res);
 log.push({op:'laid',id:spec.id,at:[Math.round(v.site.x),Math.round(v.site.z)],buildings:v.records.length,inCropHa:res.inCropHa});
 return{village:v,resource:res};}
/* the road: joined to the network as it stands; not in the world until built */
function routeRoad(v,spec){const t0=Date.now(),r=ISLE_ROADS.join(v,spec.parent);const E=(HM.made?HM.made.villages:[]).find(e=>e.spec.id===spec.id);
 if(r.error){log.push({op:'no road',id:spec.id,why:r.error,ms:Math.round(Date.now()-t0)});return null;}
 if(E)E.road={to:r.to,km:r.length_m/1000,townKm:r.townKm,pending:true};
 log.push({op:'routed',id:spec.id,to:r.to,km:Math.round(r.length_m/100)/10,townKm:r.townKm,ms:Math.round(Date.now()-t0)});return r;}
function bbox(pts,pad){let x0=1e18,z0=1e18,x1=-1e18,z1=-1e18;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}return[x0-pad,z0-pad,x1+pad,z1+pad];}
function roadBuilt(rec,X){if(!rec||!rec.pts)return;const n=WORLD.addRoad(rec),E=(HM.made?HM.made.villages:[]).find(e=>e.spec.id===X.id);if(E&&E.road)E.road.pending=false;
 const b=bbox(rec.pts,260),k=typeof TERRAIN!=='undefined'&&TERRAIN&&TERRAIN.refresh?TERRAIN.refresh(b[0],b[1],b[2],b[3]):0;
 log.push({op:'road built',id:X.id,roads:n,km:Math.round(rec.length_m/100)/10,chunks:k});}
function founded(X,C,L){const E=(HM.made?HM.made.villages:[]).find(e=>e.spec.id===X.id);if(E){E.name=X.name;E.gloss=null;if(KHAMLET.NAMES&&KHAMLET.NAMES.islander){const row=KHAMLET.NAMES.islander.find(r=>r.name===X.name);if(row)E.gloss=row.gloss;}}
 log.push({op:'founded',id:X.id,name:X.name,camp:C.id,people:X.people});for(const f of listeners)try{f(E,X,C);}catch(e){log.push({op:'listener failed',why:String(e)});}}
if(typeof ISLE!=='undefined'&&ISLE.hooks)Object.assign(ISLE.hooks,{farmSite,layVillage,routeRoad,roadBuilt,founded});
return{farmSite,layVillage,routeRoad,roadBuilt,founded,onAdd:f=>listeners.push(f),log,bbox};})();
