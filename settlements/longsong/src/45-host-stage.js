// ================================================================= HOST — stage (Longsong: the site, the rock, the ward)
// The page's renderer and light; the land (the scale model's, cached on two grids), and on it what the plan shapes
// finer than the model's cells: Longsong's rock, the ward's three terraces, the building pads, the courts, the lotus
// pond, the track and the bridge's banks; the stream is the model's own (WORLD carves it). Then the fields the Oidong
// kit reads (biomes/oidong/BIOME-API.md) and BIO.init. A kit never reads anything here except through BIO.host.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
// THE LIGHT OF THE VALLEY (biomes/oidong's): about 1 atm at 2,060 m, clear cold air; the sun in the north-west (Krator's
// settlements lie near 40 S), so the White Palace's north face is lit; a pale, faintly lilac haze thin enough to see
// the valley's walls and the snow ranges 20-40 km off
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd4d9e4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.000085);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,90000);
scene.add(new THREE.HemisphereLight(0xcfdcea,0xa8b0a0,.8));
const SUN_POS=[-1000,900,-700];
const sun=new THREE.DirectionalLight(0xfff4e4,1.25);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe4e0f0,.22);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land, cached
// Two grids of the model's land (WORLD.H, every detail it has): 4 m over the 1,280 m round the monastery, 16 m out to
// the page's edge. Bilinear between samples; the plan's shapes go on top (terrainH). The water is cached with it.
const TERR={R:1700};
const LANDC=(function(){const mk=(S,n,mw)=>{const H=new Float32Array(n*n),W=new Float32Array(n*n),st=S/(n-1);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=-S/2+i*st,z=-S/2+j*st,k=j*n+i;H[k]=landH(x,z,mw);W[k]=worldWater(x,z);}
  return {S,n,st,H,W};};
 return {near:mk(1280,321,0),far:mk(TERR.R*2.3,246,13)};})();
_mark('land');
function cacheAt(G,A,x,z){const u=(x+G.S/2)/G.st,v=(z+G.S/2)/G.st;
 if(u<0||v<0||u>G.n-1.001||v>G.n-1.001)return null;const i=u|0,j=v|0,fu=u-i,fv=v-j,k=j*G.n+i,n=G.n;
 return A[k]*(1-fu)*(1-fv)+A[k+1]*fu*(1-fv)+A[k+n]*(1-fu)*fv+A[k+n+1]*fu*fv;}
function land(x,z){let h=cacheAt(LANDC.near,LANDC.near.H,x,z);if(h==null)h=cacheAt(LANDC.far,LANDC.far.H,x,z);return h==null?landH(x,z,13):h;}
// the water: the nearest cached sample's level (a bilinear mix of a level and -1e9 is meaningless)
function cachedWater(x,z){for(const G of [LANDC.near,LANDC.far]){const u=Math.round((x+G.S/2)/G.st),v=Math.round((z+G.S/2)/G.st);
  if(u>=0&&v>=0&&u<G.n&&v<G.n){let w=-1e9;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const i=clamp(u+a,0,G.n-1),j=clamp(v+b,0,G.n-1);w=Math.max(w,G.W[j*G.n+i]);}return w;}}
 return worldWater(x,z);}

// ---------------------------------------------------------------- the plan's shapes on the land
// the pads: every building's footprint (+2 m) is level at its base; feathered 4 m out
const PADS=LS.BUILDINGS.filter(B=>B.kind!=='roofhall').map(B=>{const r=B.r!=null?B.r+2:null;
 return {x:B.x,z:B.z,hw:r||B.w/2+2,hd:r||B.d/2+2,round:r!=null,y:LS.baseY(B),id:B.id};});
// the courts and terraces of the top: paved and level at the top's height (the rock's plateau already is)
const T0=LS.ROCK.top;
function padAt(x,z){let best=null,bw=0;
 for(let i=0;i<PADS.length;i++){const P=PADS[i];let d;
  if(P.round)d=Math.hypot(x-P.x,z-P.z)-P.hw;else d=Math.max(Math.abs(x-P.x)-P.hw,Math.abs(z-P.z)-P.hd);
  if(d<4){const w=smooth(4,0,d);if(w>bw){bw=w;best=P;}}}
 return best?{y:best.y,w:bw}:null;}
