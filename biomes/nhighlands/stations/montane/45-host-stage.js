// ================================================================= HOST — stage, STATIONS 2-4 (the dry side of the polygon: PLAN-STATIONS.md)
// One land for three stations: this file is station 2's (`montane`) and the base of stations 3 (`foothills`) and 4 (`alpine`) (station.json "base").
// Each station's `44z-host-site.js` gives a SITE record (the ramp, relief, granite domes, scarps, stream, tarn, climate and its extra fields, the
// LOD spine), and this file builds station 1's contract from it (TERR, the s/t axes, rampH, baseH, SCARPS, PADS, TOWER, STREAM, TARN, STREAM_FLOW,
// STREAM_FALLS, TARN_STILL, streamNear, terrainH, waterH, FC, FIELD, the binding), so the kit's host fragments run on it unchanged. Heights are the kit's
// own page scale (station 1's 0-1400 m stands for 2.3-3 km); a site sets its own and the far country past the map (STATION_FAR_RAMP, 82-host-sky.js).
// The ideal-type host for the NORTHERN HIGHLANDS: the outer (north-western)
// flank of the Inner Wall, where the ground climbs out of the north-western
// lowlands toward the range's crest. Renderer, lights, fog, the terrain with
// terrainH(), the stream and its tarn with waterH(), the climate fields the
// biome asks for (wet / upland / flow / mist / cold / rock), the tick list, the
// error panel. A real world replaces this whole section with its own; the
// biome fragments never read anything from it except through BIO.host.
//
// THE MAP (x east, z SOUTH, origin mid-flank, 6.6 km square). One axis does the
// work: s runs from the low NW corner (s≈-4670, ~0 m, the top of the lowlands'
// foothills) up to the high SE corner (s≈+4670, ~1400 m); t runs across it,
// toward the NE. On that ramp:
//   SPURS AND SIDE VALLEYS   ridged noise in t, the ridges running down the
//                            axis, deeper and sharper the higher you go
//   THE CRAG STEPS           two broken scarps across the slope (s≈+350 and
//                            s≈+1900): grey rock steps of 25-45 m, unbroken
//                            where the stream crosses them (the waterfalls)
//   THE STREAM               rises in a tarn in the boreal band (s≈+2700) and
//                            runs down its own valley to leave by the NW corner:
//                            a monotone bed, cascades, two falls, plunge pools
// The climate follows altitude and aspect: temperate old growth below ~450 m,
// boreal above ~950 m, the north-facing side-valley walls a band colder.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

// FOG: the shape (plain exponential near, saturating far, so the old-growth air is
// hazy at a few hundred metres and the far lowlands still read) is set where the
// sky is, in 82-host-sky.js, with the light modes that change its colour.
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xa9b8b6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00016);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,48000);
const hemi=new THREE.HemisphereLight(0xc4d2d0,0x3e4636,.66);scene.add(hemi);
// the sun stands WNW (canon), mid-afternoon: it lights the NW-facing flank and
// throws long shafts down the side valleys
const SUN_POS=[-1300,880,-420];
const sun=new THREE.DirectionalLight(0xfff0d6,1.36);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8c4d0,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
const STATION_BRECCIA=SITE.breccia===true,STATION_NAME=SITE.name;
const TERR={R:SITE.R,X0:-SITE.R,X1:SITE.R,Z0:-SITE.R,Z1:SITE.R};
const RT2=Math.SQRT1_2;
const sOf=(x,z)=>(x+z)*RT2, tOf=(x,z)=>(x-z)*RT2;
const xzOf=(s,t)=>[(s+t)*RT2,(s-t)*RT2];
const SMAX=TERR.R*1.415;
const rampH=s=>SITE.ramp(clamp(s,-SMAX,SMAX));
const upU=s=>clamp((s+SMAX)/(2*SMAX),0,1);
// the far country past the map: the site's ramp carried on at its slope at each edge, then its own far rise or fall (82-host-sky.js reads it)
const STATION_FAR_RAMP=s=>s<-SMAX?SITE.ramp(-SMAX)+SITE.farNW(-SMAX-s):s>SMAX?SITE.ramp(SMAX)+SITE.farSE(s-SMAX):SITE.ramp(s);
const ST=SITE.stream;
const tStream=s=>ST.t0+ST.a1*Math.sin(s*ST.f1+ST.p1)+ST.a2*Math.sin(s*ST.f2+ST.p2);
const S_SRC=ST.src, S_END=ST.end;
const SCARPS=SITE.scarps||[];
function scarpAt(Sc,s,t){const sc=Sc.s0+Sc.a*Math.sin(t*Sc.f+Sc.ph)+60*(fbm(t*.004,Sc.seed,5,2)-.5);
 const gap=smooth(.38,.52,fbm(t*.0016+Sc.seed,3.3,Sc.seed,2));
 const atStream=smooth(260,40,Math.abs(t-tStream(sc)));
 const a=Sc.amp*Math.max(gap,atStream);
 return{sc,a,k:smooth(sc-11,sc+11,s)};}
