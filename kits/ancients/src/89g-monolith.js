// ================================================================= THE MONOLITH — the slab with the arch and the oculi
// One rectangular slab, 1 100 m tall, 380 m wide at the foot tapering to 340 at
// the top, 148 m deep at the foot tapering to 120: a wall of city standing on
// the plain. Three things are taken OUT of it and they are the whole drawing —
//
//   THE ARCH     a round-headed through-arch 160 m wide and 250 m to the crown,
//                off-centre to the west, with a road through it;
//   THE OCULI    three circular through-holes: a great one 168 m across near the
//                top, a 92 m one lower and to the east, a 60 m one lower still
//                and to the west. Real holes: sky through all three;
//   THE FLANK    the west end and the lower-west corner of the south face are
//                not clad. They are the white carved city itself, stepped out in
//                four layers of blocks, windows and balconies.
//
// Everywhere else the white stone wears a skin of orange/ochre cladding panels,
// each a real box standing 1-2.5 m proud with its own seams, slits, portholes
// and recesses, which is what the references are made of.
//
// HOW THE SOLID IS MADE. The slab's elevation is ONE polygon (with the arch as a
// notch in its bottom edge) plus the oculi as circular holes. The two broad faces
// are that polygon triangulated (ShapeGeometry) and pushed to z = +/-DZ(y); every
// edge of the polygon — the two ends, the lid, the arch jambs and vault, the
// breaks of the ruin — and every hole is a ribbon swept across the depth between
// them. Because the faces taper linearly the faces are exact planes, the ribbons
// meet them exactly, and the thing is closed by construction. The ruin changes
// the POLYGON: the upper east corner is gone, the break runs into the great
// oculus and out of it again, so the ring is open to the sky on one side and the
// silhouette is a hook, not a slab.
//
// Zero-triangle windows for the bulk (a stone texture with a slit/porthole grid
// and its own emissive mask), real geometry for panels, relief, rims, galleries.
// SHADE IS PAINTED: every soffit, the upper half of each oculus bore and the arch
// vault sit on the dark material, because nothing in this scene casts a shadow.

function mnStoneTex(kind,dec){
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++){const row=Math.floor(y/64),off=(row&1)*64;
   for(let x=0;x<w;x++){const i=(y*w+x)*4;
    const bx=Math.floor((x+off)/128);
    let v=214+(fbm(x/46,y/46,6.1,3)-.5)*20+(h3(bx*1.7,row*2.3,3.9)-.5)*12;
    if(dec)v=v*.70+8-Math.max(0,fbm(x/10,y/95,8.2,2)-.45)*110;
    const jy=y%64,jx=(x+off)%128;
    if(jy<2||jx<2)v-=34;else if(jy<4)v+=6;
    let r=v+4,gg=v,b=v-9;
    if(kind===0){const ci=Math.floor(x/128),cj=Math.floor(y/128),cx=x-ci*128,cy=y-cj*128;
     const cr=h3(ci*3.1,cj*5.3,7.7);let inW=false;
     if(cr<.5)inW=Math.abs(cx-64)<13&&cy>30&&cy<94;
     else if(cr<.66){const ex=cx-64,ey=cy-64;inW=ex*ex+ey*ey<22*22;}
     else if(cr<.74)inW=Math.abs(cx-64)<34&&cy>46&&cy<82;
     if(inW){if(!dec&&h3(ci*1.9,cj*2.7,4.1)<.30){const f=.55+h3(ci,cj,9.1)*.6;r=236*f;gg=168*f;b=92*f;}
      else{const k2=dec?13:22;r=k2;gg=k2+1;b=k2+4;}}}
    D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}}
  g.putImageData(id,0,0);});}
// The emissive mask: the same cell lottery drawn on black, at half resolution.
function mnLitTex(){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,X=x*2,Y=y*2;
   const ci=Math.floor(X/128),cj=Math.floor(Y/128),cx=X-ci*128,cy=Y-cj*128;
   const cr=h3(ci*3.1,cj*5.3,7.7);let inW=false;
   if(cr<.5)inW=Math.abs(cx-64)<13&&cy>30&&cy<94;
   else if(cr<.66){const ex=cx-64,ey=cy-64;inW=ex*ex+ey*ey<22*22;}
   else if(cr<.74)inW=Math.abs(cx-64)<34&&cy>46&&cy<82;
   let a=0;if(inW&&h3(ci*1.9,cj*2.7,4.1)<.30)a=.5+h3(ci,cj,9.1)*.7;
   D[i]=250*a;D[i+1]=168*a;D[i+2]=86*a;D[i+3]=255;}
  g.putImageData(id,0,0);});}
// One cladding panel, stretched over whatever box it is put on: a dark seam and
// a bright bevel at the edge, rivets inside it. Neutral grey so the instance
// colour carries the orange.
function mnPanelTex(dec){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   let v=236+(fbm(x/30,y/30,2.2,3)-.5)*16,rs=0;
   const e=Math.min(x,y,w-1-x,h-1-y);
   if(e<3)v=110;else if(e<6)v=252;
   if(e>9&&e<13&&(((x<16||x>w-17)&&y%24<3)||((y<16||y>h-17)&&x%24<3)))v-=70;
   if(dec){v=v*.80-Math.max(0,fbm(x/7,y/60,5.5,2)-.5)*150;
    const rb=fbm(x/22,y/22,8.8,3);if(rb>.6){rs=(rb-.6)*260;}
    if(h3(x*.37,y*.53,2.9)<.012)v+=40;}
   D[i]=clamp(v-rs*.2,0,255);D[i+1]=clamp(v-2-rs*.55,0,255);D[i+2]=clamp(v-6-rs*.8,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
// A fracture: three storeys of floor plate, void and pier per 12.8 m tile.
function mnSectTex(){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;const ST=h/3;
  for(let y=0;y<h;y++){const sy=y%ST,si=Math.floor(y/ST);
   for(let x=0;x<w;x++){const i=(y*w+x)*4,n=(fbm(x/14,y/14,3.7,2)-.5)*26;
    let v;
    if(sy<15)v=196+n;
    else if(sy<18)v=120;
    else if((x+si*23)%64<8)v=172+n;
    else if(h3(Math.floor((x+si*23)/64),si,6.6)<.25)v=64+n;
    else v=22+n*.4;
    D[i]=clamp(v+3,0,255);D[i+1]=clamp(v,0,255);D[i+2]=clamp(v-6,0,255);D[i+3]=255;}}
  g.putImageData(id,0,0);});}
