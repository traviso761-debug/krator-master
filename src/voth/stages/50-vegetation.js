/* ==== 18. VEGETATION ==== */
await stage('vegetation');   /* the loading screen (src/core/diag.js) gets a frame to say so */
reseed(700001);

/* Ashland scrub and trees, with roughly a third of the cover fungoid. */

var VEG = 0;
function plant(x, z, scale){
  var y = terrainH(x,z);
  var f = rnd();
  if(f < 0.33){
    /* --- fungoid --- */
    var g = rnd();
    if(g < 0.45){                     /* tall capped mushroom */
      var sh = rr(4.5,11)*scale, sr = rr(0.45,0.95)*scale;
      STK(x, y, z, sr, sh, 0, pick(STALKC), 'fungus');
      var cr = Math.min(5.2, sr*rr(3.0,4.8));
      BLOB(x, y+sh-0.6, z, cr, cr*rr(0.42,0.72), rnd()*3, pick(FUNGC), 'fungus');

    }else if(g < 0.78){               /* squat cluster */
      var n = ri(2,5);
      for(var i=0;i<n;i++){
        var ox=rr(-4,4)*scale, oz=rr(-4,4)*scale;
        var hh=rr(1.0,3.0)*scale, rr2=rr(0.7,1.8)*scale;
        var yy=terrainH(x+ox,z+oz);
        STK(x+ox, yy, z+oz, rr2*0.32, hh, 0, pick(STALKC), 'fungus');
        BLOB(x+ox, yy+hh-0.2, z+oz, rr2, rr2*rr(0.5,0.95), rnd()*3, pick(FUNGC), 'fungus');
      }
    }else{                            /* bulbous trama-like stalk */
      var bh = rr(3,7.5)*scale;
      FR6(x, y, z, rr(1.5,2.8)*scale, bh, rr(1.5,2.8)*scale, rnd()*3, pick(FUNGC), 'fungus');
      BLOB(x, y+bh, z, rr(1.1,2.1)*scale, rr(1.7,3.4)*scale, rnd()*3, pick(FUNGC), 'fungus');
    }
    VEG++;
    return;
  }
  /* --- vascular: scrub, ashland trees, reeds --- */
  var v = rnd();
  if(v < 0.42){                       /* low scrub blob */
    var br = rr(1.6,3.8)*scale;
    BLOB(x, y-0.3, z, br, br*rr(0.7,1.3), rnd()*3, pick(LEAFC), 'leaf');
    if(chance(0.4)) BLOB(x+rr(-3,3), y-0.3, z+rr(-3,3), br*0.7, br*0.8, rnd()*3, pick(LEAFC), 'leaf');
  }else if(v < 0.80){                 /* ashland tree */
    var th = rr(7,20)*scale, tr = rr(0.5,1.1)*scale;
    STK(x, y, z, tr, th, 0, pick(TRUNKC), 'trunk');
    var tiers = ri(2,3);
    for(var t=0;t<tiers;t++){
      var ty = y + th*(0.48 + 0.24*t);
      var cr2 = th*rr(0.20,0.36)*(1 - t*0.22);
      CONE(x+rr(-1,1), ty, z+rr(-1,1), cr2, th*rr(0.22,0.40), rnd()*3, pick(LEAFC), 'leaf');
    }
  }else{                              /* reeds / spiky succulent */
    var n2 = ri(3,7);
    for(var k=0;k<n2;k++){
      var a=rnd()*6.28, r3=rr(0,2.6)*scale;
      CONE(x+Math.cos(a)*r3, y, z+Math.sin(a)*r3, rr(0.35,0.8)*scale, rr(2.5,7)*scale, rnd()*3, pick(LEAFC), 'leaf');
    }
  }
  VEG++;
}

