// ================================================================= HOST — what the stations share: the land from its parts (2026-11-03)
// Every page of this kit loads it; it defines names and functions only. A STATION's land (stations/<name>/44w-host-land.js) hands rimLand()
// its own ground, lakes, river and falls and its climate, and gets back the land contract 45-host-stage.js reads:
//   TERR {R}, terrainH(x,z), waterH(x,z) (-1e9: none), fieldsAt(x,z,h,slope), LAKES [{name, kind, level, poly, inside(x,z), colour}],
//   RIVER_SPEC {pts:[[x,z,y]], width, speed, name} | null, FALLS [{name, lip:[x,y,z], foot:[x,y,z], width}], SPINE, STRATA, ROCK
// The climate is the station's, from the scale model's numbers at its site (PLAN.md, "On scale model 5.1"): a mean temperature tm(x,z,h)
// (the model's own at the site, carried by a lapse rate over the page's relief), so `cold` reads the same on every rim: 0 at +16 degC (the
// great lake's basin), 1 at -14 degC (the ice). The zones (55) read cold, wet, fog, slope, rock, barren, snow and farm.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const LQ=new URLSearchParams(location.search);
const coldOf=tm=>clamp((16-tm)/30,0,1);
// a closed blob's distance in radii (a tarn, a hollow): wobbled by its index
function blobD(x,z,X,Z,R,i){const dx=x-X,dz=z-Z,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)*(1+.13*Math.sin(3*a+(i||0))+.06*Math.sin(5*a+2*(i||0)))/R;}
const discPolyL=(X,Z,R,n)=>Array.from({length:n||40},(_,k)=>{const a=k/(n||40)*TAU;return[X+Math.cos(a)*R,Z+Math.sin(a)*R];});
const boxPoly=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
// a polyline's nearest point: {d, t (0..1 along), i}
function nearLine(pts,x,z){let best={d:1e9,t:0,i:0},acc=0,tot=0;const L=[];for(let i=0;i<pts.length-1;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);L.push(l);tot+=l;}
 for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,u=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),px=a[0]+dx*u,pz=a[1]+dz*u,d=Math.hypot(x-px,z-pz);
  if(d<best.d)best={d,t:(acc+u*L[i])/(tot||1),i,u};acc+=L[i];}return best;}
// boulders on a field (a moraine, a felsenmeer): KRAND cells, the kit's boulder item, on the ground; k(x,z) 0..1
function landBoulders(k,o){const cell=o.cell==null?20:o.cell,R=TERR.R-150,N=Math.ceil(R/cell);let n=0;const c0=BIO.cur,r0=BIO.range,m0=BIO.minRange;BIO.cur='riftrim/floor';const pv=BIO.kit('riftrim');
 const rt=c=>RRIM.tint?RRIM.tint(c,RRIM.means().rock,.6):c;BIO.range=o.range==null?900:o.range;BIO.minRange=0;
 try{if(!BIO.defs.boulder)return 0;for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(o.seed,i,j,0x71),u=q=>KRAND.unit(KRAND.hash(h,q,0,0x72)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R||u(3)>k(x,z)*(o.dens==null?.7:o.dens))continue;if(waterH(x,z)>terrainH(x,z)-.2||BIO.mask(x,z)<=0)continue;
   const r=(o.r==null?1.2:o.r)*(.6+1.6*u(4)*u(4)),y=terrainH(x,z);BIO.put('boulder',[x,y+r*.15,z],new THREE.Quaternion().setFromEuler(new THREE.Euler(u(5),u(6)*6.28,u(7))),[r*(.9+.5*u(8)),r*.7,r],rt(o.tint==null?0x7a7672:o.tint),{label:o.label||'Fallen rock'});n++;}}
 finally{BIO.kit(pv);BIO.cur=c0;BIO.range=r0;BIO.minRange=m0;}return n;}
