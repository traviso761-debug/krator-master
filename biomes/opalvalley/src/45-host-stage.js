// ================================================================= HOST — stage: Opal Valley's five stations (PLAN.md sections 1.0 and 6; 2026-11-11)
// The ideal-type host for one zone of Opal Valley: the renderer, the light, the land drawn from the station's site record (40: OPAL_SITES), the climate
// fields, the analytic water levels and the biome core's binding. Started from biomes/highrift's stage (the same shape of page); the glacier's land
// from biomes/copperglacier's (KGLACIER). A station's folder sets STATION_KEY (stations/<name>/44z-host-site.js); the default page is the middle bed.
//
// THE CHAIN (the terrace stations and the mouth): the site's links (streams and lakes, east to west) become TREADS: each link, and between two links
// the riser's own small pools, stepping down by the dam's step (sinter 5 m: rimstone; moraine 10 m; tuff 9 m; the cataract one drop), each pair of
// treads joined by a short riser (3 m; the cataract's its whole gap). The ground, the water level (waterH), the fields and the water's surfaces
// (89w: one WATER.terraces over every tread) are all read off the same treads, so the lakes step down by construction and the water never climbs.
// The axis runs down to the west; a = z - axisZ(x) is across it (+ south).
//   glacier    KGLACIER's tongue from the east, its snout, caves, moraines and pool; the outwash west over a rock bar
//   upperbed   three tarns stepping down over moraine bars; the upper riser's meltwater from the east
//   middlebed  four lakes over opaline sinter dams (rimstone pools down each); the warm seeps on the north shore
//   lowerbed   three pools in a canyon of fire-opal tuff, tuff sills between
//   riftmouth  Terrace III's tread, the cataract in two drops, the plunge pool, the gorge cut back into the old fan, the river west
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const fbm=(x,z,seed,o)=>KRAND.fbm(x,.5,z,o==null?3:o,seed);   /* core/rand's noise ([0,1]) */
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}
const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'middlebed',SITE=OPAL_SITES[SKEY];
const STATION_REGION=SITE.name+' (Opal Valley, zone '+SITE.zone+'; ideal type)';

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: from 0.95 atm on the ice to 1.59 at the mouth; the sky (89) drives these from the station's pressure
const scene=new THREE.Scene();const HAZE=new THREE.Color(SITE.atm>1.4?0xd6dcd8:0xd8dee6);scene.fog=new THREE.FogExp2(HAZE.getHex(),SITE.atm>1.4?.00012:.00009);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xcadcf0,0xa8a49c,.74));
const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-1000,1100,-500);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe0e4f0,.18);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
const SNOW_LINE=SITE.snow;
const n2=(x,z,f,seed)=>fbm(x*f,z*f,seed,2)-.5;
const dflt=(v,d)=>v==null?d:v;
// the valley's walls (the far field carries them on; the square takes their first rise): north (-z) and south (+z) of the axis
function wallsAt(aa,south,x,z){const W=SITE.walls||{};const H=south?W.S:W.N,a0=south?W.s0:W.n0,a1=south?W.s1:W.n1;if(!H)return 0;const t=clamp((aa-a0)/(a1-a0),0,1.6);
 let h=H*(t<1?Math.pow(smooth(0,1,t),1.15):1+(t-1)*.25);
 /* the cliff band where the wall leaves the floor: 90-150 m of banded rock standing near-vertical (the rhyolite and its opal seams: PLAN.md section 2) */
 const cl=(W.cliff==null?120:W.cliff)*(.75+.5*(x==null?.5:fbm(x*.002,south?1:3,71,2)));h+=cl*smooth(a0-20,a0+60,aa);
 /* gullies down the walls, deepening up them */
 if(x!=null){const g=fbm(x*.006+(south?7:0),z*.0015,72,3);h-=Math.min(H*.12,90)*smooth(.45,.7,g)*smooth(a0+60,a0+500,aa);}
 return h;}
