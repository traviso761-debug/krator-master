// prefix: ie
// ================================================================= KAUTOA: the camp shelters (core/camp; settlements/isle-demo 47f)
// The owner (2026-11-09): "build a thatched lean-to/hut series of tents/shelters for the settlement kit". What a party
// of Islanders puts up in a day or a week where it means to stay a season: a farming camp founded from a town's refugee
// households (settlements/isle-demo 47f), a felling crew's camp, a band on the road. Poles cut on the spot, palm-mat
// walls, golden grass thatch laid thick on the weather side; nothing on piles, nothing carved. Six pieces: a lean-to
// (a family's first night), a round hut (a family's season), an A-frame (two families under one ridge), a long open
// shelter (four households, the mats hung on the weather side), the camp kitchen (the earth oven under its shed) and
// the camp store (the party's sacks on a platform under thatch). Frame: origin on the ground at the plot centre, +z the
// front. Every surface is a library set already (thatch, mat, bamboo, palm, wood, earth, stone).
/* a slab of thatch: a thick panel along local z, tilted about x (rx > 0 drops its +z end), its ragged eave a thinner
   second slab a little past the edge */
function ieThatchSlab(x,y,z,w,len,rx,th){th=th==null?.2:th;W(x,y,z,0,()=>{box('thatch',0,-th/2,0,w,th,len,P('thatchE'),0,rx,0);
 const c=Math.cos(rx),s=Math.sin(rx);box('thatch',0,-th/2-s*len*.5-.06,c*len*.5-.02,w+.2,th*.5,.5,P('thatchE'),0,rx,0);});}
/* a hearth: a ring of stones round embers, its smoke and its light */
function ieHearth(x,z,r){W(x,0,z,0,()=>{r=r||.5;for(let i=0;i<8;i++){const a=i/8*TAU;sph('stone',Math.cos(a)*r,0,Math.sin(a)*r,.13,P('stoneD'),.7,6);}
 sph('glow',0,.04,0,.16,0xff7a2a,.5,6);box('charcoal',0,0,0,.4,.1,.4,0x1e1612);haloAt(0,.3,0,0xff8844);smokeAt(0,.3,0,{r:.25});});}
/* a sleeping mat on the ground */
function ieMat(x,z,ry){box('mat',x,0,z,1.0,.04,2.0,P('bamboo'),ry);}

/* ---------------------------------------------------------------- the lean-to: a family's first shelter */
defBuilding({key:'ie-shelter-leanto',name:'Lean-to (Kautoa camp)',seed:6340,cut:false,w:6.4,d:5.6,h:3.4,budget:30000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'east',role:'shelter'},
 note:'a camp lean-to: two tall poles in front, two short behind, a single slab of grass thatch sloping back over them, a back wall of palm mats lashed to the poles, sleeping mats on the trodden earth and a hearth of stones before the open front',
 build(o){box('earth',0,0,0,5.6,.03,4.8,0xb89a70);
  for(const s of [-1,1]){pole('wood',[s*2.4,0,1.9],[s*2.4,2.6,1.9],.07,P('wood'),6);pole('wood',[s*2.4,0,-1.9],[s*2.4,1.1,-1.9],.07,P('wood'),6);}
  for(const z of [1.9,-1.9]){const top=z>0?2.6:1.1;beam('wood',[-2.5,top,z],[2.5,top,z],.05,P('woodD'),true,6);}
  ieThatchSlab(0,2.05,0,5.4,4.9,-Math.atan2(1.5,3.8),.2);
  W(0,0,-1.9,0,()=>{isWall(5.0,0,1.1,'mat',P('bamboo'),[],{t:.05});});
  ieMat(-1.2,-.6,.1);ieMat(0,-.5,0);ieMat(1.2,-.6,-.1);ieHearth(0,2.2,.5);door(0,0,2.0,0,4.8,2.6);}});

