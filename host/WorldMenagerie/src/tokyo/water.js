// ---------- boats on the Sumida ----------
// Yakatabune - the long wooden houseboats with a roof of red lanterns that take parties down the river to the bay of
// an evening - and the water buses between Asakusa and Hinode, the Hotaluna among them like a silver beetle. They go up
// and down the river's centreline (C.rivers.sumida), each in its own lane, turn at the ends, and float on whichever
// water is under them: the core's (ctx.waterLevel) or the streamed region's (src/core/metro.js, api.METRO_GH).
// After dark the yakatabune's lanterns and windows are lit.
export function water(api){
  const {THREE,C,scene,animHooks,camera,nightF,hour}=api;const K=C.boats,RV=C.rivers&&C.rivers.sumida;if(!K||!RV)return;
  const pts=RV.map(p=>api.P(p)),cum=[0];for(let i=0;i+1<pts.length;i++)cum.push(cum[i]+Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]));const LEN=cum[cum.length-1];
  const core=(C.metro&&C.metro.core||[])[0];const inCore=(x,z)=>{if(!core)return true;const [la,lo]=api.toLatLon(x,z);return la>core[0]&&la<core[2]&&lo>core[1]&&lo<core[3];};
  const at=s=>{s=Math.max(0,Math.min(LEN,s));let lo=0,hi=cum.length-2;while(lo<hi){const m=(lo+hi+1)>>1;if(cum[m]<=s)lo=m;else hi=m-1;}
    const a=pts[lo],b=pts[lo+1],L=cum[lo+1]-cum[lo]||1,t=(s-cum[lo])/L;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,(b[0]-a[0])/L,(b[1]-a[1])/L];};
  const waterY=(x,z)=>inCore(x,z)?(api.ctx.waterLevel||0.05):(api.METRO_GH?api.METRO_GH(x,z)+0.12:0);
  function body(parts){const pos=[],nor=[],col=[];for(const [g0,c,x,y,z] of parts){const g=g0.toNonIndexed().translate(x,y,z),p=g.attributes.position,n=g.attributes.normal,cc=new THREE.Color(c);
      for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(cc.r,cc.g,cc.b);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;}
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  // the yakatabune: a dark hull, a cabin of paper screens, the roof hung with red lanterns (the lit parts in their own mesh)
  const YK=body([[B(24,1.2,4.6),'#3a2a1e',0,0.3,0],[B(3,0.8,3.6),'#3a2a1e',12.6,0.5,0],[B(19,2.1,4.2),'#e8dcc0',-0.5,1.95,0],[B(20,0.35,4.8),'#2a2420',-0.5,3.15,0]]);
  const YKL=body([[B(18.6,1.2,4.25),'#ffd890',-0.5,2.0,0],...Array.from({length:9},(_,i)=>[new THREE.SphereGeometry(0.28,6,4),'#ff3020',-9.5+i*2.25,2.9,2.45]),...Array.from({length:9},(_,i)=>[new THREE.SphereGeometry(0.28,6,4),'#ff3020',-9.5+i*2.25,2.9,-2.45])]);
  // the water buses: a white hull, a long glazed cabin; the Hotaluna silver and low
  const WB=body([[B(30,1.6,6.4),'#f2f2ee',0,0.6,0],[B(4,1,5),'#f2f2ee',15.5,0.8,0],[B(20,2.2,5.6),'#2a4050',-2,2.5,0],[B(20.4,0.3,6),'#f2f2ee',-2,3.7,0]]);
  const HL=body([[B(32,1.4,7),'#c8ccd2',0,0.5,0],[new THREE.SphereGeometry(1,16,10).scale(14,2.6,3.2),'#c8ccd2',0,1.6,0],[new THREE.SphereGeometry(1,16,10).scale(12.5,2.2,2.9),'#3a5a6a',0,1.9,0]]);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true}),glow=new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x000000});
  glow.onBeforeCompile=sh=>{sh.uniforms.uG={value:0};glow.userData.u=sh.uniforms.uG;sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uG;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vColor.rgb*uG;');};
  let seed=11;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const fleet=[];const add=(geo,m,n,v,kind)=>{const im=new THREE.InstancedMesh(geo,m,Math.max(1,n));im.frustumCulled=false;im.castShadow=m===mat;scene.add(im);return im;};
  const boats=[];for(let i=0;i<(K.yakatabune||6);i++)boats.push({k:'y',s:R()*LEN,dir:R()<0.5?1:-1,v:1.6+R()*0.8,lane:(R()-0.5)*0.5});
  for(let i=0;i<(K.waterBuses||3);i++)boats.push({k:i===0?'h':'w',s:R()*LEN,dir:R()<0.5?1:-1,v:4.5+R()*1.5,lane:(R()-0.5)*0.5});
  // C.boats.start [lat, lon]: the first of each kind starts there (in sight of the view on the river)
  if(K.start){const [sx,sz]=api.P(K.start);let bs=0,bd=1e18;for(let s2=0;s2<LEN;s2+=10){const [x,z]=at(s2),d2=(x-sx)**2+(z-sz)**2;if(d2<bd){bd=d2;bs=s2;}}
    const fy=boats.find(b=>b.k==='y'),fw=boats.find(b=>b.k!=='y');if(fy){fy.s=bs+40;fy.dir=-1;}if(fw){fw.s=bs-260;fw.dir=1;}}
  const nY=boats.filter(b=>b.k==='y').length,yk=add(YK,mat,nY),ykl=add(YKL,glow,nY),wb=add(WB,mat,boats.filter(b=>b.k==='w').length),hl=add(HL,mat,boats.filter(b=>b.k==='h').length);
  const d=new THREE.Object3D();let last=0;
  animHooks.push(now=>{const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;let iy=0,iw=0,ih=0;
    for(const b of boats){b.s+=b.v*b.dir*dt;if(b.s>LEN-20){b.s=LEN-20;b.dir=-1;}if(b.s<20){b.s=20;b.dir=1;}
      const [x,z,dx,dz]=at(b.s),fx=dx*b.dir,fz=dz*b.dir,off=(b.dir>0?-1:1)*18+b.lane*10;   // keep to the left of the river, as on the road
      const px=x-fz*off,pz=z+fx*off;d.position.set(px,waterY(px,pz)-0.2,pz);d.rotation.set(0,Math.atan2(-fz,fx),0);d.updateMatrix();
      if(b.k==='y'){yk.setMatrixAt(iy,d.matrix);ykl.setMatrixAt(iy,d.matrix);iy++;}else if(b.k==='w')wb.setMatrixAt(iw++,d.matrix);else hl.setMatrixAt(ih++,d.matrix);}
    for(const im of [yk,ykl,wb,hl])im.instanceMatrix.needsUpdate=true;
    if(/boatdebug/.test(api.HASH0||'')){const b=boats[0],[x,z]=at(b.s);api.ctx.details.boat0=[Math.round(x),Math.round(waterY(x,z)*10)/10,Math.round(z),Math.round(b.s),inCore(x,z)];api.ctx.details.cam=camera.position.toArray().map(Math.round);}
    if(glow.userData.u)glow.userData.u.value=0.15+nightF(hour())*1.1;});
  api.ctx.details=Object.assign(api.ctx.details||{},{sumidaBoats:boats.length,sumidaLen:Math.round(LEN)});
  api.SUMIDA={at,len:LEN};
}
