// prefix: hy
// ================================================================= SACRED KEYHOLE STEP-WELL, WITHDRAWN SANCTUARY & NURAGHE DEFENCE (seeds 34108..34110, 34201..34204)
//   34108 hy_spring_stepwell       Santa Cristina Highland Spring & Seismic Chime Step-Well (live WATER.still mirror pool)
//   34109 hy_withdrawn_sanctuary   Siru-Hom Cliff Sanctuary of the Withdrawn True Heirs (Sheritu veiled silver/gunmetal heads)
//   34110 hy_ancestor_barrow       Tomba dei Giganti Basalt Exedra & Closed-Eye Ancestor Mask Vault
//   34201 hy_nuraghe_fort          Frontier Trilobate Nuraghe Garrison Fort
//   34202 hy_pass_gate             Avalanche-Wedge Pass Gatehouse & Customs Watch
//   34203 hy_wall_segment          Battered Megabreccia Curtain Wall & Casemate Guard Walk
//   34204 hy_beacon_nuraghe        Pass-Beacon Nuraghe & Katabatic Gale-Bell Watchtower

/* 18. Santa Cristina Highland Spring & Seismic Chime Step-Well (STILL POOL #1 on core/water) */
defBuilding({key:'hy_spring_stepwell',name:'Santa Cristina Spring and Seismic Chime Step-Well',seed:34108,cut:false,
 front:{x:0,z:8.4,yaw:0},
 w:19.8,d:20.6,h:9.8,budget:145000,
 tags:{types:['religious','infrastructure'],wealth:'rich',style:'sanctuary',job:'worship',landmark:true},
 note:'sunken Sardinian inverted-keyhole ashlar stair descending to a live core/water loess-foot spring mirror pool under tuned nephrite seismic chimes',
 build(){
  const yTop=1.48,yPool=.20,yLip=.26;
  /* Live core/water sacred spring mirror pool in the north keyhole basin */
  hyStillPool('hayrant_spring_keyhole_well',-2.05,-5.8,2.05,-1.95,yPool,{color:0x174d4f,roughness:.03,metalness:.22});

  /* Raised cyclopean & columnar basalt sacred peribolos U-terrace surrounding the sunken keyhole well [-2.6..2.6, -6.2..4.2] */
  for(const sx of [-5.6,5.6]){
   svNoWalk(()=>{
    box('megabreccia',sx,0,-.6,5.6,yTop-.14,14.8,P('megabreccia'));
    box('paving',sx,yTop-.14,-.6,5.4,.14,14.6,P('paving'));
   });
   wkPad(sx,-.6,5.4,14.6,yTop);
  }
  /* North terrace behind keyhole hood */
  svNoWalk(()=>{
   box('megabreccia',0,0,-7.1,5.6,yTop-.14,1.8,P('megabreccia'));
   box('paving',0,yTop-.14,-7.1,5.6,.14,1.8,P('paving'));
   /* South forecourt threshold terrace */
   box('megabreccia',0,0,5.5,5.6,yTop-.14,2.6,P('megabreccia'));
   box('paving',0,yTop-.14,5.5,5.6,.14,2.6,P('paving'));
  });
  wkPad(0,-7.1,5.6,1.8,yTop);
  wkPad(0,5.5,5.6,2.6,yTop);

  /* Monumental front stair climbing from plot ground (z=8.8, y=0) to peribolos terrace (z=6.6, y=yTop) */
  svNoWalk(()=>{
   const ns=8;
   for(let i=0;i<ns;i++){
    const za=lerp(8.8,6.7,i/ns),zb=lerp(8.8,6.7,(i+1)/ns);
    box('ashlar',0,yTop*i/ns,(za+zb)/2,3.6,yTop/ns,Math.abs(za-zb)+.02,P('ashlar'));
   }
   for(const sx of [-2.0,2.0])box('columnar',sx,0,7.75,.34,yTop+.28,2.2,P('columnar'));
  });
  svStripWalk([0,0,8.8],[0,yTop,6.55],3.4);

  /* Open twin-ancestor nephrite portal arch framing the keyhole descent */
  hyDoor(0,yTop,5.4,0,2.25,2.72,{open:true,lintel:'civic',ancestorMk:'silver'});

  /* Sunken Inverted-Keyhole Stair descending from (0, yTop, 4.1) down to waterside lip (0, yLip, -1.35) */
  svNoWalk(()=>{
   /* Dressed ashlar lining walls flanking the keyhole descent & basin */
   for(const sx of [-2.45,2.45])box('ashlar',sx,0,-1.0,.36,yTop+.45,10.4,P('ashlar'));
   box('ashlar',0,0,-6.05,4.54,.36+yTop,.38,P('ashlar'));
   /* Walkable waterside threshold lip at y = yLip (just south of water z = -1.95) */
   box('nephrite',0,0,-1.35,4.1,yLip,1.15,P('nephrite'));
   const nSt=7;
   for(let i=0;i<nSt;i++){
    const f0=i/nSt,f1=(i+1)/nSt;
    const z0=lerp(4.1,-.78,f0),z1=lerp(4.1,-.78,f1);
    const yh=lerp(yTop,yLip,(i+1)/nSt);
    const hw=hyRigMath.keyholeHalfWidth(2.05,1.55,f0);
    box('ashlar',0,0,(z0+z1)/2,hw*2,yh,Math.abs(z0-z1)+.02,P('ashlar'));
   }
   /* Corbelled basalt tholos hood & oculus sky-shaft over the north spring pool */
   const rH0=2.85,rH1=.72,yH0=yTop+.45,yH1=yTop+4.35;
   const prof=[];
   for(let j=0;j<=6;j++){
    const f=j/6;
    prof.push([lerp(rH0,rH1,Math.pow(f,1.25)),lerp(yH0,yH1,f)]);
   }
   lathe('corbel',0,-3.8,prof,20,P('corbel'));
   ring('nephrite',0,yH1+.04,-3.8,rH1+.16,.12,P('nephrite'),0,0,0,18);
   hyKaenCrown(2.8,yTop+.45,-5.4,.32,.62,4,{celadon:true,smoke:false});
   hyKaenCrown(-2.8,yTop+.45,-5.4,.32,.62,4,{celadon:true,smoke:false});
  });
  svStripWalk([0,yTop,4.15],[0,yLip,-.95],2.1);
  wkPad(0,-1.35,3.6,1.1,yLip);
  haloAt(0,yPool+.45,-3.8,0x58e6b8,true);

  /* Tuned Crookshore emerald-nephrite & Eternian bronze seismic rockfall/sturzstrom chimes over the wellhead */
  hySeismicChimes(0,yTop+3.35,1.4,0,2.6,1.45,7);
  hyAncestorHead(-4.4,yTop,3.8,0,.86,{mk:'silver',plinth:.76});
  hyAncestorHead(4.4,yTop,3.8,0,.86,{mk:'bronze',plinth:.76});

  hyFurnList([
   ['hayrant_inau_ancestor_shelf',-5.6,yTop,-3.8,PI/2,0],
   ['hayrant_inau_ancestor_shelf',5.6,yTop,-3.8,-PI/2,0],
   ['hayrant_seismic_chime_rack',-5.6,yTop,.8,PI/2],
   ['hayrant_jade_lantern_post',-3.6,yTop,5.8,0],
   ['hayrant_jade_lantern_post',3.6,yTop,5.8,0]
  ]);
  hyTarget(0,yTop,5.6,'peribolos-terrace');
  hyTarget(0,yLip,-1.35,'spring-pool-lip');
 }});

