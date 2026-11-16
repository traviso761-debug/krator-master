/* ================================================================= THEODIGA TODAY: the town on the east rim (records; draws nothing)
   [G data] T-town-1 (PLAN.md): the pilgrims' town beside the ruined dam, laid out on core/city (one instance, KCITY.create)
   and built from the scrap Xanadu set (kits/xanadu, PLAN-SCRAP.md). The page will draw its records; a node test
   (test-th-town.js) and Godot read the same records.

   THE FRAME   the dam's (x across the span, east +; z along the stream, the lake at -z). The city runs in its own frame,
               centred on the town's middle (x 796, z 0): u = x - 796, v = z, so its raster is centred on the origin (core/city's
               rule). The records come back in the dam's frame.
   THE SITE    the east rim's plateau, x 352 to 1240, z -326 to 326. Off it: Gate Square (the head of the Stair of Descent) and
               the Warden's House beside it, both landmarks the page draws; the heads of the Salvage Road and the Silt Road where
               they leave the plateau; any ground steeper than TUNE.maxSlope.
   THE STREETS Bazaar Street (an avenue from Gate Square east, past the East Gate, to the kora), the Ancient line (the avenue
               on east across the upland fields), the outer kora (a closed avenue round the town, past the stair's head), the
               Salvage way and the Silt way (mains from Bazaar Street to the road heads), the cross street (a main from kora to
               kora). core/city's steps 6-12 do the rest: civic buildings by `near`, avenue lots, main streets across the voids,
               side streets and the infill.
   THE QUARTERS wealth by place (rules.wealth): the hostels round the square rich, the bazaar and the gate the craftsmen and
               merchants, the salvagers downstream (+z) and the farmers upstream (-z) between, the poor tier east of the gate,
               beyond the kora the farms (the choosers draw `farm` there) with their fields.

   TH_TOWN.make({ground, dims, seed}) -> {lots, ways, fields, landmarks, census, notes, centre}: ground(x, z) the plateau's height
   in the dam's frame (440 when not given), dims(key, v) -> {w, d, h} the kit's boxes (XAK.dims on the page; the test's table in
   node). Every lot is a record keyed by a stable id ('th.town.' + n). */
