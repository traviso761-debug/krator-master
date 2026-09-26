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
function buildHexahedron(scene,gx,gz,d){reseed(9430+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;
 const SPAN=1000,YB=300,YW=620,YT=1100,SB=.17,ST=.14;
 REGISTER({name:'Hexahedron ('+STATE(d)+')',x:0,z:0,r:780,h:YT});
 REGISTER({name:'Hexahedron — the upper city',x:0,z:0,y:YW,r:740,h:YT-YW});
 REGISTER({name:'Hexahedron — the lower city',x:0,z:0,y:YB,r:740,h:YW-YB});
 REGISTER({name:'Hexahedron — the vertical structure',x:0,z:0,r:460,h:YB});
 REGISTER({name:'Hexahedron — automated industries',x:0,z:0,r:640,h:34});
 const SH=[],DK=[],GRD=[],ORCH=[],CHAM=.055;

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
 // How far out a world xz point sits in the lower plan: 1.0 is on the outline.
 // Needed early, because the shafts have to be clamped under the mass and the
 // clusters are placed long before the plaza helpers are built.
 const lowRho=(x,z)=>{const vx=x/SPAN-PL.O[0],vz=z/SPAN-PL.O[1],m=Math.hypot(vx,vz);
  return m<1e-9?0:m/Math.max(1e-9,planR(PL,vx/m,vz/m));};
 const pullIn=(x,z,lim)=>{const r=lowRho(x,z);if(r<=lim)return[x,z];
  const f=lim/r;return[(PL.O[0]+(x/SPAN-PL.O[0])*f)*SPAN,(PL.O[1]+(z/SPAN-PL.O[1])*f)*SPAN];};

 // ---- decay ---------------------------------------------------------------
 // THE SCREAMERS' HEXAHEDRON. The collapse is low: it has eaten the lower city
 // from its truncated tip upward on one bearing and stopped three bands short
 // of the promenade, so the levels the tribe actually lives on are whole. The
 // upper pyramid keeps only a medium crater, punched out on the opposite side.
 // THE MAIN PLAZA, surveyed in-scene with the polygon tool. Everything inside
 // it is intact: the crater stops at its edge, nothing is scattered on it, and
 // the village lays grass and fruit trees over whatever it does not build on.
 const PLZ=[[-173.2,270.2],[-67.2,654.3],[117.6,103.1]];
 const inPlaza=(x,z)=>{let pos=0,neg=0;
  for(let i=0;i<3;i++){const A=PLZ[i],B=PLZ[(i+1)%3];
   const c=(B[0]-A[0])*(z-A[1])-(B[1]-A[1])*(x-A[0]);
   if(c>0)pos++;else neg++;}
  return pos===3||neg===3;};
 // LOWER-LEVEL DAMAGE IS OFF. Everything below the promenade -- the sheared
 // skin, the decks behind it, the interior cells, the soffit crater and the
 // failed shaft flank -- is gated on this one flag so it can be re-specified
 // from a clean slate. Set it true to bring the previous pass back.
 const LOWDMG=false;
 // ONE VERTICAL STRIP of the outer skin is torn away, top to bottom, so the
 // decks behind it are on show. Bearing -PI/2 puts it on the face the preset
 // cameras look at; it is narrow and ragged rather than a wedge, because the
 // point is to see INTO the lower city, not to remove a piece of it.
 const STRIPA=-1.5708,STRIPW=.075;
 const FAILA=1.92,wrapA=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
 const UCX=149,UCY=792,UCZ=-208,UCR=215;        // the chunk blown out up top
 // Perturbing the radius by fbm of world x,z gave a clean disc, because the
 // noise then varies with position ON the face rather than with direction
 // AROUND the hole. Two octaves in the crater's own bearing and elevation do
 // what was wanted.
 const ubite=(x,y,z)=>{if(d!==2)return false;
  const dx=x-UCX,dy=(y-UCY)*1.25,dz=z-UCZ,m=Math.hypot(dx,dy,dz);
  if(m>UCR*1.5)return false;
  const el=Math.atan2(dy,Math.hypot(dx,dz)||1e-6),bz=Math.atan2(dz,dx);
  const rag=.40*fbm(bz*2.1+3,el*2.4,9442,3)+.26*fbm(bz*7.3,el*6.1,9443,2)-.31;
  return m<UCR*(1+rag);};
 const pit=holeFn(d===2?.24:0,9433,null,.5);
 const cut=(u,y)=>(pit?pit(u,y):false);
 const cutQ=(Q,y)=>ubite(Q[0],y,Q[1]);
 const CRAT=132;

 // NAMED SURFACE LISTS. The overgrowth pass needs to know which of these
 // shells are TREADS (open to the sky) and which are SOFFITS (ceilings), and it
 // used to work that out by indexing SH arithmetically -- SH[LO0+2*k] -- which
 // was wrong the moment the lower city started pushing decks behind its sheared
 // skin as well: the stride down there is 2, 4 or 6 depending on the damage
 // flags. The growth pass was dressing interior decks nobody can see and
 // skipping the top four bands of the real underside entirely. Capture the
 // geometry as it is made instead, and nothing downstream can be knocked out of
 // step by someone adding another push.
 const TRD_U=[],RIS_U=[],SOF_L=[],RIS_L=[],CELLS=[];
 const keep=(arr,g)=>{SH.push(g);arr.push(g);return g;};

 // ---- the upper city: a stepped oblong pyramid ------------------------------
 // Setbacks are not uniform: every fifth level steps in about 2.4x as far and
 // carries no dwellings, cutting a promenade groove round the mass. Without
 // them the faces are a uniform corduroy at any distance.
 const NU=24,RU=(YT-YW)/NU,BAND=k=>k%5===0&&k>0;
 const SUL=[1];{let T=0;for(let k=1;k<=NU;k++)T+=BAND(k)?2.1:.86;
  const unit=(1-ST)/T;for(let k=1;k<=NU;k++)SUL.push(SUL[k-1]-unit*(BAND(k)?2.1:.86));}
 const su=k=>SUL[Math.min(k,NU)];
 for(let k=0;k<NU;k++){const y0=YW+k*RU,s0=su(k),s1=su(k+1);
  keep(RIS_U,gridSurface((u,v)=>{const Q=W(PU,u,s0);return[Q[0],y0+v*RU,Q[1]];},
   112,2,{uS:52,vS:2,hole:(u,v)=>cut(u,y0+v*RU)||cutQ(W(PU,u,s0),y0+v*RU)}));
  keep(TRD_U,gridSurface((u,v)=>{const Q=W(PU,u,lerp(s0,s1,v));return[Q[0],y0+RU,Q[1]];},
   112,2,{uS:52,vS:2,hole:(u,v)=>cut(u,y0+RU)||cutQ(W(PU,u,lerp(s0,s1,v)),y0+RU)}));
  // Dwelling clusters on the tread. Heights come from ONE fbm walked along the
  // perimeter, so neighbours agree and the terrace reads as blocks of city
  // with streets cut through rather than as static.
  const nc=Math.max(7,Math.round(96*s0)),gap=Math.floor(fbm(k*.7,2.1,9438,2)*8);
  for(let j=0;j<nc;j++){const p=(j+.5)/nc;
   if(cut(p,y0+RU)||cutQ(W(PU,p,lerp(s0,s1,.5)),y0+RU))continue;
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
    kput(BOXC(d),[Q[0],y0+RU+h*.5,Q[1]],q,[rr(8,16),h,rr(6,12)],null);}
   // About a tenth of the balconies are orchards, each with its own door on to
   // the terrace. These are what the harvesters come up for.
   if(rng()<.10){const Qt=W(PU,p,lerp(s0,s1,.60)),th=rr(7,12);
    FLORA.small(Qt[0],y0+RU,Qt[1],th,2);            // prism gum: the fruit tree
    for(let b=0;b<3;b++)kput('bloom',[Qt[0]+rr(-.26,.26)*th,y0+RU+th*rr(.64,.88),Qt[1]+rr(-.26,.26)*th],
     qEuler(0,rng()*TAU,0),[th*.07,th*.07,th*.07],new THREE.Color(rng()<.5?0xd08a2a:0xc25a3a));
    const Qd=W(PU,p,s0);
    kput('doorD',[Qd[0]+N[0]*.55,y0+RU*.42,Qd[1]+N[1]*.55],q,[3.2,6,1],null);
    ORCH.push([Qt[0],y0+RU,Qt[1]]);}}
  // Windows belong to the terrace WALL -- the vertical riser below the tread.
  // They used to sit at the tread height but the riser radius, i.e. outside the
  // building, so they read as panes hung in the air among the balcony boxes.
  {const nw=Math.max(14,Math.round(255*s0)),WIN=d===0?'pane':'paneD';
   for(let j=0;j<nw;j++){const p=(j+.5)/nw;
    if(cut(p,y0+RU*.5)||cutQ(W(PU,p,s0),y0+RU*.5))continue;
    if(d>0&&rng()<.34)continue;
    const Q=W(PU,p,s0),N=pnorm(PU,p),q=qFacing([N[0],0,N[1]]);
    for(let row=0;row<3;row++)
     kput(WIN,[Q[0]+N[0]*.35,y0+RU*(.20+row*.28),Q[1]+N[1]*.35],q,[2.5,3.1,1],null);}}
  // sky bridges out to cantilevered pods off the promenade grooves
  if(BAND(k+1))for(let b=0;b<3;b++){const p=(b+.35)/3;
   if(cut(p,y0+RU)||cutQ(W(PU,p,s1),y0+RU))continue;
   const Q=W(PU,p,s1),N=pnorm(PU,p);
   const ex=Q[0]+N[0]*48,ez=Q[1]+N[1]*48;
   beam(BOXC(d),[Q[0],y0+RU+3,Q[1]],[ex,y0+RU+3,ez],5,2.4);
   kput(SLABC(d),[ex,y0+RU+3,ez],null,[15,2.4,15],null);
   kput(BOXC(d),[ex,y0+RU+9,ez],qFacing([N[0],0,N[1]]),[16,9,13],null);}}

 // ---- the summit: a ridge, not a point --------------------------------------
 // Elevation 3 draws a long flat top with the cultural centre running along it,
 // which only an oblong plan can carry. ST=0.14 leaves a ~200 m platform.
 {const Ap=[triU[1][0]-cU[0],triU[1][1]-cU[1]];
  const ang=Math.atan2(Ap[1],Ap[0]),RA=Math.hypot(Ap[0],Ap[1])*ST*SPAN;
  const CXs=PU.O[0]*SPAN,CZs=PU.O[1]*SPAN;
  SH.push(gridSurface((u,v)=>{const Q=W(PU,u,lerp(ST,0,v));return[Q[0],YT+lerp(0,7,Math.min(1,v*1.3)),Q[1]];},
   72,4,{uS:24,vS:4}));
  if(d!==2){for(let i=0;i<7;i++){const t=(i/6-.5)*1.5*RA;
    const h=22+16*Math.cos(i/6*Math.PI-Math.PI/2);
    kput(BOXC(d),[CXs+Math.cos(ang)*t,YT+7+h*.5,CZs+Math.sin(ang)*t],qEuler(0,-ang,0),
     [RA*.30,h,38-Math.abs(i-3)*4],null);}
   kput('finial',[CXs,YT+53,CZs],null,[7,18,7],null);}
  for(let i=0;i<3;i++){if(d===2&&i===1)continue;
   const C=[triU[i][0]-cU[0],triU[i][1]-cU[1]];
   kput(BOXC(d),[CXs+C[0]*ST*SPAN*.8,YT+52,CZs+C[1]*ST*SPAN*.8],null,[8,96,8],null);}}

 // ---- the lower city: the inverted pyramid ---------------------------------
 const NL=16,RL=(YW-YB)/NL,sl=k=>lerp(SB,1,Math.pow(k/NL,.80));
 // LIGHT damage only. The Screamers live in this thing: the lower city is
 // scarred, not broken. Panels sheared off the outer skin on the flank whose
 // shafts failed, over the lowest five bands only, strongest at the tip and
 // gone by 400 m. Nothing structural, and the promenade is untouched -- the
 // rest of the settlement is built on it.
 // The damaged zone has to reach ABOVE the shaft forest to be seen at all.
 // Measured: on this bearing the lower wall sits 49-144 m out from the plan
 // centre over bands 0-4, and the shaft bundle reaches ~233 m from its own
 // centre, so everything sheared down there is behind a screen of columns.
 // Bands 0-9 (300-500 m) put the upper half of the scar in clear air, which is
 // also the half the capping decks are there to close.
 const COLTOP=YB+10*RL;
 const TIPX=PL.O[0]*SPAN,TIPZ=PL.O[1]*SPAN;
 const strip=(x,z,y)=>{if(d!==2)return false;
  const ang=Math.atan2(z-TIPZ,x-TIPX);
  const rag=.34*fbm(y*.045,ang*3.1,9476,3)-.17;
  return Math.abs(wrapA(ang-STRIPA))<STRIPW*(1+rag*1.7);};
 const bite=(x,z,y)=>{if(!LOWDMG||d!==2||y>=COLTOP)return false;
  // A COHERENT wedge, not a per-quad noise threshold. Thresholding fbm reads as
  // extra windows at any distance: the damaged bands that clear the shaft
  // forest came out only 10-20% speckled and nothing was visible. This is one
  // bite out of one corner whose angular width closes as it rises, obvious low
  // down and gone by the top of the zone, where the capping decks meet it.
  const ang=Math.atan2(z-TIPZ,x-TIPX),da=Math.abs(wrapA(ang-FAILA));
  const rag=.34*fbm(ang*3.3,y*.02,9441,3)-.17;
  const f=Math.pow(1-(y-YB)/(COLTOP-YB),.85);
  return da<(.95*f+.13)*(1+rag);};
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
 const _fc=pullIn((COM[0]+Math.cos(FAILA)*.115)*SPAN,(COM[1]+Math.sin(FAILA)*.115)*SPAN,.62);
 const CX=_fc[0],CZ=_fc[1];
 // The crater reaches across the plaza's southern edge, which measured at 79 m
 // inside it, so the plaza clips it rather than the other way round.
 const crater=(x,z)=>LOWDMG&&d===2&&!inPlaza(x,z)
  &&Math.hypot(x-CX,z-CZ)<CRAT*(.72+.5*fbm(x*.004,z*.004,9434,3));
 for(let k=0;k<NL;k++){const y0=YB+k*RL,s0=sl(k),s1=sl(k+1);
  keep(RIS_L,gridSurface((u,v)=>{const Q=W(PL,u,s1);return[Q[0],y0+v*RL,Q[1]];},
   112,2,{uS:52,vS:2,hole:u=>{const Q=W(PL,u,s1);return crater(Q[0],Q[1])||bite(Q[0],Q[1],y0+RL*.5)
    ||strip(Q[0],Q[1],y0+RL*.5);}}));
  // soffit, v running outward-to-inward so the normal points DOWN at the ground
  keep(SOF_L,gridSurface((u,v)=>{const Q=W(PL,u,lerp(s1,s0,v));return[Q[0],y0,Q[1]];},
   112,2,{uS:52,vS:2,hole:(u,v)=>{const Q=W(PL,u,lerp(s1,s0,v));return crater(Q[0],Q[1]);}}));
  // DECKS behind the sheared skin. Shorn panels opened onto an empty shell; the
  // lower city has floors like anywhere else, and this is them in section. Only
  // generated where the skin actually went, tested at the OUTER radius so the
  // whole radial strip behind a missing panel is kept, and backed by a dark
  // inner wall so you are not looking clean through the building.
  // Decks behind the torn strip, on every band. Tested at the OUTER radius so
  // the whole radial slice behind a missing panel survives, and backed by a
  // dark wall so you are not looking clean through the building.
  if(d===2){const sk=u=>{const Q=W(PL,u,s1);return !strip(Q[0],Q[1],y0+RL*.5);};
   [0,.5].forEach(fr=>SH.push(gridSurface((u,v)=>{const Q=W(PL,u,lerp(s1*.99,s1*.46,v));
    return[Q[0],y0+RL*fr,Q[1]];},88,3,{uS:34,vS:3,hole:sk})));
   DK.push(gridSurface((u,v)=>{const Q=W(PL,u,s1*.46);return[Q[0],y0+v*RL,Q[1]];},
    88,2,{uS:34,vS:2,hole:sk}));
   const nq=Math.max(10,Math.round(90*s1));
   for(let j=0;j<nq;j++){const p=(j+.5)/nq;if(sk(p))continue;
    const N=pnorm(PL,p),qq=qFacing([N[0],0,N[1]]);
    for(let row=0;row<2;row++){const Q=W(PL,p,lerp(s1*.92,s1*.58,row*.6+.1));
     const hh=rr(4,8);
     kput(BOXC(d),[Q[0],y0+RL*(row?.5:0)+hh*.5,Q[1]],qq,[rr(6,12),hh,rr(5,9)],null);}}}
  if(LOWDMG&&d===2&&y0<COLTOP){const keep=(u)=>{const Q=W(PL,u,s1);return !bite(Q[0],Q[1],y0+RL*.5);};
   [0,.5].forEach(fr=>{
    SH.push(gridSurface((u,v)=>{const Q=W(PL,u,lerp(s1*.99,s1*.52,v));
     return[Q[0],y0+RL*fr,Q[1]];},96,3,{uS:34,vS:3,hole:keep}));});
   DK.push(gridSurface((u,v)=>{const Q=W(PL,u,s1*.52);return[Q[0],y0+v*RL,Q[1]];},
    96,2,{uS:34,vS:2,hole:keep}));
   // A solid deck right across the sheared sector at the TOP of each damaged
   // band, with no holes in it at all. This is what stops the scar reading as
   // one tall cavity: from above, from the side and from below you meet a floor
   // a band or two up rather than seeing the whole way in.
   SH.push(gridSurface((u,v)=>{const Q=W(PL,u,lerp(s1*1.0,s1*.50,v));
    return[Q[0],y0+RL*.99,Q[1]];},96,3,{uS:34,vS:3,
    hole:u=>{const Q=W(PL,u,s1);return !bite(Q[0],Q[1],y0+RL*.5);}}));
   const ni=Math.max(8,Math.round(70*s1));
   for(let j=0;j<ni;j++){const p=(j+.5)/ni;if(keep(p))continue;
    const N=pnorm(PL,p),qq=qFacing([N[0],0,N[1]]);
    for(let row=0;row<2;row++){const Q=W(PL,p,lerp(s1*.94,s1*.62,row*.55+.1));
     const hh=rr(4,8);
     kput(BOXC(d),[Q[0],y0+RL*(row?.5:0)+hh*.5,Q[1]],qq,[rr(6,13),hh,rr(5,10)],null);}}}
  // Cells hanging under the step. They are what makes the underside a coffered
  // ceiling rather than a flat plane, so the overgrowth pass has to dress THEM
  // and not the plane behind them -- moss laid on the soffit alone disappears
  // between the boxes from every angle on the ground. Recorded as they are
  // made, for the same reason the surfaces are.
  const nc=Math.max(6,Math.round(86*s1));
  for(let j=0;j<nc;j++){const p=(j+.5)/nc,N=pnorm(PL,p),q=qFacing([N[0],0,N[1]]);
   for(let row=0;row<2;row++){const Q=W(PL,p,lerp(s1,s0,.12+row*.34));
    if(crater(Q[0],Q[1])||bite(Q[0],Q[1],y0))continue;
    const h=rr(4,9),cw=rr(7,14),cd=rr(6,11);
    kput(BOXC(d),[Q[0],y0-h*.5,Q[1]],q,[cw,h,cd],null);
    CELLS.push({x:Q[0],z:Q[1],yb:y0-h,w:cw,d:cd,nx:N[0],nz:N[1],row:row});}}
  {const nw=Math.max(12,Math.round(320*s1)),WIN=d===0?'pane':'paneD';
   for(let j=0;j<nw;j++){const p=(j+.5)/nw;
    const Q=W(PL,p,s1),N=pnorm(PL,p),q=qFacing([N[0],0,N[1]]);
    if(crater(Q[0],Q[1])||bite(Q[0],Q[1],y0+RL*.5))continue;
    if(d>0&&rng()<.34)continue;
    for(let row=0;row<3;row++)
     kput(WIN,[Q[0]+N[0]*.35,y0+RL*(.22+row*.27),Q[1]+N[1]*.35],q,[2.5,3.1,1],null);}}}

 // ---- foliage in the blown holes ---------------------------------------------
 // The crater in the upper city and the torn strip below have been open long
 // enough for the jungle to have taken them. Growth clings round both rims and
 // hangs down inside, which is most of what says the damage is old rather than
 // this morning's.
 if(d===2){
  // THE CRATER RIM, not the crater. The old pass sampled points on and inside
  // an ellipsoid and kept the ones where ubite was TRUE -- that is the VOID, so
  // most of the growth was hanging in mid-air. Growth needs surviving fabric to
  // root in, so this walks the terraces that pass the crater and plants only
  // where the skin is still there and the hole is close by.
  for(let k=0;k<NU;k++){const y0=YW+k*RU,s0=su(k),s1=su(k+1);
   if(y0+RU<UCY-UCR*1.5||y0>UCY+UCR*1.5)continue;
   const np=Math.max(10,Math.round(130*s0));
   for(let j=0;j<np;j++){const p=(j+.5)/np;
    const Q=W(PU,p,lerp(s0,s1,.4));
    if(cut(p,y0+RU))continue;                    // no fabric here to grow on
    const dr=Math.hypot(Q[0]-UCX,(y0-UCY)*.8,Q[1]-UCZ);
    if(dr>UCR*1.45)continue;                     // only near the hole
    if(rng()<.35)continue;
    const N=pnorm(PU,p),sz=rr(3.5,11);
    FLORA.mass(Q[0],y0+RU+sz*.35,Q[1],sz*.8,2+Math.floor(rng()*2),
     ()=>new THREE.Color().setHSL(rr(.23,.33),rr(.3,.5),rr(.09,.2)),sz*.7);
    if(rng()<.35)FLORA.under(Q[0],y0+RU,Q[1],rr(1.5,4));
    if(rng()<.6){const R2=W(PU,p,s0);
     FLORA.curtain(R2[0]+N[0]*.6,y0+rr(.4,1)*RU,R2[1]+N[1]*.6,N[0],N[1],rr(12,46),rr(1.4,4),
      {flowers:rng()<.4});}}}
  for(let k=0;k<NL;k++){                        // and down the torn strip
   const y0=YB+k*RL,s1=sl(k+1),np=Math.round(120*s1);
   for(let j=0;j<np;j++){const p=(j+.5)/np;
    const Q=W(PL,p,s1);
    if(!strip(Q[0],Q[1],y0+RL*.5))continue;
    if(rng()<.45)continue;
    const N=pnorm(PL,p),yy=y0+rr(0,1)*RL,sz=rr(2.6,8),inn=rr(0,14);
    FLORA.mass(Q[0]-N[0]*inn,yy+sz*.3,Q[1]-N[1]*inn,sz*.8,2+Math.floor(rng()*2),
     ()=>new THREE.Color().setHSL(rr(.23,.33),rr(.3,.5),rr(.09,.2)),sz*.7);
    if(rng()<.6)FLORA.curtain(Q[0]+N[0]*.6,yy,Q[1]+N[1]*.6,N[0],N[1],rr(12,44),rr(1.4,3.6),
     {flowers:rng()<.3});}}}

 // ---- foliage on the upper half of the lower city ---------------------------
 // An inverted pyramid has no up-facing ledges: every step faces DOWN, which is
 // why the decor samplers only ever dressed the soffits and the upper bands
 // came out bare. This plants on the RISERS instead -- clumps rooted in the
 // joints with growth trailing below them.
 if(d>0)for(let k=Math.floor(NL/2);k<=NL-3;k++){
  const y0=YB+k*RL,s1=sl(k+1),np=Math.round(150*s1);
  for(let j=0;j<np;j++){const p=(j+.5)/np;
   if(rng()<.42)continue;
   const Q=W(PL,p,s1),N=pnorm(PL,p),yy=y0+rr(.08,.95)*RL,sz=rr(2.6,7.5);
   // Rooted IN the wall, not floating beside it: a clump of leaf cards pressed
   // against the riser with growth trailing below it.
   FLORA.mass(Q[0]+N[0]*sz*.22,yy,Q[1]+N[1]*sz*.22,sz*.75,2+Math.floor(rng()*2),
    ()=>new THREE.Color().setHSL(rr(.24,.33),rr(.32,.5),rr(.10,.20)),sz*.55);
   if(rng()<.5)FLORA.curtain(Q[0]+N[0]*.7,yy-sz*.3,Q[1]+N[1]*.7,N[0],N[1],rr(8,28),rr(1.2,3),
    {flowers:rng()<.3});}}

 // ---- inside the upper crater ------------------------------------------------
 // A dark shell just inside the skin, kept only where the crater took the outer
 // one, plus each level's floor plates ragged in section. Same lesson as the
 // Veladiga breach: a cut has to read as a hollow city, not as the inside of
 // the back wall.
 if(d===2){for(let k=0;k<NU;k++){const y0=YW+k*RU;
   if(y0+RU<UCY-UCR*1.4||y0>UCY+UCR*1.4)continue;
   DK.push(gridSurface((u,v)=>{const Q=W(PU,u,su(k)*.90);return[Q[0],y0+v*RU,Q[1]];},
    72,1,{uS:28,vS:1,hole:(u,v)=>!cutQ(W(PU,u,su(k)),y0+v*RU)}));
   SH.push(gridSurface((u,v)=>{const Q=W(PU,u,lerp(su(k),su(k)*.62,v));return[Q[0],y0,Q[1]];},
    72,3,{uS:28,vS:3,hole:(u,v)=>!cutQ(W(PU,u,su(k)),y0)||fbm(u*9+k,v*6,9435,3)<.22+.5*v*v}));}}

 // ---- closing the pyramids --------------------------------------------------
 // Both were open shells: risers and treads on the upper, risers and soffits on
 // the lower, and nothing across either end. Where one plan reaches past the
 // other -- which is most of the perimeter, since they are turned 120 deg --
 // you could look straight up into the hollow cone, or down into the inverted
 // one. Three caps: the great soffit under the upper city, the deck over the
 // lower city, and the floor of its truncated apex. They sit 2 m apart rather
 // than coplanar so the overlap cannot z-fight.
 SH.push(gridSurface((u,v)=>{const Q=W(PU,u,1-v);return[Q[0],YW,Q[1]];},
  112,6,{uS:52,vS:8,hole:(u,v)=>cut(u,YW+2)}));
 SH.push(gridSurface((u,v)=>{const Q=W(PL,u,1-v);return[Q[0],YW-2,Q[1]];},
  112,6,{uS:52,vS:8,hole:(u,v)=>{const Q=W(PL,u,1-v);return crater(Q[0],Q[1]);}}));
 SH.push(gridSurface((u,v)=>{const Q=W(PL,u,SB*(1-v));return[Q[0],YB,Q[1]];},
  72,3,{uS:24,vS:3,hole:(u,v)=>{const Q=W(PL,u,SB*(1-v));return crater(Q[0],Q[1]);}}));
 // The lower city's roof is open sky wherever the upper pyramid does not cover
 // it, which on a 120 deg turn is most of one point. That is the park and
 // promenade level of the sheets, so it gets planted rather than left blank.
 for(let i=0;i<300;i++){
  const Q=W(PL,rng(),Math.sqrt(rng())*.97);
  const vx=Q[0]/SPAN-PU.O[0],vz=Q[1]/SPAN-PU.O[1],m=Math.hypot(vx,vz)||1e-6;
  if(m<planR(PU,vx/m,vz/m)*1.01)continue;          // roofed by the upper city
  if(crater(Q[0],Q[1])||inPlaza(Q[0],Q[1]))continue;
  if(rng()<.42){const h=rr(5,17);
   kput(BOXC(d),[Q[0],YW-2+h*.5,Q[1]],qEuler(0,rng()*TAU,0),[rr(10,26),h,rr(9,22)],null);}
  else if(d!==2)VEG.tree(Q[0],YW-2,Q[1],i%3,rr(5,10));}
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
  const CC0=clusterAt(c),CC=pullIn(CC0[0],CC0[1],.62),cx=CC[0],cz=CC[1];
  const n=centre?11:8;
  for(let i=0;i<n;i++){
   const a=i/n*TAU+c*.7,rd=(i===0&&!centre)?0:rr(36,78);
   // Clamp every shaft under the soffit. The clusters sit a fixed 0.155 of
   // plan units from the centre of mass, but the lower plan's radius runs 0.18
   // toward +x and 0.64 toward the apex, so on the short side the bundle
   // walked out from under the mass entirely -- measured at rho 1.18 for the
   // cluster centre and 1.61 for its outermost shaft.
   const XZ=pullIn(cx+Math.cos(a)*rd,cz+Math.sin(a)*rd,.88),x=XZ[0],z=XZ[1];
   const broke=LOWDMG&&d===2&&Math.abs(wrapA(Math.atan2(z-COM[1]*SPAN,x-COM[0]*SPAN)-FAILA))<.95;
   const vis=shaft(x,z,rr(13,23),broke&&rng()<.82);
   // bracing only in the visible length, below the soffit
   if(i>0&&!broke)for(let b=1;b<=3;b++)
    beam(BOXC(d),[x,vis*b/4,z],[cx,vis*b/4,cz],3.4,3.4);}}
 if(LOWDMG&&d===2){for(let i=0;i<9;i++){const a=FAILA+rr(-1.1,1.1);
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
 // THE VILLAGE'S DWELLINGS. About two thirds of the ancient industry sheds are
 // gone -- fallen, or quarried for the wall. What survives does so in CLUSTERS
 // of six to ten neighbours, because a shed that still has its neighbours still
 // has their shared walls holding it up, and those are the ones the Screamers
 // could reoccupy. Two clusters per sector, on two different ranks.
 const IND=[[.43,7],[.57,9],[.70,11],[.83,12],[.93,14]];
 const CLUST=[],SHED=[];
 for(let e=0;e<6;e++){const a0=e/6*TAU-Math.PI/6+.045,a1=(e+1)/6*TAU-Math.PI/6-.045;
  const rA=Math.floor(rng()*5);let rB=Math.floor(rng()*5);if(rB===rA)rB=(rB+2)%5;
  [rA,rB].forEach(ri=>{const n=IND[ri][1],len=Math.min(n,6+Math.floor(rng()*5));
   const j0=Math.floor(rng()*(n-len+1));
   let sx=0,sz=0,cn=0,rad=0;
   for(let j=j0;j<j0+len;j++){const t=(j+.5)/n,a=lerp(a0,a1,t);
    const R=hexR(HEXR,a)*IND[ri][0]*(1+.018*fbm(a*3,ri,9439,2));
    const x=Math.cos(a)*R,z=Math.sin(a)*R;
    if(Math.hypot(x,z)<250)continue;
    const yy=plateY(x,z),tan=R*(a1-a0)/n*.80,dep=rr(26,46);
    const q0=qEuler(0,-a,0),nx=Math.cos(a),nz=Math.sin(a),tgx=-Math.sin(a),tgz=Math.cos(a);
    const big=Math.max(dep,tan),kind=Math.floor(rng()*3),bh=kind===1?rr(15,22):rr(9,16);
    // ANCIENT CUES, so these read as salvaged Ancient fabric rather than as
    // huts: a chamfered plinth under everything, a cornice slab, fluted
    // pilasters or a barrel vault or an apsidal end, and the Ancients' own
    // arched openings. The tribal work is only what sits ON them.
    kput(SLABC(d),[x,yy+1.2,z],q0,[big*.62,2.4,big*.62],null);
    if(kind===0){                                   // pilastered block + cornice
     kput(BOXC(d),[x,yy+2.4+bh*.5,z],q0,[dep,bh,tan],null);
     kput(SLABC(d),[x,yy+2.4+bh+1,z],q0,[big*.60,2,big*.60],null);
     for(let f=-1;f<=1;f+=2)for(let g=-1;g<=1;g+=2)
      // square piers, not the kit's colR: that item flares to a goblet and at
      // shed scale it read as a row of urns rather than as pilasters
      kput(BOXC(d),[x+nx*dep*.46*f+tgx*tan*.42*g,yy+2.4+bh*.5,
                    z+nz*dep*.46*f+tgz*tan*.42*g],q0,[2.8,bh,2.8],null);
    }else if(kind===1){                             // barrel-vaulted hall
     kput(BOXC(d),[x,yy+2.4+bh*.5,z],q0,[dep,bh,tan],null);
     beam(VAULTC(d),[x-nx*dep*.5,yy+2.4+bh,z-nz*dep*.5],
                    [x+nx*dep*.5,yy+2.4+bh,z+nz*dep*.5],tan*.99,tan*.99);
    }else{                                          // apsidal end
     kput(BOXC(d),[x-nx*dep*.16,yy+2.4+bh*.5,z-nz*dep*.16],q0,[dep*.68,bh,tan],null);
     SH.push(lathe({rFn:()=>tan*.5,H:bh,nu:16,nv:3})
      .translate(x+nx*dep*.34,yy+2.4,z+nz*dep*.34));
     kput(SLABC(d),[x+nx*dep*.34,yy+2.4+bh+.8,z+nz*dep*.34],null,[tan*.58,1.6,tan*.58],null);}
    {const na=Math.max(2,Math.round(dep/11));       // arcade down the long side
     for(let j=0;j<na;j++){const u=(j+.5)/na-.5;
      for(let sd=-1;sd<=1;sd+=2)
       kput(d>0?'paneD':'pane',[x+nx*u*dep*.9+tgx*tan*.52*sd,yy+2.4+bh*.45,
                                z+nz*u*dep*.9+tgz*tan*.52*sd],
        qFacing([tgx*sd,0,tgz*sd]),[2.6,3.4,1],null);}}
    kput('archOpen',[x+nx*dep*.5,yy+2.4+bh*.30,z+nz*dep*.5],qFacing([nx,0,nz]),[2.2,2.0,2.4],null);
    // and the tribe's own work on top of it
    if(rng()<.75)kput('thatchR',[x+tgx*tan*rr(-.2,.2),yy+2.4+bh+rr(2,5),z+tgz*tan*rr(-.2,.2)],
     qEuler(0,-a+rr(-.3,.3),0),[dep*rr(.40,.66),rr(7,12),tan*rr(.40,.62)],null);
    for(let q=0;q<2;q++)kput('postW',[x+nx*dep*.55+tgx*tan*(q?.4:-.4),yy+4,
      z+nz*dep*.55+tgz*tan*(q?.4:-.4)],null,[1.6,8,1.6],null);
    SHED.push({x:x,z:z,r:Math.max(dep,tan)*.62});
    sx+=x;sz+=z;cn++;rad=Math.max(rad,tan);}
   if(cn>=4)CLUST.push({x:sx/cn,z:sz/cn,n:cn,a:(a0+a1)*.5,r:rad*cn*.42});});}
 // Handed to the village builder, which runs next: it needs the cluster
 // centroids for the trails and the sheds, and the shaft bundle for the lobby.
  // Handed to the village. Two different surfaces get confused easily, so both
 // are named: the PROMENADE is the walkway ring round the foot of the upper
 // pyramid, only 45-100 m wide, and the PLAZA is the lower city's roof deck,
 // which is the only large open ground in the whole structure.
 const _ap=[triU[1][0]-cU[0],triU[1][1]-cU[1]],_am=Math.hypot(_ap[0],_ap[1]);
 const _lp=[triL[2][0]-cL[0],triL[2][1]-cL[1]],_lm=Math.hypot(_lp[0],_lp[1]);
 SCREAM_PROM={o:[PU.O[0]*SPAN,PU.O[1]*SPAN],y:YW+15,
  ax:[_ap[0]/_am,_ap[1]/_am],apex:_am*1.07*SPAN};
 // Exact containment for the lower roof: a point is on the deck when it is
 // inside the plan outline at full scale. halfAt() is only a linear
 // approximation along the apex axis and let furniture float off the edges.
 const onDeck=(x,z)=>{const vx=x/SPAN-PL.O[0],vz=z/SPAN-PL.O[1],m=Math.hypot(vx,vz);
  return m<1e-6||m<planR(PL,vx/m,vz/m);};
 // Where the upper city's base wall comes nearest the plaza's centroid: the
 // obvious place for the tribe to have cut a way through, and derived rather
 // than chosen.
 // The doorway has to sit FLUSH in the wall, which means using the wall's own
 // edge normal, not the radial direction to the plaza. On a plan this elongated
 // the two differ by tens of degrees -- the same mistake as the cell facings
 // earlier -- and the arch ended up skewed across the face. Walk the outline,
 // take the parameter nearest the plaza, and read pnorm there.
 const _pc=[(PLZ[0][0]+PLZ[1][0]+PLZ[2][0])/3,(PLZ[0][1]+PLZ[1][1]+PLZ[2][1])/3];
 let _bp=0,_bd=1e18;
 for(let i=0;i<360;i++){const pq=i/360,Qq=W(PU,pq,1);
  const dq=Math.hypot(Qq[0]-_pc[0],Qq[1]-_pc[1]);
  if(dq<_bd){_bd=dq;_bp=pq;}}
 const _dp2=W(PU,_bp,1),_dn=pnorm(PU,_bp);
 SCREAM_PLAZA={o:[PL.O[0]*SPAN,PL.O[1]*SPAN],y:YW-2,poly:PLZ,inPlaza:inPlaza,onDeck:onDeck,
  door:_dp2,doorAng:Math.atan2(_dn[1],_dn[0]),doorN:_dn,doorY:YW,
  ax:[_lp[0]/_lm,_lp[1]/_lm],apex:_lm*SPAN,
  // half-width of the plan at a station f along the apex axis, so anything
  // placed out there can be sized to the ground it actually has
  halfAt:f=>Math.max(0,(_lm*SPAN-f))*Math.tan(15*Math.PI/180)};
 SCREAM={clusters:CLUST,sheds:SHED,orchards:ORCH,com:[COM[0]*SPAN,COM[1]*SPAN],hexr:HEXR,plate:plateY,gx:gx,gz:gz};
 // the paved apron round the vertical structure
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(40,250,v);
  return[r*Math.cos(th),12.3,r*Math.sin(th)];},64,4,{uS:26,vS:10}));
 const ROADS=[];
 for(let s2=0;s2<6;s2++){const a=s2/6*TAU+Math.PI/6;
  beam(d>0?'boxR':'boxD',[0,7.2,0],[Math.cos(a)*HEXR*.96,7.2,Math.sin(a)*HEXR*.96],16,.6);
  ROADS.push([Math.cos(a),Math.sin(a),HEXR*.96]);}
 SCREAM.roads=ROADS;SCREAM.rim=HEXR;

 // ---- merge and dress --------------------------------------------------------
 meshMerged(SH,CONC(dd),G);meshMerged(GRD,d>0?MAT.mud:MAT.slab,G);
 if(DK.length)meshMerged(DK,MAT.guts,G);
 // OVERGROWTH. The hyperjungle has taken the whole mass except the level or
 // two either side of the promenade, which the Screamers keep cut back because
 // they live on it. SH is pushed in a known order, so the eligible bands are a
 // slice of it rather than a second pass over the geometry -- and, more to the
 // point, that order is how we know which faces are TREADS and which are
 // SOFFITS. The upper pyramid steps IN as it rises, so its horizontals face the
 // sky; the lower one is inverted, so every one of its horizontals is a
 // ceiling. faceSamples() cannot tell them apart -- it tests |ny|, because
 // these shells are DoubleSide and their winding is not dependable -- which is
 // why the old pass grew moss standing on top of the underside of the lower
 // city, sunk into the slab and lit from inside the concrete.
 //
 // Accounted separately as `flor`: this is the jungle climbing the building,
 // it is the biggest single population of anything here, and folding it into
 // the arcology's own budget line made both unreadable.
 // The promenade and the band either side of it stay cut back: the Screamers
 // live on them. Everything above and below has gone to the jungle.
 const OVG_UP=TRD_U.slice(2);
 // Published so a headless probe can check the split is still right -- one
 // tread and one soffit per band, not whatever SH's stride happens to be.
 window._hexSurfaces={bandsUpper:NU,treads:TRD_U.length,risersUpper:RIS_U.length,
  bandsLower:NL,soffits:SOF_L.length,risersLower:RIS_L.length};
 if(d>0){
  const _tc=TSTAT.cur;TSTAT.cur='flor/'+d;
  stainsFromLedge(OVG_UP,0,0,0,200,28);
  // THE TREADS of the upper pyramid: moss, the understorey mix, and trees.
  // EVEN DISTRIBUTION. upFaces()/ledgePoints() sample by triangle AREA, so the
  // wide lower terraces took nearly all the trees and vines and the upper ones
  // came out bare. Walking each band and spacing by its own perimeter gives the
  // same count per metre of terrace wherever you are on the mass.
  for(let k=2;k<NU;k++){const y0=YW+k*RU,s0=su(k),s1=su(k+1),yT=y0+RU;
   const nt=Math.max(6,Math.round(54*s0));
   for(let j=0;j<nt;j++){const p=(j+rr(.15,.85))/nt;
    if(cut(p,yT))continue;
    const Q=W(PU,p,lerp(s0,s1,rr(.18,.82)));
    FLORA.small(Q[0],yT,Q[1],rr(16,46),Math.floor(rng()*4));}
   // undergrowth between the trees, and moss over the whole tread
   const nu2=Math.max(12,Math.round(190*s0));
   for(let j=0;j<nu2;j++){const p=(j+rr(.1,.9))/nu2;
    if(cut(p,yT))continue;
    const Q=W(PU,p,lerp(s0,s1,rr(.10,.92)));
    if(rng()<.55)FLORA.under(Q[0],yT,Q[1],rr(1.6,5));
    else for(let q=0,nq=1+Math.floor(rng()*3);q<nq;q++)
     FLORA.moss(Q[0]+rr(-6,6),yT,Q[1]+rr(-6,6),rr(3,11),false);}
   // THE RISER. From anywhere but directly overhead this is most of what you
   // see of the upper city -- the treads are edge-on and the faces are not --
   // so growth that stops at the tread leaves the mass reading as clean
   // concrete with a green fringe. Clumps rooted in the joints, thickest low
   // down where the runoff is.
   const nr2=Math.max(8,Math.round(90*s0));
   for(let j=0;j<nr2;j++){const p=(j+rr(.1,.9))/nr2;
    if(cut(p,y0))continue;
    const Q=W(PU,p,s0),N=pnorm(PU,p),v=rr(0,1),sz=rr(2.2,6.5)*(1-.45*v);
    if(rng()>.78-.30*v)continue;
    FLORA.mass(Q[0]+N[0]*sz*.25,y0+v*RU,Q[1]+N[1]*sz*.25,sz*.8,1+Math.floor(rng()*2),
     ()=>new THREE.Color().setHSL(rr(.23,.33),rr(.30,.5),rr(.10,.20)),sz*.5);}
   // THE TREAD EDGE: moss creeping over the lip and curtains hanging off it.
   const nv2=Math.max(6,Math.round(48*s0));
   for(let j=0;j<nv2;j++){const p=(j+rr(.2,.8))/nv2;
    const Q=W(PU,p,s0),N=pnorm(PU,p);
    if(cut(p,y0))continue;
    FLORA.lip(Q[0],y0+RU*0,Q[1],N[0],N[1],rr(3,9),rr(1.5,5));
    FLORA.curtain(Q[0]+N[0]*.6,y0-.2,Q[1]+N[1]*.6,N[0],N[1],rr(10,46),rr(1.5,4.5),{flowers:rng()<.5});}}
  // THE SOFFITS of the inverted lower city. Everything here hangs: moss rolled
  // over to face the ground, aerial roots, beards and curtains off the arris.
  //
  // Dressed in two parts, because the underside is not a plane. The CELLS are
  // the coffers hanging off it and they are what you actually see from the
  // ground, so they carry the moss; the strip of soffit left between them gets
  // a thinner walk. Both are walked at a fixed spacing rather than area-
  // sampled: a fixed sample count per band gave the 40 m ring at the tip as
  // much growth as the 440 m ring at the top, and scattered discs read as a
  // bare ceiling with spots on it when the steps are seen at a grazing angle,
  // which from the ground they always are.
  CELLS.forEach(c=>{
   // the cell's own underside: two or three overlapping mats sized to the box
   const R=Math.max(c.w,c.d)*.6;
   for(let q=0,nq=1+Math.floor(rng()*2);q<nq;q++)
    FLORA.moss(c.x+rr(-.4,.4)*c.w,c.yb,c.z+rr(-.4,.4)*c.d,rr(R*.7,R*1.4),true);
   if(rng()<.65)FLORA.roots(c.x+rr(-.45,.45)*c.w,c.yb-.1,c.z+rr(-.45,.45)*c.d,rr(6,34),rr(.7,2.6));
   if(rng()<.42)FLORA.curtain(c.x+c.nx*c.d*.5,c.yb+rr(0,3),c.z+c.nz*c.d*.5,c.nx,c.nz,
    rr(12,56),rr(2,6),{flowers:rng()<.4});
   if(rng()<.12)FLORA.bracket(c.x+c.nx*c.d*.5,c.yb+rr(.5,3),c.z+c.nz*c.d*.5,rr(1.2,3.2));});
  for(let k=0;k<=NL-3;k++){
   const y0=YB+k*RL,s0=sl(k),s1=sl(k+1);
   const np=Math.max(14,Math.round(30+220*s1));
   for(let j=0;j<np;j++){
    const p=(j+rr(.15,.85))/np,N=pnorm(PL,p);
    // across the step, outer arris inward. The light comes in from the rim, so
    // the inner end of every step is the dark part and grows least.
    for(let q=0;q<2;q++){
     const t=(q+rr(0,1))/2,lit=1-t*.86;
     if(rng()>.12+.88*lit)continue;
     const Q=W(PL,p,lerp(s1,s0,t));
     FLORA.moss(Q[0],y0,Q[1],rr(6,22)*(.40+.60*lit),true);}
    // the arris itself: the crest of the growth, and what it hangs from
    const QE=W(PL,p,s1),inn=rr(1,7);
    FLORA.moss(QE[0]-N[0]*inn,y0,QE[1]-N[1]*inn,rr(8,24),true);
    if(rng()<.45)FLORA.roots(QE[0]-N[0]*rr(.5,5),y0-.2,QE[1]-N[1]*rr(.5,5),rr(6,34),rr(.7,2.6));
    if(rng()<.35)FLORA.curtain(QE[0]-N[0]*rr(.5,3),y0-.3,QE[1]-N[1]*rr(.5,3),N[0],N[1],
      rr(12,56),rr(2,6),{flowers:rng()<.4});}}
  // and the risers between them, which are ordinary walls
  for(let k=0;k<=NL-3;k++){const y0=YB+k*RL,s1=sl(k+1);
   const nv2=Math.max(6,Math.round(44*s1));
   for(let j=0;j<nv2;j++){const p=(j+rr(.2,.8))/nv2;
    const Q=W(PL,p,s1),N=pnorm(PL,p);
    FLORA.curtain(Q[0]+N[0]*.6,y0+rr(.35,.95)*RL,Q[1]+N[1]*.6,N[0],N[1],rr(12,50),rr(1.5,4),{flowers:rng()<.35});}}
  TSTAT.cur=_tc;
  scatterMoss(0,0,0,180,HEXR,340,4);rubbleRing(0,0,0,HEXR*.4,HEXR,240,7);
  trees(0,0,HEXR*1.02,HEXR*1.9,220);}
 figures(CX,CZ,8,140);
 KOFF=[0,0,0];return G;}
