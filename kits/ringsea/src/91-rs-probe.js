// ---------------------------------------------------------------- probe (window._api): the Ancients-kit contract, for vessels
const BUDGET={showcase:{tris:2600000,calls:260},cls:{small:60000,medium:160000,large:280000},type:{}};
function rsTypeCls(k){const D=RS.defs[k];return BUDGET.type[k]||(D.L<16?'small':D.L<34?'medium':'large');}
function _probePoints(){const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){o.updateMatrixWorld();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.premultiply(o.matrixWorld);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  const pa=o.geometry.attributes.position;const step=Math.max(1,Math.floor(pa.count/400));const v=new THREE.Vector3();
  for(let i=0;i<pa.count;i+=step){v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld);pts.push([v.x,v.y,v.z]);}});
 return pts;}
function regOccupancy(){const n=new Array(REG.length).fill(0);for(const p of _probePoints())REG.forEach((r,i)=>{const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=r.y-2&&p[1]<=r.y+r.h+5)n[i]++;});
 return REG.map((r,i)=>({name:r.name,type:r.key,n:n[i]}));}
function nanSweep(){const bad=[];scene.traverse(o=>{if(!o.isMesh||(o.userData&&o.userData.probeSkip))return;const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(!p)return;const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({mesh:o.name,at:i,n:a.length});break;}});
 return{meshes:bad.length,first:bad.slice(0,8),instances:TSTAT.bad.length,firstInstances:TSTAT.bad.slice(0,8)};}
