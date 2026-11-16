// TARGET: kit — the furnishing pass (Q6): every room the kit's interior builders recorded (QB_ROOMS, src/89q5-qb-interiors.js)
// furnished with the catalog's pieces (the furniture bundle: Xanadu, its fallbacks East Abyss and generic, the goods and the
// trades' work pieces) through kits/interiors (furnishRoom, its runtime adapter on one batch), after the scene is built
// (90-scene.js) and before the probe. Each piece is registered in core/tags before it is drawn (KTAGS.page, which
// 91t-xanadu-tags.js then takes up). window._interiors reports rooms, pieces, what a programme missed and the audit.
const QB_IX=(function(){const S={on:false,rooms:0,pieces:0,missing:{},fails:[],byRoom:[]};
 const report=()=>{window._interiors={on:S.on,rooms:S.rooms,pieces:S.pieces,missing:S.missing,fails:S.fails.slice(0,12),byRoom:S.byRoom,tex:S.tex||null};};
 if(typeof KratorFurniture==='undefined'||typeof KratorInteriors==='undefined'||!QB_ROOMS.length){report();return S;}
 S.on=true;const IX=KratorInteriors,T=KTAGS.page||(KTAGS.page=KTAGS.create({build:'xanadu'}));
 const batch=KratorFurniture.batch({indexed:true}),adapter=IX.runtimeAdapter(KratorFurniture,batch),build0=adapter.build;
 let cur=null;
 adapter.build=function(p,room){const E=KratorFurniture.FURN_BY_KEY[p.key]||{},t={setting:'room'};if(E.culture)t.culture=E.culture;if(E.tier)t.tier=E.tier;
  T.add({prefix:'ixf','class':'furniture',kind:E.type||null,key:p.key,name:E.name||null,at:[p.x,(p.y==null?0:p.y),p.z],ry:(p.ry==null?0:p.ry),size:E.w?[E.w,E.d,E.h]:undefined,
   tags:Object.assign(t,{room:cur}),frag:'90q-qb-furnish.js'});return build0.call(this,p,room);};
 QB_ROOMS.forEach((Q,i)=>{const id='qiblai.'+Q.key+'.'+i;cur=id;
  try{const R=IX.normRoom({building:Q.key,id,kind:Q.kind,poly:Q.poly,y:Q.y,h:Q.h,doors:Q.doors,culture:Q.culture,wealth:Q.wealth,fixtures:Q.fixtures,seed:33851+i});
   const plan=IX.furnishRoom(R,adapter,{seed:0});IX.buildRoom(plan,adapter,R);const A=IX.audit(R,plan,adapter);
   S.rooms++;S.pieces+=plan.placements.length;S.byRoom.push({room:Q.name,kind:Q.kind,pieces:plan.placements.length,ok:A.ok});
   (plan.missing||[]).forEach(m=>{const k=Q.name+': '+(m.need||m);S.missing[k]=((S.missing[k]==null?0:S.missing[k]))+1;});if(!A.ok)S.fails.push(Q.name+': '+JSON.stringify(A.fails.slice(0,3)).slice(0,300));}
  catch(e){reportErr('interior '+Q.name+': '+(e&&e.message||e));}});
 const g=new THREE.Group();g.name='qiblai-interiors';g.userData.inspectLabel='Furniture (interiors)';scene.add(g);batch.flush(g);
 // the textures (kit.json "furnitureTex": the library's detail maps, krator-furniture-detail.js, hooked at the flush): every
 // furniture mesh that is lit should carry its family's map; the ones that do not are named by family
 const tx={meshes:0,mapped:0,bare:[],families:KratorFurniture.textureInfo?KratorFurniture.textureInfo().families.length:0,detail:typeof KF_TEX!=='undefined'||!!KratorFurniture.detailize};
 g.traverse(m=>{if(!m.isMesh||m.material.isMeshBasicMaterial)return;tx.meshes++;if(m.material.map)tx.mapped++;else if(tx.bare.length<12)tx.bare.push(m.material.userData.texFamily||m.material.userData.family||m.name||'?');});
 S.tex=tx;report();return S;})();
