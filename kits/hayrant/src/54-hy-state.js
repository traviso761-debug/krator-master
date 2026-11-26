// prefix: hy
// ================================================================= ETERNAL STATE PREFECTURE, CLOCK OBSERVATORY & KURAN LEGATION (PLAN.md §6, seeds 34101..34107)
//   34101 hy_prefect_seat         Pepar-Hom Circuit E6 Prefectural Seat (52x42 m, 4 domains: Utari chise, assay wing, organ-pipe basilica, cloister)
//   34102 hy_clock_observatory    Sutar-Tawar Clock-Observatory (nuraghe base + Deco clock drum + live CURREC.clock ancestor parade)
//   34103 hy_assay_registry       Iron, Tin, Silver & Saltpeter Assay Registry and Guild Hall
//   34104 hy_examination_school   Bilingual Eternian Logograph & Hayrant Sound-Mark Examination School
//   34105 hy_tube_relay           Escarpment Pneumatic-Capsule & High-Voltage Porcelain-Insulator Telegraph Relay
//   34106 hy_talking_head         Cyan-Lit Ancient Talking-Head Stele Pavilion with willow inau & nephrite chimes
//   34107 hy_kuran_legation       Hueru-Kuran Sister-Clan Legation (124,710 pass: Leviathan whale-jaw arch, 3-ton nephrite lintel & feast chise)

