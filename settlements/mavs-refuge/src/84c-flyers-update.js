/* ------------------------------------------------------------------ pose + instance matrices */
var flyE = new THREE.Euler(0, 0, 0, 'YXZ'), flyM = new THREE.Matrix4(), flyQt = new THREE.Quaternion(), flyPv = new THREE.Vector3(), flySc = new THREE.Vector3();
var flyAng = new Float32Array(16);
function flyWrite(a, T){
  var sp = a.sp, S = FLY_SPEC[sp], A = flyAng, F = flyFold[sp], i;
  for(i=0;i<16;i++) A[i] = 0;
  var amp = a.amp, sn = Math.sin(a.ph), cs = Math.cos(a.ph), so = Math.sin(a.ph-S.lag), fl = a.flare;
  var flapA = amp*S.a0*(1+0.3*fl)*sn + 0.06 + (1-amp)*0.10;
  var outA = amp*S.a1*so - (1-amp)*0.04 - amp*0.10;
  var tw = -amp*S.tw*cs - fl*0.22, osw = amp*0.28*Math.max(0, cs);
  var hy = clamp(a.yawRate*1.2, -0.5, 0.5), pc = clamp(a.pitch, -0.6, 0.6);
  if(sp === FLY_Q){
    A[0] = pc*0.35 + fl*0.25; A[1] = 0.04; A[2] = hy; A[3] = -0.15*fl; A[4] = flapA; A[5] = tw; A[6] = osw; A[7] = outA; A[8] = -1.3*fl;
  } else if(sp === FLY_B){
    A[0] = pc*0.3; A[1] = hy; A[3] = osw*0.4; A[4] = flapA*0.72; A[5] = tw; A[6] = amp*S.a0*0.42*Math.sin(a.ph-S.lag*0.5) - 0.06;
    A[7] = osw*1.6; A[8] = outA; A[9] = 0;
  } else if(sp === FLY_A){
    A[0] = pc*0.35 + fl*0.2; A[1] = hy; A[2] = -0.45*fl - 0.04; A[3] = osw*0.3 - 0.12*fl; A[4] = flapA; A[5] = tw; A[6] = osw; A[7] = outA;
    A[8] = -1.2*fl; A[9] = clamp(-a.roll*0.4, -0.35, 0.35);
  } else {
    A[0] = -0.04 + 0.03*Math.sin(T*2.1+a.idleSeed) - (a.hover ? 0.12 : 0); A[1] = A[0]; A[2] = 0.45;
    A[3] = S.a0*sn + 0.10; A[4] = S.a0*Math.sin(a.ph+2.0) + 0.05; A[5] = -S.a0*sn + 0.10; A[6] = -S.a0*Math.sin(a.ph+2.0) + 0.05; A[7] = hy;
  }
  var f = a.fold, P = flyPose[sp], o = a.slot*16;
  for(i=0;i<16;i++) P[o+i] = A[i] + (F[i]-A[i])*f;
  if(f > 0.5){                                           /* perched idle: look about, breathe */
    var iy = 0.55*Math.sin(T*0.21+a.idleSeed)*Math.sin(T*0.13+a.idleSeed*1.7)*f, ib = 0.06*Math.sin(T*0.6+a.idleSeed)*f;
    if(sp === FLY_Q){ P[o+2] += iy; P[o] += ib + a.crouch*0.35; }
    else if(sp === FLY_B){ P[o+1] += iy*0.7; P[o] += ib; }
    else if(sp === FLY_A){ P[o+1] += iy; P[o] += ib + a.crouch*0.3; P[o+2] += ib*1.5; }
    else { P[o+7] += iy*0.5; P[o] += ib*0.5; }
  }
  var k = a.size, y = a.y + S.heave*amp*Math.sin(a.ph-1.9)*(1-f) - a.crouch*0.3;
  flyE.set(-a.pitch, a.yaw, a.roll, 'YXZ'); flyQt.setFromEuler(flyE); flyPv.set(a.x, y, a.z); flySc.set(k, k, k);
  flyM.compose(flyPv, flyQt, flySc);
  var e = flyM.elements, M = flyMesh[sp].instanceMatrix.array;
  for(i=0;i<16;i++) M[o+i] = e[i];
  if(a.rslot >= 0) flyWriteRider(a, e, T, hy);
}
function flyWriteRider(a, e, T, hy){
  var S = FLY_SPEC[a.sp], sd = S.saddle, rs = S.rs, o = a.rslot*16, M = flyMesh[FLY_R].instanceMatrix.array, P = flyPose[FLY_R], i;
  for(i=0;i<12;i++) M[o+i] = e[i]*rs;
  var oy = e[13] + e[1]*sd[0] + e[5]*sd[1] + e[9]*sd[2];
  M[o+12] = e[12] + e[0]*sd[0] + e[4]*sd[1] + e[8]*sd[2]; M[o+13] = oy; M[o+14] = e[14] + e[2]*sd[0] + e[6]*sd[1] + e[10]*sd[2]; M[o+15] = 1;
  var mode = a.riderMode; if(mode === 1 && a.sp === FLY_B && a.state !== 'fly') mode = 2;
  if(mode === 1){
    for(i=0;i<16;i++) P[o+i] = FLY_RSEAT[i];
    P[o] = 0.50 + 0.12*a.flare - (a.launchT < 2 ? 0.2 : 0); P[o+1] = hy*1.4; P[o+5] = a.lance ? 1 : 0; P[o+6] = 0.35*Math.sin(T*6+a.idleSeed);
    P[o+10] = clamp(a.pitch, -0.7, 0.7)*0.6;
  } else {
    for(i=0;i<16;i++) P[o+i] = 0;
    P[o+5] = a.lance ? 1 : 0;
    if(mode === 2 && a.bay){
      var ks = a.size*rs; P[o+9] = 1; P[o+10] = a.pitch;
      P[o+7] = ((a.id&1) ? 1.9 : -1.9)/ks; P[o+8] = (a.bay.y + 0.80*ks - oy)/ks;
      P[o+1] = 0.6*Math.sin(T*0.31+a.idleSeed*2); P[o+2] = -0.25 + 0.2*Math.sin(T*0.47+a.idleSeed); P[o] = 0.04*Math.sin(T*0.8+a.idleSeed);
    }
  }
}

