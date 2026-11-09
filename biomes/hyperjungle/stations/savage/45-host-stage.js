// ================================================================= HOST — stage (STATION 2, THE SAVAGE HYPERJUNGLE: the map below is the station's; the rest as src/45)
// PLAN-LANDS.md section 2 (J2, 2026-11-08): the Beast Riders' home, near Mav's Refuge (px 752,477). The same climate as station 1's
// jungle; what sets it apart is its soil, its history and its beasts. The volcano's ash, carried here on the NW wind, falls on ground
// the herds dung heavily: the richest soil in the crater, a darker floor than S's. The old growth stands 300-480 m (the kit's habit:
// HYPERJUNGLE_LOOK.habit below, 50 and 55), wider apart. The herds keep BAIS open (clearings 200 m to 1 km across, a lawn of bai
// sedge, wallows of mud that dry to cracked pans, salt licks of red clay chewed into the banks), and wear straight BEAST TRAILS
// 4-8 m wide between the bais and the water. The brook is station 1's.
// THE MAP (x east, z south, R 3600): station 1's rolling floor and brook; seven bais; trails from each bai to the brook and between
// bais; KSPACE holds the trails' spans for the masks (core/space). Noise from core/rand.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb7c4ae);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00030);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,12000);
scene.add(new THREE.HemisphereLight(0xbcd0c8,0x3d3a26,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.34);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- terrain
// Gently rolling hyperjungle floor: long swells with a finer roughness, and a
// shallow brook line running roughly north-south through the middle (a bare
// strip the biome's mask keeps clear -- it is riparian ground, tagged as such).
const TERR={R:3600,swell:38,rough:6};
function terrainH(x,z){
 const a=fbm(x*.00042+3.1,z*.00042-1.7,17,3)-.5,b=fbm(x*.0026-2,z*.0026+5,29,2)-.5;
 const brook=Math.exp(-Math.pow((x-90*Math.sin(z*.0012))/34,2));
 return TERR.swell*a*2+TERR.rough*b*2-brook*3.2;}
function brookDist(x,z){return Math.abs(x-90*Math.sin(z*.0012));}
// ---------------------------------------------------------------- the bais, the trails, the wallows and the licks
const KN=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,(o==null?3:o),s)-.5;
const BAIS=[[520,-420,380],[-900,700,260],[1400,900,220],[-1500,-1100,300],[300,1600,160],[2600,-1800,450],[-2500,1900,340]].map((b,i)=>({i,x:b[0],z:b[1],r:b[2]}));
// a bai's edge wanders 18% about its radius; baiK: 1 inside, falling to 0 over its fringe (1 to 1.25 r: the trampled ring)
const baiQ=(B,x,z)=>{const a=Math.atan2(z-B.z,x-B.x),re=B.r*(1+.18*Math.sin(a*3+B.i*1.7)+.12*KN(x,z,.004,611+B.i,2)*2);return Math.hypot(x-B.x,z-B.z)/re;};
function baiK(x,z){let k=0;for(const B of BAIS){if(Math.abs(x-B.x)>B.r*1.6||Math.abs(z-B.z)>B.r*1.6)continue;const q=baiQ(B,x,z);k=Math.max(k,smooth(1.02,.86,q));}return k;}
function baiFringe(x,z){let k=0;for(const B of BAIS){if(Math.abs(x-B.x)>B.r*1.7||Math.abs(z-B.z)>B.r*1.7)continue;const q=baiQ(B,x,z);k=Math.max(k,smooth(1.32,1.05,q)*smooth(.9,1.05,q));}return k;}
const baiAt=(x,z)=>{for(const B of BAIS)if(Math.hypot(x-B.x,z-B.z)<B.r*1.3&&baiQ(B,x,z)<1)return B;return null;};
// the wallows (mud pans) and salt licks of each bai, from KRAND.hash(bai): 2-4 pans inside, 1-2 licks on the rim
const WALLOWS=[],LICKS=[];
BAIS.forEach(B=>{const h=KRAND.hash(6113,B.i),u=k=>KRAND.unit(KRAND.hash(h,k));const n=2+Math.floor(u(1)*3);
 for(let k=0;k<n;k++){const a=u(10+k)*TAU,d=B.r*(.15+.5*u(20+k));WALLOWS.push({x:B.x+Math.cos(a)*d,z:B.z+Math.sin(a)*d,r:8+17*u(30+k),dry:u(40+k)<.45,bai:B.i});}
 for(let k=0;k<1+Math.floor(u(2)*2);k++){const a=u(50+k)*TAU;LICKS.push({x:B.x+Math.cos(a)*B.r*.92,z:B.z+Math.sin(a)*B.r*.92,r:14+16*u(60+k),bai:B.i,a});}});