// THE LAND'S FORMS as plain records (SITE): granite DOMES (an exfoliation dome: a steep-sided cap), KNOLLS (round rises), each by index
const DOMES=SITE.domes||[],KNOLLS=SITE.knolls||[];
const domeH=(x,z)=>{let h=0;for(const D of DOMES){const r=Math.hypot(x-D.x,z-D.z)/D.R;if(r<1)h=Math.max(h,D.h*Math.pow(1-r*r,D.p==null?.6:D.p));}return h;};
const domeK=(x,z)=>{let k=0;for(const D of DOMES){const r=Math.hypot(x-D.x,z-D.z)/D.R;if(r<1.05)k=Math.max(k,smooth(1.05,.75,r));}return k;};
function baseH(x,z){const s=sOf(x,z),t=tOf(x,z),u=upU(s),Rl=SITE.relief;
 let h=rampH(s);
 const w=fbm(x*.0007+3,z*.0007-2,61,2)*900;
 const rn=1-Math.abs(fbm(t*.00105+w*.0006,s*.00028,62,3)*2-1);
 h+=(Rl.spur[0]+Rl.spur[1]*u)*(rn-.55)*1.7;
 h+=Rl.swell*(fbm(x*.0011+7,z*.0011-5,63,3)-.5)+Rl.grain*(fbm(x*.0052-1,z*.0052+4,64,2)-.5);
 const dv=t-tStream(s),Wv=ST.Wv[0]+ST.Wv[1]*u,Vd=ST.Vd[0]+ST.Vd[1]*u;
 h-=Vd*Math.exp(-(dv*dv)/(Wv*Wv));
 for(const Sc of SCARPS){const k=scarpAt(Sc,s,t);h+=k.a*(k.k-smooth(Sc.s0-900,Sc.s0+900,s));}
 for(const K of KNOLLS){const r=Math.hypot(x-K.x,z-K.z)/K.R;if(r<1.6)h+=K.h*Math.exp(-r*r*2.2);}
 h+=domeH(x,z);
 for(const P of PADS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r+P.f)h=mix(P.h,h,smooth(P.r,P.r+P.f,d));}
 return h;}
const PADS=[];
const TOWER={x:-1e5,z:-1e5,s:-1e5,t:0};   // no tower on these stations
const PILLARS=[];                         // no crag pillars (86 is dropped)

// ---------------------------------------------------------------- the stream (station 1's tracing: a monotone bed, plunge pools under every drop)
const STREAM=(function(){const P=[],S=[];const ds=12;
 for(let s=S_SRC;s>=S_END;s-=ds){P.push(xzOf(s,tStream(s)));S.push(S_SRC-s);}
 const n=P.length,LEN=S[n-1];
 const halfW=i=>mix(ST.halfW[0],ST.halfW[1],smooth(0,1,S[i]/LEN));
 const bed=[],dep=[],drop=[];let prev=1e9;
 const TARN_LEVEL=baseH(P[0][0],P[0][1])-1.2;
 for(let i=0;i<n;i++){let b=baseH(P[i][0],P[i][1])-mix(1.4,2.6,S[i]/LEN);if(i===0)b=TARN_LEVEL-1.5;b=Math.min(b,prev-.02);bed.push(b);prev=b;}
 for(let i=0;i<n;i++){const a=bed[Math.max(0,i-1)],c=bed[Math.min(n-1,i+1)];drop.push((a-c)/(2*ds));dep.push(mix(ST.dep[0],ST.dep[1],S[i]/LEN));}
 const pool=new Float32Array(n);
 for(let i=1;i<n;i++)if(drop[i]>.4){for(let k=1;k<=6;k++){const j=i+k;if(j<n&&drop[j]<.3)pool[j]=Math.max(pool[j],2.2*Math.sin(k/7*Math.PI));}}
 for(let i=0;i<n;i++){const r=Math.sin(S[i]*.021+1.1);if(r>.78&&drop[i]<.15)pool[i]=Math.max(pool[i],.8*(r-.78)/.22);}
 for(let i=0;i<n;i++){bed[i]-=pool[i];dep[i]+=pool[i];}
 const level=bed.map((b,i)=>b+dep[i]),bank=bed.map((b,i)=>b+pool[i]);
 const falls=[];for(let i=1;i<n-1;i++)if(drop[i]>.9&&drop[i-1]<=.9)falls.push(i);
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;P.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});
 return{P,S,LEN,bed,bank,dep,level,drop,halfW,falls,TARN_LEVEL,box:[x0-200,z0-200,x1+200,z1+200],src:P[0]};})();
