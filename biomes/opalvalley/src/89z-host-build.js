// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES), then the kit, then one bake. 89z, after the water (it was 88; the final
// rebuild, 2026-11-03): the flora reads the water's own numbers, so the surfaces must exist before the first plant.
// Opal Valley's (2026-11-11) is the High Rift's, its passes in 88-host-flora.js.
// THE WATER AS FIELDS (core/water ext/60; core/biome 41; the review's third line): one shore for the flora, the ground's wet band and the audit. FIELD.wet
// and FIELD.flow keep their kit's meaning, but their water term is the distance to the water the eye sees (WATER.fieldAt), not to a pool's radius or the
// stream's line; the wet band on the ground (aWet) reads the same shore. ?fields=0 for the old lines
const WATER_F=WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall')});
const WATER_FN=WATER.fieldFns(WATER_F);
/* the wet band's share of the water: 1 at the edge, gone by 24 m */
const WET_SHORE=(x,z)=>smooth(24,1,WATER_FN.shore(x,z));
/* the field contract (core/biome/README.md, "The environmental fields"): the kit's own fields mapped to BIO.ENV's names and units */
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),bands:{upland:[SITE.base-400,SITE.base+700],flow:40}});
if(new URLSearchParams(location.search).get('fields')!=='0'){const W0=FIELD.wet,F0=FIELD.flow;
 FIELD.wet=(x,z)=>{const s=WATER_FN.shore(x,z);if(s!==s)return W0(x,z);return clamp(Math.max(W0(x,z)*smooth(-1,3,s)+(1-smooth(-1,3,s)),.95*smooth(50,5,s)),0,1);};
 FIELD.flow=(x,z)=>{const d=WATER_FN.flow(x,z);return d==null||d!==d?F0(x,z):clamp(Math.max(F0(x,z)*smooth(-1,3,WATER_FN.shore(x,z)),smooth(26,4,d)),0,1);};}
{const a=GROUND.geometry.attributes.aWet,p=GROUND.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);a.setX(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.5,.2,p.getY(i)-w):1));}a.needsUpdate=true;}
window._biome=null;
const IMP_GAIN=2.6;   /* the impostors' gain (eastabyss 3.6, nwlowlands 3.6, swlowlands 2.4, ebadlands 2.4): the bake is ~4x dark; set against the near crowns on 'From afar' */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;   /* attached but OFF at load (the owner, 2026-11-03): ?shadow=1 */
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting); ?diet=0 keeps the kit's own far blobs
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(typeof STATION_BUILD==='function'){try{window._station=STATION_BUILD(q);window._biome=window._station;}catch(e){reportErr('station: '+e.stack);}}   /* the station's passes (88-host-flora.js) */
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 BIO.setA2C(renderer);{const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}   /* R7; R5: the floor's cover takes the ground's colour at its root; the paint's v runs z1..z0 */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 if(AIR.snow&&ATMOS.snowOnScene){scene.traverse(o=>{const m=o.material;if(!o.isMesh||!m||m.userData.noSnow||!o.geometry.attributes.aN||!m.userData.bio||m.userData.bio.kind!=='leaf'||(m.userData.bio.opts||{}).aN)return;
  ATMOS.snowOn(m,{twoSided:m.side===THREE.DoubleSide,aN:false});m.userData.noSnow=true;});ATMOS.snowOnScene(scene);}   /* the lying snow on every lit material (89a) */
 /* THE SUN'S SHADOWS (core/shadow, KSHADOW): one 4096 box following the view; the flora and the ground cast and receive. Off at load (the owner,
    2026-11-03: toggleable, off by default); ?shadow=1 on */
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);window._shadow.cast(GROUND,{cast:false});if(FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 if(typeof samplersOf==='function')window._units.final=samplersOf(MAT_GROUND);   /* the ground's texture units once every hook is on (85) */
 /* the land's whole volume from its own ground: its lowest point to its highest, on a 100 m lattice */
 {let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){if(Math.hypot(x,z)>TERR.R)continue;const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}
  REGISTER({name:(typeof STATION_REGION!=='undefined'&&STATION_REGION)||'Opal Valley (ideal type)',x:0,z:0,y:Math.floor(lo-10),r:TERR.R,h:Math.ceil(hi-lo+60)});}
})();
