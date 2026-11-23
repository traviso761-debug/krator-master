// prefix: ds
// ================================================================= URBAN JABAL DWELLINGS: Sana'a, Shibam & Dar al-Hajar tower-houses ([draw])
// 5 urban residential defs (seeds 8101..8105):
//   ds_jabal_house_poor       4-storey artisan tower-house (v:1 Shibam mudbrick + whitewashed qadad upper floors)
//   ds_jabal_house_mid        5-storey burgher tower-house with ashlar base, aligned qamariya bays, mashrabiya & mafraj (v:1 Shibam)
//   ds_jabal_house_rich       6-storey salt-merchant tower-house with ablaq stone base, vertical+horizontal juss lacework & grand mafraj
//   ds_jabal_corner_tower     6-storey street-corner tower-house with dual primary fronts (+z, +x) & corner mashrabiya oriel
//   ds_jabal_mansion_stepped  7-storey Dar al-Hajar / Wadi Dawan cascading terraced mansion (3 -> 5 -> 7 storeys rear-high)

const DS_URB_TAGS=(wealth,types,role,job)=>{
 const t={types:types||['dwelling-single'],wealth,style:'jabal',variant:'urban',role:role||'house'};
 if(job)t.job=job;
 return t;
};

/* Helper: populate a 4-sided urban brick/shibam storey with aligned qamariya bays, vertical juss strips & optional mashrabiya */
function dsTowerFloor(x0,z0,x1,z1,y0,fh,flIdx,o){
 o=o||{};
 const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2,cliff=!!o.cliffRear,shibam=!!o.shibam;
 const whiteTop=shibam&&flIdx>=o.whiteFrom;
 const mk=whiteTop?'qadad':(shibam?'banco':'brick');
 dsSolidTier(x0,z0,x1,z1,y0,fh,{mk,cliffRear:cliff,quoins:!shibam&&flIdx===0});
 /* Crisp white juss geometric frieze at the top of the storey */
 dsJussRing(x0,z0,x1,z1,y0+fh-.36,{h:.34,kind:flIdx%2===0?'chevron':'diamond',cliffRear:cliff});

 /* Front (+z) aligned bays: wide central bay on rich/mid houses + flanking narrow qamariya bays (4ca4c9f8.jpg!) */
 const wy=y0+.58,wh=Math.min(1.18,fh*.4);
 const nBays=o.bays==null?Math.max(2,Math.min(5,Math.floor((w-.8)/2.05))):o.bays;
 for(let i=0;i<nBays;i++){
  const bx=x0+.6+(i+.5)*(w-1.2)/nBays;
  const isMid=nBays>=3&&i===Math.floor(nBays/2);
  const bw=isMid?Math.min(1.32,(w-1.4)/nBays*.72):.82;
  if(o.mashAt===i){
   dsMashrabiya(bx,wy-.04,z1,0,Math.min(1.3,bw+.32),wh+.38,{solid:true});
  }else{
   dsQamariyaWin(bx,wy,z1,0,bw,wh,{solid:true,lit:(i+flIdx)%2===0,flank:isMid&&w>=8.2,shutters:!whiteTop||flIdx%2===0});
  }
  /* Vertical juss diamond divider strips flanking central bay on ornate urban facades */
  if(isMid&&!shibam&&o.vertBands!==false){
   const vxOff=bw/2+.36;
   for(const s of [-1,1])dsVertBand(bx+s*vxOff,y0+.06,y0+fh-.38,z1,0,{w:.2});
  }
 }

 /* Side (+x, -x) windows — aligned plumb up the tower */
 const nSide=Math.max(1,Math.min(3,Math.floor((d-1.2)/2.8)));
 for(let j=0;j<nSide;j++){
  const bz=z0+.8+(j+.5)*(d-1.6)/nSide;
  if(o.sideMash&&j===0&&flIdx===o.sideMashFloor){
   dsMashrabiya(x1,wy-.04,bz,PI/2,1.18,wh+.34,{solid:true});
  }else{
   dsQamariyaWin(x1,wy,bz,PI/2,.8,wh,{solid:true,lit:(j+flIdx)%2===1});
  }
  dsQamariyaWin(x0,wy,bz,-PI/2,.8,wh,{solid:true,lit:(j+flIdx)%2===0});
 }

 /* Rear (-z) windows — complete 4-sided architecture when standalone; cleanly omitted when locked flush to a cliff! */
 if(!cliff){
  const nRear=Math.max(2,nBays-1);
  for(let i=0;i<nRear;i++){
   const bx=x0+.8+(i+.5)*(w-1.6)/nRear;
   dsQamariyaWin(bx,wy,z0,PI,.78,wh*.95,{solid:true,lit:(i+flIdx)%3===0,shutters:false});
  }
 }
}

