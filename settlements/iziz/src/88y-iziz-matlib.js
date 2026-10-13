// ================================================================= 88y. THE MATERIAL LIBRARY ON IZIZ'S MATERIALS (the second pilot)
// materials.json names, per MAT key, the library set; tools/textures/pack.py packs them into tex/ and build.py inlines
// them (69d-matlib-pack.js). KMAT.bindMat (core/materials/record/26-matlib-bind.js) swaps the maps in place, so one tile
// of each procedural map (its world-UV K, or KMAT.ANCIENT_TILES) becomes one tile of the set. ?mat=proc binds nothing:
// the look before the library.
//   The vernacular (69b-vern-mat.js: wood, woodV, stone, plaster, thatch, shingle, cloth), the Ancients MAT (white,
//   verdigris, concrete, paving, brick, corrugate, timber, tarp, whiteWorn, rubbleK), the Voth embassy (vpTile, vpBanco,
//   vpMosaic) bind by their own names. The city's own materials (2026-10-13, ROADMAP.md stage 2e) bind through
//   IZIZ_MATALIAS onto families whose names start with 'city' (Verge, which packs Iziz's families for its vernacular,
//   leaves those out): the painting's walls, towers, gates and palace (79-iziz-original.js izWall, izWallDark, izCap,
//   izSand: weathered ashlar), its rock (izRock), the hills' escarpments (90a's izEsc: layered sandstone), the rust of
//   every ruin (MAT.rust, 77z's scrap and the rustified panels: a fine isotropic rust, which does not smear on the
//   stretched UVs the plate rusts did), the Ancient Iziz style's planks (plank: the vernacular wood, its own map's copy)
//   and its sand-panel and concrete skins (77z's tsand cache: the Ancients white and concrete), and 79's izConcOrange (concrete,
//   recoloured). The tsand and rustify caches and 90a's izEsc exist only once the city is built, so 90b calls
//   izizMatlibLate() before kbake (which clones each kit material).
// Every bound or procedural MeshStandardMaterial is a KMAT record (window._materials) naming its shader-library hook
// (godot/krator/khooks.gd): 'world-uv' where vWorldUV tiles it in metres, 'breakup' where the library's tiling break-up
// runs, 'glass' for the glass Fresnel. [G data] in what it decides; the bind itself is core/materials/record's [web].
const IZIZ_MATALIAS={izWall:'cityWall',izWallDark:'cityWall',izCap:'cityWall',izSand:'cityWall',izRock:'cityRock',izEsc:'cityStrata',
 plank:'wood',rust:'cityRust',scrap:'cityRust',izConcOrange:'concrete'};
const IZIZ_MATTILE=Object.assign({},KMAT.ANCIENT_TILES,{scrap:8,izEsc:6.3,izConcOrange:KMAT.ANCIENT_TILES.concrete});   // metres per UV unit where no world-UV K says it
const IZIZ_MATLIB=KMAT.bindMat('iziz',MAT,{tile:IZIZ_MATTILE,alias:IZIZ_MATALIAS});
const IZIZ_MATX={};   // the late tables by record name (izizMatlibLate): 'tsand.<hex>_<c|p>', 'rustify.<n>'
function izizMatHook(m,L){const h=[];if(m.userData.uvK)h.push('world-uv');if(m.userData.lib&&L&&L.breakup)h.push('breakup');
 if(MAT.glass&&(m===MAT.glass||m.onBeforeCompile===MAT.glass.onBeforeCompile))h.push('glass');return h.length?h.join('+'):null;}
function izizMatRecords(){const recs={};
 const add=(k,m,fam)=>{if(!m||!m.isMeshStandardMaterial)return;const L=m.userData.lib?KMAT.packed('iziz',fam):null,K=m.userData.uvK||0;
  recs[k]={id:'iziz.'+k,family:L?fam:k,colour:'#'+m.color.getHexString(),scale:L?L.scale.slice():(K?[1/K,1/K]:[1,1]),tint:true,
   roughness:Math.min(1,m.roughness),metal:Math.min(1,m.metalness),specular:L&&L.specular!=null?L.specular:.5,
   emissive:m.emissive&&m.emissiveIntensity>0&&m.emissive.getHex()?'#'+m.emissive.getHexString():null,doubleSided:m.side===THREE.DoubleSide,
   breakup:L&&L.breakup?L.breakup:null,lib:L?L.lib:null,bake:!L&&!!m.map,hook:izizMatHook(m,L),
   note:L?'library set '+L.lib+(fam!==k?' (family '+fam+')':'')+', tint keep '+(L.tint&&L.tint.keep):(m.map?'procedural map':'untextured')};};
 for(const k in MAT)add(k,MAT[k],IZIZ_MATALIAS[k]||k);
 for(const k in IZIZ_MATX)add(k,IZIZ_MATX[k].m,IZIZ_MATX[k].fam);
 KMAT.adapter('iziz',recs);window._materials=KMAT.table('iziz');}
izizMatRecords();
// the city's late tables: the Ancient Iziz style's tsand skins (concrete 'c' or panel 'p': the Ancients' own maps, so their
// families) and the rustified panels; MAT keys added since (90a's izEsc). Bound in place before kbake clones them.
function izizMatlibLate(){
 Object.assign(IZIZ_MATLIB,KMAT.bindMat('iziz',MAT,{tile:IZIZ_MATTILE,alias:IZIZ_MATALIAS}));
 const T={},tile={},alias={};
 if(typeof _tmc!=='undefined')for(const k in _tmc){const n='tsand.'+k,c=/_c$/.test(k);T[n]=_tmc[k];alias[n]=c?'concrete':'white';tile[n]=c?KMAT.ANCIENT_TILES.concrete:KMAT.ANCIENT_TILES.white;}
 if(typeof _trm!=='undefined'){let i=0;for(const k in _trm){const n='rustify.'+(i++);T[n]=_trm[k];alias[n]='cityRust';tile[n]=KMAT.ANCIENT_TILES.rust;}}
 const got=KMAT.bindMat('iziz',T,{tile,alias});Object.assign(IZIZ_MATLIB,got);
 for(const n in T)IZIZ_MATX[n]={m:T[n],fam:alias[n]};
 izizMatRecords();return got;}
