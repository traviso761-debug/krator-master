// ================================================================= HYKKOUSOI — the shell kit
// Parametric surfaces into city-wide merged buckets (one draw call per material per side), vertex-coloured, with
// metre UVs. Everything organic in Ys is one of these: a modulated lathe (barnacles, domes, spires, the tideline),
// a superellipsoid pod with real openings cut through it, a conch (a tapering tube along a log spiral), a tube along
// a polyline (ribs, rails, stair strings), a fillet that roots one shell into another, a disc (floors, landings).
// A surface is built in the CURRENT FRAME (HYK.cur's group, 62-hyk-helpers.js) and moved to world space at the put;
// with no frame the coordinates are world. Nothing here is a box: that is the rule (DESIGN §4).
const HYK_BK={out:{},in:{}};const HYK_MESHES=[];const HYK_WHITE=new THREE.Color(1,1,1);
function hykPut(matKey,geo,inside){if(!geo)return null;if(!MAT[matKey]){reportErr('hykPut: no material '+matKey);return null;}
 const F=HYK.cur;if(F&&F.G)geo.applyMatrix4(F.G.matrix);
 const t=tcur();if(t)t.tris+=triOf(geo);
 const side=inside?'in':'out';(HYK_BK[side][matKey]||(HYK_BK[side][matKey]=[])).push(geo);return geo;}
function hykMerge(geos){let nv=0,ni=0;for(const g of geos){nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
 const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),C=new Float32Array(nv*3);const I=nv>65535?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
 for(const g of geos){const A=g.attributes,c=A.position.count;P.set(A.position.array,vo*3);if(A.normal)N.set(A.normal.array,vo*3);if(A.uv)U.set(A.uv.array,vo*2);
  if(A.color)C.set(A.color.array,vo*3);else C.fill(1,vo*3,(vo+c)*3);
  if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)I[io+i]=ix[i]+vo;io+=ix.length;}else{for(let i=0;i<c;i++)I[io+i]=vo+i;io+=c;}vo+=c;}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));G.setAttribute('color',new THREE.BufferAttribute(C,3));G.setIndex(new THREE.BufferAttribute(I,1));G.computeBoundingSphere();return G;}
// bake every bucket into one mesh per material and side; `in` meshes are the interiors (floors, inner skins)
function hykFlush(scene){for(const side of ['out','in'])for(const k in HYK_BK[side]){const L=HYK_BK[side][k];if(!L.length)continue;
 const m=new THREE.Mesh(hykMerge(L),MAT[k]);m.name='hyk-'+side+'-'+k;m.userData.hyk=side;m.userData.interior=side==='in';m.frustumCulled=false;scene.add(m);HYK_MESHES.push(m);
 const t=tcur();if(t)t.meshes++;L.length=0;}}
// ---------------------------------------------------------------- the surface builder
// fn(u,v)->[x,y,z]. o:{hole(u,v,p)->bool drops that quad, col:Color|fn(u,v,p)->Color, uS,vS (tile repeats over the
// full u and v range; a tile is 4 m), flip (reverse the winding)}. Normals are computed from the winding.
function hykSurf(fn,nu,nv,o){o=o||{};const pos=[],uv=[],col=[],idx=[];const cols=nu+1;const base=o.col&&o.col.isColor?o.col:null;
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv;const p=fn(u,v);pos.push(p[0],p[1],p[2]);uv.push(u*(o.uS||1),v*(o.vS||1));
  const c=base||(typeof o.col==='function'?o.col(u,v,p):HYK_WHITE);col.push(c.r,c.g,c.b);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){if(o.hole){const uc=(i+.5)/nu,vc=(j+.5)/nv;if(o.hole(uc,vc,fn(uc,vc)))continue;}
  const a=j*cols+i,b=a+1,c=a+cols,d=c+1;if(o.flip)idx.push(a,b,c,b,d,c);else idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g;}
