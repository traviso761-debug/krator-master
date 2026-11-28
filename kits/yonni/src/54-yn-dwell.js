// prefix: ynd
// ================================================================= FREESTANDING DWELLINGS: Poor (3), Middle (3) & Rich (3)
// Cylindrical coastal-cobble & sea-lime round-towers, corbel-fin overhanging upper war-galleries (861d6426, 171af084),
// drum-hugging spiral stone stairs (c1eecdde), uphill contour gangplanks, and multi-drum stepped compounds linked by
// sloped roofed flying bridges (8dac4161). Every drum carries a telescoping battered cobble root-skirt (no boxy podiums!).

/* Reusable round-tower composer:
   o: {cx, cz, r, wallT, baseH, shaftH, baseMk, shaftMk, dripY, corbel, upperH, upperR, arcade, roofMk, roofOver, roofRise,
       ribs, opens0, opens1, stair, tier, center, bed, rootD} */
function yndTower(o){
 const cx=o.cx==null?0:o.cx,cz=o.cz==null?0:o.cz,r=o.r==null?2.8:o.r,wt=o.wallT==null?YN_WALL_T:o.wallT,rIn=r-wt;
 const baseH=o.baseH==null?1.9:o.baseH,shaftH=o.shaftH==null?2.8:o.shaftH,y0=o.y0==null?.16:o.y0;
 const bmk=o.baseMk||'cobble',smk=o.shaftMk||'sealime';
 ynRootSkirt(cx,cz,r,o.rootD==null?4.8:o.rootD,{mk:bmk,plinthH:y0+.26});
 ynFloorDisc(cx,cz,r-.05,y0,'flagstone',P('flagstone'));
 /* lower coarse coastal-cobble / ironstone drum + upper pale sea-lime rendered shaft */
 ynDrumWall(cx,cz,rIn,r,y0,baseH,bmk,P(bmk==='ironstone'?'ironstone':'cobble'),o.opens0||[{a:PI/2,w:1.05,h:2.05,door:true,visor:true}],{visors:true});
 /* watershed bevel collar between cobble base and sea-lime shaft */
 ynDripSkirt(cx,cz,r,y0+baseH,.28,.16,'slate',P('slate'));
 const rShaft=r-.04,rSIn=rShaft-wt;
 ynDrumWall(cx,cz,rSIn,rShaft,y0+baseH,shaftH,smk,P(smk==='sealimeWarm'?'sealimeW':'sealime'),o.opens1||[
  {a:PI*.18,w:.68,y:.85,h:1.15},{a:PI*.82,w:.68,y:.85,h:1.15},{a:-PI/2,w:.68,y:.85,h:1.15}
 ]);
 let topY=y0+baseH+shaftH,topR=rShaft;
 if(o.dripMid)ynDripSkirt(cx,cz,rShaft,y0+baseH+shaftH*.52,.42,.2,'slate',P('slate'));
 /* optional overhanging circular upper level on corbel-fins (861d6426, 171af084) */
 if(o.upperH){
  const uR=o.upperR==null?r+.58:o.upperR,corH=o.corbelH==null?1.05:o.corbelH;
  ynCorbelFins(cx,cz,rShaft,uR-.04,topY-corH,topY,o.fins==null?12:o.fins,'corbel',P('corbel'),{bronzeTip:o.tier==='rich'});
  const uY=topY+.16;
  ynFloorDisc(cx,cz,uR-.06,uY,'floor',P('floor'));
  if(o.arcade){
   ynArcadeRing(cx,cz,uR-.32,uR,uY,o.upperH,o.bays==null?10:o.bays,{paraMk:o.paraMk||'cobble',colMk:'ironwood',spandrelMk:smk,gapA:o.stair?o.stair.aTop:null});
  }else{
   ynDrumWall(cx,cz,uR-wt,uR,uY,o.upperH,smk,P('sealime'),o.opens2||[
    {a:PI/2,w:.76,y:.8,h:1.2},{a:0,w:.72,y:.8,h:1.2},{a:PI,w:.72,y:.8,h:1.2},{a:-PI/2,w:.72,y:.8,h:1.2}
   ]);
  }
  if(o.furnUpper!==false&&uR-wt>=1.85){
   ynFurnRoundRoom(cx,cz,uR-.36,uY,o.tier||'middle',{center:'table',bed:false,ceilingY:uY+o.upperH-.1});
  }
  topY=uY+o.upperH;topR=uR;
 }
 if(o.stair){
  ynSpiralStair(cx,cz,r+.04,0,o.stair.y1==null?y0+baseH+shaftH+.16:o.stair.y1,o.stair.a0==null?PI*.68:o.stair.a0,o.stair.sweep==null?PI*.82:o.stair.sweep);
 }
 if(o.furn!==false){
  ynFurnRoundRoom(cx,cz,rSIn,y0,o.tier||'middle',{center:o.center||'brazier',bed:o.bed,ceilingY:!o.upperH?topY-.1:null});
 }
 const rEave=topR+(o.roofOver==null?.92:o.roofOver);
 const peak=ynCanopy(cx,cz,topR,rEave,topY,o.roofRise==null?2.5:o.roofRise,{mk:o.roofMk||'slate',ribs:o.ribs,finial:o.finial});
 ynStormLamp(cx+Math.cos(PI*.36)*r,y0+1.95,cz+Math.sin(PI*.36)*r,ynYawFromA(PI*.36),.9);
 return {topY,peak,rEave};
}