const AX=SITE.axis||{z0:0,amp:[0,0],f:[0,0],ph:[0,0]};
const axisZ=x=>AX.z0+AX.amp[0]*Math.sin(x*AX.f[0]+AX.ph[0])+AX.amp[1]*Math.sin(x*AX.f[1]+AX.ph[1])+(AX.bend?AX.bend*Math.min(0,x):0);

// ---- THE TREADS (the chain, expanded): east to west
const STEP={sinter:5,moraine:10,tuff:9,cataract:1e9}[SITE.dam]||8,STEP_HW={sinter:40,moraine:26,tuff:24,cataract:30}[SITE.dam]||28,CH=8;   /* a step's pool half-width; a channel's */
const TREADS=(function(){const C=SITE.chain;if(!C)return null;const T=[];
 C.forEach((L,i)=>{T.push(Object.assign({},L,{link:i,hw:L.kind==='lake'?L.hw:(L.w||14)/2}));const N=C[i+1];if(!N)return;
  const G=L.x1-N.x0,drop=L.y-N.y,n=Math.max(1,Math.round(drop/STEP)),r=n===1?G:3,pl=n>1?(G-n*r)/(n-1):0;let x=L.x1;
  for(let k=1;k<n;k++){x-=r;T.push({kind:'step',x0:x,x1:x-pl,y:L.y-drop*k/n,hw:STEP_HW*(.75+.5*KRAND.unit(KRAND.hash(5521,i,k))),depth:1.2,link:i,step:k});x-=pl;}});
 T.forEach((t,i)=>{t.i=i;});return T;})();
const LAKES=TREADS?TREADS.filter(t=>t.kind==='lake'):[];
// the floor along the axis, a metre a sample (x from -3200 to 3200): the tread's level on a tread, linear down a riser; the tread index (-1 on a riser)
const FLOOR=(function(){if(!TREADS)return null;const X0=-3200,N=6401,y=new Float32Array(N),id=new Int16Array(N);const T=TREADS,first=T[0],last=T[T.length-1];
 for(let k=0;k<N;k++){const x=X0+k;let v=null,ii=-1;
  if(x>first.x0){v=first.y+(x-first.x0)*.03;ii=x<first.x0+400?0:-1;}
  else if(x<last.x1){const W=SITE.west;v=W?last.y-W.drop*smooth(0,1,(last.x1-x)/260):last.y;ii=-1;}
  else for(let i=0;i<T.length;i++){const t=T[i];if(x<=t.x0&&x>=t.x1){v=t.y;ii=i;break;}const N2=T[i+1];if(N2&&x<t.x1&&x>N2.x0){v=lerp(t.y,N2.y,(t.x1-x)/(t.x1-N2.x0));ii=-1;break;}}
  y[k]=v;id[k]=ii;}
 const at=x=>{const k=clamp(Math.round(x-X0),0,N-1);return k;};
 return{y:x=>{if(x<X0)return SITE.west?last.y-SITE.west.drop:last.y;if(x>X0+N-1)return first.y+(x-first.x0)*.03;const u=x-X0,k=Math.floor(u),f=u-k;return k>=N-1?y[N-1]:y[k]*(1-f)+y[k+1]*f;},
  tread:x=>{if(x<X0||x>X0+N-1)return -1;return id[at(x)];},riser:x=>{if(x<X0||x>X0+N-1)return null;const i=id[at(x)];return i;}};})();
// a tread's half-width at x: a lake's lens (its middle the widest, its tips the channel), a step's small lens, a stream's channel
function treadHW(t,x){if(t.kind==='stream')return t.hw;const u=clamp((t.x0-x)/Math.max(1,t.x0-t.x1),0,1),s=Math.pow(Math.sin(Math.PI*u),t.kind==='lake'?.55:.7);
 return Math.max(CH,t.hw*s*(1+.07*Math.sin(x*.011+t.i)));}
