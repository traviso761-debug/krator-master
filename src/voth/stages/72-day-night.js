/* ==== DAY/NIGHT CYCLE ==== */
reseed(820001);

var DAYNIGHT_SEC_PER_HOUR = SKY.secPerHour;
function dayNightHour(){ return skyHour(); }
function setDayNightPaused(p){
  SKY.paused = !!p;
  var btn = document.getElementById('dnPause');
  if(btn) btn.textContent = SKY.paused ? 'Resume' : 'Pause';
}
(function(){
  var btn = document.getElementById('dnPause');

  if(btn) btn.onclick = function(){ setDayNightPaused(!SKY.paused); };
})();

var MOON_AZ0 = Math.atan2(MOONDIR.x, MOONDIR.z);
var MOON_ELEV_MAX = Math.asin(MOONDIR.y) * 1.15;      /* a bit higher arc so it clears the skyline at its own "noon" (midnight) */

function bodyDir(hour, az0, elevMax){
  var phase = (hour/24)*Math.PI*2 - Math.PI/2;         /* h=6 -> 0 (rise), h=12 -> pi/2 (peak), h=18 -> pi (set) */
  var elev = Math.sin(phase) * elevMax;
  var az = az0 + (hour-12)/24*Math.PI*2;
  return new THREE.Vector3(Math.cos(elev)*Math.sin(az), Math.sin(elev), Math.cos(elev)*Math.cos(az)).normalize();
}

var SUN_BASE_I = PAL.sunIntensity, HEMI_BASE_I = PAL.hemiIntensity, AMB_BASE_I = PAL.ambientIntensity;

var HEMI_NIGHT_I = 0.16, AMB_NIGHT_I = 0.11;
var HAZE_DAY = new THREE.Color(PAL.haze);
var HAZE_NIGHT = new THREE.Color(0x1c2436);
var SKY_TINT_DAY = new THREE.Color(0xffffff);
var SKY_TINT_NIGHT = new THREE.Color(0x475374);
var WATER_SKY_DAY = new THREE.Color(0xc6c8c2);      /* waterUni's own original default */
var WATER_SKY_NIGHT = new THREE.Color(0x232c42);
var _dnFog = new THREE.Color(), _dnSky = new THREE.Color(), _dnWaterSky = new THREE.Color();

function smoothstep(lo,hi,x){ var t=Math.max(0,Math.min(1,(x-lo)/(hi-lo))); return t*t*(3-2*t); }

var DN_SHINE_HEMI = 0.13, DN_SHINE_AMB = 0.07;

var DN_SHINE_NL_CUT = 0.28;
var DN_SKY_SAMPLE = 0.45, DN_SOIL_SAMPLE = 0.40;

