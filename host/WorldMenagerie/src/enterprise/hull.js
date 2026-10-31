// ---------- Galaxy class: the hull as surfaces ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used.
//
// Every part of the hull is a function from (u, v) in the unit square to a point, built from the measured tables in
// dims.js, and every mesh, every texture and every light fitted to the hull is made by calling those functions:
// the saucer's top and underside (u round, v out from the centre), its rim, and the lofted parts (the engineering
// hull, the neck, the nacelles, the pylons), each a cross-section swept along a table of stations. Because a
// texture is painted by asking the same function where each of its texels is, a deck of windows on the neck lines
// up with the same deck on the engineering hull, and a panel line runs on across a join.
//
// The tables are smoothed with a monotone cubic, never joined with straight lines: a hull lofted through straight
// segments shows every station as a crease the moment the light rakes across it.
import {SAUCER,ENG,NECK,PYLON,NACELLE,DEFLECTOR} from './dims.js';

export const clamp=(x,a,b)=>x<a?a:x>b?b:x;
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const spow=(x,p)=>x<0?-Math.pow(-x,p):Math.pow(x,p);

// A monotone cubic (Fritsch and Carlson) through [[x, y], ...]: smooth, and it never overshoots a table, so a hull
// never bulges past the drawing between two stations.
export function mono(tbl){
  const T=tbl[0][0]>tbl[tbl.length-1][0]?[...tbl].reverse():tbl;
  const n=T.length,X=T.map(r=>r[0]),Y=T.map(r=>r[1]),d=[],m=new Array(n);
  for(let i=0;i<n-1;i++)d.push((Y[i+1]-Y[i])/(X[i+1]-X[i]));
  m[0]=d[0];m[n-1]=d[n-2];
  for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
  for(let i=0;i<n-1;i++){
    if(d[i]===0){m[i]=m[i+1]=0;continue;}
    const a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b;
    if(s>9){const t=3/Math.sqrt(s);m[i]=t*a*d[i];m[i+1]=t*b*d[i];}
  }
  return x=>{
    if(x<=X[0])return Y[0];if(x>=X[n-1])return Y[n-1];
    let lo=0,hi=n-1;while(hi-lo>1){const k=(lo+hi)>>1;if(X[k]>x)hi=k;else lo=k;}
    const h=X[hi]-X[lo],t=(x-X[lo])/h,t2=t*t,t3=t2*t;
    return (2*t3-3*t2+1)*Y[lo]+(t3-2*t2+t)*h*m[lo]+(-2*t3+3*t2)*Y[hi]+(t3-t2)*h*m[hi];};
}
// one monotone cubic per column of a table of stations
const columns=(rows,k)=>mono(rows.map(r=>[r[0],r[k]]));