function typeStats(){const out={};for(const k in TSTAT.by){const t=TSTAT.by[k],cls=rsTypeCls(k);out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}return out;}
function tagAudit(){const bad=REG.filter(r=>!r.cls||!r.tags||!r.tags.culture||!r.tags.type||!r.tags.wealth||!r.tags.propulsion||!r.tags.hull);return{bad:bad.length,first:bad.slice(0,6).map(r=>r.name)};}
// vessel invariants (verify.py --assert runs these through _api.extra())
function rsExtra(){const R=[];const P=RS_PLACED;
 // 1. every vessel floats: its lowest point is under the sea and its sheer is above it
 {const bad=P.filter(p=>!(p.bb.min.y<-.1&&p.bb.max.y>1));R.push({name:'vessels-float',ok:!bad.length,detail:bad.length?bad.map(p=>p.D.name+' y '+p.bb.min.y.toFixed(2)+'..'+p.bb.max.y.toFixed(2)).join(' | '):P.length+' vessels straddle the waterline'});}
 // 2. no two vessels' boxes overlap (sails and oars included)
 {const hits=[];for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i].bb.clone().expandByScalar(1),b=P[j].bb;if(a.intersectsBox(b))hits.push(P[i].D.name+' x '+P[j].D.name);}
  R.push({name:'no-vessel-overlap',ok:!hits.length,detail:hits.length?hits.join(' | '):'clean'});}
 // 3. declared L/B/H agree with the built box (the layout and the camera presets trust them)
 {const bad=[];for(const p of P){const s=p.bb.getSize(new THREE.Vector3());const L=s.x,H=p.bb.max.y;if(L>p.D.L*1.45||L<p.D.L*.75||H>p.D.H*1.3||H<p.D.H*.6)bad.push(p.D.name+' built '+L.toFixed(1)+'x'+H.toFixed(1)+' vs declared L'+p.D.L+' H'+p.D.H);}
  R.push({name:'declared-size-matches',ok:!bad.length,detail:bad.length?bad.join(' | '):'L and H within tolerance for all'});}
 // 4. oar blades reach the water at the catch: each bank is posed at its catch and its lowest blade tip must be under y=0.2
 {const bad=[];const m=new THREE.Matrix4(),v=new THREE.Vector3();for(const p of P)p.G.children.filter(o=>o.isInstancedMesh).forEach(im=>{let lo=1e9;const g=im.geometry;g.computeBoundingBox();if(im.userData.pose)im.userData.pose(im.userData.tCatch);
   for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);v.set(0,0,g.boundingBox.max.z).applyMatrix4(m);lo=Math.min(lo,v.y);}if(lo>.2)bad.push(p.D.name+' '+im.name+' tip '+lo.toFixed(2));});
  R.push({name:'oars-reach-water',ok:!bad.length,detail:bad.length?bad.join(' | '):'every bank dips'});}
 // 5. sails clear the cabins: no sail vertex inside a registered solid (castles, deckhouses)
 {const bad=rsSailsInCabins(0);R.push({name:'sails-clear-cabins',ok:!bad.length,detail:bad.length?bad.join(' | '):'no sail passes through a cabin'});}
 // 5b. sails clear each other: no point of one sail within 0.3 m of another sail's (hashed on a 0.5 m grid)
 {const bad=rsSailsTouch(0);R.push({name:'sails-clear-sails',ok:!bad.length,detail:bad.length?bad.join(' | '):'no two sails touch'});}
 // 7-11. the same invariants posed: on the swell at several times, at rest and under way (91-rs-probe.js rsPosedChecks)
 for(const r of rsPosedChecks())R.push(r);
 // 12. decks (95-rs-deck.js): every vessel boards from the water amidships onto its deck, and each mast stops a walker
 {const bad=[],bm=[];let minA=1e9,minK='';for(const p of P){const D=rsDeckData(p);if(D.walkArea<minA){minA=D.walkArea;minK=p.D.name;}
   let top=-1e9;for(const f of[0,.12,-.12,.25,-.25]){   // walk north across the vessel on a few lines from the water south of it
    let v=-1,x=p.way.x+f*p.D.L,z=p.way.z+(p.bb.max.z-p.z)+2,fy=rsSeaH(x,z,RS_U.uTime.value),n=0;const z1=p.way.z+(p.bb.min.z-p.z)-2;
    while(z>z1&&n++<3000){const r=rsWalkResolve(x,z-.1,fy,v);if(r.blocked)break;z-=.1;v=r.v;fy=r.y;if(v>=0)top=Math.max(top,r.ly);}}
   if(top<D.deckY-1.2||top>D.deckY+1.6)bad.push(p.D.name+(top<-1e8?' never boards':' stands at '+top.toFixed(2)+' (deck '+D.deckY.toFixed(2)+')'));
   for(const m of D.masts){const g=rsDeckCell(D,m.x+m.ax*(D.deckY-m.y),m.z+m.az*(D.deckY-m.y),D.deckY,false);if(g&&!g.blocked)bm.push(p.D.name+' mast at '+m.x);}}
  R.push({name:'decks-walkable',ok:!bad.length,detail:bad.length?bad.join(' | '):P.length+' vessels board from the water onto their decks; least walkable deck '+minA.toFixed(0)+' m2 ('+minK+')'});
  R.push({name:'masts-block-walker',ok:!bm.length,detail:bm.length?bm.join(' | '):'every mast stops the walker'});}
 // 6. project tags
 {const t=tagAudit();R.push({name:'tags-complete',ok:!t.bad,detail:t.bad?t.first.join(' | '):REG.length+' vessels tagged culture/type/wealth/propulsion/hull'});}
 return R;}
// a vessel's sail points as trimmed by angle a (rsRigPose, the shader's rotation on the CPU)
function rsSailPts(p,a){return(p.G.userData.sail||[]).map(q=>{if(!a||!q[4])return q;const r=rsRigPose(q,q[4],a);return[r[0],r[1],r[2],q[3]];});}
function rsSailsInCabins(a){const bad=[];for(const p of RS_PLACED){const S=p.G.userData.solids||[],Q=rsSailPts(p,a);let n=0;for(const q of Q)for(const b of S){if(q[0]>b.min[0]+.05&&q[0]<b.max[0]-.05&&q[1]>b.min[1]+.05&&q[1]<b.max[1]-.05&&q[2]>b.min[2]+.05&&q[2]<b.max[2]-.05){n++;break;}}if(n)bad.push(p.D.name+(a?' (trim '+a.toFixed(2)+')':'')+' '+n+' sail pts');}return bad;}
function rsSailsTouch(a){const bad=[];for(const p of RS_PLACED){const Q=rsSailPts(p,a),grid=new Map(),key=(x,y,z)=>Math.floor(x/.5)+','+Math.floor(y/.5)+','+Math.floor(z/.5);let n=0;
  for(const q of Q){const k=key(q[0],q[1],q[2]);(grid.get(k)||grid.set(k,[]).get(k)).push(q);}
  for(const q of Q){let hit=false;for(let dx=-1;dx<=1&&!hit;dx++)for(let dy=-1;dy<=1&&!hit;dy++)for(let dz=-1;dz<=1&&!hit;dz++){const L=grid.get((Math.floor(q[0]/.5)+dx)+','+(Math.floor(q[1]/.5)+dy)+','+(Math.floor(q[2]/.5)+dz));
    if(L)for(const r of L){if(r[3]!==q[3]&&(r[0]-q[0])**2+(r[1]-q[1])**2+(r[2]-q[2])**2<.09){hit=true;break;}}}if(hit)n++;}
  if(n)bad.push(p.D.name+(a?' (trim '+a.toFixed(2)+')':'')+' '+n+' pts');}return bad;}
