// ================================================================= HOST — stage: the High Rift's five stations (PLAN.md sections 1 and 4; 2026-11-03)
// The ideal-type host for one zone of the High Rift: the renderer, the light, the land of the station's zone drawn from its site record (40: HRIFT_SITES),
// the climate fields, the analytic water levels and the biome core's binding. Started from biomes/oidong's passes station (the same shape of page).
// A station's folder sets STATION_KEY (stations/<name>/44z-host-site.js); the default page is zone 1, the Caldron.
//   cataract  the Caldron Pool in its sinter bowl; the Opaline Cataract in four tiers down a gorge from the north-east; Brant-Fell Gill from the south-east;
//             the outlet's rimstone terraces on a built sinter ridge south-west to the staircase's next step (the page's edge)
//   mirror    Lake Verdigris filling the south; fans rising north to the master fault's mirror (240 m, ~58 degrees), the bedded rift fill above it
//   wedge     the horst's whaleback crest along x, falling north and south to the two grabens (the far field carries them down)
//   coulee    old coulee lobes with steep fronts and ogive ridges; Brant-Fell Gill's scoured channel west through the middle; the Outer Wall rising south
//   gjar      a plateau with the master gja striking NNW-SSE through the centre and the swarm of narrow tension fissures en echelon beside it
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
const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'cataract',SITE=HRIFT_SITES[SKEY];
const STATION_REGION=SITE.name+' (High Rift, zone '+SITE.zone+'; ideal type)';

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: 0.95-1.16 atm, dry: a deep blue sky and a hard sun; the steam makes its own haze (89b)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8dee6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00009);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xcadcf0,0xa8a49c,.74));
const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-1000,1100,-500);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe0e4f0,.18);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
const SNOW_LINE=SITE.snow;
// a segment's frame: s metres along from a, signed a across (+ to the right going a -> b), L its length
function segFrame(A,B){const dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;return{A,B,L,ux,uz,at:(x,z)=>{const px=x-A[0],pz=z-A[1];return{s:px*ux+pz*uz,a:px*uz-pz*ux};}};}
const n2=(x,z,f,seed)=>fbm(x*f,z*f,seed,2)-.5;
// the far country's walls (the far field carries them; the square takes their first rise): the Outer Wall south, the walls north
const dflt=(v,d)=>v==null?d:v;
function walls(x,z,k){return (k.S?k.S*smooth(dflt(k.s0,2600),dflt(k.s1,12000),z):0)+(k.N?k.N*smooth(-dflt(k.n0,2600),-dflt(k.n1,12000),z):0)+(k.E?k.E*smooth(dflt(k.e0,2600),dflt(k.e1,12000),x):0);}
const L=(function(){const S=SITE;
 if(SKEY==='cataract'){const P=S.pool,C=segFrame(S.cataract.from,S.cataract.to),O=segFrame(S.outlet.from,S.outlet.to),G=segFrame(S.gill.from,S.gill.to);
  const T=S.cataract.tiers,fr=[[0,.28],[.30,.52],[.54,.74],[.76,.93]];   /* the four treads' spans along the gorge (fractions of its length); risers between */
  const catLevel=s=>{const u=s/C.L;if(u<=fr[0][1])return T[0];for(let i=1;i<4;i++){if(u<fr[i][0]){const t=(u-fr[i-1][1])/(fr[i][0]-fr[i-1][1]);return lerp(T[i-1],T[i],smooth(0,1,t));}if(u<=fr[i][1])return T[i];}
   return lerp(T[3],P.level-2,smooth(fr[3][1],1.04,u));};
  const OL=S.outlet.levels,ON=OL.length,ORS=3,OLEN=(O.L-(ON-1)*ORS)/ON;   /* WATER.terraces' own layout of equal treads (53: levels, riser) */
  const outLevel=s=>{s=clamp(s,0,O.L-1e-6);const i=Math.min(ON-1,Math.floor(s/(OLEN+ORS))),r=s-i*(OLEN+ORS);return r<=OLEN||i===ON-1?OL[i]:lerp(OL[i],OL[i+1],(r-OLEN)/ORS);};
  const gillBed=s=>lerp(S.gill.y0,S.gill.y1,clamp(s/G.L,0,1));
  function land(x,z){
   let h=2584+12*n2(x,z,.0016,11)+3*n2(x,z,.012,12);
   h+=430*smooth(-200,1700,(x-z)*.707)+90*smooth(600,1900,(x-z)*.707)*n2(x,z,.004,13);   /* the Outer Wall's spur: north-east, the pinch the cataract comes out of */
   h-=95*smooth(500,2700,(z-x)*.707);   /* the staircase's next step: south-west, the page's edge */
   h+=walls(x,z,{S:4200,s0:2400,s1:12000,N:3200,n0:3000,n1:13000});
   // the Gill's valley from the south-east
   {const q=G.at(x,z);if(q.s>-200&&q.s<G.L+120){const b=gillBed(q.s)-1.6,aa=Math.abs(q.a+14*Math.sin(q.s*.006));h=mix(Math.min(h,b+.2),h,smooth(9,60+120*smooth(0,G.L,G.L-q.s),aa)*1)+0;
     if(aa<9)h=b+.25*(aa/9);}}
   // the pool's sinter bowl: the bed under the water, a pale shelf a hand over the level round it, blending to the land
   {const d=Math.hypot(x-P.x,z-P.z);if(d<P.r)h=P.level-P.depth*(1-Math.pow(d/P.r,1.6))-.4;
    else h=mix(P.level+.5+(d-P.r)*.03+.4*n2(x,z,.05,14),h,smooth(P.r+40,P.r+420,d));}
   // the gorge: the cataract's treads, risers and walls (the water two metres deep on each tread)
   {const q=C.at(x,z),aa=Math.abs(q.a+8*Math.sin(q.s*.01));if(q.s>-300&&q.s<C.L*1.04){const wl=catLevel(Math.max(0,q.s)),bed=wl-2-1.2*smooth(14,0,aa);
     const g=bed+2.2*smooth(14,22,aa)+230*smooth(24,300,aa)+70*smooth(300,800,aa)+8*n2(x,z,.03,15)*smooth(24,80,aa);
     const w=smooth(-300,0,q.s)*smooth(C.L*1.06,C.L*.97,q.s)*smooth(900,450,aa);h=mix(h,Math.max(Math.min(g,h+260),aa<24?bed:-1e9),w);if(aa<16&&w>.5)h=bed;}}
   // the outlet's rimstone terraces on their built sinter ridge
   {const q=O.at(x,z),aa=Math.abs(q.a);if(q.s>-40&&q.s<O.L+60){const lv=outLevel(q.s),ridge=lv+1.6*smooth(150,24,aa)-.2;
     const w=smooth(-40,10,q.s)*smooth(O.L+60,O.L,q.s);h=mix(h,Math.max(h,ridge),w*smooth(260,140,aa));if(aa<22&&w>.5)h=lv-.8;}}
   // the geyser's cone and the small vents' mounds
   {const g=S.geyser,d=Math.hypot(x-g.x,z-g.z);h+=5*smooth(45,4,d)-1.2*smooth(4,0,d);}
   return h;}
  function water(x,z){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r+4)return P.level;
   {const q=C.at(x,z);if(q.s>=0&&q.s<C.L*.93&&Math.abs(q.a+8*Math.sin(q.s*.01))<15)return catLevel(q.s);}
   {const q=O.at(x,z);if(q.s>=0&&q.s<O.L&&Math.abs(q.a)<20)return outLevel(q.s);}
   {const q=G.at(x,z);if(q.s>=0&&q.s<G.L&&Math.abs(q.a+14*Math.sin(q.s*.006))<8)return gillBed(q.s)-1.6+.6;}
   return -1e9;}
  return{land,water,C,O,G,catLevel,outLevel,gillBed,farBase:2560,spine:[[P.x,P.z],[C.B[0],C.B[1]],[C.A[0],C.A[1]],[O.A[0],O.A[1]],[O.B[0],O.B[1]],[S.geyser.x,S.geyser.z],[G.A[0],G.A[1]]]};}
 if(SKEY==='mirror'){const K=S.lake,F=S.fault;
  const shoreZ=x=>K.shore+60*Math.sin(x*.0013+.7)+25*Math.sin(x*.0047+2.1);
  const faultZ=x=>F.z+70*Math.sin(x*.0009+1.3)+20*Math.sin(x*.004);
  function land(x,z){const sz=shoreZ(x),fz=faultZ(x);let h;
   if(z>sz){h=K.level-K.depth*smooth(0,700,z-sz)-1.2*smooth(0,30,z-sz)+.5;}
   else{const u=sz-z;h=K.level+.8+u*.085+9*n2(x,z,.003,21)*smooth(0,300,u)+2*n2(x,z,.02,22);
    /* the fans: low cones spilling from the fault's gullies */h+=14*smooth(.55,.85,.5+.5*Math.sin(x*.004+1))*smooth(0,400,u)*smooth(fz-900,fz-200,z-0)*0;
    // the fault mirror: a planar face F.h high at ~58 degrees, its foot in talus, the bedded fill above it rising north
    const above=z<fz?1:0,fd=fz-z;const step=F.h*smooth(0,F.h/F.dip,fd+F.h/F.dip/2)+12*smooth(-60,0,fd)*smooth(40,0,fd);   /* the talus apron at the foot */
    h+=step+(above?(F.above-K.level-F.h-(sz-fz)*.085)*smooth(0,1400,fd)+20*n2(x,z,.004,23)*smooth(0,200,fd):0);}
   for(const s of S.springs){const d=Math.hypot(x-s[0],z-s[1]);if(d<s[2]*1.6)h=mix(K.level-.9,h,smooth(s[2]*.8,s[2]*1.6,d));}
   {const g=S.geyser,d=Math.hypot(x-g.x,z-g.z);h+=4*smooth(40,4,d)-1*smooth(4,0,d);}
   h+=walls(x,z,{N:3400,n0:2700,n1:14000,S:2200,s0:7000,s1:16000});
   return h;}
  function water(x,z){if(z>shoreZ(x)-2)return K.level;for(const s of S.springs)if(Math.hypot(x-s[0],z-s[1])<s[2]*.95)return K.level+.6;return -1e9;}
  return{land,water,shoreZ,faultZ,farBase:2860,spine:[[0,shoreZ(0)],[0,faultZ(0)],[-1500,faultZ(-1500)+300],[1500,faultZ(1500)+300],[S.geyser.x,S.geyser.z],[S.patch.x,S.patch.z],[-1200,shoreZ(-1200)],[1300,shoreZ(1300)]]};}
 if(SKEY==='wedge'){const TOR=S.tors.map(t=>({x:t[0],z:t[1],r:t[2],h:t[3]})),HOL=S.hollows.map(h=>({x:h[0],z:h[1],r:h[2]})),TN={x:S.tarn[0],z:S.tarn[1],r:S.tarn[2]};
  function land0(x,z){const az=Math.abs(z+80*Math.sin(x*.0007));let h=S.base+30*n2(x,z,.0008,31)+7*n2(x,z,.004,32)-60*Math.pow(az/1500,2);
   h-=(S.base-S.north-120)*smooth(1300,4800,-z)*1+(S.base-S.south-110)*smooth(1300,4800,z)*1;
   h+=20*smooth(1300,2600,az)*n2(x,z,.006,33);   /* the flanks' gullies */
   for(const K of TOR){const d=Math.hypot(x-K.x,z-K.z)/(K.r*(1+.15*n2(x,z,.004,34)));if(d<1.6)h+=K.h*Math.pow(smooth(1.5,0,d),1.6)+6*smooth(1.4,.3,d)*n2(x,z,.03,35);}
   for(const H of HOL){const d=Math.hypot(x-H.x,z-H.z)/H.r;if(d<1.3)h-=4*smooth(1.25,.2,d);}
   h+=walls(x,z,{N:6000,n0:9000,n1:16000,S:7000,s0:8000,s1:16000});
   return h;}
  let tl=1e9;for(let k=0;k<24;k++){const a=k/24*TAU;tl=Math.min(tl,land0(TN.x+Math.cos(a)*TN.r*1.12,TN.z+Math.sin(a)*TN.r*1.12));}
  function land(x,z){let h=land0(x,z);const d=Math.hypot(x-TN.x,z-TN.z);if(d<TN.r*1.6)h=Math.min(h,mix(tl-3.2,h,smooth(TN.r*.3,TN.r*1.5,d)));return h;}
  TN.l=tl-.3;
  function water(x,z){return Math.hypot(x-TN.x,z-TN.z)<TN.r*1.45&&land(x,z)<TN.l?TN.l:-1e9;}
  return{land,water,TOR,HOL,TN,farBase:3400,spine:[[0,0],[-1600,0],[1600,0],[TN.x,TN.z]].concat(TOR.map(t=>[t.x,t.z]))};}
 if(SKEY==='coulee'){const Gc=S.gill,LB=S.lobes.map(l=>({x:l[0],z:l[1],r:l[2],h:l[3]}));
  const gz=x=>Gc.z+90*Math.sin(x*.0011+.4)+30*Math.sin(x*.004);
  const bedY=x=>lerp(Gc.y1,Gc.y0,clamp((x+2600)/5200,0,1));
  function land(x,z){const g=gz(x),ga=Math.abs(z-g),half=Gc.w/2;
   let h=bedY(x)-Gc.bed+3*n2(x,z,.002,41);   /* the channel's floor: cobble, bars and scour holes over the bed */
   h+=1.6*smooth(.45,.8,fbm(x*.012,z*.03,42,2))-1.2*smooth(.62,.8,fbm(x*.02+3,z*.02,43,2));
   const bank=smooth(half-40,half+30,ga);   /* the channel's walls: the coulee's cut faces, 14 m */
   let top=bedY(x)+4*n2(x,z,.002,44);
   for(const K of LB){const d=Math.hypot(x-K.x,z-K.z)/(K.r*(1+.22*n2(x,z,.003,45+K.x)));if(d<1.25){const lobe=K.h*smooth(1.08,.94,d);top+=lobe+3.5*Math.sin(d*K.r*.06)*smooth(1,.3,d)+2.5*n2(x,z,.03,46)*smooth(1.05,.9,d);}}
   top+=8*smooth(0,1,1-ga/1800)*0+2*n2(x,z,.02,47);
   h=mix(h,top,bank);
   h+=walls(x,z,{S:S.wall.h,s0:S.wall.z,s1:9000,N:900,n0:2600,n1:6000});   /* the Outer Wall south; the horst's foot north */
   {const sa=Math.abs(z-g-14*Math.sin(x*.013));if(sa<Gc.flow/2+6)h=Math.min(h,mix(bedY(x)-Gc.bed+.3,h,smooth(Gc.flow/2-2,Gc.flow/2+6,sa)));}   /* the stream's own bed in the cobble */
   for(const v of S.vents){const d=Math.hypot(x-v.x,z-v.z);if(v===S.vents[0])h+=4*smooth(40,4,d)-1*smooth(4,0,d);}
   return h;}
  function water(x,z){const g=gz(x),a=z-g-14*Math.sin(x*.013);if(Math.abs(a)<Gc.flow/2)return bedY(x)-Gc.bed+.9;return -1e9;}
  return{land,water,gz,bedY,LB,farBase:3200,spine:[[0,gz(0)],[-1800,gz(-1800)],[1800,gz(1800)],[S.geyser.x,S.geyser.z]].concat(LB.map(l=>[l.x,l.z]))};}
 if(SKEY==='gjar'){const st=S.strike,M=S.master,SW=S.swarm.map(f=>({x:f[0],z:f[1],len:f[2],w:Math.max(10,f[3]),d:f[4]}));
  const along=(x,z)=>x*st[0]+z*st[1],across=(x,z)=>x*st[1]-z*st[0];
  const mOff=l=>M.off+60*Math.sin(l*.0012+.5)+20*Math.sin(l*.005),mHalf=l=>M.w/2+50*Math.sin(l*.0017+2)+15*Math.sin(l*.009);
  function plateau(x,z){return S.base+.0035*x+20*n2(x,z,.0012,51)+5*n2(x,z,.008,52)+walls(x,z,{S:5000,s0:9000,s1:16000,N:3500,n0:9000,n1:16000});}
  function land(x,z){let h=plateau(x,z);const l=along(x,z),a=across(x,z)-mOff(l),hw=mHalf(l),aa=Math.abs(a);
   // the master gja: walls in two benches (blocks dropped from the lips), a floor of dropped blocks, its lowest part holding the water
   if(aa<hw+30){const floor=M.floor+18*smooth(.45,.8,fbm(x*.01,z*.01,53,2))+10*smooth(120,hw,aa)-4*smooth(60,0,aa)+.004*l;
    const bench=mix(floor+120,floor+210,smooth(.4,.6,fbm(l*.003,a>0?1:3,54,2)));
    const wall=aa<hw-110?floor:aa<hw-70?mix(floor,bench,smooth(hw-110,hw-70,aa)):aa<hw-40?bench:mix(bench,h,smooth(hw-40,hw,aa));
    h=Math.min(h,mix(wall,h,smooth(hw-2,hw+30,aa)));}
   // the swarm: narrow tension fissures, near-vertical walls, flat bottoms of fallen blocks, tapered at their tips
   for(const F of SW){const lx=x-F.x,lz=z-F.z,fl=lx*st[0]+lz*st[1],fa=lx*st[1]-lz*st[0]+6*Math.sin(fl*.02);if(Math.abs(fl)>F.len/2+20||Math.abs(fa)>F.w)continue;
    const tip=smooth(F.len/2+10,F.len/2-120,Math.abs(fl)),hw2=F.w/2*tip;if(hw2<1)continue;const k=smooth(hw2+2,hw2-1,Math.abs(fa));
    h=Math.min(h,h-F.d*k*tip*(.85+.15*n2(x,z,.05,55+F.x)));}
   {const g=S.geyser,d=Math.hypot(x-g.x,z-g.z);h+=4*smooth(40,4,d)-1*smooth(4,0,d);}
   return h;}
  const POOL=M.pool;
  function water(x,z){const l=along(x,z),a=across(x,z)-mOff(l);if(Math.abs(a)<mHalf(l)-60&&land(x,z)<POOL)return POOL;return -1e9;}
  return{land,water,along,across,mOff,mHalf,SW,plateau,farBase:3600,spine:[[0,0],[S.geyser.x,S.geyser.z]].concat(SW.map(f=>[f.x,f.z])).concat([-1800,-900,900,1800].map(l=>[st[0]*l+st[1]*mOff(l),st[1]*l-st[0]*mOff(l)]))};}
 throw new Error('no station '+SKEY);})();
