// prefix: ds
// ================================================================= URBAN JABAL TRADES & SOUQ: shops, salt wakala, brazier, bakery, weaver, spice khan ([draw])
// 6 urban commercial & craft defs (seeds 8111..8116):
//   ds_jabal_souq_row         3-bay vaulted ashlar souq arcade with striped awnings & 3 brick residential storeys above
//   ds_jabal_salt_warehouse   Train of Jabal salt & alkali factor's wakala with basalt damp-base & halite block stacks
//   ds_jabal_brazier          Copper/brass metalworker (nahhas) with hooded forge, bellows & upper residence
//   ds_jabal_bakery           Urban tannur bakery with twin clay bread ovens & flour store
//   ds_jabal_weaver_dyer      Weaver & indigo/saffron dyer with ground looms, dye vats & fluttering roof cloths
//   ds_jabal_spice_khan       Coffee, qishr & spice samsarah with recessed patio & mashrabiya upper rooms

/* Helper: striped Yemeni souq awning above ground-floor shop arches */
function dsAwning(x,y,zf,yaw,w,drop,proj,col){
 col=col==null?P('awning'):col;
 W(x,y,zf,yaw,()=>{
  svNoWalk(()=>{
   withCloth(clothHang(drop,.045),()=>{
    plane4('awning',[-w/2,0,.04],[w/2,0,.04],[-w/2,-drop*.55,proj],.024,col);
    /* Scalloped front valance */
    box('awning',0,-drop*.55-.1,proj,w,.18,.02,col);
   });
   for(const s of [-1,1]){
    pole('timber',[s*(w/2-.06),-.55,.04],[s*(w/2-.06),-drop*.55,proj-.04],.024,P('timber'),5);
   }
  });
 });
}

/* 6. ds_jabal_souq_row: 4-storey souq block (directly echoing 4ca4c9f8.jpg's 3-awning ground market under brick+gypsum tower!) */
defBuilding({
 key:'ds_jabal_souq_row',
 name:'Jabal souq arcade and flats (4 storeys)',
 seed:8111,
 cls:'building',
 kind:'shop',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('middle',['market','shop','dwelling-multi'],'souq','trading'),
 w:12.6,d:8.4,h:14.6,budget:68000,cut:true,
 front:{x:0,z:3.6,yaw:0},
 note:'Ground-floor 3-arch dressed sandstone souq arcade with striped canvas awnings, timber merchant counters, spice boxes & date baskets, topped by 3 Sanaa-style red-brick residential floors with chevron juss bands.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=11.6,Dd=7.2,z0=cliff?-4.2:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'ashlar'});

  /* Ground floor: 3 wide shop arches opening into a continuous vaulted souq gallery */
  const gh=3.65,bw=2.35,bh=2.45;
  const bxs=[-3.65,0,3.65];
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'ashlar',socle:.5,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:bxs.map(bx=>({at:bx-x0,w:bw,y:0,h:bh})),
    e:[{at:Dd*.5,w:1.1,y:0,h:2.1}],
    w:[{at:Dd*.5,w:.75,y:1.4,h:.95}]
   }
  });
  bxs.forEach((bx,i)=>{
   dsArchPortal(bx,0,z1,0,bw,bh,{
    stoneMk:'ashlar',ablaq:true,open:i!==1,split:true,
    name:i===1?'central souq shop shutter':'open souq arch'
   });
   dsAwning(bx,2.95,z1,0,bw+.85,.78,1.05,SVPAL.awning[i%SVPAL.awning.length]);
  });
  dsArchPortal(x1,0,(z0+z1)/2,PI/2,1.1,2.1,{stoneMk:'ashlar',name:'side lane door'});

  /* Shop counters & wares inside the souq bays */
  svNoWalk(()=>{
   for(const sx of [-3.65,3.65]){
    box('cedar',sx,0,z1-1.35,1.9,.82,.65,P('cedar'));
    box('ashlar',sx,.82,z1-1.35,2.0,.06,.72,P('ashlar'));
   }
  });
  FURNISH('generic_spice_box',-3.65,.88,z1-1.35,0,{setting:'indoor'});
  FURNISH('nomad_date_baskets',-2.4,.08,z1-1.1,.2,{setting:'indoor'});
  FURNISH('nomad_coffee_set',3.65,.88,z1-1.35,0,{setting:'indoor'});
  FURNISH('generic_crate',-4.5,.08,z0+1.1,0,{setting:'indoor'});
  FURNISH('nomad_kilim',0,.08,(z0+z1)/2,0,{setting:'indoor'});
  FURNISH_HANG('nomad_hanging_lantern',0,3.2,z1-1.2,0,{setting:'indoor'});
  dsTarget(0,.08,(z0+z1)/2,'souq gallery');
  dsJussRing(x0,z0,x1,z1,gh-.32,{h:.32,kind:'diamond',cliffRear:cliff});

  /* 3 upper red-brick storeys */
  let y=gh;
  for(let f=0;f<3;f++){
   const ins=(f+1)*.05,fh=3.1;
   dsTowerFloor(x0+ins,cliff?z0:z0+ins,x1-ins,z1-ins,y,fh,f,{
    cliffRear:cliff,bays:5,mashAt:f===1?2:-1
   });
   y+=fh;
  }
  const topY=dsRoof(x0+.18,cliff?z0:z0+.18,x1-.18,z1-.18,y,{style:'urban',walk:false});
  dsParapet(x0+.18,cliff?z0:z0+.18,x1-.18,z1-.18,topY,{style:'urban',h:.88,cliffRear:cliff});
  dsMizab(x0+.22,topY,.6,0,-PI/2,{});
 }
});

