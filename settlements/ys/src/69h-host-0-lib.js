// ================================================================= ANCIENT HOSTS — the shared helpers (src/8ap-host-*)
// Five Ancient types drawn from the start as HOSTS for the Hykkousoi of Ys (settlements/ys): two skyscrapers
// (L the Facet, M the Bastion) and three mid-rise (the Arcades, the Capsule Stalks, the Bell Hall). What makes a
// good host is written once here and kept by all five:
//  * plain faces at pod heights. Projections only where a HOSTSPEC_* says, and its avoid() and bearings() keep
//    pods off them.
//  * a regular storey table: plate k's top at floors.y0 + k*pitch + top (builder y). The plates are drawn behind
//    the skin (a pale slab over a dark soffit) whenever the fabric is open (decay > 0), so any cut shows floors.
//  * a cut at any storey: Ys names it through ysCutY at decay 1 and 3; the skin and the lining take a ragged top
//    there and the plates stop under it. A cut from the host drops the collapse scar (the stump keeps its walls).
//  * way-in holes: Ys's ysWallHole wraps each body's hole predicate, so the skin AND its lining open for a pod.
//  * a shrinkable podium: ysPodiumR (Ys) shrinks it; the apron and the ground planting are skipped then.
// Every Ys hook sits behind a typeof guard, so the kit runs these unchanged and Ys vendors them byte for byte.
// HOSTSPEC_<TYPE> beside each builder is pure data and arithmetic (no three.js), in the shape of Ys's
// YS_HOST_TYPES (settlements/ys/targets/city/88-city-place.js); the plan functions it calls are the ones the
// builder draws with, so the spec and the geometry cannot drift.
//
// PLANS. A polygon plan is a list of [x,z] vertices in order of increasing bearing (th from +x toward +z, the
// lathe's convention: a point at bearing th is [r cos th, r sin th]). It may change with height (plan(yb), yb the
// builder's y), but never its vertex count. anhPrism draws one strip per edge, so corners stay crisp; holes are
// asked of the cell's real bearing (u = th/TAU), which is what ysWallHole and holeFn expect.

// the radius of plan P along bearing th: the first exit of a ray from the axis (a slot's back wall, not its lips)
function anhRayR(P,th){const c=Math.cos(th),s=Math.sin(th),n=P.length;let best=Infinity;
 for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],ex=b[0]-a[0],ez=b[1]-a[1],det=ex*s-c*ez;if(Math.abs(det)<1e-9)continue;
  const t=(ex*a[1]-a[0]*ez)/det,w=(c*a[1]-s*a[0])/det;if(t>1e-6&&w>=-1e-9&&w<=1+1e-9&&t<best)best=t;}
 return best===Infinity?0:best;}
// the mean of anhRayR over 24 bearings (a host's rAt with no bearing)
function anhMeanR(P){let s=0;for(let i=0;i<24;i++)s+=anhRayR(P,(i+.5)/24*TAU);return s/24;}
// the inscribed radius: the nearest edge line to the axis (rooms and fittings stay inside it)
function anhInR(P){let m=Infinity;const n=P.length;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],ex=b[0]-a[0],ez=b[1]-a[1],L=Math.hypot(ex,ez);
 if(L<1e-6)continue;m=Math.min(m,Math.abs(a[0]*ez-a[1]*ex)/L);}return m;}
// cells per edge for a plan, about `seg` metres each; fixed once per building so every height has the same grid
function anhCols(P,seg){return P.map((a,i)=>{const b=P[(i+1)%P.length];return Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/seg));});}
// bearings for n pods: the faces F in a shuffled order, then again `off` radians either side (Ys's ysPlFaces shape)
function anhFaces(F,st,n,off,jit){const f=F.slice();for(let i=f.length-1;i>0;i--){const j=st.int(0,i);const t=f[i];f[i]=f[j];f[j]=t;}
 const out=[];for(let i=0;i<n;i++){const k=i%f.length,lap=Math.floor(i/f.length);out.push(f[k]+(lap?(lap%2?off:-off):0)+st.range(-jit,jit));}return out;}
// true when [yl, yl+h] (a pod standing on a plate) crosses any of the heights in Y, with a margin
function anhCross(Y,yl,h,m){m=m==null?1.2:m;return Y.some(y=>yl+.5<y+m&&yl+h+m>y);}

