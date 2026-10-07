// prefix: dt
// ================================================================= THE TRADES: smithy, supply, hidemaker, the seer and the hookah tent
// The smithy, the supply tent and the hidemaker's came from the Scyvoi kit (2026-10-07), re-skinned: brown hair cloth or
// hides with white bands, the desert's pieces inside. The seer (the desert's counterpart of the Scyvoi shaman) reads sand,
// stars and smoke in a small white tent sewn with stars; the hookah tent is an open-sided canopy where the men sit at
// evening with coffee, tea and the water pipe.
defBuilding({key:'tent-smithy',name:'Smithy tent',seed:4802,cut:true,w:11,d:10,h:4.6,budget:90000,
 tags:{types:['industry','shop'],wealth:'middle',style:'awning',job:'smithing'},
 note:'an open-sided smithy under brown hair cloth on six poles (from the Scyvoi kit), a dry-stone wind wall behind the forge, the anvil, goatskin bellows and quench trough',
 build(o){const w=8,d=6;const H=tkPeaked({w,d,eaveH:2.35,peaks:[[-1.8,-.3,3.9],[1.8,-.3,3.9]],cover:'hair',col:P('hair'),seam:.7,walls:false,guys:3});
  for(const [x,z] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2],[0,d/2],[0,-d/2]])pole('wood',[x,0,z],[x,H(x,z)-.03,z],.07,P('woodD'),8);
  {const pts=[];for(let i=0;i<=16;i++){const x=-w/2+i*w/16;pts.push([x,H(x,d/2)+.03,d/2]);}cord('plain',pts,.05,P('trimW'));}   // the white edge band
  for(const pk of [[-1.8,3.9],[1.8,3.9]])W(pk[0],0,-.3,0,()=>dkFinial(pk[1]+.25));
  tkNoCut(()=>{for(let i=0;i<14;i++)for(let j=0;j<3;j++){const x=-w/2+.3+i*(w-.6)/13+(j%2)*.2;ellip('stone',x,.25+j*.42,-d/2-.35,rr(.32,.42),rr(.2,.26),rr(.26,.34),P('stone'),rr(-.2,.2),8);}});
  tkFloor('earth',P('earth'),0,w-.2,d-.2);
  FURNISH('nomad_trade_forge',0,0,-d/2+.7,0);smokeAt(0,2.3,-d/2+.6,{r:.35});
  FURNISH('nomad_bellows',1.35,0,-d/2+.8,-PI/2);FURNISH('nomad_trade_anvil',0,0,-.6,0);FURNISH('nomad_trade_trough',-1.6,0,-.7,PI/2);
  FURNISH('nomad_trade_grindstone',2.6,0,.6,-PI/2);FURNISH('nomad_trade_weapon_rack',-3.6,0,-1.2,PI/2);FURNISH('nomad_trade_armour_stand',-3.4,0,.8,PI/2);
  FURNISH('nomad_common_workbench',3.4,0,-1.9,-PI/2);FURNISH('nomad_trade_bin',-2.2,0,-d/2+.5,0);FURNISH('nomad_trade_display',2.2,0,2.4,PI,{v:0});
  FURNISH('nomad_camel_saddle_rack',-2.4,0,2.3,PI,{setting:'both'});}});

defBuilding({key:'tent-hidemaker',name:"Hidemaker's tent",seed:4804,cut:true,w:13,d:11,h:3.9,budget:90000,
 tags:{types:['industry','shop'],wealth:'middle',style:'awning',job:'tanning'},
 note:"the tanner's (from the Scyvoi kit): a hide awning over the beam and the vats, frames of stretched hides, a drying line outside; goat, camel and sheep hides",
 build(o){const w=7,d=5;const H=tkPeaked({w,d,eaveH:2.2,peaks:[[0,-.4,3.4]],cover:'hide',col:P('hide'),walls:false,guys:3});
  for(const [x,z] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2],[0,d/2],[0,-d/2],[-w/2,0],[w/2,0]])pole('wood',[x,0,z],[x,H(x,z)-.03,z],.065,P('woodD'),8);
  psurf('hide',(u,v)=>{const x=-w/2+u*w;return [x,H(x,-d/2)*(1-v)+.05*v,-d/2-.05-.1*v];},10,3,P('hideD'),{colf:(u,v)=>{const k=.7+.5*dtHash(Math.floor(u*7),Math.floor(v*2));return new THREE.Color(k,k*.9,k*.8);}});
  W(0,0,0,0,()=>dkWall([-w/2,d/2],[w/2,d/2],L=>dkBand(L,H(0,d/2)-.42,.36,'chevron',P('trimW'),{z:.01})));
  W(0,0,-.4,0,()=>dkFinial(3.6));
  tkFloor('earth',P('earth'),0,w-.2,d-.2);
  FURNISH('nomad_fleshing_beam',-1.6,0,.2,PI/2);FURNISH('nomad_tanning_vat',.6,0,-1.4,0);FURNISH('nomad_tanning_vat',2.0,0,-1.3,.6,{v:1});
  FURNISH('nomad_hide_frame',-2.2,0,-1.9,0);FURNISH('nomad_hide_frame',.0,0,-2.0,0,{v:1});FURNISH('nomad_hide_stack',2.6,0,.9,-PI/2);
  FURNISH('nomad_common_workbench',2.9,0,-.5,-PI/2);FURNISH('nomad_water_skins',-3.0,0,1.6,PI/2,{setting:'both'});
  FURNISH('nomad_drying_line',-1.2,0,4.0,0,{setting:'outdoor'});FURNISH('nomad_hide_frame',-4.6,0,2.2,PI/2+.3,{setting:'outdoor'});
  FURNISH('nomad_hide_frame',3.9,0,3.6,-.3,{setting:'outdoor',v:1});}});
