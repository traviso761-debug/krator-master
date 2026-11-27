// ================================================================= HOST — the wreck: the heaps and the prow's shards; every ruin watched
// [draw] The cliff city's wreck (kits/ancients/cliff/50-cliff-wreck.js, KCLIFF.drawWreck): the prow across the shelf town, the sheared decks
// under the south-east end, the rockfall beyond it (the cliff's own breccia). Then every ruined structure is watched (KRUINS.watch).
const SRUIN=(function(){const L=SHELF_LAYOUT,W=L.world;
 const WR=KCLIFF.drawWreck({L,ground:SHELF_H,seed:id=>SHELF.seed(W,id),draw:(id,i,salt)=>SHELF.draw(W,id,i,salt),scene,mats:LMAT});
 if(typeof KRUINS!=='undefined'){
  KRUINS.watch(SSHELL.root,{name:'the shell (Shelf\'s decks)',ground:SHELF_H});
  KRUINS.watch(WR.group,{name:'the prow\'s, the shear\'s and the rockfall\'s wreck',ground:SHELF_H});}
 return WR;})();