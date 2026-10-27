// ================================================================= BIOME CORE — bamboo parts (BIO.bamboo)
// One copy of the giant-bamboo parts (biomes/hyperjungle/PLAN-LANDS.md section 11, H5; step J3): the howl bamboo, the
// Cut's hyperbamboo and, later, nwlowlands' sky bamboo are drawn from it. The culm is lifted from the Cut's G.culm
// (biomes/cut/src/50-biome-cut-species.js): with the Cut's options it writes the Cut's vertices (test-bamboo.js). Opt-in: a
// kit lists '33b-core-bamboo.js' after 30-core-foliage.js in CORE_BIOME (core/rand must be on the page) and calls it;
// nothing else changes.
//
// Two halves, as BIO.fung (33-core-fungoid.js).
//   GEOMETRY (three.js, [draw]): BIO.bamboo.<part>(o) -> a unit BufferGeometry for BIO.def: origin at the foot, +y up,
//   position, normal, uv and a vertex colour that is a SHADE (1 = the instance's own colour). BIO.put scales it (a culm by
//   [diameter, height, diameter]). The same o gives the same vertices on every machine: a variant's internode lengths and
//   holes are KRAND.hash of (o.seed, index, salt), never a draw.
//   LAYOUT (plain records, [G data]): grove, groveCells, sprays, fanTips, flowering -> records keyed by index, each drawn
//   from KRAND.hash(seed, i, k, salt) and never from how many draws came before it. A record carries p [x,y,z], q
//   [x,y,z,w] and s [sx,sy,sz] for BIO.bamboo.put(name, recs, col, at), and its own fields for the kit.
//
//   culm(o)     a culm 1 high, radius .5 (diameter 1): o.n internodes (24), o.seg sides (10), o.fs the rows in each
//               internode as fractions from its node ([0,.02,.08,.86]); the node: a swelling o.swell (.05) of width
//               o.swellW (.0016, a gaussian in the internode fraction), a dark ring nodeK (.42 with four rows or more,
//               else .85) below o.nodeF (.005) and the white waxy band waxK (1.32) up to o.waxF (.03). The tip tapers by
//               o.tip (.8) from o.tip0 (.8) over o.tipL (.2) with power o.tipP (1.6); o.cut a length with square ends.
//               o.jit (0) varies each internode's length by up to +-jit (seeded by o.seed: a culm outside the Cut's warp)
//               and o.grade (0) lengthens the middle internodes over the foot and tip ones; both 0: every internode
//               the same, the nodes on the grove's levels. uv: u o.uRep (.5) of the sheet round, v o.vRep (.5) a node.
//               Openings: o.bite {y, r, a (0), k (2.2)} a bite (y in internodes, r in culm radii, a its azimuth, k its
//               vertical stretch) opening the culm to its chambers: the inner wall (innerK .55) and the septa (.8);
//               o.holes [{y, r, a, k}] or a set for B.holeSet: holes as dark plugs (holeK .22) set in to o.holeIn (.82
//               of the radius), each with a pale stain running down stainL (1.2) internodes (stainK 1.25; coarse: one
//               vertex a side and a row, the library set bark.bamboo.bored carries the fine stain).
//               o.taper (0) narrows the culm toward the top (radius x (1 - taper y): a slender cane). o.bend (0) bows it
//               out along +x by bend times its height at the tip, o.droop (0) lets the top down past o.droopAt (.6) (a
//               clumping cane bowed over in a plume: k-guilin's phoenix-tail bamboo, bend .25-.5, droop 1.1, taper .45);
//               o.aspect (1) the height over the diameter the instance will be scaled to, so the rings stay round and
//               square to the cane once BIO.put scales it. axis(o, t) is the cane's axis point at t, in the unit space.
//               bend and droop 0: the straight culm, unchanged.
//               o.sheaths (0): the lowest nodes keep their culm sheaths: a split sleeve up o.sheathL (.7) of the
//               internode, flaring to o.sheathF (1.12), shaded sheathK (.78) outside and .6 inside.
//   tiers(o)    {near, mid, far}: near culm(o); mid one side fewer, rows [0,.5], no openings or sheaths; far two sides
//               fewer, rows [0]. BIO.bamboo.LOD {near:350, mid:1200}: the Cut's ranges for BIO.range / BIO.minRange.
//   holeSet(o)  -> [{y, r, a, k}]: o.rows (3) lines of holes up the culm, each at its own azimuth, from internode o.from
//               (4) to o.to (n-3), every o.every (2) internodes, o.r [.18,.3], o.k (.4: round when an internode is
//               about 2.5 diameters), o.miss (.25) the share left unbored; seeded by o.seed.
//   spray(o)    a leaf spray hanging from its twig: o.n crossed cards (2), the top at y 0 out along +x by o.out (.35),
//               the foot at -1 out by o.outB (.55); uv one cell o.cell of an o.cols x o.rows sheet (3 x 3, unflipped:
//               v runs down the sheet, inset o.pad .004); normals [0, o.nY (.6), 0] as the Cut's (the leaf material
//               reads them).
//   fan(o)      a node's branch complement: o.n twigs (5) in an arc o.arc (1.2 rad) about +x, rising o.rise (.35 rad),
//               the tips drooping o.droop (.25), the middle longest (1; the outer o.short .35 shorter), radius o.r
//               (.012), o.side (3) sides, shaded .8 at the node to 1 at the tip. fanTips(o) gives the same tips as data.
//   shoot(o)    a shoot: o.n overlapping sheaths (4) narrowing to a point, radius .5, height 1, o.seg (7).
//
//   grove(o)    one grove: {seed, x, y0, z, r, L, cohort, flower, culms, shoots}. o.seed (the grove's: KRAND.hash(world,
//               cell...)), o.at [x,y,z], o.r (32) or o.rr [22,42], o.L (one internode length for the whole grove) or o.Lr
//               [2.4,3.2]; o.clumps (round(lerp(10,26,u) r/32)), o.per [3,7] culms a clump, o.spread (3), o.tiers
//               [[.55,28],[.25,24],[0,20]] (the internode count by the distance in, k = 1 - d/r), o.dia [.6,1], o.old
//               (.2), o.holed (0) and o.bitten (0) the shares of the old, o.lean (.03 rad), o.variants (3) defs per
//               count, o.align (true: each base sunk o.sink .05 below the grove's levels y0 + j L, so every node lines
//               up), o.ground(x,z) -> y, o.clear(x,z,r) -> bool, o.weight(x,z) -> 0..1 (a clump is kept where it is
//               over .15), o.shoot (.6) a clump's chance of a shoot, o.cohort/o.cycle for the flowering. A culm:
//               {i, c, p, q, s, x, y, z, d, n, L, h, yaw, lean, old, holed, bitten, v, u}: i = c*64 + its place in the
//               clump (stable when clear() drops another clump), v the variant def to draw (0..variants-1).
//   groveCells(o) -> [{i, j, x, z, seed, w}]: one candidate a o.cell (180) cell over o.R (or o.box [x0,z0,x1,z1]),
//               kept where KRAND's draw is under o.weight(x,z) * o.keep (.85); seed = KRAND.hash(o.world, i, j, salt).
//   clump(o)    -> [{i, p, q, s, az, h, v, bend, u}]: a clumping (sympodial) bamboo's canes from one root mass at o.at,
//               o.n [6,9] canes within o.r (.5), each o.H (10) x o.hs [.6,1.05] high and o.d (.1) across, bowed out
//               along its own azimuth az (the line out from the clump's middle, +- o.fan .4 rad: q turns the culm's +x
//               to it), v the bend variant of o.bends [.25,.375,.5] to def (a culm({bend: bends[v], ...}) each).
//   sprays(o)   -> [{p, q, s, k, tier, v, range, u}] for one culm: o.culm (a grove's record), o.nodes (its node heights
//               in metres; else k L), o.from (.42) up, alternate sides by o.step (2.4 rad; PI ranked), o.size
//               [3.2,4.4], o.lod [[every, scale, r0, r1]] ([[1,1,0,400],[2,1.3,400,1200],[4,1.65,1200,1e9]]), o.cards (3).
//   flowering(flower, year) -> {state, t, height, leaf, bloom, dead}: gregarious flowering. Every grove of a cohort
//               (one seed and cohort: a species' stand across a valley) flowers in the same year once a cycle (o.cycle
//               48 years), then stands dead (o.deadY 3), then regrows from seed (o.regrowY 8: the height and leaf
//               rising from 0). 'green', 'flowering', 'dead', 'regrowth'. The grove's flower record holds the phase.
(function(){
const {TAU,clamp,lerp}=BIO.fn;
if(typeof KRAND==='undefined'){BIO.bamboo=null;return;}
const nz=(x,d)=>x==null?d:x;
const H=(seed,i,k,salt)=>KRAND.unit(KRAND.hash(seed>>>0,i|0,k|0,salt|0));
const rng2=(r,u)=>Array.isArray(r)?lerp(r[0],r[1],u):r;
const B=BIO.bamboo={LOD:{near:350,mid:1200}};
function make(pos,nor,uv,col){return BIO.geo._make(pos,nor,uv,col);}

// ---------------------------------------------------------------- the nodes
// the node heights of a culm 1 high, [0 .. 1], n+1 of them: equal unless o.jit or o.grade
B.nodeY=function(o){o=o||{};const n=Math.max(1,nz(o.n,24)),jit=nz(o.jit,0),gr=nz(o.grade,0),seed=nz(o.seed,0),Y=[];
 if(!jit&&!gr){for(let i=0;i<=n;i++)Y.push(i/n);return Y;}
 const w=[];let t=0;for(let i=0;i<n;i++){const v=Math.max(.2,(1+jit*(H(seed,i,1,0xB4)*2-1))*(1+gr*(Math.sin(Math.PI*(i+.5)/n)-.5)));w.push(v);t+=v;}
 let a=0;Y.push(0);for(let i=0;i<n;i++){a+=w[i];Y.push(i===n-1?1:a/t);}return Y;};
// a height in internodes (5.5: half-way up the sixth) to the unit culm
const yAt=(Y,n,u)=>{const i=clamp(Math.floor(u),0,n-1);return Y[i]+(Y[i+1]-Y[i])*(u-i);};

// ---------------------------------------------------------------- holes
B.holeSet=function(o){o=o||{};const n=nz(o.n,24),rows=nz(o.rows,3),from=nz(o.from,4),to=nz(o.to,n-3),every=Math.max(1,nz(o.every,2)),
 r=nz(o.r,[.18,.3]),k=nz(o.k,.4),miss=nz(o.miss,.25),seed=nz(o.seed,0),out=[];
 for(let w=0;w<rows;w++){const a=(w+H(seed,w,1,0x401)*.6)/rows*TAU;
  for(let i=from+(w%every);i<to;i+=every){if(H(seed,w,i*4+2,0x402)<miss)continue;
   out.push({y:i+.35+.3*H(seed,w,i*4+3,0x402),r:rng2(r,H(seed,w,i*4+4,0x402)),a:a+(H(seed,w,i*4+5,0x402)-.5)*.15,k});}}
 return out;};

// ---------------------------------------------------------------- the culm
B.culm=function(o){o=o||{};const n=Math.max(1,nz(o.n,24)),seg=nz(o.seg,10),fs=nz(o.fs,[0,.02,.08,.86]),R0=.5,
 sw=nz(o.swell,.05),swW=nz(o.swellW,.0016),fine=fs.length>=4,nodeK=nz(o.nodeK,fine?.42:.85),waxK=nz(o.waxK,1.32),nodeF=nz(o.nodeF,.005),waxF=nz(o.waxF,.03),
 tip=nz(o.tip,.8),tip0=nz(o.tip0,.8),tipL=nz(o.tipL,.2),tipP=nz(o.tipP,1.6),cut=!!o.cut,uR=nz(o.uRep,.5),vR=nz(o.vRep,.5),
 even=!nz(o.jit,0)&&!nz(o.grade,0),Y=B.nodeY(o),seed=nz(o.seed,0);
 const pos=[],nor=[],uv=[],col=[],ring=[];
 const rad=f=>{const d=Math.min(f,1-f);return R0*(1+sw*Math.exp(-d*d/swW));};   /* f: the place within the internode, 0 at a node */
 const shade=f=>f<nodeF?nodeK:f<waxF?waxK:1;
 /* the openings: a bite (with its chambers) and the holes; each in its own frame, turned to its azimuth */
 const hl=Array.isArray(o.holes)?o.holes:o.holes?B.holeSet(Object.assign({n},o.holes)):[];
 const ops=[];if(o.bite)ops.push({y:o.bite.y,r:o.bite.r,a:nz(o.bite.a,0),k:nz(o.bite.k,2.2),bite:true});
 for(const h of hl)ops.push({y:h.y,r:h.r,a:nz(h.a,0),k:nz(h.k,.4),bite:false});
 for(const q of ops){q.ca=Math.cos(q.a);q.sa=Math.sin(q.a);q.by=even?q.y/n:yAt(Y,n,q.y);}
 const inOp=(q,x,y,z)=>{const X=x*q.ca+z*q.sa,Z=-x*q.sa+z*q.ca,dx=(X-R0)/(q.r*R0),dy=(y-q.by)*n/(q.r*R0*q.k),dz=Z/(q.r*R0);return dx*dx+dy*dy+dz*dz<1;};
 const inAny=(x,y,z)=>{for(const q of ops)if(inOp(q,x,y,z))return true;return false;};
 /* the stains: a vertex's shade raised below a hole, within a side of its azimuth */
 const stainL=nz(o.stainL,1.2),stainK=nz(o.stainK,1.25),half=Math.max(TAU/seg*.75,0);
 const stain=(y,a)=>{let s=1;for(const q of ops){if(q.bite)continue;const dy=(q.by-y)*n;if(dy<0||dy>stainL)continue;
  let da=Math.abs(((a-q.a)%TAU+TAU*1.5)%TAU-TAU*.5);if(da>half)continue;s=Math.max(s,lerp(stainK,1,dy/stainL)*lerp(1,.85,da/half));}return s;};
 /* the rows: fs in each internode, then the top */
 const rows=[];
 if(even){for(let i=0;i<n;i++)for(const f of fs)rows.push({y:(i+f)/n});rows.push({y:1});for(const r of rows)r.f=(r.y*n)%1;}
 else{for(let i=0;i<n;i++)for(const f of fs)rows.push({y:Y[i]+(Y[i+1]-Y[i])*f,f});rows.push({y:1,f:0});}
 const taper=nz(o.taper,0);
 for(const row of rows){const y=row.y,f=row.f,tp=cut?1:1-tip*Math.pow(Math.max(0,(y-tip0)/tipL),tipP),r0=(y>=1?R0:rad(f))*tp,r=taper?r0*(1-taper*y):r0,k=y>=1?1:shade(f),R=[];
  for(let s=0;s<=seg;s++){const a=s/seg*TAU;R.push({p:[Math.cos(a)*r,y,Math.sin(a)*r],n:[Math.cos(a),0,Math.sin(a)],u:s/seg*uR,v:y*n*vR,c:ops.length>(o.bite?1:0)?k*stain(y,a):k});}ring.push(R);}
 const pv=(q,flip)=>{pos.push(...q.p);nor.push(flip?-q.n[0]:q.n[0],flip?-q.n[1]:q.n[1],flip?-q.n[2]:q.n[2]);uv.push(q.u,q.v);col.push(q.c,q.c,q.c);};
 for(let i=0;i<ring.length-1;i++)for(let s=0;s<seg;s++){const a=ring[i][s],b=ring[i][s+1],c=ring[i+1][s],d=ring[i+1][s+1];
  const m=[(a.p[0]+d.p[0])/2,(a.p[1]+d.p[1])/2,(a.p[2]+d.p[2])/2];if(ops.length&&inAny(m[0],m[1],m[2]))continue;pv(a);pv(c);pv(d);pv(a);pv(d);pv(b);}
 for(const q of ops){
  if(q.bite){/* the inner wall where the bite opened it, and the septa: the chambers */
   const ri=R0*.82,ik=nz(o.innerK,.55),h=q.r*R0*q.k/n*1.15,y0=Math.max(0,q.by-h),y1=Math.min(1,q.by+h);
   const iq=(y,a)=>({p:[Math.cos(a)*ri,y,Math.sin(a)*ri],n:[Math.cos(a),0,Math.sin(a)],u:a/TAU*uR,v:y*n*vR,c:ik});
   const NY=8;for(let j=0;j<NY;j++)for(let s=0;s<seg;s++){const ya=y0+(y1-y0)*j/NY,yb=y0+(y1-y0)*(j+1)/NY,a0=s/seg*TAU,a1=(s+1)/seg*TAU;
    const A=iq(ya,a0),Bq=iq(ya,a1),Cq=iq(yb,a0),Dq=iq(yb,a1);pv(A,1);pv(Dq,1);pv(Cq,1);pv(A,1);pv(Bq,1);pv(Dq,1);}
   const sp=[];if(even){for(let i=Math.ceil(y0*n);i<=Math.floor(y1*n);i++)sp.push(i/n+.002);}else{for(let i=0;i<=n;i++)if(Y[i]>=y0&&Y[i]<=y1)sp.push(Y[i]+.002/n);}
   for(const y of sp)for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,cc={p:[0,y,0],n:[0,1,0],u:uR*.5,v:y*n*vR,c:.8};
    const A={p:[Math.cos(a0)*ri,y,Math.sin(a0)*ri],n:[0,1,0],u:uR*.5,v:y*n*vR,c:.8},Bq={p:[Math.cos(a1)*ri,y,Math.sin(a1)*ri],n:[0,1,0],u:uR*.5,v:y*n*vR,c:.8};pv(cc);pv(Bq);pv(A);}}
  else{/* a hole: a dark plug set in, facing out, over the hole's span (its own few sides) */
   const ri=R0*nz(o.holeIn,.82),hk=nz(o.holeK,.22),w=Math.min(1.2,q.r*1.25),h=q.r*R0*q.k/n*1.15,NS=3;
   for(let j=0;j<2;j++)for(let s=0;s<NS;s++){const ya=q.by-h+2*h*j/2,yb=q.by-h+2*h*(j+1)/2,a0=q.a-w+2*w*s/NS,a1=q.a-w+2*w*(s+1)/NS;
    const P=(y,a)=>({p:[Math.cos(a)*ri,y,Math.sin(a)*ri],n:[Math.cos(a),0,Math.sin(a)],u:a/TAU*uR,v:y*n*vR,c:hk});
    const A=P(ya,a0),Bq=P(ya,a1),Cq=P(yb,a0),Dq=P(yb,a1);pv(A);pv(Cq);pv(Dq);pv(A);pv(Dq);pv(Bq);}}}
 /* the sheaths: a split sleeve at each of the lowest nodes, its top cut on a slant (highest opposite the split) */
 const nS=Math.min(n,nz(o.sheaths,0)),sL=nz(o.sheathL,.7),sF=nz(o.sheathF,1.12),sK=nz(o.sheathK,.78),SS=Math.max(4,seg);
 for(let i=0;i<nS;i++){const a0=H(seed,i,1,0x5EA)*TAU,arc=TAU*.88,yb=Y[i],len=(Y[i+1]-Y[i])*sL,rb=R0*(1+sw)*1.03,rt=R0*(1+sw)*sF;
  const pt=(t,s,out)=>{const a=a0+arc*s/SS,top=t?yb+len*(.7+.3*Math.sin(Math.PI*s/SS)):yb,r=(t?rt:rb)*(out?1:.985);
   return{p:[Math.cos(a)*r,top,Math.sin(a)*r],n:[Math.cos(a),0,Math.sin(a)],u:s/SS*uR,v:top*n*vR,c:out?sK:.6};};
  for(let s=0;s<SS;s++){for(const out of [1,0]){const A=pt(0,s,out),Bq=pt(0,s+1,out),Cq=pt(1,s,out),Dq=pt(1,s+1,out);
   if(out){pv(A);pv(Cq);pv(Dq);pv(A);pv(Dq);pv(Bq);}else{pv(A,1);pv(Dq,1);pv(Cq,1);pv(A,1);pv(Bq,1);pv(Dq,1);}}}}
 if(nz(o.bend,0)||nz(o.droop,0))arch(pos,nor,o);
 return make(pos,nor,uv,col);};

// ---------------------------------------------------------------- the arch (a clumping cane bowed out and over)
// The axis in diameter units (x and z as the unit culm, y times o.aspect, the height over the diameter the instance is
// scaled to): out along +x by bend*aspect*t^2, the top past droopAt let down by droop*aspect*(t - droopAt)^2. A straight
// culm's vertex (x, t, z) goes to the axis point plus x along the axis's normal in the x-y plane and z along z, so every
// ring stays round and square to the cane. A normal is turned with its ring and written as the instance's normal matrix
// wants it (three scales an instance's normals by its own scale): y over the aspect, then made unit.
const archAx=(o)=>{const b=nz(o.bend,0),dr=nz(o.droop,0),t0=nz(o.droopAt,.6),A=nz(o.aspect,1);
 return t=>{const u=Math.max(0,t-t0);return{c:[b*A*t*t,A*(t-dr*u*u),0],d:[2*b*A*t,A*(1-2*dr*u),0]};};};
function arch(pos,nor,o){const ax=archAx(o),A=nz(o.aspect,1);
 for(let i=0;i<pos.length;i+=3){const x=pos[i],t=pos[i+1],z=pos[i+2],a=ax(t),l=Math.hypot(a.d[0],a.d[1]),T=[a.d[0]/l,a.d[1]/l],N=[T[1],-T[0]];
  pos[i]=a.c[0]+x*N[0];pos[i+1]=(a.c[1]+x*N[1])/A;pos[i+2]=z;
  const nx=nor[i],ny=nor[i+1],nz2=nor[i+2],q=[nx*N[0]+ny*T[0],(nx*N[1]+ny*T[1])/A,nz2],ql=Math.hypot(q[0],q[1],q[2])||1;
  nor[i]=q[0]/ql;nor[i+1]=q[1]/ql;nor[i+2]=q[2]/ql;}}
// a point on the cane's axis at t (0 foot, 1 tip), in the unit culm's space (BIO.put's scale [d, h, d] takes it to metres)
B.axis=function(o,t){const a=archAx(o||{})(t),A=nz((o||{}).aspect,1);return[a.c[0],a.c[1]/A,0];};

B.tiers=function(o){o=o||{};const seg=nz(o.seg,10),strip={bite:null,holes:null,sheaths:0};
 return{near:B.culm(o),mid:B.culm(Object.assign({},o,strip,{seg:Math.max(3,nz(o.midSeg,seg-1)),fs:[0,.5]})),far:B.culm(Object.assign({},o,strip,{seg:Math.max(3,nz(o.farSeg,seg-2)),fs:[0]}))};};

// ---------------------------------------------------------------- spray, fan, shoot
B.spray=function(o){o=o||{};const cell=nz(o.cell,0),cols=nz(o.cols,3),rws=nz(o.rows,3),pad=nz(o.pad,.004),out=nz(o.out,.35),outB=nz(o.outB,.55),nY=nz(o.nY,.6),nc=Math.max(1,nz(o.n,2)),
 pos=[],uv=[],nor=[],c=cell%cols,r=Math.floor(cell/cols),u0=c/cols,u1=(c+1)/cols,vt=r/rws+pad,vb=(r+1)/rws-pad;
 for(let k=0;k<nc;k++){const a=k/nc*Math.PI,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5*ca+out,0,-.5*sa,u0,vt],[.5*ca+out,0,.5*sa,u1,vt],[.5*ca+outB,-1,.5*sa,u1,vb],[-.5*ca+outB,-1,-.5*sa,u0,vb]];
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,nY,0);});}
 return make(pos,nor,uv);};

