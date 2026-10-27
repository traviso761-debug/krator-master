// ================================================================= WATER - data: flow, falls and still water (Phases 3 and 4 of WATER.md)
// [G data]: no THREE, no DOM. Adds to WATER (20-core-water.js; load after it). The meshes are built here, as arrays, so a
// port builds the very same vertices (godot/krator/water.gd); 51-core-water-kinds.js draws them.
//
// FLOW (a river, a stream, a canal: WATER.flow, a line [[x,z,y],...] or KRELIEF.river's [{x,z,y,slope}]):
//   WATER.ribbon(S, {step, across, margin})  the water as a ribbon along the line: a row of `across`+1 vertices every
//        `step` m (each polyline vertex a row, so the surface falls exactly as the line does: the SLOPING SURFACE), as wide
//        as the channel plus `margin` m a side (tucked under the banks). Per vertex: the position, the current (vx, vz),
//        the line's slope, the distance to the bank (m; negative under it) and the distance downstream (m).
//        A row's direction at a polyline vertex is the bisector of its two segments, so the ribbon does not tear at a bend.
//   WATER.flowNormal(x, z, vx, vz, slope, t)  the shading normal: ripples ADVECTED along the current (the flow-map trick:
//        two copies of a fixed ripple pattern, each carried downstream for half a phase and cross-faded, so the pattern moves
//        with the water and never stretches), rougher where the bed is steep (rapids). Whole phases per wave period.
//   WATER.flowFoam(slope, bank)  white water where the bed steepens and along the banks
// FALL (a waterfall, a cataract: WATER.fall): the curtain ARCS (20's curtainAt: a parabola from the lip speed)
//   WATER.curtain(S, {rows, cols})  the curtain's mesh: rows at equal times of flight (so equal steps of the water's own
//        age), cols across the lip; per vertex the position, its normal (out of the curtain's arc), u (across) and f (fall)
//   WATER.fallStreak(u, f, t, S)  the streaks: a pattern fixed to the water as it falls (each parcel keeps its streak from
//        the lip down), whole cycles per period; WATER.fallFoam(f, streak) the aeration, growing toward the foot
//   WATER.plunge(S)  the plunge point and the pool's radius; WATER.plungeAt(S, x, z, t) -> [foam, ring height]: rings run
//        out from the foot (whole cycles per period), white water decaying with distance
//   WATER.fallsOf(F, {steep, minDrop})  the falls on a flow line where it drops faster than `steep` (a slope break): each a
//        fall record's options (lip across the width, the direction, the speed, the drop), for WATER.fall
// STILL (pools, troughs, fountains: WATER.still): WATER.stillMesh(S) a polygon's triangles (ear clipping) or a box's two;
//   S.normalAt(x, z, t) a faint ripple (whole cycles per period) plus, with `fountain` [x, z], rings from the jet
(function(){const W=WATER,TAU=Math.PI*2,G=9.81,ss=W.ss,fr=W.fr,cl=(x,a,b)=>x<a?a:x>b?b:x;
 Object.assign(W.PRESETS,{
  // a ribbon: m between rows, vertices across - 1, m beyond the width a side; the ripple pattern [slope, wavelength m,
  // direction deg from the current]; the flow-map phase (whole cycles per period); rapids from the line's slope [a, b];
  // edge foam over this many m from the bank; the foam's share for each
  flow:{step:6,across:6,margin:1.5,ripple:[[.07,3.1,15],[.05,1.9,-55],[.035,1.15,80],[.02,.62,-20]],phases:150,
   rapids:[.015,.12],rapidGain:2.4,edge:1.6,foam:[.6,.45]},
  // a curtain: rows down, cols across; the streaks (cycles per period of the pattern, across-streaks per metre of lip);
  // how much wider it is at the foot (m a side per 100 m of drop); the plunge pool (radius as a share of the drop,
  // at least the lip's width; ring wavelength m, cycles per period)
  fall:{rows:28,cols:6,streak:{cycles:300,across:.55},spread:6,plunge:{share:.05,ring:3.5,cycles:220}},
  // still water: a faint ripple [slope, wavelength m, direction deg, cycles per period]; a fountain's rings
  still:{ripple:[[.012,1.7,25,170],[.009,1.1,-60,230],[.006,.7,100,310]],fountain:{ring:.6,cycles:420,r:3}}});
 const PF=()=>W.PRESETS.flow,PL=()=>W.PRESETS.fall,PS=()=>W.PRESETS.still;

 // ---- the ribbon
 W.ribbon=(S,o)=>{o=o||{};const Q=PF(),step=o.step==null?Q.step:o.step,NA=o.across==null?Q.across:o.across,mg=o.margin==null?Q.margin:o.margin,P=S.pts,n=P.length;
  const seg=[];let s=0;for(let i=0;i+1<n;i++){const ex=P[i+1].x-P[i].x,ez=P[i+1].z-P[i].z,L=Math.hypot(ex,ez)||1e-9;seg.push({ex:ex/L,ez:ez/L,L,s0:s});s+=L;}
  // the rows: every polyline vertex, and evenly between them at most `step` apart
  const rows=[];for(let i=0;i+1<n;i++){const k=Math.max(1,Math.ceil(seg[i].L/step));for(let j=0;j<k;j++)rows.push([i,j/k]);}rows.push([n-2,1]);
  const pos=[],flow=[],slope=[],bank=[],along=[],idx=[];
  for(const [i,u] of rows){const a=P[i],b=P[i+1],g=seg[i],x=a.x+(b.x-a.x)*u,z=a.z+(b.z-a.z)*u,y=a.y+(b.y-a.y)*u,w=a.w+(b.w-a.w)*u,v=a.v+(b.v-a.v)*u;
   // the row's direction: the segment's, or at a polyline vertex the bisector with its neighbour (the cross-section
   // stretched by 1/cos(half the turn) so the ribbon keeps its width round the bend)
   let dx=g.ex,dz=g.ez,st=1;const jn=u===0&&i>0?seg[i-1]:u===1&&i+2<n?seg[i+1]:null;
   if(jn){const bx=g.ex+jn.ex,bz=g.ez+jn.ez,bl=Math.hypot(bx,bz);if(bl>1e-6){dx=bx/bl;dz=bz/bl;st=1/Math.max(.35,dx*g.ex+dz*g.ez);}}
   const hw=w/2+mg;for(let k=0;k<=NA;k++){const q=(k/NA*2-1)*hw*st;pos.push(x-dz*q,y,z+dx*q);flow.push(dx*v,dz*v);slope.push(a.slope+(b.slope-a.slope)*u);
    bank.push(w/2-Math.abs(k/NA*2-1)*hw);along.push(g.s0+g.L*u);}}
  // wound to face up (three.js: counter-clockwise seen from above)
  for(let r=0;r+1<rows.length;r++)for(let k=0;k<NA;k++){const p=r*(NA+1)+k,q=p+NA+1;idx.push(p,q+1,q,p,p+1,q+1);}
  return{count:rows.length*(NA+1),rows:rows.length,across:NA,pos,flow,slope,bank,along,idx};};

 // ---- the advected ripples (the flow shader's wtrFlowN; this is its twin): the slope of the pattern at q
 // (each ripple a sine of slope r[0] across wavelength r[1], turned r[2] degrees from the current: g += slope cos(k d.q) d)
 const ripGrad=(qx,qz,cx,cz,R,g)=>{for(const r of R){const a=r[2]*Math.PI/180,dx=cx*Math.cos(a)-cz*Math.sin(a),dz=cz*Math.cos(a)+cx*Math.sin(a),c=Math.cos((qx*dx+qz*dz)*(TAU/r[1]))*r[0];g[0]+=c*dx;g[1]+=c*dz;}};
 // the two phases: each copy of the pattern carried downstream for T = period/phases s, faded in and out
 W.flowPhase=t=>{const n=PF().phases,ph=fr(t*n/W.period());return[ph,fr(ph+.5),W.period()/n];};
 // rap [lo, hi]: the flow's own white-water band on the slope (S.rapids; default PRESETS.flow.rapids)
 W.flowNormal=(x,z,vx,vz,slope,t,rap)=>{const Q=PF(),R=Q.ripple,[p0,p1,T]=W.flowPhase(t),v=Math.hypot(vx,vz),cx=v>1e-6?vx/v:1,cz=v>1e-6?vz/v:0,
   g0=[0,0],g1=[0,0];ripGrad(x-vx*p0*T,z-vz*p0*T,cx,cz,R,g0);ripGrad(x-vx*p1*T+.37*R[0][1],z-vz*p1*T+.61*R[0][1],cx,cz,R,g1);
  const RP=rap||Q.rapids,w0=1-Math.abs(2*p0-1),k=1+Q.rapidGain*ss(RP[0],RP[1],slope),sx=(g0[0]*w0+g1[0]*(1-w0))*k,sz=(g0[1]*w0+g1[1]*(1-w0))*k,l=Math.hypot(sx,1,sz);
  return[-sx/l,1/l,-sz/l];};
 W.flowFoam=(slope,bank,rap)=>{const Q=PF(),RP=rap||Q.rapids;return Math.max(Q.foam[0]*ss(RP[0],RP[1],slope),Q.foam[1]*(1-ss(0,Q.edge,bank)));};
 // where a flow throws spray (drawFlow's spray option): along the line wherever the slope is over `min` (default: the middle of the flow's rapids band),
 // at least `every` m (40) apart, at most `max` (24) of them, `lift` m over the surface (1): [[x, y, z], ...], in order, no random draw
 W.sprayPoints=(F,o)=>{o=o||{};const RP=F.rapids||PF().rapids,min=o.min==null?(RP[0]+RP[1])/2:o.min,every=o.every==null?40:o.every,max=o.max==null?24:o.max,lift=o.lift==null?1:o.lift,P=F.pts,out=[];let s=0,last=-1e9;
  for(let i=0;i<P.length&&out.length<max;i++){if(i>0)s+=Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z);if(P[i].slope>=min&&s-last>=every){out.push([P[i].x,P[i].y+lift,P[i].z]);last=s;}}return out;};

 // ---- falls
 // the rows a curtain gets: o.rows, else PRESETS.fall.rows (28), or with o.rowStep (m of drop per row) at least that many (a 70 m cataract
 // at 28 rows is 2.5 m a row; rowStep: 1 makes it 70)
 W.curtainRows=(S,o)=>{o=o||{};const Q=PL();return o.rows!=null?o.rows:o.rowStep>0?Math.max(Q.rows,Math.ceil(S.drop/o.rowStep)):Q.rows;};
 // margin (2026-10-26): m a side the curtain runs past the lip, so it is as wide as the river's ribbon there (drawFlow's margin) and its sides tuck under
 // the banks; u then runs from -margin/lipW to 1 + margin/lipW and the drawing fades the sides by the metres from the lip's edge (W.curtainSide), as
 // the ribbon fades under its banks. Without it the curtain is the lip's width, as before (u 0..1)
 W.curtain=(S,o)=>{o=o||{};const Q=PL(),R=W.curtainRows(S,o),C=o.cols==null?Q.cols:o.cols,pos=[],nrm=[],uv=[],idx=[],mu=o.margin>0&&S.lipW>0?o.margin/S.lipW:0;
  for(let r=0;r<=R;r++){const f=r/R;for(let c=0;c<=C;c++){const u=mu?-mu+(1+2*mu)*c/C:c/C,p=S.curtainAt(u,f),n=S.curtainNormal(f);pos.push(p[0],p[1],p[2]);nrm.push(n[0],n[1],n[2]);uv.push(u,f);}}
  for(let r=0;r<R;r++)for(let c=0;c<C;c++){const a=r*(C+1)+c,b=a+C+1;idx.push(a,b,b+1,a,b+1,a+1);}
  return{count:(R+1)*(C+1),rows:R,cols:C,pos,nrm,uv,idx};};
 // the curtain's side fade with a margin (the shader's wtrSide): metres in from the lip's nearer edge (u's distance to 0 or 1 times the lip width; negative
 // past it), faded from -margin (0, under the bank) to `edge` m inside (1). edge: drawFall's option (default 8% of the lip, the old fade's width)
 W.curtainSide=(u,lipW,margin,edge)=>ss(-margin,edge,Math.min(u,1-u)*lipW);
 // SPRAY scaled to the drop (2026-10-26; drawFall and drawFalls with spray: 'drop' or {drop: true, ...}): emitters of core/atmos's 'spray' across the
 // curtain's foot every `every` m (6) and in layers up a mist column min(drop * `column` (.4), `top` (30)) m tall, one layer per `layer` m (6), each
 // layer pushed downstream by a share of the plunge's radius and staggered half a step; at most `max` (24) a fall (layers go first, then the
 // across count). A fall under 3 m gets one emitter. In order, no random draw: [[x, y, z], ...]. Without the option the three fixed emitters stay.
 W.fallSpray=(S,o)=>{o=o||{};const P=W.plunge(S),y0=(o.plungeY==null?P.y+.06:o.plungeY)+1,max=o.max==null?24:o.max,every=o.every==null?6:o.every,lay=o.layer==null?6:o.layer;
  if(S.drop<3)return[[P.x,y0,P.z]];
  const wFoot=S.lipW+2*S.spread,H=Math.min(S.drop*(o.column==null?.4:o.column),o.top==null?30:o.top);let k=cl(Math.ceil(wFoot/every),1,8),L=cl(Math.round(H/lay),1,5);
  while(k*L>max&&L>1)L--;while(k*L>max&&k>1)k--;
  const out=[];for(let j=0;j<L;j++){const y=y0+(L>1?H*j/L:0),push=P.r*.3*j/Math.max(1,L-1),st=j%2?.5:0;
   for(let i=0;i<k;i++){const u=Math.min(1,(i+.5+st)/k),p=S.curtainAt(u,1);out.push([p[0]+S.dir[0]*push,y,p[2]+S.dir[1]*push]);}}
  return out;};
 // value noise, the shaders' wtrHash and wtrNoise (51-core-water-kinds.js) to the operation; wtrNoiseP repeats every `per`
 // cells in y, so a pattern on a wrapped phase has no seam
 const fr3=v=>v.map(fr);
 W.hash2=(x,y)=>{let q=fr3([x*.1031,y*.1031,x*.1031]);const d=q[0]*(q[1]+33.33)+q[1]*(q[2]+33.33)+q[2]*(q[0]+33.33);q=q.map(v=>v+d);return fr((q[0]+q[1])*q[2]);};
 W.noiseP=(x,y,per)=>{const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,a=u*u*(3-2*u),b=v*v*(3-2*v),j0=j-per*Math.floor(j/per),j1=(j+1)-per*Math.floor((j+1)/per);
  const h00=W.hash2(i,j0),h10=W.hash2(i+1,j0),h01=W.hash2(i,j1),h11=W.hash2(i+1,j1);return(h00*(1-a)+h10*a)*(1-b)+(h01*(1-a)+h11*a)*b;};
 // the streak value 0..1 at (u, f): the pattern a parcel of water carries from the lip, so it falls with the water: noise
 // stretched down the fall (fine across the lip, coarse along the parcel's phase, which wraps whole)
 W.fallStreak=(u,f,t,S)=>{const Q=PL().streak,n=Q.cycles,per=W.period(),th=fr(t*n/per-f*S.tFall*n/per),lw=S.lipW*Q.across;
  return .55*W.noiseP(u*lw*2.2,th*6,6)+.3*W.noiseP(u*lw*5.1+3.7,th*14,14)+.15*W.noiseP(u*lw*11+9.1,th*30,30);};
 W.fallFoam=(f,streak)=>cl(.25+.6*ss(0,.4,f)+.7*(streak-.5),0,1);
 W.plunge=S=>{const Q=PL().plunge,p=S.plunge||S.curtainAt(.5,1);return{x:p[0],y:p[1],z:p[2],r:Math.max(S.lipW,S.drop*Q.share)};};
 // the churn: rings running out, broken by a noise that boils (its phase wraps whole: 12 cells of noise per ring cycle)
 W.plungeAt=(S,x,z,t)=>{const Q=PL().plunge,P=W.plunge(S),r=Math.hypot(x-P.x,z-P.z),ph=fr(t*Q.cycles/W.period()),a=TAU*(fr(r/Q.ring)-ph),e=Math.exp(-r/P.r);
  const nz=W.noiseP((x-P.x)*.45+(z-P.z)*.21,ph*12+r*.3,12);return[e*cl(.35+.25*Math.sin(a)+.8*(nz-.35),0,1),.08*e*Math.sin(a)];};
 // the slope breaks of a flow line: runs steeper than `steep` dropping at least `minDrop` m, as WATER.fall options
 W.fallsOf=(F,o)=>{o=o||{};const steep=o.steep==null?.35:o.steep,minDrop=o.minDrop==null?3:o.minDrop,P=F.pts,out=[];let i=0;
  while(i+1<P.length){if(P[i].slope<steep){i++;continue;}let j=i;while(j+1<P.length&&P[j].slope>=steep)j++;
   const a=P[i],b=P[j],drop=a.y-b.y;if(drop>=minDrop){const ex=P[i+1].x-a.x,ez=P[i+1].z-a.z,L=Math.hypot(ex,ez)||1,dx=ex/L,dz=ez/L,h=a.w/2;
    out.push(Object.assign({name:(F.name||'flow')+' fall '+out.length,lip:[[a.x+dz*h,a.z-dx*h,a.y],[a.x-dz*h,a.z+dx*h,a.y]],dir:[dx,dz],speed:Math.max(.5,a.v),drop,
     // the chute's foot [x, z, y] (the line's point where the run ends) and the run from the lip: W.fall takes both; {fit: true} lands the curtain there
     foot:[b.x,b.z,b.y],run:(b.x-a.x)*dx+(b.z-a.z)*dz},o.fit?{fit:true}:{}));}
   i=j;}return out;};

 // ---- RAIN RINGS (2026-10-26, WEATHER-RESEARCH item 2): the twin of 51's WATER.rainRippleGLSL. Per octave (cells of oct[i] m) every cell has a ring
 // centre, a phase and a threshold from the integer-lattice hash (W.hash2, the shaders' wtrHash: no Math.sin); a ring runs out from its centre to
 // R cells over `sec` s (whole cycles per wave period), a wave packet F rings to a cell, sharpness K, fading as it grows; a cell rings only where
 // the rain is over its threshold (more rain, more rings). The 3 x 3 cells round the point are summed. -> the slope [gx, gz] of the ripple's
 // height (0 without rain), amp times smoothstep(0, .15, rain). NOT in PRESETS (the export carries PRESETS; nothing here moves a page that does not ask)
 W.RIPPLE={oct:[.6,.37],sec:.9,amp:.45,R:.9,F:2.5,K:60};
 W.rippleCycles=()=>Math.max(1,Math.round(W.period()/W.RIPPLE.sec));
 W.rainRipple=(x,z,t,rain)=>{const Q=W.RIPPLE,c=W.rippleCycles()/W.period(),g=[0,0];if(rain<=0)return g;
  Q.oct.forEach((sz,o)=>{const qx=x*(1/sz),qz=z*(1/sz),ix=Math.floor(qx),iz=Math.floor(qz),ph0=t*c+o*.37;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const cx=ix+dx,cz=iz+dy,h1=W.hash2(cx,cz),h2=W.hash2(cx+17.3,cz+4.1),h3=W.hash2(cx+5.7,cz+31.9),on=rain<fr(h1*7.13+h2*3.71)?0:1;
    const ex=qx-(cx+(.25+.5*h1)),ez=qz-(cz+(.25+.5*h2)),r=Math.hypot(ex,ez),ph=fr(ph0+h3),u=r-ph*Q.R,sv=Math.sin(TAU*Q.F*u)*Math.exp(-u*u*Q.K)*(1-ph)*(1-ph)*on;
    if(r>1e-4){g[0]+=ex*(sv/r);g[1]+=ez*(sv/r);}}});
  const k=Q.amp*ss(0,.15,rain);return[g[0]*k,g[1]*k];};
 // a shading normal [x, y, z] with the ripple's slope added (the shaders' wtrRainN)
 W.rainNormal=(n,g)=>{const a=n[0]/n[1]-g[0],b=n[2]/n[1]-g[1],l=Math.hypot(a,1,b);return[a/l,1/l,b/l];};

 // ---- still water
 W.stillMesh=S=>{if(!S.poly){const b=S.bounds;return{pos:[b[0],S.level,b[1],b[2],S.level,b[1],b[2],S.level,b[3],b[0],S.level,b[3]],idx:[0,3,2,0,2,1]};}
  // ear clipping, counter-clockwise from above (y up, z south: the polygon's signed area decides the winding)
  const P=S.poly.map(p=>[p[0],p[1]]),n=P.length,area=P.reduce((a,p,i)=>{const q=P[(i+1)%n];return a+p[0]*q[1]-q[0]*p[1];},0),ord=[...Array(n).keys()];if(area<0)ord.reverse();
  const cr=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),idx=[],L=ord.slice();let guard=0;
  while(L.length>3&&guard++<n*n){let cut=false;for(let i=0;i<L.length;i++){const a=P[L[(i+L.length-1)%L.length]],b=P[L[i]],c=P[L[(i+1)%L.length]];if(cr(a,b,c)<=0)continue;
    let inside=false;for(const k of L){const p=P[k];if(p===a||p===b||p===c)continue;if(cr(a,b,p)>=0&&cr(b,c,p)>=0&&cr(c,a,p)>=0){inside=true;break;}}
    if(inside)continue;idx.push(L[(i+L.length-1)%L.length],L[(i+1)%L.length],L[i]);L.splice(i,1);cut=true;break;}if(!cut)break;}
  if(L.length===3)idx.push(L[0],L[2],L[1]);
  const pos=[];for(const p of P)pos.push(p[0],S.level,p[1]);return{pos,idx};};
 // the still surface's shading normal: the ripples, and a fountain's rings
 W.stillNormal=(S,x,z,t)=>{const Q=PS(),per=W.period();let sx=0,sz=0;
  for(const r of Q.ripple){const a=r[2]*Math.PI/180,k=TAU/r[1],c=Math.cos(TAU*(fr(x*Math.cos(a)/r[1])+fr(z*Math.sin(a)/r[1])-fr(t*r[3]/per)))*r[0];sx+=c*Math.cos(a);sz+=c*Math.sin(a);void k;}
  if(S.fountain){const F=Q.fountain,dx=x-S.fountain[0],dz=z-S.fountain[1],r=Math.hypot(dx,dz);if(r>1e-6){const c=Math.cos(TAU*(fr(r/F.ring)-fr(t*F.cycles/per)))*.06*Math.exp(-r/F.r);sx+=c*dx/r;sz+=c*dz/r;}}
  const l=Math.hypot(sx,1,sz);return[-sx/l,1/l,-sz/l];};