reseed(5678);
(function(){
  var step = 27, LIM = CITY_LIM + 260;
  for(var gx5=-LIM; gx5<LIM; gx5+=step){
    for(var gz5=-LIM; gz5<LIM; gz5+=step){
      var x = gx5 + rr(-12,12), z = gz5 + rr(-12,12);
      var L = landDist(x,z), h = terrainH(x,z);
      if(L < 12 || h < 3.2 || h > 235) continue;

      var dr = polyDist(x,z,RIVER);
      var wd = wallDepth(x,z);
      var slope = 0;
      var h1 = terrainH(x+9,z), h2 = terrainH(x,z+9);
      slope = Math.sqrt((h1-h)*(h1-h)+(h2-h)*(h2-h))/9;

      var p = 0.16 + 0.70*smooth(400,50,dr) + 0.22*smooth(0.55,0.12,slope);
      p *= 0.55 + 0.75*smooth(0.62,0.28, fbm(x*0.0035+31, z*0.0035-12));   // patchy
      /* the built-up city crowds it out; the orchards are planted, not wild */
      if(wd > -60) p *= 0.30;
      if(wd > 40)  p *= 0.55;
      var zn = zoneAt(x,z);
      if(zn === 'orchard') continue;
      if(zn === 'manor' || zn === 'farm') p *= 0.45;
      if(!chance(p)) continue;
      if(gridHit(x,z,5)) continue;
      plant(x,z, rr(0.75,1.5));
    }
  }
  /* a coarse scatter over the wider landscape, so the hills are not bare */
  var FAR = 4400;
  for(var fx2=-FAR; fx2<FAR; fx2+=92){
    for(var fz2=-FAR; fz2<FAR; fz2+=92){
      var x3 = fx2 + rr(-40,40), z3 = fz2 + rr(-40,40);
      if(Math.abs(x3) < CITY_LIM+220 && Math.abs(z3) < CITY_LIM+220) continue;
      var h3 = terrainH(x3,z3);
      if(h3 < 3.5 || h3 > 300) continue;
      var dr3 = polyDist(x3,z3,RIVER);
      var pp = 0.20 + 0.50*smooth(600,90,dr3);
      pp *= 0.5 + 0.9*smooth(0.60,0.26, fbm(x3*0.0031+7, z3*0.0031-5));
      if(!chance(pp)) continue;
      plant(x3, z3, rr(1.4, 2.6));
    }
  }
  /* compound gardens */
  COMPOUNDS.forEach(function(c){
    var n = ri(3,7);
    for(var i=0;i<n;i++){
      var p2 = loc(c.x, c.z, rr(-c.fx,c.fx), rr(-c.fz,c.fz), c.ry);
      plant(p2[0], p2[1], rr(0.5,1.0));
    }
  });
})();

var ORCH = 0;
reseed(4321);
(function(){

  for(var s = S_10 + 20; s < S_7 - 20; s += 10.5){
    var n = shoreNorm(s), base = shoreAt(s);
    var lastBand = -1;
    for(var u = 152; u < 530; u += 13){
      var x = base[0] + n[0]*u + rr(-1.5,1.5), z = base[1] + n[1]*u + rr(-1.5,1.5);
      if(zoneAt(x,z) !== 'orchard') continue;
      var h = terrainH(x,z);
      if(h < 3 || h > 260) continue;
      if(gridHit(x,z,4)) continue;
      var band = Math.floor(h / 7.5);
      if(band !== lastBand && lastBand >= 0){
        /* a terrace edge: a short retaining wall following the contour */
        var g = sdGrad(x,z);
        BOX(x, h-1.2, z, 11, 1.6+rr(0,0.8), 1.3, Math.atan2(-g[1],g[0]) + Math.PI/2, 0x8a7d63, 'plaster');
      }
      lastBand = band;
      if(!chance(0.86)) continue;
      var th = rr(2.4,4.2), cr = rr(2.2,3.6);
      STK(x, h, z, rr(0.35,0.55), th, 0, 0x5a4b3a, 'trunk');
      BLOB(x, h+th*0.7, z, cr, cr*rr(0.8,1.1), rnd()*3, pick(FRUITC), 'leaf');
      ORCH++;
    }
  }
})();
window._orchard = ORCH;
window._veg = VEG;

/* ==== 18b. NAMED WILD FLORA + SHRUBS/SUCCULENTS ==== */
reseed(700210);

var FLORA_SAMPLE = {};
function floraSample(k,x,y,z){
  var a = FLORA_SAMPLE[k] || (FLORA_SAMPLE[k]=[]);
  if(a.length < 8) a.push([Math.round(x), Math.round(y), Math.round(z)]);
}

/* ==== local colour literals (see the header) ==== */

function birchBark(){ return pick(BIRCHC); }
function birchFleck(){ return pick(BIRCHFLECKC); }
function succCol(){ return pick(SUCCC); }
function deadLeafCol(){ return pick(DEADLEAFC); }

