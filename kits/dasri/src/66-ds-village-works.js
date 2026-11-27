// prefix: ds
// ================================================================= DASRI VILLAGE WORKS, OASIS INFRASTRUCTURE & QASR ([draw])
// 8 vernacular works, infrastructure & fortress defs (seeds 8211..8218):
//   ds_vil_granary        Mudbrick beehive/cylinder granary cluster on raised rubble rat-plinth
//   ds_vil_shade_loggia   Open juniper-post caravan way-shade & majlis loggia (sablah)
//   ds_vil_saqiya_well    Stone well-head & animal-drawn saqiya water-wheel shed with qadad runnel
//   ds_vil_salt_shed      Solta / Salt al-Ban evaporating brine pans & halite block-drying shed
//   ds_vil_potter_kiln    Circular mudbrick clay & qadad-lime updraught kiln & slaking pit
//   ds_vil_cliff_stair    Solid-stone canyon-ledge mule stair & battered retaining terrace
//   ds_vil_watch_post     Battered cylindrical mudbrick oasis watchtower (burj) with mizab & crenellations
//   ds_vil_oasis_qasr     Fortified desert oasis qasr (Arfwai style: battered curtain, round corner drum tower & domes)

/* 21. ds_vil_granary: Mudbrick Beehive / Cylinder Granary Cluster */
defBuilding({
 key:'ds_vil_granary',
 name:'Dasri mudbrick beehive granary cluster',
 seed:8211,
 cls:'building',
 kind:'granary',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('poor',['farm','industry'],'granary','farming'),
 w:8.4,d:7.6,h:6.4,budget:32000,cut:false,
 front:{x:0,z:3.3,yaw:0},
 note:'Three battered mudbrick beehive grain silos raised on a coursed rubble-stone plinth against damp and rodents, with high timber shuttered hatches, climbing peg steps, whitewashed lime rain caps, and a front winnowing apron.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=7.4,Dd=6.6,z0=cliff?-3.8:-Dd/2,z1=z0+Dd;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble'});

  /* Raised 0.65 m stone platform under the rear silos + walkable front winnowing apron */
  const pz=(z0+z0+4.0)/2;
  svNoWalk(()=>{
   box('rubble',0,0,pz,Wd-.2,.68,4.0,P('rubble'));
   box('qadad',0,.66,pz,Wd-.12,.06,4.06,P('qadadWarm'));
   const silos=[[-2.2,pz,1.18,4.55],[0,pz-.15,1.32,5.15],[2.2,pz,1.18,4.55]];
   silos.forEach(([sx,sz,r,sh],idx)=>{
    const y0=.72;
    lathe('banco',sx,sz,[
     [r,y0],[r*.98,y0+sh*.35],[r*.86,y0+sh*.68],[r*.58,y0+sh*.9],[.22,y0+sh]
    ],18,P('banco'));
    /* Whitewashed waterproof lime cap dome on top of each silo */
    lathe('qadad',sx,sz,[
     [r*.62,y0+sh*.88],[r*.42,y0+sh*.96],[.06,y0+sh+.24]
    ],14,P('qadadWarm'));
    /* High wooden loading hatch + projecting juniper climbing pegs */
    W(sx,y0+1.85,sz+r*.9,0,()=>{
     box('cedar',0,0,0,.62,.74,.14,P('cedar'));
     box('qadad',0,.74,.02,.76,.09,.06,P('qadadWarm'));
     for(let p=0;p<4;p++)pole('timber',[(p%2?-.22:.22),-1.55+p*.42,-.05],[(p%2?-.22:.22),-1.55+p*.42,.24],.032,P('timber'),5);
    });
    if(idx===1)door(sx,0,z1-.4,0,1.2,2.0);
   });
  });
  /* Timber-and-reed shade canopy over the front winnowing & sack-weighing apron */
  svNoWalk(()=>{
   for(const sx of [-2.8,0,2.8])pole('timber',[sx,0,z1-.45],[sx,2.45,z1-.45],.055,P('timber'),6);
   pole('timber',[-3.0,2.42,z1-.45],[3.0,2.42,z1-.45],.05,P('timber'),6);
   box('roof',0,2.46,(z0+4.0+z1-.35)/2,6.2,.07,z1-(z0+4.0)-.2,P('roofVil'));
  });
  FURNISH('job_winnowing_mat',-1.4,.08,z1-1.3,0,{setting:'outdoor'});
  FURNISH('job_winnowing_tub',-.2,.08,z1-1.3,0,{setting:'outdoor'});
  FURNISH('nomad_grain_sacks',1.8,.08,z1-1.2,-.3,{setting:'outdoor'});
  dsTarget(0,.08,z1-1.1,'granary apron');
 }
});