/* ---------------------------------------------------------------- the round hut: a family's season */
defBuilding({key:'ie-shelter-hut',name:'Round hut (Kautoa camp)',seed:6341,cut:false,w:6.6,d:6.6,h:4.4,budget:40000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'east',role:'shelter'},
 note:'a camp hut: a low round wall of split bamboo lashed to stakes, a tall cone of grass thatch over it, the eave low enough to touch, a doorway of hung mat facing the camp, a hearth before the door and a pole of fish drying beside it',
 build(o){box('earth',0,0,0,6,.03,6,0xb89a70);
  cyl('bamboo',0,0,0,2.3,1.5,P('bamboo'),14);for(let i=0;i<10;i++){const a=i/10*TAU;pole('wood',[Math.cos(a)*2.35,0,Math.sin(a)*2.35],[Math.cos(a)*2.35,1.65,Math.sin(a)*2.35],.05,P('wood'),5);}
  cone('thatch',0,1.45,0,3.0,2.7,P('thatchE'),14);cone('thatch',0,1.3,0,3.15,.4,P('thatchE'),14);pole('wood',[0,3.9,0],[0,4.3,0],.04,P('woodD'),5);
  box('wood',0,0,2.3,.9,1.45,.1,0x1a140e);quad('mat',0,.75,2.37,.86,1.4,P('bamboo'),0,0,0);door(0,0,2.4,0,.9,1.45);
  ieHearth(0,3.0,.45);isDryRack(2.6,2.2,PI/2,1.6,'fish');}});

/* ---------------------------------------------------------------- the A-frame: two families under one ridge */
defBuilding({key:'ie-shelter-aframe',name:'A-frame shelter (Kautoa camp)',seed:6342,cut:false,w:9.4,d:5.8,h:3.8,budget:40000,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'east',role:'shelter'},
 note:'a camp A-frame: a ridge pole on two pairs of crossed poles, two long slabs of grass thatch from the ridge to the ground, the ends hung with palm mats pulled aside by day, sleeping mats in two rows and a hearth at each end',
 build(o){box('earth',0,0,0,6.8,.03,5.2,0xb89a70);
  for(const s of [-1,1]){pole('wood',[s*3.0,0,2.5],[s*3.0,3.4,0],.07,P('wood'),6);pole('wood',[s*3.0,0,-2.5],[s*3.0,3.4,0],.07,P('wood'),6);}
  beam('wood',[-3.3,3.4,0],[3.3,3.4,0],.07,P('woodD'),true,6);
  const a=Math.atan2(3.3,2.5);ieThatchSlab(0,1.65,1.25,6.4,4.2,a,.2);ieThatchSlab(0,1.65,-1.25,6.4,4.2,-a,.2);
  for(const s of [-1,1])quad('mat',s*3.02,.9,0,1.6,1.8,P('bamboo'),PI/2,0,0);
  for(const x of [-2,-.7,.7,2]){ieMat(x,-.9,0);ieMat(x,.9,0);}
  ieHearth(4.0,0,.4);ieHearth(-4.0,0,.4);door(3.1,0,0,PI/2,2.2,3.0);}});

/* ---------------------------------------------------------------- the long shelter: four households */
defBuilding({key:'ie-shelter-long',name:'Long shelter (Kautoa camp)',seed:6343,cut:false,w:14.6,d:7.0,h:4.4,budget:60000,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'east',role:'shelter'},
 note:'a camp long shelter: two rows of posts under a ridge of grass thatch, open to the lee, palm mats hung along the weather side and the ends, four households\' mats and baskets along it, a hearth before each bay',
 build(o){box('earth',0,0,0,14,.03,6.4,0xb89a70);
  for(const x of isSpan(-6,6,5)){for(const s of [-1,1])pole('wood',[x,0,s*2.6],[x,2.4,s*2.6],.09,P('wood'),6);pole('wood',[x,0,0],[x,3.8,0],.08,P('wood'),6);}
  for(const s of [-1,1])beam('wood',[-6.2,2.4,s*2.6],[6.2,2.4,s*2.6],.07,P('woodD'),true,6);beam('wood',[-6.4,3.8,0],[6.4,3.8,0],.08,P('woodD'),true,6);
  const a=Math.atan2(1.4,3.2);ieThatchSlab(0,3.1,1.6,13.2,3.6,a,.22);ieThatchSlab(0,3.1,-1.6,13.2,3.6,-a,.22);
  W(0,0,-2.6,0,()=>{isWall(12.4,0,2.3,'mat',P('bamboo'),[],{t:.05});});
  for(const s of [-1,1])quad('mat',s*6.05,1.15,-.6,3.6,2.3,P('bamboo'),PI/2,0,0);
  for(const x of [-4.5,-1.5,1.5,4.5]){ieMat(x-.6,-1.2,0);ieMat(x+.6,-1.2,0);ieHearth(x,3.4,.45);FURNISH('generic_floor_basket',x,0,.9,0,{setting:'outdoor'});}
  door(0,0,2.7,0,12,2.4);}});