/* 1. ds_jabal_house_poor: 4-storey narrow Sana'a / Shibam artisan tower-house */
defBuilding({
 key:'ds_jabal_house_poor',
 name:'Jabal artisan tower-house (4 storeys)',
 seed:8101,
 cls:'building',
 kind:'house',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('poor',['dwelling-single'],'house'),
 w:6.8,d:7.4,h:13.8,budget:48000,cut:true,
 front:{x:0,z:3.25,yaw:0},
 note:'Narrow 4-storey Jabal artisan tower-house: battered basalt ground floor with arched cedar door and high vent slits, 3 brick or Shibam mudbrick+qadad upper storeys, chevron juss bands, and horned roof parapet.',
 build(o){
  o=o||{};
  const D=dsInitRec(o,'urban'),cliff=!!o.cliff,shibam=D?D.shibam:(o.v|0)===1;
  const Wd=5.8,Dd=6.5,z0=cliff?-3.7:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'basalt'});
  /* Hollow walkable basalt ground storey (3.25 m) */
  const gh=3.25,dw=1.15,dh=2.05;
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd/2,w:dw,y:0,h:dh},{at:Wd*.2,w:.36,y:2.1,h:.55},{at:Wd*.8,w:.36,y:2.1,h:.55}],
    e:[{at:Dd*.5,w:.38,y:2.1,h:.55}],
    w:[{at:Dd*.5,w:.38,y:2.1,h:.55}]
   }
  });
  dsArchPortal(0,0,z1,0,dw,dh,{stoneMk:'ashlar',name:'artisan street door'});
  for(const sx of [-1,1])svPane(sx*Wd*.3,2.1,z1-.06,0,.34,.52,{kind:'frosted',solid:false});
  svPane(x1-.06,2.1,(z0+z1)/2,PI/2,.36,.52,{kind:'frosted',solid:false});
  svPane(x0+.06,2.1,(z0+z1)/2,-PI/2,.36,.52,{kind:'frosted',solid:false});
  FURNISH('nomad_water_jars',-Wd/2+.85,.08,z0+1.1,0,{setting:'indoor'});
  FURNISH('generic_sack',Wd/2-.9,.08,z0+1.1,-.4,{setting:'indoor'});
  dsTarget(0,.08,(z0+z1)/2,'ground entry');
  dsJussRing(x0,z0,x1,z1,gh-.3,{h:.28,kind:'chevron',cliffRear:cliff});

  /* 3 upper storeys (inward batter of 6 cm per floor, Shibam white qadad top 2 floors when v=1) */
  let y=gh;
  for(let f=0;f<3;f++){
   const ins=(f+1)*.06,fh=2.95;
   dsTowerFloor(x0+ins,cliff?z0:z0+ins,x1-ins,z1-ins,y,fh,f,{
    cliffRear:cliff,shibam,whiteFrom:1,bays:2,mashAt:f===1?0:-1,vertBands:false
   });
   y+=fh;
  }
  const topY=dsRoof(x0+.18,cliff?z0:z0+.18,x1-.18,z1-.18,y,{style:'urban',walk:false});
  dsParapet(x0+.18,cliff?z0:z0+.18,x1-.18,z1-.18,topY,{style:'urban',h:.82,shibam,cliffRear:cliff,hornScale:.85});
  dsMizab(x1-.55,topY,.4,(z0+z1)/2+.8,PI/2,{});
  if(!cliff)dsMizab(-1.2,topY,.4,z0+.18,PI,{});
 }
});

