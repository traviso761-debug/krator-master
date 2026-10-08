// prefix: dh
// ================================================================= DHELV: THE LAYOUT (kits/zeijani/PLAN.md section 12) [G data]
// The capital of the Zeijani as data: no THREE, no DOM. x east, z south, y up, metres; the hub's square is y 0 and the flank rises
// east toward the summit. P5's page builds from this; settlements/dhelv/tests/test-layout.js checks it (each check with a negative).
//
//   DH.groundY(x, z)    the ground the page draws: the PLATEAU over the city (the kipuka: old ground the young flows went round,
//                       its top at y 45, sheer 75 m walls; DH.PLAT, DH.plateauD the signed distance to its edge), the young
//                       lava's plain round it, and the APRON at its straight west face, the outpost's level ground
//   DH.surfaceY(x, z)   the same (the hall's throat and the wells open at it)
//   DH.HALL             the hub: a bottle-shaped hall (its square an ellipse), the light well its throat, a ledge round it
//   DH.PITS             the three satellites: open pits (centre, radius, floor y)
//   DH.DISTRICTS        id, kind, anchor node, wealth (the rule's, by graph distance from the square), what it must hold
//   DH.NODES, DH.EDGES  the public ways: tubes, the braid, ramps, stairs, the ledge, the square's lanes, streets, secret ways.
//                       An edge: {a, b, kind, w (width), zone ('outer' | 'inner' | 'secret'), door ('stonedoor': it closes)}
//   DH.SITES            every placed def: {key, district, x, z, ry, y, at ('floor' | 'wall' | 'ground')}; a 'wall' site's
//                       origin is the foot of its front on the pit's or the hall's wall, facing in
//   DH.FOOT             each key's declared footprint [w, d, origin ('front' | 'centre')], as the kit declares it
//   DH.RULES            the numbers the checks hold the layout to
const DH=(function(){
 'use strict';
 const PI=Math.PI,TAU=2*PI;
 const sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
 /* ---- the land (the owner, review 2: the city in a SHELF sticking out of the volcano's slope; the young lava laid as it would
    run). The FLANK rises east toward the summit (3.5%). Down it runs an old SPUR (the kipuka: older rock the young flows went
    round): a narrow RIDGE from upslope that ends in a broad SHELF, the city under it, its top tilted gently west, sheer on
    every side: its north, south and west walls (the flows banked against them) 40 m high at its upper end and 83 m at its tip,
    and at its back a sheer step up to the ridge's crest (45 m), which climbs on toward the summit with flows on either side.
    The young lava comes down the flank, parts at the ridge, runs down the troughs either side and spreads across the plain
    below the tip: the PAGE lays it with the Throne kit's own flow model (48-dhelv-flows.js: groundY there is this land plus
    the lava it lays). Here is the land alone (what the flows ran over). The APRON: the lee under the shelf's tip, which no
    flow reached: older soil, level, the outpost's clearing, pasture and stream. The shelf's west face is cut straight at
    x -680 where the outpost's portal and galleries stand; elsewhere its outline wanders */
 const FLANK={x0:-825,y0:-34,slope:.035};
 const PLAT={top:53,tilt:.0095,plain:-30,cliffX:-680,cliffZ:110,   /* top: at the tip (x -680), rising east by tilt; plain: the apron's level */
  poly:[[-680,-110],[-680,110],[-690,175],[-650,240],[-600,300],[-560,380],[-470,420],[-420,500],[-330,530],[-250,500],[-170,560],[-60,590],[40,560],[130,610],
   [250,620],[330,590],[420,640],[520,650],[590,600],[640,520],[700,440],[690,350],[730,260],[710,160],[740,60],[690,-30],[650,-110],[660,-190],[590,-260],
   [500,-300],[420,-370],[320,-380],[220,-420],[120,-390],[20,-430],[-80,-410],[-180,-440],[-280,-400],[-380,-390],[-450,-340],[-530,-330],[-590,-270],
   [-650,-230],[-700,-170],[-690,-140]]};
 /* the ridge behind the shelf: a band from its back wall (x 640 on the shelf's top) up the flank, its crest 45 m over the shelf there */
 const RIDGE={a:[640,90],b:[1750,150],w:72,top:111,tilt:.02};
 const APRON={c:[-825,20],r:260,floor:PLAT.plain,edge:.15};   /* the outpost's ground: an ellipse (its z squashed 1.3) cut by the west face */
 /* the outlines wander: each point but the west face's pushed out or in by a smooth noise along it */
 const wob=(x,z)=>9*Math.sin(x/83+z/97)+5*Math.sin(x/37-z/43)+2*Math.sin(x/13+z/17);
 /* signed distance to the shelf's edge (positive inside), the outline's wander added off the west face */
 function plateauD(x,z){const P=PLAT.poly;let d=1e9,inside=false;
  for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],b=P[i],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2));
   d=Math.min(d,Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z));if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}
  const s=inside?d:-d,w=1-(1-sm(0,60,x-PLAT.cliffX))*(1-sm(0,50,Math.abs(z)-PLAT.cliffZ));   /* none on the west face, full 60 m off it */
  return s+wob(x,z)*w;}
 /* signed distance to the ridge (positive inside): its sides along the band, its west end a straight face across it (the back wall) */
 function ridgeD(x,z){const A=RIDGE.a,B=RIDGE.b,dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz),t=((x-A[0])*dx+(z-A[1])*dz)/L,c=Math.abs(((x-A[0])*dz-(z-A[1])*dx)/L);
  return Math.min(RIDGE.w-c+wob(x+300,z-200)*.6,t+wob(x,z+500)*.25);}
 const flankY=(x,z)=>FLANK.y0+FLANK.slope*(x-FLANK.x0)+1.4*Math.sin(x/61+z/83)+.6*Math.sin(x/19-z/27);
 const topY=(x,z)=>PLAT.top+PLAT.tilt*(x-PLAT.cliffX)+1.6*Math.sin(x/97)*Math.cos(z/131)+.8*Math.sin(x/37+z/29);
 const crestY=(x,z)=>RIDGE.top+RIDGE.tilt*(x-RIDGE.a[0])+1.2*Math.sin(x/71+z/53);
 const plainY=flankY;
 const cliffX=z=>PLAT.cliffX;   /* straight: the outpost's carved fronts stand on it */
 /* the land: the flank, the shelf's top inside its edge, the ridge's crest inside its band (over the shelf at the back wall);
    each step sheer (a metre either side of its edge); the apron's floor level where it lies */
 function groundY(x,z){const d=plateauD(x,z),r=ridgeD(x,z);if(r>1)return crestY(x,z);if(d>1&&r<-1)return topY(x,z);
  let y=flankY(x,z);const dk=Math.hypot(x-APRON.c[0],(z-APRON.c[1])*1.3)/APRON.r+.03*Math.sin(x/41+z/37);
  if(dk<1+APRON.edge)y=APRON.floor+(y-APRON.floor)*sm(1,1+APRON.edge,dk);   /* the apron's floor is level: the walker's */
  if(d>-1)y+=(topY(x,z)-y)*sm(-1,1,d);if(r>-1)y+=(crestY(x,z)-y)*sm(-1,1,r);return y;}
 const surfaceY=groundY;
 /* the wealth rule: falls with the graph distance from the square (a district's anchor), from the hub's .9 to the outpost's .15 */
 const wealthAt=d=>+(.15+.75*Math.exp(-d/350)).toFixed(3);
 const RULES={
  tube:{grade:[.01,.03],w:[8,12],len:[100,300]},   /* the outer tube: from the portal in the west face to the stone door */
  braid:{rise:[20,40],len:[350,600],crossings:2,sep:6},   /* the braid; its crossings, each with at least sep m between the tubes */
  grade:{tube:.04,braid:.15,street:.12,ramp:.15,ledge:.04,square:.02,stair:.75,door:.04,secret:.85},
  satellite:{dist:[250,450],across:[60,90],depth:[40,75]},
  catacombs:{dist:[600,1200],depth:[40,80]},
  cistern:{dist:[0,250]},
  square:{gap:3,margin:2,free:.5},   /* floor sites 3 m apart, 2 m inside the square's edge, half the square left to walk */
  wallFit:{off:1.5,face:15*PI/180,gap:2}};

 /* ---- the hub: a bottle. The square is an ellipse (rx across x, rz across z) at y 0 under a dome (the cavern's hall with no
    belly: its wall rises plumb from the square's edge and curves in to the crown); the throat (the light well) over its middle;
    the ledge 10 m up, cut 1 m into the dome's wall there so it opens on the hall; four mouths (the braid's at the west) */
 const HALL={c:[0,0],rx:140,rz:100,y:0,h:34,belly:0,throat:{r0:16,r1:20,top:surfaceY(0,0)},pool:18,ledgeY:10,ledgeIn:1};
 const onHall=(th,inset)=>{const x=HALL.c[0]+Math.cos(th)*(HALL.rx-(inset||0)),z=HALL.c[1]+Math.sin(th)*(HALL.rz-(inset||0));return [x,z];};
 const hallK=y=>Math.sqrt(Math.max(0,1-(y/HALL.h)**2));   /* the dome's wall at height y, as a share of the square's half-axes */
 const onLedge=th=>{const k=hallK(HALL.ledgeY);return [HALL.c[0]+Math.cos(th)*(HALL.rx*k+HALL.ledgeIn),HALL.c[1]+Math.sin(th)*(HALL.rz*k+HALL.ledgeIn)];};
 /* ---- the satellites: open pits, their floors terraced */
 const PITS=[
  {id:'s1',name:'the west well',c:[-290,-170],r:40,floor:-6},
  {id:'s2',name:'the south well',c:[60,300],r:35,floor:6},
  {id:'s3',name:'the east well',c:[380,120],r:42,floor:20}];
 PITS.forEach(P=>{P.depth=+(surfaceY(P.c[0],P.c[1])-P.floor).toFixed(2);});
 const onPit=(P,th)=>[P.c[0]+Math.cos(th)*P.r,P.c[1]+Math.sin(th)*P.r];
 const faceIn=(x,z,cx,cz)=>Math.atan2(cx-x,cz-z);   /* ry whose front (+z local) points from (x, z) to (cx, cz) */

 /* ---- the graph */
 const NODES=[],EDGES=[],byId={};
 const N=(id,x,z,y,o)=>{const n=Object.assign({id,x:+x.toFixed(2),z:+z.toFixed(2),y:+y.toFixed(2)},o||{});NODES.push(n);byId[id]=n;return n;};
 const E=(a,b,kind,w,o)=>{const e=Object.assign({a,b,kind,w,zone:'inner'},o||{});EDGES.push(e);return e;};
 const chain=(ids,kind,w,o)=>{for(let i=1;i<ids.length;i++)E(ids[i-1],ids[i],kind,w,o);};
 /* the outpost, on the apron at the plateau's west foot: the portal in the west face (x -680, facing west), the clearing west
    of it; its watchtowers on the apron (the face is 75 m high: nothing stands on its shoulders) */
 const OY=PLAT.plain;
 N('o.gate',-875,0,OY,{place:'the gate'});N('o.c',-775,0,OY);N('o.portal',-680,0,OY,{place:'the portal'});
 N('o.cara',-775,52,OY,{place:'the caravanserai'});N('o.barr',-795,-42,OY,{place:'the barracks'});N('o.huts',-830,28,OY);N('o.huts2',-825,-28,OY);
 N('o.galN',-684,-45,OY,{place:'a gallery'});N('o.galS',-684,45,OY,{place:'a gallery'});N('o.pasture',-910,88,OY,{place:'the pasture'});
 N('o.tw3',-933,-58,OY,{place:'a watchtower'});N('o.tw4',-885,-112,OY,{place:'a watchtower'});
 N('o.tube0',-637,0,OY);
 for(const [a,b] of [['o.gate','o.c'],['o.c','o.portal'],['o.c','o.cara'],['o.c','o.barr'],['o.c','o.huts'],['o.c','o.huts2'],['o.portal','o.galN'],['o.portal','o.galS'],
  ['o.gate','o.pasture'],['o.gate','o.tw3'],['o.gate','o.tw4']])E(a,b,'street',4,{zone:'outer'});
 E('o.portal','o.tube0','tube',10,{zone:'outer',note:'the portal\'s own tunnel'});
 /* the outer tube: east into the plateau, climbing 2%, 10 m wide; side caves for the stores and the stables by the portal; the
    rolling stone door at its inner end */
 const T=[['t1',-600,10],['t2',-560,-5],['t.door',-520,0]];
 let px=-637,pz=0,py=OY;for(const [id,x,z] of T){py+=Math.hypot(x-px,z-pz)*.02;N(id,x,z,py,id==='t.door'?{place:'the stone door'}:null);px=x;pz=z;}
 chain(['o.tube0'].concat(T.map(t=>t[0])),'tube',10,{zone:'outer'});
 N('t.stores',-592,43,byId.t1.y,{place:'the stores'});N('t.stables',-612,-33,byId.t1.y,{place:'the stables'});
 E('t1','t.stores','tube',6,{zone:'outer'});E('t1','t.stables','tube',6,{zone:'outer'});
 /* the braid: from the stone door to the hall's west mouth, two strands that part and rejoin, climbing 35 m; an upper way from the
    hall's ledge crosses over it, and a drip-channel tube to the cistern crosses under the ledge's north tunnel */
 const BY=byId['t.door'].y;
 N('b0',byId['t.door'].x+9,0,BY+.3);   /* the stone door's passage (9 m) runs from the outer tube's end to the braid's start */E('t.door','b0','door',4,{door:'stonedoor',note:'the rolling stone door: the outer zone ends here'});
 N('a1',-450,-40,BY+7);N('a2',-320,-50,-18);N('b1',-450,45,BY+4);N('b2',-310,55,-26);N('j1',-240,-25,-12);
 chain(['b0','a1','a2','j1'],'braid',7);chain(['b0','b1','b2','j1'],'braid',5);
 N('h.w',-HALL.rx,0,0,{place:'the west mouth'});E('j1','h.w','ramp',8);
 /* the hall: the square's middle, its four mouths, the stairs to the ledge, the ledge (stacked over the north mouth) */
 N('h.sq',0,0,0,{place:'the square'});N('h.e',HALL.rx,0,0);N('h.n',0,-HALL.rz,0);N('h.s',0,HALL.rz,0);
 for(const m of ['h.w','h.e','h.n','h.s'])E('h.sq',m,'square',20);
 /* the ledge follows the wall every 10 degrees from -150 (over the west stair) to 30 (over the east); l1, l2 (stacked over the
    north mouth) and l4 are where ways leave it */
 const L=[];for(let deg=-150;deg<=30;deg+=10){const p=onLedge(deg*PI/180),id=deg===-150?'l1':deg===-90?'l2':deg===30?'l4':'l.'+deg;N(id,p[0],p[1],HALL.ledgeY,{level:'ledge'});L.push(id);}
 chain(L,'ledge',3);
 /* the two stairs up to the ledge's ends, each from 15 degrees past its end along the wall (h.stB at 15 degrees ran up under the
    ledge's last 20 degrees: P6's edge check) */
 N('h.stA',-133,-25,0);N('h.stB',96.7,69.8,0);E('h.w','h.stA','square',6);E('h.e','h.stB','square',6);E('h.stA','l1','stair',2.5);E('h.stB','l4','stair',2.5);
 /* the ledge's west tunnel: over the braid (crossing 1) to an upper junction, down a stair to strand A */
 N('u.w',-280,-10,6);E('l1','u.w','braid',4);
 /* the stair down to strand A stands beside the junction (a stair whose foot is in a junction lifts a walker passing through) */
 N('u.f',-312,-42,-18);E('a2','u.f','braid',3);E('u.f','u.w','stair',3);
 /* the cistern near the north mouth; a drip-channel tube to it from the braid's junction (crossing 2, under the ledge's north tunnel) */
 N('cis',40,-165,-6,{place:'the cistern hall'});E('h.n','cis','ramp',6);E('j1','cis','tube',4);
 N('n.w',-150,-170,12);E('l2','n.w','braid',4);
 /* the satellites: a node at each pit's floor where its way comes in, its floor's middle */
 const pitNode=(P,id,th,y)=>{const p=onPit(P,th);return N(id,p[0],p[1],y===undefined?P.floor:y);};
 const S1=PITS[0],S2=PITS[1],S3=PITS[2];
 /* each well's floor is laid out on the axis of its main way in (PIT_IN: the angle from the middle to that entrance): a point
    a along it and b across it (see the sites below) */
 const PIT_IN={s1:PI/2,s2:-PI/2,s3:PI+.25};
 const pitAt=(P,a,b)=>{const th=PIT_IN[P.id],u=[Math.cos(th),Math.sin(th)],v=[-u[1],u[0]];return [P.c[0]+u[0]*a+v[0]*b,P.c[1]+u[1]*a+v[1]*b];};
 const pitWay=(P,id,a,b)=>{const q=pitAt(P,a,b);return N(id,q[0],q[1],P.floor);};
 pitNode(S1,'s1.in',PIT_IN.s1);N('s1.c',S1.c[0],S1.c[1],S1.floor,{place:'the west well'});E('a2','s1.in','ramp',6);E('s1.in','s1.c','street',4);
 /* the ledge's north tunnel comes down to the west well's floor by one long stair, clear of the wall's carved fronts */
 pitNode(S1,'s1.up',-40*PI/180);E('n.w','s1.up','stair',3);
 pitWay(S1,'s1.k',-11,-17);pitWay(S1,'s1.m',-11,0);chain(['s1.up','s1.k','s1.m','s1.c'],'street',4);   /* round the fields, between them and the homes */
 N('bs1',20,200,3);pitNode(S2,'s2.in',PIT_IN.s2);N('s2.c',S2.c[0],S2.c[1],S2.floor,{place:'the south well'});chain(['h.s','bs1','s2.in'],'braid',6);E('s2.in','s2.c','street',4);
 N('e1',250,40,9);pitNode(S3,'s3.in',PIT_IN.s3);N('s3.c',S3.c[0],S3.c[1],S3.floor,{place:'the east well'});chain(['h.e','e1','s3.in'],'ramp',6);E('s3.in','s3.c','street',4);
 /* the catacombs: down a processional way from the south well, far and deep; the Keepers' rooms at their head */
 pitNode(S2,'s2.e',PI/4);pitWay(S2,'s2.m',-11,0);pitWay(S2,'s2.k',-11,17);chain(['s2.c','s2.m','s2.k','s2.e'],'street',4);
 N('k1',300,420,-22);N('k2',480,560,-46);N('k.head',560,640,-58,{place:'the catacombs'});chain(['s2.e','k1','k2','k.head'],'ramp',4,{note:'the processional way'});
 /* the secret ways (scouts only): an exit up into the forest on the plateau's top, and one out at the west face's foot */
 N('x.lava',-200,-262,surfaceY(-200,-262),{place:'a scout exit (the forest on top)',exit:'top'});E('n.w','x.lava','secret',1.5,{zone:'secret'});
 N('x.forest',-689,158,OY+2,{place:'a scout exit (the west face\'s foot)',exit:'foot'});E('t1','x.forest','secret',1.5,{zone:'secret',note:'out by a back passage from the outer tube, past the stores'});

 /* ---- the districts: each an anchor (its distance and wealth are the anchor's) and what it must hold */
 const DISTRICTS=[
  {id:'hub',kind:'hub',anchor:'h.sq',needs:{zj_council:1,zj_temple:1,zj_guard_hq:1,zj_muster:1,zj_stall_b:4,'zj_shop_*_built':3,zj_brewery:1,zj_lab:1,zj_barracks_carved:1,zj_estate_a:1,zj_estate_b:1}},
  {id:'s1',kind:'satellite',anchor:'s1.in',pit:'s1'},
  {id:'s2',kind:'satellite',anchor:'s2.in',pit:'s2'},
  {id:'s3',kind:'satellite',anchor:'s3.in',pit:'s3'},
  {id:'cistern',kind:'cistern',anchor:'cis',needs:{zj_cistern:1}},
  {id:'catacombs',kind:'catacombs',anchor:'k.head',needs:{zj_catacomb:1}},
  {id:'outpost',kind:'outpost',anchor:'o.c',needs:{zj_portal:1,zj_caravanserai:1,zj_gate:1,zj_palisade:8,zj_watchtower:[2,4],zj_barracks_outpost:1,'zj_gallery_*':2,'dwelling':4}}];
 const SAT_NEEDS={'zj_gallery_*':1,zj_house_built_mid:1,zj_store_tunnel:1,zj_granary:1,'zj_shop_*':1,'zj_tavern_*|zj_inn_*':1,zj_smithy:1,'zj_farm_yam|zj_farm_veg':2,zj_farm_alecap:1,zj_kiva:1};
 DISTRICTS.forEach(D=>{if(D.kind==='satellite')D.needs=SAT_NEEDS;});

 /* ---- the sites */
 const SITES=[];
 const S=(key,district,x,z,ry,y,at,o)=>{const s=Object.assign({key,district,x:+x.toFixed(2),z:+z.toFixed(2),ry:+(ry||0).toFixed(4),y:+(y||0).toFixed(2),at:at||'floor'},o||{});SITES.push(s);return s;};
 /* a site in the hall's wall faces square to it (the ellipse's normal, not its centre: off the axes the two part by up to 20 degrees) */
 const hallNormal=(x,z)=>{const nx=-(x-HALL.c[0])/(HALL.rx*HALL.rx),nz=-(z-HALL.c[1])/(HALL.rz*HALL.rz),L=Math.hypot(nx,nz);return [nx/L,nz/L];};
 const hallWall=(key,deg)=>{const th=deg*PI/180,p=onHall(th),n=hallNormal(p[0],p[1]);return S(key,'hub',p[0],p[1],Math.atan2(n[0],n[1]),HALL.y,'wall');};
 const pitWall=(key,P,deg,o)=>{const th=deg*PI/180,p=onPit(P,th);return S(key,P.id,p[0],p[1],faceIn(p[0],p[1],P.c[0],P.c[1]),P.floor,'wall',o);};
 /* the hub's square: the council in its trench, the scouts' tower, the shops and the tavern along the south side (a lane left
    open to the south mouth), the guard headquarters, the muster ground, stalls in the pool of daylight, a kiva */
 S('zj_council','hub',-60.5,-39,PI/2);S('zj_scout_hq','hub',14,-62,0);
 S('zj_tavern_built','hub',-58,60,PI);S('zj_shop_food_built','hub',-40,60,PI);S('zj_shop_general_built','hub',-26,60,PI);
 S('zj_shop_lampwright_built','hub',26,60,PI);S('zj_shop_potter_built','hub',40,60,PI);S('zj_guard_hq','hub',60,62,PI);S('zj_muster','hub',90,30,-PI/2);
 /* the park under the light well (its paths run along the lanes, so it is not in their way), the stalls round its edge */
 S('zj_park','hub',HALL.c[0],HALL.c[1],0,0,'floor',{park:true,knoll:true});   /* knoll: its quarters are the breakdown's piles (below) */
 for(const deg of [30,60,120,150]){const a=deg*PI/180,x=Math.cos(a)*23.5,z=Math.sin(a)*23.5;S('zj_stall_b','hub',x,z,faceIn(x,z,0,0),0,'floor',{v:deg>90?1:0});}
 S('zj_kiva','hub',-34,24,0);hallWall('zj_niche',-80);
 /* in the hall's wall: the temple's pit, the brewery and the alchemist, the barracks, the estates, two carved shops */
 hallWall('zj_temple',-22);hallWall('zj_barracks_carved',-62);hallWall('zj_estate_a',-105);hallWall('zj_estate_b',-125);
 hallWall('zj_brewery',115);hallWall('zj_lab',128);hallWall('zj_shop_weapons_carved',155);hallWall('zj_shop_knapper_carved',168);
 /* the rolling stone door, at the outer tube's inner end, facing the outer zone (west) */
 S('zj_stonedoor','outpost',byId['t.door'].x,byId['t.door'].z,-PI/2,byId['t.door'].y,'ground',{walls:{front:[10.4,10.2],back:[9,7.5]}});
 /* the cistern hall; the catacombs */
 /* (each faces the way that comes to it: its front is where the tunnel ends) */
 S('zj_cistern','cistern',40,-165,faceIn(40,-165,0,-HALL.rz),-6,'ground');S('zj_catacomb','catacombs',560,640,faceIn(560,640,480,560),byId['k.head'].y,'ground');
 /* the satellites. The floor is laid out on the axis of the way in (u, from the middle to the entrance; v across it): the street
    from the entrance runs to the middle between two fields; the homes stand beyond the middle, the smithy and the granary
    either side; galleries, the stores, the alecap beds, a shop, a tavern or inn and a kiva are cut in the wall, clear of the ways */
 const sat=(P,o)=>{const c=P.c,y=P.floor,th=PIT_IN[P.id],u=[Math.cos(th),Math.sin(th)],at=(a,b)=>pitAt(P,a,b);
  S('zj_farm_yam',P.id,...at(0,-8.5),-th,y);S('zj_farm_veg',P.id,...at(0,8.5),PI-th,y);
  S('zj_house_built_mid',P.id,...at(-20,0),Math.atan2(u[0],u[1]),y);
  const sm=at(0,22*o.side),gr=at(0,-22*o.side);S('zj_smithy',P.id,sm[0],sm[1],faceIn(sm[0],sm[1],c[0],c[1]),y);S('zj_granary',P.id,gr[0],gr[1],faceIn(gr[0],gr[1],c[0],c[1]),y);
  o.wall.forEach(([k,deg])=>pitWall(k,P,deg));};
 sat(S1,{side:1,wall:[['zj_gallery_a',-120],['zj_store_tunnel',-70],['zj_farm_alecap',15],['zj_kiva',50],['zj_shop_dyer_carved',140],['zj_tavern_carved',175]]});
 sat(S2,{side:1,wall:[['zj_shop_rope_carved',-55],['zj_kiva',-20],['zj_farm_alecap',10],['zj_store_tunnel',80],['zj_inn_carved',125],['zj_gallery_b',180]]});
 sat(S3,{side:1,wall:[['zj_gallery_a',-50],['zj_kiva',30],['zj_shop_stonecutter_carved',95],['zj_store_tunnel',125],['zj_farm_alecap',155],['zj_tavern_carved',-100]]});
 /* the outpost: the portal and its galleries in the west face (facing west), the caravanserai on the stream, the barracks, the
    gate and a palisade round the clearing's west half, two watchtowers outside it, dwellings */
 S('zj_portal','outpost',-680,0,-PI/2,OY,'wall');S('zj_gallery_a','outpost',-680,-45,-PI/2,OY,'wall');S('zj_gallery_b','outpost',-680,45,-PI/2,OY,'wall');
 S('zj_caravanserai','outpost',-775,62,0,OY);S('zj_barracks_outpost','outpost',-795,-48,0,OY);S('zj_gate','outpost',-875,0,-PI/2,OY);
 S('zj_watchtower','outpost',-933,-58,-PI/2,OY);S('zj_watchtower','outpost',-885,-112,-PI/2,OY);
 const PAL={c:[-775,0],r:100};
 for(let i=0;i<26;i++){const a=PI/2+.06+i*(PI-.12)/25;if(Math.abs(a-PI)<.07)continue;const x=PAL.c[0]+Math.cos(a)*PAL.r,z=PAL.c[1]+Math.sin(a)*PAL.r;S('zj_palisade','outpost',x,z,PI/2-a,OY);}   /* tangent, the bank (its front) outward */
 /* and from the ring's two ends straight on east to the cliff, so the clearing is closed: the last run reaches into the rock */
 for(const sz of [-1,1])for(let i=0;i<8;i++)S('zj_palisade','outpost',PAL.c[0]+6+12*i,sz*PAL.r,sz>0?0:PI,OY,'floor',{line:true});
 S('zj_hut_a','outpost',-837,32,PI/2,OY);S('zj_hut_a','outpost',-827,46,PI,OY);S('zj_hut_b','outpost',-815,28,PI/2,OY);S('zj_hut_b','outpost',-840,-30,PI/2,OY);
 S('zj_house_wood','outpost',-823,-34,0,OY);S('zj_farmhouse_wood','outpost',-750,-62,PI,OY);S('zj_hut_c','outpost',-680.6,-72,-PI/2,OY,'wall');
 S('zj_farm_veg','outpost',-735,40,0,OY);
 /* the outpost's kiva, sunk in the clearing, and beside it the lattice shrine (pierced stone wants the sky behind it) */
 S('zj_kiva','outpost',-753,-16,0,OY);S('zj_shrine','outpost',-737,-16,0,OY);S('zj_stall_a','outpost',-682,72,-PI/2,OY,'wall');
 /* the stores and the stables in the outer tube's side caves */
 S('zj_store_tunnel','outpost',byId['t.stores'].x,byId['t.stores'].z,faceIn(byId['t.stores'].x,byId['t.stores'].z,byId.t1.x,byId.t1.z),byId['t.stores'].y,'ground');
 const PASTURE=[[-935,60],[-875,60],[-865,130],[-945,140]];
 /* the stream: a spring at the west face's foot, west across the apron */
 const STREAM=[[-875,140],[-815,95],[-775,80],[-715,70],[-678,90]];

 /* ---- each key's footprint, as the kit declares it (kits/zeijani/src: w, d; carved defs stand on the foot of their front) */
 const FOOT={zj_council:[46,92,'centre'],zj_temple:[48,52,'front'],zj_scout_hq:[12,12,'centre'],zj_tavern_built:[15,12,'centre'],zj_guard_hq:[16,12,'centre'],
  zj_muster:[22,16,'centre'],zj_stall_b:[4.4,3.6,'centre'],zj_stall_a:[5,2.2,'centre'],zj_kiva:[10,10,'centre'],zj_niche:[3.6,2,'centre'],
  zj_barracks_carved:[26,25,'front'],zj_estate_a:[36,40,'front'],zj_estate_b:[34,36,'front'],zj_brewery:[25,29,'front'],zj_lab:[21,25,'front'],
  zj_cistern:[32,34,'front'],zj_catacomb:[32,24,'front'],zj_farm_yam:[16,12,'centre'],zj_farm_veg:[16,12,'centre'],zj_granary:[8,8,'centre'],
  zj_house_built_mid:[16,11,'centre'],zj_gallery_a:[30,56,'front'],zj_gallery_b:[30,34,'front'],zj_store_tunnel:[20,27,'front'],zj_farm_alecap:[18,30,'front'],
  zj_tavern_carved:[23,23,'front'],zj_inn_carved:[27,32,'front'],zj_smithy:[11,9,'centre'],zj_portal:[50,40,'front'],zj_caravanserai:[46,36,'centre'],
  zj_barracks_outpost:[18,10,'centre'],zj_gate:[12,5,'centre'],zj_watchtower:[7,7,'centre'],zj_palisade:[13,4,'centre'],zj_hut_a:[8,8,'centre'],
  zj_hut_b:[9,10,'centre'],zj_shrine:[8,8,'centre'],zj_park:[34,34,'round'],zj_rowhouse:[8,10,'centre'],zj_market_hall:[26,11,'centre'],zj_fountain:[6,6,'centre'],zj_house_built_rich:[12,10,'centre'],zj_stonedoor:[10,9,'front'],zj_hut_c:[10,12,'centre'],zj_house_wood:[11,11,'centre'],zj_farmhouse_wood:[14,14,'centre']};
 SITES.forEach(s=>{if(!FOOT[s.key]){if(/^zj_shop_.*_carved$/.test(s.key))FOOT[s.key]=[13,15,'front'];else if(/^zj_shop_.*_built$/.test(s.key))FOOT[s.key]=[11,10,'centre'];}});

 /* ---- the square filled (the owner: it wants streets of houses): homes, shops, the market hall and the fountains laid in by a
    deterministic pass. Candidates on a 2 m grid, the homes taking the outer ring first so they line the square in a street
    facing in; each kept 5 m in from the wall (6 m clear of a carved front), clear of the lanes and the stairs to the ledge, of the
    park, and 3.5 m from everything placed */
 {for(const t of ['armour','leather','dyer'])FOOT['zj_shop_'+t+'_built']=[11,10,'centre'];
  const Q=(key,x,z,ry)=>{const [w,d,o]=FOOT[key];if(o==='round')return [0,1,2,3,4,5,6,7].map(k=>[x+Math.cos(k*PI/4)*w/2/Math.cos(PI/8),z+Math.sin(k*PI/4)*w/2/Math.cos(PI/8)]);const za=o==='front'?-d:-d/2,zb=o==='front'?.5:d/2,c=Math.cos(ry),sn=Math.sin(ry);
   return [[-w/2,za],[w/2,za],[w/2,zb],[-w/2,zb]].map(([lx,lz])=>[x+lx*c+lz*sn,z-lx*sn+lz*c]);};
  const sd=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2));return Math.hypot(a[0]+dx*t-p[0],a[1]+dz*t-p[1]);};
  const over=(A,B)=>{for(const P of [A,B])for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],n=[b[1]-a[1],a[0]-b[0]],pa=A.map(p=>p[0]*n[0]+p[1]*n[1]),pb=B.map(p=>p[0]*n[0]+p[1]*n[1]);
    if(Math.max(...pa)<Math.min(...pb)||Math.max(...pb)<Math.min(...pa))return false;}return true;};
  const gap=(A,B)=>{if(over(A,B))return 0;let g=1e9;for(const [P,R] of [[A,B],[B,A]])for(const p of P)for(let i=0;i<R.length;i++)g=Math.min(g,sd(p,R[i],R[(i+1)%R.length]));return g;};
  const placed=SITES.filter(s=>s.district==='hub').map(s=>({q:Q(s.key,s.x,s.z,s.ry),wall:s.at==='wall'}));
  const lanes=EDGES.filter(e=>e.kind==='square').map(e=>[[byId[e.a].x,byId[e.a].z],[byId[e.b].x,byId[e.b].z]]);
  const inE=(p,m)=>((p[0]-HALL.c[0])/(HALL.rx-m))**2+((p[1]-HALL.c[1])/(HALL.rz-m))**2<=1;
  const ok=(q)=>q.every(p=>inE(p,5))&&lanes.every(([a,b])=>Math.min(...q.map(p=>sd(p,a,b)))>=7&&!over(q,[a,b,[b[0]+.01,b[1]+.01],[a[0]+.01,a[1]+.01]]))
   &&placed.every(o=>gap(q,o.q)>=(o.wall?6:3.5));
  const cand=[];for(let x=-HALL.rx;x<=HALL.rx;x+=2)for(let z=-HALL.rz;z<=HALL.rz;z+=2){const e=Math.hypot(x/HALL.rx,z/HALL.rz);if(e<.98)cand.push([x,z,e]);}
  const lay=(key,n,order,o)=>{const C=cand.slice().sort(order);let k=0;for(const [x,z] of C){if(k>=n)break;const ry=faceIn(x,z,HALL.c[0],HALL.c[1]),q=Q(key,x,z,ry);if(!ok(q))continue;
    S(key,'hub',x,z,ry,HALL.y,'floor',Object.assign({fill:true},o?o(k):{}));placed.push({q,wall:false});k++;}};
  const outer=(a,b)=>b[2]-a[2]||a[0]-b[0]||a[1]-b[1],ring=r=>(a,b)=>Math.abs(a[2]-r)-Math.abs(b[2]-r)||a[0]-b[0]||a[1]-b[1];
  lay('zj_market_hall',1,ring(.45));
  for(const t of ['armour','leather','dyer'])lay('zj_shop_'+t+'_built',1,ring(.55));
  lay('zj_house_built_rich',4,ring(.6));lay('zj_house_built_mid',3,ring(.7));
  lay('zj_rowhouse',22,outer,k=>({v:k%4}));
  lay('zj_fountain',2,ring(.3));}

 /* ---- the wells' floors: the breakdown under each opening (the owner: "a low hill", "a skirt of greenery", at the BOTTOM of
    the well, as the Throne's lava tube station has under its skylights): low piles of the fallen roof, grown over. Each pile is
    the largest disc (to rMax) in the daylight that keeps 2 m off every site of its floor (the park's beds apart: the hall's piles
    are the park's quarters) and 1 m past the half width of every way on that floor (3 m off a lane's line across the square, as its sites); taken greedily, best first, n to a floor.
    A pile's height is a third of its radius (1.5 to 3 m); knollAt(x, z) is the floor and the pile over it there, or null */
 const KNOLLS=[];
 {const sd=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2));return Math.hypot(a[0]+dx*t-p[0],a[1]+dz*t-p[1]);};
  /* a point's distance to a site's footprint (its rectangle, turned; a round one a disc), negative inside */
  const footD=(s,x,z)=>{const [w,d,o]=FOOT[s.key]||[4,4,'centre'];if(o==='round')return Math.hypot(x-s.x,z-s.z)-w/2;const c=Math.cos(s.ry),sn=Math.sin(s.ry),dx=x-s.x,dz=z-s.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;
   const z0=o==='front'?-d:-d/2,z1=o==='front'?3.5:d/2,qx=Math.abs(lx)-w/2,qz=Math.max(z0-lz,lz-z1);return Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0);};
  const wells=[{id:'hall',c:HALL.c,y:HALL.y,light:HALL.pool+4,rMax:7.5,n:4,sites:SITES.filter(s=>s.district==='hub'&&s.at==='floor'&&!s.park)}]
   .concat(PITS.map(P=>({id:P.id,c:P.c,y:P.floor,light:P.r-5,rMax:10,n:2,sites:SITES.filter(s=>s.district===P.id)})));
  for(const W of wells){const ways=EDGES.filter(e=>{const a=byId[e.a],b=byId[e.b];return Math.abs(a.y-W.y)<2&&Math.abs(b.y-W.y)<2&&
     sd(W.c,[a.x,a.z],[b.x,b.z])<W.light+40;}).map(e=>({a:[byId[e.a].x,byId[e.a].z],b:[byId[e.b].x,byId[e.b].z],hw:e.kind==='square'?3:(e.w||4)/2+1}));   /* a lane across the square: 3 m off its line, as the sites keep */
   const room=(x,z,got)=>{let r=Math.min(W.rMax,W.light-Math.hypot(x-W.c[0],z-W.c[1]));
    for(const s of W.sites)r=Math.min(r,footD(s,x,z)-2);for(const w of ways)r=Math.min(r,sd([x,z],w.a,w.b)-w.hw);for(const k of got)r=Math.min(r,Math.hypot(x-k.c[0],z-k.c[1])-k.r-2);return r;};
   const got=[];for(let i=0;i<W.n;i++){let best=null;
    for(let x=W.c[0]-W.light;x<=W.c[0]+W.light;x+=1)for(let z=W.c[1]-W.light;z<=W.c[1]+W.light;z+=1){const r=room(x,z,got);if(r>4.5&&(!best||r>best.r+1e-9))best={c:[x,z],r};}
    if(!best)break;got.push(best);}
   got.forEach((k,i)=>KNOLLS.push({id:W.id+'.k'+i,well:W.id,c:k.c,y:W.y,r:Math.floor(k.r*100)/100,h:+Math.max(1.5,Math.min(3,k.r/3)).toFixed(2)}));}}
 /* the pile's height over its floor at (x, z): a heap (steeper at its foot), its top broken by two waves of noise */
 const knollAt=(x,z)=>{for(const K of KNOLLS){const d=Math.hypot(x-K.c[0],z-K.c[1]);if(d>=K.r)continue;const u=1-d/K.r,s=u*u*(3-2*u);
   const n=.85+.15*Math.sin(x*.9+z*.4)+.1*Math.sin(x*.31-z*.77+K.r);return {K,y:K.y+K.h*Math.pow(s,1.25)*n};}return null;};

 /* ---- the graph's helpers */
 const adj={};NODES.forEach(n=>adj[n.id]=[]);EDGES.forEach((e,i)=>{adj[e.a].push([e.b,i]);adj[e.b].push([e.a,i]);});
 const len=e=>{const a=byId[e.a],b=byId[e.b];return Math.hypot(b.x-a.x,b.z-a.z);};
 const grade=e=>{const a=byId[e.a],b=byId[e.b],h=Math.hypot(b.x-a.x,b.z-a.z);return h>1e-6?Math.abs(b.y-a.y)/h:1e9;};
 /* distances from a node over the edges a filter allows (Dijkstra on plan length; small graph) */
 function dist(from,ok){const D={};NODES.forEach(n=>D[n.id]=Infinity);D[from]=0;const done={};
  for(;;){let u=null,best=Infinity;for(const id in D)if(!done[id]&&D[id]<best){best=D[id];u=id;}if(u===null)break;done[u]=1;
   for(const [v,i] of adj[u]){const e=EDGES[i];if(ok&&!ok(e))continue;const d=best+len(e);if(d<D[v])D[v]=d;}}return D;}
 const fromSquare=dist('h.sq',e=>e.zone!=='secret');
 DISTRICTS.forEach(D=>{D.dist=+fromSquare[D.anchor].toFixed(1);D.wealth=wealthAt(D.dist);});

 return {PI,surfaceY,groundY,topY,plainY,flankY,crestY,plateauD,ridgeD,cliffX,PLAT,RIDGE,FLANK,APRON,hallK,onLedge,hallNormal,wealthAt,RULES,HALL,PITS,DISTRICTS,NODES,EDGES,byId,adj,SITES,FOOT,PASTURE,STREAM,PAL,KNOLLS,knollAt,len,grade,dist,onHall,onPit,faceIn};
})();
if(typeof module!=='undefined')module.exports=DH;