function updateDayNight(){
  var S = SKY_STATE;
  var hour = S.hour;
  var moonDir = bodyDir((hour+12)%24, MOON_AZ0, MOON_ELEV_MAX);
  SUNDIR.copy(S.sunDir); MOONDIR.copy(moonDir);
  moonSprite.userData.dir.copy(moonDir);

  var daylight = S.dayK;
  var moonUp = smoothstep(-0.05, 0.10, moonDir.y);
  var shine = S.lit*(1 - daylight);          /* planetshine strength, 0..1 */

  sun.color.copy(S.keyCol);
  sun.intensity = SUN_BASE_I * S.keyI;
  hemiLight.intensity = HEMI_NIGHT_I + DN_SHINE_HEMI*shine + (HEMI_BASE_I-HEMI_NIGHT_I) * daylight;
  ambLight.intensity  = AMB_NIGHT_I  + DN_SHINE_AMB*shine  + (AMB_BASE_I-AMB_NIGHT_I) * daylight + 0.02*moonUp;

  sun.intensity *= 1.16 - 0.30*S.shadowSoft;
  hemiLight.intensity *= 0.80 + 0.42*S.shadowSoft;
  ambLight.intensity  *= 0.80 + 0.42*S.shadowSoft;

  hemiLight.color.setHex(PAL.hemiSky).lerp(S.hemiSky, DN_SKY_SAMPLE);
  hemiLight.groundColor.setHex(PAL.hemiGround).lerp(S.hemiGround, DN_SOIL_SAMPLE);

  _dnFog.copy(HAZE_NIGHT).lerp(HAZE_DAY, daylight);
  scene.fog.color.copy(_dnFog);
  skyScene.background.copy(_dnFog);
  scene.fog.density = PAL.fogDensity * S.fogScale;     /* fog thickens with pressureAtm */
  _dnSky.copy(SKY_TINT_NIGHT).lerp(SKY_TINT_DAY, daylight);
  skyMesh.material.color.copy(_dnSky);

  waterUni.uSun.value.copy(SKY_STATE.keyDir);
  waterUni.uFogCol.value.copy(_dnFog);
  waterUni.uFogDen.value = scene.fog.density;
  _dnWaterSky.copy(WATER_SKY_NIGHT).lerp(WATER_SKY_DAY, daylight);
  waterUni.uSky.value.copy(_dnWaterSky);

  moonSprite.material.opacity = (0.15 + 0.55*moonUp) * (1 - daylight*0.85);
  moon2.material.opacity = (0.10 + 0.30*moonUp) * (1 - daylight*0.7);

  DAYNIGHT_NIGHT_K = (1 - daylight) * (1 - DN_SHINE_NL_CUT*S.lit);
}
var DAYNIGHT_NIGHT_K = 0;

/* ==== night-light props ==== */
var NIGHT_LIGHTS = [];
function addNightLight(x, z, y){
  NIGHT_LIGHTS.push([x, (y!=null?y:lifeGroundY(x,z))+2.6, z]);
}
/* central district: Palace + Temple canton edges */
['Palace','Temple'].forEach(function(nm){
  var c = CIDX[nm]; if(!c) return;
  var ey = cantonEdgeY(nm);
  for(var i=0;i<4;i++){
    var a = (i/4)*Math.PI*2 + 0.4;
    addNightLight(c.x+Math.cos(a)*c.r*0.9, c.z+Math.sin(a)*c.r*0.9, ey);
  }
});
/* every canton's own edge, one brazier flanking its main causeway/pier side */
CANTONS.forEach(function(c){
  var ey = cantonEdgeY(c.n); if(ey==null) return;
  addNightLight(c.x + c.r*0.92, c.z, ey);
  addNightLight(c.x - c.r*0.92, c.z, ey);
});
/* causeways: canton end and shore end */
CAUSEWAYS.forEach(function(cw){
  var c = cw.c; if(!c) return;
  var land = shoreIn(cw.s, 26);
  var dx=land[0]-c.x, dz=land[1]-c.z, L=Math.hypot(dx,dz); if(L<1) return;
  var ax = c.x + dx/L*c.r*0.96, az = c.z + dz/L*c.r*0.96;
  var deckY = cw.solid ? cantonEdgeY(c.n) : CWAY;
  addNightLight(ax, az, deckY);
  addNightLight(land[0], land[1], Math.max(CWAY-6, terrainH(land[0],land[1])+2.5));
});
/* shrines + temple altar */
if(typeof LIFE_SHRINE_STOPS !== 'undefined') LIFE_SHRINE_STOPS.forEach(function(s){ addNightLight(s.x, s.z); });
if(typeof TEMPLE_ALTAR !== 'undefined' && TEMPLE_ALTAR) addNightLight(TEMPLE_ALTAR.x, TEMPLE_ALTAR.z, TEMPLE_ALTAR.y);

var TEMPLE_BRAZIER_IDX = [];
(window.TEMPLE_BRAZIERS||[]).forEach(function(b){
  TEMPLE_BRAZIER_IDX.push(NIGHT_LIGHTS.length);
  addNightLight(b.x, b.z, b.y);
});

if(typeof ROADS !== 'undefined') ROADS.forEach(function(rd){
  if(rd.cls !== 'ring') return;
  for(var i=0;i<rd.pts.length;i+=9) addNightLight(rd.pts[i][0], rd.pts[i][1]);
});

