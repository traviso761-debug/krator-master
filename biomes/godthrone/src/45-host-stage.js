// ================================================================= HOST — stage (station 1: the summit vent)
// The ideal-type host for THE GODTHRONE's summit (PLAN.md sections 1-4, station 1): renderer, the caldera as DATA (its
// floor, its terraced wall, the nested pit, the vent), the rock as KSTRATA's tibasalt, the ground baked once into KFIELD,
// the fields the kit asks for (the glass halo, its orange share, the scarps' talus, the hollows), BIO.init. The biome
// fragments read nothing from here except through BIO.host.
//
// HEIGHTS ARE TRUE: y is metres above Krator's datum (the scale model's 4.23 summit: the caldera floor ~22,000 m, the pit
// 900 m deeper, the rim at 25,000 m), so the thin-air sky (89-host-sky.js), the strata's alteration line and the hazards'
// pressure read the page's y as they are.
//
// THE MAP (x east, z south; a 9.6 km square, origin mid-map). One axis does the work: s runs NORTH-EAST, from the caldera's
// centre (31 km south-west, off the map) out toward its rim; t runs across it (south-east). On 4.23 the summit vent sits on
// the nested pit's floor 7 km east and 6 km north of the caldera's centre, and the nearest stretch of the main wall stands
// north-east of it; the map is that line, COMPRESSED (an ideal type, as every station's: PLAN.md section 10's questions):
//   THE PIT        a collapse pit 900 m deep (4.23's PIT_DEPTH), its floor a frozen lava lake ~1.75 km across, its wall
//                  three scarps of stacked flows with two benches between them
//   THE VENT       on the pit's floor: a fissure 1.1 km long, the spatter rampart either side of its crack, a cinder-and-spatter
//                  cone over the vent (fuming; a lava throat in its crater) and two smaller cones along the fissure
//   THE FLOOR      the caldera's floor at ~22 km, a lava plain with low wrinkle ridges, mantled by the glass halo
//   THE WALL       the main caldera wall, ~3 km of stacked titanium-basalt flows in six collapse terraces (a scarp and a
//                  back-tilted bench each, talus at every scarp's foot), its rim at 25,000 m, the outer flank beyond
//   THE PORTAL     the Ancients' sealed portal on the rim (PLAN.md section 6: the settlement plan dresses it)
const {TAU,clamp,lerp,mix,smooth,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
const WORLD=0x60D7;   // the page's world seed: every draw is KRAND.hash(WORLD, cell, index, salt)
const KR=KRAND,vn=(x,z,sd)=>KR.vnoise(x,0,z,sd),fb=(x,z,o,sd)=>KR.fbm(x,0,z,o,sd);

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// the air at 21-25 km is a tenth of an atmosphere: the shared sky's thin end (89-host-sky.js) takes the fog to nothing; the
// fog here is only its starting value. The far plane reaches across the caldera (its far rim is ~65 km off) and the shield
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x1c1d24,.000002);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1.5,160000);
const hemi=new THREE.HemisphereLight(0x8a90a4,0x2a2622,.35);scene.add(hemi);
const SUN_POS=[1100,1500,700];   // a starting sun; the shared sky moves it to the hour's
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);

// ---------------------------------------------------------------- the frame
const TERR={R:4800,X0:-4800,X1:4800,Z0:-4800,Z1:4800};
const SQ=Math.SQRT1_2;
const sOf=(x,z)=>(x-z)*SQ, tOf=(x,z)=>(x+z)*SQ, xzOf=(s,t)=>[(s+t)*SQ,(t-s)*SQ];
// THE CALDERA: its centre on the axis, 31 km south-west; the main wall's foot ~31.9 km from it (4.23: the rim at 36 +- 3.5 km,
// the wall's run 9 km on the raster, here the wall as the scarps it stands for: PLAN.md section 4)
const CALD={sC:-31000,tC:0,foot:31900,yFoot:22000,rimY:25000};
// the main wall's collapse terraces, foot to rim: each a scarp (h m at ang degrees) and the bench behind its lip (w m wide,
// tilted back tilt m toward the next scarp's foot: the collapse blocks rotated as they slid). Heights scaled so the rim is
// at CALD.rimY exactly
const TER_MAIN=(function(){const S=[{h:430,ang:63},{h:360,ang:58},{h:560,ang:66},{h:300,ang:55},{h:640,ang:64},{h:630,ang:61}],B=[{w:330,tilt:14},{w:470,tilt:22},{w:260,tilt:10},{w:520,tilt:26},{w:380,tilt:16}];
 const need=CALD.rimY-CALD.yFoot+B.reduce((a,b)=>a+b.tilt,0),k=need/S.reduce((a,s)=>a+s.h,0);S.forEach(s=>{s.h*=k;s.run=s.h/Math.tan(s.ang*Math.PI/180);});
 return{S,B,rise:CALD.rimY-CALD.yFoot};})();