/* 11. Pepar-Hom Circuit E6 Prefectural Seat (Mirabilis 350,726) */
defBuilding({key:'hy_prefect_seat',name:'Pepar-Hom Prefectural Seat',seed:34101,cut:true,
 w:52.0,d:42.0,h:21.8,budget:280000,
 tags:{types:['civic'],wealth:'rich',style:'prefect',landmark:true},
 note:'Circuit E6 vassal seat in four domains: twin-ancestor nephrite gate & Utari whalebone chise, assay wing, organ-pipe nuraghe basilica & cloister',
 build(){
  /* Paved ceremonial compound court at y = 0.08 */
  svNoWalk(()=>box('paving',0,0,0,47.6,.08,37.2,P('paving')));
  wkPad(0,0,47.6,37.2,.08);
  /* Battered megabreccia & pale-brick fortress wall with monumental twin-ancestor gold-and-nephrite gate on +z */
  hyWallRing(-23.8,-18.6,23.8,18.6,.08,3.35,{
   mk:'brick',socle:1.1,socleMk:'megabreccia',postMk:'columnar',
   holes:{s:[{at:23.8,y:0,w:4.4,h:3.35}]}
  });
  hyDoor(0,.08,18.6,0,2.6,3.05,{lintel:'civic',ancestorMk:'gold'});
  hySteppedPierFront(0,3.66,18.6,0,6.8,1.35,.36,5,{mk:'brick',centreMetal:'gold',sideMetal:'silver'});
  hyBilingualSign(-3.6,1.15,18.96,0,1.65,.95);
  hyBilingualSign(3.6,1.15,18.96,0,1.65,.95);

  /* Domain 1 (SE Outer Court): Heirloom Whalebone-Rib Utari Clan Elders Council Chise */
  hyChise(14.6,9.4,.08,4.15,.66,2.45,2.75,{
   whaleHeirloom:true,celadonCrown:true,
   doors:[{yaw:-PI/2,w:1.38,h:2.14,lintel:'nephrite',maskMk:'silver'}],
   windows:[{yaw:0,w:.78,h:.86,y:1.0,light:'alabaster'},{yaw:PI,w:.78,h:.86,y:1.0,light:'nephrite'}]
  });
  hyWhaleJawArch(9.2,.08,9.4,PI/2,3.8,4.1);

  /* Domain 2 (SW Outer Court): Tribute, Saltpeter & Ore Assay Wing */
  W(-14.8,0,8.2,PI/2,()=>{
   const AG=.36,AW=11.4,AD=6.2,AH=4.2;
   hyPlinth(AW+.4,AD+.4,AG,{stepW:2.6,stepX:0});
   hyWallRing(-AW/2,-AD/2,AW/2,AD/2,AG,AH,{
    mk:'basalt',socle:.65,socleMk:'megabreccia',
    holes:{
     s:[{at:AW/2,y:0,w:2.1,h:2.85},{at:2.2,y:1.0,w:1.35,h:1.65},{at:AW-2.2,y:1.0,w:1.35,h:1.65}],
     n:[{at:AW/2,y:1.05,w:1.3,h:1.5}]
    }
   });
   hyDoor(0,AG,AD/2,0,1.52,2.28,{lintel:'nephrite',maskMk:'bronze'});
   for(const sx of [-AW/2+2.2,AW/2-2.2])hyWindow(sx,AG+1.0,AD/2,0,1.1,1.4,{light:'nephrite',stepHead:true});
   hyWindow(0,AG+1.05,-AD/2,PI,1.05,1.28,{light:'alabaster'});
   hyRoofHip(0,AG+AH+.24,0,AW+.2,AD+.2,2.45,{mk:'celadon',smoke:false});
   hyFurnList([
    ['eternian_common_weighing_scale',-3.2,AG,-.8,0],
    ['eternian_common_register_desk',0,AG,-1.8,0],
    ['eternian_common_archive_shelf',3.6,AG,-2.1,0],
    ['generic_strongbox',-4.2,AG,-2.1,0]
   ]);
   hyTarget(0,AG,.4,'assay-wing');
  });

  /* Domain 3 (North): Organ-Pipe Nuraghe Prefectural Basilica flanked by twin concave basalt nuraghe bastions */
  W(0,0,-7.6,0,()=>{
   const BG=.72,BW=19.2,BD=10.2,BE=8.6;
   hyPlinth(BW+.8,BD+.8,BG,{stepW:4.2,stepX:0});
   hyWallRing(-BW/2,-BD/2,BW/2,BD/2,BG,BE-BG,{
    mk:'brick',socle:1.85,socleMk:'basalt',postMk:'columnar',
    holes:{
     s:[{at:BW/2,y:0,w:3.6,h:3.95}],
     n:[{at:4.6,y:1.35,w:1.45,h:2.2},{at:BW-4.6,y:1.35,w:1.45,h:2.2}]
    }
   });
   hyDoor(0,BG,BD/2,0,2.15,3.1,{lintel:'civic',ancestorMk:'gold'});
   for(const sx of [-5.8,5.8])hyDualLancets(sx,BG+1.2,BD/2+.25,0,3,.64,3.85,{step:.42,oculus:true,oculusR:.4});
   for(const sx of [-BW/2+4.6,BW/2-4.6])hyWindow(sx,BG+1.35,-BD/2,PI,1.2,1.95,{light:'alabaster',stepHead:true});
   /* 7-rank Deco-Gothic Organ-Pipe Frontispiece above the basilica cornice */
   hySteppedPierFront(0,BE+.24,BD/2+.18,0,9.4,1.65,.46,7,{mk:'brick',centreMetal:'gold',sideMetal:'silver'});
   hyRoofHip(0,BE+.24,0,BW+.3,BD+.3,5.85,{mk:'celadon',smoke:true});
   /* State Judge & Ancestor Seat inside the basilica apse */
   hyAncestorFigure(0,BG,-BD/2+1.25,0,2.35,{pose:'seat',mk:'gold',plinth:.48,headdress:'mitre'});
   hyFurnList([
    ['eternian_court_petition_stand',0,BG,1.2,PI],
    ['eternian_court_alabaster_lamp',-3.4,BG,-3.4,0],
    ['eternian_court_alabaster_lamp',3.4,BG,-3.4,0],
    ['eternian_court_gallery_bench',-6.2,BG,-.6,PI/2],
    ['eternian_court_gallery_bench',6.2,BG,-.6,-PI/2],
    ['hayrant_seismic_chime_rack',-6.8,BG,3.1,0]
   ]);
   hyTarget(0,BG,1.5,'prefect-basilica');
  });
  /* Twin Organ-Pipe Nuraghe Bastions standing cleanly flanking the basilica at x = +/-13.8 */
  for(const sx of [-1,1]){
   hyNuraghe(sx*13.8,-7.6,.08,3.35,2.52,10.6,{
    celadonCap:true,capH:3.1,smoke:false,
    doors:[{yaw:0,w:1.28,h:2.18,lintel:'nephrite',maskMk:'silver'}],
    windows:[{yaw:0,w:.72,h:1.25,y:5.2,light:'alabaster',stepHead:true},{yaw:sx*PI/2,w:.68,h:1.15,y:5.2,light:'nephrite'}]
   });
   hyTarget(sx*13.8,.14,-7.6,sx<0?'west-bastion':'east-bastion');
  }

  /* Domain 4 (NE Cloister): Prefect Residence & Veiled Ancestor Gallery */
  W(16.2,0,-1.2,-PI/2,()=>{
   const RG=.36,RW=7.8,RD=5.2,RH=3.8;
   hyPlinth(RW+.4,RD+.4,RG,{stepW:2.2,stepX:0});
   hyWallRing(-RW/2,-RD/2,RW/2,RD/2,RG,RH,{
    mk:'lime',socle:.68,socleMk:'basalt',
    holes:{s:[{at:RW/2,y:0,w:1.8,h:2.65},{at:1.6,y:1.0,w:1.15,h:1.4},{at:RW-1.6,y:1.0,w:1.15,h:1.4}]}
   });
   hyDoor(0,RG,RD/2,0,1.34,2.18,{lintel:'nephrite',maskMk:'silver'});
   for(const sx of [-RW/2+1.6,RW/2-1.6])hyWindow(sx,RG+1.0,RD/2,0,.94,1.18,{light:'alabaster',stepHead:true});
   hyRoofHip(0,RG+RH+.24,0,RW+.18,RD+.18,2.2,{mk:'celadon',smoke:true});
   hyAncestorHead(-2.4,RG,RD/2+.55,0,.74,{mk:'gunmetal',plinth:.72,veiled:true});
   hyAncestorHead(2.4,RG,RD/2+.55,0,.74,{mk:'silver',plinth:.72});
   hyFurnList([
    ['eternian_court_canopy_bed',-1.8,RG,-.8,0],
    ['hayrant_inau_ancestor_shelf',2.1,RG,-1.6,0,0]
   ]);
   hyTarget(0,RG,.3,'prefect-residence');
  });

  hyFurnList([
   ['hayrant_irori_hearth',14.6,.14,9.4,0],
   ['hayrant_larch_feast_table',14.6,.14,11.2,0],
   ['hayrant_jade_lantern_post',-4.2,.08,12.8,0],
   ['hayrant_jade_lantern_post',4.2,.08,12.8,0]
  ]);
  hyTarget(14.6,.14,9.4,'utari-council-chise');
  hyTarget(0,.08,8.5,'ceremonial-court');
 }});

