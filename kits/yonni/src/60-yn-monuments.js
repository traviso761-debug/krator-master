// prefix: ynm
// ================================================================= MONUMENTAL SPIRES, RING-COURTS, GILT MONASTERIES & HEX-STILT CITADELS
// Six freestanding Yonni sacred, civic, and military landmarks expanding the Twin Spear-Queens kit:
//   1. yn-spire-saucers         — Cantilevered Saucer-Terrace Spire (4 staggered corbelled saucer platforms + gilt stepped domes)
//   2. yn-monastery-giltcluster — Clustered Golden-Dome Seer Monastery (5 slender white sea-lime shafts + corbelled gilt domes)
//   3. yn-arena-ringcourt       — Annular Sunken-Court Moot & Exchange (open central amphitheatre pit + 4 domed stair-drums)
//   4. yn-sanctuary-giltgate    — Gilt-Dome & Verdigris-Disc Sanctuary Bastion (stepped white sea-lime walls + disc slot-towers)
//   5. yn-shrine-pylondome      — Four-Pylon Buttressed Terracotta-Dome Shrine (4 obelisk pylons + garlanded low dome + vault annex)
//   6. yn-citadel-hexstilt      — Hexagonal-Truss Stilted Pagoda Watch-Citadel (open hex-frame stilt legs + tiered pagoda keep)

/* Helper: smooth bulbous / hemispherical burnished dome with inner timber/travertine vault liner and meridian bronze ribs */
function ynmBulbDome(cx,cz,rBase,yBase,hDome,mk,col,o){
 o=o||{};const seg=o.seg==null?20:o.seg,m=mk||'gilt',c=col==null?P(m==='verdigris'?'verdigris':m==='terracotta'?'terracotta':'gilt'):col;
 const bulge=o.bulge==null?1.08:o.bulge,ribMk=o.ribMk||'bronze',ribCol=P(ribMk==='gilt'?'gilt':'bronze');
 const prof=[
  [rBase+.015,yBase+.008],
  [rBase*bulge,yBase+hDome*.28],
  [rBase*.88,yBase+hDome*.58],
  [rBase*.54,yBase+hDome*.84],
  [.20,yBase+hDome]
 ];
 lathe(m,cx,cz,prof,seg,c,{uv:'cone'});
 const inProf=[
  [Math.max(.04,rBase-.045),yBase+.004],
  [Math.max(.04,rBase*bulge-.06),yBase+hDome*.27],
  [Math.max(.04,rBase*.84),yBase+hDome*.56],
  [Math.max(.04,rBase*.50),yBase+hDome*.82],
  [.01,yBase+hDome-.05]
 ];
 lathe('travertine',cx,cz,inProf,seg,P('travertine'),{uv:'cone',inward:true});
 ring(ribMk,cx,yBase+.035,cz,rBase+.05,.055,ribCol,0,0,0,seg);
 const nRibs=o.ribs==null?8:o.ribs;
 for(let i=0;i<nRibs;i++){
  const a=i/nRibs*TAU,ca=Math.cos(a),sa=Math.sin(a);
  const p0=[cx+ca*(rBase+.03),yBase+.06,cz+sa*(rBase+.03)];
  const pm=[cx+ca*(rBase*bulge+.025),yBase+hDome*.34,cz+sa*(rBase*bulge+.025)];
  const p1=[cx+ca*.24,yBase+hDome-.02,cz+sa*.24];
  beam(ribMk,p0,pm,.042,ribCol,true,6);
  beam(ribMk,pm,p1,.036,ribCol,true,6);
 }
 if(o.finial!==false){
  ynTwinSpearFinial(cx,yBase+hDome+.008,cz,o.finialScale==null?Math.max(.58,Math.min(1.18,rBase/2.6)):o.finialScale);
 }
}

/* Helper: cantilevered saucer-disc terrace carried on curved fluted stone corbel-ribs */
function ynmSaucerPod(cx,cz,rStem,rSaucer,yBot,yDeck,o){
 o=o||{};const cbCol=P('corbel'),slCol=P('sealime'),trCol=P('travertine'),gtCol=P('gilt'),tcCol=P('terracotta');
 ynNoCut(()=>svNoWalk(()=>{
  lathe('sealime',cx,cz,[
   [rStem,yBot],[rStem+.28,lerp(yBot,yDeck,.45)],[rSaucer-.36,yDeck-.32],[rSaucer+.06,yDeck-.09],[rSaucer+.08,yDeck+.04]
  ],20,slCol,{uv:'arc'});
  ynCorbelFins(cx,cz,rStem+.02,rSaucer-.06,yBot+.12,yDeck-.10,o.fins==null?10:o.fins,'corbel',cbCol,{bronzeTip:true});
  /* saucer rim parapet + warm gilt/terracotta stepped domelet */
  sector('travertine',cx,cz,rSaucer-.22,rSaucer+.04,0,TAU,yDeck+.052,yDeck+.58,trCol,20);
  ring('bronze',cx,yDeck+.61,cz,rSaucer+.05,.04,P('bronze'),0,0,0,20);
 }));
 ynFloorDisc(cx,cz,rSaucer-.26,yDeck,'flagstone',P('flagstone'),{seg:16,walk:false});
 if(o.cupolaR){
  const rc=o.cupolaR,ch=o.cupolaH==null?1.95:o.cupolaH;
  ynNoCut(()=>svNoWalk(()=>{
   ynArcadeRing(cx,cz,rc-.26,rc,yDeck+.01,ch,8,{paraH:.26,paraMk:'travertine',colMk:'bronze',spandrelMk:'sealimeWarm',archH:.34,colR:.075});
   /* stepped double-tier amber-gilt & terracotta cupola dome */
   sector('terracotta',cx,cz,rc*.72,rc+.18,0,TAU,yDeck+ch+.012,yDeck+ch+.30,tcCol,16);
   ynmBulbDome(cx,cz,rc*.82,yDeck+ch+.32,rc*1.05,'gilt',gtCol,{bulge:1.02,ribs:6,finialScale:.62,seg:16});
  }));
 }
}

