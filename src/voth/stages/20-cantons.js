/* ==== 11. CANTONS ==== */
reseed(500001);

var CANTON_TOPS = {};

var GUILD_WORK_POSTS = [];
var GUILD_CLOCK = null;
var GUILD_MARKET_DOOR = null;

var GUILD_CLOCKS = [];
var GUILD_HALL_DOORS = [];
var DECK = 54;            /* every canton-to-canton span rides at this height */
var CWAY = 17;            /* bridge causeways to the shore are low and level */
var RLAND = 2.6;          /* reclaimed-land causeways: fill height, just above the waterline */

function tierWeights(n){
  var w=[], s=0;
  for(var i=0;i<n;i++){ var v = Math.pow(0.78, i) * (1 + 0.3*(i===0)); w.push(v); s+=v; }
  return w.map(function(v){ return v/s; });
}
function bedAt(x,z){ return Math.min(-6, terrainH(x,z)); }

function cantonApproachFaces(c){
  var idx = CANTONS.indexOf(c);
  var faces = {};
  SPANS.forEach(function(sp){
    var other = null;
    if(sp.a===idx) other = CANTONS[sp.b];
    else if(sp.b===idx) other = CANTONS[sp.a];
    if(!other) return;
    var ang = Math.atan2(other.x-c.x, other.z-c.z);
    var card = Math.round(ang/(Math.PI/2)) * (Math.PI/2);
    while(card > Math.PI) card -= Math.PI*2;
    while(card <= -Math.PI) card += Math.PI*2;
    faces[card.toFixed(3)] = card;
  });
  var out = Object.keys(faces).map(function(k){ return faces[k]; });
  return out.length ? out : [Math.PI/2, -Math.PI/2];
}

function squareEdgeHw(hw, angle){
  return hw / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
}

/* ==== where a canton's walkable levels actually ARE ==== */
var CANTON_FACES = {};

function faceHwAt(t, y){
  var f = Math.max(0, Math.min(1, (y - t.yb) / Math.max(0.001, t.th)));
  return t.hwb * (1 - 0.14*f);
}

function faceLean(t, angle){
  return (0.14 * t.hwb / Math.max(0.001, t.th)) /
         Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
}

function cantonFacesRecord(name, tone, plinthTop, capTopOff, baseOuter, tiers, capMul){
  if(!tiers.length) return;
  var L = [];
  for(var i=0;i<tiers.length;i++){
    var surf = (i===0) ? (plinthTop + capTopOff) : (tiers[i-1].yb + tiers[i-1].th + capTopOff);
    L.push({ y:surf, hw:faceHwAt(tiers[i], surf), outer:(i===0 ? baseOuter : tiers[i-1].hwb*capMul),
             tier:i, top:false });
  }
  var lt = tiers[tiers.length-1];
  L.push({ y: lt.yb + lt.th + capTopOff, hw: lt.hwb*0.86, outer: lt.hwb*capMul, tier:tiers.length, top:true });
  CANTON_FACES[name] = { levels:L, tiers:tiers, tone:tone };
}

function cantonArrivalLevel(name, y){
  var F = CANTON_FACES[name]; if(!F) return null;
  var L = F.levels, best = L[0], idx = 0;
  if(!F.spiral) for(var i=1;i<L.length;i++){ if(L[i].y <= y + 1.5){ best = L[i]; idx = i; } }
  return { y:best.y, hw:best.hw, outer:best.outer, tier:best.tier, top:!!best.top, idx:idx };
}

function bearingBeside(ang, off, rad){ return ang + off/Math.max(20, rad); }

