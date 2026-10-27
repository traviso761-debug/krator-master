// TARGET: span — Span's own pieces (8as0-span-parts.js), each at every state, for settlements/span (PLAN.md SP2).
// Rows along z, one per piece; along x the states: intact west (-s), ruined east (+s), toppled (t), rehabilitated at
// x = 0, worn (w). The rock each stands on or against is a stand-in (the biome kit carves the real canyon): the gallery
// against a wall, the range on a 40 m rim, the Cross over a 300 m gap 110 m deep, the portal in a cliff.
const TITLE='Span — the arcology\'s pieces';
const GROUND_C=1100;
const DECAYS=[0,1,2,3,5];
const ROWS={
 spGal:{z:0,s:280,t:560,w:840,r:120},
 spRange:{z:300,s:280,t:560,w:840,r:120},
 spDome:{z:600,s:170,t:340,w:510,r:60},
 spPad:{z:800,s:170,t:340,w:510,r:50},
 spCross:{z:1300,s:300,t:600,w:900,r:260},
 spWeir:{z:1720,s:300,t:600,w:900,r:130},
 spSluice:{z:1960,s:300,t:600,w:900,r:150},
 spPortal:{z:2260,s:220,t:440,w:660,r:90},
};
const RUINS=Object.values(ROWS).flatMap(r=>[[-r.s,r.z,r.r],[r.s,r.z,r.r],[r.t,r.z,r.r],[0,r.z,r.r],[r.w,r.z,r.r]]);
const EXTRA_BUILDERS={
 spGal:(s,x,z,d)=>buildSpanGallery(s,x-80,z,d,{L:160,stage:true}),
 spRange:(s,x,z,d)=>buildSpanRange(s,x-80,z,d,{L:160,y:40,fall:40,stage:true}),
 spDome:(s,x,z,d)=>buildSpanDome(s,x,z,d,{R:28}),
 spPad:(s,x,z,d)=>buildSpanPad(s,x,z,d,{R:32,h:8}),
 spCross:(s,x,z,d)=>buildSpanCross(s,x,z,d,{y:110,stage:true}),
 spWeir:(s,x,z,d)=>buildSpanWeir(s,x,z,d,{L:180,h:10,stage:true}),
 spSluice:(s,x,z,d)=>buildSpanWeir(s,x,z,d,{L:120,h:16,bays:6,steps:4,drop:17.5,run:36,y:60,stage:true,id:'sluice'}),
 spPortal:(s,x,z,d)=>buildSpanPortal(s,x,z,d,{stage:true,lit:d===3}),
};
