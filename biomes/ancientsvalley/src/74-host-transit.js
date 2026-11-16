// ================================================================= HOST - the transit, drawn (kits/ancient-transit)
// [web] PLAN.md section 14 (the owner, 2026-11-09: "a real, actual street grid with the streets and highway from the transit kit"). The records are
// the stage's (46z, `STAGE.transit`: the network over the lattice, the war on every street, the highway, the two lines, the subway, the trains);
// this draws them once the library maps are in, as the kit's demo does (kits/ancient-transit/src/70-host-stage.js), but merged for a grid of
// sixty-four streets over seven kilometres where the demo has eight: the kit finishes each street's surface in 400 m chunks a family, which is
// 3,000 draw calls here, so every road's surface goes into ONE builder finished in AV_TR_CHUNK (1.5 km) chunks, the junctions the same, and the
// kit's own draws (the highway, the lines, the subway) are made to chunk at the same size (the builder wrapped for the boot); a chunk beyond
// AV_TR_FAR of the eye is hidden (the page's fog has it anyway). The furniture and the war RECORDS of every street are made at the boot (KTRANSIT.dress, KTRANSIT.war: cheap) and bucketed
// into 400 m CELLS; a cell is DRAWN (one mesh a family, the furniture bundle's pieces merged, the barricades' vehicles, the rubble instanced) when
// the eye first comes within AV_TR_NEAR of it, one cell a frame, and shown only while the eye is near: a street dressed whole was 300-400 pieces
// over five kilometres that no view could cull (the whole grid at once was 16,000 pieces, 46 s at the boot and 3,200 draw calls a view).
// Everything placed is registered before it is drawn: the streets (with their piece counts), the lines and the trains at the boot; a cell's war
// and furniture as the cell is built (a record for a cell not yet drawn would be an empty volume to the probe). THE FAR TIER (2026-11-09, the
// pop-in at 750 m): every standing piece 3 m and taller (lamp standards, signals, signs, kiosks, shelters, the gantries' and footbridges'
// legs, sentry posts) is a dark post in ONE InstancedMesh from the boot, its instances zeroed in a cell while the cell's real pieces are
// drawn, so a street keeps its lamps to the fog's edge.
const AV_TR_NEAR=750,AV_TR_CELL=400,AV_TR_CHUNK=1500,AV_TR_FAR=3600,AV_TR_FREE=450;
/* the city is dead (the owner, 2026-11-09: "streetlights should be dead and rusted, not on at night"): every furniture piece built on this page, the
   highway's lamps among them, has dark lenses and rusted metal, standing or not (kits/ancient-transit's furniture assembler, KTF.dead) */
