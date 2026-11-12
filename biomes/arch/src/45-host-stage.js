// ================================================================= HOST — stage: the Arch's stations (PLAN.md sections 5 and 11; 2026-11-12)
// The ideal-type host for one station of the Arch: the renderer, the light, the land drawn from its site record (41: ARCH_SITES) and the confluence's
// profile and meeting (42: ARCH.profile, ARCH.meeting), the climate fields, the chemistry fields (the pH of the ground: PH_AT) and the biome core's
// binding. Started from biomes/highrift's stage (the same shape of page). A station's folder sets STATION_KEY; the default page is the confluence.
//   confluence  the dome's corrugated foot north-west, a bench of travertine and laterite, the graben's edge fault stepping down to the sound's floor
//               south-east; two springs' white terraces to an alkaline pool, the solfatara's acid stream down from the north-east, the meet, the outflow
//               south-east split by curtains to the fault, mixed beyond
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}
const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'confluence',SITE=ARCH_SITES[SKEY];
const STATION_REGION=SITE.name+' (the Arch; ideal type)';

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: 1.56 atm, wet sea air (Am): a pale, hazy sky; the sky binding (89) drives it
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd4dce0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00016);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xd0e0ec,0x8a7a64,.78));
const sun=new THREE.DirectionalLight(0xffffff,1.25);sun.position.set(-600,1300,-700);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe4e8ee,.2);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
const SNOW_LINE=[9000,9500];   /* none: the Arch is tropical (the snow cover is off) */
// a segment's frame: s metres along from a, signed a across (+ to the right going a -> b), L its length
function segFrame(A,B){const dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;return{A,B,L,ux,uz,at:(x,z)=>{const px=x-A[0],pz=z-A[1];return{s:px*ux+pz*uz,a:px*uz-pz*ux};},
 p:(s,a)=>[A[0]+ux*s+uz*a,A[1]+uz*s-ux*a]};}
