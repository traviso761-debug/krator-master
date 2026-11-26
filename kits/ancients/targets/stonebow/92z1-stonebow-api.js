// ================================================================= STONEBOW — public page API & settlement culture socket
// Exposes window._api.stonebow so any settlement host or interactive session can inspect Scale Model 5.1 site metrics
// or re-furnish the 5 refurbished centerpiece zones into another culture ('post-apoc', 'generic', 'ancient', etc.)
// while keeping the 2 sealed delving-ruin vault zones untouched as dungeon sockets.
if(typeof window!=='undefined'&&window._api&&typeof STONEBOW!=='undefined'){
 window._api.stonebow=(function(){
  const P=STONEBOW.plan({seed:12400});
  const RF=STONEBOW.refurb(P);
  const keptIds=['refurb/crown','refurb/bow','refurb/city','refurb/tourist','refurb/pylons'];
  return {
   site:STONEBOW.SITE,
   toPx:STONEBOW.toPx,
   stats:{intact:P.stats,refurbished:RF.stats},
   keptZones:keptIds.slice(),
   delveZones:['refurb/vaults-w','refurb/vaults-e'],
   socketRefurb:function(culture,opts){
    if(typeof aikSocket!=='function')return 0;
    let total=0;
    for(const id of keptIds){
     total+=aikSocket(id,culture||'ancient',opts||{});
    }
    if(typeof AIK_CLIP!=='undefined'&&AIK_CLIP.site&&keptIds.indexOf(AIK_CLIP.site.id)>=0){
     aikOpen(AIK_CLIP.site.id,AIK_CLIP.storey);
    }
    return total;
   }
  };
 })();
}
