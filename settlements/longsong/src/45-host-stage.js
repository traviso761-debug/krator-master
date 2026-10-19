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
// ---------------------------------------------------------------- the stream as a line (page metres), on a level that only falls
// The model's river line carries its 4 km cells' water level, which rises and falls along the stream here (the site sits
// in a dip of the cells: -8.5 m at the bridge, +1 m 600 m downstream). The page's stream takes a level that only falls
// downstream (west: LS.STREAM_FLOW; PLAN.md section 1): the running minimum of the model's level from the upstream end, falling at least
// 0.3 m/km, smoothed (a mean over a falling run keeps it falling). The bed is cut under it (streamCut); where the model's
// land climbs above it to the west the cut is a ravine (KNOWN_ISSUES.md). core/water draws it (89w-ls-water.js).
const STREAM=(function(){const L=WORLD.riverLines(16).map(R=>({name:R.name,width:R.width,pts:R.pts.map(p=>[p[0]-WX,p[1]-WZ,p[2]-WORLD_H0]).filter(p=>Math.abs(p[0])<TERR.R*1.6&&Math.abs(p[1])<TERR.R*1.6)})).filter(R=>R.pts.length>1);
 L.forEach(R=>{const P=R.pts,n=P.length,F=LS.STREAM_FLOW;
  if((P[n-1][0]-P[0][0])*F[0]+(P[n-1][1]-P[0][1])*F[1]<0)P.reverse();R.model=P.map(p=>p[2]);   // upstream first (LS.STREAM_FLOW says which way)
  let lev=P[0][2];const raw=[lev];for(let i=1;i<n;i++){const s=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);lev=Math.min(lev-.0003*s,P[i][2]);raw.push(lev);}
  const W=4;for(let i=0;i<n;i++){let t=0,c=0;for(let j=Math.max(0,i-W);j<=Math.min(n-1,i+W);j++){t+=raw[j];c++;}P[i][2]=t/c;}});
 return L;})();
// a quick reject: per 20 m of x, the band of z the line passes through (within 110 m): a point outside it is far from it
const SBAND=(function(){const B={};for(const R of STREAM)for(let i=1;i<R.pts.length;i++){const a=R.pts[i-1],c=R.pts[i],n=Math.ceil(Math.hypot(c[0]-a[0],c[1]-a[1])/5);
  for(let k=0;k<=n;k++){const x=lerp(a[0],c[0],k/n),z=lerp(a[1],c[1],k/n);for(let b=Math.floor((x-110)/20);b<=Math.floor((x+110)/20);b++){const q=B[b]||(B[b]=[1e9,-1e9]);q[0]=Math.min(q[0],z);q[1]=Math.max(q[1],z);}}}return B;})();
function streamNear(x,z){const q=SBAND[Math.floor(x/20)];if(!q||z<q[0]-110||z>q[1]+110)return null;let best=null;for(const R of STREAM){const P=R.pts;for(let i=1;i<P.length;i++){const a=P[i-1],c=P[i];if(Math.abs(x-a[0])>400&&Math.abs(x-c[0])>400)continue;
  const dx=c[0]-a[0],dz=c[1]-a[1],l=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l,0,1),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);
  if(!best||d<best.d)best={d,y:lerp(a[2],c[2],t),hw:R.width/2,R};}}return best;}
function streamD(x,z){const n=streamNear(x,z);return n?n.d:1e9;}
// the bed under the level: 1.4 m deep at the line, the banks cut back to just over the water at a slope of 1 in 6
// where the land stands higher (a levee 0.2 m over it where the land is lower); nothing past 90 m from the bank
// (2026-10-19: the sides at 1 in 6, not 1 in 2.5: west of the pond, where the cut is deep, a valley rather than a ravine)
function streamCut(x,z,h){const n=streamNear(x,z);if(!n||n.d>n.hw+90)return h;const y=n.y,hw=n.hw;
 if(n.d<hw){const q=n.d/hw;return Math.min(h,y-.25-1.15*(1-q*q));}
 const top=y+.2,run=Math.min(75,Math.max(4,(h-top)*6)),k=smooth(hw,hw+run,n.d);
 return h>top?lerp(top,h,k):lerp(top,h,smooth(hw+3,hw+12,n.d));}   // (a levee where the land lies lower)
// the canal (the leat to the mills, the tail race to the Mirror): its level falls from the intake (just under the stream's
// there) to the paper mill's wheel and on to the pond; its bed is cut 0.55 m under it, the cut's sides at 1 in 1.5. Inside
// the ward and wherever the land lies lower, it runs in a raised stone race (85-ls-farms.js draws it)
const CANAL=(function(){const F=LS.FARMS,line=pts=>{let s=0;return pts.map((p,i)=>{if(i)s+=Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1]);return [p[0],p[1],s];});};
 const leat=line(F.LEAT.pts),tail=line(F.TAIL.pts),Ll=leat[leat.length-1][2],Lt=tail[tail.length-1][2];
 const intake=streamNear(leat[0][0],leat[0][1]),y0=(intake?intake.y:-6)-.1,yW=Math.min(y0-.3,LS.wardY(-190)+.8),yP=LS.POND.y;
 leat.forEach(p=>p.push(lerp(y0,yW,p[2]/Ll)));tail.forEach(p=>p.push(lerp(yW-.15,yP,p[2]/Lt)));
 return {leat,tail,w:F.LEAT.w,wt:F.TAIL.w,y0,yW,yP};})();
