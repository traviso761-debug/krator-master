// ================================================================= HOST — the great lake on core/water
// [draw] core/water/README.md is the contract: the page names its water and writes no water shader. The great lake (297 m) is one
// STILL record over the page's south half (the quay, the natural shore and the ground above the level hide it where it is land),
// drawn on WATER.stillMaterial on core/atmos's clock (89z binds it). The CPU twin (WATER.heightAt) and core/export carry it.
const LWATER=(function(){const G=LEDGE_LAYOUT.ground,F=G.far,lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const S=WATER.still({name:'The great lake',level:G.lake,poly:[[-F,0],[F,0],[F,F],[-F,F]]});
 const g=new THREE.PlaneGeometry(2*F,F,1,1);g.rotateX(-Math.PI/2);g.translate(0,G.lake,F/2);
 const m=new THREE.Mesh(g,WATER.stillMaterial({color:lin(0x1e4a66),roughness:.08,metalness:.12,envMapIntensity:.5}));
 m.name='water:still';m.userData.probeSkip=true;m.userData.inspectLabel='The great lake (297 m)';m.renderOrder=1;scene.add(m);
 return {S,mesh:m};})();
