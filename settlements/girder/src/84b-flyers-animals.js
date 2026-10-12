/* ------------------------------------------------------------------ animals */
var flyList = [], flyNextId = 1, flySimT = 0, flyEvents = { arr:[], dep:[] };
var flyTotals = { arrivals:0, departures:0, transientsSpawned:0, peels:0, joins:0, sorties:0, sortieReturns:0, batHunts:0, batReturns:0 };
var flyCircuits = [], flyTintC = new THREE.Color(), flyBatDue = [], flyBatHours = [];
function flyNew(sp, ridden){
  var S = FLY_SPEC[sp], a = { id:flyNextId++, sp:sp, ridden:!!ridden, lance:ridden && Math.random() < 0.4, slot:-1, rslot:-1,
    state:'fly', pop:'', path:null, s:0, seg:0, vc:S.v[0]+Math.random()*(S.v[1]-S.v[0]), v:0,
    x:0, y:0, z:0, yaw:0, pitch:0, roll:0, yawRate:0, ph:Math.random()*TAU, amp:1, flapOn:true, flapT:2+Math.random()*4,
    fold:0, flare:0, launchT:99, t:0, bay:null, offL:0, offY:0, offS:0, size:0.92+Math.random()*0.16,
    hover:false, hoverT:2+Math.random()*5, yawOff:0, hy:0, hyT:0, hyTarget:0, shuf:0, riderMode:0, riderT:0, dest:'', perchSince:0,
    fx:0, fy:0, fz:0, tx:0, ty:0, tz:0, yaw0:0, p0:0, depPath:null, prepT:0, idleSeed:Math.random()*100, crouch:0, patrol:false,
    circuit:null, join:null, lapT:0, lapMax:0, peelT:0, resident:false, note:'' };
  a.v = a.vc; a.riderMode = ridden ? 1 : 0;
  a.slot = flySlotGet(sp, a);
  if(a.slot < 0) return null;
  var b = 0.80+Math.random()*0.32, w = (Math.random()-0.5)*0.12;
  flyTintC.setRGB(b*(1+w), b, b*(1-w)); flyMesh[sp].setColorAt(a.slot, flyTintC); flyMesh[sp].instanceColor.needsUpdate = true;
  flyList.push(a);
  return a;
}
function flyRemove(a){
  flySlotFree(a.sp, a.slot); if(a.rslot >= 0){ flySlotFree(FLY_R, a.rslot); a.rslot = -1; }
  var i = flyList.indexOf(a); if(i >= 0){ flyList[i] = flyList[flyList.length-1]; flyList.pop(); }
  a.slot = -1; a.state = 'gone';
}
function flyPlaceOnPath(a){
  flyPathAt(a.path, a.s, a.seg); a.seg = flyS[3]; var x = flyS[0], y = flyS[1], z = flyS[2];
  var s2 = Math.min(a.path.len, a.s+4), back = false; if(s2-a.s < 1){ s2 = Math.max(0, a.s-4); back = true; }
  flyPathAt(a.path, s2, a.seg);
  var tx = flyS[0]-x, ty = flyS[1]-y, tz = flyS[2]-z; if(back){ tx = -tx; ty = -ty; tz = -tz; }
  var hl = Math.sqrt(tx*tx+tz*tz) || 1e-6;
  a.x = x + (tz/hl)*a.offL; a.z = z - (tx/hl)*a.offL; a.y = y + a.offY;
  a.tx = tx; a.ty = ty; a.tz = tz;
}
function flySnapHeading(a){ a.yaw = Math.atan2(a.tx, a.tz); a.pitch = clamp(Math.atan2(a.ty, Math.hypot(a.tx, a.tz)), -0.6, 0.6); a.roll = 0; a.yawRate = 0; }

