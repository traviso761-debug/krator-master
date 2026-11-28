// prefix: dva
// ================================================================= TERRACED CLIFF-AUL DWELLINGS & NEEDLE-TOWER COMPOUNDS (style: 'aul', DV4 + DV2)
// 9 dwellings (3 poor, 3 middle, 3 rich): stacked Dagestani stone roof-plaza houses where lower flat slate-and-cypress roofs
// form sunny apricot-drying terraces for stepped-back upper tiers, sprouting razor-slender 5:1 battered defense needle-towers
// crowned with stepped dark mountain-slate, charcoal-basalt & crimson-tuff roofs, mashikul boxes, nephrite cross-medallions, and aerial pulley-baskets.

/* ---- POOR TERRACED AUL DWELLINGS (3) ---- */
defBuilding({key:'dv-aul-cot-shepherd',name:'Khai-Sakli Shepherd Roof-Terrace Cot',seed:7101,cls:'building',w:8.8,d:8.2,h:7.2,cut:true,
 tags:{types:['dwelling-single'],wealth:'poor',style:'aul',role:'shepherd cot',job:'herding'},
 note:'Single-tier apricot-tuff & basalt ablaq stone cot with a walkable Dagestani flat slate roof-plaza, rock-cut exterior stair, and sunny apricot-drying rack.',
 build(){
  const w=6.2,d=5.4,y0=.24,h=3.15;
  dvRootSkirt(0,0,w,d,4.8,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w-.08,d-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w,d,y0,h,{
   front:[{x:-.65,w:1.02,h:2.04,door:true},{x:1.55,w:.72,y:.95,h:1.05}],
   right:[{x:0,w:.68,y:.95,h:1.05}],back:[{x:0,w:.64,y:1.05,h:.98}]
  });
  dvJadeCross(1.55,y0+2.58,d/2+.008,0,.48);
  dvRoofTerrace(0,0,w+.12,d+.12,y0+h,{gapFront:2.1,gapW:1.25});
  dvExtStair(-.65,d/2+.85,0,y0,PI,1.18,.85);
  dvNoCut(()=>svStair(w/2+.65,0,0,y0+h,0,{style:'solid',w:.98,mk:'flagstone',col:P('flagstone'),run:2.85}));
  dvFurnRoom(0,0,w-.8,d-.8,y0,'poor');
  dvNoCut(()=>FURNISH('dv_apricot_drying_tray',-.85,y0+h+.006,0,0));
  dvLampBracket(-1.65,y0+2.05,d/2+.02,0,.85);
 }});

defBuilding({key:'dv-aul-cot-orchard',name:'Tsiran-Sakli Apricot-Grower Terrace Cot',seed:7102,cls:'building',w:9.4,d:8.6,h:7.6,cut:true,
 tags:{types:['dwelling-single'],wealth:'poor',style:'aul',role:'orchard cot',job:'farming'},
 note:'Stepped tuff-and-basalt orchard grower house with timber overhang loggia, qvevri alcove, and flat slate apricot-drying roof.',
 build(){
  const w=6.6,d=5.6,y0=.38,h=3.25;
  dvRootSkirt(0,0,w,d,5.0,{mk:'cobble',plinthH:y0+.2});
  dvFloorRect(0,0,w-.08,d-.08,y0,'floor',P('floor'));
  dvAblaqBox(0,0,w,d,y0,h,{
   front:[{x:0,w:1.05,h:2.05,door:true},{x:-1.85,w:.74,y:.9,h:1.1},{x:1.85,w:.74,y:.9,h:1.1}],
   left:[{x:0,w:.68,y:.95,h:1.05}]
  });
  dvExtStair(0,d/2+.95,0,y0,PI,1.22,.95);
  dvRoofTerrace(0,0,w+.16,d+.36,y0+h,{openBack:false});
  /* front cypress porch posts supporting roof-terrace eave */
  dvNoCut(()=>svNoWalk(()=>{
   for(const sx of [-2.4,2.4])cyl('cypress',sx,0,d/2+.42,.11,y0+h-.14,P('cypress'),8);
  }));
  dvFurnRoom(0,0,w-.85,d-.85,y0,'poor');
  dvNoCut(()=>{
   FURNISH('dv_apricot_drying_tray',-1.2,y0+h+.006,-.3,0);
   FURNISH('dv_qvevri_rack',1.4,y0+h+.006,-1.6,0);
  });
 }});