function canalNear(x,z){let best=null;for(const [P,w] of [[CANAL.leat,CANAL.w],[CANAL.tail,CANAL.wt]])for(let i=1;i<P.length;i++){const a=P[i-1],c=P[i];
  const dx=c[0]-a[0],dz=c[1]-a[1],l=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l,0,1),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);
  if(!best||d<best.d)best={d,y:lerp(a[3],c[3],t),hw:w/2};}return best;}
function canalCut(x,z,h){const n=canalNear(x,z);if(!n||n.d>n.hw+12)return h;const bed=n.y-.55;
 if(n.d<n.hw+.05)return Math.min(h,bed);const top=Math.max(bed,n.y+.25);return h>top?lerp(top,h,smooth(n.hw,n.hw+Math.max(1,(h-top)*1.5),n.d)):h;}
// the rice pools: each a level basin at its ground's mean, the high side cut down to it (the low side is held by its bund)
const POOLS=(function(){const o=LS.FARMS.group('rice-pools');return {o,cells:LS.FARMS.strips(o),lev:null};})();
function poolLevel(s){if(s.lev==null){let t=0;for(const p of [[s.x0,s.z0],[s.x1,s.z0],[s.x0,s.z1],[s.x1,s.z1],[(s.x0+s.x1)/2,(s.z0+s.z1)/2]])t+=terrainBase(p[0],p[1]);s.lev=t/5;}return s.lev;}
// the terraces (the south terraces, the tea garden): each row a level tread along its contour, the land cut and filled
// to it: its level a line along x fitted to the land at the row's middle (the contour runs nearly east-west here), level
// across its depth; the risers between the rows are drawn by 85 (2026-10-19: they had draped the model's land)
const TERRACES=(function(){const T={};for(const o of LS.FARMS.GROUPS){if(o.kind!=='terraces')continue;
  T[o.id]={o,rows:LS.FARMS.strips(o).map(s=>{const zm=(s.z0+s.z1)/2;let n=0,sx=0,sy=0,sxx=0,sxy=0;
   for(let x=s.x0;x<=s.x1+.01;x+=10){const y=(terrainBase(x,s.z0+1)+terrainBase(x,zm)+terrainBase(x,s.z1-1))/3;n++;sx+=x;sy+=y;sxx+=x*x;sxy+=x*y;}
   const b=(n*sxy-sx*sy)/Math.max(1e-9,n*sxx-sx*sx),a=(sy-b*sx)/n;return {s,a,b};})};}
 return T;})();
function terraceLevel(id,j,x){const r=TERRACES[id].rows[j];return r.a+r.b*x;}
function terraceCut(x,z,h){for(const id in TERRACES){const T=TERRACES[id],o=T.o;if(x<o.x0||x>o.x1||z<o.z0||z>o.z1)continue;
  for(const r of T.rows)if(z>=r.s.z0&&z<=r.s.z1)return r.a+r.b*x;}return h;}
function poolCut(x,z,h){const o=POOLS.o;if(x<o.x0-1||x>o.x1+1||z<o.z0-1||z>o.z1+1)return h;
 for(const s of POOLS.cells)if(x>=s.x0-.3&&x<=s.x1+.3&&z>=s.z0-.3&&z<=s.z1+.3)return Math.min(h,poolLevel(s)-.3);return h;}
// the outer wall's line: a strip 5 m wide the wall stands on, level along it on the ward's sides
function terrainBase(x,z){
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
// the land with the water's cuts: the stream's bed, the canal's, the rice pools'
function terrainH0(x,z){return terraceCut(x,z,poolCut(x,z,canalCut(x,z,streamCut(x,z,terrainBase(x,z)))));}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the water: the stream (the model's), the lotus pond
// (the stream's and the canal's levels above, not the model's cells; the rice pools at their basins')
function waterH(x,z){const P=LS.POND;if(Math.abs(x-P.x)<P.r+4&&Math.abs(z-P.z)<P.r+4&&Math.hypot(x-P.x,z-P.z)<P.r+4)return P.y;
 const c=canalNear(x,z);if(c&&c.d<c.hw)return c.y;
 const o=POOLS.o;if(x>o.x0&&x<o.x1&&z>o.z0&&z<o.z1){for(const s of POOLS.cells)if(x>=s.x0&&x<=s.x1&&z>=s.z0&&z<=s.z1)return poolLevel(s);}
 if(LS.inGrounds(x,z,-1))return -1e9;const n=streamNear(x,z);return n&&n.d<n.hw+1?n.y:-1e9;}

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