// Greeble boxes: near-white grain with a dark rim on every face, so a field of
// small boxes reads as separate blocks instead of one lumpy surface.
function mnKitTex(){
 return canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   let v=238+(fbm(x/12,y/12,1.9,2)-.5)*18;const e=Math.min(x,y,w-1-x,h-1-y);
   if(e<2)v=150;else if(e<4)v=252;
   D[i]=clamp(v+2,0,255);D[i+1]=clamp(v,0,255);D[i+2]=clamp(v-5,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
// A flat arched window: a rectangle and a five-step half-circle, 8 triangles.
// arcWindowGeo is an extrusion with a 12-step curve and would cost ~60 a window.
function mnArchGeo(){const s=new THREE.Shape();s.moveTo(-.5,-.8);s.lineTo(.5,-.8);s.lineTo(.5,.3);
 for(let i=1;i<5;i++){const a=Math.PI*i/5;s.lineTo(.5*Math.cos(a),.3+.5*Math.sin(a));}
 s.lineTo(-.5,.3);s.lineTo(-.5,-.8);return new THREE.ShapeGeometry(s);}
TEX.mnCity=mnStoneTex(0,0);TEX.mnCityR=mnStoneTex(0,1);TEX.mnCityE=mnLitTex();
TEX.mnAsh=mnStoneTex(1,0);TEX.mnAshR=mnStoneTex(1,1);
TEX.mnPanel=mnPanelTex(0);TEX.mnPanelR=mnPanelTex(1);TEX.mnSect=mnSectTex();TEX.mnKit=mnKitTex();
MAT.mnCity =new THREE.MeshStandardMaterial({map:TEX.mnCity,roughnessMap:TEX.concreteRM,color:0xf4ede2,emissive:0xffffff,emissiveMap:TEX.mnCityE,emissiveIntensity:1,roughness:1,metalness:0,side:DS});
MAT.mnCityR=new THREE.MeshStandardMaterial({map:TEX.mnCityR,roughnessMap:TEX.concreteRM,color:0xb8ae9f,roughness:1,metalness:0,side:DS});
MAT.mnAsh  =new THREE.MeshStandardMaterial({map:TEX.mnAsh,roughnessMap:TEX.concreteRM,color:0xeee6da,roughness:1,metalness:0,side:DS});
MAT.mnAshR =new THREE.MeshStandardMaterial({map:TEX.mnAshR,roughnessMap:TEX.concreteRM,color:0xaea595,roughness:1,metalness:0,side:DS});
MAT.mnShade=new THREE.MeshStandardMaterial({map:TEX.mnAsh,roughnessMap:TEX.concreteRM,color:0x5a5147,roughness:1,metalness:0,side:DS});
MAT.mnShadeR=new THREE.MeshStandardMaterial({map:TEX.mnAshR,roughnessMap:TEX.concreteRM,color:0x3b342d,roughness:1,metalness:0,side:DS});
MAT.mnSect =new THREE.MeshStandardMaterial({map:TEX.mnSect,roughnessMap:TEX.concreteRM,color:0xd6cec2,roughness:1,metalness:0,side:DS});
MAT.mnVoid =new THREE.MeshStandardMaterial({color:0x0a0a0b,roughness:1,metalness:0,side:DS});
MAT.mnKit  =new THREE.MeshStandardMaterial({map:TEX.mnKit,roughnessMap:TEX.concreteRM,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.mnPanel=new THREE.MeshStandardMaterial({map:TEX.mnPanel,color:0xffffff,roughness:.72,metalness:.12});
MAT.mnPanelR=new THREE.MeshStandardMaterial({map:TEX.mnPanelR,color:0xffffff,roughness:.95,metalness:.05});
MAT.mnPave =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xb09c84,roughness:1,metalness:0,side:DS});
MAT.mnPaveR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x7a6b58,roughness:1,metalness:0,side:DS});
// Every instanced piece is modelled in the frame qFacing(normal) hands back: +z
// out of the wall, so a scale is [along, up, proud] in metres.
kdef('mnPanel',new THREE.BoxGeometry(1,1,1),MAT.mnPanel);
kdef('mnPanelR',new THREE.BoxGeometry(1,1,1),MAT.mnPanelR);
kdef('mnBox',new THREE.BoxGeometry(1,1,1),MAT.mnKit);
kdef('mnDim',new THREE.BoxGeometry(1,1,1),MAT.mnVoid);
kdef('mnPort',new THREE.CylinderGeometry(1,1,1,10,1,true).rotateX(Math.PI/2),MAT.mnKit);
kdef('mnHole',new THREE.CircleGeometry(1,10),MAT.mnVoid);
kdef('mnArchW',mnArchGeo(),MAT.mnVoid);
kdef('mnLit',new THREE.PlaneGeometry(1,1),MAT.dot);
// Presets are DERIVED from this: targets/monolith/91z-views.js runs after
// 90-scene.js, so both builders have left their dimensions here.
const MN_SITE={};