// the riser between two treads at x (A upstream, B down): its share t (0 at A's end, 1 at B's start)
function riserAt(x){if(!TREADS)return null;for(let i=0;i+1<TREADS.length;i++){const A=TREADS[i],B=TREADS[i+1];if(x<A.x1&&x>B.x0)return{A,B,t:(A.x1-x)/(A.x1-B.x0),i};}return null;}
const RISER_CACHE=(function(){if(!TREADS)return null;const X0=-3200,N=6401,a=new Int16Array(N).fill(-1);
 for(let i=0;i+1<TREADS.length;i++){const A=TREADS[i],B=TREADS[i+1];for(let x=Math.ceil(B.x0);x<A.x1;x++){const k=x-X0;if(k>=0&&k<N)a[k]=i;}}
 return x=>{const k=Math.round(x-X0);if(k<0||k>=N)return null;const i=a[k];if(i<0)return null;const A=TREADS[i],B=TREADS[i+1];return{A,B,t:clamp((A.x1-x)/(A.x1-B.x0),0,1),i};};})();
// THE MOUTH: the old fan surface (the station's bench), the gorge's half-width, the river's bed from the plunge pool west
const FAN=SITE.fan||null,GORGE=SITE.gorge||null,RIVER=SITE.river||null,RIVER_X0=SITE.chain&&RIVER?SITE.chain[SITE.chain.length-1].x1:0;
const gorgeW=x=>{if(!GORGE)return 0;for(let i=0;i+1<GORGE.length;i++){const a=GORGE[i],b=GORGE[i+1];if(x<=a[0]&&x>=b[0])return lerp(a[1],b[1],(a[0]-x)/(a[0]-b[0]));}return x>GORGE[0][0]?GORGE[0][1]:GORGE[GORGE.length-1][1];};
const riverY=x=>RIVER?lerp(RIVER.y0,RIVER.y1,clamp((RIVER_X0-x)/(RIVER_X0+2860),0,1)):0;
const fanY=(x,z)=>FAN?FAN.at+FAN.slope*x+14*n2(x,z,.0011,61)+4*n2(x,z,.006,62):0;

// ---- THE CHAIN'S LAND (every station but the glacier)
function chainLand(x,z){const zc=axisZ(x),a=z-zc,aa=Math.abs(a),f=FLOOR.y(x),ti=FLOOR.tread(x);let h,hw=CH;
 if(ti>=0){const t=TREADS[ti];hw=treadHW(t,x);
  if(t.kind==='lake'||t.kind==='step'){const D=t.kind==='lake'?t.depth:t.depth;
   if(aa<hw){const k=1-Math.pow(aa/hw,1.7);h=t.y-Math.max(.55,D*k*smooth(0,.12,Math.min((t.x0-x),(x-t.x1))/Math.max(1,t.x0-t.x1)*1.0))-.1;}
   else{h=t.y+.45+(aa-hw)*.045+1.2*smooth(.55,.8,fbm(x*.02,z*.02,63,2))*smooth(hw,hw+30,aa);
    if(t.kind==='step')h+=1.1*smooth(hw+30,hw+4,aa)*smooth(.75,1,(t.x0-x)/Math.max(1,t.x0-t.x1));}   /* a rimstone pool's rim, at its downstream end */
  }else{   /* a stream on its bench */
   h=aa<hw?t.y-.9+.3*(aa/hw):t.y+.6+(aa-hw)*.05;}}
 else{const R=RISER_CACHE(x);if(R){   /* a riser: the face steps from A's level to B's across the whole floor; its channel notched in */
   h=f+(aa<CH?-.8:.6)+(R.A.kind==='step'||R.B.kind==='step'?0:0);
   if(aa>=CH)h=Math.max(h,mix(R.A.y,R.B.y,smooth(.25,.75,R.t))+.6+(aa-CH)*.045);}
  else h=f+.6+(aa>CH?(aa-CH)*.05:-1.4);}
 // the valley floor's benches and the walls
 h+=22*smooth(400,1100,aa)*(.6+.8*fbm(x*.0015,z*.0015,64,2))+8*n2(x,z,.003,65)*smooth(hw,hw+160,aa)+2*n2(x,z,.02,66)*smooth(hw,hw+40,aa);
 h+=wallsAt(aa,a>0,x,z)*(SITE.canyon?1:(1+.18*n2(x,z,.0007,67)));
 if(SITE.canyon)h+=60*smooth(SITE.walls.n0-40,SITE.walls.n0+40,a<0?aa:0)+60*smooth(SITE.walls.s0-40,SITE.walls.s0+40,a>0?aa:0);   /* the canyon's walls stand straight up from the bench */
 // the mouth: the old fan over the chain's west end, cut by the gorge; the river's bed in it
 if(FAN&&x<SITE.chain[1].x0+30){const top=fanY(x,z);
  let floor=h;if(x<RIVER_X0){const gw=gorgeW(x),rb=riverY(x);floor=aa<RIVER.w/2?rb-1.2+.6*(aa/(RIVER.w/2)):rb+.4+(aa-RIVER.w/2)*.12+2.5*n2(x,z,.03,68);
   h=mix(floor,top,smooth(gw-30,gw+18,aa));}
  else{const gw=x>SITE.chain[2].x0?gorgeW(SITE.chain[2].x0)+ (x-SITE.chain[2].x0)*.2:Math.max(gorgeW(x),treadHW(TREADS[TREADS.length-1],x)+20);h=mix(h,Math.max(h,top),smooth(gw-20,gw+25,aa));}}
 return h;}

