// prefix: ds
// ================================================================= URBAN JABAL CIVIC & LANDMARKS ([draw])
// 5 monumental Jabal defs (seeds 8121..8125):
//   ds_jabal_caravanserai    Train of Jabal Salt Caravanserai / Funduq (courtyard compound, salt bales, galleried tiers)
//   ds_jabal_rock_palace     Sheikh's Rock-Palace / Mafraj Citadel (Dar al-Hajar homage: basalt bastion + stepped brick wings)
//   ds_jabal_hammam_cistern  Qadad-waterproofed sunken Birka Cistern & Multi-Domed Hammam Bathhouse (stained-glass oculi)
//   ds_jabal_bazaar_gate     Bab al-Jabal Fortified Bazaar Gate (twin basalt+brick towers, walkable arch, qamariya gallery)
//   ds_jabal_call_tower      Sana'a-style Fluted Brick-and-Gypsum Watch / Caravan Call Tower (balcony + qadad dome)

/* 12. ds_jabal_caravanserai: Train of Jabal Salt Caravanserai / Funduq */
defBuilding({
 key:'ds_jabal_caravanserai',
 name:'Train of Jabal salt caravanserai (Funduq)',
 seed:8121,
 cls:'building',
 kind:'caravanserai',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('rich',['inn','market','civic'],'funduq','trading'),
 w:22.0,d:22.0,h:18.5,budget:150000,cut:true,
 front:{x:0,z:10.3,yaw:0},
 note:'Headquarters funduq of the Train of Jabal salt-caravan guild: battered basalt-and-ashlar fortified perimeter, monumental ablaq gatehouse, open central camel court with stone trough & stacked salt slabs, surrounded by 3-storey brick-and-gypsum lodging wings stepping up to the guildmaster mafraj.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=20.6,Dd=20.4,z0=cliff?-11.0:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'basalt',anchorH:3.2});

  /* Outer 4.0 m stone compound ring with monumental front gatehouse (+z) */
  const gh=4.0,gw=2.8,ghDoor=3.0;
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'basalt',socle:.85,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd/2,w:gw,y:0,h:ghDoor},{at:Wd*.2,w:.65,y:2.0,h:.9},{at:Wd*.8,w:.65,y:2.0,h:.9}],
    e:[{at:Dd*.28,w:.65,y:2.0,h:.9},{at:Dd*.72,w:.65,y:2.0,h:.9}],
    w:[{at:Dd*.28,w:.65,y:2.0,h:.9},{at:Dd*.72,w:.65,y:2.0,h:.9}]
   }
  });
  /* Projecting ablaq stone pishtaq gate frame on +z */
  svNoWalk(()=>{
   for(const sx of [-1,1])box('ashlar',sx*2.15,0,z1+.18,.95,gh+1.6,.42,P('ashlar'));
   box('ashlar',0,gh-.2,z1+.18,5.25,1.8,.42,P('ashlar'));
   dsJussFace(5.1,gh+1.15,z1+.4,0,{h:.34,kind:'diamond'});
   for(const sx of [-1,1])dsHornPinnacle(sx*2.4,gh+1.6,z1+.2,0,.95,P('qadad'));
  });
  dsArchPortal(0,0,z1+.08,0,gw,ghDoor,{stoneMk:'ashlar',ablaq:true,split:true,name:'funduq caravan gate'});
  for(const sx of [-1,1])dsQamariyaWin(sx*Wd*.3,2.0,z1,0,.65,.9,{solid:false});

  /* Inner open courtyard [cx0..cx1, cz0..cz1] surrounded by 3.6 m deep perimeter wings */
  const wd=3.6,cx0=x0+wd,cx1=x1-wd,cz0=z0+wd+.6,cz1=z1-wd;
  /* Ground arcade piers around the inner courtyard */
  svNoWalk(()=>{
   for(let i=0;i<=3;i++){
    const px=cx0+i*(cx1-cx0)/3,pz=cz0+i*(cz1-cz0)/3;
    for(const zz of [cz0,cz1])box('ashlar',px,0,zz,.52,gh,.52,P('ashlar'));
    for(const xx of [cx0,cx1])box('ashlar',xx,0,pz,.52,gh,.52,P('ashlar'));
   }
   /* Central stone camel-watering birka trough + halite cargo stacks */
   box('ashlar',0,0,(cz0+cz1)/2,3.4,.62,1.65,P('ashlar'));
   box('qadad',0,.06,(cz0+cz1)/2,3.0,.52,1.25,P('qadad'));
   box('water',0,.52,(cz0+cz1)/2,2.92,.04,1.18,new THREE.Color(.22,.46,.5));
   /* Cut salt blocks ready for caravan loading */
   for(const sx of [-1,1]){
    box('timber',sx*4.2,.08,cz0+1.4,1.8,.1,1.3,P('timber'));
    for(let r=0;r<2;r++)for(let c=0;c<3;c++)box('halite',sx*4.2-.52+c*.52,.18+r*.32,cz0+1.4,.48,.3,1.05,P('halite'));
   }
  });
  FURNISH('nomad_camel_saddle_rack',-4.4,.08,cz1-1.2,0,{setting:'outdoor'});
  FURNISH('nomad_supply_bales',4.4,.08,cz1-1.2,-.3,{setting:'outdoor'});
  FURNISH('job_salt_heap',-4.2,.08,0,0,{setting:'outdoor'});
  FURNISH('nomad_floor_lantern',-2.0,.08,(cz0+cz1)/2,0,{setting:'outdoor'});
  FURNISH('nomad_floor_lantern',2.0,.08,(cz0+cz1)/2,0,{setting:'outdoor'});
  dsTarget(0,.08,cz1-1.6,'funduq courtyard');
  dsTarget(0,.08,cz0+1.6,'funduq north arcade');
  dsJussRing(x0,z0,x1,z1,gh-.34,{h:.34,kind:'chevron',cliffRear:cliff});

  /* Upper brick wings around the courtyard: 2 storeys on front/sides (+z, +x, -x), 3 storeys + mafraj on rear (-z)! */
  /* Front wing (split by gatehouse crown or continuous gallery) */
  for(let f=0;f<2;f++){
   const yy=gh+f*3.05;
   /* Rear wing (-z): full width, rises 3 upper storeys */
   dsTowerFloor(x0+.1,z0+(cliff?0:.1),x1-.1,cz0,yy,3.05,f,{cliffRear:cliff,bays:6,mashAt:f===1?2:-1});
   /* East & West wings */
   dsSolidTier(cx1,cz0,x1-.1,cz1,yy,3.05,{mk:'brick'});
   dsSolidTier(x0+.1,cz0,cx0,cz1,yy,3.05,{mk:'brick'});
   for(let j=0;j<3;j++){
    const wz=cz0+1.8+j*(cz1-cz0-3.6)/2;
    dsQamariyaWin(x1-.1,yy+.58,wz,PI/2,.82,1.1,{solid:true,lit:(j+f)%2===0});
    dsQamariyaWin(x0+.1,yy+.58,wz,-PI/2,.82,1.1,{solid:true,lit:(j+f)%2===1});
    dsQamariyaWin(cx1,yy+.58,wz,-PI/2,.78,1.05,{solid:true,lit:true,shutters:false});
    dsQamariyaWin(cx0,yy+.58,wz,PI/2,.78,1.05,{solid:true,lit:true,shutters:false});
   }
   dsJussRing(cx1,cz0,x1-.1,cz1,yy+2.71,{h:.32,kind:'chevron',skip:'ns'});
   dsJussRing(x0+.1,cz0,cx0,cz1,yy+2.71,{h:.32,kind:'chevron',skip:'ns'});
   if(f===0){
    /* Front (+z) 2nd storey flanking the gatehouse */
    for(const sx of [-1,1]){
     const fx0=sx<0?x0+.1:2.65,fx1=sx<0?-2.65:x1-.1;
     dsSolidTier(fx0,cz1,fx1,z1-.1,yy,3.05,{mk:'brick'});
     dsQamariyaWin((fx0+fx1)/2-1.1,yy+.58,z1-.1,0,.82,1.1,{solid:true,lit:true});
     dsQamariyaWin((fx0+fx1)/2+1.1,yy+.58,z1-.1,0,.82,1.1,{solid:true});
     dsJussRing(fx0,cz1,fx1,z1-.1,yy+2.71,{h:.32,kind:'chevron'});
     const ft=dsRoof(fx0,cz1,fx1,z1-.1,yy+3.05,{style:'urban',walk:false});
     dsParapet(fx0,cz1,fx1,z1-.1,ft,{style:'urban',h:.82});
    }
   }
  }
  const sideTop=gh+6.1;
  for(const [sx0,sx1] of [[cx1,x1-.1],[x0+.1,cx0]]){
   const rt=dsRoof(sx0,cz0,sx1,cz1,sideTop,{style:'urban',walk:false});
   dsParapet(sx0,cz0,sx1,cz1,rt,{style:'urban',h:.84,skip:'n'});
  }
  /* 3rd upper storey on the rear spine + guildmaster mafraj */
  dsTowerFloor(x0+.8,z0+(cliff?0:.14),x1-.8,cz0,sideTop,3.05,2,{cliffRear:cliff,bays:5,mashAt:2});
  const rearTop=dsRoof(x0+.8,z0+(cliff?0:.14),x1-.8,cz0,sideTop+3.05,{style:'urban',walk:false});
  dsParapet(x0+.8,z0+(cliff?0:.14),x1-.8,cz0,rearTop,{style:'urban',h:.86,cliffRear:cliff});
  dsMafraj(-4.2,z0+(cliff?0:.22),4.2,cz0-.35,rearTop,{h:3.3,cliffRear:cliff,hollow:false});
 }
});

