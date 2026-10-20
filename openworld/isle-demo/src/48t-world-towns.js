// ================================================================= ISLE DEMO — the towns planned here (M7): Kautoa and Valapo on the world's ground
// [G data] settlements/isle-demo/PLAN.md, M7. The two towns are planned on this page exactly as the city page plans them
// (settlements/isle-demo/src 20-50: ISLE.siteGround, ISLE.city, ISLE.census, ISLE.checks, read in place by build.py),
// from the same site file (SITE_INIT) and the same kits' boxes (ISLE_DIMS, ISLE_VDIMS), on the same ground: the city
// page decodes the region's rasters itself, this page has them already (WORLD.init ran before the LATE modules). Each
// town keeps its own registry in its own frame (core/tags, build 'isle-demo:<town>'), so its records, ids and the sim's
// places are the city page's; the frame {x, z, sea} puts it in the world.
// Then the world's land takes each town's ground (WORLD.landHook, chained after the coast's and the geysers'): inside the
// town's square its grid (the owner's ground edits and the landmarks' terraces in it) over the town's sea, easing back to
// the world's own land over BAND metres at the square's edge. The grid was sampled from the world's land before the hook
// was set, so outside the edits the two agree. Then both towns are declared on core/simulation (ISLE.simDeclare, as the
// city page declares them). 88t-world-towns.js draws them; it decides nothing.
//   ISLE_TOWNS_W.lay()            plan both, set the land hook, declare the sim (once; the LATE module below calls it)
//   ISLE_TOWNS_W.plans            [{town, G, R, census, checks, tags, ms}] in ISLE.TOWNS order
//   ISLE_TOWNS_W.at(x, z)         the plan whose square holds the world point, or null
//   ISLE_TOWNS_W.local(P, x, z)   a world point in P's frame: [x, z]
//   ISLE_TOWNS_W.ground(x, z)     the towns' ground at a world point and its weight: {h, w} (w 0 outside every square)
//   ISLE_TOWNS_W.select(town)     the town the export reads (ISLE.cur, KTAGS.page): the city page's drawn town
//   ISLE_TOWNS_W.stats            {ms, errors, sim, simError}
var ISLE_TOWNS_W=(function(){
const BAND=150,S={ms:{},errors:[],sim:null,simError:null},plans=[];
const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function plan(town){const Si=ISLE.townSite(SITE_INIT,town),P=ISLE.PROG[town];
 if(!Si)throw new Error('the site file has no '+town);
 const G=ISLE.siteGround(Si,P),tags=KTAGS.create({build:'isle-demo:'+town});
 const R=ISLE.city(town,{site:Si,ground:G,tags,dims:k=>ISLE_DIMS[k]==null?null:ISLE_DIMS[k],vdims:k=>ISLE_VDIMS[k]==null?null:ISLE_VDIMS[k]});
 return{town,G,R,census:ISLE.census(R),checks:ISLE.checks(R,G),tags,ms:{plan:R.log.ms}};}
const local=(P,x,z)=>{const F=P.G.frame;return[x-F.x,z-F.z];};
function at(x,z){for(const P of plans){const L=local(P,x,z);if(Math.abs(L[0])<P.G.half&&Math.abs(L[1])<P.G.half)return P;}return null;}
const GW={h:0,w:0};
function ground(x,z){GW.w=0;GW.h=0;
 for(const P of plans){const L=local(P,x,z),half=P.G.half,a=Math.max(Math.abs(L[0]),Math.abs(L[1]));if(a>=half)continue;
  GW.w=smooth((half-a)/BAND);GW.h=P.G.h(L[0],L[1])+P.G.frame.sea;return GW;}
 return GW;}
function select(town){const P=plans.find(p=>p.town===town);if(!P)return null;ISLE.cur=P;KTAGS.page=P.tags;return P;}
function lay(){if(plans.length)return plans;ISLE.worldReady=true;   /* WORLD.init ran (98-world-start.js): no WORLD_RAW on this page */
 for(const town of ISLE.TOWNS){try{plans.push(plan(town));}catch(e){S.errors.push(town+': '+(e&&e.stack?e.stack:e));}}
 const prev=WORLD.landHook;
 WORLD.landHook=(x,z,h,mw)=>{if(prev)h=prev(x,z,h,mw);const g=ground(x,z);return g.w>0?h+(g.h-h)*g.w:h;};
 try{S.sim=ISLE.simDeclare(plans.map(P=>({R:P.R,G:P.G})));}catch(e){S.simError=String(e&&e.stack?e.stack:e);}
 if(plans.length)select(plans[0].town);
 return plans;}
if(typeof LATE!=='undefined')LATE.push(()=>{try{lay();}catch(e){S.errors.push(String(e&&e.stack?e.stack:e));}});   /* before the terrain's module: the land is laid with the towns in it */
return{lay,plans,at,local,ground,select,stats:S,BAND};})();
