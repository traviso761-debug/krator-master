// prefix: ts
// ================================================================= SMALL TENTS: five for a hunter's or a warrior's household
// Each is a def (36-def.js): the cover from the tent kit (40-tk-tentkit.js), the inside from the catalog (41-tk-dress.js).
// Tags: culture scyvoi, types dwelling-single, wealth middle (there is little class division: even a small tent is dressed).
defBuilding({key:'tent-hunter-ger',name:"Hunter's ger",seed:4201,cut:true,w:6.2,d:6.2,h:3.2,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'ger'},
 note:'a small felt ger: lattice wall, red roof poles, an appliqué band, a stove under the crown',
 build(o){const r=2.6;tkYurt({r,wallH:1.45,crownH:2.75,crownR:.42,doorW:.82,doorH:1.3,felt:P('feltW'),band:'patFelt',bandH:.42,floor:'felt',floorCol:P('feltG'),lining:'patFelt'});
  FURNISH('scyvoi_felt_rug_round',0,.03,.2,0);
  FURNISH('scyvoi_ger_stove',0,0,-.15,0);smokeAt(0,2.95,-.15,{r:.2,kind:'flue'});
  tkHonour(r);
  for(const s of [-1,1]){const p=tkAt(r-.5,TK_DOOR+s*1.55);FURNISH('scyvoi_toshak',p[0],0,p[1],tkFace(p[0],p[1]),{v:s>0?1:0});}
  tkTea(-1.05,1.0,tkFace(-1.05,1.0));
  FURNISH('scyvoi_pouf',1.1,0,1.05,0);
  FURNISH_HANG('scyvoi_hanging_lantern',.9,2.3,-.7,0);
  {const p=tkAt(r-.35,TK_DOOR-.55);FURNISH('scyvoi_tack_pegs',p[0],1.0,p[1],tkFace(p[0],p[1]));}}});

defBuilding({key:'tent-bell',name:'Bell tent',seed:4202,cut:true,w:8.2,d:8.2,h:4.1,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'bell'},
 note:'a saffron and cream bell tent on one red pole, a scalloped madder valance with gold tassels',
 build(o){const r=2.4;tkBell({r,wallH:1.25,peakH:3.6,cover:'canvas',col:P('canvasO'),col2:P('cream'),val:P('madder'),floor:'patKilim',pennant:P('madder')});
  tkRingSeats(r-.42,['scyvoi_floor_cushion','scyvoi_floor_cushion','scyvoi_bolster'],{step:.95,gap:.75});
  medallion('medStar',0,.03,0,2.0,{round:true});
  FURNISH('scyvoi_low_round_table',.0,0,.95,0);FURNISH('scyvoi_tea_set',0,svfH('scyvoi_low_round_table',0,.36),.95,0);
  FURNISH('scyvoi_painted_chest',0,0,-1.75,0,{v:1});
  FURNISH('scyvoi_floor_lantern',-.9,0,-1.2,0);FURNISH('scyvoi_floor_lantern',.95,0,-1.15,0,{v:1});}});

defBuilding({key:'tent-black-small',name:'Small goat-hair tent',seed:4203,cut:true,w:7.6,d:9.2,h:2.6,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'beit-shaar'},
 note:'a black goat-hair tent on two centre poles, the front raised and open, a hearth outside',
 build(o){const H=tkBlack({w:5.4,d:3.6,rows:[{z:-.15,n:2,h:2.15}],frontH:1.7,backH:.95,stripes:[2],valance:P('madder')});
  tkFloor('patKilim',null,0,5.1,3.3);
  tkRowSeats(-2.3,-1.35,2.3,-1.35,['scyvoi_toshak'],2.2,undefined,0);
  for(const x of [-2.25,2.25])FURNISH('scyvoi_bolster',x,0,0,x<0?PI/2:-PI/2);
  tkTea(.0,.35,PI);
  FURNISH('scyvoi_floor_cushion',-1.1,0,.6,PI,{v:2});FURNISH('scyvoi_floor_cushion',1.1,0,.6,PI,{v:1});
  FURNISH_HANG('scyvoi_hanging_lantern',0,H(0,0)-.05,0,0);
  FURNISH('scyvoi_fire_pit',0,0,3.3,0,{setting:'outdoor'});smokeAt(0,.6,3.3,{r:.3});
  for(const x of [-1.2,1.2])FURNISH('scyvoi_floor_cushion',x,0,3.3+(x<0?.9:.9),tkFace(x,4.2,0,3.3),{setting:'outdoor'});}});