/* ---------------------------------------------------------------- the camp kitchen */
defBuilding({key:'ie-camp-kitchen',name:'Camp kitchen (Kautoa camp)',seed:6344,cut:false,w:9.0,d:7.0,h:3.8,budget:50000,
 tags:{types:['industry'],wealth:'poor',style:'east',role:'cook'},
 note:'the camp\'s kitchen: an earth oven of hot stones in a pit beside an open shed of grass thatch, a hearth and its pots under the shed, a rack of fish and taro leaves drying in the smoke, water jars and sacks of the town\'s food against the back mats',
 build(o){box('earth',0,0,0,8.4,.03,6.4,0xb89a70);
  W(-1.2,0,0,0,()=>{ieShed({w:5,d:4,postH:2.4,walls:{back:'mat'},roof:{skirtH:1.0,towerH:1.4,towerS:.4,topSx:.3,patch:0,finial:'none'}});
   ieHearth(-.6,.4,.5);isFurn([['generic_storage_jar',1.6,0,-1.2,0,{setting:'outdoor'}],['generic_storage_jar',2.0,0,-.6,.3,{setting:'outdoor'}],['generic_sack',-1.8,0,-1.4,.2,{setting:'outdoor'}],['generic_sack',-1.2,0,-1.5,-.3,{setting:'outdoor'}]]);});
  isUmu(2.9,1.4,.8);isDryRack(2.8,-1.8,0,2.4,'fish');door(0,0,2.6,0,5,2.4);}});

/* ---------------------------------------------------------------- the camp store */
defBuilding({key:'ie-camp-store',name:'Camp store (Kautoa camp)',seed:6345,cut:false,w:8.6,d:6.8,h:4.2,budget:50000,
 tags:{types:['industry'],wealth:'poor',style:'east',role:'warehouse'},
 note:'the camp\'s store: the party\'s sacks, crates and baskets stacked on a platform of poles a hand off the wet ground, a shed of grass thatch over them, palm mats hung on three sides against the rain, the carter\'s yoke and ropes on the posts',
 build(o){box('earth',0,0,0,8,.03,6.2,0xb89a70);
  ieShed({w:6,d:4.4,postH:2.8,walls:{back:'mat',left:'mat',right:'mat'},roof:{skirtH:1.1,towerH:1.5,towerS:.4,topSx:.3,patch:0,finial:'none'}});
  box('wood',0,0,0,5.6,.5,4.0,P('woodD'));for(const x of isSpan(-2.6,2.6,5))for(const s of [-1,1])box('wood',x,0,s*1.8,.14,.5,.14,P('wood'));
  W(0,.5,0,0,()=>{isCargo(-.6,0,0,6);isFurn([['generic_floor_basket',2.2,0,-1.2,0,{setting:'outdoor'}],['generic_floor_basket',2.2,0,-.2,.4,{setting:'outdoor'}],['generic_crate',2.0,0,1.0,.2,{setting:'outdoor'}]]);});
  door(0,0,2.3,0,6,2.8);}});