if(typeof STATIC_LANTERNS !== 'undefined') STATIC_LANTERNS.forEach(function(p){ addNightLight(p.x, p.z, p.y); });

NIGHT_LIGHTS.forEach(function(p, i){
  var big = TEMPLE_BRAZIER_IDX.indexOf(i) !== -1;
  nlLampAdd(p[0], p[1], p[2], big ? 3.0 : 1.0, big ? 34 : 17);
});

/* ==== the Fortress's four ornamental tower flames, burning green ==== */
var FORT_FLAME_IDX = [];
(window.FORT_TOWER_FLAMES||[]).forEach(function(f){
  FORT_FLAME_IDX.push(NIGHT_LIGHTS.length);
  NIGHT_LIGHTS.push([f.x, f.y + 1.1, f.z]);
  nlGreenAdd(f.x, f.y + 1.1, f.z, 2.6, 46);
});

var FORT_FLAME_COL = new THREE.Color().fromArray(PAL.flame.greenSprite);

/* ==== moving-vehicle lanterns ==== */
var LANTERN_ORD_BASE = NIGHT_LIGHTS.length;
(function(){ for(var i=0;i<LIFE_ORD_N;i++) NIGHT_LIGHTS.push([0,0,0]); })();
var LANTERN_CARAVAN_BASE = NIGHT_LIGHTS.length;   /* real caravans only — LIFE_STRIDER_CAR_BASE (90) of them; the 60 reserved strider-car slots (all three routes) are tracked separately, below */
(function(){ for(var i=0;i<LIFE_STRIDER_CAR_BASE;i++) NIGHT_LIGHTS.push([0,0,0]); })();
var LANTERN_TAXI_BASE = NIGHT_LIGHTS.length;
(function(){ for(var i=0;i<LIFE_TAXI_N;i++) NIGHT_LIGHTS.push([0,0,0]); })();

var LANTERN_BOAT_BASE = NIGHT_LIGHTS.length;
var LANTERN_BOAT_N = LIFE_AVOID_OBST0;
(function(){ for(var i=0;i<LANTERN_BOAT_N;i++) NIGHT_LIGHTS.push([0,0,0]); })();
var LANTERN_STRIDER_BASE = NIGHT_LIGHTS.length;
(function(){ for(var i=0;i<LIFE_STRIDER_CAR_SLOTS;i++) NIGHT_LIGHTS.push([0,0,0]); })();

var nlGeo = lifeMergeGeoms ? lifeMergeGeoms([
  { geo: new THREE.ConeGeometry(0.5, 1.6, 5).translate(0,0.8,0), color: 0xffb347 },
  { geo: new THREE.ConeGeometry(0.28, 0.9, 5).translate(0,1.15,0), color: 0xfff0c0 }
]) : new THREE.ConeGeometry(0.5,1.6,5);
var nlMat = new THREE.MeshBasicMaterial({ color:0xffb347, transparent:true, opacity:0,
  blending:THREE.AdditiveBlending, depthWrite:false, fog:false });
var nlMesh = new THREE.InstancedMesh(nlGeo, nlMat, Math.max(1, NIGHT_LIGHTS.length));
nlMesh.frustumCulled = false;

nlMesh.userData.life = true;
(function(){
  var m = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1,1,1);
  var s0 = new THREE.Vector3(0,0,0);
  var sBig = new THREE.Vector3(2.6,2.6,2.6);   /* "large" braziers — 2.6x an ordinary torch flame */
  var sFort = new THREE.Vector3(3.4,3.4,3.4);  /* the Fortress tower flames: read from the bay, 136 up and 400+ units out */
  var white = new THREE.Color(0xffffff);
  NIGHT_LIGHTS.forEach(function(p, i){
    var big = TEMPLE_BRAZIER_IDX.indexOf(i) !== -1;
    var grn = FORT_FLAME_IDX.indexOf(i) !== -1;

    var scaleV = (i >= LANTERN_ORD_BASE) ? s0 : (grn ? sFort : (big ? sBig : s1));
    m.compose(new THREE.Vector3(p[0],p[1],p[2]), q, scaleV);
    nlMesh.setMatrixAt(i, m);

    nlMesh.setColorAt(i, grn ? FORT_FLAME_COL : white);
  });
  nlMesh.instanceColor.needsUpdate = true;
})();
scene.add(nlMesh);