// ---- THE GLACIER (station 1: core/terrain KGLACIER, as Copper Glacier takes it)
const GL=SITE.glacier||null;let G=null,PROF=null,FROST=null;
const GCEN=u=>30*Math.sin(u*.0013+.4)+12*Math.sin(u*.0036+1.1);   /* the ice's centre line across (p, m) */
if(GL){const W0=GL.W[0],W1=GL.W[1],T0=GL.T[0],T1=GL.T[1],sn=GL.snout;
 G=KGLACIER.create({up:GL.up,centre:GCEN,W:u=>W0+(W1-W0)*smooth(sn,2600,u),T:u=>(T0+(T1-T0)*smooth(sn,2200,u))*smooth(sn-10,sn+4,u),
  snout:sn,edge:.62,trough:{side:[.85,1.45],D:u=>34+30*smooth(sn,2200,u)},lateral:{h:u=>13+10*smooth(sn,1500,u),end:[2700,2300],off:36,w:26},
  terminal:{back:320,bend:60,breach:60,h:16,w:40},lake:{in:[15,70],out:[230,60],side:[.8,1.15]},seed:KRAND.child(4470,'opalvalley/glacier')});
 PROF=(function(){const P=GL.prof,Gr=P.grads,u0=-15000,du=10,n=3001,t=new Float32Array(n);
  const S=u=>{let g=Gr[0][1];for(let i=1;i<Gr.length;i++)g+=(Gr[i][1]-Gr[i-1][1])*smooth(Gr[i][0]-60,Gr[i][0]+60,u);return g;};
  let h=0;for(let i=0;i<n;i++){t[i]=h;h+=S(u0+i*du)*du;}
  const f=u=>{const k=clamp((u-u0)/du,0,n-1.001),i=Math.floor(k);return mix(t[i],t[i+1],k-i);};const off=P.h-f(P.at);return u=>f(u)+off;})();
 FROST=typeof KFROST!=='undefined'?KFROST.create({seed:KRAND.child(4471,'opalvalley/frost'),ground:(x,z)=>PROF(G.uOf(x,z)),
  polygons:{cell:3.4,trough:.24,rim:.06,width:.14,where:(x,z)=>{const u=G.uOf(x,z),aa=Math.abs(G.pOf(x,z))-G.W(u);return smooth(40,110,aa)*smooth(1200,300,aa)*smooth(sn+150,sn-100,u);}}}):null;}
