/* ============================== HOOK: THE TOWN ON core/city, STEPS 0-12 ([G data]) ============================== */
/* The city builder run on Hook's site (site/hook-site.json, inlined as HOOK_SITE) after the Port kit has built the
   terrain, so terrainH answers with the final ground. Steps as data, as Verge runs them (settlements/verge/src/
   70-verge-place.js cityPlan), the raster centred on the kit's origin so the plan's records are in world metres:
     0 the site and its ground: the build zone (the site's `zone` district) onto the raster, dry and not too steep;
     1 landmarks: every Port segment, land block, platform and Ancient host filed as a landmark footprint, HARD;
     2 districts: the quarters with their lot mix, holder, mood, layer and ruin level; the painted fields (damage);
     3 avenues: the Hook's axis, the shore road and the Arsenal road, drawn, loose ends snapped;
     4 highways and 5 the wall: none yet (the coast roads out of the city and the Iron Court's wall are P3);
     6-12 core/city's own: civic (none yet), avenue lots, main streets, main-street lots, side streets, their lots,
       alleys and the infill of the blocks, with the programme's classes (88-hook-programme.js): the lot filler draws
       a culture from the quarter's mix, then the class from the street and the wealth, then the piece by size.
   After the run: the lots' records for the page (HOOK_CITY.recs: kit, key, variant, culture, class, quarter, the
   salvage tag, the host they stand against), each registered in core/tags (the layout's registry) before anything
   draws. The plan stays bound (KCITY.bind): 90b draws it; the verify reads it. */