function landH(x,z){return L.land(x,z);}
function floor0(x){return L.farBase;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=L.land(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return L.water(x,z);}

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   cold    the cold, 0..1 by height over the station's own snow line
//   wet     the water's margins, the spray (the cataract), the lake's shore, the fissures' floors (still, damp air); the rest of the tundra dry
//   rock    the steeps: the gorge's and the gja's walls, the fault mirror, the tors, the lobes' fronts
//   flat    the frost hollows' floors (the wedge's patterned ground)
//   geo     the vents' heat share, 0..1 (88-host-vents.js fills it from KTHERM: 0 until then)
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),wd=w>-1e8?0:1;let near=0;
 for(let k=0;k<8&&wd;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*30,z+Math.sin(a)*30)>-1e8){near=Math.max(near,.8);break;}}
 for(let k=0;k<8&&wd&&near<.8;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*90,z+Math.sin(a)*90)>-1e8){near=Math.max(near,.45);break;}}
 let spray=0;if(SKEY==='cataract'){const q=L.C.at(x,z);spray=smooth(260,40,Math.abs(q.a))*smooth(-100,100,q.s)*smooth(L.C.L*1.15,L.C.L*.9,q.s);}
 let flat=0;if(SKEY==='wedge')for(const H of L.HOL)flat=Math.max(flat,smooth(1.1,.3,Math.hypot(x-H.x,z-H.z)/H.r));
 let slot=0;if(SKEY==='gjar'){const l=L.along(x,z),a=Math.abs(L.across(x,z)-L.mOff(l));slot=smooth(L.mHalf(l)-60,L.mHalf(l)-160,a);}
 const rock=clamp(Math.max(smooth(.5,.82,slope),smooth(.35,.6,slope)*.45),0,1);
 const wet=clamp(.18+.6*near+.5*spray+.35*slot+(SKEY==='mirror'?.12:0)-.2*rock+.06*n2(x,z,.002,131),0,1);
 return{wet,flow:0,upland:1,canyon:slot,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:clamp(.5+(h-SITE.snow[0])/1400+(SITE.temp.mean<3?.25:0),0,1),geo:0,barren:0,fog:0,mist:spray,flat:flat*(1-rock)};}
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
/* the heat: 88-host-vents.js sets HEAT_AT from KTHERM's bake; until then the soil's */
let HEAT_AT=(x,z)=>SITE.soil;
FIELD.geo=(x,z)=>clamp((HEAT_AT(x,z)-SITE.soil)/60,0,1);

// ---------------------------------------------------------------- the host binding
// nothing roots in the water; the fissures' and the gja's walls are left to the rock (the cliff gate)
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;return d<.7?(d-.15)/.55:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
BIO.init({tags:'highrift',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:100+SITE.zone,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:WBOX}});
BIO.setSun([-1000,1100,-500]);
