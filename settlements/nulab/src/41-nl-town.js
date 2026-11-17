// ================================================================= NULAB — the town on core/city (records; draws nothing)
// [G data] Step N3 of PLAN.md (the owner, 2026-11-16: 20,000 in the town; clustered by the sea around the harbour, the
// ceremonial mound set back from the coast inside its palisade, the rest of the city closer to it and the coast and surrounded
// by an earthen mound, ~33 % denser, with crop plots in among the empty lots). Two core/city instances in their own frames:
// THE TOWN, clustered on the bay coast round (180, -1350) (±1.05 km raster), and THE WORKS, the copper works' quarter on the
// Chimes Riba's east bank at the outlet (±0.75 km round (6050, 2450)). Each lays its landmarks (step 1, stamped HARD) and
// avenues (step 3), then core/city's steps 6-12 lay the civic pieces, the lots, the main and side streets and the alleys, and
// a deterministic infill pass lays Dalab crop plots in the open unbuilt lots inside the zone. Beside them the town's own
// records: the palisaded earthen ring round the set-back ceremonial mound and priests' precinct, the outer earthen mound
// surrounding the coastal city from shore to shore, the granary yard's bank, the harbour (quays, the mole, the boat sheds, the
// fish racks, the ferry stage), the Line quarter's houses and station site, the town's surrounding crop fields, and the roads.
//
// NL_TOWN.make({dims, seed}) -> {lots, ways, extra, cropPlots, townFarms, rings, moles, quays, roads, caravan, census, notes, zones}
var NL_TOWN=(function(){
 const G=NL_GROUND,face=d=>Math.atan2(d[0],d[1]);   /* a piece's front toward d (x, z) */
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
 /* the town's infill crop plots (drawn by a Dalab builder in 90o-nl-build.js, not pending): dimensions for node and page */
 const PLOT_SIZES=[[38,28],[30,22],[22,16],[16,13],[11,11]];
 const TOWN_CROPS=['helix bean','ashroot','giant lotus root','sea-linen flax','valley woad','mist greens'];
 const PEOPLE={dalab_hut_a:6,dalab_hut_b:5,dalab_hut_c:6,dalab_compound:14,dalab_rowhouse:12,dalab_tenement:10,dalab_noble_a:24,dalab_noble_b:30,
  dalab_noble_c:28,dalab_priest_house:6,dalab_priest_compound:36,dalab_barracks:160,dalab_shops:8,dalab_workshop:6,dalab_potter:6,dalab_weaver:6,
  dalab_dyer:4,dalab_smithy:5,dalab_tavern:6,dalab_inn:18,dalab_warehouse:2,dalab_scribes:4,dalab_bathhouse:3,dalab_healers:12,dalab_temple:6,
  dalab_watchtower:3,dalab_gate:4,dalab_earthyard:3,nl_vats:6,nl_tithebarn:4,nl_boatshed:3,nl_smokehouse:2,nl_slip:4,nl_ferry:2,nl_line_station:0,
  nl_smelter:2,nl_foundry:3,nl_charcoal:2,nl_oreyard:1,nl_cropplot:0};
 const LAB=[Math.sin(7.7*Math.PI/180),-Math.cos(7.7*Math.PI/180)];
 /* ---- THE COASTAL TOWN: clustered by the bay round the harbour (z -1650..-1050, shore x ~820..900), its ceremonial mound set
    back from the sea on the rise at (-385, -1350) inside its palisaded ring, the wards packed ~33 % denser between the palisade
    and the coast and surrounded from shore to shore by an outer earthen mound */
 const TO=[140,-1350];
 const SEA=[1,0];   /* seaward from the set-back mound across the plaza and down the harbour avenue to the bay */
 const MOUND=[-385,-1350],PLAZA=[-286,-1350];
 const PRECINCT={c:[-410,-1350],r:212,w:9.5,h:3.8,palisade:true};
 const MARKET=[330,-1350],GRANARY={c:[575,-1055],w:210,d:156},CARAVAN={c:[230,-1675],w:176,d:120};
 /* the outer earthen mound: a smooth coastal D-arc from the north bay shore (795, -2175), round the north wards, behind the
    set-back palisaded mound (-665, -1350), and round the south wards back to the south bay shore (885, -525) */
 const OUTER_CHAIN=(function(){const pts=[[795,-2175],[640,-2188]];const cx=540,cz=-1350,rx=1205,rz=838,N=24;
  for(let k=1;k<N;k++){const a=-Math.PI/2+k/N*Math.PI;pts.push([Math.round(cx-Math.sin(a+.5*(a/(Math.PI/2)-Math.sign(a)*0))*0-Math.cos(a)*rx),Math.round(cz+Math.sin(a)*rz)]);}
  pts.push([660,-512],[885,-525]);return pts;})();
 /* build zone inside the outer earthen mound (inset ~16 m inside OUTER_CHAIN, and stopping clear of the shore road's beach side) */
 const ZONE=(function(){const inner=OUTER_CHAIN.map(p=>{const dx=p[0]-260,dz=p[1]+1350,L=Math.hypot(dx,dz)||1;return[Math.round(p[0]-dx/L*18),Math.round(p[1]-dz/L*18)];});
  return inner.concat([[845,-590],[795,-920],[782,-1150],[782,-1550],[785,-1880],[785,-2120]]);})();
 const AVENUES=[
  ['the harbour road','avenue',[[PLAZA[0]+44,PLAZA[1]],[-180,-1350],[60,-1350],[330,-1350],[560,-1350],[772,-1350]]],
  ['the shore road','avenue',[[775,-2120],[772,-1800],[772,-1500],[772,-1200],[785,-900],[845,-585]]],
  ['the coast avenue','avenue',[[540,-2210],[470,-1960],[395,-1660],[330,-1350],[405,-1020],[490,-740],[560,-490]]],
  ['the mound ring','main',[[-410,-1118],[-280,-1145],[-182,-1245],[-172,-1350],[-182,-1455],[-280,-1555],[-410,-1582]]],
  ['the Kould road','avenue',[[80,-1350],[-60,-1480],[-215,-1640],[-370,-1765],[-525,-1885]]],
  ['the south road','avenue',[[80,-1350],[-60,-1220],[-215,-1060],[-370,-935],[-525,-815]]]];
 /* ---- THE WORKS' frame: its origin at (6050, 2450) on the page */
 const WO=[6050,2450];
 const WZONE=[[5640,2080],[6120,2080],[6120,2860],[5640,2860]];
 const WAVENUES=[['the works road','avenue',[[5650,2090],[5655,2450],[5660,2855]]],['the ore road','main',[[5655,2400],[6115,2425]]]];
 /* ~33 % denser block and lot cadence than the old sparse layout */
 const tune=(half,cls)=>({cell:2.5,rasterHalf:half,maxSlope:.2,exact:true,
  width:{avenue:10,main:7,side:4.8,alley:3,highway:9,lane:3.8},
  lot:{side:1.3,setback:1.5,rear:2.6,inset:.85,step:2.4},
  classes:cls||{manor:[['dalab_noble_c',0]],rich:[['dalab_noble_a',0],['dalab_priest_house',0],['dalab_compound',0]],
   middle:[['dalab_compound',0],['dalab_rowhouse',0],['dalab_compound',0],['dalab_hut_c',0]],
   poor:[['dalab_rowhouse',0],['dalab_tenement',0],['dalab_hut_a',0],['dalab_hut_b',0],['dalab_hut_c',0]],
   shop:[['dalab_shops',0],['dalab_workshop',0],['dalab_potter',0],['dalab_weaver',0]],tavern:[['dalab_tavern',0]],
   industrial:[['dalab_smithy',0],['dalab_dyer',0],['dalab_earthyard',0],['dalab_warehouse',0]]},
  fallback:{manor:'rich',rich:'middle',middle:'poor',shop:'middle',tavern:'shop',industrial:'poor',poor:null},
  civic:[],civicSpacing:34,civicJitter:10,
  voidMax:34,voidIters:16,voidBatch:12,sideSpacing:46,sideMax:170,alleyFrac:.38,blindMax:76,interiorDepth:12,interiorRounds:2,
  avenueSnap:36,ringGap:7,verge:5,mapHalf:half,plazaArt:{rich:[],middle:[],poor:[],commerce:[]}});
 const civicTown=[];
 for(let i=0;i<12;i++)civicTown.push({key:'dalab_well',v:0,near:'res'});
 for(let i=0;i<7;i++)civicTown.push({key:'dalab_shrine',v:0,near:'res'});
 for(let i=0;i<10;i++)civicTown.push({key:i%2?'dalab_shops':'dalab_workshop',v:0,near:'market'});
 for(const k of['dalab_potter','dalab_potter','dalab_weaver','dalab_weaver','dalab_dyer','dalab_dyer','dalab_tavern','dalab_inn'])civicTown.push({key:k,v:0,near:'market'});
 for(const k of['dalab_tavern','dalab_tavern','dalab_smithy','dalab_warehouse','dalab_warehouse','dalab_workshop'])civicTown.push({key:k,v:0,near:'harbour'});
 for(const k of['dalab_earthyard','dalab_earthyard','dalab_windmill','dalab_windmill','dalab_windmill','dalab_well','dalab_shrine'])civicTown.push({key:k,v:0,near:'edge'});
 const civicWorks=[{key:'dalab_well',v:0,near:'res'},{key:'dalab_well',v:0,near:'res'},{key:'dalab_shrine',v:0,near:'res'},{key:'dalab_tavern',v:0,near:'works'},
  {key:'dalab_shops',v:0,near:'works'},{key:'dalab_smithy',v:0,near:'works'},{key:'dalab_smithy',v:0,near:'works'},{key:'dalab_workshop',v:0,near:'works'}];
 /* polyline cutter: split a bank chain into runs keeping clear of `gates` ({p: [x, z], half}) */
 function cutChain(pts,gates){const fine=[];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/14));
   for(let k=0;k<n;k++)fine.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}fine.push(pts[pts.length-1]);
  const open=p=>gates.some(g=>Math.hypot(p[0]-g.p[0],p[1]-g.p[1])<g.half);
  const runs=[];let cur=[];for(const p of fine){if(open(p)){if(cur.length>=2)runs.push(cur);cur=[];}else cur.push(p);}if(cur.length>=2)runs.push(cur);return runs;}
 function segQuads(runs,halfW){const out=[];for(const r of runs)for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i],ux=b[0]-a[0],uz=b[1]-a[1],L=Math.hypot(ux,uz)||1,nx=-uz/L*halfW,nz=ux/L*halfW;
   out.push([[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]]);}return out;}
 function segCross(a,b,c,d){const den=(b[0]-a[0])*(d[1]-c[1])-(b[1]-a[1])*(d[0]-c[0]);if(!den)return null;
  const t=((c[0]-a[0])*(d[1]-c[1])-(c[1]-a[1])*(d[0]-c[0]))/den,u=((c[0]-a[0])*(b[1]-a[1])-(c[1]-a[1])*(b[0]-a[0]))/den;
  return t>=0&&t<=1&&u>=0&&u<=1?[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]:null;}
 function city(o,spec){
  const L=KCITY.lib,SL=L.SL,OCC=L.OCC,Raster=L.Raster,obb=L.obb,obbCorners=L.obbCorners,[OX,OZ]=spec.origin;
  const dims=(k,v)=>{const D=o.dims(k,v);return D?Object.assign({},D,{w:Math.max(D.w,(D.fw||0))+1.2,d:Math.max(D.d,(D.fd||0))+1.2}):null;};
  const loc=p=>[p[0]-OX,p[1]-OZ],h=(x,z)=>G.h(x+OX,z+OZ);
  const box=(c,ry,w,d,m)=>{const u=[Math.cos(ry),-Math.sin(ry)];return obb(c,u,w/2+(m||0),d/2+(m||0));};
  const notes=[],cropPlots=[];
  const steps=[
   {name:'the site and its ground',run(){const R=SL.R=new Raster(L.tune().rasterHalf,L.tune().cell);R.occ.fill(OCC.OUT);
    const P=L.plan(),zone=spec.zone.map(loc);P.site=[{id:0,name:spec.name,role:'zone',poly:zone}];P.zone=zone;
    const land=KCITY.site.zoneRaster(R,zone,{dry:G.LAKE+1.4,maxSlope:L.tune().maxSlope,h});
    SL.minSpacing=KCITY.site.minSpacing();SL.note(0,spec.name+': '+land+' cells of dry ground');}},
   {name:'landmarks',run(){const P=L.plan(),CG=L.cg();
    for(const m of spec.landmarks){const D0=o.dims(m.key,m.v|0);if(!D0){SL.note(1,'no piece '+m.key);continue;}
     const D={w:Math.max(D0.w,D0.fw||0),d:Math.max(D0.d,D0.fd||0),h:D0.h},c=loc(m.at),o2=box(c,m.ry,D.w,D.d);
     const Lt={id:P.lots.length,cls:'landmark',role:m.role,key:m.key,v:m.v|0,slot:0,wealth:1,x:c[0],z:c[1],y:CG.pad(o2),ry:m.ry,w:D.w,d:D.d,h:D.h,lot:o2,bo:o2,way:-1,side:0,s:0,born:1,died:null,civic:true,nlId:m.id,name:m.name};
     P.lots.push(Lt);SL.hashLot(Lt);SL.register(Lt);P.landmarks.push(Lt);SL.R.stampPoly(obbCorners(box(c,m.ry,D.w,D.d,m.pad==null?3:m.pad)),OCC.HARD,Lt.id);}
    for(const poly of spec.hard||[])SL.R.stampPoly(poly.map(loc),OCC.HARD,-1);
    SL.note(1,P.landmarks.length+' landmarks');}},
   {name:'districts',run(){SL.note(2,'the quarters are wealth and the landmarks, not districts');}},
   {name:'avenues',run(){for(const [tag,cls,pts] of spec.avenues)SL.addWay(cls,pts.map(loc),3,{tag});SL.note(3,spec.avenues.length+' avenues');}},
   {name:'highways',run(){SL.note(4,'the roads beyond the zone are the town\'s records (NL_TOWN roads)');}},
   {name:'the wall and its gates',run(){L.plan().gates=[];SL.note(5,'the outer earthen mound and the mound\'s palisade are the town\'s records');}}
  ].concat(KCITY.defaultSteps().slice(6));
  const W=p=>spec.wealth([p[0]+OX,p[1]+OZ]);
  const rules={wealth:W,vacant:(p,rs)=>rs.chance(spec.vacant([p[0]+OX,p[1]+OZ])),
   near:Object.fromEntries(Object.entries(spec.near).map(([k,f])=>[k,c=>f([c.p[0]+OX,c.p[1]+OZ])]))};
  const finish=[function(Ci){const P=Ci.plan,R=SL.R;let n=0;
   for(const Lt of P.lots){if(Lt.died!=null||Lt.cls==='landmark'||!Lt.bo)continue;
    const D=dims(Lt.key,Lt.v)||{},hw=(D.w-1.2)/2,hd=(D.d-1.2)/2,B=Lt.bo;
    if(P.ways.some(w=>w.died==null&&w.pts.some(p=>{const dx=p[0]-B.c[0],dz=p[1]-B.c[1],m=w.w/2-.6;return Math.abs(dx*B.u[0]+dz*B.u[1])<hw+m&&Math.abs(dx*B.v[0]+dz*B.v[1])<hd+m;}))){Lt.died='finish';n++;}}
   /* infill crop plots in the empty lots and unbuilt block pockets inside the zone (the owner, 2026-11-16) */
   const rs=KRAND.stream(KRAND.hash(spec.seed,901,7)),step=11,H=L.tune().rasterHalf-24,liveWays=P.ways.filter(w=>w.died==null);
   const wayIdx=L.KSPACE.create({cell:60});
   for(const w of liveWays)for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];wayIdx.insert({a,b,w:w.w},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+w.w+24);}
   const nearWayRy=(x,z)=>{let best=1e9,ry=0;for(const s of wayIdx.query(x,z,40)){const d=L.segDist([x,z],s.a,s.b);if(d<best){best=d;ry=Math.atan2(s.b[0]-s.a[0],s.b[1]-s.a[1]);}}return ry;};
   const wayHit=(B,hw,hd)=>{for(const s of wayIdx.query(B.c[0],B.c[1],Math.hypot(hw,hd)+8))if(L.polySegDist(obbCorners(B),s.a,s.b)<s.w/2+.6)return true;return false;};
   const cands=[];
   for(let lz=-H;lz<=H;lz+=step)for(let lx=-H;lx<=H;lx+=step){const x=lx+(rs.next()-.5)*5,z=lz+(rs.next()-.5)*5;
    if(R.at(x,z)!==OCC.FREE)continue;if(spec.skipCrop&&spec.skipCrop([x+OX,z+OZ]))continue;cands.push([x,z,rs.next()]);}
   cands.sort((a,b)=>a[2]-b[2]);
   for(const [x,z] of cands){const ry=nearWayRy(x,z);
    for(const [pw,pd] of PLOT_SIZES){const check=box([x,z],ry,pw,pd,1.0);if(R.blockedRect(check,0))continue;
     const B=box([x,z],ry,pw,pd,0);if(wayHit(B,pw/2,pd/2))continue;
     const corners=obbCorners(B);if(corners.some(q=>h(q[0],q[1])<G.LAKE+1.6))continue;
     R.stampPoly(obbCorners(box([x,z],ry,pw,pd,1.1)),OCC.HARD,-2);
     const ci=Math.floor(rs.next()*TOWN_CROPS.length),fallow=rs.next()<.14;
     cropPlots.push({id:spec.prefix+'crop.'+cropPlots.length,key:'nl_cropplot',x:x+OX,z:z+OZ,y:h(x,z),ry,w:pw,d:pd,h:1.4,fw:pw,fd:pd,
      crop:TOWN_CROPS[ci],state:fallow?'fallow':'crop',quarter:spec.name,people:0,kind:'crop'});break;}}
   notes.push(n+' pieces a street reached, dropped; '+cropPlots.length+' infill crop plots');}];
  const C=KCITY.create({name:spec.name,tune:spec.tune,seed:spec.seed,rand:'krand',index:{order:'insertion'},ground:{h},kit:{dims},rules,steps,finish});
  C.run();
  const PL=C.plan,fp=(k,v)=>{const D=o.dims(k,v)||{};return {fw:D.fw||D.w||0,fd:D.fd||D.d||0};};
  const lots=PL.lots.filter(Lt=>Lt.died==null&&Lt.bo&&Lt.key).map((Lt,n)=>({id:Lt.nlId?'nl.'+Lt.nlId:spec.prefix+n,key:Lt.key,v:Lt.v|0,cls:Lt.cls,civic:!!Lt.civic,
   x:Lt.x+OX,z:Lt.z+OZ,y:Lt.y==null?G.h(Lt.x+OX,Lt.z+OZ):Lt.y,ry:Lt.ry,w:Lt.w,d:Lt.d,h:Lt.h,fw:fp(Lt.key,Lt.v).fw,fd:fp(Lt.key,Lt.v).fd,
   people:PEOPLE[Lt.key]||0,wealth:Lt.wealth,name:Lt.name||null,quarter:spec.name}));
  const ways=PL.ways.filter(w=>w.died==null).map(w=>({id:spec.prefix+'way.'+w.id,cls:w.cls,w:w.w,tag:w.tag||null,pts:w.pts.map(p=>[p[0]+OX,p[1]+OZ])}));
  return {lots,ways,cropPlots,notes:(PL.notes||[]).concat(notes),instance:C};}
 const toward=(p,q)=>face([q[0]-p[0],q[1]-p[1]]);
 function make(o){const seed=o.seed==null?44300:o.seed,dd=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  const LM=[];const lm=(id,key,at,ry,role,name,pad)=>LM.push({id,key,v:0,at,ry,role,name,pad});
  /* 1. the ceremonial mound and priests' precinct, set back from the sea inside its palisade, facing seaward across the plaza */
  lm('mound','dalab_mound',MOUND,face(SEA),'precinct','The ceremonial mound of Nulab',6);
  lm('banners','dalab_banners',[PLAZA[0]+34,PLAZA[1]],face(SEA),'precinct','The banners of Dalab on the plaza',2);
  lm('priests','dalab_priest_compound',[-385,-1215],toward([-385,-1215],PLAZA),'precinct','The priests\' compound');
  lm('temple','dalab_temple',[-385,-1480],toward([-385,-1480],PLAZA),'precinct','The temple on the mound\'s ground');
  for(let i=0;i<4;i++)lm('priest.'+i,'dalab_priest_house',[-325+i*24,-1465],face([0,1]),'precinct','A priest\'s house',2);
  /* 2. the gene-houses, in the south-west arc of the precinct */
  lm('healers','dalab_healers',[-495,-1445],toward([-495,-1445],PLAZA),'gene','The healers\' hall');
  lm('vats','nl_vats',[-548,-1440],face([1,0]),'gene','The gene-houses\' vats');
  lm('seed.a','dalab_granaries',[-485,-1505],face([0,-1]),'gene','The seed store of the gene stock',2);
  lm('seed.b','dalab_granaries',[-515,-1505],face([0,-1]),'gene','The seed store of the gene stock',2);
  lm('beds.a','nl_genebeds',[-445,-1525],face([0,-1]),'gene','The gene beds',2);
  lm('beds.b','nl_genebeds',[-500,-1545],face([0,-1]),'gene','The gene beds',2);
  /* 3. the Warden's court and the tithe, in the north-west arc of the precinct */
  lm('court','dalab_noble_c',[-500,-1245],toward([-500,-1245],PLAZA),'court','The Warden of the Lake\'s manor');
  lm('hall.a','dalab_noble_a',[-548,-1305],face([1,0]),'court','A noble\'s stone hall');
  lm('hall.b','dalab_noble_a',[-465,-1185],face([0,1]),'court','A noble\'s stone hall');
  lm('scribes','dalab_scribes',[-445,-1255],toward([-445,-1255],PLAZA),'court','The scribes\' hall: the basin\'s tithe counted');
  lm('baths','dalab_bathhouse',[-552,-1375],face([1,0]),'court','The bath house');
  /* 4. the garrison: two Giant barracks guarding the northwest and southwest gates of the outer earthen mound, and watchtowers */
  lm('barracks.a','dalab_barracks',[-330,-940],face([-1,1]),'garrison','The garrison\'s barracks (the Giants)');
  lm('barracks.b','dalab_barracks',[-330,-1760],face([-1,-1]),'garrison','The garrison\'s barracks');
  lm('watch.west','dalab_watchtower',[-618,-1350],face([-1,0]),'garrison','The watch tower behind the mound');
  lm('watch.south','dalab_watchtower',[220,-560],face([0,1]),'garrison','The south watch tower on the earthen mound');
  lm('watch.north','dalab_watchtower',[220,-2140],face([0,-1]),'garrison','The north watch tower on the earthen mound');
  /* 6. the granaries: granary rows, warehouses and the tithe barn behind the harbour quays, in its own bank */
  const GY=GRANARY.c,fe=face([1,0]);
  lm('tithebarn','nl_tithebarn',[GY[0]-54,GY[1]+42],fe,'granary','The tithe barn and counting house');
  for(let i=0;i<4;i++)for(let j=0;j<3;j++)lm('granary.'+i+'.'+j,'dalab_granaries',[GY[0]-16+i*28,GY[1]-50+j*26],fe,'granary','A granary of the tithe',2);
  for(let i=0;i<3;i++)lm('warehouse.'+i,'dalab_warehouse',[GY[0]+88,GY[1]-46+i*34],fe,'granary','A warehouse',2);
  /* 8. the market, on the grand harbour avenue between the mound's palisade and the quays */
  lm('market','dalab_market_large',MARKET,face([1,0]),'market','The great market');
  lm('inn','dalab_inn',[MARKET[0]+68,MARKET[1]+62],toward([MARKET[0]+68,MARKET[1]+62],MARKET),'market','The travellers\' inn');
  const hardT=[];
  const sq=(c,w,d)=>[[c[0]-w/2,c[1]-d/2],[c[0]+w/2,c[1]-d/2],[c[0]+w/2,c[1]+d/2],[c[0]-w/2,c[1]+d/2]];
  hardT.push(sq(PLAZA,86,58));
  hardT.push(sq(GY,GRANARY.w,GRANARY.d));
  hardT.push(sq(CARAVAN.c,CARAVAN.w,CARAVAN.d));
  /* ---- the inner palisaded ring round the ceremonial mound and priests' precinct */
  const PRING={c:PRECINCT.c,r:PRECINCT.r,w:PRECINCT.w,h:PRECINCT.h,palisade:true,
   gates:[{a:0,tag:'the harbour gate',half:16},{a:-Math.PI/2,tag:'the north postern',half:11},{a:Math.PI/2,tag:'the south postern',half:11}]};
  {const chain=[];const N=72;for(let k=0;k<=N;k++){const a=k/N*2*Math.PI;chain.push([PRING.c[0]+Math.cos(a)*PRING.r,PRING.c[1]+Math.sin(a)*PRING.r]);}
   const gpts=PRING.gates.map(g=>({p:[PRING.c[0]+Math.cos(g.a)*PRING.r,PRING.c[1]+Math.sin(g.a)*PRING.r],half:g.half,tag:g.tag}));
   PRING.runs=cutChain(chain,gpts);PRING.segs=[];for(const r of PRING.runs)for(let i=1;i<r.length;i++)PRING.segs.push([r[i-1],r[i]]);
   for(const q of segQuads(PRING.runs,PRING.w/2+3.5))hardT.push(q);
   lm('gate.precinct','dalab_gate',[PRING.c[0]+PRING.r,PRING.c[1]],face([1,0]),'precinct','The palisade gate of the mound',2);}
  /* ---- the outer earthen mound surrounding the coastal city from the north shore to the south shore */
  const OM={w:16,h:5.2,gates:[]};
  for(const [tag,,pts] of AVENUES){for(let i=1;i<pts.length;i++)for(let j=1;j<OUTER_CHAIN.length;j++){
    const x=segCross(pts[i-1],pts[i],OUTER_CHAIN[j-1],OUTER_CHAIN[j]);
    if(x){const outDir=[pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]];if(dd(pts[0],TO)>dd(pts[pts.length-1],TO)){outDir[0]=-outDir[0];outDir[1]=-outDir[1];}
     OM.gates.push({p:x,half:20,ry:face(outDir),tag});break;}}}
  OM.runs=cutChain(OUTER_CHAIN,OM.gates);OM.segs=[];for(const r of OM.runs)for(let i=1;i<r.length;i++)OM.segs.push([r[i-1],r[i]]);
  for(const q of segQuads(OM.runs,OM.w/2+4))hardT.push(q);
  OM.gates.forEach((g,i)=>lm('gate.outer.'+i,'dalab_gate',g.p,g.ry,'garrison','Gate in the earthen mound ('+g.tag+')',2));
  /* the granary yard's bank */
  const GR={c:GY,w:GRANARY.w+14,d:GRANARY.d+14,ry:0};
  const wealthT=p=>{const dp=dd(p,PRECINCT.c);if(dp<PRECINCT.r)return .9;
   let w=.46;if(dp<PRECINCT.r+220)w=Math.max(w,.76-(dp-PRECINCT.r)/700);
   const dmk=dd(p,MARKET);if(dmk<360)w=Math.max(w,.58);
   if(p[0]>580)w=Math.min(w,.3);   /* the harbour and shore wards: fishers, boatmen and warehousemen */
   if(p[1]<-1920||p[1]>-760||p[0]<-280&&dp>PRECINCT.r+60)w=Math.min(w,.25);   /* the farmers' wards inside the earthen mound */
   return Math.max(0,Math.min(1,w));};
  /* ~33 % denser in the harbour and market core (.10-.22 vacant), opening to .44 in the farmers' band inside the outer earthen mound so larger crop fields sit among the outer wards */
  const outerDist=p=>{let best=1e9;for(let i=1;i<OUTER_CHAIN.length;i++)best=Math.min(best,KCITY.lib.segDist(p,OUTER_CHAIN[i-1],OUTER_CHAIN[i]));return best;};
  const vacantT=p=>{if(dd(p,PRECINCT.c)<PRECINCT.r)return .65;
   const od=outerDist(p);if(od<165)return .44-.12*(od/165);
   const dmk=dd(p,MARKET),dh=dd(p,[740,-1350]),dm=Math.max(0,dd(p,PRECINCT.c)-PRECINCT.r);
   const k=Math.min(dmk/650,dh/550,dm/500);return Math.max(.10,Math.min(.28,.10+.18*k));};
  const nearT={res:p=>Math.abs(wealthT(p)-.42)*350+dd(p,MARKET)*.1,market:p=>dd(p,MARKET),harbour:p=>dd(p,[740,-1350]),
   edge:p=>-Math.min(dd(p,MARKET),950)};
  const skipCropT=p=>dd(p,PRECINCT.c)<PRECINCT.r+12||dd(p,MARKET)<110;
  const T=city(o,{name:'Nulab',prefix:'nl.town.',origin:TO,seed,zone:ZONE,landmarks:LM,hard:hardT,avenues:AVENUES,wealth:wealthT,vacant:vacantT,near:nearT,skipCrop:skipCropT,
   tune:Object.assign(tune(1080),{civic:civicTown})});
  /* ---- 7. THE WORKS: the copper works' quarter at the outlet, on the east bank */
  const WL=[];const wl=(id,key,at,ry,name)=>WL.push({id:'works.'+id,key,v:0,at,ry,role:'works',name});
  const fw=face([-1,0]);
  wl('oreyard','nl_oreyard',[5740,2260],fw,'The ore yard');
  for(let i=0;i<3;i++)wl('roast.'+i,'nl_roastbed',[5760,2300+i*26],fw,'An ore roasting bed');
  for(let i=0;i<3;i++)wl('smelter.'+i,'nl_smelter',[5745,2520+i*24],fw,'A copper smelter');
  wl('foundry','nl_foundry',[5755,2640],fw,'The bronze foundry');
  wl('charcoal.a','nl_charcoal',[5960,2300],fw,'The charcoal yard');wl('charcoal.b','nl_charcoal',[5960,2550],fw,'The peat and charcoal yard');
  wl('warehouse.a','dalab_warehouse',[5745,2180],fw,'The copper warehouse');wl('warehouse.b','dalab_warehouse',[5745,2730],fw,'The bronze warehouse');
  wl('watch','dalab_watchtower',[5700,2180],fw,'The watch tower at the outlet');
  const wealthW=p=>dd(p,[5760,2450])<160?.18:.34,vacantW=p=>.3;
  const nearW={res:p=>dd(p,[6120,2680]),works:p=>dd(p,[5720,2450])};
  const Wk=city(o,{name:'the copper works',prefix:'nl.works.',origin:WO,seed:seed+17,zone:WZONE,landmarks:WL,hard:[],avenues:WAVENUES,wealth:wealthW,vacant:vacantW,near:nearW,
   skipCrop:p=>dd(p,[5755,2480])<180,tune:Object.assign(tune(760),{civic:civicWorks})});
  const lots=T.lots.concat(Wk.lots),ways=T.ways.concat(Wk.ways),cropPlots=T.cropPlots.concat(Wk.cropPlots);
  /* ---- the town's own records */
  const extra=[],put=(id,key,p,ry,o2)=>{const D=o.dims(key,0);if(!D)return null;
   const r=Object.assign({id:'nl.extra.'+id,key,v:0,x:p[0],z:p[1],y:G.h(p[0],p[1]),ry,w:D.w,d:D.d,h:D.h,fw:D.fw||D.w,fd:D.fd||D.d,people:PEOPLE[key]||0,kind:'extra'},o2||{});extra.push(r);return r;};
  /* 5. THE HARBOUR on the bay's west shore, right in front of the coastal city */
  const H=G.HARBOUR,QY=G.LAKE+2;
  const quays={x:H.x0-3,z0:H.z0,z1:H.z1,w:12,top:QY};
  const MOLE=[[[H.x0-6,H.z0-6],[H.x1+40,H.z0-6]],[[H.x1+40,H.z0-6],[H.x1+40,H.z1-140]]],moles=MOLE.map((s,i)=>({id:'nl.extra.mole.'+i,a:s[0],b:s[1],w:14,top:QY-.3}));
  put('ferry','nl_ferry',[H.x0+14,H.z1-30],face([1,0]),{y:QY,kind:'harbour',name:'The ferry stage: the boats to Ledge\'s lifts'});
  for(let i=0;i<6;i++){const z=H.z0-95-i*26,x=G.shoreX(z)-14;put('boatshed.n'+i,'nl_boatshed',[x,z],face([1,0]),{kind:'harbour'});}
  for(let i=0;i<5;i++){const z=H.z1+85+i*28,x=G.shoreX(z)-22;put('fishracks.'+i,'nl_fishracks',[x,z],face([1,0]),{kind:'harbour'});}
  {const z=H.z1+240,x=G.shoreX(z)-24;put('smokehouse','nl_smokehouse',[x,z],face([1,0]),{kind:'harbour'});}
  {const z=H.z0-280,x=G.shoreX(z)-6;put('slip','nl_slip',[x,z],face([1,0]),{kind:'harbour',name:'The shipwright\'s slip'});}
  /* 9. THE LINE QUARTER on the main south shore, north-northwest along the coast road */
  const LQ=[-1450,-4520];let lq=LQ.slice();for(let k=0;k<60&&G.h(lq[0],lq[1])<G.LAKE+2.5;k++)lq[1]+=10;
  put('line.station','nl_line_station',[lq[0],lq[1]+20],face([0,-1]),{kind:'line',name:'The Line\'s station 5 (its site; the station is step N6)'});
  put('line.factor','dalab_noble_c',[lq[0]+90,lq[1]+90],face([0,-1]),{kind:'line',name:'The station factor\'s house'});
  put('line.union','dalab_compound',[lq[0]-80,lq[1]+90],face([0,-1]),{kind:'line',name:'The Union\'s house'});
  for(let i=0;i<3;i++)put('line.clerks.'+i,'dalab_rowhouse',[lq[0]-30+i*30,lq[1]+150],face([0,-1]),{kind:'line'});
  for(let i=0;i<2;i++)put('line.hut.'+i,'dalab_hut_a',[lq[0]+60+i*20,lq[1]+160],face([0,-1]),{kind:'line'});
  put('line.warehouse','dalab_warehouse',[lq[0]+170,lq[1]+40],face([0,-1]),{kind:'line'});
  put('ferry.river','nl_ferry',[5420,1980],face([1,0]),{kind:'harbour',name:'The river ferry at the outlet',y:G.LAKE+1.6});
  put('jetty.works','nl_jetty',[5600,2460],face([-1,0]),{kind:'harbour',name:'The works\' jetty: the ore boats',y:G.LAKE+1.4});
  /* ---- the roads beyond the outer earthen mound's gates */
  const roads=[
   {id:'nl.road.river',cls:'road',w:6,tag:'the river road',pts:[[560,-490],[920,-80],[1900,450],[3200,980],[4450,1520],[5380,1960]]},
   {id:'nl.road.line',cls:'road',w:6,tag:'the Line road',pts:[[540,-2210],[220,-2800],[-320,-3550],[-880,-4080],[lq[0]+40,lq[1]+60]]},
   {id:'nl.road.south',cls:'road',w:6,tag:'the iron road',pts:[[-525,-815],[-720,120],[-860,1800],[-820,3800],[-760,6000]]},
   {id:'nl.road.kould',cls:'road',w:6,tag:'the Kould road',pts:[[-525,-1885],[-1550,-1720],[-2900,-1250],[-4400,-820],[-6000,-560]]}];
  const census={buildings:lots.length+extra.length,people:0,byKey:{},byQuarter:{},pending:0,cropPlots:cropPlots.length};
  for(const r of lots.concat(extra)){census.people+=r.people;census.byKey[r.key]=(census.byKey[r.key]||0)+1;const q=r.quarter||r.kind;census.byQuarter[q]=(census.byQuarter[q]||0)+r.people;if(PENDING[r.key])census.pending++;}
  return {lots,ways,extra,cropPlots,rings:{precinct:PRING,outer:OM,granary:GR},moles,quays,roads,caravan:CARAVAN,plaza:PLAZA,market:MARKET,mound:MOUND,granary:GRANARY,census,
   notes:{town:T.notes,works:Wk.notes},zones:{town:ZONE,works:WZONE,outer:OUTER_CHAIN},instances:[T.instance,Wk.instance],line:lq};}
 return {make,PEOPLE,PENDING,ZONE,WZONE,OUTER_CHAIN,LAB,SEA,MOUND,PLAZA,MARKET,GRANARY,CARAVAN,PRECINCT};
})();