/* ---- POOR DWELLINGS (3) ---- */
defBuilding({key:'yn-hut-fisher',name:'Tvin-Kot Coastal Fisher-Twins Cot',seed:7101,cls:'building',w:8.4,d:8.4,h:8.6,cut:true,
 tags:{types:['dwelling-single'],wealth:'poor',style:'freestanding',role:'fisher cot',job:'fishing'},
 note:'Single-drum coastal fisher-twins round-cot: river-cobble base, sea-lime shaft, slate rain-canopy, paired wool twin-pallet and fish-spear rack.',
 build(){
  yndTower({r:2.65,baseH:1.65,shaftH:1.75,baseMk:'rivercobble',shaftMk:'sealimeWarm',roofMk:'slate',roofOver:.82,roofRise:2.1,ribs:6,tier:'poor',rootD:4.2,
   opens0:[{a:PI/2,w:1.0,h:1.95,door:true,visor:true}],
   opens1:[{a:PI*.15,w:.58,y:.55,h:.9},{a:PI*.85,w:.58,y:.55,h:.9}]});
  ynNoCut(()=>{
   /* exterior fish-net drying poles clear of the drum */
   for(const sx of [-2.4,-1.1])cyl('ironwood',sx,0,3.15,.045,1.85,P('ironwood'),6);
   sagRope('rope',[-2.4,1.72,3.15],[-1.1,1.72,3.15],.14,.02,P('rope'),5);
  });
 }});

defBuilding({key:'yn-hut-shepherd',name:'Hil-Kot Scoured-Hills Shepherd Drum',seed:7102,cls:'building',w:8.6,d:8.6,h:8.4,cut:true,
 tags:{types:['dwelling-single'],wealth:'poor',style:'freestanding',role:'shepherd hut',job:'herding'},
 note:'Low wind-hugging rust-ironstone cobble drum under a heavy turf-and-slate rain-canopy for Scoured-Hills twin shepherds.',
 build(){
  yndTower({r:2.8,baseH:1.85,shaftH:1.4,baseMk:'ironstone',shaftMk:'sealimeWarm',roofMk:'turf',roofOver:.88,roofRise:1.95,ribs:0,tier:'poor',rootD:4.6,
   opens0:[{a:PI/2,w:1.0,h:1.92,door:true,visor:true}],
   opens1:[{a:0,w:.55,y:.42,h:.78},{a:PI,w:.55,y:.42,h:.78}]});
 }});

