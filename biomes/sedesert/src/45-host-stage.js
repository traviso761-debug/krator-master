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
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
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
// the plateau before the canyon, the Abyss and the landforms: the land the wadi's bed is levelled on
function plateauH(x,z){
 const u=Math.abs(z-zR(x))/Wc(x),wall=wallK(u);
 const und=(fbm(x*.0006+3,z*.0006-1,17,3)-.5)*9+(fbm(x*.004,z*.004,29,2)-.5)*1.6;
 let h=trend(x)+mtnH(x,z)+mesaH(x,z)+und*(1-wall);
 const bad=badK(x,z);if(bad>0){const t=fbm(x*.0035,z*.0035,62,2);h+=bad*(14*Math.floor(t*6)/6+6*(t-.5));}
 const dn=duneK(x,z);if(dn>0)h+=dn*(7*(.5+.5*Math.sin(z*.021+x*.004+3*fbm(x*.0012,z*.0012,71,2)))+4*(fbm(x*.003,z*.003,72,2)-.5));
 const dp=pondD(x,z);if(dp<160)h-=12*smooth(125,35,dp);
 return h;}
// THE LANDFORMS (core/terrain 38, KRELIEF; the final rebuild 2026-10-27, BACKPORT.md sedesert's row; ?landforms=0 the ground before): TALUS
// banked against every mesa's and the butte's foot (the walls' fall, a fifth of the wall's height reaching out half of it), and A WADI, a dry
// braided river off the southern scrub that runs north 1.5 km to the canyon and leaves its cut bed hanging over the rim (a dry fall onto the
// first bench): cobble floor, gravel bars between its channels, cut banks on the outsides of its bends, a pool or two after rain. Records
// first (KRAND-hashed by slot), composed on the plateau, then baked into the field with the rest
const LANDF=(function(){if(new URLSearchParams(location.search).get('landforms')==='0'||typeof KRELIEF==='undefined')return null;
 const TAL=MESAS.map((M,i)=>({M,f:KRELIEF.talus({h:M[3]*.2,reach:Math.max(40,M[3]*.55),rough:.6,scale:.02,seed:4401+i,
  footD:(x,z)=>{const dx=x-M[0],dz=z-M[1],a=Math.atan2(dz,dx),e=M[2]*(1+.07*Math.sin(3*a+i)+.045*Math.sin(7*a+2*i)+.03*Math.sin(13*a));return Math.hypot(dx,dz)-e;}})}));
 const a=[-350,1650],bx=-560,b=[bx,zR(bx)+Wc(bx)*1.05];
 const WADI=KRELIEF.wadi({pts:KRELIEF.meander(a,b,{amp:70,wave:420,seed:4411}),ground:plateauH,w:9,bank:2.2,bankW:4,braids:2.2,pools:.35,fan:false,seed:4412});
 /* the apron on the floor as it would be without the mesa (the plateau less mesaH), the wall going down into it: the higher of the two */
 return{talus:TAL,wadi:WADI,apply(x,z,h){let t=0;for(const T of TAL){const dx=x-T.M[0],dz=z-T.M[1];if(dx*dx+dz*dz<Math.pow(T.M[2]*1.4+T.M[3],2))t=Math.max(t,T.f(x,z));}
  if(t>0)h=Math.max(h,h-mesaH(x,z)+t);
  return KRELIEF.shape(WADI,x,z,h);},at:(x,z,h)=>KRELIEF.at(WADI,x,z,h)};})();
