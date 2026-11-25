// ================================================================= HOST — the strand pandanus on the isle's beaches (2026-11-24; EXCHANGES.md, ringisles -> throne)
// The Ring Sea isles' strand pandanus (biomes/ringisles, read in place: 48p1-48p9), its fruit drifted here on the sea: a ringed trunk on
// prop roots leaning out over the sand at the high-tide line, a little above the wrack and below the coconuts' strip (47's fields:
// sand, beach, wrack). Seeded per cell (core/rand), clear of the Throne's trees, the camp, the path and the landing's canoes. Called
// by 89z after THRONE.build, before the one bake. ?pandan=0 none
const PANDAN={n:0,trees:[]};
function plantPandan(){if(typeof RINGISLES==='undefined'||!RINGISLES.treeAt||new URLSearchParams(location.search).get('pandan')==='0')return PANDAN;
 const W=4840,cell=14,R=TERR.R-150,N=Math.ceil(R/cell),salt=0x9a4d,near=[];
 for(const T of THRONE.TREES)near.push(T);
 const clearOfTrees=(x,z,r)=>{for(const T of near)if(Math.abs(T.x-x)<r+8&&Math.abs(T.z-z)<r+8&&Math.hypot(T.x-x,T.z-z)<r+(T.crownR==null?3:T.crownR)*.5)return false;return true;};
 for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
  const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
  if(Math.hypot(x-DOME.cx,z-DOME.cz)>R)continue;
  const y=terrainH(x,z),ab=y-SEA;if(ab<1.3||ab>3.4)continue;
  const beach=FIELD.beach(x,z),sand=FIELD.sand(x,z);if(Math.max(beach,sand)<.3||FIELD.wrack(x,z)>.4||FIELD.path(x,z)>.2||FIELD.camp(x,z)>.1||FIELD.rock(x,z)>.5||FIELD.slope(x,z)>.35)continue;
  if(u(3)>.55)continue;   /* in clumps and gaps along the strand, not a hedge */
  if(waterH(x,z)>y-.2||!BIO.clearOf(x,z,3)||!clearOfTrees(x,z,4))continue;
  /* lean out over the sand, toward the water (down the slope) */
  const e=3,gx=terrainH(x+e,z)-terrainH(x-e,z),gz=terrainH(x,z+e)-terrainH(x,z-e),leanA=gx||gz?Math.atan2(-gz,-gx):Math.atan2(z-DOME.cz,x-DOME.cx);
  const T=RINGISLES.treeAt('strandpandan',x,y,z,{seed:h,leanA});if(!T)continue;
  const cr=T.crownR==null?3:T.crownR;near.push({x,z,crownR:cr});PANDAN.trees.push({x,z,y0:T.y0,H:T.H,crownR:T.crownR,lv:T.lv});PANDAN.n++;
  REGISTER({name:'Strand pandanus (the Ring Sea isles\' screw pine, its fruit drifted here)',key:'strandpandan',kind:'tree',x,z,y:T.y0,r:cr,h:T.H==null?6:T.H,tags:{borrowed:true,from:'biomes/ringisles'}});}
 return PANDAN;}
