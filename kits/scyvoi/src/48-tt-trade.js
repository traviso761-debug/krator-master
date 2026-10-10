// prefix: tt
// ================================================================= THE SHAMAN'S GER, THE SMITHY, THE HIDEMAKER, THE SUPPLY TENT, THE CARTWRIGHT
// (2026-10-07) The hide lodge went to the Ash Nomads kit and the khaima-shaped trade tents to the Desert Nomads; the Scyvoi's
// own are felt and appliqué like the rest of their camp. The shaman keeps a dark ger hung with ribbons, mirrors and skulls;
// the smith and the cartwright work under felt roofs on open lattice (the ger's own frame, its walls left off on the front),
// the hidemaker under an appliqué-edged awning, the band's store in a great striped bell tent open at the front.
/* a small hash for patchy colours (no stream) */
function ttHash(x,y){const s=Math.sin(x*12.9898+y*78.233)*43758.5453;return s-Math.floor(s);}
/* an open ger frame: the lattice wall round the back half (open across the front, `open` radians either side of the door),
   red roof poles to a crown, a felt roof with an appliqué band. Returns the roof's height at radius r. */
function ttOpenGer(r,wH,cH,open){const cR=Math.max(.5,r*.16),seg=Math.max(28,Math.round(r*11)),A0=PI/2+open,A1=PI/2+TAU-open;
 const prof=[];for(let i=0;i<=6;i++){const t=i/6;prof.push([lerp(r+.2,cR+.09,t),lerp(wH-.02,cH+.04,t)+Math.sin(PI*t)*.08*r/4]);}
 lathe('felt',0,0,prof,seg,P('feltW'));lathe('patFelt',0,0,[[r+.22,wH-.32],[r+.2,wH-.02]],seg,null);
 const N=Math.round((A1-A0)*r/.3),D=wH/r*.92,lr=r-.02;for(let i=0;i<N;i++){const a=A0+(A1-A0)*i/N;for(const s of [1,-1]){const b=a+s*D,m=(a+b)/2;if(b<A0||b>A1)continue;
  beam('wood',[Math.cos(a)*lr,.04,Math.sin(a)*lr],[Math.cos(m)*lr,wH/2,Math.sin(m)*lr],.03,0xc8a070,false);beam('wood',[Math.cos(m)*lr,wH/2,Math.sin(m)*lr],[Math.cos(b)*lr,wH-.04,Math.sin(b)*lr],.03,0xc8a070,false);}}
 lathe('felt',0,0,[[r+.07,0],[r+.07,wH*.55]],seg,P('feltB'),{a0:A0,a1:A1});   // a felt skirt round the lattice's foot against the wind
 const M=Math.round(TAU*r/.42);for(let i=0;i<M;i++){const a=(i+.5)/M*TAU;pole('lacq',[Math.cos(a)*(r-.06),wH-.03,Math.sin(a)*(r-.06)],[Math.cos(a)*(cR-.02),cH-.1,Math.sin(a)*(cR-.02)],.028,null,5);}
 ring('lacq',0,cH-.08,0,cR,.07,null,0,0,0,24);
 for(const a of [PI/2+open,PI/2-open,PI/2+.0001])if(Math.abs(a-PI/2)>.01){const p=tkAt(r,a);pole('lacq',[p[0],0,p[1]],[p[0],wH,p[1]],.07,null,8);}
 for(const s of [-1,1]){const p=tkAt(r,PI/2+s*open*.5);pole('lacq',[p[0],0,p[1]],[p[0],wH,p[1]],.07,null,8);}
 return rr_=>lerp(wH,cH,clamp((r-rr_)/(r-cR),0,1));}
