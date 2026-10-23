// ================================================================= HOST — stage (the scablands: a coulee and dry falls on the west breach)
// This build's stage, in place of n semiarid's own (biomes/scablands/PLAN.md, section 2): the same page (45-host-scene.js),
// the same painted ground (45c-host-ground.js) and the same kit, over a station of the overlay: the west breach's coulee
// in small, where the flood that tore down it from the broken dam fell over a dry falls into the trough.
//
// THE MAP (x east, z south, north is -z; origin mid-station, R 3000). The course runs north, downstream, toward the trough:
//   the plateau     ~700 m, loess over flood basalt, the steppe; near the coulee the flood overtopped it and scoured it
//   the coulee      2 km wide; its walls the basalt flows in steps (a cliff of columns and entablature a flow, a bench
//                   on the red interbed at its top), sandstone at their foot below 500 m
//   upstream        the floor ~550 m, scoured to butte-and-basin and potholes, streamlined loess islands in it
//   the dry falls   KSCOUR's fall: a horseshoe cliff ~107 m across the coulee, its lip bowed upstream where the fall ate
//                   back; a plunge-pool lake at its foot (Dry Falls Lake); potholes holding rain
//   downstream      the lower coulee ~435 m, 260 m under the plateau, bars and giant current ripples on its margins
// The order (core/terrain/41-core-scour.js): the station's ground holds the coulee (as the scale model's heights hold the
// channel at 4 km), and KSCOUR.land adds what lies under a cell: the scour, the basin under the fall, potholes, bars.
// The fields are the world's (the kit reads them): rock and scour from the scour and the slope, wet from the semiarid
// rain and the water, the rest as a plateau steppe has them.
const TERR={R:3000};
// the flood's course and the rock (one table: the strata's flows step the walls and colour the ground)
const COURSE={name:'the west coulee',pts:[[250,3700],[60,2000],[-120,400],[40,-1200],[300,-2800],[420,-3700]],
 bed:[560,557,554,551,548,545,438,435,432,429],floor:2000,walls:900,depth:150,islandL:1500,islandW:420,fan:0};
const SC=KSCOUR.create({seed:211,courses:[COURSE],falls:{count:1,spacing:2000,taper:1500,min:35,max:35},
 strata:{basaltTop:690,basaltBase:500,seed:7}});
const FALL=SC.courses[0].falls[0]||(reportErr('scablands: KSCOUR found no fall on the coulee'),{s:4500,x:0,z:-600,h:35,r:700});
// the floor: the bed upstream of the lip, the bed less the fall's drop below it (a cliff 24 m wide, horseshoe in plan)
const FLOOR={top:560,k:.0036,drop:107,half:COURSE.floor/2};
const lipAt=d=>{const v=d/FALL.r;return Math.abs(v)<1?-FALL.r*(1-v*v)*.6:0;};   // KSCOUR's own lip (41-core-scour.js)
const RK={},LOC={};
// the steps of the flows: in each flow the ground rises over its first 78 per cent and lies flat on the rest (a bench)
function stair(h){const r=SC.rock(h,RK);if(r.kind!=='basalt'&&r.kind!=='interbed')return h;
 const T=SC.strata.tops,top=T[r.flow],bot=r.flow?T[r.flow-1]:SC.strata.opt.basaltBase;return bot+(top-bot)*smooth(0,.78,(h-bot)/(top-bot));}