/* 19. Siru-Hom Cliff Sanctuary of the Withdrawn True Heirs (Sheritu Veiled Contemplative Hall) */
defBuilding({key:'hy_withdrawn_sanctuary',name:'Siru-Hom Withdrawn True-Heir Sanctuary',seed:34109,cut:true,
 w:22.6,d:19.0,h:15.2,budget:170000,
 tags:{types:['religious'],wealth:'rich',style:'sanctuary',job:'worship',landmark:true},
 note:'austere Sheritu cliff sanctuary of the Withdrawn True Heirs: columnar basalt cloister, veiled silver and gunmetal heads & alabaster-jade lancets',
 build(){
  const G=.58,HW=14.4,HD=8.8,HE=7.2;
  /* Forecourt paved cloister at y = 0.08 */
  svNoWalk(()=>box('paving',0,0,2.6,18.8,.08,11.6,P('paving')));
  wkPad(0,2.6,18.8,11.6,.08);
  hyWallRing(-9.4,-3.2,9.4,8.4,.08,2.55,{
   mk:'columnar',socle:.62,socleMk:'megabreccia',skip:'n',
   holes:{s:[{at:9.4,y:0,w:3.2,h:2.55}]}
  });
  hyDoor(0,.08,8.4,0,1.92,2.38,{lintel:'nephrite',maskMk:'silver'});
  /* Six veiled silver & gunmetal True-Heir heads lining the quiet cloister walk */
  for(let i=0;i<3;i++){
   const zz=1.4+i*2.2;
   hyAncestorHead(-7.8,.08,zz,PI/2,.78,{mk:i%2===0?'silver':'gunmetal',plinth:.82,veiled:true});
   hyAncestorHead(7.8,.08,zz,-PI/2,.78,{mk:i%2===0?'gunmetal':'silver',plinth:.82,veiled:true});
  }

  /* Sanctuary hall across the north podium */
  W(0,0,-3.4,0,()=>{
   hyPlinth(HW+.6,HD+.6,G,{stepW:3.2,stepX:0});
   hyWallRing(-HW/2,-HD/2,HW/2,HD/2,G,HE-G,{
    mk:'basalt',socle:1.35,socleMk:'megabreccia',postMk:'columnar',
    holes:{
     s:[{at:HW/2,y:0,w:2.8,h:3.45}],
     n:[{at:3.8,y:1.2,w:1.25,h:2.0},{at:HW-3.8,y:1.2,w:1.25,h:2.0}]
    }
   });
   hyDoor(0,G,HD/2,0,1.72,2.6,{lintel:'civic',ancestorMk:'silver'});
   for(const sx of [-4.4,4.4])hyDualLancets(sx,G+1.1,HD/2+.24,0,3,.56,3.2,{step:.36,oculus:true,oculusR:.34});
   for(const sx of [-HW/2+3.8,HW/2-3.8])hyWindow(sx,G+1.2,-HD/2,PI,1.0,1.75,{light:'alabaster',stepHead:true});
   hySteppedPierFront(0,HE+.24,HD/2+.16,0,6.6,1.45,.4,5,{mk:'brick',centreMetal:'silver',sideMetal:'gunmetal'});
   hyRoofHip(0,HE+.24,0,HW+.24,HD+.24,4.65,{mk:'celadon',smoke:false});

   /* Folded contemplative bronze/silver ancestor figure in the apse */
   hyAncestorFigure(0,G,-HD/2+1.3,0,2.05,{pose:'folded',mk:'silver',plinth:.46});
   hyFurnList([
    ['eternian_court_ancestor_niche',-3.8,G,-3.2,0],
    ['eternian_court_ancestor_niche',3.8,G,-3.2,0],
    ['eternian_court_alabaster_lamp',-2.0,G,-2.8,0],
    ['eternian_court_alabaster_lamp',2.0,G,-2.8,0],
    ['eternian_court_gallery_bench',-4.2,G,.6,PI/2],
    ['eternian_court_gallery_bench',4.2,G,.6,-PI/2],
    ['hayrant_yak_pelt_mat',-1.6,G,.8,0,1],
    ['hayrant_yak_pelt_mat',1.6,G,.8,0,1]
   ]);
   hyTarget(0,G,1.0,'sanctuary-nave');
  });
  hySeismicChimes(0,2.85,5.6,0,2.2,1.25,5);
  hyTarget(0,.08,4.6,'cloister-court');
 }});

