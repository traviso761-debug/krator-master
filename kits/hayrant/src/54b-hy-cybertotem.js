// prefix: hy
// ================================================================= MONUMENTAL CENTRAL-SQUARE CYBER-TOTEMS (seeds 34113..34114)
//   34113 hy_grand_cyber_totem     Grand Central-Square Cyber-Totem Pylon Plaza (20.1 m colossus + twin 9.2 m relay cyber-totems)
//   34114 hy_cyber_totem_obelisk   Market-Square Talking-Head Cyber-Totem Monument (16.1 m colossus + 4-way bilingual PA corner steles)

/* 17c. Grand Central-Square Cyber-Totem Pylon Plaza (seed 34113) */
defBuilding({key:'hy_grand_cyber_totem',name:'Grand Central-Square Cyber-Totem Plaza',seed:34113,cut:false,
 front:{x:0,z:7.1,yaw:0},
 w:16.0,d:16.0,h:20.5,budget:220000,
 tags:{types:['civic','religious','infrastructure'],wealth:'rich',style:'prefect',job:'worship',landmark:true},
 note:'stepped megabreccia, nephrite & titanium central-square dais raising a 19.6 m monumental cyber-totem colossus linked by catenary jumpers to twin 9.2 m relay cyber-totems',
 build(){
  const G=.54;
  hyPlinth(12.2,12.2,G,{stepW:3.4,stepX:0});

  /* Central 19.6 m Monumental Cyber-Totem Colossus (summit at 20.14 m <= 20.5 m declared height) */
  hyMonumentalCyberTotem(0,G,-.45,0,{
   h:19.6,tiers:6,span:6.2,r:.72,seed:341130,
   materials:['gold','titanium','silver','bronze','gunmetal','celadon']
  });

  /* Twin 9.2 m Flanking Relay Cyber-Totem Pylons on NW & NE plaza corners */
  hyHeadTotemPole(-4.65,G,-2.95,.26,{
   h:9.2,heads:5,r:.30,crown:'faraday',seed:341131,
   materials:['titanium','silver','celadon','bronze','gold']
  });
  hyHeadTotemPole(4.65,G,-2.95,-.26,{
   h:9.2,heads:5,r:.30,crown:'arrestor',veiledIdx:3,seed:341132,
   materials:['nephrite','titanium','gunmetal','silver','gold']
  });

  /* Overhead HV catenary jumper cables linking the twin 9.2 m relay pylons to the central colossus + front docket steles */
  svNoWalk(()=>{
   for(const sx of [-1,1]){
    sagRope('brass',[sx*2.65,G+5.25,-.95],[sx*4.65,G+4.65,-2.95],.32,.016,P('brass'),9);
    sagRope('iron',[sx*2.35,G+8.45,-.95],[sx*4.65,G+7.85,-2.95],.28,.014,P('iron'),9);
    /* Corner columnar & cyberChassisB HV busbar bollards */
    for(const sz of [-5.35,5.35]){
     box('columnar',sx*5.35,G,sz,.52,.62,.52,P('columnar'));
     box('cyberChassisB',sx*5.35,G+.62,sz,.42,.18,.42,hyTotemMatCol('cyberChassisB'));
     hyPinInsulator(sx*5.35,G+.80,sz,.85,sz>0?0:1);
    }
    /* Front Censorate & Machine-Talker public docket terminals flanking the central walk apron */
    W(sx*3.85,G,3.55,sx*-.24,()=>{
     box('cyberChassis',0,0,0,1.08,.76,.62,hyTotemMatCol('cyberChassis'));
     box('nephrite',0,.76,0,1.14,.10,.68,P('nephrite'));
     hyCyberTerminalHousing(0,.86,0,.64,.62,.32,341135+(sx>0?3:0),sx<0);
    });
   }
  });
  hyBilingualSign(-5.35,G+1.35,.2,PI*.5,1.45,.86);
  hyBilingualSign(5.35,G+1.35,.2,-PI*.5,1.45,.86);
  hySeismicChimes(-3.85,G+2.55,-.45,0,1.65,1.1,5);
  hySeismicChimes(3.85,G+2.55,-.45,0,1.65,1.1,5);

  hyFurnList([
   ['eternian_court_petition_stand',0,G,3.15,PI],
   ['eternian_court_gallery_bench',-4.35,G,.85,PI*.5],
   ['eternian_court_gallery_bench',4.35,G,.85,-PI*.5],
   ['hayrant_jade_lantern_post',-2.45,G,5.15,0],
   ['hayrant_jade_lantern_post',2.45,G,5.15,0]
  ]);
  if(CURREC&&!PLACE_DRY){
   CURREC.voice={lang:'bilingual-eternian-hayrant',color:0x4ef6ff,seat:'Mirabilis Central Square'};
  }
  hyTarget(0,G,4.35,'cyber-totem-plaza');
 }});