// the twigs' tips, as data: [{p, dir}] (dir the twig's direction at the tip, for a spray's yaw)
B.fanTips=function(o){o=o||{};const n=Math.max(1,nz(o.n,5)),arc=nz(o.arc,1.2),rise=nz(o.rise,.35),droop=nz(o.droop,.25),sh=nz(o.short,.35),out=[];
 for(let i=0;i<n;i++){const t=n>1?i/(n-1):.5,a=(t-.5)*arc,L=1-sh*Math.abs(t-.5)*2,cx=Math.cos(a),cz=Math.sin(a),h=Math.cos(rise)*L,v=Math.sin(rise)*L-droop*L*L;
  out.push({p:[cx*h,v,cz*h],dir:[cx,Math.sin(rise)-2*droop*L,cz],a,L});}
 return out;};
B.fan=function(o){o=o||{};const r=nz(o.r,.012),side=Math.max(3,nz(o.side,3)),K=4,pos=[],nor=[],uv=[],col=[],rise=nz(o.rise,.35),droop=nz(o.droop,.25);
 for(const tp of B.fanTips(o)){const cx=Math.cos(tp.a),cz=Math.sin(tp.a),L=tp.L,P=[];
  /* the twig's spine: out and up, the tip bowed down (a quadratic in its length) */
  for(let k=0;k<=K;k++){const t=k/K,l=L*t;P.push([cx*Math.cos(rise)*l,Math.sin(rise)*l-droop*l*l,cz*Math.cos(rise)*l]);}
  for(let k=0;k<K;k++)for(let s=0;s<side;s++){const ring=(kk,ss)=>{const p=P[kk],a=ss/side*TAU,rr=r*lerp(1,.35,kk/K),
    /* the ring's frame: up (y) and the twig's sideways (-z, x) */
    nx=-cz*Math.cos(a),ny=Math.sin(a),nz2=cx*Math.cos(a);return{p:[p[0]+nx*rr,p[1]+ny*rr,p[2]+nz2*rr],n:[nx,ny,nz2],u:ss/side,v:kk/K,c:lerp(.8,1,kk/K)};};
   const A=ring(k,s),Bq=ring(k,s+1),Cq=ring(k+1,s),Dq=ring(k+1,s+1),tri=(a,b,c)=>{
    const e1=[b.p[0]-a.p[0],b.p[1]-a.p[1],b.p[2]-a.p[2]],e2=[c.p[0]-a.p[0],c.p[1]-a.p[1],c.p[2]-a.p[2]],g=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
    const s2=g[0]*(a.n[0]+b.n[0]+c.n[0])+g[1]*(a.n[1]+b.n[1]+c.n[1])+g[2]*(a.n[2]+b.n[2]+c.n[2]),L3=s2>=0?[a,b,c]:[a,c,b];
    for(const q of L3){pos.push(...q.p);nor.push(...q.n);uv.push(q.u,q.v);col.push(q.c,q.c,q.c);}};
   tri(A,Cq,Dq);tri(A,Dq,Bq);}}
 return make(pos,nor,uv,col);};