// ---------- the saucer ----------
const A=SAUCER.a,B=SAUCER.b;
const topF=mono(SAUCER.top),botF=mono(SAUCER.bot),tailF=mono(SAUCER.tail);
export const ell=(x,z)=>Math.sqrt((x/A)*(x/A)+(z/B)*(z/B));
// the plan: the half-width of the saucer at x
export function halfBeam(x){
  if(x>=A||x<=-204)return 0;
  const el=B*Math.sqrt(Math.max(0,1-(x/A)*(x/A)));
  if(x>-110)return el;
  const tl=tailF(x);
  return x<-125?tl:tl+(el-tl)*(x+125)/15;
}
// where a ray out from the centre at angle a (0 is the bow, pi/2 starboard) leaves the plan
const RHO=new Float64Array(2049);
for(let i=0;i<=2048;i++){
  const a=i/2048*Math.PI*2,c=Math.cos(a),s=Math.abs(Math.sin(a));
  let lo=0,hi=260;
  for(let k=0;k<40;k++){const r=(lo+hi)/2,w=halfBeam(r*c);if(w>0&&r*s<=w)lo=r;else hi=r;}
  RHO[i]=lo;
}
export function rho(a){
  const f=(((a/(Math.PI*2))%1)+1)%1*2048,i=Math.floor(f),t=f-i;
  return RHO[i]+(RHO[Math.min(2048,i+1)]-RHO[i])*t;
}
// The dorsal: a plate round the bridge lifted clear of the dish, a stem running aft from it, and the bridge on
// top; aft, the impulse deck stands up out of the trailing edge.
const BR=SAUCER.bridge;
function dorsal(x,z){
  const db=Math.hypot(x-BR.x,z);
  let lift=BR.lift*(1-smooth(BR.r*0.45,BR.r+8,db));
  if(x<BR.x){
    const t=clamp((BR.stemFrom-x)/(BR.stemFrom-BR.stemTo),0,1),hw=BR.stemW0+(BR.stemW1-BR.stemW0)*t;
    lift=Math.max(lift,BR.lift*smooth(BR.stemTo-12,BR.stemTo+10,x)*(1-smooth(hw*0.35,hw+8,Math.abs(z))));
  }
  return lift;
}
const impulseDeck=(x,z)=>3.4*smooth(-148,-192,x)*(1-smooth(52,78,Math.abs(z)));
export function saucerTop(x,z){return topF(Math.min(1,ell(x,z)))+impulseDeck(x,z)+dorsal(x,z);}
export function saucerBot(x,z){
  let y=botF(Math.min(1,ell(x,z)));
  const S=SAUCER.sensor,r=Math.hypot(x-S.x,z);
  if(r<S.r)y-=S.depth*Math.sqrt(1-(r/S.r)*(r/S.r));
  const Y=SAUCER.yacht,xc=(Y.x0+Y.x1)/2,q=Math.pow((x-xc)/((Y.x0-Y.x1)/2),2)+Math.pow(z/Y.w,2);
  if(q<1)y-=Y.depth*Math.sqrt(1-q);
  return y;
}
// the slope of the dish (metres of height for a metre out), for the decks of windows
export function saucerSlope(x,z,top){
  const f=top?saucerTop:saucerBot,e=0.5;
  return Math.hypot(f(x+e,z)-f(x-e,z),f(x,z+e)-f(x,z-e))/(2*e);
}
// the surfaces: u round from the bow towards starboard, v out from the centre (0) to the rim (1)
export function saucerSurf(top){
  const h=top?saucerTop:saucerBot;
  return (u,v,p)=>{const a=u*Math.PI*2,r=rho(a)*v;p.x=r*Math.cos(a);p.z=r*Math.sin(a);p.y=h(p.x,p.z);};
}
// the rim: a band round the edge, from the top surface's edge (v 0) to the underside's (v 1), bulging out a metre
const RIMB=1.1;
export function rimSurf(u,v,p){
  const a=u*Math.PI*2,r=rho(a),x=r*Math.cos(a),z=r*Math.sin(a);
  const da=0.002,r1=rho(a+da),r0=rho(a-da);
  let tx=r1*Math.cos(a+da)-r0*Math.cos(a-da),tz=r1*Math.sin(a+da)-r0*Math.sin(a-da);
  const tl=Math.hypot(tx,tz)||1;tx/=tl;tz/=tl;
  const yT=saucerTop(x,z),yB=saucerBot(x,z),b=RIMB*Math.sin(Math.PI*v);
  p.x=x+tz*b;p.z=z-tx*b;p.y=yT+(yB-yT)*v;
}

// ---------- the engineering hull ----------
// [d, top D, bottom D, widest-line D, half-width], closed off at both ends
const ENGT=[[310.5,89,93,91,0.4],...ENG,[611.5,105,113,110,0.4]];
const eTop=columns(ENGT,1),eBot=columns(ENGT,2),eWid=columns(ENGT,3),eHw=columns(ENGT,4);
export const D0=ENGT[0][0],D1=ENGT[ENGT.length-1][0];
const toX=d=>192-d,toY=D=>36-D;
// The deflector sits in a flat housing let into the hull's nose: every point of the nose inside the dish's ellipse
// (and a collar round it) is pushed back onto the dish's plane, which leans so the dish looks forward and down.
const DF=DEFLECTOR,DT=Math.tan(DF.tilt);
export const deflPlane=y=>DF.x+(y-DF.y)*DT;
function deflect(p){
  const q=Math.pow((p.y-DF.y)/DF.ry,2)+Math.pow(p.z/DF.rz,2);
  if(q>1.6)return;
  // inside the dish's ellipse the hull steps back further, into the well the dish sits in
  const w=1-smooth(1.15,1.6,q),xp=deflPlane(p.y)-(DF.depth+1.2)*(1-smooth(0.9,1.0,q));
  if(p.x>xp)p.x-=w*(p.x-xp);
}
export function engSection(d,phi,p){
  const yt=toY(eTop(d)),yb=toY(eBot(d)),yw=toY(eWid(d)),hw=eHw(d);
  const c=Math.cos(phi),s=Math.sin(phi);
  p.x=toX(d);p.z=hw*spow(c,0.82);
  p.y=s>=0?yw+(yt-yw)*Math.pow(s,0.9):yw-(yw-yb)*Math.pow(-s,0.78);
}
// u along the hull from its nose (0) to its stern (1), v round it from starboard, over the top
export function engSurf(u,v,p){
  // the stations bunch at the two ends, where the hull closes
  const t=0.5-0.5*Math.cos(Math.PI*u);
  engSection(D0+(D1-D0)*(0.35*u+0.65*t),v*Math.PI*2,p);deflect(p);
}