defBuilding({key:'dv-aul-cot-quarry',name:'Kari-Sakli Tuff-Cutter Ledge House',seed:7103,cls:'building',w:9.2,d:8.4,h:8.8,cut:true,
 tags:{types:['dwelling-single'],wealth:'poor',style:'aul',role:'quarryman cot',job:'quarrying'},
 note:'Battered basalt-skirted stonecutter ledge house with golden-skarn portal tympanum, roof parapet, and cliff-supply pulley beam.',
 build(){
  const w=6.4,d=5.4,y0=.46,h=3.4;
  dvRootSkirt(0,0,w,d,5.4,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w-.08,d-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w,d,y0,h,{
   front:[{x:.55,w:1.06,h:2.08,door:true},{x:-1.65,w:.72,y:.95,h:1.08}],
   right:[{x:.3,w:.68,y:.98,h:1.05}],back:[{x:0,w:.65,y:1.05,h:1.0}]
  });
  dvJadeCross(-1.65,y0+2.58,d/2+.008,0,.52);
  dvExtStair(.55,d/2+1.05,0,y0,PI,1.2,1.05);
  dvRoofTerrace(0,0,w+.12,d+.12,y0+h,{});
  dvPulleyRig(-w/2,y0+h-.25,.4,-PI/2,1.25,2.2);
  dvFurnRoom(0,0,w-.8,d-.8,y0,'poor');
 }});

/* ---- MIDDLE STEPPED AUL HOUSES WITH 5:1 NEEDLE-TOWERS (3) ---- */
defBuilding({key:'dv-aul-house-terrace',name:'Darbazi-Aul Two-Tier Roof-Plaza House',seed:7104,cls:'building',w:11.6,d:11.4,h:11.2,cut:true,
 tags:{types:['dwelling-single'],wealth:'middle',style:'aul',role:'roof-plaza house'},
 note:'Classic Dagestani two-tier stepped stone house: the lower hall flat slate roof forms a sunny apricot-drying terrace before the upper chamber.',
 build(){
  const w0=8.2,d0=7.6,y0=.3,h0=3.45;
  dvRootSkirt(0,0,w0,d0,5.6,{mk:'colBasalt',plinthH:y0+.24});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:-1.4,w:1.15,h:2.15,door:true},{x:1.8,w:.85,y:.92,h:1.2}],
   left:[{x:.8,w:.8,y:.95,h:1.15}],right:[{x:-.8,w:.8,y:.95,h:1.15}]
  });
  dvExtStair(-1.4,d0/2+.9,0,y0,PI,1.25,.9);
  /* lower roof-plaza on front half (+z), stepped-back upper tier on rear (-z) */
  const y1=y0+h0,w1=7.4,d1=4.1,cz1=-1.55,h1=3.15;
  dvRoofTerrace(0,1.85,w0+.12,3.7,y1,{openBack:true,gapFront:2.5,gapW:1.25});
  dvNoCut(()=>svStair(w0/2+.68,.4,0,y1,0,{style:'solid',w:1.05,mk:'flagstone',col:P('flagstone'),run:3.1}));
  dvFloorRect(0,cz1,w1-.08,d1-.08,y1+.02,'floor',P('floor'));
  dvAblaqBox(0,cz1,w1,d1,y1+.02,h1,{
   front:[{x:0,w:1.02,h:2.02,door:true},{x:-2.1,w:.76,y:.85,h:1.1},{x:2.1,w:.76,y:.85,h:1.1}],
   back:[{x:0,w:.82,y:.95,h:1.15}]
  });
  dvGableRoof(0,cz1,w1,d1,y1+.02+h1,1.65,{mk:'slate'});
  dvPulleyRig(w1/2,y1+h1-.28,cz1,PI/2,1.3,2.5);
  dvFurnRoom(0,.3,w0-.9,d0-1.1,y0,'middle',{ceilingY:y1-.16});
  dvNoCut(()=>FURNISH('dv_apricot_drying_tray',-1.9,y1+.006,2.15,0));
  dvLampBracket(-2.6,y0+2.15,d0/2+.02,0,.9);
 }});

