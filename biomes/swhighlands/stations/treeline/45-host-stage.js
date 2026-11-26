// ================================================================= HOST — stage: station 6, the treeline (PLAN.md section 7)
// The upper ramp under the crest, 3.4-4.7 km: no running water (the owner, 2026-10-27). The map (x east, z SOUTH, 4.8 km square, y 0
// at ALT0 m above the sea) rises east toward the crest (beyond the map's east edge, 6-6.5 km), the ramp cut by spurs running down it
// (east-west: KRELIEF.range rows), their north faces sunny (40 S) and dry, their south faces shaded. In the east a CIRQUE is bitten
// out under the crest, its floor at ~4.42 km, its headwall to the map's edge; snow lies in its shade. The kit reads the fields:
// upland (3.4 .. 4.9 km), north (+1 a sunny slope), slope, rock, scree, snow. Every noise is KRAND's, every form KRELIEF's.
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb4c0c4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00012);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,48000);
const hemi=new THREE.HemisphereLight(0xc8d6dc,0x4a4a3e,.66);scene.add(hemi);
const SUN_POS=[-900,1100,-700];
const sun=new THREE.DirectionalLight(0xfff2dc,1.4);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8c4d0,.28);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
const ALT0=3900,WORLD=8819;
const TERR={R:2400,X0:-2400,X1:2400,Z0:-2400,Z1:2400};
const NZ=(x,z,f,seed,o)=>KRAND.fbm(x*f+.31,.57,z*f-.13,o||3,seed)-.5;
// the crest's flank (a long range along z beyond the east edge) and the spurs down the ramp (ranges along x)
const CREST=KRELIEF.range({a:[3500,-90000],b:[3500,90000],h:720,w:1700,crest:.72,toe:.1,serr:.06,seed:71});
const SPURS=[-1700,-500,700,1900].map((z,i)=>({z,fn:KRELIEF.range({a:[-9000,z],b:[9000,z+80*(i%2?1:-1)],h:95+25*i,w:430,crest:.8,toe:.15,serr:.08,seed:72+i})}));
function rampH(x,z){return .2*x+22*NZ(x,z,.0014,73,3)+5*NZ(x,z,.01,74,2);}
// THE CIRQUE: a bowl under the crest, opening west (downhill), its floor flat at CIRQUE.floor, the walls steepening to the headwall
const CIRQUE={x:1950,z:300,rf:300,k:.0055,name:'The cirque'};   /* a broad bowl: its walls ~180 m round a 600 m floor */
function g0(x,z){const u=smooth(-2400,2400,x);let h=rampH(x,z)+CREST(x,z);
 for(const S of SPURS){const wob=40*NZ(x,0,.0009,75,2);h+=S.fn(x,z-wob)*(.55+.45*u);}
 return h;}
CIRQUE.floor=g0(CIRQUE.x-180,CIRQUE.z)+6;
function cirqueH(x,z,h){const dx=x-CIRQUE.x,dz=z-CIRQUE.z,d=Math.hypot(dx*(dx<0?.7:1),dz);if(d>900)return h;
 const w=CIRQUE.floor+CIRQUE.k*Math.pow(Math.max(0,d-CIRQUE.rf),1.85)*(1+.25*NZ(x,z,.006,76,2));return Math.min(h,w);}
function terrainH0(x,z){return cirqueH(x,z,g0(x,z));}
const FIELD_BAKED=(function(){const t0=performance.now();const F=KFIELD.bake(terrainH0,[TERR.X0-60,TERR.Z0-60,TERR.X1+60,TERR.Z1+60],6,{name:'swhighlands-treeline'});window._fieldMs=Math.round(performance.now()-t0);return F;})();
const terrainH=FIELD_BAKED.sampler();
// no water stands or runs here (puddles after rain only: 89a-host-atmos.js)
function waterH(x,z){return -1e9;}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}

// ---------------------------------------------------------------- the climate fields (15 m lattice)
const FC=(function(){const N=321,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,K=['h','slope','north','up','rock','scree','snow','cold','wet','mist'],a={};
 K.forEach(k=>a[k]=new Float32Array(N*N));const st=SX/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)a.h[j*N+i]=terrainH(TERR.X0+i*st,TERR.Z0+j*st);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st,h=a.h[k],alt=ALT0+h;
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*st),hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*st);
  a.slope[k]=Math.hypot(hx,hz);a.north[k]=clamp(-hz/.3,-1,1);   // the ground falls toward -z (north): it faces north, the sunny side at 40 S
  a.up[k]=clamp((alt-3400)/1500,0,1);a.rock[k]=smooth(.75,1.2,a.slope[k]);
  const n1=NZ(x,z,.003,77,2);
  a.scree[k]=smooth(.3,.65,a.slope[k])*smooth(4300,4500,alt)*(1-a.rock[k]*.6);
  const cq=Math.hypot(x-CIRQUE.x,z-CIRQUE.z);
  a.snow[k]=clamp(smooth(4560,4760,alt+120*Math.max(0,-a.north[k])+60*n1)*smooth(.05,-.5,a.north[k])*smooth(.9,.5,a.slope[k])+smooth(420,160,cq)*.4*smooth(.05,.3,n1)*smooth(.1,-.3,a.north[k]),0,1);   /* patches: the shaded slopes from ~4.6 km and the cirque's shaded floor */
  a.cold[k]=clamp((alt-3600)/1100+.15*Math.max(0,-a.north[k]),0,1);
  a.wet[k]=clamp(.45-.18*Math.max(0,a.north[k])+.12*n1,0,1);
  a.mist[k]=clamp(smooth(4300,4600,alt)*.4*smooth(-.1,.25,n1),0,1);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
const FIELD={upland:(x,z)=>FC.at(FC.a.up,x,z),north:(x,z)=>FC.at(FC.a.north,x,z),slope:(x,z)=>FC.at(FC.a.slope,x,z),rock:(x,z)=>FC.at(FC.a.rock,x,z),
 scree:(x,z)=>FC.at(FC.a.scree,x,z),snow:(x,z)=>FC.at(FC.a.snow,x,z),cold:(x,z)=>FC.at(FC.a.cold,x,z),wet:(x,z)=>FC.at(FC.a.wet,x,z),mist:(x,z)=>FC.at(FC.a.mist,x,z),
 salt:()=>0,flow:()=>0};

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
const SPINE=[[-1500,-150],[-500,250],[400,-150],[1200,150],[CIRQUE.x,CIRQUE.z],[700,1250],[-900,-1250],[1500,-1100],[2150,-1000],[2150,1300]];   /* the last two on the fellfield */
BIO.init({tags:'swhighlands-treeline',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,field:FIELD_BAKED,
 mask:(x,z)=>{if(x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;return smooth(1.2,.8,FC.at(FC.a.slope,x,z))*smooth(.75,.35,FC.at(FC.a.snow,x,z));},
 obstacles:OBSTACLES,ticks:tick,seed:WORLD,register:REGISTER,origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
{const Q=new URLSearchParams(location.search);
 BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
