// prefix: dl
// ================================================================= LARGE TENTS: five for the herding families (several generations under one roof)
// Tags: culture nomad, types dwelling-multi, wealth middle (the sheikh's is in 46). The Saharan pavilion and the twin-peaked
// khaima came from the Scyvoi kit (2026-10-07), re-skinned: white canvas with dark bands, brown hair cloth with white ones,
// and the muted Moroccan lining in place of the Scyvoi's saffron and fire-bloom.
defBuilding({key:'tent-bayt-great',name:'Great goat-hair tent',seed:4401,cut:true,w:16.4,d:15.5,h:3.4,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'beit-shaar'},
 note:"a long black tent on three rows of poles: the men's majlis open to the front, the qata (a sadu-woven divider), the household behind it, the coffee hearth at the majlis's heart",
 build(o){const w=12,d=6;const H=dkBayt({w,d,rows:[{z:-1.6,n:3,h:2.45},{z:.1,n:3,h:2.95},{z:1.7,n:3,h:2.55}],frontH:2.1,backH:1.05,stripes:[2,7],frontPoles:6,qata:2.2,qataD:.88});
  tkFloor('patSadu',null,0,w-.3,d-.3);
  // the majlis: mattresses in a U facing the open front, the coffee hearth at its heart, the tea tray
  tkMajlis(-5.6,-2.5,1.8,-2.5,undefined,0);
  for(const z of [-.9,1.2])FURNISH('nomad_majlis_mattress',-5.5,0,z,PI/2,{v:1});
  FURNISH('nomad_kilim',-2,.03,-.4,0);FURNISH('nomad_kilim',-2,.03,1.4,0,{v:1});
  tkCoffee(-2.2,.6,0);tkTea(-.4,0,PI);FURNISH('nomad_incense_burner',-4.3,0,-1.4,0);
  FURNISH_HANG('nomad_hanging_lantern',-2,H(-2,.1)-.05,.1,0);FURNISH_HANG('nomad_hanging_lantern',.8,H(.8,-1.6)-.05,-1.6,0);
  // the household: bedding, chests, the loom, the stores, the churn
  FURNISH('nomad_bedding_stack',4.8,0,-2.4,0);FURNISH('nomad_studded_chest',3.3,0,-2.5,0);FURNISH('nomad_studded_chest',5.4,0,-.8,-PI/2,{v:1});
  FURNISH('nomad_ground_loom',3.6,0,.8,PI/2);FURNISH('nomad_grain_sacks',5.2,0,1.6,-PI/2);FURNISH('nomad_water_jars',4.3,0,2.3,PI);
  FURNISH('nomad_quern',3.1,0,-1.0,0);FURNISH('nomad_spindle_basket',4.4,0,-1.1,0);
  // outside: the women's fire, the bread griddle, the churn
  FURNISH('nomad_saj_oven',3.6,0,5.2,0,{setting:'outdoor'});smokeAt(3.6,.6,5.2,{r:.25});FURNISH('nomad_butter_churn',5.4,0,4.6,-.3,{setting:'outdoor'});
  for(let i=0;i<5;i++){const a=PI*.2+i*PI*.6/4,x=-1.5+Math.cos(a)*2.0,z=5.6+Math.sin(a)*2.0;FURNISH('nomad_camel_saddle_seat',x,0,z,tkFace(x,z,-1.5,5.6),{setting:'outdoor'});}
  FURNISH('nomad_coffee_hearth',-1.5,0,5.6,0,{setting:'outdoor'});smokeAt(-1.5,.5,5.6,{r:.3});}});

defBuilding({key:'tent-pavilion',name:'Saharan pavilion',seed:4403,cut:true,w:12.5,d:12.5,h:6.6,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'pavilion'},
 note:'a square white marquee (from the Scyvoi kit): dark brown bands of small arches and steps outside, the muted Moroccan lining, low tables and majlis seats under pierced lanterns',
 build(o){const s=8;const H=dkCaidal({s,wallH:2.3,peakH:5.3,motif:'arch',doorW:2.4,floor:'rug',floorCol:P('rust')});
  for(const [x,z] of [[-1.9,-1.9],[1.9,-1.9],[-1.9,1.4],[1.9,1.4]]){FURNISH('nomad_low_table',x,0,z,0);FURNISH('nomad_floor_lantern',x+.15,svfH('nomad_low_table',0,.36),z,0);
   for(let k=0;k<3;k++){const a=k*TAU/3+(x<0?.4:-.4),px=x+Math.cos(a)*1.05,pz=z+Math.sin(a)*1.05;FURNISH(k===1?'nomad_pouf':'nomad_floor_cushion',px,0,pz,tkFace(px,pz,x,z),{v:k%2});}}
  FURNISH('nomad_court_carpet',0,.03,-.25,0);
  tkMajlis(-3.4,-3.55,3.4,-3.55,undefined,0);
  for(const x of [-2.4,0,2.4])FURNISH_HANG('nomad_hanging_lantern',x,H(x,0)-.15,0,0);
  FURNISH('nomad_coffee_set',3.4,0,-.4,-PI/2);FURNISH('nomad_studded_chest',-3.5,0,-.3,PI/2);FURNISH('nomad_mashrabiya_screen',3.3,0,2.6,-PI/2);}});

