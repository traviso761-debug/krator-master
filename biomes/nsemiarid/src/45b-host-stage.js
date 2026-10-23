// ================================================================= HOST — stage (n semiarid: a transect of the north basin)
// The ideal-type host for the N SEMIARID kit: everything a world provides that a biome does not. Renderer, lights, haze,
// the terrain with terrainH(), the local water surface waterH() (the remnant salt lake, the stream from the uplands, a
// spring pool), the climate fields the kit asks for, the painted ground, the tick list, the error panel. A real world
// (openworld/north-basin, to come) replaces this whole section with its own; the kit's fragments never read anything
// from it except through BIO.host.
//
// THE MAP (x east, z south, north is -z; origin mid-plain, R 3400). One transect of the region compressed into 6.8 km,
// so every zone of the kit stands somewhere a camera can reach (biomes/nsemiarid/PLAN.md, sections 1, 2, 7):
//   z < -900          THE OLD LAKE BED: a basin round BED (-700,-2500) falling from the plain's edge (~680 m) to a
//                     remnant salt lake at 380 m (the west lobe's in small). Its marks are core/terrain's KBASIN's: the
//                     old full level (640 m) with its beach ridge and bathtub ring, the fast drain down to the sill
//                     (560 m), and the strandlines of the slow recession down to the water; salt rising toward the
//                     lake, a dune field on its downwind (east) shore. The lowland desert (BWh)
//   -900 < z < 700    THE STEPPE: the hot steppe (BSh), 680-760 m, gently swelling
//   700 < z < 1900    THE FOOTHILLS: the Mediterranean belt (Csa), 780-1150 m, basalt ridges, a spring pool
//   z > 1900          THE UPLAND: the rainy plateau (Cfa), 1200-1450 m, the feral fruit forest
//   the STREAM        from the upland north down the transect into the lake; golden poplar where it reaches the bed
//                     (the tropical lake margins: warm, low and wet)
// The fields are the host's own (this is a showcase): wet from rain rising southward and from the stream and the lake;
// cold from height (a little, all of it warm); salt, bed, silt and strand from KBASIN; rock from the slope and the
// basalt ridges; dune on the lake's lee shore.
// ---------------------------------------------------------------- the land
const TERR={R:3400};
const BED={x:-700,z:-2500,r:2300};            // the old lake's basin
const LAKE={level:380,full:640,sill:560,ring:30};
const POOL={x:900,z:1350,r:38};                // the spring pool in the foothills
// the stream's centreline (x of z) from the upland down to the lake, and its channel
function xS(z){return 260+260*Math.sin(z*.0011+.6)+80*Math.sin(z*.0037)-300*smooth(-200,-1600,z);}
const SW=7;                                     // the stream's half-width (m)
function bedR(x,z){const dx=x-BED.x,dz=(z-BED.z)*1.15,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)*(1+.08*Math.sin(3*a+1)+.05*Math.sin(5*a));}
// the land without the basin's marks or the stream: a plain swelling south into foothills and the upland plateau
function baseH(x,z){
 const plain=700+30*(fbm(x*.0008+3,z*.0008-1,17,3)-.5)*2+.012*z;
 const foot=smooth(700,1900,z),up=smooth(1700,2600,z);
 let h=plain+foot*360*(.85+.3*(fbm(x*.0013-5,z*.0013+2,19,3)-.5))+up*260;
 // basalt ridges in the foothills: long benched spurs running north
 const rd=1-Math.abs(2*fbm(x*.0021+7,z*.0009-3,23,3)-1);h+=foot*(1-up*.6)*smooth(.55,.9,rd)*90;
 // the old lake's bowl: from the plain's edge down to its floor
 const r=bedR(x,z),bowl=smooth(BED.r*1.05,BED.r*.25,r);h=mix(h,LAKE.level-50+20*(fbm(x*.002,z*.002,29,2)-.5),bowl);
 // the dune field on the lake's lee (east) shore: lunettes and barchans
 const dk=duneK(x,z);if(dk>0)h+=dk*(9*Math.pow(1-Math.abs(2*fbm(x*.011+z*.003,z*.006,41,2)-1),1.6)+3);
 return h;}
