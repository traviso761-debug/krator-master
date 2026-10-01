// ================================================================= MEGASTRUCTURE 3 — THE HANGING CITY (the lattice pyramid)
// Replaces Vashtir, the recursive spire (git keeps it). A Shimizu Mega-City
// Pyramid type arcology: not a mass at all but a FRAME, a stacked octahedral
// megatruss standing on piers in its own lagoon, with the city hung inside it.
//
// THE FRAME is an octet-truss pyramid six cells high. Layer k (0 = the apex,
// N = the base) is a (k+1) x (k+1) grid of spherical nodes at spacing A; each
// node is tied to its grid neighbours and to the four nodes of the square below
// it. Every member is the same length A, so the height is N*A/sqrt2 and the
// pyramid is exactly the reference's ~0.71 of its base. N = 6, A = 180 m:
// 1 080 m node to node across the base, apex node at 804 m, ~880 m to the mast.
// 140 nodes and 588 tubes, all through the instancing kit — every tube is the
// same length, so the tube kdef carries real-metre UVs and is never stretched.
//
// THE CITY lives in the cells. The octahedral cells are empty inside (an octet
// truss puts no member through them), so each one can take a skyscraper on its
// vertical axis, HUNG from the node above by a tapering head: a cylinder or a
// slab, sized so its corners clear the four diagonals; or a deck slung from the
// equator nodes carrying a small pyramid; or nothing, so you see through. The
// bottom cells stand in the water: towers in the middle, stepped pyramidal
// podium blocks round the edge, and a ring of larger stepped blocks outside the
// frame on the grid, with causeways across the lagoon on the four axes.
//
// MOVEMENT: inclinators ride rails up every arris and some face diagonals, and
// personal-rapid-transit tubes hang under the horizontal members of each tier.
// Small yellow maintenance robots and gantries crawl on the outer members.
//
// DECAY. The layout comes from its own stream (shzRng), so every decay is the
// same building. 1, ruined: rust; a sector of the +x face round CC has failed,
// its members and nodes and the towers hung in it lying in the lagoon below;
// ~8% of the other members snapped into drooping stubs; glass gone, towers
// eaten through to dark cores; the lagoon gone green; vines hanging off the
// tubes, moss on the nodes, trees on the terraces. 3, rehabilitated: the same
// collapse (the debris falls from its own stream too) but fewer snapped
// members, warm lights back in the towers, fish pens, and the shared
// repairPass's salvage on everything that is a mesh. The lagoon and quay are a
// SIBLING group of the city (as the Lighthouse's sea is), so repairPass never
// builds shanties on the water.
//
// Seed range: reseed 9310+d (9310-9314), layout stream 9317, debris 9319,
// holeFn seeds 9320-9399.
function shzRng(s){let a=s>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);
 t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
// ---- the curtain wall: 512 px = 16 m, four 4 m storeys, a mullion every 2 m.
// White spandrel band at the foot of each storey, blue glass above it.
function shzFacPix(X,Y){const st=Math.floor(Y/128),wy=127-(Y%128),bay=Math.floor(X/64),bx=X%64;
 const f=h3(bay*1.7+.3,st*2.3+.1,4.4),l=h3(bay*3.1+.2,st*1.9+.5,7.7);
 return{c:bx<4?1:wy<24?(wy>=21?3:2):4,f,l,wy};}
function shzFacTex(dec){return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,p=shzFacPix(x,y),n=(fbm(x/9,y/9,2.2,2)-.5)*18;let r,gg,b;
  if(p.c===1||p.c===2){const v=(p.c===1?236:216)+n;r=v;gg=v+2;b=v+5;
   if(dec){const s=Math.max(0,fbm(x/6,y/70,5.1,2)-.40)*190;r=r*.60-s*.6+20;gg=gg*.53-s*.7+10;b=b*.46-s*.8;}}
  else if(p.c===3){r=gg=b=dec?28:92;}
  else{const t=p.wy/128;
   if(!dec){r=30+t*34+p.f*14;gg=58+t*44+p.f*16;b=90+t*58+p.f*18;}
   else if(p.f<.64){const k=fbm(x/5,y/5,3.3,1)*16;r=9+k;gg=10+k;b=11+k;}   // pane gone: the dark floor behind
   else{r=38+n;gg=50+n;b=48+n;}}
  D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
 g.putImageData(id,0,0);});}
// emissive: lit panes. Intact, a city's worth, warm and a few cool office
// whites; rehabilitated, a few warm ones in the panes that still have glass.
function shzFacLit(p0,rehab){return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,p=shzFacPix(x*2,y*2);
  let r=0,gg=0,b=0;
  if(p.c===4&&p.l<p0&&(!rehab||p.f>=.64)){const a=.45+p.f*.6;
   if(!rehab&&p.l<p0*.35){r=170*a;gg=215*a;b=240*a;}else{r=250*a;gg=186*a;b=112*a;}}
  D[i]=r;D[i+1]=gg;D[i+2]=b;D[i+3]=255;}
 g.putImageData(id,0,0);});}
