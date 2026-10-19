/* ============================== HOOK: DRAWING THE TOWN ([web]) ============================== */
/* Draws the records HOOK_CITY made; it decides nothing about where anything goes (CLAUDE.md: a builder draws a record).
   - the streets through core/city's own drawing (50-city-host-streets.js HOST.buildStreets, inside the KCITY bundle);
   - the quarters as outlines draped on the ground with a label each, the markers as small labels (`z` toggles them);
   - every kit piece built ONCE at the origin by its kit's closure (ISK.proto, IZV.proto, HYK.proto, VCAT.proto,
     KPA.proto: the bundles build.py seals, read in place), flattened into one geometry per material and drawn as
     InstancedMeshes: within HOOK_DRAW.nearR of the camera's target in full, beyond it as massing (a body and a roof per
     footprint). The near set is rebuilt when the target moves; a prototype is built the first time one of it comes
     near. This is the isle demo's drawing (settlements/isle-demo/src/60-isle-draw.js), the same rule: one shared copy is
     a follow-up (KNOWN_ISSUES.md);
   - a footing under every lot that stands on the slope (its drop: a stone plinth), as one InstancedMesh.
   window._city holds what verify.py reads: the plan, the records and the drawing's counts. */
const HOOK_DRAW={nearR:400,nearMax:1600,moveFor:60,protos:{},inst:[],built:0,failed:{},stats:{}};
HOOK_DRAW.kits={isk:(k,v)=>ISK.proto(k,v),izv:(k,v,L)=>IZV.proto(k,v,L&&/rich|manor|civic/.test(L.cls)?2:L&&/poor/.test(L.cls)?0:1),
 hyk:(k,v)=>HYK.proto(k,v),vcat:(k,v)=>VCAT.proto(k,v),apoc:(k,v)=>KPA.proto(k,v),
 /* a pod grown on a host: built in the host's frame (one build per pod, its bearing and floor are its own) */
 hykpod:(k,v,L)=>HYK.protoOn(k,L.spec.rAt,L.a,L.py,L.hostName)};
HOOK_DRAW.denorm=function(a){if(!a.normalized)return 1;const r=a.array;
 return r instanceof Uint8Array||r instanceof Uint8ClampedArray?1/255:r instanceof Uint16Array?1/65535:r instanceof Int8Array?1/127:r instanceof Int16Array?1/32767:1;};
/* a material by its properties: the kits make a fresh material per build even when nothing differs, so every material
   with the same fingerprint is drawn as the first one seen (one mesh per material in the near set, not one per build) */
HOOK_DRAW.canon={};
HOOK_DRAW.material=function(M){const t=x=>x?x.uuid:'',c=x=>x?x.getHexString():'',U=M.userData||{};
 const fp=[M.type,c(M.color),t(M.map),t(M.normalMap),t(M.roughnessMap),t(M.emissiveMap),t(M.alphaMap),c(M.emissive),M.emissiveIntensity,M.roughness,M.metalness,
  M.transparent?1:0,M.opacity,M.side,M.vertexColors?1:0,M.flatShading?1:0,M.alphaTest,M.depthWrite?1:0,M.wireframe?1:0,M.onBeforeCompile?String(M.onBeforeCompile).length:0,
  M.customProgramCacheKey?String(M.customProgramCacheKey()):'',U.family||'',U.set||'',U.fam||'',M.name||''].join('|');
 return HOOK_DRAW.canon[fp]||(HOOK_DRAW.canon[fp]=M);};
