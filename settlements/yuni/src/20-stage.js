/* ============================== 4. STAGE ==============================
   Scene, renderer, lights and the BAKED horizon dome (layer 0 of the Krator
   sky, 21-sky.js). Ported from Voth's 20-stage.js; the Voth-specific ashen
   horizon is replaced by the humid jungle one: green-white haze, a band of
   distant canopy all the way round, and the great volcano far off across the
   Ring Sea to the NORTH-WEST (azimuth 315), blue with distance.
   Interface kept for the rest of the build:
     scene camera renderer FAST sun hemiLight ambLight                     */
reseed(200001);

var FAST = !!(navigator.webdriver) || /[?&]fast/.test(location.search);

var scene = new THREE.Scene();
window.scene = scene;

var HAZE = new THREE.Color(PAL.haze);
scene.fog = new THREE.FogExp2(HAZE.getHex(), PAL.fogDensity);
scene.background = HAZE.clone();            /* 21-sky.js moves this onto the sky scene */

var camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.8, 20000);
var renderer = new THREE.WebGLRenderer({ antialias:!FAST, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio||1, FAST?1:1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
if(!FAST){ renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
document.body.appendChild(renderer.domElement);
window.renderer = renderer;

/* --- lights. Direction/colour/intensity are driven every frame from
       SKY_STATE (82-daynight.js + 80-camera.js); these are the load values. */
var SUNDIR  = new THREE.Vector3(0.45, 0.72, -0.52).normalize();
var MOONDIR = new THREE.Vector3(-0.52, 0.40, 0.75).normalize();
var sun = new THREE.DirectionalLight(PAL.sunColor, PAL.sunIntensity);
sun.position.copy(SUNDIR).multiplyScalar(1900);
if(!FAST){
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096,4096);
  var _sc = sun.shadow.camera;
  _sc.left=-900; _sc.right=900; _sc.top=900; _sc.bottom=-900; _sc.near=200; _sc.far=4200;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.9;
}
scene.add(sun); scene.add(sun.target);
var hemiLight = new THREE.HemisphereLight(PAL.hemiSky, PAL.hemiGround, PAL.hemiIntensity);
scene.add(hemiLight);
var ambLight = new THREE.AmbientLight(PAL.ambient, PAL.ambientIntensity);
scene.add(ambLight);

/* ============================== 5. BAKED HORIZON DOME ==============================
   An equirectangular canvas round a sphere. SphereGeometry puts u at
   phi = 270 - azimuth (deg), so  u = ((270 - az)/360) mod 1 :
     north u=.75 · east u=.50 · NW (the volcano) u=.875 · the giant (az 67) u=.564.
   u=0/1 (the canvas edge) is due WEST; everything drawn wraps across it.
   1 degree of altitude = H/180 px. */
var STAGE_VOLC_AZ = 315;                 /* deg — across the Ring Sea, north-west */
var STAGE_FARBLUE = 0x93a9b8;            /* what hundreds of km of humid air does to rock */
var STAGE_CANOPY  = 0x24433c;            /* distant canopy, dark blue-green */
var STAGE_CANOPY2 = 0x3a5c55;            /* the ridge behind it, paler */

var VOLC_CFG = {
  idle  : { plumeSeed:991,    plumeN:60,  plumeAlphaK:1.0, plumeReach:1.0,  glow:0.00 },
  active: { plumeSeed:991031, plumeN:120, plumeAlphaK:1.5, plumeReach:1.35, glow:0.16 }
};

function makeSkyTexture(volc){
  var cfg = VOLC_CFG[volc] || VOLC_CFG.idle;
  var W=FAST?2048:4096, H=W/2, c=document.createElement('canvas'); c.width=W; c.height=H;
  var g=c.getContext('2d');
  var HZ = H*0.5, DEG = H/180;

  function rgbOf(hex){ return [(hex>>16)&255, (hex>>8)&255, hex&255]; }
  function css(col, a){ return 'rgba('+Math.round(col[0])+','+Math.round(col[1])+','+Math.round(col[2])+','+a+')'; }
  function mix3(a, b, t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }
  var HZC = rgbOf(PAL.haze), BLUE = rgbOf(STAGE_FARBLUE);
  var ZEN = rgbOf(PAL.sky.zenHazy), HOR = rgbOf(PAL.sky.horHazy);
  function hazeA(a){ return css(HZC, a); }

  /* vertical gradient: milky 1.9 atm zenith -> green-white haze at the horizon;
     below the horizon (seen past the world edge from high up) the same haze
     sinking into a dim forest-floor green */
  var grd=g.createLinearGradient(0,0,0,H);
  grd.addColorStop(0.00, css(mix3(ZEN,[92,122,160],0.45),1));
  grd.addColorStop(0.26, css(ZEN,1));
  grd.addColorStop(0.42, css(mix3(ZEN,HOR,0.7),1));
  grd.addColorStop(0.485,css(HOR,1));
  grd.addColorStop(0.50, css(mix3(HOR,HZC,0.55),1));
  grd.addColorStop(0.53, css(HZC,1));
  grd.addColorStop(0.62, css(mix3(HZC,[170,140,98],0.55),1));
  grd.addColorStop(1.00, css([120,98,70],1));
  g.fillStyle=grd; g.fillRect(0,0,W,H);

  /* everything wraps: drawn at x, x-W and x+W so nothing is clipped at the
     u=0/1 edge (a clipped band there is a vertical seam down the western sky) */
  function wrapEllipse(x, y, rx, ry){
    for(var w=-1; w<=1; w++){ g.beginPath(); g.ellipse(x + w*W, y, rx, ry, 0, 0, Math.PI*2); g.fill(); }
  }

  /* humid haze veils: long, very soft, pale streaks */
  reseed(4711);
  for(var i=0;i<12;i++){
    var y = HZ - rr(10, HZ*0.80), lw = rr(160, 620), h = rr(5, 18), x = rr(0, W);
    g.fillStyle='rgba(244,247,240,'+(0.03 + 0.07*rnd()).toFixed(3)+')';
    wrapEllipse(x, y, lw, h);
  }
  /* cumulus: flat-based heaps of overlapping puffs, small and crowded toward
     the horizon (perspective), bigger and sparser overhead */
  for(var ci=0; ci<22; ci++){
    var t = Math.pow(rnd(), 1.7);                          /* 0 near the horizon .. 1 high */
    var cy = HZ - (5 + t*62)*DEG, cx = rr(0, W);
    var sc = 0.45 + 1.9*t + rr(0,0.5);
    var cw = rr(34, 90)*sc, ch = cw*rr(0.16, 0.30);
    var ca = (0.20 + 0.34*rnd())*(1 - 0.35*t);
    var nP = 7 + ri(0,6);
    /* shaded underside first */
    g.fillStyle='rgba(150,164,172,'+(ca*0.55).toFixed(3)+')';
    wrapEllipse(cx, cy + ch*0.10, cw*0.92, ch*0.34);
    for(var p=0;p<nP;p++){
      var px = cx + rr(-1,1)*cw*0.78, k = 1 - Math.abs(px-cx)/cw;
      var pr = ch*(0.45 + 0.75*k)*rr(0.75,1.2);
      g.fillStyle='rgba(250,250,244,'+(ca*rr(0.55,1.0)).toFixed(3)+')';
      wrapEllipse(px, cy - pr*0.55, pr*1.5, pr);
    }
  }

  /* ---- the Outer Wall Mountains, all the way round -------------------------
     Yuni lies in a side valley of the crater's outer rim, in the far south-east.
     Three painted ranks stand behind the modelled valley walls: the airless rim
     peaks (colossal to the S and E, where the rim itself runs), a blue middle
     range, and the near walls. Every rank sinks to almost nothing round azimuth
     45 — the valley mouth, open to the north-east, where the desert haze shows
     and the giant hangs above it. Heights come from noise sampled ON A CIRCLE so
     each band meets itself at the canvas edge. */
  function azOf(x){ return (((270 - (x/W)*360) % 360) + 360) % 360; }
  function angD(a,b){ var d=Math.abs(a-b)%360; return d>180?360-d:d; }
  var MOUTH_AZ = 315;                                                                   /* the valley opens to the NORTH-WEST */
  function mouth(az, width){ return smooth(width*0.35, width, angD(az, MOUTH_AZ)); }     /* 0 in the gap, 1 away from it */
  function rangeH(az, R, so, ridged){
    var an=az*Math.PI/180, cx=Math.cos(an), sz=Math.sin(an);
    var n = fbm(so + cx*R, so + sz*R), n2 = fbm(so*3 + cx*R*3.1, so*3 + sz*R*3.1), n3 = vn(so*7 + cx*R*11, so*7 + sz*R*11);
    var v = 0.62*n + 0.28*n2 + 0.10*n3; return ridged ? 1-Math.abs(2*v-1)*0.9 : v;
  }
  function drawRange(heightFn, fillTop, fillBase, snowAlt, snowCol){
    var ys=[]; for(var x=0;x<=W;x+=2) ys.push(HZ - heightFn(azOf(x))*DEG);
    function trace(){ g.beginPath(); g.moveTo(0,HZ+12); for(var k=0;k<ys.length;k++) g.lineTo(k*2, ys[k]); g.lineTo(W,HZ+12); g.closePath(); }
    var top=Math.min.apply(null, ys), gr=g.createLinearGradient(0,top,0,HZ+6); gr.addColorStop(0,fillTop); gr.addColorStop(1,fillBase);
    g.fillStyle=gr; trace(); g.fill();
    /* light from the north: brighten slopes whose silhouette falls toward the sun side, darken the others */
    g.save(); trace(); g.clip();
    for(var k2=2;k2<ys.length-2;k2+=1){ var sl=ys[k2+2]-ys[k2-2]; g.fillStyle = sl>0 ? 'rgba(255,250,235,'+Math.min(0.20,sl*0.035).toFixed(3)+')' : 'rgba(20,28,48,'+Math.min(0.22,-sl*0.035).toFixed(3)+')';
      g.fillRect(k2*2, ys[k2], 2, (HZ-ys[k2])*0.55); }
    if(snowAlt!=null){ g.fillStyle=snowCol; for(var k3=0;k3<ys.length;k3++){ var lim=HZ-(snowAlt + 1.2*vn(k3*0.05,3.3))*DEG; if(ys[k3] < lim){ g.fillRect(k3*2, ys[k3], 2, (lim-ys[k3])*(0.55+0.45*vn(k3*0.21,9.1))); } } }
    g.restore();
  }
  var HC = PAL.horizon;
  /* 1. the rim: airless peaks, highest to the south-east (azimuth ~150), glaciated shoulders */
  drawRange(function(az){ var env = 0.35 + 0.65*Math.pow(Math.max(0, Math.cos((az-135)*Math.PI/360)), 2.0);   /* highest at the SE head, opposite the mouth */
      return (5.5 + 15.5*env*rangeH(az, 4.6, 11.3, true)) * (0.12 + 0.88*mouth(az, 34)); },
    css(mix3(rgbOf(HC.rim), ZEN, 0.30), 1), css(mix3(rgbOf(HC.far), HZC, 0.55), 1), 9.5, 'rgba(244,247,250,0.85)');
  /* 2. the middle range */
  drawRange(function(az){ return (3.8 + 7.5*rangeH(az, 6.4, 27.9, true)) * (0.10 + 0.90*mouth(az, 30)); },
    css(mix3(rgbOf(HC.mid), HZC, 0.25), 1), css(mix3(rgbOf(HC.mid), HZC, 0.62), 1), 8.6, 'rgba(240,244,248,0.55)');
  /* haze between the ranks */
  var hz1=g.createLinearGradient(0,HZ-9*DEG,0,HZ+6); hz1.addColorStop(0,hazeA(0)); hz1.addColorStop(1,hazeA(0.50)); g.fillStyle=hz1; g.fillRect(0,HZ-9*DEG,W,9*DEG+6);
  /* 3. the near valley walls, the colour the modelled terrain fades to */
  drawRange(function(az){ return (2.2 + 5.2*rangeH(az, 8.2, 41.7, false)) * (0.06 + 0.94*mouth(az, 26)); },
    css(mix3(rgbOf(HC.near), HZC, 0.30), 1), css(mix3(rgbOf(HC.nearDark), HZC, 0.55), 1), null, null);
  /* the mouth: a strip of pale desert under the haze */
  (function(){ var mx = W*((((270-MOUTH_AZ)/360 % 1)+1)%1), gw=W*0.10; var dg=g.createRadialGradient(mx,HZ+2,4,mx,HZ+2,gw);
    dg.addColorStop(0, css(rgbOf(HC.desert),0.75)); dg.addColorStop(1, css(rgbOf(HC.desert),0)); g.fillStyle=dg; g.fillRect(mx-gw,HZ-1.2*DEG,2*gw,1.2*DEG+10); })();
  /* ground haze at the foot of everything, and the seam with the world edge */
  var gm=g.createLinearGradient(0,HZ-1.6*DEG,0,HZ+12);
  gm.addColorStop(0, hazeA(0)); gm.addColorStop(0.45, hazeA(0.34)); gm.addColorStop(1, hazeA(0.95));
  g.fillStyle=gm; g.fillRect(0,HZ-1.6*DEG,W,1.6*DEG+12);

  var tex=new THREE.CanvasTexture(c);
  tex.encoding=THREE.sRGBEncoding;
  return tex;
}

var volcTex = (function(){ var t=makeSkyTexture('idle'); return { idle:t, active:t }; })();

var skyMesh = new THREE.Mesh(
  new THREE.SphereGeometry(11000, 54, 34),
  new THREE.MeshBasicMaterial({ map:volcTex.idle, side:THREE.BackSide, fog:false, depthWrite:false })
);
skyMesh.renderOrder = -10;
scene.add(skyMesh);                        /* 21-sky.js moves it into the background scene */

/* --- sun glare and the two small moons (sprites; 21-sky.js adopts them) --- */
function discTexture(inner, outer, rays){
  var S=256, c=document.createElement('canvas'); c.width=c.height=S;
  var g=c.getContext('2d');
  var grd=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  grd.addColorStop(0.00,inner); grd.addColorStop(0.26,inner);
  grd.addColorStop(0.34,outer); grd.addColorStop(1.00,'rgba(255,255,255,0)');
  g.fillStyle=grd; g.fillRect(0,0,S,S);
  if(rays){
    g.globalAlpha=0.30;
    for(var i=0;i<rays;i++){
      var a=i/rays*Math.PI*2;
      g.strokeStyle=outer; g.lineWidth=3;
      g.beginPath(); g.moveTo(S/2+Math.cos(a)*30,S/2+Math.sin(a)*30);
      g.lineTo(S/2+Math.cos(a)*118,S/2+Math.sin(a)*118); g.stroke();
    }
    g.globalAlpha=1;
  }
  return new THREE.CanvasTexture(c);
}
function makeDisc(dir, size, inner, outer, rays){
  var s=new THREE.Sprite(new THREE.SpriteMaterial({
    map:discTexture(inner,outer,rays), fog:false, depthWrite:false, depthTest:false,
    transparent:true, blending:THREE.AdditiveBlending
  }));
  s.scale.set(size,size,1); s.renderOrder=-9; s.userData.dir=dir.clone(); scene.add(s); return s;
}
var sunSprite  = makeDisc(SUNDIR, 300, 'rgba(255,250,228,0.98)', 'rgba(255,224,164,0.42)', 18);
var moonSprite = makeDisc(MOONDIR, 150, 'rgba(232,236,246,0.70)', 'rgba(196,206,226,0.16)', 0);
var moon2 = makeDisc(new THREE.Vector3(-0.80,0.19,0.30).normalize(), 76,
                     'rgba(238,214,206,0.42)', 'rgba(206,176,168,0.10)', 0);

/* ============================== 6. ERUPTION CYCLE ======================
   Simplified from Voth: the volcano is too far away for drama. It always
   smokes; now and then (about a fifth of the time) the plume thickens and
   the summit glows faintly. A texture-pointer swap between two bakes —
   free at render time. (Both bakes are the same 'idle' paint today, so
   nothing visible changes yet.)
   The cycle is core/sched's KSCHED.eruption, a pure function of the world
   clock's MOTION time (YCLOCK.t, 21-sky.js): active 9 s in every 45 s (a
   fifth of the time), opening idle. It used to be Math.random() and
   setTimeout, which no export or port could replay. VOLCANO_FORCE
   ('idle' | 'active') pins it. */
var VOLCANO_FORCE = null;
var VOLCANO_CYCLE = KSCHED.eruption({ interval:45, duration:9, phase:9 });
var VOLCANO_STATE = null;
TICKS.push(function(){
  var st = VOLCANO_FORCE || (VOLCANO_CYCLE.at(YCLOCK.t).on ? 'active' : 'idle');
  if(st === VOLCANO_STATE) return;
  VOLCANO_STATE = st;
  skyMesh.material.map = volcTex[st] || volcTex.idle;
  skyMesh.material.needsUpdate = true;
});
window._volcano = { state:function(){ return VOLCANO_STATE; }, at:function(t){ return VOLCANO_CYCLE.at(t); },
                    force:function(s){ VOLCANO_FORCE = s || null; }, export:VOLCANO_CYCLE.export };