/* 20. Tomba dei Giganti Basalt Exedra & Closed-Eye Ancestor Barrow */
defBuilding({key:'hy_ancestor_barrow',name:'Tomba dei Giganti Ancestor Exedra Barrow',seed:34110,cut:true,
 w:18.6,d:17.4,h:9.2,budget:115000,
 tags:{types:['funerary','religious'],wealth:'middle',style:'sanctuary',job:'worship'},
 note:'crescent Sardinian columnar-basalt orthostat exedra framing a 3-ton nephrite portal into a turf-mantled loess vault of closed-eye masks',
 build(){
  const G=.24;
  /* Paved crescent exedra forecourt & barrow threshold */
  svNoWalk(()=>box('paving',0,0,.8,14.8,G,13.6,P('paving')));
  wkPad(0,.8,14.8,13.6,G);
  /* Vaulted funerary chamber across north half */
  hyLoessVault(0,-2.6,G,10.2,6.8,3.35,{
   frontMk:'megabreccia',lintel:'nephrite',maskMk:'silver',celadonCrown:true,smoke:false,winLight:'alabaster'
  });
  /* Crescent Sardinian orthostat wings curving forward on +z from the portal stele */
  svNoWalk(()=>{
   for(const s of [-1,1]){
    for(let i=1;i<=5;i++){
     const f=i/5,xx=s*(1.65+f*4.8),zz=.9+Math.pow(f,1.15)*4.6,hh=3.2-f*1.35;
     const yaw=-s*(.28+f*.45);
     W(xx,G,zz,yaw,()=>{
      box('columnar',0,0,0,.78,hh,.46,P('columnar'));
      box('nephrite',0,hh,0,.68,.12,.4,P('nephrite'));
      if(i<=3)hyDoorMask(0,hh*.58,.26,0,.36,i===1?'silver':'bronze');
     });
    }
   }
  });
  hySeismicChimes(0,G+2.95,1.65,0,2.1,1.15,5);
  hyFurnList([
   ['eternian_court_ancestor_niche',0,G,-4.8,0],
   ['hayrant_inau_ancestor_shelf',-2.8,G,-4.6,0,0],
   ['hayrant_inau_ancestor_shelf',2.8,G,-4.6,0,1],
   ['eternian_court_alabaster_lamp',-1.6,G,-2.2,0],
   ['eternian_court_alabaster_lamp',1.6,G,-2.2,0],
   ['hayrant_jade_lantern_post',-3.4,G,4.6,0],
   ['hayrant_jade_lantern_post',3.4,G,4.6,0]
  ]);
  hyTarget(0,G,3.8,'exedra-court');
  hyTarget(0,G,-2.4,'barrow-vault');
 }});

