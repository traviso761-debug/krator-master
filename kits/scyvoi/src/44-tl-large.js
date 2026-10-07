// prefix: tl
// ================================================================= LARGE TENTS: five for the warrior and hunter families (several generations under one roof)
// Tags: culture scyvoi, types dwelling-multi, wealth middle (a large tent is a family's, not a lord's: the chief's is in 46).
defBuilding({key:'tent-great-ger',name:'Great ger',seed:4401,cut:true,w:11.6,d:11.6,h:5.0,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'ger'},
 note:'a great felt ger on two red centre posts: the appliqué band, a fire-bloom dado inside, a kilim floor, a chandelier from the crown',
 build(o){const r=5;tkYurt({r,wallH:1.8,crownH:4.6,crownR:.85,doorW:1.0,doorH:1.6,felt:P('feltW'),band:'patFelt',bandH:.55,posts:true,floor:'patKilim',lining:'patBloom'});
  medallion('medCloud',0,.03,0,2.9,{round:true});
  FURNISH('scyvoi_ger_stove',0,0,.55,0,{v:1});smokeAt(0,4.9,.55,{r:.25,kind:'flue'});
  tkHonour(r,{hangY:.9});
  tkRingSeats(r-.55,['scyvoi_toshak'],{step:2.35,gap:1.0,skip:a=>tkNearDoor(a+PI,.75)});
  for(const s of [-1,1])tkTea(s*1.9,1.6,tkFace(s*1.9,1.6));
  for(const s of [-1,1]){const p=tkAt(r-.6,TK_DOOR+s*.78);FURNISH('scyvoi_painted_chest',p[0],0,p[1],tkFace(p[0],p[1]),{v:1});}
  {const p=tkAt(r-.7,TK_DOOR+2.4);FURNISH('scyvoi_common_loom',p[0],0,p[1],tkFace(p[0],p[1]));}
  FURNISH('scyvoi_pouf',-1,0,-1.6,0);FURNISH('scyvoi_pouf',1.1,0,-1.5,0,{v:1});
  FURNISH_HANG('scyvoi_glass_chandelier',0,4.1,-1.2,0);
  for(const s of [-1,1])FURNISH_HANG('scyvoi_hanging_lantern',s*2.6,3.0,-.6,0);
  for(const s of [-1,1]){const p=tkAt(r-.3,TK_DOOR+s*1.25);FURNISH('scyvoi_tack_pegs',p[0],1.05,p[1],tkFace(p[0],p[1]));}}});

defBuilding({key:'tent-black-great',name:'Great goat-hair tent',seed:4402,cut:true,w:16,d:15.5,h:3.4,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'beit-shaar'},
 note:"a long black tent on three rows of poles: the men's majlis open to the front, a kilim divider, the household behind it, a fire ring outside",
 build(o){const w=12,d=6;const H=tkBlack({w,d,rows:[{z:-1.6,n:3,h:2.45},{z:.1,n:3,h:2.95},{z:1.7,n:3,h:2.55}],frontH:2.1,backH:1.05,stripes:[2,7],valance:P('madder'),frontPoles:6});
  tkFloor('patKilim',null,0,w-.3,d-.3);
  // the divider (ma'nad): a woven curtain between the majlis (x < 2) and the household (x > 2)
  psurf('patKilim',(u,v)=>{const z=-d/2+u*d*.88;return [2.2,.05+v*(H(2.2,z)-.15),z];},6,3,null);
  // the majlis: toshaks in a U facing the open front, rugs, tea and coffee, the lantern
  tkRowSeats(-5.5,-2.5,1.6,-2.5,['scyvoi_toshak'],2.2,undefined,0);
  for(const z of [-.9,1.2])FURNISH('scyvoi_toshak',-5.5,0,z,PI/2,{v:1});
  FURNISH('scyvoi_common_rug',-2,.03,-.4,0);FURNISH('scyvoi_common_rug',-2,.03,1.4,0,{v:1});
  tkTea(-2.5,0,PI);FURNISH('scyvoi_samovar',-1.1,0,-.2,PI);
  FURNISH_HANG('scyvoi_hanging_lantern',-2,H(-2,.1)-.05,.1,0);FURNISH_HANG('scyvoi_hanging_lantern',.8,H(.8,-1.6)-.05,-1.6,0);
  // the household: bedding, chests, the loom, the stores
  FURNISH('scyvoi_bedding_stack',4.8,0,-2.4,0);FURNISH('scyvoi_painted_chest',3.3,0,-2.5,0);FURNISH('scyvoi_painted_chest',5.4,0,-.8,-PI/2,{v:1});
  FURNISH('scyvoi_common_loom',3.4,0,.6,PI/2);FURNISH('scyvoi_common_store',5.2,0,1.6,-PI/2);FURNISH('scyvoi_water_skins',4.3,0,2.3,PI);
  FURNISH('scyvoi_floor_cushion',3.9,0,-.9,0);FURNISH('scyvoi_floor_cushion',4.5,0,-1.1,0,{v:2});
  // outside: the fire ring and its circle of cushions, the coffee kettle on the fire
  FURNISH('scyvoi_fire_pit',-1.5,0,5.6,0,{setting:'outdoor'});smokeAt(-1.5,.7,5.6,{r:.3});
  for(let i=0;i<7;i++){const a=PI*.15+i*PI*.7/6,x=-1.5+Math.cos(a)*2.0,z=5.6+Math.sin(a)*2.0;FURNISH('scyvoi_bolster',x,0,z,tkFace(x,z,-1.5,5.6),{setting:'outdoor'});}}});

