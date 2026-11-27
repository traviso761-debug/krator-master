// prefix: ds
// ================================================================= DASRI VILLAGE & OASIS DWELLINGS ([draw])
// 4 vernacular residential & homestead defs (seeds 8201..8204):
//   ds_vil_house_poor    1-storey zabur rammed-earth & rubble house with exposed pole eaves, stone roof stair & clay oven
//   ds_vil_house_mid     Stepped 2-storey canyon-ledge family house with forecourt, madamik courses & shade pergola
//   ds_vil_house_elder   3-storey village sheikh / oasis keeper's stone-and-mudbrick house with stepped terrace
//   ds_vil_compound      Walled camel & goat homestead with mudbrick court, beast shade, trough & 2-storey rear house

const DS_VIL_TAGS=(wealth,types,role,job)=>{
 const t={types:types||['dwelling-single'],wealth,style:'village',variant:'village',role:role||'house'};
 if(job)t.job=job;
 return t;
};

/* Helper: simple village doorway with timber lintel, whitewash eyebrow band & operable plank KDOOR leaf */
function dsVilDoor(x,y,zf,yaw,w,h,o){
 o=o||{};
 const hollow=o.hollow!==false;
 W(x,y,zf,yaw,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1])box('rubble',s*(w/2+.12),0,-.02,.24,h+.12,.52,P('rubble'));
   box('rubble',0,-.02,.04,w+.38,.09,.58,P('rubble'));
   box('timber',0,h,-.02,w+.42,.14,.54,P('timber'));
   /* Simple whitewash lime lintel eyebrow (authentic rural Yemen touch!) */
   box('qadad',0,h+.14,.02,w+.46,.1,.03,P('qadadWarm'));
   if(o.archEyebrow){
    for(let i=0;i<7;i++){
     const a=PI*(i+.5)/7,R=w*.48;
     box('qadad',Math.cos(a)*R,h+.24+Math.sin(a)*R*.65,.02,.18,.08,.028,P('qadadWarm'),0,0,a-PI/2);
    }
   }
  });
  if(o.open){
   if(!hollow)svRoom(0,0,-.06,0,w,h);
  }else{
   svLeaf(0,.07,-.03,0,w-.06,h-.07,{
    mk:'cedar',col:P('cedar'),style:'plank',locked:!hollow,split:w>1.45,name:o.name||'village door'
   });
  }
  door(0,0,.02,0,w,h);
 });
}

/* 17. ds_vil_house_poor: 1-storey battered zabur & rubble house with exterior stone roof stair */
defBuilding({
 key:'ds_vil_house_poor',
 name:'Dasri village zabur house (1 storey)',
 seed:8201,
 cls:'building',
 kind:'house',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('poor',['dwelling-single'],'house'),
 w:6.4,d:6.8,h:4.8,budget:26000,cut:true,
 front:{x:-.6,z:2.9,yaw:0},
 note:'Plain 1-storey Dasri village house: coursed rubble socle, battered zabur mudbrick walls with horizontal madamik ridges, restrained whitewash window eyebrows, exposed juniper roof poles, exterior stone stair & rooftop clay bread oven.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=5.2,Dd=5.8,z0=cliff?-3.4:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd+.9,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble'});

  const gh=3.25,dw=1.02,dh=DS_CFG.DOOR_VIL_H;
  dsRing(x0,z0,x1,z1,0,gh,{
   t:DS_CFG.WALL_VIL,mk:'banco',socle:.95,socleMk:'rubble',madamik:true,cliffRear:cliff,
   holes:{
    s:[{at:Wd/2-.6,w:dw,y:0,h:dh},{at:Wd*.78,w:.56,y:1.3,h:.68}],
    w:[{at:Dd*.5,w:.56,y:1.35,h:.68}]
   }
  });
  dsVilDoor(-.6,0,z1,0,dw,dh,{name:'zabur house door'});
  dsVilWin(x0+Wd*.78,1.3,z1,0,.56,.68,{solid:false,lit:true});
  dsVilWin(x0,1.35,(z0+z1)/2,-PI/2,.56,.68,{solid:false});
  if(!cliff)dsVilWin(.8,1.4,z0,PI,.52,.62,{solid:false});

  FURNISH('nomad_sleeping_mat' in KratorFurniture.FURN_BY_KEY?'nomad_sleeping_mat':'generic_poor_straw_bed',0,.08,z0+1.2,0,{setting:'indoor'});
  FURNISH('nomad_water_jars',-1.5,.08,z1-1.1,0,{setting:'indoor'});
  FURNISH('nomad_quern',1.4,.08,0,-PI/2,{setting:'indoor'});
  dsTarget(-.6,.08,(z0+z1)/2,'house room');

  const roofY=dsRoof(x0,z0,x1,z1,gh,{style:'village',cliffRear:cliff,walk:true});
  /* Parapet open on east side top for exterior stone stair landing */
  dsParapet(x0,z0,x1,z1,roofY,{style:'village',h:.62,cliffRear:cliff,skip:'e'});
  /* Exterior solid stone stair up the east wall (+x) onto the flat work roof! */
  svStair(x1+.42,z1-.55,0,roofY,PI,{style:'solid',w:.78,run:3.8,mk:'rubble',col:P('rubble')});
  /* Rooftop clay tabun bread oven & fuel brushwood */
  svNoWalk(()=>{
   lathe('banco',x0+.95,z0+1.1,[[.46,roofY],[.44,roofY+.36],[.26,roofY+.68],[.12,roofY+.78]],12,P('bancoL'));
   sph('glow',x0+.95,roofY+.16,z0+1.2,.06,new THREE.Color(1,.42,.12),.5,6);
  });
  smokeAt(x0+.95,roofY+.85,z0+1.1,{r:.16,kind:'fire'});
  dsMizab(x0+.05,roofY,.5,(z0+z1)/2,-PI/2,{wood:true,chute:false});
 }
});

