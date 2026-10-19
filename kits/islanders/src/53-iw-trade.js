// prefix: iw
// ================================================================= THE WEST'S TRADE: farms, granaries, the windmill, the warehouse, the smithy, the shops
// The working buildings of a West village, in the house style (50-iw-west.js, the helpers in 52-iw-civic.js): the rice
// farm and the poor smallholding (their crops and beasts are the fl-* and the fauna defs, placed), the rangkiang rice barns
// (Minangkabau: a flared, painted barn on posts with rat guards under a gonjong roof), a windmill whose woven-mat sails
// turn, the warehouse, the smithy with its piston bellows, and the shops: the market hall, the kava house, the trader's
// shophouse, the weaver's, the potter's yard and the boat-chandler's.
// Frame: origin on the ground at the plot centre, +z the front.
/* ---------------------------------------------------------------- things that turn (the windmill's sails)
   iwSpinner draws fn into its OWN buckets, in a hub frame at (x, y, z) of the current frame whose local z is the axle.
   After the world is built the buckets are flushed into a group whose matrix is H * Rz(angle) * H^-1 (H the hub's world
   matrix: the def's yaw, then the hub's offset), so the sails turn about the axle itself (the YXZ rule: yaw first, then the
   spin about the hub's own axis), and the frame hook below turns them with the clock (ANIMU.uTime: ?t= pins it). */
const IW_SPIN=[],IW_R=new THREE.Matrix4();
function iwSpinner(x,y,z,rate,fn){const B={},keep=GTARGET,H=CM.clone().multiply(TF(x,y,z,0));GTARGET=B;
 try{isNoCut(()=>W(x,y,z,0,fn));}finally{GTARGET=keep;}if(!PLACE_DRY)IW_SPIN.push({B,H,Hi:H.clone().invert(),rate,phase:IW_SPIN.length*.9,g:null});}
function iwSpinFrame(){const t=ANIMU.uTime.value;for(const e of IW_SPIN){if(!e.g)continue;IW_R.makeRotationZ(t*e.rate+e.phase);e.g.matrix.copy(e.H).multiply(IW_R).multiply(e.Hi);e.g.matrixWorldNeedsUpdate=true;}}
FRAME_HOOKS.push(iwSpinFrame);
/* the post-build flush (wrapped like 91f-furnish.js wraps it: the list restarts before the build, the groups join WORLD after) */
{const iwBuildWorld=buildWorld;buildWorld=function(){IW_SPIN.length=0;const r=iwBuildWorld();
 for(const e of IW_SPIN){const g=new THREE.Group();g.matrixAutoUpdate=false;g.name='iw-spinner';flushBuckets(e.B,g,true);WORLD.add(g);e.g=g;}iwSpinFrame();return r;};}
/* ---------------------------------------------------------------- shared trade helpers */
/* a rangkiang (a rice barn): posts with rat guards, a deck, walls flaring out toward the eave (the front painted), a high
   hatch, a gonjong roof; o.L0 o.D0 the base, o.L1 o.D1 the eave, o.fy the floor, o.wh the walls, o.furn false: empty */
function iwRangkiang(x,z,ry,o){o=o||{};const L0=o.L0||3,D0=o.D0||2.2,L1=o.L1||4,D1=o.D1||3,fy=o.fy||1.8,wh=o.wh||2.4,t=fy+wh,kc=CUTC;
 W(x,0,z,ry,()=>{isCutFloor(fy);for(const px of isSpan(-L0/2+.15,L0/2-.15,L0>3.4?3:2))for(const sz of [-1,1]){const pz=sz*(D0/2-.15);
   sph('stone',px,.06,pz,.3,P('stone'),.42,8);cyl('tarred',px,0,pz,.14,fy-IS_T,P('tarred'),8);cyl('wood',px,fy*.62,pz,.36,.05,P('woodD'),12);}
  isDeck(L0+.3,D0+.3,fy,{beam:true});
  const face=(Lb,Db,Lt,Dt,mk,col)=>poly(mk,[[-Lb/2,fy,Db/2],[Lb/2,fy,Db/2],[Lt/2,t,Dt/2],[-Lt/2,t,Dt/2]],col,true);
  for(const [a,Lb,Db,Lt,Dt,mk,col] of [[0,L0,D0,L1,D1,'patGableW',WHITE],[PI,L0,D0,L1,D1,'carvedR',P('woodD')],[PI/2,D0,L0,D1,L1,'carvedR',P('woodD')],[-PI/2,D0,L0,D1,L1,'carvedR',P('woodD')]])W(0,0,0,a,()=>face(Lb,Db,Lt,Dt,mk,col));
  for(const sx of [-1,1])for(const sz of [-1,1])beam('wood',[sx*L0/2,fy,sz*D0/2],[sx*L1/2,t,sz*D1/2],.1,P('woodD'));
  box('wood',0,t-.12,0,L1+.1,.14,D1+.1,P('woodD'));
  const th=Math.atan2((D1-D0)/2,wh),yc=fy+wh*.42,zc=D0/2+(yc-fy)/wh*(D1-D0)/2;WX(0,yc,zc+.04,0,th,0,()=>{box('planks',0,-.5,0,.78,1.0,.05,P('woodD'));box('plain',0,.52,.02,.95,.08,.04,P('red'));});
  door(0,fy,D0/2,0,.8);
  const rf=isSaddle({L:L1,W:D1,eaveY:t-.05,ridgeY:t+(o.ridgeH||2.2),sag:o.sag||.45,hornRise:o.hornRise||2.4,hornOut:o.hornOut||1.0,taper:1,over:.5,th:.22,nu:22,mk:'thatch',col:P('thatchW'),patch:o.patch||0});
  for(const s of [-1,1])rf.gable(s*L1/2,t,D1/2,'patGableW',{});iwSpikes(rf,.8);
  isNoCut(()=>isLogLadder(0,D0/2+.12,0,fy));   /* under the hatch (door x = 0); it stood 0.5 m to the side */
  if(o.furn!==false){FURNISH('job_bales',-L0/4,fy,-.25,0);FURNISH('generic_sack',L0/4,fy,-D0/4+.05,0);FURNISH('generic_sack',L0/4+.15,fy,D0/4-.1,.6);FURNISH('generic_basket',-L0/4,fy,D0/4+.12,0);}});
 CUTC=kc;}