function plateauH(x,z){return 700+22*(fbm(x*.0009+3,z*.0009-1,17,3)-.5)*2+.004*z;}
// the ground before KSCOUR: the plateau, the coulee cut into it, its walls stepped, the islands standing at the plateau
function baseH(x,z,flat){const P=plateauH(x,z),L=SC.locate(x,z,LOC);if(L.k<0)return P;   // flat: no steps (the checks' negative)
 const ad=Math.abs(L.d),u=L.s-(FALL.s+lipAt(L.d)),step=smooth(-12,12,u);
 let fl=FLOOR.top-FLOOR.k*L.s-FLOOR.drop*step;if(Math.abs(u)<40&&!flat)fl=stair(fl);   // the falls' cliff, stepped by the flows it cuts
 const wallW=150+70*fbm(x*.004,z*.004,5,2),wt=smooth(FLOOR.half,FLOOR.half+wallW,ad);
 let h=wt>0?(flat?fl+(P-fl)*Math.pow(wt,.8):stair(fl+(P-fl)*Math.pow(wt,.8))):fl;
 if(wt<1){const q=SC.sample(x,z,fl,ISL),isl=smooth(.2,.55,q.island)*(u<0?smooth(80,220,-u):smooth(1300,1800,u));if(isl>0){h=mix(h,P-6,isl*(1-wt));if(!flat)h=stair(h);}}   // its flanks the flows' steps, as the walls'   // a streamlined island, a flat-topped mesa (none astride the falls or in its basin: the cliff runs clean across, the lake lies open)
 return h;}
const ISL={};
// a point on the course: s metres down it, d across (+ to the right going downstream: KSCOUR's sign)
function courseAt(s,d){const C=SC.courses[0];s=clamp(s,0,C.len);let k=1;while(k<C.cum.length-1&&C.cum[k]<s)k++;
 const a=C.pts[k-1],b=C.pts[k],L=(C.cum[k]-C.cum[k-1])||1,t=(s-C.cum[k-1])/L,tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L;
 return[a[0]+(b[0]-a[0])*t-tz*(d||0),a[1]+(b[1]-a[1])*t+tx*(d||0)];}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=SC.land(x,z,baseH(x,z));_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// ---------------------------------------------------------------- the water (core/water still records)
// THE PLUNGE LAKE under the falls: the basin KSCOUR cuts under a fall (35 m deep at the foot, shallowing downstream)
// holds water up to its spill point, where it would run on down the coulee's butte-and-basin lows: the level is the
// highest whose water, filled out from the basin's middle on a 10 m grid, stays inside 1.1 km of it (bisected), and the
// lake stands 2 m under that (a semiarid lake does not brim). Its shore: rays out to where the ground first stands over it
const PLUNGE=(function(){const s=FALL.s+260,P=SC.courses[0],i=(function(){let k=1;while(k<P.cum.length-1&&P.cum[k]<s)k++;return k;})();
 const a=P.pts[i-1],b=P.pts[i],t=(s-P.cum[i-1])/((P.cum[i]-P.cum[i-1])||1),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
 const R=1100,G=10,fills=lv=>{const seen=new Set(),q=[[0,0]];seen.add('0,0');
   while(q.length){const [i,j]=q.pop();if(Math.hypot(i,j)*G>=R)return false;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj,k=a+','+b;
    if(seen.has(k))continue;seen.add(k);if(terrainH(x+a*G,z+b*G)<lv)q.push([a,b]);}}return true;};
 let lo=terrainH(x,z)+.5,hi=FLOOR.top-FLOOR.k*FALL.s-FLOOR.drop;for(let it=0;it<12;it++){const m=(lo+hi)/2;if(fills(m))lo=m;else hi=m;}
 const level=lo-2,poly=[];
 for(let k=0;k<96;k++){const q=k/96*TAU,cx=Math.cos(q),cz=Math.sin(q);let hit=1100;for(let r=10;r<1100;r+=3){if(terrainH(x+cx*r,z+cz*r)>level+.3){hit=r;break;}}poly.push([x+cx*hit,z+cz*hit]);}   // each shore point where the ground first stands over the level
 return {x,z,level,poly};})();