// A PRISM SKIN on a polygon plan.  o: {plan(yb), y0 (builder y of local 0), yA,yB (the local range), top (a local
// cut inside it, or null), jag, seed, cols (anhCols), dy (row pitch), hole(u,yl,e,uc) (u the cell's bearing fraction; e, uc its edge and
// place along it, for striping), k (scale about the axis: the lining is k .86), skip(e) (edges left out)}  ->  [geometries], one per edge
function anhPrism(o){const out=[],k=o.k||1,y0=o.y0||0,cut=o.top!=null&&o.top<o.yB,yTop=cut?o.top:o.yB;if(yTop<=o.yA+.2)return out;
 const P0=o.plan(y0+o.yA),n=P0.length,jag=cut?(o.jag||0):0,sd=o.seed||0;
 const topAt=(x,z)=>{if(!jag)return yTop;const u=(Math.atan2(z,x)/TAU+1)%1;return Math.max(o.yA+.5,yTop+jag*(fbm(u*7+sd,2.3,sd*.7,3)*2-1));};
 const at=(e,t,y)=>{const P=o.plan(y0+y),a=P[e],b=P[(e+1)%n];return[(a[0]+(b[0]-a[0])*t)*k,(a[1]+(b[1]-a[1])*t)*k];};
 const nv=Math.max(1,Math.round((yTop-o.yA)/(o.dy||3)));
 for(let e=0;e<n;e++){if(o.skip&&o.skip(e))continue;const m=o.cols[e],a=P0[e],b=P0[(e+1)%n],len=Math.hypot(b[0]-a[0],b[1]-a[1])*k;
  out.push(gridSurface((u,v)=>{const b0=at(e,u,o.yA),y=o.yA+v*(topAt(b0[0],b0[1])-o.yA),xz=at(e,u,y);return[xz[0],y,xz[1]];},m,nv,
   {uS:len/8,vS:(yTop-o.yA)/8,hole:o.hole?(u,v)=>{const y=o.yA+v*(yTop-o.yA),xz=at(e,u,y);return o.hole((Math.atan2(xz[1],xz[0])/TAU+1)%1,y,e,u);}:null}));}
 return out;}
// a flat fan over plan P at height y (scaled k): up-facing, or down-facing for a soffit
function anhFan(P,y,k,down){const pos=[0,y,0],idx=[],n=P.length;for(const p of P)pos.push(p[0]*k,y,p[1]*k);
 for(let i=0;i<n;i++){const a=1+i,b=1+(i+1)%n;if(down)idx.push(0,a,b);else idx.push(0,b,a);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;}
// the vertical band round plan P from ya to yb (a plate's edge, a parapet)
function anhBand(P,ya,yb,k){const n=P.length;return gridSurface((u,v)=>{const p=P[Math.round(u*n)%n];return[p[0]*k,ya+v*(yb-ya),p[1]*k];},n,1,{});}
// THE STOREYS behind an open skin: a pale plate (its top at y+.3) over a dark soffit, on the plan at that height
// scaled by k, for every local y in ys. Geometry goes to acc.pale / acc.dark, merged by the caller.
function anhPlates(plan,y0,ys,k,acc){for(const y of ys){const P=plan(y0+y);acc.pale.push(anhFan(P,y+.3,k),anhBand(P,y-.3,y+.3,k));acc.dark.push(anhFan(P,y-.32,k*.985,true));}}
// the local heights of the plates a body from builder y0 holds, on the storey table Yf + m*pitch (m >= 1),
// stopping `gap` under a local top L
function anhStoreys(Yf,pitch,y0,L,gap){const out=[];for(let yb=Yf+pitch*Math.max(1,Math.ceil((y0-Yf)/pitch-1e-6));yb<y0+L-gap;yb+=pitch)if(yb>y0+.5)out.push(yb-y0);return out;}
// a point on edge e of the plan at fraction t, local height y, pushed `off` out along the face's normal; the
// normal leans with the face (a folded facet), so a window lies flat on it.  -> {p,n}
function anhOnFace(plan,y0,e,t,y,off){const f=yy=>{const P=plan(y0+yy),a=P[e],b=P[(e+1)%P.length];return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,b[0]-a[0],b[1]-a[1]];};
 const c=f(y),up=f(y+.5),dn=f(y-.5),L=Math.hypot(c[2],c[3])||1,nx=c[3]/L,nz=-c[2]/L,s=(up[0]-dn[0])*nx+(up[1]-dn[1])*nz,m=Math.hypot(1,s);
 const N=[nx/m,-s/m,nz/m];return{p:[c[0]+N[0]*off,y+N[1]*off,c[1]+N[2]*off],n:N};}
// the shared plate colours, and a merge helper: buckets {material: [geometries]} into one mesh each
const ANH={plate:new THREE.MeshStandardMaterial({color:0xbdb7ad,roughness:.9,metalness:0,side:DS}),
 soffit:new THREE.MeshStandardMaterial({color:0x191b1f,roughness:1,metalness:0,side:DS})};
function anhFlush(B,P){for(const [mat,geos] of B)meshMerged(geos,mat,P);B.clear();}
function anhPut(B,mat,g){if(!g)return;if(!B.has(mat))B.set(mat,[]);if(Array.isArray(g))B.get(mat).push(...g);else B.get(mat).push(g);}
