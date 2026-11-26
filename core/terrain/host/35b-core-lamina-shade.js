// ================================================================= CORE — lamina, the three.js half (KSTRATA.laminaShade)  [G shader]
// The bake of a lamina column (35b-core-lamina.js: load it, 35-core-strata.js and core/rand first) as an RGBA8 data texture,
// and laminaColor(depth, px) in GLSL: the band colour from the texel, the day's couplets drawn from its thickness and faded
// out where a pixel spans more than a couplet, so a pipe's rings read as bands from afar and as couplets close to. L.shade
// is its twin in JS (in sRGB; this returns linear). The couplets' phase is depth over their thickness, not the walk's count:
// what the eye sees agrees with L.at to within a couplet, and the inspector reads L.at.
//
//   const S = KSTRATA.laminaShade(L, {THREE, res (.01) | bake})  -> {texture, uniforms {uLamTex, uLamP, uLamQ}, glsl, bake}
//   A material adds S.uniforms to its own, S.glsl above main() of its fragment shader, and calls
//   laminaColor(depth, fwidth(depth)) with depth = L.H minus the fragment's height over the pipe's foot along its axis
//   (an instanced pipe: its local y, passed as a varying). Godot: the same bytes as an Image, the function in a .gdshaderinc.
(function(root){
  'use strict';
  var KS=root.KSTRATA;
  if(!KS||!KS.lamina)throw new Error('core/terrain host/35b-core-lamina-shade.js: load 35b-core-lamina.js first (KSTRATA.lamina)');
  var GLSL='uniform sampler2D uLamTex;uniform vec4 uLamP;uniform vec2 uLamQ;\n'+
    '/* uLamP: (4 rate, W, rows, res), uLamQ: (half, H). depth m from the lip, px m a pixel spans: linear colour */\n'+
    'vec3 laminaColor(float depth,float px){float k=clamp(floor(depth/uLamP.w),0.0,uLamP.y*uLamP.z-1.0);float row=floor(k/uLamP.y);float col=k-row*uLamP.y;'+
    'vec4 tx=texture2D(uLamTex,vec2((col+0.5)/uLamP.y,(row+0.5)/uLamP.z));vec3 c=tx.rgb;float t=tx.a*uLamP.x;'+
    'if(t>0.0){float f=fract(depth/t);float cn=0.35*(1.0-smoothstep(0.35,1.0,px/t));c=min(c*(1.0+cn*(f<uLamQ.x?1.0:-1.0)),vec3(1.0));}'+
    'return pow(c,vec3(2.2));}\n';
  function laminaShade(L,o){o=o||{};var T=o.THREE||root.THREE;if(!T)throw new Error('KSTRATA.laminaShade: needs THREE (o.THREE or a global)');
    var B=o.bake||L.bake({res:o.res});
    var tex=new T.DataTexture(B.data,B.W,B.rows,T.RGBAFormat);tex.magFilter=T.NearestFilter;tex.minFilter=T.NearestFilter;tex.generateMipmaps=false;
    tex.wrapS=T.ClampToEdgeWrapping;tex.wrapT=T.ClampToEdgeWrapping;tex.needsUpdate=true;
    return {texture:tex,bake:B,glsl:GLSL,uniforms:{uLamTex:{value:tex},uLamP:{value:new T.Vector4(B.rate*4,B.W,B.rows,B.res)},uLamQ:{value:new T.Vector2(B.half,B.H)}}};}
  KS.laminaShade=laminaShade;KS.LAMINA_GLSL=GLSL;
})(typeof window!=='undefined'?window:globalThis);