const wallowK=(x,z)=>{let k=0;for(const W of WALLOWS){const d=Math.hypot(x-W.x,z-W.z);if(d<W.r*1.3)k=Math.max(k,smooth(W.r*1.15,W.r*.8,d));}return k;};
const lickK=(x,z)=>{let k=0;for(const L of LICKS){const d=Math.hypot(x-L.x,z-L.z);if(d<L.r*1.4)k=Math.max(k,smooth(L.r*1.2,L.r*.6,d));}return k;};
// the trails: each bai to the brook (the nearest bank due east or west) and the bais chained to their neighbours; each a polyline that
// wanders a little about the straight line (beasts walk straight), 4-8 m wide; their spans in a KSPACE (cell 24 m) for the lookups
const TRAILS=[];{const pairs=[[0,1],[0,2],[0,3],[1,4],[3,6],[2,5],[1,6]];
 const add=(a,b,w,s)=>{const P=[],n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/12));for(let i=0;i<=n;i++){const t=i/n,ox=b[1]-a[1],oz=-(b[0]-a[0]),ol=Math.max(1e-9,Math.hypot(ox,oz)),
   wob=Math.sin(t*Math.PI)*(14*Math.sin(t*7+s)+8*KN(a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1]),.01,640+s,2)*2);P.push([a[0]+t*(b[0]-a[0])+ox/ol*wob,a[1]+t*(b[1]-a[1])+oz/ol*wob]);}
  TRAILS.push({pts:P,w});};
 BAIS.forEach(B=>{const bx=90*Math.sin(B.z*.0012);add([B.x,B.z],[bx+(B.x>bx?14:-14),B.z+40*Math.sin(B.i)],5+3*KRAND.unit(KRAND.hash(6114,B.i)),B.i);});
 pairs.forEach(([i,j],k)=>add([BAIS[i].x,BAIS[i].z],[BAIS[j].x,BAIS[j].z],4+4*KRAND.unit(KRAND.hash(6115,k)),10+k));}
const TRAIL_S=KSPACE.create({cell:24});TRAILS.forEach((T,ti)=>{for(let i=0;i<T.pts.length-1;i++){const a=T.pts[i],b=T.pts[i+1];
 TRAIL_S.insert({a,b,w:T.w,t:ti},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+T.w*.5+12);}});
const _tq=[];
// the distance to the nearest trail's edge (0 on it; 99 when none within 12 m of an edge), and its width there
function trailD(x,z){TRAIL_S.query(x,z,0,_tq);let best=99;for(const s of _tq){const ex=s.b[0]-s.a[0],ez=s.b[1]-s.a[1],l2=Math.max(1e-12,ex*ex+ez*ez),u=clamp(((x-s.a[0])*ex+(z-s.a[1])*ez)/l2,0,1);
  const d=Math.hypot(s.a[0]+ex*u-x,s.a[1]+ez*u-z)-s.w*.5;if(d<best)best=Math.max(0,d);}return best;}
const trailK=(x,z)=>smooth(4,0,trailD(x,z));
// the ash: a darker, richer floor (k 0..1), with old ash beds showing where the brook cuts its banks
const ashK=(x,z)=>clamp(.65+.5*KN(x,z,.0016,650,3)*2,0,1);
// ---------------------------------------------------------------- the host binding
// This is the whole contract between a world and a biome. OBSTACLES is filled
// by whatever the host builds before the biome (the tower, in this file set).
const OBSTACLES=[];
BIO.init({tags:'hyperjungle',THREE:THREE,scene:scene,terrainH:terrainH,
 mask:(x,z)=>{const b=brookDist(x,z);let m=b<14?0:b<26?(b-14)/12:1;if(m<=0)return 0;   // the brook bed is bare
  m*=1-baiK(x,z);if(m<=0)return 0;m*=1-.55*baiFringe(x,z);return m*smooth(0,3,trailD(x,z));},   /* the bais' lawns and the trails are open; the bais' fringe trampled */
 // the local water surface: the brook ribbon below (18 m wide, 0.35 m over its bed), no water anywhere else. Without
 // it the core's default sea at y=0 stood over this floor (which lies below 0) and every exported tile came in drowned
 waterH:(x,z)=>{const cx=90*Math.sin(z*.0012);return Math.abs(x-cx)<9?terrainH(cx,z)+.35:-1e9;},
 obstacles:OBSTACLES,ticks:tick,seed:7,origin:[0,0],err:reportErr});