function flyIsNight(hour){ return hour >= 18.5 || hour < 5.2; }
function flyHourW(sp, hour, arriving){
  var dusk = hour >= 17.5 && hour < 23, night = hour >= 23 || hour < 4.5, dawn = hour >= 4.5 && hour < 7;
  /* bats: out at dusk and all night; their RETURNS are driven by the hunt timers (flyBatDue), not by the hour */
  if(sp === FLY_B) return dusk ? (arriving ? 0.25 : 3.2) : night ? (arriving ? 0.35 : 1.6) : dawn ? (arriving ? 0.8 : 0.04) : 0.03;
  var w = sp === FLY_D ? 0.8 : 1;
  return dusk ? w*0.5 : night ? w*0.14 : w;
}
function flyPickSp(hour, arriving, noQ){
  var w = [noQ ? 0 : flyHourW(0,hour,arriving)*2.2, flyHourW(1,hour,arriving), flyHourW(2,hour,arriving), flyHourW(3,hour,arriving)];
  var t = Math.random()*(w[0]+w[1]+w[2]+w[3]);
  for(var i=0;i<4;i++){ t -= w[i]; if(t <= 0) return i; }
  return 2;
}

/* --- transients: straight lines over the canopy, high above it, or low along the brook --- */
var FLY_TRANSIENTS = 18;
function flySpawnTransient(prefill, hour){
  var dusk = hour >= 17 || hour < 5.5;
  var w = [0.30, dusk ? 0.55 : 0.05, 0.30, 0.25], t = Math.random()*(w[0]+w[1]+w[2]+w[3]), sp = 0;
  for(var i=0;i<4;i++){ t -= w[i]; if(t <= 0){ sp = i; break; } }
  var flock = ((sp === FLY_A && Math.random() < 0.4) || (sp === FLY_B && dusk && Math.random() < 0.6)) ? 3+Math.floor(Math.random()*5) : 1;
  var ridden = flock === 1 && Math.random() < 0.28;
  for(var tr=0; tr<(prefill ? 30 : 6); tr++){
    var ax, az, bx, bz, y, r = Math.random(), dx, dz, L;
    if(r < 0.22){            /* low, under the crowns, along the brook's reach past the palisade */
      var s1 = RIVER_LEN*(0.30+Math.random()*0.15), s2 = RIVER_LEN*(0.55+Math.random()*0.15), p1 = riverAt(s1), p2 = riverAt(s2);
      dx = p2.x-p1.x; dz = p2.z-p1.z; L = Math.hypot(dx, dz); dx /= L; dz /= L; if(Math.random() < 0.5){ dx = -dx; dz = -dz; }
      var back = flyEdge(p1.x, p1.z, -dx, -dz); ax = p1.x-dx*back; az = p1.z-dz*back;
      y = Math.max(riverLevel(s1), riverLevel(s2)) + 38+Math.random()*30;
    } else {
      var an = Math.random()*TAU; ax = Math.cos(an)*FLY_EDGE; az = Math.sin(an)*FLY_EDGE;
      var gx = (Math.random()-0.5)*1800, gz = (Math.random()-0.5)*1800;
      dx = gx-ax; dz = gz-az; L = Math.hypot(dx, dz); dx /= L; dz /= L;
      y = r < 0.72 ? flyTopY+14+Math.random()*70 : 470+Math.random()*110;
    }
    var D = flyEdge(ax+dx, az+dz, dx, dz)+1; bx = ax+dx*D; bz = az+dz*D;
    if(flyLineHit(ax, y, az, bx, y, bz, 25, 40, flock > 1 ? 26 : 0)){ flyPathStats.rejected++; continue; }
    flyPathStats.accepted++;
    var path = flyPathFromPts([[ax,y,az],[bx,y,bz]], false), s0 = prefill ? Math.random()*path.len*0.9 : 0, lead = null;
    for(var k=0;k<flock;k++){
      var a = flyNew(sp, ridden); if(!a) break;
      a.pop = 'transient'; a.path = path;
      if(k){ var rank = Math.ceil(k/2); a.offL = ((k%2) ? 1 : -1)*rank*(7+Math.random()*3); a.offS = -rank*(8+Math.random()*4); a.offY = Math.random()*4-2; a.vc = lead.vc; a.v = lead.v; }
      else lead = a;
      a.s = Math.max(0, s0 + a.offS + 40); a.seg = 0; flyPlaceOnPath(a); flySnapHeading(a);
    }
    flyTotals.transientsSpawned += flock;
    return true;
  }
  return false;
}

