/* ============================== 13b. ASSET REGISTRY + BUILD FRAME ==============================
   PLANNER-OWNED. Every building type in Yuni is an ASSET: metadata + a build(F)
   function that draws ONE instance through a local frame F, so no builder ever
   touches a world rotation convention. The world pass will place them; the
   inspection sheet (70-sheet.js) lays them all out, unplaced, for review.

   ASSET({ key, name, family, districts:[...], wealth:[lo,hi], w, d, h, variants, build:function(F){...} })
     key       unique id, snake_case, prefixed by family ('poor_musgum')
     name      the TOP-LEVEL NAME the inspector shows ('Musgum shell house')
     family    'ancient' | 'rich' | 'civic' | 'mid' | 'trade' | 'poor' | 'park' | 'prop'
     districts where it belongs: 'core','prosper','market','poor'
     wealth    [lo,hi] 0..1 band of districtAt().wealth it suits
     w,d,h     footprint (x, z) and overall height in metres — build() MUST stay inside w x d
     variants  how many distinct looks build() can produce (F.variant = 0..variants-1)

   LOCAL FRAME: origin at the footprint centre on the ground; +x to the right, +z is the FRONT
   (the door side, the side that will face the street), y up from F.y (ground at the centre).
   F.seed / F.variant / F.wealth drive variation; use F.rnd() (a private stream), never rnd().  */
var ASSETS = [], ASSET_BY_KEY = {};
/* PROJECT TAGS (every kit asset carries them; the inspector shows them):
     culture  who builds it: 'yuni' | 'abyssal-desert' | 'geomancer' | 'ancient' | 'sahelian' | 'order' | 'nomad'
     types    building types, one or more of BUILDING_TYPES
     kit      which sub-kit sheet(s) it belongs to: a string ('locus') or an array (['locus','abyss']);
              absent = the Yuni base kit. Test it with assetInKit(A,k), never A.kit===k.
     group    the row it is laid out in on its kit sheet (free text)
     kitGroup optional per-kit override of `group`, for an asset on two sheets: { abyss:'Housing — poor' }.
              Read it with assetGroup(A,k).
     sim      optional life-layer scaffolding (data only; nothing reads it yet): { activity, capacity, focus:[x,y,z] } */
var BUILDING_TYPES = ['civic','market/shop','tavern/inn','industry','farm','single-family dwelling','multi-family dwelling','infrastructure','religious','funerary','military','prop'];
function assetInKit(A,k){ return Array.isArray(A.kit) ? A.kit.indexOf(k)>=0 : A.kit===k; }
function assetGroup(A,k){ return (A.kitGroup && A.kitGroup[k]) || A.group || 'kit'; }
/* KIT_ROWS[kit] = the row order on that kit's sheet; a kit without an entry keeps fragment (declaration) order */
var KIT_ROWS = {};
function ASSET(o){ if(ASSET_BY_KEY[o.key]) ERR('asset key declared twice: '+o.key); o.variants=o.variants||1;
  if(o.kit){ if(!o.culture) ERR('asset '+o.key+' (kit '+o.kit+') has no culture tag');
    if(!o.types || !o.types.length) ERR('asset '+o.key+' (kit '+o.kit+') has no building-type tags');
    else o.types.forEach(function(t){ if(BUILDING_TYPES.indexOf(t)<0) ERR('asset '+o.key+': unknown building type "'+t+'" (one of: '+BUILDING_TYPES.join(', ')+')'); }); }
  ASSETS.push(o); ASSET_BY_KEY[o.key]=o; return o; }
function assetTags(A){ return (A.culture ? 'culture: '+A.culture : '') + (A.types ? ' · type: '+A.types.join(' + ') : '') + (A.tags ? ' · '+A.tags.join(', ') : ''); }

