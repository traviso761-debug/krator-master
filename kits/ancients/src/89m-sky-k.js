// ================================================================= SKYSCRAPER K — "the Sail"
// A tall white sail: one face FLAT (the back, north), the other BELLIED (the
// front, south), its straight luff and curved leech meeting in a sharp prow at
// 405 m. High on the sail a great ROSE — a deep circular tunnel right through
// the building, a spoked glazed disc set in it, lit at night. A great arched
// RIB springs from the podium on the east, sweeps up outboard of the leech and
// round BEHIND the rose like a hoop, glazed to the sail in its lower reach. A
// slim campanile stands off the luff beside the tip and ends in a plain beacon.
// At the foot a long curving SHELL HALL grows out of the sail's west end, its
// glazed front sweeping out low; domed pavilions and balconied houses crowd the
// rest of the podium, and a tall pointed-arch porch opens into the sail itself.
//
// Decay: 0 intact · 1 ruined (tip and campanile snapped, rose shattered, rib
// broken with its upper half hanging from the sail, skin torn open on its
// floors, hall roof fallen in) · 2 toppled (cut at 150 m; the upper sail, rose
// and all, lies on its flat back on the plain to the east) · 3 rehabilitated
// (full height, HOLES and repairPass do the rest).
//
// Everything in the sail is (x, y, z) with the section a function of y: xL(y)
// the luff, xR(y) the leech, the back face at z = ZB and the front bellied out
// to ZB + DZ(y)*prof(s). The four faces of the section are separate grids so
// the corners stay sharp, and every opening (rose, porch, tear) is cut from the
// grid by testing the quad's real position, then framed by a swept tube that
// sits on the surface and covers the stair-step edge.
TEX.skGlow=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);const grd=g.createRadialGradient(64,64,0,64,64,64);
 grd.addColorStop(0,'rgba(255,240,200,1)');grd.addColorStop(.5,'rgba(255,214,140,.9)');grd.addColorStop(.86,'rgba(255,176,96,.45)');grd.addColorStop(1,'rgba(255,160,80,0)');
 g.fillStyle=grd;g.fillRect(0,0,w,h);});
TEX.skGlow.wrapS=TEX.skGlow.wrapT=THREE.ClampToEdgeWrapping;
MAT.skGlow=new THREE.MeshBasicMaterial({map:TEX.skGlow,color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:DS});
MAT.skPlate=new THREE.MeshStandardMaterial({color:0x8a847a,roughness:.9,side:DS});
MAT.skSoffit=new THREE.MeshStandardMaterial({color:0x191b1f,roughness:1,side:DS});
// a gable roof prism: base 1x1 on y=0, ridge along z at y=1. Eight triangles.
function skGableGeo(){const A=[-.5,0,.5],B=[.5,0,.5],C=[.5,0,-.5],D=[-.5,0,-.5],E=[0,1,.5],F=[0,1,-.5];
 const T=[A,B,E, C,D,F, B,C,F, B,F,E, D,A,E, D,E,F],P=[],U=[];
 for(const v of T){P.push(v[0],v[1],v[2]);U.push(v[0]+.5+v[2],v[1]);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.computeVertexNormals();return g;}
// A grid like gridSurface, but the UVs are ARC LENGTH in metres / tile, so the
// panel texture keeps its size on a face that narrows from 140 m to a point.
// hole(uc,vc,p) sees the quad-centre position p, so openings are cut where
// they really are, not where a (u,v) guess puts them.
function skGrid(fn,nu,nv,hole,tile){tile=tile||8;const cols=nu+1,n=(nu+1)*(nv+1),pos=new Float32Array(n*3),uv=new Float32Array(n*2),idx=[];
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const p=fn(i/nu,j/nv),k=j*cols+i;pos[k*3]=p[0];pos[k*3+1]=p[1];pos[k*3+2]=p[2];}
 const dist=(a,b)=>Math.hypot(pos[a*3]-pos[b*3],pos[a*3+1]-pos[b*3+1],pos[a*3+2]-pos[b*3+2]);
 for(let j=0;j<=nv;j++){let s=0;for(let i=0;i<=nu;i++){const k=j*cols+i;if(i>0)s+=dist(k,k-1);uv[k*2]=s/tile;}}
 for(let i=0;i<=nu;i++){let s=0;for(let j=0;j<=nv;j++){const k=j*cols+i;if(j>0)s+=dist(k,k-cols);uv[k*2+1]=s/tile;}}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){if(hole){const uc=(i+.5)/nu,vc=(j+.5)/nv;if(hole(uc,vc,fn(uc,vc)))continue;}
  const a=j*cols+i,b=a+1,c=a+cols,e=c+1;idx.push(a,c,b,b,c,e);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// a swept tube along a point list (open or closed)
function skTube(pts,r,seg,closed){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])),!!closed),seg,r,8,!!closed);}
kdef('skWin',new THREE.BoxGeometry(1,1,.4),MAT.winIntact);kdef('skWinD',new THREE.BoxGeometry(1,1,.4),MAT.winDead);
kdef('skDome',new THREE.SphereGeometry(1,18,7,0,TAU,0,Math.PI/2),MAT.white);kdef('skDomeR',new THREE.SphereGeometry(1,18,7,0,TAU,0,Math.PI/2),MAT.rust);
kdef('skDrum',new THREE.CylinderGeometry(1,1,1,20,1,true),MAT.white);kdef('skDrumR',new THREE.CylinderGeometry(1,1,1,20,1,true),MAT.rust);
kdef('skHub',new THREE.CylinderGeometry(1,1,1,20).rotateX(Math.PI/2),MAT.white);kdef('skHubR',new THREE.CylinderGeometry(1,1,1,20).rotateX(Math.PI/2),MAT.rust);
kdef('skNeedle',new THREE.ConeGeometry(1,1,10),MAT.white);kdef('skNeedleR',new THREE.ConeGeometry(1,1,10),MAT.rust);
kdef('skRoof',skGableGeo(),MAT.white);kdef('skRoofR',skGableGeo(),MAT.rust);
// Night only (setNight shows FIREKIT): a lit room card just proud of a window,
// and the rose's warm disc of light behind its glass.
kdef('skLit',new THREE.PlaneGeometry(1,1),MAT.dot);
kdef('skGlow',new THREE.PlaneGeometry(2,2),MAT.skGlow);
FIREKIT.push('skLit','skGlow');
// Presets are derived from this: targets/skyk/91z-views.js runs after the builders.
const SK_SITE={};