defBuilding({key:'yn-hut-miner',name:'Or-Kot Twin-Miners Stepped Cot',seed:7103,cls:'building',w:9.2,d:9.2,h:9.4,cut:true,
 tags:{types:['dwelling-single'],wealth:'poor',style:'freestanding',role:'miner cot',job:'mining'},
 note:'Stepped ironstone & sea-lime round-cot with a raised storm doorway reached by a short stone flight and uphill contour gangplank.',
 build(){
  yndTower({cz:-.06,r:2.75,y0:.52,baseH:1.8,shaftH:1.9,baseMk:'ironstone',shaftMk:'sealime',roofMk:'shingle',roofOver:.85,roofRise:2.2,ribs:6,tier:'poor',rootD:5.0,
   opens0:[{a:PI/2,w:1.0,h:1.95,door:true,visor:true}],
   opens1:[{a:PI*.2,w:.6,y:.6,h:.95},{a:-PI*.5,w:.6,y:.6,h:.95}]});
  ynNoCut(()=>svStair(0,3.62,0,.52,PI,{style:'solid',w:1.15,mk:'flagstone',col:P('flagstone'),run:.9}));
 }});

/* ---- MIDDLE DWELLINGS (3) ---- */
defBuilding({key:'yn-house-drum',name:'Kharth-Tur Hearth-Sister Round-Tower',seed:7104,cls:'building',w:11.6,d:11.6,h:14.2,cut:true,
 tags:{types:['dwelling-single'],wealth:'middle',style:'freestanding',role:'round-tower house'},
 note:'Two-storey Hearth-Sister round-tower: battered granite-cobble base, sea-lime shaft, mid-wall drip-skirt, overhanging ironwood gallery and spiral stone stair.',
 build(){
  yndTower({r:3.2,baseH:2.2,shaftH:2.6,dripMid:true,upperH:2.45,upperR:3.75,arcade:true,bays:10,roofMk:'slate',roofOver:.95,roofRise:2.75,ribs:8,tier:'middle',rootD:5.4,
   stair:{a0:PI*.66,sweep:PI*.88,aTop:PI*1.54},
   opens0:[{a:PI/2,w:1.12,h:2.1,door:true,visor:true},{a:PI*.15,w:.68,y:.95,h:1.1}],
   opens1:[{a:PI*.35,w:.72,y:.75,h:1.15},{a:-PI*.35,w:.72,y:.75,h:1.15},{a:PI*1.54,w:.95,y:.15,h:1.95,door:true}]});
 }});

defBuilding({key:'yn-house-twindrum',name:'Tvin-Sisitae Linked Twin-Drum House',seed:7105,cls:'building',w:16.8,d:11.4,h:13.8,cut:true,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'freestanding',role:'twin-drum house'},
 note:'Paired unequal round-towers for two married twin-sister households, joined by a sloped roofed flying bridge and uphill contour gangplank.',
 build(){
  /* west main Hearth-drum */
  yndTower({cx:-3.62,cz:.1,r:3.05,baseH:2.1,shaftH:2.7,roofMk:'slate',roofOver:.88,roofRise:2.65,ribs:8,tier:'middle',rootD:5.5,
   stair:{a0:PI*.62,sweep:PI*.76},
   opens0:[{a:PI/2,w:1.1,h:2.08,door:true,visor:true}],
   opens1:[{a:0,w:.92,y:.45,h:1.85,door:true,open:true,quoins:true},{a:PI*.75,w:.68,y:.8,h:1.1}]});
  /* east stepped sister-drum (set 0.65 m higher for steep-hill compound silhouette) */
  yndTower({cx:4.08,cz:-.24,y0:.65,baseH:1.95,shaftH:2.4,roofMk:'verdigris',roofOver:.82,roofRise:2.35,ribs:8,tier:'middle',center:'table',rootD:5.8,
   opens0:[{a:PI/2,w:.98,h:1.95,door:true,visor:true}],
   opens1:[{a:PI,w:.92,y:.3,h:1.85,door:true,open:true,quoins:true},{a:PI*.22,w:.65,y:.75,h:1.05}]});
  ynNoCut(()=>svStair(4.08,3.66,0,.65,PI,{style:'solid',w:1.1,mk:'flagstone',col:P('flagstone'),run:.85}));
  /* sloped roofed flying bridge spanning between upper drums (8dac4161) */
  ynFlyingBridge(-.57,2.65,.06,1.53,3.0,-.2,1.35,{roofMk:'slate'});
 }});

