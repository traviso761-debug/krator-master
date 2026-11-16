// prefix: wk
// ================================================================= WALK RECORDS: round walls (this kit's one addition to core/engine/37-wk-rec.js)
// The walk records are core/engine's 37-wk-rec.js (read in place since wave 2, 2026-11-16: this kit's src/ copy of it, from
// kits/lizardmen, shadowed the engine's and differed only by this function). It runs after that file (filename order) and
// uses its frame (CM), its current record (CURREC) and its scratch vector (_wkV).
/* a round wall (a sector of a ring about (cx, cz), radii r0 < r1, angles a0..a1 local, y0..y1) as blocks: one small box per
   ~0.7 m of arc, in the current frame (the corbelled cairn house, the egg store, the beehive cells, a blackhouse's corners) */
function wkRing(cx,cz,r0,r1,a0,a1,y0,y1){
 if(PLACE_DRY||typeof KWALK==='undefined'||!CURREC||CURREC.cls!=='building')return;
 const n=Math.max(2,Math.ceil(Math.abs(a1-a0)*r1/.7));for(let i=0;i<n;i++){const a=a0+(a1-a0)*(i+.5)/n,rm=(r0+r1)/2,hw=Math.max(.25,(r1-r0)/2);
  _wkV.set(cx+Math.cos(a)*rm,y0,cz+Math.sin(a)*rm).applyMatrix4(CM);const y=_wkV.y;KWALK.block([_wkV.x-hw,_wkV.x+hw,_wkV.z-hw,_wkV.z+hw,y,y+(y1-y0)],'ring:'+CURKEY);}}