BIO.setSun([-1200,900,-600]);
// THE GRAPHICS SET (2026-10-27, the final rebuild; core/biome README "Adopting it", nhighlands and eastabyss the worked examples):
// the items' geometry welded and drawn by index (?index=0 the soup); one LOD mesh per chunk, small meshes merged to 1500 triangles,
// a dithered cross-fade over the last 15% of each range (?lodmerge=0, ?lodfade=0) and the per-instance range cull (?lodcull=0)
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
// the ground as one mesh, painted dark litter with the brook bed lighter
const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/30,y/30,.3,2),n2=fbm(x/5,y/5,7,1);
  let r=30+(n-.5)*22+(n2-.5)*12,gg=42+(n-.5)*30+(n2-.5)*14,b=22+(n-.5)*14;
  const ak=ashK(wx,wz);r=lerp(r,r*.72,ak);gg=lerp(gg,gg*.78,ak);b=lerp(b,b*.8,ak);   /* the ash: a darker, richer floor */
  const bk=clamp(1-brookDist(wx,wz)/28,0,1);           // silt and pebbles along the brook, the old ash beds dark in its cut
  r=lerp(r,lerp(96+n2*30,40+n2*14,smooth(.55,.85,n)),bk);gg=lerp(gg,lerp(84+n2*22,38+n2*12,smooth(.55,.85,n)),bk);b=lerp(b,lerp(62,34,smooth(.55,.85,n)),bk);
  if(Math.abs(wx)<TERR.R*1.05&&Math.abs(wz)<TERR.R*1.05){const bai=baiK(wx,wz),fr=baiFringe(wx,wz),tr=trailK(wx,wz);
   if(fr>0){r=lerp(r,58+n2*16,fr*.6);gg=lerp(gg,48+n2*12,fr*.6);b=lerp(b,30,fr*.6);}   /* the trampled fringe: bare dung-dark earth */
   if(bai>0){r=lerp(r,74+(n-.5)*30+(n2-.5)*20,bai);gg=lerp(gg,96+(n-.5)*34+(n2-.5)*20,bai);b=lerp(b,42+(n-.5)*14,bai);}   /* the bai's sedge lawn */
   if(tr>0){r=lerp(r,72+n2*20,tr);gg=lerp(gg,56+n2*14,tr);b=lerp(b,36+n2*8,tr);}   /* a beast trail: trodden bare */
   const wk=wallowK(wx,wz);if(wk>0){const dry=WALLOWS.some(W=>W.dry&&Math.hypot(wx-W.x,wz-W.z)<W.r*1.2),crk=dry&&(Math.abs(Math.sin(wx*.9+Math.sin(wz*.7)*2))<.12||Math.abs(Math.sin(wz*.8+Math.sin(wx*.6)*2))<.12);
    r=lerp(r,dry?(crk?48:112+n2*20):46+n2*10,wk);gg=lerp(gg,dry?(crk?40:96+n2*16):38+n2*8,wk);b=lerp(b,dry?(crk?32:72):28,wk);}   /* a wallow: wet mud, or a dry pan cracked */
   const lk=lickK(wx,wz);if(lk>0){r=lerp(r,150+n2*30,lk);gg=lerp(gg,72+n2*16,lk);b=lerp(b,44,lk);}}   /* a salt lick: red clay chewed bare */
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
/* the library's forest floor (materials.json ground.litter: grass, moss and litter, ground.moss001) over the painted litter, off the brook's silt: a ground layer
   anti-tiled (two scales, one turned) and darkened to the closed canopy's gloom; without the pack the ground is the painted one */
