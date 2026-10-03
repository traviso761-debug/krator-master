// ================================================================= BIOME CORE — export host: the browser download
// [web]: the one part of the export that needs a browser (a Blob, a link, a click). The data side is
// core/biome/42-core-export.js ([G data]), which this fragment wraps. No build calls BIO.download today; it is
// here for a console or a probe. It moves into core/host/ when Phase 1 of GODOT-PLAN.md builds that; until then a
// kit takes both files (list 43-core-export-host.js after 42-core-export.js in CORE_BIOME).
//
//   BIO.download(name, opt)   -> saves BIO.export(opt) as <name>.biome.json; returns the export's stats
(function(){
'use strict';
if(typeof BIO==='undefined'||!BIO.export)throw new Error('43-core-export-host: load core/biome/42-core-export.js first');
BIO.download=function(name,opt){const o=BIO.export(opt),blob=new Blob([JSON.stringify(o)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(name||'biome')+'.biome.json';document.body.appendChild(a);a.click();
 setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);return o.stats;};
})();
