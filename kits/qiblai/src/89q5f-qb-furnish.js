// ================================================================= QIBLAI — the furnishing pass (Q6), shared by the sheet and the city
// qnFurnishRooms(rooms, parent, o) furnishes recorded rooms (QB_ROOMS records, 89q5) with the catalog's pieces (the furniture
// bundle a target takes through kit.json "interiors": Xanadu, its fallbacks East Abyss and generic, the goods and the trades'
// work pieces) through kits/interiors (furnishRoom, its runtime adapter on one batch), flushed into a group under parent.
// Each piece is registered in core/tags before it is drawn (KTAGS.page). o: {seed (each room's: seed + its index), frag (the
// calling fragment's name, for the tags), name (the group's), cell (the placer's grid, kits/interiors' 0.1 m by default; not
// 0.2 for these rooms: on it the council chamber's aisle, at the Hall of the Decree's place, sealed the room off and nothing
// fitted, while the same room shifted by a few metres furnished: KNOWN_ISSUES.md), perType (below), passes and backtrack
// (kits/interiors' re-furnishing when a required piece finds no fit: 3 orders and 48 backtracks by default, each a whole
// pass; the city bounds them, so a piece that cannot fit costs a pass or two, not minutes)}. Returns {on, rooms, pieces, missing, fails, byRoom, tex, group}:
// on false when the page carries no furniture bundle. The sheet runs it once at load (targets/kit/90q-qb-furnish.js), the
// city once per room when the camera comes to its building (settlements/qiblai targets/city/90t-qc-interiors.js).
function qnFurnishRooms(rooms,parent,o){o=o||{};const S={on:false,rooms:0,pieces:0,missing:{},fails:[],byRoom:[],tex:null,group:null};
 if(typeof KratorFurniture==='undefined'||typeof KratorInteriors==='undefined'||!rooms.length)return S;
 S.on=true;const IX=KratorInteriors,T=KTAGS.page||(KTAGS.page=KTAGS.create({build:'xanadu'})),seed=o.seed==null?33851:o.seed;
 const batch=KratorFurniture.batch({indexed:true}),adapter=IX.runtimeAdapter(KratorFurniture,batch),build0=adapter.build;
 // o.perType: the candidates the placer sees, at most this many pieces of a culture and type (the catalog's order), each in
 // at most two variants. The placer tries every candidate at every slot, flooding its grid for each pose, so a group that
 // cannot fit costs (pieces x variants x slots x cells): in a 39 m hall with the whole catalog it ran for minutes (2026-11-15)
 if(o.perType){const L0=adapter.list.bind(adapter);let cache=null;
  adapter.list=function(){if(cache)return cache;const by={};cache=L0().filter(d=>{const k=(d.culture||'')+'|'+d.type;by[k]=(by[k]==null?0:by[k])+1;return by[k]<=o.perType;})
   .map(d=>(d.variants==null?1:d.variants)>2?Object.assign({},d,{variants:2}):d);return cache;};}
 let cur=null;
 adapter.build=function(p,room){const E=KratorFurniture.FURN_BY_KEY[p.key]||{},t={setting:'room'};if(E.culture)t.culture=E.culture;if(E.tier)t.tier=E.tier;
  T.add({prefix:'ixf','class':'furniture',kind:E.type||null,key:p.key,name:E.name||null,at:[p.x,(p.y==null?0:p.y),p.z],ry:(p.ry==null?0:p.ry),size:E.w?[E.w,E.d,E.h]:undefined,
   tags:Object.assign(t,{room:cur}),frag:o.frag||'89q5f-qb-furnish.js'});return build0.call(this,p,room);};
 rooms.forEach((Q,i)=>{const id='qiblai.'+Q.key+'.'+(Q.id==null?i:Q.id);cur=id;
  try{const R=IX.normRoom({building:Q.key,id,kind:Q.kind,poly:Q.poly,y:Q.y,h:Q.h,doors:Q.doors,culture:Q.culture,wealth:Q.wealth,fixtures:Q.fixtures,seed:seed+i});
   const fo={seed:0};if(o.cell!=null)fo.cell=o.cell;if(o.passes!=null)fo.passes=o.passes;if(o.backtrack!=null)fo.backtrack=o.backtrack;
   const plan=IX.furnishRoom(R,adapter,fo);IX.buildRoom(plan,adapter,R);const A=IX.audit(R,plan,adapter);
   S.rooms++;S.pieces+=plan.placements.length;S.byRoom.push({room:Q.name,kind:Q.kind,pieces:plan.placements.length,ok:A.ok});
   (plan.missing||[]).forEach(m=>{const k=Q.name+': '+(m.need||m);S.missing[k]=((S.missing[k]==null?0:S.missing[k]))+1;});if(!A.ok)S.fails.push(Q.name+': '+JSON.stringify(A.fails.slice(0,3)).slice(0,300));}
  catch(e){reportErr('interior '+Q.name+': '+(e&&e.message||e));}});
 const g=new THREE.Group();g.name=o.name||'qiblai-interiors';g.userData.inspectLabel='Furniture (interiors)';parent.add(g);batch.flush(g);S.group=g;
 // the textures (kit.json "furnitureTex": the library's detail maps, krator-furniture-detail.js, hooked at the flush): every
 // furniture mesh that is lit should carry its family's map; the ones that do not are named by family
 const tx={meshes:0,mapped:0,bare:[],families:KratorFurniture.textureInfo?KratorFurniture.textureInfo().families.length:0,detail:typeof KF_TEX!=='undefined'||!!KratorFurniture.detailize};
 g.traverse(m=>{if(!m.isMesh||m.material.isMeshBasicMaterial)return;tx.meshes++;if(m.material.map)tx.mapped++;else if(tx.bare.length<12)tx.bare.push(m.material.userData.texFamily||m.material.userData.family||m.name||'?');});
 S.tex=tx;return S;}
