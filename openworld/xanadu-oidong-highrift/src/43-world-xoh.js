// ================================================================= XANADU, OIDONG AND THE HIGH RIFT — the fields the kits read
// [G data] The fields this region's kits read that the world does not make (as openworld/isle-demo's 43 adds the isles'):
//   flat   the Oidong kit's pale flats (biomes/oidong/src/55: its `flats` zone and the cloud pines, peyote and stone-blooms
//          on it). The kit's own page paints them; the world has no map of them yet, so the field is 0 everywhere and the
//          valley's other zones (meadow, moss, terrace, mist, stream, shore) take the ground. An unknown field reads as
//          undefined in a kit's zones, which made every zone NaN and grew nothing (KNOWN_ISSUES.md).
// It extends WORLD.FIELDS (so the flora's tile grids carry it) and wraps WORLD.fieldsFrom, so every sample has it.
(function(){'use strict';
const EXTRA={flat:0};
for(const k in EXTRA)if(WORLD.FIELDS.indexOf(k)<0)WORLD.FIELDS.push(k);
const ff=WORLD.fieldsFrom;
WORLD.fieldsFrom=function(x,z,h,tanS,P,out){const A=ff.call(WORLD,x,z,h,tanS,P,out);for(const k in EXTRA)if(A[k]==null)A[k]=EXTRA[k];return A;};
const at=WORLD.at;
WORLD.at=function(x,z){const A=at.call(WORLD,x,z);for(const k in EXTRA)if(A[k]==null)A[k]=EXTRA[k];return A;};
WORLD.XOH_FIELDS=Object.keys(EXTRA);})();