// CONFLUENCE (2026-10-26, biomes/swhighlands; the owner: a tributary must not cross the river it joins, nor stop short of it at a
// bank): WATER.join(trib, main, o) makes a tributary's line meet a main channel as one water. trib and main are lines run downstream,
// [[x,z,y],...] (or KRELIEF.river's [{x,z,y}]); o.w the main's half width (m, or (i) => m at its vertex i: 8); o.tuck (.3) how far in
// toward the main's centreline the tributary ends, as a fraction of that half width; o.lift (.03 m) how far over the main's surface
// its end lies. The tributary is cut where it first comes within tuck * w of the main's centreline (the point on that line found
// along its own segment, so it ends on its own heading), and every level is raised to at least the main's surface there + lift (a
// max with a constant: it still never climbs). Returns {pts, at: [x, z] (the main's point at the join), k (its segment), y (its
// level there), cut (the tributary's points dropped), order: 'after'}: DRAW THE TRIBUTARY AFTER THE MAIN (a higher renderOrder):
// across the mouth its surface lies over the main's bank foam, so the two read as one water. The ground under both is the host's
// (carve every channel near a point and keep the lowest: no bank of one stands in the other's water). Plain data; nothing else moves.
W.join=(trib,main,o)=>{o=o||{};const tuck=o.tuck==null?.3:o.tuck,lift=o.lift==null?.03:o.lift,wf=typeof o.w==='function'?o.w:(()=>o.w==null?8:o.w);
 const P=a=>Array.isArray(a)?[a[0],a[1],a[2]]:[a.x,a.z,a.y];const T=trib.map(P),M=main.map(P);
 if(T.length<2||M.length<2)throw new Error('WATER.join: each line needs two points');
 const near=(x,z)=>{let bd=1e18,bk=0,bt=0;for(let k=0;k<M.length-1;k++){const a=M[k],b=M[k+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=cl(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),
   px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bk=k;bt=t;}}const a=M[bk],b=M[bk+1];
  return{d:Math.sqrt(bd),k:bk,x:a[0]+(b[0]-a[0])*bt,z:a[1]+(b[1]-a[1])*bt,y:a[2]+(b[2]-a[2])*bt,w:wf(bk)+(wf(bk+1)-wf(bk))*bt};};
 let cut=T.length,hit=null,prev=near(T[0][0],T[0][1]);
 for(let i=1;i<T.length;i++){const q=near(T[i][0],T[i][1]),lim=tuck*q.w;if(q.d<lim){cut=i;hit=q;break;}prev=q;}
 let out;const found=!!hit;
 if(found){const a=T[cut-1],b=T[cut],da=prev.d-tuck*prev.w,db=hit.d-tuck*hit.w,f=da<=0?0:cl(da/(da-db),0,1);
  const e=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];out=T.slice(0,cut).concat([e]);hit=near(e[0],e[1]);}
 else{out=T.slice();hit=near(out[out.length-1][0],out[out.length-1][1]);}
 const y0=hit.y+lift;out=out.map(p=>[p[0],p[1],Math.max(p[2],y0)]);
 return{pts:out,at:[hit.x,hit.z],k:hit.k,y:hit.y,cut:found?T.length-cut:0,order:'after'};};
})();