// ---------- the neck ----------
// Levels from inside the engineering hull (u 0) up into the saucer (u 1); at each, the plan is a stadium from the
// leading edge (which leans forward as it rises) back to where the sloping back comes down to that level.
const NY0=-66,NY1=-2;
const nW=mono(NECK.width),nAft=mono(NECK.top.map(([x,y])=>[y,x]));
const [[lx0,ly0],[lx1,ly1]]=NECK.lead,LS=(lx1-lx0)/(ly1-ly0);
export function neckSurf(u,v,p){
  const y=NY0+(NY1-NY0)*u,xl=lx0+(y-ly0)*LS,xa=Math.min(nAft(y),xl-30),L=xl-xa,W=nW(y);
  const a=v*Math.PI*2,t=(1-Math.cos(a))/2,side=Math.sin(a)>=0?1:-1;
  const fr=Math.min(0.45,W*0.9/L),ar=Math.min(0.45,W*1.3/L);
  const k=Math.sqrt(Math.max(0,1-Math.pow(Math.max(0,1-t/fr),2)))*Math.sqrt(Math.max(0,1-Math.pow(Math.max(0,1-(1-t)/ar),2)));
  p.x=xl-t*L;p.y=y;p.z=side*W*k;
}

// ---------- the nacelles ----------
const NST=[[393.5,0.6,0.5],...NACELLE.st,[643.4,0.5,0.4]];
const nHw=columns(NST,1),nHh=columns(NST,2);
export const ND0=NST[0][0],ND1=NST[NST.length-1][0];
export const NACZ=NACELLE.z,NACY=NACELLE.y;
// phi round the section from outboard over the top; `side` +1 is the starboard nacelle
export function nacSection(d,phi,side,p){
  const e=2/NACELLE.n,c=Math.cos(phi),s=Math.sin(phi);
  p.x=toX(d);p.y=NACY+nHh(d)*spow(s,e);p.z=side*(NACZ+nHw(d)*spow(c,e));
}
// the height fraction of a point of a section (-1 bottom to 1 top) back to phi on the outboard (o) or inboard face
export const nacPhi=(f,inboard)=>{const s=spow(clamp(f,-1,1),NACELLE.n/2),a=Math.asin(clamp(s,-1,1));return inboard?Math.PI-a:a;};
export function nacSurf(side){
  return (u,v,p)=>{const t=0.5-0.5*Math.cos(Math.PI*u);nacSection(ND0+(ND1-ND0)*(0.4*u+0.6*t),v*Math.PI*2,side,p);};
}
export const nacHalf=d=>[nHw(d),nHh(d)];

// ---------- the pylons ----------
// A U in the front view: out level from the engineering hull, round a bend and up into the nacelle's underside;
// the section is a symmetric aerofoil, its chord fore and aft.
const PL=PYLON,PZ0=24,LEVEL=PL.zBend-PZ0,ARC=PL.rBend*Math.PI/2,UP=(PL.yTop+8)-(PL.y+PL.rBend),PLEN=LEVEL+ARC+UP;
function pylonPath(s,o){ // s in metres along the path: o = [z, y, tz, ty]
  if(s<LEVEL){o[0]=PZ0+s;o[1]=PL.y;o[2]=1;o[3]=0;return;}
  s-=LEVEL;
  if(s<ARC){const a=s/PL.rBend;o[0]=PL.zBend+PL.rBend*Math.sin(a);o[1]=PL.y+PL.rBend-PL.rBend*Math.cos(a);o[2]=Math.cos(a);o[3]=Math.sin(a);return;}
  s-=ARC;o[0]=PL.zBend+PL.rBend;o[1]=PL.y+PL.rBend+s;o[2]=0;o[3]=1;
}
const aero=c=>5*(0.2969*Math.sqrt(c)-0.126*c-0.3516*c*c+0.2843*c*c*c-0.1036*c*c*c*c)/0.6; // NACA 00xx, 1 at its thickest
export function pylonSurf(side){
  const o=[0,0,0,0];
  return (u,v,p)=>{
    const s=u*PLEN;pylonPath(s,o);
    const f=s/PLEN,fa=smooth(0.72,1,f);
    const xl=PL.root[0]+(PL.tip[0]-PL.root[0])*f+(PL.fair[0]-PL.tip[0])*fa,xt=PL.root[1]+(PL.tip[1]-PL.root[1])*f+(PL.fair[1]-PL.tip[1])*fa;
    const a=v*Math.PI*2,c=(1+Math.cos(a))/2,sd=Math.sin(a)>=0?1:-1;
    // thicker at both ends, where it is faired into the hull and into the nacelle
    const th=PL.t/2*(1+0.9*(1-smooth(0,0.2,f))+1.6*fa)*aero(c)*sd;
    // the section's thickness is across the path, in the front view's plane
    p.x=xl+(xt-xl)*c;p.z=side*(o[0]-o[3]*th);p.y=o[1]+o[2]*th;
  };
}