B.shoot=function(o){o=o||{};const n=Math.max(1,nz(o.n,4)),seg=Math.max(3,nz(o.seg,7)),pos=[],nor=[],uv=[],col=[];
 /* each sheath a frustum from its foot to above the next one's, narrowing to the point; the outer face only */
 for(let i=0;i<n;i++){const y0=i/n*.85,y1=i===n-1?1:Math.min(1,(i+1.35)/n*.85),r0=.5*(1-y0)*1.02,r1=i===n-1?0:.5*(1-y1)*1.1,nk=1/Math.sqrt(1.25);
  for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,V=(r,y,a,k)=>({p:[Math.cos(a)*r,y,Math.sin(a)*r],n:[Math.cos(a)*nk,.5*nk,Math.sin(a)*nk],u:s/seg,v:y,c:k});
   const A=V(r0,y0,a0,.8),Bq=V(r0,y0,a1,.8),Cq=V(r1,y1,a0,1),Dq=V(r1,y1,a1,1);
   for(const q of [A,Cq,Dq,A,Dq,Bq]){pos.push(...q.p);nor.push(...q.n);uv.push(q.u,q.v);col.push(q.c,q.c,q.c);}}}
 return make(pos,nor,uv,col);};

// ---------------------------------------------------------------- layout (records only)
function qmul(a,b){return[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];}
const qAx=(ax,t)=>{const s=Math.sin(t/2);return[ax[0]*s,ax[1]*s,ax[2]*s,Math.cos(t/2)];};
/* a lean (tilts about x and z), then the yaw about the culm's own axis */
const qLY=(tx,tz,yaw)=>qmul(qmul(qAx([1,0,0],tx),qAx([0,0,1],tz)),qAx([0,1,0],yaw));
B.qmul=qmul;B.qLY=qLY;