const OUT=SITE.outwash||null;
function glacierLand(x,z){const u=G.uOf(x,z),p=G.pOf(x,z)-GCEN(G.uOf(x,z)),aa=Math.abs(p);
 let h=PROF(u)+22*(fbm(x*.0008,z*.0008,91,3)-.5)+6*(fbm(x*.004,z*.004,92,2)-.5);
 h+=wallsAt(aa,p<0,x,z)*(1+.18*n2(x,z,.0008,93));   /* KGLACIER's across: p > 0 is north of an ice flowing west ([uz, -ux] = [0,-1]) */
 if(OUT)h-=OUT.drop*smooth(OUT.bar+18,OUT.bar-18,u)*smooth(700,300,aa);   /* the rock bar: the outwash's first cascade */
 h=G.bed(x,z,h);if(FROST)h+=FROST.h(x,z);
 return h;}
function iceAt(x,z){if(!G)return 0;let t=G.iceAt(x,z);if(t<=0)return 0;for(const C of GCAVES){const dx=x-C.x,dz=z-C.z,al=dx*Math.cos(C.face)+dz*Math.sin(C.face),pp=-dx*Math.sin(C.face)+dz*Math.cos(C.face),
 d=Math.hypot(al>0?pp*.5:pp,al>0?al*.3:al);if(d<C.R*1.4)t*=smooth(C.R*.9,C.R*1.3,d);}return t;}
// the ice caves: shells at the snout's margins, the mouths facing down the ice
const GCAVES=GL?(GL.caves||[]).map(C=>{const c=G.at(C.u,GCEN(C.u)+C.aw*G.W(C.u)),sg=Math.sign(C.aw),ox=-GL.up[0]*.94+sg*GL.up[1]*.34,oz=-GL.up[1]*.94-sg*GL.up[0]*.34;
 return{x:c[0],z:c[1],R:C.R,H:C.R*.82,face:Math.atan2(oz,ox),mouth:.2,name:'An ice cave at the snout (meltwater portal; peacock-blue inside)',u:C.u,aw:C.aw};}):[];
GCAVES.forEach(C=>{C.floor=glacierLand(C.x,C.z);});
// THE POOL behind the terminal moraine (KGLACIER's basin) and THE OUTWASH (from the breach, graded: it never climbs; the rock bar a fall)
const POND=GL?(function(){const TM=G.TERM,u=G.termU(TM.breach),c=G.at(u+6,TM.breach);return{level:glacierLand(c[0],c[1])+iceAt(c[0],c[1])-.6,name:'The proglacial pool (behind the terminal moraine: milky turquoise with rock flour)'};})():null;
const OUTW=GL?(function(){const P=[],du=8,TM=G.TERM;let u=G.termU(TM.breach)+10,prev=1e9,lip=null,foot=null;
 for(;u>-TERR.R*1.12;u-=du){const p=TM.breach+20*Math.sin(u*.004),c=G.at(u,p),g=glacierLand(c[0],c[1]);let y=Math.min(g-.8,prev-du*.004);
  if(prev<1e8&&prev-y>4&&!lip){lip=[P[P.length-1][0],P[P.length-1][1],prev];}
  if(lip&&!foot&&prev-y<=4&&P.length&&P[P.length-1][2]<lip[2]-8)foot=[c[0],c[1],y];
  P.push([c[0],c[1],y]);prev=y;}
 return{pts:P,hw:OUT.w/2,lip,foot};})():null;
const OSBK=OUTW?(function(){const B=new Map(),cs=64,k=(i,j)=>i*65536+j,P=OUTW.pts;for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1];
 for(let ii=Math.floor((Math.min(a[0],b[0])-30)/cs);ii<=Math.floor((Math.max(a[0],b[0])+30)/cs);ii++)for(let jj=Math.floor((Math.min(a[1],b[1])-30)/cs);jj<=Math.floor((Math.max(a[1],b[1])+30)/cs);jj++){const kk=k(ii,jj);if(!B.has(kk))B.set(kk,[]);B.get(kk).push(i);}}
 return{at(x,z){const L=B.get(k(Math.floor(x/cs),Math.floor(z/cs)));let best={d:1e9,y:0};if(!L)return best;
  for(const i of L){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)-OUTW.hw;
   if(d<best.d)best={d,y:mix(a[2],b[2],t)};}return best;}};})():null;