/* 7. ds_jabal_salt_warehouse: Train of Jabal Salt & Alkali Factor's Wakala */
defBuilding({
 key:'ds_jabal_salt_warehouse',
 name:'Train of Jabal salt factor warehouse',
 seed:8112,
 cls:'building',
 kind:'warehouse',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('middle',['industry','market'],'warehouse','salt'),
 w:13.4,d:11.6,h:12.8,budget:62000,cut:true,
 front:{x:-2.2,z:5.2,yaw:0},
 note:'Train of Jabal salt & alkali warehouse (wakala al-milh): heavy battered dark basalt lower walls against salt damp, twin loading arches, stacked cut halite slabs, weighing beam, and upper factor tally rooms.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=12.2,Dd=10.4,z0=cliff?-5.8:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'basalt'});

  /* Tall 4.2 m basalt salt-vault ground floor with twin arched loading bays */
  const gh=4.2,bw=2.1,bh=2.65;
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd*.32,w:bw,y:0,h:bh},{at:Wd*.68,w:bw,y:0,h:bh}],
    e:[{at:Dd*.5,w:.65,y:2.2,h:.85}],
    w:[{at:Dd*.5,w:.65,y:2.2,h:.85}]
   }
  });
  dsArchPortal(x0+Wd*.32,0,z1,0,bw,bh,{stoneMk:'ashlar',split:true,name:'salt vault west gate'});
  dsArchPortal(x0+Wd*.68,0,z1,0,bw,bh,{stoneMk:'ashlar',open:true,name:'salt loading arch'});

  /* Stacked crystalline cut halite blocks (rock.halite.cut!) + timber weighing steelyard */
  svNoWalk(()=>{
   for(let p=0;p<3;p++){
    const px=-3.8+p*3.8,pz=z0+2.4;
    box('timber',px,.08,pz,2.2,.12,1.6,P('timber'));
    for(let lv=0;lv<3;lv++){
     const nB=3-Math.floor(lv/2);
     for(let bi=0;bi<nB;bi++){
      box('halite',px-.65+bi*.65,.2+lv*.34,pz,.58,.32,1.25,P('halite'));
     }
    }
   }
   /* Hanging timber weighing balance inside right loading bay */
   const wx=x0+Wd*.68,wz=z1-1.9;
   pole('timber',[wx,2.9,wz],[wx,3.8,wz],.04,P('timber'),6);
   beam('cedar',[wx-.85,2.9,wz],[wx+.85,2.9,wz],.06,P('cedar'));
   for(const s of [-1,1]){
    pole('rope',[wx+s*.75,1.55,wz],[wx+s*.75,2.9,wz],.015,P('rope'),5);
    cyl('bronze',wx+s*.75,1.48,wz,.38,.06,P('bronze'),12);
   }
   box('halite',wx-.75,1.54,wz,.42,.26,.42,P('halite'));
  });
  FURNISH('job_salt_heap',2.6,.08,z1-2.2,0,{setting:'indoor'});
  FURNISH('job_salt_tub',-1.2,.08,z1-2.4,0,{setting:'indoor'});
  FURNISH('nomad_grain_sacks',4.4,.08,0,-.5,{setting:'indoor'});
  dsTarget(x0+Wd*.32,.08,(z0+z1)/2,'salt vault floor');
  dsJussRing(x0,z0,x1,z1,gh-.34,{h:.34,kind:'chevron',cliffRear:cliff});

  /* 2 stepped upper brick factor tally storeys (rear-high!) */
  const zMid=z0+Dd*.82;
  dsTowerFloor(x0+.12,cliff?z0:z0+.12,x1-.12,z1-.12,gh,3.3,0,{cliffRear:cliff,bays:4,mashAt:1});
  const t1=dsRoof(x0+.12,cliff?z0:z0+.12,x1-.12,z1-.12,gh+3.3,{style:'urban',walk:false});
  dsParapet(x0+.12,zMid-.1,x1-.12,z1-.12,t1,{style:'urban',h:.82,skip:'n'});

  dsTowerFloor(x0+.8,cliff?z0:z0+.2,x1-.8,zMid,t1,3.25,1,{cliffRear:cliff,bays:3,mashAt:-1});
  const t2=dsRoof(x0+.8,cliff?z0:z0+.2,x1-.8,zMid,t1+3.25,{style:'urban',walk:false});
  dsParapet(x0+.8,cliff?z0:z0+.2,x1-.8,zMid,t2,{style:'urban',h:.85,cliffRear:cliff});
  dsMizab(x1-.18,t1,.5,z1-2.0,PI/2,{});
 }
});

