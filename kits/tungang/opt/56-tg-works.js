// prefix: tg
// ================================================================= THE TUNGANG SET: WORKS (PLAN.md 3.2, 5.3: water and air, the dark beds)
//   tg-dark-beds   the fungus terraces: racks of plate trays (the catalog's) in rows under amber tending lamps, the mat in its
//                  sealed beds at the back, the mash bin, a drip gutter: warm, damp, amber
//   tg-cistern     the cistern: a sunk tank of dark water under a plate walk and rail, the drip gutters, the tap, the butts
//   tg-bath        the bath: a plastered pool of warm vent water, the benches, the wash trough, the steam
//   tg-fan-house   the fan house: the Ancients' fan in its frame on the back wall (still turning in the draught), the draught doors
function tgWater(x,y,z,w,d,C){box(C.aband?'stone':'glass',x,y-.04,z,w,.04,d,C.aband?tgCol('dust',C):hc(TG.tg.PAL.water));}
function tgRail(x0,x1,z,y,C,ry){const pc=tgCol('steel',C);W((x0+x1)/2,y,z,ry||0,()=>{const L=x1-x0;for(let x=-L/2;x<=L/2+1e-6;x+=1.2)box('iron',x,0,0,.05,1,.05,pc);
 box('iron',0,.95,0,L,.05,.05,pc);box('iron',0,.5,0,L,.04,.04,pc);});}
defBuilding({key:'tg-dark-beds',name:'The dark beds',seed:9321,w:12.4,d:14,h:3.2,front:{x:0,z:0},budget:14000,
 tags:{types:['farm','industry'],wealth:'poor',style:'carved',role:'works',job:'fungiculture'},note:TG.tg.BOX['tg-dark-beds'].what,
 build(o){const C=tgCx(o);tgFront(0,1.6,2.2,C,{code:'amber',curtain:'felt'});
  /* the room x -6..6, z -.8..-14: four rows of tray racks with an aisle down the middle, a tending lamp over each */
  for(const x of [-4.4,-1.6,1.6,4.4])for(let z=-2.6,k=0;z>-10.8;z-=2.6,k++){if(tgKeep(C,100+k*7+(x*3|0),.3))tgFurn('tungang_common_fungus_trays',x,0,z,PI/2,{v:k%2});
   if(k%2===0)tgLamp('amber',x,2.6,z-1.3,C,{});}
  for(const x of [-3,0,3])if(tgKeep(C,40+(x|0)))tgFurnBack('tungang_common_mat_bed',x*1.3,-14);
  if(tgKeep(C,50))tgFurnSide('tungang_common_mash_bin',-1,-6,-1.8);if(tgKeep(C,51))tgFurnSide('tungang_common_tending_lamp',1,6,-1.8);
  /* the drip gutter along the east wall, the water down it */
  box('rust',5.85,.02,-7.4,.25,.12,12.6,tgCol('rust',C));if(!C.aband)tgWater(5.85,.12,-7.4,.18,12.4,C);
  if(!C.aband)smokeAt(0,2.4,-7,{r:.6,kind:'steam'});tgRubble(-5.8,5.8,-13.8,-1,C,8,60);}});
defBuilding({key:'tg-cistern',name:'The cistern',seed:9322,w:8.4,d:9.4,h:3.6,front:{x:0,z:0},budget:9000,
 tags:{types:['infrastructure'],wealth:'poor',style:'carved',role:'works'},note:TG.tg.BOX['tg-cistern'].what,
 build(o){const C=tgCx(o),zc=-5.6;tgFront(0,1.4,2.2,C,{code:'amber',leaf:'plate'});
  /* the sunk tank (x -3.2..3.2, z -2.6..-8.6, its floor 1.6 m down): the water 0.5 m under the walk, the walk of plate round it, a rail */
  tgWater(0,C.aband?-1.5:-.5,zc,6.3,5.9,C);
  for(const s of [-1,1]){tgRail(-3.2,3.2,zc+s*3.0,0,C);}
  box('plate',0,-.06,-1.4,7.8,.06,1.4,tgCol('plate',C));
  /* the drip gutters down the side walls into the tank, the tap and the butts at the front */
  for(const s of [-1,1])box('rust',s*3.85,2.6,zc,.2,.12,7.6,tgCol('rust',C));
  if(tgKeep(C,10))tgFurnSide('tungang_common_cistern_tap',-1,-4,-1.4);
  if(tgKeep(C,11))tgFurnSide('tungang_common_water_butt',1,4,-1.2);if(tgKeep(C,12))tgFurnSide('tungang_common_water_butt',1,4,-2.1,{v:1});
  tgLamp('amber',-3.6,2.3,-1.2,C,{wall:false});tgLamp('amber',3.6,2.3,-8.8,C,{wall:false});tgRubble(-3.8,3.8,-2.2,-.8,C,3,30);}});
