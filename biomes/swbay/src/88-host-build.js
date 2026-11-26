// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 let jetty=[];if(typeof buildJetty==='function'){try{jetty=buildJetty()||[];}catch(e){reportErr('jetty: '+e.stack);}}
 try{swbayKinVeto();}catch(e){reportErr('kin veto: '+e.stack);}   /* the cousins' cuts (87-host-kin.js), before the tree pass */
 try{window._biome=SWBAY.build({R:TERR.R-100,quality:1});}catch(e){reportErr('biome: '+e.stack);}
 if(shells.length){try{SWBAY.dress(shells,{ledges:{moss:2200,plants:900,edges:520,hang:14},soffits:{n:1800,mossR:4,hang:14},walls:{n:520}});}catch(e){reportErr('dress: '+e.stack);}}
 if(jetty.length){try{SWBAY.dress(jetty,{seed:7,ledges:{moss:260,plants:90,edges:60,hang:4,treeH:5,size:1.6,mossR:1.6},soffits:{n:80,mossR:1.4,hang:3},walls:{n:70,hang:3}});}catch(e){reportErr('dress jetty: '+e.stack);}}
 try{window._kin=growKin();}catch(e){reportErr('kin: '+e.stack);}   /* the neighbours' cousins where the cuts stood, and the floor's few (87) */
 const b=BIO.bake();
 /* the impostors' light matched to the near crowns (the bake comes out ~4x dark: HANDOFF-REBUILD.md, a core fix owed; nwbay's 2.2: at
    nhighlands' 3.6 the trunks bake out white); ?impgain= ?impwrap= */
 if(BIO.impostorLook){const q=new URLSearchParams(location.search);BIO.impostorLook({gain:+(q.get('impgain')||2.2),wrap:+(q.get('impwrap')||1)});}
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer);}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement: the species' views (core/biome 34) */
 if(SWBAY_LOOK.ground)BIO.setGround(MAT_GROUND.map,[CENTER[0]-TERR.R*1.1,CENTER[1]+TERR.R*1.1,CENTER[0]+TERR.R*1.1,CENTER[1]-TERR.R*1.1]);   /* R5: the floor cover's root colour (the paint spans TERR.R*2.2 round CENTER; a canvas's v runs z1..z0) */
 /* THE TERRAIN'S HORIZON (core/terrain KHORIZON, 45-core-horizon.js; the final rebuild, 2026-10-27, nwbay's lines; ?horizon=0 off): the horizon in
    eight directions baked over the map (256 texels a side, ~20 m) and over the far country's lattice (SWBAY_FAR_G, KFAR), so at a low sun the
    volcano, the crater rim and the highlands throw their shadows across the savannah and the bay; on the ground and every lit material on the land */
 if(typeof KHORIZON!=='undefined'&&new URLSearchParams(location.search).get('horizon')!=='0'){try{const t0=performance.now();
  const FG=window.SWBAY_FAR_G,HZ=KHORIZON.bake({box:[CENTER[0]-TERR.R,CENTER[1]-TERR.R,CENTER[0]+TERR.R,CENTER[1]+TERR.R],n:256,h:terrainH,
   far:FG&&FG.at?{h:(x,z)=>{const v=FG.at(x,z);return v===v?v:0;},box:[CENTER[0]-12600,CENTER[1]-12600,CENTER[0]+12600,CENTER[1]+12600],n:200}:undefined});
  window._horizon={ms:Math.round(performance.now()-t0),n:HZ.n};KHORIZON.shade(MAT_GROUND,HZ);
  window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:m=>!(m.userData&&m.userData.farField)});}catch(e){reportErr('horizon: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The southwest bay (ideal type)',x:CENTER[0],z:CENTER[1],r:TERR.R,h:420});
})();
