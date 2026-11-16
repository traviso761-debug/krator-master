// ================================================================= CRATER DRYLANDS — the fire history, on core/biome's KFIRE
// The drylands are a mosaic of burns of every age. The model (a shortest-time spread of each fire over a 20 m grid, burnability x fuel x wind
// x slope, oldest fire first, each stopped by the fresh burns before it) was this fragment's; it was lifted into core/biome/38-core-fire.js
// (KFIRE; hyperjungle PLAN-LANDS.md H3) and, at the final rebuild (pair 12, 2026-11-09), this fragment moved onto it. The model's description
// and API are KFIRE's header; the original fragment is kept, frozen, as core/biome/ref/craterdry-fire-52.js.txt, the reference
// core/biome/test-fire.js proves KFIRE and this adapter against, bit for bit.
//
// THE PAGE KEEPS ITS FIRES (core/biome/README.md, "crater-drylands, at its rebuild"): KFIRE is handed this kit's own inputs, so every grid is
// the old fragment's: its burnability (its formula on the host's fields, with BIO's fbm patch), its edge warp (BIO's fbm), and its older
// fires as it lit them (reseed(seed), then rr/rng in draw order, the ignition retried on ground that will burn), passed with old:0. Moving to
// KFIRE's portable defaults (KRAND noise and hashed old fires: what Godot reproduces) would change the page once; not done here.
//
// What it gives, as before: CRATERDRY.fireHistory(o) -> the history (ageAt, fireAt, frontAt, shares, the grids), CRATERDRY.FIRE, ageAt,
// fireAt, frontAt, fireRun(o) (a live fire: KFIRE.run), stages, fuelK, NEVER, FIRE_SEC, FLAME_H. [G data]: no browser, no three.js.
(function(){const {TAU,clamp,lerp,smooth,reseed,rng,rr,fbm}=BIO.fn;
const F=CRATERDRY;
F.FIRE=null;
F.NEVER=KFIRE.NEVER;F.fuelK=KFIRE.fuelK;F.stages=KFIRE.stages;F.FIRE_SEC=KFIRE.FIRE_SEC;F.FLAME_H=KFIRE.FLAME_H;
// the kit's burnability's patchiness (unburnt islands inside every fire) and its edge warp: BIO's fbm, as the page has always drawn them
F.firePatch=(x,z)=>.5+.9*smooth(.28,.72,fbm(x*.0042+7,z*.0042-3,521,2));
F.fireWarp=cs=>(x,z)=>[x+cs*1.1*(fbm(x*.021+3,z*.021,532,2)-.5),z+cs*1.1*(fbm(x*.021,z*.021-5,533,2)-.5)];
// o: {R (2600), cell (20), seed (520031), wind:[dx,dz] (blowing toward), fires:[{ago, x, z, frac, veer}] (the host's recent ones),
//     old: how many older fires to light at random (8: 7..45 years ago)}
F.fireHistory=function(o){o=o||{};const R=o.R==null?2600:o.R,cs=o.cell==null?20:o.cell,N=Math.ceil(2*R/cs)+1,x0=-R,z0=-R,seed=o.seed==null?520031:o.seed;
 const burn=KFIRE.burnFromFields(BIO.field,BIO.depth,F.firePatch);
 // the older fires, lit as the kit lit them: the stream reseeded, each ignition retried (up to 30 times) until it lands on ground that will burn
 reseed(seed);
 const fires=(o.fires||[]).map(f=>Object.assign({veer:0},f)),nOld=o.old==null?8:o.old;
 const base=nOld>0?(function(){const b=new Float32Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=x0+i*cs,z=z0+j*cs;if(Math.hypot(x,z)>R*1.02)continue;b[j*N+i]=burn(x,z);}return b;})():null;
 for(let k=0;k<nOld;k++){let x=0,z=0;for(let t=0;t<30;t++){const a=rr(0,TAU),d=R*.88*Math.sqrt(rng());x=Math.cos(a)*d;z=Math.sin(a)*d;
   const i=Math.round((x-x0)/cs),j=Math.round((z-z0)/cs);if(base[j*N+i]>.45)break;}
  fires.push({ago:lerp(7,45,nOld>1?k/(nOld-1):0)*rr(.88,1.12),x,z,frac:rr(.05,.11),veer:rr(-.35,.35)});}
 const H=KFIRE.history({R,cell:cs,seed,wind:o.wind||[-.56,-.83],fires,old:0,height:BIO.terrainH,burn,warp:F.fireWarp(cs)});
 F.FIRE=H;return H;};
// A LIVE FIRE (89-host-fire.js): KFIRE.run through the history's fuel. o: {x, z, wind, maxT (s), maxCells}; {ok:false} where nothing will burn
F.fireRun=function(o){return KFIRE.run(F.FIRE||F.fireHistory({}),o||{});};
// the age of the ground at a point; before any history is made, one is made with the defaults
F.ageAt=(x,z)=>{if(!F.FIRE)F.fireHistory({});return F.FIRE.ageAt(x,z);};
F.fireAt=(x,z)=>{if(!F.FIRE)F.fireHistory({});return F.FIRE.fireAt(x,z);};
F.frontAt=(x,z)=>{if(!F.FIRE)F.fireHistory({});return F.FIRE.frontAt(x,z);};
})();
