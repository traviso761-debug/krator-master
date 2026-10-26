// ================================================================= HOST — the steppe's named regions (registered volumes: the inspector names them)
KOPJES.forEach(K=>REGISTER({name:K.name,x:K.x,z:K.z,y:terrainH(K.x+K.r*.7,K.z)-3,r:K.r*.95,h:K.h+20,kopje:true}));
REGISTER({name:PAN.name,x:PAN.x,z:PAN.z,y:terrainH(PAN.x,PAN.z)-2,r:PAN.r,h:8,pan:true});
FAIRY.forEach(F=>REGISTER({name:F.name,x:F.x,z:F.z,y:terrainH(F.x,F.z)-4,r:F.r*.9,h:10,circles:true}));
REGISTER({name:'The pavement (dark varnished pebbles; the old twoleafs)',x:-2050,z:0,y:terrainH(-2050,0)-4,r:500,h:12});
REGISTER({name:CHAN[0].name,x:CHAN[0].pts[120][0],z:CHAN[0].pts[120][1],y:terrainH(CHAN[0].pts[120][0],CHAN[0].pts[120][1])-3,r:220,h:16});