/* 21. Frontier Trilobate Nuraghe Garrison Fort */
defBuilding({key:'hy_nuraghe_fort',name:'Trilobate Nuraghe Frontier Garrison Fort',seed:34201,cut:true,
 w:24.2,d:21.0,h:15.8,budget:185000,
 tags:{types:['military','civic'],wealth:'middle',style:'prefect',landmark:true},
 note:'central concave-battered basalt keep under a celadon hex-hip flanked by twin bastion nuraghi and a twin-ancestor gate curtain',
 build(){
  svNoWalk(()=>box('paving',0,0,.6,19.6,.08,15.6,P('paving')));
  wkPad(0,.6,19.6,15.6,.08);

  /* Central tall Nuraghe Keep at (0, -2.4) with walkable upper guard loft at y = 4.35 */
  hyNuraghe(0,-2.4,.08,4.55,3.42,9.2,{
   celadonCap:true,capH:2.85,smoke:true,
   doors:[{yaw:0,w:1.48,h:2.32,lintel:'nephrite',maskMk:'bronze'}],
   windows:[
    {yaw:0,w:.74,h:1.15,y:4.9,light:'steel',stepHead:true},
    {yaw:PI/2,w:.72,h:1.1,y:4.9,light:'steel'},
    {yaw:-PI/2,w:.72,h:1.1,y:4.9,light:'steel'}
   ]
  });
  const yLoft=4.35;
  svNoWalk(()=>cyl('planks',0,yLoft-.14,-2.4,2.2,.14,P('planks'),14));
  svFloor(hyOctPts(0,-2.4,2.15,12),yLoft);
  wkLadder(-1.25,.14,-1.4,-1.25,yLoft,-1.85);
  svNoWalk(()=>{
   beam('larch',[-1.5,.14,-1.4],[-1.5,yLoft+.8,-1.85],.07,P('larchD'));
   beam('larch',[-1.0,.14,-1.4],[-1.0,yLoft+.8,-1.85],.07,P('larchD'));
   for(let i=1;i<=11;i++){
    const f=i/12;
    box('larch',-1.25,lerp(.14,yLoft,f),lerp(-1.4,-1.85,f),.46,.045,.06,P('larch'));
   }
  });

  /* Twin flanking SW & SE Nuraghe Bastions at (+/-7.4, 2.8) */
  for(const sx of [-1,1]){
   hyNuraghe(sx*7.4,2.8,.08,2.85,2.18,6.1,{
    celadonCap:false,
    doors:[{yaw:-sx*PI/2,w:1.18,h:2.05,lintel:'nephrite',maskMk:'gunmetal'}],
    windows:[{yaw:0,w:.64,h:.95,y:2.8,light:'steel'}]
   });
  }
  /* Front battered curtain wall connecting between the two bastions [-4.3..4.3] at z = 6.6 */
  hyWall(-4.3,6.6,4.3,6.6,.08,3.45,{
   mk:'megabreccia',socle:.85,socleMk:'columnar',
   holes:[{at:4.3,y:0,w:3.2,h:3.45}]
  });
  hyDoor(0,.08,6.6,0,1.95,2.55,{lintel:'civic',ancestorMk:'gunmetal'});
  /* Rear & side enclosure walls clear of towers */
  hyWall(4.8,-7.2,-4.8,-7.2,.08,2.95,{mk:'megabreccia',socle:.75,socleMk:'columnar'});
  hyWall(-9.2,-6.8,-9.2,-.4,.08,2.95,{mk:'megabreccia',socle:.75,socleMk:'columnar'});
  hyWall(9.2,-.4,9.2,-6.8,.08,2.95,{mk:'megabreccia',socle:.75,socleMk:'columnar'});

  hyWindHanging(-2.8,.08,6.95,0,1.6,2.6,{mk:'plaid',panels:2});
  hyWindHanging(2.8,.08,6.95,0,1.6,2.6,{mk:'plaid',panels:2});

  hyFurnList([
   ['hayrant_irori_hearth',0,.14,-2.4,0],
   ['eternian_common_arms_rack',-2.2,.14,-3.8,0],
   ['pa_weapon_rack',2.2,.14,-3.8,0],
   ['eternian_common_bunk',-7.4,.14,2.0,0],
   ['eternian_common_bunk',7.4,.14,2.0,0],
   ['eternian_common_register_desk',.9,yLoft,-2.8,0],
   ['eternian_common_chest',-1.1,yLoft,-3.1,0],
   ['generic_barrel',3.2,.08,4.2,0]
  ]);
  hyTarget(0,.08,3.6,'garrison-court');
  hyTarget(0,.14,-2.4,'keep-tholos');
  hyTarget(.8,yLoft,-2.4,'keep-loft');
  hyTarget(-7.4,.14,2.8,'west-bastion');
  hyTarget(7.4,.14,2.8,'east-bastion');
 }});

