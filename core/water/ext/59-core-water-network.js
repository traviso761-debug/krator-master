// ================================================================= WATER - ext: a flow network (joins, confluences, forks and mouths from one graph)
// [G data]: no THREE, no DOM. Adds to WATER (20, 22; ext/55 for its confluences). Opt-in by path. 59b-core-water-network-draw.js draws it.
// PRACTICE.md section 2, item 2.
//
// A page with several flows wired each meeting by hand: a confluence where a tributary joins (the SW highlands), one per delta fork with its
// disc placed and sized by eye (eastabyss), a keep fade where each channel meets the lake, ribbons ordered so a tributary lies over its river.
// The network does all of it from the graph: each flow names its parent (the flow it leaves or joins) and the open water it may end in.
//   WATER.network({flows, ground, open, reach, mouth, confluence}) -> N (a group in WATER.groups)
//        flows   [{flow (a WATER.flow record), parent (an index, a name or a record; none for a trunk)}, ...]
//        ground  (x, z) -> y (the confluences' shore); open: [open surfaces] a flow may end in (its keep fade); reach (m, 6): how far past
//        both ribbons' edges a child's end may lie from its parent and still meet it, else it is refused (a gap the eye would see)
//        mouth {len (45 m), sample (2 m)}: the fade into open water, over len m round where the line enters it; confluence: ext/55's options
//        (cell, blur, reach, meet, round) for every disc
//   For each child: its kind ('tributary': it ends on its parent; 'distributary': it starts from it), its junction (that end), and its
//   overlap (m along it from the junction until its ribbon is clear of its parent's and its siblings'). Junctions on one parent within a disc
//   of each other share one confluence (a fork's siblings); each disc is centred on the overlaps' middles and sized to reach past them.
//   N.joins [{child, parent, kind, at, overlap}], N.confluences [ext/55 records], N.keep [(x, z) -> 0..1 or null, per flow],
//   N.order [renderOrder per flow: a child over its parent], N.export() (plain data: the joins, the discs' ids, the mouths)
(function(){const W=WATER,cl=(x,a,b)=>x<a?a:x>b?b:x,ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const arcOf=S=>{const P=S.pts,A=[0];for(let i=1;i<P.length;i++)A.push(A[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z));return A;};
 const along=(S,A,x,z)=>{const q=S.nearest(x,z);return A[q.i]+q.u*q.L;};
 const ptAt=(S,A,s)=>{const P=S.pts;s=cl(s,0,A[A.length-1]);let i=0;while(i+2<P.length&&A[i+1]<s)i++;const u=(s-A[i])/Math.max(1e-9,A[i+1]-A[i]);
  return{x:P[i].x+(P[i+1].x-P[i].x)*u,z:P[i].z+(P[i+1].z-P[i].z)*u,w:P[i].w+(P[i+1].w-P[i].w)*u};};
 const hwAt=(S,x,z)=>{const q=S.nearest(x,z);return{d:q.d,hw:(q.a.w+(q.b.w-q.a.w)*q.u)/2};};
 W.network=o=>{const E=o.flows.map(e=>e&&e.flow?e:{flow:e}),F=E.map(e=>e.flow),reach=o.reach==null?6:o.reach,mg=W.PRESETS.flow.margin;
  if(typeof o.ground!=='function')throw new Error('WATER.network: ground (x, z) -> y');
  const idx=p=>p==null?-1:typeof p==='number'?p:typeof p==='string'?F.findIndex(S=>S.name===p):F.indexOf(p);
  const A=F.map(arcOf),N={kind:'network',name:o.name||'network',flows:F,joins:[],confluences:[],keep:F.map(()=>null),order:F.map(()=>2)};
  // ---- the joins: which end of the child meets its parent, and how far its ribbon overlaps
  E.forEach((e,c)=>{const p=idx(e.parent);if(p<0)return;if(p===c)throw new Error('WATER.network: '+F[c].name+' is its own parent');
   const C=F[c],P=F[p],a=C.pts[0],b=C.pts[C.pts.length-1],qa=hwAt(P,a.x,a.z),qb=hwAt(P,b.x,b.z);
   const ga=qa.d-qa.hw-a.w/2,gb=qb.d-qb.hw-b.w/2,trib=gb<=ga,g=trib?gb:ga;
   if(g>reach)throw new Error('WATER.network: '+C.name+' does not reach '+P.name+' (its nearer end lies '+g.toFixed(1)+' m past both ribbons\' edges)');
   const end=trib?b:a,L=A[c][A[c].length-1];let ov=0;
   for(let s=0;s<=L;s+=1){const q=ptAt(C,A[c],trib?L-s:s),h=hwAt(P,q.x,q.z);if(h.d<=h.hw+q.w/2+2*mg){ov=s;}else if(s>ov+4)break;}
   N.joins.push({child:c,parent:p,kind:trib?'tributary':'distributary',at:[end.x,end.z],overlap:ov});N.order[c]=Math.max(N.order[p]+1,3);});
  // ---- the discs: a parent's joins within reach of each other share one
  const wOf=i=>Math.max(...F[i].pts.map(q=>q.w)),used=new Set();
  N.joins.forEach((J,k)=>{if(used.has(k))return;const grp=[J];used.add(k);
   N.joins.forEach((K,m)=>{if(used.has(m)||K.parent!==J.parent)return;const r=1.25*Math.max(wOf(J.parent),wOf(J.child),wOf(K.child))+Math.max(J.overlap,K.overlap);
    if(Math.hypot(K.at[0]-J.at[0],K.at[1]-J.at[1])<r){grp.push(K);used.add(m);}});
   // centred on the middles of the overlaps (a join with none: its junction), sized to reach past each overlap's far end
   const mids=grp.map(G=>{const c=G.child,L=A[c][A[c].length-1],s=G.kind==='tributary'?L-G.overlap/2:G.overlap/2,q=ptAt(F[c],A[c],s);return[q.x,q.z];});
   const at=[mids.reduce((s,m)=>s+m[0],0)/mids.length,mids.reduce((s,m)=>s+m[1],0)/mids.length],wm=Math.max(wOf(J.parent),...grp.map(G=>wOf(G.child)));
   let r=1.25*wm;grp.forEach(G=>{const c=G.child,L=A[c][A[c].length-1],q=ptAt(F[c],A[c],G.kind==='tributary'?L-G.overlap:G.overlap);r=Math.max(r,Math.hypot(q.x-at[0],q.z-at[1])+wm);});
   const flows=[F[J.parent],...grp.map(G=>F[G.child])];
   const CF=W.confluence(Object.assign({},o.confluence||{},{name:(o.name||'network')+': '+flows.map(S=>S.name).join(' + '),flows,at,r,ground:o.ground}));
   CF.members=[J.parent,...grp.map(G=>G.child)];N.confluences.push(CF);});
  // ---- the mouths: a flow that ends in open water fades out over `len` m round where its line enters it
  const MO=Object.assign({len:45,sample:2},o.mouth||{}),open=o.open||[];N.mouths=[];
  F.forEach((S,i)=>{const L=A[i][A[i].length-1],e=S.pts[S.pts.length-1],O=open.find(q=>q.contains(e.x,e.z));if(!O)return;
   let sE=L;for(let s=0;s<=L;s+=MO.sample){const q=ptAt(S,A[i],s);if(O.contains(q.x,q.z)){sE=s;break;}}
   const lo=sE-MO.len/3,hi=sE+2*MO.len/3,Ai=A[i];N.keep[i]=(x,z)=>1-ss(lo,hi,along(S,Ai,x,z));N.mouths.push({flow:i,into:O.name,s:sE,len:MO.len});});
  N.export=()=>({kind:'network',name:N.name,flows:F.map(S=>S.id),joins:N.joins.map(J=>Object.assign({},J)),confluences:N.confluences.map(C=>({name:C.name,members:C.members,at:C.mouth,r:C.r})),mouths:N.mouths,order:N.order});
  W.groups.push(N);return N;};
})();
