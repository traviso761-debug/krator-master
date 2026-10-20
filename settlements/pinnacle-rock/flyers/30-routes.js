/* ============================== PINNACLE ROCK — the flyers' obstacles and roost bays ==============================
   In place of Girder's 84a "obstacles" and "roost bays" sections (Girder's towers are boxes; here the obstacles are
   the rock and what is built on it). The rest of Girder's 84a (paths, flyCurveHit, flyCurveTight, the arrival and
   departure builders, flyRoute, the meshes) is read in place after this file and works on these.
   flyHit(x,y,z, mT,mP,mB, skipTower, block) -> 0 clear | 1 trunk | 2 rock or a structure | 3 bridge | 4 crown | (5 ground: the callers')
     the rock: any stack, mesa or spur standing within mP of the point (its own stack, skipTower, within .6 m only:
       flyBayClear judges a bay's own deck); the decks and their stalls (a band from 2 m under a deck to 8.5 m over it,
       their outer edge plus mP/3); the lifts' booms, king posts and cables; the bridges (as Girder's); the necanyons
       kit's trees on the rock (trunks and crowns, hashed). block widens the rock's margin by 6 m for the cruise legs. */
var FLY_CELL = 32, flyHash = {}, flyBr = [], flyPathStatsFol = 0, flyTopY = 270, flyTwTop = 0;
var FLY_DECKS = ROOST.decks, FLY_LIFTS = ROOST.lifts, FLY_BLOCK = 0, FLY_TWBOX = 0, FLY_TWCAP = 8.5;
(function(){
  function put(x, y, z, r){
    var R = r + 8, i0 = Math.floor((x-R)/FLY_CELL), i1 = Math.floor((x+R)/FLY_CELL), j0 = Math.floor((z-R)/FLY_CELL), j1 = Math.floor((z+R)/FLY_CELL);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){ var k = i*8192+j; (flyHash[k] || (flyHash[k] = [])).push(x, y, z, r); }
  }
  /* the trees on the rock: a trunk sphere every 6 m up it, the crown one sphere */
  (typeof NECANYONS !== 'undefined' && NECANYONS.TREES || []).forEach(function(T){
    if(!(T.H > 6)) return; var cr = T.crownR || T.H*.3;
    put(T.x, T.y0 + T.H - cr*.6, T.z, cr*.8); flyPathStatsFol++; });
  BRIDGES.forEach(function(br){ flyBr.push({ br:br, x0:Math.min(br.a.x,br.b.x), x1:Math.max(br.a.x,br.b.x), z0:Math.min(br.a.z,br.b.z), z1:Math.max(br.a.z,br.b.z),
    y0:Math.min(br.a.y,br.b.y)-br.sag-1, y1:Math.max(br.a.y,br.b.y)+3 }); });
})();
var _flyDirs = [[1,0],[0,1],[-1,0],[0,-1],[.707,.707],[-.707,.707],[.707,-.707],[-.707,-.707]];
function flyRockHit(x, y, z, m, skip){
  for(var i=0;i<ROCK.length;i++){ var B = ROCK[i], mm = B === skip ? .6 : m;
    if(y > B.top + mm || Math.abs(x-B.x) > B.R+mm || Math.abs(z-B.z) > B.R+mm) continue;
    if(KSTACKS.topAt([B], x, z) > y - mm) return true;
    if(mm > 1) for(var k=0;k<8;k++){ var d = _flyDirs[k]; if(KSTACKS.topAt([B], x+d[0]*mm, z+d[1]*mm) > y - 2) return true; } }
  return false;
}
function flyHit(x, y, z, mT, mP, mB, skipTower, block){
  var i;
  if(flyRockHit(x, y, z, block ? mP+6 : mP, skipTower)) return 2;
  for(i=0;i<FLY_DECKS.length;i++){ var D = FLY_DECKS[i];
    if(skipTower && D.stack === skipTower.id) continue;
    var top = D.level === 'stall' ? 8.5 : 3.2;
    if(y < D.y-2-mB*.3 || y > D.y+top+mB*.3) continue;
    if(Math.hypot(x-D.x, z-D.z) < D.R + 3.4 + mP/3) return 2; }
  for(i=0;i<FLY_LIFTS.length;i++){ var L = FLY_LIFTS[i], m = 3+mP/3;
    if(y > L.root.y-4 && y < L.tip.y+12 && segDist(x, z, L.root.x, L.root.z, L.tip.x, L.tip.z) < m) return 2;
    if(y > L.foot.y && y < L.tip.y && Math.hypot(x-L.tip.x, z-L.tip.z) < m) return 2; }
  for(i=0;i<flyBr.length;i++){ var b = flyBr[i];
    if(x < b.x0-8 || x > b.x1+8 || z < b.z0-8 || z > b.z1+8 || y < b.y0-mB || y > b.y1+mB) continue;
    var br = b.br, ex = br.b.x-br.a.x, ez = br.b.z-br.a.z, t = clamp(((x-br.a.x)*ex+(z-br.a.z)*ez)/(ex*ex+ez*ez), 0, 1);
    if(Math.hypot(x-br.a.x-ex*t, z-br.a.z-ez*t) < br.w*0.5+4 && Math.abs(y-bridgeY(br, t)-1) < mB) return 3; }
  var cell = flyHash[Math.floor(x/FLY_CELL)*8192+Math.floor(z/FLY_CELL)];
  if(cell) for(i=0;i<cell.length;i+=4){ var ax = x-cell[i], ay = y-cell[i+1], az = z-cell[i+2], rr2 = cell[i+3]+mT*.5;
    if(ax*ax+ay*ay+az*az < rr2*rr2) return 4; }
  return 0;
}
/* a straight cruise leg a->b: sampled every 8 m against everything (block mode), the ground and the forest's roof */
function flyLineHit(ax, ay, az, bx, by, bz, mT, mP, halfW){
  var L = Math.hypot(bx-ax, bz-az), n = Math.max(1, Math.ceil(L/8));
  halfW = halfW || 0;
  for(var i=0;i<=n;i++){ var t = i/n, x = mix(ax,bx,t), z = mix(az,bz,t), y = mix(ay,by,t);
    if(Math.abs(x) < 1700 && Math.abs(z) < 1700){ var h = flyHit(x, y, z, mT+halfW, mP+halfW, 5, null, true); if(h) return h; }
    if(i%4 === 0 && y < terrainH(x, z)+28) return 5; }
  return 0;
}

