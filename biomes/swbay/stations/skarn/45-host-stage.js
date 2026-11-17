// ================================================================= HOST — stage: showcase station 3, the Almua skarn-marble harbour cliffs
// (PLAN.md, "Showcase Station: Almua Skarn-Marble Harbour Cliffs"; openworld/GEOLOGY-STATIONS-5.1.md, row 3). The kit's own species,
// floor and fauna (src/50-75) on this station's stage, which replaces the bay's ideal-type host (src/45, 85-89, 99).
// THE SITE ON MAP 5.1 (today's ground, before Gemini's reshaping): the plan's spot, px 734,998, is 260 m up (-1,240 m) and 15 km
// inland on today's raster; the nearest shore to it is the Almua-Voth coast at px ~739.6,995 (the Ring Sea at -1,500.2 m), running
// NNW (az ~328) with the sea to the ENE. The page stands there (stations/skarn/region.json, biomes/godthrone/tools/region.py) and
// draws the plan's coast on it: its 180 m quarried cliffs are a sharpening of the raster's 2 km cells (KNOWN_ISSUES.md: the map change
// for the scale-model queue).
// THE FRAME: x east, z SOUTH, y up, metres; the origin is the eye's mole head; y 0 IS THE SEA (the plan's -1,499 m datum, the model's
// -1,500.2 m). Coast coordinates: a along the coast (NNW, +), b across it (+ inland, WSW).
//   the SHELF FORESHORE   SE of a ~260: the carbonate shelf (KSTRATA carbonate-shelf) a few metres over the sea, its front cut under
//                         by the tide into a visor (85-host-quarry.js draws the lip), the karst spring's pool on it spilling over
//   the COVE              a 260-700: the quarry harbour, its walls rising NW from the shelf into the marble
//   the HEADLAND          a 700-1100: the contact marble (KSTRATA contact-marble), a 34 m sea cliff to the harbour bench (-1,465 m),
//                         then the main cliff to ~214 m, quarry-stepped on its south flank (the face the eye looks at), its crown
//                         at ~240 m (-1,260 m) under the plateau's savannah
//   the MOLE              the ancient quarry mole the eye stands on (+12.3 m, the eye at +14 m), and the outer breakwater off the
//                         headland's tip (85-host-quarry.js); both are in terrainH (the walker and the probe stand on them), drawn as blocks
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
var SWBAY_BAY={hue:0.47};   /* the kit's bay colour (50 reads it before it loads): the sound's turquoise */
var SWBAY_TEMPLE_H=78;      /* the canopy ceiling on this windward coast (50: every canopy height follows): prism gums 59-78 m, baobabs 33-54 m */
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
const Q=new URLSearchParams(location.search);

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8d0d2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00009);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,60000);
const HEMI=new THREE.HemisphereLight(0xd0dadc,0x5a5444,.62);scene.add(HEMI);   /* the shared sky (89s-host-sky.js) sets it by the hour */
const SUN_POS=[1100,900,700];   /* the morning sun out over the sea (ENE); the sky moves it */
const sun=new THREE.DirectionalLight(0xfff2d8,1.45);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb4ccd0,.28);fill.position.set(-900,400,-700);scene.add(fill);