const TARN={x:STREAM.src[0],z:STREAM.src[1],r:SITE.tarn.r,level:STREAM.TARN_LEVEL};
const STREAM_FLOW=WATER.flow({name:ST.name,pts:STREAM.P.map((p,i)=>[p[0],p[1],STREAM.level[i]]),width:STREAM.P.map((p,i)=>2*(STREAM.halfW(i)+4)),
 speed:STREAM.P.map((p,i)=>.8+3*smooth(.05,.9,STREAM.drop[i]))});
const STREAM_FALLS=WATER.fallsOf(STREAM_FLOW,{steep:.5,minDrop:8,fit:true}).map(f=>WATER.fall(f));
const TARN_STILL=WATER.still({name:SITE.tarn.name,level:TARN.level,gradient:SITE.tarn.gradient||{centre:0x24343a,rim:0x5a6250,power:1.6},poly:Array.from({length:48},(_,k)=>{const a=k/48*Math.PI*2;return[TARN.x+Math.cos(a)*(TARN.r+4),TARN.z+Math.sin(a)*(TARN.r+4)];})});
function streamNear(x,z){const B=STREAM.box;if(x<B[0]||x>B[2]||z<B[1]||z>B[3])return null;
 const P=STREAM.P;let bd=1e18,bi=0,bf=0;
 for(let i=0;i<P.length-1;i+=6){const a=P[i],b=P[Math.min(P.length-1,i+6)];const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);const px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;}}
 if(bd>300*300)return null;
 bd=1e18;const i0=Math.max(0,bi-6),i1=Math.min(P.length-2,bi+12);
 for(let i=i0;i<=i1;i++){const a=P[i],b=P[i+1];const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);const px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;bf=t;}}
 return{d:Math.sqrt(bd),s:mix(STREAM.S[bi],STREAM.S[bi+1],bf),i:bi,f:bf,bed:mix(STREAM.bed[bi],STREAM.bed[bi+1],bf),bank:mix(STREAM.bank[bi],STREAM.bank[bi+1],bf),level:mix(STREAM.level[bi],STREAM.level[bi+1],bf),w:STREAM.halfW(bi)};}

// ---------------------------------------------------------------- terrain
function terrainH(x,z){let h=baseH(x,z);
 const dt=Math.hypot(x-TARN.x,z-TARN.z);
 if(dt<TARN.r+60){const bowl=TARN.level-SITE.tarn.depth*(1-Math.pow(Math.min(1,dt/TARN.r),2))+Math.max(0,dt-TARN.r)*.32+(dt<TARN.r?0:.6);if(bowl<h)h=bowl;
  const crest=TARN.level+.9-Math.max(0,dt-TARN.r-4)*.55-Math.max(0,TARN.r+2-dt)*.4;if(dt>TARN.r-2&&crest>h)h=crest;}
 const r=streamNear(x,z);
 if(r){const w=r.w,t=Math.max(0,r.d-w),bank=Math.max(r.bank,r.level-.35)+.55+t*.2+Math.max(0,t-8)*.9;
  if(r.d<w)h=Math.min(h,r.bed-.35*(1-r.d/w));else if(bank<h)h=bank;
  if(r.d<w+4)h=Math.min(h,r.level-.55-.25*(1-r.d/(w+4)));}
 return h;}
function waterH(x,z){if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r+8)return TARN.level;
 const r=streamNear(x,z);if(r&&r.d<r.w+5)return r.level;return -1e9;}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}