defBuilding({key:'dv-aul-house-koshki',name:'Koshki-Sakli Cousin-Knight Needle-Tower House',seed:7105,cls:'building',w:12.6,d:11.2,h:17.2,cut:true,
 tags:{types:['dwelling-single','military'],wealth:'middle',style:'aul',role:'koshki tower-house'},
 note:'Polychrome ablaq hearth-house sprouting a razor-slender 5:1 battered defense needle-tower crowned with stepped dark mountain-slate, basalt & crimson-tuff corbels and mashikul boxes.',
 build(){
  const w0=7.6,d0=6.8,cx0=-1.35,y0=.32,h0=3.55;
  dvRootSkirt(cx0,0,w0,d0,5.8,{mk:'colBasalt',plinthH:y0+.24});
  dvFloorRect(cx0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx0,0,w0,d0,y0,h0,{
   front:[{x:-.6,w:1.15,h:2.15,door:true},{x:1.7,w:.84,y:.92,h:1.18}],
   left:[{x:0,w:.82,y:.95,h:1.15}],back:[{x:0,w:.82,y:.95,h:1.15}]
  });
  dvJadeCross(cx0+1.7,y0+2.68,d0/2+.008,0,.56);
  dvExtStair(cx0-.6,d0/2+.9,0,y0,PI,1.25,.9);
  dvRoofTerrace(cx0,0,w0+.14,d0+.14,y0+h0,{openRight:true});
  /* engaged 5:1 battered defense needle-tower at +x corner (clear 18 cm gap so zero wall coplanarity!) */
  dvNeedleTower(3.95,-.45,2.65,0,11.6,{rootD:6.0,doorYaw:0,pulley:true,pulleyYaw:0,pulleyDrop:3.2});
  dvFurnRoom(cx0,0,w0-.9,d0-.9,y0,'middle',{ceilingY:y0+h0-.16});
  FURNISH('dv_armour_stand_scale',cx0+2.2,y0,-2.1,-.4);
  dvNoCut(()=>FURNISH('dv_apricot_drying_tray',cx0-.8,y0+h0+.006,.6,0));
 }});

defBuilding({key:'dv-aul-house-ropeway',name:'Bagiri-Aul Ropeway Canyon-House',seed:7106,cls:'building',w:13.4,d:11.6,h:16.4,cut:true,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'aul',role:'ropeway canyon-house'},
 note:'Twin stepped ablaq canyon tiers joined by a roof-plaza deck, 5:1 dark-slate & basalt watch-needle, and an aerial gorge ropeway pulley-cradle.',
 build(){
  const y0=.34;
  /* west lower tier */
  dvRootSkirt(-2.4,.5,6.2,6.4,5.8,{mk:'colBasalt',plinthH:y0+.24});
  dvFloorRect(-2.4,.5,6.1,6.3,y0,'flagstone',P('flagstone'));
  dvAblaqBox(-2.4,.5,6.2,6.4,y0,3.4,{
   front:[{x:0,w:1.12,h:2.12,door:true},{x:-1.7,w:.78,y:.9,h:1.15}],
   left:[{x:0,w:.78,y:.92,h:1.15}]
  });
  dvExtStair(-2.4,3.7+.9,0,y0,PI,1.22,.9);
  dvRoofTerrace(-2.4,.5,6.3,6.5,y0+3.4,{openRight:true});
  /* east stepped upper tier (+0.85 m higher) + rear 5:1 slate-crowned needle-tower */
  const yE=1.15;
  dvRootSkirt(2.85,-.4,5.6,6.0,6.2,{mk:'colBasalt',plinthH:yE+.18});
  dvFloorRect(2.85,-.4,5.5,5.9,yE,'floor',P('floor'));
  dvAblaqBox(2.85,-.4,5.6,6.0,yE,3.65,{
   front:[{x:.4,w:1.05,h:2.05,door:true},{x:-1.4,w:.76,y:.9,h:1.12}],
   right:[{x:0,w:.78,y:.95,h:1.15}]
  });
  dvExtStair(3.25,2.6+1.15,0,yE,PI,1.15,1.15);
  dvGableRoof(2.85,-.4,5.6,6.0,yE+3.65,1.6,{mk:'slate'});
  dvNeedleTower(3.6,-4.15,2.45,0,11.0,{rootD:6.0,pulley:true,pulleyYaw:PI/2,pulleyDrop:3.4});
  dvFurnRoom(-2.4,.5,5.3,5.5,y0,'middle');
  dvNoCut(()=>{
   FURNISH('dv_pulley_basket',-3.6,y0+3.406,1.8,0);
   FURNISH('dv_apricot_drying_tray',-1.4,y0+3.406,-.6,0);
  });
 }});

