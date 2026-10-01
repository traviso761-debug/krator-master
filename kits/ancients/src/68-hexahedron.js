// ================================================================= HEXAHEDRON — the double pyramid
// Soleri's sheet 28: 170 000 people, 1 100 m tall, 1 km span, the automated
// industries on a hexagon underneath. An upper pyramid and an inverted lower
// one meeting at a waist promenade, the whole mass held clear of the ground on
// a forest of vertical shafts.
//
// THE PLAN, which is the whole design. Two OBLONG isosceles triangles that
// share one base vertex, each one's base lying along one of the other's legs.
// With base angle TH the construction is exact and needs no fitting: put the
// shared vertex at the origin, send the upper triangle's leg along +x and the
// lower triangle's leg out at TH. Each base is then 2*cos(TH) long and runs up
// the other triangle's leg from that shared corner. The two are mirror partners
// about the bisector, so their tips stand well clear of one another while the
// bodies overlap across the middle.
//
// The consequence that drives the rest of the file: the two triangles do NOT
// share a centroid. Each pyramid therefore tapers about ITS OWN centre -- if
// both scaled about the world origin they would lean into each other -- so
// every plan point is (P.O + outline*s), never outline*s alone.
// Filled by the builder, read by targets/hexahedron/91z-views.js: see the foot.
const HEX_SITE={};
// THE SOFFITS ARE PAINTED. A downward face sees only the hemisphere's ground
// colour (0x6a3a2a), so the lower city's sixteen stepped undersides and the
// 1 km great soffit under the upper city all rendered brown from every preset
// that looks up -- which is most of them, on a building held 300 m in the air.
// The same answer as the Ledge's: a little emissive through the concrete's own
// map, so the undersides read as pale concrete lit by bounce off the ground.
// hxNightDim() drops it at night, or the whole underside would glow.
MAT.hxSoff =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xb8b3aa,emissive:0x77726a,emissiveMap:TEX.concrete,roughness:1,metalness:0,side:DS});
MAT.hxSoffR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6f6861,emissive:0x3f3b36,emissiveMap:TEX.concrete,roughness:1,metalness:0,side:DS});
function hxNightDim(o,m){if(o)o.onBeforeRender=()=>{m.emissiveIntensity=NIGHT?.06:1;};}
function buildHexahedron(scene,gx,gz,d){reseed(9430+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;
 const SPAN=1000,YB=300,YW=620,YT=1100,SB=.17,ST=.14;
 REGISTER({name:'Hexahedron ('+STATE(d)+')',x:0,z:0,r:780,h:YT});
 REGISTER({name:'Hexahedron — the upper city',x:0,z:0,y:YW,r:740,h:YT-YW});
 REGISTER({name:'Hexahedron — the lower city',x:0,z:0,y:YB,r:740,h:YW-YB});
 REGISTER({name:'Hexahedron — the vertical structure',x:0,z:0,r:460,h:YB});
 REGISTER({name:'Hexahedron — automated industries',x:0,z:0,r:640,h:34});
 const SH=[],DK=[],GRD=[],SOF=[],CHAM=.055;

 // ---- the two plans --------------------------------------------------------
 const TH=75*Math.PI/180,BL=2*Math.cos(TH);        // leg = 1, base = 2 cos(TH)
 const CT=Math.cos(TH),SN=Math.sin(TH);
 const triU=[[0,0],[1,0],[BL*CT,BL*SN]];           // shared vertex, apex, base corner
 const triL=[[0,0],[BL,0],[CT,SN]];                // shared vertex, base corner, apex
 const cen=T=>[(T[0][0]+T[1][0]+T[2][0])/3,(T[0][1]+T[1][1]+T[2][1])/3];
 const cU=cen(triU),cL=cen(triL),GC=[(cU[0]+cL[0])/2,(cU[1]+cL[1])/2];
 const mkPlan=(T,c)=>{const P=[];
  for(let i=0;i<3;i++){const A=[T[i][0]-c[0],T[i][1]-c[1]],B=[T[(i+1)%3][0]-c[0],T[(i+1)%3][1]-c[1]];
   P.push([lerp(A[0],B[0],CHAM),lerp(A[1],B[1],CHAM)]);
   P.push([lerp(A[0],B[0],1-CHAM),lerp(A[1],B[1],1-CHAM)]);}
  P.O=[c[0]-GC[0],c[1]-GC[1]];                     // this plan's centre, builder frame
  P.L=[0];let t=0;for(let i=0;i<P.length;i++){const A=P[i],B=P[(i+1)%P.length];
   t+=Math.hypot(B[0]-A[0],B[1]-A[1]);P.L.push(t);}
  return P;};
 const PU=mkPlan(triU,cU),PL=mkPlan(triL,cL);
 // Sampled by ARC LENGTH. The legs are nearly twice the base, so an index walk
 // would crowd cells and texture on the base and stretch them along the legs.
 const pp=(P,p)=>{const L=P.L,tot=L[L.length-1],q=(p-Math.floor(p))*tot;
  let i=0;while(i<L.length-1&&L[i+1]<q)i++;
  const f=(q-L[i])/Math.max(1e-9,L[i+1]-L[i]);
  const A=P[i],B=P[(i+1)%P.length];return[lerp(A[0],B[0],f),lerp(A[1],B[1],f)];};
 // world xz of outline parameter p at taper scale s
 const W=(P,p,s)=>{const q=pp(P,p);return[(P.O[0]+q[0]*s)*SPAN,(P.O[1]+q[1]*s)*SPAN];};
 // True outward edge normal. Radial is a poor stand-in on a plan this
 // elongated -- the base edge's normal is nearly perpendicular to its radius.
 const pnorm=(P,p)=>{const a=pp(P,p-2e-4),b=pp(P,p+2e-4);
  let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
  let nx=dz,nz=-dx;const m=pp(P,p);
  if(nx*m[0]+nz*m[1]<0){nx=-nx;nz=-nz;}
  return[nx,nz];};
 // outline radius along a unit direction, by ray/edge intersection
 const planR=(P,dx,dz)=>{const n=P.length;
  for(let i=0;i<n;i++){const A=P[i],B=P[(i+1)%n];
   const ex=B[0]-A[0],ez=B[1]-A[1],den=ex*dz-ez*dx;
   if(Math.abs(den)<1e-12)continue;
   const t=-(A[0]*dz-A[1]*dx)/den;
   if(t<-1e-9||t>1+1e-9)continue;
   const r=(A[0]+ex*t)*dx+(A[1]+ez*t)*dz;
   if(r>0)return r;}
  return 1;};

 // ---- decay ---------------------------------------------------------------
 // By arc length the upper plan's two legs fall at p ~ .19 and .57 and the base
 // at ~.88. Leg 1 faces roughly +x+z, which is where the ruin presets sit.
 const WB=.567,WW=.030;
 const wedge=d===2?(u,y)=>{const du=Math.abs(((u-WB)%1+1.5)%1-.5);
  const rag=.34*fbm(u*21,y*.008,9432,3)-.17;
  return du<WW*(.45+1.45*clamp((y-YW)/(YT-YW),0,1))*(1+rag*1.4)&&y>YW+70+rag*150;}:()=>false;
 const pit=holeFn(d===2?.34:0,9433,null,.5);
 const cut=(u,y)=>wedge(u,y)||(pit?pit(u,y):false);
 const FAILC=1,CRAT=190;

 // ---- the upper city: a stepped oblong pyramid ------------------------------
 // Setbacks are not uniform: every fifth level steps in about 2.4x as far and
 // carries no dwellings, cutting a promenade groove round the mass. Without
 // them the faces are a uniform corduroy at any distance.
 const NU=24,RU=(YT-YW)/NU,BAND=k=>k%5===0&&k>0;
 const SUL=[1];{let T=0;for(let k=1;k<=NU;k++)T+=BAND(k)?2.1:.86;
  const unit=(1-ST)/T;for(let k=1;k<=NU;k++)SUL.push(SUL[k-1]-unit*(BAND(k)?2.1:.86));}
 const su=k=>SUL[Math.min(k,NU)];
 for(let k=0;k<NU;k++){const y0=YW+k*RU,s0=su(k),s1=su(k+1);
  SH.push(gridSurface((u,v)=>{const Q=W(PU,u,s0);return[Q[0],y0+v*RU,Q[1]];},
   112,2,{uS:52,vS:2,hole:(u,v)=>cut(u,y0+v*RU)}));
  SH.push(gridSurface((u,v)=>{const Q=W(PU,u,lerp(s0,s1,v));return[Q[0],y0+RU,Q[1]];},
   112,2,{uS:52,vS:2,hole:u=>cut(u,y0+RU)}));
  // Dwelling clusters on the tread. Heights come from ONE fbm walked along the
  // perimeter, so neighbours agree and the terrace reads as blocks of city
  // with streets cut through rather than as static.
  const nc=Math.max(7,Math.round(96*s0)),gap=Math.floor(fbm(k*.7,2.1,9438,2)*8);
  for(let j=0;j<nc;j++){const p=(j+.5)/nc;if(cut(p,y0+RU))continue;
   const N=pnorm(PU,p),q=qFacing([N[0],0,N[1]]);
   if(BAND(k+1)){                                  // promenade level: parapet, no cells
    const Qe=W(PU,p,s1),Qi=W(PU,p,lerp(s0,s1,.06));
    if(j%2===0)kput(d>0?'colR':'colW',[Qe[0],y0+RU,Qe[1]],null,[2,6,2],null);
    kput(BOXC(d),[Qi[0],y0+RU+1.4,Qi[1]],q,[11,2.8,2.2],null);
    if(d!==2&&j%7===3)VEG.tree(Qi[0]-N[0]*9,y0+RU+2.8,Qi[1]-N[1]*9,j%3,rr(5,9));
    continue;}
   if(j%9===gap)continue;
   const nb=fbm(p*13,k*.29,9437,3);
   for(let row=0;row<3;row++){const Q=W(PU,p,lerp(s0,s1,.10+row*.30));
    const h=lerp(4,15,nb)*(row===0?1:.78)*rr(.86,1.14);
    kput(BOXC(d),[Q[0],y0+RU+h*.5,Q[1]],q,[rr(8,16),h,rr(6,12)],null);}}
  // Windows belong to the terrace WALL -- the vertical riser below the tread.
  // They used to sit at the tread height but the riser radius, i.e. outside the
  // building, so they read as panes hung in the air among the balcony boxes.
  {const nw=Math.max(14,Math.round(360*s0)),WIN=d===0?'pane':'paneD';
   for(let j=0;j<nw;j++){const p=(j+.5)/nw;
    if(cut(p,y0+RU*.5))continue;
    if(d>0&&rng()<.34)continue;
    const Q=W(PU,p,s0),N=pnorm(PU,p),q=qFacing([N[0],0,N[1]]);
    // THE WALL BEHIND A PROMENADE IS AN ARCADE. It used to carry the same
    // three rows of panes as every other riser, so the promenade grooves read
    // as one more step with nothing behind it (KNOWN_ISSUES: "no interiors
    // behind the promenade bands"). A 9 x 14 m arch every third bay, a lamp
    // in each while the city is lit, and one row of panes over the top.
    // Draws no PRNG, so nothing after it moves.
    if(BAND(k)){if(j%3===0){
      kput('archOpen',[Q[0]+N[0]*.5,y0+7.6,Q[1]+N[1]*.5],q,[1.5,1.6,1.4],null);
      if(d===0)kput('strip',[Q[0]+N[0]*.95,y0+12.4,Q[1]+N[1]*.95],q,[5.5,1.2,1.2],WARM);}
     else kput(WIN,[Q[0]+N[0]*.35,y0+RU*.76,Q[1]+N[1]*.35],q,[2.5,3.1,1],null);
     continue;}
    for(let row=0;row<3;row++)
     kput(WIN,[Q[0]+N[0]*.35,y0+RU*(.20+row*.28),Q[1]+N[1]*.35],q,[2.5,3.1,1],null);}}
  // sky bridges out to cantilevered pods off the promenade grooves
  if(BAND(k+1)&&d!==2)for(let b=0;b<3;b++){const p=(b+.35)/3;
   if(cut(p,y0+RU))continue;
   const Q=W(PU,p,s1),N=pnorm(PU,p);
   const ex=Q[0]+N[0]*48,ez=Q[1]+N[1]*48;
   beam(BOXC(d),[Q[0],y0+RU+3,Q[1]],[ex,y0+RU+3,ez],5,2.4);
   kput(SLABC(d),[ex,y0+RU+3,ez],null,[15,2.4,15],null);
   // a raking strut back to the riser below, so the pod is a bracketed
   // balcony and not a disc floating 48 m off the face (seen from under it,
   // all you saw of the old one was its brown underside)
   {const Qb=W(PU,p,s0);for(const sg of [-1,1]){const tx=-N[1]*sg*5,tz=N[0]*sg*5;
    beam(BOXC(d),[ex+tx*.8,y0+RU+1.6,ez+tz*.8],[Qb[0]+tx,y0+3,Qb[1]+tz],2.6,2.6);}}
   kput(BOXC(d),[ex,y0+RU+9,ez],qFacing([N[0],0,N[1]]),[16,9,13],null);}}

 // ---- the summit: a ridge, not a point --------------------------------------
 // Elevation 3 draws a long flat top with the cultural centre running along it,
 // which only an oblong plan can carry. ST=0.14 leaves a ~200 m platform.
 {const Ap=[triU[1][0]-cU[0],triU[1][1]-cU[1]];
  const ang=Math.atan2(Ap[1],Ap[0]),RA=Math.hypot(Ap[0],Ap[1])*ST*SPAN;
  const CXs=PU.O[0]*SPAN,CZs=PU.O[1]*SPAN;
  SH.push(gridSurface((u,v)=>{const Q=W(PU,u,lerp(ST,0,v));return[Q[0],YT+lerp(0,7,Math.min(1,v*1.3)),Q[1]];},
   72,4,{uS:24,vS:4}));
  // THE CULTURAL CENTRE IS A HALL. It was seven boxes in a row, which read as
  // a skyline of blocks rather than the one long room the sections draw. Now a
  // parabolic vault along the ridge on a plinth, ribbed, closed at both ends
  // with a portal in each, and slotted along its crown for light.
  if(d!==2){const L=1.3*RA,HW=17,HV=28,ca=Math.cos(ang),sa=Math.sin(ang),Y0=YT+11;
   const hp=(t,w,y)=>[CXs+ca*t-sa*w,y,CZs+sa*t+ca*w];
   const vy=w=>Y0+HV*(1-Math.pow(w/HW,2));
   kput(BOXC(d),[CXs,YT+9,CZs],qEuler(0,-ang,0),[L+18,4,2*HW+16],null);
   SH.push(gridSurface((u,v)=>{const t=(u-.5)*L,w=(v*2-1)*HW;return hp(t,w,vy(w));},26,14,
    {uS:L/10,vS:5,hole:(u,v)=>Math.abs(v-.5)<.05&&Math.floor(u*26)%2===0}));
   for(const e of [-.5,.5])SH.push(gridSurface((u,v)=>{const w=(u*2-1)*HW;
     return hp(e*L,w,Y0+(vy(w)-Y0)*v);},14,5,{uS:4,vS:3}));
   for(let i=0;i<=13;i++){const t=(i/13-.5)*L;
    for(let sgm=0;sgm<6;sgm++){const w0=(sgm/6*2-1)*HW,w1=((sgm+1)/6*2-1)*HW;
     beam(BOXC(d),hp(t,w0*1.02,vy(w0)+.9),hp(t,w1*1.02,vy(w1)+.9),1.8,2.2);}}
   for(const e of [-1,1])kput('archOpen',hp(e*(L*.5+.7),0,Y0+9),qFacing([ca*e,0,sa*e]),[2.4,2.3,1.4],null);
   if(d===0)for(let i=0;i<13;i++)kput('strip',hp(((i+.5)/13-.5)*L,0,Y0+HV-1.5),qEuler(0,-ang,0),[L/15,1.4,1.4],WARM);
   kput('finial',[CXs,Y0+HV+8,CZs],null,[7,18,7],null);}
  for(let i=0;i<3;i++){if(d===2&&i===1)continue;
   const C=[triU[i][0]-cU[0],triU[i][1]-cU[1]];
   kput(BOXC(d),[CXs+C[0]*ST*SPAN*.8,YT+52,CZs+C[1]*ST*SPAN*.8],null,[8,96,8],null);}}

 // ---- the lower city: the inverted pyramid ---------------------------------
 const NL=16,RL=(YW-YB)/NL,sl=k=>lerp(SB,1,Math.pow(k/NL,.80));
 // soffit height above a builder-frame plan point, via the true outline radius
 const soffitY=(px,pz)=>{const vx=px-PL.O[0],vz=pz-PL.O[1],m=Math.hypot(vx,vz);
  if(m<1e-6)return YB;
  const rho=m/Math.max(1e-6,planR(PL,vx/m,vz/m));
  return YB+(YW-YB)*Math.pow(clamp((rho-SB)/(1-SB),0,1),1.25);};
 // Centre of mass. Each pyramid's outline scales about its own centre, so that
 // centre IS its plan centroid and the only unknown is the mass ratio -- the
 // integral of s(y)^2 over each one's height. The two centres are antisymmetric
 // about the origin and the masses come out near equal, so the COM lands within
 // about 15 m of the builder origin, which is where the ground works already
 // are. The mass stays off balance; the nanomaterial spine carries it.
 let mU=0;for(let k=0;k<NU;k++){const sm2=(su(k)+su(k+1))*.5;mU+=sm2*sm2*RU;}
 let mL=0;for(let k=0;k<NL;k++){const sm2=(sl(k)+sl(k+1))*.5;mL+=sm2*sm2*RL;}
 const COM=[(PU.O[0]*mU+PL.O[0]*mL)/(mU+mL),(PU.O[1]*mU+PL.O[1]*mL)/(mU+mL)];
 // One function gives every cluster its plan position, so the soffit crater and
 // the shafts cannot drift apart. Hand-copying the failed cluster's coordinates
 // into the crater is precisely the class of bug this file keeps hitting.
 const clusterAt=c=>c===4?[COM[0]*SPAN,COM[1]*SPAN]
  :[(COM[0]+Math.cos(c/4*TAU+.35)*.155)*SPAN,(COM[1]+Math.sin(c/4*TAU+.35)*.155)*SPAN];
 // With the clusters drawn in onto the centre of mass they merge into one
 // bundle about 330 m across, and a single failed sub-cluster simply hides
 // inside it. The failure is a FLANK of the bundle instead: every shaft within
 // ~55 deg of FAILA went, and the crater sits over that sector.
 const FAILA=1.92,wrapA=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
 const CX=(COM[0]+Math.cos(FAILA)*.115)*SPAN,CZ=(COM[1]+Math.sin(FAILA)*.115)*SPAN;
 const crater=(x,z)=>d===2&&Math.hypot(x-CX,z-CZ)<CRAT*(.72+.5*fbm(x*.004,z*.004,9434,3));
 for(let k=0;k<NL;k++){const y0=YB+k*RL,s0=sl(k),s1=sl(k+1);
  SH.push(gridSurface((u,v)=>{const Q=W(PL,u,s1);return[Q[0],y0+v*RL,Q[1]];},
   112,2,{uS:52,vS:2,hole:u=>{const Q=W(PL,u,s1);return crater(Q[0],Q[1]);}}));
  // soffit, v running outward-to-inward so the normal points DOWN at the ground
  SOF.push(gridSurface((u,v)=>{const Q=W(PL,u,lerp(s1,s0,v));return[Q[0],y0,Q[1]];},
   112,2,{uS:52,vS:2,hole:(u,v)=>{const Q=W(PL,u,lerp(s1,s0,v));return crater(Q[0],Q[1]);}}));
  const nc=Math.max(6,Math.round(86*s1));
  for(let j=0;j<nc;j++){const p=(j+.5)/nc,N=pnorm(PL,p),q=qFacing([N[0],0,N[1]]);
   for(let row=0;row<2;row++){const Q=W(PL,p,lerp(s1,s0,.12+row*.34));
    if(crater(Q[0],Q[1]))continue;
    const h=rr(4,9);
    kput(BOXC(d),[Q[0],y0-h*.5,Q[1]],q,[rr(7,14),h,rr(6,11)],null);}}
  {const nw=Math.max(12,Math.round(320*s1)),WIN=d===0?'pane':'paneD';
   for(let j=0;j<nw;j++){const p=(j+.5)/nw;
    const Q=W(PL,p,s1),N=pnorm(PL,p),q=qFacing([N[0],0,N[1]]);
    if(crater(Q[0],Q[1]))continue;
    if(d>0&&rng()<.34)continue;
    for(let row=0;row<3;row++)
     kput(WIN,[Q[0]+N[0]*.35,y0+RL*(.22+row*.27),Q[1]+N[1]*.35],q,[2.5,3.1,1],null);}}}

 // ---- the shear face --------------------------------------------------------
 // An inner dark shell kept only where the wedge removed the outer one, so the
 // cut reads as a hollow city rather than the back wall, with the floor plates
 // of each level ragged in section and rooms still standing on them.
 if(d===2){for(let k=0;k<NU;k++){const y0=YW+k*RU,si=su(k)*.90;
   DK.push(gridSurface((u,v)=>{const Q=W(PU,u,si);return[Q[0],y0+v*RU,Q[1]];},
    64,1,{uS:28,vS:1,hole:(u,v)=>!wedge(u,y0+v*RU)}));
   SH.push(gridSurface((u,v)=>{const Q=W(PU,u,lerp(su(k),su(k)*.58,v));return[Q[0],y0,Q[1]];},
    64,3,{uS:28,vS:3,hole:(u,v)=>!wedge(u,y0)||fbm(u*9+k,v*6,9435,3)<.20+.52*v*v}));
   for(let j=0;j<7;j++){const p=WB+(j/6-.5)*WW*3.4;if(!wedge(p,y0))continue;
    const Q=W(PU,p,su(k)*rr(.66,.93)),N=pnorm(PU,p),h=rr(5,12);
    kput(BOXC(d),[Q[0],y0+h*.5,Q[1]],qFacing([N[0],0,N[1]]),[rr(7,15),h,rr(6,13)],null);}}
  for(let i=0;i<3;i++){const p=WB+(i-1)*.022;
   const Q=W(PU,p,su(Math.round(NU*.45))*.72),ytop=lerp(YT,YW,i===1?.18:.42);
   kput(BOXC(d),[Q[0],(YW+ytop)*.5,Q[1]],null,[14,ytop-YW,14],null);}}

 // ---- closing the pyramids --------------------------------------------------
 // Both were open shells: risers and treads on the upper, risers and soffits on
 // the lower, and nothing across either end. Where one plan reaches past the
 // other -- which is most of the perimeter, since they are turned 120 deg --
 // you could look straight up into the hollow cone, or down into the inverted
 // one. Three caps: the great soffit under the upper city, the deck over the
 // lower city, and the floor of its truncated apex. They sit 2 m apart rather
 // than coplanar so the overlap cannot z-fight.
 SOF.push(gridSurface((u,v)=>{const Q=W(PU,u,1-v);return[Q[0],YW,Q[1]];},
  112,6,{uS:52,vS:8,hole:(u,v)=>cut(u,YW+2)}));
 SH.push(gridSurface((u,v)=>{const Q=W(PL,u,1-v);return[Q[0],YW-2,Q[1]];},
  112,6,{uS:52,vS:8,hole:(u,v)=>{const Q=W(PL,u,1-v);return crater(Q[0],Q[1]);}}));
 SOF.push(gridSurface((u,v)=>{const Q=W(PL,u,SB*(1-v));return[Q[0],YB,Q[1]];},
  72,3,{uS:24,vS:3,hole:(u,v)=>{const Q=W(PL,u,SB*(1-v));return crater(Q[0],Q[1]);}}));
 // The lower city's roof is open sky wherever the upper pyramid does not cover
 // it, which on a 120 deg turn is most of one point. That is the park and
 // promenade level of the sheets, so it gets planted rather than left blank.
 for(let i=0;i<300;i++){
  const Q=W(PL,rng(),Math.sqrt(rng())*.97);
  const vx=Q[0]/SPAN-PU.O[0],vz=Q[1]/SPAN-PU.O[1],m=Math.hypot(vx,vz)||1e-6;
  if(m<planR(PU,vx/m,vz/m)*1.01)continue;          // roofed by the upper city
  if(crater(Q[0],Q[1]))continue;
  if(rng()<.42){const h=rr(5,17);
   kput(BOXC(d),[Q[0],YW-2+h*.5,Q[1]],qEuler(0,rng()*TAU,0),[rr(10,26),h,rr(9,22)],null);}
  else if(d!==2)VEG.tree(Q[0],YW-2,Q[1],i%3,rr(5,10));}
 // SKY BRIDGES ACROSS THE AIR. KNOWN_ISSUES: the sheets' bridges span BETWEEN
 // faces across open air, and every bridge here only cantilevered outward to
 // a pod. The one piece of open air this form has between two of its own
 // faces is over the lower city's exposed point, where the upper pyramid's
 // flank rises out of the park. Three level bridges leave the fifth-level
 // promenade and cross 100 m above that park to lift towers standing on it.
 // Placement is solved, not typed in: the point of the lower plan furthest
 // from the upper one, then the nearest promenade edge to each landing.
 {const Yp=YW+5*RU,sP=su(4),UO=[PU.O[0]*SPAN,PU.O[1]*SPAN];
  let pA=0,best=-1;for(let i=0;i<400;i++){const Q=W(PL,i/400,1),dd2=Math.hypot(Q[0]-UO[0],Q[1]-UO[1]);
   if(dd2>best){best=dd2;pA=i/400;}}
  for(let b=-1;b<=1;b++){const T=W(PL,pA+b*.018,.70);
   const vx=T[0]/SPAN-PU.O[0],vz=T[1]/SPAN-PU.O[1],m=Math.hypot(vx,vz)||1e-6;
   if(m<planR(PU,vx/m,vz/m)*1.04||crater(T[0],T[1]))continue;        // must stand in the open
   let pS=0,bd=1e9;for(let i=0;i<400;i++){const Q=W(PU,i/400,sP),q=Math.hypot(Q[0]-T[0],Q[1]-T[1]);
    if(q<bd){bd=q;pS=i/400;}}
   if(bd<60||bd>460||cut(pS,Yp))continue;
   const S=W(PU,pS,sP),ang=Math.atan2(T[1]-S[1],T[0]-S[0]),nx=-Math.sin(ang),nz=Math.cos(ang);
   beam(BOXC(d),[S[0],Yp+3,S[1]],[T[0],Yp+3,T[1]],5,9);
   for(const sg of [-1,1])beam(BOXC(d),[S[0]+nx*sg*4.2,Yp+6.6,S[1]+nz*sg*4.2],
    [T[0]+nx*sg*4.2,Yp+6.6,T[1]+nz*sg*4.2],1,.8);
   const hT=Yp+6-(YW-2);
   kput(BOXC(d),[T[0],YW-2+hT*.5,T[1]],qEuler(0,-ang,0),[15,hT,15],null);
   kput(BOXC(d),[T[0],YW-2+7,T[1]],qEuler(0,-ang,0),[30,14,26],null);
   kput(SLABC(d),[T[0],Yp+7,T[1]],null,[13,2,13],null);
   if(d===0)for(let j=0;j<8;j++)kput('strip',[T[0]+Math.cos(ang)*7.7,YW+10+j*11,T[1]+Math.sin(ang)*7.7],
    qFacing([Math.cos(ang),0,Math.sin(ang)]),[4,1.2,1.2],WARM);}}
 // coffer ribs across the great soffit, so it is not a blank 1 km plate
 for(let j=0;j<30;j++){const p=j/30,Q=W(PU,p,.99),Qi=W(PU,p+.5,.99);
  if(cut(p,YW+2))continue;
  beam(BOXC(d),[Q[0],YW-3,Q[1]],[Qi[0],YW-3,Qi[1]],4,6);}
 if(d===0)for(let j=0;j<40;j++){const p=(j+.5)/40,Q=W(PU,p,.62);
  kput('strip',[Q[0],YW-4,Q[1]],qEuler(0,rng()*TAU,0),[22,1,1],CYAN);}

 // ---- the waist: two overlapping promenade decks ---------------------------
 // Offsetting them in y rather than unioning the outlines is what makes the
 // crossing read: at the waist one triangular plate runs over the other.
 const deck=(P,y,out)=>{
  SH.push(gridSurface((u,v)=>{const Q=W(P,u,lerp(1,out,v));return[Q[0],y,Q[1]];},
   112,3,{uS:52,vS:3,hole:(u,v)=>{const Q=W(P,u,lerp(1,out,v));return crater(Q[0],Q[1]);}}));
  SH.push(gridSurface((u,v)=>{const Q=W(P,u,out);return[Q[0],y-v*11,Q[1]];},112,2,{uS:52,vS:1}));};
 deck(PU,YW+15,1.14);deck(PL,YW-17,1.12);
 for(let j=0;j<96;j++){const p=j/96,Q=W(PU,p,1.14);
  if(d>0&&rng()<.45)continue;
  kput(d>0?'colR':'colW',[Q[0],YW+15,Q[1]],null,[2.2,7,2.2],null);}
 if(d===0)for(let j=0;j<72;j++){const p=(j+.5)/72,Q=W(PL,p,1.12),N=pnorm(PL,p);
  kput('strip',[Q[0],YW-17.5,Q[1]],qEuler(0,-Math.atan2(-N[0],N[1]),0),[18,1,1],CYAN);}
 // heliport out on the upper deck's apex tip
 {const Q=W(PU,.380,1.05);   // p=.380 is the apex chamfer; .877 was the base edge
  kput(SLABC(d),[Q[0],YW+25,Q[1]],null,[50,3,50],null);
  for(let i=0;i<4;i++)kput(BOXC(d),[Q[0]+Math.cos(i/4*TAU+.7)*34,YW+20,Q[1]+Math.sin(i/4*TAU+.7)*34],null,[4,10,4],null);
  if(d===0)stripRing(Q[0],YW+27,Q[1],46,d,20);}

 // The ground works are declared here, ahead of the shafts, because the shaft
 // footings need plateY: a const used before its declaration is a temporal
 // dead zone throw, not a hoisted undefined.
 const HEXR=620,hx=(th,f)=>hexR(HEXR*f,th);
 // Seat every block on the terrace it actually stands on. Picking a y and a
 // height independently is how blocks end up floating or half-buried.
 const plateY=(x,z)=>12-2.2*Math.min(3,Math.floor(clamp(Math.hypot(x,z)/hexR(HEXR,Math.atan2(z,x)),0,.999)*4));

 // ---- the vertical structure ------------------------------------------------
 // Four clusters. Each shaft runs from the ground to whatever height the
 // inverted pyramid's soffit has actually reached above it, so they lengthen
 // toward the rim instead of all being cut to one line.
 // Where the soffit ACTUALLY is above a plan point. soffitY() inverts a
 // continuous curve; the built soffit is stepped, so the two disagree by up to
 // a whole band and shafts sized from the continuous value stopped short of the
 // plate they were meant to carry.
 const soffitStep=(px,pz)=>{const vx=px-PL.O[0],vz=pz-PL.O[1],m=Math.hypot(vx,vz);
  if(m<1e-6)return YB;
  const rho=m/Math.max(1e-6,planR(PL,vx/m,vz/m));
  if(rho<=SB)return YB;
  if(rho>=1)return YW;
  return YB+Math.min(NL-1,Math.floor(NL*Math.pow((rho-SB)/(1-SB),1.25)))*RL;};
 // An intact shaft runs all the way to the waist, not to the soffit it first
 // meets. The lower city is a closed shell now, so everything above that soffit
 // is enclosed and invisible -- which makes the connection true by construction
 // instead of true only if a height calculation happens to agree with a stepped
 // surface. The visible length still varies, because the soffit still does.
 const shaft=(x,z,w,broke)=>{
  const vis=soffitStep(x/SPAN,z/SPAN);
  const h=broke?vis*rr(.18,.42):YW+2;
  kput(BOXC(d),[x,h*.5,z],qEuler(0,rr(0,.4),0),[w,h,w*rr(.8,1.2)],null);
  for(let f=0;f<4;f++){const a=f/4*TAU+.4;
   kput(BOXC(d),[x+Math.cos(a)*w*.62,h*.5,z+Math.sin(a)*w*.62],qEuler(0,-a,0),[1.6,h*.98,w*.30],null);}
  // capital just under the soffit, and a footing seated on the ground terrace
  if(!broke){kput(BOXC(d),[x,vis-7,z],null,[w*1.6,13,w*1.6],null);
   for(let f=0;f<4;f++){const a=f/4*TAU+.8;
    beam(BOXC(d),[x+Math.cos(a)*w*.5,vis-26,z+Math.sin(a)*w*.5],
     [x+Math.cos(a)*w*1.05,vis-3,z+Math.sin(a)*w*1.05],3.4,3.4);}}
  kput(BOXC(d),[x,plateY(x,z)+5,z],qEuler(0,rr(0,.4),0),[w*1.5,14,w*1.5],null);
  if(broke)rubbleRing(x,0,z,w*.6,w*3.2,26,4.2);
  return vis;};
 for(let c=0;c<5;c++){
  const centre=c===4;
  const CC=clusterAt(c),cx=CC[0],cz=CC[1];
  const n=centre?11:8;
  for(let i=0;i<n;i++){
   const a=i/n*TAU+c*.7,rd=(i===0&&!centre)?0:rr(36,78);
   const x=cx+Math.cos(a)*rd,z=cz+Math.sin(a)*rd;
   const broke=d===2&&Math.abs(wrapA(Math.atan2(z-COM[1]*SPAN,x-COM[0]*SPAN)-FAILA))<.95;
   const vis=shaft(x,z,rr(13,23),broke&&rng()<.82);
   // bracing only in the visible length, below the soffit
   if(i>0&&!broke)for(let b=1;b<=3;b++)
    beam(BOXC(d),[x,vis*b/4,z],[cx,vis*b/4,cz],3.4,3.4);}}
 if(d===2){for(let i=0;i<9;i++){const a=FAILA+rr(-1.1,1.1);
   beam(BOXC(1),[CX+Math.cos(a)*rr(30,150),rr(8,22),CZ+Math.sin(a)*rr(30,150)],
    [CX+Math.cos(a)*rr(160,380),rr(4,12),CZ+Math.sin(a)*rr(160,380)],rr(15,24),rr(15,24));}
  rubbleRing(CX,0,CZ,70,360,220,7);}

 // ---- the ground: automated industries on a hexagon --------------------------
 // A hexagon's inradius is only 0.87 of its circumradius, subtle enough that a
 // circular apron laid over it hid the shape entirely; mesa, rim and skirt all
 // follow hexR, and the retaining wall on the six edges is what sells it.
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=hx(th,1)*v;
  return[r*Math.cos(th),12-2.2*Math.min(3,Math.floor(v*4)),r*Math.sin(th)];},96,12,{uS:40,vS:16}));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=hx(th,lerp(1,1.05,v));
  return[r*Math.cos(th),lerp(5.4,0,Math.pow(v,.7)),r*Math.sin(th)];},96,3,{uS:40,vS:2}));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=hx(th,lerp(1.05,1.34,v))*(1+.035*fbm(u*9,1.1,9436,2));
  return[r*Math.cos(th),0,r*Math.sin(th)];},96,4,{uS:40,vS:4}));
 for(let e=0;e<6;e++){const a0=e/6*TAU,a1=(e+1)/6*TAU;
  const R0=hexR(HEXR,a0),R1=hexR(HEXR,a1);
  beam(BOXC(d),[R0*Math.cos(a0),9,R0*Math.sin(a0)],[R1*Math.cos(a1),9,R1*Math.sin(a1)],12,10);}
 // Plan 2 divides the hexagon into six wedges of mechanical facilities,
 // automated industries and factories, each laid out along its own axis.
 // Scattering blocks at uniform random reads as debris; five ranks per sector,
 // set out on the sector's bisector with a street between sectors, reads as a
 // plan even at the overview distance.
 const IND=[[.43,7],[.57,9],[.70,11],[.83,12],[.93,14]];
 for(let e=0;e<6;e++){const a0=e/6*TAU-Math.PI/6+.045,a1=(e+1)/6*TAU-Math.PI/6-.045;
  IND.forEach((row,ri)=>{const n=row[1];
   for(let j=0;j<n;j++){const t=(j+.5)/n,a=lerp(a0,a1,t);
    if(rng()<.12)continue;                                      // a yard, not a shed
    const R=hexR(HEXR,a)*row[0]*(1+.018*fbm(a*3,ri,9439,2));
    const x=Math.cos(a)*R,z=Math.sin(a)*R;
    if(Math.hypot(x,z)<250)continue;                            // the shaft forest
    if(d===2&&Math.hypot(x-CX,z-CZ)<CRAT*1.5&&rng()<.7)continue;
    const bh=rr(8,30),tan=R*(a1-a0)/n*.82;
    kput(BOXC(d),[x,plateY(x,z)+bh*.5,z],qEuler(0,-a,0),[rr(26,54),bh,tan],null);}});}
 // the paved apron round the vertical structure
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(40,250,v);
  return[r*Math.cos(th),12.3,r*Math.sin(th)];},64,4,{uS:26,vS:10}));
 for(let s2=0;s2<6;s2++){const a=s2/6*TAU+Math.PI/6;
  beam(d>0?'boxR':'boxD',[0,7.2,0],[Math.cos(a)*HEXR*.96,7.2,Math.sin(a)*HEXR*.96],16,.6);}

 // ---- merge and dress --------------------------------------------------------
 meshMerged(SH,CONC(dd),G);hxNightDim(meshMerged(SOF,dd?MAT.hxSoffR:MAT.hxSoff,G),dd?MAT.hxSoffR:MAT.hxSoff);
 meshMerged(GRD,d>0?MAT.mud:MAT.slab,G);
 if(DK.length)meshMerged(DK,MAT.guts,G);
 if(d>0){mossOnSurface(SH,0,0,0,300,4);vinesFromLedge(SH,0,0,0,140,26);stainsFromLedge(SH,0,0,0,160,24);
  scatterMoss(0,0,0,180,HEXR,320,4);rubbleRing(0,0,0,HEXR*.4,HEXR,240,7);trees(0,0,220,HEXR*1.2,80);}
 else{trees(0,0,HEXR*.55,HEXR*1.25,52);figures(0,300,10,160);}
 figures(CX,CZ,8,140);
 // ---- what the presets are derived from ------------------------------------
 // KNOWN_ISSUES: "presets hard-code targets", and three had to be re-aimed by
 // hand after the plan or the failure moved. The camera fragment runs after
 // 90-scene.js, so it reads these instead: builder-local metres, per decay.
 {const bb=[1e9,-1e9,1e9,-1e9];
  for(const P of [PU,PL])for(let i=0;i<=240;i++){const Q=W(P,i/240,P===PU?1.14:1.12);   // the decks' reach
   bb[0]=Math.min(bb[0],Q[0]);bb[1]=Math.max(bb[1],Q[0]);bb[2]=Math.min(bb[2],Q[1]);bb[3]=Math.max(bb[3],Q[1]);}
  const kS=Math.round(NU*.6),shQ=W(PU,WB,su(kS));
  HEX_SITE[d]={UC:[(bb[0]+bb[1])/2,(bb[2]+bb[3])/2],BB:bb,COM:[COM[0]*SPAN,COM[1]*SPAN],
   CRATER:[CX,CZ],APEX:W(PU,.380,1.14),SUMMIT:[PU.O[0]*SPAN,PU.O[1]*SPAN],
   SHEAR:[shQ[0],YW+kS*RU,shQ[1]],SHEARN:pnorm(PU,WB),YB,YW,YT};}
 KOFF=[0,0,0];return G;}
