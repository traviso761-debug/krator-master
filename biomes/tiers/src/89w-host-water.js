// ================================================================= HOST — the lake and the step moss's pools on core/water
// The records are made here (the lake: core/water's open surface needs core/atmos bound, 89a), then drawn:
//   THE LAKE       the upper lake (PLAN.md section 2, "why the lakes are placid": the lake tread lies in the stair's lee, the air is dense, the
//                  rain falls on the wall): WATER.open with no surf and no breakers, the shared wave field's calm share (field .1) and two faint
//                  swells (neouterwall's tarn's), over the ground's bed baked on the page's square (the depth colour: pale over the shelf, the
//                  lake's green-blue over the deep). Its MASK: 200 m cells over the whole lake (40 km round), water where the model's cell or a
//                  neighbour is an upper-lake cell and the ground (the page's, else the far field's surface: the plan's sill on the rim, 44v)
//                  lies under the level; so the bay's far shore is the model's and no water stands on the floor west of the sill. The
//                  reflections (core/water ext 58, WATER.mirror) are a switch, off at load (Korona's)
//   THE POOLS      the step moss's rimstone pools down the seep (44w: WATER.terraces), drawn by WATER.drawTerraces (ext 53b): the treads one
//                  mesh (milky green over the tufa), the risers' little falls one more
//   A STILL        any closed water a station lists (none at station 1)
// The sky in every surface is core/atmos's skylight, a capture of the shared sky at the hour.
{const env=new THREE.Scene();
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:{environment:null},ground:()=>new THREE.Color(0x5a5a44)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const OPEN_LAKES=LAKES.filter(L=>L.open).map(L=>{
 const C=200,lo=MODEL.cells.filter(c=>c.upper&&Math.abs(c.level-L.level)<5);
 const box=[Math.min(...lo.map(c=>c.x))-C*6,Math.min(...lo.map(c=>c.z))-C*6,Math.max(...lo.map(c=>c.x))+C*6,Math.max(...lo.map(c=>c.z))+C*6];
 box[0]=Math.min(box[0],-TERR.R*1.1);box[1]=Math.min(box[1],-TERR.R*1.1);
 const S2=TERR.R*1.1,gAt=(x,z)=>Math.abs(x)<S2&&Math.abs(z)<S2?terrainH(x,z):MODEL.h(x,z);
 const nx=Math.ceil((box[2]-box[0])/C),nz=Math.ceil((box[3]-box[1])/C),data=new Uint8Array(nx*nz);let wet=0;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=box[0]+(i+.5)*C,z=box[1]+(j+.5)*C;let up=false;
  for(const [dx,dz] of [[0,0],[1200,0],[-1200,0],[0,1200],[0,-1200]]){const w=MODEL.water(x+dx,z+dz);if(w!=null&&Math.abs(w-L.level)<5){up=true;break;}}
  if(!up)continue;let low=1e9;for(const q of [[0,0],[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])low=Math.min(low,gAt(x+q[0]*C,z+q[1]*C));if(low<L.level+1){data[j*nx+i]=255;wet++;}}
 const B=TERR.R*1.12,S=WATER.open({name:L.name,level:L.level,swell:[[.006,4,30,0,.01],[.004,2.5,-60,1.1,.01]],field:.1,bounds:box,bed:terrainH,bedBox:[-B,-B,B,B],bedCell:20,
  mask:{x0:box[0],z0:box[1],cell:C,nx,nz,data}});
 L.surface=S;L.maskCells=wet;L.box=box;return S;});
const LAKE_DRAWS=LAKES.map((L,i)=>{
 if(L.open){const d=WATER.draw(L.surface,{surf:false,breakers:false,renderOrder:1,roughness:.07,metalness:.05,envMapIntensity:.6,shallow:lin(0x4e7e72),deep:lin(0x123440),ramp:[.3,8]});
  d.mesh.userData.inspectLabel=L.name;d.mesh.userData.probeSkip=true;return d;}
 const d=WATER.drawStill(LAKE_STILLS[i],{color:lin(L.colour==null?0x1e3a3a:L.colour),roughness:.06,metalness:.05,envMapIntensity:.35,surf:false,breakers:false,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=L.name;return d;});
const BIG_DRAW=BIG_LAKE?LAKE_DRAWS[LAKES.indexOf(BIG_LAKE)]:null,RIVER_DRAW=null;
// THE STEP MOSS'S POOLS (44w: STATION.TER): the treads milky green over the white tufa, the risers' falls thin and white
const STAIR_DRAW=(function(){if(!STATION.TER||!WATER.drawTerraces)return null;try{
 const D=WATER.drawTerraces(STATION.TER,{pool:{color:0xffffff,roughness:.06,metalness:.05,envMapIntensity:.5,renderOrder:2,
   gradient:{centre:lin(0x5aa29a).getHex(),rim:lin(0xd8e6d4).getHex(),power:1.3}},fall:{color:lin(0xeef4ee),opacity:.82,rowStep:1,cols:6,spray:false,plungeR:1.6,renderOrder:3}});
 [D.pools&&D.pools.mesh,D.falls&&D.falls.mesh,D.falls&&D.falls.plunge].forEach(m=>{if(m){m.userData.inspectLabel=STATION.TER.name;m.userData.probeSkip=true;}});
 return D;}catch(e){reportErr('the step moss\'s pools: '+(e&&e.stack||e));return null;}})();
{const WQ=new URLSearchParams(location.search);if(WQ.get('breakup')!=='0'&&WATER.breakupAll&&LAKES.length)WATER.breakupAll();}
window._water={lakes:LAKES.map(L=>L.name+' '+L.kind+' '+L.level+(L.open?' open, mask '+L.maskCells+' cells':'')),pools:STATION.TER?STATION.TER.pools.length:0};