const GLIT=(function(){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('hyperjungle','ground.litter'):null;if(!L)return null;
 const t=KMAT.textures(L,{aniso:8}).map;t.wrapS=t.wrapT=THREE.RepeatWrapping;return{map:t,k:1/L.scale[0]};})();
/* THE LITTER ON core/terrain's ground shader (KGROUND, 43-core-ground.js; 2026-10-27, the final rebuild): the same layer at the same
   strength (60% toward the paint times the litter at .55, none on the brook's silt), hex-tiled and scaled with distance where the page
   mixed two turned scales by a sine mask. ?kground=0 (or no pack) keeps the page's own mix below */
const GLIB=(function(){if(typeof KGROUND==='undefined'||new URLSearchParams(location.search).get('kground')==='0')return null;
 const L=KGROUND.layer('hyperjungle','ground.litter',{w:'(1.0-vBk)',amt:.6,gain:.55,tint:'diffuse'});return L?[L]:null;})();
/* THE GROUND'S LIGHT PER PIXEL (2026-11-04, the ground catch-up; core/terrain/GROUND.md): on KGROUND the floor is MeshStandard, so the
   relief's bump and cavities reach the light (r128's Lambert lights per vertex); ?kground=0 (or no pack) keeps the Lambert;
   ?kgrelief=0 drops the relief (the before-and-after on this page) */
const KG_RELIEF=!!GLIB&&new URLSearchParams(location.search).get('kgrelief')!=='0';
const MAT_GROUND=GLIB?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0x8c8c86,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x8c8c86});   // litter under closed canopy: dark, no shadow maps here
if(GLIB){MAT_GROUND.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aBk;varying float vBk;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvBk=aBk;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vBk;');};
 KGROUND.hook(MAT_GROUND,{key:'hyperjungle-savage-ground',layers:GLIB,relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null});}   /* the relief (no texture unit) and the mesh's hollows (aKGAO below); no tri: no near steep flank */
else if(GLIT)MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uGLit={value:GLIT.map};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aBk;varying float vBk;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vBk=aBk;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uGLit;varying vec3 vGWP;varying float vBk;').replace('#include <map_fragment>','#include <map_fragment>\n{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float m=smoothstep(0.3,0.7,0.5+0.35*sin(p.x*0.0131+1.3)*sin(p.y*0.0097)+0.15*sin(p.x*0.029+p.y*0.023));'+
  'vec3 tl=mix(pow(texture2D(uGLit,p*'+GLIT.k.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uGLit,q*'+(GLIT.k*.53).toFixed(4)+'+vec2(0.37,0.21)).rgb,vec3(2.2)),m);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tl*0.55,0.6*(1.0-vBk));}');};
/* THE DRAWN GROUND (2026-10-27, the owner: the brook showed only in broken slivers): 420 cells a side (~21 m; was 180, 44 m, coarser
   than the brook's 34 m trench, so the ground's triangles spanned it and lay over the water except where a vertex fell in the bed).
   Inside the brook's bare strip (26 m: the mask keeps every plant out of it) the drawn ground is cut down to the bed, under the water
   at the centre and back up to the bank by the strip's edge, so the water shows its whole length; terrainH itself is unchanged */
const brookBed=z=>{const cx=90*Math.sin(z*.0012);return terrainH(cx,z);};
const groundY=(x,z)=>{const h=terrainH(x,z),d=brookDist(x,z);return d<26?Math.min(h,brookBed(z)-.25+2.6*smooth(9,26,d)):h;};
(function(){const N=420,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++){p.setY(i,groundY(p.getX(i),p.getZ(i)));}
 {const bk=new Float32Array(p.count);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);bk[i]=clamp(Math.max(1-brookDist(x,z)/28,baiK(x,z),trailK(x,z),lickK(x,z)),0,1);}g.setAttribute('aBk',new THREE.BufferAttribute(bk,1));}   /* no litter layer on the bais, the trails and the licks */
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.userData.probeSkip=true;m.userData.inspectLabel='Forest floor (the ash-dark floor, the bais and the trails)';scene.add(m);
 // the brook water is core/water's (BROOK below, drawn in 89w-host-water.js)
 })();
