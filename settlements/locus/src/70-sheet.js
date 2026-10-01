/* ============================== 19. THE INSPECTION SHEET ==============================
   PLANNER-OWNED. Only runs when TARGET === 'sheet'. Lays out every registered
   ASSET (each variant) on flat ground in family rows, unplaced, with a 1.75 m
   figure for scale, a name label and a preset view per family.               */
reseed(700001);
var SHEET_ITEMS = [], SHEET_ROWS = [];
(function(){
  if(!SHEET || CATALOG) return;
  var FAM_ORDER=['ancient','civic','rich','park','mid','trade','poor','prop'], FAM_NAME={ ancient:'Ancient (rehabilitated / ruined)', civic:'Civic & neo-African', rich:'Wealthy compounds', park:'Park pieces (Guell)', mid:'Middle-class houses', trade:'Shops, taverns, workshops, caravanserai', poor:'Poor quarters: mud & thatch', prop:'Street furniture' };
  if(KIT){ /* a sub-kit sheet: its own rows, in the order the kit's fragments declared them */
    FAM_ORDER=[]; FAM_NAME={}; ASSETS.forEach(function(A){ if(A.kit===KIT && FAM_ORDER.indexOf(A.group||'kit')<0){ FAM_ORDER.push(A.group||'kit'); FAM_NAME[A.group||'kit']=A.group||'kit'; } }); }
  var z=-CITY_EXT+(KIT?70:260), LIM=CITY_EXT-(KIT?70:420);
  FAM_ORDER.forEach(function(fam){
    var list=ASSETS.filter(function(A){ return KIT ? (A.kit===KIT && (A.group||'kit')===fam) : (!A.kit && A.family===fam); }); if(!list.length) return;
    var x=-LIM, rowD=0, row={ fam:fam, name:FAM_NAME[fam]||fam, z0:z, items:[] }; SHEET_ROWS.push(row);
    list.forEach(function(A){ for(var v=0; v<A.variants; v++){
      var cw=A.w+16, cd=A.d+16; if(x+cw > LIM){ x=-LIM; z+=rowD; rowD=0; }
      var cx=x+cw/2, cz=z+cd/2; rowD=Math.max(rowD,cd);
      var rec=buildAsset(A.key, cx, cz, Math.PI, {   /* fronts face NORTH, into the sun */ variant:v, seed:1000+SHEET_ITEMS.length*7, wealth: mix(A.wealth?A.wealth[0]:0.3, A.wealth?A.wealth[1]:0.7, A.variants>1? v/(A.variants-1):0.6), y:0 });
      /* the scale figure, 1.75 m, front-left of the footprint */
      var fx=cx+A.w/2+1.5, fz=cz-A.d/2-1.5; CYL(fx,0,fz,0.22,1.45,0,PAL.people.garb[v%8],'cloth'); BALL(fx,1.60,fz,0.15,PAL.people.skin[1],'cloth');
      SHEET_ITEMS.push({ key:A.key, name:rec?rec.name:A.name, x:cx, z:cz, w:A.w, d:A.d, h:A.h||8, fam:fam }); row.items.push(SHEET_ITEMS[SHEET_ITEMS.length-1]);
      x+=cw; } });
    z+=rowD+26; row.z1=z;
  });
  window._sheet = { assets:ASSETS.length, items:SHEET_ITEMS.length, rows:SHEET_ROWS.map(function(r){ return r.fam+':'+r.items.length; }) };
  /* the ground: a 10 m grid, footprints outlined, family bands */
  var g=GROUND_CANVAS.getContext('2d'), S=GC_RES/(2*CITY_EXT); g.save(); g.scale(S,S); g.translate(CITY_EXT,CITY_EXT);
  g.fillStyle= KIT==='locus' ? '#a9a98a' : '#b9a27a'; g.fillRect(-CITY_EXT,-CITY_EXT,2*CITY_EXT,2*CITY_EXT);   /* Locus: a marsh-edge tone */
  g.strokeStyle='rgba(90,70,40,0.35)'; g.lineWidth=0.35; g.beginPath(); for(var k=-CITY_EXT;k<=CITY_EXT;k+=10){ g.moveTo(k,-CITY_EXT); g.lineTo(k,CITY_EXT); g.moveTo(-CITY_EXT,k); g.lineTo(CITY_EXT,k); } g.stroke();
  SHEET_ROWS.forEach(function(r,i){ g.fillStyle=i%2?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.06)'; g.fillRect(-CITY_EXT, r.z0-8, 2*CITY_EXT, r.z1-r.z0-10); });
  SHEET_ITEMS.forEach(function(it){ g.fillStyle='rgba(205,191,159,0.9)'; g.fillRect(it.x-it.w/2-3, it.z-it.d/2-3, it.w+6, it.d+6); g.strokeStyle='rgba(40,60,110,0.8)'; g.lineWidth=0.5; g.strokeRect(it.x-it.w/2, it.z-it.d/2, it.w, it.d);
    g.fillStyle='rgba(40,60,110,0.9)'; g.fillRect(it.x-1.5, it.z-it.d/2-2.4, 3, 2.4); });   /* the blue tab marks the FRONT (+z) */
  g.restore();
})();