if(typeof KratorTransitFurniture!=='undefined')KratorTransitFurniture.dead=true;
const AVTR={ready:false,groups:[],cells:{},cellList:[],ms:0,n:{},built:0,cache:{},far:null};
const AV_TR_FAR_H=3;   /* a piece this tall and standing (not fallen or crushed) has a far post */
AVTR.build=function(){if(AVTR.ready)return true;if(window._texPending>0)return false;if(typeof KTRANSIT==='undefined'||!STAGE.transit)return AVTR.ready=true;
 const t0=performance.now(),T=STAGE.transit,furn=typeof KratorTransitFurniture!=='undefined'?KratorTransitFurniture:null,veh=typeof KratorVehicles!=='undefined'?KratorVehicles:null,sh=MP.shadow;
 const mark=(G,name)=>{G.userData.host=true;G.traverse(m=>{if(m.isMesh){m.userData.host=true;m.userData.inspectLabel=name;m.frustumCulled=true;}});return G;};
 const add=(G,name,kind,tags)=>{if(!G)return null;mark(G,name);scene.add(G);AVTR.groups.push(G);
  const b=new THREE.Box3().setFromObject(G);if(isFinite(b.min.x)&&isFinite(b.max.x)){const cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2;
   REGISTER({name,kind,x:cx,z:cz,y:b.min.y-1,r:Math.hypot(b.max.x-b.min.x,b.max.z-b.min.z)/2+2,h:b.max.y-b.min.y+2,tags:Object.assign({kind,tris:Math.round(G.userData.tris||0)},tags||{})});}return G;};
 AVTR.add=add;AVTR.furn=furn;AVTR.veh=veh;AVTR.sh=sh;
 /* the host's pads for the kit: a plinth (the towers' KSPACE) or an Engine blocks a footing, a pier, a piece of furniture */
 const pq=[];const blocked=(x,z,r)=>{if(STAGE.built(x,z)>.05)return true;pq.length=0;STAGE.pads.query(x,z,r,pq);
  for(const P of pq){if(P.family==='engine'){if(Math.hypot(x-P.x,z-P.z)<P.padR+r)return true;continue;}const dx=x-P.x,dz=z-P.z,u=dx*P.c+dz*P.s,v=-dx*P.s+dz*P.c;if(Math.abs(u)<P.rx+r&&Math.abs(v)<P.rz+r)return true;}return false;};
 const space=KSPACE.create({cell:12});let pieces=0,warPieces=0;
 const cellOf=(x,z)=>{const k=Math.floor(x/AV_TR_CELL)+','+Math.floor(z/AV_TR_CELL);let C=AVTR.cells[k];if(!C){C=AVTR.cells[k]={key:k,cx:(Math.floor(x/AV_TR_CELL)+.5)*AV_TR_CELL,cz:(Math.floor(z/AV_TR_CELL)+.5)*AV_TR_CELL,dress:[],war:[],scorch:[],vehicles:[],rubble:[],built:false,g:null,streets:{}};C.cellIndex=AVTR.cellList.length;AVTR.cellList.push(C);}return C;};
 /* the streets: every surface into one builder at its graded level, stopped at the junctions; the furniture and war records bucketed by cell */
 /* the builder's arrays go once it is finished (the heap, 2026-11-09: they are plain arrays of doubles, eight bytes a number, and the boot's closures
    kept the streets' builder alive: 400 MB of the 2 GB the boot held). Every caller finishes a builder last (the rail reads B.ties after, not B.b) */
 const mkB=KTRANSIT.builder;KTRANSIT.builder=function(){const B=mkB.apply(this,arguments),f=B.finish;B.finish=(name,o)=>{const G=f.call(B,name,Object.assign({chunk:AV_TR_CHUNK},o||{}));B.b={};return G;};return B;};
 const SB=KTRANSIT.builder();
 T.streets.forEach((st,i)=>{const Rd=T.net.roads[i],W=T.wars[i],D=KTRANSIT.dress(st,Object.assign({seed:KRAND.hash(STAGE.seed|0,81,i,0),space,blocked,war:W,damage:W.damageAt,network:T.net,road:i},T.dressOpts||{}));pieces+=D.pieces.length;warPieces+=W.pieces.length;
  KTRANSIT.draw.road(SB,Rd,terrainH,{pavement:Rd.pavement==null?3.5:Rd.pavement,network:T.net,road:i});
  D.pieces.forEach(p=>{const C=cellOf(p.x,p.z);C.dress.push([p,i]);C.streets[i]=1;});W.pieces.forEach(p=>{const C=cellOf(p.x,p.z);C.war.push([p,i]);C.streets[i]=1;});
  W.scorch.forEach(sc=>cellOf(sc.x,sc.z).scorch.push([sc,i]));W.craters.forEach(c=>cellOf(c.x,c.z).scorch.push([{x:c.x,z:c.z,r:c.r*1.6,deep:true},i]));
  (W.blockades||[]).forEach(bk=>bk.vehicles.forEach(v=>cellOf(v.x,v.z).vehicles.push(v)));W.rubble.forEach(r=>cellOf(r.x,r.z).rubble.push(r));
  D.pieces.concat(W.pieces).forEach(p=>{const K=KTRANSIT.KINDS[p.kind];if(!K||!(K.h>=AV_TR_FAR_H)||p.state==='fallen'||p.state==='crushed')return;const C=cellOf(p.x,p.z);(C.far||(C.far=[])).push(p);});
  const a=st.pts[0],b=st.pts[1],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,ys=[terrainH(a[0],a[1]),terrainH(mx,mz),terrainH(b[0],b[1])];
  REGISTER({name:'the street '+st.id+(st.av?' (an avenue)':''),kind:'street',x:mx,z:mz,y:Math.min(...ys)-3,r:Math.hypot(b[0]-a[0],b[1]-a[1])/2+st.width,h:Math.max(...ys)-Math.min(...ys)+12,tags:{kind:'street',pieces:D.pieces.length,craters:W.craters.length,positions:W.positions.length,avenue:!!st.av,id:st.id}});});
 add(SB.finish('streets',{chunk:AV_TR_CHUNK}),'the streets of the grid','street-surface',{roads:T.streets.length});
 /* the far tier: one post an eligible piece, a bent one shorter, coloured like the kit's rusted steel; zeroed where a cell's pieces are drawn */
 {let nF=0;AVTR.cellList.forEach(C=>{if(C.far)nF+=C.far.length;});if(nF){const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);const col=KTRANSIT.COL&&KTRANSIT.COL.rust?KTRANSIT.COL.rust:[.35,.25,.2];
   const im=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:new THREE.Color(col[0]*.8,col[1]*.8,col[2]*.8)}),nF),M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),Sc=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0);let i=0;
   AVTR.cellList.forEach(C=>{if(!C.far)return;C.farI=[];C.far.forEach(p=>{const K=KTRANSIT.KINDS[p.kind],h=K.h*(p.state==='bent'||p.state==='leaning'?.8:1),w=Math.min(.6,Math.max(.3,K.w*.3));P.set(p.x,p.y,p.z);Q.setFromAxisAngle(Y,p.yaw||0);Sc.set(w,h,w);M.compose(P,Q,Sc);im.setMatrixAt(i,M);C.farI.push(i);i++;});});
   im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.userData.host=true;im.userData.inspectLabel='a street\'s furniture, far';im.name='transit.far';scene.add(im);AVTR.far=im;AVTR.groups.push(im);
   REGISTER({name:'the streets\' furniture, the far tier',kind:'street-far',x:0,z:0,r:STAGE.R+400,h:12,tags:{kind:'street-far',posts:nF}});}}
 /* the junctions: a patch, the filleted pavement corners, the crosswalks */
 {const JB=KTRANSIT.builder();KTRANSIT.draw.junctions(JB,T.net,terrainH);add(JB.finish('junctions',{chunk:AV_TR_CHUNK}),'the junctions of the grid','junction',{count:T.net.junctions.length});}
 /* the highway, its ramps, the piers culled where they meet a plinth */
 /* a station with streets alone (the Terraces' farm roads: STAGE.transit without the lines) draws only what it has */
 AVTR.culled=T.highway?KTRANSIT.cull(T.highway,blocked):0;
 if(T.highway)add(KTRANSIT.draw.highway(T.highway,{furn,vehicles:veh,shadow:sh,err:reportErr}),'the elevated highway','highway',{spans:T.highway.spans.length,ramps:T.highway.ramps.length,culled:AVTR.culled});
 /* the lines, the subway, the trains */
 if(T.cargo)add(KTRANSIT.draw.rail(T.cargo,{shadow:sh}),'the cargo line','rail',{crossings:T.cargo.crossings.length});
 if(T.pax)add(KTRANSIT.draw.rail(T.pax,{shadow:sh}),'the elevated passenger line','rail',{stations:T.pax.stations.length});
 if(T.subway)add(KTRANSIT.draw.subway(T.subway,{furn,shadow:sh}),'the subway','subway',{stations:T.subway.stations.length,sinkholes:T.subway.sinkholes.length});
 (T.trains||[]).forEach(tr=>add(KTRANSIT.draw.train(tr,{shadow:sh}),'a train: '+tr.id+' ('+tr.state+')','train',{cars:tr.cars.length,state:tr.state}));
 KTRANSIT.builder=mkB;AVTR.chunked=[];AVTR.groups.forEach(G=>G.traverse(m=>{if(m.isMesh&&m.userData.chunk!=null){const k=m.userData.chunk.split(',');m.userData.chunkAt=[(+k[0]+.5)*AV_TR_CHUNK,(+k[1]+.5)*AV_TR_CHUNK];AVTR.chunked.push(m);}}));
 AVTR.n={roads:T.streets.length,dressed:T.streets.length,pieces,warPieces,cells:AVTR.cellList.length,junctions:T.net.junctions.length,ramps:T.highway?T.highway.ramps.length:0,crossings:T.cargo?T.cargo.crossings.length:0,stations:T.subway?T.subway.stations.length:0,trains:(T.trains||[]).length};
 AVTR.ms=Math.round(performance.now()-t0);AVTR.ready=true;return true;};
