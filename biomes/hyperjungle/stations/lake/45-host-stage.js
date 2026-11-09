// ================================================================= HOST — stage (STATION 3, THE LAKE AND THE FLOODED FOREST: the map below is the station's; the rest as src/45)
// PLAN-STATIONS.md station 3 and PLAN-LANDS.md section 6 (the várzea, kept): the lake 4.21 settled in hyperjungle S (about 7,500 km²
// at -1,499 m) and the forest that stands in its water half the year. The site is an ideal type of its western shore, not the
// model's cells (the survey is owed, as at eastabyss station 2).
// THE MAP (x east, z south, R 3000; levels in metres on the page's datum):
//   x > shore(z)          THE LAKE: open water to the east edge and on into the far field; low water at LOW, high water 8 m up
//   shore .. shore-1.7 km  THE VÁRZEA: forest on ground between the two levels, standing in water at high water (0.8-6 m deep),
//                          on a dry mud floor at low; stilt kapoks, moriche swamps (aguajal) in its back-swamps, floating meadows
//                          and sky lilies on the open water at its edge
//   west of that           TERRA FIRME: the closed hyperjungle (the kit's own forest) on a terrace 2-30 m over high water
//   the river              white water from the west, across the terrace and the várzea to the lake; the black-water creek (an
//                          igarapé) joins it in the várzea: one confluence (89w)
// The kit reads terrainH, the mask and waterH, as at station 1. Noise from core/rand.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb7c4ae);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00026);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xbcd0c8,0x3d3a26,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.34);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
const TERR={R:3000,swell:0,rough:0};
const LOW=-1.5,HIGH=LOW+8;   /* the lake's low and high water (WATER.still seasonal, 89w): the flood pulse of a várzea, 8 m */
const KN=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5;
const shoreX=z=>300+260*Math.sin(z*.0009+.6)+120*Math.sin(z*.0023+1.9);
// across the shore, metres: positive into the lake, negative inland (the várzea to -1.7 km, then the terrace)
const across=(x,z)=>x-shoreX(z)+50*KN(x,z,.003,401,2)*2;
// a polyline, densified (Catmull-Rom) to ~30 m; dl(L, x, z) -> {d, t (0 at its head, 1 at its foot), i}
function line(P){const out=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];
  const n=Math.max(2,Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/30));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);out.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}
 out.push(P[P.length-1]);const c=[0];for(let i=1;i<out.length;i++)c.push(c[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));
 let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;out.forEach(p=>{x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);});
 return{pts:out,cum:c,len:c[c.length-1],box:[x0,z0,x1,z1]};}
function dl(L,x,z){const B=L.box;if(x<B[0]-400||x>B[2]+400||z<B[1]-400||z>B[3]+400)return{d:1e9,t:0,i:0};
 let best=1e18,bt=0,bi=0;const P=L.pts;
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez||1,u=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/l2));
  const dx=a[0]+ex*u-x,dz=a[1]+ez*u-z,d2=dx*dx+dz*dz;if(d2<best){best=d2;bt=(L.cum[i]+u*(L.cum[i+1]-L.cum[i]))/L.len;bi=i;}}
 return{d:Math.sqrt(best),t:bt,i:bi};}
