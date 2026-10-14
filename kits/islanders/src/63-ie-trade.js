// prefix: ie
// ================================================================= KAUTOA'S TRADE: farms, granaries, the windmill, the warehouse, the smithy, the shops
// The working buildings of the East, in the houses' manner (60-ie-east.js) and with the civic helpers (62-ie-civic.js:
// ieRoofE, ieShed, ieCutWith, ieFurn): the farmsteads (a family uma with its granary, buffalo pen, paddies, pigs and
// fowl; a poor smallholding mended with scrap), the granaries (raised on posts with rat guards, under a spire), a windmill
// whose woven sails turn (IE_MILLS below), the warehouse on piles, the smithy (an open forge shed that works salvage iron),
// and the shops: the market hall, the palm-wine and kava house, the trader's shop, the ikat weaver (Sumba's hinggi), the
// potter and the chandler. Plants are fl-* defs and animals the fauna kit's, placed with place(..., {sub:'east'}).
// Frame: origin on the ground at the plot centre, +z the front.
/* ---------------------------------------------------------------- the granary */
/* a granary raised on posts: footing stones, a rat guard (a wide wooden disc rats cannot climb past) on every post under the
   floor, the woven store, the East's roof. o: s (the store's half-size), py (its floor), wh (its walls), n (posts a side),
   carved, wallMk, facade (woven panels on its front), roof (ieRoofE's options), ladder 'log' | 'ladder' | 'none'. */
function ieGranary(o){const s=o.s||1.3,py=o.py||1.9,wh=o.wh||1.4,n=o.n||2,ov=o.ov||.55,top=py+wh,xs=isSpan(-s+.18,s-.18,n);
 isNoCut(()=>{for(const x of xs)for(const z of xs){sph('stone',x,.06,z,.32,P('stone'),.42,8);
   if(o.carved)isPou(x,0,z,py-IS_T,.15,{mk:'carved',n:1});else cyl('wood',x,0,z,.13,py-IS_T,P('wood'),8);
   cyl('wood',x,py-.62,z,.42,.06,P('woodD'),14);}
  for(const z of xs)box('wood',0,py-.42,z,2*s,.2,.2,P('woodD'));
  if(o.ladder==='ladder')isLadder(0,s+.12,0,py,{});else if(o.ladder!=='none')isLogLadder(0,s+.12,0,py);});
 isCutFloor(py);
 isDeck(2*s+.4,2*s+.4,py,{col:P('planks'),beam:false});
 isWalls(2*s,2*s,py,wh,o.wallMk||'bamboo',o.wallMk==='planks'?P('planks'):P('bamboo'),{front:[{x:0,w:.7,h:Math.min(1.2,wh-.15),door:true}],back:[],left:[],right:[],frame:P('woodD')});
 if(o.facade)W(0,0,s+.07,0,()=>{for(const k of [-1,1])box(o.facade,k*(s/2+.25),py+.08,0,s-.6,wh-.2,.02,WHITE);});
 ieRoofE(Object.assign({hw:s+ov,hd:s+ov,eY:top-.05,skirtH:.8,skirtS:.56,towerH:2.6,towerS:.52,topSx:.22,topSz:.06,sq:6,th:.22,finial:'none'},o.roof||{}));
 return {py,top};}
defBuilding({key:'ie-granary',name:'Granary (Kautoa)',seed:6203,cut:true,w:4.6,d:4.6,h:7.4,budget:60000,
 tags:{types:['farm'],wealth:'middle',style:'east',job:'farming',role:'granary'},
 note:'a family granary: a woven store raised on four posts with wooden rat guards, a little spire of golden thatch, a notched log for a ladder; sacks, jars and baskets of rice inside',
 build(o){const g=ieGranary({});
  ieFurn([['generic_sack',-.7,g.py,-.8,.2],['generic_sack',-.2,g.py,-.85,-.3],['generic_sack',.35,g.py,-.85,.5],['generic_storage_jar',.8,g.py,-.4,0],['generic_basket',-.8,g.py,.35,0],['generic_floor_basket',.75,g.py,.4,.6]]);}});
defBuilding({key:'ie-granary-great',name:'Village granary (Kautoa)',seed:6204,cut:true,w:7.2,d:7.4,h:12.8,budget:90000,
 tags:{types:['farm','civic'],wealth:'rich',style:'east',job:'farming',role:'village granary'},
 note:'the village\'s great granary: a store woven in nested diamonds on nine carved posts with rat guards, a tall spire with horns on its ridge; bins, sacks and jars of the harvest',
 build(o){const g=ieGranary({s:2.6,py:2.3,wh:1.9,n:3,carved:true,facade:'patGableE',roof:{skirtH:1.3,skirtS:.55,towerH:6,towerS:.42,topSx:.2,topSz:.05,th:.26,finial:'horns',facade:'patGableE'}});
  const y=g.py;ieFurn([['generic_trade_bin',-2.0,y,-1.1,PI/2],['generic_trade_bin',2.0,y,-1.1,-PI/2],['generic_storage_jar',-.4,y,-2.1,0],['generic_storage_jar',.1,y,-2.1,.4],['generic_storage_jar',.6,y,-2.1,.9],
   ['generic_basket',-1.9,y,1.4,0],['generic_floor_basket',1.9,y,1.4,0]]);
  for(const [x,z] of [[-1,-.6],[-.5,-.4],[0,-.7],[.5,-.5],[1,-.6],[-.7,.2],[.7,.3]])FURNISH('generic_sack',x,y,z,rr(-.5,.5));}});
