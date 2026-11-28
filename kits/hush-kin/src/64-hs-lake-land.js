// prefix: hs
// ================================================================= HUSH-KIN CELLARS, GRANARY SPIRES, HOSPICES & TERRACES (seeds 37309..37315)
// Seven Silent-Vales brewing, tanning, grain-milling, warehousing, guest-hospice, tea-sign & terrace-farming works (PLAN.md §3):
//   37309 hs_birch_brew_cellar     Silver-Birch Sap, Cloudberry & Dark-Vault Fungus Brew Cellar
//   37310 hs_bark_tannery          Birch-Bark & Alum Soft-Sole Leather Currier Yard
//   37311 hs_granary_spire         White-Quartz-Capped Stilted Granite Silo & Silent Watermill (WATER.flow)
//   37312 hs_prism_warehouse       Dressed Granite & Slate Sanctuary Prism & Grain Warehouse
//   37313 hs_wayfarer_hospice      Wayfarer Guest Hostel w/ Engraved Handspeak Primer Tablets for Mute Outsiders
//   37314 hs_tea_sign_pavilion     Colonnaded Open-Sightline Handspeak Tea & Barter Pavilion
//   37315 hs_ribbon_terrace_farm   Contoured Lake-Shore Granite Grain, Berry, Goat-Dairy & Mushroom Croft (WATER.flow)

