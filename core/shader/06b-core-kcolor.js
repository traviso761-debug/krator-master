/* core/shader/06b-core-kcolor.js — KCOLOR: colour space and exposure in one place (CORE-IMPROVEMENTS.md item 9a; README.md here).
   three r128 converts nothing for you. A colour written as a display hex ('#a8382a', 0xa8382a, [r, g, b] in 0..1 as a colour
   picker shows it) is sRGB; three's lights, fog, material colours and a shader's arithmetic are LINEAR. A display hex used as
   linear reads pale (k-guilin's near-white Lambert, eastabyss's white plume halo); a texture sampled raw in a hook reads pale
   (Farside's wrack). KCOLOR says which is which once.

   THE CONVENTION: a number, a '#hex' string, an [r, g, b] array or {r, g, b} is DISPLAY (sRGB) unless o.linear says otherwise;
   a THREE.Color (isColor) is already LINEAR (three's working space). Pure functions (no three.js, no DOM) except lin's out.
     KCOLOR.toLin(c) / KCOLOR.toSRGB(c)     one channel (0..1), the exact sRGB curve (three's SRGBToLinear / LinearToSRGB)
     KCOLOR.rgb(x) -> [r, g, b]              the channels as written, no conversion
     KCOLOR.linArr(x, o) -> [r, g, b]         linear; o.linear: x is linear already
     KCOLOR.lin(x, out, o) -> out             linear into a THREE.Color (out, or a new one from THREE): `KCOLOR.lin('#a8382a')`
     KCOLOR.mix(a, b, t, o) -> [r, g, b]      mixed in LINEAR light (a tint field's blend), linear out
     KCOLOR.hex(lin) -> 0xrrggbb               a linear colour back to a display hex
     KCOLOR.lum(lin) -> Y                      relative luminance (Rec. 709) of a linear colour
     KCOLOR.vec3(x, o) -> 'vec3(r,g,b)'        a GLSL literal, linear (KHOOK.glf's numbers when the page has KHOOK)
   GLSL (KCOLOR.GLSL, guarded, any stage): vec3 srgbToLinear(vec3), vec3 linearToSrgb(vec3), vec4 sampleSRGB(sampler2D, vec2)
     (a colour texture read in a hook), vec3 gamma22ToLinear(vec3) (the pow(c, 2.2) many pages were tuned with: same look,
     named). KCOLOR.include(sh) puts it at the head of both stages once.
   The renderer: KCOLOR.output(renderer, {exposure, tone}) sets sRGB output and the tone mapping (ACES unless tone says
   'linear' | 'reinhard' | 'cineon' | 'none'); KCOLOR.exposure(renderer, e) (the shared sky's hourly exposure);
   KCOLOR.report(renderer) -> {output, tone, exposure} for a verify view. */
(function(root){'use strict';
 var C={};
C.toLin=function(c){return c<0.04045?c*0.0773993808:Math.pow(c*0.9478672986+0.0521327014,2.4);};
C.toSRGB=function(c){return c<0.0031308?c*12.92:1.055*Math.pow(c,0.41666)-0.055;};
C.rgb=function(x){if(x==null)throw new Error('KCOLOR: no colour');
 if(typeof x==='number')return[((x>>16)&255)/255,((x>>8)&255)/255,(x&255)/255];
 if(typeof x==='string'){var s=x.trim().replace(/^#|^0x/i,'');if(s.length===3)s=s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
  if(!/^[0-9a-f]{6}$/i.test(s))throw new Error('KCOLOR: not a hex colour: '+x);return C.rgb(parseInt(s,16));}
 if(Array.isArray(x))return[+x[0],+x[1],+x[2]];
 if(typeof x.r==='number')return[x.r,x.g,x.b];
 throw new Error('KCOLOR: not a colour: '+x);};
C.linArr=function(x,o){var c=C.rgb(x);return (o&&o.linear)||(x&&x.isColor)?c:[C.toLin(c[0]),C.toLin(c[1]),C.toLin(c[2])];};
C.lin=function(x,out,o){var c=C.linArr(x,o);if(!out){var T=root.THREE;out=T&&T.Color?new T.Color():{};}
 if(out.setRGB)out.setRGB(c[0],c[1],c[2]);else{out.r=c[0];out.g=c[1];out.b=c[2];}return out;};
C.mix=function(a,b,t,o){var p=C.linArr(a,o),q=C.linArr(b,o);return[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];};
C.hex=function(l){var c=C.rgb(l),b=function(v){return Math.max(0,Math.min(255,Math.round(C.toSRGB(Math.max(0,Math.min(1,v)))*255)));};return(b(c[0])<<16)|(b(c[1])<<8)|b(c[2]);};
C.lum=function(l){var c=C.rgb(l);return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];};
C.vec3=function(x,o){var c=C.linArr(x,o),K=root.KHOOK,f=K?K.glf:function(v){var s=String(+v);return/[.e]/.test(s)?s:s+'.0';};return'vec3('+c.map(function(v){return f(v);}).join(',')+')';};
C.GLSL='#ifndef KCOLOR_GLSL\n#define KCOLOR_GLSL\n'+
 'vec3 srgbToLinear(vec3 c){return mix(c*0.0773993808,pow(c*0.9478672986+0.0521327014,vec3(2.4)),step(vec3(0.04045),c));}\n'+
 'vec3 linearToSrgb(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.0)),vec3(0.41666))-0.055,step(vec3(0.0031308),c));}\n'+
 'vec4 sampleSRGB(sampler2D t,vec2 uv){vec4 s=texture2D(t,uv);return vec4(srgbToLinear(s.rgb),s.a);}\n'+
 'vec3 gamma22ToLinear(vec3 c){return pow(c,vec3(2.2));}\n#endif\n';
C.include=function(sh){if(sh.vertexShader.indexOf('#define KCOLOR_GLSL')<0)sh.vertexShader=C.GLSL+sh.vertexShader;if(sh.fragmentShader.indexOf('#define KCOLOR_GLSL')<0)sh.fragmentShader=C.GLSL+sh.fragmentShader;return sh;};
// the renderer
 var TONES={aces:'ACESFilmicToneMapping',linear:'LinearToneMapping',reinhard:'ReinhardToneMapping',cineon:'CineonToneMapping',none:'NoToneMapping'};
C.output=function(r,o){o=o||{};var T=root.THREE;if(!r||!T)return r;r.outputEncoding=T.sRGBEncoding;
 var t=TONES[(o.tone||'aces').toLowerCase()];if(!t)throw new Error('KCOLOR.output: no tone mapping '+o.tone);r.toneMapping=T[t];
 if(o.exposure!=null)C.exposure(r,o.exposure);return r;};
C.exposure=function(r,e){if(r&&typeof e==='number'&&isFinite(e))r.toneMappingExposure=e;return r;};
C.report=function(r){var T=root.THREE||{},tone='?';for(var k in TONES)if(T[TONES[k]]===r.toneMapping)tone=k;
 return{output:r.outputEncoding===T.sRGBEncoding?'sRGB':'linear',tone:tone,exposure:r.toneMappingExposure};};
root.KCOLOR=C;
})(typeof window!=='undefined'?window:globalThis);
