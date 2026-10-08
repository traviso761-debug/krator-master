// ================================================================= HOST — stage
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('sedesert',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// The ideal-type host for the EASTERN HIGH DESERT: everything a world provides
// that a biome does not. Renderer, lights, the dust haze, the desert terrain
// with terrainH(), the local water surface waterH() (a river that DESCENDS,
// and a pond at its own level), the climate fields the biome asks for, the
// river ribbon + the pond + the cataract, the painted ground, the tick list,
// the error panel. A real world replaces this whole section with its own;
// the biome fragments never read anything from it except through BIO.host.
//
// THE MAP (x east, z south, origin at the map's centre, R 3400):
//   x < -2250          the INNER WALL mountains rise (900 m at the edge)
//   |z| > ~2000        the TRACKLESS RED DESERT: dune fields, nothing roots
//   the main body      red desert: scrub, badland patches, mesas, the odd butte
//   z ~ zR(x)          THE RIVER, west to east, in a shallow canyon 30 m deep and
//                      ~250 m wide: the linear oasis; the walls step in two benches
//   (720,1180) r 620   THE BUTTE south of the river; a pond in a hollow on its
//                      north-western foot (260,700): the rain-shadow oasis
//   x > 3130           THE ABYSS: the plateau ends in a cliff; the river leaves
//                      through its notch as a cataract 700 m high, off a sheer
//                      promontory undercut by a cave behind the curtain (LIP)
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
// THE WATER COLOUR. One hue (the wadi pools' teal-green), set by the host
// before the biome loads: the river, the pond, the reed stands' accents and
// the alien candles' tips all derive from it (see 50-species).
var SEDESERT_WATER={hue:0.42};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
// is (x,y,z) inside a registered volume (a cylinder, with a little slop above and below)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd9c3a6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.000135);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xc8d4e4,0x6a4030,.58));
const sun=new THREE.DirectionalLight(0xfff2dc,1.55);sun.position.set(-1000,1150,-560);scene.add(sun);
const fill=new THREE.DirectionalLight(0xd8b8a0,.22);fill.position.set(900,300,900);scene.add(fill);

// ---------------------------------------------------------------- the river, the canyon, the butte, the mesas
const TERR={R:3400,RIM:3130};
// the river's centreline (z of the line at x) and the canyon's half-width
function zR(x){return 210*Math.sin(x*.00074+.6)+90*Math.sin(x*.0021-1.1)+35*Math.sin(x*.0061);}
function Wc(x){return (120+45*Math.sin(x*.0017+2)+22*Math.sin(x*.0053))*(1-.45*smooth(-2200,-2900,x));}   // a gorge in the mountains
// the canyon's depth: 32 m on the plateau, deeper into the mountain gorge
function Dc(x){return 32+55*smooth(-2200,-3000,x);}
// the canyon's profile: u = distance from the line in half-widths; wallK 1 on the floor,
// two stepped benches down each wall, 0 at the rim and beyond
function canyonU(x,z){return Math.abs(z-zR(x))/Wc(x);}
function wallK(u){return u<1.6?.55*smooth(1.0,.8,u)+.45*smooth(.72,.5,u):0;}
// the Abyss: 0 on the plateau, 1 past the cliff's edge (the edge wobbles with z)
function abyssK(x,z){return smooth(3130,3260,x+60*Math.sin(z*.003)+20*Math.sin(z*.011));}
// THE LIP: the canyon floor runs out over the Abyss as a sheer promontory to where the
// cataract leaves it (the Abyss face is ~8:1 here, too shallow for water to clear it from
// the plateau's own edge), and the promontory's face is undercut by a cave behind the
// curtain (a carve patch, core/terrain/36-core-carve). lipD: signed distance to its plan.
const LIP={x:TERR.RIM+34,back:3060,hw:52,r:18,floorY:-70};LIP.z=zR(LIP.x);
function lipD(x,z){const cx=(LIP.back+LIP.x)/2,ex=(LIP.x-LIP.back)/2,qx=Math.abs(x-cx)-ex+LIP.r,qz=Math.abs(z-LIP.z)-LIP.hw+LIP.r;
 return Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-LIP.r+1.6+.8*Math.sin(z*.13)+.6*Math.sin(x*.21+z*.07);}   // the front 1-3 m behind the fall's start
// where the world's one structure stands: on the canyon's north rim, back from the edge
const TOWER={x:1450,z:0};
const POND={x:230,z:640,r:110};
const BUTTE={x:720,z:1180,r:620,h:135};
// the Wile E. Coyote furniture: [x,z,r,h]
const MESAS=[[BUTTE.x,BUTTE.z,BUTTE.r,BUTTE.h],[-1500,-1300,260,90],[-650,1950,180,60],[1950,-950,320,110],[2500,1450,200,75],[-1100,850,150,45],[1350,2250,240,70],[2150,-2100,300,85],[-2000,-1900,220,65],[1900,300,120,40],[-450,-1700,140,50]];
function mesaH(x,z){let h=0;for(let i=0;i<MESAS.length;i++){const M=MESAS[i],dx=x-M[0],dz=z-M[1],d=Math.hypot(dx,dz);if(d>M[2]*1.5)continue;
 const a=Math.atan2(dz,dx),e=M[2]*(1+.07*Math.sin(3*a+i)+.045*Math.sin(7*a+2*i)+.03*Math.sin(13*a)),u=d/e;
 h+=M[3]*(.82*smooth(1.0,.9,u)+.18*smooth(1.22,.96,u))+(i===0?4*Math.sin(x*.01)*Math.sin(z*.013):0)*smooth(1,.8,u);}return h;}
function mtnX(x,z){return x+140*Math.sin(z*.0013)+50*Math.sin(z*.0041);}
function mtnH(x,z){const xe=mtnX(x,z),m=smooth(-2250,-3700,xe);if(m<=0&&xe>-2050)return 0;
 return 900*Math.pow(m,1.5)+(fbm(x*.0016,z*.0016,44,3)-.5)*260*smooth(-2100,-2700,xe)+40*(fbm(x*.006,z*.006,45,2)-.5)*smooth(-2150,-2500,xe);}
function badK(x,z){return smooth(.56,.68,fbm(x*.0009+9,z*.0009+4,61,2));}
function duneK(x,z){return smooth(1900,2500,Math.abs(z))*(1-smooth(2900,3200,x));}
function pondD(x,z){const dx=x-POND.x,dz=z-POND.z,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)*(1+.12*Math.sin(3*a+1)+.06*Math.sin(5*a));}
function trend(x){return 40-.0045*x;}
// the canyon floor's height at x (flat across the floor; the water sits 1.2 m under it)
function floorC(x){const zr=zR(x);return trend(x)+mtnH(x,zr)-Dc(x);}
function WL(x){return floorC(x)-1.2;}
// ---------------------------------------------------------------- terrain
// THE GROUND IS A BAKED FIELD (core/terrain/30-core-field.js, since 2026-10-08): terrainH0 below is the closure that
// paints it, once, at load (TFIELD, after the carve patch is declared); terrainH and everything that roots, walks or
// draws reads the field, and BIO.export hands it to Godot as the ground's `field`. The base grid is half the ground
// mesh's cell (17.8 m / 2), so every ground vertex is a grid point; the lip's window, where the mesh splits each cell
// 12 ways, is an inset at that finer step. Between grid points the field is bilinear (KNOWN_ISSUES.md: the error).
function terrainH(x,z){return TFIELD.h(x,z);}
// placeH: the closure, for the placement DECISIONS only (the mask's water depth, BIO.depth, the field cache's slope), so
// every plant keeps its place and takes only the field's height; the reseeding event (biomes/WORLD.md, Order 6) moves
// the decisions onto the field with everything else, once. Memoised one point deep: the zoning, the mask and the depth
// test ask for the same point in a row
const _tm={x:NaN,z:NaN,h:0};
function placeH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z,true);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the ground without the carve patch's recess (the patch's own rock top)
function terrainBase(x,z){return terrainH0(x,z,false);}
function terrainH0(x,z,carved){
 const dC=Math.abs(z-zR(x)),u=dC/Wc(x),wall=wallK(u);
 const und=(fbm(x*.0006+3,z*.0006-1,17,3)-.5)*9+(fbm(x*.004,z*.004,29,2)-.5)*1.6;
 let h=trend(x)+mtnH(x,z)+mesaH(x,z)+und*(1-wall);
 const bad=badK(x,z);if(bad>0){const t=fbm(x*.0035,z*.0035,62,2);h+=bad*(14*Math.floor(t*6)/6+6*(t-.5));}
 const dn=duneK(x,z);if(dn>0)h+=dn*(7*(.5+.5*Math.sin(z*.021+x*.004+3*fbm(x*.0012,z*.0012,71,2)))+4*(fbm(x*.003,z*.003,72,2)-.5));
 const dp=pondD(x,z);if(dp<160)h-=12*smooth(125,35,dp);
 if(u<1.6){h+=3*smooth(.92,1.1,u)*smooth(1.5,1.15,u);                                   // the rim's lip
  h=mix(h,floorC(x)+(fbm(x*.02,z*.02,88,2)-.5)*.6,wall)-2.6*smooth(16,5,dC)*wall;}      // the flat floor, the channel
 const ab=abyssK(x,z);if(ab>0){const hp=h;h=mix(h,-720+(fbm(x*.002,z*.002,91,2)-.5)*40,Math.pow(ab,.9));   // the Abyss
  if(x>LIP.back&&x<LIP.x+20&&Math.abs(z-LIP.z)<LIP.hw+20){const k=smooth(1.5,-1.5,lipD(x,z));if(k>0)h=mix(h,hp,k);}}   // the lip's promontory, sheer
 // the undercut: the floor runs in under the cap (the recess, 3 m behind the void's walls, steep at 12:1)
 if(carved){const rd=BIO.carve.recessD(x,z);if(rd<12)h=Math.min(h,LIP.floorY+Math.max(0,rd)*12);}
 return h;}
