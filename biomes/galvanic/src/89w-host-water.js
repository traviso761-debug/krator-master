// ================================================================= HOST — the water (core/water; PLAN.md section 6; taken from biomes/highrift's)
// The sea and the Deep are WATER.open surfaces over the ground's bed with NO surf and NO breakers (the owner's rule for still water, 2026-11-02), in the
// `brine` look (ext/54: red-brown deep, turquoise shallows, the white of the salt at the rim). The acid streams are WATER.flow in the kit's own `acid`
// look (GALV.LOOKS.acid, data: core/water's look functions take an object), each split where its pH crosses 2.8: wine-red above, orange below. Their iron
// terraces are WATER.terraces (ext 53, drawn by 53b) on the treads the stage carved (STREAMS[i].T). The mounds' acid springs are WATER.spring (52).
// CPU twins: WATER.heightAt, WATER.flowAt; BIO.waterH is the stage's.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6e5444)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const SWELL=[[.010,5,35,0,.015],[.006,3,-50,1.3,.015]];
function maskOf(box,cell,fn){const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(fn(box[0]+(i+.5)*cell,box[1]+(j+.5)*cell))d[j*nx+i]=255;return{x0:box[0],z0:box[1],cell,nx,nz,data:d};}
const SPRING_MATS=new Map(),SPRING_MESH=[];
// THE ACID LOOK (data: GALV_PHYS.colourAt's ramp as a core/water look; t 0 is the deep end of the ramp, 1 the rim): wine-red to orange to rust
GALV.LOOKS={acid:{stops:[[0,'#5a1014'],[.4,'#7e2018'],[.75,'#a63c1a'],[1,'#c0601e']],deep:1.2,clarity:.35,roughness:.12,opacity:.95},
 ochre:{stops:[[0,'#8a3a14'],[.5,'#b4581e'],[1,'#d08a3a']],deep:.6,clarity:.25,roughness:.14,opacity:.92}};
const hexOf=n=>'#'+('000000'+n.toString(16)).slice(-6);
let BIGW=null,BIG_DRAW=null;const W_OUT={flows:0,terraces:0,springs:0};
// THE SEA: the eastern terminal sea at the season's level, its shore wherever the strand falls under it
{const BOX=[-TERR.R*1.1,-200,TERR.R*1.1,TERR.R*1.1];
 BIGW=WATER.open({name:'The eastern terminal sea',level:SEA_LEVEL,swell:SWELL,field:0,bounds:BOX,bed:terrainH,bedCell:8,
  mask:maskOf(BOX,8,(x,z)=>terrainH(x,z)<SEA_LEVEL+.05&&Math.hypot(x-DP.x,z-DP.z)>DP.r*1.02)});
 BIG_DRAW=WATER.draw(BIGW,WATER.lookDraw('brine','open',{surf:false,breakers:false,renderOrder:1,metalness:.05,envMapIntensity:.5,shallow:lin(WATER.lookHex('brine',.7)),deep:lin(WATER.lookHex('brine',.2))}));
 WATER.withLook(BIGW,'brine');BIG_DRAW.mesh.userData.inspectLabel='The eastern terminal sea (brine; at '+SEA_LEVEL.toFixed(2)+' m on day '+DAY+')';}
// THE DEEP: the vent's crater full of hot metal brine to the sea's level (the Atlantis II Deep's kind), dark and still
{const BOX=[DP.x-DP.r-20,DP.z-DP.r-20,DP.x+DP.r+20,DP.z+DP.r+20];
 const DW=WATER.open({name:'The Deep',level:SEA_LEVEL,swell:[[.004,4,20,0,.01]],field:0,bounds:BOX,bed:terrainH,bedCell:8,mask:maskOf(BOX,8,(x,z)=>Math.hypot(x-DP.x,z-DP.z)<DP.r)});
 const D=WATER.draw(DW,WATER.lookDraw('brine','open',{surf:false,breakers:false,renderOrder:1,metalness:.05,envMapIntensity:.45,shallow:lin(WATER.lookHex('brine',.5)),deep:lin(WATER.lookHex('brine',0))}));
 WATER.withLook(DW,'brine');D.mesh.userData.inspectLabel='The Deep (hot metal brine, ~60 degC; its floor 100 m down)';W_OUT.deep=true;}