/* 12. Sutar-Tawar Clock-Observatory (Mirabilis Star-Tower with live CURREC.clock parade) */
defBuilding({key:'hy_clock_observatory',name:'Sutar-Tawar Clock Observatory',seed:34102,cut:true,
 w:18.8,d:18.4,h:22.6,budget:185000,
 tags:{types:['civic','infrastructure'],wealth:'rich',style:'prefect',landmark:true},
 note:'concave-battered basalt nuraghe base supporting an octagonal Deco-Gothic astronomical clock drum, bronze transit ring & ancestor parade',
 build(){
  const cz=-.5,rBase=5.35,rTop=4.15,hNur=7.2;
  hyNuraghe(0,cz,0,rBase,rTop,hNur,{
   celadonCap:false,
   doors:[{yaw:0,w:1.58,h:2.45,lintel:'civic',ancestorMk:'silver'}],
   windows:[
    {yaw:PI/2,w:.76,h:1.25,y:2.8,light:'alabaster',stepHead:true},
    {yaw:-PI/2,w:.76,h:1.25,y:2.8,light:'nephrite',stepHead:true},
    {yaw:PI,w:.76,h:1.25,y:2.8,light:'alabaster',stepHead:true}
   ]
  });
  /* Walkable upper star-chart loft inside the nuraghe at y = 3.85 reached by interior ladder */
  const yLoft=3.85;
  svNoWalk(()=>cyl('planks',0,yLoft-.14,cz,2.55,.14,P('planks'),16));
  svFloor(hyOctPts(0,cz,2.5,12),yLoft);
  wkLadder(-1.55,.06,cz+.85,-1.55,yLoft,cz+.35);
  svNoWalk(()=>{
   beam('larch',[-1.82,.06,cz+.85],[-1.82,yLoft+.85,cz+.35],.07,P('larchD'));
   beam('larch',[-1.28,.06,cz+.85],[-1.28,yLoft+.85,cz+.35],.07,P('larchD'));
   for(let i=1;i<=11;i++){
    const f=i/12;
    box('larch',-1.55,lerp(.06,yLoft,f),lerp(cz+.85,cz+.35,f),.48,.045,.06,P('larch'));
   }
  });

  /* Upper Deco-Gothic Pale-Brick Clock Drum rising cleanly from mensoloni deck yDeck = 8.34 */
  const yDeck=hNur+1.14,rDrum=3.05,hDrum=6.2;
  svNoWalk(()=>{
   cyl('paving',0,yDeck,cz,rTop+.24,.16,P('paving'),24);
   cyl('brick',0,yDeck+.16,cz,rDrum,hDrum,P('brick'),8);
   for(let i=0;i<8;i++){
    const a=i*TAU/8+PI/8;
    W(Math.cos(a)*(rDrum+.06),yDeck+.16,cz+Math.sin(a)*(rDrum+.06),PI/2-a,()=>{
     box('columnar',0,0,0,.38,hDrum,.28,P('columnar'));
     box('celadon',0,hDrum,0,.44,.18,.34,KIT_HAS('celadon')?new THREE.Color(1,1,1):P('celadon'));
    });
   }
   /* Parade balcony doorways & nephrite dial surround on +z face of drum */
   const zFace=cz+rDrum+.08,yDial=yDeck+3.55,rDial=1.52;
   box('basalt',-1.55,yDeck+.16,zFace-.02,.76,1.65,.12,P('basaltD'));
   box('basalt',1.55,yDeck+.16,zFace-.02,.76,1.65,.12,P('basaltD'));
   pole('onyx',[0,yDial,zFace-.02],[0,yDial,zFace+.06],rDial,P('onyx'),24);
   ring('nephrite',0,yDial,zFace+.07,rDial+.12,.14,P('nephrite'),0,PI/2,0,24);
   ring('gold',0,yDial,zFace+.11,rDial*.74,.045,KIT_HAS('gold')?new THREE.Color(1,1,1):P('gold'),0,PI/2,0,24);
   for(let h=0;h<12;h++){
    const ah=h*TAU/12;
    box('gold',Math.sin(ah)*rDial*.86,yDial+Math.cos(ah)*rDial*.86-.05,zFace+.11,.1,.1,.04,KIT_HAS('gold')?new THREE.Color(1,1,1):P('gold'));
   }
   /* Steep celadon octagonal spire + bronze transit armillary sphere at the apex */
   const yCap=yDeck+.16+hDrum;
   etHexHip(rDrum+.42,yCap,4.6,{mk:'celadon',ov:.38,under:P('larchD'),cap:P('celadon')});
   const yArm=yCap+4.65;
   pole('bronze',[0,yCap+4.3,cz],[0,yArm+1.45,cz],.07,P('bronze'),8);
   ring('bronze',0,yArm+.65,cz,.82,.045,P('bronze'),.42,0,0,20);
   ring('gold',0,yArm+.65,cz,.68,.038,KIT_HAS('gold')?new THREE.Color(1,1,1):P('gold'),0,.55,.35,20);
  });
  hySeismicChimes(0,yDeck-.05,cz+rTop+.28,0,2.2,1.35,5);

  /* Record world-space clock dial & ancestor parade track for 90z-hy-atmos.js */
  if(CURREC&&!PLACE_DRY){
   const zTrack=cz+rDrum+.42,yTr=yDeck+.18;
   const dialW=hyWorldPt(0,yDeck+3.55,cz+rDrum+.14);
   const nEnd=hyWorldPt(0,yDeck+3.55,cz+rDrum+1.14);
   CURREC.clock={
    dial:dialW,
    normal:[nEnd[0]-dialW[0],nEnd[1]-dialW[1],nEnd[2]-dialW[2]],
    radius:1.52,
    track:[
     hyWorldPt(-1.55,yTr,zTrack-.35),
     hyWorldPt(-1.55,yTr,zTrack),
     hyWorldPt(0,yTr,zTrack+.24),
     hyWorldPt(1.55,yTr,zTrack),
     hyWorldPt(1.55,yTr,zTrack-.35)
    ],
    figureH:1.12,
    period:36,
    figures:[
     {seed:341021,metal:'gold'},
     {seed:341022,metal:'silver'},
     {seed:341023,metal:'bronze'},
     {seed:341024,metal:'gunmetal'}
    ]
   };
  }

  hyFurnList([
   ['eternian_common_register_desk',-1.8,.06,cz-1.6,0],
   ['eternian_common_archive_shelf',1.8,.06,cz-2.1,0],
   ['eternian_court_alabaster_lamp',0,.06,cz+2.2,0],
   ['hayrant_seismic_chime_rack',2.4,.06,cz+.2,-PI/2],
   ['hayrant_inau_ancestor_shelf',0,yLoft,cz-1.6,0,0],
   ['eternian_common_exam_desk',.9,yLoft,cz+.6,PI],
   ['generic_writing_supplies',.9,yLoft+.76,cz+.6,0]
  ]);
  hyTarget(0,.06,cz,'clock-tholos');
  hyTarget(.8,yLoft,cz,'star-loft');
 }});

