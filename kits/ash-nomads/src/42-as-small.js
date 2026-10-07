// prefix: as
// ================================================================= SMALL TENTS: five for a rider's or a herder's household
// Each is a def (36-def.js): the shape from 40a-ak-ash.js (and the tent kit), the inside from the catalog's Ash Nomad pieces
// (41-tk-dress.js). Tags: culture ashnomad, types dwelling-single, wealth middle (the lean-to poor).
defBuilding({key:'tent-spire-small',name:'Spire tent',seed:4201,cut:true,w:7.4,d:7.4,h:6.4,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'spire'},
 note:'a black tent drawn up to a tall concave spire on one mast: a band of frets and Nazca birds round the wall, sawtooth bands up the roof, a bone and gold finial',
 build(o){const R=2.5,rY=akConcave({R,wallH:1.5,peakH:5.6,k:2.3,doorW:1.0});
  FURNISH('ashnomad_rug',0,.03,.1,0);FURNISH('ashnomad_fire_pit',0,0,.2,0);smokeAt(0,5.4,.2,{r:.2,kind:'flue'});
  tkHonour(R);for(const s of [-1,1]){const p=tkAt(R-.5,TK_DOOR+s*1.6);FURNISH('ashnomad_sleeping_mat',p[0],0,p[1],tkFace(p[0],p[1]),{v:s>0?1:0});}
  tkTea(-1.1,1.0,tkFace(-1.1,1.0));FURNISH('ashnomad_carapace_stool',1.2,0,1.0,0);
  FURNISH_HANG('ashnomad_hanging_lantern',.8,rY(.8)-.9,-.6,0);
  tkScreens(0,R+1.0,0,.95);}});

defBuilding({key:'tent-dome',name:'Hide dome',seed:4202,cut:true,w:6.8,d:6.8,h:3.4,budget:50000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'dome'},
 note:'the Ashlander dome: grey hides lashed over bent ribs, smoke-black at the crown, a band of frets low on the wall, a chitin door frame',
 build(o){const r=2.7;akDome({r,h:2.9,doorW:.95,col:P('hide')});
  FURNISH('ashnomad_fire_pit',0,0,0,0);smokeAt(0,2.9,0,{r:.25});
  tkRingSeats(r-.5,['ashnomad_floor_cushion','ashnomad_floor_cushion','ashnomad_bolster'],{step:1.15,gap:.7});
  FURNISH('ashnomad_chitin_chest',0,0,-r+.5,0);FURNISH('ashnomad_grub_jars',1.5,0,-1.6,tkFace(1.5,-1.6));FURNISH('ashnomad_water_gourds',-1.6,0,-1.5,tkFace(-1.6,-1.5));
  FURNISH_HANG('ashnomad_herb_bundles',-.8,2.4,.6,0);FURNISH('ashnomad_chitin_lamp',1.3,0,1.2,0);}});

defBuilding({key:'tent-ridge',name:'Ridge tent',seed:4203,cut:true,w:6.6,d:7.6,h:3.0,budget:50000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'ridge'},
 note:'a charcoal ridge tent, its slopes sagging between the poles: sawtooth bands at the hem, a yellow line along each slope, spires at the gables',
 build(o){let H=null;W(0,0,0,PI/2,()=>{H=akRidge({w:4.6,d:3.4,ridge:2.4,eave:.55,open:-1});});   /* the ridge runs front to back, the front gable open */
  tkFloor('rug',P('redD'),0,3.2,4.4);
  FURNISH('ashnomad_sleeping_mat',-.95,0,-.9,PI/2);FURNISH('ashnomad_sleeping_mat',.95,0,-.9,-PI/2,{v:1});
  FURNISH('ashnomad_chitin_chest',0,0,-1.85,0);tkTea(0,.6,PI);
  FURNISH('ashnomad_spear_rack',-2.8,0,1.6,PI/2,{setting:'outdoor'});FURNISH('ashnomad_beetle_saddle_rack',2.8,0,1.7,-PI/2,{setting:'outdoor'});
  FURNISH_HANG('ashnomad_hanging_lantern',0,2.3,0,0);
  door(0,0,2.3,0,1.6);}});

