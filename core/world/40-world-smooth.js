// ================================================================= OPEN WORLD — smoothing: the land's linear artifacts
// [G data] Plain functions on arrays: no THREE, no DOM, no canvas, no Math.random. The scale model's 2 km pixels show
// through the open world's land as three kinds of linear artifact (core/world/README.md, "Smoothing"):
//   - staircases along scarps and ridges: a diagonal edge on the model is a run of pixel steps, and upsampling keeps it;
//   - streaks along the grid's rows and columns;
//   - ruler-straight river cuts: rivers carved along their polylines' straight segments.
// A region opts in (openworld/SITES.json "smooth": true): tools/scale-model/extract_region.py --smooth runs heights()
// on the upsampled grid before its synthesis and carves its rivers along river(), through core/world/smooth.py; the
// runtime (41-world-fields.js) reads region.json's `smooth` record and carves the same river() curves, and line()s the
// drainage network.
//
//   WSMOOTH.heights(E, nx, ny, o)  a new Float64Array: E smoothed ALONG its contours, never across them, so a real
//                                  cliff keeps its profile and only the steps in its edge are filled. Direction-free:
//                                  the orientation is the structure tensor's (isotropic Gaussians), the smoothing a
//                                  line integral down the contour's own curve (a streamline), so no axis or 45-degree
//                                  bias. o: {px: cells per model pixel (4), cell: m (500), pre, rho, len (model
//                                  pixels: .5, 3, 4), iters (2), step (cells, 1), minSlope (m/m, .004)}
//   WSMOOTH.curve(P, o)            centripetal Catmull-Rom through the vertices P ([x, z, extra...]), sampled every
//                                  o.step m; the extras are interpolated along each segment. With o.meander
//                                  {amp, wave (m), seed, ox, oz} a seeded lateral wander (KRAND value noise at the
//                                  world-absolute point (x + ox, z + oz), so two cuts of one river agree), zero at every
//                                  vertex: the curve still passes through the model's own vertices
//   WSMOOTH.river(P, o)            a named river's curve: curve() with its meander from its width
//                                  (o: {width, name, ox, oz, step, meander: false to leave it out, seed, relax: passes
//                                  of 1-2-1 over a traced river's vertices first, each moved at most cap m (400)})
//   WSMOOTH.line(P, o)             a derived line (the D8 drainage network, which zigzags along rows and diagonals):
//                                  its vertices relaxed (o.relax passes of 1-2-1, the ends kept) then curve()
//
// Determinism: curve(), river() and line() are +, -, *, /, sqrt and floor (KRAND's integer hash for the meander), so
// a port gives the same points. heights() also takes Math.exp for its Gaussian weights; it runs at the cut, whose output
// is quantised to 16 bits (elev.png), never in a page.
var WSMOOTH=(function(){'use strict';
const S={version:1};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

// ---------------------------------------------------------------- the grid's helpers
// a separable Gaussian, renormalised over the taps inside the grid (so the edges are not pulled toward a border value).
// A Gaussian is the one kernel both separable and round, so the blur has no axis bias
function gauss(A,nx,ny,sigma){const out=new Float64Array(nx*ny);if(!(sigma>0)){out.set(A);return out;}
 const r=Math.max(1,Math.ceil(3*sigma)),w=new Float64Array(2*r+1);for(let k=-r;k<=r;k++)w[k+r]=Math.exp(-k*k/(2*sigma*sigma));
 const tmp=new Float64Array(nx*ny);
 for(let j=0;j<ny;j++){const o=j*nx;for(let i=0;i<nx;i++){let s=0,ws=0;const a=Math.max(-r,-i),b=Math.min(r,nx-1-i);
   for(let k=a;k<=b;k++){s+=w[k+r]*A[o+i+k];ws+=w[k+r];}tmp[o+i]=s/ws;}}
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){let s=0,ws=0;const a=Math.max(-r,-j),b=Math.min(r,ny-1-j);
   for(let k=a;k<=b;k++){s+=w[k+r]*tmp[(j+k)*nx+i];ws+=w[k+r];}out[j*nx+i]=s/ws;}
 return out;}
// bilinear and Catmull-Rom samples at (u, v) in cells, clamped to the grid
function bil(A,nx,ny,u,v){u=clamp(u,0,nx-1.000001);v=clamp(v,0,ny-1.000001);const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*nx+i;
 return (A[o]*(1-fu)+A[o+1]*fu)*(1-fv)+(A[o+nx]*(1-fu)+A[o+nx+1]*fu)*fv;}
function cr(p0,p1,p2,p3,t){return p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));}
function bic(A,nx,ny,u,v){u=clamp(u,0,nx-1);v=clamp(v,0,ny-1);const i=Math.min(Math.floor(u),nx-2),j=Math.min(Math.floor(v),ny-2),fu=u-i,fv=v-j;
 const row=jj=>{const o=clamp(jj,0,ny-1)*nx,I=k=>A[o+clamp(i+k,0,nx-1)];return cr(I(-1),I(0),I(1),I(2),fu);};
 return cr(row(j-1),row(j),row(j+1),row(j+2),fv);}
