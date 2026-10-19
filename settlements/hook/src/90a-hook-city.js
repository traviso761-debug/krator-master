/* ============================== HOOK: THE SITE ON core/city, STEPS 0-5 ([G data]) ============================== */
/* The city builder's site layer (core/city/25-city-site.js) run on Hook's site (site/hook-site.json, inlined as
   HOOK_SITE) after the Port kit has built the terrain, so terrainH answers with the final ground. Steps as data, as
   Verge runs them (settlements/verge/src/70-verge-place.js cityPlan), the raster centred on the kit's origin so the
   plan's records are in world metres:
     0 the site and its ground: the build zone (the site's `zone` district) onto the raster, dry and not too steep;
     1 landmarks: every Port segment, land block, platform and Ancient host filed as a landmark footprint, HARD;
     2 districts: the quarters with their lot mix, holder, mood, layer and ruin level; the painted fields (damage);
     3 avenues: the Hook's axis, the shore road and the Arsenal road, drawn, loose ends snapped;
     4 highways and 5 the wall: none yet (the coast roads out of the city and the Iron Court's wall are P3).
   Steps 6-12 (the lots) are P2. The plan is bound (KCITY.bind) when this ends: 90b draws it; the verify reads it. */
const HOOK_CITY=(()=>{
 const KL=KCITY.lib,SITE=HOOK_SITE,half=1320;
 const tune={cell:2.5,rasterHalf:half,maxSlope:.22,exact:true,
  width:{avenue:14,main:8,side:5.5,alley:3.2,highway:12,lane:4.5},lot:{side:1.2,setback:1.2,rear:2,inset:.8,step:2},
  classes:{middle:[['hook_stub',0]]},fallback:{},civic:[],civicSpacing:200,voidMax:260,voidIters:30,voidBatch:10,sideSpacing:60,sideMax:200,
  alleyFrac:.25,blindMax:80,interiorDepth:9,interiorRounds:4,plazaArt:{},mapHalf:half,avenueSnap:60,ringGap:6,verge:0};
 const dims=(key,v)=>({key,v:v==null?0:v,w:12,d:10,h:8});   /* P2 brings the kits' dims; the site layer needs one middle lot's depth */
 const role=KCITY.site.roles({types:['zone','quarter','field','park','plaza'],names:[],other:'quarter'});
 const log={};
 const steps=[
  {name:'the site and its ground',run(){const SL=KL.SL,OCC=KL.OCC,R=SL.R=new KL.Raster(half,tune.cell);R.occ.fill(OCC.OUT);
   const P=KL.plan();P.site=(SITE.districts||[]).map(d=>Object.assign({},d,{role:role(d)}));
   const Z=P.site.find(d=>d.role==='zone');P.zone=Z?Z.poly:[[-half,-half],[half,-half],[half,half],[-half,half]];
   log.land=KCITY.site.zoneRaster(R,P.zone,{dry:.6,maxSlope:tune.maxSlope,probe:5});SL.minSpacing=KCITY.site.minSpacing();
   P.zoneLand=log.land*R.c*R.c;
   SL.note(0,'site: '+P.site.length+' districts, '+(SITE.markers||[]).length+' markers, '+(SITE.avenues||[]).length+' avenues; '+(P.zoneLand/1e6).toFixed(2)+' km2 of dry buildable ground');}},
  {name:'landmarks',run(){const SL=KL.SL,OCC=KL.OCC,R=SL.R,P=KL.plan();P.landmarks=[];let n=0,nh=0;
   for(const it of PORT_LAYOUT.items){const f=portFoot(it);if(!f)continue;
    const c=[(f.x0+f.x1)/2,(f.z0+f.z1)/2],w=f.x1-f.x0,d=f.z1-f.z0,bo=KL.obb(c,[1,0],w/2,d/2);
    const L={id:P.lots.length,cls:'landmark',key:it.key,v:0,slot:0,wealth:1,x:c[0],z:c[1],y:0,ry:0,w,d,h:0,lot:bo,bo,way:-1,side:0,s:0,born:1,died:null,civic:true,
     ancient:!!it.ancient,tag:it.tag||null,name:it.opt&&it.opt.hostName||null};
    P.lots.push(L);P.landmarks.push(L);SL.hashLot(L);R.stampPoly(KL.obbCorners(bo),OCC.HARD,L.id);n++;if(it.ancient)nh++;}
   log.landmarks=n;log.hosts=nh;SL.note(1,n+' footprints filed as landmarks ('+nh+' Ancient hosts), hard ground');}},
  {name:'districts',run(){const P=KL.plan();
   P.districts=P.site.filter(d=>d.role==='quarter').map(d=>({kind:'quarter',id:d.id,name:d.name,poly:d.poly,born:2,art:[],
    cultures:d.cultures||null,holder:d.holder||null,mood:d.mood||null,layer:d.layer||null,ruin:d.ruin==null?null:d.ruin}));
   P.fields=P.site.filter(d=>d.role==='field').map(d=>({poly:d.poly,kind:d.kind||d.name,v:d.v==null?1:d.v}));
   log.districts=P.districts.length;log.fields=P.fields.length;}},
  {name:'avenues',run(){const r=KCITY.site.avenues((SITE.avenues||[]).map(a=>({name:a.name,pts:a.pts,width:a.width})),3,{snap:tune.avenueSnap});
   log.avenues=r.made;log.joins=r.joins;KL.SL.note(3,r.made+' avenues drawn, '+r.joins+' ends joined');}},
  {name:'highways',run(){}},
  {name:'the wall and its gates',run(){}}];
 const K=KCITY.create({tune,site:SITE,seed:KRAND.child(HOOK_SEED,'city')>>>0,rand:'krand',index:{order:'insertion'},
  ground:{h:(x,z)=>terrainH(x,z)},kit:{dims},steps});
 let P=null;try{P=K.run();}catch(e){reportErr('city '+e.stack);}
 return {K,P,log,site:SITE};})();