defBuilding({key:'tent-bell-spire',name:'Petal bell tent',seed:4204,cut:true,w:8.2,d:8.2,h:5.4,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'bell'},
 note:'a grey bell tent with a scalloped, petal-cut skirt over a black wall and a short concave spire: Nazca beetles in the wall band, red petals edged in yellow',
 build(o){const R=2.6,rY=akConcave({R,wallH:1.3,peakH:4.6,k:1.5,doorW:1.1,figs:['beetle','fret','spiral','fret'],bands:[[.0,.08,'line'],[.55,.62,'saw']]});
  // the petals: six scalloped flaps hanging over the eave, red edged with yellow
  for(let i=0;i<8;i++){const a=(i+.5)/8*TAU;if(tkNearDoor(a,.3))continue;W(Math.cos(a)*(R+.32),0,Math.sin(a)*(R+.32),Math.atan2(Math.cos(a),Math.sin(a)),()=>{
   const pts=[];for(let k=0;k<=10;k++){const t=k/10,an=PI*t;pts.push([-Math.cos(an)*.85,rY(R+.3)-.02-Math.sin(an)*.55]);}
   poly('flag',[[-.85,rY(R+.3),0]].concat(pts.map(q=>[q[0],q[1],0])).concat([[.85,rY(R+.3),0]]),P('red'),true);
   cord('plain',pts.map(q=>[q[0],q[1],.012]),.025,akC(AK_Y));});}
  FURNISH('ashnomad_rug',0,.03,0,0,{v:1});tkRingSeats(R-.42,['ashnomad_floor_cushion','ashnomad_bolster'],{step:1.0,gap:.75});
  FURNISH('ashnomad_carapace_table',0,0,.4,0);FURNISH('ashnomad_brew_set',0,svfH('ashnomad_carapace_table',0,.4),.4,0);
  FURNISH('ashnomad_chitin_chest',0,0,-1.8,0,{v:1});FURNISH('ashnomad_chitin_lamp',-1,0,-1.2,0);FURNISH_HANG('ashnomad_hanging_lantern',.9,rY(.9)-.7,-1.0,0);}});

defBuilding({key:'tent-lean-to',name:'Ash-screen lean-to',seed:4205,cut:true,w:6.4,d:5.6,h:2.6,budget:40000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'lean-to'},
 note:"a herder's lean-to: a charcoal cloth sloped from two forked poles to the ground, its back to the ash wind, ash screens at the ends",
 build(o){const L=4.2,D=2.4,sc=new THREE.Color();
  psurf('ashCloth',(u,v)=>{const x=-L/2+u*L,z=-D/2+v*D;return [x,.15+v*2.05-Math.sin(PI*u)*.08*v,z];},12,6,WHITE,{colf:(u,v)=>akRoofColf([[.86,.97,'saw']],14)(u,1-v)});
  for(const x of [-L/2,L/2]){pole('wood',[x,0,D/2],[x,2.3,D/2],.05,P('woodD'),6);for(const s of [-1,1])pole('wood',[x,2.15,D/2],[x+s*.12,2.4,D/2],.025,P('woodD'),5);tkGuy([x,2.25,D/2],x*1.3,D/2+1.3);}
  beam('wood',[-L/2-.1,2.22,D/2],[L/2+.1,2.22,D/2],.05,P('woodD'),true,6);
  W(0,0,D/2,0,()=>akBand(L,1.88,.32,{z:.02,bg:false}));
  for(const s of [-1,1])FURNISH('ashnomad_ash_screen',s*(L/2+.25),0,0,s<0?PI/2:-PI/2,{v:s>0?1:0});
  tkFloor('rug',P('ashG'),0,L-.2,D-.2);
  FURNISH('ashnomad_sleeping_mat',-.8,0,-.6,0);FURNISH('ashnomad_saddle_bags',1.2,0,-.6,0);
  FURNISH('ashnomad_fire_pit',0,0,2.3,0,{setting:'outdoor'});smokeAt(0,.6,2.3,{r:.25});FURNISH('ashnomad_water_gourds',1.6,0,1.9,0,{setting:'outdoor'});
  door(0,0,D/2,0,L*.8);}});