// ---------------------------------------------------------------- the frame and the coast
const WORLD=73998;   /* this station's seed: every draw below is KRAND's, hashed from it */
const SITE={px:739.6,py:995.0,plan:[734,998],seaAbs:-1500.19,datum:-1499};
const NZ=(x,z,f,seed,oct)=>KRAND.fbm(x*f+.31,.57,z*f-.13,oct==null?3:oct,seed)-.5;
const AZ_T=328*Math.PI/180,TV=[Math.sin(AZ_T),-Math.cos(AZ_T)],NV=[TV[1],-TV[0]];   /* along the coast (NNW) and across it (inland, WSW) */
const xzOf=(a,b)=>[a*TV[0]+b*NV[0],a*TV[1]+b*NV[1]],aOf=(x,z)=>x*TV[0]+z*TV[1],bOf=(x,z)=>x*NV[0]+z*NV[1];
// the shoreline, south-east to north-west, in (a, b), rounded twice (Chaikin): the SE shore, the mole's root, the shelf's front (the
// spring at a ~230), the cove, the headland's south flank and tip, its north side, the coast on toward Almua
const COAST=(function(){let P=[[-4600,105],[-2600,85],[-1500,65],[-800,95],[-480,115],[-300,128],[-210,112],[-150,82],[-110,64],[-40,56],[40,58],
  [110,63],[170,69],[230,78],[300,112],[370,182],[450,240],[540,262],[620,222],[690,135],[740,35],[790,-95],[850,-215],[920,-305],[990,-345],
  [1060,-325],[1120,-245],[1180,-125],[1260,-25],[1380,35],[1600,65],[2000,85],[2800,75],[4600,55]];
 for(let k=0;k<2;k++){const R=[P[0]];for(let i=0;i+1<P.length;i++){const p=P[i],q=P[i+1];R.push([.75*p[0]+.25*q[0],.75*p[1]+.25*q[1]],[.25*p[0]+.75*q[0],.25*p[1]+.75*q[1]]);}R.push(P[P.length-1]);P=R;}
 const C=P.map(p=>xzOf(p[0],p[1])),S=[];
 for(let i=0;i+1<C.length;i++){const ax=C[i][0],az=C[i][1],ex=C[i+1][0]-ax,ez=C[i+1][1]-az;
  S.push({ax,az,ex,ez,L2:ex*ex+ez*ez,x0:Math.min(ax,ax+ex),x1:Math.max(ax,ax+ex),z0:Math.min(az,az+ez),z1:Math.max(az,az+ez)});}
 return{ab:P,xz:C,seg:S};})();
// the signed distance to the shore, + inland (the side NV points to); each segment's box prunes it
function sdCoast(x,z){let best=1e18,sg=1;const S=COAST.seg;
 for(let i=0;i<S.length;i++){const s=S[i],bx=x<s.x0?s.x0-x:x>s.x1?x-s.x1:0,bz=z<s.z0?s.z0-z:z>s.z1?z-s.z1:0;if(bx*bx+bz*bz>=best)continue;
  let t=((x-s.ax)*s.ex+(z-s.az)*s.ez)/s.L2;t=t<0?0:t>1?1:t;const dx=x-s.ax-s.ex*t,dz=z-s.az-s.ez*t,d2=dx*dx+dz*dz;
  if(d2<best){best=d2;sg=dx*s.ez-dz*s.ex>=0?1:-1;}}
 return sg*Math.sqrt(best);}
// the map: TERR (5.2 km, the ground, the biome, the water) and NEAR (the cliffs and the foreshore the eye sees, at 2 m)
const TERR={X0:-2900,X1:2300,Z0:-3100,Z1:2100};TERR.R=(TERR.X1-TERR.X0)/2;
const CENTER=[(TERR.X0+TERR.X1)/2,(TERR.Z0+TERR.Z1)/2];
const NEAR={X0:-716,X1:260,Z0:-1284,Z1:260};   /* its edges on the 8 m lattice of TERR (45b draws the two as one ground) */
// the distance field, baked once on two lattices (2 m over NEAR, 8 m over TERR) and read bilinear; within 40 m of NEAR's edge the two blend
const SDF=(function(){const t0=performance.now();
 const bake=(X0,Z0,X1,Z1,st)=>{const nx=Math.round((X1-X0)/st),nz=Math.round((Z1-Z0)/st),A=new Float32Array((nx+1)*(nz+1));
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)A[j*(nx+1)+i]=sdCoast(X0+i*st,Z0+j*st);
  return{X0,Z0,st,nx,nz,A,at:(x,z)=>{const u=clamp((x-X0)/st,0,nx-1e-6),v=clamp((z-Z0)/st,0,nz-1e-6),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*(nx+1)+i;
   return (A[k]*(1-fu)+A[k+1]*fu)*(1-fv)+(A[k+nx+1]*(1-fu)+A[k+nx+2]*fu)*fv;}};};
 const N=bake(NEAR.X0,NEAR.Z0,NEAR.X1,NEAR.Z1,2),C=bake(TERR.X0,TERR.Z0,TERR.X1,TERR.Z1,8);
 window._sdfMs=Math.round(performance.now()-t0);
 return(x,z)=>{const e=Math.min(x-NEAR.X0,NEAR.X1-x,z-NEAR.Z0,NEAR.Z1-z);if(e<=0){return x<TERR.X0||x>TERR.X1||z<TERR.Z0||z>TERR.Z1?sdCoast(x,z):C.at(x,z);}
  const n=N.at(x,z);return e>=40?n:mix(C.at(x,z),n,e/40);};})();

