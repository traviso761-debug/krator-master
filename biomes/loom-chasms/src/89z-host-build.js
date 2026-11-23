// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and hand their shells to dress()), then
// the kit, then the dressing on the structures, then one bake. riftrim's (2026-11-03), less its variants: the chasm has no trees of its own
// (PLAN.md section 4), so its ground cover is baked and the neighbours' trees (87, the kin) are grown unique within the hero range.
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
const IMP_GAIN=2.4;   /* the impostors' gain (riftrim's): the kin grow no far level here, so it only sets the core's look */
const SHADOW_Q=new URLSearchParams(location.search).get('shadow');
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting)
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 window._variants=false;
 if(LAND.prebuild){try{window._prebuild=LAND.prebuild();}catch(e){reportErr('station (before the kit): '+e.stack);}}   /* a station's structures first (the post: its records and volumes) */
 try{window._biome=GCH.build({R:TERR.R-150,quality:q});}catch(e){reportErr('biome: '+e.stack);}
 if(typeof growKin==='function'){try{window._kin=growKin();}catch(e){reportErr('kin: '+e.stack);}}   /* the neighbours' species (87-host-kin.js, EXCHANGES.md) */
 /* THE EXPORT BOX AND PROFILE (verify.py --assert, core/export "Profiles"): the 300 m cell round the hazard nearest the station's centre (its
    ground cover, its rock, the danger) unless the station names its own; the chasm's profile has no buckets (no trees of its own: the kin's bark is in their vendors'
    registries) and takes the hazards section (the dangers are the chasm's point: PLAN.md section 6); water only where the page has some */
 if(!LAND.exportBox){let c=[0,0],bd=1e9;for(const H of (HAZ&&HAZ.list)||[]){const d=Math.hypot(H.x,H.z);if(d<bd&&Math.abs(H.x)<2300&&Math.abs(H.z)<2300){bd=d;c=[H.x,H.z];}}   /* the hazard nearest the centre: the box shows it */
  LAND.exportBox=[Math.round(c[0]-150),Math.round(c[1]-150),Math.round(c[0]+150),Math.round(c[1]+150)];}
 if(!LAND.exportProfile)LAND.exportProfile=['registry','items','materials','textures','terrain','stage','atmos','hazards'].concat(LAKES.length?['water']:[]);
 if(LAND.build){try{window._station=LAND.build();}catch(e){reportErr('station: '+e.stack);}}   /* a station's own placement (its talus, its bars, its ice) */
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 BIO.setA2C(renderer);{const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}   /* R7; R5: the floor's cover takes the ground's colour at its root; the paint's v runs z1..z0 */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 /* no lying snow (fx/snowcover is not on these pages: the chasm gets 0-78 mm a year, PLAN.md section 3; the east rim's frost is the ground's snow field) */
 /* THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03: every turn takes it, TOGGLEABLE AND OFF BY DEFAULT): one view-following box,
    attached here, off at load, on core/shadow's own switch since 2026-11-08 (the Throne's way): core's panel button or ?shadow=1 turns it on, ?shadow=0 none of it */
 if(typeof KSHADOW!=='undefined'&&KSHADOW.attach&&SHADOW_Q!=='0'){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);window._shadow.cast(GROUND,{cast:false});if(typeof FAR!=='undefined'&&FAR&&FAR.mesh)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;
  }catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 /* the land's whole volume from its own ground (a station's stands 1-2 km up): its lowest point to its highest, on a 100 m lattice */
 {const R=LAND.region;if(R.y==null){let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}R.y=Math.floor(lo-10);R.h=Math.ceil(hi-lo+60);}REGISTER(R);}
})();
