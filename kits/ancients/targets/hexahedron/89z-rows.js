// TARGET: hexahedron — Soleri's sheet 28, intact and sheared open, with one
// Ironbark hypertree imported from Mav's Refuge purely as a scale reference.
const TITLE='Hexahedron — the double pyramid';
const GROUND_C=0;
const DECAYS=[0,2];
const ROWS={
 hex:{z:0,s:1500,r:1100,t:4600},
 mav:{z:620,s:2620,r:240},            // no .t, so it is built once, by the intact one
 // THE OVERGROWN VARIANT — the worked example for the biome pass. Same builder,
 // same seed, same decay; the only difference is BIOME.lush, so anything that
 // changes between this row and the one in front of it is planting and nothing
 // else. A type is cross-compatible when its OWN scatter loops move too; where
 // a bespoke loop ignores BIOME.lush you can see it here as a patch of the site
 // that stayed bare while everything round it filled in.
 // carries BOTH decays, like the main row: the intact hexahedron plants only
 // 52 trees, so at lush=3.2 it gains 5 000 triangles and reads almost the
 // same. Nearly all this kit's planting lives on the DECAYED variant
 // (scatterMoss 320, trees 80, mossOnSurface 300, vinesFromLedge 140), which
 // is where the dial actually bites and where the pass should look.
 hexlush:{z:-2600,s:1500,r:1100,t:4600},
};
// RUINS greens the ground texture under each site. The d=0 site is at -s, so
// that is the sign to pass; every other target passes +s and greens the wrong
// side of the map (logged in KNOWN_ISSUES).
const RUINS=Object.values(ROWS).flatMap(r=>r.t?[[-r.s,r.z,r.r],[r.t,r.z,r.r*1.3]]:[[-r.s,r.z,r.r]]);
RUINS.push([-ROWS.hexlush.s,ROWS.hexlush.z,ROWS.hexlush.r*1.25],
           [ROWS.hexlush.t,ROWS.hexlush.z,ROWS.hexlush.r*1.45]);
const EXTRA_BUILDERS={hex:buildHexahedron,mav:buildHypertree,
 // withBiome puts BIOME.lush back afterwards even if the builder throws;
 // it is a global and the builders run in sequence, so a bare assignment
 // here would leak into every type built after this one.
 // THE BIOME PASS, and the worked example every quality run copies.
 // Either biome, never both: swap HYPERJUNGLE for EASTABYSS here and nothing
 // else changes. Both are loaded (this kit concatenates all of src/ into every
 // target) but only one is ever built, which is why eastabyss's item keys had
 // to be namespaced — see 75-biome-45-bind.js.
 hexlush:(sc,x,z,dd)=>withBiome(3.2,()=>{
  const G=buildHexahedron(sc,x,z,dd);
  // the host cuts the clearing; the biome never knows why
  biomeClear(x,z,1150,240);
  // LOD is measured from the origin and this site is 3 km off world centre, so
  // without moving it every plant here would be built at minimum detail
  BIO.host.origin=[[x,z]];BIO.host.center=[x,z];
  BIO.setScene(sc);
  if(typeof sun!=='undefined')BIO.setSun([sun.position.x,sun.position.y,sun.position.z]);
  HYPERJUNGLE.build({R:2100,heroR:1100,quality:.55});
  // DRESSING: moss on the ledges, mats and curtains on the soffits, growth on
  // the walls. It wants world-space BufferGeometry[], and this kit's builders
  // leave their shells merged inside a translated group — so the geometries
  // have to be baked out through matrixWorld or every plant lands 1.5 km away
  // at the world origin.
  const geos=[];G.updateMatrixWorld(true);
  G.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.position)
   geos.push(o.geometry.clone().applyMatrix4(o.matrixWorld));});
  // DENSITY IS NOT A DEFAULT YOU CAN TAKE. dressLedges defaults to 400 moss and
  // 300 plants, which is right for the Girder tower it was written against and
  // invisible on a 1.5 km arcology — BIO.upFaces weights by triangle AREA, so on
  // a structure this size the default scatter is a few dozen specks nobody will
  // ever find. Scaled up by roughly the ratio of surface areas.
  // BUT THE BUDGET IS. At moss 9000 / plants 5200 / edges 3200 / walls 4000
  // the dressing alone was 1.34M triangles and biome/0 stood at 1.55M against
  // a 700k mega budget (qa/arcB.md round 3). The walls are the dear part --
  // every bracket is 2-4 fungus half-spheres of 81 triangles -- so they are
  // cut hardest; moss mats (7 triangles) are kept densest. The soffits pass
  // reads opt.n (default 400): the mats/curtains keys it was given were never
  // read, so n:400 here is what it always did.
  HYPERJUNGLE.dress(geos,{ledges:{moss:5000,plants:2000,edges:1300,hang:24,mossR:5},
                          soffits:{n:400},
                          walls:{n:700}});
  BIO.bake();
 })};
