/* ============================== THE SALT LAKE ON core/water ==============================
   The open lake is core/water's open water (core/water/README.md): a WATER.open surface on the water plane (y 0) with
   a calm share of the shared wave field (core/atmos; no swell of its own: LAKE_FIELD lifts it a few centimetres, so the
   reed decks, the jetties and Mungo's reed islands keep their waterlines, and LAKE_TILT keeps its chop reading), on the
   one clock (atmWaveT, whole cycles per period), drawn by WATER.draw on the CDLOD water mesh. Its bed is baked from
   terrainH (the shallows' colour over the shelf, a surf lap under 1.4 m, the water calmed to nothing at the waterline).
   The sky in it is core/atmos's skylight, a capture of skyScene given to the water only (this is a Lambert world: its
   materials are unchanged). Its CPU twin is WATER.heightAt.
   The river, the delta's channels, the canal and the marsh pools stay on 75-terrain.js's sheet (core/water's flow and
   still kinds are later phases). The two meet on the shoreline, lakeDist = 0, through one baked texture both shaders
   sample the same way (LAKE_MASK: R the lake's side of the line, G the river's fresh water running out into the lake, the
   old sheet's plume): the lake draws where R > .5 and the sheet where it is not, and the lake takes the river's colour by
   G, so a mouth meets the sheet in the same colour. Mungo reads this fragment by name, with its own lake and river. */
var LAKE_FIELD = 0.12, LAKE_TILT = 8.0;
var LAKE_WATER = null, LAKE_DRAW = null, LAKE_MASK = null;
/* the lake's surface at (x, z) now, over the water plane: what a boat on the open lake rides (the life layers' boats);
   0 off the lake (the river and the pools are the flat sheet) and before the lake is made */
function lakeHeave(x, z){ if(!LAKE_WATER || lakeDist(x, z) >= 0) return 0; return LAKE_WATER.heightAt(x, z, ATMOS.clock.t); }
(function(){
  if(SHEET || !water) return;
  /* the box: from 1.8 km out in the lake to 100 m inland of the shore's most easterly point, the whole map in z */
  var smax = -1e9, smin = 1e9; for(var z = -HW; z <= HW; z += 10){ var s = lakeShoreX(z); smax = Math.max(smax, s); smin = Math.min(smin, s); }
  var box = [Math.max(-HW, smin - 1800), -HW, smax + 100, HW], cell = 8;
  /* the mask: R = .5 - lakeDist/24 (the line at .5, linear across it so the GPU's filtering keeps it where it is), G = the
     fresh share (75-terrain.js waterColorAt's) */
  var nx = Math.ceil((box[2] - box[0]) / cell), nz = Math.ceil((box[3] - box[1]) / cell), D = new Uint8Array(nx * nz * 4);
  for(var j = 0; j < nz; j++) for(var i = 0; i < nx; i++){
    var x = box[0] + (i + .5) * cell, zz = box[1] + (j + .5) * cell, ld = lakeDist(x, zz), o = (j * nx + i) * 4;
    var fresh = ld < 40 ? Math.max(smooth(30, 2, riverDist(x, zz)) * (1 - smooth(-60, -360, ld)), smooth(10, 2, canalDist(x, zz))) : 0;
    D[o] = Math.round(255 * clamp(.5 - ld / 24, 0, 1)); D[o + 1] = Math.round(255 * fresh); D[o + 3] = 255; }
  var T = new THREE.DataTexture(D, nx, nz, THREE.RGBAFormat, THREE.UnsignedByteType);
  T.minFilter = T.magFilter = THREE.LinearFilter; T.wrapS = T.wrapT = THREE.ClampToEdgeWrapping; T.generateMipmaps = false; T.needsUpdate = true;
  LAKE_MASK = { tex: T, box: box };
  waterUni.uLakeMask.value = T; waterUni.uLakeBox.value.set(box[0], box[1], box[2], box[3]);
  /* the lake */
  ATMOS.skylight({ renderer: renderer, sky: skyScene, scene: { environment: null }, ground: function(){ return new THREE.Color(0x2a2620); } });
  LAKE_WATER = WATER.open({ name: 'The salt lake', level: 0, field: LAKE_FIELD, tilt: LAKE_TILT, bed: terrainH, bedBox: box, bedCell: cell });
  var lin = function(c){ return c.clone().convertSRGBToLinear(); }, v3 = function(c){ return 'vec3(' + [c.r, c.g, c.b].map(function(v){ return v.toFixed(5); }).join(',') + ')'; };
  var shallow = lin(WATER_SHALLOW).multiplyScalar(.42), deep = lin(WATER_DEEP).multiplyScalar(.65);
  LAKE_DRAW = WATER.draw(LAKE_WATER, { renderOrder: 1, roughness: .14, metalness: .1, envMapIntensity: .35, shallow: shallow, deep: deep });
  LAKE_DRAW.mesh.userData.inspectLabel = 'The salt lake (water)';  var river = lin(RIVER_COL), ob = LAKE_DRAW.material.onBeforeCompile;
  LAKE_DRAW.material.onBeforeCompile = function(sh){ ob(sh); sh.uniforms.uLakeMask = waterUni.uLakeMask; sh.uniforms.uLakeBox = waterUni.uLakeBox;
    sh.fragmentShader = LAKE_GLSL + sh.fragmentShader.replace('#include <color_fragment>',
      '#include <color_fragment>\nvec4 lkM = lakeMask(vWtrP); if(lkM.r <= 0.5) discard;') .replace('#include <roughnessmap_fragment>',
      /* a salt lake on a shelf this gentle: no surf lap (it would whiten a band hundreds of metres wide) and no whitecaps
         (no swell to break); the shallows' colour by depth, as core/water's, then the river's plume */
      'wtrFoamK = 0.0; diffuseColor.rgb = mix(' + v3(shallow) + ', ' + v3(deep) + ', smoothstep(0.5, 9.0, wtrDp));\n' +
      'diffuseColor.rgb = mix(diffuseColor.rgb, ' + v3(river) + ', lkM.g);\n#include <roughnessmap_fragment>'); };
  window._lake = { water: LAKE_WATER, draw: LAKE_DRAW, mask: LAKE_MASK, heave: lakeHeave, WATER: WATER };   /* the probe's handle (verify --eval) */
})();