/* 22. ds_vil_shade_loggia: Oasis Way-Shade & Majlis Loggia (Sablah) */
defBuilding({
 key:'ds_vil_shade_loggia',
 name:'Dasri oasis way-shade loggia (Sablah)',
 seed:8212,
 cls:'building',
 kind:'loggia',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('poor',['civic','inn'],'sablah','trading'),
 w:9.6,d:6.8,h:4.6,budget:26000,cut:true,
 front:{x:0,z:2.9,yaw:0},
 note:'Open-fronted Dasri caravan way-shade and village council loggia (sablah): solid battered rear & side walls against desert wind, juniper-post front colonnade, flat packed-earth roof, and plastered majlis carpet bench with water jars.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=8.6,Dd=5.8,z0=cliff?-3.4:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble'});

  const gh=3.3;
  /* Rear (-z) and side (+x, -x) battered walls; front (+z) completely open colonnade! */
  dsRing(x0,z0,x1,z1,0,gh,{
   t:.44,mk:'banco',socle:.85,socleMk:'rubble',madamik:true,cliffRear:cliff,skip:'s',
   holes:{
    e:[{at:Dd*.5,w:.62,y:1.35,h:.72}],
    w:[{at:Dd*.5,w:.62,y:1.35,h:.72}]
   }
  });
  dsVilWin(x1,1.35,(z0+z1)/2,PI/2,.62,.72,{solid:false});
  dsVilWin(x0,1.35,(z0+z1)/2,-PI/2,.62,.72,{solid:false});
  door(0,0,z1-.2,0,2.4,2.4);

  /* Four carved juniper columns with corbelled bolsters supporting the front lintel beam */
  svNoWalk(()=>{
   for(let i=0;i<4;i++){
    const px=-3.0+i*2.0;
    cyl('rubble',px,0,z1-.32,.24,.24,P('rubble'),10);
    cyl('timber',px,.24,z1-.32,.13,gh-.46,P('timber'),10);
    box('cedar',px,gh-.24,z1-.32,.56,.16,.28,P('cedar'));
   }
   box('timber',0,gh-.1,z1-.32,Wd,.14,.34,P('timber'));
   /* Raised limewashed sitting bench along the back wall */
   box('qadad',0,.08,z0+.85,Wd-1.2,.42,.95,P('qadadWarm'));
  });
  FURNISH('nomad_kilim',-1.6,.08,(z0+z1)/2,0,{setting:'indoor'});
  FURNISH('nomad_kilim',1.6,.08,(z0+z1)/2,0,{setting:'indoor'});
  FURNISH('nomad_tea_set',0,.5,z0+.85,0,{setting:'indoor'});
  FURNISH('nomad_water_jars',-3.4,.08,z1-1.1,0,{setting:'indoor'});
  FURNISH_HANG('nomad_hanging_lantern',0,2.9,(z0+z1)/2,0,{setting:'indoor'});
  dsTarget(0,.08,(z0+z1)/2+.4,'sablah shade floor');

  const rY=dsRoof(x0,z0,x1,z1,gh,{style:'village',cliffRear:cliff,walk:false});
  dsParapet(x0,z0,x1,z1,rY,{style:'village',h:.58,cliffRear:cliff});
 }
});

