// ================================================================= HOST — build (Korona)
// Three kits on one page (biomes/WORLD.md): the NECANYONS kit first (read in place), on the rock, the walls' feet and
// the stream's banks: its canyon flora and its carnivores; then KORONA's own (the summit's life, the man-eaters, the
// hollow's floor); their trees become obstacles; then the HYPERJUNGLE plants the gorge floor (its mask: off the rock and
// the walls' feet, out of the stream, thin where the ground is poor); then one bake.
// 89z, after the water (it was 88; the final rebuild, 2026-11-03): the flora's fields read the water's own surfaces, so they must exist first.
// THE WATER AS FIELDS (core/water ext/60; core/biome 41): one shore for the audit and the field contract, the distance to the water the eye sees
// (WATER.fieldAt), not to a pool's radius; the kits keep their own masks (waterMask: the drawn level) so nothing placed moves. ?fields=0 none
const WATER_F=new URLSearchParams(location.search).get('fields')!=='0'&&WATER.fields&&WATER.surfaces.length?
 WATER.fields({box:[-STAGE.R*1.1,-STAGE.R*1.1,STAGE.R*1.1,STAGE.R*1.1],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall')}):null;
const WATER_FN=WATER_F?WATER.fieldFns(WATER_F):null;
/* the field contract (core/biome/README.md, "The environmental fields"): Korona's fields mapped to BIO.ENV's names and units */
const ENV=BIO.env?BIO.env({ground:terrainH,water:WATER_FN||undefined,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z)}):null;
const IMP_GAIN=2.6;   /* the impostors' gain (oidong 2.6, ebadlands 2.4): the bake is ~4x dark; set against the near lace fans */
/* THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03): toggleable and OFF by default here; ?shadow=1 turns them on (their cost is the
   owner's call: the Throne's station 1 +30-38% a frame on the Arc) */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
window._biome=null;window._jungle=null;window._korona=null;window._desert=null;window._high=null;window._shore=null;window._crest=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(Q.get('diet')==='0')KORONA.IMPOSTORS=false;   /* ?diet=0: the far lace fans keep their blobs (55) */
 if(STAGE.necQ!==0){try{window._biome=NECANYONS.build({R:STAGE.R-60,quality:q*(STAGE.necQ==null?1:STAGE.necQ)});}catch(e){reportErr('necanyons: '+e.stack);}}
 _mark('necanyons');
 /* THE SEEP CURTAINS ON THE DRAWN LIP (the final rebuild, 2026-11-03; the attach audit's 1.7% on station 1): the necanyons kit hangs its curtains
    (carnmoss) and seep ferns at the bed's outline (K.footR + .35 m), but KSTACKS draws a bed's top edge at the cap's lip, footR x (1 - ch), and a
    tepui's caps overhang far more than a canyon's (ch .012-.06 here: 6-30 m at these radii), so on this page they hung in the air. Each is pulled in
    along its bed's radius by footR x ch, to .35 m off the drawn lip, its height and turn kept: positions only, no draw, so nothing else moves. The
    necanyons page keeps its own (its caps' ch is small; the fix there is its own turn's: KNOWN_ISSUES.md). ?seat=0 leaves them */
 if(Q.get('seat')!=='0'){const R=BIO.kits.necanyons,BS=NECANYONS.bodies(),K=KSTACKS;let moved=0;
  ['carnmoss','seepfern'].forEach(n=>{const it=R&&R.items[n];if(!it)return;const A=it.m.a;for(let j=0;j<it.count;j++){const i=j*16,x=A[i+12],y=A[i+13],z=A[i+14];   /* the item's store: a growing Float32 buffer (.a), 16 a matrix */
   let best=null;for(const B of BS){if(Math.hypot(x-B.x,z-B.z)>B.R*1.3+40)continue;for(let k=0;k<B.beds.length;k++){const q=B.beds[k];if(!q.ch)continue;const a=Math.atan2(z-q.cz,x-q.cx),fr=K.footR(q,a),r=Math.hypot(x-q.cx,z-q.cz);
    const ty=K.topH(q,q.cx+Math.cos(a)*fr*(1-q.ch)*.99,q.cz+Math.sin(a)*fr*(1-q.ch)*.99),d=Math.abs(r-fr-.35)+Math.abs(y-ty)*.5;if(d<3&&(!best||d<best.d))best={d,a,s:fr*q.ch,q};}}
   if(!best)continue;A[i+12]-=Math.cos(best.a)*best.s;A[i+14]-=Math.sin(best.a)*best.s;if(!it.o[j])it.k[j]=BIO._lodKey(A[i+12],A[i+14]);moved++;}});
  window._seat={moved};}
 (NECANYONS.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));
 if(typeof KORONA!=='undefined'&&KORONA.build){try{window._korona=KORONA.build({R:STAGE.R-60,quality:q});}catch(e){reportErr('korona: '+e.stack);}
  (KORONA.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));}
 _mark('korona');
 // THE ECOTONES (NOTES.md, "The life"; KNOWN_ISSUES, closed 2026-10-19): the north-western lowlands' kit on the lake shore
 // (station 3, the fertile basin: bamboo, ferns, glow-willows on the band the station gives it) and the northern highlands'
 // kit on the dry crest (station 4, the trenches: crag pines and their beard lichen); each under its own mask, its trees
 // obstacles to the kits that follow
 if(STAGE.shore&&typeof NWLOW!=='undefined'){try{MASK=shoreMask;window._shore=NWLOW.build({R:STAGE.R-60,quality:q*(STAGE.shoreQ==null?.5:STAGE.shoreQ),avenues:STAGE.shoreRows||[]});}catch(e){reportErr('nwlowlands: '+e.stack);}finally{MASK=waterMask;}
  (NWLOW.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));}
 if(STAGE.crest&&typeof NHL!=='undefined'){try{MASK=crestMask;window._crest=NHL.build({R:STAGE.R-60,quality:q*(STAGE.crestQ==null?.6:STAGE.crestQ),flora:false});}catch(e){reportErr('nhighlands: '+e.stack);}finally{MASK=waterMask;}
  (NHL.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));}
 _mark('ecotone');
 // THE DESERT (station 5, the lee gorge): the eastern desert's kit read in place, on the floor the station gives it
 if(STAGE.desert&&typeof SEDESERT!=='undefined'){try{MASK=desertMask;window._desert=SEDESERT.build({R:STAGE.R-60,quality:q*(STAGE.desertQ==null?.8:STAGE.desertQ),fauna:!Q.has('nofauna')});}catch(e){reportErr('sedesert: '+e.stack);}finally{MASK=waterMask;}}
 // THE HIGH COLD (station 6, the hoar table): the eastern highlands' kit read in place, on the table's top
 if(STAGE.high&&typeof EHIGH!=='undefined'){try{MASK=highMask;window._high=EHIGH.build({R:STAGE.R-60,quality:q*(STAGE.highQ==null?.9:STAGE.highQ),giantAz:66});}catch(e){reportErr('ehighlands: '+e.stack);}finally{MASK=waterMask;}}
 _mark('desert');
 if(!Q.has('nojungle')&&STAGE.jungleQ!==0){try{MASK=jungleMask;window._jungle=HYPERJUNGLE.build({R:STAGE.R-60,quality:q*(STAGE.jungleQ==null?.7:STAGE.jungleQ),heroR:STAGE.heroR==null?1200:STAGE.heroR,fauna:!Q.has('nofauna')});}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}}
 _mark('jungle');
 /* THE STAGHORNS ON THE DRAWN WALL (the GPU verify, 2026-11-03: 44 of 123 on the gorge's ring walls floated, up to 20 m off): the kit places each at
    the record's wall (NECANYONS.wall), but KSTACKS draws a wall up to tens of metres inside it on these big bodies. Each is seated on the nearest drawn rock
    of eight level rays from it (28 m at most), .12 m off the face it hits; its turn and size kept, positions only. ?seat=0 leaves them */
 if(Q.get('seat')!=='0'){const R=BIO.kits.korona,it=R&&R.items.staghorn,BS=NECANYONS.bodies(),rock=[];scene.traverse(o=>{if(o.isMesh&&o.userData.rock)rock.push(o);});
  let seated=0;const rc=new THREE.Raycaster(),O=new THREE.Vector3(),D=new THREE.Vector3();
  /* the walls' triangles bucketed on core/space (8 m cells) once, so each plant tests only the faces within 28 m (a level ray per eighth of a turn,
     front faces only); a ray against the whole wall mesh per plant took the hollow past its load timeout */
  const walls=rock.filter(o=>/^Quartzite/.test(o.userData.inspectLabel||''));
  if(it&&it.count&&walls.length){const A=it.m.a,TS=KSPACE.create({cell:8}),va=new THREE.Vector3(),vb=new THREE.Vector3(),vc=new THREE.Vector3(),hit=new THREE.Vector3(),ray=new THREE.Ray();
   walls.forEach(m=>{const P=m.geometry.attributes.position.array,I=m.geometry.index.array;for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;
    const cx=(P[a]+P[b]+P[c])/3,cz=(P[a+2]+P[b+2]+P[c+2])/3,r=Math.max(Math.hypot(P[a]-cx,P[a+2]-cz),Math.hypot(P[b]-cx,P[b+2]-cz),Math.hypot(P[c]-cx,P[c+2]-cz));TS.insert({P,a,b,c},cx,cz,r);}});
   const DIRS=[0,1,2,3,4,5,6,7].map(k=>new THREE.Vector3(Math.cos(k*Math.PI/4),0,Math.sin(k*Math.PI/4)));
   for(let j=0;j<it.count;j++){const i=j*16;O.set(A[i+12],A[i+13],A[i+14]);let bd=28,bp=null,bdir=null;
    TS.some(O.x,O.z,28,T=>{const P=T.P;if(Math.min(P[T.a+1],P[T.b+1],P[T.c+1])>O.y||Math.max(P[T.a+1],P[T.b+1],P[T.c+1])<O.y)return false;
     va.fromArray(P,T.a);vb.fromArray(P,T.b);vc.fromArray(P,T.c);
     for(const d of DIRS){ray.set(O,d);if(ray.intersectTriangle(va,vb,vc,true,hit)){const q=hit.distanceTo(O);if(q<bd){bd=q;bp=hit.clone();bdir=d;}}}return false;});
    if(!bp||bd<.3)continue;A[i+12]=bp.x-bdir.x*.12;A[i+14]=bp.z-bdir.z*.12;if(!it.o[j])it.k[j]=BIO._lodKey(A[i+12],A[i+14]);seated++;}}
  window._seat=Object.assign(window._seat||{},{staghorn:seated});}
 /* OWED TO THE VENDORS' TURNS (KNOWN_ISSUES.md): two items of kits read in place float on their own pages for the same cause, so this page's attach
    audit leaves them to those turns rather than raise its cap: the eastern highlands' `bloom` (gentians and the cushions' flowers on the poured
    cushions, which the audit sees only as their axes; 81.5% on ehighlands' own page; pair 13) and the eastern desert's `bloom` (sedesert's
    cereus and shrub flowers, d none in reach; 15.4% on its own page; its next turn), and on the trenches' crest the northern highlands' `needle`,
    `beard`, `spray` and `larch` (crowns and beard lichen off their limbs: 274 of 4,351, 162 of 218, 38 of 477, 29 of 317 here; its own page's top items; its pair-7 turn, not merged yet). Marked free here only: drawn as they are. ?owed=0 audits them */
 if(Q.get('owed')!=='0'){window._auditOwed=[];[['ehigh','bloom'],['sedesert','bloom'],['nhighlands','needle'],['nhighlands','beard'],['nhighlands','spray'],['nhighlands','larch']].forEach(([k,n])=>{const R=BIO.kits[k],d=R&&R.defs[n];if(d){d.free=true;window._auditOwed.push(k+'.'+n);}});}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 // the punji pits' three draws in their order (mask, body, membrane: 50-biome-korona-species.js); window._punji('torn'|'whole'|'regrowing'|null) holds every pit in one state for a look
 if(typeof KORONA!=='undefined'&&KORONA.afterBake){KORONA.afterBake(BIO.baked);window._punji=KORONA.pitForce;window._pits=()=>KORONA.PITS.length;}
 BIO.setA2C(renderer);   /* R7: the cut-outs by alpha-to-coverage */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});window._shadow.cast(scene);
  if(typeof FAR!=='undefined'&&FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,r:STAGE.R,h:600});
})();
