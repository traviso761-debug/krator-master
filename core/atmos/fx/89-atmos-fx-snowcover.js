// ================================================================= ATMOS — fx: snow that lies (accumulation and melt)
// [G data] + [G shader] (the owner, 2026-10-25: "an atmos module for snow and snow accumulation, esp. for the glacier and other cold
// biomes"). core/atmos's weather already makes snow FALL (4-weather, o.snow: 'snowfall', 'blizzard', W.snow); this makes it LIE:
//   THE STATE   ATMOS.snowStep(S, W, dt, hour): S.depth (0..1) builds while it snows (at PRESETS.snowcover.rate a second times
//               W.snow) and melts while it does not (PRESETS.snowcover.melt, slower at night, none below freezing if the host
//               says so: o.frozen). A pure step, as the weather's own: Godot ports it line for line. The host's base cover
//               (o.base: snow that is always there, the glacier's accumulation zone) is added on top of it in the shader.
//   THE LOOK    ATMOS.snowOn(material, o): any Lambert / Phong / Standard material (ground, rock, bark, leaf cards, a build's own
//               hooks kept: it wraps them, as core/water's wetGround does) turns white where the snow holds: on up-facing
//               surfaces first (the normal's y past PRESETS.snowcover.up), patchy at the edges (an integer-hash noise in world
//               metres, never sin), drifting deeper with the depth until only steep faces show through; above a snow line
//               (o.line [y0, y1]: none below y0, full above y1) when one is given. Standard materials get the snow's
//               roughness. o.aN: a leaf card lit by the biome core's bent normal (attribute aN, declared by BIO.leafMat's hook) holds
//               snow by that normal, so a crown whitens on top. A ShaderMaterial of a build's own takes ATMOS.snowGLSL() and mixes atmSnow(...) itself.
//   ATMOS.snowCover(o)    the binding: o {base (0..1, default 0), line [y0, y1], frozen (true: no melt by day: a glacier's air),
//               depth (the starting depth, 0..1)} -> S {depth}; it steps on the module clock from the weather (A.W) and feeds
//               the uniform atmSnowDepth (A.U.snowDepth) every snowOn material reads. Recorded as {type:'snowcover', ...}.
// In the SUBFOLDER core/atmos/fx/ on purpose (builds that pool core/atmos's top level are unchanged): a build lists it by path.
// Needs 89-atmos-0-core.js (ATMOS.init) and, for the weather to drive it, 89-atmos-4-weather.js with o.snow; without the
// weather the depth stays where o.depth set it (a page can set S.depth itself: a winter view). GLSL ES 3 (uint): three r128 on WebGL2.
(function(){const A=ATMOS;
 A.PRESETS.snowcover=A.PRESETS.snowcover||{
  rate:1/420,          // depth a second in a blizzard (W.snow 1): bare to full in seven minutes; a snowfall (W.snow .4) in about eighteen
  melt:1/1500,         // depth a second melting by day with no snow falling; at night times nightMelt
  nightMelt:.15,
  up:[.45,.92],        // the normal's y where fresh snow starts to hold, and where a full depth covers it
  noise:{cell:3.2,amp:.32},   // the patches at the edge (m, share of the threshold)
  colour:[.92,.94,.97],shade:[.80,.86,.95],   // snow in the light and in its own hollows (linear)
  roughness:.82};
 const f=v=>A.glf(v),v3=c=>'vec3('+c.map(f).join(',')+')';
 // THE STEP: [G data], pure
 A.snowStep=(S,W,dt,hour)=>{const P=A.PRESETS.snowcover,s=W&&W.snow||0,night=hour!=null&&(hour<6||hour>19);
  let d=S.depth+P.rate*s*dt;if(!S.frozen&&s<.05)d-=P.melt*(night?P.nightMelt:1)*dt;S.depth=d<0?0:d>1?1:d;return S;};
 // THE CHUNK: atmSnow(world position, world normal) -> how much snow covers the point (0..1)
 A.snowGLSL=()=>{const P=A.PRESETS.snowcover;return[
  'uniform float atmSnowDepth;uniform float atmSnowBase;uniform vec2 atmSnowLine;',
  'uint atmSnowHashU(uvec2 c){uint h=(c.x*1597334677u)^(c.y*3812015801u);h^=h>>16u;h*=2146121005u;h^=h>>15u;h*=2221713035u;h^=h>>16u;return h;}',
  'float atmSnowH(vec2 p){return float(atmSnowHashU(uvec2(ivec2(floor(p))+ivec2(1<<20)))&65535u)/65535.0;}',
  'float atmSnowN(vec2 p){vec2 i=floor(p),q=p-i;q=q*q*(3.0-2.0*q);return mix(mix(atmSnowH(i),atmSnowH(i+vec2(1,0)),q.x),mix(atmSnowH(i+vec2(0,1)),atmSnowH(i+vec2(1,1)),q.x),q.y);}',
  'float atmSnow(vec3 wp,vec3 wn){float k=clamp(atmSnowDepth+atmSnowBase,0.0,1.0);if(k<=0.0)return 0.0;',
  ' float line=atmSnowLine.y>atmSnowLine.x?smoothstep(atmSnowLine.x,atmSnowLine.y,wp.y):1.0;',
  ' float n=0.65*atmSnowN(wp.xz/'+f(P.noise.cell)+')+0.35*atmSnowN(wp.xz/'+f(P.noise.cell*.31)+'+17.0);',
  ' float hold=mix('+f(P.up[1])+','+f(P.up[0]-.2)+',k)+'+f(P.noise.amp)+'*(n-0.5);',   // the deeper the snow, the steeper the faces it holds on (a cliff past ~75 degrees stays bare)
  ' return line*smoothstep(hold,hold+0.12,wn.y)*smoothstep(0.0,0.25,k);}',
  'vec3 atmSnowAlbedo(vec3 c,float s,float wny){return mix(c,mix('+v3(P.shade)+','+v3(P.colour)+',clamp(wny,0.0,1.0)),s);}'].join('\n');};
 A.onInit.push(()=>{A.U.snowDepth=A.U.snowDepth||{value:0};A.U.snowBase=A.U.snowBase||{value:0};A.U.snowLine=A.U.snowLine||{value:new A.T.Vector2(0,0)};});
 // THE BINDING
 A.snowCover=o=>{o=o||{};const S={depth:o.depth==null?0:o.depth,frozen:!!o.frozen};A.snow=S;
  A.U.snowBase.value=o.base==null?0:o.base;if(o.line)A.U.snowLine.value.set(o.line[0],o.line[1]);
  A.hook((t,hour,dt)=>{A.snowStep(S,A.W||null,dt||0,hour);A.U.snowDepth.value=S.depth;});
  A.rec('snowcover',{preset:'snowcover',base:o.base||0,line:o.line||null,frozen:!!o.frozen,note:'depth = snowStep(depth, W.snow, dt, hour): builds while it snows, melts while it does not'});
  return S;};
 // THE LOOK on a material
 A.snowOn=(mat,o)=>{o=o||{};let page=mat.onBeforeCompile;
  const pk=mat.customProgramCacheKey?mat.customProgramCacheKey.bind(mat):()=>page?page.toString():'';mat.customProgramCacheKey=()=>pk()+'|atm-snow'+(o.aN?'-aN':'');
  const snow=function(sh,r){if(page)page.call(this,sh,r);
   sh.uniforms.atmSnowDepth=A.U.snowDepth;sh.uniforms.atmSnowBase=A.U.snowBase;sh.uniforms.atmSnowLine=A.U.snowLine;
   const V='varying vec3 vAtmSnP;varying vec3 vAtmSnN;';
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+V).replace('#include <project_vertex>','#include <project_vertex>\n'+
    'vec4 atmSnWp=vec4(transformed,1.0);vec3 atmSnN='+(o.aN?'aN':'objectNormal')+';\n#ifdef USE_INSTANCING\natmSnWp=instanceMatrix*atmSnWp;atmSnN=mat3(instanceMatrix)*atmSnN;\n#endif\nvAtmSnP=(modelMatrix*atmSnWp).xyz;vAtmSnN=normalize(mat3(modelMatrix)*atmSnN);');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+V+A.snowGLSL()).replace('#include <emissivemap_fragment>',
    '{vec3 atmSnNf=normalize(vAtmSnN);'+(o.twoSided?'if(!gl_FrontFacing)atmSnNf=-atmSnNf;':'')+'float atmS=atmSnow(vAtmSnP,atmSnNf);diffuseColor.rgb=atmSnowAlbedo(diffuseColor.rgb,atmS,atmSnNf.y);\n'+
    '#if defined(STANDARD)\nroughnessFactor=mix(roughnessFactor,'+f(A.PRESETS.snowcover.roughness)+',atmS);\n#endif\n}\n#include <emissivemap_fragment>');};
  Object.defineProperty(mat,'onBeforeCompile',{configurable:true,enumerable:true,get:()=>snow,set:fn=>{page=fn;}});
  mat.needsUpdate=true;return mat;};
 // every lit material of a scene at once (ground, rock, bark, leaves), each material once: not ShaderMaterials, nor water
 // ('water:' meshes), sprites, points, lines, additive or very transparent ones, nor what carries userData.noSnow
 A.snowOnScene=(scene,o)=>{o=o||{};const done=new Set();let n=0;
  scene.traverse(ob=>{if(!ob.isMesh||ob.userData.noSnow||(ob.name&&ob.name.indexOf('water:')===0))return;
   (Array.isArray(ob.material)?ob.material:[ob.material]).forEach(m=>{if(!m||done.has(m))return;done.add(m);
    if(m.isShaderMaterial||m.isMeshBasicMaterial||m.userData.noSnow||m.blending===A.T.AdditiveBlending||(m.transparent&&m.opacity<.5))return;
    if(!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))return;
    A.snowOn(m,{twoSided:m.side===A.T.DoubleSide,aN:!!(ob.geometry&&ob.geometry.attributes.aN)});n++;});});
  return n;};
//   ATMOS.snowOnScene(scene)  snowOn on every lit material of the scene (each once; not water, ShaderMaterials, sprites, userData.noSnow)
})();
