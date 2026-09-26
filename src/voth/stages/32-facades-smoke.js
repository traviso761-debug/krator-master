/* ==== 15b. FACADES ==== */
reseed(650001);

/* ==== tuning ==== */
var FACADE = {

  poorFrontWinChance : 0.68,   /* chance of a SECOND front window on a hovel  */
  winChanceUpper     : 0.55,   /* domed only: a second-row window higher up  */
  winChanceSide      : 0.70,
  poorSideWinChance  : 0.45,
  /* roofline */
  chimneyChance      : 0.35,
  /* awnings */
  awningChance       : 0.55,   /* on 'grand' non-poor buildings              */
  grandHeight        : 17,

  slumAdditionChance : 0.5,

  plasterCanopyChance      : 0.66,
  plasterSecondStoreyChance: 0.10,
  plasterSmokeChance       : 0.25,

  gateOffFrac        : 0.42
};

function bucketTotal(){ var n=0; for(var k in BUCKET) n += BUCKET[k].list.length; return n; }
var _facadeStart = bucketTotal();
var FJ = { town:0, other:0, compound:0 };

var PLASTER_STAT = { buildings:0, canopy:0, secondStorey:0, smoking:0 };

function plasterHash(x,z,salt){
  var v = Math.sin(x*12.9898 + z*78.233 + salt*37.719) * 43758.5453;
  return v - Math.floor(v);
}

/* ==== SMOKE PARTICLE SYSTEM ==== */

/* ==== tuning: the shared shape of a plume. Per-emitter flavour (rate, size, ==== */
var SMOKE = {
  steps     : 16,      /* colour-ramp LUT resolution per emitter            */
  windX     : 0.62,    /* the city's prevailing drift, per unit of lean     */
  windZ     : -0.38,
  riseEase  : 1.7,     /* >1: leaves the flue fast, bunches up as it cools  */
  growPow   : 0.5,     /* sqrt: swells quickly, then holds                  */
  birthRamp : 0.035,

  fadeStart : 0.64,    /* fraction of life after which it dissipates        */
  squash    : 0.82,    /* puffs are wider than they are tall                */
  tumble    : 0.22,    /* rad/sec of slow roll, so the facets never sit still */

  bloom     : 2.10,
  rateVar   : 0.34,    /* +/- fraction on an individual puff's climb rate   */
  /* defaults = a domestic house chimney; a forge overrides upward          */
  n:5, life:5.2, rise:9.0, r0:0.45, r1:1.9, spread:0.42, sway:0.45,
  swirl:0.9, lean:0.5, hotEnd:0, col:0x9a958c
};

var SMOKE_EMITTERS = SMOKE_EMITTERS || [];
var SMOKE_BASE = [], SMOKE_TOTAL = 0, SMOKE_DIRTY = false, SMOKE_T = 0;

var SMK_PH=null, SMK_CX=null, SMK_CZ=null, SMK_SZ=null, SMK_WB=null,
    SMK_RX=null, SMK_RY=null, SMK_RZ=null, SMK_SP=null;

function registerSmokeEmitter(x, y, z, opt){
  var e = { x:x, y:y, z:z, o: opt || {} };
  if(!SMOKE_EMITTERS) SMOKE_EMITTERS = [];
  SMOKE_EMITTERS.push(e);
  SMOKE_DIRTY = true;
  return e;
}

var smokeGeo = null, smokeMat = null, smokeMesh = null;
var _smkM = new THREE.Matrix4(), _smkQ = new THREE.Quaternion();
var _smkP = new THREE.Vector3(), _smkS = new THREE.Vector3();
var _smkE = new THREE.Euler(), _smkCol = new THREE.Color();
var _smkA = new THREE.Color(), _smkB = new THREE.Color();

function smkOpt(o,k,d){ return (o[k] === undefined) ? d : o[k]; }

