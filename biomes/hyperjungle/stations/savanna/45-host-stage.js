// ================================================================= HOST — stage (STATION 2, THE SAVANNA EDGE: the map below is the station's; the rest as src/45)
// PLAN-STATIONS.md station 2: the closed jungle breaking into MONSOON FOREST (its kapoks and baobabs bare in the dry season),
// then GALLERY FOREST along the river, then TALL-GRASS SAVANNA with scattered hypertree outliers, parasol trees, termite
// cathedrals and a dry-season burn mosaic. The site is the se savannah rim near Talia (PLAN-STATIONS.md J0; the polygon's
// `se savannah rim`, ~1,290 mm, Aw/Am), an ideal type of its western edge, where the crater's jungle climbs out onto the rim.
// PLAN-LANDS.md's savannarim kit (J4-J6) is the rims' own kit, later; this station is the hyperjungle's side of the edge, on
// the kit's species and its neighbours' cousins (87).
// THE MAP (x east, z south, R 3000): the forest edge wanders north-south about x -900; west of it the closed jungle, a monsoon band
// ~1.1 km wide inside it, the savanna east of it rising ~30 m to the rim. The river comes off the rim from the east and runs west
// into the jungle, a gallery of forest along it through the grass. Noise from core/rand.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4c8b4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00022);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xc8d2c4,0x4a4028,.64));
const sun=new THREE.DirectionalLight(0xfff0d2,1.5);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
const TERR={R:3000,swell:0,rough:0};
const KN=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5;
const edgeX=z=>-900+300*Math.sin(z*.0008+.4)+120*Math.sin(z*.0021);
// across the forest's edge, metres: positive into the savanna, negative into the jungle (the monsoon band to -1.1 km)
const across=(x,z)=>x-edgeX(z)+70*KN(x,z,.0035,501,2)*2;
function line(P){const out=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];
  const n=Math.max(2,Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/30));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);out.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}
 out.push(P[P.length-1]);const c=[0];for(let i=1;i<out.length;i++)c.push(c[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));
 let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;out.forEach(p=>{x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);});
 return{pts:out,cum:c,len:c[c.length-1],box:[x0,z0,x1,z1]};}
function dl(L,x,z){const B=L.box;if(x<B[0]-500||x>B[2]+500||z<B[1]-500||z>B[3]+500)return{d:1e9,t:0,i:0};
 let best=1e18,bt=0,bi=0;const P=L.pts;
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez||1,u=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/l2));
  const dx=a[0]+ex*u-x,dz=a[1]+ez*u-z,d2=dx*dx+dz*dz;if(d2<best){best=d2;bt=(L.cum[i]+u*(L.cum[i+1]-L.cum[i]))/L.len;bi=i;}}
 return{d:Math.sqrt(best),t:bt,i:bi};}
// the land's own rise: swells, and ~30 m up to the rim eastward
const landH=(x,z)=>9*KN(x,z,.0009,502,3)*2+2.5*KN(x,z,.004,503,2)*2+30*smooth(-1200,3200,x);
// THE RIVER, off the rim (east) into the jungle (west): its level from the foot (west) up, a little under the land it crosses
const RIVER={L:line([[3300,80],[2300,-160],[1500,-60],[700,380],[-200,260],[-1000,120],[-1900,420],[-3300,300]]),w:34,depth:2.6,foot:0,rise:0};
{const h0=landH(-3300,300),h1=landH(3300,80);RIVER.foot=h0-2.2;RIVER.rise=Math.max(0,h1-h0)-1;}
const lvl=(R,t)=>R.foot+R.rise*(1-t);
function carve(h,R,x,z){const q=dl(R.L,x,z);if(q.d>R.w*10)return h;const y=lvl(R,q.t),hw=R.w*.5;
 const bed=y-R.depth*(1-smooth(hw*.35,hw*1.05,q.d)),bank=y+.8+(q.d-hw)*.09;
 return Math.min(h,q.d<hw*1.05?bed:Math.max(bed,bank));}
function terrainH(x,z){return carve(landH(x,z),RIVER,x,z);}
function riverD(x,z){return dl(RIVER.L,x,z).d;}
function brookDist(x,z){return riverD(x,z);}
// the weights: jungle (1 deep in, 0 out on the grass), the monsoon band, the savanna, the gallery forest along the river
const zoneW=(x,z)=>{const e=across(x,z),rd=riverD(x,z),sav=smooth(-150,250,e);
 return{jungle:smooth(-700,-1100,e),monsoon:smooth(-1100,-700,e)*smooth(250,-150,e),sav,gallery:sav*smooth(190,70,rd),e,rd};};
