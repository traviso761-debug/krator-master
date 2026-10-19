// ================================================================= HOST — the water on core/water, bound to core/atmos
// core/atmos (0-core, 0p-presets, 8-export, a-waves, b-skylight; core/atmos/README.md) is bound once here: its clock
// drives the wave field every water shader reads (atmWaveT), its skylight captures this page's sky (the hyperjungle's
// dome, the giant and its ring: 82) for the water alone (WENV: the page's own materials keep the lighting they were
// tuned on), and ATMOS.export fills the export's atmos section. The page has no night yet (KNOWN_ISSUES.md: the hour is
// pinned at 13), so the preset's dusk and the giant's light wait. The station's air is a record on the stage (STAGE.air:
// the pressure in atm, NOTES.md "The ground"), exported with the layout (99); it changes nothing drawn yet.
// core/water (core/water/README.md, phases 3 and 4): the stream is one WATER.flow along its line (its ribbon falls with
// the bed, the ripples ride the current, white along the banks); every standing water the stage names (STAGE.pools, bar
// the frozen tarn, which 47 draws as a plate of ice) and every rain pool on the rock (NECANYONS.POTHOLES) is a
// WATER.still record, a polygon at its level, the twins of its height and ripple on the record (the export carries them
// all, with probes). They are drawn as ONE mesh on WATER.stillMaterial (the sky in them, the ripple on them: one draw
// call for a hundred potholes) rather than a mesh each. Before 2026-10-19 the page drew a flat disc per pool and the
// stream's ribbon on a plain standard material (47).
ATMOS.init({THREE,scene,camera,hour:()=>13,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:(STAGE.seed==null?11:STAGE.seed)+4400,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));env.add(giant.clone());env.add(giantRing.clone());
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x2c3a2e)});}
const WATER_COL=new THREE.Color(STAGE.waterCol==null?0x24302c:STAGE.waterCol).convertSRGBToLinear();
// THE STREAM: its line sampled every 20 m down the stage (the x of its bed by z: STAGE.stream.x), the ribbon as wide as
// the bed, a walking pace, the surface STREAM_.depth over the bed (the same line 47's waterH reads)
const STREAM_W=STREAM_?WATER.flow({name:STREAM_.name||'The stream',width:STREAM_.w*2,speed:1.2,
 pts:(()=>{const P=[];for(let z=-STAGE.R*1.1;z<=STAGE.R*1.1;z+=20)P.push([STREAM_.x(z),z,streamBed(z)+STREAM_.depth]);return P;})()}):null;
const STREAM_DRAW=STREAM_W?WATER.drawFlow(STREAM_W,{shallow:WATER_COL.clone().multiplyScalar(1.6),deep:WATER_COL,color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.35,step:8,across:6,margin:1.5}):null;
if(STREAM_DRAW)STREAM_DRAW.mesh.userData.inspectLabel=STREAM_.name||'The stream';
// THE STILL WATERS: one record each (a polygon at its level: 24 sides, 48 over 60 m, 96 for a lake), one mesh for all
const STILL=[];
{const ring=p=>{const n=p.r>400?96:p.r>60?48:24,P=[];for(let k=0;k<n;k++){const a=-k/n*TAU;P.push([p.x+Math.cos(a)*p.r,p.z+Math.sin(a)*p.r]);}return P;};
 NECANYONS.POTHOLES.forEach((p,i)=>STILL.push(WATER.still({name:'A rain pool '+(i+1),level:p.y,poly:ring(p)})));
 STAGE.pools.filter(p=>!p.ice).forEach((p,i)=>STILL.push(WATER.still({name:p.name||('A pool '+(i+1)),level:p.y,poly:ring(p)})));
 if(STILL.length){const pos=[],idx=[];STILL.forEach(S=>{const M=WATER.stillMesh(S),b=pos.length/3;for(let i=0;i<M.pos.length;i++)pos.push(M.pos[i]);for(let i=0;i<M.idx.length;i++)idx.push(M.idx[i]+b);});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const mat=WATER.stillMaterial({THREE,color:WATER_COL,roughness:.12,metalness:.3,envMapIntensity:.3});mat.transparent=true;mat.opacity=.88;mat.depthWrite=false;mat.side=THREE.DoubleSide;
  const m=new THREE.Mesh(g,mat);m.name='water:still';m.userData.probeSkip=true;m.userData.lodSkip=true;m.userData.water=STILL[0].id;
  m.userData.inspectLabel=STAGE.waterLabel||"Water (a rain pool on the pavement; the station's pools)";m.renderOrder=1;scene.add(m);}}
ATMOS.finish();
