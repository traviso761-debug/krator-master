// ================================================================= STRONGBOW — the drawing's parts (records in, geometry out)
// Helpers the builder (8aw2) calls with one context X = {P, F, D, RU, dd, M, L (the material lists), h}. Nothing here draws on the
// kit's rng() stream: every irregularity is hashed from a record's id or its indices (STRONGBOW.h), so this fragment is listed in
// build.py's DETERMINISTIC. Geometry is local (the builder's group stands at the site); M is the ruin's lean (null as built):
// everything the Bow carries (its flanks, crown, mast, the Nock's centre, the stays' hull ends) is pushed through it.
MAT.sbRock=new THREE.MeshStandardMaterial({map:TEX.hillRock,vertexColors:true,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.sbTeal=new THREE.MeshStandardMaterial({color:0x3f8a84,roughness:.45,metalness:.45,side:DS});
MAT.sbTealR=new THREE.MeshStandardMaterial({color:0x4d6a5c,roughness:.75,metalness:.25,side:DS});
MAT.sbPool=new THREE.MeshStandardMaterial({color:0x7fe8e0,emissive:0x2a8a84,emissiveIntensity:.55,roughness:.08,metalness:.3,side:DS});
MAT.sbPoolR=new THREE.MeshStandardMaterial({color:0x2e4a48,roughness:.5,metalness:.2,side:DS});
MAT.sbMirror=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.1,metalness:.55,side:DS});
kdef('sbMirror',new THREE.BoxGeometry(1,1,1),MAT.sbMirror);
kdef('sbCyl',new THREE.CylinderGeometry(1,1,1,20),MAT.acKit);
kdef('sbCraft',new THREE.CylinderGeometry(.18,1,1,8).translate(0,.5,0),MAT.acKit);

// geometry helpers ---------------------------------------------------------------------------------------------------
const SBG={
 // a gridSurface with a colour per vertex (the rock's strata)
 coloured:function(fn,nu,nv,col,opt){const g=gridSurface(fn,nu,nv,opt),p=g.attributes.position,c=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const k=col(p.getX(i),p.getY(i),p.getZ(i));c[3*i]=k[0];c[3*i+1]=k[1];c[3*i+2]=k[2];}
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g;},
 // a cylinder side (world-scale UVs: the dwelling map's storeys stay level), a disc or annulus
 cyl:(c,r,y0,y1,n)=>gridSurface((u,v)=>[c[0]+r*Math.cos(u*TAU),lerp(y0,y1,v),c[2]+r*Math.sin(u*TAU)],n||32,1,{uS:r*TAU/25.6,vS:(y1-y0)/25.6}),
 arc:(c,r,a0,a1,y0,y1,n)=>gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[c[0]+r*Math.cos(a),lerp(y0,y1,v),c[2]+r*Math.sin(a)];},n||24,1,{uS:r*Math.abs(a1-a0)/25.6,vS:(y1-y0)/25.6}),
 disc:(c,r0,r1,y,n)=>gridSurface((u,v)=>{const r=lerp(r0,r1,v);return[c[0]+r*Math.cos(u*TAU),y,c[2]+r*Math.sin(u*TAU)];},n||32,1,{uS:r1*TAU/12,vS:(r1-r0)/12}),
 // a ribbon along a polyline of [x,y,z] points, w wide, lifted by dy
 ribbon:(pts,w,dy)=>{const n=pts.length-1,at=f=>{const s=Math.min(n-1,Math.floor(f*n)),q=f*n-s,a=pts[s],b=pts[s+1];return[lerp(a[0],b[0],q),lerp(a[1],b[1],q),lerp(a[2],b[2],q),b[0]-a[0],b[2]-a[2]];};
  let L=0;for(let i=0;i<n;i++)L+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][2]-pts[i][2]);
  return gridSurface((u,v)=>{const p=at(u),l=Math.hypot(p[3],p[4])||1,nx=-p[4]/l,nz=p[3]/l,o=(v-.5)*w;return[p[0]+nx*o,p[1]+(dy||0),p[2]+nz*o];},Math.max(2,n*8),1,{uS:L/12,vS:w/12});},
 // push a geometry, through the lean if the Bow carries it
 put:(X,list,g,bound)=>{if(bound&&X.M)g.applyMatrix4(X.M);X.L[list].push(g);return g;},
 tp:(X,p)=>{if(!X.M)return p;const v=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(X.M);return[v.x,v.y,v.z];}};

