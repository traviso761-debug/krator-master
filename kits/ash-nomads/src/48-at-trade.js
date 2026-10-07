// prefix: at
// ================================================================= THE SHAMAN'S HUT AND THE TRADES: smithy, supply, the chitin-and-hide worker
// The shaman's hut came from the Scyvoi kit (2026-10-07), re-skinned for the Ash Nomads: a cone of crossed poles under grey
// and black hides, smoke-black at the crown, a ring of dark stones; red and yellow ribbons on the pole tips, beetle and
// runner skulls, spirit poles of stacked chitin. The smithy and the chitin worker work under open-sided black awnings
// (the ash is cleaner than the walls), the supply tent is a long peaked tent open along its front.
/* a small hash for patchy colours (no stream) */
function atHash(x,y){const s=Math.sin(x*12.9898+y*78.233)*43758.5453;return s-Math.floor(s);}
/* an open-sided awning: a peaked black roof on poles, its eaves banded, spires on the masts. Returns H(x,z). */
function atAwning(w,d,peaks,eaveH){const H=tkPeaked({w,d,eaveH,peaks,cover:'ashCloth',col:P('ash'),seam:.6,walls:false,guys:3});
 const xs=[-w/2,0,w/2],zs=[-d/2,d/2];for(const x of xs)for(const z of zs)pole('wood',[x,0,z],[x,H(x,z)-.03,z],.07,P('woodD'),8);
 alWall([-w/2,d/2],[w/2,d/2],L=>akBand(L,eaveH-.5,.45,{z:.01,figs:['fret','beetle']}));
 for(const pk of peaks)W(pk[0],0,pk[1],0,()=>akSpire(pk[2]+.05,1));return H;}
defBuilding({key:'hut-shaman',name:"Shaman's hut",seed:4801,cut:true,w:9,d:10,h:6.2,budget:60000,
 tags:{types:['religious'],wealth:'middle',style:'lodge',role:'shaman'},
 note:"the shaman's lodge (from the Scyvoi kit): grey and black hides on crossed poles over a ring of dark stones, the fire at the centre, drum, skulls and herbs; spirit poles of chitin outside",
 build(o){const r=3,apex=5.0,dW=.95,g=(dW/2+.12)/r,A0=PI/2+g,A1=PI/2+TAU-g;const sc=new THREE.Color();
  for(let i=0;i<26;i++){const a=i/26*TAU;if(tkNearDoor(a,g+.05))continue;const p=tkAt(r+.12,a);ellip('rock',p[0],.12,p[1],rr(.22,.32),rr(.16,.24),rr(.2,.3),P('stoneD'),a,8);}
  const NP=14;for(let i=0;i<NP;i++){const a=i/NP*TAU+.11;const b=tkAt(r-.02,a),t=tkAt(.45,a+PI+.25);pole('wood',[b[0],0,b[1]],[t[0]*.9,apex+.95,t[1]*.9],.055,P('woodD'),6);}
  const prof=[];for(let i=0;i<=6;i++){const t=i/6;prof.push([lerp(r+.06,.42,t),lerp(0,apex-.1,t)+Math.sin(PI*t)*.12]);}
  lathe('hide',0,0,prof,40,P('hide'),{a0:A0,a1:A1,colf:(u,v)=>{const pa=h3(Math.floor(u*9),Math.floor(v*5),7),soot=smooth(.55,1,v);const k=(pa<.25?.45:pa<.4?1.15:1)*(1-.78*soot);return sc.setRGB(k,k,k);}});
  // a painted band of red and yellow figures round the hides, low
  akBandRing(r+.05,.55,.5,{gap:g+.12,figs:['spiral','bird','beetle','eye']});
  for(let k=0;k<6;k++){const a=A0+(A1-A0)*(k+.5)/6;cord('rope',prof.map(q=>[Math.cos(a)*(q[0]+.03),q[1],Math.sin(a)*(q[0]+.03)]),.018,0x5a4e40);}
  psurf('hide',(u,v)=>{const x=dW/2+.1-u*.55;return [x,1.75-v*1.65,r*.98+.05+u*.15];},3,4,P('hideD'));
  // a beetle's skull over the door (the mandibles spread), ribbons on the pole tips, skulls on stakes
  ellip('bone',0,1.95,r*.97+.1,.24,.15,.22,0xd8ccb0,0,10);for(const s of [-1,1]){const pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push([s*(.12+t*.45),1.98+Math.sin(t*PI)*.18,r+.15+t*.25]);}cord('chitin',pts,.035,P('chitin'));}
  for(let i=0;i<NP;i+=2){const a=i/NP*TAU+.11,t=tkAt(.45,a+PI+.25);const tip=[t[0]*.9,apex+.95,t[1]*.9];
   withCloth(clothFlag(.7,.2),()=>W(tip[0],tip[1]-.05,tip[2],a,()=>psurf('flag',(u,v)=>[u*.7,-v*.09,0],4,1,P(pick(['red','yellow','ochre','vermilion'])))));}
  for(const s of [-1,1]){pole('wood',[s*1.1,0,r+1.3],[s*1.1,1.6,r+1.3],.04,P('woodD'),6);ellip('bone',s*1.1,1.66,r+1.3,.13,.1,.17,0xe4dac4,0,8);}
  tkFloor('patEmber',null,r-.15);
  FURNISH('ashnomad_fire_pit',0,0,0,0);smokeAt(0,apex,0,{r:.35});
  FURNISH('ashnomad_shaman_drum',-1.4,0,-1.3,tkFace(-1.4,-1.3));FURNISH('ashnomad_bone_rack',.9,0,-2.3,0);FURNISH('ashnomad_skull_shrine',-.6,0,-2.3,0);
  FURNISH_HANG('ashnomad_herb_bundles',-.9,2.6,.4,PI/3);FURNISH_HANG('ashnomad_herb_bundles',1.0,2.4,-.6,-PI/4);
  FURNISH('ashnomad_smoke_bowl',1.5,0,-1.2,0);
  for(const a of [TK_DOOR+2.1,TK_DOOR-2.1,TK_DOOR+PI-.4])FURNISH('ashnomad_floor_cushion',tkAt(1.75,a)[0],0,tkAt(1.75,a)[1],tkFace(...tkAt(1.75,a)),{v:2});
  FURNISH('ashnomad_spirit_pole',-2.1,0,r+1.6,0,{setting:'outdoor'});FURNISH('ashnomad_spirit_pole',2.2,0,r+2.0,0,{setting:'outdoor',v:1});
  door(0,0,r,0,dW);}});