// ---------------------------------------------------------------- the burn mosaic (core/biome 38, KFIRE; BACKPORT.md's row)
// The savanna burns every 1-6 years; the forest does not (no fuel under a closed canopy, and the gallery's damp). The burnability
// is the savanna's weight off the gallery and the river, patchy (KFIRE.patch); the fires: this dry season's, still running (lit 9
// days ago in the east, the wind from the rim driving it west toward the forest edge: the burn front), last year's and two older,
// and KFIRE's own older ones (7-45 years ago). ?fire=0: no history (the grass is everywhere full, the ground unburnt)
const FIRE=(function(){if(typeof KFIRE==='undefined'||new URLSearchParams(location.search).get('fire')==='0')return null;
 const P=KFIRE.patch(521);
 return KFIRE.history({R:TERR.R,cell:20,seed:520071,wind:[-1,.25],old:8,height:(x,z)=>terrainH(x,z),
  burn:(x,z)=>{const W=zoneW(x,z);return W.sav*(1-W.gallery)*smooth(30,70,W.rd)*P(x,z);},
  fires:[{ago:.025,x:2700,z:-2200,frac:.05,veer:.15},{ago:1.2,x:1900,z:1300,frac:.09,veer:.2},{ago:2.6,x:800,z:-1900,frac:.08,veer:.3},{ago:4.1,x:2600,z:400,frac:.1,veer:.2}]});})();
const burnAge=(x,z)=>FIRE?FIRE.ageAt(x,z):60;
// ---------------------------------------------------------------- the station's hooks into the kit and the shared host
const STATION_FAR={canopy:true,
 h:(x,z)=>{const e=across(x,z),S0=TERR.R*1.1,d=Math.max(Math.abs(x),Math.abs(z))-S0;return landH(x,z)+smooth(0,1200,d)*smooth(-200,-700,e)*(50+12*KN(x,z,.0011,301,3)*2);},
 color:(x,z,y,q)=>{const L=a=>a.map(v=>Math.pow(v/255,2.2)),W=zoneW(x,z),g=L([52,76,42]),s=L([150,128,78]),f=L([86,96,84]);
  const t=smooth(-200,300,W.e),c=[g[0]+(s[0]-g[0])*t,g[1]+(s[1]-g[1])*t,g[2]+(s[2]-g[2])*t],k=.4*smooth(4500,13000,q.r);return[c[0]+(f[0]-c[0])*k,c[1]+(f[1]-c[1])*k,c[2]+(f[2]-c[2])*k];},
 label:'The jungle and the savanna past the map'};
const STATION_BUILD={build:{R:TERR.R-150,heroR:2000},region:{name:'The savanna edge (ideal type)',x:0,z:0,r:TERR.R,h:520}};
const STATION_WET=(x,z)=>riverD(x,z)<40?0:1;
const STATION_SKY={px:795,py:606,label:'the se savannah rim near Talia'};
var HYPERJUNGLE_LOOK={deciduous:[3,5]};   /* the monsoon forest: the baobabs and the kapoks bare in the dry season (50 reads it) */
const STATION_TAKE={title:'Krator biome — the hyperjungle: the savanna edge',pandanMin:8,
 hint:'Station 2: the jungle breaking into monsoon forest, gallery forest along the river, tall-grass savanna with termite cathedrals and a burn front',
 views:{
  'The savanna edge':[1100,26,-700,-900,70,-300],
  'Tall grass':[560,3,-620,900,4,-540],
  'Gallery forest':[1000,24,620,300,24,300],
  'Monsoon forest':[-640,9,-380,-1050,32,-560],
  'The burn front':[1500,70,-1250,2300,0,-1900],
  'Over the rim':[2700,280,-2000,-700,40,300],
 },
 more(V){const st=window._station||{};
  if(st.moundAt){const m=st.moundAt;V['Termite cathedrals']=[m[0]-m[2]*4,terrainH(m[0],m[1])+3,m[1]-m[2]*2.5,m[0],terrainH(m[0],m[1])+m[2]*.6,m[1]];}
  if(st.scaleAt){const s=st.scaleAt;V['Fire scale-trees']=[s[0]-40,terrainH(s[0],s[1])+6,s[1]-25,s[0],terrainH(s[0],s[1])+18,s[1]];}},
 checks(add){const st=window._station||{};
  add('the burn mosaic: patches of every age, none in the forest',(()=>{if(!FIRE)return{ok:false,detail:'no fire history'};
   const ages=[0,0,0,0];let inF=0;for(let i=0;i<4000;i++){const x=(KRAND.unit(KRAND.hash(7,i,1))-.5)*2*TERR.R*.9,z=(KRAND.unit(KRAND.hash(7,i,2))-.5)*2*TERR.R*.9,a=FIRE.ageAt(x,z),W=zoneW(x,z);
    if(W.jungle>.9&&a<60)inF++;ages[a<1?0:a<3?1:a<10?2:3]++;}
   return{ok:!inF&&ages[0]>0&&ages[1]>0&&ages[2]>0,detail:'samples by age (<1, 1-3, 3-10, older or never): '+ages.join(', ')+'; burnt inside the jungle: '+inF};})());
  add('the savanna species drawn',(()=>{const need={grass:20000,parasol:20,firescale:10,cycad:20,outlier:2,mound:20},bad=Object.keys(need).filter(k=>!((st[k]||0)>=need[k]));
   return{ok:!bad.length,detail:Object.keys(need).map(k=>k+' '+(st[k]||0)).join(', ')+(bad.length?'; short: '+bad.join(', '):'')};})());
  add('the cousins resolve to their source',(()=>{const K=st.kin||[];return{ok:K.length===2&&K.every(k=>k.tags&&/^eastabyss\./.test(k.tags.kin)),detail:K.map(k=>k.key+' <- '+(k.tags&&k.tags.kin)).join(', ')||'none'};})());},
 negatives(add){add('a burn mosaic with nothing burnt',(()=>{const H=KFIRE.history({R:600,cell:20,seed:1,wind:[1,0],old:0,height:()=>0,burn:()=>0,fires:[]});
  let n=0;for(let i=0;i<200;i++)if(H.ageAt((i%20)*50-500,Math.floor(i/20)*50-250)<60)n++;return{ok:n>0,detail:n+' burnt samples'};})());}};
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
BIO.init({tags:'hyperjungle',THREE:THREE,scene:scene,terrainH:terrainH,
 // the kit's forest: whole in the jungle, a third of it across the monsoon band, the gallery along the river; nothing in the
 // river or out on the grass (its outliers are the station's own, 87)
 mask:(x,z)=>{const W=zoneW(x,z);if(W.rd<RIVER.w*.6)return 0;const ch=smooth(RIVER.w*.6,RIVER.w*.6+14,W.rd);
  return ch*Math.max(W.jungle,W.monsoon*mix(.35,1,smooth(-150,-1000,W.e)),W.gallery*.9);},   /* none on the open grass: its trees are the station's (87) */
 waterH:(x,z)=>{const r=dl(RIVER.L,x,z);return r.d<RIVER.w*.6?lvl(RIVER,r.t):-1e9;},
 obstacles:OBSTACLES,ticks:tick,seed:7,origin:[400,-300],err:reportErr});   /* the LOD spine's origin out on the grass by the edge and the river */