/* 13. ds_jabal_rock_palace: Sheikh's Rock-Palace / Mafraj Citadel (Direct Dar al-Hajar homage: 21ddcf17.jpg & 4630920a.jpg!) */
defBuilding({
 key:'ds_jabal_rock_palace',
 name:'Sheikh of Jabal rock-palace and mafraj citadel',
 seed:8122,
 cls:'building',
 kind:'palace',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('rich',['civic','dwelling-multi'],'palace'),
 w:18.4,d:20.0,h:25.8,budget:165000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 note:'Seat of the Sheikh of Jabal (inspired directly by Dar al-Hajar in Wadi Dhar): massive coursed dark-basalt lower bastion with curved/stepped crenelated terrace parapet, asymmetric red-brick wings richly laced in white juss chevrons & triple qamariya arches, projecting mashrabiya loggias, and a crowning horned council mafraj.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=17.0,Dd=18.6,z0=cliff?-10.0:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'basalt',anchorH:4.2});

  /* ---- Level 1 (0..4.4 m): Massive battered basalt & buff ashlar citadel bastion ---- */
  const bH=4.4,dw=2.1,dh=2.65;
  dsRing(x0,z0,x1,z1,0,bH,{
   mk:'basalt',socle:1.1,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd/2,w:dw,y:0,h:dh},{at:Wd*.22,w:.75,y:1.9,h:1.05},{at:Wd*.78,w:.75,y:1.9,h:1.05}],
    e:[{at:Dd*.35,w:.75,y:1.95,h:1.0},{at:Dd*.68,w:.75,y:1.95,h:1.0}],
    w:[{at:Dd*.35,w:.75,y:1.95,h:1.0},{at:Dd*.68,w:.75,y:1.95,h:1.0}]
   }
  });
  dsArchPortal(0,0,z1,0,dw,dh,{stoneMk:'ashlar',ablaq:true,split:true,name:'palace citadel gate'});
  for(const sx of [-1,1])dsQamariyaWin(sx*Wd*.28,1.9,z1,0,.75,1.05,{solid:false});
  FURNISH('nomad_kilim',0,.08,(z0+z1)/2,0,{setting:'indoor'});
  FURNISH('nomad_spear_rack',-4.2,.08,z1-1.6,0,{setting:'indoor'});
  FURNISH('nomad_spear_rack',4.2,.08,z1-1.6,0,{setting:'indoor'});
  FURNISH('nomad_brazier',0,.08,(z0+z1)/2-1.8,0,{setting:'indoor'});
  FURNISH_HANG('nomad_lantern_cluster',0,3.8,(z0+z1)/2,0,{setting:'indoor'});
  dsTarget(0,.08,(z0+z1)/2+2.0,'palace guard hall');

  dsJussRing(x0,z0,x1,z1,bH-.36,{h:.36,kind:'chevron',cliffRear:cliff});
  const bastTop=dsRoof(x0,z0,x1,z1,bH,{style:'urban',walk:false});
  /* Iconic Dar al-Hajar white pierced battlement terrace around the front & west bastion! */
  const w1x0=-5.2,w1x1=7.8,w1z1=z0+Dd*.74;
  dsParapet(x0,z0,x1,z1,bastTop,{style:'urban',h:1.02,cliffRear:cliff,hornScale:1.1});

  /* ---- Level 2..3 (4.62..11.0 m): Asymmetric stepped middle palace block + west stone keep ---- */
  /* West basalt shoulder turret (like Dar al-Hajar's left stone buttress tower!) */
  dsSolidTier(x0+.3,z0+(cliff?0:.3),w1x0+.4,z0+Dd*.58,bastTop,5.6,{mk:'basalt',cliffRear:cliff});
  dsJussRing(x0+.3,z0+(cliff?0:.3),w1x0+.4,z0+Dd*.58,bastTop+5.24,{h:.34,kind:'chevron',cliffRear:cliff});
  const westTop=dsRoof(x0+.3,z0+(cliff?0:.3),w1x0+.4,z0+Dd*.58,bastTop+5.6,{style:'urban',walk:false});
  dsParapet(x0+.3,z0+(cliff?0:.3),w1x0+.4,z0+Dd*.58,westTop,{style:'urban',h:.9,cliffRear:cliff});

  /* Main stepped brick reception block (2 floors) */
  for(let f=0;f<2;f++){
   const fh=3.2,yy=bastTop+f*fh;
   dsTowerFloor(w1x0,z0+(cliff?0:.25),w1x1,w1z1,yy,fh,f,{
    cliffRear:cliff,bays:4,mashAt:f===1?1:-1,sideMash:true,sideMashFloor:1
   });
  }
  const midTop=dsRoof(w1x0,z0+(cliff?0:.25),w1x1,w1z1,bastTop+6.4,{style:'urban',walk:false});
  const w2z1=z0+Dd*.52;
  dsParapet(w1x0,w2z1-.1,w1x1,w1z1,midTop,{style:'urban',h:.94,skip:'n'});

  /* ---- Level 4..6 (11.24..20.8 m): High sovereign red-brick keep on the rear spine ---- */
  const kX0=-5.8,kX1=5.8;
  for(let f=0;f<3;f++){
   const ins=f*.06,fh=3.18,yy=midTop+f*fh;
   dsTowerFloor(kX0+ins,z0+(cliff?0:.25+ins),kX1-ins,w2z1-ins,yy,fh,f+2,{
    cliffRear:cliff,bays:4,mashAt:f===1?2:-1
   });
  }
  const keepTop=dsRoof(kX0+.12,z0+(cliff?0:.37),kX1-.12,w2z1-.12,midTop+9.54,{style:'urban',walk:false});
  dsParapet(kX0+.12,z0+(cliff?0:.37),kX1-.12,w2z1-.12,keepTop,{style:'urban',h:.92,cliffRear:cliff,hornScale:1.1});

  /* ---- Level 7 (21.0..25.4 m): Crowning Sheikh's Mafraj Belvedere ---- */
  dsMafraj(-4.3,z0+(cliff?0:.5),4.3,w2z1-1.35,keepTop,{h:3.65,cliffRear:cliff,hollow:false});
  dsMizab(w1x1-.1,midTop,.6,z0+5.0,PI/2,{});
  dsMizab(x0+.35,westTop,.6,z0+4.0,-PI/2,{});
 }
});

