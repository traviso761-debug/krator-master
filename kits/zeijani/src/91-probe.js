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
 routeOk(log){return !!log&&log.every(s=>s.ok===s.expect);},
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
 return R;}
window.hostChecks=hostChecks;window.hostNegatives=hostNegatives;
