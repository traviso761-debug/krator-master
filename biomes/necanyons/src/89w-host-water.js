// ================================================================= HOST — the creek and the rain pools on core/water
// The records are made in 47-host-land.js (WATER_RECS: the creek a flow line, each rain pool on the slickrock still water);
// drawn here once core/atmos is bound (its clock on the host's hour, its wave chunk, the sky's light): the creek as its
// ribbon (the ripples carried down the current, white along the banks), the pools as one mesh of discs with one still
// material (WATER.stillMaterial: the sky in them, a faint ripple). The sky in the water is core/atmos's skylight: a capture
// of this page's dome and giant given to the water only (the page's own materials keep their lighting), taken again as
// the hour moves (89n-host-night.js tints the dome). Their CPU twins: WATER.heightAt, WATER.flowAt; core/export carries
// them to Godot (godot/krator/water_import.gd draws them).
const WATER_DRAW=(function(){if(typeof ATMOS==='undefined'||!WATER_RECS)return null;try{
 ATMOS.init({THREE,scene,camera,hour:()=>NIGHT.hourNow,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:4747,
  err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));env.add(giant.clone());
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x3a2c22),key:()=>Math.round(NIGHT.f*8)});
 const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={};
 if(WATER_RECS.creek){out.creek=WATER.drawFlow(WATER_RECS.creek,{shallow:lin(0x4a5a44),deep:lin(0x223430),color:0xffffff,roughness:.1,metalness:.05,
   envMapIntensity:.5,step:12,across:6,margin:1.5});out.creek.mesh.userData.inspectLabel=WATER_RECS.creek.name;}
 if(WATER_RECS.pools.length){const pos=[];WATER_RECS.pools.forEach(S=>{const P=S.poly,n=P.length;let cx=0,cz=0;P.forEach(q=>{cx+=q[0];cz+=q[1];});cx/=n;cz/=n;
   for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];pos.push(cx,S.level,cz,b[0],S.level,b[1],a[0],S.level,a[1]);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,WATER.stillMaterial({color:new THREE.Color(.07,.11,.10),roughness:.08,metalness:.1,envMapIntensity:.35}));
  m.userData.probeSkip=true;m.userData.inspectLabel='A rain pool on the slickrock';m.renderOrder=1;scene.add(m);out.pools=m;}
 return out;}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
