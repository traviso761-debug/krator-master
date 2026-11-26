// ================================================================= CORE — stacks (rock standing on a heightfield: mesas, buttes, spires, fins)  [G data]
// Bedded rock bodies for any heightfield world: the necanyons' benches, caps and stacks (biomes/necanyons), Pinnacle Rock's
// mesa and its North Fins and Garden (settlements/pinnacle-rock/PLAN.md section 2), and any desert's hoodoo country. Grown
// from nwbay's karst stacks (biomes/nwbay/src/45-host-stage.js: one footprint function and one top function make the field,
// the height and the mesh agree, so a plant's foot is on the drawn rock), generalised to BEDS: a body is a pile of beds,
// each an irregular disc with its own centre, radii, strike, a notch at its foot (the soft parting weathers back) and a
// chamfer at its top edge. A bed narrower than the one below leaves a LEDGE; a cap wider than its neck is a balanced rock.
//
// No THREE, no DOM: plain maths, node-tested (test-stacks.js). Every draw is integer-hashed from core/rand (KRAND), by the
// body's seed and its bed's index, never by how many draws came before it. Axes: y up, metres, x east, z south.
//
//   KSTACKS.make({id, kind:'mesa'|'butte'|'spire'|'fin'|'balanced', x, z, y0 (the ground at the foot), seed, ...})
//        mesa/butte: tiers:[{h (the tier's rise), r (radius), e (elongation, 1 round), ry (strike, radians), dx, dz (the
//                    tier's centre from the body's)}], bed:[lo,hi] (bed thickness, m), lobes (.16: how ragged the outline)
//                    weather (.6; 0 clean-cut walls): flutes down the cliff, gullies notching the rim, each bed a metre or two
//                    in or proud; shoulder {h, back, bed} (the top tier: thin beds stepping back, a 30-45 degree slope of ledges)
//        spire/balanced/fin: H (height), r (radius at the foot), e (fin: 3..6), ry (strike), lean (radians), taper (.45),
//                    crown (the top bed's radius at its crest over its foot's: .8, a balanced cap .9; .5 a point, 1 a flat head)
//                    plates:[lo,hi] (RORAIMA'S KIND: the stack is a pile of thin beds lo..hi m thick, each plate its own
//                    width (jitter .25 of the radius), its parting weathered deep and its top rounded, knobbier outlines,
//                    no run-on taper between plates, a top-heavy crown; the record carries plates:true)
//        -> a record {id, kind, x, z, y0, seed, beds:[{k, y, h, cx, cz, rx, rz, ry, ch (chamfer), nt (notch), lob, ns, tier,
//           tp, tx, tz (a stack's taper and lean up the bed, run on into the next: one column, not a pile of drums),
//           wr, wn, gu (a mesa's weathering: the bed's own retreat in metres and its noise seed, its tier's gullies)}],
//           top, R (bounding radius about x,z)}
//   KSTACKS.footR(b, ang)      the bed's footprint radius at an angle about its own centre (the one footprint function)
//   KSTACKS.topH(b, x, z)      the bed's top surface at x,z (flat, a little rough: the one top function)
//   KSTACKS.at(list, x, z)     {S, b, top, d} the highest bed top over (x,z) (d its signed distance to that top's edge,
//                              negative inside), or null; KSTACKS.topAt(list,x,z) the height alone (-Infinity off the rock)
//   KSTACKS.surface(list, x, z, fr?, o?)  {S, b, top, d, wall, steep}: as at, but over a tapering bed's wall the wall's own
//                              height (a tower's dome holds a forest), steep its rise over its run; or null. The wall is a
//                              straight line from foot to top; o.drawn (2026-10-26, k-guilin's KNOWN_ISSUES) follows the drawn
//                              wall instead (the notch, the chamfer, the taper: prof and tAt, as mesh draws it)
//   KSTACKS.wall(B, b, a, u)   {x, y, z, nx, nz}: a point on bed b's wall (u 0 foot .. 1 top edge, a the angle) and its normal
//   KSTACKS.foot(list, x, z)   {S, d} the nearest body's foot: d the signed distance to its lowest bed's footprint
//   KSTACKS.ledge(list, x, z)  {S, b, w} when (x,z) is on a ledge (a bed's top out from under the bed above), else null
//   KSTACKS.ring(S, y, n)      the outline at height y: n [x,z] points (the roost placer fits a deck to it), or null
//   KSTACKS.mesh(S, opt)       {pos, uv, idx, part, bed, occ}: walls, tops and an overhang's underside; CCW from outside.
//                              part 0 wall, 1 top, 2 underside; occ 0..1 (the notch and the underside dark); uv in metres
//                              (walls: arc length and y; tops: x and z). opt.step (5 m: the wall's segment length);
//                              opt.topRings (5: rings in from a top's edge) and opt.segMax (160: the most segments round
//                              a bed) for a top that carries relief of its own through a wrapped topH (finer than 5 rings);
//                              or opt.top {grid: G, minCells: 3}: such a top drawn as a square G-metre grid (on world
//                              multiples of G) clipped to the top's edge ring, the ring shared with the wall's top row
//                              (a bed narrower than minCells cells keeps its rings; cells hidden under the bed above, a cell
//                              in from its foot, are left out unless cull: false). Without opt.top the mesh is as before
//   KSTACKS.row({id, seed, a:[x,z], b:[x,z], n, kind:'fin', H:[lo,hi], r:[lo,hi], e:[lo,hi], ground})   fins along a
//                              strike: one line, one lean
//   KSTACKS.cluster({id, seed, c:[x,z], rad, n, kinds:{spire,balanced,fin}, H, r, gap, ground, accept})   a garden of stacks
//        VARIETY (both layouts, each optional; a layout without them draws exactly as before, so a page that does not ask
//        for them does not move): taper:[lo,hi], lean:[lo,hi] (radians), e:[lo,hi] (a spire's elongation; a row's fins
//        had e already), crown:[lo,hi], each drawn per stack from a stream of its own (hash(seed, i, 406)); plates:[lo,hi]
//        with platesShare (.5): that share of the stacks are piles of plates (Roraima's kind); lift:(x,z,r)=>m
//        adds metres to a stack's height (a stack on a slope: its foot is set under the lowest ground round it, so the
//        uphill side buries that much of it; lift by the drop and the stack stands as tall above the uphill ground)
//   KSTACKS.tower({id, seed, x, z, H, R, y0 | foot})   a karst tower: a sheer cliff under a dome (guilin, nwbay); tower:true
//   KSTACKS.make({kind:'mound', id, x, z, H, r, ground | y0, seed, spires, flutes, fluteDepth, soil | soilAt, redden})
//                              A TERMITE CATHEDRAL (2026-10-26, core gap H10, biomes/hyperjungle/PLAN-LANDS.md section 11):
//                              fluted clay spires clustered on a skirt. H the main spire's top over the ground at x,z (6), r
//                              the girth (the skirt's radius at the ground: .45 H), spires (1..5 drawn: the main one and
//                              satellites leaning out from it, fused at the foot), flutes (7..12 grooves round the main
//                              spire; a satellite's in proportion; 0 none), fluteDepth (.16 of the radius). ground(x,z) is
//                              sampled round the skirt's foot (24 angles: the record's skirt bed carries them as gy, its
//                              foot on the ground less a sink (.06 m), its top level) and each spire's foot is set into
//                              the skirt as DRAWN (surface {drawn}), so nothing floats; without ground the foot is flat at
//                              y0. clay [r,g,b] 0..1: the ground's colour (soil, or soilAt(x,z), else red laterite)
//                              reddened toward ochre (redden .3) and varied per mound. The record: beds[0] the skirt
//                              (col -1), then each spire's beds (col 0 the main one); cols, clay, flutes. Its beds carry
//                              fn, fd, fp (the flutes: count, depth, phase; one column's beds share them, the grooves line
//                              up), rg (the top's roughness, m) and the skirt gy. at, surface, ledge, foot, wall, mesh and
//                              export take a mound as any body (ring: the first bed spanning y, the skirt then the main
//                              spire's). The mesh: a fluted bed gets 6 segments a flute (opt.perFlute), hidden tops left out
//   KSTACKS.mounds({id, world, cell, x0, z0, x1, z1, per, p, H:[lo,hi], r:[lo,hi], gap, ground, soil | soilAt, accept})
//                              a savannah's mounds BY CELL: each cell of `cell` metres (40) has `per` tries (1), each a
//                              mound with chance p (.3), every draw hashed from (world, cell i, cell j, try) and placed in
//                              its own cell inset by its girth, so any window over the same world gives the same mounds
//                              (a mound is in the window when its centre is). H [4,12] m, r (girth) .35-.55 H unless given
//   THE DRY AND FOLDED COUNTRY'S KINDS (2026-10-26: the outlands' C4, the SW highlands' section 4, Godstep's colonnades),
//   each foot that meets the ground set on it as DRAWN (gy round the foot, the record's `feet`); see each builder:
//   KSTACKS.make({kind:'dome', id, x, z, H, r, k, e, ry, pagoda, sheet, strata, ground | y0, seed})   an inselberg: exfoliation
//                              sheets up a superellipse profile (k), a pagoda's ledges; the strata hook o.strata(x,y,z)
//   KSTACKS.make({kind:'tor', id, x, z, H, r, cols, block, logan, clitter, ground | y0, seed})   a pile of rounded joint
//                              blocks in columns (their tops drawn: ot), a logan stone, clitter records round the foot
//   KSTACKS.make({kind:'arch', id, x, z, span, rise, H, t, leg, inward, ry, ground | y0, seed})   two corbelled legs and a
//                              lintel whose soffit (und) is drawn over the opening; the record's `opening`
//   KSTACKS.make({kind:'pillar', id, x, z, H, w, l, ry, sq, taper, lean, bed, strata, ground | y0, seed})   a jointed block
//                              tower: squared corners (sq), hard beds proud, soft ones notched, a flat top
//   KSTACKS.pillars({id, joints | blocks, x0, z0, x1, z1, zone, from, to, top, ground, minW, strata, accept})   the pillar
//                              rim: a tower in each standing block of the zone's band, by hash(world, i, j)
//   KSTACKS.make({kind:'chimney', id, x, z, form, H, r, e, ry, bore | wall, taper, flare, mouths, fork, lean, toward, state, cut, ledges, holdfasts, ice,
//                              fan, ground | y0, seed})   A HOLLOW COLUMN (2026-11-02: the Gills' breath pipes, the Cliff Lungs' bells, the Hearths' dead
//                              stalks, Siphon Pits' woolly trunks: one kind with a `form` of defaults, pipe | bell | stalk | siphon; see the builder)
//   KSTACKS.bore(B, {depth})   a chimney's bore as KCAVERN records: {shafts:[{id, owner, c, y0, y1, r0, r1}], opening}; the mesh's inner wall and these agree
//   mesa/butte o.columns {w:[1.2,2.4], d:.35, ent:.35}   columnar jointing on each tier's wall (a flow's front): the bed
//                              fields cw, cd, cs, prisms in footR, so the mesh, at() and wall() share them; nothing else moves
//   footR's sq (a superellipse) and a bed's und (its underside drawn whatever stands below) are opt-in fields
//   KSTACKS.weather(B, m, o)   the drawn mesh worn natural (an arch's upper corners rounded, two grains of KRAND noise, the feet
//                              kept on o.ground); the record is not changed (2026-10-26, opt-in; biomes/swhighlands)
//   KSTACKS.export(list) / KSTACKS.load(json)   {format:'krator-stacks', version:1, bodies}
//   KSTACKS.hash(mesh)         a fingerprint of a mesh's arrays (determinism)
(function(root){
  'use strict';
  var KR=root.KRAND;
  if(!KR) throw new Error('37-core-stacks: load core/rand/08-core-rand.js first');
  var TAU=Math.PI*2;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sm(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);}
  function S(seed){return KR.stream(seed>>>0);}

  // ---------------------------------------------------------------- the one footprint function
  // an ellipse (rx along the strike ry, rz across), its radius moved by two octaves of noise round the angle: coarse lobes
  // (the mesa's alcoves and points) and a fine fret. A bed's own noise seed ns; beds of one tier share it and both octaves (the
// wall is one wall; the beds show by their partings)
  function footR(b,ang){var a=ang-b.ry,c=Math.cos(a)/b.rx,s=Math.sin(a)/b.rz,R=b.sq?Math.pow(Math.pow(Math.abs(c),b.sq)+Math.pow(Math.abs(s),b.sq),-1/b.sq):1/Math.sqrt(c*c+s*s);   // sq: a superellipse (a jointed block's squared corners; 2 the ellipse)
    var ca=Math.cos(ang),sa=Math.sin(ang);
    var n=KR.fbm(ca*1.6+40,sa*1.6+40,b.tier*3.1,2,b.ns)-.5,f=KR.fbm(ca*5.5+80,sa*5.5+80,b.tier*.73,1,b.ns+7)-.5;   // the fret shared by a tier's beds too: one face, not a pile of bulges
    R=R*(1+b.lob*2*n+b.lob*.35*f);
    // FLUTES ROUND A COLUMN (a termite mound's, fn of them: buttresses and grooves standing straight up the spire, each a
    // little wandering in its spacing). fn is whole, so the grooves close round; a column's beds share fn, fp and the
    // wander's noise (ns, tier), so a groove runs from bed to bed
    if(b.fn){var fa=ang-b.ry+(KR.fbm(ca*1.3+60,sa*1.3+60,b.tier*2.3,1,b.ns+31)-.5)*1.4*TAU/b.fn,g=.5-.5*Math.cos(b.fn*fa+b.fp);R*=1-b.fd*Math.pow(g,1.5);}
    // WEATHERING (a mesa's or a butte's beds): each bed weathers back by its own metres (wr: its own noise, so the edge is
    // ragged and stepped, not one clean cut: a soft bed retreats under a harder one), and the tier's gullies (gu: [angle,
    // half-width (rad), depth (m)]) notch it, deepest at the rim, dying out down the cliff
    // FLUTES (fl, shared by the tier's beds: one face): vertical grooves and buttresses down the cliff, ~22 m apart, cut
    // where the joints run (a Monument Valley wall's)
    if(b.wr||b.gu||b.fl){var rec=b.wr?b.wr*(.5+2.2*(KR.fbm(ca*5+11,sa*5+11,b.k*.9,1,b.wn)-.5)):0;   // -.6..1.6 x wr: in or proud
      if(b.fl){var Rf=b.fr||R/22,u2=KR.fbm(ca*Rf+3,sa*Rf+3,b.tier*1.3,2,b.ns+23);rec+=b.fl*(1-Math.pow(Math.abs(2*u2-1),.6));}
      if(b.gu)for(var i=0;i<b.gu.length;i++){var g=b.gu[i],d=Math.atan2(Math.sin(ang-g[0]),Math.cos(ang-g[0]))/g[1];rec+=g[2]*Math.exp(-d*d);}
      R=Math.max(R*.3,R-rec);}
    // COLUMNS (cw, cd, cs: columnar jointing on a flow's front, Godstep's colonnades, the `columns` option): the wall a row of
    // prisms cw wide round the bed, each standing back by its own share of cd (hashed by column), its face bowed, a groove at
    // each joint. One count round the bed (whole, so the prisms close round), so the mesh, at() and wall() share them
    if(b.cw){var nc=Math.max(6,Math.round(TAU*(b.rx+b.rz)/2/b.cw)),fc=(((ang-b.ry)/TAU*nc)%nc+nc)%nc,ci=Math.floor(fc),cf=fc-ci;
      R=Math.max(R*.3,R-b.cd*(.25+.75*KR.unit(KR.hash(b.cs,ci,b.tier)))-b.cd*.45*(2*cf-1)*(2*cf-1)-b.cd*.6*(1-sm(0,.1,Math.min(cf,1-cf))));}
    return R;}
  // the bed's top: flat, with a little roughness (rock pans and knobs); the mesh's top vertices are on it exactly
  function topH(b,x,z){return b.y+b.h+(b.rg==null?.7:b.rg)*(KR.fbm(x*.045+b.ns%97,z*.045,b.k,2,b.ns+11)-.5)+(b.jag?jagAt(b,x,z):0);}   // rg: a mound's beds are smoother
  // a broken chimney's lip: metres down from its top, by the angle round the bore
  function jagAt(b,x,z){var c=cAt(b,1),a=Math.atan2(z-c[1],x-c[0]);return -b.jag*KR.fbm(Math.cos(a)*2.6+9,Math.sin(a)*2.6+9,b.k*.7,2,b.ns+41);}
  // a wall's height at share u up the bed, at angle a about its centre: straight from the foot, which is level (b.y) unless
  // the bed carries gy (a mound's skirt: the foot's height at gy.length angles round it, on the sampled ground)
  function gyAt(b,a){var N=b.gy.length,f=((a/TAU*N)%N+N)%N,i=Math.floor(f)%N,t=f-Math.floor(f);return b.gy[i]+(b.gy[(i+1)%N]-b.gy[i])*t;}
  function yAt(b,a,u){if(!b.gy)return b.y+u*b.h;var g=gyAt(b,a);return g+u*(b.y+b.h-g);}
  // the wall's radius factor up a bed (u 0 at its foot, 1 at its top): the notch weathered back at the parting, the chamfer
  function prof(b,u){var n=u<.2?1-b.nt*Math.pow(1-u/.2,2):1,c=u>.78?1-b.ch*Math.pow((u-.78)/.22,1.6):1;return n*c;}

  // ---------------------------------------------------------------- the bodies
  // THE KIND TABLE: each kind and the builder that makes it. A new kind is a row here and a builder below (the outlands' C4
  // `dome` and `tor`, biomes/outlands/PLAN.md section 12, are to be rows of their own); make() checks the kind against it
  var KINDS={mesa:'bedded',butte:'bedded',spire:'stack',fin:'stack',balanced:'stack',mound:'mound',dome:'dome',tor:'tor',arch:'arch',pillar:'pillar',chimney:'chimney'};
  // tp: the bed's radius at its top over its foot's, tx/tz: its centre's shift up the bed (a stack's taper and lean, run
  // on into the bed above, so a spire is one tapering, leaning column with its partings drawn as lines, not a pile of
  // drums); 1, 0, 0 for a mesa's or a butte's beds (their walls stand straight)
  function bed(k,y,h,cx,cz,rx,rz,ry,ch,nt,lob,ns,tier){return {k:k,y:y,h:h,cx:cx,cz:cz,rx:rx,rz:rz,ry:ry,ch:ch,nt:nt,lob:lob,ns:ns>>>0,tier:tier,tp:1,tx:0,tz:0,wr:0,wn:0,gu:null,fl:0};}
  // a bed's outline at height share u (0 its foot, 1 its top): its centre and its radius factor (the footprint function
  // footR times this) there
  function cAt(b,u){return [b.cx+(b.tx||0)*u,b.cz+(b.tz||0)*u];}
  function tAt(b,u){return 1+((b.tp==null?1:b.tp)-1)*u;}
  function make(o){
    if(!o||!KINDS[o.kind]) throw new Error('KSTACKS.make: kind must be one of '+Object.keys(KINDS).join(', '));
    if(o.id==null) throw new Error('KSTACKS.make: a body needs an id');
    var seed=(o.seed==null?KR.child(1,String(o.id)):o.seed)>>>0,x=o.x||0,z=o.z||0,y0=o.y0==null?0:o.y0,beds=[];
    if(KINDS[o.kind]==='mound')return mound(o,seed);
    if(BUILD[KINDS[o.kind]])return BUILD[KINDS[o.kind]](o,seed);
    if(o.kind==='mesa'||o.kind==='butte'){
      var tiers=o.tiers||[{h:o.H==null?120:o.H,r:o.r==null?150:o.r,e:o.e==null?1.3:o.e,ry:o.ry||0}];
      var bl=o.bed||[14,34],lob=o.lobes==null?.16:o.lobes,y=y0,k=0,W=o.weather==null?.6:o.weather;   // weather 0: clean-cut walls
      for(var t=0;t<tiers.length;t++){var T=tiers[t],rs=S(KR.hash(seed,t,101)),ns=KR.hash(seed,t,7),top=y+T.h,e=T.e==null?1.3:T.e;
        var cx=x+(T.dx||0),cz=z+(T.dz||0),rx=T.r*Math.sqrt(e),rz=T.r/Math.sqrt(e),ry=T.ry==null?(o.ry||0):T.ry;
        // THE SHOULDER (o.shoulder {h, back, bed:[lo,hi]}, the top tier only): over its last h metres the beds are thin and
        // each steps back from the cliff, `back` metres in all (h/back 0.6..1: a rough 30-45 degree slope of ledges up to the
        // cap rock, as a Monument Valley butte's top), the top inside it flat and whole
        var SH=t===tiers.length-1&&o.shoulder?o.shoulder:null,shY=SH?top-SH.h:Infinity,sbl=SH&&SH.bed?SH.bed:[3,7];
        while(y<top-1){var inSh=y>=shY-.01,b0=inSh?sbl:bl,h=Math.min(rs.range(b0[0],b0[1]),top-y);if(top-y-h<b0[0]*.6)h=top-y;
          if(!inSh&&y+h>shY+b0[0]*.4)h=Math.max(shY-y,1);   // the cliff's last bed ends where the shoulder starts
          var last=y+h>=top-.01,j=1+rs.range(-.012,.012)+(last?.012:0),M=Math.max(rx,rz);   // the cap rock stands a little proud: harder
          var dS=0;if(inSh){var sb=(y+h-shY)/SH.h;j=1+rs.range(-.002,.002);dS=Math.min(M*.5,SH.back*sb+rs.range(-.12,.12)*SH.back/Math.max(2,SH.h/5));}   // metres back, both axes; each ledge a step
          // the chamfer and the notch are metres (a parting weathers back a metre or two whatever the mesa's size), kept as
          // fractions of the bed's radius
          beds.push(bed(k++,y,h,cx,cz,rx*j-dS,rz*j-dS,ry,(last?rs.range(1.5,3):rs.range(.4,1.2))/M,(last?rs.range(2,4):rs.range(.5,1.8))/M,lob,ns,t));y+=h;}
        // the tier weathered: its beds' own retreat (the cap rock, harder, least) and its gullies, a few per 200 m of rim
        if(W>0){var t0=y-T.h,M2=Math.max(rx,rz),per=TAU*Math.sqrt((rx*rx+rz*rz)/2),ng=Math.round(per/130*W),gs=S(KR.hash(seed,t,131)),G=[];
          for(var q=0;q<ng;q++)G.push([gs.range(0,TAU),gs.range(7,22)/M2,Math.min(gs.range(18,55)*W,M2*.3)]);
          for(var bi=0;bi<beds.length;bi++){var bb=beds[bi];if(bb.tier!==t)continue;var top2=bb.y+bb.h>=y-.01;
            bb.wr=Math.min(W*gs.range(.6,2.6)*(top2?.6:1),M2*.05);bb.wn=KR.hash(seed,t,bb.k,137)>>>0;bb.fl=Math.min(W*6,M2*.04);bb.fr=M2/22;   // one flute scale for the tier: its beds' grooves line up
            var f=sm(.1,.95,(bb.y+bb.h-t0)/T.h);if(f>.02&&G.length)bb.gu=G.map(function(g){return [g[0],g[1],g[2]*f];});}}
        if(o.columns)colonnade(beds,t,y-T.h,T.h,seed,o.columns);}
    }else{
      var r=S(KR.hash(seed,0,202)),H=o.H==null?60:o.H,r0=o.r==null?12:o.r,e2=o.kind==='fin'?(o.e==null?4:o.e):(o.e==null?1.15:o.e);
      var ry2=o.ry==null?r.range(0,TAU):o.ry,lean=o.lean==null?r.range(0,.06):o.lean,la=o.kind==='fin'?ry2+(r.chance(.5)?0:Math.PI):r.range(0,TAU);
      var PL=o.plates&&o.plates.length===2?o.plates:null,jit=o.jitter==null?(PL?.3:0):o.jitter;   // plates: Roraima's piles
      var taper=o.taper==null?(o.kind==='fin'?.35:PL?.3:.45):o.taper,n=Math.max(3,Math.round(H/(PL?r.range(PL[0],PL[1]):r.range(12,20)))),yy=y0,hs=[],sum=0,i;
      for(i=0;i<n;i++){var w=r.range(PL?.4:.7,PL?1.8:1.3);hs.push(w);sum+=w;}   // plates: thin and thick ones in one pile
      var neck=o.kind==='balanced'?n-2:-1,lobS=o.kind==='fin'?.07:PL?.16:.1;
      for(i=0;i<n;i++){var hh=H*hs[i]/sum,u=(yy-y0)/H,rr=r0*(1-taper*u)*(PL?r.range(1-jit,1+jit):r.range(.97,1.03)),off=Math.tan(lean)*(yy-y0);
        var ccx=x+Math.cos(la)*off,ccz=z+Math.sin(la)*off,cap=i===n-1;
        if(i===neck)rr*=r.range(.45,.6);
        if(cap&&o.kind==='balanced'){rr=r0*r.range(.95,1.25);hh=Math.max(hh,rr*r.range(.7,1.1));}
        var rm=Math.max(rr*Math.sqrt(e2),rr/Math.sqrt(e2)),fine=i===neck||(cap&&o.kind==='balanced');   // metres again: a stack's partings are fine, a neck's deep; a plate's deep and its top rounded
        beds.push(bed(i,yy,hh,ccx,ccz,rr*Math.sqrt(e2),rr/Math.sqrt(e2),ry2+r.range(-.02,.02),(PL?r.range(.25,.7):fine?r.range(.6,1.2):r.range(.15,.4))/rm,(PL?r.range(1.2,2.8):fine?r.range(.5,1):r.range(.1,.35))/rm,lobS,KR.hash(seed,PL?i+1:0,9),0));yy+=hh;}   // a plate's outline is its own (its own noise seed): knobs, not one fret   // one outline up the stack (one noise seed, one tier): its beds differ in the fret only
      // the taper and the lean run on: each bed's top meets the next bed's foot (a balanced rock's neck keeps its own width
      // under the cap); the crest narrows (its shoulders weathered round)
      for(i=0;i<n;i++){var b0=beds[i],b1=beds[i+1];
        if(b1&&!(o.kind==='balanced'&&i===n-2)){b0.tp=PL?1:Math.min(b1.rx/b0.rx,1.15);b0.tx=b1.cx-b0.cx;b0.tz=b1.cz-b0.cz;}   // a plate keeps its width: the parting steps
        else if(!b1)b0.tp=o.crown==null?(o.kind==='balanced'?.9:PL?1:.8):o.crown;}
    }
    var R=0;beds.forEach(function(b){var m=Math.max(b.rx,b.rz)*(1+2.5*b.lob)+Math.hypot(b.cx-x,b.cz-z);if(m>R)R=m;});
    var tp=beds[beds.length-1];
    var rec={id:String(o.id),kind:o.kind,x:x,z:z,y0:y0,seed:seed,beds:beds,top:tp.y+tp.h,R:R+2};if(o.plates&&o.plates.length===2)rec.plates=true;return rec;
  }

  // ---------------------------------------------------------------- the mound (a termite cathedral)
  // The skirt first (a broad apron, its foot flared out (nt < 0) and on the sampled ground, its shoulder rounded (ch), its
  // top level), then the spires: the main one near the centre, the satellites round it on the skirt's top and shoulder,
  // leaning out, fused at the foot. A spire is a column of beds whose taper and lean run on (as a stack's), its foot flared into the skirt, narrowing to a
  // blunt point; its foot is set into the skirt as the skirt is DRAWN (the drawn surface under the spire's foot ring, less
  // a few centimetres), never on the skirt's nominal top. Every draw: the skirt's from hash(seed, 0, 701), a column's from
  // hash(seed, c, 702), the clay's from hash(seed, 0, 703)
  var OCHRE=[.72,.38,.2],LATERITE=[.6,.34,.22],GYN=24;
  function mound(o,seed){
    var x=o.x||0,z=o.z||0,r=S(KR.hash(seed,0,701)),H=o.H==null?6:o.H,G=o.r==null?H*.45:o.r,gr=o.ground||null;
    var nfD=Math.round(r.range(7,12)),nf=o.flutes==null?nfD:Math.round(o.flutes),fd=o.fluteDepth==null?.16:o.fluteDepth;
    var nsD=r.int(1,5),nsp=Math.max(1,o.spires==null?nsD:Math.round(o.spires)),hs=H*r.range(.14,.22),tps=r.range(.5,.62),es=r.range(1,1.2),rys=r.range(0,TAU),fp0=r.range(0,TAU);
    var flare=-.22,sink=o.sink==null?.06:o.sink,gC=gr?gr(x,z):(o.y0==null?0:o.y0),ns=KR.hash(seed,0,9)>>>0;
    // the skirt: its radius at the ground (the flare's) is the girth
    var Gf=G/(1-flare),sk=bed(0,0,1,x,z,Gf*Math.sqrt(es),Gf/Math.sqrt(es),rys,.3,flare,.07,ns,0);
    sk.tp=tps;sk.col=-1;sk.rg=.05;if(nf>0){sk.fn=nf;sk.fd=fd*.5;sk.fp=fp0;}
    var Ytop,yb;
    if(gr){var gy=[],gmax=-Infinity;for(var i=0;i<GYN;i++){var a=i/GYN*TAU,R0=footR(sk,a)*(1-flare),g=gr(x+Math.cos(a)*R0,z+Math.sin(a)*R0);gmax=Math.max(gmax,g);gy.push(g-sink);}
      yb=Math.min.apply(null,gy);Ytop=gmax+hs;sk.gy=gy;}
    else{yb=gC;Ytop=gC+hs;}
    sk.y=yb;sk.h=Ytop-yb;
    var beds=[sk],drawnSk={x:x,z:z,R:Gf*Math.max(Math.sqrt(es),1)*1.6+1,beds:[sk]};
    function onSkirt(px,pz){var s=surface([drawnSk],px,pz,null,{drawn:true});return s?s.top:(sk.gy?gyAt(sk,Math.atan2(pz-z,px-x)):yb);}
    // the columns
    var Rt=Gf*Math.min(Math.sqrt(es),1/Math.sqrt(es))*tps*(1-sk.ch),embed=Math.max(.05,.02*G),rm=0,cols=0;
    for(var c=0;c<nsp;c++){var q=S(KR.hash(seed,c,702)),main=c===0;
      var dA=q.range(0,TAU),dR=q.range(0,1),rF=q.range(0,1),hF=q.range(.3,.75),e=q.range(1,1.2),ry=q.range(0,TAU),lean=q.range(main?0:.04,main?.05:.13),lA=q.range(0,TAU),fp=q.range(0,TAU),taper=q.range(.78,.86),crown=q.range(.3,.42);
      var cx,cz,r0,top;
      if(main){r0=Rt*(.8+.15*rF);var d0=Rt*.15*dR;cx=x+Math.cos(dA)*d0;cz=z+Math.sin(dA)*d0;top=gC+H;}
      else{var aj=fp0+c/(nsp-1)*TAU+(dA-Math.PI)*.25/Math.max(1,nsp-1),dj=Rt*(.55+.3*dR);r0=Math.min(rm*(.35+.25*rF),(Rt*1.25-dj)/1.35);   /* its flared foot (1.35) on the skirt */
        if(r0<rm*.2)continue;cx=x+Math.cos(aj)*dj;cz=z+Math.sin(aj)*dj;lA=aj;top=gC+H*hF;}
      var fn=nf>0?Math.max(4,Math.round(nf*(main?1:r0/rm))):0,col=columnBeds(c,cx,cz,r0,e,ry,fn,fd,fp,KR.hash(seed,c,9)>>>0,taper,crown,Math.max(3,Math.min(9,Math.round((top-gC)/.9))));
      // the foot set into the drawn skirt: the lowest drawn height under the column's foot ring, less embed
      var lo=Infinity,b0=col[0];for(i=0;i<32;i++){var a2=i/32*TAU,R2=footR(b0,a2)*prof(b0,0);lo=Math.min(lo,onSkirt(b0.cx+Math.cos(a2)*R2,b0.cz+Math.sin(a2)*R2));}
      var y0c=lo-embed,Hc=Math.max(top-y0c,(top-gC)*.4),hb=Hc/col.length,off=Math.tan(lean);
      col.forEach(function(b,i){b.y=y0c+i*hb;b.h=hb;b.cx=cx+Math.cos(lA)*off*i*hb;b.cz=cz+Math.sin(lA)*off*i*hb;b.tx=Math.cos(lA)*off*hb;b.tz=Math.sin(lA)*off*hb;});
      if(main)rm=r0;cols++;beds=beds.concat(col);}
    beds.forEach(function(b,i){b.k=i;});
    var R=0,top2=-Infinity;beds.forEach(function(b){for(var i=0;i<16;i++){var a=i/16*TAU,m=footR(b,a)*Math.max(1,prof(b,0))+Math.hypot(b.cx-x,b.cz-z)+Math.hypot(b.tx,b.tz);if(m>R)R=m;}top2=Math.max(top2,b.y+b.h);});
    // the clay: the ground's colour, reddened toward ochre (termites build from the subsoil) and a little lighter or darker
    var soil=o.soil||(o.soilAt?o.soilAt(x,z):null)||LATERITE,cr=S(KR.hash(seed,0,703)),rd=o.redden==null?.3:o.redden,lt=1.04+cr.range(-.05,.05);
    var clay=[0,1,2].map(function(i){return clamp((soil[i]+(OCHRE[i]-soil[i])*rd)*lt,0,1);});
    return {id:String(o.id),kind:'mound',x:x,z:z,y0:yb,seed:seed,beds:beds,top:top2,R:R*1.08+.5,cols:cols,flutes:nf,clay:clay};}
  // a spire's nb beds, laid out flat (their heights and the lean's offsets are set once the foot is known), the
  // radius r0 (1 - taper t^1.4) up it, the last closing to crown of its foot's radius under a rounded chamfer
  function columnBeds(c,cx,cz,r0,e,ry,fn,fd,fp,ns,taper,crown,nb){
    var out=[];
    function rr(t){return r0*(1-taper*Math.pow(t,1.4));}
    for(var i=0;i<nb;i++){var R0=rr(i/nb),last=i===nb-1,b=bed(i,0,1,cx,cz,R0*Math.sqrt(e),R0/Math.sqrt(e),ry,last?.25:0,i?0:-.35,.05,ns,c+1);
      b.tp=last?crown:rr((i+1)/nb)/R0;b.col=c;b.rg=.04;if(fn>0){b.fn=fn;b.fd=fd;b.fp=fp;}out.push(b);}
    return out;}
  // a savannah's mounds by cell (see the header): plain records, each from its own cell's hashes
  function mounds(o){var C=o.cell==null?40:o.cell,per=o.per==null?1:o.per,p=o.p==null?.3:o.p,Hr=o.H||[4,12],gap=o.gap==null?4:o.gap,w=o.world==null?0:o.world,out=[];
    var i0=Math.floor(o.x0/C),i1=Math.floor(o.x1/C),j0=Math.floor(o.z0/C),j1=Math.floor(o.z1/C);
    for(var j=j0;j<=j1;j++)for(var i=i0;i<=i1;i++){var here=[];
      for(var t=0;t<per;t++){var s=S(KR.hash(w,i,j,t,0x3D1)),hit=s.chance(p),H=s.range(Hr[0],Hr[1]),gf=s.range(.35,.55),rg=o.r?s.range(o.r[0],o.r[1]):H*gf,u=s.next(),v=s.next();
        if(!hit)continue;var ins=Math.min(C/2,rg*1.3+gap/2),x=i*C+ins+u*(C-2*ins),z=j*C+ins+v*(C-2*ins),ok=true;
        for(var q=0;q<here.length&&ok;q++)if(Math.hypot(here[q][0]-x,here[q][1]-z)<(here[q][2]+rg)*1.3+gap)ok=false;
        if(!ok||(o.accept&&!o.accept(x,z,rg)))continue;here.push([x,z,rg]);   // kept before the window's cut: a cell's mounds do not hang on the window
        if(x<o.x0||x>=o.x1||z<o.z0||z>=o.z1)continue;
        out.push(make({id:(o.id==null?'mound':o.id)+':'+i+','+j+':'+t,kind:'mound',x:x,z:z,H:H,r:rg,seed:KR.hash(w,i,j,t,0x3D2),ground:o.ground,y0:o.y0,soil:o.soil,soilAt:o.soilAt}));}}
    return out;}

  // ---------------------------------------------------------------- the dry and folded country's kinds (2026-10-26)
  // dome and tor (the outlands' C4: inselbergs and boulder piles on the plains), arch (the SW highlands' ridges, where a
  // hard bed is breached) and pillar (the pillar rim's free-standing towers, laid out by KSTACKS.pillars). Each foot that
  // meets the ground is set on it as the mound's skirt is: gy, the ground sampled round the DRAWN foot (both the notched and
  // the full radius, the lower taken) less a sink, so no foot floats on a slope; the record lists them in `feet`.
  // THE STRATA HOOK (dome, pillar): o.strata(x, y, z) -> {h (the bed's thickness from y up), hard (0..1)} or null, called
  // up the body from its foot (core/terrain/STRATA-PLAN.md's S.at answers it); a hard bed stands proud, a soft one is
  // notched back. Without it the beds are drawn from the body's seed
  // (each angle's gy the lowest of the ground at both radii and half a step either side, so the foot does not ride over a
  // dip between two samples)
  function setFoot(b,gr,sink,top){var c=cAt(b,0),N=Math.max(GYN,Math.min(160,Math.round(TAU*Math.max(b.rx,b.rz)/5))),gy=[],gmax=-Infinity,p0=prof(b,0);
    for(var i=0;i<N;i++){var g=Infinity;for(var j=-2;j<=2;j++){var a=(i+j/4)/N*TAU,R=footR(b,a);g=Math.min(g,gr(c[0]+Math.cos(a)*R*Math.max(1,p0),c[1]+Math.sin(a)*R*Math.max(1,p0)),gr(c[0]+Math.cos(a)*R*Math.min(1,p0),c[1]+Math.sin(a)*R*Math.min(1,p0)));}
      if(g>gmax)gmax=g;gy.push(g-sink);}
    b.gy=gy;b.y=Math.min.apply(null,gy);if(top!=null)b.h=Math.max(top,b.y+.3)-b.y;return gmax;}
  function bound(beds,x,z){var R=0,top=-Infinity;beds.forEach(function(b){for(var i=0;i<16;i++){var a=i/16*TAU,m=footR(b,a)*Math.max(1,prof(b,0))*Math.max(1,tAt(b,1))+Math.hypot(b.cx-x,b.cz-z)+Math.hypot(b.tx||0,b.tz||0);if(m>R)R=m;}top=Math.max(top,b.y+b.h);});return [R*1.08+.5,top];}
  // A DOME (an inselberg, a bornhardt; Span's beehives): exfoliation sheets (the beds, sheet:[3,8] m, or the strata hook's)
  // piled to H over the ground at x,z, the radius r (H*1.4) at the foot closing up a superellipse profile (1-t^k)^(1/k): k
  // (2..3 drawn) 2 a round dome, higher a steep-sided, flat-topped bornhardt, under 2 a sugarloaf. e (1..1.35), ry; pagoda
  // (0): each sheet's wall stands steeper and leaves a ledge (Span's pagoda domes). ground: the foot on it (else y0)
  function dome(o,seed){var x=o.x||0,z=o.z||0,r=S(KR.hash(seed,0,801)),H=o.H==null?60:o.H,R0=o.r==null?H*1.4:o.r,gr=o.ground||null;
    var eD=r.range(1,1.35),ryD=r.range(0,TAU),kD=r.range(2,3),e=o.e==null?eD:o.e,ry=o.ry==null?ryD:o.ry,k=o.k==null?kD:o.k,pg=o.pagoda==null?0:o.pagoda,sh=o.sheet||[3,8];
    var gC=gr?gr(x,z):(o.y0==null?0:o.y0),sink=o.sink==null?.1:o.sink,ns=KR.hash(seed,0,9)>>>0,ys=[0],hd=[],yy=0,m=0;
    function pr(t){return Math.pow(Math.max(0,1-Math.pow(Math.min(1,t),k)),1/k);}
    while(yy<H-1e-6&&m<60){var q=o.strata?o.strata(x,gC+yy,z):null,th=Math.max(sh[0],H/40),hh=q&&q.h>0?q.h:th+(Math.max(th,sh[1])-th)*KR.unit(KR.hash(seed,m,802));
      hh=Math.max(hh,H/60);if(H-yy-hh<hh*.4)hh=H-yy;yy=Math.min(H,yy+hh);ys.push(yy);hd.push(q&&q.hard!=null?q.hard:null);m++;}
    var beds=[],n=ys.length-1;
    // one outline up the dome (one noise seed, one tier): each sheet's top is the next sheet's foot, so the wall runs on and
    // its hidden tops are left out (col 0, a column); a pagoda's sheets stand steeper and leave each top a ledge (no col)
    for(var i=0;i<n;i++){var f0=i?pr(ys[i]/H):1,f1=pr(ys[i+1]/H),hard=hd[i];
      var b=bed(i,gC+ys[i],ys[i+1]-ys[i],x,z,R0*Math.sqrt(e)*f0,R0/Math.sqrt(e)*f0,ry,i===n-1?.3:.004,hard==null?.008:.01+.05*(1-hard),.06,ns,0);
      var tpN=Math.max(.12,f1/Math.max(1e-6,f0));b.tp=i===n-1?tpN:pg>0?tpN+(1-tpN)*pg*.6:tpN;b.rg=.25;if(!(pg>0))b.col=0;beds.push(b);}
    if(gr)setFoot(beds[0],gr,sink,gC+ys[1]);
    var bb=bound(beds,x,z);return {id:String(o.id),kind:'dome',x:x,z:z,y0:beds[0].y,seed:seed,beds:beds,top:bb[1],R:bb[0],feet:[0],k:k,e:e};}
  // A TOR (a granite tor, the plains' boulder piles): cols (2..5 drawn) columns of joint blocks, the main one H (6) tall near
  // the centre, the others round it at .45-.8 of r (H*.9) and .35-.8 of H; a block is block:[1,2.6] m high, a rounded square
  // (sq 2.6-4, a deep rounded parting, a rounded shoulder), set a little askew on the one below, each narrower or as wide;
  // the main column's top may be a perched logan stone (a quarter of tors). Each column's foot on the ground (ground) or
  // y0. clitter: loose blocks round the foot, {x,z,r,y} for the kit to strew (the kit's own rocks)
  function tor(o,seed){var x=o.x||0,z=o.z||0,r=S(KR.hash(seed,0,811)),H=o.H==null?6:o.H,Rr=o.r==null?H*.9:o.r,gr=o.ground||null,bl=o.block||[1,2.6];
    var nD=r.int(2,5),ryD=r.range(0,TAU),lgD=r.chance(.25),n=o.cols==null?nD:Math.max(1,Math.round(o.cols)),ry=o.ry==null?ryD:o.ry,lg=o.logan==null?lgD:!!o.logan;
    var sink=o.sink==null?.12:o.sink,gC=gr?gr(x,z):(o.y0==null?0:o.y0),beds=[],feet=[],cols=0,EMB=.04;
    for(var c=0;c<n;c++){var q=S(KR.hash(seed,c,812)),main=c===0,ang=q.range(0,TAU),dist=(main?q.range(0,.15):q.range(.45,.8))*Rr,hF=main?1:q.range(.35,.8),w=Rr*(main?q.range(.4,.55):q.range(.25,.4));
      var cx=x+Math.cos(ang)*dist,cz=z+Math.sin(ang)*dist,yb=gr?gr(cx,cz):gC,top=H*hF,yy=0,kk=0,col=[];
      while(yy<top-.3&&kk<8){var hb=Math.min(q.range(bl[0],bl[1]),top-yy);if(top-yy-hb<bl[0]*.5)hb=top-yy;
        var e=q.range(.75,1.35),b=bed(0,yb+yy-(kk?EMB:0),hb+(kk?EMB:0),cx+q.range(-.08,.08)*w,cz+q.range(-.08,.08)*w,w*Math.sqrt(e),w/Math.sqrt(e),ry+q.range(-.12,.12),q.range(.18,.32),q.range(.12,.25),.04,KR.hash(seed,c,kk,813)>>>0,c);
        b.sq=q.range(2.6,4);b.rg=.04;b.col=c;b.ot=true;b.tp=q.range(.9,1);col.push(b);yy+=hb;kk++;w*=q.range(.78,1);}
      if(!col.length)continue;
      if(main&&lg&&col.length>1){var ls=col[col.length-1];ls.nt=.45;ls.rx*=1.15;ls.rz*=1.15;}   // a logan stone: a wide block on a narrow seat
      if(gr){var b0=col[0],t0=b0.y+b0.h;setFoot(b0,gr,sink,t0);var lift=b0.y+b0.h-t0;if(lift>0)for(var i=1;i<col.length;i++)col[i].y+=lift;}   // a block buried uphill keeps .3 m showing: the pile rides up with it
      feet.push(beds.length);beds=beds.concat(col);cols++;}
    beds.forEach(function(b,i){b.k=i;});
    var cl=S(KR.hash(seed,0,814)),nc=o.clitter==null?cl.int(3,9):o.clitter,clit=[];
    for(i=0;i<nc;i++){var a=cl.range(0,TAU),d=Rr*cl.range(1.1,2.2),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;clit.push({x:px,z:pz,r:H/6*cl.range(.2,.6),y:gr?gr(px,pz):gC});}
    var bb=bound(beds,x,z);return {id:String(o.id),kind:'tor',x:x,z:z,y0:Math.min.apply(null,feet.map(function(k){return beds[k].y;})),seed:seed,beds:beds,top:bb[1],R:bb[0],cols:cols,feet:feet,clitter:clit};}
  // AN ARCH (where a hard bed is breached on a ridge; the SW highlands' folds): two legs and a lintel, the fin striking ry.
  // span (12: the opening's width at its foot), rise (span*.8: its height), H (rise*1.6: the lintel's top), t (the fin's
  // thickness: .3-.45 of the span), leg (each leg's length along the strike: .5-.7 of the span), inward (.12-.22: each leg's
  // beds step in over the opening, corbelled, so it closes toward the crown to span*(1-2*inward)). Each leg's foot on the
  // ground at its own place; the lintel is one bed over both legs, its soffit (und) drawn over the opening. The record:
  // cols 3 (the legs 0 and 1, the lintel 2), feet, opening {x, z, y0 (the ground at x,z), y1 (the soffit), w0, w1, ry}
  function arch(o,seed){var x=o.x||0,z=o.z||0,r=S(KR.hash(seed,0,821)),gr=o.ground||null,span=o.span==null?12:o.span,rise=o.rise==null?span*.8:o.rise,H=o.H==null?rise*1.6:o.H;
    var tD=r.range(.3,.45),ryD=r.range(0,TAU),inD=r.range(.12,.22),lwD=r.range(.5,.7),t=o.t==null?span*tD:o.t,ry=o.ry==null?ryD:o.ry,inw=o.inward==null?inD:o.inward,lw=o.leg==null?span*lwD:o.leg;
    if(!(H>rise+.5))throw new Error('KSTACKS.make arch: H must stand over the rise');
    var sink=o.sink==null?.12:o.sink,ux=Math.cos(ry),uz=Math.sin(ry),gC=gr?gr(x,z):(o.y0==null?0:o.y0),yO=gC+rise,beds=[],feet=[],ns=KR.hash(seed,0,9)>>>0;
    for(var c=0;c<2;c++){var sg=c?1:-1,q=S(KR.hash(seed,c,822)),lx=x+ux*sg*(span/2+lw/2),lz=z+uz*sg*(span/2+lw/2),gb=gr?gr(lx,lz):gC;
      if(!(yO-gb>1))throw new Error('KSTACKS.make arch: leg '+c+' stands on ground within a metre of the opening\'s top');
      var nb=Math.max(2,Math.round((yO-gb)/q.range(2,4))),hb=(yO+.15-gb)/nb;feet.push(beds.length);
      for(var i=0;i<nb;i++){var ex=inw*span*Math.pow((i+1)/nb,2),b=bed(0,gb+i*hb,hb,lx-ux*sg*ex/2,lz-uz*sg*ex/2,(lw+ex)/2,t/2,ry+q.range(-.02,.02),i===nb-1?0:q.range(.01,.03),q.range(.01,.04),.04,ns,c);
        b.sq=3;b.col=c;b.rg=.05;beds.push(b);}
      if(gr)setFoot(beds[feet[c]],gr,sink,gb+hb);}
    var L=bed(0,yO,gC+H-yO,x,z,span/2+lw+.3,t/2*.95,ry,.1,0,.05,ns,2);L.sq=3;L.col=2;L.rg=.08;L.und=true;beds.push(L);
    beds.forEach(function(b,i){b.k=i;});
    var bb=bound(beds,x,z);return {id:String(o.id),kind:'arch',x:x,z:z,y0:Math.min(beds[feet[0]].y,beds[feet[1]].y),seed:seed,beds:beds,top:bb[1],R:bb[0],cols:3,feet:feet,
      opening:{x:x,z:z,y0:gC,y1:yO,w0:span,w1:span*(1-2*inw),ry:ry}};}
  // A PILLAR (the pillar rim's towers, `pillar` sandstone): a jointed block w by l (40) standing H (250) over the ground,
  // a rounded square (sq 3..5) on the joints' strike ry, walls nearly sheer (taper .04-.12, lean up to .02 rad), beds
  // bed:[5,40] m (or the strata hook's): a soft bed notched back, a hard one proud (each bed's own width, so the partings
  // step), the top flat with a rounded rim. Its foot on the ground (ground) or y0
  function pillar(o,seed){var x=o.x||0,z=o.z||0,r=S(KR.hash(seed,0,831)),H=o.H==null?250:o.H,W=o.w==null?40:o.w,Lr=o.l==null?W:o.l,gr=o.ground||null,bl=o.bed||[5,40];
    var sqD=r.range(3,5),tpD=r.range(.04,.12),lnD=r.range(0,.02),la=r.range(0,TAU),sq=o.sq==null?sqD:o.sq,taper=o.taper==null?tpD:o.taper,ry=o.ry==null?0:o.ry,lean=o.lean==null?lnD:o.lean;
    var gC=gr?gr(x,z):(o.y0==null?0:o.y0),sink=o.sink==null?.2:o.sink,ns=KR.hash(seed,0,9)>>>0,beds=[],yy=0,m=0;
    while(yy<H-1e-6&&m<60){var q=o.strata?o.strata(x,gC+yy,z):null,hh=q&&q.h>0?q.h:bl[0]+(bl[1]-bl[0])*KR.unit(KR.hash(seed,m,832)),hard=q&&q.hard!=null?q.hard:KR.unit(KR.hash(seed,m,833));
      hh=Math.max(hh,H/60);if(H-yy-hh<hh*.4)hh=H-yy;var f=(1-taper*yy/H)*(1-.03*(1-hard)),off=Math.tan(lean)*yy,M=Math.max(W,Lr)/2;
      var b=bed(m,gC+yy,hh,x+Math.cos(la)*off,z+Math.sin(la)*off,W/2*f,Lr/2*f,ry,0,(.4+2*(1-hard))/M,.035,ns,0);b.sq=sq;beds.push(b);yy+=hh;m++;}
    for(var i=0;i<beds.length;i++){var b0=beds[i],b1=beds[i+1];if(b1){b0.tp=b1.rx/b0.rx;b0.tx=b1.cx-b0.cx;b0.tz=b1.cz-b0.cz;}else{b0.tp=o.crown==null?.97:o.crown;b0.ch=1.5/Math.max(W,Lr)*2;}}
    beds.forEach(function(b){b.tp=Math.min(b.tp,1);});   // a proud bed's foot over the soft one below: its underside drawn, not a wall leaning out
    if(gr)setFoot(beds[0],gr,sink,beds[0].y+beds[0].h);
    var bb=bound(beds,x,z);return {id:String(o.id),kind:'pillar',x:x,z:z,y0:beds[0].y,seed:seed,beds:beds,top:bb[1],R:bb[0],feet:[0]};}
  // A CHIMNEY: a hollow column of beds, its wall `wall` m thick all the way up (bore: the bore's radius at the foot instead; a
  // form gives the share of r). Its beds carry bo and bt (the bore's radius at their foot and top): at, surface and topAt see the
  // lip and not the hole (over the bore topAt is what stands under it, -Infinity when nothing does). Every bed has a col, so
  // at and ledge read it as they read a mound. o.form sets the defaults, and any option given overrides them:
  //   H height over the ground, r foot radius, e elongation, ry strike, lobes (.05), bed (m a bed: H/12, at least 1.5), taper (the neck's radius over the foot's)
  //   flare {from (the share of H it starts at), k (top radius over the column's there), p (the curve, 2)}: flared mouth, a bell; 0 none
  //   mouths 1..3 (a branching top), fork (.7: the share of H they part at), spread (.3 rad)
  //   lean (radians, drawn up to .05), toward [x,z] (its bearing, BIO.GIANT or a wind's; drawn without)
  //   state 'standing' | 'broken' (cut, drawn .3-.8 of H kept, a jagged lip) | 'rubble' (a stump, cut .12) | 'fallen' (lying down the bearing, one
  //   mouth; the record's `fall`: at, surface and foot answer the body lying there, the mesh draws it lying, ledge and ring answer null)
  //   fan {n, reach} the broken rings on the ground: solid chunk beds (col 100+) past the stump along the bearing; a state not
  //   standing has one by default (fan:false none)
  //   ledges [shares of H] a step inward of ledgeW (.5 m) at each (the bed nearest), on which KSTACKS.ledge answers
  //   holdfasts {n, reach (r), h (H*.2), w (r*.14)}: leaning solid props round the foot (col 50+), a bell's
  //   ice {from (.0: the share of H it starts at), thick (.3 m)}: an ice dress: the outline thickens by thick, the record's ice, and the mesh
  //   gains `ice` (0..1 a vertex, lumped by KRAND noise)
  // No GPU, no Math.random: every draw from (seed, slot, salt). The bore stays round (a shaft's), the outline takes the lobes. Laminae are a KSTRATA recipe's
  var CH_FORM={pipe:{H:30,r:4,wallK:.3,taper:.75,flare:{from:.8,k:1.35}},bell:{H:14,r:6,wallK:.12,taper:.7,flare:{from:.35,k:2.4,p:1.6},holdfasts:{n:6}},
    stalk:{H:18,r:.9,wallK:.25,taper:.8,flare:0,state:'broken'},siphon:{H:40,r:5,wallK:.22,taper:.6,flare:{from:.7,k:1.8}}};
  function chimney(o,seed){var F=CH_FORM[o.form==null?'pipe':o.form];if(!F)throw new Error('KSTACKS.make: a chimney\'s form is one of '+Object.keys(CH_FORM).join(', '));
    function p(k,d){return o[k]!=null?o[k]:F[k]!=null?F[k]:d;}
    var x=o.x||0,z=o.z||0,r=S(KR.hash(seed,0,841)),H=p('H',30),R0=p('r',4),gr=o.ground||null,ryD=r.range(0,TAU),laD=r.range(0,TAU),lnD=r.range(0,.05),cutD=r.range(.3,.8);
    var wall=o.wall!=null?o.wall:o.bore!=null?R0-o.bore:R0*F.wallK;if(!(wall>.02)||!(wall<R0))throw new Error('KSTACKS.make: a chimney\'s wall must be thinner than its radius (bore > 0)');
    var state=p('state','standing');if(['standing','broken','rubble','fallen'].indexOf(state)<0)throw new Error('KSTACKS.make: a chimney\'s state is standing, broken, rubble or fallen, not '+state);
    var ry=o.ry==null?ryD:o.ry,e=p('e',1),lob=p('lobes',.05),taper=p('taper',.75),fl=p('flare',0),T=o.toward,la=T?Math.atan2(T[1],T[0]):laD,lean=state==='fallen'?0:(o.lean==null?lnD:o.lean);
    var cut=state==='broken'?(o.cut==null?cutD:o.cut):state==='rubble'?(o.cut==null?.12:o.cut):1,fork=p('fork',.7),mouths=state==='fallen'||(state!=='standing'&&cut<=fork)?1:Math.max(1,Math.min(3,p('mouths',1)));
    var se=Math.sqrt(e),gC=gr?gr(x,z):(o.y0==null?0:o.y0),sink=o.sink==null?.3:o.sink,beds=[],I=o.ice||null,ns=KR.hash(seed,0,9)>>>0,LG=(o.ledges||[]).slice().sort(),LW=p('ledgeW',.5),bedH=Math.max(p('bed',H/12),1.5);
    function iceW(u){return I?sm((I.from==null?0:I.from)-.04,(I.from==null?0:I.from)+.04,u):0;}
    function radAt(u){var q=1-(1-taper)*u;if(fl){var fr=fl.from==null?.8:fl.from;if(u>fr)q*=1+((fl.k==null?1.5:fl.k)-1)*Math.pow((u-fr)/(1-fr),fl.p==null?2:fl.p);}return R0*q;}
    function column(col,x0,z0,y0,u0,u1,Rf,ln,az,tier){var n=Math.max(2,Math.round((u1-u0)*H/bedH));
      for(var i=0;i<n;i++){var a=u0+(u1-u0)*i/n,b=u0+(u1-u0)*(i+1)/n,step=0;LG.forEach(function(l){if(l<=a+1e-9&&l>u0)step+=LW;});
        var ra=Rf(a),rb=Rf(b),t=iceW(a),t2=iceW(b),th=I?(I.thick==null?.3:I.thick):0,oa=Math.max(ra-step,wall*.5+.02)+th*t,ob=Math.max(rb-step,wall*.5+.02)+th*t2,off=Math.tan(ln)*H,y=y0+(a-u0)*H,h=(b-a)*H;
        var B=bed(beds.length,y,h,x0+Math.cos(az)*off*(a-u0),z0+Math.sin(az)*off*(a-u0),oa*se,oa/se,ry,0,0,lob,ns,tier);B.tp=ob/oa;B.tx=Math.cos(az)*off*(b-a);B.tz=Math.sin(az)*off*(b-a);
        B.col=col;B.rg=.12;B.ot=1;B.bo=Math.max(ra-wall,.05);B.bt=Math.max(rb-wall,.05);beds.push(B);}}
    var u1=mouths>1?fork:cut;column(0,x,z,gC,0,u1,radAt,lean,la,0);
    if(mouths>1){var yF=gC+fork*H,ox=Math.cos(la)*Math.tan(lean)*fork*H,oz=Math.sin(la)*Math.tan(lean)*fork*H,sp=p('spread',.3),base=KR.unit(KR.hash(seed,0,842))*TAU;
      for(var m=0;m<mouths;m++){(function(m){var az=base+m*TAU/mouths,rf=radAt(fork)*(mouths===2?.68:.58),q=radAt(fork)*.42,RF=function(u){return Math.max(rf*(radAt(u)/radAt(fork)),wall+.05);};
        column(m+1,x+ox+Math.cos(az)*q,z+oz+Math.sin(az)*q,yF,fork,cut,RF,sp*(.8+.4*KR.unit(KR.hash(seed,m,843))),az,m+1);})(m);}}
    var feet=[0];if(gr&&state!=='fallen')setFoot(beds[0],gr,sink,beds[0].y+beds[0].h);
    var HF=p('holdfasts',null);
    if(state==='broken'||state==='rubble'){beds.forEach(function(b){var c=beds[b.k+1];if(!c||c.col!==b.col)b.jag=Math.min(b.h*.9,Math.max(.3,R0*.7));});}
    if(HF&&state!=='fallen'){var nh=HF.n==null?5:HF.n,reach=HF.reach==null?R0:HF.reach,hh=HF.h==null?H*.2:HF.h,w=HF.w==null?R0*.14:HF.w;
      for(var h=0;h<nh;h++){var az2=(h+.35*KR.unit(KR.hash(seed,h,844)))/nh*TAU,cx=x+Math.cos(az2)*(R0+reach),cz=z+Math.sin(az2)*(R0+reach),g=gr?gr(cx,cz):gC,b2=bed(beds.length,g-sink,gC+hh-g+sink,cx,cz,w,w,az2,.1,0,.08,ns,50+h);
        var rt=radAt(hh/H)-w*.5;b2.tx=x+Math.cos(az2)*rt-cx;b2.tz=z+Math.sin(az2)*rt-cz;b2.tp=.55;b2.col=50+h;b2.rg=.08;feet.push(beds.length);beds.push(b2);}}
    var ChN=beds.length,FN=o.fan===false?null:(o.fan||(state==='standing'?null:{})),G=null;
    if(state==='fallen'){var dxF=Math.cos(la),dzF=Math.sin(la),g0=gr?gr(x,z):gC,g1=gr?gr(x+dxF*H,z+dzF*H):gC,R1=radAt(1),y0a=g0+R0*.7,y1a=g1+R1*.7,dy=(y1a-y0a)/H,L=Math.hypot(1,dy);
      G={ax:x,ay:y0a,az:z,dx:dxF/L,dy:dy/L,dz:dzF/L,L:H};}
    if(FN){var nf=FN.n==null?Math.min(24,Math.max(3,Math.round(H*(1-(state==='fallen'?.7:cut))/(R0*.9)))):FN.n,fr2=FN.reach==null?H*.5:FN.reach,ox0=state==='fallen'?Math.cos(la)*H:0,oz0=state==='fallen'?Math.sin(la)*H:0;
      for(var c=0;c<nf;c++){var u=function(q){return KR.unit(KR.hash(seed,c,845+q));},a3=la+(u(0)-.5)*1.5,d=R0*1.2+fr2*Math.pow(u(1),1.4),px=x+ox0+Math.cos(a3)*d,pz=z+oz0+Math.sin(a3)*d,rc=R0*(.2+.35*u(2)),g3=gr?gr(px,pz):gC;
        var ch=bed(beds.length,g3-.15,rc*(.5+.5*u(3)),px,pz,rc,rc*.7,u(4)*TAU,.12,0,.14,ns,100+c);ch.col=100+c;ch.rg=.1;ch.tp=.9;beds.push(ch);}}
    var RR=0,top=-Infinity;beds.forEach(function(b){RR=Math.max(RR,Math.hypot(b.cx-x,b.cz-z)+Math.hypot(b.tx,b.tz)+Math.max(b.rx,b.rz)*Math.max(1,b.tp)*(1+2.5*b.lob));top=Math.max(top,b.y+b.h);});
    var rec={id:String(o.id),kind:'chimney',form:o.form==null?'pipe':o.form,state:state,x:x,z:z,y0:beds[0].y,seed:seed,beds:beds,top:top,R:RR*1.05+.5,cols:Math.max(1,mouths),feet:feet,wall:wall,toward:la,body:ChN};
    if(G){rec.fall=G;rec.R=Math.max(rec.R,H+R0*2);rec.top=G.ay+Math.max(0,G.dy)*H+radAt(1);}
    if(I){rec.ice={from:I.from==null?0:I.from,thick:I.thick==null?.3:I.thick};}
    return rec;}
  // the bore as KCAVERN.shaft records: one a bed (a shaft stands plumb, so a leaning bed takes its mean centre: off by at most half its shift), the last
  // going on o.depth (20 m) under the foot to meet what the kit draws below; opening: the well where it meets the ground. A fallen one has none
  function bore(B,o){if(B.kind!=='chimney')throw new Error('KSTACKS.bore: only a chimney has a bore');if(B.fall)return {shafts:[],opening:null};
    var dp=o&&o.depth!=null?o.depth:20,out=[],b0=B.beds[0];out.push({id:B.id+':throat',owner:B.id,c:[b0.cx,b0.cz],y0:b0.y-dp,y1:b0.y,r0:b0.bo,r1:b0.bo});
    B.beds.forEach(function(b){if(b.col<50)out.push({id:B.id+':bore'+b.k,owner:B.id,c:[b.cx+(b.tx||0)/2,b.cz+(b.tz||0)/2],y0:b.y,y1:b.y+b.h,r0:b.bo,r1:b.bt});});
    return {shafts:out,opening:{id:B.id+':well',c:[b0.cx,b0.cz],r:b0.bo,kind:'well'}};}
  // a fallen chimney's reading: t along the axis, q off it, R its radius there; d signed (negative under the body)
  function fallAt(B,x,z){var G=B.fall,h=Math.hypot(G.dx,G.dz),ex=x-G.ax,ez=z-G.az,t=(ex*G.dx+ez*G.dz)/(h*h),tc=clamp(t,0,G.L),q=Math.hypot(ex-G.dx*tc,ez-G.dz*tc),u=tc/G.L,R=0;
    for(var i=0;i<B.body;i++){var b=B.beds[i];if(b.col!==0)continue;var u0=(b.y-B.y0)/G.L,u1=(b.y+b.h-B.y0)/G.L;if(u>=u0&&u<=u1+1e-9){R=Math.max(b.rx,b.rz)*(1+(b.tp-1)*clamp((u-u0)/((u1-u0)||1),0,1));break;}}
    return {t:tc,q:q,R:R,d:q-R,top:G.ay+G.dy*tc+Math.sqrt(Math.max(0,R*R-q*q))};}
  function inBore(b,x,z){var c=cAt(b,1);return Math.hypot(x-c[0],z-c[1])<b.bt;}
  var BUILD={dome:dome,tor:tor,arch:arch,pillar:pillar,chimney:chimney};
  // THE PILLAR RIM's layout: KSTACKS.pillars({id, blocks | joints (KRELIEF.joints: its blocks in the box), x0, z0, x1, z1,
  // zone(x,z), from (.3: KRELIEF.tableland's z0, where the table ends), to (.9: past it the floor), top (y or fn: the
  // table's top), ground, minW (8), strata, accept}): a block whose centre's zone is in [from, to) stands as a tower, by a
  // chance falling toward `to` (1 - .75 t^1.5), shrunk inside its joints by the widened joint (.15 + .5 t of its width),
  // a third of them broken lower (by up to .6 t of their height), each from hash(world, i, j): the same tower in every window
  function pillars(o){if(!o||!(o.blocks||o.joints)||!o.zone||o.top==null)throw new Error('KSTACKS.pillars: blocks or joints, zone and top are needed');
    var BL=o.blocks||o.joints.blocks([o.x0,o.z0,o.x1,o.z1]),fr=o.from==null?.3:o.from,to=o.to==null?.9:o.to,w=(o.world==null?(o.joints?o.joints.world:0):o.world)>>>0,mw=o.minW==null?8:o.minW,out=[];
    BL.forEach(function(B){var zz=o.zone(B.cx,B.cz);if(zz<fr||zz>=to)return;var t=(zz-fr)/(to-fr),s=S(KR.hash(w,B.i,B.j,0x91)),stand=s.chance(1-.75*Math.pow(t,1.5)),gp=.15+.5*t,brk=s.next(),ln=s.next();
      if(!stand)return;var ww=B.w*(1-gp),ll=B.l*(1-gp);if(Math.min(ww,ll)<mw)return;
      var g=o.ground?o.ground(B.cx,B.cz):(o.y0==null?0:o.y0),T=typeof o.top==='function'?o.top(B.cx,B.cz):o.top,H=(T-g)*(brk<.35?1-brk/.35*.6*t:1);if(H<4)return;
      if(o.accept&&!o.accept(B.cx,B.cz,B))return;
      out.push(make({id:(o.id==null?'pillar':o.id)+':'+B.id,kind:'pillar',x:B.cx,z:B.cz,w:ww,l:ll,ry:B.ry,H:H,lean:Math.atan(Math.min(ww,ll)*gp*.25/H)*ln,ground:o.ground,y0:g,seed:KR.hash(w,B.i,B.j,0x92),strata:o.strata}));});
    return out;}
  // the `columns` option of a mesa or butte (a flow's front: Godstep): each tier is a flow, its lower beds the colonnade
  // (columns w:[1.2,2.4] m, one width a tier, standing back by up to d (.35 m)), the beds over ent (.35) of the tier the
  // entablature (narrow hackly columns, .45 of the width, twice as deep). Drawn from hash(seed, tier): the body's own
  // draws are not touched, so a mesa asked without columns is the mesa it was
  function colonnade(beds,t,t0,Th,seed,CO){var cwr=CO.w||[1.2,2.4],ent=CO.ent==null?.35:CO.ent,cd=CO.d==null?.35:CO.d,cw=cwr[0]+(cwr[1]-cwr[0])*KR.unit(KR.hash(seed,t,151));
    for(var i=0;i<beds.length;i++){var b=beds[i];if(b.tier!==t)continue;var up=(b.y+b.h/2-t0)/Th>1-ent;b.cw=up?cw*.45:cw;b.cd=up?cd*1.6:cd;b.cs=KR.hash(seed,t,up?153:152)>>>0;}}

  // ---------------------------------------------------------------- queries
  function inBed(b,x,z,shrink){var dx=x-b.cx,dz=z-b.cz,dist=Math.hypot(dx,dz),R=footR(b,Math.atan2(dz,dx))*shrink;return dist-R;}
  // the same at the bed's top (its taper and lean): where its top surface is
  function inTop(b,x,z,shrink){var c=cAt(b,1),dx=x-c[0],dz=z-c[1];return Math.hypot(dx,dz)-footR(b,Math.atan2(dz,dx))*tAt(b,1)*shrink;}
  function at(list,x,z){var best=null;
    for(var i=0;i<list.length;i++){var B=list[i];if(Math.abs(x-B.x)>B.R||Math.abs(z-B.z)>B.R)continue;
      if(B.fall){var fa=fallAt(B,x,z);if(fa.d<0&&(!best||fa.top>best.top))best={S:B,b:B.beds[0],top:fa.top,d:fa.d};}
      for(var k=B.beds.length-1;k>=0;k--){var b=B.beds[k];if(B.fall&&k<B.body)break;var d=inTop(b,x,z,1-b.ch);if(d<0){if(b.bo&&inBore(b,x,z))continue;var t=topH(b,x,z);if(!best||t>best.top)best={S:B,b:b,top:t,d:d};if(!B.cols)break;}}}   // a mound's columns stand side by side: every bed is asked
    return best;}
  // THE SURFACE, walls included (lifted from biomes/guilin's fastAt, 2026-10-25): KSTACKS.at answers a bed's TOP, so over
  // a tapering bed's wall (a tower's dome, a blade's flank: the plan between its top's outline and its foot's) it answers
  // the bed below's top, under the drawn slope. surface() answers the wall there: the height where the ray through the
  // point crosses the wall (straight up a bed, as the mesh draws it, to the notch and the chamfer), with steep the bed's
  // rise over its run (a dome's beds under ~2.75 hold soil; a cliff's do not). {S, b, top, d, wall, steep} or null.
  // fr(b, ang) replaces footR (guilin passes its interpolated tables).
  function surface(list,x,z,fr,o){var best=null,F=fr||footR,drawn=!!(o&&o.drawn);
    for(var i=0;i<list.length;i++){var B=list[i];if(Math.abs(x-B.x)>B.R||Math.abs(z-B.z)>B.R)continue;
      if(B.fall){var fa=fallAt(B,x,z);if(fa.d<0&&(!best||fa.top>best.top))best={S:B,b:B.beds[0],top:fa.top,d:fa.d,wall:false,steep:0};}
      for(var k=B.beds.length-1;k>=0;k--){var b=B.beds[k],tp=b.tp==null?1:b.tp,cx=b.cx+(b.tx||0),cz=b.cz+(b.tz||0),dx=x-cx,dz=z-cz;
        if(B.fall&&k<B.body)break;if(b.bo&&inBore(b,x,z))continue;
        var rt=F(b,Math.atan2(dz,dx))*tp*(1-b.ch),d=Math.hypot(dx,dz)-rt;
        if(d<0){var t=topH(b,x,z);if(!best||t>best.top)best={S:B,b:b,top:t,d:d,wall:false,steep:0};if(!B.cols)break;continue;}
        if(tp<.995||b.tx||b.tz){var ex=x-b.cx,ez=z-b.cz,ea=Math.atan2(ez,ex),rf=F(b,ea),rfd=drawn?rf*Math.max(1,prof(b,0)):rf,df=Math.hypot(ex,ez)-rfd;   // drawn: a flared foot (nt < 0, a mound's skirt) counted
          if(df<0){var u=clamp(-df/(-df+d),0,1),run=Math.max(.01,rf-rt);
            if(drawn){var lo=0,hi=1;for(var it=0;it<28;it++){var m=(lo+hi)/2,c=cAt(b,m),R=F(b,Math.atan2(z-c[1],x-c[0]))*prof(b,m)*tAt(b,m);if(Math.hypot(x-c[0],z-c[1])>R)hi=m;else lo=m;}u=(lo+hi)/2;}
            var y=yAt(b,ea,u);
            if(!best||y>best.top)best={S:B,b:b,top:y,d:-1e3,wall:true,steep:b.h/run};if(!B.cols)break;}}}}
    return best;}
  // a point on a bed's WALL and its outward normal (lifted from biomes/guilin's GUILIN.wall, 2026-10-25): u 0 the bed's foot
  // .. 1 its top edge, a the angle about the bed's centre, the taper, lean, notch and chamfer followed up the bed (prof)
  function wall(B,b,a,u){var f=prof(b,u)*(1+((b.tp==null?1:b.tp)-1)*u),cx=b.cx+(b.tx||0)*u,cz=b.cz+(b.tz||0)*u,R=footR(b,a)*f,x=cx+Math.cos(a)*R,z=cz+Math.sin(a)*R;
    var e=.01,R1=footR(b,a+e)*f,tx=cx+Math.cos(a+e)*R1-x,tz=cz+Math.sin(a+e)*R1-z,tl=Math.hypot(tx,tz)||1;
    return {x:x,y:yAt(b,a,u),z:z,nx:tz/tl,nz:-tx/tl};}
  function topAt(list,x,z){var a=at(list,x,z);return a?a.top:-Infinity;}
  function foot(list,x,z){var best=null;
    for(var i=0;i<list.length;i++){var B=list[i];if(Math.abs(x-B.x)>B.R+400||Math.abs(z-B.z)>B.R+400)continue;
      if(B.fall){var fq=fallAt(B,x,z);if(!best||fq.d<best.d)best={S:B,d:fq.d};continue;}
      var b0=B.beds[0],d=inBed(b0,x,z,b0.nt<0?1-b0.nt:1);
      if(B.feet)for(var f=0;f<B.feet.length;f++){var bf=B.beds[B.feet[f]];d=Math.min(d,inBed(bf,x,z,bf.nt<0?1-bf.nt:1));}   // a tor's or an arch's columns each stand on the ground
      if(!best||d<best.d)best={S:B,d:d};}   // a mound's skirt: its flared foot
    return best;}
  // on a ledge: on bed k's top and outside the foot of bed k+1 (its notch counted), w the distance in from the ledge's lip.
  // A mound's beds stand by column: what stands on its skirt is every column's first bed, on a spire's bed the next of
  // its column
  function ledge(list,x,z){var a=at(list,x,z);if(!a||a.S.fall)return null;var B=a.S,k=a.b.k;
    if(B.cols){var ups=[],q;for(q=k+1;q<B.beds.length;q++){var c=B.beds[q];if(a.b.col<0?B.beds[q-1].col!==c.col:c.col===a.b.col){ups.push(c);if(a.b.col>=0)break;}}
      if(!ups.length)return null;var dm=Infinity;for(q=0;q<ups.length;q++)dm=Math.min(dm,inBed(ups[q],x,z,1));if(dm<=0)return null;return {S:B,b:a.b,w:-a.d,out:dm};}
    if(k>=B.beds.length-1)return null;
    var up=B.beds[k+1],dUp=inBed(up,x,z,1-up.nt);if(dUp<=0)return null;return {S:B,b:a.b,w:-a.d,out:dUp};}
  function ring(B,y,n){n=n||48;if(B.fall)return null;var b=null;for(var k=0;k<B.beds.length;k++){var q=B.beds[k];if(y>=q.y&&y<=q.y+q.h){b=q;break;}}
    if(!b)return null;var u=(y-b.y)/b.h,f=prof(b,u)*tAt(b,u),c=cAt(b,u),out=[];
    for(var i=0;i<n;i++){var a=i/n*TAU,R=footR(b,a)*f;out.push([c[0]+Math.cos(a)*R,c[1]+Math.sin(a)*R]);}return out;}

  // ---------------------------------------------------------------- the mesh
  // Rows of `seg` vertices round a bed (the angle runs clockwise seen from above, rows rising or closing in, so the quads (a, a+1, b) are CCW from
  // outside: test-stacks.js checks the outward share); a seam column is duplicated so the arc-length uv does not wrap.
  function mesh(B,opt){opt=opt||{};var step=opt.step||5,pos=[],uv=[],idx=[],part=[],bedA=[],occ=[];
    // the top function THROUGH THE EXPORT, so a host that wraps KSTACKS.topH (Korona's hoar table: knolls and the tarn's
    // basin added to the tops) draws what its field says; unwrapped it is this module's own (the same mesh as before)
    var TH=(root.KSTACKS&&root.KSTACKS.topH)||topH,NR=opt.topRings||5,SMAX=opt.segMax||160,rhos=[1,.8,.55,.3,.08];
    if(NR!==5){rhos=[];for(var q=0;q<NR;q++)rhos.push(1-(q/(NR-1))*.98);}
    function grid(rows,seg,p,bk,flip){var base=pos.length/3;
      for(var r=0;r<rows.length;r++)for(var s=0;s<=seg;s++){var q=rows[r](s);pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);part.push(p);bedA.push(bk);occ.push(q[5]);}
      for(r=0;r<rows.length-1;r++)for(s=0;s<seg;s++){var a=base+r*(seg+1)+s,c=a+seg+1;
        if(flip)idx.push(a,c,a+1,a+1,c,c+1);else idx.push(a,a+1,c,a+1,c+1,c);}}
    // a ringed top closed at its centre (2026-11-08; KSEAT found the hole, core/terrain/SEAT.md): a fan from the last row grid() wrote to
    // one vertex at (x, y, z), wound as grid's own quads (a, a+1, inward), so the top no longer shows the ground through it from above
    function fan(seg,p,bk,x,y,z){var r0=pos.length/3-(seg+1),C=r0+seg+1;pos.push(x,y,z);uv.push(x,z);part.push(p);bedA.push(bk);occ.push(1);
      for(var s=0;s<seg;s++)idx.push(r0+s,r0+s+1,C);}
    // THE GRIDDED TOP (opt.top {grid: G metres, minCells}; Korona's hoar pavement, 2026-10-26): a square grid on world
    // multiples of G, clipped to the top's edge ring, the ring being the wall's top row exactly (the same seg vertices on
    // topH), so wall and top share their edge and no crack opens. A cell no ring edge touches is a quad (inside) or
    // nothing; a cell a ring edge crosses is the ring polygon clipped to the cell (Sutherland-Hodgman, each vertex keyed:
    // a grid corner, a ring vertex, or a ring edge's crossing of a grid line, so neighbouring cells meet on the same
    // vertices) and ear-clipped. A crossing's height is the ring edge's own (linear), so it lies on the wall's top edge.
    // Every vertex but those crossings is on topH. The edge ring is star-shaped about the top's centre (one radius per
    // angle), so inside/outside is one edge test.
    // up: the bed standing on this one; a whole cell under its foot (a cell's width in from it) is hidden and left out
    function gridTop(b,k,seg,ang,c1,t1,G,up){var n=seg,RX=new Float64Array(n),RZ=new Float64Array(n),RY=new Float64Array(n),id=new Map();
      var mnx=Infinity,mxx=-Infinity,mnz=Infinity,mxz=-Infinity;
      for(var s=0;s<n;s++){var a=ang(s),R=footR(b,a)*(1-b.ch)*t1;RX[s]=c1[0]+Math.cos(a)*R;RZ[s]=c1[1]+Math.sin(a)*R;RY[s]=TH(b,RX[s],RZ[s]);
        if(RX[s]<mnx)mnx=RX[s];if(RX[s]>mxx)mxx=RX[s];if(RZ[s]<mnz)mnz=RZ[s];if(RZ[s]>mxz)mxz=RZ[s];}
      function V(key,x,y,z){var v=id.get(key);if(v!==undefined)return v;v=pos.length/3;id.set(key,v);pos.push(x,y,z);uv.push(x,z);part.push(1);bedA.push(k);occ.push(1);return v;}
      function corner(i,j){var x=i*G,z=j*G;return {x:x,z:z,y:TH(b,x,z),key:'g'+i+','+j};}
      /* the crossing of ring edge s with grid line li (ax 0: x = li*G, 1: z = li*G) */
      function cross(s,ax,li){var s1=(s+1)%n,x0=RX[s],z0=RZ[s],x1=RX[s1],z1=RZ[s1],L=li*G,t=ax?(L-z0)/(z1-z0):(L-x0)/(x1-x0);if(!(t>=0))t=0;if(t>1)t=1;
        if(t<1e-9)return {x:x0,z:z0,y:RY[s],key:'r'+s};if(t>1-1e-9)return {x:x1,z:z1,y:RY[s1],key:'r'+s1};   /* a ring vertex on the line: the same vertex from either side */
        return {x:ax?x0+t*(x1-x0):L,z:ax?L:z0+t*(z1-z0),y:RY[s]+t*(RY[s1]-RY[s]),key:(ax?'z':'x')+s+','+li};}
      function inside(x,z){var a=Math.atan2(z-c1[1],x-c1[0]),f=(-a/TAU*n)%n;if(f<0)f+=n;var s0=Math.floor(f)%n,s1=(s0+1)%n,ex=RX[s1]-RX[s0],ez=RZ[s1]-RZ[s0];
        return (ex*(z-RZ[s0])-ez*(x-RX[s0]))*(ex*(c1[1]-RZ[s0])-ez*(c1[0]-RX[s0]))>=0;}
      function tri(p,q,r){var ny=(q.z-p.z)*(r.x-p.x)-(q.x-p.x)*(r.z-p.z);if(Math.abs(ny)<1e-10)return;
        var A=V(p.key,p.x,p.y,p.z),Bv=V(q.key,q.x,q.y,q.z),C=V(r.key,r.x,r.y,r.z);if(ny>0)idx.push(A,Bv,C);else idx.push(A,C,Bv);}
      function under(x,z){var dx=x-up.cx,dz=z-up.cz;return Math.hypot(dx,dz)<footR(up,Math.atan2(dz,dx))*(1-up.nt)-G;}
      function hidden(i,j){return under(i*G,j*G)&&under(i*G+G,j*G)&&under(i*G,j*G+G)&&under(i*G+G,j*G+G);}
      /* the cells a ring edge touches */
      var edge=new Set(),e=1e-7;
      for(s=0;s<n;s++){var s1=(s+1)%n,ia=Math.floor((Math.min(RX[s],RX[s1])-e)/G),ib=Math.floor((Math.max(RX[s],RX[s1])+e)/G),ja=Math.floor((Math.min(RZ[s],RZ[s1])-e)/G),jb=Math.floor((Math.max(RZ[s],RZ[s1])+e)/G);
        for(var i=ia;i<=ib;i++)for(var j=ja;j<=jb;j++)edge.add(i+','+j);}
      /* Sutherland-Hodgman against one side of a cell: e on each vertex is the owner of the segment leaving it ([0,s] ring
         edge s, [1,i] the grid line x = i*G, [2,j] the line z = j*G), so a crossing is keyed by what it lies on */
      function clip(P,ax,li,ge){var out=[],L=li*G,m=P.length;
        for(var q=0;q<m;q++){var A=P[q],Bq=P[(q+1)%m],av=ax?A.z:A.x,bv=ax?Bq.z:Bq.x,ai=ge?av>=L:av<=L,bi=ge?bv>=L:bv<=L;
          if(ai===bi){if(bi)out.push(Bq);continue;}
          var I=A.e[0]===0?cross(A.e[1],ax,li):(ax?corner(A.e[1],li):corner(li,A.e[1]));
          if(ai){I.e=[ax?2:1,li];out.push(I);}else{I.e=A.e;out.push(I);out.push(Bq);}}
        return out;}
      var ring=[];for(s=0;s<n;s++)ring.push({x:RX[s],z:RZ[s],y:RY[s],key:'r'+s,e:[0,s]});
      var i0=Math.floor(mnx/G)-1,i1=Math.floor(mxx/G)+1,j0=Math.floor(mnz/G)-1,j1=Math.floor(mxz/G)+1;
      for(var j=j0;j<=j1;j++)for(var i=i0;i<=i1;i++){
        if(!edge.has(i+','+j)){if(!inside((i+.5)*G,(j+.5)*G)||(up&&hidden(i,j)))continue;var g00=corner(i,j),g10=corner(i+1,j),g11=corner(i+1,j+1),g01=corner(i,j+1);tri(g00,g10,g11);tri(g00,g11,g01);continue;}
        var P=clip(clip(clip(clip(ring,0,i,true),0,i+1,false),1,j,true),1,j+1,false);
        /* drop repeats (a ring vertex on a grid line), then ear-clip, counter-clockwise in x-z */
        var Q=[];for(var q=0;q<P.length;q++){var pq=P[q],pr=Q.length?Q[Q.length-1]:null;if(!pr||Math.abs(pr.x-pq.x)+Math.abs(pr.z-pq.z)>1e-9)Q.push(pq);}
        while(Q.length>1&&Math.abs(Q[0].x-Q[Q.length-1].x)+Math.abs(Q[0].z-Q[Q.length-1].z)<=1e-9)Q.pop();
        if(Q.length<3)continue;
        relink(Q,i,j).forEach(function(L){if(L.length<3)return;var ar=0;for(var q=0;q<L.length;q++){var u=L[q],w=L[(q+1)%L.length];ar+=u.x*w.z-w.x*u.z;}if(Math.abs(ar)<1e-9)return;if(ar<0)L.reverse();earClip(L,tri);});}
      /* A cell the ring enters more than once: Sutherland-Hodgman joins the pieces by runs along the cell's sides, which can
         cross outside the top. Weiler-Atherton instead: the ring's chains inside the cell (runs of ring-owned segments)
         are linked exit to entry by walking the cell's boundary the ring's way round (the ring runs clockwise in x-z,
         against tau, the boundary's parameter), the corners passed on the way put in. One loop per piece. */
      function relink(Q,i,j){var m=Q.length,q,rg=function(v){return v.e[0]===0;},hs=false,hr=false;for(q=0;q<m;q++){if(rg(Q[q]))hr=true;else hs=true;}
        if(!hs||!hr)return [Q];
        var X0=i*G,Z0=j*G,P4=4*G,tau=function(v){var d=[Math.abs(v.z-Z0),Math.abs(v.x-X0-G),Math.abs(v.z-Z0-G),Math.abs(v.x-X0)],k=0;for(var t=1;t<4;t++)if(d[t]<d[k])k=t;
          var r=k===0?v.x-X0:k===1?G+(v.z-Z0):k===2?2*G+(X0+G-v.x):3*G+(Z0+G-v.z);return ((r%P4)+P4)%P4;};
        var CN=[corner(i,j),corner(i+1,j),corner(i+1,j+1),corner(i,j+1)],CT=[0,G,2*G,3*G],ch=[];
        for(q=0;q<m;q++){if(!rg(Q[q])||rg(Q[(q+m-1)%m]))continue;var c=[Q[q]],r=q;while(rg(Q[r])){r=(r+1)%m;c.push(Q[r]);if(r===q)break;}ch.push({v:c,ti:tau(c[0]),to:tau(c[c.length-1]),used:false});}
        var out=[];for(var a=0;a<ch.length;a++){if(ch[a].used)continue;var L=[],cur=ch[a],guard=0;
          while(guard++<=ch.length){cur.used=true;L.push.apply(L,cur.v);var to=cur.to,best=null,bd=Infinity;
            for(var b=0;b<ch.length;b++){if(ch[b].used&&ch[b]!==ch[a])continue;var d=((to-ch[b].ti)%P4+P4)%P4;if(d<1e-9)d=0;if(d<bd){bd=d;best=ch[b];}}
            var cs=[];for(var t=0;t<4;t++){var dc=((to-CT[t])%P4+P4)%P4;if(dc>1e-9&&dc<bd-1e-9)cs.push([dc,CN[t]]);}cs.sort(function(x,y){return x[0]-y[0];});cs.forEach(function(x){L.push(x[1]);});
            if(!best||best===ch[a])break;cur=best;}
          var D=[];L.forEach(function(v){var pv=D.length?D[D.length-1]:null;if(!pv||Math.abs(pv.x-v.x)+Math.abs(pv.z-v.z)>1e-9)D.push(v);});
          while(D.length>1&&Math.abs(D[0].x-D[D.length-1].x)+Math.abs(D[0].z-D[D.length-1].z)<=1e-9)D.pop();out.push(D);}
        return out;}}
    function earClip(Q,tri){var guard=0;
      function cr(a,b,c){return (b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);}
      while(Q.length>3&&guard++<4096){var m=Q.length,cut=-1;
        for(var q=0;q<m&&cut<0;q++){var a=Q[(q+m-1)%m],b=Q[q],c=Q[(q+1)%m];if(cr(a,b,c)<=1e-12)continue;var clear=true;
          for(var t=0;t<m&&clear;t++){var p=Q[t];if(p===a||p===b||p===c)continue;if(Math.abs(p.x-b.x)+Math.abs(p.z-b.z)<1e-9)continue;
            if(cr(a,b,p)>=-1e-12&&cr(b,c,p)>=-1e-12&&cr(c,a,p)>=-1e-12)clear=false;}
          if(clear)cut=q;}
        if(cut<0){/* only flat corners left: drop the flattest, or fan what remains */var fl=-1;for(q=0;q<m;q++)if(Math.abs(cr(Q[(q+m-1)%m],Q[q],Q[(q+1)%m]))<=1e-9){fl=q;break;}
          if(fl>=0){Q.splice(fl,1);continue;}for(q=1;q<m-1;q++)tri(Q[0],Q[q],Q[q+1]);return;}
        tri(Q[(cut+m-1)%m],Q[cut],Q[(cut+1)%m]);Q.splice(cut,1);}
      if(Q.length===3)tri(Q[0],Q[1],Q[2]);}
    if(B.kind==='chimney')return chimneyMesh();
    for(var k=0;k<B.beds.length;k++){var b=B.beds[k],per=TAU*Math.max(b.rx,b.rz)*(1+b.lob),seg=Math.max(16,Math.min(SMAX,Math.round(per/step)));
      if(b.fn)seg=Math.max(seg,Math.min(SMAX,b.fn*(opt.perFlute==null?6:opt.perFlute)));               // a fluted bed: its grooves drawn
      if(b.cw)seg=Math.max(seg,Math.min(opt.colMax||2400,Math.max(6,Math.round(TAU*(b.rx+b.rz)/2/b.cw))*(opt.perColumn==null?4:opt.perColumn)));   // a colonnade: its prisms drawn
      var ang=function(s){return -s/seg*TAU;};                                        // clockwise from above
      var arc=[0];for(var s=1;s<=seg;s++){var a0=ang(s-1),a1=ang(s),r0=footR(b,a0),r1=footR(b,a1);arc.push(arc[s-1]+Math.hypot(Math.cos(a1)*r1-Math.cos(a0)*r0,Math.sin(a1)*r1-Math.sin(a0)*r0));}
      // a mound's bed (col set): its wall is straight up but where the flare (nt < 0) and the chamfer bend it, so rows only there
      var us=b.col==null?[0,.06,.2,.5,.78,.9,1]:[0].concat(b.nt?[.05,.1,.15,.2]:[],b.ch?[.78,.84,.9,.95]:[],[1]);
      var c1=cAt(b,1),t1=tAt(b,1),wall=us.map(function(u){return function(s){var a=ang(s),c=cAt(b,u),R=footR(b,a)*prof(b,u)*tAt(b,u),y=yAt(b,a,u);
        return [c[0]+Math.cos(a)*R,y,c[1]+Math.sin(a)*R,arc[s],y,u<.2&&!(b.col>=0)?.55+.45*(u/.2):1];};});
      wall[wall.length-1]=(function(){return function(s){var a=ang(s),R=footR(b,a)*(1-b.ch)*t1,x=c1[0]+Math.cos(a)*R,z=c1[1]+Math.sin(a)*R;return [x,TH(b,x,z),z,arc[s],b.y+b.h,1];};})();
      grid(wall,seg,0,k,false);
      // the top: rings in from the chamfer's edge to the centre, on topH exactly; or (opt.top.grid, a top wide enough to hold
      // opt.top.minCells cells across its narrowest radius) a square grid clipped to the same edge ring (gridTop)
      var GT=opt.top&&opt.top.grid>0?opt.top.grid:0,MC=opt.top&&opt.top.minCells!=null?opt.top.minCells:3;
      var nx=b.col==null?null:B.beds[k+1];
      if(nx&&b.col>=0&&nx.col===b.col&&!b.ot){}                                            // a mound's spire bed under the next: its top is inside the column
      else if(GT&&Math.min(b.rx,b.rz)*(1-b.ch)*t1*(1-b.lob)>GT*MC)gridTop(b,k,seg,ang,c1,t1,GT,k+1<B.beds.length&&opt.top.cull!==false?B.beds[k+1]:null);
      else{var tops=rhos.map(function(rho){return function(s){var a=ang(s),R=footR(b,a)*(1-b.ch)*t1*rho,x=c1[0]+Math.cos(a)*R,z=c1[1]+Math.sin(a)*R;return [x,TH(b,x,z),z,x,z,1];};});
        grid(tops,seg,1,k,false);fan(seg,1,k,c1[0],TH(b,c1[0],c1[1]),c1[1]);}
      // an overhang's underside (a balanced cap, a bed wider than the top below it): a disc facing down at its foot
      var below=k>0?B.beds[k-1]:null,over=false;
      if(below&&b.col!=null&&below.col!==b.col)below=null;                            // a mound's spire stands set into the skirt
      // (any overhang at all: a weathered bed standing proud of the one under it leaves a slit to the sky otherwise)
      if(below)for(s=0;s<seg&&!over;s++){var aa=ang(s);if(footR(b,aa)*(1-b.nt)>footR(below,aa)*(1-below.ch)*tAt(below,1)+.05)over=true;}
      if(b.und)over=true;                                                             // an arch's lintel: its soffit over the opening
      if(over){var und=(b.und?[1,.75,.5,.25,0]:[1,.6,.25]).map(function(rho){return function(s){var a=ang(s),R=footR(b,a)*(1-b.nt)*rho,x=b.cx+Math.cos(a)*R,z=b.cz+Math.sin(a)*R;return [x,b.y,z,x,z,.35];};});
        grid(und,seg,2,k,true);}
    }
    return {pos:new Float32Array(pos),uv:new Float32Array(uv),idx:new Uint32Array(idx),part:new Uint8Array(part),bed:new Uint8Array(bedA),occ:new Float32Array(occ)};
    // A CHIMNEY's mesh: the outer wall bed by bed, a step's ledge, the lip, and the bore (part 3, opt-in by kind) down inside, darkening with depth. opt.bore:'open'
    // leaves off the plug at the foot (a kit whose KCAVERN shaft goes on below). Over a fallen record the column is drawn lying on its axis, and the chunks where they lie
    function chimneyMesh(){var nRot=0,topY=B.top;
      for(var k=0;k<B.beds.length;k++){if(k===B.body&&B.fall)nRot=pos.length/3;
        (function(k){var b=B.beds[k],nxb=B.beds[k+1],last=!nxb||nxb.col!==b.col,t1=tAt(b,1),c1=cAt(b,1),seg=Math.max(10,Math.min(SMAX,Math.round(TAU*Math.max(b.rx,b.rz)*Math.max(1,t1)/step))),ang=function(s){return -s/seg*TAU;};
          var hollow=b.bo!=null&&b.col<50,arc=[0];for(var s=1;s<=seg;s++){var a0=ang(s-1),a1=ang(s),r0=footR(b,a0),r1=footR(b,a1);arc.push(arc[s-1]+Math.hypot(Math.cos(a1)*r1-Math.cos(a0)*r0,Math.sin(a1)*r1-Math.sin(a0)*r0));}
          var us=[0,.5,1],row=function(u,cl){return function(s){var a=ang(s),c=cAt(b,u),R=footR(b,a)*tAt(b,u)*(cl?1-b.ch:1),x=c[0]+Math.cos(a)*R,z=c[1]+Math.sin(a)*R,y=u===1?(last?TH(b,x,z):b.y+b.h):yAt(b,a,u);return [x,y,z,arc[s],y,u===0&&hollow&&k===0?.6:1];};};
          grid(us.map(function(u){return row(u,false);}),seg,0,k,false);
          var ringAt=function(rf){return function(s){var a=ang(s),R=rf(a),x=c1[0]+Math.cos(a)*R,z=c1[1]+Math.sin(a)*R;return [x,last?TH(b,x,z):b.y+b.h,z,x,z,1];};};
          if(!hollow){grid(rhos.map(function(rho){return ringAt(function(a){return footR(b,a)*t1*rho;});}),seg,1,k,false);fan(seg,1,k,c1[0],last?TH(b,c1[0],c1[1]):b.y+b.h,c1[1]);return;}
          if(last)grid([ringAt(function(a){return footR(b,a)*t1;}),ringAt(function(a){return (footR(b,a)*t1+b.bt)/2;}),ringAt(function(){return b.bt;})],seg,1,k,false);
          else{var nf=footR(nxb,0)/footR(b,0);if(nf<t1-.002)grid([ringAt(function(a){return footR(b,a)*t1;}),ringAt(function(a){return footR(nxb,a);})],seg,1,k,false);}
          var dark=function(y){return clamp(1-(topY-y)/(Math.max(b.bo,b.bt)*8),.08,1);};
          var inner=function(u){return function(s){var a=ang(s),c=cAt(b,u),R=b.bo+(b.bt-b.bo)*u,x=c[0]+Math.cos(a)*R,z=c[1]+Math.sin(a)*R,y=u===1?(last?TH(b,x,z):b.y+b.h):b.y+u*b.h;return [x,y,z,R*a,y,dark(y)];};};
          grid([inner(0),inner(.5),inner(1)],seg,3,k,true);
          if(k===0&&!(opt.bore==='open'&&!B.fall))grid([1,.5,0].map(function(rho){return function(s){var a=ang(s),R=b.bo*rho+.001,x=b.cx+Math.cos(a)*R,z=b.cz+Math.sin(a)*R;return [x,b.y+.15,z,x,z,.05];};}),seg,3,k,false);})(k);}
      if(B.fall&&!nRot)nRot=pos.length/3;
      if(B.fall){var G=B.fall,Y=[G.dx,G.dy,G.dz],ax=[0,0,1],l=0,X=[Y[1]*ax[2]-Y[2]*ax[1],Y[2]*ax[0]-Y[0]*ax[2],Y[0]*ax[1]-Y[1]*ax[0]];l=Math.hypot(X[0],X[1],X[2]);if(l<.01){X=[1,0,0];l=1;}X=X.map(function(v){return v/l;});
        var Z=[X[1]*Y[2]-X[2]*Y[1],X[2]*Y[0]-X[0]*Y[2],X[0]*Y[1]-X[1]*Y[0]];
        for(var i=0;i<nRot;i++){var lx=pos[3*i]-B.x,ly=pos[3*i+1]-B.y0,lz=pos[3*i+2]-B.z;for(var c=0;c<3;c++)pos[3*i+c]=[G.ax,G.ay,G.az][c]+X[c]*lx+Y[c]*ly+Z[c]*lz;}}
      var out={pos:new Float32Array(pos),uv:new Float32Array(uv),idx:new Uint32Array(idx),part:new Uint8Array(part),bed:new Uint8Array(bedA),occ:new Float32Array(occ)};
      if(B.ice){var n=pos.length/3,I=new Float32Array(n),H=B.top-B.y0,fr=B.ice.from;for(var i2=0;i2<n;i2++){if(part[i2]===3)continue;var bb=B.beds[bedA[i2]];if(bb.col>=50)continue;var u=(bb.y+bb.h/2-B.y0)/H;I[i2]=sm(fr-.04,fr+.04,u)*clamp(.45+1.1*KR.fbm(pos[3*i2]*.4,pos[3*i2+1]*.4,pos[3*i2+2]*.4,2,B.seed),0,1);}out.ice=I;}
      return out;}}

  // ---------------------------------------------------------------- layouts
  // the optional variety of a layout's stack i (taper, lean, e, crown ranges; lift), from its own stream: nothing is drawn
  // from it unless a range is given, and the layout's main stream is never touched
  function variety(o,i,x,z,rad,into){var v=null,keys=['taper','lean','e','crown'];
    for(var q=0;q<keys.length;q++){var k=keys[q],rg=o[k];if(!rg||rg.length!==2)continue;if(!v)v=S(KR.hash(o.seed,i,406));into[k]=v.range(rg[0],rg[1]);}
    if(o.plates&&o.plates.length===2){if(!v)v=S(KR.hash(o.seed,i,406));if(v.chance(o.platesShare==null?.5:o.platesShare))into.plates=o.plates;}
    if(o.lift)into.H+=o.lift(x,z,rad);return into;}
  function row(o){var n=o.n||5,a=o.a,b=o.b,out=[],str=Math.atan2(b[1]-a[1],b[0]-a[0]),g=o.ground||function(){return 0;};
    var lean=S(KR.hash(o.seed,0,303)).range(0,.07);
    for(var i=0;i<n;i++){var r=S(KR.hash(o.seed,i,304)),t=(i+.5+r.range(-.3,.3))/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
      x+=Math.cos(str+Math.PI/2)*r.range(-1,1)*(o.jitter||8);z+=Math.sin(str+Math.PI/2)*r.range(-1,1)*(o.jitter||8);
      var HH=r.range(o.H[0],o.H[1]),rr=r.range(o.r[0],o.r[1]),spec={id:o.id+'-'+i,kind:o.kind||'fin',x:x,z:z,y0:g(x,z)-1,seed:KR.hash(o.seed,i,305),H:HH,
        r:rr,e:o.e?r.range(o.e[0],o.e[1]):4,ry:str+r.range(-.08,.08),lean:lean};   // (the draws in their old order: H, r, e, ry)
      out.push(make(variety({seed:o.seed,taper:o.taper,lean:o.lean,crown:o.crown,plates:o.plates,platesShare:o.platesShare,lift:o.lift},i,x,z,rr,spec)));}
    return out;}
  function cluster(o){var n=o.n||8,out=[],g=o.ground||function(){return 0;},K=o.kinds||{spire:.6,balanced:.25,fin:.15},keys=Object.keys(K),tot=0;
    keys.forEach(function(k){tot+=K[k];});
    for(var i=0;i<n;i++){for(var tr=0;tr<24;tr++){var r=S(KR.hash(o.seed,i,tr,404)),ang=r.range(0,TAU),d=o.rad*Math.sqrt(r.next()),x=o.c[0]+Math.cos(ang)*d,z=o.c[1]+Math.sin(ang)*d;
        var rad=r.range(o.r[0],o.r[1]),ok=!o.accept||o.accept(x,z,rad);
        for(var j=0;j<out.length&&ok;j++)if(Math.hypot(out[j].x-x,out[j].z-z)<rad+out[j]._r+(o.gap==null?6:o.gap))ok=false;
        if(!ok)continue;var u=r.next()*tot,kind=keys[0];for(var q=0;q<keys.length;q++){u-=K[keys[q]];if(u<=0){kind=keys[q];break;}}
        var B=make(variety(o,i,x,z,rad,{id:o.id+'-'+i,kind:kind,x:x,z:z,y0:g(x,z)-1,seed:KR.hash(o.seed,i,405),H:r.range(o.H[0],o.H[1]),r:rad}));B._r=rad;out.push(B);break;}}
    out.forEach(function(B){delete B._r;});return out;}

  // a KARST TOWER (guilin's fenglin and fengcong peaks, nwbay's sea stacks; lifted from biomes/guilin 2026-10-25): a spire
  // (one column, its beds' taper running on into each other: partings, not ledges) given the tower's profile: a cliff
  // standing almost sheer for 45-62% of its height, then a dome closing in to a small cap (a superellipse: a sugarloaf or a
  // beehive), its upper beds drifting off the axis. o: {id, seed, x, z, H, R, y0 | foot(x, z, r) -> y0, e, ry (else drawn)}. The record is a
  // plain record marked tower:true; R is its bounding radius about x, z.
  function tower(o){var s=S(KR.hash(o.seed,0x70E)),e0=s.range(1.0,1.3),e=o.e==null?e0:o.e,x=o.x,z=o.z,H=o.H,R=o.R;   // o.e, o.ry: a footprint's own (the draws are taken either way)
    var y0=o.y0!=null?o.y0:o.foot?o.foot(x,z,R*Math.sqrt(e)):0;
    var B=make({id:o.id,kind:'spire',x:x,z:z,y0:y0,seed:o.seed,H:H,r:R,e:e,ry:(function(v){return o.ry==null?v:o.ry;})(s.range(0,TAU)),lean:s.range(0,.045),taper:0,crown:1});
    var tw=s.range(.45,.62),pw=s.range(.84,.94),kx=s.range(1.7,2.7),phi=s.range(0,TAU),drift=s.range(.04,.16)*R;
    var pr=function(t){return t<=tw?1-(1-pw)*t/tw:pw*Math.pow(Math.max(0,1-.95*Math.pow((t-tw)/(1-tw),kx)),1/kx);};
    var sh=function(t){return t<=tw?0:drift*Math.pow((t-tw)/(1-tw),1.5);};   // the dome's drift off the axis
    B.beds.forEach(function(b){var t0=(b.y-B.y0)/H,t1=(b.y+b.h-B.y0)/H,f0=pr(t0),f1=pr(t1);b.rx*=f0;b.rz*=f0;b.tp=f1/Math.max(.01,f0);b.lob=.2;
      b.cx+=Math.cos(phi)*sh(t0);b.cz+=Math.sin(phi)*sh(t0);b.tx+=Math.cos(phi)*(sh(t1)-sh(t0));b.tz+=Math.sin(phi)*(sh(t1)-sh(t0));});
    var RR=0;B.beds.forEach(function(b){RR=Math.max(RR,Math.max(b.rx,b.rz)*(1+2.5*b.lob)+Math.hypot(b.cx-x,b.cz-z));});B.R=RR+2;B.tower=true;
    return B;}

  function exp(list){return {format:'krator-stacks',version:1,bodies:list.map(function(B){return JSON.parse(JSON.stringify(B));})};}
  function load(j){if(!j||j.format!=='krator-stacks')throw new Error('KSTACKS.load: not a krator-stacks export');return j.bodies.map(function(B){return JSON.parse(JSON.stringify(B));});}
  function hash(m){var h=KR.hash(1,m.pos.length,m.idx.length);
    for(var i=0;i<m.pos.length;i+=7)h=KR.hash(h,Math.round(m.pos[i]*1000));for(i=0;i<m.idx.length;i+=11)h=KR.hash(h,m.idx[i]);return h>>>0;}

  // ---------------------------------------------------------------- KSTACKS.weather: a drawn body worn natural (2026-10-26, opt-in)
  // biomes/swhighlands (the owner: its arch "looks man-made"): weather(B, m, o) moves the vertices of B's mesh m (KSTACKS.mesh) in place
  // and returns m. An arch's (B.opening) lintel has its two upper outer corners worn round, a radius of o.round (1.9) times the lintel's
  // thickness (at least 6 m, at most .55 of its half length), in the opening's own frame; then every vertex moves by two grains of
  // KRAND noise, o.amp (2.2 m) at o.grain (.12 /m) and o.pit (.6 m) at o.pitGrain (.5 /m), the vertical at .7 of the horizontal; at the
  // feet (within 4 m of o.ground(x, z), when given) nothing moves, so the body still stands on the ground as drawn. Seeded by B.seed
  // (or o.seed). The RECORD is not changed: at, surface, the feet and the export keep the unweathered body (within ~ amp + pit of the
  // drawn rock). Without a call nothing moves.
  function weather(B,m,o){o=o||{};var n=m.pos.length/3,sd=(o.seed==null?B.seed:o.seed)>>>0,P=m.pos;
    var amp=o.amp==null?2.2:o.amp,gr=o.grain==null?.12:o.grain,pit=o.pit==null?.6:o.pit,pg=o.pitGrain==null?.5:o.pitGrain,G=o.ground||null;
    var sm=function(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);},nz=function(k,u,v,w){return (KR.fbm(u,v,w,3,sd+k)-.5)*2;};
    var v,x,y,z;
    if(B.opening&&o.round!==0){var Op=B.opening,ux=Math.cos(Op.ry),uz=Math.sin(Op.ry),Lh=0;
      for(v=0;v<n;v++){var a0=Math.abs((P[3*v]-B.x)*ux+(P[3*v+2]-B.z)*uz);if(a0>Lh)Lh=a0;}
      var R=Math.min(Lh*.55,Math.max(6,(B.top-Op.y1)*(o.round==null?1.9:o.round))),cx=Lh-R,cy=B.top-R;
      for(v=0;v<n;v++){x=P[3*v];y=P[3*v+1];z=P[3*v+2];var dx=x-B.x,dz=z-B.z,a=dx*ux+dz*uz,c=-dx*uz+dz*ux,aa=Math.abs(a);
        if(aa>cx&&y>cy){var d=Math.hypot(aa-cx,y-cy);if(d>R){var k=R/d,a2=(a<0?-1:1)*(cx+(aa-cx)*k);P[3*v+1]=cy+(y-cy)*k;P[3*v]=B.x+a2*ux-c*uz;P[3*v+2]=B.z+a2*uz+c*ux;}}}}
    for(v=0;v<n;v++){x=P[3*v];y=P[3*v+1];z=P[3*v+2];var f=G?sm(.5,4,y-G(x,z)):1,A=amp*f,a3=pit*f;
      P[3*v]=x+A*nz(0,x*gr,y*gr,z*gr)+a3*nz(3,x*pg,y*pg,z*pg);P[3*v+1]=y+.7*(A*nz(1,x*gr+7,y*gr,z*gr)+a3*nz(4,x*pg+7,y*pg,z*pg));P[3*v+2]=z+A*nz(2,x*gr,y*gr+3,z*gr)+a3*nz(5,x*pg,y*pg+3,z*pg);}
    return m;}

  root.KSTACKS={bore:bore,make:make,tower:tower,footR:footR,topH:topH,prof:prof,at:at,surface:surface,wall:wall,topAt:topAt,foot:foot,ledge:ledge,ring:ring,mesh:mesh,row:row,cluster:cluster,
    mounds:mounds,pillars:pillars,wallY:yAt,kinds:function(){return Object.keys(KINDS);},export:exp,load:load,hash:hash,weather:weather};
})(typeof globalThis!=='undefined'?globalThis:this);
