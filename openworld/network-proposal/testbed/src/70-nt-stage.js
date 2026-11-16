// ================================================================= HOST — the test bed's drawing and views  [web]
// Each road class drawn by KTRANSIT.draw.road into a builder of its own, in its class's surface (the records' surface); each junction by
// KTRANSIT.draw.junctions in its widest arm's surface, on its pad where on fill;
// the viaduct and the trestle by KTRANSIT.draw.highway; the guideway by KTRANSIT.draw.rail; the marsh's water a plain disc.
const TRS={ready:false,groups:[],rec:{},ms:0};
TRS.build=function(){if(TRS.ready)return true;if(window._texPending>0)return false;const t0=performance.now(),g=terrainH,sh=TR_SHADOW,M=KTRANSIT.mats();
 const add=(G,name,kind,tags)=>{scene.add(G);TRS.groups.push(G);if(sh)G.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});const b=new THREE.Box3().setFromObject(G);if(!isFinite(b.min.x))return G;const cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2;
  REGISTER({name:name,kind:kind,x:cx,z:cz,y:b.min.y-1,r:Math.hypot(b.max.x-b.min.x,b.max.z-b.min.z)/2+2,h:b.max.y-b.min.y+2,tags:Object.assign({kind:kind,tris:Math.round(G.userData.tris||0)},tags||{})});return G;};
 /* the roads, class by class (each road record carries its class's surface: KTRANSIT.draw.road lays it) */
 Object.keys(NT_CLASS).forEach(k=>{const idx=NT_DEFS.map((d,i)=>d.cls===k?i:-1).filter(i=>i>=0);if(!idx.length)return;const B=KTRANSIT.builder();
  idx.forEach(i=>{const Rd=NT_ROADS[i];KTRANSIT.draw.road(B,Rd,g,i<TR_ROADS.length?{pavement:Rd.pavement,network:NT_NET,road:i}:{pavement:0});});
  add(B.finish('road.'+k),NT_CLASS[k].label,'road',{cls:k,roads:idx.length});});
 /* the junctions: each in its widest arm's surface, on an earth pad where it stands on fill (KTRANSIT.draw.junctions) */
 NT_NET.junctions.forEach(J=>{const B=KTRANSIT.builder();KTRANSIT.draw.junctions(B,Object.assign({},NT_NET,{junctions:[J]}),g);
  add(B.finish('junction.'+J.id),'Junction '+J.id+' ('+J.kind+': '+J.arms.map(a=>NT_DEFS[a.road].cls).join(' x ')+')','junction',{kind:J.kind});});
 /* the Ancient way's structures and its guideway */
 add(KTRANSIT.draw.highway(NT_VIADUCT,{shadow:sh}),'The Ancient way: the viaduct over the valley','viaduct',{spans:NT_VIADUCT.spans.length});
 add(KTRANSIT.draw.highway(NT_TRESTLE,{shadow:sh}),'The Ancient way: the trestle over the marsh','trestle',{spans:NT_TRESTLE.spans.length});
 add(KTRANSIT.draw.rail(NT_GUIDE,{shadow:sh}),'The Ancient way: the guideway over its median','guideway',{spans:NT_GUIDE.spans.length});
 /* the marsh's water */
 {const geo=new THREE.CircleGeometry(NT_MARSH.r+10,72);geo.rotateX(-Math.PI/2);const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x35545a,roughness:.12,metalness:.1,transparent:true,opacity:.86}));
  m.position.set(NT_MARSH.x,NT_WATER,NT_MARSH.z);m.name='water';m.userData.host=true;const G=new THREE.Group();G.name='water';G.userData.tris=72;G.add(m);scene.add(G);TRS.groups.push(G);}
 TRS.rec={net:NT_NET,roads:TR_ROADS,viaduct:NT_VIADUCT,trestle:NT_TRESTLE,guide:NT_GUIDE};
 TRS.ms=Math.round(performance.now()-t0);TRS.ready=true;return true;};
tick(()=>{TRS.build();});
/* the views: [cx, cy, cz, tx, ty, tz], heights off the finished ground (nv) or a deck */
const nv=(cx,cz,up,tx,tz,tup)=>[cx,terrainH(cx,cz)+up,cz,tx,terrainH(tx,tz)+tup,tz];
const VIEWS={
 'From the air':[150,1500,1900,150,0,-150],
 'The road classes, low':[-1500,140,-1450,-500,0,-200],
 'Ancient way x Izani highway, the guideway over':nv(-150,60,26,-200,0,1),
 'The way in its cutting through the ridge':nv(-950,10,14,-700,0,4),
 'The viaduct, the Vothic road under it':[420,terrainH(420,90)+14,90,350,terrainH(350,0)+10,0],
 'The way up its embankment to the viaduct':nv(60,70,16,200,0,6),
 'The trestle over the marsh':[1000,8,160,1150,-1,0],
 'The way onto the trestle':nv(780,-60,14,850,0,5),
 'The Xanadu road over the ridge':nv(-800,-620,30,-700,-700,4),
 'The Yuni road into the valley (two T junctions)':nv(60,780,40,250,700,0),
 'The trade highway onto the Izani highway':nv(-250,450,16,-200,400,1),
 'The dirt road over the hill (12 %)':nv(-1020,-1020,26,-1100,-900,2),
 'The trail crosses the dirt road':nv(-1060,-780,16,-1100,-827,1),
 'The trail crosses the Xanadu road':nv(-1180,-660,14,-1218,-700,1),
 'The dirt road onto the Ancient way':nv(-1060,-60,14,-1100,0,1)};
