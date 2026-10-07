// ================================================================= DHELV: THE PROBE (window._api, hostChecks, hostNegatives). verify.py --assert
// runs both; every check has a negative: a broken copy of its input the same check must FAIL (kits/zeijani/PLAN.md section 3).
window._api={REG,DEFS,SITES,ZJ_LIFE,DH,
 footprints(){return REG.filter(r=>!r.parent).map(r=>{const D=r.decl,b=r.bbox;const bw=b.mx[0]-b.mn[0],bd=b.mx[2]-b.mn[2],bh=b.mx[1]-b.mn[1],c=Math.abs(Math.cos(r.ry)),s=Math.abs(Math.sin(r.ry));
  /* a turned site's declared box, turned: its world extent in x and z */
  const W=D.w*c+D.d*s,Dd=D.w*s+D.d*c;
  return {key:r.key,name:r.name,w:+W.toFixed(2),d:+Dd.toFixed(2),h:D.h,bw:+bw.toFixed(2),bd:+bd.toFixed(2),bh:+bh.toFixed(2),ex:+Math.max(0,bw-W).toFixed(2),ez:+Math.max(0,bd-Dd).toFixed(2),eh:+Math.max(0,bh-D.h).toFixed(2),tris:r.tris,budget:D.budget};});},
 nanSweep(){let bad=0;WORLD.traverse(m=>{if(m.geometry&&m.geometry.attributes&&m.geometry.attributes.position){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad++;break;}}});return bad;},
 doors(){return REG.filter(r=>!r.parent).map(r=>({key:r.key,cls:r.cls,front:r.front,doorCount:r.doorCount}));},
 furniture(){const s=ZJF.summary();return {placed:s.placed,keys:s.keys,missing:s.missing,tris:Math.round(ZJF.batch.tris)};},
 tags(){return {audit:ZJTAGS.audit(),records:ZJTAGS.export().records.length};},
 materials(){return window._materials;},
 stream(){return {meshed:DH_STREAM.meshes.size,tris:Math.round(DH_STREAM.tris),chunks:DH_STREAM.keys.length,pending:DH_STREAM.near.length};},
 /* mesh every chunk near a point now (verify's shots: the rock round the view before the screenshot) */
 meshAround(x,y,z){DH_STREAM.tick=0;return dhStream(new THREE.Vector3(x,y,z),true);},
 setNight(v){nightSet(v);},setCut(v){cutSet(v);},setView(...v){setView(...v);}};

