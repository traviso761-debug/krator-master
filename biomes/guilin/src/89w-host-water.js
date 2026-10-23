// ================================================================= HOST — the river, the pond and the paddies on core/water
// The records are made in 47-host-land.js (WATER_RECS: the Li River a flow line, the pond and each paddy that holds water
// still water); drawn here once core/atmos is bound (its clock on the host's hour, its wave chunk, the sky's light): the
// river as its ribbon (slow ripples carried downstream, the towers' sky in it), the pond and the paddies as one mesh with
// one still material (WATER.stillMaterial: the sky in them, a faint ripple). The sky in the water is core/atmos's
// skylight, taken again as the hour moves (89n-host-night.js tints the dome). Their CPU twins: WATER.heightAt,
// WATER.flowAt; core/export carries them to Godot (godot/krator/water_import.gd draws them).
const WATER_DRAW=(function(){if(typeof ATMOS==='undefined'||!WATER_RECS)return null;try{
 ATMOS.init({THREE,scene,camera,hour:()=>NIGHT.hourNow,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:5151,
  err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));env.add(giant.clone());
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x3a4434),key:()=>Math.round(NIGHT.f*8)});
 const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={};
 // the Li's green: jade over the shallows, dark where it is deep
 out.river=WATER.drawFlow(WATER_RECS.river,{shallow:lin(0x5a7a62),deep:lin(0x1e3830),color:0xffffff,roughness:.06,metalness:.05,
  envMapIntensity:.6,step:12,across:8,margin:2});out.river.mesh.userData.inspectLabel=WATER_RECS.river.name;
 const still=[WATER_RECS.pond].concat(WATER_RECS.paddies),pos=[];
 still.forEach(S=>{const P=S.poly,n=P.length;let cx=0,cz=0;P.forEach(q=>{cx+=q[0];cz+=q[1];});cx/=n;cz/=n;
  for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];pos.push(cx,S.level,cz,b[0],S.level,b[1],a[0],S.level,a[1]);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,WATER.stillMaterial({color:new THREE.Color(.08,.11,.10),roughness:.07,metalness:.1,envMapIntensity:.45}));
 m.userData.probeSkip=true;m.userData.inspectLabel='Still water (the pond; a flooded paddy)';m.renderOrder=1;scene.add(m);out.still=m;
 return out;}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
