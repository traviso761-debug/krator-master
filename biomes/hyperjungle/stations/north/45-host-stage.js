// ================================================================= HOST — stage (STATION 3, SCREAMER WOOD: hyperjungle N's jungle; the map below is the station's; the rest as src/45)
// PLAN-LANDS.md section 3 (J3, 2026-11-08): near the Hexahedron (px 555,338), on the howl bamboo's way out of the Cut. Half as wet as
// S (~1,035 mm): only a third of the land is closed jungle, the rest abyssal savannah and Aw. Here the forest thins eastward and opens
// into savannah gaps (their blind grass is savannarim's, read in place when the page carries it: J4), the kit's hypertrees grow at the
// pure scale but thinner (ironbark and ghostwood lead, the prism gum rare), and stand dead as bone giants where the rain fails. The
// howl bamboo comes down the valley from the Cut's south-east mouth (off the map to the north-west: its reach, H1).
// THE MAP (x east, z south, R 3600): station 1's rolling floor, a valley NW to SE with its stream, the forest's dryness rising to the
// east and south-east (dryK), the savannah gaps in the dry half (gapK), the bamboo along the valley floor (groveK). Noise from core/rand.
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

// ---------------------------------------------------------------- the map
const TERR={R:3600,swell:30,rough:5};
const KN=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,(o==null?3:o),s)-.5;
function line(P){const out=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];
  const n=Math.max(2,Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/30));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);out.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}
 out.push(P[P.length-1]);const c=[0];for(let i=1;i<out.length;i++)c.push(c[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));
 let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;out.forEach(p=>{x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);});
 return{pts:out,cum:c,len:c[c.length-1],box:[x0,z0,x1,z1]};}
// the stream's spans in a KSPACE (core/space) for the distance lookups
const STREAM=line([[-4000,-2900],[-2600,-1700],[-1300,-1100],[-200,-300],[700,100],[1700,900],[2800,1500],[4000,2500]]);
const STREAM_S=KSPACE.create({cell:40});for(let i=0;i<STREAM.pts.length-1;i++){const a=STREAM.pts[i],b=STREAM.pts[i+1];STREAM_S.insert({a,b,t0:STREAM.cum[i]/STREAM.len,t1:STREAM.cum[i+1]/STREAM.len},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2);}
const _sq=[];
function streamQ(x,z){for(let pad=60;pad<=7680;pad*=2){STREAM_S.query(x,z,pad,_sq);if(!_sq.length)continue;let best=1e18,bt=0;
  for(const s of _sq){const ex=s.b[0]-s.a[0],ez=s.b[1]-s.a[1],l2=Math.max(1e-12,ex*ex+ez*ez),u=clamp(((x-s.a[0])*ex+(z-s.a[1])*ez)/l2,0,1),dx=s.a[0]+ex*u-x,dz=s.a[1]+ez*u-z,d=dx*dx+dz*dz;if(d<best){best=d;bt=s.t0+(s.t1-s.t0)*u;}}
  if(Math.sqrt(best)<=pad)return{d:Math.sqrt(best),t:bt};}return{d:1e9,t:0};}
