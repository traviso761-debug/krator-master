// ================================================================= HOST — stage (the W outer wall: the loess bench)
// The ideal-type host for the WOW kit (forked from biomes/nwouterwall's): the station on the scale model, the season, the renderer and
// the light, and the ground's height: the MODEL's own ground round the station's pixel (44n: region/far.py's cut of 5.1, 1 km a cell,
// bicubic) plus the station's relief (44s: SITE, siteRelief: the gullies, the knolls) with its terraces stepped on the whole height.
//
// WHAT (PLAN.md): the Outer Wall's inner flank coming apart: loess tablelands at 3-4 km, slump terraces above them, sturzstrom fields
// under the airless crest. Cold and summer-dry. The stations stand near 40 S on the sky model's frame, so the shaded slopes face SOUTH
// (+z) and the sunny ones NORTH (-z).
//
// AXES: metres, x east, z south, y up; the origin at the station's pixel, y = 0 at the model's height there (WOW_REGION.site.base).
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
const BASE=WOW_REGION.site.base,ATM=WOW_REGION.site.atm;
// THE SEASON (as the NW outer wall's: the page opens in autumn, the larch gold; a selector switches season). ?season= or #season=;
// the selector reloads the page with it (the season is a build input: the larch's colour, the snow, the flowers)
const SEASONS=['autumn','winter','spring','summer'];
const SEASON=(()=>{const m=/[?&#]season=(\w+)/.exec(location.search+location.hash);return m&&SEASONS.indexOf(m[1])>=0?m[1]:'autumn';})();
// the season's day (the sky model: game start is day 259, the southern spring equinox; the southern summer solstice is year day 350):
// spring melt in late November, high summer in mid-January, the larch's gold in mid-March
const SEASON_DAY={spring:61,summer:121,autumn:176,winter:274}[SEASON];   /* winter: day 274, mid-June, the southern winter's depth */
// THE CLIMATE at a height (PLAN.md section 1): the model's annual mean at the pixel, lapsing 6.5 °C a km; the warmest and coldest
// months about 13 °C either side (46: WOW.AMP). A shaded slope runs a degree and a half colder, a sunny one as much warmer (aspect).
// SITE.warm: a station's own correction
const meanAt=y=>WOW_REGION.site.mean+(SITE.warm||0)-6.5*y/1000;

// ---------------------------------------------------------------- the model's ground (bicubic over its 1 km cells)
const MODEL=(function(){const G=WOW_REGION.grid,H=G.h,nx=G.nx,nz=G.nz;
 const at=(i,j)=>H[j<0?0:j>=nz?nz-1:j][i<0?0:i>=nx?nx-1:i];
 const cr=(p0,p1,p2,p3,t)=>p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));
 return (x,z)=>{const u=(x-G.x0)/G.dx,v=(z-G.z0)/G.dz,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,r=[];
  for(let k=-1;k<=2;k++)r.push(cr(at(i-1,j+k),at(i,j+k),at(i+1,j+k),at(i+2,j+k),fu));
  return cr(r[0],r[1],r[2],r[3],fv)-BASE;};})();
// the model's water (the slump terraces' sag ponds, station 2; none at station 1): its cells and level, page metres
const MODEL_WATER=WOW_REGION.grid.water.map(w=>({x:WOW_REGION.grid.x0+w[0]*WOW_REGION.grid.dx,z:WOW_REGION.grid.z0+w[1]*WOW_REGION.grid.dz,level:w[2]-BASE}));

// ---------------------------------------------------------------- the ground's height
// the far country's own roughness, scaled by how steep the model is there (a range gets crags, the plateau stays smooth): beyond
// the station's landform the mid ground (to 20 km) is the model plus this. Ridged noise on core/rand.
function farRough(x,z){const s=(MODEL(x+600,z)-MODEL(x-600,z))/1200,t=(MODEL(x,z+600)-MODEL(x,z-600))/1200,st=Math.hypot(s,t);
 const r=1-Math.abs(2*KRAND.fbm(x*.0011+3.7,z*.0011-9.1,0,4,4790)-1);
 return (30+700*Math.min(.6,st))*(r-.45);}
// groundH: model + relief (44s: the gullies, the knolls and the terraces, core/terrain's KRELIEF records). The site's relief runs on past the near box: the
// gullies run out east past it and the yuan's swells go on, so the mid ground near the box is the same country. Memo of the last point.
const _tm={x:NaN,z:NaN,h:0};
// THE SITE'S LANDFORMS on the model (44s: KRELIEF.gully, KRELIEF.terraces; the records need the ground they are cut into)
siteBuild((x,z)=>MODEL(x,z)+siteSwell(x,z));
// Past ~2.2 site radii the relief fades out (the knolls' and the terraces' metres would alias on the mid ground's 220 m cells).
function baseH(x,z){const d=Math.hypot(x,z),fade=1-smooth(SITE.R*2.2,SITE.R*4,d);
 return MODEL(x,z)+(fade>0?siteRelief(x,z)*fade:0)+farRough(x,z)*smooth(SITE.R*1.2,SITE.R*3,d);}
function groundH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=baseH(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}

// ---------------------------------------------------------------- renderer, light, camera
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// the air is about one atmosphere and dry (533 mm, the summer driest), with the dust the wall sheds in it: a long view, a little
// buff haze. The shared sky (89s) sets the sun, the hemisphere, the fog and the exposure by the hour; these are the values before it runs
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xc4c8cc,.00006);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,42000);
const HEMI=new THREE.HemisphereLight(0xc8d2de,0x6a5e48,.6);scene.add(HEMI);
const sun=new THREE.DirectionalLight(0xfff2e0,1.5);sun.position.set(-900,1100,-1300);scene.add(sun);   // the sun stands in the north (the shared sky moves it by the hour: 89s)
const fill=new THREE.DirectionalLight(0xb8c8d8,.25);fill.position.set(800,500,900);scene.add(fill);