TEX.shzFac=shzFacTex(0);TEX.shzFacR=shzFacTex(1);TEX.shzFacE=shzFacLit(.24,0);TEX.shzFacH=shzFacLit(.30,1);
TEX.shzSea=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/18,y/18,6.1,3),b=fbm(x/4,y/9,2.7,2);
  const v=150+(a-.5)*70+(b-.5)*50;D[i]=v*.9;D[i+1]=v;D[i+2]=v*1.02;D[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.shzFac =new THREE.MeshStandardMaterial({map:TEX.shzFac,emissive:0xffffff,emissiveMap:TEX.shzFacE,emissiveIntensity:1.5,roughness:.45,metalness:.25,side:DS});
MAT.shzFacR=new THREE.MeshStandardMaterial({map:TEX.shzFacR,roughness:.92,metalness:.1,side:DS});
MAT.shzFacH=new THREE.MeshStandardMaterial({map:TEX.shzFacR,emissive:0xffffff,emissiveMap:TEX.shzFacH,emissiveIntensity:1.6,roughness:.92,metalness:.1,side:DS});
// Contrast is the old Vashtir complaint (white on white). Tubes are the white
// panelled metal; the nodes, sleeves and heads are a darker steel, the bands
// darker still, so the joints read at a kilometre.
MAT.shzSteel=MAT.white.clone();MAT.shzSteel.color.setHex(0x8b939c);
MAT.shzSteelR=MAT.rust.clone();MAT.shzSteelR.color.setHex(0x8e7c6c);
MAT.shzBand=MAT.white.clone();MAT.shzBand.color.setHex(0x3b4047);
// Lambert, like the Lighthouse's sea: a GGX water with no env map mirrors the fill light.
MAT.shzSea =new THREE.MeshLambertMaterial({map:TEX.shzSea,color:0x4f8592,side:DS});
MAT.shzSeaR=new THREE.MeshLambertMaterial({map:TEX.shzSea,color:0x3e4a32,side:DS});
MAT.shzSeaH=new THREE.MeshLambertMaterial({map:TEX.shzSea,color:0x4a6f6c,side:DS});
// the podium blocks are not gutted like the towers: their glass is dirty, not gone
MAT.shzPodR=new THREE.MeshStandardMaterial({map:TEX.shzFac,color:0x857a6c,roughness:.9,metalness:.1,side:DS});
MAT.shzPodH=new THREE.MeshStandardMaterial({map:TEX.shzFac,color:0x857a6c,emissive:0xffffff,emissiveMap:TEX.shzFacH,emissiveIntensity:1.6,roughness:.9,metalness:.1,side:DS});
// kit geometry with real-metre UVs (8 m tile): the tube is built at its true
// radius and length, so a whole member is placed at scale 1.
function shzUV(g,su,sv){const U=g.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,U.getX(i)*su,U.getY(i)*sv);return g;}
const SHZ_TUBE=()=>shzUV(new THREE.CylinderGeometry(5,5,1,20,1,true),TAU*5/8,180/8);
const SHZ_NODE=()=>shzUV(new THREE.SphereGeometry(13,22,16),TAU*13/8,13*Math.PI/8);
kdef('shzTubeW',SHZ_TUBE(),MAT.white);   kdef('shzTubeR',SHZ_TUBE(),MAT.rust);
kdef('shzNodeW',SHZ_NODE(),MAT.shzSteel);kdef('shzNodeR',SHZ_NODE(),MAT.shzSteelR);
kdef('shzSlvW',shzUV(new THREE.CylinderGeometry(6.6,6.6,1,20,1,true),TAU*6.6/8,1.3),MAT.shzSteel);
kdef('shzSlvR',shzUV(new THREE.CylinderGeometry(6.6,6.6,1,20,1,true),TAU*6.6/8,1.3),MAT.shzSteelR);
kdef('shzBand',new THREE.CylinderGeometry(5.6,5.6,1,20,1,true),MAT.shzBand);
kdef('shzGan',new THREE.CylinderGeometry(8.5,8.5,1,16,1,true),MAT.shzBand);
kdef('shzPrt',new THREE.CylinderGeometry(2.6,2.6,1,12,1,true),MAT.glass);
kdef('shzRail',new THREE.BoxGeometry(1,1,1),MAT.shzBand);
kdef('shzPodW',new THREE.SphereGeometry(1,8,5),MAT.white);kdef('shzPodR',new THREE.SphereGeometry(1,8,5),MAT.rust);
kdef('shzCabW',new THREE.BoxGeometry(1,1,1),MAT.white);  kdef('shzCabR',new THREE.BoxGeometry(1,1,1),MAT.rust);
kdef('shzBot',new THREE.BoxGeometry(1,1,1),MAT.white);   // coloured per instance
kdef('shzPierC',shzUV(new THREE.CylinderGeometry(9,9,1,20,1,true),TAU*9/8,4),MAT.concrete);
kdef('shzPierCR',shzUV(new THREE.CylinderGeometry(9,9,1,20,1,true),TAU*9/8,4),MAT.concreteR);
kdef('shzCapC',new THREE.CylinderGeometry(15,9,1,20,1,true),MAT.concrete);
kdef('shzCapCR',new THREE.CylinderGeometry(15,9,1,20,1,true),MAT.concreteR);
// Presets are DERIVED from this: targets/spire/91z-views.js runs after 90-scene.js.
const SHZ_SITE={};

