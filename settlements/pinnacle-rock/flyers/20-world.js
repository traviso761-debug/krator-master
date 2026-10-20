/* ============================== PINNACLE ROCK — the flyers' world, in Girder's record shapes ==============================
   What Girder's flyer code reads from Girder's layout (settlements/girder/API.md), made from this page's roost plan
   (ROOST, 89-host-roosts.js on PRR, 43-pr-roosts.js):
     PLATS    the stall decks {name, kind:'roostdeck', id, stack, x, z, y, R}  (ROOSTS' .plat points at one)
     ROOSTS   the stalls {id, plat, x, y, z (the perch point), ox, oz, ang, H, w}
     BRIDGES  {id, a:{x,y,z}, b:{x,y,z}, L, w, sag}; bridgeY(br, t)
     RIVER_LEN, riverAt(s), riverLevel(s)   Girder's brook, here the dry gorge under the north rim (low runs go along it)
     terrainH(x, z)   the page's ground (the rock's tops included) plus the forest's roof where the forest stands
     skyHour()        the host's world hour */
var PLATS = ROOST.decks.filter(function(D){ return D.level === 'stall'; }).map(function(D){
  var B = ROCK.find(function(S){ return S.id === D.stack; });
  return { name: (D.wing === 'garden' ? 'Garden roost on ' : 'the ' + D.wing + '\'s roost on ') + (B && B.name ? B.name.replace(/^A /, 'a ') : D.stack),
    kind:'roostdeck', id:D.id, stack:D.stack, body:B, deck:D, x:D.x, z:D.z, y:D.y, R:D.R, wing:D.wing, group:D.group };
});
var ROOSTS = ROOST.roosts.map(function(R){
  var P = PLATS.find(function(p){ return p.id === R.plat; });
  return { id:R.id, plat:P, x:R.x, y:R.y, z:R.z, ox:R.ox, oz:R.oz, ang:R.ang, H:R.H, w:R.w, fx:R.fx, fz:R.fz, side:R.side, wing:R.wing };
}).filter(function(R){ return !!R.plat; });
var BRIDGES = ROOST.bridges;
function bridgeY(br, t){ return PRR.bridgeY(br, t); }
/* the dry gorge as Girder's brook: its line west to east, its floor */
var RIVER_LEN = PR.GORGE.x1 - PR.GORGE.x0;
function riverAt(s){ var x = PR.GORGE.x0 + clamp(s, 0, RIVER_LEN); return { x:x, z:PR.GORGE.z(x) }; }
function riverLevel(s){ var p = riverAt(s); return pageTerrainH(p.x, p.z); }
/* the forest's roof: the hyperjungle's crowns stand 150-270 m on the knoll (PLAN.md section 1); off the rock the flyers
   keep over it where the forest stands (PR.forest: none in the farms and the grounds, a remnant on the cleared ground) */
var FLY_CANOPY = 235;
function terrainH(x, z){ var t = pageTerrainH(x, z); if(KSTACKS.at(ROCK, x, z)) return t; return t + FLY_CANOPY*PR.forest(x, z); }
function skyHour(){ var C = window.KHOST && KHOST.clock; return C && C.hour != null ? C.hour : 12; }