function plinthDoor(cx,cz,angle,y,hw0,tone,opt){

  opt = opt || {};
  var dw = Math.min(6, hw0*0.10), dh = dw*2.1;
  if(opt.maxH && dh > opt.maxH){ dh = Math.max(3.2, opt.maxH); dw = Math.min(dw, dh/2.1); }
  if(opt.lean > 0){
    var pdep = Math.min(opt.lean*dh + 2.2, 14);
    var bp = loc(cx,cz, 0, hw0 + 0.2 - pdep*0.5, angle);
    BOX(bp[0], y-0.7, bp[1], dw+7.0, dh+2.6, pdep, angle, shade(tone,0.03));
  }
  var dp = loc(cx,cz, 0, hw0*1.001, angle);
  BOX(dp[0], y, dp[1], dw, dh, 1.4, angle, shade(tone,-0.55));
  [-1,1].forEach(function(s){
    var pp = loc(cx,cz, s*(dw*0.5+1.1), hw0*1.003, angle);
    BOX(pp[0], y-0.6, pp[1], 1.5, dh+1.6, 1.5, angle, shade(tone,0.10));
  });
  var lp = loc(cx,cz, 0, hw0*1.005, angle);
  BOX(lp[0], y+dh+0.6, lp[1], dw+3.4, 1.4, 1.8, angle, shade(tone,0.12));  /* lintel, spans past the pilasters */
  window._plinthDoors = window._plinthDoors || [];
  window._plinthDoors.push({x:dp[0], y:y, z:dp[1], angle:angle, hw0:hw0});
}

var STAIR_RISE = 0.35;

/* a broad flight of steps running down a face to the water */
function seaStair(x, z, ry, width, yTop, yBot){
  var n = Math.max(4, Math.round((yTop-yBot)/STAIR_RISE));
  var run = (yTop-yBot)*1.9;
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n;
    var p = loc(x,z, 0, run*t, ry);
    BOX(p[0], yBot, p[1], width*(1-0.10*t), mix(yTop,yBot,t)-yBot, run/n*1.35, ry, 0xa79b82);
  }
}

function linkStair(ax,az,ay, bx,bz,by, width){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  if(L < 4) return;
  var ry = Math.atan2(dx,dz), yLo = Math.min(ay,by);
  var n = Math.max(4, Math.round(Math.abs(ay-by)/STAIR_RISE));
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n;
    var x=ax+dx*t, z=az+dz*t, yHere=mix(ay,by,t);
    BOX(x, yLo, z, width*(1-0.05*t), Math.max(0.6,yHere-yLo), L/n*1.3, ry, 0xa79b82);
  }
}

function cantonTopDescent(c, ang, w){
  var F = CANTON_FACES[c.n];
  if(!F || F.spiral || F.levels.length < 2) return null;
  var topL = F.levels[F.levels.length-1], below = F.levels[F.levels.length-2];
  var a = bearingBeside(ang, w*0.925 + w*0.45 + 4, squareEdgeHw(topL.outer, ang));
  var r0 = squareEdgeHw(topL.outer, a), r1 = squareEdgeHw(below.outer, a) - 4;
  var dw = squareEdgeHw(below.hw, a);
  if(r1 - r0 < 6 || r1 - dw < 3) return null;   /* no room on the terrace: reported, never forced */
  var p0 = loc(c.x, c.z, 0, r0, a), p1 = loc(c.x, c.z, 0, r1, a);
  linkStair(p0[0], p0[1], topL.y, p1[0], p1[1], below.y, w*0.9);
  inspectClaim((p0[0]+p1[0])*0.5, (p0[1]+p1[1])*0.5, w*0.45, (r1-r0)*0.5, a,
               'cantonStair', 'Canton stair');
  var tier = F.tiers[F.tiers.length-1];
  plinthDoor(c.x, c.z, a, below.y, dw, c.tone,
             { maxH: Math.min(8, tier.th - 2.4), lean: faceLean(tier, a) });
  inspectClaim(c.x + Math.sin(a)*dw, c.z + Math.cos(a)*dw, 6, 4, a, 'cantonDoor', 'Canton door');
  return { y:below.y, hw:dw, ang:a };
}