// ---- terrainH, waterH
function landH(x,z){return GL?glacierLand(x,z)+iceAt(x,z):chainLand(x,z);}
function floor0(x){return SITE.base;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;let h=landH(x,z);
 if(OSBK){const s=OSBK.at(x,z);if(s.d<30){const bed=s.d<0?s.y-.35-.5*smooth(0,-OUTW.hw*.7,s.d):s.y-.35+.6*smooth(0,6,s.d)+.12*Math.max(0,s.d-6);h=Math.min(h,bed);}}
 h=DIG_CUT(x,z,h);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){
 if(GL){if(POND&&G.lakeAt(x,z)>.2&&landH(x,z)<POND.level+.2)return POND.level;if(OSBK){const s=OSBK.at(x,z);if(s.d<0)return s.y;}return -1e9;}
 const zc=axisZ(x),aa=Math.abs(z-zc),ti=FLOOR.tread(x);
 if(ti>=0){const t=TREADS[ti],hw=treadHW(t,x)+(t.kind==='stream'?0:3);if(aa<hw)return t.y;return -1e9;}
 const R=RISER_CACHE(x);if(R&&aa<CH*.7)return lerp(R.A.y,R.B.y,R.t);
 if(RIVER&&x<RIVER_X0&&aa<RIVER.w/2)return riverY(x)-.3;
 return -1e9;}
const ICE=(x,z)=>GL?iceAt(x,z):0;

// ---------------------------------------------------------------- the diggings (40: OPAL_DIGGINGS), put on this ground: pits cut, spoil heaped
// A placer pit is turned off the water (moved out along the shore's normal); a sluice stands beside its riser's fall; an adit on the wall's foot (moved
// up-slope until the ground there is steep); a dive landing on its lake's shore. The spoil fans run downhill (an adit's down the wall's fall line).
const DIGS=(function(){const D=OPAL_DIGGINGS(SITE),h0=(x,z)=>landH(x,z),wet=(x,z)=>waterH(x,z)>-1e8;
 const slopeDir=(x,z)=>{const e=4,gx=h0(x+e,z)-h0(x-e,z),gz=h0(x,z+e)-h0(x,z-e);return{gx,gz,s:Math.hypot(gx,gz)/(2*e)};};
 D.forEach(r=>{
  if(r.kind==='placer'){   /* off the water: the pit's floor (the ground less its depth) a hand over the nearest water, moved out across the axis */
   const lvl=x=>TREADS?FLOOR.y(x):(POND?POND.level:-1e9);
   for(let k=0;k<40&&(wet(r.x,r.z)||wet(r.x+r.r*2,r.z)||wet(r.x-r.r*2,r.z)||wet(r.x,r.z+r.r*2)||wet(r.x,r.z-r.r*2)||h0(r.x,r.z)-r.depth-.5<lvl(r.x));k++){const zc=TREADS?axisZ(r.x):0,sg=r.z>zc?1:-1;r.z+=sg*10;}}
  if(r.kind==='sluice'&&TREADS){const L=SITE.chain[r.riser],N=SITE.chain[r.riser+1];if(L&&N){const xm=(L.x1+N.x0)/2;r.x=xm;r.z=axisZ(xm)+r.side*(STEP_HW*1.6+20);r.az=Math.PI;
   for(let k=0;k<20&&(wet(r.x,r.z)||wet(r.x+r.len/2,r.z)||wet(r.x-r.len/2,r.z));k++)r.z+=r.side*10;}}   /* beside the riser, out of its pools */
  if(r.kind==='adit'){for(let k=0;k<40;k++){const s=slopeDir(r.x,r.z);if(s.s>.75)break;const l=Math.hypot(s.gx,s.gz)||1;r.x+=s.gx/l*8;r.z+=s.gz/l*8;}
   const s=slopeDir(r.x,r.z),l=Math.hypot(s.gx,s.gz)||1;r.az=Math.atan2(-s.gz/l,-s.gx/l);   /* the mouth faces down the slope */
   r.spoil.az=r.az;}
  if(r.kind==='dive'){const L=LAKES[r.lake];if(L){const x=lerp(L.x0,L.x1,r.t),hw=treadHW(L,x);r.x=x;r.z=axisZ(x)+r.side*(hw+6);r.az=r.side>0?-Math.PI/2:Math.PI/2;}}
  if(r.spoil&&r.spoil.az==null)r.spoil.az=0;
  if(r.spoil&&r.kind==='placer'){const s=slopeDir(r.x,r.z);if(s.s>.01)r.spoil.az=Math.atan2(-s.gz,-s.gx);}
  if(r.spoil){const d=r.kind==='adit'?r.spoil.len*.55:r.kind==='sluice'?r.len*.6:r.r+r.spoil.len*.45;r.spoil.x=r.x+Math.cos(r.spoil.az)*d;r.spoil.z=r.z+Math.sin(r.spoil.az)*d;}});
 return D;})();