/* 22. Avalanche-Wedge Pass Gatehouse & Customs Watch */
defBuilding({key:'hy_pass_gate',name:'Avalanche-Wedge Pass Gatehouse',seed:34202,cut:true,
 w:19.0,d:14.8,h:13.8,budget:145000,
 tags:{types:['military','infrastructure'],wealth:'middle',style:'prefect',job:'customs'},
 note:'twin battered basalt gate-bastions, twin-ancestor civic toll portal, Deco parapet crown and rear megabreccia avalanche splitter wedge',
 build(){
  const G=.28,W=13.6,D=8.4,H=5.4;
  pushM(TF(0,0,.35));
  hyPlinth(W+.8,D+.8,G,{stepW:3.4,stepX:0});
  hyWallRing(-W/2,-D/2,W/2,D/2,G,H,{
   mk:'basalt',socle:1.1,socleMk:'megabreccia',postMk:'columnar',
   holes:{
    s:[{at:W/2,y:0,w:3.4,h:3.65},{at:2.2,y:1.2,w:1.1,h:1.55},{at:W-2.2,y:1.2,w:1.1,h:1.55}],
    n:[{at:2.6,y:1.2,w:1.1,h:1.5},{at:W-2.6,y:1.2,w:1.1,h:1.5}]
   }
  });
  hyDoor(0,G,D/2,0,2.15,2.72,{lintel:'civic',ancestorMk:'bronze'});
  for(const sx of [-W/2+2.2,W/2-2.2])hyWindow(sx,G+1.2,D/2,0,.88,1.32,{light:'steel',stepHead:true});
  for(const sx of [-W/2+2.6,W/2-2.6])hyWindow(sx,G+1.2,-D/2,PI,.88,1.28,{light:'steel'});
  hyBilingualSign(-3.2,G+2.65,D/2+.36,0,1.5,.88);

  /* Rear V-shaped cyclopean megabreccia avalanche & sturzstrom splitter wedge on -z (clear of north wall -D/2 - .28) */
  svNoWalk(()=>{
   prism('megabreccia',[[-3.6,-D/2-.3],[3.6,-D/2-.3],[0,-D/2-3.4]],0,G+3.85,P('megabreccia'));
   prism('nephrite',[[-2.8,-D/2-.32],[2.8,-D/2-.32],[0,-D/2-2.85]],G+3.85,G+4.05,P('nephrite'));
  });
  hySteppedPierFront(0,G+H+.24,D/2+.16,0,6.4,1.3,.36,5,{mk:'brick',centreMetal:'bronze',sideMetal:'gunmetal'});
  hyRoofHip(0,G+H+.24,0,W+.22,D+.22,3.65,{mk:'celadon',smoke:true});
  hySeismicChimes(3.4,G+3.1,D/2+.42,0,1.6,1.1,5);

  hyFurnList([
   ['eternian_common_register_desk',-3.8,G,-1.8,0],
   ['eternian_common_weighing_scale',-3.8,G,.8,0],
   ['eternian_common_arms_rack',4.2,G,-2.4,0],
   ['pa_weapon_rack',4.2,G,.4,-PI/2],
   ['hayrant_irori_hearth',1.8,G,-2.2,0],
   ['generic_strongbox',-5.2,G,-3.1,0]
  ]);
  hyTarget(0,G,.6,'toll-hall');
  popM();
 }});

