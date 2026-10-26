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
//
// Godot: a MeshInstance3D of the same arrays (vertex colours), visibility_range for the far end; the fog is the
// Environment's (core/terrain/README.md, "Godot").
(function(root){
  var K=root.KFAR||(root.KFAR={});   /* the data half may load after this one (the build sorts by name): it merges into the same object */
  function fogThin(m,k,key){var prev=m.onBeforeCompile;
    m.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);sh.uniforms.uFogK={value:k};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uFogK;').replace('#include <fog_vertex>','#include <fog_vertex>\n#ifdef USE_FOG\nfogDepth*=uFogK;\n#endif');};
    var own=key||('kfar-fog-'+k);m.customProgramCacheKey=function(){return own;};return m;}
  function geometry(g,o){o=o||{};var T=root.THREE,geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.BufferAttribute(g.pos,3));geo.setAttribute('color',new T.BufferAttribute(g.col,3));
    if(o.attrs)Object.keys(g.attrs).forEach(function(n){var a=g.attrs[n],sz=a.length/(g.pos.length/3);geo.setAttribute(n,new T.BufferAttribute(a,sz));});
    geo.setIndex(new T.BufferAttribute(g.idx,1));geo.computeVertexNormals();geo.computeBoundingSphere();return geo;}
  function mesh(g,o){o=o||{};var T=root.THREE,geo=geometry(g,o);
    var mat=o.material;if(!mat){mat=new T.MeshLambertMaterial({vertexColors:true});if(o.fogK!=null&&o.fogK!==1)fogThin(mat,o.fogK,o.fogKey);}
    var m=new T.Mesh(geo,mat);if(o.name)m.name=o.name;m.userData.farField=true;if(o.label)m.userData.inspectLabel=o.label;
    if(o.frustumCulled===false)m.frustumCulled=false;return m;}
  K.mesh=mesh;K.geometry=geometry;K.fogThin=fogThin;
})(typeof globalThis!=='undefined'?globalThis:this);
