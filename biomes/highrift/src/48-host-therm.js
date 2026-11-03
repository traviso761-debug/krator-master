// ================================================================= HOST — the heat (core/terrain 47, KTHERM; PLAN.md sections 3 and 9)
// Every station's vents as KTHERM point vents over its soil (the station's mean), baked once on an 8 m lattice over the ground's square: the one
// temperature field the ground's sinter and mats (84), the rift's life (HRIFT.buildRift), the Hearths' fields (HEARTH.layout), the snow (89b) and the
// hazards all read, so they cannot disagree. After the kin (47a..) and before the kit (50): the stage's FIELD.geo reads HEAT_AT from here.
const THERM=KTHERM.create({soil:SITE.soil,vents:SITE.vents.map((v,i)=>({id:SKEY+'-vent'+i,kind:'point',x:v.x,z:v.z,T:v.T,reach:v.reach,decay:v.decay==null?2.2:v.decay})),
 detail:{amp:1.5,scale:.02,seed:7300+SITE.zone},world:'highrift-'+SKEY});
const THERM_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],THERM_F=THERM.bake({box:THERM_BOX,cell:8});
HEAT_AT=(x,z)=>KTHERM.fieldAt(THERM_F,x,z);
// THE ACID GROUND (station 2's springs, every vent's near ring): acid-sulfate alteration where the vents' steam condenses; 0..1
const ACID_AT=(x,z)=>{let a=0;for(const v of SITE.vents){const d=Math.hypot(x-v.x,z-v.z);a=Math.max(a,smooth(v.reach*1.4,v.reach*.4,d));}
 if(SITE.springs)for(const s of SITE.springs)a=Math.max(a,smooth(s[2]*5,s[2]*1.2,Math.hypot(x-s[0],z-s[1])));return a*(SKEY==='mirror'||SKEY==='gjar'?1:.5);};
// the vents as records with their hazard (core/hazard: KHAZ reads the tags)
/* a vent under water (the Caldron's, the patch's) is its pool's record (89w); a dry vent's volume is its warm ring, where the bead caps and the Hearths stand */
SITE.vents.forEach((v,i)=>{const w=waterH(v.x,v.z);if(w>-1e8&&w>terrainH(v.x,v.z))return;const r=Math.min(140,v.reach*.7);
 REGISTER({name:'A vent ('+v.T+' degC at the vent; the ground over 45 degC scalds)',x:v.x,z:v.z,y:terrainH(v.x,v.z)-6,r,h:30,
 tags:{hazard:{kind:'heat',danger:.6,falloff:'linear',shape:{type:'cyl',r:Math.min(30,v.reach*.2),h:6},radiant:{reach:8,dose:.4}}}});});