var _nlTrackM = new THREE.Matrix4(), _nlTrackQ = new THREE.Quaternion();
var _nlTrackS1 = new THREE.Vector3(1,1,1), _nlTrackS0 = new THREE.Vector3(0,0,0), _nlTrackP = new THREE.Vector3();
function nlTrack(idx, x, y, z, visible){
  _nlTrackP.set(x,y,z);
  _nlTrackM.compose(_nlTrackP, _nlTrackQ, (visible===false) ? _nlTrackS0 : _nlTrackS1);
  nlMesh.setMatrixAt(idx, _nlTrackM);
}

var LANTERN_TRACK_READY = true;

var TEMPLE_BRAZIER_LIT = false;
var TEMPLE_BRAZIER_OFF_COL = new THREE.Color(0,0,0);
var TEMPLE_BRAZIER_LIT_COL = new THREE.Color(1.9,1.5,0.85);

var LH_BEACONS = [];
(function(){
  var c = CIDX['Port'];
  var top = CANTON_TOPS['Port'];
  if(c && top){

    var lh = top.hw*0.95;
    LH_BEACONS.push({ x:c.x, z:c.z, y:top.y + lh + 4, beams:2, spin:0.6 });
  }
  ISLES.forEach(function(I){
    if(I[4] !== 'light') return;

    LH_BEACONS.push({ x:I[0], z:I[1], y:terrainH(I[0],I[1]) + 47.5, beams:1, spin:rr(0.45,0.75) });
  });
})();
var LH_BEAM_N = 0;
LH_BEACONS.forEach(function(b){ b.slot0 = LH_BEAM_N; LH_BEAM_N += b.beams; });
var lhBeamMesh = null;
if(LH_BEAM_N > 0){

  var beamTex = (function(){
    var c = document.createElement('canvas'); c.width = 8; c.height = 128;
    var g = c.getContext('2d');
    var grad = g.createLinearGradient(0,0,0,128);
    grad.addColorStop(0.00, 'rgba(255,242,200,0.85)');
    grad.addColorStop(0.12, 'rgba(255,242,200,0.55)');
    grad.addColorStop(0.55, 'rgba(255,242,200,0.16)');
    grad.addColorStop(1.00, 'rgba(255,242,200,0)');
    g.fillStyle = grad; g.fillRect(0,0,8,128);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  })();
  var beamGeo = new THREE.PlaneGeometry(3, 620, 1, 24);
  (function(){
    var pos = beamGeo.attributes.position;
    for(var vi=0; vi<pos.count; vi++){
      var ly = pos.getY(vi);                  /* -310..310 before the translate below */
      var tt = (ly+310)/620;                   /* 0 at source, 1 at tip */
      pos.setX(vi, pos.getX(vi)*(1+tt*2.2));
    }
    pos.needsUpdate = true;
    beamGeo.translate(0, 310, 0);              /* pivot at the tower, beam reaches outward */
    beamGeo.rotateX(Math.PI/2);                /* lie flat — baked in, so instances only need a Y spin */
  })();
  var beamMat = new THREE.MeshBasicMaterial({ color:0xfff2c8, map:beamTex, transparent:true, opacity:0,
    blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide, fog:false });
  lhBeamMesh = new THREE.InstancedMesh(beamGeo, beamMat, LH_BEAM_N);
  lhBeamMesh.frustumCulled = false;
  scene.add(lhBeamMesh);
}
var LH_SPIN_T = 0;
var _lhM = new THREE.Matrix4(), _lhQ = new THREE.Quaternion(), _lhS = new THREE.Vector3(1,1,1), _lhP = new THREE.Vector3();