/* 18. ds_vil_house_mid: Stepped 2-storey wadi-ledge family house */
defBuilding({
 key:'ds_vil_house_mid',
 name:'Dasri stepped wadi house (2 storeys)',
 seed:8202,
 cls:'building',
 kind:'house',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('middle',['dwelling-single'],'house'),
 w:8.6,d:9.2,h:7.8,budget:38000,cut:true,
 front:{x:-1.6,z:4.0,yaw:0},
 note:'Stepped 2-storey Dasri village house: 1-storey front room + walled forecourt stepping up to a 2-storey rear sleeping block on -z, with rubble base, madamik earth courses, sparse whitewash window trim & juniper-pole roof shade.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=7.6,Dd=8.2,z0=cliff?-4.6:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble'});

  const gh=3.2,zMid=z0+Dd*.54;
  /* Ground floor across full footprint: front kitchen/store + rear living hall */
  dsRing(x0,z0,x1,z1,0,gh,{
   t:DS_CFG.WALL_VIL,mk:'banco',socle:1.05,socleMk:'rubble',madamik:true,cliffRear:cliff,
   holes:{
    s:[{at:Wd*.29,w:1.1,y:0,h:DS_CFG.DOOR_VIL_H},{at:Wd*.72,w:.62,y:1.3,h:.72}],
    e:[{at:Dd*.35,w:.58,y:1.35,h:.72},{at:Dd*.75,w:.58,y:1.35,h:.72}],
    w:[{at:Dd*.35,w:.58,y:1.35,h:.72},{at:Dd*.75,w:.58,y:1.35,h:.72}]
   }
  });
  dsVilDoor(x0+Wd*.29,0,z1,0,1.1,DS_CFG.DOOR_VIL_H,{archEyebrow:true,name:'wadi house door'});
  dsVilWin(x0+Wd*.72,1.3,z1,0,.62,.72,{solid:false,lit:true});
  for(const fz of [.35,.75]){
   dsVilWin(x1,1.35,z1-Dd*fz,PI/2,.58,.72,{solid:false});
   dsVilWin(x0,1.35,z1-Dd*fz,-PI/2,.58,.72,{solid:false});
  }
  FURNISH('nomad_kilim',.8,.08,(z0+z1)/2,0,{setting:'indoor'});
  FURNISH('nomad_bedding_stack',1.8,.08,z0+1.3,-.3,{setting:'indoor'});
  FURNISH('nomad_saj_oven',-1.8,.08,z1-1.5,0,{setting:'indoor'});
  FURNISH('nomad_water_jars',1.8,.08,z1-1.3,0,{setting:'indoor'});
  dsTarget(x0+Wd*.29,.08,(z0+z1)/2,'ground room');

  const t1=dsRoof(x0,z0,x1,z1,gh,{style:'village',cliffRear:cliff,walk:false});
  dsParapet(x0,zMid-.1,x1,z1,t1,{style:'village',h:.62,skip:'n'});

  /* 2nd storey on the rear spine (-z..zMid) + juniper-pole reed shade canopy over front terrace! */
  const uH=3.05;
  dsSolidTier(x0+.12,cliff?z0:z0+.12,x1-.12,zMid,t1,uH,{mk:'banco',madamik:true,cliffRear:cliff});
  for(const bx of [-2.0,0,2.0]){
   dsVilWin(bx,t1+.85,zMid,0,.6,.74,{solid:true,lit:bx===0});
   if(!cliff&&bx!==0)dsVilWin(bx,t1+.85,z0+.12,PI,.56,.68,{solid:true});
  }
  dsVilWin(x1-.12,t1+.85,(z0+zMid)/2,PI/2,.6,.72,{solid:true});
  dsVilWin(x0+.12,t1+.85,(z0+zMid)/2,-PI/2,.6,.72,{solid:true});
  const t2=dsRoof(x0+.12,cliff?z0:z0+.12,x1-.12,zMid,t1+uH,{style:'village',cliffRear:cliff,walk:false});
  dsParapet(x0+.12,cliff?z0:z0+.12,x1-.12,zMid,t2,{style:'village',h:.64,cliffRear:cliff});

  /* Shade pergola on front terrace */
  svNoWalk(()=>{
   const pz=(zMid+z1)/2;
   for(const sx of [-2.4,2.4])pole('timber',[sx,t1,z1-.65],[sx,t1+2.05,z1-.65],.055,P('timber'),6);
   pole('timber',[-2.6,t1+2.02,z1-.65],[2.6,t1+2.02,z1-.65],.05,P('timber'),6);
   for(let i=0;i<6;i++){
    const rx=-2.3+i*.92;
    pole('timber',[rx,t1+2.06,zMid+.05],[rx,t1+2.06,z1-.5],.038,P('timber'),5);
   }
   box('roof',0,t1+2.1,pz,4.8,.05,z1-zMid-.65,P('roofVil'));
  });
  dsMizab(x1-.2,t1,.5,z1-1.5,PI/2,{wood:true,chute:false});
 }
});

