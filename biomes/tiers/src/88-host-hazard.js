// ================================================================= HOST — the Tiers' dangers on core/hazard (KHAZ; PLAN.md section 5)
// The Tiers are the placid country the owner asked for: no gas, no vents, no lava, no luck hazard. The risks are the cliffs, the cold up top and the
// floods in the canyons. Two halves (the Great Chasm's, taken as it is):
//   AMBIENT (no record: KHAZ.provide)  the air's pressure by height, 1.6 e^(-h/8000) atm (44v: atmAt), and the temperature: the model's mean at the
//          site carried by the dry adiabat (44v: tmAt), its warm month's half-swing as the season and a day curve on the host's hour. At the lake
//          neither is a danger (1.37 atm, 20 degC); the crown's -35 degC nights and 0.62 atm are the same fields on a higher station.
//   RECORDS (each a core/tags record carrying tags.hazard, registered before anything is drawn round it) from the station's own list,
//          LAND.hazards() -> [{name, kind, x, z, y?, r, h?, danger?, tell?, ...}]: rockfall under the risers (crush), the risers' edges (fall),
//          the lake's drop-off (drown), the step moss's wet tufa (slip).
// Every danger reads before it kills (the tell says what the walker sees). Owed (KNOWN_ISSUES.md): the canyons' flash floods on a cycle (the
// shared gorge-flood amendment, PLAN.md section 10 item 4: stations 2 and 4), the traps of Korona's floor (station 3, read in place).
const HAZ=(function(){if(typeof KHAZ==='undefined')return null;const out={records:0,ambient:[]};
 const hourNow=()=>typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock?KHOST.host.clock.hour:13;
 const swing=(SITE.tw-SITE.tc)*.5;   /* the season's half-swing (28/13 at the lake: 7.5 degC); the page opens on the warm month */
 const tempAt=(x,y,z)=>tmAt(y)+swing+7*Math.sin((hourNow()-9)/24*TAU);
 try{KHAZ.provide('pressure',(x,y,z)=>atmAt(y));KHAZ.provide('temperature',(x,y,z)=>tempAt(x,y,z));out.ambient=KHAZ.provided();}catch(e){reportErr('hazard (ambient): '+e.stack);}
 out.tempAt=tempAt;
 const list=LAND.hazards?LAND.hazards():[];out.list=list;
 list.forEach((H,i)=>{const hz={kind:H.kind};['danger','dose','effect','falloff','shape','tell','nav','cycle'].forEach(k=>{if(H[k]!=null)hz[k]=H[k];});
  try{KHAZ.make(hz);}catch(e){reportErr('hazard '+H.name+': '+e.message);return;}
  BIO.record({name:H.name,key:'hazard.'+H.kind,x:H.x,z:H.z,y:H.y==null?terrainH(H.x,H.z)-2:H.y,r:H.r,h:H.h==null?6:H.h,tags:{hazard:hz}});out.records++;});
 return out;})();
window._hazards=HAZ?{records:HAZ.records,ambient:HAZ.ambient}:null;