const brookDist=(x,z)=>streamQ(x,z).d;
// the land: swells, the valley's floor sunk 25 m along the stream and the land rising 40 m to the dry south-east
const landH=(x,z)=>TERR.swell*KN(x,z,.00042,17,3)*2+TERR.rough*KN(x,z,.0026,29,2)*2+40*smooth(-1500,3200,x+.5*z);
const VALLEY=(x,z)=>{const d=brookDist(x,z);return 25*Math.exp(-Math.pow(d/700,2));};
const SFOOT=(()=>{const a=STREAM.pts[STREAM.pts.length-1],b=STREAM.pts[0];return{y0:landH(a[0],a[1])-VALLEY(a[0],a[1])-1.5,y1:landH(b[0],b[1])-VALLEY(b[0],b[1])-1.5};})();
const streamY=t=>{const a=SFOOT.y1,b=Math.min(SFOOT.y0,SFOOT.y1);return a+(b-a)*t;};   /* its level falls from the north-west down to the south-east */
function terrainH(x,z){const q=streamQ(x,z),h=landH(x,z)-VALLEY(x,z);if(q.d>60)return h;const y=streamY(q.t)-1.6*(1-smooth(4,10,q.d));return Math.min(h,Math.max(y,y+(q.d-9)*.12));}
// the dryness (0 the wet jungle to the west, 1 the dry south-east), the savannah gaps in the dry half, the groves along the valley
const dryK=(x,z)=>clamp(smooth(-2200,2800,x+.35*z+500*KN(x,z,.0007,701,3)*2),0,1);
const gapK=(x,z)=>{const d=dryK(x,z);if(d<.3)return 0;return smooth(.04,.16,KN(x,z,.0011,702,3)+.18*(d-.55))*smooth(.3,.6,d);};
const groveK=(x,z)=>{const d=brookDist(x,z);if(d>800)return 0;return smooth(820,320,d)*smooth(.1,-.05,KN(x,z,.0018,703,2))*(1-gapK(x,z));};
// THE CUT's reach (H1, core/biome 40: BIO.reachW): the howl bamboo's home is the Cut, its south-east mouth ~11 km north-west of the map's
// centre; the station's host says the distance (BIO.host.distance below), the species carries reach {from: 'cut', km: 150}
const CUT_MOUTH=[-8000,-7600];
// ---------------------------------------------------------------- the host binding
// This is the whole contract between a world and a biome. OBSTACLES is filled
// by whatever the host builds before the biome (the tower, in this file set).
const OBSTACLES=[];
BIO.init({tags:'hyperjungle',THREE:THREE,scene:scene,terrainH:terrainH,
 mask:(x,z)=>{const b=brookDist(x,z);if(b<14)return 0;const m=b<26?(b-14)/12:1;return m*(1-gapK(x,z))*(1-.55*dryK(x,z))*(1-.92*groveK(x,z));},   /* the stream bare; the forest thins east, opens in the gaps and gives way to the groves */
 // the local water surface: the brook ribbon below (18 m wide, 0.35 m over its bed), no water anywhere else. Without
 // it the core's default sea at y=0 stood over this floor (which lies below 0) and every exported tile came in drowned
 waterH:(x,z)=>{const q=streamQ(x,z);return q.d<8?streamY(q.t)+.3:-1e9;},
 obstacles:OBSTACLES,ticks:tick,seed:7,origin:[0,0],err:reportErr});
BIO.setSun([-1200,900,-600]);
BIO.host.distance=(from,x,z)=>from==='cut'?Math.hypot(x-CUT_MOUTH[0],z-CUT_MOUTH[1]):null;   /* H1: the reach's distance (metres) from a species' home polygon */
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
  if(Math.abs(wx)<TERR.R*1.05&&Math.abs(wz)<TERR.R*1.05){const dk=dryK(wx,wz),gk=gapK(wx,wz),gv=groveK(wx,wz);
   r=lerp(r,r*1.35+8,dk*.6);gg=lerp(gg,gg*1.15,dk*.6);b=lerp(b,b*1.1,dk*.6);   /* the drier floor: paler litter */
   if(gv>0){r=lerp(r,64+n2*18,gv*.7);gg=lerp(gg,62+n2*14,gv*.7);b=lerp(b,36,gv*.7);}   /* the bamboo's sheath litter */
   if(gk>0){r=lerp(r,150+(n-.5)*40+(n2-.5)*24,gk);gg=lerp(gg,124+(n-.5)*30+(n2-.5)*18,gk);b=lerp(b,72+(n-.5)*16,gk);}}   /* a savannah gap: straw over red-brown soil */
  const bk=clamp(1-brookDist(wx,wz)/28,0,1);           // silt and pebbles along the stream
  r=lerp(r,96+n2*30,bk);gg=lerp(gg,84+n2*22,bk);b=lerp(b,62,bk);
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
 KGROUND.hook(MAT_GROUND,{key:'hyperjungle-north-ground',layers:GLIB,relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null});}   /* the relief (no texture unit) and the mesh's hollows (aKGAO below); no tri: no near steep flank */
