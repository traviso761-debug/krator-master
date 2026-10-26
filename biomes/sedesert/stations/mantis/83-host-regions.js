// ================================================================= HOST — Mantis's pocket's named regions (registered volumes: the inspector names them)
REGISTER({name:LAKE.name,x:2000,z:zS(2000)-1500,y:LAKE.level-6,r:1200,h:8,lake:true});
REGISTER({name:"The reed shore (the springs freshen the lake's edge)",x:600,z:zS(600)+70,y:LAKE.level-3,r:500,h:10});
SPRINGS.forEach(P=>REGISTER({name:P.name,x:P.x,z:P.z,y:P.level-3,r:P.r*1.1,h:5,spring:true}));
REGISTER({name:"The Socotran monsoon forest (figs, frankincense, sterculia, dragon's blood groves)",x:SPRINGS[0].x,z:SPRINGS[0].z,y:terrainH(SPRINGS[0].x,SPRINGS[0].z)-4,r:700,h:40});
REGISTER({name:'The savanna in the monsoon',x:700,z:1500,y:terrainH(700,1500)-4,r:600,h:16});
REGISTER({name:"Where the pocket ends: the Bowl's desert",x:2500,z:2700,y:terrainH(2500,2700)-4,r:450,h:16});
