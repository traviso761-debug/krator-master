// ================================================================= STATION caverns — the Hykkousoi karst under the bay: the drawing
// The plan is 44k-host-karst.js (KKARST's records, laid before the ground: 45 draws the dolines). Here, after the sky and the water:
//   the cave        KKARST.build into one KCAVERN (rock 'limestone', 1 m cells, 16 m chunks) over the page's own ground (groundH: the sinkholes'
//                   floors inside their rims, the dolines); the sinks' wells are left out (the page's 11 m ground is not cut there: the
//                   shafts reach up under it, choked swallets under the dolines' soil). KCAVERN's materials are basalt and tuff only, so the
//                   rock is drawn here in the library's karst limestone (materials.json rock.wall), as the stacks and the sinkholes' walls are
//   the mouths      the tiankeng's chosen alcove has its back cut out of the wall mesh (45's SINK_GEOS[0]) where the passage runs on; each
//                   cenote's bed has its middle fan dropped over its shaft: the page's own meshes opened where the cave meets them
//   the light       a cave has no sky: each vertex carries how much sky it sees (aSky, from its depth under the ground) and the material's
//                   direct and ambient light are scaled by it; a lamp at the eye lights up the dark when the eye is under the ground (a
//                   PointLight kept on the scene at intensity 0 above it, so the programs never change)
//   the dress       KSPELEO.LIMESTONE in the chambers and along the tiankeng's passage (dripstone, straws, curtains, flowstone, rimstone),
//                   drowned with the rest where it is under the table (it grew when the sea was lower)
//   the water       a pool at the table (y +1) wherever a passage or a chamber crosses it (the face of a sump: where a walker stops and a
//                   breather goes on); the spring's boil and run on the shore (core/water ext/54 WATER.karstSpring)
//   the records     the cave system, every chamber (class feature, kind cave) and every hazard of KKARST.hazards; a sump's drown hazard is
//                   for land-breathers only: the record carries tags.road {for: ['water-breathers'], people: 'Hykkousoi'} and its hazard
//                   tags.hazard.spares ['water-breathers'] (core/hazard keeps only the fields it knows: the road is read beside it, see PLAN.md)
// Meshing is lazy past the showcase: the chunks near the views are meshed at load, the rest near the eye a few a frame (Dhelv's way).
const CAVES=(function(){const K=typeof NWBAY_KARST_N!=='undefined'?NWBAY_KARST_N:null;if(!K||!K.N){reportErr('caverns: the karst plan did not run');return null;}
 try{const t0=performance.now(),N=K.N,Q=new URLSearchParams(location.search);
 const C=KCAVERN.create({ground:groundH,cell:1,chunk:16,seed:20261103,minRock:.8});
 {const op=C.opening;C.opening=P=>P.kind==='well'?null:op(P);KKARST.build(C,N,{rock:'limestone'});C.opening=op;}
 C.build();
 // ---------------------------------------------------------------- the material: the library's karst limestone, lit by the sky it sees
 const lib=k=>{const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('nwbay',k):null;return L?Object.assign({s:L.scale[0]},KMAT.textures(L,{aniso:8})):null;};
 const Lw=lib('rock.wall')||{map:TEX_LIME,s:14};
 const mat=new THREE.MeshStandardMaterial({map:Lw.map,normalMap:Lw.normalMap||null,roughnessMap:Lw.roughnessMap||null,roughness:.92,metalness:0,vertexColors:true,side:THREE.DoubleSide});
 mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aSky;varying float vSky;').replace('#include <begin_vertex>','#include <begin_vertex>\nvSky=aSky;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vSky;')
   .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directDiffuse*=vSky;reflectedLight.directSpecular*=vSky;reflectedLight.indirectDiffuse*=mix(.12,1.,vSky);reflectedLight.indirectSpecular*=vSky;');};
 mat.customProgramCacheKey=()=>'nwbay-cave-sky';
 const S=Lw.s==null?14:Lw.s,TABLE=N.table,LIMEC=new THREE.Color(0xbdb6a8),DROWN=new THREE.Color(0x5f8a84),cc=new THREE.Color();
 const grp=new THREE.Group();grp.name='the Hykkousoi karst';scene.add(grp);
 const meshed=new Set();let tris=0,chunks=0;
 function meshKey(key){if(meshed.has(key))return;meshed.add(key);const ch=C.meshChunk(key);if(!ch.idx.length)return;const nv=ch.pos.length/3,G=65535;
  const uv=new Float32Array(nv*2),col=new Float32Array(nv*3),sky=new Float32Array(nv),wi=[];
  for(let i=0;i<nv;i++){const x=ch.pos[i*3],y=ch.pos[i*3+1],z=ch.pos[i*3+2],nx=Math.abs(ch.nrm[i*3]),ny=Math.abs(ch.nrm[i*3+1]),nz=Math.abs(ch.nrm[i*3+2]);
   if(ny>.7){uv[i*2]=x/S;uv[i*2+1]=z/S;}else if(nx>nz){uv[i*2]=z/S;uv[i*2+1]=y/S;}else{uv[i*2]=x/S;uv[i*2+1]=y/S;}
   const dep=groundH(x,z)-y,sk=Math.max(.03,Math.min(1,1-dep/22));sky[i]=sk*sk;
   const o=.45+.55*ch.occ[i];cc.copy(LIMEC).multiplyScalar(o);if(y<TABLE)cc.lerp(DROWN,Math.min(.65,(TABLE-y)*.12));col[i*3]=cc.r;col[i*3+1]=cc.g;col[i*3+2]=cc.b;}
  for(let t=0;t<ch.idx.length;t+=3){const a=ch.idx[t],b=ch.idx[t+1],c=ch.idx[t+2];if(ch.prim[a]===G||ch.prim[b]===G||ch.prim[c]===G)continue;wi.push(a,b,c);}   /* the ground's own triangles are the page's */
  if(!wi.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(ch.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(ch.nrm,3));
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aSky',new THREE.BufferAttribute(sky,1));g.setIndex(new THREE.BufferAttribute(new Uint32Array(wi),1));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,mat);m.userData.host=true;m.userData.cave=true;m.userData.probeSkip=true;m.userData.inspectLabel='The Hykkousoi karst (limestone, drowned below the table)';m.userData.cavernChunk=key;grp.add(m);tris+=wi.length/3;chunks++;}
 const keyOf=(x,y,z)=>Math.floor(x/16)+','+Math.floor(y/16)+','+Math.floor(z/16);
 const all=C.chunks.map(k=>{const v=k.split(',').map(Number);return{k,x:v[0]*16+8,y:v[1]*16+8,z:v[2]*16+8};});
 // ---------------------------------------------------------------- the showcase, meshed at load
 const T=K.tiankeng,show=[];T.pts.forEach(p=>show.push([p[0],p[1],p[2],40]));show.push([T.chamber.c[0],T.chamber.c[1]+T.chamber.h*.5,T.chamber.c[2],60]);
 K.cenotes.forEach(q=>{show.push([q.ch.c[0],q.ch.c[1]+q.ch.h*.5,q.ch.c[2],45]);});
 {const sn=N.nodes.find(n=>n.id===N.spring.node);show.push([sn.x,sn.y,sn.z,40],[K.spring[0],groundH(K.spring[0],K.spring[1])-2,K.spring[1],30]);}
 const eager=all.filter(c=>show.some(s=>Math.hypot(c.x-s[0],c.y-s[1],c.z-s[2])<s[3]+14));
 if(Q.get('caves')!=='lazy')eager.forEach(c=>meshKey(c.k));
 // ---------------------------------------------------------------- the rest, near the eye, a few chunks a frame
 tick(()=>{const e=camera.position;if(e.y>groundH(e.x,e.z)+120)return;let n=0;const near=all.filter(c=>!meshed.has(c.k)&&Math.hypot(c.x-e.x,c.y-e.y,c.z-e.z)<90).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y,a.z-e.z)-Math.hypot(b.x-e.x,b.y-e.y,b.z-e.z));
  for(const c of near){meshKey(c.k);if(++n>=4)break;}});
 // ---------------------------------------------------------------- the mouths: the page's own meshes opened where the cave meets them
 let cut={alcove:0,beds:0};
 {const want=g=>{let m=null;scene.traverse(o=>{if(!m&&o.isMesh&&o.geometry===g)m=o;});return m;};
  const TK=SINKS[0],wallM=want(SINK_GEOS[0]),A=T.alcove,R0=T.R0;
  if(wallM){const g=wallM.geometry,P=g.attributes.position,I=g.index.array,keep=[];
   /* drop the wall's triangles at the alcove's back, where the passage runs on: within the alcove's angle and height, past half its depth */
   const yC=T.mouth.y+A.hh*.45,hw=A.w*.5*.62/(R0*(1+TK.bell)),cy=A.hh*.5;
   for(let t=0;t<I.length;t+=3){let x=0,y=0,z=0;for(let k=0;k<3;k++){x+=P.getX(I[t+k]);y+=P.getY(I[t+k]);z+=P.getZ(I[t+k]);}x/=3;y/=3;z/=3;
    const ang=Math.atan2(z-TK.z,x-TK.x),da=Math.atan2(Math.sin(ang-A.a),Math.cos(ang-A.a)),r=Math.hypot(x-TK.x,z-TK.z);
    if(Math.abs(da)<hw&&Math.abs(y-yC)<cy&&r>R0*(1+TK.bell)+A.d*.4){cut.alcove++;continue;}keep.push(I[t],I[t+1],I[t+2]);}
   g.setIndex(keep);g.index.needsUpdate=true;}
  K.cenotes.forEach(q=>{let bed=null;scene.traverse(o=>{if(!bed&&o.isMesh&&o.userData.inspectLabel==='Cenote bed'&&o.geometry.boundingSphere==null&&o.geometry.computeBoundingSphere(),o.isMesh&&o.userData.inspectLabel==='Cenote bed'&&o.geometry.boundingSphere&&Math.hypot(o.geometry.boundingSphere.center.x-q.S.x,o.geometry.boundingSphere.center.z-q.S.z)<5)bed=o;});
   if(!bed)return;const g=bed.geometry,P=g.attributes.position,I=g.index.array,keep=[],r=q.sh.r;
   for(let t=0;t<I.length;t+=3){let x=0,z=0;for(let k=0;k<3;k++){x+=P.getX(I[t+k]);z+=P.getZ(I[t+k]);}x/=3;z/=3;if(Math.hypot(x-q.S.x,z-q.S.z)<r*1.05){cut.beds++;continue;}keep.push(I[t],I[t+1],I[t+2]);}
   g.setIndex(keep);g.index.needsUpdate=true;});}
 // ---------------------------------------------------------------- the dress: speleothems in the chambers and along the tiankeng's passage
 let speleo=0;
 if(typeof KSPELEO!=='undefined'&&Q.get('speleo')!=='0'){const recs=[];
  const boxes=N.chambers.filter(H=>/^nw:/.test(H.id)||show.some(s=>Math.hypot(H.c[0]-s[0],H.c[2]-s[2])<s[3]+40)).map(H=>({box:[H.c[0]-H.rx,H.c[2]-H.rz,H.c[0]+H.rx,H.c[2]+H.rz],y:H.c[1]+H.h*.45,id:H.id}));
  for(let k=0;k+1<T.pts.length;k++){const a=T.pts[k],b=T.pts[k+1];boxes.push({box:[Math.min(a[0],b[0])-4,Math.min(a[2],b[2])-4,Math.max(a[0],b[0])+4,Math.max(a[2],b[2])+4],y:(a[1]+b[1])/2+2.2,id:'tk'+k});}
  boxes.forEach(B=>{try{recs.push(...KSPELEO.place(C,{box:B.box,y:B.y,cell:4,world:20261103,kinds:KSPELEO.LIMESTONE}));}catch(e){reportErr('speleo '+B.id+': '+e.message);}});
  const seen=new Set(),uniq=recs.filter(r=>{if(seen.has(r.id))return false;seen.add(r.id);return true;});
  if(uniq.length){const M=KSPELEO.mesh(uniq,{seg:6}),g=new THREE.BufferGeometry(),nv=M.pos.length/3,sky=new Float32Array(nv),col=new Float32Array(nv*3),uv=new Float32Array(nv*2);
   for(let i=0;i<nv;i++){const x=M.pos[i*3],y=M.pos[i*3+1],z=M.pos[i*3+2],dep=groundH(x,z)-y,sk=Math.max(.03,Math.min(1,1-dep/22));sky[i]=sk*sk;cc.set(0xe2dccc);if(y<TABLE)cc.lerp(DROWN,Math.min(.6,(TABLE-y)*.12));col[i*3]=cc.r;col[i*3+1]=cc.g;col[i*3+2]=cc.b;uv[i*2]=x/S;uv[i*2+1]=y/S;}
   g.setAttribute('position',new THREE.BufferAttribute(M.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(M.nrm,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aSky',new THREE.BufferAttribute(sky,1));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
   g.setIndex(new THREE.BufferAttribute(M.idx,1));g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.userData.host=true;m.userData.cave=true;m.userData.probeSkip=true;m.userData.inspectLabel='Speleothems (dripstone, straws, curtains, flowstone, rimstone)';grp.add(m);speleo=uniq.length;tris+=M.idx.length/3;
   if(typeof KWALK!=='undefined'&&KSPELEO.blocks)KSPELEO.blocks(uniq).forEach(b=>{try{KWALK.block&&KWALK.block(b.box,{tag:'speleothem'});}catch(e){}});}}
 // ---------------------------------------------------------------- the water: a pool at the table where the cave crosses it; the spring
 const Wt=KKARST.water(N),M_={};N.nodes.forEach(n=>M_[n.id]=n);let pools=0;
 const poolAt=(x,z,r,name)=>{const poly=[];for(let s=0;s<20;s++){const a=s/20*Math.PI*2;poly.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}const P=WATER.still({name,level:TABLE,poly});
  WATER.drawStill(P,{color:lin(0x2e5a56),roughness:.05,metalness:.1,envMapIntensity:.08,renderOrder:1,pick:true});pools++;};
 N.passages.forEach(P=>{const a=M_[P.a],b=M_[P.b];const lo=Math.min(a.y,b.y),hi=Math.max(a.y,b.y);if(!(lo<TABLE&&hi+P.h>TABLE&&lo+P.h<TABLE+P.h))return;
  if(!(hi>TABLE-.5))return;const t=Math.max(0,Math.min(1,(TABLE-a.y)/((b.y-a.y)||1e-6))),x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;if(groundH(x,z)-TABLE<3)return;poolAt(x,z,Math.max(1.5,P.w*.6),'The face of a sump (the water table)');});
 let spring=null;if(WATER.karstSpring&&Q.get('spring')!=='0'){const sp=K.spring,g=groundH(sp[0],sp[1]),dx=BAY.c[0]-sp[0],dz=BAY.c[1]-sp[1],dl=Math.hypot(dx,dz),dir=[dx/dl,dz/dl];
  const line=[];for(let k=0;k<=8;k++){const t=k/8,x=sp[0]+dir[0]*(3+t*26),z=sp[1]+dir[1]*(3+t*26);line.push([x,z,Math.max(.02,Math.min(g-.05,groundH(x,z)+.2))]);}
  spring=WATER.karstSpring({name:'The shore spring under the stack (the cave\'s resurgence, brackish)',at:[sp[0],sp[1],Math.max(.05,g-.1)],r:3.4,dir,line,width:2.2,speed:.5,run:26,seed:4410});
  const Gp=spring.pool.gradient;if(Gp)spring.pool.gradient=WATER.gradientOf(spring.pool,{centre:lin(Gp.centre).getHex(),rim:lin(Gp.rim).getHex(),power:Gp.power});
  WATER.drawStill(spring.pool,WATER.lookDraw('spring','still',{color:lin(WATER.lookHex('spring',.3)),envMapIntensity:.3,renderOrder:1,pick:true,rain:true}));
  WATER.drawFlow(spring.flow,WATER.lookDraw('clear','flow',{shallow:lin(WATER.lookHex('clear',.75)),deep:lin(WATER.lookHex('clear',.3)),color:0xffffff,step:2,across:3,margin:.5,envMapIntensity:.4,renderOrder:2,pick:true,rain:true}));}
 // ---------------------------------------------------------------- the records: the system, the chambers, the hazards (the sumps are roads)
 const BREATHERS=['water-breathers'],ROAD={for:BREATHERS,people:'Hykkousoi',kind:'sump',note:'a flooded passage: the water-breathers\' road through the karst, not a hazard to them'};
 REGISTER({name:'The Hykkousoi karst (a drowned branchwork in thick grey limestone)',x:(K.box[0]+K.box[2])/2,z:(K.box[1]+K.box[3])/2,y:N.spring.y-6,r:Math.hypot(K.box[2]-K.box[0],K.box[3]-K.box[1])/2,h:Math.max(30,N.table-N.spring.y+40),kind:'cave',
  tags:{cave:{rock:'limestone',kind:'branch',drowned:true,level:N.spring.y,table:N.table,passages:N.passages.length,chambers:N.chambers.length,site:'biomes/KARST-SITES-5.1.md site 1'},road:ROAD}});
 /* the chambers and the hazards are core/tags records (BIO.record), not registered volumes: most of the cave is meshed only when the eye
    comes near, and a registered volume is something drawn (the probe's registered-volumes-non-empty) */
 const RECS=[];const rec=o=>{RECS.push(o);BIO.record(o);};
 N.chambers.forEach(H=>rec({name:(H.station==='tiankeng'?'The old river chamber under the tiankeng':H.station==='cenote'?'The flooded chamber under a cenote':'A chamber')+(H.flooded?' (flooded)':''),x:H.c[0],y:H.c[1],z:H.c[2],r:Math.max(H.rx,H.rz),h:H.h,kind:'cave',
  tags:{cave:{part:'chamber',flooded:!!H.flooded,id:H.id},...(H.flooded?{road:ROAD}:{})}}));
 const HZ=KKARST.hazards(N).filter(R=>!(R.tags.hazard.kind==='fall'&&/^nw:cenote/.test(R.id)));   /* a cenote's shaft is under its pool: a swim, not a fall */
 let roads=0;HZ.forEach(R=>{const h=R.tags.hazard,isRoad=h.kind==='drown';if(isRoad){h.spares=BREATHERS;roads++;}
  const sh=h.shape||{},r=sh.r!=null?sh.r:Math.max(1,(sh.w==null?2:sh.w)/2),hh=sh.h!=null?sh.h:2;
  rec({name:isRoad?'A sump (the Hykkousoi road; drowns a land-breather)':'A shaft (a fall)',x:R.at[0],y:R.at[1],z:R.at[2],ry:R.ry||0,r,h:Math.max(.5,hh),kind:'hazard',id:'karst:'+R.id,
   tags:isRoad?{hazard:h,road:ROAD}:{hazard:h}});});
 // ---------------------------------------------------------------- the lamp at the eye, on under the ground
 const lamp=new THREE.PointLight(0xffe2b8,0,45,1.6);scene.add(lamp);
 tick(()=>{const e=camera.position,under=e.y<groundH(e.x,e.z)-1.5;lamp.position.copy(e);lamp.intensity=under?1.6:0;});
 window._caves={ms:Math.round(performance.now()-t0),plan:K.ms,passages:N.passages.length,sumps:N.passages.filter(p=>p.section==='sump').length,chambers:N.chambers.length,shafts:N.shafts.length,
  dolines:K.recs.length,cenoteDolines:K.recs.filter(r=>r.form==='cenote').length,sinksDropped:K.dropped,chunks:C.chunks.length,meshed:()=>meshed.size,drawn:()=>chunks,tris:()=>Math.round(tris),
  eager:eager.length,cut,speleo,pools,spring:!!spring,hazards:HZ.length,roads};
 return {C,N,K,grp,mat,meshKey,meshed,show,hazards:HZ,recs:RECS};}catch(e){reportErr('caverns: '+(e&&e.stack||e));return null;}})();
// the eye may go down into the cave's voids (KHOST.take clampCam, 99-host-take.js); elsewhere the page's own floor holds it
const STATION_CLAMP=(p,t)=>{if(CAVES&&p.y<groundH(p.x,p.z)&&CAVES.C.sdf(p.x,p.y,p.z)>.4)return;const f=Math.max(terrainH(p.x,p.z),finTop(p.x,p.z))+1.8;if(p.y<f)p.y=f;};
// the station's views: written from the plan's own records
const STATION_VIEWS=CAVES?(function(){const K=CAVES.K,T=K.tiankeng,H=T.chamber,TK=SINKS[0],P=T.pts,c0=K.cenotes[0],V={};
 V['The tiankeng\'s cave mouth']=[TK.x+(T.mouth.x-TK.x)*-.35,TK.floorY+TK.talus*.4+8,TK.z+(T.mouth.z-TK.z)*-.35,T.mouth.x,T.mouth.y+T.alcove.hh*.4,T.mouth.z];
 V['The river passage (under the tiankeng\'s wall)']=[P[2][0],P[2][1]+2.2,P[2][2],P[4][0],P[4][1]+1.5,P[4][2]];
 V['The old river chamber under the tiankeng']=[H.c[0]+H.rx*.55,H.c[1]+H.h*.32,H.c[2],H.c[0]-H.rx*.6,H.c[1]+H.h*.35,H.c[2]];
 if(c0)V['The flooded chamber under the cenote (a road)']=[c0.ch.c[0]+c0.ch.rx*.5,c0.ch.c[1]+c0.ch.h*.4,c0.ch.c[2],c0.ch.c[0]-c0.ch.rx*.5,c0.ch.c[1]+c0.ch.h*.5,c0.ch.c[2]];
 if(c0){const m=CAVES.N.nodes.find(n=>n.id===c0.m),a=c0.ch.c;V['A drowned passage (a sump: the Hykkousoi road)']=[a[0]+(m.x-a[0])*.35,a[1]+(m.y-a[1])*.35+1.6,a[2]+(m.z-a[2])*.35,m.x,m.y+1.4,m.z];}
 {const sp=K.spring,g=groundH(sp[0],sp[1]);V['The shore spring (the resurgence)']=[sp[0]+(sp[0]-BAY.c[0])*.02+18,g+9,sp[1]+14,sp[0],g,sp[1]];}
 {const B=K.box;V['The karst from above (dolines over the cave)']=[(B[0]+B[2])/2-200,420,B[3]+300,(B[0]+B[2])/2,40,(B[1]+B[3])/2];}
 return V;})():null;
// the station's own checks (verify.py --assert: 99-host-take.js extra())
const STATION_CHECKS=()=>{const R=[],X=CAVES;if(!X)return[{name:'caverns-built',ok:false,detail:'the cave was not built (the error panel says why)'}];const N=X.N,c=window._caves;
 const adj={};N.passages.forEach(p=>{(adj[p.a]=adj[p.a]||[]).push(p.b);(adj[p.b]=adj[p.b]||[]).push(p.a);});
 const seen={[N.spring.node]:1},q=[N.spring.node];while(q.length){const n=q.shift();(adj[n]||[]).forEach(m=>{if(!seen[m]){seen[m]=1;q.push(m);}});}
 const one=N.nodes.every(n=>seen[n.id]);
 R.push({name:'karst-one-system',ok:one&&N.passages.length>100,detail:N.passages.length+' passages ('+c.sumps+' sumps), '+N.chambers.length+' chambers, '+N.shafts.length+' shafts; every node drains to the spring: '+one});
 const T=X.K.tiankeng,H=T.chamber,under=H.c[1]+H.h<T.floorY-6&&seen[H.node];
 R.push({name:'a-cave-under-the-tiankeng',ok:!!under&&seen['nw:tiankeng:mouth'],detail:'the old river chamber\'s crown '+(H.c[1]+H.h).toFixed(1)+' m under the floor at '+T.floorY.toFixed(1)+' m; the mouth\'s passage joined: '+!!seen['nw:tiankeng:mouth']+'; '+c.cut.alcove+' wall triangles cut at the alcove'});
 const cen=X.K.cenotes.map(q=>q.ch.c[1]+q.ch.h<q.S.floor-1&&seen[q.ch.node]&&q.ch.flooded);
 R.push({name:'a-flooded-cave-under-each-cenote',ok:cen.length===2&&cen.every(Boolean),detail:cen.length+' cenotes, each a flooded chamber under its bed, joined: '+cen.join(', ')+'; '+c.cut.beds+' bed triangles cut over the shafts'});
 const reg=X.recs.filter(r=>r.kind==='hazard'&&r.tags&&r.tags.hazard&&r.tags.hazard.kind==='drown'),roads=reg.filter(r=>r.tags.road&&r.tags.road.for.indexOf('water-breathers')>=0&&(r.tags.hazard.spares||[]).indexOf('water-breathers')>=0);
 R.push({name:'sumps-are-roads-for-water-breathers',ok:reg.length>0&&roads.length===reg.length,detail:roads.length+' of '+reg.length+' drown records carry tags.road and hazard.spares (land-breathers only)'});
 const bad=reg.slice(0,1).map(r=>({tags:{hazard:Object.assign({},r.tags.hazard,{spares:undefined})}})).filter(r=>r.tags.road&&(r.tags.hazard.spares||[]).length);
 R.push({name:'negative: a drown record without the road tag is caught',ok:bad.length===0&&reg.length>0,detail:'a copy stripped of road and spares would fail the check above'});
 const dl=X.K.recs.every(r=>groundBase0(r.x,r.z)>=1.5);
 R.push({name:'dolines-on-dry-land',ok:dl,detail:X.K.recs.length+' dolines ('+c.cenoteDolines+' cenote-form) on the ground over the cave; '+c.sinksDropped+' sinks dropped off the page\'s features'});
 R.push({name:'cave-drawn',ok:c.drawn()>0&&c.tris()>0,detail:c.drawn()+' chunks drawn of '+c.chunks+' ('+c.eager+' at load), '+c.tris()+' triangles, '+c.speleo+' speleothems, '+c.pools+' sump pools, spring '+c.spring+'; built in '+c.ms+' ms'});
 return R;};
