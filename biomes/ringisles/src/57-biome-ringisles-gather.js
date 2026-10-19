// ================================================================= RING SEA ISLES — what can be gathered where ([G data])
// core/hamlet/PLAN.md section 2: the biome code that makes a piece of ground says what a village can gather from it, as
// a tree's harvest.wood says what its wood is good for. One tag on the zones (55-biome-ringisles-trees.js zones()):
//   gather: {pasture: 0..1, fish: 0..1, salt: true|false}
// PASTURE  every zone with a decent understory (owner, 2026-10-18): grass, herbs, low shrub that stock can graze. The open
//          savanna is best; the steppe thinner; the monsoon forest's open floor some; closed rainforest, sand, mud, the
//          salt crust and the thermal ground none.
// FISH     the water zones where fishing is good (owner, 2026-10-18): the reef, the lagoon inside it, the mangal's
//          channels (the isles' estuaries), the tide-pool bench a little. The river mouths and the shelf edge are the
//          open world's to mark (its drainage and depth); this kit has no lake.
// SALT     the pan's crust (not its rim, where the glasswort grows): a salt works rakes it.
// Pasture and fish never run out for now (owner, 2026-10-18): the weight says how many can work a place, not a stock.
// RINGISLES.gatherOf(Z) is a plain function of zones() (so a node test and Godot can run it on given weights);
// RINGISLES.gather(x, z) reads the zones at a point. No three.js, no DOM.
RINGISLES.GATHER={
 /* grazing weight per zone weight (zones() keys, already zero on cliffs, gardens and thermal ground) */
 pasture:{sav:.9,step:.55,am:.3,af:.05,xa:0,strand:.1,dune:.15,panEdge:.05},
 /* catch per zone weight */
 fish:{reef:1,lagoon:.85,mangal:.7,bench:.25},
 /* the crust's share over which a pan is worked for salt */
 saltPan:.45
};
RINGISLES.gatherOf=function(Z){const G=RINGISLES.GATHER;let p=0,f=0;
 for(const k in G.pasture)p+=(Z[k]||0)*G.pasture[k];
 for(const k in G.fish)f+=(Z[k]||0)*G.fish[k];
 /* the steppe's salt-steppe share grazes less (its floor is halophytes); the burn's black ground none until it greens */
 if(Z.step>0&&Z.xs!=null)p-=Z.xs*G.pasture.step*.6;
 if(Z.burn&&Z.burn.black)p*=1-.8*Z.burn.black;
 return{pasture:Math.max(0,Math.min(1,p)),fish:Math.max(0,Math.min(1,f)),salt:(Z.pan||0)>G.saltPan};};
RINGISLES.gather=(x,z)=>RINGISLES.gatherOf(RINGISLES.zones(x,z));
