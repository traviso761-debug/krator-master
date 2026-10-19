// ================================================================= HOST — build (Longsong: the monastery's records, then the kit, then one bake)
// The order a world follows (biomes/WORLD.md): its own structures first (registered and drawn by 64 and 66), then the
// kit, masked off everything built, paved or raked inside the wall (LS.plantable), then one bake.
window._biome=null;
// the monastery's and the Vault's meshes: one per material (62's accumulators, filled by 64 and 66)
ARCH.finish();
// THE PROBE'S SAMPLES OF THE MERGED MESHES. core/host's probe samples a mesh at its box's centre, so one merged mesh per
// material would leave every building's registered volume empty. These are points taken from the merged geometry's own
// vertices (every k-th of each mesh, about 40,000 in all), so a volume with nothing drawn in it still reads empty: the
// check keeps its meaning. An invisible instanced mesh on layer 31 (never drawn, never picked).
const ARCH_SAMPLES=(function(){const pts=[];scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!(o.userData.arch||o.userData.vault))return;
  const P=o.geometry.attributes.position;if(!P)return;o.updateMatrixWorld(true);const v=new THREE.Vector3(),st=Math.max(1,Math.floor(P.count/8000));
  for(let i=0;i<P.count;i+=st){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);pts.push(v.x,v.y,v.z);}});
 const n=pts.length/3,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,.01,0,0,0,.01,0],3));
 const im=new THREE.InstancedMesh(g,new THREE.MeshBasicMaterial(),n),M=new THREE.Matrix4();
 for(let i=0;i<n;i++){M.makeTranslation(pts[3*i],pts[3*i+1],pts[3*i+2]);im.setMatrixAt(i,M);}
 im.visible=false;im.layers.set(31);im.userData.probeSamples=true;scene.add(im);return {mesh:im,count:n};})();
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(!Q.has('noflora')){try{window._biome=OIDONG.build({R:TERR.R-120,quality:q});}catch(e){reportErr('oidong: '+e.stack);}}
 _mark('flora');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Oidong Valley round Longsong',cls:'feature',kind:'valley',key:'longsong_valley',x:0,z:0,y:-60,r:TERR.R,h:400});
})();