/* a lesung: the long log trough the women pound rice in, its pestles leaning on it */
function iwLesung(x,z,ry){W(x,0,z,ry,()=>{for(const k of [-1.5,1.5])box('wood',k,0,0,.3,.22,.5,P('woodD'));box('wood',0,.22,0,4,.42,.55,P('wood'));box('plain',0,.645,0,3.5,.02,.32,P('woodD'));
 for(const k of [-1,0,1])pole('wood',[k*1.1,.66,.32],[k*1.1+.2,2.2,.95],.055,P('woodL'),6);});}
/* a woodpile: n split logs stacked along x */
function iwWoodpile(x,z,ry,n,len){W(x,0,z,ry,()=>{let k=0;for(let r=0;k<n;r++)for(let i=0;i<4-r&&k<n;i++,k++){const y=.1+r*.17,zz=(i-(3-r)/2)*.2;beam('wood',[-len/2,y,zz],[len/2,y,zz],.09,P('wood'),true,6);}});}
/* ---------------------------------------------------------------- the farms */
defBuilding({key:'iw-farm',name:'Rice farm (West)',seed:5301,cut:true,w:36,d:30,h:14,budget:220000,
 tags:{types:['farm','dwelling-single'],wealth:'middle',style:'west',role:'rice farmer',job:'farming'},
 note:'a rice farm: the family house on piles, its own rangkiang, two flooded paddies, a taro patch and bananas (placed flora), the water buffalo, pigs in a bamboo pen, hens and ducks, the sheaf rack and the winnowing tub',
 build(o){W(-9,0,-8,0,()=>iwHouse({L:8,D:5,floorY:1.6,wallH:2.2,roof:{ridgeH:2.8,sag:.8,hornRise:2.2,hornOut:1,taper:1,over:.7,th:.28},band:'patBand',bandH:.32,
   front:iwOpen(8,2),back:iwOpen(8,2,false),stair:'stair',finial:'horns',tier:'middle',beds:1,underPig:true}));
  iwRangkiang(-.5,-10.5,0,{L0:2.6,D0:2,L1:3.4,D1:2.7,fy:1.7,wh:2.1,ridgeH:1.9,hornRise:2,hornOut:.8});
  isNoCut(()=>{const S={setting:'outdoor'};
   box('earth',-3.5,0,-1.6,26,.03,1.6,P('earth'));
   /* the pig pen: a bamboo fence round two pigs */
   W(6.5,0,-8.5,0,()=>{for(const [x,z,ry,L] of [[0,2,0,5],[0,-2,0,5],[2.5,0,PI/2,4],[-2.5,0,PI/2,4]])W(x,0,z,ry,()=>isFenceRun(L,1.0));box('earth',0,0,0,4.8,.04,3.8,0x6a5038);});
   place('pig',5.6,-8.8,.6,{mode:'idle',sub:'west'});place('pig',7.5,-8.0,2.4,{sub:'west'});
   FURNISH('job_sheaf_rack',12.5,0,-12.8,0,S);FURNISH('job_winnowing_tub',8.4,0,-2.9,0,S);FURNISH('job_winnowing_mat',10.6,0,-3.2,.2,S);FURNISH('generic_basket',11.8,0,-2.4,0,S);
   iwLesung(-1,-4.4,0);isDrum(-14.3,0,-4.6,{col:'galv'});});
  place('fl-paddy',-6.5,6.2,0,{});place('fl-paddy',5.5,6.2,0,{v:1});place('fl-taro',13.6,7.2,0,{});
  place('fl-banana',13.4,-1.2,0,{v:1});place('fl-banana',-15.2,1.2,1,{v:2});place('fl-coconut',13.8,-12.0,.8,{v:3});
  place('buffalo',-3.4,-2.8,PI/2,{mode:'idle',sub:'west',activity:'REST'});
  for(const [x,z,r] of [[-4.6,-3.9,.4],[-6.0,-1.3,2.1],[2.4,-5.4,4.0]])place('hen',x,z,r,{sub:'west'});
  for(const [x,z,r] of [[-.6,11.6,.3],[.6,12.2,-.4],[1.6,11.4,1.1]])place('duck',x,z,r,{sub:'west'});}});