/* ==== 1. TREE FERN ==== */
function treeFern(x,y,z,s){
  s = s || 1; floraSample('treeFern',x,y,z);
  var h = rr(5,11)*s, tr = rr(0.26,0.42)*s;
  var tc = shade(pick(TRUNKC), -0.10);
  STK(x, y, z, tr, h, 0, tc, 'trunk');
  CYL(x, y+h*rr(0.34,0.62), z, tr*1.28, 0.30*s, 0, shade(tc,-0.18), 'trunk');   /* frond scar */
  var cy = y + h;
  CYL(x, cy-0.35*s, z, tr*1.9, 0.85*s, 0, shade(tc,0.06), 'trunk');             /* crown knot */
  var lc = pick(LEAFC), n = ri(7,10), reach = rr(5.0,8.0)*s;
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.14,0.14);
    var p1 = loc(x,z, Math.cos(a)*reach*0.26, Math.sin(a)*reach*0.26, 0);
    CONE(p1[0], cy+0.15*s, p1[1], rr(0.55,0.85)*s, rr(2.2,3.4)*s, a, shade(lc,-0.06), 'leaf');
    var out = reach*rr(0.72,1.00);
    var p2 = loc(x,z, Math.cos(a)*out, Math.sin(a)*out, 0);
    CONE(p2[0], cy-rr(1.0,2.2)*s, p2[1], rr(0.60,0.95)*s, rr(1.8,2.8)*s, a, shade(lc,rr(0.0,0.12)), 'leaf');
  }
}

/* ==== 2. GIANT GROUNDSEL (Dendrosenecio) ==== */
function groundselRosette(x,z,topY,leafCol,s){
  var n = ri(8,11), ll = rr(2.0,3.0)*s;
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.12,0.12);
    var l = ll*rr(0.85,1.15);
    var lp = loc(x,z, l*0.5, 0, a);
    BOX(lp[0], topY+rr(-0.30,0.40)*s, lp[1], l, 0.18*s, l*rr(0.30,0.44), a,
        shade(leafCol, rr(-0.10,0.10)), 'leaf');
  }
  BLOB(x, topY+0.10*s, z, rr(0.5,0.8)*s, rr(0.5,0.9)*s, rnd()*3, shade(leafCol,0.08), 'leaf');
}
function giantGroundselV(x,y,z,s){
  s = s || 1; floraSample('groundsel',x,y,z);
  var h = rr(4.5,8.5)*s, tr = rr(0.55,0.90)*s;
  var tc = pick(TRUNKC), lc = pick(LEAFC);
  var forked = chance(0.42);
  var stemH = forked ? h*rr(0.50,0.66) : h;
  FR6(x, y, z, tr*2, stemH, tr*2, rnd()*3, tc, 'trunk');
  var nd = ri(5,7);
  for(var d=0; d<nd; d++){
    var da = (d/nd)*Math.PI*2 + rr(-0.22,0.22);
    var dp = loc(x,z, tr*1.15, 0, da);
    BOX(dp[0], y + stemH*rr(0.34,0.64), dp[1], rr(0.8,1.5)*s, 0.16*s, rr(0.5,0.9)*s, da,
        deadLeafCol(), 'leaf');
  }
  if(forked){
    var nf = ri(2,3), armH = h - stemH;
    for(var f=0; f<nf; f++){
      var fa = (f/nf)*Math.PI*2 + rr(-0.35,0.35);
      var fp = loc(x,z, tr*rr(0.7,1.1), 0, fa);
      FR6(fp[0], y+stemH, fp[1], tr*1.45, armH, tr*1.45, rnd()*3, shade(tc,-0.05), 'trunk');
      groundselRosette(fp[0], fp[1], y+stemH+armH, lc, s*0.85);
    }
  }else{
    groundselRosette(x, z, y+h, lc, s);
  }
}