/* --- roost traffic --- */
function flyFreeBays(plat, sp){ var out = []; for(var i=0;i<flyBays.length;i++){ var B = flyBays[i];
  if(B.ok && !B.occ && !B.reserved && (!plat || B.plat === plat) && !(sp === FLY_Q && B.kind !== 'outer')) out.push(B); } return out; }
/* startBack: null = from the world edge; a number = start that many metres before the gate */
function flySpawnArrival(plat, spForce, startBack, hour, sortie){
  var forced = !(spForce === undefined || spForce === null), free = flyFreeBays(plat, forced ? spForce : null); if(!free.length) return null;
  for(var tr=0; tr<(startBack !== null ? 12 : 4); tr++){
    var B = free[Math.floor(Math.random()*free.length)];
    var sp = forced ? spForce : flyPickSp(hour, true, B.kind !== 'outer');
    if(sortie && sp === FLY_B) sp = FLY_A;
    var path = flyRoute(B, sp, true, 4, startBack !== null && startBack < 200, sortie); if(!path) continue;
    var a = flyNew(sp, sortie ? true : sp === FLY_B ? Math.random() < 0.3 : Math.random() < 0.75); if(!a) return null;
    a.pop = 'arr'; a.bay = B; B.reserved = true; a.path = path; a.dest = B.plat.name; a.note = sortie ? 'back from a sortie toward ' + sortie.name : '';
    a.s = startBack !== null ? Math.max(0, path.straight-startBack) : 0; flyPlaceOnPath(a); flySnapHeading(a);
    return a;
  }
  return null;
}
function flyCircuitCount(C){ var n = 0; for(var i=0;i<flyList.length;i++){ var a = flyList[i]; if(a.circuit === C || (a.join && a.join.path === C)) n++; } return n; }
function flyCircuitWant(C, hour){ return C.nightOnly ? (flyIsNight(hour) ? C.want : 0) : (flyIsNight(hour) ? Math.min(C.want, 1) : C.want); }
/* steer from (x,y,z,heading) onto a target polyline T (a circuit, or an arrival route), path-tracking a carrot that runs
   ahead along T: turn radius >= R, climb/sink <= 0.18, every step tested. Joins when on the line, aligned and level.
   Returns { pts:[[x,y,z]..], idx: index on T where it joined } or null. */
