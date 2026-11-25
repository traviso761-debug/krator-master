/* ================================================================= THE KIT'S VIEWS & PROBE AUDITS (verify.py --assert), added onto window._api
   doorsAudit()       every unlocked door opens and shuts cleanly (core/door)
   reachAudit()       every building's walk targets AND every registered KWALK floor is reached (0 unreached floors!)
   ceilingAudit()     upward FrontSide raycast from every indoor target proving 100% solid interior ceilings & inward soffits!
   texturesAudit()    verifies 100% of opaque/lit surfaces across buildings, doors & furniture carry decoded library maps!
   zfightAudit()      world-space geometric coplanar triangle overlap scanner across all buildings & furnished interiors!
   tradesAudit()      verifies all 44/44 Voth census trades & all 6 dwelling cells + military + infrastructure!
   bioclimaticAudit() verifies 1.90 atm humid passive-cooling rules (vented plinths, loggias/ayvans, solar wind-towers/lanterns,
                      kundal ceilings, shadirvan pools, zero sky-exposed ganch, culture 'eastabyss', style 'urban', zero salvage)!
   vstackAudit()      verifies KMAT_M1 M2/M3/M4, KROOMLIGHT room-graph, <= 28 WebGL programs & <= 12 samplers!
   fingerprint() / rebuild() */
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
  const byKey=k=>SITES.find(s=>s.key===k);
  const hero=[
   ['tb_temple_altar_grand','Grand Urban Temple of the Salt-Crystal Altar',18,16,34,8.0],
   ['tb_palace_ahedman','Tafalast di Ahedman Urban Ruler Palace',18,16,34,8.2],
   ['tb_capricho_villa','El Capricho Banded-Brick and Wind-Tower Villa',13,12,24,6.5],
   ['tb_secession_palazzo','Raichle Double-Loggia Multi-Partner Palazzo',15,13,28,6.8],
   ['tb_lac_merchant_bayt','Liikofi Abyss-Lac and Escata-Spire Patrician Bayt',15,13,28,6.5],
   ['tb_mirador_estate','Verdigris-Column and Solar-Mirador Lakefront Villa',15,13,28,6.8],
   ['tb_oriel_townhouse','Secessionist Verdigris-Oriel Merchant Townhouse',12,11,22,6.0],
   ['tb_souq_arcade','Vaulted Trencadis-Lantern Bazaar Arcade',15,12,27,5.8],
   ['tb_lac_refinery','Liikofi Open-Columned Abyss-Lac Refinery',14,12,25,5.5],
   ['tb_caravanserai_urban','Shah-i-Zinda Portal and Longcrawler Caravanserai',17,14,32,6.8],
   ['tb_syndic_guildhall','Zsolnay Chamber of the Potash and Lac Syndics',14,12,26,6.4],
   ['tb_wall_gate','Twin-Turreted Shah-i-Zinda and Zsolnay City Gatehouse',16,13,28,6.8]
  ];
  for(const [k,nm,dx,dy,dz,ty] of hero){
   const p=byKey(k);
   if(p)addView(nm,[p.x+dx,dy,p.z+dz,p.x,ty,p.z-1]);
  }
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
    const b=r.bbox,box=[b.mn[0]-3,b.mx[0]+3,b.mn[2]-3,b.mx[2]+3];
    const R=KWALK.reach(starts,{ground:terrainH,box,cell:.4}),got=new Set(R.reached);
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
   return {ok:probed>=40&&!skyLeaks.length,probed,skyLeaks};
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

  tradesAudit(){
   if(typeof TB_TRADES==='undefined'||!Array.isArray(TB_TRADES))return {ok:false,bad:['TB_TRADES missing']};
   const bad=[];
   if(TB_TRADES.length!==44)bad.push('rows:'+TB_TRADES.length);
   for(const row of TB_TRADES){
    if(row.na){bad.push(row.trade+':unexpected-na');continue;}
    if(!Array.isArray(row.keys)||!row.keys.length)bad.push(row.trade+':no-keys');
    for(const k of (row.keys||[])){
     if(!DEFS[k]||DEFS[k].tags.style!=='urban')bad.push(row.trade+':bad-key:'+k);
    }
   }
   for(const wt of ['poor','middle','rich']){
    for(const dt of ['dwelling-single','dwelling-multi']){
     const has=Object.keys(DEFS).some(k=>DEFS[k].cls==='building'&&DEFS[k].tags.style==='urban'&&DEFS[k].tags.wealth===wt&&(DEFS[k].tags.types||[]).indexOf(dt)>=0);
     if(!has)bad.push('missing-'+wt+'-'+dt);
    }
   }
   const milN=Object.keys(DEFS).filter(k=>DEFS[k].cls==='building'&&(DEFS[k].tags.types||[]).indexOf('military')>=0).length;
   const infN=Object.keys(DEFS).filter(k=>DEFS[k].cls==='building'&&(DEFS[k].tags.types||[]).indexOf('infrastructure')>=0).length;
   if(milN<5)bad.push('military<5:'+milN);
   if(infN<8)bad.push('infrastructure<8:'+infN);
   return {ok:!bad.length,rows:TB_TRADES.length,bad};
  },

  bioclimaticAudit(){
   const bad=[];
   let plinths=0,loggias=0,windTowers=0,claustra=0,oriels=0,kundal=0,shadirvans=0,ganchOk=0,ganchExposed=0,buildings=0;
   for(const r of REG){
    if(r.parent||r.cls!=='building')continue;
    buildings++;
    const tg=DEFS[r.key]&&DEFS[r.key].tags||{};
    if(KIT.culture!=='eastabyss'||tg.style!=='urban')bad.push(r.key+':bad-style-or-culture');
    if(tg.state==='salvage'||tg.set==='scrap')bad.push(r.key+':salvage-forbidden');
    const b=r.bio||{},nz=v=>v==null?0:v;
    plinths+=nz(b.ventedPlinths);
    loggias+=nz(b.openLoggias);
    windTowers+=nz(b.windTowers);
    claustra+=nz(b.claustra);
    oriels+=nz(b.oriels);
    kundal+=nz(b.kundalCeilings);
    shadirvans+=nz(b.shadirvans);
    ganchOk+=nz(b.ganchSheltered);
    ganchExposed+=nz(b.ganchExposed);
    if(nz(b.ganchExposed)>0)bad.push(r.key+':sky-exposed-ganch');
    if(!(nz(b.ventedPlinths)>=1))bad.push(r.key+':no-vented-plinth');
    if(!(nz(b.windTowers)>=1||nz(b.openLoggias)>=1))bad.push(r.key+':no-passive-vent');
   }
   if(windTowers<42)bad.push('windTowers<42:'+windTowers);
   if(loggias<38)bad.push('openLoggias<38:'+loggias);
   if(kundal<60)bad.push('kundalCeilings<60:'+kundal);
   if(shadirvans<18)bad.push('shadirvans<18:'+shadirvans);
   if(ganchOk<14)bad.push('ganchSheltered<14:'+ganchOk);
   return {
    ok:!bad.length&&buildings===50&&ganchExposed===0,
    buildings,plinths,loggias,windTowers,claustra,oriels,kundal,shadirvans,ganchSheltered:ganchOk,ganchExposed,bad
   };
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
    const Lk=KMAT.packed(KIT.pack,'kashi'),Lb=KMAT.packed(KIT.pack,'bronze');
    mipAaOk=!!(Lk&&Array.isArray(Lk.mipVariance)&&KMAT_M1.roughnessWithVariance(0.21,4,Lk.mipVariance)>0.30&&
               Lb&&Array.isArray(Lb.mipVariance)&&KMAT_M1.roughnessWithVariance(0.24,4,Lb.mipVariance)>0.32);
   }
   const meta=typeof TB_VSTACK_META!=='undefined'?TB_VSTACK_META:{mipFamilies:0,pomFamilies:0};
   const m1Ok=m1Loaded&&gate3Ok&&mipAaOk&&meta.mipFamilies>=14&&meta.pomFamilies>=6;

   const rl=window._tbRoomLight,tb=rl&&rl.table;
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
    roomlightOk=roomsN>=48&&dayRooms>=35&&pickN>=1&&rl.pool.length===6&&cornerAO<0.85&&midAO>0.95;
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
   const progOk=cacheKeys.size<=5&&programs<=28&&(!glChecked||maxSamplers<=12);
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