// an opening predicate for any surface: ops = [{p:[x,y,z], r, ky}] drop quads within r of the point (ky stretches vertically)
function hykHoleOf(ops){if(!ops||!ops.length)return null;return (u,v,p)=>{for(const op of ops){const dx=p[0]-op.p[0],dy=(p[1]-op.p[1])/(op.ky||1),dz=p[2]-op.p[2];if(dx*dx+dy*dy+dz*dz<op.r*op.r)return true;}return false;};}
// ---------------------------------------------------------------- lathe: the shell body
// o:{H, rFn(y), yBase, cx,cz, nu,nv, lobes:{n,amp,ph}, flute:{n,amp,sharp}, twist (rad per m), rings:{n,amp} (growth
// steps), noise:{amp,su,sv,seed}, tilt:{amp,dir} (an oblique rim: the height dips toward `dir` by amp*H), col, ops
// (openings, see hykHoleOf), flip}. Base at yBase, axis y, outward normals.
function hykLathe(o){const H=o.H,nu=o.nu||48,nv=o.nv||24,yB=o.yBase||0,cx=o.cx||0,cz=o.cz||0;
 const hAt=th=>H*(o.tilt?1-o.tilt.amp*.5*(1+Math.cos(th-(o.tilt.dir||0))):1);
 const rAt=(th,y,u)=>{let r=o.rFn(y);
  if(o.lobes)r*=1+o.lobes.amp*Math.cos(o.lobes.n*th+(o.lobes.ph||0));
  if(o.flute)r*=1+o.flute.amp*Math.pow(.5+.5*Math.cos(o.flute.n*th+(o.twist||0)*y),o.flute.sharp||2);
  if(o.rings)r*=1+o.rings.amp*Math.sin(y/H*o.rings.n*TAU);
  if(o.noise)r*=1+o.noise.amp*(fbm(u*(o.noise.su||3)+(o.noise.seed||0),y/(o.noise.sv||2),o.noise.seed||1,2)-.5)*2;
  return Math.max(0,r);};
 const fn=(u,v)=>{const th=u*TAU;const y=v*hAt(th);const r=rAt(th,y,u);return [cx+r*Math.cos(th),yB+y,cz+r*Math.sin(th)];};
 return hykSurf(fn,nu,nv,{col:o.col,uS:TAU*o.rFn(H*.5)/4,vS:H/4,flip:o.flip,hole:hykHoleOf(o.ops)});}
// a point and outward normal on a lathe at azimuth th and height y (for its openings)
function hykLatheAt(o,th,y){const cx=o.cx||0,cz=o.cz||0,yB=o.yBase||0;const r=o.rFn(y);const e=.05;const r2=o.rFn(y+e);const dr=(r2-r)/e;
 const n=new THREE.Vector3(Math.cos(th),-dr,Math.sin(th)).normalize();return {p:[cx+r*Math.cos(th),yB+y,cz+r*Math.sin(th)],n:[n.x,n.y,n.z]};}
// ---------------------------------------------------------------- pod: a superellipsoid with real openings
// o:{a,b,c (semi-axes x,y,z), e1 (vertical exponent), e2 (horizontal), cy (centre height; default sits the pod on y=0),
// squash (flatten the underside), nu,nv, noise, col, openings:[{th,el,r,ky,kind}] (th azimuth from +z toward +x, el
// elevation in radians), hollow:{t,col} (an inner skin, wound inward, for the interior)}.
// Returns {geo, inner, openings:[{p,n,r,ky,kind}], cy} with the openings resolved to points and outward normals.
function hykPod(o){const a=o.a,b=o.b,c=o.c,e1=o.e1||1,e2=o.e2||1,cy=o.cy!=null?o.cy:b*.82,nu=o.nu||56,nv=o.nv||30;const sq=o.squash||1;
 const sgn=(x,e)=>Math.sign(x)*Math.pow(Math.abs(x),e);
 const surf=(u,v,k)=>{const th=u*TAU,ph=(v-.5)*Math.PI;const cph=Math.cos(ph),sph=Math.sin(ph);const kk=k||1;
  let x=a*kk*sgn(cph,e1)*sgn(Math.sin(th),e2),z=c*kk*sgn(cph,e1)*sgn(Math.cos(th),e2),y=b*kk*sgn(sph,e1);if(y<0)y*=sq;
  if(o.noise){const n=1+o.noise.amp*(fbm(u*(o.noise.su||3)+(o.noise.seed||0),v*(o.noise.sv||2),o.noise.seed||2,2)-.5)*2;x*=n;z*=n;y*=n;}
  return [x,cy+y,z];};
 const ops=(o.openings||[]).map(op=>{const u=((op.th/TAU)%1+1)%1,v=clamp(op.el/Math.PI+.5,.02,.98);const p=surf(u,v);const d=1e-3;const pu=surf(u+d,v),pv=surf(u,v+d);
  const n=new THREE.Vector3(pu[0]-p[0],pu[1]-p[1],pu[2]-p[2]).cross(new THREE.Vector3(pv[0]-p[0],pv[1]-p[1],pv[2]-p[2])).normalize();
  if(n.dot(new THREE.Vector3(p[0],p[1]-cy,p[2]))<0)n.negate();
  return Object.assign({},op,{p,n:[n.x,n.y,n.z],ky:op.ky||1});});
 const circ=TAU*Math.max(a,c);const hole=hykHoleOf(ops);
 const geo=hykSurf((u,v)=>surf(u,v),nu,nv,{col:o.col,uS:circ/4,vS:Math.PI*b/4,hole});
 let inner=null;if(o.hollow){const k=1-(o.hollow.t||.07);inner=hykSurf((u,v)=>surf(u,v,k),nu,nv,{col:o.hollow.col||o.col,uS:circ/4,vS:Math.PI*b/4,hole,flip:true});}
 return {geo,inner,openings:ops,cy,surf};}
