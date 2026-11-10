// ================================================================= HOST â€” stage (n semiarid, STATION 2: the high country; replaces src/45b-host-stage.js)
// PLAN-STATIONS.md station 2: the dry-summer montane round the region's southern and western edges, over 3 km, about 1 atm, ~410 mm, the one
// place in the north basin where Earth's plant sizes hold. Earth basis: the eastern Sierra Nevada and the Great Basin ranges, the Elburz's dry
// side, the Tian Shan's outer ranges.
// THE SITE (scale model 5.1, read 2026-11-09 from tools/scale-model/model/data: c.png the classes, h.png the heights, kits/resources' geology bake):
// px 848,564, ~3.7 km, the region's densest mix of the four classes the plan names in one 30 km window: Dsb (the park) with Dfb on the higher,
// wetter ground to the south and west, BSk on the leeward bench to the east (2.9-3.2 km), Csa and Csb below to the north-west. The province is
// SEDIMENTARY, so the plan's granite domes and slabs are drawn as SANDSTONE domes and slabs (nhighlands' station 2 made the same call on the
// same geology; the owner's to confirm). Ardent (px 851,572) stands about 16 km south: not on this map.
// THE MAP (x east, z south, north is -z; origin mid-flank, R 3400), true heights:
//   the FLANK         rising south and west, ~3,150 m at the NE corner to ~3,950 m at the SW, ribbed by east-west spurs: each rib has a sunny
//                     north face and a shaded south face (Krator is near 40 S: the shaded faces face south and hold the snow)
//   the BENCH         the cool steppe (BSk) on the leeward side, NE, ~3,240 m: the walking steppe's highest form
//   the OAK SCRUB     Csb, the low sunny slopes above the bench and in the north, under the conifers
//   the PARK          Dsb, the open pine and juniper park over bunchgrass and sagebrush; trees in clumps on the shaded faces
//   the DRAWS         Dfb's wetter fringe, the troughs between the ribs (south and west most): fir and aspen groves, a few red giants
//   the STEP          a sandstone ledge across the flank (KRELIEF.scarp, ~30 m, its talus under it), and four sandstone DOMES (exfoliation caps,
//                     their own talus aprons: KRELIEF.talus); bristlecones on the domes' tops and the highest ground
//   SNOWBEDS          on the high shaded faces and in their hollows, lasting into summer; two small TARNS (core/water stills)
// The fields are the kit's twenty (so its zones and checks read the same names) and the station's own: north (aspect: +1 a sunny north face,
// -1 a shaded south one), draw, chap, bsk, snow, talus, dome, meadow, burn. The kit's zones are muted here except on the bench (56's ZONE_HOOK).
// ---------------------------------------------------------------- the land
const TERR={R:3400};
const STATION={name:'high',px:848,py:564,label:'The high country (station 2)'};
const sclamp=(v,a)=>a*Math.tanh(v/a);   /* the ramp eased past the map, so the far field levels off */
function rampH(x,z){return 3560+.072*sclamp(z,6000)-.045*sclamp(x,6000);}
const BENCH={y:3240};
const benchK=(x,z)=>smooth(300,1500,x)*smooth(300,-1100,z);
// the ribs: east-west spurs (noise stretched along x), their troughs the draws
const ribN=(x,z)=>clamp((fbm(x*.00042+1.3,z*.0014-2.1,4811,3)-.54)*2.6+.5,0,1);   /* the noise's 2-98% (.25-.79) stretched to 0..1 */
const ridgeOf=(x,z)=>1-Math.abs(2*ribN(x,z)-1);
// the sandstone domes: an exfoliation cap, steep-sided (h (1-(d/R)^2)^p)
const DOMES=[{name:'The great dome',x:-1100,z:1700,R:280,h:90,p:.5},{name:'The west dome',x:-2400,z:300,R:240,h:75,p:.55},
 {name:'The south dome',x:500,z:2500,R:200,h:60,p:.6},{name:'The low dome',x:-500,z:-1700,R:170,h:42,p:.65}];
function domeAt(x,z){let h=0,k=0,fd=1e9;for(const D of DOMES){const d=Math.hypot(x-D.x,z-D.z);fd=Math.min(fd,d-D.R*.97);if(d>=D.R)continue;const t=1-(d/D.R)*(d/D.R);h=Math.max(h,D.h*Math.pow(t,D.p));k=Math.max(k,smooth(D.R*1.02,D.R*.55,d));}return{h,k,fd};}
// the step: a sandstone ledge across the flank, west to east (the plateau south of it, the floor north: KRELIEF.scarp, side 1), with its talus
const STEP=KRELIEF.scarp({pts:[[-3700,880],[-2400,1010],[-1300,860],[-200,1000],[700,940],[1500,1080]],side:1,h:34,run:14,power:1.3,
 talus:{h:7,reach:34,curve:1.5,rough:.6},rim:{lip:.6,w:3},warp:{amp:10,scale:1/700},rough:.03,ends:400,seed:4821});