/* ---------------------------------------------------------------- the farms */
defBuilding({key:'ie-farm',name:'Farmstead (Kautoa)',seed:6201,cut:true,w:33,d:30.5,h:13,budget:220000,
 tags:{types:['farm','dwelling-single'],wealth:'middle',style:'east',job:'farming',role:'farmstead'},
 note:'a Kautoan farmstead: the family uma at the back with its tomb, a raised granary, a buffalo pen with its wallow and trough, two rice paddies before the house with ducks on the bunds, taro, bananas and coconut palms, pigs and hens in the yard, the sheaf rack and the winnowing tub',
 build(o){
  ieCutWith(-8,-7,1.5,()=>W(-8,0,-7,0,()=>ieHouse({w:5.4,d:4.6,floorY:1.5,wallH:2.0,ver:.8,verFront:1.4,roof:{over:.7,skirtH:1.3,skirtS:.5,towerH:5.4,towerS:.42,topSx:.2,topSz:.05},
   wallMk:'mat',facade:'patWeave',towerFacade:false,stair:'stair',finial:'figure',tier:'middle',underPig:true,tombs:[[2.6,4.8,0,.7,false]],furn:[['job_winnowing_tub',1.6,.8,0]]})));
  place('ie-granary',1.5,-9,0,{});
  isNoCut(()=>{
   /* the buffalo pen: a bamboo fence with a gate gap, the wallow, the trough and the hay */
   const px=10.5,pz=-7.5,pw=8,pd=6;
   for(const [x,z,ry,L] of [[px,pz-pd/2,0,pw],[px-pw/2,pz,PI/2,pd],[px+pw/2,pz,PI/2,pd],[px-pw/4-1,pz+pd/2,0,pw/2-2],[px+pw/4+1,pz+pd/2,0,pw/2-2]])W(x,0,z,ry,()=>isFenceRun(L,1.3));
   box('earth',px+1.5,0,pz-1.2,3.4,.03,2.2,0x5a4630);box('water',px+1.5,.02,pz-1.2,2.6,.03,1.5,0x4a5a44);});
  FURNISH('generic_trade_trough',7.4,0,-6,PI/2,{setting:'outdoor'});FURNISH('generic_trade_hayrack',13.4,0,-9.9,0,{setting:'outdoor'});
  place('buffalo',10,-6.6,.5,{mode:'idle',sub:'east',activity:'REST'});
  /* the paddies before the house, the gardens and the palms */
  place('fl-paddy',-7.5,8.6,0,{});place('fl-paddy',3.6,8.6,0,{});place('fl-taro',12.6,7.4,0,{});
  place('fl-banana',-14,-1,0,{});place('fl-banana',-13.6,3.2,1,{});place('fl-coconut',-11.5,-11.5,0,{});place('fl-coconut',12.6,1.5,0,{});
  /* the stock and the work of the yard */
  for(const [k,x,z,r] of [['duck',-2,12.4,1],['duck',1.6,9.2,2.2],['duck',-1.9,5,4],['hen',-1.4,-2.2,1],['hen',-.4,-1.4,2.4],['hen',5.6,-3.4,.6],['pig',4.6,-4.6,2]])place(k,x,z,r,{sub:'east'});
  ieFurn([['job_sheaf_rack',5.6,0,-11.6,0,{setting:'outdoor'}],['job_winnowing_mat',.5,0,-4.2,.3,{setting:'outdoor'}],['job_winnowing_tub',-1.2,0,-4.8,0,{setting:'outdoor'}],
   ['generic_floor_basket',1.6,0,-5.0,0,{setting:'outdoor'}],['generic_floor_basket',2.1,0,-4.4,.8,{setting:'outdoor'}]]);}});
