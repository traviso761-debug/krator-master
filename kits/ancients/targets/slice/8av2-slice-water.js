// ================================================================= SLICE — water records on core/water  [G data]
// Builds WATER.still, WATER.flow and WATER.fall records in world coordinates for both sites (d = 0 intact, d = 1 ruined):
//   - Foreground canyon gorge river (still) + central valley current (flow) at WSY = 6 m
//   - Four architectural basins: Sunken Park Reflecting Canal (+27.8 m), Front Amphitheatre Pool (+449.8 m),
//     Hexagonal Skylight Mirror Basin (+463.8 m), and East Rotunda Sanctuary Fountain (+467.8 m)
//   - Sunken Park outfall cascade + Automated Industries cooling sluice fall
//   - In the ruin (d = 1): twin wild cascades from the breached Anthropological Cavern (+268 -> +220 -> +28 m)
// [G data]: no three.js, no DOM.
const SLWATER={sites:[]};

SLWATER.addSite=function(d,P,RU,gx,gz){
 const D=SLICE.DIM,ruin=d>0;
 const W2=(x,z)=>[x+gx,z+gz];
 const W3=(x,z,y)=>[x+gx,z+gz,y];
 const site={d:d,gx:gx,gz:gz,still:[],basins:[],flow:[],fall:[]};

 /* 1. Foreground Canyon Gorge River & Current */
 const rPoly=[
  W2(-1040,D.RIVER_Z0-6),W2(1040,D.RIVER_Z0-6),
  W2(1040,D.RIVER_Z1+6),W2(-1040,D.RIVER_Z1+6)
 ];
 site.still.push(WATER.still({name:ruin?'The gorge river below the ruined slice':'The gorge river',level:D.WSY,poly:rPoly}));
 site.flow.push(WATER.flow({
  name:ruin?'The lower gorge current (east)':'The lower gorge current',
  pts:[W3(-980,355,D.WSY+0.04),W3(-320,342,D.WSY+0.04),W3(320,350,D.WSY+0.04),W3(980,358,D.WSY+0.04)],
  width:150,speed:1.25
 }));

 /* 2. Architectural Reflecting Canals & Skylight Mirror Basins */
 for(const pl of P.pools){
  const pad=0.35;
  const poly=[
   W2(pl.x0+pad,pl.z0+pad),W2(pl.x1-pad,pl.z0+pad),
   W2(pl.x1-pad,pl.z1-pad),W2(pl.x0+pad,pl.z1-pad)
  ];
  site.basins.push(WATER.still({name:pl.name,level:pl.waterY,poly:poly}));
 }

 /* 3. Sunken Park Outfall Cascade & Automated Industries Cooling Sluice */
 for(const sp of P.springs){
  site.fall.push({
   rec:WATER.fall({
    name:sp.name,
    lip:[W3(sp.lipA[0],sp.lipA[2],sp.lipA[1]),W3(sp.lipB[0],sp.lipB[2],sp.lipB[1])],
    dir:[0,1],speed:2.7,drop:sp.drop,spread:3.8
   }),
   plungeY:D.WSY+0.12
  });
 }

 /* 4. Ruin: Breached Anthropological Cavern & West Slot Rim Wild Cascades */
 if(ruin&&RU&&RU.wildCascades){
  for(const wc of RU.wildCascades){
   site.fall.push({
    rec:WATER.fall({
     name:wc.name,
     lip:[W3(wc.lipA[0],wc.lipA[2],wc.lipA[1]),W3(wc.lipB[0],wc.lipB[2],wc.lipB[1])],
     dir:[0,1],speed:3.3,drop:wc.drop,spread:wc.drop>100?10:5.5
    }),
    plungeY:wc.plungeY
   });
  }
 }

 SLWATER.sites.push(site);
 return site;
};

SLWATER.ground=function(site,wx,wz){
 const lx=wx-site.gx,lz=wz-site.gz;
 return SLICE.groundY(lx,lz,site.d>0?1:0);
};