const PLUNGE_W=WATER.still({name:'The plunge-pool lake under the dry falls',level:PLUNGE.level,poly:PLUNGE.poly});
// THE POTHOLES that hold rain: KSCOUR's kolks (SC.potholes: each one's centre is its bowl's deepest point) where the
// scour cut them deep, half of them wet (a hash of the place), the water two thirds of the way up the bowl, its shore by
// rays to the rim
const POTHOLES=(function(){const out=[],S={},R=TERR.R-200;
 for(const K of SC.potholes(-R,-R,R,R)){const x=K.x,z=K.z,s=SC.sample(x,z,baseH(x,z),S);if(s.pothole<.55)continue;
  if(Math.hypot(x-PLUNGE.x,z-PLUNGE.z)<1200&&PLUNGE_W.contains(x,z))continue;   // under the plunge lake: its water, not a pool of its own
  if(KRAND.unit(KRAND.hash(4421,Math.round(x),Math.round(z)))>.5)continue;
  const y0=terrainH(x,z),dep=s.pothole*(4+11*s.pothole),level=y0+dep*.62,poly=[];let rmax=0;
  for(let k=0;k<28;k++){const q=k/28*TAU,cx=Math.cos(q),cz=Math.sin(q);let hit=45;for(let r=1;r<45;r+=.5){if(terrainH(x+cx*r,z+cz*r)>level+.15){hit=r;break;}}poly.push([x+cx*hit,z+cz*hit]);rmax=Math.max(rmax,hit);}
  if(rmax<44)out.push({x,z,level,r:rmax+1,poly,rec:WATER.still({name:'A pothole holding rain',level,poly})});}
 return out.slice(0,40);})();
function waterH(x,z){if(Math.hypot(x-PLUNGE.x,z-PLUNGE.z)<1150&&PLUNGE_W.contains(x,z))return PLUNGE.level;
 for(const p of POTHOLES)if(Math.abs(x-p.x)<p.r&&Math.abs(z-p.z)<p.r&&p.rec.contains(x,z))return p.level;
 return -1e9;}
const STAGE_WATER=[{key:'plunge',rec:PLUNGE_W,look:{color:0x3e7a72,roughness:.08,metalness:.05,envMapIntensity:.45,opacity:.8,renderOrder:1}}]
 .concat(POTHOLES.map((p,i)=>({key:'pothole'+i,rec:p.rec,look:{color:0x2e5e5a,roughness:.08,metalness:.05,envMapIntensity:.4,renderOrder:1}})));

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
const SS={};
// the alkali rim: a band outside the plunge lake's own shore (its ray at that bearing), 15 m full and gone by 55, on ground
// at most 3 m over the water (2026-10-23: painted by height alone it whitened the basin's whole floor)
const PL_R=PLUNGE.poly.map(p=>Math.hypot(p[0]-PLUNGE.x,p[1]-PLUNGE.z));
function plungeRim(x,z,h){const dx=x-PLUNGE.x,dz=z-PLUNGE.z,dl=Math.hypot(dx,dz);if(dl>1300||h>PLUNGE.level+3)return 0;
 const k=((Math.round(Math.atan2(dz,dx)/TAU*PL_R.length)%PL_R.length)+PL_R.length)%PL_R.length,dr=dl-PL_R[k];return dr<-2?0:(1-smooth(15,55,dr))*.45;}