defBuilding({key:'ie-farm-poor',name:'Smallholding (Kautoa)',seed:6202,cut:true,w:26,d:24,h:14.5,budget:150000,
 tags:{types:['farm','dwelling-single'],wealth:'poor',style:'east',job:'farming',role:'smallholding'},
 note:'a poor smallholding: a low hut whose skirt is half corrugated iron held down by tyres, walls of salvage, a pig pen of scrap sheets, a little granary, taro beds, bananas and a palm, hens, a drum for water',
 build(o){
  ieCutWith(-4,-5,.9,()=>W(-4,0,-5,0,()=>ieHouse({w:4.0,d:3.4,floorY:.9,wallH:1.9,ver:.4,verFront:1.1,posts:'plain',
   roof:{over:.5,skirtH:1.3,skirtS:.46,towerH:2.6,towerS:.4,topSx:.26,topSz:.06,mk:'thatch',col:P('thatchP'),patch:.55,th:.16},
   wallMkf:s=>s==='front'?'bamboo':s==='back'?'reclaimed':s==='left'?'corrW':'tin',wallColf:s=>s==='front'?P('bamboo'):s==='back'?P('planks'):s==='left'?P('rust'):P('tin'),
   stair:'log',finial:'none',tier:'poor',beds:1,furn:[['scrap_poor_stool',.6,.7,0]],extra:(top)=>{for(const [x,z] of [[.9,-.6],[-1.1,.4]])isTyre(x,top+.62,z);}})));
  ieCutWith(-9.5,4,1.4,()=>W(-9.5,0,4,0,()=>{const g=ieGranary({s:.9,py:1.4,wh:1.1,ov:.45,roof:{skirtH:.6,towerH:1.5,towerS:.5,mk:'thatch',col:P('thatchP'),patch:.4,th:.14}});
   FURNISH('generic_sack',-.3,g.py,-.3,.3);FURNISH('generic_sack',.3,g.py,-.35,-.2);}));
  isNoCut(()=>{
   /* the pig pen: sheets of salvage on posts, a tarp over one corner */
   const px=5.5,pz=-5;for(const [x,z,ry,L] of [[px,pz-2,0,4.4],[px-2.2,pz,PI/2,4],[px+2.2,pz,PI/2,4],[px+1.2,pz+2,0,2]])W(x,0,z,ry,()=>isPatchWall(L,0,1.0,{}));
   isTarp([px+.6,1.5,pz-2],[px+2.2,1.5,pz-2],[px+2.2,1.0,pz-.4],[px+.6,1.0,pz-.4],.12,P('tarpB'));
   isDrum(-1.2,0,-1.6,{col:'galv'});isDrum(-.6,0,-2.1,{col:'drumR'});isScrapHeap(9.5,2,-PI/2);
   W(0,0,8.2,0,()=>isFenceRun(16,1.0));});
  place('pig',5.2,-5.5,.4,{sub:'east'});place('pig',6.2,-4.2,2,{sub:'east'});
  place('fl-taro',2.2,4,0,{});place('fl-taro',7,4,.1,{});place('fl-banana',-10.5,-4.5,0,{});place('fl-banana',9.6,-9.4,2,{});place('fl-coconut',-9.8,-9.8,0,{});
  place('hen',.6,.8,1,{sub:'east'});place('hen',1.4,1.6,2.6,{sub:'east'});
  ieFurn([['job_winnowing_mat',-1.4,0,1.6,.2,{setting:'outdoor'}],['job_sheaf_rack',-4,0,4.4,0,{setting:'outdoor'}],['generic_poor_bench',-6.6,0,-1.8,0,{setting:'outdoor'}]]);}});
/* ---------------------------------------------------------------- the windmill: its sails turn */
/* IE_MILLS: each mill's sails, drawn into their own buckets in the hub's frame (ieMillSails), flushed after the world is built
   into a pivot group at the hub (ieMillFlush, wrapped round buildWorld like 91f-furnish.js's furniture pass), and turned
   every frame about the hub's axis (its local z) with a YXZ Euler: the mill's yaw, the shaft's tilt, then the spin. */