// the cut and the heap: a pit is a bowl, a spoil fan a low mound along its azimuth (an adit's a tongue down the slope). Off the water, always
function DIG_CUT(x,z,h){for(const r of DIGS){
  if(r.kind==='placer'){const d=Math.hypot(x-r.x,z-r.z);if(d<r.r*1.3)h-=r.depth*smooth(r.r*1.25,r.r*.35,d);}
  const s=r.spoil;if(!s)continue;const dx=x-s.x,dz=z-s.z,c=Math.cos(s.az),sn=Math.sin(s.az),al=dx*c+dz*sn,ac=-dx*sn+dz*c;
  if(Math.abs(al)<s.len*.6&&Math.abs(ac)<s.w*.6){const k=smooth(.6,.1,Math.abs(ac)/s.w)*smooth(.6,.05,Math.abs(al)/s.len);if(k>0)h+=s.h*k*(r.kind==='adit'?(.6+.4*smooth(s.len*.5,-s.len*.4,al)):1);}}
 return h;}

// ---------------------------------------------------------------- the heat (the middle bed's seeps; KTHERM in 48): the soil's mean until then
let HEAT_AT=(x,z)=>SITE.soil;

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   wet     the water's margins (the lakes' shores, the steps, the streams), the spray at the falls; the rest by the station's rain
//   flow    a stream's or a riser's banks (Xanadu's builder reads it: its riparian species)
//   upland  0 on the floor .. 1 up the walls (Xanadu's zones: shore, vale, uplands, crag)
//   rock    the steeps: the walls, the risers' faces, the moraines' fronts, the gorge
//   mist    the falls' spray (every riser over 8 m, the cataract), the canyon's mist (the lower bed)
//   cold    by height over the station's snow line; ice: 1 on the glacier (nothing roots there)
//   flat    the frost's flats (the glacier's outwash); canyon: the lower bed's walls' shade; geo: the seeps' heat (48)
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),wd=w>-1e8?0:1;let near=0;
 for(let k=0;k<8&&wd;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*25,z+Math.sin(a)*25)>-1e8){near=Math.max(near,.85);break;}}
 for(let k=0;k<8&&wd&&near<.8;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*80,z+Math.sin(a)*80)>-1e8){near=Math.max(near,.5);break;}}
 let spray=0,flowB=0,aa=0;
 if(TREADS){const zc=axisZ(x);aa=Math.abs(z-zc);const R=RISER_CACHE(x);
  for(let i=0;i+1<SITE.chain.length;i++){const A=SITE.chain[i],B=SITE.chain[i+1];if(A.y-B.y<20)continue;   /* the falls' mist down a whole dam (its rimstone steps) and a little past its foot */
   spray=Math.max(spray,smooth(200,40,aa)*smooth(B.x0-160,B.x0,x)*smooth(A.x1+60,A.x1,x)*clamp((A.y-B.y)/60,.5,1));}
  const ti=FLOOR.tread(x);flowB=(ti>=0&&TREADS[ti].kind==='stream')||R?smooth(60,8,aa):0;
  if(RIVER&&x<RIVER_X0)flowB=Math.max(flowB,smooth(80,10,aa));}
 if(OSBK){const s=OSBK.at(x,z);flowB=Math.max(flowB,smooth(60,5,s.d));}
 const ice=GL?smooth(.3,2,iceAt(x,z)):0;
 const rock=clamp(Math.max(smooth(.5,.82,slope),smooth(.35,.6,slope)*.45),0,1);
 const up=GL?clamp((h-SITE.base)/600,0,1):clamp((h-SITE.base)/700+.25*smooth(500,1200,aa),0,1);
 const canyon=SITE.canyon?smooth(SITE.walls.n0-260,SITE.walls.n0-20,aa):0;
 const mist=clamp(Math.max(spray,SITE.canyon?.25+.35*canyon:0),0,1);
 const wet=clamp(SITE.rain/1400*.55+.55*near+.45*spray+.4*flowB-.2*rock+.06*n2(x,z,.002,131),0,1);
 let flat=0;if(FROST&&GL){const u=G.uOf(x,z),a2=Math.abs(G.pOf(x,z))-G.W(u);flat=smooth(40,110,a2)*smooth(1200,300,a2)*smooth(GL.snout+150,GL.snout-100,u);}
 return{wet,flow:flowB,upland:up,canyon,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:clamp(.5+(h-SITE.snow[0])/1400+(SITE.temp.mean<3?.25:0),0,1),geo:0,barren:ice,fog:0,mist,flat:flat*(1-rock),ice};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat','ice'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const Lc={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==Lc.x||z!==Lc.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);Lc.x=x;Lc.z=z;Lc.k=j*N+i;Lc.fu=u-i;Lc.fv=v-j;}
  const k=Lc.k,fu=Lc.fu,fv=Lc.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
