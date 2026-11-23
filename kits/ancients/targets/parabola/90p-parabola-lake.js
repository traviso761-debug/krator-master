// ---------------------------------------------------------------- the rain lake (core/water still water)
// The ruin's basin holds the rain the dish gathers: PARABOLA.ruin's lake record (level and outline, the basin's plaza held by
// the north parapet), left in PB_SITE[1] by buildParabola, is a WATER.still record here, so WATER.heightAt and core/export read
// it, and WATER.drawStill draws it with the sky in it and a faint ripple on core/atmos's clock. Loads after 90-scene.js (the
// builders, the kit's sky and giant). The page's sky stands in for the skylight's environment, as on Xanadu's kit page.
let PB_STILL=null;
if(typeof PB_SITE!=='undefined'&&PB_SITE[1]&&PB_SITE[1].lake){const S1=PB_SITE[1],L=S1.lake;
 ATMOS.init({THREE,scene,camera,hour:()=>13,onFrame:fn=>tick(fn),ground:(x,z)=>terrainH(x,z),seed:9710,
  err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
 const env=new THREE.Scene();
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(4000);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:{environment:null},ground:()=>new THREE.Color(0x8a7a5a)});
 PB_STILL=WATER.still({name:'Parabola — the rain lake',level:L.level,poly:L.poly.map(p=>[p[0]+S1.x,p[1]+S1.z])});
 const dw=WATER.drawStill(PB_STILL,{color:0x2a4c48,roughness:.07,metalness:.2});dw.mesh.userData.inspectLabel='the rain lake';
 window._parabolaLake=PB_STILL.level;}
