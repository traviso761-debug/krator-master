// ================================================================= HOST — stage (the savannah rims: one stage for every land, its map from LAND, 44l)
// The ideal-type host: renderer, lights, fog, a rolling savannah with terrainH(), its river and gallery, the burn mosaic (KFIRE, H3),
// the painted ground, the tick list, the error panel. A real world replaces this whole section; the kit's fragments never read
// anything from it except through BIO.host (BIOME-API.md). After crater-drylands' and the hyperjungle's savanna station's stages.
// THE MAP (x east, z south): swells and the land's rise along LAND.rise; the river (LAND.river) carved, its level falling along it; the
// gallery forest's band along it; kopjes (granite domes); the forest's edge on LAND.edge's side (the jungle, or the wet face's foot);
// laterite pavements by noise; dambos at the valley heads. Noise from core/rand (KRAND.fbm), never a sine hash.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8c8b0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00020);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xc8d2c4,0x4a4028,.64));
const sun=new THREE.DirectionalLight(0xfff0d2,1.5);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
const TERR={R:LAND.R==null?3000:LAND.R};
const KN=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o==null?3:o,s)-.5;
function line(P){const out=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];
  const n=Math.max(2,Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/30));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);out.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}
 out.push(P[P.length-1]);const c=[0];for(let i=1;i<out.length;i++)c.push(c[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));
 return{pts:out,cum:c,len:c[c.length-1]};}
// the river's spans in a KSPACE (core/space) for the distance lookups: {d, t} to the nearest point, t its share along from the source
const RIVER=Object.assign({L:line(LAND.river.pts)},LAND.river);
const RIVER_S=KSPACE.create({cell:40});for(let i=0;i<RIVER.L.pts.length-1;i++){const a=RIVER.L.pts[i],b=RIVER.L.pts[i+1];RIVER_S.insert({a,b,t0:RIVER.L.cum[i]/RIVER.L.len,t1:RIVER.L.cum[i+1]/RIVER.L.len},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2);}
const _rq=[];
function riverQ(x,z){for(let pad=60;pad<=7680;pad*=2){RIVER_S.query(x,z,pad,_rq);if(!_rq.length)continue;let best=1e18,bt=0;
  for(const s of _rq){const ex=s.b[0]-s.a[0],ez=s.b[1]-s.a[1],l2=Math.max(1e-12,ex*ex+ez*ez),u=clamp(((x-s.a[0])*ex+(z-s.a[1])*ez)/l2,0,1),dx=s.a[0]+ex*u-x,dz=s.a[1]+ez*u-z,d=dx*dx+dz*dz;if(d<best){best=d;bt=s.t0+(s.t1-s.t0)*u;}}
  if(Math.sqrt(best)<=pad)return{d:Math.sqrt(best),t:bt};}return{d:1e9,t:0};}
const riverD=(x,z)=>riverQ(x,z).d;
// the land: swells, the rise along LAND.rise, the kopjes' granite domes
const RD=(()=>{const d=LAND.rise.dir,l=Math.max(1e-9,Math.hypot(d[0],d[1]));return[d[0]/l,d[1]/l];})();
const kopjeH=(x,z)=>{let h=0;for(const K of LAND.kopjes||[]){const d=Math.hypot(x-K[0],z-K[1]);if(d<K[2]*1.6)h=Math.max(h,K[3]*Math.pow(Math.max(0,1-Math.pow(d/(K[2]*1.15),2)),.7)*(1+.12*KN(x,z,.03,811,2)*2));}return h;};
const landH=(x,z)=>9*KN(x,z,.0009,802,3)*2+2.5*KN(x,z,.004,803,2)*2+LAND.rise.m*smooth(-TERR.R,TERR.R,x*RD[0]+z*RD[1])+kopjeH(x,z);
const RLV=(()=>{const a=RIVER.L.pts[0],b=RIVER.L.pts[RIVER.L.pts.length-1];return{y0:landH(a[0],a[1])-2,y1:landH(b[0],b[1])-2.2};})();
const riverY=t=>RLV.y0+(Math.min(RLV.y1,RLV.y0)-RLV.y0)*t;
function terrainH(x,z){const h=landH(x,z),q=riverQ(x,z);if(q.d>RIVER.w*10)return h;const y=riverY(q.t),hw=RIVER.w*.5;
 const bed=y-RIVER.depth*(1-smooth(hw*.35,hw*1.05,q.d)),bank=y+.8+(q.d-hw)*.09;return Math.min(h,q.d<hw*1.05?bed:Math.max(bed,bank));}