// the domes' talus aprons (KRELIEF.talus: the slabs' spall banked against each dome's foot)
const DOME_TALUS=KRELIEF.talus({footD:(x,z)=>domeAt(x,z).fd,h:6,reach:40,curve:1.7,rough:.6,scale:.02,seed:4822});
// the land without the tarns: the ramp, the bench, the ribs, the domes, the step
function landH(x,z){
 let h=rampH(x,z)+22*(fbm(x*.0011+5,z*.0011-3,4801,3)-.5)*2;
 const rd=ridgeOf(x,z),bk=benchK(x,z);
 h+=(1-bk)*(62*smooth(.45,.95,rd)-18*smooth(.35,.08,rd));   /* the ribs up, the draws down */
 h=mix(h,BENCH.y+14*(fbm(x*.002,z*.002,4802,2)-.5),bk*.92);
 if(Math.abs(x)<TERR.R*1.3&&Math.abs(z)<TERR.R*1.3){const D=domeAt(x,z);h+=D.h+DOME_TALUS(x,z);h=KRELIEF.shape(STEP,x,z,h);}
 return h;}
// THE TARNS: two small ones in hollows, each level the lowest of its rim less 0.6 m, the bowl carved under it
const TARNS=[{key:'upper',name:'The upper tarn',x:-1650,z:2350,r:48,depth:3.2},{key:'lower',name:'The draw tarn',x:1150,z:300,r:30,depth:2.4}];
for(const T of TARNS){let lo=1e9;for(const f of [1.2,1.45,1.7])for(let k=0;k<32;k++){const a=k/32*TAU;lo=Math.min(lo,landH(T.x+Math.cos(a)*T.r*f,T.z+Math.sin(a)*T.r*f));}T.level=lo-.6;}   /* the least of three rings round it */
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);
 for(const T of TARNS){const d=Math.hypot(x-T.x,z-T.z);if(d<T.r*1.7){const bowl=T.level-T.depth*(1-Math.min(1,(d/T.r)*(d/T.r)))+.4;h=mix(h,Math.min(h,bowl),smooth(T.r*1.6,T.r*.85,d));}}
 return h;}
// THE WATER (core/water stills: the records are the water's one truth, waterH answers from them): each tarn's shore by rays out from its middle
// to where the ground rises over its level (a few metres more, so the flat water runs under the bank)
for(const T of TARNS){const P=[],N=48;for(let k=0;k<N;k++){const a=k/N*TAU,cx=Math.cos(a),cz=Math.sin(a);let last=2;
  for(let r=2;r<T.r*1.6;r+=1.5){if(terrainH(T.x+cx*r,T.z+cz*r)>T.level+.25)break;last=r;}P.push([T.x+cx*(last+1.5),T.z+cz*(last+1.5)]);}
 T.poly=P;T.W=WATER.still({name:T.name,level:T.level,poly:P});}