/* 19. ds_vil_house_elder: 3-storey Village Sheikh / Oasis Keeper's House (Haraz & Arfwai style) */
defBuilding({
 key:'ds_vil_house_elder',
 name:'Dasri village elder house (3 storeys)',
 seed:8203,
 cls:'building',
 kind:'house',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('rich',['dwelling-multi','civic'],'elder-house'),
 w:10.8,d:11.4,h:10.6,budget:48000,cut:true,
 front:{x:0,z:5.1,yaw:0},
 note:'3-storey Dasri village sheikh or oasis keeper house: high coursed desert rubble ground storey with lime-eyebrow arch door, 2 battered zabur mudbrick storeys stepping back on +z, simple whitewash trim & corner horn nibs.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=9.6,Dd=10.2,z0=cliff?-5.7:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble',anchorH:2.4});

  /* Full-height coursed rubble stone ground storey (3.35 m) */
  const gh=3.35,dw=1.35,dh=2.1;
  dsRing(x0,z0,x1,z1,0,gh,{
   t:DS_CFG.WALL_VIL,mk:'rubble',socle:0,cliffRear:cliff,
   holes:{
    s:[{at:Wd/2,w:dw,y:0,h:dh},{at:Wd*.2,w:.58,y:1.45,h:.72},{at:Wd*.8,w:.58,y:1.45,h:.72}],
    e:[{at:Dd*.35,w:.58,y:1.5,h:.72},{at:Dd*.7,w:.58,y:1.5,h:.72}],
    w:[{at:Dd*.35,w:.58,y:1.5,h:.72},{at:Dd*.7,w:.58,y:1.5,h:.72}]
   }
  });
  dsVilDoor(0,0,z1,0,dw,dh,{archEyebrow:true,name:'elder house door'});
  for(const sx of [-1,1])dsVilWin(sx*Wd*.3,1.45,z1,0,.58,.72,{solid:false,lit:true});
  for(const fz of [.35,.7]){
   dsVilWin(x1,1.5,z1-Dd*fz,PI/2,.58,.72,{solid:false});
   dsVilWin(x0,1.5,z1-Dd*fz,-PI/2,.58,.72,{solid:false});
  }
  /* Simple whitewashed lime belt line separating stone ground floor from mudbrick upper floors */
  svNoWalk(()=>{
   box('qadad',0,gh-.12,(z0+z1)/2,Wd+(cliff?.04:.06),.12,Dd+(cliff?0:.06),P('qadadWarm'));
  });
  FURNISH('nomad_kilim',0,.08,(z0+z1)/2,0,{setting:'indoor'});
  FURNISH('nomad_majlis_mattress',0,.08,z0+1.4,0,{setting:'indoor'});
  FURNISH('nomad_coffee_hearth',-2.4,.08,0,PI/2,{setting:'indoor'});
  FURNISH('nomad_studded_chest',2.6,.08,0,-PI/2,{setting:'indoor'});
  dsTarget(0,.08,(z0+z1)/2,'elder hall');

  /* Storey 2: battered banco mudbrick (steps back 1.6 m from front!) */
  const t1=dsRoof(x0,z0,x1,z1,gh,{style:'village',cliffRear:cliff,walk:false});
  const z2=z1-1.8;
  dsParapet(x0,z2-.1,x1,z1,t1,{style:'village',h:.62,skip:'n'});
  dsSolidTier(x0+.15,cliff?z0:z0+.15,x1-.15,z2,t1,3.0,{mk:'banco',madamik:true,cliffRear:cliff});
  for(const bx of [-2.8,0,2.8]){
   dsVilWin(bx,t1+.85,z2,0,.64,.78,{solid:true,lit:true});
   if(!cliff)dsVilWin(bx,t1+.85,z0+.15,PI,.58,.72,{solid:true});
  }
  for(const sz of [-1.4,1.4]){
   dsVilWin(x1-.15,t1+.85,(z0+z2)/2+sz,PI/2,.6,.74,{solid:true});
   dsVilWin(x0+.15,t1+.85,(z0+z2)/2+sz,-PI/2,.6,.74,{solid:true});
  }
  const t2=dsRoof(x0+.15,cliff?z0:z0+.15,x1-.15,z2,t1+3.0,{style:'village',cliffRear:cliff,walk:false});

  /* Storey 3: rear-high elder watch/council room on -z..z3 */
  const z3=z2-2.2;
  dsParapet(x0+.15,z3-.1,x1-.15,z2,t2,{style:'village',h:.62,skip:'n'});
  dsSolidTier(x0+.8,cliff?z0:z0+.25,x1-.8,z3,t2,2.95,{mk:'banco',madamik:true,cliffRear:cliff});
  for(const bx of [-2.0,0,2.0]){
   dsVilWin(bx,t2+.82,z3,0,.64,.78,{solid:true,lit:bx===0});
  }
  dsVilWin(x1-.8,t2+.82,(z0+z3)/2,PI/2,.6,.74,{solid:true});
  dsVilWin(x0+.8,t2+.82,(z0+z3)/2,-PI/2,.6,.74,{solid:true});
  const t3=dsRoof(x0+.8,cliff?z0:z0+.25,x1-.8,z3,t2+2.95,{style:'village',cliffRear:cliff,walk:false});
  dsParapet(x0+.8,cliff?z0:z0+.25,x1-.8,z3,t3,{style:'village',h:.68,crenel:true,cliffRear:cliff});
  dsMizab(x1-.2,t1,.5,z1-1.0,PI/2,{wood:true,chute:false});
  dsMizab(x0+.2,t2,.6,(z0+z2)/2,-PI/2,{wood:true,chute:false});
 }
});

