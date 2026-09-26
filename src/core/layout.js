// ---------- the layout fingerprint, for pages that have no lots ----------
// (This file used to be called fingerprint.js, and content blockers will not load a script by that name - they
// take it for browser fingerprinting - so every page that imported it failed silently in a browser with one.)
// The test suite checks every page against a golden: build it, and the layout must come out the same
// (tools/probe.py hashes ctx.lotList). The engine's cities have lots to list. A page built some other way
// hands this its scene - or the part of it that is layout - and gets rows in the same schema, one per mesh:
// where it is, how big its geometry is, how many vertices, and for an instanced mesh a digest of where every
// instance stands. Call it before anything has moved: moving things are not layout.
//
// Rows: {x, z, h, w, dpt, ry, kind, fixed} - x/z/h the world position, w the geometry's bounding radius, dpt
// its vertex count, kind the material's colour plus, for instanced meshes, the count and a digest.
export function sceneRows(THREE,root,opts){
  const o=opts||{},rows=[],v=new THREE.Vector3(),m=new THREE.Matrix4();
  root.updateMatrixWorld(true);
  root.traverse(obj=>{
    if(!(obj.isMesh||obj.isPoints||obj.isLine))return;
    if(obj.userData.isWire||obj.userData.noFingerprint)return;
    if(o.skip&&o.skip(obj))return;
    const g=obj.geometry;if(!g||!g.attributes||!g.attributes.position)return;
    if(!g.boundingSphere)g.computeBoundingSphere();
    v.setFromMatrixPosition(obj.matrixWorld);
    const mat=Array.isArray(obj.material)?obj.material[0]:obj.material;
    let kind=(mat&&mat.color?mat.color.getHexString():'?')+(obj.isPoints?':pts':obj.isLine?':line':'');
    if(obj.isInstancedMesh){
      // a digest of the instances: order-independent, to the decimetre
      let a=0,b=0;
      for(let i=0;i<obj.count;i++){obj.getMatrixAt(i,m);const e=m.elements;
        const x=Math.round(e[12]*10),y=Math.round(e[13]*10),z=Math.round(e[14]*10);
        a=(a+((x*73856093)^(y*19349663)^(z*83492791)))|0;b=(b+x+3*y+7*z)|0;}
      kind+=':'+obj.count+':'+(a>>>0).toString(16)+':'+(b>>>0).toString(16);
    }
    rows.push({x:v.x,z:v.z,h:v.y,w:g.boundingSphere.radius,dpt:g.attributes.position.count,ry:0,kind,fixed:false});
  });
  rows.sort((p,q)=>p.x-q.x||p.h-q.h||p.z-q.z||p.dpt-q.dpt||(p.kind<q.kind?-1:p.kind>q.kind?1:0));
  return rows;
}