/* 2. ds_jabal_house_mid: 5-storey Sana'a burgher tower-house with front roof terrace + rear mafraj */
defBuilding({
 key:'ds_jabal_house_mid',
 name:'Jabal burgher tower-house (5 storeys)',
 seed:8102,
 cls:'building',
 kind:'house',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('middle',['dwelling-single'],'house'),
 w:8.6,d:9.2,h:17.6,budget:68000,cut:true,
 front:{x:0,z:4.05,yaw:0},
 note:'Classic 5-storey Jabal burgher tower-house: dressed buff ashlar ground storey, 3 brick storeys with chevron/diamond juss bands, 3-bay qamariya windows, projecting mashrabiya cooling box, and a rear-high mafraj pavilion behind a front roof terrace.',
 build(o){
  o=o||{};
  const D=dsInitRec(o,'urban'),cliff=!!o.cliff,shibam=D?D.shibam:(o.v|0)===1;
  const Wd=7.5,Dd=8.1,z0=cliff?-4.6:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'ashlar'});

  /* Ground storey in dressed buff sandstone ashlar (3.5 m) */
  const gh=3.5,dw=1.32,dh=2.2;
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'ashlar',socle:.55,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd/2,w:dw,y:0,h:dh},{at:Wd*.18,w:.62,y:1.55,h:.85},{at:Wd*.82,w:.62,y:1.55,h:.85}],
    e:[{at:Dd*.5,w:.62,y:1.6,h:.85}],
    w:[{at:Dd*.5,w:.62,y:1.6,h:.85}]
   }
  });
  dsArchPortal(0,0,z1,0,dw,dh,{stoneMk:'ashlar',ablaq:true,name:'burgher street portal'});
  for(const sx of [-1,1])dsQamariyaWin(sx*Wd*.32,1.55,z1,0,.62,.85,{solid:false,shutters:false});
  dsQamariyaWin(x1,1.6,(z0+z1)/2,PI/2,.62,.85,{solid:false,shutters:false});
  dsQamariyaWin(x0,1.6,(z0+z1)/2,-PI/2,.62,.85,{solid:false,shutters:false});
  FURNISH('nomad_studded_chest',-Wd/2+1.0,.08,z0+1.2,PI/2,{setting:'indoor'});
  FURNISH('nomad_water_jars',Wd/2-1.0,.08,z0+1.2,0,{setting:'indoor'});
  FURNISH('nomad_floor_lantern',1.1,.08,0,0,{setting:'indoor'});
  dsTarget(0,.08,(z0+z1)/2,' vestibule');
  dsJussRing(x0,z0,x1,z1,gh-.32,{h:.32,kind:'chevron',cliffRear:cliff});

  /* 3 full brick/shibam upper storeys */
  let y=gh;
  for(let f=0;f<3;f++){
   const ins=(f+1)*.06,fh=3.05;
   dsTowerFloor(x0+ins,cliff?z0:z0+ins,x1-ins,z1-ins,y,fh,f,{
    cliffRear:cliff,shibam,whiteFrom:1,bays:3,mashAt:f===1?1:-1,sideMash:true,sideMashFloor:2
   });
   y+=fh;
  }
  /* Top level (5th storey): front qadad roof terrace (+z) + rear-high mafraj pavilion (-z) */
  const rx0=x0+.2,rx1=x1-.2,rz0=cliff?z0:z0+.2,rz1=z1-.2;
  const terrY=dsRoof(rx0,rz0,rx1,rz1,y,{style:'urban',walk:false});
  const mz1=rz0+(rz1-rz0)*.58;
  /* Parapet around front terrace only (s, e, w front half) */
  dsParapet(rx0,mz1-.1,rx1,rz1,terrY,{style:'urban',h:.88,shibam,skip:'n',hornScale:.9});
  dsMafraj(rx0+.15,rz0,rx1-.15,mz1,terrY,{h:3.35,shibam,cliffRear:cliff,hollow:true});
  dsMizab(rx1-.1,terrY,.5,(mz1+rz1)/2,PI/2,{});
  if(!cliff)dsMizab(rx0+.8,terrY,.5,rz0,PI,{});
 }
});