/* ==== 3. BIRCH ==== */
function birch(x,y,z,s){
  s = s || 1; floraSample('birch',x,y,z);
  var h = rr(9,17)*s, tr = rr(0.26,0.40)*s;
  var bc = birchBark();
  STK(x, y, z, tr, h*0.58, 0, bc, 'trunk');
  STK(x, y+h*0.58, z, tr*0.80, h*0.30, 0, shade(bc,0.04), 'trunk');
  var nb = ri(2,4);
  for(var b=0;b<nb;b++)
    CYL(x, y + h*rr(0.10,0.58), z, tr*1.10, rr(0.14,0.28)*s, 0, birchFleck(), 'trunk');
  var lc = pick(LEAFC), topY = y + h*0.80, n = ri(4,6);
  for(var i=0;i<n;i++){
    var a = rnd()*Math.PI*2, rd = rr(0.6,2.6)*s;
    var p = loc(x,z, Math.cos(a)*rd, Math.sin(a)*rd, 0);
    CYL(p[0], topY-rr(0.4,1.8)*s, p[1], 0.10*s, rr(1.4,2.8)*s, 0, shade(bc,-0.16), 'trunk');
    var br = rr(1.2,2.2)*s;
    BLOB(p[0], topY+rr(0.0,1.8)*s, p[1], br, br*rr(0.60,0.95), rnd()*3,
         shade(lc, rr(-0.05,0.12)), 'leaf');
  }
  BLOB(x, topY+rr(1.0,2.2)*s, z, rr(1.4,2.4)*s, rr(1.2,2.0)*s, rnd()*3, lc, 'leaf');
}

/* ==== 4. MONKEY-PUZZLE (Araucaria) ==== */
function monkeyPuzzle(x,y,z,s){
  s = s || 1; floraSample('monkeyPuzzle',x,y,z);
  var h = rr(14,24)*s, tr = rr(0.55,0.95)*s;
  var tc = shade(pick(TRUNKC), -0.14), lc = shade(pick(LEAFC), -0.22);
  CYL(x, y, z, tr, h*0.94, 0, tc, 'trunk');
  CYL(x, y, z, tr*1.28, h*0.05, 0, shade(tc,-0.10), 'trunk');       /* root flare */
  var whorls = ri(4,5), w0 = 0.30;
  for(var w=0; w<whorls; w++){
    var t = w/(whorls-1);
    var wy = y + h*(w0 + (0.88-w0)*t);
    var spread = h*0.19*(0.55 + 0.70*Math.sin(Math.PI*(0.22+0.78*t)))*rr(0.90,1.10);
    var n = ri(5,6), a0 = rnd()*Math.PI*2;
    for(var i=0;i<n;i++){
      var a = a0 + (i/n)*Math.PI*2 + rr(-0.10,0.10);
      var p1 = loc(x,z, Math.cos(a)*spread*0.46, Math.sin(a)*spread*0.46, 0);
      CYL(p1[0], wy, p1[1], tr*rr(0.18,0.27), rr(0.5,1.0)*s, 0, shade(tc,-0.05), 'trunk');
      var p2 = loc(x,z, Math.cos(a)*spread, Math.sin(a)*spread, 0);
      var ty = wy + rr(0.25,1.10)*s, br = rr(1.15,1.75)*s;
      CONE(p2[0], ty, p2[1], br, br*rr(0.85,1.20), a, lc, 'leaf');
      CONE(p2[0], ty+br*0.62, p2[1], br*0.58, br*rr(0.70,1.00), a+0.5, shade(lc,0.07), 'leaf');
    }
  }
  CONE(x, y+h*0.88, z, rr(1.8,2.6)*s, rr(2.6,4.4)*s, rnd()*3, shade(lc,0.06), 'leaf');
  BLOB(x, y+h*0.84, z, rr(1.9,2.8)*s, rr(1.0,1.7)*s, rnd()*3, lc, 'leaf');
}