// the weights: the forest's edge (0 on the savannah .. 1 past LAND.edge), the gallery along the river, the dambos, the laterite, the
// kopjes' rock, and the open savannah (sav) the grass and the fire run on
const EDGE=(()=>{const d=LAND.edge.dir,l=Math.max(1e-9,Math.hypot(d[0],d[1]));return{dx:d[0]/l,dz:d[1]/l,at:LAND.edge.at,w:LAND.edge.w};})();
const zoneW=(x,z)=>{const rd=riverD(x,z),e=x*EDGE.dx+z*EDGE.dz-EDGE.at+120*KN(x,z,.002,804,2)*2,forest=smooth(-EDGE.w*.5,EDGE.w*.5,e);
 const gallery=smooth(170,60,rd)*(1-forest)*smooth(-.1,.15,KN(x,z,.003,805,2)+.12),kop=smooth(1,6,kopjeH(x,z));
 let dambo=0;for(const D of LAND.dambos||[]){const d=Math.hypot(x-D[0],z-D[1]);if(d<D[2]*1.4)dambo=Math.max(dambo,smooth(D[2]*1.2,D[2]*.7,d*(1+.2*KN(x,z,.006,806,2)*2)));}
 const lat=(LAND.laterite==null?0:LAND.laterite)>0?smooth(.08,.2,KN(x,z,.0013,807,3)+(LAND.laterite-.25)*.3)*(1-gallery)*(1-dambo):0;
 const sav=(1-forest)*(1-gallery)*(1-kop*.85);return{rd,e,forest,gallery,kop,dambo,lat,sav};};
// ---------------------------------------------------------------- the burn mosaic (core/biome 38, KFIRE: H3)
// The open grass burns every 2-4 years; the gallery, the forest, the dambos (wet) and the kopjes' rock do not. The burnability is the
// savannah's weight, patchy (KFIRE.patch); the fires are the land's (LAND.fires: this season's still running, last year's and older) and
// KFIRE's own older ones. ?fire=0: no history (the grass full, the ground unburnt)
const FIRE=(function(){if(typeof KFIRE==='undefined'||new URLSearchParams(location.search).get('fire')==='0')return null;
 const P=KFIRE.patch(531);
 return KFIRE.history({R:TERR.R,cell:20,seed:530071,wind:LAND.wind||[-1,.25],old:8,height:(x,z)=>terrainH(x,z),
  burn:(x,z)=>{const W=zoneW(x,z);return W.sav*(1-W.dambo)*smooth(.7,.35,W.gallery)*smooth(.7,.35,W.dambo)*smooth(30,70,W.rd)*P(x,z);},fires:LAND.fires||[]});})();
const burnAge=(x,z)=>FIRE?FIRE.ageAt(x,z):60;
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
BIO.init({tags:'savannarim',THREE:THREE,scene:scene,terrainH:terrainH,
 // the kits' own passes are the host's (87): the mask keeps every plant out of the river and off the kopjes' bare rock
 mask:(x,z)=>{const W=zoneW(x,z);if(W.rd<RIVER.w*.6)return 0;return smooth(RIVER.w*.6,RIVER.w*.6+10,W.rd)*(1-.8*W.kop);},
 waterH:(x,z)=>{const r=riverQ(x,z);return r.d<RIVER.w*.6?riverY(r.t):-1e9;},
 obstacles:OBSTACLES,ticks:tick,seed:11,origin:[0,0],err:reportErr});
