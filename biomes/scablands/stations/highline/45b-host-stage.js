// ================================================================= HOST — stage (the scablands, STATION 2: the flood lake's high line and the fan; replaces src/45b-host-stage.js)
// biomes/scablands/PLAN.md section 3, station 2, and biomes/nsemiarid/PLAN.md sections 2 and 6: the north basin's Lake Lewis. The surge down the west
// breach could not leave the basin, so it pooled round the trough and rose in days to about 834 m, then fell over centuries back to the trough's
// 430 m. It left one sharp high-water line with the wreckage it rafted through the west notch stranded on it, slackwater silt in stacked flood beds
// (rhythmites: Jimjam's brick) below it, the recession's strandlines down toward today's lake, and where the west channel met the lake a giant
// expansion bar and fan. This station is that ground on n semiarid's side of the flood lake (43,600 km2 of it; the plan's lowlands version over NW
// lowlands waits on that kit's rock zone and bed response, nsemiarid PLAN.md section 8: KNOWN_ISSUES.md), in small, on the plan's levels.
// THE MAP (x east, z south, north is -z; origin mid-station, R 3000), the plan's heights:
//   the PLATEAU     east, ~880-980 m: the steppe the water never reached, the kit's own
//   the HIGH LINE   ~834 m, wandering north-south across the middle with the ground: the wrack line, the rafted wreckage stranded on it
//   the OLD BED     west of it, down to ~600 m at the west edge: KBASIN's flood lake (kind 'flood': no ring, no fast drain), its silt in
//                   rhythmites where a bank is cut, the strandlines of the slow recession below the line
//   the FAN         the west breach's mouth (KSCOUR, no falls): its coulee enters from the NE cut ~170 m into the plateau, under the lake's
//                   level all the way, and spreads its bars and giant current ripples onto the bed; erratics (the dam's concrete, basalt) on them
//   a RAIN POND     in a hollow behind a bar
const TERR={R:3000};
const HL={level:834,trough:430};
// the land before the flood's marks: the plateau falling west into the old basin
function plainH(x,z){return 795+.055*x-120*smooth(0,-2600,x)+18*(fbm(x*.0009+3,z*.0009-1,1701,3)-.5)*2+7*(fbm(x*.003-2,z*.003+5,1702,2)-.5);}
// THE WEST BREACH'S MOUTH: a KSCOUR course in from the NE, its bed under the lake's level all the way, its fan of bars spreading at its end
const COURSE={name:'the west breach\'s mouth',pts:[[3500,-3500],[2300,-2300],[1200,-1350],[150,-550],[-900,150]],
 bed:[800,792,782,770,757,744,731,718,706,700],floor:700,walls:300,depth:120,islandL:900,islandW:240,fan:2600};
const SC=KSCOUR.create({seed:311,courses:[COURSE],falls:{count:0},strata:{basaltTop:960,basaltBase:640,seed:9}});
const LOC={};
function baseH(x,z){const P=plainH(x,z),L=SC.locate(x,z,LOC);if(L.k<0)return P;
 const half=COURSE.floor/2,ad=Math.abs(L.d),fl=Math.min(L.bed,P),wallW=170+60*fbm(x*.004,z*.004,1703,2),wt=smooth(half,half+wallW,ad);
 return wt>0?fl+(P-fl)*Math.pow(wt,.8):fl;}
// THE FLOOD LAKE (core/terrain/40-core-basin.js): one lake of kind 'flood' over the whole station below its level, today's water the trough's
const BASIN=KBASIN.create({seed:53,wind:[1,.3],age:1000,recession:600,strand:{a:.75},
 lakes:[{name:'the flood lake',kind:'flood',level:HL.level,remnant:HL.trough,member:()=>1}]});
