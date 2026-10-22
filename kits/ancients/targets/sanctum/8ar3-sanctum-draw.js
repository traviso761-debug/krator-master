// ================================================================= THE SANCTUM — the drawing (records in, geometry out)
// buildSanctum registers every record of SANCTUM.plan (8ar0) in core/tags (the arcology a building; its podium, gates,
// atria, stalk, solid, wells, garden and towers parts; the faces and ancestors props; the trees flora), then draws it.
// Nothing here decides where a thing goes. The shell is quads written into one buffer per material with UVs in metres
// (the Podium's pattern: targets/podium 8aq3), so the structure is a handful of draw calls; the small things are kit
// instances. The materials and the faceted heads are the Podium's (8aq2-podium-skins.js, read in place: build.py
// TARGET_READS): the onyx lancets in bronze tracery of the Heirs' walls (MAT.snWallK), lit alabaster, bronze, white.
const SCN_SITE={};
/* the solid's underside and the eaves: a downward face sees only the ground's colour in the hemisphere light, so it is
   lit a little through the concrete's own map (Hexahedron's soffits), and dimmed at night */
MAT.scnSoff=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xc4beb2,emissive:0x6a665e,emissiveMap:TEX.concrete,roughness:1,metalness:0,side:DS});
kdef('scnFigure',snGeoOf(etFigureGeo({pose:'stand',seed:KRAND.hash(0x5a9c7,201)}),0),MAT.snMetal);   /* the atria's ancestors */

function buildSanctum(scene,gx,gz,d){reseed(12200+d);return scnDraw(scene,gx,gz,SANCTUM.plan({seed:12200}));}

// ---- core/tags: one record per placed thing, before anything is drawn -------------------------------------------
function scnTag(P,gx,gz){const T=KTAGS.sanctum||(KTAGS.sanctum=KTAGS.create({build:'ancients-sanctum'}));
 const W=a=>[a[0]+gx,a[1],a[2]+gz],D=SANCTUM.DIM,ET='eternian',st='kept';
 const B=T.add({id:P.id,'class':'building',kind:'arcology',key:'ancients:sanctum',name:'The Sanctum',at:[gx,0,gz],r:D.RP,
  h:D.YS1+D.TOWER.h+D.TOWER.roof,tags:{culture:'ancient',types:['civic','religious'],state:'intact',style:st,tier:'court',landmark:true}});
 const part=(r,kind,at,o)=>T.child(B.id,Object.assign({'class':'part',kind:kind,key:r.id,name:r.name||null,at:W(at),tags:{style:st}},o||{}));
 part(P.podium,'podium',[0,0,0],{r:D.RP,h:D.YP});
 for(const g of P.gates)part(g,'gate',[g.r*Math.cos(g.th),0,g.r*Math.sin(g.th)],{size:[2*g.R,g.depth,g.R*Math.sqrt(3)]});
 for(const a of P.atria)part(a,'court',[a.c[0],0,a.c[1]],{r:a.R,h:D.YP});
 part(P.stalk,'stalk',[0,P.stalk.y0,0],{r:P.stalk.R,h:P.stalk.y1-P.stalk.y0});
 part(P.solid,'solid',[0,P.solid.y0,0],{r:P.solid.R,h:P.solid.y1-P.solid.y0});
 for(const w of P.wells)part(w,'lightwell',[w.c[0],D.YS0,w.c[1]],{r:w.R,h:D.YS1-D.YS0});
 part(P.garden,'garden',[0,P.garden.y,0],{r:D.RS});
 part(P.tower,'tower',[0,P.tower.y0,0],{r:P.tower.R0,h:P.tower.h+P.tower.roof});
 for(const c of P.corners)part(c,'tower',[c.c[0],c.y0,c.c[1]],{r:c.R0,h:c.h+c.roof});
 for(const a of P.add){const at=W(a.at);
  if(a.kind==='head'||a.kind==='figure')T.child(B.id,{'class':'prop',kind:a.kind==='head'?'head':'statue',key:a.id,at:at,h:a.h,
   tags:{types:['statue'],finish:a.metal,variant:'closed-eyes',culture:ET}});
  else if(a.kind==='tree')T.child(B.id,{'class':'flora',kind:'tree',key:a.id,at:at,h:a.h,tags:a.formal?{style:'formal'}:{}});
  else if(a.kind==='banner')T.child(B.id,{'class':'prop',kind:'banner',key:a.id,at:at,tags:{culture:ET}});}
 return B;}