// ---------------------------------------------------------------- the ground
// the marble's share by a (the contact facies NW of the cove's mouth, the shelf's SE of it), the quarry's stretch (the headland's south flank)
const marbleK=(x,z)=>smooth(250,470,aOf(x,z)+50*NZ(x,z,.003,11,2));
const quarryK=a=>smooth(680,730,a)*smooth(930,875,a);
const ALONG=(a,seed,f)=>KRAND.fbm(a*f+.17,seed*.013,.29,2,seed)-.5;   /* 1D noise along the coast */
const QSTEP={rise:15,tread:9,lip:4};   /* a 15 m bench face, battered over 4 m (two cells of the 2 m ground: a sharper step drew a sawtooth on the diagonal face), a 9 m tread, 5 m of it flat */
// the marble coast's profile at inland distance d: the deep sound, the 34 m sea cliff, the harbour bench, the main cliff (natural, or
// stepped where the quarry is), the crown, the plateau. The cliff's top wanders 200-226 m, its crown 26 m over it
function marbleH(d,a,x,z){
 if(d<0)return -2-26*smooth(0,22,-d)-22*smooth(40,500,-d);
 if(d<1.8)return -2+36*smooth(.2,1.8,d);
 const q=quarryK(a),wb=22+12*ALONG(a,21,.006)+20*q,d0=1.8+wb,top=213+14*ALONG(a,22,.004);
 if(d<d0)return 34+.015*(d-1.8)+.35*NZ(x,z,.21,23,2);
 const s=d-d0,run=20+8*ALONG(a,24,.008);
 // natural: a near-vertical face, its lower third battered out
 const nat=s<run?34+(top-34)*smooth(0,1,Math.pow(s/run,.85)):top;
 // the quarry: QSTEP.rise m risers, QSTEP.tread m treads, the lip of each a QSTEP.lip m round
 const nst=Math.round((top-34)/QSTEP.rise),k=Math.floor(s/QSTEP.tread),f=s-k*QSTEP.tread,qh=k>=nst?top:34+QSTEP.rise*(k+smooth(QSTEP.tread-QSTEP.lip,QSTEP.tread,f));
 const qrun=nst*QSTEP.tread,face=mix(nat,Math.min(qh,top),q),s1=s-mix(run,qrun,q);
 if(s1<0)return face;
 return top+26*smooth(0,45,s1)+30*smooth(40,1600,s1)+10*NZ(x,z,.0025,25,3)*smooth(0,80,s1);}
// the shelf's profile: a shallow bed, the notch floor under the visor, the shelf a few metres up, a low bluff, the rise inland
function shelfH(d,a,x,z){
 if(d<0)return -.5-6*smooth(0,60,-d)-24*smooth(60,700,-d);
 if(d<1.4)return .35;
 const top=3.8+.15*ALONG(a,31,.02);
 if(d<1.9)return mix(.35,top,smooth(1.4,1.9,d));
 return top+.006*(d-1.9)+.45*NZ(x,z,.09,32,2)*smooth(2,8,d)+36*smooth(240,310,d)+150*smooth(450,2300,d)+14*NZ(x,z,.002,33,3)*smooth(200,500,d);}
// the scale model's relief past the map (REGION, 45a5): the model's land as it is, its water cells as a sea floor 40 m down
const SEA_FLOOR=-40;
function regionY(x,z){if(typeof REGION==='undefined'||!REGION)return SEA_FLOOR;const y=REGION.y0+REGION.h(x,z)-SITE.seaAbs;return y>=2?y:mix(SEA_FLOOR,y,smooth(-1,2,y));}
function localH(x,z){const d=SDF(x,z),a=aOf(x,z),m=marbleK(x,z);
 const h=m<=0?shelfH(d,a,x,z):m>=1?marbleH(d,a,x,z):mix(shelfH(d,a,x,z),marbleH(d,a,x,z),m);
 // past ~1.9 km from the station's middle the ground eases onto the model's (the far ring then carries it on: 45b)
 const r=Math.max(Math.abs(x-CENTER[0]),Math.abs(z-CENTER[1])),k=smooth(1900,2580,r);
 return k<=0?h:mix(h,regionY(x,z),k);}
