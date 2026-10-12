// ---------- the coffee fincas ----------
// Antigua's coffee grows on the valley floor and up the volcanoes' lower slopes, in rows under shade trees:
// inga and gravilea, a bare trunk and a flat crown spread high over the bushes, so they get the light broken. The fincas are mapped as
// landuse=orchard (kind "finca", from C.extraKinds); this plants them, a row every C.fincas.row metres along the
// area's long axis, a bush every C.fincas.bush, and a shade tree every C.fincas.shade.
//
// There are millions of bushes, so nothing is built at load: the map is cut into C.fincas.tile-metre tiles, and a
// tile is planted the first time the camera comes within C.fincas.far of it, and hidden when it goes away again.
// None of it is in the layout fingerprint.
export function fincas(api){
  const {THREE,C,scene,AREAS,groundH,inPoly,animHooks,camera}=api;const K=C.fincas;if(!K||!AREAS)return;
  const ROW=K.row||3.6,BUSH=K.bush||2.4,SHADE=K.shade||16,TILE=K.tile||400,FAR=K.far||650;
  const list=AREAS.filter(a=>a.kind===(K.kind||'finca'));if(!list.length)return;
  // (a shade tree: about one to every SHADE x SHADE metres, between the rows)
  const inRec=(a,x,z)=>inPoly(x,z,a.o)&&!(a.i||[]).some(h=>inPoly(x,z,h));
  const hash=(x,z,s)=>{const k=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return k-Math.floor(k);};
  // each area's row direction: its long axis
  for(const a of list){const r=a.o;let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=r.length;cz/=r.length;let sxx=0,szz=0,sxz=0;
    for(const [x,z] of r){sxx+=(x-cx)**2;szz+=(z-cz)**2;sxz+=(x-cx)*(z-cz);}a._ang=0.5*Math.atan2(2*sxz,sxx-szz);}
  const tiles=new Map();
  for(const a of list)for(let i=Math.floor(a.bb.x0/TILE);i<=Math.floor(a.bb.x1/TILE);i++)for(let j=Math.floor(a.bb.z0/TILE);j<=Math.floor(a.bb.z1/TILE);j++){
    const k=i+','+j;if(!tiles.has(k))tiles.set(k,{i,j,areas:[],mesh:null});tiles.get(k).areas.push(a);}
  const bushG=new THREE.IcosahedronGeometry(1,0),shadeG=new THREE.IcosahedronGeometry(1,0).scale(1,0.45,1),trunkG=new THREE.CylinderGeometry(0.12,0.18,1,5).translate(0,0.5,0);
  const bushM=new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),shadeM=new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),trunkM=new THREE.MeshLambertMaterial({color:0x5a4634});
  const BUSHC=(K.bushColours||['#2c4a22','#345628','#28421e','#3a5c2a']).map(c=>new THREE.Color(c)),SHADEC=(K.shadeColours||['#4a6a3a','#56763e','#3e5e34']).map(c=>new THREE.Color(c));
  const O=new THREE.Object3D();let planted=0;
  function plant(t){const x0=t.i*TILE,z0=t.j*TILE,B=[],S=[];
    for(const a of t.areas){const ux=Math.cos(a._ang),uz=Math.sin(a._ang);
      // a lattice turned to the rows, over the tile; keep the points inside the area and the tile
      const R=TILE*0.75,cx=x0+TILE/2,cz=z0+TILE/2;
      for(let v=-R;v<=R;v+=ROW)for(let u=-R;u<=R;u+=BUSH){const x=cx+u*ux-v*uz,z=cz+u*uz+v*ux;
        if(x<x0||x>=x0+TILE||z<z0||z>=z0+TILE||x<a.bb.x0||x>a.bb.x1||z<a.bb.z0||z>a.bb.z1||!inRec(a,x,z))continue;
        const h=hash(x,z,1);if(h<0.06)continue;   // the odd gap in a row
        B.push([x,groundH(x,z),z,0.7+h*0.35,h]);
        if(hash(x,z,2)<BUSH*ROW/(SHADE*SHADE))S.push([x+ROW/2*-uz,groundH(x,z),z+ROW/2*ux,9+hash(x,z,3)*7,hash(x,z,4)]);}}
    const g=new THREE.Group(),sph=new THREE.Sphere(new THREE.Vector3(x0+TILE/2,B.length?B[0][1]:0,z0+TILE/2),TILE*0.75+30);
    const tg=geo=>{const c=geo.clone();c.boundingSphere=sph;return c;};   // the instances are in world space: the tile's sphere, not the shape's at the origin
    if(B.length){const im=new THREE.InstancedMesh(tg(bushG),bushM,B.length);B.forEach(([x,y,z,s,h],n)=>{O.position.set(x,y+s*0.8,z);O.rotation.set(0,h*6.28,0);O.scale.set(s,s*1.05,s);O.updateMatrix();im.setMatrixAt(n,O.matrix);im.setColorAt(n,BUSHC[Math.floor(h*BUSHC.length*7)%BUSHC.length]);});im.receiveShadow=true;g.add(im);}
    if(S.length){const ic=new THREE.InstancedMesh(tg(shadeG),shadeM,S.length),it=new THREE.InstancedMesh(tg(trunkG),trunkM,S.length);
      S.forEach(([x,y,z,h,q],n)=>{const w=h*(0.3+q*0.15);O.position.set(x,y+h*0.85,z);O.rotation.set(0,q*6.28,0);O.scale.set(w,h*0.4,w);O.updateMatrix();ic.setMatrixAt(n,O.matrix);ic.setColorAt(n,SHADEC[Math.floor(q*SHADEC.length)]);
        O.position.set(x,y,z);O.scale.set(1,h*0.85,1);O.updateMatrix();it.setMatrixAt(n,O.matrix);});ic.castShadow=true;g.add(ic,it);}
    g.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});scene.add(g);t.mesh=g;planted+=B.length;
    api.ctx.details.fincaBushes=planted;}
  let last=0;animHooks.push(now=>{if(now-last<500)return;last=now;const p=camera.position;let built=0;
    for(const t of tiles.values()){const dx=Math.max(0,Math.abs(p.x-(t.i+0.5)*TILE)-TILE/2),dz=Math.max(0,Math.abs(p.z-(t.j+0.5)*TILE)-TILE/2),near=Math.hypot(dx,dz)<FAR&&p.y-groundH(p.x,p.z)<FAR*1.5;
      if(near&&!t.mesh&&built<2){plant(t);built++;}   // two tiles a check at most, so a flight over the fincas does not stall
      if(t.mesh)t.mesh.visible=near;}});
  api.ctx.details=Object.assign(api.ctx.details||{},{fincaAreas:list.length,fincaTiles:tiles.size,fincaBushes:0});
}
