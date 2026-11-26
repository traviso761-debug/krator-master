// ================================================================= WATER - the water-ground contract as one check, and placement from the ground
// [G data]: no THREE, no DOM. Adds to WATER (20-core-water.js, 22-core-water-flow.js; load after them, and after ext/55 when a page has
// confluences). Opt-in by path, in the SUBFOLDER core/water/ext/ (README "Taking it into a build"). PRACTICE.md section 2, items 1 and 3.
//
// PLACEMENT FROM THE GROUND (a line is a WATER.flow record, KRELIEF.river's [{x, z, y}] or [[x, z, y], ...], run downstream; ground (x, z) -> y):
//   WATER.lipAt(line, ground, {from, to, step, drop, near})  where the ground first falls away along the line: the first s (m along it) with
//        ground(s) - ground(s + step) > drop * step (1 m in 1 m); with `near` (m) the start of the drop nearest it instead of the first.
//        That step's edge is then found to within a few mm (the last point within `edge`, .1 m, of the ground at its start).
//        -> {x, z, y (the ground there), s, i (segment), dir [dx, dz]} or null
//   WATER.toeAt(line, ground, lip, {to, step, flat, hold})  where the ground levels off below a lip (a lipAt record or an s): the first s past it
//        from which the ground falls less than `flat` (.15) m a metre for `hold` (3) m. -> the same record shape, or null
//   WATER.levelFromDownstream(line, ground, {over, end})  each level the higher of ground + over (.6) and the level below it (the last: of ground
//        + over and `end`, the water it runs into): never rising downstream, never under the ground at the centreline. -> [[x, z, y], ...]
//   WATER.fallsOf(F, {ground}) places its lips and feet by these (this fragment wraps 22's; without ground it is 22's). It also wraps
//   drawFlow and drawFall to record what the audit reads (S.keepAt, D.plungeR); their drawings are unchanged.
// THE AUDIT: WATER.audit({ground, surfaces, joins, keep, plungeR, allow, extent, tol, step, scan}) -> findings [{rule, surface, id, x, z, by, other?}]:
//   flow-rise    a flow's level rises downstream (by: m)                     flow-under   its water under the ground at the centreline (m)
//   flow-slab    its ribbon's outer edge (half width + margin) more than tol.slab (.3 m) over the ground (m over)
//   flow-pocket  the ground under its level runs on past that edge, tol.pocket (1 m) or more, out to `scan` (m past the edge)
//   flow-graze   (opt-in, o.graze: true or {tol: .12, w: 2}) the ground within tol m of the ribbon's level (over or under it) for w m or more across, from 2 m
//                inside its edge out to the margin's end: the ribbon and the bank are near coplanar there and z-fight at range (m of it). A bank must cross the
//                level, not lie along it (2026-11-03: nwlowlands' hill river, the owner's flickering ponds)
//   still-rim    a still's level over its rim's ground (m)                   still-floor  its level not over its floor anywhere (m short)
//   open-edge    an open surface's mask edge (or its bounds' edge inside o.extent) across ground under its level, no other surface owning it (m under)
//   fall-lip     a fall's lip more than tol.lip (1 m) from where the ground first drops along its direction (m; 1e9: no drop found)
//   fall-lip-y   its lip off its flow's surface there (m)                    fall-curtain its curtain under the ground (m)
//   fall-plunge  a point of its plunge disc (at .75 of the radius, and the centre) over no water (by: its distance from the centre)
//   overlap      two surfaces' water in one place, unless a confluence (ext/55, its disc's weight over .5), a keep fade (drawFlow({keep}): the
//                record's keepAt, or o.keep[name]), a join (o.joins: [[name or record, ...], ...]) or o.allow(A, B, x, z) says so (other: B's name)
//   A surface's water is where it holds the point (S.contains) and its level is over the ground. Exemptions read the whole of W.surfaces,
//   the rules run on o.surfaces (default all). Faded water (keep under .5, inside a confluence) is not checked for slabs, pockets, depth.
// WATER.auditSummary(findings) -> [{rule, surface, n, by (the worst), x, z (there)}], worst first.
(function(){const W=WATER,cl=(x,a,b)=>x<a?a:x>b?b:x;
 // ---- a line as arcs: points [x, z, y], the metres along it, a point at s, the direction there
 const lineOf=L=>{const src=L&&L.pts?L.pts:L,P=src.map(p=>Array.isArray(p)?[p[0],p[1],p[2]]:[p.x,p.z,p.y]),A=[0];
  for(let i=1;i<P.length;i++)A.push(A[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
  const W8=src.map(p=>Array.isArray(p)?null:p.w==null?null:p.w);
  const seg=s=>{let i=0;while(i+2<P.length&&A[i+1]<s)i++;return i;};
  const at=s=>{s=cl(s,0,A[A.length-1]);const i=seg(s),a=P[i],b=P[i+1]||a,L0=(A[i+1]==null?A[i]:A[i+1])-A[i],u=L0>0?(s-A[i])/L0:0,dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;
   const y=a[2]==null?null:a[2]+((b[2]==null?a[2]:b[2])-a[2])*u,w=W8[i]==null?null:W8[i]+((W8[i+1]==null?W8[i]:W8[i+1])-W8[i])*u;
   return{x:a[0]+dx*u,z:a[1]+dz*u,y,w,i,u,dir:[dx/l,dz/l]};};
  return{P,A,len:A[A.length-1],at};};
 const rec=(Q,s,ground)=>{const p=Q.at(s);return{x:p.x,z:p.z,y:ground(p.x,p.z),s,i:p.i,dir:p.dir};};
 W.lipAt=(line,ground,o)=>{o=o||{};const Q=lineOf(line),st=o.step==null?1:o.step,dr=(o.drop==null?1:o.drop)*st,s0=Math.max(0,o.from==null?0:o.from),s1=Math.min(Q.len,o.to==null?Q.len:o.to);
  let best=null,prev=false;
  for(let s=s0;s+st<=s1+1e-9;s+=st){const a=Q.at(s),b=Q.at(s+st),dn=ground(a.x,a.z)-ground(b.x,b.z)>dr;
   if(dn&&!prev){if(o.near==null)return rec(Q,s,ground);if(!best||Math.abs(s-o.near)<Math.abs(best-o.near))best=s;}prev=dn;}
  if(best==null)return null;
  /* the edge inside that step: the last point whose ground is within `edge` (.1 m) of the step's start (a bisection), so a sheer face is
     found at the face, not up to a step back from it */
  const g0=(p=>ground(p.x,p.z))(Q.at(best)),ed=o.edge==null?.1:o.edge;let lo=best,hi=best+st;
  for(let k=0;k<14;k++){const m=(lo+hi)/2,p=Q.at(m);if(ground(p.x,p.z)>g0-ed)lo=m;else hi=m;}
  return rec(Q,lo,ground);};
 W.toeAt=(line,ground,lip,o)=>{o=o||{};const Q=lineOf(line),st=o.step==null?1:o.step,fl=(o.flat==null?.15:o.flat)*st,hold=o.hold==null?3:o.hold,
   s0=typeof lip==='number'?lip:lip.s,s1=Math.min(Q.len,o.to==null?Q.len:o.to);let run=0,start=null;
  for(let s=s0;s+st<=s1+1e-9;s+=st){const a=Q.at(s),b=Q.at(s+st);if(ground(a.x,a.z)-ground(b.x,b.z)<fl){if(start==null)start=s;run+=st;if(run>=hold-1e-9)return rec(Q,start,ground);}else{run=0;start=null;}}
  return null;};
 W.levelFromDownstream=(line,ground,o)=>{o=o||{};const P=lineOf(line).P,ov=o.over==null?.6:o.over,out=P.map(p=>[p[0],p[1],0]);
  for(let i=P.length-1;i>=0;i--){const b=ground(P[i][0],P[i][1])+ov,below=i===P.length-1?(o.end==null?-1e18:o.end):out[i+1][2];out[i][2]=Math.max(b,below);}
  return out;};
 // used by fallsOf({ground}): the run i..j of F's points steeper than its threshold, placed on the ground
 W.fallOnGround=(F,i,j,ground,o)=>{const Q=lineOf(F),sr=o.search==null?20:o.search,a=Q.A[i],b=Q.A[j];
  const lip=W.lipAt(F,ground,{from:a-sr,to:b+sr,near:a,step:o.lipStep,drop:o.lipDrop});if(!lip)return null;
  const toe=W.toeAt(F,ground,lip,{to:b+sr,step:o.lipStep,flat:o.flat,hold:o.hold});
  /* a vertex of the line within `snap` (.25 m) is the lip or the foot: the edge is found a few mm down the face, where the line's level is already falling */
  const sn=o.snap==null?.25:o.snap,snap=s=>{let k=-1,d=sn;for(let m=0;m<Q.A.length;m++){const e=Math.abs(Q.A[m]-s);if(e<=d){d=e;k=m;}}return k<0?s:Q.A[k];};
  const ls=snap(lip.s),fs=toe?snap(toe.s):b;return{lip:Q.at(ls),foot:Q.at(fs),lipS:ls,footS:fs};};

 // fallsOf({ground}): each lip and foot on the ground (fallOnGround) at the line's surface there; without ground, 22's own
 const fallsOf0=W.fallsOf;
 W.fallsOf=(F,o)=>{if(!o||!o.ground)return fallsOf0(F,o);const P=F.pts,out=[],steep=o.steep==null?.35:o.steep,minDrop=o.minDrop==null?3:o.minDrop;let i=0;
  while(i+1<P.length){if(P[i].slope<steep){i++;continue;}let j=i;while(j+1<P.length&&P[j].slope>=steep)j++;
   const a=P[i],b=P[j];if(a.y-b.y>=minDrop){const Gd=W.fallOnGround(F,i,j,o.ground,o);
    if(!Gd)out.push(...fallsOf0({name:F.name,pts:P.slice(i,j+1)},Object.assign({},o,{ground:null})).map(f=>Object.assign(f,{name:(F.name||'flow')+' fall '+out.length})));
    else{const l=Gd.lip,t=Gd.foot,dx=l.dir[0],dz=l.dir[1],h=(l.w==null?a.w:l.w)/2;
     out.push(Object.assign({name:(F.name||'flow')+' fall '+out.length,lip:[[l.x+dz*h,l.z-dx*h,l.y],[l.x-dz*h,l.z+dx*h,l.y]],dir:[dx,dz],speed:Math.max(.5,a.v),drop:l.y-t.y,
      foot:[t.x,t.z,t.y],run:(t.x-l.x)*dx+(t.z-l.z)*dz},o.fit?{fit:true}:{}));}}
   i=j;}return out;};
 // what the audit reads from a drawing, recorded once this fragment is loaded: a ribbon's keep function (S.keepAt; not exported) and the
 // plunge disc's radius (D.plungeR). The drawings themselves are unchanged
 if(W.drawFlow){const df0=W.drawFlow;W.drawFlow=(S,o)=>{const D=df0(S,o);if(o&&o.keep)S.keepAt=o.keep;return D;};}
 if(W.drawFall){const dl0=W.drawFall;W.drawFall=(S,o)=>{const D=dl0(S,o);if(D&&D.plunge)D.plungeR=o&&o.plungeR!=null?o.plungeR:W.plunge(S).r*2.4;return D;};}

 // ---- the audit
 const TOL={rise:.001,under:.05,slab:.3,pocket:1,rim:.05,floor:0,edge:.05,lip:1,lipY:.15,curtain:.5};
 const polyOf=S=>S.poly?S.poly.map(p=>[p[0],p[1]]):S.bounds?[[S.bounds[0],S.bounds[1]],[S.bounds[2],S.bounds[1]],[S.bounds[2],S.bounds[3]],[S.bounds[0],S.bounds[3]]]:null;
 W.audit=o=>{o=o||{};const ground=o.ground;if(typeof ground!=='function')throw new Error('WATER.audit: ground (x, z) -> y is required');
  const GZ=o.graze?Object.assign({tol:.12,w:2},o.graze===true?{}:o.graze):null;
  const tol=Object.assign({},TOL,o.tol||{}),step=o.step==null?4:o.step,ALL=W.surfaces.filter(S=>S.kind!=='shore'),RUN=(o.surfaces||W.surfaces).filter(S=>S.kind!=='shore'),out=[];
  const named=v=>typeof v==='string'?ALL.find(S=>S.name===v):v;
  const JOIN=(o.joins||[]).map(g=>g.map(named).filter(Boolean)),CF=(W.groups||[]).filter(g=>g.kind==='confluence');
  const keepOf=S=>(o.keep&&o.keep[S.name])||S.keepAt||null,keepBlind=S=>!keepOf(S)&&S.ribbonOpt&&S.ribbonOpt.keep;
  const lvl=S=>S.kind==='open'?S.levelAt(0):S.kind==='still'?S.level:null;
  // a box round each surface's water, so a point far off it is not asked (a flow's contains walks its whole line)
  const BOX=new Map();for(const S of ALL){let b=null;
   if(S.kind==='flow'){const mw=Math.max(...S.pts.map(p=>p.w||0));b=[1e18,1e18,-1e18,-1e18];for(const p of S.pts){b[0]=Math.min(b[0],p.x-mw);b[1]=Math.min(b[1],p.z-mw);b[2]=Math.max(b[2],p.x+mw);b[3]=Math.max(b[3],p.z+mw);}}
   else if(S.kind==='still'){const P=polyOf(S);if(P)b=[Math.min(...P.map(p=>p[0])),Math.min(...P.map(p=>p[1])),Math.max(...P.map(p=>p[0])),Math.max(...P.map(p=>p[1]))];}
   else if(S.kind==='open'){b=S.bounds||(S.mask?[S.mask.x0,S.mask.z0,S.mask.x0+S.mask.cell*S.mask.nx,S.mask.z0+S.mask.cellZ*S.mask.nz]:null);}
   BOX.set(S,b);}
  const near=(S,x,z)=>{const b=BOX.get(S);return!b||(x>=b[0]&&z>=b[1]&&x<=b[2]&&z<=b[3]);};
  // S's water at (x, z): it holds the point and its level there is over the ground (g: the ground, if known)
  const wet=(S,x,z,g)=>{if(S.kind==='fall'||!near(S,x,z)||!S.contains(x,z))return false;const y=S.kind==='flow'?S.heightAt(x,z):lvl(S);return y>(g==null?ground(x,z):g);};
  const faded=(S,x,z)=>{const k=keepOf(S);if(k&&k(x,z)<.5)return true;for(const C of CF)if(C.flows.indexOf(S)>=0&&C.fadeAt(x,z)>.5)return true;return false;};
  /* inside a keep fade (under 1) the ribbon cross-fades over the other water by design: allowed, though checked for slabs and depth until under .5 */
  const fading=(S,x,z)=>{const k=keepOf(S);return!!k&&k(x,z)<1-1e-6;};
  const allowed=(A,B,x,z)=>{if(faded(A,x,z)||faded(B,x,z)||fading(A,x,z)||fading(B,x,z)||keepBlind(A)||keepBlind(B))return true;
   for(const C of CF)if(C.flows.indexOf(A)>=0&&C.flows.indexOf(B)>=0&&C.fadeAt(x,z)>0)return true;
   for(const g of JOIN)if(g.indexOf(A)>=0&&g.indexOf(B)>=0)return true;return!!(o.allow&&o.allow(A,B,x,z));};
  // another surface whose water is at (x, z): the first, or the first not allowed beside A there (strict)
  const owner=(A,x,z,g,strict)=>{for(const B of ALL)if(B!==A&&wet(B,x,z,g)&&(!strict||!allowed(A,B,x,z)))return B;return null;};
  const add=(rule,S,x,z,by,other)=>{const f={rule,surface:S.name,id:S.id,x:+x.toFixed(2),z:+z.toFixed(2),by:+(+by).toFixed(3)};if(other)f.other=other.name;out.push(f);};
  const seen=new Set(),pair=(A,B)=>{const k=Math.min(A.id,B.id)+':'+Math.max(A.id,B.id);return k;};
  const overlapAt=(A,x,z,g)=>{if(!wet(A,x,z,g))return;for(const B of ALL){if(B===A||!wet(B,x,z,g)||allowed(A,B,x,z))continue;const k=pair(A,B)+':'+Math.round(x/step)+','+Math.round(z/step);
    if(seen.has(k))continue;seen.add(k);add('overlap',A,x,z,Math.min(A.kind==='flow'?A.heightAt(x,z):lvl(A),B.kind==='flow'?B.heightAt(x,z):lvl(B))-g,B);}};

  for(const S of RUN){
   if(S.kind==='flow'){const P=S.pts,mg=S.ribbonOpt&&S.ribbonOpt.margin!=null?S.ribbonOpt.margin:W.PRESETS.flow?W.PRESETS.flow.margin:1.5;
    for(let i=1;i<P.length;i++)if(P[i].y>P[i-1].y+tol.rise)add('flow-rise',S,P[i].x,P[i].z,P[i].y-P[i-1].y);
    for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],L=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(L/step)),nx=L>0?-(b.z-a.z)/L:0,nz=L>0?(b.x-a.x)/L:0;
     for(let k=0;k<(i+2===P.length?n+1:n);k++){const u=k/n,x=a.x+(b.x-a.x)*u,z=a.z+(b.z-a.z)*u,y=a.y+(b.y-a.y)*u,w=a.w+(b.w-a.w)*u,g=ground(x,z);
      if(faded(S,x,z))continue;
      if(g>y+tol.under)add('flow-under',S,x,z,g-y);
      const sc=o.scan==null?Math.max(w,20):o.scan;
      for(const sd of[-1,1]){const e=w/2+mg,ex=x+nx*sd*e,ez=z+nz*sd*e,ge=ground(ex,ez),B0=owner(S,ex,ez,ge,false);
       /* a slab only where no other water lies at the edge; a pocket unless that water is allowed beside this one (a flood beside a ribbon is the fault) */
       if(!B0&&y-ge>tol.slab)add('flow-slab',S,ex,ez,y-ge);
       if(GZ){let run=0,best=0,bx=ex,bz=ez;for(let d=w/2-2;d<=w/2+mg+1e-6;d+=.5){if(d<0)continue;const px=x+nx*sd*d,pz=z+nz*sd*d,gp=ground(px,pz);
         if(Math.abs(gp-y)<GZ.tol&&!owner(S,px,pz,gp,false)){run+=.5;if(run>best){best=run;bx=px;bz=pz;}}else run=0;}
        if(best>=GZ.w)add('flow-graze',S,bx,bz,best);}
       if(ge<y-tol.under&&!(B0&&allowed(S,B0,ex,ez))){let d=0;while(d<sc){const px=ex+nx*sd*(d+1),pz=ez+nz*sd*(d+1),gp=ground(px,pz);if(gp>=y-tol.under)break;const B=owner(S,px,pz,gp,false);if(B&&allowed(S,B,px,pz))break;d+=1;}
        if(d>=tol.pocket)add('flow-pocket',S,ex,ez,d);}}
      for(const q of[-.45,-.2,0,.2,.45])overlapAt(S,x+nx*q*w,z+nz*q*w,q?ground(x+nx*q*w,z+nz*q*w):g);}}}
   else if(S.kind==='still'){const P=polyOf(S);if(!P)continue;const n=P.length,ar=P.reduce((s,p,i)=>{const q=P[(i+1)%n];return s+p[0]*q[1]-q[0]*p[1];},0),sg=ar>0?1:-1;
    const rs=o.rimStep==null?Math.min(2,Math.max(.25,Math.sqrt(Math.abs(ar)/2)/8)):o.rimStep;
    for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]),m=Math.max(1,Math.ceil(L/rs)),ox=sg*(b[1]-a[1])/(L||1),oz=-sg*(b[0]-a[0])/(L||1);
     for(let k=0;k<m;k++){const u=k/m,x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u,g=ground(x,z);if(S.level-g<=tol.rim)continue;
      if(owner(S,x+ox*.5,z+oz*.5,null,false))continue;add('still-rim',S,x,z,S.level-g);}}
    const b=BOX.get(S),N=o.floorN==null?16:o.floorN;let lo=1e18,lx=0,lz=0;
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=b[0]+(b[2]-b[0])*(i+.5)/N,z=b[1]+(b[3]-b[1])*(j+.5)/N;if(!S.contains(x,z))continue;const g=ground(x,z);if(g<lo){lo=g;lx=x;lz=z;}overlapAt(S,x,z,g);}
    if(lo<1e18&&lo>=S.level-tol.floor)add('still-floor',S,lx,lz,lo-S.level);}
   else if(S.kind==='open'){const b=BOX.get(S);if(!b)continue;const lv=S.levelAt(0),h=o.edgeStep==null?(S.mask?Math.max(1,Math.min(S.mask.cell,S.mask.cellZ)/2):step):o.edgeStep;
    const nx=Math.ceil((b[2]-b[0])/h),nz=Math.ceil((b[3]-b[1])/h);let prow=null;
    const edge=(qx,qz)=>{const g=ground(qx,qz);if(g>=lv-tol.edge)return;if(owner(S,qx,qz,g,false))return;add('open-edge',S,qx,qz,lv-g);};
    for(let j=0;j<=nz;j++){const z=Math.min(b[3],b[1]+j*h),row=new Uint8Array(nx+1);
     for(let i=0;i<=nx;i++){const x=Math.min(b[2],b[0]+i*h);row[i]=S.contains(x,z)?1:0;
      if(i&&row[i]!==row[i-1]){const qx=row[i]?x-h:x;edge(qx,z);}
      if(prow&&row[i]!==prow[i]){const qz=row[i]?z-h:z;edge(x,qz);}}
     /* the bounds' own edges, where the water reaches them, only inside o.extent [x0, z0, x1, z1] (the ground the page has): a box that
        ends at the map's edge is not a cut */
     const X=o.extent,inX=(x,z)=>!!X&&x>X[0]&&z>X[1]&&x<X[2]&&z<X[3],be=(x,z)=>{if(inX(x,z))edge(x,z);};
     if(X){if(j===0||j===nz)for(let i=0;i<=nx;i++)if(row[i])be(Math.min(b[2],b[0]+i*h),j===0?b[1]-h*.5:b[3]+h*.5);
      if(row[0])be(b[0]-h*.5,z);if(row[nx])be(b[2]+h*.5,z);}prow=row;}
    for(const B of ALL)if(B.kind==='open'&&B.id>S.id&&BOX.get(B)){const c=BOX.get(B),x0=Math.max(b[0],c[0]),z0=Math.max(b[1],c[1]),x1=Math.min(b[2],c[2]),z1=Math.min(b[3],c[3]);
     for(let z=z0;z<=z1;z+=h)for(let x=x0;x<=x1;x+=h)if(S.contains(x,z)&&B.contains(x,z)){const g=ground(x,z);if(lv>g&&B.levelAt(0)>g&&!allowed(S,B,x,z))overlapAt(S,x,z,g);}}}
   else if(S.kind==='fall'){const la=S.lip[0],lb=S.lip[S.lip.length-1],mx=(la[0]+lb[0])/2,mz=(la[1]+lb[1])/2,my=(la[2]+lb[2])/2,d=S.dir,sr=o.lipSearch==null?40:o.lipSearch;
    const L=[[mx-d[0]*sr,mz-d[1]*sr],[mx+d[0]*sr,mz+d[1]*sr]],lip=W.lipAt(L,ground,{near:sr});
    if(!lip)add('fall-lip',S,mx,mz,1e9);else if(Math.abs(lip.s-sr)>tol.lip)add('fall-lip',S,mx,mz,Math.abs(lip.s-sr));
    const ux=mx-d[0]*.5,uz=mz-d[1]*.5;for(const F of ALL)if(F.kind==='flow'&&near(F,ux,uz)&&F.contains(ux,uz)){const fy=F.heightAt(ux,uz);if(Math.abs(fy-my)>tol.lipY)add('fall-lip-y',S,mx,mz,Math.abs(fy-my),F);break;}
    const NF=o.curtainN==null?24:o.curtainN;let worst=0,wx=0,wz=0;
    for(let k=1;k<=NF;k++)for(const u of[.25,.5,.75]){const p=S.curtainAt(u,k/NF),g=ground(p[0],p[2]);if(g-p[1]>worst){worst=g-p[1];wx=p[0];wz=p[2];}}
    if(worst>tol.curtain)add('fall-curtain',S,wx,wz,worst);
    if(S.plunge!==false&&W.plunge){const Pp=W.plunge(S),D=(W.drawn||[]).find(D=>D.S===S),r=o.plungeR&&o.plungeR[S.name]!=null?o.plungeR[S.name]:D&&D.plungeR!=null?D.plungeR:D&&!D.plunge?null:Pp.r*2.4;
     if(r!=null)for(let k=-1;k<8;k++){const a=k*Math.PI/4,x=Pp.x+(k<0?0:Math.cos(a)*.75*r),z=Pp.z+(k<0?0:Math.sin(a)*.75*r);if(!owner(S,x,z,null,false))add('fall-plunge',S,x,z,k<0?0:.75*r);}}}}
  return out;};
 W.auditSummary=F=>{const M=new Map();for(const f of F){const k=f.rule+'|'+f.surface;let m=M.get(k);if(!m){m={rule:f.rule,surface:f.surface,n:0,by:-1e18,x:0,z:0};M.set(k,m);}m.n++;if(f.by>m.by){m.by=f.by;m.x=f.x;m.z=f.z;}}
  return[...M.values()].sort((a,b)=>b.by-a.by);};
})();