/* 14. ds_jabal_hammam_cistern: Qadad-Waterproofed Birka Cistern & Multi-Domed Hammam Bathhouse */
defBuilding({
 key:'ds_jabal_hammam_cistern',
 name:'Jabal domed hammam and qadad birka cistern',
 seed:8123,
 cls:'building',
 kind:'bathhouse',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('middle',['civic','infrastructure','religious'],'hammam','healing'),
 w:14.4,d:13.6,h:10.6,budget:68000,cut:true,
 front:{x:-3.2,z:6.1,yaw:0},
 note:'Sanaa-inspired qadad-waterproofed bathhouse (hammam) and open birka water cistern: forecourt pool with stepped ashlar descent, basalt-and-brick bath hall crowned by a great whitewashed qadad dome & 4 corner cupolas pierced with stained-glass star-oculi.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=13.2,Dd=12.4,z0=cliff?-6.8:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'basalt'});

  /* Front (+z) walled qadad-plastered Birka cistern court; Rear (-z) domed Hammam hall */
  const zSplit=z0+Dd*.58;
  /* Low coursed basalt + qadad coping wall enclosing the front cistern court */
  dsRing(x0,zSplit-.2,x1,z1,0,2.45,{
   mk:'basalt',socle:.4,socleMk:'basalt',skip:'n',
   holes:{s:[{at:Wd*.26,w:1.55,y:0,h:2.15},{at:Wd*.72,w:.9,y:1.15,h:.85}]}
  });
  const gateX=x0+Wd*.26;
  dsArchPortal(gateX,0,z1,0,1.55,2.15,{stoneMk:'ashlar',open:true,fanlight:false,name:'birka court arch'});
  dsParapet(x0,zSplit-.2,x1,z1,2.45,{style:'urban',h:.58,screen:false,skip:'n',hornScale:.78});

  /* Gleaming white qadad waterproofed birka basin on the east side of the forecourt */
  const bx=2.1,bz=(zSplit+z1)/2,bw=5.6,bd=3.4;
  svNoWalk(()=>{
   box('qadad',bx,0,bz,bw,.72,bd,P('qadad'));
   box('qadad',bx,.08,bz,bw-.48,.66,bd-.48,P('qadadWarm'));
   box('water',bx,.58,bz,bw-.52,.05,bd-.52,new THREE.Color(.18,.48,.52));
   /* Stepped stone water-jar shelf */
   for(let s=0;s<3;s++)box('ashlar',bx-bw/2-.28*(s+1),0,bz,.28,.22*(3-s),1.4,P('ashlar'));
  });
  FURNISH('nomad_water_jars',bx-bw/2-.5,.08,bz+1.2,0,{setting:'outdoor'});
  dsTarget(gateX,.08,bz,'cistern forecourt');

  /* Rear Hammam Hall (0..5.2 m) in basalt socle + red brick + white juss frieze */
  const hh=5.2;
  dsRing(x0,z0,x1,zSplit,0,hh,{
   mk:'brick',socle:1.35,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd*.26,w:1.3,y:0,h:2.15},{at:Wd*.68,w:1.0,y:1.55,h:1.15}],
    e:[{at:(zSplit-z0)*.5,w:.95,y:1.65,h:1.1}],
    w:[{at:(zSplit-z0)*.5,w:.95,y:1.65,h:1.1}]
   }
  });
  dsArchPortal(gateX,0,zSplit,0,1.3,2.15,{stoneMk:'ashlar',ablaq:true,name:'hammam steam-hall door'});
  dsQamariyaWin(x0+Wd*.68,1.55,zSplit,0,1.0,1.15,{solid:false,lit:true});
  dsQamariyaWin(x1,1.65,(z0+zSplit)/2,PI/2,.95,1.1,{solid:false,lit:true});
  dsQamariyaWin(x0,1.65,(z0+zSplit)/2,-PI/2,.95,1.1,{solid:false,lit:true});
  FURNISH('nomad_brazier',0,.08,(z0+zSplit)/2,0,{setting:'indoor'});
  FURNISH('nomad_kilim',-3.0,.08,(z0+zSplit)/2,0,{setting:'indoor'});
  dsTarget(gateX,.08,(z0+zSplit)/2,'hammam hall');

  dsJussRing(x0,z0,x1,zSplit,hh-.36,{h:.34,kind:'diamond',cliffRear:cliff});
  const roofY=dsRoof(x0,z0,x1,zSplit,hh,{style:'urban',walk:false});
  dsParapet(x0,z0,x1,zSplit,roofY,{style:'urban',h:.78,cliffRear:cliff,hornScale:.88});

  /* Central great whitewashed qadad dome + 4 corner cupolas with stained-glass bath oculi! */
  const hz=(z0+zSplit)/2;
  dsDome(0,roofY,hz,2.85,3.25,{oculi:true,drumH:.52});
  for(const sx of [-1,1])for(const sz of [-1,1]){
   dsDome(sx*4.1,roofY,hz+sz*1.85,1.15,1.45,{oculi:true,drumH:.28});
  }
  /* Rear furnace chimney stack */
  svNoWalk(()=>{
   const cz=cliff?z0+.55:z0+.45;
   box('brick',x1-1.1,roofY,cz,.68,2.6,.68,P('brickD'));
   cyl('qadad',x1-1.1,roofY+2.6,cz,.38,.36,P('qadad'),10,.26);
  });
  smokeAt(x1-1.1,roofY+3.05,cliff?z0+.55:z0+.45,{r:.22,kind:'fire'});
 }
});

