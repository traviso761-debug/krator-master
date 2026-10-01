/* ==== 5. SKY ==== */

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

  var HZR=(PAL.haze>>16)&255, HZG=(PAL.haze>>8)&255, HZB=PAL.haze&255;
  function hazeA(a){ return 'rgba('+HZR+','+HZG+','+HZB+','+a+')'; }
  function mixHaze(col, t, a){
    var r=Math.round(col[0]+(HZR-col[0])*t), gg=Math.round(col[1]+(HZG-col[1])*t), b=Math.round(col[2]+(HZB-col[2])*t);
    return 'rgba('+r+','+gg+','+b+','+a+')';
  }
  var ROCK=[118,106,90];               /* warm ash-rock, before haze mix    */
  var vx = W*0.75, base = HZ+4, vh = 44, vw = 112;
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

  g.fillStyle=mixHaze(ROCK, 0.54, 0.31);
  g.beginPath(); traceMountain(g); g.closePath(); g.fill();

  g.fillStyle=mixHaze([196,176,148], 0.74, 0.10);
  g.beginPath(); g.moveTo(eastRim[0], eastRim[1]);
  path(g, ventUpper);
  g.lineTo(shoulder[0], shoulder[1]);
  path(g, ventLower);
  g.lineTo(eastBaseX, base);
  g.lineTo(eastBaseX - (eastBaseX-vx)*0.58, base);
  g.closePath(); g.fill();

  var vent = [ westRim[0]+8, westRim[1]+6 ];

  g.save();
  g.beginPath(); traceMountain(g); g.closePath(); g.clip();
  var gw=34*Math.sqrt(cfg.glowScale), gh=13*cfg.glowScale;
  var lg=g.createLinearGradient(0, vent[1]+6, 0, vent[1]-gh);
  lg.addColorStop(0,'rgba('+cfg.glowCol+','+cfg.glowAlpha.toFixed(2)+')');
  lg.addColorStop(1,'rgba('+cfg.glowCol+',0)');
  g.fillStyle=lg;
  g.fillRect(vent[0]-gw/2, vent[1]-gh, gw, gh+6);

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

  var vv=g.createRadialGradient(vx,base-vh*0.6,10,vx,base-vh*0.6,vw+170);
  vv.addColorStop(0, hazeA(0.36));
  vv.addColorStop(1, hazeA(0));
  g.fillStyle=vv; g.fillRect(vx-vw-190, base-vh-110, 2*(vw+190), vh+150);

  var hz=g.createLinearGradient(0,HZ-58,0,HZ+30);
  hz.addColorStop(0, hazeA(0));
  hz.addColorStop(0.55, hazeA(0.60));
  hz.addColorStop(1, hazeA(0.92));
  g.fillStyle=hz; g.fillRect(0,HZ-58,W,88);

  var t=new THREE.CanvasTexture(c);
  t.encoding=THREE.sRGBEncoding;
  return t;
}

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

/* ==== 6. ERUPTION CYCLE ==== */

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
