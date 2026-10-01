// ---------- the woods ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// "the smell of the pine-trees ... The trees changed to beech and oak, and there was a comfortable feeling in
// the twilight." Going down into the valley the trees change: firs on the rims and the slopes under them,
// beech and oak on the floor, in groves with meadow between. Tolkien's drawings put birches beside the paths.
// Nothing stands on the rock, in the water, on a path or on the lawns round the house.
//
// Three instanced kinds, each a canopy and a trunk. Every canopy carries two colours - Tolkien's summer and
// the film's autumn - and the Season button moves between them (with the ground: ground.js).

export function woods(api){
  const {THREE,ctx,scene,groundH}=api;
  const V=ctx.valley;if(!V)return;
  const R=mkR(3021);
  const B=api.B,HX=B.w/2,HZ=B.d/2;
  const rv=V.river;                                     // [x, z, level, halfwidth], east to west
  const riverAt=x=>{let k=0;while(k<rv.length-1&&rv[k+1][0]>x)k++;const a=rv[k],b=rv[Math.min(rv.length-1,k+1)];const t=a[0]===b[0]?0:(x-a[0])/(b[0]-a[0]);
    return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t];};
  const S=V.sites,house=S.house;
  const roads=(api.ROADS||[]).map(r=>r.pts);
  const nearRoad=(x,z,d)=>{for(const p of roads){for(let i=0;i+1<p.length;i++){const [ax,az]=p[i],[bx,bz]=p[i+1];
    if(Math.max(ax,bx)+d<x||Math.min(ax,bx)-d>x||Math.max(az,bz)+d<z||Math.min(az,bz)-d>z)continue;
    const dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz,t=L?Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/L)):0;if(Math.hypot(x-ax-t*dx,z-az-t*dz)<d)return true;}}return false;};
  const slopeAt=(x,z)=>Math.hypot(groundH(x+3,z)-groundH(x-3,z),groundH(x,z+3)-groundH(x,z-3))/6;
  const vn=(x,z)=>{const h=(i,j)=>{let s=Math.imul(i,374761393)^Math.imul(j,668265263);s=Math.imul(s^(s>>>13),1274126177);return ((s^(s>>>16))>>>0)/4294967296;};
    const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);
    return h(xi,zi)*(1-u)*(1-v)+h(xi+1,zi)*u*(1-v)+h(xi,zi+1)*(1-u)*v+h(xi+1,zi+1)*u*v;};

  const fir=[],broad=[],birch=[];
  const tryAt=(x,z)=>{
    if(Math.abs(x)>HX-20||Math.abs(z)>HZ-20)return;
    const [rz,lv,hw]=riverAt(x),dR=Math.abs(z-rz);
    if(dR<hw+7)return;
    const y=groundH(x,z),sl=slopeAt(x,z),above=y-lv;
    if(sl>0.95)return;                                               // rock
    if(Math.hypot(x-house.x,z-house.z)<95)return;                    // the house and its lawns
    for(const p of S.pavilions)if(Math.hypot(x-p.x,z-p.z)<14)return;
    if(Math.hypot(x-S.bridge.x,z-(S.bridge.zN+S.bridge.zS)/2)<40||Math.hypot(x-S.stair.x,z-S.stair.z)<45)return;   // keep the bridge and the stair in sight
    const grove=vn(x*0.012,z*0.012);
    let kind=null;
    if(above<45){                                                    // the floor: groves of beech and oak, meadow between
      if(grove>0.5||(above>28&&grove>0.38))kind='broad';
    }else if(above<170){                                             // the lower slopes: mixed
      if(grove>0.3)kind=R()<0.45?'fir':'broad';
    }else if(above<290){                                             // under the rim: fir, in stands
      if(grove>0.32)kind='fir';
    }else{                                                           // the moor: stands of fir near the edge, fewer further out
      const edge=Math.min(...['north','south'].map(k=>{const rim=V.rim[k];let m=1e9;for(const [rx,rz2] of rim)if(Math.abs(rx-x)<120)m=Math.min(m,Math.abs(rz2-z));return m;}));
      // not right on the lip, where the views are from, and thinning out across the moor
      if(edge>40&&grove>0.6&&R()<Math.max(0.03,0.8-edge/600))kind='fir';
    }
    if(!kind)return;
    if(nearRoad(x,z,5))return;
    y>0&&(kind==='fir'?fir:broad).push([x,y,z]);
  };
  // candidates on a jittered grid, closer where there is more to see
  for(let z=-HZ;z<HZ;z+=14)for(let x=-HX;x<HX;x+=14){
    const [rz]=riverAt(x);const far=Math.abs(z-rz)>900;if(far&&R()<0.72)continue;
    tryAt(x+(R()-0.5)*13,z+(R()-0.5)*13);}
  // birches: along the paths near the house and by the water, in ones and twos
  for(const p of roads)for(let i=0;i+1<p.length;i++){const [ax,az]=p[i],[bx,bz]=p[i+1],L=Math.hypot(bx-ax,bz-az);
    for(let s=0;s<L;s+=18){if(R()<0.55)continue;const t=s/L,x=ax+(bx-ax)*t,z=az+(bz-az)*t;if(Math.hypot(x-house.x,z-house.z)>900)continue;
      const off=(R()<0.5?-1:1)*(4+R()*4),nx=-(bz-az)/L,nz=(bx-ax)/L,px=x+nx*off,pz=z+nz*off;
      const [rz,,hw]=riverAt(px);if(Math.abs(pz-rz)<hw+4||slopeAt(px,pz)>0.8||Math.hypot(px-house.x,pz-house.z)<60)continue;birch.push([px,groundH(px,pz),pz]);}}

  // ---- the shapes ----
  const merge=(list)=>{const pos=[],nor=[];for(const g0 of list){const g=g0.index?g0.toNonIndexed():g0;g.computeVertexNormals();pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return g;};
  const firCanopy=merge([new THREE.ConeGeometry(0.42,0.55,7).translate(0,0.42,0),new THREE.ConeGeometry(0.32,0.45,7).translate(0,0.66,0),new THREE.ConeGeometry(0.2,0.34,7).translate(0,0.86,0)]);
  const broadCanopy=merge([new THREE.IcosahedronGeometry(0.34,0).translate(0,0.62,0),new THREE.IcosahedronGeometry(0.26,0).translate(0.2,0.72,0.08),
    new THREE.IcosahedronGeometry(0.25,0).translate(-0.17,0.7,-0.12),new THREE.IcosahedronGeometry(0.22,0).translate(0.02,0.86,0.05)]);
  const birchCanopy=merge([new THREE.IcosahedronGeometry(0.2,0).scale(1,1.7,1).translate(0,0.7,0),new THREE.IcosahedronGeometry(0.14,0).scale(1,1.5,1).translate(0.08,0.86,0.04)]);
  const trunk=new THREE.CylinderGeometry(0.03,0.05,0.5,5).translate(0,0.25,0);
  const birchTrunk=new THREE.CylinderGeometry(0.018,0.026,0.8,5).translate(0,0.4,0);
  const o=new THREE.Object3D(),col=new THREE.Color();
  const summerOf={fir:[0x2d4a2c,0x324f2e,0x27432a,0x3a5534],broad:[0x4f7a34,0x5a8438,0x466f30,0x68903e,0x3f6a2c],birch:[0x8ab04a,0x9ab85a,0x7aa044]};
  const autumnOf={fir:[0x2d4a2c,0x345230,0x2a452a,0x3c5534],broad:[0xc08a2c,0xb0681e,0xd4a23a,0x9a7a2a,0x8a4a1e,0xc49a44],birch:[0xe0c050,0xd4b040,0xe8cc60]};
  const kinds=[];
  function plant(name,list,canopy,tr,hmin,hmax,wk,trunkCol){
    if(!list.length)return;
    const cm=new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),tm=new THREE.MeshLambertMaterial({color:trunkCol,flatShading:true});
    const c=new THREE.InstancedMesh(canopy,cm,list.length),t=new THREE.InstancedMesh(tr,tm,list.length);
    const sum=[],aut=[];
    list.forEach(([x,y,z],i)=>{const h=hmin+(hmax-hmin)*R(),w=h*wk*(0.85+R()*0.3);
      o.position.set(x,y-0.3,z);o.rotation.set((R()-0.5)*0.06,R()*6.28,(R()-0.5)*0.06);o.scale.set(w,h,w);o.updateMatrix();
      c.setMatrixAt(i,o.matrix);t.setMatrixAt(i,o.matrix);
      const s=summerOf[name][Math.floor(R()*summerOf[name].length)],a=autumnOf[name][Math.floor(R()*autumnOf[name].length)];
      sum.push(col.setHex(s).clone());aut.push(col.setHex(a).clone());c.setColorAt(i,sum[i]);});
    c.instanceColor.needsUpdate=true;
    for(const m of [c,t]){m.castShadow=true;m.receiveShadow=false;m.frustumCulled=false;m.userData.wireCat='veg';scene.add(m);}
    kinds.push({c,sum,aut});
  }
  plant('fir',fir,firCanopy,trunk,14,27,0.62,0x4a3a2a);
  plant('broad',broad,broadCanopy,trunk,11,20,0.72,0x5a4a38);
  plant('birch',birch,birchCanopy,birchTrunk,9,15,0.8,0xe8e4da);
  function setSeason(v){for(const k of kinds){for(let i=0;i<k.sum.length;i++){col.copy(k.sum[i]).lerp(k.aut[i],v);k.c.setColorAt(i,col);}k.c.instanceColor.needsUpdate=true;}}
  ctx.rivWoods={setSeason};
  ctx.details=Object.assign(ctx.details||{},{firs:fir.length,broadleaf:broad.length,birches:birch.length});
}

function mkR(s){return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
