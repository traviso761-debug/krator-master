// ---------------------------------------------------------------- ring sea hull
// One parametric hull serves every vessel. u runs stern (0) to bow (1); s is the side (-1 port,
// +1 starboard, 0 the centreline); h is the height fraction, keel (0) to sheer (1).
//   L, B      length on deck, greatest beam                     fb, dr  freeboard and draft amidships
//   sheerF/A  rise of the sheer at the bow / stern (m)          sp      sheer curve exponent
//   pb/pa     fineness of the bow / stern plan (higher = fuller) q       plan exponent (lower = fuller)
//   n         section squareness (2 round bilge, 4+ boxy junk)   flare   topside flare (fraction)
//   rakeF/A   how far the stem / sternpost lean past the keel's ends (m)
//   transom   0 pointed stern, else the stern's width as a fraction of the beam (junk, barge)
//   keelEnd   height of the keel at the ends (m); kp keel rocker exponent
//   col(u,h,s) -> hex paints the hull per vertex (bands, eyes are separate meshes)
function rsHull(o){const L=o.L,Bm=o.B,fb=o.fb,dr=o.dr,sp=o.sp||2.4,pb=o.pb||2.2,pa=o.pa||2.2,q=o.q||.7,n=o.n||2.4,flare=o.flare||0,
 rakeF=o.rakeF||0,rakeA=o.rakeA||0,tr=o.transom||0,kE=o.keelEnd==null?fb*.25:o.keelEnd,kp=o.kp||3,z0=o.z0||0;
 const e=u=>2*u-1;
 const H={o,L,B:Bm,z0};
 H.hb=u=>{const x=Math.abs(e(u)),p=u>.5?pb:pa;let w=Math.pow(Math.max(0,1-Math.pow(x,p)),q);if(u<.5&&tr)w=tr+(1-tr)*w;return Bm/2*w;};
 H.ys=u=>{const x=Math.abs(e(u));return fb+(u>.5?(o.sheerF||0):(o.sheerA||0))*Math.pow(x,sp);};
 H.yk=u=>{const x=Math.abs(e(u));return lerp(-dr,kE,Math.pow(x,kp));};
 const rakeOf=(u,hF)=>{const x=Math.abs(e(u));const w=Math.pow(x,6);return(u>.5?rakeF:-rakeA)*w*(1-hF);};
 H.xAt=(u,hF)=>(u-.5)*L-rakeOf(u,hF);
 // section: superellipse, param theta in [0, pi/2] keel -> sheer
 const sec=th=>{const c=Math.cos(th),s=Math.sin(th);return[Math.pow(Math.max(0,s),2/n),1-Math.pow(Math.max(0,c),2/n)];};
 H.pt=(u,s,hF)=>{const ys=H.ys(u),yk=H.yk(u);// invert hF -> theta through the section
  const c=Math.pow(Math.max(0,1-hF),n/2),th=Math.acos(clamp(c,0,1));const w=sec(th)[0];const hb=H.hb(u);
  return[H.xAt(u,hF),yk+(ys-yk)*hF,z0+s*hb*w*(1+flare*hF*hF)];};
 H.halfAt=(u,y)=>{const ys=H.ys(u),yk=H.yk(u);if(y<=yk)return 0;const hF=clamp((y-yk)/(ys-yk),0,1);return Math.abs(H.pt(u,1,hF)[2]-z0);};
 H.nrm=(u,s,hF)=>{const a=H.pt(Math.min(1,u+.002),s,hF),b=H.pt(Math.max(0,u-.002),s,hF),c=H.pt(u,s,Math.min(1,hF+.01)),d=H.pt(u,s,Math.max(0,hF-.01));
  const du=new THREE.Vector3(a[0]-b[0],a[1]-b[1],a[2]-b[2]),dh=new THREE.Vector3(c[0]-d[0],c[1]-d[1],c[2]-d[2]);const N=s>=0?du.cross(dh):dh.cross(du);return N.normalize();};
 // u at a given x on the sheer (for placing fittings by metres from amidships)
 H.uAt=x=>clamp(x/L+.5,0,1);
 return H;}