B.groveCells=function(o){o=o||{};const cell=nz(o.cell,180),R=nz(o.R,1000),box=nz(o.box,[-R,-R,R,R]),world=nz(o.world,0),salt=nz(o.salt,0xB6),keep=nz(o.keep,.85),out=[];
 for(let j=Math.floor(box[1]/cell);j<=Math.floor(box[3]/cell);j++)for(let i=Math.floor(box[0]/cell);i<=Math.floor(box[2]/cell);i++){
  const x=(i+H(world,i,j*4+1,salt))*cell,z=(j+H(world,i,j*4+2,salt))*cell;if(o.R!=null&&!o.box&&Math.hypot(x,z)>R)continue;
  const w=o.weight?o.weight(x,z):1;if(H(world,i,j*4+3,salt)>w*keep)continue;out.push({i,j,x,z,w,seed:KRAND.hash(world>>>0,i|0,j|0,salt|0)});}
 return out;};

B.grove=function(o){o=o||{};const seed=nz(o.seed,0),at=nz(o.at,[0,0,0]),x=at[0],z=at[2],r=nz(o.r,rng2(nz(o.rr,[22,42]),H(seed,0,4,0x6A0))),
 L=nz(o.L,rng2(nz(o.Lr,[2.4,3.2]),H(seed,0,5,0x6A0))),ground=o.ground||null,y0=ground?ground(x,z):at[1],
 nClump=nz(o.clumps,Math.round(lerp(10,26,H(seed,0,6,0x6A0))*(r/32))),per=nz(o.per,[3,7]),spread=nz(o.spread,3),
 tiers=nz(o.tiers,[[.55,28],[.25,24],[0,20]]),dia=nz(o.dia,[.6,1]),oldF=nz(o.old,.2),holedF=nz(o.holed,0),bittenF=nz(o.bitten,0),lean=nz(o.lean,.03),
 nv=Math.max(1,nz(o.variants,3)),align=nz(o.align,true),sink=nz(o.sink,.05),shootF=nz(o.shoot,.6),
 G={seed,x,y0,z,r,L,cohort:nz(o.cohort,0),flower:B.flower({seed:nz(o.flowerSeed,0),cohort:nz(o.cohort,0),cycle:o.cycle,deadY:o.deadY,regrowY:o.regrowY}),culms:[],shoots:[]};
 for(let c=0;c<nClump;c++){const a=H(seed,c,1,0x6A1)*TAU,d=Math.sqrt(H(seed,c,2,0x6A1))*r,cx=x+Math.cos(a)*d,cz=z+Math.sin(a)*d;
  if(o.clear&&!o.clear(cx,cz,2))continue;if(o.weight&&o.weight(cx,cz)<.15)continue;
  const k=1-d/r,nI=(tiers.find(t=>k>t[0])||tiers[tiers.length-1])[1],nCulm=Array.isArray(per)?per[0]+Math.floor(H(seed,c,3,0x6A1)*(per[1]-per[0]+1)):per;
  for(let u=0;u<nCulm;u++){const id=c*64+u,h=(kk)=>H(seed,id,kk,0x6A2),px=cx+(u?(h(1)-.5)*spread:0),pz=cz+(u?(h(2)-.5)*spread:0),gy=ground?ground(px,pz):y0;
   const dd=rng2(dia,h(4)),old=h(6)<oldF,holed=old&&h(8)<holedF,bitten=old&&!holed&&h(9)<bittenF;
   /* sink the base so the nodes stand on the grove's levels: y0 + j L */
   const base=align?gy-(((gy-y0)%L)+L)%L-sink:gy-sink,yaw=h(7)*TAU,ln=[(h(10)*2-1)*lean,(h(11)*2-1)*lean],H2=nI*L;
   G.culms.push({i:id,c,x:px,y:base,z:pz,d:dd,n:nI,L,h:H2,yaw,lean:ln,old,holed,bitten,v:Math.floor(h(12)*nv)%nv,u:h(13),
    p:[px,base,pz],q:qLY(ln[0],ln[1],yaw),s:[dd,H2,dd]});}
  if(H(seed,c,4,0x6A1)<shootF){const sx=cx+1.2,sz=cz-.8,sy=ground?ground(sx,sz):y0,sh=lerp(1,3,H(seed,c,5,0x6A1));
   G.shoots.push({i:G.shoots.length,c,x:sx,y:sy,z:sz,h:sh,p:[sx,sy-.1,sz],q:[0,0,0,1],s:[.35*sh/2,sh,.35*sh/2]});}}
 return G;};