/* one geometry per material from a built group (meshes and instanced meshes alike), in the group's frame */
HOOK_DRAW.flatten=function(G){G.updateMatrixWorld(true);const groups={},IM=new THREE.Matrix4();
 G.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const mat=Array.isArray(o.material)?null:HOOK_DRAW.material(o.material);if(!mat)return;
  const g=o.geometry,sig=mat.uuid+'|'+Object.keys(g.attributes).sort().join(','),list=groups[sig]||(groups[sig]={mat,parts:[]});
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,IM);list.parts.push({g,m:new THREE.Matrix4().multiplyMatrices(o.matrixWorld,IM)});}
  else list.parts.push({g,m:o.matrixWorld.clone()});});
 const out=[];
 for(const s in groups){const Q=groups[s],names=Object.keys(Q.parts[0].g.attributes);let total=0,itotal=0;
  Q.parts.forEach(p=>{total+=p.g.attributes.position.count;itotal+=p.g.index?p.g.index.count:p.g.attributes.position.count;});
  const A={};names.forEach(nm=>{A[nm]=new Float32Array(total*Q.parts[0].g.attributes[nm].itemSize);});
  const I=total>65535?new Uint32Array(itotal):new Uint16Array(itotal),v3=new THREE.Vector3(),nm3=new THREE.Matrix3();let vo=0,io=0;
  Q.parts.forEach(p=>{const g=p.g,cnt=g.attributes.position.count;nm3.getNormalMatrix(p.m);
   names.forEach(nm=>{const src=g.attributes[nm],sz=src.itemSize,dst=A[nm],sc=HOOK_DRAW.denorm(src);if(!src)return;
    for(let i=0;i<cnt;i++){
     if(nm==='position'){v3.fromBufferAttribute(src,i).applyMatrix4(p.m);dst[(vo+i)*3]=v3.x;dst[(vo+i)*3+1]=v3.y;dst[(vo+i)*3+2]=v3.z;}
     else if(nm==='normal'){v3.fromBufferAttribute(src,i).applyMatrix3(nm3).normalize();dst[(vo+i)*3]=v3.x;dst[(vo+i)*3+1]=v3.y;dst[(vo+i)*3+2]=v3.z;}
     else for(let c=0;c<sz;c++)dst[(vo+i)*sz+c]=src.array[i*sz+c]*sc;}});
   if(g.index)for(let k=0;k<g.index.count;k++)I[io+k]=g.index.array[k]+vo;else for(let k=0;k<cnt;k++)I[io+k]=vo+k;
   io+=g.index?g.index.count:cnt;vo+=cnt;});
  const geo=new THREE.BufferGeometry();names.forEach(nm=>{geo.setAttribute(nm,new THREE.BufferAttribute(A[nm],Q.parts[0].g.attributes[nm].itemSize));});
  geo.setIndex(new THREE.BufferAttribute(I,1));geo.computeBoundingSphere();out.push({geo,mat:Q.mat,tris:itotal/3});}
 return out;};
HOOK_DRAW.proto=function(L){const id=L.kit==='hykpod'?'hykpod:'+L.id:L.kit+':'+L.key+'#'+(L.v|0);if(HOOK_DRAW.protos[id]!==undefined)return HOOK_DRAW.protos[id];
 let G=null;const t0=performance.now(),mk=HOOK_DRAW.kits[L.kit];
 try{G=mk?mk(L.key,L.v|0,L):null;}catch(e){HOOK_DRAW.failed[id]=String(e&&e.message||e);}
 if(!G){HOOK_DRAW.failed[id]=HOOK_DRAW.failed[id]||'no build';return (HOOK_DRAW.protos[id]=null);}
 const parts=HOOK_DRAW.flatten(G),tris=parts.reduce((a,p)=>a+p.tris,0);HOOK_DRAW.built++;
 return (HOOK_DRAW.protos[id]={id,parts,tris,ms:Math.round(performance.now()-t0),w:G.userData.w,d:G.userData.d,h:G.userData.h});};
HOOK_DRAW.matOf=function(L,s){const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,L.ry,0));
 return new THREE.Matrix4().compose(new THREE.Vector3(L.x,L.y,L.z),q,new THREE.Vector3(s[0],s[1],s[2]));};