defBuilding({key:'tent-applique',name:'Appliqué tent',seed:4404,cut:true,w:13,d:13,h:6.3,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'applique'},
 note:"an eight-sided tent of appliquéd panels framed in white felt, a white roof edged in indigo, a green fringe: a war band's tent with its arms racked inside",
 build(o){const R=4.6;tkPolygon({n:8,R,wallH:2.4,peakH:5.7,wallKey:['patApp','patApp2'],roof:0xf4efe6,trim:0x23345a,trim2:0x1f5a5e,fringe:0x2a8a52,floor:'rug',floorCol:P('indigo'),doorW:1.5});
  medallion('medBlades',0,.03,0,3.6,{round:true});
  FURNISH('scyvoi_brazier',0,0,.9,0);
  tkRingSeats(R-.75,['scyvoi_toshak','scyvoi_floor_cushion'],{step:1.75,gap:.9,skip:a=>Math.abs(Math.cos(a))>.86});
  for(const s of [-1,1]){FURNISH('scyvoi_trade_weapon_rack',s*(R-.62),0,0,s<0?PI/2:-PI/2);FURNISH('scyvoi_trade_armour_stand',s*(R-1.0),0,-1.4,tkFace(s*(R-1.0),-1.4),{v:s>0?1:0});}
  FURNISH('scyvoi_lance_stand',-1.2,0,-3.4,0);FURNISH('scyvoi_painted_chest',1.0,0,-3.6,0);
  FURNISH_HANG('scyvoi_hanging_lantern',0,4.6,-.6,0);FURNISH_HANG('scyvoi_hanging_lantern',0,4.6,1.6,0);}});

/* ---- (2026-10-07) the Saharan pavilion and the twin-peaked khaima went to the Desert Nomads kit; in their place, two Tibetan halls */
defBuilding({key:'tent-tibet-hall',name:'Appliqué hall',seed:4403,cut:true,w:16,d:12.5,h:6.6,budget:140000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'tibetan'},
 note:'a long white hall tent: its hipped roof sewn all over with the blue appliqué, its cream walls banded with the polychrome rosettes and the flame zellige, a fringe in five colours, prayer flags from both masts; a family of riders within',
 build(o){const w=11,d=7;const H=tkPeaked({w,d,eaveH:2.2,peaks:[[-2.6,-.2,5.4],[2.6,-.2,5.4]],cover:'patApp',col:null,wallKey:'canvas',wallCol:P('cream'),open:{x0:-1.6,x1:1.6,h:2.8},lining:'patBloom',floor:'patKilim'});
  tsWallBand(w,d,H,'patPoly',.25,.85);tsWallBand(w,d,H,'patFlame',1.35,1.7);
  {const pts=[];for(const [x,z] of [[-w/2,d/2],[-w/2,-d/2],[w/2,-d/2],[w/2,d/2]])pts.push([x*1.01,H(x,z)+.01,z*1.01]);pts.push(pts[0]);tsFringe(pts,.32,[P('madder'),P('teal'),P('indigo'),P('saffron')]);}
  for(const x of [-2.6,2.6]){sph('brass',x,5.55,-.2,.12,0xc8963a);tsFlags([x,5.5,-.2],[x*2.4,.2,-d/2-2.6],11,.5);}
  tsFlags([-2.6,5.5,-.2],[2.6,5.5,-.2],8,.6);
  medallion('medSun',0,.03,-.4,2.6,{round:true});
  tkRowSeats(-5.0,-3.05,5.0,-3.05,['scyvoi_toshak'],2.2,undefined,0);
  for(const x of [-5.0,5.0]){FURNISH('scyvoi_toshak',x,0,-.6,x<0?PI/2:-PI/2);FURNISH('scyvoi_bedding_stack',x,0,1.6,x<0?PI/2:-PI/2);}
  for(const x of [-2.6,2.6]){FURNISH('scyvoi_low_round_table',x,0,-.6,0);FURNISH('scyvoi_tea_set',x,svfH('scyvoi_low_round_table',0,.36),-.6,0);FURNISH_HANG('scyvoi_hanging_lantern',x+.8,H(x+.8,-.2)-.3,-.2,0);}
  FURNISH('scyvoi_ger_stove',0,0,.9,0);smokeAt(0,H(0,.9)+.4,.9,{r:.2,kind:'flue'});FURNISH('scyvoi_samovar',1.3,0,1.6,0);
  FURNISH('scyvoi_common_loom',-3.6,0,1.9,PI/2);FURNISH('scyvoi_painted_chest',0,0,-2.9,0,{v:1});
  FURNISH_HANG('scyvoi_glass_chandelier',0,H(0,-.2)-.2,-.2,0);}});

