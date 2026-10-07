// ================================================================= PROBE (window._api): everything a headless check needs
// hostChecks() and hostNegatives(): the kit's own invariants (verify.py --assert runs both). Every check has a negative: a
// broken copy of its input that the same check must FAIL (PLAN.md section 3).
window._api={REG,DEFS,SITES,ROWS,ZJ_LIFE,
 // the measured world-space box of each top-level site against its declared w x d x h
 footprints(){return REG.filter(r=>!r.parent).map(r=>{const D=r.decl,b=r.bbox;const bw=b.mx[0]-b.mn[0],bd=b.mx[2]-b.mn[2],bh=b.mx[1]-b.mn[1];
  return {key:r.key,name:r.name,w:D.w,d:D.d,h:D.h,bw:+bw.toFixed(2),bd:+bd.toFixed(2),bh:+bh.toFixed(2),ex:+Math.max(0,bw-D.w).toFixed(2),ez:+Math.max(0,bd-D.d).toFixed(2),eh:+Math.max(0,bh-D.h).toFixed(2),tris:r.tris,budget:D.budget};});},
 nanSweep(){let bad=0;WORLD.traverse(m=>{if(m.geometry&&m.geometry.attributes.position){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad++;break;}}});return bad;},
 doors(){return REG.filter(r=>!r.parent).map(r=>({key:r.key,cls:r.cls,front:r.front,doorCount:r.doorCount}));},
 kitCoverage(){const placed=new Set(REG.map(r=>r.key));return Object.keys(DEFS).filter(k=>!placed.has(k));},
 furniture(all){const s=ZJF.summary();const out={placed:s.placed,keys:s.keys,missing:s.missing,tris:Math.round(ZJF.batch.tris),
  perSite:REG.filter(r=>!r.parent).map(r=>({key:r.key,pieces:r.furniture.length+r.children.reduce((a,c)=>a+c.furniture.length,0)}))};if(all)out.records=ZJF.placed;return out;},
 tags(){return {audit:ZJTAGS.audit(),records:ZJTAGS.export().records.length};},
 tagExport(){return ZJTAGS.export();},
 materials(){return window._materials;},
 life(){return ZJ_LIFE;},
 cavern(){return Object.assign({},CV_STATS,{export:CVC.export(),walk:KWALK.export()});},
 setNight(v){nightSet(v);},
 setCut(v){cutSet(v);},
 setView(...v){setView(...v);}};