BIO.setSun([-1200,900,-600]);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
// ---------------------------------------------------------------- the ground: litter under the forest, red soil and straw on the
// savanna, its burns by age (black char this season, grey ash and a green flush the next, then the straw back), the ember line of
// the burn front still running, sand along the river
const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/30,y/30,.3,2),n2=fbm(x/5,y/5,7,1),W=zoneW(wx,wz);
  let r=30+(n-.5)*22+(n2-.5)*12,gg=42+(n-.5)*30+(n2-.5)*14,b=22+(n-.5)*14;
  const sv=W.sav*(1-W.gallery*.7);r=lerp(r,118+(n-.5)*40+(n2-.5)*20,sv);gg=lerp(gg,80+(n-.5)*30+(n2-.5)*16,sv);b=lerp(b,50+(n-.5)*20,sv);   /* straw over red soil */
  if(FIRE&&sv>.05){const a=FIRE.ageAt(wx,wz);
   if(a<1){const k=sv*smooth(1,.15,a);r=lerp(r,34+n2*16,k);gg=lerp(gg,30+n2*14,k);b=lerp(b,28+n2*12,k);
    const f=FIRE.frontAt(wx,wz);if(a<.05&&f>.955){const e=smooth(.955,.99,f)*sv;r=lerp(r,230,e);gg=lerp(gg,92,e);b=lerp(b,24,e);}}   /* the ember line */
   else if(a<3){const k=sv*smooth(3,1,a);r=lerp(r,92+n*20,k*.6);gg=lerp(gg,104+n*24,k*.6);b=lerp(b,58,k*.6);}}   /* the green flush after a burn */
  const bk=clamp(1-riverD(wx,wz)/40,0,1);r=lerp(r,118+n2*26,bk);gg=lerp(gg,100+n2*20,bk);b=lerp(b,72,bk);
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
 KGROUND.hook(MAT_GROUND,{key:'hyperjungle-savanna-ground',layers:GLIB,relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null});}   /* the relief (no texture unit) and the mesh's hollows (aKGAO below); no tri: no near steep flank */
(function(){const N=220,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++){p.setY(i,terrainH(p.getX(i),p.getZ(i)));}
 /* aBk: the litter layer only under the forest (its weight is 1 - aBk) */
 {const bk=new Float32Array(p.count);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),W=zoneW(x,z);bk[i]=clamp(Math.max(W.sav*(1-W.gallery),1-W.rd/40),0,1);}g.setAttribute('aBk',new THREE.BufferAttribute(bk,1));}
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.userData.probeSkip=true;m.userData.inspectLabel='The savanna and the forest floor';scene.add(m);})();
