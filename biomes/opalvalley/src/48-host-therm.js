// ================================================================= HOST — the heat (core/terrain 47, KTHERM; PLAN.md section 5, item 2)
// The middle bed's warm silica seeps as KTHERM point vents over its soil (the station's mean), baked once on an 8 m lattice over the ground's square: the
// one temperature field the ground's sinter and mats (84), the chalices (55), the steam (89b), the snow and the hazards read. A station with no vents
// keeps the soil's mean (HEAT_AT, 45). After the kin (47a..) and before the kit (50).
const THERM=SITE.vents&&SITE.vents.length?KTHERM.create({soil:SITE.soil,vents:SITE.vents.map((v,i)=>({id:SKEY+'-seep'+i,kind:'point',x:v.x,z:v.z,T:v.T,reach:v.reach,decay:v.decay==null?2.2:v.decay})),
 detail:{amp:1.5,scale:.02,seed:7400+SITE.zone},world:'opalvalley-'+SKEY}):null;
const THERM_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],THERM_F=THERM?THERM.bake({box:THERM_BOX,cell:8}):null;
if(THERM_F)HEAT_AT=(x,z)=>KTHERM.fieldAt(THERM_F,x,z);
// THE THIN CRUST (PLAN.md section 5, item 2): over each seep, paper-thin opaline sinter on scalding alkaline mud: a heat record and a sink record (core/hazard)
(SITE.vents||[]).forEach((v,i)=>{const r=Math.min(90,v.reach*.6),y=terrainH(v.x,v.z)-4;
 REGISTER({name:'A warm silica seep ('+v.T+' degC under a paper-thin opaline crust)',x:v.x,z:v.z,y,r,h:12,
  tags:{hazard:{kind:'heat',danger:.6,falloff:'linear',shape:{type:'cyl',r:Math.min(26,v.reach*.25),h:4},radiant:{reach:6,dose:.3}}}});
 REGISTER({name:'The thin crust (it breaks: scalding mud under it)',x:v.x,z:v.z,y,r:Math.min(24,v.reach*.22),h:6,tags:{hazard:{kind:'sink',danger:.55}}});});
