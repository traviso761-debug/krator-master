// ================================================================= HOST — stage
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
const REG=[];function REGISTER(o){REG.push(o);}

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
const TERR={R:3300,X0:-3300,X1:3300,Z0:-3300,Z1:3300};
const RT2=Math.SQRT1_2;
const sOf=(x,z)=>(x+z)*RT2, tOf=(x,z)=>(x-z)*RT2;
const xzOf=(s,t)=>[(s+t)*RT2,(s-t)*RT2];
// the ramp: ~0 m at the NW corner, ~700 m mid-map, ~1400 m at the SE corner
const rampH=s=>700+700*Math.sin(clamp(s/4900,-1,1)*Math.PI/2);
const upU=s=>clamp((s+4900)/9800,0,1);
// the stream's line across the axis (t as a function of s): a slow meander and a quicker one
const tStream=s=>60+180*Math.sin(s*.00105+.4)+90*Math.sin(s*.0027+1.3);
const S_SRC=2700, S_END=-4760;
// the crag steps: where (in s) each scarp crosses a given t, and how high it is there
const SCARPS=[{s0:350,amp:40,a:120,f:.0017,ph:.3,seed:71},{s0:1900,amp:27,a:160,f:.0013,ph:1.9,seed:72}];
function scarpAt(Sc,s,t){const sc=Sc.s0+Sc.a*Math.sin(t*Sc.f+Sc.ph)+60*(fbm(t*.004,Sc.seed,5,2)-.5);
 const gap=smooth(.38,.52,fbm(t*.0016+Sc.seed,3.3,Sc.seed,2));                // the scarp is broken: gaps where it fades out
 const atStream=smooth(260,40,Math.abs(t-tStream(sc)));                       // and whole where the stream crosses it
 const a=Sc.amp*Math.max(gap,atStream);
 return{sc,a,k:smooth(sc-11,sc+11,s)};}
// BASE TERRAIN: everything but the stream's own channel and the tarn
function baseH(x,z){const s=sOf(x,z),t=tOf(x,z),u=upU(s);
 let h=rampH(s);
 // spurs and side valleys: ridged noise across the axis, the ridges running down it
 const w=fbm(x*.0007+3,z*.0007-2,61,2)*900;
 const rn=1-Math.abs(fbm(t*.00105+w*.0006,s*.00028,62,3)*2-1);
 h+=(60+300*u)*(rn-.55)*1.7;
 // broad swells and the ground's grain
 h+=70*(fbm(x*.0011+7,z*.0011-5,63,3)-.5)+(10+22*u)*(fbm(x*.0052-1,z*.0052+4,64,2)-.5);
 // the stream's valley: deeper and wider up the flank
 const dv=t-tStream(s),Wv=150+130*u,Vd=34+120*u;
 h-=Vd*Math.exp(-(dv*dv)/(Wv*Wv));
 // the crag steps (the ramp's rise is taken out of the slope below and put back as a cliff)
 for(const Sc of SCARPS){const k=scarpAt(Sc,s,t);h+=k.a*(k.k-smooth(Sc.s0-900,Sc.s0+900,s));}
 // pads the host levels (the tower's footing)
 for(const P of PADS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r+P.f)h=mix(P.h,h,smooth(P.r,P.r+P.f,d));}
 return h;}
const PADS=[];
// the Girder tower's footing: on a bench above the stream's east bank in the temperate band
const TOWER=(function(){const s=-1650,t=tStream(s)+150,p=xzOf(s,t);return{x:p[0],z:p[1],s,t};})();
PADS.push({x:TOWER.x,z:TOWER.z,r:46,f:40,h:baseH(TOWER.x,TOWER.z)});   // baseH reads PADS, still empty here