BIO.setSun([-1200,900,-600]);
// H1: the reach's distance (metres) from a borrowed species' home polygon: the land's own (LAND.home, by x), null where it has none
BIO.host.distance=(from,x,z)=>LAND.home&&LAND.home[from]?LAND.home[from](x,z):null;
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
// ---------------------------------------------------------------- the ground: straw over red soil, the burns by age (black char this
// season and its ember line, grey ash and a green flush the next, then the straw back), litter under the gallery and the forest, sand
// along the river, laterite's ironstone (dark red-brown gravel), the dambos' wet green, the kopjes' grey granite
const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2,P=LAND.palette;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/30,y/30,.3,2),n2=fbm(x/5,y/5,7,1),W=zoneW(wx,wz);
  let r=P.soil[0]+(n-.5)*30,gg=P.soil[1]+(n-.5)*20,b=P.soil[2]+(n-.5)*14;
  r=lerp(r,P.straw[0]+(n-.5)*40+(n2-.5)*20,.7*W.sav);gg=lerp(gg,P.straw[1]+(n-.5)*30+(n2-.5)*16,.7*W.sav);b=lerp(b,P.straw[2]+(n-.5)*20,.7*W.sav);
  const lit=Math.max(W.gallery,W.forest);r=lerp(r,44+(n2-.5)*16,lit);gg=lerp(gg,46+(n2-.5)*16,lit);b=lerp(b,28,lit);   /* leaf litter under the gallery and the forest */
  if(W.lat>0){r=lerp(r,104+(n2-.5)*40,W.lat*.8);gg=lerp(gg,52+(n2-.5)*20,W.lat*.8);b=lerp(b,34,W.lat*.8);}   /* ironstone */
  if(W.dambo>0){r=lerp(r,P.green[0]+(n2-.5)*16,W.dambo);gg=lerp(gg,P.green[1]+(n2-.5)*20,W.dambo);b=lerp(b,P.green[2],W.dambo);}
  if(W.kop>0){r=lerp(r,128+(n2-.5)*30,W.kop);gg=lerp(gg,120+(n2-.5)*28,W.kop);b=lerp(b,108+(n2-.5)*24,W.kop);}   /* granite */
  if(FIRE&&W.sav>.05){const a=FIRE.ageAt(wx,wz),sv=W.sav*(1-W.dambo);
   if(a<1){const k=sv*smooth(1,.15,a);r=lerp(r,34+n2*16,k);gg=lerp(gg,30+n2*14,k);b=lerp(b,28+n2*12,k);
    const f=FIRE.frontAt(wx,wz);if(a<.05&&f>.955){const e=smooth(.955,.99,f)*sv;r=lerp(r,230,e);gg=lerp(gg,92,e);b=lerp(b,24,e);}}   /* the ember line */
   else if(a<3){const k=sv*smooth(3,1,a);r=lerp(r,92+n*20,k*.55);gg=lerp(gg,104+n*24,k*.55);b=lerp(b,58,k*.55);}}   /* the green flush after a burn */
  const bk=clamp(1-W.rd/40,0,1);r=lerp(r,128+n2*26,bk);gg=lerp(gg,108+n2*20,bk);b=lerp(b,78,bk);
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
/* THE GROUND ON core/terrain's shader (KGROUND): the library's savannah litter (materials.json groundDetail: ground.savanna.litter) as a
   detail layer over the paint, off the river's sand; ?kground=0 (or no pack) keeps the Lambert paint */
const GLIB=(function(){if(typeof KGROUND==='undefined'||new URLSearchParams(location.search).get('kground')==='0')return null;
 const L=KGROUND.layer('savannarim','groundDetail',{w:'(1.0-vBk)',amt:.45,gain:.6,tint:'diffuse'});return L?[L]:null;})();
const KG_RELIEF=!!GLIB&&new URLSearchParams(location.search).get('kgrelief')!=='0';
const MAT_GROUND=GLIB?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0x8c8c86,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x8c8c86});
if(GLIB){MAT_GROUND.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aBk;varying float vBk;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvBk=aBk;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vBk;');};
 KGROUND.hook(MAT_GROUND,{key:'savannarim-ground-'+LAND.key,layers:GLIB,relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null});}
(function(){const N=260,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++){p.setY(i,terrainH(p.getX(i),p.getZ(i)));}
 {const bk=new Float32Array(p.count);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);bk[i]=clamp(1-riverD(x,z)/40,0,1);}g.setAttribute('aBk',new THREE.BufferAttribute(bk,1));}
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.userData.probeSkip=true;m.userData.inspectLabel=LAND.name.replace(' (ideal type)','')+': the ground';scene.add(m);})();
// ---------------------------------------------------------------- the land past the map (83 reads it): the forest's roof past LAND.edge, the grass's
// straw elsewhere, bluer with distance
const STATION_FAR={canopy:true,label:'The savannah and the forest past the map',
 h:(x,z)=>{const W=zoneW(x,z),S0=TERR.R*1.1,d=Math.max(Math.abs(x),Math.abs(z))-S0;return terrainH(x,z)+smooth(0,1200,d)*W.forest*(45+12*KN(x,z,.0011,301,3)*2)+smooth(0,1600,d)*(1-W.forest)*6;},
 color:(x,z,y,q)=>{const L=a=>a.map(v=>Math.pow(v/255,2.2)),W=zoneW(x,z),g=L([52,76,42]),s=L(LAND.palette.straw),f=L([86,96,84]);
  const t=1-W.forest,c=[g[0]+(s[0]-g[0])*t,g[1]+(s[1]-g[1])*t,g[2]+(s[2]-g[2])*t],k=.4*smooth(4500,13000,q.r);return[c[0]+(f[0]-c[0])*k,c[1]+(f[1]-c[1])*k,c[2]+(f[2]-c[2])*k];}};
