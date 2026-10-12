// ---------- Tokyo's roofs: aviation lights, helipads, rooftop billboards ----------
// What makes Tokyo's skyline Tokyo's after dark is the red: every tower over sixty metres carries aviation obstruction
// lights at its corners, and they blink, slowly, out of step, all across the city. By day the tall ones show their
// helipads - a painted ring and an H, the city's rule for buildings over a hundred metres - and the mid-rise roofs of
// Shinjuku, Shibuya and Ginza carry their billboards, framed in steel, lit at night.
// C.tokyoRoofs: {lights: minimum height, helipads: minimum height, billboards: {zones: [[lat, lon, radius]], share}}.
export function roofs(api){
  const {THREE,C,scene,FOOTPRINTS,P,animHooks,nightF,hour}=api;const K=C.tokyoRoofs;if(!K)return;
  const LMIN=K.lights||60,HMIN=K.helipads||100,area=r=>{let a=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length];a+=p[0]*q[1]-q[0]*p[1];}return Math.abs(a)/2;};
  const lights=[],pads=[],boards=[];
  const ZONES=((K.billboards||{}).zones||[]).map(([la,lo,r])=>[...P([la,lo]),r]),BSH=(K.billboards||{}).share||0.18;
  for(const f of FOOTPRINTS){const H=f.h-f.g,r=f.ring;if(r.length<3)continue;
    if(H>=LMIN){// the corners: the ring's sharpest turns, up to four, a light on each, and one on top in the middle of a tall one
      const cs=r.map((p,i)=>{const a=r[(i-1+r.length)%r.length],b=r[(i+1)%r.length],u=[p[0]-a[0],p[1]-a[1]],v=[b[0]-p[0],b[1]-p[1]],lu=Math.hypot(...u)||1,lv=Math.hypot(...v)||1;return [1-(u[0]*v[0]+u[1]*v[1])/(lu*lv),p];}).sort((x,y)=>y[0]-x[0]).slice(0,4);
      for(const [,p] of cs)lights.push([p[0],f.h+0.6,p[1],f.hsh]);if(H>150){const cx=r.reduce((s,p)=>s+p[0],0)/r.length,cz=r.reduce((s,p)=>s+p[1],0)/r.length;lights.push([cx,f.h+3,cz,f.hsh*7%1]);}}
    if(H>=HMIN&&area(r)>900){const cx=r.reduce((s,p)=>s+p[0],0)/r.length,cz=r.reduce((s,p)=>s+p[1],0)/r.length;if(api.inPoly(cx,cz,r))pads.push([cx,f.h,cz,Math.sqrt(area(r))]);}
    if(H>12&&H<50&&ZONES.some(([x,z,rr])=>(r[0][0]-x)**2+(r[0][1]-z)**2<rr*rr)&&((f.hsh*733)%1)<BSH){// a billboard on the roof's longest edge, standing back from it
      let best=0,bi=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L>best){best=L;bi=i;}}
      if(best>6){const a=r[bi],b=r[(bi+1)%r.length],cx=r.reduce((s,p)=>s+p[0],0)/r.length,cz=r.reduce((s,p)=>s+p[1],0)/r.length;boards.push([a,b,f.h,cx,cz,f.hsh]);}}}
  // the lights: one instanced mesh, red, blinking (a slow pulse, each its own phase), brighter as the light goes
  const lm=new THREE.InstancedMesh(new THREE.SphereGeometry(0.55,6,4),new THREE.MeshBasicMaterial({color:0xff2a1a,transparent:true}),Math.max(1,lights.length)),o=new THREE.Object3D();
  lights.forEach(([x,y,z],i)=>{o.position.set(x,y,z);o.updateMatrix();lm.setMatrixAt(i,o.matrix);});lm.userData.noWire=true;scene.add(lm);
  const phase=new Float32Array(lights.length);lights.forEach((l,i)=>phase[i]=l[3]*6.28);let lt=0;
  animHooks.push(now=>{if(now-lt<120)return;lt=now;const n=nightF(hour()),t=now/1000;lm.material.opacity=0.35+n*0.65;
    let i=0;for(const [x,y,z] of lights){const on=Math.sin(t*2.1+phase[i])>0.2;o.position.set(x,y,z);o.scale.setScalar(on?1+n*1.6:0.001);o.updateMatrix();lm.setMatrixAt(i,o.matrix);i++;}lm.instanceMatrix.needsUpdate=true;});
  // the helipads and the billboards: merged, coloured by vertex; the billboards' faces glow after dark
  const P2=[],N2=[],C2=[],SP=[],SN=[],SC=[],col=new THREE.Color(),m4=new THREE.Matrix4(),nm=new THREE.Matrix3(),v=new THREE.Vector3();
  const put=(geo,c,x,y,z,ry,sx,sy,sz,sign)=>{const g=geo.index?geo.toNonIndexed():geo,p=g.attributes.position,n=g.attributes.normal;m4.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0)),new THREE.Vector3(sx,sy,sz));nm.getNormalMatrix(m4);col.set(c);
    const [PP,NN,CC]=sign?[SP,SN,SC]:[P2,N2,C2];for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m4);PP.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();NN.push(v.x,v.y,v.z);CC.push(col.r,col.g,col.b);}};
  const BOX=new THREE.BoxGeometry(1,1,1),RING=new THREE.RingGeometry(0.42,0.5,24).rotateX(-Math.PI/2),DISC=new THREE.CircleGeometry(0.5,24).rotateX(-Math.PI/2);
  for(const [x,y,z,s] of pads){const d=Math.min(22,s*0.6);put(DISC,'#3c4044',x,y+0.06,z,0,d,1,d);put(RING,'#e8c020',x,y+0.08,z,0,d,1,d);
    put(BOX,'#f2f2f0',x-d*0.16,y+0.08,z,0,d*0.06,0.02,d*0.4);put(BOX,'#f2f2f0',x+d*0.16,y+0.08,z,0,d*0.06,0.02,d*0.4);put(BOX,'#f2f2f0',x,y+0.08,z,0,d*0.32,0.02,d*0.06);}
  const SIGNS=['#e8202a','#f2c020','#2a8ae8','#f2f2f2','#18b060','#e83a9a','#ff7a1a','#1a1a1e'];
  for(const [a,b,y,cx,cz,h] of boards){const L=Math.min(Math.hypot(b[0]-a[0],b[1]-a[1])*0.8,24),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,dx=cx-mx,dz=cz-mz,dl=Math.hypot(dx,dz)||1,x=mx+dx/dl*2.5,z=mz+dz/dl*2.5,ry=-Math.atan2(b[1]-a[1],b[0]-a[0]),H=Math.min(9,L*0.4);
    for(const s of [-0.4,0,0.4])put(BOX,'#6a6c70',x+(b[0]-a[0])/Math.hypot(b[0]-a[0],b[1]-a[1])*L*s,y+H/2+1,z+(b[1]-a[1])/Math.hypot(b[0]-a[0],b[1]-a[1])*L*s,ry,0.3,H+2,0.3);
    put(BOX,SIGNS[Math.floor(h*977)%SIGNS.length],x-dx/dl*0.3,y+2+H/2,z-dz/dl*0.3,ry,L,H,0.3,true);put(BOX,SIGNS[Math.floor(h*331)%SIGNS.length],x-dx/dl*0.32,y+2+H*0.3,z-dz/dl*0.32,ry,L*0.9,H*0.3,0.32,true);}
  const mk=(PP,NN,CC,m)=>{if(!PP.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(PP,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(NN,3));g.setAttribute('color',new THREE.Float32BufferAttribute(CC,3));g.computeBoundingSphere();const me=new THREE.Mesh(g,m);me.receiveShadow=true;scene.add(me);return me;};
  mk(P2,N2,C2,new THREE.MeshLambertMaterial({vertexColors:true}));
  const SM=new THREE.MeshLambertMaterial({vertexColors:true}),G={value:0.2};SM.onBeforeCompile=sh=>{sh.uniforms.uGlow=G;sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uGlow;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vColor.rgb*uGlow;');};
  mk(SP,SN,SC,SM);animHooks.push(()=>{G.value=0.2+nightF(hour())*0.9;});
  api.ctx.details=Object.assign(api.ctx.details||{},{aviationLights:lights.length,helipads:pads.length,rooftopBillboards:boards.length});
}
