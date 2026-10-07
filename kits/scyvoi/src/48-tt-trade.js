// prefix: tt
// ================================================================= THE SHAMAN'S HUT, THE SMITHY TENT, THE SUPPLY TENT
// The hut is a lodge, not a tent: a cone of poles crossed at the top, hides and old felts lashed over it, smoke-black at
// the crown, on a ring of stones, with bones and ribbons; spirit poles outside. The smithy is open-sided under hides
// (fire-proof enough) with a dry-stone wind wall at its back; the supply tent is a long khaima with its whole front open.
defBuilding({key:'hut-shaman',name:"Shaman's hut",seed:4801,cut:true,w:9,d:10,h:6.2,budget:60000,
 tags:{types:['religious'],wealth:'middle',style:'lodge',role:'shaman'},
 note:"the shaman's lodge: hides on crossed poles over a stone ring, a fire at the centre, drum, bones and herbs",
 build(o){const r=3,apex=5.0,dW=.95,g=(dW/2+.12)/r,A0=PI/2+g,A1=PI/2+TAU-g;const sc=new THREE.Color();
  // the stone ring the lodge stands in
  for(let i=0;i<26;i++){const a=i/26*TAU;if(tkNearDoor(a,g+.05))continue;const p=tkAt(r+.12,a);ellip('rock',p[0],.12,p[1],rr(.22,.32),rr(.16,.24),rr(.2,.3),P('stoneD'),a,8);}
  // the poles, crossed and splayed above the smoke hole
  const NP=14;for(let i=0;i<NP;i++){const a=i/NP*TAU+.11;const b=tkAt(r-.02,a),t=tkAt(.45,a+PI+.25);pole('wood',[b[0],0,b[1]],[t[0]*.9,apex+.95,t[1]*.9],.055,P('woodD'),6);}
  // the cover: hides and felts, patched, the crown blackened by smoke
  const prof=[];for(let i=0;i<=6;i++){const t=i/6;prof.push([lerp(r+.06,.42,t),lerp(0,apex-.1,t)+Math.sin(PI*t)*.12]);}
  const hide=P('hide');
  lathe('hide',0,0,prof,40,hide,{a0:A0,a1:A1,colf:(u,v)=>{const pa=h3(Math.floor(u*9),Math.floor(v*5),7),soot=smooth(.55,1,v);const k=(pa<.25?.62:pa<.4?1.18:1)*(1-.78*soot);return sc.setRGB(k,k*(pa<.25?1.05:1),k*(pa<.25?1.1:1));}});
  // lacing seams and the door: a felt lintel band, the hide flap tied half open, a bear-skull over it
  for(let k=0;k<6;k++){const a=A0+(A1-A0)*(k+.5)/6;cord('rope',prof.map(q=>[Math.cos(a)*(q[0]+.03),q[1],Math.sin(a)*(q[0]+.03)]),.018,0x6a5038);}
  psurf('hide',(u,v)=>{const x=dW/2+.1-u*.55;return [x,1.75-v*1.65,r*.98+.05+u*.15];},3,4,P('hideD'));
  ellip('bone',0,1.95,r*.97+.1,.22,.16,.26,0xe0d4b8,0,10);for(const s of [-1,1])pole('bone',[s*.15,2.0,r+.1],[s*.5,2.3,r+.25],.03,0xd8ccb0,5);
  // ribbons on the pole tips and skulls on stakes before the door
  for(let i=0;i<NP;i+=2){const a=i/NP*TAU+.11,t=tkAt(.45,a+PI+.25);const tip=[t[0]*.9,apex+.95,t[1]*.9];
   withCloth(clothFlag(.7,.2),()=>W(tip[0],tip[1]-.05,tip[2],a,()=>psurf('flag',(u,v)=>[u*.7,-v*.09,0],4,1,P(pick(['madder','teal','saffron','cream'])))));}
  for(const s of [-1,1]){pole('wood',[s*1.1,0,r+1.3],[s*1.1,1.6,r+1.3],.04,P('woodD'),6);ellip('bone',s*1.1,1.66,r+1.3,.13,.1,.17,0xe4dac4,0,8);}
  // inside: the fire, drum, bone rack, herbs, the smoke bowl, felts on the floor
  tkFloor('patBlack',null,r-.15);
  FURNISH('scyvoi_fire_pit',0,0,0,0);smokeAt(0,apex,0,{r:.35});
  FURNISH('scyvoi_shaman_drum',-1.4,0,-1.3,tkFace(-1.4,-1.3));FURNISH('scyvoi_bone_rack',.9,.2,-2.45,0);
  FURNISH_HANG('scyvoi_herb_bundles',-.9,2.6,.4,PI/3);FURNISH_HANG('scyvoi_herb_bundles',1.0,2.4,-.6,-PI/4);
  FURNISH('scyvoi_smoke_bowl',1.5,0,-1.2,0);medallion('medMoon',0,.03,1.15,1.7,{round:true});
  for(const a of [TK_DOOR+2.1,TK_DOOR-2.1,TK_DOOR+PI])FURNISH('scyvoi_floor_cushion',tkAt(1.75,a)[0],0,tkAt(1.75,a)[1],tkFace(...tkAt(1.75,a)),{v:2});
  FURNISH('scyvoi_spirit_pole',-2.1,0,r+1.6,0,{setting:'outdoor'});FURNISH('scyvoi_spirit_pole',2.2,0,r+2.0,0,{setting:'outdoor',v:0});
  door(0,0,r,0,dW);}});