// THE RIVER (white water: a silty, tan river off the hills to the west) and THE CREEK (black water, tea-dark off the terrace's
// sands), which joins it in the várzea; each a level that rises gently upstream (y = foot + rise * (1 - t)), a width, a depth
const JOIN=[-940,-470];
const RIVER={L:line([[-3400,-980],[-2500,-820],[-1700,-700],[-1100,-560],JOIN,[-500,-360],[-60,-260],[shoreX(-200)+160,-200]]),w:46,depth:3.2,foot:LOW+.35,rise:4.2};
const CREEK={L:line([[-2700,1250],[-2050,820],[-1550,300],[-1220,-180],[JOIN[0]-14,JOIN[1]+18]]),w:22,depth:2.2,foot:0,rise:3.2};
CREEK.foot=RIVER.foot+RIVER.rise*(1-dl(RIVER.L,JOIN[0],JOIN[1]).t)+.02;   /* the creek meets the river at its level there */
const lvl=(R,t)=>R.foot+R.rise*(1-t);
// ---------------------------------------------------------------- terrain
function groundH(x,z){const t=across(x,z);
 const vz=LOW+.4+6.8*smooth(0,-1700,t)+1.1*KN(x,z,.004,402,3)*2*smooth(40,-300,t)-1.6*smooth(.36,.24,KRAND.fbm(x*.0021,.5,z*.0021,2,404))*smooth(-200,-500,t)*smooth(-1600,-1300,t);   /* back-swamps: the moriche pockets */
 const tf=7.6+26*smooth(-1800,-3400,t)+4*KN(x,z,.0012,403,3)*2;
 const lk=LOW-.6-2.6*smooth(0,260,t)-9*smooth(260,1600,t);
 let h=mix(vz,tf,smooth(-1550,-1850,t));return mix(h,lk,smooth(-20,40,t));}
function carve(h,R,x,z){const q=dl(R.L,x,z);if(q.d>R.w*8)return h;const y=lvl(R,q.t),hw=R.w*.5;
 const bed=y-R.depth*(1-smooth(hw*.35,hw*1.05,q.d)),bank=y+.9+(q.d-hw)*.08;   /* the bed under the water, the valley walls rising out of it */
 return Math.min(h,q.d<hw*1.05?bed:Math.max(bed,bank));}
function terrainH(x,z){let h=groundH(x,z);h=carve(h,RIVER,x,z);h=carve(h,CREEK,x,z);return h;}
// the inland weight of the floor painter and the mask: 1 on the terrace, 0 on the open lake
const zoneW=(x,z)=>{const t=across(x,z);return{lake:smooth(-20,40,t),varzea:smooth(-1850,-1550,t)*smooth(40,-20,t),firme:smooth(-1550,-1850,t)};};
// near the rivers (the station's brookDist: the far field's seam, the wet ground's mask)
function brookDist(x,z){return Math.min(dl(RIVER.L,x,z).d,dl(CREEK.L,x,z).d);}
// ---------------------------------------------------------------- the station's hooks into the kit and the shared host
const STATION_FAR={canopy:true,
 h:(x,z)=>{const t=across(x,z);if(t>0)return Math.min(terrainH(x,z),LOW-1.2);const S0=TERR.R*1.1,d=Math.max(Math.abs(x),Math.abs(z))-S0;
  return terrainH(x,z)+smooth(0,1200,d)*smooth(-300,-900,t)*(48+12*KN(x,z,.0011,301,3)*2);},   /* the lake on east, a flat floor under its low water (the still draws the water over it, so the two never meet); the canopy's roof inland */
 label:'The far shore and the lake past the map'};