/* 23. ds_vil_saqiya_well: Oasis Well-Head & Animal-Drawn Saqiya Water-Wheel Shed */
defBuilding({
 key:'ds_vil_saqiya_well',
 name:'Dasri oasis saqiya well and water-wheel',
 seed:8213,
 cls:'building',
 kind:'well',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('middle',['infrastructure','farm'],'well','farming'),
 w:9.8,d:9.8,h:5.8,budget:34000,cut:false,
 front:{x:0,z:4.3,yaw:0},
 note:'Oasis well-head and animal-drawn saqiya pot-wheel under a juniper-and-reed shade roof: deep stone-curbed well shaft, wooden gear wheel & pot garland, feeding a whitewashed qadad aqueduct runnel and camel trough.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=8.8,Dd=8.8,z0=cliff?-4.9:-Dd/2,z1=z0+Dd,cz=(z0+z1)/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble'});
  door(0,0,z1-.3,0,2.0,2.2);

  /* Rear retaining wind-wall when cliff-backed or freestanding */
  dsWall(-Wd/2+.2,z0+.24,Wd/2-.2,z0+.24,0,2.6,{t:.44,mk:'rubble',flushOut:cliff});
  svNoWalk(()=>box('qadad',0,2.6,z0+.24,Wd-.35,.08,.44,P('qadadWarm')));

  /* Stone well-head shaft + timber saqiya gear-wheels + pot garland + qadad watering channel! */
  const wx=-1.1,wz=cz-.5;
  svNoWalk(()=>{
   cyl('rubble',wx,0,wz,1.45,.92,P('rubble'),18);
   cyl('qadad',wx,.86,wz,1.48,.1,P('qadadWarm'),18);
   cyl('basalt',wx,.04,wz,1.08,.86,P('basalt'),16);
   cyl('water',wx,.38,wz,1.04,.04,new THREE.Color(.12,.36,.42),16);

   /* Overhead frame & horizontal animal drive beam + vertical pot-garland wheel */
   for(const sx of [-1.75,1.75])for(const sz of [-1.6,1.6]){
    pole('timber',[wx+sx,0,wz+sz],[wx+sx,3.85,wz+sz],.075,P('timber'),7);
   }
   box('timber',wx,3.85,wz,3.8,.14,.18,P('timber'));
   box('timber',wx,3.85,wz,.18,.14,3.5,P('timber'));
   box('roof',wx,4.0,wz,4.1,.1,3.8,P('roofVil'));
   /* Horizontal crown cog-wheel + sweep pole */
   const gx=wx+1.65;
   pole('timber',[gx,.08,wz],[gx,3.85,wz],.08,P('timber'),8);
   ring('cedar',gx,2.15,wz,.95,.07,P('cedar'),0,0,0,18);
   for(let k=0;k<6;k++){
    const a=k*TAU/6;
    beam('cedar',[gx,2.15,wz],[gx+Math.cos(a)*.95,2.15,wz+Math.sin(a)*.95],.05,P('cedar'));
   }
   beam('timber',[gx,1.05,wz],[gx+1.8,1.05,wz+1.6],.065,P('timber'),true,6);
   /* Vertical water-lifting wheel over well mouth with clay pots */
   beam('cedar',[wx-1.5,2.15,wz],[gx,2.15,wz],.07,P('cedar'),true,8);
   ring('cedar',wx,2.15,wz,1.05,.07,P('cedar'),PI/2,0,0,18);
   for(let k=0;k<8;k++){
    const a=k*TAU/8,py=2.15+Math.sin(a)*1.05,pz=wz+Math.cos(a)*1.05;
    beam('cedar',[wx,2.15,wz],[wx,py,pz],.04,P('cedar'));
    cyl('banco',wx-.14,py-.12,pz,.1,.22,P('bancoL'),8,.07);
   }
   /* Qadad-lined elevated channel into front camel watering trough */
   box('rubble',wx,0,(wz+1.45+z1-1.3)/2,.58,.92,z1-1.3-(wz+1.45),P('rubble'));
   box('qadad',wx,.92,(wz+1.45+z1-1.3)/2,.62,.16,z1-1.3-(wz+1.45)+.2,P('qadad'));
   box('water',wx,1.04,(wz+1.45+z1-1.3)/2,.34,.03,z1-1.3-(wz+1.45),new THREE.Color(.2,.48,.52));
   box('rubble',.6,0,z1-1.25,4.6,.68,1.25,P('rubble'));
   box('qadad',.6,.08,z1-1.25,4.2,.62,.92,P('qadad'));
   box('water',.6,.64,z1-1.25,4.12,.04,.86,new THREE.Color(.2,.48,.52));
  });
  FURNISH('nomad_water_jars',2.9,.08,z1-2.4,0,{setting:'outdoor'});
  dsTarget(2.0,.08,cz+1.2,'well walk');
 }
});

