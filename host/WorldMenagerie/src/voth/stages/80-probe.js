/* ==== 20. PROBE ==== */

window._api = {
  /* --- fields: the geometric contract every pass is clipped against --- */
  terrainH   : terrainH,       /* (x,z) -> ground height; y=0 is the lake  */
  landDist   : landDist,       /* (x,z) -> signed dist to waterline, >0 inland */
  waterSDF   : waterSDF,
  riverHalf  : riverHalf,      /* (x,z) -> half-width of the WATER, not the channel */
  inRiver    : inRiver,        /* (x,z,margin) -> bool                     */
  zoneAt     : zoneAt,         /* (x,z) -> core|warren|estate|manor|farm|shorehut|orchard|none */
  farmFade   : farmFade,
  insideWall : insideWall,
  wallDepth  : wallDepth,
  maskAt     : maskAt,
  openAt     : openAt,

  /* --- the shore, addressed by arc length --- */
  shoreAt    : shoreAt, shoreNorm: shoreNorm, shoreIn: shoreIn,
  shoreS     : shoreS,  shoreRY  : shoreRY,   bayS   : bayS,

  /* --- named constants and layout, READ ONLY --- */
  k : {
    SEA:SEA, WORLD:WORLD, CITY_EXT:CITY_EXT, CITY_LIM:CITY_LIM, SLEN:SLEN,
    S_5:S_5, S_7:S_7, S_10:S_10,
    CITY_S0:CITY_S0, CITY_S1:CITY_S1, WALL_S0:WALL_S0,
    PORT_S:PORT_S, HARB_S0:HARB_S0, HARB_S1:HARB_S1, HARB_S:HARB_S,
    DECK:DECK, CWAY:CWAY, SEED:SEED
  },
  RIVER    : RIVER,
  RIVERC   : RIVERC,
  nearestStreet : nearestStreet,   /* (x,z) -> {dist,point,tangent,cls,width} against the road graph */
  CANTONS  : CANTONS.map(function(c){ return {n:c.n,x:c.x,z:c.z,r:c.r,s:c.s,port:!!c.port}; }),
  ISLES    : ISLES,
  PIERS    : PIERS,
  RPIERS   : RPIERS,
  RBRIDGES : RBRIDGES,

  RBARGE_DOCKS : (typeof LIFE_RBARGE_DOCKS !== 'undefined' ? LIFE_RBARGE_DOCKS.map(function(d){ return {x:d.x, z:d.z}; }) : []),
  SPANS    : SPANS.map(function(sp){ var A=CANTONS[sp.a],B=CANTONS[sp.b];
                return {ax:A.x,az:A.z,bx:B.x,bz:B.z}; }),
  GATES    : GATES,
  FARMS    : FARMS.map(function(f){ return [f.x, f.z]; }),
  MANORS   : MANORS.map(function(m){ return [m.x, m.z]; }),

  SILHOUETTE_SHRINES : (typeof SILHOUETTE_SHRINES !== 'undefined' ? SILHOUETTE_SHRINES.slice() : []),

  QUARRY_EXEMPT : (typeof QUARRY_EXEMPT !== 'undefined' ? QUARRY_EXEMPT.slice() : []),
  ROADS    : ROADS.map(function(r){ return {pts:r.pts, w:r.w, cls:r.cls}; }),
  PLACED   : PLACED.map(function(o){ return {x:o.x,z:o.z,fx:o.fx,fz:o.fz,ry:o.ry,tag:o.tag}; }),

  /* --- budgets and palette, so the verifier checks against the same numbers --- */
  BUDGET : BUDGET,
  PAL    : PAL,
  CHINP  : CHINP
};

window._api.k.CROSS_CLEAR = 11;

window._api.groundTone = groundTone;               /* (x,z) -> [r,g,b] 0..255, the one true colour */
window._api.clothTime  = CLOTH_TIME;                /* {value} — live, advanced by the render loop; */
                                                     /* a rising value proves the wind-sway clock runs */
window._placedCheck = PLACED.filter(function(o){ return o.tag==='town' || o.tag==='compound'; })
  .map(function(o){ return {x:o.x,z:o.z,fx:o.fx,fz:o.fz,ry:o.ry,tag:o.tag,zn:zoneAt(o.x,o.z)}; });
window._api.sampleCityCanvas = function(x,z){       /* the canvas pixel actually painted at (x,z) */
  var i = Math.round(W2P(x,TEX)), j = Math.round(W2P(z,TEX));
  if(i<0||j<0||i>=TEX||j>=TEX) return null;
  var d = gx.getImageData(i,j,1,1).data;
  return [d[0],d[1],d[2]];
};

window._debugSetView = setView;
