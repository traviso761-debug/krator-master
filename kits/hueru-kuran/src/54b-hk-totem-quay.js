// prefix: hk
// ================================================================= HUERU-PIRA NAUTICAL TOTEM COURT & CARVER LOFT (LORE.md §6.25)
// Monumental showcase headland court (seed 8210) raising 5 distinct Hueru-Pira / Kopa-Pira nautical maritime totem poles
// (breaching Filter-Whales, Diving Pouch-Pelicans with wind-swaying emerald-nephrite tide-chimes, Kelp Sea-Otters, Giant
// Kelp-Octopi, Fur-Seals & Reef-Crabs — 100% open horizon-watching eyes) before a whale-rib & red-cypress Totem-Carver's Loft.

/* 22. Hueru-Pira Nautical Totem Court and Carver Loft */
defBuilding({key:'hk_nautical_totem_quay',name:'Hueru-Pira Nautical Totem Court and Carver Loft',seed:8210,cut:true,
 w:20.0,d:16.0,h:10.8,tags:{types:['religious','civic'],wealth:'rich',style:'hueru-kuran',job:'worship',landmark:true},
 build(){
  const py=hkPlinth(18.2,13.2,.54,{stepW:3.4,stepRun:1.0});

  /* Whale-rib & flumed red-cypress Totem-Carver's Loft across the north headland terrace [-6.6..6.6, -5.8..0.4] */
  hkWallRing(-6.6,-5.8,6.6,.4,py,3.25,{mk:'basalt',postMk:'columnar',t:.56,holes:{
   s:[{at:6.6,w:1.70,h:2.20},{at:2.3,w:.96,y:1.05,h:.95},{at:10.9,w:.96,y:1.05,h:.95}],
   n:[{at:3.4,w:.96,y:1.05,h:.95},{at:9.8,w:.96,y:1.05,h:.95}]
  }});
  hkJadeDoor(0,py,.4,0,1.70,2.20,{t:.56,relieving:false});
  hkJadeWindow(-4.3,py+1.05,.4,0,.96,.95,{t:.56});
  hkJadeWindow(4.3,py+1.05,.4,0,.96,.95,{t:.56});
  hkJadeWindow(-3.2,py+1.05,-5.8,PI,.96,.95,{t:.56,seaglass:true});
  hkJadeWindow(3.2,py+1.05,-5.8,PI,.96,.95,{t:.56,seaglass:true});

  /* Maritime pelican-and-whale formline lintel frieze above the nephrite portal */
  hkNauticalFrieze(0,py+2.60,.72,5.2,.58,0,{motif:'pelican',backMk:'cypress'});

  const yR=py+3.49;
  hkTurfRoof(0,yR,-2.7,13.6,6.8,1.95,{mk:'bark',over:.46,kaen:true});
  svNoWalk(()=>{
   /* Proud transverse pelagic whale-ribs clamping the Carver's Loft bark roof */
   for(let i=-2;i<=2;i++){
    const xx=i*2.65;
    tube('whalebone',t=>{
     const zz=lerp(-6.05,.65,t),u=2*t-1,yy=yR+.14+2.06*(1-u*u);
     return [xx,yy,zz];
    },()=>[.072,.105],10,6,P('whalebone'),{caps:true});
   }
   /* Horizontal flumed red-cypress totem log on trestles inside the Carver's Loft (whale & pelican relief in progress!) */
   for(const tx of [-1.75,1.75]){
    box('ashlar',tx,py,-3.55,.42,.18,.68,P('ashlar'));
    box('cypress',tx,py+.18,-3.55,.26,.46,.56,P('cypressD'));
   }
   pole('cypress',[-2.45,py+.92,-3.55],[2.45,py+.92,-3.55],.28,P('cypress'),12);
   /* Sculpted whale-fluke & pelican-beak relief blocks emerging from the horizontal carver's log */
   box('tarwood',-.95,py+1.21,-3.55,.78,.08,.36,P('tarwood'));
   box('ivory',.85,py+1.21,-3.48,.62,.07,.24,P('ivory'));
   box('kaen',.85,py+1.02,-3.24,.48,.14,.08,P('kaen'));
   hkOpenHorizonEye(-.95,py+1.02,-3.25,.24,.18,{irisMk:'nephrite',pupilMk:'seaglass'});
   hkOpenHorizonEye(.42,py+1.02,-3.25,.22,.17,{irisMk:'jade',pupilMk:'seaglass'});
  });

  /* 5 Monumental Hueru-Pira & Kopa-Pira Nautical Maritime Totem Poles across the headland terrace:
     1. West Outer (7.4 m): Reef-Crab -> Sea-Otter -> Pouch-Pelican (chime) -> Filter-Whale
     2. West Inner (8.8 m): Fur-Seal -> Kelp-Octopus -> Filter-Whale -> Pouch-Pelican (chime) -> Breaching Whale
     3. East Inner (9.0 m): Reef-Crab -> Filter-Whale -> Sea-Otter -> Kelp-Octopus -> Spread-Wing Pouch-Pelican (chime)
     4. East Outer (7.2 m): Kelp-Octopus -> Fur-Seal -> Filter-Whale -> Pouch-Pelican (chime)
     5. NW Flank   (6.6 m): Fur-Seal -> Sea-Otter -> Pouch-Pelican (chime) -> Filter-Whale */
  hkNauticalTotemPole(-7.3,py,4.6,.14,{
   h:7.4,tiers:['crab','otter','pelican','whale'],pelicanChime:true
  });
  hkNauticalTotemPole(-3.9,py,3.1,.06,{
   h:8.8,tiers:['seal','octopus','whale','pelican','whale'],pelicanChime:true,wings:'spread'
  });
  hkNauticalTotemPole(3.9,py,3.1,-.06,{
   h:9.0,tiers:['crab','whale','otter','octopus','pelican'],pelicanChime:true,wings:'spread'
  });
  hkNauticalTotemPole(7.3,py,4.6,-.14,{
   h:7.2,tiers:['octopus','seal','whale','pelican'],pelicanChime:true
  });
  hkNauticalTotemPole(-8.0,py,-2.2,.24,{
   h:6.6,tiers:['seal','otter','pelican','whale'],pelicanChime:true
  });
  /* Seaward whale-fluke shrine finial on the NE headland corner */
  hkWhaleFlukeFinial(8.0,py,-2.2,1.45,-.24,{motif:'fluke'});

  hkTarget(0,py,-1.5,'totem carver loft');
  hkTarget(0,py,3.8,'nautical totem court');
  hkFurnList([
   ['hueru_pelican_totem_post',-5.2,py,-4.2,0],
   ['hueru_nautical_crest_chest',4.8,py,-4.4,0],
   ['hueru-kuran_whale_oil_hearth',-4.8,py,-1.3,0],
   ['hueru-kuran_jade_saw_bench',4.6,py,-1.4,-PI/2],
   ['hueru-kuran_nephrite_chime_rack',0,py,-4.9,0],
   ['hueru-kuran_kaen_storage_jar',-2.8,py,-4.9,0,{v:1}],
   ['hueru-kuran_jade_lamp_pedestal',-1.9,py,5.0,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',1.9,py,5.0,0,{setting:'outdoor'}]
  ]);
 }});