/* 20. ds_vil_compound: Walled Camel & Livestock Homestead */
defBuilding({
 key:'ds_vil_compound',
 name:'Dasri walled camel and goat compound',
 seed:8204,
 cls:'building',
 kind:'compound',
 frag:'kits/dasri',
 tags:DS_VIL_TAGS('middle',['dwelling-single','farm'],'compound','herding'),
 w:13.6,d:13.2,h:7.6,budget:48000,cut:true,
 front:{x:-2.2,z:6.0,yaw:0},
 note:'Walled Dasri camel-drover and livestock homestead: battered mudbrick courtyard wall with wide timber gate, open-sided juniper beast shade & stone watering trough, saddle racks, and a 2-storey rear family dwelling.',
 build(o){
  o=o||{};
  dsInitRec(o,'village');
  const cliff=!!o.cliff;
  const Wd=12.4,Dd=12.0,z0=cliff?-6.6:-Dd/2,z1=z0+Dd,x0=-Wd/2,x1=Wd/2;
  dsPlinth(Wd,Dd,{cliff,lo:o.lo,register:'village',mk:'rubble'});

  const zHouse=z0+5.2;
  /* Front courtyard enclosure walls (2.35 m high battered banco + whitewash coping) */
  dsRing(x0,zHouse-.2,x1,z1,0,2.25,{
   t:.42,mk:'banco',socle:.65,socleMk:'rubble',skip:'n',
   holes:{s:[{at:Wd*.32,w:2.2,y:0,h:2.05}]}
  });
  const gateX=x0+Wd*.32;
  dsVilDoor(gateX,0,z1,0,2.2,2.05,{name:'compound yard gate'});
  dsParapet(x0,zHouse-.2,x1,z1,2.25,{style:'village',h:.32,skip:'n'});

  /* Beast shade lean-to along east courtyard wall + stone feed/water trough */
  svNoWalk(()=>{
   const sx0=x1-3.2,sz0=zHouse+.3,sz1=z1-.5;
   for(const pz of [sz0+.4,(sz0+sz1)/2,sz1-.4]){
    pole('timber',[sx0,0,pz],[sx0,2.45,pz],.065,P('timber'),7);
   }
   pole('timber',[sx0,2.42,sz0+.2],[sx0,2.42,sz1-.2],.06,P('timber'),7);
   box('roof',(sx0+x1-.2)/2,2.46,(sz0+sz1)/2,x1-sx0,.08,sz1-sz0,P('roofVil'));
   /* Stone feed & water trough */
   box('rubble',sx0+.55,0,(sz0+sz1)/2,.85,.52,3.4,P('rubble'));
   box('water',sx0+.55,.46,(sz0+sz1)/2,.62,.04,3.1,new THREE.Color(.24,.44,.46));
  });
  FURNISH('nomad_camel_saddle_rack',x0+1.4,.08,z1-1.6,PI/2,{setting:'outdoor'});
  FURNISH('nomad_hobble_post',-.5,.08,(zHouse+z1)/2,0,{setting:'outdoor'});
  FURNISH('nomad_water_jars',x0+1.3,.08,zHouse+1.1,0,{setting:'outdoor'});
  dsTarget(gateX,.08,(zHouse+z1)/2,'compound yard');

  /* Rear 2-storey dwelling block (-z..zHouse) */
  const gh=3.15;
  dsRing(x0,z0,x1,zHouse,0,gh,{
   t:DS_CFG.WALL_VIL,mk:'banco',socle:.95,socleMk:'rubble',madamik:true,cliffRear:cliff,
   holes:{
    s:[{at:Wd*.35,w:1.08,y:0,h:DS_CFG.DOOR_VIL_H},{at:Wd*.72,w:.6,y:1.3,h:.72}],
    w:[{at:2.6,w:.58,y:1.35,h:.7}]
   }
  });
  dsVilDoor(x0+Wd*.35,0,zHouse,0,1.08,DS_CFG.DOOR_VIL_H,{archEyebrow:true,name:'compound house door'});
  dsVilWin(x0+Wd*.72,1.3,zHouse,0,.6,.72,{solid:false,lit:true});
  dsVilWin(x0,1.35,(z0+zHouse)/2,-PI/2,.58,.7,{solid:false});
  FURNISH('nomad_kilim',0,.08,(z0+zHouse)/2,0,{setting:'indoor'});
  FURNISH('nomad_bedding_stack',2.8,.08,z0+1.2,-.4,{setting:'indoor'});
  dsTarget(x0+Wd*.35,.08,(z0+zHouse)/2,'compound house');

  const r1=dsRoof(x0,z0,x1,zHouse,gh,{style:'village',cliffRear:cliff,walk:false});
  /* Upper sleeping tower over west two-thirds of rear house */
  const ux1=x0+Wd*.66;
  dsParapet(ux1-.1,z0,x1,zHouse,r1,{style:'village',h:.58,cliffRear:cliff,skip:'w'});
  dsSolidTier(x0+.12,cliff?z0:z0+.12,ux1,zHouse-.12,r1,2.95,{mk:'banco',madamik:true,cliffRear:cliff});
  dsVilWin((x0+ux1)/2-1.1,r1+.82,zHouse-.12,0,.58,.72,{solid:true,lit:true});
  dsVilWin((x0+ux1)/2+1.1,r1+.82,zHouse-.12,0,.58,.72,{solid:true});
  dsVilWin(x0+.12,r1+.82,(z0+zHouse)/2,-PI/2,.58,.7,{solid:true});
  const r2=dsRoof(x0+.12,cliff?z0:z0+.12,ux1,zHouse-.12,r1+2.95,{style:'village',cliffRear:cliff,walk:false});
  dsParapet(x0+.12,cliff?z0:z0+.12,ux1,zHouse-.12,r2,{style:'village',h:.62,cliffRear:cliff});
 }
});