/* 13. Circuit E6 Assay Registry & Guild Hall */
defBuilding({key:'hy_assay_registry',name:'Circuit E6 Ore and Saltpeter Assay Registry',seed:34103,cut:true,
 w:17.8,d:15.0,h:12.8,budget:145000,
 tags:{types:['civic'],wealth:'middle',style:'prefect',job:'customs'},
 note:'battered basalt bullion vault under a pale-brick Deco archive hall with twin-ancestor nephrite portal, bilingual board & celadon hip',
 build(){
  const G=.48,F1=4.15,E=7.65,W=13.8,D=10.2;
  pushM(TF(0,0,-.45));
  hyPlinth(W+.6,D+.6,G,{stepW:3.2,stepX:0});
  hyWallRing(-W/2,-D/2,W/2,D/2,G,F1-G,{
   mk:'basalt',socle:.72,socleMk:'megabreccia',postMk:'columnar',
   holes:{
    s:[{at:W/2,y:0,w:2.85,h:3.3},{at:2.4,y:1.05,w:1.35,h:1.55},{at:W-2.4,y:1.05,w:1.35,h:1.55}],
    n:[{at:3.4,y:1.05,w:1.3,h:1.5},{at:W-3.4,y:1.05,w:1.3,h:1.5}]
   }
  });
  hyDoor(0,G,D/2,0,1.68,2.46,{lintel:'civic',ancestorMk:'bronze'});
  for(const sx of [-W/2+2.4,W/2-2.4])hyWindow(sx,G+1.05,D/2,0,1.1,1.32,{light:'nephrite',stepHead:true});
  for(const sx of [-W/2+3.4,W/2-3.4])hyWindow(sx,G+1.05,-D/2,PI,1.06,1.28,{light:'steel'});
  hyBilingualSign(-3.1,G+2.45,D/2+.36,0,1.5,.88);

  const SF=svStair(-4.9,2.8,G,F1,PI,{w:1.0,mk:'larch',col:P('larch'),smk:'larch',scol:P('larchD'),rail:'right'});
  svWell('planks',0,F1-.18,0,W-.7,.18,D-.7,P('planks'),SF);
  svNoWalk(()=>box('nephrite',0,F1-.06,0,W+.26,.13,D+.26,P('nephrite')));
  hyWallRing(-W/2,-D/2,W/2,D/2,F1+.07,E-(F1+.07),{
   mk:'brick',socle:0,postMk:'ashlar',
   holes:{n:[{at:W/2,y:1.0,w:1.4,h:1.55}]}
  });
  for(const sx of [-3.8,3.8])hyDualLancets(sx,F1+.65,D/2+.24,0,3,.54,2.3,{step:.28,oculus:true,oculusR:.3});
  hyWindow(0,F1+1.0,-D/2,PI,1.16,1.34,{light:'alabaster',stepHead:true});
  hySteppedPierFront(0,E+.24,D/2+.16,0,6.2,1.2,.34,5,{mk:'brick',centreMetal:'silver',sideMetal:'bronze'});
  hyRoofHip(0,E+.24,0,W+.22,D+.22,3.6,{mk:'celadon',smoke:true});

  hyFurnList([
   ['eternian_common_weighing_scale',-2.4,G,-.8,0],
   ['eternian_common_weighing_scale',2.4,G,-.8,0],
   ['eternian_common_register_desk',0,G,-3.2,0],
   ['generic_strongbox',4.8,G,-3.4,0],
   ['hayrant_saltpeter_vat',4.6,G,1.8,0],
   ['eternian_common_archive_shelf',-2.6,F1,-3.8,0],
   ['eternian_common_archive_shelf',2.6,F1,-3.8,0],
   ['eternian_common_table',0,F1,.8,0]
  ]);
  hyTarget(0,G,1.2,'assay-hall');
  hyTarget(0,F1,.8,'registry-archive');
  popM();
 }});