/* 15. ds_jabal_bazaar_gate: Bab al-Jabal Fortified Bazaar Gate */
defBuilding({
 key:'ds_jabal_bazaar_gate',
 name:'Bab al-Jabal fortified bazaar gate',
 seed:8124,
 cls:'building',
 kind:'gate',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('rich',['civic','infrastructure'],'gate','customs'),
 w:13.6,d:8.6,h:15.8,budget:72000,cut:false,
 front:{x:0,z:3.8,yaw:0},
 note:'Fortified city & souq gate of Jabal: twin battered basalt-and-brick flanking towers framing a wide walkable stone thoroughfare arch, topped by a white juss machicolated guard gallery and horned shurfat battlements.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=12.6,Dd=7.4,z0=cliff?-4.3:-Dd/2,z1=z0+Dd,cz=(z0+z1)/2;
  const passW=3.8,tw=(Wd-passW)/2,passH=4.4;

  /* Plinths under left and right towers + paved roadway through the arch */
  svNoWalk(()=>{
   const lo=o.lo!=null?Math.min(-.1,o.lo):(cliff?-DS_CFG.CLIFF_SKIRT:-.1);
   if(CURREC&&CURREC.ds)CURREC.ds.skirtDepth=Math.max(CURREC.ds.skirtDepth,-lo);
   for(const sx of [-1,1]){
    const tx=sx*(passW/2+tw/2);
    box('basalt',tx,lo,cz,tw+.16,-lo,Dd+(cliff?0:.16),P('basalt'));
   }
  });
  box('ashlar',0,0,cz,passW+.4,.08,Dd-.1,P('ashlarD'));
  if(!cliff)dsTarget(0,.08,cz,'gate passage');
  else dsTarget(0,.08,z1-.8,'gate threshold');

  /* Twin flanking towers (basalt lower 4.8 m, red brick 4.8..13.8 m) */
  for(const sx of [-1,1]){
   const tx0=sx<0?-Wd/2:passW/2,tx1=sx<0?-passW/2:Wd/2;
   dsSolidTier(tx0,z0,tx1,z1,0,4.8,{mk:'basalt',ablaq:true,cliffRear:cliff});
   dsJussRing(tx0,z0,tx1,z1,4.48,{h:.32,kind:'chevron',cliffRear:cliff});
   for(let f=0;f<3;f++){
    const ins=(f+1)*.05,fh=2.95,yy=4.8+f*fh;
    dsTowerFloor(tx0+ins,cliff?z0:z0+ins,tx1-ins,z1-ins,yy,fh,f,{
     cliffRear:cliff,bays:1,mashAt:-1,vertBands:false
    });
   }
   const tTop=dsRoof(tx0+.16,cliff?z0:z0+.16,tx1-.16,z1-.16,13.65,{style:'urban',walk:false});
   dsParapet(tx0+.16,cliff?z0:z0+.16,tx1-.16,z1-.16,tTop,{style:'urban',h:.96,cliffRear:cliff,hornScale:1.0});
  }

  /* Central vaulted gate bridge & guard gallery spanning over the roadway (4.4..12.2 m) */
  svNoWalk(()=>{
   /* Ablaq arch rings on front (+z) and rear (-z) */
   const R=passW/2;
   for(const zz of (cliff?[z1-.18]:[z1-.18,z0+.18])){
    for(let i=0;i<11;i++){
     const a=PI*(i+.5)/11;
     box(i%2===0?'ashlar':'basalt',Math.cos(a)*(R+.12),passH-R+Math.sin(a)*(R+.12),zz,.48,.34,.42,P(i%2===0?'ashlar':'basalt'),0,0,a-PI/2);
    }
   }
  });
  /* Open double studded cedar city gates pinned ajar on the +z side (or locked in cliff mode) */
  svLeaf(0,.08,z1-.35,0,passW-.16,passH-passW*.32,{
   mk:'cedar',col:P('cedar'),style:'plank',split:true,ajar:cliff?0:1.25,locked:cliff,name:'bazaar double gate'
  });
  door(0,0,z1-.2,0,passW-.2,3.0);

  dsSolidTier(-passW/2-.05,z0+(cliff?0:.2),passW/2+.05,z1-.2,passH,7.4,{mk:'brick',cliffRear:cliff});
  for(let f=0;f<2;f++){
   const yy=passH+.55+f*3.45;
   for(const bx of [-1.05,1.05]){
    dsQamariyaWin(bx,yy,z1-.2,0,.88,1.15,{solid:true,lit:true});
    if(!cliff)dsQamariyaWin(bx,yy,z0+.2,PI,.88,1.15,{solid:true});
   }
   dsJussRing(-passW/2,z0+(cliff?0:.2),passW/2,z1-.2,passH+(f+1)*3.45-.1,{h:.32,kind:'diamond',cliffRear:cliff,skip:'ew'});
  }
  /* Projecting machicolated box over the gate arch */
  dsMashrabiya(0,passH+3.8,z1-.2,0,1.65,1.5,{solid:true,depth:.48});
  const brTop=dsRoof(-passW/2,z0+(cliff?0:.2),passW/2,z1-.2,passH+7.4,{style:'urban',walk:false});
  dsParapet(-passW/2,z0+(cliff?0:.2),passW/2,z1-.2,brTop,{style:'urban',h:.86,cliffRear:cliff,skip:'ew'});
  FURNISH('nomad_spear_rack',-passW/2-.6,.08,z1+.05,0,{setting:'outdoor'});
 }
});

