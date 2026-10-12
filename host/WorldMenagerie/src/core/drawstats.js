// ---------- a debug tally of what is drawn, for any page on the shared engine ----------
// With 'drawstats' in the address, every two seconds: every mesh, instanced mesh and point cloud that is visible and
// inside the view (or not frustum-culled), grouped by a label - its wire category, its kind, its material - with the
// draws and triangles of each, the biggest first, into the page's details (drawStats) for tools/probe.py to report.
// Each object also carries the name of the stage that added it, when the page sets one (window.__stage).
export function drawstats(api){
  const {THREE,scene,camera,animHooks}=api;if(!/drawstats/.test(api.HASH0||''))return;
  const fr=new THREE.Frustum(),m=new THREE.Matrix4(),sph=new THREE.Sphere();let last=0;
  const vis=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  animHooks.push(now=>{if(now-last<2000)return;last=now;camera.updateMatrixWorld();m.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fr.setFromProjectionMatrix(m);
    const T=new Map();scene.traverse(o=>{if(!(o.isMesh||o.isPoints)||!vis(o))return;
      if(o.frustumCulled!==false){const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();sph.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);if(!fr.intersectsSphere(sph))return;}
      if(o.isInstancedMesh&&!o.count)return;
      const g=o.geometry,tri=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1),mt=Array.isArray(o.material)?o.material[0]:o.material;
      const key=(o.userData.stage||'?')+' | '+(o.userData.wireCat||'')+' | '+(o.isInstancedMesh?'inst':o.isPoints?'pts':'mesh')+' | '+(mt&&mt.type)+(o.frustumCulled===false?' nocull':'');
      const t=T.get(key)||{n:0,tri:0};t.n++;t.tri+=tri;T.set(key,t);});
    api.ctx.details.drawStats=[...T.entries()].sort((a,b)=>b[1].n-a[1].n).slice(0,24).map(([k,v])=>k+': '+v.n+' draws, '+Math.round(v.tri/1000)+'k tris');});
}
