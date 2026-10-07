/* ============================== 12b. TEXTURES ==============================
   Procedural grayscale canvases, one per material family, tiled in WORLD
   units by the UV hook in emitBuckets(). Grayscale so the per-instance colour
   from the palette still does the tinting — a texture here changes surface,
   never hue.

   This fragment adds no instances and no draw calls: it fills the `tex` slots
   in FAMMAT and nothing else.
========================================================================= */
reseed(470001);   /* fragment head seed — build.py enforces this. Each fragment
                   owns its own PRNG stream so an edit here cannot shift
                   anything generated in a later fragment. */

var TEXSZ = FAST ? 128 : 256;

function texCanvas(fn, sz){
  sz = sz || TEXSZ;
  var c = document.createElement('canvas'); c.width = c.height = sz;
  var g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0,0,sz,sz);
  fn(g, sz);
  var t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  t.encoding = THREE.sRGBEncoding;
  return t;
}

/* grain: fine per-pixel noise laid over whatever is already drawn */
function grain(g, S, amt, cell){
  cell = cell || 2;
  for(var y=0; y<S; y+=cell) for(var x=0; x<S; x+=cell){
    var v = 1 - amt*rnd();
    g.fillStyle = 'rgba(0,0,0,' + (1-v).toFixed(3) + ')';
    g.fillRect(x,y,cell,cell);
  }
}
function lineH(g,y,S,a,w){ g.strokeStyle='rgba(0,0,0,'+a+')'; g.lineWidth=w||1;
  g.beginPath(); g.moveTo(0,y+0.5); g.lineTo(S,y+0.5); g.stroke(); }

/* --- ashlar: fine dressed/coursed stone for wealthy & canton walls.
   Finer coursing, tighter block-to-block value variance, crisper/thinner
   mortar joints than plaster's rougher stucco — the whole point of this
   pattern now is to read as "quality" now that it is not every building's
   default.

   History, briefly (read before touching this again):
   pass 1 raised mottling contrast — fixed "flat plane from a distance".
   pass 2 layered 3 blotch octaves + tried MirroredRepeatWrapping — the
     wrap mode traded a translation seam for an equally obvious
     mirror-symmetry axis at every tile edge, reverted.
   pass 3 made the canvas genuinely seamless under plain RepeatWrapping
     (each blotch drew wrapped copies of itself near any edge it
     overlapped — drawBlotch(), now removed) and used a bigger canvas.
     Seamless, but a few big soft blotches meant every same-sized instance
     in the city sampled the identical canvas corner — a repeated
     fingerprint.
   The planner then fixed the actual root cause of that fingerprint in
   45-kit.js: worldUV() derived UV purely from instance SCALE, never
   POSITION, so same-sized instances all read the same corner. It now adds
   a per-instance UV offset hashed from world position, so neighbouring
   same-sized walls sample different regions of this tile. That is
   confirmed working and is NOT this fragment's problem to redo.
   pass 4 (here): even with per-instance offsets, the canvas still looked
   repetitive, because the underlying PATTERN — soft radial-gradient
   blotches composited on grey — reads as an artificial "blob" style no
   matter where you sample it from. Sampling a different corner of the
   same kind of smudge is still a smudge. Replaced blotch compositing with
   coherent noise (below): every sample is structurally different from
   every other because the field itself has no repeating "unit" the eye
   can lock onto, unlike a blotch.

   Wrapping stays plain THREE.RepeatWrapping, same as every other family —
   see the pass-2 note above for why MirroredRepeatWrapping is off the
   table. Seamlessness here is NOT a blend trick (crossfading a field with
   a copy of itself offset by the tile size averages two uncorrelated
   samples together and visibly *flattens contrast* exactly in that blend
   band — the same "soft smudge" failure mode as pass 3, just relocated to
   wherever the blend band lands). It is exact: noiseP() below is a
   periodic lattice indexed mod L, so the field satisfies
   noise(x+S) === noise(x) by construction, with full contrast everywhere,
   right up to the tile edge. See the comment on stoneNoise() for detail. */