// a clumping bamboo's clump (k-guilin's phoenix-tail): canes from one tight root mass, each bowed out its own way
B.clump=function(o){o=o||{};const seed=nz(o.seed,0),salt=nz(o.salt,0xC1A),at=nz(o.at,[0,0,0]),n=nz(o.n,[6,9]),R=nz(o.r,.5),hS=nz(o.hs,[.6,1.05]),H0=nz(o.H,10),
 d=nz(o.d,.1),bends=nz(o.bends,[.25,.375,.5]),fan=nz(o.fan,.4),out=[];
 const N=Array.isArray(n)?n[0]+Math.floor(H(seed,0,1,salt)*(n[1]-n[0]+1)):n,lean=H(seed,0,2,salt)*TAU;
 for(let i=0;i<N;i++){const h=k=>H(seed,i,k+2,salt),a=h(1)*TAU,r=R*Math.sqrt(h(2)),x=at[0]+Math.cos(a)*r,z=at[2]+Math.sin(a)*r,y=o.ground?o.ground(x,z):at[1];
  /* each cane bows out from the clump's middle (its own azimuth, within fan of the line out) */
  const la=(r>1e-9?a:lean)+(h(3)-.5)*2*fan,hh=H0*rng2(hS,h(4)),v=Math.floor(h(5)*bends.length)%bends.length;
  out.push({i,p:[x,y-.2,z],q:qLY(0,0,-la),s:[d,hh,d],az:la,h:hh,v,bend:bends[v],u:h(6)});}
 return out;};