/* ---- RICH CHIVALRIC COUSIN-LORD COMPOUNDS (3) ---- */
defBuilding({key:'dv-manor-cousins',name:'Aznaur-Dzagh Chivalric Cousin-Retinue Compound',seed:7107,cls:'building',w:17.2,d:14.4,h:18.8,cut:true,
 tags:{types:['dwelling-multi','military'],wealth:'rich',style:'aul',role:'cousin-lord compound'},
 note:'Three-tier Dagestani roof-plaza manor flanked by twin razor-slender 5:1 dark-slate & crimson-tuff needle-towers, housing a royal cousin retinue and heirloom scale hauberks.',
 build(){
  const w0=10.4,d0=8.6,y0=.38,h0=3.85;
  dvRootSkirt(0,.8,w0,d0,6.2,{mk:'colBasalt',plinthH:y0+.26});
  dvFloorRect(0,.8,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,.8,w0,d0,y0,h0,{
   front:[{x:0,w:1.42,h:2.38,door:true},{x:-3.1,w:.92,y:.95,h:1.28},{x:3.1,w:.92,y:.95,h:1.28}],
   left:[{x:0,w:.88,y:.98,h:1.25}],right:[{x:0,w:.88,y:.98,h:1.25}]
  });
  dvJadeCross(-3.1,y0+2.92,.8+d0/2+.008,0,.62);
  dvJadeCross(3.1,y0+2.92,.8+d0/2+.008,0,.62);
  dvExtStair(0,.8+d0/2+1.05,0,y0,PI,1.55,1.05);

  /* sunny upper roof-plaza + stepped-back 2nd-storey banquet hall */
  const y1=y0+h0,w1=8.2,d1=4.8,cz1=-1.05,h1=3.45;
  dvRoofTerrace(0,3.32,w0+.14,3.84,y1,{openBack:true});
  dvFloorRect(0,cz1,w1-.08,d1-.08,y1+.02,'floor',P('floor'));
  dvAblaqBox(0,cz1,w1,d1,y1+.02,h1,{
   front:[{x:0,w:1.12,h:2.12,door:true},{x:-2.4,w:.82,y:.88,h:1.18},{x:2.4,w:.82,y:.88,h:1.18}],
   back:[{x:0,w:.92,y:.95,h:1.22}]
  });
  dvGableRoof(0,cz1,w1,d1,y1+.02+h1,1.75,{mk:'verdigris'});

  /* twin 5:1 dark-slate & basalt defense needle-towers flanking the rear corners! */
  dvNeedleTower(-6.35,-3.2,2.75,0,13.2,{rootD:6.4,doorYaw:0,pulley:true,pulleyYaw:-PI/2,pulleyDrop:3.6});
  dvNeedleTower(6.35,-3.2,2.6,0,12.2,{rootD:6.4,doorYaw:0});
  dvBanner(-2.2,y1,4.85,0,2.8,P('crimson'));
  dvBanner(2.2,y1,4.85,0,2.8,P('saffron'));

  /* rich heirloom armoury & brandy feast interior */
  dvFurnRoom(0,.8,w0-1.0,d0-1.0,y0,'rich',{mode:'feast',ceilingY:y1-.18});
  FURNISH('dv_armour_stand_scale',-3.8,y0,-2.2,.35);
  FURNISH('dv_armour_stand_scale',3.8,y0,-2.2,-.35);
  FURNISH('dv_rack_buckler_sword',0,y0,-3.05,0);
 }});