// the strata: bands of bedded rock, dipping a little east, with thin vivid beds (the reference's violet and orange)
const SB_BEDS=[[1.25,1.16,1.02],[1.18,.86,.68],[1.3,1.08,.76],[1.0,.92,1.02],[1.38,1.32,1.2],[.96,.84,.74],[1.2,1.02,.86]];
function sbStrata(S,x,y){const yy=y+.018*x+6*KRAND.vnoise(x/210,y/60,0,S+21),b=Math.floor(yy/23),f=yy/23-b,u=STRONGBOW.h(S,401,b);
 if(f<.16&&u<.4)return u<.2?[.95,.55,1.05]:[1.4,.78,.32];
 const c=SB_BEDS[Math.floor(u*SB_BEDS.length)%SB_BEDS.length],g=.92+.12*KRAND.vnoise(x/23,y/9,0,S+22);return[c[0]*g,c[1]*g,c[2]*g];}

// ---- the cliff: the face, the plateau, the scree (one site's 2 200 m of it), the bay quarried into the face --------
function sbCliff(X,G){const F=X.F,D=X.D,S=F.seed,W=1100,LY=F.lipY,bw=D.BAY.w/2,meshes=[];
 const face=SBG.coloured((u,v)=>{const x=lerp(-W,W,u),y=lerp(F.FL,LY,v);return[x,y,F.faceZ(x,y)];},184,150,(x,y)=>sbStrata(S,x,y),
  {uS:2*W/60,vS:F.LIP/60,hole:(u,v)=>Math.abs(lerp(-W,W,u))<bw});
 const plat=SBG.coloured((u,v)=>{const x=lerp(-W,W,u),z0=F.faceZ(x,LY),z=lerp(z0,-1700,v*v);
   return[x,LY+.035*(z0-z)+5*KRAND.vnoise(x/120,z/120,0,S+31),z];},110,40,
  (x,y,z)=>{const n=KRAND.vnoise(x/80,z/80,0,S+32),e=Math.max(0,1-(F.faceZ(x,LY)-z)/40);return[.55+.2*n+.3*e,.6+.12*n+.2*e,.42+.08*n+.2*e];},
  {uS:2*W/60,vS:30,hole:(u,v)=>{const x=lerp(-W,W,u),z0=F.faceZ(x,LY),z=lerp(z0,-1700,v*v);return Math.abs(x)<bw&&z>-D.BAY.d;}});
 const scree=SBG.coloured((u,v)=>{const x=lerp(-W,W,u),z=lerp(F.faceZ(x,F.FL)-1,150,v);return[x,F.ground(x,z),z];},184,16,
  (x,y,z)=>{const n=KRAND.vnoise(x/30,z/30,0,S+41);return[.66+.12*n,.62+.1*n,.56+.08*n];},{uS:2*W/30,vS:5,hole:(u,v)=>Math.abs(lerp(-W,W,u))<bw});
 // the ends of this site's stretch: the rock turned north to the plateau's far edge (hidden where two stretches meet)
 const ends=[-W,W].map(x=>SBG.coloured((u,v)=>{const y=lerp(F.FL,LY,v),z0=F.faceZ(x,y);return[x,y,lerp(z0,-1700,u)];},30,40,(x,y)=>sbStrata(S,x,y),{uS:30,vS:F.LIP/60}));
 for(const g of [face,plat,scree].concat(ends))meshes.push(mesh(g,MAT.sbRock,G));
 // the bay: the quarried back wall and sides, its floor
 const cut=(x,y)=>(KRAND.vnoise(x/30,y/30,0,S+51)-.5)*3;
 X.L.cut.push(gridSurface((u,v)=>{const x=lerp(-bw,bw,u),y=lerp(F.FL,LY,v);return[x,y,-D.BAY.d+cut(x,y)];},16,60,{uS:2*bw/40,vS:F.LIP/40}));
 for(const s of [-1,1])X.L.cut.push(gridSurface((u,v)=>{const y=lerp(F.FL,LY,v),z=lerp(-D.BAY.d,F.faceZ(s*bw,y),u);return[s*bw+cut(z,y),y,z];},6,60,{uS:3,vS:F.LIP/40}));
 X.L.pave.push(gridSurface((u,v)=>[lerp(-bw,bw,u),F.FL+.05,lerp(-D.BAY.d,F.faceZ(0,F.FL)+2,v)],8,4,{uS:2*bw/12,vS:8}));
 return meshes;}

