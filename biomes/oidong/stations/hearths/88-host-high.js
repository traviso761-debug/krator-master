// ================================================================= HOST — the Cold Hearths' placement (station 3): the heat, the field, the cold desert round it
// THE HEAT (core/terrain 47, KTHERM): one point vent at the map's centre over the rim's soil (the station's mean, -3 degC), baked once on an 8 m lattice; the
// field (biomes/hearths, read in place: HEARTH.layout) is placed on it in the narrow-fan dress of the Cold Hearths (many fine ribs, short stalks, the dead
// snapped and fallen in rings), and the passes' cold plants (OIDONG.buildHigh) keep off the ground over 8 degC: the heat-eaters' disc is theirs.
const THERM=KTHERM.create({soil:-3,vents:[VENT],detail:{amp:1.5,scale:.02,seed:7121},world:'oidong-hearths'});
const THERM_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],THERM_F=THERM.bake({box:[-400,-400,400,400],cell:4});
const heatAt=(x,z)=>Math.abs(x)<398&&Math.abs(z)<398?KTHERM.fieldAt(THERM_F,x,z):-3;
REGISTER({name:VENT.name+' (fumaroles at '+VENT.T+' degC; the ground over 25 degC is the hearth trees\')',x:VENT.x,z:VENT.z,y:terrainH(VENT.x,VENT.z)-2,r:20,h:8,
 tags:{hazard:{kind:'heat',danger:.6,falloff:'linear',shape:{type:'cyl',r:14,h:6},radiant:{reach:6}}}});
const STATION_BUILD=function(){const q=new URLSearchParams(location.search),Q=q.has('q')?+q.get('q'):1;
 HEARTH.parts('cold');
 BIO.cur='hearths/field';const F=HEARTH.layout({therm:THERM_F,at:[VENT.x,VENT.z],R:240,dress:'cold',seed:KRAND.hash(7120,1186,1591),toward:{az:0,alt:40},
  ground:terrainH,mask:(x,z)=>BIO.mask(x,z),deadRings:[150,230],q:Q});
 BIO.cur='oidong/high';const st=OIDONG.buildHigh(TERR.R-150,Q,{cairns:CAIRNS,walls:WALLS,keep:(x,z)=>heatAt(x,z)<8?1:0});BIO.cur=null;
 OIDONG.COUNTS=OIDONG.SPECIES.map(()=>0);OIDONG.TREES.length=0;OIDONG.STONES.length=0;window._field=F;return Object.assign(st,{field:F.counts});};
