// ================================================================= XANADU, OIDONG AND THE HIGH RIFT — the Xanadu kit in an open world
// [G data] core/world's flora (85-world-flora.js) reads a kit as {SPECIES, PASSES: [{sp, cell, accept(Z, x, z), opt}],
// zones, make, grow}. The Xanadu kit (biomes/xanadu) places its trees by calls inside its showcase's build
// (src/55-biome-xanadu-trees.js, XANADU.buildTrees: pass(sp, cell, accept, opt) and the diversity pass's kpass), not
// from a table, so this is that table as data: every species pass in the order the kit runs them, the same species,
// cells and acceptances; the options the world reads (pad, patch, patchScale) kept, the showcase's own (hero, mid, far,
// lodK, minY, mod) left to the world's LOD. Not carried: the fairy RINGS, the hornbeam ARCHES and the enchanted grove
// (placements of their own, not passes), and the shore's species: the kit reads its lake shore from the ground's absolute
// height (Z.h between 2.5 and 10 m, its page's lake at 0), which in the world is the real height, so Z.shore is 0 here
// (KNOWN_ISSUES.md). When the kit carries its own pass table (XANADU.PASSES), this file goes.
var XANADU_WORLD=(function(){'use strict';
const {smooth,fbm}=BIO.fn;
const P=(sp,cell,accept,o)=>({sp,cell,accept,opt:{pad:o.pad==null?4:o.pad,patch:o.patch==null?.6:o.patch,patchScale:o.patchScale==null?.01:o.patchScale}});
const PASSES=[
 P(0,16,(Z,x,z)=>{const h=Z.h;if(h<.9||h>4.5)return 0;return .5*Z.shore*smooth(.48,.66,fbm(x*.004+3,z*.004-1,811,2));},{pad:2.5,patch:0}),
 P(0,34,(Z)=>Z.shore*.55+Z.rip*.5+Z.chasm*.35,{pad:3,patch:.4}),
 P(19,40,(Z)=>Z.shore*.45+Z.rip*.45,{pad:4,patch:.5}),
 P(12,40,(Z)=>Z.rip*.55+Z.forest*.05,{pad:4,patch:.5}),
 P(2,48,(Z)=>Z.vale*.26*(.12+1.7*Z.grove)+Z.shore*.32+Z.rip*.2,{pad:4,patch:.4}),
 P(4,40,(Z)=>Z.vale*.34*(.12+1.7*Z.grove),{pad:3,patch:.4}),
 P(18,40,(Z)=>Z.vale*.32*(.12+1.7*Z.grove)+Z.rip*.08,{pad:3,patch:.4}),
 P(9,42,(Z)=>Z.vale*.18*(.12+1.7*Z.grove)+Z.rip*.2+Z.shore*.1,{pad:3,patch:.4}),
 P(1,46,(Z)=>Z.vale*.26*(.12+1.7*Z.grove)+Z.forest*.12,{pad:3,patch:.4}),
 P(20,30,(Z)=>Z.vale*.1+Z.rip*.18+Z.chasm*.08,{pad:2.5,patch:.4}),
 P(11,30,(Z)=>Z.forest*.55,{pad:4,patch:.3}),
 P(6,60,(Z)=>Z.forest*.34+Z.vale*.1,{pad:4,patch:.5,patchScale:.006}),
 P(10,30,(Z)=>Z.forest*.5+Z.vale*.06,{pad:2.5,patch:.45}),
 P(22,50,(Z)=>Z.forest*.08+Z.chasm*.35+Z.cloud*.2,{pad:3,patch:.5}),
 P(24,26,(Z)=>Z.forest*.12+Z.chasm*.25,{pad:2,patch:.5}),
 P(23,16,(Z)=>Z.chasm*.6+Z.rip*.12+Z.cloud*.3,{pad:1.6}),
 P(13,16,(Z)=>Z.chasm*.45*smooth(.3,.1,Z.up)+Z.rip*.2+Z.forest*.03,{pad:2,patch:.5}),
 P(21,20,(Z)=>Z.chasm*.35*smooth(.3,.1,Z.up)+Z.rip*.18,{pad:2,patch:.5}),
 P(28,34,(Z)=>Z.chasm*.45+Z.cloud*.35,{pad:3,patch:.4}),
 P(29,22,(Z)=>Z.cloud*.55+Z.chasm*.2,{pad:2.5}),
 P(5,24,(Z)=>Z.dry*.55,{pad:2.5,patch:.5}),
 P(3,28,(Z)=>Z.dry*.3+Z.crag*.45,{pad:3,patch:.5}),
 P(16,28,(Z)=>Z.dry*.24,{pad:2.5,patch:.5}),
 P(17,28,(Z)=>Z.dry*.24,{pad:1.5,patch:.5}),
 P(15,24,(Z)=>Z.dry*.34+Z.crag*.08,{pad:1.2,patch:.5}),
 P(14,26,(Z)=>Z.dry*.3,{pad:1.5,patch:.5}),
 P(25,26,(Z)=>Z.dry*.25+Z.crag*.12,{pad:2,patch:.5}),
 P(26,32,(Z)=>Z.dry*.2+Z.crag*.2,{pad:1.5,patch:.5}),
 P(27,16,(Z)=>Z.dry*.45+Z.crag*.35,{pad:1,patch:.45}),
 P(31,36,(Z)=>Z.dry*.34+Z.vale*.03,{pad:2.5,patch:.6,patchScale:.006}),
 P(32,34,(Z)=>Z.dry*.4+Z.forest*.03,{pad:2.5,patch:.5}),
 P(30,30,(Z)=>Z.dry*.18,{pad:1.5,patch:.5}),
 // the diversity pass (2026-10-26): the breaker crowns, the braided cloud trees, the hive lilies
 P(33,46,(Z)=>(Z.vale*.08*(.3+Z.grove)+Z.crag*.12+Z.dry*.07+Z.chasm*.1)*smooth(.75,.5,Z.forest)*smooth(.85,.65,Z.up),{pad:3,patch:0}),
 P(34,52,(Z)=>Z.vale*.2*(.12+1.7*Z.grove)+Z.rip*.05,{pad:3,patch:0}),
 P(35,13,(Z)=>(Z.forest*.25+Z.rip*.3+Z.chasm*.3)*smooth(.6,.3,Z.up),{pad:1.2,patch:0})];
/* only the species the kit has (the table above names 0..35) */
const xanadu={name:'xanadu',SPECIES:XANADU.SPECIES,PASSES:PASSES.filter(p=>XANADU.SPECIES[p.sp]),zones:XANADU.zones,make:XANADU.make,grow:XANADU.grow};
return{xanadu};})();