// ---------------------------------------------------------------- the stream
// Traced down the axis from the tarn. The bed comes from the base terrain along
// the line, then is clamped never to rise (xanadu's lesson): where the line
// crosses a crag step the bed drops with it, and that is a waterfall. A plunge
// pool is dug at the foot of each drop and the water's depth grows by the same
// amount, so the surface stays monotone while the bed dips.
const STREAM=(function(){const P=[],S=[];const ds=12;
 for(let s=S_SRC;s>=S_END;s-=ds){P.push(xzOf(s,tStream(s)));S.push(S_SRC-s);}
 const n=P.length,LEN=S[n-1];
 const halfW=i=>mix(2.2,6.5,smooth(0,1,S[i]/LEN));
 const bed=[],dep=[],drop=[];let prev=1e9;
 const TARN_LEVEL=baseH(P[0][0],P[0][1])-1.2;
 for(let i=0;i<n;i++){let b=baseH(P[i][0],P[i][1])-mix(1.6,3.2,S[i]/LEN);if(i===0)b=TARN_LEVEL-1.5;b=Math.min(b,prev-.03);bed.push(b);prev=b;}
 for(let i=0;i<n;i++){const a=bed[Math.max(0,i-1)],c=bed[Math.min(n-1,i+1)];drop.push((a-c)/(2*ds));dep.push(mix(.45,1.1,S[i]/LEN));}
 // plunge pools: below every drop steeper than 1:2.5, and a riffle-pool rhythm between
 const pool=new Float32Array(n);
 for(let i=1;i<n;i++)if(drop[i]>.4){for(let k=1;k<=6;k++){const j=i+k;if(j<n&&drop[j]<.3)pool[j]=Math.max(pool[j],2.6*Math.sin(k/7*Math.PI));}}
 for(let i=0;i<n;i++){const r=Math.sin(S[i]*.021+1.1);if(r>.75&&drop[i]<.15)pool[i]=Math.max(pool[i],.9*(r-.75)/.25);}
 for(let i=0;i<n;i++){bed[i]-=pool[i];dep[i]+=pool[i];}
 const level=bed.map((b,i)=>b+dep[i]),bank=bed.map((b,i)=>b+pool[i]);
 // the falls (for the views, the probe and the foam)
 const falls=[];for(let i=1;i<n-1;i++)if(drop[i]>.9&&drop[i-1]<=.9)falls.push(i);
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;P.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});
 return{P,S,LEN,bed,bank,dep,level,drop,halfW,falls,TARN_LEVEL,box:[x0-200,z0-200,x1+200,z1+200],src:P[0]};})();
const TARN={x:STREAM.src[0],z:STREAM.src[1],r:78,level:STREAM.TARN_LEVEL};
// nearest point on the stream: {d, s (metres downstream), i, f, bed, level, w}
function streamNear(x,z){const B=STREAM.box;if(x<B[0]||x>B[2]||z<B[1]||z>B[3])return null;
 const P=STREAM.P;let bd=1e18,bi=0,bf=0;
 for(let i=0;i<P.length-1;i+=6){const a=P[i],b=P[Math.min(P.length-1,i+6)];const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);const px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;}}
 if(bd>300*300)return null;
 bd=1e18;const i0=Math.max(0,bi-6),i1=Math.min(P.length-2,bi+12);
 for(let i=i0;i<=i1;i++){const a=P[i],b=P[i+1];const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);const px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;bf=t;}}
 return{d:Math.sqrt(bd),s:mix(STREAM.S[bi],STREAM.S[bi+1],bf),i:bi,f:bf,bed:mix(STREAM.bed[bi],STREAM.bed[bi+1],bf),bank:mix(STREAM.bank[bi],STREAM.bank[bi+1],bf),level:mix(STREAM.level[bi],STREAM.level[bi+1],bf),w:STREAM.halfW(bi)};}

// ---------------------------------------------------------------- terrain
function terrainH(x,z){let h=baseH(x,z);
 // the tarn: a bowl in the boreal band, its floor 5 m under the water
 const dt=Math.hypot(x-TARN.x,z-TARN.z);
 if(dt<TARN.r+60){const bowl=TARN.level-5.5*(1-Math.pow(Math.min(1,dt/TARN.r),2))+Math.max(0,dt-TARN.r)*.32+ (dt<TARN.r?0:.6);if(bowl<h)h=bowl;}
 // the stream's channel: a bed, a low bank, then the valley floor
 const r=streamNear(x,z);
 if(r){const w=r.w,t=Math.max(0,r.d-w),bank=Math.max(r.bank,r.level-.35)+.55+t*.2+Math.max(0,t-8)*.9;
  if(r.d<w)h=Math.min(h,r.bed-.35*(1-r.d/w)+.0);else if(bank<h)h=bank;}
 return h;}
// the local water surface: the stream's level across its channel, the tarn's level in its bowl, none elsewhere
function waterH(x,z){if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r+8)return TARN.level;
 const r=streamNear(x,z);if(r&&r.d<r.w+5)return r.level;return -1e9;}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}