// ---------- the bridge module ----------
// u round it from the bow, v from its foot (0) up the wall (to 0.4) and over the dome to the top (1). Its foot
// follows the plate under it; the wall's top and the dome are level.
const MD=SAUCER.module;
export const MODTOP=topF(ell(MD.x,0))+BR.lift+MD.wall;
export function bridgeSurf(u,v,p){
  const a=u*Math.PI*2,c=Math.cos(a),s=Math.sin(a),e=2/MD.n;
  const fx=(c>=0?MD.fore:MD.aft)*spow(c,e),fz=MD.half*spow(s,e);
  if(v<0.4){const t=v/0.4,k=1-0.07*t,yb=saucerTop(MD.x+fx,fz)-0.5;
    p.x=MD.x+fx*k;p.z=fz*k;p.y=yb+(MODTOP-yb)*t;return;}
  const t=(v-0.4)/0.6,k=0.93*Math.cos(t*Math.PI/2);
  p.x=MD.x+fx*k;p.z=fz*k;p.y=MODTOP+(BR.top-MODTOP)*Math.sin(t*Math.PI/2);
}

// ---------- the grid ----------
// A surface function made into an indexed mesh, with normals from the function itself (central differences),
// so the seam where u or v wraps round has no crease. `flip` turns the faces over.
export function surface(THREE,f,nu,nv,flip){
  const N=(nu+1)*(nv+1),pos=new Float32Array(N*3),nor=new Float32Array(N*3),uv=new Float32Array(N*2);
  const p=new THREE.Vector3(),n=new THREE.Vector3();
  let k=0;
  for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++,k++){
    const u=i/nu,v=j/nv;f(u,v,p);
    pos[k*3]=p.x;pos[k*3+1]=p.y;pos[k*3+2]=p.z;uv[k*2]=u;uv[k*2+1]=v;
    normalAt(f,u,v,n,flip);nor[k*3]=n.x;nor[k*3+1]=n.y;nor[k*3+2]=n.z;
  }
  const idx=[];
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){
    const a=i*(nv+1)+j,b=a+nv+1,c=a+1,d=b+1;
    if(flip)idx.push(a,c,b,c,d,b);else idx.push(a,b,c,c,b,d);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setIndex(idx);g.computeBoundingSphere();
  return g;
}
const _a={x:0,y:0,z:0},_b={x:0,y:0,z:0},_c={x:0,y:0,z:0},_d={x:0,y:0,z:0};
export function normalAt(f,u,v,n,flip){
  for(const e of [2e-4,2e-3,1e-2]){
    const u0=Math.max(0,u-e),u1=Math.min(1,u+e),v0=Math.max(0,v-e),v1=Math.min(1,v+e);
    f(u1,v,_a);f(u0,v,_b);f(u,v1,_c);f(u,v0,_d);
    const ax=_a.x-_b.x,ay=_a.y-_b.y,az=_a.z-_b.z,bx=_c.x-_d.x,by=_c.y-_d.y,bz=_c.z-_d.z;
    let x=ay*bz-az*by,y=az*bx-ax*bz,z=ax*by-ay*bx;const l=Math.hypot(x,y,z);
    if(l>1e-10){if(flip){x=-x;y=-y;z=-z;}n.x=x/l;n.y=y/l;n.z=z/l;return n;}
    // at a pole, step in off it
    if(u<e*2)u+=e*3;else if(u>1-e*2)u-=e*3;if(v<e*2)v+=e*3;else if(v>1-e*2)v-=e*3;
  }
  n.x=0;n.y=1;n.z=0;return n;
}
// a surface lifted off another along its normal (a decal: a grille, a window band), over a sub-range of it
export function patch(f,flip,map,off){
  const q={x:0,y:0,z:0},n={x:0,y:0,z:0},m=[0,0];
  return (u,v,p)=>{map(u,v,m);f(m[0],m[1],p);normalAt(f,m[0],m[1],n,flip);p.x+=n.x*off;p.y+=n.y*off;p.z+=n.z*off;};
}