var TH_TOWN=(function(){
 const C=[796,0],X0=352,X1=1240,Z1=326,KORA={x0:362,x1:985,z:312,r:34},BZ=-30,GATE=[875,BZ],FARM_W=42;
 const SQUARE={id:'th.town.square',name:'Gate Square',x0:345,x1:440,z0:-70,z1:10};
 const WARDEN={id:'th.town.warden',name:'the Warden\'s House',x0:345,x1:440,z0:12,z1:90};
 const HEADS=[{id:'th.town.head.silt',name:'the Silt Road\'s head',x:470,z:-326,r:16},{id:'th.town.head.salvage',name:'the Salvage Road\'s head',x:430,z:326,r:16}];
 /* the people a building holds (its trade's workers live over or beside it; PLAN.md: about 4,100 in the town) */
 const PEOPLE={xa_scrap_court:14,xa_scrap_house:7,xa_scrap_row:15,xa_scrap_tank_house:5,xa_scrap_hull:4,xa_scrap_glint:5,xa_scrap_shacks:12,
  xa_scrap_silos:9,xa_scrap_farm:11,xa_scrap_bazaar:4,xa_scrap_store:2,xa_scrap_granary:0,xa_scrap_bath:3,xa_scrap_guild_hall:3,
  xa_scrap_guild_salvage:3,xa_scrap_tower:4,xa_scrap_shrine:2,xa_scrap_gate:12,xa_scrap_serai:20,xa_scrap_pavilion:0,
  /* the Qiblai kit's (the owner, 2026-11-16: "we can also mix in some qiblai-style buildings"): the faith's buildings and the
     houses of those who serve it; a hostel's pilgrims are guests, not counted (its keepers are) */
  qb_court_house:14,qb_row_rich:10,qb_row_mid:7,qb_shop_row:8,qb_hostel:6,qb_wheel_house:1,qb_chorten:0,qb_shrine:0,qb_gate_temple:4};
 const QUARTERS=['square','bazaar','gate','salvage','farmers','poor','farms'];
 const QUARTER_NAME={square:'Gate Square and the hostels',bazaar:'the bazaar',gate:'the East Gate',salvage:'the salvagers',farmers:'the farmers and dairies',poor:'the poor tier',farms:'the upland farms'};
 /* which quarter a point (the dam's frame) stands in */
 const quarterOf=(x,z)=>x>KORA.x1+4?'farms':Math.hypot(x-392,z-BZ)<175?'square':(x>800&&x<905&&Math.abs(z-BZ)<95)?'gate':x>=905?'poor':Math.abs(z-BZ)<80?'bazaar':z>BZ?'salvage':'farmers';
 /* how much frontage each quarter leaves open (rules.vacant: the yards, gardens and waste between the houses) */
 const VACANT={square:.05,bazaar:0,gate:.05,salvage:.6,farmers:.5,poor:.3,farms:.45};
 const SKIP=['alleys and alley lots'];
 const tune=()=>({
  cell:2.5,rasterHalf:470,maxSlope:.22,exact:true,
  width:{avenue:9,main:7,side:5,alley:3,highway:10,lane:4},
  lot:{side:1.8,setback:1.6,rear:3,inset:1,step:3},
  /* scrap Xanadu everywhere; Qiblai's courts and rows among the rich (the priests' kin, the Warden's officers) and a Qiblai
     shop row among the shops. Not Qiblai's middle row house: at 9 m it fits frontage the scrap houses do not, and took a
     quarter of the town */
  classes:{manor:[['xa_scrap_court',0],['xa_scrap_court',2],['qb_court_house',0]],rich:[['xa_scrap_court',0],['xa_scrap_court',1],['xa_scrap_court',2],['xa_scrap_row',2],['qb_court_house',1],['qb_row_rich',0]],
   middle:[['xa_scrap_house',0],['xa_scrap_house',1],['xa_scrap_row',0],['xa_scrap_row',1],['xa_scrap_row',2]],
   poor:[['xa_scrap_tank_house',0],['xa_scrap_tank_house',1],['xa_scrap_hull',0],['xa_scrap_hull',1],['xa_scrap_glint',0],['xa_scrap_glint',1],['xa_scrap_shacks',0],['xa_scrap_shacks',1],['xa_scrap_silos',0]],
   shop:[['xa_scrap_bazaar',0],['xa_scrap_bazaar',1],['xa_scrap_bazaar',2],['xa_scrap_row',1],['qb_shop_row',0]],tavern:[['xa_scrap_row',2]],
   industrial:[['xa_scrap_store',0],['xa_scrap_store',1],['xa_scrap_store',2]],farm:[['xa_scrap_farm',0],['xa_scrap_farm',1],['xa_scrap_farm',2]]},
  fallback:{manor:'rich',rich:'middle',middle:'poor',shop:'middle',tavern:'shop',industrial:'poor',poor:null,farm:null},
  /* the faith's buildings are Qiblai's (the temple estates build them as the holy city does): the pilgrims' hostels and a
     chorten by Gate Square, wayside shrines along Bazaar Street, a gate temple beside the East Gate, and a wheel house at each
     corner of the kora where the pilgrims turn; the town's own buildings, its shrine among them, are scrap Xanadu */
  civic:[{key:'xa_scrap_bath',v:0,near:'square'},{key:'xa_scrap_shrine',v:0,near:'square'},{key:'xa_scrap_pavilion',v:0,near:'square'},
   {key:'xa_scrap_tower',v:0,near:'square'},{key:'qb_hostel',v:0,near:'square'},{key:'qb_hostel',v:1,near:'hostels'},{key:'qb_chorten',v:0,near:'square'},
   {key:'xa_scrap_guild_hall',v:0,near:'bazaar'},{key:'xa_scrap_bazaar',v:0,near:'bazaar'},{key:'xa_scrap_bazaar',v:2,near:'bazaar'},
   {key:'qb_shrine',v:0,near:'bazaar'},{key:'qb_shrine',v:1,near:'bazaar'},
   {key:'xa_scrap_serai',v:0,near:'gate'},{key:'xa_scrap_gate',v:0,near:'gateway'},{key:'qb_gate_temple',v:0,near:'gateway'},
   {key:'xa_scrap_store',v:0,near:'gate'},{key:'xa_scrap_store',v:1,near:'gate'},{key:'xa_scrap_guild_salvage',v:0,near:'salvage'},
   {key:'xa_scrap_store',v:2,near:'salvage'},{key:'xa_scrap_store',v:0,near:'salvage'},{key:'xa_scrap_granary',v:0,near:'farmers'},
   {key:'xa_scrap_granary',v:1,near:'fields'},{key:'qb_wheel_house',v:0,near:'koraNE'},{key:'qb_wheel_house',v:1,near:'koraSE'},
   {key:'qb_wheel_house',v:2,near:'koraSW'},{key:'qb_wheel_house',v:0,near:'koraNW'}],
  civicSpacing:55,civicJitter:20,
  voidMax:42,voidIters:12,voidBatch:8,sideSpacing:46,sideMax:180,alleyFrac:.2,blindMax:80,interiorDepth:9,interiorRounds:2,
  avenueSnap:40,ringGap:8,verge:6,reach:640,centre:[0,0],mapHalf:470,
  plazaArt:{rich:[],middle:[],poor:[],commerce:[]}});
 const toL=(x,z)=>[x-C[0],z-C[1]],toW=(u,v)=>[u+C[0],v+C[1]];
 const box=(x0,x1,z0,z1)=>[toL(x0,z0),toL(x1,z0),toL(x1,z1),toL(x0,z1)];
 const circ=(x,z,r)=>{const out=[];for(let i=0;i<24;i++){const a=i/24*2*Math.PI;out.push(toL(x+r*Math.cos(a),z+r*Math.sin(a)));}return out;};
 /* the kora: a rectangle with rounded corners, every 6 m (the dam's frame) */
 const koraPts=()=>{const K=KORA,out=[],cs=[[K.x1-K.r,-K.z+K.r,-Math.PI/2],[K.x1-K.r,K.z-K.r,0],[K.x0+K.r,K.z-K.r,Math.PI/2],[K.x0+K.r,-K.z+K.r,Math.PI]];
  for(const [cx,cz,a0] of cs)for(let i=0;i<=6;i++){const a=a0+i/6*Math.PI/2;out.push([cx+K.r*Math.cos(a),cz+K.r*Math.sin(a)]);}return out;};
 const CORNERS={koraNE:[KORA.x1,-KORA.z],koraSE:[KORA.x1,KORA.z],koraSW:[KORA.x0+60,KORA.z],koraNW:[KORA.x0+60,-KORA.z]};
 /* the streets in the dam's frame */
 const BAZAAR=[[442,BZ],[560,BZ-2],[700,BZ+2],[GATE[0],BZ],[KORA.x1,BZ]];
 const LINE=[[KORA.x1,BZ],[1060,BZ-6],[1150,BZ-4],[X1-6,BZ+4]];
 const SALVAGE=[[520,BZ],[505,110],[465,230],[HEADS[1].x,KORA.z]];
 const SILT=[[520,BZ],[512,-150],[HEADS[0].x,-KORA.z]];
 const CROSS=[[700,-KORA.z],[704,-140],[700,BZ],[696,120],[700,KORA.z]];
 /* what a farm's three fields grow: grain, pulse and a root crop by turn, each a crop the Xanadu vale grows by rain (kits/crops,
    CROPS.forBiome('xanadu'), zone 'vale'), picked by the farm and field (seeded, the same on every machine). Without kits/crops:
    the bucket alone */
 const ROT=['grain','pulse','tuber'];let VALE=null;
 const thCrop=(fi,k)=>{const b=ROT[(fi+k+3)%3];if(typeof CROPS==='undefined')return {crop:b,bucket:b};
  if(!VALE)VALE=CROPS.forBiome('xanadu').filter(r=>r.zone==='vale'&&(r.how==='rain'||r.how==='irrigated'));
  const r=CROPS.pick(VALE,b,{seed:2207,salt:fi*3+k});return r?{crop:r.crop.id,bucket:b,name:r.crop.name}:{crop:b,bucket:b};};
 /* THE GROUND of the east rim's plateau (the dam's frame): 440 m, the cliff's top, with a gentle swell of up to 2 m from
    core/rand (KRAND.fbm, seeded) that eases in over the first 80 m from the rim, so the plateau meets the cliff's edge at 440
    exactly. The page's plateau is drawn on it (targets/theodiga/77-dam.js, when the town is on the page) and every lot stands
    on it: one function for both. Without core/rand (none on the page): flat */
 const ground=(x,z)=>{if(typeof KRAND==='undefined')return 440;const k=Math.max(0,Math.min(1,(x-345)/80));
  return 440+k*4*(KRAND.fbm(x/150,0,z/150,3,2207)-.5);};
 function make(o){
  o=o||{};const seed=o.seed==null?2207:o.seed,ground=o.ground||TH_TOWN_GROUND;
  const groundL=(u,v)=>ground(u+C[0],v+C[1]);
  const L=pts=>pts.map(p=>toL(p[0],p[1]));
  /* the zone: the town inside the kora (its west leg runs along the rim's edge, its north and south legs 14 m in from the
     plateau's ends, so no lot fits outside it) and the farm corridor along the Ancient line beyond it; the farms' fields lie
     behind them on the open plateau, off the zone */
  const KX=KORA.x1+7,KZ=KORA.z+6,zone=L([[KORA.x0-2,-KZ],[KX,-KZ],[KX,BZ-FARM_W],[X1,BZ-FARM_W],[X1,BZ+FARM_W],[KX,BZ+FARM_W],[KX,KZ],[KORA.x0-2,KZ]]);
  const steps=[
   {name:'the site and its ground',run(){const R=SL.R=new Raster(TUNE.rasterHalf,TUNE.cell);R.occ.fill(OCC.OUT);
    PLAN.site=[{id:0,name:'Build zone',role:'zone',poly:zone}];PLAN.zone=zone;
    const land=KCITY.site.zoneRaster(R,zone,{dry:-1e9,maxSlope:TUNE.maxSlope,h:groundL});
    /* off the zone: Gate Square and the Warden's House (6 m clear round each), the two road heads */
    for(const Q of [SQUARE,WARDEN])R.stampPoly(box(Q.x0-6,Q.x1+6,Q.z0-6,Q.z1+6),OCC.HARD,-1);
    for(const H of HEADS)R.stampPoly(circ(H.x,H.z,H.r),OCC.HARD,-1);
    SL.minSpacing=KCITY.site.minSpacing();SL.note(0,'the east rim\'s plateau, '+land+' cells; Gate Square, the Warden\'s House and the road heads kept');}},
   {name:'landmarks',run(){SL.note(1,'Gate Square and the Warden\'s House are the page\'s landmarks');}},
   {name:'districts',run(){SL.note(2,'the quarters are wealth and near, not districts');}},
   {name:'avenues',run(){
    SL.addWay('avenue',L(BAZAAR),3,{tag:'Bazaar Street'});SL.addWay('avenue',L(LINE),3,{tag:'the Ancient line'});
    SL.addWay('avenue',L(koraPts()),3,{tag:'the outer kora',closed:true});
    SL.addWay('main',L(SALVAGE),3,{tag:'the Salvage way'});SL.addWay('main',L(SILT),3,{tag:'the Silt way'});SL.addWay('main',L(CROSS),3,{tag:'the cross street'});
    SL.note(3,'Bazaar Street, the Ancient line, the kora; the Salvage, Silt and cross ways');}},
   {name:'highways',run(){SL.note(4,'the Ancient line is an avenue across the farms');}},
   {name:'the wall and its gates',run(){PLAN.gates=[];SL.note(5,'no wall: the East Gate is a gate house on Bazaar Street');}}
  ];
  /* core/city's steps 6-12, with one of the town's after the civic step: a 5 m margin kept round every civic building, so the
     main streets routed next pass its walls at a street's width (the router works on 2.5 m cells and brushed the serai's
     and a shrine's corners by up to 2 m without it) */
  const D6=KCITY.defaultSteps().slice(6).filter(st=>(o.skip||SKIP).indexOf(st.name)<0);
  const civicClear={name:'a margin round the civic buildings',run(){let n=0;
   for(const F of PLAN.lots)if(F.died==null&&F.civic&&F.bo){SL.R.stampPoly(obbCorners(obb(F.bo.c,F.bo.u,F.bo.hw+5,F.bo.hd+5)),OCC.HARD,F.id);n++;}
   SL.note(6,'a 5 m margin kept round '+n+' civic buildings');}};
  steps.push(D6[0],civicClear,...D6.slice(1));
  const D0=KCITY.defaults.choosers,farmy=f=>function(p,rs){return p[0]+C[0]>KORA.x1+8?'farm':f(p,rs);};
  const segN=(W,p)=>{let d=1e9;for(let i=1;i<W.length;i++)d=Math.min(d,segDist(p,W[i-1],W[i]));return d;};
  const bzL=resample(L(BAZAAR),6,false),salL=resample(L(SALVAGE),6,false),silL=resample(L(SILT),6,false),lineL=resample(L(LINE),6,false);
  const dW=(c,x,z)=>{const q=toL(x,z);return Math.hypot(c.p[0]-q[0],c.p[1]-q[1]);};
  const V=o.vacant||VACANT;
  const rules={
   wealth:p=>{const w=toW(p[0],p[1]),q=quarterOf(w[0],w[1]);
    const base={square:.88,bazaar:.6,gate:.55,salvage:.42,farmers:.45,poor:.15,farms:.12}[q];return clamp(base+.08*slFbm(p[0]/110+3,p[1]/110-5,2),0,1);},
   choosers:{avenue:farmy(D0.avenue),main:farmy(D0.main),side:farmy(D0.side),alley:farmy(D0.alley)},
   vacant:(p,rs)=>{const w=toW(p[0],p[1]);return rs.chance(V[quarterOf(w[0],w[1])]);},
   near:{
    square:c=>dW(c,470,BZ+40),hostels:c=>dW(c,480,BZ-55),bazaar:c=>segN(bzL,c.p)*3+Math.abs(c.p[0]-toL(640,0)[0])*.5,gate:c=>dW(c,GATE[0]-50,BZ+50),
    gateway:c=>segN(bzL,c.p)*4+dW(c,GATE[0],BZ),salvage:c=>segN(salL,c.p)*2+dW(c,480,200),farmers:c=>segN(silL,c.p)*2+dW(c,540,-200),
    fields:c=>segN(lineL,c.p)*2+dW(c,1060,60),
    koraNE:c=>dW(c,CORNERS.koraNE[0]-30,CORNERS.koraNE[1]+30),koraSE:c=>dW(c,CORNERS.koraSE[0]-30,CORNERS.koraSE[1]-30),
    koraSW:c=>dW(c,CORNERS.koraSW[0],CORNERS.koraSW[1]-30),koraNW:c=>dW(c,CORNERS.koraNW[0],CORNERS.koraNW[1]+30)}};
  /* the fields: strips behind each farm, away from its street, kept off every lot, way and other field */
  const finish=[function(){const farms=PLAN.lots.filter(F=>F.died==null&&F.bo&&F.key==='xa_scrap_farm'),out=[];
   const clearOf=ob=>{for(const F of PLAN.lots)if(F.died==null&&F.bo&&SL.pen(ob,F.bo)>-1)return false;for(const f of out)if(SL.pen(ob,f.o)>-2)return false;
    for(const w of PLAN.ways){for(let i=1;i<w.pts.length;i++)if(polySegDist(obbCorners(ob),w.pts[i-1],w.pts[i])<w.w/2+2)return false;}
    for(const p of obbCorners(ob)){const q=toW(p[0],p[1]);if(q[0]>X1||Math.abs(q[1])>Z1)return false;}return true;};
   const wayD=p=>{let d=1e9;for(const w of PLAN.ways)if(w.died==null)d=Math.min(d,segN(w.pts,p));return d;};
   farms.forEach((F,fi)=>{const u=F.bo.u,s=F.bo.hd+12,b0=F.bo.c;
    /* the fields go behind the farm, on the side of its box away from its street (the further of the two from any way);
       three strips side by side */
    const sg=wayD([b0[0]-F.bo.v[0]*s,b0[1]-F.bo.v[1]*s])>=wayD([b0[0]+F.bo.v[0]*s,b0[1]+F.bo.v[1]*s])?1:-1,v=[F.bo.v[0]*sg,F.bo.v[1]*sg];
    const back=[b0[0]-v[0]*(F.bo.hd+2),b0[1]-v[1]*(F.bo.hd+2)];
    for(let k=-1;k<=1;k++){const len=50+10*((fi+k+3)%3),hw=10,c=[back[0]-v[0]*len/2+u[0]*k*(2*hw+2),back[1]-v[1]*len/2+u[1]*k*(2*hw+2)],ob=obb(c,u,hw,len/2);
     if(c[0]+C[0]<KORA.x1+14||!clearOf(ob))continue;out.push({o:ob,farm:F,...thCrop(fi,k)});}});
   PLAN.thFields=out;}];
  const Ci=KCITY.create({name:'theodiga-town',tune:tune(),seed,rand:'krand',index:{order:'insertion'},ground:{h:groundL},kit:{dims:o.dims},rules,steps,finish});
  Ci.run();
  const PL=Ci.plan,idOf=new Map();
  const lots=PL.lots.filter(F=>F.died==null&&F.bo&&F.key).map((F,n)=>{const w=toW(F.x,F.z),id='th.town.'+n;idOf.set(F,id);
   return {id,key:F.key,v:F.v|0,cls:F.cls,civic:!!F.civic,x:w[0],z:w[1],y:F.y==null?groundL(F.x,F.z):F.y,ry:F.ry,w:F.w,d:F.d,h:F.h,
    quarter:quarterOf(w[0],w[1]),people:PEOPLE[F.key]||0};});
  const ways=PL.ways.filter(w=>w.died==null).map(w=>({id:'th.town.way.'+w.id,cls:w.cls,w:w.w,tag:w.tag,closed:!!w.closed,pts:w.pts.map(p=>toW(p[0],p[1]))}));
  const fields=(PL.thFields||[]).map((f,i)=>({id:'th.town.field.'+i,farm:idOf.get(f.farm),crop:f.crop,bucket:f.bucket,cropName:f.name||f.crop,
   corners:obbCorners(f.o).map(p=>toW(p[0],p[1]))}));
  const landmarks=[SQUARE,WARDEN].map(Q=>({id:Q.id,name:Q.name,x0:Q.x0,x1:Q.x1,z0:Q.z0,z1:Q.z1,y:ground((Q.x0+Q.x1)/2,(Q.z0+Q.z1)/2)}))
   .concat(HEADS.map(H=>({id:H.id,name:H.name,x:H.x,z:H.z,r:H.r,y:ground(H.x,H.z)})));
  const census={buildings:lots.length,people:0,byQuarter:{},byKey:{}};
  for(const q of QUARTERS)census.byQuarter[q]=0;
  for(const F of lots){census.people+=F.people;census.byQuarter[F.quarter]+=F.people;census.byKey[F.key]=(census.byKey[F.key]||0)+1;}
  return {lots,ways,fields,landmarks,census,notes:PL.log||[],centre:C};
 }
 const TH_TOWN_GROUND=ground;
 return {make,ground,PEOPLE,QUARTERS,QUARTER_NAME,quarterOf,SQUARE,WARDEN,HEADS,KORA,ZONE:{x0:X0,x1:X1,z1:Z1},C};
})();