// THE BROOK (core/water, 2026-10-20: the old static 18 m ribbon in a MeshStandardMaterial): a flow line down the centreline
// 90 sin(z .0012) every 40 m, its surface exactly BIO.waterH (the bed + .35 m: the floor mask and the open world's readers),
// 18 m wide with a metre tucked under each bank. Its speed is a slow brook's; where the bed falls steeper than 1.2% the flow shader
// whitens it (a riffle), which the old flat ribbon never showed.
const BROOK_PTS=[];for(let z=-TERR.R;z<=TERR.R;z+=40){const cx=90*Math.sin(z*.0012);BROOK_PTS.push([cx,z,terrainH(cx,z)+.35]);}
const BROOK=WATER.flow({name:'The brook',pts:BROOK_PTS,width:18,speed:.9});
// ---------------------------------------------------------------- the station's hooks into the kit and the shared host
// THE OLD-GROWTH HABIT (50, 55): heights x1.4-1.6 (the gate baobab x1.1-1.2: the 150-200 m giant of Mav's Refuge's gateways), boles x1.25
// and crowns x1.15; ghostwood and prism gum lead, the mahogany rarer (the Refuge's holds); heroes 230 m apart (165 in S). H6: the far
// impostors' cell for a 480 m crown at the hero range (BIO.IMP.cellFor, 34: 128 px), the crown items' reach (87)
var HYPERJUNGLE_LOOK={deciduous:[],habit:{H:[[1.4,1.6],[1.4,1.6],[1.4,1.6],[1.1,1.2],[1.4,1.6],[1.4,1.6]],rb:1.25,crownR:1.15,share:[.16,.24,.26,.12,.08,.14],spacing:230,
 impCell:(BIO.IMP&&BIO.IMP.cellFor)?Math.min(128,BIO.IMP.cellFor(330,1200,{max:128})):64}};