// THE STATION'S LAND. o:
//   R (3000), ground(x,z) the whole dry ground (the station carves its own lake basins, river channel and cliffs into it)
//   lakes [{name, kind: deep|glacial|algal|peat|frozen, level, poly [[x,z]] (the still's outline: water shows where the ground is under the
//          level), inside(x,z) (default: inside poly), colour}]; river {pts [[x,z,y]] (the water's line and level, downstream), width, name,
//          speed, look [shallow, deep]} | null; falls [{name, lip:[x,y,z], foot:[x,y,z], width}]
//   tm(x,z,h) mean temperature (degC), wet(x,z,h), fog(x,z,h), barren(x,z,h), farm(x,z), rockAt(x,z,h,slope), snowAt(x,z,h,slope),
//   strataK(x,z,h,slope), talus(x,z), polyg(x,z,F) (patterned ground), ice(x,z) (a glacier: nothing roots), strata (a KSTRATA stack)
//   rock() -> KSTACKS bodies; spine [[x,z]]
function rimLand(o){
 const R=o.R==null?3000:o.R,LK=(o.lakes||[]).map((L,i)=>Object.assign({i,kind:'deep'},L)),RIV=o.river||null;
 const inPoly=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 LK.forEach(L=>{if(!L.inside)L.inside=(x,z)=>inPoly(L.poly,x,z);});
 const RP=RIV?RIV.pts.map(p=>[p[0],p[1]]):null;   /* the line in plan: [x, z] (pts are [x, z, y]) */
 const _tm={x:NaN,z:NaN,h:0};
 function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=o.ground(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
 function riverAt(x,z){if(!RIV)return null;const n=nearLine(RP,x,z),hw=RIV.half?RIV.half(x,z):RIV.width*.5;if(n.d>hw*1.05)return null;   /* river.half(x, z): its half-width where it changes (the gorge narrows) */const a=RIV.pts[n.i],b=RIV.pts[Math.min(RIV.pts.length-1,n.i+1)];return mix(a[2],b[2],n.u);}
 function waterH(x,z){let w=-1e9;for(const L of LK)if(L.inside(x,z))w=Math.max(w,L.level);const r=riverAt(x,z);if(r!=null)w=Math.max(w,r);return w;}
 const RIVER_SPEC=RIV?{name:RIV.name||'The river',pts:RIV.pts,width:RIV.width==null?24:RIV.width,speed:RIV.speed==null?1.4:RIV.speed}:null;
 function fieldsAt(x,z,h,slope){const wd=waterH(x,z),under=wd>-1e8&&h<wd;
  const tm=o.tm(x,z,h),cold=coldOf(tm),fog=o.fog?clamp(o.fog(x,z,h),0,1):0;
  let wet=clamp(o.wet(x,z,h),0,1);if(RIV){const n=nearLine(RP,x,z);wet=Math.max(wet,smooth(80,RIV.width*.5,n.d)*.9);}
  const barren=clamp(Math.max(o.barren?o.barren(x,z,h):0,o.ice?o.ice(x,z):0),0,1),rk=o.rockAt?o.rockAt(x,z,h,slope):smooth(.45,.8,slope),tal=o.talus?o.talus(x,z)*smooth(.1,.3,slope):0;
  const F={wet,flow:under?1:0,upland:clamp((h+500)/6000,0,1),canyon:0,rim:0,rock:clamp(Math.max(rk,tal*.6),0,1),dune:0,oasis:0,slope,abyss:0,salt:0,cold,geo:0,barren,
   strata:o.strataK?o.strataK(x,z,h,slope):0,crack:0,snow:clamp(Math.max(barren*.9,o.snowAt?o.snowAt(x,z,h,slope):0),0,1),pave:0,polyg:0,talus:tal,wash:0,char:0,
   fog,farm:o.farm?clamp(o.farm(x,z),0,1):0,ice:o.ice?o.ice(x,z):0};
  if(o.polyg)F.polyg=o.polyg(x,z,F);return F;}
 return{TERR:{R},terrainH,waterH,fieldsAt,LAKES:LK,RIVER_SPEC,FALLS:o.falls||[],riverAt,
  SPINE:o.spine||[[0,0]],STRATA:o.strata||BIO.strata({recipe:'canyon',seed:6813,range:[-500,6500],res:.5,private:true}),ROCK:o.rock?o.rock(o.ground):[]};}
