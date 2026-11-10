// ================================================================= HOST — the tableland's own water (station 3): the seep pools and the twin falls
// After station 4's water (Pan Riba, the reservoir: stations/pillars/89w-host-water.js): the hanging swamps' seep pools (core/water stills,
// clear and brown with the swamp's tannin) and the twin falls' two streams over the rim (flows, and their falls with spray).
const SEEP_DRAWS=SEEP_POOLS.map(P=>{const S=WATER.still({name:'A seep pool (a hanging swamp)',level:P.level,gradient:{centre:0x2a3a28,rim:0x4a5a3a,power:1.2},
 poly:Array.from({length:18},(_,k)=>{const a=k/18*TAU;return[P.x+Math.cos(a)*(P.r+.6),P.z+Math.sin(a)*(P.r+.6)];})});
 return WATER.drawStill(S,{color:lin(0x2c3a2a),roughness:.08,metalness:0,envMapIntensity:.2,rain:true,renderOrder:1});});
const TWIN_DRAWS=TWIN.map(C=>({flow:WATER.drawFlow(C.flow,{rapids:[.05,.5],shallow:lin(0x86a89a),deep:lin(0x2e5a52),color:0xffffff,roughness:.2,metalness:.05,step:2,across:3,margin:.5,envMapIntensity:.3,renderOrder:2,rain:true}),
 falls:C.falls.map(F=>WATER.drawFall(F,{color:lin(0xd8e2e2),opacity:.86,rows:32,cols:4,margin:1,lipK:.85,spray:'drop',rain:true,envMapIntensity:.25,renderOrder:3}))}));
