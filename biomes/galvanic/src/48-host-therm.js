// ================================================================= HOST — the heat (core/terrain 47, KTHERM; PLAN.md sections 6 and 13)
// The Deep's hot brine (~60 degC, the Atlantis II Deep's) as a KTHERM point vent over the strand's soil (+36 degC, the site's mean), baked once on an 8 m
// lattice: the one temperature field the hazards, the steam and the inspector read. After the kin (47a..) and before the kit (50).
const THERM=KTHERM.create({soil:SITE.soil,vents:SITE.vents.map((v,i)=>({id:SKEY+'-vent'+i,kind:'point',x:v.x,z:v.z,T:v.T,reach:v.reach,decay:v.decay==null?2.2:v.decay})),
 detail:{amp:.8,scale:.02,seed:7400},world:'galvanic-'+SKEY});
const THERM_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],THERM_F=THERM.bake({box:THERM_BOX,cell:8});
HEAT_AT=(x,z)=>KTHERM.fieldAt(THERM_F,x,z);
// THE PLACES AS RECORDS, with their hazards (core/hazard: KHAZ reads the tags)
REGISTER({name:'The Deep (the vent\'s crater: hot metal brine, its floor 100 m under the sea)',x:DP.x,z:DP.z,y:DP.floor-2,r:DP.r,h:SITE.sea-DP.floor+8,
 tags:{hazard:{kind:'heat',danger:.7,falloff:'linear',shape:{type:'cyl',r:DP.r*.95,h:SITE.sea-DP.floor+2}},water:'brine',anoxic:true}});
MOUNDS.forEach(M=>REGISTER({name:'A sulfide mound (a gossan cap over the ore; acid springs at its foot)',x:M.x,z:M.z,y:terrainH(M.x,M.z)-M.h-3,r:M.r*1.1,h:M.h+6,
 tags:{geology:{ore:['pyrite','sphalerite','chalcopyrite'],cap:'gossan'},hazard:{kind:'acid',danger:.3}}}));
STREAMS.forEach(S=>{const m=S.F.point(S.F.L/2);REGISTER({name:S.name+' (acid: pH '+S.pH0.toFixed(1)+' at the spring)',x:m[0],z:m[1],y:SITE.sea-3,r:S.F.L/2,h:8,
 tags:{hazard:{kind:'acid',danger:.5},drink:false,poison:['zinc','copper']}});});
REGISTER({name:'The strand (no drinkable water: zinc and copper)',x:0,z:200,y:SITE.sea-4,r:2400,h:12,tags:{hazard:{kind:'poison',danger:.2},drink:false}});
