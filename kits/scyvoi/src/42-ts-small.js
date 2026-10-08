// prefix: ts
// ================================================================= SMALL TENTS: five for a hunter's or a warrior's household
// (2026-10-07: the peaked khaima and the hide wedge went to kits/desert-nomads; the white appliqué tent and the gur replace them.)
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

/* ---- (2026-10-07) the peaked khaima and the hide wedge went to the Desert Nomads kit; in their place, two Tibetan tents */
/* a string of prayer-flag pennants from a to b (each a small square, the five colours in turn) */
const TS_FLAGS=[0x2a62d0,0xf0ece0,0xb4302a,0x2a8a52,0xe0b02a];
function tsFlags(a,b,n,sag){sagRope('rope',a,b,sag||.3,.008,0xd8ccb0,12);for(let i=1;i<n;i++){const t=i/n,x=lerp(a[0],b[0],t),z=lerp(a[2],b[2],t),y=lerp(a[1],b[1],t)-(sag||.3)*4*t*(1-t);
 withCloth(clothHang(.22,.05),()=>psurf('flag',(u,v)=>[x+(u-.5)*.2,y-.02-v*.22,z],1,1,TS_FLAGS[i%5]));}}
/* a band of a pattern sheet round the back and side walls of a tkPeaked tent (w x d), from y0 to y1, standing off the
   splayed wall (tkPeaked's walls lean out 12 cm at the foot) */
function tsWallBand(w,d,H,mk,y0,y1){const w2=w/2,d2=d/2;for(const [a,b] of [[[-w2,d2],[-w2,-d2]],[[-w2,-d2],[w2,-d2]],[[w2,-d2],[w2,d2]]]){
 psurf(mk,(u,v)=>{const x=lerp(a[0],b[0],u),z=lerp(a[1],b[1],u),y=lerp(y0,y1,v),hgt=Math.min(H(x,z),H(lerp(a[0],b[0],.5),lerp(a[1],b[1],.5))),o=.13*(1-y/Math.max(.1,hgt))+.015;
  return [x+(Math.abs(x)>=w2-.01?Math.sign(x)*o:0),y,z+(Math.abs(z)>=d2-.01?Math.sign(z)*o:0)];},Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])*2),1,null);}}
/* a fringe in turns of colour along a polyline (the Tibetan tents' polychrome valance) */
function tsFringe(pts,drop,cols){for(let i=0;i<pts.length-1;i++)tkValance([pts[i],pts[i+1]],drop,'flag',cols[i%cols.length],{per:2.2});}
defBuilding({key:'tent-tibet-small',name:'White appliqué tent',seed:4204,cut:true,w:7.8,d:7.8,h:3.8,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'tibetan'},
 note:'a small square tent of white cotton under a low hipped roof sewn with the blue appliqué, a dark hem, a fringe in five colours, prayer flags to its stakes',
 build(o){const w=4.6,d=4.6;const H=tkPeaked({w,d,eaveH:1.55,peaks:[[0,0,3.2]],cover:'patApp',col:null,wallKey:'canvas',wallCol:P('cream'),open:{x0:-.8,x1:.8,h:2.0},floor:'patKilim',guys:2});
  // the dark blue hem round the walls and the fringe under the eave, in turns of red, green, blue and saffron
  for(const [a,b] of [[[-w/2,-d/2],[w/2,-d/2]],[[w/2,-d/2],[w/2,d/2]],[[-w/2,d/2],[-w/2,-d/2]]]){const L=Math.hypot(b[0]-a[0],b[1]-a[1]);
   psurf('felt',(u,v)=>{const x=lerp(a[0],b[0],u),z=lerp(a[1],b[1],u),o2=.13;return [x+Math.sign(x)*(Math.abs(x)>=w/2-.01?o2:0),.02+v*.32,z+Math.sign(z)*(Math.abs(z)>=d/2-.01?o2:0)];},Math.round(L*2),1,P('indigo'));}
  {const pts=[];for(const [x,z] of [[-w/2,d/2],[-w/2,-d/2],[w/2,-d/2],[w/2,d/2]])pts.push([x*1.01,H(x,z)+.01,z*1.01]);pts.push(pts[0]);tsFringe(pts,.24,[P('madder'),P('teal'),P('indigo'),P('saffron')]);}
  sph('brass',0,3.35,0,.1,0xc8963a);
  tsFlags([0,3.3,0],[-3.6,.2,-3.4],9);tsFlags([0,3.3,0],[3.6,.2,-3.4],9);
  FURNISH('scyvoi_felt_rug_round',0,.03,-.1,0,{v:1});
  tkRowSeats(-1.6,-1.85,1.6,-1.85,['scyvoi_toshak'],2.0,undefined,0);
  for(const s of [-1,1])FURNISH('scyvoi_floor_cushion',s*1.8,0,.3,s<0?PI/2:-PI/2,{v:s>0?1:2});
  tkTea(0,.6,PI);FURNISH('scyvoi_painted_chest',1.6,0,-1.0,-PI/2);FURNISH('scyvoi_floor_lantern',-1.5,0,-1.0,0);
  FURNISH_HANG('scyvoi_hanging_lantern',0,H(0,0)-.4,0,0);}});