/* Helper: open hexagonal stone-and-ironwood structural lattice ring-truss leg (for yn-citadel-hexstilt) */
function ynmHexTrussLeg(x,y0,z,ry,spanW,legH){
 const asCol=P('ashlar'),iwCol=P('ironwood'),bzCol=P('bronze');
 ynNoCut(()=>svNoWalk(()=>W(x,y0,z,ry,()=>{
  const hw=spanW*.5,ym=legH*.52,wTop=hw*.76;
  /* 6-segment hexagonal stone-and-ironwood portal frame with bronze gusset bosses */
  const pts=[
   [-hw*.82,.01,0],[-hw,ym,0],[-wTop,legH-.14,0],
   [wTop,legH-.14,0],[hw,ym,0],[hw*.82,.01,0]
  ];
  for(let i=0;i<5;i++){
   beam('ashlar',pts[i],pts[i+1],.38,asCol,false,undefined,.34);
   /* inset oiled ironwood inner web chord proud along +-z by 4 cm so zero coplanarity */
   for(const sz of [-1,1]){
    const a=[pts[i][0]*.92,pts[i][1],sz*.19],b=[pts[i+1][0]*.92,pts[i+1][1],sz*.19];
    beam('ironwood',a,b,.09,iwCol,false,undefined,.09);
   }
  }
  /* bottom tie-sill + diagonal upper corner struts + bronze pin-bosses at hex vertices */
  beam('ironwood',[-hw*.94,ym,0],[0,legH-.18,0],.12,iwCol);
  beam('ironwood',[hw*.94,ym,0],[0,legH-.18,0],.12,iwCol);
  for(const p of pts.slice(1,5)){
   WX(p[0],p[1],0,0,PI/2,0,()=>cyl('bronze',0,-.23,0,.18,.46,bzCol,8));
  }
 })));
}

/* ================================================================= 1. CANTILEVERED SAUCER-TERRACE SPIRE (yn-spire-saucers) */
defBuilding({key:'yn-spire-saucers',name:'Kande-Skir Cantilevered Saucer-Terrace Spire',seed:7614,cls:'building',w:18.8,d:18.8,h:26.8,budget:120000,cut:true,
 tags:{types:['civic','religious'],wealth:'rich',style:'freestanding',role:'saucer-terrace spire',job:'worship'},
 note:'Soaring tapered white sea-lime spire sprouting four staggered cantilevered circular saucer-disc platforms on curved fluted corbel-ribs, each saucer crowned with stepped terracotta and burnished-gilt cupola domes.',
 build(){
  const y0=.34,rB=3.85,rM=3.15,rT=2.35;
  const slCol=P('sealime'),slWarm=P('sealimeW'),cbCol=P('cobble'),trCol=P('travertine'),gtCol=P('gilt');

  ynRootSkirt(0,0,rB,6.4,{mk:'cobble',col:cbCol,plinthH:y0+.30,seg:20});
  ynFloorDisc(0,0,rB-.06,y0,'flagstone',P('flagstone'),{seg:18});
  ynNoCut(()=>svStair(0,rB+.92,0,y0,PI,{style:'solid',w:1.65,mk:'travertine',col:trCol,run:1.05}));
  /* rear counter-buttress shrine niche so front stair is balanced around (0,0) */
  ynNoCut(()=>svNoWalk(()=>{
   ynRootSkirt(0,-rB-.45,1.25,4.2,{mk:'cobble',plinthH:.32,seg:12});
   cyl('sealime',0,.01,-rB-.45,1.18,3.6,slCol,12,.96);
   ynmBulbDome(0,-rB-.45,1.02,3.62,1.25,'gilt',gtCol,{ribs:6,finialScale:.55,seg:12});
  }));

  /* Lower cobble & sea-lime sanctuary drum + middle & upper tapered spire stages */
  ynDrumWall(0,0,rB-.38,rB,y0,4.2,'cobble',cbCol,[
   {a:PI/2,w:1.45,h:2.45,door:true,visor:true,visorOut:.75},
   {a:0,w:.82,y:1.15,h:1.55,pane:'stained'},{a:PI,w:.82,y:1.15,h:1.55,pane:'stained'}
  ]);
  ynDripSkirt(0,0,rB,y0+4.2,.44,.22,'terracotta',P('terracotta'),{seg:20});
  ynFloorDisc(0,0,rM-.06,y0+4.22,'floor',P('floor'),{seg:16});
  ynDrumWall(0,0,rM-.36,rM,y0+4.22,6.4,'sealime',slCol,[
   {a:PI*.25,w:.72,y:1.2,h:1.65,pane:'stained'},{a:PI*.75,w:.72,y:1.2,h:1.65,pane:'stained'},
   {a:-PI*.25,w:.72,y:3.6,h:1.55,pane:'lit'},{a:-PI*.75,w:.72,y:3.6,h:1.55,pane:'lit'}
  ]);
  ynSpiralStair(0,0,rB+.04,y0,y0+4.22,PI*.34,-PI*.68,{w:.88});

  /* Upper slender spire shaft (y = 10.96 .. 18.6) */
  ynNoCut(()=>svNoWalk(()=>{
   lathe('sealime',0,0,[[rM+.02,y0+10.62],[rT+.28,14.5],[rT,18.55]],20,slCol,{uv:'arc'});
   for(let i=0;i<4;i++){
    const a=i*PI/2+PI/4,yaw=ynYawFromA(a),rr0=lerp(rM,rT,.58)+.02;
    W(Math.cos(a)*rr0,15.2,Math.sin(a)*rr0,yaw,()=>ynpOculusMedallion(.52,{tailH:.75}));
   }
  }));

  /* Four staggered cantilevered saucer-disc platforms balanced symmetrically across the 4 quadrants! */
  const saucers=[
   {a:PI*.22,rad:3.95,rStem:1.15,rS:2.85,yb:4.5,yd:6.85,cr:1.68,ch:1.85},
   {a:PI*1.22,rad:3.95,rStem:1.12,rS:2.85,yb:6.8,yd:9.15,cr:1.62,ch:1.80},
   {a:PI*.72,rad:3.65,rStem:1.05,rS:2.65,yb:9.6,yd:11.95,cr:1.48,ch:1.72},
   {a:PI*1.72,rad:3.65,rStem:1.02,rS:2.65,yb:12.1,yd:14.45,cr:1.42,ch:1.68}
  ];
  for(const s of saucers){
   const sx=Math.cos(s.a)*s.rad,sz=Math.sin(s.a)*s.rad;
   ynNoCut(()=>svNoWalk(()=>beam('corbel',[Math.cos(s.a)*(rM-.4),s.yb+.35,Math.sin(s.a)*(rM-.4)],[sx,s.yb+.65,sz],.72,P('corbel'),false,undefined,.56)));
   ynmSaucerPod(sx,sz,s.rStem,s.rS,s.yb,s.yd,{cupolaR:s.cr,cupolaH:s.ch,fins:10});
  }

  /* Crown Saucer-Gallery & Sovereign Stepped Gilt Pagoda-Dome (y = 18.55 .. 25.8) */
  ynmSaucerPod(0,0,rT-.04,4.05,16.4,18.75,{cupolaR:2.35,cupolaH:2.35,fins:14});
  ynNoCut(()=>svNoWalk(()=>{
   /* extra upper lantern crown atop the main cupola so the central spire commands the silhouette */
   cyl('travertine',0,23.55,0,.68,.85,trCol,12,.54);
   ynmBulbDome(0,0,.66,24.41,.95,'gilt',gtCol,{ribs:6,finialScale:.85,seg:14});
  }));

  /* Sanctuary interior furnishing (7 pieces, cleanly spaced with >= 0.8 m radial clearance) */
  FURNISH('yonni_court_carpet',0,y0,0,0);
  FURNISH('yonni_common_seer_basin',0,y0+.05,0,0);
  FURNISH('yonni_common_brazier',-1.95,y0+.008,1.15,0);
  FURNISH('yonni_common_brazier',1.95,y0+.008,1.15,0);
  FURNISH('yonni_common_dual_spear_rack',-2.65,y0,-.65,PI/2);
  FURNISH('yonni_common_banner',-1.65,y0,-2.15,PI*.12);
  FURNISH('yonni_common_banner',1.65,y0,-2.15,-PI*.12);
 }});

