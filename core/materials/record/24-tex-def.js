/* ============================== TEXTURE DEFINITIONS (core/materials/record) ==============================
   GODOT-PLAN.md Phase 3, "Textures": a procedural texture is a record, not just code.

     TEX.kind(name, fn, opt)   register a painter kind. fn(def) returns a pixel function (x,y) -> grey 0..1 or
                               [r,g,b(,a)] on an S x S torus; opt.canvas: the painter draws with canvas 2D instead
                               (a picture: it is baked to PNG at export, PLAN.md rule "bake by default")
     TEX.def({id, kind, size, seed, params, colour})   a texture record; returns it (ids are unique)
     TEX.fn(def)               the pixel function for a def (pure: no canvas, no DOM)
     TEX.pixels(def)           Uint8ClampedArray RGBA of size*size, the same bytes a canvas fill writes
     TEX.defs()                every record, for the export

   [G data]. The kinds a build owns live in that build (they are promoted to core/materials when several builds
   share one, GODOT-PLAN.md section 7). Godot gets each def either as a PNG bake (the default) or, for a kind
   promoted to core, as one .gdshader per kind.
*/
var TEX = (function(){
  'use strict';
  var KINDS = {}, DEFS = {};
  function kind(name, fn, opt){ if(KINDS[name]) throw new Error('TEX.kind: '+name+' twice'); KINDS[name] = { fn:fn, canvas:!!(opt&&opt.canvas) }; return name; }
  function def(o){
    if(!o || !o.id || !o.kind) throw new Error('TEX.def: needs an id and a kind');
    if(!KINDS[o.kind]) throw new Error('TEX.def '+o.id+': unknown kind '+o.kind);
    if(DEFS[o.id]) throw new Error('TEX.def: id '+o.id+' twice');
    var d = { id:o.id, kind:o.kind, size:o.size||256, seed:o.seed||0, params:o.params||{}, colour:!!o.colour,
              bake:KINDS[o.kind].canvas || !!o.bake };
    DEFS[o.id] = d; return d;
  }
  function fn(d){ var k = KINDS[d.kind]; if(!k || k.canvas || !k.fn) throw new Error('TEX.fn '+d.id+': kind '+d.kind+' has no pixel function'); return k.fn(d); }
  function pixels(d){
    var S = d.size, f = fn(d), out = new Uint8ClampedArray(S*S*4);
    function c01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
    for(var y=0;y<S;y++) for(var x=0;x<S;x++){
      var v = f(x,y), o = (y*S+x)*4;
      if(typeof v === 'number'){ v = c01(v)*255; out[o]=out[o+1]=out[o+2]=v; out[o+3]=255; }
      else { out[o]=c01(v[0])*255; out[o+1]=c01(v[1])*255; out[o+2]=c01(v[2])*255; out[o+3]=v.length>3?c01(v[3])*255:255; }
    }
    return out;
  }
  function defs(){ return Object.keys(DEFS).map(function(k){ return DEFS[k]; }); }
  return { version:1, kind:kind, def:def, fn:fn, pixels:pixels, defs:defs, kinds:KINDS };
})();
if(typeof window !== 'undefined') window.TEX = TEX;