/* periodicLattice()/noiseP(): the same value-noise construction as vn() in
   10-core.js (bilinear interpolation of 4 lattice corners, smoothstepped) —
   but vn()'s lattice is hashed from arbitrary integers via h2(), which has
   no period, so fbm(x,z) sampled at x=0 and x=S are two unrelated values.
   That is exactly right for terrain, sampled once and never tiled, and
   exactly wrong for a canvas tiled under RepeatWrapping. noiseP() swaps
   h2()'s hash for a small LxL table of rnd() values indexed mod L, which
   makes it exactly periodic with period L in its own coordinate space —
   nothing here is a new noise algorithm, it is vn()'s own formula with a
   wrappable hash. */
function periodicLattice(L){
  var t = [];
  for(var i=0;i<L;i++){ var row=[]; for(var j=0;j<L;j++) row.push(rnd()); t.push(row); }
  return t;
}
function noiseP(x, y, L, table){
  var i=Math.floor(x), j=Math.floor(y), fx=x-i, fy=y-j;
  var ii=((i%L)+L)%L, jj=((j%L)+L)%L, ii1=(ii+1)%L, jj1=(jj+1)%L;
  var u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy);
  var a=table[ii][jj], b=table[ii1][jj], c=table[ii][jj1], d=table[ii1][jj1];
  return a*(1-u)*(1-v) + b*u*(1-v) + c*(1-u)*v + d*u*v;
}
var TEX_STONE = texCanvas(function(g,S){
  var rows = 8, h = S/rows, cols = 6, w = S/cols;
  grain(g,S,0.08,2);

  /* stoneNoise: four octaves of noiseP, same 0.5/0.25/0.125/0.0625
     amplitude falloff fbm() uses for vn() — this is deliberately the same
     shape of sum, just built on a periodic field. Each octave k samples
     noiseP at x*NL[k]/S, so advancing a full canvas width S in x always
     advances the lattice coordinate by exactly NL[k] — one whole period —
     which is what makes every individual octave (and therefore the sum)
     exactly period-S in BOTH x and y, with no blend band anywhere.
     NL is deliberately not power-of-2-related (4, 9, 19, 41) so the four
     fields don't beat against each other into a visible grid: L0 sits
     around the old macro-wash scale (a handful of features across the
     wall, the low frequency that survives mip-averaging at distance —
     pass 1's concern), L3 is fine per-block grain. */
  var NL = [4, 9, 19, 41];
  var NW = [0.5, 0.25, 0.125, 0.0625];
  var NT = NL.map(function(L){ return periodicLattice(L); });
  function stoneNoise(x, y){
    var n = 0;
    for(var k=0;k<NL.length;k++) n += NW[k]*noiseP(x*NL[k]/S, y*NL[k]/S, NL[k], NT[k]);
    return n/0.9375; // ~0..1, matches fbm()'s own normalisation
  }

  /* paint the mottling as a coherent field, cell by cell — this replaces
     blotchLayer()/drawBlotch() from pass 3 entirely. Every stone instance
     already samples this canvas from a per-instance offset (45-kit.js), so
     the "identical fingerprint" problem is handled upstream of this file;
     what was still reading as repetitive was the blotch SHAPE itself, and
     a coherent field has no such recognisable unit to spot twice. */
  var cell = 3;
  for(var y=0;y<S;y+=cell) for(var x=0;x<S;x+=cell){
    var n = stoneNoise(x,y);
    g.fillStyle = 'rgba(0,0,0,' + (0.03 + 0.17*n).toFixed(3) + ')';
    g.fillRect(x,y,cell,cell);
  }

  for(var r=0;r<rows;r++){
    var y = r*h, off = (r%2) ? w*0.5 : 0;
    for(var c=0;c<cols;c++){
      var x = (c*w + off) % S;
      /* low block-to-block variance: regular, well-dressed stone, not
         rubble. Tone is anchored to the same coherent field sampled at the
         block's own centre — so it "lives in" the stone (neighbouring
         blocks drift together, the way real quarried stone's veining
         ignores the mason's coursing) rather than being painted over
         it — plus a little independent jitter so no two blocks in a
         course are identical. */
      var bn = stoneNoise(x+w*0.5, y+h*0.5);
      g.fillStyle = 'rgba(0,0,0,' + (0.015 + 0.03*bn + 0.02*rnd()).toFixed(3) + ')';
      g.fillRect(x+1, y+1, w-2, h-2);
      /* crisp mortar joint */
      g.fillStyle = 'rgba(0,0,0,0.20)';
      g.fillRect(x, y, 1.1, h);
      if(x+w > S){ g.fillRect(x-S, y, 1.1, h); }
      /* thin secondary line just inside the joint: a cut arris catching a
         little less shadow than the joint itself, reads as a crisp dressed
         edge rather than a soft one */
      g.fillStyle = 'rgba(0,0,0,0.07)';
      g.fillRect(x+1.6, y, 0.8, h);
    }
    lineH(g, y, S, 0.22, 1.1);
  }
}, Math.round(TEXSZ*1.5));
/* TEX_STONE gets a bigger-than-default canvas (1.5x TEXSZ: 384 desktop /
   192 FAST, vs the shared 256/128). World-unit tile SIZE is unchanged
   (FAMMAT.stone.scale, below, is what controls how often a wall repeats)
   — this only raises the detail packed into each tile, so two repeats
   standing side by side have more to visually disambiguate them at
   ground-level viewing distance instead of reading as an identical
   stamp. One-time cost at load, paid once regardless of instance count. */

