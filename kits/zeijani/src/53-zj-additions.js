// prefix: za
// ================================================================= THE ADDITIONS (PLAN.md 13, P3c): the air-shaft head, the rolling
// stone door, the bat roost, the dovecote, the hot-spring bath, the light-well mirror, the ancestor niche, the signal station.
// The roost and the bath are carved (their plans and `route`: their interiors items); the stone door carves its own passage.

/* the air-shaft head (Derinkuyu's vents, hidden in the forest and the lava field): a kerb of rough blocks round a grated
   shaft, a little conical cap on four posts over it to keep the rain out; the air's breath (motes) */
defBuilding({key:'zj_vent',name:'Air-shaft head',seed:5301,cls:'infrastructure',tags:{types:['infrastructure'],wealth:'poor',style:'constructed',rock:'tuff'},w:3.4,d:3.4,h:2.6,front:{x:0,z:1.2},
 note:'the head of a ventilation shaft: a kerb round a grate, a cap on posts',
 build(o){const c=P('tuffDark'),wd=P('woodD');zfRingWall('ashlar',0,0,.7,1.1,0,.55,c);cyl('basaltPol',0,.02,0,.7,.01,P('soot'),16);
  for(let i=-2;i<=2;i++){box('iron',i*.26,.5,0,.04,.04,1.4,P('soot'));box('iron',0,.5,i*.26,1.4,.04,.04,P('soot'));}
  for(const [x,z] of [[-.9,-.9],[.9,-.9],[-.9,.9],[.9,.9]])cyl('log',x,.55,z,.06,1.2,wd,6);zfCone('thatch',0,1.7,0,1.45,.8,P('thatch'));
  smokeAt(0,.6,0,{r:.2,kind:'incense'});}});

/* the rolling stone door (Derinkuyu's millstones) between districts: a passage through a block of rock, the stone (a disc
   1.6 m across) rolled into its slot in the passage's side, a lever beam; the passage is walkable */
defBuilding({key:'zj_stonedoor',name:'Rolling stone door',seed:5302,cls:'infrastructure',originFront:true,
 tags:{types:['infrastructure'],wealth:'poor',style:'carved',rock:'tuff',finish:'hewn'},w:10,d:9,h:10.5,
 note:'a passage through the rock, the round stone door rolled into its side slot (closed on a schedule), its lever',
 build(o){zfRockBlock(-4.5,4.5,-8,0,6);cvDoor({id:'front',c:[0,0],y:0,r:1.8,h:2.6});cvDoor({id:'back',c:[0,-8],y:0,r:1.8,h:2.6});
  cvStair({id:'pass',a:[0,0,1.0],b:[0,0,-9.0],w:1.6,h:2.3,finish:'hewn'});
  cvStair({id:'slot',joins:['pass'],a:[-.5,0,-4],b:[-1.85,0,-4],w:1.9,h:1.85,floor:false,finish:'hewn'});const c=P('tuffDark');
  const m=TF(-1.25,.86,-4,0,0,PI/2);m.scale(new THREE.Vector3(.85,.36,.85));emit('tuffHewn',gcyl(22),m,c);
beam('log',[1.0,.2,-3.2],[.6,1.6,-4.6],.07,P('woodD'),true,6);
  for(const s of [-1,1])box('tuffHewn',s*.95,0,.1,.26,2.3,.3,P('white'));zfStepLintel('tuffHewn',0,2.3,.1,1.9,P('white'),{n:1,h:.26,d:.3});
  /* in a world whose tunnels meet the door (Dhelv: o.walls {front:[w,h], back:[w,h]}), masonry walls seal each tunnel's end
     round the passage, so the stone door's passage is the only way through */
  if(o.walls){const wall=(zc,W,H)=>{const c2=P('tuff');for(const s of [-1,1])box('ashlar',s*(W/2+.8)/2,0,zc,W/2-.8,H,.4,c2);box('ashlar',0,2.3,zc,1.6,H-2.3,.4,c2);
    box('tuffPol',0,0,zc,W,.18,.5,P('white'));};
   if(o.walls.front)wall(-.1,o.walls.front[0],o.walls.front[1]);if(o.walls.back)wall(-9.2,o.walls.back[0],o.walls.back[1]);}
  door(0,0,0,0,1.6);}});

