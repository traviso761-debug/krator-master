// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host (riftrim's 99, 2026-11-09)
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what this page has.
// The presets are FOUND on the map rather than typed: one sweep scores each by the kit's zones, nearer the LOD spine preferred; a tree preset
// frames the nearest hero of its kin row
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const SCORES={
 lower:(Z,x,z,ld)=>Z.lower*Z.gentle*Z.tree-ld/4000,
 spiral:(Z,x,z,ld)=>Z.spiral*Z.gentle*Z.tree-ld/4000,
 cloud:(Z,x,z,ld)=>Z.cloud*Z.fog*Z.gentle-ld/4000,
 bank:(Z,x,z,ld)=>Z.bank*Z.gentle-ld/3000,
 farm:(Z,x,z,ld)=>Z.farm-ld/4000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 const RR=TERR.R-400;for(let z=-RR;z<=RR;z+=50)for(let x=-RR;x<=RR;x+=50){const Z=GSTEP.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,x,z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
function nearTree(key,x,z,minH){return GSTEP.nearestTree(key,x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.6,T.z];}
const VIEWS=LAND.views({P,look,atTree,nearTree,gh});
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&GSTEP.plantOfItem(item),tg=PLT?PLT.tags:null;
 if(PLT)name=PLT.name+'  ·  '+lab;
 const cls=isItem?'flora · Greenstep'+(best&&best.label&&best.label.indexOf('read in place')>=0?' · '+best.label:''):'terrain / water';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:24000000,calls:900},   // scene triangles DRAWN at the camera (the kin's hero forms near, their far forms past LAND.kinLT); calls: not a target (KNOWN_ISSUES)
 cls:{pass:20000000,host:1200000},
 type:{'greenstep/floor':'pass','greenstep/kin':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // every kin row the land names grows somewhere, and none is missing its kit (an asset never placed is invisible: SKILL.md 1b)
 kin(K){if(!LAND.kin||!LAND.kin.length)return{ok:true,detail:'no kin on this page'};if(!K)return{ok:false,detail:'no kin grown (?kin=0, or growKin threw)'};
  const zero=LAND.kin.filter(r=>!(K[r.key]>0)).map(r=>r.key);
  return{ok:!zero.length&&!K.missing,detail:(K.missing?'kit not on the page: '+K.missing.join(', ')+'; ':'')+(zero.length?'never grown: '+zero.join(', '):LAND.kin.length+' rows, '+GSTEP.TREES.length+' trees ('+K.heroes+' hero, '+K.fars+' far only)')};},
 // every plant of the kit's floor is placed somewhere on the page (LAND.plants: the station's own list)
 placed(C,keys){const zero=keys.filter(k=>!(C[k]>0));return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):keys.map(k=>k+' '+C[k]).join(', ')};},
 // every plant carries its tags, the Koppen classes among them, inside the region's classes and outside the barren ones
 tagged(PL){const reg=Object.keys(GSTEP.KOPPEN),bad=[];
  for(const k in PL){const t=PL[k].tags||{},kp=t.koppen||[];if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||!kp.length||kp.some(c=>reg.indexOf(c)<0||GSTEP.BARREN.indexOf(c)>=0))bad.push(k);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):Object.keys(PL).length+' plants tagged (climate, aridity, abyssal, riparian, Koppen)'};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface (sedge stands in 0.35 m)
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // no tree on a riser's colonnade: steep (the host's slope) and bedded rock showing (its strata weight)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.strata(t.x,t.z)>.5);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on cliff faces (first '+(bad[0].key||'?')+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a columnar face'};},
 // Tallwalls' promontory is the settlement build's ground: no plant and no tree roots on it (the site field over .7)
 site(P,T){const bad=P.filter(p=>FIELD.site(p[0],p[2])>.7&&!/^biome:(boulder|column)$/.test(p[3])).concat(T.filter(t=>FIELD.site(t.x,t.z)>.7).map(t=>[t.x,t.y0,t.z,t.key]));
  return{ok:!bad.length,detail:bad.length?bad.length+' on '+(LAND.siteName||'Tallwalls\' site')+' (first '+bad[0][3]+' at '+bad.slice(0,1)[0].slice(0,3).map(v=>v|0)+')':'kept clear ('+P.length+' instances, '+T.length+' trees)'};},
 /* the ground's fragment program within the units the GPUs link (KSHADOW.units: its maps and every sampler its hooks declare; the first GPU verify,
    2026-11-09: 17 did not link on the Arc, 15 is the most ANGLE links there) */
 units(U){if(!U)return{ok:false,detail:'no count (window._groundUnits)'};return{ok:U.n<=GROUND_UNITS_MAX,detail:U.n+' of '+GROUND_UNITS_MAX+' units ('+(U.how?U.how+'; ':'')+U.layers+' library layers with a map'+(U.shared?', '+U.shared+' shared':'')+')'};},
 /* the station's cavern (KCAVERN): its plan built, its chunks meshed, and the ground open over each opening */
 cavern(C){if(!C)return{ok:false,detail:'no cavern drawn (window._cavern)'};const ok=C.tris>0&&C.chunks>0&&(C.openings===0||C.holes>0);
  return{ok,detail:C.tris+' triangles in '+C.chunks+' chunks ('+C.meshes+' meshes), '+C.openings+' openings, '+C.holes+' ground quads left to them, '+C.ms+' ms'};},
 /* a plant rooted in an opening: the floor's items and the trees' trunks (a crown may hang over a skylight); one standing in the water is on the
    stream's bed (a reed under a bridge's mouth), not on the ground the cavern cut */
 holes(P,T){const H=STATION.noRoot?(x,z)=>STATION.noRoot(x,z):(x,z)=>STATION.hole(x,z,0),FL=/^biome:(fern|grass|sedge|mossC|mossH|begonia|rice|boulder|column)$/,bad=P.filter(p=>FL.test(p[3])&&H(p[0],p[2],0)&&!(waterH(p[0],p[2])>p[1]-.5)).concat(T.filter(t=>H(t.x,t.z,0)).map(t=>[t.x,t.y0,t.z,t.key]));
  return{ok:!bad.length,detail:bad.length?bad.length+' in an opening (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':'the openings kept clear ('+P.length+' instances, '+T.length+' trees)'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
// the flora and the ground's wet band read the water's own shore: the env fields in the contract, no tree standing in the water, and the
// wet band wet at the water's edge (WATER.edgeAudit). EDGE_OWED: what this turn leaves (a ratchet)
const EDGE_OWED=LAND.edgeOwed||{plant:0,wet:0};
const GROUND_UNITS_MAX=15;
/* the count: the samplers ACTIVE in the ground's linked program (what the GPU links), read from the GL; before the program exists, the unique names its
   hooks declare (KSHADOW.units counts a sampler two hooks both declare twice: core/atmos's atmRainOcc, 2026-11-09, read 16 on this page that links 15) */
function groundUnits(){const gl=renderer.getContext(),pr=renderer.properties.get(MAT_GROUND),P=pr&&pr.currentProgram;
 const T=[gl.SAMPLER_2D,gl.SAMPLER_CUBE,0x8B5F,0x8DC1,0x8B62,0x8DC4,0x8DC5];
 if(P&&P.program){const n=gl.getProgramParameter(P.program,gl.ACTIVE_UNIFORMS);let k=0;for(let i=0;i<n;i++){const u=gl.getActiveUniform(P.program,i);if(u&&T.indexOf(u.type)>=0)k+=u.size;}return{n:k,how:'active'};}
 try{const L=THREE.ShaderLib[MAT_GROUND.isMeshStandardMaterial?'standard':'lambert'],sh={uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader},N=new Set();MAT_GROUND.onBeforeCompile(sh,renderer);
  sh.fragmentShader.replace(/uniform\s+(?:(?:lowp|mediump|highp)\s+)?[iu]?sampler(?:2D|3D|Cube)\w*\s+([^;]+);/g,(m,b)=>{b.split(',').forEach(q=>N.add(q.trim()));return m;});return{n:N.size+(MAT_GROUND.map?1:0),how:'declared'};}catch(e){return{n:99,how:'failed'};}}
Object.defineProperty(window,'_groundUnits',{configurable:true,enumerable:true,get:()=>Object.assign(groundUnits(),{layers:GL?GL.length:0,shared:GL_SHARED.length})});
function edgeCheck(){const P=[];for(const T of GSTEP.TREES){P.push({x:T.x,z:T.z,r:Math.min(T.rb==null?.4:T.rb,.6),name:T.key});if(P.length>6000)break;}
 const bad=BIO.envCheck(ENV,LAND.envPoints||[[0,0],[-1400,-200],[800,300]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:(x,z)=>WET_SHORE(x,z),band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)+' (owed '+JSON.stringify(EDGE_OWED)+')'};}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every kin row grown (the neighbours\' trees, read in place)',HCHK.kin(window._kin));
 add('every floor plant of this station placed',HCHK.placed(GSTEP.COUNTS||{},LAND.plants||['fern','grass','sedge','moss']));
 add('every plant tagged with its Koppen classes',HCHK.tagged(GSTEP.PLANTS));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a columnar riser face',HCHK.cliffs(GSTEP.TREES));
 if(LAND.site||LAND.sites)add((LAND.siteName||'Tallwalls\' promontory')+' kept clear (the settlement build\'s)',HCHK.site(P,GSTEP.TREES));
 add('the ground within the GPU\'s texture units (at most '+GROUND_UNITS_MAX+': the Arc links 15)',HCHK.units(window._groundUnits));
 if(STATION.CAVERN){add('the cavern built and drawn (KCAVERN: the tube under the roof, its openings in the ground)',HCHK.cavern(window._cavern));
  add('nothing rooted in a cavern\'s opening (a skylight, a portal)',HCHK.holes(P,GSTEP.TREES));}
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 if(LAND.kin&&LAND.kin.length){const K=Object.assign({},window._kin);K[LAND.kin[0].key]=0;add('a kin row never grown',HCHK.kin(K));}
 {const C=Object.assign({},GSTEP.COUNTS||{}),k=(LAND.plants||['fern'])[0];C[k]=0;add('a floor plant never placed',HCHK.placed(C,LAND.plants||['fern']));}
 {const k=Object.keys(GSTEP.PLANTS)[0],PL=Object.assign({},GSTEP.PLANTS);PL[k]=Object.assign({},PL[k],{tags:Object.assign({},PL[k].tags,{koppen:[]})});add('a plant with no Koppen classes',HCHK.tagged(PL));}
 {const PL={x:{tags:Object.assign({},GSTEP.PLANTS.grass.tags,{koppen:['EF']})}};add('a plant tagged with the ice cap',HCHK.tagged(PL));}
 if(LAND.probes.wall){const w=LAND.probes.wall();add('a tree on a riser\'s colonnade',HCHK.cliffs([{x:w[0],z:w[1],key:'test'}]));}
 if(LAND.probes.bed){const b=LAND.probes.bed();add('a plant on the river bed',HCHK.dry([[b[0],b[1],b[2],'test']]));}
 if(LAND.site||LAND.sites){const s=LAND.site||LAND.sites[0];add('a plant on '+(LAND.siteName||'Tallwalls\' site'),HCHK.site([[s.x,terrainH(s.x,s.z),s.z,'biome:fern']],[]));}
 add('a ground reading 17 texture units (the first GPU verify\'s)',HCHK.units({n:17,layers:5}));
 if(STATION.CAVERN){add('a cavern with no mesh',HCHK.cavern(Object.assign({},window._cavern,{tris:0})));
  const o=STATION.NOROOT_PROBE||((STATION.CAVERN_OPENINGS||[])[0]||{}).c;if(o)add('a plant in a cavern\'s opening',HCHK.holes([[o[0],terrainH(o[0],o[1]),o[1],'biome:fern']],[]));}
 {const g=LAND.probes.bed?LAND.probes.bed():[0,terrainH(0,0),0];add('a camera under the ground',HCHK.camerasOut([{view:'under',x:g[0],y:terrainH(g[0],g[2])-5,z:g[2]}]));}
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');   /* the runtime LOD (45: merge, fade, cull) and the kin's ranges */
/* the land in the basin (core/water/ext/58): off at page load, for the tri counts; the panel's button or ?mirror=probe|live turns it on */
const MIRROR=BIG_DRAW&&WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[BIG_DRAW.mesh.material].concat(RIVER_DRAWS.map(d=>d.mesh.material)),
 level:BIG_LAKE.level,center:[BIG_LAKE.cx,BIG_LAKE.cz],radius:Math.max(400,BIG_LAKE.r*1.2),far:3500,hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.on(function shadowTick(){if(window._shadow)window._shadow.update();},'view');
KHOST.take({build:LAND.build_id||'greenstep',title:LAND.title||'Krator biome — Greenstep',
 hint:LAND.hint||'Greenstep',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,   /* the shared sky's pass, then the world (89-host-sky.js) */
 controls:[AIR_CONTROL].filter(Boolean),
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,kin:()=>window._kin,
 /* the settlements' sites this page publishes (a station's LAND.build): the core/tags record carries the class, key, place and radius; the
    footprint and level ride on the host's registry entry, read here as data for the settlement build */
 sites:()=>REG.filter(r=>r.kind==='site').map(r=>Object.assign({key:r.key,name:r.name,x:r.x,z:r.z,r:r.r},r.site||{})),
 // the climate at a point, for the probe and for --eval: the fields and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=GSTEP.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
