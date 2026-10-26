// ================================================================= CORE — the ground shader (KGROUND: height-blended layers, hex tiling, distance scale)
// DETAIL-RESEARCH.md item 1 (2026-10-26, the final rebuild's R4). Every biome draws its ground with its own host shader
// (biomes/*/src/45-host-stage.js, 47-host-land.js, 84-host-ground.js): a painted macro map, a detail multiply, and the
// material library's layers mixed in by zone weights, each page with its own anti-tiling trick. This module is the
// layers' part of that, one copy: a page keeps its paint, its zone weights (its attributes and varyings) and its own
// terms (strata, granite bands, cracks), and hands KGROUND the layers. Each layer is
//   - sampled with Mikkelsen's hex tiling (JCGT 11(3) 2022, "Practical Real-Time Hex-Tiling"): three offset and turned
//     copies on a triangle grid, blended by the barycentrics sharpened by each sample's luminance, so no repeat shows;
//   - scaled with distance: past o.far.d (60 m) its tile doubles at each doubling of the distance, two scales
//     cross-faded, so far ground keeps a grain and shows no grid (up to o.far.levels doublings);
//   - blended by HEIGHT: each layer's own height (its luminance about its mean, or its alpha) against the height of what
//     is under it, "the highest wins, blend near ties" (a height lerp of contrast o.blend), so pebbles and tufts stand
//     through moss at an edge instead of a smear. o.blend 0 is the plain mix the pages had.
// The library's sets come through KMAT (KGROUND.layer(build, slot): the page's materials.json slot, packed by
// tools/textures/pack.py); a page without its pack gets no layer, and its ground is its paint alone, as before.
//
//   KGROUND.layer(build, slot, o)  {map, k (1 / the slot's scale), ...o} from the page's pack, or null
//   KGROUND.hook(mat, o)  wraps mat.onBeforeCompile (the page's hook first) and adds the layers where the page's fragment
//        shader has the marker o.at ('/*KGROUND*/'; without it, just after #include <map_fragment>). o:
//        layers [{map, k, w (a GLSL float: the layer's weight, 0..1, from the page's varyings), amt (1: its most),
//                 gain (1), tint (a GLSL vec3: 'diffuse' is the material colour; default vec3(1.0)), lin (true: the map
//                 is sRGB, decoded by pow 2.2 as the pages do for a custom sampler), h ({from: 'lum'|'a', contrast 1.6}),
//                 name}]; null entries are skipped
//        blend (.18), hex ({rot: .6, contrast: .6, exp: 7} or false), far ({d: 60, levels: 3} or false),
//        baseH (a GLSL float: the height of the paint under the first layer, '0.5'), key (the program key's part)
//        -> mat. mat.userData.kground holds the layers drawn (their names) for the inspector and the export
//   KGROUND.glsl(o)  the GLSL library alone (kgSample, kgHL, ...), for a page that writes its own blend
//   KGROUND.fn       the JS twins of the GLSL (tri, hash, heightLerp, lod), for tests and for Godot's port
//
// Godot: ground.gdshader with the same layers as uniforms and the same functions (the godotshaders hex-tiling port, MIT,
// is the same algorithm); core/terrain/README.md, "Godot".
(function(root){
  // ---------------------------------------------------------------- the JS twins (the GLSL below says the same)
  function fract(v){return v-Math.floor(v);}
  // a hash without sine (Hoskins' hash22): the hex cell's offset
  function hash(px,py){var x=fract(px*.1031),y=fract(py*.1030),z=fract(px*.0973),d=x*(y+33.33)+y*(z+33.33)+z*(x+33.33);x+=d;y+=d;z+=d;return [fract((x+y)*z),fract((x+z)*y)];}
  // the triangle grid: barycentric weights and the three vertices (integer lattice) round st
  function tri(sx,sy){sx*=3.4641016;sy*=3.4641016;var kx=sx-.57735027*sy,ky=1.15470054*sy,bx=Math.floor(kx),by=Math.floor(ky),tx=kx-bx,ty=ky-by,tz=1-tx-ty,s=tz<0?1:0,s2=2*s-1;
    return {w:[-tz*s2,s-ty*s2,s-tx*s2],v:[[bx+s,by+s],[bx+s,by+1-s],[bx+1-s,by+s]]};}
  // the height lerp: t toward the layer, h1 the height under it, h2 the layer's, c the contrast (0: a plain mix)
  function heightLerp(t,h1,h2,c){if(t<=0)return 0;if(c<=0)return t;var a=h1*(1-t),b=h2*t,m=Math.max(a,b)-c;a=Math.max(a-m,0);b=Math.max(b-m,0);return b/Math.max(a+b,1e-5);}
  // the distance scale: the level (continuous) at a distance; tile size 2^floor, cross-faded by the fraction
  function lod(d,d0,levels){if(!(d0>0))return 0;return Math.min(levels,Math.max(0,Math.log2(Math.max(d/d0,1))));}

  // ---------------------------------------------------------------- the GLSL library
  function glsl(o){o=o||{};var hx=o.hex===false?null:(o.hex||{}),rot=hx?(hx.rot==null?.6:hx.rot):0,con=hx?(hx.contrast==null?.6:hx.contrast):0,ex=hx?(hx.exp==null?7:hx.exp):1;
    var f=function(v){return (+v).toFixed(4);};
    return ['#if __VERSION__ >= 300',
      '#define KG_GRAD(t,p,dx,dy) textureGrad(t,p,dx,dy)','#define KG_LOD(t,p,l) textureLod(t,p,l)',
      '#else','#define KG_GRAD(t,p,dx,dy) texture2D(t,p)','#define KG_LOD(t,p,l) vec4(0.5)','#endif',
      'vec2 kgHash(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}',
      'void kgTri(vec2 st,out vec3 w,out vec2 v1,out vec2 v2,out vec2 v3){st*=3.4641016;vec2 sk=vec2(st.x-0.57735027*st.y,1.15470054*st.y);',
      ' vec2 b=floor(sk);vec3 t=vec3(fract(sk),0.0);t.z=1.0-t.x-t.y;float s=step(0.0,-t.z),s2=2.0*s-1.0;',
      ' w=vec3(-t.z*s2,s-t.y*s2,s-t.x*s2);v1=b+vec2(s,s);v2=b+vec2(s,1.0-s);v3=b+vec2(1.0-s,s);}',
      /* the turn of a hex cell, from its integer vertex (no sine hash): Mikkelsen's LoadRot2x2 */
      'mat2 kgRot(vec2 v){float a=abs(v.x*v.y)+abs(v.x+v.y)+3.14159265;a=mod(a,6.2831853);if(a>3.14159265)a-=6.2831853;a*='+f(rot)+';float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}',
      'vec2 kgCen(vec2 v){return vec2(v.x+0.5*v.y,v.y*0.8660254)/3.4641016;}',
      'vec4 kgHex(sampler2D t,vec2 st,vec2 dx,vec2 dy){'+(hx?
        'vec3 w;vec2 v1,v2,v3;kgTri(st,w,v1,v2,v3);mat2 r1=kgRot(v1),r2=kgRot(v2),r3=kgRot(v3);vec2 c1=kgCen(v1),c2=kgCen(v2),c3=kgCen(v3);'+
        'vec4 a=KG_GRAD(t,r1*(st-c1)+c1+kgHash(v1),r1*dx,r1*dy),b=KG_GRAD(t,r2*(st-c2)+c2+kgHash(v2),r2*dx,r2*dy),c=KG_GRAD(t,r3*(st-c3)+c3+kgHash(v3),r3*dx,r3*dy);'+
        'vec3 L=vec3(0.299,0.587,0.114),D=mix(vec3(1.0),vec3(dot(a.rgb,L),dot(b.rgb,L),dot(c.rgb,L)),'+f(con)+');vec3 W=D*pow(max(w,vec3(0.0)),vec3('+f(ex)+'));W/=max(W.x+W.y+W.z,1e-5);'+
        'return W.x*a+W.y*b+W.z*c;}':'return KG_GRAD(t,st,dx,dy);}'),
      /* the distance scale: lv the continuous level (KGROUND.fn.lod); two scales cross-faded */
      'vec4 kgSample(sampler2D t,vec2 st,vec2 dx,vec2 dy,float lv){float l0=floor(lv),fr=lv-l0,s0=exp2(-l0);vec4 c=kgHex(t,st*s0,dx*s0,dy*s0);',
      ' if(fr>0.002){float s1=s0*0.5;c=mix(c,kgHex(t,st*s1,dx*s1,dy*s1),smoothstep(0.0,1.0,fr));}return c;}',
      'float kgHL(float t,float h1,float h2,float c){if(t<=0.0)return 0.0;if(c<=0.0)return t;float a=h1*(1.0-t),b=h2*t,m=max(a,b)-c;a=max(a-m,0.0);b=max(b-m,0.0);return b/max(a+b,1e-5);}',
      'float kgLum(vec3 c){return dot(c,vec3(0.299,0.587,0.114));}'].join('\n')+'\n';}

  // ---------------------------------------------------------------- the library's sets, through KMAT
  function layer(build,slot,o){var K=root.KMAT;if(!K||K.mode!=='lib'||!K.packed)return null;var L=K.packed(build,slot);if(!L)return null;
    var out={map:K.textures(L,{aniso:8}).map,k:1/(L.scale&&L.scale[0]?L.scale[0]:1),name:slot};if(o)for(var q in o)out[q]=o[q];return out;}

  // ---------------------------------------------------------------- the hook
  function code(o,LY){var far=o.far===false?null:(o.far||{}),d0=far?(far.d==null?60:far.d):0,lv=far?(far.levels==null?3:far.levels):0,bl=o.blend==null?.18:o.blend,f=function(v){return (+v).toFixed(4);};
    var s=['{vec3 kgDx=dFdx(kgWP),kgDy=dFdy(kgWP);float kgD=length(kgWP-cameraPosition);',
      ' float kgLv='+(far?'min('+f(lv)+',max(0.0,log2(max(kgD/'+f(d0)+',1.0))))':'0.0')+';float kgHc='+(o.baseH||'0.5')+';'];
    LY.forEach(function(L,i){var h=L.h||{},from=h.from||'lum',hc=h.contrast==null?1.6:h.contrast,k=f(L.k);
      s.push(' {vec4 kgT=kgSample(uKG'+i+',kgWP.xz*'+k+',kgDx.xz*'+k+',kgDy.xz*'+k+',kgLv);'+
        'vec3 kgC='+(L.lin===false?'kgT.rgb':'pow(kgT.rgb,vec3(2.2))')+'*('+(L.tint||'vec3(1.0)')+')*'+f(L.gain==null?1:L.gain)+';'+
        'float kgH='+(from==='a'?'kgT.a':'clamp(0.5+(kgLum(kgT.rgb)-kgLum(KG_LOD(uKG'+i+',vec2(0.5),16.0).rgb))*'+f(hc)+',0.02,1.0)')+';'+
        'float kgA=kgHL(clamp('+L.w+',0.0,1.0)*'+f(L.amt==null?1:L.amt)+',kgHc,kgH,'+f(bl)+');'+
        'diffuseColor.rgb=mix(diffuseColor.rgb,kgC,kgA);kgHc=mix(kgHc,kgH,kgA);}');});
    s.push('}');return s.join('\n');}
  function hook(mat,o){o=o||{};var LY=(o.layers||[]).filter(function(L){return L&&L.map;});if(!mat)return mat;
    mat.userData.kground=LY.map(function(L){return L.name||'layer';});if(!LY.length)return mat;
    var T=root.THREE,prev=mat.onBeforeCompile,at=o.at||'/*KGROUND*/',lib=glsl(o),body=code(o,LY);
    mat.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);LY.forEach(function(L,i){sh.uniforms['uKG'+i]={value:L.map};});
      var wp='vec4 kgW4=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nkgW4=instanceMatrix*kgW4;\n#endif\nkgWP=(modelMatrix*kgW4).xyz;\n';
      sh.vertexShader='varying vec3 kgWP;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n'+wp);
      var dec='varying vec3 kgWP;\n'+LY.map(function(L,i){return 'uniform sampler2D uKG'+i+';';}).join('')+'\n'+lib;
      var fs=sh.fragmentShader.replace('void main() {',dec+'void main() {');
      fs=fs.indexOf(at)>=0?fs.replace(at,body):fs.replace('#include <map_fragment>','#include <map_fragment>\n'+body);
      sh.fragmentShader=fs;};
    var own=mat.customProgramCacheKey!==T.Material.prototype.customProgramCacheKey?mat.customProgramCacheKey:null,src=prev?prev.toString():'',key='|kground-'+(o.key||'')+'-'+LY.length+'-'+body.length;
    mat.customProgramCacheKey=function(){return (own?own.call(this):src)+key;};mat.needsUpdate=true;return mat;}
  root.KGROUND={layer:layer,hook:hook,glsl:glsl,code:code,fn:{hash:hash,tri:tri,heightLerp:heightLerp,lod:lod}};
})(typeof globalThis!=='undefined'?globalThis:this);