// ---------------------------------------------------------------- the climate fields
// Cached on an 18 m lattice (the Rift's lesson: the fields are read a million
// times a build); terrainH itself stays exact.
const FC=(function(){const N=380,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,K=['h','slope','north','valley','flow','wet','up','mist','cold','rock'],a={};K.forEach(k=>a[k]=new Float32Array(N*N));
 const st=SX/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=TERR.X0+i*st,z=TERR.Z0+j*st;a.h[j*N+i]=terrainH(x,z);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st,h=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*st),hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*st);
  a.slope[k]=Math.hypot(hx,hz);a.north[k]=clamp(hz/.32,-1,1);   // >0: the ground rises southward, so it faces north
  const s=sOf(x,z),t=tOf(x,z),u=upU(s);
  const dv=t-tStream(s),Wv=150+130*u;a.valley[k]=Math.exp(-(dv*dv)/(Wv*Wv*1.6));
  const r=streamNear(x,z),dT=Math.hypot(x-TARN.x,z-TARN.z);
  a.flow[k]=Math.max(r?smooth(80,6,r.d):0,smooth(TARN.r+60,TARN.r,dT));
  a.up[k]=clamp(h/1400,0,1);
  const n1=fbm(x*.0021+4,z*.0021-6,88,2)-.5,n2=fbm(x*.0009-3,z*.0009+2,89,2)-.5;
  // COLD: altitude, the north-facing walls a band colder, cold air pooling in the stream's valley
  a.cold[k]=clamp((h+150*a.north[k]+55*a.valley[k]+120*n2-380)/960,0,1);
  // WET: high everywhere (it rains on this flank); highest by the water and on the NW faces, lower on the spur crests
  const crest=smooth(.62,.85,1-a.valley[k])*smooth(.25,.6,n1+.5);
  a.wet[k]=clamp(.80+.10*a.valley[k]+.14*a.flow[k]-.14*crest-.08*clamp(-a.north[k],0,1)+.12*n1,0,1);
  // ROCK: the crag steps and cliffs, and the boulder fields of the middle band (the old wood stands on them)
  const boulder=smooth(.56,.68,fbm(x*.0024+9,z*.0024-1,90,2))*smooth(240,420,h)*smooth(1060,880,h);
  a.rock[k]=clamp(Math.max(smooth(.62,1.15,a.slope[k]),boulder*.9),0,1);
  // MIST: in the hollows and along the water, and a cloud band on the upper slopes
  a.mist[k]=clamp(Math.max(a.valley[k]*.75*smooth(-.25,.2,n2),a.flow[k]*.92,smooth(820,1120,h)*.7*smooth(-.2,.25,n1)),0,1);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
const FIELD={wet:(x,z)=>FC.at(FC.a.wet,x,z),salt:(x,z)=>0,upland:(x,z)=>FC.at(FC.a.up,x,z),flow:(x,z)=>FC.at(FC.a.flow,x,z),
 mist:(x,z)=>FC.at(FC.a.mist,x,z),cold:(x,z)=>FC.at(FC.a.cold,x,z),rock:(x,z)=>FC.at(FC.a.rock,x,z)};

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the stream from the tarn to the NW corner, the tower, the old wood, a boreal stand, the crest
const SPINE=(function(){const o=[];for(let s=S_SRC-100;s>=-4300;s-=880){const p=xzOf(s,tStream(s));o.push([Math.round(p[0]),Math.round(p[1])]);}
 o.push([Math.round(TOWER.x),Math.round(TOWER.z)]);
 [[-350,-560],[1500,560],[3700,-250],[-2600,-760]].forEach(q=>{const p=xzOf(q[0],q[1]);o.push([Math.round(p[0]),Math.round(p[1])]);});
 return o;})();
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 mask:(x,z)=>{if(x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;   // the map's square: beyond it is the far country
  if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r+4)return 0;const r=streamNear(x,z);if(r&&r.d<r.w+1.2)return 0;   // the water and its wet edge
  if(r&&r.d<r.w+6&&terrainH(x,z)<r.level+.3)return 0;
  return smooth(1.35,.85,FC.at(FC.a.slope,x,z));},                                                                   // the crag faces stay bare rock
 obstacles:OBSTACLES,ticks:tick,seed:31,register:REGISTER,
 origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
BIO.setSun(SUN_POS);