defBuilding({key:'iw-farm-poor',name:'Smallholding (West)',seed:5302,cut:true,w:27,d:22,h:13,budget:150000,
 tags:{types:['farm','dwelling-single'],wealth:'poor',style:'west',role:'smallholder',job:'farming'},
 note:'a poor smallholding: a scrap-mended hut on stumps, taro beds and bananas (placed flora), a pig sty walled with tin and planks under an iron lean-to, hens, a sheaf rack, a water drum',
 build(o){W(-5,0,-4.5,0,()=>iwHouse({L:5,D:3.6,floorY:.9,wallH:1.9,roof:{ridgeH:1.9,sag:.4,hornRise:1.1,hornOut:.5,taper:.5,over:.5,patch:.7,th:.12},thatchKey:'thatchP',
   wallMkf:s=>s==='front'?'reclaimed':s==='left'?'corrW':s==='right'?'bamboo':'tin',wallColf:s=>s==='front'?P('planks'):s==='left'?P('rust'):s==='right'?P('bamboo'):P('tin'),gableMk:'reclaimed',gableCol:P('planks'),
   front:[{x:-.7,w:.9,h:1.7,door:true},{x:1.2,w:.6,y:.8,h:.6}],back:[{x:.6,w:.6,y:.8,h:.6}],doorX:-.7,stair:'log',finial:'none',tier:'poor',beds:1,
   furn:[['scrap_poor_stool',.8,.4,PI/2]],extra:rf=>{for(const [x,z] of [[-1.1,1],[1.0,1.2],[.4,-1.2]]){const p=rf.F(z>0?1:-1)((x/2.5+1)/2,.4);isTyre(p[0],p[1]+.02,p[2]);}}}));
  isNoCut(()=>{const S={setting:'outdoor'};
   /* the pig sty: salvage walls, an iron lean-to */
   W(6.5,0,-5.5,0,()=>{for(const [x,z,ry,L] of [[0,-1.6,0,3.6],[1.8,0,PI/2,3.2],[-1.8,0,-PI/2,3.2]])W(x,0,z,ry,()=>isPatchWall(L,0,1.1,{}));
    for(const [x,z] of [[-1.8,1.6],[1.8,1.6]])box('wood',x,0,z,.1,1.0,.1,P('woodD'));box('reclaimed',0,.8,1.6,3.6,.18,.05,P('planks'));
    for(const s of [-1,1])cyl('wood',s*1.8,0,-1.7,.06,2.0,P('wood'),6);WX(0,1.75,-.6,0,.22,0,()=>box('corr',0,0,0,4.0,.03,2.6,P('rust')));box('earth',0,0,0,3.5,.04,3.1,0x5a4630);});
   place('pig',6.0,-5.2,.8,{mode:'idle',sub:'west'});place('pig',7.3,-6.0,2.6,{sub:'west'});
   FURNISH('job_sheaf_rack',-3.5,0,6.6,0,S);FURNISH('job_winnowing_tub',-7.8,0,1.6,0,S);isDrum(-1.3,0,-4.6,{col:'galv'});isScrapHeap(1.6,-8.2,0);isTarp([-2.45,2.3,-5.9],[-2.45,2.3,-3.3],[-.4,1.4,-3.3],[-.4,1.4,-5.9],.15,P('tarpG'));
   for(const z of [-5.8,-3.4])pole('wood',[-.4,0,z],[-.4,1.45,z],.05,P('wood'),6);});
  place('fl-taro',4.8,4.6,0,{});place('fl-taro',4.8,8.4,0,{v:1});place('fl-banana',-10.6,4.8,.5,{v:3});place('fl-banana',10.8,-.8,2,{v:4});place('fl-coconut',-9.4,-8.6,1.2,{v:5});
  for(const [x,z,r] of [[-2.2,1.8,.8],[-1.2,2.6,2.6]])place('hen',x,z,r,{sub:'west'});}});
/* ---------------------------------------------------------------- the granaries */
defBuilding({key:'iw-granary',name:'Rice barn (West)',seed:5310,cut:true,w:9,d:9,h:11,budget:80000,
 tags:{types:['farm'],wealth:'middle',style:'west',role:'granary',job:'farming'},
 note:'a rangkiang: the family\'s rice barn, a flared painted body on posts with rat guards under a gonjong roof, a hatch high in the front reached by a notched log; the pounding trough and a drying mat before it',
 build(o){iwRangkiang(0,-.6,0,{L0:3.2,D0:2.4,L1:4.2,D1:3.2,fy:1.9,wh:2.4,ridgeH:2.2,hornRise:2.6,hornOut:1.1});
  isNoCut(()=>{iwLesung(-.4,3.2,0);FURNISH('job_winnowing_mat',2.4,0,2.5,.3,{setting:'outdoor'});FURNISH('generic_sack',-2.9,0,1.5,.4,{setting:'outdoor'});});}});
defBuilding({key:'iw-granary-row',name:'Clan granaries (West)',seed:5311,cut:true,w:20,d:11,h:13,budget:180000,
 tags:{types:['farm','civic'],wealth:'rich',style:'west',role:'clan granary',job:'farming'},
 note:'the clan\'s three rangkiang on a stone terrace, the great one in the middle, each painted on its front and spiked with gonjong; the rice-pounding trough before them',
 build(o){box('stone',0,0,-.8,19,.4,7,P('stone'));W(0,.4,0,0,()=>{
  iwRangkiang(-6,-.8,0,{L0:2.8,D0:2.1,L1:3.7,D1:2.8,fy:1.6,wh:2.2,ridgeH:2,hornRise:2.2,hornOut:.9});
  iwRangkiang(0,-.8,0,{L0:3.6,D0:2.6,L1:4.8,D1:3.6,fy:2.1,wh:2.7,ridgeH:2.5,hornRise:3.0,hornOut:1.3});
  iwRangkiang(6,-.8,0,{L0:2.8,D0:2.1,L1:3.7,D1:2.8,fy:1.6,wh:2.2,ridgeH:2,hornRise:2.2,hornOut:.9});});
  isNoCut(()=>{for(const x of [-3,3])box('stone',x,0,3.3,1.6,.2,.8,P('stoneD'));iwLesung(0,4.2,0);});}});