// THE STREAMS: wine-red from the spring to where the pH crosses 2.8, then the terraces' orange; none under the sea
STREAMS.forEach(S=>{const pts=[],step=8,end=S.T.length?S.T[0].s0:S.F.L;
 for(let s=0;s<=end+1e-6;s+=step){const p=S.F.point(Math.min(s,end)),y=S.bed0(Math.min(s,end))+.3;if(y<=SEA_LEVEL+.02)break;pts.push([p[0],p[1],y]);}
 if(pts.length>2){const F=WATER.flow({name:S.name,pts,width:S.w-.6,speed:.6,rapids:[.005,.02]});
  const Dr=WATER.drawFlow(F,WATER.lookDraw(GALV.LOOKS.acid,'flow',{shallow:lin(WATER.lookHex(GALV.LOOKS.acid,.8)),deep:lin(WATER.lookHex(GALV.LOOKS.acid,.2)),color:0xffffff,metalness:.05,envMapIntensity:.35,step:6,across:4,margin:.6,depthBias:2,renderOrder:2,pick:true}));
  WATER.withLook(F,GALV.LOOKS.acid);Dr.mesh.userData.inspectLabel=S.name+' (pH '+S.pH0.toFixed(1)+' at the spring: wine-red)';W_OUT.flows++;}
 // the iron terraces: the stage's treads as WATER.terraces, each a shallow orange pool behind a rim of ochre
 const T=S.T.filter(t=>t.y>SEA_LEVEL+.02);
 if(T.length>1){const line=[];for(let s=T[0].s0;s<=T[T.length-1].s1+1e-6;s+=6)line.push(S.F.point(s));
  const TR=WATER.terraces({name:S.name+': the iron terraces',line,treads:T.map(t=>({s0:t.s0-T[0].s0,s1:t.s1-T[0].s0,y:t.y,w:t.w})),speed:.5,spread:2});
  WATER.drawTerraces(TR,{pool:{color:0xffffff,roughness:.12,metalness:.04,envMapIntensity:.4,renderOrder:1,gradient:{centre:lin(WATER.lookHex(GALV.LOOKS.acid,.55)).getHex(),rim:lin(WATER.lookHex(GALV.LOOKS.ochre,.55)).getHex(),power:1}},
   fall:{color:lin(0xb4581e),opacity:.7,rowStep:1,cols:6,spray:false,plungeR:2,renderOrder:3}});
  W_OUT.terraces+=TR.pools.length;}});
// THE MOUNDS' ACID SPRINGS: a small pool at the foot of each, where its stream begins (or a seep where none does)
MOUNDS.forEach((M,i)=>{const a=-.9+i*.7,x=M.x+Math.cos(a)*M.r*1.1,z=M.z+Math.sin(a)*M.r*1.1,y=terrainH(x,z);if(y<SEA_LEVEL+.05)return;
 const S=WATER.spring({key:'gvspring'+i,name:'An acid spring (pH ~2; iron, zinc and copper)',x,z,r:3+M.r*.04,level:y+.08,temp:.5,mineral:'iron',milky:.2,boil:0,steam:0});
 const d=WATER.drawSpring(S,{THREE,scene,fog:scene.fog,mats:SPRING_MATS,renderOrder:1});d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel='An acid spring (it rises once a day with the tidal pump)';SPRING_MESH.push(d.mesh);W_OUT.springs++;});
// THE TIDAL PUMP (GALV_PHYS.tide; the owner, 2026-11-12): once a sidereal day, at the top of the giant's nod, the strand's cracked ore gapes and the
// mounds' springs rise as the fresh acid is pushed through (up to 8 cm); window._tide carries the pump, its hour and the strand's current
const TIDE_RISE=.08;window._tide={pump:0,peakHour:null};
/* the world's time in days (the sky's own: ATMOS.skyState reads the same clock's day and hour) */
const WORLD_T=()=>{const C=typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;return C?(C.day||0)+C.hour/24:SKY_HOUR0/24;},SKY_HOUR0=ATMOS.SKY&&ATMOS.SKY.viewHour!=null?ATMOS.SKY.viewHour:13;
tick(()=>{const t=WORLD_T(),lib=ATMOS.libration?ATMOS.libration(t):t,p=GALV_PHYS.tide(lib);
 for(const m of SPRING_MESH)m.position.y=TIDE_RISE*p;window._tide.pump=p;window._tide.t=t;window._tide.peakHour=GALV_PHYS.pumpHour(Math.floor(t));});
W_OUT.sea=SEA_LEVEL;window._water=W_OUT;
