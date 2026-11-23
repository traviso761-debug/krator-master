// ================================================================= SURFACE TEXTURE, DOOR & GEOMETRIC Z-FIGHTING AUDITS
// Installed on window._api right after 99-host-take.js (sorts '99-ms-audit.js' between '99-host-take.js' and '99-tail.html').
//   _api.textureAudit()  -> verifies EVERY non-emissive, non-glass, non-water mesh in scene carries a real library texture map
//   _api.zfightAudit(o)  -> world-space geometric coplanar triangle overlap detector across all buildings, waterwheels, doors & furniture
//   _api.doorsAudit()    -> verifies every unlocked door opens and shuts cleanly via core/door
(function(){
 if(!window._api)return;

 /* 1. Full-scene surface texture audit (buildings, ablaq bands, jade inlays, waterwheels, flumes, ground, fauna, AND furniture!) */
 window._api.textureAudit=function(){
  const untextured=[],exempt=[];
  let total=0,textured=0,buildingMeshes=0,furnitureMeshes=0,faunaMeshes=0;
  scene.traverse(m=>{
   if(!m.isMesh||!m.geometry)return;
   total++;
   const mats=Array.isArray(m.material)?m.material:[m.material];
   let inFurn=false,inFauna=false;
   for(let p=m;p;p=p.parent){
    if(p.userData&&p.userData.furniture)inFurn=true;
    if(SA_LIST.some(e=>e.g===p))inFauna=true;
   }
   for(const mt of mats){
    if(!mt)continue;
    const mk=m.userData&&m.userData.mk;
    const fam=mt.userData&&mt.userData.family;
    const isGlow=mk==='glow'||fam==='glow'||(mt.isMeshBasicMaterial&&!mt.map);
    const isGlass=mk==='glass'||fam==='glass'||!!(mt.userData&&mt.userData.kglass)||
     (mt.transparent&&mt.opacity<.9&&(mk==='water'||/glass|pane/i.test(m.name||'')));
    const isSea=m.name==='sea'&&mt.isShaderMaterial;
    if(isGlow||isGlass||isSea){
     exempt.push(m.name||mk||fam||'exempt');
     continue;
    }
    if(mt.map){
     textured++;
     if(inFurn)furnitureMeshes++;
     else if(inFauna)faunaMeshes++;
     else buildingMeshes++;
    }else{
     untextured.push((inFurn?'furn:':inFauna?'fauna:':'mesh:')+(m.name||mk||fam||mt.type));
    }
   }
  });
  return {total,textured,buildingMeshes,furnitureMeshes,faunaMeshes,exemptCount:exempt.length,untextured};
 };

 /* 2. Operable doors audit (core/door) */
 window._api.doorsAudit=function(){
  const settle=n=>{for(let i=0;i<(n==null?40:n);i++)KDOOR.step(.1);};
  const L=KDOOR.list.filter(D=>!D.locked),bad=[];
  for(const D of L)KDOOR.open(D,{by:'probe'});settle(40);
  for(const D of L){
   const l=KDOOR.leaves(D)[0];
   if(D.open<.99||(D.blocks.length&&!D.blocks.every(b=>b.off)))bad.push(D.id+' open '+D.open.toFixed(2));
   if(!l||![l.p[0],l.p[1],l.p[2]].every(isFinite))bad.push(D.id+' no pose');
  }
  for(const D of L)KDOOR.close(D,{by:'probe'});settle(40);
  for(const D of L)if(D.open>.01||(D.blocks.length&&D.blocks.some(b=>b.off)))bad.push(D.id+' did not shut');
  return {doors:L.length,locked:KDOOR.list.length-L.length,bad,spinners:DV_SPINNERS.length};
 };

 /* 2b. Triangle winding, backface-culling & water-material audit (`windingAudit`)
    Verifies:
      - 0 negative-determinant world matrices anywhere in scene (`negDet === 0`)
      - 0 inverted vertex-vs-face normals across WORLD (`vnMismatch === 0`)
      - 0 transparent window-'glass' horizontal water sheets (`waterGlassMisuse === 0`) + opaque textured `MAT.flumeWater`
      - Every `DV_SHELL_PROBES` record (`skirt`, `tower`, `hood`, `basket`, `gable`, `gumbat`, `flume`) has verified outward/upward/soffit normals */
 window._api.windingAudit=function(){
  scene.updateMatrixWorld(true);
  const instM=new THREE.Matrix4(),combM=new THREE.Matrix4(),normM=new THREE.Matrix3();
  const v0=new THREE.Vector3(),v1=new THREE.Vector3(),v2=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3(),vn=new THREE.Vector3();
  let negDet=0,vnMismatch=0,waterGlassMisuse=0,totalCheckedTris=0;
  const negDetNames=[],vnBadSamples=[],tris=[];

  scene.traverse(m=>{
   if(!m.isMesh||!m.geometry||!m.geometry.attributes.position)return;
   const cnt=m.isInstancedMesh?m.count:1;
   for(let inst=0;inst<cnt;inst++){
    if(m.isInstancedMesh){m.getMatrixAt(inst,instM);combM.multiplyMatrices(m.matrixWorld,instM);}
    else combM.copy(m.matrixWorld);
    if(combM.determinant()<-1e-9){
     negDet++;
     if(negDetNames.length<8)negDetNames.push(m.name||(m.userData&&m.userData.mk)||'mesh');
    }
   }
  });

  WORLD.traverse(m=>{
   if(!m.isMesh||!m.visible||!m.geometry||!m.geometry.attributes.position)return;
   let isFauna=false;for(let p=m;p;p=p.parent)if(SA_LIST.some(s=>s.g===p))isFauna=true;
   if(isFauna)return;
   const mt=Array.isArray(m.material)?m.material[0]:m.material;
   const mk=(m.userData&&m.userData.mk)||(mt&&mt.userData&&mt.userData.family)||m.name||'mesh';
   const pos=m.geometry.attributes.position,nor=m.geometry.attributes.normal,idx=m.geometry.index;
   const nIdx=idx?idx.count:pos.count,cnt=m.isInstancedMesh?m.count:1;
   for(let inst=0;inst<cnt;inst++){
    if(m.isInstancedMesh){m.getMatrixAt(inst,instM);combM.multiplyMatrices(m.matrixWorld,instM);}
    else combM.copy(m.matrixWorld);
    normM.getNormalMatrix(combM);
    for(let i=0;i<nIdx;i+=3){
     const ia=idx?idx.getX(i):i,ib=idx?idx.getX(i+1):i+1,ic=idx?idx.getX(i+2):i+2;
     v0.fromBufferAttribute(pos,ia).applyMatrix4(combM);
     v1.fromBufferAttribute(pos,ib).applyMatrix4(combM);
     v2.fromBufferAttribute(pos,ic).applyMatrix4(combM);
     e1.subVectors(v1,v0);e2.subVectors(v2,v0);
     const fn=new THREE.Vector3().crossVectors(e1,e2);
     const area=fn.length()*.5;
     if(area<1e-4)continue;
     fn.normalize();
     totalCheckedTris++;
     if(nor){
      vn.set(nor.getX(ia)+nor.getX(ib)+nor.getX(ic),nor.getY(ia)+nor.getY(ib)+nor.getY(ic),nor.getZ(ia)+nor.getZ(ib)+nor.getZ(ic));
      if(vn.lengthSq()>1e-8){
       vn.applyMatrix3(normM).normalize();
       if(fn.dot(vn)<-.02){
        vnMismatch++;
        if(vnBadSamples.length<8)vnBadSamples.push(mk+'@('+v0.x.toFixed(1)+','+v0.y.toFixed(1)+','+v0.z.toFixed(1)+')');
       }
      }
     }
     if((mk==='glass'||(mt&&mt.userData&&mt.userData.kglass))&&Math.abs(fn.y)>.85&&area>.35){
      waterGlassMisuse++;
     }
     tris.push({mk,cx:(v0.x+v1.x+v2.x)/3,cy:(v0.y+v1.y+v2.y)/3,cz:(v0.z+v1.z+v2.z)/3,nx:fn.x,ny:fn.y,nz:fn.z,area});
    }
   }
  });

  const probes=typeof DV_SHELL_PROBES!=='undefined'?DV_SHELL_PROBES:[];
  const shellBad=[],counts={skirt:0,tower:0,hood:0,basket:0,gable:0,gumbat:0,flume:0};
  for(const P0 of probes){
   counts[P0.kind]=(counts[P0.kind]||0)+1;
   if(!P0.ok){
    shellBad.push(`${P0.kind}@(${P0.x.toFixed(1)},${P0.z.toFixed(1)}) out=${P0.outN} in=${P0.inN} aux=${P0.auxN}`);
   }
  }
  const fwMat=MAT&&MAT.flumeWater;
  const flumeWaterOk=!!(fwMat&&!fwMat.transparent&&fwMat.depthWrite&&fwMat.map);
  return {
   ok:negDet===0&&vnMismatch===0&&waterGlassMisuse===0&&flumeWaterOk&&shellBad.length===0&&probes.length>=15,
   totalCheckedTris,negDet,negDetNames,vnMismatch,vnBadSamples,waterGlassMisuse,flumeWaterOk,
   probes:probes.length,counts,shellBad
  };
 };

 /* 3. World-space geometric coplanar triangle z-fighting audit
    Detects triangle pairs across WORLD (buildings, ablaq courses, jade medallions, roofs, bridges, waterwheels, door leaves & furniture) with:
      - same-direction normals (n1 . n2 > 0.998)
      - coplanar within tol = 0.0015 m (1.5 mm) at origin AND at all 3 vertices of each triangle
      - different material/colour signature (same material + same colour cannot visually flicker)
      - 2D polygon interior overlap > pen (0.004 m) via Separating Axis Theorem */
 function orthoBasis(nx,ny,nz){
  const ax=Math.abs(nx)<.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
  const n=new THREE.Vector3(nx,ny,nz);
  const u=new THREE.Vector3().crossVectors(n,ax).normalize();
  const w=new THREE.Vector3().crossVectors(n,u).normalize();
  return [u,w];
 }
 function sep2D(A,B,pen){
  for(const P0 of [A,B])for(let i=0;i<3;i++){
   const a=P0[i],b=P0[(i+1)%3],nx=-(b[1]-a[1]),ny=b[0]-a[0],l=Math.hypot(nx,ny);
   if(l<1e-8)continue;
   let a0=Infinity,a1=-Infinity,b0=Infinity,b1=-Infinity;
   for(const p of A){const s=(p[0]*nx+p[1]*ny)/l;if(s<a0)a0=s;if(s>a1)a1=s;}
   for(const p of B){const s=(p[0]*nx+p[1]*ny)/l;if(s<b0)b0=s;if(s>b1)b1=s;}
   if(a1-b0<pen||b1-a0<pen)return true;
  }
  return false;
 }

 window._api.zfightAudit=function(o){
  o=o||{};
  const tol=o.tol==null?.0015:o.tol,pen=o.pen==null?.004:o.pen,cell2D=2.0;
  const T=[],v0=new THREE.Vector3(),v1=new THREE.Vector3(),v2=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3();
  const instM=new THREE.Matrix4(),combM=new THREE.Matrix4(),ic=new THREE.Color();
  scene.updateMatrixWorld(true);
  let meshSeq=0;

  WORLD.traverse(m=>{
   if(!m.isMesh||!m.visible||!m.geometry||!m.geometry.attributes.position)return;
   const mt=m.material;if(!mt||Array.isArray(mt)||mt.transparent)return;
   const mk=(m.userData&&m.userData.mk)||(mt.userData&&mt.userData.family)||m.name||'mesh';
   if(mk==='glow'||mk==='glass'||mk==='water')return;
   let isFauna=false;for(let p=m;p;p=p.parent)if(SA_LIST.some(s=>s.g===p))isFauna=true;
   if(isFauna)return;
   meshSeq++;
   const pos=m.geometry.attributes.position,colAttr=m.geometry.attributes.color,idx=m.geometry.index;
   const nIdx=idx?idx.count:pos.count,mc=mt.color||WHITE;
   const instCount=m.isInstancedMesh?m.count:1;

   for(let inst=0;inst<instCount;inst++){
    if(m.isInstancedMesh){
     m.getMatrixAt(inst,instM);combM.multiplyMatrices(m.matrixWorld,instM);
     if(m.instanceColor)m.getColorAt(inst,ic);else ic.setRGB(1,1,1);
    }else{
     combM.copy(m.matrixWorld);ic.setRGB(1,1,1);
    }
    const mid=meshSeq*10000+inst;
    for(let i=0;i<nIdx;i+=3){
     const ia=idx?idx.getX(i):i,ib=idx?idx.getX(i+1):i+1,icx=idx?idx.getX(i+2):i+2;
     v0.fromBufferAttribute(pos,ia).applyMatrix4(combM);
     v1.fromBufferAttribute(pos,ib).applyMatrix4(combM);
     v2.fromBufferAttribute(pos,icx).applyMatrix4(combM);
     e1.subVectors(v1,v0);e2.subVectors(v2,v0);
     const nn=new THREE.Vector3().crossVectors(e1,e2);
     const area=nn.length()*.5;
     if(area<2e-4)continue;
     nn.normalize();
     let cr=mc.r*ic.r,cg=mc.g*ic.g,cb=mc.b*ic.b;
     if(colAttr){
      cr*=(colAttr.getX(ia)+colAttr.getX(ib)+colAttr.getX(icx))/3;
      cg*=(colAttr.getY(ia)+colAttr.getY(ib)+colAttr.getY(icx))/3;
      cb*=(colAttr.getZ(ia)+colAttr.getZ(ib)+colAttr.getZ(icx))/3;
     }
     const sig=mk+':'+Math.round(cr*20)+','+Math.round(cg*20)+','+Math.round(cb*20);
     const x0=Math.min(v0.x,v1.x,v2.x),x1=Math.max(v0.x,v1.x,v2.x);
     const y0=Math.min(v0.y,v1.y,v2.y),y1=Math.max(v0.y,v1.y,v2.y);
     const z0=Math.min(v0.z,v1.z,v2.z),z1=Math.max(v0.z,v1.z,v2.z);
     T.push({id:T.length,mid,mk,sig,q:[v0.clone(),v1.clone(),v2.clone()],n:nn,d:nn.dot(v0),b:[x0,y0,z0,x1,y1,z1]});
    }
   }
  });

  const planeBins=new Map();
  const pKey=(nx,ny,nz,id)=>nx+','+ny+','+nz+','+id;
  for(const t of T){
   const k=pKey(Math.round(t.n.x*20),Math.round(t.n.y*20),Math.round(t.n.z*20),Math.round(t.d/tol));
   let arr=planeBins.get(k);if(!arr){arr=[];planeBins.set(k,arr);}arr.push(t);
  }

  const pairSeen=new Set(),siteMap=new Map();
  let overlaps=0,upstreamResOverlaps=0;

  for(const [k,binTris] of planeBins){
   const n0=binTris[0].n,[uAx,wAx]=orthoBasis(n0.x,n0.y,n0.z);
   const parts=k.split(',').map(Number),[bx,by,bz,bd]=parts;
   const pool=[];
   for(let dx=0;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++)for(let dd=-1;dd<=1;dd++){
    if(dx===0&&(dy<0||(dy===0&&(dz<0||(dz===0&&dd<0)))))continue;
    const sub=planeBins.get(pKey(bx+dx,by+dy,bz+dz,bd+dd));
    if(sub)for(let q=0;q<sub.length;q++)pool.push(sub[q]);
   }
   if(pool.length<2)continue;

   const grid=new Map(),projCache=new Map();
   for(const t of pool){
    const P2=t.q.map(p=>[p.dot(uAx),p.dot(wAx)]);
    projCache.set(t.id,P2);
    const u0=Math.floor((Math.min(P2[0][0],P2[1][0],P2[2][0])-pen)/cell2D);
    const u1=Math.floor((Math.max(P2[0][0],P2[1][0],P2[2][0])+pen)/cell2D);
    const w0=Math.floor((Math.min(P2[0][1],P2[1][1],P2[2][1])-pen)/cell2D);
    const w1=Math.floor((Math.max(P2[0][1],P2[1][1],P2[2][1])+pen)/cell2D);
    for(let iu=u0;iu<=u1;iu++)for(let iw=w0;iw<=w1;iw++){
     const gk=iu+','+iw;let g=grid.get(gk);if(!g){g=[];grid.set(gk,g);}g.push(t);
    }
   }

   for(const cell of grid.values()){
    const len=cell.length;if(len<2)continue;
    for(let i=0;i<len;i++){
     const t=cell[i],tb=t.b;
     for(let j=i+1;j<len;j++){
      const s=cell[j];
      if(t.sig===s.sig)continue;
      const sb=s.b;
      if(tb[3]-sb[0]<pen&&Math.abs(t.n.x)<.99)continue;
      if(sb[3]-tb[0]<pen&&Math.abs(t.n.x)<.99)continue;
      if(tb[5]-sb[2]<pen&&Math.abs(t.n.z)<.99)continue;
      if(sb[5]-tb[2]<pen&&Math.abs(t.n.z)<.99)continue;
      if(tb[4]<sb[1]-tol||sb[4]<tb[1]-tol)continue;
      if(t.n.dot(s.n)<.998||Math.abs(t.d-s.d)>tol)continue;
      const pk=t.id<s.id?t.id+'|'+s.id:s.id+'|'+t.id;
      if(pairSeen.has(pk))continue;
      if(s.q.some(p=>Math.abs(t.n.dot(p)-t.d)>tol)||t.q.some(p=>Math.abs(s.n.dot(p)-s.d)>tol))continue;
      const A2=projCache.get(t.id),B2=s.q.map(p=>[p.dot(uAx),p.dot(wAx)]);
      if(sep2D(A2,B2,pen))continue;
      pairSeen.add(pk);
      const midPt=new THREE.Vector3().addVectors(t.q[0],s.q[0]).multiplyScalar(.5);
      const rSite=regAt(midPt),siteKey=rSite?rSite.key:'world';
      if(rSite&&rSite.kind==='res-node'&&!o.includeUpstreamRes){
       upstreamResOverlaps++;
       continue;
      }
      overlaps++;
      const label=siteKey+': '+[t.mk,s.mk].sort().join(' vs ');
      const entry=siteMap.get(label)||{site:siteKey,pair:[t.mk,s.mk].sort().join(' vs '),count:0,at:[+midPt.x.toFixed(2),+midPt.y.toFixed(2),+midPt.z.toFixed(2)]};
      entry.count++;siteMap.set(label,entry);
     }
    }
   }
  }
  const pairs=Array.from(siteMap.values()).sort((a,b)=>b.count-a.count);
  return {totalTris:T.length,tolMm:+(tol*1000).toFixed(2),overlaps,upstreamResOverlaps,pairs};
 };
})();