const IE_MILLS=[];
function ieMillSails(speed,fn){const B={},keep=GTARGET;IE_MILLS.push({B,H:CM.clone(),speed,pivot:null,e:null});GTARGET=B;try{fn();}finally{GTARGET=keep;}}
function ieMillFlush(parent){for(const m of IE_MILLS){const inv=m.H.clone().invert(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();m.H.decompose(pos,q,sc);
 const g=new THREE.Group();g.name='ie-mill-sails';g.position.copy(pos);m.e=new THREE.Euler().setFromQuaternion(q,'YXZ');g.rotation.copy(m.e);
 for(const mesh of flushBuckets(m.B,g,true)){mesh.geometry.applyMatrix4(inv);mesh.geometry.computeBoundingSphere();}parent.add(g);m.pivot=g;}}
const ieMillBuildWorld=buildWorld;
buildWorld=function(){IE_MILLS.length=0;const W0=ieMillBuildWorld();ieMillFlush(WORLD);return W0;};
FRAME_HOOKS.push(()=>{const t=ANIMU.uTime.value;for(const m of IE_MILLS)if(m.pivot)m.pivot.rotation.set(m.e.x,m.e.y,m.e.z+t*m.speed,'YXZ');});
defBuilding({key:'ie-windmill',name:'Windmill (Kautoa)',seed:6210,cut:true,w:15,d:9.2,h:17.4,budget:150000,
 tags:{types:['industry'],wealth:'middle',style:'east',job:'milling',role:'windmill'},
 note:'the village\'s windmill: a drum of coral stone with the millstones inside, a stage round it, a tapering timber tower clad in woven bamboo, a cap of golden thatch rising to a spire with a carved figure, and six woven sails on bamboo frames that turn in the wind',
 build(o){const R0=3.0,bh=2.6,th=6.8,rt=.6,R1=R0-.2,hubY=9.9,hubZ=3.75,cv=P('carvN'),da=.25,rAt=y=>lerp(R1,R1*rt,clamp((y-bh)/th,0,1));
  /* the base: a coral drum with a door to the front, the earth floor, the stage round it */
  sector('coral',0,0,R0-.5,R0,PI/2+da,PI/2+TAU-da,0,bh,P('coral'),28);sector('coral',0,0,R0-.5,R0,PI/2-da,PI/2+da,2.1,bh,P('coral'),3);
  for(const s of [-1,1])box('wood',s*.78,0,R0-.25,.14,2.1,.62,P('woodD'));box('wood',0,2.05,R0-.25,1.7,.14,.66,P('woodD'));
  cyl('earth',0,0,0,R0-.5,.06,P('earth'),20);door(0,0,R0,0,1.4);
  isNoCut(()=>{sector('planks',0,0,R0-.4,R0+.65,0,TAU,bh-.12,bh+.02,P('planks'),28);
   for(let k=0;k<16;k++){const a=k/16*TAU,x=Math.cos(a)*(R0+.58),z=Math.sin(a)*(R0+.58);box('wood',x,bh,z,.08,.95,.08,P('woodD'));
    const a2=(k+1)/16*TAU;beam('wood',[x,bh+.95,z],[Math.cos(a2)*(R0+.58),bh+.95,Math.sin(a2)*(R0+.58)],.06,P('woodD'));}});
  /* the tower: an octagon of woven bamboo on a timber frame, woven bands, a window to the front */
  W(0,0,0,PI/8,()=>{cyl('bamboo',0,bh,0,R1,th,P('bamboo'),8,rt);for(const y of [bh+1.3,bh+4.4])cyl('patWeave',0,y,0,rAt(y)+.04,.55,WHITE,8,rAt(y+.55)/rAt(y));});
  for(let k=0;k<8;k++){const a=k*PI/4+PI/8,s=Math.sin(a),c=Math.cos(a);beam('wood',[s*(R1+.05),bh,c*(R1+.05)],[s*(R1*rt+.05),bh+th,c*(R1*rt+.05)],.15,P('woodD'));}
  {const y=bh+3,r=rAt(y)*Math.cos(PI/8);box('plain',0,y,r+.02,.55,.75,.04,P('black'));box('wood',0,y-.08,r+.06,.75,.08,.1,P('woodD'));}
  /* the cap: a skirt of golden thatch and a spire with a figure at each end of its ridge; the windshaft; the tail pole */
  ieRoofE({hw:2.3,hd:2.3,eY:bh+th-.05,skirtH:.9,skirtS:.6,towerH:3.4,towerS:.55,topSx:.24,topSz:.08,sq:2.6,th:.22,finial:'figure',facade:'patWeave'});
  isNoCut(()=>{pole('wood',[0,hubY-.33,.4],[0,hubY,hubZ-.2],.16,P('woodD'),8);beam('wood',[0,bh+th+.2,-1.6],[0,bh+.25,-R0-.45],.14,P('woodD'));
   /* the sails: a carved boss with the moon, six bamboo whips, each with a frame of bars and a woven mat sail */
   WX(0,hubY,hubZ,0,-.1,0,()=>ieMillSails(.55,()=>{WX(0,0,0,0,PI/2,0,()=>cyl('carved',0,-.25,0,.55,.45,cv,12));isMoonDisc(0,0,.22,0,.36);
    const r0=1.1,r1=6.5,wid=r=>.75+.45*(r-r0)/(r1-r0);
    for(let k=0;k<6;k++)WX(0,0,0,0,0,k*TAU/6,()=>{pole('bamboo',[0,.3,0],[0,6.75,0],.075,P('bamboo'),6);
     for(const r of isSpan(r0,r1,10))pole('bamboo',[-.04,r,.03],[wid(r),r,.03],.025,P('bamboo'),4);pole('bamboo',[wid(r0),r0,.03],[wid(r1),r1,.03],.03,P('bamboo'),4);
     psurf('mat',(u,v)=>{const r=lerp(r0,r1,v);return [u*wid(r)*.98,r,-.03-.07*Math.sin(PI*u)];},2,8,P('bamboo'));
     box('patGableE',wid(r1)*.5,r1-.75,-.11,wid(r1)*.8,.55,.02,WHITE);});}));});
  /* the millers' floor: the millstones, sacks of grain and flour, the winnowing; sacks and a cart at the door */
  ieFurn([['generic_trade_grindstone',0,0,-1.3,0],['generic_trade_grindstone',-1.3,0,-.2,PI/2],['generic_sack',1.3,0,-.7,.3],['generic_sack',1.6,0,-.05,-.4],['generic_sack',1.35,0,.6,.9],
   ['job_winnowing_tub',-1.3,0,1.0,0],['generic_floor_basket',.7,0,1.3,0],
   ['generic_sack',1.2,0,R0+.9,.4,{setting:'outdoor'}],['generic_sack',1.6,0,R0+1.3,-.3,{setting:'outdoor'}],['pa_hand_cart',-3.4,0,3.3,.7,{setting:'outdoor'}]]);}});
/* ---------------------------------------------------------------- the warehouse */
defBuilding({key:'ie-warehouse',name:'Warehouse (Kautoa)',seed:6220,cut:true,w:15.6,d:13,h:11.6,budget:150000,
 tags:{types:['industry'],wealth:'middle',style:'east',job:'warehousing',role:'warehouse'},
 note:'a merchant\'s warehouse: a long plank store on piles with rat guards, a wide loading veranda and stair, one skirt over it with two towers, a little iron in the thatch; bales, crates, sacks and barrels inside, the tally desk by the door',
 build(o){const w=12,d=6.4,fy=1.4;
  const r=ieHouse({w,d,floorY:fy,wallH:2.6,ver:.6,verFront:2.0,posts:'plain',roof:{over:.8,skirtH:1.6,skirtS:.62,towerH:5,towerS:.24,topSx:.12,topSz:.04,sq:9,patch:.12},
   towers:[[-3.2,0,1],[3.2,0,1]],wallMk:'planks',wallCol:P('planks'),front:[{x:0,w:2.4,h:2.2,door:true},{x:-4,w:.7,y:1.1,h:.6},{x:4,w:.7,y:1.1,h:.6}],back:[],
   left:[{x:0,w:.7,y:1.1,h:.6}],right:[{x:0,w:.7,y:1.1,h:.6}],stair:'stair',stairW:2.4,finial:'horns'});
  /* rat guards on the piles (the same grid ieHouse drew) */
  isNoCut(()=>{const dw=r.W2*2,dd=r.Dz1-r.Dz0;for(const x of isSpan(-r.W2+.2,r.W2-.2,Math.max(2,Math.round(dw/2.1)+1)))for(const z of isSpan(r.Dz0+.2,r.Dz1-.2,Math.max(2,Math.round(dd/2.1)+1)))cyl('wood',x,fy-.55,z,.4,.05,P('woodD'),12);});
  /* the goods: bales and crates along the back, sacks and barrels, a bin, the tally desk and the strongbox by the door */
  ieFurn([['job_bales',-5.2,fy,-2.55,0],['job_bales',-4.1,fy,-2.55,.1],['job_bales',-5.2,fy+.82,-2.55,0],['job_bales',-4.6,fy,-1.5,PI/2],
   ['generic_trade_bin',-5.55,fy,.9,PI/2],['generic_barrel',3.9,fy,-2.65,0],['generic_barrel',4.6,fy,-2.65,0],['generic_barrel',5.3,fy,-2.65,0],['generic_barrel',5.3,fy,-1.95,0],
   ['islander_common_desk',4.9,fy,1.7,-PI/2],['islander_common_stool',4.1,fy,1.7,PI/2],['generic_strongbox',4.9,fy+svfH('islander_common_desk',0,1.1),1.6,-PI/2]]);
  for(const x of [-2.6,-1.95,-1.3])for(const k of [0,1])FURNISH('generic_crate',x,fy+k*.42,-2.85,0);
  for(const [x,z] of [[.3,-2.8],[.75,-2.75],[1.2,-2.8],[1.65,-2.75],[2.1,-2.8],[.5,-2.3],[1.4,-2.3],[-1.6,1.7],[-2.0,2.2]])FURNISH('generic_sack',x,fy,z,rr(-.6,.6));
  isNoCut(()=>{FURNISH('generic_barrel',-2.2,0,r.Dz1+.8,0,{setting:'outdoor'});FURNISH('generic_barrel',-2.8,0,r.Dz1+1.1,0,{setting:'outdoor'});FURNISH('pa_hand_cart',3.4,0,r.Dz1+1.6,-.2,{setting:'outdoor'});});}});
/* ---------------------------------------------------------------- the smithy */
defBuilding({key:'ie-smithy',name:'Smithy (Kautoa)',seed:6230,cut:true,w:11,d:7.8,h:8.6,budget:100000,
 tags:{types:['industry'],wealth:'middle',style:'east',job:'smithing',role:'smithy'},
 note:'the smith\'s forge shed: a stone floor under a skirt of soot-darkened thatch mended with iron, a short open spire to draw the smoke, half walls of coral at the back, carved posts at the front; the forge and bellows, the anvil, the quench trough, the grindstone and a rack of blades; a heap of salvage iron outside, the smith\'s stock',
 build(o){const y=.35,r=ieShed({w:7,d:5.2,plat:y,platMk:'stone',postH:2.5,carved:true,walls:{back:'coral',left:'coral'},wallH:1.5,
   roof:{skirtH:1.4,skirtS:.48,towerH:3.2,towerS:.4,topSx:.22,topSz:.08,patch:.35,col:jc(0xa08a64,.05),finial:'horns'}});
  smokeAt(0,r.towerTop+.3,0);door(0,y,2.6,0,2.4);
  ieFurn([['generic_trade_forge',-1.2,y,-1.95,0],['pa_bellows',-2.9,y,-1.35,0],['generic_fuel',.05,y,-2.25,0],['generic_trade_trough',.85,y,-2.15,0],
   ['generic_trade_anvil',.3,y,-.55,.3],['generic_trade_grindstone',2.6,y,-1.5,-PI/2],['generic_trade_weapon_rack',-3.25,y,.95,PI/2],['islander_common_workbench',2.75,y,.7,-PI/2],['generic_crate',2.9,y,2.0,0]]);
  isNoCut(()=>{isScrapHeap(5.3,-.8,-PI/2);isDrum(4.7,0,1.9,{col:'drumB'});isDrum(5.2,0,2.6,{col:'galv',lie:true,ry:.4});});}});
/* ---------------------------------------------------------------- the shops */
/* a market canopy at (x, z): four bamboo posts under a little hip of thatch (o.tarp: a tarp instead), w x d */
function ieCanopy(x,z,w,d,o){o=o||{};W(x,0,z,o.ry||0,()=>{for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])pole('bamboo',[a*w/2,0,b*d/2],[a*w/2,2.15,b*d/2],.06,P('bamboo'),6);
 if(o.tarp)isTarp([-w/2-.2,2.2,-d/2-.2],[w/2+.2,2.2,-d/2-.2],[w/2+.2,2.0,d/2+.2],[-w/2-.2,2.0,d/2+.2],.18,P(o.tarp));
 else isHip({hw:w/2+.5,hd:d/2+.5,eaveY:2.05,topY:3.4,topS:.2,topS2:.05,mk:'thatchR',col:P('thatchE'),th:.14,nu:20});});}