/* ==== the Guild canton's clock ==== */
var guildClockMesh = null;
if(typeof GUILD_CLOCKS !== 'undefined' && GUILD_CLOCKS && GUILD_CLOCKS.length){

  var guildClockHandGeo = new THREE.BoxGeometry(1,1,1).translate(0, 0.5, 0);
  guildClockMesh = new THREE.InstancedMesh(guildClockHandGeo,
    new THREE.MeshLambertMaterial({ color:0x2a2018 }), GUILD_CLOCKS.length*2);
  guildClockMesh.userData.inspectLabel = 'Guild clock';
  guildClockMesh.frustumCulled = false;
  scene.add(guildClockMesh);
}
var _gcM = new THREE.Matrix4(), _gcQ = new THREE.Quaternion(), _gcS = new THREE.Vector3(1,1,1), _gcP = new THREE.Vector3();
var _gcUp = new THREE.Vector3(0,1,0), _gcTangent = new THREE.Vector3(), _gcDir = new THREE.Vector3();
function updateGuildClock(){
  if(!guildClockMesh) return;
  var hour = dayNightHour();
  GUILD_CLOCKS.forEach(function(clk, ci){
    var ry = clk.ry || 0;

    _gcTangent.set(-Math.sin(ry), 0, -Math.cos(ry));

    _gcP.set(clk.x + Math.cos(ry)*0.16, clk.y, clk.z - Math.sin(ry)*0.16);

    var hands = [ { theta:(hour%12)/12*Math.PI*2, len:clk.r*0.58, w:0.16 },
                  { theta:(hour%1)*Math.PI*2,      len:clk.r*0.88, w:0.10 } ];
    hands.forEach(function(hd, i){
      _gcDir.copy(_gcUp).multiplyScalar(Math.cos(hd.theta)).addScaledVector(_gcTangent, Math.sin(hd.theta));
      _gcQ.setFromUnitVectors(_gcUp, _gcDir);
      _gcS.set(hd.w, hd.len, hd.w);
      _gcM.compose(_gcP, _gcQ, _gcS);
      guildClockMesh.setMatrixAt(ci*2+i, _gcM);
    });
  });
  guildClockMesh.instanceMatrix.needsUpdate = true;
}

/* ==== NIGHT ILLUMINATION DRIVER ==== */
var nlmStats = nlmBake();

var NWIN_ON0 = 17.2, NWIN_ONS = 4.0;                      /* first lamps ~17:12, last ~21:12 */
var NWIN_OFF0 = 20.8, NWIN_OFFS = 4.2, NWIN_OFFP = 1.6;   /* out 20:48..01:00, weighted early so "mostly by midnight" holds */
var NWIN_DAWN = 30.0;                                     /* 06:00 next day: the all-nighters finally blow out */

function nlWinT(hour){ return hour >= 12 ? hour : hour + 24; }
function nlWinLit(t, hA, hB, allNight){
  var on = NWIN_ON0 + NWIN_ONS*hA;
  var off = allNight ? NWIN_DAWN : (NWIN_OFF0 + NWIN_OFFS*Math.pow(hB, NWIN_OFFP));
  if(off < on + 0.4) off = on + 0.4;    /* nobody lights a lamp and blows it out in the same breath */
  return t >= on && t < off;
}

