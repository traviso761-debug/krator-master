// ================================================================= HOST — build (replaces the kit's 88-host-build.js)
// The kit's page's order: the obstacles first (the stage's wreckage, 45-host-stage.js), then the kit (its passes read this stage's fields: its zone on the
// rock and its young forest on the silt, src/57-biome-nwlowlands-overlay.js), then one bake, the impostors, the horizon, the sun's shadows (off at load).
window._biome=null;
// ?q=0.5 (or window.KRATOR_Q) scales every count in the kit: the knob for a weaker machine
const BIOME_Q=(()=>{let q=+(window.KRATOR_Q||0);try{q=q||+(new URLSearchParams(location.search).get('q'));}catch(e){}return q>0?Math.min(q,1.5):1;})();
/* THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03: off by default in every build): attached always and off at load; the panel's
   'shadows' button or ?shadow=1 turns them on, ?shadow=0 none of it */
const SHADOW_ON=NWQ.get('shadow')!=='0'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
(function(){
 const t0=performance.now();
 /* THE FAR BAND'S DIET (the kit's page's; ?diet=0 the kit's own ranges): heroes in full to 900 m, octahedral impostors past them */
 if(NWQ_ON('diet'))Object.assign(NWLOW.LOD,{tree:900,grove:900,floorMid:1000,farFloor:900});else NWLOW.IMPOSTORS=false;
 try{window._biome=NWLOW.build({R:TERR.R-150,quality:BIOME_Q,avenues:[]});}catch(e){reportErr('biome: '+e.stack);}
 const b=BIO.bake();
 /* the impostors' light matched to the near crowns (the kit's gain, 3.6); ?impgain= ?impwrap= */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(NWQ.get('impgain')||3.6),wrap:+(NWQ.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 /* THE TERRAIN'S HORIZON (core/terrain KHORIZON; ?horizon=0 off): baked over the map and the far field past it; the ground and every lit material on the land */
 if(typeof KHORIZON!=='undefined'&&NWQ_ON('horizon')){try{const t1=performance.now(),S=TERR.R*1.1,HZ=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,far:NWLOW.farH?{h:NWLOW.farH,box:[-14000,-14000,14000,14000],n:200}:undefined});
  window._horizon={ms:Math.round(performance.now()-t1),n:HZ.n};KHORIZON.shade(MAT_GROUND,HZ);window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:m=>!(m.userData&&m.userData.farField)});}catch(e){reportErr('horizon: '+e.stack);}}
 /* R5: the floor cover's root colour from the ground's paint */
 if(NWLOW_LOOK.rootcol){const S=TERR.R*1.1;BIO.setGround(MAT_GROUND.map,[-S,S,S,-S]);}
 /* the flora, the wreckage and the ground cast and receive; the far field, the water and the impostors draw their own light. Off at load (above) */
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);window._shadow.cast(GROUND,{cast:false});if(FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 /* the land's whole volume from its own ground: its lowest point to its highest, on a 100 m lattice */
 {let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){if(Math.hypot(x,z)>TERR.R)continue;const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}
  REGISTER({name:'The scablands: the flood lake\'s high line over NW lowlands (station 2, the lowlands\' half, in small)',x:0,z:0,y:Math.floor(lo-10),r:TERR.R,h:Math.ceil(hi-lo+60)});}
})();