/* 24. ds_vil_salt_shed: Solta / Salt al-Ban Evaporating Pans & Halite Block Shed */
defBuilding({
 key:'ds_vil_salt_shed',
 name:'Dasri salt-drying pans and halite block shed (Solta)',
 seed:8214,
 cls:'building',
 kind:'saltworks',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('poor',['industry'],'salt-shed','salt'),
 w:12.4,d:9.6,h:5.6,budget:34000,cut:false,
 front:{x:0,z:4.2,yaw:0},
 note:'Train of Jabal outstation salt works (Solta and Salt al-Ban): shallow stone-kerbed brine evaporation pans in front, backed by an open mudbrick-pier drying shed stacked with cut crystalline halite blocks and salt baskets.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=11.4,Dd=8.6,z0=cliff?-4.8:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble'});
  door(0,0,z1-.2,0,2.2,2.2);

  const zShed=z0+4.6;
  /* Front brine evaporation pans (left wet brine, right crystallized white halite crust!) */
  svNoWalk(()=>{
   for(const [px,wet] of [[-2.75,true],[2.75,false]]){
    const pz=(zShed+.4+z1-.35)/2,pw=4.6,pd=z1-zShed-.85;
    box('rubble',px,0,pz,pw,.32,pd,P('rubble'));
    box('qadad',px,.06,pz,pw-.36,.28,pd-.36,P('qadad'));
    if(wet)box('water',px,.28,pz,pw-.4,.03,pd-.4,new THREE.Color(.42,.62,.64));
    else box('halite',px,.26,pz,pw-.4,.06,pd-.4,P('halite'));
   }
  });

  /* Rear open-sided mudbrick-pier halite curing & cutting shed (-z..zShed) */
  const sh=3.35;
  dsWall(x0+.2,z0+.24,x1-.2,z0+.24,0,sh,{t:.46,mk:'banco',socle:.85,socleMk:'rubble',madamik:true,flushOut:cliff});
  svNoWalk(()=>{
   for(let i=0;i<4;i++){
    const px=x0+.45+i*(Wd-.9)/3;
    box('rubble',px,0,zShed-.25,.58,.85,.58,P('rubble'));
    box('banco',px,.85,zShed-.25,.54,sh-.85,.54,P('banco'));
   }
   /* Stacked cut halite caravan slabs under the shed */
   for(const sx of [-3.2,0,3.2]){
    box('timber',sx,.08,(z0+zShed)/2,1.9,.1,1.4,P('timber'));
    for(let lv=0;lv<3;lv++){
     for(let c=0;c<3;c++)box('halite',sx-.55+c*.55,.18+lv*.3,((z0+zShed)/2),.48,.28,1.15,P('halite'));
    }
   }
  });
  const rY=dsRoof(x0,z0,x1,zShed,sh,{style:'village',cliffRear:cliff,walk:false});
  dsParapet(x0,z0,x1,zShed,rY,{style:'village',h:.54,cliffRear:cliff});
  FURNISH('job_salt_heap',-1.6,.08,zShed-.6,0,{setting:'outdoor'});
  FURNISH('job_salt_tub',1.6,.08,zShed-.6,0,{setting:'outdoor'});
  dsTarget(0,.08,zShed+.35,'salt pan causeway');
 }
});

