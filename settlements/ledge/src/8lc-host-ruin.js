// ================================================================= HOST — the wreck: the heaps, the prow's shards, the viaduct's stumps; every ruin watched
// [draw] The heaps and the prow's shards are the cliff city's (kits/ancients/cliff/50-cliff-wreck.js, KCLIFF.drawWreck, lifted from this
// fragment on 2026-11-22): the prow on the apron and in the shallows, the sheared decks on the apron's west. Ledge's own: the viaduct's piers
// standing in the lake to their stumps. Then every ruined structure is watched (KRUINS.watch): the shell, the wreck, the stumps.
const LRUIN=(function(){const L=LEDGE_LAYOUT,G=L.ground,W=L.world,dr=(id,i,salt)=>LEDGE.draw(W,id,i,salt),box=LB.box;
 const WR=KCLIFF.drawWreck({L,ground:LEDGE_H,seed:id=>LEDGE.seed(W,id),draw:dr,scene,mats:LMAT});
 const PG=new THREE.Group();PG.name='the viaduct\'s stumps';scene.add(PG);
 L.piers.forEach((p,i)=>{let bed=Infinity;[[-1,-1],[1,-1],[1,1],[-1,1],[0,0]].forEach(c=>{bed=Math.min(bed,LEDGE_H(p.x+c[0]*p.w/2,p.z+c[1]*p.d/2));});
  const top=G.lake+2+14*dr(p.id,0,1)*(i<6?1:.5);box('panel',p.x,(bed-.4+top)/2,p.z,p.w,top-bed+.4,p.d);});
 const pierMeshes=LB.flush(PG,LMAT,'the viaduct\'s stumps');
 if(typeof KRUINS!=='undefined'){
  KRUINS.watch(LSHELL.root,{name:'the shell (Ledge\'s decks)',ground:LEDGE_H});
  KRUINS.watch(WR.group,{name:'the prow\'s and the shear\'s wreck',ground:LEDGE_H});
  KRUINS.watch(PG,{name:'the viaduct\'s stumps',ground:LEDGE_H});}
 return {heaps:WR.heaps,wreck:WR.group,piers:PG,shards:WR.shards,pierMeshes};})();