/* the gur: a white ridge tent, its slopes sewn with medallions in the five colours, a blue border; a hunter's or a herder's */
function tsGurH(x,z){const d2=1.6,ridge=2.5,eave=.5;return eave+(ridge-eave)*(1-Math.abs(z)/d2)+.06*Math.sin(PI*(1-Math.abs(z)/d2));}
defBuilding({key:'tent-gur',name:'White ridge tent',seed:4205,cut:true,w:7.0,d:6.8,h:3.0,budget:50000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'tibetan'},
 note:"a herder's white ridge tent (gur): appliqué medallions in five colours on its slopes, a blue border, a felt-lined door, the salamander tack outside",
 build(o){W(0,0,0,-PI/2,()=>{const L=4.4,d2=1.6;   /* drawn with the ridge along x, turned so the door gable faces +z */
  psurf('canvas',(u,v)=>{const x=-L/2+u*L,z=-d2-.1+v*(2*d2+.2);return [x,tsGurH(x,z),z];},12,8,P('cream'));
  for(const s of [-1,1])poly('canvas',[[s*L/2,0,-d2-.1],[s*L/2,0,d2+.1],[s*L/2,tsGurH(0,0),0]],P('cream'),true);
  // the blue border along both eaves and up the gables, a medallion on each slope
  for(const s of [-1,1]){const z=s*(d2+.05);psurf('felt',(u,v)=>{const x=-L/2+u*L,zz=z-s*v*.28;return [x,tsGurH(x,zz)+.02,zz];},8,1,P('indigo'));
   W(0,0,0,0,()=>{const zc=s*d2*.48,y=tsGurH(0,zc)+.03,tilt=Math.atan2(2.0,d2)*s;WX(0,y,zc,0,tilt,0,()=>medallion('medStar',0,0,0,1.1,{round:true}));
    for(const x of [-1.5,1.5])WX(x,tsGurH(x,zc)+.03,zc,0,tilt,0,()=>medallion('medCloud',0,0,0,.7,{round:true}));});}
  pole('lacq',[-L/2-.05,0,0],[-L/2-.05,2.7,0],.05,null,6);pole('lacq',[L/2+.05,0,0],[L/2+.05,2.7,0],.05,null,6);
  beam('lacq',[-L/2-.2,2.58,0],[L/2+.2,2.58,0],.06,null,true,6);for(const x of [-L/2-.05,L/2+.05])sph('brass',x,2.75,0,.07,0xc8963a);
  for(const x of [-1.6,0,1.6])for(const s of [-1,1])tkGuy([x,.5,s*(d2+.12)],x*1.1,s*(d2+1.3));
  tsFlags([-L/2-.05,2.7,0],[-L/2-2.6,.2,0],7,.2);
  tkFloor('rug',P('madder'),0,L-.2,2*d2-.2);
  FURNISH('scyvoi_toshak',0,0,-1.0,0,{v:1});FURNISH('scyvoi_floor_cushion',-1.4,0,.3,PI/2);FURNISH('scyvoi_painted_chest',1.5,0,-.5,-PI/2);
  FURNISH('scyvoi_felt_rug_round',0,.03,.3,0);FURNISH_HANG('scyvoi_hanging_lantern',0,2.4,0,0);
  FURNISH('scyvoi_lance_stand',-2.9,0,1.7,PI/2,{setting:'outdoor'});FURNISH('scyvoi_saddle_rack',2.9,0,1.8,-PI/2,{setting:'outdoor'});
  FURNISH('scyvoi_water_skins',1.8,0,2.6,0,{setting:'outdoor'});
  door(L/2,0,0,PI/2,.9);});}});