// the wadi's box (its line, padded by its reach): the paint asks KRELIEF.at only inside it
const WADI_BOX=LANDF?(()=>{const P=LANDF.wadi.pts,r=LANDF.wadi.reach+4;return[Math.min(...P.map(p=>p.x))-r,Math.min(...P.map(p=>p.z))-r,Math.max(...P.map(p=>p.x))+r,Math.max(...P.map(p=>p.z))+r];})():null;
function terrainH0(x,z,carved){
 const dC=Math.abs(z-zR(x)),u=dC/Wc(x),wall=wallK(u);
 let h=plateauH(x,z);if(LANDF)h=LANDF.apply(x,z,h);
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
// the climate fields the biome asks for (cached below; these are the definitions). abM (the paint's window only, FCP
// below): how much of the Abyss counts here, 0 on the lip's promontory and in the cave; the field cache passes none
function fieldsAt(x,z,h,slope,abM){const dC=Math.abs(z-zR(x)),u=dC/Wc(x),wall=wallK(u),ab=smooth(3080,3200,x+60*Math.sin(z*.003))*(abM==null?1:abM);
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
// THE PAINT'S FINE WINDOW over the lip (2026-10-25): the 19.5 m cache above reads the Abyss by x alone and the recessed
// heightfield, so it painted the promontory's top and the cave as Abyss wall. FCP is a 2 m cache over the lip, read by the
// painter and the ground's and the carve's vertex weights ONLY (the biome's placement keeps reading FC, so nothing moves):
// the ground as drawn (terrainH), the Abyss taken off the promontory's top (lipD, as terrainH0 raises it; its sheer faces stay the Abyss wall's) and out of the cave
// (caveK: inside its plan, between its floor and its ceiling), and the cave painted as bedded rock (strata), dry of the river's
// flow. It fades into FC over its outer 20 m. PA(name,x,z): the paint's field, FC's own value outside the window.
// caveK: 1 inside the void (within its plan, between its floor and its ceiling), 0 outside: the cave's bedded rock
function caveK(x,y,z){let k=0;for(const Q of BIO.carve.patches){const sd=BIO.carve.planSD(Q,x,z);if(sd>1.5)continue;const L=BIO.carve.local(Q,x,z),cy=Q.K.ceil(Q,L.u,Math.max(0,L.q));
 k=Math.max(k,smooth(1.5,-.5,sd)*smooth(Q.floorY-2,Q.floorY-.5,y)*smooth(cy+2,cy+.5,y));}return k;}
const FCP=(function(){const st=2,x0=3000,x1=3250,z0=Math.round(LIP.z)-110,z1=Math.round(LIP.z)+110,nx=Math.round((x1-x0)/st)+1,nz=Math.round((z1-z0)/st)+1,a={};
 FNAMES.forEach(n=>a[n]=new Float32Array(nx*nz));a.h=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)a.h[j*nx+i]=terrainH(x0+i*st,z0+j*st);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*st,z=z0+j*st,k=j*nx+i,h=a.h[k];
  const hx=a.h[j*nx+Math.min(nx-1,i+1)]-a.h[j*nx+Math.max(0,i-1)],hz=a.h[Math.min(nz-1,j+1)*nx+i]-a.h[Math.max(0,j-1)*nx+i],slope=clamp(Math.hypot(hx,hz)/(2*st)*1.6,0,1);
  const prom=x>LIP.back&&x<LIP.x+20&&Math.abs(z-LIP.z)<LIP.hw+20?smooth(1.5,-1.5,lipD(x,z))*smooth(-8,-3,h-floorC(x)):0,cave=caveK(x,h,z);
  const F=fieldsAt(x,z,h,slope,1-Math.max(prom,cave));
  F.strata=Math.max(F.strata,cave);F.rock=Math.max(F.rock,cave);F.canyon*=1-cave;F.flow*=1-cave;F.crack*=1-cave;F.wet=Math.max(F.wet*(1-cave),.45*cave);   // the cave: bedded rock, damp from the curtain's spray
  FNAMES.forEach(n=>a[n][k]=F[n]);}
 const at=(arr,x,z)=>{const u=clamp((x-x0)/st,0,nx-1.001),v=clamp((z-z0)/st,0,nz-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*nx+i;
  return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+nx]*(1-fu)*fv+arr[k+nx+1]*fu*fv;};
 const w=(x,z)=>x<=x0||x>=x1||z<=z0||z>=z1?0:smooth(0,20,Math.min(x-x0,x1-x,z-z0,z1-z));
 return{a,at,w,box:[x0,z0,x1,z1]};})();