// THE PIT: centred on the summit vent, 900 m deep (4.23), its wall three scarps from its floor (radius PIT.floorR) out
const PIT=(function(){const s=-3000,t=-250,p=xzOf(s,t);const S=[{h:340,ang:60},{h:260,ang:56},{h:330,ang:62}],B=[{w:210,tilt:10},{w:170,tilt:8}];
 const need=900+B.reduce((a,b)=>a+b.tilt,0),k=need/S.reduce((a,q)=>a+q.h,0);S.forEach(q=>{q.h*=k;q.run=q.h/Math.tan(q.ang*Math.PI/180);});
 const rim=1750+S.reduce((a,q)=>a+q.run,0)+B.reduce((a,b)=>a+b.w,0);
 return{s,t,x:p[0],z:p[1],floorR:1750,depth:900,S,B,rise:900,rimR:rim,name:'The nested pit (900 m deep; its floor a frozen lava lake)'};})();
// a terraced profile: ascending from d=0 (the first scarp's foot), the scarps and benches of T, each scarp's start moved by
// wob(i) m; returns {y (metres above the foot), i (the scarp or bench index), u (0..1 across it), face (0..1: on a scarp's
// face), foot (the next scarp's foot, d), lip} into o
function terraces(T,d,wob,o,hk){let a=0,y=0;const S=T.S,B=T.B,n=S.length;o.face=0;o.toFoot=Infinity;o.scarp=-1;o.onScarp=false;o.over=0;
 for(let i=0;i<n;i++){const sc=S[i],a0=a+wob(i);let h=sc.h,run=sc.run;
  /* hk(i): this scarp's height here, as a share of its own (the terraces vary along the wall); the last one takes what is left
     to the top (T.rise), so the rim keeps its height */
  if(hk){if(i<n-1){const m=hk(i);h*=m;run*=m;}else{h=Math.max(sc.h*.35,T.rise-y);run=h/Math.tan(sc.ang*Math.PI/180);}}
  o.h=h;
  if(d<a0){o.y=y;o.yBase=y;o.toFoot=a0-d;o.scarp=i;o.u=0;return o;}   // on the floor or the bench before this scarp
  if(d<a0+run){const u=(d-a0)/run,e=mix(u,u*u*(3-2*u),.6);o.y=y+h*e;o.yBase=y;o.into=d-a0;o.face=4*u*(1-u);o.u=u;o.scarp=i;o.onScarp=true;return o;}
  y+=h;a=a0+run-wob(i);
  if(i<B.length){const b=B[i],nx=a+b.w;if(d<nx+wob(i+1)){const u=clamp((d-a-wob(i))/(b.w+wob(i+1)-wob(i)),0,1);o.y=y-b.tilt*u;o.yBase=o.y;o.toFoot=nx+wob(i+1)-d;o.scarp=i+1;o.u=u;o.onScarp=false;return o;}
   y-=b.tilt;a=nx;}}
 o.y=y;o.over=d-a-wob(n-1);o.scarp=n;o.onScarp=false;o.u=0;return o;}
const _tm={},_tp={};
// the main floor: the caldera's floor rises ~150 m to its centre (4.23); a lava plain with low wrinkle ridges and flow lobes
function floorH(x,z,rho){const r=1-Math.abs(fb(x*.0021+3.1,z*.0021-1.7,3,WORLD+1)*2-1);
 return CALD.yFoot+150*clamp(1-rho/CALD.foot,0,1)+9*r*r+6*(fb(x*.0007,z*.0007,2,WORLD+2)-.5)+1.6*(vn(x*.035,z*.035,WORLD+3)-.5);}