/* a cell's furniture and war, built when the eye first comes near it (one cell a frame): the scorch marks (the kit's: dark discs on the ground),
   the pieces of the furniture bundle merged, the barricades' vehicles, the rubble instanced; one mesh a family */
AVTR.piece=function(key,o){const c=AVTR.cache;let g=c[key];if(g===undefined){try{g=AVTR.furn.build(o.kind,{state:o.state,variant:o.variant,seed:o.seed,span:o.span});}catch(e){g=null;reportErr('transit piece '+key+': '+(e.message||e));}c[key]=g;}return g;};
AVTR.buildCell=function(C){const T=STAGE.transit,KT=KTRANSIT,B=KT.builder(),col=KT.COL,soot=[col.soot[0]*.9,col.soot[1]*.9,col.soot[2]*.9];let n=0,failed=0;
 C.scorch.forEach(e=>{const sc=e[0],ground=T.wars[e[1]].path.ground,nn=sc.deep?24:14,rings=sc.deep?[.2,.45,.7,.85,1]:[.5,1],at=(q,a)=>{const x=sc.x+Math.cos(a)*sc.r*q,z=sc.z+Math.sin(a)*sc.r*q;return[x,ground(x,z)+.07,z];},c=[sc.x,ground(sc.x,sc.z)+.07,sc.z];
  for(let i=0;i<nn;i++){const a=i/nn*Math.PI*2,b=(i+1)/nn*Math.PI*2;B.tri('line',c,at(rings[0],a),at(rings[0],b),soot,{face:[0,1,0]});for(let k=0;k+1<rings.length;k++)B.quad('line',at(rings[k],a),at(rings[k],b),at(rings[k+1],b),at(rings[k+1],a),soot,{face:[0,1,0]});}});
 if(AVTR.furn)C.dress.concat(C.war).forEach(e=>{const p=e[0],g=AVTR.piece(p.kind+'.'+p.state+'.'+p.variant+'.'+p.seed+'.'+(p.span==null?0:p.span),p);if(!g){failed++;return;}const m=KT.draw.pieceFrame(p,T.net.roads[e[1]].levelAt);g.children.forEach(ch=>B.mesh(null,ch,m));n++;});
 const vk=C.vehicles.length?KT.draw.vehicles(B,C.vehicles,{vehicles:AVTR.veh,err:reportErr}):{real:0,hulks:0};
 const G=B.finish('transit cell '+C.key,{chunk:0}),im=C.rubble.length?KT.draw.rubble(C.rubble,{seed:KRAND.hash(STAGE.seed|0,83,C.cellIndex|0,0),name:'transit cell '+C.key+'.rubble'}):null;if(im)G.add(im);
 AVTR.cache={};   /* the furniture pieces are merged into this cell's builder: their prototypes go with it (keyed by seed, they are seldom wanted twice) */
 const y=terrainH(C.cx,C.cz);if(!C.reg){C.reg=true;REGISTER({name:'the furniture and war of the streets about '+Math.round(C.cx)+', '+Math.round(C.cz),kind:'street-dress',x:C.cx,z:C.cz,y:y-6,r:AV_TR_CELL*.71+4,h:36,tags:{kind:'street-dress',pieces:n,vehicles:vk.real+vk.hulks,rubble:C.rubble.length,streets:Object.keys(C.streets).length}});}   /* once: a freed cell is built again when the eye comes back */
 if(AVTR.sh)AVTR.sh.cast(G);G.userData.host=true;G.traverse(m=>{if(m.isMesh){m.userData.host=true;m.userData.inspectLabel='the streets\' furniture and war';m.frustumCulled=true;}});
 G.userData.pieces=n;G.userData.failed=failed;G.userData.vehicles=vk.real;G.userData.hulks=vk.hulks;scene.add(G);return G;};