function PA(n,x,z){const w=FCP.w(x,z),f=FC.at(FC.a[n],x,z);return w>0?f+(FCP.at(FCP.a[n],x,z)-f)*w:f;}
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: a row of origins along the river, plus the pond and the butte's foot
TOWER.z=zR(TOWER.x)-Wc(TOWER.x)*2.1;
const SPINE=[];for(let x=-3000;x<=3200;x+=700)SPINE.push([x,zR(x)]);SPINE.push([POND.x,POND.z],[BUTTE.x-300,BUTTE.z-500],[TOWER.x,TOWER.z]);
// THE GRAPHICS SET (the final rebuild, 2026-10-27; GRAPHIC-LOAD.md, nhighlands' and eastabyss's lines): every item's geometry welded to an
// index (BIO.INDEX_ITEMS; ?index=0 for the soup), each chunk's LOD bands merged with a dithered cross-fade (?lodmerge=0, ?lodfade=0) and
// loose instances culled past their own range (?lodcull=0). INDEX_ITEMS is read as the kit defines its items (50): it is set here, before it
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
BIO.init({tags:'sedesert',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,field:TFIELD,placeH:placeH,
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
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),hh=PA('h',wx,wz);   // PA: FC, and the lip's fine window (FCP)
  const wet=PA('wet',wx,wz),flow=PA('flow',wx,wz),can=PA('canyon',wx,wz),rock=PA('rock',wx,wz),dn=PA('dune',wx,wz),oa=PA('oasis',wx,wz),up=PA('mtn',wx,wz),sl=PA('slope',wx,wz),ab=PA('abyss',wx,wz);
  const pav=fbm(x/90+5,y/90-2,.7,2);
  c.copy(RED1).lerp(RED2,clamp(.5+n*1.8,0,1)).lerp(PALE,clamp(n2*.6+.25+.25*Math.sin(wx*.01+wz*.013),0,1)*.35).lerp(PAVE,smooth(.56,.7,pav)*.45);   // the red desert, darker where the pavement of stones lies
  c.lerp(SCRUB,clamp(.35*smooth(.15,.45,wet),0,1));
  t.copy(SAND).lerp(SAND2,clamp(.5+n*1.6,0,1));c.lerp(t,dn);                                             // the dunes
  c.lerp(BANDS[1],PA('strata',wx,wz)*.4);       // rock: a red-brown under the strata the shader paints by height (aRock)
  t.copy(MTN).lerp(MTN2,clamp(.5+n*1.5,0,1));c.lerp(t,smooth(.08,.5,up)*.9);
  t.copy(GRAVEL).lerp(SILT,smooth(.6,.9,wet));t.lerp(BANDS[1],smooth(.95,.5,can)*.6);c.lerp(t,smooth(.25,.7,can));   // the canyon: banded walls, gravel floor
  c.lerp(DAMP,smooth(.55,.95,flow)*.8);c.lerp(ALGA,smooth(.85,1,flow)*.35);
  c.lerp(PLAYA,smooth(.55,.95,oa)*smooth(.5,.2,flow)*.55);c.lerp(DAMP,smooth(.75,1,oa)*flow*.6);              // the pond's playa rim, its damp margin
  t.copy(CLIFF).lerp(CLIFF2,clamp(.5+n*1.5,0,1)).lerp(BANDS[Math.abs(Math.floor(hh/26))%BANDS.length],.45);c.lerp(t,ab*.9);   // the Abyss wall: coarse strata, 26 m
  c.lerp(BANDS[Math.abs(Math.floor(hh/40+1))%BANDS.length],smooth(.03,.15,up)*smooth(.3,.62,sl)*.35);                    // the mountain ramps: faint 40 m ledges
  if(WADI_BOX&&wx>WADI_BOX[0]&&wx<WADI_BOX[2]&&wz>WADI_BOX[1]&&wz<WADI_BOX[3]){const a=LANDF.at(wx,wz,hh);   // the wadi: its cobble floor, paler gravel bars, the cut banks' fresh red
   if(a)c.lerp(a.part==='bank'?RED2:GRAVEL,a.part==='bank'?.3:a.part==='bar'?.85:a.part==='pool'?.5:.65);}
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
// THE LIBRARY GROUND LAYERS (materials.json ground.*, 2026-10-19; core/materials/PLAN.md "Sedesert"): fine sand on the dunes
// (ground080) and the pale smooth sand of the pond's playa rim (ground093c), laid over the painted ground by weight per
// vertex (aLay); on the strata rock the layered red sandstone (rock.sandstone.red) is the relief of the steep faces and the
// cracked sandstone (rock.sandstone_cracks) of the flat ledges, multiplied into the strata's colours. Without the pack
// (?mat=proc, or the open world) the ground is exactly the painted one.
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=n=>KMAT.packed('sedesert',n);
 const d=P('ground.dune'),r=P('ground.rim'),w=P('ground.redwall'),l=P('ground.ledge');if(!d||!r||!w||!l)return null;
 const T=x=>KMAT.textures(x,{aniso:8}).map,m=x=>Math.pow(x.tint&&x.tint.mean!=null?x.tint.mean:.78,2.2);
 return{dune:T(d),duneK:1/d.scale[0],rim:T(r),rimK:1/r.scale[0],wall:T(w),wallK:1/w.scale[0],wallM:m(w),ledge:T(l),ledgeK:1/l.scale[0],ledgeM:m(l)};})();
// the detail grain, triplanar (2026-10-25, settlements/shade's triDetail): projected on x-z alone it smeared into vertical
// grain down the gorge, butte and Abyss faces. Flat ground takes the x-z tile it always had (weight ^4: the x-z term rules
// below ~35 degrees). The cracks and the library's dune and rim sand stay on x-z (they lie on the flat)
const GROUND_TRI='vec3 triDetail(sampler2D t,vec3 p,vec3 n,float s,float o){vec3 w=pow(abs(normalize(n)),vec3(4.0));w/=w.x+w.y+w.z;'+
 'return texture2D(t,p.zy*s+o).rgb*w.x+texture2D(t,p.xz*s+o).rgb*w.y+texture2D(t,p.xy*s+o).rgb*w.z;}\n';
/* MeshStandard (2026-11-04, the ground catch-up; core/terrain/GROUND.md: r128's Lambert lights per vertex on the cells, so no relief could show on it): the light per
   pixel, roughness high as dry ground is; the vertex's sun share (vSun, the gorge's and the cave's shade) scales the direct light after the lights are summed, as
   getShadowMask()*vSun did on Lambert. ?kgstd=0 the Lambert ground (and no relief), ?kgrelief=0 the Standard ground without the relief: the two before states */
