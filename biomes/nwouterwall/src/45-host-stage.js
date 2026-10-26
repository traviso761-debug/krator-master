// ================================================================= HOST — stage (the NW outer wall: the Yeti's High Country)
// The ideal-type host for the NWOW kit: the station on the scale model, the season, the renderer and the light, and the ground's
// height: the MODEL's own ground round the station's pixel (44n: region/far.py's cut of 4.22, ~4 km a cell, bicubic) plus the
// station's relief (44s: SITE, siteRelief) plus the periglacial landforms (46: NWOW.frost, on core/terrain's KFROST).
//
// WHAT (PLAN.md): a dry, cold land in steps on the Outer Wall's inner flank: forest-steppe at ~4 km, open larch on permafrost above
// it, then tundra, fellfield, ice and the airless rim. Its theme is fur: down, wool and hair on everything. The stations stand at
// 28-29 S on the sky model's frame, so the shaded slopes face SOUTH (+z) and the sunny ones NORTH (-z).
//
// AXES: metres, x east, z south, y up; the origin at the station's pixel, y = 0 at the model's height there (NW_REGION.site.base).
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
const BASE=NW_REGION.site.base,ATM=NW_REGION.site.atm;
// THE SEASON (the owner, 2026-10-26: the page opens in autumn; a selector switches to spring melt and summer). ?season= or #season=;
// the selector reloads the page with it (the season is a build input: the larch's colour, the snow, the aufeis, the flowers)
const SEASONS=['autumn','spring','summer'];
const SEASON=(()=>{const m=/[?&#]season=(\w+)/.exec(location.search+location.hash);return m&&SEASONS.indexOf(m[1])>=0?m[1]:'autumn';})();
// the season's day (the sky model: game start is day 259, the southern spring equinox; the southern summer solstice is year day 350):
// spring melt in late November, high summer in mid-January, the larch's gold in mid-March
const SEASON_DAY={spring:61,summer:121,autumn:176}[SEASON];
// THE CLIMATE at a height (PLAN.md section 1): the model's annual mean at the pixel, lapsing 6.5 °C a km; the coldest month ~13.5 °C
// under the mean and the warmest ~11 over it (the continental steps: forest-steppe +5 (17/-9), taiga -1 (12/-14)). A shaded slope
// runs a degree and a half colder, a sunny one as much warmer (aspect, 46). SITE.warm: a station's own correction (the Yeti Valley's
// sun trap and cold pool, 4.22)
const meanAt=y=>NW_REGION.site.mean+(SITE.warm||0)-6.5*y/1000;

// ---------------------------------------------------------------- the model's ground (bicubic over its ~4 km cells)
const MODEL=(function(){const G=NW_REGION.grid,H=G.h,nx=G.nx,nz=G.nz;
 const at=(i,j)=>H[j<0?0:j>=nz?nz-1:j][i<0?0:i>=nx?nx-1:i];
 const cr=(p0,p1,p2,p3,t)=>p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));
 return (x,z)=>{const u=(x-G.x0)/G.dx,v=(z-G.z0)/G.dz,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,r=[];
  for(let k=-1;k<=2;k++)r.push(cr(at(i-1,j+k),at(i,j+k),at(i+1,j+k),at(i+2,j+k),fu));
  return cr(r[0],r[1],r[2],r[3],fv)-BASE;};})();
// the model's water (the lake by the Yeti's capital): its cells and level, page metres
const MODEL_WATER=NW_REGION.grid.water.map(w=>({x:NW_REGION.grid.x0+w[0]*NW_REGION.grid.dx,z:NW_REGION.grid.z0+w[1]*NW_REGION.grid.dz,level:w[2]-BASE}));

// ---------------------------------------------------------------- the ground's height
// the far country's own roughness, scaled by how steep the model is there (a range gets crags, the plateau stays smooth): beyond
// the station's landform the mid ground (to 20 km) is the model plus this. Ridged noise on core/rand.
function farRough(x,z){const s=(MODEL(x+600,z)-MODEL(x-600,z))/1200,t=(MODEL(x,z+600)-MODEL(x,z-600))/1200,st=Math.hypot(s,t);
 const r=1-Math.abs(2*KRAND.fbm(x*.0011+3.7,z*.0011-9.1,0,4,4790)-1);
 return (30+700*Math.min(.6,st))*(r-.45);}
// groundH: model + relief (+ the landforms once 46 has laid them: NWOW.frostH). Memo of the last point (the passes ask twice).
const _tm={x:NaN,z:NaN,h:0};
function baseH(x,z){const d=Math.hypot(x,z),k=smooth(SITE.R*1.6,SITE.R*3.2,d);
 return MODEL(x,z)+siteRelief(x,z)*(1-k*(SITE.reliefFar==null?0:1-SITE.reliefFar))+farRough(x,z)*smooth(SITE.R*.8,SITE.R*2.4,d);}
function groundH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=baseH(x,z)+(typeof NWOW!=='undefined'&&NWOW.frostH?NWOW.frostH(x,z):0);
 _tm.x=x;_tm.z=z;_tm.h=h;return h;}

// ---------------------------------------------------------------- renderer, light, camera
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// the air is thin and dry (0.77-0.90 atm, 100-300 mm): a long clear view, a deep blue zenith. The shared sky (89s) sets the sun, the
// hemisphere, the fog and the exposure by the hour from its colour script; these are the values before it runs
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xb8c4d0,.00005);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,42000);
const HEMI=new THREE.HemisphereLight(0xc4d2e2,0x5a5444,.6);scene.add(HEMI);
const sun=new THREE.DirectionalLight(0xfff2e0,1.5);sun.position.set(-900,1100,-1300);scene.add(sun);   // the sun stands in the north (the shared sky moves it by the hour: 89s)
const fill=new THREE.DirectionalLight(0xb8c8d8,.25);fill.position.set(800,500,900);scene.add(fill);