/* 3. ds_jabal_house_rich: 6-storey salt-merchant tower-house (inspired directly by 4ca4c9f8.jpg!) */
defBuilding({
 key:'ds_jabal_house_rich',
 name:'Jabal salt-merchant tower-house (6 storeys)',
 seed:8103,
 cls:'building',
 kind:'house',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('rich',['dwelling-multi'],'house','trading'),
 w:11.4,d:11.8,h:22.4,budget:95000,cut:true,
 front:{x:0,z:5.3,yaw:0},
 note:'Grand 6-storey salt-merchant tower-house: 2-storey ablaq basalt-and-ashlar defensive base, 3 red-brick storeys with double juss chevron/diamond friezes, 5-bay qamariya facade with wide central stained-glass arch, twin mashrabiya boxes, and a crowning horned mafraj belvedere.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=10.2,Dd=10.6,z0=cliff?-5.9:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'basalt'});

  /* Storey 1 (ground): battered basalt & ashlar entrance court + merchant strongroom (3.6 m) */
  const gh=3.6,dw=1.65,dh=2.45;
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'basalt',socle:.7,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:Wd/2,w:dw,y:0,h:dh},{at:Wd*.2,w:.72,y:1.6,h:.95},{at:Wd*.8,w:.72,y:1.6,h:.95}],
    e:[{at:Dd*.35,w:.7,y:1.65,h:.95},{at:Dd*.7,w:.7,y:1.65,h:.95}],
    w:[{at:Dd*.35,w:.7,y:1.65,h:.95},{at:Dd*.7,w:.7,y:1.65,h:.95}]
   }
  });
  dsArchPortal(0,0,z1,0,dw,dh,{stoneMk:'ashlar',ablaq:true,split:true,name:'merchant grand portal'});
  for(const sx of [-1,1])dsQamariyaWin(sx*Wd*.3,1.6,z1,0,.72,.95,{solid:false,shutters:true});
  for(const fz of [-.18,.18]){
   dsQamariyaWin(x1,1.65,(z0+z1)/2+fz*Dd,PI/2,.7,.95,{solid:false});
   dsQamariyaWin(x0,1.65,(z0+z1)/2+fz*Dd,-PI/2,.7,.95,{solid:false});
  }
  FURNISH('generic_strongbox',-Wd/2+1.2,.08,z0+1.4,PI/2,{setting:'indoor'});
  FURNISH('nomad_studded_chest',Wd/2-1.2,.08,z0+1.4,-PI/2,{setting:'indoor'});
  FURNISH('job_salt_tub',-Wd/2+1.3,.08,0,0,{setting:'indoor'});
  FURNISH('nomad_lantern_cluster',0,2.3,0,0,{setting:'indoor'});
  dsTarget(0,.08,(z0+z1)/2,'merchant entry hall');

  /* Storey 2: smooth buff ashlar sandstone mezzanine (3.1 m, matching 4ca4c9f8.jpg stone lower register!) */
  const m2h=3.1;
  dsSolidTier(x0+.05,cliff?z0:z0+.05,x1-.05,z1-.05,gh,m2h,{mk:'ashlar',cliffRear:cliff,quoins:true,quoinMk:'qadad'});
  for(let i=0;i<5;i++){
   const bx=x0+.95+i*(Wd-1.9)/4;
   dsQamariyaWin(bx,gh+.55,z1-.05,0,i===2?1.25:.82,1.05,{solid:true,lit:i===2});
   if(!cliff&&i%2===0)dsQamariyaWin(bx,gh+.55,z0+.05,PI,.82,1.0,{solid:true});
  }
  for(const sz of [-1,1]){
   dsQamariyaWin(x1-.05,gh+.55,(z0+z1)/2+sz*2.2,PI/2,.85,1.05,{solid:true});
   dsQamariyaWin(x0+.05,gh+.55,(z0+z1)/2+sz*2.2,-PI/2,.85,1.05,{solid:true});
  }
  dsJussRing(x0+.05,cliff?z0:z0+.05,x1-.05,z1-.05,gh+m2h-.36,{h:.36,kind:'diamond',cliffRear:cliff});

  /* Storeys 3, 4, 5: rich red-brick reception floors with 5-bay qamariya grids & projecting mashrabiya boxes */
  let y=gh+m2h;
  for(let f=0;f<3;f++){
   const ins=.1+f*.05,fh=3.25;
   dsTowerFloor(x0+ins,cliff?z0:z0+ins,x1-ins,z1-ins,y,fh,f,{
    cliffRear:cliff,bays:5,mashAt:f===1?0:(f===2?4:-1),sideMash:true,sideMashFloor:1
   });
   y+=fh;
  }

  /* Storey 6: broad front qadad terrace with pierced screen + tall central/rear horned mafraj pavilion */
  const rx0=x0+.26,rx1=x1-.26,rz0=cliff?z0:z0+.26,rz1=z1-.26;
  const terrY=dsRoof(rx0,rz0,rx1,rz1,y,{style:'urban',walk:false});
  dsParapet(rx0,rz0,rx1,rz1,terrY,{style:'urban',h:.98,cliffRear:cliff,hornScale:1.05});
  const mw=Wd*.62,mz1=rz0+(rz1-rz0)*.62;
  dsMafraj(-mw/2,rz0+.18,mw/2,mz1,terrY,{h:3.85,cliffRear:cliff,hollow:true});
  dsMizab(rx1-.05,terrY,.6,0,PI/2,{});
  dsMizab(rx0+.05,terrY,.6,1.8,-PI/2,{});
 }
});