function flyPursue(x, y, z, hd, T, i0, i1, R, maxIt){
  var P = T.p, n = T.n, closed = T.closed, sp = T.len/(n-1), look = Math.max(8, Math.round(Math.max(70, R*1.5)/sp)), step = 8, pts = [], near = -1, it = 0, i, k;
  var first = true, dn = 0;
  while(it++ < maxIt){
    var best = 1e18, lo, hi, st;
    if(near < 0){ lo = i0; hi = closed ? i1 : i0+Math.round((i1-i0)*0.6); st = Math.max(1, Math.round(20/sp)); } else { lo = near-Math.round(60/sp); hi = near+Math.round(120/sp); st = Math.max(1, Math.round(6/sp)); }
    if(first || closed || dn < 150) for(i=lo;i<=hi;i+=st){ k = closed ? ((i%(n-1))+(n-1))%(n-1) : i; if(k < i0 || k > i1) continue;
      var ex = P[k*3]-x, ey = P[k*3+1]-y, ez = P[k*3+2]-z, d2 = ex*ex+ez*ez+ey*ey*0.25; if(d2 < best){ best = d2; near = k; } }
    if(first && !closed){      /* coming at an inbound route from inside: aim further up it so there is room to turn round onto it */
      var fx = P[(near+1)*3]-P[near*3], fz = P[(near+1)*3+2]-P[near*3+2], fl = Math.hypot(fx, fz) || 1;
      if((fx*Math.sin(hd)+fz*Math.cos(hd))/fl < 0.3) near = Math.max(i0, near-Math.round(320/sp)); }
    first = false;
    var c = near+look; if(closed) c = c%(n-1); else if(c > i1){ if(near >= i1-2){ flyWhy.pend++; return null; } c = i1; }
    var nx = (closed ? (near+1)%(n-1) : Math.min(n-1, near+1)), tH = Math.atan2(P[nx*3]-P[near*3], P[nx*3+2]-P[near*3+2]);
    dn = Math.hypot(P[near*3]-x, P[near*3+2]-z);
    if(dn < 9 && Math.abs(wrapPi(tH-hd)) < 0.2 && Math.abs(P[near*3+1]-y) < 3 && pts.length > 3){      /* on it: bleed the last few metres of offset away along the line */
      var K = Math.max(4, Math.round(40/sp)), ox0 = x-P[near*3], oy0 = y-P[near*3+1], oz0 = z-P[near*3+2], j = near;
      for(i=1;i<=K;i++){ j = closed ? (near+i)%(n-1) : Math.min(n-1, near+i); var w = 1-smooth(0, 1, i/K); pts.push([P[j*3]+ox0*w, P[j*3+1]+oy0*w, P[j*3+2]+oz0*w]); }
      return { pts:pts, idx:j }; }
    var dh = wrapPi(Math.atan2(P[c*3]-x, P[c*3+2]-z)-hd); hd += clamp(dh, -step/R, step/R);
    y += clamp((P[c*3+1]-y)*0.25, -step*0.18, step*0.18); x += Math.sin(hd)*step; z += Math.cos(hd)*step;
    var h = flyHit(x, y, z, 6, 6, 6, null, false); if(!h && y < terrainH(x, z)+20) h = 5;
    if(h){ flyReject(h); flyWhy.phit++; flyWhy.last = [h, it, Math.round(x), Math.round(y), Math.round(z), T.label || 'arr']; return null; }
    pts.push([x, y, z]);
  }
  flyWhy.plong++; return null;
}
/* a launch that ends ON a circuit: off the beam, drop away, then steer onto the loop */
function flyJoinRoute(B, sp, C){
  for(var t=0; t<3; t++){
    var D = flyDepPts(B, sp, 0, 60, 400, false), cp = D.pts.slice(0, D.pts.length-3), curve = new THREE.CatmullRomCurve3(cp, false, 'centripetal');
    var h = flyCurveHit(curve, B, 50); if(h){ flyReject(h); return null; }
    var out = []; flyCurvePts(curve, 2.5, out);
    var e = out[out.length-1], e0 = out[out.length-3], J = flyPursue(e[0], e[1], e[2], Math.atan2(e[0]-e0[0], e[2]-e0[2]), C, 0, C.n-2, 50+t*25, 700);
    if(!J) continue;
    flyPathStats.accepted++;
    var path = flyPathFromPts(out.concat(J.pts), false); path.curve = curve; path.straight = 0; path.joinS = C.cum[J.idx];
    return path;
  }
  return null;
}
function flyStartDeparture(plat, spForce, quick, hour, mode){
  var forced = !(spForce === undefined || spForce === null), i, a, C = null;
  if(!forced && !plat && mode !== 'far' && mode !== 'sortie' && (mode === 'circuit' || Math.random() < 0.6)) for(i=0;i<flyCircuits.length;i++){ var cc = flyCircuits[(i+flyNextId)%flyCircuits.length]; if(flyCircuitCount(cc) < flyCircuitWant(cc, hour)){ C = cc; break; } }
  if(mode === 'circuit' && !C) C = flyCircuits[Math.floor(Math.random()*flyCircuits.length)] || null;
  var best = null, bw = 0, nPer = [1,1,1,1];       /* the commoner a species is on the perches, the likelier one of them goes */
  for(i=0;i<flyList.length;i++) if(flyList[i].state === 'perch' && !flyList[i].resident) nPer[flyList[i].sp]++;
  for(i=0;i<flyList.length;i++){ a = flyList[i];
    if(a.state !== 'perch' || a.resident || !a.bay.ok || (plat && a.bay.plat !== plat) || (forced && a.sp !== spForce)) continue;
    if(C && !forced && C.spList.indexOf(a.sp) < 0) continue;
    if(!quick && flySimT-a.perchSince < 45) continue;
    var w = (quick || C ? 1 : flyHourW(a.sp, hour, false)*nPer[a.sp])*Math.random(); if(w > bw){ bw = w; best = a; } }
  if(!best) return C && !forced ? flyStartDeparture(plat, spForce, quick, hour, 'far') : null;
  if(C && C.spList.indexOf(best.sp) < 0) C = null;
  var B = best.bay, path = null, sortie = null;
  if(C){ path = flyJoinRoute(B, best.sp, C); flyPathStats[path ? 'joinOk' : 'joinFail']++; if(!path) return flyStartDeparture(plat, spForce, quick, hour, 'far'); }
  if(!path){
    if(best.sp !== FLY_B && (mode === 'sortie' || (!mode && !quick && Math.random() < 0.2))) sortie = FLY_SORTIES[Math.floor(Math.random()*FLY_SORTIES.length)];
    path = flyRoute(B, best.sp, false, 8, false, sortie);
    if(!path && sortie){ sortie = null; path = flyRoute(B, best.sp, false, 6, false, null); }
  }
  if(!path) return null;
  best.depPath = path; best.state = 'prep'; best.t = 0; best.join = C ? { path:C, s:path.joinS } : null;
  best.ridden = C ? !C.nightOnly : sortie ? true : best.sp === FLY_B ? Math.random() < 0.3 : Math.random() < 0.75; best.lance = best.ridden && Math.random() < (sortie || (C && C.wing) ? 0.9 : 0.4);
  best.prepT = quick ? (best.ridden ? 2.5 : 0.5) : (best.ridden ? 8+Math.random()*10 : 1+Math.random()*3);
  best.riderMode = best.ridden ? 2 : 0; best.dest = B.plat.name;
  best.note = C ? 'to join the ' + C.label.toLowerCase() : sortie ? 'high sortie toward ' + sortie.name : '';
  return best;
}
/* a circuit flyer peels off its loop and comes home: steer from where it is onto a fresh arrival route, short of its line-up */
function flyTryPeel(a){
  var free = flyFreeBays(null, a.sp); if(!free.length) return false;
  for(var t=0; t<3; t++){
    var B = free[Math.floor(Math.random()*free.length)];
    var R = flyRoute(B, a.sp, true, 2, true, null); if(!R) continue;
    var iMax = 0; while(iMax < R.n-2 && R.len-R.cum[iMax] > 250) iMax++;
    var J = flyPursue(a.x, a.y, a.z, a.yaw, R, 0, iMax, a.sp === FLY_Q ? 70 : 55, 260); if(!J) continue;
    var pts = J.pts; for(var i=J.idx+1;i<R.n;i++) pts.push([R.p[i*3], R.p[i*3+1], R.p[i*3+2]]);
    var path = flyPathFromPts(pts, false); path.curve = R.curve; path.straight = 0;
    a.path = path; a.s = 0; a.seg = 0; a.offL = 0; a.offY = 0; a.pop = 'arr'; a.bay = B; B.reserved = true; a.dest = B.plat.name;
    a.note = 'in off the ' + a.circuit.label.toLowerCase(); a.circuit = null; a.patrol = false; a.hover = false; a.yawOff = 0;
    flyTotals.peels++;
    return true;
  }
  return false;
}
function flyPerchPoint(a, out){
  var B = a.bay, S = FLY_SPEC[a.sp];
  if(a.sp === FLY_B){ out[0] = B.px+B.ox*FLY_E_HANG; out[1] = B.y+6.3-2.2*a.size; out[2] = B.pz+B.oz*FLY_E_HANG; }     /* hanging from the lean-to's rafters */
  else { out[0] = B.px+B.ox*FLY_E_PERCH; out[1] = B.y+S.stand*a.size; out[2] = B.pz+B.oz*FLY_E_PERCH; }
}
var flyP3 = [0,0,0];
function flyPerchNow(a, B){          /* put an animal straight onto a perch (load time) */
  a.bay = B; B.occ = a; a.pop = 'roost'; a.state = 'perch'; a.fold = 1; a.amp = 0; a.riderMode = 0; a.ridden = false; a.dest = B.plat.name;
  flyPerchPoint(a, flyP3); a.x = flyP3[0]; a.y = flyP3[1]; a.z = flyP3[2];
  a.yaw = a.sp === FLY_B ? Math.atan2(-B.ox, -B.oz) : Math.atan2(B.ox, B.oz); a.pitch = FLY_SPEC[a.sp].perchPitch; a.roll = 0; a.perchSince = -Math.random()*300; a.v = 0;
}