/* a small hash for patchy colours (no stream) */
function dtHash(x,y){const s=Math.sin(x*12.9898+y*78.233)*43758.5453;return s-Math.floor(s);}
defBuilding({key:'tent-supply',name:'Supply tent',seed:4803,cut:true,w:14,d:10.5,h:4.9,budget:90000,
 tags:{types:['market','shop'],wealth:'middle',style:'khaima',job:'trading'},
 note:"the clan's store and the caravaneers' market (from the Scyvoi kit): a long brown khaima open along its whole front, counters, bales, sacks, dates, rugs and saddlery",
 build(o){const w=10,d=6;const H=dkSquare({w,d,eaveH:1.0,peaks:[[-2.6,-.4,4.2],[2.6,-.4,4.2]],open:{x0:-4.2,x1:4.2,h:2.4},floor:'earth',floorCol:P('earth'),motif:'step'});
  for(const x of [-2.7,0,2.7])FURNISH('nomad_common_counter',x,0,1.9,0,{v:x===0?1:0});
  FURNISH('nomad_trade_display',-3.9,0,-.8,PI/2,{v:1});FURNISH('nomad_trade_display',3.9,0,-.8,-PI/2);
  FURNISH('nomad_supply_bales',-3.4,0,-2.2,0);FURNISH('nomad_supply_bales',-2.1,0,-2.3,.1);FURNISH('nomad_trade_barrel',0,0,-2.5,0);
  FURNISH('nomad_date_baskets',2.2,0,-2.2,0);FURNISH('nomad_grain_sacks',3.6,0,-2.1,0);FURNISH('nomad_water_jars',1.0,0,-.6,0);
  FURNISH('nomad_saddle_bags',-1.2,0,-.4,PI/2);FURNISH('nomad_studded_chest',3.6,0,.6,-PI/2);
  for(const x of [-2.6,2.6])FURNISH_HANG('nomad_hanging_lantern',x+.6,H(x+.6,-.4)-.3,-.4,0);
  FURNISH('nomad_date_baskets',-1.4,0,3.6,0,{setting:'outdoor'});FURNISH('nomad_supply_bales',1.6,0,3.7,.3,{setting:'outdoor'});}});

defBuilding({key:'tent-seer',name:"Seer's tent",seed:4805,cut:true,w:8,d:8.4,h:4.8,budget:60000,
 tags:{types:['religious'],wealth:'middle',style:'caidal',role:'seer'},
 note:"the seer's tent (the desert's counterpart of a shaman): a small white tent sewn with dark stars, the sand-reading tray, the star chart, amulets and incense",
 build(o){const H=dkCaidal({s:4.6,wallH:2.0,peakH:3.9,motif:'lozenge',doorW:1.3,floor:'patKilim'});
  // dark eight-pointed stars on the roof (the contrasting pattern, sewn on)
  for(const [x,z] of [[0,1.25],[1.25,0],[-1.25,0],[0,-1.25]]){const y=H(x,z)+.04;for(let k=0;k<2;k++){const r=.28,a0=k*PI/4;poly('plain',[0,1,2,3].map(i=>{const a=a0+i*PI/2;return [x+Math.cos(a)*r,y,z+Math.sin(a)*r];}),P('trim'),true);}}
  FURNISH('nomad_sand_table',0,0,.1,0);FURNISH('nomad_astrolabe',-1.4,0,-1.4,tkFace(-1.4,-1.4));FURNISH('nomad_star_chart',1.3,0,-1.9,0);
  FURNISH_HANG('nomad_amulet_strings',-.9,H(-.9,.6)-.1,.6,0);FURNISH_HANG('nomad_amulet_strings',1.0,H(1,.3)-.1,.3,PI/3);
  FURNISH('nomad_incense_burner',1.5,0,.9,0);FURNISH('nomad_oil_lamp',-1.6,0,.9,0);
  for(const a of [TK_DOOR+2.2,TK_DOOR-2.2])FURNISH('nomad_floor_cushion',tkAt(1.3,a)[0],0,tkAt(1.3,a)[1],tkFace(...tkAt(1.3,a)),{v:2});
  FURNISH('nomad_tying_stone',1.9,0,3.4,0,{setting:'outdoor'});}});