defBuilding({key:'tent-tibet-great',name:'Festival tent',seed:4405,cut:true,w:17,d:13,h:7.6,budget:140000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'tibetan'},
 note:'a great white tent of three hipped peaks, the middle raised high over the door: the blue knotwork appliqué on the roof, cream walls banded with appliqué panels and the flame zellige, a red, green and gold fringe, prayer flags; a war band\'s feasting tent',
 build(o){const w=12,d=8;const H=tkPeaked({w,d,eaveH:2.3,peaks:[[-3.6,-.2,4.9],[0,-.2,6.6],[3.6,-.2,4.9]],cover:'patApp',col:null,wallKey:'canvas',wallCol:P('cream'),open:{x0:-2.0,x1:2.0,h:3.0},lining:'patBloom',floor:'rug',floorCol:P('crimson')});
  tsWallBand(w,d,H,'patApp2',.25,1.05);tsWallBand(w,d,H,'patFlame',1.45,1.8);
  {const pts=[];for(const [x,z] of [[-w/2,d/2],[-w/2,-d/2],[w/2,-d/2],[w/2,d/2]])pts.push([x*1.01,H(x,z)+.01,z*1.01]);pts.push(pts[0]);tsFringe(pts,.36,[P('madder'),P('teal'),P('saffron')]);}
  for(const x of [-3.6,0,3.6])sph('brass',x,(x?4.9:6.6)+.15,-.2,.13,0xc8963a);
  tsFlags([0,6.7,-.2],[-6,.2,-d/2-3],13,.6);tsFlags([0,6.7,-.2],[6,.2,-d/2-3],13,.6);tsFlags([0,6.7,-.2],[0,.2,-d/2-3.4],9,.4);
  medallion('medBlades',0,.03,0,3.2,{round:true});
  FURNISH('scyvoi_court_carpet',0,.03,-1.6,0);
  tkRowSeats(-5.5,-3.55,5.5,-3.55,['scyvoi_toshak','scyvoi_floor_cushion'],1.3,undefined,0);
  for(const x of [-5.5,5.5])tkRowSeats(x,-2.2,x,2.6,['scyvoi_toshak'],2.2,0,0);
  for(const x of [-2.4,2.4]){FURNISH('scyvoi_low_round_table',x,0,0,0);FURNISH('scyvoi_tea_set',x,svfH('scyvoi_low_round_table',0,.36),0,0);FURNISH('scyvoi_brazier',x,0,2.2,0);}
  FURNISH('scyvoi_cauldron',0,0,-1.5,0,{setting:'indoor'});smokeAt(0,6.4,-1.5,{r:.25,kind:'flue'});
  for(const s of [-1,1])FURNISH('scyvoi_trade_weapon_rack',s*4.2,0,-3.6,0);
  FURNISH_HANG('scyvoi_glass_chandelier',0,H(0,-.2)-.4,-.2,0);for(const x of [-3.6,3.6])FURNISH_HANG('scyvoi_hanging_lantern',x,H(x,-.2)-.3,-.2,0);}});
