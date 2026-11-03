// ================================================================= HOST — what the lands share (the final rebuild, 2026-11-02; PLAN-STATIONS.md)
// Every page of this kit loads it; it defines names and functions only. A STATION's land (stations/<name>/44w-host-land.js) hands stationLand() its
// own ground, river, pools, cirque and climate, and gets back the land contract 44w-host-land.js's header lists (the transect writes its own by hand).
// What it adds over a heightfield: the river's channel carved into the ground (the transect's wall profile), the water's levels, the fields the kit
// zones by, the strata's ledges baked into the ground (KSTRATA's S.terrace: the benches a plant roots on are the beds the eye sees) and the landforms
// as fields the placement reads (talus, wash: the review's second line).
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const LQ=new URLSearchParams(location.search);
var EBADLANDS_NOFUNG=LQ.get('fung')==='0';   /* the dressing's crusts on BIO.fung (50) or the old mat card */
// a channel's wall (u: the distance from its line in floor half-widths; uo: its outer edge), the transect's profile: 1 the floor .. 0 past the walls
function chanWallK(u,uo){if(u>=uo)return 0;const b=1+.5*(uo-1);return .58*smooth(uo,b,u)+.42*smooth(b+.12*(uo-1),1,u);}
// a closed blob's distance in radii (a pool, a cirque, a meadow): wobbled by its index
function blobD(x,z,X,Z,R,i){const dx=x-X,dz=z-Z,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)*(1+.13*Math.sin(3*a+(i||0))+.06*Math.sin(5*a+2*(i||0)))/R;}
const discPolyL=(X,Z,R)=>Array.from({length:36},(_,k)=>{const a=k/36*TAU;return[X+Math.cos(a)*R,Z+Math.sin(a)*R];});
// boulders on a field (a talus, a moraine): KRAND cells, the kit's boulder item, on the ground. k(x,z) 0..1; o.tintAt(x,y,z) a colour per stone
// CHIPS: the badlands' debris (the owner, 2026-11-03): small stones shed by the beds, at the foot of the steep bedded faces and in the gullies, each the
// colour of the bed above it (KSTRATA's at), within o.near metres of the LOD spine (they are hand-sized: past that the paint carries them)
function badlandChips(o){if(LQ.get('chips')==='0'||!STRATA.at)return 0;const c=new THREE.Color(),near=o.near==null?700:o.near;
 return landBoulders((x,z)=>{if(BIO.lodD(x,z)>near)return 0;const st=FIELD.strata(x,z),sl=FIELD.slope(x,z);return st*smooth(.2,.45,sl)*smooth(.95,.75,sl)*(o.k==null?1:o.k);},
  {seed:o.seed,cell:o.cell==null?5:o.cell,dens:o.dens==null?.45:o.dens,r:o.r==null?.22:o.r,range:o.range==null?260:o.range,label:'Chips shed by the beds',
   tintAt:(x,y,z)=>{const a=STRATA.at(x,y+2.5,z);c.setRGB(a.colour[0],a.colour[1],a.colour[2]).multiplyScalar(.82);return c.getHex();}});}
function landBoulders(k,o){const cell=o.cell==null?20:o.cell,R=TERR.R-150,N=Math.ceil(R/cell);let n=0;const c0=BIO.cur,r0=BIO.range,m0=BIO.minRange;BIO.cur='badlands/floor';const pv=BIO.kit('ebadlands');
 /* the stone's colour normalised by the rock texture's mean, as the kit's own stones are (60: rockTint): a raw colour on that dark map draws near black */
 const rt=c=>EBADLANDS.tint?EBADLANDS.tint(c,EBADLANDS.means().rock,.55):c;BIO.range=o.range==null?900:o.range;BIO.minRange=0;
 try{if(!BIO.defs.boulder)return 0;for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(o.seed,i,j,0x71),u=q=>KRAND.unit(KRAND.hash(h,q,0,0x72)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R||u(3)>k(x,z)*(o.dens==null?.7:o.dens))continue;if(waterH(x,z)>terrainH(x,z)-.2||BIO.mask(x,z)<=0)continue;   /* the host's mask: off the water and off a rock body (45: ROCK_MASK) */
   const r=(o.r==null?1.2:o.r)*(.6+1.6*u(4)*u(4)),y=terrainH(x,z);BIO.put('boulder',[x,y+r*.15,z],new THREE.Quaternion().setFromEuler(new THREE.Euler(u(5),u(6)*6.28,u(7))),[r*(.9+.5*u(8)),r*.7,r],rt(o.tintAt?o.tintAt(x,y,z):o.tint==null?0xa08a78:o.tint),{label:o.label||'Fallen rock'});n++;}}
 finally{BIO.kit(pv);BIO.cur=c0;BIO.range=r0;BIO.minRange=m0;}return n;}