defBuilding({key:'tent-caidal',name:'Caidal tent',seed:4404,cut:true,w:13,d:13,h:7.4,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'caidal'},
 note:"a large caidal tent: white outside with dark lozenge bands and a horned finial, the lining's arches inside, a family's sleeping alcoves behind a mashrabiya screen",
 build(o){const s=9;const H=dkCaidal({s,wallH:2.5,peakH:6.2,motif:'lozenge',doorW:2.4,floor:'patSadu'});
  FURNISH('nomad_court_carpet',0,.03,.4,0,{v:1});
  tkMajlis(-4.0,-1.2,-4.0,3.4,0,1.1);tkMajlis(4.0,-1.2,4.0,3.4,0,1.1,{v:1});
  FURNISH('nomad_tray_table',0,0,1.4,0);FURNISH('nomad_tea_set',0,svfH('nomad_tray_table',0,.45),1.4,0);FURNISH('nomad_brazier',0,0,-.4,0);
  for(const x of [-1.6,1.6])FURNISH('nomad_pouf',x,0,2.3,0,{v:x>0?1:0});
  // the alcoves at the back, behind the screens
  for(const x of [-2.2,2.2])FURNISH('nomad_mashrabiya_screen',x,0,-1.9,0,{v:x>0?1:0});
  FURNISH('nomad_bedding_stack',-3.2,0,-3.8,0);FURNISH('nomad_bedding_stack',3.2,0,-3.8,0);FURNISH('nomad_studded_chest',0,0,-3.9,0,{v:1});
  FURNISH('nomad_saddle_bags',-1.4,0,-3.6,0);FURNISH('nomad_water_jars',1.5,0,-3.6,0);
  FURNISH_HANG('nomad_hanging_lantern',0,H(0,0)-.5,0,0);for(const s2 of [-1,1])FURNISH_HANG('nomad_hanging_lantern',s2*2.6,H(s2*2.6,1.4)-.2,1.4,0);}});

defBuilding({key:'tent-square-great',name:'Great hair-cloth tent',seed:4406,cut:true,w:15,d:12,h:5.2,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'khaima'},
 note:'a broad square tent of brown hair cloth on two masts, white bands of lozenges and steps round the walls and roof, the front raised wide; a reception room and a household',
 build(o){const w=11,d=8;const H=dkSquare({w,d,eaveH:1.0,peaks:[[-2.6,-.4,4.6],[2.6,-.4,4.6]],open:{x0:-3.2,x1:3.2,h:2.5},lining:'patLining',floor:'rug',floorCol:P('rust'),motif:'lozenge'});
  FURNISH('nomad_kilim',-2.4,.03,.5,0);FURNISH('nomad_kilim',2.4,.03,.5,0,{v:2});
  tkMajlis(-5,-3.6,1.0,-3.6,undefined,0);tkMajlis(-5.1,-2.2,-5.1,2.4,0,0);
  tkCoffee(-2.4,.4,PI);tkTea(-.4,-1.6,PI);
  FURNISH('nomad_tent_divider',2.0,0,-1.2,PI/2);
  FURNISH('nomad_bedding_stack',4.6,0,-3.5,0);FURNISH('nomad_studded_chest',3.2,0,-3.6,0);FURNISH('nomad_ground_loom',3.8,0,.6,PI/2);
  FURNISH('nomad_grain_sacks',4.9,0,2.4,-PI/2);FURNISH('nomad_water_jars',3.0,0,2.9,PI);
  for(const x of [-2.6,2.6])FURNISH_HANG('nomad_hanging_lantern',x+.7,H(x+.7,-.4)-.25,-.4,0);}});

defBuilding({key:'tent-khaima-twin',name:'Twin-peaked khaima',seed:4405,cut:true,w:16,d:11.5,h:5.2,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'khaima'},
 note:'a long brown khaima on two masts (from the Scyvoi kit): white triangles banded round it, the middle raised over the doorway, carpets and majlis seats within',
 build(o){const w=12,d=7;const H=dkSquare({w,d,eaveH:.9,peaks:[[-3,-.2,4.7],[3,-.2,4.7]],open:{x0:-2.4,x1:2.4,h:2.55},lining:'patLining',floor:'rug',floorCol:P('rust'),motif:'tri'});
  for(const x of [-3,3])FURNISH('nomad_kilim',x,.03,.3,0,{v:x>0?1:0});
  FURNISH('nomad_court_carpet',0,.03,-1.6,0);
  tkMajlis(-5.4,-3.05,5.4,-3.05,undefined,0);
  for(const x of [-5.4,5.4]){FURNISH('nomad_majlis_mattress',x,0,-.2,x<0?PI/2:-PI/2);FURNISH('nomad_majlis_mattress',x,0,2.0,x<0?PI/2:-PI/2,{v:1});}
  for(const x of [-3,3]){FURNISH('nomad_brazier',x,0,1.5,0);FURNISH_HANG('nomad_hanging_lantern',x+.9,H(x+.9,-.2)-.2,-.2,0);}
  tkTea(0,-.4,PI);FURNISH('nomad_coffee_set',1.2,0,-1.9,0);
  for(const x of [-1.6,1.6])FURNISH('nomad_studded_chest',x,0,-2.8,0,{v:x>0?1:0});}});