const STATION_BUILD={build:{R:TERR.R-150,heroR:2200},region:{name:'The lake and the flooded forest (ideal type)',x:0,z:0,r:TERR.R,h:520}};
const STATION_WET=(x,z)=>across(x,z)>-30||brookDist(x,z)<40?0:1;   /* no puddles in the lake or the channels */
const STATION_SKY={px:676,py:512,label:'the lake'};   /* the lake's western shore on the scale model (approximate: the survey is owed) */
var HYPERJUNGLE_LOOK={deciduous:[]};   /* the várzea is evergreen (50 reads it) */
const STATION_TAKE={title:'Krator biome — the hyperjungle: the lake and the flooded forest',
 hint:'Station 3: the lake and the várzea (the flooded forest at high and low water), its river and black-water creek',
 views:{
  'The várzea':[-640,7,-120,-330,14,-60],

  'The lake shore':[shoreX(0)+240,22,80,-300,40,0],
  'Over the lake':[1400,150,-500,-400,30,0],
  'The confluence':[-860,16,-330,-950,2,-470],
  'Sky lilies':[shoreX(420)+70,6,420,shoreX(420)+140,LOW,470],

  'The river mouth':[shoreX(-200)+320,30,-90,shoreX(-200)-120,0,-210],
  'Terra firme':[-2300,30,-300,-1900,60,-100],
 },
 // the station's own views, from what it grew (87: the first stilt kapok, the first moriche grove)
 more(V){const st=window._station||{};const k=st.kapokAt,g=st.groves&&st.groves[0];
  if(k)V['Stilt kapoks']=[k[0]-k[2]*9,terrainH(k[0],k[1])+5,k[1]-k[2]*6,k[0],terrainH(k[0],k[1])+12,k[1]];
  if(g)V['Moriche swamp']=[g[0]-g[2]*1.3,terrainH(g[0],g[1])+8,g[1]-g[2]*.6,g[0],terrainH(g[0],g[1])+30,g[1]];},
 checks(add){const S=window._lake;
  add('the lake rises and falls with the season',(()=>{if(!S)return{ok:false,detail:'no seasonal lake'};const lo=S.levelOf(0),hi=S.levelOf(1),n=WATER.stepSeasons(KHOST.host.clock);
   return{ok:Math.abs(lo-LOW)<1e-6&&Math.abs(hi-HIGH)<1e-6&&n>=1,detail:'low '+lo+' m, high '+hi+' m, now '+S.level.toFixed(2)+' m; '+n+' seasonal surface(s) stepped'};})());
  const st=window._station||{};
  add('the várzea species drawn',(()=>{const need={stiltkapok:20,moriche:30,skylily:200,floatgrass:40,pandan:12},bad=Object.keys(need).filter(k=>!((st[k]||0)>=need[k]));
   return{ok:!bad.length,detail:Object.keys(need).map(k=>k+' '+(st[k]||0)).join(', ')+(bad.length?'; short: '+bad.join(', '):'')};})());
  add('a confluence where the creek meets the river',{ok:!!window._confluence,detail:window._confluence?'one disc at '+JOIN.join(', '):'none'});},
 negatives(add){add('a lake with no season',(()=>{const S=WATER.still({name:'test',level:0});const ok=!!S.seasonal;WATER.surfaces.splice(WATER.surfaces.indexOf(S),1);return{ok,detail:ok?'seasonal':'no seasonal option'};})());}};
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
BIO.init({tags:'hyperjungle',THREE:THREE,scene:scene,terrainH:terrainH,
 // nothing rooted in the lake or a channel; the várzea at a third of the terrace's density (the flood keeps it open: its own trees
 // are the station's, 87), the terrace as at station 1
 mask:(x,z)=>{const t=across(x,z),b=brookDist(x,z);if(t>-15)return 0;const ch=smooth(14,40,b-(dl(RIVER.L,x,z).d<b+1?RIVER.w:CREEK.w)*.5);
  return ch*mix(.33,1,smooth(-1450,-1750,t));},
 // the local water: the lake at its low water where the ground lies under it, the channels at their level
 waterH:(x,z)=>{const t=across(x,z);if(t>-40&&terrainH(x,z)<LOW)return LOW;const r=dl(RIVER.L,x,z);if(r.d<RIVER.w*.6)return lvl(RIVER,r.t);
  const c=dl(CREEK.L,x,z);if(c.d<CREEK.w*.6)return lvl(CREEK,c.t);return -1e9;},
 obstacles:OBSTACLES,ticks:tick,seed:7,origin:[-500,0],err:reportErr});
