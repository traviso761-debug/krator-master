// ================================================================= HOST — stage: station 5, the fan coast (PLAN.md section 7)
// The east side of the crest, in its rain shadow (~400 mm): a 4 km scarp falls to the Ring Sea, whose level has not changed, so there
// are no raised reefs (the owner, 2026-10-26). Its wadis build STEEP FAN DELTAS straight into the sea (the Gulf of Corinth's, Aqaba's):
// a cobble cone on land, its front running on under the water to the deep floor a few hundred metres out. Between the fans the scarp's
// thin-bedded rock meets the sea on a SAND BEACH with SEA ARCHES and stacks (refs/31), and the folds' steep thin beds planed off by the
// waves into FLYSCH PLATFORMS, ribs of hard rock running out to sea (refs/32).
// THE MAP (x east, z SOUTH, 4.8 km square, y 0 = THE SEA's level, ALT0 0 m): the coast runs north-south near x ~700, the sea east of it,
// the scarp rising west to ~1.7 km at the map's edge; three wadis cut it and end in fans. The kit reads the fields scarp, fan, wadi,
// shore and slope (59c-biome-swhighlands-coast.js). Every noise is KRAND's, every form core/terrain's (KRELIEF.range, KRELIEF.wadi and
// its fan, the arches and stacks KSTACKS'); the sea is core/water's open water.
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4c8c4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,48000);
const hemi=new THREE.HemisphereLight(0xd4dce0,0x6a5c48,.62);scene.add(hemi);
const SUN_POS=[900,1300,-600];   /* the morning sun out over the sea: the scarp faces it */
const sun=new THREE.DirectionalLight(0xfff2dc,1.5);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8c4d0,.26);fill.position.set(-800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
const ALT0=0,WORLD=8825;
const TERR={R:2400,X0:-2400,X1:2400,Z0:-2400,Z1:2400};
const NZ=(x,z,f,seed,o)=>KRAND.fbm(x*f+.31,.57,z*f-.13,o||3,seed)-.5;
// THE COAST: its line wandering about x ~700; inland distance d (m west of it)
function coastX(z){return 700+120*Math.sin(z*.0013+.6)+50*NZ(0,z,.004,301,2);}
// THE WADIS: three, down the scarp from the west edge to the coast, each a line wandering about its z
const WADIS=[{z:-1450,k:0},{z:20,k:1},{z:1400,k:2}].map(W=>({...W,lineZ:x=>W.z+60*Math.sin(x*.0021+W.k)+40*NZ(x,W.k,.003,310+W.k,2)}));
// the scarp: a concave rise from the beach to ~1.7 km, spurs between the wadis (KRELIEF.range rows running down it), the seafloor offshore
const SPURS=[-2150,-720,720,2150].map((z,i)=>KRELIEF.range({a:[coastX(z)-40,z],b:[-6000,z+120*(i%2?1:-1)],h:120+30*i,w:420,crest:.75,toe:.15,serr:.1,seed:321+i}));
function scarp0(x,z){const d=coastX(z)-x;if(d<=0){const s=-d;return -2.2-s*.09-Math.max(0,s-120)*.22;}   /* the shoreface, then the steep deep floor */
 let h=3.2*smooth(0,55,d)+1650*Math.pow(clamp(d/3300,0,1.4),1.35)+30*NZ(x,z,.0018,331,3)*smooth(80,400,d)+5*NZ(x,z,.012,332,2)*smooth(30,200,d);
 for(const S of SPURS)h+=S(x,z)*smooth(100,600,d);
 /* the wadis' valleys: V-cut into the scarp, deeper and wider inland */
 for(const W of WADIS){const q=Math.abs(z-W.lineZ(x)),wd=70+.11*d,dep=.32*Math.max(0,h-4)*smooth(30,250,d);if(q<wd*2.2)h-=dep*Math.exp(-Math.pow(q/wd,2));}
 return h;}
// THE WADIS' FLOORS and THEIR FAN DELTAS (core/terrain KRELIEF.wadi with its fan: the cone spills from the scarp's foot at a 5% fall, and
// its surface stands over the shoreface and the deep floor, so it runs on under the sea as the delta's front)
const WADI_RECS=WADIS.map((W,k)=>{const pts=[];for(let x=TERR.X0-60;x<=coastX(W.z)-150;x+=12)pts.push([x,W.lineZ(x)]);
 return KRELIEF.wadi({pts,ground:scarp0,w:10+2*k,bank:2.2,bankW:4,braids:2.5,pools:0,fan:{r:520,slope:.05,spread:1.05,channels:4},seed:WORLD+40+k});});
function g1(x,z){let h=scarp0(x,z);for(const R of WADI_RECS)h=KRELIEF.shape(R,x,z,h);return h;}
// THE FLYSCH PLATFORMS: in the wave-cut band (a metre either side of the sea's level) between the fans, the steep thin beds stand as
// ribs running out to sea, a bed every ~9 m (the folds' strike), the soft beds between scoured out
const PLATFORMS=[{z0:-1050,z1:-600},{z0:520,z1:980}];
function ribK(x,z,h){if(h>1.6||h<-2.4)return 0;let k=0;for(const P of PLATFORMS)k=Math.max(k,smooth(P.z0,P.z0+60,z)*smooth(P.z1,P.z1-60,z));if(!k)return 0;
 return k*smooth(1.6,.6,h)*smooth(-2.4,-1.2,h);}
function rib(x,z){const u=z/9+.35*NZ(x,z,.02,341,2)+.002*x;return Math.pow(Math.abs(Math.sin(Math.PI*u)),6);}
function terrainH0(x,z){const h=g1(x,z),k=ribK(x,z,h);return k?h-.8*k+1.1*k*rib(x,z):h;}
// THE FIELD (core/terrain KFIELD): the ground baked once (6 m), a 2 m inset along the beach and its platforms
const FIELD_BAKED=(function(){const t0=performance.now();const F=KFIELD.bake(terrainH0,[TERR.X0-60,TERR.Z0-60,TERR.X1+60,TERR.Z1+60],6,{name:'swhighlands-coast',
 insets:[{box:[440,-1150,960,1050],step:2,name:'the beach, its arches and the flysch platforms'}]});window._fieldMs=Math.round(performance.now()-t0);return F;})();
const groundH=FIELD_BAKED.sampler();
// the sea's level (0) where the ground is under it; the wadis are dry
function waterH(x,z){return groundH(x,z)<0?0:-1e9;}
function slopeAt(x,z){const h=groundH(x,z),e=3;return Math.hypot(groundH(x+e,z)-h,groundH(x,z+e)-h)/e;}
// the fans' and the wadis' parts (KRELIEF.at on each record: 'fan', 'floor', 'bar', 'bank' ...)
function wadiPart(x,z){for(const R of WADI_RECS){const q=KRELIEF.at(R,x,z,scarp0(x,z));if(q&&q.part)return q;}return null;}