/* ---------------------------------------------------------------- the windmill */
defBuilding({key:'iw-windmill',name:'Windmill (West)',seed:5320,cut:true,w:14,d:7.5,h:17.5,budget:150000,
 tags:{types:['industry'],wealth:'middle',style:'west',role:'miller',job:'milling'},
 note:'a windmill: a tarred timber trestle tower over the mill room, a horned cap, six woven-mat sails (one patched with canvas) on an axle facing the front, turning; the drive shaft down to the stones',
 build(o){const T=9.44,lg=(t,sx,sz)=>[sx*lerp(2.2,1.1,t),t*T,sz*lerp(2.2,1.1,t)];
  isNoCut(()=>{box('earth',0,0,0,4.2,.25,4.2,P('earth'));
   for(const sx of [-1,1])for(const sz of [-1,1]){sph('stone',sx*2.2,.06,sz*2.2,.34,P('stone'),.42,8);pole('tarred',lg(0,sx,sz),lg(1,sx,sz),.16,P('tarred'),8);}
   for(const t of [.36,.68,1])for(const s of [-1,1]){beam('wood',lg(t,-1,s),lg(t,1,s),.12,P('woodD'));beam('wood',lg(t,s,-1),lg(t,s,1),.12,P('woodD'));}
   for(const [a,b] of [[.36,.68],[.68,1]])for(const s of [-1,1]){beam('wood',lg(a,-1,s),lg(b,1,s),.08,P('wood'));beam('wood',lg(a,1,s),lg(b,-1,s),.08,P('wood'));
    beam('wood',lg(a,s,-1),lg(b,s,1),.08,P('wood'));beam('wood',lg(a,s,1),lg(b,s,-1),.08,P('wood'));}
   pole('wood',[0,.3,0],[0,T,0],.1,P('woodD'),8);
   W(0,0,-1.1,PI,()=>isLadder(0,0,0,T,{lean:1.25}));});
  /* the mill room under the tower, its thatch skirt */
  isWalls(3.6,3.6,.25,2.3,'planks',P('planks'),{front:[{x:0,w:1.1,h:1.9,door:true}],back:[],left:[{x:0,w:.7,y:.9,h:.6}],right:[{x:0,w:.7,y:.9,h:.6}]});
  isHip({hw:2.6,hd:2.6,eaveY:2.6,topY:3.7,topS:.62,topS2:.62,mk:'thatch',col:P('thatchW'),th:.2});
  FURNISH('generic_trade_grindstone',0,.25,-.2,0);FURNISH('generic_trade_bin',.6,.25,-1.45,0);FURNISH('job_winnowing_tub',1.15,.25,.95,0);
  for(const [x,z,r] of [[-1.3,-1.2,0],[-1.3,-.55,.3],[-.75,-1.35,.9]])FURNISH('generic_sack',x,.25,z,r);
  /* the cap: a deck, mat walls, a horned roof; the axle out to the hub */
  isCutFloor(T);box('planks',0,T-.14,0,3.0,.14,3.0,P('planks'));
  isWalls(2.4,2.4,T,1.7,'mat',P('bamboo'),{front:[{x:0,w:.5,y:.6,h:.55}],back:[{x:0,w:.6,h:1.4,door:true}],shut:false});
  const rf=isSaddle({L:2.6,W:2.6,eaveY:T+1.66,ridgeY:T+3.3,sag:.3,hornRise:1.3,hornOut:.6,taper:1,over:.45,th:.18,nu:16,mk:'thatch',col:P('thatchW')});
  for(const s of [-1,1])rf.gable(s*1.3,T+1.7,1.3,'patGableW',{});iwSpikes(rf,.7);
  const hy=T+.96;isNoCut(()=>{pole('wood',[0,hy,-.6],[0,hy,2.35],.12,P('woodD'),8);box('wood',0,hy-.35,1.6,.3,.25,.5,P('woodD'));});
  /* the sails: six woven-mat sails on spars, battened and roped, one patched with canvas; they turn about the axle */
  iwSpinner(0,hy,2.5,.55,()=>{WX(0,0,0,0,PI/2,0,()=>cyl('wood',0,-.25,0,.32,.5,P('woodD'),12));sph('carvedR',0,0,.28,.2,P('carvR'),1,10);
   for(let i=0;i<6;i++)WX(0,0,0,0,0,i/6*TAU,()=>{const zx=x=>.06+(x-.08)*.21;pole('wood',[0,.25,0],[0,6.3,0],.07,P('woodL'),6);
    psurf('mat',(u,v)=>{const x=.08+u*1.35;return [x,1.1+v*5.0,zx(x)];},3,6,P('bamboo'));
    for(let j=0;j<5;j++){const y=1.1+j*1.25;pole('bamboo',[0,y,.02],[1.45,y,zx(1.45)+.02],.025,P('woodL'),4);}
    cord('rope',[[1.43,1.1,zx(1.43)],[1.43,6.1,zx(1.43)],[0,6.3,0]],.015,P('rope'));
    if(i===2||i===5)psurf('tarp',(u,v)=>{const x=.45+u*.7;return [x,2.5+v*1.4+(i===5?1.6:0),zx(x)+.025];},1,1,P(i===2?'tarpO':'tarpB'));});});
  isNoCut(()=>{const S={setting:'outdoor'};FURNISH('generic_sack',-1.4,0,3.0,.2,S);FURNISH('generic_sack',-2.0,0,2.7,.9,S);FURNISH('job_winnowing_mat',2.4,0,3.0,0,S);});}});