/* 25. ds_vil_potter_kiln: Village Clay & Qadad Lime Updraught Kiln */
defBuilding({
 key:'ds_vil_potter_kiln',
 name:'Dasri clay and qadad-lime kiln',
 seed:8215,
 cls:'building',
 kind:'kiln',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('poor',['industry'],'kiln','pottery'),
 w:9.2,d:8.6,h:6.2,budget:28000,cut:false,
 front:{x:1.5,z:3.8,yaw:0},
 note:'Village circular mudbrick updraught kiln for firing water-cooling jars and burning qadad lime, paired with a white lime-slaking pit and a shaded potter bench.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=8.2,Dd=7.6,z0=cliff?-4.3:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble'});
  door(1.5,0,z1-.2,0,1.8,2.1);

  /* Battered circular mudbrick kiln on the west side (-x) */
  const kx=-1.95,kz=z0+3.1;
  svNoWalk(()=>{
   cyl('rubble',kx,0,kz,1.85,.75,P('rubble'),18);
   lathe('banco',kx,kz,[
    [1.82,.75],[1.68,2.1],[1.38,3.6],[.95,4.8],[.58,5.45]
   ],18,P('bancoD'));
   cyl('qadad',kx,5.42,kz,.62,.16,P('qadadWarm'),14);
   /* Glowing arched stoking mouth facing +z */
   box('rubble',kx,0,kz+1.75,1.05,1.05,.45,P('rubble'));
   sph('glow',kx,.42,kz+1.65,.18,new THREE.Color(1,.42,.1),.6,8);
   /* White qadad lime-slaking pit in front-left */
   box('rubble',kx,0,z1-1.35,2.2,.44,1.5,P('rubble'));
   box('qadad',kx,.36,z1-1.35,1.86,.08,1.16,P('qadad'));
  });
  haloAt(kx,.55,kz+1.85,0xff7a24,true);
  smokeAt(kx,5.65,kz,{r:.3,kind:'fire'});

  /* Rear-east potter & lime-beater work shelter */
  const sx0=.4,sz1=z0+4.5,sh=3.05;
  dsRing(sx0,z0,x1,sz1,0,sh,{
   t:.42,mk:'banco',socle:.75,socleMk:'rubble',cliffRear:cliff,skip:'s'
  });
  const rY=dsRoof(sx0,z0,x1,sz1,sh,{style:'village',cliffRear:cliff,walk:false});
  dsParapet(sx0,z0,x1,sz1,rY,{style:'village',h:.48,cliffRear:cliff});
  FURNISH('nomad_water_jars',2.1,.08,z0+2.2,0,{setting:'indoor'});
  FURNISH('generic_storage_jar',1.2,.08,z0+2.2,.4,{setting:'indoor'});
  FURNISH('generic_crock',2.8,.08,z1-1.5,0,{setting:'outdoor'});
  dsTarget(1.8,.08,z1-1.5,'kiln yard');
 }
});

/* 26. ds_vil_cliff_stair: Solid-Stone Canyon-Ledge Mule Stair & Retaining Terrace */
defBuilding({
 key:'ds_vil_cliff_stair',
 name:'Dasri stone canyon-ledge stair',
 seed:8216,
 cls:'building',
 kind:'stair',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('poor',['infrastructure'],'stair'),
 w:3.6,d:8.0,h:6.4,budget:18000,cut:false,
 front:{x:0,z:3.7,yaw:0},
 note:'Mortared desert-stone cliff stair climbing 5.5 m from a lower wadi ledge (+z) up to an upper bench landing (-z), flanked by a battered rubble parapet, rain runnel, and horn-capped milestone.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=3.2,Dd=7.6,rise=o.rise==null?5.5:o.rise,landD=1.6,run=Dd-landD;
  const z0=cliff?-4.0:-Dd/2,z1=z0+Dd;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble'});
  door(0,0,z1-.15,0,2.2,2.2);

  /* Solid walkable stone flight climbing toward -z (yaw = PI) up to height `rise` */
  svStair(0,z1,0,rise,PI,{style:'solid',w:2.35,run,riser:.21,mk:'rubble',col:P('rubble')});
  /* Upper landing block at rear (-z) */
  const lz=(z0+z0+landD)/2;
  svNoWalk(()=>box('rubble',0,0,lz,Wd,rise,landD,P('rubble')));
  box('ashlar',0,rise-.08,lz,Wd,.08,landD,P('ashlar'));

  /* Battered stepped side parapets + whitewashed horn milestone at the foot */
  svNoWalk(()=>{
   for(const sx of [-1,1]){
    beam('rubble',[sx*(Wd/2-.16),.45,z1-.2],[sx*(Wd/2-.16),rise+.55,z0+landD],.32,P('rubble'),false,0,.65);
    beam('qadad',[sx*(Wd/2-.16),.8,z1-.2],[sx*(Wd/2-.16),rise+.9,z0+landD],.34,P('qadadWarm'),false,0,.08);
   }
   /* Horn-tipped Dasri road marker at foot right */
   box('ashlar',Wd/2-.22,0,z1-.22,.42,1.15,.42,P('ashlar'));
   dsHornPinnacle(Wd/2-.22,1.15,z1-.22,0,.65,P('qadadWarm'));
  });
  dsTarget(0,rise,lz,'stair upper landing');
 }
});

