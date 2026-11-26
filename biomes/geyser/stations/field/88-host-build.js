// ================================================================= HOST — build (stations 2-5): the kit on the field, the cold grounds' flora, the station's own, one bake
// The kit draws the field as on the showcase (its sinter, its trees and floor where the site keeps them, its show), dressed for this ground by the site:
//   passes [species keys]  which of the kit's tree passes run (none: no trees; basin: the snags, whitened lodgepoles the run-off killed)
//   species(SP)            the kit's species' sizes for this ground (the snag a lodgepole's, not a hypertree's): the page's own copy of the records
//   floor false            the kit's floor (the hot country's panic grass, ferns, clubmoss, streamers, lilies) left out
//   flora(o)               FIELDFLORA.place's options (75: the lodgepoles, ichu, yareta)
// then STATION_BUILD (the station's own: ice towers, caves, frost), the bake, the horizon on what stands and the sun's shadows.
window._biome=null;window._jungle=null;
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')!=='0'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
(function(){
 const t0=performance.now(),Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(SITE.passes)GEYSER.PASSES=GEYSER.PASSES.filter(P=>SITE.passes.indexOf(GEYSER.SPECIES[P.sp].key)>=0);
 if(SITE.species)SITE.species(GEYSER.SPECIES);
 if(SITE.floor===false)GEYSER.buildFloor=null;
 try{window._biome=GEYSER.build({R:TERR.R-100,quality:q,center:[BASIN.x,BASIN.z]});}catch(e){reportErr('geyser: '+e.stack);}
 _mark('geyser');
 if(GEYSER.SHOW){GEYSER.SHOW.U.uSun.value.set(...SUN_POS).normalize();_onLight.push(m=>GEYSER.SHOW.setLight(m==='night'?.25:1));}
 (GEYSER.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.rb*2+1.5,y0:T.y0-3,y1:T.y0+T.H}));
 if(SITE.jungle&&typeof HYPERJUNGLE!=='undefined'&&!Q.has('nojungle')){if(Q.get('diet')==='0')HYPERJUNGLE.IMPOSTORS=false;
  try{MASK=jungleMask;window._jungle=HYPERJUNGLE.build({R:TERR.R-60,quality:q,heroR:900,fauna:!Q.has('nofauna')});}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}}
 _mark('jungle');
 if(SITE.flora){BIO.cur='field/flora';try{window._flora=FIELDFLORA.place(Object.assign({q,at:[BASIN.x,BASIN.z],R:TERR.R-100,
  blocked:(x,z)=>OBSTACLES.some(b=>Math.hypot(b.x-x,b.z-z)<b.r)},SITE.flora));}catch(e){reportErr('flora: '+e.stack);}BIO.cur=null;}
 if(typeof STATION_BUILD==='function'){try{window._station=STATION_BUILD();}catch(e){reportErr('station: '+e.stack);}}
 _mark('flora');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;
 if(SITE.jungle){if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||1.6),wrap:+(Q.get('impwrap')||1)});
  if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}}
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});window._shadow.cast(scene);
  GROUND.forEach(m=>window._shadow.cast(m,{cast:false}));if(typeof FAR!=='undefined'&&FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 /* the land's whole volume, from its own ground (the ice station stands 7 km up) */
 {let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){if(Math.hypot(x,z)>TERR.R)continue;const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}
  REGISTER({name:SITE.region||'A geyser field (ideal type)',x:0,z:0,y:Math.floor(lo-10),r:TERR.R,h:Math.ceil(hi-lo+60)});}
})();