else if(GLIT)MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uGLit={value:GLIT.map};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aBk;varying float vBk;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vBk=aBk;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uGLit;varying vec3 vGWP;varying float vBk;').replace('#include <map_fragment>','#include <map_fragment>\n{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float m=smoothstep(0.3,0.7,0.5+0.35*sin(p.x*0.0131+1.3)*sin(p.y*0.0097)+0.15*sin(p.x*0.029+p.y*0.023));'+
  'vec3 tl=mix(pow(texture2D(uGLit,p*'+GLIT.k.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uGLit,q*'+(GLIT.k*.53).toFixed(4)+'+vec2(0.37,0.21)).rgb,vec3(2.2)),m);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tl*0.55,0.6*(1.0-vBk));}');};
/* THE DRAWN GROUND (2026-10-27, the owner: the brook showed only in broken slivers): 420 cells a side (~21 m; was 180, 44 m, coarser
   than the brook's 34 m trench, so the ground's triangles spanned it and lay over the water except where a vertex fell in the bed).
   Inside the brook's bare strip (26 m: the mask keeps every plant out of it) the drawn ground is cut down to the bed, under the water
   at the centre and back up to the bank by the strip's edge, so the water shows its whole length; terrainH itself is unchanged */
(function(){const N=420,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++){p.setY(i,terrainH(p.getX(i),p.getZ(i)));}
 {const bk=new Float32Array(p.count);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);bk[i]=clamp(Math.max(1-brookDist(x,z)/28,gapK(x,z)),0,1);}g.setAttribute('aBk',new THREE.BufferAttribute(bk,1));}   /* no litter layer on the gaps or the stream */
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.userData.probeSkip=true;m.userData.inspectLabel='Screamer wood\'s floor (the drier litter, the savannah gaps, the bamboo litter)';scene.add(m);
 // the brook water is core/water's (BROOK below, drawn in 89w-host-water.js)
 })();