// ---- the Bow: the flanks lofted storey by storey, the back, the prow fin and the teal fins, the glazed tip ----------
function sbBow(X){const P=X.P,F=X.F,D=X.D,NK=P.storeys.length,top=F.top,tip=F.top-NK*D.STO,NS=D.HULL.NSEG,skin=X.RU?new Set(X.RU.skin):null;
 const yAt=v=>lerp(top,tip,v),pt=(v,s,u)=>{const y=yAt(v),q=F.flank(F.t(y),s,u);return[q[0],y,q[1]];};
 const glazedV=1-3*D.STO/(top-tip);   /* the keel's last three storeys glazed all round, over the Spine's head */
 for(const s of [-1,1]){
  // the flanks: dwelling bands; the ruin's lost panels open onto the dark fabric 4 m behind
  const lost=(u,v)=>skin&&skin.has('sb.sk.'+Math.min(NK-1,Math.floor(v*NK))+'.'+s+'.'+Math.min(NS-1,Math.floor(u*NS)));
  SBG.put(X,'res',gridSurface((u,v)=>pt(v,s,u),NS*2,NK,{uS:F.w(0)*1.6/25.6,vS:(top-tip)/25.6,hole:(u,v)=>v>glazedV||lost(u,v)}),true);
  SBG.put(X,'glass',gridSurface((u,v)=>pt(lerp(glazedV,1,v),s,u),NS*2,6,{uS:4,vS:2}),true);
  if(skin)SBG.put(X,'frab',gridSurface((u,v)=>{const p=pt(v,s,u),t=F.t(p[1]),c=[0,F.back+F.d(t)*.4];
   const dx=p[0]-c[0],dz=p[2]-c[1],l=Math.hypot(dx,dz)||1;return[p[0]-dx/l*4,p[1],p[2]-dz/l*4];},NS*2,NK,{uS:8,vS:40,hole:(u,v)=>!lost(u,v)}),true);
  // the teal fin up each flank (u .55), curling out at the crown and at the Nock
  const fu=.55,fin=(v,o)=>{const p=pt(v,s,fu),y=p[1],t=F.t(y),q2=F.flank(t,s,fu+.02),tx=q2[0]-p[0],tz=q2[1]-p[2],l=Math.hypot(tx,tz)||1;
   const out=[tz/l*s,-tx/l*s],nk=Math.exp(-Math.pow((y-P.nock.y)/18,2)),cr=Math.exp(-Math.pow((y-top)/22,2)),k=1+5*(nk+cr);return[p[0]+out[0]*o*k,y,p[2]+out[1]*o*k];};
  SBG.put(X,'teal',gridSurface((u,v)=>fin(v,lerp(.3,4.5,u)),2,NK,{uS:1,vS:40}),true);}
 // the keel's soffit: a shallow glazed dish where the Spine's head meets it
 {const y=tip,t=F.t(y),pnt=[0,tip-6,P.bow.keelZ];for(const s of [-1,1])SBG.put(X,'glass',gridSurface((u,v)=>{const q=F.flank(t,s,u);return[lerp(q[0],pnt[0],v),lerp(y,pnt[1],v),lerp(q[1],pnt[2],v)];},NS*2,2,{uS:3,vS:2}),true);
  SBG.put(X,'glass',gridSurface((u,v)=>{const w=F.w(t);return[lerp(-w,w,u)*(1-v),lerp(y,pnt[1],v),lerp(F.back,pnt[2],v)];},4,2,{uS:3,vS:2}),true);}
 // the back, standing free of the bay's wall
 SBG.put(X,X.dd?'whiteW':'white',gridSurface((u,v)=>{const y=yAt(v),w=F.w(F.t(y));return[lerp(-w,w,u),y,F.back];},4,40,{uS:8,vS:30}),true);
 // the prow fin: white, 7 m proud of the prow, full height
 SBG.put(X,'white',gridSurface((u,v)=>{const y=yAt(v);return[0,y,F.prowZ(F.t(y))+7*u*(1-v*v*.6)];},2,80,{uS:1,vS:60}),true);
 // white bands every 28 storeys (a refuge floor), standing proud 1.2 m
 for(let i=28;i<NK-8;i+=28){const y=top-i*D.STO;for(const s of [-1,1])SBG.put(X,'white',gridSurface((u,v)=>{const q=F.flank(F.t(y),s,u),q2=F.flank(F.t(y),s,Math.min(1,u+.01));
   const tx=q2[0]-q[0],tz=q2[1]-q[1],l=Math.hypot(tx,tz)||1;return[q[0]+tz/l*s*1.2,y-1.6+3.2*v,q[1]-tx/l*s*1.2];},24,1,{uS:20,vS:1}),true);}}