// the cave behind the curtain: 34 m either side of the river, 30 m into the promontory, 46 m high at
// the mouth under an 18 m cap. margin 10 > pad 3 + the recess's climb (64 m at 12:1); a wider margin
// duplicates the Abyss face beside the promontory, where the ground's cells cannot match it
const UNDERCUT=BIO.carve.add({id:'cataract-undercut',name:'The cave behind the cataract',kind:'undercut',c:[LIP.x-1,LIP.z],n:[1,0],
 hw:34,depth:30,h:46,floorY:LIP.floorY,base:terrainBase,margin:10,pad:3,cell:1});
// the ground mesh's lattice (GROUND, below, draws on it): 420 cells over the map, each cell in the lip's window split 12 ways
const GRID={N:420,S:TERR.R*2.2,M:12,win:{x:[3040,3230],z:[LIP.z-90,LIP.z+90]}};GRID.cs=GRID.S/GRID.N;
GRID.cells=(lo,hi)=>{let a0=null,a1=null;for(let i=0;i<GRID.N;i++){const a=-GRID.S/2+i*GRID.cs;if(a+GRID.cs>lo&&a<hi){if(a0===null)a0=a;a1=a+GRID.cs;}}return[a0,a1];};
// the pond's surface: 6 m of water in a 12 m hollow (from the closure, before the bake: the level is the field's data)
const PL=terrainH0(POND.x,POND.z,true)+6.2;
// THE BAKE: the closure (with the carve patch's recess) on the base grid and the lip's inset; the river and the pond
// ride along as the field's named water surfaces (the export's; the page's waterH below still answers from its closure)
const TFIELD=(function(){const t0=performance.now(),S=GRID.S,wx=GRID.cells(GRID.win.x[0],GRID.win.x[1]),wz=GRID.cells(GRID.win.z[0],GRID.win.z[1]);
 const f=KFIELD.bake((x,z)=>terrainH0(x,z,true),[-S/2,-S/2,S/2,S/2],GRID.cs/2,{name:'sedesert',
  insets:[{box:[wx[0],wz[0],wx[1],wz[1]],step:GRID.cs/GRID.M,name:'the lip'}],
  water:{river:(x,z)=>canyonU(x,z)<1.1&&x<TERR.RIM+40?WL(x):NaN,pond:(x,z)=>pondD(x,z)<170?PL:NaN},
  waterBox:{river:[-S/2,-560,TERR.RIM+40,560],pond:[POND.x-220,POND.z-220,POND.x+220,POND.z+220]}});
 window._field={step:f.step,nx:f.nx,nz:f.nz,inset:[f.insets[0].nx,f.insets[0].nz],ms:Math.round(performance.now()-t0)};return f;})();