/* 23. Battered Megabreccia Curtain Wall & Casemate Guard Walk */
defBuilding({key:'hy_wall_segment',name:'Megabreccia Curtain Wall and Guard Casemate',seed:34203,cut:true,
 w:16.4,d:9.8,h:9.4,budget:105000,
 tags:{types:['military','infrastructure'],wealth:'middle',style:'prefect'},
 note:'battered cyclopean megabreccia and basalt curtain wall with vaulted guard casemate, interior stair & mensoloni allure parapet walk',
 build(){
  const G=.24,W=14.4,D=5.8,H=4.36;
  hyPlinth(W+.6,D+.8,G,{stepW:2.6,stepX:-2.4});
  hyWallRing(-W/2,-D/2,W/2,D/2,G,H,{
   mk:'megabreccia',socle:.95,socleMk:'columnar',
   holes:{
    s:[{at:W/2-2.4,y:0,w:1.75,h:2.75},{at:W/2+2.6,y:1.15,w:1.05,h:1.35}],
    n:[{at:3.6,y:1.4,w:.72,h:1.25},{at:W-3.6,y:1.4,w:.72,h:1.25}]
   }
  });
  hyDoor(-2.4,G,D/2,0,1.3,2.14,{lintel:'nephrite',maskMk:'gunmetal'});
  hyWindow(2.6,G+1.15,D/2,0,.84,1.12,{light:'steel',stepHead:true});
  for(const sx of [-W/2+3.6,W/2-3.6])hyWindow(sx,G+1.4,-D/2,PI,.54,1.02,{light:'steel'});

  /* Interior dog-leg stair climbing from G to allure parapet deck at yWalk = G + H + 0.24 */
  const yWalk=G+H+.24;
  const SC=svStairCase({x0:2.2,x1:6.2,z0:-2.0,z1:2.0},[G,yWalk],{
   w:.86,mk:'larch',col:P('larch'),smk:'larch',scol:P('larchD')
  });
  svWell('ashlar',0,yWalk-.18,0,W+.3,.18,D+.3,P('ashlar'),SC.wells[0]);
  wkPad(-2.6,0,9.2,D,yWalk);
  /* Crenellated north breastwork & south parapet curb on top of allure deck */
  svNoWalk(()=>{
   for(let i=-3;i<=3;i++){
    box('basalt',i*2.0,yWalk,-D/2-.04,1.25,1.05,.38,P('basalt'));
    box('corbel',i*2.0,H-.15,-D/2-.24,.32,.28,.32,P('corbel'));
   }
   box('basalt',-2.2,yWalk,D/2+.04,9.6,.72,.32,P('basalt'));
  });
  hyWindHanging(0,yWalk,-D/2-.28,PI,2.2,2.1,{mk:'plaid',panels:2});

  hyFurnList([
   ['eternian_common_arms_rack',-4.8,G,-1.8,0],
   ['pa_weapon_rack',.4,G,-1.9,0],
   ['eternian_poor_hearth',.8,G,.8,0],
   ['eternian_common_bunk',-5.2,G,.8,PI/2],
   ['generic_barrel',-1.2,G,-1.8,0]
  ]);
  hyTarget(-1.8,G,.4,'casemate-room');
  hyTarget(-1.6,yWalk,.2,'allure-walk');
 }});

