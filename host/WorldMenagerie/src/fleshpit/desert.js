// ---------- the desert round the park ----------
// The caliche plain is not one colour: pale crusts of caliche where the soil has blown off it, the red of the sand
// between, darker ground under the brush - laid over the ground as flat patches, clear of the pit's apron and the
// roads. And it moves: dust devils wandering across it, a column of turning dust and the dust it throws out at the
// foot; tumbleweeds rolling downwind, bouncing, gone off the edge of the map and back in at the other.
export function desert(api){
  const {THREE,scene,animHooks,groundH,roadsNear,B}=api;let seed=41;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const W=Math.min(B.w,B.d)/2-200,o=new THREE.Object3D(),col=new THREE.Color();
  // ---- the patches ----
  const PC=['#e6dcc2','#e2d6b8','#d4b48c','#ccac86','#b8a67c','#aa9a72'],list=[];   // close to the plain's own colour: variation, not spots
  for(let i=0;i<900;i++){const x=(R()*2-1)*W,z=(R()*2-1)*W;if(Math.hypot(x,z)<460)continue;if(roadsNear&&roadsNear(x,z,10).length)continue;list.push([x,z,25+R()*90,15+R()*60,R()*6.28,PC[Math.floor(R()*PC.length)]]);}
    // soft-edged: a radial fade, so a patch melts into the ground round it
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const k=c.getContext('2d'),g=k.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,0.55)');g.addColorStop(0.6,'rgba(255,255,255,0.3)');g.addColorStop(1,'rgba(255,255,255,0)');k.fillStyle=g;k.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const pm=new THREE.InstancedMesh(new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xffffff,map:soft,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}),list.length);
  list.forEach(([x,z,a,b,r,c],i)=>{o.position.set(x,groundH(x,z)+0.06,z);o.rotation.set(0,r,0);o.scale.set(a,1,b);o.updateMatrix();pm.setMatrixAt(i,o.matrix);pm.setColorAt(i,col.set(c));});
  pm.receiveShadow=true;pm.userData.noFingerprint=true;scene.add(pm);
  // ---- dust devils: a turning column, and the dust round its foot ----
  const dust=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const k=c.getContext('2d'),g=k.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(220,196,150,0.8)');g.addColorStop(1,'rgba(220,196,150,0)');k.fillStyle=g;k.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const devils=[];for(let k=0;k<3;k++){const g=new THREE.Group();const N=160,pos=new Float32Array(N*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pts=new THREE.Points(geo,new THREE.PointsMaterial({map:dust,size:9,transparent:true,depthWrite:false,opacity:0.7}));g.add(pts);
    const cone=new THREE.Mesh(new THREE.CylinderGeometry(9,2.5,70,16,1,true).translate(0,35,0),new THREE.MeshLambertMaterial({color:0xd8c49a,transparent:true,opacity:0.16,depthWrite:false,side:THREE.DoubleSide}));g.add(cone);
    g.traverse(q=>{q.userData.noFingerprint=true;});scene.add(g);const P=[];for(let i=0;i<N;i++)P.push({h:R()*70,a:R()*6.28,r:R()});
    devils.push({g,pos,geo,P,x:(R()*2-1)*W*0.8,z:(R()*2-1)*W*0.8,hx:R()*6.28,cone});}
  // ---- tumbleweeds: a ball of twigs, rolling downwind ----
  const twig=(()=>{const g=new THREE.BufferGeometry(),p=[];for(let i=0;i<70;i++){const a=new THREE.Vector3(R()-0.5,R()-0.5,R()-0.5).normalize().multiplyScalar(0.9),b=new THREE.Vector3(R()-0.5,R()-0.5,R()-0.5).normalize().multiplyScalar(0.9);p.push(a.x,a.y,a.z,b.x,b.y,b.z);}
    g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));return g;})();
  const weeds=[];for(let k=0;k<14;k++){const m=new THREE.LineSegments(twig,new THREE.LineBasicMaterial({color:0x8a6a44}));m.scale.setScalar(0.6+R()*0.7);m.userData.noFingerprint=true;scene.add(m);
    weeds.push({m,x:(R()*2-1)*W,z:(R()*2-1)*W,v:3+R()*4,ph:R()*6});}
  const WIND=new THREE.Vector2(0.92,0.39);let last=0;
  animHooks.push(now=>{const t=now/1000,dt=last?Math.min(0.1,t-last):0;last=t;
    for(const d of devils){d.hx+=(Math.sin(t*0.07+d.x)*0.3)*dt;d.x+=Math.cos(d.hx)*4*dt+WIND.x*2*dt;d.z+=Math.sin(d.hx)*4*dt+WIND.y*2*dt;
      if(Math.abs(d.x)>W||Math.abs(d.z)>W||Math.hypot(d.x,d.z)<500){d.x=(R()*2-1)*W*0.8;d.z=(R()*2-1)*W*0.8;}
      const y0=groundH(d.x,d.z);d.g.position.set(d.x,y0,d.z);d.cone.rotation.y=t*3;
      for(let i=0;i<d.P.length;i++){const p=d.P[i];p.a+=dt*(3+2*(1-p.h/70));p.h+=dt*6;if(p.h>70){p.h=0;p.r=R();}const rr=1.5+p.h*0.12+p.r*3;d.pos[i*3]=Math.cos(p.a)*rr;d.pos[i*3+1]=p.h;d.pos[i*3+2]=Math.sin(p.a)*rr;}
      d.geo.attributes.position.needsUpdate=true;}
    for(const w of weeds){w.x+=WIND.x*w.v*dt;w.z+=WIND.y*w.v*dt;if(w.x>W)w.x=-W;if(w.z>W)w.z=-W;if(Math.hypot(w.x,w.z)<440){w.x-=900;}
      const bounce=Math.abs(Math.sin(t*2.2+w.ph))*0.8;w.m.position.set(w.x,groundH(w.x,w.z)+w.m.scale.x+bounce,w.z);w.m.rotation.set(t*w.v*0.6,0,-t*w.v*0.6);}});
  api.ctx.details=Object.assign(api.ctx.details||{},{desert:{patches:list.length,devils:devils.length,weeds:weeds.length}});
}