/* ---------------------------------------------------------------- the warehouse */
defBuilding({key:'iw-warehouse',name:'Warehouse (West)',seed:5330,cut:true,w:11.5,d:22,h:11.5,budget:150000,
 tags:{types:['industry'],wealth:'middle',style:'west',role:'warehouse',job:'warehousing'},
 note:'the village warehouse: a long plank storehouse on low piles, its gable to the street with wide doors onto a loading deck under a hoist beam, the roof mended in places with iron; crates, sacks, barrels and bales inside',
 build(o){const fy=.9;iwHouse({gableFront:true,L:14,D:7,floorY:fy,wallH:3.0,roof:{ridgeH:3.4,sag:.8,hornRise:2.2,hornOut:1.2,taper:.5,over:.9,p:4,concave:.3,patch:.25,th:.3},
  lean:.06,wallMk:'planks',wallCol:P('tarred'),band:'patBand',bandH:.34,dado:false,right:[{x:0,w:2.4,h:2.6,door:true}],left:[{x:0,w:1.6,h:2.2,door:true}],
  front:[{x:-4,w:.7,y:2.2,h:.4},{x:0,w:.7,y:2.2,h:.4},{x:4,w:.7,y:2.2,h:.4}],back:[{x:-4,w:.7,y:2.2,h:.4},{x:0,w:.7,y:2.2,h:.4},{x:4,w:.7,y:2.2,h:.4}],stair:'none',finial:'spike',
  extra:()=>{isNoCut(()=>{isPiles([7.4,9.8],isSpan(-3.1,3.1,3),fy-IS_T,{r:.14,mk:'tarred',col:P('tarred'),beamY:.45});isDeck(3,7,fy,{x:8.5,beam:false});isStair(10,0,PI/2,0,fy,2.4);
    beam('wood',[6.4,6.1,0],[8.9,6.1,0],.2,P('woodD'));pole('rope',[8.7,6.0,0],[8.7,2.4,0],.02,P('rope'),4);sph('wood',8.7,2.35,0,.1,P('woodD'),1,6);box('tarp',8.7,1.7,0,.7,.65,.7,P('tarpG'));});
   const F=(k,x,z,ry,y)=>FURNISH(k,x,fy+(y||0),z,ry||0);
   [-5.6,-4.8,-4.0,-3.2].forEach((x,i)=>{F('generic_crate',x,-2.95,0);if(i<3)F('generic_crate',x+.1,-2.95,.12,.42);});
   for(const x of [-1.8,-1.0,-.2])F('generic_barrel',x,-2.85,0);for(let i=0;i<6;i++)F('generic_sack',-5.6+i*.55,2.95,PI+i*.3);
   for(const x of [1.4,2.6])for(const s of [-1,1])F('job_bales',x,s*2.7,0);F('generic_trade_bin',4.8,-2.9,0);F('generic_barrel',4.6,2.85,0);}});}});
/* ---------------------------------------------------------------- the smithy */
defBuilding({key:'iw-smithy',name:'Smithy (West)',seed:5340,cut:true,w:12,d:9,h:9,budget:120000,
 tags:{types:['industry','shop'],wealth:'middle',style:'west',role:'smith',job:'smithing'},
 note:'the smithy: an open-fronted shed on carved posts under a horned roof mended with iron, a stone-footed back wall, the forge under an iron hood with its chimney through the roof, the Malay piston bellows, the anvil, the grindstone, the quench trough and the weapon rack',
 build(o){const fy=.15;box('earth',0,0,0,8.2,fy,6.6,P('earth'));
  /* the walls: a stone footing and tarred boards behind, low stone walls at the sides, the front open */
  box('stone',0,fy,-3.05,7.6,1.1,.45,P('stoneD'));box('planks',0,fy+1.1,-3.05,7.6,1.35,.12,P('tarred'));
  for(const s of [-1,1])box('stone',s*3.75,fy,-.4,.45,.95,5.3,P('stoneD'));
  for(const x of [-3.6,0,3.6])cyl('tarred',x,fy,-2.9,.13,2.45,P('tarred'),8);for(const s of [-1,1])isPou(s*3.6,fy,2.9,2.45,.15,{mk:'carvedR',n:2});cyl('tarred',0,fy,2.9,.13,2.45,P('tarred'),8);
  for(const s of [-1,1])box('wood',0,2.4,s*2.9,7.6,.22,.2,P('woodD'));
  const rf=isSaddle({L:7.4,W:6,eaveY:2.6,ridgeY:5.2,sag:.6,hornRise:2,hornOut:1,taper:.7,over:.8,th:.24,patch:.45,nu:24,mk:'thatch',col:P('thatchW')});
  for(const s of [-1,1])rf.gable(s*3.7,2.6,3,'patGableW',{});iwSpikes(rf,.8);
  /* the forge, its iron hood and chimney; the piston bellows (two bamboo cylinders and their plungers) and the tuyere */
  FURNISH('generic_trade_forge',-2.2,fy,-2.2,0);W(-2.2,0,-2.2,0,()=>isHip({hw:1.0,hd:.8,eaveY:2.45,topY:3.25,topS:.22,topS2:.26,mk:'corr',col:P('rust'),th:.04,cap:false}));
  cyl('tin',-2.2,3.1,-2.2,.18,3.2,P('tin'),10);cone('tin',-2.2,6.3,-2.2,.32,.3,P('tin'),10);smokeAt(-2.2,6.5,-2.2,{r:.2});
  for(const z of [-1.2,-.75]){cyl('bamboo',-3.35,fy,z,.13,1.4,P('bamboo'),10);pole('wood',[-3.35,fy+1.4,z],[-3.35,fy+2.1,z],.03,P('woodL'),5);sph('wood',-3.35,fy+2.12,z,.06,P('bark'),1,6);}
  beam('bamboo',[-3.35,fy+.25,-1.0],[-2.4,fy+.6,-1.8],.06,P('bamboo'),true,6);
  FURNISH('generic_trade_anvil',-.2,fy,-.4,.3);FURNISH('generic_trade_grindstone',2.5,fy,1.0,-PI/2);FURNISH('generic_trade_weapon_rack',2.0,fy,-2.65,0);
  FURNISH('generic_trade_trough',-1.4,fy,.95,0);FURNISH('islander_common_workbench',3.1,fy,-.9,-PI/2);
  isNoCut(()=>{const S={setting:'outdoor'};FURNISH('generic_sack',-4.6,0,1.6,.4,S);FURNISH('generic_sack',-4.8,0,2.3,1.2,S);iwWoodpile(4.9,1.4,PI/2,9,1.6);isDrum(4.7,0,-1.6,{col:'galv'});});
  door(0,fy,3.2,0,3.0);}});
