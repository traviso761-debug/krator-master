// ================================================================= HOST — build (k-guilin)
// One kit on the page (with nwbay's species it places: 55): its trees, the cliffs' dressing and the ground plants, then its
// trees become obstacles, then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 /* THE FAR BAND'S DIET (the final rebuild, pair 13, 2026-11-09; ?diet=0 for the old page): the far trees, this kit's tall species (55) and nwbay's
    borrowed ones (biomes/nwbay/src/56: NWBAY.IMPOSTORS, asked for by the host), octahedral impostors of their species instead of blobs */
 if(Q.get('diet')==='0')KGUILIN.IMPOSTORS=false;else if(typeof NWBAY!=='undefined')NWBAY.IMPOSTORS=true;
 if(Q.get('hold')==='0')KGUILIN.HOLD=false;   /* ?hold=0: the crowns where crown() puts them, not held to their limbs (55: KGUILIN.held) */
 try{window._biome=KGUILIN.build({R:TERR.R-60,quality:q,pond:{level:POND.level,at:pondE},lake:{level:LAKE.level}});}catch(e){reportErr('kguilin: '+e.stack);}
 _mark('kguilin');
 (KGUILIN.TREES||[]).concat(KGUILIN.BTREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.5+1,y0:T.y0-3,y1:T.y0+T.H}));
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 BIO.setA2C(renderer);   /* R7: the cut-outs by alpha-to-coverage (the alpha test stays without MSAA) */
 /* the impostors' light matched to the near crowns (the bake comes out ~4x dark: nwbay's 2.2, korona's 2.6); ?impgain= ?impwrap= */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||2.2),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 /* THE TERRAIN'S HORIZON (core/terrain KHORIZON; the final rebuild, pair 13; ?horizon=0 off): the horizon in eight directions baked over the map
    (256 texels a side, 12.5 m; terrainH holds the towers' domes), so at a low sun the towers throw their shadows across the plain and the paddies and
    the stone forest's floor sees less sky; on the ground and on every lit material on the land (not the karst beyond: farField) */
 if(typeof KHORIZON!=='undefined'&&Q.get('horizon')!=='0'){try{const t0=performance.now();
  const HZ=KHORIZON.bake({box:[-TERR.R,-TERR.R,TERR.R,TERR.R],n:256,h:terrainH});
  window._horizon={ms:Math.round(performance.now()-t0),n:HZ.n};KHORIZON.shade(MAT_GROUND,HZ);
  window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:o=>!o.userData.farField});}catch(e){reportErr('horizon: '+e.stack);}}
 /* THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03: toggleable and OFF by default; ?shadow=1 attaches it, after every placement,
    so the flora, the towers and the ground cast and receive; the karst beyond, the water and the impostors draw their own light) */
 if(Q.get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&KSHADOW.attach){try{const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});S.cast(scene);
  scene.traverse(o=>{if(o.isMesh&&o.material===MAT_GROUND){o.castShadow=false;o.receiveShadow=true;}if(o.isMesh&&o.userData&&o.userData.farField)o.castShadow=o.receiveShadow=false;});
  window._shadow=S;}catch(e){reportErr('shadow: '+e.stack);}}
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Hykkousoi hinterlands (the lakeshore by Trigon)',x:0,z:0,r:TERR.R,h:200});
})();
