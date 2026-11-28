// prefix: hs
// ================================================================= HUSH-KIN SANCTUARIES, HELIOGRAPHS, MOOT & BORDER WATCHES (seeds 37101..37203)
// Ten civic, acoustic-harmonic, funerary and aggression-zero border-watch buildings (PLAN.md §3):
//   37101 hs_handspeak_moot       Circular Stepped Handspeak Council Amphitheatre & White-Quartz Speaker Spire
//   37102 hs_heliograph_beacon    Tall 21 m Snow-White Quartz Optical Heliograph & Rotating Prism-Shutter Tower
//   37103 hs_bianzhong_belfry     Sinusoidal 440/660 Hz Bianzhong & Emerald-Nephrite Lithophone Sanctuary Belfry
//   37104 hs_hush_pylon_shrine    Tended Pre-Cataclysm Acoustic Hush-Pylon, Reflection Pool & White-Quartz Cloister
//   37105 hs_sign_academy         Handspeak Visual Chronicle & Gesture-Scroll School
//   37106 hs_quiet_infirmary      Herbal, Thermal-Stone Pool & 440 Hz Tuning-Fork Sanctuary Healer
//   37107 hs_quartz_ossuary       Stepped Snow-White Quartz Lantern Columbaria & Open-Palm Memorial Court
//   37201 hs_palm_gate            Open-Palm Monolith Pass Gate watching rare southern Timpar-Kuran trails
//   37202 hs_mist_watch_spire     Slender 5.4:1 Granite & White-Quartz Border Watchtower w/ 440 Hz Alarm Bell
//   37203 hs_sanctuary_wall       Dressed Granite & Blue-Slate Sightline Curtain Wall w/ Walkable Parapet

/* 11. Circular Stepped Handspeak Council Amphitheatre */
defBuilding({key:'hs_handspeak_moot',name:'Stepped Handspeak Council Moot-Amphitheatre',seed:37101,cut:false,
 w:19.6,d:19.6,h:15.2,budget:150000,
 tags:{types:['civic','plaza'],style:'gallery',landmark:true},
 note:'circular stepped granite-and-slate Handspeak council amphitheatre where every citizen tier holds an unobstructed sightline to the central speaker dais and white-quartz spire',
 build(){
  const G=.38;
  hsPlinth(17.2,17.2,G,{stepW:3.6});
  const yTierTop=hsSteppedAmphitheatre(0,-.6,6.8,3.6,G,4,{stepH:.28});
  /* North backdrop snow-white quartz council spire + flanking harmonic chime frames */
  hsQuartzSpireTower(0,-6.4,2.65,G,8.2,{steps:7,heliograph:false,doorYaw:0,targetName:'moot-spire'});
  hsHarmonicRack(-4.6,G,-5.6,2.5,.35,{chimes:5});
  hsHarmonicRack(4.6,G,-5.6,2.5,-.35,{chimes:5});
  /* South open colonnaded entry portico with pivot sanctuary gate & open-palm monoliths */
  hsSignGallery(0,G,6.6,9.4,2.1,2.85,0,{deck:false,bays:3,openCenter:true});
  hsDoor(0,G,7.55,0,1.42,2.28,{pivot:true,t:.34});
  hsPalmMonolith(-5.8,G,6.8,2.85,0);
  hsPalmMonolith(5.8,G,6.8,2.85,0);
  hsFurnList([
   ['hush_primer_tablet_stand',0,G,-.6,0],
   ['hush_handspeak_mirror_lamp',-2.4,G,-.6,PI/3],
   ['hush_handspeak_mirror_lamp',2.4,G,-.6,-PI/3],
   ['hush_heliograph_tripod',0,yTierTop,-4.2,0]
  ]);
  hsTarget(0,G,-.6,'speaker-dais');
  hsTarget(-6.35,yTierTop,-.6,'upper-council-tier');
 }});