/* ------------------------------------------------------------------ circuits (closed loops) */
function flyMakeCircuit(cx, cz, r0, r1, y0, y1, n){
  for(var tr=0; tr<200; tr++){
    var pts = [], ph0 = flyRand()*TAU, ex = 1+flyRand()*0.5, rot = flyRand()*TAU, R = r0+flyRand()*(r1-r0), yb = y0+flyRand()*(y1-y0), dir = flyRand() < 0.5 ? 1 : -1;
    var cr = Math.cos(rot), sr = Math.sin(rot);
    for(var i=0;i<n;i++){ var t = ph0 + dir*i/n*TAU, q = R*(0.85+0.3*flyRand()), lx = Math.cos(t)*q*ex, lz = Math.sin(t)*q;
      pts.push(new THREE.Vector3(cx+lx*cr-lz*sr, yb+(flyRand()-0.5)*30, cz+lx*sr+lz*cr)); }
    var curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal'); curve.arcLengthDivisions = 400;
    var L = curve.getLength(), m = Math.ceil(L/6), bad = 0;
    for(i=0;i<m && !bad;i++){ curve.getPointAt(i/m, flyV);
      bad = flyHit(flyV.x, flyV.y, flyV.z, 18, 18, 9, null); if(!bad && flyV.y < terrainH(flyV.x, flyV.z)+30) bad = 5; }
    if(bad){ flyReject(bad); continue; }
    flyPathStats.accepted++;
    var out = []; flyCurvePts(curve, 4, out);
    var path = flyPathFromPts(out, true); path.curve = curve;
    return path;
  }
  return null;
}
/* opt: { wing: fly in formation, home: platform its flyers go home to, lap: [min,max] sim seconds aloft before peeling off } */
function flyAddCircuit(path, n, spList, label, opt){
  if(!path) return null;
  opt = opt || {}; var wing = !!opt.wing;
  path.label = label; path.spList = spList; path.want = n; path.wing = wing; path.home = opt.home || null; path.lap = opt.lap || [150, 420];
  flyCircuits.push(path);
  var s0 = flyRand()*path.len, lead = null;
  for(var k=0;k<n;k++){
    var a = flyNew(spList[k%spList.length], true); if(!a) return path;
    a.pop = 'circuit'; a.path = path; a.circuit = path; a.dest = label; a.patrol = wing; a.lapMax = 40+flyRand()*path.lap[1];
    if(wing){ if(k){ var rank = Math.ceil(k/2); a.offL = ((k%2) ? 1 : -1)*rank*9; a.offS = -rank*10; a.vc = lead.vc; } else lead = a;
      a.s = (s0 + a.offS + path.len) % path.len; a.lance = true; }
    else a.s = (s0 + k*path.len/n) % path.len;
    a.v = a.vc; a.seg = 0; flyPlaceOnPath(a); flySnapHeading(a);
  }
  return path;
}