/* 17d. Market-Square Talking-Head Cyber-Totem Obelisk (seed 34114) */
defBuilding({key:'hy_cyber_totem_obelisk',name:'Market-Square Talking-Head Cyber-Totem Monument',seed:34114,cut:false,
 front:{x:0,z:5.2,yaw:0},
 w:12.0,d:12.0,h:16.8,budget:165000,
 tags:{types:['civic','infrastructure'],wealth:'rich',style:'prefect',job:'scribing',landmark:true},
 note:'compact 12x12 m civic and market-square monument raising a 15.6 m monumental cyber-totem over 4 diagonal bilingual public-address & insulator steles',
 build(){
  const G=.46;
  hyPlinth(8.6,8.6,G,{stepW:2.8,stepX:0});

  /* Central 15.6 m Monumental Cyber-Totem (summit at 16.06 m <= 16.8 m, span 5.0 m <= 12.0 m) */
  hyMonumentalCyberTotem(0,G,0,0,{
   h:15.6,tiers:5,span:5.0,r:.62,seed:341140,
   materials:['silver','titanium','gold','celadon','bronze']
  });

  /* 4 Diagonal Corner Public-Address & Porcelain-Insulator Transformer Steles (leaving N/S/E/W axial walks clear) */
  svNoWalk(()=>{
   for(const sx of [-1,1])for(const sz of [-1,1]){
    const cx=sx*3.25,cz=sz*3.25,ang=Math.atan2(sx,sz);
    const stCf=sx*sz>0?'cyberFormB':'cyberFormC';
    W(cx,G,cz,ang,()=>{
     box('megabreccia',0,0,0,.96,.54,.68,P('megabreccia'));
     box('cyberChassisB',0,.54,0,.86,1.42,.52,hyTotemMatCol('cyberChassisB'));
     hyFormLayerBox(stCf,0,.66,.26,1,.66,.52,hyTotemMatCol(stCf));
     hyCyberTerminalHousing(0,1.26,.04,.52,.50,.28,341142+(sx>0?2:0)+(sz>0?1:0),sx*sz>0);
     const cap=hyPinInsulator(0,1.96,-.12,.92,(sx+sz)&1);
     /* Radial jumper loop from corner stele insulator up to central colossus dais */
     sagRope('brass',cap,[0,2.65,-1.85],.18,.014,P('brass'),7);
    });
   }
  });
  hyBilingualSign(-3.85,G+1.35,0,-PI*.5,1.22,.74);
  hyBilingualSign(3.85,G+1.35,0,PI*.5,1.22,.74);

  hyFurnList([
   ['eternian_court_petition_stand',0,G,2.85,PI],
   ['hayrant_jade_lantern_post',-2.05,G,3.65,0],
   ['hayrant_jade_lantern_post',2.05,G,3.65,0],
   ['hayrant_seismic_chime_rack',0,G,-3.35,PI]
  ]);
  hyTarget(0,G,3.35,'obelisk-square');
 }});