// the main wall at (x,z): its arc coordinate (m along the wall), its terraces wandering independently along it, gullies
// fluting each scarp's face; past the rim the crest rounds over and the outer flank falls away at 6.5% (4.23's shield)
function wallAt(x,z,o){const s=sOf(x,z),t=tOf(x,z),ds=s-CALD.sC,rho=Math.hypot(ds,t),arc=CALD.foot*Math.atan2(t,ds);
 const foot=CALD.foot+180*(fb(arc*.00045,7.3,2,WORLD+4)-.5);o.rho=rho;o.arc=arc;o.d=rho-foot;
 /* the lips wander at two scales (spurs and bays a few hundred metres across, then tens), each scarp's height swings +-30%
    along the wall (the last one makes up the rim), and gullies flute every face */
 const dw=o.d+70*(fb(arc/260,o.d/400,2,WORLD+13)-.5)*2+22*(vn(arc/55,o.d/90,WORLD+14)-.5)*2;
 if(dw<-60){o.y=0;o.yBase=0;o.face=0;o.scarp=0;o.toFoot=-dw;o.onScarp=false;o.over=-1;o.dw=dw;return o;}
 o.dw=dw;terraces(TER_MAIN,dw,i=>i===0?0:100*(fb(arc*.0011+i*7.7,i*3.1,2,WORLD+5)-.5)*2,o,i=>1+.32*(fb(arc*.0008+i*4.1,i*1.7,2,WORLD+15)-.5)*2);
 if(o.onScarp){const g=1-Math.abs(fb(arc/150+.35*o.u,o.scarp*5.3,2,WORLD+6)*2-1);o.y-=o.h*.15*o.face*g*g*g;}
 else if(o.scarp>0&&o.scarp<TER_MAIN.S.length&&dw>0){const k=Math.min(1,o.u*6,(1-o.u)*6);o.y+=k*22*(fb(x*.0065,z*.0065,2,WORLD+16)-.45);}   /* the benches: slumped, hummocky */
 if(o.scarp===TER_MAIN.S.length){const ov=o.over;o.y-=.065*ov+8*(1-Math.exp(-ov/40));}   /* the crest rounds over, then the outer flank */
 return o;}
// the pit's depth below the main floor at (x,z): 900 m inside its floor's ring, stepping up its three scarps to 0 at its rim
function pitAt(x,z,o){const dx=x-PIT.x,dz=z-PIT.z,q=Math.hypot(dx,dz),ph=Math.atan2(dz,dx);
 const qq=q*(1+.035*(fb(Math.cos(ph)*1.7+5,Math.sin(ph)*1.7,2,WORLD+7)-.5));o.q=qq;o.d=qq-PIT.floorR;
 const arc=PIT.floorR*ph,dw=o.d+30*(fb(arc/150,o.d/200,2,WORLD+17)-.5)*2;o.dw=dw;
 if(dw<0){o.y=0;o.yBase=0;o.depth=PIT.depth;o.face=0;o.onScarp=false;o.toFoot=-dw;o.scarp=0;o.inside=true;return o;}
 terraces(PIT,dw,i=>i===0?0:55*(fb(arc*.003+i*9.1,i,2,WORLD+8)-.5)*2,o,i=>1+.3*(fb(arc*.002+i*3.3,i*2.1,2,WORLD+18)-.5)*2);
 if(o.onScarp){const g=1-Math.abs(fb(arc/80+.3*o.u,o.scarp*3.7,2,WORLD+9)*2-1);o.y-=o.h*.12*o.face*g*g*g;}
 o.depth=o.scarp>=PIT.S.length?0:Math.max(0,PIT.rise-o.y);o.inside=o.scarp<PIT.S.length;return o;}

// ---------------------------------------------------------------- the vent
// A fissure on the pit's floor (along FISS.dir, from FISS.a to FISS.b m about the vent), the spatter rampart either side of
// its crack, and three cones on it: the vent's own (its crater, and in it the throat where the lava stands) and two smaller
const FISS=(function(){const a=.55,d=[Math.cos(a),Math.sin(a)];return{dir:d,a:-620,b:520,name:'The summit vent\'s fissure (fuming; its crack hot)'};})();
const fissPt=u=>xzOf(PIT.s+FISS.dir[0]*u,PIT.t+FISS.dir[1]*u);
const CONES=[{u:0,h:46,r:150,crater:.44,cd:34,throat:24,main:true,name:'The summit vent (its cone; a lava throat in its crater, fuming)'},
 {u:-380,h:18,r:72,crater:.4,cd:11,name:'A spatter cone on the fissure'},{u:330,h:25,r:88,crater:.42,cd:15,name:'A spatter cone on the fissure'}]
 .map(C=>{const p=fissPt(C.u);return Object.assign(C,{x:p[0],z:p[1]});});