// ---- the crown: the deck cantilevered past the prow, its pool and pavilion; the mast; the arc ramp ------------------
function sbCrown(X){const P=X.P,F=X.F,D=X.D,C=P.crown,w0=F.w(0),d0=F.d(0),kx=1+C.over/w0,kz=1+C.over/d0,ow=X.dd?'whiteW':'white';
 const out=f=>{let q;if(f<.4)q=F.flank(0,-1,f/.4);else if(f<.8)q=F.flank(0,1,1-(f-.4)/.4);else{const g=(f-.8)/.2;q=[lerp(w0,-w0,g),F.back];}
  return[q[0]*kx,F.back+(q[1]-F.back)*kz];};
 const c=[0,F.back+d0*.35];
 SBG.put(X,'deck',gridSurface((u,v)=>{const o=out(u);return[lerp(c[0],o[0],v),C.y1,lerp(c[1],o[1],v)];},60,6,{uS:30,vS:6}),true);
 SBG.put(X,'shade',gridSurface((u,v)=>{const o=out(u);return[lerp(c[0],o[0],v),C.y0,lerp(c[1],o[1],v)];},60,6,{uS:30,vS:6}),true);
 /* its edge: the fascia, and the parapet over the deck with a gate where the arc ramp lands */
 const RP=P.ramp.pts,sd=(o,a,b)=>{const dx=b[0]-a[0],dz=b[2]-a[2],l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((o[0]-a[0])*dx+(o[1]-a[2])*dz)/l));return Math.hypot(o[0]-a[0]-t*dx,o[1]-a[2]-t*dz);};
 const gate=u=>{const o=out(u);for(let i=1;i<RP.length;i++)if(sd(o,RP[i-1],RP[i])<P.ramp.w/2+1.5)return true;return false;};
 SBG.put(X,ow,gridSurface((u,v)=>{const o=out(u);return[o[0],lerp(C.y0,C.y1,v),o[1]];},120,1,{uS:60,vS:1}),true);
 SBG.put(X,ow,gridSurface((u,v)=>{const o=out(u);return[o[0],lerp(C.y1,C.y1+1.4,v),o[1]];},240,1,{uS:120,vS:1,hole:(u,v)=>gate(u)}),true);
 // the pool: a glazed pad at the deck's front; the pavilion behind it
 const pl=C.pool;SBG.put(X,X.dd?'poolR':'pool',gridSurface((u,v)=>[lerp(-pl.size[0]/2,pl.size[0]/2,u),C.y1+.25,pl.at[2]+lerp(-pl.size[1]/2,pl.size[1]/2,v)],2,2,{}),true);
 const pv=[F.back+30,F.back+62],pw=Math.min(40,w0*.5);
 for(const z of pv)SBG.put(X,'res',gridSurface((u,v)=>[lerp(-pw,pw,u),lerp(C.y1,C.y1+12,v),z],4,1,{uS:2*pw/25.6,vS:12/25.6}),true);
 for(const s of [-1,1])SBG.put(X,'res',gridSurface((u,v)=>[s*pw,lerp(C.y1,C.y1+12,v),lerp(pv[0],pv[1],u)],2,1,{uS:32/25.6,vS:12/25.6}),true);
 SBG.put(X,ow,gridSurface((u,v)=>[lerp(-pw-4,pw+4,u),C.y1+12.4,lerp(pv[0]-4,pv[1]+4,v)],2,2,{uS:4,vS:2}),true);
 // the mast: a raked blade tapering to a needle; in the ruin kinked over above KINK
 const M=P.mast,ax=[M.head[0]-M.foot[0],M.head[1]-M.foot[1],M.head[2]-M.foot[2]],L=M.h;
 let bendAt=null,BM=null;if(X.RU){const k=X.RU.mast,K=[M.foot[0]+ax[0]*k.kink,M.foot[1]+ax[1]*k.kink,M.foot[2]+ax[2]*k.kink];
  bendAt=k.kink;BM=new THREE.Matrix4().makeTranslation(K[0],K[1],K[2]).multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(k.dir[2],0,-k.dir[0]).normalize(),k.bend*Math.PI/180))
   .multiply(new THREE.Matrix4().makeTranslation(-K[0],-K[1],-K[2]));}
 const mp=(v,cu)=>{const w=lerp(M.w0,M.w1,v),dp=lerp(9,1.5,v),cx=[[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]],i=Math.min(3,Math.floor(cu*4)),f=cu*4-i,a=cx[i],b=cx[i+1];
  let p=[M.foot[0]+ax[0]*v+lerp(a[0],b[0],f)*w/2,M.foot[1]+ax[1]*v,M.foot[2]+ax[2]*v+lerp(a[1],b[1],f)*dp/2];
  if(BM&&v>bendAt){const q=new THREE.Vector3(...p).applyMatrix4(BM);p=[q.x,q.y,q.z];}return p;};
 SBG.put(X,ow,gridSurface((u,v)=>mp(v,u),8,24,{uS:4,vS:L/20}),true);
 X.mastHead=SBG.tp(X,mp(1,.5));
 // the arc ramp: deck, parapets; as built every stay from the mast head holds it; in the ruin its crown end rides with the hull
 const R=P.ramp,rp=f=>{const n=R.pts.length-1,s=Math.min(n-1,Math.floor(f*n)),q=f*n-s,a=R.pts[s],b=R.pts[s+1];
  const p=[lerp(a[0],b[0],q),lerp(a[1],b[1],q),lerp(a[2],b[2],q)];if(!X.M)return p;const t=SBG.tp(X,p);return p.map((x,i)=>lerp(x,t[i],f));};
 const rib=(off,y0,y1,list)=>X.L[list].push(gridSurface((u,v)=>{const p=rp(u),p2=rp(Math.min(1,u+.01)),tx=p2[0]-p[0],tz=p2[2]-p[2],l=Math.hypot(tx,tz)||1;
  const o=typeof off==='number'?off:lerp(off[0],off[1],v);return[p[0]-tz/l*o,p[1]+(typeof off==='number'?lerp(y0,y1,v):y0),p[2]+tx/l*o];},96,typeof off==='number'?1:2,{uS:R.len/12,vS:1}));
 rib([-R.w/2,R.w/2],0,0,'deck');rib([-R.w/2,R.w/2],-2.4,0,'shade');
 for(const s of [-1,1])rib(s*R.w/2,-2.4,1.3,ow);
 X.rampAt=rp;}