// THE KARST SPRING on the shelf (W.karstSpring, 89w): its pool 15 m in from the visor's lip at a 230, its bowl kept by the ground
const SPRING=(function(){const a=232;let lo=0,hi=300;for(let i=0;i<40;i++){const b=(lo+hi)/2,p=xzOf(a,b);if(SDF(p[0],p[1])<15)lo=b;else hi=b;}
 const p=xzOf(a,(lo+hi)/2);let l0=0,l1=300;for(let i=0;i<40;i++){const b=(l0+l1)/2,q=xzOf(a,b);if(SDF(q[0],q[1])<.2)l0=b;else l1=b;}
 const lip=xzOf(a,(l0+l1)/2);return{x:p[0],z:p[1],r:6.5,y0:null,lip,dir:[-NV[0],-NV[1]]};})();
function groundH(x,z){let h=localH(x,z);const S=SPRING,d=Math.hypot(x-S.x,z-S.z);
 if(d<S.r*1.6){if(S.y0==null)S.y0=localH(S.x,S.z);h=Math.min(h,mix(S.y0-1.4,h,smooth(S.r*.85,S.r*1.6,d)));}
 return h;}
// THE MASONRY in terrainH (85-host-quarry.js draws it): the mole, from the SE shore out north to the eye; the outer breakwater off the
// headland's tip. Each a stepped section: its tiers [half-width, top] from the crest down
const MOLE=(function(){let lo=0,hi=400;const a=-145;for(let i=0;i<40;i++){const b=(lo+hi)/2,p=xzOf(a,b);if(SDF(p[0],p[1])<10)lo=b;else hi=b;}
 const r=xzOf(a,(lo+hi)/2);return{name:'The quarry mole',a:[r[0],r[1]],b:[0,0],tiers:[[6,12.3],[9.5,8.4],[13,4.5],[16.5,.9]],round:true};})();
const BREAKWATER={name:'The outer breakwater',a:xzOf(975,-300),b:xzOf(790,-525),tiers:[[4,4.2],[7.5,1.3]],round:true};
const MASONRY=[MOLE,BREAKWATER];
MASONRY.forEach(M=>{const ex=M.b[0]-M.a[0],ez=M.b[1]-M.a[1];M.L=Math.hypot(ex,ez);M.u=[ex/M.L,ez/M.L];M.W=M.tiers[M.tiers.length-1][0];});
function masonryAt(x,z){let best=-1e9,hit=null;for(const M of MASONRY){const px=x-M.a[0],pz=z-M.a[1],t=px*M.u[0]+pz*M.u[1];if(t<-M.W||t>M.L+M.W)continue;
  const c=t>M.L?Math.hypot(x-M.b[0],z-M.b[1]):Math.abs(px*M.u[1]-pz*M.u[0]);if(t<0||c>M.W)continue;
  for(const T of M.tiers)if(c<=T[0]){if(T[1]>best){best=T[1];hit=M;}break;}}
 return hit?{y:best,M:hit}:null;}
function terrainH(x,z){const h=groundH(x,z),m=masonryAt(x,z);return m&&m.y>h?m.y:h;}
const waterH=()=>0;
// the slope of the drawn ground at a point (the mask, the fields, the checks): the largest of the two central differences at r m
function slopeAt(x,z,r){r=r==null?1.5:r;return Math.max(Math.abs(groundH(x+r,z)-groundH(x-r,z)),Math.abs(groundH(x,z+r)-groundH(x,z-r)))/(2*r);}

// ---------------------------------------------------------------- the climate fields the biome asks for (upland, wet, salt, flow)
// Csb at 1.92 atm: a dry summer, the sea's air on the crown. upland by height (.2 at the sea, .57 on the crown at 240 m: the bay's savannah
// up there, gate baobabs and monkey puzzles); wet .36 on the coast, more in the cove's shelter, the spring's ground soaked; salt in the spray
const springK=(x,z)=>smooth(46,8,Math.hypot(x-SPRING.x,z-SPRING.z));
const FIELD={
 upland:(x,z)=>clamp(.2+groundH(x,z)/650,0,1),
 wet:(x,z)=>{const a=aOf(x,z),cove=smooth(280,420,a)*smooth(760,640,a);return clamp(.36+.14*cove+.5*springK(x,z)+.08*NZ(x,z,.004,41,2),0,1);},
 salt:(x,z)=>{const h=groundH(x,z);return clamp(.4*smooth(9,1.5,h)*smooth(-2,4,h),0,1);},
 flow:(x,z)=>{const S=SPRING,lx=S.lip[0]-S.x,lz=S.lip[1]-S.z,L=Math.hypot(lx,lz),t=clamp(((x-S.x)*lx+(z-S.z)*lz)/(L*L),0,1),d=Math.hypot(x-S.x-lx*t,z-S.z-lz*t);return smooth(9,2,d);}};