function smokeRamp(e){
  var N = SMOKE.steps, lut = new Float32Array(N*3);
  for(var s=0;s<N;s++){
    var u = s/(N-1), t;
    if(e.hotEnd > 0 && u < e.hotEnd){ _smkA.set(e.colHot); _smkB.set(e.col); t = u/e.hotEnd; }
    else { _smkA.set(e.col); _smkB.set(e.colTop); t = (u-e.hotEnd)/(1-e.hotEnd); }
    _smkA.lerp(_smkB, t).convertSRGBToLinear();
    lut[s*3] = _smkA.r; lut[s*3+1] = _smkA.g; lut[s*3+2] = _smkA.b;
  }
  return lut;
}

function smokeRebuild(){
  SMOKE_DIRTY = false;
  if(smokeMesh){ scene.remove(smokeMesh); smokeMesh = null; }   /* geo/mat are shared — never disposed */
  SMOKE_BASE = []; SMOKE_TOTAL = 0;
  SMOKE_EMITTERS.forEach(function(e){
    var o = e.o;
    e.n      = Math.max(1, Math.round(smkOpt(o,'n',      SMOKE.n)));
    e.life   = Math.max(0.2,  smkOpt(o,'life',   SMOKE.life));
    e.rise   = smkOpt(o,'rise',   SMOKE.rise);
    e.r0     = smkOpt(o,'r0',     SMOKE.r0);
    e.r1     = smkOpt(o,'r1',     SMOKE.r1);
    e.spread = smkOpt(o,'spread', SMOKE.spread);
    e.sway   = smkOpt(o,'sway',   SMOKE.sway);
    e.swirl  = smkOpt(o,'swirl',  SMOKE.swirl);
    e.lean   = smkOpt(o,'lean',   SMOKE.lean);
    e.hotEnd = smkOpt(o,'hotEnd', SMOKE.hotEnd);
    e.col    = smkOpt(o,'col',    SMOKE.col);
    e.colHot = smkOpt(o,'colHot', e.col);
    e.colTop = smkOpt(o,'colTop', PAL.haze);
    e.phase  = smkOpt(o,'phase',  0);
    e.lut    = smokeRamp(e);
    SMOKE_BASE.push(SMOKE_TOTAL); SMOKE_TOTAL += e.n;
  });
  if(SMOKE_TOTAL === 0) return;
  SMK_PH = new Float32Array(SMOKE_TOTAL); SMK_CX = new Float32Array(SMOKE_TOTAL);
  SMK_CZ = new Float32Array(SMOKE_TOTAL); SMK_SZ = new Float32Array(SMOKE_TOTAL);
  SMK_WB = new Float32Array(SMOKE_TOTAL); SMK_RX = new Float32Array(SMOKE_TOTAL);
  SMK_RY = new Float32Array(SMOKE_TOTAL); SMK_RZ = new Float32Array(SMOKE_TOTAL);
  SMK_SP = new Float32Array(SMOKE_TOTAL);
  SMOKE_EMITTERS.forEach(function(e, ei){
    var base = SMOKE_BASE[ei];
    for(var i=0;i<e.n;i++){
      var k = base+i;

      SMK_PH[k] = (i/e.n + e.phase/(Math.PI*2) + plasterHash(e.x,e.z,i*1.7+3.1)*0.5/e.n) % 1;
      SMK_CX[k] = plasterHash(e.x,e.z,i*2.3+11.7)*2-1;
      SMK_CZ[k] = plasterHash(e.x,e.z,i*2.9+23.3)*2-1;
      SMK_SZ[k] = 0.78 + plasterHash(e.x,e.z,i*3.7+31.1)*0.48;
      SMK_WB[k] = plasterHash(e.x,e.z,i*4.1+41.9)*Math.PI*2;
      SMK_RX[k] = plasterHash(e.x,e.z,i*4.7+53.7)*Math.PI*2;
      SMK_RY[k] = plasterHash(e.x,e.z,i*5.3+61.3)*Math.PI*2;
      SMK_RZ[k] = plasterHash(e.x,e.z,i*5.9+73.1)*Math.PI*2;
      SMK_SP[k] = 1 + (plasterHash(e.x,e.z,i*6.7+83.9)*2-1)*SMOKE.rateVar;
    }
  });

  if(!smokeGeo) smokeGeo = new THREE.IcosahedronGeometry(1, 1);
  if(!smokeMat) smokeMat = new THREE.MeshLambertMaterial({ color:0xffffff });
  smokeMesh = new THREE.InstancedMesh(smokeGeo, smokeMat, SMOKE_TOTAL);
  smokeMesh.userData.inspectLabel = 'Smoke';
  smokeMesh.frustumCulled = false;      /* one mesh spanning the whole city */
  /* white-seed every slot before the mesh is ever rendered — traps 1 and 2 */
  _smkCol.setRGB(1,1,1);
  for(var s=0;s<SMOKE_TOTAL;s++) smokeMesh.setColorAt(s, _smkCol);
  scene.add(smokeMesh);
  _smokeStat.emitters = SMOKE_EMITTERS.length;
  _smokeStat.particles = SMOKE_TOTAL;
  _smokeStat.triangles = SMOKE_TOTAL*80;
  _smokeStat.drawCalls = 1;
  _smokeStat.byKind = {};
  SMOKE_EMITTERS.forEach(function(e){
    var kd = smkOpt(e.o,'kind','?');
    var b = _smokeStat.byKind[kd] || (_smokeStat.byKind[kd] = {n:0, puffs:0});
    b.n++; b.puffs += e.n;
  });
}

