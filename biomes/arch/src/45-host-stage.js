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

 if(SKEY==='barrens'){const LV=S.lavaka.map(k=>{const F=segFrame([k.x,k.z],[k.x+k.dir[0]*k.len,k.z+k.dir[1]*k.len]);return Object.assign({F},k);});
  const base=(x,z)=>S.base-S.slope*ARCH.uOf(x,z)+6*n2(x,z,.0008,51)+2.2*n2(x,z,.004,52);
  // a lavaka's cut, 0..1: the amphitheatre round its head and the gully down its mouth; its floor reaches the mottled zone and the garnierite
  const cut=(x,z,k)=>{const q=k.F.at(x,z),hw=k.r*(1-.6*clamp(q.s/k.len,0,1));if(q.s<-k.r*1.2||q.s>k.len+40)return 0;
   const d=q.s<0?Math.hypot(q.s,q.a):Math.abs(q.a);return smooth(hw,hw*.45,d)*smooth(k.len+40,k.len*.6,q.s);};
  function land(x,z){let h=base(x,z);for(const k of LV){const c=cut(x,z,k);if(c>0){const q=k.F.at(x,z);h-=k.depth*c*(1-.5*clamp(q.s/k.len,0,1))+1.5*c*n2(x,z,.03,53);}}return h;}
  function water(x,z){return -1e9;}
  const RIM=(x,z)=>{let a=0;for(const k of LV){const c=cut(x,z,k);a=Math.max(a,c*(1-c)*4);}return clamp(a,0,1);};   /* the lavaka's walls and rims: the garnierite shows */
  const SEEP=(x,z)=>{let a=0;for(const k of LV)a=Math.max(a,smooth(k.r*.9,k.r*.25,Math.hypot(x-k.x,z-k.z))*.9+smooth(k.r*.5,0,Math.abs(k.F.at(x,z).a))*smooth(-10,40,k.F.at(x,z).s)*smooth(k.len,k.len*.3,k.F.at(x,z).s)*.6);return clamp(a,0,1);};
  const FLOOR=(x,z)=>{let a=0;for(const k of LV)a=Math.max(a,cut(x,z,k));return a;};
  return{land,water,LV,RIM,SEEP,FLOOR,APRON:()=>0,ACIDG:()=>0,NI:(x,z)=>2600+2400*RIM(x,z)+1200*FLOOR(x,z)+700*n2(x,z,.002,54),farBase:S.base-60,
   spine:LV.map(k=>[k.x,k.z]).concat([[0,0]])};}

 if(SKEY==='sound'){const AX=S.axis,AL=(x,z)=>x*AX[0]+z*AX[1],WW=(x,z)=>-x*AX[1]+z*AX[0],XZ=(al,w)=>[al*AX[0]-w*AX[1],al*AX[1]+w*AX[0]];
  const EP=ARCH.episode(S.segment,S.year),AGE=EP.since;
  const floorP=w=>w<0?S.base+.004*(-w):w<1300?lerp(S.base,1.0,w/1300):w<S.shoreW+50?lerp(1.0,-.5,(w-1300)/(S.shoreW+50-1300)):-.5-5.5*smooth(S.shoreW+50,S.shoreW+900,w);
  const front=al=>S.flow.front+S.flow.amp*Math.sin(al*.0021+.7)+.45*S.flow.amp*Math.sin(al*.0063+2.1);
  // inside the last flow: 0..1 (the lobes' soft edge), its thickness 2.5-5 m with a steep front
  const inFlow=(al,w)=>{if(al<S.flow.al[0]-200||al>S.flow.al[1]+200)return 0;const f=front(al),e=Math.min(al-S.flow.al[0],S.flow.al[1]-al);
   return smooth(-60,20,e)*smooth(f+25,f-15,w)*smooth(S.fissure.w-60,S.fissure.w-20,w);};
  // rootless cones: where the flow covered the wet flats (w over 700), seeded per slot along the axis
  const CONES=[];for(let i=0;i<16;i++){const u=KRAND.unit(KRAND.hash(S.seed,i,61)),v=KRAND.unit(KRAND.hash(S.seed,i,62)),al=lerp(S.flow.al[0]+150,S.flow.al[1]-150,(i+u)/16),
   w=lerp(700,front(al)-60,v);if(w<720)continue;CONES.push({al,w,r:15+25*KRAND.unit(KRAND.hash(S.seed,i,63)),h:5+7*KRAND.unit(KRAND.hash(S.seed,i,64))});}
  CONES.forEach(c=>{const p=XZ(c.al,c.w);c.x=p[0];c.z=p[1];});
  const STACKS=[];for(let i=0;i<S.stacks.n;i++){const a=lerp(S.stacks.al[0],S.stacks.al[1],KRAND.unit(KRAND.hash(S.seed,i,71))),w=lerp(S.stacks.w[0],S.stacks.w[1],KRAND.unit(KRAND.hash(S.seed,i,72))),p=XZ(a,w);
   STACKS.push({x:p[0],z:p[1],r:2+4*KRAND.unit(KRAND.hash(S.seed,i,73)),h:6+12*KRAND.unit(KRAND.hash(S.seed,i,74))});}
  const GJ=S.gjar.map(g=>{const a=XZ(g.al-g.len/2,g.w),b=XZ(g.al+g.len/2,g.w);return Object.assign({F:segFrame(a,b)},g);});
  const H0=S.hollow,HP=XZ(H0.al,H0.w);
  function land(x,z){const al=AL(x,z),w=WW(x,z);let h=floorP(w)+.6*n2(x,z,.003,71)*smooth(S.shoreW+300,S.shoreW-100,w)+.25*n2(x,z,.02,72);
   // the eruptive fissure: an open slot with spatter ramparts either side, in segments
   {const dw=Math.abs(w-S.fissure.w);if(al>S.fissure.al[0]&&al<S.fissure.al[1]){const seg=.5+.5*Math.sin(al*.011)*Math.sin(al*.0037+1);
     h+=(3+5*seg)*smooth(18,6,dw)*smooth(2,4,dw)+1.2*n2(x,z,.05,73)*smooth(20,4,dw);if(dw<2.2)h=floorP(w)-9;}}
   // the flow: 2.5-5 m of fresh basalt, ropy and blocky
   {const f=inFlow(al,w);if(f>0)h+=f*(2.5+2.5*smooth(-.3,.6,n2(x,z,.004,74)))+f*.6*n2(x,z,.03,75);}
   // the rootless cones: a ring of spatter with a crater
   for(const c of CONES){const d=Math.hypot(x-c.x,z-c.z);if(d<c.r*1.6)h+=c.h*smooth(c.r*1.6,c.r*.55,d)-c.h*.9*smooth(c.r*.5,c.r*.15,d);}
   // the gjar: open fissures, steep-walled, their floors well under the water table
   for(const g of GJ){const q=g.F.at(x,z);if(q.s>-10&&q.s<g.F.L+10){const hw=g.wd/2*smooth(-10,40,q.s)*smooth(g.F.L+10,g.F.L-40,q.s);if(Math.abs(q.a)<hw)h=-12+2*n2(x,z,.05,76);else h+=.8*smooth(hw+8,hw,Math.abs(q.a));}}
   // the gas hollow
   {const d=Math.hypot(x-HP[0],z-HP[1]);h-=H0.depth*smooth(H0.r,H0.r*.2,d);}
   return h;}
  function water(x,z){const w=WW(x,z);if(w>S.shoreW-300&&land(x,z)<0)return 0;for(const g of GJ){const q=g.F.at(x,z);if(q.s>0&&q.s<g.F.L&&Math.abs(q.a)<g.wd/2)return .5;}return -1e9;}
  const LAVA=(x,z)=>inFlow(AL(x,z),WW(x,z))>.4||Math.abs(WW(x,z)-S.fissure.w)<20&&AL(x,z)>S.fissure.al[0]&&AL(x,z)<S.fissure.al[1]?AGE:null;
  const MUD=(x,z)=>{const h=land(x,z);return LAVA(x,z)==null&&h>-.4&&h<1.3?1:0;};
  return{land,water,AX,AL,WW,XZ,EP,AGE,CONES,STACKS,GJ,HP,LAVA,MUD,APRON:()=>0,ACIDG:()=>0,farBase:-6,
   spine:[[0,0]].concat(CONES.slice(0,4).map(c=>[c.x,c.z])).concat(GJ.map(g=>g.F.p(g.F.L/2,0)))};}

 if(SKEY==='coast'){const SH=S.shore,WW=(x,z)=>x*SH[0]+z*SH[1],XZ=(al,w)=>[-al*SH[1]+w*SH[0],al*SH[0]+w*SH[1]];
  const AL2=(x,z)=>-x*SH[1]+z*SH[0];
  const C=S.cone,CP=XZ(C.al,C.w),P=S.platform;
  const beachP=w=>w<-250?lerp(6,3.5,smooth(-900,-250,w)):w<0?lerp(3.5,-.2,(w+250)/250):-.2-24*smooth(0,700,w)-8*smooth(700,2600,w);
  const inPlat=(al,w)=>smooth(P.al[0]-80,P.al[0],al)*smooth(P.al[1]+80,P.al[1],al)*smooth(P.w[0]-40,P.w[0],w)*smooth(P.w[1]+60,P.w[1],w);
  function land(x,z){const al=AL2(x,z),w=WW(x,z);let h=beachP(w)+.8*n2(x,z,.003,81)*smooth(0,-300,w);
   // the dunes behind the beach: low ridges along the shore
   h+=2.2*smooth(-420,-300,w)*smooth(-120,-200,w)*(.6+.4*Math.sin(al*.013+n2(x,z,.004,82)*3));
   // the tuff cone: a broad ring with a dry crater, its outer flank to the dunes
   {const d=Math.hypot(x-CP[0],z-CP[1]);const ring=C.rim*Math.exp(-Math.pow((d-C.r)/(C.r*.55),2));h=Math.max(h,beachP(w)+ring*(d<C.r?(.45+.55*smooth(C.crater*.6,C.r,d)):1))+2.5*n2(x,z,.01,83)*smooth(C.r*2,C.r*.5,d);}
   // the pillow platform: a rocky shelf at the tide line, lumpy with pillows, cut by tide pools
   {const f=inPlat(al,w);if(f>0){const pil=.45*Math.sin(x*.21+Math.sin(z*.17)*2)*Math.sin(z*.23+Math.sin(x*.19)*2),pool=smooth(.25,.45,n2(x,z,.02,84));h=mix(h,.6+pil-1.4*pool,f);}}
   return h;}
  function water(x,z){const w=WW(x,z);if(w>-120&&land(x,z)<0)return 0;return -1e9;}
  const SAND=(x,z)=>{const w=WW(x,z),h=land(x,z);return smooth(-520,-380,w)*smooth(1.5,-.5,inPlat(AL2(x,z),w)*2)*(h<7?1:smooth(12,7,h));};
  const PLAT=(x,z)=>inPlat(AL2(x,z),WW(x,z));
  const TUFF=(x,z)=>smooth(C.r*1.9,C.r*1.3,Math.hypot(x-CP[0],z-CP[1]));
  const WARM=S.warm.map(v=>{const p=XZ(v.al,v.w);return{x:p[0],z:p[1],r:v.r,T:v.T};});
  return{land,water,XZ,AL:AL2,WW,CP,SAND,PLAT,TUFF,WARM,STRAND:(x,z)=>{const w=WW(x,z);return smooth(-1100,-700,w)*smooth(-60,-180,w);},APRON:()=>0,ACIDG:()=>0,farBase:-20,
   spine:[[0,0],CP,XZ((P.al[0]+P.al[1])/2,100)].concat(WARM.map(v=>[v.x,v.z]))};}
 throw new Error('no station '+SKEY);})();
