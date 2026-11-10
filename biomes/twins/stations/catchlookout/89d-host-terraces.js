// ================================================================= HOST — the soaking basins (station 6): core/water's terraces
// The Lookout Spring's water stepping east down the bench (45b: TER, its treads and levels fixed before the bake, the ground cut to hold
// them): WATER.terraces (core/water/ext 53) drawn by 53b, the pools warm and milky blue at the head, cooling and creamier down the steps,
// thin curtains down each travertine dam. Registered first (core/tags), a scald hazard only on the head pool (the spring's own: 89c).
const TER_DRAW=(function(){if(typeof WATER==='undefined'||!WATER.terraces)return null;
 REGISTER({name:TER.name,x:TER.line[Math.floor(TER.line.length/2)][0],z:TER.line[Math.floor(TER.line.length/2)][1],y:TER.levels[TER.n-1]-2,r:TER.total/2+8,h:TER.y0-TER.levels[TER.n-1]+4,kind:'feature',
  tags:{route:'B',use:['bath','water (the skins refilled)']}});
 const lin=c=>new THREE.Color(c).convertSRGBToLinear().getHex();
 try{const T=WATER.terraces({name:TER.name,line:TER.line,treads:TER.treads.map(t=>({s0:t.s0,s1:t.s1,y:t.y,w:t.w-.6})),speed:.6,spread:1.2});
  const D=WATER.drawTerraces(T,{pool:{color:0xffffff,roughness:.06,metalness:.05,envMapIntensity:.5,renderOrder:1,gradient:{centre:lin(0x6ab8c4),rim:lin(0xe8e4d4),power:1.3}},
   fall:{color:lin(0xeef2ee),opacity:.75,rowStep:1,cols:6,spray:false,plungeR:2,renderOrder:3}});
  twinsWater({terraces:T.pools.length,terraceFalls:T.falls.length});   /* 89c */return{T,D};}
 catch(e){reportErr('terraces: '+e.stack);return null;}})();
