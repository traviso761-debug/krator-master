/* ============================== MATERIAL RECORDS (core/materials/record) ==============================
   GODOT-PLAN.md Phase 3 and core/materials/PLAN.md "The record": every build material is one record in one
   vocabulary, so the exporter writes a table a Godot importer applies without reading JS.

     { id, family, colour, map, normalMap, roughnessMap, roughness, metal, specular, emissive, doubleSided, alphaTest,
       scale:[u,v] (world metres per tile), tint (true: the build's vertex or instance colour multiplies the map),
       normalScale, pattern, hook, lib (library set id), tex (TEX.def id for a procedural map), bake }
   specular is Godot's StandardMaterial3D `specular` (0..1, 0.5 = the physical default): how much direct light a
   dielectric reflects. Palette-tinted surfaces under a strong sun want less, or grazing views wash them grey.

   [G data]: no THREE, no DOM. A build declares an ADAPTER from its own material names (FAMMAT keys, MAT
   names, catalog family strings) onto records; its old names stay valid (PLAN.md "Order of work" 5).

     KMAT.record(o)                   a checked record (unknown fields throw; defaults filled)
     KMAT.pack(build, {fam:{...}})    the build's library pack, written by tools/textures/pack.py into a generated
                                      fragment: per family the library id, its processed maps (data URLs) and fields
     KMAT.packed(build, fam)          that family's pack entry, or null
     KMAT.adapter(build, {name:rec})  register a build's records; KMAT.table(build) returns them as one table
     KMAT.mode                        'lib' (library maps where the pack has them) or 'proc' (the procedural maps
                                      only: the look before the library); the host sets it from ?mat=proc
*/
var KMAT = (function(){
  'use strict';
  var FIELDS = ['id','family','colour','map','normalMap','roughnessMap','roughness','metal','specular','emissive','doubleSided',
                'alphaTest','scale','tint','normalScale','pattern','hook','lib','tex','bake','note'];
  var DEF = { colour:'#ffffff', roughness:1, metal:0, specular:0.5, emissive:null, doubleSided:false, alphaTest:0, scale:[1,1],
              tint:true, normalScale:1, map:null, normalMap:null, roughnessMap:null, pattern:null, hook:null,
              lib:null, tex:null, bake:false, note:'' };
  var PACKS = {}, ADAPTERS = {};
  function record(o){
    if(!o || typeof o !== 'object') throw new Error('KMAT.record: an object, please');
    Object.keys(o).forEach(function(k){ if(FIELDS.indexOf(k) < 0) throw new Error('KMAT.record '+(o.id||'?')+': unknown field '+k); });
    if(!o.id) throw new Error('KMAT.record: every record needs an id');
    if(!o.family) throw new Error('KMAT.record '+o.id+': every record needs a family');
    var r = {};
    FIELDS.forEach(function(k){ r[k] = (k in o) ? o[k] : (k in DEF ? DEF[k] : null); });
    if(!Array.isArray(r.scale) || r.scale.length !== 2 || !(r.scale[0] > 0 && r.scale[1] > 0))
      throw new Error('KMAT.record '+o.id+': scale is [u,v] metres per tile, both > 0');
    if(r.roughness < 0 || r.roughness > 1 || r.metal < 0 || r.metal > 1 || r.specular < 0 || r.specular > 1) throw new Error('KMAT.record '+o.id+': roughness, metal and specular are 0..1');
    if(r.alphaTest < 0 || r.alphaTest >= 1) throw new Error('KMAT.record '+o.id+': alphaTest is 0..1');
    return r;
  }
  function pack(build, fams){ PACKS[build] = fams || {}; return PACKS[build]; }
  function packed(build, fam){ var p = PACKS[build]; return (p && p[fam]) || null; }
  function adapter(build, recs){
    var out = {};
    Object.keys(recs).forEach(function(name){ out[name] = record(recs[name]); });
    ADAPTERS[build] = out; return out;
  }
  /* the table an exporter writes: maps are named by the library set or the TEX.def id, never as pixels */
  function table(build){
    var A = ADAPTERS[build] || {};
    return { format:'krator-materials', version:1, build:build, mode:api.mode,
      convention:{ units:'m', scale:'world metres per tile (u,v)', uv:'world-space planar or triplanar',
        colour:'map colours sRGB; records with tint:true are multiplied by the vertex or instance colour (sRGB in the palette, linear on the GPU)',
        normal:'OpenGL (+Y), as Godot expects', library:'core/materials/library/<lib>/ (albedo.jpg, normal.png, roughness.png); a pack holds processed copies' },
      records:Object.keys(A).map(function(name){ var r = A[name], o = { name:name };
        Object.keys(r).forEach(function(k){ if(r[k] !== null && k !== 'map' && k !== 'normalMap' && k !== 'roughnessMap') o[k] = r[k]; });
        o.maps = r.lib ? { from:'library', lib:r.lib } : r.tex ? { from:'procedural', tex:r.tex, bake:true } : null;
        return o; }) };
  }
  var api = { version:1, FIELDS:FIELDS, record:record, pack:pack, packed:packed, adapter:adapter, table:table, mode:'lib',
              packs:PACKS, adapters:ADAPTERS };
  return api;
})();
if(typeof window !== 'undefined') window.KMAT = KMAT;
