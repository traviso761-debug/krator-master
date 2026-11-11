// ================================================================= ALTERNATIVE TAKES for the Islanders: the tables the engine's emit reads (core/engine/30-geo.js)
/* the gable sheets' alternative takes: a building with GABLE_ALT set (36-def.js) draws the other take of each */
Object.assign(GABLE_ALT_K,{patGableW:'patGableW2',patGableW2:'patGableW',patGableE:'patGableE2',patGableE2:'patGableE'});
/* a building's other materials (materials.json: shingle, ceramic, ropeT, tarredB, softwood, rattan, clayBlock): MAT_ALT is a hash of its seed, variant and place (36-def.js), the key's list is indexed by it, the first entry the usual material (repeats weight it) */
Object.assign(MAT_VAR,{thatch:['thatch','thatch','thatch','thatch','thatch','thatch','shingle','ceramic'],rope:['rope','ropeT'],tarred:['tarred','tarred','tarredB'],planks:['planks','planks','softwood'],mat:['mat','mat','rattan'],banco:['banco','banco','clayBlock']});