const KG_Q=new URLSearchParams(location.search),KG_STD=KG_Q.get('kgstd')!=='0',KG_RELIEF=KG_STD&&KG_Q.get('kgrelief')!=='0';
const MAT_GROUND=KG_STD?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xa89e94,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xa89e94});
MAT_GROUND.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uKgSun={value:KG_SUN};sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uCrack={value:hostGroundLib('groundCrack',TEX_CRACK)};
 if(GLAY){sh.uniforms.uLDune={value:GLAY.dune};sh.uniforms.uLRim={value:GLAY.rim};sh.uniforms.uLWall={value:GLAY.wall};sh.uniforms.uLLedge={value:GLAY.ledge};}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;attribute float aRock;attribute float aOcc;attribute float aSun;varying float vCrack;varying float vRock;varying float vOcc;varying float vSun;attribute vec2 aLay;varying vec2 vLay;attribute float aPave;varying float vPave;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvLay=aLay;vPave=aPave;vOcc=aOcc;vSun=aSun;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;vRock=aRock;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;varying vec3 vGWP;varying float vCrack;varying float vRock;varying float vOcc;varying float vSun;varying vec2 vLay;varying float vPave;uniform vec3 uKgSun;\n'+GROUND_TRI+(GLAY?'uniform sampler2D uLDune,uLRim,uLWall,uLLedge;':'')).replace('getShadowMask();','getShadowMask()*vSun;').replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directDiffuse*=vSun;reflectedLight.directSpecular*=vSun;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=triDetail(uDetail,vGWP,vSWN,0.165,0.0);vec3 dt2=triDetail(uDetail,vGWP,vSWN,0.021,0.37);vec3 ck=texture2D(uCrack,vGWP.xz*0.14).rgb;'+
  'vec3 bc=strataColor(vSWP,vSWN);'+
  // the strata's relief from the library (a custom sampler is not decoded from sRGB: pow 2.2 by hand): the steep faces
  // take the red sandstone's layers (the face's two horizontals and its height), the flat ledges the cracked sandstone
  (GLAY?'{vec3 tw=pow(texture2D(uLWall,vec2(vGWP.x+vGWP.z*0.7,vGWP.y)*'+GLAY.wallK.toFixed(4)+').rgb,vec3(2.2))/'+GLAY.wallM.toFixed(4)+';'+
   'vec3 tl=pow(texture2D(uLLedge,vGWP.xz*'+GLAY.ledgeK.toFixed(4)+').rgb,vec3(2.2))/'+GLAY.ledgeM.toFixed(4)+';'+
   'bc*=mix(tw,tl,smoothstep(0.55,0.85,vSWN.y));}':'')+
  'diffuseColor.rgb=mix(diffuseColor.rgb,bc*(0.85+0.3*dt.r),vRock*0.9);'+
  // the dunes' fine sand and the playa rim's pale sand over the painted ground: core/terrain's ground shader puts them here
  // (KGROUND, 43-core-ground.js, 2026-10-26: hex-tiled, scaled with distance, blended by height; the weights and strengths as before)
  '/*KGROUND*/'+
  'diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85)*mix(vec3(1.0),ck,vCrack)*pow(vOcc,1.6);}');};
// THE LAYER KINDS (core/terrain 43, the final rebuild 2026-10-27; BACKPORT.md sedesert's row): the dunes' sand takes the wind's ripples, lit by the
// sun, and the glints of single grains (?sand=0: the plain library layer), across the wind that built the dunes (their crests run along
// z*.021+x*.004); the red desert's PAVEMENT (?pave=0: the paint's darker patches alone) is a mosaic of varnished stones packed in the sand
// where the paint lays its pavement (aPave), the Outlands' recipe: small, packed, no sub-clasts or glass, a desert-varnish palette
const KG_SUN=new THREE.Vector3(-1000,1150,-560).normalize();TICKS.push(()=>KG_SUN.copy(sun.position).normalize());
const KG_SAND=KG_Q.get('sand')!=='0',KG_PAVE=KG_Q.get('pave')!=='0';
KGROUND.hook(MAT_GROUND,{key:'sedesert-ground'+(KG_SAND?'s':'')+(KG_PAVE?'p':''),layers:GLAY?[KGROUND.layer('sedesert','ground.dune',Object.assign({w:'vLay.x*(1.0-vRock)',amt:.75,gain:1.35,tint:'diffuse'},
   KG_SAND?{kind:'sand',wind:[.187,.982],ripple:.11,sun:'uKgSun',seed:211}:{})),
 KGROUND.layer('sedesert','ground.rim',{w:'vLay.y*(1.0-vRock)',amt:.8,gain:1.35,tint:'diffuse'}),
 KG_PAVE?{kind:'clast',w:'vPave*(1.0-vRock)',amt:.72,proj:'xz',size:.06,matrix:.24,matrixColor:0xb07a54,sub:0,fleck:0,jitter:.95,vary:.3,
  palette:[0x2a1e18,0x3e2a20,0x553828,0x1e1814,0x4a3226,0x6a4a34],seed:212}:null]:[],
 /* THE RELIEF (2026-11-04, the ground catch-up; HANDOFF-REBUILD's adoption list): the layers' height bumps the lit normal (no texture unit), its low and the floor's
    own hollows (KGROUND.cavityMesh, below) lose sky light, and where the strata show (vRock) the beds stand by hardness on the core strata path. No side planes:
    the layers lie on the flat (1 - vRock), and the steep faces' detail is GROUND_TRI's already */
 relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1,strata:.45,strataW:'vRock'}:null});   // the cave: occlusion, steepened (ambient is all the light there)