function updateSmoke(dt){
  SMOKE_T += dt;
  if(SMOKE_DIRTY) smokeRebuild();
  if(!smokeMesh) return;      /* dormant no-op while nothing has registered */
  var N1 = SMOKE.steps - 1;
  for(var ei=0; ei<SMOKE_EMITTERS.length; ei++){
    var e = SMOKE_EMITTERS[ei], base = SMOKE_BASE[ei], lut = e.lut, inv = 1/e.life;
    for(var i=0;i<e.n;i++){
      var k = base+i;
      var u = (SMOKE_T*inv*SMK_SP[k] + SMK_PH[k]) % 1;       /* age, 0..1; the modulo IS the recycle */
      var hh = e.rise * (1 - Math.pow(1-u, SMOKE.riseEase)); /* buoyant off the flue, slowing as it cools */
      var lean = u*u*e.rise*e.lean;                          /* the plume bends over as it drifts */
      var wob = Math.sin(SMOKE_T*e.swirl + SMK_WB[k]) * e.sway * u;
      var flare = e.spread*(1 + u*SMOKE.bloom);              /* the column widens into a cone as it cools */
      _smkP.set(e.x + SMK_CX[k]*flare + SMOKE.windX*lean + wob,
                e.y + hh,
                e.z + SMK_CZ[k]*flare + SMOKE.windZ*lean + wob*0.7);
      var rad = (e.r0 + (e.r1-e.r0)*Math.pow(u, SMOKE.growPow)) * SMK_SZ[k];
      var env = u < SMOKE.birthRamp ? u/SMOKE.birthRamp
              : (u > SMOKE.fadeStart ? 1-(u-SMOKE.fadeStart)/(1-SMOKE.fadeStart) : 1);
      rad *= env*env*(3-2*env);          /* smoothstepped in and out -> shrinks to nothing */
      _smkE.set(SMK_RX[k], SMK_RY[k] + SMOKE_T*SMOKE.tumble, SMK_RZ[k]);
      _smkQ.setFromEuler(_smkE);
      _smkS.set(rad, rad*SMOKE.squash, rad);
      _smkM.compose(_smkP, _smkQ, _smkS);
      smokeMesh.setMatrixAt(k, _smkM);
      var li = (u*N1)|0; if(li>N1) li = N1; li *= 3;
      smokeMesh.setColorAt(k, _smkCol.setRGB(lut[li], lut[li+1], lut[li+2]));
    }
  }
  smokeMesh.instanceMatrix.needsUpdate = true;
  if(smokeMesh.instanceColor) smokeMesh.instanceColor.needsUpdate = true;
}

