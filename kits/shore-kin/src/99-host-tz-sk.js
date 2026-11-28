// ================================================================= THE KIT'S VIEWS & PROBE AUDITS (verify.py --assert), added onto window._api
//   doorsAudit()         every unlocked door opens and shuts cleanly (core/door)
//   reachAudit()         every building's walk targets AND every registered KWALK floor is reached (0 unreached floors)
//   ceilingAudit()       upward FrontSide raycast from every indoor target proving 100% solid interior ceilings & vault liners
//   waterAudit()         verifies salt pans, steaming trough, rainwater court, tide-shrine basin & weir/slip flows on core/water
//   atmosWindAudit()     verifies ATMOS wind & gust hooks on sharkskin, ray-hide, catechu, byssus, kelp, nets & shell chimes
//   texturesAudit()      verifies 100% of opaque/lit surfaces carry decoded library maps
//   zfightAudit()        world-space geometric coplanar triangle overlap scanner across all buildings & furnished interiors
//   materialsBillAudit() verifies every building carries structured Arch/sea material records & zero Crookshore nephrite/red-cypress
//   tradesAudit()        verifies 44-row Voth census coverage + residential poor/middle/rich x single/multi
//   vstackAudit()        verifies Stage 5 M1-M4, K1 shader dedup (<= 28 programs, <= 12 samplers) & Stage 7 KROOMLIGHT
(function(){
 const A=window._api||(window._api={});
 if(typeof groundM!=='undefined')groundM.name='ground';

 if(typeof VIEWS!=='undefined'&&typeof SITES!=='undefined'&&typeof ROWS!=='undefined'){
  const addView=(name,arr)=>{
   VIEWS[name]=arr;
   const sel=document.querySelector('#ui select');
   if(sel&&![...sel.options].some(o=>o.value===name)){
    const opt=document.createElement('option');
    opt.value=opt.textContent=name;
    sel.insertBefore(opt,sel.options[2]||null);
   }
  };
  if(ROWS[0])addView('Shore-Kin Dwellings Row',[ROWS[0].w*.08,26,ROWS[0].z+54,0,4.5,ROWS[0].z]);
  if(ROWS[1])addView('Shore-Kin Compounds Client Hall and Tide Shrine Row',[ROWS[1].w*.08,28,ROWS[1].z+58,0,5.5,ROWS[1].z]);
  if(ROWS[2])addView('Shore-Kin Hinterland Works and Harbour Sheds Row',[ROWS[2].w*.08,30,ROWS[2].z+64,0,4.5,ROWS[2].z]);
  const byKey=k=>SITES.find(s=>s.key===k);
  const sHall=byKey('sk_client_hall');
  if(sHall)addView('Caretaker Client Moot Hall and Paktong Mask',[sHall.x+13,12,sHall.z+25,sHall.x,6.2,sHall.z]);
  const sLodge=byKey('sk_serpentine_lodge');
  if(sLodge)addView('Battered Serpentinite and Mangrove-Rib Lodge',[sLodge.x+11,10,sLodge.z+21,sLodge.x,4.2,sLodge.z]);
  const sHex=byKey('sk_hex_lime_house');
  if(sHex)addView('Hexagonal Shell-Limewash Artisan House',[sHex.x+10,9,sHex.z+19,sHex.x,4.5,sHex.z]);
  const sComp=byKey('sk_compound_house');
  if(sComp)addView('Two-Storey Shipwright Factor Compound',[sComp.x+12,11,sComp.z+23,sComp.x,5.8,sComp.z]);
  const sShrine=byKey('sk_tide_shrine');
  if(sShrine)addView('Stepped Serpentinite and Paktong Tide Shrine',[sShrine.x+10,9.5,sShrine.z+20,sShrine.x,4.6,sShrine.z]);
  const sFound=byKey('sk_paktong_foundry');
  if(sFound)addView('Paktong Cupola Foundry and Roast Heap',[sFound.x+12,10.5,sFound.z+22,sFound.x,4.5,sFound.z]);
  const sSalt=byKey('sk_fish_saltery');
  if(sSalt)addView('Intertidal Fish Weir and Brucite Salt Pans',[sSalt.x+12,10.5,sSalt.z+22,sSalt.x,3.8,sSalt.z]);
  const sBoat=byKey('sk_boat_grid_shed');
  if(sBoat)addView('Tarred Mangrove-Crib Skiff and Tender Shed',[sBoat.x+11,9.5,sBoat.z+23,sBoat.x,4.2,sBoat.z]);
 }

 const settle=n=>{for(let i=0;i<(n==null?40:n);i++)KDOOR.step(.1);};
 function fp(){
  let h=0x811c9dc5;
  const mix=s=>{for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
  for(const r of REG)mix(r.key+'|'+r.x.toFixed(3)+'|'+r.z.toFixed(3)+'|'+r.ry.toFixed(4)+'|'+r.tris);
  mix(JSON.stringify(KDOOR.export().doors.map(d=>[d.id,d.kind,+d.at[0].toFixed(3),+d.at[2].toFixed(3)])));
  mix(String(SVF.placed.length));
  return ('00000000'+h.toString(16)).slice(-8);
 }

 function polyClip2D(subj,clip){
  let out=subj;
  for(let i=0;i<clip.length&&out.length;i++){
   const a=clip[i],b=clip[(i+1)%clip.length],ex=b[0]-a[0],ey=b[1]-a[1];
   const inp=out;out=[];
   const inside=p=>ex*(p[1]-a[1])-ey*(p[0]-a[0])>=-1e-9;
   const inter=(p,q)=>{
    const dx=q[0]-p[0],dy=q[1]-p[1],den=ex*dy-ey*dx;
    if(Math.abs(den)<1e-12)return p;
    const t=((p[0]-a[0])*ey-(p[1]-a[1])*ex)/den;
    return [p[0]+t*dx,p[1]+t*dy];
   };
   for(let j=0;j<inp.length;j++){
    const cur=inp[j],prev=inp[(j+inp.length-1)%inp.length],cIn=inside(cur),pIn=inside(prev);
    if(cIn){if(!pIn)out.push(inter(prev,cur));out.push(cur);}
    else if(pIn)out.push(inter(prev,cur));
   }
  }
  if(out.length<3)return 0;
  let area=0;
  for(let i=0;i<out.length;i++){
   const p=out[i],q=out[(i+1)%out.length];
   area+=p[0]*q[1]-q[0]*p[1];
  }
  return Math.abs(area)*0.5;
 }

 Object.assign(A,{
  doorsAudit(){
   const L=KDOOR.list.filter(D=>!D.locked),bad=[];
   for(const D of L)KDOOR.open(D,{by:'probe'});settle(40);
   for(const D of L){
    const l=KDOOR.leaves(D)[0];
    if(D.open<.99||(D.blocks.length&&!D.blocks.every(b=>b.off)))bad.push(D.id+' open '+D.open.toFixed(2));
    if(!l||![l.p[0],l.p[1],l.p[2]].every(isFinite))bad.push(D.id+' no pose');
   }
   for(const D of L)KDOOR.close(D,{by:'probe'});settle(40);
   for(const D of L)if(D.open>.01||(D.blocks.length&&D.blocks.some(b=>b.off)))bad.push(D.id+' did not shut');
   return {doors:L.length,locked:KDOOR.list.length-L.length,bad};
  },

  reachAudit(){
   const L=KDOOR.list.filter(D=>!D.locked);
   for(const D of L)KDOOR.open(D,{by:'probe'});settle(40);
   const out=[];let n=0;
   for(const r of REG){
    if(r.parent||r.cls!=='building')continue;
    n++;
    const starts=[];
    for(const d of (r.doors||[])){
     starts.push([d.wx,d.wy,d.wz]);
     const ox=d.wx+Math.sin(d.yaw),oz=d.wz+Math.cos(d.yaw);
     starts.push([ox,terrainH(ox,oz),oz]);
    }
    if(r.front&&r.front.world){
     const f=r.front.world;
     starts.push([f.x,f.y,f.z]);
     const ox=f.x+Math.sin(f.yaw),oz=f.z+Math.cos(f.yaw);
     starts.push([ox,terrainH(ox,oz),oz]);
    }
    if(!starts.length){out.push({key:r.key,why:'no starts'});continue;}
    const b=r.bbox,box=[b.mn[0]-3.5,b.mx[0]+3.5,b.mn[2]-3.5,b.mx[2]+3.5];
    const R=KWALK.reach(starts,{ground:terrainH,box,cell:.35}),got=new Set(R.reached);
    const mine=F=>{const t=F.tag||'';return t.slice(t.indexOf(':')+1)===r.key;};
    const unr=R.unreached.filter(mine);
    const miss=(r.targets||[]).filter(t=>!KWALK.floorsAt(t.x,t.z).some(f=>Math.abs(f[0]-t.y)<.42&&got.has(f[1])));
    if(miss.length||unr.length){
     out.push({key:r.key,missed:miss.map(t=>t.name).concat(unr.map(u=>u.name+':'+u.tag)),reached:R.reached.filter(mine).length,unreached:unr.length});
    }
   }
   for(const D of L)KDOOR.close(D,{by:'probe'});settle(40);
   return {buildings:n,bad:out};
  },

  ceilingAudit(){
   scene.updateMatrixWorld(true);
   const rc=new THREE.Raycaster(),up=new THREE.Vector3(0,1,0),org=new THREE.Vector3();
   const skyLeaks=[];let probed=0;
   const meshes=[];
   WORLD.traverse(m=>{
    if(!m.isMesh||!m.visible||!m.material||m.material.transparent)return;
    let inFurn=false;for(let p=m;p;p=p.parent)if(p===SVF.group)inFurn=true;
    if(!inFurn)meshes.push(m);
   });
   for(const r of REG){
    if(r.parent||!r.targets)continue;
    for(const t of r.targets){
     if(!t.indoor)continue;
     probed++;
     org.set(t.x,t.y+1.45,t.z);
     rc.set(org,up);rc.near=.05;rc.far=35;
     const hits=rc.intersectObjects(meshes,false);
     if(!hits.length)skyLeaks.push(r.key+':'+t.name);
    }
   }
   return {ok:probed>=16&&!skyLeaks.length,probed,skyLeaks};
  },

  waterAudit(){
   if(typeof WATER==='undefined')return {ok:false,stills:0,flows:0,drawn:0,progIssues:1};
   renderer.render(scene,camera);
   const stills=WATER.surfaces.filter(s=>s.kind==='still').length;
   const flows=WATER.surfaces.filter(s=>s.kind==='flow').length;
   const drawn=(WATER.drawn||[]).filter(d=>d.mesh&&d.mesh.parent===scene).length;
   const progIssues=WATER.checkPrograms?WATER.checkPrograms(renderer,scene).length:0;
   return {ok:stills>=4&&flows>=2&&drawn>=6&&progIssues===0,stills,flows,drawn,progIssues};
  },

  atmosWindAudit(){
   renderer.render(scene,camera);
   const progIssues=typeof KHOOK!=='undefined'?KHOOK.checkPrograms(renderer,scene):[];
   const hooked=[],unhooked=[],unbound=[];
   let pinnedVerts=0,freeVerts=0,maxPinDrift=0,maxWindDisp=0;
   WORLD.traverse(m=>{
    if(!m.isMesh||!m.userData||!SV_CLOTH[m.userData.mk])return;
    const mk=m.userData.mk,mat=m.material;
    if(typeof KHOOK!=='undefined'&&KHOOK.has(mat,'atmos-sk-wind'))hooked.push(mk);
    else unhooked.push(mk);
    const sh=mat.userData&&mat.userData.skShader;
    if(!sh||sh.uniforms.uAtmWind!==ATMOS.U.wind||sh.uniforms.uAtmTime!==ATMOS.U.time||sh.uniforms.uAtmGust!==ATMOS.U.gustAmp){
     unbound.push(mk);
    }
    const P0=m.geometry.attributes.position,F0=m.geometry.attributes.aFlut;
    if(!P0||!F0)return;
    const gAmp=ATMOS.U.gustAmp.value;
    for(let i=0;i<P0.count;i++){
     const fx=F0.getX(i),fy=F0.getY(i),fz=F0.getZ(i),mag=Math.hypot(fx,fy,fz);
     const wx=P0.getX(i),wy=P0.getY(i),wz=P0.getZ(i);
     if(mag<=1e-5){
      pinnedVerts++;
      const d0=skWindDisplace(wx,wy,wz,fx,fy,fz,4.0,3.5,-2.0,gAmp);
      maxPinDrift=Math.max(maxPinDrift,Math.hypot(d0[0],d0[1],d0[2]));
     }else{
      freeVerts++;
      if(freeVerts%5===1){
       const dA=skWindDisplace(wx,wy,wz,fx,fy,fz,2.0,3.2,1.4,gAmp);
       maxWindDisp=Math.max(maxWindDisp,Math.hypot(dA[0],dA[1],dA[2]));
      }
     }
    }
   });
   return {
    ok:!progIssues.length&&hooked.length>=5&&!unhooked.length&&!unbound.length&&pinnedVerts>20&&freeVerts>40&&maxPinDrift===0&&maxWindDisp>0.03,
    hooked,unhooked,unbound,progIssues:progIssues.length,pinnedVerts,freeVerts,
    maxPinDrift:+maxPinDrift.toFixed(6),maxWindDisp:+maxWindDisp.toFixed(4)
   };
  },

  texturesAudit(){
   let meshes=0,textured=0;
   const bare=[];
   scene.updateMatrixWorld(true);
   WORLD.traverse(m=>{
    if(!m.isMesh||!m.visible||!m.material)return;
    const mats=Array.isArray(m.material)?m.material:[m.material];
    for(const mt of mats){
     const fam=(mt.userData&&mt.userData.family)||'';
     const mk=m.userData&&m.userData.mk||'';
     if(mt.isMeshBasicMaterial||mt.transparent||mk==='glow'||mk==='glass'||mk==='water'||fam==='glow'||fam==='glass')continue;
     meshes++;
     if(mt.map&&mt.map.image)textured++;
     else bare.push((m.name||mk||fam||'mesh')+'('+mt.type+')');
    }
   });
   return {ok:meshes>15&&!bare.length,meshes,textured,bare};
  },

  zfightAudit(){
   scene.updateMatrixWorld(true);
   const tris=[],vA=new THREE.Vector3(),vB=new THREE.Vector3(),vC=new THREE.Vector3();
   const e1=new THREE.Vector3(),e2=new THREE.Vector3(),cr=new THREE.Vector3(),mat4=new THREE.Matrix4(),ic=new THREE.Color();
   let matSeq=0;const matIds=new WeakMap();
   const getMatId=mt=>{let id=matIds.get(mt);if(!id){id=++matSeq;matIds.set(mt,id);}return id;};
   const qCol=(r,g,b)=>((Math.round(clamp(r,0,1)*31)<<10)|(Math.round(clamp(g,0,1)*31)<<5)|Math.round(clamp(b,0,1)*31));
   const siteNameAt=(x,y,z)=>{const r=regAt({x,y,z});return r?r.key:'world';};

   const pushTri=(ax,ay,az,bx,by,bz,cx,cy,cz,matId,mkName,colKey,dbl)=>{
    e1.set(bx-ax,by-ay,bz-az);e2.set(cx-ax,cy-ay,cz-az);cr.crossVectors(e1,e2);
    const len=cr.length();if(len<2e-5)return;
    const nx=cr.x/len,ny=cr.y/len,nz=cr.z/len;
    const maxY=Math.max(ay,by,cy);
    if(!dbl&&ny<-0.99&&maxY<=0.004)return;
    let sgn=1;
    if(Math.abs(nx)>1e-3){if(nx<0)sgn=-1;}
    else if(Math.abs(ny)>1e-3){if(ny<0)sgn=-1;}
    else if(nz<0)sgn=-1;
    const cnx=nx*sgn,cny=ny*sgn,cnz=nz*sgn,cd=cnx*ax+cny*ay+cnz*az;
    tris.push({
     a:[ax,ay,az],b:[bx,by,bz],c:[cx,cy,cz],
     nx,ny,nz,cnx,cny,cnz,cd,dbl:!!dbl,
     matId,mkName,colKey,
     mn:[Math.min(ax,bx,cx),Math.min(ay,by,cy),Math.min(az,bz,cz)],
     mx:[Math.max(ax,bx,cx),Math.max(ay,by,cy),Math.max(az,bz,cz)]
    });
   };

   WORLD.traverse(m=>{
    if(!m.isMesh||!m.visible||!m.geometry||!m.geometry.attributes.position)return;
    const mt=m.material;if(!mt||mt.transparent||mt.isMeshBasicMaterial)return;
    const mk=m.userData&&m.userData.mk||(mt.userData&&mt.userData.family)||m.name||'mesh';
    const pos=m.geometry.attributes.position,col=m.geometry.attributes.color,idx=m.geometry.index;
    const matId=getMatId(mt),dbl=mt.side===THREE.DoubleSide;
    const baseC=mt.color||WHITE;
    const addWithMatrix=(M,instCol)=>{
     const n=idx?idx.count:pos.count;
     for(let i=0;i+2<n;i+=3){
      const i0=idx?idx.getX(i):i,i1=idx?idx.getX(i+1):i+1,i2=idx?idx.getX(i+2):i+2;
      vA.fromBufferAttribute(pos,i0).applyMatrix4(M);
      vB.fromBufferAttribute(pos,i1).applyMatrix4(M);
      vC.fromBufferAttribute(pos,i2).applyMatrix4(M);
      let ck;
      if(col){
       const cr0=(col.getX(i0)+col.getX(i1)+col.getX(i2))/3;
       const cg0=(col.getY(i0)+col.getY(i1)+col.getY(i2))/3;
       const cb0=(col.getZ(i0)+col.getZ(i1)+col.getZ(i2))/3;
       ck=qCol(cr0*baseC.r,cg0*baseC.g,cb0*baseC.b);
      }else if(instCol){
       ck=qCol(instCol.r*baseC.r,instCol.g*baseC.g,instCol.b*baseC.b);
      }else ck=qCol(baseC.r,baseC.g,baseC.b);
      pushTri(vA.x,vA.y,vA.z,vB.x,vB.y,vB.z,vC.x,vC.y,vC.z,matId,mk,ck,dbl);
     }
    };
    if(m.isInstancedMesh){
     for(let k=0;k<m.count;k++){
      m.getMatrixAt(k,mat4);mat4.premultiply(m.matrixWorld);
      if(m.instanceColor)m.getColorAt(k,ic);
      addWithMatrix(mat4,m.instanceColor?ic:null);
     }
    }else{
     addWithMatrix(m.matrixWorld,null);
    }
   });

   const bins=new Map();
   for(let idx=0;idx<tris.length;idx++){
    const t=tris[idx];
    const qnx=Math.round(t.cnx*20),qny=Math.round(t.cny*20),qnz=Math.round(t.cnz*20),qd=Math.floor(t.cd/0.005);
    const key=qnx+','+qny+','+qnz+','+qd;
    let arr=bins.get(key);if(!arr){arr=[];bins.set(key,arr);}
    arr.push(idx);
   }

   const conflicts=[],seenSitePair=new Set();
   const checkPair=(i,j)=>{
    const t1=tris[i],t2=tris[j];
    if(t1.matId===t2.matId&&t1.colKey===t2.colKey)return;
    if(t1.mn[0]>t2.mx[0]-1e-3||t2.mn[0]>t1.mx[0]-1e-3)return;
    if(t1.mn[1]>t2.mx[1]-1e-3||t2.mn[1]>t1.mx[1]-1e-3)return;
    if(t1.mn[2]>t2.mx[2]-1e-3||t2.mn[2]>t1.mx[2]-1e-3)return;
    const dot=t1.nx*t2.nx+t1.ny*t2.ny+t1.nz*t2.nz;
    if(t1.dbl||t2.dbl){if(Math.abs(dot)<0.996)return;}
    else{if(dot<0.996)return;}
    for(const p of [t2.a,t2.b,t2.c]){
     const dist=Math.abs(t1.nx*(p[0]-t1.a[0])+t1.ny*(p[1]-t1.a[1])+t1.nz*(p[2]-t1.a[2]));
     if(dist>0.0025)return;
    }
    let ux=-t1.ny,uy=t1.nx,uz=0;
    if(Math.hypot(ux,uy)<1e-3){ux=0;uy=-t1.nz;uz=t1.ny;}
    const uL=Math.hypot(ux,uy,uz);ux/=uL;uy/=uL;uz/=uL;
    const vx=t1.ny*uz-t1.nz*uy,vy=t1.nz*ux-t1.nx*uz,vz=t1.nx*uy-t1.ny*ux;
    const proj=p=>[(p[0]-t1.a[0])*ux+(p[1]-t1.a[1])*uy+(p[2]-t1.a[2])*uz,(p[0]-t1.a[0])*vx+(p[1]-t1.a[1])*vy+(p[2]-t1.a[2])*vz];
    const p1=[proj(t1.a),proj(t1.b),proj(t1.c)];
    if((p1[1][0]-p1[0][0])*(p1[2][1]-p1[0][1])-(p1[1][1]-p1[0][1])*(p1[2][0]-p1[0][0])<0){const tmp=p1[1];p1[1]=p1[2];p1[2]=tmp;}
    const p2=[proj(t2.a),proj(t2.b),proj(t2.c)];
    if((p2[1][0]-p2[0][0])*(p2[2][1]-p2[0][1])-(p2[1][1]-p2[0][1])*(p2[2][0]-p2[0][0])<0){const tmp=p2[1];p2[1]=p2[2];p2[2]=tmp;}
    const area=polyClip2D(p1,p2);
    if(area<=0.0005)return;
    const cx=(t1.a[0]+t1.b[0]+t1.c[0])/3,cy=(t1.a[1]+t1.b[1]+t1.c[1])/3,cz=(t1.a[2]+t1.b[2]+t1.c[2])/3;
    const site=siteNameAt(cx,cy,cz);
    const sk=site+'|'+t1.mkName+'|'+t2.mkName;
    if(!seenSitePair.has(sk)&&conflicts.length<40){
     seenSitePair.add(sk);
     conflicts.push({site,m1:t1.mkName,m2:t2.mkName,area:+area.toFixed(4),at:[+cx.toFixed(2),+cy.toFixed(2),+cz.toFixed(2)]});
    }
   };

   for(const [key,arr] of bins){
    for(let a=0;a<arr.length;a++){
     for(let b=a+1;b<arr.length;b++)checkPair(arr[a],arr[b]);
    }
    const parts=key.split(','),qd=+parts[3];
    const nextKey=parts[0]+','+parts[1]+','+parts[2]+','+(qd+1);
    const arr2=bins.get(nextKey);
    if(arr2){
     for(let a=0;a<arr.length;a++)for(let b=0;b<arr2.length;b++)checkPair(arr[a],arr2[b]);
    }
   }
   return {ok:!conflicts.length&&tris.length>1000,triangles:tris.length,conflicts};
  },

  materialsBillAudit(){
   const bad=[];
   let checked=0,partsTotal=0;
   for(const k in DEFS){
    const d=DEFS[k];if(d.cls!=='building')continue;
    checked++;
    const v=skValidateBill(k,d);
    if(!v.ok)bad.push(...v.errs);
    else partsTotal+=d.materials.length;
   }
   for(const r of REG){
    if(r.parent||r.cls!=='building')continue;
    if(!r.bill||!r.materials||!r.materials.length)bad.push(r.key+':placed-REG-missing-bill');
   }
   return {ok:checked>=16&&!bad.length,checked,partsTotal,bad};
  },

  tradesAudit(){
   if(typeof SK_TRADES==='undefined'||!Array.isArray(SK_TRADES))return {ok:false,bad:['SK_TRADES missing']};
   const bad=[];
   if(SK_TRADES.length!==44)bad.push('rows:'+SK_TRADES.length);
   for(const row of SK_TRADES){
    if(row.na)continue;
    if(!Array.isArray(row.defs)||!row.defs.length)bad.push(row.trade+':no-defs');
    for(const k of (row.defs||[])){
     if(!DEFS[k])bad.push(row.trade+':missing-def:'+k);
    }
   }
   for(const wt of ['poor','middle','rich']){
    for(const dt of ['dwelling-single','dwelling-multi']){
     const has=Object.keys(DEFS).some(k=>DEFS[k].cls==='building'&&DEFS[k].tags.wealth===wt&&(DEFS[k].tags.types||[]).indexOf(dt)>=0);
     if(!has)bad.push('missing-'+wt+'-'+dt);
    }
   }
   return {ok:!bad.length,rows:SK_TRADES.length,bad};
  },

  vstackAudit(){
   const m1Loaded=typeof KMAT_M1!=='undefined'&&KMAT_M1.version>=2;
   let gate3Ok=false,mipAaOk=false;
   if(m1Loaded){
    const domeH=(u,v)=>Math.max(0.05,0.9*Math.exp(-((u-0.5)*(u-0.5)+(v-0.5)*(v-0.5))/(2*0.18*0.18)));
    const domeN=(u,v)=>{
     const e=1/512,dx=(domeH(u+e,v)-domeH(u-e,v))/(2*e),dy=(domeH(u,v+e)-domeH(u,v-e))/(2*e);
     const nx=-dx*0.25,ny=-dy*0.25,l=Math.hypot(nx,ny,1);
     return [nx/l,ny/l,1/l];
    };
    gate3Ok=!!KMAT_M1.handednessProbe(domeN,domeH).ok;
    const Lp=KMAT.packed(KIT.pack,'paktong'),Ls=KMAT.packed(KIT.pack,'serpentinite');
    mipAaOk=!!(Lp&&Array.isArray(Lp.mipVariance)&&KMAT_M1.roughnessWithVariance(0.22,4,Lp.mipVariance)>0.23&&
               Ls&&Array.isArray(Ls.mipVariance)&&KMAT_M1.roughnessWithVariance(0.32,4,Ls.mipVariance)>0.33);
   }
   const meta=typeof SK_VSTACK_META!=='undefined'?SK_VSTACK_META:{mipFamilies:0,pomFamilies:0};
   const m1Ok=m1Loaded&&gate3Ok&&mipAaOk&&meta.mipFamilies>=10&&meta.pomFamilies>=5;

   const rl=window._skRoomLight,tb=rl&&rl.table;
   let roomlightOk=false,roomsN=0,dayRooms=0,pickN=0;
   if(typeof KROOMLIGHT!=='undefined'&&tb&&Array.isArray(tb.order)){
    roomsN=tb.order.length;
    dayRooms=tb.order.filter(id=>tb.byId[id]&&tb.byId[id].interior&&tb.byId[id].daylight>0).length;
    const sampleRm=rl.rooms.find(r=>!r.outdoor&&(r.windows.length>0||r.lamps.length>0))||rl.rooms[0];
    if(sampleRm){
     const b=sampleRm.box;
     const picks=KROOMLIGHT.pickPool({
      eye:[(b[0]+b[3])*0.5,(b[1]+b[4])*0.5,(b[2]+b[5])*0.5],eyeRoom:sampleRm.id,table:tb,
      count:6,maxWindows:3,heroShadows:2,sunUp:1.0,windows:rl.windows,lamps:rl.lamps
     });
     pickN=picks.length;
    }
    const cornerAO=KROOMLIGHT.vertexCornerAO(0,0.02,2.0,1,0,0,[0,0,0,4,3.5,4],0.85);
    const midAO=KROOMLIGHT.vertexCornerAO(0,1.8,2.0,1,0,0,[0,0,0,4,3.5,4],0.85);
    roomlightOk=roomsN>=16&&dayRooms>=14&&pickN>=1&&rl.pool.length===6&&cornerAO<0.85&&midAO>0.95;
   }

   const cacheKeys=new Set();
   for(const k in MAT){
    const m=MAT[k];
    if(m&&typeof m.customProgramCacheKey==='function')cacheKeys.add(m.customProgramCacheKey());
   }
   let programs=cacheKeys.size,maxSamplers=0,glChecked=false;
   if(typeof renderer!=='undefined'&&renderer&&renderer.info&&Array.isArray(renderer.info.programs)&&typeof renderer.getContext==='function'){
    const gl=renderer.getContext();
    if(gl&&typeof gl.getProgramParameter==='function'){
     glChecked=true;
     const S=new Set([0x8B5E,0x8B60,0x8B5F,0x8DC1,0x8B62,0x8DC4,0x8DC5,0x8DCA,0x8DCB,0x8DCC,0x8DCF,0x8DD2,0x8DD3,0x8DD4,0x8DD7]);
     let linked=0;
     for(const p of renderer.info.programs){
      const g=p.program;
      if(!g||!gl.getProgramParameter(g,gl.LINK_STATUS))continue;
      linked++;
      const nu=gl.getProgramParameter(g,gl.ACTIVE_UNIFORMS);
      let cnt=0;
      for(let i=0;i<nu;i++){
       const u=gl.getActiveUniform(g,i);
       if(u&&S.has(u.type))cnt+=u.size;
      }
      if(cnt>maxSamplers)maxSamplers=cnt;
     }
     programs=linked;
    }
   }
   const progOk=cacheKeys.size<=6&&programs<=28&&(!glChecked||maxSamplers<=12);
   return {
    ok:!!(m1Ok&&roomlightOk&&progOk),
    m1Ok,roomlightOk,progOk,
    programs,maxSamplers,matCacheKeys:cacheKeys.size,
    rooms:roomsN,dayRooms,pickN,
    mipFamilies:meta.mipFamilies,pomFamilies:meta.pomFamilies
   };
  },

  fingerprint:fp,
  rebuild(){buildWorld();return fp();}
 });
})();