defBuilding({key:'tent-hookah',name:'Hookah tent',seed:4806,cut:true,w:12,d:12,h:5.4,budget:90000,
 tags:{types:['tavern'],wealth:'middle',style:'canopy'},
 note:'the hookah tent: an open-sided square canopy, white with dark bands of small arches, its walls rolled up; majlis seats round the edge, hookahs, coffee and tea, lanterns hung low',
 build(o){const s=8,s2=s/2,wH=2.4,pH=4.6,sc=new THREE.Color();
  const H=(x,z)=>{const m=Math.max(Math.abs(x),Math.abs(z))/(s2+.4);return wH+.05+(pH-wH)*Math.pow(1-clamp(m,0,1),1.2);};
  psurf('canvas',(u,v)=>{const x=-(s2+.4)+u*(s+.8),z=-(s2+.4)+v*(s+.8);return [x,H(x,z),z];},20,20,P('canvas'),{colf:(u,v)=>{const x=u-.5,z=v-.5,d=Math.abs(Math.abs(x)-Math.abs(z));return sc.setRGB(d<.01?.72:1,d<.01?.72:1,d<.01?.72:1);}});
  psurf('patLining',(u,v)=>{const x=-(s2-.05)+u*(s-.1),z=-(s2-.05)+v*(s-.1);return [x,H(x,z)-.07,z];},16,16,null);
  // the walls rolled up under the eave on every side, the dark arch band on the eave skirt
  const C=[[-s2,s2],[s2,s2],[s2,-s2],[-s2,-s2]];
  for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4];beam('canvas',[a[0]*1.02,wH-.12,a[1]*1.02],[b[0]*1.02,wH-.12,b[1]*1.02],.14,P('canvas'),true,10);
   dkWall(a,b,L=>{psurf('canvas',(u,v)=>[-L/2-.4+u*(L+.8),wH+.06-v*.42,.02],8,1,P('canvas'));dkBand(L+.6,wH-.34,.3,'arch',P('trim'),{z:.035});},.4);}
  for(const [x,z] of C){pole('wood',[x,0,z],[x,wH+.06,z],.07,P('woodD'),8);tkGuy([x*1.08,wH+.05,z*1.08],x*1.5,z*1.5);}
  for(const [x,z] of [[0,s2],[0,-s2],[s2,0],[-s2,0]])pole('wood',[x,0,z],[x,wH+.06,z],.06,P('woodD'),8);
  pole('wood',[0,0,0],[0,pH+.3,0],.1,P('woodD'),10);dkFinial(pH+.4);
  tkFloor('rug',P('rust'),0,s-.1,s-.1);FURNISH('nomad_court_carpet',0,.03,0,0);
  // seats round three sides, the hookahs between, coffee by the open front, lanterns low
  tkMajlis(-3.4,-3.55,3.4,-3.55,undefined,0);tkMajlis(-3.55,-2.0,-3.55,2.4,0,0);tkMajlis(3.55,-2.0,3.55,2.4,0,0,{v:1});
  FURNISH('nomad_hookah_grand',0,0,-.6,0);for(const [x,z] of [[-2.2,-2.2],[2.2,-2.2],[-2.2,1.2],[2.2,1.2]])FURNISH('nomad_hookah',x,0,z,tkFace(x,z));
  for(const [x,z] of [[-1.2,-2.4],[1.2,-2.4]]){FURNISH('nomad_tray_table',x,0,z,0);FURNISH('nomad_tea_set',x,svfH('nomad_tray_table',0,.45),z,0);}
  tkCoffee(1.6,2.6,PI);FURNISH('nomad_incense_burner',-1.6,0,2.8,0);
  for(const [x,z] of [[-2,-1],[2,-1],[0,1.6]])FURNISH_HANG('nomad_hanging_lantern',x,H(x,z)-.6,z,0);
  door(0,0,s2,0,3.5);}});
