// prefix: cy
// ================================================================= THE VALLEY'S WORKS (Ham-Hau, bronze-age farmers): PLAN.md section 3
// The village row's works stand at the tell's foot (KHAMLET.platform's records below: the threshing floor, the granary, the
// mill, the pen); the rest are the Valley's trades for the census (CY_TRADES, later), drawn here once for the sheet.
//   cy_granary     a stone pad with three beehive mud silos, their lids and a ladder, under a reed shade on posts
//   cy_threshing   a round floor of packed earth in a stone kerb, the grain heap, a threshing sledge, two winnowing screens
//   cy_mill        an open lean-to over a row of saddle querns on their mud kerbs, the meal bins behind
//   cy_pen         a mud-walled pen with a gate, a shade lean-to and a trough (goats; the ostrich pen is the herders', C4)
//   cy_court       a walled court with an ear-door gate (the platform row's court, when its kivas stand below)
//   cy_smithy      the bronze smith: a lean-to over the crucible furnace, goat-skin bellows, the moulds and the anvil stone
//   cy_kiln        the potter's updraught kiln: a domed chamber over its firebox, the stoking pit, pots drying on a bench
//   cy_dyehouse    the dyers' yard: vats of lichen purple, saffron drying on racks, cloth hung to dry
//   cy_press       the oil press: a beam on a post, its stone weight, the basin and the crushing stone
//   cy_loom_house  a room of upright looms (the weavers of the wool trade), entered by an ear door
const CY_WORK_TAGS=(job,type)=>({types:[type||'industry'],wealth:'poor',style:'valley',role:'works',job});
function cyPost(x,z,h,r){pole('timber',[x,0,z],[x,h,z],r==null?.08:r,P('timber'),7);}
function cyShade(x0,z0,x1,z1,h,o){o=o||{};const posts=o.posts||[[x0,z0],[x1,z0],[x0,z1],[x1,z1]];for(const p of posts)cyPost(p[0],p[1],h);
 svNoWalk(()=>{for(const z of [z0,z1])pole('timber',[x0-.2,h,z],[x1+.2,h,z],.07,P('timber'),6);
  box('reed',(x0+x1)/2,h+.06,(z0+z1)/2,x1-x0+.6,.05,z1-z0+.5,P('reed'));});}
defBuilding({key:'cy_granary',name:'Valley granary (beehive silos under a shade)',seed:9201,cls:'building',kind:'store',frag:'kits/coyote',
 tags:CY_WORK_TAGS('farming','farm'),w:6,d:4.5,h:3.4,budget:20000,front:{x:0,z:2.25,yaw:0},
 note:'three beehive silos of mud on a stone pad, filled from the top by a ladder, under a reed shade',
 build(o){box('stone',0,0,0,5.6,.3,3.6,P('stone'));
  for(let i=0;i<3;i++){const x=-1.8+i*1.8;svNoWalk(()=>{lathe('render',x,0,[[.75,.3],[.8,.9],[.7,1.7],[.45,2.3],[.2,2.55]],14,P('mudL'));cyl('wood',x,2.55,0,.24,.08,P('wood'),10);
   box('plain',x,.45,.78,.36,.3,.04,new THREE.Color(.1,.08,.06));});}
  cyShade(-2.8,-1.6,2.8,1.6,3.0);
  svStair(-1.8,1.9,.3,2.55,PI,{style:'ladder',w:.45,run:.6,mk:'timber',col:P('timber')});}});
defBuilding({key:'cy_threshing',name:'Threshing floor',seed:9202,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_WORK_TAGS('farming','farm'),w:12,d:12,h:1.6,budget:15000,front:{x:0,z:6,yaw:0},
 note:'a round floor of packed earth in a kerb of stones, the threshed grain heaped, a sledge and the winnowing screens',
 build(o){cyl('floor',0,0,0,5.6,.06,P('floor'),28);
  for(let i=0;i<28;i++){const a=i/28*TAU;box('stone',Math.cos(a)*5.75,0,Math.sin(a)*5.75,.5,.22+rr(0,.1),.35,P('stone'),-a);}
  svNoWalk(()=>{lathe('reed',1.6,-1.0,[[1.3,.06],[1.0,.5],[.5,.95],[0,1.15]],14,new THREE.Color(.8,.66,.36));
   lathe('reed',-2.2,1.4,[[.8,.06],[.55,.4],[0,.6]],12,new THREE.Color(.7,.56,.3));});
  W(-1.4,0,-1.8,.6,()=>{box('wood',0,.06,0,.9,.1,1.7,P('wood'));for(let i=0;i<5;i++)box('stone',-.3+(i%2)*.6,.16,-.6+i*.3,.08,.04,.08,P('stone'));});
  for(const s of [-1,1])W(s*3.2,0,3.1,s*.4,()=>{cyPost(-.6,0,1.5,.04);cyPost(.6,0,1.5,.04);box('reed',0,.3,0,1.2,1.1,.04,P('reed'));});}});