const STATION_BUILD={build:{heroR:2000},region:{name:'The savage hyperjungle (ideal type)',x:0,z:0,r:TERR.R,h:560}};
const STATION_SKY={px:752,py:477,label:'the savage hyperjungle near Mav\'s Refuge'};
const STATION_WET=(x,z)=>brookDist(x,z)<30||wallowK(x,z)>.3?0:1;
/* the far roof at the old growth's height (83's default is S's 45-60 m crowns): 230-320 m over the floor, rising over 1.2 km past the square */
const STATION_FAR={canopy:true,label:'The old growth past the map',h:(x,z)=>{const d=Math.max(Math.abs(x),Math.abs(z))-TERR.R*1.1;return terrainH(x,z)+smooth(0,1200,d)*(270+45*KN(x,z,.0011,301,3)*2);}};
// the views: every preset inside the hero disc (99's check); the bai's herd, the cathedral fig and the pitchers are found by the
// station's build (87: window._station) and added in more()
const B0=BAIS[0];
const STATION_TAKE={title:'Krator biome — the hyperjungle: the savage land',pandanMin:8,budget:{tris:13000000,calls:560},
 hint:'Station 2: the old growth to 480 m on ash-rich ground, a bai the herds keep open, beast trails, cathedral figs, comb trees, carnivorous plants in the shade',
 views:{
  'The bai':[B0.x-B0.r*.7,terrainH(B0.x-B0.r*.7,B0.z+B0.r*.4)+3,B0.z+B0.r*.4,B0.x+B0.r*.3,terrainH(B0.x,B0.z)+30,B0.z-B0.r*.4],
  'Over the old growth':[-1500,620,-1100,300,260,200],
  'A beast trail':[B0.x-B0.r*1.25,terrainH(B0.x-B0.r*1.25,B0.z)+2.2,B0.z+6,B0.x-B0.r*2.4,terrainH(B0.x-B0.r*2.4,B0.z)+6,B0.z+140],
  'The floor under 480 m crowns':[-600,terrainH(-600,-200)+2,-200,-560,140,-120],
  'Canopy top':[1200,520,-400,200,380,300],
 },
 more(V){const st=window._station||{},at=(k,dx,dy,dz,ty)=>{const s=st[k];if(!s)return;V[s.label]=[s.x+dx,terrainH(s.x+dx,s.z+dz)+dy,s.z+dz,s.x,terrainH(s.x,s.z)+ty,s.z];};
  at('figAt',-70,30,-60,140);at('arumAt',-12,3,-9,4);at('herdAt',-60,6,-45,3);
  if(st.pitcherAt){const p=st.pitcherAt;V[p.label]=[p.x-14,p.y+4,p.z-10,p.x,p.y-1,p.z];}
  if(st.combAt){const c=st.combAt;V[c.label]=[c.x-90,c.y-30,c.z-70,c.x,c.y,c.z];}},
 checks(add){const st=window._station||{};
  add('the old growth: the canopy at 300-480 m',(()=>{const H=(HYPERJUNGLE.TREES||[]).filter(T=>T.hero).map(T=>T.H).sort((a,b)=>a-b);if(!H.length)return{ok:false,detail:'no heroes'};
   const med=H[H.length>>1],top=H[H.length-1];return{ok:med>=260&&top>=420&&top<=500,detail:H.length+' heroes, median '+Math.round(med)+' m, tallest '+Math.round(top)+' m'};})());
  add('the savage species drawn',(()=>{const need={cathedralfig:3,combtree:6,armourpalm:60,elephantear:120,bailawn:3000,skypitcher:40,carrionarum:2,snareliana:12},bad=Object.keys(need).filter(k=>!(((st.n&&st.n[k]!=null?st.n[k]:0))>=need[k]));
   return{ok:!bad.length,detail:Object.keys(need).map(k=>k+' '+((st.n&&st.n[k]!=null?st.n[k]:0))).join(', ')+(bad.length?'; short: '+bad.join(', '):'')};})());
  add('carnivory stays occasional (the three traps under 1% of the plants placed)',(()=>{const n=st.n||{},tr=((n.skypitcher==null?0:n.skypitcher))+((n.carrionarum==null?0:n.carrionarum))+((n.snareliana==null?0:n.snareliana)),all=(st.plants==null?0:st.plants);
   return{ok:all>0&&tr>0&&tr/all<.01,detail:tr+' traps of '+all+' plants ('+(all?(100*tr/all).toFixed(2):'-')+'%)'};})());
  add('the traps carry core/biome 37 records',(()=>{const L=HYPERJUNGLE.LANDS.savage,bad=L.TRAPS.filter(k=>{const t=L.byKey[k].tags.trap;return!t||!t.cycle||t.danger==null;});
   const arum=L.byKey.carrionarum.tags.trap;return{ok:!bad.length&&arum.danger>0&&L.byKey.skypitcher.tags.trap.danger===0,detail:L.TRAPS.map(k=>k+' '+L.byKey[k].tags.trap.kind+' danger '+L.byKey[k].tags.trap.danger).join(', ')};})());
  add('every new species tagged with a harvest',(()=>{const bad=HYPERJUNGLE.LANDS.savage.SPECIES.filter(S=>!S.tags.harvest).map(S=>S.key);return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):'8 tagged'};})());
  add('the herds: the Riders\' beasts wild at savage size, in the bais',(()=>{const F=st.fauna;if(!F)return{ok:false,detail:'no fauna plan'};
   const big=F.animals.filter(a=>a.scale>=1.2-1e-9&&a.scale<=1.4*1.25+1e-9).length,inBai=F.groups.filter(g=>g.role==='grazer'&&baiK(g.at[0],g.at[2])>.5).length,grz=F.groups.filter(g=>g.role==='grazer').length;
   return{ok:F.animals.length>0&&inBai>0&&inBai===grz&&F.animals.some(a=>a.key==='threehorn'||a.key==='hardshell'),detail:F.animals.length+' animals in '+F.groups.length+' groups ('+grz+' grazing herds, '+inBai+' in a bai); '+big+' at savage scale; missing in the bundle: '+(F.missing.join(', ')||'none')};})());
  add('bais and trails open (no hypertree on a lawn or a trail)',(()=>{let bad=0;for(const T of HYPERJUNGLE.TREES||[])if(T.hero&&(baiK(T.x,T.z)>.5||trailD(T.x,T.z)<.5))bad++;return{ok:!bad,detail:BAIS.length+' bais, '+TRAILS.length+' trails, '+WALLOWS.length+' wallows, '+LICKS.length+' salt licks; heroes on them: '+bad};})());},
 negatives(add){add('a bai with no lawn',(()=>{const k=baiK(1e5,1e5);return{ok:k>0,detail:'baiK far off the map '+k};})());
  add('a trap record with no cycle',(()=>{const t={kind:'pitfall'};return{ok:!!(t.cycle&&t.danger!=null),detail:'a bare record'};})());}};