// the cubic B-spline's coefficients of a grid (Unser's recursive filter, pole sqrt(3) - 2, the edges mirrored), so the
// B-spline through them interpolates the grid: rows, then columns
function bs1(s,o,stride,n){if(n<2)return;const z=Math.sqrt(3)-2;
 for(let i=0;i<n;i++)s[o+i*stride]*=6;
 let zn=z,sum=s[o];const K=Math.min(n-1,40);for(let k=1;k<=K;k++){sum+=zn*s[o+k*stride];zn*=z;}s[o]=sum;
 for(let i=1;i<n;i++)s[o+i*stride]+=z*s[o+(i-1)*stride];
 s[o+(n-1)*stride]=(z/(z*z-1))*(z*s[o+(n-2)*stride]+s[o+(n-1)*stride]);
 for(let i=n-2;i>=0;i--)s[o+i*stride]=z*(s[o+(i+1)*stride]-s[o+i*stride]);}
function bspline(A,nx,ny){const C=Float64Array.from(A);for(let j=0;j<ny;j++)bs1(C,j*nx,1,nx);for(let i=0;i<nx;i++)bs1(C,i,nx,ny);return C;}
S.gauss=gauss;S.bic=bic;

// ---------------------------------------------------------------- the heights: smoothing along the contours
// One pass: the structure tensor J = G_rho * (grad G_pre*E)(grad G_pre*E)^T gives at every cell the contour's direction
// (J's minor eigenvector) and how sure it is (coherence (mu1 - mu2) / (mu1 + mu2), 0 on a peak or a flat, 1 on a straight
// slope); the integration scale rho spans a model pixel and more, so a staircase reads as the edge it stands for. The new
// height is the weighted mean of the heights down the streamline through the cell (followed both ways for len, midpoint
// steps, the direction read from the tensor at every step so it bends with the contour; weights (1 - (s/len)^2)^2),
// blended in by coherence^2 and by how steep the cell is (a flat's orientation is noise). Across the contour nothing
// moves, so a cliff keeps its profile.
function pass(E,nx,ny,o){
 const G=gauss(E,nx,ny,o.pre),gx=new Float64Array(nx*ny),gz=new Float64Array(nx*ny);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*nx+i;
  const l=i>0?G[k-1]:G[k],r=i<nx-1?G[k+1]:G[k],u=j>0?G[k-nx]:G[k],d=j<ny-1?G[k+nx]:G[k];
  gx[k]=(r-l)/((i>0&&i<nx-1)?2:1);gz[k]=(d-u)/((j>0&&j<ny-1)?2:1);}
 const a0=new Float64Array(nx*ny),b0=new Float64Array(nx*ny),c0=new Float64Array(nx*ny);
 for(let k=0;k<nx*ny;k++){a0[k]=gx[k]*gx[k];b0[k]=gx[k]*gz[k];c0[k]=gz[k]*gz[k];}
 const Ja=gauss(a0,nx,ny,o.rho),Jb=gauss(b0,nx,ny,o.rho),Jc=gauss(c0,nx,ny,o.rho);
 const T2=o.slope*o.slope,N=nx*ny,out=new Float64Array(N),L=o.len,h=o.step,n=Math.max(1,Math.ceil(L/h));
 // per cell: the contour's direction (TX, TZ: the tensor's minor eigenvector, a unit vector, its sign arbitrary) and the
 // pass's strength there (ST: coherence^2, faded where the ground is flatter than minSlope)
 const TX=new Float64Array(N),TZ=new Float64Array(N),ST=new Float64Array(N);
 for(let k=0;k<N;k++){const a=Ja[k],b=Jb[k],c=Jc[k],tr=a+c;if(!(tr>1e-12))continue;
  const df=Math.sqrt((a-c)*(a-c)+4*b*b),m1=(tr+df)/2;let ex,ez;
  if(Math.abs(m1-c)>=Math.abs(m1-a)){ex=m1-c;ez=b;}else{ex=b;ez=m1-a;}   /* the major eigenvector (across the contour) */
  const nn=Math.sqrt(ex*ex+ez*ez);if(!(nn>1e-300))continue;TX[k]=-ez/nn;TZ[k]=ex/nn;const coh=df/tr;ST[k]=coh*coh*(tr/(tr+T2));}
 // the direction at (u, v): the four cells' directions, each turned to agree with (px, pz), blended bilinearly; into tv
 const tv=new Float64Array(2);
 const tan=(u,v,px,pz)=>{const i=u>=nx-1?nx-2:u|0,j=v>=ny-1?ny-2:v|0,fu=u-i,fv=v-j,o=j*nx+i;
  let x=0,z=0,w,t;
  w=(1-fu)*(1-fv);t=TX[o]*px+TZ[o]*pz<0?-w:w;x+=t*TX[o];z+=t*TZ[o];
  w=fu*(1-fv);t=TX[o+1]*px+TZ[o+1]*pz<0?-w:w;x+=t*TX[o+1];z+=t*TZ[o+1];
  w=(1-fu)*fv;t=TX[o+nx]*px+TZ[o+nx]*pz<0?-w:w;x+=t*TX[o+nx];z+=t*TZ[o+nx];
  w=fu*fv;t=TX[o+nx+1]*px+TZ[o+nx+1]*pz<0?-w:w;x+=t*TX[o+nx+1];z+=t*TZ[o+nx+1];
  const m=Math.sqrt(x*x+z*z);if(!(m>1e-9))return false;tv[0]=x/m;tv[1]=z/m;return true;};
 // the height at (u, v) inside the grid by the interpolating cubic B-spline (its coefficients CF: bspline() below): exact at
 // the cells and far closer between them than Catmull-Rom, whose error on a steep scarp is zero along the axes and some
 // metres between them, which would be an axis bias of its own. Inlined: this is the pass's inner loop
 const CF=bspline(E,nx,ny);
 const val=(u,v)=>{let i=u|0,j=v|0;if(i>nx-2)i=nx-2;if(j>ny-2)j=ny-2;const fu=u-i,fv=v-j;
  const gu=1-fu,gv=1-fv,u3=fu*fu*fu,v3=fv*fv*fv;
  const a0=gu*gu*gu/6,a1=(3*u3-6*fu*fu+4)/6,a2=(-3*u3+3*fu*fu+3*fu+1)/6,a3=u3/6;
  const b0=gv*gv*gv/6,b1=(3*v3-6*fv*fv+4)/6,b2=(-3*v3+3*fv*fv+3*fv+1)/6,b3=v3/6;
  const i0=i>0?i-1:1,i3=i+2<nx?i+2:2*nx-4-i;let s=0;   /* mirrored at the edges, as the coefficients are */
  for(let q=0;q<4;q++){let jj=j-1+q;if(jj<0)jj=-jj;else if(jj>ny-1)jj=2*ny-2-jj;const r=jj*nx;
   s+=(q===0?b0:q===1?b1:q===2?b2:b3)*(a0*CF[r+i0]+a1*CF[r+i]+a2*CF[r+i+1]+a3*CF[r+i3]);}
  return s;};
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*nx+i,st=ST[k];
  if(st<1e-4){out[k]=E[k];continue;}
  let s=E[k],ws=1;
  for(let sg=1;sg>=-1;sg-=2){
   let dx=TX[k]*sg,dz=TZ[k]*sg,u=i,v=j;
   for(let q=1;q<=n;q++){
    const hu=u+dx*h*.5,hv=v+dz*h*.5;if(hu<0||hv<0||hu>nx-1||hv>ny-1)break;
    if(!tan(hu,hv,dx,dz))break;const mx=tv[0],mz=tv[1];
    u+=mx*h;v+=mz*h;if(u<0||v<0||u>nx-1||v>ny-1)break;
    const t=q*h/L,w=(1-t*t)*(1-t*t);if(!(t<1))break;
    s+=w*val(u,v);ws+=w;
    if(!tan(u,v,mx,mz))break;dx=tv[0];dz=tv[1];}}
  out[k]=E[k]+st*(s/ws-E[k]);}
 return out;}