/* ================================================================= 2. GOLDEN-DOME SEER MONASTERY CLUSTER (yn-monastery-giltcluster) */
defBuilding({key:'yn-monastery-giltcluster',name:'Loni-Kor Golden-Dome Seer Monastery',seed:7615,cls:'building',w:20.6,d:19.8,h:26.4,budget:120000,cut:true,
 tags:{types:['religious','civic'],wealth:'rich',style:'freestanding',role:'golden-dome monastery',job:'worship'},
 note:'Clustered vertical sanctuary of five slender pale sea-lime cylindrical towers flaring via fluted stone corbel-baskets into open colonnaded galleries topped with luminous burnished-gilt domes and oculus drums.',
 build(){
  const slCol=P('sealime'),trCol=P('travertine'),cbCol=P('cobble'),gtCol=P('gilt');
  /* 1 Central High Sanctuary Shaft + 4 Sister-Seer Towers balanced cleanly around (0,0) */
  const towers=[
   {cx:0,cz:-.25,r:3.45,y0:.36,hCob:3.4,hLime:12.2,rGal:4.25,hGal:2.45,hDome:3.85,main:true},
   {cx:-4.55,cz:-2.35,r:2.25,y0:.28,hCob:2.6,hLime:9.4,rGal:2.85,hGal:1.95,hDome:2.75},
   {cx:4.55,cz:-2.35,r:2.25,y0:.28,hCob:2.6,hLime:10.6,rGal:2.85,hGal:1.95,hDome:2.85},
   {cx:-4.25,cz:2.45,r:2.15,y0:.28,hCob:2.4,hLime:7.6,rGal:2.72,hGal:1.85,hDome:2.55},
   {cx:4.25,cz:2.45,r:2.15,y0:.28,hCob:2.4,hLime:8.6,rGal:2.72,hGal:1.85,hDome:2.65}
  ];

  towers.forEach((t,idx)=>{
   ynRootSkirt(t.cx,t.cz,t.r,6.2,{mk:'cobble',col:cbCol,plinthH:t.y0+.26,seg:16});
   ynFloorDisc(t.cx,t.cz,t.r-.06,t.y0,'flagstone',P('flagstone'),{seg:16});
   const opens0=t.main?[
    {a:PI/2,w:1.42,h:2.45,door:true,visor:true,visorOut:.72},
    {a:-PI*.28,w:1.05,h:2.05,door:true,open:true},{a:-PI*.72,w:1.05,h:2.05,door:true,open:true}
   ]:[{a:PI/2,w:.68,y:.95,h:1.25,pane:'stained'}];
   ynDrumWall(t.cx,t.cz,t.r-.34,t.r,t.y0,t.hCob,'cobble',cbCol,opens0);
   ynDripSkirt(t.cx,t.cz,t.r,t.y0+t.hCob,.34,.18,'travertine',trCol,{seg:16});

   /* Tall white sea-lime shaft with vertical recessed slot-windows & oculus roundels */
   const yL=t.y0+t.hCob+.01;
   ynDrumWall(t.cx,t.cz,t.r-.36,t.r-.03,yL,t.hLime,'sealime',slCol,[
    {a:PI/2,w:.58,y:1.4,h:2.15,pane:'stained'},
    {a:PI/2,w:.58,y:t.hLime-3.2,h:1.85,pane:'lit'},
    {a:idx%2===0?0:PI,w:.56,y:t.hLime*.48,h:1.85,pane:'lit'}
   ]);

   /* Flared fluted corbel-basket + open colonnaded gallery + perforated oculus drum + burnished Gilt Bulbous Dome! */
   const yC=yL+t.hLime;
   ynNoCut(()=>svNoWalk(()=>{
    ynCorbelFins(t.cx,t.cz,t.r-.03,t.rGal-.05,yC-1.65,yC,t.main?16:10,'corbel',P('corbel'),{bronzeTip:true});
    ynFloorDisc(t.cx,t.cz,t.rGal-.08,yC+.14,'travertine',trCol,{seg:16,walk:false});
    ynArcadeRing(t.cx,t.cz,t.rGal-.34,t.rGal,yC+.15,t.hGal,t.main?14:10,{
     paraH:.42,paraMk:'sealime',paraCol:slCol,colMk:'travertine',colCol:trCol,spandrelMk:'gilt',spandrelCol:gtCol,archH:.42,colR:.095
    });
    /* Perforated oculus clerestory drum right beneath the golden dome */
    const yD=yC+.16+t.hGal,rDrum=t.rGal*.82;
    sector('sealime',t.cx,t.cz,rDrum-.26,rDrum,0,TAU,yD+.008,yD+.92,slCol,18);
    const nOc=t.main?8:6;
    for(let k=0;k<nOc;k++){
     const oa=k/nOc*TAU,oyaw=ynYawFromA(oa);
     W(t.cx+Math.cos(oa)*(rDrum+.01),yD+.46,t.cz+Math.sin(oa)*(rDrum+.01),oyaw,()=>{
      WX(0,0,.008,0,PI/2,0,()=>cyl('ironstone',0,0,0,.22,.016,0x1e1916,10));
      ring('gilt',0,0,.028,.24,.032,gtCol,0,0,0,12);
     });
    }
    ynmBulbDome(t.cx,t.cz,rDrum+.04,yD+.94,t.hDome,'gilt',gtCol,{
     bulge:1.10,ribMk:'gilt',ribs:t.main?10:8,finialScale:t.main?1.18:.78,seg:18
    });
   }));
  });

  /* Stepped front travertine stair + two high flying gallery bridges linking central spire to front & rear sister-towers */
  ynNoCut(()=>{
   svStair(0,3.85,0,.36,PI,{style:'solid',w:1.75,mk:'travertine',col:trCol,run:.95});
   ynFlyingBridge(-2.35,7.45,-1.55,-3.15,7.45,-1.85,1.22,{roofMk:'verdigris'});
   ynFlyingBridge(2.35,7.45,-1.55,3.15,7.45,-1.85,1.22,{roofMk:'verdigris'});
   ynFlyingBridge(-2.25,6.25,1.35,-2.95,6.25,1.75,1.18,{roofMk:'verdigris'});
   ynFlyingBridge(2.25,6.25,1.35,2.95,6.25,1.75,1.18,{roofMk:'verdigris'});
  });

  /* Monastery sanctuary & scriptorium cell furnishing (9 pieces) */
  FURNISH('yonni_court_carpet',0,.36,-.25,0);
  FURNISH('yonni_common_seer_basin',0,.41,-.25,0);
  FURNISH('yonni_works_scribe_desk',-1.85,.36,-.95,PI*.25);
  FURNISH('yonni_works_scribe_desk',1.85,.36,-.95,-PI*.25);
  FURNISH('yonni_common_brazier',-1.55,.366,1.25,0);
  FURNISH('yonni_common_brazier',1.55,.366,1.25,0);
  FURNISH('yonni_common_twin_alcove',-4.55,.28,-2.85,0);
  FURNISH('yonni_common_twin_alcove',4.55,.28,-2.85,0);
  FURNISH_HANG('yonni_common_storm_lamp',0,3.65,-.25,0);
 }});