/* 4. ds_jabal_corner_tower: 6-storey street-corner tower-house articulated on TWO primary street fronts (+z and +x) */
defBuilding({
 key:'ds_jabal_corner_tower',
 name:'Jabal street-corner tower-house',
 seed:8104,
 cls:'building',
 kind:'house',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('rich',['dwelling-multi','shop'],'corner-tower','trading'),
 w:9.6,d:9.6,h:20.6,budget:82000,cut:true,
 front:{x:0,z:4.25,yaw:0},
 note:'6-storey Jabal corner tower-house facing two intersecting lanes (+z and +x): ablaq corner quoins, arched portal on +z and side shop arch on +x, corner projecting mashrabiya oriel, and rooftop corner mafraj.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const Wd=8.4,Dd=8.4,z0=cliff?-4.8:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'urban',mk:'basalt'});

  /* Ground floor: basalt & ashlar corner block with main door (+z) and corner factor arch (+x) */
  const gh=3.55;
  dsRing(x0,z0,x1,z1,0,gh,{
   mk:'basalt',socle:.6,socleMk:'ashlar',cliffRear:cliff,
   holes:{
    s:[{at:Wd*.42,w:1.35,y:0,h:2.25},{at:Wd*.78,w:.75,y:1.5,h:.95}],
    e:[{at:Dd*.45,w:1.3,y:0,h:2.2},{at:Dd*.8,w:.75,y:1.5,h:.95}],
    w:[{at:Dd*.5,w:.55,y:1.8,h:.75}]
   }
  });
  dsArchPortal(x0+Wd*.42,0,z1,0,1.35,2.25,{stoneMk:'ashlar',ablaq:true,name:'corner house door'});
  dsArchPortal(x1,0,z1-Dd*.45,PI/2,1.3,2.2,{stoneMk:'ashlar',name:'corner shop door'});
  dsQamariyaWin(x0+Wd*.78,1.5,z1,0,.75,.95,{solid:false});
  dsQamariyaWin(x1,1.5,z1-Dd*.8,PI/2,.75,.95,{solid:false});
  FURNISH('nomad_coffee_hearth',0,.08,0,0,{setting:'indoor'});
  FURNISH('generic_spice_box',1.6,.08,1.2,-PI/2,{setting:'indoor'});
  dsTarget(-.4,.08,(z0+z1)/2,'corner ground room');
  dsJussRing(x0,z0,x1,z1,gh-.32,{h:.32,kind:'chevron',cliffRear:cliff});

  /* 4 upper brick storeys with wrap-around corner quoins + corner mashrabiya on floor 3 */
  let y=gh;
  for(let f=0;f<4;f++){
   const ins=(f+1)*.05,fh=3.08;
   dsTowerFloor(x0+ins,cliff?z0:z0+ins,x1-ins,z1-ins,y,fh,f,{
    cliffRear:cliff,bays:3,mashAt:f===2?2:-1,sideMash:true,sideMashFloor:2
   });
   /* Chamfered corner juss pilaster accent on the +x/+z street corner */
   dsVertBand(x1-ins-.22,y+.05,y+fh-.38,z1-ins,0,{w:.22});
   dsVertBand(x1-ins,y+.05,y+fh-.38,z1-ins-.22,PI/2,{w:.22});
   y+=fh;
  }
  const rx0=x0+.24,rx1=x1-.24,rz0=cliff?z0:z0+.24,rz1=z1-.24;
  const terrY=dsRoof(rx0,rz0,rx1,rz1,y,{style:'urban',walk:false});
  dsParapet(rx0,rz0,rx1,rz1,terrY,{style:'urban',h:.88,cliffRear:cliff});
  dsMafraj(rx0+.2,rz0+.15,rx0+(rx1-rx0)*.65,rz0+(rz1-rz0)*.65,terrY,{h:3.35,cliffRear:cliff,hollow:true});
  dsMizab(rx0+.1,terrY,.5,0,-PI/2,{});
 }
});

