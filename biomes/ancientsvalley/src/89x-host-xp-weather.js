// ================================================================= HOST - the extraplanars' weather (kits/extraplanar on core/atmos)
// [web] The phenomena's weather (75: a void's pool of mist, a solid's chimney plume and steam ring, a presence's breath, each with a glow) goes on
// the page's core/atmos here: after the binding (89a) and the valley's own steam and smog (89u, 89v), before ATMOS.finish, which bakes the
// instanced sets and builds the glow layer. The valley never finished its atmosphere before (its mist, steam and smog are live sprites); the
// phenomena's glow is the first thing on this page that needs the bake.
if(typeof AV_XP!=='undefined'&&AV_XP.ok){try{AV_XP.weather();}catch(e){reportErr('extraplanar weather: '+(e.message||e));}}
if(typeof ATMOS!=='undefined'&&ATMOS.finish){try{window._atmosStats=ATMOS.finish();}catch(e){reportErr('ATMOS.finish: '+(e.message||e));}}
