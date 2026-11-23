// ================================================================= THE KIT'S PROBE FIELDS (verify.py --assert), added onto window._api
//   doorsAudit()      every unlocked door opens and shuts cleanly (core/door)
//   reachAudit()      every building's declared walk targets (hkTarget) are reached from its front with doors open (KWALK.reach)
//   waterAudit()      verifies Santa Cristina drawdown step-well & thermal still pools + sawmill/flume/caldera flows on core/water
//   atmosWindAudit()  verifies ATMOS active, 0 KHOOK shader compile/link errors, all SV_CLOTH materials bound to ATMOS.U.wind
//                     & ATMOS.U.time, 0.0 drift at pinned rigging vertices (|aFlut|==0), and downwind/gust displacement!
//   texturesAudit()   verifies 100% of opaque/lit surfaces across buildings, chimes, doors, resource nodes & furniture carry library maps!
//   zfightAudit()     world-space geometric coplanar triangle overlap scanner across all nuraghi, whale-ribs, lintels, hoists & furniture!
//   tradesAudit()     verifies full Voth census trade coverage in HK_TRADES
//   oreAudit()        verifies kits/resources node placement and resSource nearest-node linking for hk_jade_quarry
//   fingerprint() / rebuild()
(function(){
 const A=window._api||(window._api={});
 if(typeof groundM!=='undefined')groundM.name='ground';
 const settle=n=>{for(let i=0;i<(n==null?40:n);i++)KDOOR.step(.1);};
 const frontPt=r=>{
  const f=r.front&&r.front.world;if(!f)return null;
  const y=f.yaw,d=r.front.source==='declared'?.6:1.3,x=f.x+Math.sin(y)*d,z=f.z+Math.cos(y)*d;
  return [x,terrainH(x,z),z];
 };
 function fp(){
  let h=0x811c9dc5;
  const mix=s=>{for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
  for(const r of REG)mix(r.key+'|'+r.x.toFixed(3)+'|'+r.z.toFixed(3)+'|'+r.ry.toFixed(4)+'|'+r.tris);
  mix(JSON.stringify(KDOOR.export().doors.map(d=>[d.id,d.kind,+d.at[0].toFixed(3),+d.at[2].toFixed(3)])));
  mix(String(SVF.placed.length));
  return ('00000000'+h.toString(16)).slice(-8);
 }

 /* 2D convex polygon clipping (Sutherland-Hodgman) + shoelace area for exact coplanar triangle overlap area */
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
    if(r.parent||!r.targets||!r.targets.length)continue;
    n++;const s=frontPt(r);if(!s){out.push({key:r.key,why:'no front'});continue;}
    const b=r.bbox,box=[Math.min(b.mn[0]-5,s[0]-2),Math.max(b.mx[0]+5,s[0]+2),Math.min(b.mn[2]-5,s[2]-2),Math.max(b.mx[2]+5,s[2]+2)];
    const R=KWALK.reach([s],{ground:terrainH,box,cell:.2}),got=new Set(R.reached);
    const miss=r.targets.filter(t=>!KWALK.floorsAt(t.x,t.z).some(f=>Math.abs(f[0]-t.y)<.42&&got.has(f[1])));
    if(miss.length)out.push({key:r.key,missed:miss.map(t=>t.name),reached:R.reached.length,unreached:R.unreached.length});
   }
   for(const D of L)KDOOR.close(D,{by:'probe'});settle(40);
   return {buildings:n,bad:out};
  },

  waterAudit(){
   if(typeof WATER==='undefined')return {ok:false,stills:0,flows:0,drawn:0,progIssues:1};
   renderer.render(scene,camera);
   const stills=WATER.surfaces.filter(s=>s.kind==='still').length;
   const flows=WATER.surfaces.filter(s=>s.kind==='flow').length;
   const drawn=(WATER.drawn||[]).filter(d=>d.mesh&&d.mesh.parent===scene).length;
   const progIssues=WATER.checkPrograms?WATER.checkPrograms(renderer,scene).length:0;
   return {ok:stills>=3&&flows>=3&&drawn>=6&&progIssues===0,stills,flows,drawn,progIssues};
  },

  atmosWindAudit(){
   renderer.render(scene,camera);
   const progIssues=typeof KHOOK!=='undefined'?KHOOK.checkPrograms(renderer,scene):[];
   const clothKeys=Object.keys(SV_CLOTH);
   const hooked=[],unhooked=[],unbound=[];
   let pinnedVerts=0,freeVerts=0,maxPinDrift=0,maxWindDisp=0,downwindAligned=0,timeDeltaMax=0,windTurnDelta=0;
   WORLD.traverse(m=>{
    if(!m.isMesh||!m.userData||!SV_CLOTH[m.userData.mk])return;
    const mk=m.userData.mk,mat=m.material;
    if(typeof KHOOK!=='undefined'&&KHOOK.has(mat,'atmos-hk-wind'))hooked.push(mk);
    else unhooked.push(mk);
    const sh=mat.userData&&mat.userData.hkShader;
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
      const d0=hkWindDisplace(wx,wy,wz,fx,fy,fz,4.0,3.5,-2.0,gAmp);
      maxPinDrift=Math.max(maxPinDrift,Math.hypot(d0[0],d0[1],d0[2]));
     }else{
      freeVerts++;
      if(freeVerts%7===1){
       const dA=hkWindDisplace(wx,wy,wz,fx,fy,fz,2.0,3.2,1.4,gAmp);
       const dB=hkWindDisplace(wx,wy,wz,fx,fy,fz,5.3,3.2,1.4,gAmp);
       const dC=hkWindDisplace(wx,wy,wz,fx,fy,fz,2.0,-2.8,2.1,gAmp);
       const disp=Math.hypot(dA[0],dA[1],dA[2]);
       if(disp>maxWindDisp)maxWindDisp=disp;
       const dOpp=hkWindDisplace(wx,wy,wz,fx,fy,fz,2.0+Math.PI/3.6,3.2,1.4,0);
       const mx=0.5*(dA[0]+dOpp[0]),mz=0.5*(dA[2]+dOpp[2]);
       if(mx*3.2+mz*1.4>0)downwindAligned++;
       timeDeltaMax=Math.max(timeDeltaMax,Math.hypot(dB[0]-dA[0],dB[1]-dA[1],dB[2]-dA[2]));
       windTurnDelta=Math.max(windTurnDelta,Math.hypot(dC[0]-dA[0],dC[1]-dA[1],dC[2]-dA[2]));
      }
     }
    }
   });
   const wMag=Math.hypot(ATMOS.U.wind.value.x,ATMOS.U.wind.value.y);
   const animSynced=Math.abs(ANIMU.uWind.value-wMag)<1e-4;
   const ok=!!(typeof ATMOS!=='undefined'&&ATMOS.U&&!progIssues.length&&hooked.length>=5&&!unhooked.length&&!unbound.length&&
    pinnedVerts>=100&&freeVerts>=400&&maxPinDrift===0&&maxWindDisp>0.05&&timeDeltaMax>0.03&&windTurnDelta>0.05&&downwindAligned>20&&animSynced);
   return {
    ok,clothKeys,hooked:[...new Set(hooked)],unhooked,unbound,progIssues:progIssues.length,
    pinnedVerts,freeVerts,maxPinDrift,maxWindDisp:+maxWindDisp.toFixed(4),
    timeDeltaMax:+timeDeltaMax.toFixed(4),windTurnDelta:+windTurnDelta.toFixed(4),
    downwindAligned,animSynced
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
    if(/^node-/.test(site))return;
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
   const TR=window.HK_TRADES||[],missing=[];
   for(const row of TR){
    if(row.na)continue;
    const ok=(row.defs||[]).some(k=>DEFS[k]&&REG.some(r=>r.key===k));
    if(!ok)missing.push(row.trade);
   }
   return {ok:TR.length>=40&&!missing.length,total:TR.length,carried:TR.filter(r=>!r.na).length,missing};
  },

  oreAudit(){
   const LK=window.hkOreLinks?hkOreLinks():{nodes:[],mines:[]};
   const idle=LK.mines.filter(m=>!m.source),bad=[];
   const n=(id,kind,grade,x,z)=>({id,kind,grade,x,z}),M={x:0,z:0,works:'mine'};
   if((resSource(M,[n('a','iron','low',50,0),n('b','copper','high',100,0)])||{}).node!=='a')bad.push('nearest first');
   if((resSource(M,[n('o','oil','high',10,0),n('m','marble','medium',60,0)])||{}).node!=='m')bad.push('mine skips oil');
   const expected=Object.keys(RES_ORE.kinds).length*Object.keys(RES_ORE.grades).length;
   if(LK.nodes.length!==expected)bad.push('nodes '+LK.nodes.length+'/'+expected);
   return {ok:LK.mines.length>=1&&!idle.length&&!bad.length,mines:LK.mines,nodes:LK.nodes.length,bad:bad.concat(idle.map(m=>m.key+' idle'))};
  },

  fingerprint:fp,
  rebuild(){buildWorld();return fp();}
 });
})();