function buildSpire(scene,gx,gz,d){reseed(9310+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const W=new THREE.Group();W.position.set(gx,0,gz);scene.add(W);   // the lagoon: a sibling, see the head
 const dd=d>0?1:0,RH=d===3,NM='The Hanging City';
 const N=6,A=180,H=A/Math.SQRT2,YB=40,RT=5,RN=13,B2=N*A/2,YTOP=YB+N*H,WL=3,HL=900;
 const R=shzRng(9317),rs=(a,b)=>a+(b-a)*R();            // layout: the same at every decay
 const RF=shzRng(9319),rf=(a,b)=>a+(b-a)*RF();          // the debris: the same at 1 and 3
 const TUBE=dd?'shzTubeR':'shzTubeW',NODE=dd?'shzNodeR':'shzNodeW',SLV=dd?'shzSlvR':'shzSlvW',
       POD=dd?'shzPodR':'shzPodW',CAB=dd?'shzCabR':'shzCabW',PIER=dd?'shzPierCR':'shzPierC',CAP=dd?'shzCapCR':'shzCapC';
 const FACM=d===0?MAT.shzFac:RH?MAT.shzFacH:MAT.shzFacR,ROOFM=dd?MAT.concreteR:MAT.concrete,HEADM=dd?MAT.shzSteelR:MAT.shzSteel,
       PODM=d===0?MAT.shzFac:RH?MAT.shzPodH:MAT.shzPodR;
 REGISTER({name:NM+' — the lattice pyramid ('+STATE(d)+')',x:0,z:0,r:B2*1.45,h:YTOP+90});
 REGISTER({name:NM+' — the crown ('+STATE(d)+')',x:0,z:0,r:70,y:YTOP-60,h:170});
 REGISTER({name:NM+' — piers and podium blocks ('+STATE(d)+')',x:0,z:0,r:B2*1.78,h:66});
 REGISTER({name:NM+' — the lagoon and its quay ('+STATE(d)+')',x:0,z:0,r:HL*1.5,h:8});

 // ---- vector helpers (arrays) ------------------------------------------------
 const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
       mul3=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],len3=a=>Math.hypot(a[0],a[1],a[2]),nrm3=a=>mul3(a,1/len3(a)),
       crs3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
       at=(a,u,s)=>[a[0]+u[0]*s,a[1]+u[1]*s,a[2]+u[2]*s];
 const V3=a=>new THREE.Vector3(a[0],a[1],a[2]);
 const qBasis=(z,y)=>{const Z=V3(z).normalize(),X=new THREE.Vector3().crossVectors(V3(y),Z).normalize(),Y=new THREE.Vector3().crossVectors(Z,X);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z));};

 // ---- the lattice -------------------------------------------------------------
 const Y=k=>YB+(N-k)*H,NP=[],NK=[],nid={};
 for(let k=0;k<=N;k++)for(let i=0;i<=k;i++)for(let j=0;j<=k;j++){nid[k+','+i+','+j]=NP.length;NP.push([(i-k/2)*A,Y(k),(j-k/2)*A]);NK.push({k,i,j});}
 const NI=(k,i,j)=>nid[k+','+i+','+j];
 const FB=n=>{const o=NK[n];return(o.i===0?1:0)|(o.i===o.k?2:0)|(o.j===0?4:0)|(o.j===o.k?8:0);};
 const FN={1:nrm3([-H,A/2,0]),2:nrm3([H,A/2,0]),4:nrm3([0,A/2,-H]),8:nrm3([0,A/2,H])};
 const MEM=[];
 const addM=(a,b,hz)=>{const f=FB(a)&FB(b),fs=[1,2,4,8].filter(q=>f&q);
  MEM.push({a,b,hz,f,o:fs.length?nrm3(fs.reduce((s,q)=>add3(s,FN[q]),[0,0,0])):null,arris:!hz&&fs.length===2,k:NK[a].k,id:MEM.length});};
 for(let k=0;k<=N;k++)for(let i=0;i<=k;i++)for(let j=0;j<=k;j++){const n=NI(k,i,j);
  if(i<k)addM(n,NI(k,i+1,j),true);if(j<k)addM(n,NI(k,i,j+1),true);
  if(k<N)for(const q of[[0,0],[1,0],[0,1],[1,1]])addM(n,NI(k+1,i+q[0],j+q[1]),false);}

 // ---- the collapse (ruined and rehabilitated: the same sector) -----------------
 // on the south-east arris, mid height: the one the hero camera looks at
 const CC=[250,400,250],RC=240,inC=p=>len3(sub3(p,CC))<RC;
 const nGone=NP.map(p=>!!dd&&len3(sub3(p,CC))<RC*.92);
 const brokeP=d===1?.085:.035;
 for(const m of MEM){const mid=mul3(add3(NP[m.a],NP[m.b]),.5);m.state='ok';
  if(dd){if(nGone[m.a]||nGone[m.b]||inC(mid))m.state='gone';
   else if(h3(m.id*.731+.13,m.a*.17+2.9,9.31)<brokeP)m.state='broken';}}

 // ---- members -------------------------------------------------------------------
 const tubeC=m=>{const h=h3(m.id*.37,1.7,9.33);return dd?new THREE.Color(.70+.30*h,.62+.30*h,.56+.30*h):new THREE.Color().setScalar(.90+.10*h);};
 const BOTC=new THREE.Color(.95,.66,.16),BOTD=new THREE.Color(.42,.30,.18);
 let INCL=null;
 for(const m of MEM){const pa=NP[m.a],pb=NP[m.b],u=nrm3(sub3(pb,pa)),hm=h3(m.id*1.13,4.1,9.35),hm2=h3(m.id*2.71,.6,9.37);
  if(m.state!=='ok'){
   // stubs: what is left at each surviving node, drooping
   for(const e of[0,1]){const n=e?m.b:m.a,p0=e?pb:pa,uu=e?mul3(u,-1):u;if(nGone[n])continue;
    const hs=h3(m.id*.53+e,7.7,9.39);if(m.state==='gone'&&hs<.30)continue;   // sheared clean at the node
    const l=A*(.14+.30*h3(m.id*.91,e+2.2,9.41)),dr=.5*h3(m.id*.29,e+5.1,9.43);
    const v=nrm3([uu[0],uu[1]-dr,uu[2]]);
    beam(TUBE,p0,at(p0,v,l),1,1,tubeC(m));beam(SLV,at(p0,v,RN-2),at(p0,v,RN+9),1,1);}
   continue;}
  beam(TUBE,pa,pb,1,1,tubeC(m));
  beam(SLV,at(pa,u,RN-2),at(pa,u,RN+9),1,1);beam(SLV,at(pb,u,-RN+2),at(pb,u,-RN-9),1,1);
  for(const t of[.36,.64])beam('shzBand',at(pa,u,A*t-1.1),at(pa,u,A*t+1.1),1,1);
  // ---- maintenance robots and gantries on the outer members
  if(m.o){if(hm<.20&&(!dd||hm<.06)){const t=.2+.6*hm2,p=at(at(pa,u,A*t),m.o,RT+1.3);
    kput('shzBot',p,qBasis(u,m.o),[3.4,2.4,5.6],dd?BOTD:BOTC);
    kput('shzBot',at(at(p,u,3.6),m.o,1.6),qBasis(u,m.o),[1.2,1.2,3.4],dd?BOTD:BOTC);}
   else if(hm>.93){const t=.25+.5*hm2,p=at(pa,u,A*t);
    beam('shzGan',at(p,u,-2.5),at(p,u,2.5),1,1);
    kput('shzBot',at(p,m.o,RT+8),qBasis(u,m.o),[7,5,7],dd?BOTD:BOTC);}}
  // ---- inclinators: rails up every arris and some face diagonals, a cab or two
  if(!m.hz&&m.o&&(m.arris||hm2<.30)){const lat=nrm3(crs3(u,m.o)),off=RT+1.6;
   for(const sg of[-1,1]){const a0=at(at(at(pa,u,RN+3),m.o,off),lat,sg*2.4),b0=at(at(at(pb,u,-RN-3),m.o,off),lat,sg*2.4);
    beam('shzRail',a0,b0,.9,.9);}
   const nc=m.arris?2:1;
   for(let c=0;c<nc;c++){if(dd&&h3(m.id,c,9.45)<.4)continue;
    const t=(c+.3+.4*h3(m.id,c+3,9.47))/nc,p=at(at(pa,u,A*t),m.o,RT+6.5),hd=nrm3([u[0],0,u[2]]),q=qFacing(hd);
    kput(CAB,p,q,[7,6.5,11],null);
    const sd=nrm3(crs3(hd,[0,1,0]));
    for(const sg of[-1,1])kput('darkPane',at(at(p,sd,sg*3.6),[0,1,0],.8),qFacing(mul3(sd,sg)),[9,3,1],null);}
   if(m.arris&&m.k===3&&pb[0]>0&&pb[2]>0)INCL={p:mul3(add3(pa,pb),.5),o:m.o,u};}
  // ---- personal rapid transit: a tube hung under each tier's horizontals
  if(m.hz&&m.k>=1){const dn=[0,-(RT+6),0],a0=add3(at(pa,u,RN+2),dn),b0=add3(at(pb,u,-RN-2),dn);
   if(!dd)beam('shzPrt',a0,b0,1,1);
   beam('shzRail',add3(a0,[0,-2.2,0]),add3(b0,[0,-2.2,0]),1.4,.6);
   for(const t of[.2,.4,.6,.8]){const p=at(pa,u,A*t);beam('boxD',add3(p,[0,-RT+.5,0]),add3(p,[0,-RT-3.5,0]),.5,.5);}
   const np=hm<.45?1:hm<.8?2:0;
   for(let c=0;c<np;c++){if(dd&&h3(m.id,c+7,9.49)<.5)continue;
    const t=(c+.25+.5*h3(m.id,c+1,9.51))/Math.max(1,np),p=at(a0,u,(A-2*RN-4)*t);
    kput(POD,add3(p,[0,-.3,0]),qFacing(u),[1.7,1.7,4.4],null);}}
  // ---- the ruin's vines, hanging off the horizontals
  if(dd&&m.hz){const nv=d===1?Math.floor(rng()*6):(rng()<.3?1:0);
   for(let c=0;c<nv;c++){const p=at(pa,u,A*rr(.12,.88));
    kput('vine',[p[0],p[1]-RT*.7,p[2]],qEuler(rr(-.08,.08),0,rr(-.08,.08)),[rr(5,9),rr(10,48),rr(5,9)],null);}}}

 // ---- nodes -----------------------------------------------------------------------
 for(let n=0;n<NP.length;n++){if(nGone[n])continue;const p=NP[n],h=h3(n*.77,3.3,9.53);
  kput(NODE,p,qEuler(0,h*TAU,0),1,dd?new THREE.Color(.75+.25*h,.70+.25*h,.66+.25*h):null);
  if(d===0)for(let a=0;a<4;a++){const th=a/4*TAU+.39,c=Math.cos(th),s=Math.sin(th);
   kput('dot',[p[0]+c*(RN+.1),p[1],p[2]+s*(RN+.1)],qFacing([c,0,s]),[2.6,2.6,1],CYAN);}
  if(dd&&(d===1||rng()<.4))kput('moss',[p[0],p[1]+RN*.80,p[2]],qEuler(0,rng()*TAU,0),[RN*rr(.45,.7),rr(1.6,3.2),RN*rr(.45,.7)],
   new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.16,.26)));}
 // the crown: a mast and a lookout on the apex node
 {const yt=YTOP+RN-1;
  if(!nGone[0]){if(d===1){kput('postR',[3,yt+11,2],qEuler(.25,0,.18),[2.2,24,2.2],null);}
   else{kput(dd?'postR':'postW',[0,yt+36,0],null,[2.2,72,2.2],null);kput(NODE,[0,yt+50,0],null,.42,null);
    kput(dd?'postR':'postW',[0,yt+88,0],null,[.8,30,.8],null);if(d===0)kput('dot',[0,yt+104,0],null,[3,3,3],CYAN);}}}

 // ---- geometry helpers for the hung city (real-metre UVs: 16 m facade tile) ------
 const bucket=()=>({fac:[],roof:[],head:[],core:[],pod:[]});
 const BK=bucket();
 const cylWall=(cx,cz,r,y0,y1,hole,arr)=>{const hh=y1-y0,nv=hole?Math.max(1,Math.round(hh/8)):1;
  arr.push(gridSurface((u,v)=>[cx+r*Math.cos(u*TAU),y0+hh*v,cz+r*Math.sin(u*TAU)],28,nv,{uS:TAU*r/16,vS:hh/16,hole:hole?(u,v)=>hole(u,y0+hh*v):null}));};
 const disc=(cx,y,cz,r,arr,seg)=>arr.push(shzUV(new THREE.CircleGeometry(r,seg||28),r/4,r/4).rotateX(-Math.PI/2).translate(cx,y,cz));
 const rectWalls=(cx,cz,hw,hd,y0,y1,hole,arr)=>{const hh=y1-y0,C=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]];
  for(let s=0;s<4;s++){const a=C[s],b=C[(s+1)%4],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
   arr.push(gridSurface((u,v)=>[cx+lerp(a[0],b[0],u),y0+hh*v,cz+lerp(a[1],b[1],u)],hole?Math.max(1,Math.round(len/8)):1,hole?Math.max(1,Math.round(hh/8)):1,
    {uS:len/16,vS:hh/16,hole:hole?(u,v)=>hole((u+s)/4,y0+hh*v):null}));}};
 const rectTop=(cx,cz,hw,hd,y,arr)=>arr.push(gridSurface((u,v)=>[cx+lerp(-hw,hw,u),y,cz+lerp(-hd,hd,v)],1,1,{uS:hw/4,vS:hd/4}));
 // a frustum on a rectangle (t = top size as a fraction of the foot; y1 may be below y0)
 const pyr=(cx,cz,hw,hd,y0,y1,t,arr)=>{const C=[[-1,-1],[1,-1],[1,1],[-1,1]];
  for(let s=0;s<4;s++){const a=C[s],b=C[(s+1)%4],len=Math.hypot((b[0]-a[0])*hw,(b[1]-a[1])*hd),sl=Math.hypot(y1-y0,(1-t)*Math.max(hw,hd));
   arr.push(gridSurface((u,v)=>{const f=lerp(1,t,v);return[cx+lerp(a[0],b[0],u)*hw*f,lerp(y0,y1,v),cz+lerp(a[1],b[1],u)*hd*f];},1,1,{uS:len/16,vS:sl/16}));}};
 const frus=(cx,cz,rb,rt,y0,y1,arr,seg)=>arr.push(new THREE.CylinderGeometry(rt,rb,y1-y0,seg||24,1,true).translate(cx,(y0+y1)/2,cz));
 // a tower: s = {kind:'cyl'|'slab', cx,cz, r | hw,hd, y0,y1, rings:[f]}
 const towerGeo=(s,bk,hole)=>{
  if(s.kind==='cyl'){cylWall(s.cx,s.cz,s.r,s.y0,s.y1,hole,bk.fac);disc(s.cx,s.y0,s.cz,s.r,bk.head);disc(s.cx,s.y1,s.cz,s.r,bk.roof);
   if(hole){frus(s.cx,s.cz,s.r*.88,s.r*.88,s.y0,s.y1,bk.core,14);for(let y=s.y0+12;y<s.y1-4;y+=12)disc(s.cx,y,s.cz,s.r*.97,bk.roof,16);}
   for(const f of s.rings){const y=lerp(s.y0,s.y1,f);bk.head.push(new THREE.CylinderGeometry(s.r+3.5,s.r+3.5,2.4,28,1,false).translate(s.cx,y,s.cz));}}
  else{rectWalls(s.cx,s.cz,s.hw,s.hd,s.y0,s.y1,hole,bk.fac);rectTop(s.cx,s.cz,s.hw,s.hd,s.y1,bk.roof);rectTop(s.cx,s.cz,s.hw,s.hd,s.y0,bk.head);
   if(hole){bk.core.push(new THREE.BoxGeometry(s.hw*1.76,s.y1-s.y0,s.hd*1.76).translate(s.cx,(s.y0+s.y1)/2,s.cz));
    for(let y=s.y0+12;y<s.y1-4;y+=12)rectTop(s.cx,s.cz,s.hw*.98,s.hd*.98,y,bk.roof);}
   for(const f of s.rings){const y=lerp(s.y0,s.y1,f);bk.head.push(new THREE.BoxGeometry(s.hw*2+6,2.4,s.hd*2+6).translate(s.cx,y,s.cz));}}};
 // a stepped pyramidal block: steps = [[hw,hd,y0,y1],...]
 const OBS=[];   // footprints standing in the lagoon: [x,z,r]
 const TERR=[];  // terrace bands for planting: {cx,cz,hi,ho,y}
 const stepped=(cx,cz,hws,h0,dh,bk)=>{let y=h0;
  rectWalls(cx,cz,hws[0]+5,hws[0]+5,0,h0,null,bk.roof);rectTop(cx,cz,hws[0]+5,hws[0]+5,h0,bk.roof);   // plinth
  for(let s=0;s<hws.length;s++){const hw=hws[s];rectWalls(cx,cz,hw,hw,y,y+dh,null,bk.pod);rectTop(cx,cz,hw,hw,y+dh,bk.roof);
   if(s<hws.length-1)TERR.push({cx,cz,hi:hws[s+1],ho:hw,y:y+dh});y+=dh;}
  OBS.push([cx,cz,(hws[0]+5)*1.42]);return y;};
 const hole=dd?holeFn(1,9320,null,1.1):null;

 // ---- the hung city: one structure per octahedral cell --------------------------
 let HUNG=null;const DROP=[];
 for(let k=1;k<N;k++)for(let i=0;i<k;i++)for(let j=0;j<k;j++){
  const cx=(i+.5-k/2)*A,cz=(j+.5-k/2)*A,yk=Y(k),yU=Y(k-1)-RN*.8,yL=Y(k+1)+RN*.8;
  const r0=R(),r1=R(),r2=R(),r3=R(),r4=R(),r5=R(),r6=R();
  const kind=r0<.12?'void':r0<.52?'cyl':r0<.78?'slab':'deck';
  if(kind==='void')continue;
  const dropped=dd&&len3(sub3([cx,yk,cz],CC))<RC*1.12;
  if(kind==='deck'){const pH=rs(44,58),kH=rs(14,30);if(dropped)continue;   // drawn before the exit: same stream at every decay
   const yd=yk-28,dh=52;
   rectWalls(cx,cz,dh,dh,yd-4,yd,null,BK.head);rectTop(cx,cz,dh,dh,yd,BK.roof);rectTop(cx,cz,dh,dh,yd-4,BK.head);
   for(const q of[[-1,-1],[1,-1],[1,1],[-1,1]])beam('shzRail',[cx+q[0]*dh,yd,cz+q[1]*dh],[cx+q[0]*(A/2-RN),yk-2,cz+q[1]*(A/2-RN)],1.8,1.8);
   if(r1<.55){let y=yd;const n=3+(r2<.5?1:0);for(let s=0;s<n;s++){const hw=44-s*(36/n);rectWalls(cx,cz,hw,hw,y,y+11,null,BK.fac);rectTop(cx,cz,hw,hw,y+11,BK.roof);
     if(s<n-1)TERR.push({cx,cz,hi:44-(s+1)*(36/n),ho:hw,y:y+11});y+=11;}}
   else pyr(cx,cz,42,42,yd,yd+pH,.04,BK.fac);
   pyr(cx,cz,dh*.9,dh*.9,yd-4,yd-4-kH,.08,BK.head);       // the keel under the deck
   continue;}
  const s={kind,cx,cz,rings:r4<.5?[.3,.7]:[.55]};
  if(kind==='cyl'){s.r=12+r1*9;}else{s.hw=15+r1*9;s.hd=8+r2*4;if(r6<.5){const t=s.hw;s.hw=s.hd;s.hd=t;}}
  const rho=kind==='cyl'?s.r:Math.hypot(s.hw,s.hd),e=H-(rho+4)*1.42;
  s.y1=yk+e*(.80+.20*r2);s.y0=yk-e*(.35+.65*r3);
  if(dropped){DROP.push(s);continue;}
  // ruined: one in five of the rest has let go of its node too and is gone,
  // leaving the head; one in six hangs on and has swung off the plumb
  const lost=dd&&h3(cx*.01,cz*.01+k,9.55)<(d===1?.2:.1);
  if(!lost){if(dd&&h3(cx*.013,cz*.017+k,9.57)<.18){
    const P=new THREE.Group();P.position.set(cx,s.y1,cz);P.rotation.set(rr(-.16,.16),0,rr(-.16,.16));G.add(P);
    const b2=bucket(),s2=Object.assign({},s,{cx:0,cz:0,y0:s.y0-s.y1,y1:0});towerGeo(s2,b2,hole);
    meshMerged(b2.fac,FACM,P);meshMerged(b2.roof,ROOFM,P);meshMerged(b2.head,HEADM,P);meshMerged(b2.core,MAT.dark,P);}
   else{towerGeo(s,BK,hole);
    // the pendant under the soffit, aimed at the node below
    if(r5<.6){const pl=Math.min((s.y0-yL)*.55,rho*2.4);if(kind==='cyl')frus(cx,cz,s.r*.92,1.2,s.y0,s.y0-pl,BK.head,20);else pyr(cx,cz,s.hw*.92,s.hd*.92,s.y0,s.y0-pl,.05,BK.head);}}}
  // the head: the tower hangs from the node above it
  if(kind==='cyl')frus(cx,cz,s.r*.94,RN*.5,s.y1,yU,BK.head);else pyr(cx,cz,s.hw*.96,s.hd*.96,s.y1,yU,.12,BK.head);
  if(!HUNG&&kind==='cyl'&&k===3&&cx>0&&cz>0)HUNG={x:cx,z:cz,y0:s.y0,y1:s.y1,r:s.r,yU};}
 if(!HUNG)for(let k=2;k<N&&!HUNG;k++)HUNG={x:(k/2-.5)*A,z:(k/2-.5)*A,y0:Y(k)-60,y1:Y(k)+60,r:16,yU:Y(k-1)};

 // ---- the base: bottom cells, piers, the podium ring --------------------------
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){
  const cx=(i+.5-N/2)*A,cz=(j+.5-N/2)*A,per=i===0||j===0||i===N-1||j===N-1;
  const r0=R(),r1=R(),r2=R(),r3=R();
  if(per){stepped(cx,cz,r0<.5?[62,50,38,26]:[60,46,32],4.5,14,BK);continue;}
  const kind=r0<.5?'cyl':'slab',s={kind,cx,cz,rings:r3<.5?[.45]:[.3,.75]};
  if(kind==='cyl')s.r=14+r1*8;else{s.hw=18+r1*8;s.hd=10+r2*5;if(r3<.5){const t=s.hw;s.hw=s.hd;s.hd=t;}}
  const rho=kind==='cyl'?s.r:Math.hypot(s.hw,s.hd);
  s.y0=WL+2;s.y1=Y(N-1)-(rho+4)*1.42-rs(0,28);
  rectWalls(cx,cz,rho+6,rho+6,0,WL+2,null,BK.roof);rectTop(cx,cz,rho+6,rho+6,WL+2,BK.roof);OBS.push([cx,cz,(rho+6)*1.42]);
  towerGeo(s,BK,hole);
  if(r2<.7){if(kind==='cyl')frus(cx,cz,s.r*.94,RN*.5,s.y1,Y(N-1)-RN*.8,BK.head);else pyr(cx,cz,s.hw*.96,s.hd*.96,s.y1,Y(N-1)-RN*.8,.12,BK.head);}}
 // piers under every base node, a capital under the node and a fender at the waterline
 for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const p=NP[NI(N,i,j)];
  kput(PIER,[p[0],(YB-RN*.6-6)/2,p[2]],null,[1,YB-RN*.6-6,1],null);
  kput(CAP,[p[0],YB-RN*.6-3,p[2]],null,[1,6,1],null);
  beam('shzBand',[p[0],WL-.5,p[2]],[p[0],WL+1.6,p[2]],1.9,1.9);
  OBS.push([p[0],p[2],18]);}
 // the ring of stepped blocks outside the frame, on the grid
 const OR=B2+84;
 for(let sd=0;sd<4;sd++)for(let g=0;g<N;g++){const t=(g+.5-N/2)*A;
  const xz=sd===0?[OR,t]:sd===1?[-OR,t]:sd===2?[t,OR]:[t,-OR];
  stepped(xz[0],xz[1],(g===0||g===N-1)?[58,46,34,22]:[60,48,36,24],4.5,12,BK);}
 for(const q of[[1,1],[1,-1],[-1,1],[-1,-1]])stepped(q[0]*(OR+12),q[1]*(OR+12),[76,62,48,34,20],4.5,12,BK);
 // causeways on the four axes, quay to base
 for(let sd=0;sd<4;sd++){const ax=sd<2?1:0,sg=sd%2?-1:1,L0=B2+12,L1=HL+6,Lm=(L0+L1)/2,LL=L1-L0;
  const P=v=>ax?[sg*v[0],v[1],v[2]]:[v[2],v[1],sg*v[0]],S=v=>ax?v:[v[2],v[1],v[0]];
  kput(BOXC(d),P([Lm,6.5,0]),null,S([LL,2.4,22]),null);
  for(const o of[-10.5,10.5])kput(BOXC(d),P([Lm,8.5,o]),null,S([LL,1.6,1]),null);
  for(let v=L0+20;v<L1-8;v+=36)kput(BOXC(d),P([v,2.6,0]),null,S([6,5.2,16]),null);
  kput(BOXC(d),P([B2+4,6.5,0]),null,S([34,2.4,40]),null);
  if(d===3)for(let v=L0+12;v<L1;v+=24)kput('dot',P([v,10.5,10.5]),null,[1,1,1],WARM);}

 // ---- the fallen: the collapse in the lagoon (ruined and rehabilitated) ----------
 let FALL=null;
 const clear=(x,z,r)=>Math.abs(x)<HL-30-r*.3&&Math.abs(z)<HL-30-r*.3&&!OBS.some(o=>Math.hypot(x-o[0],z-o[1])<o[2]+r*.35);
 if(dd){
  const spot=(x,z,r)=>{for(let t=0;t<8;t++){const f=rf(1.0,1.9),th=Math.atan2(z,x)+rf(-.35,.35),rr0=Math.hypot(x,z)*f+rf(0,120);
    const px=Math.cos(th)*rr0,pz=Math.sin(th)*rr0;if(clear(px,pz,r))return[px,pz];}return null;};
  let fx=0,fz=0,fn=0;
  for(const m of MEM){if(m.state!=='gone')continue;const mid=mul3(add3(NP[m.a],NP[m.b]),.5);
   const np=RF()<.25?0:RF()<.6?1:2;
   for(let c=0;c<np;c++){const l=A*rf(.25,.62),sp=spot(mid[0],mid[2],l);if(!sp)continue;
    const yaw=rf(0,TAU),pit=rf(0,.20),e=[Math.cos(yaw)*Math.cos(pit),Math.sin(pit),Math.sin(yaw)*Math.cos(pit)];
    const cy=WL-1.6+Math.abs(e[1])*l/2,cp=[sp[0],cy,sp[1]];
    beam('shzTubeR',at(cp,e,-l/2),at(cp,e,l/2),1,1,new THREE.Color(.8,.72,.64));
    fx+=sp[0];fz+=sp[1];fn++;}}
  for(let n=0;n<NP.length;n++){if(!nGone[n])continue;const sp=spot(NP[n][0],NP[n][2],30);if(!sp)continue;
   kput('shzNodeR',[sp[0],WL-RN*.4,sp[1]],qEuler(rf(0,3),rf(0,3),rf(0,3)),1,null);}
  // the towers that hung in the failed sector, broken in two and lying in the water
  for(const s of DROP){const Lt=s.y1-s.y0;
   for(let pc=0;pc<2;pc++){const sp=spot(s.cx,s.cz,Lt*.5);if(!sp)continue;
    const a=pc?.42:0,b=pc?1:.42,s2=Object.assign({},s,{cx:0,cz:0,y0:0,y1:Lt*(b-a)});
    const F=new THREE.Group(),b2=bucket();towerGeo(s2,b2,holeFn(1,9330+pc,s2.y1,1.2));
    meshMerged(b2.fac,FACM,F);meshMerged(b2.roof,ROOFM,F);meshMerged(b2.head,HEADM,F);meshMerged(b2.core,MAT.dark,F);
    F.position.set(sp[0],0,sp[1]);F.rotation.set(rf(-.25,.25),rf(0,TAU),Math.PI/2+rf(-.35,.1));G.add(F);dropFragment(F,0,rf(3,7));
    fx+=sp[0];fz+=sp[1];fn++;}}
  if(fn){FALL=[fx/fn,fz/fn];REGISTER({name:NM+' — the fallen sector, in the lagoon ('+STATE(d)+')',x:FALL[0],z:FALL[1],r:260,h:60});}
  // rubble and slick where it went in
  for(let c=0;c<(d===1?140:60);c++){const th=rng()*TAU,rr0=rr(0,240),x=(FALL?FALL[0]:CC[0])+Math.cos(th)*rr0,z=(FALL?FALL[1]:CC[2])+Math.sin(th)*rr0;
   if(!clear(x,z,4))continue;const s=rr(1.5,6);
   kput('rubble',[x,WL-.6+s*.2,z],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.8,1.6),s*rr(.5,1),s*rr(.8,1.6)],new THREE.Color().setHSL(rr(.05,.09),rr(.2,.4),rr(.22,.36)));}}

 // ---- planting: terraces, quay, water --------------------------------------------
 if(dd){const nT=d===1?3:1;
  for(const t of TERR)for(let c=0;c<nT;c++){const side=rng()*4|0,f=rr(-1,1)*t.ho,o=rr(t.hi+2,t.ho-2);
   const x=t.cx+(side===0?o:side===1?-o:f),z=t.cz+(side===2?o:side===3?-o:f);VEG.tree(x,t.y,z,c%3,rr(5,12));}
  // algae and lily mats on the lagoon
  for(let c=0;c<(d===1?150:50);c++){const x=rr(-HL+20,HL-20),z=rr(-HL+20,HL-20);if(!clear(x,z,10))continue;
   kput('moss',[x,WL+.05,z],qEuler(0,rng()*TAU,0),[rr(5,20),.25,rr(5,20)],new THREE.Color().setHSL(rr(.2,.3),rr(.35,.55),rr(.14,.24)));}}
 if(dd)for(let c=0;c<(d===1?70:30);c++){const s=rng()*4|0,t=rr(-1,1)*(HL+120),o=rr(HL+80,HL+300);
  const x=s===0?o:s===1?-o:t,z=s===2?o:s===3?-o:t;VEG.tree(x,0,z,c%3,rr(6,15));}
 // rehabilitated: fish pens in the lagoon, between the ring blocks and the quay
 if(d===3)for(let c=0;c<14;c++){const s=c%4,t=rr(-HL+80,HL-80),o=rr(OR+90,HL-30),x=s===0?o:s===1?-o:t,z=s===2?o:s===3?-o:t;
  if(Math.abs(t)<30)continue;const w=rr(16,30);
  for(const q of[[0,w/2,1],[0,-w/2,1],[w/2,0,0],[-w/2,0,0]])kput('plank',[x+q[0],WL+.35,z+q[1]],q[2]?null:qEuler(0,Math.PI/2,0),[w,.5,1.4],null);}

 // ---- the lagoon and its quay (sibling group W) -----------------------------------
 mesh(gridSurface((u,v)=>[lerp(-HL,HL,u),WL,lerp(-HL,HL,v)],16,16,{uS:HL/40,vS:HL/40}),d===0?MAT.shzSea:RH?MAT.shzSeaH:MAT.shzSeaR,W);
 {const QC=[],QT=[];
  const strip=(o0,o1,y0,y1,arr)=>{for(let s=0;s<4;s++)arr.push(gridSurface((u,v)=>{const o=lerp(o0,o1,v),y=lerp(y0,y1,v),t=lerp(-o,o,u);
    return s===0?[o,y,t]:s===1?[-o,y,-t]:s===2?[-t,y,o]:[t,y,-o];},24,1,{uS:o0/4,vS:Math.max(1,Math.abs(o1-o0)/8)}));};
  strip(HL-2,HL,0,6.5,QC);strip(HL,HL+24,6.5,6.5,QC);strip(HL+24,HL+70,6.5,0,QT);
  meshMerged(QC,dd?MAT.concreteR:MAT.concrete,W);meshMerged(QT,dd?MAT.turfR:MAT.turf,W);}
 for(let s=0;s<4;s++)for(let t=-HL+20;t<HL;t+=40){if(Math.abs(t)<20)continue;
  const p=s===0?[HL+12,6.5,t]:s===1?[-HL-12,6.5,t]:s===2?[t,6.5,HL+12]:[t,6.5,-HL-12];
  kput(dd?'postR':'postW',[p[0],p[1]+2,p[2]],null,[.35,4,.35],null);
  if(d!==1)kput('dot',[p[0],p[1]+4.2,p[2]],null,[.8,.8,.8],d===0?CYAN:WARM);}

 meshMerged(BK.fac,FACM,G);meshMerged(BK.pod,PODM,G);meshMerged(BK.roof,ROOFM,G);meshMerged(BK.head,HEADM,G);meshMerged(BK.core,MAT.dark,G);
 // human scale: on the quay at the head of two causeways
 figures(HL+96,26,7,14);figures(-26,HL+96,6,14);
 SHZ_SITE[d]={N,A,H,YB,RT,RN,B2,YTOP,WL,HL,OR,CC,RC,HUNG,INCL,FALL};
 KOFF=[0,0,0];return G;}
