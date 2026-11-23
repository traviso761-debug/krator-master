// prefix: sl
// ================================================================= GREAT CENTRAL CARAVANSERAI FOR SILKHEAD (SL1 + SL2 + SL3 + SL4)
// Silkhead (Spī-Kōr, 1288, 220) is the highland spillway caravan & silk-baling entrepot where Hum silk-wrights, Ria Valley
// mule-trains, Compass Hills bronze-delvers and Outland caravans converge on the Spider Lake - Outland Gate - Ham-Tsek road.
// Unifies all four architectural pillars in one two-storey fortified quadrangle (39.6 x 39.6 m):
//   SL1  Twin notched dolomite Mast-Obelisks flanking the south caravan gatehouse + continuous Ria stone colonnades + radial velaria
//   SL2  Central octagonal raked vermilion/ebony King-Mast Silk-Bourse Pavilion tensioning an amber Lotus-Saddle silk canopy
//   SL3  Four corner open-rafter Hum Spider-Loft Wind-Scoop Towers with evaporative/acoustic silk wind-veils in stone water-troughs
//   SL4  Courtyard trough pergolas, glowing oiled-silk cocoon lanterns, and ceremonial catenary dyed spider-silk bolts

/* 45. Silkhead Great Central Caravanserai */
defBuilding({key:'sl_caravanserai_silkhead',name:'Silkhead Great Central Caravanserai',seed:7209,cut:true,
 w:39.6,d:39.6,h:15.8,front:{x:0,z:18.8,yaw:0},
 tags:{types:['market','inn','civic'],wealth:'rich',style:'spider-lake',role:'caravanserai',job:'trading',landmark:true},
 build(){
  const py=slPlinth(36.0,35.6,.58,{stepW:5.2,stepRun:1.2,topMk:'paving'});
  const h1=3.8,ySlab=py+h1+.22,y2=ySlab+.24,h2=3.2,yR=y2+h2+.22;

  /* ---- 1. FOUR CORNER PAVILIONS (ground vaults & corner stair halls) ---- */
  /* NW Corner: Bonded Golden-Cable Silk Vault */
  slWallRing(-17.0,-16.8,-11.4,-11.2,py,h1,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:2.8,w:1.65,h:2.3}],
   e:[{at:2.8,w:1.65,h:2.3}],
   w:[{at:2.8,w:1.2,y:1.15,h:1.15}]
  }});
  slDoor(-14.2,py,-11.2,0,1.65,2.3,{frameMk:'porphyry',leafMk:'lacquer',ajar:.55,name:'golden-cable vault door'});
  slDoor(-11.4,py,-14.0,PI/2,1.65,2.3,{open:true});
  slWindow(-17.0,py+1.15,-14.0,-PI/2,1.2,1.15);

  /* NE Corner: Lake-Sheen Gossamer Baling Chamber */
  slWallRing(11.4,-16.8,17.0,-11.2,py,h1,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:2.8,w:1.65,h:2.3}],
   w:[{at:2.8,w:1.65,h:2.3}],
   e:[{at:2.8,w:1.2,y:1.15,h:1.15}]
  }});
  slDoor(14.2,py,-11.2,0,1.65,2.3,{frameMk:'porphyry',leafMk:'lacquer',ajar:.55,name:'gossamer baling door'});
  slDoor(11.4,py,-14.0,-PI/2,1.65,2.3,{open:true});
  slWindow(17.0,py+1.15,-14.0,PI/2,1.2,1.15);

  /* SW & SE Corner Stair Pavilions: open north & inner faces so caravan merchants ascend cleanly to the 2nd-floor gallery */
  slWallRing(-17.0,10.8,-11.4,16.4,py,h1,{mk:'dolomite',postMk:'porphyry',skip:'ne',holes:{
   s:[{at:2.8,w:1.2,y:1.15,h:1.15}],
   w:[{at:2.8,w:1.2,y:1.15,h:1.15}]
  }});
  slWindow(-14.2,py+1.15,16.4,0,1.2,1.15);
  slWindow(-17.0,py+1.15,13.6,-PI/2,1.2,1.15);
  const scW=svStairCase({x0:-15.0,x1:-11.8,z0:12.6,z1:14.8},[py,y2],{w:.9,mk:'cedar',col:P('cedar')});

  slWallRing(11.4,10.8,17.0,16.4,py,h1,{mk:'dolomite',postMk:'porphyry',skip:'nw',holes:{
   s:[{at:2.8,w:1.2,y:1.15,h:1.15}],
   e:[{at:2.8,w:1.2,y:1.15,h:1.15}]
  }});
  slWindow(14.2,py+1.15,16.4,0,1.2,1.15);
  slWindow(17.0,py+1.15,13.6,PI/2,1.2,1.15);
  const scE=svStairCase({x0:11.8,x1:15.0,z0:12.6,z1:14.8},[py,y2],{w:.9,start:'+',mk:'cedar',col:P('cedar')});

  /* ---- 2. GROUND PERIMETER WINGS: GATEHOUSE, PACK-STABLES, SILK GODOWNS & FACTOR HALL ---- */
  /* South Wing: Fortified Caravan Gatehouse with operable twin vermilion-lacquered portals & Twin Mast-Obelisks (SL1) */
  slWall(-11.05,16.4,-3.0,16.4,py,h1+.22,{mk:'dolomite',t:.46,holes:[{at:4.0,w:1.35,y:1.1,h:1.25}]});
  slWindow(-7.05,py+1.1,16.4,0,1.35,1.25,{t:.46});
  slWall(3.0,16.4,11.05,16.4,py,h1+.22,{mk:'dolomite',t:.46,holes:[{at:4.0,w:1.35,y:1.1,h:1.25}]});
  slWindow(7.0,py+1.1,16.4,0,1.35,1.25,{t:.46});
  svNoWalk(()=>{
   for(const sx of [-2.82,2.82]){
    box('porphyry',sx,py,16.4,.44,h1+.22,.68,P('porphyry'));
    box('porphyry',sx,py,11.15,.44,h1+.22,.56,P('porphyry'));
   }
   box('porphyry',0,py,16.4,.2,3.26,.58,P('porphyry'));
   box('porphyry',0,py+3.26,16.4,5.2,.44,.64,P('porphyry'));
   box('dolomite',0,py+3.7,16.4,5.2,h1+.22-3.7,.58,P('dolomite'));
   box('carve',0,py+3.36,16.74,3.4,.26,.06,P('carve'));
  });
  slDoor(-1.32,py,16.4,0,2.04,3.06,{t:.46,frameMk:'porphyry',leafMk:'lacquer',name:'west caravan gate'});
  slDoor(1.32,py,16.4,0,2.04,3.06,{t:.46,frameMk:'porphyry',leafMk:'lacquer',name:'east caravan gate'});
  slColonnade(-9.6,11.15,-3.8,11.15,py,h1+.22,{n:3,r:.21});
  slColonnade(3.8,11.15,9.6,11.15,py,h1+.22,{n:3,r:.21});
  const ymGate=slMastObelisk(-4.4,py,17.15,13.6,0,{w:.76});
  slMastObelisk(4.4,py,17.15,13.6,0,{w:.76});
  const yGateSail=py+3.92;
  slVelarium(-4.1,16.9,4.1,19.25,yGateSail,.34,P('silkCrimson'),{stripe:new THREE.Color(P('silkGold')),pleats:6});
  svNoWalk(()=>{
   for(const sx of [-1,1]){
    pole('rope',[sx*4.1,yGateSail,16.9],[sx*4.4,yGateSail+.16,17.15],.016,P('silkGold'),6);
    pole('rope',[sx*4.1,yGateSail,19.25],[sx*4.4,ymGate+.14,17.15],.018,P('silkGold'),6);
   }
  });
  slSilkBolt([-4.05,ymGate-.12,17.15],[4.05,ymGate-.12,17.15],.68,1.15,P('silkGold'));

  /* West Wing: Vaulted Mule & Yak Pack-Bays & Stables opening onto the inner courtyard arcade */
  slWall(-17.0,-10.8,-17.0,10.4,py,h1+.22,{mk:'dolomite',t:.42,holes:[
   {at:4.2,w:1.3,y:1.35,h:1.05},{at:10.6,w:1.3,y:1.35,h:1.05},{at:17.0,w:1.3,y:1.35,h:1.05}
  ]});
  for(const zz of [-6.6,-.2,6.2])slWindow(-17.0,py+1.35,zz,-PI/2,1.3,1.05,{t:.42});
  slColonnade(-11.75,-9.4,-11.75,9.0,py,h1+.22,{n:7,r:.21});
  for(const zz of [-5.4,0,5.0]){
   box('dolomite',-15.1,py,zz,2.8,1.45,.26,P('dolomiteD'));
   svNoWalk(()=>beam('cedar',[-16.5,py+2.65,zz],[-12.2,py+2.65,zz],.14,P('cedarD'),false));
  }

  /* East Wing: Bonded Silk-Bale Godown with operable lacquered doors behind a Ria stone colonnade */
  slWall(17.0,10.4,17.0,-10.8,py,h1+.22,{mk:'dolomite',t:.42,holes:[
   {at:5.2,w:1.25,y:1.35,h:1.05},{at:16.0,w:1.25,y:1.35,h:1.05}
  ]});
  slWindow(17.0,py+1.35,5.2,PI/2,1.25,1.05,{t:.42});
  slWindow(17.0,py+1.35,-5.6,PI/2,1.25,1.05,{t:.42});
  slWall(13.2,-10.8,13.2,10.4,py,h1+.22,{mk:'plaster',holes:[
   {at:5.3,w:1.8,h:2.35},{at:15.9,w:1.8,h:2.35}
  ]});
  slDoor(13.2,py,-5.5,-PI/2,1.8,2.35,{frameMk:'porphyry',leafMk:'lacquer',ajar:.65,name:'north silk godown door'});
  slDoor(13.2,py,5.1,-PI/2,1.8,2.35,{frameMk:'porphyry',leafMk:'lacquer',ajar:.65,name:'south silk godown door'});
  slColonnade(11.75,-9.4,11.75,9.0,py,h1+.22,{n:7,r:.21});

  /* North Wing: Grand Factor Hall, Treaty Registry & Caravan Hearth */
  slWall(11.05,-16.8,-11.05,-16.8,py,h1+.22,{mk:'dolomite',t:.42,holes:[
   {at:5.5,w:1.45,y:1.05,h:1.25},{at:16.6,w:1.45,y:1.05,h:1.25}
  ]});
  slWindow(5.55,py+1.05,-16.8,PI,1.45,1.25,{t:.42});
  slWindow(-5.55,py+1.05,-16.8,PI,1.45,1.25,{t:.42});
  slWall(-11.05,-12.6,11.05,-12.6,py,h1+.22,{mk:'plaster',holes:[
   {at:5.5,w:1.75,h:2.35},{at:11.05,w:2.1,h:2.45},{at:16.6,w:1.75,h:2.35}
  ]});
  slDoor(-5.55,py,-12.6,0,1.75,2.35,{frameMk:'lacquer',leafMk:'cedar',ajar:.5});
  slDoor(0,py,-12.6,0,2.1,2.45,{frameMk:'porphyry',leafMk:'lacquer',ajar:.75,name:'grand factor portal'});
  slDoor(5.55,py,-12.6,0,1.75,2.35,{frameMk:'lacquer',leafMk:'cedar',ajar:.5});
  slColonnade(-9.6,-11.55,9.6,-11.55,py,h1+.22,{n:7,r:.21});

  /* ---- 3. CONTINUOUS SECOND-FLOOR GALLERY DECK (6 disjoint non-overlapping slabs) ---- */
  box('floor',0,ySlab,-14.0,34.2,.24,5.8,P('floor'));
  box('floor',-14.2,ySlab,-.2,5.8,.24,21.8,P('floor'));
  box('floor',14.2,ySlab,-.2,5.8,.24,21.8,P('floor'));
  svWell('floor',-14.2,ySlab,13.6,5.8,.24,5.8,P('floor'),scW.wells[0]);
  box('dolomite',0,ySlab,13.6,22.6,.24,5.8,P('dolomite'));
  svWell('floor',14.2,ySlab,13.6,5.8,.24,5.8,P('floor'),scE.wells[0]);

  /* ---- 4. SECOND-FLOOR RIA COLONNADE GALLERY, HOSTEL CHAMBERS & 4 CORNER SPIDER-LOFT TOWERS (SL1 + SL3) ---- */
  slColonnade(-9.6,-11.55,9.6,-11.55,y2,h2+.22,{n:7,r:.19});
  slColonnade(-11.75,-9.4,-11.75,9.0,y2,h2+.22,{n:7,r:.19});
  slColonnade(11.75,-9.4,11.75,9.0,y2,h2+.22,{n:7,r:.19});
  slColonnade(-9.0,11.15,9.0,11.15,y2,h2+.22,{n:7,r:.19});
  slColonnade(-8.4,15.95,8.4,15.95,y2,h2+.22,{n:7,r:.19});

  /* Carved cedar gallery balustrades (in svNoWalk so viewlines stay light and crisp) */
  svNoWalk(()=>{
   box('lacquer',0,y2+.82,-11.55,18.4,.08,.09,P('lacquer'));
   box('lacquer',-11.75,y2+.82,-.2,.09,.08,17.6,P('lacquer'));
   box('lacquer',11.75,y2+.82,-.2,.09,.08,17.6,P('lacquer'));
   box('lacquer',0,y2+.82,11.15,17.2,.08,.09,P('lacquer'));
   box('lacquer',0,y2+.82,15.95,16.2,.08,.09,P('lacquer'));
  });

  /* North Upper Treaty & Factor Registry Suite */
  slWallRing(-9.8,-16.55,9.8,-13.45,y2,h2,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:9.8,w:1.7,h:2.2},{at:4.2,w:1.2,y:.9,h:1.1},{at:15.4,w:1.2,y:.9,h:1.1}],
   n:[{at:9.8,w:1.5,y:.9,h:1.15}]
  }});
  slDoor(0,y2,-13.45,0,1.7,2.2,{frameMk:'porphyry',leafMk:'lacquer',ajar:.5});
  slWindow(-5.6,y2+.9,-13.45,0,1.2,1.1);
  slWindow(5.6,y2+.9,-13.45,0,1.2,1.1);
  slWindow(0,y2+.9,-16.55,PI,1.5,1.15);
  slHipRoof(0,yR,-15.0,19.6,3.2,1.15,{mk:'celadon',over:.44});

  /* West Upper Caravan Hostel Sleeping Chambers */
  slWallRing(-16.55,-9.6,-13.45,9.2,y2,h2,{mk:'plaster',postMk:'cedar',holes:{
   e:[{at:4.8,w:1.45,h:2.15},{at:14.0,w:1.45,h:2.15}],
   w:[{at:4.8,w:1.2,y:.9,h:1.1},{at:14.0,w:1.2,y:.9,h:1.1}]
  }});
  slDoor(-13.45,y2,4.4,PI/2,1.45,2.15,{frameMk:'lacquer',leafMk:'cedar',ajar:.45});
  slDoor(-13.45,y2,-4.8,PI/2,1.45,2.15,{frameMk:'lacquer',leafMk:'cedar',ajar:.45});
  slWindow(-16.55,y2+.9,-4.8,-PI/2,1.2,1.1);
  slWindow(-16.55,y2+.9,4.4,-PI/2,1.2,1.1);
  slHipRoof(-15.0,yR,-.2,3.2,18.8,1.1,{mk:'celadon',over:.44});

  /* East Upper Silk-Merchants Teahouse & Appraisal Chambers */
  slWallRing(13.45,-9.6,16.55,9.2,y2,h2,{mk:'plaster',postMk:'lacquer',holes:{
   w:[{at:4.8,w:1.55,h:2.15},{at:14.0,w:1.55,h:2.15}],
   e:[{at:4.8,w:1.2,y:.9,h:1.1},{at:14.0,w:1.2,y:.9,h:1.1}]
  }});
  slDoor(13.45,y2,-4.8,-PI/2,1.55,2.15,{frameMk:'porphyry',leafMk:'lacquer',ajar:.6});
  slDoor(13.45,y2,4.4,-PI/2,1.55,2.15,{frameMk:'porphyry',leafMk:'lacquer',ajar:.6});
  slWindow(16.55,y2+.9,4.4,PI/2,1.2,1.1);
  slWindow(16.55,y2+.9,-4.8,PI/2,1.2,1.1);
  slHipRoof(15.0,yR,-.2,3.2,18.8,1.1,{mk:'celadon',over:.44});

  /* South Gatehouse Upper Weigh-Master & Watch Loggia Roof */
  slHipRoof(0,yR,14.55,18.2,3.1,1.15,{mk:'terracotta',over:.44});

  /* Four Corner Colonnade Loggias + Evaporative Silk Wind-Veils in Stone Water-Troughs + Open Hum Spider-Loft Wind-Scoop Towers (SL3) */
  for(const [cx,cz] of [[-14.2,-14.0],[14.2,-14.0],[-14.2,13.6],[14.2,13.6]]){
   for(const sx of [-2.4,2.4])for(const sz of [-2.4,2.4]){
    box('dolomite',cx+sx,y2,cz+sz,.44,.22,.44,P('dolomiteD'));
    cyl('porphyry',cx+sx,y2+.22,cz+sz,.18,h2-.22,P('porphyry'),12,.16,true);
    svNoWalk(()=>box('dolomite',cx+sx,y2+h2,cz+sz,.5,.22,.5,P('dolomite')));
   }
   svNoWalk(()=>box('dolomite',cx,yR,cz,5.8,.18,5.8,P('dolomite')));
   slSpiderLoft(cx,yR+.18,cz,4.2,4.2,2.85,{roofMk:'celadon'});
  }
  slWindVeils(-16.1,-16.55,-12.3,-16.55,y2,y2+2.85);
  slWindVeils(12.3,-16.55,16.1,-16.55,y2,y2+2.85);
  slWindVeils(-16.65,11.6,-16.65,15.4,y2,y2+2.85);
  slWindVeils(16.65,11.6,16.65,15.4,y2,y2+2.85);

  /* ---- 5. CENTRAL CARAVAN EXCHANGE COURT: FOUNTAIN, LOTUS-SADDLE SILK-BOURSE PAVILION, RADIAL VELARIA & STREAMERS (SL1 + SL2 + SL4) ---- */
  svNoWalk(()=>{
   /* Stepped porphyry & mosaic courtyard compass border (non-overlapping strips + central mosaic octagon) */
   box('porphyry',0,py,-7.02,13.6,.025,.36,P('porphyry'));
   box('porphyry',0,py,6.22,13.6,.025,.36,P('porphyry'));
   box('porphyry',-6.62,py,-.4,.36,.025,12.88,P('porphyry'));
   box('porphyry',6.62,py,-.4,.36,.025,12.88,P('porphyry'));
   cyl('mosaic',0,py,-.4,5.2,.025,P('mosaic'),8);

   /* Central Caravan Watering Fountain & Carved Nephrite-Jade Spout */
   cyl('dolomite',0,py+.025,-.4,1.48,.34,P('dolomite'),8);
   ring('porphyry',0,py+.38,-.4,1.42,.08,P('porphyry'),PI/2,0,0,8);
   cyl('water',0,py+.365,-.4,1.3,.035,P('water'),8);
   cyl('porphyry',0,py+.365,-.4,.26,.58,P('porphyry'),8);
   cyl('jade',0,py+.945,-.4,.2,.46,P('jade'),10);
   sph('gold',0,py+1.5,-.4,.13,P('gold'),.85,8);

   /* Auxiliary off-axis raked ebony/vermilion tie-masts completing the octagonal King-Mast Silk-Bourse ring */
   slKingMast([-4.18,py,3.78],[-5.8,8.15,5.4],.15);
   slKingMast([4.18,py,-4.58],[5.8,8.15,-6.2],.15);
  });

  /* SL2: Monumental Raked Vermilion & Ebony King-Mast Golden-Amber Lotus-Saddle Silk-Bourse Canopy */
  slHyparCanopy(0,-.4,5.8,5.8,py,py+4.5,py+11.8,P('silkAmber'),{mastR:.18,sag:.22,amp:.28,bollardY:py});

  /* SL1: Four Radial Pleated Catenary Velarium Sun-Sails spanning the courtyard quadrants + taut dragline guy-ties */
  slVelarium(-11.3,-11.1,-6.3,-6.4,7.85,.38,P('silkSaffron'),{pleats:4});
  slVelarium(6.3,-11.1,11.3,-6.4,7.85,.38,P('silkCrimson'),{pleats:4});
  slVelarium(-11.3,5.8,-6.3,10.6,7.85,.38,P('silkIndigo'),{stripe:new THREE.Color(P('silkGold')),pleats:4});
  slVelarium(6.3,5.8,11.3,10.6,7.85,.38,P('silkIvory'),{pleats:4});
  svNoWalk(()=>{
   for(const [a,b] of [
    [[-11.3,7.85,-11.1],[-11.75,8.05,-11.55]],[[-6.3,7.85,-11.1],[-6.3,8.05,-11.55]],[[-11.3,7.85,-6.4],[-11.75,8.05,-6.4]],[[-6.3,7.85,-6.4],[-5.23,8.45,-5.63]],
    [[11.3,7.85,-11.1],[11.75,8.05,-11.55]],[[6.3,7.85,-11.1],[6.3,8.05,-11.55]],[[11.3,7.85,-6.4],[11.75,8.05,-6.4]],[[6.3,7.85,-6.4],[5.8,8.15,-6.2]],
    [[-11.3,7.85,10.6],[-11.75,8.05,11.15]],[[-6.3,7.85,10.6],[-6.3,8.05,11.15]],[[-11.3,7.85,5.8],[-11.75,8.05,5.8]],[[-6.3,7.85,5.8],[-5.8,8.15,5.4]],
    [[11.3,7.85,10.6],[11.75,8.05,11.15]],[[6.3,7.85,10.6],[6.3,8.05,11.15]],[[11.3,7.85,5.8],[11.75,8.05,5.8]],[[6.3,7.85,5.8],[5.23,8.45,4.83]]
   ])pole('rope',a,b,.015,P('silkGold'),6);
  });

  /* SL4: Cedar Pergola Parasols shading the Caravan Pack-Troughs + Ceremonial Dyed Silk Bolts + Oiled-Silk Cocoon Lanterns */
  slPergola(-10.4,-2.6,-7.2,1.8,py,3.1,{lanterns:true});
  slPergola(7.2,-2.6,10.4,1.8,py,3.1,{lanterns:true});
  slSilkBolt([-9.2,7.95,-11.35],[-3.2,7.95,-11.35],.72,1.35,P('silkCrimson'));
  slSilkBolt([3.2,7.95,-11.35],[9.2,7.95,-11.35],.72,1.35,P('silkSaffron'));
  slSilkBolt([-11.55,7.95,-5.2],[-11.55,7.95,4.4],.72,1.45,P('silkTurquoise'));
  slSilkBolt([11.55,7.95,-5.2],[11.55,7.95,4.4],.72,1.45,P('silkIndigo'));

  for(const [lx,ly,lz,big] of [
   [-3.4,py+3.5,16.9,true],[3.4,py+3.5,16.9,true],
   [-3.8,py+4.3,-3.8,true],[3.8,py+4.3,-3.8,true],[-3.8,py+4.3,3.0,true],[3.8,py+4.3,3.0,true],
   [-6.4,y2+3.1,-11.55,false],[0,y2+3.1,-11.55,true],[6.4,y2+3.1,-11.55,false],
   [-11.75,y2+3.1,-4.8,false],[-11.75,y2+3.1,4.4,false],
   [11.75,y2+3.1,-4.8,false],[11.75,y2+3.1,4.4,false],
   [0,y2+3.1,11.15,true]
  ])slCocoonLantern(lx,ly,lz,.48,big);

  /* ---- 6. WALK-REACH TARGETS & RICH CARAVANSERAI FURNISHING (24 PIECES) ---- */
  slTarget(0,py,13.6,'gatehouse passage');
  slTarget(0,py,4.2,'caravan exchange court');
  slTarget(-2.8,py,-.4,'silk-bourse pavilion');
  slTarget(-13.8,py,2.4,'west caravan stables');
  slTarget(15.0,py,0,'east bonded silk godown');
  slTarget(0,py,-14.6,'north factor hall');
  slTarget(-14.2,py,-14.0,'northwest golden-cable vault');
  slTarget(-12.5,y2,0,'west hostel gallery');
  slTarget(12.5,y2,0,'east teahouse gallery');
  slTarget(0,y2,-12.3,'north treaty gallery');
  slTarget(0,y2,12.4,'south gatehouse loggia');

  slFurnList([
   /* Central Silk-Bourse Pavilion: grand weighing balance, factor table & inspected bales */
   ['spider-lake_bourse_scale',0,py,-2.9,0,{setting:'outdoor'}],
   ['spider-lake_low_table',-2.8,py,-2.2,PI/4,{setting:'outdoor'}],
   ['spider-lake_silk_bales',2.8,py,-2.2,-PI/6,{setting:'outdoor'}],
   ['spider-lake_bolt_chest',2.6,py,1.8,PI,{setting:'outdoor'}],
   /* Courtyard Pack-Lanes & Gate Forecourt: dolomite caravan water-troughs, crates & cocoon stands */
   ['spider-lake_pack_trough',-8.8,py,-.4,PI/2,{setting:'outdoor'}],
   ['spider-lake_pack_trough',8.8,py,-.4,-PI/2,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',-5.2,py,8.6,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',5.2,py,8.6,0,{setting:'outdoor'}],
   ['spider-lake_silk_bales',-8.6,py,7.8,.2,{setting:'outdoor'}],
   ['generic_barrel',8.6,py,7.8,0,{setting:'outdoor'}],
   /* East Bonded Silk-Bale Godown, NW Vault & West Stables */
   ['spider-lake_silk_bales',15.2,py,-7.8,-PI/2],
   ['spider-lake_silk_bales',15.2,py,7.4,-PI/2],
   ['spider-lake_reeling_frame',15.1,py,-2.2,-PI/2],
   ['spider-lake_spindle_rack',15.4,py,2.2,-PI/2],
   ['spider-lake_bolt_chest',-14.2,py,-15.4,0],
   ['generic_fuel',-15.4,py,-2.6,PI/2],
   /* North Factor Hall */
   ['spider-lake_low_table',0,py,-15.0,0],
   ['spider-lake_silk_cushion',0,py,-14.0,PI,{v:0}],
   ['spider-lake_lacquer_screen',-3.6,py,-15.4,.2],
   ['spider-lake_hum_harp',3.6,py,-15.2,-.2],
   /* Second-Floor Hostel Chambers, Teahouse Loggia & Treaty Registry */
   ['spider-lake_sleeping_divan',-15.1,y2,-7.2,PI/2],
   ['spider-lake_sleeping_divan',-15.1,y2,6.8,PI/2],
   ['spider-lake_low_table',15.0,y2,-2.0,-PI/2],
   ['spider-lake_tea_brazier',12.6,y2,2.2,0]
  ]);
 }});