defBuilding({key:'yn-house-corbel',name:'Fild-Kande Corbel-Fin Manor Tower',seed:7106,cls:'building',w:12.4,d:12.4,h:15.4,cut:true,
 tags:{types:['dwelling-single'],wealth:'middle',style:'freestanding',role:'corbel-fin tower'},
 note:'Tall cylindrical shaft flaring on 14 vertical stone corbel-fins (861d6426) to carry a wider overhanging sea-lime upper chamber and verdigris canopy.',
 build(){
  yndTower({r:3.05,baseH:2.3,shaftH:3.1,upperH:2.6,upperR:3.85,corbelH:1.35,fins:14,arcade:false,roofMk:'verdigris',roofOver:.95,roofRise:2.85,ribs:10,tier:'middle',rootD:5.6,
   stair:{a0:PI*.65,sweep:PI*.92,y1:5.72},
   opens0:[{a:PI/2,w:1.15,h:2.15,door:true,visor:true},{a:-PI*.25,w:.68,y:.95,h:1.1}],
   opens1:[{a:PI*.22,w:.68,y:.9,h:1.2},{a:PI*.82,w:.68,y:.9,h:1.2}],
   opens2:[{a:PI/2,w:.82,y:.82,h:1.25},{a:0,w:.78,y:.82,h:1.25},{a:PI,w:.78,y:.82,h:1.25},{a:-PI/2,w:.78,y:.82,h:1.25}]});
 }});

/* ---- RICH DWELLINGS & COMPOUNDS (3) ---- */
defBuilding({key:'yn-manor-triad',name:'Sfira-Kharth Spear-Noble Triad Compound',seed:7107,cls:'building',w:20.6,d:15.4,h:16.8,cut:true,
 tags:{types:['dwelling-multi'],wealth:'rich',style:'freestanding',role:'noble triad compound'},
 note:'Three clustered sea-lime & granite-cobble drums on stepped battered skirts linked by two roofed flying bridges under verdigris & slate canopies.',
 build(){
  /* central noble keep drum with overhanging arcaded war-gallery */
  yndTower({cx:0,cz:-.2,r:3.55,baseH:2.35,shaftH:3.0,upperH:2.65,upperR:4.25,corbelH:1.25,fins:14,arcade:true,bays:12,
   roofMk:'verdigris',roofOver:1.0,roofRise:3.1,ribs:12,tier:'rich',rootD:6.2,
   stair:{a0:PI*.64,sweep:PI*.86,aTop:PI*1.5},
   opens0:[{a:PI/2,w:1.28,h:2.22,door:true,visor:true}]});
  /* west hearth-sister wing */
  yndTower({cx:-6.4,cz:1.95,y0:.35,r:2.65,baseH:1.9,shaftH:2.35,roofMk:'slate',roofOver:.82,roofRise:2.3,ribs:8,tier:'rich',center:'table',rootD:5.4,
   opens0:[{a:PI/2,w:.98,h:1.98,door:true,visor:true}]});
  /* east armoury & guest wing */
  yndTower({cx:6.4,cz:1.85,y0:.55,r:2.65,baseH:1.95,shaftH:2.45,roofMk:'slate',roofOver:.82,roofRise:2.35,ribs:8,tier:'rich',rootD:5.6,
   opens0:[{a:PI/2,w:.98,h:1.98,door:true,visor:true}]});
  ynFlyingBridge(-3.8,2.85,1.4,-2.85,3.15,.5,1.25,{roofMk:'verdigris'});
  ynFlyingBridge(2.85,3.15,.5,3.8,3.0,1.35,1.25,{roofMk:'verdigris'});
  ynBanner(-2.1,0,4.1,0,2.8,P('carnelian'));
  ynBanner(2.1,0,4.1,0,2.8,P('indigo'));
 }});