defBuilding({key:'cy_mill',name:'Valley mill (saddle querns under a lean-to)',seed:9203,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_WORK_TAGS('milling'),w:6,d:4.2,h:3,budget:20000,front:{x:0,z:2.1,yaw:0},
 note:'an open lean-to of mud brick over a row of saddle querns on their kerbs; the meal bins behind',
 build(o){const t=CY.WALL;cyWall(-2.8,-1.9,2.8,-1.9,0,2.6,{inner:1});cyWall(-2.8,-1.9,-2.8,1.9,0,2.2,{inner:-1});cyWall(2.8,1.9,2.8,-1.9,0,2.2,{inner:-1});
  svNoWalk(()=>{for(let i=0;i<5;i++){const x=-2.4+i*1.2;pole('timber',[x,2.75,-2.1],[x,2.15,2.1],.06,P('timber'),6);}
   W(0,2.45,0,0,()=>box('reed',0,0,0,6.0,.05,4.4,P('reed'),0,.15));});
  for(const p of [-2.5,2.5])cyPost(p,1.95,2.15,.07);
  for(let i=0;i<4;i++)cyQuern(-1.8+i*1.2,.1,0);
  for(let i=0;i<3;i++)cyBin(-1.5+i*1.5,-1.35,0,{w:.7,h:.6});}});
defBuilding({key:'cy_pen',name:'Goat pen (mud walls, a shade, a trough)',seed:9204,cls:'building',kind:'pen',frag:'kits/coyote',
 tags:CY_WORK_TAGS('herding','farm'),w:14,d:10,h:2.6,budget:20000,front:{x:0,z:5,yaw:0},
 note:'a pen of low mud-brick walls on a stone socle, its gate a pole bar in a gap, a reed shade in one corner and a trough',
 build(o){const x0=-6.8,x1=6.8,z0=-4.8,z1=4.8;
  cyRing(x0,z0,x1,z1,0,1.4,{t:.32,socle:.3,mk:'render',holes:{s:[{at:6.8,w:1.6,y:0,h:1.4}]}});
  for(const s of [-1,1])cyPost(s*.95,z1,1.7,.07);pole('timber',[-1.05,1.0,z1+.12],[1.05,1.0,z1+.12],.04,P('timber'),6);
  cyShade(x0+.5,z0+.5,x0+4.5,z0+3.5,2.2);
  box('stone',3.5,0,-3.8,2.4,.35,.6,P('stone'));box('plain',3.5,.36,-3.8,2.2,.01,.45,new THREE.Color(.3,.36,.38));
  door(0,0,z1,0,1.6,1.4);}});
defBuilding({key:'cy_court',name:'Walled court (ear-door gate)',seed:9205,cls:'building',kind:'court',frag:'kits/coyote',
 tags:{types:['civic'],wealth:'poor',style:'valley',role:'court'},w:20,d:14,h:3.4,budget:20000,
 note:'a walled court below a village: mud walls on a socle, its gate an ear door',
 build(o){const x0=-9.8,x1=9.8,z0=-6.8,z1=6.8;cyRing(x0,z0,x1,z1,0,2.2,{t:.36,holes:{s:cyEarHoles(9.8,1.2,CY.DOOR_H)}});
  box('floor',0,0,0,19.2,.04,13.2,P('floor'));cyEarDoor(0,z1,0,1.2,CY.DOOR_H,{t:.36,name:'the court gate'});}});
defBuilding({key:'cy_smithy',name:'Bronze smithy (crucible furnace and bellows)',seed:9206,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_WORK_TAGS('smithing'),w:6,d:5,h:3.2,budget:25000,front:{x:0,z:2.5,yaw:0},
 note:'a lean-to over a bowl furnace with its crucible, two goat-skin bellows and their clay pipes, stone moulds for axes and sickles, the anvil stone, a water jar',
 build(o){cyWall(-2.8,-2.3,2.8,-2.3,0,2.6,{inner:1});cyShade(-2.6,-1.9,2.6,1.9,2.6,{posts:[[-2.6,1.9],[2.6,1.9]]});
  svNoWalk(()=>{lathe('render',0,-.6,[[.75,0],[.8,.35],[.6,.5],[.45,.52]],14,P('mudD'));cyl('glow',0,.5,-.6,.32,.02,new THREE.Color(1,.45,.1),12);
   lathe('render',0,-.6,[[0,.5],[.16,.52],[.18,.72],[.15,.75]],10,P('ochre'));
   for(const s of [-1,1]){ellip('hide',s*1.3,.25,-.2,.35,.22,.45,P('hide'),s*.3,8);pole('render',[s*1.05,.25,-.35],[s*.55,.35,-.55],.05,P('ochre'),6);}
   for(let i=0;i<3;i++)box('slab',-1.6+i*.6,0,1.1,.45,.16,.3,P('stone'));box('slab',1.4,0,.9,.5,.45,.5,P('stone'));});
  cyJar(2.0,-1.6,{h:.8});smokeAt(0,1,-.6,{r:.3,kind:'fire'});}});
