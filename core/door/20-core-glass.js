// ================================================================= CORE — glass (core/door; the owner, 2026-11-03: "real glass")
// One set of glass for every kit: a window is a pane you see the room through, not an opaque plate or a dark void.
// KGLASS.SPEC is plain data (the colour, opacity, roughness and glow of each kind), which the Godot side reads as a
// StandardMaterial3D with alpha transparency; KGLASS.material(THREE, kind) builds the three.js material from it, one per
// kind and THREE, shared by every pane on the page. Iziz's glass (69e5: MAT.izGlass, the warm pane) is the 'clear' and
// 'lit' kinds' source, so a page that moves onto these looks as it did.
//
//   KGLASS.SPEC.clear     clear window glass, a faint blue-green cast
//   KGLASS.SPEC.lit       a lit pane: warm glow you still see the room through (night windows)
//   KGLASS.SPEC.frosted   a privacy pane (bath houses, offices): light through, no view
//   KGLASS.SPEC.smoked    the Ancients' tinted curtain wall: dark, glossy, half the view
//   KGLASS.SPEC.stained   a coloured pane (temples, guild halls): the tint is the caller's (opt.color)
//   KGLASS.SPEC.room      the room's back seen through glass on a solid body (a dim plaster card, opaque): not glass,
//                         but the one thing a pane on a body with no interior needs behind it, so it lives here
//   KGLASS.material(THREE, kind, opt)   a shared material (cached by kind, opt.color and opt.emissive); opt.color overrides the
//                                       colour, opt.emissive the glow's colour (a lit kind: an electric lamp's cool light, not a flame's)
//   KGLASS.kinds()                      the kind names
//   KGLASS.pane(kind)                   {transparent, depthWrite, side} a host needs to sort the pane after the opaque scene
(function(root){
  var SPEC={
    clear:  {color:0xb4ccd2,opacity:.22,roughness:.05,metalness:.1,emissive:0x000000,glow:0,transparent:true},
    lit:    {color:0xffd9a0,opacity:.42,roughness:.3,metalness:0,emissive:0xffb060,glow:.55,transparent:true},
    frosted:{color:0xdfe7ea,opacity:.62,roughness:.75,metalness:0,emissive:0x000000,glow:0,transparent:true},
    smoked: {color:0x2a3a44,opacity:.55,roughness:.04,metalness:.35,emissive:0x000000,glow:0,transparent:true},
    stained:{color:0x8a3a5a,opacity:.5,roughness:.2,metalness:0,emissive:0x000000,glow:.15,transparent:true},
    room:   {color:0x6e5a46,opacity:1,roughness:.94,metalness:0,emissive:0x000000,glow:0,transparent:false,srgb:true}
  };
  var cache=new Map();
  function material(T,kind,opt){
    var S=SPEC[kind];if(!S)throw new Error('KGLASS.material: no kind '+kind);
    opt=opt||{};var col=opt.color==null?S.color:opt.color,em=opt.emissive==null?(S.emissive===0?col:S.emissive):opt.emissive,k=kind+':'+col+':'+em;
    var c=cache.get(T);if(!c){c=new Map();cache.set(T,c);}
    var m=c.get(k);if(m)return m;
    m=new T.MeshStandardMaterial({color:col,roughness:S.roughness,metalness:S.metalness,side:S.transparent?T.DoubleSide:T.FrontSide});
    if(S.srgb&&m.color.convertSRGBToLinear)m.color.convertSRGBToLinear();   // the card's hex is an sRGB colour (as vC and hc take one): r128 reads a material's hex as linear, which drew the dim card light beige
    if(S.transparent){m.transparent=true;m.opacity=S.opacity;m.depthWrite=false;}
    if(S.glow){m.emissive=new T.Color(em);m.emissiveIntensity=S.glow;}
    m.name='kglass:'+kind;m.userData.kglass=kind;
    c.set(k,m);return m;}
  root.KGLASS={SPEC:SPEC,material:material,kinds:function(){return Object.keys(SPEC);},
    pane:function(kind){var S=SPEC[kind];return{transparent:!!S.transparent,depthWrite:!S.transparent,side:S.transparent?'double':'front'};}};
})(typeof window!=='undefined'?window:globalThis);