const DHP={
 /* the shortest way between two layout nodes (as the layout measures it: plan length), over the edges ok() allows: its nodes */
 path(from,to,ok){const D={},prev={},done={};DH.NODES.forEach(n=>D[n.id]=Infinity);D[from]=0;
  for(;;){let u=null,b=Infinity;for(const id in D)if(!done[id]&&D[id]<b){b=D[id];u=id;}if(u===null||u===to)break;done[u]=1;
   for(const [v,i] of DH.adj[u]){const e=DH.EDGES[i];if(ok&&!ok(e))continue;const d=b+DH.len(e);if(d<D[v]){D[v]=d;prev[v]=u;}}}
  if(D[to]===Infinity)return null;const out=[to];while(out[0]!==from)out.unshift(prev[out[0]]);return out;},
 /* a walker along a node path through a walk registry: steps of 0.2 m, refused where no floor is within 0.6 m or a block stands */
 walk(W,ids){const B=DH.byId,s=B[ids[0]],R={x:s.x,z:s.z,feet:s.y},log=[];
  for(const id of ids.slice(1)){const n=B[id];let ok=true,k=0;while(k++<20000){const dx=n.x-R.x,dz=n.z-R.z,d=Math.hypot(dx,dz);if(d<.15)break;const st=Math.min(.2,d),nx=R.x+dx/d*st,nz=R.z+dz/d*st;
    const f=W.floorBelow(nx,nz,R.feet,.6);if(!f||R.feet-f[0]>.6||W.blocked(nx,f[0],nz,.3,1.7)){ok=false;break;}R.x=nx;R.z=nz;R.feet=f[0];}
   log.push({name:id,ok,feet:+R.feet.toFixed(2),at:[+R.x.toFixed(1),+R.z.toFixed(1)]});if(!ok)break;}return log;},
 /* from the outpost's gate to every district's anchor along the public ways (no secret way) */
 routes(W){const out=[];for(const D of DH.DISTRICTS){if(D.anchor==='o.c')continue;const p=DHP.path('o.gate',D.anchor,e=>e.zone!=='secret');if(!p){out.push({name:D.id,log:[{name:'no path',ok:false}]});continue;}
   out.push({name:D.id,log:DHP.walk(W,p)});}return out;},
 ok(log){return log.length>0&&log.every(s=>s.ok);},
 /* the well floors lit at noon (PLAN.md P5): the sun is up at 12:00, and under each opening (the light well, the three wells) the
    floor sees the sky straight up through the rock at its middle and halfway out (the sky light falls there) */
 lit(C){const keep=SKY.hour;SKY.hour=12;skyApply();const up=LIGHTDIR.y;SKY.hour=keep;skyApply();const bad=[];
  for(const O of DH_LIGHT.openings)for(const [dx,dz] of [[0,0],[.5,0],[-.5,0],[0,.5],[0,-.5]]){const x=O.c[0]+dx*O.r,z=O.c[1]+dz*O.r;if(C.ceilingAt(x,z,O.floor+1)!==null){bad.push(O.name);break;}}
  return {ok:up>.3&&!bad.length,detail:(up>.3?'the sun '+(Math.asin(Math.min(1,up))*180/PI).toFixed(0)+' degrees up at noon':'the sun is down at noon')+(bad.length?'; no sky over '+bad.join(', '):'; '+DH_LIGHT.openings.length+' floors see the sky')};},
 /* the cut-away's boxes as the rock's shader reads them (40-zj-cave.js CV_BOXCUT): is (x, z) in box i */
 inCut(i,x,z,flip){const A=CVU.uBoxA.value[i],B=CVU.uBoxB.value[i];if(B.w<.5)return false;const dx=x-A.x,dz=z-A.y,s=flip?-B.y:B.y,lx=dx*B.x-dz*s,lz=dx*s+dz*B.x;return Math.abs(lx)<A.z&&Math.abs(lz)<A.w;},
 /* every carved site, with the camera at it: its box is one of the 32, and holds the hall's rock 1.5 m before its front and its
    own back room (1 m in from its back); flip mirrors the turn (the negative) */
 cut(flip){const bad=[];let n=0;for(const S of SITES){const D=DEFS[S.key];if(!D.originFront||(ONLYSET&&!ONLYSET.has(S.key)))continue;n++;dhCutBoxes(new THREE.Vector3(S.x,0,S.z));
   const i=DH_CUT.sites.indexOf(S.key),sx=Math.sin(S.ry||0),cz=Math.cos(S.ry||0);
   if(i<0||!DHP.inCut(i,S.x+sx*1.5,S.z+cz*1.5,flip)||!DHP.inCut(i,S.x-sx*(D.d-1),S.z-cz*(D.d-1),flip))bad.push(S.key);}
  dhCutBoxes(camera.position);return {n,bad};},
 /* the budgets (PLAN.md P5): at every view, what is drawn (visible, in the frustum; the streamed rock apart, its reach is
    DH_STREAM's) in draws and triangles, counted on the CPU (the GPU's own count varies with its shadow passes). Underground and
    on the surface apart: over the kipuka the old growth (both kits' plants, the heaviest part of the page) is in view */
 BUDGET:{under:{calls:450,tris:1.1e6},surface:{calls:650,tris:1.6e6}},
 drawn(v){setView(...v);applyCam();camera.updateMatrixWorld();const p=camera.position,under=p.y<terrainH(p.x,p.z)-2;dhSeen(p,under);
  const F=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));let calls=0,tris=0;
  scene.traverseVisible(o=>{if(!(o.isMesh||o.isPoints)||o.userData.cavern!==undefined)return;if(o.frustumCulled&&!F.intersectsObject(o))return;const g=o.geometry;if(!g||!g.attributes.position)return;
   calls++;tris+=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);});return {calls,tris:Math.round(tris),under};},
 budgets(){dhSplitFurniture();dhSplitBiome();const B=DHP.BUDGET,out=[];for(const n in VIEWS){const d=DHP.drawn(VIEWS[n]);out.push(Object.assign({n},d));}
  const v0=VIEWS[Object.keys(VIEWS)[0]];setView(...v0);applyCam();
  const lim=d=>B[d.under?'under':'surface'],over=out.filter(d=>d.calls>lim(d).calls||d.tris>lim(d).tris),wc=out.reduce((a,d)=>d.calls>a.calls?d:a,out[0]),wt=out.reduce((a,d)=>d.tris>a.tris?d:a,out[0]);
  return {ok:out.length>0&&!over.length,detail:(over.length?over.length+' views over (underground '+B.under.calls+' draws, '+(B.under.tris/1e6)+'M triangles; on the surface '+B.surface.calls+', '+(B.surface.tris/1e6)+'M): '+over.slice(0,3).map(d=>d.n+' '+d.calls+'/'+(d.tris/1e6).toFixed(2)+'M').join(', ')+'; ':'')+
   out.length+' views; the most draws '+wc.calls+' ('+wc.n+'), the most triangles '+(wt.tris/1e6).toFixed(2)+'M ('+wt.n+')'};},
 copyWalk(skip){const W=KWALK.create();for(const f of KWALK.floors){if(skip&&skip(f))continue;if(f.kind==='rect')W.floor(f);else if(f.kind==='strip')W.strip(f);else W.poly(f);}for(const b of KWALK.blocks)W.block(b.box,b.tag);return W;}};