/* --- stucco over mud-brick, for poor-quarter walls: rough, patched,
   irregular render with brick coursing ghosting through here and there.
   The rustic counterpart to TEX_STONE above — everything here is looser,
   coarser and less regular than the ashlar pattern. --- */
var TEX_PLASTER = texCanvas(function(g,S){
  /* coarse hand-applied render, rougher grain than stone's fine dressing */
  grain(g,S,0.16,3);

  /* broad uneven undulation in the render surface: more blobs, harder
     falloff than a smooth mottled render so the surface reads bumpy */
  for(var i=0;i<32;i++){
    var x=rnd()*S, y=rnd()*S, r=rr(S*0.04,S*0.17);
    var a=0.05+0.10*rnd();
    var gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,'rgba(0,0,0,'+a.toFixed(3)+')');
    gr.addColorStop(0.65,'rgba(0,0,0,'+(a*0.4).toFixed(3)+')');
    gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,6.284); g.fill();
  }

  /* mud-brick coursing ghosting faintly through the stucco: broken,
     irregular horizontal courses with occasional vertical joint stubs,
     never a full regular grid like dressed ashlar */
  var bRows = 5, bh = S/bRows;
  for(var br=0; br<bRows; br++){
    var by = br*bh + rr(-bh*0.18, bh*0.18);
    if(chance(0.7)){
      g.strokeStyle = 'rgba(0,0,0,' + (0.05+0.04*rnd()).toFixed(3) + ')';
      g.lineWidth = 1;
      var segs = ri(2,4);
      for(var s=0; s<segs; s++){
        var sx = rr(0,S), slen = rr(S*0.10,S*0.28);
        g.beginPath(); g.moveTo(sx,by); g.lineTo(Math.min(S,sx+slen), by+rr(-2,2)); g.stroke();
      }
    }
    if(chance(0.5)){
      var vx = rnd()*S;
      g.strokeStyle = 'rgba(0,0,0,0.05)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(vx,by); g.lineTo(vx, by+bh*rr(0.35,0.9)); g.stroke();
    }
  }

  /* patch repairs: a handful of harder-edged, slightly different-toned
     rectangles — the tell of a mud-brick wall re-rendered over time */
  var patches = ri(3,5);
  for(var p=0; p<patches; p++){
    var pw = rr(S*0.08,S*0.20), ph = rr(S*0.06,S*0.15);
    var px = rr(0,S-pw), py = rr(0,S-ph);
    g.fillStyle = 'rgba(0,0,0,' + (0.03+0.05*rnd()).toFixed(3) + ')';
    g.fillRect(px,py,pw,ph);
    g.strokeStyle = 'rgba(0,0,0,0.09)'; g.lineWidth = 1;
    g.strokeRect(px+0.5,py+0.5,pw-1,ph-1);
  }

  /* hairline cracks: more numerous and jagged than a fine render's */
  g.strokeStyle = 'rgba(0,0,0,0.14)'; g.lineWidth = 1;
  for(var k=0; k<6; k++){
    var cx=rnd()*S, cy=rnd()*S; g.beginPath(); g.moveTo(cx,cy);
    var steps = ri(4,7);
    for(var j=0;j<steps;j++){ cx+=rr(-S*0.10,S*0.10); cy+=rr(-S*0.02,S*0.12); g.lineTo(cx,cy); }
    g.stroke();
  }
});

