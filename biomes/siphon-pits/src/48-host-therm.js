// ================================================================= HOST — the heat (PLAN.md sections 3 and 6). Before the kit (50) and the ground (84): they read HEAT_AT
// THE HEAT (core/terrain 47, KTHERM): station 3's vents (the diatreme's geyser and its fumaroles) as point vents over its soil, baked once on an 8 m
// lattice: the one temperature field the felt, the groves, the sinter, the snow and the hazards read. The cold stations have no vent: their soil is their
// record's (SITE.soil), so FIELD.geo is 0 there.
const VENTS=SKEY==='pitfloor'?[{x:SITE.geyser.x,z:SITE.geyser.z,T:SITE.geyser.T,reach:SITE.geyser.reach,decay:2.0}].concat(SITE.fumaroles.map(f=>({x:f[0],z:f[1],T:f[2],reach:f[3],decay:2.3}))):[];
const THERM=VENTS.length?KTHERM.create({soil:SITE.soil,vents:VENTS.map((v,i)=>({id:SKEY+'-vent'+i,kind:'point',x:v.x,z:v.z,T:v.T,reach:v.reach,decay:v.decay})),
 detail:{amp:1.5,scale:.02,seed:9860+SITE.zone},world:'siphon-'+SKEY}):null;
const THERM_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],THERM_F=THERM?THERM.bake({box:THERM_BOX,cell:8}):null;
if(THERM_F)HEAT_AT=(x,z)=>KTHERM.fieldAt(THERM_F,x,z);
// the vents as records with their hazard (core/hazard reads the tags): the warm ring, the scalding core
VENTS.forEach((v,i)=>{const r=Math.min(140,v.reach*.6);REGISTER({name:(i?'A fumarole':'The vent well\'s geyser')+' ('+v.T+' degC at the vent; the ground over 45 degC scalds)',x:v.x,z:v.z,y:terrainH(v.x,v.z)-6,r,h:30,
 tags:{hazard:{kind:'heat',danger:.6,falloff:'linear',shape:{type:'cyl',r:Math.min(30,v.reach*.2),h:6},radiant:{reach:8,dose:.4}}}});});