defBuilding({key:'ie-market',name:'Market hall (Kautoa)',seed:6240,cut:true,w:18,d:15.5,h:14,budget:150000,
 tags:{types:['market'],wealth:'middle',style:'east',job:'trading',role:'market'},
 note:'the market: a long open hall on carved posts under one skirt with three spires (the middle one tallest), the traders\' stalls and tables inside, goods on the counters; canopies of thatch and a tarp before it for the smaller sellers',
 build(o){const y=.3;ieShed({w:15,d:7.6,plat:y,platMk:'stone',postH:2.8,step:2.5,carved:true,
   roof:{skirtH:1.6,skirtS:.6,towerH:6,towerS:.22,topSx:.12,topSz:.05,sq:9,towers:[[-4.6,0,1],[0,0,1.25],[4.6,0,1]],finial:'figure',facade:'patWeave'}});
  door(0,y,3.8,0,3);const dh=y+svfH('generic_trade_display',0,1.1);
  ieFurn([['generic_trade_stall',-4.6,y,-2.2,0],['generic_trade_stall',0,y,-2.2,0],['generic_trade_stall',4.6,y,-2.2,0],
   ['generic_trade_display',-3.2,y,2.7,PI],['generic_trade_display',.4,y,2.7,PI],['generic_trade_display',3.6,y,2.7,PI],['islander_common_counter',-6.1,y,1.9,PI/2],
   ['generic_veg_basket',-3.5,dh,2.7,0],['generic_produce',-2.9,dh,2.75,0],['generic_fish',.2,dh,2.7,0],['generic_fish',.65,dh,2.65,.3],['generic_fruit_bowl',3.4,dh,2.7,0],['generic_veg_basket',3.9,dh,2.7,0],
   ['generic_floor_basket',-6.4,y,-1.2,0],['generic_floor_basket',6.5,y,-.8,.5],['generic_floor_basket',6.3,y,.2,1]]);
  isNoCut(()=>{ieCanopy(-6,8,2.4,2.4,{});ieCanopy(0,8.4,4.2,2.2,{tarp:'tarpO'});ieCanopy(6,8,2.4,2.4,{});
   ieFurn([['generic_trade_display',-6,0,8,0,{setting:'outdoor'}],['generic_produce',-6.2,svfH('generic_trade_display',0,1.1),8,0,{setting:'outdoor'}],
    ['pa_market_table',0,0,8.4,0,{setting:'outdoor'}],['generic_trade_display',6,0,8,0,{setting:'outdoor'}],['generic_fish',6,svfH('generic_trade_display',0,1.1),8,0,{setting:'outdoor'}],
    ['generic_floor_basket',-4.4,0,8.6,0,{setting:'outdoor'}]]);});}});
