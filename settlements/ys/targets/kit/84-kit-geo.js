// TARGET: kit — the ground: a flat shelf of land at +3.2 m, the sea to the south (z > 30) and the east (x > 430) where
// the grown-on rows' hosts stand sunk in nine metres of water.
function YS_NAT(x,z){const tz=clamp((z-30)/40,0,1),tx=clamp((x-430)/60,0,1);const s=Math.max(tz*tz*(3-2*tz),tx*tx*(3-2*tx));
 const land=3.2+(fbm(x/300,z/300,2.1,2)-.5)*.6;return land+(-9-land)*s;}