/* 12. Tall 21 m Snow-White Quartz Optical Heliograph Beacon */
defBuilding({key:'hs_heliograph_beacon',name:'Snow-White Quartz Optical Heliograph Beacon',seed:37102,cut:true,
 w:14.2,d:14.8,h:21.8,budget:140000,
 tags:{types:['infrastructure','civic'],style:'spire',landmark:true},
 note:'21 m battered pale-granite and blue-slate optical beacon crowned with a shuttered rock-crystal prism cupola and 9-stepped snow-white quartz spire for shore-to-shore mist signalling',
 build(){
  const G=.48;
  pushM(TF(0,0,-.5));
  hsPlinth(11.6,11.6,G,{stepW:2.8});
  /* Keeper's granite optic-room base */
  pushM(TF(-1.8,0,1.2));
  hsBox(6.8,6.6,G,3.0,{mk:'granite',socle:.4,holes:{
   s:[{x:0,y:0,w:1.34,h:2.22}],
   w:[{x:0,y:.86,w:1.06,h:1.06}],
   n:[{x:0,y:.88,w:1.06,h:1.02}]
  }});
  hsDoor(0,G,3.3-HS.WALL/2,0,1.2,2.14,{pivot:true});
  hsWindow(-3.4+HS.WALL/2,G+.86,0,-PI/2,.94,.96);
  hsWindow(0,G+.88,-3.3+HS.WALL/2,PI,.94,.92);
  hsSlateRoof(6.8,6.6,G+3.0,1.78,{gableMk:'granite'});
  hsFurnList([
   ['hush_heliograph_tripod',-1.6,G,-1.2,0],
   ['hush_quartz_brazier_stove',1.8,G,-1.6,0],
   ['hush_scroll_chronicle_rack',-2.1,G,1.2,PI/2],
   ['hush_crystal_reliquary_chest',1.8,G,1.4,-PI/2],
   ['generic_lamp_oil',0,G,-2.1,0]
  ]);
  hsTarget(0,G,0,'keeper-room');
  popM();
  /* Monumental 21 m (shaft 13.6 m + cupola + 9-step snow-white quartz pyramid + tuning-fork finial = ~20.9 m) heliograph spire! */
  hsQuartzSpireTower(2.5,-1.6,3.25,G,13.4,{steps:9,roofRise:3.9,cupolaH:1.85,heliograph:true,doorYaw:0,targetName:'beacon-shaft'});
  hsSignGallery(-1.8,G,4.9,6.6,1.8,2.55,0,{deck:false,bays:2,openCenter:true});
  hsPalmMonolith(3.4,G,3.8,2.9,0);
  hsSignBanner(-4.8,G,4.6,0,3.6,{mk:'flag'});
  popM();
 }});

/* 13. Sinusoidal 440/660 Hz Bianzhong & Nephrite Lithophone Belfry */
defBuilding({key:'hs_bianzhong_belfry',name:'Sinusoidal Bianzhong and Nephrite Lithophone Belfry',seed:37103,cut:false,
 w:15.4,d:15.4,h:15.8,budget:135000,
 tags:{types:['religious','civic'],job:'worship',style:'spire',landmark:true},
 note:'open four-arch pale-ashlar harmonic sanctuary belfry under an 8-stepped snow-white quartz spire, ringing pure 440 and 660 Hz bianzhong bells and nephrite qing chimes undamped through The Great Hush',
 build(){
  const G=.52,W0=9.6,H0=4.2;
  hsPlinth(12.8,12.8,G,{stepW:3.0});
  /* Four massive corner granite piers framing open acoustic-sightline arches */
  svNoWalk(()=>{
   for(const sx of [-3.6,3.6])for(const sz of [-3.6,3.6]){
    box('granite',sx,G,sz,1.5,H0,1.5,P('granite'));
    box('quartz',sx,G+H0,sz,1.66,.22,1.66,P('quartzPure'));
   }
   for(const sz of [-3.6,3.6])box('ashlar',0,G+H0-.65,sz,8.7,.65,1.2,P('ashlar'));
   for(const sx of [-3.6,3.6])box('ashlar',sx,G+H0-.65,0,1.2,.65,5.7,P('ashlar'));
  });
  const yHip=hsHipSlateRoof(8.8,8.8,G+H0,2.15);
  hsQuartzPyramid(0,0,4.2,yHip,4.6,8,{heliograph:true});
  /* Operable balanced sanctuary pivot gate on +z threshold + 3 grand harmonic racks inside */
  hsDoor(0,G,4.25,0,1.48,2.36,{pivot:true,t:.36});
  hsHarmonicRack(0,G,-1.8,3.6,0,{chimes:7,h:2.85});
  hsHarmonicRack(-2.4,G,.6,2.6,PI/2,{chimes:5,h:2.55});
  hsHarmonicRack(2.4,G,.6,2.6,-PI/2,{chimes:5,h:2.55});
  hsHandLamp(-3.6,G+HS.HAND_LAMP_Y,4.45,0,{mountH:HS.HAND_LAMP_Y});
  hsHandLamp(3.6,G+HS.HAND_LAMP_Y,4.45,0,{mountH:HS.HAND_LAMP_Y});
  hsPalmMonolith(-5.1,G,4.8,2.75,0);
  hsPalmMonolith(5.1,G,4.8,2.75,0);
  hsFurnList([
   ['hush_bianzhong_bell_rack',0,G,1.4,0],
   ['hush_open_palm_stele',0,G,-3.4,0]
  ]);
  hsTarget(0,G,0,'belfry-sanctum');
 }});