const STAGE_WATER=TARNS.map(T=>({key:T.key,rec:T.W,look:{color:T.key==='upper'?0x2c5c66:0x34646a,roughness:.07,metalness:.05,envMapIntensity:.45,renderOrder:1}}));
function waterH(x,z){for(const T of TARNS){if(Math.abs(x-T.x)<T.r*1.7&&Math.abs(z-T.z)<T.r*1.7&&T.W.contains(x,z))return T.level;}return -1e9;}

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
// in the kit's terms: wet ~ rain / 1,800 mm (Dsb ~410 mm, Dfb ~630, BSk ~250), more in the draws and by the tarns, less on the sunny faces; cold the
// montane band (nhighlands' station 2 runs .42-.6: the kin builders read it); the station's own as the header says
function fieldsAt(x,z,h,slope,north){const wd=waterH(x,z),near=wd>-1e8&&h-wd<3?1:0,bk=benchK(x,z),rd=ridgeOf(x,z),valley=smooth(.4,.1,rd)*(1-bk);
 const D=domeAt(x,z),sa=Math.abs(x)<TERR.R*1.3?KRELIEF.at(STEP,x,z):null,face=sa&&(sa.part==='face'||sa.part==='rim')?KRELIEF.scarpRock(STEP,x,z):0;
 const dTar=TARNS.reduce((m,T)=>Math.min(m,Math.hypot(x-T.x,z-T.z)-T.r),1e9);
 let wet=.2+.12*smooth(3400,3900,h)+.06*smooth(-1500,2500,z-x*.4)+.14*valley-.07*Math.max(0,north)+.04*Math.max(0,-north)-.09*bk;
 wet=Math.max(wet,near*.9,smooth(60,6,dTar)*.62);
 const rock=clamp(Math.max(smooth(.55,1.0,slope)*.9,D.k*.92,face*.95),0,1);
 const sunN=north*smooth(.04,.16,slope);   /* the aspect, weighted by how much of a face it is */
 const talus=Math.max(sa&&sa.part==='talus'?smooth(0,.4,1-sa.d/60)*.9+.1:0,smooth(40,4,D.fd)*smooth(0,1.5,DOME_TALUS(x,z)))*(1-D.k);
 const snow=smooth(3630,3790,h)*smooth(-.02,-.3,sunN)*smooth(.4,.62,fbm(x*.006+31,z*.006-7,4831,2)+.25*valley)*(1-rock*.7)*(1-near);
 const meadow=smooth(.15,.05,slope)*smooth(.3,.42,wet)*(1-D.k)*(1-bk)*(1-near);
 const draw=valley*smooth(.5,.22,slope)*(1-D.k)*smooth(3380,3520,h);
 const chap=smooth(3500,3380,h)*(1-bk*.85)*(.45+.55*Math.max(0,sunN))*(1-D.k);
 const burn=smooth(.69,.75,fbm(x*.0016+71,z*.0016-17,4841,2))*(1-valley*.7)*(1-bk)*(1-snow);
 return{wet:clamp(wet,0,1),flow:0,upland:clamp((h-650)/800,0,1),canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,
  salt:0,cold:clamp(.44+.14*smooth(3300,3950,h)-.05*Math.max(0,sunN)+.05*Math.max(0,-sunN),0,1),bed:0,silt:0,strand:0,ring:0,shore:0,band:0,scour:0,dry:0,
  north:clamp(sunN,-1,1),draw:clamp(draw,0,1),chap:clamp(chap,0,1),bsk:bk,snow:clamp(snow,0,1),talus:clamp(talus,0,1),dome:D.k,meadow:clamp(meadow,0,1),burn:clamp(burn,0,1)};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','bed','silt','strand','ring','shore','band','scour','dry',
 'north','draw','chap','bsk','snow','talus','dome','meadow','burn'];
const FC=(function(){const N=480,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*cs),hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*cs),g=Math.hypot(hx,hz),slope=clamp(g*1.6,0,1);
  /* a face looks down its slope (-grad): north (-z) when the ground rises to the south (hz > 0) */
  const north=g>1e-4?hz/g:0;
  const F=fieldsAt(x,z,a.h[k],slope,north);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the bench, the park, the draws, the domes, the tarns, the step
const SPINE=[[1300,-1300],[700,-700],[-300,-300],[-900,600],[-1100,1450],[-1650,2250],[-400,1250],[400,1600],[1150,350],[-2300,-200],[-200,-1500],[600,-2300]];
BIO.init({tags:'nsemiarid',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:23,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:400,mid:1000,far:2600,floor:[360,880]},
 windows:{water:[-TERR.R,-TERR.R,TERR.R,TERR.R]}});
