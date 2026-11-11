// ================================================================= HOST — the lake, the wadi, the pond and the paddies on core/water
// The records are made in 47-host-land.js (WATER_RECS: the lake open water over its bed with the far lake flat beyond the page,
// the wadi's channel a flow line, the pond and each paddy that holds water still water); drawn here once core/atmos is bound
// (89a: ATMOS.bindHost; its clock on the host's hour, its wave chunk): the lake as the CDLOD mesh with its calm swell and a
// share of the shared wave field (no surf or breakers: a lake, BACKPORT.md); the wadi as its ribbon (slow ripples carried down to
// the lake); the pond and the paddies as one mesh with one still material. The sky in the water is a capture of the shared
// sky (89s: its giant, ring and clouds at the hour), given to the water only. CPU twins: WATER.heightAt, WATER.flowAt;
// core/export carries them to Godot (godot/krator/water_import.gd draws them).
const WATER_DRAW=(function(){if(typeof ATMOS==='undefined'||!WATER_RECS)return null;try{
 {const WENV={environment:null};
  ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.35,.42,.29])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={};
 // the lake: fresh water over limestone silt, green-jade in the shallows, dark where it is deep
 /* no breakers on still water (BACKPORT.md, the owner, 2026-11-02): a lake's shore grid drew white contour rings round the towers in the lake
    and stripes along the beach; a sea keeps them. The final rebuild, pair 13; ?breakers=1 brings them back to compare */
 const SURF=new URLSearchParams(location.search).get('breakers')==='1'?{}:{surf:false,breakers:false};
 out.lake=WATER.draw(WATER_RECS.lake,{...SURF,renderOrder:1,roughness:.12,metalness:.05,envMapIntensity:.3,ramp:[1.2,10],
  shallow:lin(0x6a8a6c),deep:lin(0x1c3a36)});out.lake.mesh.userData.inspectLabel=LAKE.name;
 out.far=WATER.draw(WATER_RECS.far,{renderOrder:0,roughness:.18,metalness:.05,envMapIntensity:.45,color:lin(0x24423c)});out.far.mesh.userData.inspectLabel='The great lake (beyond)';
 // the wadi's channel: the lake's jade, browner (the wet season's silt)
 out.river=WATER.drawFlow(WATER_RECS.river,{shallow:lin(0x6a7a5a),deep:lin(0x2e3a2c),color:0xffffff,roughness:.08,metalness:.05,
  envMapIntensity:.55,step:10,across:6,margin:1.2,renderOrder:2});out.river.mesh.userData.inspectLabel=WATER_RECS.river.name;
 const still=[WATER_RECS.pond].concat(WATER_RECS.paddies),pos=[];
 still.forEach(S=>{const P=S.poly,n=P.length;let cx=0,cz=0;P.forEach(q=>{cx+=q[0];cz+=q[1];});cx/=n;cz/=n;
  for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];pos.push(cx,S.level,cz,b[0],S.level,b[1],a[0],S.level,a[1]);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,WATER.stillMaterial({color:new THREE.Color(.08,.11,.10),roughness:.07,metalness:.1,envMapIntensity:.45}));
 m.userData.probeSkip=true;m.userData.inspectLabel='Still water (the pond; a flooded paddy)';m.renderOrder=1;scene.add(m);out.still=m;
 return out;}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
// THE REFLECTIONS SWITCH (core/water ext/58; BACKPORT.md section 1; the final rebuild, pair 13): WATER.mirrorSwitch on the lake, OFF at page load
// (the host panel's button cycles off, probe, live; ?mirror=probe or ?mirror=live asks at load); round the lake's bay, its towers and the beach.
// HOST_DRAW is the frame's draw 99 hands KHOST.take
const MIRROR=(function(){const L=WATER_DRAW&&WATER_DRAW.lake;if(!L||!WATER.mirrorSwitch)return null;const mat=L.material||(L.mesh&&L.mesh.material);if(!mat)return null;
 const cx=LAKE.bay.x,cz=shoreZ(LAKE.bay.x)-200;
 return WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[mat],level:LAKE.level,center:[cx,cz],radius:TERR.R,far:TERR.R*2.5,
  tree:o=>o.name==='biome:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0});})();
const HOST_DRAW=MIRROR?()=>{MIRROR.update();SKY.render();}:()=>SKY.render();
