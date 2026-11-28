// ================================================================= OPEN WORLD: the countryside sample (the province's bulk villages)
// [G data] No THREE, no DOM. settlements/xanadu/HAMLETS-PLAN.md section 3 (the owner, 2026-11-22: each province region draws a
// seeded sample of its villages, so the land between the named places is lived in; the sim never counts them). A region opts
// in with WORLD_SAMPLE in its src/48-world-site.js; 88r lays the sample at load and hands it to 88s, which draws, tags,
// clears and checks it as it does the plan's own villages.
//   WSAMPLE.cfg(spec, o)        the sample's settings: spec {prov, culture, cell (m), foci [[focus, weight]], pop [min, max],
//                               minFarm, keep (a cell's chance is its farmland x keep), clear {site, village, road} (m)};
//                               o {world (the region's seed), avoid [{x, z, r, why}], roads [[x, z], ...] polylines}
//   WSAMPLE.at(S, i, j)         cell (i, j)'s village, or null: {id, prov, i, j, x, z, farm, focus, pop}. A pure function of
//                               (world, province, cell): its seed is KRAND's hash of the province's child seed and the cell,
//                               never of how many came before it, so the same cell lays the same village in both engines
//   WSAMPLE.why(S, c)           why a candidate is refused (outside, water, a site's or village's ground, a road), or null
//   WSAMPLE.all(S, box)         every village in [x0, z0, x1, z1] (the region's box by default: regionBox())
//   WSAMPLE.lay(S, c, kit)      the village laid by core/hamlet (KHAMLET.village on its row, at KSITES.siteFor's good ground
//                               near the cell's point), as a plan's hamlet record (48s plan(): records, lanes, census, green)
// The density: a cell of S.cell metres a side holds at most one village (its point kept 20 % in from the cell's edges, so two
// stand at least 0.4 cell apart), kept with the chance farmland x keep (HAMLETS-PLAN: the bulk villages at their density,
// thinned for the frame).
var WSAMPLE=(function(){'use strict';
const D=(v,d)=>v==null?d:v;
function cfg(spec,o){o=o||{};const s=spec||{},c=s.clear||{};
 return{prov:s.prov||'p1',culture:s.culture||'xanadu',cell:D(s.cell,6000),foci:s.foci||[['farming',1]],pop:s.pop||[120,300],minFarm:D(s.minFarm,.3),keep:D(s.keep,1.4),
  clear:{site:D(c.site,4000),village:D(c.village,2200),road:D(c.road,250)},world:o.world>>>0,avoid:o.avoid||[],roads:o.roads||[],
  seed:KRAND.child(o.world>>>0,'sample.'+(s.prov||'p1'))};}
function pick(L,u){let t=0;for(const f of L)t+=f[1];let a=u*t;for(const f of L){a-=f[1];if(a<=0)return f[0];}return L[L.length-1][0];}
function at(S,i,j){const st=KRAND.stream(KRAND.hash(S.seed,i+4096,j+4096));
 const x=(i+.2+.6*st.next())*S.cell,z=(j+.2+.6*st.next())*S.cell,roll=st.next(),fu=st.next(),pu=st.next();
 if(!WORLD.inside(x,z))return null;const farm=typeof WRES!=='undefined'?WRES.farm(x,z):.5;
 if(farm<S.minFarm||roll>farm*S.keep)return null;
 return{id:'sample.'+S.prov+'.'+i+'.'+j,prov:S.prov,i,j,x:Math.round(x),z:Math.round(z),farm:Math.round(farm*100)/100,focus:pick(S.foci,fu),pop:Math.round(S.pop[0]+(S.pop[1]-S.pop[0])*pu)};}
function segD(P,x,z){let b=1e18;for(let k=1;k<P.length;k++){const a=P[k-1],q=P[k],ex=q[0]-a[0],ez=q[1]-a[1],L2=ex*ex+ez*ez||1,t=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/L2));
  b=Math.min(b,Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t));}return b;}
function why(S,c){if(!WORLD.inside(c.x,c.z))return'outside';if(WORLD.water(c.x,c.z)>WORLD.H(c.x,c.z)-1.2)return'water';
 for(const a of S.avoid)if(Math.hypot(c.x-a.x,c.z-a.z)<a.r)return a.why||'a place';
 for(const R of S.roads)if(segD(R,c.x,c.z)<S.clear.road)return'a road';
 return null;}
/* the region's box in its local metres: the frame's box_px round its origin_px (2 km a pixel) */
function regionBox(){const F=WORLD_DATA.meta.frame,o=F.origin_px,b=F.box_px,m=(F.m_per_px==null?2000:F.m_per_px);return[(b[0]-o[0])*m,(b[1]-o[1])*m,(b[2]-o[0])*m,(b[3]-o[1])*m];}
function all(S,box){const B=box||regionBox(),out=[];
 for(let i=Math.floor(B[0]/S.cell);i<=Math.floor(B[2]/S.cell);i++)for(let j=Math.floor(B[1]/S.cell);j<=Math.floor(B[3]/S.cell);j++){const c=at(S,i,j);if(c&&!why(S,c))out.push(c);}
 return out;}
/* the village laid: core/hamlet's KHAMLET.village on the culture's row at KSITES.siteFor's good ground within 600 m of the cell's
   point, its lane toward the nearest of S.avoid's places (its market); as 48s plan() records a site's hamlet */
function lay(S,c,kit){const r2=v=>Math.round(v*100)/100;
 const site=KSITES.siteFor([c.x,c.z],600,120);if(!site)return{id:c.id,error:'no ground for a village within 600 m of its point'};
 let near=null,nd=1e18;for(const a of S.avoid){const d=Math.hypot(a.x-site.x,a.z-site.z);if(d<nd){nd=d;near=a;}}
 const link=near?{x:near.x,z:near.z}:{x:site.x+1000,z:site.z};
 const v=KHAMLET.village({id:c.id,world:S.world,culture:S.culture,focus:c.focus,site,link,dims:kit.dims,ground:{ok:KSITES.groundOk},popMax:c.pop});
 const main=(v.lanes||[]).find(l=>l.main)||(v.lanes||[])[0],end=main?main.pts[main.pts.length-1]:[v.site.x,v.site.z];
 return{id:c.id,name:'a '+c.focus+' village of the countryside ('+S.prov+')',focus:c.focus,culture:S.culture,sample:true,site:{x:r2(v.site.x),z:r2(v.site.z)},
  end:{x:r2(end[0]),z:r2(end[1])},census:{pop:v.census.pop,households:v.census.households},
  green:v.green?{x:r2(v.green.x),z:r2(v.green.z),w:v.green.w,d:v.green.d,ry:Math.round((v.green.ry||0)*1e4)/1e4}:null,
  records:v.records.map(r=>({id:r.id,key:r.key,role:r.role,pending:!!r.pending,x:r2(r.x),z:r2(r.z),ry:Math.round(r.ry*1e4)/1e4,w:r.w,d:r.d,h:r.h})),
  lanes:(v.lanes||[]).map(l=>({id:l.id,w:l.w,main:!!l.main,pts:l.pts.map(p=>[r2(p[0]),r2(p[1])])})),error:v.error||null};}
return{cfg,at,why,all,lay,regionBox};})();