BIO.setSun([-200,1150,-1000]);   /* the sun in the north (Krator near 40 S): the north faces lit */
const WIND=[1,.25];   /* the westerlies over the range: the bench is their lee */
// THE GROUND (45c-host-ground.js): the paint is this stage's own (STAGE_GROUND.tint repaints every pixel), and its eight library layers
// (STAGE_GROUND.layers, the kit's pack: this station's families and the kit's own), each on a documented mask from the cached fields:
//   needles   the conifers' litter: the draws and the park's shaded faces          withered  the park's golden bunchgrass on the sunny faces
//   steppe    the bench (BSk)                                                       grass     the meadows by the tarns and the draws' floors
//   slab      the sandstone domes, the step's face and any bare steep rock          scree     the talus under the step and round the domes
//   snowbed   the snowbeds                                                          chaparral the oak scrub's red soil (Csb)
const HG=(x,z)=>FC.at(FC.a.h,x,z);
const STAGE_GROUND={N:560,label:'The high country (n semiarid, station 2)',region:'The high country: the dry-summer montane of the north basin (station 2, ideal type)',rows:null,
 tint:(c,F,wx,wz,n)=>{const K=hx=>BIO.host.THREE?new THREE.Color(hx):null,P=STAGE_GROUND.PAL;
  const sun=Math.max(0,F('north')),shade=Math.max(0,-F('north')),rk=smooth(.45,.85,F('rock'));
  c.copy(P.gold).lerp(P.gold2,clamp(.5+n*1.8,0,1));                          /* the park's golden bunchgrass */
  c.lerp(P.duff,smooth(.0,.5,shade)*.55+F('draw')*.5);                          /* needle duff in the shade and the draws */
  c.lerp(P.sage,smooth(.2,.7,sun)*.25);                                          /* sagebrush grey on the sunny faces */
  c.lerp(P.red,F('chap')*.6);                                                    /* the scrub's red soil */
  c.lerp(P.steppe,F('bsk')*.85);                                                 /* the bench's pale steppe */
  c.lerp(P.green,F('meadow')*.7);c.lerp(P.burn,F('burn')*.25);
  c.lerp(P.scree,F('talus')*.8);c.lerp(P.slab,rk*.85);c.lerp(P.snow,smooth(.25,.7,F('snow'))*.95);},
 PAL:{gold:new THREE.Color(0xb8a26a),gold2:new THREE.Color(0xa8925c),duff:new THREE.Color(0x6a5640),sage:new THREE.Color(0x9a9c84),red:new THREE.Color(0x9a6a4a),
  steppe:new THREE.Color(0xb6a682),green:new THREE.Color(0x6a8a44),burn:new THREE.Color(0x4a4038),scree:new THREE.Color(0xa49a88),slab:new THREE.Color(0xc4ae8e),snow:new THREE.Color(0xf2f4f6)},
 layers:[
  ['needles',F=>(smooth(.0,.5,-F.north)*.7+F.draw*.8)*(1-smooth(.45,.85,F.rock))*(1-F.snow)*(1-F.bsk)*(1-F.meadow)],
  ['withered',F=>smooth(.0,.5,F.north+.15)*(1-F.draw)*(1-smooth(.45,.85,F.rock))*(1-F.snow)*(1-F.bsk)*(1-F.chap)*(1-F.meadow)],
  ['steppe',F=>F.bsk*(1-smooth(.45,.85,F.rock))],
  ['grass',F=>Math.max(F.meadow,F.draw*.3)*(1-F.snow)],
  ['slab',F=>smooth(.45,.85,F.rock)*(1-F.snow)],
  ['scree',F=>F.talus*(1-F.snow)],
  ['snowbed',F=>smooth(.25,.7,F.snow)],
  ['chaparral',F=>F.chap*.85*(1-smooth(.45,.85,F.rock))*(1-F.bsk)]]};
// the country past the map (87-host-far.js: FAR_LAND, FAR_COLOR): the range runs on SW toward the Inner Wall's crest, the bench and the basin NE
const FAR_LAND=(x,z)=>rampH(x,z)+(1-benchK(x,z))*30*smooth(.45,.95,ridgeOf(x,z))+40*(fbm(x*.0007,z*.0007,4803,3)-.5);
const FAR_COLOR=(function(){const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={gold:L([176,160,110]),forest:L([62,74,52]),steppe:L([178,166,132]),rock:L([170,152,128]),snow:L([236,238,242]),far:L([160,162,166])};
 return(x,z,y,q)=>{const n1=clamp(KRAND.fbm(x*.002,.5,z*.002,2,4871)*.6+KRAND.fbm(x*.011,.5,z*.011,2,4872)*.6-.1,0,1);
  let c=mixC(C.gold,C.forest,smooth(.3,.8,n1)*smooth(3350,3600,y)*.75);c=mixC(c,C.steppe,smooth(3320,3220,y));
  const s=Math.hypot(FAR_LAND(x+40,z)-FAR_LAND(x-40,z),FAR_LAND(x,z+40)-FAR_LAND(x,z-40))/80;c=mixC(c,C.rock,smooth(.3,.6,s)*.7);
  c=mixC(c,C.snow,smooth(3950,4150,y)*smooth(.55,.75,n1+.2));
  return mixC(c,C.far,.5*smooth(4500,13000,q.r));};})();
// ---------------------------------------------------------------- the volumes the inspector names
for(const T of TARNS)REGISTER({name:T.name,x:T.x,z:T.z,y:T.level-T.depth-4,r:T.r*1.6,h:T.depth+20});
for(const D of DOMES)REGISTER({name:D.name+' (sandstone)',x:D.x,z:D.z,y:terrainH(D.x+D.R,D.z)-10,r:D.R,h:D.h+30});
REGISTER({name:'The sandstone step and its talus',x:-1000,z:950,y:rampH(-1000,950)-40,r:2600,h:90});
REGISTER({name:'The bench: the cool steppe (BSk)',x:1500,z:-1500,y:BENCH.y-40,r:1200,h:120});