LS.nearPad=(x,z,m)=>{for(const P of PADS){const d=P.round?Math.hypot(x-P.x,z-P.z)-P.hw:Math.max(Math.abs(x-P.x)-P.hw,Math.abs(z-P.z)-P.hd);if(d<m)return true;}return false;};
// the rock's texture: ledges and joints on the faces, a hand of relief on the top's open ground
function rockSurf(x,z){const y=LS.rockY(x,z);if(y<-1e8)return -1e9;
 const r=LS.rockR(x,z),face=smooth(LS.ROCK.plateau-.04,LS.ROCK.plateau+.08,r)*smooth(1.1,.97,r);
 return y+face*(5*(fbm(x*.045,z*.045+y*.03,301,3)-.5)+2.2*(fbm(x*.16,z*.16,303,2)-.5))+(1-face)*(r<1?1.2*(fbm(x*.02,z*.02,307,2)-.5):0);}
// the pond: a bowl to its bed, the bank eased
function pondCut(x,z,h){const P=LS.POND,d=Math.hypot(x-P.x,z-P.z);if(d>P.r+18)return h;
 const bed=P.y-P.depth*(1-smooth(P.r*.3,P.r,d)*.7),bank=P.y+.6;
 if(d<P.r)return Math.min(h,bed);return lerp(Math.min(h,bank),h,smooth(P.r,P.r+18,d));}