/* a Nock part's deck (or its underside) with a rectangular hole: the outline (its back edge, its front curve) and the hole as a
   THREE.Shape, laid flat at y, facing up (or down) */
function sbHoledDeck(part,bk,front,y,R,up){const sh=new THREE.Shape(),n=16;
 for(let i=0;i<=n;i++){const x=lerp(part.x0,part.x1,i/n);i?sh.lineTo(x,bk(x)):sh.moveTo(x,bk(x));}
 for(let i=n;i>=0;i--){const x=lerp(part.x0,part.x1,i/n);sh.lineTo(x,front(x));}
 const hp=new THREE.Path(),x0=Math.max(R[0],part.x0+.5),x1=Math.min(R[1],part.x1-.5),z0=R[2],z1=R[3];hp.moveTo(x0,z0);hp.lineTo(x1,z0);hp.lineTo(x1,z1);hp.lineTo(x0,z1);hp.lineTo(x0,z0);sh.holes.push(hp);
 const s=new THREE.ShapeGeometry(sh),q=s.attributes.position,pos=[],uv=[];
 for(let i=0;i<q.count;i++){const x=q.getX(i),z=q.getY(i);pos.push(x,y,z);uv.push((x-part.x0)/14,(z-bk(x))/14);}
 const idx=Array.from(s.index.array);/* the shape's (x, z) laid on y flips its winding: facing up wants it flipped back */
 if(up)for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}