FIELD.geo=(x,z)=>clamp((HEAT_AT(x,z)-SITE.soil)/60,0,1);

// ---------------------------------------------------------------- the host binding
// nothing roots in the water or on the glacier's ice (PLAN.md section 10, O6: "nothing grows on the ice")
function rootMask(x,z){if(GL&&iceAt(x,z)>.3)return 0;const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;return d<.7?(d-.15)/.55:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
DIGS.forEach(r=>{if(r.kind==='sluice'||r.kind==='dive')OBSTACLES.push({x:r.x,z:r.z,r:r.kind==='sluice'?r.len*.6:8,y0:-1e4,y1:1e4});if(r.kind==='adit')OBSTACLES.push({x:r.x,z:r.z,r:6,y0:-1e4,y1:1e4});});
(SITE.sites||[]).forEach(s=>OBSTACLES.push({x:s.x,z:s.z,r:s.r,y0:-1e4,y1:1e4}));
const SPINE=(function(){const o=[[0,0]];if(TREADS)for(let x=TERR.R-300;x>=-TERR.R+300;x-=500)o.push([x,axisZ(x)-160],[x,axisZ(x)+160]);   /* the axis's both shores: the walkable valley */if(GL)o.push([GL.snout,0],[GL.snout+900,0],[-1200,0]);
 (SITE.sites||[]).forEach(s=>o.push([s.x,s.z]));return o;})();
BIO.init({tags:'opalvalley',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:200+SITE.zone,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:240,mid:600,far:2400,floor:[180,440]},
 windows:{water:WBOX}});
BIO.setSun([-1000,1100,-500]);
