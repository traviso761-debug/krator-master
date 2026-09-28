// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
window._biome=null;
// ?q=0.5 (or window.KRATOR_Q) scales every count in the biome: the knob for a weaker machine
const BIOME_Q=(()=>{let q=+(window.KRATOR_Q||0);try{q=q||+(new URLSearchParams(location.search).get('q'));}catch(e){}return q>0?Math.min(q,1.5):1;})();
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 try{window._biome=NWLOW.build({R:TERR.R-150,quality:BIOME_Q,avenues:[{path:ROAD,spacing:16,offset:9,species:'ghostgum'}]});}catch(e){reportErr('biome: '+e.stack);}
 if(shells.length){try{NWLOW.dress(shells,{ledges:{moss:2200,plants:900,edges:520,hang:14},soffits:{n:1800,mossR:4,hang:14},walls:{n:520}});}catch(e){reportErr('dress: '+e.stack);}}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The northwestern lowlands (ideal type)',x:0,z:0,r:TERR.R,h:420});
})();
