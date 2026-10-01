// Presets for the spaceport target. The sun stands west-south-west, so the shots stand south-west of what
// they look at; the tower falls along bearing ~200 (across
// their line of sight) and the tier-2 collapse (bearings 83-123) faces them.
const IZP_X={worn:-680,intact:-340,rehabilitated:0,ruined:340,toppled:680,reclaimed:1020};
const VIEWS={'All states':[170,620,980,170,0,0]};
for(const k in IZP_X){const x=IZP_X[k],K=k[0].toUpperCase()+k.slice(1);
 VIEWS[K]=[x-190,120,250,x,8,0];
 VIEWS[K+' · close']=[x-128,40,58,x,14,0];}
VIEWS['Intact at night']=[-340-190,120,250,-340,8,0,1];
VIEWS['Rehabilitated at night']=[-190,120,250,0,8,0,1];
VIEWS['Reclaimed at night']=[1020-190,120,250,1020,8,0,1];
VIEWS['Reclaimed · close at night']=[1020-128,40,58,1020,14,0,1];
VIEWS['Toppled tower']=[680-128,32,52,680-70,4,-25];
VIEWS['Ruined freighter']=[340+40,30,170,340+83,6,22];
VIEWS['Intact freighter']=[-340+40,30,170,-340+83,8,22];
VIEWS['Ruined from the north']=[340+120,90,-220,340,10,0];
