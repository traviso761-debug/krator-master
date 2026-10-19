// prefix: ie
// ================================================================= KAUTOA: the hamlet works (core/hamlet, H3)
// The buildings a resource village needs that the set lacked (core/hamlet/PLAN.md section 3; the owner, 2026-10-19): the
// lumber village's sawpit and log yard and its charcoal kiln, the ranch's corral, every village's small food store, and
// the bloomery (Valapo's harbour smelts the mountain's iron: settlements/isle-demo/PLAN.md 8b). Every surface is a library
// set already (the families endgrain, logbark, banco, turf, charcoal, ash, clay: materials.json), nothing new sourced.
// Frame: origin on the ground at the plot centre, +z the front. The job tags are the catalog's (core/tags CATALOG_JOBS):
// the sawpit is carpentry and the bloomery smithing; the kiln carries no job (the vocabulary has no charcoal burning).
/* ---------------------------------------------------------------- logs: bark round, the cut ends showing */
function ieLog(x,y,z,ry,len,r){W(x,y,z,ry,()=>{beam('logbark',[-len/2,r,0],[len/2,r,0],r,P('logbark'),true,9);
 for(const s of [-1,1])beam('endgrain',[s*len/2,r,0],[s*(len/2+.02),r,0],r*.96,P('endgrain'),true,9);});}
/* a stack of logs along local x: rows of n, n-1... on two sleepers */
function ieLogStack(x,z,ry,n,len,r){W(x,0,z,ry,()=>{for(const s of [-1,1])box('wood',s*len*.32,0,0,.18,.14,n*r*2.2,P('woodD'));
 let y=.14;for(let row=0;n-row>0;row++){const k=n-row;for(let i=0;i<k;i++)ieLog(0,y,(i-(k-1)/2)*r*2.04,0,len+rr(-.2,.2),r*rr(.92,1.06));y+=r*1.75;}});}
/* sawn planks stacked in layers with spacer sticks, along local x */
function iePlankStack(x,z,ry,L,layers){W(x,0,z,ry,()=>{let y=0;for(let i=0;i<layers;i++){for(const s of [-1,0,1])box('wood',s*L*.4,y,0,.06,.05,1.1,P('woodD'));y+=.05;
 box('planks',0,y,0,L,.08,1.0,P('woodL'));y+=.08;}});}
/* a heap: a low cone with lumps on it */
function ieHeap(x,z,r,h,mk,col,lump){W(x,0,z,0,()=>{cone(mk,0,0,0,r,h,col,12);for(let i=0;i<9;i++){const a=rr(0,TAU),q=rr(.2,.8)*r;sph(mk,Math.cos(a)*q,h*(1-q/r)*.8,Math.sin(a)*q,rr(.08,.14)*(lump||1),col,.7,5);}});}

/* ---------------------------------------------------------------- the sawpit and log yard (the lumber village) */
defBuilding({key:'ie-sawpit',name:'Sawpit and log yard (Kautoa)',seed:6330,cut:true,w:20,d:14,h:8,budget:90000,
 tags:{types:['industry'],wealth:'poor',style:'east',role:'sawyer',job:'carpentry'},
 note:'the sawyers\' yard of a lumber village: felled logs stacked on sleepers, a pit under an open shed of thatch where two men work the long saw through a log on trestles, sawn planks stacked to season, sawdust over the trodden ground',
 build(o){box('earth',0,0,0,18.6,.03,12.6,0xb89a70);
  W(0,0,-1.4,0,()=>{ieShed({w:8,d:4.6,postH:2.8,walls:{back:'bamboo'},roof:{skirtH:1.1,towerH:2.8,towerS:.42,topSx:.24,patch:.15,finial:'none'}});
   box('earth',0,.03,.2,5.6,.02,1.2,0x2a2018);for(const s of [-1,1])box('wood',0,.03,.2+s*.66,5.8,.12,.14,P('woodD'));
   for(const s of [-1,1]){pole('wood',[s*2.3,0,-.3],[s*2.3,1.05,.2],.06,P('wood'),6);pole('wood',[s*2.3,0,.7],[s*2.3,1.05,.2],.06,P('wood'),6);}
   ieLog(0,.95,.2,0,6.2,.34);box('iron',.9,.3,.2,.03,1.9,.28,P('iron'));pole('wood',[.9,2.25,.0],[.9,2.25,.4],.03,P('woodD'),5);
   isFurn([['job_saw_bench',-2.6,0,-1.6,0],['job_pole_rack',2.8,0,-1.7,0],['generic_sack',-3.3,0,1.4,.4],['islander_common_workbench',2.6,0,1.3,PI]]);});
  door(0,0,1.0,0,3);
  isNoCut(()=>{ieLogStack(-6.6,1.2,PI/2,5,6.4,.3);ieLogStack(-6.2,-4.2,0,4,5.6,.26);
   iePlankStack(6.4,2.2,0,4.4,6);iePlankStack(6.4,-1.0,0,4.4,4);FURNISH('job_plank_stack',6.2,0,-4.4,0,{setting:'outdoor'});
   ieHeap(3.4,4.8,1.0,.35,'earth',0xc8a878);});}});