/* a cell the eye has left by AV_TR_FREE past its near range goes: its meshes leave the scene and their geometry is freed (the heap, 2026-11-09: a
   view kept every cell it built, 130 MB a view, and a fourteen-view tour ran the renderer out of V8's 4 GB); it is built again when the eye comes
   back, one cell a frame as before. Its geometry is its own (the builder's merge and the rubble's box); the materials are the kit's, shared, kept */
AVTR.freed=0;AVTR.freeCell=function(C){const G=C.g;if(!G)return;scene.remove(G);G.traverse(m=>{if(m.isInstancedMesh&&m.dispose)m.dispose();if(m.geometry)m.geometry.dispose();});C.g=null;C.built=false;AVTR.freed++;};
AVTR.frame=0;AVTR.farTick=function(){if(!AVTR.chunked)return;   /* a station without the transit (the Terraces) builds no chunks: AVTR.build is ready at once */const e=camera.position,R=AV_TR_FAR+AV_TR_CHUNK*.71;for(const m of AVTR.chunked){const a=m.userData.chunkAt;m.visible=Math.hypot(a[0]-e.x,a[1]-e.z)<R;}};
AVTR.dressTick=function(){if(!AVTR.ready)return;if(!(AVTR.frame++%15))AVTR.farTick();if(!AVTR.cellList.length)return;const e=camera.position;let builtOne=false;
 for(const C of AVTR.cellList){const near=Math.hypot(C.cx-e.x,C.cz-e.z)<AV_TR_NEAR;
  if(near&&!C.built&&!builtOne){builtOne=true;C.built=true;try{C.g=AVTR.buildCell(C);AVTR.built++;}catch(err){reportErr('transit cell '+C.key+': '+(err.message||err));}}
  if(C.g&&!near&&Math.hypot(C.cx-e.x,C.cz-e.z)>AV_TR_NEAR+AV_TR_FREE)AVTR.freeCell(C);
  if(C.g)C.g.visible=near;
  /* the far posts of a cell go while its pieces are drawn, and come back when they are not */
  if(C.farI&&AVTR.far){const hide=!!(C.g&&near);if(C.farHid!==hide){C.farHid=hide;const A=AVTR.far.instanceMatrix.array;for(const k of C.farI){if(hide){if(!C.farSave)C.farSave={};C.farSave[k]=Array.prototype.slice.call(A,k*16,k*16+16);for(let q=0;q<16;q++)A[k*16+q]=0;}else if(C.farSave&&C.farSave[k]){const s=C.farSave[k];for(let q=0;q<16;q++)A[k*16+q]=s[q];}}AVTR.far.instanceMatrix.needsUpdate=true;}}}};
tick(function(){if(!AVTR.ready)AVTR.build();else AVTR.dressTick();});
