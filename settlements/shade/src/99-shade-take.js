// ================================================================= HOST — the take: Shade on core/host
// The camera, the frame loop, the panel, the inspector, marks, the minimap and window._api are core/host's (core/host/
// README.md; ROADMAP.md section 10, stage 3 step 5). This replaced Shade's own 90-host-camera.js (2026-10-15): its views
// (87), its ground, its overlays as layers, its inspector's words for what no record holds (a place, the switchback, the
// terrain), the hover tip on as before, and Shade's probe fields (91-shade-probe.js) are handed over here. Its polygon
// tool is the host's marks (P).
// ---------------------------------------------------------------- the inspector's words where no record holds the point
function shadePlaceAt(x,z){for(const p of PLACES)if(polyHas(p.poly,x,z))return p;return null;}
function shadeTerrainName(x,z){if(waterH(x,z)>terrainH(x,z))return Math.hypot(x-POOL.x,z-POOL.z)<POOL.r+2?'The plunge pool':x<BASIN.x0?'The upper stream':'The lower stream';
 const d=basinD(x,z),W=wallW(x,z);if(d<=0)return x>119?'The canyon floor':'The basin floor';if(d<W)return kSwitch(x,z)>.5?'The north slope':kSouth(x,z)>.5?'The carved face (sheer)':kLip(x,z)>.5?'The lip (sheer)':x>119?'The canyon wall':'The basin wall';
 return mesaH(x,z)>10?'A mesa':'The plateau';}
function shadeWords(hit){const p=hit.point,o=hit.object,at='\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';
 const lab=o&&o.userData&&(o.userData.inspectLabel||(o.userData.biome&&o.name))||null;
 const pl=shadePlaceAt(p.x,p.z);
 if(pl)return pl.name+'\n[place · '+pl.kind+']'+(lab?'  ·  '+lab:'')+'\n'+pl.activities.join(', ').toLowerCase()+' · up to '+pl.capacity+' people'+at;
 const n=swNear(p.x,p.z);
 if(n&&n.d<SWB.bank)return 'The switchback\n[path]  grade '+SWB.grade.toFixed(3)+' · '+Math.round(SWB.len)+' m'+at;
 return shadeTerrainName(p.x,p.z)+'\n[terrain]'+(lab?'  ·  '+lab:'')+at;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:'shade',title:"Shade — the eastern nomads' basin",
 hint:"A sunken basin of the Eastern Nomads in the eastern high desert: the falls, the pool, the carved face, the switchback, the slot canyon, the Khan, the pueblos, the tents and the cliff dwellings round the rim (64 buildings, three alcoves; the life layer is data)",
 scene,camera,renderer,ground:terrainH,minR:2,maxR:6000,registry:REG,views:VIEWS,start:'The market and the Khan',ticks:TICKS,
 // the eye 1.7 m over the ground, and out of a carve patch's rock (on top of it), as 90-host-camera.js kept it
 clampCam(cp){const g=terrainH(cp.x,cp.z)+1.7;if(cp.y<g)cp.y=g;
  if(BIO.carve.rockAt(cp.x,cp.y,cp.z))cp.y=(BIO.carve.topAt(cp.x,cp.z)??cp.y)+1.7;},
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},
  objects:()=>[sky,giant,giantRing]},
 // what the inspector and the minimap read: every record but the places (a place's box would hold the Khan's own building,
 // and the smallest record wins); a point no record holds is worded here: its place, the switchback or the terrain
 records:()=>KTAGS.page.records.filter(r=>r.kind!=='place'),
 inspect:(hit,hits,rec)=>rec?null:shadeWords(hit),
 stats:()=>'inst '+window._instances,
 layers:{'places':{on:false,set:v=>{OVERLAY.places.visible=v;}},'routes (life layer)':{on:false,set:v=>{OVERLAY.routes.visible=v;}},
  'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'buildings':{match:o=>/^buildings:/.test(o.name||'')}},
 exporters:{tags:()=>KTAGS.page.export()},
 minimap:{title:'Shade'},
 // the marks (94): <build>/marks.json, where tools/edits/serve.py's save writes them; this page is in dist/, so '../' (the
 // host's default, 'marks.json', is dist/marks.json). Served from elsewhere (verify.py serves dist/ alone) there is no such
 // file: an empty data URL, so the page reads this browser's draft without a 404 in the console
 marksUrl:/\/settlements\/shade\/dist\/[^/]*$/.test(location.pathname)?'../marks.json':'data:application/json,',
 budget:BUDGET,types:()=>BIO.stats,api:window._api});
KHOST.hover(true);   // the inspector's hover tip on, as Shade's 'Inspector (hover)' box was
