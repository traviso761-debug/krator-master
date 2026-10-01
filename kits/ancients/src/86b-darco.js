// ================================================================= DARCO ARCOLOGY — the swept horn
// The recognisable thing about Darco is not its texture, it is its AXIS. A
// heavy bulbous foot rises almost vertically, necks in, and then curves
// steadily backward into a long narrowing horn that ends 176 m behind its own
// base and 300 m up. So the whole builder is one swept surface: a spine curve
// in the x/y plane, sampled at unit speed, carrying a cross-section whose size
// and shape both change along it.
//
// The spine is INTEGRATED, not drawn. phi(t) = PHI * t^PEX is the tangent angle
// from vertical; the curve is the integral of (-sin phi, cos phi). That gives a
// curvature that grows monotonically, which is what makes the foot read as
// upright and the horn as swept rather than as a tower with a bent stick on
// top. Integrating also makes v an ARC-LENGTH parameter for free, so cells,
// windows and slot metrics are uniform along the whole sweep instead of
// crowding wherever the curve is steep.
//
// Everything else hangs off two functions: P(u,v,k) — the surface point at
// section angle u, spine parameter v, radial scale k — and its finite-
// difference normal. The inner shell is the same surface at k=INS, so the
// aperture recesses, the decay holes and the broken horn all show the same
// coherent inner mass without a second form to keep in step.
// THE PALETTE, and why it moved. These were 0x100e0c / 0x1e1a16 — near-black,
// about a thirteenth of the kit's own concrete (0xd2cec6 intact, 0x7c746c
// ruined). The swept horn carried it well standing alone on its plinth and
// badly everywhere else: put Darco in a row beside the white types and it read
// as a different material from a different building set, which is why it could
// only ever be a standalone target.
//
// These values are roughly half the kit's intact concrete on the same warm
// grey: still the darkest type in the kit by a wide margin, and still the mass
// the ember openings need to read against, but unmistakably the same stone as
// everything else, weathered further. The ruin stays LIGHTER than the intact,
// as the original palette had it — this thing bleaches as it goes.
MAT.darcoSkin=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x625a52,roughness:1,metalness:0,side:DS});
MAT.darcoSkinR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x786e64,roughness:1,metalness:0,side:DS});
MAT.darcoDeck=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6e655c,roughness:1,metalness:0,side:DS});
MAT.darcoDeckR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x847a70,roughness:1,metalness:0,side:DS});
// The recess backs and the broken interior. MAT.dark takes enough hemisphere
// light to read as a disc of sky seen through the aperture, which is exactly
// the failure a recessed inner surface is meant to avoid.
MAT.darcoVoid=new THREE.MeshStandardMaterial({color:0x030405,roughness:1,metalness:0,side:DS});
// The kit's light strips are CYAN, which is the Ancients' intact-work signal.
// Darco's openings are a furnace colour instead, so it reads as a different
// kind of building rather than a dark copy of everything else.
const DARCO_EMBER=new THREE.Color(0xff4a12), DARCO_COAL=new THREE.Color(0x050404);
kdef('dkRib',new THREE.BoxGeometry(1,1,1),MAT.darcoSkin); kdef('dkRibR',new THREE.BoxGeometry(1,1,1),MAT.darcoSkinR);
kdef('dkDisc',new THREE.CylinderGeometry(1,1,1,40),MAT.darcoDeck); kdef('dkDiscR',new THREE.CylinderGeometry(1,1,1,40),MAT.darcoDeckR);
kdef('dkCol',hyperGeo(1,1,1.6),MAT.darcoSkin); kdef('dkColR',hyperGeo(1,1,1.6),MAT.darcoSkinR);
// The kit's archOpen is MAT.dark, which on a near-black wall picks up enough
// hemisphere light to read as a row of pale headstones. Same geometry, void.
kdef('dkArch',arcWindowGeo(6,9,1.2),MAT.darcoVoid);

