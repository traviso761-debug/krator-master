// ================================================================= HOST — the Bowl's named regions (registered volumes: the inspector names them)
REGISTER({name:LAKE.name,x:0,z:-2400,y:LAKE.level-6,r:1500,h:8,lake:true});
REGISTER({name:'The ochre salt rim: crust ridges in the shallows',x:-900,z:zS(-900)-450,y:LAKE.level-2,r:420,h:4});
REGISTER({name:'The salt flat (white polygonal crust)',x:-1500,z:zS(-1500)+600,y:LAKE.level-2,r:650,h:8});
REGISTER({name:'The Bowl river 2\'s delta',x:DELTA.apex[0],z:(DELTA.apex[1]+zS(DELTA.apex[0]))/2,y:LAKE.level-3,r:900,h:12,delta:true});
REGISTER({name:'The halophyte belt (saxaul, saltbush, tamarisk, brine lamps)',x:-200,z:zS(-200)+1750,y:terrainH(-200,zS(-200)+1750)-4,r:900,h:14});
REGISTER({name:'The kaluts: yardangs in the old lake silt, along the wind',x:-2100,z:900,y:terrainH(-2100,900)-6,r:900,h:50,yardangs:true});
REGISTER({name:'The dunes downwind of the flat',x:1900,z:2300,y:terrainH(1900,2300)-6,r:800,h:24,dunes:true});

