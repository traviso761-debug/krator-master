// ================================================================= NULAB — the town on core/city (records; draws nothing)
// [G data] Step N3 of PLAN.md (section 3, the ten quarters, all proposed; the owner, 2026-11-16: a lake town over 500 is laid in
// full on core/city). Two core/city instances in their own frames (the raster is centred on its frame's origin, as Verge's
// two levels are): THE TOWN, from the mound on the pin to the quays on the bay's west shore (±2.2 km round the page's origin),
// and THE WORKS, the copper works' quarter on the Chimes Riba's east bank at the outlet (±0.8 km round (6050, 2450)). Each
// lays its own landmarks (step 1: the quarters' great pieces, stamped HARD) and avenues (step 3), then core/city's steps 6-12
// lay the civic pieces, the lots, the main and side streets and the alleys. Beside them the town's own records: the earthwork
// rings round the precinct and the granary yard, the harbour (quays, the mole, the boat sheds, the fish racks, the ferry
// stage), the Line quarter's houses and the station's site, the roads beyond the zones. Every building is a Dalab set piece
// (VERN.defs on the page; the test's table in node) or a PENDING box the set lacks (NL_TOWN.PENDING, PLAN.md section 7).
//
// NL_TOWN.make({dims, seed}) -> {lots, ways, extra, rings, moles, quays, roads, caravan, census, notes, zones}: dims(key, v) ->
// {w, d, h} the kit's boxes. Every record keyed by a stable id ('nl.town.' + n, 'nl.works.' + n, 'nl.extra.<what>'), x z in
// the page's frame (NL_GROUND).
var NL_TOWN=(function(){
 const G=NL_GROUND,face=d=>Math.atan2(d[0],d[1]);   /* a piece's front toward d (x, z) */
 /* the pieces the Dalab set lacks (PLAN.md section 7, "New pieces"): a declared box each; the page draws a stand-in. The village
    row's own (core/hamlet/dalab) are the same keys */
 const PENDING={
  nl_boatshed:{w:16,d:9,h:5,what:'a boat shed of timber and thatch on the shore'},
  nl_fishracks:{w:16,d:10,h:3.5,what:'fish racks and a smokehouse'},
  nl_smokehouse:{w:14,d:10,h:6,what:'the smokehouse: earth walls, a turf roof, the vents'},
  nl_slip:{w:14,d:40,h:6,what:'the shipwright\'s slip and its shed'},
  nl_ferry:{w:12,d:26,h:4,what:'the ferry stage for the boats to Ledge\'s lifts'},
  nl_jetty:{w:8,d:30,h:1.6,what:'a timber jetty on piles'},
  nl_vats:{w:24,d:18,h:7,what:'the gene-houses\' vats: a stone hall over the breeding vats'},
  nl_genebeds:{w:30,d:22,h:3,what:'the gene beds: walled breeding beds under shade cloth'},
  nl_tithebarn:{w:44,d:24,h:11,what:'the tithe barn and counting house'},
  nl_roastbed:{w:24,d:16,h:2.5,what:'an ore roasting bed'},
  nl_smelter:{w:18,d:14,h:9,what:'a copper smelter: the furnace house and its bellows'},
  nl_foundry:{w:30,d:22,h:10,what:'the bronze foundry: casting pits under a long roof'},
  nl_charcoal:{w:20,d:16,h:4,what:'a charcoal yard: clamps, the cord stacks, a shed'},
  nl_oreyard:{w:30,d:30,h:3,what:'the ore yard: the bins, the sorting floor'},
  nl_adit:{w:8,d:6,h:4,what:'a mine adit (a timbered mouth and its spoil)'},
  nl_line_station:{w:60,d:24,h:12,what:'the Line\'s station 5 (an Ancient station: KTRANSIT\'s line kind, step N6)'}};
 /* the people a building holds (est.: households of 6 in a peasant hut, families in the compounds and rows, servants in the
    nobles' halls, the soldiers in the barracks); summed in census and held to PLAN.md's 10,000 by the test */
 const PEOPLE={dalab_hut_a:6,dalab_hut_b:5,dalab_hut_c:6,dalab_compound:14,dalab_rowhouse:12,dalab_tenement:10,dalab_noble_a:24,dalab_noble_b:30,
  dalab_noble_c:28,dalab_priest_house:6,dalab_priest_compound:36,dalab_barracks:160,dalab_shops:8,dalab_workshop:6,dalab_potter:6,dalab_weaver:6,
  dalab_dyer:4,dalab_smithy:5,dalab_tavern:6,dalab_inn:18,dalab_warehouse:2,dalab_scribes:4,dalab_bathhouse:3,dalab_healers:12,dalab_temple:6,
  dalab_watchtower:3,dalab_gate:4,dalab_earthyard:3,nl_vats:6,nl_tithebarn:4,nl_boatshed:3,nl_smokehouse:2,nl_slip:4,nl_ferry:2,nl_line_station:0,
  nl_smelter:2,nl_foundry:3,nl_charcoal:2,nl_oreyard:1};
 const LAB=[Math.sin(7.7*Math.PI/180),-Math.cos(7.7*Math.PI/180)];   /* the lab's bearing: 7.7 degrees east of north (PLAN.md 2.1) */
 /* ---- THE TOWN's frame is the page's. Its places (PLAN.md 3.2) */
 const PIN=G.PIN,MOUND=[PIN[0],PIN[1]],PLAZA=[PIN[0]+LAB[0]*95,PIN[1]+LAB[1]*95];
 const MARKET=[68,-194],GRANARY={c:[330,-1060],w:230,d:170},CARAVAN={c:[-560,-430],w:240,d:160};
 const PRECINCT={c:[PIN[0]+20,PIN[1]+40],r:430};   /* the earthwork ring round the mound, the court and the gene-houses */
 /* the build zone: the precinct's ground round the mound and a band about 700 m wide along the harbour road down to the quays,
    with the shore wards north and south of the harbour (a Dalab town of round huts in yards is sparse: about 100 people a
    hectare in the wards, PLAN.md 3.1; the owner, 2026-11-16: 20,000 in the town, spread over its quarters) */
 const ZONE=[[-1450,1550],[-880,1720],[-380,1450],[-360,820],[180,140],[700,-450],[790,-450],[790,-2100],[300,-2100],[160,-1050],[-400,-280],[-960,420],[-1450,750]];
 const AVENUES=[
  ['the harbour road','avenue',[PLAZA,[-640,640],[-380,300],[-120,-40],[160,-420],[430,-790],[600,-1080],[760,-1260]]],
  ['the south road','avenue',[[PLAZA[0]-110,PLAZA[1]-20],[-1060,1300],[-960,1520],[-900,1700],[-900,1940]]],
  ['the shore road','avenue',[[770,-650],[772,-1000],[772,-1350],[772,-1700],[780,-2030]]],
  ['the Kould road','main',[[-120,-40],[-700,-150],[-1500,-250],[-2080,-300]]],
  ['the river road','main',[[-120,-40],[500,150],[790,240]]]];
 /* ---- THE WORKS' frame: its origin at (6050, 2450) on the page */
 const WO=[6050,2450];
 const WZONE=[[5640,2050],[6150,2050],[6150,2900],[5640,2900]];
 const WAVENUES=[['the works road','avenue',[[5650,2060],[5655,2450],[5660,2895]]],['the ore road','main',[[5655,2400],[6145,2425]]]];
 const tune=(half,cls)=>({cell:2.5,rasterHalf:half,maxSlope:.2,exact:true,
  width:{avenue:10,main:7,side:5,alley:3,highway:9,lane:4},
  lot:{side:2.2,setback:2,rear:4,inset:1.2,step:3},
  classes:cls||{manor:[['dalab_noble_c',0]],rich:[['dalab_noble_a',0],['dalab_priest_house',0],['dalab_compound',0]],
   middle:[['dalab_compound',0],['dalab_rowhouse',0],['dalab_hut_c',0]],poor:[['dalab_hut_a',0],['dalab_hut_b',0],['dalab_hut_c',0],['dalab_tenement',0]],
   shop:[['dalab_shops',0],['dalab_workshop',0],['dalab_potter',0],['dalab_weaver',0]],tavern:[['dalab_tavern',0]],industrial:[['dalab_smithy',0],['dalab_dyer',0],['dalab_earthyard',0],['dalab_warehouse',0]]},
  fallback:{manor:'rich',rich:'middle',middle:'poor',shop:'middle',tavern:'shop',industrial:'poor',poor:null},
  civic:[],civicSpacing:40,civicJitter:14,
  voidMax:46,voidIters:14,voidBatch:10,sideSpacing:64,sideMax:200,alleyFrac:.3,blindMax:90,interiorDepth:14,interiorRounds:1,
  avenueSnap:40,ringGap:8,verge:6,mapHalf:half,plazaArt:{rich:[],middle:[],poor:[],commerce:[]}});
 const civicTown=[];
 for(let i=0;i<10;i++)civicTown.push({key:'dalab_well',v:0,near:'res'});
 for(let i=0;i<6;i++)civicTown.push({key:'dalab_shrine',v:0,near:'res'});
 for(let i=0;i<8;i++)civicTown.push({key:i%2?'dalab_shops':'dalab_workshop',v:0,near:'market'});
 for(const k of['dalab_potter','dalab_weaver','dalab_weaver','dalab_dyer','dalab_dyer','dalab_tavern','dalab_inn'])civicTown.push({key:k,v:0,near:'market'});
 for(const k of['dalab_tavern','dalab_tavern','dalab_smithy','dalab_warehouse','dalab_warehouse','dalab_workshop'])civicTown.push({key:k,v:0,near:'harbour'});
 /* no orchard plot (dalab_orchard): its trees are drawn through the Dalab page's own biome hook (86-bio-45-init.js dnTree), not read here */
 for(const k of['dalab_earthyard','dalab_earthyard','dalab_windmill','dalab_windmill','dalab_well','dalab_shrine'])civicTown.push({key:k,v:0,near:'edge'});
 const civicWorks=[{key:'dalab_well',v:0,near:'res'},{key:'dalab_well',v:0,near:'res'},{key:'dalab_shrine',v:0,near:'res'},{key:'dalab_tavern',v:0,near:'works'},
  {key:'dalab_shops',v:0,near:'works'},{key:'dalab_smithy',v:0,near:'works'},{key:'dalab_smithy',v:0,near:'works'},{key:'dalab_workshop',v:0,near:'works'}];
 /* core/city's steps a ward of round huts in yards keeps: all of them (the alleys reach the yards behind) */
 function city(o,spec){
  const L=KCITY.lib,SL=L.SL,OCC=L.OCC,Raster=L.Raster,obb=L.obb,obbCorners=L.obbCorners,[OX,OZ]=spec.origin;
  const dims=(k,v)=>{const D=o.dims(k,v);return D?Object.assign({},D,{w:Math.max(D.w,(D.fw||0))+2,d:Math.max(D.d,(D.fd||0))+2}):null;};   /* a plot 2 m wider and deeper than its building */
  const loc=p=>[p[0]-OX,p[1]-OZ],h=(x,z)=>G.h(x+OX,z+OZ);
  const box=(c,ry,w,d,m)=>{const u=[Math.cos(ry),-Math.sin(ry)];return obb(c,u,w/2+(m||0),d/2+(m||0));};
  const steps=[
   {name:'the site and its ground',run(){const R=SL.R=new Raster(L.tune().rasterHalf,L.tune().cell);R.occ.fill(OCC.OUT);
    const P=L.plan(),zone=spec.zone.map(loc);P.site=[{id:0,name:spec.name,role:'zone',poly:zone}];P.zone=zone;
    const land=KCITY.site.zoneRaster(R,zone,{dry:G.LAKE+1.4,maxSlope:L.tune().maxSlope,h});
    SL.minSpacing=KCITY.site.minSpacing();SL.note(0,spec.name+': '+land+' cells of dry ground');}},
   {name:'landmarks',run(){const P=L.plan(),CG=L.cg();
    for(const m of spec.landmarks){const D0=o.dims(m.key,m.v|0);if(!D0){SL.note(1,'no piece '+m.key);continue;}
     const D={w:Math.max(D0.w,D0.fw||0),d:Math.max(D0.d,D0.fd||0),h:D0.h},c=loc(m.at),o2=box(c,m.ry,D.w,D.d);
     const Lt={id:P.lots.length,cls:'landmark',role:m.role,key:m.key,v:m.v|0,slot:0,wealth:1,x:c[0],z:c[1],y:CG.pad(o2),ry:m.ry,w:D.w,d:D.d,h:D.h,lot:o2,bo:o2,way:-1,side:0,s:0,born:1,died:null,civic:true,nlId:m.id,name:m.name};
     P.lots.push(Lt);SL.hashLot(Lt);SL.register(Lt);P.landmarks.push(Lt);SL.R.stampPoly(obbCorners(box(c,m.ry,D.w,D.d,m.pad==null?4:m.pad)),OCC.HARD,Lt.id);}
    for(const poly of spec.hard||[])SL.R.stampPoly(poly.map(loc),OCC.HARD,-1);   /* the open grounds: the plaza, the yards, the caravan ground, the rings' banks */
    SL.note(1,P.landmarks.length+' landmarks');}},
   {name:'districts',run(){SL.note(2,'the quarters are wealth and the landmarks, not districts');}},
   {name:'avenues',run(){for(const [tag,cls,pts] of spec.avenues)SL.addWay(cls,pts.map(loc),3,{tag});SL.note(3,spec.avenues.length+' avenues');}},
   {name:'highways',run(){SL.note(4,'the roads beyond the zone are the town\'s records (NL_TOWN roads)');}},
   {name:'the wall and its gates',run(){L.plan().gates=[];SL.note(5,'no wall (PLAN.md question 8, proposed): the earthwork rings are the town\'s records');}}
  ].concat(KCITY.defaultSteps().slice(6));
  const W=p=>spec.wealth([p[0]+OX,p[1]+OZ]);
  const rules={wealth:W,vacant:(p,rs)=>rs.chance(spec.vacant([p[0]+OX,p[1]+OZ])),
   near:Object.fromEntries(Object.entries(spec.near).map(([k,f])=>[k,c=>f([c.p[0]+OX,c.p[1]+OZ])]))};
  const notes=[];
  const finish=[function(Ci){const P=Ci.plan;let n=0;
   for(const Lt of P.lots){if(Lt.died!=null||Lt.cls==='landmark'||!Lt.bo)continue;   /* every house, not only the civic pieces: an alley of step 12 can graze a lot laid before it (core/city's exact rule misses it; KNOWN_ISSUES.md) */const D=dims(Lt.key,Lt.v)||{},hw=(D.w-2)/2,hd=(D.d-2)/2,B=Lt.bo;
    if(P.ways.some(w=>w.died==null&&w.pts.some(p=>{const dx=p[0]-B.c[0],dz=p[1]-B.c[1],m=w.w/2-.6;return Math.abs(dx*B.u[0]+dz*B.u[1])<hw+m&&Math.abs(dx*B.v[0]+dz*B.v[1])<hd+m;}))){Lt.died='finish';n++;}}
   notes.push(n+' pieces a street reached, dropped');}];
  const C=KCITY.create({name:spec.name,tune:spec.tune,seed:spec.seed,rand:'krand',index:{order:'insertion'},ground:{h},kit:{dims},rules,steps,finish});
  C.run();
  const PL=C.plan,fp=(k,v)=>{const D=o.dims(k,v)||{};return {fw:D.fw||D.w||0,fd:D.fd||D.d||0};};
  const lots=PL.lots.filter(Lt=>Lt.died==null&&Lt.bo&&Lt.key).map((Lt,n)=>({id:Lt.nlId?'nl.'+Lt.nlId:spec.prefix+n,key:Lt.key,v:Lt.v|0,cls:Lt.cls,civic:!!Lt.civic,
   x:Lt.x+OX,z:Lt.z+OZ,y:Lt.y==null?G.h(Lt.x+OX,Lt.z+OZ):Lt.y,ry:Lt.ry,w:Lt.w,d:Lt.d,h:Lt.h,fw:fp(Lt.key,Lt.v).fw,fd:fp(Lt.key,Lt.v).fd,
   people:PEOPLE[Lt.key]||0,wealth:Lt.wealth,name:Lt.name||null,quarter:spec.name}));
  const ways=PL.ways.filter(w=>w.died==null).map(w=>({id:spec.prefix+'way.'+w.id,cls:w.cls,w:w.w,tag:w.tag||null,pts:w.pts.map(p=>[p[0]+OX,p[1]+OZ])}));
  return {lots,ways,notes:(PL.notes||[]).concat(notes),instance:C};}
 /* a landmark: [id, key, at, the way its front faces (a point or a direction), role, name] */
 const toward=(p,q)=>face([q[0]-p[0],q[1]-p[1]]);
 function make(o){const seed=o.seed==null?44300:o.seed,dd=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  const LM=[];const lm=(id,key,at,ry,role,name,pad)=>LM.push({id,key,v:0,at,ry,role,name,pad});
  /* 1. the mound and the priests' precinct (the mound faces the lab, across the bay and the lake to Ledge) */
  lm('mound','dalab_mound',MOUND,face(LAB),'precinct','The ceremonial mound of Nulab',6);
  lm('priests','dalab_priest_compound',[PIN[0]+180,PIN[1]+140],toward([PIN[0]+180,PIN[1]+140],PLAZA),'precinct','The priests\' compound');
  lm('temple','dalab_temple',[PIN[0]+20,PIN[1]+160],face([0,-1]),'precinct','The temple on the mound\'s ground');
  for(let i=0;i<4;i++)lm('priest.'+i,'dalab_priest_house',[PIN[0]-80+i*40,PIN[1]+235],face([0,-1]),'precinct','A priest\'s house');
  lm('banners','dalab_banners',[PLAZA[0]+LAB[0]*42,PLAZA[1]+LAB[1]*42],face(LAB),'precinct','The banners of Dalab on the plaza',2);
  /* 2. the gene-houses, east of the mound */
  const GH=[PIN[0]+300,PIN[1]-10];
  lm('healers','dalab_healers',GH,toward(GH,PLAZA),'gene','The healers\' hall');
  lm('vats','nl_vats',[GH[0]+70,GH[1]+20],toward([GH[0]+70,GH[1]+20],PLAZA),'gene','The gene-houses\' vats');
  lm('seed.a','dalab_granaries',[GH[0]-10,GH[1]+70],face([0,-1]),'gene','The seed store of the gene stock');
  lm('seed.b','dalab_granaries',[GH[0]+20,GH[1]+70],face([0,-1]),'gene','The seed store of the gene stock');
  lm('beds.a','nl_genebeds',[GH[0]+30,GH[1]+130],face([0,-1]),'gene','The gene beds');lm('beds.b','nl_genebeds',[GH[0]+75,GH[1]+130],face([0,-1]),'gene','The gene beds');
  /* 3. the governor's court and the tithe, on the mound's west side (PLAN.md question 9, proposed: a priest, the Warden of the Lake) */
  const CT=[PIN[0]-300,PIN[1]-40];
  lm('court','dalab_noble_c',CT,toward(CT,PLAZA),'court','The Warden of the Lake\'s manor');
  lm('hall.a','dalab_noble_a',[CT[0]-40,CT[1]+80],toward([CT[0]-40,CT[1]+80],PLAZA),'court','A noble\'s stone hall');
  lm('hall.b','dalab_noble_a',[CT[0]-30,CT[1]+160],toward([CT[0]-30,CT[1]+160],PLAZA),'court','A noble\'s stone hall');
  lm('scribes','dalab_scribes',[CT[0]+60,CT[1]-70],toward([CT[0]+60,CT[1]-70],PLAZA),'court','The scribes\' hall: the basin\'s tithe counted');
  lm('baths','dalab_bathhouse',[CT[0]+10,CT[1]+240],face([1,0]),'court','The bath house');
  /* 4. the garrison, between the mound and the south road's gate (PLAN.md question 8, proposed: ~300 soldiers, ~60 of them Giants) */
  lm('barracks.a','dalab_barracks',[-1090,1560],face([1,0]),'garrison','The garrison\'s barracks (the Giants)');
  lm('barracks.b','dalab_barracks',[-800,1650],face([-1,0]),'garrison','The garrison\'s barracks');
  lm('watch.south','dalab_watchtower',[-860,1880],face([0,1]),'garrison','The watch tower on the south road');
  lm('watch.west','dalab_watchtower',[-2000,-260],face([-1,0]),'garrison','The watch tower on the Kould road');
  /* 6. the granaries: a yard of granary rows, the warehouses and the tithe barn by the harbour road, in its own earthwork */
  const GY=GRANARY.c,fe=face([1,0]);
  lm('tithebarn','nl_tithebarn',[GY[0]-60,GY[1]+50],fe,'granary','The tithe barn and counting house');
  for(let i=0;i<4;i++)for(let j=0;j<3;j++)lm('granary.'+i+'.'+j,'dalab_granaries',[GY[0]-20+i*30,GY[1]-55+j*28],fe,'granary','A granary of the tithe',2);
  for(let i=0;i<3;i++)lm('warehouse.'+i,'dalab_warehouse',[GY[0]+100,GY[1]-50+i*36],fe,'granary','A warehouse',2);
  /* 8. the market */
  lm('market','dalab_market_large',MARKET,toward(MARKET,[20,-230]),'market','The great market');
  lm('inn','dalab_inn',[MARKET[0]+80,MARKET[1]+70],toward([MARKET[0]+80,MARKET[1]+70],MARKET),'market','The travellers\' inn');
  const hardT=[];
  const sq=(c,w,d)=>[[c[0]-w/2,c[1]-d/2],[c[0]+w/2,c[1]-d/2],[c[0]+w/2,c[1]+d/2],[c[0]-w/2,c[1]+d/2]];
  hardT.push(sq(PLAZA,90,60));   /* the plaza with its fire, kept open */
  hardT.push(sq(GY,GRANARY.w,GRANARY.d));   /* the granary yard */
  hardT.push(sq(CARAVAN.c,CARAVAN.w,CARAVAN.d));   /* the caravan ground */
  /* the precinct's earthwork: a ring bank 430 m round the mound's ground, gates where the harbour road and the south road cross
     it (and at the river road's bearing, east); its line kept clear on the raster, so the streets come in by its gates */
  const RING={c:PRECINCT.c,r:PRECINCT.r,w:8,gates:[]};
  const angOf=p=>Math.atan2(p[1]-RING.c[1],p[0]-RING.c[0]);
  const crossAng=pts=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],da=dd(a,RING.c)-RING.r,db=dd(b,RING.c)-RING.r;if(da*db<=0){const t=da/(da-db);return angOf([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return null;};
  for(const [tag,,pts] of AVENUES){const a=crossAng(pts);if(a!=null)RING.gates.push({a,tag});}
  RING.gates.push({a:Math.PI*.04,tag:'the gene-houses\' gate'});
  const inGate=a=>RING.gates.some(g=>{let d=Math.abs(a-g.a)%(2*Math.PI);d=Math.min(d,2*Math.PI-d);return d*RING.r<16;});
  RING.segs=[];{const n=Math.ceil(2*Math.PI*RING.r/24);for(let k=0;k<n;k++){const a0=k/n*2*Math.PI,a1=(k+1)/n*2*Math.PI,am=(a0+a1)/2;if(inGate(am))continue;
   const p0=[RING.c[0]+Math.cos(a0)*RING.r,RING.c[1]+Math.sin(a0)*RING.r],p1=[RING.c[0]+Math.cos(a1)*RING.r,RING.c[1]+Math.sin(a1)*RING.r];RING.segs.push([p0,p1]);
   const ux=(p1[0]-p0[0]),uz=(p1[1]-p0[1]),L=Math.hypot(ux,uz),nx=-uz/L*(RING.w/2+3),nz=ux/L*(RING.w/2+3);
   hardT.push([[p0[0]+nx,p0[1]+nz],[p1[0]+nx,p1[1]+nz],[p1[0]-nx,p1[1]-nz],[p0[0]-nx,p0[1]-nz]]);}}
  /* the granary yard's bank: round the yard, its gate on the harbour road side */
  const GR={c:GY,w:GRANARY.w+16,d:GRANARY.d+16,ry:0};
  const wealthT=p=>{let w=.45;const dm=dd(p,MOUND);if(dm<RING.r+250)w=Math.max(w,.82-dm/2400+(p[0]<MOUND[0]?.08:0));   /* the nobles' and priests' kin near the precinct, the west side richest */
   const dmk=dd(p,MARKET);if(dmk<450)w=Math.max(w,.55);
   if(p[0]>350&&p[1]<-500)w=Math.min(w,.24);   /* the harbour's wards: fishers and boatmen */
   if(p[1]>1700||p[0]<-1800||p[0]>600&&p[1]>-300)w=Math.min(w,.2);   /* the farmers' wards at the edges */
   return Math.max(0,Math.min(1,w));};
  const vacantT=p=>{const dm=dd(p,MOUND),dmk=dd(p,MARKET),dh=dd(p,[780,-1300]);const k=Math.min(dm/1200,dmk/900,dh/700);return Math.max(.36,Math.min(.82,.38+.42*k));};   /* yards and orchards between the huts, more of them away from the market, the mound and the harbour */
  const nearT={res:p=>Math.abs(wealthT(p)-.4)*400+dd(p,MARKET)*.1,market:p=>dd(p,MARKET),harbour:p=>dd(p,[740,-1250]),edge:p=>-Math.min(dd(p,MARKET),1600)+(p[1]>1400?-200:0)};
  const T=city(o,{name:'Nulab',prefix:'nl.town.',origin:[0,0],seed,zone:ZONE,landmarks:LM,hard:hardT,avenues:AVENUES,wealth:wealthT,vacant:vacantT,near:nearT,
   tune:Object.assign(tune(2200),{civic:civicTown})});
  /* ---- 7. THE WORKS: the copper works' quarter at the outlet, on the east bank (PLAN.md question 6, proposed: the near rift
     fill's ore, the skarn's down the Kould road), its own frame */
  const WL=[];const wl=(id,key,at,ry,name)=>WL.push({id:'works.'+id,key,v:0,at,ry,role:'works',name});
  const fw=face([-1,0]);
  wl('oreyard','nl_oreyard',[5740,2260],fw,'The ore yard');
  for(let i=0;i<3;i++)wl('roast.'+i,'nl_roastbed',[5760,2300+i*26],fw,'An ore roasting bed');
  for(let i=0;i<3;i++)wl('smelter.'+i,'nl_smelter',[5745,2520+i*24],fw,'A copper smelter');
  wl('foundry','nl_foundry',[5755,2640],fw,'The bronze foundry');
  wl('charcoal.a','nl_charcoal',[5960,2300],fw,'The charcoal yard');wl('charcoal.b','nl_charcoal',[5960,2550],fw,'The peat and charcoal yard');
  wl('warehouse.a','dalab_warehouse',[5745,2180],fw,'The copper warehouse');wl('warehouse.b','dalab_warehouse',[5745,2730],fw,'The bronze warehouse');
  wl('watch','dalab_watchtower',[5700,2180],fw,'The watch tower at the outlet');
  const wealthW=p=>dd(p,[5760,2450])<160?.15:.3,vacantW=p=>.5;
  const nearW={res:p=>dd(p,[6200,2700]),works:p=>dd(p,[5720,2450])};
  const Wk=city(o,{name:'the copper works',prefix:'nl.works.',origin:WO,seed:seed+17,zone:WZONE,landmarks:WL,hard:[],avenues:WAVENUES,wealth:wealthW,vacant:vacantW,near:nearW,
   tune:Object.assign(tune(800),{civic:civicWorks})});
  const lots=T.lots.concat(Wk.lots),ways=T.ways.concat(Wk.ways);
  /* ---- the town's own records (the page draws them as the lots) */
  const extra=[],put=(id,key,p,ry,o2)=>{const D=o.dims(key,0);if(!D)return null;
   const r=Object.assign({id:'nl.extra.'+id,key,v:0,x:p[0],z:p[1],y:G.h(p[0],p[1]),ry,w:D.w,d:D.d,h:D.h,fw:D.fw||D.w,fd:D.fd||D.d,people:PEOPLE[key]||0,kind:'extra'},o2||{});extra.push(r);return r;};
  /* 5. THE HARBOUR on the bay's west shore: the quays along the dredged basin (a stone bank, its top 2 m over the lake), the mole
     out from the basin's north end and down its seaward side (its mouth to the south), the boat sheds and the fish racks along
     the shore north and south of the quays, the smokehouse, the shipwright's slip, the ferry stage at the quays' south end */
  const H=G.HARBOUR,QY=G.LAKE+2;
  const quays={x:H.x0-3,z0:H.z0,z1:H.z1,w:12,top:QY};
  const MOLE=[[[H.x0-6,H.z0-6],[H.x1+40,H.z0-6]],[[H.x1+40,H.z0-6],[H.x1+40,H.z1-140]]],moles=MOLE.map((s,i)=>({id:'nl.extra.mole.'+i,a:s[0],b:s[1],w:14,top:QY-.3}));
  put('ferry','nl_ferry',[H.x0+14,H.z1-30],face([1,0]),{y:QY,kind:'harbour',name:'The ferry stage: the boats to Ledge\'s lifts'});
  for(let i=0;i<6;i++){const z=H.z0-110-i*26,x=G.shoreX(z)-14;put('boatshed.n'+i,'nl_boatshed',[x,z],face([1,0]),{kind:'harbour'});}
  for(let i=0;i<5;i++){const z=H.z1+90+i*30,x=G.shoreX(z)-22;put('fishracks.'+i,'nl_fishracks',[x,z],face([1,0]),{kind:'harbour'});}
  {const z=H.z1+250,x=G.shoreX(z)-24;put('smokehouse','nl_smokehouse',[x,z],face([1,0]),{kind:'harbour'});}
  {const z=H.z0-300,x=G.shoreX(z)-6;put('slip','nl_slip',[x,z],face([1,0]),{kind:'harbour',name:'The shipwright\'s slip'});}
  /* 9. THE LINE QUARTER on the main south shore, where the lake viaduct came ashore (PLAN.md question 2, proposed): the station's
     site (a pending box: the station, the viaduct's stubs and Loj Faiv are step N6), Dalab's station factor and clerks */
  const LQ=[-1450,-4520];let lq=LQ.slice();for(let k=0;k<60&&G.h(lq[0],lq[1])<G.LAKE+2.5;k++)lq[1]+=10;
  put('line.station','nl_line_station',[lq[0],lq[1]+20],face([0,-1]),{kind:'line',name:'The Line\'s station 5 (its site; the station is step N6)'});
  put('line.factor','dalab_noble_c',[lq[0]+90,lq[1]+90],face([0,-1]),{kind:'line',name:'The station factor\'s house'});
  put('line.union','dalab_compound',[lq[0]-80,lq[1]+90],face([0,-1]),{kind:'line',name:'The Union\'s house'});
  for(let i=0;i<3;i++)put('line.clerks.'+i,'dalab_rowhouse',[lq[0]-30+i*30,lq[1]+150],face([0,-1]),{kind:'line'});
  for(let i=0;i<2;i++)put('line.hut.'+i,'dalab_hut_a',[lq[0]+60+i*20,lq[1]+160],face([0,-1]),{kind:'line'});
  put('line.warehouse','dalab_warehouse',[lq[0]+170,lq[1]+40],face([0,-1]),{kind:'line'});
  /* the ferry across the Chimes Riba at the outlet (the river road meets the works road there) and the jetty on the works' bank */
  put('ferry.river','nl_ferry',[5420,1980],face([1,0]),{kind:'harbour',name:'The river ferry at the outlet',y:G.LAKE+1.6});
  put('jetty.works','nl_jetty',[5600,2460],face([-1,0]),{kind:'harbour',name:'The works\' jetty: the ore boats',y:G.LAKE+1.4});
  /* ---- the roads beyond the zones: the river road on to the outlet's ferry, the Line road along the shore, the south road on
     to the iron road (32 km south: PLAN.md section 6), the Kould road west */
  const roads=[{id:'nl.road.river',cls:'road',w:6,tag:'the river road',pts:[[790,240],[1600,420],[2800,700],[4000,1200],[4900,1700],[5380,1960]]},
   {id:'nl.road.line',cls:'road',w:6,tag:'the Line road',pts:[[780,-2030],[400,-2700],[-200,-3500],[-900,-4100],[lq[0]+40,lq[1]+60]]},
   {id:'nl.road.south',cls:'road',w:6,tag:'the iron road',pts:[[-900,1940],[-860,2800],[-800,4200],[-760,6000]]},
   {id:'nl.road.kould',cls:'road',w:6,tag:'the Kould road',pts:[[-2080,-300],[-3000,-420],[-4400,-500],[-6000,-560]]}];
  const census={buildings:lots.length+extra.length,people:0,byKey:{},byQuarter:{},pending:0};
  for(const r of lots.concat(extra)){census.people+=r.people;census.byKey[r.key]=(census.byKey[r.key]||0)+1;const q=r.quarter||r.kind;census.byQuarter[q]=(census.byQuarter[q]||0)+r.people;if(PENDING[r.key])census.pending++;}
  return {lots,ways,extra,rings:{precinct:RING,granary:GR},moles,quays,roads,caravan:CARAVAN,plaza:PLAZA,market:MARKET,granary:GRANARY,census,
   notes:{town:T.notes,works:Wk.notes},zones:{town:ZONE,works:WZONE},instances:[T.instance,Wk.instance],line:lq};}
 return {make,PEOPLE,PENDING,ZONE,WZONE,LAB,MARKET,GRANARY,CARAVAN,PRECINCT};
})();