// ---------------------------------------------------------------- conch: a tapering tube along a log spiral
// o:{R (the aperture's tube radius), turns, g (growth), apexLift, flare, flute:{n,amp}, rings:{n,amp}, twist, nu,nv, col}.
// The spiral lies flat, whorls overlapping, rests on y=0, and ENDS at the origin with its aperture facing +z (the
// door). Returns {geo, aperture:{p,n,r}, cen(t), rho(t)}.
function hykConch(o){const R=o.R,T=o.turns||2.5,g=o.g||.8,nu=o.nu||200,nv=o.nv||26,FL=o.flare||.35;
 const rho=t=>R*Math.exp(g*T*(t-1));const flare=t=>{const k=clamp((t-.92)/.08,0,1);return 1+FL*k*k;};
 const ang=t=>-(1-t)*T*TAU;const rad=t=>rho(t)*1.3;const ax=-rad(1);
 const cen=t=>{const r=rad(t),A=ang(t);return [r*Math.cos(A)+ax,rho(t)*.96+(o.apexLift||0)*(1-t)*(1-t),r*Math.sin(A)];};
 const fn=(u,v)=>{const t=u;const C=cen(t);const C2=cen(Math.min(1,t+1e-3));let tx=C2[0]-C[0],ty=C2[1]-C[1],tz=C2[2]-C[2];const L=Math.hypot(tx,ty,tz)||1;tx/=L;ty/=L;tz/=L;
  const nx0=C[0]-ax,nz0=C[2];const nl=Math.hypot(nx0,nz0)||1;const N=[nx0/nl,0,nz0/nl];
  const B=[ty*N[2]-tz*N[1],tz*N[0]-tx*N[2],tx*N[1]-ty*N[0]];const ph=v*TAU;
  let r=rho(t)*flare(t);if(o.flute)r*=1+o.flute.amp*Math.pow(.5+.5*Math.cos(o.flute.n*ph+(o.twist||0)*t*30),1.6);
  if(o.rings)r*=1+o.rings.amp*Math.sin(t*o.rings.n*TAU);
  return [C[0]+r*(N[0]*Math.cos(ph)+B[0]*Math.sin(ph)),C[1]+r*(N[1]*Math.cos(ph)+B[1]*Math.sin(ph)),C[2]+r*(N[2]*Math.cos(ph)+B[2]*Math.sin(ph))];};
 const geo=hykSurf(fn,nu,nv,{col:o.col,uS:T*TAU*rad(.5)/4,vS:TAU*R/4,flip:o.flip,hole:hykHoleOf(o.ops)});
 const E=cen(1);return {geo,aperture:{p:[E[0],E[1],E[2]],n:[0,0,1],r:R*(1+FL)},cen,rho};}
// ---------------------------------------------------------------- tube along a polyline (parallel-transport frames)
function hykTube(pts,rFn,o){o=o||{};const seg=o.seg||10;const P=pts.map(p=>new THREE.Vector3(p[0],p[1],p[2]));const n=P.length;if(n<2)return null;
 const T=[],N=[],B=[];for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];T.push(new THREE.Vector3().subVectors(b,a).normalize());}
 let n0=new THREE.Vector3(0,1,0);if(Math.abs(n0.dot(T[0]))>.9)n0.set(1,0,0);n0.sub(T[0].clone().multiplyScalar(n0.dot(T[0]))).normalize();N.push(n0);
 for(let i=1;i<n;i++){const prev=N[i-1];const nn=prev.clone().sub(T[i].clone().multiplyScalar(prev.dot(T[i])));if(nn.lengthSq()<1e-8)nn.copy(prev);N.push(nn.normalize());}
 for(let i=0;i<n;i++)B.push(new THREE.Vector3().crossVectors(T[i],N[i]).normalize());
 let Lt=0;for(let i=1;i<n;i++)Lt+=P[i].distanceTo(P[i-1]);
 const fn=(u,v)=>{const i=Math.min(n-1,Math.round(u*(n-1)));const r=rFn(u,i);const ph=v*TAU;const C=P[i];
  return [C.x+r*(N[i].x*Math.cos(ph)+B[i].x*Math.sin(ph)),C.y+r*(N[i].y*Math.cos(ph)+B[i].y*Math.sin(ph)),C.z+r*(N[i].z*Math.cos(ph)+B[i].z*Math.sin(ph))];};
 return hykSurf(fn,n-1,seg,{col:o.col,uS:Lt/4,vS:TAU*rFn(.5,0)/4,flip:o.flip});}
