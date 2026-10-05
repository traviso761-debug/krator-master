/* ============================== 15. JUNGLE (Girder) ==============================
   The dark floor of the hyperjungle round the palisade: understorey (ferns,
   broad-leaf shrubs, aroids, palms, sub-canopy trees, saplings), mossy
   boulders, mushrooms, fallen hypertree logs, lianas and moss beards, bracket
   fungi on the boles; the BROOK dressing (bank rocks, pebbles, reeds, the
   stepped cascade with its rocks and spray, stepping stones, the plank
   footbridge on the south gate track) and fireflies at night.
   Exports: LOGS, JUNGLE_ROCKS (in-channel rocks), JUNGLE_BROOK (the fine
   channel model that 75-terrain.js builds the bed strip + water from),
   window._jungle (counters).                                                */
reseed(620001);

var LOGS = [];
var JUNGLE_ROCKS = [];
var JUNGLE_BROOK = null;
var JUNGLE_CARDS = null;

(function(){
  var EXT = 1450;
  var CNT = { logs:0, trees:0, palms:0, ferns:0, shrubs:0, aroids:0, saplings:0, fungi:0, brackets:0, lianas:0, moss:0, boulders:0,
              rocks:0, pebbles:0, reeds:0, pads:0, driftlogs:0, stones:0, fireflies:0, cardTris:0, bridge:null };
  var _c = new THREE.Color();
  var SHAPE_TRIS = { box:12, fr8:12, fr5:12, pyr:12, cyl:40, cyl6:10, cone:20, dome:132, blob:49, ball:80 };
  function tally(){ var i=0,t=0,m=0,k; for(k in BUCKET){ i+=BUCKET[k].list.length; t+=BUCKET[k].list.length*(SHAPE_TRIS[BUCKET[k].shape]||12); } for(k in MBK) m+=MBK[k].tris; return [i,t,m]; }
  var TALLY0 = tally();
  function lin(hex, f){ _c.set(hex).convertSRGBToLinear(); f = f==null?1:f; return [_c.r*f, _c.g*f, _c.b*f]; }
  function vary(hex, a, b){ return shade(hex, rr(a,b)); }

  /* ------------------------------------------------------------ the brook's fine channel model
     10-core.js gives a smooth 3.2 m drop over 16 m; here it becomes three little falls with pools between,
     and a proper cut bank. 75-terrain.js builds the bed strip and the water ribbon from these. */
  var CAS = CATARACTS[0], CAS_STEPS = [-4.6, 0.2, 4.8], CAS_FALL = 0.55;
  function brookFallen(s){                     /* 0..1 fraction of the cascade's drop already fallen at s */
    var f=0; for(var i=0;i<CAS_STEPS.length;i++) f += smooth(CAS.s+CAS_STEPS[i]-CAS_FALL, CAS.s+CAS_STEPS[i]+CAS_FALL, s)/CAS_STEPS.length;
    return 0.86*f + 0.14*smooth(CAS.s-CAS.run*0.5, CAS.s+CAS.run*0.5, s);
  }
  function brookLevel(s){ return riverLevel(s) + CAS.drop*(smooth(CAS.s-CAS.run*0.5, CAS.s+CAS.run*0.5, s) - brookFallen(s)); }
  function brookFallK(s){ var k=0; for(var i=0;i<CAS_STEPS.length;i++) k=Math.max(k, 1-smooth(CAS_FALL*0.6, CAS_FALL*2.6, Math.abs(s-CAS.s-CAS_STEPS[i]-0.4))); return k; }
  function brookProfile(s, d){                 /* channel + cut bank, relative to the water level */
    var half=riverHalfAt(s), depth=0.78-0.38*cataractK(s);
    if(d < half+0.7) return -depth*(1-smooth(half*0.25, half+0.7, d)) - 0.04;
    return -0.04 + 0.56*smooth(half+0.7, half+2.3, d);
  }
  function brookGround(x, z){                  /* fine ground height anywhere near the brook */
    var rv=polyNear(x,z,RIVER,RIVER_CUM), s=rv.t, d=rv.d, half=riverHalfAt(s);
    if(d > half+9) return terrainH(x,z);
    var lv=brookLevel(s);
    return mix(lv+brookProfile(s,d), Math.max(terrainH(x,z), lv+0.52), smooth(half+2.0, half+9, d));
  }
  JUNGLE_BROOK = { level:brookLevel, fallK:brookFallK, profile:brookProfile, ground:brookGround, steps:CAS_STEPS.map(function(o){ return CAS.s+o; }), bridge:null };
  function gY(x,z){ return brookGround(x,z); }

  /* the south gate track's crossing of the brook: where the footbridge goes */
  var FORD = (function(){
    var best=null;
    for(var s=0;s<RIVER_LEN;s+=0.5){ var R=riverAt(s); if(R.z>PAL_R+20 && R.z<PAL_R+260 && Math.abs(R.x)<0.6 && (!best || Math.abs(R.x)<Math.abs(best.R.x))) best={ s:s, R:R }; }
    if(!best){ var rv=polyNear(0,290,RIVER,RIVER_CUM); best={ s:rv.t, R:riverAt(rv.t) }; }
    var half=riverHalfAt(best.s), ct=Math.max(0.5,Math.abs(best.R.tx));
    return { s:best.s, x:GATES[1].x, z:best.R.z, half:half, L:2*(half+3.1)/ct, lv:brookLevel(best.s) };
  })();
  function nearFord(x,z,pad){ return Math.abs(x-FORD.x) < 2.2+pad && Math.abs(z-FORD.z) < FORD.L/2+3.5+pad; }

  /* ------------------------------------------------------------ clearances */
  var TR = TREES.map(function(T){ return trunkR(T, T.y0 + 3) + 1.0; });
  function trackDist(x,z){ var m=1e9; for(var i=0;i<GATES.length;i++){ var g=GATES[i]; m=Math.min(m, segDist(x,z,g.x,g.z,g.x*2.4,g.z*2.4)); } return m; }
  function keepOut(x,z,pad){
    for(var i=0;i<CLEARINGS.length;i++){ var c=CLEARINGS[i]; if(Math.hypot(x-c[0],z-c[1]) < c[2]+pad) return true; }
    return trackDist(x,z) < 4.5+pad || nearFord(x,z,pad);
  }
  function logNear(x,z,pad){
    for(var i=0;i<LOGS.length;i++){
      var G = LOGS[i];
      if(Math.hypot(x-G.cx,z-G.cz) > G.cr + pad + 20) continue;
      for(var j=0;j<G.pts.length-1;j++){
        var a=G.pts[j], b=G.pts[j+1];
        if(segDist(x,z,a.x,a.z,b.x,b.z) < Math.max(a.r,b.r)+pad) return true;
      }
    }
    return false;
  }
  function okGround(x,z,pad){
    if(Math.abs(x)>EXT || Math.abs(z)>EXT) return false;
    if(keepOut(x,z,pad)) return false;
    for(var i=0;i<TREES.length;i++){ var T=TREES[i], dx=x-T.x, dz=z-T.z, q=TR[i]+pad; if(dx*dx+dz*dz < q*q) return false; }
    return !logNear(x,z,pad+0.4);
  }

  /* ------------------------------------------------------------ foliage cards (own merged mesh, 1 draw call) */
  var CP=[], CN=[], CU=[], CC=[];
  var CELL = [0,1,2,3].map(function(i){
    var cx=i%2, cy=(i>>1);
    return { u0:(cx*256+4)/512, u1:(cx*256+252)/512, vt:(cy*256+4)/512, vb:(cy*256+252)/512 };
  });
  var FROND=0, BUSH=1, LEAF=2, MOSS=3;
  function cvert(p, u, v, c, nx, nz){
    CP.push(p[0],p[1],p[2]); CN.push(nx*0.35, 0.93, nz*0.35); CU.push(u,v); CC.push(c[0],c[1],c[2]);
  }
  /* strip of quads through sections [{c:[x,y,z], h:[hx,hy,hz]}], texture base (v=vb) at section 0 */
  function strip(secs, cell, cb, ct, nx, nz){
    var K = CELL[cell], n = secs.length;
    for(var i=0;i<n-1;i++){
      var A=secs[i], B=secs[i+1], ta=i/(n-1), tb=(i+1)/(n-1);
      var va=mix(K.vb,K.vt,ta), vb=mix(K.vb,K.vt,tb);
      var ca=[mix(cb[0],ct[0],ta),mix(cb[1],ct[1],ta),mix(cb[2],ct[2],ta)], c2=[mix(cb[0],ct[0],tb),mix(cb[1],ct[1],tb),mix(cb[2],ct[2],tb)];
      var al=[A.c[0]-A.h[0],A.c[1]-A.h[1],A.c[2]-A.h[2]], ar=[A.c[0]+A.h[0],A.c[1]+A.h[1],A.c[2]+A.h[2]];
      var bl=[B.c[0]-B.h[0],B.c[1]-B.h[1],B.c[2]-B.h[2]], br=[B.c[0]+B.h[0],B.c[1]+B.h[1],B.c[2]+B.h[2]];
      cvert(al,K.u0,va,ca,nx,nz); cvert(ar,K.u1,va,ca,nx,nz); cvert(br,K.u1,vb,c2,nx,nz);
      cvert(al,K.u0,va,ca,nx,nz); cvert(br,K.u1,vb,c2,nx,nz); cvert(bl,K.u0,vb,c2,nx,nz);
      CNT.cardTris += 2;
    }
  }
  /* upright crossed cards */
  function crossCard(x,y,z,w,h,rot,cell,hex,n){
    n = n||2; var ct = lin(hex), cb = lin(hex,0.38);
    for(var i=0;i<n;i++){
      var a = rot + i*Math.PI/n, hx=Math.cos(a)*w/2, hz=Math.sin(a)*w/2;
      strip([{c:[x,y,z],h:[hx,0,hz]},{c:[x,y+h,z],h:[hx,0,hz]}], cell, cb, ct, -Math.sin(a), Math.cos(a));
    }
  }
  /* a card hanging DOWN from (x,y,z): moss curtains, liana tassels */
  function hangCard(x,y,z,w,h,rot,hex){
    var hx=Math.cos(rot)*w/2, hz=Math.sin(rot)*w/2, ct=lin(hex,0.9), cb=lin(hex,0.55);
    strip([{c:[x,y-h,z],h:[hx,0,hz]},{c:[x,y,z],h:[hx,0,hz]}], MOSS, cb, ct, -Math.sin(rot), Math.cos(rot));
  }
  /* radiating arched fronds: ferns, palm and cycad crowns */
  function frondCrown(x,y,z,R,n,rise,droop,wK,hex,a0){
    var ct = lin(hex), cb = lin(hex,0.42);
    for(var k=0;k<n;k++){
      var a = (a0||0) + k/n*TAU + rr(-0.25,0.25), dx=Math.cos(a), dz=Math.sin(a), L=R*rr(0.8,1.1), w=L*wK/2;
      var hx=-dz*w, hz=dx*w, rs=rise*rr(0.8,1.2);
      strip([ {c:[x+dx*L*0.06, y+L*0.04, z+dz*L*0.06], h:[hx*0.7,0,hz*0.7]},
              {c:[x+dx*L*0.55, y+L*rs,   z+dz*L*0.55], h:[hx,0,hz]},
              {c:[x+dx*L,      y+L*(rs-droop), z+dz*L], h:[hx*0.8,0,hz*0.8]} ], FROND, cb, ct, dx, dz);
    }
  }
  /* giant single leaves on hidden petioles: aroids (broad, spreading) and heliconia/banana (tall, upright) */
  function leafClump(x,y,z,S,n,upright,hex){
    for(var k=0;k<n;k++){
      var a = k/n*TAU + rr(-0.4,0.4), dx=Math.cos(a), dz=Math.sin(a), s=S*rr(0.75,1.15);
      var w = s*(upright?0.17:0.30), hx=-dz*w, hz=dx*w, hh = vary(hex,-0.2,0.1), ct=lin(hh), cb=lin(hh,0.45);
      if(upright) strip([{c:[x+dx*s*0.08,y+s*0.18,z+dz*s*0.08],h:[hx,0,hz]},{c:[x+dx*s*0.3,y+s*0.75,z+dz*s*0.3],h:[hx,0,hz]},
                         {c:[x+dx*s*0.72,y+s*1.02,z+dz*s*0.72],h:[hx,0,hz]}], LEAF, cb, ct, dx, dz);
      else strip([{c:[x+dx*s*0.12,y+s*0.22,z+dz*s*0.12],h:[hx,0,hz]},{c:[x+dx*s*0.55,y+s*0.62,z+dz*s*0.55],h:[hx,0,hz]},
                  {c:[x+dx*s*1.0,y+s*0.42,z+dz*s*1.0],h:[hx,0,hz]}], LEAF, cb, ct, dx, dz);
    }
  }

  /* ------------------------------------------------------------ the atlas: frond | bush / leaf | moss */
  function jungleAtlas(){
    var S=512, cv=document.createElement('canvas'); cv.width=cv.height=S;
    var g=cv.getContext('2d');
    function grey(v){ v=Math.round(clamp(v,0,255)); return 'rgb('+v+','+v+','+v+')'; }
    function ell(x,y,rx,ry,rot,col){ g.save(); g.translate(x,y); g.rotate(rot); g.scale(rx,ry); g.beginPath(); g.arc(0,0,1,0,TAU); g.restore(); g.fillStyle=col; g.fill(); }
    function cellClip(cx,cy,fn){ g.save(); g.beginPath(); g.rect(cx*256+2,cy*256+2,252,252); g.clip(); g.translate(cx*256,cy*256); fn(); g.restore(); }
    /* 0: frond, base at the bottom centre */
    cellClip(0,0,function(){
      for(var i=0;i<30;i++){
        var t=i/29, y=250-t*238, len=(28+96*Math.pow(Math.sin(Math.PI*Math.min(1,t*0.86+0.1)),0.7))*(1-0.2*t), ang=mix(1.05,0.5,t);
        for(var sd=-1;sd<=1;sd+=2){
          var ex=128+sd*Math.sin(ang)*len, ey=y-Math.cos(ang)*len;
          g.beginPath(); g.moveTo(128,y+5); g.quadraticCurveTo(128+sd*len*0.5, y-len*0.05, ex,ey); g.quadraticCurveTo(128+sd*len*0.35, y-len*0.5, 128,y-7); g.closePath();
          g.fillStyle=grey(165+80*rnd()); g.fill();
        }
      }
      g.strokeStyle=grey(120); g.lineWidth=5; g.beginPath(); g.moveTo(128,252); g.lineTo(128,14); g.stroke();
    });
    /* 1: a whole bushy plant */
    cellClip(1,0,function(){
      for(var i=0;i<46;i++){
        var a=rr(-1.35,1.35), L=rr(80,238)*(1-0.25*Math.abs(a)), bx=128, by=254, ex=bx+Math.sin(a)*L, ey=by-Math.cos(a)*L*0.98;
        var lv = 120 + i*2.6;
        g.strokeStyle=grey(lv*0.6); g.lineWidth=3.5; g.beginPath(); g.moveTo(bx,by); g.quadraticCurveTo(bx+Math.sin(a)*L*0.3, by-L*0.6, ex,ey); g.stroke();
        var nl=ri(3,5);
        for(var k=0;k<nl;k++){
          var t=1-k*0.17, px=mix(bx,ex,t)+rr(-6,6), py=mix(by,ey,t*t)+rr(-6,6);
          ell(px,py, rr(17,27), rr(8,12), a+rr(-0.9,0.9)+Math.PI/2, grey(lv+rr(-25,35)));
        }
      }
      ell(128,250,46,20,0,grey(95));
    });
    /* 2: one giant leaf, petiole at the bottom */
    cellClip(0,1,function(){
      g.beginPath(); g.moveTo(128,250);
      g.bezierCurveTo(10,250, -6,120, 128,6); g.bezierCurveTo(262,120, 246,250, 128,250); g.closePath();
      g.fillStyle=grey(215); g.fill();
      g.save(); g.clip();
      for(var i=0;i<13;i++){
        var y=236-i*17;
        for(var sd=-1;sd<=1;sd+=2){
          g.strokeStyle=grey(150); g.lineWidth=2.5; g.beginPath(); g.moveTo(128,y); g.quadraticCurveTo(128+sd*60,y-14,128+sd*130,y-52); g.stroke();
          g.fillStyle=grey(236); g.beginPath(); g.moveTo(128,y-4); g.quadraticCurveTo(128+sd*60,y-20,128+sd*125,y-60); g.lineTo(128+sd*125,y-64); g.quadraticCurveTo(128+sd*60,y-26,128,y-9); g.fill();
        }
      }
      g.strokeStyle=grey(120); g.lineWidth=5; g.beginPath(); g.moveTo(128,252); g.lineTo(128,10); g.stroke();
      g.restore();
      g.globalCompositeOperation='destination-out';
      for(var j=0;j<7;j++){
        var sy=rr(40,215), sd2=chance(0.5)?1:-1;
        g.beginPath(); g.moveTo(128+sd2*134,sy-58); g.lineTo(128+sd2*134,sy-44); g.lineTo(128+sd2*rr(30,70),sy-rr(8,16)); g.closePath(); g.fill();
      }
      g.globalCompositeOperation='source-over';
    });
    /* 3: hanging moss / vine curtain, attached along the top */
    cellClip(1,1,function(){
      g.fillStyle=grey(170); g.fillRect(0,0,256,14);
      for(var i=0;i<54;i++){
        var x=rr(6,250), L=rr(50,250)*(0.55+0.45*Math.sin(x/256*Math.PI)), w0=rr(4,10), lv=rr(140,245), y=0, ph=rr(0,6), n=Math.ceil(L/10);
        g.strokeStyle=grey(lv); g.lineCap='round';
        for(var k=0;k<n;k++){
          var x0=x+Math.sin(ph+k*0.5)*4, x1=x+Math.sin(ph+(k+1)*0.5)*4;
          g.lineWidth=Math.max(1.6, w0*(1-k/n)); g.beginPath(); g.moveTo(x0,y); g.lineTo(x1,y+10); g.stroke(); y+=10;
        }
      }
    });
    var im=g.getImageData(0,0,S,S), d=im.data;
    for(var p=0;p<d.length;p+=4){ if(d[p+3]<110){ d[p]=d[p+1]=d[p+2]=200; } }
    var tex=new THREE.DataTexture(new Uint8Array(d.buffer.slice(0)), S, S, THREE.RGBAFormat);
    tex.generateMipmaps=true; tex.minFilter=THREE.LinearMipmapLinearFilter; tex.magFilter=THREE.LinearFilter;
    tex.encoding=THREE.sRGBEncoding; tex.anisotropy = FAST?1:4; tex.needsUpdate=true;
    /* the library cards (materials.json jfrond, jbush, jvine) replace the frond, the bush and the hanging-moss cells once
       they decode (the vine curtain hangs from the cell's top edge, as the moss did); the giant leaf stays painted. The painting above still runs, so its random draws are unchanged. */
    if(KMAT.mode === 'lib'){
      var cells = [['jfrond',0,0],['jbush',1,0],['jvine',1,1]].filter(function(c){ return KMAT.packed('girder', c[0]); }), left = cells.length;
      cells.forEach(function(c){ KMAT.image(KMAT.packed('girder', c[0]), function(img){
        g.clearRect(c[1]*256, c[2]*256, 256, 256); g.drawImage(img, c[1]*256+2, c[2]*256+2, 252, 252);
        if(--left) return;
        var im2=g.getImageData(0,0,S,S), d2=im2.data;
        for(var p2=0;p2<d2.length;p2+=4){ if(d2[p2+3]<110){ d2[p2]=d2[p2+1]=d2[p2+2]=200; } }
        tex.image.data = new Uint8Array(d2.buffer.slice(0)); tex.needsUpdate = true; }); });
    }
    return tex;
  }

  /* ------------------------------------------------------------ FALLEN LOGS */
  function facingTri(fam,a,b,c,dir,col){
    var ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    if(nx*dir[0]+ny*dir[1]+nz*dir[2] >= 0) MTRI(fam,a,b,c,col); else MTRI(fam,a,c,b,col);
  }
  var FLAT_CU = Math.cos(36*Math.PI/180), FLAT_SU = Math.sin(36*Math.PI/180);
  function buildLog(o){
    /* o: {bx,bz,hx,hz,L,r0,r1,sp,bridge,bow} ; butt at (bx,bz), heading (hx,hz) */
    var n = Math.ceil(o.L/7)+1, pts=[], i, t, s, px=-o.hz, pz=o.hx;
    var yA, yB;
    if(o.bridge){ yA = terrainH(o.bx,o.bz) + o.r0*1.3; yB = terrainH(o.bx+o.hx*o.L, o.bz+o.hz*o.L) - o.r1*0.45; }
    for(i=0;i<n;i++){
      t=i/(n-1); s=t*o.L;
      var off = (o.bow||0)*Math.sin(Math.PI*t), x=o.bx+o.hx*s+px*off, z=o.bz+o.hz*s+pz*off;
      var r = mix(o.r0, o.r1, Math.pow(t,0.9)), y;
      if(o.bridge) y = mix(yA,yB,t);
      else {
        var g0=terrainH(x,z), g1=terrainH(x-o.hx*20,z-o.hz*20), g2=terrainH(x+o.hx*20,z+o.hz*20);
        y = (g0*2+g1+g2)/4 + r*0.12;
      }
      pts.push({ x:x, y:y, z:z, r:r, s:s });
    }
    var fam = 'bark'+o.sp, base = o.sp===2 ? 0xd8d2c4 : PAL.bark[o.sp][0];
    pts.forEach(function(p,k){
      var m = fbm(p.x*0.05+3, p.z*0.05-2);
      p.col = m>0.55 ? shade(PAL.moss[k%3], -0.25) : shade(o.sp===2 ? base : PAL.bark[o.sp][k%3], -0.30-0.2*m);
    });
    var seed0 = rr(0,10);
    TUBE(fam, pts, base, { seg:14, cap:true, capCol:shade(PAL.deadwood[1],-0.25), rfn:function(q,ang,pt){
      var u = -Math.sin(ang), m = 1 + 0.05*Math.sin(3*ang+q*0.7+seed0) + 0.035*Math.sin(7*ang+q*1.3);
      if(o.bridge){
        var k = smooth(3.0, 5.0, pt.r), cu = mix(1.01, FLAT_CU, k);
        if(u > cu) return cu/u;
        return (u > 0.3) ? 1 : m;
      }
      return m;
    }});
    /* root plate at the butt */
    var P0=pts[0], tdir=[-o.hx,0,-o.hz], n1=[px,0,pz], n2=[0,1,0], rim=[], ring=[], nr=16;
    for(i=0;i<nr;i++){
      var a=i/nr*TAU, rrim=o.r0*(1.12+0.55*rnd()), ca=Math.cos(a), sa=Math.sin(a), back=rr(0.9,3);
      rim.push([P0.x+n1[0]*ca*rrim+tdir[0]*back, P0.y+sa*rrim, P0.z+n1[2]*ca*rrim+tdir[2]*back]);
      ring.push([P0.x+n1[0]*ca*o.r0*0.98-tdir[0]*1.2, P0.y+sa*o.r0*0.98, P0.z+n1[2]*ca*o.r0*0.98-tdir[2]*1.2]);
    }
    var ctr=[P0.x+tdir[0]*2.7, P0.y, P0.z+tdir[2]*2.7];
    for(i=0;i<nr;i++){
      var j=(i+1)%nr, a2=(i+0.5)/nr*TAU, rad=[n1[0]*Math.cos(a2), Math.sin(a2), n1[2]*Math.cos(a2)];
      var dc = shade(PAL.deadwood[i%3], -0.35-0.2*rnd()), sc2 = shade(PAL.soil[i%3], -0.35);
      facingTri(fam, ctr, rim[i], rim[j], tdir, chance(0.4)?sc2:dc);
      facingTri(fam, ring[i], rim[i], rim[j], rad, dc); facingTri(fam, ring[i], rim[j], ring[j], rad, dc);
    }
    var nroot = ri(6,8);
    for(i=0;i<nroot;i++){
      var ra=i/nroot*TAU+rr(-0.3,0.3), cr=Math.cos(ra), sr=Math.sin(ra), RL=o.r0*rr(0.9,1.7), rp=[];
      for(var q=0;q<4;q++){
        var f=q/3, out=o.r0*0.55+RL*f, bk=1.8+RL*0.45*f*f;
        rp.push({ x:P0.x+n1[0]*cr*out+tdir[0]*bk, y:P0.y+sr*out - RL*0.25*f*f, z:P0.z+n1[2]*cr*out+tdir[2]*bk, r:o.r0*mix(0.2,0.035,f) });
      }
      TUBE(fam, rp, shade(PAL.deadwood[i%3],-0.3), { seg:5, cap:true });
    }
    /* splintered far end (not the bridge: that is the tapering tree top) */
    var Pn=pts[n-1];
    if(!o.bridge){
      for(i=0;i<7;i++){
        var sa2=rr(0,TAU), sr2=Pn.r*rr(0.15,0.8), bx2=Pn.x+px*Math.cos(sa2)*sr2-o.hx*1.2, by2=Pn.y+Math.sin(sa2)*sr2, bz2=Pn.z+pz*Math.cos(sa2)*sr2-o.hz*1.2;
        var SL=rr(3.5,9);
        CONE(bx2,by2,bz2, Pn.r*rr(0.12,0.28), SL, beamQuat(bx2,by2,bz2, bx2+o.hx*SL+rr(-1.2,1.2), by2+rr(-0.9,1.5), bz2+o.hz*SL+rr(-1.2,1.2)), shade(PAL.deadwood[i%3],-0.2), 'timber');
      }
    }
    var G = { pts:pts, bridge:!!o.bridge, sp:o.sp, cx:(pts[0].x+Pn.x)/2, cz:(pts[0].z+Pn.z)/2, cr:o.L/2+o.r0, hx:o.hx, hz:o.hz, L:o.L, px:px, pz:pz };
    LOGS.push(G); CNT.logs++;
    var mid=pts[n>>1];
    REGISTER({ name:'Fallen hypertree', kind:'log', label:o.bridge?'Log bridge':'Fallen trunk', x:mid.x, y:mid.y-mid.r, z:mid.z, r:o.bridge?o.L*0.5:Math.min(o.L*0.5,o.r0*2.2), h:mid.r*2.2+3 });
    return G;
  }
  function logAt(G, s){                  /* axis point + radius at arc s along the log */
    var P=G.pts, f=clamp(s/G.L,0,1)*(P.length-1), i=Math.min(P.length-2,Math.floor(f)), u=f-i;
    return { x:mix(P[i].x,P[i+1].x,u), y:mix(P[i].y,P[i+1].y,u), z:mix(P[i].z,P[i+1].z,u), r:mix(P[i].r,P[i+1].r,u) };
  }
  function logCandidateOK(o){
    for(var s=-o.r0*1.8; s<=o.L+5; s+=5){
      var t=clamp(s/o.L,0,1), off=(o.bow||0)*Math.sin(Math.PI*t), x=o.bx+o.hx*s-o.hz*off, z=o.bz+o.hz*s+o.hx*off, r=mix(o.r0,o.r1,t), i;
      if(Math.abs(x)>1300 || Math.abs(z)>1300) return false;
      if(riverDist(x,z) < r+10) return false;
      if(keepOut(x,z,r+6)) return false;
      if(segDist(x,z,-340,258,-150,110) < r+40) return false;            /* keep the view from the brook to the ruin open */
      for(i=0;i<TREES.length;i++){ if(Math.hypot(x-TREES[i].x,z-TREES[i].z) < TR[i]+r+10) return false; }
      if(logNear(x,z,r+15)) return false;
    }
    return true;
  }
  /* --- fallen hypertrees, scaled to Girder's 150-270 m trees; the first few are seeded where the views look --- */
  (function(){
    var want = 7, tries = 0, seeds = [[-330,-250],[-430,330],[150,-330],[330,210]];
    while(LOGS.length < want && tries < 4000){
      tries++;
      var c = (seeds.length && tries%3===1) ? seeds[0] : null, R = c ? 60 : rr(260, 1100), a = rr(0,TAU);
      var mx = c ? c[0]+rr(-R,R) : Math.cos(a)*R, mz = c ? c[1]+rr(-R,R) : Math.sin(a)*R;
      var h = rr(0,TAU), L = rr(85,180), r0 = rr(6.5,11.5);
      var o = { hx:Math.cos(h), hz:Math.sin(h), L:L, r0:r0, r1:r0*rr(0.42,0.58), sp:pick([0,0,1,2,3]), bow:rr(-4,4) };
      o.bx = mx - o.hx*L/2; o.bz = mz - o.hz*L/2;
      if(!logCandidateOK(o)) continue;
      if(c) seeds.shift();
      buildLog(o);
    }
  })();

  /* dress the logs: moss cushions, ferns and shrubs on top, bracket fungi on the flanks, moss curtains */
  LOGS.forEach(function(G){
    for(var s=5; s<G.L-2; s+=rr(3.5,6.5)){
      var A=logAt(G,s); if(A.r<1.6) continue;
      if(chance(0.75)){
        var lat = rr(-0.45,0.45)*A.r, up = Math.sqrt(Math.max(0.01, A.r*A.r - lat*lat)), mr = rr(0.22,0.42)*A.r;
        BLOB(A.x+G.px*lat, A.y+up-mr*0.30, A.z+G.pz*lat, mr, mr*rr(0.22,0.4), rr(0,TAU), vary(pick(PAL.moss),-0.3,0.05), KIT_LOOK?'mossy':'leafy'); CNT.moss++;
      }
      if(chance(0.6)){
        var l2 = rr(-0.55,0.55)*A.r, u2 = Math.sqrt(Math.max(0.01, A.r*A.r - l2*l2)), x=A.x+G.px*l2, z=A.z+G.pz*l2, y=A.y+u2-0.4;
        if(chance(0.55)){ frondCrown(x,y,z, rr(1.8,3.6), 6, 0.5, 0.3, 0.36, vary(pick(PAL.fern),-0.3,0.05)); CNT.ferns++; }
        else { crossCard(x,y,z, rr(2.2,4.2), rr(1.8,3.6), rr(0,TAU), BUSH, vary(pick(PAL.under),-0.15,0.2), 2); CNT.shrubs++; }
      }
      if(chance(0.55)){
        var sd = chance(0.5)?1:-1, el = rr(0.05,0.75), fr = rr(0.6,1.7);
        var fx=A.x+G.px*sd*A.r*Math.cos(el)*0.96, fy=A.y+A.r*Math.sin(el)*0.96, fz=A.z+G.pz*sd*A.r*Math.cos(el)*0.96;
        if(fy > terrainH(fx,fz)+0.4){
          BLOB(fx,fy,fz, fr, fr*rr(0.22,0.4), rr(0,TAU), vary(pick(PAL.fungus),-0.2,0.15), 'leafy'); CNT.brackets++;
        }
      }
      if(A.r>4 && chance(0.4)){
        var sd3 = chance(0.5)?1:-1, mx2=A.x+G.px*sd3*A.r*0.97, mz2=A.z+G.pz*sd3*A.r*0.97;
        hangCard(mx2, A.y+A.r*0.2, mz2, rr(3,6), Math.min(A.r*0.9, rr(3,6.5)), Math.atan2(G.hz,G.hx), vary(pick(PAL.moss),-0.25,0.05)); CNT.moss++;
      }
    }
  });

  /* ------------------------------------------------------------ THE BROOK */
  var S_LO = 1e9, S_HI = -1e9;
  (function(){ for(var s=0;s<RIVER_LEN;s+=10){ var R=riverAt(s); if(Math.abs(R.x)<EXT && Math.abs(R.z)<EXT){ S_LO=Math.min(S_LO,s); S_HI=Math.max(S_HI,s); } } })();
  function rockCol(){ return shade(pick(PAL.rock), rr(-0.42,-0.12)); }
  /* a rock at channel coordinates (s, lateral d signed); `top` metres above the water */
  function brookRock(s, lat, r, top, flat){
    var R=riverAt(s), x=R.x-R.tz*lat, z=R.z+R.tx*lat; if(nearFord(x,z,0.3)) return null;
    var g=gY(x,z), lv=brookLevel(s), base=g-0.25*r, tp=Math.max(g+r*0.35, lv+top);
    BLOB(x, base, z, r, (tp-base), rr(0,TAU), rockCol(), 'rock'); CNT.rocks++;
    if(Math.abs(lat) < riverHalfAt(s)) JUNGLE_ROCKS.push({ x:x, z:z, r:r*0.85, s:s, y:tp });
    if(!flat && r>0.9 && chance(0.55)){ BLOB(x+rr(-0.2,0.2), tp-r*0.16, z+rr(-0.2,0.2), r*0.62, r*0.2, rr(0,TAU), vary(pick(PAL.moss),-0.3,0), KIT_LOOK?'mossy':'leafy'); CNT.moss++; }
    return [x,tp,z];
  }
  function pebble(x,z,r){
    if(nearFord(x,z,0)) return;
    var g=gY(x,z); FR5(x, g-r*0.3, z, r*rr(1.4,2.2), r*rr(0.7,1.1), r*rr(1.2,1.9), rr(0,TAU), shade(pick(PAL.rock), rr(-0.3,0.12)), 'rock'); CNT.pebbles++;
  }
  /* --- the cascade: a broken line of rocks at each lip, boulders on the shoulders, rubble in the pools --- */
  (function(){
    JUNGLE_BROOK.steps.forEach(function(ss, li){
      var half=riverHalfAt(ss), lat=-half-1.2;
      while(lat < half+1.2){
        var r=rr(0.55,1.15), gap=chance(0.35)?rr(0.5,1.1):rr(0.05,0.3);
        lat += r;
        if(chance(0.85)) brookRock(ss-0.5+rr(-0.35,0.35), lat, r, rr(0.04,0.4)+(Math.abs(lat)>half-0.6?rr(0.3,0.8):0), false);
        lat += r*0.8+gap;
      }
      for(var k=0;k<7;k++) brookRock(ss+rr(0.8,3.4), rr(-1,1)*half*0.95, rr(0.35,0.8), rr(-0.1,0.3), true);
    });
    for(var b=0;b<16;b++){
      var sb=CAS.s+rr(-0.75,0.8)*CAS.run, sd=(b%2?1:-1), hb=riverHalfAt(sb)+rr(0.8,5.5), rb=rr(1.1,2.7);
      brookRock(sb, sd*hb, rb, rb*rr(0.4,0.8)+0.4, false);
    }
    for(var d=0;d<2;d++){                                       /* drift logs jammed at the head */
      var sd2=CAS.s+rr(-0.62,-0.4)*CAS.run, Rd=riverAt(sd2), vd=rr(-0.5,0.5)*riverHalfAt(sd2), x3=Rd.x-Rd.tz*vd, z3=Rd.z+Rd.tx*vd, wl3=brookLevel(sd2);
      var ah=Math.atan2(Rd.tx,-Rd.tz)+rr(-0.6,0.6), LL=rr(5,8), r3=rr(0.22,0.4);
      TUBE('bark0', [{x:x3-Math.cos(ah)*LL/2,y:wl3+rr(0.1,0.4),z:z3-Math.sin(ah)*LL/2,r:r3},{x:x3,y:wl3+rr(0.25,0.5),z:z3,r:r3*0.9},{x:x3+Math.cos(ah)*LL/2,y:wl3+rr(0.2,0.9),z:z3+Math.sin(ah)*LL/2,r:r3*0.6}],
           shade(pick(PAL.deadwood),rr(-0.1,0.25)), { seg:6, cap:true }); CNT.driftlogs++;
    }
    REGISTER({ name:'The brook', kind:'cataract', label:'Cascade', x:CAS.x, y:brookLevel(CAS.s+CAS.run)-1, z:CAS.z, r:CAS.run*0.8, h:CAS.drop+5 });
  })();
  /* --- the quiet reaches: bank rocks, pebble bars, mid-stream stones, reeds, pads --- */
  (function(){
    for(var s=S_LO; s<S_HI; s+=2.5){
      var R=riverAt(s), dO=Math.hypot(R.x,R.z), near = dO<620 ? 1 : (dO<1000 ? 0.4 : 0.15);
      var ck=cataractK(s), half=riverHalfAt(s), lv=brookLevel(s), rockK = 0.45+0.55*fbm(s*0.021,3.3);
      for(var sd=-1; sd<=1; sd+=2){
        if(chance(0.30*rockK*near)) brookRock(s+rr(-1,1), sd*(half+rr(-0.9,2.2)), rr(0.45,1.3)*(chance(0.1)?1.7:1), rr(0.15,0.7), false);
        if(near===1 && chance(0.55*rockK)){                                /* pebbles at the water's edge */
          var np=ri(2,4); for(var p=0;p<np;p++){ var lt=sd*(half+rr(-1.3,1.1)), ss=s+rr(-1.2,1.2), Rp=riverAt(ss); pebble(Rp.x-Rp.tz*lt, Rp.z+Rp.tx*lt, rr(0.10,0.30)); }
        }
        if(ck<0.3 && chance(0.34*near)){                                   /* reeds / rushes on the bank */
          var o2=half+rr(0.3,2.6), xr=R.x-R.tz*o2*sd+rr(-0.8,0.8), zr=R.z+R.tx*o2*sd+rr(-0.8,0.8);
          if(!keepOut(xr,zr,0.5)){ crossCard(xr, gY(xr,zr)-0.15, zr, rr(1.2,2.4), rr(1.4,3.0), rr(0,TAU), BUSH, vary(pick(PAL.palm),-0.15,0.2), 2); CNT.reeds++; }
        }
        if(ck<0.05 && near===1 && chance(0.06)){                           /* floating pads in the slack water */
          var xp=R.x-R.tz*(half-rr(0.6,1.4))*sd, zp=R.z+R.tx*(half-rr(0.6,1.4))*sd, w=rr(0.35,0.7), ap=rr(0,TAU), ca=Math.cos(ap)*w, sa=Math.sin(ap)*w;
          if(!nearFord(xp,zp,1)){ var hc=vary(pick(PAL.palm),-0.2,0.1);
            strip([{c:[xp-ca,lv+0.13,zp-sa],h:[-sa,0,ca]},{c:[xp+ca,lv+0.13,zp+sa],h:[-sa,0,ca]}], LEAF, lin(hc,0.8), lin(hc), 0,0); CNT.pads++; }
        }
      }
      if(ck<0.3 && chance(0.10*near)) brookRock(s, rr(-0.75,0.75)*half, rr(0.4,1.0), rr(0.05,0.35), true);
      if(near===1 && ck<0.2 && chance(0.05)){                             /* a little gravel bar on the inside of the bend */
        var sdb=chance(0.5)?1:-1; for(var q=0;q<9;q++){ var sq=s+rr(-3,3), Rq=riverAt(sq), lq=sdb*(half+rr(-1.6,0.4)); pebble(Rq.x-Rq.tz*lq, Rq.z+Rq.tx*lq, rr(0.14,0.38)); }
      }
    }
  })();
  /* --- stepping stones where a hunters' path crosses W of the palisade --- */
  (function(){
    var rv=polyNear(-290,70,RIVER,RIVER_CUM), s=rv.t, half=riverHalfAt(s);
    for(var lat=-half-0.6; lat<=half+0.7; lat+=1.25){ var st=brookRock(s+rr(-0.25,0.25), lat, rr(0.55,0.72), 0.16, true); if(st) CNT.stones++; }
    var R=riverAt(s); REGISTER({ name:'The brook', kind:'ford', label:'Stepping stones', x:R.x, y:brookLevel(s)-1, z:R.z, r:half+2, h:3 });
  })();
  /* --- the plank footbridge on the south gate track --- */
  (function(){
    var F=FORD, z0=F.z-F.L/2, z1=F.z+F.L/2, W=2.3, yd=F.lv+1.15, arch=0.28;
    function deckY(z){ var t=(z-z0)/(z1-z0); return yd + arch*4*t*(1-t); }
    var nP=Math.round(F.L/0.34), k;
    for(k=0;k<nP;k++){ var zc=z0+(k+0.5)*F.L/nP, t=(zc-z0)/F.L, slope=-Math.atan(arch*4*(1-2*t)/F.L);
      BOX(F.x+rr(-0.05,0.05), deckY(zc)-0.03, zc, W+rr(-0.08,0.1), 0.07, F.L/nP-0.035, [slope,rr(-0.015,0.015),0], vary(pick(PAL.plank),-0.22,0.02), 'plank'); }
    [-1,1].forEach(function(sd){
      var xs=F.x+sd*(W/2-0.28), nS=4, prev=null;
      for(k=0;k<nS;k++){ var za=mix(z0,z1,k/nS), zb=mix(z0,z1,(k+1)/nS); BEAM(xs,deckY(za)-0.2,za, xs,deckY(zb)-0.2,zb, 0.2,0.28, PAL.timber[2], 'timber'); }
      var nPost=Math.max(3,Math.round(F.L/2.6));
      for(k=0;k<=nPost;k++){ var zp=mix(z0+0.15,z1-0.15,k/nPost), xp=F.x+sd*(W/2+0.06), g=gY(xp,zp), y1=deckY(zp)+1.05;
        ROD(xp,g-0.6,zp, xp+sd*0.04,y1,zp, 0.085, pick(PAL.timber), 'timber');
        if(prev){ ROD(prev[0],prev[1]-0.06,prev[2], xp,y1-0.06,zp, 0.03, pick(PAL.rope), 'rope'); ROD(prev[0],prev[1]-0.55,prev[2], xp,y1-0.55,zp, 0.026, pick(PAL.rope), 'rope'); }
        prev=[xp,y1,zp]; }
    });
    /* trestle bents under the deck */
    [0.3,0.7].forEach(function(t){ var zb=mix(z0,z1,t); BEAM(F.x-W/2-0.1,deckY(zb)-0.42,zb, F.x+W/2+0.1,deckY(zb)-0.42,zb, 0.2,0.2, PAL.timber[0], 'timber'); });
    /* ramps down to the track and stone abutments */
    [[z0,-1],[z1,1]].forEach(function(e){
      var ze=e[0]+e[1]*2.6, ge=gY(F.x,ze)+0.04;
      BEAM(F.x,yd-0.02,e[0], F.x,ge,ze, W,0.08, PAL.plank[3], 'plank');
      for(var c=0;c<3;c++){ var zc2=mix(e[0],ze,(c+0.6)/3.2), yc=mix(yd,ge,(c+0.6)/3.2)+0.04; BOX(F.x,yc,zc2, W-0.1,0.05,0.09, 0, PAL.timber[1], 'timber'); }
      [-1,1].forEach(function(sd){ var xa=F.x+sd*(W/2+0.45), za=e[0]+e[1]*0.5, r=rr(0.7,1.0), g2=gY(xa,za); BLOB(xa,g2-0.3,za, r, Math.max(0.5,yd-g2-0.05)+0.3, rr(0,TAU), rockCol(), 'rock'); CNT.rocks++; });
    });
    /* the planner's track slabs (50-structure.js) arrive as a low causeway that overhangs the north bank: revet its end in stone */
    (function(){
      var zS=z0+1.2, k;
      for(k=0;k<7;k++){ var xr=F.x-3.3+k*1.1+rr(-0.2,0.2), zr=zS+rr(0.2,1.3)+(Math.abs(k-3)<1.5?0.9:0), g3=gY(xr,zr), r=rr(0.75,1.15);
        if(Math.abs(xr-F.x) < W/2+0.2) continue;
        BLOB(xr, g3-0.4, zr, r, Math.max(0.6, yd-0.12-g3)+0.4, rr(0,TAU), rockCol(), 'rock'); CNT.rocks++; }
    })();
    REGISTER({ name:'South track', kind:'bridge', label:'Plank footbridge over the brook', x:F.x, y:F.lv-0.5, z:F.z, r:F.L/2+2.5, h:3.2 });
    JUNGLE_BROOK.bridge = CNT.bridge = { x:F.x, z:+F.z.toFixed(1), z0:+z0.toFixed(1), z1:+z1.toFixed(1), deck:+yd.toFixed(2), water:+F.lv.toFixed(2), L:+F.L.toFixed(1), W:W };
  })();

  /* ------------------------------------------------------------ UNDERSTOREY */
  function subTree(x,y,z,dO){
    var H = rr(10,30)*(chance(0.25)?1:0.8), r = 0.3+H*0.022, lean=rr(0,TAU), lk=rr(0,0.06)*H;
    var fam0 = chance(0.5)?'bark3':'bark0', fam = KIT_LOOK ? 'jbark' : fam0, col = shade(pick(chance(0.5)?PAL.deadwood:PAL.bark[3]), rr(-0.45,-0.15));   /* the library look: the mahogany's flaky bark on the sub-canopy trees */
    var but = rr(1.8,2.8), near = dO<600;
    TUBE(fam, [ {x:x,y:y-1,z:z,r:r}, {x:x,y:y+H*0.1,z:z,r:r}, {x:x+Math.cos(lean)*lk*0.4,y:y+H*0.5,z:z+Math.sin(lean)*lk*0.4,r:r*0.8}, {x:x+Math.cos(lean)*lk,y:y+H*0.86,z:z+Math.sin(lean)*lk,r:r*0.5} ],
         col, { seg:near?6:4, rfn:function(q,ang){ return q===0 ? (Math.cos(3*ang)>0 ? but : 0.9) : 1; } });
    var cx=x+Math.cos(lean)*lk, cz=z+Math.sin(lean)*lk, cr=H*rr(0.26,0.36), hc=pick(PAL.under), cy=y+H*0.74;
    BLOB(cx,cy,cz, cr, cr*rr(0.7,1.05), rr(0,TAU), vary(hc,-0.1,0.3), 'leafy');
    if(near){
      CONE(cx,cy+0.05,cz, cr*0.9, cr*0.55, [Math.PI,rr(0,TAU),0], shade(hc,-0.22), 'leafy');
      if(dO<480){ var nb=ri(2,3), a=rr(0,TAU);
        for(var b=0;b<nb;b++){ a+=TAU/nb+rr(-0.4,0.4); var d=cr*rr(0.6,0.95), r2=cr*rr(0.5,0.72), y2=cy-cr*rr(0.25,0.7);
          BLOB(cx+Math.cos(a)*d, y2, cz+Math.sin(a)*d, r2, r2*rr(0.7,1.0), rr(0,TAU), vary(pick(PAL.under),-0.1,0.3), 'leafy');
          CONE(cx+Math.cos(a)*d, y2+0.05, cz+Math.sin(a)*d, r2*0.9, r2*0.5, [Math.PI,0,0], shade(hc,-0.25), 'leafy');
          ROD(cx,cy-cr*0.9,cz, cx+Math.cos(a)*d,y2,cz+Math.sin(a)*d, r*0.3, col, 'timber'); } }
      if(chance(0.6)){ var nm=ri(1,2);
        for(var m=0;m<nm;m++){ var am=rr(0,TAU), dm=cr*rr(0.3,0.85); hangCard(cx+Math.cos(am)*dm, cy+0.5, cz+Math.sin(am)*dm, rr(3,6), rr(4,9), rr(0,TAU), vary(pick(PAL.moss),-0.3,0)); CNT.moss++; } }
      if(chance(0.4)){ var al=rr(0,TAU), dl=cr*rr(0.4,0.8), lx=cx+Math.cos(al)*dl, lz=cz+Math.sin(al)*dl, gx=lx+rr(-2,2), gz=lz+rr(-2,2);
        ROD(lx,cy+1,lz, gx,terrainH(gx,gz)-0.3,gz, rr(0.05,0.11), shade(pick(PAL.deadwood),-0.3), 'rope'); CNT.lianas++; }
    }
    CNT.trees++;
  }
  function palm(x,y,z,dO){
    var cyc = chance(0.3), H = cyc ? rr(1.0,2.6) : rr(4,12), r = cyc ? rr(0.35,0.6) : 0.16+H*0.016, la=rr(0,TAU), lk=cyc?0:H*rr(0.05,0.28);
    var pts=[];
    for(var i=0;i<4;i++){ var f=i/3; pts.push({ x:x+Math.cos(la)*lk*f*f, y:y-0.6+(H+0.6)*f, z:z+Math.sin(la)*lk*f*f, r:r*(1-0.3*f) }); }
    TUBE('bark3', pts, shade(pick(PAL.deadwood), rr(-0.3,0)), { seg:dO<450?5:3 });
    var T=pts[3], hc=vary(pick(PAL.palm),-0.3,0.08);
    frondCrown(T.x,T.y,T.z, cyc?rr(2.2,3.6):rr(3.2,5.6), dO<450?8:5, cyc?0.45:0.32, cyc?0.2:0.5, 0.34, hc);
    if(dO<330) frondCrown(T.x,T.y+0.3,T.z, cyc?1.7:2.5, 5, 0.75, 0.1, 0.34, shade(hc,0.08), 0.6);
    CNT.palms++;
  }
  function shrub(x,y,z,dO,big){
    var hc=pick(PAL.under);
    if(dO<340 || (big && dO<520)){
      var n=ri(1,2)+(big?1:0), R=rr(1.5,3.2)*(big?1.3:1);
      for(var i=0;i<n;i++){ var a=rr(0,TAU), d=i?R*rr(0.5,0.9):0, r=R*(i?rr(0.5,0.8):1);
        BLOB(x+Math.cos(a)*d, y-0.4, z+Math.sin(a)*d, r, r*rr(0.7,1.15), rr(0,TAU), vary(hc,-0.3,0.12), 'leafy'); }
      if(chance(0.6)) crossCard(x,y+R*0.45,z, R*2.0, R*1.3, rr(0,TAU), BUSH, vary(hc,-0.05,0.25), 2);
    } else crossCard(x,y-0.3,z, rr(3.5,7), rr(2.8,5.5), rr(0,TAU), BUSH, vary(hc,-0.25,0.15), 2);
    CNT.shrubs++;
  }
  function fern(x,y,z,dO){
    var hc=vary(pick(PAL.fern),-0.35,0.05);
    if(dO<520){
      var tree = chance(0.2), R=rr(1.8,3.8), ty=y;
      if(tree){ ty=y+rr(1.5,4); ROD(x,y-0.5,z, x+rr(-0.4,0.4),ty,z+rr(-0.4,0.4), rr(0.16,0.3), shade(PAL.deadwood[1],-0.4), 'timber'); }
      frondCrown(x,ty-0.15,z, R, tree?7:6, tree?0.3:0.5, tree?0.45:0.28, 0.36, hc);
    } else crossCard(x,y-0.3,z, rr(3.5,6.5), rr(1.8,3.2), rr(0,TAU), BUSH, hc, 2);
    CNT.ferns++;
  }
  function aroid(x,y,z,dO){
    var up = chance(0.45), hc=pick(up?PAL.palm:PAL.under);
    if(dO<620) leafClump(x,y-0.25,z, up?rr(3.2,6):rr(2,4), dO<420?ri(4,6):3, up, up?shade(hc,-0.15):shade(hc,0.1));
    else crossCard(x,y-0.3,z, rr(3.5,5.5), rr(2.8,5), rr(0,TAU), BUSH, vary(hc,-0.2,0.1), 2);
    CNT.aroids++;
  }
  function sapling(x,y,z,dO){
    var H=rr(3.5,8), hc=vary(pick(PAL.sapling),-0.3,0.05);
    if(dO<420){ ROD(x,y-0.3,z, x+rr(-0.3,0.3),y+H*0.8,z+rr(-0.3,0.3), 0.05+H*0.008, shade(pick(PAL.deadwood),-0.25), 'timber');
      crossCard(x,y+H*0.3,z, H*rr(0.4,0.55), H*0.75, rr(0,TAU), BUSH, hc, 2); }
    else crossCard(x,y-0.3,z, rr(1.8,3.2), H, rr(0,TAU), BUSH, hc, 2);
    CNT.saplings++;
  }
  function fungi(x,y,z,dO){
    var n = dO<600 ? ri(3,6) : 2, giant = chance(0.3), glow = chance(0.22);
    for(var i=0;i<n;i++){
      var a=rr(0,TAU), d=i?rr(0.5,2.2):0, fx=x+Math.cos(a)*d, fz=z+Math.sin(a)*d, fy=terrainH(fx,fz);
      var cr=(giant&&i===0)?rr(1.0,1.9):rr(0.3,0.85), st=cr*rr(0.9,1.9), hc=vary(pick(PAL.fungus),-0.15,0.2);
      if(st>0.6) ROD(fx,fy-0.3,fz, fx+rr(-0.12,0.12),fy+st,fz+rr(-0.12,0.12), cr*0.2, shade(PAL.fungus[2],0.15), 'timber');
      if(dO<380) BLOB(fx, fy+(st>0.6?st-0.08:0), fz, cr, cr*rr(0.35,0.7), rr(0,TAU), hc, 'leafy');
      else CONE(fx, fy+(st>0.6?st-0.08:0), fz, cr, cr*rr(0.4,0.75), rr(0,TAU), hc, 'leafy');
    }
    if(glow && dO<700) nlLampAdd(x, y+1.2, z, 0.22, 5.5, true);        /* a faintly bioluminescent clump */
    CNT.fungi++;
  }
  function boulder(x,y,z,dO){
    var n = dO<420 ? ri(1,3) : 1, R=rr(1.2,3.4);
    for(var i=0;i<n;i++){ var a=rr(0,TAU), d=i?R*rr(0.7,1.2):0, r=R*(i?rr(0.35,0.7):1), bx=x+Math.cos(a)*d, bz=z+Math.sin(a)*d, by=terrainH(bx,bz), h=r*rr(0.55,0.95);
      BLOB(bx, by-r*0.25, bz, r, h+r*0.25, rr(0,TAU), rockCol(), 'rock');
      if(dO<520){ BLOB(bx+rr(-0.15,0.15)*r, by+h*0.62, bz+rr(-0.15,0.15)*r, r*rr(0.62,0.8), h*0.42, rr(0,TAU), vary(pick(PAL.moss),-0.3,0.02), KIT_LOOK?'mossy':'leafy'); CNT.moss++; }
      if(dO<420 && i===0 && chance(0.6)){ frondCrown(bx+r*0.5, by+h*0.55, bz+r*0.3, rr(1.2,2.2), 5, 0.5, 0.3, 0.36, vary(pick(PAL.fern),-0.3,0.05)); CNT.ferns++; } }
    CNT.boulders++;
  }

  var DENS = 1.0;
  /* the planner's ground-level viewpoints (80-camera.js): nothing tall is planted on top of them */
  var VIEWPTS = [[-330,250],[30,-285],[-420,-330],[CAS.x-38,CAS.z+30]];
  function nearView(x,z,r){ for(var i=0;i<VIEWPTS.length;i++) if(Math.hypot(x-VIEWPTS[i][0],z-VIEWPTS[i][1])<r) return true; return false; }
  (function(){
    var cell = 8, n = Math.ceil(EXT*2/cell);
    for(var iz=0; iz<n; iz++) for(var ix=0; ix<n; ix++){
      var x = -EXT + (ix + rnd())*cell, z = -EXT + (iz + rnd())*cell, u = rnd();
      var dO = Math.hypot(x,z);
      if(dO < CLEARINGS[0][2]) continue;
      var fall = dO<450 ? 1 : mix(1, 0.03, smooth(450, 1050, dO));
      if(u > fall*1.25*DENS) continue;
      var rv = polyNear(x,z,RIVER,RIVER_CUM), rd = rv.d - riverHalfAt(rv.t);
      if(rd < 1.2) continue;
      var bank = 1 - smooth(6, 50, rd);
      var clump = 0.40 + 0.75*fbm(x*0.016+7, z*0.016-3);
      if(u > fall*DENS*clamp(clump + 0.45*bank, 0, 1.25)) continue;
      if(!okGround(x,z,1.4)) continue;
      var tkd=trackDist(x,z); if(tkd<16 && u > 0.35*smooth(4,16,tkd)) continue;      /* the gate tracks stay open and trodden */
      var y = gY(x,z), t = rnd(), patch = fbm(x*0.006-11, z*0.006+5), far = dO>900;
      if(t < 0.07){
        var okT = rd>6 && trackDist(x,z)>36 && !nearView(x,z,26) && dO>CLEARINGS[0][2]+10;
        for(var i=0;i<TREES.length && okT;i++){ var T=TREES[i]; if(Math.hypot(x-T.x,z-T.z) < TR[i] + 9) okT=false; }
        if(okT) subTree(x,y,z,dO); else shrub(x,y,z,dO);
      }
      else if(t < 0.12 + 0.10*bank){ if(nearView(x,z,12)) fern(x,y,z,dO); else palm(x,y,z,dO); }
      else if(t < 0.42 + 0.10*(patch-0.5)) fern(x,y,z,dO);
      else if(t < 0.60) shrub(x,y,z,dO, chance(0.2));
      else if(t < 0.76) aroid(x,y,z,dO);
      else if(t < 0.86) sapling(x,y,z,dO);
      else if(t < 0.915 && dO<1000) fungi(x,y,z,dO);
      else if(t < 0.955 && dO<1100 && rd>3) boulder(x,y,z,dO);
      else shrub(x,y,z,dO);
    }
  })();

  /* bracket fungi, moss skirts on the hypertree boles */
  TREES.forEach(function(T, ti){
    var nb = Math.hypot(T.x,T.z)<700 ? ri(10,16) : 5;
    for(var i=0;i<nb;i++){
      var a = rr(0,TAU), gy0 = terrainH(T.x+Math.cos(a)*(TR[ti]+1), T.z+Math.sin(a)*(TR[ti]+1));
      var y = gy0 + rr(1.2, 19), R = trunkR(T,y), r = rr(0.8,2.5);
      var x = T.x+Math.cos(a)*(R-0.15*r), z = T.z+Math.sin(a)*(R-0.15*r), hc=vary(pick(PAL.fungus),-0.2,0.18);
      BLOB(x,y,z, r, r*rr(0.2,0.36), rr(0,TAU), hc, 'leafy'); CNT.brackets++;
      if(chance(0.5)){ var a2=a+rr(0.04,0.09), y2=y+r*rr(0.5,0.9), R2=trunkR(T,y2), r2=r*rr(0.5,0.8); BLOB(T.x+Math.cos(a2)*(R2-0.15*r2),y2,T.z+Math.sin(a2)*(R2-0.15*r2), r2, r2*0.3, rr(0,TAU), shade(hc,rr(-0.1,0.1)), 'leafy'); CNT.brackets++; }
      if(chance(0.55)){ var a3=a+rr(0.3,1.2), y3=gy0+rr(6,24), R3=trunkR(T,y3)+0.2;
        hangCard(T.x+Math.cos(a3)*R3, y3, T.z+Math.sin(a3)*R3, rr(3.5,7.5), rr(4,10), a3+Math.PI/2, vary(pick(PAL.moss),-0.3,0)); CNT.moss++; }
    }
  });

  /* ------------------------------------------------------------ LIANAS + HANGING MOSS from the boughs */
  (function(){
    function blocked(x,z,yTop,yBot){
      var i;
      for(i=0;i<TOWERS.length;i++){ var W=TOWERS[i]; if(Math.abs(x-W.x) < W.deck.half+6 && Math.abs(z-W.z) < W.deck.half+6 && yBot < W.top+20) return true; }
      for(i=0;i<BRIDGES.length;i++){ var B=BRIDGES[i]; if(segDist(x,z,B.a.x,B.a.z,B.b.x,B.b.z) < B.w/2+2.5 && yBot < Math.max(B.a.y,B.b.y)+8) return true; }
      for(i=0;i<TREES.length;i++){ var T=TREES[i]; if(Math.hypot(x-T.x,z-T.z) < trunkR(T,yBot)+1.5) return true; }
      return Math.hypot(x,z) < PAL_R+8 && yBot < SETTLE_Y+40;
    }
    BRANCHES.forEach(function(B){
      var dO=Math.hypot(B.tree.x,B.tree.z); if(dO>1000) return;
      var low = B.pts[Math.floor(B.pts.length/2)].y, n = low<SETTLE_Y+120 ? 3 : (chance(0.5)?2:1);
      if(dO>650) n=1;
      for(var k=0;k<n;k++){
        var i=ri(2,B.pts.length-2), p=B.pts[i], q=B.pts[Math.min(B.pts.length-1,i+1)], f=rnd();
        var x=mix(p.x,q.x,f), z=mix(p.z,q.z,f), yT=mix(p.y,q.y,f)-mix(p.r,q.r,f)*0.85, g=Math.max(terrainH(x,z), inRiver(x,z,0)?riverLevel(polyNear(x,z,RIVER,RIVER_CUM).t):-99);
        var len=Math.min(yT-g-rr(-1,8), rr(28,95)); if(len<8) continue;
        var yB=yT-len; if(blocked(x,z,yT,yB)) continue;
        var dr=rr(0,TAU), sway=len*rr(0.02,0.07), r=rr(0.10,0.21), hc=shade(pick(PAL.deadwood),rr(-0.45,-0.15));
        var x1=x+Math.cos(dr)*sway*0.35, z1=z+Math.sin(dr)*sway*0.35, x2=x+Math.cos(dr)*sway, z2=z+Math.sin(dr)*sway;
        ROD(x,yT+0.5,z, x1,yT-len*0.45,z1, r, hc, 'rope'); ROD(x1,yT-len*0.45,z1, x2,yB,z2, r*0.85, hc, 'rope');
        if(chance(0.6)){ var xo=x+rr(-0.8,0.8), zo=z+rr(-0.8,0.8); ROD(xo,yT+0.5,zo, x2+rr(-1.2,1.2),yB+rr(2,12),z2+rr(-1.2,1.2), r*0.6, shade(hc,-0.15), 'rope'); }
        if(yB-g>3) hangCard(x2,yB+2,z2, rr(2,4), rr(3,6), rr(0,TAU), vary(pick(PAL.under),-0.2,0.1));
        CNT.lianas++;
      }
      var nm = dO<650 ? 3 : 1;                                   /* moss beards under the bough */
      for(var m=0;m<nm;m++){
        var j=ri(1,B.pts.length-2), a=B.pts[j], b=B.pts[j+1], xm=(a.x+b.x)/2, zm=(a.z+b.z)/2, ym=(a.y+b.y)/2-(a.r+b.r)/2*0.8, hh=rr(5.5,14);
        if(blocked(xm,zm,ym,ym-hh)) continue;
        hangCard(xm,ym,zm, Math.hypot(b.x-a.x,b.z-a.z)*rr(0.6,1.0)+2, hh, Math.atan2(b.z-a.z,b.x-a.x), vary(pick(PAL.moss),-0.35,-0.05)); CNT.moss++;
      }
    });
  })();

  /* ------------------------------------------------------------ emit the cards */
  (function(){
    if(!CP.length) return;
    var g=new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(CP,3));
    g.setAttribute('normal',   new THREE.Float32BufferAttribute(CN,3));
    g.setAttribute('uv',       new THREE.Float32BufferAttribute(CU,2));
    g.setAttribute('color',    new THREE.Float32BufferAttribute(CC,3));
    g.computeBoundingSphere();
    var mat = new THREE.MeshLambertMaterial({ vertexColors:true, map:jungleAtlas(), alphaTest:0.42, side:THREE.DoubleSide });
    nlMaterial(mat, 'junglecards', function(sh){
      /* cards carry an up-ish normal on purpose: light both faces the same */
      sh.fragmentShader = sh.fragmentShader.split('( gl_FrontFacing ) ? vLightFront : vLightBack').join('vLightFront')
                                           .split('( gl_FrontFacing ) ? vIndirectFront : vIndirectBack').join('vIndirectFront');
    });
    var m=new THREE.Mesh(g,mat); m.frustumCulled=false; m.castShadow=!FAST; m.receiveShadow=!FAST;
    m.userData.inspectLabel='Undergrowth'; scene.add(m); JUNGLE_CARDS=m;
    CP=CN=CU=CC=null;
  })();

  /* ------------------------------------------------------------ cascade spray (animated, 1 draw call) */
  (function(){
    var N=46, pos=new Float32Array(N*3), col=new Float32Array(N*3), st=[];
    function spawn(i, warm){
      var ss=JUNGLE_BROOK.steps[i%JUNGLE_BROOK.steps.length]+0.5+Math.random()*1.2, R=riverAt(ss), half=riverHalfAt(ss), v=(Math.random()*2-1)*0.8;
      pos[i*3]=R.x-R.tz*half*v; pos[i*3+1]=brookLevel(ss)+0.15+Math.random()*0.5; pos[i*3+2]=R.z+R.tx*half*v;
      st[i]={ age: warm?Math.random()*5:0, life:2.5+Math.random()*3.5, vx:R.tx*(0.5+Math.random()*0.5)+(Math.random()-0.5)*0.3, vz:R.tz*(0.5+Math.random()*0.5)+(Math.random()-0.5)*0.3, vy:0.25+Math.random()*0.45 };
    }
    for(var i=0;i<N;i++) spawn(i,true);
    var cv=document.createElement('canvas'); cv.width=cv.height=64; var g2=cv.getContext('2d'), gr=g2.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,0.5)'); gr.addColorStop(0.4,'rgba(255,255,255,0.2)'); gr.addColorStop(1,'rgba(255,255,255,0)');
    g2.fillStyle=gr; g2.fillRect(0,0,64,64);
    var geo=new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3)); geo.setAttribute('color', new THREE.BufferAttribute(col,3));
    var mat=new THREE.PointsMaterial({ size:4.2, map:new THREE.CanvasTexture(cv), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, vertexColors:true, sizeAttenuation:true, fog:false });
    var pts=new THREE.Points(geo,mat); pts.frustumCulled=false; pts.renderOrder=3; pts.userData.inspectLabel='Cascade spray'; scene.add(pts);
    TICKS.push(function(dt, hour, nightK){
      dt=Math.min(dt,0.1);
      var day = 1-0.85*clamp(nightK||0,0,1), den = (scene.fog && scene.fog.density) || 0.0005, dc=Math.hypot(camera.position.x-CAS.x, camera.position.z-CAS.z)*den, fade=Math.exp(-dc*dc)*0.22*day;
      for(var i=0;i<N;i++){
        var S=st[i]; S.age+=dt; if(S.age>S.life){ spawn(i,false); S=st[i]; }
        pos[i*3]+=S.vx*dt; pos[i*3+1]+=S.vy*dt; pos[i*3+2]+=S.vz*dt;
        var t=S.age/S.life, k=Math.sin(Math.PI*Math.min(1,t*1.15))*fade;
        col[i*3]=k*0.92; col[i*3+1]=k; col[i*3+2]=k*0.96;
      }
      geo.attributes.position.needsUpdate=true; geo.attributes.color.needsUpdate=true;
    });
  })();

  /* ------------------------------------------------------------ fireflies (night only, 1 draw call) */
  (function(){
    var N=520, home=new Float32Array(N*4), pos=new Float32Array(N*3), col=new Float32Array(N*3), made=0, tries=0;
    while(made<N && tries++<20000){
      var nearBrook = made < N*0.45, x, z;
      if(nearBrook){ var s=rr(S_LO,S_HI), R=riverAt(s), o=rr(-16,16); x=R.x-R.tz*o+rr(-4,4); z=R.z+R.tx*o+rr(-4,4); if(Math.hypot(x,z)>750) continue; }
      else { var a=rr(0,TAU), d=rr(PAL_R+6, 640); x=Math.cos(a)*d; z=Math.sin(a)*d; }
      if(Math.hypot(x,z) < PAL_R+5) continue;
      var g=Math.max(gY(x,z), riverDist(x,z)<0 ? brookLevel(polyNear(x,z,RIVER,RIVER_CUM).t) : -1e9);
      home[made*4]=x; home[made*4+1]=g+rr(0.5,4.5); home[made*4+2]=z; home[made*4+3]=rr(0,100); made++;
    }
    CNT.fireflies=made;
    var cv=document.createElement('canvas'); cv.width=cv.height=32; var g2=cv.getContext('2d'), gr=g2.createRadialGradient(16,16,0,16,16,16);
    gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.25,'rgba(255,255,255,0.55)'); gr.addColorStop(1,'rgba(255,255,255,0)');
    g2.fillStyle=gr; g2.fillRect(0,0,32,32);
    var geo=new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3)); geo.setAttribute('color', new THREE.BufferAttribute(col,3));
    for(var i=0;i<made;i++){ pos[i*3]=home[i*4]; pos[i*3+1]=home[i*4+1]; pos[i*3+2]=home[i*4+2]; }
    geo.setDrawRange(0, Math.max(1,made));
    var mat=new THREE.PointsMaterial({ size:1.5, map:new THREE.CanvasTexture(cv), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, vertexColors:true, sizeAttenuation:true, fog:false });
    var pts=new THREE.Points(geo,mat); pts.frustumCulled=false; pts.renderOrder=4; pts.visible=false; pts.userData.inspectLabel='Fireflies'; scene.add(pts);
    var tt=0;
    TICKS.push(function(dt, hour, nightK){
      var nk=clamp(((nightK||0)-0.35)/0.5,0,1); pts.visible = nk>0.01; if(!pts.visible) return;
      tt += Math.min(dt,0.1);
      for(var i=0;i<made;i++){
        var ph=home[i*4+3], w=tt*0.35+ph;
        pos[i*3]  =home[i*4]  +2.2*Math.sin(w*0.9+ph)+0.8*Math.sin(w*2.3);
        pos[i*3+1]=home[i*4+1]+0.7*Math.sin(w*1.3+ph*2.0);
        pos[i*3+2]=home[i*4+2]+2.2*Math.cos(w*0.7+ph*1.7)+0.8*Math.sin(w*1.9+1.0);
        var b=Math.pow(Math.max(0, Math.sin(tt*(0.9+0.5*Math.sin(ph))+ph*7.0)), 1.5)*nk;
        col[i*3]=0.78*b; col[i*3+1]=1.0*b; col[i*3+2]=0.32*b;
      }
      geo.attributes.position.needsUpdate=true; geo.attributes.color.needsUpdate=true;
    });
  })();

  var TALLY1 = tally();
  CNT.instances = TALLY1[0]-TALLY0[0]; CNT.kitTris = TALLY1[1]-TALLY0[1]; CNT.mergedTris = TALLY1[2]-TALLY0[2];
  CNT.totalTris = CNT.kitTris + CNT.mergedTris + CNT.cardTris;
  CNT.channelRocks = JUNGLE_ROCKS.length;
  CNT.cascade = (function(){ function f(ss){ var R=riverAt(ss); return [+R.x.toFixed(1), +brookLevel(ss).toFixed(2), +R.z.toFixed(1)]; }
    var prof=[]; for(var d=-80;d<=80;d+=10){ var R=riverAt(CAS.s+30); prof.push(+(terrainH(R.x-R.tz*d,R.z+R.tx*d)-riverLevel(CAS.s+30)).toFixed(1)); }
    return { s:+CAS.s.toFixed(1), at:f(CAS.s), dn:f(CAS.s+24), dn2:f(CAS.s+60), up:f(CAS.s-4), up2:f(CAS.s-40), viewCamGround:+terrainH(CAS.x-38,CAS.z+30).toFixed(1), profile30mDownstream:prof }; })();
  window._jungle = CNT;
})();