/* ---------------------------------------------------------------- the shops */
defBuilding({key:'iw-market',name:'Market hall (West)',seed:5350,cut:true,w:24,d:13.5,h:12,budget:200000,
 tags:{types:['market','shop'],wealth:'middle',style:'west',role:'market',job:'trading'},
 note:'the market hall (a pasar): a long open hall of posts under a sweeping horned roof, a crossing gable spiked front and back over the carved entrance, stalls, displays and the weighing counter within, tarp awnings at both ends',
 build(o){const fy=.18;box('earth',0,0,0,17.4,fy,8.6,P('earth'));
  iwPavilion({L:16.4,W:7.6,eaveY:2.9,y0:fy,ridgeH:3.5,nx:6,carved:(x,z)=>z>0&&Math.abs(x)<2,pr:.15,roof:{sag:1,hornRise:2.8,hornOut:1.6,over:1,th:.3,nu:36}});
  W(0,0,0,PI/2,()=>{const r2=isSaddle({L:9,W:4.6,eaveY:3.5,ridgeY:7.8,sag:.5,hornRise:2.4,hornOut:1.2,taper:1,over:.6,th:.28,nu:24,mk:'thatch',col:P('thatchW')});
   for(const s of [-1,1]){r2.gable(s*4.5,3.5,2.3,'patGableW',{});box('carvedR',s*4.5,3.25,0,.3,.3,4.9,P('carvR'));}iwSpikes(r2);});
  isNoCut(()=>{for(const s of [-1,1])for(const z of [-4.5,4.5])isPou(s*2.3,fy,z,3.07,.14,{mk:'carvedR',n:2,ry:z>0?0:PI});});
  const F=(k,x,z,ry,y)=>FURNISH(k,x,fy+(y||0),z,ry||0);
  for(const x of [-6.6,-4.0,4.0,6.6])F('generic_trade_stall',x,-2.2,0);F('islander_common_counter',0,-2.8,0);F('generic_fish',-.5,-2.8,0,1.05);F('generic_produce',.5,-2.8,0,1.05);
  for(const s of [-1,1])F('generic_trade_display',s*5.3,2.5,PI);F('generic_basket',-1.5,1.7,0);F('generic_veg_basket',1.5,1.7,0);F('generic_floor_basket',-7.4,1.6,0);
  isNoCut(()=>{for(const s of [-1,1]){isTarp([s*8.3,2.5,-1.6],[s*8.3,2.5,1.6],[s*11.1,2.0,1.6],[s*11.1,2.0,-1.6],.2,P(s<0?'tarpB':'tarpO'));
   for(const z of [-1.6,1.6])pole('wood',[s*11.1,0,z],[s*11.1,2.05,z],.05,P('wood'),6);FURNISH('generic_trade_display',s*9.8,0,0,s>0?-PI/2:PI/2,{setting:'outdoor'});}
   isFlag(-9.6,4.4,6.5,{});});
  door(0,fy,4.6,0,3.0);}});
defBuilding({key:'iw-kava',name:'Kava house (West)',seed:5351,cut:true,w:14,d:12,h:11,budget:150000,
 tags:{types:['tavern'],wealth:'middle',style:'west',role:'kava house',job:'brewing'},
 note:'the kava house, where the men drink in the evening: a house on low piles with a horned porch hung with lamps, its band painted with stories; inside the kava bowls on mats, benches round the walls, the barrel rack and the serving counter',
 build(o){const fy=.9;iwHouse({L:9,D:6,floorY:fy,wallH:2.3,roof:{ridgeH:3.2,sag:.9,hornRise:2.4,hornOut:1.2,taper:.8,over:.9,th:.3},band:'patStory',bandH:.5,
  front:[{x:0,w:1.2,h:1.9,door:true},{x:-2.9,w:1.4,y:.7,h:1.0},{x:2.9,w:1.4,y:.7,h:1.0}],back:iwOpen(9,2,false),left:[{x:.6,w:.8,y:.8,h:.8}],right:[{x:.6,w:.8,y:.8,h:.8}],
  porch:{w:3.4,d:2.4},stair:'stair',stairW:1.2,finial:'horns',
  extra:()=>{const F=(k,x,z,ry,y)=>FURNISH(k,x,fy+(y||0),z,ry||0);
   F('islander_common_counter',-2.6,-2.5,0);F('generic_trade_barrel',2.6,-2.55,0);F('generic_keg',-3.2,-2.5,0,1.05);F('islander_common_jug',-2.2,-2.5,0,1.05);
   for(const s of [-1,1]){F('islander_common_rug',s*1.6,.5,0);F('islander_common_kava_bowl',s*1.6,.5,0,.03);F('islander_common_bench',s*4.05,.4,s<0?PI/2:-PI/2);
    FURNISH_HANG('islander_common_hanging',s*2.2,fy+2.3+.9,.3,0);F('islander_common_bowl',s*1.6+.55,.95,0,.03);}
   isNoCut(()=>{for(const s of [-1,1])isLamp(s*1.35,3.0,3+2.2,{});});}});
  isNoCut(()=>{FURNISH('islander_common_bench',-3.9,0,4.6,0,{setting:'outdoor'});FURNISH('islander_common_bench',3.9,0,4.6,0,{setting:'outdoor'});FURNISH('generic_barrel',5.4,0,2.6,0,{setting:'outdoor'});});}});