/* ==== 5. SHRUB-SCALE FLORA, including succulents ==== */
function shrubCushion(x,y,z,s){                      /* a low mounded bush */
  floraSample('shrub',x,y,z);
  var n = ri(2,4), lc = pick(LEAFC);
  for(var i=0;i<n;i++){
    var a = rnd()*6.283, rd = rr(0,1.4)*s, br = rr(0.9,1.9)*s;
    BLOB(x+Math.cos(a)*rd, y-0.25, z+Math.sin(a)*rd, br, br*rr(0.45,0.80), rnd()*3,
         shade(lc, rr(-0.08,0.10)), 'leaf');
  }
}
function shrubBroom(x,y,z,s){                        /* a stiff twiggy fan */
  floraSample('shrub',x,y,z);
  var lc = pick(LEAFC), n = ri(4,7);
  CYL(x, y-0.10, z, rr(0.18,0.30)*s, rr(0.3,0.7)*s, 0, pick(TRUNKC), 'trunk');
  for(var i=0;i<n;i++){
    var a = (i/n)*6.283 + rr(-0.30,0.30), rd = rr(0.1,0.9)*s;
    CONE(x+Math.cos(a)*rd, y+rr(0.10,0.45)*s, z+Math.sin(a)*rd, rr(0.16,0.30)*s,
         rr(1.2,2.6)*s, a, shade(lc, rr(-0.06,0.12)), 'leaf');
  }
}
function succPaddle(x,y,z,s){                        /* prickly-pear pads on edge */
  floraSample('succulent',x,y,z);
  var c = succCol(), n = ri(3,6);
  for(var i=0;i<n;i++){
    var a = (i/n)*6.283 + rr(-0.40,0.40), rd = rr(0.1,0.8)*s;
    var p = loc(x,z, Math.cos(a)*rd, Math.sin(a)*rd, 0);
    BOX(p[0], y-0.10, p[1], rr(0.9,1.8)*s, rr(1.0,2.2)*s, rr(0.18,0.32)*s, a,
        shade(c, rr(-0.08,0.10)), 'leaf');
  }
}
function succRosette(x,y,z,s){                       /* agave/aeonium, sometimes spiking */
  floraSample('succulent',x,y,z);
  var c = succCol(), n = ri(6,9);
  for(var i=0;i<n;i++){
    var a = (i/n)*6.283 + rr(-0.15,0.15), rd = rr(0.25,0.75)*s;
    CONE(x+Math.cos(a)*rd, y-0.15, z+Math.sin(a)*rd, rr(0.24,0.44)*s, rr(0.8,1.8)*s, a,
         shade(c, rr(-0.10,0.12)), 'leaf');
  }
  if(chance(0.16)){
    var bh = rr(3.0,6.0)*s, nb = ri(3,4);
    STK(x, y, z, 0.13*s, bh, 0, pick(STALKC), 'trunk');
    for(var k=0;k<nb;k++)
      BLOB(x+rr(-0.3,0.3), y+bh*((k+1)/nb), z+rr(-0.3,0.3), rr(0.26,0.46)*s, rr(0.30,0.60)*s,
           rnd()*3, pick(BLOOMC), 'leaf');
  }
}
function succFinger(x,y,z,s){                        /* fat vertical fingers */
  floraSample('succulent',x,y,z);
  var c = succCol(), n = ri(2,4);
  for(var i=0;i<n;i++){
    var a = (i/n)*6.283 + rr(-0.50,0.50), rd = rr(0.1,0.7)*s;
    var fx = x+Math.cos(a)*rd, fz = z+Math.sin(a)*rd;
    var segs = ri(2,3), fr = rr(0.34,0.56)*s, yy = y-0.10;
    for(var k=0;k<segs;k++){
      var sh = rr(0.7,1.3)*s;
      BLOB(fx, yy, fz, fr*(1-0.12*k), sh, rnd()*3, shade(c, rr(-0.06,0.10)), 'leaf');
      yy += sh*0.78;
    }
  }
}
function succBarrel(x,y,z,s){                        /* one squat barrel, ringed with spines */
  floraSample('succulent',x,y,z);

  var c = succCol(), br = rr(0.55,1.05)*s, n = ri(7,10);
  BLOB(x, y-0.10, z, br, br*rr(1.00,1.60), rnd()*3, c, 'leaf');
  for(var i=0;i<n;i++){
    var a = (i/n)*6.283;
    CONE(x+Math.cos(a)*br*0.74, y+br*0.10, z+Math.sin(a)*br*0.74, br*rr(0.16,0.26),
         br*rr(1.10,1.80), a, shade(c,-0.24), 'leaf');
  }
}

/* ==== placement ==== */
var FLORA = { treeFern:0, groundsel:0, birch:0, monkeyPuzzle:0, shrub:0, succulent:0 };
var FLORA_CTX = { wild:0, garden:0, park:0 };

var FLORA_I0 = bucketTotal();
var FGC = 16, FG = {};
function fgFree(x,z,rad){
  var i0=Math.floor((x-rad)/FGC), i1=Math.floor((x+rad)/FGC);
  var j0=Math.floor((z-rad)/FGC), j1=Math.floor((z+rad)/FGC);
  for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){
    var a = FG[i+','+j]; if(!a) continue;
    for(var n=0;n<a.length;n++){
      var o=a[n], dx=x-o[0], dz=z-o[1], rsum=rad+o[2];
      if(dx*dx+dz*dz < rsum*rsum) return false;
    }
  }
  return true;
}
function fgPut(x,z,rad){
  var i0=Math.floor((x-rad)/FGC), i1=Math.floor((x+rad)/FGC);
  var j0=Math.floor((z-rad)/FGC), j1=Math.floor((z+rad)/FGC);
  for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++)
    (FG[i+','+j] || (FG[i+','+j]=[])).push([x,z,rad]);
}