function fissAt(x,z){const s=sOf(x,z)-PIT.s,t=tOf(x,z)-PIT.t,u=s*FISS.dir[0]+t*FISS.dir[1],l=-s*FISS.dir[1]+t*FISS.dir[0];
 if(u<FISS.a-80||u>FISS.b+80)return{h:0,k:0,crack:0,u,l};
 const e=smooth(FISS.a-80,FISS.a+60,u)*smooth(FISS.b+80,FISS.b-60,u),a=Math.abs(l-4*Math.sin(u*.011));
 return{h:e*(10*Math.exp(-Math.pow((a-13)/8,2))-3*smooth(5,1.5,a)),k:e*smooth(34,14,a),crack:e*smooth(4.5,1.5,a),u,l};}
function coneAt(x,z){let h=0,k=0,throat=0,C0=null;for(const C of CONES){const d=Math.hypot(x-C.x,z-C.z)/C.r;if(d>1.5)continue;
 const hh=C.h*Math.pow(smooth(1.05,C.crater*.95,d),1.1)-C.cd*smooth(C.crater*1.02,C.crater*.2,d);if(hh>h){h=hh;C0=C;}k=Math.max(k,smooth(1.3,.85,d));
 if(C.throat){const dt=Math.hypot(x-C.x,z-C.z);throat=Math.max(throat,smooth(C.throat*1.25,C.throat*.7,dt));}}
 return{h,k,throat,C:C0};}
const VENT=CONES[0];VENT.lavaY=0;   // the throat's lava level, set once the ground is baked (88-host-build.js reads it)

// ---------------------------------------------------------------- the rock (KSTRATA, the tibasalt recipe; PLAN.md section 3)
// Thin black flows with an ilmenite sheen, orange and black glass-bead horizons between eruptions, rubbly flow tops; the
// alteration line (the bead beds to palagonite) is the dry-cold line, 8,500 m (the recipe's default): far below everything
// here, so the summit's beds are fresh. The beds dip gently away from the caldera's centre (the shield's own flows)
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,0,0x57A7),formations:[{recipe:'tibasalt'}],range:[20600,25400],
 dip:[-SQ,SQ,.004],warp:[6,1.6],wash:{m:2},regolith:.35,dust:0x2a2624});

// ---------------------------------------------------------------- the ground (baked once: KFIELD)
// baseH: the closure (the floor, the wall, the pit, the vent, the talus at every scarp's foot); then the ledge pass on the
// lattice's own gradient (each flow a ledge, the bead beds recessed: KSTRATA.ledge), then the field. terrainH reads the
// field inside the map, the closure past it (the far field's, 82-host-sky.js). The ground mesh's vertices are the field's
// grid points (84-host-ground.js), so what is planted on the field stands on the ground as drawn.
const TALUS_MAIN=TER_MAIN.S.map((sc,i)=>KRELIEF.talus({footD:(x,z)=>{const o=wallAt(x,z,_tm);return o.scarp===i?(o.onScarp?-o.into:o.toFoot):Infinity;},h:Math.min(70,sc.h*.11),reach:Math.min(220,sc.h*.36),seed:KR.hash(WORLD,1,i,0x7A1)}));
const TALUS_PIT=PIT.S.map((sc,i)=>KRELIEF.talus({footD:(x,z)=>{const o=pitAt(x,z,_tp);return o.scarp===i&&o.inside?(o.onScarp?-o.into:o.toFoot):Infinity;},h:Math.min(45,sc.h*.1),reach:Math.min(120,sc.h*.33),seed:KR.hash(WORLD,2,i,0x7A2)}));
const _w={},_p={};
function baseH(x,z){const W=wallAt(x,z,_w),n=TER_MAIN.S.length;let wy=W.y;
 /* the talus banks against each scarp's foot: the ground is the higher of the scarp and the apron (the wall goes down into it) */
 if(W.scarp<n&&(W.onScarp||W.toFoot<240))wy=Math.max(W.y,W.yBase+TALUS_MAIN[W.scarp](x,z));
 const fl=floorH(x,z,W.rho);let y=CALD.yFoot+wy+smooth(260,0,W.dw)*(fl-CALD.yFoot);   // the floor's own relief fades into the wall's foot
 const P=pitAt(x,z,_p);
 if(P.depth>0){let py=P.y;if(P.inside&&(P.onScarp||P.toFoot<140))py=Math.max(P.y,P.yBase+TALUS_PIT[P.scarp](x,z));
  y-=Math.max(0,PIT.rise-py);
  y-=(fl-CALD.yFoot)*.6*smooth(0,-150,P.d);   /* the pit's floor is a frozen lava lake: flatter than the plain above */
  if(P.d<0){const F=fissAt(x,z),C=coneAt(x,z);y+=Math.max(F.h,C.h)-30*C.throat;}}   /* the throat: a shaft 30 m down in the crater's floor */
 return y;}
