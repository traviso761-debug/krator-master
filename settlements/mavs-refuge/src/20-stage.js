/* ============================== 4. STAGE ==============================
   Scene, renderer, lights and the BAKED horizon dome (layer 0 of the Krator
   sky, 21-sky.js). Ported from Voth's 20-stage.js; the Voth-specific ashen
   horizon is replaced by the humid jungle one: green-white haze, a band of
   distant canopy all the way round, and the great volcano far off across the
   Ring Sea to the SOUTH-WEST (azimuth 225), blue with distance.
   Interface kept for the rest of the build:
     scene camera renderer FAST sun hemiLight ambLight                     */
reseed(200001);

var FAST = !!(navigator.webdriver) || /[?&]fast/.test(location.search);

var scene = new THREE.Scene();
window.scene = scene;

var HAZE = new THREE.Color(PAL.haze);
scene.fog = new THREE.FogExp2(HAZE.getHex(), PAL.fogDensity);
scene.background = HAZE.clone();            /* 21-sky.js moves this onto the sky scene */

var camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.8, 16000);
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
  _sc.left=-620; _sc.right=620; _sc.top=620; _sc.bottom=-620; _sc.near=200; _sc.far=4200;
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
     north u=.75 · east u=.50 · SW (the volcano) u=.125 · the giant (az 67) u=.564.
   u=0/1 (the canvas edge) is due WEST; everything drawn wraps across it.
   1 degree of altitude = H/180 px. */
var STAGE_VOLC_AZ = 225;                 /* deg — across the Ring Sea, south-west (the city is on its NE shore) */
/* the westerlies carry the plume north-east; seen from here it drifts sideways by the sine of the
   angle between that and the line of sight (1 for a volcano in the NW, 0 for one in the SW, where the
   ash blows toward the viewer and the column just rises and spreads) */
var STAGE_PLUME_LEAN = Math.sin((45 - STAGE_VOLC_AZ)*Math.PI/180);
var STAGE_FARBLUE = 0x93a9b8;            /* what hundreds of km of humid air does to rock */
var STAGE_CANOPY  = 0x24433c;            /* distant canopy, dark blue-green */
var STAGE_CANOPY2 = 0x3a5c55;            /* the ridge behind it, paler */

var VOLC_CFG = {
  idle  : { plumeSeed:991,    plumeN:60,  plumeAlphaK:1.0, plumeReach:1.0,  glow:0.00 },
  active: { plumeSeed:991031, plumeN:120, plumeAlphaK:1.5, plumeReach:1.35, glow:0.16 }
};