// The layers above, described once for a port (core/export's EXPORT.groundLayers: a material record with hook 'world-uv',
// its maps by library reference, the crack weight sampled on the tile's grid; Godot multiplies them in ground.gdshader
// through godot/shaders/lib/world-uv.gdshaderinc). Not described yet: the strata (vRock) and the cave's occlusion.
if(typeof EXPORT!=='undefined'&&EXPORT.groundLayers)EXPORT.groundLayers({id:'ground:sedesert',build:'sedesert',
 terms:[{maps:[{family:'groundDetail',texture:TEX_DETAIL,scale:.165},{family:'groundDetail',texture:TEX_DETAIL,scale:.021,offset:.37}],gain:1.12,amount:.85},
  {maps:[{family:'groundCrack',texture:TEX_CRACK,scale:.14}],gain:1,amount:1,weight:'crack'}],
 weights:{crack:(x,z)=>FC.at(FC.a.crack,x,z)},step:2,box:[-GRID.S/2,-GRID.S/2,GRID.S/2,GRID.S/2],png:t=>BIO.texPNG?BIO.texPNG(t):null});
const SUNV=[sun.position.x,sun.position.y,sun.position.z];
// THE GROUND MESH (2026-10-25): the 420 x 420 lattice of 17.8 m cells, refined LOCALLY: each cell in the lip's window is
// split 12 ways (1.48 m, the field's inset there: the promontory's sheer faces and the cave's recess; the carve patch's pad,
// 3 m, must exceed the cell's diagonal), and each cell along the river's channel (within 18 m of its line, to the lip) is
// split GRID.RL ways, so the bank no longer cuts chords across the 2.6 m channel. Until 2026-10-25 the refinement was
// separable: the lip's fine columns and rows ran across the whole map (94k vertices the window did not need). Where a
// cell meets a finer neighbour, each of its sub-cells on that edge is a fan from its centre through the finer edge's
// vertices, so no T-junction opens a crack. Every vertex reads terrainH (the field); a coarse cell's centre, where a fan
// needs one, is a field grid point. GROUND.userData.hAt(x,z): the height of the triangles as drawn (the probe's).
GRID.RL=4;
GRID.level=(i,j)=>{const cs=GRID.cs,ax=-GRID.S/2+i*cs,az=-GRID.S/2+j*cs,W=GRID.win;
 if(ax+cs>W.x[0]&&ax<W.x[1]&&az+cs>W.z[0]&&az<W.z[1])return GRID.M;
 if(ax<TERR.RIM+40){let d=1e9;for(const t of [0,.5,1]){const x=ax+cs*t,zr=zR(x);d=Math.min(d,zr<az?az-zr:zr>az+cs?zr-az-cs:0);}if(d<18)return GRID.RL;}
 return 1;};