const FIELD_STEP=10;
// the ground on a lattice: baseH at every point, then the ledge pass on the lattice's own gradient. edge(x,z): a height for
// the lattice's border (an inset takes the base field's there, so its seam with the base mesh is watertight)
function bakeGrid(x0,z0,st,nx,nz,edge){const B=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)B[j*nx+i]=baseH(x0+i*st,z0+j*st);
 const H=new Float32Array(nx*nz),at=(i,j)=>B[clamp(j,0,nz-1)*nx+clamp(i,0,nx-1)];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*st,z=z0+j*st;
  if(edge&&(i===0||j===0||i===nx-1||j===nz-1)){H[j*nx+i]=edge(x,z);continue;}
  const gx=(at(i+1,j)-at(i-1,j))/(2*st),gz=(at(i,j+1)-at(i,j-1))/(2*st);
  H[j*nx+i]=STRATA.ledge(x,z,B[j*nx+i],Math.hypot(gx,gz),{k:.55,bench:2});}
 return H;}
// THE VENT'S INSET: the cone, its crater and its throat at 2.5 m (the base lattice's 10 m cannot draw a 24 m shaft); the box
// on the base lattice's lines, its border on the base field (KFIELD insets; 84-host-ground.js draws it as its own mesh and
// leaves the base mesh's cells under it out)
const INSET=(function(){const st=2.5,r=230,sn=v=>Math.round(v/FIELD_STEP)*FIELD_STEP,x0=sn(VENT.x-r),z0=sn(VENT.z-r),x1=sn(VENT.x+r),z1=sn(VENT.z+r);
 return{st,box:[x0,z0,x1,z1],nx:Math.round((x1-x0)/st)+1,nz:Math.round((z1-z0)/st)+1};})();
const GROUND_F=(function(){const t0=performance.now(),st=FIELD_STEP,nx=Math.round((TERR.X1-TERR.X0)/st)+1,nz=Math.round((TERR.Z1-TERR.Z0)/st)+1;
 const F=KFIELD.create({x0:TERR.X0,z0:TERR.Z0,step:st,nx,nz,heights:bakeGrid(TERR.X0,TERR.Z0,st,nx,nz,null),name:'godthrone-summit'});
 const I=INSET,G=KFIELD.create({x0:I.box[0],z0:I.box[1],step:I.st,nx:I.nx,nz:I.nz,heights:bakeGrid(I.box[0],I.box[1],I.st,I.nx,I.nz,(x,z)=>F.h(x,z)),name:'godthrone-vent'});
 F.addInset(G);I.field=G;
 window._fieldMs=Math.round(performance.now()-t0);return F;})();
const inMap=(x,z)=>x>=TERR.X0&&x<=TERR.X1&&z>=TERR.Z0&&z<=TERR.Z1;
function terrainH(x,z){return inMap(x,z)?GROUND_F.h(x,z):baseH(x,z);}
function slopeAt(x,z){const n=GROUND_F.normal(x,z);return Math.sqrt(Math.max(0,1-n[1]*n[1]))/Math.max(.05,n[1]);}
{const C=VENT,base=terrainH(C.x+C.r*1.2,C.z);C.base=base;C.lavaY=terrainH(C.x,C.z)+6;C.top=base+C.h;}   /* the lava stands 6 m deep in the throat's bottom */