BIO.setSun([-1200,900,-600]);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
// ---------------------------------------------------------------- the ground: litter on the terrace, grey-brown silt on the várzea
// (the flood's mud, a high-water stain on everything below HIGH), sand on the lake's shallows
const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/30,y/30,.3,2),n2=fbm(x/5,y/5,7,1),Z=zoneW(wx,wz),gy=groundH(wx,wz);
  let r=30+(n-.5)*22+(n2-.5)*12,gg=42+(n-.5)*30+(n2-.5)*14,b=22+(n-.5)*14;
  /* the flood's floor (the owner, 2026-10-27: "a more mottled green-dark rather than that pure grey-brown"): dark olive mud under a film
     of algae and moss in patches at two scales, darker in the damp hollows, a paler silt crust in blotches where it dried first */
  const silt=Z.varzea*smooth(HIGH+.5,HIGH-1,gy),m1=fbm(x/18,y/18,4.1,3),m2=fbm(x/4,y/4,9.3,2),wet=smooth(HIGH-1,LOW+1,gy);
  let vr=38+(m2-.5)*16,vg=50+(m2-.5)*20,vb=28+(m2-.5)*10;
  const alg=smooth(.45,.65,m1);vr=lerp(vr,34,alg);vg=lerp(vg,62+(m2-.5)*18,alg);vb=lerp(vb,30,alg);   /* the green film */
  const dk=smooth(.4,.2,m1)*.6+wet*.25;vr*=1-.35*dk;vg*=1-.3*dk;vb*=1-.3*dk;                        /* the damp hollows */
  const crust=smooth(.72,.85,fbm(x/40,y/40,13.7,2))*(1-wet);vr=lerp(vr,84,crust*.5);vg=lerp(vg,80,crust*.5);vb=lerp(vb,62,crust*.5);
  r=lerp(r,vr,silt);gg=lerp(gg,vg,silt);b=lerp(b,vb,silt);
  const sand=Z.lake;r=lerp(r,122+n*30,sand);gg=lerp(gg,108+n*24,sand);b=lerp(b,80,sand);
  const bk=clamp(1-brookDist(wx,wz)/40,0,1);r=lerp(r,104+n2*26,bk);gg=lerp(gg,90+n2*20,bk);b=lerp(b,66,bk);
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
const GLIT=null;
const GLIB=(function(){if(typeof KGROUND==='undefined'||new URLSearchParams(location.search).get('kground')==='0')return null;
 const L=KGROUND.layer('hyperjungle','ground.litter',{w:'(1.0-vBk)',amt:.6,gain:.55,tint:'diffuse'});return L?[L]:null;})();
/* THE GROUND'S LIGHT PER PIXEL (2026-11-04, the ground catch-up; core/terrain/GROUND.md): on KGROUND the floor is MeshStandard, so the
   relief's bump and cavities reach the light (r128's Lambert lights per vertex); ?kground=0 (or no pack) keeps the Lambert;
   ?kgrelief=0 drops the relief (the before-and-after on this page) */
const KG_RELIEF=!!GLIB&&new URLSearchParams(location.search).get('kgrelief')!=='0';
const MAT_GROUND=GLIB?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0x8c8c86,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x8c8c86});
if(GLIB){MAT_GROUND.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aBk;varying float vBk;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvBk=aBk;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vBk;');};
 KGROUND.hook(MAT_GROUND,{key:'hyperjungle-lake-ground',layers:GLIB,relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null});}   /* the relief (no texture unit) and the mesh's hollows (aKGAO below); no tri: no near steep flank */
(function(){const N=260,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++){p.setY(i,terrainH(p.getX(i),p.getZ(i)));}
 /* aBk: no litter on the silt, the sand or the channels (the litter layer's weight is 1 - aBk) */
 {const bk=new Float32Array(p.count);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),Z=zoneW(x,z);
   bk[i]=clamp(Math.max(Z.lake,Z.varzea*smooth(HIGH+.5,HIGH-1,groundH(x,z))*.45,1-brookDist(x,z)/40),0,1);   /* the library's litter at half strength on the flood's floor: its moss and leaf grain under the paint */}g.setAttribute('aBk',new THREE.BufferAttribute(bk,1));}
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.userData.probeSkip=true;m.userData.inspectLabel='The várzea floor and the terrace';scene.add(m);})();