defBuilding({key:'iw-shophouse',name:"Trader's shophouse (West)",seed:5352,cut:true,w:15,d:11,h:13.5,budget:180000,
 tags:{types:['shop','dwelling-single'],wealth:'rich',style:'west',role:'trader',job:'trading'},
 note:'a trader\'s shophouse (rich on the sea\'s plunder): the shop below behind awning shutters propped open over the goods, a painted signboard with the moon, the family\'s rooms above under a two-spiked roof',
 build(o){const fy=.3,up=fy+2.75;iwHouse({L:9,D:6.4,floorY:fy,wallH:5.4,roof:{ridgeH:3.6,sag:1,hornRise:3,hornOut:1.4,taper:1,over:.9,th:.32},band:'patGableW',bandH:.45,dado:false,
  wallMk:'planks',front:[{x:0,w:1.2,h:2.2,door:true},{x:-3.0,w:2.2,y:.8,h:1.4},{x:3.0,w:2.2,y:.8,h:1.4},{x:-3.0,w:.8,y:3.3,h:.9},{x:0,w:.8,y:3.3,h:.9},{x:3.0,w:.8,y:3.3,h:.9}],
  back:[{x:-2,w:.7,y:.9,h:.7},{x:2,w:.7,y:3.4,h:.8}],left:[{x:0,w:.7,y:3.4,h:.8}],right:[{x:0,w:.7,y:3.4,h:.8}],shutMk:'patBand',shutCol:WHITE,stair:'none',finial:'spike',
  extra:()=>{/* the upper floor with a stairwell along the back wall (it had no way up: stair 'none' and a catalog ladder through a closed slab) */
   for(const [cx,cz,w,d] of [[0,.675,8.8,4.85],[2.3,-2.425,4.2,1.35],[-3.9,-2.425,1.0,1.35]])box('planks',cx,up,cz,w,.12,d,P('planks'));
   isStair(0,-2.35,-PI/2,fy,up+.12,1.1,{rail:false});
   isNoCut(()=>{for(const s of [-1,1]){WX(s*3.0,fy+2.25,3.25,0,.32,0,()=>{box('planks',0,0,.62,2.5,.05,1.25,P('planks'));});pole('wood',[s*3.0-1.1,fy,4.2],[s*3.0-1.1,fy+1.86,4.39],.03,P('woodD'),5);pole('wood',[s*3.0+1.1,fy,4.2],[s*3.0+1.1,fy+1.86,4.39],.03,P('woodD'),5);}
    box('patStory',0,fy+2.5,3.27,3.2,.5,.05,WHITE);isMoonDisc(0,fy+2.75,3.33,0,.32);});
   const F=(k,x,z,ry,y)=>FURNISH(k,x,fy+(y||0),z,ry||0);
   for(const s of [-1,1])F('islander_common_wall_shelves',s*2.5,-2.98,0);F('islander_common_counter',-2.4,.5,0);F('generic_strongbox',-2.9,.5,0,1.05);F('generic_trade_display',2.6,.8,0);
   F('generic_crate',3.85,-1.4,-PI/2);F('generic_crate',3.85,-1.4,-PI/2+.15,.42);F('generic_sack',-3.9,-1.3,.4);
   isFurnRoom(8.4,6.0,up+.06,'middle',{ceil:2.6,beds:2});}});
  isNoCut(()=>{const S={setting:'outdoor'};FURNISH('generic_crate',-5.4,0,3.4,.2,S);FURNISH('generic_crate',-5.3,.42,3.4,.5,S);FURNISH('generic_barrel',5.4,0,3.6,0,S);FURNISH('generic_bottle_crate',5.4,0,2.5,.3,S);isDrum(-5.6,0,1.8,{col:'drumY'});});}});
defBuilding({key:'iw-weaver',name:"Weaver's house (West)",seed:5353,cut:true,w:14,d:11,h:9,budget:120000,
 tags:{types:['shop','dwelling-single'],wealth:'poor',style:'west',role:'weaver',job:'weaving'},
 note:'the weaver\'s and tapa maker\'s house: a mat-walled house on bamboo stilts under palm thatch, looms inside; outside the bark cloth hangs drying on lines and a beating log waits with its mallet',
 build(o){const fy=1.4;iwHouse({L:7,D:5,floorY:fy,wallH:2.1,pileMk:'bamboo',pileR:.11,roof:{ridgeH:2.6,sag:.7,hornRise:1.8,hornOut:.8,taper:.6,over:.7,mk:'palm',col:P('palmL'),th:.2,patch:.12},
  thatchKey:'palmL',wallMk:'mat',wallCol:P('bamboo'),gableMk:'patBand',gableCol:WHITE,front:iwOpen(7,2),back:iwOpen(7,1,false),stair:'ladder',finial:'none',
  extra:()=>{const F=(k,x,z,ry,y)=>FURNISH(k,x,fy+(y||0),z,ry||0);
   F('islander_common_loom',-1.9,-1.4,0);F('islander_common_loom',.6,-1.4,0);F('islander_common_stool',-1.9,-.3,PI);F('islander_common_stool',.6,-.3,PI);
   F('islander_common_store',2.75,-1.6,-PI/2);F('islander_common_rug',0,1.1,0);F('generic_basket',-2.9,1.4,0);F('generic_sewing',.4,1.1,0,.03);}});
  isNoCut(()=>{for(const z of [-3,3])pole('wood',[6.0,0,z],[6.0,2.4,z],.06,P('wood'),6);cord('rope',[[6.0,2.3,-3],[6.0,2.2,0],[6.0,2.3,3]],.012,P('rope'));
   withCloth(clothHang(1.4,.06),()=>{for(const [z0,z1,c] of [[-2.7,-1.2,'white'],[-.9,.7,'sand'],[1.0,2.6,'white']])W(6.02,2.25,0,0,()=>psurf('tapa',(u,v)=>[0,-v*1.45,lerp(z0,z1,u)],4,4,P(c)));});
   beam('wood',[-5.6,.2,2.0],[-5.6,.2,3.8],.17,P('wood'),true,8);beam('wood',[-5.2,.42,2.6],[-4.6,.1,3.4],.03,P('woodL'),true,5);box('wood',-5.25,.4,2.55,.12,.12,.3,P('woodD'));
   W(-3.6,0,3.6,.2,()=>psurf('tapa',(u,v)=>[(u-.5)*1.6,.02,(v-.5)*1.2],2,2,P('white'),{up:true}));});}});