function makeSkyTexture(volc){
  var cfg = VOLC_CFG[volc] || VOLC_CFG.idle;
  var W=2048, H=1024, c=document.createElement('canvas'); c.width=W; c.height=H;
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
  grd.addColorStop(0.62, css(mix3(HZC,[70,96,80],0.55),1));
  grd.addColorStop(1.00, css([52,72,62],1));
  g.fillStyle=grd; g.fillRect(0,0,W,H);

  /* everything wraps: drawn at x, x-W and x+W so nothing is clipped at the
     u=0/1 edge (a clipped band there is a vertical seam down the western sky) */
  function wrapEllipse(x, y, rx, ry){
    for(var w=-1; w<=1; w++){ g.beginPath(); g.ellipse(x + w*W, y, rx, ry, 0, 0, Math.PI*2); g.fill(); }
  }

  /* humid haze veils: long, very soft, pale streaks */
  reseed(4711);
  for(var i=0;i<26;i++){
    var y = HZ - rr(10, HZ*0.80), lw = rr(160, 620), h = rr(5, 18), x = rr(0, W);
    g.fillStyle='rgba(244,247,240,'+(0.03 + 0.07*rnd()).toFixed(3)+')';
    wrapEllipse(x, y, lw, h);
  }
  /* cumulus: flat-based heaps of overlapping puffs, small and crowded toward
     the horizon (perspective), bigger and sparser overhead */
  for(var ci=0; ci<64; ci++){
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

  /* ---- the great volcano, SW across the Ring Sea -------------------------
     A broad shield with a truncated summit, ~5.5 deg tall. It is the farthest
     thing in the world, seen through hundreds of km of wet air: every fill is
     mixed hard toward the blue distance colour and then toward the haze. */
  /* drawn twice (x and x-W): its outlying ranges and veil reach past the canvas edge */
  function drawVolcano(){
  var vx = W*(((270 - STAGE_VOLC_AZ)/360 % 1 + 1) % 1), base = HZ + 4;
  var vh = 5.6*DEG, vw = 150;
  var ROCK = [96,104,120];
  function far(col, t, a){ return css(mix3(mix3(col, BLUE, t), HZC, 0.22), a); }
  function jagPts(x0,y0,x1,y1,n,amp,zo){
    var pts=[];
    for(var i=1;i<n;i++){
      var t=i/n, x=x0+(x1-x0)*t, y=y0+(y1-y0)*t;
      pts.push([x, y - sig(t*5.4+zo, zo*2.3-t, 1)*amp*Math.sin(t*Math.PI)]);
    }
    return pts;
  }
  function path(pts){ for(var i=0;i<pts.length;i++) g.lineTo(pts[i][0],pts[i][1]); }
  function ridge(cx, halfw, height, col){
    g.fillStyle=col; g.beginPath(); g.moveTo(cx-halfw, base);
    for(var k=0;k<=40;k++){
      var t=k/40, prof=1-Math.pow(Math.abs(t*2-1),1.6);
      g.lineTo(cx-halfw+2*halfw*t, base-height*prof - 2.0*Math.sin(t*19.7)*prof - 1.5*Math.sin(t*8.1+1.4)*prof);
    }
    g.lineTo(cx+halfw, base); g.closePath(); g.fill();
  }
  /* the far shore's coastal ranges, barely there */
  ridge(vx-330, 260, 2.2*DEG, far(ROCK, 0.70, 0.42));
  ridge(vx+300, 300, 2.6*DEG, far(ROCK, 0.70, 0.42));
  ridge(vx-110, 230, 3.0*DEG, far(ROCK, 0.62, 0.46));
  /* shield profile: long concave flanks steepening to a flat, slightly notched summit */
  var apexY = base - vh;
  var westRim = [vx-15, apexY], floorP = [vx-2, apexY+3.5], eastRim = [vx+13, apexY+2];
  function flank(x0, x1, y1, zo){
    /* concave: height ~ t^1.7 along the flank */
    var pts=[];
    for(var i=0;i<=14;i++){
      var t=i/14, x=x0+(x1-x0)*t, y=base+(y1-base)*Math.pow(t,1.75);
      pts.push([x, y - sig(t*4.1+zo, zo, 1)*2.2*Math.sin(t*Math.PI)]);
    }
    return pts;
  }
  var westFlank = flank(vx-vw, westRim[0], westRim[1], 0.6);
  var eastFlank = flank(vx+vw*1.08, eastRim[0], eastRim[1], 2.1).reverse();
  function traceMountain(){
    g.moveTo(vx-vw, base); path(westFlank);
    g.lineTo(westRim[0],westRim[1]); g.lineTo(floorP[0],floorP[1]); g.lineTo(eastRim[0],eastRim[1]);
    path(eastFlank); g.lineTo(vx+vw*1.08, base);
  }
  g.fillStyle = far(ROCK, 0.50, 0.66);
  g.beginPath(); traceMountain(); g.closePath(); g.fill();
  /* a paler, sunlit flank on the north side, to the viewer's right (the sun lives in the north here) */
  g.save(); g.beginPath(); traceMountain(); g.closePath(); g.clip();
  var fl = g.createLinearGradient(vx-10, 0, vx+vw, 0);
  fl.addColorStop(0, 'rgba(226,232,236,0)'); fl.addColorStop(0.35, 'rgba(226,232,236,0.20)'); fl.addColorStop(1, 'rgba(226,232,236,0.04)');
  g.fillStyle = fl; g.fillRect(vx-10, apexY-2, vw+20, vh+8);
  /* faint summit glow in the active state, clipped to the silhouette */
  if(cfg.glow > 0){
    var lg = g.createRadialGradient(floorP[0], floorP[1], 1, floorP[0], floorP[1], 16);
    lg.addColorStop(0, 'rgba(255,170,110,'+cfg.glow+')'); lg.addColorStop(1, 'rgba(255,170,110,0)');
    g.fillStyle = lg; g.fillRect(floorP[0]-18, floorP[1]-18, 36, 36);
  }
  g.restore();
  /* plume: a faint streamer leaning downwind (the westerlies blow it toward
     the north-east; STAGE_PLUME_LEAN turns that into a sideways drift) */
  reseed(cfg.plumeSeed);
  for(var pp=0; pp<cfg.plumeN; pp++){
    var t2 = pp/cfg.plumeN;
    var ppx = floorP[0] + t2*t2*140*cfg.plumeReach*STAGE_PLUME_LEAN + rr(-9,9)*(0.25+t2)*cfg.plumeReach;
    var ppy = floorP[1] - 3 - t2*44*cfg.plumeReach - rr(0,7);
    var ppr = 4 + t2*24 + rr(0,6);
    g.fillStyle = css(mix3([214,216,214], HZC, 0.3+0.5*t2), (0.030*cfg.plumeAlphaK*(1-t2*0.7)).toFixed(3));
    g.beginPath(); g.arc(ppx, ppy, ppr, 0, Math.PI*2); g.fill();
  }
  /* veil over the whole massif, heaviest at its foot */
  var vv = g.createLinearGradient(0, apexY-10, 0, base);
  vv.addColorStop(0, hazeA(0.04)); vv.addColorStop(1, hazeA(0.62));
  g.fillStyle = vv; g.fillRect(vx-vw-620, apexY-10, 2*(vw+620), base-apexY+10);
  }
  for(var vwrap=0; vwrap<2; vwrap++){ g.save(); g.translate(-vwrap*W, 0); drawVolcano(); g.restore(); }

  /* haze bank all along the horizon */
  var hz=g.createLinearGradient(0,HZ-64,0,HZ+24);
  hz.addColorStop(0, hazeA(0)); hz.addColorStop(0.6, hazeA(0.42)); hz.addColorStop(1, hazeA(0.80));
  g.fillStyle=hz; g.fillRect(0,HZ-64,W,88);

  /* ---- distant jungle canopy, all the way round --------------------------
     Heights come from noise sampled ON A CIRCLE, so the band is periodic in
     u and meets itself at the canvas edge. Two ranks: a paler ridge behind
     (up to ~2.5 deg, with the odd emergent hypertree crown) and a darker,
     lower, bumpier one in front. Drawn AFTER the volcano so it rises behind. */
  function canopy(col, a, h0, h1, R, seedOff, bump, emergent){
    g.fillStyle = css(col, a);
    g.beginPath(); g.moveTo(0, HZ+10);
    for(var x=0; x<=W; x+=2){
      var an = (x % W)/W*Math.PI*2, cxn = Math.cos(an), szn = Math.sin(an);
      var n  = fbm(seedOff + cxn*R, seedOff + szn*R);                  /* rolling ridge line  */
      var n2 = vn(seedOff*3 + cxn*R*6, seedOff*3 + szn*R*6);           /* individual crowns   */
      var hh = h0 + (h1-h0)*n + bump*(n2-0.5);
      if(emergent){
        var e = vn(seedOff*7 + cxn*R*2.2, seedOff*7 + szn*R*2.2);
        hh += emergent*smooth(0.74, 0.92, e);
      }
      g.lineTo(x, HZ - hh*DEG);
    }
    g.lineTo(W, HZ+10); g.closePath(); g.fill();
  }
  canopy(mix3(rgbOf(STAGE_CANOPY2), HZC, 0.30), 0.95, 1.3, 2.5, 9,  17.3, 0.35, 0.9);
  canopy(mix3(rgbOf(STAGE_CANOPY),  HZC, 0.10), 0.98, 0.8, 1.7, 14, 41.7, 0.50, 0.5);
  /* ground mist at the foot of the forest wall, and the seam with the world edge */
  var gm=g.createLinearGradient(0,HZ-0.8*DEG,0,HZ+12);
  gm.addColorStop(0, hazeA(0)); gm.addColorStop(0.30, hazeA(0.30)); gm.addColorStop(1, hazeA(0.95));
  g.fillStyle=gm; g.fillRect(0,HZ-0.8*DEG,W,0.8*DEG+12);

  var tex=new THREE.CanvasTexture(c);
  tex.encoding=THREE.sRGBEncoding;
  return tex;
}

var volcTex = { idle: makeSkyTexture('idle'), active: makeSkyTexture('active') };

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