function waterH(x,z){if(canyonU(x,z)<1.1&&x<TERR.RIM+40)return WL(x);if(pondD(x,z)<170)return PL;return -1e9;}
// the climate fields the biome asks for (cached below; these are the definitions)
function fieldsAt(x,z,h,slope){const dC=Math.abs(z-zR(x)),u=dC/Wc(x),wall=wallK(u),ab=smooth(3080,3200,x+60*Math.sin(z*.003));
 const dp=pondD(x,z),oasis=smooth(300,90,dp)*(1-ab),bad=badK(x,z),dn=duneK(x,z),mt=clamp(mtnH(x,z)/900,0,1),mesa=clamp((mesaH(x,z)-30)/60,0,1);   // only a mesa's top and wall count as upland, not its apron
 const up=clamp(Math.max(mt,mesa*.55),0,1);
 const seep=smooth(-1900,-2300,x)*smooth(.62,.42,fbm(x*.003+5,z*.003-2,101,2))*smooth(.75,.2,mt);   // springs at the mountain foot
 let wet=Math.max(.05,wall*.95*(1-slope*.3),.62*smooth(700,110,dC),oasis*.92,seep*.5);wet*=(1-dn*.9)*(1-ab);
 const flow=Math.max(smooth(48,7,dC)*(1-ab),smooth(190,120,dp)*.7*(1-ab))*(h-waterH(x,z)<3.5?1:.4);
 const rock=clamp(Math.max(bad,smooth(.3,.62,slope)*.9,ab*.9),0,1),flowK=clamp(flow,0,1);
 return{wet:clamp(wet,0,1),flow:flowK,upland:up,canyon:wall,rim:smooth(.86,1.02,u)*smooth(1.6,1.15,u)*(1-dn)*(1-ab),
  rock:rock,dune:dn,oasis:oasis,slope:slope,abyss:ab,
  // the painter's and the ground mesh's own fields: the mountain mass, how much fine strata shows, how much mud cracks
  mtn:mt,strata:smooth(.15,.6,rock)*(1-smooth(.15,.45,ab))*(1-smooth(.02,.12,mt)),
  crack:Math.max(smooth(.5,.95,oasis)*smooth(.6,.2,flowK),smooth(.9,1,wall)*smooth(.5,.8,clamp(wet,0,1))*.2)};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','mtn','strata','crack'];
// a coarse cache of the fields (they cost several terrainH calls each)
const FC=(function(){const N=384,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=placeH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 // bilinear, with the lattice cell of the last point kept: the biome reads ten fields at one point in a row
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: a row of origins along the river, plus the pond and the butte's foot
TOWER.z=zR(TOWER.x)-Wc(TOWER.x)*2.1;
const SPINE=[];for(let x=-3000;x<=3200;x+=700)SPINE.push([x,zR(x)]);SPINE.push([POND.x,POND.z],[BUTTE.x-300,BUTTE.z-500],[TOWER.x,TOWER.z]);
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,field:TFIELD,placeH:placeH,
 mask:(x,z)=>{if(BIO.carve.topAt(x,z)!==null)return 0;const d=placeH(x,z)-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;},   // the core's default (nothing rooted under the local water), and nothing in the carve patch
 obstacles:OBSTACLES,ticks:tick,seed:11,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 windows:{water:[-TERR.R,-700,TERR.R,1000]}});   // the river strip and the pond: the water-bound passes look nowhere else
BIO.setSun([-1000,1150,-560]);
// ---------------------------------------------------------------- the ground
// One mesh, painted by zone from the field cache: red desert, dunes, the
// banded badland and mesa strata, the mountain rock, the canyon's gravel floor
// and damp silt, the pond's playa rim, the Abyss's cliff.
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color();
 const RED1=new THREE.Color(0xa85a42),RED2=new THREE.Color(0x884834),PALE=new THREE.Color(0xc99a72),PAVE=new THREE.Color(0x6e4634),SCRUB=new THREE.Color(0x9e6a4c),SAND=new THREE.Color(0xdca070),SAND2=new THREE.Color(0xeab888),
  BANDS=[new THREE.Color(0xb8683f),new THREE.Color(0x8f4f3a),new THREE.Color(0xd4a884),new THREE.Color(0xa4523a),new THREE.Color(0x7a4030),new THREE.Color(0xc98a5e)],
  MTN=new THREE.Color(0x7a6a5e),MTN2=new THREE.Color(0x9a8a7a),GRAVEL=new THREE.Color(0xc7b08e),SILT=new THREE.Color(0x9a8a68),DAMP=new THREE.Color(0x5a5040),ALGA=new THREE.Color(0x6a7a48),
  PLAYA=new THREE.Color(0xdcd2c0),CLIFF=new THREE.Color(0x5a3a30),CLIFF2=new THREE.Color(0x7a5040);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),hh=FC.at(FC.a.h,wx,wz);
  const wet=FC.at(FC.a.wet,wx,wz),flow=FC.at(FC.a.flow,wx,wz),can=FC.at(FC.a.canyon,wx,wz),rock=FC.at(FC.a.rock,wx,wz),dn=FC.at(FC.a.dune,wx,wz),oa=FC.at(FC.a.oasis,wx,wz),up=FC.at(FC.a.mtn,wx,wz),sl=FC.at(FC.a.slope,wx,wz),ab=FC.at(FC.a.abyss,wx,wz);
  const pav=fbm(x/90+5,y/90-2,.7,2);
  c.copy(RED1).lerp(RED2,clamp(.5+n*1.8,0,1)).lerp(PALE,clamp(n2*.6+.25+.25*Math.sin(wx*.01+wz*.013),0,1)*.35).lerp(PAVE,smooth(.56,.7,pav)*.45);   // the red desert, darker where the pavement of stones lies
  c.lerp(SCRUB,clamp(.35*smooth(.15,.45,wet),0,1));
  t.copy(SAND).lerp(SAND2,clamp(.5+n*1.6,0,1));c.lerp(t,dn);                                             // the dunes
  c.lerp(BANDS[1],FC.at(FC.a.strata,wx,wz)*.4);       // rock: a red-brown under the strata the shader paints by height (aRock)
  t.copy(MTN).lerp(MTN2,clamp(.5+n*1.5,0,1));c.lerp(t,smooth(.08,.5,up)*.9);
  t.copy(GRAVEL).lerp(SILT,smooth(.6,.9,wet));t.lerp(BANDS[1],smooth(.95,.5,can)*.6);c.lerp(t,smooth(.25,.7,can));   // the canyon: banded walls, gravel floor
  c.lerp(DAMP,smooth(.55,.95,flow)*.8);c.lerp(ALGA,smooth(.85,1,flow)*.35);
  c.lerp(PLAYA,smooth(.55,.95,oa)*smooth(.5,.2,flow)*.55);c.lerp(DAMP,smooth(.75,1,oa)*flow*.6);              // the pond's playa rim, its damp margin
  t.copy(CLIFF).lerp(CLIFF2,clamp(.5+n*1.5,0,1)).lerp(BANDS[Math.abs(Math.floor(hh/26))%BANDS.length],.45);c.lerp(t,ab*.9);   // the Abyss wall: coarse strata, 26 m
  c.lerp(BANDS[Math.abs(Math.floor(hh/40+1))%BANDS.length],smooth(.03,.15,up)*smooth(.3,.62,sl)*.35);                    // the mountain ramps: faint 40 m ledges
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// detail: fine grain everywhere, tiled every ~6 m; mud cracks weighted per vertex (aCrack) round the pond and on the silt
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_CRACK=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(70,60,50,.6)';g.lineCap='round';
 const P=[];for(let i=0;i<16;i++)P.push([rng()*w,rng()*h]);
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>w*.4)continue;if(rng()<.45)continue;
  g.lineWidth=rr(1.2,2.6);for(let k=-1;k<=1;k++)for(let m=-1;m<=1;m++){g.beginPath();g.moveTo(a[0]+k*w,a[1]+m*h);g.quadraticCurveTo((a[0]+b[0])/2+rr(-18,18)+k*w,(a[1]+b[1])/2+rr(-18,18)+m*h,b[0]+k*w,b[1]+m*h);g.stroke();}}});