/* ---------- 13b-ii. THE FURNITURE REGISTRY ----------------------------------------------
   Interior furniture is registered SEPARATELY from buildings and laid out in its own
   catalogue (yuni-furniture.html). Anything that stands inside a room — seating, tables,
   beds, storage, shelving, looms, braziers, shrines, counters, instruments — belongs here,
   so a builder in any family can pull a piece instead of re-inventing it.

   FURN({ key, name, culture, room, w, d, h, variants, build:function(F){...} })
     key      unique id, snake_case, prefixed by culture ('sahelian_low_bed')
     name     the TOP-LEVEL NAME the catalogue shows
     culture  WHO MADE IT — one of FURN_CULTURES. Required: every piece is tagged.
     room     free text, what room it belongs in ('hall','bedroom','shop','study','court')
     w,d,h    footprint (x, z) and height in METRES; build() must stay inside w x d
   The build frame is the same F as an ASSET: origin at the footprint centre on the floor,
   +z is the FRONT (the side you face it from / its open side).                              */
var FURN_CULTURES = ['ancient','yuni-court','yuni-common','yuni-poor','sahelian','order','nomad','ancients-salvage','abyssal-desert'];
var FURNS = [], FURN_BY_KEY = {};
function FURN(o){
  if(FURN_BY_KEY[o.key]) ERR('furniture key declared twice: '+o.key);
  if(!o.culture) ERR('furniture '+o.key+' has no culture tag (one of: '+FURN_CULTURES.join(', ')+')');
  else if(FURN_CULTURES.indexOf(o.culture)<0) ERR('furniture '+o.key+': unknown culture "'+o.culture+'" (one of: '+FURN_CULTURES.join(', ')+')');
  o.variants=o.variants||1; o.room=o.room||'hall'; FURNS.push(o); FURN_BY_KEY[o.key]=o; return o;
}

/* ---------- 13b-iii. THE PLANT REGISTRY --------------------------------------------------
   Every plant is registered here and laid out in its own catalogue (yuni-plants.html), so
   the same species can be re-used by any later world in Krator that has the right climate.

   PLANT({ key, name, climate, aridity, w, d, h, variants, build:function(F){...} })
     climate  'hypertropic' | 'tropic' | 'temperate' | 'cold'  — the band it grows in
     aridity  preferred aridity: 'arid' | 'semiarid' | 'subhumid' | 'humid'
     w,d,h    canopy spread (x, z) and height in metres at the size build() draws
   Yuni's valley is TEMPERATE / SEMIARID (Mediterranean), so that is the local pair.        */
var PLANT_CLIMATES = ['hypertropic','tropic','temperate','cold'];
var PLANT_ARIDITY  = ['arid','semiarid','subhumid','humid'];
var PLANTS = [], PLANT_BY_KEY = {};
function PLANT(o){
  if(PLANT_BY_KEY[o.key]) ERR('plant key declared twice: '+o.key);
  if(PLANT_CLIMATES.indexOf(o.climate)<0) ERR('plant '+o.key+': climate must be one of '+PLANT_CLIMATES.join(', '));
  if(PLANT_ARIDITY.indexOf(o.aridity)<0) ERR('plant '+o.key+': aridity must be one of '+PLANT_ARIDITY.join(', '));
  /* project biome tags (optional, LOCUS onward): tags:{ wet:'arid'|'mild'|'wet', abyssal:true|false, riparian:'yes'|'no'|'both' } */
  o.variants=o.variants||1; PLANTS.push(o); PLANT_BY_KEY[o.key]=o; return o;
}
function plantTags(A){ var t=A.tags||{}; return A.climate+' · '+A.aridity+(t.wet?' · '+t.wet:'')+(t.abyssal!=null?(t.abyssal?' · abyssal':' · non-abyssal'):'')+(t.riparian?' · riparian: '+t.riparian:''); }