/* the bat roost: a ragged cave mouth, guano baskets at its foot */
defBuilding({key:'zj_roost',name:'Bat roost',seed:5303,originFront:true,tags:{types:['farm'],wealth:'poor',style:'carved',rock:'tuff',finish:'raw'},w:14,d:14,h:7,
 note:'a cave mouth, a passage down a metre to a domed chamber where the guano is gathered for the alecap beds',
 build(o){const it=zjItem('zj_roost');cvFromItem(it,{finish:'raw'});zfFixtures(it);
  FURNISH('zeijani_alecap_basket',-1.8,0,1.2,.5,{setting:'outdoor'});FURNISH('zeijani_alecap_basket',2.0,0,1.4,-.3,{v:1,setting:'outdoor'});door(0,0,0,0,1.6);}});

/* the dovecote (Cappadocia's pigeon houses, at the hamlets): a square tuff tower, rows of holes on its four faces under painted
   bands, a small dome, a ladder to its door */
defBuilding({key:'zj_dovecote',name:'Dovecote',seed:5304,cut:true,tags:{types:['farm'],wealth:'poor',style:'constructed',rock:'tuff'},w:5,d:5,h:8,
 build(o){const c=P('tuff'),wt=P('white');box('ashlar',0,0,0,3.4,6.0,3.4,c);box('tuffPol',0,6.0,0,3.6,.14,3.6,wt);
  for(const ry of [0,PI/2,PI,-PI/2])W(0,0,0,ry,()=>{zfDovecote(0,3.0,1.71,4,4,{paint:'ochre'});box('plain',0,5.5,1.705,3.2,.12,.02,P('cinnabar'));});
  zfDrum('ashlar',0,6.14,0,1.3,.3,c,{seg:20});zfDome('plaster',0,6.44,0,1.3,1.0,P('plaster'),{seg:20,rows:6});
  box('plank',0,1.4,1.72,.7,1.0,.06,P('wood'));zcLadder(0,0,1.4,2.6,1.75,P('woodD'));door(0,1.4,1.7,0,.7);}});

/* the hot-spring bath: a doorway under a plastered hood, steam breathing from a vent over the bath hall */
defBuilding({key:'zj_bath',name:'Hot-spring bath',seed:5305,originFront:true,tags:{types:['civic'],wealth:'middle',style:'carved',rock:'tuff',finish:'plaster'},w:17,d:19,h:8.5,
 note:'the changing room behind the door; the domed bath hall behind it round its steaming pool (the Throne\'s heat)',
 build(o){const it=zjItem('zj_bath');cvFromItem(it,{finish:'plaster'});zfFixtures(it);
  zvFace(0,1.6,2.6,{mk:'tuffPol',n:2,lamps:true});box('plaster',0,3.3,.25,3.4,.5,.5,P('plaster'));box('plain',0,3.36,.51,3.2,.1,.02,P('turquoise'));
  smokeAt(0,1.0,-11.5,{r:.5,kind:'incense'});haloAt(0,1.4,-11.5,0xffd0a0,false);
  FURNISH('zeijani_stone_bench',-3.2,0,1.2,0,{setting:'outdoor'});FURNISH('zeijani_olla',3.2,0,1.0,0,{setting:'outdoor'});}});

/* the light-well mirror (drawn matte in the bronze's colour: the metal copper reads black without an environment map): a polished bronze disc 1.8 m across in a timber yoke on a stone post, turned by the hour to throw the
   well's daylight down a tunnel (a reflector record a world drives as a spot light) */