/* 14. Bilingual Eternian-Hayrant Examination School */
defBuilding({key:'hy_examination_school',name:'Bilingual Logograph and Sound-Mark School',seed:34104,cut:true,
 w:18.6,d:15.4,h:11.6,budget:140000,
 tags:{types:['civic'],wealth:'middle',style:'hybrid',job:'scribing'},
 note:'walled court and bright alabaster-lancet examination hall where highland clerks learn Eternal State logographs and Hayrant sound-marks',
 build(){
  const G=.42,BW=14.8,BD=8.4,BH=4.5;
  hyPlinth(15.6,12.2,G,{stepW:3.0,stepX:0});
  /* Main lecture & examination hall across north half */
  W(0,0,-1.6,0,()=>{
   hyWallRing(-BW/2,-BD/2,BW/2,BD/2,G,BH,{
    mk:'lime',socle:.85,socleMk:'basalt',postMk:'columnar',
    holes:{
     s:[{at:BW/2,y:0,w:2.1,h:2.95}],
     n:[{at:3.6,y:1.05,w:1.35,h:1.75},{at:BW-3.6,y:1.05,w:1.35,h:1.75}]
    }
   });
   hyDoor(0,G,BD/2,0,1.56,2.32,{lintel:'nephrite',maskMk:'silver'});
   for(const sx of [-4.4,4.4])hyDualLancets(sx,G+.95,BD/2+.24,0,3,.52,2.55,{step:.3});
   for(const sx of [-BW/2+3.6,BW/2-3.6])hyWindow(sx,G+1.05,-BD/2,PI,1.12,1.5,{light:'alabaster',stepHead:true});
   hySteppedPierFront(0,G+BH+.24,BD/2+.16,0,5.6,1.1,.3,5,{mk:'brick',centreMetal:'silver',sideMetal:'bronze'});
   hyRoofHip(0,G+BH+.24,0,BW+.2,BD+.2,3.45,{mk:'celadon',smoke:true});
   hyBilingualSign(-2.4,G+2.3,BD/2+.34,0,1.35,.82);
   hyBilingualSign(2.4,G+2.3,BD/2+.34,0,1.35,.82);
   hyAncestorHead(0,G,-BD/2+1.05,0,.85,{mk:'silver',plinth:.88});
   hyFurnList([
    ['eternian_common_exam_desk',-3.6,G,-.8,0],
    ['eternian_common_exam_desk',-1.2,G,-.8,0],
    ['eternian_common_exam_desk',1.2,G,-.8,0],
    ['eternian_common_exam_desk',3.6,G,-.8,0],
    ['eternian_common_exam_desk',-2.4,G,1.4,0],
    ['eternian_common_exam_desk',2.4,G,1.4,0],
    ['eternian_common_archive_shelf',-5.8,G,-2.6,PI/2],
    ['hayrant_seismic_chime_rack',5.8,G,-2.2,-PI/2]
   ]);
   hyTarget(0,G,.6,'exam-hall');
  });
  /* Low forecourt screen & jade snow-lanterns */
  hySeismicChimes(-4.8,G+2.55,5.2,0,1.8,1.15,5);
  hyFurnList([
   ['hayrant_jade_lantern_post',4.8,G,4.8,0]
  ]);
  hyTarget(0,G,4.2,'school-court');
 }});

