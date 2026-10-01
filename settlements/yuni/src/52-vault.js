/* ============================== 13. THE GRAND VAULT ==============================
   PLANNER-OWNED. The facade of the Ancient installation, standing in the slot cut into
   the butte's north face (10-core.js: VAULT).

   THIRD DESIGN. The first was a Hotel-Attraction gate; the second a Sagrada Familia
   portico. Both are gone. This one is MODERNIST, and it is one continuous poured thing:

     THE THROAT — a series of concentric squircle arches telescoping back from a 124 m
     opening to the 16 m door, lofted into ONE surface so the frames are swells in a
     single skin rather than separate rings, each swell carried by a smooth bead that
     rides its own arch. No corner on the whole throat is sharp; every one is filleted.

     THE CROWN — Niemeyer's Cathedral of Brasilia: sixteen hyperboloid ribs standing on
     a ring about the portal, wide at the foot, pinched at the waist, flaring out at the
     top, with the Ancients' blue glass filling the bays between them. The Order's
     ELECTRIC light is behind that glass, which is why the Vault is the one lit thing in
     Yuni and can be seen from the valley floor at night.

   Bare concrete, white Ancient metal, blue glass. No applied ornament anywhere: the
   whole building is its own section curve.
   Frame: lx = east(+)/west, lz = metres OUT from the facade plane toward the town.   */
reseed(520001);