/* ------------------------------------------------------------------ initial population */
var flyLegs = [], flyUsable = 0;
(function(){
  /* prove every bay has at least one clean approach; keep ~60 of the curves for the harness sweep */
  var okBays = [];
  flyBays.forEach(function(B){
    if(!B.ok) return;
    var p = flyRoute(B, B.big ? FLY_Q : FLY_A, true, 8, false);
    if(!p){ B.ok = false; flyPathStats.blockedBays++; return; }
    okBays.push(B); B.testCurve = p.curve;
  });
  flyUsable = flyPathStats.usableBays = okBays.length;
  var stride = Math.max(1, Math.floor(okBays.length/30));
  okBays.forEach(function(B, i){
    if(i%stride === 0 && flyLegs.length < 60){
      flyLegs.push({ name:'arr '+B.plat.name+' #'+B.id, curve:B.testCurve });
      var d = flyRoute(B, B.big ? FLY_Q : FLY_A, false, 5, true); if(d) flyLegs.push({ name:'dep '+B.plat.name+' #'+B.id, curve:d.curve });
    }
    B.testCurve = null;
  });
  /* perched animals in ~55% of the usable bays (bats sleep the day out, so they start perched too) */
  var rslots = 0;
  okBays.forEach(function(B){
    if(flyRand() > 0.55) return;
    var r = flyRand(), sp = B.big ? (r < 0.7 ? FLY_Q : FLY_A) : (r < 0.24 ? FLY_Q : r < 0.52 ? FLY_B : r < 0.84 ? FLY_A : FLY_D);
    var a = flyNew(sp, false); if(!a) return;
    flyPerchNow(a, B);
    a.saddled = flyRand() < (B.rook ? 0.6 : 0.4) && rslots < FLY_RCAP-70; if(a.saddled) rslots++;
    if(a.saddled && flyRand() < 0.25){ a.riderMode = 2; a.riderT = 20+flyRand()*200; a.lance = flyRand() < 0.4; }
    a.hyT = 5+flyRand()*60;
  });
  /* Rookery training circuits + city patrol wings */
  for(var c=0;c<3;c++) flyAddCircuit(flyMakeCircuit(P_RK.x, P_RK.z, 170+c*40, 260+c*60, P_RK.y-62, P_RK.y+12, 8), 3, [c === 1 ? FLY_A : FLY_Q, FLY_A, c === 2 ? FLY_D : FLY_Q], 'Rookery training circuit', { home:P_RK, lap:[150, 420] });
  flyAddCircuit(flyMakeCircuit(P_C.x, P_C.z, 480, 640, 95, 135, 10), 3, [FLY_Q], 'City patrol', { wing:true, lap:[260, 600] });
  flyAddCircuit(flyMakeCircuit(P_C.x, P_C.z, 680, 900, 490, 540, 10), 3, [FLY_A], 'City patrol', { wing:true, lap:[300, 700] });
})();
flyRand = Math.random;
(function(){
  var h0 = 12; try{ h0 = skyHour(); }catch(err){}
  for(var i=0;i<FLY_TRANSIENTS;i++) flySpawnTransient(true, h0);
  for(i=0;i<7;i++){ var a = flySpawnArrival(i < 3 ? P_RK : null, null, null, h0); if(a){ a.s = Math.random()*Math.max(0, a.path.len-450); a.seg = 0; flyPlaceOnPath(a); flySnapHeading(a); } }
  for(i=0;i<3;i++) flyStartDeparture(i === 0 ? P_RK : null, null, true, h0, 'far');
})();

