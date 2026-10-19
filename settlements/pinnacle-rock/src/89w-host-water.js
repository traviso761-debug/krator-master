// ================================================================= HOST — the still water (core/water, on core/atmos's clock and sky light)
// The page's water is core/water's still water: the paddies (each cell's sheet inside its bund), the spring below the
// Stair, the seep pond at the west foot and the Deep Root's rain pool are WATER.still records (WATER.heightAt and
// core/export read them) drawn with WATER.stillMaterial (the sky in it, a faint ripple on the one clock), as Reed Lake's
// troughs are (settlements/reedlake/src/90x-rl-still.js). ATMOS is bound here (the wave clock, the sky light: only the
// water reflects the sky, the page's tuned materials keep theirs); its frame hooks run from the host's frame (FRAME_HOOKS).
const FRAME_HOOKS=[];
const STILL=(function(){if(typeof ATMOS==='undefined'||typeof WATER==='undefined')return null;try{
 ATMOS.init({THREE,scene,camera,hour:()=>13,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:2601,
  err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
 const env=new THREE.Scene(),HOLD={environment:null};
 if(typeof sky!=='undefined'&&sky&&sky.geometry)env.add(new THREE.Mesh(sky.geometry,sky.material));
 ATMOS.skylight({renderer,sky:env,scene:HOLD,ground:()=>new THREE.Color(0x2a3a26)});
 const mat=()=>WATER.stillMaterial({color:new THREE.Color(.06,.12,.10),roughness:.08,metalness:.1,envMapIntensity:.35}),recs=[];
 const ring=(c,rx,rz,n)=>{const P=[];for(let k=0;k<n;k++){const a=k/n*TAU;P.push([c[0]+Math.cos(a)*rx,c[1]+Math.sin(a)*rz]);}return P;};
 // the paddies: each cell's sheet, 1.1 m in from its corners (89d drew it), its level the cell's top
 if(FARMS){FARMS.cells.forEach(C=>{if(C.kind!=='paddy')return;const P=C.corners.map(q=>{const dx=C.x-q[0],dz=C.z-q[1],l=Math.hypot(dx,dz)||1;return [q[0]+dx/l*1.1,q[1]+dz/l*1.1];});
   recs.push(WATER.still({name:'a paddy ('+C.id+')',level:C.y+.02,poly:P}));});
  if(FARMS_MESH.water)FARMS_MESH.water.material=mat();}
 // the spring and the seep pond: their ellipses at the lowest of their rims (the spring's mesh is 89d's; the pond's here)
 [[PR.SPRING,'spring'],[PR.POND,'pond']].forEach(([E,k])=>{const P=ring([E.x,E.z],E.rx,E.rz,40);let lo=1e9;P.forEach(q=>{lo=Math.min(lo,groundH(q[0],q[1]));});
  recs.push(WATER.still({name:E.name,level:lo+.25,poly:P}));
  let me=null;if(FARMS_MESH.group)FARMS_MESH.group.traverse(o=>{if(o.isMesh&&o.userData.inspectLabel===E.name)me=o;});
  if(!me){const g=new THREE.BufferGeometry(),p=[E.x,lo+.25,E.z],ix=[];P.forEach((q,i)=>{p.push(q[0],lo+.25,q[1]);ix.push(0,(i+1)%P.length+1,i+1);});
   g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();me=new THREE.Mesh(g,mat());me.userData.host=true;me.userData.inspectLabel=E.name;scene.add(me);}
  else me.material=mat();});
 // the Deep Root's rain pool
 if(CAVERN){const Pl=CAVERN.pool;recs.push(WATER.still({name:Pl.name,level:Pl.y,poly:ring(Pl.c,Pl.r,Pl.r,28)}));
  CAVERN_MESH.group&&CAVERN_MESH.group.traverse(o=>{if(o.isMesh&&o.userData.inspectLabel===Pl.name)o.material=mat();});}
 return {still:recs.length};}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