const n2=(x,z,f,seed)=>fbm(x*f,z*f,seed,2)-.5;
const S2=Math.SQRT1_2,dflt=(v,d)=>v==null?d:v;
const L=(function(){const S=SITE;
 if(SKEY==='confluence'){const MEET=ARCH.meeting(S),M=S.meet,P=S.pool;
  const prof=(x,z)=>ARCH.profile(S,ARCH.uOf(x,z));
  // the waters' lines: the springs' terraces to the pool, the alkaline stream from the pool to the meet, the acid stream from the solfatara, the outflow
  const TER=S.springs.map(sp=>{const F=segFrame([sp.x,sp.z],[P.x,P.z]);const top=prof(sp.x,sp.z)-.6,bot=prof(P.x,P.z)+.4,n=Math.max(6,Math.round(F.L/90));
   const levels=[];for(let i=0;i<n;i++)levels.push(+(top-(top-bot)*i/(n-1)).toFixed(2));const RS=3,TL=(F.L-(n-1)*RS)/n;
   const lv=s=>{s=clamp(s,0,F.L-1e-6);const i=Math.min(n-1,Math.floor(s/(TL+RS))),r=s-i*(TL+RS);return r<=TL||i===n-1?levels[i]:lerp(levels[i],levels[i+1],(r-TL)/RS);};
   return{F,levels,lv,sp};});
  const POOL_LV=prof(P.x,P.z)+.2;
  const ALK=segFrame([P.x,P.z],[M.x,M.z]),ACID=segFrame([S.solfatara.x+40,S.solfatara.z+60],[M.x,M.z]),OUT=segFrame([M.x,M.z],S.outflow.to);
  const wig=(F,k,amp)=>s=>amp*Math.sin(s*k)*smooth(0,60,s)*smooth(F.L,F.L-60,s);
  const alkOff=wig(ALK,.012,10),acidOff=wig(ACID,.006,26),outOff=s=>0;
  // the streams' surface: the land's profile along the line, a little under it (the bed a metre down); the outflow's from the meeting's samples
  const lineLv=(F,off)=>s=>{const p=F.p(s,off(s));return prof(p[0],p[1])-.35;};
  const alkLv=lineLv(ALK,alkOff),acidLv=lineLv(ACID,acidOff);
  const outLv=s=>{const i=clamp(s/10,0,MEET.samples.length-1.001),k=Math.floor(i),f=i-k;return lerp(MEET.samples[k].y,MEET.samples[k+1].y,f)-.35;};
  const chan=(h,F,off,lvf,hw,bank)=>{const q=F.at(h.x,h.z);if(q.s<-30||q.s>F.L+30)return;const a=Math.abs(q.a-off(clamp(q.s,0,F.L)));if(a>hw+bank)return;
   const lv=lvf(clamp(q.s,0,F.L)),bed=lv-.9*smooth(hw,hw*.4,a),w=smooth(hw+bank,hw,a)*smooth(-30,0,q.s)*smooth(F.L+30,F.L,q.s);h.y=mix(h.y,Math.min(h.y,a<hw?bed:lv+.3+(a-hw)*.06),w);};
  function land(x,z){const u=ARCH.uOf(x,z),v=(x-z)*S2;let h=ARCH.profile(S,u);
   // the dome's mullions: ridges along the opening direction (north-west to south-east), fading onto the bench; small knobs of rind
   const dome=smooth(260,-260,u);h+=dome*(S.corrug.amp*Math.sin(v/S.corrug.spacing*TAU+.8*n2(x,z,.0012,21))+2.2*n2(x,z,.006,22));
   h+=1.1*n2(x,z,.004,23)+.35*n2(x,z,.03,24);
   // the edge fault's face: rough, with a talus apron at its foot
   {const s0=S.profile.scarpU[0],s1=S.profile.scarpU[1];h+=3*smooth(s0-20,s0+40,u)*smooth(s1+30,s1-10,u)*n2(x,z,.02,25)+1.5*smooth(s1-10,s1+60,u)*smooth(s1+160,s1+60,u);}
   const H={x,z,y:h};
   // the springs' terraces on their built travertine ridges (highrift's staircase), the pool's bowl
   for(const T of TER){const q=T.F.at(x,z),aa=Math.abs(q.a);if(q.s>-40&&q.s<T.F.L+40&&aa<200){const lv=T.lv(q.s),ridge=lv+1.6*smooth(110,20,aa)-.2,
     w=smooth(-40,10,q.s)*smooth(T.F.L+40,T.F.L,q.s);H.y=mix(H.y,Math.max(H.y,ridge),w*smooth(200,90,aa));if(aa<16&&w>.5)H.y=lv-.7;}}
   {const d=Math.hypot(x-P.x,z-P.z);if(d<P.r)H.y=POOL_LV-2.2*(1-Math.pow(d/P.r,1.6))-.3;else if(d<P.r+120)H.y=mix(POOL_LV+.5+(d-P.r)*.01,H.y,smooth(P.r,P.r+120,d));}
   for(const sp of S.springs){const d=Math.hypot(x-sp.x,z-sp.z),top=prof(sp.x,sp.z);if(d<sp.r)H.y=top-.6-1.8*(1-Math.pow(d/sp.r,1.5));else if(d<sp.r+40)H.y=mix(top+.4,H.y,smooth(sp.r,sp.r+40,d));}
   chan(H,ALK,alkOff,alkLv,5,14);chan(H,ACID,acidOff,acidLv,4.5,12);
   // the outflow: one channel the width of both halves, carved through the fault's face as a chute
   {const q=OUT.at(x,z);if(q.s>-20&&q.s<OUT.L+40){const hw=S.outflow.w/2,a=Math.abs(q.a);if(a<hw+30){const lv=outLv(clamp(q.s,0,OUT.L)),w=smooth(hw+30,hw,a)*smooth(-20,0,q.s);
     H.y=mix(H.y,a<hw?lv-1.0*smooth(hw,hw*.3,a):lv+.3+(a-hw)*.05,w);}}}
   // the solfatara's hollow: bleached, steaming, a few metres sunk
   {const V=S.solfatara,d=Math.hypot(x-V.x,z-V.z);H.y-=4*smooth(V.reach*.8,V.reach*.15,d);for(const p of V.pots){const e=Math.hypot(x-p[0],z-p[1]);if(e<p[2]+3)H.y=Math.min(H.y,prof(p[0],p[1])-4-.4-1.2*smooth(p[2],0,e));}}
   // the flame cleft: a crack along its line on the dome's flank
   {const C=S.flames,F2=segFrame([C.x,C.z],[C.x+C.dir[0]*C.len,C.z+C.dir[1]*C.len]),q=F2.at(x,z);if(q.s>-10&&q.s<F2.L+10)H.y-=.9*smooth(3.5,.5,Math.abs(q.a))*smooth(-10,10,q.s)*smooth(F2.L+10,F2.L-10,q.s);}
   return H.y;}
  function water(x,z){
   for(const T of TER){const q=T.F.at(x,z);if(q.s>=0&&q.s<T.F.L&&Math.abs(q.a)<15)return T.lv(q.s);}
   if(Math.hypot(x-P.x,z-P.z)<P.r+3)return POOL_LV;
   for(const sp of S.springs)if(Math.hypot(x-sp.x,z-sp.z)<sp.r+1)return prof(sp.x,sp.z)-.6;
   {const q=ALK.at(x,z);if(q.s>=0&&q.s<=ALK.L&&Math.abs(q.a-alkOff(q.s))<5)return alkLv(q.s);}
   {const q=ACID.at(x,z);if(q.s>=0&&q.s<=ACID.L&&Math.abs(q.a-acidOff(q.s))<4.5)return acidLv(q.s);}
   {const q=OUT.at(x,z);if(q.s>=0&&q.s<=OUT.L&&Math.abs(q.a)<S.outflow.w/2)return outLv(q.s);}
   for(const p of S.solfatara.pots)if(Math.hypot(x-p[0],z-p[1])<p[2]+.5)return prof(p[0],p[1])-4.2;
   return -1e9;}
  // the pH of the ground and the water, for the plants and the inspector (PLAN.md 3.5): the aprons' and the alkaline water's, the acid's, the laterite's
  const APRON=(x,z)=>{let a=0;for(const T of TER){const q=T.F.at(x,z);if(q.s>-30&&q.s<T.F.L+30)a=Math.max(a,smooth(60,18,Math.abs(q.a)));}
   a=Math.max(a,smooth(P.r+60,P.r+10,Math.hypot(x-P.x,z-P.z)));for(const sp of S.springs)a=Math.max(a,smooth(sp.r+50,sp.r,Math.hypot(x-sp.x,z-sp.z)));
   {const q=ALK.at(x,z);if(q.s>-10&&q.s<ALK.L+10)a=Math.max(a,smooth(22,6,Math.abs(q.a-alkOff(clamp(q.s,0,ALK.L))))*.9);}
   {const q=OUT.at(x,z);if(q.s>-10&&q.s<MEET.end)a=Math.max(a,smooth(30,10,Math.abs(q.a))*smooth(4,-4,q.a)*.9);}   /* the left (alkaline) bank, to the curtains' end */
   return a;};
  const ACIDG=(x,z)=>{let a=0;const V=S.solfatara;a=Math.max(a,smooth(V.reach*1.05,V.reach*.4,Math.hypot(x-V.x,z-V.z)));
   {const q=ACID.at(x,z);if(q.s>-10&&q.s<ACID.L+10)a=Math.max(a,smooth(24,5,Math.abs(q.a-acidOff(clamp(q.s,0,ACID.L))))*.95);}
   {const q=OUT.at(x,z);if(q.s>-10&&q.s<OUT.L+10)a=Math.max(a,smooth(32,10,Math.abs(q.a))*(q.s<MEET.end?smooth(-4,4,q.a):.7)*.9);}   /* the right (acid) bank; past the fault both, the mixed water still acid */
   return a;};
  return{land,water,MEET,TER,ALK,ACID,OUT,alkOff,acidOff,outOff,alkLv,acidLv,outLv,POOL_LV,prof,APRON,ACIDG,farBase:120,
   spine:[[M.x,M.z],[P.x,P.z],[S.solfatara.x,S.solfatara.z]].concat(S.springs.map(s=>[s.x,s.z])).concat([[S.flames.x,S.flames.z],OUT.p(OUT.L*.5,0)])};}

 if(SKEY==='dome'){const SP=S.corrug.spacing,AMP=S.corrug.amp,uv=(u,v)=>[(u+v)*S2,(u-v)*S2];
  // the springs and the flames placed in the dome's frame (41)
  S.springs.forEach(sp=>{const p=uv(sp.u,sp.v);sp.x=p[0];sp.z=p[1];});{const F=S.flames,p=uv(F.u,F.v);F.x=p[0];F.z=p[1];F.dir=[S2,S2];}
  // the whaleback: the fall south-east, the mullions across it (flat-topped ridges of laterite, troughs of serpentinite), a broad swell
  const mull=(x,z)=>{const v=(x-z)*S2+30*n2(x,z,.0009,41);return AMP*smooth(-.55,.55,Math.sin(v/SP*TAU));};
  const base=(x,z)=>{const u=ARCH.uOf(x,z);return S.base-S.slope*u+18*n2(x,z,.0005,42);};
  const prof=(x,z)=>base(x,z)+mull(x,z);
  const TER=S.springs.map(sp=>{const e=uv(sp.u+sp.len,sp.v),F=segFrame([sp.x,sp.z],e);const top=prof(sp.x,sp.z)-.6,bot=prof(e[0],e[1])+.2,n=Math.max(8,Math.round(F.L/110));
   const levels=[];for(let i=0;i<n;i++)levels.push(+(top-(top-bot)*i/(n-1)).toFixed(2));const RS=3.5,TL=(F.L-(n-1)*RS)/n;
   const lv=s=>{s=clamp(s,0,F.L-1e-6);const i=Math.min(n-1,Math.floor(s/(TL+RS))),r=s-i*(TL+RS);return r<=TL||i===n-1?levels[i]:lerp(levels[i],levels[i+1],(r-TL)/RS);};
   return{F,levels,lv,sp};});
  const SH=segFrame(S.shear.a,S.shear.b);
  function land(x,z){let h=prof(x,z)+1.4*n2(x,z,.004,43)+.4*n2(x,z,.03,44);
   // the shear zone: a soft band, a little sunk, scaly
   {const q=SH.at(x,z);h-=2.5*smooth(S.shear.w,S.shear.w*.3,Math.abs(q.a));}
   const H={x,z,y:h};
   for(const T of TER){const q=T.F.at(x,z),aa=Math.abs(q.a);if(q.s>-40&&q.s<T.F.L+40&&aa<160){const lv=T.lv(q.s),ridge=lv+1.6*smooth(90,18,aa)-.2,
     w=smooth(-40,10,q.s)*smooth(T.F.L+40,T.F.L,q.s);H.y=mix(H.y,Math.max(Math.min(H.y,ridge+12),ridge),w*smooth(160,70,aa));if(aa<15&&w>.5)H.y=lv-.7;}}
   for(const sp of S.springs){const d=Math.hypot(x-sp.x,z-sp.z),top=prof(sp.x,sp.z);if(d<sp.r)H.y=top-.6-1.8*(1-Math.pow(d/sp.r,1.5));else if(d<sp.r+40)H.y=mix(top+.4,H.y,smooth(sp.r,sp.r+40,d));}
   {const C=S.flames,F2=segFrame([C.x,C.z],[C.x+C.dir[0]*C.len,C.z+C.dir[1]*C.len]),q=F2.at(x,z);if(q.s>-10&&q.s<F2.L+10)H.y-=.9*smooth(3.5,.5,Math.abs(q.a))*smooth(-10,10,q.s)*smooth(F2.L+10,F2.L-10,q.s);}
   return H.y;}
  function water(x,z){for(const T of TER){const q=T.F.at(x,z);if(q.s>=0&&q.s<T.F.L&&Math.abs(q.a)<14)return T.lv(q.s);}
   for(const sp of S.springs)if(Math.hypot(x-sp.x,z-sp.z)<sp.r+1)return prof(sp.x,sp.z)-.6;return -1e9;}
  const APRON=(x,z)=>{let a=0;for(const T of TER){const q=T.F.at(x,z);if(q.s>-30&&q.s<T.F.L+30)a=Math.max(a,smooth(55,16,Math.abs(q.a)));}
   for(const sp of S.springs)a=Math.max(a,smooth(sp.r+50,sp.r,Math.hypot(x-sp.x,z-sp.z)));return a;};
  const SHEAR=(x,z)=>smooth(S.shear.w,S.shear.w*.4,Math.abs(SH.at(x,z).a));
  return{land,water,TER,prof,APRON,ACIDG:()=>0,SHEAR,SH,mull,farBase:S.base-200,
   spine:S.springs.map(s=>[s.x,s.z]).concat([[S.flames.x,S.flames.z],[0,0]])};}
 throw new Error('no station '+SKEY);})();