function hostChecks(){const R=[],add=(name,ok,detail)=>R.push({name,ok:!!ok,detail});
 const placed=REG.filter(r=>!r.parent).length,want=SITES.filter(s=>!ONLYSET||ONLYSET.has(s.key)).length;
 add('layout-placed',placed===want,placed+' of the layout\'s '+want+' sites placed');
 add('cavern-built',CVC.chunks.length>0,CVC.prims.length+' primitives, '+CVC.chunks.length+' chunks, built in '+CV_STATS.ms+' ms; '+DH_STREAM.meshes.size+' meshed near the camera');
 const t0=performance.now(),leaks=CVC.skyLeaks(2);add('cavern-sky',!leaks.length,(leaks.length?leaks.length+' void points in the open air outside every opening, first '+leaks[0].map(v=>typeof v==='number'?v.toFixed(1):v).join(' '):'no void meets the open air but at its openings')+' ('+Math.round(performance.now()-t0)+' ms at 2 m)');
 {const w=DHP.lit(CVC);add('wells-lit-at-noon',w.ok,w.detail);}
 /* no trees on cliffs or in buildings (PLAN.md P5): every hyperjungle tree and sapling roots on the kipuka's floor */
 {const T=typeof HYPERJUNGLE!=='undefined'?HYPERJUNGLE.TREES.concat(HYPERJUNGLE.SAPLINGS):[],U=typeof THRONE!=='undefined'?THRONE.TREES:[],bad=dhbTreesOk(T).concat(dhbTreesOk(U,DHB.throneMask));
  add('no-trees-on-cliffs-or-in-buildings',T.length>0&&U.length>0&&!bad.length,bad.length?bad.length+' misplaced, first '+bad.slice(0,3).join(', '):T.length+' trees and saplings on the kipuka floor, '+U.length+' of the Throne kit\'s on the flows');}
 {const c=DHP.cut();add('cut-away-sites',c.n>0&&!c.bad.length,c.bad.length?c.bad.length+' carved sites not opened: '+c.bad.slice(0,4).join(', '):c.n+' carved sites open their front and back in the cut-away');}
 {const w=DHP.budgets();add('view-budgets',w.ok,w.detail);}
 const rt=DHP.routes(KWALK),bad=rt.filter(r=>!DHP.ok(r.log));
 add('walk-ways',rt.length===DH.DISTRICTS.length-1&&!bad.length,bad.length?bad.map(r=>r.name+': '+r.log.filter(s=>!s.ok).map(s=>s.name+' REFUSED @'+s.feet+' '+s.at).join(', ')).join(' | '):rt.map(r=>r.name+' '+r.log.length+' legs').join(', '));
 /* the nav graph (PLAN.md 8.3, 1 to 4: 72-dhelv-nav.js) */
 {const B=DHN.get(),c1=DHN.chkNodes(B);add('nav-nodes-on-floors',B.nodes.length>0&&!c1.length,c1.length?c1.length+' off their floor, first '+c1.slice(0,4).join(', '):B.nodes.length+' nodes within 0.1 m of a walk floor (built in '+B.ms+' ms)');
  const t0=performance.now(),c2=DHN.chkEdges(B);add('nav-edges-walkable',!c2.length,c2.length?c2.length+' not walkable, first '+c2.slice(0,4).map(b=>b.e.a+'-'+b.e.b+' ('+b.e.kind+'): '+b.why).join(', '):B.edges.length+' edges walked both ways every 0.5 m, 2 m headroom on the carved ways and the doors ('+Math.round(performance.now()-t0)+' ms)');
  const c3=DHN.chkReach(B);add('nav-places-reachable',B.doors.length>0&&!c3.length,c3.length?c3.length+' unreachable from the gate: '+c3.slice(0,6).join(', '):B.doors.length+' doors reachable from the outpost\'s gate (the secret ways apart)');
  const c4=DHN.chkStacked(B);add('nav-stacked-lookups',c4.n>0&&!c4.bad.length,c4.bad.length?c4.bad.join('; '):c4.n+' crossings of ways a level apart: a point on each finds its own');}
 /* the ramblers (PLAN.md 8.3, 5 and 6: 74-dhelv-sim.js): a day stepped minute by minute, sampled every half hour */
 if(DHL.on){const t0=performance.now(),d=DHS._lastDay=DHS.day(DHL.clock,1440),ms=Math.round(performance.now()-t0),nd=DH.DISTRICTS.length;
  add('day-run',d.poses>0&&!d.bad.length&&!d.routeFail&&!d.stuck&&!d.nopath&&d.stairs>0&&d.districts.length===nd,d.poses+' poses out in the world, '+(d.bad.length?'BAD: '+d.bad.join('; '):'every one on a floor, out of every block and the rock')+'; '+d.decisions+' decisions'+
   (d.routeFail||d.nopath?', '+(d.routeFail+d.nopath)+' NO PATH '+JSON.stringify(d.rf):'')+(d.stuck?', '+d.stuck+' STUCK':'')+'; '+d.stairs+' ways up or down a stair; districts visited '+d.districts.length+' of '+nd+' ('+ms+' ms)');
  add('life-rules',d.foreign>0&&!d.fbad.length&&d.shutTasks>0&&!d.crossed.length,d.foreign+' foreigners\' ways on the outer zone'+(d.fbad.length?' BUT '+d.fbad.join('; '):'')+'; '+d.shutTasks+' ways decided while the stone door was shut, '+(d.crossed.length?d.crossed.length+' THROUGH IT: '+d.crossed.join(', '):'none through it (the guard\'s apart)'));}
 else add('day-run',false,'the life layer is off');
 /* the groups that try the hard routes (PLAN.md 8.2): in that day each kind set out and came back; then a patrol fired now
    makes its one stop (a secret exit, by the scouts' way) and comes back */
 if(DHL.on){const G=DHS._lastDay&&DHS._lastDay.groups||{},k=Object.keys(G),bad=k.filter(q=>!G[q].fired||!G[q].left),P=DHS.groupRun(DHL.clock,SIM.get('event','patrol'));
  add('groups-ran',k.length>0&&!bad.length&&P.ok,k.map(q=>q+' '+G[q].fired+' out, '+G[q].left+' back').join('; ')+(bad.length?' (NONE: '+bad.join(', ')+')':'')+'; a patrol now: '+P.detail);}
 return R;}