// STRATA: the core's bedded-rock shader (35-core-strata: beds of irregular
// thickness that dip and warp, laminae, cross-bedding, varnish streaks), weighted
// per vertex by the rock field (aRock): the coarse field cache would wobble them.
const STRATA=BIO.strata({seed:4711});
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xa89e94});
MAT_GROUND.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uCrack={value:hostGroundLib('groundCrack',TEX_CRACK)};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;attribute float aRock;attribute float aOcc;attribute float aSun;varying float vCrack;varying float vRock;varying float vOcc;varying float vSun;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvOcc=aOcc;vSun=aSun;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;vRock=aRock;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;varying vec3 vGWP;varying float vCrack;varying float vRock;varying float vOcc;varying float vSun;').replace('getShadowMask();','getShadowMask()*vSun;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 ck=texture2D(uCrack,vGWP.xz*0.14).rgb;'+
  'vec3 bc=strataColor(vSWP,vSWN);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,bc*(0.85+0.3*dt.r),vRock*0.9);'+
  'diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85)*mix(vec3(1.0),ck,vCrack)*pow(vOcc,1.6);}');};   // the cave: occlusion, steepened (ambient is all the light there)
// The grid: 420 cells of 17.8 m, each cell within the lip's window split 12 ways (1.5 m) in x and in z,
// so the promontory's sheer faces and the cave's recess are resolved (the patch's pad, 3 m, must
// exceed the cell's diagonal). Outside the window the lattice is the plain 420 x 420 one.
const SUNV=[sun.position.x,sun.position.y,sun.position.z];
const GROUND=(function(){const N=GRID.N,S=GRID.S,cs=GRID.cs,M=GRID.M;
 const axis=(lo,hi)=>{const o=[];for(let i=0;i<=N;i++){const a=-S/2+i*cs;o.push(a);if(i<N&&a+cs>lo&&a<hi)for(let k=1;k<M;k++)o.push(a+cs*k/M);}return o;};
 const X=axis(GRID.win.x[0],GRID.win.x[1]),Z=axis(GRID.win.z[0],GRID.win.z[1]),nx=X.length,nz=Z.length;
 const pos=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),ck=new Float32Array(nx*nz),rk=new Float32Array(nx*nz),oc=new Float32Array(nx*nz),sn=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=X[i],z=Z[j],y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  ck[k]=FC.at(FC.a.crack,x,z);rk[k]=FC.at(FC.a.strata,x,z);   // mud cracks and fine strata are fields (fieldsAt)
  oc[k]=BIO.carve.floorOcc(x,z);sn[k]=BIO.carve.floorSun(x,y,z,SUNV);}
 const idx=new Uint32Array((nx-1)*(nz-1)*6);let t=0;
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aOcc',new THREE.BufferAttribute(oc,1));g.setAttribute('aSun',new THREE.BufferAttribute(sn,1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The high desert';scene.add(m);return m;})();
// the undercut's rock, put back above the cave: the ground's own material, both sides, with the
// ground's attributes (uv on the painted map, the ground's own rock weight: the Abyss wall is painted, not strata)
const MAT_CARVE=MAT_GROUND.clone();MAT_CARVE.side=THREE.DoubleSide;MAT_CARVE.onBeforeCompile=MAT_GROUND.onBeforeCompile;MAT_CARVE.customProgramCacheKey=()=>'sedesert-carve';
const CARVE_MESHES=(function(){const S=TERR.R*2.2,M=BIO.carve.mesh(MAT_CARVE,{sun:SUNV});
 for(const m of M){const g=m.geometry,P=g.attributes.position,Nr=g.attributes.normal,n=P.count,uv=new Float32Array(n*2),rk=new Float32Array(n);
  for(let v=0;v<n;v++){const x=P.getX(v),z=P.getZ(v);uv[v*2]=x/S+.5;uv[v*2+1]=.5-z/S;rk[v]=FC.at(FC.a.strata,x,z);}
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aCrack',new THREE.BufferAttribute(new Float32Array(n),1));
  scene.add(m);}
 for(const Q of BIO.carve.patches)REGISTER({name:Q.name,cls:'carve',x:Q.c[0]-Q.n[0]*Q.depth*.5,z:Q.c[1]-Q.n[1]*Q.depth*.5,y:Q.floorY,r:Q.hw+2,h:Q.h+6});
 window._carve=BIO.carve.patches.map(Q=>Object.assign({id:Q.id},Q.stats));return M;})();

