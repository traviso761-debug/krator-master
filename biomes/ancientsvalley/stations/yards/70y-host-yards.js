// ================================================================= HOST — the Yards: the industry on the city's machinery, the yard and its pieces drawn
// [web] After 70-host-city.js, which tiers every record of STAGE.plan.towers (heroes, shells, impostors, the kerb's plinths). The industrial buildings
// are the metropolis kit's Ancients (46b, 46e: MP.ANCIENTS), whose families (MP.FAMILY) the kit makes from the first hero it builds, and the hero
// needs the Ancients kit's builders and the library's maps: so the families are made here at the boot, before 70's own boot reads them, each with
// the box shell every family on this page has (70: the middle tier for every family). The yard's pieces (46f records, 57y drawing) and the
// sidings (the transit kit's rails) are registered at load and drawn once the transit is (74). The Engines are merged by material at the boot:
// the new set (kits/ancients targets/engines 8aj) draws its masses as plain meshes, a hundred to an engine.
const AV_YARDS=(function(){const Y=STAGE.yards,out={ready:false,groups:[],n:{},families:0,noShell:[],records:0,mergedEngines:0,ms:0};
 const famName=k=>(MP.ANCIENTS[k]||{}).name||k;
 /* the industry as records before anything is drawn (70 registers only the families it knows at load) */
 Y.INDUSTRY.forEach(T=>{const A=MP.ANCIENTS[T.family];REGISTER({name:A.name+' ('+T.state+')',kind:'tower',x:T.x,z:T.z,y:T.y,r:Math.max(A.footprint.w,A.footprint.d)/2,
  h:T.state==='intact'||T.state==='gutted'?A.height.tip:A.height.tip*.6,tags:{kind:'tower',family:T.family,state:T.state,zone:'industry'}});out.records++;});
 /* the yard's pieces and the sidings, each a record */
 const NAMES={tankfarm:Q=>'a tank farm in its bund ('+Q.tanks.length+' tanks)',piperack:Q=>'a pipe rack ('+Math.round(Q.length)+' m, '+Q.bents.length+' bents)',disharray:Q=>'a dish array ('+Q.dishes.length+' dishes)',
  chimney:Q=>'a chimney ('+Q.state+', '+Math.round(Q.top)+' m)',conveyor:Q=>'a conveyor ('+Math.round(Q.length)+' m)',turntable:Q=>'the turntable and its roundhouse',gantry:Q=>'a loading gantry ('+Q.state+')',pool:Q=>'a toxic pool'};
 Y.PIECES.forEach(Q=>{const y=Q.y==null?terrainH(Q.x,Q.z):Q.y;REGISTER({name:(NAMES[Q.kind]||(()=>Q.kind))(Q),kind:'yard-piece',x:Q.x,z:Q.z,y:y-2,r:(Q.r==null?10:Q.r)+2,h:(Q.h==null?10:Q.h)+4,tags:{kind:'yard-piece',piece:Q.kind,state:Q.state||''}});Q.registered=true;out.records++;});
 STAGE.transit.sidings.forEach(R=>{const P=R.path,a=P.at(0),b=P.at(R.L),cx=(a.x+b.x)/2,cz=(a.z+b.z)/2;REGISTER({name:'the rail yard: '+R.id,kind:'line',x:cx,z:cz,y:terrainH(cx,cz)-3,r:R.L/2+6,h:8,tags:{kind:'line',line:'siding',id:R.id}});R.registered=true;out.records++;});
 Y.YARD.stops.forEach(s=>{REGISTER({name:'a buffer stop',kind:'yard-piece',x:s.x,z:s.z,y:terrainH(s.x,s.z)-1,r:3,h:4,tags:{kind:'yard-piece',piece:'stop'}});out.records++;});
 /* the industrial families, at the boot (the library's maps in): a hero of each, which makes its family; then its box shell, if the shell's record
    can be made of it (a family whose record cannot stays a hero and an impostor, as a skeleton does) */
 /* the rust on the industry: avRust (70) weathers a hero through its vertex and instance colours, which the towers' kits draw with; the Ancients kit
    draws its masses with plain material colours, so an industrial hero stood clean white among rusted towers. Its materials are swapped here for
    weathered clones (one a source material, shared by every industrial hero), the colour drawn toward the page's rust palette (70's PAL) and darkened by
    the state's grime; the shells and impostors bake from these, so every tier agrees */
 const INDK=new Set(Y.INDUSTRY.map(T=>T.family)),RUSTM=new Map(),rust0=avRust;
 avRust=function(H,key){rust0(H,key);if(!INDK.has(key.split('.')[0])||H.userData.avMatRust)return H;H.userData.avMatRust=true;
  const st=key.split('.')[1],k=AV_RUST[st]==null?.8:AV_RUST[st],dirt=1-.38*k;
  const swap=mt=>{if(!mt||!mt.color||mt.transparent||(mt.userData&&mt.userData.mpWindow))return mt;const key2=mt.uuid+'|'+dirt.toFixed(2);let c=RUSTM.get(key2);
   if(!c){c=mt.clone();c.onBeforeCompile=mt.onBeforeCompile;c.customProgramCacheKey=mt.customProgramCacheKey;if(typeof KHOOK!=='undefined'&&KHOOK.copy)KHOOK.copy(mt,c);
    const l=mt.color.r*.3+mt.color.g*.59+mt.color.b*.11;c.color.setRGB((mt.color.r*.35+l*1.12*.65)*dirt,(mt.color.g*.35+l*.80*.65)*dirt,(mt.color.b*.35+l*.58*.65)*dirt);c.roughness=Math.max(c.roughness==null?0:c.roughness,.85);RUSTM.set(key2,c);}return c;};
  H.traverse(m=>{if(!m.isMesh||!m.material||m.userData.door)return;m.material=Array.isArray(m.material)?m.material.map(swap):swap(m.material);});return H;};
 const boot0=AVC.boot;
 AVC.boot=function(){if(AVC.ready)return true;if(window._texPending>0)return false;
  if(!out.famDone){out.famDone=true;const keys=[...new Set(Y.INDUSTRY.map(T=>T.family))];
   keys.forEach(k=>{try{const ik=k+'.intact';if(!MP.FAMILY[k])AVC.hero[ik]=AVC.hero[ik]||heroOf(ik);const F=MP.FAMILY[k];if(!F){out.noShell.push(k+' (no family)');return;}out.families++;
    if(!F.shell){F.shell={mode:'box',inset:1.2,texel:1.0,ruinTexel:1.25,box:true};try{KSHELL.record(F,'intact');}catch(e){delete F.shell;out.noShell.push(k);}}}catch(e){reportErr('industry family '+k+': '+(e.stack||e));}});}
   /* THE HALLS FACE THEIR AVENUE (2026-11-10, after the valley's -yaw fix turned every drawn form by -yaw: a quarter-turned hall's doors went to
      its back): each industrial hall's entrances (MP.ancientEntrances, in its hero's frame) are read off its intact hero, and a hall whose doors face
      away from the avenue on its block's yard side is turned half round (its plinth is a rectangle: nothing else moves). Drawn by -yaw (70) */
   out.faced=0;Y.INDUSTRY.forEach(T=>{const H=AVC.hero[T.family+'.intact'],E=H&&H.userData.entrances;if(!E||!E.length)return;let ex=0,ez=0;E.forEach(D=>{ex+=D.x;ez+=D.z;});ex/=E.length;ez/=E.length;
    if(Math.hypot(ex,ez)<2)return;const th=-T.yaw,dz=-ex*Math.sin(th)+ez*Math.cos(th),want=T.z<0?1:-1;if(dz*want<0){T.yaw+=Math.PI;T.c=Math.cos(T.yaw);T.s=Math.sin(T.yaw);T.q=null;out.faced++;}T.facing=dz*want<0?'turned':'kept';});
  return boot0();};
 /* the Engines merged by material: every plain mesh of an engine's tree into one mesh a material, in the engine's frame */
 function mergeByMat(G){G.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(G.matrixWorld).invert(),by=new Map(),kill=[],M=new THREE.Matrix4(),N=new THREE.Matrix3(),v=new THREE.Vector3();
  G.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||!m.geometry||!m.geometry.attributes.position||Array.isArray(m.material))return;let e=by.get(m.material);if(!e)by.set(m.material,e={p:[],n:[],u:[],c:[],pts:[],col:!!m.material.vertexColors,k:0});
   M.multiplyMatrices(inv,m.matrixWorld);N.getNormalMatrix(M);const g=m.geometry,P=g.attributes.position,Nn=g.attributes.normal,U=g.attributes.uv,C=g.attributes.color,I=g.index,n=I?I.count:P.count;
   if(!g.boundingBox)g.computeBoundingBox();{const c=new THREE.Vector3();g.boundingBox.getCenter(c).applyMatrix4(M);e.pts.push(c.x,c.y,c.z);}
   for(let q=0;q<n;q++){const i=I?I.getX(q):q;v.fromBufferAttribute(P,i).applyMatrix4(M);e.p.push(v.x,v.y,v.z);if(Nn){v.fromBufferAttribute(Nn,i).applyMatrix3(N).normalize();e.n.push(v.x,v.y,v.z);}else e.n.push(0,1,0);
    if(U)e.u.push(U.getX(i),U.getY(i));else e.u.push(0,0);if(e.col){if(C)e.c.push(C.getX(i),C.getY(i),C.getZ(i));else e.c.push(1,1,1);}}e.k++;kill.push(m);});
  let merged=0;by.forEach((e,mat)=>{if(e.k<2)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(e.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(e.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(e.u,2));if(e.col)g.setAttribute('color',new THREE.Float32BufferAttribute(e.c,3));
   /* the probe samples a mesh at its box centre: each merged piece's centre goes with it (userData.probePoints, the mesh's frame) */
   const m=new THREE.Mesh(g,mat);m.userData.probePoints=e.pts;m.name=(G.name||'engine')+'.merged';m.userData.inspectLabel=G.userData.inspectLabel;G.add(m);merged+=e.k;});
  kill.forEach(m=>{const e=by.get(m.material);if(e&&e.k>=2&&m.parent)m.parent.remove(m);});
  /* an instanced mesh's instances too (the probe samples a capped few of them: the Hive's 18 skirt beams among its plates read empty) */
  G.traverse(m=>{if(!m.isInstancedMesh||m.userData.probePoints)return;const a=m.instanceMatrix.array,pp=[];for(let i=0;i<m.count;i++){if(a[i*16]===0&&a[i*16+5]===0&&a[i*16+10]===0)continue;pp.push(a[i*16+12],a[i*16+13],a[i*16+14]);}m.userData.probePoints=pp;});
  return merged;}
 const eng0=AVC.engines;AVC.engines=function(){const L=eng0.apply(this,arguments)||[];L.forEach(G=>{try{out.mergedEngines+=mergeByMat(G);}catch(e){reportErr('engine merge: '+(e.message||e));}
  /* core/ruins watches each engine on the ground as drawn (the owner, 2026-11-10: the check is the default for every ruined structure; the harness asserts it) */
  if(typeof KRUINS!=='undefined')KRUINS.watch(G,{name:'the engine '+String(G.name||'').replace(/^engine\./,''),ground:terrainH});});return L;};
 /* the yard and the pieces, drawn once the transit is (its materials and builder): the pieces into one builder by family and chunk (57y), the sidings
    as the kit's rails, the buffer stops */
 out.draw=function(){if(out.ready)return;if(window._texPending>0||typeof KTRANSIT==='undefined'||typeof AVTR==='undefined'||!AVTR.ready)return;const t0=performance.now();
  const mark=(G,label)=>{G.userData.host=true;G.traverse(m=>{if(m.isMesh){m.userData.host=true;m.userData.inspectLabel=label;}});if(MP.shadow)MP.shadow.cast(G);scene.add(G);out.groups.push(G);return G;};
  /* the probe's points: each piece's middle (the pieces are merged into chunks, which the probe samples at their box centres) */
  const PTS=[];Y.PIECES.forEach(Q=>{if(!Q.registered)return;const y=Q.y==null?terrainH(Q.x,Q.z):Q.y;PTS.push(Q.x,y+Math.min(2,(Q.h==null?4:Q.h)*.5),Q.z);});
  const G=mark(MP.yardsDraw(Y.PIECES.filter(Q=>Q.registered),{kt:KTRANSIT,chunk:800,name:'the yards'}),'the yards: tanks, racks, gantries, stacks, conveyors');out.n=G.userData.n;G.userData.probePoints=PTS;
  STAGE.transit.sidings.forEach(R=>{if(R.registered)mark(KTRANSIT.draw.rail(R,{shadow:MP.shadow}),'the rail yard: '+R.id);});
  const B=KTRANSIT.builder();Y.YARD.stops.forEach(s=>{const g=terrainH(s.x,s.z);B.box('steel',KTRANSIT.frame(s.x,g,s.z,-s.yaw),2.2,1.4,3.2,[.55,.3,.18]);B.box('concrete',KTRANSIT.frame(s.x+Math.cos(s.yaw)*2.2,g,s.z+Math.sin(s.yaw)*2.2,-s.yaw),2.4,1.1,4.2,[.5,.48,.45]);});
  mark(B.finish('buffer stops',{chunk:0}),'a buffer stop');
  out.drawn=out.groups.length;out.ms=Math.round(performance.now()-t0);out.ready=true;};
 tick(function(){if(!out.ready){try{out.draw();}catch(e){out.ready=true;reportErr('yards: '+(e.stack||e));}}});
 return out;})();