defBuilding({key:'tg-bath',name:'The bath',seed:9323,w:8.4,d:9.4,h:3.2,front:{x:0,z:0},budget:9000,
 tags:{types:['civic'],wealth:'middle',style:'carved',role:'civic'},note:TG.tg.BOX['tg-bath'].what,
 build(o){const C=tgCx(o),zc=-5.8;tgFront(0,1.4,2.2,C,{code:'amber',curtain:'canvas',plaster:true});
  /* the pool (x -2.5..2.5, z -3.5..-8.1, 1.1 m deep), its plastered rim and steps; the water warm and steaming */
  const pc=tgCol(C.aband?'plasterA':'plaster',C);for(const s of [-1,1]){box('plain',s*2.6,0,zc,.2,.12,4.8,pc);box('plain',0,0,zc+s*2.4,5.4,.12,.2,pc);}
  tgWater(0,C.aband?-1:-.25,zc,5,4.6,C);for(let k=0;k<4;k++)box('plain',0,-1.1+k*.27,zc+2.2-k*.3,1.4,.04,.3,pc);
  if(!C.aband){smokeAt(-1,.2,zc,{r:.9,kind:'steam'});smokeAt(1.2,.2,zc-1,{r:.9,kind:'steam'});}
  tgPlaster(-4,4,0,3,-9.4,C);
  if(tgKeep(C,10))tgFurnSide('tungang_common_bench',-1,-4,-4.6);if(tgKeep(C,11))tgFurnSide('tungang_common_bench',1,4,-4.6);
  if(tgKeep(C,12))tgFurnBack('tungang_common_wash_trough',-2.4,-9.4);if(tgKeep(C,13))tgFurnBack('tungang_common_hook_rack',2.4,-9.4,{},.9);
  tgLamp('wax',-3.85,2.3,-2,C,{wall:false});tgLamp('wax',3.85,2.3,-8.6,C,{wall:false});tgRubble(-3.8,3.8,-9.2,-.8,C,4,40);}});
defBuilding({key:'tg-fan-house',name:'The fan house',seed:9324,w:6.4,d:8.2,h:4.4,front:{x:0,z:0},budget:9000,
 tags:{types:['infrastructure'],wealth:'poor',style:'salvage',role:'works'},note:TG.tg.BOX['tg-fan-house'].what,
 build(o){const C=tgCx(o),zb=-7.8;tgFront(0,1.4,2.3,C,{code:'amber',leaf:'plate'});
  /* the duct's dark mouth in the back wall, the fan in its frame before it, its blades (still in the kept state) */
  cyl('iron',0,.4,zb+.02,1.75,.04,tgCol('dark',C),24);
  if(tgKeep(C,10,.8))tgFurnBack('tungang_court_fan_frame',0,zb,{},.0);
  const bc=tgCol(C.aband?'rust':'steel',C);W(0,2.1,zb+.6,0,()=>{for(let k=0;k<6;k++){const a=k*PI/3+(C.aband?.3:0);box('plate',Math.cos(a)*.75,Math.sin(a)*.75-.06,0,1.3,.12,.03,bc,0,0,a);}cyl('iron',0,-.15,0,.2,.3,bc,10);});
  /* the draught doors on the side walls, half open, the rota of who turns them */
  for(const s of [-1,1])box('plate',s*2.9,0,-4.2,.08,2.2,1.4,tgCol('plateG',C),s*.4);
  if(tgKeep(C,20))tgFurnSide('tungang_common_rota_board',1,3,-2.2,{},1.0);if(tgKeep(C,21))tgFurnSide('tungang_common_tool_wall',-1,-3,-2.2,{},.4);
  tgLamp('amber',2.6,3,-6.6,C,{wall:false});tgRubble(-2.9,2.9,-7.4,-.8,C,4,30);}});