function duneK(x,z){const dx=x-(BED.x+1200),dz=z-(BED.z+300);return smooth(1300,600,Math.hypot(dx*.8,dz*1.2))*smooth(.4,.6,fbm(x*.002+4,z*.002,43,2));}
// the old lake's marks (core/terrain/40-core-basin.js): the full level, the ring, the drain band, the strandlines
const bedMember=(x,z)=>smooth(BED.r*1.15,BED.r*.95,bedR(x,z));
const BASIN=KBASIN.create({seed:41,wind:[1,.3],strand:{a:.5},lakes:[{name:'the old lake',kind:'dam',level:LAKE.full,sill:LAKE.sill,ring:LAKE.ring,remnant:LAKE.level,member:bedMember}]});
function landH(x,z){const h=baseH(x,z);return bedMember(x,z)>0?BASIN.land(x,z,h):h;}
// the stream: a bed that never climbs downstream (north, toward the lake), sampled along z once. Walked from the upland
// north, the bed is the lowest the land has been since: where the land dips the bed follows it down, where it rises again
// (a strandline's bench, a dune's foot) the stream cuts a trench through it, never a bridge over it (2026-10-22: it took
// the highest ground north of it instead, and the water floated over every hollow). cut is how deep the trench is.
const SB=(function(){const z0=-TERR.R*1.15,z1=TERR.R*1.15,dz=10,n=Math.round((z1-z0)/dz),a=new Float32Array(n+1),cut=new Float32Array(n+1);
 for(let i=0;i<=n;i++){const z=z0+i*dz;a[i]=landH(xS(z),z)-1.6;}
 for(let i=n-1;i>=0;i--){const g=a[i];a[i]=Math.min(g,a[i+1]);cut[i]=g-a[i];}
 const at=(A,z)=>{const f=clamp((z-z0)/dz,0,n-.001),i=Math.floor(f);return lerp(A[i],A[i+1],f-i);};
 return{z0,dz,n,a,cut,at:z=>at(a,z),cutAt:z=>at(cut,z)};})();
const streamD=(x,z)=>Math.abs(x-xS(z));
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);
 // the channel: a bowl under the water (0.9 m deep at the middle, its banks over the water by the ribbon's edge), cut down
 // where the land stands higher and built up where it falls away across the stream, so the water always sits in it;
 // its sides widen with the trench's depth
 const d=streamD(x,z);if(d<60+SW*2){const ct=SB.cutAt(z),bw=SW*4+ct*2.2;if(d<bw){const t=SB.at(z)-.4+1.3*(d/SW)*(d/SW);
  h=mix(t,Math.min(h,t),smooth(SW*1.3,bw,d));}}
 const pd=Math.hypot(x-POOL.x,z-POOL.z);if(pd<POOL.r*2){h=mix(h,POOL.lv-1.6,smooth(POOL.r*1.6,POOL.r*.4,pd));}
 return h;}
POOL.lv=(function(){let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,landH(POOL.x+Math.cos(a)*POOL.r*1.2,POOL.z+Math.sin(a)*POOL.r*1.2));}return lo-.6;})();
// THE WATER is core/water's (core/water/README.md): the remnant salt lake and the spring pool are STILL water, the stream
// a FLOW down its bed into the lake. These records are the water's one truth: waterH below answers from them, so every
// plant kept out of the water and every seed kept above it agrees with what 89b-host-atmos.js draws from them.
// the lake's shore: rays from the bed's middle out to where the land rises over the level (a few metres more, so the
// flat water runs under the bank instead of stopping short of it); never past .62 of the bed
const LAKE_POLY=(function(){const P=[],N=96;for(let k=0;k<N;k++){const a=k/N*TAU,cx=Math.cos(a),cz=Math.sin(a);let r=20,last=20;
  for(;r<BED.r*1.2;r+=8){const x=BED.x+cx*r,z=BED.z+cz*r;if(bedR(x,z)>BED.r*.62)break;if(landH(x,z)>LAKE.level+.5)break;last=r;}
  P.push([BED.x+cx*(last+6),BED.z+cz*(last+6)]);}return P;})();
const LAKE_W=WATER.still({name:'The remnant salt lake',level:LAKE.level,poly:LAKE_POLY});
const POOL_W=WATER.still({name:'The spring pool',level:POOL.lv,poly:Array.from({length:32},(_,k)=>[POOL.x+Math.cos(k/32*TAU)*POOL.r*1.3,POOL.z+Math.sin(k/32*TAU)*POOL.r*1.3])});
// the stream: from the upland's edge north, 10 m a step, on the bed (never below the lake it runs into), until it is in it
const STREAM_PTS=(function(){const P=[];for(let z=TERR.R*1.1;z>-TERR.R*1.15;z-=10){const x=xS(z),y=Math.max(SB.at(z)+.5,LAKE.level);P.push([x,z,y]);if(LAKE_W.contains(x,z))break;}return P;})();
const STREAM=WATER.flow({name:'The stream',pts:STREAM_PTS,width:SW*2,speed:STREAM_PTS.map((p,i)=>{const q=STREAM_PTS[Math.min(i+1,STREAM_PTS.length-1)];return clamp(.5+(p[2]-q[2])*.6,.4,2.2);})});
// what 89b-host-atmos.js draws of them, and how (colours sRGB; the rest core/water's draw options). The stream is narrow
// (14 m): core/water's bank foam, sized for rivers, whitened most of it; this stage's share is less
const STAGE_WATER=[
 {key:'lake',rec:LAKE_W,look:{color:0x4a8e86,roughness:.1,metalness:.05,envMapIntensity:.45,opacity:.72,renderOrder:1}},
 {key:'pool',rec:POOL_W,look:{color:0x2a6a6c,roughness:.08,metalness:.05,envMapIntensity:.4,renderOrder:1}},
 {key:'stream',rec:STREAM,flow:true,look:{shallow:0x4e8478,deep:0x24564e,color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.5,step:8,across:4,margin:1.5}}];
