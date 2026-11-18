// ================================================================= HOST — thermal field and hazard volumes (core/terrain 47, KTHERM; [G data])
// Bakes the fumarole and breached-throat heat field over the graben's +26 degC ambient soil on a 6 m lattice, and registers
// the station's geological hazard volumes for KHAZ and the inspector. Pure data: no THREE, no geometry, no DOM.
const THERM=KTHERM.create({
 soil:SITE.soil,
 vents:SITE.vents.map(v=>({id:SKEY+'-'+v.id,kind:'point',x:v.x,z:v.z,T:v.T,reach:v.reach,decay:v.decay==null?2.0:v.decay})),
 detail:{amp:1.4,scale:.025,seed:5112},
 world:'rheolith-'+SKEY
});
const THERM_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],THERM_F=THERM.bake({box:THERM_BOX,cell:6});
HEAT_AT=(x,z)=>KTHERM.fieldAt(THERM_F,x,z);

REGISTER({
 name:'The Breached Throat (180-545 degC dry-acid conduit; live rheolith guilds on inner walls)',
 x:PIT.x,z:PIT.z,y:PIT.floor-2,r:PIT.r,h:PIT.rim-PIT.floor+8,
 tags:{hazard:{kind:'heat',danger:.95,falloff:'linear',shape:{type:'cyl',r:PIT.r*.95,h:PIT.rim-PIT.floor+6},tell:'shimmering acid vapour, metallic ticking, blackbody glow below'}}
});
SITE.vents.slice(1).forEach(v=>{
 const y0=terrainH(v.x,v.z);
 REGISTER({
  name:v.name+' ('+v.T+' degC fumarole)',
  x:v.x,z:v.z,y:y0-4,r:10,h:9,
  tags:{hazard:{kind:v.graze>.5?'acid':'heat',danger:.65,tell:v.graze>.5?'hissing white SiF4 silica frost':'hexagonal sinter collar and hot SO2/HF plume'}}
 });
});
SITE.springs.forEach(s=>{
 const y0=terrainH(s.x,s.z);
 REGISTER({
  name:s.name,x:s.x,z:s.z,y:y0-2,r:s.r*1.2,h:5,ground:true,
  tags:{hazard:{kind:'acid',danger:.72},drink:false}
 });
});
REGISTER({
 name:'Blistered Pahoehoe Sill Bench (buoyed by foam-reef vesicles)',
 x:BENCH.x,z:BENCH.z,y:terrainH(BENCH.x,BENCH.z)-3,r:Math.max(BENCH.rx,BENCH.rz)*.85,h:7,
 tags:{geology:{crust:'pahoehoe',ageDays:BENCH.ageDays,reefCover:BENCH.reefCover}}
});
