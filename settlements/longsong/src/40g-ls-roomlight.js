// ================================================================= LONGSONG — the rooms under a skylight, for the room table (2026-11-23) [G data]
// Which of LS.ROOMS stand under a skylight, for core/interiors/10-core-roomlight.js (KROOMLIGHT.buildTable named these two
// rooms itself until 2026-11-23): the Great Assembly Hall's skylight columns and the Hall of the Founders. Not in 40c:
// 40c's text keys the interiors bake (build.py _interiors: the bake's `kit`), so a line there stales the bake.
//   LS_ROOMLIGHT.skylit        the ids
//   LS_ROOMLIGHT.rooms(list)   the list for buildTable (89x, 94): a room in skylit as a copy with skylight: true, the rest
//                              as they are (LS.ROOMS itself is not touched)
var LS_ROOMLIGHT=(function(){'use strict';
 const skylit=['wp.assembly','rp.k0.founders'],S={};
 for(const id of skylit)S[id]=1;
 return{skylit,rooms:list=>list.map(r=>r&&S[r.id]?Object.assign({},r,{skylight:true}):r)};
})();