// ---------------------------------------------------------------- the climate fields
// The kit's fields (wet / upland / flow / mist / cold / rock) on an 18 m lattice, as station 1 reads them, from the SITE's climate; plus the site's own
// (SITE.extra.names: station 2 `meadow`, `draw`, `fire`; station 3 `chaparral`, `grass`; station 4 `talus`, `snowbed`, `fell`). Krator stands near
// 40 S: the SUNNY side is the north-facing one (north > 0), the shaded and snowy side faces south
const FC=(function(){const N=300,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,XN=(SITE.extra&&SITE.extra.names)||[],K=['h','slope','north','valley','flow','wet','up','mist','cold','rock','dome'].concat(XN),a={};K.forEach(k=>a[k]=new Float32Array(N*N));
 const st=SX/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=TERR.X0+i*st,z=TERR.Z0+j*st;a.h[j*N+i]=terrainH(x,z);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st,h=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*st),hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*st);
  a.slope[k]=Math.hypot(hx,hz);a.north[k]=clamp(hz/.32,-1,1);
  const s=sOf(x,z),t=tOf(x,z),dv=t-tStream(s),u=upU(s),Wv=ST.Wv[0]+ST.Wv[1]*u;a.valley[k]=Math.exp(-(dv*dv)/(Wv*Wv*1.6));
  const r=streamNear(x,z),dT=Math.hypot(x-TARN.x,z-TARN.z);
  a.flow[k]=Math.max(r?smooth(70,5,r.d):0,smooth(TARN.r+50,TARN.r,dT));
  a.up[k]=clamp(h/1400,0,1);a.dome[k]=domeK(x,z);
  const n1=fbm(x*.0021+4,z*.0021-6,88,2)-.5,n2=fbm(x*.0009-3,z*.0009+2,89,2)-.5;
  const F={x,z,h,s,t,slope:a.slope[k],north:a.north[k],valley:a.valley[k],flow:a.flow[k],dome:a.dome[k],n1,n2};
  const c=SITE.climate(F);a.cold[k]=clamp(c.cold,0,1);a.wet[k]=clamp(c.wet,0,1);a.rock[k]=clamp(c.rock,0,1);a.mist[k]=clamp(c.mist,0,1);
  if(XN.length){const e=SITE.extra.at(F,c);for(const n of XN)a[n][k]=clamp(e[n]||0,0,1);}}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
const FIELD={wet:(x,z)=>FC.at(FC.a.wet,x,z),salt:(x,z)=>0,upland:(x,z)=>FC.at(FC.a.up,x,z),flow:(x,z)=>FC.at(FC.a.flow,x,z),
 mist:(x,z)=>FC.at(FC.a.mist,x,z),cold:(x,z)=>FC.at(FC.a.cold,x,z),rock:(x,z)=>FC.at(FC.a.rock,x,z),dome:(x,z)=>FC.at(FC.a.dome,x,z),
 north:(x,z)=>FC.at(FC.a.north,x,z)};   /* > 0 faces north: the sunny side at 40 S */
((SITE.extra&&SITE.extra.names)||[]).forEach(n=>{FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z);});

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the stream from the tarn to the NW corner, the tower, the old wood, a boreal stand, the crest
// the LOD spine: the stream, and the site's own places
const SPINE=(function(){const o=[];for(let s=S_SRC-100;s>=S_END+200;s-=800){const p=xzOf(s,tStream(s));o.push([Math.round(p[0]),Math.round(p[1])]);}
 (SITE.spine||[]).forEach(q=>{const p=xzOf(q[0],q[1]);o.push([Math.round(p[0]),Math.round(p[1])]);});return o;})();
BIO.init({tags:'nhighlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 mask:(x,z)=>{if(x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;   // the map's square: beyond it is the far country
  if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r+4)return 0;const r=streamNear(x,z);if(r&&r.d<r.w+1.2)return 0;   // the water and its wet edge
  if(r&&r.d<r.w+6&&terrainH(x,z)<r.level+.3)return 0;
  return smooth(1.35,.85,FC.at(FC.a.slope,x,z));},                                                                   // the crag faces stay bare rock
 obstacles:OBSTACLES,ticks:tick,seed:31,register:REGISTER,
 origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
// B1/B2 (core/biome README, "Adopting it"): one LOD mesh per chunk, rows sorted by range (lodTick draws the prefix that reaches the
// camera), small meshes merged up to 1500 triangles, and a dithered cross-fade over the last 15% of each range (no pop at a ring)
// the items' geometry welded and drawn by index (core/biome BIO.INDEX_ITEMS; ?index=0 for the soup): the leaf and floor cards were
// vertex-bound on an integrated GPU (the optimization pass, 2026-10-26: a quarter of the pixels saved a tenth of the frame)
BIO.INDEX_ITEMS=new URLSearchParams(location.search).get('index')!=='0';
BIO.LOD.merge=new URLSearchParams(location.search).get("lodmerge")!=="0";BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&new URLSearchParams(location.search).get("lodfade")!=="0"?.15:0;
// per-instance range culling for loose instances (core/biome BIO.LOD.cull; GRAPHIC-LOAD.md recommendation 1; ?lodcull=0 to compare)
BIO.LOD.cull=BIO.LOD.fade>0&&new URLSearchParams(location.search).get('lodcull')!=='0';
BIO.setSun(SUN_POS);