// ---------------------------------------------------------------- the fields (cached on a 20 m lattice)
// halo     the glass halo's mantle (0..1: its thickness), thickest near the vent and in the hollows, none on a steep face
// orange   the orange share of its beads (quenched glass; black where the crystallised beads dominate), banded where
//          eruptions alternated (PLAN.md section 4)
// talus    the aprons at the scarps' feet; rampart the spatter rampart and the cones; hollow the ground's dips (the drifts,
//          the Pele's hair); vent 0..1 near the vent (sublimates, fumes); frost hoarfrost on shaded north faces
const FC=(function(){const N=481,SX=TERR.X1-TERR.X0,st=SX/(N-1),K=['h','slope','halo','orange','talus','rampart','hollow','vent','frost','north','face','glass'],a={};K.forEach(k=>a[k]=new Float32Array(N*N));
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH(TERR.X0+i*st,TERR.Z0+j*st);}
 const H=a.h,hb=new Float32Array(N*N),R=6;   // the hollows: the ground less its 120 m box blur
 {const tmp=new Float32Array(N*N);for(let j=0;j<N;j++){let s=0;for(let i=-R;i<=R;i++)s+=H[j*N+clamp(i,0,N-1)];for(let i=0;i<N;i++){tmp[j*N+i]=s/(2*R+1);s+=H[j*N+clamp(i+R+1,0,N-1)]-H[j*N+clamp(i-R,0,N-1)];}}
  for(let i=0;i<N;i++){let s=0;for(let j=-R;j<=R;j++)s+=tmp[clamp(j,0,N-1)*N+i];for(let j=0;j<N;j++){hb[j*N+i]=s/(2*R+1);s+=tmp[clamp(j+R+1,0,N-1)*N+i]-tmp[clamp(j-R,0,N-1)*N+i];}}}
 const o1={},o2={};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st;
  const hx=(H[j*N+Math.min(N-1,i+1)]-H[j*N+Math.max(0,i-1)])/(2*st),hz=(H[Math.min(N-1,j+1)*N+i]-H[Math.max(0,j-1)*N+i])/(2*st);
  const sl=Math.hypot(hx,hz);a.slope[k]=sl;a.north[k]=clamp(hz/.6,-1,1);   // >0: the ground rises southward, so it faces north
  const W=wallAt(x,z,o1),P=pitAt(x,z,o2),dV=Math.hypot(x-VENT.x,z-VENT.z),F=fissAt(x,z),C=coneAt(x,z);
  a.face[k]=Math.max(W.onScarp?W.face:0,P.onScarp&&P.depth>0?P.face:0);
  a.talus[k]=Math.max(!W.onScarp&&W.scarp<TER_MAIN.S.length?smooth(Math.min(220,(TER_MAIN.S[W.scarp]||{h:0}).h*.36),0,W.toFoot):0,
   P.inside&&!P.onScarp&&P.d>=0?smooth(Math.min(120,(PIT.S[P.scarp]||{h:0}).h*.33),0,P.toFoot):0);
  a.rampart[k]=Math.max(F.k,C.k);a.glass[k]=P.depth>0?smooth(40,-60,P.d):0;   /* the pit's floor: a frozen lava lake's glassy skin */
a.hollow[k]=clamp((hb[k]-H[k])/2.5,0,1);
  a.vent[k]=Math.max(smooth(900,60,dV),F.crack*.8);
  // the halo: tens of km round the vent (it reaches the rim), thicker near it, held in the hollows and on the benches,
  // shed by every steep face; its orange share falls from the vent outward, banded ring by ring
  const thick=.45+.55*Math.exp(-dV/2600)+.35*a.hollow[k];
  a.halo[k]=clamp(thick*smooth(.95,.45,sl)*(1-.7*a.rampart[k]),0,1);
  const band=fb(dV/260,Math.atan2(z-VENT.z,x-VENT.x)*1.1+dV/1900,2,WORLD+11),ring=smooth(.4,.68,band);
  a.orange[k]=clamp(.95*Math.exp(-dV/1500)+.4*ring*smooth(5200,900,dV)+.25*a.hollow[k]-.22,0,1);
  a.frost[k]=clamp(smooth(.15,.8,-a.north[k])*smooth(.35,1.2,sl)*(.35+.65*smooth(.45,.8,vn(x*.02,z*.02,WORLD+12))),0,1);}   /* hoarfrost on the shaded faces: at this site the noon sun stands north (the shared sky at px 577, 932), so they face south */
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SX*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at,st};})();
const FIELD={halo:(x,z)=>FC.at(FC.a.halo,x,z),orange:(x,z)=>FC.at(FC.a.orange,x,z),talus:(x,z)=>FC.at(FC.a.talus,x,z),rampart:(x,z)=>FC.at(FC.a.rampart,x,z),
 hollow:(x,z)=>FC.at(FC.a.hollow,x,z),glass:(x,z)=>FC.at(FC.a.glass,x,z),vent:(x,z)=>FC.at(FC.a.vent,x,z),frost:(x,z)=>FC.at(FC.a.frost,x,z),slope:(x,z)=>FC.at(FC.a.slope,x,z),face:(x,z)=>FC.at(FC.a.face,x,z),
 /* the core's own fields: nothing grows (no water, no air to speak of) */
 wet:()=>0,salt:()=>0,upland:()=>1,cold:()=>1,rock:(x,z)=>smooth(.6,1.2,FC.at(FC.a.slope,x,z))};