(function smokeLoop(){
  var last = performance.now();
  function tick(now){
    requestAnimationFrame(tick);
    var dt = Math.min(0.06, (now-last)/1000); last = now;
    updateSmoke(dt);
  }
  requestAnimationFrame(tick);
})();

var _smokeStat = { emitters:0, particles:0, triangles:0, drawCalls:0, byKind:{} };
window._smoke = _smokeStat;

function wallWindow(x,z,ry,fx0,fz0,y,doorHalfW,winCol,sign,wMin,wMax,hMin,hMax){
  var ww = Math.min(rr(wMin,wMax), fz0*0.42);
  var minLat = doorHalfW + ww*0.5 + rr(0.35,1.0);
  var maxLat = fz0 - ww*0.5 - 0.25;
  if(maxLat < minLat) return false;
  var lat = sign*mix(minLat,maxLat,rr(0.15,0.85));
  var wp = loc(x,z, fx0+0.05, lat, ry);

  WINBOX(wp[0], y, wp[1], 0.4, rr(hMin,hMax), ww, ry, winCol);
  return true;
}

function doorAwning(x,z,ry,fx0,dw,dh,yb,doorCol){
  var steps = 3, outStep = 0.62, drop = 0.46, wLoss = 0.85;
  var outBase = fx0 + 0.85, topY = yb + dh - 0.10, wBase = dw + 1.9;
  var lastOutX = outBase, lastY = topY, lastW = wBase;
  for(var i=0;i<steps;i++){
    var outX = outBase + i*outStep;
    var yy = topY - i*drop;
    var ww = Math.max(0.9, wBase - i*wLoss);
    var p = loc(x,z, outX, 0, ry);
    FR8(p[0], yy, p[1], outStep+0.20, 0.28, ww, ry, pick(ROOFS), 'roof');
    lastOutX=outX; lastY=yy; lastW=ww;
    FJ.town++;
  }
  [-1,1].forEach(function(s){
    var pp = loc(x,z, lastOutX+0.35, s*lastW*0.42, ry);
    CYL(pp[0], yb, pp[1], 0.16, lastY-yb, 0, shade(doorCol,-0.1), 'wood');
    FJ.town++;
  });
}

function slumAddition(p){
  var x=p.x, z=p.z, ry=p.ry, fx0=p.fx0, fz0=p.fz0, yb=p.yb, h=p.h, col=p.col;
  var side = chance(0.5) ? 1 : -1;
  var extend = Math.min(rr(2.0,3.4), fx0*0.9);            /* how far it juts out */
  var lenX = Math.min(fx0*1.8, fx0*rr(1.0,1.6));           /* fraction of the wall it covers */
  var loY = yb + h*rr(0.40,0.54);
  var boxH = Math.min(h*rr(0.30,0.42), (yb+h*0.94) - loY);
  if(boxH < 1.2) return;                                   /* too small a building to bother */
  var hiY = loY + boxH;
  var mid = loc(x,z, rr(-0.10,0.10)*fx0, side*(fz0+extend*0.5), ry);
  /* the enclosed loft/storage box itself — same stone family as the house */
  BOX(mid[0], loY, mid[1], lenX, boxH, extend, ry, shade(col,-0.05));
  FJ.town++;

  var outerZ = side*(fz0+extend);
  [-1,1].forEach(function(sg){
    var sp = loc(x,z, sg*lenX*0.38, outerZ, ry);
    BOX(sp[0], yb, sp[1], 0.14, loY-yb, 0.14, 0, shade(col,-0.3), 'wood');
    FJ.town++;
  });

  var roofCol = pick(BANNERC);
  var rp = loc(x,z, rr(-0.06,0.06)*fx0, side*(extend*0.5), ry);
  FR8(rp[0], hiY, rp[1], lenX*1.05, boxH*0.22, extend+0.35, ry, roofCol, 'roof');
  FJ.town++;
}