/* 14. Tended Pre-Cataclysm Acoustic Hush-Pylon Shrine */
defBuilding({key:'hs_hush_pylon_shrine',name:'Pre-Cataclysm Acoustic Hush-Pylon Sanctuary',seed:37104,cut:false,
 w:18.6,d:18.8,h:16.2,budget:145000,
 tags:{types:['religious'],job:'worship',style:'spire',landmark:true},
 note:'reverently tended intact Ancient fluted white-alloy Acoustic Hush-Pylon rising from a mirror-calm reflection pool inside a snow-white quartz and granite sanctuary court',
 build(){
  const G=.4;
  hsPlinth(16.2,16.2,G,{stepW:3.2});
  /* Mirror-calm central reflection pool kerb (non-overlapping granite walls) + WATER.still surface */
  const pw=6.8,pd=6.8,kt=.38;
  svNoWalk(()=>{
   box('slate',0,G-.28,-.8,pw,0.12,pd,P('slateD'));
   box('granite',0,G,-.8+pd/2-kt/2,pw,.36,kt,P('granite'));
   box('granite',0,G,-.8-pd/2+kt/2,pw,.36,kt,P('granite'));
   for(const sx of [-1,1])box('granite',sx*(pw/2-kt/2),G,-.8,kt,.36,pd-2*kt,P('granite'));
  });
  if(CURREC&&!PLACE_DRY){
   const c=new THREE.Vector3(0,0,-.8).applyMatrix4(CM),hw=pw*.5-.4,hd=pd*.5-.4;
   (CURREC.stills||(CURREC.stills=[])).push({
    name:'hush_pylon_pool',level:G+.24,
    bounds:[c.x-hw,c.z-hd,c.x+hw,c.z+hd],
    poly:[[c.x-hw,c.z-hd],[c.x+hw,c.z-hd],[c.x+hw,c.z+hd],[c.x-hw,c.z+hd]],
    color:0x1b4f62,roughness:.03
   });
  }
  /* Central intact Ancient Acoustic Hush-Pylon obelisk */
  hsHushPylon(0,G,-.8,13.6);
  /* Rear & flanking white-quartz votive turrets + front Handspeak cloister gate */
  for(const sx of [-6.2,6.2]){
   hsQuartzPyramid(sx,-5.8,2.1,G+2.6,2.8,6,{heliograph:false});
   svNoWalk(()=>box('ashlar',sx,G,-5.8,2.0,2.6,2.0,P('ashlar')));
  }
  hsSignGallery(0,G,6.2,11.6,2.0,2.78,0,{deck:false,bays:4,openCenter:true});
  hsDoor(0,G,7.1,0,1.44,2.3,{pivot:true,t:.34});
  hsHarmonicRack(-5.6,G,1.2,2.2,PI/2,{chimes:4});
  hsHarmonicRack(5.6,G,1.2,2.2,-PI/2,{chimes:4});
  hsPalmMonolith(-4.8,G,6.8,2.85,0);
  hsPalmMonolith(4.8,G,6.8,2.85,0);
  hsFurnList([
   ['hush_open_palm_stele',-5.6,G,-2.6,PI/2],
   ['hush_open_palm_stele',5.6,G,-2.6,-PI/2],
   ['hush_nephrite_lithophone',0,G,4.2,0]
  ]);
  hsTarget(0,G,4.6,'pylon-cloister');
  hsTarget(-5.2,G,-.8,'west-ambulatory');
 }});