/* 27. ds_vil_watch_post: Battered Cylindrical Mudbrick Oasis Watchtower (Burj) */
defBuilding({
 key:'ds_vil_watch_post',
 name:'Dasri battered mudbrick oasis watchtower (Burj)',
 seed:8217,
 cls:'building',
 kind:'tower',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('middle',['civic','infrastructure'],'watchtower'),
 w:6.6,d:6.6,h:11.2,budget:34000,cut:false,
 front:{x:0,z:2.75,yaw:0},
 note:'Tapering cylindrical zabur mudbrick desert watchtower (burj) on a battered rubble-stone base, ringed by madamik mud ridges, slit loopholes, timber mizab spouts, and stepped triangular crenellations.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const rBase=2.65,rTop=2.05,H=9.8,cz=cliff?-.55:0;
  dsPlinth(rBase*2+.4,rBase*2+.4,{cliff,lo:o.lo,register:'village',mk:'rubble'});

  /* Battered cylindrical tower shell + ground chamber doorway */
  svNoWalk(()=>{
   cyl('rubble',0,0,cz,rBase+.1,1.65,P('rubble'),20,rBase);
   cyl('banco',0,1.65,cz,rBase,H-1.65,P('banco'),20,rTop);
   /* Horizontal madamik mud rings + timber beam ends */
   for(let yy=2.5;yy<H-.6;yy+=1.15){
    const rr0=lerp(rBase,rTop,(yy-1.65)/(H-1.65))+.025;
    cyl('banco',0,yy,cz,rr0,.07,P('bancoL'),20);
   }
   /* Whitewashed top collar + triangular mudbrick crenellations (1a3c73c9.jpg drum tower!) */
   cyl('qadad',0,H-.18,cz,rTop+.05,.18,P('qadadWarm'),20);
   cyl('roof',0,H-.12,cz,rTop-.18,.12,P('roofVil'),18);
   const nMer=14;
   for(let k=0;k<nMer;k++){
    const a=k*TAU/nMer;
    if(cliff&&Math.sin(a)<-.82)continue;
    const mx=Math.cos(a)*(rTop-.12),mz=cz+Math.sin(a)*(rTop-.12);
    W(mx,H,mz,-a+PI/2,()=>{
     box('banco',0,0,0,.48,.58,.24,P('banco'));
     cone('qadad',0,.58,0,.22,.28,P('qadadWarm'),4);
    });
   }
   /* Loophole arrow slits around middle stage */
   for(let k=0;k<6;k++){
    const a=k*TAU/6;
    if(cliff&&Math.sin(a)<-.75)continue;
    const rr1=lerp(rBase,rTop,.55);
    W(Math.cos(a)*rr1,5.2,cz+Math.sin(a)*rr1,-a+PI/2,()=>{
     svPane(0,0,.02,0,.18,.78,{kind:'smoked',solid:true});
     box('qadad',0,.8,.03,.32,.08,.04,P('qadadWarm'));
    });
   }
  });
  dsVilDoor(0,0,cz+rBase-.04,0,1.05,1.95,{hollow:false,archEyebrow:true,name:'burj tower door'});
  /* Walkable stone doorstep apron so walk-reach connects street front cleanly to the burj threshold */
  box('rubble',0,0,cz+rBase+.32,2.1,.08,.95,P('rubble'));
  dsMizab(rTop-.05,H,.8,cz,PI/2,{wood:true,chute:false});
  FURNISH('nomad_brazier',0,H,cz,0,{setting:'outdoor'});
  haloAt(0,H+.6,cz,0xff862c,true);
  smokeAt(0,H+.8,cz,{r:.22,kind:'fire'});
  dsTarget(0,.08,cz+rBase+.32,'burj threshold');
 }
});