defBuilding({key:'ie-kava-house',name:'Palm-wine and kava house (Kautoa)',seed:6250,cut:true,w:18,d:19.5,h:13,budget:150000,
 tags:{types:['tavern'],wealth:'middle',style:'east',job:'brewing',role:'palm-wine and kava house'},
 note:'the drinking house: a peaked house on low piles with deep verandas for sitting out, buffalo horns on the posts, a woven tower; inside the kava bowls on a rug, benches round the walls, the palm-wine barrels and kegs and the still for sopi; a tapped palm behind, lamps on posts at the steps, a carved post with the moon for a sign',
 build(o){const fy=1.0,w=7.6,d=5.6;
  const r=ieHouse({w,d,floorY:fy,wallH:2.2,ver:1.5,verFront:2.8,roof:{over:.9,skirtH:1.5,skirtS:.5,towerH:6.6,towerS:.4,topSx:.2,topSz:.05},
   wallMk:'bamboo',facade:'patWeave',towerFacade:true,front:[{x:0,w:1.6,h:1.9,door:true},{x:-2.7,w:1.0,y:.6,h:1.0},{x:2.7,w:1.0,y:.6,h:1.0}],
   stair:'stair',stairW:1.8,finial:'horns',hornPosts:true});
  const th=svfH('islander_common_low_table',0,.42);
  ieFurn([['islander_common_rug',0,fy,.3,0],['islander_common_kava_bowl',0,fy,.3,0],['islander_common_low_table',-2.4,fy,1.3,0],['generic_wine',-2.5,fy+th,1.3,0],['generic_wine',-2.25,fy+th,1.25,.4],
   ['generic_trade_barrel',-.6,fy,-d/2+.48,0],['generic_trade_still',2.6,fy,-d/2+.45,0],['generic_keg',-2.9,fy,-d/2+.3,0],['generic_keg',-2.9,fy+.31,-d/2+.3,.2],
   ['islander_common_bench',-w/2+.32,fy,-.5,PI/2],['islander_common_bench',w/2-.32,fy,.2,-PI/2],['islander_common_stool',1.3,fy,1.4,PI]]);
  FURNISH_HANG('islander_common_hanging',0,fy+2.2+.9,0,0);
  ieFurn([['islander_common_bench',-2.5,fy,r.Dz1-.45,PI],['islander_common_bench',2.5,fy,r.Dz1-.45,PI],['islander_common_kava_bowl',-2.5,fy,d/2+1.3,0],['islander_common_kava_bowl',2.5,fy,d/2+1.3,0]]);
  isNoCut(()=>{place('fl-coconut',-6.4,-6.2,0,{});for(const s of [-1,1])isLamp(s*1.5,2.1,r.Dz1+1.7,{post:true});isPou(3.4,0,r.Dz1+1.0,2.6,.15,{mk:'carved',top:'moon'});});}});
