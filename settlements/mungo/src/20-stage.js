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

  /* ---- MUNGO (2026-10): the same painted abyss as Locus, re-proportioned for Mungo's place on the floor.
     The EAST rim rises IN THE DISTANCE (lower than Locus's close shelf); in the WEST the opposite RIM
     stands clear across the lake, with the SALT FLATS much farther west as a pale glare along its crest;
     north and south the open floor runs out to a low hazy rim. Locus's own description follows. ------
     ---- LOCUS: the abyssal shelf, all the way round, and the lake to the west ------------------
     Locus lies on the floor of an abyss, on the EAST shore of its salt lake. The shelf — the
     basin's wall — rings the horizon: close and high in the EAST (the ground rises toward it
     through the marsh and the jungle), lower and bluer to the north and south, and in the WEST
     only a far thin line of it over the lake, with the opposite shore a darker strip at its foot
     and the red water running out to meet them. u = ((270 - az)/360) mod 1: east u=.5, west u=0/1. */
  function azOf(x){ return (((270 - (x/W)*360) % 360) + 360) % 360; }
  function angD(a,b){ var d=Math.abs(a-b)%360; return d>180?360-d:d; }
  function rangeH(az, R, so, ridged){
    var an=az*Math.PI/180, cx=Math.cos(an), sz=Math.sin(an);
    var n = nfb(so + cx*R, so + sz*R), n2 = nfb(so*3 + cx*R*3.1, so*3 + sz*R*3.1), n3 = vn(so*7 + cx*R*11, so*7 + sz*R*11);
    var v = 0.62*n + 0.28*n2 + 0.10*n3*2; return ridged ? 1-Math.abs(2*v-1)*0.9 : v; }
  var SIL=[]; for(var xs=0;xs<=W;xs+=2) SIL.push(HZ);   /* the cliff's skyline (min y over the ranges): the occluder mask below */
  function drawRange(heightFn, fillTop, fillBase, strata){
    var ys=[]; for(var x=0;x<=W;x+=2) ys.push(HZ - heightFn(azOf(x))*DEG);
    for(var ks=0;ks<ys.length;ks++) if(ys[ks]<SIL[ks]) SIL[ks]=ys[ks];
    function trace(){ g.beginPath(); g.moveTo(0,HZ+12); for(var k=0;k<ys.length;k++) g.lineTo(k*2, ys[k]); g.lineTo(W,HZ+12); g.closePath(); }
    var top=Math.min.apply(null, ys), gr=g.createLinearGradient(0,top,0,HZ+6); gr.addColorStop(0,fillTop); gr.addColorStop(1,fillBase);
    g.fillStyle=gr; trace(); g.fill();
    g.save(); trace(); g.clip();
    for(var k2=2;k2<ys.length-2;k2+=1){ var sl=ys[k2+2]-ys[k2-2]; g.fillStyle = sl>0 ? 'rgba(255,248,232,'+Math.min(0.16,sl*0.03).toFixed(3)+')' : 'rgba(24,30,34,'+Math.min(0.20,-sl*0.03).toFixed(3)+')';
      g.fillRect(k2*2, ys[k2], 2, (HZ-ys[k2])*0.5); }
    if(strata){ reseed(9127); for(var q=0;q<1400;q++){ var xx=rnd()*W, az=azOf(xx), e=strata(az); if(rnd()>e) continue; var yTop=HZ-heightFn(az)*DEG, yy=mix(yTop, HZ, rnd());
        g.strokeStyle='rgba('+(rnd()<0.55?'44,50,52':'150,156,150')+','+(0.08+rnd()*0.18).toFixed(2)+')'; g.lineWidth=1+rnd()*1.5; g.beginPath(); g.moveTo(xx,yy); g.lineTo(xx+rr(-90,90),yy+rr(-1.5,1.5)); g.stroke();
        if(rnd()<0.05){ g.strokeStyle='rgba(40,46,48,0.14)'; g.lineWidth=rr(1.5,3); g.beginPath(); g.moveTo(xx,yTop+3); g.lineTo(xx+rr(-6,6),mix(yTop,HZ,rr(0.15,0.4))); g.stroke(); } }
      for(var x3=0;x3<=W;x3+=2){ var az3=azOf(x3), e3=strata(az3), t3=HZ-heightFn(az3)*DEG; g.fillStyle='rgba(226,220,204,'+(0.30*e3).toFixed(2)+')'; g.fillRect(x3,t3,2,2+e3*5);
        g.fillStyle='rgba(30,36,38,'+(0.22*e3).toFixed(2)+')'; g.fillRect(x3,t3+4+e3*5,2,5+e3*8); } }
    g.restore();
  }
  var HC = PAL.horizon;
  function eastK(az){ return Math.pow(Math.max(0, Math.cos((az-95)*Math.PI/180)), 1.4); }
  function westK(az){ return smooth(55, 20, angD(az, 268)); }
  /* 1. the far rim, all round: a degree or two, mostly haze */
  drawRange(function(az){ return (1.5 + 1.2*rangeH(az, 5.2, 13.7, true)) * (1-0.30*westK(az)); },
    css(mix3(rgbOf(HC.far), HZC, 0.45), 1), css(mix3(rgbOf(HC.rim), HZC, 0.75), 1), null);
  /* 2. the shelf proper: high and close in the east, falling away north and south, absent over the lake */
  drawRange(function(az){ var e=eastK(az); return (0.5 + 6.2*e + 1.8*e*rangeH(az, 7.4, 29.1, false)) * (1-westK(az)); },
    css(mix3([88,98,100], HZC, 0.18), 1), css(mix3([112,122,116], HZC, 0.40), 1), eastK);
  var hz1=g.createLinearGradient(0,HZ-6*DEG,0,HZ+6); hz1.addColorStop(0,hazeA(0)); hz1.addColorStop(1,hazeA(0.45)); g.fillStyle=hz1; g.fillRect(0,HZ-6*DEG,W,6*DEG+6);
  /* 2b. MUNGO: the WESTERN RIM across the lake: a cliff band, bluer for its distance, strata on its face */
  drawRange(function(az){ var k=westK(az); return (2.1 + 1.1*rangeH(az, 9.1, 61.7, false)) * k; },
    css(mix3([96,112,124], HZC, 0.38), 1), css(mix3([120,132,136], HZC, 0.62), 1), function(az){ return 0.7*westK(az); });
  /* 2c. ... and the SALT FLATS far beyond it: a pale glare along the crest, brightest where the rim is lowest */
  (function(){ for(var x=0;x<=W;x+=2){ var az=azOf(x), k=westK(az); if(k<=0.02) continue;
      var top=(2.1 + 1.1*rangeH(az, 9.1, 61.7, false))*k, gl=(0.55+0.45*vn(x*0.011, 4.3))*k;
      var gr2=g.createLinearGradient(0, HZ-(top+1.1)*DEG, 0, HZ-top*DEG+1); gr2.addColorStop(0, css([246,244,236], 0)); gr2.addColorStop(1, css([246,242,230], 0.55*gl));
      g.fillStyle=gr2; g.fillRect(x, HZ-(top+1.1)*DEG, 2, 1.1*DEG+1); } })();
  /* 3. the far shore of the lake, in the west: a dark strip at the waterline, a few pale salt flats on it */
  (function(){ for(var x=0;x<=W;x+=2){ var az=azOf(x), k=westK(az); if(k<=0.01) continue;
      var hh=(0.22 + 0.25*rangeH(az, 14, 51.3, false))*k; g.fillStyle=css(mix3([70,74,60], HZC, 0.55), 0.9*k); g.fillRect(x, HZ-hh*DEG, 2, hh*DEG+1.5);
      if(vn(x*0.02,3.1) > 0.34){ g.fillStyle=css(mix3([232,226,212], HZC, 0.4), 0.55*k); g.fillRect(x, HZ-hh*DEG*0.45, 2, 1.2); } } })();
  /* the jungle's far canopy on the rising ground east, a band of dark green at the foot of the wall */
  (function(){ for(var x=0;x<=W;x+=2){ var az=azOf(x), e=eastK(az)*(1-westK(az)); if(e<=0.02) continue; var hh=(0.4+0.9*vn(x*0.05,7.7))*e;
      g.fillStyle=css(mix3([52,74,58], HZC, 0.45), 0.85); g.fillRect(x, HZ-hh*DEG, 2, hh*DEG+2); } })();
  var gm=g.createLinearGradient(0,HZ-1.4*DEG,0,HZ+12);
  gm.addColorStop(0, hazeA(0)); gm.addColorStop(0.5, hazeA(0.30)); gm.addColorStop(1, hazeA(0.95));
  g.fillStyle=gm; g.fillRect(0,HZ-1.4*DEG,W,1.4*DEG+12);

  var tex=new THREE.CanvasTexture(c);
  tex.encoding=THREE.sRGBEncoding;
  /* LOCUS: the shelf's SILHOUETTE as an alpha mask (white = cliff or below the horizon). 21-sky.js draws
     the dome a second time through it AFTER the sun, the giant, its ring and the stars, so the painted
     cliff occludes them instead of their being drawn over it. Half-res is plenty: linear filtering
     gives a one-texel soft edge. */
  var mc=document.createElement('canvas'); mc.width=W/2; mc.height=H/2; var mg=mc.getContext('2d');
  mg.fillStyle='#000'; mg.fillRect(0,0,W/2,H/2); mg.fillStyle='#fff';
  mg.beginPath(); mg.moveTo(0,H/2); for(var km=0;km<SIL.length;km++) mg.lineTo(km, (SIL[km]-1.0)/2); mg.lineTo(W/2,H/2); mg.closePath(); mg.fill();
  tex.silMask = new THREE.CanvasTexture(mc);
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
   free at render time. Runtime behaviour, so Math.random(), not rnd(). */
var VOLCANO_FORCE = null;
(function volcanoCycle(){
  function tick(){
    var st = VOLCANO_FORCE || (Math.random() < 0.22 ? 'active' : 'idle');
    skyMesh.material.map = volcTex[st] || volcTex.idle;
    skyMesh.material.needsUpdate = true;
    setTimeout(tick, st === 'active' ? 6000 + Math.random()*6000 : 12000 + Math.random()*20000);
  }
  tick();
})();