const GROUND=(function(){const t0=performance.now(),N=GRID.N,S=GRID.S,cs=GRID.cs,U=24,ROW=N*U+1;
 const LV=new Uint8Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++)LV[j*N+i]=GRID.level(i,j);
 const lv=(i,j)=>i<0||j<0||i>=N||j>=N?0:LV[j*N+i];
 const ids=new Map(),pos=[],uv=[],ck=[],rk=[],oc=[],sn=[],lay=[],pv=[],idx=[],cellT=new Uint32Array(N*N+1);
 // a vertex on the 1/24-cell lattice (I along x, K along z), made once
 const V=(I,K)=>{const key=K*ROW+I;let v=ids.get(key);if(v!==undefined)return v;v=pos.length/3;ids.set(key,v);
  const x=-S/2+Math.floor(I/U)*cs+cs*(I%U)/U,z=-S/2+Math.floor(K/U)*cs+cs*(K%U)/U,y=terrainH(x,z);
  pos.push(x,y,z);uv.push(x/S+.5,.5-z/S);ck.push(PA('crack',x,z));rk.push(PA('strata',x,z));   // mud cracks and fine strata are fields (fieldsAt)
  oc.push(BIO.carve.floorOcc(x,z));sn.push(BIO.carve.floorSun(x,y,z,SUNV));
  const dn=PA('dune',x,z);lay.push(dn,smooth(.55,.95,PA('oasis',x,z))*smooth(.5,.2,PA('flow',x,z))*(1-dn));
  /* the pavement where the paint lays it (the paint's own fbm on its pixel lattice), on the flat open desert only */
  const px=(x/S+.5)*1536,pz=(z/S+.5)*1536;pv.push(smooth(.56,.7,fbm(px/90+5,pz/90-2,.7,2))*(1-dn)*smooth(.35,.15,PA('wet',x,z))*smooth(.3,.12,PA('slope',x,z))*(1-smooth(.1,.4,PA('canyon',x,z)))*(1-smooth(.05,.3,PA('mtn',x,z)))*(1-PA('abyss',x,z)));return v;};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){cellT[j*N+i]=idx.length/3;const L=lv(i,j),st=U/L;
  // each edge's level: the finer of this cell's and its neighbour's (west x=i, south z=j+1, east x=i+1, north z=j)
  const eW=Math.max(L,lv(i-1,j)),eS=Math.max(L,lv(i,j+1)),eE=Math.max(L,lv(i+1,j)),eN=Math.max(L,lv(i,j-1));
  for(let b=0;b<L;b++)for(let a=0;a<L;a++){const I0=i*U+a*st,K0=j*U+b*st,I1=I0+st,K1=K0+st;
   const fW=a===0&&eW>L,fS=b===L-1&&eS>L,fE=a===L-1&&eE>L,fN=b===0&&eN>L;
   if(!fW&&!fS&&!fE&&!fN){const p=V(I0,K0),q=V(I0,K1),r=V(I1,K1),s=V(I1,K0);idx.push(p,q,s,q,r,s);continue;}   // the quad, split as it always was
   // the ring a (I0,K0) -> b (I0,K1) -> c (I1,K1) -> d (I1,K0), with the finer edges' vertices between
   const R=[],e=(n)=>U/n;
   R.push(V(I0,K0));if(fW)for(let k=K0+e(eW);k<K1;k+=e(eW))R.push(V(I0,k));
   R.push(V(I0,K1));if(fS)for(let k=I0+e(eS);k<I1;k+=e(eS))R.push(V(k,K1));
   R.push(V(I1,K1));if(fE)for(let k=K1-e(eE);k>K0;k-=e(eE))R.push(V(I1,k));
   R.push(V(I1,K0));if(fN)for(let k=I1-e(eN);k>I0;k-=e(eN))R.push(V(k,K0));
   const c=V(I0+st/2,K0+st/2);for(let k=0;k<R.length;k++)idx.push(c,R[k],R[(k+1)%R.length]);}}
 cellT[N*N]=idx.length/3;
 const F=a=>new Float32Array(a),n=pos.length/3,g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(F(pos),3));g.setAttribute('uv',new THREE.BufferAttribute(F(uv),2));
 g.setAttribute('aCrack',new THREE.BufferAttribute(F(ck),1));g.setAttribute('aRock',new THREE.BufferAttribute(F(rk),1));g.setAttribute('aOcc',new THREE.BufferAttribute(F(oc),1));g.setAttribute('aSun',new THREE.BufferAttribute(F(sn),1));g.setAttribute('aLay',new THREE.BufferAttribute(F(lay),2));g.setAttribute('aPave',new THREE.BufferAttribute(F(pv),1));
 g.setIndex(new THREE.BufferAttribute(n>65535?new Uint32Array(idx):new Uint16Array(idx),1));g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m,{rings:[3,18],depth:[.5,4]});m.userData.probeSkip=true;m.userData.inspectLabel='The high desert';scene.add(m);
 // the drawn height: the triangles of the cell under (x,z), by barycentric test (NaN off the map)
 const P=g.attributes.position.array,X=g.index.array;
 m.userData.hAt=(x,z)=>{const i=Math.floor((x+S/2)/cs),j=Math.floor((z+S/2)/cs);if(i<0||j<0||i>=N||j>=N)return NaN;const c=j*N+i;
  for(let t=cellT[c];t<cellT[c+1];t++){const A=X[t*3]*3,B=X[t*3+1]*3,C=X[t*3+2]*3,ax=P[A],az=P[A+2],bx=P[B]-ax,bz=P[B+2]-az,cx=P[C]-ax,cz=P[C+2]-az,px=x-ax,pz=z-az;
   const d=bx*cz-bz*cx;if(d===0)continue;const u=(px*cz-pz*cx)/d,v=(bx*pz-bz*px)/d;
   if(u>=-1e-9&&v>=-1e-9&&u+v<=1+1e-9)return P[A+1]+u*(P[B+1]-P[A+1])+v*(P[C+1]-P[A+1]);}return NaN;};
 window._ground={verts:n,tris:idx.length/3,lip:LV.filter(l=>l===GRID.M).length,river:LV.filter(l=>l===GRID.RL).length,ms:Math.round(performance.now()-t0)};
 return m;})();