defBuilding({key:'zj_mirror',name:'Light-well mirror',seed:5306,cls:'infrastructure',tags:{types:['infrastructure'],wealth:'middle',style:'constructed',rock:'tuff'},w:3,d:2.4,h:3.8,front:{x:0,z:.6},
 note:'a bronze mirror in a yoke on a post at a well\'s rim; it throws daylight down a tunnel by the hour',
 build(o){const wd=P('woodD');cyl('ashlar',0,0,0,.5,.4,P('tuffDark'),12);cyl('ashlar',0,.4,0,.24,1.3,P('tuff'),10);
  for(const s of [-1,1])beam('log',[s*.2,1.7,0],[s*1.0,2.6,0],.07,wd,true,6);
  WX(0,2.6,0,0,-.45,0,()=>{const m=TF(0,0,0,0,PI/2,0);m.scale(new THREE.Vector3(.9,.06,.9));emit('plain',gcyl(28),m,P('ochre'));ring('log',0,0,.03,.92,.05,wd,0,PI/2,0,28);});
  for(const s of [-1,1])sph('copper',s*1.0,2.6,0,.07,P('copper'),1,8);}});

/* the ancestor niche: a slab of rock dressed with a stepped frame round a deep dark niche, the figures of the ancestors in it,
   offerings and lamps at its foot */
defBuilding({key:'zj_niche',name:'Ancestor niche',seed:5307,tags:{types:['religious'],wealth:'poor',style:'carved',rock:'tuff',finish:'hewn'},w:3.6,d:2,h:3.4,front:{x:0,z:.6},
 build(o){const c=P('tuffDark'),wt=P('white');box('tuffHewn',0,0,-.5,3.2,3.0,.8,c);
  box('basaltPol',0,.7,-.09,1.4,1.6,.02,P('soot'));for(const s of [-1,1])box('tuffPol',s*.85,.6,-.05,.3,1.9,.2,wt);zfStepLintel('tuffPol',0,2.3,-.05,1.4,wt,{n:2,h:.2,d:.22});
  box('tuffPol',0,.6,0,2.0,.1,.4,wt);box('plain',0,2.75,-.08,2.4,.08,.02,P('ochre'));
  FURNISH('zeijani_ancestor_figures',0,.7,-.25,0,{setting:'outdoor'});for(const s of [-1,1])FURNISH('zeijani_funerary_lamp',s*1.1,0,.4,0,{setting:'outdoor'});
  FURNISH('zeijani_olla',.5,0,.5,0,{setting:'outdoor'});}});

/* the signal station (horns and lamps down the braid): a stone platform up four steps, a great horn on a timber stand, a lamp
   in a cage on a post, a gong; a bench for the watcher */
defBuilding({key:'zj_signal',name:'Signal station',seed:5308,cls:'infrastructure',tags:{types:['infrastructure'],wealth:'poor',style:'constructed',rock:'tuff'},w:5,d:5,h:4.6,
 note:'a platform with a great horn on a stand and a caged signal lamp on a post: horns and lamps down the braid',
 build(o){const c=P('tuffDark'),wd=P('woodD'),Y=.68;box('ashlar',0,0,0,3.6,Y,3.6,c);box('tuffPol',0,Y,0,3.7,.06,3.7,P('white'));zfSteps('ashlar',0,Y,1.85,1.2,4,c,.17,.28);
  for(const s of [-1,1])beam('log',[-.6+s*.25,Y,-.6],[-.6,Y+1.4,-.6],.06,wd,true,6);
  WX(-.6,Y+1.45,-.6,.5,PI/2-.15,0,()=>{const m=TF(0,0,0);m.scale(new THREE.Vector3(.32,2.2,.32));emit('bone',gcone(14),m,P('bone'));});
  cyl('log',1.1,Y,-1.1,.07,2.6,wd,7);for(const s of [-1,1])for(const t of [-1,1])box('iron',1.1+s*.18,Y+2.6,-1.1+t*.18,.03,.5,.03,P('soot'));box('iron',1.1,Y+3.1,-1.1,.42,.04,.42,P('soot'));
  sph('glow',1.1,Y+2.86,-1.1,.15,P('flame'),1,8);haloAt(1.1,Y+2.86,-1.1,0xffb04a,true);
  FURNISH('zeijani_stone_bench',.6,Y,1.0,0,{setting:'outdoor'});door(0,0,2.7,0,1.2);}});
