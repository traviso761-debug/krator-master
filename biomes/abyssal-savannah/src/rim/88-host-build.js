// ================================================================= HOST — build
// The order a world follows: the land's passes (87: the kits' builders placed by the host), then one bake, the impostors (none of the
// savannarim's own; a neighbour's builder that makes them bakes them here), the terrain's horizon on the flora, the floor cover's root
// colour from the ground's paint (R5).
window._land=null;
const IMP_GAIN=1.6;   /* the hyperjungle's measured gain for its trees' impostors, read in place */
(function(){
 const t0=performance.now();
 try{window._land=landBuild();}catch(e){reportErr('land: '+e.stack);}
 const b=BIO.bake();
 if(BIO.impostorLook){const q=new URLSearchParams(location.search);BIO.impostorLook({gain:+(q.get('impgain')==null?IMP_GAIN:q.get('impgain')),wrap:+(q.get('impwrap')==null?1:q.get('impwrap'))});}
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 if(GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField});}catch(e){reportErr('horizon: '+e.stack);}}
 if(MAT_GROUND&&MAT_GROUND.map){const S=TERR.R*1.1;BIO.setGround(MAT_GROUND.map,[-S,S,S,-S]);}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:LAND.name,x:0,z:0,r:TERR.R,h:400});
})();
