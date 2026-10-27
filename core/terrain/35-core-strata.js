// ================================================================= CORE — strata: bedded rock as data (core/terrain/STRATA-PLAN.md)
// [G data] Plain maths of (x, y, z): no THREE, no DOM, no Math.random, no Math.sin or exp (only + - * / floor sqrt), the
// draws from core/rand (KRAND), so kstrata.gd (beside this file) gives the same bed at the same point. Needs KRAND
// (core/rand/08-core-rand.js) loaded first. The three.js half (BIO.strata's shader, today's API) is
// host/35-core-strata-shade.js; this half is what a painter, a plant pass, a relief pass or Godot asks.
//
// Two levels: FORMATIONS (tens to thousands of metres, each with its own recipe and tint) stacked bottom to top, and the
// BEDS of each formation's recipe inside it. A point's bed is found at its STRATIGRAPHIC height yy: the world y moved by a
// closed-form warp (value noise on a lattice table drawn from KRAND.hash, which the shader reads as a texture), a planar dip,
// an optional fold and faults. A recipe with `blocks` (megabreccia) has no beds: a 3D cellular field of tilted blocks of
// many rocks in a matrix.
//
//   const S = KSTRATA.create({seed, recipe:'canyon' | formations:[{recipe, base, top | th, tint:[r,g,b], flip, repeat,
//                             seed}], range:[y0,y1], dip:[dx,dz,slope], warp:[m1,m2], warpF:[f1,f2],
//                             fold:{dir:[dx,dz], wl, amp, phase, sharp, at:[x,z]}, faults:[{a:[x,z], b:[x,z], throw, w,
//                             taper}], alter:[{kinds:[..]|'*', to, below, band}], legacy:{columnM}})
//     formations  bottom to top; base defaults to the one below's top (the first's to range[0]), top to base+th, else to
//                 the next one's base (the last's to range[1]). A recipe with a `suite` splits its formation by shares.
//                 flip: the beds read top-down (the overturned flap); repeat: the beds repeat every `repeat` m (today's
//                 column); tint multiplies every bed's colour
//     dip          the beds rise by slope per metre along (dx,dz) (today's [.6,.8,.012]); warp: metres of the two noise
//                  terms (today's [9,2.2]) at frequencies warpF (per metre)
//     fold         the beds folded about axes running along dir: amp metres, wavelength wl, sharp 0 (round) .. 1 (chevron);
//                  an anticline's crest at `at` + phase*wl across
//     faults       the beds left of a->b (looking from a to b) stand `throw` m lower, over a zone w m wide; past the ends
//                  the throw fades out over `taper` m (no taper: an endless line)
//     alter        below a world height (the line wandering by band m), the named kinds turn into `to` (the Godthrone's
//                  bead beds to palagonite under the dry-cold line, Godstep's rock to laterite at the wet low end);
//                  defaults to the recipe's own
//     legacy       the column of today's BIO.strata, bit for bit (one formation of the `canyon` kinds drawn in order from
//                  a KRAND.stream, repeating every columnM); the host's legacy shader keeps its canvas warp
//   S.yy(x,y,z)                 the stratigraphic height at a point
//   S.at(x,y,z,out)             {yy, formation, recipe, bed (-1 in blocks), kind, kid, colour [r,g,b] sRGB 0..1, hard 0..1,
//                               f (0..1 up its bed), edge (m to the nearest bed boundary), cell ([i,j,k] of a block or null),
//                               altered}; out reused if given
//   S.hardnessAt(x,y,z)         the bed's hardness (ledges: STRATA-PLAN section 4)
//   S.bedAt(yy,out)             the bed at a stratigraphic height (no warp): {formation, blocks, bed, kid, colour, f, edge}
//   S.colorAt(yy)               the column's colour at a stratigraphic height, as today's S.colorAt (no warp): [r,g,b]
//   S.terrace(x,z,h,k)          h eased toward a bench at the top and foot of each bed, by k (.6) times its hardness: a
//                               monotone map of h at (x,z), so it makes no new hollows (STRATA-PLAN S4's first cut)
//   S.kinds, S.formations, S.beds (the first formation's, as today's S.beds), S.table (the noise lattice, P*P*4 bytes)
//   S.export() / KSTRATA.load(json)   the krator-strata records Godot reads; load gives the same at() bit for bit
//   KSTRATA.RECIPES, KSTRATA.recipe(name), KSTRATA.add(rec), KSTRATA.P, KSTRATA.noise(table, ch, x, z)
//
// A recipe: {name, kinds:{k:{p, th:[a,b], col:[hex..], hard, xbed, varnish, between, jit}}, main, alternate:[a,b], alter,
// fx:{...the shader's effects}, suite:[{recipe, share}], blocks:{size, gap, nest:{kind, size}, bed, matrix}}. A kind with
// p 0 is only reached by an alteration or a rule. `between` kinds (a bead horizon, a bole, a parting) never follow each
// other; `alternate` swaps the two named kinds in turn (pillar's red and white).
(function(root){
  'use strict';
  var R=root.KRAND;
  var P=64;              // the noise lattice's period in cells: a 64 m cell repeats after 4 km, the 14 m one after 900 m
  var MAXBEDS=400000;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sstep(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
  function hex3(h){return [((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];}
  function imod(a,n){a=a%n;return a<0?a+n:a;}

  // ---- recipes. Colours sRGB hex; th metres; hard 0 (clay) .. 1 (quartzite); xbed, varnish 0..1 (the shader's share)
  var RECIPES={
    // today's column (BIO.strata in sedesert, ebadlands, Shade): Wingate/Kayenta reds and oranges, purple-brown shales, buff
    // and cream bleached sandstones, chocolate mudstones, the rare grey-green of a reduced bed
    canyon:{main:'sand',kinds:{
      sand:{p:.46,th:[2.5,11.5],col:[0xb5643a,0xc2723f,0xa85a36,0xbd7a4e,0xc98a58],hard:.8,xbed:1,varnish:1},
      shale:{p:.22,th:[.35,1.75],col:[0x7b4a3e,0x6f4a44,0x80503c],hard:.2,xbed:60/255,varnish:90/255},
      mud:{p:.15,th:[.8,3],col:[0x93553f,0x8a5a48,0x9c6248],hard:.35,xbed:120/255,varnish:90/255},
      bleach:{p:.12,th:[1,4.5],col:[0xd9b48a,0xe0c39a,0xcfa27a],hard:.75,xbed:200/255,varnish:1},
      green:{p:.05,th:[.3,1.2],col:[0x8c8a6e,0x9a9478],hard:.4,xbed:60/255,varnish:90/255}},
      fx:{xbed:1,varnish:1}},

    // the Outlands' basin walls (biomes/outlands/PLAN.md section 5, C3): red vesicular basalt caps over pale tuffs and red
    // beds, thin green and turquoise copper bands, white altered zones. A suite: red beds at the foot, tuffs, basalt on top
    outland:{suite:[{recipe:'outland-redbeds',share:.35},{recipe:'outland-tuff',share:.35},{recipe:'outland-basalt',share:.3}]},
    'outland-redbeds':{main:'sand',kinds:{
      sand:{p:.5,th:[1,6],col:[0x8a3a26,0x9a4430,0xa5523a,0x93452c],hard:.65,xbed:.6,varnish:.8},
      mud:{p:.3,th:[.5,2.5],col:[0x7a3a2e,0x6e3429,0x834236],hard:.25,xbed:.1,varnish:.3},
      altered:{p:.08,th:[.5,3],col:[0xe6e0d2,0xd8d2c4,0xece6d8],hard:.3,xbed:.1,varnish:.2},
      copper:{p:.08,th:[.1,.5],col:[0x5f8a5a,0x4f7f62,0x6b9466],hard:.5,xbed:0,varnish:.1,between:true},
      turq:{p:.04,th:[.05,.3],col:[0x4fa3a0,0x63b3ad,0x3f9a9a],hard:.5,xbed:0,varnish:.1,between:true}},
      fx:{xbed:.6,varnish:.8}},
    'outland-tuff':{main:'tuff',kinds:{
      tuff:{p:.46,th:[2,15],col:[0xd8cbb0,0xe2d6bc,0xcdbd9c],hard:.3,xbed:0,varnish:.4},
      ash:{p:.16,th:[.2,1],col:[0xc9c0ae,0xbdb4a2,0xd4ccbb],hard:.2,xbed:0,varnish:.2,between:true},
      pink:{p:.12,th:[1,6],col:[0xd9b3a0,0xcfa592,0xe0bfae],hard:.35,xbed:0,varnish:.4},
      welded:{p:.12,th:[3,20],col:[0xb59a82,0xa98d76,0xbea58e],hard:.7,xbed:0,varnish:.7},
      altered:{p:.09,th:[1,8],col:[0xe6e0d2,0xd8d2c4,0xf0ebe0],hard:.25,xbed:0,varnish:.2},
      copper:{p:.05,th:[.1,.6],col:[0x5f8a5a,0x4f7f62,0x6b9466],hard:.45,xbed:0,varnish:.1,between:true}},
      fx:{varnish:.6}},
    'outland-basalt':{main:'flow',kinds:{
      flow:{p:.62,th:[4,25],col:[0x6e2e24,0x7d3527,0x5c2a22,0x733428],hard:.9,xbed:0,varnish:.9},
      scoria:{p:.2,th:[.5,3],col:[0x8e3c2a,0x9a4632,0x7f3424],hard:.4,xbed:0,varnish:.5},
      bole:{p:.14,th:[.2,1],col:[0xa0402a,0xae4a30,0x963c28],hard:.2,xbed:0,varnish:.2,between:true},
      copper:{p:.04,th:[.1,.4],col:[0x5f8a5a,0x4f9a8a],hard:.5,xbed:0,varnish:.1,between:true}},
      fx:{varnish:.9}},

    // the Godthrone's titanium basalt (biomes/godthrone/PLAN.md section 3; Godstep and the hyperjungle's drylands edge read
    // it): thin black flows with an ilmenite sheen, orange and black glass-bead horizons between eruptions, rubbly flow
    // tops; under the dry-cold line the bead beds turned ochre palagonite. No varnish
    tibasalt:{main:'flow',kinds:{
      flow:{p:.58,th:[1,15],col:[0x1e1d1f,0x25232a,0x2a2826,0x221f22],hard:.9,xbed:0,varnish:0},
      rubble:{p:.17,th:[.3,2],col:[0x383431,0x433c37,0x2f2b2a],hard:.5,xbed:0,varnish:0},
      bead:{p:.15,th:[.1,2],col:[0xc8641e,0xd77a28,0xbf5a1a],hard:.15,xbed:0,varnish:0,between:true},
      beadblack:{p:.1,th:[.1,1.5],col:[0x161515,0x1c1a19],hard:.15,xbed:0,varnish:0,between:true},
      palagonite:{p:0,th:[.1,2],col:[0xb8862f,0xc69a45,0xa8742a],hard:.2,xbed:0,varnish:0},
      laterite:{p:0,th:[1,10],col:[0x8e3a22,0xa0482a,0x7e321e],hard:.3,xbed:0,varnish:0}},
      alter:[{kinds:['bead','beadblack'],to:'palagonite',below:8500,band:400}],
      fx:{sheen:1}},
    // Godstep's ponded flows (biomes/godstep/PLAN.md section 2): thick flows that cooled slowly into colonnades (columns
    // under a hackly upper tier), thin bead and rubble partings; laterite is the wet low end's alteration (the page asks)
    'tibasalt-ponded':{main:'flow',kinds:{
      flow:{p:.72,th:[8,40],col:[0x1e1d1f,0x25232a,0x2a2826],hard:.95,xbed:0,varnish:0},
      rubble:{p:.14,th:[.5,3],col:[0x383431,0x433c37],hard:.5,xbed:0,varnish:0},
      bead:{p:.14,th:[.1,1.5],col:[0xc8641e,0xd77a28,0xbf5a1a],hard:.15,xbed:0,varnish:0,between:true},
      palagonite:{p:0,th:[.1,2],col:[0xb8862f,0xc69a45,0xa8742a],hard:.2,xbed:0,varnish:0},
      laterite:{p:0,th:[1,10],col:[0x8e3a22,0xa0482a,0x7e321e],hard:.3,xbed:0,varnish:0}},
      alter:[{kinds:['bead'],to:'palagonite',below:8500,band:400}],
      fx:{sheen:1,columns:1}},

    // the crater's patchwork rock (biomes/godthrone/PLAN.md section 3; the W outer wall's core, the SW highlands' `crest`):
    // no beds; blocks of every rock, metres to hundreds of metres, at every angle, in a grey matrix flecked with black and
    // bottle-green impact glass. A `fine` block is itself a breccia of blocks an eighth its size
    megabreccia:{kinds:{
      matrix:{p:0,th:[1,1],col:[0x6d6a66,0x75716c,0x66635f],hard:.45},
      tibasalt:{p:.2,th:[1,1],col:[0x232124,0x2a2826],hard:.9},
      redbasalt:{p:.12,th:[1,1],col:[0x6e2e24,0x7d3527],hard:.85},
      gneiss:{p:.16,th:[1,1],col:[0x8a8780,0x9a958c,0x7c7a74],hard:.9},
      tuff:{p:.1,th:[1,1],col:[0xd0c4aa,0xc2b598],hard:.35},
      redsand:{p:.12,th:[1,1],col:[0x9a4430,0xa5523a],hard:.7},
      lime:{p:.1,th:[1,1],col:[0xbdb6a6,0xc8c1b1],hard:.75},
      fine:{p:.2,th:[1,1],col:[0x7a7670],hard:.6}},
      blocks:{size:60,gap:.04,nest:{kind:'fine',size:7.5},bed:1.6,matrix:'matrix'},
      fx:{flecks:1}},
    crest:{alias:'megabreccia'},

    // the SW highlands (biomes/swhighlands/PLAN.md section 2): `pillar`, Span's tableland: thick quartz sandstone, iron-red
    // beds alternating with bleached white ones, thin soft partings, diagonal Liesegang bands (the shader's), vertical joints
    pillar:{main:'red',alternate:['red','white'],kinds:{
      red:{p:.42,th:[5,40],col:[0xa8452c,0xb5533a,0x9c3f2a,0xae4c30],hard:.9,xbed:.4,varnish:.15},
      white:{p:.42,th:[5,30],col:[0xe8e2d6,0xddd5c4,0xe2d9c6],hard:.85,xbed:.4,varnish:.15},
      parting:{p:.16,th:[.2,1],col:[0x8a6a58,0x7e6050,0x957262],hard:.2,xbed:0,varnish:.1,between:true}},
      fx:{liesegang:1,joints:1,xbed:.4}},
    // `ringfold`, the ring folds: hard sandstone and limestone ridges, soft shales in the valleys, opal-shell limestone
    // (Krator's ammolite: the shader's iridescence), deep-red beds. The folds are the page's (`fold`, axis along the crest)
    ringfold:{main:'shale',kinds:{
      sand:{p:.24,th:[3,20],col:[0x8f6a4a,0x9b7550,0x86634a],hard:.85,xbed:.5,varnish:.1},
      lime:{p:.2,th:[2,15],col:[0xb8b2a2,0xc4bfb0,0xaea898],hard:.8,xbed:0,varnish:.1},
      shale:{p:.36,th:[5,40],col:[0x5a4d48,0x4d4440,0x62544c],hard:.15,xbed:0,varnish:0},
      opal:{p:.06,th:[.5,3],col:[0xc9c3b5,0xbfc4bd,0xcfc6b4],hard:.75,xbed:0,varnish:0,irid:1},
      redbed:{p:.14,th:[2,10],col:[0x8a2a1e,0x7a2418,0x942f22],hard:.5,xbed:.2,varnish:0}},
      fx:{irid:1,xbed:.5}},

    // the W outer wall's lower bench (biomes/wouterwall/PLAN.md section 2): loess, pale buff silt, massive, standing in
    // vertical walls, with buried soils as faint darker bands and the odd calcrete nodule bed. Laid over megabreccia
    loess:{main:'loess',kinds:{
      loess:{p:.78,th:[3,14],col:[0xc9b48e,0xd1bd96,0xc2ab84],hard:.5,xbed:0,varnish:0,jit:.04},
      paleosol:{p:.16,th:[.4,1.5],col:[0xa98a66,0x9e8060,0xb09070],hard:.45,xbed:0,varnish:0,between:true,jit:.04},
      calcrete:{p:.06,th:[.1,.4],col:[0xddd2bc,0xe4dac6],hard:.75,xbed:0,varnish:0,between:true}},
      fx:{}}
  };
  function recipe(name){var r=RECIPES[name],n=0;
    while(r&&r.alias&&n++<8)r=RECIPES[r.alias];
    if(!r)throw new Error('KSTRATA: no recipe '+name);
    return r;}
  function add(rec){if(!rec||!rec.name)throw new Error('KSTRATA.add: a recipe needs a name');RECIPES[rec.name]=rec;return rec;}
  function nameOf(name){var r=RECIPES[name],n=name;while(r&&r.alias){n=r.alias;r=RECIPES[n];}return n;}

  // ---- the noise lattice: four channels of KRAND.hash bytes, so the shader (an RGBA8 texture read at texel centres), JS
  // and Godot read the same k/255 values. Channels: 0 warp 1, 1 warp 2, 2 and 3 the blocks (and the shader's streaks)
  function table(seed){var t=new Uint8Array(P*P*4);
    for(var j=0;j<P;j++)for(var i=0;i<P;i++)for(var c=0;c<4;c++)t[(j*P+i)*4+c]=R.hash(seed,i,j,c,0x57A7)>>>24;
    return t;}
  function tv(t,c,i,j){return t[(imod(j,P)*P+imod(i,P))*4+c]/255;}
  function noise(t,c,x,z){var xi=Math.floor(x),zi=Math.floor(z),fx=x-xi,fz=z-zi,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
    var a=tv(t,c,xi,zi),b=tv(t,c,xi+1,zi),d=tv(t,c,xi,zi+1),e=tv(t,c,xi+1,zi+1);
    var p=a+(b-a)*u,q=d+(e-d)*u;return p+(q-p)*v;}
  // the fold's profile: 1 at an anticline's crest, -1 in a syncline; round (a quartic, no sin) to chevron by sharp
  function wave(u,sharp){var t=u-Math.floor(u),s=1-32*t*t*(1-t)*(1-t),tri=4*Math.abs(t-.5)-1;return s+(tri-s)*sharp;}

  // ---- the beds of one formation over [0, H), each from KRAND.hash(seed, salt, i, k): kind, thickness, colour, jitter
  function kindList(rec){var ks=[];for(var k in rec.kinds)ks.push(k);return ks;}
  function pickKind(rec,ks,u){var tot=0,i;for(i=0;i<ks.length;i++)tot+=rec.kinds[ks[i]].p||0;
    var a=u*tot;for(i=0;i<ks.length;i++){var p=rec.kinds[ks[i]].p||0;if(p>0&&a<p)return ks[i];a-=p;}
    for(i=ks.length-1;i>=0;i--)if((rec.kinds[ks[i]].p||0)>0)return ks[i];return ks[0];}
  function colourOf(K,u,ju,tint){var c=hex3(K.col[Math.floor(u*K.col.length)%K.col.length]),j=1+(ju-.5)*(K.jit==null?.08:K.jit);
    return [clamp(c[0]*j*tint[0],0,1),clamp(c[1]*j*tint[1],0,1),clamp(c[2]*j*tint[2],0,1)];}
  function beds(rec,seed,salt,H,tint,count){var ks=kindList(rec),out=[],y=0,i=0,last=null,lastAlt=null,alt=rec.alternate;
    while(y<H){var kind=pickKind(rec,ks,R.unit(R.hash(seed,salt,i,1)));
      if(rec.kinds[kind].between&&last&&rec.kinds[last].between)kind=rec.main||ks[0];
      if(alt&&alt.indexOf(kind)>=0){if(lastAlt!=null)kind=alt[0]===lastAlt?alt[1]:alt[0];lastAlt=kind;}
      var K=rec.kinds[kind],th=K.th[0]+(K.th[1]-K.th[0])*R.unit(R.hash(seed,salt,i,2));
      th=Math.min(th,H-y);
      out.push({y0:y,th:th,kind:kind,colour:colourOf(K,R.unit(R.hash(seed,salt,i,3)),R.unit(R.hash(seed,salt,i,4)),tint)});
      y+=th;i++;last=kind;if(count.n+i>MAXBEDS)throw new Error('KSTRATA: over '+MAXBEDS+' beds (a formation too thick for its recipe)');}
    count.n+=i;return out;}
  // today's column, bit for bit: the same mulberry32 stream (KRAND.stream is it), the same draws in the same order
  function legacyBeds(seed,colM,pal){var s=R.stream(seed),rec=RECIPES.canyon,out=[],y=0;
    pal=pal||null;
    while(y<colM){var u=s.next(),kind,th;
      if(u<.46){kind='sand';th=2.5+s.next()*9;}else if(u<.68){kind='shale';th=.35+s.next()*1.4;}else if(u<.83){kind='mud';th=.8+s.next()*2.2;}
      else if(u<.95){kind='bleach';th=1+s.next()*3.5;}else{kind='green';th=.3+s.next()*.9;}
      th=Math.min(th,colM-y);var a=(pal&&(pal[kind]||pal.mud))||rec.kinds[kind].col;
      out.push({y0:y,th:th,kind:kind,colour:hex3(a[Math.floor(s.next()*a.length)%a.length])});y+=th;}
    return out;}

  // ---- the stack
  function resolve(opt){var range=opt.range||[-200,2000],src=opt.formations||[{recipe:opt.recipe||'canyon'}],fs=[],k,prev=range[0];
    for(k=0;k<src.length;k++){var f=src[k],base=f.base==null?prev:f.base,top;
      if(f.top!=null)top=f.top;else if(f.th!=null)top=base+f.th;
      else if(k+1<src.length){if(src[k+1].base==null)throw new Error('KSTRATA: formation '+k+' needs top, th or the next one\'s base');top=src[k+1].base;}
      else top=range[1];
      if(!(top>base))throw new Error('KSTRATA: formation '+k+' ('+f.recipe+') has top <= base');
      var rec=recipe(f.recipe);
      if(rec.suite){var tot=0,i,b=base;for(i=0;i<rec.suite.length;i++)tot+=rec.suite[i].share;
        for(i=0;i<rec.suite.length;i++){var t=i===rec.suite.length-1?top:b+(top-base)*rec.suite[i].share/tot;
          fs.push({recipe:rec.suite[i].recipe,base:b,top:t,tint:f.tint,flip:f.flip,seed:f.seed==null?null:R.hash(f.seed,i),parent:f.recipe,k:k*16+i});b=t;}}
      else fs.push({recipe:nameOf(f.recipe),base:base,top:top,tint:f.tint,flip:f.flip,repeat:f.repeat,seed:f.seed,k:k*16});
      prev=top;}
    for(k=1;k<fs.length;k++)if(fs[k].base<fs[k-1].top-1e-9)throw new Error('KSTRATA: formations overlap at '+k);
    return fs;}

  function create(opt){opt=opt||{};
    var seed=opt.seed==null?4711:opt.seed>>>0,count={n:0},fs,kinds=[],kid={};
    if(opt.legacy){var colM=opt.legacy.columnM==null?180:opt.legacy.columnM;
      fs=[{recipe:'canyon',base:0,top:colM,repeat:colM,k:0,legacy:true,beds:legacyBeds(seed,colM,opt.legacy.palette)}];}
    else fs=resolve(opt);
    function kindId(rname,k){var key=rname+'.'+k;if(kid[key]==null){var K=recipe(rname).kinds[k];
      if(!K)throw new Error('KSTRATA: recipe '+rname+' has no kind '+k);
      kid[key]=kinds.length;kinds.push({id:kinds.length,name:key,recipe:rname,kind:k,hard:K.hard==null?.5:K.hard,xbed:K.xbed==null?0:K.xbed,
        varnish:K.varnish==null?0:K.varnish,irid:K.irid==null?0:K.irid,col:K.col.map(hex3)});}return kid[key];}
    var alter=(opt.alter===undefined?null:opt.alter);
    for(var k=0;k<fs.length;k++){var f=fs[k],rec=recipe(f.recipe),tint=f.tint||[1,1,1];
      f.salt=f.seed==null?R.hash(seed,f.k,0x5EED):f.seed>>>0;
      if(!f.legacy&&!rec.blocks)f.beds=beds(rec,seed,f.salt,f.repeat==null?f.top-f.base:f.repeat,tint,count);
      if(rec.blocks){f.blocks=rec.blocks;f.clasts=[];f.weights=[];for(var c in rec.kinds){kindId(f.recipe,c);
        if((rec.kinds[c].p||0)>0){f.clasts.push(c);f.weights.push(rec.kinds[c].p);}}f.matrix=rec.blocks.matrix;}
      if(f.beds)for(var b=0;b<f.beds.length;b++)f.beds[b].kid=kindId(f.recipe,f.beds[b].kind);
      f.alter=(alter||rec.alter||[]).map(function(a){return {kinds:a.kinds,to:a.to,below:a.below,band:a.band==null?0:a.band};});
      for(var a=0;a<f.alter.length;a++)if(rec.kinds[f.alter[a].to])kindId(f.recipe,f.alter[a].to);
      f.tint=tint;}
    var rec0={format:'krator-strata',version:1,seed:seed,P:P,dip:opt.dip||[.6,.8,.012],warp:opt.warp||[9,2.2],
      warpF:opt.warpF||[.0152,.0696],fold:opt.fold||null,faults:opt.faults||[],kinds:kinds,
      formations:fs.map(function(f){var o={recipe:f.recipe,base:f.base,top:f.top,flip:!!f.flip,repeat:f.repeat==null?null:f.repeat,
        salt:f.salt,tint:f.tint,alter:f.alter};
        if(f.parent)o.parent=f.parent;
        if(f.beds)o.beds=f.beds.map(function(b){return [b.y0,b.th,b.kid,b.colour[0],b.colour[1],b.colour[2]];});
        if(f.blocks)o.blocks={size:f.blocks.size,gap:f.blocks.gap,bed:f.blocks.bed,nest:f.blocks.nest||null,matrix:f.matrix,
          clasts:f.clasts.map(function(c){return kid[f.recipe+'.'+c];}),weights:f.weights};
        return o;})};
    return load(rec0);}

  // ---- reading: everything below works from the records alone (so load(export()) is the same stack)
  function load(J){if(!J||J.format!=='krator-strata')throw new Error('KSTRATA.load: not a krator-strata record');
    var T=table(J.seed),dip=J.dip,warp=J.warp,wf=J.warpF,fold=J.fold,faults=J.faults,kinds=J.kinds,fs=J.formations;
    var kindAt={};kinds.forEach(function(K){kindAt[K.name]=K.id;});
    var fd=null;if(fold){var dl=Math.sqrt(fold.dir[0]*fold.dir[0]+fold.dir[1]*fold.dir[1]);
      fd={nx:-fold.dir[1]/dl,nz:fold.dir[0]/dl,wl:fold.wl,amp:fold.amp,ph:fold.phase==null?0:fold.phase,sh:fold.sharp==null?0:fold.sharp,
        ax:fold.at?fold.at[0]:0,az:fold.at?fold.at[1]:0};}
    function w1(x,z){return noise(T,0,x*wf[0],z*wf[0])-.5;}
    function yy(x,y,z){var v=y+w1(x,z)*warp[0]+(noise(T,1,x*wf[1]+.37,z*wf[1]+.37)-.5)*warp[1]+(x*dip[0]+z*dip[1])*dip[2];
      if(fd)v-=fd.amp*wave(((x-fd.ax)*fd.nx+(z-fd.az)*fd.nz)/fd.wl+fd.ph,fd.sh);
      for(var i=0;i<faults.length;i++){var F=faults[i],ax=F.a[0],az=F.a[1],dx=F.b[0]-ax,dz=F.b[1]-az,L=Math.sqrt(dx*dx+dz*dz);
        var s=(dz*(x-ax)-dx*(z-az))/L,w=F.w==null?2:F.w,m=1;
        if(F.taper){var t=((x-ax)*dx+(z-az)*dz)/(L*L);m=clamp(1+Math.min(t,1-t)*L/F.taper,0,1);}
        v+=F.throw*sstep(-w,w,s)*m;}
      return v;}
    function formationAt(v){var lo=0,hi=fs.length-1;if(v<fs[0].base)return 0;
      while(lo<hi){var mid=(lo+hi+1)>>1;if(fs[mid].base<=v)lo=mid;else hi=mid-1;}return lo;}
    function bedIn(F,v){var B=F.beds,H=F.repeat==null?F.top-F.base:F.repeat,r=v-F.base;
      if(F.flip)r=(F.top-F.base)-r;
      if(F.repeat!=null)r=r-Math.floor(r/H)*H;else r=clamp(r,0,H);
      var lo=0,hi=B.length-1;while(lo<hi){var mid=(lo+hi+1)>>1;if(B[mid][0]<=r)lo=mid;else hi=mid-1;}
      return {i:lo,r:r};}
    // the blocks: a 3D jittered lattice (27 cells; jitter .15-.85 of a cell keeps the nearest within them), each cell's
    // values from the table at an offset, so the shader reads the same
    function cellVals(i,j,k,off){var ti=i+7*k+off,tj=j+13*k+off*3;return [tv(T,0,ti,tj),tv(T,1,ti,tj),tv(T,2,ti,tj),tv(T,3,ti,tj)];}
    function worley(x,y,z,size,off){var ci=Math.floor(x/size),cj=Math.floor(y/size),ck=Math.floor(z/size),d1=1e30,d2=1e30,bi=0,bj=0,bk=0,bv=null;
      for(var a=-1;a<=1;a++)for(var b=-1;b<=1;b++)for(var c=-1;c<=1;c++){var i=ci+a,j=cj+b,k=ck+c,v=cellVals(i,j,k,off);
        var px=(i+.15+.7*v[0])*size-x,py=(j+.15+.7*v[1])*size-y,pz=(k+.15+.7*v[2])*size-z,d=Math.sqrt(px*px+py*py+pz*pz);
        if(d<d1){d2=d1;d1=d;bi=i;bj=j;bk=k;bv=v;}else if(d<d2)d2=d;}
      return {d1:d1,d2:d2,i:bi,j:bj,k:bk,v:bv};}
    function pickW(F,u){var Wt=F.blocks.weights,tot=0,i;for(i=0;i<Wt.length;i++)tot+=Wt[i];var a=u*tot;
      for(i=0;i<Wt.length;i++){if(a<Wt[i])return F.blocks.clasts[i];a-=Wt[i];}return F.blocks.clasts[Wt.length-1];}
    function blockAt(F,x,v,z,o){var Bk=F.blocks,W=worley(x,v,z,Bk.size,11),mk=kindAt[F.recipe+'.'+Bk.matrix];
      o.cell=[W.i,W.j,W.k];o.f=0;o.edge=(W.d2-W.d1)*.5;
      if(W.d2-W.d1<Bk.gap*Bk.size){o.kid=mk;o.colour=kinds[mk].col[Math.floor(W.v[3]*kinds[mk].col.length)%kinds[mk].col.length].slice();return;}
      var id=pickW(F,W.v[3]);
      if(Bk.nest&&kinds[id].kind===Bk.nest.kind){var V=worley(x,v,z,Bk.nest.size,29);W=V;o.cell=[V.i,V.j,V.k];o.edge=(V.d2-V.d1)*.5;
        if(V.d2-V.d1<Bk.gap*Bk.nest.size){o.kid=mk;o.colour=kinds[mk].col[0].slice();return;}
        id=pickW(F,V.v[3]);if(kinds[id].kind===Bk.nest.kind)id=mk;}
      var K=kinds[id],vv=cellVals(W.i,W.j,W.k,23),nx=vv[0]-.5,ny=vv[1]-.5,nz=vv[2]-.5,nl=Math.sqrt(nx*nx+ny*ny+nz*nz);
      if(nl<1e-6){nx=0;ny=1;nz=0;nl=1;}
      var band=Math.floor((x*nx+v*ny+z*nz)/nl/Bk.bed),odd=band-2*Math.floor(band/2),c=K.col[Math.floor(vv[3]*K.col.length)%K.col.length],m=odd?.9:1;
      o.kid=id;o.colour=[c[0]*m,c[1]*m,c[2]*m];}
    function at(x,y,z,o){o=o||{};var v=yy(x,y,z),fi=formationAt(v),F=fs[fi];
      o.yy=v;o.formation=fi;o.recipe=F.recipe;o.altered=false;o.cell=null;
      if(F.blocks){o.bed=-1;blockAt(F,x,v,z,o);}
      else{var q=bedIn(F,v),b=F.beds[q.i];o.bed=q.i;o.kid=b[2];o.colour=[b[3],b[4],b[5]];
        var f=clamp((q.r-b[0])/b[1],0,1);if(F.flip)f=1-f;o.f=f;o.edge=Math.min(q.r-b[0],b[0]+b[1]-q.r);}
      for(var a=0;a<F.alter.length;a++){var A=F.alter[a],K=kinds[o.kid];
        if(A.kinds!=='*'&&A.kinds.indexOf(K.kind)<0)continue;
        if(y<A.below+A.band*2*w1(x,z)){var tk=kindAt[F.recipe+'.'+A.to];if(tk==null)continue;
          var u=o.bed>=0?R.unit(R.hash(F.salt,o.bed,5)):R.unit(R.hash(F.salt,o.cell[0],o.cell[1],o.cell[2],5)),C=kinds[tk].col;
          o.kid=tk;o.colour=C[Math.floor(u*C.length)%C.length].slice();o.altered=true;break;}}
      var KK=kinds[o.kid];o.kind=KK.kind;o.hard=KK.hard;return o;}
    function bedAt(v,o){o=o||{};var fi=formationAt(v),F=fs[fi];o.formation=fi;o.blocks=!!F.blocks;
      if(F.blocks){o.bed=-1;o.kid=kindAt[F.recipe+'.'+F.blocks.matrix];o.colour=kinds[o.kid].col[0].slice();o.f=0;o.edge=1e9;return o;}
      var q=bedIn(F,v),b=F.beds[q.i],f=clamp((q.r-b[0])/b[1],0,1);
      o.bed=q.i;o.kid=b[2];o.colour=[b[3],b[4],b[5]];o.f=F.flip?1-f:f;o.edge=Math.min(q.r-b[0],b[0]+b[1]-q.r);return o;}
    function colorAt(v){var F=fs[formationAt(v)];
      if(F.blocks){var mk=kindAt[F.recipe+'.'+F.blocks.matrix];return kinds[mk].col[0].slice();}
      var b=F.beds[bedIn(F,v).i];return [b[3],b[4],b[5]];}
    function terrace(x,z,h,k){k=k==null?.6:k;var v=yy(x,h,z),F=fs[formationAt(v)];if(F.blocks)return h;
      var q=bedIn(F,v),b=F.beds[q.i],f=clamp((q.r-b[0])/b[1],0,1),s=clamp(k*kinds[b[2]].hard,0,1),g=f+s*(f*f*(3-2*f)-f);
      if(F.flip)return h-(g-f)*b[1];
      return h+(g-f)*b[1];}
    var first=fs[0];
    return {format:J.format,seed:J.seed,table:T,kinds:kinds,formations:fs,
      beds:first.beds?first.beds.map(function(b){return {y0:b[0],th:b[1],kind:kinds[b[2]].kind,kid:b[2],colour:[b[3],b[4],b[5]]};}):[],
      columnM:first.repeat,range:[fs[0].base,fs[fs.length-1].top],dip:dip,warp:warp,warpF:wf,fold:fold,faults:faults,
      yy:yy,at:at,bedAt:bedAt,hardnessAt:function(x,y,z){return at(x,y,z).hard;},colorAt:colorAt,terrace:terrace,
      export:function(){return JSON.parse(JSON.stringify(J));}};}

  root.KSTRATA={create:create,load:load,recipe:recipe,add:add,RECIPES:RECIPES,P:P,table:table,
    noise:noise,wave:wave,legacyBeds:legacyBeds};
})(typeof window!=='undefined'?window:globalThis);