defBuilding({key:'tent-smithy',name:'Smithy',seed:4802,cut:true,w:11,d:10,h:5.4,budget:90000,
 tags:{types:['industry','shop'],wealth:'middle',style:'awning',job:'smithing'},
 note:'an open-sided smithy under a black peaked awning, a dry-stone wind wall of dark basalt behind the forge, anvil, bellows, quench trough, chitin armour on its stand',
 build(o){const w=8,d=6;atAwning(w,d,[[-1.8,-.3,4.2],[1.8,-.3,4.2]],2.4);
  tkNoCut(()=>{for(let i=0;i<14;i++)for(let j=0;j<3;j++){const x=-w/2+.3+i*(w-.6)/13+(j%2)*.2;ellip('stone',x,.25+j*.42,-d/2-.35,rr(.32,.42),rr(.2,.26),rr(.26,.34),P('stoneD'),rr(-.2,.2),8);}});
  tkFloor('earth',P('earth'),0,w-.2,d-.2);
  FURNISH('ashnomad_trade_forge',0,0,-d/2+.7,0);smokeAt(0,2.3,-d/2+.6,{r:.35});
  FURNISH('ashnomad_bellows',1.35,0,-d/2+.8,-PI/2);FURNISH('ashnomad_trade_anvil',0,0,-.6,0);FURNISH('ashnomad_trade_trough',-1.6,0,-.7,PI/2);
  FURNISH('ashnomad_trade_grindstone',2.6,0,.6,-PI/2);FURNISH('ashnomad_trade_weapon_rack',-3.6,0,-1.2,PI/2);FURNISH('ashnomad_trade_armour_stand',-3.4,0,.8,PI/2);
  FURNISH('ashnomad_common_workbench',3.4,0,-1.9,-PI/2);FURNISH('ashnomad_trade_bin',-2.2,0,-d/2+.5,0);FURNISH('ashnomad_trade_display',2.2,0,2.4,PI,{v:0});
  FURNISH('ashnomad_beetle_saddle_rack',-2.4,0,2.3,PI,{setting:'both'});}});