const z0h=H=>H.z0||0;
function rsHullMesh(B,H,mk,col,nu,nv){nu=nu||72;nv=nv||14;const tile=H.o.tile||4;
 const fn=(u,v)=>{const s=v<.5?-1:1,hF=1-Math.abs(v*2-1);return H.pt(u,s,hF);};
 const g=rsGrid(fn,nu,nv*2,(u,v,p)=>[p[0]/tile,(p[1]-H.yk(u)+Math.abs(p[2]))/tile]);
 if(col)rsGridColors(g,nu,nv*2,(u,v)=>col(u,1-Math.abs(v*2-1),v<.5?-1:1));
 rsPut(B,mk||'wood',g,null,null,null,col?null:0xffffff);
 // transom: close the flat stern with a panel following the section at u=0
 if(H.o.transom){const tg=rsGrid((a,v)=>{const s=a*2-1;const hF=v;const p=H.pt(0,Math.sign(s)||1,hF);return[p[0],p[1],z0h(H)+(p[2]-z0h(H))*Math.abs(s)];},10,8,(a,v,p)=>[p[2]/tile,p[1]/tile]);
  if(col)rsGridColors(tg,10,8,(a,v)=>col(0,v,1));rsPut(B,mk||'wood',tg,null,null,null,col?null:0xffffff);}
 return g;}
// the deck: a surface bulwark metres below the sheer, clipped to the hull's inside; uA..uB limit it
function rsDeck(B,H,o){o=o||{};const bw=o.bw==null?.6:o.bw,uA=o.uA==null?.02:o.uA,uB=o.uB==null?.98:o.uB,mk=o.mk||'wood',col=o.col||0xb89a74,y0=o.y;
 const yAt=u=>y0!=null?(typeof y0==='function'?y0(u):y0):H.ys(u)-bw;
 const g=rsGrid((u,v)=>{const uu=lerp(uA,uB,u),y=yAt(uu),hw=H.halfAt(uu,y)*.995;return[H.xAt(uu,clamp((y-H.yk(uu))/(H.ys(uu)-H.yk(uu)),0,1)),y,H.z0+(v*2-1)*hw];},48,6,(u,v,p)=>[p[0]/3,p[2]/3]);
 rsPut(B,mk,g,null,null,null,col);return yAt;}
// rails and wales: a tube following the hull at height fraction hF (or a y) on both sides
function rsWale(B,H,hF,r,mk,col,uA,uB,sides){uA=uA==null?.01:uA;uB=uB==null?.99:uB;const out=[];
 for(const s of(sides||[-1,1])){const pts=[];for(let i=0;i<=40;i++){const u=lerp(uA,uB,i/40);const p=H.pt(u,s,hF),N=H.nrm(u,s,hF);pts.push([p[0]+N.x*r*.6,p[1]+N.y*r*.6,p[2]+N.z*r*.6]);}
  rsTube(B,mk||'wood',pts,r,col,80,6);out.push(pts);}return out;}
// the keel and the stem/sternpost as one tube along the centreline, continued above the sheer by
// ext:[[x,y],...] points at the bow (and extA at the stern), for curled prows and posts
function rsSpine(B,H,r,col,ext,extA,mk){const pts=[];
 if(extA)for(let i=extA.length-1;i>=0;i--)pts.push([extA[i][0],extA[i][1],H.z0]);
 for(let i=0;i<=16;i++){const hF=1-i/16;const p=H.pt(0,0,hF);pts.push([p[0]-r*.4,p[1],H.z0]);}
 for(let i=1;i<24;i++){const u=i/24;pts.push([H.xAt(u,0),H.yk(u)-r*.5,H.z0]);}
 for(let i=0;i<=16;i++){const hF=i/16;const p=H.pt(1,0,hF);pts.push([p[0]+r*.4,p[1],H.z0]);}
 if(ext)for(const q of ext)pts.push([q[0],q[1],H.z0]);
 return rsTube(B,mk||'wood',pts,typeof r==='number'?r:r,col,pts.length*4,8);}
// sample points along the hull side at a height, evenly in u, both sides unless sides given:
// returns [{u,s,p:[x,y,z],n:Vector3}] for oar ports, shields, cleats, outrigger booms
function rsAlong(H,uA,uB,n,hF,sides){const out=[];for(const s of(sides||[-1,1]))for(let i=0;i<n;i++){const u=n>1?lerp(uA,uB,i/(n-1)):(uA+uB)/2;out.push({u,s,p:H.pt(u,s,hF),n:H.nrm(u,s,hF)});}return out;}
// a flat disc pressed onto the hull (oculus eyes, roundels, ports): r metres, at (u,s,hF)
function rsDecal(B,H,u,s,hF,r,col,mk,seg,lift){const p=H.pt(u,s,hF),N=H.nrm(u,s,hF);const g=new THREE.CircleGeometry(r,seg||18);lift=lift||.03;
 return rsPut(B,mk||'paint',g,[p[0]+N.x*lift,p[1]+N.y*lift,p[2]+N.z*lift],new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),N),null,col);}
