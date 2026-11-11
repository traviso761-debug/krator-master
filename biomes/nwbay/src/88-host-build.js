// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake. The karst
// stacks are structures too: the host hands their faces to the dress pass,
// which is where the curtain figs and the hanging gardens come from.
window._biome=null;
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 let jetty=[];if(typeof buildJetty==='function'){try{jetty=buildJetty()||[];}catch(e){reportErr('jetty: '+e.stack);}}
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendation 2; the final rebuild, 2026-10-27, for the owner to judge; ?diet=0 for the old
    page): the far trees (past the spine's mid radius) octahedral impostors of their species instead of blobs */
 {const q=new URLSearchParams(location.search);if(q.get('diet')!=='0')NWBAY.IMPOSTORS=true;
  /* a runtime range on the heroes (?herorange=800, its impostor standing in beyond) is NOT on: nwbay's heroes are ~210 variant items, and
     keyed by chunk each splits into a mesh a chunk (909 baked calls against 230, measured 2026-10-27). The spine's static radii stay */
  if(q.get('herorange'))NWBAY.LOD=Object.assign(NWBAY.LOD||{},{tree:+q.get('herorange')});}
 NWBAY.ROCK=ROCK;   // the stacks' records: the cliff figs' root curtains follow their walls (55 onRock)
 try{window._biome=NWBAY.build({R:TERR.R-100,quality:1});}catch(e){reportErr('biome: '+e.stack);}
 try{Object.assign(window._biome||{},NWBAY.buildCliffs(ROCK,{R:TERR.R-100,floor:groundH}));}catch(e){reportErr('cliffs: '+e.stack);}   // the stacks' cliffs dressed (57)
 if(shells.length){try{NWBAY.dress(shells,{ledges:{moss:2200,plants:900,edges:520,hang:14},soffits:{n:1800,mossR:4,hang:14},walls:{n:520}});}catch(e){reportErr('dress: '+e.stack);}}
 if(jetty.length){try{NWBAY.dress(jetty,{seed:7,ledges:{moss:260,plants:90,edges:60,hang:4,treeH:5,size:1.6,mossR:1.6},soffits:{n:80,mossR:1.4,hang:3},walls:{n:70,hang:3}});}catch(e){reportErr('dress jetty: '+e.stack);}}
 // the stacks: gardens on the ledges and the dome rim, curtain figs and root
 // curtains off the rim (long: the faces are 40-130 m), moss and ferns on the
 // faces, beards under the notch's overhang
 if(typeof STACK_GEOS!=='undefined'&&STACK_GEOS.length){try{NWBAY.dress(STACK_GEOS,{seed:3,karst:true,ledges:{moss:1200,plants:500,edges:560,hang:46,treeH:9,size:2.2,mossR:3},soffits:{n:260,mossR:2,hang:5},walls:{n:1400,hang:30}});}catch(e){reportErr('dress stacks: '+e.stack);}}
 // the sinkholes' walls (above any water): root curtains off the rim, ferns and moss down the faces
 if(typeof SINK_GEOS!=='undefined'&&SINK_GEOS.length){try{NWBAY.dress(SINK_GEOS,{seed:5,karst:true,ledges:{moss:300,plants:160,edges:200,hang:24,treeH:7,size:2,mossR:2.4},soffits:{n:120,mossR:2,hang:4},walls:{n:900,hang:24}});}catch(e){reportErr('dress sinkholes: '+e.stack);}}
 const b=BIO.bake();
 /* the impostors' light matched to the near crowns (the bake comes out ~4x dark: HANDOFF-REBUILD.md, a core fix owed); ?impgain= ?impwrap= */
 if(BIO.impostorLook){const q=new URLSearchParams(location.search);BIO.impostorLook({gain:+(q.get('impgain')||2.2),wrap:+(q.get('impwrap')||1)});}
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 if(NWBAY_LOOK.ground)BIO.setGround(MAT_GROUND.map,[CENTER[0]-TERR.R*1.1,CENTER[1]+TERR.R*1.1,CENTER[0]+TERR.R*1.1,CENTER[1]-TERR.R*1.1]);   /* R5: the floor cover's root colour (the paint spans TERR.R*2.2 round CENTER; a canvas's v runs z1..z0) */
 /* THE TERRAIN'S HORIZON (core/terrain KHORIZON, 45-core-horizon.js; the final rebuild, 2026-10-27; ?horizon=0 off): the horizon in eight
    directions baked over the map (256 texels a side, ~21 m; terrainH holds the stacks' domes) and over the far country's lattice
    (NWBAY_FAR_G, KFAR), so at a low sun the stacks and the Inner Wall throw their shadows across the bay and the jungle, and the
    sinkholes' floors and the tsingy's canyons see less sky; on the ground and on every lit material standing on the land */
 if(typeof KHORIZON!=='undefined'&&new URLSearchParams(location.search).get('horizon')!=='0'){try{const t0=performance.now();
  const FG=window.NWBAY_FAR_G,HZ=KHORIZON.bake({box:[CENTER[0]-TERR.R,CENTER[1]-TERR.R,CENTER[0]+TERR.R,CENTER[1]+TERR.R],n:256,h:terrainH,
   far:FG&&FG.at?{h:(x,z)=>{const v=FG.at(x,z);return v===v?v:0;},box:[CENTER[0]-12600,CENTER[1]-12600,CENTER[0]+12600,CENTER[1]+12600],n:200}:undefined});
  window._horizon={ms:Math.round(performance.now()-t0),n:HZ.n};KHORIZON.shade(MAT_GROUND,HZ);
  window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:m=>!(m.userData&&m.userData.farField)});}catch(e){reportErr('horizon: '+e.stack);}}
 /* THE SUN'S SHADOWS (core/shadow, KSHADOW; the catch-up pass, 2026-11-03). The owner: toggleable, OFF by default. Attached after every
    placement, so the flora, the stacks, the tsingy and the ground cast and receive (the far field, the water and the impostors draw their own
    light), then switched off at once: the sun casts nothing until ?shadow=1 or the panel's "shadows" button (99-host-take.js) turns it on.
    Turning it on or off recompiles the lit programs once (three's shadow-light count changes): a hitch, not a cost a frame */
 if(typeof KSHADOW!=='undefined'&&KSHADOW.attach){try{const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});S.cast(scene);
  scene.traverse(o=>{if(o.isMesh&&o.material===MAT_GROUND){o.castShadow=false;o.receiveShadow=true;}if(o.isMesh&&o.userData&&o.userData.farField)o.castShadow=o.receiveShadow=false;});
  if(new URLSearchParams(location.search).get('shadow')!=='1')S.off();window._shadow=S;}catch(e){reportErr('shadow: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The north-west bay (ideal type)',x:CENTER[0],z:CENTER[1],r:TERR.R,h:420});
})();
