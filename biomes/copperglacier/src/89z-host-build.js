// ================================================================= HOST — build (every station)
// The order a world follows: its own structures first (they fill OBSTACLES: 86), the water (89w), then the kit, then one bake. THE WATER AS FIELDS
// (core/water ext/60; core/biome 41; the review's third line): one shore for the flora, the ground's wet band and the audit; FIELD.shore and FIELD.wet
// take the distance to the water the eye sees (WATER.fieldAt), not the stage's lines. ?fields=0 for the stage's own
const WATER_F=WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall')});
const WATER_FN=WATER.fieldFns(WATER_F);window._waterShore=WATER_FN.shore;   /* the root mask reads it (45) */
/* the wet band's share of the water: 1 at the edge, gone by 24 m */
const WET_SHORE=(x,z)=>{const s=WATER_FN.shore(x,z);return s!==s?0:smooth(24,1,s);};
/* the field contract (core/biome/README.md, "The environmental fields"): the kit's own fields mapped to BIO.ENV's names and units */
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),bands:{upland:[PROF(GS.snout),PROF(GS.snout)+900],flow:40}});
if(new URLSearchParams(location.search).get('fields')!=='0'){const S0=FIELD.shore,W0=FIELD.wet;
 FIELD.shore=(x,z)=>{const s=WATER_FN.shore(x,z);return s!==s?S0(x,z):Math.max(S0(x,z)*smooth(-1,3,s),smooth(30,1,s)*smooth(-1,1,s));};
 FIELD.wet=(x,z)=>clamp(Math.max(W0(x,z),.9*FIELD.shore(x,z)),0,1);}
{const a=GROUND.geometry.attributes.aWet,p=GROUND.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);a.setX(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.5,.2,p.getY(i)-w):1)*(1-FC.at(FC.a.ice,x,z)));}a.needsUpdate=true;}
window._biome=null;
/* KSHADOW measured 2026-11-03 on the Arc 140T (D3D11; station 1, synced render + readPixels, the pane hidden): +23 to +56 ms a frame (100-117 ms off, 140-156 on,\n   +20-56%): not affordable, so OFF at page load and ?shadow=1 turns it on (KNOWN_ISSUES.md; the owner's call, as on the Throne's station 1) */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')!=='0'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;   /* attached always, off at load: core/shadow's switch (its button, ?shadow=1) turns it on; ?shadow=0 none of it (the owner, 2026-11-08) */
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 COPPERG.SITE=SITE;
 try{BIO.cur='copperglacier/'+SITE.key;window._biome=COPPERG.build(TERR.R-150,q);BIO.cur=null;}catch(e){reportErr('biome: '+e.stack);}
 window._biome=Object.assign(window._biome||{},{glacier:GLACIER});
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 BIO.setA2C(renderer);{const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}   /* the floor's cover takes the ground's colour at its root */
 /* no impostors: no tree passes 7 m (34-core-impostor.js: a tree under 7 m has no stand-in; PLAN.md section 3) */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 if(AIR.snow&&ATMOS.snowOnScene){scene.traverse(o=>{const m=o.material;if(!o.isMesh||!m||m.userData.noSnow||!o.geometry.attributes.aN||!m.userData.bio||m.userData.bio.kind!=='leaf'||(m.userData.bio.opts||{}).aN)return;
  ATMOS.snowOn(m,{twoSided:m.side===THREE.DoubleSide,aN:false});m.userData.noSnow=true;});ATMOS.snowOnScene(scene);}   /* the lying snow on every lit material (89a) */
 /* THE SUN'S SHADOWS (core/shadow, KSHADOW): one 4096 box following the view, 90-600 m by the eye's height; the flora, the seracs, the caves and the ground
    receive, the far field and the water draw their own light. off at load, core's button or ?shadow=1 on (its cost: KNOWN_ISSUES.md). ONLY THE FROST CORALS CAST (the owner, 2026-11-08:
    the whole scene casting cost +20-56% a frame): their limbs ('biome:coral') and tips ('biome:coraltip'); everything else only receives */
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene,{cast:false});let nc=0;scene.traverse(o=>{if(o.isMesh&&/^biome:coral(tip)?$/.test(o.name)&&o.receiveShadow){o.castShadow=true;nc++;}});
  window._shadow.state.casters=nc;if(FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 /* the land's whole volume from its own ground: its lowest point to its highest, on a 100 m lattice */
 {let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}
  REGISTER({name:SITE.region,x:0,z:0,y:Math.floor(lo-10),r:TERR.R,h:Math.ceil(hi-lo+60)});}
})();