// THE STREAM (core/water): a flow down the valley, a point every 40 m, its surface the stage's waterH
const BROOK_PTS=[];for(let s=0;s<=STREAM.len;s+=40){const i=Math.min(STREAM.pts.length-1,Math.round(s/STREAM.len*(STREAM.pts.length-1))),p=STREAM.pts[i];if(Math.max(Math.abs(p[0]),Math.abs(p[1]))>TERR.R*1.08)continue;BROOK_PTS.push([p[0],p[1],streamY(streamQ(p[0],p[1]).t)+.3]);}
const BROOK=WATER.flow({name:'The stream down the valley',pts:BROOK_PTS,width:16,speed:.8});
// ---------------------------------------------------------------- the station's hooks into the kit and the shared host
// THE HABIT (50, 55): the pure scale, thinner; ironbark and ghostwood lead (they stand drought best), the prism gum rare; the monsoon
// forest's kapoks and baobabs bare in the dry season (N has one: XV, Aw)
var HYPERJUNGLE_LOOK={deciduous:[3,5],habit:{H:[[1,1],[1,1],[1,1],[1,1],[1,1],[1,1]],share:[.31,.29,.04,.12,.12,.12],spacing:190}};
const STATION_BUILD={build:{heroR:2000},region:{name:'Screamer wood: hyperjungle N\'s jungle (ideal type)',x:0,z:0,r:TERR.R,h:420}};
const STATION_SKY={px:555,py:338,label:'hyperjungle N near the Hexahedron'};
const STATION_WET=(x,z)=>brookDist(x,z)<30?0:1;
const STATION_FAR={canopy:true,label:'Screamer wood and the savannah past the map',h:(x,z)=>{const d=Math.max(Math.abs(x),Math.abs(z))-TERR.R*1.1;return terrainH(x,z)+smooth(0,1200,d)*(1-.8*dryK(x,z))*(48+12*KN(x,z,.0011,301,3)*2);}};
const STATION_TAKE={title:'Krator biome — the hyperjungle: Screamer wood',pandanMin:4,
 hint:'Station 3: hyperjungle N\'s jungle, howl bamboo down the valley from the Cut, watchers at the edge, bone giants where the rain fails',
 views:{
  'Down the valley':[-1300,90,-1300,600,10,200],
  'Into the savannah gaps':[1100,40,-300,2600,20,600],
  'Over Screamer wood':[-1300,420,1300,400,40,-200],
  'The dry edge':[1500,8,500,2400,40,900],
 },
 more(V){const st=window._station||{},at=(s,dx,dy,dz,ty)=>{if(!s)return;V[s.label]=[s.x+dx,terrainH(s.x+dx,s.z+dz)+dy,s.z+dz,s.x,terrainH(s.x,s.z)+ty,s.z];};
  at(st.groveAt,-35,3,-25,30);at(st.boneAt,-260,20,-200,120);at(st.watcherAt,-45,2.5,-30,25);at(st.handAt,-30,6,-22,25);at(st.pipeAt,-5,1.6,-4,.6);at(st.bloodAt,-30,3,-20,12);},
 checks(add){const st=window._station||{},n=st.n||{};
  add('the north species drawn',(()=>{const need=Object.assign({howlbamboo:1500,bonegiant:15,watcher:40,handflower:15,bloodwood:20,skullpod:60,widowhair:60,ghostpipe:30,devilsfingers:30},typeof SAVRIM!=='undefined'?{blindgrass:3000}:{}),bad=Object.keys(need).filter(k=>!(((n[k]==null?0:n[k]))>=need[k]));
   return{ok:!bad.length,detail:Object.keys(need).map(k=>k+' '+((n[k]==null?0:n[k]))).join(', ')+(bad.length?'; short: '+bad.join(', '):'')};})());
  add('the howl bamboo howls (old culms bored) and flowers by cohort',(()=>{const b=st.bamboo||{};return{ok:b.groves>0&&b.holed>0&&b.holed<b.culms&&b.states&&Object.keys(b.states).length>=1&&(typeof KTAGS==='undefined'||!KTAGS.sound||b.sounds>0),
   detail:((b.groves==null?0:b.groves))+' groves, '+((b.culms==null?0:b.culms))+' culms ('+((b.holed==null?0:b.holed))+' bored), '+((b.sprays==null?0:b.sprays))+' sprays; '+(b.sounds==null?0:b.sounds)+' howling (H9 sound records); states '+JSON.stringify(b.states||{})};})());
  add('the Cut\'s reach (H1) weighs the groves',(()=>{const r=st.reach;return{ok:!!r&&r.w>0&&r.w<=1&&r.far===0,detail:r?'weight at the centre '+r.w.toFixed(3)+', at 160 km '+r.far:'no reach'};})());
  add('bone giants where the rain fails',(()=>{const B=st.bones||[];if(!B.length)return{ok:false,detail:'none'};const wet=B.filter(b=>dryK(b.x,b.z)<.25).length;
   return{ok:wet===0,detail:B.length+' bone giants; in the wet west (dryK < .25): '+wet+'; widow\'s hair '+((n.widowhair==null?0:n.widowhair))};})());
  add('the hypertrees thinner, ironbark and ghostwood leading, the prism gum rare',(()=>{const m=(window._biome&&window._biome.heroMix)||[];const t=Math.max(1,m.reduce((a,b)=>a+b,0));
   return{ok:m.length===6&&(m[0]+m[1])/t>.4&&m[2]/t<.12,detail:'hero mix '+m.join(', ')};})());
  add('quiet: the fauna hunted thin',(()=>{const F=st.fauna;if(!F)return{ok:false,detail:'no fauna plan'};return{ok:F.animals.length<300&&F.thin===true,detail:F.animals.length+' animals in '+F.groups.length+' groups (the land\'s densities halved: hunted); missing '+(F.missing.join(', ')||'none')};})());},
 negatives(add){add('a reach with no distance (weight 0)',(()=>{const w=BIO.reachW?BIO.reachW({from:'nowhere',km:10},0,0):0;return{ok:w>0,detail:'weight '+w};})());
  add('a bone giant in the wet west',(()=>{const k=dryK(-3400,-3000);return{ok:k>=.25,detail:'dryK in the far west '+k.toFixed(2)};})());}};