/* ------------------------------------------------------------------ roost bays
   Girder's bay record over each stall (84a, "roost bays"): every stall here faces outward from its deck's edge
   ('outer'); its tower is its stack. Coordinates about a bay: e outward from the perch point, q along the edge. */
var FLY_E_TOUCH = 3.0, FLY_E_LIP = 2.6, FLY_E_PERCH = -3.5, FLY_E_HANG = -3.0, FLY_BEAM_TOP = 0.48;
var flyBays = [];
ROOSTS.forEach(function(R0){
  var P = R0.plat;
  flyBays.push({ id:R0.id, roost:R0, plat:P, tower:P.body, deck:P.deck, px:R0.x, y:R0.y, pz:R0.z, ox:R0.ox, oz:R0.oz, H:R0.H, w:R0.w, kind:'outer',
    ok:true, occ:null, reserved:false, ux:0, uz:0, a:0, lB:0 });
});
/* is a flight point acceptable next to its OWN deck? Over or under the deck only inside this stall's mouth; under the
   eave nowhere outside it; never in its own rock */
function flyBayClear(B, x, y, z){
  var D = B.deck;
  if(y > D.y+9) return !flyRockHit(x, y, z, .6, null);
  if(KSTACKS.topAt([B.tower], x, z) > y-1) return false;
  var e = (x-B.px)*B.ox+(z-B.pz)*B.oz, q = -(x-B.px)*B.oz+(z-B.pz)*B.ox;
  var a = Math.atan2(z-D.z, x-D.x), i = Math.round(((a/TAU*PRR.N)%PRR.N+PRR.N)%PRR.N)%PRR.N, ro = Math.hypot(D.outer[i][0]-D.x, D.outer[i][1]-D.z);
  if(Math.hypot(x-D.x, z-D.z) < ro+.4 && y > D.y-2.5)                  /* over/under the deck: only inside this stall's mouth */
    return Math.abs(q) < B.w*0.5-0.7 && e > -5 && y > B.y+0.6 && y < B.y+5.4+0.18*Math.max(0, -e) && y < B.y+6.4;
  if(e < 2.8 && Math.abs(q) < B.w*0.5+1 && y > B.y+4.9 && y < B.y+9) return false;      /* the eave */
  return true;
}
