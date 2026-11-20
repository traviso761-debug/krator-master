// Silo 18: the merging kit every part of the page builds with. Parts are boxes, cylinders and lathes placed by
// position and turn, each painted one colour (a vertex colour), and binned by a key that names their material;
// build() hands back one merged geometry per key. A level is built once as a kit and drawn many times as instances.
//
// Angles round the silo's axis are `a`: a point at angle a and radius r is (cos a * r, y, sin a * r).
export function makeKits(THREE){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s=new THREE.Vector3(),c=new THREE.Color();
  const G={
    box:new THREE.BoxGeometry(1,1,1),
    cyl:new THREE.CylinderGeometry(1,1,1,12,1),
    cyl6:new THREE.CylinderGeometry(1,1,1,6,1),
    cone:new THREE.ConeGeometry(1,1,10,1),
    sph:new THREE.SphereGeometry(1,10,7),
    disc:new THREE.CylinderGeometry(1,1,1,28,1),
    // low-poly ones for the small things there are hundreds of on every level (tins, toys, plants, stains, dials)
    sph4:new THREE.SphereGeometry(1,6,4),disc8:new THREE.CylinderGeometry(1,1,1,8,1),
  };
  // a slab ring (a floor with the shaft cut out of it): r0..r1 wide, from y-th to y, round from a0 for len radians
  const ringCache=new Map();
  function ring(r0,r1,th,seg=48,a0=0,len=Math.PI*2){const k=[r0,r1,th,seg,a0,len].join();let g=ringCache.get(k);if(g)return g;
    const V=THREE.Vector2,pts=[new V(r0,-th),new V(r1,-th),new V(r1,0),new V(r0,0),new V(r0,-th)];
    // the lathe's angle runs the other way round from ours and starts on +z
    g=new THREE.LatheGeometry(pts,seg,Math.PI/2-a0-len,len);ringCache.set(k,g);return g;}
  function kit(){const B=new Map();
    // add(key, geometry, colour, x, y, z, {rx, ry, rz, sx, sy, sz, q})
    function add(key,geo,col,x,y,z,o={}){
      if(o.q)q.copy(o.q);else{e.set(o.rx||0,o.ry||0,o.rz||0,'YXZ');q.setFromEuler(e);}
      m4.compose(p.set(x,y,z),q,s.set(o.sx||1,o.sy||1,o.sz||1));
      const g=geo.index?geo.toNonIndexed():geo.clone();g.applyMatrix4(m4);
      c.set(col);const n=g.attributes.position.count,ca=new Float32Array(n*3);for(let i=0;i<n;i++){ca[i*3]=c.r;ca[i*3+1]=c.g;ca[i*3+2]=c.b;}
      g.setAttribute('color',new THREE.BufferAttribute(ca,3));let L=B.get(key);if(!L)B.set(key,L=[]);L.push(g);}
    // a box at angle a and radius r: `rad` long along the radius, `tan` across it, h tall, its foot at y
    const radial=(key,col,a,r,y,rad,tan,h)=>add(key,G.box,col,Math.cos(a)*r,y+h/2,Math.sin(a)*r,{ry:-a,sx:rad,sy:h,sz:tan});
    const tangent=(key,col,a,r,y,len,thick,h)=>add(key,G.box,col,Math.cos(a)*r,y+h/2,Math.sin(a)*r,{ry:-a-Math.PI/2,sx:len,sy:h,sz:thick});
    // a cylinder from point A to point B
    const UP=new THREE.Vector3(0,1,0),d=new THREE.Vector3();
    const pipe=(key,col,ax,ay,az,bx,by,bz,r,geo)=>{d.set(bx-ax,by-ay,bz-az);const L=d.length();if(L<1e-4)return;const qq=new THREE.Quaternion().setFromUnitVectors(UP,d.normalize());
      add(key,geo||G.cyl6,col,(ax+bx)/2,(ay+by)/2,(az+bz)/2,{q:qq,sx:r,sy:L,sz:r});};
    function build(){const out={};for(const [key,L] of B){let n=0;for(const g of L)n+=g.attributes.position.count;
        const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
        for(const g of L){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);C.set(g.attributes.color.array,o*3);o+=g.attributes.position.count;g.dispose();}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));
        g.setAttribute('color',new THREE.BufferAttribute(C,3));g.computeBoundingSphere();out[key]=g;}
      B.clear();return out;}
    return {add,radial,tangent,pipe,build,G,ring};}
  return {kit,G,ring};
}