B.sprays=function(o){o=o||{};const C=o.culm,n=C.n,L=nz(C.L,C.h/n),nodes=o.nodes||null,from=nz(o.from,.42),step=nz(o.step,2.4),size=nz(o.size,[3.2,4.4]),
 lod=nz(o.lod,[[1,1,0,B.LOD.near+50],[2,1.3,B.LOD.near+50,B.LOD.mid],[4,1.65,B.LOD.mid,1e9]]),cards=Math.max(1,nz(o.cards,3)),u=nz(C.u,0),
 n0=Math.ceil(n*from),base=rng2(size,u),out=[];
 lod.forEach((t,ti)=>{const [ev,k0,r0,r1]=t;
  for(let k=n0;k<n;k+=ev){const y=nodes?nodes[k]:k*L,a=nz(C.yaw,0)+k*step,sz=base*k0*(.75+.25*(k-n0)/Math.max(1,n-n0));
   out.push({p:[C.x,C.y+y,C.z],q:qAx([0,1,0],a),yaw:a,s:[sz,sz*1.15,sz],k,tier:ti,v:k%cards,range:[r0,r1],u:(u*7+k*.13)%1});}});
 return out;};

B.flower=function(o){o=o||{};const seed=nz(o.seed,0),cohort=nz(o.cohort,0),cycle=Math.max(1,nz(o.cycle,48));
 return{cohort,cycle,phase:H(seed,cohort,1,0xF10)*cycle,deadY:nz(o.deadY,3),regrowY:nz(o.regrowY,8)};};
