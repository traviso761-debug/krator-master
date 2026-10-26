// ================================================================= HOST — the station's water on core/water
// The stage's records (STAGE.water: {key, kind 'still' | 'open' | 'flow', rec or the open surface's options, look}) drawn
// with core/atmos's clock, wave chunk and the shared sky in them (ATMOS.skylight: a capture of the sky's own scene, given to
// the water only). The terminal lake is ONE open surface (WATER.open over its box, the true bed baked from terrainH, a calm
// swell, a tint field for the salinity's bands, no lap); the oasis pools are stills with a gradient from the spring's eye
// to the margin; the north fan's trickle a flow. waterH (45b) answers from the same records, so every plant kept out of
// the water agrees with what is drawn.
const WATER_DRAW={};
if((STAGE.water||[]).length){
 {const WENV={environment:null};ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.5,.42,.32])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4)].join()});}
 const lin=c=>new THREE.Color(c).convertSRGBToLinear();
 for(const e of STAGE.water){const L=Object.assign({pick:true},e.look||{});for(const c of ['color','shallow','deep'])if(L[c]!=null)L[c]=lin(L[c]);
  let d=null;
  if(e.kind==='open'){e.surface=e.surface||WATER.open(e.open);d=WATER.draw(e.surface,L);}
  else if(e.kind==='flow')d=WATER.drawFlow(e.rec,L);
  else d=WATER.drawStill(e.rec,L);
  d.mesh.userData.inspectLabel=e.name||(e.rec&&e.rec.name)||e.key;WATER_DRAW[e.key]=d;}}