// the order: the scour first (the surge), then the lake's marks over it (its strandlines came after, as it fell)
function landH(x,z){return BASIN.land(x,z,SC.land(x,z,baseH(x,z)));}
// A RAIN POND: the lowest point in a box behind the fan's toe, its level the lowest of its rim less 0.5 m, a bowl carved under it
const POND=(function(){let best={x:-1200,z:700,h:1e9};for(let z=300;z<=1300;z+=40)for(let x=-1800;x<=-600;x+=40){const h=landH(x,z);if(h<best.h)best={x,z,h};}
 const r=34;let lo=1e9;for(const f of [1.2,1.5,1.8])for(let k=0;k<32;k++){const a=k/32*TAU;lo=Math.min(lo,landH(best.x+Math.cos(a)*r*f,best.z+Math.sin(a)*r*f));}
 return{x:best.x,z:best.z,r,level:lo-.5,depth:1.6};})();
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;let h=landH(x,z);
 const d=Math.hypot(x-POND.x,z-POND.z);if(d<POND.r*1.7){const bowl=POND.level-POND.depth*(1-Math.min(1,(d/POND.r)*(d/POND.r)))+.35;h=mix(h,Math.min(h,bowl),smooth(POND.r*1.6,POND.r*.85,d));}
 _tm.x=x;_tm.z=z;_tm.h=h;return h;}
{const P=[],N=40;for(let k=0;k<N;k++){const a=k/N*TAU,cx=Math.cos(a),cz=Math.sin(a);let last=2;for(let r=2;r<POND.r*1.6;r+=1.5){if(terrainH(POND.x+cx*r,POND.z+cz*r)>POND.level+.2)break;last=r;}P.push([POND.x+cx*(last+1.5),POND.z+cz*(last+1.5)]);}POND.poly=P;}
const POND_W=WATER.still({name:'A rain pond behind a bar',level:POND.level,poly:POND.poly});
const STAGE_WATER=[{key:'pond',rec:POND_W,look:{color:0x5a7a6a,roughness:.08,metalness:.05,envMapIntensity:.4,renderOrder:1}}];
function waterH(x,z){if(Math.abs(x-POND.x)<POND.r*1.7&&Math.abs(z-POND.z)<POND.r*1.7&&POND_W.contains(x,z))return POND.level;return -1e9;}

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
const BS={},SS={};
function fieldsAt(x,z,h,slope){const B=BASIN.sample(x,z,h,BS),s=SC.sample(x,z,h,SS),wd=waterH(x,z),near=wd>-1e8&&h-wd<3?1:0,dp=Math.hypot(x-POND.x,z-POND.z)-POND.r;
 // rain: the hot steppe's ~400 mm over the line; the old bed's silt a desert (it sheds the rain: the kit's lowland desert, BWh, mostly the old
 // beds: crawlers, step cones), the pond's margin wet
 let wet=.22-.09*B.bed;wet=Math.max(wet,near*.9,smooth(40,4,dp)*.7);
 const scour=s.scour*(1-s.island),bar=s.bar*(1-s.island),rock=clamp(Math.max(smooth(.38,.7,slope)*.9,scour*(1-bar*.8)*.6),0,1);
 // the silt: KBASIN's (lake sediment under the line), stripped where the surge scoured, buried under the fan's gravel
 const silt=B.silt*(1-scour*.8)*(1-bar*.7);
 return{wet:clamp(wet,0,1),flow:0,upland:clamp((h-650)/800,0,1),canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,
  salt:B.salt,cold:clamp((h-900)/2600,0,1),bed:B.bed,silt,strand:B.strand,ring:0,shore:B.shore,band:B.band,
  scour,bar,island:s.island,ripple:s.ripple,dry:B.dry/1000};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','bed','silt','strand','ring','shore','band','scour','bar','island','ripple','dry'];
const FC=(function(){const N=440,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the wreckage (records; drawn by 87-host-erratics.js, 87h-host-hulks.js and 87w-host-wrack.js)
// THE HULKS: the dam lake's own working boats (trawlers, coasters, barges, tugs), torn from their moorings, rafted through the west notch and set
// down on the high line when the lake began to fall (the dam basins' wreck kind, read in place: biomes/dambasins/src/50-db-wrecks.js as
// 45a-db-wrecks.js, DBW; the Ancient Port kit's great ships stayed in their berths on the dam bed, where the dam basins ground them). A few,
// cell-seeded on core/rand (DBW.records: a hash of the seed, the cell and an index), only in the line's band (KBASIN 'high'), 250 m apart at
// least; each laid along the line (the contour, either way, turned up to 25 degrees), lying on the ground's tilt across its beam and heeled
// further toward the bed below, at most 20 degrees in all, its keel sunk in the line's silt (a third to two thirds of its depth). The pose's draws hash the record's own
// seed. Whole or half buried: a snapped hull's halves list opposite ways in DBW.draw, which a slope would not allow
const HULKS=(function(){const u=(h,k)=>KRAND.unit(KRAND.hash(h,k)),lr=(a,b,t)=>a+(b-a)*t,S={},g=terrainH,e=4,out=[];
 const R0=DBW.records({x0:-TERR.R+250,x1:TERR.R-250,z0:-TERR.R+250,z1:TERR.R-250,cell:240,seed:6203,ground:g,
  avoid:(x,z)=>waterH(x,z)>-1e8||SC.sample(x,z,g(x,z),{}).scour>.4,
  accept:(x,z,h)=>{if(h>HL.level)return 0;const s=BASIN.sample(x,z,h,S);return s.band===KBASIN.BAND.high?.4:0;}});
 for(const r of R0){if(out.some(q=>Math.hypot(q.x-r.x,q.z-r.z)<250))continue;const h=r.seed;
  const gx=(g(r.x+e,r.z)-g(r.x-e,r.z))/(2*e),gz=(g(r.x,r.z+e)-g(r.x,r.z-e))/(2*e),gl=Math.hypot(gx,gz)||1,dir=u(h,201)<.5?1:-1;
  r.heading=Math.atan2(-gz/gl*dir,gx/gl*dir)+(u(h,202)-.5)*.87;
  r.state=u(h,203)<.6?'whole':'buried';r.bury=r.state==='buried'?lr(.5,.66,u(h,204)):lr(.32,.48,u(h,204));
  /* the list (DBW.draw's roll about the keel: + lifts the hull's +x side, (cos h, -sin h)): the ground's tilt across the beam, and a heel more toward its lower side */
  const sx=Math.cos(r.heading),sz=-Math.sin(r.heading),yp=g(r.x+sx*r.B*.4,r.z+sz*r.B*.4),yq=g(r.x-sx*r.B*.4,r.z-sz*r.B*.4);
  r.list=clamp(Math.atan2(yp-yq,r.B*.8)+(yp<yq?-1:1)*lr(.08,.22,u(h,205)),-.36,.36);
  r.id='hulk:'+r.id.slice(6);out.push(r);}
 return out;})();
// a point in a hulk's footprint (its length and beam, pad m round them): the erratics and the wrack keep out of it
const inHulk=(x,z,pad)=>HULKS.some(r=>{const dx=x-r.x,dz=z-r.z,f=Math.sin(r.heading)*dx+Math.cos(r.heading)*dz,s=Math.cos(r.heading)*dx-Math.sin(r.heading)*dz;
 return Math.abs(f)<r.L/2+pad&&Math.abs(s)<r.B/2+pad;});
// THE ERRATICS (the coulee's kinds: the dam's broken concrete with its rebar, the flood basalt's boulders) on the fan's bars, where the surge
// dropped its load as it spread into the lake, and a few on the high line, rafted; cell-seeded on core/rand, each sunk a fifth to a third
const ERRATICS=(function(){const out=[],C=150,R=TERR.R-150,S={},u=(h,k)=>KRAND.unit(KRAND.hash(h,k)),lr=(a,b,t)=>a+(b-a)*t;
 for(let j=Math.floor(-R/C);j<=Math.floor(R/C);j++)for(let i=Math.floor(-R/C);i<=Math.floor(R/C);i++)for(let n=0;n<2;n++){const h=KRAND.hash(7719,i,j,n);
  const x=(i+u(h,1))*C,z=(j+u(h,2))*C;if(Math.abs(x)>R||Math.abs(z)>R)continue;
  const g=terrainH(x,z),q=SC.sample(x,z,g,S),b=BASIN.sample(x,z,g,{}),p=.32*q.bar+.06*q.scour+(b.band===KBASIN.BAND.high?.1:0);if(!(u(h,3)<p)||q.island>.3||waterH(x,z)>-1e8||g>HL.level||inHulk(x,z,4))continue;
  const block=u(h,4)<.7,slab=block&&u(h,5)<.3,sx=block?lr(2.5,7,u(h,6)):lr(2,6,u(h,6)),sz=sx*lr(.55,1,u(h,7)),sy=slab?lr(.8,1.5,u(h,8)):block?lr(1.5,4,u(h,8)):sx*lr(.55,.8,u(h,8));
  out.push({id:'erratic:'+i+':'+j+':'+n,kind:block?(slab?'slab':'block'):'boulder',x,z,y:g-sy*lr(.18,.33,u(h,9)),sx,sy,sz,
   yaw:u(h,10)*TAU,pitch:lr(-.3,.3,u(h,11)),roll:lr(-.3,.3,u(h,12)),bars:block?3+Math.floor(u(h,13)*7):0,seed:h});}
 return out;})();
// THE WRACK: what the surge rafted through the west notch and the lake stranded at its high line as it began to fall: torn plating, I-beams and
// containers from the dam's works and the drowned docks (the dam basins' flotsam kind, read in place: biomes/dambasins/src/52-db-flotsam.js, DBF),
// thick in a band a few metres under the level (KBASIN's band 'high'), in drifts along it, none above it; a few further down on the strandlines
const WRACK=DBF.records({x0:-TERR.R+150,x1:TERR.R-150,z0:-TERR.R+150,z1:TERR.R-150,cell:46,field:7,seed:4471,ground:terrainH,
 avoid:(x,z)=>waterH(x,z)>-1e8||SC.sample(x,z,terrainH(x,z),{}).scour>.6||inHulk(x,z,3),
 accept:(x,z,h)=>{if(h>HL.level)return 0;const s=BASIN.sample(x,z,h,BS);return s.band===KBASIN.BAND.high?.85:s.band===KBASIN.BAND.recession?.002+.025*s.strand:0;}});
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
for(const e of ERRATICS)OBSTACLES.push({x:e.x,z:e.z,r:Math.max(e.sx,e.sz)*.6+.5});
for(const r of WRACK){const sz=r.kind==='plate'?Math.max(r.w,r.l):r.L;OBSTACLES.push({x:r.x,z:r.z,r:sz*.5+.4});}
/* a hulk: a row of circles down its length, each covering its share of the hull's length and its beam (one circle round a coaster would clear 40 m) */
for(const r of HULKS){const n=Math.max(2,Math.ceil(r.L/r.B)),fx=Math.sin(r.heading),fz=Math.cos(r.heading),cr=Math.hypot(r.L/n/2,r.B/2)+1;
 for(let k=0;k<n;k++){const a=((k+.5)/n-.5)*r.L;OBSTACLES.push({x:r.x+fx*a,z:r.z+fz*a,r:cr});}}
// where the line runs (the views and the checks): its points, one a 150 m row, where the ground crosses the level
const LINE=(function(){const P=[];for(let z=-2700;z<=2700;z+=150){let prev=null;for(let x=-2900;x<=2900;x+=10){const h=landH(x,z);if(prev!=null&&prev<HL.level&&h>=HL.level){P.push([x,z]);break;}prev=h;}}return P;})();
const FAN=(function(){const C=SC.courses[0],p=C.pts[C.pts.length-1];return{x:p[0],z:p[1]};})();
// the LOD spine: along the line, down the coulee mouth to the fan, the pond, the bed west and the plateau east
const SPINE=LINE.filter((p,i)=>i%5===2).concat([[2300,-2300],[1200,-1350],[150,-550],[FAN.x,FAN.z],[FAN.x-500,FAN.z+400],[POND.x,POND.z],[2200,800],[2000,2200]]);   /* none out on the bed: its crawler fields (the kit's floor) held the floor's class over 16 M */
BIO.init({tags:'scablands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,
 /* the core's default mask (nothing roots under the water), and nothing in a hulk's footprint: the kit's travellers' offspring (a mace head rolled, a roll-egg's
    trail of seedlings) are tested on the mask, not the obstacles */
 mask:(x,z)=>{if(inHulk(x,z,.5))return 0;const d=BIO.placeH(x,z)-BIO.waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;},seed:19,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:400,mid:1000,far:2600,floor:[360,880]},
 windows:{water:[-TERR.R,-TERR.R,TERR.R,TERR.R]}});
BIO.setSun([-1000,1150,-560]);
const WIND=[1,.3];   // the prevailing wind (n semiarid's: NSEMIARID.setWind in 88-host-build)
// THE OVERLAY'S TINT over the kit's palette (45c-host-ground.js): the old bed's pale slackwater silt, banded where a bank is cut (the rhythmites: a
// pale silt and a darker clay cap a flood, 0.3-1 m each), the high line's wrack band dark (rotted drift, rust), the fan's grey gravel and its ripples'
// light crests and dark troughs, the scoured basalt of the coulee mouth
const HL_TINT=(function(){const K=h=>new THREE.Color(h),SILT=K(0xd2c6aa),CLAY=K(0xa89a80),WRACK=K(0x6a5c4c),GRAVEL=K(0x8a8478),GRAVEL2=K(0x9e978a),CREST=K(0xbab2a2),
 TROUGH=K(0x6a645a),BASALT=K(0x4e4740),t=new THREE.Color();
 return function(c,F,wx,wz,n){const h=FC.at(FC.a.h,wx,wz),bed=F('bed'),silt=F('silt'),sl=F('slope'),sc=F('scour'),bar=F('bar');
  if(silt>.05){t.copy(SILT).lerp(CLAY,.25+.2*n);c.lerp(t,smooth(.05,.4,silt)*.7);
   /* the rhythmites: on a cut bank (steep silt) the flood beds show as bands by height */
   const cut=smooth(.18,.42,sl)*smooth(.1,.4,silt),ph=h*1.6+.6*Math.sin(wx*.01+wz*.013),band=ph-Math.floor(ph);c.lerp(CLAY,cut*smooth(.55,.75,band)*.75);}
  c.lerp(WRACK,F('shore')*.55);
  if(sc>.05){t.copy(BASALT);c.lerp(t,smooth(.05,.6,sc)*(1-bar*.8)*.75);}
  if(bar>.05){t.copy(GRAVEL).lerp(GRAVEL2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.05,.5,bar)*.85);const rp=F('ripple'),b=smooth(.1,.5,bar);c.lerp(CREST,rp*b*.55);c.lerp(TROUGH,(1-rp)*b*.3);}};})();
const STAGE_GROUND={N:600,label:'The scablands: the flood lake\'s high line',region:'The scablands: the flood lake\'s high line and the west breach\'s fan (station 2, in small)',rows:null,tint:HL_TINT};
// the country past the map (87-host-far.js): the plateau east, the basin falling west toward the trough
const FAR_LAND=(x,z)=>BASIN.land(x,z,795+.055*Math.max(-6000,Math.min(6000,x))-120*smooth(0,-2600,x)-200*smooth(-3500,-9000,x)+18*(fbm(x*.0009+3,z*.0009-1,1701,3)-.5)*2);
// ---------------------------------------------------------------- the inspector's volumes
REGISTER({name:'The flood lake\'s high line ('+HL.level+' m: the surge stood here for days)',x:600,z:0,y:HL.level-20,r:3000,h:30});
REGISTER({name:'The west breach\'s fan: its bars and giant current ripples',x:FAN.x,z:FAN.z,y:690,r:1300,h:80});
/* each hulk a record (core/tags, through REGISTER's BIO.record) before it is drawn: its volume from its buried keel up past its masts */
for(const r of HULKS)REGISTER({name:'A hulk on the high line: a '+r.kind+' of the dam lake, rafted through the west notch ('+(r.state==='buried'?'half buried':'heeled')+')',
 cls:'prop',kind:'wreck',key:'hulk.'+r.kind,x:r.x,z:r.z,y:r.h-r.bury*r.H,r:r.L*.55,h:r.H*2.2,tags:{culture:'ancient',state:'ruined'}});
for(const e of ERRATICS)REGISTER({name:e.kind==='boulder'?'An erratic: a basalt boulder the flood rolled here':'An erratic: the dam\'s broken concrete, rafted kilometres ('+e.kind+', rebar torn out of it)',x:e.x,z:e.z,y:e.y-1,r:Math.max(e.sx,e.sz)*.75,h:e.sy+3});