/* the massing (every lot), the footings, then the first near set */
HOOK_DRAW.records=function(recs,group){const all=HOOK_DRAW.recs=recs;
 const body=new THREE.BoxGeometry(1,1,1);body.translate(0,.5,0);const roof=new THREE.ConeGeometry(.72,1,4,1);roof.rotateY(Math.PI/4);roof.translate(0,.5,0);
 const mB=new THREE.InstancedMesh(body,new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,all.length)),mR=new THREE.InstancedMesh(roof,new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,all.length));
 mB.name='massing bodies';mR.name='massing roofs';mB.userData.probeSkip=mR.userData.probeSkip=true;
 const KC={isk:[0xb39a74,0xc9ac6e],izv:[0xe4dccb,0xc0703c],hyk:[0xcfd8d6,0x6f9aa8],vcat:[0xd9cbb0,0x6a4a8a],apoc:[0x8a8378,0x7a4a2e]},c=new THREE.Color();
 all.forEach((L,i)=>{const k=KC[L.kit]||KC.isk;mB.setColorAt(i,c.setHex(k[0]));mR.setColorAt(i,c.setHex(k[1]));});
 HOOK_DRAW.massB=mB;HOOK_DRAW.massR=mR;group.add(mB);group.add(mR);
 /* the reconquest's rubble: a burned-out lot is a dark heap over its footprint, not its building */
 const rb=all.filter(L=>L.rubble),rg=new THREE.DodecahedronGeometry(.5,0);rg.scale(1,.45,1);rg.translate(0,.2,0);
 const rub=new THREE.InstancedMesh(rg,new THREE.MeshLambertMaterial({color:0x3b3733}),Math.max(1,rb.length));
 rb.forEach((L,i)=>rub.setMatrixAt(i,HOOK_DRAW.matOf(L,[L.w*.9,Math.max(2.5,L.h*.3),L.d*.9])));rub.count=rb.length;rub.name='rubble';rub.userData.probeSkip=true;group.add(rub);HOOK_DRAW.stats.rubble=rb.length;
 const fl=all.filter(L=>L.drop>.35),fg=new THREE.BoxGeometry(1,1,1);fg.translate(0,-.5,0);
 const foot=new THREE.InstancedMesh(fg,new THREE.MeshLambertMaterial({color:0x7b7366}),Math.max(1,fl.length));
 fl.forEach((L,i)=>{const m=HOOK_DRAW.matOf(L,[L.w*.92,L.drop+.6,L.d*.92]);m.elements[13]+=.05;foot.setMatrixAt(i,m);});
 foot.count=fl.length;foot.name='footings';foot.userData.probeSkip=true;group.add(foot);HOOK_DRAW.stats.footings=fl.length;HOOK_DRAW.group=group;
 HOOK_DRAW.near(null,true);};