defBuilding({key:'yn-manor-cupola',name:'Kande-Hold Hearth-Queen Cupola Tower',seed:7108,cls:'building',w:13.6,d:13.6,h:17.6,cut:true,
 tags:{types:['dwelling-single'],wealth:'rich',style:'freestanding',role:'cupola manor'},
 note:'Grand coastal-granite & sea-lime noble drum crowned by a fluted-corbel arcaded loggia and bronze-ribbed cupola (171af084).',
 build(){
  const r=3.75;
  const T=yndTower({r,baseH:2.5,shaftH:3.2,dripMid:true,upperH:2.85,upperR:4.55,corbelH:1.4,fins:16,arcade:true,bays:12,paraMk:'sealime',
   roofMk:'verdigris',roofOver:1.05,roofRise:2.6,ribs:12,finial:false,tier:'rich',rootD:6.4,
   stair:{a0:PI*.62,sweep:PI*.92,aTop:PI*1.54},
   opens0:[{a:PI/2,w:1.32,h:2.28,door:true,visor:true},{a:0,w:.76,y:1.0,h:1.2},{a:PI,w:.76,y:1.0,h:1.2}]});
  /* lantern cupola rising above the main canopy hub */
  const cy=T.topY+2.45;
  ynNoCut(()=>{
   ynArcadeRing(0,0,1.05,1.38,cy,1.65,8,{paraH:.35,paraMk:'ashlar',colMk:'bronze',spandrelMk:'sealime',archH:.38,colR:.07});
   ynCanopy(0,0,1.38,1.88,cy+1.65,1.35,{mk:'verdigris',ribs:8,finialScale:.95});
  });
 }});

defBuilding({key:'yn-manor-envoy',name:'Gest-Rotunda Envoys & Captains Compound',seed:7109,cls:'building',w:18.2,d:13.2,h:14.8,cut:true,
 tags:{types:['dwelling-multi','civic'],wealth:'rich',style:'freestanding',role:'embassy'},
 note:'Paired reception rotunda and envoy residence linked by a stone-arched flying gallery with carnelian banners and twin-hearth hall.',
 build(){
  yndTower({cx:-3.65,cz:0,r:3.45,baseH:2.2,shaftH:2.85,upperH:2.35,upperR:4.0,fins:12,arcade:true,bays:10,
   roofMk:'verdigris',roofOver:.92,roofRise:2.6,ribs:10,tier:'rich',center:'table',rootD:5.8,
   stair:{a0:PI*.72,sweep:PI*.85,aTop:PI*1.57},
   opens0:[{a:PI/2,w:1.25,h:2.2,door:true,visor:true}],
   opens1:[{a:0,w:1.05,y:.59,h:1.95,door:true,open:true},{a:PI*.82,w:.68,y:.85,h:1.15},{a:-PI/2,w:.68,y:.85,h:1.15}]});
  yndTower({cx:4.75,cz:.15,y0:.28,r:2.95,baseH:2.0,shaftH:2.6,roofMk:'slate',roofOver:.88,roofRise:2.45,ribs:8,tier:'rich',rootD:5.5,
   opens0:[{a:PI/2,w:1.05,h:2.05,door:true,visor:true}],
   opens1:[{a:PI,w:1.05,y:.67,h:1.9,door:true,open:true},{a:PI*.18,w:.68,y:.85,h:1.15},{a:-PI/2,w:.68,y:.85,h:1.15}]});
  svStair(-3.1,-1.55,.16,2.95,PI/2,{w:.82,mk:'ironwood',col:P('ironwood'),run:3.0});
  ynFlyingBridge(-.4,2.95,.05,2.0,2.95,.12,1.38,{roofMk:'verdigris',arch:true,archDrop:1.35});
  ynBanner(-3.65,0,4.15,0,2.7,P('carnelian'));
 }});