/* --- roof: terracotta barrel/mission tile. Alternating convex half-round
   tiles read far more "terracotta" than flat overlapping courses, so each
   column gets a cylindrical shading gradient (dark-light-dark across its
   width) on top of the coursed-row shadow lines that already sold the
   overlap down the slope. --- */
var TEX_ROOF = texCanvas(function(g,S){
  var rows = 8, h = S/rows, cols = 6, w = S/cols;
  grain(g,S,0.10,2);
  for(var r=0;r<rows;r++){
    var y=r*h, off=(r%2)? w*0.5 : 0;
    for(var c=-1;c<=cols;c++){
      var x=c*w+off;
      /* cylindrical barrel-tile shading: dark at the seams, light along
         the crown, so each tile reads as a convex half-round, not a flat pan */
      var base = 0.09 + 0.05*rnd();
      var gr = g.createLinearGradient(x,0,x+w,0);
      gr.addColorStop(0.00, 'rgba(0,0,0,'+(base+0.13).toFixed(3)+')');
      gr.addColorStop(0.50, 'rgba(0,0,0,'+(base*0.25).toFixed(3)+')');
      gr.addColorStop(1.00, 'rgba(0,0,0,'+(base+0.13).toFixed(3)+')');
      g.fillStyle = gr;
      g.fillRect(x, y+1, w, h-1.5);
    }
    /* the shadow line under each overlapping course */
    g.fillStyle='rgba(0,0,0,0.26)'; g.fillRect(0, y, S, 1.5);
  }
});

/* --- wood: sawn planks, ends staggered --- */
var TEX_WOOD = texCanvas(function(g,S){
  var n = 6, w = S/n;
  grain(g,S,0.09,2);
  for(var i=0;i<n;i++){
    var x=i*w;
    g.fillStyle='rgba(0,0,0,'+(0.05*rnd()).toFixed(3)+')';
    g.fillRect(x, 0, w, S);
    g.fillStyle='rgba(0,0,0,0.22)'; g.fillRect(x, 0, 1.2, S);
    /* grain lines along the plank */
    g.strokeStyle='rgba(0,0,0,0.07)'; g.lineWidth=1;
    for(var k=0;k<4;k++){
      var gx=x+rr(2,w-2); g.beginPath(); g.moveTo(gx,0);
      for(var y=0;y<S;y+=S/4) g.lineTo(gx+rr(-1.2,1.2), y);
      g.stroke();
    }
  }
});

/* --- dome: smooth, faint concentric banding --- */
var TEX_DOME = texCanvas(function(g,S){
  grain(g,S,0.06,2);
  for(var y=0;y<S;y+=S/10) lineH(g,y,S,0.05,1);
});

/* --- bark: vertical fissures --- */
var TEX_TRUNK = texCanvas(function(g,S){
  grain(g,S,0.18,2);
  g.strokeStyle='rgba(0,0,0,0.20)';
  for(var i=0;i<14;i++){
    var x=rnd()*S; g.lineWidth=rr(0.8,2.4); g.beginPath(); g.moveTo(x,0);
    for(var y=0;y<=S;y+=S/6) g.lineTo(x+rr(-2.5,2.5), y);
    g.stroke();
  }
});

/* --- leaf: clumped canopy noise --- */
var TEX_LEAF = texCanvas(function(g,S){
  grain(g,S,0.20,2);
  for(var i=0;i<60;i++){
    var x=rnd()*S, y=rnd()*S, r=rr(S*0.02,S*0.07);
    g.fillStyle='rgba(0,0,0,'+(0.10*rnd()).toFixed(3)+')';
    g.beginPath(); g.arc(x,y,r,0,6.284); g.fill();
  }
});

/* --- fungus: soft blotches, no hard edges --- */
var TEX_FUNGUS = texCanvas(function(g,S){
  grain(g,S,0.08,2);
  for(var i=0;i<22;i++){
    var x=rnd()*S, y=rnd()*S, r=rr(S*0.06,S*0.22);
    var gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,'rgba(0,0,0,'+(0.09*rnd()).toFixed(3)+')');
    gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,6.284); g.fill();
  }
});