/* ================================================================= 3. ANNULAR SUNKEN-COURT MOOT & EXCHANGE (yn-arena-ringcourt) */
defBuilding({key:'yn-arena-ringcourt',name:'Mot-Ring Annular Sunken-Court Moot & Exchange',seed:7610,cls:'building',w:24.8,d:24.8,h:14.2,budget:120000,cut:true,
 tags:{types:['civic','market'],wealth:'rich',style:'freestanding',role:'annular moot ring-court',job:'trading'},
 note:'Massive segmented battered circular sea-lime ring-building enclosing an open sunken stone amphitheatre court, flanked by four engaged domed stair-drums at the diagonal axes.',
 build(){
  const rCourt=5.15,rIn=5.85,rOut=9.35,yRing=.46,hWall=6.65;
  const slWarm=P('sealimeW'),asCol=P('ashlar'),trCol=P('travertine'),flCol=P('flagstone');

  ynRootSkirt(0,0,rOut+.25,5.8,{mk:'cobble',plinthH:yRing+.18,seg:28});
  /* Annular walkable floor ring + stepped inner sunken-court amphitheatre descending toward central floor */
  ynNoCut(()=>{
   sector('flagstone',0,0,rIn-.06,rOut-.10,0,TAU,.008,yRing,flCol,28);
   for(let s=0;s<3;s++){
    const ra=rCourt-.48*(s+1),rb=rCourt-.48*s-.04,yt=yRing-.10*(s+1);
    sector('travertine',0,0,ra,rb,0,TAU,.024,yt,trCol,24);
   }
   ynFloorDisc(0,0,rCourt-1.52,.14,'flagstone',flCol,{th:.10,seg:20});
   svStair(0,rOut+1.06,0,yRing,PI,{style:'solid',w:2.25,mk:'travertine',col:trCol,run:.95});
   svStair(0,-rOut-1.06,0,yRing,0,{style:'solid',w:2.25,mk:'travertine',col:trCol,run:.95});
  });

  /* Outer battered segmented sea-lime ring-wall with North/South gate arches & 16 radial ashlar buttress-ribs */
  ynDrumWall(0,0,rOut-.42,rOut,yRing,hWall,'sealimeWarm',slWarm,[
   {a:PI/2,w:2.25,h:3.15,door:true,visor:true,visorOut:.85},
   {a:-PI/2,w:2.05,h:2.95,door:true,open:true,visor:true,visorOut:.75},
   {a:0,w:.62,y:1.6,h:2.45,pane:'lit'},{a:PI,w:.62,y:1.6,h:2.45,pane:'lit'},
   {a:PI*.16,w:.55,y:1.8,h:2.25},{a:PI*.34,w:.55,y:1.8,h:2.25},
   {a:PI*.66,w:.55,y:1.8,h:2.25},{a:PI*.84,w:.55,y:1.8,h:2.25},
   {a:-PI*.16,w:.55,y:1.8,h:2.25},{a:-PI*.34,w:.55,y:1.8,h:2.25},
   {a:-PI*.66,w:.55,y:1.8,h:2.25},{a:-PI*.84,w:.55,y:1.8,h:2.25}
  ]);

  /* Inner two-tier colonnade overlooking the open central sunken court! */
  const yGal=yRing+3.35;
  ynNoCut(()=>{
   sector('floor',0,0,rIn-.04,rOut-.46,0,TAU,yGal-.14,yGal,P('floor'),28);
   ynArcadeRing(0,0,rIn,rIn+.34,yRing,3.20,16,{paraH:0,colMk:'travertine',colCol:trCol,spandrelMk:'ashlar',spandrelCol:asCol,archH:.48,colR:.14});
   ynArcadeRing(0,0,rIn,rIn+.32,yGal+.008,hWall-3.36,16,{paraH:.78,paraMk:'travertine',paraCol:trCol,colMk:'ironwood',spandrelMk:'sealimeWarm',archH:.44,colR:.11});
   /* 16 radial exterior battered buttress-fins */
   for(let i=0;i<16;i++){
    const a=i/16*TAU,ca=Math.cos(a),sa=Math.sin(a);
    if(Math.abs(Math.sin(a))>.96)continue;
    svNoWalk(()=>beam('ashlar',[ca*(rOut+.36),yRing+.02,sa*(rOut+.36)],[ca*(rOut+.06),yRing+hWall-.16,sa*(rOut+.06)],.30,asCol,false,undefined,.24));
   }
   /* Annular dual-pitched slate & terracotta ring-roof (leaving central court 100% open to the sky!) */
   const yR=yRing+hWall+.01,rMid=(rIn+rOut)*.5;
   lathe('slate',0,0,[[rOut+.55,yR-.06],[rMid,yR+1.45],[rIn-.35,yR-.04]],28,P('slate'),{uv:'cone'});
   lathe('planks',0,0,[[rOut+.46,yR-.12],[rMid,yR+1.36],[rIn-.28,yR-.10]],28,P('planks'),{uv:'cone',inward:true});
   ring('bronze',0,yR+1.48,0,rMid,.055,P('bronze'),0,0,0,28);
  });

  /* Four engaged cylindrical stair & watch-drums at the 4 diagonal axes (7684d55a!) */
  for(let k=0;k<4;k++){
   const da=PI/4+k*PI/2,tx=Math.cos(da)*(rOut+.55),tz=Math.sin(da)*(rOut+.55),tr=2.18;
   ynRootSkirt(tx,tz,tr,5.2,{mk:'cobble',plinthH:yRing+.22,seg:14});
   ynDrumWall(tx,tz,tr-.34,tr,yRing,hWall+1.85,'sealimeWarm',slWarm,[
    {a:da,w:.52,y:1.6,h:1.85},{a:da,w:.52,y:4.8,h:1.65,pane:'lit'}
   ]);
   ynNoCut(()=>svNoWalk(()=>ynmBulbDome(tx,tz,tr+.14,yRing+hWall+1.87,2.15,'verdigris',P('verdigris'),{ribs:8,finialScale:.72,seg:14})));
  }

  /* Central Moot Court & Ring Exchange Furnishing (10 pieces) */
  FURNISH('yonni_common_seer_basin',0,.12,0,0);
  for(let i=0;i<4;i++){
   const a=i*PI/2+PI/4;
   FURNISH('yonni_common_brazier',Math.cos(a)*2.45,.126,Math.sin(a)*2.45,0);
  }
  FURNISH('yonni_trade_stall',-7.45,yRing,1.25,PI/2);
  FURNISH('yonni_trade_stall',7.45,yRing,1.25,-PI/2);
  FURNISH('yonni_works_weigh_scale',-7.35,yRing,-1.65,PI/2);
  FURNISH('yonni_works_scribe_desk',7.35,yRing,-1.65,-PI/2);
  FURNISH('yonni_common_banner',-1.65,yRing,-4.85,0);
 }});