/* 28. ds_vil_oasis_qasr: Fortified Desert Oasis Qasr / Kasbah (Direct homage to 1a3c73c9.jpg — Arfwai!) */
defBuilding({
 key:'ds_vil_oasis_qasr',
 name:'Dasri fortified desert oasis qasr (Arfwai style)',
 seed:8218,
 cls:'building',
 kind:'qasr',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('rich',['civic','inn','infrastructure'],'qasr','trading'),
 w:24.4,d:23.0,h:12.6,budget:115000,cut:true,
 front:{x:0,z:10.0,yaw:0},
 note:'Fortified desert oasis kasbah (qasr, as kept by the Train of Jabal at Arfwai): battered zabur mudbrick curtain walls with triangular crenellations, prominent battered cylindrical corner drum tower, machicolated gatehouse, inner well court & twin mudbrick cistern/prayer domes.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=20.8,Dd=20.0,z0=cliff?-10.8:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble',anchorH:3.0});

  /* Battered outer curtain wall (5.8 m high) around courtyard */
  const cH=5.8,gw=2.45,ghDoor=2.65;
  dsRing(x0,z0,x1,z1,0,cH,{
   t:.58,mk:'banco',socle:1.25,socleMk:'rubble',madamik:true,cliffRear:cliff,
   holes:{
    s:[{at:Wd/2,w:gw,y:0,h:ghDoor},{at:Wd*.24,w:.32,y:3.4,h:.78},{at:Wd*.76,w:.32,y:3.4,h:.78}],
    e:[{at:Dd*.35,w:.32,y:3.4,h:.78},{at:Dd*.7,w:.32,y:3.4,h:.78}],
    w:[{at:Dd*.68,w:.32,y:3.4,h:.78}]
   }
  });
  dsParapet(x0,z0,x1,z1,cH,{style:'village',h:.72,crenel:true,cliffRear:cliff});

  /* Projecting gatehouse barbican on +z with overhead machicolation gallery (1a3c73c9.jpg foreground!) */
  svNoWalk(()=>{
   for(const sx of [-1,1])box('banco',sx*2.1,0,z1+.35,.95,cH+1.65,.78,P('banco'));
   box('banco',0,ghDoor+.35,z1+.35,5.15,cH+1.65-(ghDoor+.35),.78,P('banco'));
   box('qadad',0,cH+1.55,z1+.35,5.25,.12,.84,P('qadadWarm'));
   for(let i=0;i<6;i++)cone('qadad',-2.1+i*.84,cH+1.67,z1+.35,.18,.26,P('qadadWarm'),4);
   /* Machicolation slot box */
   box('banco',0,cH-.2,z1+.88,2.1,1.15,.42,P('bancoL'));
  });
  dsVilDoor(0,0,z1+.15,0,gw,ghDoor,{archEyebrow:true,name:'qasr fortress gate'});

  /* Prominent battered cylindrical corner drum tower at the front-west corner (-x, +z) — exact match to 1a3c73c9.jpg! */
  const tx=x0+.65,tz=z1-.65,tR0=3.15,tR1=2.55,tH=11.1;
  svNoWalk(()=>{
   cyl('rubble',tx,0,tz,tR0+.12,1.6,P('rubble'),22,tR0);
   cyl('banco',tx,1.6,tz,tR0,tH-1.6,P('banco'),22,tR1);
   for(let yy=2.8;yy<tH-.8;yy+=1.35){
    cyl('banco',tx,yy,tz,lerp(tR0,tR1,(yy-1.6)/(tH-1.6))+.03,.07,P('bancoL'),22);
   }
   cyl('qadad',tx,tH-.16,tz,tR1+.06,.16,P('qadadWarm'),22);
   for(let k=0;k<16;k++){
    const a=k*TAU/16;
    W(tx+Math.cos(a)*(tR1-.12),tH,tz+Math.sin(a)*(tR1-.12),-a+PI/2,()=>{
     box('banco',0,0,0,.5,.56,.24,P('banco'));
     cone('qadad',0,.56,0,.2,.26,P('qadadWarm'),4);
    });
   }
   /* Square bastion turret on front-east corner (+x, +z) */
   box('rubble',x1-.8,0,z1-.8,3.2,1.5,3.2,P('rubble'));
   box('banco',x1-.8,1.5,z1-.8,3.05,6.8,3.05,P('banco'));
  });
  dsParapet(x1-2.32,z1-2.32,x1+.72,z1+.72,8.3,{style:'village',h:.64,crenel:true});
  dsMizab(tx-tR1,tH,1.2,tz,-PI/2,{wood:true,chute:false});

  /* Inner courtyard: rear 3-storey keeper's residence (-z) + east domed cistern/shrine hall! */
  const zKeep=z0+6.0;
  dsSolidTier(x0+.5,z0+(cliff?0:.5),x1-.5,zKeep,0,6.4,{mk:'banco',madamik:true,cliffRear:cliff});
  for(const bx of [-5.5,-2.0,2.0,5.5]){
   dsVilWin(bx,4.0,zKeep,0,.62,.76,{solid:true,lit:true});
  }
  const kTop=dsRoof(x0+.5,z0+(cliff?0:.5),x1-.5,zKeep,6.4,{style:'village',cliffRear:cliff,walk:false});
  dsParapet(x0+.5,z0+(cliff?0:.5),x1-.5,zKeep,kTop,{style:'village',h:.62,cliffRear:cliff});
  /* Central 3rd-storey watch room on rear spine */
  dsSolidTier(-4.2,z0+(cliff?0:.6),4.2,zKeep-1.4,kTop,3.1,{mk:'banco',madamik:true,cliffRear:cliff});
  for(const bx of [-2.2,0,2.2])dsVilWin(bx,kTop+.88,zKeep-1.4,0,.64,.78,{solid:true,lit:bx===0});
  const kTop2=dsRoof(-4.2,z0+(cliff?0:.6),4.2,zKeep-1.4,kTop+3.1,{style:'village',cliffRear:cliff,walk:false});
  dsParapet(-4.2,z0+(cliff?0:.6),4.2,zKeep-1.4,kTop2,{style:'village',h:.68,crenel:true,cliffRear:cliff});

  /* Domed courtyard cistern/shrine hall on east side of inner court (echoing the central mudbrick domes of 1a3c73c9.jpg!) */
  const dx0=2.2,dx1=x1-.6,dz0=zKeep+.2,dz1=z1-4.2,dMidX=(dx0+dx1)/2,dMidZ=(dz0+dz1)/2;
  dsSolidTier(dx0,dz0,dx1,dz1,0,4.2,{mk:'banco',madamik:true});
  const dRoof=dsRoof(dx0,dz0,dx1,dz1,4.2,{style:'village',poles:false,walk:false});
  dsDome(dMidX-.4,dRoof,dMidZ-.8,2.15,2.25,{style:'village',drumH:.42,pegs:true});
  dsDome(dMidX+.9,dRoof,dMidZ+1.9,1.15,1.25,{style:'village',drumH:.26,pegs:true});

  /* Oasis courtyard well & caravan goods */
  svNoWalk(()=>{
   const wx=-2.8,wz=(zKeep+z1-2.5)/2;
   cyl('rubble',wx,0,wz,1.1,.78,P('rubble'),16);
   cyl('water',wx,.42,wz,.82,.04,new THREE.Color(.16,.42,.48),14);
  });
  FURNISH('nomad_camel_saddle_rack',-6.2,.08,0,PI/2,{setting:'outdoor'});
  FURNISH('nomad_supply_bales',-5.8,.08,3.2,.2,{setting:'outdoor'});
  FURNISH('job_salt_heap',-.2,.08,zKeep+1.4,0,{setting:'outdoor'});
  FURNISH('nomad_floor_lantern',0,.08,z1-3.2,0,{setting:'outdoor'});
  dsTarget(0,.08,z1-3.6,'qasr inner courtyard');
 }
});
