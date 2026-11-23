// ================================================================= HOST — the chasm's dangers on core/hazard (KHAZ; PLAN.md section 6)
// The chasm kills by heat, air, drop and distance. Two halves:
//   AMBIENT (no record: KHAZ.provide)  the air's pressure by height, 1.6 e^(-h/8000) atm (44v: atmAt), and the temperature: the model's mean
//          at the site carried by the dry adiabat (44v: tmAt), its warm month's half-swing as the season and a day curve on the host's hour
//          (the ground's air at 15:00 is ~7 degC over the mean, at 05:00 ~7 under). VOCAB.ambientKinds ramps them: on the Deep's floor the
//          warm month's afternoon is 50-53 degC (`hot`); on the east rim's horn 0.68 atm and -16 degC (`thin-air`, `cold`).
//   RECORDS (each a core/tags record carrying tags.hazard, registered before anything is drawn round it) from the station's own list,
//          LAND.hazards() -> [{name, kind, x, z, y?, r, h?, danger?, tell?, shape?, ...}]: the Deep's gas hollows (CO2 in a trough with no
//          outlet), the bench lips' and the mesas' falls, rockfall under the walls (crush).
// Every danger reads before it kills (the plan's rule): the tell says what the walker sees. Not here, and owed (KNOWN_ISSUES.md): the gas
// that pools only at night and in still air (a timed `gas`, a shared core amendment: PLAN.md section 8, item 2), the native stalker
// hexapod's lairs (`hunter`: kits/fauna places the animal first).
const HAZ=(function(){if(typeof KHAZ==='undefined')return null;const out={records:0,ambient:[]};
 const hourNow=()=>typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock?KHOST.host.clock.hour:13;
 const swing=(SITE.tw-SITE.tc)*.5;   /* the season's half-swing (46/31 on the Deep: 7.5 degC); the page opens on the warm month */
 const tempAt=(x,y,z)=>tmAt(y)+swing+7*Math.sin((hourNow()-9)/24*TAU);
 try{KHAZ.provide('pressure',(x,y,z)=>atmAt(y));KHAZ.provide('temperature',(x,y,z)=>tempAt(x,y,z));out.ambient=KHAZ.provided();}catch(e){reportErr('hazard (ambient): '+e.stack);}
 out.tempAt=tempAt;
 const list=LAND.hazards?LAND.hazards():[];out.list=list;
 list.forEach((H,i)=>{const hz={kind:H.kind};['danger','dose','effect','effects','falloff','shape','tell','nav','cycle','hunter'].forEach(k=>{if(H[k]!=null)hz[k]=H[k];});
  try{KHAZ.make(hz);}catch(e){reportErr('hazard '+H.name+': '+e.message);return;}
  BIO.record({name:H.name,key:'hazard.'+H.kind,x:H.x,z:H.z,y:H.y==null?terrainH(H.x,H.z)-2:H.y,r:H.r,h:H.h==null?6:H.h,tags:{hazard:hz}});out.records++;});
 return out;})();
window._hazards=HAZ?{records:HAZ.records,ambient:HAZ.ambient}:null;