defBuilding({key:'ie-trader',name:'Trader\'s shop (Kautoa)',seed:6260,cut:true,w:11.5,d:11.5,h:14,budget:120000,
 tags:{types:['shop'],wealth:'middle',style:'east',job:'trading',role:'trader'},
 note:'a trader\'s shop on a raised earth floor: a wide shop window with a counter and a plank shutter propped up as an awning, the spire above, shelves of imported goods, a display, chests and the strongbox; crates and a barrel on the veranda, a carved post with the moon for a sign',
 build(o){const fy=.3,w=8,d=6,wh=2.6;
  const r=ieHouse({w,d,floorY:fy,wallH:wh,ver:.6,verFront:2.2,roof:{over:.8,skirtH:1.6,skirtS:.5,towerH:7.5,towerS:.4,topSx:.2,topSz:.05},
   wallMk:'planks',wallCol:P('woodL'),front:[{x:-1.2,w:3.4,y:.85,h:1.35},{x:2.7,w:1.1,h:2.1,door:true}],back:[{x:0,w:.8,y:1.1,h:.8}],left:[{x:0,w:.8,y:1.1,h:.8}],right:[],
   stair:'none',finial:'moon'});
  /* woven panels on the sides, the shutter propped up over the window */
  for(const s of [-1,1])W(s*(w/2+.07),0,0,s*PI/2,()=>{box('patGableE',-1.7,fy+.1,0,1.4,wh-.3,.02,WHITE);box('patGableE',1.7,fy+.1,0,1.4,wh-.3,.02,WHITE);});
  isNoCut(()=>{const hy=fy+.85+1.35+.12,zf=d/2+.08;WX(-1.2,hy,zf,0,-.35,0,()=>box('planks',0,-.03,.65,3.6,.06,1.3,P('planks')));
   for(const s of [-1,1])pole('wood',[-1.2+s*1.6,hy+.34*1.25,zf+.94*1.25],[-1.2+s*1.6,fy+.86,zf+.04],.03,P('woodD'),5);
   isPou(-4.6,0,r.Dz1+.25,2.6,.14,{mk:'carved',top:'moon'});});
  const ct=fy+svfH('islander_common_counter',0,1.05);
  ieFurn([['islander_common_counter',-1.2,fy,d/2-.62,0],['generic_strongbox',-.4,ct,d/2-.62,0],['generic_lamp_oil',-2.0,ct,d/2-.6,0],['generic_tobacco',-1.5,ct,d/2-.62,.2],['generic_spice_box',-1.0,ct,d/2-.62,0],
   ['islander_common_wall_shelves',-2.2,fy,-d/2+.3,0],['islander_common_wall_shelves',-.6,fy,-d/2+.3,0],['generic_trade_display',w/2-.5,fy,-1.4,-PI/2],['islander_common_chest',-w/2+.4,fy,-1.6,PI/2],
   ['generic_bottle_crate',1.4,fy,-d/2+.35,0],['generic_crate',2.4,fy,-d/2+.35,0],['generic_crate',2.4,fy+.42,-d/2+.35,.1],['generic_sack',3.4,fy,-2.4,.3],['generic_sack',-3.4,fy,.6,0],
   ['generic_crate',3.2,fy,d/2+1.1,.3],['generic_barrel',3.9,fy,d/2+1.5,0],['generic_sack',-3.6,fy,d/2+1.3,-.4]]);
  FURNISH_HANG('islander_common_hanging',.4,fy+wh+.9,0,0);}});
defBuilding({key:'ie-weaver',name:'Ikat weaver (Kautoa)',seed:6270,cut:true,w:15,d:12.5,h:13,budget:120000,
 tags:{types:['shop','industry'],wealth:'middle',style:'east',job:'weaving',role:'ikat weaver'},
 note:'the weavers of hinggi, the East\'s ikat cloth: a woven house on piles with looms on its deep front veranda and inside, the yarn store and the chest of finished cloths; beside it the dye yard, indigo and morinda vats, and cloths drying over a bamboo rail',
 build(o){const fy=1.3,w=6.4,d=5,wh=2.1;
  const r=ieHouse({w,d,floorY:fy,wallH:wh,ver:1.2,verFront:2.6,roof:{over:.8,skirtH:1.4,skirtS:.5,towerH:6.4,towerS:.42,topSx:.2,topSz:.05},
   wallMk:'mat',facade:'patGableE',towerFacade:true,stair:'stair',stairW:1.2,finial:'figure'});
  ieFurn([['islander_common_loom',-1.7,fy,-1.5,0],['islander_common_rack',1.6,fy,-d/2+.3,0],['islander_common_chest',w/2-.42,fy,.7,-PI/2],['islander_common_store',-w/2+.4,fy,.9,PI/2],
   ['generic_sewing',.2,fy,-.4,0],['islander_common_stool',-1.7,fy,-.7,PI],
   ['islander_common_loom',-2.0,fy,d/2+1.4,0],['islander_common_loom',2.0,fy,d/2+1.4,0]]);
  isNoCut(()=>{ieFurn([['generic_trade_vat',6.2,0,1.1,0,{setting:'outdoor'}],['generic_trade_vat',6.2,0,-.9,.3,{setting:'outdoor'}]]);
   /* the drying rail: two posts, a bamboo rail, the cloths folded over it */
   const rx=8.4;for(const z of [-2.6,2.6])pole('bamboo',[rx,0,z],[rx,2.7,z],.06,P('woodL'),6);pole('bamboo',[rx,2.6,-2.7],[rx,2.6,2.7],.05,P('bamboo'),6);
   /* four hinggi (ikat) cloths, the owner's sheet (2026-10-14); P('red') is still drawn so the random stream does not move */
   const cloth=[['patHinggi',WHITE],['patHinggi',WHITE],['patHinggi',WHITE],['patHinggi',(P('red'),WHITE)]];
   cloth.forEach(([mk,c],i)=>{const z=-1.8+i*1.2;for(const s of [-1,1])box(mk,rx+s*.05,.55+(s>0?.2:0),z,.02,2.0-(s>0?.2:0),1.0,c);});});}});