/* 8. ds_jabal_brazier: Copper & Brass Metalworker (Nahhas) */
defBuilding({
 key:'ds_jabal_brazier',
 name:'Jabal copper and brass brazier',
 seed:8113,
 cls:'building',
 kind:'smithy',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('middle',['industry','shop'],'brazier','smithing'),
 w:9.4,d:8.8,h:12.4,budget:52000,cut:true,
 front:{x:-1.4,z:3.8,yaw:0},
 note:'Urban Jabal copper and brass smithy (nahhas): wide stone-arched ground workshop with hooded brick forge, glowing embers, bellows, displayed brass trays and lanterns, and 2 brick residential storeys above.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=8.4,Dd=7.6,z0=cliff?-4.4:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'basalt'});

  const gh=3.65;
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'basalt',socle:.55,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd*.34,w:1.85,y:0,h:2.4},{at:Wd*.76,w:1.15,y:0,h:2.15}],
    e:[{at:Dd*.5,w:.65,y:1.6,h:.85}],
    w:[{at:Dd*.5,w:.65,y:1.6,h:.85}]
   }
  });
  dsArchPortal(x0+Wd*.34,0,z1,0,1.85,2.4,{stoneMk:'ashlar',open:true,name:'brazier workshop arch'});
  dsArchPortal(x0+Wd*.76,0,z1,0,1.15,2.15,{stoneMk:'ashlar',name:'brazier house door'});
  dsAwning(x0+Wd*.34,2.85,z1,0,2.45,.72,.95,SVPAL.awning[2]);

  /* Brick forge hearth, hood, flue chimney & brassware display counter */
  const fx=-1.8,fz=z0+1.55;
  svNoWalk(()=>{
   box('brick',fx,0,fz,1.65,.88,1.25,P('brickD'));
   box('basalt',fx,.88,fz,1.4,.12,1.05,P('basalt'));
   for(let i=0;i<3;i++)sph('glow',fx-.22+i*.22,1.04,fz+.1,.08,new THREE.Color(1,.42,.1),.6,6);
   prism('qadad',[[fx-.85,fz-.6],[fx+.85,fz-.6],[fx+.55,fz+.5],[fx-.55,fz+.5]],1.75,2.65,P('qadadWarm'));
   box('brick',fx,2.65,fz-.15,.62,9.2,.62,P('brickD'));
   cyl('qadad',fx,11.85,fz-.15,.36,.42,P('qadad'),10,.26);
   /* Brassware display bench by the street arch */
   box('cedar',-.2,0,z1-1.3,1.55,.78,.58,P('cedar'));
   for(let k=0;k<3;k++)cyl('bronze',-.52+k*.52,.78,z1-1.3,.2,.04,P('bronze'),12);
   /* Anvil on timber block */
   cyl('timber',-1.4,0,z1-2.4,.28,.58,P('timber'),10);
   box('iron',-1.4,.58,z1-2.4,.48,.24,.2,P('iron'));
  });
  haloAt(fx,1.15,fz+.1,0xff7a28,true);
  smokeAt(fx,12.3,fz-.15,{r:.24,kind:'fire'});
  FURNISH('nomad_bellows',fx+1.1,.08,fz+.2,-PI/2,{setting:'indoor'});
  FURNISH('nomad_brazier',1.8,.08,z1-1.6,0,{setting:'indoor'});
  FURNISH_HANG('nomad_hanging_lantern',-1.4,2.8,z1-1.1,0,{setting:'indoor'});
  dsTarget(x0+Wd*.34,.08,(z0+z1)/2+.6,'brazier workshop');
  dsJussRing(x0,z0,x1,z1,gh-.32,{h:.32,kind:'chevron',cliffRear:cliff});

  let y=gh;
  for(let f=0;f<2;f++){
   const ins=(f+1)*.06,fh=3.2;
   dsTowerFloor(x0+ins,cliff?z0:z0+ins,x1-ins,z1-ins,y,fh,f,{cliffRear:cliff,bays:3,mashAt:f===1?1:-1});
   y+=fh;
  }
  const topY=dsRoof(x0+.14,cliff?z0:z0+.14,x1-.14,z1-.14,y,{style:'urban',walk:false});
  dsParapet(x0+.14,cliff?z0:z0+.14,x1-.14,z1-.14,topY,{style:'urban',h:.85,cliffRear:cliff});
 }
});

