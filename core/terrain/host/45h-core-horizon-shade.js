// ================================================================= CORE — horizon shading on a three.js page (KHORIZON.shade, .uniforms, .glsl)
// The run-time half of core/terrain/45-core-horizon.js: the two RGBA8 maps as textures, one shared set of uniforms, and a
// hook any ground, rock or plant material takes (KHORIZON.shade) so the sun's direct light is cut where the terrain's
// horizon stands above it, and the ambient where little sky is seen. Per pixel on a standard material and on a Lambert
// one (r128 lights Lambert per vertex; the cut is applied to its direct term in the fragment). Works on instanced meshes
// (the instance's world position). The sun is the shared sky's (ATMOS.skyUniforms.uSunDir, the object core/atmos moves
// each frame) when the page has it, else the page's first directional light.
//
//   KHORIZON.textures(Hz)        {A, B}: DataTextures of the bake (linear, no mipmaps, clamped)
//   KHORIZON.uniforms(Hz, o)     the shared uniforms (made once per bake): uKHzA, uKHzB, uKHzBox, uKHzSun, uKHzK
//                                (soft, shade strength, sky strength); o.soft (.035), o.shade (1), o.sky (.85)
//   KHORIZON.glsl()              the GLSL: khzShadow(worldPos, sunDir) and khzSky(worldPos) (0..1), for a material that
//                                writes its own shading (a foliage hook): declare it, bind KHORIZON.uniforms
//   KHORIZON.shade(mat, Hz, o)   the hook: wraps mat.onBeforeCompile (the page's own hook runs first) and keys the program;
//                                o.shade, o.sky (strengths; 0 leaves that term alone). Returns mat
//
// Godot: the two maps as ImageTextures (FORMAT_RGBA8), the same chunk as a .gdshaderinc called in light() on DIFFUSE_LIGHT
// and ATTENUATION, the sky term on AMBIENT_LIGHT (core/terrain/README.md, "Godot").
(function(root){
  var K=root.KHORIZON;if(!K)return;
  function textures(Hz){if(Hz._tex)return Hz._tex;var T=root.THREE;
    var mk=function(a){var t=new T.DataTexture(a,Hz.n,Hz.n,T.RGBAFormat,T.UnsignedByteType);t.magFilter=T.LinearFilter;t.minFilter=T.LinearFilter;t.generateMipmaps=false;
      t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.flipY=false;t.needsUpdate=true;return t;};
    Hz._tex={A:mk(Hz.A),B:mk(Hz.B)};return Hz._tex;}
  function uniforms(Hz,o){o=o||{};if(Hz._u){if(o.soft!=null)Hz._u.uKHzK.value.x=o.soft;if(o.shade!=null)Hz._u.uKHzK.value.y=o.shade;if(o.sky!=null)Hz._u.uKHzK.value.z=o.sky;return Hz._u;}
    var T=root.THREE,tx=textures(Hz),b=Hz.box,A=root.ATMOS&&root.ATMOS.skyUniforms&&root.ATMOS.skyUniforms.uSunDir;
    Hz._u={uKHzA:{value:tx.A},uKHzB:{value:tx.B},uKHzBox:{value:new T.Vector4(b[0],b[1],1/(b[2]-b[0]),1/(b[3]-b[1]))},
      uKHzSun:A||{value:new T.Vector3(0,1,0)},uKHzK:{value:new T.Vector3(o.soft==null?.035:o.soft,o.shade==null?1:o.shade,o.sky==null?.85:o.sky)}};
    return Hz._u;}
  function glsl(){return ['uniform sampler2D uKHzA,uKHzB;uniform vec4 uKHzBox;uniform vec3 uKHzSun;uniform vec3 uKHzK;',
    'vec2 khzUV(vec3 p){return (p.xz-uKHzBox.xy)*uKHzBox.zw;}',
    'float khzIn(vec2 uv){return step(0.0,uv.x)*step(0.0,uv.y)*step(uv.x,1.0)*step(uv.y,1.0);}',
    'float khzPick(vec4 a,vec4 b,float q){return dot(a,vec4(equal(vec4(q),vec4(0.0,1.0,2.0,3.0))))+dot(b,vec4(equal(vec4(q),vec4(4.0,5.0,6.0,7.0))));}',
    'float khzShadow(vec3 p,vec3 L){vec2 uv=khzUV(p);if(khzIn(uv)<0.5||uKHzK.y<=0.0)return 1.0;vec4 a=texture2D(uKHzA,uv),b=texture2D(uKHzB,uv);',
    ' float f=mod(atan(L.z,L.x)*1.2732395+8.0,8.0),q0=floor(f),t=f-q0;float h=mix(khzPick(a,b,q0),khzPick(a,b,mod(q0+1.0,8.0)),t);',
    ' float sy=L.y/max(length(L),1e-5);return mix(1.0,smoothstep(h-uKHzK.x,h+uKHzK.x,sy),uKHzK.y*smoothstep(-0.06,0.0,sy));}',
    'float khzSky(vec3 p){vec2 uv=khzUV(p);if(khzIn(uv)<0.5||uKHzK.z<=0.0)return 1.0;float v=1.0-dot(texture2D(uKHzA,uv)+texture2D(uKHzB,uv),vec4(0.125));return mix(1.0,v,uKHzK.z);}'].join('\n')+'\n';}
  function shade(mat,Hz,o){if(!mat||!Hz)return mat;o=o||{};var T=root.THREE,U=uniforms(Hz,o),prev=mat.onBeforeCompile,atm=function(){return root.ATMOS&&root.ATMOS.skyUniforms&&root.ATMOS.skyUniforms.uSunDir;};
    {var dsc=Object.getOwnPropertyDescriptor(mat,'onBeforeCompile');if(dsc&&dsc.get)return mat;}   /* a snow-wearing material (fx snowcover) keeps its hook behind a setter: leave it, as ATMOS.cloudShade does */
    var sk=o.sky==null?null:o.sky,sh0=o.shade==null?null:o.shade;
    mat.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);for(var k in U)sh.uniforms[k]=U[k];var A=atm(),shared=!!A;if(A)sh.uniforms.uKHzSun=A;   /* the shared sky's sun, read when the program is made (the sky is bound after the ground) */
      if(sh0!=null||sk!=null)sh.uniforms.uKHzK={value:new T.Vector3(U.uKHzK.value.x,sh0==null?U.uKHzK.value.y:sh0,sk==null?U.uKHzK.value.z:sk)};
      var wp='vec4 khzW=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nkhzW=instanceMatrix*khzW;\n#endif\nvKhzWP=(modelMatrix*khzW).xyz;\n';
      sh.vertexShader='varying vec3 vKhzWP;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n'+wp);
      var sun=shared?'uKHzSun':'khzSunDir()',fn=shared?'':'vec3 khzSunDir(){\n#if NUM_DIR_LIGHTS > 0\nreturn normalize((vec4(directionalLights[0].direction,0.0)*viewMatrix).xyz);\n#else\nreturn vec3(0.0,1.0,0.0);\n#endif\n}\n';
      sh.fragmentShader='varying vec3 vKhzWP;\n'+glsl()+sh.fragmentShader.replace('#include <aomap_fragment>',
        '{float khzS=khzShadow(vKhzWP,'+sun+');reflectedLight.directDiffuse*=khzS;reflectedLight.directSpecular*=khzS;reflectedLight.indirectDiffuse*=khzSky(vKhzWP);}\n#include <aomap_fragment>');
      if(fn)sh.fragmentShader=sh.fragmentShader.replace('void main() {',fn+'void main() {');};
    var own=mat.customProgramCacheKey!==T.Material.prototype.customProgramCacheKey?mat.customProgramCacheKey:null,src=prev?prev.toString():'';
    mat.customProgramCacheKey=function(){return (own?own.call(this):src)+'|khorizon'+(atm()?'s':'l');};mat.needsUpdate=true;return mat;}
  K.textures=textures;K.uniforms=uniforms;K.glsl=glsl;K.shade=shade;
})(typeof globalThis!=='undefined'?globalThis:this);
