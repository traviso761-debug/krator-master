// ================================================================= HOST — the station's placement (89z runs STATION_BUILD; PLAN.md sections 3 and 7)
// the air as ambient fields (45: AIR_P, AIR_T): core/hazard's thin-air and cold rows read the station's corrected record
if(typeof KHAZ!=='undefined'&&KHAZ.provide){KHAZ.provide('pressure',(x,y,z)=>AIR_P(x,y,z));KHAZ.provide('temperature',(x,y,z)=>AIR_T(x,y,z));}
const DRY=(x,z)=>{const w=waterH(x,z);return w<-1e8||terrainH(x,z)>w+.3?1:0;};
// STATION 3's wall points for the galls: round the maar, the first steep ground above the talus (the fractures where the deck's condensate runs)
function gallPoints(){const out=[];if(SKEY!=='pitfloor')return out;const n=1800;
 for(let k=0;k<n;k++){reseed(KRAND.hash(9861,k));if(rng()>.45)continue;const a=k/n*TAU,cx=Math.cos(a),cz=Math.sin(a);
  for(let r=L.edgeR-140;r<SITE.maar.r;r+=3){const x=cx*r,z=cz*r,s=SLOPE_AT(x,z);if(s>.55){const y=terrainH(x,z);if(y>SITE.fog.top)break;
   out.push({x,y:y-.5,z,nx:-cx,nz:-cz,tx:-cz,tz:cx,s:rr(.7,1.3)});break;}}}
 return out;}
const STATION_BUILD=function(Q){Q=Q==null?1:Q;let st;
 if(SKEY==='pitfloor'){const camp=PLAN.camp||(()=>1e9);
  st=SIPHON.build({station:'pitfloor',R:SITE.maar.r,quality:Q,heat:HEAT_AT,cap:SIPHON.TREECAP.pitfloor,galls:gallPoints(),
   keep:(x,z)=>DRY(x,z)&&camp(x,z)>12?1:0});}
 else if(SKEY==='terraces'){const lot=PLAN.lot||(()=>1e9);
  st=SIPHON.build({station:'terraces',R:TERR.R-150,quality:Q,fieldAt:FIELD_OF,braid:PLAN.braid,willow:SITE.willow,keep:(x,z)=>DRY(x,z)&&lot(x,z)>6?1:0});}
 else if(SKEY==='scarp'){const road=(x,z)=>L.ROAD.at(x,z).d;
  st=SIPHON.build({station:'scarp',R:TERR.R-150,quality:Q,slope:SLOPE_AT,normal:(x,z)=>KF.normal(x,z),keep:(x,z)=>road(x,z)>5?1:0});}
 else{/* the Arete: the lee of every block (the blizzard comes from 290 degrees: west-north-west), off the trail on the knife-edge */
  const wd=[Math.cos((SITE.wind.dir==null?290:SITE.wind.dir)*Math.PI/180),Math.sin((SITE.wind.dir==null?290:SITE.wind.dir)*Math.PI/180)];
  st=SIPHON.build({station:'arete',R:TERR.R-150,quality:Q,slope:SLOPE_AT,normal:(x,z)=>KF.normal(x,z),grass:.15,
   shelter:(x,z)=>{const n=KF.normal(x,z);return clamp(.35+1.6*(n[0]*wd[0]+n[2]*wd[1]),0,1);},
   keep:(x,z)=>Math.abs(z)<4&&Math.abs(x)<SITE.crest[1]?0:1});}
 st.trees=SIPHON.TREES.length;st.treeRule=SIPHON.treeRule(SKEY,SIPHON.TREES);
 return st;};
