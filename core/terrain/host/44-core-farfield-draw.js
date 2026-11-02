// ================================================================= CORE — the far field on a three.js page (KFAR.mesh, KFAR.fogThin)
// The drawing of core/terrain/44-core-farfield.js's lattices (KFAR.grid): one vertex-coloured mesh, held and drawn whole
// (a far field spans kilometres: r128 would cull it by a sphere that is right, but it is never off screen for long),
// fogged by the page's own fog, which KFAR.fogThin can thin (the near high range reads as a range, not as haze).
//
//   KFAR.mesh(g, o)   g a KFAR.grid; o.material (default: Lambert, vertex colours, o.fogK thinning the fog), o.name,
//                     o.label (the inspector's), o.attrs (true: g's extra attributes on the geometry, by their names; uv
//                     goes on as 'uv'), o.frustumCulled (default true, as nwlowlands' range). -> THREE.Mesh, added to
//                     nothing: the page adds it and registers it (core/tags)
//   KFAR.geometry(g, o)  the BufferGeometry alone (o.attrs as above), for a page that keeps its own material
//   KFAR.fogThin(mat, k, key)   the material's fog depth multiplied by k (wraps its onBeforeCompile; key the program key)
//   KFAR.spriteMesh(S, o)  S a KFAR.sprites set, drawn as one instanced draw of camera-facing quads. o.k {value} (or a number): the kit's
//                     value, one uniform and no per-frame work here; o.map (a soft alpha texture; default a round puff), o.color ([1, 1, 1]),
//                     o.name, o.label, o.fog (true). -> THREE.Mesh, added to nothing, with the same flags as KFAR.mesh
//
// Godot: a MeshInstance3D of the same arrays (vertex colours), visibility_range for the far end; the fog is the
// Environment's (core/terrain/README.md, "Godot").
(function(root){
  var K=root.KFAR||(root.KFAR={});   /* the data half may load after this one (the build sorts by name): it merges into the same object */
  function fogThin(m,k,key){var K=root.KHOOK;if(!K)throw new Error('core/terrain: core/shader is not on this page (KHOOK): list core/shader/06-core-khook.js (khost.resolve adds it)');
    /* a KHOOK layer (core/shader): after the material's own hook; a missing anchor throws */
    return K.add(m,'kfar-fog',function(sh){sh.uniforms.uFogK={value:k};
      sh.vertexShader=K.rep(K.rep(sh.vertexShader,'#include <common>','#include <common>\nuniform float uFogK;'),'#include <fog_vertex>','#include <fog_vertex>\n#ifdef USE_FOG\nfogDepth*=uFogK;\n#endif');},{key:key||('kfar-fog-'+k)});}
  function geometry(g,o){o=o||{};var T=root.THREE,geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.BufferAttribute(g.pos,3));geo.setAttribute('color',new T.BufferAttribute(g.col,3));
    if(o.attrs)Object.keys(g.attrs).forEach(function(n){var a=g.attrs[n],sz=a.length/(g.pos.length/3);geo.setAttribute(n,new T.BufferAttribute(a,sz));});
    geo.setIndex(new T.BufferAttribute(g.idx,1));geo.computeVertexNormals();geo.computeBoundingSphere();return geo;}
  function mesh(g,o){o=o||{};var T=root.THREE,geo=geometry(g,o);
    var mat=o.material;if(!mat){mat=new T.MeshLambertMaterial({vertexColors:true});if(o.fogK!=null&&o.fogK!==1)fogThin(mat,o.fogK,o.fogKey);}
    var m=new T.Mesh(geo,mat);if(o.name)m.name=o.name;m.userData.farField=true;if(o.label)m.userData.inspectLabel=o.label;
    if(o.frustumCulled===false)m.frustumCulled=false;return m;}
  /* the shader is KFAR.spriteAt: the gate past the lag, size and alpha on what is left, the range's fades */
  var SPV=['attribute vec3 aPos;attribute float aSize;attribute float aAlpha;attribute float aLag;attribute vec3 aTint;attribute float aSeed;',
    'uniform float uK;uniform vec2 uRange;varying vec2 vUv;varying float vA;varying vec3 vTint;','#include <fog_pars_vertex>',
    'void main(){float g=clamp((uK-aLag)/max(1.0-aLag,0.001),0.0,1.0);vec4 mvPosition=viewMatrix*vec4(aPos,1.0);float r=length(mvPosition.xyz),w=(uRange.y-uRange.x)*0.1,f=1.0;',
    'if(uRange.y>uRange.x)f=smoothstep(uRange.x,uRange.x+w,r)*(1.0-smoothstep(uRange.y-w,uRange.y,r));',
    'float s=6.2831853*aSeed,c=cos(s),n=sin(s);vec2 q=mat2(c,n,-n,c)*position.xy;mvPosition.xy+=q*aSize*g;vUv=uv;vA=aAlpha*g*f;vTint=aTint;',
    'gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
  var SPF=['uniform vec3 uColor;varying vec2 vUv;varying float vA;varying vec3 vTint;','#include <fog_pars_fragment>','#ifdef SP_MAP','uniform sampler2D uMap;','#endif',
    'void main(){','#ifdef SP_MAP','float a=texture2D(uMap,vUv).a;','#else','vec2 d=vUv*2.0-1.0;float a=1.0-smoothstep(0.1,1.0,dot(d,d));','#endif',
    'gl_FragColor=vec4(uColor*vTint,a*vA);if(gl_FragColor.a<0.004)discard;','#include <encodings_fragment>','#include <fog_fragment>','}'].join('\n');
  function spriteMesh(S,o){o=o||{};var T=root.THREE,g=new T.InstancedBufferGeometry(),P=new T.PlaneGeometry(1,1),A=function(n,a,sz){g.setAttribute(n,new T.InstancedBufferAttribute(a,sz));};
    g.setAttribute('position',P.attributes.position);g.setAttribute('uv',P.attributes.uv);g.setIndex(P.index);g.instanceCount=S.count;
    A('aPos',S.pos,3);A('aSize',S.size,1);A('aAlpha',S.alpha,1);A('aLag',S.lag,1);A('aTint',S.tint,3);A('aSeed',S.seed,1);
    var c=o.color||[1,1,1],fog=o.fog==null?true:!!o.fog,U={uK:o.k&&o.k.value!=null?o.k:{value:o.k==null?1:o.k},uRange:{value:new T.Vector2(S.range?S.range[0]:0,S.range?S.range[1]:0)},uColor:{value:new T.Color(c[0],c[1],c[2])}};
    if(o.map)U.uMap={value:o.map};if(fog)Object.assign(U,T.UniformsUtils.clone(T.UniformsLib.fog));
    var m=new T.ShaderMaterial({uniforms:U,vertexShader:SPV,fragmentShader:SPF,defines:o.map?{SP_MAP:1}:{},transparent:true,depthWrite:false,fog:fog});
    var M=new T.Mesh(g,m);M.frustumCulled=false;M.userData.farField=true;M.userData.noSnow=true;if(o.name)M.name=o.name;if(o.label)M.userData.inspectLabel=o.label;return M;}
  K.mesh=mesh;K.geometry=geometry;K.fogThin=fogThin;K.spriteMesh=spriteMesh;
})(typeof globalThis!=='undefined'?globalThis:this);