/* 29. Silver-Birch Sap & Dark-Cellar Mushroom Brew House */
defBuilding({key:'hs_birch_brew_cellar',name:'Silver-Birch Sap and Vaulted Brew Cellar',seed:37309,cut:true,
 w:14.2,d:13.2,h:8.8,budget:95000,
 tags:{types:['industry'],job:'brewing',style:'terrace'},
 note:'thick-walled granite cellar brewing fermented silver-birch sap and alpine gentian tonic beside cool dark-grown alecap mushroom racks',
 build(){
  const G=.4,W0=9.6,D0=7.8,H0=2.88;
  pushM(TF(0,0,-.45));
  hsPlinth(12.2,10.6,G,{stepW:2.6});
  pushM(TF(0,0,-.9));
  hsBox(W0,D0,G,H0,{mk:'granite',socleMk:'slateWall',socle:.44,holes:{
   s:[{x:0,y:0,w:1.34,h:2.16},{x:-2.7,y:.88,w:1.02,h:.94},{x:2.7,y:.88,w:1.02,h:.94}],
   e:[{x:0,y:.88,w:.98,h:.92}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.2,2.08);
  hsWindow(-2.7,G+.88,D0/2-HS.WALL/2,0,.9,.84,{lit:false});
  hsWindow(2.7,G+.88,D0/2-HS.WALL/2,0,.9,.84);
  hsWindow(W0/2-HS.WALL/2,G+.88,0,PI/2,.86,.82);
  hsSlateRoof(W0,D0,G+H0,1.9,{gableMk:'granite'});
  hsFurnList([
   ['generic_barrel',-3.1,G,-2.1,0],
   ['generic_keg',-1.4,G,-2.3,0],
   ['generic_mushrooms',3.0,G,-2.1,-PI/2],
   ['generic_pantry_shelf',3.2,G,1.4,-PI/2],
   ['hush_quartz_brazier_stove',-2.8,G,1.5,PI/2],
   ['hush_tea_sign_table',.4,G,.3,0]
  ]);
  hsTarget(0,G,0,'brew-cellar');
  popM();
  hsSignGallery(0,G,3.7,9.0,1.95,2.55,0,{deck:false,bays:3,openCenter:true});
  popM();
 }});

/* 30. Birch-Bark & Alum Soft-Sole Leather Tannery */
defBuilding({key:'hs_bark_tannery',name:'Birch-Bark Soft-Sole Leather Tannery',seed:37310,cut:true,
 w:14.8,d:13.4,h:8.6,budget:95000,
 tags:{types:['industry'],job:'tanning',style:'terrace'},
 note:'birch-bark and alum currier yard dressing whisper-quiet soft leather boot uppers, bellows and heliograph shutter straps',
 build(){
  const G=.38,W0=8.8,D0=7.4,H0=2.85;
  pushM(TF(0,0,-.45));
  hsPlinth(12.8,10.6,G,{stepW:2.6,stepX:-1.4});
  pushM(TF(-1.5,0,-.85));
  hsBox(W0,D0,G,H0,{mk:'slateWall',socleMk:'granite',socle:.38,holes:{
   s:[{x:0,y:0,w:1.3,h:2.14},{x:-2.3,y:.85,w:1.04,h:.98}],
   w:[{x:0,y:.86,w:1.04,h:.96}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.16,2.06);
  hsWindow(-2.3,G+.85,D0/2-HS.WALL/2,0,.92,.88);
  hsWindow(-W0/2+HS.WALL/2,G+.86,0,-PI/2,.92,.86);
  hsSlateRoof(W0,D0,G+H0,1.82,{gableMk:'granite'});
  hsFurnList([
   ['job_salt_tub',-2.3,G,-1.8,0],
   ['hush_lapidary_grinding_bench',2.0,G,-1.8,0],
   ['generic_barrel',-2.4,G,1.5,PI/2],
   ['generic_crate',2.2,G,1.5,-PI/2],
   ['hush_handspeak_mirror_lamp',0,G,2.1,0]
  ]);
  hsTarget(0,G,0,'currier-shed');
  popM();
  /* East granite steeping vats & stretched hide/felt drying frame */
  svNoWalk(()=>{
   for(const sz of [-1.8,.8]){
    box('granite',4.2,G,sz,2.1,.68,1.8,P('granite'));
    box('birch',4.2,G+.68,sz,1.7,.08,1.4,P('birch'));
   }
  });
  hsSpanPennants(4.2,-3.2,4.2,3.4,G+2.25,{mk:'felt'});
  hsSignGallery(-1.5,G,3.6,8.0,1.85,2.5,0,{deck:false,bays:3,openCenter:true});
  popM();
 }});

/* 31. White-Quartz-Capped Stilted Granite Granary Spire & Silent Watermill (WATER.flow) */
defBuilding({key:'hs_granary_spire',name:'White-Quartz Stilted Granary Spire and Watermill',seed:37311,cut:true,
 w:16.6,d:14.6,h:15.2,budget:125000,
 tags:{types:['infrastructure','industry'],job:'milling',style:'spire'},
 note:'vermin-proof granite-stilted grain tower crowned by a 7-stepped snow-white quartz spire beside a felt-geared silent grain watermill',
 build(){
  const G=.4;
  pushM(TF(0,0,-.45));
  hsPlinth(11.6,11.2,G,{stepW:2.6,stepX:-1.6});
  /* West millhouse */
  pushM(TF(-2.4,0,-.5));
  hsBox(6.8,7.4,G,2.95,{mk:'ashlar',socleMk:'granite',socle:.38,holes:{
   s:[{x:0,y:0,w:1.3,h:2.16}],
   w:[{x:0,y:.86,w:1.04,h:1.0}]
  }});
  hsDoor(0,G,3.7-HS.WALL/2,0,1.16,2.08);
  hsWindow(-3.4+HS.WALL/2,G+.86,0,-PI/2,.92,.9);
  hsSlateRoof(6.8,7.4,G+2.95,1.85,{gableMk:'ashlar'});
  hsFurnList([
   ['job_winnowing_tub',-1.8,G,-1.8,0],
   ['generic_meal_ark',1.8,G,-1.8,0],
   ['generic_sack',-1.9,G,1.5,PI/2],
   ['job_sheaf_rack',1.9,G,1.4,-PI/2],
   ['hush_handspeak_mirror_lamp',0,G,2.1,0]
  ]);
  hsTarget(0,G,0,'mill-floor');
  popM();
  /* Elevated granite-stilt grain silo spire on +x of podium */
  const sx=2.4,sz=-1.2,ySilo=G+1.65;
  svNoWalk(()=>{
   for(const px of [-1.05,1.05])for(const pz of [-1.05,1.05]){
    cyl('granite',sx+px,G,sz+pz,.22,1.5,P('granite'),8);
    /* Overhanging slate rat-baffle discs */
    cyl('slate',sx+px,G+1.35,sz+pz,.46,.12,P('slate'),10);
   }
   box('granite',sx,ySilo-.18,sz,3.1,.18,3.1,P('granite'));
  });
  hsQuartzSpireTower(sx,sz,2.75,ySilo,6.6,{steps:7,heliograph:false});
  /* East granite watermill race + cypress wheel + WATER.flow */
  svNoWalk(()=>{
   for(const rx of [4.4,6.6])box('granite',rx,0,-.2,.36,.68,10.2,P('granite'));
   box('slate',5.5,0,-.2,1.84,.14,10.2,P('slateD'));
   W(5.5,1.38,-.4,PI/2,()=>{
    ring('cypress',0,0,0,1.18,.11,P('cypressD'),PI/2,0,0,12);
    for(let i=0;i<8;i++){
     const a=i*TAU/8;
     box('birch',Math.cos(a)*1.12,Math.sin(a)*1.12,0,.28,.06,.72,P('birch'),0,0,a);
    }
   });
  });
  if(CURREC&&!PLACE_DRY){
   const a=new THREE.Vector3(5.5,0,-4.9).applyMatrix4(CM),b=new THREE.Vector3(5.5,0,4.5).applyMatrix4(CM);
   const m=new THREE.Vector3(5.5,0,-.2).applyMatrix4(CM);
   CURREC.river={name:'granary_millrace',pts:[[a.x,a.z,.26],[m.x,m.z,.24],[b.x,b.z,.22]],width:1.48,speed:1.05};
  }
  hsSignGallery(-2.4,G,4.0,6.4,1.8,2.52,0,{deck:false,bays:2,openCenter:true});
  popM();
 }});

/* 32. Dressed Granite & Slate Prism & Grain Warehouse */
defBuilding({key:'hs_prism_warehouse',name:'Sanctuary Prism and Grain Store-Hall',seed:37312,cut:true,
 w:16.2,d:13.8,h:9.4,budget:110000,
 tags:{types:['infrastructure','shop'],job:'warehousing',style:'gallery'},
 note:'heavy ashlar sanctuary storehouse with twin wide cargo doors and an unobstructed Handspeak tally-gallery',
 build(){
  const G=.44,W0=12.4,D0=7.8,H0=3.25;
  pushM(TF(0,0,-.5));
  hsPlinth(14.2,11.2,G,{stepW:3.2});
  pushM(TF(0,0,-1.05));
  hsBox(W0,D0,G,H0,{mk:'granite',socleMk:'slateWall',socle:.42,holes:{
   s:[{x:-2.8,y:0,w:1.52,h:2.28},{x:2.8,y:0,w:1.52,h:2.28},{x:0,y:.9,w:1.18,h:1.08}],
   e:[{x:0,y:.9,w:1.1,h:1.02}],
   w:[{x:0,y:.9,w:1.1,h:1.02}]
  }});
  hsDoor(-2.8,G,D0/2-HS.WALL/2,0,1.38,2.18);
  hsDoor(2.8,G,D0/2-HS.WALL/2,0,1.38,2.18);
  hsWindow(0,G+.9,D0/2-HS.WALL/2,0,1.04,.98);
  hsWindow(W0/2-HS.WALL/2,G+.9,0,PI/2,.96,.92);
  hsWindow(-W0/2+HS.WALL/2,G+.9,0,-PI/2,.96,.92);
  hsSlateRoof(W0,D0,G+H0,2.15,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_crystal_reliquary_chest',-4.4,G,-2.2,0],
   ['hush_crystal_reliquary_chest',4.4,G,-2.2,0],
   ['job_bales',-2.2,G,-2.1,0],
   ['generic_crate',2.2,G,-2.1,0],
   ['generic_barrel',-4.6,G,1.4,PI/2],
   ['generic_sack',4.6,G,1.4,-PI/2],
   ['hush_primer_tablet_stand',0,G,.8,0]
  ]);
  hsTarget(0,G,0,'warehouse-hall');
  popM();
  hsSignGallery(0,G,3.8,11.8,2.15,2.72,0,{deck:false,bays:4,openCenter:true});
  popM();
 }});

/* 33. Wayfarer Sanctuary Hospice (with Handspeak Primer Tablets for Mute Outsiders!) */
defBuilding({key:'hs_wayfarer_hospice',name:'Wayfarer Sanctuary Hospice and Sign-Primer Inn',seed:37313,cut:true,
 w:17.4,d:15.2,h:13.8,budget:135000,
 tags:{types:['inn','tavern'],job:'trading',style:'spire'},
 note:'warm border-pass guest hostel welcoming bewildered mute outsiders entering The Great Hush with engraved Handspeak primer tablets, radiant stoves and a white-quartz beacon turret',
 build(){
  const G=.44,W0=11.4,D0=8.2,H0=3.25;
  pushM(TF(0,0,-.5));
  hsPlinth(15.2,12.2,G,{stepW:3.0,stepX:-1.2});
  pushM(TF(-1.4,0,-1.05));
  hsBox(W0,D0,G,H0,{mk:'ashlar',socleMk:'granite',socle:.4,holes:{
   s:[{x:0,y:0,w:1.44,h:2.28},{x:-3.3,y:.86,w:1.2,h:1.14},{x:3.3,y:.86,w:1.2,h:1.14}],
   w:[{x:0,y:.86,w:1.14,h:1.08}],
   n:[{x:-2.6,y:.88,w:1.12,h:1.04},{x:2.6,y:.88,w:1.12,h:1.04}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.3,2.18,{pivot:true});
  hsWindow(-3.3,G+.86,D0/2-HS.WALL/2,0,1.06,1.04);
  hsWindow(3.3,G+.86,D0/2-HS.WALL/2,0,1.06,1.04);
  hsWindow(-W0/2+HS.WALL/2,G+.86,0,-PI/2,1.02,.98);
  hsWindow(-2.6,G+.88,-D0/2+HS.WALL/2,PI,1.0,.94);
  hsWindow(2.6,G+.88,-D0/2+HS.WALL/2,PI,1.0,.94);
  hsSlateRoof(W0,D0,G+H0,2.2,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_primer_tablet_stand',0,G,1.9,0],
   ['hush_tea_sign_table',-2.4,G,-.1,0],
   ['hush_tea_sign_table',2.4,G,-.1,0],
   ['hush_quartz_brazier_stove',0,G,-2.4,0],
   ['generic_poor_straw_bed',-4.2,G,-2.1,PI/2],
   ['generic_poor_straw_bed',4.2,G,-2.1,-PI/2],
   ['generic_keg',-4.2,G,1.8,PI/2],
   ['hush_handspeak_mirror_lamp',4.2,G,1.8,-.5]
  ]);
  hsTarget(0,G,0,'hospice-common');
  popM();
  hsQuartzSpireTower(5.3,-1.8,2.45,G,7.4,{steps:6,heliograph:false});
  hsSignGallery(-1.4,G,4.05,11.0,2.25,2.78,0,{deck:false,bays:4,openCenter:true});
  hsHarmonicRack(5.3,G,2.4,2.1,-PI/2,{chimes:4});
  hsPalmMonolith(5.3,G,5.0,2.7,0);
  popM();
 }});

/* 34. Open-Sightline Colonnaded Handspeak Tea & Barter Pavilion */
defBuilding({key:'hs_tea_sign_pavilion',name:'Handspeak Tea and Sightline Barter Pavilion',seed:37314,cut:false,
 w:15.2,d:15.2,h:13.6,budget:115000,
 tags:{types:['tavern','market','shop'],job:'trading',style:'spire'},
 note:'open four-sided colonnaded Handspeak tea and finger-tally barter pavilion under a 6-stepped snow-white quartz heliograph lantern',
 build(){
  const G=.46,W0=10.4,H0=3.2;
  hsPlinth(12.8,12.8,G,{stepW:3.0});
  /* Open 12-column perimeter sightline colonnade */
  svNoWalk(()=>{
   for(const sx of [-4.6,-1.6,1.6,4.6])for(const sz of [-4.6,4.6]){
    box('slate',sx,G,sz,.44,.18,.44,P('slate'));
    cyl('granite',sx,G+.18,sz,.2,H0-.36,P('granite'),10);
    box('quartz',sx,G+H0-.18,sz,.46,.18,.46,P('quartzPure'));
   }
   for(const sx of [-4.6,4.6])for(const sz of [-1.6,1.6]){
    box('slate',sx,G,sz,.44,.18,.44,P('slate'));
    cyl('granite',sx,G+.18,sz,.2,H0-.36,P('granite'),10);
    box('quartz',sx,G+H0-.18,sz,.46,.18,.46,P('quartzPure'));
   }
   for(const sz of [-4.6,4.6])box('cypress',0,G+H0,sz,9.8,.22,.34,P('cypressD'));
   for(const sx of [-4.6,4.6])box('cypress',sx,G+H0,0,.34,.22,9.1,P('cypressD'));
  });
  const yHip=hsHipSlateRoof(9.8,9.8,G+H0+.22,2.0);
  hsQuartzPyramid(0,0,3.0,yHip,3.2,6,{heliograph:true});
  hsDoor(0,G,4.6,0,1.42,2.24,{pivot:true,t:.34});
  hsHandLamp(-3.1,G+HS.HAND_LAMP_Y,4.78,0,{mountH:HS.HAND_LAMP_Y});
  hsHandLamp(3.1,G+HS.HAND_LAMP_Y,4.78,0,{mountH:HS.HAND_LAMP_Y});
  hsHarmonicRack(-4.6,G,0,2.2,PI/2,{chimes:4});
  hsFurnList([
   ['hush_tea_sign_table',-2.0,G,-1.6,0],
   ['hush_tea_sign_table',2.0,G,-1.6,0],
   ['hush_tea_sign_table',0,G,1.6,0],
   ['hush_quartz_brazier_stove',0,G,-3.2,0],
   ['hush_primer_tablet_stand',3.2,G,2.2,-.6],
   ['generic_tea_set',-2.0,G,2.2,.5]
  ]);
  hsTarget(0,G,0,'tea-pavilion');
 }});

/* 35. Contoured Ribbon-Lake Terrace Farm & Goat-Dairy Croft (WATER.flow) */
defBuilding({key:'hs_ribbon_terrace_farm',name:'Ribbon-Lake Granite Terrace Farm and Dairy Croft',seed:37315,cut:true,
 w:18.2,d:15.4,h:8.4,budget:110000,
 tags:{types:['farm'],job:'farming',style:'terrace'},
 note:'contoured dry-stone granite lakeside barley, sea-buckthorn berry, mountain-goat cheese and dark-vault mushroom croft irrigated by a silent stone rill',
 build(){
  const G=.36;
  pushM(TF(-2.8,0,-.4));
  hsPlinth(10.8,11.2,G,{stepW:2.5});
  pushM(TF(0,0,-.8));
  hsBox(8.4,7.4,G,2.78,{mk:'granite',socleMk:'slateWall',socle:.36,holes:{
   s:[{x:0,y:0,w:1.28,h:2.12},{x:-2.3,y:.84,w:1.02,h:.96}],
   w:[{x:0,y:.85,w:1.0,h:.94}]
  }});
  hsDoor(0,G,3.7-HS.WALL/2,0,1.14,2.04);
  hsWindow(-2.3,G+.84,3.7-HS.WALL/2,0,.9,.86);
  hsWindow(-4.2+HS.WALL/2,G+.85,0,-PI/2,.88,.84);
  hsSlateRoof(8.4,7.4,G+2.78,1.76,{gableMk:'granite'});
  hsFurnList([
   ['generic_churn',-2.4,G,-1.8,0],
   ['generic_cheese',-2.4,G,1.2,PI/2],
   ['generic_mushrooms',2.4,G,-1.8,-PI/2],
   ['job_winnowing_mat',0,G,0,0],
   ['generic_veg_basket',2.3,G,1.4,0]
  ]);
  hsTarget(0,G,0,'dairy-croft');
  popM();
  hsSignGallery(0,G,3.8,8.0,1.8,2.48,0,{deck:false,bays:3,openCenter:true});
  popM();
  /* East stepped dry-stone granite crop terraces + silent lakeside irrigation rill (WATER.flow) */
  svNoWalk(()=>{
   for(let t=0;t<3;t++){
    const tx=4.4,tz=-3.4+t*3.2,yh=.28+(2-t)*.24;
    box('granite',tx,0,tz,4.6,yh,2.7,P('granite'));
    box('turf',tx,yh,tz,4.2,.1,2.3,P('turf'));
    for(let r=-1;r<=1;r++)box('earth',tx+r*1.2,yh+.1,tz,.55,.08,1.9,P('earth'));
   }
   for(const rx of [7.1,8.3])box('slateWall',rx,0,-.2,.26,.44,10.8,P('slateWall'));
   box('slate',7.7,0,-.2,.94,.1,10.8,P('slateD'));
  });
  if(CURREC&&!PLACE_DRY){
   const a=new THREE.Vector3(7.7,0,-5.2).applyMatrix4(CM),b=new THREE.Vector3(7.7,0,4.8).applyMatrix4(CM);
   const m=new THREE.Vector3(7.7,0,-.2).applyMatrix4(CM);
   CURREC.river={name:'terrace_irrigation_rill',pts:[[a.x,a.z,.2],[m.x,m.z,.18],[b.x,b.z,.16]],width:.88,speed:.85};
  }
  wkPad(4.4,3.0,4.2,2.4,.28);
  hsFurnList([
   ['job_sheaf_rack',4.4,.38,3.2,0]
  ]);
  hsTarget(4.4,.28,3.0,'crop-terrace');
 }});