function hostNegatives(){const R=[],add=(name,failed,detail)=>R.push({name,failed:!!failed,detail});
 /* sky: the hall's light well forgotten */
 {const e=CVC.export();e.openings=e.openings.filter(q=>q.id!=='dh.hall.well');const D=KCAVERN.load(e,{ground:(x,z)=>terrainH(x,z)}).build(),L=D.skyLeaks(2);add('cavern-sky: the light well undeclared',L.length>0,L.length+' leaks');}
 /* trees: one planted at the cliff's foot, one in the caravanserai */
 {const C=DH.SITES.find(q=>q.key==='zj_caravanserai'),bad=dhbTreesOk([{x:DH.CONE.cliffX+2,z:0},{x:C.x,z:C.z}]);add('no-trees-on-cliffs-or-in-buildings: a tree on the cliff, one in a building',bad.length===2,bad.join(', '));}
 /* light: a plug of rock left in the light well's throat */
 {const e=CVC.export(),H=DH.HALL,top=DH.groundY(H.c[0],H.c[1]);e.prims.push({kind:'monolith',id:'probe-plug',owner:'probe',poly:[[H.c[0]-25,H.c[1]-25],[H.c[0]+25,H.c[1]-25],[H.c[0]+25,H.c[1]+25],[H.c[0]-25,H.c[1]+25]],y0:top-6,y1:top+3});
  let D=null;try{D=KCAVERN.load(e,{ground:(x,z)=>terrainH(x,z)}).build();}catch(err){}const w=D?DHP.lit(D):{ok:true,detail:'the plugged copy did not load'};add('wells-lit-at-noon: the light well plugged',!w.ok,w.detail);}
 /* cut-away: every box's turn mirrored */
 {const c=DHP.cut(true);add('cut-away-sites: the turns mirrored',c.bad.length>0,c.bad.length+' of '+c.n+' not opened');}
 /* budgets: the switch off (everything drawn, as ?seeall) */
 {DH_CELLS.on=false;const w=DHP.budgets();DH_CELLS.on=true;add('view-budgets: everything drawn',!w.ok,w.detail);}
 /* ways: the stone door's passage left out of the walk map: nothing past it is reached */
 {const R0=REG.find(r=>r.key==='zj_stonedoor'),W=DHP.copyWalk(f=>R0&&f.name===R0.tid+'.pass');const r=DHP.routes(W).find(r=>r.name==='hub');add('walk-ways: the stone door\'s passage missing',r&&!DHP.ok(r.log),r?r.log.filter(s=>!s.ok).map(s=>s.name).join(', '):'no route');}
 /* the nav graph's: broken copies of its parts (the graph itself is left as it is) */
 {const B=DHN.get(),T=B.edges.filter(e=>e.layout&&e.kind==='tube').sort((u,v)=>u.w-v.w)[0],a=B.byId[T.a],b=B.byId[T.b],L=Math.hypot(b.x-a.x,b.z-a.z),m={id:'probe:moved',x:(a.x+b.x)/2-(b.z-a.z)/L*(T.w/2+2),y:(a.y+b.y)/2,z:(a.z+b.z)/2+(b.x-a.x)/L*(T.w/2+2)};
  const c1=DHN.chkNodes({nodes:[m]});add('nav-nodes-on-floors: a node moved 2 m into the rock',c1.length===1,c1.join(', '));
  /* a pillar: the narrowest block standing on the hall's floor; an edge from 3 m one side of it to 3 m the other */
  const H=DH.HALL,pil=KWALK.blocks.filter(q=>{const k=q.box;return k[0]>H.c[0]-H.rx&&k[1]<H.c[0]+H.rx&&k[4]<H.y+.5&&k[5]>H.y+2&&k[1]-k[0]<1.6&&k[3]-k[2]<1.6;}).find(q=>{const k=q.box,cx=(k[0]+k[1])/2,cz=(k[2]+k[3])/2;return [cx-3,cx+3].every(x=>{const f=KWALK.floorBelow(x,cz,H.y+.3,.6);return f&&Math.abs(f[0]-H.y)<.1&&!KWALK.blocked(x,f[0],cz,DHN.R,DHN.H);});});
  if(pil){const k=pil.box,cx=(k[0]+k[1])/2,cz=(k[2]+k[3])/2,p={id:'p:a',x:cx-3,y:H.y,z:cz},q={id:'p:b',x:cx+3,y:H.y,z:cz},c2=DHN.chkEdges({edges:[{a:'p:a',b:'p:b',kind:'floor'}],byId:{'p:a':p,'p:b':q}});
   add('nav-edges-walkable: an edge through a pillar',c2.length===1&&/blocked/.test(c2[0].why),c2.length?c2[0].why+' at '+c2[0].at.map(v=>v.toFixed(1)).join(' '):'walked');}
  else add('nav-edges-walkable: an edge through a pillar',false,'no pillar on the hall floor to try');
  /* a low lintel: a carved tube walked by someone 6 m tall (its headroom is less) */
  const c2b=DHN.chkEdges({edges:[T],byId:B.byId},{headroom:6});add('nav-edges-walkable: a tube under a 6 m headroom (a low lintel)',c2b.length===1&&/headroom/.test(c2b[0].why),c2b.length?c2b[0].why:'passed');
  /* one tunnel cut: the south well's ways in (every carved way to its pit) */
  const cut=new Set(B.edges.filter(e=>e.layout&&(e.a==='s2.in'||e.b==='s2.in')).map(e=>e.id)),c3=DHN.chkReach(B,e=>e.zone!=='secret'&&!cut.has(e.id));
  add('nav-places-reachable: the south well\'s tunnel cut',c3.length>0,c3.length+' unreachable: '+c3.slice(0,4).join(', '));
  const c4=DHN.chkStacked(B,true);add('nav-stacked-lookups: the y swapped',c4.bad.length>0,c4.bad.length+' of '+c4.n*2+' found the other level');
  /* the ramblers': a walker planted 3 m over the hall's floor, one inside the pillar */
  if(DHL.on){const H=DH.HALL,w1=DHS.poseOk({x:H.c[0],y:H.y+3,z:H.c[1]}),k=pil&&pil.box,w2=k?DHS.poseOk({x:(k[0]+k[1])/2,y:H.y,z:(k[2]+k[3])/2}):null;
   add('day-run: a walker planted off the floor, one inside a pillar',!!w1&&!!w2,(w1||'stood')+', '+(w2||'stood'));
   /* a foreign trader's way planted through the gate into the city; a way planted through the shut stone door */
   const car=SIM.all('place').find(P=>P.kind==='caravanserai'),mk=SIM.all('place').find(P=>P.kind==='market'),r1=car&&mk&&SIM.nav.route('pedestrian',car.door,mk.door),r2=car&&mk&&SIM.nav.route('guard',car.door,mk.door);
   const f=r1?DHS.foreignOk({legs:[{layer:'pedestrian',route:r1}]}):'no route',x=r2?DHS.crossesDoor({legs:[{layer:'pedestrian',route:r2}]}):false;
   add('life-rules: a foreign way through the gate, a way through the shut door',!!f&&x,(f||'kept to the outer zone')+'; '+(x?'through the door':'not through the door'));
   /* groups: a patrol whose stop nothing offers */
   const p0=DHS.problems.length,X=SIM.event(Object.assign({},SIM.get('event','patrol'),{id:'probe_lost_patrol',legs:[{activity:'SING',mins:10}]})),g=DHS.groupRun(DHL.clock,X);SIM.remove('event',X.id);
   DHS.problems.length=p0;SIM.problems.length=Math.min(SIM.problems.length,p0);add('groups-ran: a patrol whose stop nothing offers',!g.ok,g.detail);}}
 return R;}
window.hostChecks=hostChecks;window.hostNegatives=hostNegatives;
