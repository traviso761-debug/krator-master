// ================================================================= HOST — stage (station 3: the spice frontier)
// The ideal-type host for THE THRONE's south-west shore at Zey'danin (NOTES.md, "Zey'danin and the south-west frontier"):
// renderer, lights, haze, the land before the lava. The kit's flow model (46) lays two old flows over it, 47 cuts the
// rest and binds; the hyperjungle kit (read in place) plants the forest; 86 lays out the frontier (the plantations' rows,
// the stumps, the trails, the traps). The core's helpers are globals here (the hyperjungle's 41 declares them).
//
// THE MAP (x east, z south; R 2600). 5.2 km of the Throne's SOUTH-WEST shore, ~115 km from the summit (bearing 64, up the
// flank to the east-north-east), the wettest ground on the island (~4 m of rain, Af). The scale model puts Zey'danin 4 km
// inland at ~-0.5 km; its 2 km cells cannot hold a harbour, and the lore makes it a port (LORE.md §6.12): here the city's
// footprint stands on a spur over a harbour bay, and the flank above it rises at 5-9 %.
//   THE SHORE    black sand, olivine-green sand in the coves, a basalt headland where an old flow met the sea
//   THE BAY      the harbour, under the city's spur
//   THE CITY     Zey'danin's footprint, kept empty for a settlement build (CITY)
//   THE VALLEYS  two lahar valleys flanking the spur: broad gravel floors, a braided stream in each
//   THE FIELDS   the colonists' terraced plantations cut from the forest above the city (FIELDS, 86 plants their rows)
//   THE FOREST   the hyperjungle beyond the fields, where the natives' trails come out of it
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};   // phase timings (ms since the stage began)
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: dense wet sea air (~1.85 atm at the shore): a blue-grey haze, the sun from over the sea in the west
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xbcc6c6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00024);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
const hemi=new THREE.HemisphereLight(0xa8bccc,0x4a5a3a,.9);scene.add(hemi);
const SUN_POS=[-950,900,250];
const sun=new THREE.DirectionalLight(0xffe2b8,1.2);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8c8d0,.26);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the frame of the shore
const TERR={R:2600};
const UP=[.899,-.438],DN=[-.899,.438],PERP=[.438,.899];   // up the flank (ENE, toward the summit), down it, along the shore (SSE)
const uOf=(x,z)=>x*UP[0]+z*UP[1],pOf=(x,z)=>x*PERP[0]+z*PERP[1];
const xzOf=(u,p)=>[UP[0]*u+PERP[0]*p,UP[1]*u+PERP[1]*p];
const SEA=-1530;   // the Ring Sea's surface (the scale model's level here)
// the shoreline: u of the water's edge at p; THE BAY a round harbour under the city
const BAY={u:-1450,p:260,r:430};
function shoreU(p){return -1520+55*Math.sin(p*.0031+.6)+25*Math.sin(p*.011+1.3);}
// THE CITY: Zey'danin's footprint on the spur over the bay, kept empty (a settlement build stands here later)
const CITY=(function(){const c=xzOf(-1230,-260);return{x:c[0],z:c[1],u:-1230,p:-260,r:330};})();
// THE LAHAR VALLEYS: down the flank either side of the spur; broad gravel floors (w), a braided stream in each
const VALLEYS=[{p:-930,w:70,d:9,amp:60,f:.0024,ph:.4},{p:300,w:60,d:7,amp:40,f:.0029,ph:2.1}];
function valleyD(u,p,V){const c=V.p+V.amp*Math.sin(u*V.f+V.ph);return{c,d:Math.abs(p-c)};}
function valleyAt(u,p){let cut=0,bed=0,bank=0;for(const V of VALLEYS){const g=valleyD(u,p,V);if(g.d>V.w*2.5)continue;
  cut=Math.max(cut,V.d*smooth(V.w*2.2,V.w*.8,g.d));bed=Math.max(bed,smooth(V.w*1.05,V.w*.75,g.d));bank=Math.max(bank,smooth(V.w*2.2,V.w,g.d));}
 return{cut,bed,bank};}
// THE FIELDS: the colonists' terraced plantations, rectangles in (u up the flank, p along it); kind mature / young /
// clear (a fresh clearing, cut and burnt, not yet planted). Their terraces follow the contours (the u axis)
const FIELDS=[
 {u:[-1020,-760],p:[-700,-330],kind:'mature',name:'An old Ranj terrace'},
 {u:[-700,-380],p:[-640,-160],kind:'mature',name:'A Ranj terrace'},
 {u:[-320,-20],p:[-560,-40],kind:'young',name:'A young Ranj terrace'},
 {u:[-1020,-720],p:[560,1000],kind:'mature',name:'A Ranj terrace'},
 {u:[-640,-300],p:[620,1100],kind:'young',name:'A young Ranj terrace'},
 {u:[60,420],p:[-760,-260],kind:'clear',name:'A fresh clearing (cut and burnt)'},
 {u:[-200,180],p:[640,1060],kind:'clear',name:'A fresh clearing (cut and burnt)'},
 {u:[-900,-520],p:[-1560,-1120],kind:'mature',name:'An old Ranj terrace'},
];
FIELDS.forEach((F,i)=>{F.i=i;F.cu=(F.u[0]+F.u[1])/2;F.cp=(F.p[0]+F.p[1])/2;const c=xzOf(F.cu,F.cp);F.x=c[0];F.z=c[1];});
// how far inside a field (0 outside .. 1 a few metres in), with ragged cut edges
function fieldIn(u,p,F,pad){pad=pad||0;const m=Math.min(u-F.u[0],F.u[1]-u,p-F.p[0],F.p[1]-p)-pad;
 if(m<-8)return 0;if(m>10)return 1;   // well out or well in: the ragged edge's noise (|e| <= 3) cannot change it
 const e=6*(fbm(u*.02+F.i,p*.02,4901,2)-.5);return smooth(-4,6,m+e);}
function fieldAt(u,p){let best=0,F=null;for(const f of FIELDS){const v=fieldIn(u,p,f);if(v>best){best=v;F=f;}}return{v:best,F};}
const TERRACE=2.6;   // metres a terrace riser stands
// the flank before the lava: rising from the shore at 5 %, steepening up the slope; below the water the shelf falls away
function flankH(u,p){const d=u-shoreU(p);
 let h=d>=0?SEA+2.5+.05*d+.000012*d*d:SEA+2.5+d*.08;
 h+=14*(fbm(u*.0007+3,p*.0007-1,17,3)-.5)+5*(fbm(u*.0025-5,p*.0025+2,19,2)-.5);
 // the bay: a round basin under the city, 18 m deep
 const db=Math.hypot(u-BAY.u,p-BAY.p);h=Math.min(h,mix(h,SEA-18,smooth(BAY.r,BAY.r*.6,db)));
 return Math.max(h,SEA-70);}
function landH0(x,z){const u=uOf(x,z),p=pOf(x,z);return flankH(u,p)-valleyAt(u,p).cut;}
function plumeAt(x,z){return 0;}