// THE STATION'S LAND from its parts. o:
//   R (3000), ground(x,z) the land without channel, pools or cirque; groundN (the mesh's cells a side)
//   river {line(x) -> z, bed(x) -> the floor's y, W(x) half-width of the floor, uo(x) the walls' outer edge in half-widths (1.3 a plateau's slot .. 4 a V
//         valley), name, look [shallow, deep]} or null; the water runs WL = bed - 1.2 from +x to -x (a station's river comes down from the east)
//   pools [[x,z,r,depth]] (acid pools in a hollow), vents {x,z,r} | null, tarn {x,z,r,name,colour,cirque} | null (a cirque round it, its floor tarn.base; cirque 1 reaches 3.6 radii)
//   cold(x,z,h), wet(x,z,h) the climate (BIOME-API.md's scale), barren(x,z,h), geo(x,z) (or 0), rockAt(x,z,h,slope) the bare rock share
//   strataK(x,z,h,slope) where bedded rock shows (the shader's share), strata (the KSTRATA stack: STRATA), ledges (S.terrace k: 0 none)
//   talus(x,z) 0..1 a wall's foot, wash(x,z,h) 0..1 a dry bed's floor, pave(x,z,F), polyg(x,z,F) (the hot flats' pavement and polygons)
//   rock() -> KSTACKS bodies; spine [[x,z]]; snowLine [y0,y1], climate, fog, far(x,z,S0), farBands, sky {px,py}, views(H), probes, build(), region, name
function stationLand(o){
 const R=o.R==null?3000:o.R,RIV=o.river||null,POOLS=o.pools||[],VENTS=o.vents||null,TARN=o.tarn||null,S=o.strata||null;
 const poolD=(x,z)=>{let best=1e9,pi=-1;for(let i=0;i<POOLS.length;i++){const P=POOLS[i],d=blobD(x,z,P[0],P[1],P[2],i);if(d<best){best=d;pi=i;}}return[best,pi];};
 const tarnD=(x,z)=>TARN?blobD(x,z,TARN.x,TARN.z,TARN.r,1):1e9;
 const ground0=(x,z)=>{let h=o.ground(x,z);if(S&&o.ledges){const e=4,sl=Math.hypot(o.ground(x+e,z)-o.ground(x-e,z),o.ground(x,z+e)-o.ground(x,z-e))/(2*e);if(sl>.35)h=mix(h,S.terrace(x,z,h,o.ledges),smooth(.35,.7,sl));}return h;};
 if(TARN&&TARN.base==null)TARN.base=ground0(TARN.x,TARN.z)-22;
 function landH(x,z){let h=ground0(x,z);if(TARN){const td=tarnD(x,z),ck=TARN.cirque==null?1:TARN.cirque;if(td<1+3*ck){h=mix(h,TARN.base+Math.max(0,td-.85)*26,smooth(1+2.6*ck,1+.6*ck,td));if(td<1.05)h-=7*smooth(1.05,.3,td);}}   /* cirque: how far the bowl reaches (1: 3.6 radii, a cirque; a lake behind a moraine takes less) */
  if(VENTS){const dv=Math.hypot(x-VENTS.x,z-VENTS.z);if(dv<VENTS.r*1.3){const fl=VENTS.floor==null?o.ground(VENTS.x,VENTS.z)-10:VENTS.floor;h=mix(h,fl+3*(fbm(x*.01,z*.01,77,2)-.5),smooth(VENTS.r*1.25,VENTS.r*.7,dv));}}
  return h;}
 const WL=x=>RIV.bed(x)-1.2;
 function chan(x,z){if(!RIV)return{wall:0,dC:1e9};const dC=Math.abs(z-RIV.line(x)),w=RIV.W(x),u=dC/w;return{wall:chanWallK(u,RIV.uo(x)),dC,w};}
 const _tm={x:NaN,z:NaN,h:0};
 function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;let h=landH(x,z);const c=chan(x,z);
  if(c.wall>0){const fl=RIV.bed(x)+(fbm(x*.02,z*.02,88,2)-.5)*.8;h=mix(h,fl,c.wall)-2.6*smooth(16,5,c.dC)*smooth(.9,1,c.wall);}
  const pd=poolD(x,z);if(pd[0]<2.2){const P=POOLS[pd[1]];h-=P[3]*1.6*smooth(1.6,.5,pd[0]);}
  _tm.x=x;_tm.z=z;_tm.h=h;return h;}
 const POOLL=POOLS.map((P,i)=>{let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,landH(P[0]+Math.cos(a)*P[2]*1.15,P[1]+Math.sin(a)*P[2]*1.15));}return lo-.5;});
 const TARNL=TARN?TARN.base+.8:-1e9;
 function waterH(x,z){if(RIV){const c=chan(x,z);if(c.dC<c.w*1.05)return WL(x);}const pd=poolD(x,z);if(pd[0]<1.4)return POOLL[pd[1]];if(TARN&&tarnD(x,z)<1.3)return TARNL;return -1e9;}
 const canyonAt=(x,z)=>{const c=chan(x,z);return c.wall*(RIV?smooth(12,40,landH(x,z)-RIV.bed(x)):0);};
 const RIVER_SPEC=RIV?{name:RIV.name==null?'The river':RIV.name,pts:(function(){const p=[];for(let x=R*1.1;x>=-R*1.1;x-=20)p.push([x,RIV.line(x),WL(x)]);return p;})(),width:RIV.width==null?24:RIV.width,speed:RIV.speed==null?1.2:RIV.speed}:null;
 function fieldsAt(x,z,h,slope){const can=canyonAt(x,z),c=chan(x,z),wd=waterH(x,z),pd=poolD(x,z)[0],td=tarnD(x,z);
  const geo=o.geo?o.geo(x,z):0,cold=clamp(o.cold(x,z,h),0,1);
  const near=Math.max(RIV?smooth(60,8,c.dC-c.w*.2):0,smooth(2.2,1.05,td)*.9,smooth(2.4,1.1,pd)*.6);
  let wet=clamp(o.wet(x,z,h),0,1)-.1*geo;wet=Math.max(wet,can*.92*(1-slope*.3),near*.95);
  const flow=Math.max(RIV?smooth(48,7,c.dC):0,smooth(2.1,1.05,td)*.8,smooth(2,1.05,pd)*.5)*(h-Math.max(wd,-1e8)<3.5?1:.4);
  const barren=o.barren?o.barren(x,z,h):0,rk=o.rockAt?o.rockAt(x,z,h,slope):smooth(.4,.75,slope);
  const tal=o.talus?o.talus(x,z)*smooth(.1,.3,slope):0,wash=o.wash?o.wash(x,z,h):0;
  const F={wet:clamp(wet,0,1),flow:clamp(flow,0,1),upland:clamp(o.upland?o.upland(h):h/1500,0,1),canyon:can,rim:o.rim?o.rim(x,z,h):0,
   rock:clamp(Math.max(rk,tal*.6,barren*smooth(.6,.9,slope)),0,1),dune:0,oasis:0,slope,abyss:0,salt:o.salt?o.salt(x,z):0,cold,geo,barren,
   strata:o.strataK?o.strataK(x,z,h,slope):0,crack:Math.max(smooth(.2,.7,geo)*.7,smooth(.4,.1,wet)*smooth(.25,.05,cold)*.5),
   snow:Math.max(barren*(o.barrenSnow==null?1:o.barrenSnow),o.snowAt?o.snowAt(x,z,h,slope):0),pave:0,polyg:0,talus:tal,wash,char:o.char?o.char(x,z):0};
  if(o.pave)F.pave=o.pave(x,z,F);if(o.polyg)F.polyg=o.polyg(x,z,F);return F;}
 return{TERR:{R},terrainH,waterH,fieldsAt,VENTS,POOLS,POOLL,poolD,TARN,TARNL,tarnD,RIVER_SPEC,canyonAt,landH,WL,chan,
  SPINE:o.spine||[[0,0]],STRATA:S||BIO.strata({recipe:'canyon',seed:5813,range:[0,2400],res:.5,private:true}),ROCK:o.rock?o.rock(landH):[]};}   /* a land with no bedded rock still hands the ground a stack (its share, strataK, is 0): the core path, which needs no BIO.host */
