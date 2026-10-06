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

defBuilding({key:'tent-pavilion',name:'Saharan pavilion',seed:4403,cut:true,w:12.5,d:12.5,h:6.0,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'pavilion'},
 note:'a square saffron marquee: felt-scroll walls, an arch-printed lining, red seats round low tables under pierced lanterns',
 build(o){const s=8;const H=tkPavilion({s,wallH:2.3,peakH:5.3,roofCol:P('canvasO'),wallKey:'patFelt',lining:'patArch',val:P('madder'),floor:'patBloom',doorW:2.4});
  for(const [x,z] of [[-1.9,-1.9],[1.9,-1.9],[-1.9,1.4],[1.9,1.4]]){FURNISH('scyvoi_low_round_table',x,0,z,0);FURNISH('scyvoi_floor_lantern',x+.15,svfH('scyvoi_low_round_table',0,.36),z,0);
   for(let k=0;k<3;k++){const a=k*TAU/3+(x<0?.4:-.4),px=x+Math.cos(a)*1.05,pz=z+Math.sin(a)*1.05;FURNISH(k===1?'scyvoi_pouf':'scyvoi_toshak',px,0,pz,tkFace(px,pz,x,z),{v:k%2});}}
  medallion('medSun',0,.03,-.25,2.4,{round:true});
  tkRowSeats(-3.4,-3.55,3.4,-3.55,['scyvoi_floor_cushion'],.85,undefined,0);
  for(const x of [-2.4,0,2.4])FURNISH_HANG('scyvoi_hanging_lantern',x,H(x,0)-.15,0,0);
  FURNISH_HANG('scyvoi_glass_chandelier',0,H(0,-1.9)-.1,-1.9,0);
  FURNISH('scyvoi_samovar',3.4,0,-.4,-PI/2);FURNISH('scyvoi_painted_chest',-3.5,0,-.3,PI/2);}});

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

defBuilding({key:'tent-khaima-twin',name:'Twin-peaked khaima',seed:4405,cut:true,w:16,d:11.5,h:5.0,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'khaima'},
 note:'a long brown khaima on two masts, the sewn bands climbing to each peak, the middle raised over the doorway, carpets and toshaks within',
 build(o){const w=12,d=7;const H=tkPeaked({w,d,eaveH:.9,peaks:[[-3,-.2,4.7],[3,-.2,4.7]],cover:'canvas',col:P('khaima'),open:{x0:-2.4,x1:2.4,h:2.55},lining:'patArch',floor:'rug',floorCol:P('crimson')});
  for(const x of [-3,3])FURNISH('scyvoi_felt_rug_round',x,.03,.3,0,{v:x>0?1:0});
  FURNISH('scyvoi_common_rug',0,.03,-1.6,0);
  tkRowSeats(-5.4,-3.05,5.4,-3.05,['scyvoi_toshak'],2.2,undefined,0);
  for(const x of [-5.4,5.4]){FURNISH('scyvoi_toshak',x,0,-.2,x<0?PI/2:-PI/2);FURNISH('scyvoi_toshak',x,0,2.0,x<0?PI/2:-PI/2,{v:1});}
  for(const x of [-3,3]){FURNISH('scyvoi_brazier',x,0,1.5,0);FURNISH_HANG('scyvoi_hanging_lantern',x+.9,H(x+.9,-.2)-.2,-.2,0);}
  tkTea(0,-.4,PI);FURNISH('scyvoi_samovar',1.2,0,-1.9,0);
  for(const x of [-1.6,1.6])FURNISH('scyvoi_painted_chest',x,0,-3.0,0,{v:x>0?1:0});}});