/* ---------------------------------------------------------------- the charcoal kiln (the lumber village) */
defBuilding({key:'ie-kiln',name:'Charcoal kiln (Kautoa)',seed:6331,cut:true,w:14,d:12,h:7,budget:70000,
 tags:{types:['industry'],wealth:'poor',style:'east',role:'charcoal burner'},
 note:'the charcoal burners\' clearing: a domed kiln of stacked wood sealed under earth and turf, smoke seeping from its vents, a heap of finished charcoal and sacks of it, cordwood waiting, ash over the ground, the burners\' lean-to',
 build(o){box('ash',0,0,0,13.4,.03,11.4,P('ash'));
  W(-2,0,-.6,0,()=>{ellip('turf',0,0,0,2.9,1.9,2.9,P('turf'),0,16);ellip('banco',0,.05,0,3.05,.55,3.05,P('banco'),0,16);
   for(let i=0;i<6;i++){const a=i/6*TAU+.3;sph('charcoal',Math.cos(a)*2.2,1.15,Math.sin(a)*2.2,.16,P('charcoal'),.6,6);smokeAt(Math.cos(a)*2.2,1.3,Math.sin(a)*2.2,{r:.12});}
   sph('charcoal',0,1.85,0,.24,P('charcoal'),.5,6);smokeAt(0,2.0,0,{r:.22});});
  ieHeap(3.4,-2.8,1.3,.7,'charcoal',P('charcoal'));
  W(4.2,0,2.4,0,()=>{ieShed({w:3.4,d:2.6,postH:2.1,walls:{back:'mat'},roof:{skirtH:.9,towerH:2.0,towerS:.42,topSx:.26,patch:.3,finial:'none'}});
   isFurn([['generic_sack',-.9,0,-.5,.2],['generic_sack',-.2,0,-.7,-.3],['generic_basket',.8,0,-.6,0],['islander_common_stool',.6,0,.4,0]]);});
  door(4.2,0,3.7,0,2.4);
  isNoCut(()=>{iwWoodpile(-2.4,4.4,0,9,3.2);iwWoodpile(-5.6,3.4,PI/2,7,2.8);});}});

/* ---------------------------------------------------------------- the corral (the ranch village) */
defBuilding({key:'ie-corral',name:'Corral (Kautoa)',seed:6332,cut:true,w:28,d:22,h:4.5,budget:70000,
 tags:{types:['farm'],wealth:'poor',style:'east',role:'herder',job:'herding'},
 note:'the ranch\'s corral: a wide paddock of bamboo rails where the buffalo are held for the market and the riders\' mounts are worked, a trough and a hay shelter, a tack shed at the gate',
 build(o){isNoCut(()=>{isPen(-1,-.6,24,18,{gate:3});ieCanopy(-8,-5.5,4,3,{});FURNISH('job_bales',-8,0,-5.5,0,{setting:'outdoor'});
   FURNISH('generic_trade_trough',4,0,-7.6,0,{setting:'outdoor'});});
  place('buffalo',-3,-1.5,.6,{sub:'east'});place('buffalo',3.2,-3.4,2.4,{sub:'east'});place('buffalo',6,2,4.1,{sub:'east'});
  W(9.6,0,8.6,0,()=>{ieShed({w:3.2,d:2.4,postH:2.1,walls:{back:'bamboo'},roof:{skirtH:.8,towerH:1.8,towerS:.42,topSx:.26,patch:.2,finial:'none'}});
   isFurn([['job_pole_rack',-.8,0,-.6,0],['generic_crate',.8,0,-.5,0],['generic_sack',.9,0,.4,.3],['islander_common_stool',-.6,0,.4,0]]);});
  door(9.6,0,9.8,0,2.4);}});