// ---------------------------------------------------------------- the water
// The river is a ribbon at WL(x) following its channel, the pond a disc at PL,
// both in one vertex-coloured ripple material (SEDESERT_WATER's hue: the teal
// of a wadi pool, paler over gravel shallows). The cataract is a curtain of
// its own material, falling from the notch to the Abyss floor, with mist.
const WHUE=SEDESERT_WATER.hue;
const WATER_SHALLOW=new THREE.Color().setHSL(WHUE,.55,.46),WATER_MID=new THREE.Color().setHSL(WHUE,.62,.30),WATER_DEEP=new THREE.Color().setHSL(WHUE,.6,.15),WATER_PALE=new THREE.Color().setHSL(WHUE-.03,.35,.62);
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(-1000,1150,-560).normalize()},uSky:{value:new THREE.Color(0xdfe6ec)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' float dcam=length(cameraPosition-vWP);float rk=1.0-smoothstep(120.0,420.0,dcam);',   // ripples fade with range or they alias into a moire
  ' vec3 n=normalize(vec3(rk*(0.035*sin(vWP.x*0.31+uT*1.1)+0.02*sin(vWP.z*0.53-uT*0.7+vWP.x*0.11)),1.0,rk*(0.035*cos(vWP.z*0.27+uT*0.9)+0.02*sin(vWP.x*0.47+uT*1.3))));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(1.0-max(dot(n,V),0.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.10+fr*0.62);',
  ' vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.8*vec3(1.0,0.97,0.9);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
const FOAM=new THREE.Color(0xeaf2f0);
function waterColorAt(x,z,out){const h=terrainH(x,z),d=Math.max(0,waterH(x,z)-h),shoal=fbm(x*.02+2,z*.02-4,505,2);
 out.copy(WATER_SHALLOW).lerp(WATER_PALE,Math.max(smooth(.5,.7,shoal)*smooth(1.6,.3,d),smooth(.6,.1,d)*.7)).lerp(WATER_MID,smooth(.9,2.2,d)).lerp(WATER_DEEP,smooth(2.5,5,d));
 // rapids: whitewater in the mountain gorge where the bed steepens, and a riffle at the notch
 const rap=Math.max(smooth(-2200,-2700,x),smooth(TERR.RIM-80,TERR.RIM+20,x))*smooth(.48,.66,fbm(x*.06,z*.08,606,2));out.lerp(FOAM,rap*.85);return out;}
(function(){
 // the river ribbon: 12 m steps along x, 9 vertices across the channel (half-width 12 m)
 const pos=[],col=[],c=new THREE.Color(),NW=8,HW=12;
 const push=(x,z)=>{const y=WL(x);waterColorAt(x,z,c);c.convertSRGBToLinear();pos.push(x,y,z);col.push(c.r,c.g,c.b);};
 const X0=-TERR.R*1.1,X1=TERR.RIM+34;let n=0;const rows=[];
 for(let x=X0;x<=X1;x+=12){const zr=zR(x),row=[];for(let k=0;k<=NW;k++){const z=zr+(k/NW-.5)*2*HW;row.push(pos.length/3);push(x,z);}rows.push(row);}
 const idx=[];for(let r=0;r<rows.length-1;r++)for(let k=0;k<NW;k++){const a=rows[r][k],b=rows[r][k+1],cc=rows[r+1][k],dd=rows[r+1][k+1];idx.push(a,dd,cc,a,b,dd);}   // wound to face UP: the single-sided water is seen from above (it faced down, and every camera saw the bed)
 // the pond: a fan
 const pc=pos.length/3;push(POND.x,POND.z);const PN=40,PR=[];for(let k=0;k<=PN;k++){const a=k/PN*TAU,r=165;PR.push(pos.length/3);push(POND.x+Math.cos(a)*r,POND.z+Math.sin(a)*r);}
 for(let k=0;k<PN;k++)idx.push(pc,PR[k+1],PR[k]);
 // the pond's vertices sit at PL, the river's at WL(x): fix the pond ring
 for(let k=pc;k<pos.length/3;k++)pos[k*3+1]=PL;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='The river';m.renderOrder=1;scene.add(m);})();
// the cataract: a curtain from the notch at the rim to the Abyss floor, streaked, foaming white at the lip and at the plunge pool
const TEX_FALL=BIO.canvasTex(128,512,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 for(let i=0;i<260;i++){const x=rng()*w,l=rr(40,200);g.strokeStyle='rgba('+(rng()<.5?'150,190,200':'255,255,255')+','+(.2+rng()*.5).toFixed(2)+')';g.lineWidth=rr(1,4);g.beginPath();g.moveTo(x,rng()*h);g.lineTo(x+rr(-3,3),rng()*h+l);g.stroke();}});
const MAT_FALL=new THREE.ShaderMaterial({fog:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uTex:{value:TEX_FALL},uCol:{value:new THREE.Color().setHSL(WHUE,.4,.7)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec2 vUv;varying vec3 vWP;',
  'void main(){vUv=uv;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform sampler2D uTex;uniform vec3 uCol;varying vec2 vUv;varying vec3 vWP;',
  'void main(){',
  ' vec3 s1=texture2D(uTex,vec2(vUv.x*2.0,vUv.y*6.0-uT*0.9)).rgb;vec3 s2=texture2D(uTex,vec2(vUv.x*3.1+0.3,vUv.y*4.0-uT*1.3)).rgb;',
  ' float f=(s1.r*s2.g);vec3 col=mix(uCol,vec3(1.0),0.1+0.6*smoothstep(0.35,0.9,f));',
  ' float a=(0.22+0.5*smoothstep(0.3,0.9,f))*(0.5+0.5*s1.g);a*=smoothstep(0.0,0.1,vUv.x)*smoothstep(1.0,0.9,vUv.x);',
  ' a*=mix(1.0,0.55,smoothstep(0.4,1.0,vUv.y));',   // it breaks into spray toward the foot
  ' gl_FragColor=vec4(col,a);','#include <fog_fragment>','}'].join('\n')});