function shrubAt(x,y,z,s,dryness){
  if(chance(0.16 + 0.66*dryness)){
    var k = rnd();
    if(k<0.28)      succRosette(x,y,z,s);
    else if(k<0.52) succPaddle(x,y,z,s);
    else if(k<0.78) succFinger(x,y,z,s);
    else            succBarrel(x,y,z,s);
    FLORA.succulent++;
  }else{
    if(chance(0.55)) shrubCushion(x,y,z,s); else shrubBroom(x,y,z,s);
    FLORA.shrub++;
  }
  return true;
}

/* ==== WILD SCATTER: unbuilt ground ==== */
reseed(700220);
(function(){

  var step = 40, FLORA_P = 0.36, LIM = CITY_LIM + 300;
  for(var gx=-LIM; gx<LIM; gx+=step){
    for(var gz=-LIM; gz<LIM; gz+=step){
      var x = gx + rr(-18,18), z = gz + rr(-18,18);
      var L = landDist(x,z), h = terrainH(x,z);
      if(L < 14 || h < 3.4 || h > 250) continue;
      var dt = districtAt(x,z);
      if(dt === 'market' || dt === 'funerary' || dt === 'warehouse' || dt === 'park') continue;
      var zn = zoneAt(x,z);
      if(zn === 'orchard') continue;

      var h1 = terrainH(x+9,z), h2 = terrainH(x,z+9);
      var slope = Math.sqrt((h1-h)*(h1-h)+(h2-h)*(h2-h))/9;
      var dr = polyDist(x,z,RIVER), wd = wallDepth(x,z);
      var damp  = Math.max(smooth(360,60,dr), smooth(30,8,h));
      var high  = smooth(45,155,h);
      var steep = smooth(0.10,0.34,slope);
      var dryness = Math.max(0, Math.min(1, (1-damp)*(0.45 + 0.55*Math.max(high,steep))));

      var p = (0.10 + 0.20*damp + 0.14*steep + 0.12*high) * FLORA_P;
      p *= 0.40 + 1.00*smooth(0.54,0.24, fbm(x*0.0042-17, z*0.0042+53));
      if(wd > -60) p *= 0.24;
      if(wd > 40)  p *= 0.50;
      if(zn === 'manor' || zn === 'farm') p *= 0.40;
      if(!chance(p)) continue;

      var wFern = 0.06 + 1.10*damp*(1-high);
      var wGrnd = 0.06 + 0.60*high;
      var wBrch = 0.05 + 0.85*steep*(1-0.45*high);
      var wMonk = 0.02 + 0.42*steep*(0.30+0.70*high);
      var wShrb = 3.10 + 1.90*dryness;
      var tot = wFern+wGrnd+wBrch+wMonk+wShrb, r = rnd()*tot;
      var s = rr(0.80,1.45), y = terrainH(x,z);

      if(r < wFern){
        if(gridHit(x,z,5) || !fgFree(x,z,5)) continue;
        fgPut(x,z,5); treeFern(x,y,z,s); FLORA.treeFern++;
      }else if(r < wFern+wGrnd){
        if(gridHit(x,z,5) || !fgFree(x,z,5)) continue;
        fgPut(x,z,5); giantGroundselV(x,y,z,s); FLORA.groundsel++;
      }else if(r < wFern+wGrnd+wBrch){
        if(gridHit(x,z,5) || !fgFree(x,z,4.5)) continue;
        fgPut(x,z,4.5); birch(x,y,z,s); FLORA.birch++;
      }else if(r < wFern+wGrnd+wBrch+wMonk){
        if(gridHit(x,z,9) || !fgFree(x,z,9)) continue;
        fgPut(x,z,9); monkeyPuzzle(x,y,z,s); FLORA.monkeyPuzzle++;
      }else{
        if(gridHit(x,z,2.5) || !fgFree(x,z,2.2)) continue;
        fgPut(x,z,2.2); shrubAt(x,y,z,rr(0.8,1.4),dryness);
      }
      FLORA_CTX.wild++;
    }
  }
})();