function landH(x,z){return L.land(x,z);}
function floor0(x){return L.farBase;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=L.land(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return L.water(x,z);}
// THE CHEMISTRY OF THE GROUND (PLAN.md 3.5): the pH every plant asks ARCH.lifeAt for; the water's own where it is wet
const PH_AT=(x,z)=>{const ap=L.APRON(x,z),ac=L.ACIDG(x,z);let p=5.8;p=mix(p,10.6,smooth(.3,.7,ap));p=mix(p,2.8,smooth(.3,.7,ac));return p;};
const CAMG_AT=(x,z)=>.08;   /* the laterite over serpentinite: Ca:Mg ~.08 everywhere on this page (PLAN.md 3.3) */
const SOIL_AT=(x,z)=>({ni:3200+1400*n2(x,z,.002,31),pH:PH_AT(x,z),caMg:CAMG_AT(x,z),n:.15,p:.12});

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   wet     the water's margins, the seeps under the terraces; the bench damper than the dome
//   rock    the steeps: the fault's face, the mullions' flanks, the cleft
//   geo     the heat's share, 0..1 (48-host-therm.js fills HEAT_AT from KTHERM)
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),wd=w>-1e8?0:1;let near=0;
 for(let k=0;k<8&&wd;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*25,z+Math.sin(a)*25)>-1e8){near=Math.max(near,.85);break;}}
 for(let k=0;k<8&&wd&&near<.8;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*80,z+Math.sin(a)*80)>-1e8){near=Math.max(near,.45);break;}}
 const u=ARCH.uOf(x,z),rock=clamp(Math.max(smooth(.42,.75,slope),smooth(.3,.55,slope)*.45),0,1);
 const wet=clamp(.35+.55*near+.15*smooth(0,600,u)-.25*rock+.08*n2(x,z,.002,131),0,1);
 return{wet,flow:0,upland:smooth(200,-600,u),canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:0,geo:0,barren:0,fog:0,mist:0,flat:0};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat'];
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
/* the heat: 48-host-therm.js sets HEAT_AT from KTHERM's bake; until then the soil's */
let HEAT_AT=(x,z)=>SITE.soil;
FIELD.geo=(x,z)=>clamp((HEAT_AT(x,z)-SITE.soil)/60,0,1);

// ---------------------------------------------------------------- the host binding
// nothing roots in the water
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;return d<.7?(d-.15)/.55:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
BIO.init({tags:'arch',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:SITE.seed==null?1:SITE.seed,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:WBOX}});
BIO.setSun([-600,1300,-700]);