function scnDraw(scene,gx,gz,P){KOFF=[gx,0,gz];
 /* a 430 m figure wants a camera a kilometre and more off: the far plane and the sky's underside as the Podium sets them */
 if(typeof camera!=='undefined'&&camera.far<30000){camera.far=30000;camera.updateProjectionMatrix();}
 if(typeof sky!=='undefined')sky.renderOrder=-1;
 if(typeof skyMat!=='undefined'&&skyMat.fragmentShader.indexOf('pow(h,.55)')>=0){
  skyMat.fragmentShader=skyMat.fragmentShader.replace('pow(h,.55)','pow(max(h,0.),.55)');skyMat.needsUpdate=true;}
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const D=SANCTUM.DIM,C=Math.cos,S=Math.sin,T30=Math.tan(Math.PI/6),K30=Math.cos(Math.PI/6);
 scnTag(P,gx,gz);
 REGISTER({name:'The Sanctum',x:0,z:0,r:D.RP,h:D.YS1+D.TOWER.h+D.TOWER.roof});
 REGISTER({name:'The Sanctum — the podium and its six gates',x:0,z:0,r:D.RP,y:0,h:D.YP});
 REGISTER({name:'The Sanctum — the solid',x:0,z:0,r:D.RS,y:D.YS0,h:D.YS1-D.YS0});
 REGISTER({name:'The Sanctum — the roof garden and the towers',x:0,z:0,r:D.RS,y:D.YS1,h:D.TOWER.h+D.TOWER.roof});

 // ---- the merge lists: a quad (or a triangle, its last point repeated) into one buffer per material ---------------
 const ACC={};
 const Q=(key,p,uv,n)=>{const A=ACC[key]||(ACC[key]={P:[],N:[],U:[],I:[],n:0});const a=p[0],b=p[1],c=p[2],e=p[3];
  const ux=c[0]-a[0],uy=c[1]-a[1],uz=c[2]-a[2],vx=e[0]-b[0],vy=e[1]-b[1],vz=e[2]-b[2];
  let fx=uy*vz-uz*vy,fy=uz*vx-ux*vz,fz=ux*vy-uy*vx;
  if(n&&fx*n[0]+fy*n[1]+fz*n[2]<0){p=[p[0],p[3],p[2],p[1]];uv=[uv[0],uv[3],uv[2],uv[1]];fx=-fx;fy=-fy;fz=-fz;}
  const fl=Math.hypot(fx,fy,fz)||1;fx/=fl;fy/=fl;fz/=fl;
  for(let k=0;k<4;k++){const q=p[k];A.P.push(q[0],q[1],q[2]);A.N.push(fx,fy,fz);A.U.push(uv[k][0],uv[k][1]);}
  const m=A.n;A.I.push(m,m+1,m+2,m,m+2,m+3);A.n+=4;};
 /* a horizontal convex polygon [[x, z]] at y facing up (n > 0) or down: a fan, UVs in plan metres */
 const HP=(key,pts,y,up,tile)=>{const p0=pts[0];for(let i=1;i<pts.length-1;i++){const t=[p0,pts[i],pts[i+1],pts[i+1]].map(q=>[q[0],y,q[1]]);
  Q(key,t,t.map(q=>[q[0]/tile,q[2]/tile]),[0,up?1:-1,0]);}};
 /* a vertical quad from a to b ([x, z]) between y0 and y1 facing n, UVs in metres from u0 along it */
 const WQ=(key,a,b,y0,y1,n,tu,tv,u0)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]);u0=u0||0;
  Q(key,[[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]]],[[u0/tu,y0/tv],[(u0+L)/tu,y0/tv],[(u0+L)/tu,y1/tv],[u0/tu,y1/tv]],n);};
 /* a polygon in a vertical plane: (v, y) points in the frame (origin o [x, z], along t, facing n), a fan */
 const VP=(key,pts,o,t,n,off,tile)=>{const W3=q=>[o[0]+t[0]*q[0]+n[0]*off,q[1],o[1]+t[1]*q[0]+n[2]*off];const p0=pts[0];
  for(let i=1;i<pts.length-1;i++){const t4=[p0,pts[i],pts[i+1],pts[i+1]];Q(key,t4.map(W3),t4.map(q=>[q[0]/tile,q[1]/tile]),n);}};
 const MK={WALL:MAT.snWallK,POD:MAT.snPodK,ONYX:MAT.snOnyx,ALAB:MAT.snAlab,WHITE:MAT.snWhite,PAVE:MAT.snPave,LAWN:MAT.snLawn,
  WATER:MAT.snWater,BRONZE:MAT.snBronze,SOFF:MAT.scnSoff,GUN:MAT.snGun,STONE:MAT.snStone};
 const WT=24,WV=20;   /* the Heirs' wall skin: a 24 m tile of four bays, four storeys on its 16 m stretched to the 5 m storey */
 const WHT=new THREE.Color(0xe8e3d8),BRZ=new THREE.Color(SANCTUM.METAL.bronze),GLD=new THREE.Color(SANCTUM.METAL.gold);
 const frame=th=>({u:[C(th),S(th)],v:[-S(th),C(th)]});
 const at=(F,u,v)=>[F.u[0]*u+F.v[0]*v,F.u[1]*u+F.v[1]*v];
 /* the gate's hexagon in a wall's plane, (v, y): flat on the ground, 2R wide, R*sqrt(3) tall */
 const gateHex=R=>{const a=R*K30;return [[-R,a],[-R/2,0],[R/2,0],[R,a],[R/2,2*a],[-R/2,2*a]];};
 /* a gate's frame: two hexagonal rings of bars round the opening, gold inside and white stone outside, proud of the
    wall at u (facing s along F.u) */
 const BX=new THREE.Vector3(),BY=new THREE.Vector3(),BZ=new THREE.Vector3(),BM=new THREE.Matrix4();
 const gateFrame=(F,u,R,s)=>{const n=[F.u[0]*s,0,F.u[1]*s];BZ.set(n[0],0,n[2]);
  for(const [Rr,th,col,dep] of [[R+.7,1.4,GLD,1.0],[R+2.3,1.8,WHT,.7]]){const h=gateHex(Rr);
   for(let i=0;i<6;i++){const p=h[i],q=h[(i+1)%6],L=Math.hypot(q[0]-p[0],q[1]-p[1]),dv=(q[0]-p[0])/L,dy=(q[1]-p[1])/L;
    BX.set(F.v[0]*dv,dy,F.v[1]*dv);BY.crossVectors(BZ,BX);BM.makeBasis(BX,BY,BZ);
    const m=at(F,u,(p[0]+q[0])/2),c=[m[0]+n[0]*dep/2,(p[1]+q[1])/2-(Rr-R)*.0,m[1]+n[2]*dep/2];
    if(i===1)continue;   /* no bar across the threshold */
    kput('snBox',c,new THREE.Quaternion().setFromRotationMatrix(BM),[L+th,th,dep],col);}}};
 /* a wall from v0 to v1 at u in frame F, y0 to y1, facing +u (s = 1) or -u, with a gate hexagon of corner radius R
    cut in its middle (R 0: none) */
 const wallWithGate=(key,F,u,v0,v1,y0,y1,R,s,tu,tv)=>{const n=[F.u[0]*s,0,F.u[1]*s],o=at(F,u,0),t=F.v;
  if(!R){VP(key,[[v0,y0],[v1,y0],[v1,y1],[v0,y1]],o,t,n,0,tu);return;}
  const h=gateHex(R),a=R*K30;
  VP(key,[[v0,y0],[-R,y0],[-R,y1],[v0,y1]],o,t,n,0,tu);VP(key,[[R,y0],[v1,y0],[v1,y1],[R,y1]],o,t,n,0,tu);
  VP(key,[[-R,a],[-R/2,2*a],[-R/2,y1],[-R,y1]],o,t,n,0,tu);VP(key,[[-R/2,2*a],[R/2,2*a],[R/2,y1],[-R/2,y1]],o,t,n,0,tu);
  VP(key,[[R/2,2*a],[R,a],[R,y1],[R/2,y1]],o,t,n,0,tu);
  VP(key,[[-R,y0],[-R/2,y0],[-R,a]],o,t,n,0,tu);VP(key,[[R/2,y0],[R,y0],[R,a]],o,t,n,0,tu);};
 /* a wedge of a hexagonal plan between the rays th +- 30 degrees, at y, less a hexagonal hole of corner radius R centred
    c along th (its flat faces across th): the triangle inside the hole, the strips either side of it, and the band
    outside it to the outer boundary `outer` ([[u, v]] from the -30 ray to the +30 ray) */
 const wedge=(key,th,y,c,R,outer,up,tile)=>{const F=frame(th),ap=R*K30,u0=c-ap,u1=c+ap,W2=q=>at(F,q[0],q[1]);
  HP(key,[[0,0],[u0,-u0*T30],[u0,u0*T30]].map(W2),y,up,tile);
  for(const s of [-1,1]){HP(key,[[u0,s*u0*T30],[c,s*c*T30],[c,s*R],[u0,s*R/2]].map(W2),y,up,tile);
   HP(key,[[c,s*c*T30],[u1,s*u1*T30],[u1,s*R/2],[c,s*R]].map(W2),y,up,tile);}
  const ring=[[u1,-u1*T30]].concat(outer,[[u1,u1*T30]]);let mu=0,mv=0;for(const q of ring){mu+=q[0];mv+=q[1];}mu/=ring.length;mv/=ring.length;
  for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];HP(key,[[mu,mv],a,b].map(W2),y,up,tile);}};
 /* the walls of a hexagonal hole (an atrium, a well), facing in, between y0 and y1; face 0 (toward th) may carry a gate */
 const holeWalls=(key,c,R,th,y0,y1,gate)=>{const ap=R*K30;
  for(let j=0;j<6;j++){const F=frame(th+j*Math.PI/3),base=[c[0],c[1]];
   const W=(v,y)=>[base[0]+F.u[0]*ap+F.v[0]*v,y,base[1]+F.u[1]*ap+F.v[1]*v];
   if(j===0&&gate){const n=[-F.u[0],0,-F.u[1]],o2=[base[0]+F.u[0]*ap,base[1]+F.u[1]*ap];
    const h=gateHex(gate),a=gate*K30,pts=[[[-R/2,y0],[-gate,y0],[-gate,y1],[-R/2,y1]],[[gate,y0],[R/2,y0],[R/2,y1],[gate,y1]],
     [[-gate,a],[-gate/2,2*a],[-gate/2,y1],[-gate,y1]],[[-gate/2,2*a],[gate/2,2*a],[gate/2,y1],[-gate/2,y1]],[[gate/2,2*a],[gate,a],[gate,y1],[gate/2,y1]],
     [[-gate,y0],[-gate/2,y0],[-gate,a]],[[gate/2,y0],[gate,y0],[gate,a]]];
    for(const q of pts)VP(key,q,o2,F.v,n,0,WT);continue;}
   Q(key,[W(-R/2,y0),W(R/2,y0),W(R/2,y1),W(-R/2,y1)],[[0,y0/WV],[R/WT,y0/WV],[R/WT,y1/WV],[0,y1/WV]],[-F.u[0],0,-F.u[1]]);}};
 /* a hexagonal frustum (a tower) on the solid's orientation, from R0 at y0 to R1 at y1, then its roof */
 const tower=(c,R0,R1,y0,y1,roof,ov)=>{for(let j=0;j<6;j++){const a=Math.PI/6+j*Math.PI/3,b=a+Math.PI/3,m=(a+b)/2;
   const p=(R,t,y)=>[c[0]+R*C(t),y,c[1]+R*S(t)];const L0=R0,L1=R1;
   Q('WALL',[p(R0,a,y0),p(R0,b,y0),p(R1,b,y1),p(R1,a,y1)],[[0,y0/WV],[L0/WT,y0/WV],[(L0+L1)/2/WT,y1/WV],[(L0-L1)/2/WT,y1/WV]],[C(m),0,S(m)]);
   const Re=R1+ov,yr=y1+roof;
   Q('BRONZE',[p(Re,a,y1),p(Re,b,y1),[c[0],yr,c[1]],[c[0],yr,c[1]]],[[0,0],[Re/6,0],[Re/12,roof/6],[Re/12,roof/6]],[C(m),1,S(m)]);}
  HP('SOFF',SANCTUM.hex(c[0],c[1],R1+ov,Math.PI/6),y1,false,8);
  kput('snCyl',[c[0],y1+roof-1,c[1]],null,[.9,roof*.35+4,.9],BRZ);};

 // ---- the apron and the avenue to the front gate ----------------------------------------------------------------------
 {const hp=SANCTUM.hex(0,0,D.RP,0),ha=SANCTUM.hex(0,0,D.RP+40,0);
  for(let j=0;j<6;j++){const k=(j+1)%6,t=[hp[j],hp[k],ha[k],ha[j]].map(q=>[q[0],.05,q[1]]);Q('PAVE',t,t.map(q=>[q[0]/8,q[2]/8]),[0,1,0]);}
  const F=frame(Math.PI/2),apA=(D.RP+40)*K30;HP('PAVE',[[apA-1,-22],[apA+260,-22],[apA+260,22],[apA-1,22]].map(q=>at(F,q[0],q[1])),.06,true,8);}

 // ---- the podium: six faces with their gates, the passages, the atria, the roof -------------------------------------
 const apP=D.RP*K30;
 for(const g of P.gates){const F=frame(g.th);
  wallWithGate('WALL',F,apP,-D.RP/2,D.RP/2,0,D.YP,g.R,1,WT,WV);gateFrame(F,apP,g.R,1);
  gateFrame(F,D.ATC+D.ATR*K30,g.R,-1);   /* and on the atrium's side */
  /* the passage: the gate's hexagon carried through to the atrium, lined in onyx, paved */
  const h=gateHex(g.R),a=D.ATC+D.ATR*K30;
  for(let i=0;i<6;i++){const p=h[i],q=h[(i+1)%6],mid=[(p[0]+q[0])/2,(p[1]+q[1])/2],n0=[-mid[0],g.R*K30-mid[1]];
   const P3=(u,w)=>{const xz=at(F,u,w[0]);return [xz[0],w[1],xz[1]];},nn=[F.v[0]*n0[0],n0[1],F.v[1]*n0[0]];
   const L=Math.hypot(q[0]-p[0],q[1]-p[1]);
   Q(i===1?'PAVE':'ONYX',[P3(a,p),P3(a,q),P3(apP,q),P3(apP,p)],[[0,0],[L/4,0],[L/4,(apP-a)/4],[0,(apP-a)/4]],nn);}
  kput('snBox',[F.u[0]*(apP-.3),D.YP+.75,F.u[1]*(apP-.3)],qFacing([F.u[0],0,F.u[1]]),[D.RP,1.5,.6],WHT);}
 for(const A of P.atria){holeWalls('WALL',A.c,A.R,A.th,0,D.YP,D.GATE);
  HP('PAVE',SANCTUM.hex(A.c[0],A.c[1],A.R,A.th+Math.PI/6),.05,true,6);
  HP('WATER',SANCTUM.hex(A.c[0],A.c[1],A.pool,A.th+Math.PI/6),.35,true,10);
  for(let j=0;j<6;j++){const F=frame(A.th+j*Math.PI/3),ap=A.pool*K30;
   kput('snBox',[A.c[0]+F.u[0]*(ap+.3),.35,A.c[1]+F.u[1]*(ap+.3)],qFacing([F.u[0],0,F.u[1]]),[A.pool+.6,.7,.6],WHT);
   const apA=A.R*K30;kput('snBox',[A.c[0]+F.u[0]*(apA-.3),D.YP+.75,A.c[1]+F.u[1]*(apA-.3)],qFacing([F.u[0],0,F.u[1]]),[A.R,1.5,.6],WHT);}
  kput('snBox',[A.c[0],1.2,A.c[1]],qFacing([C(A.th),0,S(A.th)]),[5,2.4,5],WHT);}
 for(let k=0;k<6;k++){const th=SANCTUM.FACE_P(k);
  wedge('PAVE',th,D.YP,D.ATC,D.ATR,[[apP,-D.RP/2],[apP,D.RP/2]],true,8);}

 // ---- the stalk ---------------------------------------------------------------------------------------------------
 {const h=SANCTUM.hex(0,0,D.RK,Math.PI/6);for(let j=0;j<6;j++){const a=h[j],b=h[(j+1)%6],m=Math.PI/3*(j+1);
  WQ('WALL',a,b,D.YP,D.YS0,[C(m),0,S(m)],WT,WV);}}

 // ---- the solid: its walls round the fillets, the bands and windows, the wells, the underside and the garden roof ----
 const OL=SANCTUM.outline(8),NA=9;let u=0;
 for(let i=0;i<OL.length;i++){const a=OL[i],b=OL[(i+1)%OL.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1e-6)continue;
  const nx=(b[1]-a[1])/L,nz=-(b[0]-a[0])/L,s=nx*(a[0]+b[0])+nz*(a[1]+b[1])>0?1:-1;
  WQ('WALL',[a[0],a[1]],[b[0],b[1]],D.YS0,D.YS1,[nx*s,0,nz*s],WT,WV,u);u+=L;
  const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
  kput('snBox',[mx-nx*s*.3,D.YS1+.6,mz-nz*s*.3],qFacing([nx*s,0,nz*s]),[L+.05,1.2,.5],WHT);}
 const apS=D.RS*K30;
 /* a face's straight run: from the last point of the fillet before it to the first point of the one after */
 const faceRun=k=>{const a=OL[((k+5)%6)*NA+NA-1],b=OL[k*NA],F=frame(SANCTUM.FACE_S(k)),va=-a[0]*F.u[1]+a[1]*F.u[0],vb=-b[0]*F.u[1]+b[1]*F.u[0];
  return {F:F,v0:Math.min(va,vb),v1:Math.max(va,vb)};};
 for(const B of P.bands){const R=faceRun(B.face),L=R.v1-R.v0,vm=(R.v0+R.v1)/2,c=at(R.F,apS+B.depth/2-.3,vm),n=[R.F.u[0],0,R.F.u[1]];
  kput('snBox',[c[0],B.y-.4,c[1]],qFacing(n),[L,.8,B.depth],WHT);
  const e=at(R.F,apS+B.depth-.12,vm);kput('snBox',[e[0],B.y+.55,e[1]],qFacing(n),[L,1.1,.2],BRZ);}
 for(const Wr of P.windows){const R=faceRun(Wr.face),n=[R.F.u[0],0,R.F.u[1]],L=R.v1-R.v0,sp=L/Wr.n,w=Wr.w,ys=Wr.y+Wr.h-w*K30;
  for(let i=0;i<Wr.n;i++){const v=R.v0+sp*(i+.5),pts=[[v-w/2,Wr.y],[v+w/2,Wr.y],[v+w/2,ys]];
   for(let k=1;k<=6;k++){const t=k/6*Math.PI/3;pts.push([v-w/2+w*C(t),ys+w*S(t)]);}
   for(let k=1;k<6;k++){const t=Math.PI*2/3+k/6*Math.PI/3;pts.push([v+w/2+w*C(t),ys+w*S(t)]);}
   pts.push([v-w/2,ys]);
   VP('GUN',pts.map(q=>[v+(q[0]-v)*1.1,Wr.y+(q[1]-Wr.y)*1.03-.5]),at(R.F,apS,0),R.F.v,n,.08,4);   /* the dark reveal round it */
   VP('ONYX',pts,at(R.F,apS,0),R.F.v,n,.15,4);
   const p=at(R.F,apS+.3,v);
   kput('snBar',[p[0],Wr.y+Wr.h/2,p[1]],qFacing(n),[.45,Wr.h,.35],BRZ);
   kput('snBar',[p[0],ys,p[1]],qFacing(n),[w,.45,.35],BRZ);
   for(const s of [-1,1]){const q=at(R.F,apS+.3,v+s*(w/2+.3));kput('snBar',[q[0],Wr.y+(ys-Wr.y)/2,q[1]],qFacing(n),[.6,ys-Wr.y,.4],BRZ);}}}
 for(const Wl of P.wells){holeWalls('WALL',Wl.c,Wl.R,Wl.th,D.YS0,D.YS1,0);
  for(let j=0;j<6;j++){const F=frame(Wl.th+j*Math.PI/3),ap=Wl.R*K30;
   kput('snBox',[Wl.c[0]+F.u[0]*(ap+.3),D.YS1+.6,Wl.c[1]+F.u[1]*(ap+.3)],qFacing([F.u[0],0,F.u[1]]),[Wl.R+.6,1.2,.5],WHT);}}
 for(let k=0;k<6;k++){const th=SANCTUM.FACE_S(k),F=frame(th),pts=[];
  /* the wedge's outer boundary: the second half of the fillet before the face, the first half of the one after */
  for(let i=NA>>1;i<NA;i++)pts.push(OL[((k+5)%6)*NA+i]);for(let i=0;i<=NA>>1;i++)pts.push(OL[k*NA+i]);
  const uv=pts.map(q=>[q[0]*F.u[0]+q[1]*F.u[1],-q[0]*F.u[1]+q[1]*F.u[0]]);
  wedge('SOFF',th,D.YS0,D.WC,D.WR,uv,false,8);wedge('LAWN',th,D.YS1,D.WC,D.WR,uv,true,8);}
 {const ring=36,r0=D.TOWER.R0+12,r1=D.TOWER.R0+24;
  for(let i=0;i<ring;i++){const a=i/ring*TAU,b=(i+1)/ring*TAU,t=[[r0*C(a),D.YS1+.06,r0*S(a)],[r1*C(a),D.YS1+.06,r1*S(a)],[r1*C(b),D.YS1+.06,r1*S(b)],[r0*C(b),D.YS1+.06,r0*S(b)]];
   Q('PAVE',t,t.map(q=>[q[0]/6,q[2]/6]),[0,1,0]);}
  for(const c of P.corners){const F=frame(c.th),e=D.CORNER.r-c.R0-2;HP('PAVE',[[r1-1,-6],[e,-6],[e,6],[r1-1,6]].map(q=>at(F,q[0],q[1])),D.YS1+.07,true,6);}}
 tower([0,0],P.tower.R0,P.tower.R1,P.tower.y0,P.tower.y0+P.tower.h,P.tower.roof,P.tower.ov);
 for(const c of P.corners)tower(c.c,c.R0,c.R1,c.y0,c.y0+c.h,c.roof,c.ov);

 // ---- the dressing, from the records ---------------------------------------------------------------------------------
 const leafC=(u,f)=>new THREE.Color().setHSL(f?.30:.22+u*.1,f?.32:.38,f?.20:.26+u*.06);
 const H=a=>KRAND.unit(KRAND.child(P.seed,a.id));
 for(const a of P.add){const k=a.kind;
  if(k==='head'){const h=a.h;kput('snHead'+(KRAND.child(P.seed,a.id)%SN_HEADS),a.at,qFacing(a.face),[h*.84,h,h*.92],new THREE.Color(a.color));}
  else if(k==='figure'){const h=a.h;kput('scnFigure',a.at,qFacing(a.face),[h,h,h],new THREE.Color(a.color));}
  else if(k==='tree'){const u=H(a),h=a.h;kput('trunk',a.at,qEuler(0,u*TAU,0),[h*.12,h*.7,h*.12],new THREE.Color().setHSL(.07,.3,.18));
   if(a.formal)kput('leafCard',[a.at[0],a.at[1]+h*.62,a.at[2]],qEuler(0,u*TAU,0),[h*.2,h*.42,h*.2],leafC(u,1));
   else kput('leafCard',[a.at[0],a.at[1]+h*.72,a.at[2]],qEuler(0,u*TAU,0),[h*.32,h*.3,h*.32],leafC(u,0));}
  else if(k==='banner')kput('snBanner',a.at,qFacing(a.face),[a.w,a.h,1],null);}

 // ---- what the presets are derived from, then the merge -----------------------------------------------------------------
 SCN_SITE.kept={x:gx,z:gz,RP:D.RP,RS:D.RS,YP:D.YP,YS0:D.YS0,YS1:D.YS1,YT:D.YS1+D.TOWER.h+D.TOWER.roof,front:Math.PI/2,
  atria:P.atria.map(A=>({c:A.c,th:A.th})),wells:P.wells.map(W=>({c:W.c,th:W.th})),vol:P.vol,trees:P.trees};
 for(const key in ACC){const A=ACC[key];if(!A.n)continue;
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(A.N,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2));g.setIndex(A.I);
  const m=mesh(g,MK[key],G);if(key==='SOFF'&&m)m.onBeforeRender=()=>{MAT.scnSoff.emissiveIntensity=NIGHT?.06:1;};}
 KOFF=[0,0,0];return G;}
