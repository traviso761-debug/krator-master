// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and hand their shells to dress()), then
// the kit, then the dressing on the structures, then one bake. The trees are records drawn as VARIANTS (86-host-variants:
// grown once per species and level, instanced, the level by the camera); ?unique=1 builds every tree unique instead.
// 89z, after the water (it was 88; the final rebuild, 2026-11-02): the flora reads the water's own numbers, so the surfaces must exist before the first plant.
// THE WATER AS FIELDS (core/water ext/60; core/biome 41; the review's third line): one shore for the flora, the ground's wet band and the audit. FIELD.wet and
// FIELD.flow keep their kit's meaning, but their water term is the distance to the water the eye sees (WATER.fieldAt), not to the river's line or a pool's
// radius; the wet band on the ground (aGM.z) reads the same shore. ?fields=0 for the old lines
const WATER_F=WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall'&&q.kind!=='ice'&&!q.seasonal)});
const WATER_FN=WATER.fieldFns(WATER_F);
/* the wet band's share of the water: 1 at the edge, gone by 30 m (the acid pools' crust stays dry: the vents' geo) */
const WET_SHORE=(x,z)=>smooth(30,1,WATER_FN.shore(x,z));
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),bands:{upland:[0,6000],flow:60}});
if(new URLSearchParams(location.search).get('fields')!=='0'){const W0=FIELD.wet,F0=FIELD.flow;
 FIELD.wet=(x,z)=>{const s=WATER_FN.shore(x,z);if(s!==s)return W0(x,z);return clamp(Math.max(W0(x,z)*smooth(-1,3,s)+(1-smooth(-1,3,s)),.95*smooth(60,6,s)),0,1);};
 FIELD.flow=(x,z)=>{const d=WATER_FN.flow(x,z);return d==null||d!==d?F0(x,z):clamp(Math.max(F0(x,z)*smooth(-1,3,WATER_FN.shore(x,z)),smooth(48,7,d)),0,1);};}
{const m=GROUND,a=m.geometry.attributes.aGM,p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);a.setZ(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.5,.2,p.getY(i)-w):1));}a.needsUpdate=true;}
window._biome=null;window._dress=null;
const IMP_GAIN=2.4;   /* the impostors' gain (eastabyss 3.6, nwbay and swbay 2.2, sedesert 2.6, swlowlands 2.4, ebadlands 2.4): the bake is ~4x dark; to be set against the near crowns at the GPU look pass */
/* the page's rim and its season (70): the land set the rim (44w: RRIM.biome); ?season=winter closes the bell firs' bells, ?season=autumn turns the lobe larches */
{const s=new URLSearchParams(location.search).get('season');RRIM.WINTER=s==='winter';RRIM.AUTUMN=s==='autumn';if(LAND.rim)RRIM.biome(LAND.rim);if(LAND.wind)RRIM.WIND=LAND.wind;}
const SHADOW_Q=new URLSearchParams(location.search).get('shadow');
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting)
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1,unique=Q.has('unique')||typeof VARIANTS==='undefined';
 window._variants=!unique;
 // THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendations 1 and 2; ?diet=0 for the kit's own far blobs): the variants' far level on octahedral impostors
 if(!unique&&Q.get('diet')!=='0')VARIANTS.IMP=true;
 try{
  if(unique)window._biome=RRIM.build({R:TERR.R-150,quality:q});
  else{const out={R:TERR.R-150,quality:q};BIO.cur='riftrim/trees';Object.assign(out,RRIM.buildTrees(out.R,q,{records:true}));
   BIO.cur='riftrim/floor';Object.assign(out,RRIM.buildFloor(out.R,q));BIO.cur=null;window._biome=out;}}
 catch(e){reportErr('biome: '+e.stack);}
 /* the trees keep off the water by the water's own shore (WATER.fieldAt, the review's third line): a record whose bole would reach past the edge goes
    (the mask keeps roots out of the water by the ground's height under them; a bank's slope can still put a trunk's side in it). ?fields=0 keeps them */
 if(!unique&&Q.get('fields')!=='0'){const n0=RRIM.TREES.length;RRIM.TREES=RRIM.TREES.filter(T=>{const s=WATER_FN.shore(T.x,T.z);return s!==s||s>=Math.min(T.rb==null?.5:T.rb,.6);});window._shoreCut=n0-RRIM.TREES.length;}
 if(typeof growKin==='function'){try{window._kin=growKin();}catch(e){reportErr('kin: '+e.stack);}}   /* the neighbours' species (87-host-kin.js, EXCHANGES.md) */
 /* THE EXPORT BOX (verify.py --assert, core/export "Profiles"): a 300 m cell holding a bucket (a borrowed tree: the kin are the unique trees, in their
    vendors' buckets) and the floor's items, the one nearest the LOD spine; a station with neither names its own (LAND.exportBox, LAND.exportProfile) */
 if(!LAND.exportBox){let best=null,bd=1e9;const wet=(x,z)=>{for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const px=x+i*70,pz=z+j*70;if(waterH(px,pz)>terrainH(px,pz))return true;}return false;};   /* a box with water in it, where the page has water */
  for(const r of REG){if(!r.label||r.label.indexOf('read in place')<0)continue;const d=BIO.lodD(r.x,r.z)+((LAKES.length||RIVER_SPEC)&&!wet(r.x,r.z)?1e5:0);if(d<bd){bd=d;best=r;}}
  if(best)LAND.exportBox=[Math.round(best.x-150),Math.round(best.z-150),Math.round(best.x+150),Math.round(best.z+150)];}
 if(LAND.build){try{window._station=LAND.build();}catch(e){reportErr('station: '+e.stack);}}   /* a station's own placement (its talus, its bars, its ice) */
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 BIO.setA2C(renderer);{const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}   /* R7; R5: the floor's cover takes the ground's colour at its root; the paint's v runs z1..z0 */
 // after the bake (the kit's stores are empty again): grow the variants and draw the records as instances of them
 if(!unique){try{VARIANTS.init();window._instances+=VARIANTS.stats.drawn;}catch(e){reportErr('variants: '+e.stack);}}
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(VARIANTS.IMP&&BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180,onDone:()=>{if(VARIANTS.ready)VARIANTS.update(camera.position,true);}});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 /* a leaf material with no bent normal of its own whose item carries one (the plume) takes the snow by its plain normal: snowOnScene reads the geometry's aN */
 if(AIR.snow&&ATMOS.snowOnScene){scene.traverse(o=>{const m=o.material;if(!o.isMesh||!m||m.userData.noSnow||!o.geometry.attributes.aN||!m.userData.bio||m.userData.bio.kind!=='leaf'||(m.userData.bio.opts||{}).aN)return;
  ATMOS.snowOn(m,{twoSided:m.side===THREE.DoubleSide,aN:false});m.userData.noSnow=true;});ATMOS.snowOnScene(scene);}   /* the lying snow on every lit material, the flora's and the variants' included (89a) */
 /* THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03: every turn takes it, TOGGLEABLE AND OFF BY DEFAULT): one view-following box,
    attached here, off at load, on core/shadow's own switch since 2026-11-08 (the Throne's way): core's panel button or ?shadow=1 turns it on, ?shadow=0 none of it */
 if(typeof KSHADOW!=='undefined'&&KSHADOW.attach&&SHADOW_Q!=='0'){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);window._shadow.cast(GROUND,{cast:false});if(typeof FAR!=='undefined'&&FAR&&FAR.mesh)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;
  }catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 /* the land's whole volume from its own ground (a station's stands 1-2 km up): its lowest point to its highest, on a 100 m lattice */
 {const R=LAND.region;if(R.y==null){let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}R.y=Math.floor(lo-10);R.h=Math.ceil(hi-lo+60);}REGISTER(R);}
})();