HOOK_DRAW.near=function(at,force){at=at||[-290,-135];
 if(!force&&HOOK_DRAW.at&&Math.hypot(at[0]-HOOK_DRAW.at[0],at[1]-HOOK_DRAW.at[1])<HOOK_DRAW.moveFor)return;
 HOOK_DRAW.at=at.slice();const group=HOOK_DRAW.group;
 HOOK_DRAW.inst.forEach(m=>{group.remove(m);m.geometry.dispose();});HOOK_DRAW.inst=[];
 const all=HOOK_DRAW.recs,near=[];all.forEach((L,i)=>{if(L.rubble)return;const d=Math.hypot(L.x-at[0],L.z-at[1]);if(d<HOOK_DRAW.nearR)near.push([d,i]);});
 near.sort((a,b)=>a[0]-b[0]);const sel=near.slice(0,HOOK_DRAW.nearMax),full={},acc={},t0=performance.now();
 /* the near set as ONE mesh per material (the Port's draw-call budget is 900 for the whole page): every near piece's
    flattened parts, transformed by its lot, appended to its material's buffers; rebuilt when the target moves */
 const v3=new THREE.Vector3(),nm3=new THREE.Matrix3();let tris=0;
 sel.forEach(ni=>{const L=all[ni[1]],P=HOOK_DRAW.proto(L);if(!P)return;full[ni[1]]=1;const M=HOOK_DRAW.matOf(L,[1,1,1]),N=new THREE.Matrix3().getNormalMatrix(M);
  P.parts.forEach(pt=>{const g=pt.geo,names=Object.keys(g.attributes),sig=pt.mat.uuid+'|'+names.join(','),A=acc[sig]||(acc[sig]={mat:pt.mat,names,chunks:[],n:0,i:0});
   A.chunks.push({g,M,N});A.n+=g.attributes.position.count;A.i+=g.index.count;tris+=pt.tris;});});
 for(const sig in acc){const A=acc[sig],names=A.names,out={},g0=A.chunks[0].g;names.forEach(nm=>{out[nm]=new Float32Array(A.n*g0.attributes[nm].itemSize);});
  const I=A.n>65535?new Uint32Array(A.i):new Uint16Array(A.i);let vo=0,io=0;
  A.chunks.forEach(ch=>{const g=ch.g,cnt=g.attributes.position.count;
   names.forEach(nm=>{const src=g.attributes[nm],sz=src.itemSize,dst=out[nm];
    for(let i=0;i<cnt;i++){
     if(nm==='position'){v3.fromBufferAttribute(src,i).applyMatrix4(ch.M);dst[(vo+i)*3]=v3.x;dst[(vo+i)*3+1]=v3.y;dst[(vo+i)*3+2]=v3.z;}
     else if(nm==='normal'){v3.fromBufferAttribute(src,i).applyMatrix3(ch.N).normalize();dst[(vo+i)*3]=v3.x;dst[(vo+i)*3+1]=v3.y;dst[(vo+i)*3+2]=v3.z;}
     else for(let c=0;c<sz;c++)dst[(vo+i)*sz+c]=src.array[i*sz+c];}});
   for(let k=0;k<g.index.count;k++)I[io+k]=g.index.array[k]+vo;io+=g.index.count;vo+=cnt;});
  const geo=new THREE.BufferGeometry();names.forEach(nm=>{geo.setAttribute(nm,new THREE.BufferAttribute(out[nm],g0.attributes[nm].itemSize));});
  geo.setIndex(new THREE.BufferAttribute(I,1));geo.computeBoundingSphere();
  const m=new THREE.Mesh(geo,A.mat);m.name='town near: '+(A.mat.name||sig.slice(0,8));m.userData.own='town';group.add(m);HOOK_DRAW.inst.push(m);}
 const z0=new THREE.Matrix4().makeScale(0,0,0);let nb=0;
 all.forEach((L,i)=>{if(full[i]||L.rubble){HOOK_DRAW.massB.setMatrixAt(i,z0);HOOK_DRAW.massR.setMatrixAt(i,z0);return;}
  const wh=Math.max(2.5,L.h*.45),rh=Math.max(1.5,L.h-wh);HOOK_DRAW.massB.setMatrixAt(i,HOOK_DRAW.matOf(L,[L.w*.9,wh,L.d*.9]));
  const r=HOOK_DRAW.matOf(L,[L.w*1.02,rh,L.d*1.02]);r.elements[13]+=wh;HOOK_DRAW.massR.setMatrixAt(i,r);nb++;});
 HOOK_DRAW.massB.instanceMatrix.needsUpdate=HOOK_DRAW.massR.instanceMatrix.needsUpdate=true;
 if(HOOK_DRAW.massB.instanceColor)HOOK_DRAW.massB.instanceColor.needsUpdate=true;if(HOOK_DRAW.massR.instanceColor)HOOK_DRAW.massR.instanceColor.needsUpdate=true;
 Object.assign(HOOK_DRAW.stats,{near:Object.keys(full).length,massing:nb,nearTris:Math.round(tris),protos:HOOK_DRAW.built,failed:Object.keys(HOOK_DRAW.failed).length,nearMs:Math.round(performance.now()-t0)});};