/* ------------------------------------------------------------------ scheduler + per-frame update */
var flyTimeScale = 1, flyNextArr = 3, flyNextDep = 5, flyFrame = 0, flyFollow = null, flyFollowD = 30, flyCpu = 0, flyWasNight = false;
var flyCnt = { aloft:0, perched:0, ground:0, reserved:0, transient:0, circuit:0, bySp:[0,0,0,0], aloftSp:[0,0,0,0] };
function flyCount(){
  var C = flyCnt; C.aloft = C.perched = C.ground = C.transient = C.circuit = 0; C.bySp[0] = C.bySp[1] = C.bySp[2] = C.bySp[3] = 0; C.aloftSp[0] = C.aloftSp[1] = C.aloftSp[2] = C.aloftSp[3] = 0;
  for(var i=0;i<flyList.length;i++){ var a = flyList[i]; C.bySp[a.sp]++;
    if(a.state === 'fly'){ C.aloft++; C.aloftSp[a.sp]++; if(a.pop === 'transient') C.transient++; else if(a.pop === 'circuit') C.circuit++; } else { C.perched++; if(a.state !== 'perch') C.ground++; } }
}
function flyOcc(){ var n = 0, r = 0; for(var i=0;i<flyBays.length;i++){ var B = flyBays[i]; if(!B.ok) continue; if(B.occ) n++; else if(B.reserved) r++; } flyCnt.reserved = r; return n/Math.max(1, flyUsable); }
function flySchedule(h, hour){
  var nightNow = flyIsNight(hour), night = hour >= 23 || hour < 4.5, act = night ? 0.5 : 1, i;
  flyNextArr -= h; flyNextDep -= h;
  if(flyNextArr <= 0 || flyNextDep <= 0){
    var occ = flyOcc(), occA = occ + flyCnt.reserved/Math.max(1, flyUsable);
    if(flyNextArr <= 0){
      flyNextArr = (8+Math.random()*7)/act*(occA > 0.60 ? 1.7 : occA < 0.50 ? 0.65 : 1);
      if(occA < 0.69){ if(!flySpawnArrival(null, null, null, hour)) flyNextArr = 1.5; }
    }
    if(flyNextDep <= 0){
      flyNextDep = (8+Math.random()*7)/act*(occ < 0.50 ? 1.7 : occ > 0.60 ? 0.65 : 1);
      if(occ > 0.41){ if(!flyStartDeparture(null, null, false, hour, null)) flyNextDep = 1.5; }
    }
  }
  /* (from Girder) the bats come home one by one all through the night; whatever is still out when day breaks follows within ~2 minutes */
  if(flyWasNight && !nightNow) for(i=0;i<flyBatDue.length;i++) flyBatDue[i] = Math.min(flyBatDue[i], flySimT + 5 + Math.random()*120);
  if(flyWasNight !== nightNow){ flyBatDue.sort(function(p, q){ return p-q; }); flyWasNight = nightNow; }
  if(flyBatDue.length && flySimT >= flyBatDue[0]){
    var b = flySpawnArrival(null, FLY_B, 520, hour);
    if(b){ b.note = 'home from the hunt'; flyBatDue.shift(); } else flyBatDue[0] = flySimT + 6;
  }
  if(flyCnt.transient < FLY_TRANSIENTS && Math.random() < h*0.5){ flySpawnTransient(false, hour); flyCnt.transient += 1; }
  while(flyEvents.arr.length && flyEvents.arr[0] < flySimT-600) flyEvents.arr.shift();
  while(flyEvents.dep.length && flyEvents.dep[0] < flySimT-600) flyEvents.dep.shift();
}
function flyAnimate(a, h){
  var S = FLY_SPEC[a.sp];
  if(a.state === 'fly'){
    var rem = a.path.closed ? 1e9 : a.path.len-a.s, tl = Math.hypot(a.tx, a.ty, a.tz) || 1;
    if((a.pop === 'arr' && rem < 160) || a.launchT < 6 || S.on[0] >= 99 || a.ty/tl > 0.07) a.flapOn = true;
    else { a.flapT -= h; if(a.flapT <= 0){ a.flapOn = !a.flapOn; var R = a.flapOn ? S.on : S.off; a.flapT = R[0]+Math.random()*(R[1]-R[0]); } }
    var ampT = a.flapOn ? 1 : 0;
    if(a.sp === FLY_B && a.pop === 'arr' && a.path.len-a.s < 16) ampT = 0.45;      /* shallow beats going in between the posts */
    a.amp += (ampT-a.amp)*Math.min(1, h*2.5);
    a.ph += TAU*S.hz*h*(0.55+0.45*a.amp)*((a.launchT < 2.5 || a.flare > 0.3) ? 1.35 : 1);
  } else {
    a.amp += (0-a.amp)*Math.min(1, h*2); a.ph += TAU*S.hz*h*0.6;
    if(a.state === 'perch' && (a.sp === FLY_A || a.sp === FLY_B)){          /* now and then stretch the wings */
      a.hyT -= h; if(a.hyT <= 0){ a.shuf = 2.6; a.hyT = 25+Math.random()*70; }
      if(a.shuf > 0){ a.shuf -= h; a.fold = 1-0.32*Math.sin(Math.PI*clamp(1-a.shuf/2.6, 0, 1)); if(a.shuf <= 0) a.fold = 1; }
    }
  }
  if(a.ph > 1e4) a.ph -= TAU*1000;
}
function flySim(simDt, hour){
  if(!(simDt > 1e-5)) return;
  var n = Math.min(60, Math.max(1, Math.ceil(simDt/0.1))), h = simDt/n;
  for(var st=0; st<n; st++){
    flySimT += h;
    for(var i=flyList.length-1;i>=0;i--){ var a = flyList[i]; if(!a) continue; flyStep(a, h, hour); if(a.state !== 'gone') flyAnimate(a, h); }
    flyCount(); flySchedule(h, hour);
  }
}
function flyUpdate(dt, hour, nightK){
  var t0 = performance.now();
  flyFrame++;
  flySim(Math.min(dt, 0.1)*flyTimeScale, hour);
  var T = flySimT, i, a, rUsed = false;
  for(i=0;i<flyList.length;i++){ a = flyList[i];
    if(a.ridden || a.riderMode) a.saddled = true;
    if(a.saddled && a.rslot < 0){ a.rslot = flySlotGet(FLY_R, a); if(a.rslot < 0) a.saddled = false; }
    if(a.state === 'perch' && a.shuf <= 0 && a.written && ((flyFrame+a.id)%4)) continue;
    flyWrite(a, T); a.written = true;
  }
  flyWingMesh.count = flyMesh[FLY_D].count;
  for(i=0;i<5;i++){ flyMesh[i].instanceMatrix.needsUpdate = true; flyPoseBuf[i].needsUpdate = true; }
  /* night glints: rider lanterns (<= 30) then bat eyes */
  var n = 0;
  if(nightK > 0.05){
    var RM = flyMesh[FLY_R].instanceMatrix.array, o, lamps = 0;
    for(i=0;i<flyList.length && lamps < 30;i++){ a = flyList[i]; if(a.rslot < 0 || a.state !== 'fly' || !a.ridden) continue;
      o = a.rslot*16; flyGlPos[n*3] = RM[o+12]+RM[o+4]*0.5+RM[o+8]*0.7; flyGlPos[n*3+1] = RM[o+13]+RM[o+5]*0.5+RM[o+9]*0.7; flyGlPos[n*3+2] = RM[o+14]+RM[o+6]*0.5+RM[o+10]*0.7;
      flyGlCol[n*4] = flyLampC.r; flyGlCol[n*4+1] = flyLampC.g; flyGlCol[n*4+2] = flyLampC.b; flyGlCol[n*4+3] = 1.0; n++; lamps++; }
    for(i=0;i<flyList.length && n < FLY_NGL;i++){ a = flyList[i]; if(a.sp !== FLY_B || a.state !== 'fly') continue;
      flyGlPos[n*3] = a.x+Math.sin(a.yaw)*1.3; flyGlPos[n*3+1] = a.y+0.25; flyGlPos[n*3+2] = a.z+Math.cos(a.yaw)*1.3;
      flyGlCol[n*4] = flyEyeC.r; flyGlCol[n*4+1] = flyEyeC.g; flyGlCol[n*4+2] = flyEyeC.b; flyGlCol[n*4+3] = 0.35; n++; }
    flyGlGeo.attributes.position.needsUpdate = true; flyGlGeo.attributes.aCol.needsUpdate = true;
  }
  flyGlints.visible = n > 0; flyGlGeo.setDrawRange(0, Math.max(1, n)); flyGlMat.uniforms.uK.value = nightK; flyNGl = n;
  if(flyFollow){
    a = flyFollow;
    if(a.state === 'gone') flyFollow = null;
    else { var d = flyFollowD, dx, dz;
      if(a.state !== 'fly' && a.bay){ var B = a.bay, fc = Math.cos(flyFollowA-0.3), fs = Math.sin(flyFollowA-0.3); dx = B.ox*fc-B.oz*fs; dz = B.ox*fs+B.oz*fc; }
      else { dx = Math.sin(a.yaw+flyFollowA); dz = Math.cos(a.yaw+flyFollowA); }
      window._dbg.setView(a.x+dx*d, a.y+d*flyFollowUp, a.z+dz*d, a.x, a.y, a.z); }
  }
  flyCpu += (performance.now()-t0-flyCpu)*0.05;
}
var flyNGl = 0, flyFollowA = 0.9, flyFollowUp = 0.22;
TICKS.push(flyUpdate);

