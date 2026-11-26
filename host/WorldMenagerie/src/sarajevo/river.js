// ---------- Sarajevo: the Miljacka's channel ----------
// Through the city the Miljacka runs in a stone channel the Austrians built after the floods of the 1890s: walls of
// dressed stone four or five metres down to a shallow river over stones, an iron railing along the top, and a weir
// wherever the bed steps down. The water is drawn in reaches, each level (tools/build-osm-city.py, terrain.reaches);
// this draws the rest from the same polygons (OSM.water, the ones named C.river.name, each with its level y):
//   the walls  along every bank edge, from under the water up to the street (the ground a few metres back), where the
//              street stands more than C.river.minWall over the water; with a coping of pale stone along the top
//   the quay   a paved strip behind the coping, at the coping's height, over the ground the terrain cut leaves there
//   the rail   posts and two rails along the coping
//   the weirs  where a reach meets the one below it (their shared cut edges run along x): a sloping sheet of white
//              water from the upper level to the lower, the foam drawn moving down it
// Merged into a handful of meshes. Map data (c) OpenStreetMap contributors, ODbL.
export function river(api){
  const {THREE,C,scene,OSM,groundH,inWater,animHooks,mergeParts}=api;const K=C.river;if(!K)return;
  const NAME=K.name||'Miljacka',BACK=K.back||[7,10,13],MINW=K.minWall===undefined?1.2:K.minWall,QUAY=K.quay===undefined?6:K.quay;
  const polys=(OSM.water||[]).filter(w=>w.n===NAME&&typeof w.y==='number').map(w=>{const r=[];for(let i=0;i+1<w.o.length;i+=2)r.push([w.o[i]/10,w.o[i+1]/10]);
    let x0=1e9,x1=-1e9;for(const [x] of r){x0=Math.min(x0,x);x1=Math.max(x1,x);}return {r,y:w.y,x0,x1};});
  if(!polys.length)return;
  const wallP=[],copeP=[],quayP=[],railP=[],weirP=[];
  const quad=(list,a,b,c,d)=>list.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],a[0],a[1],a[2],c[0],c[1],c[2],d[0],d[1],d[2]);
  let nWall=0,nWeir=0;
  for(const P of polys){const r=P.r,n=r.length;let A=0;for(let i=0;i<n;i++){const p=r[i],q=r[(i+1)%n];A+=p[0]*q[1]-q[0]*p[1];}const sg=A>0?1:-1;
    for(let i=0;i<n;i++){const p=r[i],q=r[(i+1)%n],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<0.5)continue;
      const ex=(q[0]-p[0])/L,ez=(q[1]-p[1])/L,nx=ez*sg,nz=-ex*sg;   // nx,nz: away from the water
      if(Math.abs(p[0]-q[0])<0.05){   // a cut between reaches: a weir if this is the upper reach's downstream end
        if(Math.abs(p[0]-P.x0)>0.5)continue;const low=polys.find(Q=>Q!==P&&Math.abs(Q.x1-(P.x0+0.6))<0.4);if(!low||P.y-low.y<0.15)continue;
        const d=Math.min(3.5,(P.y-low.y)*2.2+0.8);nWeir++;
        quad(weirP,[p[0],P.y+0.02,p[1]],[q[0],P.y+0.02,q[1]],[q[0]-d,low.y+0.03,q[1]],[p[0]-d,low.y+0.03,p[1]]);continue;}
      // the street behind this stretch of bank: the highest of the ground a few metres back (the cut ground nearer)
      const st=k=>{let h=-1e9;for(const b of BACK){const g=groundH(k[0]+nx*b,k[1]+nz*b);if(g>P.y+0.3)h=Math.max(h,g);}return h;};   // the coarse water grid reaches past the bank: read the street by its height
      let ta=st(p),tb=st(q);if(ta<-1e8||tb<-1e8)continue;ta=Math.min(ta,P.y+(K.maxWall||9));tb=Math.min(tb,P.y+(K.maxWall||9));
      if(Math.min(ta,tb)-P.y<MINW)continue;nWall++;
      const b0=P.y-0.8;
      quad(wallP,[p[0],b0,p[1]],[q[0],b0,q[1]],[q[0],tb,q[1]],[p[0],ta,p[1]]);
      // the coping: a slab 0.5 m wide and 0.25 thick over the wall's top, and the quay behind it
      const o=0.5;quad(copeP,[p[0]-nx*0.05,ta+0.25,p[1]-nz*0.05],[q[0]-nx*0.05,tb+0.25,q[1]-nz*0.05],[q[0]+nx*o,tb+0.25,q[1]+nz*o],[p[0]+nx*o,ta+0.25,p[1]+nz*o]);
      quad(copeP,[p[0]-nx*0.05,ta,p[1]-nz*0.05],[q[0]-nx*0.05,tb,q[1]-nz*0.05],[q[0]-nx*0.05,tb+0.25,q[1]-nz*0.05],[p[0]-nx*0.05,ta+0.25,p[1]-nz*0.05]);
      quad(quayP,[p[0]+nx*o,ta+0.02,p[1]+nz*o],[q[0]+nx*o,tb+0.02,q[1]+nz*o],[q[0]+nx*QUAY,tb+0.02,q[1]+nz*QUAY],[p[0]+nx*QUAY,ta+0.02,p[1]+nz*QUAY]);
      // the railing: a post every two metres, two rails
      for(let s=0;s<L;s+=2){const f=s/L,x=p[0]+ex*s+nx*0.22,z=p[1]+ez*s+nz*0.22,y=ta+(tb-ta)*f+0.25;railP.push([x,y+0.55,z,0.06,1.1,0.06,0]);}
      const ry=Math.atan2(ex,ez);for(const hy of [1.05,0.55])railP.push([(p[0]+q[0])/2+nx*0.22,(ta+tb)/2+0.25+hy,(p[1]+q[1])/2+nz*0.22,0.05,0.05,L,ry]);}}
  const grp=new THREE.Group();grp.name='river';
  const mesh=(arr,mat)=>{if(!arr.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.receiveShadow=true;grp.add(m);return m;};
  const stone=new THREE.MeshLambertMaterial({color:K.wall||0xc4bba8,side:THREE.DoubleSide}),cope=new THREE.MeshLambertMaterial({color:K.coping||0xddd6c6,side:THREE.DoubleSide}),
    quay=new THREE.MeshLambertMaterial({color:K.quayColour||0xb8b2a6,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
  // the wall's courses: a few darker lines drawn in a texture laid by world height
  {const cv=document.createElement('canvas');cv.width=64;cv.height=64;const c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,64,64);c.fillStyle='#bdb5a6';
    for(let y=0;y<64;y+=16){c.fillRect(0,y,64,2);for(let x=(y/16)%2*16;x<64;x+=32)c.fillRect(x,y,2,16);}
    const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;stone.map=t;}
  const wm=mesh(wallP,stone);if(wm){const p=wm.geometry.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[i*2]=(p.getX(i)+p.getZ(i))/1.6;uv[i*2+1]=p.getY(i)/1.6;}wm.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));wm.castShadow=true;}
  mesh(copeP,cope);mesh(quayP,quay);
  if(railP.length){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:K.rail||0x2e3a3a}),railP.length),o=new THREE.Object3D();
    railP.forEach(([x,y,z,sx,sy,sz,ry],i)=>{o.position.set(x,y,z);o.rotation.set(0,ry,0);o.scale.set(sx,sy,sz);o.updateMatrix();im.setMatrixAt(i,o.matrix);});grp.add(im);}
  // the weirs: white water, its foam streaming down the step
  if(weirP.length){const cv=document.createElement('canvas');cv.width=64;cv.height=128;const c=cv.getContext('2d');c.fillStyle='rgba(235,240,236,0.55)';c.fillRect(0,0,64,128);
    for(let i=0;i<220;i++){c.fillStyle=`rgba(255,255,255,${0.3+Math.random()*0.6})`;c.fillRect(Math.random()*64,Math.random()*128,1+Math.random()*3,4+Math.random()*10);}
    const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;
    const wmm=mesh(weirP,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
    const p=wmm.geometry.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[i*2]=p.getZ(i)/4;uv[i*2+1]=p.getX(i)/3;}wmm.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    animHooks.push(now=>{t.offset.y=(now*0.0006)%1;});}
  grp.traverse(o=>{o.userData.noFingerprint=true;});scene.add(grp);
  api.ctx.details=Object.assign(api.ctx.details||{},{river:{reaches:polys.length,walls:nWall,weirs:nWeir}});
}