function assetFrame(x,z,ry,opt){
  opt=opt||{};
  var F={ x:x, z:z, ry:ry||0, y:opt.y!=null?opt.y:terrainH(x,z), seed:opt.seed||1, variant:opt.variant||0, wealth:opt.wealth==null?0.5:opt.wealth, name:opt.name||'' };
  var st=(F.seed*2654435761)>>>0;
  F.rnd=function(){ st=(Math.imul(st,1664525)+1013904223)>>>0; return st/4294967296; };
  F.rr=function(a,b){ return a+(b-a)*F.rnd(); };
  F.pick=function(arr){ return arr[Math.floor(F.rnd()*arr.length)%arr.length]; };
  F.chance=function(p){ return F.rnd()<p; };
  F.p=function(lx,lz){ return loc(F.x,F.z,lx,lz,F.ry); };                       /* local -> world [x,z] */
  F.P=function(lx,ly,lz){ var q=loc(F.x,F.z,lx,lz,F.ry); return { x:q[0], y:F.y+ly, z:q[1] }; };
  F.dir=function(lx,lz){ return [ lx*Math.cos(F.ry)+lz*Math.sin(F.ry), -lx*Math.sin(F.ry)+lz*Math.cos(F.ry) ]; };
  function rot(r){ return (typeof r==='number'||r==null) ? F.ry+(r||0) : [r[0], F.ry+r[1], r[2]]; }
  /* instanced primitives — same argument order as the kit, but local coords and ly = height above the ground */
  F.box =function(lx,ly,lz,w,h,d,r,c,f){ var q=F.p(lx,lz); BOX(q[0],F.y+ly,q[1],w,h,d,rot(r),c,f); };
  F.fr8 =function(lx,ly,lz,w,h,d,r,c,f){ var q=F.p(lx,lz); FR8(q[0],F.y+ly,q[1],w,h,d,rot(r),c,f); };
  F.fr5 =function(lx,ly,lz,w,h,d,r,c,f){ var q=F.p(lx,lz); FR5(q[0],F.y+ly,q[1],w,h,d,rot(r),c,f); };
  F.pyr =function(lx,ly,lz,w,h,d,r,c,f){ var q=F.p(lx,lz); PYR(q[0],F.y+ly,q[1],w,h,d,rot(r),c,f); };
  F.cyl =function(lx,ly,lz,r0,h,r,c,f){ var q=F.p(lx,lz); CYL(q[0],F.y+ly,q[1],r0,h,rot(r),c,f); };
  F.cone=function(lx,ly,lz,r0,h,r,c,f){ var q=F.p(lx,lz); CONE(q[0],F.y+ly,q[1],r0,h,rot(r),c,f); };
  F.dome=function(lx,ly,lz,r0,h,r,c,f){ var q=F.p(lx,lz); DOME(q[0],F.y+ly,q[1],r0,h,rot(r),c,f); };
  F.blob=function(lx,ly,lz,r0,h,r,c,f){ var q=F.p(lx,lz); BLOB(q[0],F.y+ly,q[1],r0,h,rot(r),c,f); };
  F.ball=function(lx,ly,lz,r0,c,f){ var q=F.p(lx,lz); BALL(q[0],F.y+ly,q[1],r0,c,f); };
  /* an ELLIPSOID / flattened dome: sx,sy,sz radii (instanced 'dome' or 'ball' with non-uniform scale) */
  F.edome=function(lx,ly,lz,sx,sy,sz,r,c,f){ var q=F.p(lx,lz); push('dome', f||'adobe', [q[0],F.y+ly,q[1],sx,sy,sz,rot(r),c]); };
  F.beam=function(ax,ay,az,bx,by,bz,w,d,c,f){ var a=F.p(ax,az), b=F.p(bx,bz); BEAM(a[0],F.y+ay,a[1],b[0],F.y+by,b[1],w,d,c,f); };
  F.rod =function(ax,ay,az,bx,by,bz,r0,c,f){ var a=F.p(ax,az), b=F.p(bx,bz); ROD(a[0],F.y+ay,a[1],b[0],F.y+by,b[1],r0,c,f||'timber'); };
  /* merged-mesh shapes */
  /* rfn's angle is handed over in the ASSET's frame (tuned on the sheet, where ry = PI), so lobes and bulges turn with the building */
  F.tube=function(fam, pts, col, o){ if(o && o.rfn && !o._loc){ var o2={}, f0=o.rfn; for(var k in o) o2[k]=o[k]; o2._loc=1; o2.rfn=function(i,ang,pt){ return f0(i, ang - F.ry + Math.PI, pt); }; o=o2; }
    TUBE(fam, pts.map(function(p){ var q=F.p(p.x,p.z); return { x:q[0], y:F.y+p.y, z:q[1], r:p.r, col:p.col }; }), col, o); };
  F.lathe=function(fam, lx,lz, prof, col, o){ /* prof = [[r,y],...] bottom to top: a surface of revolution about a vertical axis */
    F.tube(fam, prof.map(function(p){ return { x:lx, y:p[1], z:lz, r:p[0], col:p[2] }; }), col, o||{ seg:16 }); };
  F.mcone=function(fam, lx,ly,lz, rb,rt,h, col, seg, o){ var q=F.p(lx,lz); MCONE(fam, q[0],F.y+ly,q[1], rb,rt,h, col, seg, o); };
  F.quad=function(fam, a,b,c,d, col, hint){ function W(p){ var q=F.p(p[0],p[2]); return [q[0],F.y+p[1],q[1]]; } var hd=F.dir(hint[0],hint[2]); QF(fam, W(a),W(b),W(c),W(d), col, [hd[0],hint[1],hd[1]]); };
  F.tri =function(fam, a,b,c, col, hint){ function W(p){ var q=F.p(p[0],p[2]); return [q[0],F.y+p[1],q[1]]; } var hd=F.dir(hint[0],hint[2]); TF(fam, W(a),W(b),W(c), col, [hd[0],hint[1],hd[1]]); };
  /* a wall slab with a parabolic opening; `face` = local direction it faces, as an angle: 0 = front(+z), PI/2 = right(+x), PI = back, -PI/2 = left */
  F.archwall=function(fam, lx,ly,lz, face, W,H,T, ow,oh, col, o){ var q=F.p(lx,lz); ARCHWALL(fam, q[0],q[1], F.ry+(face||0), F.y+ly, W,H,T, ow,oh, col, o); };
  F.archband=function(fam, lx,ly,lz, face, ow,oh, t, dep, col, o){ var q=F.p(lx,lz); ARCHBAND(fam, q[0],q[1], F.ry+(face||0), F.y+ly, ow,oh, t, dep, col, o); };
  /* an arcade: n parabolic bays in a row along the wall's own x, centred at (lx,lz) */
  F.arcade=function(fam, lx,ly,lz, face, n, bayW, H, T, col, o){ o=o||{}; for(var i=0;i<n;i++){ var off=(i-(n-1)/2)*bayW, c=Math.cos(face||0), s=Math.sin(face||0);
      F.archwall(fam, lx+off*c, ly, lz-off*s, face, bayW, H, T, bayW-(o.pier||1.2), H-(o.head||1.0), col, o); } };
  F.sector=function(fam, lx,lz, r0,r1, a0,a1, yb,yt, col, o){ var q=F.p(lx,lz); SECTOR(fam, platFrame(q[0],q[1],-F.ry), r0,r1, a0,a1, F.y+yb,F.y+yt, col, o); };
  F.tower=function(lx,ly,lz, R,h, o){ var q=F.p(lx,lz); BLUNT_TOWER(q[0],F.y+ly,q[1], R,h, o); };
  /* fittings */
  F.lantern=function(lx,ly,lz, amp,rad, hang){ var q=F.p(lx,lz); LANTERN(q[0],F.y+ly,q[1], amp,rad, false, hang||0); };
  F.lamp=function(lx,ly,lz, amp,rad){ var q=F.p(lx,lz); nlLampAdd(q[0],F.y+ly,q[1], amp,rad, false); };
  /* a window: dark reveal + a pane that lights on the evening schedule. nlx,nlz = the LOCAL outward normal of the wall it is in */
  F.window=function(lx,ly,lz, nlx,nlz, w,h, opt){ var q=F.p(lx,lz), n=F.dir(nlx,nlz), a=Math.atan2(n[0],n[1]); opt=opt||{};
    if(!opt.noReveal) BOX(q[0]-n[0]*0.10, F.y+ly-h/2, q[1]-n[1]*0.10, w+0.16, h+0.16, 0.30, a, VOIDC[0], 'dark');
    WINPANE(q[0]+n[0]*0.06, F.y+ly, q[1]+n[1]*0.06, n[0],n[1], w,h, !!opt.cool); };
  /* a disc lying in a wall: oculus, medallion, round-window frame. nlx,nlz = LOCAL outward normal; it stands OUT from (lx,lz) by `thick`. */
  F.disc=function(lx,ly,lz, nlx,nlz, r0, thick, col, fam){ var q=F.p(lx,lz), n=F.dir(nlx,nlz), y=F.y+ly, t=thick||0.3;
    push('cyl', fam||'plaster', [q[0],y,q[1], r0,t,r0, beamQuat(q[0],y,q[1], q[0]+n[0],y,q[1]+n[1]), col]); };
  /* a round window: frame ring, dark socket, radial mullions, and a pane that lights at night */
  F.roundWindow=function(lx,ly,lz, nlx,nlz, r0, colFrame, spokes){
    var q=F.p(lx,lz), n=F.dir(nlx,nlz), y=F.y+ly, ns=spokes==null?8:spokes, cf=colFrame!=null?colFrame:WHITEC[0];
    F.disc(lx,ly,lz, nlx,nlz, r0+0.34, 0.42, cf, 'relief');
    F.disc(lx,ly,lz, nlx,nlz, r0, 0.26, VOIDC[0], 'dark');
    WINPANE(q[0]+n[0]*0.18, y, q[1]+n[1]*0.18, n[0],n[1], r0*1.34, r0*1.34, false);
    for(var k=0;k<ns;k++){ var th=Math.PI*k/ns, ux=Math.cos(th)*r0, uy=Math.sin(th)*r0;
      BEAM(q[0]-n[1]*ux, y-uy, q[1]+n[0]*ux, q[0]+n[1]*ux, y+uy, q[1]-n[0]*ux, 0.10, 0.22, cf, 'relief'); } };
  /* plant a tree from the asset's own stream: kind = cypress | pine | olive | palm | shrub */
  F.tree=function(lx,lz,kind,h,ly){
    var q=F.p(lx,lz), y=F.y+(ly||0), c, R;
    if(kind==='pine'){ c=F.pick(PAL.pine); R=h*0.30;
      CYL(q[0],y,q[1], 0.20+h*0.012, h*0.72, 0, PAL.trunk[0], 'bark');
      push('ball','leafy',[q[0], y+h*0.70, q[1], R, R*0.42, R, 0, c]);
      push('ball','leafy',[q[0]+R*0.30, y+h*0.80, q[1]-R*0.20, R*0.62, R*0.32, R*0.62, 0, shade(c,0.07)]); }
    else if(kind==='olive'){ c=F.pick(PAL.olive);
      CYL(q[0],y,q[1], 0.22+h*0.030, h*0.45, [F.rr(-0.14,0.14), F.rnd()*TAU, 0], PAL.trunk[3], 'bark');
      for(var k=0;k<2;k++){ var a=F.rnd()*TAU, d=h*0.20*k;
        BLOB(q[0]+Math.cos(a)*d, y+h*(0.36+0.12*k), q[1]+Math.sin(a)*d, h*(0.46-0.08*k), h*(0.52-0.06*k), F.rnd()*TAU, k?shade(c,0.08):c, 'leafy'); } }
    else if(kind==='palm'){ c=F.pick(PAL.palm);
      CYL(q[0],y,q[1], 0.19+h*0.008, h*0.86, [F.rr(-0.06,0.06), F.rnd()*TAU, 0], PAL.trunk[2], 'bark');
      for(var f=0;f<7;f++){ var fa=f/7*TAU+F.rr(0,0.5), fr=h*0.34;
        BEAM(q[0], y+h*0.86, q[1], q[0]+Math.cos(fa)*fr, y+h*0.86+F.rr(-0.10,0.16)*h, q[1]+Math.sin(fa)*fr, h*0.09, 0.10, f%2?c:shade(c,0.08), 'leafy'); }
      BALL(q[0], y+h*0.90, q[1], h*0.10, shade(c,-0.12), 'leafy'); }
    else if(kind==='shrub'){ BLOB(q[0], y-0.10, q[1], h, h*0.72, F.rnd()*TAU, F.pick(PAL.shrub), 'leafy'); }
    else { c=F.pick(PAL.cypress); R=h*0.095+0.35;                        /* cypress */
      CYL(q[0],y,q[1], 0.16+h*0.008, h*0.22, 0, PAL.trunk[1], 'bark');
      CONE(q[0], y+h*0.10, q[1], R, h*0.62, 0, c, 'leafy');
      CONE(q[0], y+h*0.40, q[1], R*0.78, h*0.60, 0, shade(c,0.06), 'leafy'); } };
  /* a door: dark reveal, plank leaf, optional parabolic head; registers the door point for the future life layer */
  F.door=function(lx,lz, nlx,nlz, w,h, col, ly){ var q=F.p(lx,lz), n=F.dir(nlx,nlz), a=Math.atan2(n[0],n[1]), y0=F.y+(ly||0);   /* ly: sill height, for doors up on a plinth */
    BOX(q[0]-n[0]*0.12, y0, q[1]-n[1]*0.12, w+0.3, h+0.2, 0.34, a, VOIDC[1], 'dark'); BOX(q[0]+n[0]*0.04, y0, q[1]+n[1]*0.04, w, h, 0.10, a, col!=null?col:PLANKC[3], 'plank');
    (F.doors||(F.doors=[])).push([q[0]+n[0]*0.9, y0, q[1]+n[1]*0.9]); };
  /* toron: the projecting timber posts of Sahelian walls — rows of them on a wall plane */
  F.toron=function(lx,ly,lz, nlx,nlz, len, r0){ var q=F.p(lx,lz), n=F.dir(nlx,nlz); ROD(q[0]-n[0]*0.3,F.y+ly,q[1]-n[1]*0.3, q[0]+n[0]*(len||1.1),F.y+ly-0.05,q[1]+n[1]*(len||1.1), r0||0.09, TORONC[0], 'timber'); };
  return F;
}
/* build one instance; returns its record (name, footprint, door points) and registers it with the inspector */
function buildAsset(key, x,z,ry, opt){
  var A=ASSET_BY_KEY[key]; if(!A){ ERR('no such asset: '+key); return null; }
  opt=opt||{}; var F=assetFrame(x,z,ry,opt); F.asset=A;
  try{ A.build(F); }catch(e){ ERR('asset '+key+': '+(e&&e.stack||e)); }
  var nm = A.name + (A.variantNames ? ' — '+A.variantNames[F.variant%A.variantNames.length] : (A.variants>1 ? ' · variant '+'ABCDEFGH'[F.variant%8] : ''));
  REGISTER({ name:nm, kind:'asset', label:'building · '+(A.culture ? assetTags(A)+' · ' : A.family+' · ')+A.w+' x '+A.d+' m · key '+A.key, x:x, y:F.y-1, z:z, r:Math.hypot(A.w,A.d)/2, h:(A.h||8)+3 });
  return { key:key, name:nm, x:x, z:z, ry:ry, w:A.w, d:A.d, doors:F.doors||[] };
}