/* ================================================================= 4. GILT-DOME & VERDIGRIS-DISC SANCTUARY BASTION (yn-sanctuary-giltgate) */
defBuilding({key:'yn-sanctuary-giltgate',name:'Okulus-Bastion Gilt-Dome & Verdigris-Disc Sanctuary',seed:7604,cls:'building',w:21.6,d:19.4,h:19.8,budget:120000,cut:true,
 tags:{types:['civic','religious','military'],wealth:'rich',style:'freestanding',role:'sanctuary bastion',job:'worship'},
 note:'Smooth battered white sea-lime terraced sanctuary-bastion with stepped rampart parapets, cylindrical slot-niched towers bearing circular verdigris bronze medallions beneath burnished gilt domes, and a stepped travertine gate.',
 build(){
  const slCol=P('sealime'),trCol=P('travertine'),gtCol=P('gilt'),vdCol=P('verdigris'),cbCol=P('cobble');
  const y0=.52,rCore=5.35;

  /* Central Sanctuary Hall & Stepped White Sea-Lime Bastion Curtain */
  ynRootSkirt(0,-.35,rCore+1.85,5.8,{mk:'cobble',col:cbCol,plinthH:y0+.22,seg:22});
  ynFloorDisc(0,-.35,rCore+1.45,y0,'flagstone',P('flagstone'),{seg:20});
  ynDrumWall(0,-.35,rCore-.42,rCore,y0,6.85,'sealime',slCol,[
   {a:PI/2,w:1.95,h:2.95,door:true,visor:false},
   {a:0,w:.88,y:1.5,h:2.25,pane:'stained'},{a:PI,w:.88,y:1.5,h:2.25,pane:'stained'},
   {a:-PI/2,w:.95,y:1.5,h:2.35,pane:'stained'}
  ],{visors:false});

  /* Stepped white sea-lime rampart wings linking central sanctuary to front gate-towers & flank bastions */
  ynNoCut(()=>{
   svStair(0,7.25,0,y0,PI,{style:'solid',w:2.85,mk:'travertine',col:trCol,run:1.45});
   svNoWalk(()=>{
    for(const sx of [-1,1]){
     /* battered white sea-lime terraced rampart walls with stepped travertine coping */
     box('sealime',sx*4.85,y0+.008,2.15,3.65,4.35,1.35,slCol);
     box('travertine',sx*4.85,y0+4.37,2.15,3.82,.20,1.52,trCol);
     box('sealime',sx*5.45,y0+.008,-2.15,3.45,5.15,1.35,slCol);
     box('travertine',sx*5.45,y0+5.17,-2.15,3.62,.20,1.52,trCol);
    }
    /* Stepped travertine portal arch bridge between the twin front gate-towers */
    box('travertine',0,y0+3.55,4.25,3.85,1.45,1.15,trCol);
    W(0,y0+4.28,4.84,0,()=>ynpOculusMedallion(.56,{tailH:0}));
   });
  });

  /* Helper: white sea-lime cylindrical tower with dark vertical slot-niche + circular verdigris disc + smooth gilt dome (c7cfadc307!) */
  const discTower=(tx,tz,r,hShaft,faceA)=>{
   ynRootSkirt(tx,tz,r,5.4,{mk:'cobble',col:cbCol,plinthH:y0+.24,seg:16});
   ynDrumWall(tx,tz,r-.34,r,y0,hShaft,'sealime',slCol,[
    {a:faceA,w:.48,y:1.45,h:hShaft*.44,pane:'lit'}
   ],{visors:false});
   ynNoCut(()=>svNoWalk(()=>{
    /* Vertical recessed slot-channel + prominent patinated verdigris disc medallion right below gilt cornice */
    const yaw=ynYawFromA(faceA),ox=tx+Math.cos(faceA)*(r+.012),oz=tz+Math.sin(faceA)*(r+.012);
    W(ox,y0+hShaft-1.25,oz,yaw,()=>{
     WX(0,0,.012,0,PI/2,0,()=>cyl('travertine',0,0,0,.74,.026,trCol,18));
     WX(0,0,.042,0,PI/2,0,()=>cyl('verdigris',0,0,0,.58,.024,vdCol,16));
     WX(0,0,.070,0,PI/2,0,()=>cyl('gilt',0,0,0,.22,.020,gtCol,12));
    });
    sector('travertine',tx,tz,r-.12,r+.16,0,TAU,y0+hShaft+.008,y0+hShaft+.28,trCol,18);
    ynmBulbDome(tx,tz,r+.08,y0+hShaft+.30,r*1.12,'gilt',gtCol,{bulge:1.03,ribMk:'gilt',ribs:8,finialScale:.75,seg:16});
   }));
  };

  /* Twin front disc gate-towers + twin rear-flank towers + tall central sovereign gilt dome */
  discTower(-3.45,4.25,2.25,7.85,PI/2);
  discTower(3.45,4.25,2.25,7.85,PI/2);
  discTower(-6.95,-2.65,2.15,6.85,PI*.65);
  discTower(6.95,-2.65,2.15,6.85,PI*.35);

  /* High Central Sanctuary Clerestory & Sovereign Burnished-Gilt Dome */
  ynNoCut(()=>svNoWalk(()=>{
   const yC=y0+6.86;
   sector('travertine',0,-.35,rCore-.25,rCore+.24,0,TAU,yC+.008,yC+.38,trCol,22);
   ynDrumWall(0,-.35,3.55,3.92,yC+.40,3.45,'sealime',slCol,[
    {a:PI/2,w:.62,y:.65,h:1.85,pane:'stained'},{a:-PI/2,w:.62,y:.65,h:1.85,pane:'stained'},
    {a:0,w:.62,y:.65,h:1.85,pane:'stained'},{a:PI,w:.62,y:.65,h:1.85,pane:'stained'}
   ],{visors:false});
   W(0,yC+2.85,-.35+3.94,0,()=>ynpOculusMedallion(.72,{tailH:0}));
   ynmBulbDome(0,-.35,4.02,yC+3.88,4.35,'gilt',gtCol,{bulge:1.05,ribMk:'gilt',ribs:12,finialScale:1.15,seg:22});
  }));

  /* Sanctuary hall furnishing (8 pieces) */
  FURNISH('yonni_court_carpet',0,y0,-.35,0);
  FURNISH('yonni_court_twin_throne',0,y0+.05,-2.85,0);
  FURNISH('yonni_common_seer_basin',0,y0+.05,.85,0);
  FURNISH('yonni_common_brazier',-2.35,y0+.006,1.15,0);
  FURNISH('yonni_common_brazier',2.35,y0+.006,1.15,0);
  FURNISH('yonni_common_dual_spear_rack',-3.65,y0,-.55,PI/2);
  FURNISH('yonni_trade_armour_stand',3.65,y0,-.55,-PI/2);
  FURNISH_HANG('yonni_common_storm_lamp',0,y0+6.65,-.35,0);
 }});