function buildMonolith(scene,gx,gz,d){reseed(9720+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;

 // ---- the numbers ------------------------------------------------------------
 const H=1100,HWB=190,HWT=170,DZB=74,DZT=60,T=25.6;
 const HW=y=>HWB+(HWT-HWB)*y/H;               // half width, linear taper
 const DZ=y=>DZB+(DZT-DZB)*y/H;               // half depth, linear: the faces are planes
 const AX=-40,AW=88,AS=200,AT=AS+AW;          // the arch: centre, half span, springing, crown
 const OC=[{x:-5,y:905,r:84,n:96},{x:72,y:640,r:46,n:64},{x:-88,y:470,r:30,n:48}];
 const O1=OC[0],O2=OC[1],O3=OC[2];
 const YC=1070,CST=22;                        // the stepped crown
 const PLY=140;                               // top of the plinth
 const PL=[{y0:0,y1:36,ex:36,ez:34,g:22},{y0:36,y1:84,ex:22,ez:20,g:14},{y0:84,y1:PLY,ex:10,ez:9,g:6}];
 const BZ=38,BUTY=360;                        // the raking buttresses on both ends
 // the ruin
 const EBY=735;                               // the east side now stops here
 const A1=-38*Math.PI/180,A2=-290*Math.PI/180; // the arc of the great oculus that survives
 const YW=1046;                               // the west corner, chipped
 const TOPX=-24;                              // where the upper break meets the top

 // ---- materials and merge lists ----------------------------------------------
 const cityM=dd?MAT.mnCityR:MAT.mnCity,ashM=dd?MAT.mnAshR:MAT.mnAsh;
 const shdM=dd?MAT.mnShadeR:MAT.mnShade,pavM=dd?MAT.mnPaveR:MAT.mnPave;
 const CITY=[],ASH=[],SHD=[],SEC=[],GRD=[];
 const PAN=dd?'mnPanelR':'mnPanel';

 // ---- palette and small helpers -----------------------------------------------
 const WARMW=new THREE.Color(0xffb265);
 const orange=()=>{if(dd){return rng()<.12?new THREE.Color().setHSL(rr(.06,.09),rr(.16,.3),rr(.22,.32))
    :new THREE.Color().setHSL(rr(.035,.068),rr(.45,.64),rr(.30,.43));}
  return rng()<.07?new THREE.Color().setHSL(rr(.07,.09),rr(.55,.7),rr(.40,.47))
   :new THREE.Color().setHSL(rr(.046,.064),rr(.74,.88),rr(.39,.47));};
 const stone=()=>new THREE.Color().setHSL(rr(.07,.11),rr(.05,.15),dd?rr(.50,.63):rr(.76,.88));
 const stoneD=()=>new THREE.Color().setHSL(rr(.07,.10),rr(.05,.12),dd?rr(.34,.44):rr(.56,.67));
 const shadeC=()=>new THREE.Color().setHSL(rr(.06,.09),rr(.05,.12),dd?rr(.13,.19):rr(.22,.30));
 const litC=()=>WARMW.clone().multiplyScalar(rr(.55,1));
 const leafC=()=>new THREE.Color().setHSL(rr(.18,.32),rr(.18,.42),dd?rr(.14,.26):rr(.22,.36));
 const mossC=()=>new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12));
 const person=(x,y,z)=>{kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));};
 const plant=(x,y,z,h)=>{kput('trunk',[x,y,z],qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),
   [h*.16,h*.74,h*.16],new THREE.Color().setHSL(rr(.05,.10),rr(.2,.4),rr(.14,.28)));
  const s0=h*rr(.26,.38);
  kput('leafCard',[x+rr(-.08,.08)*h,y+h*.72,z+rr(-.08,.08)*h],
   qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),[s0,s0*rr(.7,1.05),s0],leafC());};
 const QB=(xx,yy,zz)=>new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx,yy,zz));
 // a frame on a circle in an elevation: +x along the tangent, +y out along the
 // radius, +z along the slab normal sd — used for every rim, rib and voussoir
 const qRim=(th,sd)=>{const yy=new THREE.Vector3(Math.cos(th),Math.sin(th),0),zz=new THREE.Vector3(0,0,sd);
  return QB(new THREE.Vector3().crossVectors(yy,zz),yy,zz);};

 // ---- geometry helpers ----------------------------------------------------------
 // a hexahedron from 8 corners (bottom 0-3, top 4-7), flat-shaded, UVs projected
 // on each face's dominant plane in world metres
 const hexa=(c,list)=>{const pos=[],uv=[];
  for(const f of [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]]){const p=f.map(i=>c[i]);
   const e1=[p[1][0]-p[0][0],p[1][1]-p[0][1],p[1][2]-p[0][2]],e2=[p[3][0]-p[0][0],p[3][1]-p[0][1],p[3][2]-p[0][2]];
   const nx=Math.abs(e1[1]*e2[2]-e1[2]*e2[1]),ny=Math.abs(e1[2]*e2[0]-e1[0]*e2[2]),nz=Math.abs(e1[0]*e2[1]-e1[1]*e2[0]);
   for(const k of [0,1,2,0,2,3]){const q=p[k];pos.push(q[0],q[1],q[2]);
    if(ny>=nx&&ny>=nz)uv.push(q[0]/T,q[2]/T);else if(nx>=nz)uv.push(q[2]/T,q[1]/T);else uv.push(q[0]/T,q[1]/T);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();list.push(g);};
 const boxG=(x0,x1,y0,y1,z0,z1,list)=>hexa([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],
  [x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],list);
 const rotBox=(C,S,Q,list)=>{const c=[];
  for(const [sx,sy,sz] of [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]){
   const v=new THREE.Vector3(sx*S[0]/2,sy*S[1]/2,sz*S[2]/2).applyQuaternion(Q);c.push([C[0]+v.x,C[1]+v.y,C[2]+v.z]);}
  hexa(c,list);return c;};
 // a straight edge of the elevation swept across the depth
 const segRib=(a,b,list)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.01)return;
  const vert=Math.abs(b[1]-a[1])>=Math.abs(b[0]-a[0]),ym=(a[1]+b[1])/2,n=Math.max(1,Math.round(L/200));
  list.push(vert
   ?gridSurface((u,v)=>{const x=lerp(a[0],b[0],v),y=lerp(a[1],b[1],v);return[x,y,lerp(-1,1,u)*DZ(y)];},1,n,{uS:2*DZ(ym)/T,vS:L/T})
   :gridSurface((u,v)=>{const x=lerp(a[0],b[0],u),y=lerp(a[1],b[1],u);return[x,y,lerp(-1,1,v)*DZ(y)];},n,1,{uS:L/T,vS:2*DZ(ym)/T}));};
 // a curved edge (vault, oculus) swept across the depth, smooth-shaded
 const arcRib=(pts,list)=>{const n=pts.length-1;if(n<1)return;let L=0;
  for(let i=0;i<n;i++)L+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);
  list.push(gridSurface((u,v)=>{const f=u*n,i=Math.min(n-1,Math.floor(f)),t=f-i;
    const x=lerp(pts[i][0],pts[i+1][0],t),y=lerp(pts[i][1],pts[i+1][1],t);return[x,y,lerp(-1,1,v)*DZ(y)];},
   n,3,{uS:L/T,vS:2*DZ(pts[0][1])/T}));};
 const circPts=(o,a0,a1,n)=>{const p=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);p.push([o.x+o.r*Math.cos(a),o.y+o.r*Math.sin(a)]);}return p;};
 // an oculus bore: the upper part (it faces DOWN) is painted shade
 const ocRib=(o,a0,a1,n)=>{const pts=circPts(o,a0,a1,n);let run=[pts[0]],cur=null;
  for(let i=0;i<n;i++){const am=lerp(a0,a1,(i+.5)/n),L=Math.sin(am)>.2?SHD:CITY;
   if(cur&&L!==cur){arcRib(run,cur);run=[pts[i]];}cur=L;run.push(pts[i+1]);}
  arcRib(run,cur);};
 // a stepped fracture from A to B: alternating vertical and horizontal runs of
 // random length, which reads as masonry and floor plates letting go
 const stair=(A,B,n,vFirst)=>{const wx=[],wy=[];let sx=0,sy=0;
  for(let i=0;i<n;i++){wx.push(rr(.35,1.65));wy.push(rr(.35,1.65));sx+=wx[i];sy+=wy[i];}
  const out=[];let x=A[0],y=A[1];const DXs=B[0]-A[0],DYs=B[1]-A[1];
  for(let i=0;i<n;i++){
   if(vFirst){y+=DYs*wy[i]/sy;out.push([x,y]);x+=DXs*wx[i]/sx;out.push([x,y]);}
   else{x+=DXs*wx[i]/sx;out.push([x,y]);y+=DYs*wy[i]/sy;out.push([x,y]);}}
  out[out.length-1]=[B[0],B[1]];return out;};

 // ============================================================ THE ELEVATION
 // One polygon, anticlockwise, each point tagged with the kind of edge that
 // leaves it. The arch is a notch in the bottom edge.
 const OUT=[];const P=(p,tag)=>OUT.push({p:p,tag:tag});
 const ARCN=40,arcPts=[];
 for(let i=0;i<=ARCN;i++){const th=Math.PI*(1-i/ARCN);arcPts.push([AX+AW*Math.cos(th),AS+AW*Math.sin(th)]);}
 P([-HW(0),0],'bot');P([AX-AW,0],'jamb');
 for(let i=0;i<ARCN;i++)P(arcPts[i],'vault');
 P(arcPts[ARCN],'jamb');P([AX+AW,0],'bot');P([HW(0),0],'side');
 let O1ARC=null,BRK=[];
 if(!dd){
  P([HW(YC),YC],'top');P([HW(YC)-CST,YC],'side');P([HW(YC)-CST,H],'top');
  P([-(HW(YC)-CST),H],'side');P([-(HW(YC)-CST),YC],'top');P([-HW(YC),YC],'side');
 }else{
  // the lower break: up and west from the east side into the great oculus
  const E=[HW(EBY),EBY],L1=[O1.x+O1.r*Math.cos(A1),O1.y+O1.r*Math.sin(A1)];
  P(E,'brk');
  const s1=stair(E,L1,6,false);
  for(let i=0;i<s1.length-1;i++)P(s1[i],'brk');
  // round the surviving arc of the ring: under it, up its west side, over it
  const na=Math.round(O1.n*Math.abs(A2-A1)/TAU);
  O1ARC=circPts(O1,A1,A2,na);
  for(let i=0;i<na;i++)P(O1ARC[i],'oc');
  // the upper break: up and west from the top of the ring to the broken top
  const U1=O1ARC[na],T0=[TOPX,1084];
  P(U1,'brk');
  const s2=stair(U1,T0,4,true);
  for(let i=0;i<s2.length;i++)P(s2[i],'brk');
  // the broken top, stepping down to the chipped west corner
  let x=TOPX;
  while(true){x-=rr(12,30);if(x<-HW(YW)+14)break;
   const y=lerp(1084,YW+6,(TOPX-x)/(TOPX+HW(YW)))+rr(-10,12);
   P([x,y+rr(-5,5)],'brk');P([x-rr(3,8),y],'brk');x-=8;}
  P([-HW(YW)+6,YW],'brk');P([-HW(YW),YW-9],'side');
 }
 const POLY=OUT.map(o=>o.p);
 const HOLES=dd?[O2,O3]:[O1,O2,O3];
 const pip=(x,y)=>{let c=false;for(let i=0,j=POLY.length-1;i<POLY.length;j=i++){const a=POLY[i],b=POLY[j];
   if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;};
 const solid=(x,y)=>pip(x,y)&&!HOLES.some(o=>Math.hypot(x-o.x,y-o.y)<o.r);
 const archNear=(x0,x1,y0,y1,m)=>{if(x1>AX-AW-m&&x0<AX+AW+m&&y0<AS)return true;
  const cx=clamp(AX,x0,x1),cy=clamp(AS,y0,y1);return Math.hypot(cx-AX,cy-AS)<AW+m;};
 const ocNear=(x0,x1,y0,y1,m)=>OC.some(o=>{const cx=clamp(o.x,x0,x1),cy=clamp(o.y,y0,y1);return Math.hypot(cx-o.x,cy-o.y)<o.r+m;});

 // ---- the two broad faces ------------------------------------------------------
 {const sh=new THREE.Shape(POLY.map(p=>new THREE.Vector2(p[0],p[1])));
  for(const o of HOLES)sh.holes.push(new THREE.Path(circPts(o,0,TAU,o.n).slice(0,o.n).map(p=>new THREE.Vector2(p[0],p[1]))));
  for(const sd of [1,-1]){const g=new THREE.ShapeGeometry(sh),pa=g.attributes.position,ua=g.attributes.uv;
   for(let i=0;i<pa.count;i++){const y=pa.getY(i);pa.setZ(i,sd*DZ(y));ua.setXY(i,pa.getX(i)/T,y/T);}
   g.computeVertexNormals();CITY.push(g);}}
 // ---- every edge, swept through the depth ----------------------------------------
 for(let i=0;i<OUT.length;i++){const a=OUT[i].p,b=OUT[(i+1)%OUT.length].p,tg=OUT[i].tag;
  if(tg==='side'||tg==='jamb')segRib(a,b,CITY);
  else if(tg==='top')segRib(a,b,ASH);
  else if(tg==='brk')segRib(a,b,SEC);}
 arcRib(arcPts,SHD);
 for(const o of HOLES)ocRib(o,0,TAU,o.n);
 if(dd)ocRib(O1,A1,A2,O1ARC.length-1);
 // the break's own edges, for the fracture dressing below
 if(dd)for(let i=0;i<OUT.length;i++)if(OUT[i].tag==='brk')BRK.push([OUT[i].p,OUT[(i+1)%OUT.length].p]);

 // ============================================================ THE SKIN AND THE CARVED CITY
 // Four faces, each a frame: a = the horizontal coordinate in the face, pt(a,y,o)
 // the point o metres proud of it.
 const FACES=[
  {k:0,q:qFacing([0,0,1]),pt:(a,y,o)=>[a,y,DZ(y)+o],lo:y=>-HW(y),hi:y=>HW(y)},
  {k:1,q:qFacing([0,0,-1]),pt:(a,y,o)=>[a,y,-DZ(y)-o],lo:y=>-HW(y),hi:y=>HW(y)},
  {k:2,q:qFacing([-1,0,0]),pt:(a,y,o)=>[-HW(y)-o,y,a],lo:y=>-DZ(y),hi:y=>DZ(y)},
  {k:3,q:qFacing([1,0,0]),pt:(a,y,o)=>[HW(y)+o,y,a],lo:y=>-DZ(y),hi:y=>DZ(y)}];
 const endTop=[0,0,dd?YW-10:YC,dd?EBY:YC];
 const onFace=(F,a,y)=>{if(y<PLY)return false;
  if(F.k<2)return solid(a,y);
  if(y>endTop[F.k]||Math.abs(a)>DZ(y))return false;
  if(y<BUTY+8&&(Math.abs(a-BZ)<15||Math.abs(a+BZ)<15))return false;
  return true;};
 const rectOK=(F,a0,a1,y0,y1,m,mh)=>{
  if(F.k<2&&(archNear(a0,a1,y0,y1,mh+(y0<AT+30?8:0))||ocNear(a0,a1,y0,y1,mh)))return false;
  for(const fa of [0,.5,1])for(const fy of [0,.5,1])if(!onFace(F,lerp(a0-m,a1+m,fa),lerp(y0-m,y1+m,fy)))return false;
  return true;};
 // WHERE THE SKIN IS. Intact: everywhere but the west end and a sweep of the
 // south face's lower-west corner round the arch. Ruined: that sweep has become
 // most of the south face, and the rest of the skin is patchy.
 const cI=y=>{const f=Math.min(1,y/620);return -HW(y)+(HW(y)+95)*(.5+.5*Math.cos(Math.PI*f))+14*Math.sin(y/55);};
 const cR=y=>lerp(150,-HW(y)-10,Math.pow(Math.min(1,y/1010),1.25))+46*Math.sin(y/140+.6);
 const skin=(F,a,y)=>{
  if(F.k===2)return false;
  if(!dd)return F.k!==0||a>cI(y);
  const n=fbm(a*.011+F.k*5.3,y*.009,4.4,3);
  if(F.k===0)return a>cR(y)&&n>.30;
  if(F.k===1)return n>.40&&y<1000-(a+170)*.4;
  return n>.42;};
 // the edge of the tear, where panels hang off their fixings
 const peel=(F,a,y)=>{if(!dd)return false;const n=fbm(a*.011+F.k*5.3,y*.009,4.4,3);
  if(F.k===0&&Math.abs(a-cR(y))<22)return true;return n<(F.k===0?.37:.47);};

 let NPAN=0;
 const panel=(F,a0,a1,y0,y1,dep)=>{const ac=(a0+a1)/2,yc=(y0+y1)/2;
  if(!skin(F,ac,yc))return;
  if(!rectOK(F,a0,a1,y0,y1,.4,1)){
   if(dep<3&&a1-a0>3){panel(F,a0,ac,y0,yc,dep+1);panel(F,ac,a1,y0,yc,dep+1);
    panel(F,a0,ac,yc,y1,dep+1);panel(F,ac,a1,yc,y1,dep+1);}
   return;}
  NPAN++;
  const t=rr(1.1,2.5),w=a1-a0-.35,h=y1-y0-.35;
  let q=F.q,off=t/2,yy=yc;
  if(peel(F,ac,yc)){q=F.q.clone().multiply(qEuler(rr(-.4,.3),rr(-.15,.15),rr(-.45,.45)));off+=rr(.6,3.2);yy-=rr(0,2.5);}
  kput(PAN,F.pt(ac,yy,off),q,[w,h,t],orange());
  if(q!==F.q)return;
  const r=rng(),o2=t+.12;
  if(r<.21){const ns=1+Math.floor(rng()*3),sw=rr(.8,1.3),sh=Math.min(h*.6,rr(2.4,4.2));
   for(let s=0;s<ns;s++){const sa=ac+(s-(ns-1)/2)*sw*2.6;if(Math.abs(sa-ac)>w/2-1)continue;
    const lt=!dd&&rng()<.16;
    if(lt)kput('mnLit',F.pt(sa,yc,o2+.02),F.q,[sw,sh,1],litC());
    else kput('mnDim',F.pt(sa,yc,o2),F.q,[sw,sh,.35],null);}}
  else if(r<.30){const pr=Math.min(w,h)*rr(.14,.26);
   kput('mnPort',F.pt(ac,yc,t+.35),F.q,[pr,pr,.9],stoneD());
   kput('mnHole',F.pt(ac,yc,t+.45),F.q,[pr*.84,pr*.84,1],null);}
  else if(r<.36){const lt=!dd&&rng()<.35;
   kput(lt?'mnLit':'mnDim',F.pt(ac+rr(-.2,.2)*w,yc,o2),F.q,[w*rr(.3,.6),h*rr(.25,.5),lt?1:.4],lt?litC():null);}
  else if(r<.40){for(let s=0;s<3;s++)kput('mnDim',F.pt(ac,yc+(s-1)*h*.14,o2),F.q,[w*.5,h*.06,.3],null);}};
 for(const F of FACES){let y=PLY;
  while(y<H-.5){const hb=[6.4,9.6,9.6,12.8][Math.floor(rng()*4)],y1=Math.min(H,y+hb);
   const lo=F.lo(y1),hi=F.hi(y1);let a=lo+.4;
   while(a<hi-2.4){const w=[6.4,9.6,12.8,12.8,19.2][Math.floor(rng()*5)],a1=Math.min(hi-.4,a+w);
    if(rng()<.18&&y1-y>7){const ym=(y+y1)/2;panel(F,a,a1,y,ym,0);panel(F,a,a1,ym,y1,0);}
    else panel(F,a,a1,y,y1,0);
    a=a1;}
   y=y1;}}

 // ---- the carved city, wherever there is no skin ---------------------------------
 // A 9.6 x 8 m cell lattice. Each cell is a block standing 2-11 m proud; how far
 // is quantised into four layers by a slow noise field, so the blocks gather into
 // stepped terraces tens of metres across rather than a uniform stipple. Windows,
 // slits, portholes and balconies on the block fronts.
 let NREL=0;
 const relief=(F,a0,a1,y0,y1)=>{const ac=(a0+a1)/2;
  const Ly=Math.floor(clamp(fbm(ac*.010+F.k*7.3,y0*.008,2.7,2)*2.2-.45,0,.999)*4);
  const Pd=2.2+Ly*2.6+rr(0,.8);
  if(dd&&rng()<.07){kput('mnDim',F.pt(ac,(y0+y1)/2,.4),F.q,[a1-a0-.6,y1-y0-.6,.8],null);return;}
  NREL++;
  const w=(a1-a0)*rr(.82,1.02),h=(y1-y0)*rr(.72,1),yc=y0+h/2;
  kput('mnBox',F.pt(ac,yc,Pd/2),F.q,[w,h,Pd],stone());
  const r=rng(),fo=Pd+.06;
  if(r<.46){const ww=rr(1.3,2.4),wh=Math.min(h*.7,rr(2.6,4)),nw=w>7.5&&rng()<.5?2:1;
   for(let k=0;k<nw;k++){const wa=ac+(nw>1?(k-.5)*w*.45:0);
    if(!dd&&rng()<.2)kput('mnLit',F.pt(wa,y0+h*.45,fo),F.q,[ww,wh,1],litC());
    else kput('mnArchW',F.pt(wa,y0+h*.45,fo),F.q,[ww,wh/1.6,1],null);}}
  else if(r<.60){for(let k=0;k<2;k++)kput('mnDim',F.pt(ac+(k-.5)*2.2,y0+h*.5,fo),F.q,[.9,h*.55,.3],null);}
  else if(r<.70){const pr=Math.min(w,h)*rr(.18,.3);
   kput('mnPort',F.pt(ac,yc,fo+.3),F.q,[pr,pr,.8],stoneD());
   kput('mnHole',F.pt(ac,yc,fo+.4),F.q,[pr*.8,pr*.8,1],null);}
  else if(r<.82){kput('mnBox',F.pt(ac,y0+.4,(Pd+2.6)/2),F.q,[w+1.2,.8,Pd+2.6],stoneD());
   kput('mnBox',F.pt(ac,y0+1.3,Pd+2.3),F.q,[w+1.2,1.2,.3],stone());
   if(!dd&&rng()<.25)person(...F.pt(ac+rr(-2,2),y0+.8,Pd+1.2));
   kput('mnArchW',F.pt(ac,y0+3.2,fo),F.q,[2.2,3.6/1.6,1],null);}
  if(rng()<.05)kput('mnBox',F.pt(ac+rr(-2,2),y1+h*.2,(Pd+3)/2),F.q,[rr(1.6,3),h*rr(1.4,2.6),Pd+3],stone());
  if(dd&&rng()<.06)kput('moss',F.pt(ac,y0+h+.3,Pd*.5),qEuler(0,rng()*TAU,0),[w*.4,.8,Pd*.35],mossC());
  if(dd&&rng()<.03)kput('vine',F.pt(ac,y0+h,Pd+.3),qEuler(rr(-.1,.1),0,rr(-.1,.1)),[1.2,rr(8,30),1.2],null);};
 for(const F of FACES){
  for(let y=PLY;y<H;y+=6.4){const y1=y+6.4,lo=F.lo(y1),hi=F.hi(y1);
   for(let a=lo+.2;a+8<hi;a+=8){const ac=a+4;
    if(skin(F,ac,y+3.2))continue;
    if(!rectOK(F,a,a+8,y,y1,0,F.k<2?(y<AT+40?24:14):0))continue;
    relief(F,a,a+8,y,y1);}}}

 // ============================================================ THE ARCH
 // The archivolt: two rings of voussoirs round the head on both faces, carried
 // down the jambs as quoins to the plinth, and a keystone.
 for(const sd of [1,-1]){const RN=36;
  for(let i=0;i<RN;i++){const th=Math.PI*(i+.5)/RN;
   if(dd&&rng()<.14)continue;
   const p1=[AX+(AW+9)*Math.cos(th),AS+(AW+9)*Math.sin(th)],p2=[AX+(AW+21)*Math.cos(th),AS+(AW+21)*Math.sin(th)];
   kput('mnBox',[p1[0],p1[1],sd*(DZ(p1[1])+3.5)],qRim(th,sd),[Math.PI*(AW+9)/RN*.94,16,7],stone());
   kput('mnBox',[p2[0],p2[1],sd*(DZ(p2[1])+2)],qRim(th,sd),[Math.PI*(AW+21)/RN*.94,8.4,4],stoneD());
   if(i%3===1)kput('mnPort',[p2[0],p2[1],sd*(DZ(p2[1])+4.2)],qFacing([0,0,sd]),[2.2,2.2,.8],stone());}
  for(const sx of [-1,1])for(let y=PLY;y<AS;y+=9){
   if(dd&&rng()<.12)continue;
   kput('mnBox',[AX+sx*(AW+9),y+4.5,sd*(DZ(y)+3.5)],null,[16,8.4,7],stone());
   kput('mnBox',[AX+sx*(AW+21),y+4.5,sd*(DZ(y)+2)],null,[8.4,8.4,4],stoneD());}
  kput('mnBox',[AX,AT+11,sd*(DZ(AT)+5)],null,[15,24,10],stone());
  if(!dd)kput('strip',[AX,AT+1.5,sd*(DZ(AT)+7.2)],null,[12,10,10],WARMW);}

 // ---- the city lining the jambs ---------------------------------------------------
 // Ten galleries a side, a stair zig-zagging between them, and doors at the foot.
 for(const sx of [-1,1]){const xj=AX+sx*AW,nx=-sx,q=qFacing([nx,0,0]);
  for(let z=-DZ(0)+12;z<DZ(0)-8;z+=20){
   if(!dd&&rng()<.4)kput('mnLit',[xj+nx*.25,5,z],q,[5.2,8.5,1],litC());
   else kput('mnArchW',[xj+nx*.25,5.2,z],q,[6,9/1.6,1],null);}
  for(let k=0;k<12;k++){const y=20+k*15,Lz=2*DZ(y)-8;
   const broke=dd&&rng()<.35;
   if(!broke){kput('mnBox',[xj+nx*2.6,y,0],null,[5.2,1.2,Lz],stoneD());
    kput('mnBox',[xj+nx*5,y+1.2,0],null,[.4,1.3,Lz],stone());
    if(!dd)kput('strip',[xj+nx*4.7,y-.8,0],qEuler(0,Math.PI/2,0),[Lz-4,5,5],WARMW);
    for(let n2=0;n2<(dd?1:5);n2++)person(xj+nx*rr(1,4),y+.6,rr(-Lz/2+3,Lz/2-3));}
   else kput('mnBox',[xj+nx*1.4,y-rr(2,8),rr(-20,20)],qEuler(rr(-.4,.4),rr(-.3,.3),rr(-.6,.6)),[2.6,1.2,rr(10,30)],stoneD());
   kput('mnDim',[xj+nx*.15,y+3.2,0],null,[.4,3.6,Lz-6],null);
   for(let z=-Lz/2+6;z<Lz/2-5;z+=9){
    if(!dd&&rng()<.45)kput('mnLit',[xj+nx*.4,y+3.2,z],q,[3.2,3,1],litC());}
   // the stair up to the next gallery, flights alternating in direction
   if(k<11&&!(dd&&rng()<.4)){const zs=(k%2?1:-1)*(DZ(y)-24);
    beam('mnBox',[xj+nx*7.2,y,zs],[xj+nx*7.2,y+15,zs-(k%2?1:-1)*30],1.1,3.2,stoneD());
    kput('mnBox',[xj+nx*6,y+15,zs-(k%2?1:-1)*30],null,[4,1,4],stoneD());}}}
 // ---- the vault: ribs and coffers -------------------------------------------------
 {const VZ=DZ(AS),NT=28,NL=14;let zi=0;
  for(let z=-VZ+2;z<=VZ-1.9;z+=12.4,zi++)for(let i=0;i<NT;i++){const th=Math.PI*(i+.5)/NT;
   if(dd&&rng()<.33){if(rng()<.3)beam('mnBox',[AX+(AW-3)*Math.cos(th),AS+(AW-3)*Math.sin(th),z],
     [AX+(AW-9)*Math.cos(th)+rr(-3,3),AS+(AW-18)*Math.sin(th),z+rr(-3,3)],2.4,2.4,shadeC());continue;}
   kput('mnBox',[AX+(AW-1.6)*Math.cos(th),AS+(AW-1.6)*Math.sin(th),z],qRim(th,1),[Math.PI*AW/NT*1.02,3.2,2.2],shadeC());
   if(zi%2===0&&i%2===0){const tb=Math.PI*(i+1)/NT;
    kput('mnBox',[AX+(AW-1.4)*Math.cos(tb),AS+(AW-1.4)*Math.sin(tb),z+6.2],qRim(tb,1),[2.6,1.4,2.6],stoneD());}}
  for(let i=0;i<=NL;i++){const th=Math.PI*i/NL;if(dd&&rng()<.3)continue;
   kput('mnBox',[AX+(AW-1.4)*Math.cos(th),AS+(AW-1.4)*Math.sin(th),0],qRim(th,1),[2.2,2.8,2*VZ-2],shadeC());}
  if(!dd){kput('strip',[AX,AT-3.4,0],qEuler(0,Math.PI/2,0),[2*VZ-6,9,9],WARMW);
   for(let j=0;j<6;j++){const z=lerp(-VZ+14,VZ-14,j/5);
    beam('tube',[AX,AT-3,z],[AX,AT-46,z],.25,.25,null);
    kput('strip',[AX,AT-48,z],null,[3,16,16],WARMW);}}}
 // ---- the road through it, and what is on it -------------------------------------
 {const RL=dd?560:900;
  GRD.push(gridSurface((u,v)=>[AX+lerp(-26,26,u),.45,lerp(-RL,RL,v)],2,30,{uS:52/T,vS:2*RL/T,
   hole:dd?(u,v)=>fbm(u*2,v*30,1.7,2)<.36:null}));
  for(const sx of [-1,1])for(let z=-RL+6;z<RL;z+=12){if(dd&&rng()<.5)continue;
   kput('mnBox',[AX+sx*27,.9,z],null,[2.2,1.1,11.4],stoneD());}
  if(!dd){for(let j=0;j<90;j++)person(AX+rr(-24,24),.5,rr(-RL*.8,RL*.8));
   for(let j=0;j<14;j++){const z=rr(-400,400);kput('mnBox',[AX+rr(-18,18),1.4,z],qEuler(0,rr(-.1,.1),0),[3,2.2,rr(5,8)],orange());}
   for(const sx of [-1,1])for(let z=DZ(0)+PL[0].ez+20;z<RL-20;z+=24)for(const sz of [-1,1])plant(AX+sx*36,.4,sz*z,rr(8,13));}
  else{for(let j=0;j<7;j++)person(AX+rr(-20,20),.5,rr(-300,300));}}

 // ============================================================ THE OCULI
 // A rim on both faces (voussoirs and a lip), and in the bore: transverse ribs,
 // longitudinal ribs, a ring gallery near each face, and at mid-depth a rosette
 // of radial fins round an open centre — ref 3's wheel, kept a through-hole.
 const O1N=A1+TAU; // the ruin keeps th in (70deg .. 322deg)
 const inArc=(o,th)=>{if(!dd||o!==O1)return true;const t=((th%TAU)+TAU)%TAU;return t>70*Math.PI/180&&t<O1N;};
 const rimSkip=(o,th,px,py)=>{if(!dd)return false;
  if(o===O1)return !pip(px,py)||rng()<.14;
  if(o===O2){const t=((th%TAU)+TAU)%TAU;return t<1.2||t>TAU-1.2||rng()<.1;}
  return rng()<.08;};
 for(const o of OC){
  for(const sd of [1,-1]){const n=Math.max(18,Math.round(TAU*(o.r+8)/7));
   for(let i=0;i<n;i++){const th=(i+.5)/n*TAU;
    const px=o.x+(o.r+8)*Math.cos(th),py=o.y+(o.r+8)*Math.sin(th);
    if(rimSkip(o,th,px,py))continue;
    kput('mnBox',[px,py,sd*(DZ(py)+3)],qRim(th,sd),[TAU*(o.r+8)/n*.93,14,6],stone());
    const px2=o.x+(o.r+1.8)*Math.cos(th),py2=o.y+(o.r+1.8)*Math.sin(th);
    kput('mnBox',[px2,py2,sd*(DZ(py2)+1)],qRim(th,sd),[TAU*(o.r+1.8)/n*.97,3.4,10],stoneD());
    if(i%3===0){const px3=o.x+(o.r+17)*Math.cos(th),py3=o.y+(o.r+17)*Math.sin(th);
     kput('mnPort',[px3,py3,sd*(DZ(py3)+3.2)],qFacing([0,0,sd]),[1.8,1.8,.8],stoneD());
     kput('mnHole',[px3,py3,sd*(DZ(py3)+3.7)],qFacing([0,0,sd]),[1.4,1.4,1],null);}}}
  const zz=DZ(o.y)-1;
  // transverse ribs
  for(let z=-zz+7;z<zz-5;z+=14){const n=Math.round(TAU*o.r/8);
   for(let i=0;i<n;i++){const th=(i+.5)/n*TAU;if(!inArc(o,th)||(dd&&rng()<.2))continue;
    kput('mnBox',[o.x+(o.r-1.4)*Math.cos(th),o.y+(o.r-1.4)*Math.sin(th),z],qRim(th,1),
     [TAU*o.r/n*1.02,2.8,2.2],Math.sin(th)>.2?shadeC():stoneD());}}
  // longitudinal ribs
  for(let i=0;i<16;i++){const th=i/16*TAU;if(!inArc(o,th))continue;
   kput('mnBox',[o.x+(o.r-1.2)*Math.cos(th),o.y+(o.r-1.2)*Math.sin(th),0],qRim(th,1),[2.4,2.4,2*zz],
    Math.sin(th)>.2?shadeC():stoneD());}
  // the ring galleries, one near each face
  for(const zg of [zz-19,-(zz-19)]){const n=Math.round(TAU*o.r/9);
   for(let i=0;i<n;i++){const th=(i+.5)/n*TAU;if(!inArc(o,th))continue;
    const pr=[o.x+(o.r-.3)*Math.cos(th),o.y+(o.r-.3)*Math.sin(th)];
    kput('mnDim',[pr[0],pr[1],zg],qRim(th,1),[TAU*o.r/n*1.01,.6,5.2],null);
    const pd=[o.x+(o.r-2.6)*Math.cos(th),o.y+(o.r-2.6)*Math.sin(th)];
    kput('mnBox',[pd[0],pd[1],zg-3.4],qRim(th,1),[TAU*o.r/n*1.02,5.2,1.1],stoneD());
    if(!dd&&i%2===0)kput('mnLit',[o.x+(o.r-.7)*Math.cos(th),o.y+(o.r-.7)*Math.sin(th),zg],
     QB(new THREE.Vector3(0,0,1),new THREE.Vector3(-Math.sin(th),Math.cos(th),0),new THREE.Vector3(-Math.cos(th),-Math.sin(th),0)),
     [3.6,TAU*o.r/n*.6,1],litC());}}
  // the rosette
  if(o!==O3){const nf=o.r>60?36:24;
   for(let i=0;i<nf;i++){const th=(i+.5)/nf*TAU;if(!inArc(o,th)||(dd&&rng()<.3))continue;
    const L=(i%2?.18:.32)*o.r,rc=o.r-L/2;
    kput('mnBox',[o.x+rc*Math.cos(th),o.y+rc*Math.sin(th),0],qRim(th,1),[TAU*o.r/nf*.42,L,5],stoneD());
    const rt=o.r-L-1.5;
    kput('mnBox',[o.x+rt*Math.cos(th),o.y+rt*Math.sin(th),0],qRim(th,1),[TAU*rt/nf*.86,3,7.5],stone());
    if(!dd&&i%2===0)kput('strip',[o.x+(rt-2)*Math.cos(th),o.y+(rt-2)*Math.sin(th),0],null,[4,10,10],WARMW);}}
  else{const nf=20;
   for(let i=0;i<nf;i++){const th=(i+.5)/nf*TAU;
    kput('mnBox',[o.x+(o.r-3)*Math.cos(th),o.y+(o.r-3)*Math.sin(th),0],qRim(th,1),[TAU*o.r/nf*.5,6,4],stoneD());}}}
 // the bridge across the great oculus, with its arcade
 {const yb=O1.y-O1.r*.5,hb=Math.sqrt(O1.r*O1.r-Math.pow(O1.r*.5,2));
  if(!dd){kput('mnBox',[O1.x,yb-1.6,0],null,[2*hb+4,3.2,14],stoneD());
   for(const sz of [-1,1])kput('mnBox',[O1.x,yb+.65,sz*6.8],null,[2*hb,1.3,.5],stone());
   kput('strip',[O1.x,yb-3.6,0],null,[2*hb-4,8,8],WARMW);
   for(let j=-3;j<=3;j++){const bx=O1.x+j*17,hh=rr(6,11);
    kput('mnBox',[bx,yb+hh/2,0],null,[11,hh,9],stone());
    for(const sz of [-1,1]){
     if(rng()<.5)kput('mnLit',[bx,yb+hh*.45,sz*4.56],qFacing([0,0,sz]),[3,hh*.4,1],litC());
     else kput('mnArchW',[bx,yb+hh*.45,sz*4.56],qFacing([0,0,sz]),[3,hh*.5/1.6,1],null);}}
   for(let j=0;j<14;j++)person(O1.x+rr(-hb+4,hb-4),yb,rr(-5,5));}
  else{// a stub off the west side, and the span that hangs from it
   kput('mnBox',[O1.x-hb+hb*.32,yb-1.6,0],null,[hb*.64,3.2,14],stoneD());
   kput('mnBox',[O1.x-hb+hb*.62,yb-12,1],qEuler(.05,.1,-1.05),[hb*.5,3.2,13],stoneD());
   kput('mnBox',[O1.x-hb+hb*.2,yb+4,0],null,[10,8,9],stoneD());}}

 // ============================================================ THE FOOT
 // Three stepped plinth tiers, split by the arch and splayed at it like a portal,
 // and raking buttresses on both ends — the flare both references stand on.
 for(let ti=0;ti<PL.length;ti++){const t=PL[ti],hw=HW(t.y1)+t.ex,dz=DZ(t.y0)+t.ez;
  boxG(-hw,AX-AW-t.g,t.y0,t.y1,-dz,dz,CITY);
  boxG(AX+AW+t.g,hw,t.y0,t.y1,-dz,dz,CITY);
  // the tier's top: a planted terrace, or moss
  for(let j=0;j<(dd?40:60);j++){const x=rr(-hw+3,hw-3),sz=rng()<.5?1:-1;
   if(x>AX-AW-t.g-3&&x<AX+AW+t.g+3)continue;
   const inner=ti<2?DZ(PL[ti+1].y0)+PL[ti+1].ez:DZ(PLY);
   const z=sz*rr(inner+1,dz-2);
   if(dd)kput('moss',[x,t.y1+.4,z],qEuler(0,rng()*TAU,0),[rr(2,6),rr(.6,1.4),rr(2,6)],mossC());
   else if(rng()<.55)plant(x,t.y1,z,rr(5,9));else person(x,t.y1,z);}
  // a cornice on the tier's lip
  for(const sz of [-1,1])for(let x=-hw+6;x<hw-5;x+=12){if(x>AX-AW-t.g-6&&x<AX+AW+t.g+6)continue;
   if(dd&&rng()<.25)continue;
   kput('mnBox',[x,t.y1-1.2,sz*(dz+.9)],null,[12,2.4,1.8],stoneD());
   if(!dd&&x%36<12)kput('strip',[x,t.y1-3.2,sz*(dz+1.9)],null,[10,6,6],WARMW);
   if(dd&&rng()<.12)kput('vine',[x,t.y1,sz*(dz+1.2)],qEuler(rr(-.1,.1),0,rr(-.1,.1)),[1.2,rr(6,t.y1-t.y0),1.2],null);}}
 for(const sx of [-1,1])for(const sz of [-1,1]){const z=sz*BZ,x0=sx*(HW(0)-6),x1=sx*(HW(0)+96),xt0=sx*(HW(BUTY)-6),xt1=sx*(HW(BUTY)+4);
  hexa([[x0,0,z-13],[x1,0,z-13],[x1,0,z+13],[x0,0,z+13],[xt0,BUTY,z-13],[xt1,BUTY,z-13],[xt1,BUTY,z+13],[xt0,BUTY,z+13]],ASH);
  for(let f=.12;f<.95;f+=.16){const y=f*BUTY,xo=lerp(x1,xt1,f);
   kput('mnBox',[xo-sx*.2,y,z],qEuler(0,0,sx*Math.atan2(BUTY,Math.abs(x1-xt1))-sx*Math.PI/2),[1.6,10,27],stoneD());}}

 // ============================================================ THE CROWN
 if(!dd){
  const hwc=HW(YC)-CST;
  for(const sd of [1,-1]){
   for(let x=-HW(YC)+6;x<HW(YC)-5;x+=12){kput('mnBox',[x,YC-3,sd*(DZ(YC)+2.2)],null,[12,6,4.4],stoneD());
    if(x%48<12)kput('strip',[x,YC-7,sd*(DZ(YC)+4.6)],null,[10,6,6],WARMW);}
   for(let x=-hwc+6;x<hwc-5;x+=12)kput('mnBox',[x,H-2.5,sd*(DZ(H)+1.8)],null,[12,5,3.6],stone());}
  for(const sx of [-1,1])for(let z=-DZ(YC)+6;z<DZ(YC)-5;z+=12){
   kput('mnBox',[sx*(HW(YC)+2.2),YC-3,z],null,[4.4,6,12],stoneD());
   kput('mnBox',[sx*(hwc+1.8),H-2.5,z],null,[3.6,5,12],stone());}
  // what stands on the roof: low pavilions set well back, a garden, people
  for(const px of [-110,0,110]){kput('mnBox',[px,H+5,0],null,[46,10,52],stone());
   for(const sz of [-1,1])kput('mnLit',[px,H+5,sz*26.1],qFacing([0,0,sz]),[36,4,1],litC());}
  for(let j=0;j<30;j++)plant(rr(-hwc+10,hwc-10),H,rr(-DZ(H)+8,DZ(H)-8),rr(4,8));
  for(let j=0;j<20;j++)person(rr(-hwc+10,hwc-10),H,rr(-DZ(H)+6,DZ(H)-6));}

 // ============================================================ THE OUTLIERS
 // Four slender satellite spires on the plain, as both references have. The ruin
 // snaps them.
 const SAT=[{x:-380,z:420,h:190,w:15},{x:470,z:-360,h:150,w:13},{x:330,z:560,h:232,w:17},{x:-540,z:-420,h:120,w:12}];
 for(const S of SAT){const hb=dd?S.h*rr(.28,.58):S.h,wt=S.w*.55,wAt=y=>lerp(S.w,wt,y/S.h);
  const w0=S.w,w1=wAt(hb);
  hexa([[S.x-w0,0,S.z-w0],[S.x+w0,0,S.z-w0],[S.x+w0,0,S.z+w0],[S.x-w0,0,S.z+w0],
   [S.x-w1,hb,S.z-w1],[S.x+w1,hb,S.z-w1],[S.x+w1,hb,S.z+w1],[S.x-w1,hb,S.z+w1]],CITY);
  boxG(S.x-S.w*1.9,S.x+S.w*1.9,0,7,S.z-S.w*1.9,S.z+S.w*1.9,ASH);
  if(!dd){const ct=S.h+S.w*2.4;
   hexa([[S.x-wt,S.h,S.z-wt],[S.x+wt,S.h,S.z-wt],[S.x+wt,S.h,S.z+wt],[S.x-wt,S.h,S.z+wt],
    [S.x,ct,S.z],[S.x,ct,S.z],[S.x,ct,S.z],[S.x,ct,S.z]],ASH);
   kput('strip',[S.x,S.h+2,S.z],null,[wt*2.4,12,12],WARMW);}
  else{for(let j=0;j<3;j++)kput('mnBox',[S.x+rr(-.5,.5)*w1,hb+rr(1,6),S.z+rr(-.5,.5)*w1],
    qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[w1*rr(.5,1),rr(4,12),w1*rr(.5,1)],stone());
   const fa=rng()*TAU,fl=S.h-hb;
   rotBox([S.x+Math.cos(fa)*(fl*.5+S.w*2),S.w*.7,S.z+Math.sin(fa)*(fl*.5+S.w*2)],[fl*.8,S.w*1.3,S.w*1.3],qEuler(0,-fa,rr(-.06,.06)),ASH);
   rubbleRing(S.x,.3,S.z,S.w*1.6,S.w*5,40,5);}
  // cladding bands
  for(const yb of [.35,.62,.86]){const y=S.h*yb;if(y>hb-4)continue;const wy=wAt(y);
   for(const [nx,nz] of [[1,0],[-1,0],[0,1],[0,-1]]){if(dd&&rng()<.4)continue;
    kput(PAN,[S.x+nx*(wy+.8),y,S.z+nz*(wy+.8)],qFacing([nx,0,nz]),[wy*1.8,S.h*.08,1.6],orange());}}
  for(let j=0;j<(dd?1:5);j++)person(S.x+rr(-S.w*3,S.w*3),7,S.z+S.w*2.2+rr(0,6));}

 // ============================================================ THE GROUND
 // A paved court round the foot, the road, and planting — or, ruined, the plain
 // coming back over all of it.
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(260,dd?380:430,v)*(1+.05*fbm(u*7,1.3,3.3,2));
  return[Math.cos(th)*r*1.08,.3,Math.sin(th)*r*.78];},64,3,{uS:60,vS:4}));
 GRD.push(gridSurface((u,v)=>[lerp(-280,280,u),.28,lerp(-205,205,v)],10,8,{uS:22,vS:16}));
 if(!dd){trees(0,0,470,900,70);
  for(let j=0;j<40;j++){const a=j/40*TAU;plant(Math.cos(a)*440*1.08,.3,Math.sin(a)*440*.78,rr(9,14));}
  for(let j=0;j<60;j++){const a=rng()*TAU,r=rr(250,420);person(Math.cos(a)*r*1.08,.3,Math.sin(a)*r*.78);}}
 else trees(0,0,420,900,34);

 // ============================================================ THE RUIN
 if(dd){
  // ---- the fracture: floor plates sticking out of every vertical step, moss and
  // rubble on every horizontal one
  for(const [a,b] of BRK){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L<1)continue;
   const nx=dy/L,ny=-dx/L;                     // outward, for an anticlockwise polygon
   if(Math.abs(dy)>Math.abs(dx)){
    for(let t2=.1;t2<.95;t2+=12.8/L){if(rng()<.45)continue;const y=lerp(a[1],b[1],t2),x=lerp(a[0],b[0],t2),Lo=rr(2,9);
     kput('mnBox',[x+nx*Lo/2,y,rr(-.3,.3)*DZ(y)],qEuler(rr(-.05,.05),0,rr(-.12,.12)),[Lo,.9,rr(12,2*DZ(y)-10)],stoneD());}}
   else if(ny>.5){
    for(let t2=0;t2<1;t2+=8/L){const x=lerp(a[0],b[0],t2),y=lerp(a[1],b[1],t2);
     for(let j=0;j<3;j++)kput('rubble',[x+rr(-4,4),y+rr(.5,2),rr(-1,1)*DZ(y)*.9],qEuler(rng()*3,rng()*3,rng()*3),
      [rr(1.5,5),rr(1,3.5),rr(1.5,5)],new THREE.Color().setHSL(rr(.06,.1),rr(.05,.15),rr(.35,.55)));
     if(rng()<.5)kput('moss',[x,y+.4,rr(-1,1)*DZ(y)*.9],qEuler(0,rng()*TAU,0),[rr(2,6),rr(.5,1.2),rr(2,6)],mossC());}}}
  // ---- the crack from the middle oculus to the east edge
  {let x=O2.x+O2.r+3,y=O2.y-4;const xe=HW(600)+2;
   while(x<xe){const nx2=Math.min(xe,x+rr(6,11)),ny2=y-rr(0,9)+rr(-3,3),L=Math.hypot(nx2-x,ny2-y),an=Math.atan2(ny2-y,nx2-x);
    for(const sd of [1,-1])kput('mnDim',[(x+nx2)/2,(y+ny2)/2,sd*(DZ(y)+2.7)],qFacing([0,0,sd]).multiply(qEuler(0,0,sd*an)),[L+1.5,rr(2.2,4.6),1.6],null);
    x=nx2;y=ny2;}}
  // ---- the fallen corner: the upper east quarter, on the plain in pieces
  const SLABS=[{c:[340,0,80],s:[150,44,118],e:[.06,.35,-.10]},{c:[500,0,-120],s:[118,58,96],e:[.22,1.15,.12]},
   {c:[610,0,170],s:[168,36,88],e:[-.08,-.55,.06]},{c:[300,0,-260],s:[92,74,64],e:[.42,.72,.30]},
   {c:[720,0,-10],s:[84,28,62],e:[.03,.2,-.04]},{c:[420,0,320],s:[70,40,70],e:[.5,.1,.35]}];
  for(const S of SLABS){const Q=qEuler(S.e[0],S.e[1],S.e[2]);
   let mn=1e9;for(const [sx,sy,sz] of [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]){
    const v=new THREE.Vector3(sx*S.s[0]/2,sy*S.s[1]/2,sz*S.s[2]/2).applyQuaternion(Q);mn=Math.min(mn,v.y);}
   const C=[S.c[0],-mn*.8,S.c[2]];
   rotBox(C,S.s,Q,CITY);
   // its skin, what is left of it, on the face that came down uppermost
   for(let lx=-S.s[0]/2+6;lx<S.s[0]/2-5;lx+=12)for(let lz=-S.s[2]/2+5;lz<S.s[2]/2-4;lz+=10){
    if(rng()<.45)continue;const v=new THREE.Vector3(lx,S.s[1]/2+.9,lz).applyQuaternion(Q);
    kput(PAN,[C[0]+v.x,C[1]+v.y,C[2]+v.z],Q,[11.4,1.8,9.4],orange());}
   // the floor plates in its broken end
   for(let ly=-S.s[1]/2+4;ly<S.s[1]/2-2;ly+=4.3){const v=new THREE.Vector3(S.s[0]/2+.6,ly,0).applyQuaternion(Q);
    kput('mnDim',[C[0]+v.x,C[1]+v.y,C[2]+v.z],Q,[1,2.6,S.s[2]*.9],null);}
   rubbleRing(S.c[0],.3,S.c[2],Math.max(S.s[0],S.s[2])*.45,Math.max(S.s[0],S.s[2])*.45+90,70,7);}
  for(let j=0;j<120;j++){const x=rr(200,780),z=rr(-360,380);
   kput('mnBox',[x,rr(1,5),z],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),[rr(6,26),rr(3,10),rr(5,20)],rng()<.3?orange():stone());}
  // ---- the skin that came off: panels lying round the foot
  for(let j=0;j<420;j++){const sd=rng()<.6?1:-1,x=rr(-300,320);if(Math.abs(x-AX)<34)continue;
   const z=sd*(DZ(0)+PL[0].ez+Math.pow(rng(),1.6)*220);
   kput(PAN,[x,rr(.6,2),z],qEuler(rr(-.18,.18),rng()*TAU,rr(-.18,.18)),[rr(4,14),rr(.8,1.6),rr(4,11)],orange());}
  // ---- rubble in the arch passage, and the vault's fallen coffers
  for(let j=0;j<300;j++){const u=Math.pow(rng(),1.8),sx=rng()<.5?-1:1,x=AX+sx*(AW-2-u*(AW-10)),z=rr(-DZ(0)-40,DZ(0)+40);
   kput('rubble',[x,rr(0,3)*(1-u),z],qEuler(rng()*3,rng()*3,rng()*3),[rr(1,5),rr(.8,3.5),rr(1,5)],
    new THREE.Color().setHSL(rr(.06,.1),rr(.05,.18),rr(.2,.36)));}
  for(let j=0;j<9;j++)kput('mnBox',[AX+rr(-50,50),rr(3,6),rr(-60,60)],qEuler(rr(-.8,.8),rng()*TAU,rr(-.8,.8)),
   [rr(8,16),rr(6,10),rr(6,12)],shadeC());
  // ---- the rim of the middle oculus, fallen
  rubbleRing(O2.x+80,.3,DZ(0)+30,10,120,110,8);
  // ---- the rest: rubble round the foot, staining, moss and vines
  rubbleRing(0,.3,0,210,420,300,9);
  rubbleRing(170,.3,0,40,260,220,11);
  for(const F of FACES)for(let j=0;j<(F.k<2?260:90);j++){
   const y=rr(PLY+10,1000),a=rr(F.lo(y)+4,F.hi(y)-4);if(!onFace(F,a,y))continue;
   const L=rr(10,46);kput('stain',F.pt(a,y-L*.4,skin(F,a,y)?2.8:.5),F.q,[rr(3,10),L,1],null);}
  for(let j=0;j<160;j++){const x=rr(-HW(0)-30,HW(0)+30),sd=rng()<.5?1:-1;
   plant(x,.3,sd*rr(DZ(0)+PL[0].ez+2,DZ(0)+PL[0].ez+140),rr(4,11));}}

 // ============================================================ THE REGISTRY
 REGISTER({name:'The Monolith ('+STATE(d)+')',x:0,z:0,r:460,h:H+40});
 REGISTER({name:'The Monolith — the slab',x:0,z:0,r:215,y:PLY,h:H-PLY+20});
 REGISTER({name:'The Monolith — the arch',x:AX,z:0,r:AW+32,h:AT+36});
 REGISTER({name:'The Monolith — the foot',x:0,z:0,r:330,h:PLY});
 REGISTER({name:dd?'The Monolith — the great oculus, broken open':'The Monolith — the great oculus',x:O1.x,z:0,r:O1.r+26,y:O1.y-O1.r-26,h:2*O1.r+52});
 REGISTER({name:'The Monolith — the middle oculus',x:O2.x,z:0,r:O2.r+26,y:O2.y-O2.r-26,h:2*O2.r+52});
 REGISTER({name:'The Monolith — the low oculus',x:O3.x,z:0,r:O3.r+22,y:O3.y-O3.r-22,h:2*O3.r+44});
 REGISTER({name:'The Monolith — the carved west flank',x:-HW(500)-6,z:0,r:40,y:PLY,h:(dd?YW:YC)-PLY});
 if(!dd)REGISTER({name:'The Monolith — the crown',x:0,z:0,r:200,y:YC-40,h:80});
 else{REGISTER({name:'The Monolith — the broken crown',x:90,z:0,r:140,y:EBY-20,h:H-EBY+20});
  REGISTER({name:'The Monolith — the fallen corner',x:500,z:0,r:330,h:110});}
 SAT.forEach((S,i)=>REGISTER({name:'The Monolith — outlying spire '+(i+1),x:S.x,z:S.z,r:S.w*3.2,h:S.h+40}));

 // ---- what the presets are derived from ---------------------------------------
 MN_SITE[d]={x:gx,z:gz,d:d,dd:dd,H:H,AX:AX,AW:AW,AS:AS,AT:AT,YC:YC,EBY:EBY,PLY:PLY,
  DZ0:DZ(0),HW0:HW(0),OC:OC.map(o=>({x:o.x,y:o.y,r:o.r})),panels:NPAN,relief:NREL,
  HW:y=>HW(y),DZ:y=>DZ(y)};

 // ---- merge ---------------------------------------------------------------------
 meshMerged(CITY,cityM,G);
 meshMerged(ASH,ashM,G);
 meshMerged(SHD,shdM,G);
 meshMerged(SEC,MAT.mnSect,G);
 meshMerged(GRD,pavM,G);
 KOFF=[0,0,0];return G;}