defBuilding({key:'tent-chitinworker',name:"Chitin and hide worker's tent",seed:4804,cut:true,w:13,d:11,h:4.4,budget:90000,
 tags:{types:['industry','shop'],wealth:'middle',style:'awning',job:'tanning'},
 note:"the hidemaker's counterpart: under a black awning the hides of the runner are fleshed and tanned and the cast rings of the millipedes are cleaned, cut and stacked; frames of stretched hides, a drying line",
 build(o){const w=7,d=5;atAwning(w,d,[[0,-.4,3.6]],2.2);
  psurf('hide',(u,v)=>{const x=-w/2+u*w;return [x,2.15*(1-v)+.05*v,-d/2-.05-.1*v];},10,3,P('hideD'),{colf:(u,v)=>{const k=.6+.6*atHash(Math.floor(u*7),Math.floor(v*2));return new THREE.Color(k,k,k);}});
  tkFloor('earth',P('earth'),0,w-.2,d-.2);
  FURNISH('ashnomad_fleshing_beam',-1.6,0,.2,PI/2);FURNISH('ashnomad_tanning_vat',.6,0,-1.4,0);FURNISH('ashnomad_chitin_bench_work',2.4,0,-1.2,0);
  FURNISH('ashnomad_hide_frame',-2.2,0,-1.9,0);FURNISH('ashnomad_plate_stack',2.6,0,.9,-PI/2);FURNISH('ashnomad_carapace_stack',.6,0,.8,0);
  FURNISH('ashnomad_hide_stack',-3.0,0,1.4,PI/2);
  FURNISH('ashnomad_drying_line',-1.2,0,4.0,0,{setting:'outdoor'});FURNISH('ashnomad_hide_frame',-4.6,0,2.2,PI/2+.3,{setting:'outdoor',v:1});
  FURNISH('ashnomad_plate_stack',3.9,0,3.6,-.3,{setting:'outdoor'});}});

defBuilding({key:'tent-supply',name:'Supply tent',seed:4803,cut:true,w:14,d:10.5,h:5.4,budget:90000,
 tags:{types:['market','shop'],wealth:'middle',style:'peaked',job:'trading'},
 note:"the band's store: a long black tent on two masts, open along its whole front under a red-toothed valance; bales of hide and felt, chitin plates, grub jars, eggs",
 build(o){const w=10,d=6;const H=tkPeaked({w,d,eaveH:1.1,peaks:[[-2.6,-.4,4.6],[2.6,-.4,4.6]],cover:'ashCloth',col:P('ash'),seam:.6,wallKey:'ashCloth',wallCol:P('ashG'),open:{x0:-4.2,x1:4.2,h:2.5},floor:'earth',floorCol:P('earth')});
  for(const [a,b] of [[[-w/2,-d/2],[w/2,-d/2]],[[w/2,-d/2],[w/2,d/2]],[[-w/2,d/2],[-w/2,-d/2]]])alWall(a,b,L=>akBand(L,.45,.45,{z:.14}));
  for(const x of [-2.6,2.6])W(x,0,-.4,0,()=>akSpire(4.65,1));
  for(let i=0;i<20;i++){const x0=-4.2+i*.42,x1=x0+.42,xm=(x0+x1)/2,y=H(xm,d/2);poly('flag',[[x0,y,d/2+.03],[x1,y,d/2+.03],[xm,y-.3,d/2+.03]],P('red'),true);}
  for(const x of [-2.7,0,2.7])FURNISH('ashnomad_common_counter',x,0,1.9,0,{v:x===0?1:0});
  FURNISH('ashnomad_trade_display',-3.9,0,-.8,PI/2,{v:1});FURNISH('ashnomad_trade_display',3.9,0,-.8,-PI/2);
  FURNISH('ashnomad_supply_bales',-3.4,0,-2.2,0);FURNISH('ashnomad_supply_bales',-2.1,0,-2.3,.1);FURNISH('ashnomad_plate_stack',0,0,-2.5,0);
  FURNISH('ashnomad_grub_jars',2.2,0,-2.2,0);FURNISH('ashnomad_egg_basket',3.6,0,-2.1,0);FURNISH('ashnomad_water_gourds',1.0,0,-.6,0);
  FURNISH('ashnomad_saddle_bags',-1.2,0,-.4,PI/2);FURNISH('ashnomad_chitin_chest',3.6,0,.6,-PI/2);
  for(const x of [-2.6,2.6])FURNISH_HANG('ashnomad_hanging_lantern',x+.6,H(x+.6,-.4)-.6,-.4,0);
  FURNISH('ashnomad_paper_lantern',-4.6,0,3.4,0,{setting:'outdoor'});FURNISH('ashnomad_supply_bales',1.6,0,3.7,.3,{setting:'outdoor'});}});