/* 16. ds_jabal_call_tower: Sana'a Brick-and-Gypsum Watch / Caravan Call Tower (f7f3081a.jpg!) */
defBuilding({
 key:'ds_jabal_call_tower',
 name:'Jabal brick-and-gypsum watch and call tower',
 seed:8125,
 cls:'building',
 kind:'tower',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('rich',['civic','religious','infrastructure'],'call-tower'),
 w:6.8,d:6.8,h:24.8,budget:58000,cut:false,
 front:{x:0,z:2.95,yaw:0},
 note:'Tall Sanaa-style red-brick watch and caravan call tower: square coursed basalt-and-ashlar pedestal, cylindrical/fluted brick shaft inlaid with vertical white gypsum ribs & chevron bands, corbelled muqarnas gallery balcony, lantern stage & whitewashed qadad dome.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=5.8,Dd=5.8,z0=cliff?-3.4:-Dd/2,z1=z0+Dd,cz=(z0+z1)/2,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'basalt'});

  /* Square walkable stone+brick pedestal (0..5.6 m) */
  const ph=5.6,dw=1.18,dh=2.15;
  dsRing(x0,z0,x1,z1,0,3.5,{
   mk:'basalt',socle:.75,socleMk:'ashlar',cliffRear:cliff,
   holes:{s:[{at:Wd/2,w:dw,y:0,h:dh}]}
  });
  dsArchPortal(0,0,z1,0,dw,dh,{stoneMk:'ashlar',ablaq:true,name:'call tower base door'});
  FURNISH('nomad_floor_lantern',0,.08,cz,0,{setting:'indoor'});
  dsTarget(0,.08,cz,'tower base chamber');

  dsSolidTier(x0+.08,cliff?z0:z0+.08,x1-.08,z1-.08,3.5,2.1,{mk:'brick',cliffRear:cliff,quoins:true});
  for(const [wx,wz,wyaw] of [[0,z1-.08,0],[x1-.08,cz,PI/2],[x0+.08,cz,-PI/2]]){
   dsQamariyaWin(wx,3.85,wz,wyaw,.75,.9,{solid:true,lit:true});
  }
  dsJussRing(x0+.08,cliff?z0:z0+.08,x1-.08,z1-.08,ph-.34,{h:.34,kind:'chevron',cliffRear:cliff});
  const pedTop=dsRoof(x0+.08,cliff?z0:z0+.08,x1-.08,z1-.08,ph,{style:'urban',walk:false});
  dsParapet(x0+.08,cliff?z0:z0+.08,x1-.08,z1-.08,pedTop,{style:'urban',h:.72,cliffRear:cliff,hornScale:.82});

  /* Tall cylindrical red-brick shaft (5.82..16.8 m) with 12 crisp white gypsum vertical ribs & chevron collars! */
  const sR=2.05,sH=10.8;
  svNoWalk(()=>{
   cyl('brick',0,pedTop,cz,sR,sH,P('brick'),20,sR*.92);
   const nRibs=12;
   for(let k=0;k<nRibs;k++){
    const a=k*TAU/nRibs;
    if(cliff&&Math.sin(a)<-.85)continue;
    beam('qadad',[Math.cos(a)*(sR+.02),pedTop+.3,cz+Math.sin(a)*(sR+.02)],
                 [Math.cos(a)*(sR*.92+.02),pedTop+sH-.4,cz+Math.sin(a)*(sR*.92+.02)],.09,P('qadad'),false,0,.06);
   }
   /* Three white gypsum collar rings up the shaft */
   for(const fy of [.28,.58,.88]){
    const ry=pedTop+sH*fy,rr0=lerp(sR,sR*.92,fy)+.045;
    cyl('qadad',0,ry,cz,rr0,.32,P('qadad'),20);
    cyl('stucco',0,ry+.06,cz,rr0+.02,.2,P('stucco'),20);
   }
   /* Corbelled white juss balcony at y = pedTop + sH (16.62 m) */
   const balY=pedTop+sH,bR=sR*1.24;
   cyl('qadad',0,balY-.48,cz,sR*.94,.48,P('qadad'),18,bR);
   cyl('qadad',0,balY,cz,bR,.22,P('qadad'),18);
   /* Pierced white gypsum balcony parapet + 8 horn pinnacles */
   cyl('stucco',0,balY+.22,cz,bR,.78,P('stucco'),16,bR);
   for(let k=0;k<8;k++){
    const a=k*TAU/8;
    if(cliff&&Math.sin(a)<-.85)continue;
    dsHornPinnacle(Math.cos(a)*(bR-.12),balY+1.0,cz+Math.sin(a)*(bR-.12),-a+PI/2,.62,P('qadad'));
   }
   /* Upper hexagonal/cylindrical brick lantern stage (16.84..20.8 m) with 6 arched call openings */
   const lR=1.42,lH=3.9;
   cyl('brick',0,balY+.22,cz,lR,lH,P('brick'),12);
   cyl('qadad',0,balY+.22+lH-.32,cz,lR+.05,.32,P('qadad'),12);
   for(let k=0;k<6;k++){
    const a=k*TAU/6;
    W(Math.cos(a)*(lR+.01),balY+1.25,cz+Math.sin(a)*(lR+.01),-a+PI/2,()=>{
     svPane(0,0,0,0,.52,1.35,{kind:'lit',solid:true});
     box('qadad',0,1.35,.02,.68,.12,.05,P('qadad'));
    });
   }
   haloAt(0,balY+2.2,cz,0xffc468,true);
  });
  /* Whitewashed qadad dome + brass horn finial at ~24.4 m */
  dsDome(0,pedTop+sH+4.12,cz,1.46,2.55,{oculi:false,drumH:.24});
  if(CURREC&&CURREC.ds)CURREC.ds.jussBands+=3;
 }
});