function buildSkyK(scene,gx,gz,d){reseed(9780+d);KOFF=[gx,0,gz];const SM=skyShardMark();const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 // ============================================================ THE NUMBERS
 const H=405,PH=2.5,ZB=-14,TX=22,PR=112,E0=.1;
 const CUT=150,HC1=372;                        // toppled cut; ruined snaps the prow off here
 const RY=250,RR=26;                           // the rose: centre height, opening radius
 const LX=-10,LHW=15,LYB=PH,LYS=88,ZG=2;        // the porch: centre x, half width, foot, springing, glass plane
 const LAP=LYS+LHW*Math.sqrt(3);               // porch apex (an equilateral pointed arch)
 const CX=4,CZ=6.5,CB=298;                    // the campanile: plan position, foot
 const HQ=[[-40,10],[-140,6],[-100,96]],HHW=25;  // the shell hall: its axis (a quadratic Bezier in plan), widest half-width
 const tq=y=>clamp(y/H,0,1);
 const xL=y=>-80+(80+TX)*tq(y);                          // luff: straight, raked
 const xR=y=>{const t=tq(y);return TX+36*(1-Math.pow(t,3.5))+10*Math.sin(Math.PI*t)*(1-t);};   // leech: near plumb, then curling in
 const DZ=y=>3+41*Math.pow(1-tq(y),.7);                  // depth of the belly
 const prof=s=>{s=clamp(s,0,1);return E0+(1-E0)*Math.pow(Math.max(0,Math.sin(Math.PI*Math.pow(s,.8))),.6);};   // draft forward of centre
 const frontZ=(x,y)=>{const a=xL(y),b=xR(y);return ZB+DZ(y)*prof((x-a)/Math.max(b-a,1e-3));};
 const fNrm=(x,y)=>{const e=.6;const zx=(frontZ(x+e,y)-frontZ(x-e,y))/(2*e),zy=(frontZ(x,y+e)-frontZ(x,y-e))/(2*e);const l=Math.hypot(zx,zy,1);return[-zx/l,-zy/l,1/l];};
 const RX=(xL(RY)+xR(RY))/2,RZG=ZB+9;           // rose centre x; the glazed disc's plane
 const inRose=(x,y,m)=>(x-RX)*(x-RX)+(y-RY)*(y-RY)<(RR+m)*(RR+m);
 const inLancet=(x,y,m)=>{if(y<LYB-1)return false;if(y<=LYS)return Math.abs(x-LX)<LHW+m;
  const r=2*LHW+m;return (x-LX-LHW)*(x-LX-LHW)+(y-LYS)*(y-LYS)<r*r&&(x-LX+LHW)*(x-LX+LHW)+(y-LYS)*(y-LYS)<r*r&&y<LAP+m;};
 const LSEG=[LYS-LYB,2*LHW*Math.PI/3,2*LHW*Math.PI/3,LYS-LYB],LTOT=LSEG[0]+LSEG[1]+LSEG[2]+LSEG[3];
 const lancetPt=u=>{let q=u*LTOT;if(q<LSEG[0])return[LX-LHW,LYB+q];q-=LSEG[0];
  if(q<LSEG[1]){const a=Math.PI-q/(2*LHW);return[LX+LHW+2*LHW*Math.cos(a),LYS+2*LHW*Math.sin(a)];}q-=LSEG[1];
  if(q<LSEG[2]){const a=Math.PI/3-q/(2*LHW);return[LX-LHW+2*LHW*Math.cos(a),LYS+2*LHW*Math.sin(a)];}q-=LSEG[2];
  return[LX+LHW,LYS-q];};
 const skin=SHELL(dd);
 SK_SITE[d]={x:gx,z:gz,H,RX,RY,RR,ZB,LX,CX,CZ};
 REGISTER({name:'Skyscraper K — the Sail ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:140,h:H+50});

 // nest a group under `parent` and route kput through it (KXF composes)
 const sub=(parent,pos,rot,fn)=>{const Q=new THREE.Group();Q.position.set(pos[0],pos[1],pos[2]);if(rot)Q.rotation.copy(rot);parent.add(Q);Q.updateMatrix();
  const prev=KXF;KXF=prev?{m:prev.m.clone().multiply(Q.matrix),q:prev.q.clone().multiply(Q.quaternion)}:{m:Q.matrix.clone(),q:Q.quaternion.clone()};
  try{fn(Q);}finally{KXF=prev;}return Q;};
 const people=(cx,cz,n,sp,y)=>{for(let i=0;i<n;i++){const x=cx+rr(-sp,sp),z=cz+rr(-sp,sp);const c=new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5));
  kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,c);kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));}};

 // ============================================================ PODIUM
 {const disc=new THREE.CircleGeometry(PR,96);disc.rotateX(-Math.PI/2);const uv=disc.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*PR/4,uv.getY(i)*PR/4);
  mesh(disc,CONC(dd),G,0,PH,0);
  mesh(lathe({rFn:()=>PR,H:PH,nu:96,nv:1}),skin,G);
  kput('slab',[0,.45,0],null,[PR+3.5,.9,PR+3.5],new THREE.Color(dd>0?0x5a4a40:0xd8d4cc));
  apron(G,0,0,(PR+3.5)*1.01,PR*1.45,dd,.9);
  if(dd>0){mossOnRing(0,PH+.2,0,PR*.88,110,3);scatterMoss(0,0,0,PR+4,PR+100,200,3.5);rubbleRing(0,0,0,PR+4,PR+70,110,3);trees(0,0,PR+30,PR+160,30);}}

 // ============================================================ THE SAIL (one piece: y0..cut)
 // build(P,dx,y0,y1,upper): the bodyGroup contract. y is ABSOLUTE throughout;
 // everything is written at y - y0 into P.
 const build=(P,dx,y0,y1,upper)=>{
  const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?HC1:null);
  const JAG=cut!=null?(cut<200?12:8):0;
  const topAt=up=>cut!=null?cut+JAG*(fbm(up*7+3,2.3,5.2,3)*2-1):H;
  const botAt=up=>upper?y0+6+6*(fbm(up*7+3,2.3,5.2,3)*2-1):y0;
  const yTop=cut!=null?cut-JAG:H,yBot=upper?y0+12:y0;          // safe extremes
  const hole=holeFn(dx*.85,781+(upper?1:0),cut!=null?cut-y0:null,1.1);
  const tear=dx>0?(face,x,y)=>{const n=fbm(x*.07,y*.045,782,3)-.5;
   if(face===0){const ex=(x+18)/24,ey=(y-188)/50;if(ex*ex+ey*ey<(1+n*1.2)*HOLES)return true;
    const fx=(x-40)/14,fy=(y-120)/30;if(fx*fx+fy*fy<(1+n*1.2)*HOLES)return true;}
   if(face===2){const ex=(x-18)/20,ey=(y-318)/36;if(ex*ex+ey*ey<(1+n*1.2)*HOLES)return true;}
   return false;}:null;
  const PU=[[0,.46],[.46,.04],[.5,.46],[.96,.04]];               // each face's share of the perimeter u
  const secXZ=(face,f,y,ins)=>{const a=xL(y),b=xR(y),D=DZ(y);let x,z;
   if(face===0){x=a+(b-a)*f;z=ZB+D*prof(f);}
   else if(face===1){x=b;z=ZB+D*E0*(1-f);}
   else if(face===2){x=b-(b-a)*f;z=ZB;}
   else{x=a;z=ZB+D*E0*f;}
   if(ins){const cx=(a+b)/2,cz=ZB+D*.4;x=cx+(x-cx)*(1-ins);z=cz+(z-cz)*(1-ins*1.5);}
   return[x,z];};
  const sHole=(face,up,x,y,lin)=>{if(hole&&hole(up,y-y0))return true;if(tear&&tear(face,x,y))return true;
   if((face===0||face===2)&&inRose(x,y,lin?1.5:0))return true;
   if(face===0&&inLancet(x,y,lin?1.5:0))return true;return false;};
  const NV=Math.max(6,Math.round((H-y0)/2.7));
  const faceGeo=(face,nu,ins,nv)=>skGrid((u,v)=>{const up=PU[face][0]+PU[face][1]*u;const yb=botAt(up),yt=topAt(up);const y=yb+(yt-yb)*v;const q=secXZ(face,u,y,ins);return[q[0],y-y0,q[1]];},
   nu,nv,(u,v,p)=>sHole(face,PU[face][0]+PU[face][1]*u,p[0],p[1]+y0,!!ins));
  const shell=[];   // every opaque skin-material piece of this body, merged at the end
  shell.push(faceGeo(0,84,0,NV),faceGeo(1,3,0,NV),faceGeo(2,84,0,NV),faceGeo(3,3,0,NV));
  // BATTENS: a raised band across both faces every 36 m, the sail's seams
  for(let yb=PH+36;yb<H-30;yb+=36){if(yb<yBot+2||yb>yTop-4)continue;
   for(const face of [0,2])shell.push(skGrid((u,v)=>{const s=.02+.96*u;const k=v<.34?0:v<.67?1:2;const y=yb+(v<.5?0:1.6);
     const a=xL(y),b=xR(y),x=face===0?a+(b-a)*s:b-(b-a)*s;const z0=face===0?frontZ(x,y):ZB;const out=(v>.2&&v<.8)?.6:0;
     return[x,y-y0,face===0?z0+out:z0-out];},48,3,(u,v,p)=>{const x=p[0],y=p[1]+y0;const up=face===0?(.02+.96*u)*.46:.5+(1-.02-.96*u)*.46;
     return sHole(face,up,x,y,false)||inRose(x,y,9.5)||(face===0&&inLancet(x,y,3));}));}
  // ---- THE CUT SECTION (ruins): lining with the same openings, pale plates with dark soffits
  if(dx>0){const gut=[faceGeo(0,56,.06,Math.round(NV*.6)),faceGeo(2,56,.06,Math.round(NV*.6)),faceGeo(1,2,.06,Math.round(NV*.6)),faceGeo(3,2,.06,Math.round(NV*.6))];
   meshMerged(gut,MAT.guts,P);
   const plates=[],soffs=[];
   const poly=(y,xa,xb,zBack)=>{const s=new THREE.Shape();const n=14;
    for(let i=0;i<=n;i++){const x=xa+(xb-xa)*i/n;s[i?'lineTo':'moveTo'](x,Math.max(frontZ(x,y)-2.2,ZB+1.4));}
    s.lineTo(xb,zBack);s.lineTo(xa,zBack);s.lineTo(xa,Math.max(frontZ(xa,y)-2.2,ZB+1.4));return s;};
   for(let y=PH+4.5;y<yTop-2;y+=4.5){if(y<yBot+1)continue;if(y>RY-RR-5&&y<RY+RR+5)continue;
    const a=xL(y)+3,b=xR(y)-3;if(b-a<4)continue;const shapes=[];
    if(y<LAP+3){shapes.push(poly(y,a,LX-LHW-2,ZB+1.4),poly(y,LX+LHW+2,b,ZB+1.4));
     const r=new THREE.Shape();r.moveTo(LX-LHW-2,ZB+1.4);r.lineTo(LX+LHW+2,ZB+1.4);r.lineTo(LX+LHW+2,ZG-1);r.lineTo(LX-LHW-2,ZG-1);r.lineTo(LX-LHW-2,ZB+1.4);shapes.push(r);}
    else shapes.push(poly(y,a,b,ZB+1.4));
    for(const sh of shapes){const g=new THREE.ShapeGeometry(sh);g.rotateX(Math.PI/2);g.translate(0,y-y0,0);plates.push(g);const g2=g.clone();g2.translate(0,-1.4,0);soffs.push(g2);}}
   meshMerged(plates,MAT.skPlate,P);meshMerged(soffs,MAT.skSoffit,P);
   for(let k=0;k<50;k++){const y=rr(yBot+8,yTop-8);if(y>RY-RR-5&&y<RY+RR+5)continue;const x=rr(xL(y)+6,xR(y)-6);if(xR(y)-xL(y)<14)continue;
    kput('pipeR',[x,y-y0,rr(ZB+2,frontZ(x,y)-3)],null,[.5,rr(6,20),.5],null);}}
  // ---- WINDOWS. (Design pass, 2026-10.) The old grid's rng draws are
  // replayed first, draw for draw, so everything placed after it (the rose's
  // ruin, the campanile, the houses) is exactly where it was; the facade
  // itself is placed by position hash.
  const NBF=18,NBB=15;
  for(let y=PH+5;y<H-6;y+=4.5){if(y<yBot+2.5||y>yTop-3)continue;
   for(const face of [0,2]){const NB=face===0?NBF:NBB;const a=xL(y),b=xR(y);const ww=(b-a)/NB*.8;if(ww<.9)continue;
    for(let k=0;k<NB;k++){if(k%3===1)continue;const s=(k+.5)/NB;const x=a+(b-a)*s;const up=face===0?s*.46:.5+(1-s)*.46;
     if(y>topAt(up)-3||y<botAt(up)+2)continue;if(sHole(face,up,x,y,false))continue;if(inRose(x,y,10))continue;if(face===0&&inLancet(x,y,4.5))continue;
     if(dx>0)rng();else if(rng()<.3)rng();}}}
  // THE FACADE: a rhythm that changes with height, so the sail reads as a
  // made thing at every range (the regular 18-bay ribbon grid read as graph
  // paper). From the foot up, on the bellied front:
  //   the base (to 124 m): two-storey openings under deep hoods;
  //   the belly (to 212 m): bays of three under one sunshade, piers between,
  //     every third storey a sky-lobby band of recessed loggias with balconies,
  //     the bays shifting half a bay every six storeys;
  //   the rose zone (to 292 m): nearly blank, small square openings staggered;
  //   the upper sail (to 372 m): narrow vertical slits, staggered;
  //   the prow: blank.
  // On the flat back, vertical strips of windows, banded every fourth storey.
  // Margins along the luff and leech widen with height.
  const BX=dx>0?'boxR':'boxW';
  const onF=(face,x,y,out)=>{if(face===0){const n=fNrm(x,y);return{p:[x+n[0]*out,y-y0,frontZ(x,y)+n[2]*out],n};}return{p:[x,y-y0,ZB-out],n:[0,0,-1]};};
  const upOf=(face,x,y)=>{const f=clamp((x-xL(y))/Math.max(xR(y)-xL(y),1),0,1);return face===0?f*.46:.5+(1-f)*.46;};
  const okAt=(face,x,y,h,m)=>{const up=upOf(face,x,y);if(y+h/2>topAt(up)-1.5||y-h/2<botAt(up)+1.5)return false;
   if(sHole(face,up,x,y,false))return false;if(inRose(x,y,m==null?10:m))return false;if(face===0&&inLancet(x,y,4.5))return false;return true;};
  const win=(face,x,y,w,h)=>{if(!okAt(face,x,y,h))return false;const o=onF(face,x,y,.1),q=qFacing(o.n),hs=h3(x*.31,y*.17,face+7.7);
   if(dx>0){if(hs<.3)return true;kput('skWinD',o.p,q,[w,h,1],null);return true;}
   kput('skWin',o.p,q,[w,h,1],null);
   if(hs<.3)kput('skLit',[o.p[0]+o.n[0]*.25,o.p[1]+o.n[1]*.25,o.p[2]+o.n[2]*.25],q,[w*.92,h*.87,1],WARM.clone().multiplyScalar(.55+hs*1.5));return true;};
  const box=(name,face,x,y,s,out,brk)=>{if(!okAt(face,x,y,s[1],8))return;if(dx>0&&brk&&h3(x*.7,y*.3,4.4)<brk)return;const o=onF(face,x,y,out);kput(name,o.p,qFacing(o.n),s,null);};
  const nearBatten=y=>{for(let yb=PH+36;yb<H-30;yb+=36)if(Math.abs(y-yb-.8)<3.2)return true;return false;};
  const Z1=124,Z2=RY-RR-12,Z3=RY+RR+16,Z4=HC1;
  for(let n=0,y=PH+5;y<Z4;n++,y+=4.5){if(y<yBot+2.5||y>yTop-3||nearBatten(y))continue;
   const a=xL(y),b=xR(y),W=b-a,m=W*(.05+.07*tq(y))+2.5,L=a+m,R=b-m;if(R-L<6)continue;
   const row=(pitch,shift,fn)=>{const N=Math.floor((R-L)/pitch);if(N<1)return;const x0=(L+R)/2-(N-1)/2*pitch+shift*pitch;for(let g=0;g<N;g++){const x=x0+g*pitch;if(x>L-1&&x<R+1)fn(x,g);}};
   // the bellied front
   if(y<Z1){if(n%2===0)row(7.4,0,x=>{if(win(0,x,y+2.25,4.4,6.4))box(BX,0,x,y+5.9,[5.8,.45,1.9],.95,.5);});}
   else if(y<Z2){const sh=(Math.floor(n/6)%2)*.5;
    if(n%3===2)row(12.8,sh,(x,g)=>{if(((g+Math.floor(n/3))&1)===0)return;
      box('boxD',0,x,y+1,[10.4,3.1,.3],.06,0);box(BX,0,x,y-.65,[11,.5,2.6],1.3,.35);box(BX,0,x,y+.1,[11,1.1,.16],2.55,.5);});
    else row(12.8,sh,x=>{let k=0;for(const o of [-3.5,0,3.5])if(win(0,x+o,y+1,2.7,3.1))k++;if(k)box(BX,0,x,y+2.95,[11.4,.35,1.5],.75,.45);});}
   else if(y<Z3){if(n%2===0)row(8.6,(n%4)?.5:0,x=>{win(0,x,y+1,1.9,1.9);});}
   else row(5.4,n%2?.5:0,x=>{win(0,x,y+1.2,1.15,3.9);});
   // the flat back
   if(y<Z2){if(n%4!==3)row(10.6,0,x=>{win(2,x,y+1,3.6,2.8);});else row(10.6,0,x=>{box(BX,2,x,y+.4,[9.4,.5,1.2],.6,.4);});}
   else if(y<Z3){if(n%2===1)row(10.6,0,x=>{win(2,x,y+1,1.7,2.4);});}
   else row(6.2,n%2?.5:0,x=>{win(2,x,y+1.2,1.15,3.9);});}
  // THE KEEL: a blade standing out of the belly along its deepest line (the
  // draft, 42% back from the luff), springing from the porch's apex and
  // broken only by the rose's collar. Square-on from the south the front
  // was a flat silhouette; the keel and its shadow draw the belly's crest.
  {const sm=y=>{const t=clamp((y-LAP)/46,0,1);return t*t*(3-2*t);},xk=y=>lerp(LX,xL(y)+.42*(xR(y)-xL(y)),sm(y));
   for(const sp of [[LAP-1,RY-RR-9.5],[RY+RR+9.5,HC1-6]]){const ya=Math.max(sp[0],yBot+1.5),yb=Math.min(sp[1],yTop-1.5);if(yb-ya<8)continue;
    const dep=v=>{const y=lerp(sp[0],sp[1],v);return(1.6+5.4*Math.pow(Math.sin(Math.PI*clamp((y-sp[0])/(sp[1]-sp[0]),0,1)),.6))*(1-.45*tq(y));};
    shell.push(skGrid((u,v)=>{const y=lerp(ya,yb,v),x=xk(y),n=fNrm(x,y),z=frontZ(x,y),a=u*Math.PI,t=[n[2],0,-n[0]],w=2.3*(1-.4*tq(y)),D=dep((y-sp[0])/(sp[1]-sp[0]));
      return[x+t[0]*w*Math.cos(a)+n[0]*D*Math.sin(a)-n[0]*.4,y-y0+n[1]*D*Math.sin(a),z+t[2]*w*Math.cos(a)+n[2]*D*Math.sin(a)-n[2]*.4];},8,Math.max(6,Math.round((yb-ya)/3)),
     (u,v,p)=>{const y=p[1]+y0,x=xk(y),up=upOf(0,x,y);return y>topAt(up)-1||y<botAt(up)+1||(hole&&hole(up,y-y0))||(tear&&tear(0,x,y));},6));}}
  // THE BOLT ROPES: a rounded edge along the luff and the leech of the belly,
  // so the sail's outline is drawn as a line (broken where the skin is)
  for(const e of [0,1]){let seg=[];const flush=()=>{if(seg.length>2)shell.push(skTube(seg,1.25,seg.length*2,false));seg=[];};
   for(let y=yBot+1;y<=yTop-1;y+=4){const up=e?.46:0,x=e?xR(y):xL(y),z=ZB+DZ(y)*E0+.2;
    if(y>topAt(up)-1||y<botAt(up)+1||(hole&&hole(up,y-y0))){flush();continue;}seg.push([x+(e?.3:-.3),y-y0,z]);}flush();}
  // ---- THE ROSE: a tunnel through the sail, collars on both faces, a spoked glazed disc
  if(RY-RR-10>yBot&&RY+RR+10<yTop){const ry=RY-y0;
   shell.push(skGrid((u,v)=>{const th=u*TAU;const x=RX+RR*Math.cos(th),y=RY+RR*Math.sin(th);const zf=frontZ(x,y);return[x,y-y0,zf+(ZB-zf)*v];},96,8,null,6));
   const arcs=dx>0?[[.3,2.1],[2.6,4.2],[4.9,5.9]]:[[0,TAU]];
   for(const ar of arcs){const cl=ar[1]-ar[0]>=TAU-1e-6;const n=Math.max(8,Math.round((ar[1]-ar[0])*20));
    const ring=(r,zf)=>{const pts=[];for(let i=0;i<(cl?n:n+1);i++){const th=ar[0]+(ar[1]-ar[0])*i/n;const x=RX+r*Math.cos(th),y=RY+r*Math.sin(th);pts.push([x,y-y0,zf(x,y)]);}return pts;};
    shell.push(skTube(ring(RR+.6,(x,y)=>frontZ(x,y)+1.1),2.6,cl?120:n*3,cl));
    shell.push(skTube(ring(RR+8.4,(x,y)=>frontZ(x,y)+1.4),1.4,cl?120:n*3,cl));
    shell.push(skTube(ring(RR+.6,()=>ZB-1.1),2.6,cl?120:n*3,cl));
    shell.push(skTube(ring(RR+8.4,()=>ZB-1.4),1.4,cl?120:n*3,cl));
    const a0=ar[0],a1=ar[1];
    shell.push(skGrid((u,v)=>{const th=a0+(a1-a0)*u,r=RR+.8+v*7.6;const x=RX+r*Math.cos(th),y=RY+r*Math.sin(th);return[x,y-y0,frontZ(x,y)+1.3];},cl?96:Math.round(n*1.5),2,null,6));
    shell.push(skGrid((u,v)=>{const th=a0+(a1-a0)*u,r=RR+.8+v*7.6;return[RX+r*Math.cos(th),RY+r*Math.sin(th)-y0,ZB-1.3];},cl?96:Math.round(n*1.5),2,null,6));}
   if(dx>0)for(let k=0;k<5;k++){const th=rr(0,TAU);kput('rubble',[RX+(RR+4)*Math.cos(th),ry+(RR+4)*Math.sin(th),frontZ(RX+(RR+4)*Math.cos(th),RY+(RR+4)*Math.sin(th))+1.5],qEuler(rng()*3,rng()*3,rng()*3),[2.5,1.8,2.2],new THREE.Color(0xb8b0a4));}
   const zs=RZG+.8,SP=dx>0?'strutR':'strutW';
   // spokes: 24; the ruin keeps a few whole, stubs at the hub and at the rim, the rest gone
   for(let k=0;k<24;k++){const th=k/24*TAU;const c=Math.cos(th),s=Math.sin(th);
    const A=[RX+4.5*c,ry+4.5*s,zs],B=[RX+(RR-.6)*c,ry+(RR-.6)*s,zs];
    if(dx===0){beam(SP,A,B,1.1,1.4);continue;}
    const f=rng();if(f<.18)beam(SP,A,B,1.1,1.4);
    else if(f<.45){const t=rr(.2,.55);beam(SP,A,[lerp(A[0],B[0],t),lerp(A[1],B[1],t),zs+rr(-1.5,1.5)],1.1,1.4);}
    else if(f<.72){const t=rr(.2,.5);const bent=rr(-.5,.5);const L=(RR-5)*t;beam(SP,B,[B[0]-L*Math.cos(th+bent),B[1]-L*Math.sin(th+bent),zs+rr(-3,3)],1.1,1.4);}}
   // tracery rings, rim, hub, hour marks
   const RG=dx>0?'ringR':'ringW';
   kput(RG,[RX,ry,zs],null,[RR-.4,RR-.4,16],null);
   if(dx===0||rng()<.4)kput(RG,[RX,ry,zs],null,[RR*.72,RR*.72,9],null);
   if(dx===0||rng()<.6)kput(RG,[RX,ry,zs],null,[RR*.42,RR*.42,9],null);
   kput(dx>0?'skHubR':'skHub',[RX,ry,zs],dx>0?qEuler(rr(-.3,.3),rr(-.3,.3),0):null,[4.6,4.6,3.2],null);
   for(let k=0;k<12;k++){if(dx>0&&rng()<.4)continue;const th=k/12*TAU;kput(dx>0?'boxR':'boxW',[RX+(RR-4)*Math.cos(th),ry+(RR-4)*Math.sin(th),zs+.4],qEuler(0,0,th-Math.PI/2),[1.4,4,1.4],null);}
   // the hands, ten past ten; on the ruin the minute hand hangs from the hub
   if(dx===0){const hh=150*Math.PI/180,mh=30*Math.PI/180;
    beam('boxD',[RX,ry,zs+2],[RX+13*Math.cos(hh),ry+13*Math.sin(hh),zs+2],1.8,.8);
    beam('boxD',[RX,ry,zs+2.8],[RX+22*Math.cos(mh),ry+22*Math.sin(mh),zs+2.8],1.2,.8);}
   else beam('boxD',[RX,ry,zs+2],[RX+rr(-3,3),ry-21,zs+rr(3,6)],1.2,.8);
   // The glass draws BEFORE the glow (renderOrder): blended after it, its blue
   // wash greyed the lamp to a pale cream. Glow is in front of the glass anyway.
   if(dx===0){mesh(new THREE.CircleGeometry(RR-.2,72),MAT.glass,P,RX,ry,RZG).renderOrder=-1;
    kput('skGlow',[RX,ry,RZG+.35],null,[RR*1.02,RR*1.02,1],new THREE.Color(0xff6a18));}
   else for(let k=0;k<14;k++){const x=RX+rr(-RR*.7,RR*.7);const yb=RY-Math.sqrt(Math.max(0,RR*RR-(x-RX)*(x-RX)))+.4;
    kput('paneD',[x,yb-y0,rr(ZB+2,frontZ(x,yb)-2)],qEuler(Math.PI/2+rr(-.3,.3),rr(0,3),0),[rr(2,5),rr(2,4),1],null);}}
  // ---- THE PORCH: a pointed arch 110 m tall opening into the sail's foot
  if(!upper&&LAP+4<yTop){const reveal=skGrid((u,v)=>{const p=lancetPt(u);const zf=frontZ(p[0],p[1]);return[p[0],p[1]-y0,zf+(ZG-zf)*v];},72,3,null,6);
   shell.push(reveal);
   const fr=[];for(let i=0;i<=90;i++){const p=lancetPt(i/90);fr.push([p[0],p[1]-y0,frontZ(p[0],p[1])+.9]);}shell.push(skTube(fr,2.3,160,false));
   if(dx===0){const s=new THREE.Shape();for(let i=0;i<=72;i++){const p=lancetPt(i/72);s[i?'lineTo':'moveTo'](p[0],p[1]-y0);}mesh(new THREE.ShapeGeometry(s),MAT.glass,P,0,0,ZG);}
   const MU=dx>0?'strutR':'strutW';
   for(let x=LX-LHW+3.75;x<LX+LHW-1;x+=3.75){if(dx>0&&rng()<.5)continue;
    let top=LYS;if(Math.abs(x-LX)<LHW){const r=2*LHW;const dxl=x-(LX+LHW),dxr=x-(LX-LHW);top=LYS+Math.min(Math.sqrt(Math.max(0,r*r-dxl*dxl)),Math.sqrt(Math.max(0,r*r-dxr*dxr)));}
    beam(MU,[x,LYB-y0,ZG+.3],[x,top-.5-y0,ZG+.3],.45,.7);}
   for(let y=LYB+9;y<LAP-4;y+=9){if(dx>0&&rng()<.5)continue;let hw=LHW;if(y>LYS){const r=2*LHW,dy=y-LYS;hw=Math.sqrt(Math.max(0,r*r-dy*dy))-LHW;}
    beam(MU,[LX-hw,y-y0,ZG+.3],[LX+hw,y-y0,ZG+.3],.45,.7);}
   // galleries in the porch, floors and a dark wall behind the glass
   const BX=dx>0?'boxR':'boxW';
   for(let y=LYB+18;y<LYS;y+=18){if(dx>0&&rng()<.35){rubbleRing(LX,LYB-y0,ZG+8,1,LHW,8,2.2);continue;}
    const tilt=dx>0?rr(-.08,.08):0;kput(BX,[LX,y-y0,ZG+2.6],qEuler(tilt,0,tilt),[2*LHW-1.5,.7,5],null);kput(BX,[LX,y+.8-y0,ZG+5],null,[2*LHW-1.5,1.1,.25],null);}
   for(let y=LYB+9;y<LAP-6;y+=9){let hw=LHW;if(y>LYS){const r=2*LHW,dy=y-LYS;hw=Math.sqrt(Math.max(0,r*r-dy*dy))-LHW;}if(hw<3)continue;
    kput(BX,[LX,y-y0,(ZB+ZG)/2],null,[2*hw,.5,ZG-ZB-1],null);
    if(dx===0)for(let k=0;k<3;k++)if(rng()<.5)kput('skLit',[LX+rr(-hw+3,hw-3),y+2-y0,ZB+.9],null,[rr(4,8),2.6,1],WARM.clone().multiplyScalar(rr(.5,.9)));}
   kput('boxD',[LX,(LYB+LAP)/2-y0,ZB+.6],null,[2*LHW,LAP-LYB,.4],null);}
  // ---- THE PROW: a mast at the tip
  if(cut==null){kput(dx>0?'postR':'postW',[TX,H-y0+6,ZB+1.2],null,[.6,20,.6],null);if(dx===0)kput('finial',[TX,H-y0+17,ZB+1.2],null,[1,1.6,1],null);}
  // ---- THE CAMPANILE, standing off the luff (the toppled one lies elsewhere)
  if(!upper&&yTop>CB+4){
   const ctop=cut==null?147:57;
   {const g=lathe({rFn:y=>2.5+4.2*Math.pow(y/16,1.3),H:16,nu:24,nv:6});shell.push(g.translate(CX,CB-16-y0,CZ));}
   sub(P,[CX,CB-y0,CZ],null,Q=>skCampanile(Q,dx,0,ctop,cut!=null));
   for(const yy of [CB+32,CB+64]){if(yy>CB+ctop-2)continue;const xa=Math.max(CX,xL(yy)+1);beam(dx>0?'strutR':'strutW',[CX,yy-2-y0,CZ-4.5],[xa,yy-2-y0,frontZ(xa,yy)-.4],1.4,1.4);}}
  meshMerged(shell,SHELL(dx),P);};

 // ============================================================ STAND / TOPPLE
 const P=new THREE.Group();P.position.set(0,PH,0);G.add(P);useGroupXF(P);
 if(d!==2)build(P,dd,PH,null,false);else build(P,1,PH,CUT,false);endGroupXF();
 const UX=135,UZ=-8;
 if(d===2){
  // The upper sail went over to the east and lies on its FLAT BACK, belly and
  // rose to the sky: local y (up the sail) runs east, local z (the depth) is up.
  const U=new THREE.Group();U.position.set(UX,-ZB-.6,UZ);U.rotation.set(-Math.PI/2,-Math.PI/2+.12,0,'YXZ');G.add(U);useGroupXF(U);
  build(U,1,CUT,null,true);endGroupXF();
  REGISTER({name:'Skyscraper K — the fallen sail',x:UX+130,z:UZ+10,r:150,h:60});
  for(const f of [0,.2,.45,.7])rubbleRing(UX+f*260,0,UZ+10-f*20,8,50-f*30,70,4);
  // the campanile snapped off and lies beside the fallen prow
  const th=-.35,e=new THREE.Euler(0,-th,-Math.PI/2,'YXZ');
  sub(G,[UX+175,5.1,UZ-72],e,Q=>skCampanile(Q,1,0,147,false));
  rubbleRing(UX+175,0,UZ-72,2,24,40,3);}
 SK_SITE[d].UX=UX;SK_SITE[d].UZ=UZ;
 if(d===1){// the campanile's head, 90 m of it, lying out on the plain to the south
  const th=100*Math.PI/180,e=new THREE.Euler(0,-th,-Math.PI/2,'YXZ');const v=new THREE.Vector3(0,57,0).applyEuler(e);
  const S=[128*Math.cos(th),4.7,128*Math.sin(th)];sub(G,[S[0]-v.x,S[1]-v.y,S[2]-v.z],e,Q=>skCampanile(Q,1,57,147,true));
  rubbleRing(S[0],0,S[2],2,26,50,3.2);SK_SITE[d].camp=S;}
 if(d!==2){REGISTER({name:'Skyscraper K — the rose',x:RX,z:ZB+10,y:RY-RR-10,r:RR+10,h:2*RR+20});
  REGISTER({name:'Skyscraper K — the campanile',x:CX,z:CZ,y:CB-16,r:9,h:d===1?75:165});}

 // ============================================================ THE RIB (a hoop round the rose)
 const RIBP=[[98,0,12],[112,60,9],[118,130,2],[112,190,-10],[96,236,-20],[78,270,-24],[58,296,-24],[30,311,-24],[6,309,-24]];
 const ribC=new THREE.CatmullRomCurve3(RIBP.map(p=>new THREE.Vector3(p[0],p[1],p[2])),false,'centripetal');
 const ribGeo=(s0,s1,xf)=>skGrid((u,v)=>{const s=s0+(s1-s0)*v;const c=ribC.getPointAt(s),T=ribC.getTangentAt(s);
   const N=new THREE.Vector3(-T.y,T.x,0).normalize(),B=new THREE.Vector3().crossVectors(T,N).normalize();
   let w=lerp(11,6.5,s)/2,t=lerp(7,4.5,s)/2;if(s>.965){const k=Math.sqrt(clamp(1-Math.pow((s-.965)/.035,2),0,1));w*=.15+.85*k;t*=.15+.85*k;}
   const th=u*TAU,cs=Math.cos(th),sn=Math.sin(th);const p=c.clone().addScaledVector(N,w*Math.sign(cs)*Math.pow(Math.abs(cs),.6)).addScaledVector(B,t*Math.sign(sn)*Math.pow(Math.abs(sn),.6));
   if(xf)xf(p);return[p.x,p.y,p.z];},14,Math.max(4,Math.round((s1-s0)*120)),null,6);
 // the rib's x and z at height y on its rising (lower) branch
 const RS=[];for(let i=0;i<=200;i++){const s=i/200*.8;const c=ribC.getPointAt(s);RS.push([c.y,c.x,c.z,s]);}
 const ribAtY=y=>{for(let i=1;i<RS.length;i++)if(RS[i][0]>=y){const a=RS[i-1],b=RS[i],t=(y-a[0])/Math.max(b[0]-a[0],1e-6);return[lerp(a[1],b[1],t),lerp(a[2],b[2],t),lerp(a[3],b[3],t)];}return[RS[200][1],RS[200][2],.8];};
 const rib=dd>0?MAT.rust:MAT.white;const RB=dd>0?'strutR':'strutW';
 kput(dd>0?'boxR':'boxW',[98,PH+3,12],qEuler(0,.25,0),[20,6,17],null);
 const ribTop=d===0||d===3?1:d===1?.44:.28;
 mesh(ribGeo(0,ribTop),rib,G);
 if(ribTop<1){const c=ribC.getPointAt(ribTop);rubbleRing(c.x+8,PH,c.z+6,2,26,40,3);}
 // brackets from the rib back to the sail's flat face, where the hoop runs behind it
 const brackets=(s0)=>{for(const s of [.74,.8,.86,.92,.975]){if(s<s0)continue;const c=ribC.getPointAt(s);if(c.x<xL(c.y)+2||c.x>xR(c.y)-2)continue;
  if(dd>0&&rng()<.3)continue;beam(RB,[c.x,c.y,c.z+2],[c.x,c.y,ZB-.2],2.2,2.2);}};
 if(ribTop===1)brackets(0);
 if(d===1){// broken at 0.44; the upper half hangs from its bracket behind the rose
  const pv=ribC.getPointAt(1);const R1=new THREE.Matrix4().makeRotationZ(-16*Math.PI/180),R2=new THREE.Matrix4().makeRotationX(24*Math.PI/180);const M=R2.multiply(R1);
  mesh(ribGeo(.48,1,p=>{p.sub(pv).applyMatrix4(M).add(pv);}),rib,G);
  brackets(.9);SK_SITE[d].ribHang=[pv.x,pv.y,pv.z];}
 if(d===2){// the rest of the hoop lies in two pieces north of the stump
  const m1=mesh(ribGeo(.3,.62),rib,G);m1.position.set(150,0,-150);m1.rotation.set(-Math.PI/2,.5,0);dropFragment(m1,0,.5);
  const m2=mesh(ribGeo(.64,1),rib,G);m2.position.set(20,0,-185);m2.rotation.set(-Math.PI/2,-.3,0);dropFragment(m2,0,.5);
  rubbleRing(150,0,-150,4,40,50,3.5);rubbleRing(20,0,-185,4,40,50,3.5);}
 // the glazed web in the hoop's lower reach, sail leech to rib, with tie struts
 {const ytop=d===0||d===3?215:d===1?150:0;
  if(ytop>40){const webPt=(u,y)=>{const r=ribAtY(y);const s=r[2];const w=lerp(11,6.5,s)/2;return[lerp(xR(y)-.4,r[0]-w*.8,u),y,lerp(ZB+DZ(y)*E0*.5,r[1],u)];};
   if(d===0)mesh(skGrid((u,v)=>webPt(u,lerp(26,ytop,v)),10,24,null,8),MAT.glass,G);
   for(let y=26;y<=ytop+.1;y+=ytop>200?(ytop-26)/8:16){if(dd>0&&rng()<.45)continue;beam(RB,webPt(0,y),webPt(1,y),1.4,1.8);}
   if(d===0)for(let k=1;k<6;k++){const u=k/6;for(let y=26;y<ytop-1;y+=(ytop-26)/8){beam('strutW',webPt(u,y),webPt(u,Math.min(ytop,y+(ytop-26)/8)),.5,.7);}}}}

 // ============================================================ THE SHELL HALL
 {
  const hAx=s=>{const a=(1-s)*(1-s),b=2*s*(1-s),c=s*s;return[a*HQ[0][0]+b*HQ[1][0]+c*HQ[2][0],a*HQ[0][1]+b*HQ[1][1]+c*HQ[2][1]];};
  const hTan=s=>{const x=2*(1-s)*(HQ[1][0]-HQ[0][0])+2*s*(HQ[2][0]-HQ[1][0]),z=2*(1-s)*(HQ[1][1]-HQ[0][1])+2*s*(HQ[2][1]-HQ[1][1]);const l=Math.hypot(x,z);return[x/l,z/l];};
  const hW=s=>2*HHW-10*s,hH=s=>70-48*s+22*Math.pow(s,4);
  const hProf=(s,a)=>[(a-.5)*hW(s),hH(s)*Math.pow(Math.max(0,Math.sin(Math.PI*a*.82)),.75)];
  const hPt=(s,o,y)=>{const A=hAx(s),T=hTan(s);return[A[0]+T[1]*o,PH+y,A[1]-T[0]*o];};
  const hN=(s,a)=>{const e=.01,p0=hProf(s,Math.max(0,a-e)),p1=hProf(s,Math.min(1,a+e));const dO=p1[0]-p0[0],dY=p1[1]-p0[1],l=Math.hypot(dO,dY);return[-dY/l,dO/l];};
  const roofHole=dd>0?(u,v)=>fbm(u*5,v*3,786,2)<(.34+(u>.3&&u<.74?.32:0))*HOLES:null;
  const roof=[];
  roof.push(skGrid((u,v)=>{const q=hProf(u,v);return hPt(u,q[0],q[1]);},44,26,roofHole?(u,v)=>roofHole(u,v):null));
  // THE SHELL HAS A THICKNESS. It was one surface, so every tear in the ruined
  // roof showed a paper edge and the intact hall's ceiling was the back of its
  // own roof. A second skin 0.9 m inside it, punched by the same predicate,
  // makes the ceiling and turns each tear into a sectioned slab.
  roof.push(skGrid((u,v)=>{const q=hProf(u,v),n=hN(u,v);return hPt(u,q[0]-n[0]*.9,Math.max(.3,q[1]-n[1]*.9));},44,26,roofHole?(u,v)=>roofHole(u,v):null));
  // transverse ribs on the shell, raised 0.8 m
  for(let k=1;k<14;k++){const sk=k/14;if(roofHole&&roofHole(sk,.5))continue;
   roof.push(skGrid((u,v)=>{const s=sk+(v<.5?-.006:.006);const q=hProf(s,u),n=hN(s,u);const o=(v>.2&&v<.8)?.8:0;return hPt(s,q[0]+n[0]*o,q[1]+n[1]*o);},24,3,roofHole?(u)=>roofHole(sk,u):null,4));}
  // the eave lip and the mouth lip
  {const e=[];for(let i=0;i<=40;i++){const s=i/40,q=hProf(s,1);e.push(hPt(s,q[0]+.4,q[1]));}roof.push(skTube(e,1.3,80,false));
   const m=[];for(let i=0;i<=24;i++){const q=hProf(1,i/24);m.push(hPt(1,q[0],q[1]+.5));}roof.push(skTube(m,1.6,48,false));}
  meshMerged(roof,dd>0?MAT.rust:MAT.white,G);
  // the hall's own terrace: it runs off the podium, so it carries its floor out at PH
  {const TW=s=>hW(s)/2+5;const deck=[];
   deck.push(skGrid((u,v)=>hPt(u*1.02,(v-.5)*2*TW(u*1.02),.12),40,6,null,8));
   for(const sd of [-1,1])deck.push(skGrid((u,v)=>hPt(u*1.02,sd*TW(u*1.02),.12-v*(PH+.12)),40,1,null,8));
   deck.push(skGrid((u,v)=>hPt(1.02,(u-.5)*2*TW(1.02),.12-v*(PH+.12)),12,1,null,8));
   meshMerged(deck,CONC(dd),G);}
  // glazed front, inclined, under the eave
  const oBot=s=>hW(s)/2-5,oTop=s=>hProf(s,1)[0]-.6,yTopF=s=>hProf(s,1)[1]-.8;
  if(d===0)mesh(skGrid((u,v)=>hPt(u,lerp(oBot(u),oTop(u),v),lerp(0,yTopF(u),v)),40,1,null,8),MAT.glass,G);
  const MU=dd>0?'strutR':'strutW';
  for(let k=0;k<=30;k++){const s=k/30;if(dd>0&&rng()<.55)continue;const lean=dd>0&&rng()<.3?rr(-3,3):0;
   const a=hPt(s,oBot(s),0),b=hPt(s,oTop(s),yTopF(s));b[0]+=lean;beam(MU,a,b,.5,.8);}
  for(let k=0;k<30;k++){if(dd>0&&rng()<.6)continue;const s0=k/30,s1=(k+1)/30;beam(MU,hPt(s0,lerp(oBot(s0),oTop(s0),.5),yTopF(s0)*.5),hPt(s1,lerp(oBot(s1),oTop(s1),.5),yTopF(s1)*.5),.4,.6);}
  // the mouth: a glazed end wall with a fan of mullions
  {const sm=.985;const fillPt=(a,v)=>{const q=hProf(sm,a);const y=v*q[1]*.985;const lim=lerp(oBot(sm),oTop(sm),clamp(y/yTopF(sm),0,1));return hPt(sm,Math.min(q[0],lim),y);};
   if(d===0)mesh(skGrid((u,v)=>fillPt(u,v),24,6,null,8),MAT.glass,G);
   const base=hPt(sm,-2,0);for(let k=1;k<9;k++){if(dd>0&&rng()<.5)continue;const p=fillPt(k/9,1);beam(MU,base,p,.6,.9);}}
  // ruin: fallen roof slabs on the hall floor
  if(dd>0)for(let k=0;k<3;k++){const s0=.34+k*.12;const g=skGrid((u,v)=>{const q=hProf(s0+u*.1,.2+v*.5);return hPt(s0+u*.1,q[0],q[1]);},8,10,null);
   const m=mesh(g,MAT.rust,G);const c=hAx(s0+.05);m.position.set(c[0],0,c[1]);m.rotation.set(rr(-.25,.25),0,rr(-.25,.25));dropFragment(m,PH,.3);
   rubbleRing(c[0],PH,c[1],2,16,24,2.4);}
  // night: the hall is lit behind its glass
  if(d===0)for(let k=0;k<10;k++){const s=(k+.5)/10;const a=hPt(s,oBot(s)-2.5,5),T=hTan(s);kput('skLit',a,qFacing([T[1],0,-T[0]]),[9,6,1],WARM.clone().multiplyScalar(rr(.4,.75)));}
  if(dd===0)people(-70,30,8,12,PH);
  const hc=hAx(.5);REGISTER({name:'Skyscraper K — the shell hall',x:hc[0],z:hc[1],r:40,h:60,y:0});
  SK_SITE[d].hall=hc;}

 // ============================================================ PAVILIONS AND HOUSES ON THE PODIUM
 const occ=[[98,12,16]];      // [x, z, r] claimed ground: the rib footing first
 const PAV=[[68,62,14,15],[90,46,8,10],[38,88,8,10],[84,-50,10,12],[-30,-78,7,9],[28,-58,11,13],[-60,-52,9,11]];
 for(const pv of PAV){const[x,z,r,h]=pv;occ.push([x,z,r+4]);const gone=dd>0&&rng()<.35;
  kput(dd>0?'skDrumR':'skDrum',[x,PH+h/2,z],null,[r,h,r],null);
  kput('slab',[x,PH+h,z],null,[r*1.1,1,r*1.1],new THREE.Color(dd>0?0x5a4a40:0xd8d4cc));
  kput('slab',[x,PH+h*.5,z],null,[r*1.16,.5,r*1.16],new THREE.Color(dd>0?0x5a4a40:0xd8d4cc));
  kput(dd>0?'ringR':'ringW',[x,PH+h*.5+1,z],qEuler(Math.PI/2,0,0),[r*1.15,r*1.15,6],null);
  if(!gone){kput(dd>0?'skDomeR':'skDome',[x,PH+h+.5,z],null,[r*1.02,r*.85,r*1.02],null);
   kput(dd>0?'skDrumR':'skDrum',[x,PH+h+.5+r*.85,z],null,[r*.16,r*.3,r*.16],null);kput(dd>0?'skDomeR':'skDome',[x,PH+h+.5+r*1.0,z],null,[r*.19,r*.14,r*.19],null);
   kput(dd>0?'postR':'postW',[x,PH+h+.5+r*1.14+1.2,z],null,[.25,2.4,.25],null);}
  else rubbleRing(x,PH,z,0,r*.85,Math.round(r*2),2.4);
  const nw=Math.round(r*.9);for(let t=0;t<2;t++)for(let k=0;k<nw;k++){const th=(k+.5*t)/nw*TAU;const n=[Math.cos(th),0,Math.sin(th)];
   kput(dd>0?'winSmD':'winSmI',[x+(r+.08)*n[0],PH+h*(t?.74:.28),z+(r+.08)*n[2]],qFacing(n),[1.3,1.6,1],null);
   if(dd===0&&rng()<.25)kput('skLit',[x+(r+.3)*n[0],PH+h*(t?.74:.28),z+(r+.3)*n[2]],qFacing(n),[1.3,2.2,1],WARM.clone().multiplyScalar(rr(.6,1)));}}
 {const inHall=(x,z)=>{for(let i=0;i<=20;i++){const s=i/20;const a=(1-s)*(1-s),b=2*s*(1-s),c=s*s;const hx=a*HQ[0][0]+b*HQ[1][0]+c*HQ[2][0],hz=a*HQ[0][1]+b*HQ[1][1]+c*HQ[2][1];if(Math.hypot(x-hx,z-hz)<HHW+6)return true;}return false;};
  const inSail=(x,z,m)=>x>-80-m&&x<60+m&&z>ZB-m&&z<frontZ(clamp(x,-79,57),PH)+m;
  let placed=0;for(let tries=0;tries<260&&placed<26;tries++){const th=rng()*TAU,r=rr(52,PR-9);const x=r*Math.cos(th),z=r*Math.sin(th);
   const w=rr(9,14),dp=rr(8,11),rad=Math.hypot(w,dp)/2;
   if(Math.hypot(x,z)+rad>PR-2)continue;if(inSail(x,z,rad+4)||inHall(x,z))continue;
   if(x>LX-LHW-8&&x<LX+LHW+8&&z>0&&z<95)continue;                // keep the porch approach clear
   if(x>60&&x<125&&z>-25&&z<30)continue;                          // and the ground under the hoop
   if(x<-18&&z>22)continue;                                       // and the plaza in the hall's bay
   let ok=true;for(const o of occ)if(Math.hypot(x-o[0],z-o[1])<o[2]+rad+2.5){ok=false;break;}if(!ok)continue;
   occ.push([x,z,rad]);placed++;
   const R=Math.atan2(x,z)+rr(-.25,.25),cR=Math.cos(R),sR=Math.sin(R),qR=qEuler(0,R,0),qB=qEuler(0,R+Math.PI,0);
   const L=(lx,ly,lz)=>[x+lx*cR+lz*sR,ly,z-lx*sR+lz*cR];
   let ns=2+Math.floor(rng()*3);const fallen=dd>0&&rng()<.18;if(fallen)ns=1;const sh=3.8,hb=ns*sh;
   kput(dd>0?'boxR':'boxW',L(0,PH+hb/2,0),qR,[w,hb,dp],null);
   if(fallen){rubbleRing(x,PH,z,rad*.4,rad*1.6,24,2.6);continue;}
   const roofless=dd>0&&rng()<.3;
   if(!roofless){if(rng()<.62)kput(dd>0?'skRoofR':'skRoof',L(0,PH+hb,0),qR,[w*1.08,rr(3.5,5.5),dp*1.1],dd>0?null:new THREE.Color(0xa9bccd));
    else{kput('slab',L(0,PH+hb+.3,0),null,[rad*.95,.6,rad*.95],new THREE.Color(dd>0?0x5a4a40:0xd8d4cc));kput(dd>0?'skDomeR':'skDome',L(0,PH+hb+.6,0),null,[rad*.45,rad*.4,rad*.45],null);}}
   const nwin=Math.max(1,Math.floor(w/3.4));
   for(let s=0;s<ns;s++){const yw=PH+s*sh+2.1;
    for(let k=0;k<nwin;k++){const lx=(k-(nwin-1)/2)*3.2;if(s===0&&Math.abs(lx)<1.8)continue;
     kput(dd>0?'winSmD':'winSmI',L(lx,yw,dp/2+.05),qR,[1.2,1.8,1],null);kput(dd>0?'winSmD':'winSmI',L(lx,yw,-dp/2-.05),qB,[1.2,1.8,1],null);
     if(dd===0&&rng()<.3)kput('skLit',L(lx,yw,dp/2+.3),qR,[1.1,1.7,1],WARM.clone().multiplyScalar(rr(.6,1)));}
    if(s>0&&!(dd>0&&rng()<.4)){kput(dd>0?'boxR':'boxW',L(0,PH+s*sh+.1,dp/2+.9),qR,[w*.7,.35,1.8],null);kput(dd>0?'boxR':'boxW',L(0,PH+s*sh+.8,dp/2+1.75),qR,[w*.7,1.0,.15],null);}}
   kput('boxD',L(0,PH+1.3,dp/2+.08),qR,[1.7,2.6,.3],null);}}
 if(dd===0){people(LX,52,12,14,PH);people(40,30,5,10,PH);}
 else if(d!==2){vinesOnRing(0,PH,0,PR,40,8);}
 if(dd>0)skyShards(SM,d===3?.25:.5);   // glass teeth in the dead openings (52-sky-abc.js)
 KOFF=[0,0,0];return G;}

