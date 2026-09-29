/* ============================== 19b. THE FURNITURE + PLANT CATALOGUES ==============================
   PLANNER-OWNED. Runs only when TARGET is 'furn' or 'flora'. Lays out every registered
   FURN() piece (grouped by culture) or PLANT() species (grouped by climate) on flat ground,
   with a 1.75 m figure beside each for scale, and re-uses the sheet's own label/step UI by
   filling SHEET_ITEMS / SHEET_ROWS.                                                        */
reseed(700051);
(function(){
  if(!CATALOG) return;
  var isF = CATALOG==='furn';
  var list0 = isF ? FURNS : PLANTS;
  var groups = isF ? FURN_CULTURES : PLANT_CLIMATES;
  var GNAME = isF
    ? { 'ancient':'Ancient (as the Ancients made it)', 'ancients-salvage':'Salvaged Ancient parts, re-made', 'yuni-court':'Yuni court — Emir, oligarchs, high houses', 'yuni-common':'Yuni common — townhouse and terrace', 'yuni-poor':'Yuni poor — mud, thatch and reed', 'sahelian':'Sahelian / neo-African', 'order':'The Order of Historians', 'nomad':'Caravan and nomad' }
    : { hypertropic:'Hypertropic', tropic:'Tropic', temperate:'Temperate', cold:'Cold' };
  var key = isF ? 'culture' : 'climate';
  var MARGIN = isF ? 2.2 : 6.0, GAP = isF ? 5.0 : 14.0;

  var z = -CITY_EXT + (isF ? 40 : 90), LIM = CITY_EXT - (isF ? 60 : 110);
  groups.forEach(function(g){
    var list = list0.filter(function(A){ return A[key]===g; }); if(!list.length) return;
    var x=-LIM, rowD=0, row={ fam:g, name:GNAME[g]||g, z0:z, items:[] }; SHEET_ROWS.push(row);
    list.forEach(function(A){ for(var v=0; v<A.variants; v++){
      var cw=A.w+MARGIN*2, cd=A.d+MARGIN*2; if(x+cw > LIM){ x=-LIM; z+=rowD; rowD=0; }
      var cx=x+cw/2, cz=z+cd/2; rowD=Math.max(rowD,cd);
      var rec=buildFrom(isF?FURN_BY_KEY:PLANT_BY_KEY, isF?'furniture':'plant', A.key, cx, cz, Math.PI,
                        { variant:v, seed:2000+SHEET_ITEMS.length*11, y:0 });
      var fx=cx+A.w/2+(isF?0.9:2.2), fz=cz-A.d/2-(isF?0.9:2.2);
      CYL(fx,0,fz,0.22,1.45,0,PAL.people.garb[v%8],'cloth'); BALL(fx,1.60,fz,0.15,PAL.people.skin[1],'cloth');
      SHEET_ITEMS.push({ key:A.key, name:rec?rec.name:A.name, x:cx, z:cz, w:A.w, d:A.d, h:A.h||2, fam:g });
      row.items.push(SHEET_ITEMS[SHEET_ITEMS.length-1]);
      x+=cw; } });
    z += rowD + GAP; row.z1=z;
  });
  window._catalog = { kind:CATALOG, groups:SHEET_ROWS.map(function(r){ return r.fam+':'+r.items.length; }), items:SHEET_ITEMS.length };
  window._sheet = { assets:list0.length, items:SHEET_ITEMS.length, rows:window._catalog.groups };

  /* the ground: a 1 m grid for furniture, 5 m for plants, with each footprint outlined */
  var gc=GROUND_CANVAS.getContext('2d'), S=GC_RES/(2*CITY_EXT), STEP=isF?1:5;
  gc.save(); gc.scale(S,S); gc.translate(CITY_EXT,CITY_EXT);
  gc.fillStyle = isF ? '#c2b295' : '#a8a074'; gc.fillRect(-CITY_EXT,-CITY_EXT,2*CITY_EXT,2*CITY_EXT);
  gc.strokeStyle='rgba(90,70,40,0.30)'; gc.lineWidth=0.06; gc.beginPath();
  for(var k=-CITY_EXT;k<=CITY_EXT;k+=STEP){ gc.moveTo(k,-CITY_EXT); gc.lineTo(k,CITY_EXT); gc.moveTo(-CITY_EXT,k); gc.lineTo(CITY_EXT,k); }
  gc.stroke();
  SHEET_ROWS.forEach(function(r,i){ gc.fillStyle=i%2?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.07)'; gc.fillRect(-CITY_EXT, r.z0-MARGIN, 2*CITY_EXT, r.z1-r.z0-GAP+MARGIN); });
  SHEET_ITEMS.forEach(function(it){ gc.fillStyle='rgba(214,203,176,0.9)'; gc.fillRect(it.x-it.w/2-0.4, it.z-it.d/2-0.4, it.w+0.8, it.d+0.8);
    gc.strokeStyle='rgba(40,60,110,0.8)'; gc.lineWidth=0.09; gc.strokeRect(it.x-it.w/2, it.z-it.d/2, it.w, it.d);
    gc.fillStyle='rgba(40,60,110,0.9)'; gc.fillRect(it.x-0.16, it.z-it.d/2-0.34, 0.32, 0.34); });
  gc.restore();
})();
