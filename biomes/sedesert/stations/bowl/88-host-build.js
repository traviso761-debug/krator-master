// ================================================================= HOST — build (the Bowl)
// No structures on the station (Mantis is far off: 87). The kit alone, its passes the Bowl's (56, 66), then one bake.
// The fauna: the kit's kinds where they fit; the floor is too hot for the deer (PLAN-BOWL.md section 6), and nothing walks
// on the open crust or in the water.
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 const fauna=(kind,x,z)=>kind!=='deer'&&FIELD.salt(x,z)<.5&&FIELD.lake(x,z)<.1;
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md; the final rebuild, 2026-10-27; ?diet=0 the spine's static LOD alone): heroes within 800 m, octahedral
    impostors past that and for every far tree, the kit's floor bands to 600/1200/1000 m (the station's own floor keeps its spine bands) */
 if(new URLSearchParams(location.search).get('diet')!=='0')Object.assign(SEDESERT.LOD,{tree:800,floor:600,mid:1200,far:1000});else SEDESERT.IMPOSTORS=false;
 try{window._biome=SEDESERT.build({R:TERR.R-150,quality:q,fauna});}catch(e){reportErr('biome: '+e.stack);}
 _mark('biome');
 const b=BIO.bake();
 /* the impostors' light matched to the near crowns (the bake is ~4x dark: HANDOFF-REBUILD.md); ?impgain= ?impwrap= */
 if(BIO.impostorLook){const q=new URLSearchParams(location.search);BIO.impostorLook({gain:+(q.get('impgain')||2.6),wrap:+(q.get('impwrap')||1)});}
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Bowl: the south shore of the salt lake at the Bowl river 2\'s delta (station 2 of the eastern desert)',x:0,z:0,y:LAKE.level-8,r:TERR.R,h:400});
 _mark('bake');
})();