// THE AIR: the pressure by height (the model's law: 1.6 atm at the datum, a scale of 8 km; the sky's air.thin reads the same)
const AIR={p0:1.6,scale:8000,at:y=>1.6*Math.exp(-y/8000)};

// ---------------------------------------------------------------- the portal (PLAN.md section 6)
// The Ancients' tunnels from Pluton come out on the caldera's rim: a sealed portal, its face turned into the caldera. Its
// place on the rim is the settlement plan's (section 10); here it stands on this stretch of the rim, as a record first
const PORTAL=(function(){const t=1350,ds0=Math.sqrt(Math.pow(CALD.foot+TER_MAIN.S.reduce((a,q)=>a+q.run,0)+TER_MAIN.B.reduce((a,b)=>a+b.w,0),2)-t*t);
 /* the crest along the radial line through t: the highest ground within 300 m of the rim's nominal place, then 14 m out onto it */
 let best=-1e9,bs=0;for(let k=-60;k<=60;k++){const s=CALD.sC+ds0+k*5,p=xzOf(s,t),y=terrainH(p[0],p[1]);if(y>best){best=y;bs=s;}}
 const p=xzOf(bs+14,t),c=xzOf(CALD.sC,0),ry=Math.atan2(c[0]-p[0],c[1]-p[1]);   // its face toward the caldera's centre (local +z)
 return{x:p[0],z:p[1],y:terrainH(p[0],p[1]),ry,w:14,h:11,d:9,crest:best,name:'A sealed portal (the Ancients\' tunnels from Pluton come out here)',
  tags:{culture:'ancient',type:['infrastructure'],sealed:true,placeholder:'the Pluton settlement plan dresses it'}};})();

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[{x:PORTAL.x,z:PORTAL.z,r:24}];
// the LOD spine: the vent, the pit's rim, the floor, the wall's benches and the portal (the views' places)
const SPINE=[[VENT.x,VENT.z],xzOf(PIT.s+PIT.rimR,PIT.t),xzOf(PIT.s,PIT.t+PIT.rimR),xzOf(0,0),xzOf(1500,0),xzOf(2800,-900),[PORTAL.x,PORTAL.z]].map(p=>[Math.round(p[0]),Math.round(p[1])]);
BIO.init({tags:'godthrone',THREE:THREE,scene:scene,terrainH:terrainH,field:GROUND_F,placeH:baseH,waterH:()=>-1e9,
 mask:(x,z)=>{if(!inMap(x,z)||x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;
  if(Math.hypot(x-VENT.x,z-VENT.z)<VENT.throat*1.3)return 0;return 1;},
 obstacles:OBSTACLES,ticks:tick,seed:WORLD,register:REGISTER,
 origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
// GRAPHICS FROM DAY ONE (GRAPHIC-LOAD.md): the items welded and drawn by index; one LOD mesh per chunk, rows sorted by range,
// small meshes merged up to 1500 triangles; a dithered cross-fade over the last 15% of each range; every instance culled at
// its own range. ?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0 to compare (PERF.md)
{const Q=new URLSearchParams(location.search);
 BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