// the outer wall's line: a strip 5 m wide the wall stands on, level along it on the ward's sides
function terrainH0(x,z){
 let h=land(x,z);
 const G=LS.GROUNDS;
 // inside the walls: the ward's terraces north of the rock, the land as it is elsewhere (it rises gently to the south)
 const dIn=Math.min(x-G.x0,G.x1-x,z-G.z0,G.z1-z);   // >0 inside
 if(dIn>-14&&z<LS.WARD.z1+10){const wy=LS.wardY(z),k=smooth(-14,0,dIn)*smooth(LS.WARD.z1+10,LS.WARD.z1-2,z);
  // the terrace risers: a 2 m wide ramp between terraces (the avenue's steps are drawn on it)
  let ty=wy;for(const T of LS.WARD.terraces){if(Math.abs(z-T.z1)<1.5&&T.z1<0){const nx=LS.wardY(T.z1+2);ty=lerp(T.y,nx,smooth(T.z1-1.5,T.z1+1.5,z));}}
  h=lerp(h,ty,k);}
 // the rock
 const rk=rockSurf(x,z);if(rk>-1e8){const r=LS.rockR(x,z);h=Math.max(h,lerp(h,rk,smooth(1.12,1.0,r)));}
 // the forecourt and the Great Stair's band: the White Palace's base rises clean from the ward's level (the rock is
 // cut back under it), as the Potala's white walls rise from the Shöl
 {const B0=LS.building('white-palace').base0,dx=Math.abs(x)-(B0.x1+2),dz=Math.max(-1-z,z-(B0.z1-1));
  const k=smooth(5,0,Math.max(dx,dz));if(k>0)h=lerp(h,Math.min(h,LS.wardY(0)),k);}
 // the pads
 const P=padAt(x,z);if(P)h=lerp(h,P.y,P.w);
 // the pond
 return pondCut(x,z,h);}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the water: the stream (the model's), the lotus pond
function waterH(x,z){const P=LS.POND;if(Math.abs(x-P.x)<P.r+4&&Math.abs(z-P.z)<P.r+4&&Math.hypot(x-P.x,z-P.z)<P.r+4)return P.y;
 if(LS.inGrounds(x,z,-1))return -1e9;return cachedWater(x,z);}

// ---------------------------------------------------------------- the stream as a line (page metres): flow, the bridge
const STREAM=(function(){const L=WORLD.riverLines(16).map(R=>({name:R.name,width:R.width,pts:R.pts.map(p=>[p[0]-WX,p[1]-WZ,p[2]-WORLD_H0]).filter(p=>Math.abs(p[0])<TERR.R*1.6&&Math.abs(p[1])<TERR.R*1.6)})).filter(R=>R.pts.length>1);
 return L;})();
function streamD(x,z){let d=1e9;for(const R of STREAM){const P=R.pts;for(let i=1;i<P.length;i++){const a=P[i-1],c=P[i];if(Math.abs(x-a[0])>400&&Math.abs(x-c[0])>400)continue;
  const dx=c[0]-a[0],dz=c[1]-a[1],l=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l,0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}}return d;}
// where the stream crosses the avenue's line (x 0): the bridge stands there, its deck over the higher bank
const BRIDGE=(function(){let best=null;for(const R of STREAM){const P=R.pts;for(let i=1;i<P.length;i++){const a=P[i-1],c=P[i];if((a[0]-0)*(c[0]-0)<=0&&a[0]!==c[0]){const t=(0-a[0])/(c[0]-a[0]);
  const z=lerp(a[1],c[1],t),w=lerp(a[2],c[2],t);if(!best||Math.abs(z+260)<Math.abs(best.z+260))best={x:0,z,water:w,width:R.width};}}}
 if(!best)best={x:0,z:LS.BRIDGE.z,water:-12,width:30};
 const n=terrainH(0,best.z-best.width/2-14),s=terrainH(0,best.z+best.width/2+14);best.deck=Math.max(n,s,best.water+3)+.6;best.L=best.width+30;return best;})();

// ---------------------------------------------------------------- the fields the Oidong kit reads (BIOME-API.md)
// wet from the model's rain (~1,000 mm) and the water near; flow on the stream's banks; upland and cold over the valley's
// floor; rock on the steeps and Longsong's rock; flat: the raked gravel fans the stream left on the apron (three, as the
// showcase's), the kit's peyote and stone groups; mist: a little over the stream (no cataract here)
const FANS=[{x:-560,z:-150,rx:200,rz:90},{x:430,z:-180,rx:170,rz:80},{x:-980,z:-80,rx:150,rz:70}];
function fanAt(x,z){let f=0;for(const F of FANS){const u=(x-F.x)/(F.rx*(1+.18*(fbm(x*.003+F.x,z*.003,61,2)-.5))),v=(z-F.z)/F.rz;f=Math.max(f,smooth(1.05,.6,Math.hypot(u,v)));}return f;}
function fieldsAt(x,z,h,slope){const sd=streamD(x,z),flow=smooth(36,8,sd),r=LS.rockR(x,z),onRock=smooth(1.05,.9,r)*(1-smooth(LS.ROCK.plateau+.02,LS.ROCK.plateau-.06,r));
 const pd=Math.hypot(x-LS.POND.x,z-LS.POND.z)-LS.POND.r,fan=fanAt(x,z),up=clamp((h-4)/650,0,1);
 const rock=clamp(Math.max(onRock*.95,smooth(.74,1.0,slope)*.9,smooth(.6,.78,slope)*smooth(.25,.6,up)*.5),0,1);
 const wet=clamp(.62+.3*smooth(60,0,Math.min(pd,sd))-.45*fan+.24*flow-.35*up-.3*rock+.07*(fbm(x*.0015,z*.0015,131,2)-.5),0,1);
 return{wet,flow,upland:up,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:clamp(.42+h/1300,0,1),geo:0,barren:0,fog:0,
  mist:clamp(smooth(90,10,sd)*.32+.04*(fbm(x*.002,z*.002,141,2)-.5),0,1),flat:fan*(1-rock)};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat'];
const FC=(function(){const N=340,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
_mark('fields');

// ---------------------------------------------------------------- the host binding
// nothing roots in the water, nor on anything built, paved or raked (LS.plantable: inside the wall only the gardens)
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;const m=d<.7?(d-.15)/.55:1;return m*LS.plantable(x,z);}
const OBSTACLES=[];
// the LOD spine: the monastery, the ward, the pond, the bridge, the fans, the kora
const SPINE=[[0,0],[0,-150],[0,100],[-150,60],[150,60],[0,230],[LS.POND.x,LS.POND.z],[0,BRIDGE.z]];
FANS.forEach(F=>SPINE.push([F.x,F.z]));for(let a=0;a<8;a++)SPINE.push([Math.cos(a/8*TAU)*420,Math.sin(a/8*TAU)*420+60]);
const WBOX=[-TERR.R,-TERR.R,TERR.R,TERR.R];
BIO.init({tags:'longsong',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:23,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:260,mid:620,far:2200,floor:[200,480]},
 windows:{water:WBOX}});
BIO.setSun(SUN_POS);