/* ================================================================= 5. FOUR-PYLON BUTTRESSED TERRACOTTA-DOME SHRINE (yn-shrine-pylondome) */
defBuilding({key:'yn-shrine-pylondome',name:'For-Pilon Buttressed Terracotta-Dome Crag Shrine',seed:7603,cls:'building',w:17.8,d:17.6,h:15.8,budget:120000,cut:true,
 tags:{types:['religious'],wealth:'middle',style:'freestanding',role:'pylon-buttressed dome shrine',job:'worship'},
 note:'Broad scalloped terracotta-and-bronze shrine dome braced by four tall battered corner obelisk-pylons strung with ceremonial pennant garlands, approached by broad stone steps and balanced by a barrel-vaulted reliquary annex.',
 build(){
  const y0=.58,cz=-.25,rDrum=4.55;
  const slWarm=P('sealimeW'),asCol=P('ashlar'),trCol=P('travertine'),tcCol=P('terracotta'),bzCol=P('bronze');

  ynRootSkirt(0,cz,rDrum+1.25,5.4,{mk:'cobble',plinthH:y0+.22,seg:20});
  ynFloorDisc(0,cz,rDrum+.85,y0,'flagstone',P('flagstone'),{seg:18});
  ynNoCut(()=>svStair(0,cz+rDrum+1.85,0,y0,PI,{style:'solid',w:2.65,mk:'travertine',col:trCol,run:1.35}));

  /* Main cylindrical shrine wall + scalloped travertine arch-eaves */
  const hWall=4.65;
  ynDrumWall(0,cz,rDrum-.38,rDrum,y0,hWall,'sealimeWarm',slWarm,[
   {a:PI/2,w:1.65,h:2.55,door:true,visor:true,visorOut:.85},
   {a:0,w:.85,y:1.25,h:1.65,pane:'stained'},{a:PI,w:1.15,h:2.15,door:true,open:true},
   {a:-PI/2,w:.85,y:1.25,h:1.65,pane:'stained'}
  ]);

  /* Scalloped eave visors around the drum + low-slung broad ribbed Terracotta Dome (4693e6ce!) */
  const yEave=y0+hWall;
  ynNoCut(()=>svNoWalk(()=>{
   for(let i=0;i<8;i++){
    const a=i/8*TAU;
    ynCrescentVisor(0,cz,rDrum+.02,a,PI/9.2,yEave-.08,.62,'travertine',trCol);
   }
   ynmBulbDome(0,cz,rDrum+.16,yEave+.02,3.85,'terracotta',tcCol,{bulge:1.02,ribMk:'bronze',ribs:12,finialScale:1.08,seg:22});

   /* Four Heavy Battered Corner Obelisk-Pylons rising 3.8 m past the dome eave + Ceremonial Cord Garlands! */
   const apex=[0,yEave+4.35,cz];
   for(let k=0;k<4;k++){
    const pa=PI/4+k*PI/2,px=Math.cos(pa)*(rDrum+.62),pz=cz+Math.sin(pa)*(rDrum+.62),pyaw=ynYawFromA(pa);
    W(px,0,pz,pyaw,()=>{
     ynBelowGrade(()=>box('cobble',0,-4.4,0,1.75,4.4,1.95,P('cobble')));
     /* 3 battered stone stages tapering cleanly upward into bronze-capped obelisk tip */
     box('ashlar',0,.01,0,1.58,3.65,1.78,asCol);
     box('sealimeWarm',0,3.67,-.08,1.32,3.45,1.46,slWarm);
     box('travertine',0,7.13,-.14,1.04,2.85,1.14,trCol);
     cone('bronze',0,9.99,-.14,.68,.88,bzCol,8);
    });
    const tip=[px-Math.cos(pa)*.14,10.55,pz-Math.sin(pa)*.14];
    sagRope('rope',tip,apex,.42,.024,P('rope'),6);
    /* festive carnelian & amber prayer-pennants along each garland */
    for(const u of [.28,.52,.74]){
     const gx=lerp(tip[0],apex[0],u),gy=lerp(tip[1],apex[1],u)-.38*Math.sin(u*PI),gz=lerp(tip[2],apex[2],u);
     withCloth(clothHang(.52,.05),()=>quad('flag',gx,gy-.26,gz,.26,.52,u<.5?P('carnelian'):P('amberCl'),pa));
    }
   }

   /* Barrel-vaulted side/rear reliquary chapel annex balancing the front stair & echoing 4693e6ce! */
   for(const sx of [-1,1]){
    const ax=sx*(rDrum+1.55),az=cz-.55;
    ynRootSkirt(ax,az,1.85,4.4,{mk:'cobble',plinthH:y0+.18,seg:12});
    box('sealimeWarm',ax,y0+.01,az,2.65,2.95,3.25,slWarm);
    /* terracotta barrel-vault cap along X */
    WX(ax,y0+2.97,az,0,0,PI/2,()=>cyl('terracotta',0,-1.38,0,1.65,2.76,tcCol,14));
   }
  }));

  /* Shrine interior furnishing (7 pieces) */
  FURNISH('yonni_common_rug_round',0,y0,cz,0);
  FURNISH('yonni_common_seer_basin',0,y0+.045,cz-.85,0);
  FURNISH('yonni_common_brazier',-1.85,y0+.006,cz+.95,0);
  FURNISH('yonni_common_brazier',1.85,y0+.006,cz+.95,0);
  FURNISH('yonni_common_bench',-2.15,y0,cz-.95,PI/2);
  FURNISH('yonni_common_bench',2.15,y0,cz-.95,-PI/2);
  FURNISH_HANG('yonni_common_storm_lamp',0,yEave-.12,cz,0);
 }});