defBuilding({key:'iw-potter',name:"Potter's yard (West)",seed:5354,cut:true,w:13.5,d:10,h:7,budget:100000,
 tags:{types:['shop','industry'],wealth:'poor',style:'west',role:'potter',job:'pottery'},
 note:'the potter\'s yard: a low shed patched with iron, the workbench and shelves of pots inside; outside the kiln under a tin lean-to, the firewood, the clay pit and rows of jars drying',
 build(o){const fy=.3;W(-2.5,0,-1,0,()=>iwHouse({L:5.6,D:4,floorY:fy,wallH:2.2,roof:{ridgeH:2,sag:.5,hornRise:1.2,hornOut:.6,taper:.5,over:.6,patch:.6,th:.15},thatchKey:'thatchP',
  wallMkf:s=>s==='front'?'reclaimed':s==='right'?'corrW':'bamboo',wallColf:s=>s==='front'?P('planks'):s==='right'?P('rust'):P('bamboo'),gableMk:'reclaimed',gableCol:P('planks'),
  front:[{x:-.4,w:1.4,h:1.9,door:true},{x:1.8,w:.8,y:.9,h:.7}],back:[{x:1,w:.6,y:1,h:.5}],doorX:-.4,stair:'none',finial:'none',
  extra:()=>{const F=(k,x,z,ry,y)=>FURNISH(k,x,fy+(y||0),z,ry||0);
   F('generic_poor_workbench',-1.5,-1.5,0);F('generic_poor_bowl',-1.8,-1.5,0,.9);F('generic_poor_wall_shelves',1.2,-1.8,0);F('generic_poor_stool',-1.5,-.6,PI);
   F('generic_storage_jar',2.4,.3,0);F('generic_storage_jar',2.4,1.0,.6);F('generic_crock',1.7,1.2,0);}}));
  isNoCut(()=>{const S={setting:'outdoor'};FURNISH('generic_trade_kiln',4.4,0,-1.6,0,S);smokeAt(4.4,2.2,-1.6,{r:.3});
   for(const [x,z] of [[3.0,-3.0],[6.0,-3.0],[3.0,.4],[6.0,.4]])cyl('wood',x,0,z,.06,z<0?2.6:2.0,P('wood'),6);
   WX(4.5,2.32,-1.3,0,-.17,0,()=>box('tin',0,0,0,3.6,.03,3.9,P('tin')));iwWoodpile(4.6,1.6,0,10,1.8);
   for(let i=0;i<5;i++)FURNISH('generic_storage_jar',-4.6+i*.55,0,2.6,i*.7,S);for(let i=0;i<3;i++)FURNISH('generic_crock',-1.6+i*.4,0,2.8,0,S);
   box('earth',-5.6,0,-.2,1.6,.06,1.8,0x6e5236);box('water',-5.6,.02,-.2,1.1,.06,1.2,0x5a5a48);isDrum(1.8,0,2.4,{col:'galv'});});}});
defBuilding({key:'iw-chandler',name:"Boat-chandler's (West)",seed:5355,cut:true,w:12,d:11,h:9,budget:120000,
 tags:{types:['shop'],wealth:'poor',style:'west',role:'chandler',job:'trading'},
 note:'the boat-chandler\'s, half shop and half store for the raiders: a scrap-mended house on stilts, under it coils of rope, oars, stone anchors and drums of oil; inside the counter, the rack of gear and the shelves',
 build(o){const fy=1.5;iwHouse({L:7.4,D:4.6,floorY:fy,wallH:2.1,roof:{ridgeH:2.3,sag:.6,hornRise:1.6,hornOut:.8,taper:.7,over:.6,patch:.55,th:.18},thatchKey:'thatchP',
  wallMkf:s=>s==='front'?'reclaimed':s==='left'?'corrW':'planks',wallColf:s=>s==='front'?P('planks'):s==='left'?P('rust'):P('planks'),gableMk:'reclaimed',gableCol:P('planks'),
  front:[{x:-1.6,w:1.0,h:1.8,door:true},{x:1.4,w:1.6,y:.8,h:.9}],back:[{x:1.2,w:.6,y:.9,h:.6}],doorX:-1.6,stair:'stair',stairW:.9,finial:'none',
  extra:()=>{const F=(k,x,z,ry,y)=>FURNISH(k,x,fy+(y||0),z,ry||0);
   F('islander_common_counter',1.3,.6,0);F('islander_common_rack',-2.4,-1.95,0);F('islander_common_wall_shelves',1.1,-2.05,0);F('generic_crate',-3.2,.6,PI/2);
   F('generic_barrel',3.0,-1.5,0);F('generic_lamp_oil',1.6,.6,0,1.05);F('generic_fuel',-3.1,-.6,PI/2);}});
  isNoCut(()=>{const S={setting:'outdoor'};
   for(const [x,z] of [[-2.2,-.6],[-1.2,-.4],[2.4,.4]])for(let k=0;k<4;k++)ring('rope',x,.08+k*.1,z,.42-k*.04,.06,P('rope'),0,0,0,18);
   for(let i=0;i<4;i++)W(3.0+i*.22,0,-1.6,0,()=>{beam('wood',[0,0,.5],[0,2.4,0],.035,P('woodL'),true,5);box('wood',0,.05,.42,.16,.7,.03,P('woodL'),0,-.2);});
   for(const x of [-3.0,-.2]){sph('stone',x,.22,1.2,.28,P('stoneD'),.8,8);ring('rope',x,.48,1.2,.1,.03,P('rope'),0,PI/2,0,10);}
   FURNISH('job_oil_drum_rack',2.2,0,4.4,0,S);FURNISH('generic_barrel',-4.6,0,3.0,0,S);FURNISH('job_net_frame',-4.7,0,-.6,PI/2,S);
   pole('wood',[4.9,0,2.6],[4.9,2.6,2.6],.05,P('woodD'),6);box('reclaimed',4.9,2.0,2.65,1.2,.5,.04,P('planks'));isMoonDisc(4.9,2.25,2.69,0,.18);});}});