/* 24. Pass-Beacon Nuraghe & Katabatic Gale-Bell Watchtower */
defBuilding({key:'hy_beacon_nuraghe',name:'Pass-Beacon Nuraghe and Gale-Bell Watchtower',seed:34204,cut:true,
 w:13.8,d:13.8,h:16.8,budget:125000,
 tags:{types:['infrastructure','military'],wealth:'middle',style:'hybrid'},
 note:'concave-battered columnar basalt pass-beacon nuraghe with interior watch-deck, iron fire-cresset & wind-rigged nephrite gale chimes',
 build(){
  const cz=-.35,rBase=4.25,rTop=2.95,hNur=10.4;
  hyNuraghe(0,cz,0,rBase,rTop,hNur,{
   celadonCap:false,
   doors:[{yaw:0,w:1.36,h:2.22,lintel:'nephrite',maskMk:'bronze'}],
   windows:[
    {yaw:0,w:.68,h:1.15,y:5.2,light:'alabaster',stepHead:true},
    {yaw:PI/2,w:.68,h:1.15,y:5.2,light:'nephrite'},
    {yaw:-PI/2,w:.68,h:1.15,y:5.2,light:'nephrite'},
    {yaw:PI,w:.68,h:1.15,y:5.2,light:'alabaster'}
   ]
  });
  /* Mid-level watch-deck at y = 4.75 + interior ladder */
  const yDeck=4.75;
  svNoWalk(()=>cyl('planks',0,yDeck-.14,cz,1.95,.14,P('planks'),14));
  svFloor(hyOctPts(0,cz,1.9,12),yDeck);
  wkLadder(-1.05,.06,cz+.75,-1.05,yDeck,cz+.3);
  svNoWalk(()=>{
   beam('larch',[-1.3,.06,cz+.75],[-1.3,yDeck+.8,cz+.3],.07,P('larchD'));
   beam('larch',[-.8,.06,cz+.75],[-.8,yDeck+.8,cz+.3],.07,P('larchD'));
   for(let i=1;i<=12;i++){
    const f=i/13;
    box('larch',-1.05,lerp(.06,yDeck,f),lerp(cz+.75,cz+.3,f),.44,.045,.06,P('larch'));
   }
   /* Crown beacon platform, 4 bronze corner posts, celadon smoke-canopy & roaring iron cresset */
   const yTop=hNur+1.14;
   cyl('paving',0,yTop,cz,rTop+.18,.14,P('paving'),20);
   cyl('iron',0,yTop+.14,cz,.92,.68,P('iron'),12);
   cyl('glow',0,yTop+.82,cz,.76,.22,new THREE.Color(0xff8428),12);
   for(let i=0;i<4;i++){
    const a=i*TAU/4+PI/4;
    cyl('bronze',Math.cos(a)*1.85,yTop+.14,cz+Math.sin(a)*1.85,.11,2.45,P('bronze'),8);
   }
   etHexHip(2.45,yTop+2.59,1.85,{mk:'celadon',ov:.35,under:P('larchD'),cap:P('celadon')});
  });
  smokeAt(0,hNur+2.25,cz,{r:.65,kind:'chimney'});
  haloAt(0,hNur+2.2,cz,0xff9438,true);
  hySeismicChimes(0,hNur+1.05,cz+rTop+.26,0,2.0,1.35,5);

  hyFurnList([
   ['hayrant_irori_hearth',.8,.06,cz-.6,0],
   ['generic_fuel',-1.8,.06,cz-1.4,0],
   ['generic_lamp_oil',1.8,.06,cz-1.4,0],
   ['eternian_common_bunk',.7,yDeck,cz-.7,0],
   ['hayrant_seismic_chime_rack',0,yDeck,cz+1.1,PI]
  ]);
  hyTarget(0,.06,cz,'beacon-base');
  hyTarget(.6,yDeck,cz,'watch-deck');
 }});
