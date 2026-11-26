// ================================================================= HOST — Fleetborn Cove stage binding & Arcoforte/shipyard terrain grading
// Runs immediately after biomes/arch/src/45-host-stage.js (read in place) and before 84-host-ground.js:
// 1. Sets window.ARCOFORTE_OPTS = { noTerrain: true, state: 'marginal', socket: { bastions: 'fleetborn', ring: 'fleetborn', harbour: 'shorekin' } }.
// 2. Wraps L.land, L.TREE_KEEP, and L.INTERTIDAL with FCOVE_LAYOUT.groundAt & FCOVE_LAYOUT.inReserve so Arcoforte's 576 m plateau/park/harbour
//    and the sheltered SSE drydock/port/tide-mill apron sit cleanly on graded rock with zero cliff clipping and zero wild trees inside the ruin.
// 3. Refreshes the FC climate/height raster over the graded area so KGROUND paints accurate rock, wet-band and laterite layers.
window.ARCOFORTE_OPTS=Object.assign({
 noTerrain:true,
 state:'marginal',
 socket:{bastions:'fleetborn',ring:'fleetborn',harbour:'shorekin'}
},window.ARCOFORTE_OPTS||{});

const FCOVE_RULES=FCOVE_TIDE.create(KTIDE_DATA,{ktide:KTIDE});

(function bindFcoveTerrainAndKeepClear(){
 const rawLand=L.land;
 const rawTreeKeep=L.TREE_KEEP;
 const rawIntertidal=L.INTERTIDAL;
 const afGround=(lx,lz)=>ARCOFORTE.groundAt(null,lx,lz);

 L.rawLand=rawLand;
 L.land=function fcoveLand(x,z){
  return FCOVE_LAYOUT.groundAt(x,z,rawLand(x,z),afGround);
 };
 L.TREE_KEEP=function fcoveTreeKeep(x,z){
  if(FCOVE_LAYOUT.inReserve(x,z))return 0;
  return rawTreeKeep?rawTreeKeep(x,z):1;
 };
 L.INTERTIDAL=function fcoveIntertidal(x,z){
  if(FCOVE_LAYOUT.inReserve(x,z))return 0;
  return rawIntertidal?rawIntertidal(x,z):0;
 };
 L.PROW.x=FCOVE_LAYOUT.arcoforte.x;
 L.PROW.z=FCOVE_LAYOUT.arcoforte.z;
 L.PROW.r=320;
 L.PROW.clearR=315;
 L.PROW.footprint=FCOVE_LAYOUT.arcoforte.footprint;

 /* Clear single-point terrainH cache and refresh FC field grid over the graded site */
 _tm.x=NaN;_tm.z=NaN;
 const N=FC.N,S=FC.S,cs=S/(N-1);
 for(let j=0;j<N;j++){
  const z=(j/(N-1)-0.5)*S;
  for(let i=0;i<N;i++){
   const x=(i/(N-1)-0.5)*S;
   FC.a.h[j*N+i]=terrainH(x,z);
  }
 }
 for(let j=0;j<N;j++){
  const z=(j/(N-1)-0.5)*S;
  for(let i=0;i<N;i++){
   const x=(i/(N-1)-0.5)*S,k=j*N+i;
   const hx=FC.a.h[j*N+Math.min(N-1,i+1)]-FC.a.h[j*N+Math.max(0,i-1)];
   const hz=FC.a.h[Math.min(N-1,j+1)*N+i]-FC.a.h[Math.max(0,j-1)*N+i];
   const slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
   const F=fieldsAt(x,z,FC.a.h[k],slope);
   FNAMES.forEach(n=>{FC.a[n][k]=F[n];});
  }
 }

 /* Register keep-clear circles in BIO's OBSTACLES list so neither scatter nor shrubs encroach on Arcoforte or the shipyard */
 OBSTACLES.push({x:FCOVE_LAYOUT.arcoforte.x,z:FCOVE_LAYOUT.arcoforte.z,r:325});
 const pLin=FCOVE_LAYOUT.arcoforte.toWorld(0,84,340);
 OBSTACLES.push({x:pLin[0],z:pLin[2],r:155});
 const pHarb=FCOVE_LAYOUT.arcoforte.toWorld(0,6,-260);
 OBSTACLES.push({x:pHarb[0],z:pHarb[2],r:135});
 for(let s=20;s<=500;s+=95){
  const pq=FCOVE_LAYOUT.XZ(s,FCOVE_LAYOUT.quayA(s)+55);
  OBSTACLES.push({x:pq[0],z:pq[1],r:115});
 }
})();