B.flowering=function(f,year){const t=((year-f.phase)%f.cycle+f.cycle)%f.cycle;
 if(t<1)return{state:'flowering',t,height:1,leaf:1-.5*t,bloom:1,dead:0};
 if(t<1+f.deadY)return{state:'dead',t:(t-1)/f.deadY,height:1,leaf:0,bloom:0,dead:1};
 if(t<1+f.deadY+f.regrowY){const g=(t-1-f.deadY)/f.regrowY;return{state:'regrowth',t:g,height:g,leaf:g,bloom:0,dead:clamp(1-g*2,0,1)};}
 return{state:'green',t:(t-1-f.deadY-f.regrowY)/Math.max(1e-9,f.cycle-1-f.deadY-f.regrowY),height:1,leaf:1,bloom:0,dead:0};};

// ---------------------------------------------------------------- the host side of a layout
B.Q=function(q){const T=BIO.host.THREE;return new T.Quaternion(q[0],q[1],q[2],q[3]);};
B.put=function(name,recs,col,at){const T=BIO.host.THREE,o=at||[0,0,0];let n=0;
 for(const r of recs){const nm=typeof name==='function'?name(r):name;if(!nm)continue;
  const c=typeof col==='function'?col(r):Array.isArray(col)?col[Math.floor(r.u*col.length)%col.length]:col;
  BIO.put(nm,[r.p[0]+o[0],r.p[1]+o[1],r.p[2]+o[2]],B.Q(r.q),r.s,c==null?null:(c.isColor?c:new T.Color(c)));n++;}
 return n;};
})();