defBuilding({key:'ger-shaman',name:"Shaman's ger",seed:4801,cut:true,w:8.4,d:9.4,h:4.6,budget:70000,
 tags:{types:['religious'],wealth:'middle',style:'ger',role:'shaman'},
 note:"the shaman's ger: dark blue felt under the celestial band, ribbons in the five colours from the crown, bronze mirrors and salamander skulls over the door, spirit poles outside",
 build(o){const r=3;tkYurt({r,wallH:1.6,crownH:3.4,crownR:.5,doorW:.85,doorH:1.4,felt:P('indigo'),band:'patCelest',bandH:.5,floor:'patBlack',lining:'patCold'});
  // ribbons streaming from the crown, bronze mirrors and a salamander skull over the door
  for(let i=0;i<10;i++){const a=i/10*TAU;withCloth(clothHang(1.6,.08),()=>psurf('flag',(u,v)=>{const rr2=.55+v*1.4;return [Math.cos(a)*rr2+(u-.5)*.07*Math.sin(a),3.45-v*.9-v*v*.3,Math.sin(a)*rr2-(u-.5)*.07*Math.cos(a)];},1,6,TS_FLAGS[i%5]));}
  for(const x of [-.45,.45])W(x,1.75,r+.2,0,()=>{cyl('brass',0,0,0,.13,.02,0xb8862e,16);});
  W(0,1.95,r+.22,0,()=>{ellip('bone',0,0,0,.26,.13,.2,0xe0d4b8,0,10);for(const s of [-1,1])cone('bone',s*.12,.02,.15,.03,.12,0xd8ccb0,5);});
  medallion('medMoon',0,.03,.9,1.7,{round:true});
  FURNISH('scyvoi_fire_pit',0,0,0,0);smokeAt(0,3.5,0,{r:.25});
  FURNISH('scyvoi_shaman_drum',-1.4,0,-1.3,tkFace(-1.4,-1.3));FURNISH('scyvoi_bone_rack',.9,0,-2.45,0);
  FURNISH_HANG('scyvoi_herb_bundles',-.9,2.6,.4,PI/3);FURNISH_HANG('scyvoi_herb_bundles',1.0,2.4,-.6,-PI/4);
  FURNISH('scyvoi_smoke_bowl',1.5,0,-1.2,0);
  for(const a of [TK_DOOR+2.1,TK_DOOR-2.1,TK_DOOR+PI])FURNISH('scyvoi_floor_cushion',tkAt(1.75,a)[0],0,tkAt(1.75,a)[1],tkFace(...tkAt(1.75,a)),{v:2});
  FURNISH('scyvoi_spirit_pole',-2.1,0,r+1.6,0,{setting:'outdoor'});FURNISH('scyvoi_spirit_pole',2.2,0,r+2.0,0,{setting:'outdoor',v:0});}});

defBuilding({key:'tent-smithy',name:'Smithy',seed:4802,cut:true,w:11,d:11,h:5.0,budget:90000,
 tags:{types:['industry','shop'],wealth:'middle',style:'ger',job:'smithing'},
 note:'the smith works under a felt roof on an open lattice frame (a great ger with its front left off), red roof poles to the smoke crown, a dry-stone hearth wall behind the forge',
 build(o){const r=4.2;ttOpenGer(r,1.9,4.4,1.2);
  tkNoCut(()=>{for(let i=0;i<10;i++)for(let j=0;j<3;j++){const x=-2.2+i*.48+(j%2)*.2;ellip('stone',x,.25+j*.42,-r+.6,rr(.3,.4),rr(.2,.26),rr(.26,.34),P('stone'),rr(-.2,.2),8);}});
  tkFloor('earth',P('earth'),r-.05);
  FURNISH('scyvoi_trade_forge',0,0,-r+1.4,0);smokeAt(0,4.4,-r+1.4,{r:.35,kind:'flue'});
  FURNISH('scyvoi_bellows',1.4,0,-r+1.5,-PI/2);FURNISH('scyvoi_trade_anvil',0,0,-.5,0);FURNISH('scyvoi_trade_trough',-1.6,0,-.7,PI/2);
  FURNISH('scyvoi_trade_grindstone',2.4,0,.4,-PI/2);FURNISH('scyvoi_trade_weapon_rack',-3.2,0,-1.0,tkFace(-3.2,-1));FURNISH('scyvoi_trade_armour_stand',-3.0,0,.9,tkFace(-3,.9));
  FURNISH('scyvoi_common_workbench',3.0,0,-1.6,tkFace(3,-1.6));FURNISH('scyvoi_trade_bin',-2.0,0,-2.6,tkFace(-2,-2.6));FURNISH('scyvoi_trade_display',2.0,0,2.6,PI,{v:0});
  FURNISH('scyvoi_saddle_rack',-2.0,0,3.4,PI,{setting:'both'});
  door(0,0,r,0,4.0);}});