// ---- the Nock: the deck at mid-height, its glazed front, its pads; the centre rides with the Bow -------------------
function sbNock(X){const P=X.P,F=X.F,D=X.D,N=P.nock,gone=X.RU?new Set(X.RU.nockGone):null;
 // the landing pad before the tower's prow: a glazed disc in a white rim, a ring and a cross of light strips (dark in the ruin)
 {const L=P.landing,c=L.at;SBG.put(X,X.dd?'poolR':'pool',SBG.disc(c,0,L.r,c[1]+.3,48),false);
  SBG.put(X,X.dd?'whiteW':'white',SBG.disc(c,L.r,L.r+3,c[1]+.35,48),false);SBG.put(X,X.dd?'whiteW':'white',SBG.cyl(c,L.r+3,c[1],c[1]+1.2,48),false);
  if(!X.dd){SBG.put(X,'white',SBG.disc(c,L.r*.55,L.r*.62,c[1]+.4,48),false);
   for(const a of [0,Math.PI/2])SBG.put(X,'white',gridSurface((u,v)=>{const o=lerp(-L.r*.5,L.r*.5,u),q=lerp(-1.2,1.2,v);return[c[0]+o*Math.cos(a)-q*Math.sin(a),c[1]+.42,c[2]+o*Math.sin(a)+q*Math.cos(a)];},2,1,{}),false);}}
 for(const part of N.parts){if(gone&&gone.has(part.id))continue;const bound=false,bk=x=>part.side===0?F.back+1:-8;   /* the Nock stays on the rock: in the ruin the tower leans through its cracked centre (no gap opens between centre and wings) */
  /* SB_CUTS (settlements/strongbow, the today page): a lift shaft through this part (W2 rises through the Nock's west wing) */
  const cut=typeof SB_CUTS!=='undefined'&&SB_CUTS&&SB_CUTS.nock&&SB_CUTS.nock.part===part.id?SB_CUTS.nock.rect:null;
  const g=(y,list,uS)=>SBG.put(X,list,cut?sbHoledDeck(part,bk,N.front,y,cut,list==='deck'):gridSurface((u,v)=>{const x=lerp(part.x0,part.x1,u);return[x,y,lerp(bk(x),N.front(x),v)];},16,4,{uS:(part.x1-part.x0)/14,vS:6}),bound);
  g(N.y,'deck');g(N.y-N.th,'shade');
  SBG.put(X,'res',gridSurface((u,v)=>{const x=lerp(part.x0,part.x1,u);return[x,lerp(N.y-N.th,N.y-1.2,v),N.front(x)];},24,1,{uS:(part.x1-part.x0)/25.6,vS:N.th/25.6}),bound);
  SBG.put(X,X.dd?'whiteW':'white',gridSurface((u,v)=>{const x=lerp(part.x0,part.x1,u);return[x,lerp(N.y-1.2,N.y+1.4,v),N.front(x)+.2];},24,1,{uS:20,vS:1}),bound);
  /* the ends: the deck, its underside and its front are open surfaces, so an uncapped end showed the sky through the slab (the
     owner, 2026-11-15: "there is also transparancy issue where the slab broke off the arcology"). An end with no part beyond it
     (a wing's outer end) or where the part beyond fell (RU.nockGone) is closed: as built, a plain end wall in the front's glazing;
     in the ruin, a break with its storeys laid open ("this edge ought to have visible floors rather than intact windows"): each
     floor slab torn off ragged, a little proud or short of the line, columns standing between them, and a dark wall set back 5 m
     (the rooms' shadow) so the slab is never seen through */
  for(const [nb,xe,sg] of [[N.parts.find(q=>q.x1===part.x0),part.x0,-1],[N.parts.find(q=>q.x0===part.x1),part.x1,1]]){
   if(nb&&!(gone&&gone.has(nb.id)))continue;
   const z0=bk(xe),z1=N.front(xe),y0=N.y-N.th,both=(fn,nu,nv,o,list)=>{for(const r of [0,1])SBG.put(X,list,gridSurface((u,v)=>fn(r?1-u:u,v),nu,nv,o),bound);};
   if(!gone){both((u,v)=>[xe,lerp(y0,N.y,v),lerp(z0,z1,u)],8,2,{uS:(z1-z0)/25.6,vS:N.th/25.6},'res');continue;}
   const ns=Math.max(2,N.storeys|0),sh=N.th/ns,set=xe-sg*5;
   both((u,v)=>[set,lerp(y0+.3,N.y-.3,v),lerp(z0+.3,z1-.3,u)],4,2,{uS:4,vS:2},'shade');
   for(let k=1;k<ns;k++){const y=y0+k*sh,jag=u=>sg*(STRONGBOW.h(F.seed,813,k,Math.round(u*16))*3.6-1.8);
    both((u,v)=>[lerp(set,xe+jag(u),v),y,lerp(z0+.3,z1-.3,u)],16,1,{uS:(z1-z0)/14,vS:1},'deck');
    both((u,v)=>[lerp(set,xe+jag(u),v),y-.7,lerp(z0+.3,z1-.3,u)],16,1,{uS:(z1-z0)/14,vS:1},'shade');
    both((u,v)=>[xe+jag(u),lerp(y-.7,y,v),lerp(z0+.3,z1-.3,u)],16,1,{uS:(z1-z0)/14,vS:1},'frab');}
   /* the slab's own top and underside torn ragged at the edge, and the columns of the bay behind the break */
   for(const [y,list] of [[N.y,'frab'],[y0,'frab']]){const jag=u=>sg*STRONGBOW.h(F.seed,814,y|0,Math.round(u*16))*2.4;both((u,v)=>[lerp(xe,xe+jag(u),v),y-(y===N.y?.05:-.05),lerp(z0,z1,u)],16,1,{uS:4,vS:1},list);}
   for(let c=0;c<=Math.floor((z1-z0)/9);c++){const z=lerp(z0+2,z1-2,c/Math.max(1,Math.floor((z1-z0)/9)));if(STRONGBOW.h(F.seed,815,c,sg+2)<.25)continue;
    kput('acBox',[xe-sg*1.4,y0+N.th/2,z],null,[.9,N.th-.6,.9],new THREE.Color(0xbdb6a8));}}
  /* the Nock stays whole on the rock; the tower leans through its centre */}
 for(const pd of N.pads){if(gone&&gone.has('sb.nock.'+(pd.at[0]<0?'w':'e')))continue;const bound=false;
  SBG.put(X,X.dd?'poolR':'pool',gridSurface((u,v)=>[pd.at[0]+lerp(-pd.size[0]/2,pd.size[0]/2,u),N.y+.25,pd.at[2]+lerp(-pd.size[1]/2,pd.size[1]/2,v)],2,2,{}),bound);}}