defBuilding({key:'cy_kiln',name:'Potter kiln (updraught)',seed:9207,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_WORK_TAGS('pottery'),w:6,d:5,h:3,budget:20000,front:{x:0,z:2.5,yaw:0},
 note:'an updraught kiln: a domed chamber of mud over its firebox, the stoking mouth in a pit, a bench of pots drying',
 build(o){svNoWalk(()=>{lathe('render',0,-.4,[[1.25,0],[1.3,.8],[1.1,1.6],[.7,2.2],[.35,2.4]],16,P('mudD'));
   box('plain',0,.25,.85,.5,.4,.06,new THREE.Color(.08,.06,.05));sph('glow',0,.4,.75,.12,new THREE.Color(1,.42,.12),.6,6);});
  cyPlatform(-2.6,1.2,-.4,1.8,.45);for(let i=0;i<4;i++)cyJar(-2.35+i*.55,1.5,{y:.45,h:.4,r:.15});
  smokeAt(0,2.5,-.4,{r:.3,kind:'fire'});}});
defBuilding({key:'cy_dyehouse',name:'Dye yard (purple vats and saffron racks)',seed:9208,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_WORK_TAGS('dyeing'),w:7,d:5,h:2.6,budget:20000,front:{x:0,z:2.5,yaw:0},
 note:'the dyers\' yard: lined vats of lichen purple, saffron stigmas drying on reed racks, dyed wool hung on poles',
 build(o){for(let i=0;i<3;i++){const x=-2.2+i*1.5;svNoWalk(()=>lathe('render',x,-1.2,[[.5,0],[.55,.7],[.5,.75]],12,P('mudL')));
   cyl('plain',x,.66,-1.2,.46,.02,new THREE.Color(.36,.1,.3),12);}
  for(const z of [.4,1.3]){cyPost(-3,z,1.1,.04);cyPost(-.4,z,1.1,.04);box('reed',-1.7,1.05,z,2.6,.04,.7,P('reed'));
   for(let i=0;i<6;i++)box('plain',-2.6+i*.36,1.09,z,.2,.012,.5,new THREE.Color(.82,.36,.06));}
  cyPost(1.2,.2,2.1,.05);cyPost(3.2,.2,2.1,.05);pole('timber',[1.1,2.05,.2],[3.3,2.05,.2],.04,P('timber'),6);
  [[new THREE.Color(.42,.12,.34),1.6],[new THREE.Color(.8,.6,.12),2.3],[new THREE.Color(.5,.3,.18),2.9]].forEach(c=>box('plain',c[1],.9,.2,.5,1.12,.02,c[0]));}});
defBuilding({key:'cy_press',name:'Oil press (beam and weight)',seed:9209,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_WORK_TAGS('oil'),w:7,d:4,h:2.6,budget:15000,front:{x:0,z:2,yaw:0},
 note:'a beam press: the beam pivoted in a post at one end, the stone weight hung at the other, the basket stack on the pressing stone over its basin; the crushing stone beside it',
 build(o){cyPost(-3,0,2.2,.12);pole('timber',[-3,1.4,0],[2.8,1.0,0],.11,P('timber'),8);
  box('slab',-.4,0,0,1.4,.35,1.4,P('stone'));cyl('reed',-.4,.35,0,.45,.45,P('reed'),12);cyl('stone',-.4,.12,.95,.3,.25,P('stone'),12);
  pole('rope',[2.5,1.02,0],[2.5,.55,0],.02,P('rope'),5);sph('slab',2.5,.4,0,.32,P('stone'),.8,10);
  cyl('slab',1.6,0,-1.4,.7,.35,P('stone'),16);box('slab',1.6,.35,-1.4,.25,.55,1.2,P('stone'));}});
defBuilding({key:'cy_loom_house',name:'Weavers house (upright looms)',seed:9210,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_WORK_TAGS('weaving'),w:7.4,d:5.6,h:3.1,budget:30000,cut:true,
 note:'a room of upright warp-weighted looms, the wool trade\'s, entered by an ear door; its roof flat, reached by its own ladder',
 build(o){const t=CY.WALL,IW=6.4,ID=4.4,x0=-IW/2-t/2,x1=IW/2+t/2,z0=-ID/2-t/2,z1=ID/2+t/2;
  cyRing(x0,z0,x1,z1,0,CY_ROOM.H,{holes:{s:cyEarHoles(IW/2+t/2,.95,CY.DOOR_H)}});box('floor',0,0,0,IW,.06,ID,P('floor'));
  cyEarDoor(0,z1,0,.95,CY.DOOR_H,{name:'the weavers door'});
  [[-1.9,new THREE.Color(.42,.12,.34)],[0,new THREE.Color(.82,.6,.16)],[1.9,new THREE.Color(.6,.56,.5)]].forEach(q=>cyLoom(q[0],-ID/2+.25,0,{col:q[1]}));
  for(let i=0;i<3;i++)cyJar(-2.6+i*.5,1.6,{h:.5,r:.18});
  const top=cyRoof(x0-t/2,z0-t/2,x1+t/2,z1+t/2,CY_ROOM.H,{});cyTarget(0,.06,0,'floor');}});