/* 9. ds_jabal_bakery: Urban Tannur Bakery & Grain Mill */
defBuilding({
 key:'ds_jabal_bakery',
 name:'Jabal tannur bakery (3 storeys)',
 seed:8114,
 cls:'building',
 kind:'bakery',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('poor',['industry','shop'],'bakery','baking'),
 w:8.8,d:8.6,h:11.8,budget:48000,cut:true,
 front:{x:0,z:3.7,yaw:0},
 note:'Urban Jabal tannur bread-house: wide dressed-ashlar arch opening onto twin domed clay tannur ovens, wooden bread counter, flour sacks & grain quern, with 2 brick-and-gypsum storeys above.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=7.8,Dd=7.4,z0=cliff?-4.3:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'ashlar'});

  const gh=3.55;
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'ashlar',socle:.5,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd*.5,w:2.1,y:0,h:2.4}],
    e:[{at:Dd*.5,w:1.05,y:0,h:2.05}],
    w:[{at:Dd*.5,w:.62,y:1.55,h:.85}]
   }
  });
  dsArchPortal(0,0,z1,0,2.1,2.4,{stoneMk:'ashlar',open:true,name:'bakery shopfront arch'});
  dsArchPortal(x1,0,(z0+z1)/2,PI/2,1.05,2.05,{stoneMk:'ashlar',name:'baker side door'});
  dsAwning(0,2.85,z1,0,2.65,.75,1.0,SVPAL.awning[0]);

  /* Twin clay beehive tannur bread ovens + chimney + counter */
  const oz=z0+1.55;
  svNoWalk(()=>{
   box('brick',0,0,oz,3.4,.62,1.35,P('brick'));
   for(const sx of [-.9,.9]){
    lathe('banco',sx,oz,[[.62,.62],[.58,1.05],[.36,1.45],[.18,1.62]],14,P('bancoL'));
    sph('glow',sx,.82,oz+.12,.09,new THREE.Color(1,.45,.12),.6,6);
   }
   box('brick',0,1.6,oz-.2,.58,9.6,.58,P('brickD'));
   cyl('qadad',0,11.2,oz-.2,.34,.38,P('qadad'),10,.24);
   box('cedar',-1.45,0,z1-1.25,1.5,.8,.58,P('cedar'));
  });
  haloAt(0,.95,oz+.2,0xff8230,true);
  smokeAt(0,11.6,oz-.2,{r:.24,kind:'fire'});
  FURNISH('generic_bread_basket',-1.45,.8,z1-1.25,0,{setting:'indoor'});
  FURNISH('generic_bread',-.95,.8,z1-1.25,.3,{setting:'indoor'});
  FURNISH('nomad_saj_oven',1.65,.08,z1-1.5,0,{setting:'indoor'});
  FURNISH('nomad_grain_sacks',-2.4,.08,0,PI/2,{setting:'indoor'});
  FURNISH('nomad_quern',2.3,.08,0,-PI/2,{setting:'indoor'});
  dsTarget(0,.08,(z0+z1)/2+.5,'bakery floor');
  dsJussRing(x0,z0,x1,z1,gh-.3,{h:.3,kind:'diamond',cliffRear:cliff});

  let y=gh;
  for(let f=0;f<2;f++){
   const ins=(f+1)*.06,fh=3.05;
   dsTowerFloor(x0+ins,cliff?z0:z0+ins,x1-ins,z1-ins,y,fh,f,{cliffRear:cliff,bays:3,mashAt:-1});
   y+=fh;
  }
  const topY=dsRoof(x0+.14,cliff?z0:z0+.14,x1-.14,z1-.14,y,{style:'urban',walk:false});
  dsParapet(x0+.14,cliff?z0:z0+.14,x1-.14,z1-.14,topY,{style:'urban',h:.82,cliffRear:cliff});
 }
});

