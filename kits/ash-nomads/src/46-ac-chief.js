// prefix: ac
// ================================================================= THE CHIEFTAIN'S TENT and THE ASSEMBLY
// The chieftain's tent takes the massing of the owner's "nomad chief" reference: a tall central spire, four lower spired
// lobes round it over arched gables, arched doorways, all black and grey under ornate yellow and red. No vardo: the Ash
// Nomads use no wheels. The assembly ("nomad assembly"): the band's communal tent and mess hall, a great round tent under a
// low roof with a pedimented porch, the sun disc raised over it on a frame flanked by red banners, banner poles round it;
// inside, long tables and benches, the cookpots and the serving counter, the council's fire and seats at the centre.
defBuilding({key:'tent-chieftain',name:"Chieftain's tent",seed:4601,cut:true,w:27,d:27,h:17.5,budget:260000,
 tags:{types:['civic','dwelling-single'],wealth:'rich',style:'spire'},
 note:"the chieftain's great tent: a tall central spire, four spired lobes over arched gables, a ring of chitin columns inside, the carapace high seat",
 build(o){const R=9;const rY=akChief({R,wallH:3.0,cR:4.2,drumH:6.2,peakH:16,lobeR:2.8,lobeH:9.5,lobeD:8.0,lobes:4,doorW:3.0,lining:'patCrawl',band:'patNazca'});
  for(let i=0;i<8;i++){const p=tkAt(5.8,(i+.5)/8*TAU);pole('chitin',[p[0],0,p[1]],[p[0],rY(5.8)-.2,p[1]],.16,P('chitin'),10);cyl('brass',p[0],0,p[1],.24,.3,0xc89a3a,10);}
  // the dais and the high seat at the back, divans either side, the war standard behind
  cyl('carved',0,0,-6.0,2.4,.4,P('woodD'),32);WX(0,.41,-6.0,0,0,0,()=>medallion('medAshSun',0,0,0,4.2,{round:true}));
  FURNISH('ashnomad_chief_seat',0,.42,-6.6,0);for(const s of [-1,1])FURNISH('ashnomad_chief_divan',s*1.7,.42,-6.0,s<0?.6:-.6);
  FURNISH('ashnomad_war_standard',0,.42,-7.9,0);
  FURNISH('ashnomad_court_carpet',0,.03,-2.6,0);FURNISH('ashnomad_court_carpet',0,.03,1.6,0,{v:1});
  tkRingSeats(R-.8,['ashnomad_floor_cushion','ashnomad_bolster'],{step:1.4,gap:.5,skip:a=>Math.abs(((a-(TK_DOOR+PI))%TAU+TAU)%TAU-PI)>PI-.7});
  for(const s of [-1,1]){FURNISH('ashnomad_brazier',s*2.4,0,-1.2,0);FURNISH('ashnomad_paper_lantern',s*3.6,0,3.6,0);}
  for(const s of [-1,1])for(const z of [-.5,2.5]){FURNISH('ashnomad_carapace_table',s*1.7,0,z,0);FURNISH('ashnomad_brew_set',s*1.7,svfH('ashnomad_carapace_table',0,.4),z,0);}
  for(const a of [TK_DOOR+PI+.55,TK_DOOR+PI-.55,TK_DOOR+PI+1.25,TK_DOOR+PI-1.25]){const p=tkAt(R-.3,a);FURNISH_HANG('ashnomad_hanging_banner',p[0],2.95,p[1],tkFace(p[0],p[1]),{v:Math.round(a*7)%3});}
  FURNISH_HANG('ashnomad_hanging_lantern',0,9,-2.5,0);for(const s of [-1,1])FURNISH_HANG('ashnomad_hanging_lantern',s*3.4,5.6,.6,0);
  FURNISH('ashnomad_chitin_chest',5.6,0,-3.8,tkFace(5.6,-3.8));FURNISH('ashnomad_chitin_chest',-5.6,0,-3.8,tkFace(-5.6,-3.8),{v:1});
  for(const s of [-1,1])FURNISH('ashnomad_spear_rack',s*2.4,0,R-.9,PI);
  tkNoCut(()=>{for(const a of [PI/2+.55,PI/2-.55])akBanner(Math.cos(a)*(R+3.2),Math.sin(a)*(R+3.2),7.5,{ry:0,len:3.2});});
  FURNISH('ashnomad_lantern_pole',-4.2,0,R+3.6,0,{setting:'outdoor'});FURNISH('ashnomad_lantern_pole',4.2,0,R+3.6,0,{setting:'outdoor'});}});