defBuilding({key:'tent-smithy',name:'Smithy tent',seed:4802,cut:true,w:11,d:10,h:4.4,budget:90000,
 tags:{types:['industry','shop'],wealth:'middle',style:'awning',job:'smithing'},
 note:'an open-sided smithy under hides on six poles, a dry-stone wind wall behind the forge, the anvil, bellows and quench trough',
 build(o){const w=8,d=6;const H=tkPeaked({w,d,eaveH:2.35,peaks:[[-1.8,-.3,3.9],[1.8,-.3,3.9]],cover:'hide',col:P('hide'),walls:false,guys:3});
  for(const [x,z] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2],[0,d/2],[0,-d/2]])pole('wood',[x,0,z],[x,H(x,z)-.03,z],.07,P('woodD'),8);
  // the wind wall: rough dry stone behind the forge
  tkNoCut(()=>{for(let i=0;i<14;i++)for(let j=0;j<3;j++){const x=-w/2+.3+i*(w-.6)/13+(j%2)*.2;ellip('stone',x,.25+j*.42,-d/2-.35,rr(.32,.42),rr(.2,.26),rr(.26,.34),P('stone'),rr(-.2,.2),8);}});
  tkFloor('earth',P('earth'),0,w-.2,d-.2);
  FURNISH('scyvoi_trade_forge',0,0,-d/2+.7,0);smokeAt(0,2.3,-d/2+.6,{r:.35});
  FURNISH('scyvoi_bellows',1.35,0,-d/2+.8,-PI/2);FURNISH('scyvoi_trade_anvil',0,0,-.6,0);FURNISH('scyvoi_trade_trough',-1.6,0,-.7,PI/2);
  FURNISH('scyvoi_trade_grindstone',2.6,0,.6,-PI/2);FURNISH('scyvoi_trade_weapon_rack',-3.6,0,-1.2,PI/2);FURNISH('scyvoi_trade_armour_stand',-3.4,0,.8,PI/2);
  FURNISH('scyvoi_common_workbench',3.4,0,-1.9,-PI/2);FURNISH('scyvoi_trade_bin',-2.2,0,-d/2+.5,0);FURNISH('scyvoi_trade_display',2.2,0,2.4,PI,{v:0});
  FURNISH('scyvoi_saddle_rack',-2.4,0,2.3,PI,{setting:'both'});}});