/* 5. ds_jabal_mansion_stepped: 7-storey Dar al-Hajar / Wadi Dawan stepped terrace mansion (21ddcf17.jpg & 4630920a.jpg!) */
defBuilding({
 key:'ds_jabal_mansion_stepped',
 name:'Jabal stepped cliff mansion (Dar al-Hajar style)',
 seed:8105,
 cls:'building',
 kind:'mansion',
 frag:'kits/dasri',
 tags:DS_URB_TAGS('rich',['dwelling-multi','civic'],'mansion'),
 w:14.8,d:16.4,h:23.8,budget:125000,cut:true,
 front:{x:-2.2,z:7.5,yaw:0},
 note:'Cascading 3->5->7 storey Jabal merchant mansion (inspired by Dar al-Hajar and Wadi Dawan): steps up from a 2-storey stone entrance court (+z) through a 4-storey middle terrace wing with crenelated qadad parapet to a 7-storey rear tower & mafraj (-z), ideal both freestanding and locked flush against a cliff spire.',
 build(o){
  o=o||{};
  dsInitRec(o,'urban');
  const cliff=!!o.cliff;
  const P0=dsStepPlan({
   w:13.6,d:15.2,
   tiers:[
    {back:0,front:1.0,wFrac:1.0,y0:0,h:6.4},      /* Tier 0: 2-storey stone+brick base across full depth */
    {back:0,front:.68,wFrac:.86,xOff:.4,y0:6.4,h:6.2}, /* Tier 1: 2-storey middle brick wing stepping back from front terrace */
    {back:0,front:.42,wFrac:.66,xOff:-.5,y0:12.6,h:6.4} /* Tier 2: 2-storey upper tower on rear spine */
   ]
  });
  const T0=P0.tiers[0],T1=P0.tiers[1],T2=P0.tiers[2];
  const zShift=cliff?(-8.2-T0.z0):0;
  const Z=z=>z+zShift;

  dsPlinth(T0.w,T0.d,{cliff,lo:o.lo,register:'urban',mk:'basalt',anchorH:2.8});

  /* ---- Tier 0: 2-storey coursed basalt + buff ashlar lower bastion (0..6.4 m) ---- */
  const gh=3.4,dw=1.6,dh=2.35;
  dsRing(T0.x0,Z(T0.z0),T0.x1,Z(T0.z1),0,gh,{
   mk:'basalt',socle:.8,socleMk:'basalt',cliffRear:cliff,
   holes:{
    s:[{at:T0.w*.34,w:dw,y:0,h:dh},{at:T0.w*.68,w:.82,y:1.45,h:1.0},{at:T0.w*.86,w:.82,y:1.45,h:1.0}],
    e:[{at:T0.d*.3,w:.75,y:1.55,h:.95},{at:T0.d*.7,w:.75,y:1.55,h:.95}],
    w:[{at:T0.d*.3,w:.75,y:1.55,h:.95},{at:T0.d*.7,w:.75,y:1.55,h:.95}]
   }
  });
  const doorX=T0.x0+T0.w*.34;
  dsArchPortal(doorX,0,Z(T0.z1),0,dw,dh,{stoneMk:'ashlar',ablaq:true,split:true,name:'stepped mansion gate'});
  dsQamariyaWin(T0.x0+T0.w*.68,1.45,Z(T0.z1),0,.82,1.0,{solid:false});
  dsQamariyaWin(T0.x0+T0.w*.86,1.45,Z(T0.z1),0,.82,1.0,{solid:false});
  FURNISH('nomad_kilim',0,.08,Z(0),0,{setting:'indoor'});
  FURNISH('nomad_majlis_mattress',2.2,.08,Z(T0.z1)-2.0,PI,{setting:'indoor'});
  FURNISH('nomad_brazier',0,.08,Z(2.0),0,{setting:'indoor'});
  dsTarget(doorX,.08,Z(T0.z1)-2.2,'lower court hall');

  /* Second floor of Tier 0 in warm ashlar + brick with qamariya arcade */
  dsSolidTier(T0.x0+.06,cliff?Z(T0.z0):Z(T0.z0)+.06,T0.x1-.06,Z(T0.z1)-.06,gh,T0.h-gh,{mk:'ashlar',cliffRear:cliff,quoins:true});
  for(let i=0;i<5;i++){
   const wx=T0.x0+1.1+i*(T0.w-2.2)/4;
   dsQamariyaWin(wx,gh+.48,Z(T0.z1)-.06,0,.88,1.02,{solid:true,lit:i%2===1});
  }
  for(const sz of [-4,0,4]){
   dsQamariyaWin(T0.x1-.06,gh+.48,Z(sz),PI/2,.82,1.0,{solid:true});
   dsQamariyaWin(T0.x0+.06,gh+.48,Z(sz),-PI/2,.82,1.0,{solid:true});
  }
  dsJussRing(T0.x0+.06,cliff?Z(T0.z0):Z(T0.z0)+.06,T0.x1-.06,Z(T0.z1)-.06,T0.h-.34,{h:.34,kind:'chevron',cliffRear:cliff});

  /* Walkable exterior stone stair along the west flank rising to Tier 0's front qadad terrace! */
  const t0Top=dsRoof(T0.x0+.06,cliff?Z(T0.z0):Z(T0.z0)+.06,T0.x1-.06,Z(T0.z1)-.06,T0.h,{style:'urban',walk:true});
  dsParapet(T0.x0+.06,Z(T1.z1)-.1,T0.x1-.06,Z(T0.z1)-.06,t0Top,{style:'urban',h:.92,skip:'n'});

  /* ---- Tier 1: 2-storey middle red-brick terrace wing (6.62..12.8 m) ---- */
  for(let f=0;f<2;f++){
   const fh=3.05,yy=t0Top+f*fh;
   dsTowerFloor(T1.x0,Z(T1.z0),T1.x1,Z(T1.z1),yy,fh,f,{
    cliffRear:cliff,bays:4,mashAt:f===1?2:-1
   });
  }
  const t1Top=dsRoof(T1.x0,Z(T1.z0),T1.x1,Z(T1.z1),t0Top+6.1,{style:'urban',walk:false});
  dsParapet(T1.x0,Z(T2.z1)-.1,T1.x1,Z(T1.z1),t1Top,{style:'urban',h:.9,skip:'n'});
  /* Furnish middle terrace with outdoor carpets & lanterns visible from above (4630920a.jpg!) */
  W((T1.x0+T1.x1)/2,t0Top+.02,(Z(T1.z1)+Z(T0.z1))/2,0,()=>{
   FURNISH('nomad_floor_lantern',-2.4,0,0,0,{setting:'outdoor'});
   FURNISH('nomad_date_baskets',2.2,0,0,0,{setting:'outdoor'});
  });

  /* ---- Tier 2: 2-storey upper tower on rear spine + 7th-storey crowning mafraj ---- */
  for(let f=0;f<2;f++){
   const fh=3.05,yy=t1Top+f*fh;
   dsTowerFloor(T2.x0,Z(T2.z0),T2.x1,Z(T2.z1),yy,fh,f+2,{
    cliffRear:cliff,bays:3,mashAt:f===0?1:-1
   });
  }
  const t2Top=dsRoof(T2.x0,Z(T2.z0),T2.x1,Z(T2.z1),t1Top+6.1,{style:'urban',walk:false});
  dsParapet(T2.x0,Z(T2.z0),T2.x1,Z(T2.z1),t2Top,{style:'urban',h:.86,cliffRear:cliff});
  dsMafraj(T2.x0+.45,Z(T2.z0)+(cliff?0:.2),T2.x1-.45,Z(T2.z1)-1.1,t2Top,{h:3.55,cliffRear:cliff,hollow:false});

  dsMizab(T0.x1-.1,t0Top,.5,Z(T0.z1)-2.0,PI/2,{});
  dsMizab(T1.x0+.1,t1Top,t0Top+.2,Z(T1.z1)-1.8,-PI/2,{});
 }
});