var nwMesh = null;
if(NL_WINDOWS.length){

  var nwTex = (function(){
    var c = document.createElement('canvas'); c.width = c.height = 32;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(16,16,0, 16,16,16);
    gr.addColorStop(0.00, 'rgba(255,255,255,1.00)');
    gr.addColorStop(0.40, 'rgba(255,250,236,0.80)');
    gr.addColorStop(0.74, 'rgba(255,232,192,0.28)');
    gr.addColorStop(1.00, 'rgba(255,222,172,0)');
    g.fillStyle = gr; g.fillRect(0,0,32,32);
    return new THREE.CanvasTexture(c);
  })();
  var nwMat = new THREE.MeshBasicMaterial({ map:nwTex, color:0xffffff, transparent:true, opacity:0,
    blending:THREE.AdditiveBlending, depthWrite:false, fog:false });
  nwMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1), nwMat, NL_WINDOWS.length);
  nwMesh.frustumCulled = false;
  nwMesh.userData.inspectLabel = 'Lit window';
  (function(){
    var m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    var up = new THREE.Vector3(0,1,0), black = new THREE.Color(0,0,0);
    NL_WINDOWS.forEach(function(W, i){
      p.set(W[0], W[1], W[2]);
      q.setFromAxisAngle(up, W[3]);

      s.set(W[4] < 0.6 ? 1.9 : W[4]*1.75, W[5]*1.8, W[6] < 0.6 ? 1.9 : W[6]*1.75);
      m.compose(p,q,s);
      nwMesh.setMatrixAt(i,m);

      nwMesh.setColorAt(i, black);
    });
    nwMesh.instanceColor.needsUpdate = true;
  })();
  scene.add(nwMesh);
}

var NW_LIT_N = 0, NW_LAST_KEY = -1;
var _nwCol = new THREE.Color();

function nlEclipseLit(ecl, hA){ return ecl > 0.42 && hA < (ecl - 0.42)*1.45; }
function nlUpdateWindows(hour, ecl){
  if(!nwMesh) return;
  ecl = ecl || 0;
  var key = Math.floor(hour*40) + 100000*Math.round(ecl*12);   /* re-roll 40x a game hour, and on any eclipse step */
  if(key === NW_LAST_KEY) return;
  NW_LAST_KEY = key;
  var t = nlWinT(hour), n = 0, N = NL_WINDOWS.length;
  for(var i=0;i<N;i++){
    var W = NL_WINDOWS[i];
    if(nlWinLit(t, W[7], W[8], W[9]) || nlEclipseLit(ecl, W[7])){

      var b = 0.85 + 0.70*W[7];
      _nwCol.setRGB(1.00*b, 0.58*b, 0.24*b);
      n++;
    }else{
      _nwCol.setRGB(0,0,0);                /* additive: black is genuinely off */
    }
    nwMesh.setColorAt(i, _nwCol);
  }
  nwMesh.instanceColor.needsUpdate = true;
  NW_LIT_N = n;

  NLM_U.uNlWin.value = n / N;
}

window._nightGlow = {
  lamps: nlmStats.lamps, windows: nlmStats.windows, res: nlmStats.res,
  peakLampPool: nlmStats.peakLampPool, peakWinPool: nlmStats.peakWinPool,

  green: nlmStats.green,
  greenList: function(){ return NL_GREEN; },
  greenUniform: function(){ return NLM_U.uNlG.value.map(function(v){ return [v.x,v.y,v.z,v.w]; }); },
  greenAmp: function(){ return NLM_U.uNlGAmp.value.slice(); },
  fortFlames: function(){ return FORT_FLAME_IDX.slice(); },
  allNightFrac: (function(){ var n=0; NL_WINDOWS.forEach(function(W){ if(W[9]) n++; });
                             return NL_WINDOWS.length ? n/NL_WINDOWS.length : 0; })(),
  litNow: function(){ return NW_LIT_N; },

  lampList: function(){ return NL_LAMPS; },
  winList: function(){ return NL_WINDOWS; },

  litFrac: function(h){
    var t = nlWinT(h), n = 0;
    for(var i=0;i<NL_WINDOWS.length;i++){ var W = NL_WINDOWS[i]; if(nlWinLit(t,W[7],W[8],W[9])) n++; }
    return NL_WINDOWS.length ? n/NL_WINDOWS.length : 0;
  }
};

var dnSlider = document.getElementById('dnSlider'), dnHourOut = document.getElementById('dnHourOut');
var dnDragging = false;
if(dnSlider){
  dnSlider.addEventListener('pointerdown', function(){ dnDragging = true; });
  ['pointerup','pointercancel'].forEach(function(ev){
    dnSlider.addEventListener(ev, function(){ dnDragging = false; });
  });
  dnSlider.addEventListener('input', function(){ skySetHour(parseFloat(dnSlider.value)); });
}
function dnFormatHour(h){
  var hh = Math.floor(h), mm = Math.floor((h-hh)*60);
  return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
}