/* 10. ds_jabal_weaver_dyer: Weaver & Indigo/Saffron Dyer's House (4 storeys, stepped dye-drying roof!) */
defBuilding({
 key:'ds_jabal_weaver_dyer',
 name:'Jabal weaver and dyer house (4 storeys)',
 seed:8115,
 cls:'building',
 kind:'weaver',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('middle',['industry','shop'],'weaver','weaving'),
 w:10.2,d:9.6,h:14.2,budget:58000,cut:true,
 front:{x:-1.5,z:4.2,yaw:0},
 note:'4-storey Jabal cloth-weaver and indigo/saffron dyer: arched ground loom room, stone dye-vat alcove on the side court, and stepped qadad roof terraces strung with dyed cloth strips fluttering in the breeze.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=9.2,Dd=8.4,z0=cliff?-4.8:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'ashlar'});

  const gh=3.55;
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'ashlar',socle:.55,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd*.34,w:1.55,y:0,h:2.3},{at:Wd*.74,w:.85,y:1.35,h:1.0}],
    e:[{at:Dd*.5,w:1.2,y:0,h:2.15}],
    w:[{at:Dd*.5,w:.7,y:1.5,h:.95}]
   }
  });
  dsArchPortal(x0+Wd*.34,0,z1,0,1.55,2.3,{stoneMk:'ashlar',split:true,name:'weaver shop door'});
  dsArchPortal(x1,0,(z0+z1)/2,PI/2,1.2,2.15,{stoneMk:'ashlar',open:true,name:'dye vat arch'});
  dsQamariyaWin(x0+Wd*.74,1.35,z1,0,.85,1.0,{solid:false});

  /* Stone circular dye vats (indigo, madder crimson, saffron gold) inside east bay */
  const dyeCols=[0x1f3f74,0xa22c28,0xd08c1e];
  svNoWalk(()=>{
   for(let i=0;i<3;i++){
    const vz=z0+1.9+i*2.1,vx=x1-1.35;
    cyl('basalt',vx,0,vz,.58,.68,P('basalt'),14);
    cyl('qadad',vx,.04,vz,.46,.58,P('qadadWarm'),12);
    cyl('plain',vx,.56,vz,.45,.04,hc(dyeCols[i]),12);
   }
  });
  FURNISH('nomad_ground_loom',-1.6,.08,0,0,{setting:'indoor'});
  FURNISH('nomad_spindle_basket',-.2,.08,1.4,0,{setting:'indoor'});
  FURNISH('job_bales',-2.8,.08,z0+1.4,.3,{setting:'indoor'});
  dsTarget(x0+Wd*.34,.08,(z0+z1)/2,'weaver hall');
  dsJussRing(x0,z0,x1,z1,gh-.32,{h:.32,kind:'chevron',cliffRear:cliff});

  /* 2 full brick storeys + stepped 4th rear storey so front half is an open drying roof terrace! */
  let y=gh;
  for(let f=0;f<2;f++){
   const ins=(f+1)*.05,fh=3.05;
   dsTowerFloor(x0+ins,cliff?z0:z0+ins,x1-ins,z1-ins,y,fh,f,{cliffRear:cliff,bays:4,mashAt:f===1?1:-1});
   y+=fh;
  }
  const rx0=x0+.14,rx1=x1-.14,rz0=cliff?z0:z0+.14,rz1=z1-.14;
  const terrY=dsRoof(rx0,rz0,rx1,rz1,y,{style:'urban',walk:false});
  const zStep=rz0+(rz1-rz0)*.52;
  dsParapet(rx0,zStep-.1,rx1,rz1,terrY,{style:'urban',h:.85,skip:'n'});

  /* Dyed cloth bolts hanging on juniper drying racks across the front roof terrace! */
  svNoWalk(()=>{
   const cy=(zStep+rz1)/2;
   for(const sx of [-1,1]){
    pole('timber',[sx*3.2,terrY,cy-.9],[sx*3.2,terrY+2.05,cy-.9],.05,P('timber'),6);
    pole('timber',[sx*3.2,terrY,cy+.9],[sx*3.2,terrY+2.05,cy+.9],.05,P('timber'),6);
   }
   for(const dz of [-.9,0,.9]){
    pole('timber',[-3.3,terrY+1.98,cy+dz],[3.3,terrY+1.98,cy+dz],.038,P('timber'),6);
   }
   for(let k=0;k<4;k++){
    const lx=-2.4+k*1.6,dc=SVPAL.dye[k%SVPAL.dye.length];
    W(lx,terrY+1.96,cy+(k%2===0?-.9:.9),0,()=>{
     withCloth(clothHang(1.35,.07),()=>{
      plane4('awning',[-.52,0,0],[.52,0,0],[-.52,-1.35,.04],.018,dc);
     });
    });
   }
  });

  /* Rear 4th storey */
  dsTowerFloor(rx0+.2,rz0,rx1-.2,zStep,terrY,3.1,2,{cliffRear:cliff,bays:3,mashAt:-1});
  const top2=dsRoof(rx0+.2,rz0,rx1-.2,zStep,terrY+3.1,{style:'urban',walk:false});
  dsParapet(rx0+.2,rz0,rx1-.2,zStep,top2,{style:'urban',h:.84,cliffRear:cliff});
 }
});