defBuilding({key:'tent-hidemaker',name:"Hidemaker's tent",seed:4804,cut:true,w:13,d:11,h:3.9,budget:90000,
 tags:{types:['industry','shop'],wealth:'middle',style:'awning',job:'tanning'},
 note:"the tanner's: a cream felt awning on red poles with an appliqué edge and a fringe in five colours over the beam and the vats; frames of stretched hides, a drying line and a smoking frame outside",
 build(o){const w=7,d=5;const H=tkPeaked({w,d,eaveH:2.3,peaks:[[0,-.4,3.4]],cover:'felt',col:P('feltW'),walls:false,guys:3,poles:'lacq',poleCol:null});
  for(const [x,z] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2],[0,d/2],[0,-d/2],[-w/2,0],[w/2,0]])pole('lacq',[x,0,z],[x,H(x,z)-.03,z],.065,null,8);
  {const pts=[[-w/2,H(-w/2,d/2),d/2+.02],[w/2,H(w/2,d/2),d/2+.02]];tsFringe(pts,.3,[P('madder'),P('teal'),P('saffron'),P('indigo')]);
   psurf('patFelt',(u,v)=>{const x=-w/2+u*w;return [x,H(x,d/2)+.02-v*.02,d/2-v*.45];},8,1,null);}
  psurf('felt',(u,v)=>{const x=-w/2+u*w;return [x,H(x,-d/2)*(1-v)+.05*v,-d/2-.05-.1*v];},10,3,P('feltB'),{colf:(u,v)=>{const k=.75+.4*ttHash(Math.floor(u*7),Math.floor(v*2));return new THREE.Color(k,k*.95,k*.9);}});
  tkFloor('earth',P('earth'),0,w-.2,d-.2);
  FURNISH('scyvoi_fleshing_beam',-1.6,0,.2,PI/2);FURNISH('scyvoi_tanning_vat',.6,0,-1.4,0);FURNISH('scyvoi_tanning_vat',2.0,0,-1.3,.6,{v:1});
  FURNISH('scyvoi_hide_frame',-2.2,0,-1.9,0);FURNISH('scyvoi_hide_frame',.0,0,-2.0,0,{v:1});FURNISH('scyvoi_hide_stack',2.6,0,.9,-PI/2);
  FURNISH('scyvoi_common_workbench',2.9,0,-.5,-PI/2);FURNISH('scyvoi_water_skins',-3.0,0,1.6,PI/2,{setting:'both'});
  FURNISH('scyvoi_drying_line',-1.2,0,4.0,0,{setting:'outdoor'});FURNISH('scyvoi_smoking_frame',3.6,0,3.8,0,{setting:'outdoor'});smokeAt(3.6,2.3,3.8,{r:.4});
  FURNISH('scyvoi_hide_frame',-4.6,0,2.2,PI/2+.3,{setting:'outdoor'});}});

