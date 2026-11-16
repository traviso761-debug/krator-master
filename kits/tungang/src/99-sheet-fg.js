// ================================================================= THE STATE SWITCH (after core/host's panel is built by 99-host-take.js)
// kept or worn: FG_STATE (89-rows.js, from ?state=worn), read by every builder through fgCx. The select reloads the page in
// the other state rather than rebuilding the world in place (a rebuild disposes every geometry, and the engine's disposal
// logs a WebGL "object does not belong to this context" error per mesh: KNOWN_ISSUES.md). verify.py measures the worn
// state without a reload, one def at a time (TG.fg.proto).
function fgStateSet(st){const q=new URLSearchParams(location.search);if(st==='worn')q.set('state','worn');else q.delete('state');location.search=q.toString();}
(function(){const ui=document.getElementById('ui');if(!ui)return;const s=document.createElement('select');s.id='fgState';s.title='the buildings\' state (kept, worn): reloads the sheet';
 for(const [v,l] of [['kept','State: kept'],['worn','State: worn']]){const o=document.createElement('option');o.value=v;o.textContent=l;s.appendChild(o);}
 s.value=FG_STATE;s.onchange=()=>fgStateSet(s.value);ui.appendChild(s);})();