// ---------------------------------------------------------------- the cavern and the walk map (P2)
const PB={
 /* the void plans' rock: every void at least minRock from every other building's voids and from the open air; joined voids
    (a building's own rooms, a stair into a tube) are exempt by their `joins` */
 thin(C){const out=[];C.prims.forEach(P=>{if(P.kind==='mass'||P.kind==='monolith')return;
   C.prims.forEach(Q=>{if(P===Q||Q.kind==='mass'||Q.kind==='monolith'||P.owner===Q.owner)return;if((P.joins||[]).includes(Q.id)||(Q.joins||[]).includes(P.id))return;
    const t=C.thickness(P.id,Q.id);if(t<C.minRock)out.push(P.id+'/'+Q.id+' '+t.toFixed(2));});
   const r=C.roof(P.id);if(r<C.minRock)out.push(P.id+'/air '+r.toFixed(2));});return out;},
 /* floor samples (the centroid and two more points of every carved floor) against the meshed surface below them */
 floorGaps(W,group){const ray=new THREE.Raycaster(),out=[];group.updateMatrixWorld(true);
  for(const f of W.floors){if(!/^cavern:/.test(f.tag))continue;let pts=[];
   if(f.kind==='strip')pts=[.25,.5,.75].map(t=>[f.a[0]+(f.b[0]-f.a[0])*t,f.a[1]+(f.b[1]-f.a[1])*t]);
   else if(f.kind==='poly'){let x=0,z=0;f.pts.forEach(p=>{x+=p[0];z+=p[1];});x/=f.pts.length;z/=f.pts.length;pts=[[x,z],[(2*x+f.pts[0][0])/3,(2*z+f.pts[0][1])/3]];}
   for(const [x,z] of pts){const y=W.heightOn(f,x,z);if(y===null)continue;ray.set(new THREE.Vector3(x,y+.3,z),new THREE.Vector3(0,-1,0));ray.far=1;
    const h=ray.intersectObjects(group.children,false)[0];const onGround=!h&&Math.abs(y-terrainH(x,z))<.15&&!CVC.inMass(x,y+.5,z);
    out.push({name:f.name,gap:h?Math.abs(h.point.y-y):onGround?0:1e9});}}return out;},
 /* a walker's route through a walk registry: steps of 0.2 m, refused where no floor is within 0.6 m or a block stands */
 route(W,start,way){const R={x:start[0],z:start[1],feet:start[2]},log=[];
  const tryTo=(nx,nz)=>{const f=W.floorBelow(nx,nz,R.feet,.6);if(!f||R.feet-f[0]>.6)return false;if(W.blocked(nx,f[0],nz,.3,1.7))return false;R.x=nx;R.z=nz;R.feet=f[0];return true;};
  for(const [name,tx,tz,expect] of way){let ok=true,n=0;while(n++<5000){const dx=tx-R.x,dz=tz-R.z,d=Math.hypot(dx,dz);if(d<.15)break;const st=Math.min(.2,d);if(!tryTo(R.x+dx/d*st,R.z+dz/d*st)){ok=false;break;}}
   log.push({name,ok,feet:+R.feet.toFixed(2),expect:expect===undefined?true:expect});}return log;},
 /* the test block's route: in at the door, the antechamber, the side room (refused at the carved bed shelf), the domed hall,
    down the stair to the lava tube and along it to its far end */
 blockRoute(W){const S=SITES.find(s=>s.key==='zj_testblock');if(!S)return null;const P=(x,z)=>[S.x+x,S.z+z];
  return PB.route(W,[S.x,S.z+6,0],[['the door',...P(0,3)],['the antechamber',...P(0,-3.5)],['the side passage',...P(2.2,-5)],['the side room',...P(6.5,-5)],
   ['into the bed shelf',...P(8.4,-7.5),false],['the side room again',...P(6.5,-6.2)],['the passage mouth',...P(5.2,-5)],['back to the antechamber',...P(0,-5)],
   ['the domed hall',...P(0,-10.5)],['the stair head',...P(-3,-10.5)],['the stair foot',...P(-12.6,-10.5)],['the tube',...P(-13.6,-10)],
   ['the tube\'s bend',...P(-13.6,4)],['the tube\'s second bend',...P(0,12)],['the tube\'s far end',...P(14,13.8)]]);},
 /* gallery B's route: in, down the spiral to the east landing, into a cell and out, on down to the well's floor and the cistern */
 wellRoute(W0){const S=SITES.find(s=>s.key==='zj_gallery_b');if(!S)return null;const W=[S.x,S.z-15],way=[['the tunnel',S.x,S.z-11.2]];
  for(let i=1;i<=24;i++){const a=PI/2+i*(3*PI)/24;way.push(['the spiral '+i,W[0]+Math.cos(a)*3.8,W[1]+Math.sin(a)*3.8]);
   if(i===12)way.push(['the east landing',W[0]+7.4,W[1]],['into a cell',W[0]+7.4,W[1]+3.3],['back to the landing',W[0]+7.4,W[1]],['the spiral again',W[0]+3.8,W[1]]);}
  way.push(['the well floor',W[0],W[1]-1],['the cistern',W[0],W[1]-8]);return PB.route(W0,[S.x,S.z+3,0],way);},
 routeOk(log){return !!log&&log.every(s=>s.ok===s.expect);},
 /* a route in a def's own frame (the sheet places defs unturned): start [x, z], way [[name, x, z, expect]] */
 siteRoute(W0,key,start,way){const S=SITES.find(s=>s.key===key);if(!S)return null;return PB.route(W0,[S.x+start[0],S.z+start[1],0],way.map(w=>[w[0],S.x+w[1],S.z+w[2],w[3]]));},
 /* the estates: A every wing (refused at a pillar), B upstairs (the stair, the landing, the loggia, both bedrooms) and B downstairs */
 estateRoutes(W){const out=[],r=(name,log)=>{if(log)out.push({name,log});};
  r('estate A',PB.siteRoute(W,'zj_estate_a',[0,3],[['the door',0,1],['the hall',0,-4],['into a pillar',3,-5.6,false],['the hall again',0,-7.5],['the west side',-5,-7.5],
   ['the west door',-5,-10.5],['the family corridor',-9.6,-10.5],['the living room',-9.6,-4.8],['the corridor',-9.6,-9.3],['a bedroom',-12.2,-9.3],['the corridor again',-9.6,-9.3],
   ['down the corridor',-9.6,-24],['the shrine',-9.6,-27.5],['back up',-9.6,-10.5],['the hall’s west door',-5,-10.5],['the hall’s back',0,-11],['the court',0,-16.5],
   ['beside the basin',2.5,-17.5],['past the basin',2.5,-21.5],['the far court',0,-22.8],['past the basin again',2.5,-21.5],['beside it again',2.5,-17.5],['back to the court door',0,-16.5],['the hall',0,-11],['the east door',5,-10.5],
   ['the service corridor',9.6,-10.5],['the kitchen',9.6,-4.8],['the corridor',9.6,-10.5],['down the corridor',9.6,-24.9],['a servant’s cell',12.2,-24.9],
   ['the corridor again',9.6,-24.9],['the cistern',9.6,-31.6]]));
  r('estate B upstairs',PB.siteRoute(W,'zj_estate_b',[0,3],[['the door',0,1],['the hall',0,-6],['the west door',-4.4,-9.6],['up the stair',-12.2,-9.6],
   ['a bedroom',-12.2,-12.5],['the landing',-12.2,-9.6],['the living room',-12.2,-7.0],['the loggia',-9.6,-2.6],['along the loggia',9.6,-2.6],
   ['the master bedroom',12.2,-4.0],['the passage',12.2,-9.8],['the second bedroom',12.2,-12.5]]));
  r('estate B downstairs',PB.siteRoute(W,'zj_estate_b',[0,3],[['the door',0,1],['the hall',0,-6],['beside the basin',2,-8],['past the basin',2,-12],
   ['the back door',0,-14.2],['down the flight',0,-18.9],['the court',0,-23],['the kitchen',-10,-23],['to the store',-11.7,-25.0],['the store',-11.7,-29.4],
   ['the kitchen again',-11.7,-25.0],['the kitchen door',-10,-23],['the court again',-4,-23],['the east door',4,-23],['the corridor',10.2,-23],['the shrine',10.2,-16.8],
   ['the corridor again',10.2,-21.2],['a servant’s cell',12.6,-21.2],['back',10.2,-21.2],['the cistern',10.2,-32.2]]));
  return out;},
 /* a planned body's route: depth first through the interiors planner's nav graph from the street (its doors, rooms, stair foot
    and top), back along each edge it took, so every room and the stair both ways */
 plannedRoute(W0,key){const S=SITES.find(s=>s.key===key);if(!S)return null;const inst=KratorInteriors.sets.instantiate(zjItem(key),0,0,0,{register:false,prefix:'route.'}),way=[];let start=null;
  for(const B of inst.buildings){const G=B.graph,adj={},by={},seen={};G.edges.forEach(e=>{(adj[e.a]=adj[e.a]||[]).push(e.b);(adj[e.b]=adj[e.b]||[]).push(e.a);});G.nodes.forEach(n=>by[n.id]=n);
   const st=G.nodes.find(n=>n.tag==='street');if(!st)continue;if(!start)start=[S.x+st.x,S.z+st.z,0];
   /* a stair's top is left by its landing (0.7 m on along the flight), as a walker does: the graph's straight line from the top
      to the room's centre cuts the stairwell's corner */
   const land=n=>{const S2=B.stairs.find(s=>s.id===n.ref);if(!S2)return [[S.x+n.x,S.z+n.z]];const L=[S.x+n.x+S2.dir[0]*.7,S.z+n.z+S2.dir[1]*.7],p=[-S2.dir[1],S2.dir[0]];
     const rm=(adj[n.id]||[]).map(m=>by[m]).find(m=>m.tag==='room'),sg=rm&&((S.x+rm.x-L[0])*p[0]+(S.z+rm.z-L[1])*p[1])<0?-1:1,k=S2.w/2+.5;
     return [L,[L[0]+p[0]*sg*k,L[1]+p[1]*sg*k]];};
   /* ...and then stepped off the flight's line toward its room, clear of the well, before the room's centre */
   const nm=n=>n.tag+' '+n.id.split('.').slice(-2).join('.'),go=n=>{seen[n.id]=1;way.push([nm(n),S.x+n.x,S.z+n.z]);
    if(n.tag==='stairtop'){const q=land(n);way.push([nm(n)+' landing',...q[0]]);if(q[1])way.push([nm(n)+' clear of the well',...q[1]]);}
    for(const m of adj[n.id]||[])if(!seen[m]){go(by[m]);
     if(n.tag==='stairtop'){const q=land(n);if(q[1])way.push(['back clear of the well',...q[1]]);way.push(['back to '+nm(n)+' landing',...q[0]]);}
     else way.push(['back to '+nm(n),S.x+n.x,S.z+n.z]);}};go(st);}
  return start?PB.route(W0,start,way):null;},
 /* the shops: a carved front refused at its counter, in through the counter's gap, through the selling room to the workroom;
    a constructed one by its planner's graph */
 shopRoutes(W,only){const out=[];for(const S of SITES){if(!/^zj_shop_/.test(S.key)||(only&&S.key!==only))continue;
   const log=/_carved$/.test(S.key)?PB.siteRoute(W,S.key,[0,3],[['the shopfront',0,.4],['over the counter',-.6,-2.0,false],['the counter’s gap',1.6,-.5],
     ['the selling room',1.6,-2.6],['the back door',0,-4.8],['the passage',0,-6.8],['the workroom',0,-9.6],['back',0,-4.8],['the selling room again',1.6,-2.6],['out',1.6,-.5],['the street',1.6,2.5]]):PB.plannedRoute(W,S.key);
   if(log)out.push({name:S.key,log});}return out;},
 /* the constructed houses: the domed hut, the three domes round their yard (hand-written), the planned house (its graph) */
 houseRoutes(W){const out=[],r=(name,log)=>{if(log)out.push({name,log});};
  r('domed hut',PB.siteRoute(W,'zj_house_built_poor',[0,4.5],[['the door',0,2.6],['inside',0,0],['across',0,-1.6]]));
  r('three domes',PB.siteRoute(W,'zj_house_built_mid',[0,7.5],[['the gate',0,5.3],['the yard',0,3.5],['the back door',0,-.4],['the living room',0,-2.4],['the yard',0,2.5],
   ['the west door',-2.9,2.5],['the bedroom',-5.2,2.5],['the yard',0,2.5],['the east door',2.9,2.5],['the kitchen',5.2,2.5],['out',0,2.5],['the street',0,7]]));
  r('two-storey house',PB.plannedRoute(W,'zj_house_built_rich'));return out;},
 /* every carved passage joins another floor at both its ends: at the end, or up to 0.4 m past it, a floor that is not the
    passage itself lies within a step of the passage's own height there (a doorway whose strip stops short of a room: impassable) */
 joins(W){const bad=[];for(const f of W.floors){if(f.kind!=='strip'||!/^(cavern|built):stair/.test(f.tag))continue;
   const dx=f.b[0]-f.a[0],dz=f.b[1]-f.a[1],L=Math.hypot(dx,dz);if(L<.05)continue;const ux=dx/L,uz=dz/L;
   for(const [e,sg] of [[f.a,-1],[f.b,1]]){let ok=false;
    for(let s=0;s<=.4+1e-9&&!ok;s+=.1){const x=e[0]+ux*sg*s,z=e[1]+uz*sg*s;ok=W.floorsAt(x,z).some(q=>q[1]!==f&&Math.abs(q[0]-e[2])<=.6);}
    if(!ok)bad.push(f.name+(sg<0?' (start)':' (end)'));}}return bad;},
 copyWalk(skip){const W=KWALK.create();for(const f of KWALK.floors){if(skip&&skip(f))continue;if(f.kind==='rect')W.floor(f);else if(f.kind==='strip')W.strip(f);else W.poly(f);}return W;}
};
function hostChecks(){const R=[],add=(name,ok,detail)=>R.push({name,ok:!!ok,detail});
 const C=CVC;
 add('cavern-meshed',CV_STATS.chunks>0&&CV_STATS.tris>0,CV_STATS.chunks+' chunks, '+CV_STATS.tris+' triangles, '+CV_STATS.prims+' primitives, meshed in '+CV_STATS.ms+' ms');
 const leaks=C.skyLeaks(.5);add('cavern-sky',!leaks.length,leaks.length?leaks.length+' void points in the open air outside every opening, first '+leaks[0].map(v=>typeof v==='number'?v.toFixed(1):v).join(' '):'no void meets the open air but at its declared doors and wells');
 const thin=PB.thin(C);add('cavern-rock',!thin.length,thin.length?thin.join(' | '):'every void at least '+C.minRock+' m from other buildings\' voids and from the open air');
 const gaps=PB.floorGaps(KWALK,CV_GROUP),worst=gaps.reduce((a,b)=>b.gap>a.gap?b:a,{gap:0,name:'-'});
 add('walk-on-mesh',gaps.length>0&&worst.gap<=.15,gaps.length+' samples on the carved floors; the worst '+(worst.gap>1e8?'has no mesh under it':worst.gap.toFixed(3)+' m')+' ('+worst.name+')');
 const rt=PB.blockRoute(KWALK);if(rt)add('walk-route',PB.routeOk(rt),rt.map(s=>s.name+(s.ok?'':' REFUSED')+' @'+s.feet).join(' > '));
 const wr=PB.wellRoute(KWALK);if(wr)add('walk-route-well',PB.routeOk(wr),wr.filter((s,i)=>!s.ok||i%6===0).map(s=>s.name+(s.ok?'':' REFUSED')+' @'+s.feet).join(' > '));
 const er=PB.estateRoutes(KWALK);if(er.length)add('walk-route-estates',er.length===3&&er.every(e=>PB.routeOk(e.log)),
  er.map(e=>e.name+': '+(PB.routeOk(e.log)?e.log.length+' legs':e.log.filter(s=>s.ok!==s.expect).map(s=>s.name+(s.ok?' PASSED':' REFUSED')+' @'+s.feet).join(', '))).join(' | '));
 const hr=PB.houseRoutes(KWALK);if(hr.length)add('walk-route-houses',hr.length===3&&hr.every(e=>PB.routeOk(e.log)),
  hr.map(e=>e.name+': '+(PB.routeOk(e.log)?e.log.length+' legs':e.log.filter(s=>s.ok!==s.expect).map(s=>s.name+(s.ok?' PASSED':' REFUSED')+' @'+s.feet).join(', '))).join(' | '));
 const sr=PB.shopRoutes(KWALK),sbad=sr.filter(e=>!PB.routeOk(e.log));if(sr.length)add('walk-route-shops',sr.length===24&&!sbad.length,
  sbad.length?sbad.map(e=>e.name+': '+e.log.filter(s=>s.ok!==s.expect).map(s=>s.name+(s.ok?' PASSED':' REFUSED')+' @'+s.feet).slice(0,3).join(', ')).join(' | '):sr.length+' shops, '+sr.reduce((a,e)=>a+e.log.length,0)+' legs');
 const jn=PB.joins(KWALK),np=KWALK.floors.filter(f=>f.kind==='strip'&&/^(cavern|built):stair/.test(f.tag)).length;
 add('walk-joins',np>0&&!jn.length,jn.length?jn.length+' passages leave a gap: '+jn.slice(0,8).join(', '):np+' carved passages each join the floors at both ends');
 return R;}