function buildDarco(scene,gx,gz,d){reseed(9650+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const skin=d>0?MAT.darcoSkinR:MAT.darcoSkin, deckM=d>0?MAT.darcoDeckR:MAT.darcoDeck;
 const DBOX=d>0?'dkRibR':'dkRib', DDISC=d>0?'dkDiscR':'dkDisc', DCOL=d>0?'dkColR':'dkCol';
 const SH=[],DK=[],GRD=[];

 // ---- the spine -------------------------------------------------------------
 const HGT=300,PHI=1.45,PEX=1.7,OX=60,RX0=88,RZ0=112,INS=.80,NS=400;
 const SP=[];let LEN=1;
 {let sx=0,sy=0;SP.push([0,0,1,0]);
  for(let i=0;i<NS;i++){const tm=(i+.5)/NS,pm=PHI*Math.pow(tm,PEX);
   sx-=Math.sin(pm)/NS;sy+=Math.cos(pm)/NS;
   const pe=PHI*Math.pow((i+1)/NS,PEX);
   SP.push([sx,sy,Math.cos(pe),Math.sin(pe)]);}
  LEN=HGT/SP[NS][1];                                  // total arc length, m
  for(let i=0;i<=NS;i++){SP[i][0]=SP[i][0]*LEN+OX;SP[i][1]*=LEN;}}
 const SPn=t=>{const q=clamp(t,0,1)*NS,i=Math.min(NS-1,Math.floor(q)),f=q-i,A=SP[i],B=SP[i+1];
  return[lerp(A[0],B[0],f),lerp(A[1],B[1],f),lerp(A[2],B[2],f),lerp(A[3],B[3],f)];};

 // ---- the section -----------------------------------------------------------
 // prof(t) is the whole silhouette in one line: a taper to a blunt tip, a
 // gaussian BULGE at t=.19 (the bulbous foot) and a gaussian WAIST at t=.55
 // (the neck that separates foot from horn). Nothing else decides how heavy the
 // building looks.
 const prof=t=>Math.pow(1-t*.985,.62)
   *(1+.34*Math.exp(-Math.pow((t-.19)/.19,2)))
   *(1-.22*Math.exp(-Math.pow((t-.55)/.16,2)));
 const RM=t=>prof(t)*(RX0+RZ0)*.5;                    // mean section radius, m
 // Squarish superellipse low down (the Ancients' slab habit), round at the tip;
 // a teardrop bias toward +N; ten shallow flutes; a slow fbm wobble so the
 // revolve is not mechanical.
 const sect=(a,t)=>se(a,lerp(3.1,2.0,clamp(t*1.4,0,1)))
   *(1+.10*Math.cos(a))
   *(1+.048*(1-.45*t)*Math.cos(10*a))
   *(1+.05*(fbm(Math.cos(a)*1.3+3,Math.sin(a)*1.3+3,t*3.4+11,2)*2-1));
 // u runs round the section (u=0 is +N, the convex back / top of the horn;
 // u=.5 is -N, the concave belly / underside of the horn), v along the spine.
 const P=(u,v,k)=>{const S=SPn(v),a=u*TAU,pr=prof(v)*(k===undefined?1:k),R=sect(a,v);
  const lx=RX0*pr*R*Math.cos(a),lz=RZ0*pr*R*Math.sin(a);
  return[S[0]+lx*S[2],S[1]+lx*S[3],lz];};
 const NRM=(u,v)=>{const e=.0018,vv=clamp(v,e,1-e);
  const p=P(u,vv,1),a=P(u+e,vv,1),b=P(u,vv+e,1);
  const ux=a[0]-p[0],uy=a[1]-p[1],uz=a[2]-p[2],wx=b[0]-p[0],wy=b[1]-p[1],wz=b[2]-p[2];
  let nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;const L=Math.hypot(nx,ny,nz)||1;
  nx/=L;ny/=L;nz/=L;const S=SPn(vv);
  if(nx*(p[0]-S[0])+ny*(p[1]-S[1])+nz*p[2]<0){nx=-nx;ny=-ny;nz=-nz;}
  return[nx,ny,nz];};

 // ---- openings --------------------------------------------------------------
 // Apertures and slots are placed and measured in METRES on the surface, not in
 // (u,v): a circle of constant radius in parameter space is an ellipse on a
 // surface whose circumference falls from 750 m to 60 m, and the two apertures
 // at v=.17 would not have matched the one at v=.62.
 const wrapU=x=>x-Math.round(x);
 const APS=[{u:0,v:.27,r:36},{u:.5,v:.36,r:26},{u:.25,v:.17,r:30},{u:.75,v:.17,r:30},{u:.5,v:.615,r:15}];
 const aperD=(u,v,A)=>Math.hypot(wrapU(u-A.u)*TAU*RM(A.v),(v-A.v)*LEN);
 const inAper=(u,v,f)=>{for(let i=0;i<APS.length;i++)if(aperD(u,v,APS[i])<APS[i].r*f)return APS[i];return null;};
 // w = circumferential length, h = length along the spine, both in metres. A
 // wide short one is a gill; the tall narrow one at u=.5 is the seam that runs
 // the length of the horn's underside.
 const SLOT=[{u:0,v:.155,w:150,h:6},{u:.5,v:.205,w:96,h:5},{u:.5,v:.44,w:86,h:5},
             {u:0,v:.545,w:60,h:4.4},{u:.25,v:.325,w:52,h:4.4},{u:.75,v:.325,w:52,h:4.4},
             {u:0,v:.70,w:40,h:3.6},{u:.5,v:.80,w:7,h:112}];
 const inSlot=(u,v,piers)=>{for(let i=0;i<SLOT.length;i++){const S=SLOT[i];
   const mu=wrapU(u-S.u)*TAU*RM(S.v),mv=(v-S.v)*LEN;
   if(Math.abs(mu)<S.w*.5&&Math.abs(mv)<S.h*.5){
    if(piers&&S.w>20&&((mu+S.w*.5)%11+11)%11<1.9)return null;   // mullion piers
    return S;}}
  return null;};
 // the ruin: eaten fabric, and the horn snapped off on a ragged line
 const rot=holeFn(d>0?.50:0,9653,null,1.15);
 const VCUT=.845;
 const cutV=u=>d>0?VCUT+.05*(fbm(u*6,1.7,9655,3)-.5):2;
 const gone=(u,v)=>v>cutV(u);
 const VTOP=d>0?VCUT+.03:1;

 REGISTER({name:'Darco Arcology ('+STATE(d)+')',x:20,z:0,r:320,h:305});
 REGISTER({name:'Darco — the lower mass',x:OX,z:0,r:150,h:140});
 REGISTER({name:'Darco — the horn',x:-60,z:0,y:225,r:115,h:85});
 REGISTER({name:'Darco — the plaza',x:0,z:0,r:260,h:36});
 if(d>0)REGISTER({name:'Darco — the fallen horn',x:-318,z:104,r:120,h:70});

 // ---- the skin --------------------------------------------------------------
 SH.push(gridSurface((u,v)=>P(u,v,1),224,184,{uS:72,vS:48,hole:(u,v)=>
   gone(u,v)||!!inAper(u,v,1)||!!inSlot(u,v,true)||(rot?rot(u,v*LEN):false)}));
 // the inner mass: the same sweep at INS. Every hole in the skin — decay,
 // aperture or break — looks onto this, so the building is never a paper shell.
 DK.push(gridSurface((u,v)=>P(u,v,INS),128,110,{uS:40,vS:28,hole:(u,v)=>v>cutV(u)+.012}));

 // aperture throats and recess backs
 APS.forEach(A=>{
  if(d>0&&A.v>VCUT)return;
  const uv=(th,f)=>[A.u+Math.cos(th)*A.r*f/(TAU*RM(A.v)),A.v+Math.sin(th)*A.r*f/LEN];
  SH.push(gridSurface((u,w)=>{const q=uv(u*TAU,1-.08*w);return P(q[0],q[1],lerp(1,INS,w));},44,4,{uS:14,vS:3}));
  DK.push(gridSurface((u,w)=>{const q=uv(u*TAU,(1-w)*.94);return P(q[0],q[1],INS);},44,5,{uS:12,vS:5}));
  // A grille across the recess back and an ember ring in front of it. Without
  // them the cap is an evenly lit disc that reads as sky seen through a hole.
  const ne=Math.max(10,Math.round(A.r*.55));
  for(let i=0;i<ne;i++){const th=(i+.5)/ne*TAU,q=uv(th,.60),p=P(q[0],q[1],INS),n=NRM(q[0],q[1]);
   const lit=d>0?rng()<.22:true;
   kput('cell',[p[0]+n[0]*1.1,p[1]+n[1]*1.1,p[2]+n[2]*1.1],qFacing(n),[TAU*A.r*.6/ne*.9,3.4,1],
    lit?DARCO_EMBER.clone().multiplyScalar(rr(.26,.62)):DARCO_COAL);}
  for(let i=0;i<12;i++){const th=i/12*TAU;
   const a0=uv(th,.28),a1=uv(th,.90);
   beam(DBOX,P(a0[0],a0[1],INS+.03),P(a1[0],a1[1],INS+.03),2.2,2.2);}
  for(let g=0;g<2;g++){const rf=.42+g*.34,nn2=Math.max(10,Math.round(A.r*rf*.9));
   for(let i=0;i<nn2;i++){const t0=i/nn2*TAU,t1=(i+1)/nn2*TAU;
    const a0=uv(t0,rf),a1=uv(t1,rf);
    beam(DBOX,P(a0[0],a0[1],INS+.035),P(a1[0],a1[1],INS+.035),2.2,2.2);}}
  // a chamfered collar standing proud of the skin, like every other Ancient rim
  const nc=Math.max(14,Math.round(A.r*.8));
  for(let i=0;i<nc;i++){const t0=i/nc*TAU,t1=(i+1)/nc*TAU;
   if(d>0&&rng()<.3)continue;
   const a0=uv(t0,1.06),a1=uv(t1,1.06);
   beam(DBOX,P(a0[0],a0[1],1.02),P(a1[0],a1[1],1.02),3.2,5.4);}});

 // ember panels behind the slots, recessed 7% of the local radius
 SLOT.forEach(S=>{
  const seg=4.6,n=Math.max(2,Math.round(S.w/seg));
  const mh=Math.max(2,Math.round(S.h/4.6));
  for(let i=0;i<n;i++){const mu=(-S.w*.5)+(i+.5)*S.w/n;
   if(S.w>20&&((mu+S.w*.5)%11+11)%11<1.9)continue;
   for(let j=0;j<mh;j++){const mv=(-S.h*.5)+(j+.5)*S.h/mh;
    const u=S.u+mu/(TAU*RM(S.v)),v=S.v+mv/LEN;
    if(gone(u,v))continue;
    const p=P(u,v,1-.07),n2=NRM(u,v);
    const lit=d>0?rng()<.18:rng()<.82;
    kput('cell',[p[0],p[1],p[2]],qFacing(n2),[S.w/n*.95,S.h/mh*1.05,1],
     lit?DARCO_EMBER.clone().multiplyScalar(rr(.24,.58)):DARCO_COAL);}}});

 // ---- the cellular skin -----------------------------------------------------
 // Rows are spaced by ARC LENGTH and the count per row is set from the local
 // circumference, so the cells stay ~4.8 m apart from the 750 m girth of the
 // foot to the 60 m girth of the horn instead of collapsing into a smear.
 {const NVW=120;
  for(let j=0;j<NVW;j++){const v=(j+.4)/NVW;if(v>VTOP)continue;
   const n=Math.round(clamp(TAU*RM(v)/4.8,8,152));
   for(let i=0;i<n;i++){const u=(i+((j%2)?.25:.75))/n;
    if(gone(u,v))continue;
    if(inAper(u,v,1.08)||inSlot(u,v,false))continue;
    if(rot&&rot(u,v*LEN))continue;
    if(rng()>(d>0?.60:.80))continue;
    const p=P(u,v,1),nn=NRM(u,v);
    // A lit cell is a 3 m window, not a lamp: kept well under 1 so ACES leaves
    // it orange instead of tone-mapping it to cream.
    const lit=d>0?rng()<.022:rng()<.085;
    kput('cell',[p[0]+nn[0]*.30,p[1]+nn[1]*.30,p[2]+nn[2]*.30],qFacing(nn),[3.3,2.2,1],
     lit?DARCO_EMBER.clone().multiplyScalar(rr(.14,.55)):DARCO_COAL);}}}

 // ---- relief: flute ribs, cornice bands, horn ribs ---------------------------
 // The ribs sit on the flute CRESTS, which cos(10a) puts at u = k/10 exactly,
 // so the relief and the section agree instead of beating against each other.
 for(let k=0;k<10;k++){const u=k/10;
  for(let v=.088;v<.615;v+=.032){
   if(inAper(u,v,1.12)||inSlot(u,v,false))continue;
   if(d>0&&(rng()<.38||(rot&&rot(u,v*LEN))))continue;
   beam(DBOX,P(u,v,1.022),P(u,v+.032,1.022),3.0,5.2);}}
 // Cornices have to stop at the apertures. At 5 m half-depth and 1.055 proud
 // the first pass drew a belt straight across the 36 m aperture at v=.27.
 [[.315,2.6],[.465,2.2],[.605,1.9]].forEach(B=>{const th=B[1]/LEN;
  SH.push(gridSurface((u,w)=>P(u,B[0]+th*(2*w-1),lerp(1.004,1.034,Math.sin(Math.PI*w))),
   176,6,{uS:58,vS:3,hole:(u,w)=>{const v=B[0]+th*(2*w-1);
    return !!inAper(u,v,1.14)||(d>0&&rot&&rot(u,v*LEN));}}));});
 // transverse ribs wrapping the underside of the horn, for the view from below
 for(let v=.56;v<VTOP-.04;v+=.042){const nr=8;
  for(let i=0;i<nr;i++){const u0=.385+(i/nr)*.23,u1=.385+((i+1)/nr)*.23;
   if(inSlot((u0+u1)/2,v,false))continue;
   if(d>0&&rng()<.35)continue;
   beam(DBOX,P(u0,v,1.026),P(u1,v,1.026),2.2,3.0);}}

 // ---- the nose / the break --------------------------------------------------
 if(d===0){SH.push(gridSurface((u,w)=>{const c=1-w,p=P(u,1,c),S=SPn(1);
   const tx=-S[3],ty=S[2],g=7*Math.sqrt(Math.max(0,1-c*c));
   return[p[0]+tx*g,p[1]+ty*g,p[2]];},48,5,{uS:8,vS:4}));}
 else{
  // NOT a cap across the cut: a flat fan there is an up-facing surface, and an
  // up-facing surface under this sky reads pale however black the material is.
  // A shaft, two collapsed floor plates and a floor, so the break is a hollow.
  DK.push(gridSurface((u,w)=>P(u,lerp(cutV(u),VCUT-.118,w),.87),72,7,{uS:14,vS:7}));
  DK.push(gridSurface((u,w)=>P(u,VCUT-.118,lerp(.88,.04,w)),56,3,{uS:12,vS:3}));
  // THE FLOORS, and they are PALE. Two void-black plates in a void-black shaft
  // read from 'The break' as one smooth dark cap: depth, but no building. Six
  // plates in the skin's own stone, each with a black soffit a metre under it
  // and holes eaten out of it, turn the hollow into a section — pale slab, dark
  // room, pale slab — which is the one read the kit's other breaks have taught.
  // Four, not six, and eaten hard — from 'The break' you look straight down the
  // tube, and six plates with modest holes stacked into one unbroken pale lid.
  for(let f=0;f<4;f++){const vf=VCUT-.024-f*.024,dv=1.1/LEN;
   const hl=(u,w)=>vf>cutV(u)-.004||h3(Math.floor(u*14),Math.floor(w*4),9659)<.66-.14*f;   // NESTED holes: independent ones on four plates stacked into one unbroken lid
   SH.push(gridSurface((u,w)=>P(u,vf,lerp(.87,.10,w)),56,4,{uS:10,vS:3,hole:hl}));
   DK.push(gridSurface((u,w)=>P(u,vf-dv,lerp(.87,.10,w)),56,4,{uS:10,vS:3,hole:hl}));}
  // the teeth left standing round the rim
  {const nt=44;for(let i=0;i<nt;i++){const u=(i+.5)/nt;if(rng()<.48)continue;
    const v0=cutV(u);beam(DBOX,P(u,v0-.022,1.0),P(u,v0+rr(.002,.018),1.0),rr(2,5),rr(2,5));}}}

 // ---- the plaza -------------------------------------------------------------
 // A PODIUM, not a saucer. The first pass laid a 300 m disc 9 m thick, which at
 // any distance read as a plate the building was sitting on. Pulled in to 252 m
 // and taken up to 26 m, so the mass stands on a wall you can see the height of
 // and the plan reads as three terraces rather than one grey field.
 const TER=[[26,140,26],[140,176,20],[176,208,14]];
 const DY=(x,z)=>{const r=Math.hypot(x,z);for(let i=0;i<TER.length;i++)if(r<=TER[i][1])return TER[i][2];return 14;};
 TER.forEach((T,i)=>{
  GRD.push(gridSurface((u,w)=>{const th=u*TAU,r=lerp(T[0],T[1]-3.2,w);
   return[Math.cos(th)*r,T[2],Math.sin(th)*r];},112,7,{uS:46,vS:10,
   hole:(u,w)=>d>0&&fbm(u*11,w*3+i,9656,3)<.17}));
  const yb=i<TER.length-1?TER[i+1][2]:0;
  GRD.push(gridSurface((u,w)=>{const th=u*TAU,r=lerp(T[1]-3.2,T[1],Math.min(1,w*2.6));
   return[Math.cos(th)*r,lerp(T[2],yb,w),Math.sin(th)*r];},112,3,{uS:46,vS:3}));});
 // battered skirt of spoil against the podium wall, in the mass's own family of
 // browns rather than the kit's pale rock
 GRD.push(gridSurface((u,w)=>{const th=u*TAU,r=lerp(208,258,w)*(1+.06*fbm(u*9,1.3,9657,2));
  return[Math.cos(th)*r,lerp(3.5,0,Math.pow(w,.55))+terrainH(gx+Math.cos(th)*r,gz+Math.sin(th)*r),Math.sin(th)*r];},
  96,5,{uS:44,vS:4}));
 // radial joint strips, one run per terrace so they follow the steps
 for(let k=0;k<16;k++){const a=k/16*TAU;
  TER.forEach(T=>{if(d>0&&rng()<.35)return;
   beam(DBOX,[Math.cos(a)*T[0],T[2]+.35,Math.sin(a)*T[0]],
             [Math.cos(a)*(T[1]-3.6),T[2]+.35,Math.sin(a)*(T[1]-3.6)],2.6,.7);});}
 // The rim was a colonnade of 34 columns on a 37 m span, which is a row of
 // picnic tables, not an entablature. A parapet with piers holds the edge
 // without asking for a bay spacing this radius cannot carry.
 {const PR=202;
  GRD.push(gridSurface((u,w)=>{const th=u*TAU,r=PR+.9*Math.sin(Math.PI*w);
   return[Math.cos(th)*r,14+w*5.6,Math.sin(th)*r];},128,3,{uS:52,vS:2,
   hole:(u,w)=>d>0&&fbm(u*13,w*2+2.2,9658,2)<.30}));
  GRD.push(gridSurface((u,w)=>{const th=u*TAU,r=lerp(PR+.9,PR-1.6,w);
   return[Math.cos(th)*r,19.6+w*1.2,Math.sin(th)*r];},128,2,{uS:52,vS:1,
   hole:(u,w)=>d>0&&fbm(u*13,2.2,9658,2)<.30}));
  const np=64;for(let k=0;k<np;k++){const a=(k+.5)/np*TAU;
   if(d>0&&rng()<.4)continue;
   kput(DBOX,[Math.cos(a)*PR,18,Math.sin(a)*PR],qEuler(0,-a,0),[3.2,9,4.6],null);
   if(k%4===1&&(d===0||rng()<.12))
    kput('strip',[Math.cos(a)*(PR-2.4),20.4,Math.sin(a)*(PR-2.4)],qEuler(0,-a,0),[TAU*PR/np*.78,1.8,1.8],
     DARCO_EMBER.clone().multiplyScalar(rr(.35,.7)));}}
 // two processional stairs cut down the podium wall
 for(let s=0;s<2;s++){const a=s?Math.PI*1.34:Math.PI*.66;
  for(let i=0;i<10;i++){const r=208+i*3.4,y=14-i*1.4;
   kput(DBOX,[Math.cos(a)*r,y,Math.sin(a)*r],qEuler(0,-a,0),[3.6,2.6,46],null);}
  for(let sd=-1;sd<=1;sd+=2)beam(DBOX,[Math.cos(a)*206-Math.sin(a)*sd*24,16,Math.sin(a)*206+Math.cos(a)*sd*24],
   [Math.cos(a)*242-Math.sin(a)*sd*24,2,Math.sin(a)*242+Math.cos(a)*sd*24],4,5);}

 // ---- circular features set into the plaza ----------------------------------
 // The great basin is placed deliberately, directly under the horn's tip (which
 // is at x=-116); the rest are scattered and rejected against an ellipse that
 // stands for the mass's footprint at deck level, so none can grow inside it.
 // rubbleRing() colours its blocks up to 55% lightness, which against this
 // fabric is a scatter of white popcorn. Same talus maths, Darco's palette.
 const darkRubble=(cx,cy,cz,rMin,rMax,n,sMax)=>{for(let i=0;i<n;i++){const a=rng()*TAU;
  const q=Math.pow(rng(),2.4),r=rMin+(rMax-rMin)*q,sz=rr(.6,sMax)*(1.25-.55*q);
  kput('rubble',[cx+Math.cos(a)*r,cy+(1-q)*(1-q)*sMax*.55+sz*.4,cz+Math.sin(a)*r],
   qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.7,1.5),sz*rr(.5,1),sz*rr(.7,1.5)],
   new THREE.Color().setHSL(rr(.05,.10),rr(.10,.28),rr(.02,.055)));}};
 const emberRing=(cx,cy,cz,r,n)=>{const L=TAU*r/n*.9;
  for(let i=0;i<n;i++){const th=(i+.5)/n*TAU,lit=d>0?rng()<.12:true;
   kput('strip',[cx+Math.cos(th)*r,cy,cz+Math.sin(th)*r],qEuler(0,-th,0),[L,1.7,1.7],
    lit?DARCO_EMBER.clone().multiplyScalar(rr(.38,.75)):DARCO_COAL);}};
 const courts=[{x:-150,z:0,r:46,kind:0}];
 for(let k=0;k<22;k++){const a=k/22*TAU+.31,R=rr(118,180);
  const cx=Math.cos(a)*R,cz=Math.sin(a)*R,cr=rr(15,29);
  if(Math.pow((cx-OX)/(120+cr),2)+Math.pow(cz/(152+cr),2)<1.2)continue;
  if(Math.hypot(cx,cz)+cr>198)continue;
  let clash=false;for(let i=0;i<courts.length;i++)if(Math.hypot(cx-courts[i].x,cz-courts[i].z)<cr+courts[i].r+18)clash=true;
  if(clash)continue;
  courts.push({x:cx,z:cz,r:cr,kind:1+(k%3)});}
 courts.forEach(C=>{const y=DY(C.x,C.z);
  if(C.kind===2){                                   // a raised drum with a colonnade
   GRD.push(gridSurface((u,w)=>{const th=u*TAU,r=C.r*(1-.06*w);
    return[C.x+Math.cos(th)*r,y+6.5*w,C.z+Math.sin(th)*r];},52,3,{uS:18,vS:2}));
   GRD.push(gridSurface((u,w)=>{const th=u*TAU,r=C.r*.94*(1-w);
    return[C.x+Math.cos(th)*r,y+6.5,C.z+Math.sin(th)*r];},52,4,{uS:18,vS:4}));
   const nc=Math.max(8,Math.round(C.r/6));
   for(let i=0;i<nc;i++){if(d>0&&rng()<.45)continue;const th=i/nc*TAU;
    kput(DBOX,[C.x+Math.cos(th)*C.r*.82,y+6.5+6,C.z+Math.sin(th)*C.r*.82],qEuler(0,-th,0),[2.2,12,2.2],null);}
   if(d===0)emberRing(C.x,y+18,C.z,C.r*.82,Math.max(10,Math.round(C.r/3)));
  }else if(C.kind===3){                             // an inlaid disc
   kput(DDISC,[C.x,y+.3,C.z],null,[C.r,.9,C.r],null);
   emberRing(C.x,y+1.1,C.z,C.r*.78,Math.max(10,Math.round(C.r/2.6)));
  }else{                                            // a sunken stepped court
   const dep=C.kind===0?18:8,steps=C.kind===0?4:2;
   for(let s=0;s<steps;s++){
    const r0=C.r*(1-s/steps),r1=C.r*(1-(s+1)/steps),y0=y-dep*s/steps,y1=y-dep*(s+1)/steps;
    GRD.push(gridSurface((u,w)=>{const th=u*TAU,r=lerp(r0,r1,w);
     return[C.x+Math.cos(th)*r,y0,C.z+Math.sin(th)*r];},52,2,{uS:18,vS:2}));
    if(r1>1)GRD.push(gridSurface((u,w)=>{const th=u*TAU;
     return[C.x+Math.cos(th)*r1,lerp(y0,y1,w),C.z+Math.sin(th)*r1];},52,1,{uS:18,vS:1}));}
   emberRing(C.x,y-dep*(steps-1)/steps+1.2,C.z,C.r*(1-(steps-1)/steps)*.8,Math.max(8,Math.round(C.r/3)));
   const nr=Math.max(12,Math.round(C.r/3.2));
   for(let i=0;i<nr;i++){const th=(i+.5)/nr*TAU;if(d>0&&rng()<.4)continue;
    kput(DBOX,[C.x+Math.cos(th)*C.r*1.02,y+1.1,C.z+Math.sin(th)*C.r*1.02],qEuler(0,-th,0),
     [TAU*C.r/nr*.92,2.2,3.4],null);}
   if(C.kind===0)for(let i=0;i<20;i++){const th=i/20*TAU;if(d>0&&rng()<.4)continue;
    kput(DCOL,[C.x+Math.cos(th)*(C.r+13),y,C.z+Math.sin(th)*(C.r+13)],null,[2.0,16,2.0],null);}}});

 // Low service blocks on the terraces. Without them the deck is 130 000 m2 of
 // empty paving and there is nothing between a 3 m figure and a 300 m horn.
 for(let i=0;i<30;i++){const a=rng()*TAU,r=rr(116,192);
  const bx=Math.cos(a)*r,bz=Math.sin(a)*r;
  if(Math.pow((bx-OX)/126,2)+Math.pow(bz/158,2)<1.1)continue;
  let hit=false;for(let c=0;c<courts.length;c++)if(Math.hypot(bx-courts[c].x,bz-courts[c].z)<courts[c].r+16)hit=true;
  if(hit||(d>0&&rng()<.4))continue;
  const bh=rr(6,20);
  kput(DBOX,[bx,DY(bx,bz)+bh*.5,bz],qEuler(0,-a,0),[rr(9,21),bh,rr(8,18)],null);
  if(d===0&&rng()<.4)kput('strip',[bx,DY(bx,bz)+bh+.6,bz],qEuler(0,-a,0),[rr(6,14),1.6,1.6],
   DARCO_EMBER.clone().multiplyScalar(rr(.3,.6)));}

 // ---- the foot: chamfered plinth, blind arcade ------------------------------
 const foot=(u,k,y)=>{const p=P(u,.035,k);return[p[0],y,p[2]];};
 GRD.push(gridSurface((u,w)=>foot(u,1.10,lerp(8,28,w)),176,4,{uS:58,vS:4}));
 GRD.push(gridSurface((u,w)=>foot(u,lerp(1.10,1.02,w),lerp(28,32,w)),176,2,{uS:58,vS:2}));
 // the blind arcade, seated just above the plinth cap
 {const nA=34;for(let i=0;i<nA;i++){const u=(i+.5)/nA,v=.113;
   if(d>0&&rng()<.3)continue;
   const p=P(u,v,1),nn=NRM(u,v);
   kput('dkArch',[p[0]+nn[0]*1.1,43,p[2]+nn[2]*1.1],qFacing([nn[0],0,nn[2]]),[2.1,2.1,1.4],null);
   if(d===0?rng()<.45:rng()<.08)
    kput('cell',[p[0]+nn[0]*.5,39,p[2]+nn[2]*.5],qFacing([nn[0],0,nn[2]]),[7,6,1],
     DARCO_EMBER.clone().multiplyScalar(rr(.26,.55)));}}

 // ---- the fallen horn --------------------------------------------------------
 if(d>0){
  // The piece's own long axis already runs at 159 deg in the builder's x/y
  // plane, so the z rotation that LAYS IT DOWN is +.36, not the 1.52 that
  // stood it on its point like a paper cone. Measured, not guessed.
  const fv=v=>lerp(VCUT+.012,.995,v);
  // The piece used to lie there WHOLE: a clean perpendicular cut at its root
  // and an unbroken skin, which from its own preset read as an intact pod set
  // down on the plain. Its root is now torn on the SAME ragged line the stump
  // was cut on (cutV), with the lip ring following that line, and its skin is
  // eaten harder than the standing fabric — it hit the ground from 250 m — so
  // the black inner mass shows through it in patches tens of metres across.
  const fHole=holeFn(.95,9658,null,1.3);
  const fg=gridSurface((u,v)=>P(u,fv(v),1),168,70,{uS:30,vS:16,   // 96x40 left the eaten holes stair-stepped (QA arcA)
   hole:(u,v)=>fv(v)<cutV(u)+.010||fHole(u,fv(v)*LEN)});
  const fi=gridSurface((u,v)=>P(u,fv(v),INS),56,22,{uS:16,vS:9});
  const fk=gridSurface((u,w)=>P(u,Math.max(fv(0),cutV(u)+.010),lerp(1,INS,w)),56,3,{uS:14,vS:2});
  fg.computeBoundingBox();const bc=fg.boundingBox.getCenter(new THREE.Vector3());
  [fg,fi,fk].forEach(g=>g.translate(-bc.x,-bc.y,-bc.z));
  const F=new THREE.Group();F.position.set(-318,0,104);
  F.rotation.set(.10,.85,.36);G.add(F);
  mesh(fg,skin,F);mesh(fi,MAT.darcoVoid,F);mesh(fk,MAT.darcoVoid,F);
  dropFragment(F,0,2.2);
  // fragBox() unions AABBs of ROTATED boxes, which over-reaches badly for a
  // 70 m piece lying at an angle, so dropFragment leaves it hanging in the
  // air. Re-seat it on its own true lowest vertex.
  {F.updateMatrix();const fp=fg.attributes.position.array,fv3=new THREE.Vector3();let my=Infinity;
   for(let i=0;i<fp.length;i+=3){fv3.set(fp[i],fp[i+1],fp[i+2]).applyMatrix4(F.matrix);if(fv3.y<my)my=fv3.y;}
   if(isFinite(my))F.position.y+=-1.8-my;F.updateMatrix();}
  // the cells go on AFTER the drop, so they ride the final transform
  useGroupXF(F);
  for(let j=0;j<26;j++){const v=fv((j+.5)/26),n=Math.round(clamp(TAU*RM(v)/4.8,8,60));
   for(let i=0;i<n;i++){const u=(i+((j%2)?.25:.75))/n;
    if(rng()>.55||v<cutV(u)+.012||fHole(u,v*LEN))continue;
    const q=P(u,v,1),nn=NRM(u,v);
    kput('cell',[q[0]-bc.x+nn[0]*.3,q[1]-bc.y+nn[1]*.3,q[2]-bc.z+nn[2]*.3],qFacing(nn),[3.3,2.2,1],
     rng()<.03?DARCO_EMBER.clone().multiplyScalar(rr(.14,.4)):DARCO_COAL);}}
  endGroupXF();
  darkRubble(-318,0,104,20,84,80,5);
  for(let i=0;i<9;i++){const a=rng()*TAU,r=rr(28,84);
   beam(DBOX,[-318+Math.cos(a)*r,rr(1,7),104+Math.sin(a)*r],
             [-318+Math.cos(a)*(r+rr(14,40)),rr(0,5),104+Math.sin(a)*(r+rr(10,35))],rr(3,7),rr(3,7));}}

 // ---- dressing ---------------------------------------------------------------
 meshMerged(SH,skin,G);
 if(DK.length)meshMerged(DK,MAT.darcoVoid,G);
 meshMerged(GRD,deckM,G);
 if(d>0){mossOnSurface(SH,0,0,0,130,2.6);vinesFromLedge(SH,0,0,0,80,24);
  stainsFromLedge(SH,0,0,0,140,22);
  scatterMoss(0,0,0,40,204,240,4);
  darkRubble(0,26,0,95,138,120,6);
  darkRubble(0,14,0,178,205,70,5);
  darkRubble(0,0,0,212,286,80,5);
  trees(0,0,258,440,64);}
 else{trees(0,0,264,440,34);}
 for(let i=0;i<18;i++){const a=rng()*TAU,r=rr(128,198);
  const x=Math.cos(a)*r,z=Math.sin(a)*r;
  kput('figB',[x,DY(x,z),z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[x,DY(x,z),z],null,1,new THREE.Color(0xc9a17e));}
 KOFF=[0,0,0];return G;}