MAT_FALL.uniforms.fogColor.value=scene.fog.color;MAT_FALL.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_FALL.uniforms.uT.value+=dt;});
const FALL={x:TERR.RIM+34,z:zR(TERR.RIM+34),y:WL(TERR.RIM+34),floor:-700};
(function(){const pos=[],uv=[],idx=[],NS=44,HW=13,H=FALL.y-FALL.floor;
 for(let i=0;i<=NS;i++){const t=i/NS,y=FALL.y-H*t,x=FALL.x+40*(1-Math.exp(-t*3))+t*t*90,w=HW*(1+t*2.2);
  for(let k=-1;k<=1;k+=2){pos.push(x,y,FALL.z+k*w);uv.push(k<0?0:1,t);}}
 for(let i=0;i<NS;i++){const a=i*2,b=a+1,c2=a+2,d=a+3;idx.push(a,c2,d,a,d,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_FALL);m.userData.probeSkip=true;m.userData.inspectLabel='The cataract';m.renderOrder=2;scene.add(m);FALL.mesh=m;
 // mist: soft sprites at the plunge and up the fall; the rising column drifts
 const mistTex=BIO.canvasTex(128,128,(gg,w,h)=>{const gr=gg.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.45,'rgba(240,246,250,.45)');gr.addColorStop(1,'rgba(240,246,250,0)');gg.fillStyle=gr;gg.fillRect(0,0,w,h);});
 const SPR=[];
 for(let i=0;i<26;i++){const t=i<16?rr(.72,1.02):rr(.15,.7),y=FALL.y-H*t,x=FALL.x+40*(1-Math.exp(-t*3))+t*t*90+rr(-30,60),s=i<16?rr(120,260):rr(40,90);
  const sm=new THREE.SpriteMaterial({map:mistTex,transparent:true,depthWrite:false,opacity:i<16?rr(.28,.5):rr(.18,.3),fog:true,color:0xf4f8fa});
  const sp=new THREE.Sprite(sm);sp.position.set(x,y+(i<16?rr(0,140):0),FALL.z+rr(-90,90)*(i<16?1:.4));sp.scale.set(s,s*rr(.7,1.1),1);sp.userData.probeSkip=true;sp.userData.inspectLabel='Mist';sp.userData.ph=rr(0,TAU);sp.userData.y0=sp.position.y;scene.add(sp);SPR.push(sp);}
 // spray at the lip: small sprites torn off the edge
 for(let i=0;i<8;i++){const sm=new THREE.SpriteMaterial({map:mistTex,transparent:true,depthWrite:false,opacity:rr(.2,.35),fog:true,color:0xffffff});
  const sp=new THREE.Sprite(sm);sp.position.set(FALL.x+rr(-4,26),FALL.y+rr(2,18),FALL.z+rr(-16,16));const s=rr(10,26);sp.scale.set(s,s*rr(.8,1.2),1);sp.userData.probeSkip=true;sp.userData.inspectLabel='Spray';sp.userData.ph=rr(0,TAU);sp.userData.y0=sp.position.y;scene.add(sp);SPR.push(sp);}
 TICKS.push((dt,t)=>{for(let i=0;i<SPR.length;i++){const s=SPR[i];s.position.y=s.userData.y0+8*Math.sin(t*.25+s.userData.ph);}});
 // the plunge pool on the Abyss floor: a fan of water, foam white where the fall lands, the floor's rocks standing out of it
 {const px=FALL.x+40+90+40,pz=FALL.z,py=-703,pos=[px,py,pz],col=[],cf=FOAM.clone().convertSRGBToLinear(),cd=WATER_DEEP.clone().convertSRGBToLinear();col.push(cf.r,cf.g,cf.b);const PN=36,idx=[];
  for(let k=0;k<=PN;k++){const a=k/PN*TAU,r=150*(1+.15*Math.sin(3*a)+.1*Math.sin(5*a+1));pos.push(px+Math.cos(a)*r,py,pz+Math.sin(a)*r);const c=cd.clone().lerp(cf,.15);col.push(c.r,c.g,c.b);}
  for(let k=0;k<PN;k++)idx.push(0,k+2,k+1);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='The plunge pool';m.renderOrder=1;scene.add(m);}
 REGISTER({name:'The cataract',x:FALL.x+60,z:FALL.z,y:FALL.floor,r:160,h:H+40});})();