function hostNegatives(){const R=[],add=(name,failed,detail)=>R.push({name,failed:!!failed,detail});
 const ex=CVC.export(),G=(x,z)=>terrainH(x,z);
 /* sky: the doors forgotten */
 {const e=JSON.parse(JSON.stringify(ex));e.openings=e.openings.filter(q=>q.kind!=='door');const D=KCAVERN.load(e,{ground:G}).build(),L=D.skyLeaks(.5);add('cavern-sky: the doors undeclared',L.length>0,L.length+' leaks');}
 /* rock: a room cut 0.4 m behind a mass's face */
 {const D=KCAVERN.load(JSON.parse(JSON.stringify(ex)),{ground:G}),M=D.prims.find(P=>P.kind==='mass');
  if(M){const xs=M.poly.map(p=>p[0]),zs=M.poly.map(p=>p[1]),x0=Math.min(...xs)+2,z1=Math.max(...zs)-.4;D.room({id:'probe-thin',owner:'probe',poly:[[x0,z1-2],[x0+2,z1-2],[x0+2,z1],[x0,z1]],y:M.y0+1,h:2});}
  D.build();const t=PB.thin(D);add('cavern-rock: a room 0.4 m behind a face',t.length>0,t.join(' | ')||'none found');}
 /* floors: one carved floor registered 0.4 m too high */
 {const W=KWALK.create();for(const f of KWALK.floors)if(f.kind==='poly'&&/^cavern:room/.test(f.tag)){W.poly({pts:f.pts.map(p=>[p[0],p[1],p[2]+.4]),name:f.name,tag:f.tag});break;}
  const g=PB.floorGaps(W,CV_GROUP);add('walk-on-mesh: a floor 0.4 m too high',g.some(s=>s.gap>.15),g.map(s=>s.name+' '+(s.gap>1e8?'none':s.gap.toFixed(2))).join(', '));}
 /* route: the stair down left out of the walk map; then the bed shelf's block forgotten (the walker must be refused there) */
 {const W=PB.copyWalk(f=>/\.down$/.test(f.name));for(const b of KWALK.blocks)W.block(b.box,b.tag);const rt=PB.blockRoute(W);
  if(rt)add('walk-route: the stair down missing',!PB.routeOk(rt),rt.filter(s=>s.ok!==s.expect).map(s=>s.name).join(', '));}
 {const W=PB.copyWalk();const rt=PB.blockRoute(W);if(rt)add('walk-route: the bed shelf not a block',!PB.routeOk(rt),rt.filter(s=>s.ok!==s.expect).map(s=>s.name).join(', '));}
 /* the well's route with its spiral's middle chord missing */
 {const W=PB.copyWalk(f=>/\.spiral7$/.test(f.name));const wr=PB.wellRoute(W);if(wr)add('walk-route-well: a spiral step missing',!PB.routeOk(wr),wr.filter(s=>!s.ok).map(s=>s.name).slice(0,3).join(', '));}
 /* the estates' routes with estate B's stair up left out of the walk map */
 {const W=PB.copyWalk(f=>/\.up$/.test(f.name));for(const b of KWALK.blocks)W.block(b.box,b.tag);const er=PB.estateRoutes(W),up=er.find(e=>/upstairs/.test(e.name));
  if(up)add('walk-route-estates: the stair up missing',!PB.routeOk(up.log),up.log.filter(s=>s.ok!==s.expect).map(s=>s.name).slice(0,3).join(', '));}
 /* the houses' routes with the planned house's stair left out of the walk map */
 {const W=PB.copyWalk(f=>/zj_house_built_rich.*stair/.test(f.name));for(const b of KWALK.blocks)W.block(b.box,b.tag);const hr=PB.houseRoutes(W),h=hr.find(e=>/two-storey/.test(e.name));
  if(h)add('walk-route-houses: the stair missing',!PB.routeOk(h.log),h.log.filter(s=>s.ok!==s.expect).map(s=>s.name).slice(0,3).join(', '));}
 /* the shops' routes with the weaponsmith's (carved) passage to its workroom left out */
 {const R0=REG.find(r=>r.key==='zj_shop_weapons_carved');if(R0){const W=PB.copyWalk(f=>f.name===R0.tid+'.back');for(const b of KWALK.blocks)W.block(b.box,b.tag);
  const e=PB.shopRoutes(W,'zj_shop_weapons_carved')[0];if(e)add('walk-route-shops: a passage missing',!PB.routeOk(e.log),e.log.filter(s=>s.ok!==s.expect).map(s=>s.name).slice(0,3).join(', '));}}
 /* joins: one cell's doorway strip shortened by 1 m at its room end (it runs 0.4 m into the room's floor, whose walk edge is 0.3 m in: 0.8 lands on that edge) */
 {let done=false;const W=PB.copyWalk(f=>{if(!done&&/-door$/.test(f.name)&&f.kind==='strip'){done=true;return true;}return false;});
  const f=KWALK.floors.find(f=>/-door$/.test(f.name)&&f.kind==='strip');if(f){const dx=f.b[0]-f.a[0],dz=f.b[1]-f.a[1],L=Math.hypot(dx,dz),k=(L-1)/L;
   W.strip({a:f.a,b:[f.a[0]+dx*k,f.a[1]+dz*k,f.b[2]],w:f.w,name:f.name,tag:f.tag});}
  const jn=PB.joins(W);add('walk-joins: a doorway 1 m short',jn.length>0,jn.join(', ')||'none found');}
 return R;}
window.hostChecks=hostChecks;window.hostNegatives=hostNegatives;