/* ==== GARDENS: cultivated, not scattered ==== */
reseed(700230);
(function(){

  COMPOUNDS.forEach(function(c){
    var gfx = c.fx*0.82, gfz = c.fz*0.82, gy = c.y + 0.28;
    var n = ri(6,9);
    for(var i=0;i<n;i++){
      var t = (i/n)*4, side = Math.floor(t), u = (t-side)*2-1;
      var lx = side===0 ? u*gfx : side===1 ? gfx : side===2 ? -u*gfx : -gfx;
      var lz = side===0 ? -gfz : side===1 ? u*gfz : side===2 ? gfz : -u*gfz;
      var p = loc(c.x, c.z, lx, lz, c.ry);
      if(!fgFree(p[0],p[1],1.9)) continue;
      fgPut(p[0],p[1],1.9);
      if(i%2===0){ succRosette(p[0],gy,p[1], rr(0.85,1.15)); FLORA.succulent++; }
      else       { shrubCushion(p[0],gy,p[1], rr(0.75,1.05)); FLORA.shrub++; }
      FLORA_CTX.garden++;
    }
    if(fgFree(c.x,c.z,4.0)){
      fgPut(c.x,c.z,4.0);
      floraSample('gardenCompound', c.x, gy, c.z);
      if(chance(0.55)){ treeFern(c.x,gy,c.z, rr(0.7,1.0)); FLORA.treeFern++; }
      else            { giantGroundselV(c.x,gy,c.z, rr(0.6,0.9)); FLORA.groundsel++; }
      FLORA_CTX.garden++;
    }
  });

  var H = window._houseOfHealing;
  if(H){
    var outerHW = H.fx - 4, lawnR = outerHW*0.62;
    var fy = terrainH(H.x, H.z) + 7.05 + 0.02;
    var ring = 12;
    for(var i=0;i<ring;i++){
      var a = H.ry + (i/ring)*Math.PI*2;
      var rad = lawnR*(i%2 ? 0.66 : 0.52);
      var px = H.gardenCx + Math.cos(a)*rad, pz = H.gardenCz + Math.sin(a)*rad;
      if(!fgFree(px,pz,2.0)) continue;
      fgPut(px,pz,2.0);
      var k = i % 4;
      if(k===0)      { succPaddle(px,fy,pz, rr(0.8,1.0));  FLORA.succulent++; }
      else if(k===1) { shrubBroom(px,fy,pz, rr(0.7,0.95)); FLORA.shrub++; }
      else if(k===2) { succFinger(px,fy,pz, rr(0.8,1.0));  FLORA.succulent++; }
      else           { shrubCushion(px,fy,pz, rr(0.7,1.0)); FLORA.shrub++; }
      FLORA_CTX.garden++;
    }
    /* four corner specimens on the diagonals, between the ring and the piers */
    for(var q=0;q<4;q++){
      var qa = H.ry + Math.PI/4 + q*Math.PI/2, qr = lawnR*0.80;
      var qx = H.gardenCx + Math.cos(qa)*qr, qz = H.gardenCz + Math.sin(qa)*qr;
      if(!fgFree(qx,qz,3.4)) continue;
      fgPut(qx,qz,3.4);
      treeFern(qx,fy,qz, rr(0.55,0.75)); FLORA.treeFern++; FLORA_CTX.garden++;
    }
  }

  var MS = window._monasterySites;
  if(MS && MS.fields){
    MS.fields.forEach(function(fl){
      var perSide = ri(3,5);
      [-1,1].forEach(function(sgn){
        for(var i=0;i<perSide;i++){
          var u = ((i+0.5)/perSide)*2-1;
          var p = loc(fl.x, fl.z, u*fl.hw*0.98, sgn*(fl.hz+1.6), fl.ry);
          if(gridHit(p[0],p[1],1.6) || !fgFree(p[0],p[1],1.8)) continue;
          fgPut(p[0],p[1],1.8);
          var fy2 = terrainH(p[0],p[1]);
          if(i%2===0){ shrubCushion(p[0],fy2,p[1], rr(0.7,1.0)); FLORA.shrub++; }
          else       { succRosette(p[0],fy2,p[1], rr(0.7,1.0)); FLORA.succulent++; }
          FLORA_CTX.garden++;
        }
      });
    });
  }

  if(typeof CANTON_FACES !== 'undefined' && CANTON_FACES['Ancestry'] &&
     typeof CIDX !== 'undefined' && CIDX['Ancestry']){
    var AF = CANTON_FACES['Ancestry'].levels[0], AC = CIDX['Ancestry'];
    var ar = AF.hw + (AF.outer - AF.hw)*0.55;

    var an = 32;
    for(var i2=0;i2<an;i2++){
      var aa = (i2/an)*Math.PI*2;
      var ax = AC.x + Math.cos(aa)*ar, az = AC.z + Math.sin(aa)*ar;
      if(!fgFree(ax,az,2.2)) continue;
      fgPut(ax,az,2.2);
      var m = i2 % 3;
      if(m===0)      { succRosette(ax,AF.y,az, rr(1.5,2.1)); FLORA.succulent++; }
      else if(m===1) { succBarrel(ax,AF.y,az, rr(1.6,2.3));  FLORA.succulent++; }
      else           { shrubCushion(ax,AF.y,az, rr(1.4,2.0)); FLORA.shrub++; }
      FLORA_CTX.garden++;
    }
  }
})();

