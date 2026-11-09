/* ============================== KIT SHEET: THE LAYOUT ==============================
   Every ASSET the kit declares, each variant, laid out unplaced on flat ground in rows, fronts facing north (-z, into the
   sun) as on the town's sheet (settlements/yuni/src/70-sheet.js, settlements/locus/src/70-sheet.js, which this follows),
   with a 1.75 m figure for scale; then any FURN pieces the kit registers (Yuni's: the Order's library and school furniture,
   59c), in a row of their own. Every piece is built by the engine (53-assets.js buildAsset / buildFurn), so it registers
   itself: the building in core/tags (Yuni's 51-fixtures.js FIX; Locus's 45-kit.js REGISTER), its doors as KDOOR records
   (45-kit.js yopenDoor), the furniture in core/tags. The rows are narrower than the towns' (YS_LIM): a walk, not a city.
   Which kit, and its rows, come from the build (06-ys-config.js, generated):
     YS_SUBKIT null: the assets with no `kit` field, in rows by `family` (YS_FAM_ORDER, YS_FAM_NAME): the Yuni kit
               'locus' | 'abyss': that sub-kit's assets (Locus's fork: assetInKit), in rows by their group, ordered as
               KIT_ROWS[sub-kit] says (as Locus's 70-sheet.js)                                                          */
reseed(701001);
var SHEET_ITEMS = [], SHEET_ROWS = [];
var YS_MINE = ASSETS.filter(function(A){ return YS_SUBKIT ? assetInKit(A, YS_SUBKIT) : !A.kit; });   /* the kit's assets */
(function(){
  var mine = YS_MINE;
  var groupOf = function(A){ return YS_SUBKIT ? assetGroup(A, YS_SUBKIT) : A.family; };
  var order = YS_FAM_ORDER.slice();
  mine.forEach(function(A){ var g = groupOf(A); if(order.indexOf(g) < 0) order.push(g); });
  var RO = YS_SUBKIT && typeof KIT_ROWS !== 'undefined' ? KIT_ROWS[YS_SUBKIT] : null;
  if(RO){ var o0 = order.slice(); order.sort(function(a, b){ var ia = RO.indexOf(a), ib = RO.indexOf(b); if(ia < 0) ia = 1e3+o0.indexOf(a); if(ib < 0) ib = 1e3+o0.indexOf(b); return ia-ib; }); }
  var z = 0;
  function row(fam, list, gap, build){
    if(!list.length) return;
    var x = -YS_LIM, rowD = 0, R = { fam:fam, name:YS_FAM_NAME[fam] || fam, z0:z, items:[] }; SHEET_ROWS.push(R);
    list.forEach(function(A){ for(var v=0; v<A.variants; v++){
      var cw = A.w+gap, cd = A.d+gap; if(x+cw > YS_LIM){ x = -YS_LIM; z += rowD; rowD = 0; }
      var cx = x+cw/2, cz = z+cd/2; rowD = Math.max(rowD, cd);
      var rec = build(A, v, cx, cz);
      var it = { key:A.key, name:rec ? rec.name : A.name, x:cx, z:cz, w:A.w, d:A.d, h:A.h || 8, fam:fam, variant:v, bid:rec && rec.bid };
      SHEET_ITEMS.push(it); R.items.push(it);
      x += cw; } });
    z += rowD + (gap > 6 ? 26 : 8); R.z1 = z;
  }
  order.forEach(function(fam){
    row(fam, mine.filter(function(A){ return groupOf(A) === fam; }), 16, function(A, v, cx, cz){
      var rec = buildAsset(A.key, cx, cz, Math.PI, { variant:v, seed:1000+SHEET_ITEMS.length*7, y:0,   /* fronts face NORTH, into the sun */
        wealth: mix(A.wealth ? A.wealth[0] : 0.3, A.wealth ? A.wealth[1] : 0.7, A.variants > 1 ? v/(A.variants-1) : 0.6) });
      var fx = cx+A.w/2+1.5, fz = cz-A.d/2-1.5;   /* the scale figure, 1.75 m, front-left of the footprint */
      CYL(fx, 0, fz, 0.22, 1.45, 0, PAL.people.garb[v%8], 'cloth'); BALL(fx, 1.60, fz, 0.15, PAL.people.skin[1], 'cloth');
      return rec; });
  });
  row('furn', FURNS, 3, function(A, v, cx, cz){ return buildFurn(A.key, cx, cz, Math.PI, { variant:v, seed:2000+SHEET_ITEMS.length*7, y:0 }); });
  window._sheet = { kit:YS_KIT, assets:mine.length, furniture:FURNS.length, items:SHEET_ITEMS.length, rows:SHEET_ROWS.map(function(r){ return r.fam+':'+r.items.length; }) };
})();
var YS_EXT = { x0:-YS_LIM-30, x1:YS_LIM+30, z0:-40, z1:(SHEET_ROWS.length ? SHEET_ROWS[SHEET_ROWS.length-1].z1 : 0)+30 };