var VAULT_LAMPS = [];                      /* [x,y,z] of every electric fitting (72-lights / glow read NL_LAMPS; this is for the probe) */
(function(){
  if(SHEET) return;
  var ZF=VAULT.zf, P=GV_Y, Y1=P+VAULTSITE.plinth;
  function vx(lx){ return VAULT.x - lx; }
  function vz(lz){ return ZF - lz; }
  function slotTopAbs(lx){ return GROUND0 + vaultSlotTop(lx); }
  function ELEC(x,y,z, amp, rad){ nlLampAdd(x,y,z, amp, rad, true, 'electric'); VAULT_LAMPS.push([x,y,z]); }
  var MET=TARNC, NEW=METALC, CON=CONCRETEC;

  /* ---------------------------------------------------------------- geometry helpers */
  /* a SQUIRCLE ARCH: the profile of every frame. n = 2 is an ellipse, n -> infinity a
     rectangle; 3.4 gives near-upright jambs, a level-ish head and a big soft fillet in
     each corner, which is the whole look. Returned as [x, y] from +a round to -a.     */
  function archPts(a, h, n, k){
    var out=[];
    for(var i=0;i<=k;i++){
      var th = Math.PI*i/k, c=Math.cos(th), s=Math.sin(th), e=2/n;
      out.push([ a*(c<0?-1:1)*Math.pow(Math.abs(c),e), h*Math.pow(Math.abs(s),e) ]);
    }
    return out;
  }
  /* loft two arches into a strip of quads — one continuous surface, no seam */
  function loft(fam, A, lzA, B, lzB, col, yA, yB){
    for(var i=0;i<A.length-1;i++){
      var p0=[vx(A[i][0]),   yA+A[i][1],   vz(lzA)], p1=[vx(A[i+1][0]), yA+A[i+1][1], vz(lzA)],
          q1=[vx(B[i+1][0]), yB+B[i+1][1], vz(lzB)], q0=[vx(B[i][0]),   yB+B[i][1],   vz(lzB)];
      /* the outward normal of a throat wall points back out of the funnel, toward the town */
      var mx=(A[i][0]+A[i+1][0])/2, my=(A[i][1]+A[i+1][1])/2, L=Math.hypot(mx,my)||1;
      QF(fam, p0,p1,q1,q0, col, [-mx/L*0.5, -my/L*0.5, -1]);
    }
  }
  /* the bead that rides an arch: a smooth tube, so each concentric frame is a SWELL in
     the skin rather than an edge stuck on it */
  function bead(fam, A, lz, r, col, y0, seg){
    var pts=[];
    for(var i=0;i<A.length;i++) pts.push({ x:vx(A[i][0]), y:y0+A[i][1], z:vz(lz), r:r });
    TUBE(fam, pts, col, { seg:seg||10 });
  }

  /* ---- 0. the screen that fills the slot: plain concrete, one rolled top edge ---- */
  var PORT = { ow:44, oh:62 };
  function rockBackY(lx){ var rn=Math.hypot(lx, BUTTE.z-ZF), q=clamp((rn-BUTTE.rTop)/(BUTTE.rFoot-BUTTE.rTop),0,1); return GROUND0 + BUTTE.H*(1-Math.pow(q,1/2.3)); }
  for(var sx0=-VAULT.halfW-2; sx0<VAULT.halfW+2-0.01; sx0+=2){
    var lxm=sx0+1, top=Math.min(slotTopAbs(lxm), rockBackY(lxm)+4)+1.5, by=P-2;
    if(Math.abs(lxm) < (PORT.ow-4.5)/2) by = Y1 + (PORT.oh-5.0)*(1-Math.pow(lxm/((PORT.ow-4.5)/2),2));
    if(top > by+0.5) BOX(vx(lxm), by, vz(1.2), 2.02, top-by, 2.4, 0, MET[(Math.floor(Math.abs(sx0)/8))%4], 'metal');
  }
  (function(){ var cp=[]; for(var lx=-VAULT.halfW-1; lx<=VAULT.halfW+1.01; lx+=2.5){
      cp.push({ x:vx(lx), y:Math.min(slotTopAbs(lx), rockBackY(lx)+4)+1.6, z:vz(1.2), r:2.1 }); }
    TUBE('metal', cp, NEW[1], { seg:10 }); })();

  /* ---- 1. THE THROAT: concentric squircle arches, lofted into one surface ---------
     Sizes run on a smoothstep rather than a straight taper, so the funnel's section is
     an S-curve: it leaves the opening almost flat, swells inward, and meets the door
     plane square. That curve is what makes it read as poured, not assembled.       */
  var STN = [
    /* lz out,  half-width, height,  bead r */
    [ 31.0, 46, 63, 2.2 ],
    [ 25.4, 40, 56, 2.0 ],
    [ 20.0, 35, 50, 1.8 ],
    [ 15.0, 31, 45, 1.6 ],
    [ 10.4, 27, 41, 1.4 ],
    [  6.2, 24, 38, 1.2 ],
    [  3.0, 22, 36, 1.0 ]
  ];
  var NARCH = 44, NSQ = 3.4;
  var ARCS = STN.map(function(S){ return archPts(S[1], S[2], NSQ, NARCH); });
  /* WHITE. The Vault is the Ancients' own work and it is their white metal, not Yuni's
     concrete: the throat's skin runs from the palest panel at the mouth to a slightly
     tarnished one deep inside, so the funnel reads by tone alone. */
  var SKIN = [NEW[2], NEW[0], NEW[1], NEW[3], MET[2], MET[0], MET[1]];
  for(var k0=0;k0<STN.length-1;k0++){
    loft('metal', ARCS[k0], STN[k0][0], ARCS[k0+1], STN[k0+1][0], SKIN[k0%SKIN.length], Y1, Y1);
  }
  /* the swells: brighter than the skin they ride, so every frame stands out white on white */
  STN.forEach(function(S, i){
    bead('metal', ARCS[i], S[0], S[3], i%2 ? NEW[2] : NEW[0], Y1, 12);
  });
  /* a lit seam in the two innermost bays, deep in the throat where it will not glare */
  [[5],[6]].forEach(function(q, qi){
    var i=q[0], A=ARCS[i], pts=[];
    for(var s=0;s<A.length;s++) pts.push({ x:vx(A[s][0]*0.985), y:Y1+A[s][1]*0.985, z:vz(STN[i][0]-1.1), r:0.30 });
    TUBE('glowmat', pts, qi ? PAL.electricBlue : PAL.electric, { seg:6 });
  });
  /* the jamb returns: close the throat's foot down onto the plinth so no edge shows */
  [-1,1].forEach(function(sd){
    for(var i2=0;i2<STN.length-1;i2++){
      var a0=sd*STN[i2][1], a1=sd*STN[i2+1][1];
      QF('metal', [vx(a0),Y1,vz(STN[i2][0])], [vx(a1),Y1,vz(STN[i2+1][0])],
                  [vx(a1),Y1-4.6,vz(STN[i2+1][0])], [vx(a0),Y1-4.6,vz(STN[i2][0])], NEW[3], [sd,0,-0.2]);
    }
  });

  /* ---- 2. THE DOOR WALL -------------------------------------------------------------
     The throat stops well clear of the door — its innermost arch is 22 m half-width against
     the door's 8 — and the last 3 m is a SPLAYED REVEAL lofted from that arch down to a
     surround only a little larger than the leaves. So the door stands in a wall you can
     read as a wall, with light falling across the splay, instead of being the far end of a
     corrugated pipe.                                                                     */
  var DW=VAULTSITE.doorW, DH=VAULTSITE.doorH;
  (function(){
    var LAST=ARCS.length-1, lzLast=STN[LAST][0];
    var SUR = archPts(DW*0.5 + 11.0, DH + 8.0, 3.2, NARCH);
    loft('metal', ARCS[LAST], lzLast, SUR, 0.9, NEW[2], Y1, Y1);
    bead('metal', SUR, 0.9, 0.7, NEW[0], Y1, 10);
    /* the reveal and the leaves */
    BOX(VAULT.x, Y1, vz(0.1), DW+1.6, DH+1.0, 0.9, 0, VOIDC[0], 'dark');
    [-1,1].forEach(function(sd){ BOX(vx(sd*(DW/4+0.1)), Y1, vz(-0.4), DW/2-0.25, DH*0.80, 0.36, 0, MET[sd>0?3:1], 'metal'); });
    for(var gk=0;gk<4;gk++) BOX(VAULT.x, Y1+3.6+gk*4.4, vz(-0.62), DW-1.0, 0.22, 0.14, 0, NEW[3], 'metal');
    /* a band of light round the surround, so the door is the brightest thing in the throat */
    var pts=[]; for(var s2=0;s2<SUR.length;s2++) pts.push({ x:vx(SUR[s2][0]*0.965), y:Y1+SUR[s2][1]*0.965, z:vz(0.55), r:0.26 });
    TUBE('glowmat', pts, PAL.electric, { seg:6 });
    ELEC(VAULT.x, Y1+DH*0.6, vz(3), 3.0, 44);
    ELEC(VAULT.x, Y1+10, vz(14), 2.2, 46); ELEC(VAULT.x, Y1+16, vz(26), 1.9, 46);
  })();

  /* ---- 3. THE CROWN: sixteen hyperboloid ribs, Brasilia ---------------------------
     R(t) is a true hyperbola: widest at the foot, pinched at the waist, flaring at the
     head. The ribs stand on an ELLIPSE in plan (deeper across the facade than into it)
     so the whole crown sits in front of the rock rather than through it. Between every
     pair, a bay of the Ancients' blue glass, lit from behind.                       */
  var CROWN = { lz:26, y0:Y1-1.2, H:88, nRib:16, seg:26 };
  function hyp(t, r0, rw, r1, tw){            /* one hyperbolic branch through three radii */
    var k = 0.62;
    var f = Math.sqrt(1 + Math.pow((t-tw)/k, 2)) - 1;
    var fLo = Math.sqrt(1 + Math.pow((0-tw)/k, 2)) - 1, fHi = Math.sqrt(1 + Math.pow((1-tw)/k, 2)) - 1;
    return t < tw ? mix(rw, r0, f/Math.max(1e-4,fLo)) : mix(rw, r1, f/Math.max(1e-4,fHi));
  }
  function crownAt(t, phi){
    var ax = hyp(t, 51, 23, 57, 0.44), bz = hyp(t, 26, 11.5, 29, 0.44);
    return { x: vx(Math.cos(phi)*ax), y: CROWN.y0 + CROWN.H*t, z: vz(CROWN.lz + Math.sin(phi)*bz), ax:ax, bz:bz };
  }
  /* THE PASSAGE. Sixteen ribs would be right for a free-standing cathedral, but this one
     is a gate: the two that stand square on the processional axis are omitted, so a 67
     degree opening runs clean from the forecourt, between the ribs, into the throat and
     on to the door. Nothing crosses the axis at any height. */
  var RIBPHI = [];
  for(var ri=0; ri<CROWN.nRib; ri++){
    var ph = ri/CROWN.nRib*TAU + Math.PI/CROWN.nRib;
    if(Math.sin(ph) > 0.90) continue;                     /* the axis stays clear */
    RIBPHI.push(ph);
  }
  RIBPHI.forEach(function(phi, ri){
    var pts=[];
    for(var s=0;s<=CROWN.seg;s++){
      var t=s/CROWN.seg, q=crownAt(t, phi);
      /* the blade is thick at the foot, thinnest at the waist, and thickens again at the
         head — the same curve as the plan, so the rib reads as one swept solid */
      var r = 2.9*(1-t) + 1.05 + 1.5*Math.pow(Math.max(0,t-0.55)/0.45, 1.6);
      pts.push({ x:q.x, y:q.y, z:q.z, r:r });
    }
    TUBE('metal', pts, ri%2 ? NEW[1] : NEW[3], { seg:9 });
  });
  /* the bays: blue glass from the waist up, and a solid concrete web below it, so the
     crown is closed at the bottom and open to the light at the top */
  for(var bi=0; bi<RIBPHI.length; bi++){
    var p0=RIBPHI[bi], p1=RIBPHI[(bi+1)%RIBPHI.length];
    if(p1 < p0) p1 += TAU;
    if(p1 - p0 > 0.6) continue;                           /* that gap IS the passage */
    for(var s2=0; s2<CROWN.seg; s2++){
      var t0=s2/CROWN.seg, t1=(s2+1)/CROWN.seg;
      var a=crownAt(t0,p0), b=crownAt(t0,p1), c=crownAt(t1,p1), d=crownAt(t1,p0);
      var mid=(t0+t1)/2, pm=(p0+p1)/2;
      /* THE FRONT OF THE CROWN IS OPEN. Sixteen ribs, but the four bays that look down
         the processional way carry nothing above the plinth, so the crown frames the
         concentric arches and the door instead of caging them. The rest is blue glass. */
      var glass = mid > 0.22;
      var mx=Math.cos(pm), mz=Math.sin(pm);
      QF(glass ? 'glass' : 'metal', [a.x,a.y,a.z],[b.x,b.y,b.z],[c.x,c.y,c.z],[d.x,d.y,d.z],
         glass ? GLASSC[(bi+s2)%4] : NEW[(bi+s2)%4], [mx, 0.15, -mz]);
    }
    /* the electric behind every fourth bay */
    if(bi%3===0){ var g=crownAt(0.62, (p0+p1)/2); ELEC(g.x, g.y, g.z + (g.z>vz(CROWN.lz)?6:-6), 2.4, 44); }
  }
  /* the foot ring and the rim: two smooth tori that tie the sixteen ribs into one thing */
  (function(){
    /* the foot ring stops either side of the passage; the rim ring runs the whole way,
       because at 87 m it is over the visitor's head and ties the ribs into one thing */
    (function(){ var pts=[];
      for(var s=0;s<=96;s++){ var ph=Math.PI*0.5 + 0.60 + (s/96)*(TAU - 1.20), q=crownAt(0.02, ph);
        pts.push({ x:q.x, y:q.y, z:q.z, r:2.4 }); }
      TUBE('metal', pts, NEW[3], { seg:9 }); })();
    (function(){ var pts=[];
      for(var s=0;s<=96;s++){ var q=crownAt(1.0, s/96*TAU); pts.push({ x:q.x, y:q.y, z:q.z, r:1.7 }); }
      TUBE('metal', pts, NEW[1], { seg:9 }); })();
  })();
  REGISTER({ name:'The Crown of the Vault', kind:'vault', label:'sixteen hyperboloid ribs, blue glass between — the Order’s electric light',
             x:VAULT.x, y:CROWN.y0, z:vz(CROWN.lz), r:58, h:CROWN.H+6 });

  /* ---- 4. two side recesses: smooth ovals, glazed, no frame ---- */
  [-1,1].forEach(function(sd){
    var cx=sd*44, A=archPts(11, 26, 2.6, 24);
    for(var i3=0;i3<3;i3++){
      var sc=1 - i3*0.10, B=A.map(function(p){ return [p[0]*sc, p[1]*sc]; });
      if(i3<2) loft('concrete', A.map(function(p,pi){ var s2=1-i3*0.10; return [p[0]*s2,p[1]*s2]; }), 5.4-i3*1.9,
                    A.map(function(p){ return [p[0]*(1-(i3+1)*0.10), p[1]*(1-(i3+1)*0.10)]; }), 5.4-(i3+1)*1.9,
                    CON[i3%4], Y1, Y1);
      bead('metal', B, 5.4-i3*1.9, 0.55, i3%2?MET[1]:NEW[3], Y1, 8);
    }
    BOX(vx(cx), Y1, vz(1.6), 17, 23, 0.4, 0, GLASSC[2], 'glass');
    ELEC(vx(cx), Y1+15, vz(7), 1.8, 30);
  });
  /* the recesses sit in the screen, so move them there */
  /* ---- 5. plinth, the great stair, lamp standards ---- */
  BOX(VAULT.x, P-3, vz(17), 2*VAULT.halfW+4, VAULTSITE.plinth+3, 34, 0, CON[0], 'concrete');
  BOX(VAULT.x, Y1-0.02, vz(17), 2*VAULT.halfW+2, 0.1, 33.6, 0, CON[2], 'concrete');
  for(var st=0; st<10; st++){ BOX(VAULT.x, P-1, vz(34.6+st*1.55+0.8), 72, VAULTSITE.plinth+1-(st+1)*0.5, 1.6, 0, st%2?CON[2]:CON[1], 'concrete'); }
  /* a smooth nosing on the top step, so even the stair has no sharp edge */
  (function(){ var pts=[]; for(var lx=-36; lx<=36.01; lx+=4) pts.push({ x:vx(lx), y:Y1-0.3, z:vz(34.2), r:0.85 }); TUBE('concrete', pts, CON[3], { seg:8 }); })();
  /* electric standards down both sides of the forecourt axis */
  for(var r2=0;r2<3;r2++){ [-1,1].forEach(function(sd){ var x=vx(sd*22), z=vz(52+r2*16), gy=terrainH(x,z);
    CYL(x, gy, z, 0.30, 10.5, 0, NEW[1], 'metal');
    TUBE('metal', [{x:x,y:gy+10.5,z:z,r:0.30},{x:x,y:gy+11.7,z:z,r:0.95},{x:x,y:gy+12.3,z:z,r:0.22}], NEW[2], { seg:10 });
    BALL(x, gy+11.1, z, 0.66, PAL.electric, 'glowmat'); ELEC(x, gy+10.6, z, 1.7, 30);
    REGISTER({ name:'Electric standard', kind:'lamp', label:'Order-maintained arc lamp', x:x, y:gy, z:z, r:1.2, h:13 }); }); }
  /* wash lights along the plinth edge */
  for(var f=-5; f<=5; f++){ if(Math.abs(f)<2) continue; BOX(vx(f*11), Y1, vz(33.2), 1.6, 0.30, 0.5, 0, PAL.electric, 'glowmat'); ELEC(vx(f*11), Y1+2.5, vz(28), 1.3, 26); }

  REGISTER({ name:'The Grand Vault', kind:'vault', label:'facade of the Ancient installation — Order of Historians', x:VAULT.x, y:P-3, z:vz(16), hx:VAULT.halfW+3, hz:24, h:slotTopAbs(0)-P+10 });
  REGISTER({ name:'Great door', kind:'vault', label:DW+' x '+DH+' m, leads down to the antechamber', x:VAULT.x, y:Y1, z:vz(0), r:DW*0.6, h:DH });
  window._vault = { lamps:VAULT_LAMPS.length, top:slotTopAbs(0), plinthY:Y1, ribs:CROWN.nRib, frames:STN.length };
})();