defBuilding({key:'tent-supply',name:'Supply tent',seed:4803,cut:true,w:13,d:13,h:6.4,budget:90000,
 tags:{types:['market','shop'],wealth:'middle',style:'bell',job:'trading'},
 note:"the band's store in a great bell tent of madder and cream gores, its front panels laced back on poles as an awning; counters, bales, fire-fruit, felts and saddlery",
 build(o){const r=4.2;tkBell({r,wallH:1.9,peakH:5.6,cover:'canvas',col:P('madder'),col2:P('cream'),val:P('teal'),floor:'earth',floorCol:P('earth'),pennant:P('saffron'),doorW:3.0,guys:12});
  // the front panels laced back as an awning on two red poles
  psurf('canvas',(u,v)=>{const x=-1.6+u*3.2;return [x,2.1+(1-v)*.15,r+v*1.8];},6,3,P('madder'));for(const x of [-1.6,1.6]){pole('lacq',[x,0,r+1.8],[x,2.12,r+1.8],.05,null,7);tkGuy([x,2.1,r+1.8],x*1.4,r+3.0);}
  for(const x of [-1.4,1.4])FURNISH('scyvoi_common_counter',x,0,2.7,0,{v:x>0?1:0});
  FURNISH('scyvoi_trade_display',-3.0,0,-.6,PI/2,{v:1});FURNISH('scyvoi_trade_display',3.0,0,-.6,-PI/2);
  FURNISH('scyvoi_supply_bales',-2.2,0,-2.6,.3);FURNISH('scyvoi_supply_bales',-.8,0,-3.3,0);FURNISH('scyvoi_trade_barrel',.8,0,-3.3,0);
  FURNISH('scyvoi_fruit_baskets',2.2,0,-2.6,-.3);FURNISH('scyvoi_common_store',0,0,-.8,0);
  FURNISH('scyvoi_saddle_rack',-2.6,0,1.4,PI/2);FURNISH('scyvoi_painted_chest',2.6,0,1.4,-PI/2);
  FURNISH_HANG('scyvoi_hanging_lantern',0,4.2,0,0);
  FURNISH('scyvoi_fruit_baskets',-1.4,0,5.6,0,{setting:'outdoor'});FURNISH('scyvoi_supply_bales',1.6,0,5.6,.3,{setting:'outdoor'});}});

defBuilding({key:'tent-cartwright',name:"Cartwright's tent",seed:4805,cut:true,w:14,d:12,h:5.2,budget:110000,
 tags:{types:['industry','shop'],wealth:'middle',style:'ger',job:'carpentry'},
 note:"the cartwright's: an open lattice frame under a felt roof like the smith's, and an awning beside it over the cart beds; the wheel jig, spokes seasoning, finished wheels in red and teal, the tyre fire outside",
 build(o){const r=4.0;W(-1.6,0,-.4,0,()=>{ttOpenGer(r,1.9,4.3,1.25);tkFloor('earth',P('earth'),r-.05);
   FURNISH('scyvoi_wheel_jig',0,0,-.4,0);FURNISH('scyvoi_spoke_rack',-2.6,0,-1.8,tkFace(-2.6,-1.8));FURNISH('scyvoi_wheel_stack',.2,0,-3.1,0,{v:1});
   FURNISH('scyvoi_shaving_horse',-2.4,0,.9,PI/2);FURNISH('scyvoi_axle_bench',2.2,0,-1.9,tkFace(2.2,-1.9));FURNISH('scyvoi_common_workbench',-1.0,0,-3.0,0);
   FURNISH_HANG('scyvoi_hanging_lantern',0,3.6,-1.2,0);});
  // the awning over the cart beds, on red poles, its edge banded with the appliqué
  tkNoCut(()=>{const x0=2.6,x1=6.4,z0=-2.6,z1=2.6;psurf('felt',(u,v)=>{const x=lerp(x0,x1,u),z=lerp(z0,z1,v);return [x,2.7-u*.5+Math.sin(PI*v)*.12,z];},5,6,P('feltW'));
   for(const x of [x0,x1])for(const z of [z0,z1]){pole('lacq',[x,0,z],[x,2.7-(x===x1?.5:0),z],.06,null,7);tkGuy([x,2.6-(x===x1?.5:0),z],x+(x===x1?1.3:0),z*1.4);}
   tsFringe([[x0,2.68,z1+.02],[x1,2.18,z1+.02]],.28,[P('madder'),P('teal'),P('saffron')]);});
  FURNISH('scyvoi_cart_frame',4.5,0,0,PI/2,{setting:'both'});FURNISH('scyvoi_wheel_stack',4.6,0,-2.2,0,{setting:'both'});
  FURNISH('scyvoi_tyre_fire',2.8,0,4.4,0,{setting:'outdoor'});smokeAt(2.8,.5,4.4,{r:.35});
  door(-1.6,0,r-.4,0,4.0);}});