// the undercut's rock, put back above the cave: the ground's own material, both sides, with the
// ground's attributes (uv on the painted map, the paint's rock weight, PA: the Abyss wall is painted, not strata; the
// cave's walls, floor and ceiling (caveK) are bedded rock, 2026-10-25)
// THE TERRAIN'S HORIZON (core/terrain/45-core-horizon.js, KHORIZON, 2026-10-26: HEIGHT-RESEARCH item 2): the horizon in eight
// directions over the ground square (256 texels a side, ~29 m), so at a low sun the buttes, the gorge's walls and the Abyss's rim
// throw their shadows across the desert and the gorge's floor sees less sky; the carve below takes it with the ground's hook
// THE FAR COUNTRY (core/terrain 44, KFAR; the final rebuild 2026-10-27, the universal set; ?far=0 for none): the ground's own closure carried
// past the painted square to 14.5 km, so the Inner Wall's ramp runs on into the west, the trackless dunes north and south, and the Abyss's
// floor 720 m down in the east, in the paint's colours read from afar (bluer and paler with distance); the square's edge sinks 20 m under the
// ground mesh so the two never fight. The shared sky's ridges stay behind it (the Wall's ranges, the Abyss's far side)
const FAR=(function(){if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=GRID.S/2,L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={red:L([168,90,66]),red2:L([136,72,52]),sand:L([220,160,112]),mtn:L([122,106,94]),bad:L([184,104,63]),cliff:L([90,58,48]),floor:L([150,104,80]),far:L([168,160,158])};
 const G=KFAR.grid({lines:KFAR.lines({cell:80,inner:S0+20,out:14500,grow:1.03}),dense:true,
  h:(x,z)=>Math.abs(x)<S0&&Math.abs(z)<S0?terrainH(x,z)-20:terrainH0(x,z,false),
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the painted ground */
  color:(x,z,y,q)=>{const n=fbm(x*.0021,z*.0021,301,2)-.5;let c=mixC(C.red,C.red2,clamp(.5+n*1.8,0,1));
   c=mixC(c,C.bad,badK(x,z)*.6);c=mixC(c,C.sand,duneK(x,z));c=mixC(c,C.mtn,smooth(.08,.5,clamp(mtnH(x,z)/900,0,1))*.9);
   const ab=abyssK(x,z);c=mixC(c,C.cliff,ab*smooth(-80,-500,y)*smooth(-700,-600,y));c=mixC(c,C.floor,smooth(-640,-700,y)*ab);
   return mixC(c,C.far,.25*smooth(5000,13000,q.r));}});
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'sedesert-far';
 const mesh=new THREE.Mesh(KFAR.geometry(G),mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The far country (the Inner Wall\'s ramp, the dunes, the Abyss floor beyond the map)';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
const GROUND_HZ=(function(){const t0=performance.now(),H=KHORIZON.bake({box:[-GRID.S/2,-GRID.S/2,GRID.S/2,GRID.S/2],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});window._horizon={ms:Math.round(performance.now()-t0),n:H.n};return H;})();
KHORIZON.shade(MAT_GROUND,GROUND_HZ);
/* the carve's material runs the ground's composed hook (every layer on MAT_GROUND, those added later too: the wet ground, the sky's cloud shade). The sky
   adds its cloud shade and its height fog to each lit material it finds, so the carve would run them twice on one shader: on MeshStandard the shade throws
   and the fog's varyings are declared twice (2026-11-04; on Lambert the shade throws too). Their names are held here by empty layers, the ground's
   chain drawing them */
const MAT_CARVE=MAT_GROUND.clone();MAT_CARVE.side=THREE.DoubleSide;MAT_CARVE.onBeforeCompile=MAT_GROUND.onBeforeCompile;MAT_CARVE.customProgramCacheKey=()=>'sedesert-carve';
['atmos-cloudshade-1','atmos-heightfog'].forEach(k=>KHOOK.add(MAT_CARVE,k,function(){},{key:'via-ground'}));
const CARVE_MESHES=(function(){const S=TERR.R*2.2,M=BIO.carve.mesh(MAT_CARVE,{sun:SUNV,gridNormals:true});   /* gridNormals: the normals from the sampled grid, not from terrainBase (core/terrain 36, 2026-10-25) */
 for(const m of M){const g=m.geometry,P=g.attributes.position,Nr=g.attributes.normal,n=P.count,uv=new Float32Array(n*2),rk=new Float32Array(n);
  for(let v=0;v<n;v++){const x=P.getX(v),z=P.getZ(v);uv[v*2]=x/S+.5;uv[v*2+1]=.5-z/S;rk[v]=Math.max(PA('strata',x,z),caveK(x,P.getY(v),z));}
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aCrack',new THREE.BufferAttribute(new Float32Array(n),1));
  scene.add(m);}
 for(const Q of BIO.carve.patches)REGISTER({name:Q.name,cls:'carve',x:Q.c[0]-Q.n[0]*Q.depth*.5,z:Q.c[1]-Q.n[1]*Q.depth*.5,y:Q.floorY,r:Q.hw+2,h:Q.h+6});
 window._carve=BIO.carve.patches.map(Q=>Object.assign({id:Q.id},Q.stats));return M;})();

// ---------------------------------------------------------------- the water
// The pond (SEDESERT_WATER's hue: the teal of a wadi pool) is core/water's open surface since 2026-10-20 (migration phase 2: it was a
// disc in the page's own vertex-coloured MAT_WATER, paler over gravel shallows). The river, the cataract and its plunge pool are core/water's (Phases 3
// and 4, 2026-10-13): their records here (WATER.flow down the canyon floor, WATER.fall from the notch, WATER.still on
// the Abyss floor), drawn in 89w-host-water.js once core/atmos is bound; the mist stays the page's sprites.
const WHUE=SEDESERT_WATER.hue;
const WATER_SHALLOW=new THREE.Color().setHSL(WHUE,.55,.46),WATER_MID=new THREE.Color().setHSL(WHUE,.62,.30),WATER_DEEP=new THREE.Color().setHSL(WHUE,.6,.15),WATER_PALE=new THREE.Color().setHSL(WHUE-.03,.35,.62);
// The pond as core/water: an open surface at PL with three wind ripples of 20, 12 and 6 m (slopes about the ripple normal's below), calmed to
// nothing at the shore by its bed, drawn by WATER.draw in 89w-host-water.js (before 2026-10-20 the page drew it as a disc of 165 m in its own
// shader and wrote its `look` on the record for the port). core/export's water section carries it, with WATER's own heights as probes. The disc was 165 m, so outside it
// the bed stands above the level (the draw fades the water out over it).
const POND_R=165;
const POND_WATER=WATER.open({name:'The pond',level:PL,swell:[[.06,20,35,0,.03],[.035,12,-50,1.3,.03],[.015,6,80,2.2,.02]],field:0,
 bounds:[POND.x-POND_R-10,POND.z-POND_R-10,POND.x+POND_R+10,POND.z+POND_R+10],bedCell:4,
 bed:(x,z)=>Math.hypot(x-POND.x,z-POND.z)>POND_R?Math.max(terrainH(x,z),PL+.5):terrainH(x,z)});
// THE RIVER (core/water Phase 3): a flow line down the canyon floor at WL(x) every 12 m, from the mountain gorge to the
// notch, the surface never climbing downstream (where WL(x) rises over the bed's noise the water holds its level), 22 m
// wide with 1.5 m tucked under each bank (the old ribbon's 24 m); its speed rises in the gorge and toward the notch,
// where the old ribbon painted its rapids (the flow shader whitens wherever the line steepens)
const RIVER_PTS=[];for(let x=-TERR.R*1.1;x<=TERR.RIM+34;x+=12){const y=WL(x),n=RIVER_PTS.length;RIVER_PTS.push([x,zR(x),n?Math.min(y,RIVER_PTS[n-1][2]):y]);}
const RIVER=WATER.flow({name:'The river',pts:RIVER_PTS,width:22,speed:RIVER_PTS.map(p=>1.1+1.4*smooth(-2200,-2900,p[0])+1.6*smooth(TERR.RIM-260,TERR.RIM+20,p[0]))});
// the cataract: a curtain from the notch at the rim to the Abyss floor, streaked, foaming white at the lip and at the plunge pool.
// Since 2026-10-13 it is core/water's (WATER.fall below, drawn in 89w-host-water.js); TEX_FALL and MAT_FALL stay defined
// because TEX_FALL's painter draws from rng(), and every placement after it reads the same sequence
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
// THE CATARACT (core/water Phase 3): the lip across the notch, 26 m wide; the water leaves it at 10.5 m/s (a riffle
// over the promontory's sill) and ARCS, a parabola from that speed, 730 m down to the Abyss floor, landing about 128 m
// out (where the old hand-drawn curtain landed) and widening 29 m a side (the old curtain's 13 to 42 m half-width).
// FALL.mesh is its drawn curtain (89w-host-water.js), which the host's rock checks read
const CATARACT=WATER.fall({name:'The cataract',lip:[[FALL.x,FALL.z-13,FALL.y],[FALL.x,FALL.z+13,FALL.y]],dir:[1,0],speed:10.5,drop:FALL.y-FALL.floor,spread:29});
(function(){const H=FALL.y-FALL.floor;
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
 // the plunge pool on the Abyss floor (core/water Phase 4: still water, its outline the old fan's), the floor's rocks
 // standing out of it; the fall's own churn is drawn where the curtain lands (89w-host-water.js)
 {const px=FALL.x+40+90+40,pz=FALL.z,PN=36,poly=[];
  for(let k=0;k<PN;k++){const a=k/PN*TAU,r=150*(1+.15*Math.sin(3*a)+.1*Math.sin(5*a+1));poly.push([px+Math.cos(a)*r,pz+Math.sin(a)*r]);}
  FALL.pool=WATER.still({name:'The plunge pool',level:-703,poly});}
 REGISTER({name:'The cataract',x:FALL.x+60,z:FALL.z,y:FALL.floor,r:160,h:H+40});})();