const HOOK_CITY=(()=>{
 const KL=KCITY.lib,SITE=HOOK_SITE,PROG=HOOK_PROG,half=1320;
 const tune={cell:2.5,rasterHalf:half,maxSlope:.22,exact:true,centre:PROG.centre,reach:PROG.reach,
  width:{avenue:14,main:8,side:5.5,alley:3.2,highway:12,lane:4.5},lot:{side:1.6,setback:1.6,rear:3,inset:1,step:3},
  classes:PROG.classes(),fallback:PROG.fallbackTable(),civic:[],civicSpacing:200,voidMax:260,voidIters:30,voidBatch:10,sideSpacing:70,sideMax:220,
  alleyFrac:.25,blindMax:80,interiorDepth:9,interiorRounds:4,plazaArt:{rich:['none'],middle:['none'],poor:['none'],commerce:['none']},mapHalf:half,avenueSnap:60,ringGap:6,verge:0,
  /* the slope under the whole site (KNOWN_ISSUES.md): a house's floor at its highest corner, its footing down to the lowest */
  stance:'high',stanceOpt:{maxDrop:7}};
 /* the kits' boxes (HOOK_DIMS, build.py dims_fragment): a Voth piece's variant has its own */
 const dims=(key,v)=>{const D=HOOK_DIMS[key];if(!D)return null;v=v==null?0:v;const B=D.vd&&D.vd[v]||D;return {key,v,w:B.w,d:B.d,h:B.h||D.h||8,kit:D.kit};};
 const role=KCITY.site.roles({types:['zone','quarter','field','park','plaza'],names:[],other:'quarter'});
 const quarters=(SITE.districts||[]).filter(d=>d.type==='quarter');
 const quarterAt=p=>{for(const q of quarters)if(KL.inPoly(p,q.poly))return q;return null;};
 const clamp01=v=>v<0?0:v>1?1:v;
 const wealth=p=>{const q=quarterAt(p);return clamp01(KCITY.defaults.wealth(p)+(q?(PROG.wealthBias[q.id]||0):0));};
 /* the culture first (the quarter's mix), then core/city's own class by street and wealth */
 const chooser=cls=>(p,rs)=>{const q=quarterAt(p),W=q&&q.cultures||{hukoa:1};
  let culture=KL.SL.draw(rs,W),base=KCITY.defaults.choosers[cls](p,rs);if(!PROG.cultures[culture])culture='hukoa';
  const C=PROG.cultures[culture].classes;while(base&&!C[base])base=PROG.fallback[base];   /* a culture without manors or rich houses builds the class below */
  return culture+':'+(base||'poor');};
 const log={};
 const steps=[
  {name:'the site and its ground',run(){const SL=KL.SL,OCC=KL.OCC,R=SL.R=new KL.Raster(half,tune.cell);R.occ.fill(OCC.OUT);
   const P=KL.plan();P.site=(SITE.districts||[]).map(d=>Object.assign({},d,{role:role(d)}));
   const Z=P.site.find(d=>d.role==='zone');P.zone=Z?Z.poly:[[-half,-half],[half,-half],[half,half],[-half,half]];
   log.land=KCITY.site.zoneRaster(R,P.zone,{dry:.6,maxSlope:tune.maxSlope,probe:5});SL.minSpacing=KCITY.site.minSpacing();
   /* the town stands in its quarters only: the slope behind them up to the hill stays open ground (PLAN.md section 1) */
   const inQ=new Uint8Array(R.occ.length);for(const q of quarters)R.eachInPoly(q.poly,k=>{inQ[k]=1;});
   let land=0;for(let k=0;k<R.occ.length;k++){if(R.occ[k]===OCC.OUT)continue;if(!inQ[k])R.occ[k]=OCC.OUT;else land++;}
   log.land=land;P.zoneLand=land*R.c*R.c;
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
 const T=PORT_LAYOUT.hook&&PORT_LAYOUT.hook.tags||null;
 const K=KCITY.create({tune,site:SITE,seed:KRAND.child(HOOK_SEED,'city')>>>0,rand:'krand',index:{order:'insertion'},
  ground:{h:(x,z)=>terrainH(x,z)},kit:{dims},tags:T,
  rules:{wealth,choosers:{avenue:chooser('avenue'),main:chooser('main'),side:chooser('side'),alley:chooser('alley')},
   groundOk:KCITY.reliefOk({dry:.6,maxRelief:7})},
  steps:steps.concat(KCITY.defaultSteps().slice(6))});
 let P=null;try{P=K.run();}catch(e){reportErr('city '+e.stack);}
 /* the records the page draws: every standing lot, its kit and culture from its class, the salvage draw and the host it
    stands against, each seeded from (HOOK_SEED, the lot's id), never from how many came before */
 const recs=[],by={culture:{},cls:{}};
 if(P){const hosts=P.landmarks.filter(L=>L.ancient),salv=KRAND.child(HOOK_SEED,'salvage');
  for(const L of P.lots){if(L.died!=null||L.cls==='landmark'||!L.bo)continue;const D=HOOK_DIMS[L.key];if(!D)continue;
   const culture=PROG.cultureOf(L.cls),cls=PROG.classOf(L.cls),q=quarterAt([L.x,L.z]);
   const u=KRAND.unit(KRAND.hash(salv,L.id)),ps=PROG.salvage[cls]||0,salvage=u<ps;
   let host=null;for(const H of hosts){const r=Math.hypot(L.x-H.x,L.z-H.z);if(r<H.w/2+Math.hypot(L.w,L.d)/2+PROG.hostReach){host=H.name||H.key;break;}}
   const rec={id:L.id,kit:D.kit,key:L.key,v:L.v==null?0:L.v,cls,culture,quarter:q?q.id:null,x:L.x,z:L.z,y:L.y,ry:L.ry,w:L.w,d:L.d,h:L.h,
    drop:L.drop==null?0:L.drop,wealth:L.wealth,salvage,host,way:L.way,born:L.born,tag:L.tag||null};
   L.culture=culture;L.salvage=salvage;L.host=host;recs.push(rec);
   by.culture[culture]=(by.culture[culture]||0)+1;by.cls[cls]=(by.cls[cls]||0)+1;}
  log.lots=recs.length;log.byCulture=by.culture;log.byClass=by.cls;log.salvage=recs.filter(r=>r.salvage).length;log.hostLots=recs.filter(r=>r.host).length;
  log.ways=P.ways.reduce((a,w)=>(a[w.cls]=(a[w.cls]||0)+1,a),{});}
 return {K,P,log,site:SITE,recs};})();