defBuilding({key:'dv-manor-gumbat',name:'Vardzi-Darbazi Noble Gumbat & Needle Villa',seed:7108,cls:'building',w:15.6,d:13.6,h:17.8,cut:true,
 tags:{types:['dwelling-single'],wealth:'rich',style:'aul',role:'noble gumbat villa'},
 note:'Polychrome apricot-tuff & basalt noble villa crowned by a 12-pleat patinated verdigris copper gumbat lantern over the central darbazi hall, plus a 5:1 slate-crowned koshki corner tower.',
 build(){
  const w0=9.6,d0=8.8,cx0=-1.2,y0=.36,h0=4.25;
  dvRootSkirt(cx0,0,w0,d0,6.0,{mk:'colBasalt',plinthH:y0+.25});
  dvFloorRect(cx0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.38,h:2.35,door:true},{x:-2.75,w:.88,y:1.0,h:1.3},{x:2.75,w:.88,y:1.0,h:1.3}],
   left:[{x:-1.5,w:.85,y:1.0,h:1.25},{x:1.5,w:.85,y:1.0,h:1.25}],
   back:[{x:0,w:.95,y:1.0,h:1.3}]
  });
  dvJadeCross(cx0,y0+3.38,d0/2+.008,0,.66);
  dvExtStair(cx0,d0/2+1.0,0,y0,PI,1.5,1.0);
  dvRoofTerrace(cx0,0,w0+.16,d0+.16,y0+h0,{parapet:true});
  /* 12-pleat patinated verdigris copper Akhtamar gumbat lantern rising from the flat slate roof-plaza! */
  dvGumbat(cx0,-.3,2.05,y0+h0,2.45,3.15,{mk:'verdigris',windows:4});
  /* paired 5:1 slate-crowned needle-tower on east flank */
  dvNeedleTower(5.15,-1.8,2.6,0,12.6,{rootD:6.2,doorYaw:0,pulley:true,pulleyYaw:PI/2});
  dvFurnRoom(cx0,0,w0-1.0,d0-1.0,y0,'rich',{ceilingY:y0+h0-.18});
  FURNISH('dv_armour_stand_scale',cx0+3.2,y0,2.4,-PI*.75);
 }});

defBuilding({key:'dv-manor-envoy',name:'Khrosi-Imos Valley-Truce Envoy Residence',seed:7109,cls:'building',w:14.8,d:12.6,h:14.8,cut:true,
 tags:{types:['dwelling-single','civic'],wealth:'rich',style:'aul',role:'envoy residence',job:'customs'},
 note:'Jade-medallion & golden-skarn arcaded truce lodge where heralds of the seven gorge-kingdoms negotiate sky-bridge duel terms and nephrite weregild.',
 build(){
  const w0=10.6,d0=8.4,y0=.36,h0=4.05;
  dvRootSkirt(0,0,w0,d0,5.8,{mk:'colBasalt',plinthH:y0+.24});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.36,h:2.32,door:true},{x:-3.1,w:.92,y:.95,h:1.28},{x:3.1,w:.92,y:.95,h:1.28}],
   left:[{x:0,w:.9,y:.98,h:1.25}],right:[{x:0,w:.9,y:.98,h:1.25}],back:[{x:0,w:.95,y:.98,h:1.28}]
  });
  dvExtStair(0,d0/2+1.0,0,y0,PI,1.5,1.0);
  dvRoofTerrace(0,0,w0+.16,d0+.16,y0+h0,{});
  /* crimson/apricot tuff 12-pleat gumbat dome over the heraldic truce chamber */
  dvGumbat(0,0,1.95,y0+h0,2.3,2.95,{mk:'tuffPolished',col:P('tuffCrimson'),windows:4});
  for(const sx of [-3.6,3.6]){
   dvJadeCross(sx,y0+3.15,d0/2+.008,0,.58);
   dvBanner(sx,y0+h0,d0/2-.25,0,2.6,sx<0?P('crimson'):P('indigo'));
  }
  dvFurn([
   ['dv_court_carpet',0,y0,0,0],
   ['dv_feast_table_brandy',0,y0+.054,-.35,0],
   ['dv_carved_chair',-1.45,y0,-.35,PI/2],
   ['dv_carved_chair',1.45,y0,-.35,-PI/2],
   ['dv_scale_weregild',-3.4,y0,2.1,PI*.25],
   ['dv_scriptorium_lectern',3.4,y0,-2.6,0],
   ['dv_rack_buckler_sword',-3.6,y0,-2.8,0],
   ['dv_qvevri_rack',3.5,y0,2.2,-PI/2]
  ]);
 }});