(()=>{const C=HOOK_CITY,P=C.P,HOST=KCITY.lib.HOST;
 window._city={ready:!!P,log:C.log,ways:P?P.ways.length:0,districts:P?P.districts.length:0,landmarks:P?P.landmarks.length:0,
  hosts:P?P.landmarks.filter(L=>L.ancient).length:0,lots:C.recs.length,recs:C.recs,civics:C.landmarks,pods:C.pods,plan:P?C.K.export():null,draw:HOOK_DRAW.stats,failed:HOOK_DRAW.failed,
  /* every standing footprint for the overlap check: a lot's building box, a landmark's footprint (the export keeps the yard only) */
  boxes:P?P.lots.filter(l=>l.died==null).map(l=>({id:l.id,key:l.key,cls:l.cls,box:l.cls==='landmark'?l.lot:l.bo})).filter(b=>b.box):[],
  raster:(x,z)=>C.K.raster?C.K.raster.at(x,z):null,OCC:KCITY.lib.OCC};
 if(!P)return;
 const site=new THREE.Group();site.name='hook-site';scene.add(site);
 try{HOST.buildStreets();for(const k in HOST.streets){const m=HOST.streets[k];scene.remove(m);site.add(m);}}catch(e){reportErr('streets '+e.stack);}
 const COL={hukoa:0x2b7a3b,tethys:0x2a6f9e,iziz:0xc8601a,voth:0x5a3d8c,salvage:0x6b6b6b,ancient:0x3a3a3a};
 const overlay=new THREE.Group();overlay.name='hook-overlay';site.add(overlay);
 for(const D of P.districts){const col=COL[D.layer]||0xffffff,pts=[];
  const poly=D.poly.concat([D.poly[0]]);
  for(let i=1;i<poly.length;i++){const a=poly[i-1],b=poly[i],n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6));
   for(let k=0;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;pts.push(new THREE.Vector3(x,terrainH(x,z)+1.4,z));}}
  pts.push(pts[0].clone());
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.85,depthTest:false}));
  line.renderOrder=19;line.userData={kind:'district',probeSkip:true};overlay.add(line);
  let cx=0,cz=0;for(const p of D.poly){cx+=p[0];cz+=p[1];}cx/=D.poly.length;cz/=D.poly.length;
  const s=HOST.label(D.name,cx,terrainH(cx,cz)+34,cz,120,2);scene.remove(s);overlay.add(s);}
 for(const m of (C.site.markers||[])){const s=HOST.label(m.id,m.x,terrainH(m.x,m.z)+14,m.z,30,1);scene.remove(s);overlay.add(s);}
 overlay.visible=false;   /* the site overlay is off by default on the town's page; `z` shows it */
 addEventListener('keydown',e=>{if(e.key==='z'&&!e.ctrlKey&&!e.metaKey)overlay.visible=!overlay.visible;});
 /* the town: the kits' pieces at their lots, near in full and far as massing, following the camera's target */
 const town=new THREE.Group();town.name='hook-town';scene.add(town);
 /* the pods are records of the town too (near set and massing as the rest); their frame is their host's */
 try{HOOK_DRAW.records(C.recs.concat(C.pods.map(p=>Object.assign({w:6,d:6,h:5,drop:0,kit:'hykpod'},p))),town);}catch(e){reportErr('town '+e.stack);}
 /* the landmarks' names over them */
 for(const L of C.landmarks){const s=HOST.label(L.name,L.x,L.y+L.h+10,L.z,70,6);scene.remove(s);overlay.add(s);}
 PORT_FRAME.push(()=>{if(typeof ctl!=='undefined'&&ctl.target)HOOK_DRAW.near([ctl.target.x,ctl.target.z]);});})();
