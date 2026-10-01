// ---------- content: city parameters and the Izani lexicon are data files (data/cities/iziz.json, data/lexicon.json), so they can be edited without touching this code ----------
const CITY_ID=(()=>{const v=new URLSearchParams(location.search).get('city')||'';return /^[a-z0-9-]{1,40}$/.test(v)?v:'iziz';})();   // ?city=name picks data/cities/name.json
ctx.cityId=CITY_ID;
const DATA=await (async()=>{const get=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+': HTTP '+r.status);return r.json();});const [city,lex]=await Promise.all([get('data/cities/'+CITY_ID+'.json'),get('data/lexicon.json')]);return {city,lex};})();
const SEED_DEFAULT=DATA.city.defaultSeed||1337;
// dataValue / resolveCity: src/core/data.js
// 1 heightmap  2 landmark massing  3 street network  4 sanity view
// 5 infill buildings  6 detailing pass  7 walls / chasm / moat / bridges
// ============================================================