defBuilding({key:'tent-hidemaker',name:"Hidemaker's tent",seed:4804,cut:true,w:13,d:11,h:3.6,budget:90000,
 tags:{types:['industry','shop'],wealth:'middle',style:'awning',job:'tanning'},
 note:"the tanner's: a hide awning over the beam and the vats, frames of stretched hides, a drying line and a smoking frame outside; goat, salamander and game hides",
 build(o){const w=7,d=5;const H=tkPeaked({w,d,eaveH:2.2,peaks:[[0,-.4,3.4]],cover:'hide',col:P('hide'),walls:false,guys:3});
  for(const [x,z] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2],[0,d/2],[0,-d/2],[-w/2,0],[w/2,0]])pole('wood',[x,0,z],[x,H(x,z)-.03,z],.065,P('woodD'),8);
  /* a back wall of old hides hung from the eave against the wind */
  psurf('hide',(u,v)=>{const x=-w/2+u*w;return [x,H(x,-d/2)*(1-v)+.05*v,-d/2-.05-.1*v];},10,3,P('hideD'),{colf:(u,v)=>{const k=.7+.5*ttHash(Math.floor(u*7),Math.floor(v*2));return new THREE.Color(k,k*.9,k*.8);}});
  tkFloor('earth',P('earth'),0,w-.2,d-.2);
  FURNISH('scyvoi_fleshing_beam',-1.6,0,.2,PI/2);FURNISH('scyvoi_tanning_vat',.6,0,-1.4,0);FURNISH('scyvoi_tanning_vat',2.0,0,-1.3,.6,{v:1});
  FURNISH('scyvoi_hide_frame',-2.2,0,-1.9,0);FURNISH('scyvoi_hide_frame',.0,0,-2.0,0,{v:1});FURNISH('scyvoi_hide_stack',2.6,0,.9,-PI/2);
  FURNISH('scyvoi_common_workbench',2.9,0,-.5,-PI/2);FURNISH('scyvoi_water_skins',-3.0,0,1.6,PI/2,{setting:'both'});
  FURNISH('scyvoi_drying_line',-1.2,0,4.0,0,{setting:'outdoor'});FURNISH('scyvoi_smoking_frame',3.6,0,3.8,0,{setting:'outdoor'});smokeAt(3.6,2.3,3.8,{r:.4});
  FURNISH('scyvoi_hide_frame',-4.6,0,2.2,PI/2+.3,{setting:'outdoor'});}});
/* a small hash for patchy colours (no stream) */
function ttHash(x,y){const s=Math.sin(x*12.9898+y*78.233)*43758.5453;return s-Math.floor(s);}
defBuilding({key:'tent-supply',name:'Supply tent',seed:4803,cut:true,w:14,d:10.5,h:4.6,budget:90000,
 tags:{types:['market','shop'],wealth:'middle',style:'khaima',job:'trading'},
 note:"the band's general store: a long khaima open along its whole front, counters, bales, sacks, fire-fruit, felts and saddlery",
 build(o){const w=10,d=6;const H=tkPeaked({w,d,eaveH:1.0,peaks:[[-2.6,-.4,4.2],[2.6,-.4,4.2]],cover:'canvas',col:P('canvas'),open:{x0:-4.2,x1:4.2,h:2.4},floor:'earth',floorCol:P('earth')});
  for(const x of [-2.7,0,2.7])FURNISH('scyvoi_common_counter',x,0,1.9,0,{v:x===0?1:0});
  FURNISH('scyvoi_trade_display',-3.9,0,-.8,PI/2,{v:1});FURNISH('scyvoi_trade_display',3.9,0,-.8,-PI/2);
  FURNISH('scyvoi_supply_bales',-3.4,0,-2.2,0);FURNISH('scyvoi_supply_bales',-2.1,0,-2.3,.1);FURNISH('scyvoi_trade_barrel',0,0,-2.5,0);
  FURNISH('scyvoi_fruit_baskets',2.2,0,-2.2,0);FURNISH('scyvoi_fruit_baskets',3.6,0,-2.1,0,{v:1});FURNISH('scyvoi_common_store',1.0,0,-.6,0);
  FURNISH('scyvoi_saddle_rack',-1.2,0,-.4,PI/2);FURNISH('scyvoi_painted_chest',3.6,0,.6,-PI/2);
  for(const x of [-2.6,2.6])FURNISH_HANG('scyvoi_hanging_lantern',x+.6,H(x+.6,-.4)-.3,-.4,0);
  FURNISH('scyvoi_fruit_baskets',-1.4,0,3.6,0,{setting:'outdoor'});FURNISH('scyvoi_supply_bales',1.6,0,3.7,.3,{setting:'outdoor'});}});
