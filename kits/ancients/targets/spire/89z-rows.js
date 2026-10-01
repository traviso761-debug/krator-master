// TARGET: spire — The Hanging City, the lattice pyramid, on its own.
//
// A Shimizu Mega-City Pyramid type arcology: a six-cell octahedral megatruss
// pyramid, 1 080 m across its base nodes and ~880 m to the mast, standing on
// piers in its own square lagoon, with skyscrapers and small pyramids hung in
// its cells. Built by buildSpire() in src/61-spire.js (the file and the target
// keep the name of Vashtir, the recursive spire it replaced), registered here
// through EXTRA_BUILDERS so the work lives entirely in its own target.
const TITLE='The Hanging City — the lattice pyramid';
const GROUND_C=0;
const DECAYS=[0,1,3];                         // intact, ruined, rehabilitated
// Each site is its lagoon and quay, 1 940 m square; s = 2 100 leaves ~160 m of
// plain between neighbouring quays. Intact at -s, rehabilitated at 0, ruined at +s.
const ROWS={spire:{z:0,s:2100,r:1100}};
const RUINS=[[ROWS.spire.s,0,1250],[0,0,1050]];
const EXTRA_BUILDERS={spire:buildSpire};     // hook that registers the builder