function fieldsAt(x,z,h,slope){const s=SC.sample(x,z,h,SS),wd=waterH(x,z),near=wd>-1e8&&h-wd<3?1:0;
 const dl=Math.hypot(x-PLUNGE.x,z-PLUNGE.z),L=SC.locate(x,z,LOC),ad=L.k<0?1e9:Math.abs(L.d);
 // rain: the plateau steppe's ~420 mm; the coulee's floor a little damper (shade, runoff); the water's margins wet
 let wet=.22+.03*smooth(FLOOR.half+300,FLOOR.half,ad);wet=Math.max(wet,near*.9,smooth(260,40,dl-0)*.7*(PLUNGE.level+12>h?1:0));
 const flow=0,scour=s.scour*(1-s.island),bar=s.bar*(1-s.island);
 const rock=clamp(Math.max(smooth(.38,.7,slope)*.9,scour*(1-bar*.8)*.75),0,1);
 const canyon=smooth(FLOOR.half-50,FLOOR.half+120,ad)*smooth(FLOOR.half+500,FLOOR.half+220,ad);
 return{wet:clamp(wet,0,1),flow,upland:clamp((h-650)/800,0,1),canyon,rim:0,rock,dune:0,oasis:0,slope,abyss:0,
  salt:plungeRim(x,z,h),cold:clamp((h-900)/2600,0,1),bed:0,silt:s.pool*.5,strand:0,ring:0,shore:0,band:0,
  scour,bar,island:s.island,ripple:s.ripple,dry:0};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','bed','silt','strand','ring','shore','band','scour','bar','island','ripple','dry'];
const FC=(function(){const N=420,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
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

// ---------------------------------------------------------------- the erratics (records; drawn by 87-host-erratics.js)
// What the flood carried kilometres and dropped where its current slackened: the dam's broken concrete (blocks and slabs
// of its face, rebar torn out of their broken sides) and the flood basalt's own boulders. Cell-seeded on core/rand (a
// cell's pieces are a hash of the seed, the cell and an index), thickest on the bars and in the falls' basin, thinner
// on the scoured floor, none in the water or up on the plateau; each sunk a fifth to a third of its height in the gravel
const ERRATICS=(function(){const out=[],C=140,R=TERR.R-150,S={},u=(h,k)=>KRAND.unit(KRAND.hash(h,k)),lr=(a,b,t)=>a+(b-a)*t;
 for(let j=Math.floor(-R/C);j<=Math.floor(R/C);j++)for(let i=Math.floor(-R/C);i<=Math.floor(R/C);i++)for(let n=0;n<2;n++){const h=KRAND.hash(7717,i,j,n);
  const x=(i+u(h,1))*C,z=(j+u(h,2))*C;if(Math.abs(x)>R||Math.abs(z)>R)continue;const L=SC.locate(x,z,LOC);if(L.k<0||Math.abs(L.d)>FLOOR.half-30)continue;
  const g=terrainH(x,z),q=SC.sample(x,z,g,S),p=.05+.3*q.bar+.3*q.pool+.08*q.scour;if(!(u(h,3)<p)||q.island>.3||waterH(x,z)>-1e8)continue;
  const block=u(h,4)<.7,slab=block&&u(h,5)<.3,sx=block?lr(2.5,7,u(h,6)):lr(2,6,u(h,6)),sz=sx*lr(.55,1,u(h,7)),sy=slab?lr(.8,1.5,u(h,8)):block?lr(1.5,4,u(h,8)):sx*lr(.55,.8,u(h,8));
  out.push({id:'erratic:'+i+':'+j+':'+n,kind:block?(slab?'slab':'block'):'boulder',x,z,y:g-sy*lr(.18,.33,u(h,9)),sx,sy,sz,
   yaw:u(h,10)*TAU,pitch:lr(-.3,.3,u(h,11)),roll:lr(-.3,.3,u(h,12)),bars:block?3+Math.floor(u(h,13)*7):0,seed:h});}
 return out;})();
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
for(const e of ERRATICS)OBSTACLES.push({x:e.x,z:e.z,r:Math.max(e.sx,e.sz)*.6+.5});
// the LOD spine: down the coulee, the falls and its lake, the rims
const SPINE=[];for(let s=0;s<=SC.courses[0].len;s+=700){const L=SC.courses[0];let k=1;while(k<L.cum.length-1&&L.cum[k]<s)k++;const a=L.pts[k-1],b=L.pts[k],t=(s-L.cum[k-1])/((L.cum[k]-L.cum[k-1])||1);SPINE.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
SPINE.push([FALL.x,FALL.z],[PLUNGE.x,PLUNGE.z],[FALL.x-1300,FALL.z+200],[FALL.x+1300,FALL.z-300]);
BIO.init({tags:'scablands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:17,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:400,mid:1000,far:2600,floor:[360,880]},
 windows:{water:[-TERR.R,-TERR.R,TERR.R,TERR.R]}});
BIO.setSun([-1000,1150,-560]);
const WIND=[1,.3];   // the prevailing wind (n semiarid's: NSEMIARID.setWind in 88-host-build)
// THE OVERLAY'S TINT over the kit's palette (45c-host-ground.js): the rock the flood laid bare, by the strata: the flows'
// dark basalt (the columns darker than the entablature over them), their red interbeds, buff sandstone at the foot; the
// bars' grey gravel; a white alkali rim round the plunge lake
const SC_TINT=(function(){const K=h=>new THREE.Color(h),COL=K(0x3a3430),ENT=K(0x4e4740),ENT2=K(0x5c544a),RED=K(0x7a4a36),SAND=K(0xb09a74),
 GRAVEL=K(0x8a8478),GRAVEL2=K(0x9e978a),CREST=K(0xbab2a2),TROUGH=K(0x6a645a),ALK=K(0xe6e0d2),t=new THREE.Color(),R={};
 return function(c,F,wx,wz,n){const h=FC.at(FC.a.h,wx,wz),r=SC.rock(h,R),rock=F('rock'),sc=F('scour'),bar=F('bar'),k=clamp(smooth(.3,.8,rock)*.9+sc*.35,0,.94);
  // the strata show in the faces; a flat floor is what the flood left on it: a flow's dark top (the red interbed
  // stripped) above the basalt's base, the flood's gravel below it (the sandstone shows only in the cliffs)
  const face=smooth(.3,.55,F('slope'));let kind=r.kind;if(face<.5){if(kind==='interbed')kind='basalt';else if(kind==='sandstone'||kind==='limestone')kind='floor';}
  if(k>0||kind==='floor'){t.copy(kind==='interbed'?RED:kind==='sandstone'||kind==='limestone'?SAND:kind==='floor'?GRAVEL:kind==='cover'?ENT2:r.colonnade>.5&&face>.5?COL:ENT);
   if(kind==='basalt')t.lerp(ENT2,clamp(.5+n*2,0,1)*.4);c.lerp(t,(kind==='floor'?.7:k)*(1-bar*.75));}
  if(bar>.05){t.copy(GRAVEL).lerp(GRAVEL2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.05,.5,bar)*.85);
   // the giant current ripples: their crests light, their troughs dark (2 to 6 m of relief over ~90 m reads faintly)
   const rp=F('ripple'),b=smooth(.1,.5,bar);c.lerp(CREST,rp*b*.55);c.lerp(TROUGH,(1-rp)*b*.3);}
  const salt=F('salt');if(salt>.02)c.lerp(ALK,smooth(.02,.3,salt)*.8);};})();
const STAGE_GROUND={N:640,label:'The scablands: the west coulee',region:'The scablands: a coulee and dry falls on the west breach (in small)',rows:null,tint:SC_TINT};
// ---------------------------------------------------------------- the inspector's volumes
REGISTER({name:'The dry falls (a horseshoe cliff of flood basalt, '+FLOOR.drop+' m)',x:FALL.x,z:FALL.z,y:FLOOR.top-FLOOR.k*FALL.s-FLOOR.drop-40,r:FALL.r*1.2,h:FLOOR.drop+80});
REGISTER({name:'The plunge-pool lake under the dry falls',x:PLUNGE.x,z:PLUNGE.z,y:PLUNGE.level-30,r:600,h:50});
for(const e of ERRATICS)REGISTER({name:e.kind==='boulder'?'An erratic: a basalt boulder the flood rolled here':'An erratic: the dam\'s broken concrete, carried kilometres ('+e.kind+', rebar torn out of it)',x:e.x,z:e.z,y:e.y-1,r:Math.max(e.sx,e.sz)*.75,h:e.sy+3});
// (each pothole's water names itself: its mesh's inspectLabel; a volume round a water mesh reads empty to the probe)