// ---- the stays and their sockets --------------------------------------------------------------------------------------
function sbStays(X){const P=X.P,gone=X.RU?new Set(X.RU.gone):null,limp=X.RU?new Map(X.RU.limp.map(l=>[l.id,l])):null;
 const cc=X.dd?new THREE.Color(0x3a3630):new THREE.Color(0x2c3236),sk=new THREE.Color(X.dd?0x5f6a58:0x9a7a48);
 for(const st of P.stays){const A=st.a==='mast'?X.mastHead:SBG.tp(X,st.a);
  let B=st.b;if(st.fan==='ramp')B=X.rampAt(st.i/(P.ramp.pts.length-1));
  if(gone&&gone.has(st.id)){const l=limp.get(st.id);if(l){const j=(X.h(430,st.i,st.id.length)-.5)*10;beam('acBox',A,[A[0]+j,A[1]-l.len,A[2]+j*.5],.9,.9,cc);}
   if(st.fan.indexOf('anchor')===0)kput('acBox',B,null,[3.2,3.2,2.4],sk);continue;}
  beam('acBox',A,B,st.fan==='string'?1.4:1.1,st.fan==='string'?1.4:1.1,cc);
  if(st.fan.indexOf('anchor')===0||st.fan==='quiver')kput('acBox',B,null,[3.2,3.2,2.4],sk);}}