// a bone-rib: a parabola from a to b with `rise`, thick at the springing (r0), thinner at the crown (r1), knuckled
function hykRib(a,b,o){o=o||{};const n=o.n||18;const pts=[];for(let i=0;i<=n;i++){const t=i/n;pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+(o.rise!=null?o.rise:4)*4*t*(1-t),a[2]+(b[2]-a[2])*t]);}
 const r0=o.r0||.5,r1=o.r1!=null?o.r1:r0*.7,kn=o.knuckles||0;
 return hykTube(pts,t=>{let r=r0+(r1-r0)*Math.sin(t*Math.PI);if(kn)r*=1+.2*Math.max(0,Math.cos(t*kn*TAU));return r;},{seg:o.seg||10,col:o.col});}
// ---------------------------------------------------------------- fillet: roots a shell into a face or the ground
// c = the contact centre on the face, n = the face normal (pointing toward the shell), R = the contact radius, f = the
// fillet's reach. A quarter circle from (R+f on the face) to (R, f out), concave, with a little wobble.
function hykFlare(c,n,R,f,o){o=o||{};const N=new THREE.Vector3(n[0],n[1],n[2]).normalize();let E1=new THREE.Vector3(0,1,0);if(Math.abs(E1.dot(N))>.9)E1.set(1,0,0);E1.sub(N.clone().multiplyScalar(E1.dot(N))).normalize();const E2=new THREE.Vector3().crossVectors(N,E1);
 const fn=(u,v)=>{const th=u*TAU;const s=v*Math.PI/2;const r=(R+f*(1-Math.sin(s)))*(1+(o.wobble!=null?o.wobble:.04)*Math.sin(th*5+v*3)),off=f*(1-Math.cos(s));
  return [c[0]+E1.x*r*Math.cos(th)+E2.x*r*Math.sin(th)+N.x*off,c[1]+E1.y*r*Math.cos(th)+E2.y*r*Math.sin(th)+N.y*off,c[2]+E1.z*r*Math.cos(th)+E2.z*r*Math.sin(th)+N.z*off];};
 return hykSurf(fn,o.nu||40,o.nv||8,{col:o.col,uS:TAU*R/4,vS:f/4,flip:o.flip!==undefined?o.flip:true});}
// ---------------------------------------------------------------- disc: floors, landings, lily pads (normal up unless o.down)
function hykDisc(cx,y,cz,R,o){o=o||{};const nu=o.nu||32,lob=o.lobes;
 const fn=(u,v)=>{const th=u*TAU;let r=R*v;if(lob)r*=1+lob.amp*Math.cos(lob.n*th)*v;return [cx+r*Math.cos(th),y+(o.sag||0)*(1-v*v),cz+r*Math.sin(th)];};
 return hykSurf(fn,nu,o.nv||3,{col:o.col,uS:TAU*R/4,vS:R/4,flip:!o.down});}
// a ribbon deck along a polyline (a bridge, a walkway): width w, normal up
function hykDeck(pts,w,o){o=o||{};const P=pts.map(p=>new THREE.Vector3(p[0],p[1],p[2]));const n=P.length;
 const fn=(u,v)=>{const i=Math.min(n-1,Math.round(u*(n-1)));const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];const t=new THREE.Vector3().subVectors(b,a);t.y=0;t.normalize();const r=new THREE.Vector3(-t.z,0,t.x);
  const s=(v-.5)*w;const C=P[i];return [C.x+r.x*s,C.y+(o.camber||0)*(1-4*(v-.5)*(v-.5)),C.z+r.z*s];};
 let L=0;for(let i=1;i<n;i++)L+=P[i].distanceTo(P[i-1]);
 return hykSurf(fn,n-1,o.nv||2,{col:o.col,uS:L/4,vS:w/4,flip:o.flip!==undefined?o.flip:true});}
