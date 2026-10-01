/* ============================== 15. FLORA — LOCUS ==============================
   Yuni's Mediterranean planting does not grow on an abyssal delta. Locus is planted by the
   EASTERN-ABYSS BIOME KIT (69*-bio-*.js, bound in 69b-locus-biohost.js and built in
   69z-locus-flora.js after the buildings stand). What stays here is the kit-part tree
   vocabulary Yuni's own assets call from inside their build() (F.tree, CYPRESS...), and
   TREE_SITES, which the placement pass reads.                                          */
reseed(600001);
var TREE_SITES = [];
var FLORA = { cypress:0, olive:0, pine:0, shrub:0, palm:0 };
function CYPRESS(x,z,h){ var y=terrainH(x,z)-0.3, r=h*0.095+0.35, c=pick(PAL.cypress);
  CYL(x,y,z,0.16+h*0.008,h*0.22,0,PAL.trunk[1],'bark'); CONE(x,y+h*0.10,z,r,h*0.62,0,c,'leafy'); CONE(x,y+h*0.40,z,r*0.78,h*0.60,0,shade(c,0.06),'leafy'); FLORA.cypress++; TREE_SITES.push([x,z,r+0.6]); }
function OLIVE(x,z,h){ var y=terrainH(x,z)-0.3, c=pick(PAL.olive), lean=rr(-0.18,0.18);
  CYL(x,y,z,0.22+h*0.03,h*0.45,[lean,rnd()*TAU,0],PAL.trunk[3],'bark');
  for(var k=0;k<2;k++){ var a=rnd()*TAU, d=h*0.20*k; BLOB(x+Math.cos(a)*d, y+h*(0.36+0.12*k), z+Math.sin(a)*d, h*(0.46-0.08*k), h*(0.52-0.06*k), rnd()*TAU, k?shade(c,0.08):c, 'leafy'); } FLORA.olive++; TREE_SITES.push([x,z,h*0.45]); }
function PINE(x,z,h){ var y=terrainH(x,z)-0.4, c=pick(PAL.pine), lx=rr(-0.10,0.10), lz=rr(-0.10,0.10), tx=x+lx*h, tz=z+lz*h;
  BEAM(x,y,z, tx,y+h*0.78,tz, 0.30+h*0.012, 0.30+h*0.012, PAL.trunk[0], 'bark');
  var R=h*0.30; push('ball','leafy',[tx, y+h*0.70, tz, R, R*0.42, R, 0, c]); push('ball','leafy',[tx+R*0.3, y+h*0.80, tz-R*0.2, R*0.66, R*0.34, R*0.66, 0, shade(c,0.07)]); FLORA.pine++; TREE_SITES.push([x,z,1.2]); }
function SHRUB(x,z,s){ BLOB(x, terrainH(x,z)-0.15, z, s, s*0.7, rnd()*TAU, pick(PAL.shrub), 'leafy'); FLORA.shrub++; }
window._flora = FLORA;