/* 15. Escarpment Pneumatic-Capsule & High-Voltage Porcelain-Insulator Telegraph Relay */
defBuilding({key:'hy_tube_relay',name:'Pneumatic Tube and Porcelain-Insulator Relay',seed:34105,cut:true,
 w:15.4,d:13.8,h:13.8,budget:125000,
 tags:{types:['infrastructure'],wealth:'middle',style:'prefect',job:'scribing'},
 note:'battered basalt compressor vault, bronze escarpment dispatch tubes & roof-mounted Mirabilis high-voltage porcelain insulator cross-arms',
 build(){
  const G=.44,W=10.8,D=8.6,H=4.6;
  pushM(TF(0,0,-.4));
  hyPlinth(W+.6,D+.6,G,{stepW:2.6,stepX:0});
  hyWallRing(-W/2,-D/2,W/2,D/2,G,H,{
   mk:'basalt',socle:.78,socleMk:'megabreccia',postMk:'columnar',
   holes:{
    s:[{at:W/2,y:0,w:1.95,h:2.85},{at:2.1,y:1.1,w:1.2,h:1.45},{at:W-2.1,y:1.1,w:1.2,h:1.45}],
    n:[{at:W/2,y:1.1,w:1.3,h:1.5}]
   }
  });
  hyDoor(0,G,D/2,0,1.46,2.24,{lintel:'nephrite',maskMk:'bronze'});
  for(const sx of [-W/2+2.1,W/2-2.1])hyWindow(sx,G+1.1,D/2,0,.96,1.22,{light:'steel',stepHead:true});
  hyWindow(0,G+1.1,-D/2,PI,1.06,1.26,{light:'steel'});
  hyRoofHip(0,G+H+.24,0,W+.2,D+.2,2.75,{mk:'tile',kaenFinial:false});

  /* Twin bronze pneumatic riser tubes & roof-mounted high-voltage porcelain-insulator telegraph gantry */
  svNoWalk(()=>{
   for(const sx of [-1.45,1.45]){
    cyl('bronze',sx,G,-D/2-.48,.18,H+3.6,P('bronze'),12);
    ring('iron',sx,G+2.2,-D/2-.48,.23,.05,P('iron'),0,0,0,12);
    ring('iron',sx,G+4.4,-D/2-.48,.23,.05,P('iron'),0,0,0,12);
   }
   const yG=G+H+3.0;
   for(const sx of [-2.8,2.8])cyl('iron',sx,G+H+.2,0,.12,4.6,P('iron'),10);
   for(const ya of [yG+.8,yG+1.55]){
    box('larch',0,ya,0,7.2,.14,.16,P('larchD'));
    for(let i=-3;i<=3;i++){
     const ix=i*1.05;
     cyl('white',ix,ya+.14,0,.095,.22,P('white'),10);
     cyl('celadon',ix,ya+.36,0,.07,.12,P('celadon'),10);
    }
   }
  });
  /* Wind-rigged katabatic telegraph span cables between the cross-arm insulators and front anchor mast */
  svNoWalk(()=>{
   cyl('iron',-3.8,0,4.2,.11,5.6,P('iron'),8);
   cyl('white',-3.8,5.6,4.2,.09,.2,P('white'),8);
   withCloth((lp,out)=>{
    const u=clamp((lp.z+0)/4.2,0,1),pw=hyRigMath.spanPin(u)*.12;
    out.set(pw,pw*.3,0);
   },()=>{
    psurf('hemp',(u,v)=>[-3.15-.65*u+(v-.5)*.03,9.65-3.85*u-.25*4*u*(1-u),4.2*u],10,2,P('iron'));
   });
  });

  hyFurnList([
   ['eternian_common_tube_rack',-3.4,G,-2.8,0],
   ['eternian_common_tube_rack',3.4,G,-2.8,0],
   ['hayrant_insulator_rack',-3.8,G,.8,PI/2],
   ['eternian_common_register_desk',0,G,-.8,0],
   ['eternian_common_bench',0,G,.5,PI],
   ['generic_lamp_oil',3.8,G,2.2,0]
  ]);
  hyTarget(0,G,1.2,'relay-floor');
  popM();
 }});