defBuilding({key:'ie-potter',name:'Potter (Kautoa)',seed:6280,cut:true,w:11,d:7.4,h:7,budget:80000,
 tags:{types:['shop','industry'],wealth:'poor',style:'east',job:'pottery',role:'potter'},
 note:'a potter\'s yard: an open shed on an earth floor under a skirt of faded thatch mended with iron, a salvage wall at the back, the bench and the clay bin, jars and crocks for sale on a display; the kiln smoking outside, a heap of clay and a drum of water, jars drying in the sun',
 build(o){const y=.2;ieShed({w:6.4,d:4.4,plat:y,platMk:'earth',postH:2.3,walls:{back:'patch',left:'bamboo'},wallH:2.2,
   roof:{skirtH:1.2,skirtS:.5,towerH:2.4,towerS:.4,topSx:.24,topSz:.08,mk:'thatch',col:P('thatchP'),patch:.4,th:.18,finial:'none'}});
  door(0,y,2.2,0,2.4);const dh=y+svfH('generic_trade_display',0,1.1),bh=y+svfH('islander_common_workbench',0,.9);
  ieFurn([['islander_common_workbench',-1.2,y,-1.65,0],['generic_poor_stool',-1.2,y,-.95,PI],['generic_trade_bin',-2.75,y,.5,PI/2],['generic_crock',-1.6,bh,-1.65,0],['generic_crock',-1.0,bh,-1.6,.5],
   ['generic_storage_jar',.6,y,-1.8,0],['generic_storage_jar',1.1,y,-1.75,.5],['generic_storage_jar',.85,y,-1.3,1],['generic_storage_jar',2.6,y,-1.7,0],
   ['generic_trade_display',1.2,y,1.6,0],['generic_crock',.95,dh,1.6,0],['generic_crock',1.4,dh,1.62,.4],
   ['generic_trade_kiln',5.0,0,-.6,-PI/2,{setting:'outdoor'}],['generic_storage_jar',1.6,0,3.5,0,{setting:'outdoor'}],['generic_storage_jar',2.2,0,3.6,.4,{setting:'outdoor'}],['generic_storage_jar',2.8,0,3.4,.8,{setting:'outdoor'}]]);
  smokeAt(5.0,2.2,-.6);
  isNoCut(()=>{ellip('earth',-4.7,0,1.2,1.0,.5,.85,P('earth'),0,10);isDrum(-4.6,0,-1.3,{col:'galv'});FURNISH('job_winnowing_mat',2.2,0,3.55,0,{setting:'outdoor'});});}});
defBuilding({key:'ie-chandler',name:'Chandler (Kautoa)',seed:6290,cut:true,w:9.2,d:9.8,h:9.5,budget:80000,
 tags:{types:['shop'],wealth:'poor',style:'east',job:'trading',role:'chandler'},
 note:'the chandler who fits out the canoes: a small peaked shop of planks and salvage, its skirt patched with iron, a shop window with a counter of lamp oil and candles, shelves, barrels of pitch and oil; a net frame and a rack of drums outside, a lamp hung at the door',
 build(o){const fy=.9,w=5.6,d=4.6;
  const r=ieHouse({w,d,floorY:fy,wallH:2.2,ver:.5,verFront:1.8,posts:'plain',roof:{over:.6,skirtH:1.3,skirtS:.48,towerH:4.2,towerS:.38,topSx:.22,topSz:.06,patch:.3,th:.24},
   wallMkf:s=>s==='front'?'planks':s==='left'?'corrW':'reclaimed',wallColf:s=>s==='left'?P('rust'):P('planks'),
   front:[{x:-1.3,w:1.0,h:1.85,door:true},{x:1.2,w:1.7,y:.75,h:1.1}],left:[],right:[{x:0,w:.7,y:1,h:.6}],stair:'stair',stairX:-1.3,stairW:1.0,finial:'none'});
  const ct=fy+svfH('islander_common_counter',0,1.05);
  ieFurn([['islander_common_counter',1.2,fy,d/2-.6,0],['generic_lamp_oil',.6,ct,d/2-.6,0],['generic_lamp_oil',1.0,ct,d/2-.58,.3],['generic_candle_supply',1.5,ct,d/2-.62,0],['generic_candle_supply',1.85,ct,d/2-.6,.2],
   ['islander_common_wall_shelves',-1.0,fy,-d/2+.28,0],['islander_common_wall_shelves',.5,fy,-d/2+.28,0],['generic_barrel',2.2,fy,-1.55,0],['generic_barrel',2.2,fy,-.85,0],
   ['generic_crate',-2.3,fy,-.4,PI/2],['generic_candle_supply',-2.3,fy+.42,-.4,0],['generic_sack',-2.2,fy,.6,0]]);
  isNoCut(()=>{FURNISH('job_net_frame',-r.W2-1.0,0,.2,PI/2,{setting:'outdoor'});FURNISH('job_oil_drum_rack',r.W2+1.1,0,.6,-PI/2,{setting:'outdoor'});
   isLamp(-2.3,fy+1.9,r.Dz1-.1,{});pole('wood',[-2.3,fy+2.07,r.Dz1-.1],[-2.3,fy+2.3,r.Dz1-.1],.015,P('rope'),4);isDrum(-3.6,0,3.2,{col:'drumY'});});}});