// ---- the rubble: heaps of loose debris on core/terrain KRUBBLE (the Ancient's Valley's method, kits/metropolis 57-mp-debris) ---
// Each of the ruin's heaps (STRONGBOW.ruin: RU.heaps) is a KRUBBLE heap: a lumpy mound at the talus angle, knolls on it, loose blocks
// lying on it, a cover of broken chunks sunk into it, so it reads as discrete pieces, not a slab. All the heaps' beds are one mesh
// (rubble grey, its hollows dark) and all their chunks and blocks another (the Ancients' white concrete, each a shade of its own).
MAT.sbRubble=new THREE.MeshStandardMaterial({map:TEX.concrete,vertexColors:true,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.sbRubbleChunk=new THREE.MeshStandardMaterial({map:TEX.concrete,vertexColors:true,color:0xffffff,roughness:.95,metalness:0,side:DS});
function sbHeaps(X,G){if(!X.RU||!X.RU.heaps||typeof KRUBBLE==='undefined')return [];
 const acc=[{p:[],c:[],u:[],i:[]},{p:[],c:[],u:[],i:[]}],recs=[];
 for(const spec of X.RU.heaps){const H=KRUBBLE.heap(spec),o=KRUBBLE.mesh(H,{cell:4});recs.push(H);
  /* each triangle goes to the bed (part 0) or the chunks and blocks (parts 1, 2), its vertices copied once per mesh */
  for(const k of [0,1]){const A=acc[k],m=new Map();
   for(let t=0;t<o.idx.length;t+=3){if((o.part[o.idx[t]]?1:0)!==k)continue;
    for(let j=0;j<3;j++){const v=o.idx[t+j];
     if(!m.has(v)){m.set(v,A.p.length/3);A.p.push(o.pos[3*v],o.pos[3*v+1],o.pos[3*v+2]);A.u.push(o.uv[2*v]/4,o.uv[2*v+1]/4);
      /* the bed a shade under the chunks and darker in the hollows; each chunk vertex its own shade */
      const sh=k?(.86+.2*KRAND.unit(KRAND.hash(H.seed,v,31)))*(1-.35*o.occ[v]):.72*(1-.55*o.occ[v]);A.c.push(.82*sh,.79*sh,.74*sh);}
     A.i.push(m.get(v));}}}}
 for(const k of [0,1]){const A=acc[k];if(!A.i.length)continue;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(A.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(A.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(A.c,3));
  g.setIndex(A.p.length/3>65535?new THREE.Uint32BufferAttribute(A.i,1):new THREE.Uint16BufferAttribute(A.i,1));g.computeVertexNormals();mesh(g,k?MAT.sbRubbleChunk:MAT.sbRubble,G);}
 return recs;}
