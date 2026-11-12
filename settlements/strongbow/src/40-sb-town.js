// ================================================================= STRONGBOW TODAY — the town at the foot (records; draws nothing)
// [G data] SB3 (PLAN.md section 7): the town of rings and spokes round the foot, laid out on core/city (one instance,
// KCITY.create) and built from the scrap Xanadu set (kits/xanadu, PLAN-SCRAP.md). The page draws its records
// (src/8ax1-sb-town.js); a node test (test-sb-town.js) and Godot read the same records.
//
// THE FRAME   the city runs in its own frame, centred on the lobby (the layout's lobby.at): u = x, v = z - lobby z, so its
//             raster is centred on the origin (core/city's rule, as Verge's levels). The records come back in the target's frame.
// THE SITE    the build zone is the half annulus south of the face, r 200 to 610 from the lobby and z >= 30 (the scree's
//             foot), plus two farm corridors along the road and fields spokes out to r 900. Off it: the foot inside r 196 (the
//             lobby, the hall, the wings, the plaza, drawn by the arcology and the reclamation), the quarry (the fallen lower
//             hull, RU.quiver), the scree west of the Spine (the outcasts' rope ways come down there), any ground steeper than
//             TUNE.maxSlope (the scree's skirts).
// THE STREETS four ring roads (r 200, 330, 470, 600) as avenues, each cut where the scree or the quarry stands; three spokes:
//             the road (the valley road from the plaza's gate out to the Xanadu floor, the arcology's P.road), the fields spoke
//             (south from the plaza), the quarry spoke (a main street from the middle ring to the fallen hull). core/city's
//             steps 6-12 do the rest: civic buildings by `near`, avenue lots, main streets across the voids, side streets,
//             alleys and the infill.
// THE RINGS   wealth by ring (rules.wealth): the inner ring rich (courtyard houses), the middle ring the craftsmen (panel houses
//             and rows), the outer ring poor (tank, hull, glint houses, shack rows, silo courts), beyond r 605 the farms (the
//             avenue choosers draw `farm` there); rules.vacant leaves frontage open, more of it the further out.
// THE FIELDS  each farm's fields are strips behind it, as records (crops owed: PLAN.md section 7, the foot's climate).
//
// SB_TOWN.make({layout, plan, dims, seed}) -> {lots, ways, fields, census, notes, centre}: layout is sbLayout() (its lobby,
// frame, the quarry's pieces, the scree), plan STRONGBOW.plan (its frame and road), dims(key, v) -> {w, d, h} the
// kit's boxes (XAK.dims on the page; the test's table in node). Every lot is a record keyed by a stable id ('sb.town.' + n).
var SB_TOWN=(function(){
 const RINGS=[200,330,470,600],FARM=900,REACH=610,ZMIN=30,CORE=196;
 /* the people a building holds (workers in its trade live over or beside it; PLAN.md section 6: about 3,500 in the town) */
 const PEOPLE={xa_scrap_court:14,xa_scrap_house:7,xa_scrap_row:15,xa_scrap_tank_house:5,xa_scrap_hull:4,xa_scrap_glint:5,xa_scrap_shacks:12,
  xa_scrap_silos:9,xa_scrap_farm:11,xa_scrap_bazaar:4,xa_scrap_store:2,xa_scrap_granary:0,xa_scrap_bath:3,xa_scrap_guild_hall:3,
  xa_scrap_guild_salvage:3,xa_scrap_tower:4,xa_scrap_shrine:2,xa_scrap_gate:12};
 /* how much frontage each ring leaves open (rules.vacant: the gardens, yards and waste between the houses), by ring */
 const VACANT=[.3,.3,.65,.4];
 /* core/city's steps the town leaves out: the side streets' lots and the alleys (a town of 3,500 keeps yards and gardens behind its
    houses, not packed blocks); with VACANT this gives PLAN.md's rings: about 900, 1,400, 900 and 300 people */
 const SKIP=['side-street lots, alley entrances','alleys and alley lots'];
 const RING_NAME=['the inner ring','the middle ring','the outer ring','the farms'];
 const ringOf=r=>r<RINGS[1]?0:r<RINGS[2]?1:r<RINGS[3]+5?2:3;
 const tune=()=>({
  cell:2.5,rasterHalf:930,maxSlope:.22,exact:true,
  width:{avenue:9,main:7,side:5,alley:3,highway:10,lane:4},
  lot:{side:1.8,setback:1.6,rear:3,inset:1,step:3},
  classes:{manor:[['xa_scrap_court',0],['xa_scrap_court',2]],rich:[['xa_scrap_court',0],['xa_scrap_court',1],['xa_scrap_court',2],['xa_scrap_house',2]],
   middle:[['xa_scrap_house',0],['xa_scrap_house',1],['xa_scrap_row',0],['xa_scrap_row',1],['xa_scrap_row',2]],
   poor:[['xa_scrap_tank_house',0],['xa_scrap_tank_house',1],['xa_scrap_hull',0],['xa_scrap_hull',1],['xa_scrap_glint',0],['xa_scrap_glint',1],['xa_scrap_shacks',0],['xa_scrap_shacks',1],['xa_scrap_silos',0]],
   shop:[['xa_scrap_bazaar',0],['xa_scrap_bazaar',1],['xa_scrap_bazaar',2]],tavern:[['xa_scrap_row',2]],
   industrial:[['xa_scrap_store',0],['xa_scrap_store',1],['xa_scrap_store',2]],farm:[['xa_scrap_farm',0],['xa_scrap_farm',1],['xa_scrap_farm',2]]},
  fallback:{manor:'rich',rich:'middle',middle:'poor',shop:'middle',tavern:'shop',industrial:'poor',poor:null,farm:null},
  civic:[{key:'xa_scrap_bath',v:0,near:'inner'},{key:'xa_scrap_guild_hall',v:0,near:'inner'},{key:'xa_scrap_guild_salvage',v:0,near:'quarry'},
   {key:'xa_scrap_shrine',v:1,near:'middle'},{key:'xa_scrap_granary',v:0,near:'fields'},{key:'xa_scrap_granary',v:1,near:'middle'},
   {key:'xa_scrap_store',v:0,near:'road'},{key:'xa_scrap_store',v:1,near:'quarry'},{key:'xa_scrap_tower',v:0,near:'gate'},
   {key:'xa_scrap_gate',v:1,near:'gate'},{key:'xa_scrap_bazaar',v:0,near:'road'},{key:'xa_scrap_bazaar',v:2,near:'road'},{key:'xa_scrap_shrine',v:2,near:'outer'}],
  civicSpacing:55,civicJitter:20,
  voidMax:42,voidIters:12,voidBatch:8,sideSpacing:46,sideMax:180,alleyFrac:.2,blindMax:80,interiorDepth:9,interiorRounds:2,
  avenueSnap:40,ringGap:8,verge:6,reach:REACH,centre:[0,0],mapHalf:930,
  plazaArt:{rich:[],middle:[],poor:[],commerce:[]}});
 /* an arc of radius r round the centre (local frame) from angle a0 to a1, every 6 m */
 const arc=(r,a0,a1)=>{const n=Math.max(4,Math.ceil(r*Math.abs(a1-a0)/6)),out=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;out.push([r*Math.cos(a),r*Math.sin(a)]);}return out;};
 /* split a polyline into the runs whose points pass ok(p) (at least `min` points each) */
 const runs=(pts,ok,min)=>{const out=[];let cur=[];for(const p of pts){if(ok(p))cur.push(p);else{if(cur.length>=min)out.push(cur);cur=[];}}if(cur.length>=min)out.push(cur);return out;};
 const hypot=Math.hypot;

 function make(o){
  const LY=o.layout,P=o.plan,F=P.frame,C=[LY.lobby.at[0],LY.lobby.at[2]],seed=o.seed==null?1647:o.seed;
  const toL=(x,z)=>[x-C[0],z-C[1]],toW=(u,v)=>[u+C[0],v+C[1]];
  const groundL=(u,v)=>F.ground(u+C[0],v+C[1]);
  const vMin=ZMIN-C[1];   /* the zone's edge toward the face, in the local frame */
  const quarry=LY.parts.filter(q=>/^sb\.quiver\.p\d/.test(q.id)).map(q=>({p:toL(q.shape[1],q.shape[2]),r:q.shape[3]+10}));   /* the fallen lower hull's pieces */
  const scree=LY.parts.find(p=>p.id==='sb.scree.w'),sc=scree?scree.shape:['box',0,0,0,0];
  const offStreet=p=>{const w=toW(p[0],p[1]);if(w[1]<ZMIN||F.scree(w[0],w[1])>3)return false;for(const q of quarry)if(hypot(p[0]-q.p[0],p[1]-q.p[1])<q.r)return false;
   return !(w[0]>sc[1]-10&&w[0]<sc[2]+10&&w[1]>sc[3]-10&&w[1]<sc[4]+10);};
  const ringA=r=>{const a=Math.asin(Math.max(-1,Math.min(1,vMin/r)));return [a,Math.PI-a];};
  /* the spokes, local: the road (the arcology's P.road, outward from the plaza's gate), the fields (south), the quarry (a main) */
  const road=P.road.pts.map(p=>toL(p[0],p[2])).reverse();
  const fields=[[0,140],[8,330],[-6,470],[10,620],[0,FARM]];
  const qp0=quarry[0].p,quarrySpoke=[[-RINGS[2]*Math.cos(.06),RINGS[2]*Math.sin(.06)],[(qp0[0]-RINGS[2])/2-40,qp0[1]+70],[qp0[0]-10,qp0[1]+quarry[0].r+6]];
  /* clip a polyline to r <= rmax (the last point on the circle) and drop what lies inside the core */
  const clipR=(pts,r0,r1)=>{const out=[];const R=resample(pts,4,false);for(const p of R){const r=hypot(p[0],p[1]);if(r>=r0&&r<=r1)out.push(p);}return out;};
  /* the zone: the half annulus, and the farm corridors (40 m each side of the road and fields spokes beyond the rings) */
  const zone=(()=>{const [a0,a1]=ringA(REACH);return arc(REACH,a0,a1);})();   /* closed along v = vMin, the scree's foot */
  const corridor=(pts)=>{const L=clipR(pts,RINGS[3]-20,FARM),out=[];if(L.length<2)return null;const left=[],right=[];
   for(let i=0;i<L.length;i++){const a=L[Math.max(0,i-1)],b=L[Math.min(L.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=hypot(dx,dz)||1,nx=-dz/l*40,nz=dx/l*40;
    left.push([L[i][0]+nx,L[i][1]+nz]);right.push([L[i][0]-nx,L[i][1]-nz]);}return left.concat(right.reverse());};
  const corridors=[corridor(road),corridor(fields)].filter(Boolean);
  const notes=[];
  const steps=[
   {name:'the site and its ground',run(){const R=SL.R=new Raster(TUNE.rasterHalf,TUNE.cell);R.occ.fill(OCC.OUT);
    PLAN.site=[{id:0,name:'Build zone',role:'zone',poly:zone}];PLAN.zone=zone;
    let land=KCITY.site.zoneRaster(R,zone,{dry:-1e9,maxSlope:TUNE.maxSlope,h:groundL});
    for(const c of corridors)land+=KCITY.site.zoneRaster(R,c,{dry:-1e9,maxSlope:TUNE.maxSlope,h:groundL});
    /* off the zone: the foot (the core), the quarry, the scree box */
    R.stampPoly(arc(CORE,0,2*Math.PI),OCC.HARD,-1);
    for(const q of quarry)R.stampPoly(arc(q.r,0,2*Math.PI).map(p=>[p[0]+q.p[0],p[1]+q.p[1]]),OCC.HARD,-1);
    {const a=toL(sc[1]-8,sc[3]-8),b=toL(sc[2]+8,sc[4]+8);R.stampPoly([[a[0],a[1]],[b[0],a[1]],[b[0],b[1]],[a[0],b[1]]],OCC.HARD,-1);}
    SL.minSpacing=KCITY.site.minSpacing();SL.note(0,'the foot\'s half annulus and two farm corridors, '+land+' cells');}},
   {name:'landmarks',run(){SL.note(1,'the plaza\'s gate, shrine and pavilion and the serai are the foot\'s (the reclamation draws them)');}},
   {name:'districts',run(){SL.note(2,'the rings are wealth, not districts');}},
   {name:'avenues',run(){let made=0;
    for(const r of RINGS){const [a0,a1]=ringA(r);for(const run of runs(arc(r,a0,a1),offStreet,6)){SL.addWay('avenue',run,3,{tag:'ring '+r});made++;}}
    const sp=[['the road spoke',road],['the fields spoke',fields]];
    for(const [tag,pts] of sp){const L=clipR(pts,CORE+2,FARM);if(L.length>2){SL.addWay('avenue',L,3,{tag});made++;}}
    SL.addWay('main',quarrySpoke,3,{tag:'the quarry spoke'});made++;
    SL.note(3,made+' ring runs and spokes');}},
   {name:'highways',run(){SL.note(4,'the valley road is the road spoke');}},
   {name:'the wall and its gates',run(){PLAN.gates=[];SL.note(5,'no wall: the town is open; its gate stands on the road spoke');}}
  ].concat(KCITY.defaultSteps().slice(6).filter(st=>(o.skip||SKIP).indexOf(st.name)<0));
  const rOf=p=>hypot(p[0],p[1]);
  const D0=KCITY.defaults.choosers,farmy=f=>function(p,rs){return rOf(p)>RINGS[3]+5?'farm':f(p,rs);};
  const roadL=resample(road,6,false),fieldsL=resample(fields,6,false),near=(L,p)=>{let d=1e9;for(let i=1;i<L.length;i++)d=Math.min(d,segDist(p,L[i-1],L[i]));return d;};
  const rules={
   wealth:p=>{const r=rOf(p),base=r<RINGS[1]?.86:r<RINGS[2]?.55:r<RINGS[3]+5?.2:.12;return clamp(base+.08*slFbm(p[0]/120+7,p[1]/120-3,2),0,1);},
   choosers:{avenue:farmy(D0.avenue),main:farmy(D0.main),side:farmy(D0.side),alley:farmy(D0.alley)},
   vacant:(p,rs)=>{const r=rOf(p),V=o.vacant||VACANT;return rs.chance(V[ringOf(r)]);},
   near:{
    inner:c=>Math.abs(rOf(c.p)-265)+(c.p[1]<0?60:0),middle:c=>Math.abs(rOf(c.p)-400),outer:c=>Math.abs(rOf(c.p)-535),
    quarry:c=>hypot(c.p[0]-qp0[0],c.p[1]-qp0[1]),road:c=>near(roadL,c.p)*3+Math.abs(rOf(c.p)-300),
    fields:c=>near(fieldsL,c.p)*3+Math.abs(rOf(c.p)-590),gate:c=>near(roadL,c.p)*3+Math.abs(rOf(c.p)-590)}};
  /* the fields: strips behind each farm, away from its street, kept off every lot, way and other field */
  const finish=[function(Ci){const farms=PLAN.lots.filter(L=>L.died==null&&L.bo&&L.key==='xa_scrap_farm'),out=[];
   const clearOf=o=>{for(const L of PLAN.lots)if(L.died==null&&L.bo&&SL.pen(o,L.bo)>-1)return false;for(const f of out)if(SL.pen(o,f.o)>-2)return false;
    for(const w of PLAN.ways){for(let i=1;i<w.pts.length;i++)if(polySegDist(obbCorners(o),w.pts[i-1],w.pts[i])<w.w/2+2)return false;}return true;};
   farms.forEach((L,fi)=>{const u=L.bo.u,v=L.bo.v,back=[L.bo.c[0]-v[0]*(L.bo.hd+2),L.bo.c[1]-v[1]*(L.bo.hd+2)];
    /* v points from the lot to its street (the front), so the fields go the other way; three strips side by side */
    for(let k=-1;k<=1;k++){const len=60+10*((fi+k+3)%3),hw=11,c=[back[0]-v[0]*len/2+u[0]*k*(2*hw+2),back[1]-v[1]*len/2+u[1]*k*(2*hw+2)],ob=obb(c,u,hw,len/2);
     if(rOf(c)<RINGS[3]+10||!clearOf(ob))continue;out.push({o:ob,farm:L.id,crop:['grain','fodder','fallow'][(fi+k+3)%3]});}});
   PLAN.sbFields=out;}];
  const Ci=KCITY.create({name:'strongbow-town',tune:tune(),seed,rand:'krand',index:{order:'insertion'},ground:{h:groundL},kit:{dims:o.dims},rules,steps,finish});
  Ci.run();
  const PL=Ci.plan;
  const lots=PL.lots.filter(L=>L.died==null&&L.bo&&L.key).map((L,n)=>{const w=toW(L.x,L.z),r=rOf([L.x,L.z]);
   return {id:'sb.town.'+n,key:L.key,v:L.v|0,cls:L.cls,civic:!!L.civic,x:w[0],z:w[1],y:L.y==null?groundL(L.x,L.z):L.y,ry:L.ry,w:L.w,d:L.d,h:L.h,
    ring:ringOf(r),people:PEOPLE[L.key]||0};});
  const ways=PL.ways.filter(w=>w.died==null).map(w=>({id:'sb.town.way.'+w.id,cls:w.cls,w:w.w,tag:w.tag,pts:w.pts.map(p=>toW(p[0],p[1]))}));
  const fieldsOut=(PL.sbFields||[]).map((f,i)=>({id:'sb.town.field.'+i,farm:'sb.town.'+lots.findIndex(L=>L.x===toW(PL.lots[f.farm].x,0)[0]&&L.z===toW(0,PL.lots[f.farm].z)[1]),crop:f.crop,
   corners:obbCorners(f.o).map(p=>toW(p[0],p[1]))}));
  const census={buildings:lots.length,people:0,byRing:[0,0,0,0],byKey:{}};
  for(const L of lots){census.people+=L.people;census.byRing[L.ring]+=L.people;census.byKey[L.key]=(census.byKey[L.key]||0)+1;}
  return {lots,ways,fields:fieldsOut,census,notes:PL.notes||notes,centre:C,rings:RINGS,names:RING_NAME};
 }
 return {make,PEOPLE,RINGS,FARM};
})();
