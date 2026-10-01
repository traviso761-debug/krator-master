/* ============================== 15. JUNGLE ==============================
   The ground storey of the hyperjungle: understorey (shrubs, giant ferns,
   palms/cycads, sub-canopy rainforest trees, aroids/heliconia, fungi, lianas,
   hanging moss), fallen hypertree logs + the LOG BRIDGE, river rocks, cataract
   dressing + mist, gate-yard palisades.
   Exports: LOGS, JUNGLE_ROCKS (in-channel rocks, read by the water mesh for
   foam), JUNGLE_BARE(x,z) (0..1 trodden ground, read by groundTone),
   window._jungle (counters + log-bridge coordinates).                      */
reseed(620001);

var LOGS = [];
var JUNGLE_ROCKS = [];
var JUNGLE_BARE = null;
var JUNGLE_CARDS = null;

(function(){
  var EXT = 1450;
  var CNT = { logs:0, trees:0, palms:0, ferns:0, shrubs:0, aroids:0, saplings:0, fungi:0, brackets:0, lianas:0, moss:0,
              rocks:0, ledges:0, reeds:0, pads:0, driftlogs:0, stakes:0, crates:0, cardTris:0, bridge:null };
  var _c = new THREE.Color();
  var SHAPE_TRIS = { box:12, fr8:12, fr5:12, pyr:12, cyl:40, cyl6:10, cone:20, dome:132, blob:49, ball:80 };
  function tally(){ var i=0,t=0,m=0,k; for(k in BUCKET){ i+=BUCKET[k].list.length; t+=BUCKET[k].list.length*(SHAPE_TRIS[BUCKET[k].shape]||12); } for(k in MBK) m+=MBK[k].tris; return [i,t,m]; }
  var TALLY0 = tally();
  function lin(hex, f){ _c.set(hex).convertSRGBToLinear(); f = f==null?1:f; return [_c.r*f, _c.g*f, _c.b*f]; }
  function vary(hex, a, b){ return shade(hex, rr(a,b)); }

  /* ------------------------------------------------------------ clearances */
  var TR = TREES.map(function(T){ return trunkR(T, T.y0 + 4) + 1.5; });
  var EXC = [];                                   /* hard no-go circles [x,z,r] */
  LIFTS.forEach(function(L){ EXC.push([L.x,L.z,12]); if(L.capstan) EXC.push([L.capstan.x,L.capstan.z,14]); });
  LADDERS.forEach(function(L){ EXC.push([L.x,L.z,6]); });
  SPIRALS.forEach(function(S){ if(S.landing) EXC.push([S.landing.x,S.landing.z,S.landing.r+6]); });
  /* gate yards: one trodden clearing per lift, and a path from it to the nearest bank */
  var YARDS = LIFTS.map(function(L){
    var cp = L.capstan || { x:L.x, z:L.z };
    var cx = (L.x+cp.x)/2, cz = (L.z+cp.z)/2, T = L.plat.tree;
    var rv = polyNear(cx,cz,RIVER,RIVER_CUM), R = riverAt(rv.t);
    var dx = R.x-cx, dz = R.z-cz, dl = Math.hypot(dx,dz)||1, k = (dl - riverHalfAt(rv.t) + 3)/dl;
    return { x:cx, z:cz, r:30, tree:T, px:cx+dx*k, pz:cz+dz*k, pa:Math.atan2(dz,dx) };
  });
  JUNGLE_BARE = function(x,z){
    var b = 0;
    for(var i=0;i<YARDS.length;i++){
      var Y = YARDS[i];
      b = Math.max(b, 1-smooth(Y.r-2, Y.r+7, Math.hypot(x-Y.x,z-Y.z)));
      b = Math.max(b, 0.85*(1-smooth(3, 9, segDist(x,z,Y.x,Y.z,Y.px,Y.pz))));
    }
    return b;
  };
  function logNear(x,z,pad){
    for(var i=0;i<LOGS.length;i++){
      var G = LOGS[i];
      if(Math.hypot(x-G.cx,z-G.cz) > G.cr + pad + 30) continue;
      for(var j=0;j<G.pts.length-1;j++){
        var a=G.pts[j], b=G.pts[j+1];
        if(segDist(x,z,a.x,a.z,b.x,b.z) < Math.max(a.r,b.r)+pad) return true;
      }
    }
    return false;
  }
  function okGround(x,z,pad){
    if(Math.abs(x)>EXT || Math.abs(z)>EXT) return false;
    var i;
    for(i=0;i<TREES.length;i++){ var T=TREES[i], dx=x-T.x, dz=z-T.z, q=TR[i]+pad; if(dx*dx+dz*dz < q*q) return false; }
    for(i=0;i<EXC.length;i++){ var E=EXC[i], ex=x-E[0], ez=z-E[1], er=E[2]+pad; if(ex*ex+ez*ez < er*er) return false; }
    for(i=0;i<YARDS.length;i++){
      var Y=YARDS[i];
      if(Math.hypot(x-Y.x,z-Y.z) < Y.r+1+pad) return false;
      if(segDist(x,z,Y.x,Y.z,Y.px,Y.pz) < 2.5+pad) return false;
    }
    return !logNear(x,z,pad+0.5);
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
    var n = Math.ceil(o.L/11)+1, pts=[], i, t, s, px=-o.hz, pz=o.hx;
    var yA, yB;
    if(o.bridge){ yA = terrainH(o.bx,o.bz) + o.r0*1.3; yB = terrainH(o.bx+o.hx*o.L, o.bz+o.hz*o.L) - o.r1*0.45; }
    for(i=0;i<n;i++){
      t=i/(n-1); s=t*o.L;
      var off = (o.bow||0)*Math.sin(Math.PI*t), x=o.bx+o.hx*s+px*off, z=o.bz+o.hz*s+pz*off;
      var r = mix(o.r0, o.r1, Math.pow(t,0.9)), y;
      if(o.bridge) y = mix(yA,yB,t);
      else {
        var g0=terrainH(x,z), g1=terrainH(x-o.hx*35,z-o.hz*35), g2=terrainH(x+o.hx*35,z+o.hz*35);
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
    TUBE(fam, pts, base, { seg:20, cap:true, capCol:shade(PAL.deadwood[1],-0.25), rfn:function(q,ang,pt){
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
      var a=i/nr*TAU, rrim=o.r0*(1.12+0.55*rnd()), ca=Math.cos(a), sa=Math.sin(a), back=rr(1.5,5);
      rim.push([P0.x+n1[0]*ca*rrim+tdir[0]*back, P0.y+sa*rrim, P0.z+n1[2]*ca*rrim+tdir[2]*back]);
      ring.push([P0.x+n1[0]*ca*o.r0*0.98-tdir[0]*2, P0.y+sa*o.r0*0.98, P0.z+n1[2]*ca*o.r0*0.98-tdir[2]*2]);
    }
    var ctr=[P0.x+tdir[0]*4.5, P0.y, P0.z+tdir[2]*4.5];
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
        var f=q/3, out=o.r0*0.55+RL*f, bk=3+RL*0.45*f*f;
        rp.push({ x:P0.x+n1[0]*cr*out+tdir[0]*bk, y:P0.y+sr*out - RL*0.25*f*f, z:P0.z+n1[2]*cr*out+tdir[2]*bk, r:o.r0*mix(0.2,0.035,f) });
      }
      TUBE(fam, rp, shade(PAL.deadwood[i%3],-0.3), { seg:5, cap:true });
    }
    /* splintered far end (not the bridge: that is the tapering tree top) */
    var Pn=pts[n-1];
    if(!o.bridge){
      for(i=0;i<7;i++){
        var sa2=rr(0,TAU), sr2=Pn.r*rr(0.15,0.8), bx2=Pn.x+px*Math.cos(sa2)*sr2-o.hx*2, by2=Pn.y+Math.sin(sa2)*sr2, bz2=Pn.z+pz*Math.cos(sa2)*sr2-o.hz*2;
        var SL=rr(6,15);
        CONE(bx2,by2,bz2, Pn.r*rr(0.12,0.28), SL, beamQuat(bx2,by2,bz2, bx2+o.hx*SL+rr(-2,2), by2+rr(-1.5,2.5), bz2+o.hz*SL+rr(-2,2)), shade(PAL.deadwood[i%3],-0.2), 'timber');
      }
    }
    var G = { pts:pts, bridge:!!o.bridge, sp:o.sp, cx:(pts[0].x+Pn.x)/2, cz:(pts[0].z+Pn.z)/2, cr:o.L/2+o.r0, hx:o.hx, hz:o.hz, L:o.L, px:px, pz:pz };
    LOGS.push(G); CNT.logs++;
    var mid=pts[n>>1];
    REGISTER({ name:'Fallen hypertree', kind:'log', label:o.bridge?'Log bridge':'Fallen trunk', x:mid.x, y:mid.y-mid.r, z:mid.z, r:o.bridge?o.L*0.5:Math.min(o.L*0.5,o.r0*2.2), h:mid.r*2.2+4 });
    return G;
  }
  function logAt(G, s){                  /* axis point + radius at arc s along the log */
    var P=G.pts, f=clamp(s/G.L,0,1)*(P.length-1), i=Math.min(P.length-2,Math.floor(f)), u=f-i;
    return { x:mix(P[i].x,P[i+1].x,u), y:mix(P[i].y,P[i+1].y,u), z:mix(P[i].z,P[i+1].z,u), r:mix(P[i].r,P[i+1].r,u) };
  }
  function logCandidateOK(o){
    for(var s=-o.r0*1.8; s<=o.L+8; s+=8){
      var t=clamp(s/o.L,0,1), off=(o.bow||0)*Math.sin(Math.PI*t), x=o.bx+o.hx*s-o.hz*off, z=o.bz+o.hz*s+o.hx*off, r=mix(o.r0,o.r1,t), i;
      if(Math.abs(x)>1300 || Math.abs(z)>1300) return false;
      if(riverDist(x,z) < r+14) return false;
      for(i=0;i<TREES.length;i++){ if(Math.hypot(x-TREES[i].x,z-TREES[i].z) < TR[i]+r+17) return false; }
      for(i=0;i<LIFTS.length;i++){
        var Lf=LIFTS[i]; if(Math.hypot(x-Lf.x,z-Lf.z) < 42+r) return false;
        if(Lf.capstan && Math.hypot(x-Lf.capstan.x,z-Lf.capstan.z) < 42+r) return false;
      }
      for(i=0;i<YARDS.length;i++){ var Y=YARDS[i]; if(Math.hypot(x-Y.x,z-Y.z) < 46+r || segDist(x,z,Y.x,Y.z,Y.px,Y.pz) < r+8) return false; }
      for(i=0;i<SPIRALS.length;i++){ var S=SPIRALS[i]; if(S.landing && Math.hypot(x-S.landing.x,z-S.landing.z) < 40+r) return false; }
      if(logNear(x,z,r+25)) return false;
    }
    return true;
  }

  /* --- the LOG BRIDGE: butt (root plate) on the north bank, the tapering top on the south bank --- */
  var BRIDGE = (function(){
    var best=null;
    for(var bx=20; bx<=120 && !best; bx+=20){
      var rv=polyNear(bx,0,RIVER,RIVER_CUM), R=riverAt(rv.t);
      /* across the river: perpendicular to the flow, heading south */
      var hx=-R.tz, hz=R.tx; if(hz<0){ hx=-hx; hz=-hz; }
      var half=riverHalfAt(rv.t), o={ bx:R.x-hx*(half+72), bz:R.z-hz*(half+72), hx:hx, hz:hz, L:305, r0:13.5, r1:2.4, sp:0, bridge:true, bow:0 };
      var ok=true;
      for(var s=0;s<=o.L;s+=10){ var x=o.bx+hx*s, z=o.bz+hz*s; for(var i=0;i<TREES.length;i++) if(Math.hypot(x-TREES[i].x,z-TREES[i].z) < TR[i]+30) ok=false; }
      if(ok) best=o;
    }
    return buildLog(best);
  })();
  (function(){
    var G=BRIDGE, s, A, sN=null, sS=null, clear=1e9;
    for(s=0;s<=G.L;s+=1){
      A=logAt(G,s); var rd=riverDist(A.x,A.z);
      if(rd<0){ if(sN==null) sN=s; sS=s; var wl=riverLevel(polyNear(A.x,A.z,RIVER,RIVER_CUM).t); clear=Math.min(clear, A.y-A.r-wl); }
    }
    function top(s){ var a=logAt(G,s), k=smooth(3.0,5.0,a.r); return { x:a.x, y:a.y+a.r*mix(1,FLAT_CU,k), z:a.z, hw:a.r*FLAT_SU*k, r:a.r }; }
    /* rock abutments under the log at both waterlines */
    [sN-7, sS+7].forEach(function(sa){
      var a=logAt(G,sa), gy=terrainH(a.x,a.z), need=a.y-a.r-gy;
      for(var k=0;k<9;k++){
        var lx=rr(-a.r*1.1,a.r*1.1), ls=rr(-9,9), x=a.x+G.px*lx+G.hx*ls, z=a.z+G.pz*lx+G.hz*ls, g2=terrainH(x,z);
        var under = Math.sqrt(Math.max(0, a.r*a.r-lx*lx)), hh = (a.y-under)-g2 + 1.2;
        if(Math.abs(lx) > a.r*0.8) hh = Math.max(3, hh*0.7);
        BLOB(x, g2-1, z, rr(5,9), Math.max(3,hh)+1, rr(0,TAU), shade(pick(PAL.rock),-0.25), 'rock'); CNT.rocks++;
      }
      FR8(a.x, gy-1, a.z, a.r*1.7, Math.max(2,need)+1.6, 13, Math.atan2(-G.pz,G.px), shade(PAL.rock[3],-0.2), 'rock'); CNT.ledges++;
    });
    /* worn footpath strip + rope-and-post handrails */
    var sEnd=G.L-4, s0=5, last=null, fam='bark'+G.sp;
    for(s=s0; s<=sEnd; s+=6){
      var T2=top(s), w=Math.min(1.7, Math.max(0.8, T2.hw*0.55));
      var L2=[T2.x-G.px*w, T2.y+0.07, T2.z-G.pz*w], R2=[T2.x+G.px*w, T2.y+0.07, T2.z+G.pz*w];
      if(last && T2.hw>0.5) facingTri(fam,last[0],last[1],R2,[0,1,0],shade(PAL.deadwood[2],0.12)), facingTri(fam,last[0],R2,L2,[0,1,0],shade(PAL.deadwood[2],0.05));
      last=[L2,R2];
    }
    function rail(sa,sb){
      [-1,1].forEach(function(sd){
        var prev=null;
        for(var q=sa;q<=sb+0.1;q+=4){
          var T3=top(q), e=Math.max(1.4,T3.hw-0.5), x=T3.x+G.px*sd*e, z=T3.z+G.pz*sd*e, y=T3.y-0.15;
          ROD(x,y,z, x,y+1.45,z, 0.11, pick(PAL.timber), 'timber');
          if(prev){ ROD(prev[0],prev[1]+1.35,prev[2], x,y+1.35,z, 0.045, pick(PAL.rope), 'rope'); ROD(prev[0],prev[1]+0.8,prev[2], x,y+0.8,z, 0.04, pick(PAL.rope), 'rope'); }
          prev=[x,y,z];
        }
      });
    }
    rail(6, 46); rail(sS-10, Math.min(G.L-70, sS+50));
    /* the way up at the butt: a cleated plank ramp along the east flank, then a gangway onto the flat */
    var sd=1, sFoot=Math.max(30,sN-9), sHead=9, Af=logAt(G,sFoot), Ah=logAt(G,sHead), Th=top(sHead);
    var fo=Af.r+3.2, ho=Ah.r*0.9+2.0;
    var F=[Af.x+G.px*sd*fo, 0, Af.z+G.pz*sd*fo]; F[1]=terrainH(F[0],F[2])+0.15;
    var H=[Ah.x+G.px*sd*ho, Th.y+0.1, Ah.z+G.pz*sd*ho];
    BEAM(F[0],F[1],F[2], H[0],H[1],H[2], 3.0, 0.3, PAL.plank[1], 'plank');
    var RL=Math.hypot(H[0]-F[0],H[1]-F[1],H[2]-F[2]), prevL=null, prevR=null;
    for(var d=0; d<=RL; d+=4){
      var f=d/RL, cx=mix(F[0],H[0],f), cy=mix(F[1],H[1],f), cz=mix(F[2],H[2],f);
      BEAM(cx-G.px*1.5,cy+0.3,cz-G.pz*1.5, cx+G.px*1.5,cy+0.3,cz+G.pz*1.5, 0.22,0.12, PAL.timber[2], 'timber');
      var gl=terrainH(cx+G.px*1.4,cz+G.pz*1.4);
      if(cy-gl>1.2){ ROD(cx+G.px*1.4,gl-0.5,cz+G.pz*1.4, cx+G.px*1.4,cy+1.3,cz+G.pz*1.4, 0.2, PAL.timber[0], 'timber');
                     ROD(cx-G.px*1.2,Math.min(cy-0.5,gl-0.5),cz-G.pz*1.2, cx-G.px*1.4,cy+1.3,cz-G.pz*1.4, 0.2, PAL.timber[0], 'timber'); }
      var pl=[cx-G.px*1.4,cy+1.3,cz-G.pz*1.4], pr=[cx+G.px*1.4,cy+1.3,cz+G.pz*1.4];
      if(prevL){ ROD(prevL[0],prevL[1],prevL[2],pl[0],pl[1],pl[2],0.05,PAL.rope[0],'rope'); ROD(prevR[0],prevR[1],prevR[2],pr[0],pr[1],pr[2],0.05,PAL.rope[1],'rope'); }
      prevL=pl; prevR=pr;
    }
    BEAM(H[0]+G.px*1.5,H[1]-0.12,H[2]+G.pz*1.5, Th.x,Th.y-0.05,Th.z, 3.0,0.3, PAL.plank[2], 'plank');
    var Ts=top(G.L-6);
    CNT.bridge = { north:[+Th.x.toFixed(1),+Th.y.toFixed(1),+Th.z.toFixed(1)], south:[+Ts.x.toFixed(1),+(Ts.y).toFixed(1),+Ts.z.toFixed(1)],
      rampFoot:[+F[0].toFixed(1),+F[1].toFixed(1),+F[2].toFixed(1)], rampHead:[+H[0].toFixed(1),+H[1].toFixed(1),+H[2].toFixed(1)],
      halfWidthMinOverRiver:+Math.min(top(sN).hw, top(sS).hw).toFixed(2), halfWidthAtNorth:+Th.hw.toFixed(2),
      waterSpan:[sN,sS], clearance:+clear.toFixed(2), groundSouth:+terrainH(Ts.x,Ts.z).toFixed(1),
      mid:(function(){ var m=top((sN+sS)/2); return [+m.x.toFixed(1),+m.y.toFixed(1),+m.z.toFixed(1)]; })() };
  })();

  /* --- the other fallen trunks --- */
  (function(){
    var want = 8, tries = 0, seeds = [[-150,-140],[150,-170],[-330,120],[380,150]];
    while(LOGS.length < want+1 && tries < 4000){
      tries++;
      var c = (seeds.length && tries%3===1) ? seeds[0] : null, R = c ? 90 : rr(150, 1150), a = rr(0,TAU);
      var mx = c ? c[0]+rr(-R,R) : Math.cos(a)*R, mz = c ? c[1]+rr(-R,R) : Math.sin(a)*R;
      var h = rr(0,TAU), L = rr(150,320), r0 = rr(12.5,22.5);
      var o = { hx:Math.cos(h), hz:Math.sin(h), L:L, r0:r0, r1:r0*rr(0.42,0.58), sp:pick([0,0,1,2,2,3]), bow:rr(-6,6) };
      o.bx = mx - o.hx*L/2; o.bz = mz - o.hz*L/2;
      if(!logCandidateOK(o)) continue;
      if(c) seeds.shift();
      buildLog(o);
    }
  })();

  /* dress the logs: moss cushions, ferns and shrubs on top, bracket fungi on the flanks */
  LOGS.forEach(function(G){
    for(var s=8; s<G.L-3; s+=rr(5,9)){
      var A=logAt(G,s); if(A.r<2.2) continue;
      var flatHW = G.bridge ? A.r*FLAT_SU*smooth(3,5,A.r) : 0;
      /* moss */
      if(chance(0.75)){
        var lat = G.bridge ? (chance(0.5)?1:-1)*(flatHW+A.r*0.18) : rr(-0.45,0.45)*A.r;
        var up = Math.sqrt(Math.max(0.01, A.r*A.r - lat*lat)), mr = rr(0.22,0.42)*A.r;
        BLOB(A.x+G.px*lat, A.y+up-mr*0.30-(G.bridge?0.5:0), A.z+G.pz*lat, mr, mr*rr(0.22,0.4), rr(0,TAU), vary(pick(PAL.moss),-0.3,0.05), 'leafy'); CNT.moss++;
      }
      /* plants riding the log */
      if(chance(0.6)){
        var l2 = G.bridge ? (chance(0.5)?1:-1)*(flatHW+A.r*0.22) : rr(-0.55,0.55)*A.r;
        var u2 = Math.sqrt(Math.max(0.01, A.r*A.r - l2*l2)), x=A.x+G.px*l2, z=A.z+G.pz*l2, y=A.y+u2-0.6;
        if(chance(0.5)){ frondCrown(x,y,z, rr(2.5,5), 6, 0.5, 0.3, 0.36, vary(pick(PAL.fern),-0.3,0.05)); CNT.ferns++; }
        else { crossCard(x,y,z, rr(3,6), rr(2.5,5), rr(0,TAU), BUSH, vary(pick(PAL.under),-0.15,0.2), 2); CNT.shrubs++; }
      }
      /* bracket fungi */
      if(chance(0.55)){
        var sd = chance(0.5)?1:-1, el = rr(0.05,0.75), fr = rr(1.0,2.8);
        var fx=A.x+G.px*sd*A.r*Math.cos(el)*0.96, fy=A.y+A.r*Math.sin(el)*0.96, fz=A.z+G.pz*sd*A.r*Math.cos(el)*0.96;
        if(fy > terrainH(fx,fz)+0.5){
          BLOB(fx,fy,fz, fr, fr*rr(0.22,0.4), rr(0,TAU), vary(pick(PAL.fungus),-0.2,0.15), 'leafy'); CNT.brackets++;
          if(chance(0.5)){ BLOB(fx+G.hx*fr*0.9,fy-fr*0.5,fz+G.hz*fr*0.9, fr*0.7, fr*0.22, rr(0,TAU), vary(pick(PAL.fungus),-0.2,0.15), 'leafy'); CNT.brackets++; }
        }
      }
      /* hanging moss curtain off the flank of the big ones */
      if(A.r>7 && chance(0.35)){
        var sd3 = chance(0.5)?1:-1, mx2=A.x+G.px*sd3*A.r*0.97, mz2=A.z+G.pz*sd3*A.r*0.97;
        hangCard(mx2, A.y+A.r*0.2, mz2, rr(5,10), Math.min(A.r*0.9, rr(5,11)), Math.atan2(G.hz,G.hx), vary(pick(PAL.moss),-0.25,0.05)); CNT.moss++;
      }
    }
  });

  /* ------------------------------------------------------------ THE RIVER: rocks, cataracts, bars, reeds */
  var S_LO = 1e9, S_HI = -1e9;
  (function(){ for(var s=0;s<RIVER_LEN;s+=20){ var R=riverAt(s); if(Math.abs(R.x)<EXT+40 && Math.abs(R.z)<EXT){ S_LO=Math.min(S_LO,s); S_HI=Math.max(S_HI,s); } } })();
  function nearBridge(x,z,pad){ var G=BRIDGE, a=G.pts[0], b=G.pts[G.pts.length-1]; return segDist(x,z,a.x,a.z,b.x,b.z) < pad; }
  function riverRock(s, v, r, hK){
    var R=riverAt(s), half=riverHalfAt(s), x=R.x-R.tz*half*v, z=R.z+R.tx*half*v, wl=riverLevel(s), g=terrainH(x,z);
    var base=Math.min(g,wl)-0.8, top=Math.max(g,wl)+r*hK;
    BLOB(x, base, z, r, top-base, rr(0,TAU), shade(pick(PAL.rock), rr(-0.42,-0.12)), 'rock'); CNT.rocks++;
    if(Math.abs(v)<0.97) JUNGLE_ROCKS.push({ x:x, z:z, r:r*0.85, s:s });
    if(r>3 && chance(0.4)){ BLOB(x+rr(-1,1), top-r*0.22, z+rr(-1,1), r*0.55, r*0.2, rr(0,TAU), vary(pick(PAL.moss),-0.3,0), 'leafy'); CNT.moss++; }
    return [x,top,z];
  }
  CATARACTS.forEach(function(C, ci){
    var run=C.run;
    /* rock ledges: broken lines of slabs across the channel */
    [-0.34,-0.08,0.2,0.46].forEach(function(f, li){
      var s=C.s+f*run, R=riverAt(s), half=riverHalfAt(s), v=-1.05;
      while(v<1.05){
        var w=rr(7,17), gap=chance(0.4)?rr(3,8):rr(0.5,2), vc=v+w/half/2, x=R.x-R.tz*half*vc+rr(-3,3)*R.tx, z=R.z+R.tx*half*vc+rr(-3,3)*R.tz;
        var s2=s+rr(-2,2), wl=riverLevel(s2-3), g=terrainH(x,z), hTop=wl+rr(0.25,1.5)+(Math.abs(vc)>0.85?rr(1,3):0);
        if(chance(0.82)){
          FR8(x, g-1.5, z, rr(5,8.5), hTop-g+1.5, w, Math.atan2(-R.tz,R.tx)+rr(-0.22,0.22), shade(pick(PAL.rock), rr(-0.4,-0.15)), 'rock'); CNT.ledges++;
          JUNGLE_ROCKS.push({ x:x, z:z, r:w*0.42, s:s2 });
        }
        v += (w+gap)/half;
      }
    });
    for(var k=0;k<46;k++) riverRock(C.s+rr(-0.62,0.85)*run, rr(-1.05,1.05), rr(1.6,5.2)*(chance(0.12)?1.6:1), rr(0.25,0.7));
    /* big shoulder rocks on both banks */
    for(var b=0;b<14;b++){
      var sb=C.s+rr(-0.8,0.9)*run, sd=(b%2?1:-1), Rb=riverAt(sb), hb=riverHalfAt(sb)+rr(1,10), x2=Rb.x-Rb.tz*hb*sd, z2=Rb.z+Rb.tx*hb*sd, g2=terrainH(x2,z2), rb=rr(4,9);
      BLOB(x2,g2-1.5,z2, rb, rb*rr(0.6,1.0)+1.5, rr(0,TAU), shade(pick(PAL.rock),rr(-0.4,-0.15)), 'rock'); CNT.rocks++;
      if(chance(0.6)){ BLOB(x2,g2+rb*0.5,z2, rb*0.7, rb*0.3, 0, vary(pick(PAL.moss),-0.3,0), 'leafy'); CNT.moss++; }
    }
    /* drift logs jammed on the head of the rapids */
    for(var d=0;d<5;d++){
      var sd2=C.s+rr(-0.55,-0.1)*run, Rd=riverAt(sd2), vd=rr(-0.8,0.8), hd=riverHalfAt(sd2), x3=Rd.x-Rd.tz*hd*vd, z3=Rd.z+Rd.tx*hd*vd, wl3=riverLevel(sd2);
      var ah=Math.atan2(Rd.tx,-Rd.tz)+rr(-0.7,0.7), LL=rr(12,26), r3=rr(0.6,1.3);
      TUBE('bark0', [{x:x3-Math.cos(ah)*LL/2,y:wl3+rr(0.2,1.2),z:z3-Math.sin(ah)*LL/2,r:r3},{x:x3,y:wl3+rr(0.6,1.4),z:z3,r:r3*0.9},{x:x3+Math.cos(ah)*LL/2,y:wl3+rr(0.4,2.2),z:z3+Math.sin(ah)*LL/2,r:r3*0.6}],
           shade(pick(PAL.deadwood),rr(-0.1,0.25)), { seg:6, cap:true }); CNT.driftlogs++;
    }
    REGISTER({ name:'The river', kind:'cataract', label:ci===0?'Upper cataract':'Lower cataract', x:C.x, y:riverLevel(C.s+run)-2, z:C.z, r:run*0.9, h:C.drop+10 });
  });
  /* bank rocks, mid-stream boulders, gravel bars, drift logs, reeds and giant pads along the quiet reaches */
  (function(){
    for(var s=S_LO; s<S_HI; s+=6){
      var ck=cataractK(s), R=riverAt(s), half=riverHalfAt(s), wl=riverLevel(s), rockK = 0.5+0.5*fbm(s*0.011,3.3);
      for(var sd=-1; sd<=1; sd+=2){
        var x0=R.x-R.tz*half*sd, z0=R.z+R.tx*half*sd;
        if(nearBridge(x0,z0,22)) continue;
        if(chance(0.22*rockK+0.2*ck)){
          var off=rr(-3.5,4), rk=rr(1.0,3.4)*(chance(0.1)?1.7:1), x=x0-R.tz*off*sd+rr(-2,2), z=z0+R.tx*off*sd+rr(-2,2), g=terrainH(x,z);
          BLOB(x, Math.min(g,wl)-0.8, z, rk, rk*rr(0.5,0.95)+0.8+Math.abs(g-wl), rr(0,TAU), shade(pick(PAL.rock),rr(-0.4,-0.1)), 'rock'); CNT.rocks++;
          if(off<-1) JUNGLE_ROCKS.push({ x:x, z:z, r:rk*0.8, s:s });
        }
        if(ck<0.4 && chance(0.5)){
          var o2=rr(-4.5,1.5), xr=x0-R.tz*o2*sd+rr(-2,2), zr=z0+R.tx*o2*sd+rr(-2,2);
          if(okGround(xr,zr,0) || riverDist(xr,zr)<1){
            crossCard(xr, Math.min(terrainH(xr,zr),wl)-0.3, zr, rr(2.5,4.5), rr(3.2,6.5), rr(0,TAU), BUSH, vary(pick(PAL.palm),-0.15,0.2), 2); CNT.reeds++;
          }
        }
        if(ck<0.05 && chance(0.13)){
          var np=ri(2,5), oc=rr(-11,-4);
          for(var p=0;p<np;p++){
            var xp=x0-R.tz*(oc+rr(-3,3))*sd+rr(-5,5)*R.tx, zp=z0+R.tx*(oc+rr(-3,3))*sd+rr(-5,5)*R.tz, w=rr(1.4,2.6), ap=rr(0,TAU), ca=Math.cos(ap)*w, sa=Math.sin(ap)*w;
            if(riverDist(xp,zp)>-1.5) continue;
            var hc=vary(pick(PAL.palm),-0.2,0.1);
            strip([{c:[xp-ca,wl+0.16,zp-sa],h:[-sa,0,ca]},{c:[xp+ca,wl+0.16,zp+sa],h:[-sa,0,ca]}], LEAF, lin(hc,0.8), lin(hc), 0,0); CNT.pads++;
          }
        }
      }
      if(ck<0.3 && chance(0.035)) riverRock(s, rr(-0.8,0.8), rr(1.8,4.5), rr(0.2,0.55));
      if(ck<0.2 && chance(0.012)){                                  /* gravel bar */
        var sdb=chance(0.5)?1:-1, vb=sdb*rr(0.62,0.85), xb=R.x-R.tz*half*vb, zb=R.z+R.tx*half*vb, rot=Math.atan2(-R.tz,R.tx)+Math.PI/2;
        if(!nearBridge(xb,zb,30)){
          push('blob','rock',[xb,wl-0.5,zb, rr(16,30), rr(1.0,1.5), rr(6,10), -Math.atan2(R.tz,R.tx), shade(PAL.rock[2],0.12)]); CNT.rocks++;
          for(var q=0;q<7;q++){ var xq=xb+rr(-14,14)*R.tx+rr(-5,5)*R.tz, zq=zb+rr(-14,14)*R.tz+rr(-5,5)*R.tx, rq=rr(0.6,1.6); BLOB(xq,wl-0.2,zq,rq,rq*0.7+0.5,rr(0,TAU),shade(pick(PAL.rock),rr(-0.2,0.15)),'rock'); CNT.rocks++; }
          if(chance(0.6)){ var ah=rr(0,TAU), LL=rr(10,22); TUBE('bark0',[{x:xb-Math.cos(ah)*LL/2,y:wl+0.5,z:zb-Math.sin(ah)*LL/2,r:1.0},{x:xb+Math.cos(ah)*LL/2,y:wl+1.1,z:zb+Math.sin(ah)*LL/2,r:0.55}],shade(pick(PAL.deadwood),0.2),{seg:6,cap:true}); CNT.driftlogs++; }
        }
      }
    }
  })();

  /* ------------------------------------------------------------ UNDERSTOREY */
  function subTree(x,y,z,dO){
    var H = rr(15,45)*(chance(0.25)?1:0.8), r = 0.4+H*0.022, lean=rr(0,TAU), lk=rr(0,0.06)*H;
    var fam = chance(0.5)?'bark3':'bark0', col = shade(pick(chance(0.5)?PAL.deadwood:PAL.bark[3]), rr(-0.45,-0.15));
    var but = rr(1.8,2.8), near = dO<650;
    TUBE(fam, [ {x:x,y:y-1,z:z,r:r}, {x:x,y:y+H*0.1,z:z,r:r}, {x:x+Math.cos(lean)*lk*0.4,y:y+H*0.5,z:z+Math.sin(lean)*lk*0.4,r:r*0.8}, {x:x+Math.cos(lean)*lk,y:y+H*0.86,z:z+Math.sin(lean)*lk,r:r*0.5} ],
         col, { seg:6, rfn:function(q,ang){ return q===0 ? (Math.cos(3*ang)>0 ? but : 0.9) : 1; } });
    var cx=x+Math.cos(lean)*lk, cz=z+Math.sin(lean)*lk, cr=H*rr(0.26,0.36), hc=pick(PAL.under), cy=y+H*0.74;
    BLOB(cx,cy,cz, cr, cr*rr(0.45,0.7), rr(0,TAU), vary(hc,-0.2,0.15), 'leafy');
    if(near){
      CONE(cx,cy+0.05,cz, cr*0.93, cr*0.42, [Math.PI,rr(0,TAU),0], shade(hc,-0.45), 'leafy');
      var nb = dO<420 ? ri(1,2) : 0;
      for(var i=0;i<nb;i++){
        var a=rr(0,TAU), d=cr*rr(0.55,0.9), r2=cr*rr(0.45,0.7), y2=cy-cr*rr(0.1,0.45);
        BLOB(cx+Math.cos(a)*d, y2, cz+Math.sin(a)*d, r2, r2*rr(0.5,0.75), rr(0,TAU), vary(pick(PAL.under),-0.2,0.18), 'leafy');
        if(dO<300) CONE(cx+Math.cos(a)*d, y2+0.05, cz+Math.sin(a)*d, r2*0.92, r2*0.4, [Math.PI,0,0], shade(hc,-0.5), 'leafy');
      }
      if(dO<650 && chance(0.6)){
        var nm=ri(1,3);
        for(var m=0;m<nm;m++){ var am=rr(0,TAU), dm=cr*rr(0.3,0.85); hangCard(cx+Math.cos(am)*dm, cy+0.5, cz+Math.sin(am)*dm, rr(4,8), rr(5,13), rr(0,TAU), vary(pick(PAL.moss),-0.3,0)); CNT.moss++; }
      }
      if(dO<600 && chance(0.35)){
        var al=rr(0,TAU), dl=cr*rr(0.4,0.8), lx=cx+Math.cos(al)*dl, lz=cz+Math.sin(al)*dl, gx=lx+rr(-3,3), gz=lz+rr(-3,3);
        ROD(lx,cy+1,lz, gx,terrainH(gx,gz)-0.3,gz, rr(0.08,0.16), shade(pick(PAL.deadwood),-0.3), 'rope'); CNT.lianas++;
      }
    }
    CNT.trees++;
  }
  function palm(x,y,z,dO){
    var cyc = chance(0.3), H = cyc ? rr(1.5,4) : rr(6,18), r = cyc ? rr(0.5,0.9) : 0.22+H*0.016, la=rr(0,TAU), lk=cyc?0:H*rr(0.05,0.28);
    var pts=[];
    for(var i=0;i<4;i++){ var f=i/3; pts.push({ x:x+Math.cos(la)*lk*f*f, y:y-0.6+(H+0.6)*f, z:z+Math.sin(la)*lk*f*f, r:r*(1-0.3*f) }); }
    TUBE('bark3', pts, shade(pick(PAL.deadwood), rr(-0.3,0)), { seg:5 });
    var T=pts[3], hc=vary(pick(PAL.palm),-0.3,0.08);
    frondCrown(T.x,T.y,T.z, cyc?rr(3,5):rr(4.5,8), dO<450?8:5, cyc?0.45:0.32, cyc?0.2:0.5, 0.34, hc);
    if(dO<300) frondCrown(T.x,T.y+0.3,T.z, cyc?2.4:3.6, 5, 0.75, 0.1, 0.34, shade(hc,0.08), 0.6);
    CNT.palms++;
  }
  function shrub(x,y,z,dO,big){
    var hc=pick(PAL.under);
    if(dO<380 || (big && dO<700)){
      var n=ri(1,3), R=rr(2.2,4.6)*(big?1.3:1);
      for(var i=0;i<n;i++){
        var a=rr(0,TAU), d=i?R*rr(0.5,0.9):0, r=R*(i?rr(0.5,0.8):1);
        BLOB(x+Math.cos(a)*d, y-0.5, z+Math.sin(a)*d, r, r*rr(0.7,1.15), rr(0,TAU), vary(hc,-0.3,0.12), 'leafy');
      }
      if(chance(0.5)) crossCard(x,y+R*0.5,z, R*2.0, R*1.3, rr(0,TAU), BUSH, vary(hc,-0.05,0.25), 2);
    } else crossCard(x,y-0.3,z, rr(5,10), rr(4,8), rr(0,TAU), BUSH, vary(hc,-0.25,0.15), 2);
    CNT.shrubs++;
  }
  function fern(x,y,z,dO){
    var hc=vary(pick(PAL.fern),-0.35,0.05);
    if(dO<460){
      var tree = chance(0.22), R=rr(2.6,5.5), ty=y;
      if(tree){ ty=y+rr(2,6); ROD(x,y-0.5,z, x+rr(-0.5,0.5),ty,z+rr(-0.5,0.5), rr(0.25,0.45), shade(PAL.deadwood[1],-0.4), 'timber'); }
      frondCrown(x,ty-0.2,z, R, tree?7:6, tree?0.3:0.5, tree?0.45:0.28, 0.36, hc);
    } else crossCard(x,y-0.3,z, rr(5,9), rr(2.6,4.5), rr(0,TAU), BUSH, hc, 2);
    CNT.ferns++;
  }
  function aroid(x,y,z,dO){
    var up = chance(0.45), hc=pick(up?PAL.palm:PAL.under);
    if(dO<700) leafClump(x,y-0.3,z, up?rr(5,9):rr(3,6), dO<420?ri(4,6):3, up, up?shade(hc,-0.15):shade(hc,0.1));
    else crossCard(x,y-0.3,z, rr(5,8), rr(4,7), rr(0,TAU), BUSH, vary(hc,-0.2,0.1), 2);
    CNT.aroids++;
  }
  function sapling(x,y,z){
    crossCard(x,y-0.3,z, rr(2.5,4.5), rr(5,10), rr(0,TAU), BUSH, vary(pick(PAL.sapling),-0.3,0.05), 2); CNT.saplings++;
  }
  function fungi(x,y,z,dO){
    var n = dO<700 ? ri(3,6) : 2, giant = chance(0.3);
    for(var i=0;i<n;i++){
      var a=rr(0,TAU), d=i?rr(0.8,3.5):0, fx=x+Math.cos(a)*d, fz=z+Math.sin(a)*d, fy=terrainH(fx,fz);
      var cr=(giant&&i===0)?rr(1.8,3.2):rr(0.5,1.4), st=cr*rr(0.9,1.9), hc=vary(pick(PAL.fungus),-0.15,0.2);
      if(st>1.0) ROD(fx,fy-0.3,fz, fx+rr(-0.2,0.2),fy+st,fz+rr(-0.2,0.2), cr*0.2, shade(PAL.fungus[2],0.15), 'timber');
      BLOB(fx, fy+(st>1.0?st-0.1:0), fz, cr, cr*rr(0.35,0.7), rr(0,TAU), hc, 'leafy');
    }
    CNT.fungi++;
  }

  var DENS = 1.0;
  (function(){
    var cell = 9, n = Math.ceil(EXT*2/cell);
    for(var iz=0; iz<n; iz++) for(var ix=0; ix<n; ix++){
      var x = -EXT + (ix + rnd())*cell, z = -EXT + (iz + rnd())*cell, u = rnd();
      var dO = Math.hypot(x,z);
      var fall = dO<480 ? 1 : mix(1, 0.10, smooth(480, 1450, dO));
      if(u > fall*1.25*DENS) continue;
      var rv = polyNear(x,z,RIVER,RIVER_CUM), rd = rv.d - riverHalfAt(rv.t);
      if(rd < 1.5) continue;
      var bank = 1 - smooth(10, 90, rd);
      var clump = 0.45 + 0.75*fbm(x*0.013+7, z*0.013-3);
      if(u > fall*DENS*clamp(clump + 0.45*bank, 0, 1.25)) continue;
      if(!okGround(x,z,2.2)) continue;
      var y = terrainH(x,z), t = rnd(), patch = fbm(x*0.006-11, z*0.006+5), far = dO>950;
      if(t < 0.085 + (far?0.05:0)){
        /* sub-canopy trees need more room around the hypertrees and their gear */
        var okT = true;
        for(var i=0;i<TREES.length;i++){ var T=TREES[i]; if(Math.hypot(x-T.x,z-T.z) < TR[i] + (T.role==='gate'?34:14)) { okT=false; break; } }
        if(okT && rd>8) subTree(x,y,z,dO); else shrub(x,y,z,dO);
      }
      else if(t < 0.15 + 0.12*bank) palm(x,y,z,dO);
      else if(t < 0.43 + 0.10*(patch-0.5)) fern(x,y,z,dO);
      else if(t < 0.62) shrub(x,y,z,dO, chance(0.2));
      else if(t < 0.80) aroid(x,y,z,dO);
      else if(t < 0.90) sapling(x,y,z);
      else if(t < 0.95 && dO<1100) fungi(x,y,z,dO);
      else shrub(x,y,z,dO);
    }
  })();

  /* bracket fungi, moss skirts and ferns on the hypertree boles; fungi clumps beside the logs */
  TREES.forEach(function(T, ti){
    var gate = (T.role==='gate'), S = null;
    if(gate) SPIRALS.forEach(function(s){ if(s.tree===T && s.landing) S=s; });
    var nb = Math.hypot(T.x,T.z)<900 ? ri(14,22) : 7;
    for(var i=0;i<nb;i++){
      var a = rr(0,TAU);
      if(S && angDist(a, S.a0) < 1.3) continue;
      var gy0 = terrainH(T.x+Math.cos(a)*(TR[ti]+1), T.z+Math.sin(a)*(TR[ti]+1));
      var y = gy0 + rr(1.5, gate?20:32), R = trunkR(T,y), r = rr(1.4,4.2);
      var x = T.x+Math.cos(a)*(R-0.15*r), z = T.z+Math.sin(a)*(R-0.15*r), hc=vary(pick(PAL.fungus),-0.2,0.18);
      BLOB(x,y,z, r, r*rr(0.2,0.36), rr(0,TAU), hc, 'leafy'); CNT.brackets++;
      if(chance(0.6)){ var a2=a+rr(0.04,0.09), y2=y+r*rr(0.5,0.9), R2=trunkR(T,y2), r2=r*rr(0.5,0.8); BLOB(T.x+Math.cos(a2)*(R2-0.15*r2),y2,T.z+Math.sin(a2)*(R2-0.15*r2), r2, r2*0.3, rr(0,TAU), shade(hc,rr(-0.1,0.1)), 'leafy'); CNT.brackets++; }
      if(chance(0.5)){
        var a3=a+rr(0.3,1.2), y3=gy0+rr(10,38), R3=trunkR(T,y3)+0.25;
        if(!(S && angDist(a3,S.a0)<1.3)){ hangCard(T.x+Math.cos(a3)*R3, y3, T.z+Math.sin(a3)*R3, rr(6,12), rr(7,16), a3+Math.PI/2, vary(pick(PAL.moss),-0.3,0)); CNT.moss++; }
      }
    }
  });

  /* ------------------------------------------------------------ LIANAS + HANGING MOSS from the boughs */
  (function(){
    function blocked(x,z,yTop,yBot){
      var i;
      for(i=0;i<PLATS.length;i++){ var P=PLATS[i]; if(Math.hypot(x-P.x,z-P.z) < P.R+4 && yTop > (P.yBottom!=null?P.yBottom:P.y-6)-3 && yBot < P.y+14) return true; }
      for(i=0;i<BRIDGES.length;i++){ var B=BRIDGES[i]; if(segDist(x,z,B.a.x,B.a.z,B.b.x,B.b.z) < B.w/2+2.5 && yBot < Math.max(B.a.y,B.b.y)+8 && yTop > Math.min(B.a.y,B.b.y)-(B.sag||4)-6) return true; }
      for(i=0;i<TREES.length;i++){ var T=TREES[i]; if(Math.hypot(x-T.x,z-T.z) < trunkR(T,yBot)+ (T.role==='gate'?14:2.5)) return true; }
      for(i=0;i<EXC.length;i++){ var E=EXC[i]; if(Math.hypot(x-E[0],z-E[1]) < E[2]+2) return true; }
      return false;
    }
    BRANCHES.forEach(function(B){
      var dO=Math.hypot(B.tree.x,B.tree.z); if(dO>1100) return;
      var low = B.pts[Math.floor(B.pts.length/2)].y, n = B.kind==='under' ? 6 : (low<190 ? 3 : (chance(0.5)?2:1));
      if(dO>700) n=Math.min(n,1);
      for(var k=0;k<n;k++){
        var i=ri(2,B.pts.length-2), p=B.pts[i], q=B.pts[Math.min(B.pts.length-1,i+1)], f=rnd();
        var x=mix(p.x,q.x,f), z=mix(p.z,q.z,f), yT=mix(p.y,q.y,f)-mix(p.r,q.r,f)*0.85, g=Math.max(terrainH(x,z), inRiver(x,z,0)?riverLevel(polyNear(x,z,RIVER,RIVER_CUM).t):-99);
        var len=Math.min(yT-g-rr(-1,14), rr(45,150)); if(len<12) continue;
        var yB=yT-len; if(blocked(x,z,yT,yB)) continue;
        var dr=rr(0,TAU), sway=len*rr(0.02,0.07), r=rr(0.16,0.34), hc=shade(pick(PAL.deadwood),rr(-0.45,-0.15));
        var x1=x+Math.cos(dr)*sway*0.35, z1=z+Math.sin(dr)*sway*0.35, x2=x+Math.cos(dr)*sway, z2=z+Math.sin(dr)*sway;
        ROD(x,yT+0.5,z, x1,yT-len*0.45,z1, r, hc, 'rope'); ROD(x1,yT-len*0.45,z1, x2,yB,z2, r*0.85, hc, 'rope');
        if(chance(0.6)){ var xo=x+rr(-1.2,1.2), zo=z+rr(-1.2,1.2); ROD(xo,yT+0.5,zo, x2+rr(-2,2),yB+rr(3,20),z2+rr(-2,2), r*0.6, shade(hc,-0.15), 'rope'); }
        if(yB-g>3) hangCard(x2,yB+3,z2, rr(3,6), rr(5,10), rr(0,TAU), vary(pick(PAL.under),-0.2,0.1));
        CNT.lianas++;
      }
      /* moss beards under the bough */
      var nm = dO<700 ? (B.kind==='under'?6:3) : 1;
      for(var m=0;m<nm;m++){
        var j=ri(1,B.pts.length-2), a=B.pts[j], b=B.pts[j+1], xm=(a.x+b.x)/2, zm=(a.z+b.z)/2, ym=(a.y+b.y)/2-(a.r+b.r)/2*0.8, hh=rr(9,24);
        if(blocked(xm,zm,ym,ym-hh)) continue;
        hangCard(xm,ym,zm, Math.hypot(b.x-a.x,b.z-a.z)*rr(0.6,1.0)+3, hh, Math.atan2(b.z-a.z,b.x-a.x), vary(pick(PAL.moss),-0.35,-0.05)); CNT.moss++;
      }
    });
  })();

  /* ------------------------------------------------------------ GATE YARDS: palisade + crates */
  YARDS.forEach(function(Y, yi){
    var T=Y.tree, ti=TREES.indexOf(T), Rp=Y.r+0.5, prev=null;
    for(var a=0; a<TAU; a+=1.15/Rp){
      var x=Y.x+Math.cos(a)*Rp, z=Y.z+Math.sin(a)*Rp;
      var gap = angDist(a, Y.pa) < 4.5/Rp || (T && Math.hypot(x-T.x,z-T.z) < TR[ti]+2.5);
      for(var e=0;e<EXC.length && !gap;e++){ if(Math.hypot(x-EXC[e][0],z-EXC[e][1]) < EXC[e][2]+0.6) gap=true; }
      if(gap){ prev=null; continue; }
      var g=terrainH(x,z), h=rr(3.0,4.1), tilt=rr(0.10,0.22);
      CONE(x,g-0.5,z, rr(0.26,0.4), h+0.5, [rr(-0.06,0.06), -a, -tilt], pick(PAL.timber), 'timber'); CNT.stakes++;
      if(prev && (CNT.stakes%4===0)){ BEAM(prev[0],prev[1]+1.5,prev[2], x,g+1.5,z, 0.14,0.18, PAL.timber[2], 'timber'); prev=[x,g,z]; }
      if(!prev) prev=[x,g,z];
    }
    var nc=0, tries=0;
    while(nc<7 && tries<200){
      tries++;
      var a2=rr(0,TAU), d=rr(Y.r-9,Y.r-2.5), cx=Y.x+Math.cos(a2)*d, cz=Y.z+Math.sin(a2)*d, ok=angDist(a2,Y.pa)>0.5;
      for(var e2=0;e2<EXC.length && ok;e2++){ if(Math.hypot(cx-EXC[e2][0],cz-EXC[e2][1]) < EXC[e2][2]+2) ok=false; }
      if(T && Math.hypot(cx-T.x,cz-T.z) < TR[ti]+3) ok=false;
      if(!ok) continue;
      var s=rr(0.9,1.5), g2=terrainH(cx,cz), ry=rr(0,TAU);
      BOX(cx,g2-0.1,cz, s,s*0.85,s, ry, pick(PAL.crate), 'timber'); CNT.crates++;
      if(chance(0.5)){ BOX(cx+rr(-0.2,0.2),g2-0.1+s*0.85,cz+rr(-0.2,0.2), s*0.8,s*0.7,s*0.8, ry+rr(-0.4,0.4), pick(PAL.crate), 'timber'); CNT.crates++; }
      nc++;
    }
    REGISTER({ name:Y.tree?('Gate yard'):'Yard', kind:'yard', label:'Palisaded gate yard', x:Y.x, y:terrainH(Y.x,Y.z)-1, z:Y.z, r:Y.r+1, h:5 });
  });

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

  /* ------------------------------------------------------------ cataract mist (animated, 1 draw call) */
  (function(){
    var PER=70, N=PER*CATARACTS.length, pos=new Float32Array(N*3), col=new Float32Array(N*3), st=[];
    function spawn(i, warm){
      var C=CATARACTS[Math.floor(i/PER)], s=C.s+(Math.random()*0.75-0.2)*C.run, R=riverAt(s), half=riverHalfAt(s), v=(Math.random()*2-1)*0.85;
      pos[i*3]=R.x-R.tz*half*v; pos[i*3+1]=riverLevel(s)+0.5+Math.random()*2; pos[i*3+2]=R.z+R.tx*half*v;
      st[i]={ age: warm?Math.random()*9:0, life:6+Math.random()*6, vx:R.tx*(1.2+Math.random())+ (Math.random()-0.5), vz:R.tz*(1.2+Math.random())+(Math.random()-0.5), vy:0.9+Math.random()*1.3, c:Math.floor(i/PER) };
    }
    for(var i=0;i<N;i++) spawn(i,true);
    var cv=document.createElement('canvas'); cv.width=cv.height=64; var g2=cv.getContext('2d'), gr=g2.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,0.55)'); gr.addColorStop(0.4,'rgba(255,255,255,0.22)'); gr.addColorStop(1,'rgba(255,255,255,0)');
    g2.fillStyle=gr; g2.fillRect(0,0,64,64);
    var geo=new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3)); geo.setAttribute('color', new THREE.BufferAttribute(col,3));
    var mat=new THREE.PointsMaterial({ size:30, map:new THREE.CanvasTexture(cv), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
                                       vertexColors:true, sizeAttenuation:true, fog:false });
    var pts=new THREE.Points(geo,mat); pts.frustumCulled=false; pts.renderOrder=3; pts.userData.inspectLabel='Cataract spray'; scene.add(pts);
    TICKS.push(function(dt, hour, nightK){
      dt=Math.min(dt,0.1);
      var day = 1-0.85*clamp(nightK||0,0,1), den = (scene.fog && scene.fog.density) || 0.0005, fade=[];
      for(var c=0;c<CATARACTS.length;c++){ var d=Math.hypot(camera.position.x-CATARACTS[c].x, camera.position.z-CATARACTS[c].z)*den; fade.push(Math.exp(-d*d)*0.30*day); }
      for(var i=0;i<N;i++){
        var S=st[i]; S.age+=dt; if(S.age>S.life){ spawn(i,false); S=st[i]; }
        pos[i*3]+=S.vx*dt; pos[i*3+1]+=S.vy*dt; pos[i*3+2]+=S.vz*dt;
        var t=S.age/S.life, k=Math.sin(Math.PI*Math.min(1,t*1.15))*fade[S.c];
        col[i*3]=k*0.92; col[i*3+1]=k; col[i*3+2]=k*0.96;
      }
      geo.attributes.position.needsUpdate=true; geo.attributes.color.needsUpdate=true;
    });
  })();

  var TALLY1 = tally();
  CNT.instances = TALLY1[0]-TALLY0[0]; CNT.kitTris = TALLY1[1]-TALLY0[1]; CNT.mergedTris = TALLY1[2]-TALLY0[2];
  CNT.totalTris = CNT.kitTris + CNT.mergedTris + CNT.cardTris;
  CNT.channelRocks = JUNGLE_ROCKS.length;
  window._jungle = CNT;
})();
