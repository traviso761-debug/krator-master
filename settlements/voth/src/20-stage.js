/* ============================== 4. STAGE ============================== */
reseed(200001);   /* fragment head seed — build.py enforces this. Each fragment
                   owns its own PRNG stream so an edit here cannot shift
                   anything generated in a later fragment. */


var FAST = !!(navigator.webdriver) || /[?&]fast/.test(location.search);

var scene = new THREE.Scene();
window.scene = scene;

var HAZE = new THREE.Color(PAL.haze);                    /* palette: 05-palette.js */
scene.fog = new THREE.FogExp2(HAZE.getHex(), PAL.fogDensity);
scene.background = HAZE.clone();

var camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.9, 26000);
var renderer = new THREE.WebGLRenderer({ antialias:!FAST, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio||1, FAST?1:1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
if(!FAST){
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
document.body.appendChild(renderer.domElement);
window.renderer = renderer;

/* --- light: ashen Vvardenfell daylight, sun high in the south-east --- */
var SUNDIR = new THREE.Vector3(0.56, 0.60, 0.57).normalize();
var MOONDIR = new THREE.Vector3(-0.52, 0.40, -0.75).normalize();

var sun = new THREE.DirectionalLight(PAL.sunColor, PAL.sunIntensity);
sun.position.copy(SUNDIR).multiplyScalar(1900);
if(!FAST){
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  var sc = sun.shadow.camera;
  sc.left=-1250; sc.right=1250; sc.top=1250; sc.bottom=-1250; sc.near=600; sc.far=4200;
  sun.shadow.bias = -0.0009;
  sun.shadow.normalBias = 1.2;
}
scene.add(sun);
var hemiLight = new THREE.HemisphereLight(PAL.hemiSky, PAL.hemiGround, PAL.hemiIntensity);
scene.add(hemiLight);
var ambLight = new THREE.AmbientLight(PAL.ambient, PAL.ambientIntensity);
scene.add(ambLight);

/* ============================== 5. SKY ============================== */

/* Eruption presets — the only thing that differs between the three baked
   skybox textures. Everything else in makeSkyTexture() (gradient, cloud
   bands, foothills, cone/crater silhouette, sunlit flank, haze bank) is
   drawn unconditionally so it is pixel-identical across states; only the
   lava glow and the plume read `cfg`. `plumeSeed` is a distinct literal
   per state (991 / 991031 / 991032) so an eruption's puffs are their own
   noise draw rather than a prefix of idle's — but it is only ever passed
   through the `cfg.plumeSeed` variable below, never written as a literal
   `reseed(N)` call more than once in the source, since makeSkyTexture()
   now runs three times per load. */
var VOLC_CFG = {
  idle : { glowScale:1.00, glowAlpha:0.38, glowCol:'232,140,72',
           plumeSeed:991,    plumeN:70,  plumeAlphaK:1.00, plumeReach:1.00,
           emberN:4,  emberAlphaK:0.50, emberReach:0.60 },
  small: { glowScale:1.55, glowAlpha:0.52, glowCol:'244,155,84',
           plumeSeed:991031, plumeN:120, plumeAlphaK:1.35, plumeReach:1.22,
           emberN:14, emberAlphaK:0.85, emberReach:0.95 },
  large: { glowScale:2.30, glowAlpha:0.66, glowCol:'255,170,96',
           plumeSeed:991032, plumeN:190, plumeAlphaK:1.85, plumeReach:1.48,
           emberN:26, emberAlphaK:1.15, emberReach:1.25 },
  /* forced during the ash-storm weather mode (src/83-weather.js) — well past
     'large': dramatically more smoke and a hotter, wider glow, per the
     owner's own ask. Not part of the normal probabilistic cycle below (it
     never gets picked on its own), only ever set via VOLCANO_FORCE.
     emberN/emberAlphaK/emberReach drive the lava-bomb arcs and angryK
     (derived from glowScale below) drives the jagged flame tongues — both
     new, per the owner's follow-up ask for the summit to "blast plumes of
     lava in the air" and read as "a bigger and angrier flame" specifically
     in this mode. */
  violent: { glowScale:3.4, glowAlpha:0.84, glowCol:'255,182,112',
             plumeSeed:991033, plumeN:280, plumeAlphaK:2.6, plumeReach:1.95,
             emberN:46, emberAlphaK:1.50, emberReach:1.65 }
};

function makeSkyTexture(volc){
  var cfg = VOLC_CFG[volc] || VOLC_CFG.idle;
  var W=2048, H=1024, c=document.createElement('canvas'); c.width=W; c.height=H;
  var g=c.getContext('2d');
  var HZ = H*0.5;                      // horizon row

  /* vertical gradient */
  var grd=g.createLinearGradient(0,0,0,H);
  grd.addColorStop(0.00,'#6d7e9b');
  grd.addColorStop(0.24,'#8b97ab');
  grd.addColorStop(0.42,'#b3b2b1');
  grd.addColorStop(0.485,'#dbd0ba');
  grd.addColorStop(0.50,'#e9dcc1');
  grd.addColorStop(0.56,'#b8ad98');
  grd.addColorStop(1.00,'#6d6455');
  g.fillStyle=grd; g.fillRect(0,0,W,H);

  /* thin ash-laden cloud bands.
     Drawn at x, x-W and x+W (wrapEllipse below), because this canvas is
     mapped round a sphere and u=0 meets u=1: a band whose centre lands near
     either edge used to be CLIPPED there instead of continuing round, which
     painted a straight vertical cut down the whole sky at due west plus a
     rectangular-looking step wherever a band ended on it. That seam has
     always been in the bake; it only became conspicuous once the sky stopped
     being backdrop and started being the subject (the gas giant, 21-sky.js),
     and it shows at its worst with the new dome model turned off
     (SKY.skyModelK = 0). The two off-canvas copies are clipped away for free,
     so a band that does not touch an edge is unchanged, and no rr()/chance()
     call was added or removed — the noise draw, and therefore every cloud's
     position, size and alpha, is byte-for-byte what it was. */
  reseed(4711);
  function wrapEllipse(x, y, rx, ry){
    for(var w=-1; w<=1; w++){
      g.beginPath(); g.ellipse(x + w*W, y, rx, ry, 0, 0, Math.PI*2); g.fill();
    }
  }
  for(var i=0;i<46;i++){
    var y = HZ - rr(12, HZ*0.92);
    var lw = rr(90, 620), h = rr(4, 20);
    var x = rr(-200, W);
    var a = 0.05 + 0.20*rnd()*(1 - (HZ-y)/HZ*0.45);
    g.fillStyle='rgba(246,240,226,'+a.toFixed(3)+')';
    wrapEllipse(x, y, lw, h);
    if(chance(0.5)){
      g.fillStyle='rgba(122,116,126,'+(a*0.5).toFixed(3)+')';
      wrapEllipse(x+rr(-60,60), y+h*0.7, lw*0.8, h*0.6);
    }
  }

  /* --- the distant volcano, painted north-north-east (azimuth 22.5, u = 0.6875) ---
     Kept low-contrast and warm on purpose: it is the farthest thing in the
     scene, so it should read as sitting in the same haze as everything
     else rather than as a dark cutout punched through it. Every fill below
     is mixed toward PAL.haze (mixHaze) instead of using an independent
     grey, so raising or lowering PAL.haze moves the volcano with it. */
  var HZR=(PAL.haze>>16)&255, HZG=(PAL.haze>>8)&255, HZB=PAL.haze&255;
  function hazeA(a){ return 'rgba('+HZR+','+HZG+','+HZB+','+a+')'; }
  function mixHaze(col, t, a){
    var r=Math.round(col[0]+(HZR-col[0])*t), gg=Math.round(col[1]+(HZG-col[1])*t), b=Math.round(col[2]+(HZB-col[2])*t);
    return 'rgba('+r+','+gg+','+b+','+a+')';
  }
  var ROCK=[118,106,90];               /* warm ash-rock, before haze mix    */
  var vx = W*0.6875, base = HZ+4, vh = 44, vw = 112;   /* u = (270 - az)/360, az 22.5 */
  function ridge(cx, halfw, height, col, jag){
    g.fillStyle=col; g.beginPath(); g.moveTo(cx-halfw, base);
    var n=48;
    for(var k=0;k<=n;k++){
      var t=k/n, prof=1-Math.pow(Math.abs(t*2-1),1.45);
      var y=base-height*prof - jag*Math.sin(t*23.7)*prof*0.5 - jag*Math.sin(t*9.1+1.4)*prof*0.4;
      g.lineTo(cx-halfw+2*halfw*t, y);
    }
    g.lineTo(cx+halfw, base); g.closePath(); g.fill();
  }
  /* foothills behind — mostly haze, just enough rock to read as shape */
  ridge(vx-300, 250, 26, mixHaze(ROCK, 0.60, 0.28), 3);
  ridge(vx+300, 270, 30, mixHaze(ROCK, 0.60, 0.28), 3);
  ridge(vx-120, 210, 34, mixHaze(ROCK, 0.48, 0.34), 3);
  /* the cone, truncated at a breached, off-centre caldera. A drafting-
     compass cone with a centred bite doesn't read as a real stratovolcano,
     so every edge below is a polyline nudged by `sig()` (the same fbm
     noise used elsewhere) tapered to zero at its shared endpoints, and the
     crater rim, bowl floor and flanks are all deliberately unequal:
     a taller near-intact west wall, a lower breached east wall the ash
     vents through, and a secondary shoulder bulging the east flank. */
  function jagPts(x0,y0,x1,y1,n,amp,zo){
    var pts=[];
    for(var i=1;i<n;i++){
      var t=i/n, x=x0+(x1-x0)*t, y=y0+(y1-y0)*t;
      var j=sig(t*5.4+zo, zo*2.3-t, 1)*amp*Math.sin(t*Math.PI);
      pts.push([x, y-j]);
    }
    return pts;
  }
  function path(g2, pts){ for(var i=0;i<pts.length;i++) g2.lineTo(pts[i][0],pts[i][1]); }
  var westBaseX=vx-vw*0.97, eastBaseX=vx+vw*1.06, apexY=base-vh;
  var westRim  = [vx-46, apexY+2];        /* taller, near-intact crater wall      */
  var floor    = [vx-20, apexY+15];       /* bowl floor, off-centre — not midway  */
  var eastRim  = [vx+30, apexY+22];       /* breached: lower, farther from centre */
  var shoulder = [vx+64, base-vh*0.40];   /* secondary bump on the vented flank   */
  var westFlank = jagPts(westBaseX,base, westRim[0],westRim[1], 6, 6, 0.6);
  var ventUpper = jagPts(eastRim[0],eastRim[1], shoulder[0],shoulder[1], 5, 5, 1.4);
  var ventLower = jagPts(shoulder[0],shoulder[1], eastBaseX,base, 6, 7, 2.1);
  /* the full outline, traced once and reused both to fill the mountain and
     to clip the lava glow to it below — a single source of the silhouette
     so the two can never disagree. */
  function traceMountain(g2){
    g2.moveTo(westBaseX, base);
    path(g2, westFlank);
    g2.lineTo(westRim[0], westRim[1]);
    g2.lineTo(floor[0], floor[1]);
    g2.lineTo(eastRim[0], eastRim[1]);
    path(g2, ventUpper);
    g2.lineTo(shoulder[0], shoulder[1]);
    path(g2, ventLower);
    g2.lineTo(eastBaseX, base);
  }

  /* Owner-flagged gap: this cone used to sit at a much stronger mix/alpha
     (0.38/0.42) than the foothills right behind it (0.48-0.60/0.28-0.34),
     which is what read as "too dark and contrasty" — a hard cutout punched
     through the haze bank instead of the farthest, softest shape in the
     scene. Brought in line with the foothill mix ratios (still a hair
     stronger so the peak keeps *some* silhouette) so the whole massif reads
     as one distant, atmosphere-soaked shape. */
  g.fillStyle=mixHaze(ROCK, 0.54, 0.31);
  g.beginPath(); traceMountain(g); g.closePath(); g.fill();
  /* sunlit east flank, warm highlight, following the same irregular edge
     (including the shoulder) instead of a plain triangle laid over it —
     softened alongside the cone fill so the flank doesn't stay as a hard
     bright wedge once the body around it has been washed back.
     Owner-flagged gap, part three: even after the cone fill was brought in
     line with the foothills, this flank was still a near-opaque saturated
     tan wedge (0.42 mix / 0.19 alpha) sitting on top of the softened body —
     the one element still reading as a hard flat cutout rather than the
     farthest, softest shape in the scene. Pushed further into the haze
     (mix) and thinned (alpha) so it reads as a warm cast over the rock
     instead of its own solid shape. Checked at 4x against the raw canvas
     (not just the resized screenshot): 0.58/0.13 was still a clean,
     sharp-edged peach triangle sitting on the muted cone body — the same
     "cutout" complaint, just at lower saturation instead of gone. Pushed
     further so what's left reads as a warm cast, not a shape of its own. */
  g.fillStyle=mixHaze([196,176,148], 0.74, 0.10);
  g.beginPath(); g.moveTo(eastRim[0], eastRim[1]);
  path(g, ventUpper);
  g.lineTo(shoulder[0], shoulder[1]);
  path(g, ventLower);
  g.lineTo(eastBaseX, base);
  g.lineTo(eastBaseX - (eastBaseX-vx)*0.58, base);
  g.closePath(); g.fill();
  /* the vent — one single anchor the glow AND the plume both read.
     Two earlier placements (between floor/eastRim, then at floor) were each
     checked only for polygon membership in canvas space — both are true
     but neither is sufficient: this cone is painted at 2048px and mapped
     onto an 11000-radius sphere, so by the time it reaches the screen the
     34px gap between westRim (474) and floor (487) or eastRim (494) has
     shrunk to a few screen pixels, and ANY point that isn't the single
     tallest silhouette point reads as "somewhere on the mountain," not "at
     the peak" — confirmed by rendering the actual 3D scene (not the canvas
     in isolation) with terrain and water hidden so only the sky texture
     remains, then cropping and zooming into the rendered result at 3x: the
     'floor' anchor visibly sat on the open lower-left flank, well below and
     left of the visible tip, exactly the complaint. `westRim` is the one
     point that IS the tip — it is, by construction, the tallest y-value of
     the whole silhouette (474, versus 487 and 494 for floor/eastRim) — so
     the glow anchors there now, nudged a few px right/down into the solid
     body so its hot core isn't lost against the knife-edge tip itself. This
     trades the original "ash vents from the lower breach" theming for
     "the effect visibly sits at the peak", since that is what was actually
     asked for, three times. */
  var vent = [ westRim[0]+8, westRim[1]+6 ];
  /* lava glow — clipped to the mountain's own silhouette (traced above)
     so it can only ever show up draped over/fitted into the rim, never as
     a rectangle floating past the ridgeline into open sky. Hot core sits
     at vent; width/height/alpha/colour scale with cfg.glowScale for
     eruptions, the anchor itself never moves, and the clip means a bigger
     eruption reads as more of the notch lighting up, not a bigger stray
     rectangle. */
  g.save();
  g.beginPath(); traceMountain(g); g.closePath(); g.clip();
  var gw=34*Math.sqrt(cfg.glowScale), gh=13*cfg.glowScale;
  var lg=g.createLinearGradient(0, vent[1]+6, 0, vent[1]-gh);
  lg.addColorStop(0,'rgba('+cfg.glowCol+','+cfg.glowAlpha.toFixed(2)+')');
  lg.addColorStop(1,'rgba('+cfg.glowCol+',0)');
  g.fillStyle=lg;
  g.fillRect(vent[0]-gw/2, vent[1]-gh, gw, gh+6);
  /* angrier flame for the higher eruption states: a few jagged, overlapping
     teardrop tongues layered over the plain gradient above, instead of one
     smooth glow, so 'large'/'violent' reads as real flame licking up out of
     the notch. angryK is 0 below glowScale 1.5 (idle/small unchanged). */
  var angryK = Math.max(0, cfg.glowScale - 1.5);
  if(angryK > 0){
    reseed(cfg.plumeSeed + 13);
    var tongues = Math.round(3 + angryK*2.2);
    for(var f=0; f<tongues; f++){
      var fx0 = vent[0] + rr(-gw*0.32, gw*0.32);
      var fh = gh*(0.55+angryK*0.5)*(0.7+rnd()*0.6);
      var fw = gw*(0.16+rnd()*0.10);
      var lean = rr(-3,3);
      g.beginPath();
      g.moveTo(fx0-fw*0.5, vent[1]+2);
      g.quadraticCurveTo(fx0-fw*0.3+lean, vent[1]-fh*0.55, fx0+lean*1.6, vent[1]-fh);
      g.quadraticCurveTo(fx0+fw*0.3+lean, vent[1]-fh*0.55, fx0+fw*0.5, vent[1]+2);
      g.closePath();
      var fg=g.createLinearGradient(0, vent[1]+2, 0, vent[1]-fh);
      fg.addColorStop(0, 'rgba(255,226,158,'+(0.55*Math.min(angryK,2.2)/2.2).toFixed(3)+')');
      fg.addColorStop(0.5, 'rgba('+cfg.glowCol+','+(0.60*Math.min(angryK,2.2)/2.2).toFixed(3)+')');
      fg.addColorStop(1, 'rgba('+cfg.glowCol+',0)');
      g.fillStyle=fg; g.fill();
    }
  }
  g.restore();
  /* lava bombs — bright, hot embers blasting up out of the vent on
     parabolic arcs and fading as they fall, the "blasting into the air"
     complement to the glow (draped on the rim) and the ash plume (grey,
     diffuse, drifts with the wind). Deliberately NOT clipped to the
     mountain and NOT haze-mixed: these are meant to read as close, hot
     debris thrown clear of the silhouette, not distant atmosphere. Counts/
     reach/brightness scale with cfg the same way the plume does — idle
     keeps a few weak sparks (a simmering vent never looks fully dead),
     violent throws dozens of bright arcs well above the peak. */
  reseed(cfg.plumeSeed + 7);
  var emberN = cfg.emberN;
  for(var e=0;e<emberN;e++){
    var eang = rr(-0.85, 0.55);                 /* mostly up, biased east like the plume */
    var espeed = cfg.emberReach*(30+rr(0,26));
    var esteps = 10;
    var esx=vent[0], esy=vent[1]-4;
    var evx=Math.sin(eang)*espeed, evy=-Math.cos(eang)*espeed*1.3;
    var egrav=cfg.emberReach*7.5, elife=0.55+rr(0,0.5);
    var ehue = chance(0.35) ? '255,244,214' : (chance(0.5) ? '255,176,96' : '255,110,60');
    var epx=esx, epy=esy;
    for(var es=1;es<=esteps;es++){
      var ett=elife*es/esteps;
      var enx=esx+evx*ett, eny=esy+evy*ett+0.5*egrav*ett*ett;
      var eea=(1-es/esteps)*cfg.emberAlphaK*0.55;
      if(eea>0.02){
        g.strokeStyle='rgba('+ehue+','+eea.toFixed(3)+')';
        g.lineWidth=1.6*(1-es/esteps*0.5);
        g.beginPath(); g.moveTo(epx,epy); g.lineTo(enx,eny); g.stroke();
      }
      epx=enx; epy=eny;
    }
    var apexT=elife*0.35;
    g.fillStyle='rgba('+ehue+','+(cfg.emberAlphaK*0.80).toFixed(3)+')';
    g.beginPath();
    g.arc(esx+evx*apexT, esy+evy*apexT+0.5*egrav*apexT*apexT, 1.4, 0, Math.PI*2);
    g.fill();
  }
  /* ash plume leaning east — fewer, softer, lighter puffs at rest that mix
     further into the haze the higher/farther they drift, so it diffuses
     instead of reading as a solid dark column; cfg.plumeN/plumeAlphaK/
     plumeReach thicken, brighten and throw it farther during an eruption.
     Starts just above the same `vent` the glow anchors to. */
  /* Owner-flagged gap, part two: at 0.040 base alpha with up to ~190 puffs
     (the 'large' state) the individual puffs were faint but stacked
     (canvas alpha-over-alpha) into a solid, heavy-looking column — the
     opposite of "diffuse". Lowered base alpha and pushed the haze-mix
     floor up (puffs start more washed-out and reach full haze sooner) so
     the same puff counts still read as drifting ash rather than a dense
     rope of smoke; this scales every state (idle/small/large) evenly since
     they all read the same pa/mix formula through cfg.
     Owner-flagged gap, part four: that pass alone still left the idle
     plume reading as a tall, dark, contrasty rope in a rendered screenshot
     (not just the canvas in isolation) — the stack of ~70 puffs at 0.027
     base alpha was still enough overlap to paint a solid dark column, and
     it reached nearly a third of the mountain's own height above the vent.
     Cut the base alpha further, raised the haze-mix floor again (puffs
     start more washed out AND finish fully into the haze sooner), and
     shortened the vertical reach so the column reads as a drifting
     streamer near the peak instead of a monument standing over it —
     still scales through cfg.plumeReach/plumeAlphaK so eruption states
     keep escalating relative to this new, calmer idle baseline. */
  reseed(cfg.plumeSeed);
  var plumeN=cfg.plumeN;
  var ventX=vent[0], ventY=vent[1]-6;
  for(var p=0;p<plumeN;p++){
    var t2=p/plumeN;
    var px=ventX + t2*t2*118*cfg.plumeReach + rr(-13,13)*(0.25+t2)*cfg.plumeReach;
    var py=ventY - t2*68*cfg.plumeReach - rr(0,10);
    var pr=6 + t2*32 + rr(0,8);
    var pa=0.017*cfg.plumeAlphaK*(1-t2*0.75);
    g.fillStyle=mixHaze([150,140,126], 0.54+t2*0.40, pa.toFixed(3));
    g.beginPath(); g.arc(px,py,pr,0,Math.PI*2); g.fill();
  }
  /* a last soft veil over the whole silhouette to push it back into the
     haze bank rather than let the peak sit as a hard-edged cutout —
     strengthened alongside the fill/plume changes above so the whole
     massif sits a notch further back in the air */
  var vv=g.createRadialGradient(vx,base-vh*0.6,10,vx,base-vh*0.6,vw+170);
  vv.addColorStop(0, hazeA(0.36));
  vv.addColorStop(1, hazeA(0));
  g.fillStyle=vv; g.fillRect(vx-vw-190, base-vh-110, 2*(vw+190), vh+150);

  /* haze bank along the horizon to hide the seam with the water — reads
     from PAL.haze (hazeA) so it is the same air as the fog and background,
     not an independently-tuned grey */
  var hz=g.createLinearGradient(0,HZ-58,0,HZ+30);
  hz.addColorStop(0, hazeA(0));
  hz.addColorStop(0.55, hazeA(0.60));
  hz.addColorStop(1, hazeA(0.92));
  g.fillStyle=hz; g.fillRect(0,HZ-58,W,88);

  var t=new THREE.CanvasTexture(c);
  t.encoding=THREE.sRGBEncoding;
  return t;
}

/* three full bakes, one per eruption state — a one-time load cost (three
   2048x1024 canvases), not a per-frame one. The runtime cycle below only
   ever swaps which of these three textures skyMesh.material.map points
   at; it never redraws a canvas after load. */
var volcTex = {
  idle : makeSkyTexture('idle'),
  small: makeSkyTexture('small'),
  large: makeSkyTexture('large'),
  violent: makeSkyTexture('violent')   /* one more one-time bake, same free-at-runtime texture swap */
};

var skyMesh = new THREE.Mesh(
  new THREE.SphereGeometry(11000, 54, 34),
  new THREE.MeshBasicMaterial({ map:volcTex.idle, side:THREE.BackSide, fog:false, depthWrite:false })
);
skyMesh.renderOrder = -10;
scene.add(skyMesh);

/* --- sun and moon discs --- */
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
/* faint second moon, low and pale */
var moon2 = makeDisc(new THREE.Vector3(-0.80,0.19,-0.30).normalize(), 76,
                     'rgba(238,214,206,0.42)', 'rgba(206,176,168,0.10)', 0);

/* ============================== 6. ERUPTION CYCLE ======================
   Self-contained runtime state machine, independent of the main render
   loop in 80-camera.js: a setTimeout chain that swaps skyMesh.material.map
   between the three pre-baked textures above. Same one skyMesh, same one
   draw call, every frame — only the texture reference changes, so this is
   free at render time; the cost of building three canvases already
   happened once at load.

   Deliberately uses plain Math.random(), not the seeded rnd()/reseed()
   stream: that stream exists so the *build* is reproducible, and it has
   already finished running (every fragment after this one reseeds its own
   head) by the time this timer ever fires. A live wall-clock eruption
   schedule is runtime behaviour, not generation, so it is intentionally
   outside that determinism contract.

   Target: always smoking (idle keeps a live plume, never fully clear),
   small eruption ~30% of wall-clock time, large ~5%, baseline the rest.
   Picking a state with the same odds every tick would only match those
   FREQUENCIES, not the TIME fractions the owner actually asked for, since
   the three states are held for different average durations — so the pick
   weights below are solved against each state's average hold time
   (weight_i scales with target_i / avgDuration_i) so the numbers are
   honest wall-clock fractions:
     idle  : 0.65 target / 7.5s avg hold  -> 0.0867 -> normalised 0.51
     small : 0.30 target / 4.0s avg hold  -> 0.0750 -> normalised 0.44
     large : 0.05 target / 5.5s avg hold  -> 0.0091 -> normalised 0.05
   Each eruption "lasts a few seconds" per the brief: small holds 3-5s,
   large holds 4-7s, then the next pick (51% idle) usually drops it back
   to baseline. */
/* set from 83-weather.js while ash-storm weather is active — forces the
   'violent' state continuously instead of letting the normal probabilistic
   cycle below run, and is cleared (null) the moment ash storm ends, handing
   control straight back to pickState(). */
var VOLCANO_FORCE = null;
(function volcanoCycle(){
  var PICK = { idle:0.51, small:0.44, large:0.05 };
  var DUR  = { idle:[5000,10000], small:[3000,5000], large:[4000,7000] };
  function pickState(){
    var r=Math.random(), acc=0;
    for(var k in PICK){ acc+=PICK[k]; if(r<=acc) return k; }
    return 'idle';
  }
  function tick(){
    var st = VOLCANO_FORCE || pickState(), d = DUR[st] || DUR.large;
    skyMesh.material.map = volcTex[st];
    skyMesh.material.needsUpdate = true;
    setTimeout(tick, VOLCANO_FORCE ? 1200 : (d[0] + Math.random()*(d[1]-d[0])));
  }
  tick();
})();

