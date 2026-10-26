// ================================================================= BIOME CORE — leafset: leaves held by the stem
// The owner (2026-10-26): leaf textures should attach to their branches by the stem, not float rotated every which way.
// Today a crown's cards are tripods centred on a point and turned at random (qEuler with rr(0,TAU)), so a leaf can sit
// at any angle to its twig. This fragment gives a card a STEM (the point of its texture where the petiole is), cards and
// sprays that PIVOT there, and the PLACEMENT that hangs them from a twig: the stem on the twig, the blade out along it
// with a droop, round the twig by a phyllotaxy, the blade's face turned toward the sky and sun, with a little roll and
// pitch from KRAND (per tree seed and leaf index, never from the page's stream). Opt-in: a kit lists it and calls it;
// nothing else changes. Plain maths ([G data] apart from the geometry builders); Godot: the same placement in GDScript
// (the quaternions it returns are the instance basis; the card's stem is a uv, the mesh pivot a vertex offset).
//   BIO.leafStem(src) -> [su, sv]   the stem in IMAGE coordinates (u right, v DOWN from the image's top, the way the kits'
//         unflipped cards sample, BIO.alphaTex and the library's cards): src a library meta record (meta.json: its
//         processing.options.anchor, tools/textures/cards.py) or a pack entry, an anchor name ('bottom', 'top' for a
//         hanging card, 'center', 'none', 'tight'), an explicit [su,sv], or nothing. The crop anchor says where the
//         subject sits, not where its stem is, so only 'top' turns a card over; every other card is upright, its stem
//         bottom-centre ([.5,.96]: the crop's margin under the subject).
//   BIO.geo.leafCard(o) -> geometry   one card: the stem at the origin, the blade up +y, its face +z. o: {stem, w (1),
//         h (1), bend (0: the tip curls toward +z by bend x h), seg (1 or 3 with bend), flipY (false: a CanvasTexture)}
//   BIO.geo.spray(o) (= BIO.geo.clump({stem})) -> geometry   n cards (3) fanned in the card plane by +-spread (.55 rad)
//         from one stem at the origin, each cupped out of the plane by cup (.22 rad): a spray of leaves on one twig end.
//   BIO.leafOn(seg, t, o) -> {p, q, dir, n, i}   one leaf at t (0..1) along seg ({a,b} or [a,b], points [x,y,z] or
//         {x,y,z}): p the stem's point on the twig, q the instance rotation [x,y,z,w] (a card's +y to the blade, +z to its
//         face; with o.axis 'x' a frond's +x to the blade and +y to its face), dir the blade, n the face. o:
//           i       the leaf's index on the twig (the phyllotaxy and the jitter's key)
//           phyl    'spiral' (137.5 degrees a leaf, the default), 'alternate' (180), 'opposite' (pairs, crossed 90 degrees a
//                   node), 'whorl' (whorl leaves a node, default 3, each node turned half a gap)
//           angle   the blade's angle out from the twig (0.9 rad); droop (0.35) pulls it down; sun ([0,1,0] toward the
//                   sky; any direction) and sunK (0.6) turn the face up and sunward; roll (0.25 rad) and pitch (0.15 rad)
//                   the jitter's reach; seed (u32: the tree's), salt (a pass's own)
//   BIO.leafAlong(seg, n, o) -> [leafOn...]   n leaves along the twig between o.t0 (.15) and o.t1 (1), by node: a pair
//         or a whorl shares its node's t. BIO.leafQ(r) -> THREE.Quaternion for BIO.put.
(function(){
const H=(seed,i,salt)=>KRAND.unit(KRAND.hash(seed>>>0,i|0,salt|0));
const v3=p=>Array.isArray(p)?[+p[0],+p[1],+p[2]]:[+p.x,+p.y,+p.z];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=(a,d)=>{const l=Math.hypot(a[0],a[1],a[2]);return l>1e-9?[a[0]/l,a[1]/l,a[2]/l]:(d||[0,1,0]);};
// a rotation matrix's columns (x, y, z: orthonormal, right-handed) as a quaternion [x,y,z,w]
function quatOf(X,Y,Z){const m00=X[0],m10=X[1],m20=X[2],m01=Y[0],m11=Y[1],m21=Y[2],m02=Z[0],m12=Z[1],m22=Z[2],tr=m00+m11+m22;let x,y,z,w,s;
 if(tr>0){s=.5/Math.sqrt(tr+1);w=.25/s;x=(m21-m12)*s;y=(m02-m20)*s;z=(m10-m01)*s;}
 else if(m00>m11&&m00>m22){s=2*Math.sqrt(1+m00-m11-m22);w=(m21-m12)/s;x=.25*s;y=(m01+m10)/s;z=(m02+m20)/s;}
 else if(m11>m22){s=2*Math.sqrt(1+m11-m00-m22);w=(m02-m20)/s;x=(m01+m10)/s;y=.25*s;z=(m12+m21)/s;}
 else{s=2*Math.sqrt(1+m22-m00-m11);w=(m10-m01)/s;x=(m02+m20)/s;y=(m12+m21)/s;z=.25*s;}
 return[x,y,z,w];}
BIO._quatOf=quatOf;
// ---------------------------------------------------------------- the stem
BIO.leafStem=function(src){const D=[.5,.96];if(src==null)return D.slice();
 if(Array.isArray(src)&&src.length===2)return[+src[0],+src[1]];
 let a=src;if(typeof a==='object'){if(a.stem)return BIO.leafStem(a.stem);a=(a.processing&&a.processing.options&&a.processing.options.anchor)||a.anchor||(a.options&&a.options.anchor)||null;}
 if(a==='top')return[.5,.04];   /* a hanging card: the subject hangs from the top of its frame */
 return D.slice();};
// ---------------------------------------------------------------- stem-pivoted geometry
function card(pos,uv,nor,o,rot){const st=BIO.leafStem(o.stem),w=o.w==null?1:+o.w,h=o.h==null?1:+o.h,bend=+o.bend||0,ns=bend?Math.max(2,o.seg==null?3:o.seg|0):1,flip=!!o.flipY;
 const ca=Math.cos(rot.fan),sa=Math.sin(rot.fan),cc=Math.cos(rot.cup),sc=Math.sin(rot.cup);
 const P=(x,y)=>{const yy=y,z=bend*h*Math.pow(Math.max(0,yy)/h,2);   /* the curl toward the face, from the stem out */
  const x1=x*ca-yy*sa,y1=x*sa+yy*ca,z1=z;return[x1,y1*cc-z1*sc,y1*sc+z1*cc];};
 const N=(x,y)=>{const t=bend?2*bend*Math.max(0,y)/h:0,n=norm([0,-t,1]),x1=n[0]*ca-n[1]*sa,y1=n[0]*sa+n[1]*ca;return[x1,y1*cc-n[2]*sc,y1*sc+n[2]*cc];};
 const x0=-st[0]*w,x1=(1-st[0])*w,y0=(st[1]-1)*h;   /* the image's bottom edge is 1-sv below the stem, its top sv above */
 const U=(x,y)=>{const u=(x-x0)/w,vd=st[1]-y/h;return[u,flip?1-vd:vd];};
 for(let s=0;s<ns;s++){const ya=y0+(s/ns)*h,yb=y0+((s+1)/ns)*h,q=[[x0,ya],[x1,ya],[x1,yb],[x0,yb]];
  [0,1,2,0,2,3].forEach(i=>{const p=P(q[i][0],q[i][1]),n=N(q[i][0],q[i][1]),t=U(q[i][0],q[i][1]);pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(t[0],t[1]);});}}
BIO.geo.leafCard=function(o){o=o||{};const pos=[],uv=[],nor=[];card(pos,uv,nor,o,{fan:0,cup:0});return BIO.geo._make(pos,nor,uv);};
BIO.geo.spray=function(o){o=o||{};const n=o.n==null?3:Math.max(1,o.n|0),sp=o.spread==null?.55:+o.spread,cup=o.cup==null?.22:+o.cup,pos=[],uv=[],nor=[];
 for(let k=0;k<n;k++){const f=n===1?0:(k/(n-1)-.5)*2;card(pos,uv,nor,o,{fan:-f*sp,cup:cup*(k%2?-1:1)*(n===1?0:1)});}
 return BIO.geo._make(pos,nor,uv);};
// ---------------------------------------------------------------- placement on the twig
const GOLDEN=137.5*Math.PI/180;
function azimuth(i,o){const ph=o.phyl||'spiral';
 if(ph==='alternate')return i*Math.PI;
 if(ph==='opposite')return Math.floor(i/2)*Math.PI/2+(i%2)*Math.PI;
 if(ph==='whorl'){const m=Math.max(2,o.whorl==null?3:o.whorl|0);return Math.floor(i/m)*Math.PI/m+(i%m)*2*Math.PI/m;}
 return i*GOLDEN;}
BIO.leafOn=function(seg,t,o){o=o||{};const A=v3(seg.a||seg[0]),B=v3(seg.b||seg[1]),i=o.i|0,seed=o.seed==null?1:o.seed,salt=o.salt|0;
 t=Math.min(1,Math.max(0,t==null?1:+t));const d=norm(sub(B,A)),p=add(A,mul(sub(B,A),t));
 // the twig's own frame: N level where it can be (so azimuth 0 is the same side on every twig), Bn round it
 const ref=Math.abs(d[1])>.98?[1,0,0]:[0,1,0],N=norm(cross(d,ref)),Bn=cross(d,N);
 const phi=azimuth(i,o)+H(seed,0,salt+7)*Math.PI*2,ang=o.angle==null?.9:+o.angle;
 const r=add(mul(N,Math.cos(phi)),mul(Bn,Math.sin(phi)));
 let dir=norm(add(mul(d,Math.cos(ang)),mul(r,Math.sin(ang))),d);
 const droop=o.droop==null?.35:+o.droop,pit=(o.pitch==null?.15:+o.pitch)*(H(seed,i,salt+1)*2-1);
 dir=norm(add(add(dir,[0,-droop,0]),mul(r,pit)),dir);
 // the face: the sky and sun direction with the blade's own component taken out, then rolled about the blade
 const sun=o.sun?norm(v3(o.sun)):[0,1,0],k=o.sunK==null?.6:+o.sunK,bias=norm(add(mul([0,1,0],1-k),mul(sun,k)));
 let n=sub(bias,mul(dir,dot(bias,dir)));n=Math.hypot(n[0],n[1],n[2])>1e-6?norm(n):norm(sub(r,mul(dir,dot(r,dir))),cross(dir,[1,0,0]));
 const roll=(o.roll==null?.25:+o.roll)*(H(seed,i,salt+2)*2-1),cr=Math.cos(roll),sr=Math.sin(roll),bx=cross(dir,n);
 n=norm(add(mul(n,cr),mul(bx,sr)));
 const q=o.axis==='x'?quatOf(dir,n,cross(dir,n)):quatOf(cross(dir,n),dir,n);
 return{p,q,dir,n,i};};
BIO.leafAlong=function(seg,n,o){o=o||{};const out=[],t0=o.t0==null?.15:+o.t0,t1=o.t1==null?1:+o.t1,ph=o.phyl||'spiral';
 const per=ph==='opposite'?2:ph==='whorl'?Math.max(2,o.whorl==null?3:o.whorl|0):1,nodes=Math.ceil(n/per),i0=o.i0|0;
 for(let k=0;k<n;k++){const node=Math.floor(k/per),t=nodes===1?t1:t0+(t1-t0)*node/(nodes-1);out.push(BIO.leafOn(seg,t,Object.assign({},o,{i:i0+k})));}
 return out;};
BIO.leafQ=function(r){const T=BIO.host.THREE;return new T.Quaternion(r.q[0],r.q[1],r.q[2],r.q[3]);};
})();