/* --- metal: brushed, with a little pitting --- */
var TEX_METAL = texCanvas(function(g,S){
  grain(g,S,0.05,1);
  g.strokeStyle='rgba(0,0,0,0.06)'; g.lineWidth=1;
  for(var y=0;y<S;y+=2){ g.beginPath(); g.moveTo(0,y+0.5); g.lineTo(S,y+0.5); g.stroke(); }
  for(var i=0;i<40;i++){
    g.fillStyle='rgba(0,0,0,'+(0.10*rnd()).toFixed(3)+')';
    g.fillRect(rnd()*S, rnd()*S, rr(1,3), rr(1,3));
  }
});

/* TEX_STONE keeps texCanvas()'s default RepeatWrapping, same as every other
   family — see the comment on TEX_STONE above for why MirroredRepeatWrapping
   was tried and reverted (it traded a translation seam for an equally
   obvious mirror-symmetry axis at every tile boundary). Seamlessness is
   handled on the canvas itself instead, via noiseP()'s exactly-periodic
   lattice (see the comment above TEX_STONE for why that's exact rather
   than a blended approximation). */

FAMMAT.stone.tex   = TEX_STONE;
FAMMAT.plaster.tex = TEX_PLASTER;
FAMMAT.roof.tex    = TEX_ROOF;
FAMMAT.wood.tex    = TEX_WOOD;
FAMMAT.dome.tex    = TEX_DOME;
FAMMAT.trunk.tex   = TEX_TRUNK;
FAMMAT.leaf.tex    = TEX_LEAF;
FAMMAT.fungus.tex  = TEX_FUNGUS;
FAMMAT.metal.tex   = TEX_METAL;

window._tex = { size:TEXSZ, families:Object.keys(FAMMAT).filter(function(k){ return !!FAMMAT[k].tex; }).length };

/* ---- the material library (core/materials/record, materials.json; Girder's 47-texture.js is the model): where the
   pack has a family (unless ?mat=proc), its maps replace the procedural canvas above, repeating at the set's own tile
   size. 45-kit.js vothLibMaterial() gives such a family a MeshStandardMaterial with the set's normal and roughness maps.
   trunk and leaf (the willows) stay procedural. ---- */
(function(){
  if(typeof KMAT === 'undefined' || KMAT.mode !== 'lib') return;
  Object.keys(FAMMAT).forEach(function(fam){
    var L = KMAT.packed('voth', fam); if(!L) return;
    var fm = FAMMAT[fam], T = KMAT.textures(L, { aniso: FAST ? 1 : 8 }), sc = fm.scale || [4,4];
    [T.map, T.normalMap, T.roughnessMap].forEach(function(t){ if(t) t.repeat.set(sc[0]/L.scale[0], sc[1]/L.scale[1]); });
    fm.tex = T.map; fm.lib = L; fm.libTex = T;
  });
})();
/* a piece in a colour-carrying pattern family (tapestry, kilim) is drawn white over the pattern; without the pack, in c */
function vothPatCol(fam, c){ return FAMMAT[fam] && FAMMAT[fam].lib ? 0xffffff : c; }
/* the adapter: every family as a material record, for the export (window._materials) */
(function(){
  if(typeof KMAT === 'undefined') return;
  var recs = {};
  Object.keys(FAMMAT).forEach(function(fam){
    var fm = FAMMAT[fam], L = fm.lib;
    recs[fam] = { id:'voth.'+fam, family:fam, scale: L ? L.scale : fm.scale, tint:true, roughness: L ? 1 : Math.min(1, fm.rough||1),
      metal: L ? (L.metal||0) : 0, specular: L ? L.specular : 0.5, normalScale: L ? L.normalScale : 1, breakup: L ? (L.breakup||null) : null,
      lib: L ? L.lib : null, tex: L ? null : (fm.tex ? 'voth.'+fam : null), bake: !L && !!fm.tex,
      hook: fam === 'cloth' ? 'world-uv+cloth-sway' : 'world-uv', note: L ? 'library set, tint keep '+L.tint : (fm.tex ? 'procedural map' : 'untextured') };
  });
  KMAT.adapter('voth', recs);
  window._fammat = FAMMAT;   /* dev handle: the families and their maps (inspection and the brightness measure) */
  window._materials = KMAT.table('voth');
})();
