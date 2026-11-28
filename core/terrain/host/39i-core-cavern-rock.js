// ================================================================= CORE HOST — cavern: a rock material for carved pages (KCAVERN.rockMaterial)  [web]
// Lifted 2026-11-17 from Lāiṭwāl's page (settlements/lightwall 90l lwRockLayer) for every page that draws a KCAVERN's rock
// (kits/tungang's Glazier sheet asked for it: KNOWN_ISSUES.md "the Glaziers' rock has no texture"). The rock drawRock makes
// (39e) carries its occlusion, or the page's own tint, as vertex colours; this dresses it in a library rock set through core/
// terrain's ground shader (43-core-ground.js KGROUND.hook: hex tiling, the distance scale, triplanar on the steep, the far
// levels that break a tile's repeat at a distance), the vertex colours multiplying it. Without KGROUND or a map it is the
// plain material, so a page without the textures draws as before.
//
//   KCAVERN.rockMaterial({THREE, map (a THREE.Texture: the set's colour map), tile (4: the set's own tile, m), scale (2.2: the
//        tile stretched by), color (0x9a928c), roughness (.95), side (THREE.DoubleSide: a carved room is seen from inside),
//        far ({d: 90, levels: 6}), tri ({from: .3, to: .65, far: 900}), name, key})
//     -> a MeshStandardMaterial ({vertexColors: true}) to hand drawRock (o.material); KCAVERN.cutLayer may be laid on it after
(function(root){
  'use strict';
  var K=root.KCAVERN;if(!K)throw new Error('host/39i-core-cavern-rock: load core/terrain/39-core-cavern.js first');
  K.rockMaterial=function(o){o=o||{};var T=o.THREE||root.THREE;if(!T)throw new Error('KCAVERN.rockMaterial: THREE');
    var mat=new T.MeshStandardMaterial({vertexColors:true,roughness:o.roughness==null?.95:o.roughness,metalness:0,
      side:o.side==null?T.DoubleSide:o.side,color:o.color==null?0x9a928c:o.color});
    var G=root.KGROUND,map=o.map;if(!G||!G.hook||!map)return mat;
    map.wrapS=map.wrapT=T.RepeatWrapping;
    var tile=(o.tile==null?4:o.tile)*(o.scale==null?2.2:o.scale);
    G.hook(mat,{layers:[{map:map,k:1/tile,w:'1.0',lin:true,name:o.name||'the carved rock'}],
      tri:o.tri||{from:.3,to:.65,far:900},far:o.far||{d:90,levels:6},key:o.key||'kcavern-rock'});
    /* the ground shader's locals are kgV1..kgV3 and kgR1..kgR3 since Stage 8 (core/terrain/43-core-ground.js): three r128's
       environment map #defines r0..r6, v0..v6 and m0..m6 as numbers, which broke this material on a page with a skylight
       (kits/tungang 2026-11-17) until then, and an #undef guard stood here */
    return mat;};
})(typeof window!=='undefined'?window:globalThis);