(function dayNightLoop(){
  var last = performance.now();
  function tick(now){
    requestAnimationFrame(tick);
    var dt = Math.min(0.06, (now-last)/1000); last = now;
    updateDayNight();
    if(typeof updateWeather === 'function') updateWeather(dt);
    nlMat.opacity = 0.15 + 0.85*DAYNIGHT_NIGHT_K;

    NLM_U.uNlNight.value = DAYNIGHT_NIGHT_K;
    nlUpdateWindows(SKY_STATE.hour, SKY_STATE.ecl);
    if(nwMesh) nwMesh.material.opacity = Math.min(1, DAYNIGHT_NIGHT_K*1.5);

    for(var _lbi=0; _lbi<LANTERN_BOAT_N; _lbi++){
      nlTrack(LANTERN_BOAT_BASE+_lbi, LIFE_AVOID_X[_lbi], SEA+3.2, LIFE_AVOID_Z[_lbi]);
    }
    nlMesh.instanceMatrix.needsUpdate = true;

    if(TEMPLE_BRAZIER_IDX.length){
      var _tbHour = dayNightHour();
      var _tbLit = (_tbHour >= 12 || _tbHour < 6);
      if(_tbLit !== TEMPLE_BRAZIER_LIT){
        TEMPLE_BRAZIER_LIT = _tbLit;
        var _tbCol = _tbLit ? TEMPLE_BRAZIER_LIT_COL : TEMPLE_BRAZIER_OFF_COL;
        TEMPLE_BRAZIER_IDX.forEach(function(idx){ nlMesh.setColorAt(idx, _tbCol); });
        nlMesh.instanceColor.needsUpdate = true;
      }
    }
    if(lhBeamMesh){
      LH_SPIN_T += dt;
      lhBeamMesh.material.opacity = 0.22*DAYNIGHT_NIGHT_K;
      _lhP.set(0,0,0);
      LH_BEACONS.forEach(function(b){
        _lhP.set(b.x, b.y, b.z);
        for(var k=0;k<b.beams;k++){
          var ang = LH_SPIN_T*b.spin + k*(Math.PI*2/b.beams);
          _lhQ.setFromAxisAngle(LIFE_UP || new THREE.Vector3(0,1,0), ang);
          _lhM.compose(_lhP, _lhQ, _lhS);
          lhBeamMesh.setMatrixAt(b.slot0+k, _lhM);
        }
      });
      lhBeamMesh.instanceMatrix.needsUpdate = true;
    }
    updateGuildClock();
    if(dnSlider && !dnDragging){
      var h = dayNightHour();
      dnSlider.value = h;
      if(dnHourOut) dnHourOut.textContent = dnFormatHour(h);
    }else if(dnHourOut && dnSlider){
      dnHourOut.textContent = dnFormatHour(parseFloat(dnSlider.value));
    }
  }
  requestAnimationFrame(tick);
})();

window._dayNight = { hour: dayNightHour, nightLights: NIGHT_LIGHTS.length, secPerHour: DAYNIGHT_SEC_PER_HOUR,
  paused: function(){ return SKY.paused; }, setPaused: setDayNightPaused,
  brazierLit: function(){ return TEMPLE_BRAZIER_LIT; },
  dayOfYear: skyDayOfYear, setDay: skySetDayOfYear,

  nightK: function(){ return DAYNIGHT_NIGHT_K; },
  litWindows: function(){ return NW_LIT_N; },
  keyLight: function(){ return { i:+sun.intensity.toFixed(4),
                                 dir:[+SKY_STATE.keyDir.x.toFixed(3), +SKY_STATE.keyDir.y.toFixed(3), +SKY_STATE.keyDir.z.toFixed(3)],
                                 col:'#'+sun.color.getHexString(),
                                 hemi:+hemiLight.intensity.toFixed(4), amb:+ambLight.intensity.toFixed(4) }; },
  setHour: skySetHour };   /* diagnostic: jump the clock for headless verification */