// THE CAMPANILE, built up its local +y from its foot at 0. `from`/`to` are
// heights on that axis, so a snapped-off head is the same code as the whole
// thing. The shaft is fluted and tapers 5.5 -> 4.6; two balconies, a belfry of
// open posts at 94-112, a dome, a lantern, a needle and a PLAIN finial.
function skCampanile(Q,dx,from,to,jag){const cr=y=>5.5-.9*clamp(y/94,0,1);const BX=dx>0?'boxR':'boxW',PO=dx>0?'postR':'postW';
 const st=Math.min(to,94);
 if(st>from+1){const brk=to<94;mesh(lathe({rFn:y=>cr(y+from),H:st-from,cut:brk&&jag?st-from:null,jag:brk&&jag?4:0,flutes:8,amp:.1,sharp:2,nu:32,nv:14,
   hole:dx>0?holeFn(dx*.6,785,null,2):null,seed:5}),SHELL(dx),Q,0,from,0);
  if(brk&&jag)rubbleRing(0,st-2,0,.5,4,8,1.4);}
 if(from>0)mesh(new THREE.CircleGeometry(cr(from)*.98,24).rotateX(Math.PI/2),MAT.guts,Q,0,from+.2,0);
 for(const yb of [32,64]){if(yb<from||yb>to-2)continue;
  kput('slab',[0,yb,0],null,[7.6,.7,7.6],new THREE.Color(dx>0?0x5a4a40:0xd8d4cc));kput(dx>0?'ringR':'ringW',[0,yb+1.2,0],qEuler(Math.PI/2,0,0),[7.4,7.4,7],null);
  for(let k=0;k<8;k++){const th=k/8*TAU;beam(dx>0?'strutR':'strutW',[cr(yb)*Math.cos(th),yb-3.5,cr(yb)*Math.sin(th)],[7*Math.cos(th),yb-.3,7*Math.sin(th)],.5,.5);}}
 for(let yy=8;yy<92;yy+=9){if(yy<from+1||yy>to-2)continue;for(let k=0;k<6;k++){if(dx>0&&rng()<.3)continue;const th=(k+.5*((yy/9)&1))/6*TAU;const n=[Math.cos(th),0,Math.sin(th)];
  kput(dx>0?'skWinD':'skWin',[n[0]*(cr(yy)+.05),yy,n[2]*(cr(yy)+.05)],qFacing(n),[1,3.2,1],null);}}
 if(to>=112&&from<=94){kput('slab',[0,94,0],null,[6.2,1,6.2],new THREE.Color(dx>0?0x5a4a40:0xd8d4cc));
  for(let k=0;k<8;k++){const th=(k+.5)/8*TAU;if(dx>0&&rng()<.25)continue;kput(PO,[4.6*Math.cos(th),103.3,4.6*Math.sin(th)],null,[.8,18,.8],null);}
  kput(PO,[0,103.3,0],null,[1.8,18,1.8],null);
  kput('slab',[0,112.6,0],null,[6.4,1.2,6.4],new THREE.Color(dx>0?0x5a4a40:0xd8d4cc));}
 if(to>=147&&from<=113){kput(dx>0?'skDomeR':'skDome',[0,113.2,0],null,[5.4,4.6,5.4],null);
  kput(dx>0?'skDrumR':'skDrum',[0,120,0],null,[1.7,5,1.7],null);kput(dx>0?'skDomeR':'skDome',[0,122.5,0],null,[2,1.6,2],null);
  kput(dx>0?'skNeedleR':'skNeedle',[0,135,0],null,[1.1,22,1.1],null);
  kput('finial',[0,147.2,0],null,[1.5,2.4,1.5],null);
  if(dx===0)kput('emberB',[0,147.2,0],null,[5,5,5],null);}}
