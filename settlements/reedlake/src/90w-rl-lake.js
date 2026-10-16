// ---------------------------------------------------------------- the lake (core/water)
// The lake is core/water's open water (core/water/README.md): a WATER.open surface at RL.WATER with a share of the shared
// wave field (core/atmos) and no swell of its own (a reed-sheltered lake: the field's swell lifts it a few centimetres, its
// chop and mid waves shade it), on the one clock (atmWaveT, whole cycles per period), drawn by WATER.draw on the CDLOD water
// mesh (fine under the camera, coarser with distance, out to the horizon). The sky in the water is core/atmos's skylight, a
// capture of this page's dome and giant given to the water only (RL_ENV: the kit's tuned standard materials are untouched).
// Its CPU twin is WATER.heightAt. The islands, boats and rafts are baked into the kit's instanced sets, so they do not ride
// it: the lake is calm enough (RL_LAKE_FIELD; KNOWN_ISSUES.md) that their waterlines hold. groundM stays as the camera's flat
// pick plane, invisible (the water mesh does not raycast). Before 2026-10-13 the lake was one plane with a scrolled canvas map.
// It loads after 90-rl-scene.js (scene, renderer, sky, giant, groundM) and after core/atmos.
const RL_LAKE_FIELD=.12,RL_LAKE_TILT=2.5;   // the field's height (its swell lifts the lake 7 cm at most: the boats' keels sit 9 cm under RL.WATER)
                                          // and its shading slope, raised so the chop reads as on a field of .3
let RL_LAKE=null,RL_LAKE_DRAW=null;
if(!window.CITY&&groundM){
 ATMOS.init({THREE,scene,camera,hour:()=>13,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:2599,
  err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
 const env=new THREE.Scene(),RL_ENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(4000);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:RL_ENV,ground:()=>new THREE.Color(0x16302c)});
 // the detail ripple: the old lake map's eight whole-tile sinusoids (74-rl-mat.js) as a normal map, 8 m a tile as before
 const nrm=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data,W=[[1,2,0],[3,1,1.3],[2,5,2.1],[5,3,.7],[7,2,3.3],[4,7,1.9],[9,6,2.6],[6,10,.4]];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let gx=0,gy=0;for(const [fx,fy,ph] of W){const c=Math.cos(TAU*(fx*x/w+fy*y/h)+ph)/Math.sqrt(fx*fx+fy*fy);gx+=c*fx;gy+=c*fy;}
   const nx=-gx*.06,ny=-gy*.06,L=Math.hypot(nx,ny,1),i=(y*w+x)*4;d[i]=(nx/L*.5+.5)*255;d[i+1]=(ny/L*.5+.5)*255;d[i+2]=(1/L*.5+.5)*255;d[i+3]=255;}
  g.putImageData(id,0,0);});
 nrm.encoding=THREE.LinearEncoding;
 RL_LAKE=WATER.open({name:'Reed Lake',level:RL.WATER,field:RL_LAKE_FIELD,tilt:RL_LAKE_TILT});
 RL_LAKE_DRAW=WATER.draw(RL_LAKE,{color:new THREE.Color(.034,.112,.12),roughness:.24,metalness:.1,envMapIntensity:.22,normalMap:nrm,normalScale:.6,detailSize:8,detailCycles:[7,4]});
 RL_LAKE_DRAW.mesh.userData.inspectLabel='Reed Lake';
}