// a vessel's plan box (vessel frame, oars and sails included) as a rectangle at pose w -> its four corners in the world
function rsPlanEnv(p){if(p.env)return p.env;const b=p.bb,e=[b.min.x-p.x,b.max.x-p.x,b.min.z-p.z,b.max.z-p.z];   // grown to hold the sails trimmed either way
 for(const a of[RS_WAY.trimMax,-RS_WAY.trimMax])for(const q of rsSailPts(p,a)){e[0]=Math.min(e[0],q[0]);e[1]=Math.max(e[1],q[0]);e[2]=Math.min(e[2],q[2]);e[3]=Math.max(e[3],q[2]);}return p.env=e;}
function rsPlanRect(p,w,m){const e=rsPlanEnv(p),x0=e[0]-m,x1=e[1]+m,z0=e[2]-m,z1=e[3]+m,c=Math.cos(w.yaw),s=Math.sin(w.yaw);
 return[[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(([x,z])=>[w.x+x*c+z*s,w.z-x*s+z*c]);}
function rsRectsHit(A,B){for(const P of[A,B])for(let i=0;i<4;i++){const a=P[i],b=P[(i+1)%4],nx=-(b[1]-a[1]),nz=b[0]-a[0];let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
  for(const q of A){const d=q[0]*nx+q[1]*nz;a0=Math.min(a0,d);a1=Math.max(a1,d);}for(const q of B){const d=q[0]*nx+q[1]*nz;b0=Math.min(b0,d);b1=Math.max(b1,d);}if(a1<b0||b1<a0)return false;}return true;}
// run fn with the Under way state set to st, then put everything back as it was (and re-pose at the clock)
function rsWithWay(st,fn){const W=RS_WAY,keep={on:W.on,tOn:W.tOn,tOff:W.tOff,sOn:W.sOn,sOff:W.sOff,kOff:W.kOff};Object.assign(W,st);
 try{return fn();}finally{Object.assign(W,keep);rsFleetPose(rsClock());}}
const RS_PROBE={rest:[0,7.3,21.1],way:[7.3,21.1,60,140,260]};
function rsPosedChecks(){const R=[],P=RS_PLACED,v=new THREE.Vector3(),m=new THREE.Matrix4();
 const fl=[],ov=[],oa=[];let minFb=1e9,minDip=-1e9;
 const atPose=(lab)=>{for(const p of P)p.G.updateMatrixWorld(true);const t=RS_U.uTime.value;
  // the hull floats on the swell: deck at bow, amidships and stern above the water there, the keel below it
  for(const p of P){const dy=p.V.deckY;if(dy==null)continue;let worst=1e9;
   for(const x of[-.3,0,.3]){v.set(x*p.D.L,dy,0).applyMatrix4(p.G.matrixWorld);worst=Math.min(worst,v.y-rsSeaH(v.x,v.z,t));}
   v.set(0,p.bb.min.y,0).applyMatrix4(p.G.matrixWorld);const keel=v.y-rsSeaH(v.x,v.z,t);minFb=Math.min(minFb,worst);
   if(worst<.03||keel>-.1)fl.push(lab+' '+p.D.name+' deck '+worst.toFixed(2)+' keel '+keel.toFixed(2));}
  // no two vessels' plan boxes (oars included) overlap at their poses
  const rc=P.map(p=>rsPlanRect(p,p.way,.5));for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++)if(rsRectsHit(rc[i],rc[j]))ov.push(lab+' '+P[i].D.name+' x '+P[j].D.name);
  // every oar bank still dips at its catch on the swell
  for(const p of P)p.G.children.filter(o=>o.isInstancedMesh).forEach(im=>{const g=im.geometry;g.computeBoundingBox();if(im.userData.pose)im.userData.pose(im.userData.tCatch);let lo=1e9;
   for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);v.set(0,0,g.boundingBox.max.z).applyMatrix4(m).applyMatrix4(p.G.matrixWorld);lo=Math.min(lo,v.y-rsSeaH(v.x,v.z,t));}
   minDip=Math.max(minDip,lo);if(lo>.2)oa.push(lab+' '+p.D.name+' '+im.name+' tip '+lo.toFixed(2));});};
 const trims=new Set();
 rsWithWay({on:false,sOff:0,kOff:0,tOff:-1e9},()=>{for(const t of RS_PROBE.rest){rsFleetPose(t);atPose('rest t='+t);}});
 rsWithWay({on:true,tOn:0,sOn:0},()=>{for(const t of RS_PROBE.way){rsFleetPose(t);atPose('way t='+t);for(const p of P)trims.add(+p.way.trim.toFixed(2));}});
 R.push({name:'vessels-float-swell',ok:!fl.length,detail:fl.length?fl.slice(0,6).join(' | '):'deck above and keel below the swell at t='+RS_PROBE.rest.join(',')+' at rest and t='+RS_PROBE.way.join(',')+' under way; least freeboard '+minFb.toFixed(2)+' m'});
 R.push({name:'no-vessel-overlap-posed',ok:!ov.length,detail:ov.length?ov.slice(0,6).join(' | '):'plan boxes (+0.5 m) clear at every sampled pose'});
 R.push({name:'oars-reach-water-swell',ok:!oa.length,detail:oa.length?oa.slice(0,6).join(' | '):'every bank dips at its catch on the swell (worst tip '+minDip.toFixed(2)+' m from the surface)'});
 // the courses: a whole lap (and the run home after a toggle mid-lap) sampled every 1.5 s (0.25 s home): no two plan boxes meet
 {const W=RS_WAY,lap=W.P/W.speed+3*W.ease,hits=[];let n=0,minGap=1e9;
  const chk=(lab)=>{const rc=P.map(p=>rsPlanRect(p,rsWayPose(p,RS_U.uTime.value),.5));n++;for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++)if(rsRectsHit(rc[i],rc[j]))hits.push(lab+' '+P[i].D.name+' x '+P[j].D.name);};
  rsWithWay({on:true,tOn:0,sOn:0},()=>{for(let t=0;t<=lap;t+=1.5){RS_U.uTime.value=t;chk('t='+t.toFixed(1));}});
  rsWithWay({on:false,sOff:W.speed*150,kOff:1,tOff:0},()=>{for(let t=0;t<=10;t+=.25){RS_U.uTime.value=t;chk('home t='+t.toFixed(2));}});
  R.push({name:'courses-clear',ok:!hits.length,detail:hits.length?hits.slice(0,6).join(' | '):n+' poses over a full lap ('+lap.toFixed(0)+' s) and a run home: no two vessels meet'});}
 // sails clear the cabins and each other trimmed as far as they go, either way (and at the sampled trims)
 {const bad=[];for(const a of[...trims,RS_WAY.trimMax,-RS_WAY.trimMax,RS_WAY.trimMax/2,-RS_WAY.trimMax/2]){if(!a)continue;bad.push(...rsSailsInCabins(a),...rsSailsTouch(a));}
  R.push({name:'sails-clear-trimmed',ok:!bad.length,detail:bad.length?bad.slice(0,8).join(' | '):'no sail through a cabin or another sail at trims to +-'+RS_WAY.trimMax+' rad'});}
 return R;}
window._api={BUDGET,REG,
 get totals(){let tris=0,inst=0,meshes=0;for(const k in TSTAT.by){tris+=TSTAT.by[k].tris;inst+=TSTAT.by[k].inst;meshes+=TSTAT.by[k].meshes;}return{tris,inst,meshes,registered:REG.length,types:Object.keys(TSTAT.by).length};},
 typeStats,regOccupancy,nanSweep,tagAudit,extra:rsExtra,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 pause:(t)=>{window._rsPause=t==null?0:t;},
 defs:()=>RS.order.map(k=>{const D=RS.defs[k];return{key:k,name:D.name,culture:D.culture,tags:D.tags,L:D.L,B:D.B,H:D.H};})};