/* build one furniture piece or one plant anywhere in the world, through the same frame.
   `reg` is FURN_BY_KEY or PLANT_BY_KEY; both catalogues and any interior pass use these. */
function buildFrom(reg, what, key, x,z,ry, opt){
  var A=reg[key]; if(!A){ ERR('no such '+what+': '+key); return null; }
  opt=opt||{}; var F=assetFrame(x,z,ry,opt); F.asset=A;
  try{ A.build(F); }catch(e){ ERR(what+' '+key+': '+(e&&e.stack||e)); }
  var nm = A.name + (A.variantNames ? ' — '+A.variantNames[F.variant%A.variantNames.length] : (A.variants>1 ? ' · variant '+'ABCDEFGH'[F.variant%8] : ''));
  var tag = A.culture ? ('furniture · culture: '+A.culture+' · '+A.room+(A.place?' · '+A.place:'')) : ('flora · '+plantTags(A));
  REGISTER({ name:nm, kind:what, label:tag+' · '+A.w+' x '+A.d+' m · key '+A.key, x:x, y:F.y-0.2, z:z, r:Math.hypot(A.w,A.d)/2+0.4, h:(A.h||2)+0.6 });
  return { key:key, name:nm, x:x, z:z, ry:ry, w:A.w, d:A.d };
}
function buildFurn(key,x,z,ry,opt){ return buildFrom(FURN_BY_KEY,'furniture',key,x,z,ry,opt); }
function buildPlant(key,x,z,ry,opt){ return buildFrom(PLANT_BY_KEY,'plant',key,x,z,ry,opt); }