WATER.PRESETS.flow.foam=[.5,.2];
// the cheap tests only skip what cannot be wet; what can is asked of the record (core/water's order: still before flow)
function waterH(x,z){if(bedR(x,z)<BED.r*.66&&LAKE_W.contains(x,z))return LAKE.level;
 if(Math.abs(x-POOL.x)<POOL.r*1.4&&Math.abs(z-POOL.z)<POOL.r*1.4&&POOL_W.contains(x,z))return POOL.lv;
 if(streamD(x,z)<SW*1.6&&STREAM.contains(x,z))return STREAM.heightAt(x,z);
 return -1e9;}

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
const BS={};
function fieldsAt(x,z,h,slope){const sd=streamD(x,z),wd=waterH(x,z),near=wd>-1e8&&h-wd<3?1:0;
 const B=BASIN.sample(x,z,h,BS),r=bedR(x,z);
 // rain: the steppe's ~400 mm on the plain, ~250 on the bed, ~700 in the foothills, ~1,300 on the upland (wet ~ rain/1800)
 let wet=.2+.18*smooth(600,1900,z)+.32*smooth(1700,2600,z)-.08*smooth(BED.r*1.1,BED.r*.6,r);
 const nearS=smooth(70,8,sd);wet=Math.max(wet,nearS*.85,near*.9,smooth(BED.r*.7,BED.r*.55,r)*smooth(LAKE.level+25,LAKE.level+3,h)*.85);
 const flow=Math.max(smooth(40,6,sd),smooth(POOL.r*2.4,POOL.r*1.1,Math.hypot(x-POOL.x,z-POOL.z))*.9)*(wd>-1e8&&h-wd>4?.4:1);
 const ridge=smooth(.55,.9,1-Math.abs(2*fbm(x*.0021+7,z*.0009-3,23,3)-1))*smooth(700,1900,z);
 const rock=clamp(Math.max(smooth(.38,.7,slope)*.9,ridge*smooth(.25,.45,slope)*.8),0,1);
 return{wet:clamp(wet,0,1),flow:clamp(flow,0,1),upland:clamp((h-650)/800,0,1),canyon:0,rim:0,rock,dune:duneK(x,z),oasis:0,slope,abyss:0,
  salt:B.salt,cold:clamp((h-900)/2600,0,1),bed:B.bed,silt:B.silt,strand:B.strand,ring:B.ring,shore:B.shore,band:B.band,scour:0,dry:B.dry/1000};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','bed','silt','strand','ring','shore','band','scour','dry'];
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

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the transect's showplaces, the lake shore to the upland, along the stream
const SPINE=[[BED.x+300,BED.z+900],[BED.x-600,BED.z+1200],[BED.x+1100,BED.z+300],[BED.x+400,BED.z-200]];
for(let z=-1700;z<=3000;z+=600)SPINE.push([xS(z),z]);
SPINE.push([-1600,-300],[1500,-200],[-1400,1200],[POOL.x,POOL.z],[1700,1500],[-1200,2600],[1400,2700]);
BIO.init({tags:'nsemiarid',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:17,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:400,mid:1000,far:2600,floor:[360,880]},
 windows:{water:[-TERR.R,-TERR.R,TERR.R,TERR.R]}});
BIO.setSun([-1000,1150,-560]);
const WIND=[1,.3];   // the prevailing wind this stage binds (NSEMIARID.setWind in 88-host-build: the kit loads after the stage)
// the painted ground (45c-host-ground.js): this stage's mesh and the stream it snaps to
const STAGE_GROUND={N:560,label:'The northern semiarid country',region:'The northern semiarid country (ideal type)',tint:null,
 rows:{z0:STREAM_PTS[STREAM_PTS.length-1][1],z1:STREAM_PTS[0][1],x:xS,knots:[0,6.5,17]}};
// ---------------------------------------------------------------- the water
// drawn by core/water in 89b-host-atmos.js (it needs core/atmos's clock, wave chunk and sky light, bound there); here the
// volumes the inspector names
REGISTER({name:'The old lake bed (the west lobe in small)',x:BED.x,z:BED.z,y:LAKE.level-60,r:BED.r,h:LAKE.full-LAKE.level+120});
REGISTER({name:'The spring pool',x:POOL.x,z:POOL.z,y:POOL.lv-10,r:POOL.r*5,h:60});