/* 16. Cyan-Lit Ancient Talking-Head Stele Pavilion */
defBuilding({key:'hy_talking_head',name:'Ancient Talking-Head Stele Pavilion',seed:34106,cut:false,
 front:{x:0,z:4.4,yaw:0},
 w:11.8,d:11.8,h:9.2,budget:95000,
 tags:{types:['religious','civic'],wealth:'middle',style:'hybrid',job:'worship'},
 note:'colossal salvage titanium-and-gunmetal Ancient head with glowing cyan visor under a celadon hex baldachin, willow inau & nephrite chimes',
 build(){
  const G=.42;
  hyPlinth(8.4,8.4,G,{stepW:2.6,stepX:0});
  /* Open 4-column basalt & celadon hex baldachin */
  svNoWalk(()=>{
   for(const sx of [-2.8,2.8])for(const sz of [-2.8,2.8]){
    box('ashlar',sx,G,sz,.56,.42,.56,P('ashlar'));
    cyl('columnar',sx,G+.42,sz,.24,3.45,P('columnar'),8);
    box('nephrite',sx,G+3.87,sz,.52,.18,.52,P('nephrite'));
   }
   box('basalt',0,G+4.05,0,6.4,.26,6.4,P('basalt'));
   etHexHip(4.2,G+4.31,2.95,{mk:'celadon',ov:.45,under:P('larchD'),cap:P('celadon')});
   hyKaenCrown(0,G+7.3,0,.3,.52,4,{celadon:true,smoke:false});
   /* Stepped megabreccia stele & colossal titanium Ancient head with cyan visor slit */
   box('megabreccia',0,G,-.6,2.35,.78,1.95,P('megabreccia'));
   box('nephrite',0,G+.78,-.6,1.95,.18,1.65,P('nephrite'));
   const p=etHeadParams(341060,{eyes:'closed',headdress:'band'});
   etEmitGeo('titanium',etHeadGeo(p),0,G+1.22,-.55,[1.95,2.25,1.95],0,P('titanium'));
   /* Glowing cyan Ancient speech-visor bar stepped 4 cm forward of brow */
   box('glow',0,G+2.36,.36,.92,.09,.06,new THREE.Color(0x4ef6ff));
  });
  haloAt(0,G+2.36,.52,0x4ef6ff,true);
  hySeismicChimes(-2.8,G+3.8,2.85,0,1.65,1.15,5);
  hySeismicChimes(2.8,G+3.8,2.85,0,1.65,1.15,5);
  if(CURREC&&!PLACE_DRY){
   (CURREC.heads=CURREC.heads||[]).push({kind:'head',metal:'titanium',eyes:'closed',veiled:false});
   CURREC.voice={lang:'ancient-creole',color:0x4ef6ff,seat:'Mirabilis'};
  }
  hyFurnList([
   ['hayrant_inau_ancestor_shelf',-2.2,G,-2.2,0,0],
   ['hayrant_inau_ancestor_shelf',2.2,G,-2.2,0,1],
   ['hayrant_jade_lantern_post',-3.1,G,3.1,0],
   ['hayrant_jade_lantern_post',3.1,G,3.1,0],
   ['eternian_court_petition_stand',0,G,1.65,PI]
  ]);
  hyTarget(0,G,1.8,'stele-dais');
 }});

