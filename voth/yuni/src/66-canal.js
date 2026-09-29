/* ============================== 16b. THE CANAL WORKS ==============================
   PLANNER-OWNED. The built pieces of the irrigation system: the diversion weir and its
   head-works at the valley head, the sluices where the distributary ditches take off,
   the towpath (trees, footbridges, mile-stones) and the basin the canal ends in.
   The channel itself, its banks and its water are terrain (10-core / 75-terrain).   */
reseed(660001);
(function(){
  if(SHEET) return;
  var S=STONEC, W=WHITEC, A=ADOBEC, T=TIMBERC;
  function yawAlong(dx,dz){ return Math.atan2(-dz, dx); }        /* local +x runs along (dx,dz) */

  /* ---------- 1. THE DIVERSION WEIR ---------- */
  (function(){
    var R=riverAt(WEIR_S), half=riverHalfAt(WEIR_S), nx=-R.tz, nz=R.tx;     /* across the river */
    var crest=CANAL_L0+0.35, toe=riverLevelBase(WEIR_S+40)-0.6, span=2*half+30, ry=yawAlong(nx,nz);
    /* the dam: a battered wall with an ogee crest, and a stepped apron falling away downstream */
    BOX(R.x, toe-1.5, R.z, span, crest-toe+1.5, 7.0, ry, S[1], 'rock');
    BOX(R.x+R.tx*4.2, toe-1.5, R.z+R.tz*4.2, span, crest-toe-0.9, 5.0, ry, S[3], 'rock');
    BOX(R.x+R.tx*8.0, toe-1.5, R.z+R.tz*8.0, span, crest-toe-2.4, 5.0, ry, S[2], 'rock');
    BOX(R.x, crest-0.55, R.z, span, 0.6, 8.6, ry, W[3], 'plaster');          /* the crest coping */
    for(var k=-3;k<=3;k++){                                                  /* cutwaters and buttresses */
      var p=[R.x+nx*k*(span/7.4), R.z+nz*k*(span/7.4)];
      FR5(p[0], toe-1.5, p[1], 3.0, crest-toe+1.1, 3.0, ry, S[0], 'rock');
      CONE(p[0]-R.tx*3.0, toe-1.4, p[1]-R.tz*3.0, 1.6, crest-toe+0.6, 0, S[2], 'rock');
      BOX(p[0]+R.tx*9.5, toe-1.4, p[1]+R.tz*9.5, 2.0, crest-toe-3.0, 9.0, ry, S[3], 'rock');
    }
    REGISTER({ name:'The Diversion Weir', kind:'canal', label:'masonry dam; lifts the river '+WEIR_LIFT.toFixed(1)+' m into the canal', x:R.x, y:toe-2, z:R.z, r:span*0.55, h:crest-toe+6 });

    /* the head-works: a sluice house on the canal bank with three gated openings */
    var C0=canalAt(0), C1=canalAt(40), hx=C1.x-C0.x, hz=C1.z-C0.z, hl=Math.hypot(hx,hz)||1; hx/=hl; hz/=hl;
    var hry=Math.atan2(hx,hz), gy=CANAL_L0-1.9, px=C0.x+hx*14, pz=C0.z+hz*14;
    ARCHWALL('rock', px, pz, hry, gy, 26, 9.5, 4.2, 5.2, 4.6, S[1], { colIn:S[3], ox:0, seg:14 });
    ARCHWALL('rock', px, pz, hry, gy, 8.4, 9.5, 4.2, 5.2, 4.6, S[1], { colIn:S[3], ox:-8.6, seg:14 });
    ARCHWALL('rock', px, pz, hry, gy, 8.4, 9.5, 4.2, 5.2, 4.6, S[1], { colIn:S[3], ox:8.6, seg:14 });
    [-8.6,0,8.6].forEach(function(ox){ var q=loc(px,pz,ox,0,hry);
      BOX(q[0], gy+1.2, q[1], 4.6, 3.2, 0.36, hry, T[0], 'plank');                               /* the timber gate */
      BOX(q[0], gy+9.6, q[1], 5.6, 1.1, 5.0, hry, W[0], 'plaster');
      CYL(q[0], gy+10.7, q[1], 0.22, 2.2, 0, BRASSC[0], 'metal'); });                             /* the lifting screw */
    BOX(px, gy+9.5, pz, 26.6, 0.9, 5.6, hry, W[1], 'plaster');                                    /* the walkway over */
    [-1,1].forEach(function(sd){ BLUNT_TOWER(loc(px,pz,sd*13.6,0,hry)[0], gy, loc(px,pz,sd*13.6,0,hry)[1], 2.4, 15, { flutes:8, band:MOSBLUEC[0], windows:[0.55], seg:12 }); });
    REGISTER({ name:'Canal head-works', kind:'canal', label:'three gated sluices; the Emir appoints their keeper', x:px, y:gy, z:pz, r:16, h:18 });
  })();

  /* ---------- 2. the distributary sluices ---------- */
  DITCHES.forEach(function(D,i){
    var C=canalAt(D.s), dx=D.x1-D.x0, dz=D.z1-D.z0, L=Math.hypot(dx,dz)||1, ry=Math.atan2(dx/L,dz/L);
    var gy=canalLevel(D.s)-1.1, bx=mix(C.x,D.x0,0.5), bz=mix(C.z,D.z0,0.5);
    ARCHWALL('rock', bx, bz, ry, gy, 5.2, 3.6, 2.4, 2.0, 1.7, S[i%4], { colIn:S[3], seg:10 });
    BOX(bx, gy+0.5, bz, 1.9, 1.7, 0.22, ry, T[2], 'plank');
    BOX(bx, gy+3.8, bz, 5.6, 0.5, 3.0, ry, W[2], 'plaster');
    REGISTER({ name:'Distributary sluice '+(i+1), kind:'canal', label:(D.inward?'feeds the town-side fields':'feeds the outer fields'), x:bx, y:gy, z:bz, r:3.4, h:5 });
  });

  /* ---------- 3. the towpath: an avenue of trees, footbridges and mile-stones ---------- */
  (function(){
    var n=Math.floor(CANAL_LEN/46);
    for(var k=0;k<=n;k++){
      var s=CANAL_LEN*k/n, C=canalAt(s), nx=-C.tz, nz=C.tx, off=(CANAL_W[1]+CANAL_W[2])/2;
      [-1,1].forEach(function(sd){
        var x=C.x+nx*sd*off, z=C.z+nz*sd*off;
        if(riverDist(x,z) < 24) return;
        if((k+ (sd>0?0:1)) % 2) return;                       /* staggered, so the avenue is not a wall */
        if(phash(k,sd,3,7) < 0.30) return;
        var h=rr(9,15);
        if(chance(0.62)) CYPRESS(x,z,h); else PINE(x,z,rr(10,16));
      });
      if(k%7===3){ var mx=C.x+nx*(CANAL_W[2]-1.2), mz=C.z+nz*(CANAL_W[2]-1.2);
        FR5(mx, terrainH(mx,mz)-0.2, mz, 0.7, 1.4, 0.7, 0, W[0], 'plaster'); }
    }
    /* four foot bridges, and one where each highway would otherwise ford it */
    [0.20,0.42,0.63,0.85].forEach(function(f){
      var s=CANAL_LEN*f, C=canalAt(s), nx=-C.tz, nz=C.tx, ry=Math.atan2(nx,nz), y=canalLevel(s)+1.4;
      ARCHWALL('rock', C.x, C.z, ry+Math.PI/2, y-3.2, 2.2, 4.4, 26, 1.2, 1.2, S[2], { seg:8 });   /* the pier stub, sunk in the bank */
      BOX(C.x, y, C.z, 2.6, 0.35, 2*CANAL_W[1]+3, Math.atan2(-nz,nx), T[1], 'plank');
      [-1,1].forEach(function(sd){ for(var q=-3;q<=3;q++){ var px=C.x+nx*q*3.4+(-C.tz===0?0:0)+C.tx*sd*1.2, pz=C.z+nz*q*3.4+C.tz*sd*1.2;
        if(Math.abs(q*3.4) > CANAL_W[1]+1) continue; CYL(px, y+0.35, pz, 0.07, 1.0, 0, T[0], 'timber'); } });
      REGISTER({ name:'Canal footbridge', kind:'canal', label:'plank crossing between the fields', x:C.x, y:y-1, z:C.z, r:CANAL_W[1]+2, h:3 });
    });
  })();

  /* ---------- 4. THE BASIN: where the canal ends, and the city draws its water ---------- */
  (function(){
    var B=CANAL_BASIN, L=canalLevel(CANAL_LEN), rim=L+1.5, ry=B.ry;
    function P(lx,lz){ return loc(B.x,B.z,lx,lz,ry); }
    /* the tank: four walls, open where the canal comes in */
    [[0,-B.d/2,B.w,1], [0,B.d/2,B.w,1], [-B.w/2,0,B.d,0], [B.w/2,0,B.d,0]].forEach(function(wdef,i){
      var q=P(wdef[0],wdef[1]), wry = wdef[3] ? ry : ry+Math.PI/2;
      if(i===0) return;                                          /* the inlet end, where the canal arrives, stays open */
      BOX(q[0], L-3.4, q[1], wdef[2]+3.0, 5.4, 3.0, wry, S[i%4], 'rock');
      BOX(q[0], rim-0.55, q[1], wdef[2]+3.6, 0.55, 3.8, wry, W[1], 'plaster');
      BOX(q[0], rim, q[1], wdef[2]+3.6, 0.28, 3.9, wry, MOSBLUEC[i%4], 'mosaic');
    });
    /* a flight of steps down into it on the town side (the water itself is part of the canal ribbon) */
    for(var st=0;st<6;st++){ var q2=P(0, B.d/2-3.4-st*1.3); BOX(q2[0], L-1.9+st*0.42, q2[1], 26, 0.45, 1.4, ry, W[3], 'plaster'); }
    /* a little drawing pavilion on the rim */
    var pv=P(B.w/2-9, B.d/2-9);
    for(var c2=0;c2<4;c2++){ var cq=P(B.w/2-9+(c2%2?3.2:-3.2), B.d/2-9+(c2<2?-3.2:3.2)); CYL(cq[0], rim, cq[1], 0.34, 3.8, 0, W[0], 'plaster'); }
    DOME(pv[0], rim+3.8, pv[1], 5.0, 3.0, ry, MOSBLUEC[0], 'mosaic');
    BALL(pv[0], rim+7.4, pv[1], 0.5, BRASSC[0], 'metal');
    LANTERN(pv[0], rim+3.2, pv[1], 1.1, 16, false, 0.4);
    REGISTER({ name:'The Basin', kind:'canal', label:'the canal reservoir — the city\'s standing water', x:B.x, y:L-4, z:B.z, hx:B.w/2+2, hz:B.d/2+2, h:9 });
  })();
  window._canalWorks = { ditches:DITCHES.length };
})();