/* ---------------------------------------------------------------- the food store (every village) */
defBuilding({key:'ie-store-food',name:'Food store (Kautoa)',seed:6333,cut:true,w:10,d:9.5,h:10,budget:80000,
 tags:{types:['shop','market'],wealth:'middle',style:'east',role:'grocer',job:'trading'},
 note:'a village\'s food store: a small peaked house on low piles, baskets of taro, rice, fish and fruit on the veranda counter, sacks and jars behind, the skirt of thatch reaching down to the shade',
 build(o){ieHouse({w:5.4,d:4.4,floorY:.8,wallH:2.0,ver:.8,verFront:1.7,roof:{over:.7,skirtH:1.3,skirtS:.5,towerH:4.6,towerS:.4,topSx:.2,topSz:.05,patch:.05},
  wallMk:'bamboo',facade:'patWeave',towerFacade:false,stair:'stair',stairW:1.2,finial:'none',front:[{x:-1.5,w:1,h:1.8,door:true},{x:1.2,w:2.0,y:.8,h:1.0}],
  extra:()=>{const fy=.8;isFurn([['islander_common_counter',1.2,fy,1.7,PI],['generic_veg_basket',.6,fy,1.2,0],['generic_fish',1.8,fy,1.2,0],['generic_fruit_bowl',2.4,fy,-1.3,0],
   ['generic_sack',-1.9,fy,-1.4,.3],['generic_storage_jar',-.8,fy,-1.6,0],['generic_pantry_shelf',2.2,fy,-1.5,-PI/2],['generic_basket',-1.8,fy,.4,0]]);}});
  isNoCut(()=>{FURNISH('generic_floor_basket',3.6,0,3.4,0,{setting:'outdoor'});FURNISH('generic_sack',-3.6,0,3.2,.5,{setting:'outdoor'});});}});

/* ---------------------------------------------------------------- the bloomery (Valapo's harbour: the iron smelted) */
defBuilding({key:'ie-bloomery',name:'Bloomery (Kautoa)',seed:6334,cut:true,w:18,d:14,h:9,budget:100000,
 tags:{types:['industry'],wealth:'poor',style:'east',role:'smelter',job:'smithing'},
 note:'the iron smelters: two clay shaft furnaces fed with ore and charcoal from the top, a glow at the tap hole where the bloom is drawn, the bellows worked under a shed of thatch, the bloom beaten on the anvil into ingots for the boats, heaps of ore, charcoal and black slag',
 build(o){box('ash',0,0,0,17.4,.03,13.4,P('ash'));
  for(const [fx,fz] of [[-3.4,-2.4],[0,-2.8]])W(fx,0,fz,0,()=>{cyl('clay',0,0,0,.95,2.6,P('clay'),14,.55,true);cyl('clay',0,2.5,0,.62,.14,P('clay'),14);
   box('clay',0,0,.9,.7,.5,.4,P('clay'));sph('glow',0,.22,1.05,.14,0xff7a2a,1,6);smokeAt(0,2.7,0,{r:.25});});
  W(4.4,0,-1.6,0,()=>{ieShed({w:5,d:3.4,postH:2.3,walls:{back:'bamboo'},roof:{skirtH:1.0,towerH:2.4,towerS:.42,topSx:.24,patch:.25,finial:'none'}});
   for(const s of [-1,1]){box('mat',s*.6-1.2,.2,-.6,.8,.35,1.0,P('bark'));pole('wood',[s*.6-1.2,.55,-.6],[s*.6-1.2,1.5,-.6],.04,P('wood'),5);}
   isFurn([['generic_trade_anvil',.9,0,-.4,0],['generic_trade_forge',1.6,0,-1.1,0],['generic_crate',-1.8,0,.9,0],['generic_sack',.2,0,1.0,.4]]);});
  door(4.4,0,0,0,3);
  isNoCut(()=>{isOrePile(-6.4,3.2,'iron',1.3);ieHeap(-3.2,4.4,1.1,.6,'charcoal',P('charcoal'));ieHeap(5.6,4.8,1.4,.8,'stone',P('slag'),1.2);
   for(let i=0;i<5;i++)box('iron',1.4+i*.34,0,4.4,.26,.12,.6,P('iron'));});}});
