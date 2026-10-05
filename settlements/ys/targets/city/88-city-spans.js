// ================================================================= YS CITY — the bridge graph (PLAN.md P3 step 3), as records
// Runs after the placer (88-city-place) and before the lived floors (88a), so the pods it adds are lived round.
// Travis (Oct 5 2026): every tower, landmark and drowned small-building mole has a foot link to at least one other, and
// from every one a path can be traced to the shore over the network; some towers bridge straight to the shore blocks.
// THE NODES: the drowned hosts, the walled moles (home-grown, the military harbour's, the headland, the Tides, the
// Library), the Citadel and the Temple of the Winds on their stacks, and the Amphitriton (its drawbridge to the Tides
// mole and the mole's causeway to the shore are the first edges). The Wet Cells stay an island reached by water (DESIGN).
// THE EDGES: 1. every pair of 4-neighbouring hosts, pod to pod (a way-in pod grown on each facing the other, plates
// within 8 m, near the L2 datum); 2. a spanning tree over the rest (Kruskal, by length: a node to a node within 300 m, a
// node to its shore point) until every node reaches the shore; 3. the hosts nearest the shore bridge to it anyway.
// By pair: host–host a rib bridge L1/L2; host–mole, host–shore and host–landmark a bridge from a way-in pod on the
// plate nearest the far end's height (a lily-pad landing on a stalk at a shore end, the bridge head's pad at the
// Citadel, the stack top at the Winds); mole–mole and mole–shore a walkway on stalks at the quay datum, or a pontoon
// (floating, a flight up each end) when a poor mole is on it. The draw pass (88b) builds them with the spans helpers
// (65-hyk-spans.js) once the pods' landings exist, and puts piers under any bridge longer than 55 m.
const SPANS={list:[],refused:[],nodes:[],shore:0};
(function spanPass(){const st=KRAND.stream(KRAND.child(PLACE.SEED,'spans'));
 const byBlock={};for(const h of PLACE.hosts)if(!h.land)byBlock[h.block]=h;
 const ang=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
 // can host h take pod `key` at world floor y, world bearing a? (the cut, its own ledges, the pods it has)
 const fits=(h,key,y,a)=>{const T=YS_HOST_TYPES[h.type],D=HYK.defs[key];if(y+D.h+2>h.top||(T.avoid&&T.avoid(y-h.sink,D.h)))return false;
  const r=h.rAt(y,a);for(const p of h.pods){if(p.core&&p.core!=='A')continue;const E=HYK.defs[p.key];if(y>=p.y+E.h+1||y+D.h<=p.y-1)continue;if(ang(a,p.a)*r<D.w/2+E.w/2+2.5)return false;}return true;};
 const addPod=(h,key,y,a)=>{const D=HYK.defs[key];const p={key,a:+a.toFixed(4),y,level:y>=20?'L2':'L1',into:true,wealth:D.tags.wealth,bridge:true};h.pods.push(p);h.ways.push({a:p.a,y,R:D.w/2});ysPlCount(key);return h.pods.length-1;};
 const level=y=>y>=20?'L2':'L1';
 // ---- 1. host to host: the pair's pods face each other on plates as near as the hosts allow; every lattice pair first
 const pair=(hA,hB)=>{const aA=Math.atan2(hB.z-hA.z,hB.x-hA.x),aB=aA+Math.PI;
  const kA=ysPlPick(st,PL_WAYS[hA.wealth]),kB=ysPlPick(st,PL_WAYS[hB.wealth]);
  let best=null;for(const yA of hA.plates)for(const yB of hB.plates){if(Math.abs(yA-yB)>8)continue;const c=Math.abs(yA-yB)*3+Math.abs((yA+yB)/2-28);if(best&&c>=best.c)continue;
    if(!fits(hA,kA,yA,aA)||!fits(hB,kB,yB,aB))continue;best={yA,yB,c};}
  if(!best)return false;const iA=addPod(hA,kA,best.yA,aA),iB=addPod(hB,kB,best.yB,aB);
  SPANS.list.push({kind:'bridge',a:{host:hA.n,pod:iA},b:{host:hB.n,pod:iB},level:level((best.yA+best.yB)/2),na:hA.n,nb:hB.n});return true;};
 for(const b of LAYOUT.blocks){const hA=byBlock[b.i+','+b.j];if(!hA)continue;
  for(const [di,dj] of [[1,0],[0,1]]){const hB=byBlock[(b.i+di)+','+(b.j+dj)];if(!hB)continue;if(!pair(hA,hB))SPANS.refused.push(hA.n+' / '+hB.n);}}
 // ---- 2. the nodes
 const N=SPANS.nodes;for(const h of PLACE.hosts)if(!h.land)N.push({kind:'host',n:h.n,x:h.x,z:h.z,y:h.plates[0],rec:h,wealth:h.wealth});
 for(const m of PLACE.moles)if(m.node)N.push(m.node);
 const LM=LAYOUT.landmarks;const stk=CITY.STACKS;
 if(LM.citadel)N.push({kind:'citadel',n:'the Citadel',x:LM.citadel.x,z:LM.citadel.z,y:Math.max(terrainH(LM.citadel.x,LM.citadel.z),0)+12,wealth:'civic'});
 if(LM.temple_winds)N.push({kind:'winds',n:'the Temple of the Winds',x:LM.temple_winds.x,z:LM.temple_winds.z,y:terrainH(LM.temple_winds.x,LM.temple_winds.z)+.3,wealth:'civic'});
 const A=LAYOUT.A,Tb=LAYOUT.landmarks.temple_tides;const tides=N.find(n=>n.n==='the Tides mole')||null;
 // the distance from a stack's centre to its wall along the world bearing phi (the plan is an ellipse that wanders)
 const stackEdge=(s,phi)=>{const e=s.e||1,a=s.a||0;const L=ysStackLocal(s,s.x+Math.cos(phi)*s.r,s.z+Math.sin(phi)*s.r);const k=Math.sqrt(Math.cos(phi-a)*Math.cos(phi-a)/(e*e)+Math.sin(phi-a)*Math.sin(phi-a))||1;return ysStackRR(s,L.th)/k;};
 if(A)N.push({kind:'amph',n:'the Amphitriton',x:A.x,z:A.z,y:12,wealth:'civic'});
 N.forEach((n,i)=>{n.i=i;});const par=N.map((_,i)=>i).concat([N.length]);const SH=N.length;   // SH: the shore
 const find=i=>{while(par[i]!==i){par[i]=par[par[i]];i=par[i];}return i;};const join=(i,j)=>{const a=find(i),b=find(j);if(a===b)return false;par[a]=b;return true;};
 for(const S of SPANS.list)join(N.find(n=>n.n===S.na).i,N.find(n=>n.n===S.nb).i);
 // the Amphitriton's link: shore -> the Tides mole (walkway, quay datum) -> the drawbridge port (+12)
 if(A&&Tb&&tides){const dx=A.x-Tb.x,dz=A.z-Tb.z,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l;const fA=[-LAYOUT.N[0],-LAYOUT.N[1]];   // the Amphitriton faces the land
  const Lx=-uz,Lz=ux,lat=34;   /* beside the temple: its back is flush with the mole's seaward edge, its front fills the middle */
  const port={x:A.x+fA[0]*47.7,y:12,z:A.z+fA[1]*47.7};const moleSea={x:Tb.x+ux*29+Lx*lat,y:2.5,z:Tb.z+uz*29+Lz*lat};
  SPANS.list.push({kind:'drawbridge',A:moleSea,B:port,level:'L1',na:'the Tides mole',nb:'the Amphitriton'});join(N.find(n=>n.kind==='amph').i,tides.i);
  // the shore end: walk landward from the mole's landward edge until the natural ground stands at the quay datum
  const moleLand={x:Tb.x-ux*44+Lx*lat,y:2.5,z:Tb.z-uz*44+Lz*lat};let s=44,shore=null;for(;s<420;s+=4){const x=Tb.x-ux*s+Lx*lat,z=Tb.z-uz*s+Lz*lat;if(terrainH(x,z)>=2.2){shore={x,y:2.5,z};break;}}
  if(shore&&s>50){SPANS.list.push({kind:'walkway',A:shore,B:moleLand,level:'quay',na:'the Tides mole',nb:'the shore'});join(tides.i,SH);}}
 // ---- the end points. A mole's is on its edge toward the far end, 2 m in; the shore's is the first natural ground at the
 // quay datum walking from the node toward the land (the nearest land block, else straight inland), clear of the
 // river, the karst and anything built, nudged along the shore when something stands there
 const edgeOf=(m,tx,tz)=>{const P=m.poly;const cx=(m.x0+m.x1)/2,cz=(m.z0+m.z1)/2;let best=1e9;
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];const ex=b[0]-a[0],ez=b[1]-a[1];const den=tx*ez-tz*ex;if(Math.abs(den)<1e-9)continue;
   const t=((a[0]-cx)*ez-(a[1]-cz)*ex)/den,u=((a[0]-cx)*tz-(a[1]-cz)*tx)/den;if(t>0&&u>=0&&u<=1)best=Math.min(best,t);}
  if(best>1e8)best=Math.min(m.x1-m.x0,m.z1-m.z0)/2;const d=Math.max(2,best-2);return {x:cx+tx*d,y:m.y+.15,z:cz+tz*d};};
 const landBlocks=LAYOUT.blocks.filter(b=>b.kind==='land');
 const shoreOf=n=>{const dirs=[];const nb=landBlocks.map(b=>[b,Math.hypot(b.x-n.x,b.z-n.z)]).sort((p,q)=>p[1]-q[1])[0];
  if(nb){const l=nb[1]||1;dirs.push([(nb[0].x-n.x)/l,(nb[0].z-n.z)/l]);}dirs.push([-LAYOUT.N[0],-LAYOUT.N[1]]);let best=null;
  for(const [dx,dz] of dirs){let x=n.x,z=n.z,s=0;for(;s<420;s+=4){x=n.x+dx*s;z=n.z+dz*s;if(terrainH(x,z)>=2.2)break;}if(s>=420)continue;
   const r=ysRiverDist(x,z);if(r.d<r.w*2.2+8||ysKarst(x,z)>0)continue;
   // a clear 7 m box for the landing, nudged along the shore (across the march) when something stands there
   let P=null;for(const k of [0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6]){const px=x-dz*k*8,pz=z+dx*k*8;if(terrainH(px,pz)<1.6||terrainH(px,pz)>4.5)continue;const B=ysPlBox(px,pz,3.5,3.5,0,'landing');if(ysPlClash(B))continue;P={x:px,y:2.5,z:pz,box:B};break;}
   if(!P)continue;const d=Math.hypot(P.x-n.x,P.z-n.z);if(!best||d<best.d)best={x:P.x,y:P.y,z:P.z,box:P.box,d};}
  return best;};
 // a bridge from host h toward the point Q (kind: mole, shore, citadel, winds): a way-in pod on the plate nearest Q's
 // height (never under the lowest), facing Q; null when no plate takes the pod
 const hostTo=(h,Q)=>{const a=Math.atan2(Q.z-h.z,Q.x-h.x);const key=ysPlPick(st,PL_WAYS[h.wealth]);const want=Math.max(h.plates[0],Q.y+(Q.kind==='citadel'?0:6));
  const Pl=h.plates.slice().sort((p,q)=>Math.abs(p-want)-Math.abs(q-want));for(const y of Pl){if(Math.abs(y-want)>40)break;if(!fits(h,key,y,a))continue;return {pod:addPod(h,key,y,a),y};}return null;};
 const nodeEnd=(n,toward)=>{const tx=toward.x-n.x,tz=toward.z-n.z,l=Math.hypot(tx,tz)||1;
  if(n.kind==='mole')return Object.assign(edgeOf(n.mole,tx/l,tz/l),{kind:'mole',n:n.n});
  if(n.kind==='winds'){const s=stk[1];const phi=Math.atan2(tz,tx);const d=Math.max(8,stackEdge(s,phi)-7);const x=n.x+Math.cos(phi)*d,z=n.z+Math.sin(phi)*d;return {x,y:terrainH(x,z)+.3,z,kind:'winds',n:n.n};}
  // the Citadel's bridge head: its pad outside the west door (local -x, which faces the Amphitriton: the stack's axis
  // points the other way); an estimate here, the draw pass finds the pad itself
  if(n.kind==='citadel'){const s=stk[0];const phi=(s.a||0)+Math.PI;const d=s.r*(s.e||1)+3.4;return {x:n.x+Math.cos(phi)*d,y:n.y,z:n.z+Math.sin(phi)*d,kind:'citadel',n:n.n};}
  return null;};
 // realise an edge between nodes (or a node and the shore); true when it is now a record
 const link=(p,q)=>{let rec=null;const shore=q==null;const Q=shore?shoreOf(p):null;if(shore&&!Q)return false;
  if(p.kind==='host'&&q&&q.kind==='host')return pair(p.rec,q.rec);
  if(p.kind==='host'){const far=shore?Q:nodeEnd(q,p);if(!far)return false;const e=hostTo(p.rec,far);if(!e)return false;
   if(shore){ysPlTake(Q.box);ysPlCount('hyk_lilypad');far.kind='shore';far.n='the shore';far.pad=true;}
   rec={kind:'bridge',a:{host:p.n,pod:e.pod},b:far,level:level((e.y+far.y)/2),na:p.n,nb:far.n};}
  else if(q&&q.kind==='host'){return link(q,p);}
  else if(p.kind==='mole'&&(shore||q.kind==='mole')){const Pa=edgeOf(p.mole,shore?(Q.x-p.x):(q.x-p.x),shore?(Q.z-p.z):(q.z-p.z));const Pb=shore?Object.assign({},Q,{kind:'shore',n:'the shore'}):edgeOf(q.mole,p.x-q.x,p.z-q.z);
   const L=Math.hypot(Pb.x-Pa.x,Pb.z-Pa.z);if(L<12)return false;if(shore)ysPlTake(Q.box);
   const poor=p.wealth==='poor'||(q&&q.wealth==='poor');rec={kind:poor?'pontoon':'walkway',A:Pa,B:Pb,level:poor?'wet':'quay',na:p.n,nb:shore?'the shore':q.n};ysPlCount(poor?'hyk_pontoon':'hyk_walkway');}
  else return false;   // a landmark reaches the network through a host
  SPANS.list.push(rec);return true;};
 // ---- 3. the spanning tree: every candidate edge by cost, joining components; a node's shore edge is a candidate too
 const cand=[];for(let i=0;i<N.length;i++){for(let j=i+1;j<N.length;j++){const p=N[i],q=N[j];if(p.kind==='amph'||q.kind==='amph')continue;const d=Math.hypot(p.x-q.x,p.z-q.z);const lm=/citadel|winds/.test(p.kind+q.kind);if(d>(lm?450:300))continue;
   if(lm&&p.kind!=='host'&&q.kind!=='host')continue;   /* a landmark reaches the network through a host */
   const f=(p.kind==='host')!==(q.kind==='host')?1.2:1;cand.push({i,j,c:d*f,d});}
  const p=N[i];if(p.kind==='host'||p.kind==='mole'){const S=shoreOf(p);if(S){p.shoreD=S.d;cand.push({i,j:SH,c:S.d*(p.kind==='host'?1.15:1),d:S.d});}}}
 cand.sort((a,b)=>a.c-b.c);
 for(const e of cand){if(find(e.i)===find(e.j))continue;if(link(N[e.i],e.j===SH?null:N[e.j]))join(e.i,e.j);}
 // the hosts nearest the shore bridge to it anyway (Travis: some towers bridging to shore blocks), three at most
 {let n=0;for(const p of N.filter(n=>n.kind==='host'&&n.shoreD!=null).sort((a,b)=>a.shoreD-b.shoreD)){if(n>=3||p.shoreD>260)break;if(SPANS.list.some(S=>S.na===p.n&&S.nb==='the shore'))continue;if(link(p,null))n++;}}
 SPANS.shore=N.filter(n=>find(n.i)===find(SH)).length;
 for(const n of N)if(find(n.i)!==find(SH))SPANS.refused.push(n.n+' (no path to the shore)');
})();