/* ==== PARKS: groves, not scatter ==== */
reseed(700240);
(function(){
  if(typeof DIST_PARK === 'undefined') return;
  DIST_PARK.forEach(function(d){
    var b = polyBounds(d.poly);
    var area = (b.x1-b.x0)*(b.z1-b.z0);
    var groves = Math.max(3, Math.round(area/13000));
    for(var g=0; g<groves; g++){
      var cx = rr(b.x0,b.x1), cz = rr(b.z0,b.z1);
      if(!pointInPoly(cx,cz,d.poly) || districtAt(cx,cz) !== 'park') continue;
      var kind = rnd();
      floraSample('parkGrove', cx, terrainH(cx,cz), cz);
      var members = ri(2,5), spread = rr(9,20);
      for(var m=0;m<members;m++){
        var ma = rnd()*Math.PI*2, md = Math.sqrt(rnd())*spread;
        var x = cx+Math.cos(ma)*md, z = cz+Math.sin(ma)*md;
        if(!pointInPoly(x,z,d.poly) || districtAt(x,z) !== 'park') continue;
        if(onRingHwy(x,z,3.0)) continue;
        var y = terrainH(x,z);
        if(kind < 0.34){
          if(gridHit(x,z,4.5) || !fgFree(x,z,4.5)) continue;
          fgPut(x,z,4.5); birch(x,y,z, rr(0.9,1.3)); FLORA.birch++;
        }else if(kind < 0.58){
          if(gridHit(x,z,9) || !fgFree(x,z,9)) continue;
          fgPut(x,z,9); monkeyPuzzle(x,y,z, rr(0.85,1.15)); FLORA.monkeyPuzzle++;
        }else if(kind < 0.80){
          if(gridHit(x,z,5) || !fgFree(x,z,5)) continue;
          fgPut(x,z,5); treeFern(x,y,z, rr(0.9,1.3)); FLORA.treeFern++;
        }else{
          if(gridHit(x,z,5) || !fgFree(x,z,5)) continue;
          fgPut(x,z,5); giantGroundselV(x,y,z, rr(0.9,1.2)); FLORA.groundsel++;
        }
        FLORA_CTX.park++;
      }
      /* the understorey ring: a bed of low flora around the grove's skirt */
      var un = ri(4,8);
      for(var u2=0;u2<un;u2++){
        var ua = (u2/un)*Math.PI*2 + rr(-0.2,0.2), ud = spread*rr(1.05,1.45);
        var ux = cx+Math.cos(ua)*ud, uz = cz+Math.sin(ua)*ud;
        if(!pointInPoly(ux,uz,d.poly) || districtAt(ux,uz) !== 'park') continue;
        if(onRingHwy(ux,uz,2.0)) continue;
        if(gridHit(ux,uz,2.2) || !fgFree(ux,uz,2.0)) continue;
        fgPut(ux,uz,2.0);
        shrubAt(ux, terrainH(ux,uz), uz, rr(0.85,1.25), kind>=0.34 && kind<0.58 ? 0.75 : 0.25);
        FLORA_CTX.park++;
      }
    }
  });
})();
FLORA.instances = bucketTotal() - FLORA_I0;
FLORA.plants = FLORA_CTX.wild + FLORA_CTX.garden + FLORA_CTX.park;
window._flora = FLORA;
window._floraCtx = FLORA_CTX;
window._floraSample = FLORA_SAMPLE;