function landH(x,z){return L.land(x,z);}
function floor0(x){return L.farBase;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=L.land(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return L.water(x,z);}
// THE CHEMISTRY OF THE GROUND (PLAN.md 3.5): the pH every plant asks ARCH.lifeAt for; the water's own where it is wet
const PH_AT=(x,z)=>{const ap=L.APRON(x,z),ac=L.ACIDG(x,z);let p=L.LAVA&&L.LAVA(x,z)!=null?6.6:L.MUD&&L.MUD(x,z)?7.2:5.8;p=mix(p,10.6,smooth(.3,.7,ap));p=mix(p,2.8,smooth(.3,.7,ac));return p;};
const CAMG_AT=(x,z)=>L.LAVA&&L.LAVA(x,z)!=null?1.2:L.MUD&&L.MUD(x,z)?.6:L.TUFF?.9:.08;   /* basalt and the sound's mud are not serpentine ground */
const LAVA_AT=(x,z)=>L.LAVA?L.LAVA(x,z):null;   /* the age of the flow under a point (years), or null: ARCH.lifeAt's lavaAge */   /* the laterite over serpentinite: Ca:Mg ~.08 everywhere on this page (PLAN.md 3.3) */
const SOIL_AT=(x,z)=>({ni:L.NI?L.NI(x,z):3200+1400*n2(x,z,.002,31),pH:PH_AT(x,z),caMg:CAMG_AT(x,z),n:.15,p:.12});

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   wet     the water's margins, the seeps under the terraces; the bench damper than the dome
//   rock    the steeps: the fault's face, the mullions' flanks, the cleft
//   geo     the heat's share, 0..1 (48-host-therm.js fills HEAT_AT from KTHERM)
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),wd=w>-1e8?0:1;let near=0;
 for(let k=0;k<8&&wd;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*25,z+Math.sin(a)*25)>-1e8){near=Math.max(near,.85);break;}}
 for(let k=0;k<8&&wd&&near<.8;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*80,z+Math.sin(a)*80)>-1e8){near=Math.max(near,.45);break;}}
 const u=ARCH.uOf(x,z),rock=clamp(Math.max(smooth(.42,.75,slope),smooth(.3,.55,slope)*.45),0,1);
 const wet=clamp(.35+.55*near+.15*smooth(0,600,u)-.25*rock+.08*n2(x,z,.002,131)+(L.SEEP?.6*L.SEEP(x,z)-(SITE.koppen==='Aw'?.15:0):0),0,1);
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