/* 15. Handspeak Visual Chronicle & Gesture-Scroll Academy */
defBuilding({key:'hs_sign_academy',name:'Handspeak Visual Chronicle Academy',seed:37105,cut:true,
 w:16.4,d:14.6,h:12.4,budget:125000,
 tags:{types:['civic'],job:'scribing',style:'gallery'},
 note:'sunlit Handspeak grammar, gesture-diagram scroll and harmonic acoustics school built around a wide colonnaded teaching gallery',
 build(){
  const G=.44,W0=12.6,D0=7.8,H0=3.35;
  pushM(TF(0,0,-.55));
  hsPlinth(14.4,11.8,G,{stepW:3.0});
  pushM(TF(0,0,-1.25));
  hsBox(W0,D0,G,H0,{mk:'ashlar',socleMk:'granite',socle:.4,holes:{
   s:[{x:0,y:0,w:1.44,h:2.3},{x:-3.8,y:.82,w:1.36,h:1.28},{x:3.8,y:.82,w:1.36,h:1.28}],
   e:[{x:0,y:.86,w:1.24,h:1.18}],
   w:[{x:0,y:.86,w:1.24,h:1.18}],
   n:[{x:-3.0,y:.88,w:1.2,h:1.14},{x:3.0,y:.88,w:1.2,h:1.14}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.3,2.2);
  hsWindow(-3.8,G+.82,D0/2-HS.WALL/2,0,1.22,1.16);
  hsWindow(3.8,G+.82,D0/2-HS.WALL/2,0,1.22,1.16);
  hsWindow(W0/2-HS.WALL/2,G+.86,0,PI/2,1.1,1.08);
  hsWindow(-W0/2+HS.WALL/2,G+.86,0,-PI/2,1.1,1.08);
  hsWindow(-3.0,G+.88,-D0/2+HS.WALL/2,PI,1.06,1.04);
  hsWindow(3.0,G+.88,-D0/2+HS.WALL/2,PI,1.06,1.04);
  const yR=hsHipSlateRoof(W0,D0,G+H0,2.1);
  hsQuartzPyramid(0,0,2.8,yR,3.2,6,{heliograph:false});
  hsFurnList([
   ['hush_primer_tablet_stand',0,G,-2.2,0],
   ['hush_primer_tablet_stand',-2.8,G,.6,PI],
   ['hush_primer_tablet_stand',2.8,G,.6,PI],
   ['hush_scroll_chronicle_rack',-4.8,G,-1.8,PI/2],
   ['hush_scroll_chronicle_rack',4.8,G,-1.8,-PI/2],
   ['hush_nephrite_lithophone',0,G,2.1,0],
   ['generic_writing_supplies',-2.8,G,-2.4,0]
  ]);
  hsTarget(0,G,0,'lecture-hall');
  popM();
  hsSignGallery(0,G,3.85,12.2,2.3,2.82,0,{deck:false,bays:4,openCenter:true});
  hsTarget(0,G,3.7,'teaching-loggia');
  popM();
 }});

/* 16. Quiet Herbal & Thermal-Stone Sanctuary Infirmary */
defBuilding({key:'hs_quiet_infirmary',name:'Thermal-Stone and Harmonic Sanctuary Infirmary',seed:37106,cut:true,
 w:16.2,d:14.4,h:10.8,budget:120000,
 tags:{types:['civic'],job:'healing',style:'gallery'},
 note:'crystal-lit sanctuary infirmary pairing herbal wards and 440 Hz tuning-fork vibration therapy with a warm granite thermal soaking pool',
 build(){
  const G=.42,W0=8.8,D0=8.2,H0=3.15;
  pushM(TF(0,0,-.5));
  hsPlinth(14.2,11.2,G,{stepW:2.8,stepX:-2.0});
  pushM(TF(-2.2,0,-.7));
  hsBox(W0,D0,G,H0,{mk:'ashlar',socleMk:'granite',socle:.38,holes:{
   s:[{x:0,y:0,w:1.36,h:2.22},{x:-2.5,y:.84,w:1.14,h:1.12}],
   e:[{x:0,y:0,w:1.2,h:2.1}],
   w:[{x:0,y:.86,w:1.14,h:1.1}],
   n:[{x:0,y:.88,w:1.14,h:1.06}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.22,2.12);
  hsDoor(W0/2-HS.WALL/2,G,0,PI/2,1.08,2.0);
  hsWindow(-2.5,G+.84,D0/2-HS.WALL/2,0,1.02,1.02);
  hsWindow(-W0/2+HS.WALL/2,G+.86,0,-PI/2,1.02,1.0);
  hsWindow(0,G+.88,-D0/2+HS.WALL/2,PI,1.02,.96);
  hsSlateRoof(W0,D0,G+H0,2.05,{gableMk:'ashlar'});
  hsFurnList([
   ['generic_poor_straw_bed',-2.6,G,-2.1,PI/2],
   ['generic_poor_straw_bed',-2.6,G,.8,PI/2],
   ['hush_quartz_brazier_stove',2.2,G,-2.3,0],
   ['generic_medicine',2.4,G,1.8,-PI/2],
   ['generic_herb_bundles',0,G,-2.8,0],
   ['hush_handspeak_mirror_lamp',0,G,2.2,0]
  ]);
  hsTarget(0,G,0,'infirmary-ward');
  popM();
  /* East warm thermal soaking basin (WATER.still) + harmonic therapy rack */
  const bx=4.4,bz=-.6,bw=3.8,bd=5.2,kt=.32;
  svNoWalk(()=>{
   box('slate',bx,G-.24,bz,bw,.12,bd,P('slateD'));
   box('granite',bx,G,bz+bd/2-kt/2,bw,.34,kt,P('granite'));
   box('granite',bx,G,bz-bd/2+kt/2,bw,.34,kt,P('granite'));
   for(const sx of [-1,1])box('granite',bx+sx*(bw/2-kt/2),G,bz,kt,.34,bd-2*kt,P('granite'));
  });
  if(CURREC&&!PLACE_DRY){
   const c=new THREE.Vector3(bx,0,bz).applyMatrix4(CM),hw=bw*.5-.34,hd=bd*.5-.34;
   (CURREC.stills||(CURREC.stills=[])).push({
    name:'infirmary_thermal_bath',level:G+.22,
    bounds:[c.x-hw,c.z-hd,c.x+hw,c.z+hd],
    poly:[[c.x-hw,c.z-hd],[c.x+hw,c.z-hd],[c.x+hw,c.z+hd],[c.x-hw,c.z+hd]],
    color:0x24666c,roughness:.05
   });
  }
  hsHarmonicRack(4.4,G,3.2,2.2,0,{chimes:4});
  hsSignGallery(-2.2,G,4.2,8.4,1.9,2.62,0,{deck:false,bays:3,openCenter:true});
  hsTarget(2.1,G,2.8,'bath-terrace');
  popM();
 }});

/* 17. Stepped Snow-White Quartz Lantern Ossuary */
defBuilding({key:'hs_quartz_ossuary',name:'Snow-White Quartz Lantern Columbaria',seed:37107,cut:true,
 w:14.8,d:14.8,h:15.4,budget:125000,
 tags:{types:['funerary','religious'],style:'spire'},
 note:'stepped snow-white milky-quartz funerary columbarium illuminated by eternal rock-crystal prism niches and guarded by raised Open-Palm steles',
 build(){
  const G=.48,W0=8.6,D0=8.6,H0=3.4;
  hsPlinth(12.2,12.2,G,{stepW:2.8});
  hsBox(W0,D0,G,H0,{mk:'ashlar',socleMk:'slateWall',socle:.44,holes:{
   s:[{x:0,y:0,w:1.38,h:2.28}],
   e:[{x:0,y:.95,w:1.06,h:1.18}],
   w:[{x:0,y:.95,w:1.06,h:1.18}],
   n:[{x:0,y:.95,w:1.06,h:1.18}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.24,2.18,{pivot:true});
  hsWindow(W0/2-HS.WALL/2,G+.95,0,PI/2,.94,1.08);
  hsWindow(-W0/2+HS.WALL/2,G+.95,0,-PI/2,.94,1.08);
  hsWindow(0,G+.95,-D0/2+HS.WALL/2,PI,.94,1.08);
  const yHip=hsHipSlateRoof(W0,D0,G+H0,2.0);
  hsQuartzPyramid(0,0,4.4,yHip,4.8,8,{heliograph:false});
  hsPalmMonolith(-4.6,G,4.6,2.8,0);
  hsPalmMonolith(4.6,G,4.6,2.8,0);
  hsHandLamp(-2.2,G+HS.HAND_LAMP_Y,D0/2+.06,0,{mountH:HS.HAND_LAMP_Y});
  hsHandLamp(2.2,G+HS.HAND_LAMP_Y,D0/2+.06,0,{mountH:HS.HAND_LAMP_Y});
  hsFurnList([
   ['hush_open_palm_stele',0,G,-2.6,0],
   ['hush_crystal_reliquary_chest',-2.5,G,-1.2,PI/2],
   ['hush_crystal_reliquary_chest',2.5,G,-1.2,-PI/2],
   ['hush_handspeak_mirror_lamp',-2.4,G,1.8,0],
   ['hush_handspeak_mirror_lamp',2.4,G,1.8,0]
  ]);
  hsTarget(0,G,0,'ossuary-vault');
 }});

/* 18. Open-Palm Monolith Border Gate (watching rare southern Timpar-Kuran trails) */
defBuilding({key:'hs_palm_gate',name:'Open-Palm Southern Hush Border Gate',seed:37201,cut:false,
 w:18.8,d:13.6,h:16.8,budget:150000,
 tags:{types:['military','infrastructure'],job:'customs',style:'spire',landmark:true},
 note:'twin granite-and-white-quartz pass towers flanking the Southern Hush Threshold with giant Raised Open-Palm monoliths warning rare Timpar-Kuran raiders where war-cries die',
 build(){
  const G=.4,Y2=4.2;
  hsPlinth(16.6,9.8,G,{stepW:3.6});
  /* Twin flanking battered snow-white quartz spire towers (west w/ heliograph, east w/ warden room) */
  hsQuartzSpireTower(-5.6,0,3.1,G,9.4,{steps:7,heliograph:true,doorYaw:0,targetName:'west-gate-tower'});
  hsQuartzSpireTower(5.6,0,3.1,G,9.4,{steps:7,heliograph:false,doorYaw:0,targetName:'east-gate-tower'});
  /* Spanning granite gatehouse arch & walkable parapet bridge at Y2 */
  hsWall(-3.9,1.3,3.9,1.3,G,Y2-G-.18,{mk:'granite',socle:.4,holes:[{at:3.9,y:0,w:2.2,h:2.85}]});
  hsWall(-3.9,-1.3,3.9,-1.3,G,Y2-G-.18,{mk:'granite',socle:.4,holes:[{at:3.9,y:0,w:2.2,h:2.85}]});
  hsDoor(0,G,1.3,0,1.95,2.7,{pivot:true,t:.38,style:'gate'});
  svNoWalk(()=>{
   box('paving',0,Y2-.18,0,7.8,.18,2.9,P('paving'));
   box('paving',1.9,Y2-.18,-2.2,2.2,.18,1.44,P('paving'));
   for(const sz of [-1.35,1.35]){
    if(sz>0)box('slateWall',0,Y2,sz,7.8,.96,.28,P('slateWall'));
    else box('slateWall',-1.8,Y2,sz,4.2,.96,.28,P('slateWall'));
   }
  });
  /* Walkable rear slate stair climbing +x behind the north archway wall onto the parapet landing */
  svStair(-3.6,-2.15,G,Y2,PI/2,{w:1.05,run:4.6,style:'solid',mk:'slate',col:P('slate')});
  wkPad(.4,-.6,6.8,3.6,Y2);
  /* Twin monumental 3.5 m Raised Open-Palm Boundary Monoliths + 440 Hz alarm rack + Handspeak primer stand */
  hsPalmMonolith(-5.6,G,3.8,3.45,0);
  hsPalmMonolith(5.6,G,3.8,3.45,0);
  hsHarmonicRack(0,Y2,.1,2.4,0,{chimes:5,h:2.25});
  hsHandLamp(-1.8,G+HS.HAND_LAMP_Y,1.52,0,{mountH:HS.HAND_LAMP_Y});
  hsHandLamp(1.8,G+HS.HAND_LAMP_Y,1.52,0,{mountH:HS.HAND_LAMP_Y});
  hsFurnList([
   ['hush_silent_warden_rack',-2.8,G,-.2,0],
   ['hush_primer_tablet_stand',2.8,G,2.6,0]
  ]);
  hsTarget(0,G,0,'gate-passage');
  hsTarget(1.8,Y2,0,'gate-parapet');
 }});

/* 19. Slender 5.4:1 Mist-Watch Border Spire */
defBuilding({key:'hs_mist_watch_spire',name:'Mist-Watch Quartz and Bianzhong Sentinel Spire',seed:37202,cut:true,
 w:12.6,d:12.8,h:19.2,budget:125000,
 tags:{types:['military'],style:'spire'},
 note:'slender 5.4:1 battered granite sentinel spire crowned with an optical heliograph shutter cupola and 440 Hz bianzhong alarm bell rack',
 build(){
  const G=.44;
  pushM(TF(0,0,-.45));
  hsPlinth(10.2,10.2,G,{stepW:2.4});
  /* Warden guardroom at foot */
  pushM(TF(-1.7,0,1.1));
  hsBox(5.8,5.8,G,2.85,{mk:'granite',socle:.38,holes:{
   s:[{x:0,y:0,w:1.22,h:2.12}],
   w:[{x:0,y:.88,w:.96,h:.96}]
  }});
  hsDoor(0,G,2.9-HS.WALL/2,0,1.08,2.04);
  hsWindow(-2.9+HS.WALL/2,G+.88,0,-PI/2,.84,.86);
  hsSlateRoof(5.8,5.8,G+2.85,1.65,{gableMk:'granite'});
  hsFurnList([
   ['hush_silent_warden_rack',-1.6,G,-1.5,0],
   ['hush_quartz_brazier_stove',1.6,G,-1.5,0],
   ['generic_poor_straw_bed',-1.5,G,1.1,PI/2],
   ['hush_heliograph_tripod',1.5,G,1.2,-.4]
  ]);
  hsTarget(0,G,0,'warden-post');
  popM();
  hsQuartzSpireTower(2.2,-1.5,2.7,G,11.8,{steps:8,heliograph:true,doorYaw:0,targetName:'watch-spire'});
  hsHarmonicRack(-2.2,G,4.2,2.2,0,{chimes:5,h:2.3});
  hsPalmMonolith(2.8,G,3.8,2.95,0);
  popM();
 }});

/* 20. Granite & Slate Sightline Sanctuary Curtain Wall */
defBuilding({key:'hs_sanctuary_wall',name:'Granite and Slate Sightline Sanctuary Wall',seed:37203,cut:false,
 w:18.4,d:10.4,h:12.6,budget:105000,
 tags:{types:['military','infrastructure'],style:'terrace'},
 note:'dressed pale-granite and blue-slate sanctuary curtain wall with walkable parapet, chest-height night sign-lamps and a 6-stepped white-quartz watch turret',
 build(){
  const G=.34,Y2=3.6;
  hsPlinth(16.4,7.4,G,{stepW:2.8});
  /* Main battered/dressed curtain wall with postern sally door + walkable top rampart */
  hsWall(-7.6,.6,3.8,.6,G,Y2,{mk:'granite',socle:.4,t:.44,holes:[{at:5.7,y:0,w:1.35,h:2.22}]});
  hsWall(-7.6,-1.4,3.8,-1.4,G,Y2,{mk:'slateWall',socle:.4,t:.38,holes:[{at:5.7,y:0,w:1.35,h:2.22}]});
  hsDoor(-1.9,G,.6,0,1.2,2.12,{t:.44});
  box('paving',-1.9,Y2-.16,-.4,11.4,.16,2.2,P('paving'));
  svNoWalk(()=>{
   box('ashlar',-1.9,Y2,.62,11.4,.88,.26,P('ashlar'));
   for(let i=-2;i<=2;i++)box('quartz',-1.9+i*2.1,Y2+.88,.62,.42,.22,.3,P('quartzPure'));
  });
  svStair(-6.2,-3.1,G,Y2,PI/2,{w:1.0,style:'solid',mk:'slate',col:P('slate')});
  svLanding(-1.6,-3.1,Y2,1.8,1.5,{mk:'paving',col:P('paving'),t:.14});
  wkPad(-1.9,-1.2,11.0,2.8,Y2);
  hsQuartzSpireTower(5.6,-.4,2.55,G,6.8,{steps:6,heliograph:false,doorYaw:0,targetName:'wall-turret'});
  hsHandLamp(-4.5,G+HS.HAND_LAMP_Y,.86,0,{mountH:HS.HAND_LAMP_Y});
  hsHandLamp(.8,G+HS.HAND_LAMP_Y,.86,0,{mountH:HS.HAND_LAMP_Y});
  hsPalmMonolith(-5.8,G,2.8,2.6,0);
  hsFurnList([
   ['hush_silent_warden_rack',-4.2,Y2,-.4,0],
   ['hush_heliograph_tripod',1.4,Y2,-.4,0]
  ]);
  hsTarget(-1.9,G,0,'postern-passage');
  hsTarget(-1.9,Y2,-.4,'wall-walk');
 }});