/* 11. ds_jabal_spice_khan: Coffee, Qishr & Spice Khan (Samsarah) */
defBuilding({
 key:'ds_jabal_spice_khan',
 name:'Jabal coffee and spice samsarah (4 storeys)',
 seed:8116,
 cls:'building',
 kind:'inn',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('rich',['inn','tavern','market'],'samsarah','trading'),
 w:12.0,d:11.2,h:15.6,budget:76000,cut:true,
 front:{x:0,z:5.0,yaw:0},
 note:'4-storey Jabal coffee, qishr and spice khan (samsarah): dressed ablaq stone gateway into a recessed ground patio with coffee hearth, low tables & spice chests, under 3 brick lodging floors with twin mashrabiya bays.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=10.8,Dd=10.0,z0=cliff?-5.6:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'basalt'});

  const gh=3.75,dw=2.15,dh=2.55;
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'ashlar',socle:.65,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd/2,w:dw,y:0,h:dh},{at:Wd*.18,w:.82,y:1.45,h:1.0},{at:Wd*.82,w:.82,y:1.45,h:1.0}],
    e:[{at:Dd*.35,w:.78,y:1.5,h:.95},{at:Dd*.7,w:.78,y:1.5,h:.95}],
    w:[{at:Dd*.35,w:.78,y:1.5,h:.95},{at:Dd*.7,w:.78,y:1.5,h:.95}]
   }
  });
  dsArchPortal(0,0,z1,0,dw,dh,{stoneMk:'ashlar',ablaq:true,split:true,name:'samsarah courtyard gate'});
  for(const sx of [-1,1])dsQamariyaWin(sx*Wd*.32,1.45,z1,0,.82,1.0,{solid:false});
  FURNISH('nomad_coffee_hearth',0,.08,z0+1.8,0,{setting:'indoor'});
  for(const sx of [-1,1]){
   FURNISH('nomad_kilim',sx*2.6,.08,0,PI/2,{setting:'indoor'});
   FURNISH('nomad_low_table',sx*2.5,.08,0,0,{setting:'indoor'});
   FURNISH('nomad_tea_set',sx*2.5,.08+svfH('nomad_low_table',0,.4),0,0,{setting:'indoor'});
   FURNISH('nomad_floor_cushion',sx*3.4,.08,-.6,sx>0?-PI/2:PI/2,{setting:'indoor'});
   FURNISH('nomad_floor_cushion',sx*3.4,.08,.6,sx>0?-PI/2:PI/2,{setting:'indoor'});
  }
  FURNISH('generic_spice_box',-2.6,.08,z0+1.5,0,{setting:'indoor'});
  FURNISH_HANG('nomad_lantern_cluster',0,3.3,(z0+z1)/2,0,{setting:'indoor'});
  haloAt(0,1.1,z0+1.8,0xff9438,true);
  dsTarget(0,.08,(z0+z1)/2,'samsarah lounge');
  dsJussRing(x0,z0,x1,z1,gh-.34,{h:.34,kind:'diamond',cliffRear:cliff});

  /* 3 upper storeys: floors 2 & 3 full, floor 4 rear-stepped */
  let y=gh;
  for(let f=0;f<2;f++){
   const ins=(f+1)*.06,fh=3.18;
   dsTowerFloor(x0+ins,cliff?z0:z0+ins,x1-ins,z1-ins,y,fh,f,{
    cliffRear:cliff,bays:5,mashAt:f===0?1:3,sideMash:true,sideMashFloor:1
   });
   y+=fh;
  }
  const rx0=x0+.18,rx1=x1-.18,rz0=cliff?z0:z0+.18,rz1=z1-.18;
  const terrY=dsRoof(rx0,rz0,rx1,rz1,y,{style:'urban',walk:false});
  const mz1=rz0+(rz1-rz0)*.66;
  dsParapet(rx0,mz1-.1,rx1,rz1,terrY,{style:'urban',h:.88,skip:'n'});
  dsMafraj(rx0+.3,rz0,rx1-.3,mz1,terrY,{h:3.45,cliffRear:cliff,hollow:true});
  dsMizab(rx1-.1,terrY,.5,1.2,PI/2,{});
 }
});
