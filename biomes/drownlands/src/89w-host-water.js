/* ==================== HOST — water: turquoise shoals -> indigo trenches, milky brucite pools & tidal guts (core/water) ==================== */
/* Enforces strict z-fighting separation (PLAN.md section 7.3 invariant 5):
   - Every perched WATER.still milky brucite pool disc sits at +0.32..+0.42 m (>= 0.32 m above WATER.open mean tide 0.0 m
     and >= 0.22 m below its +0.54..+0.66 m sinter rim), while WATER.open masks out brucite basins and flow chutes.
   - WATER.mirrorSwitch stays off at load. */

{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x466664)});
}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();

function maskOf(box,cell,fn){
 const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  if(fn(box[0]+(i+0.5)*cell,box[1]+(j+0.5)*cell))d[j*nx+i]=255;
 }
 return{x0:box[0],z0:box[1],cell,nx,nz,data:d};
}

function discPoly(cx,cz,r,n){
 const pts=[];
 for(let i=0;i<n;i++){const a=i/n*TAU;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 return pts;
}

function ribbon(name,pts,width,speed,shallow,deep){
 const F=WATER.flow({name,pts,width,speed,rapids:[0.012,0.045]});
 const D=WATER.drawFlow(F,{
  shallow:lin(shallow),deep:lin(deep),color:0xffffff,
  roughness:0.11,metalness:0.05,envMapIntensity:0.52,
  step:8,across:4,margin:0.6,depthBias:1.6,renderOrder:2,pick:true
 });
 {
  const m=D.mesh.material,k0=m.customProgramCacheKey;
  m.customProgramCacheKey=()=>(k0?k0.call(m):'')+'|drown:'+shallow+','+deep;
  m.needsUpdate=true;
 }
 D.mesh.userData.inspectLabel=name;
 return{F,D};
}

const BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const FLOW_DRAWS=[],STILL_DRAWS=[],BRUCITE_POOL_RECS=[];

/* Milky-turquoise alkaline plume tint along Station 1 detachment-fault brucite vents */
const shoalTint=SKEY==='shoal'?{
 box:BOX,cell:16,
 at:(x,z)=>{
  const a=clamp(L.BRUCITE(x,z)*0.72,0,0.75);
  return a>0.03?{c:0x7ee2de,a}:null;
 }
}:undefined;

const BIGW=WATER.open({
 name:SKEY==='drowned'?'Subsiding Drowned-Valley Snag Lagoon':SKEY==='bar'?'Steaming-Seamounts Outer Surf and Sponge Shoal':'Drownlands Sunlit Shoal and Fault-Graben Trench',
 level:0.0,
 swell:SKEY==='bar'?[[0.26,52,-85,0,0.24],[0.14,31,-68,1.3,0.18]]
  :SKEY==='drowned'?[[0.04,28,15,0,0.08],[0.03,18,-35,1.1,0.06]]
  :[[0.11,42,14,0,0.15],[0.07,26,-28,1.2,0.12]],
 field:SKEY==='bar'?0.82:SKEY==='drowned'?0.35:0.58,
 bounds:BOX,bed:terrainH,bedCell:12,
 mask:maskOf(BOX,12,(x,z)=>!L.inBrucitePool(x,z,1.18)&&terrainH(x,z)<0.12),
 tint:shoalTint
});
if(WATER.farBed)WATER.farBed(BIGW,{ground:terrainH,cell:64});

const BIG_DRAW=WATER.draw(BIGW,{
 surf:SKEY!=='drowned',
 breakers:SKEY==='bar',
 renderOrder:1,
 roughness:SKEY==='drowned'?0.09:0.12,
 metalness:0.05,
 envMapIntensity:0.62,
 shallow:lin(SKEY==='drowned'?0x3e927c:0x3ec4be),
 deep:lin(SKEY==='drowned'?0x16464a:0x0c2c4e)
});
BIG_DRAW.mesh.userData.inspectLabel=BIGW.name;

/* Perched milky-blue pH 11.4 brucite sinter pools on Station 1 (shoal) */
if(SKEY==='shoal'&&SITE.brucitePools){
 SITE.brucitePools.forEach(bp=>{
  const S0=WATER.still({
   name:bp.name,
   level:bp.level,
   poly:discPoly(bp.x,bp.z,bp.r*0.92,26),
   gradient:{centre:0x5ed6d4,rim:0xdaf4f2,power:1.35}
  });
  const D0=WATER.drawStill(S0,{
   color:0xffffff,roughness:0.06,metalness:0.04,envMapIntensity:0.65,
   transparent:false,pick:true,renderOrder:2
  });
  D0.mesh.userData.inspectLabel=bp.name;
  STILL_DRAWS.push({S:S0,D:D0,bp});
  BRUCITE_POOL_RECS.push({key:bp.key,level:bp.level,rimH:bp.rimH,pH:bp.pH});
 });
}

if(WATER.breakupAll)WATER.breakupAll();
window._water={
 station:SKEY,
 surfaces:WATER.surfaces.length,
 openLevel:0.0,
 brucitePools:BRUCITE_POOL_RECS.length,
 tidalChutes:0
};
