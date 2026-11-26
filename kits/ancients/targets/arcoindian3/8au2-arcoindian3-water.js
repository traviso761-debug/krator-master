// ================================================================= ARCOINDIAN III — water records on core/water  [G data]
// Builds WATER.still, WATER.flow and WATER.fall records in world coordinates for both sites (d = 0 intact, d = 1 ruined):
//   - Gorge river sheet (still) + central canyon current (flow) at WSY = 6 m
//   - Twenty-four sunken emerald-mosaic court pools (all 24 filled intact; 14 filled in the ruin, CW0..CW4 dry below breach)
//   - Twin high cliffside artesian spring falls + stepped water-gate outfall cascade
//   - In the ruin: the 238 m Breached West Cascade plunging from CW4 into the gorge river
// [G data]: no three.js, no DOM.
const A3WATER={sites:[]};

A3WATER.addSite=function(d,P,RU,gx,gz){
 const D=ARCO3.DIM,ruin=d>0;
 const drySet=new Set(RU?RU.dryCourts:[]);
 const W2=(x,z)=>[x+gx,z+gz];
 const W3=(x,z,y)=>[x+gx,z+gz,y];
 const site={d:d,gx:gx,gz:gz,still:[],emerald:[],flow:[],fall:[]};

 /* 1. Gorge River (broad canyon water body + central current) */
 const rPoly=[
  W2(-1040,D.RIVER_Z0-6),W2(1040,D.RIVER_Z0-6),
  W2(1040,D.RIVER_Z1+6),W2(-1040,D.RIVER_Z1+6)
 ];
 site.still.push(WATER.still({name:ruin?'The gorge river below the ruin':'The gorge river',level:D.WSY,poly:rPoly}));
 site.flow.push(WATER.flow({
  name:ruin?'The canyon current (east)':'The canyon current',
  pts:[W3(-980,320,D.WSY+0.04),W3(-320,308,D.WSY+0.04),W3(320,316,D.WSY+0.04),W3(980,324,D.WSY+0.04)],
  width:150,speed:1.35
 }));

 /* 2. Emerald-Mosaic Plunge & Reflecting Pools (Reference 3) */
 for(const pl of P.pools){
  if(ruin&&drySet.has(pl.courtId))continue;
  const pad=0.35;
  const poly=[
   W2(pl.x0+pad,pl.z0+pad),W2(pl.x1-pad,pl.z0+pad),
   W2(pl.x1-pad,pl.z1-pad),W2(pl.x0+pad,pl.z1-pad)
  ];
  site.emerald.push(WATER.still({name:pl.name,level:pl.waterY,poly:poly}));
 }

 /* 3. Cliffside Springs & Outfall Cascades */
 for(const sp of P.springs){
  const sx=sp.at[0],sy=sp.at[1],sz=sp.at[2];
  site.fall.push(WATER.fall({
   name:sp.name,
   lip:[W3(sx-3.5,sz,sy),W3(sx+3.5,sz,sy)],
   dir:[0,1],speed:2.8,drop:80,spread:3.2
  }));
 }
 /* Central Water-Gate outfall cascade from Terrace 0 / Quay sluice into the gorge river */
 site.fall.push(WATER.fall({
  name:'The Water Gate outfall',
  lip:[W3(-7,D.QUAY.z1-1,D.QUAY.y1-0.6),W3(7,D.QUAY.z1-1,D.QUAY.y1-0.6)],
  dir:[0,1],speed:2.6,drop:D.QUAY.y1-D.WSY-0.4,spread:3.5
 }));

 /* 4. Ruin: Breached West Spring Wild Cascade */
 if(ruin&&RU&&RU.wildCascade){
  const wc=RU.wildCascade;
  site.fall.push(WATER.fall({
   name:wc.name,
   lip:[W3(wc.lipA[0],wc.lipA[2],wc.lipA[1]),W3(wc.lipB[0],wc.lipB[2],wc.lipB[1])],
   dir:[0,1],speed:3.4,drop:wc.drop,spread:11
  }));
 }

 A3WATER.sites.push(site);
 return site;
};

A3WATER.ground=function(site,wx,wz){
 const lx=wx-site.gx,lz=wz-site.gz;
 return ARCO3.groundY(lx,lz,site.d>0?1:0);
};
