// ================================================================= HOST — the keepers (the Terraces: none yet)
// [web] Station 0's keepers walk avenue blocks of its lattice (src/72-host-keepers.js); the Terraces have no lattice. A gardener keeper on rounds of
// the fields is owed (KNOWN_ISSUES.md). The records the shared fragments read: no keeper, the follow mode with no rider.
const AV_KEEPERS=[];
const AV_FOLLOW={i:null,cam:null,more:[],riders(){return AV_KEEPERS.concat(this.more);},follow(i){this.i=null;}};