S.heights=function(E,nx,ny,o){o=o||{};const px=o.px==null?4:o.px,cell=o.cell==null?500:o.cell;
 const P={pre:(o.pre==null?.5:o.pre)*px,rho:(o.rho==null?3:o.rho)*px,len:(o.len==null?4:o.len)*px,step:o.step==null?1:o.step,
  slope:(o.minSlope==null?.004:o.minSlope)*cell};
 let A=Float64Array.from(E);const it=o.iters==null?2:o.iters;
 for(let k=0;k<it;k++)A=pass(A,nx,ny,P);
 return A;};

// ---------------------------------------------------------------- the curves: rivers and the drainage
// Centripetal Catmull-Rom (alpha 1/2: no cusps or loops however unevenly the vertices are spaced) through every vertex.
// Each segment P1-P2 takes its neighbours P0, P3 (an end mirrors its one neighbour). The extras ([2..]) are linear in
// the segment's fraction. Returns [[x, z, extra...]], the first vertex first and the last last.
function dedupe(P){const Q=[];for(const p of P){const q=Q[Q.length-1];if(!q||Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])>1e-6)Q.push(p);}return Q;}
S.curve=function(P,o){o=o||{};const step=o.step==null?100:o.step,M=o.meander||null;P=dedupe(P);
 if(P.length<2)return P.map(p=>p.slice());
 const n=P.length,ne=P[0].length,pt=i=>i<0?[2*P[0][0]-P[1][0],2*P[0][1]-P[1][1]]:i>=n?[2*P[n-1][0]-P[n-2][0],2*P[n-1][1]-P[n-2][1]]:P[i];
 const base=[],seg=[],frac=[];
 for(let i=0;i<n-1;i++){const p0=pt(i-1),p1=P[i],p2=P[i+1],p3=pt(i+2);
  const d=(a,b)=>Math.sqrt(Math.sqrt((b[0]-a[0])*(b[0]-a[0])+(b[1]-a[1])*(b[1]-a[1])))||1e-6;
  const t0=0,t1=t0+d(p0,p1),t2=t1+d(p1,p2),t3=t2+d(p2,p3);
  const chord=Math.sqrt((p2[0]-p1[0])*(p2[0]-p1[0])+(p2[1]-p1[1])*(p2[1]-p1[1])),m=Math.max(1,Math.ceil(chord/step));
  for(let q=0;q<m;q++){const f=q/m,t=t1+(t2-t1)*f,xy=[0,0];
   for(let c=0;c<2;c++){const A1=(t1-t)/(t1-t0)*p0[c]+(t-t0)/(t1-t0)*p1[c],A2=(t2-t)/(t2-t1)*p1[c]+(t-t1)/(t2-t1)*p2[c],A3=(t3-t)/(t3-t2)*p2[c]+(t-t2)/(t3-t2)*p3[c];
    const B1=(t2-t)/(t2-t0)*A1+(t-t0)/(t2-t0)*A2,B2=(t3-t)/(t3-t1)*A2+(t-t1)/(t3-t1)*A3;xy[c]=(t2-t)/(t2-t1)*B1+(t-t1)/(t2-t1)*B2;}
   const r=[xy[0],xy[1]];for(let e=2;e<ne;e++)r.push(p1[e]+(p2[e]-p1[e])*f);base.push(r);seg.push(i);frac.push(f);}}
 base.push(P[n-1].slice());seg.push(n-1);frac.push(0);
 if(!M||!(M.amp>0))return base;
 // the meander: along the curve's normal, value noise at the world-absolute point, times (4f(1-f))^2 in each segment
 // (0 with a level tangent at every vertex, so the curve stays smooth through the vertices it keeps)
 const out=[];const N=base.length;
 for(let k=0;k<N;k++){const a=base[Math.max(0,k-1)],b=base[Math.min(N-1,k+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const L=Math.sqrt(tx*tx+tz*tz);
  const f=frac[k],env=16*f*f*(1-f)*(1-f),p=base[k],r=p.slice();
  if(L>0&&env>0){tx/=L;tz/=L;const nv=2*KRAND.vnoise((p[0]+(M.ox||0))/M.wave,(p[1]+(M.oz||0))/M.wave,.5,M.seed>>>0)-1,off=M.amp*nv*env;
   r[0]=p[0]-tz*off;r[1]=p[1]+tx*off;}
  out.push(r);}
 return out;};
// a river's meander from its width: an amplitude of about its width (10..60 m) on a wavelength of 15 widths (1.2..2.4 km),
// seeded by its id (KRAND.child), so every cut of the river wanders the same way
S.river=function(P,o){o=o||{};const w=o.width==null?60:o.width;
 const M=o.meander===false?null:{amp:clamp(w*.8,10,60),wave:clamp(w*15,1200,2400),seed:KRAND.child(o.seed==null?0x5EED:o.seed,'river:'+(o.name||'')),ox:o.ox||0,oz:o.oz||0};
 return S.curve(o.relax?relax(dedupe(P),o.relax,o.cap==null?400:o.cap):P,{step:o.step==null?100:o.step,meander:M});};
// passes of 1-2-1 over the vertices, the ends kept, each vertex moved at most cap m from where it was: a traced river (the
// model's own path, on its pixel grid in axis and diagonal moves) loses its zigzag and stays in its valley
function relax(P,k,cap){let Q=P.map(p=>p.slice());
 for(let it=0;it<k&&Q.length>2;it++){const R=[Q[0]];for(let i=1;i<Q.length-1;i++){const r=Q[i].slice();r[0]=(Q[i-1][0]+2*Q[i][0]+Q[i+1][0])/4;r[1]=(Q[i-1][1]+2*Q[i][1]+Q[i+1][1])/4;R.push(r);}R.push(Q[Q.length-1]);Q=R;}
 if(cap!=null)for(let i=0;i<Q.length;i++){const dx=Q[i][0]-P[i][0],dz=Q[i][1]-P[i][1],d=Math.sqrt(dx*dx+dz*dz);if(d>cap){Q[i][0]=P[i][0]+dx*cap/d;Q[i][1]=P[i][1]+dz*cap/d;}}
 return Q;}
S.line=function(P,o){o=o||{};return S.curve(relax(dedupe(P),o.relax==null?2:o.relax,null),{step:o.step==null?250:o.step});};
return S;})();
if(typeof module!=='undefined')module.exports=WSMOOTH;