/* --- one simulation step for one animal --- */
var FLY_T_FOLD = 1.3, FLY_T_WALK = 3.6, FLY_T_LIP = 4.0;
function flyStep(a, h, hour){
  var S = FLY_SPEC[a.sp], B = a.bay, k;
  if(a.state === 'fly'){
    var path = a.path, rem = path.len - a.s, vT = a.vc;
    if(a.pop === 'arr'){
      if(rem < 320) vT = mix(a.vc*0.55, a.vc, clamp((rem-70)/250, 0, 1));
      if(rem < 20) vT = mix(a.sp === FLY_B ? 5 : 2.6, a.vc*0.55, rem/20);
      a.flare = a.sp === FLY_B ? 0 : smooth(0, 1, 1-rem/19);
    } else if(a.launchT < 3) vT = mix(7, a.vc, a.launchT/3);
    if(a.pop === 'circuit'){
      a.lapT += h;
      if(a.lapT > a.lapMax || (a.circuit.nightOnly && !flyIsNight(hour))){ a.peelT -= h; if(a.peelT <= 0){ a.peelT = 3+Math.random()*2; if(flyTryPeel(a)){ path = a.path; rem = path.len; } } }
    }
    if(a.sp === FLY_D && (a.pop === 'transient' || a.pop === 'circuit') ){
      a.hoverT -= h;
      if(a.hoverT <= 0){ a.hover = !a.hover; a.hoverT = a.hover ? 0.8+Math.random()*1.6 : 3+Math.random()*6; a.yawOff = a.hover ? (Math.random()-0.5)*1.6 : 0; }
      vT = a.hover ? 1.0 : a.vc*1.15;
      a.v += (vT-a.v)*Math.min(1, h*3.5);
    } else a.v += (vT-a.v)*Math.min(1, h*1.6);
    a.s += a.v*h; a.launchT += h;
    if(path.closed){ if(a.s >= path.len) { a.s -= path.len; a.seg = 0; } }
    else if(a.s >= path.len){
      if(a.pop === 'arr'){                                  /* touchdown */
        a.s = path.len; flyPlaceOnPath(a);
        a.fx = a.x; a.fy = a.y; a.fz = a.z; a.t = 0; a.p0 = a.pitch; a.yaw0 = Math.atan2(-B.ox, -B.oz); a.yaw = a.yaw0; a.roll = 0; a.v = 0;
        a.state = a.sp === FLY_B ? 'flip' : 'walk'; B.occ = a; B.reserved = false; a.pop = 'roost';
        flyEvents.arr.push(flySimT); flyTotals.arrivals++;
        if(a.note.indexOf('sortie') >= 0) flyTotals.sortieReturns++;
        if(a.sp === FLY_B && a.note === 'home from the hunt'){ flyTotals.batReturns++; flyBatHours.push(Math.round(hour*10)/10); if(flyBatHours.length > 80) flyBatHours.shift(); }
      } else if(a.join){                                    /* onto the loop */
        a.circuit = a.join.path; a.path = a.circuit; a.s = a.join.s; a.seg = 0; a.join = null; a.pop = 'circuit'; a.dest = a.circuit.label; a.note = '';
        a.lapT = 0; a.lapMax = a.circuit.lap[0]+Math.random()*(a.circuit.lap[1]-a.circuit.lap[0]); a.patrol = !!a.circuit.wing; a.bay = null;
        flyTotals.joins++; flyPlaceOnPath(a);
      } else flyRemove(a);
      return;
    }
    flyPlaceOnPath(a);
    var yawT = Math.atan2(a.tx, a.tz) + a.yawOff, dy = wrapPi(yawT-a.yaw), kk = Math.min(1, h*(a.hover ? 6 : 3.2)), yr = dy*kk/h;
    a.yaw = wrapPi(a.yaw + dy*kk);
    if(yr !== yr) yr = 0; if(a.yawRate !== a.yawRate) a.yawRate = 0; if(a.roll !== a.roll) a.roll = 0;
    a.yawRate += (yr-a.yawRate)*Math.min(1, h*4);
    var pT = clamp(Math.atan2(a.ty, Math.hypot(a.tx, a.tz)), a.launchT < 2.5 ? -1.2 : -0.55, 0.6) + a.flare*0.62 + (a.hover ? 0.22 : 0);
    if(a.sp === FLY_B && a.launchT < 1.6) pT = mix(-Math.PI/2, pT, smooth(0.35, 1.5, a.launchT));
    if(a.sp === FLY_B && a.pop === 'arr' && rem < 7) pT += (1-rem/7)*0.7;
    a.pitch += (pT-a.pitch)*Math.min(1, h*5);
    var rT = clamp(-Math.atan(a.v*a.yawRate/7.4)*0.9, -1.0, 1.0)*(1-a.flare);
    a.roll += (rT-a.roll)*Math.min(1, h*3);
    if(a.launchT < 1) a.fold = 1-smooth(0, 0.55, a.launchT); else a.fold = 0;
    a.crouch = 0;
  }
  else if(a.state === 'walk'){                    /* touched down on the beam outside the posts: fold FIRST, then walk in under the eave */
    a.t += h; k = clamp((a.t-FLY_T_FOLD)/FLY_T_WALK, 0, 1); flyPerchPoint(a, flyP3);
    var yBeam = B.y+FLY_BEAM_TOP+S.stand*a.size, bob = (k > 0 && k < 1) ? Math.abs(Math.sin(a.t*5))*0.07 : 0;
    a.x = mix(a.fx, flyP3[0], k); a.z = mix(a.fz, flyP3[2], k);
    a.y = mix(mix(a.fy, yBeam, smooth(0, 0.6, a.t)), flyP3[1], smooth(0.62, 0.8, k)) + bob;
    a.fold = smooth(0.1, FLY_T_FOLD, a.t); a.flare = 1-smooth(0, 0.8, a.t); a.pitch = mix(a.p0, S.perchPitch, smooth(0, 1.2, a.t)); a.yaw = a.yaw0; a.roll = bob ? Math.sin(a.t*5)*0.04 : 0;
    if(a.t >= FLY_T_FOLD+FLY_T_WALK){ a.state = 'turn'; a.t = 0; }
  }
  else if(a.state === 'turn'){
    a.t += h; a.yaw = wrapPi(a.yaw0 + Math.PI*smooth(0, 1, a.t/2.6)); a.roll = Math.sin(a.t*5)*0.04*(a.t < 2.6 ? 1 : 0);
    flyPerchPoint(a, flyP3); a.y = flyP3[1] + Math.abs(Math.sin(a.t*5))*0.06;
    if(a.t >= 2.8){ a.state = 'perch'; a.roll = 0; a.y = flyP3[1]; a.perchSince = flySimT; if(a.ridden){ a.riderMode = 2; a.riderT = 25+Math.random()*40; } a.ridden = false; a.note = ''; }
  }
  else if(a.state === 'flip'){
    a.t += h; k = smooth(0, 1, a.t/0.85); flyPerchPoint(a, flyP3);
    a.x = mix(a.fx, flyP3[0], k); a.y = mix(a.fy, flyP3[1], k); a.z = mix(a.fz, flyP3[2], k);
    a.pitch = mix(a.p0, Math.PI*1.5, k); a.fold = smooth(0.4, 1, k); a.yaw = a.yaw0; a.roll = 0;
    if(a.t >= 0.85){ a.state = 'perch'; a.pitch = -Math.PI/2; a.fold = 1; a.perchSince = flySimT; if(a.ridden){ a.riderMode = 2; a.riderT = 25+Math.random()*40; } a.ridden = false; a.note = ''; }
  }
  else if(a.state === 'perch'){
    if(a.riderMode === 2){ a.riderT -= h; if(a.riderT <= 0) a.riderMode = 0; }
  }
  else if(a.state === 'prep'){
    a.t += h;
    if(a.ridden) a.riderMode = a.t < a.prepT*0.7 ? 2 : 1;
    if(a.t >= a.prepT){ a.t = 0; a.riderMode = a.ridden ? 1 : 0;
      if(a.sp === FLY_B) flyLaunch(a, hour); else { a.state = 'tolip'; a.fx = a.x; a.fy = a.y; a.fz = a.z; } }
  }
  else if(a.state === 'tolip'){                   /* out along the perch beam, wings still folded, to beyond the posts */
    a.t += h; k = clamp(a.t/FLY_T_LIP, 0, 1);
    a.x = mix(a.fx, B.px+B.ox*FLY_E_LIP, k); a.z = mix(a.fz, B.pz+B.oz*FLY_E_LIP, k);
    a.y = a.fy + FLY_BEAM_TOP*smooth(0.22, 0.4, k) + Math.abs(Math.sin(a.t*5))*0.07; a.roll = Math.sin(a.t*5)*0.04;
    if(a.t >= FLY_T_LIP){ a.state = 'crouch'; a.t = 0; a.roll = 0; a.y = a.fy+FLY_BEAM_TOP; }
  }
  else if(a.state === 'crouch'){
    a.t += h; a.crouch = Math.sin(clamp(a.t/0.6, 0, 1)*Math.PI*0.5); a.fold = 1-0.25*a.crouch;
    if(a.t >= 0.6) flyLaunch(a, hour);
  }
}
function flyLaunch(a, hour){
  var B = a.bay; a.state = 'fly'; a.pop = 'dep'; a.path = a.depPath; a.depPath = null; a.s = 0; a.seg = 0; a.launchT = 0; a.v = a.sp === FLY_B ? 4 : 8;
  a.flapOn = true; a.flapT = 9; a.flare = 0;
  if(B){ B.occ = null; } flyEvents.dep.push(flySimT); flyTotals.departures++;
  if(a.path.sortie) flyTotals.sorties++;
  if(a.sp === FLY_B && !a.join && (flyIsNight(hour) || hour >= 17.5)){      /* a hunt: this bat is owed a return in 1.5-9 sim minutes, whatever the clock does */
    flyTotals.batHunts++; flyBatDue.push(flySimT + 90 + Math.random()*450); flyBatDue.sort(function(p, q){ return p-q; }); }
}