/* 17. Hueru-Kuran Sister-Clan Legation (Cross-Pass 124,710 Envoy Compound) */
defBuilding({key:'hy_kuran_legation',name:'Hueru-Kuran Sister-Clan Legation',seed:34107,cut:true,
 w:23.2,d:19.8,h:13.2,budget:175000,
 tags:{types:['civic'],wealth:'rich',style:'hybrid',landmark:true},
 note:'sister-clan embassy over the 124,710 Ukor-Tera pass: bleached Leviathan whale-jaw arch, 3-ton Crookshore nephrite gate, envoy nuraghe & feast chise',
 build(){
  /* Paved embassy compound court at y = 0.08 */
  svNoWalk(()=>box('paving',0,0,0,20.4,.08,16.8,P('paving')));
  wkPad(0,0,20.4,16.8,.08);
  hyWallRing(-10.2,-8.4,10.2,8.4,.08,2.65,{
   mk:'columnar',socle:.72,socleMk:'megabreccia',postMk:'ashlar',
   holes:{s:[{at:10.2,y:0,w:3.4,h:2.65}]}
  });
  /* 3-ton Crookshore sawn emerald-nephrite lintel gate + monumental bleached Leviathan whale-jawbone arch */
  hyDoor(0,.08,8.4,0,2.1,2.45,{lintel:'nephrite',lintelH:.44,maskMk:'nephrite',maskSize:.52});
  hyWhaleJawArch(0,.08,6.75,0,5.2,5.35);
  hyBilingualSign(-2.6,1.15,8.76,0,1.45,.86);

  /* West Crookshore Cyclopean Nuraghe Envoy Keep */
  hyNuraghe(-5.1,-2.1,.08,3.45,2.62,7.2,{
   celadonCap:true,capH:2.55,smoke:false,
   doors:[{yaw:0,w:1.34,h:2.18,lintel:'nephrite',maskMk:'nephrite'}],
   windows:[{yaw:PI/2,w:.72,h:1.05,y:3.4,light:'nephrite',stepHead:true},{yaw:0,w:.72,h:1.05,y:3.4,light:'alabaster'}]
  });

  /* East Whalebone-Crested Sister-Clan Feast Chise */
  hyChise(4.7,-1.8,.08,3.95,.64,2.42,2.68,{
   whaleHeirloom:true,celadonCrown:true,
   doors:[{yaw:0,w:1.36,h:2.12,lintel:'nephrite',maskMk:'bronze'}],
   windows:[{yaw:1.4,w:.76,h:.84,y:.98,light:'nephrite'},{yaw:-1.4,w:.76,h:.84,y:.98,light:'alabaster'}]
  });

  /* Katabatic wind-rigged madder-plaid & braided harpoon-netting sister-clan banners */
  hyWindHanging(-6.4,.08,5.2,0,2.2,2.85,{mk:'plaid',panels:2});
  hyWindHanging(6.4,.08,5.2,0,2.2,2.85,{mk:'netting',panels:2});

  hyFurnList([
   ['hayrant_larch_cruck_bed',-5.1,.14,-3.1,0],
   ['eternian_common_register_desk',-5.1,.14,-.9,PI],
   ['hayrant_seismic_chime_rack',-6.6,.14,-2.1,PI/2],
   ['hayrant_irori_hearth',4.7,.14,-1.8,0],
   ['hayrant_larch_feast_table',4.7,.14,.1,0],
   ['hayrant_inau_ancestor_shelf',4.7,.14,-4.2,0,0],
   ['hayrant_kaen_jar',6.6,.14,-1.8,0,1],
   ['hayrant_nephrite_saw_bench',-5.4,.08,3.4,0],
   ['hayrant_jade_lantern_post',2.8,.08,4.6,0]
  ]);
  hyTarget(0,.08,3.4,'legation-court');
  hyTarget(-5.1,.14,-2.1,'envoy-nuraghe');
  hyTarget(4.7,.14,-1.8,'feast-chise');
 }});