const AC={R:10,wH:2.8,pH:8.2};
defBuilding({key:'tent-assembly',name:'Assembly and mess hall',seed:4602,cut:true,w:30,d:32,h:15.5,budget:260000,
 tags:{types:['civic','tavern'],wealth:'middle',style:'assembly'},
 note:'the band\'s communal tent and mess hall: a great round tent, a pedimented porch with the fire emblem, the gas giant (their emblem) raised over it between red banners; long tables, cookpots and the council fire inside',
 build(o){const R=AC.R;const rY=akConcave({R,wallH:AC.wH,peakH:AC.pH,k:1.15,doorW:3.4,floor:'earth',floorCol:P('earth'),teeth:72,guys:18,
   bands:[[.0,.1,'saw'],[.25,.31,'step'],[.55,.6,'line']],figs:['fret','bird','fret','beetle','fret','spiral'],bandSheet:'patNazca',bandY:.35,bandH:1.9});
  for(let i=0;i<10;i++){const p=tkAt(6.2,(i+.5)/10*TAU);pole('wood',[p[0],0,p[1]],[p[0],rY(6.2)-.12,p[1]],.12,P('woodD'),8);}
  // the porch: a gabled awning on four poles over the door, its pediment carrying the flame emblem
  tkNoCut(()=>{const z0=R-.2,z1=R+3.2,px=3.0,ph=AC.wH+.6;
   for(const [x,z] of [[-px,z1],[px,z1],[-px,z0+.4],[px,z0+.4]])pole('wood',[x,0,z],[x,ph,z],.1,P('woodD'),8);
   for(const s of [-1,1])psurf('ashCloth',(u,v)=>{const x=s*u*(px+.3),z=z0+v*(z1-z0+.3);return [x,ph+1.4*(1-u),z];},4,4,P('ash'));
   poly('plain',[[-px-.3,ph,z1+.32],[px+.3,ph,z1+.32],[0,ph+1.4,z1+.32]],akC(AK_K),true);
   W(0,0,z1+.34,0,()=>{for(let k=0;k<5;k++){const s=1-k*.18;poly('plain',[[-1.1*s,ph+.15,k*.004],[1.1*s,ph+.15,k*.004],[0,ph+.15+1.05*s,k*.004]],akC(k%2?AK_Y:AK_R),true);}   // the flame, in nested chevrons
    akBand(2*px+.5,ph-.45,.4,{z:.01,figs:['fret','spiral']});});
   const vq=[[-px-.3,ph-.02,z1+.32],[px+.3,ph-.02,z1+.32]];tkValance(vq,.35,'flag',P('red'),{per:1.6,tassels:0xe0b02a});
   // the emblem frame over the roof: two masts, a crossbar, the gas giant, red banners down each side
   const fy=AC.pH+3.6;for(const s of [-1,1]){pole('wood',[s*1.9,rY(1.9)-.5,1.2],[s*1.9,fy+1.5,1.2],.1,P('woodD'),8);
    W(s*1.9,0,1.2,0,()=>akSpire(fy+1.45,1));
    withCloth(clothHang(4.2,.04),()=>{psurf('flag',(u,v)=>[s*1.9+(u-.5)*.8,fy+1.12-v*4.28,1.31],3,8,akC(AK_B));psurf('flag',(u,v)=>[s*1.9+(u-.5)*.66,fy+1.1-v*4.2,1.32],3,8,P('red'));psurf('flag',(u,v)=>[s*1.9+(u-.5)*.66,fy+1.1-v*4.2,1.30],3,8,P('red'));});}
   beam('wood',[-2.1,fy+1.15,1.2],[2.1,fy+1.15,1.2],.08,P('woodD'),true,8);
   akGiant(fy-.2,1.32,1.55);
   // banner poles round the tent, each a long red banner with its yellow disc
   for(const a of [PI/2+.6,PI/2-.6,PI/2+1.9,PI/2-1.9,PI/2+PI])akBanner(Math.cos(a)*(R+2.8),Math.sin(a)*(R+2.8),7.2,{len:3.0,ry:Math.atan2(Math.cos(a),Math.sin(a))});});
  // the mess hall: two rows of long tables and benches either side of the aisle, the kitchen at the back
  for(const s of [-1,1])for(const z of [-1.2,2.2,5.4]){const x=s*4.0;FURNISH('ashnomad_mess_table',x,0,z,PI/2);for(const k of [-1,1])FURNISH('ashnomad_chitin_bench',x+k*.95,0,z,PI/2+(k>0?PI:0));}
  for(const x of [-2.2,0,2.2])FURNISH('ashnomad_cookpot',x,0,-8.0,0);smokeAt(0,AC.pH-.4,-8,{r:.4,kind:'flue'});
  FURNISH('ashnomad_serving_counter',0,0,-6.3,0);FURNISH('ashnomad_grub_jars',-4.6,0,-7.6,.6);FURNISH('ashnomad_egg_basket',4.6,0,-7.6,-.6);FURNISH('ashnomad_water_gourds',5.8,0,-6.2,-.9);
  FURNISH('ashnomad_supply_bales',-6.2,0,-6.0,.9);
  // the council ring at the centre: the fire, cushions round it
  FURNISH('ashnomad_fire_pit',0,0,1.6,0);for(let i=0;i<8;i++){const a=i/8*TAU+.2,x=Math.cos(a)*1.6,z=1.6+Math.sin(a)*1.6;if(Math.abs(x)<.5&&z>2.5)continue;FURNISH('ashnomad_floor_cushion',x,0,z,tkFace(x,z,0,1.6),{v:i%3});}
  for(const a of [TK_DOOR+PI+.7,TK_DOOR+PI-.7,TK_DOOR+PI+1.5,TK_DOOR+PI-1.5,TK_DOOR+2.2,TK_DOOR-2.2]){const p=tkAt(R-.3,a);FURNISH_HANG('ashnomad_hanging_banner',p[0],AC.wH-.06,p[1],tkFace(p[0],p[1]),{v:Math.round(a*5)%3});}
  for(const [x,z] of [[-4,0],[4,0],[-4,4],[4,4],[0,-4]])FURNISH_HANG('ashnomad_hanging_lantern',x,rY(Math.hypot(x,z))-.8,z,0);
  tkScreens(0,R+4.2,0,3.8);}});
