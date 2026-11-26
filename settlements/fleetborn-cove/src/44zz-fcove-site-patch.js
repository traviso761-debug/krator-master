// ================================================================= FLEETBORN COVE — cove site reserve & cliff-weep placement  [G data]
// Runs right after biomes/arch/stations/cove/44z-host-site.js (read in place) and before 45-host-stage.js:
// 1. Re-seats ARCH_SITES.cove.arcoforte to the 576 m horseshoe + harbour reserve (FCOVE_LAYOUT.arcoforte).
// 2. Positions the 5 Type II (Ca-OH, pH > 11) travertine cliff weeps on the natural gorge walls flanking Arcoforte and the shipyard
//    so all 5 waterfalls drape untouched ophiolite cliffs with zero curtain-to-building intersection.
{
 const C=ARCH_SITES.cove;
 C.arcoforte={
  id:'site:fleetborn-arcoforte',
  s:FCOVE_LAYOUT.arcoforte.s0,
  du:244,
  r:320,
  clearR:315,
  span:576,
  elev:[55,95],
  footprint:FCOVE_LAYOUT.arcoforte.footprint
 };
 C.weeps=[
  {key:'w0',s:-665,side:1,du:90,r:9,flow:9.5,w:21},
  {key:'w1',s:-515,side:-1,du:86,r:10,flow:11.0,w:23},
  {key:'w2',s:-165,side:-1,du:92,r:11,flow:13.5,w:26},
  {key:'w3',s:225,side:-1,du:88,r:10,flow:10.0,w:22},
  {key:'w4',s:635,side:1,du:88,r:8,flow:7.0,w:18}
 ];
}
