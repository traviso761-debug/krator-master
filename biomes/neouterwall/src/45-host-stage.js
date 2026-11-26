// ================================================================= HOST — stage (the NE outer wall: the Glass-Skarn Bastion)
// The ideal-type host for the NEOW kit (forked from biomes/wouterwall's station 1, itself from biomes/nwouterwall's): the station on the
// scale model, the season, the renderer and the light, and the ground's height: the MODEL's own ground round the station's pixel (44n:
// region/far.py's cut of 5.1, 1 km a cell, bicubic) plus the station's relief (44s: SITE, siteRelief: the spring apron, the stair).
//
// WHAT (PLAN.md): an impact-rim wall cooked by Korona's heat (skarn), cut by the Arachnoids' dikes, its plumbing the Outland Gate fault;
// three warm tarns in dike-walled cauldrons. Station 1 is the Vitreous Hollow: the reachable cauldron, wet (2,494 mm) and mild (+9 °C at
// the water, the geothermal pocket in Dfc country). The stations stand near 31 S on the sky model's frame, so the shaded slopes face SOUTH
// (+z) and the sunny ones NORTH (-z).
//
// AXES: metres, x east, z south, y up; the origin at the station's pixel, y = 0 at the tarn's water (NEOW_REGION.site.base: far.py 'level').
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;   // the core's helpers (the page keeps no noise or PRNG of its own: core/rand)
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

// ---------------------------------------------------------------- the station, its air and its season
const BASE=NEOW_REGION.site.base,ATM=NEOW_REGION.site.atm;
// THE SEASON (as the NW outer wall's, whose flora this page reads: the page opens in autumn, the larch gold; a selector switches season). ?season= or #season=;
// the selector reloads the page with it (the season is a build input: the larch's colour, the snow, the flowers)
const SEASONS=['autumn','winter','spring','summer'];
const SEASON=(()=>{const m=/[?&#]season=(\w+)/.exec(location.search+location.hash);return m&&SEASONS.indexOf(m[1])>=0?m[1]:'autumn';})();
// the season's day (the sky model: game start is day 259, the southern spring equinox; the southern summer solstice is year day 350):
// spring melt in late November, high summer in mid-January, the larch's gold in mid-March
const SEASON_DAY={spring:61,summer:121,autumn:176,winter:274}[SEASON];   /* winter: day 274, mid-June, the southern winter's depth */
// THE CLIMATE at a height (PLAN.md section 3): the model's annual mean at the tarn (far.py 'clim': its WH cell, +9 °C), lapsing 6.5 °C a
// km up the wall; the warmest and coldest months 7 °C either side (SITE.amp: 16 / 2 at the water). A shaded slope runs a degree and a half
// colder, a sunny one as much warmer (aspect); the springs' own heat is KTHERM's (47). SITE.warm: a station's own correction
const meanAt=y=>NEOW_REGION.site.mean+(SITE.warm||0)-6.5*y/1000;

// ---------------------------------------------------------------- the model's ground (bicubic over its 1 km cells)
const MODEL=(function(){const G=NEOW_REGION.grid,H=G.h,nx=G.nx,nz=G.nz;
 const at=(i,j)=>H[j<0?0:j>=nz?nz-1:j][i<0?0:i>=nx?nx-1:i];
 const cr=(p0,p1,p2,p3,t)=>p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));
 return (x,z)=>{const u=(x-G.x0)/G.dx,v=(z-G.z0)/G.dz,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,r=[];
  for(let k=-1;k<=2;k++)r.push(cr(at(i-1,j+k),at(i,j+k),at(i+1,j+k),at(i+2,j+k),fu));
  return cr(r[0],r[1],r[2],r[3],fv)-BASE;};})();
// the model's water (the tarn: 125 cells of the 1 km grid in the cut's 49 x 49 round the station): its cells and level, page metres
const MODEL_WATER=NEOW_REGION.grid.water.map(w=>({x:NEOW_REGION.grid.x0+w[0]*NEOW_REGION.grid.dx,z:NEOW_REGION.grid.z0+w[1]*NEOW_REGION.grid.dz,level:w[2]-BASE}));

// ---------------------------------------------------------------- the ground's height
// the far country's own roughness, scaled by how steep the model is there (a wall gets crags, the plateau stays smooth): beyond the
// station's landform the mid ground (to 20 km) is the model plus this. Ridged noise on core/rand. Never on the tarn or its shore: it
// fades in from 30 to 250 m over the water (a ripple of it on the tarn's flat cells stood islands in the water)
function farRough(x,z){const m=MODEL(x,z),k=smooth(30,250,m);if(k<=0)return 0;const s=(MODEL(x+600,z)-MODEL(x-600,z))/1200,t=(MODEL(x,z+600)-MODEL(x,z-600))/1200,st=Math.hypot(s,t);
 const r=1-Math.abs(2*KRAND.fbm(x*.0011+3.7,z*.0011-9.1,0,4,4790)-1);
 return k*(30+700*Math.min(.6,st))*(r-.45);}
// THE TARN'S BED: the model's water cells lie 1-10 m under the level (a 1 km grid's flat lake); a cauldron's tarn is deep, so its bed
// sinks a further 60 m under its middle (the depth the water's colour reads: 89w), from the shoreline down: a cell only a metre under the
// level is deepened too (the bicubic ground bulged over the water there: station 2's verify drew islands in the tarn)
function tarnBed(m){return m<.5?m-60*smooth(.5,-3,m):m;}
// groundH: model + relief (44s: the apron, the stair, the talus). The site's relief runs on past the near box: the apron runs on west
// along the shore past it, so the mid ground near the box is the same country. Memo of the last point.
const _tm={x:NaN,z:NaN,h:0};
// THE SITE'S LANDFORMS on the model (44s: the apron, the dikes, the springs, the stair; the records need the ground they are built on)
siteBuild((x,z)=>tarnBed(MODEL(x,z)));
// Past ~2.2 site radii the relief fades out (the apron's metres would alias on the mid ground's 220 m cells).
function baseH(x,z){const d=Math.hypot(x,z),fade=1-smooth(SITE.R*2.2,SITE.R*4,d),m=MODEL(x,z);
 return tarnBed(m)+(fade>0?siteRelief(x,z)*fade:0)+farRough(x,z)*smooth(SITE.R*1.2,SITE.R*3,d);}
function groundH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=baseH(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}

// ---------------------------------------------------------------- renderer, light, camera
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// the air is 1.11 atm and wet (2,494 mm, the springs' steam on it): a shorter view than the dry bench's, a grey-green haze in the
// cauldron. The shared sky (89s) sets the sun, the hemisphere, the fog and the exposure by the hour; these are the values before it runs
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xbcc4c6,.00008);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,42000);
const HEMI=new THREE.HemisphereLight(0xc8d2de,0x6a5e48,.6);scene.add(HEMI);
const sun=new THREE.DirectionalLight(0xfff2e0,1.5);sun.position.set(-900,1100,-1300);scene.add(sun);   // the sun stands in the north (the shared sky moves it by the hour: 89s)
const fill=new THREE.DirectionalLight(0xb8c8d8,.25);fill.position.set(800,500,900);scene.add(fill);