/* ================================================================= 6. HEXAGONAL-TRUSS STILTED PAGODA CITADEL (yn-citadel-hexstilt) */
defBuilding({key:'yn-citadel-hexstilt',name:'Heks-Stilt Lattice-Truss Pagoda Watch-Citadel',seed:7606,cls:'building',w:19.8,d:19.8,h:25.8,budget:120000,cut:true,
 tags:{types:['military','civic'],wealth:'rich',style:'freestanding',role:'hex-stilt pagoda citadel'},
 note:'Monumental multi-tiered stone and ironwood pagoda watch-citadel carried high above an open vaulted muster court on six radial hexagonal lattice-truss legs with corbelled war-galleries.',
 build(){
  const yDeck=6.25,rCore=2.45,rMain=5.25;
  const cbCol=P('cobble'),slCol=P('sealime'),iwCol=P('ironwood'),asCol=P('ashlar');

  /* Ground-level armored stair-core & 6 radial Hexagonal Lattice-Truss Legs (703daec7af!) */
  ynRootSkirt(0,0,rCore,5.6,{mk:'cobble',col:cbCol,plinthH:.38,seg:16});
  ynFloorDisc(0,0,rCore-.06,.26,'flagstone',P('flagstone'),{seg:14});
  ynDrumWall(0,0,rCore-.34,rCore,.26,yDeck-.28,'cobble',cbCol,[
   {a:PI/2,w:1.25,h:2.15,door:true,visor:true,visorOut:.72},
   {a:-PI/2,w:1.15,h:2.05,door:true,open:true}
  ]);
  ynSpiralStair(0,0,rCore+.05,.26,yDeck,PI*.35,PI*1.15,{w:.95});

  for(let i=0;i<6;i++){
   const a=i/6*TAU+PI/6,lx=Math.cos(a)*4.95,lz=Math.sin(a)*4.95;
   ynBelowGrade(()=>{
    for(const sg of [-1,1]){
     const fx=lx+Math.cos(a+PI/2)*sg*1.65,fz=lz+Math.sin(a+PI/2)*sg*1.65;
     cyl('cobble',fx,-4.8,fz,.65,4.85,cbCol,8);
    }
   });
   ynmHexTrussLeg(lx,0,lz,a+PI/2,4.15,yDeck-.14);
   /* radial ashlar arch-rib tying each hex leg back into the central stair-drum */
   ynNoCut(()=>svNoWalk(()=>beam('ashlar',[Math.cos(a)*(rCore+.04),yDeck-1.65,Math.sin(a)*(rCore+.04)],[lx,yDeck-.22,lz],.44,asCol,false,undefined,.36)));
  }

  /* Elevated Citadel Deck (y = 6.25) + Corbelled Overhanging Timber-and-Stone Pagoda Tiers */
  ynNoCut(()=>ynCorbelFins(0,0,rCore+.2,rMain+.35,yDeck-1.35,yDeck-.14,12,'corbel',P('corbel'),{bronzeTip:true}));
  ynFloorDisc(0,0,rMain+.28,yDeck,'floor',P('floor'),{seg:16});

  /* Tier 1 Command Hall (y = 6.25 .. 10.65) + perimeter ironwood war-gallery */
  ynDrumWall(0,0,3.85,4.22,yDeck,4.4,'sealime',slCol,[
   {a:PI*.08,w:1.15,h:2.10,door:true,open:true},{a:PI*1.08,w:1.15,h:2.10,door:true,open:true},
   {a:PI/2,w:.85,y:1.05,h:1.65,pane:'lit'},{a:-PI/2,w:.85,y:1.05,h:1.65,pane:'lit'}
  ]);
  ynNoCut(()=>{
   ynArcadeRing(0,0,rMain-.08,rMain+.24,yDeck+.008,2.85,12,{paraH:.82,paraMk:'ironwood',paraCol:iwCol,colMk:'ironwood',spandrelMk:'ashlar',archH:.42,colR:.10,gapA:-PI*.5});
   /* Tier 1 wide octagonal/faceted slate eave skirt */
   ynCanopy(0,0,4.22,rMain+1.55,yDeck+4.42,1.65,{mk:'slate',ribs:8,rHub:3.35,finial:false,seg:16});

   /* Symmetric cantilevered side turret pods on +-x echoing the clustered stilt-towers in 703daec7! */
   for(const sx of [-1,1]){
    const px=sx*5.75,py=yDeck+2.15;
    ynCorbelFins(px,0,1.05,1.95,py-1.35,py,8,'corbel',P('corbel'),{bronzeTip:true});
    svNoWalk(()=>{
     cyl('sealime',px,py+.01,0,1.88,3.45,slCol,8,1.72);
     ynCanopy(px,0,1.72,2.55,py+3.47,1.95,{mk:'verdigris',ribs:8,finialScale:.68,seg:8});
    });
   }

   /* Tier 2 & Tier 3 Soaring Octagonal Pagoda Lantern Stages (y = 12.3 .. 24.6) */
   const yT2=yDeck+6.08;
   svNoWalk(()=>{
    ynDrumWall(0,0,2.88,3.25,yT2,4.25,'sealime',slCol,[
     {a:PI/2,w:.72,y:.95,h:1.65,pane:'lit'},{a:-PI/2,w:.72,y:.95,h:1.65,pane:'lit'},
     {a:0,w:.72,y:.95,h:1.65,pane:'lit'},{a:PI,w:.72,y:.95,h:1.65,pane:'lit'}
    ]);
    ynCanopy(0,0,3.25,4.95,yT2+4.27,1.55,{mk:'slate',ribs:8,rHub:2.25,finial:false,seg:16});
    const yT3=yT2+5.84;
    ynArcadeRing(0,0,1.88,2.22,yT3,2.65,8,{paraH:.58,paraMk:'ironwood',paraCol:iwCol,colMk:'bronze',spandrelMk:'sealime',archH:.38,colR:.085});
    ynCanopy(0,0,2.22,3.45,yT3+2.67,2.85,{mk:'verdigris',ribs:8,finialScale:1.15,seg:16});
   });
  });

  /* Elevated Citadel Command Deck & Ground Guardhouse Furnishing (8 pieces) */
  FURNISH('yonni_common_dual_spear_rack',-1.45,.26,-.65,PI/2);
  FURNISH('yonni_trade_armour_stand',1.45,.26,-.65,-PI/2);
  FURNISH('yonni_court_carpet',0,yDeck,0,0);
  FURNISH('yonni_court_feast_table',0,yDeck+.05,0,0);
  FURNISH('yonni_common_brazier',-2.25,yDeck+.006,1.65,0);
  FURNISH('yonni_common_brazier',2.25,yDeck+.006,1.65,0);
  FURNISH('yonni_works_scribe_desk',0,yDeck,-2.45,0);
  FURNISH_HANG('yonni_common_storm_lamp',0,yDeck+4.25,0,0);
 }});