defBuilding({key:'tent-khaima-small',name:'Peaked khaima',seed:4204,cut:true,w:7.6,d:8.2,h:3.5,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'khaima'},
 note:'a brown khaima on one tall pole, sewn bands round its pyramid, the front raised on two poles',
 build(o){const H=tkPeaked({w:4.4,d:4.4,eaveH:.75,peaks:[[0,-.1,3.3]],cover:'canvas',col:P('khaima'),open:{x0:-1.05,x1:1.05,h:1.85},floor:'rug',floorCol:P('crimson')});
  FURNISH('scyvoi_felt_rug_round',0,.03,-.1,0,{v:1});
  tkRowSeats(-1.7,-1.75,1.7,-1.75,['scyvoi_bolster','scyvoi_floor_cushion'],.85,undefined,0);
  for(const s of [-1,1])FURNISH('scyvoi_toshak',s*1.7,0,.1,s<0?PI/2:-PI/2,{v:s>0?1:0});
  tkTea(0,.55,PI);
  FURNISH('scyvoi_floor_lantern',-.55,0,-1.2,0);
  FURNISH_HANG('scyvoi_hanging_lantern',.0,H(0,.6)-.1,.6,0);}});

/* the hunter's wedge: a ridge of hide panels, a porch on two poles, trophies over the door */
function tsWedgeH(x,z){const d2=1.4,ridge=2.2,eave=.35;return eave+(ridge-eave)*(1-Math.abs(z)/d2);}
defBuilding({key:'tent-hide-wedge',name:"Hide wedge tent",seed:4205,cut:true,w:6.4,d:6.2,h:2.6,budget:50000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'wedge'},
 note:"a hunter's ridge tent of laced hides, a porch awning, antlers over the door, gear to hand",
 build(o){const L=4.2,d2=1.4,sc=new THREE.Color();const hc1=P('hide'),seam=(u,v)=>{const s=Math.floor(u*L/1.05),f=(u*L/1.05)%1,k=f<.05?.62:1-.12*(s%2)+.08*h3(s,Math.floor(v*4),3);return sc.setRGB(k,k,k);};
  // the ridge roof (rotated so the ridge runs along x) and the two gable ends
  psurf('hide',(u,v)=>{const x=-L/2+u*L,z=-d2-.1+v*(2*d2+.2);return [x,tsWedgeH(x,z),z];},12,8,hc1,{colf:seam});
  for(const s of [-1,1])poly('hide',[[s*L/2,0,-d2-.1],[s*L/2,0,d2+.1],[s*L/2,tsWedgeH(0,0),0]],hc1,true);
  pole('wood',[-L/2-.05,0,0],[-L/2-.05,2.3,0],.05,P('woodD'),6);pole('wood',[L/2+.05,0,0],[L/2+.05,2.3,0],.05,P('woodD'),6);
  beam('wood',[-L/2-.2,2.24,0],[L/2+.2,2.24,0],.07,P('woodD'),true,6);
  // the door end faces +z: a porch awning off the front slope, on two poles, the door a laced slit
  psurf('hide',(u,v)=>{const x=-1.2+u*2.4;return [x,1.3+(1-v)*.15,d2+.1+v*1.25];},4,2,P('hide'));
  for(const x of [-1.2,1.2]){pole('wood',[x,0,d2+1.35],[x,1.32,d2+1.35],.04,P('woodD'),6);tkGuy([x,1.3,d2+1.35],x*1.4,d2+2.4);}
  for(const x of [-1.9,-.6,.6,1.9]){tkGuy([x,.36,-d2-.12],x,-d2-1.1);}
  // antlers over the door
  for(const s of [-1,1]){const b=[s*.15,1.95,d2+.12];pole('bone',b,[s*.55,2.35,d2+.2],.03,0xd8ccb0,5);pole('bone',[s*.4,2.22,d2+.17],[s*.42,2.5,d2+.15],.022,0xd8ccb0,5);pole('bone',[s*.28,2.1,d2+.16],[s*.2,2.38,d2+.12],.02,0xd8ccb0,5);}
  tkFloor('rug',P('feltB'),0,L-.2,2*d2-.2);
  FURNISH('scyvoi_toshak',0,0,-.75,0,{v:1});FURNISH('scyvoi_floor_cushion',-1.4,0,.3,PI/2);
  FURNISH('scyvoi_painted_chest',1.5,0,-.6,-PI/2);
  FURNISH('scyvoi_lance_stand',-2.6,0,1.8,PI/2,{setting:'outdoor'});
  FURNISH('scyvoi_saddle_rack',2.55,0,1.9,-PI/2,{setting:'outdoor'});
  FURNISH('scyvoi_water_skins',1.6,0,2.35,0,{setting:'outdoor'});
  door(0,0,d2+.1,0,.9);}});
