/* ============================== 16b. ASSETS: middle-class houses + trade ==============================
   Agent "mid". Families 'mid' (dwellings), 'trade' (shops, taverns, workshops, caravanserai, market), 'prop'.
   One IIFE; colours only from PAL; geometry only through F (local frame, +z = front). */
reseed(560001);
(function(){
  var PI=Math.PI;
  /* ---- triangle accounting (window._midTris[key#variant]) so the budgets can be reported honestly ---- */
  var TRI_OF={ box:12, fr8:12, fr5:12, pyr:12, cyl:40, cyl6:10, cone:20, dome:72, blob:49, ball:70 };
  function triCount(){ var t=0,k; for(k in BUCKET){ t+=BUCKET[k].list.length*(TRI_OF[BUCKET[k].shape]||12); } for(k in MBK){ t+=MBK[k].tris||0; } return t; }
  function A(o){ var b=o.build; o.build=function(F){ var t0=triCount(); b(F); (window._midTris=window._midTris||{})[o.key+'#'+F.variant]=triCount()-t0; }; ASSET(o); }

  /* ---- helpers ---------------------------------------------------------------------------------- */
  /* a loop of 16 points round a rounded rectangle (half-sizes a,b; corner radius rc) at height y */
  function rloop(cx,cz,a,b,rc,y){ var pts=[], cs=[[1,1,0],[-1,1,PI/2],[-1,-1,PI],[1,-1,1.5*PI]];
    cs.forEach(function(c){ for(var k=0;k<4;k++){ var g=c[2]+k/3*PI/2; pts.push([cx+c[0]*(a-rc)+rc*Math.cos(g), y, cz+c[1]*(b-rc)+rc*Math.sin(g)]); } }); return pts; }
  /* ROUNDED, BATTERED BODY with a real sunken roof terrace: wall, parapet top, parapet inner face, deck.
     o = {x,z,W,D,y0,H,par,t,rc,k,col,fam,deck,base}  ->  {zf(y), zb(y), xr(y), xl(y)} : the wall planes at height y */
  function rbody(F,o){
    var cx=o.x||0, cz=o.z||0, y0=o.y0||0, H=o.H, par=o.par==null?0.9:o.par, t=o.t||0.35, rc=o.rc||1.1, k=o.k==null?0.94:o.k, fam=o.fam||'plaster', col=o.col;
    var yt=H+par, a0=o.W/2, b0=o.D/2;
    function sc(y){ return 1-(1-k)*(y-y0)/(yt-y0); }
    var yb1 = o.base ? y0+o.base : y0;
    var L0=rloop(cx,cz,a0,b0,rc,y0), Lb=rloop(cx,cz,a0*sc(yb1),b0*sc(yb1),rc,yb1), L1=rloop(cx,cz,a0*k,b0*k,rc*k,yt), L2=rloop(cx,cz,a0*k-t,b0*k-t,Math.max(0.1,rc*k-t),yt), L3=rloop(cx,cz,a0*k-t,b0*k-t,Math.max(0.1,rc*k-t),H);
    for(var i=0;i<16;i++){ var j=(i+1)%16, mx=(L0[i][0]+L0[j][0])/2-cx, mz=(L0[i][2]+L0[j][2])/2-cz;
      if(o.base){ F.quad(fam, L0[i],L0[j],Lb[j],Lb[i], o.baseCol!=null?o.baseCol:shade(col,-0.14), [mx,0.1,mz]); F.quad(fam, Lb[i],Lb[j],L1[j],L1[i], col, [mx,0.1,mz]); }
      else F.quad(fam, L0[i],L0[j],L1[j],L1[i], col, [mx,0.1,mz]);
      if(par>0){ F.quad(fam, L1[i],L1[j],L2[j],L2[i], shade(col,0.05), [0,1,0]); F.quad(fam, L2[i],L2[j],L3[j],L3[i], shade(col,-0.08), [-mx,0,-mz]); }
      F.tri(o.deckFam||'adobe', par>0?L3[i]:L1[i], par>0?L3[j]:L1[j], [cx,par>0?H:yt,cz], o.deck!=null?o.deck:PAL.lane[1], [0,1,0]); }
    return { zf:function(y){ return cz+b0*sc(y); }, zb:function(y){ return cz-b0*sc(y); }, xr:function(y){ return cx+a0*sc(y); }, xl:function(y){ return cx-a0*sc(y); }, sc:sc, o:o };
  }
  /* a band hugging a rounded body between y1 and y2, standing `off` proud (frieze of relief / paint / tile) */
  function rband(F,B,y1,y2,off,col,fam){ var o=B.o, cx=o.x||0, cz=o.z||0, rc=o.rc||1.1;
    var La=rloop(cx,cz,o.W/2*B.sc(y1)+off,o.D/2*B.sc(y1)+off,rc+off,y1), Lb=rloop(cx,cz,o.W/2*B.sc(y2)+off,o.D/2*B.sc(y2)+off,rc+off,y2);
    for(var i=0;i<16;i++){ var j=(i+1)%16; F.quad(fam, La[i],La[j],Lb[j],Lb[i], col, [(La[i][0]+La[j][0])/2-cx,0,(La[i][2]+La[j][2])/2-cz]); }
}
  /* four parapet walls + deck slab on a rectangular volume whose top is at y */
  function parapet(F,cx,cz,W,D,y,h,t,col,fam,sides){ sides=sides||'fblr';
    if(sides.indexOf('f')>=0) F.box(cx,y,cz+D/2-t/2, W,h,t, 0,col,fam); if(sides.indexOf('b')>=0) F.box(cx,y,cz-D/2+t/2, W,h,t, 0,col,fam);
    if(sides.indexOf('l')>=0) F.box(cx-W/2+t/2,y,cz, t,h-0.03,D-2*t, 0,col,fam); if(sides.indexOf('r')>=0) F.box(cx+W/2-t/2,y,cz, t,h-0.03,D-2*t, 0,col,fam); }
  /* the parabolic front door: plank leaf behind a proud arch slab (hides the leaf's square shoulders). face: 0 front, PI/2 right, PI back, -PI/2 left */
  /* THE DOOR. `lz` is the host wall's face AT THE DOOR'S OWN MID-HEIGHT (~1.4 m) — on a battered wall the face
     recedes with height, so a surround placed off the BASE plane stands proud at the top (55-mid-example's zf(y)).
     The slab is thin and set only 0.08 out from that plane, so it reads as a moulded band, not a buttress. */
  function pdoor(F,lx,lz,face,col,fam,o){ o=o||{}; var nx=Math.sin(face), nz=Math.cos(face), ow=o.ow||1.5, oh=o.oh||2.5, W=o.W||2.3, Hh=o.H||3.05, T=o.T||0.2;
    F.door(lx,lz, nx,nz, ow-0.1, 2.25, o.leaf!=null?o.leaf:PLANKC[1], o.sill);
    F.archwall(fam||'relief', lx+nx*(T/2+0.06),o.sill||0,lz+nz*(T/2+0.06), face, W,Hh,T, ow,oh, col, { noBack:true, seg:8, pointed:2.7, colIn:shade(col,-0.2) }); }
  /* a dark parabolic opening standing proud of a wall (loggia window, vent, kiln mouth) */
  function parch(F,lx,ly,lz,face,w,h,col,fam){ var nx=Math.sin(face), nz=Math.cos(face); F.box(lx+nx*0.03,ly,lz+nz*0.03, w+0.1,h+0.05,0.06, face, VOIDC[0],'dark');
    F.archwall(fam||'plaster', lx+nx*0.12,ly,lz+nz*0.12, face, w+0.7,h+0.45,0.2, w,h, col, { noBack:true, seg:6 }); }
  /* striped awning: n stripes across x0..x1, from the wall edge (zb,yb) down to the front edge (zf,yf); both faces */
  function awning(F,x0,x1,zb,yb,zf,yf,n,cA,cB,poles){ for(var i=0;i<n;i++){ var xa=x0+(x1-x0)*i/n, xb=x0+(x1-x0)*(i+1)/n, c=i%2?cB:cA;
      F.quad('cloth',[xa,yb,zb],[xb,yb,zb],[xb,yf,zf],[xa,yf,zf], c, [0,1,0.2]); F.quad('cloth',[xa,yb-0.03,zb],[xb,yb-0.03,zb],[xb,yf-0.03,zf],[xa,yf-0.03,zf], shade(c,-0.3), [0,-1,-0.2]);
      F.quad('cloth',[xa,yf,zf],[xb,yf,zf],[xb,yf-0.32,zf+0.02],[xa,yf-0.32,zf+0.02], c, [0,0,1]); }
    if(poles!==false){ F.rod(x0+0.08,0,zf-0.08, x0+0.08,yf,zf-0.08, 0.055, TIMBERC[1]); F.rod(x1-0.08,0,zf-0.08, x1-0.08,yf,zf-0.08, 0.055, TIMBERC[1]); } }
  function bale(F,lx,ly,lz,w,h,d,rot,col){ F.box(lx,ly,lz, w,h,d, rot||0, col,'plaster'); F.box(lx,ly+h*0.35,lz, w+0.04,0.07,d+0.04, rot||0, PAL.thatch[3],'plaster'); }
  /* a jar / pot: small lathe, 6-sided */
  function pot(F,lx,ly,lz,r,h,col){ F.lathe('adobe', lx,lz, [[r*0.55,ly],[r,ly+h*0.45],[r*0.8,ly+h*0.8],[r*0.45,ly+h*0.9],[r*0.6,ly+h]], col, { seg:6, cap:true }); }
  function ladder(F,ax,ay,az,bx,by,bz){ var dx=0.22; F.rod(ax-dx,ay,az,bx-dx,by,bz,0.04,TIMBERC[2]); F.rod(ax+dx,ay,az,bx+dx,by,bz,0.04,TIMBERC[2]);
    for(var i=1;i<5;i++){ var t=i/5; F.beam(ax-dx,ay+(by-ay)*t,az+(bz-az)*t, ax+dx,ay+(by-ay)*t,az+(bz-az)*t, 0.05,0.05, TIMBERC[0],'timber'); } }
  function laundry(F,ax,ay,az,bx,by,bz,n,h0,h1,cols){ F.rod(ax,ay,az,bx,by,bz,0.02,TIMBERC[3]); for(var i=0;i<n;i++){ var t=(i+0.7)/(n+0.4), h=F.rr(h0||0.7,h1||1.1), yy=ay+(by-ay)*t;
      F.box(ax+(bx-ax)*t, yy-h, az+(bz-az)*t, F.rr(0.6,0.95), h, 0.03, Math.atan2(-(bz-az),(bx-ax)), F.pick(cols||CLOTHC), 'cloth'); } }
  function washOf(F,i){ return [BLUELC,BLUEDC,WHITEC,ADOBEC][i][Math.floor(F.rnd()*4)]; }

  /* =================================================================== 1. BLUE-WASH TOWNHOUSE */
  A({ key:'mid_bluewash_townhouse', name:'Blue-wash townhouse', family:'mid', districts:['prosper','market'], wealth:[0.35,0.75], w:10, d:10, h:13, variants:4,
    build:function(F){
      var v=F.variant, st=(v===1||v===3)?3:2, H=st*3.2+0.3, W=(st===3?7.8:8.6), D=7.2, cz=-0.7;
      var col=v===2?F.pick(BLUEGREYC):washOf(F,v), fam=v===3?'adobe':'plaster', trim = v===2?BLUEDC[0] : v===3?WHITEC[0] : shade(col, v===1?0.22:-0.16);
      var B=rbody(F,{ x:0,z:cz,W:W,D:D,H:H,par:0.95,rc:1.25,k:0.93,col:col,fam:fam,base:0.8, baseCol: v===2?BLUEDC[1]:shade(col,-0.18) });
      /* frieze under the parapet: relief; tile where there is money */
      if(F.wealth>0.62) rband(F,B,H-0.55,H+0.1,0.05,MOSBLUEC[v%4],'mosaic'); else rband(F,B,H-0.6,H+0.1,0.05,shade(trim,0.04),'relief');
      var dx=(v%2?1:-1)*W*0.22, mx=-dx;
      pdoor(F,dx,B.zf(1.4)+0.02,0, (v===2||v===3)?trim:shade(col,0.12),'relief',{leaf:PLANKC[v%4]});
      F.box(dx,0,B.zf(0)+0.55, 2.0,0.18,0.9, 0, PAL.paving[1],'rock');                                   /* door step */
      /* windows: small and deep */
      function win(x,y,w,h){ if(v>=2) F.box(x,y-h/2-0.22,B.zf(y)-0.02, w+0.5,h+0.44,0.1, 0, trim, fam==='adobe'?'plaster':fam); F.window(x,y,B.zf(y)+0.03, 0,1, w,h); }
      win(mx,1.9,0.7,0.8);
      for(var s=1;s<st;s++){ var y=s*3.2+1.9; if(s>1||true) win(dx,y,0.75,1.05); if(s>1) win(mx,y,0.75,1.05); }
      F.window(B.xr(5.1)+0.03,5.1,cz+0.8, 1,0, 0.7,1.0); F.window(B.xl(5.1)-0.03,5.1,cz-0.6, -1,0, 0.7,1.0);
      /* the mashrabiya: a timber box bay on brackets at the first floor */
      var my=3.55, mzf=B.zf(my)+0.95; F.box(mx,my,B.zf(my)+0.40, 2.3,2.0,1.1, 0, PLANKC[(v+1)%4],'plank');
      F.fr5(mx,my+2.0,B.zf(my)+0.40, 2.6,0.45,1.3, 0, TIMBERC[1],'timber'); F.box(mx,my-0.16,B.zf(my)+0.40, 2.5,0.16,1.2, 0, TIMBERC[0],'timber');
      F.window(mx,my+1.15,mzf+0.02, 0,1, 1.5,0.8);
      [-0.9,0.9].forEach(function(o){ F.beam(mx+o,my-1.1,B.zf(my-1.1)-0.05, mx+o,my-0.1,mzf-0.15, 0.14,0.14, TIMBERC[0],'timber'); });
      /* roof terrace: stair bulkhead, pots, laundry */
      var bx=(v%2?-1:1)*(W*0.93/2-1.7), bz=cz-D*0.93/2+1.75, bh=(v===2?3.0:2.2), bw=(v===2?3.6:2.3);
      if(v===2){ bx=W*0.93/2-2.35; bz=cz-D*0.93/2+2.4; }
      F.box(bx,H,bz, bw,bh,bw, 0, shade(col,0.04),fam); F.box(bx-(v===2?0.9:0),H,bz+bw/2+0.02, 0.9,1.9,0.08, 0, VOIDC[1],'dark');
      if(v===2){ F.window(bx+0.8,H+1.7,bz+bw/2+0.03, 0,1, 0.7,0.9); F.box(bx,H+bh,bz, bw+0.3,0.3,bw+0.3, 0, trim,'plaster'); }
      pot(F,-bx*0.9,H,cz+D*0.3, 0.32,0.7, TILEC[1]); F.blob(-bx*0.9,H+0.6,cz+D*0.3,0.45,0.6,0,PAL.shrub[1],'leafy');
      if(F.chance(0.7)) laundry(F, -bx, H+1.9, bz, bx-(bx>0?1:-1)*bw/2, H+1.9, bz, 3), F.rod(-bx,H,bz,-bx,H+2.0,bz,0.04,TIMBERC[1]);
      F.lantern(dx+(dx>0?-1.45:1.45), 2.6, B.zf(2.6)+0.3, 0.8, 12, 0);
    } });

  /* =================================================================== 2. DJENNE-FRONT HOUSE */
  A({ key:'mid_djenne_house', name:'Djenne-front town house', family:'mid', districts:['prosper','market','poor'], wealth:[0.30,0.70], w:11, d:9, h:11, variants:3,
    build:function(F){
      var v=F.variant, H=[6.4,7.4,4.3][v], W=9.4, D=7.0, cz=-0.4, fam=v===2?'plaster':'adobe', col=v===0?F.pick(ADOBEC):v===1?F.pick(ADOBEREDC):F.pick(WHITEC);
      var dk=shade(col,-0.12);
      F.fr8(0,0,cz, W,H,D, 0, col,fam);
      function zf(y){ return cz+D/2*(1-0.16*y/H); } function xf(y){ return W/2*(1-0.16*y/H); }
      parapet(F,0,cz,W*0.84,D*0.84,H-0.02,0.7,0.3,col,fam); F.box(0,H-0.04,cz,W*0.84-0.5,0.12,D*0.84-0.5,0,PAL.lane[0],'adobe');
      /* the potige: raised central panel over the door, crowned with pinnacles */
      var pw=v===1?4.4:3.6, ph=H+(v===2?1.0:1.5), np=v===1?5:3, pcz=zf(0)-0.20;   /* panel front stands 0.25 proud of the wall at the base */
      function pf(y){ return pcz+0.45*(1-0.16*y/ph); }            /* the potige panel is battered too: its face at height y */
      F.fr8(0,0,pcz, pw,ph,0.9, 0, shade(col,0.10),fam);
      for(var i=0;i<np;i++){ var px=(i-(np-1)/2)*(pw*0.80/(np-1)), hh=(i===(np-1)/2)?1.5:1.0; F.cone(px,ph-0.05,pcz, 0.30,hh,0,shade(col,0.10),fam); }
      /* engaged buttress-pilasters: corners + flanking the potige, rising into pinnacles */
      [-W/2+0.35,-pw/2-1.15,pw/2+1.15,W/2-0.35].forEach(function(px,i){ var c=(i===0||i===3), k=c?1.0:0.85;
        F.fr5(px,0,zf(H*0.5)+0.05, 1.0*k,H+0.7,1.0*k, 0, col,fam); F.cone(px,H+0.6,zf(H*0.5)+0.05, 0.34*k,1.25*k,0,col,fam); });
      [-1,1].forEach(function(s){ F.fr5(s*(W/2-0.35),0,cz-D/2*0.95, 1.0,H+0.7,1.0,0,col,fam); F.cone(s*(W/2-0.35),H+0.6,cz-D/2*0.95,0.34,1.25,0,col,fam); });
      /* rounded merlons between the pilasters */
      [-1,1].forEach(function(s){ for(var m=0;m<2;m++){ var x=s*(pw/2+2.05+m*0.95); if(Math.abs(x)<W*0.42-0.7) F.fr5(x,H+0.6,zf(H)-0.2, 0.5,0.65,0.4,0,col,fam); } });
      /* door in the potige: parabolic, in a moulded surround */
      pdoor(F,0,pf(1.4),0, shade(col,0.16), 'relief', {W:2.7,H:3.25,T:0.26, ow:1.55, oh:2.75, leaf:v===1?PAL.paintRed[1]:PLANKC[2]});
      /* engaged colonnettes either side of the door, and toron on the panel — the Djenne front */
      [-1,1].forEach(function(sd){ F.fr5(sd*1.62,0,pf(1.6)-0.06, 0.52,ph-1.1,0.52, 0, shade(col,0.16),fam); F.cone(sd*1.62,ph-1.15,pf(1.6)-0.06, 0.18,0.9,0,shade(col,0.16),fam); });
      for(var q=0;q<3;q++){ var ty=3.9+q*1.35; if(ty<ph-1.6) for(var u=-1;u<=1;u+=2) F.toron(u*0.95,ty,pf(ty), 0,1, 0.75,0.07); }
      /* small windows + toron rows */
      var wy=H>5?H-2.2:2.2;
      [-1,1].forEach(function(s){ var x=s*(pw/2+0.35+ (W/2-pw/2-1.5)/2 +0.0); x=s*((pw/2+1.15)+(W/2-0.35))/2;
        F.window(x,wy,zf(wy)+0.03, 0,1, 0.6,0.75); if(H>5) F.window(x,2.0,zf(2.0)+0.03, 0,1, 0.55,0.7);
        for(var r=0;r<(H>5?2:1);r++){ var ty=H-0.95-r*2.4; for(var t=-1;t<=1;t+=2) F.toron(x+t*0.62,ty,zf(ty), 0,1, 0.75,0.07); } });
      if(H>5){ F.window(0,H-1.35,pf(H-1.35)+0.02, 0,1, 0.7,0.9); for(var t2=-1;t2<=1;t2++) F.toron(t2*0.9,H-0.3,zf(H)+0.3, 0,1, 0.7,0.07); }
      F.window(xf(wy)+0.03,wy,cz, 1,0, 0.6,0.8); F.window(-xf(wy)-0.03,wy,cz+1, -1,0, 0.6,0.8);
      for(t2=-2;t2<=2;t2++){ F.toron(xf(H-1)*1.0,H-0.95,cz+t2*1.3, 1,0, 0.7,0.07); }
      if(F.wealth>0.55) F.box(0,3.05,pf(3.15)+0.04, 1.9,0.3,0.1, 0, 0xf0e6d0,'paintbw');
      if(v===2) F.box(0,0,cz, W+0.1,0.7,D+0.1,0,PAL.paintBlack[1],'plaster');
      F.lantern(1.55,2.5,pf(2.5)+0.55, 0.8,12,0);
    } });

  /* =================================================================== 3. STACKED-CUBE HOUSE (M'zab) */
  A({ key:'mid_stacked_cubes', name:"Stacked-cube house (M'zab)", family:'mid', districts:['prosper','market','poor'], wealth:[0.30,0.65], w:12, d:11, h:12, variants:3,
    build:function(F){
      var v=F.variant, m=(v===1?-1:1), col=v===0?F.pick(WHITEC):v===1?ADOBEC[4]:BLUELC[2], fam=v===1?'adobe':'plaster', c2=shade(col,-0.05), hornC=shade(col,0.04);
      function horn(x,y,z){ F.fr5(x,y,z, 0.55,1.15,0.55, 0, hornC,fam); }
      /* ground cube */
      var W0=10.4,D0=9.0,H0=3.7,z0=-0.6; F.fr8(0,0,z0, W0,H0,D0, 0, col,fam);
      var w0=W0*0.84, d0=D0*0.84; parapet(F,0,z0,w0,d0,H0-0.02,0.75,0.3,col,fam,'f'+(m>0?'r':'l')); F.box(0,H0-0.05,z0,w0-0.4,0.1,d0-0.4,0,PAL.lane[2],'adobe');
      function zf0(y){ return z0+D0/2*(1-0.16*y/H0); }
      pdoor(F,m*2.6,zf0(1.4)+0.02,0, shade(col,0.08),fam==='adobe'?'adobe':'relief',{leaf:PLANKC[v]});
      F.window(-m*1.0,2.2,zf0(2.2)+0.03, 0,1, 0.5,0.6); F.window(-m*3.4,2.2,zf0(2.2)+0.03, 0,1, 0.5,0.6);
      for(var r=0;r<2;r++) for(var c=0;c<=r;c++) F.pyr(m*2.6+(c-r/2)*0.6, 3.25-r*0.4, zf0(3.1)-0.1, 0.36,0.32,0.3, 0, VOIDC[0],'dark');
      horn(m*(w0/2-0.3),H0+0.7,z0+d0/2-0.3); horn(-m*(w0/2-0.3),H0+0.7,z0+d0/2-0.3);
      /* second cube, back corner, with an arcaded loggia facing the terrace */
      var W1=v===2?7.6:6.6, D1=5.6, H1=3.3, x1=-m*(w0/2-W1/2-0.05), z1=z0-d0/2+D1/2+0.05, y1=H0;
      F.box(x1,y1,z1-0.8, W1,H1,D1-1.6, 0, c2,fam);                                  /* rooms behind the loggia */
      F.box(x1,y1+H1-0.35,z1, W1,0.35,D1, 0, col,fam);                               /* roof slab over all */
      F.box(x1,y1,z1+D1/2-1.55, W1-0.3,H1-0.3,0.06, 0, shade(col,-0.35),fam);         /* shaded back wall of the loggia */
      var nb=v===2?4:3; F.arcade(fam, x1,y1,z1+D1/2-0.2, 0, nb, W1/nb, H1-0.35, 0.4, col, { pier:0.55, head:0.55, seg:6, noTop:true });
      F.box(x1-W1/2+0.2,y1,z1+D1/2-0.95, 0.4,H1-0.35,1.5,0,col,fam); F.box(x1+W1/2-0.2,y1,z1+D1/2-0.95, 0.4,H1-0.35,1.5,0,col,fam);
      F.box(x1-m*1.0,y1,z1+D1/2-1.5, 0.9,1.95,0.08, 0, VOIDC[1],'dark');
      var y2=y1+H1; parapet(F,x1,z1,W1,D1,y2,0.6,0.28,col,fam,'fb'+(v===0?'lr':m>0?'l':'r'));
      horn(x1-W1/2+0.28,y2+0.55,z1+D1/2-0.28); horn(x1+W1/2-0.28,y2+0.55,z1+D1/2-0.28); horn(x1-m*(W1/2-0.28),y2+0.55,z1-D1/2+0.28);
      F.window(x1-m*(W1/2+0.0)-m*0.03, y1+1.8, z1-0.9, -m,0, 0.5,0.7);
      /* third cube (not on variant 0): a small tower room stepping back again */
      if(v>0){ var W2=3.6, x2=x1-m*(W1/2-W2/2), z2=z1-D1/2+W2/2, H2=v===2?3.6:2.9; F.fr8(x2,y2,z2, W2,H2,W2, 0, col,fam);
        F.window(x2,y2+1.7,z2+W2/2*(1-0.16*1.7/H2)+0.03, 0,1, 0.5,0.8); F.box(x2+m*(W2/2-0.12),y2,z2, 0.08,1.9,0.85, 0, VOIDC[1],'dark');
        [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(function(q){ horn(x2+q[0]*(W2*0.42-0.27),y2+H2-0.05,z2+q[1]*(W2*0.42-0.27)); }); }
      else { F.edome(x1-m*1.2,y2,z1-0.6, 1.5,1.0,1.5, 0, col,fam); }
      /* life on the terrace */
      ladder(F, m*(w0/2-1.2),H0+0.05,z0+0.8, m*(w0/2-1.2)-m*0.0,y2+0.5,z1+D1/2+0.05);
      pot(F,m*3.6,H0,z0+d0/2-1.1,0.35,0.75,TILEC[0]); pot(F,m*2.8,H0,z0+d0/2-1.0,0.25,0.5,TILEC[2]);
      if(F.wealth>0.5) F.box(x1,y1+H1-0.33,z1+D1/2+0.02, W1-0.2,0.28,0.06, 0, shade(col,0.1),'relief');
      F.lantern(m*2.6-m*1.5,2.5,zf0(2.5)+0.28, 0.8,12,0);
    } });

  /* =================================================================== 4. ROUND-TOWER HOUSE */
  A({ key:'mid_round_tower_house', name:'Round-tower house', family:'mid', districts:['prosper','market'], wealth:[0.35,0.75], w:13, d:10, h:12, variants:3,
    build:function(F){
      var v=F.variant, m=(v===1?-1:1), col=v===0?F.pick(BLUELC):v===1?F.pick(WHITEC):F.pick(ADOBEC), fam=v===2?'adobe':'plaster';
      var R=3.7, tx=-m*2.6, tz=-0.5, H=v===2?7.6:6.8, dome=(v!==1);
      function rr0(y){ return R*(1-0.10*y/H); }
      var prof=[[R+0.12,0,shade(col,-0.18)],[R+0.02,0.8,shade(col,-0.10)],[rr0(3),3],[rr0(H),H]];
      if(dome){ prof.push([rr0(H)*0.96,H+0.5]); for(var i=1;i<=5;i++){ var t=i/5; prof.push([Math.max(0.05,rr0(H)*0.93*Math.sqrt(1-t*t*0.999)), H+0.5+t*(v===2?2.4:1.9)]); } }
      else prof.push([rr0(H)*0.98,H+0.95]);
      F.lathe(fam, tx,tz, prof, col, { seg:16, cap:!dome, capCol:PAL.lane[1] });
      if(dome) F.cone(tx,H+0.5+(v===2?2.3:1.8),tz, 0.2,0.9,0, shade(col,0.06),fam);
      else { for(i=0;i<8;i++){ var a=i/8*TAU+0.3; F.fr5(tx+Math.cos(a)*(rr0(H)-0.3),H+0.9,tz+Math.sin(a)*(rr0(H)-0.3), 0.5,0.7,0.5,-a,col,fam); } }
      /* the band under the parapet: relief, or painted where there is money */
      var bandFam=F.wealth>0.55?'paintbw':'relief', bc=F.wealth>0.55?0xf0e6d0:shade(col,0.10), by=H-1.15;
      F.lathe(bandFam, tx,tz, [[rr0(by)+0.07,by],[rr0(by+0.95)+0.07,by+0.95],[rr0(by+0.95)-0.05,by+1.0]], bc, { seg:16 });
      /* door in the drum + windows round it */
      pdoor(F,tx,tz+rr0(1.4)+0.02,0, shade(col,0.10),'relief',{T:0.34,leaf:PLANKC[(v+2)%4]});
      [[0.55,5.0],[-0.6,5.0],[m*0.85,2.0],[m*1.9,5.0],[m*2.9,2.2]].forEach(function(q){ var a=PI/2+q[0], y=q[1], r=rr0(y);
        F.window(tx+Math.cos(a)*(r-0.02),y,tz+Math.sin(a)*(r-0.02), Math.cos(a),Math.sin(a), 0.65,0.95, {noReveal:true}); });
      for(i=0;i<5;i++){ a=PI/2+(i-2)*0.30; F.toron(tx+Math.cos(a)*rr0(3.5),3.55,tz+Math.sin(a)*rr0(3.5), Math.cos(a),Math.sin(a), 0.6,0.07); }
      /* the lower wing */
      var Ww=6.6, Dw=6.4, Hw=v===2?3.9:3.5, wx=m*(6.2-Ww/2), wz=-0.9;
      var B=rbody(F,{ x:wx,z:wz,W:Ww,D:Dw,H:Hw,par:0.8,rc:0.9,k:0.95,col:shade(col,v===0?0.10:0),fam:fam,base:0.8 });
      F.window(wx+m*0.6,2.0,B.zf(2.0)+0.03, 0,1, 0.7,0.85); F.window(wx+m*(Ww/2-0.02)*0.975,2.0,wz, m,0, 0.7,0.85);
      F.roundWindow(tx+Math.cos(PI/2)*rr0(H-2.6),H-2.6,tz+Math.sin(PI/2)*rr0(H-2.6), 0,1, 0.5, shade(col,0.12), 6);
      /* terrace door from the drum onto the wing roof, awning, pots */
      var da2=m>0?0.18:PI-0.18; F.box(tx+Math.cos(da2)*(rr0(Hw+1)-0.12),Hw,tz+Math.sin(da2)*(rr0(Hw+1)-0.12), 0.95,1.95,0.4, -da2+PI/2, VOIDC[1],'dark');
      awning(F, wx-1.6,wx+1.6, wz-Dw*0.45+0.4,Hw+2.3, wz+0.6,Hw+2.0, 4, AWNINGC[v], AWNINGC[3], false);
      [[-1.5,-Dw*0.45+0.4],[1.5,-Dw*0.45+0.4],[-1.5,0.6],[1.5,0.6]].forEach(function(q){ F.rod(wx+q[0],Hw,wz+q[1],wx+q[0],Hw+(q[1]>0?2.0:2.3),wz+q[1],0.045,TIMBERC[1]); });
      pot(F,wx+m*2.2,Hw,wz+2.0,0.33,0.7,TILEC[1]);
      F.lantern(tx+1.5,2.6,tz+rr0(2.6)+0.1, 0.8,12,0);
    } });

  /* =================================================================== 5. COURTYARD HOUSE */
  A({ key:'mid_courtyard_house', name:'Courtyard house with corner tower', family:'mid', districts:['prosper','market'], wealth:[0.40,0.75], w:12, d:12, h:11, variants:2,
    build:function(F){
      var v=F.variant, m=v?-1:1, col=v?F.pick(ADOBEC):F.pick(WHITEC), fam=v?'adobe':'plaster', tcol=v?shade(col,0.06):F.pick(BLUELC);
      var S=11.0, dp=3.5, H=3.9, h=S/2;
      F.box(0,0,h-dp/2, S,H,dp, 0,col,fam); F.box(0,0,-h+dp/2, S,H+ (v?0:0),dp, 0,col,fam);
      F.box(-h+dp/2,0,0, dp,H-0.02,S-2*dp, 0,shade(col,-0.03),fam); F.box(h-dp/2,0,0, dp,H-0.02,S-2*dp, 0,shade(col,-0.03),fam);
      F.box(0,0,0, S+0.12,0.7,S+0.12, 0, v?shade(col,-0.15):PAL.paintBlack[1], fam);        /* base band (also floors the court) */
      F.box(0,0.7,0, S-2*dp,0.04,S-2*dp, 0, PAL.paving[0],'rock');
      parapet(F,0,0,S,S,H,0.8,0.3,col,fam);
      /* inner kerb round the court opening, so the roof reads as a walkable ring */
      parapet(F,0,0,S-2*dp+0.5,S-2*dp+0.5,H,0.35,0.25,shade(col,-0.05),fam);
      [[-1,1],[1,-1],[-1,-1]].forEach(function(q){ F.fr5(q[0]*m*(h-0.1),0,q[1]*(h-0.1),1.2,H+1.0,1.2,0,col,fam); F.cone(q[0]*m*(h-0.1),H+0.95,q[1]*(h-0.1),0.4,1.1,0,col,fam); });
      /* corner tower room */
      var R=2.35, tx=m*(h-R+0.35), tz=h-R+0.35, TH=7.6; function rr0(y){ return R*(1-0.08*y/TH); }
      var prof=[[R+0.1,0,shade(tcol,-0.15)],[R,0.8],[rr0(TH),TH]];
      if(v===0){ for(var i=1;i<=5;i++){ var t=i/5; prof.push([Math.max(0.05,rr0(TH)*Math.sqrt(1-t*t*0.999)),TH+t*2.0]); } } else prof.push([rr0(TH),TH+0.8]);
      F.lathe(fam,tx,tz,prof,tcol,{ seg:14, cap:v===1, capCol:PAL.lane[1] });
      if(v===0) F.cone(tx,TH+1.9,tz,0.18,0.8,0,BRASSC[0],'metal'); else for(i=0;i<6;i++){ var a=i/6*TAU; F.cone(tx+Math.cos(a)*(rr0(TH)-0.3),TH+0.75,tz+Math.sin(a)*(rr0(TH)-0.3),0.28,0.8,0,tcol,fam); }
      var by=TH-1.2; F.lathe(F.wealth>0.6?'paintbw':'relief',tx,tz,[[rr0(by)+0.06,by],[rr0(by+0.8)+0.06,by+0.8],[rr0(by+0.8)-0.04,by+0.85]], F.wealth>0.6?0xf0e6d0:shade(tcol,0.12),{seg:14});
      [PI/2, m>0?0:PI].forEach(function(a){ F.window(tx+Math.cos(a)*rr0(5.4),5.4,tz+Math.sin(a)*rr0(5.4),Math.cos(a),Math.sin(a),0.65,1.0,{noReveal:true}); F.window(tx+Math.cos(a)*rr0(2.2),2.2,tz+Math.sin(a)*rr0(2.2),Math.cos(a),Math.sin(a),0.55,0.75,{noReveal:true}); });
      F.box(tx,H,tz-rr0(H+1)+0.1, 0.9,1.9,0.3, 0, VOIDC[1],'dark');
      /* front door + few windows: a closed house */
      pdoor(F,-m*1.2,h-0.02,0, shade(col,0.10),'relief',{leaf:PLANKC[v+1]});
      F.window(-m*3.9,2.3,h+0.03, 0,1, 0.6,0.7); F.window(-m*(h+0.03),2.3,1.5, -m,0, 0.6,0.7); F.window(-m*(h+0.03),2.3,-2.5, -m,0, 0.6,0.7); F.window(m*(h+0.03),2.3,-2.0, m,0, 0.6,0.7);
      for(i=0;i<4;i++) F.toron(-m*(2.6+i*0.8),H-0.4,h, 0,1, 0.7,0.07);
      /* the court: a tree, a doorway, laundry on the roof */
      F.tree(-m*0.3,-0.2,'olive',5.2,0.7); F.box(0,0.7,-h+dp+0.02, 1.0,2.0,0.06, 0, VOIDC[1],'dark'); F.box(0,0.7,h-dp-0.02, 1.0,2.0,0.06, 0, VOIDC[1],'dark');
      laundry(F,-m*4.6,H+1.7,-4.4, -m*4.6,H+1.7,-0.6, 3); F.rod(-m*4.6,H,-4.4,-m*4.6,H+1.75,-4.4,0.04,TIMBERC[1]); F.rod(-m*4.6,H,-0.6,-m*4.6,H+1.75,-0.6,0.04,TIMBERC[1]);
      F.lantern(-m*1.2+1.5,2.6,h+0.3,0.8,12,0);
    } });

  /* small cheap goods */
  function jar(F,lx,ly,lz,s,col){ F.fr5(lx,ly,lz, s,s*0.55,s, 0.4, col,'adobe'); F.fr8(lx,ly+s*0.55,lz, s*0.5,s*0.5,s*0.5, 0.4, shade(col,-0.1),'adobe'); }
  function crate(F,lx,ly,lz,s,top,rot){ F.box(lx,ly,lz, s,s*0.55,s*0.8, rot||0, PLANKC[2],'plank'); if(top!=null) F.box(lx,ly+s*0.55,lz, s*0.86,0.12,s*0.66, rot||0, top,'leafy'); }
  function sign(F,lx,ly,lz,col){ F.beam(lx,ly,lz-0.1, lx,ly,lz+1.0, 0.09,0.09, TIMBERC[0],'timber'); F.box(lx,ly-0.75,lz+0.6, 0.06,0.6,0.75, 0, PLANKC[0],'plank'); F.box(lx,ly-0.62,lz+0.6, 0.1,0.34,0.4, 0, col,'mosaic'); }

  /* =================================================================== 6. SHOP-HOUSE */
  A({ key:'trade_shop_house', name:'Shop-house', family:'trade', districts:['prosper','market'], wealth:[0.35,0.75], w:9, d:11, h:12, variants:4,
    build:function(F){
      var v=F.variant, m=(v%2?-1:1), st=v===3?3:2, H=st*3.2+0.4, W=8.2, D=6.4, cz=-2.1;
      var col=[WHITEC[1],BLUELC[0],ADOBEC[2],BLUEDC[2]][v], fam=v===2?'adobe':'plaster', lite=v===3?WHITEC[0]:shade(col,0.10);
      var B=rbody(F,{ x:0,z:cz,W:W,D:D,H:H,par:0.9,rc:0.75,k:0.95,col:col,fam:fam,base:0.7 });
      rband(F,B,H-0.5,H+0.1,0.05, F.wealth>0.6?MOSBLUEC[v]:shade(lite,0.03), F.wealth>0.6?'mosaic':'relief');
      var zf=B.zf(1.5), sx=-m*1.35;
      /* the shopfront: a wide parabolic opening, dark within, shelves and a counter */
      F.box(sx,0,zf+0.03, 3.6,2.9,0.06, 0, VOIDC[1],'dark');
      F.archwall(fam==='adobe'?'adobe':'relief', sx,0,zf+0.15, 0, 4.0,3.35,0.3, 3.3,2.8, lite, { noBack:true, seg:8, pointed:2.6 });
      F.box(sx,1.55,zf+0.12, 2.5,0.07,0.22, 0, PLANKC[3],'plank'); F.box(sx,0,zf+0.85, 2.9,0.95,0.6, 0, PLANKC[1],'plank');
      pdoor(F,m*2.55,zf-0.04,0, lite,'relief',{W:1.9,ow:1.25,leaf:PLANKC[v]});
      awning(F, sx-2.2,sx+2.2, zf+0.22,4.05, zf+1.62,3.52, 6, AWNINGC[v], AWNINGC[(v+3)%6]);
      /* upstairs: the dwelling */
      for(var s=1;s<st;s++){ var y=s*3.2+2.0; F.window(-2.2,y,B.zf(y)+0.03,0,1,0.75,1.0); F.window(0.3*m+0.0,y,B.zf(y)+0.03,0,1,0.75,1.0); if(s>1) F.window(2.4,y,B.zf(y)+0.03,0,1,0.75,1.0); }
      F.window(B.xr(5)+0.03,5.2,cz, 1,0, 0.7,1.0); F.window(B.xl(5)-0.03,5.2,cz, -1,0, 0.7,1.0);
      sign(F, m*2.55, 4.35, B.zf(4.35), [MOSWARMC[0],MOSBLUEC[1],MOSGREENC[0],MOSWARMC[2]][v]);
      F.box(m*(W/2*0.95-1.6),H,cz-D/2*0.95+1.6, 2.2,2.2,2.2, 0, shade(col,0.04),fam); F.box(m*(W/2*0.95-1.6),H,cz-D/2*0.95+2.72, 0.9,1.85,0.06,0,VOIDC[1],'dark');
      laundry(F, -m*3.2,H+1.8,cz-2.0, -m*3.2,H+1.8,cz+2.0, 3); F.rod(-m*3.2,H,cz-2.0,-m*3.2,H+1.85,cz-2.0,0.04,TIMBERC[1]); F.rod(-m*3.2,H,cz+2.0,-m*3.2,H+1.85,cz+2.0,0.04,TIMBERC[1]);
      F.lantern(sx+m*2.2+m*0.0,2.75,zf+0.45,0.9,13,0);
      /* the goods */
      var cy=0.95, gz=zf+0.85, i;
      if(v===0){ for(i=0;i<4;i++) jar(F,sx-1.1+i*0.72,cy,gz,0.42,TILEC[i%4]); for(i=0;i<4;i++) jar(F,sx-0.9+i*0.6,1.62,zf+0.12,0.3,TILEC[(i+1)%4]);
        pot(F,sx-2.0,0,zf+2.2,0.5,1.05,TILEC[0]); pot(F,sx+2.0,0,zf+2.6,0.42,0.9,TILEC[2]); pot(F,sx+1.5,0,zf+1.9,0.32,0.65,ADOBEREDC[0]); jar(F,sx-1.4,0,zf+2.7,0.5,TILEC[3]); }
      if(v===1){ for(i=0;i<5;i++) F.box(sx-1.1+i*0.55,cy,gz, 0.45,0.22+0.1*(i%2),0.55, 0.1*i, CLOTHC[i%7],'plaster'); for(i=0;i<3;i++) F.box(sx-0.8+i*0.8,cy+0.3,gz, 0.4,0.2,0.5, 0.2, CLOTHC[(i+3)%7],'plaster');
        for(i=0;i<4;i++) F.box(sx-1.7+i*1.15,1.15,zf+1.54, 0.8,1.25,0.03, 0, CLOTHC[(i*2+1)%7],'cloth'); F.box(sx+1.9,0,zf+1.9, 0.6,0.5,1.2, 0.3, CLOTHC[5],'plaster'); }
      if(v===2){ for(i=0;i<4;i++) crate(F,sx-1.1+i*0.75,cy,gz,0.68,[PAL.crop[0],PAL.flowerBed[1],PAL.flowerBed[0],PAL.crop[3]][i]);
        crate(F,sx-1.9,0,zf+2.3,0.9,PAL.crop[2],0.3); crate(F,sx-0.8,0,zf+2.6,0.9,PAL.flowerBed[1],-0.2); crate(F,sx+1.7,0,zf+2.4,0.9,PAL.paintRed[2],0.15);
        F.fr5(sx+0.6,0,zf+2.5, 0.6,0.75,0.5, 0.5, PAL.whitewash[3],'adobe'); F.fr5(sx+1.0,0,zf+1.9, 0.6,0.7,0.5, 1.1, PAL.thatch[0],'adobe'); }
      if(v===3){ F.box(sx-1.0,cy,gz, 0.7,0.5,0.08, 0.3, METALC[0],'metal'); F.cyl(sx+0.1,cy,gz,0.22,0.12,0,RUSTC[1],'rust'); F.pyr(sx+0.8,cy,gz,0.3,0.5,0.3,0.6,GLASSC[1],'glass'); F.box(sx-0.2,cy,gz+0.1,0.3,0.2,0.2,0.8,BRASSC[1],'metal');
        F.box(sx-2.0,0,zf+2.0, 1.4,2.1,0.09, [-0.25,0.35,0], METALC[1],'metal'); F.cyl(sx+1.9,0.75,zf+2.3, 0.75,0.16, [PI/2-0.25,0.5,0], RUSTC[0],'rust'); F.cyl(sx+1.9,0.75,zf+2.3, 0.28,0.2, [PI/2-0.25,0.5,0], TARNC[1],'metal');
        F.box(sx+0.9,0,zf+2.6, 0.9,0.5,0.6, 0.4, RUSTC[2],'rust'); F.pyr(sx+0.9,0.5,zf+2.6,0.35,0.6,0.35,0.2,GLASSC[0],'glass'); }
    } });

  /* =================================================================== 7. TAVERN */
  A({ key:'trade_tavern', name:'Tavern with shaded yard', family:'trade', districts:['prosper','market'], wealth:[0.35,0.75], w:14, d:12, h:13, variants:2,
    build:function(F){
      var v=F.variant, m=v?-1:1, H=v?10.0:6.9, col=v?BLUEDC[1]:WHITEC[0], fam='plaster', lite=v?BLUELC[2]:shade(col,0.04), W=8.4, D=6.4, bx=-m*2.5, cz=-2.5;
      var B=rbody(F,{ x:bx,z:cz,W:W,D:D,H:H,par:0.9,rc:0.9,k:0.95,col:col,fam:fam,base:0.8,baseCol:v?BLUEDC[3]:PAL.paintBlack[1] });
      rband(F,B,H-0.55,H+0.1,0.05, F.wealth>0.55?MOSWARMC[0]:shade(lite,0.04), F.wealth>0.55?'mosaic':'relief');
      /* arcaded porch carrying a terrace */
      var pz=3.4, zf=B.zf(1.6), PH=3.5;
      F.arcade(fam, bx,0,pz, 0, 3, 2.7, PH, 0.45, lite, { pier:0.6, head:0.6, seg:7 });
      [-1,1].forEach(function(s){ F.archwall(fam, bx+s*(4.05-0.22),0,(pz+zf)/2+0.1, s*PI/2, pz-zf+0.25,PH,0.45, 1.7,2.75, lite, { seg:7 }); });
      F.box(bx,PH,(pz+zf)/2+0.1, 8.1,0.3,pz-zf+0.7, 0, lite,fam);
      F.box(bx,PH+0.3,pz+0.1, 8.1,0.75,0.25, 0, lite,fam); [-1,1].forEach(function(s){ F.box(bx+s*3.93,PH+0.3,(pz+zf)/2+0.1, 0.25,0.75,pz-zf+0.2, 0, lite,fam); });
      pdoor(F,bx,zf-0.04,0, lite,'relief',{leaf:PLANKC[0],ow:1.6,W:2.5});
      F.window(bx-2.7,1.9,B.zf(1.9)+0.03,0,1,0.8,0.9); F.window(bx+2.7,1.9,B.zf(1.9)+0.03,0,1,0.8,0.9);
      for(var s=1;s<(v?3:2);s++){ var y=s*3.2+2.2; F.window(bx-2.6,y,B.zf(y)+0.03,0,1,0.8,1.1); F.window(bx+2.6,y,B.zf(y)+0.03,0,1,0.8,1.1); if(s>1) F.window(bx,y,B.zf(y)+0.03,0,1,0.8,1.1); }
      F.box(bx,PH+0.3,B.zf(4.5)+0.02, 1.0,2.0,0.08, 0, VOIDC[1],'dark');                        /* door onto the porch terrace */
      F.window(bx-m*(W/2*0.97+0.03),5.3,cz, -m,0, 0.8,1.1);
      /* benches + table under the porch, stools on the terrace */
      F.box(bx-2.7,0,zf+1.0, 1.9,0.45,0.5, 0, PLANKC[2],'plank'); F.box(bx+2.7,0,zf+1.0, 1.9,0.45,0.5, 0, PLANKC[2],'plank');
      /* the walled yard with its shade tree */
      var yx=m*4.45, yw=4.5, z0=-5.7, z1=5.6, wh=2.1, wc=shade(col,v?0.0:-0.03);
      F.box(yx+m*(yw/2-0.18),0,(z0+z1)/2, 0.36,wh,z1-z0, 0, wc,fam); F.box(yx,0,z0+0.18, yw,wh,0.36, 0, wc,fam);
      F.archwall(fam, yx,0,z1-0.2, 0, yw,3.0,0.4, 1.9,2.45, wc, { seg:8, pointed:2.6 });
      F.cone(yx-yw/2+0.25,3.0,z1-0.2,0.3,0.8,0,wc,fam); F.cone(yx+yw/2-0.25,3.0,z1-0.2,0.3,0.8,0,wc,fam);
      F.tree(yx+m*0.2,1.2,'olive',6.2);
      F.box(yx,0,2.9, 1.6,0.75,0.8, 0.2, PLANKC[1],'plank'); F.box(yx-0.1,0,3.85, 1.5,0.42,0.35, 0.2, PLANKC[3],'plank'); F.box(yx+0.1,0,1.95, 1.5,0.42,0.35, 0.2, PLANKC[3],'plank');
      jar(F,yx+m*1.5,0,4.6,0.6,TILEC[1]);
      /* kitchen lean-to at the back of the yard with a smoking chimney */
      F.box(yx-m*0.3,0,-4.0, 3.6,2.9,3.0, 0, shade(col,-0.04),fam); F.box(yx-m*0.3,0,-2.48, 1.0,1.95,0.06, 0, VOIDC[1],'dark');
      F.fr8(yx+m*0.8,2.9,-4.4, 1.1,3.4,1.1, 0, shade(col,-0.08),fam); F.box(yx+m*0.8,6.25,-4.4, 0.7,0.12,0.7, 0, PAL.paintBlack[0],'dark');
      F.fr5(yx+m*0.8,5.2,-4.4, 1.0,1.2,1.0, 0, PAL.paintBlack[1],'plaster');
      F.lamp(yx-m*0.3,1.3,-2.2, 0.9,9);
      /* sign + lanterns */
      sign(F, bx-m*3.2, 3.0, pz+0.2, MOSWARMC[v?3:1]);
      F.lantern(bx-1.35,2.75,pz+0.42,0.9,13,0); F.lantern(bx+1.35,2.75,pz+0.42,0.9,13,0); F.lantern(yx-m*1.6,2.6,z1+0.2,0.8,12,0); F.lantern(bx,3.0,zf+1.2,0.8,10,0.3);
      F.lantern(yx+m*0.2,2.9,2.4,0.7,10,0);  F.rod(yx+m*0.2,3.2,2.4, yx+m*0.2,4.0,1.4, 0.02, TIMBERC[3]);
      /* roof */
      var rx=bx+m*(W/2*0.95-1.7), rz=cz-D/2*0.95+1.7; F.box(rx,H,rz, 2.3,2.2,2.3, 0, lite,fam); F.box(rx,H,rz+1.17, 0.9,1.85,0.06, 0, VOIDC[1],'dark');
      if(v) F.edome(rx,H+2.2,rz, 1.25,1.0,1.25, 0, lite,fam);
      awning(F, bx-m*2.0-1.3,bx-m*2.0+1.3, cz-1.5,H+2.3, cz+1.6,H+2.0, 3, AWNINGC[1],AWNINGC[3], false);
      [[-1.3,-1.5,2.3],[1.3,-1.5,2.3],[-1.3,1.6,2.0],[1.3,1.6,2.0]].forEach(function(q){ F.rod(bx-m*2.0+q[0]*0.97,H,cz+q[1], bx-m*2.0+q[0]*0.97,H+q[2],cz+q[1], 0.045,TIMBERC[1]); });
    } });

  /* =================================================================== 8a. POTTER'S YARD */
  function yardWall(F,W,D,h,col,fam,gap,gx){ var t=0.35; F.box(0,0,-D/2+t/2, W,h,t, 0,col,fam); F.box(-W/2+t/2,0,0, t,h,D-2*t, 0,col,fam); F.box(W/2-t/2,0,0, t,h,D-2*t, 0,col,fam);
    var xl=gx-gap/2, xr=gx+gap/2; if(xl>-W/2+0.5) F.box((-W/2+xl)/2,0,D/2-t/2, xl+W/2,h,t, 0,col,fam); if(xr<W/2-0.5) F.box((W/2+xr)/2,0,D/2-t/2, W/2-xr,h,t, 0,col,fam);
    F.fr5(xl-0.05,0,D/2-t/2, 0.6,h+0.6,0.6,0,col,fam); F.fr5(xr+0.05,0,D/2-t/2, 0.6,h+0.6,0.6,0,col,fam); }
  function kiln(F,lx,lz,R,h,face){ var c=ADOBEREDC[1];
    F.lathe('adobe', lx,lz, [[R*1.06,0,shade(c,-0.1)],[R,h*0.2],[R*0.93,h*0.45],[R*0.74,h*0.72],[R*0.42,h*0.92,shade(c,-0.3)],[R*0.18,h,PAL.paintBlack[1]]], c, { seg:12, cap:true, capCol:VOIDC[0] });
    var nx=Math.sin(face), nz=Math.cos(face); parch(F, lx+nx*(R*0.97),0,lz+nz*(R*0.97), face, 0.8,1.0, shade(c,-0.12),'adobe');
    F.box(lx+nx*(R*0.97+0.07),0,lz+nz*(R*0.97+0.07), 0.6,0.3,0.05, face, PAL.glowWarm,'glowmat'); F.lamp(lx+nx*(R+0.6),0.6,lz+nz*(R+0.6), 1.0,9); }
  function rack(F,lx,lz,len,rot,cols){ var c=Math.cos(rot||0), s=Math.sin(rot||0); function P(u){ return [lx+u*c, lz-u*s]; }
    [-1,1].forEach(function(e){ var q=P(e*len/2); F.box(q[0],0,q[1], 0.1,1.9,0.5, rot||0, TIMBERC[1],'timber'); });
    for(var k=0;k<3;k++){ F.box(lx,0.45+k*0.62,lz, len,0.06,0.5, rot||0, PLANKC[k],'plank'); for(var i=0;i<3;i++){ var q=P((i-1)*len/3.3); F.fr5(q[0],0.51+k*0.62,q[1],0.3,0.36,0.3,0.4,cols[(i+k)%cols.length],'adobe'); } } }
  A({ key:'trade_potter_yard', name:"Potter's yard with beehive kiln", family:'trade', districts:['prosper','market','poor'], wealth:[0.25,0.6], w:14, d:12, h:6, variants:2,
    build:function(F){
      var v=F.variant, m=v?-1:1, col=v?WHITEC[1]:ADOBEC[0], fam=v?'plaster':'adobe';
      yardWall(F,13.4,11.4,1.05,shade(col,-0.04),fam,5.2,m*1.6);
      var B=rbody(F,{ x:-m*3.6,z:-2.9,W:5.6,D:5.0,H:3.4,par:0.7,rc:0.9,k:0.95,col:col,fam:fam,base:0.6 });
      pdoor(F,-m*3.6,B.zf(1.4)+0.02,0, shade(col,0.08),v?'relief':'adobe',{W:2.0,ow:1.3});
      F.window(-m*3.6+m*(2.8*0.97+0.03),2.0,-2.9, m,0, 0.7,0.8);
      kiln(F, m*3.4,-2.6, 2.2,4.0, 0); if(v) kiln(F, m*0.2,-3.9, 1.3,2.5, 0);
      /* fuel stack beside the kiln, clay heap, wheel under a shade */
      for(var i=0;i<3;i++) F.rod(m*5.9,0.15+i*0.26,-1.0, m*5.9,0.15+i*0.26,1.2, 0.13, PAL.trunk[i],'bark');
      F.edome(-m*5.4,0,1.2, 0.9,0.6,0.8, 0, PAL.adobeDark[0],'adobe');
      var sx=-m*3.2, sz=2.6; [[-1.2,-1.1],[1.2,-1.1],[-1.2,1.1],[1.2,1.1]].forEach(function(q){ F.rod(sx+q[0],0,sz+q[1],sx+q[0],2.3,sz+q[1],0.05,TIMBERC[1]); });
      F.box(sx,2.3,sz, 2.9,0.18,2.7, 0, THATCHC[1],'thatch'); F.cyl(sx,0,sz,0.12,0.6,0,TIMBERC[0],'timber'); F.cyl(sx,0.6,sz,0.42,0.08,0,PAL.adobeDark[1],'adobe'); jar(F,sx,0.68,sz,0.3,PAL.adobeDark[2]);
      F.box(sx+0.2,0,sz+0.75, 0.4,0.4,0.4, 0.3, PLANKC[3],'plank');
      /* racks of pots drying, big jars by the gate */
      rack(F, m*2.2,2.2, 3.0, 0, TILEC); if(!v) rack(F, m*5.2,3.2, 2.6, PI/2, [TILEC[1],ADOBEREDC[0],PAL.adobeDark[0]]);
      pot(F,m*3.0,0,4.4,0.5,1.05,TILEC[0]); pot(F,m*3.9,0,4.6,0.4,0.85,TILEC[3]); pot(F,-m*0.6,0,4.6,0.45,0.95,ADOBEREDC[2]);
      for(i=0;i<3;i++) jar(F, m*(0.3+i*0.6),0,0.3+ (i%2)*0.5, 0.38, TILEC[i%4]);
      F.lantern(-m*3.6+1.4,2.4,B.zf(2.4)+0.3,0.7,11,0);
    } });

  /* =================================================================== 8b. SMITHY */
  A({ key:'trade_smithy', name:'Smithy (open forge)', family:'trade', districts:['prosper','market','poor'], wealth:[0.25,0.6], w:12, d:12, h:8, variants:2,
    build:function(F){
      var v=F.variant, m=v?-1:1, col=v?WHITEC[3]:ADOBEC[1], fam=v?'plaster':'adobe', dk=PAL.adobeDark[1];
      var B=rbody(F,{ x:0,z:-3.5,W:11.0,D:4.2,H:3.7,par:0.7,rc:0.8,k:0.96,col:col,fam:fam,base:0.7 });
      F.box(m*3.0,0,B.zf(1)+0.02, 1.1,2.0,0.06, 0, VOIDC[1],'dark'); F.window(-m*3.2,2.0,B.zf(2)+0.03,0,1,0.7,0.8);
      /* the heavy roof of the forge porch on fat piers, beam ends showing */
      var zr0=-1.5, zr1=4.9, RY=3.2;
      F.box(0,RY,(zr0+zr1)/2, 11.0,0.75,zr1-zr0, 0, shade(col,-0.05),fam); parapet(F,0,(zr0+zr1)/2,11.0,zr1-zr0,RY+0.75,0.4,0.3,shade(col,-0.02),fam,'flr');
      [-1,1].forEach(function(s){ F.fr8(s*4.85,0,4.3, 1.3,RY,1.3, 0, col,fam); F.fr8(s*4.85,0,1.2, 1.1,RY,1.1, 0, col,fam); F.box(s*5.1,0,2.75, 0.4,1.2,2.2, 0, col,fam); });
      F.box(0,RY-0.35,4.55, 9.0,0.35,0.4, 0, TIMBERC[0],'timber');
      for(var i=0;i<9;i++) F.toron(-4.8+i*1.2,RY+0.3,zr1, 0,1, 0.5,0.1);
      /* hearth, hood and chimney; the glow */
      var hx=-m*2.6, hz=-0.6; F.box(hx,0,hz, 2.2,0.95,1.5, 0, dk,'adobe'); F.box(hx,0.95,hz+0.1, 1.3,0.08,0.8, 0, PAL.glowWarm,'glowmat');
      F.fr5(hx,1.9,hz-0.2, 2.4,1.4,1.6, 0, PAL.paintBlack[1],'plaster'); F.fr8(hx,3.2,hz-0.3, 1.25,4.0,1.25, 0, shade(col,-0.12),fam); F.box(hx,7.15,hz-0.3, 0.8,0.1,0.8,0,VOIDC[0],'dark');
      F.box(hx-1.0,0.95,hz-0.55, 0.2,1.0,0.2,0,dk,'adobe'); F.box(hx+1.0,0.95,hz-0.55, 0.2,1.0,0.2,0,dk,'adobe');
      F.lamp(hx,1.5,hz+0.6, 1.4,12);
      F.box(hx+m*1.9,0.2,hz+0.2, 0.9,0.7,0.5, [0,0,0.0], TIMBERC[2],'timber'); F.cone(hx+m*2.4,0.35,hz+0.2,0.2,0.5,[0,0,-m*PI/2],PLANKC[3],'plank');      /* bellows */
      /* anvil, quench trough, tool rack, work */
      var ax=m*0.3, az=1.6; F.cyl(ax,0,az,0.36,0.6,0,PAL.trunk[0],'bark'); F.box(ax,0.6,az, 0.75,0.22,0.3, 0.2, TARNC[3],'metal'); F.fr5(ax+0.42,0.62,az-0.09, 0.4,0.16,0.2, [0,0.2,-PI/2], TARNC[3],'metal');
      F.box(m*2.6,0,2.2, 1.6,0.6,0.7, 0, ROCKC[1],'rock'); F.box(m*2.6,0.6,2.2, 1.35,0.02,0.5, 0, GLASSC[2],'glass');
      for(i=0;i<5;i++) F.rod(m*(1.4+i*0.35),1.0,-1.32, m*(1.4+i*0.35),2.3,-1.32, 0.03, i%2?TARNC[1]:TIMBERC[0], i%2?'metal':'timber'); F.box(m*2.1,2.3,-1.34, 2.0,0.08,0.1, 0, TIMBERC[1],'timber');
      /* salvage from the Ancients waiting to be reworked */
      var px=m*3.9, pz=3.0;
      if(v){ F.cyl(px,0.85,pz, 0.85,0.18, [PI/2-0.3,0.4,0], RUSTC[0],'rust'); F.cyl(px,0.85,pz, 0.3,0.24, [PI/2-0.3,0.4,0], RUSTC[4],'rust'); }
      else { F.box(px,0,pz, 1.3,0.12,0.9, 0.3, METALC[3],'metal'); F.box(px+0.1,0.12,pz, 1.1,0.1,0.8, -0.2, RUSTC[1],'rust'); F.box(px,0.22,pz-0.1, 0.9,0.1,0.9, 0.7, TARNC[0],'metal'); }
      F.beam(px-m*0.9,0,pz+0.9, px-m*0.9,1.9,pz+0.4, 0.12,0.12, RUSTC[2],'rust'); F.beam(px-m*1.2,0,pz+0.9, px-m*1.1,1.6,pz+0.45, 0.1,0.1, RUSTC[3],'rust');
      sign(F, -m*4.85, 3.0, 4.9, TARNC[0]); F.lantern(0,2.6,4.95,0.8,12,0);
    } });

  /* =================================================================== 8c. DYER'S YARD */
  function vat(F,lx,lz,r,dye){ F.lathe('plaster', lx,lz, [[r,0,WHITEC[3]],[r+0.05,0.78,shade(dye,0.35)],[r-0.16,0.84,shade(dye,0.2)]], WHITEC[1], { seg:10 });
    F.lathe('plaster', lx,lz, [[r+0.02,0.58],[r+0.02,0.62]], dye, { seg:10, cap:true }); }
  A({ key:'trade_dyer_yard', name:"Dyer's yard with vats", family:'trade', districts:['prosper','market','poor'], wealth:[0.25,0.6], w:16, d:12, h:6, variants:2,
    build:function(F){
      var v=F.variant, m=v?-1:1, col=v?BLUELC[1]:WHITEC[1], fam='plaster';
      var DY=[MOSBLUEC[0],PAL.paintRed[0],PAL.paintYellow[0],BLUEDC[3],MOSWARMC[1],MOSGREENC[0],PAL.cloth[5]];
      yardWall(F,15.4,11.4,1.05,shade(col,-0.03),fam,5.6,m*2.2);
      var B=rbody(F,{ x:-m*4.4,z:-3.2,W:6.2,D:4.6,H:3.5,par:0.7,rc:0.9,k:0.95,col:col,fam:fam,base:0.6,baseCol:BLUEDC[1] });
      pdoor(F,-m*4.4,B.zf(1.4)+0.02,0, shade(col,0.06),'relief',{W:2.0,ow:1.3}); F.window(-m*4.4+m*(3.1*0.97+0.03),2.1,-3.2, m,0, 0.7,0.8);
      /* vats: two rows, each its own colour; splashes of the same on the rims */
      /* THE VATS STAND IN THE FRONT HALF, in the mouth of the gate, so the yard reads from the street */
      var k=0; for(var r=0;r<2;r++) for(var c=0;c<(v?4:3);c++){ var R=v?0.95:1.15; vat(F, m*(0.4+c*(v?2.15:2.65)+ (r?0.6:0)), 4.0-r*2.7, R, DY[(k++ + v*2)%7]); }
      F.box(m*3.6,0,-0.4, 6.5,0.5,0.7, 0, ROCKC[2],'rock'); F.box(m*3.6,0.5,-0.4, 6.2,0.02,0.45, 0, GLASSC[2],'glass');                 /* rinse trough */
      /* cloth drying on tall lines, BEHIND the vats */
      var cols=[DY[0],DY[1],DY[2],DY[5],DY[3]];
      for(var L=0;L<3;L++){ var z=-1.9-L*1.5, x0=m*(-0.6), x1=m*6.6; F.rod(x0,0,z,x0,3.4,z,0.06,TIMBERC[1]); F.rod(x1,0,z,x1,3.4,z,0.06,TIMBERC[1]);
        laundry(F, x0,3.35,z, x1,3.35,z, 4, 1.7,2.5, [cols[L],cols[(L+1)%5],cols[(L+3)%5]]); }
      laundry(F, -m*6.9,3.4,-1.0, -m*2.6,3.4,-4.8, 3, 1.6,2.3, cols); F.rod(-m*6.9,0,-1.0,-m*6.9,3.45,-1.0,0.06,TIMBERC[1]); F.rod(-m*2.6,0,-4.8,-m*2.6,3.45,-4.8,0.06,TIMBERC[1]);
      /* bundles, dye jars */
      pot(F,-m*1.2,0,1.5,0.45,0.9,TILEC[1]); pot(F,-m*2.0,0,1.9,0.35,0.7,DY[0]); jar(F,-m*0.6,0,2.4,0.5,DY[1]);
      for(var i=0;i<3;i++) bale(F,-m*6.4,i*0.32,0.6, 0.9,0.32,1.4, 0.1*i, DY[(i*2)%7]);
      F.lantern(-m*4.4+1.4,2.4,B.zf(2.4)+0.3,0.7,11,0);
    } });

  /* =================================================================== 8d. WEAVER'S / CARPENTER'S SHED */
  A({ key:'trade_craft_shed', name:"Weaver's and carpenter's shed", family:'trade', districts:['prosper','market','poor'], wealth:[0.25,0.6], w:13, d:11, h:6, variants:2,
    build:function(F){
      var v=F.variant, col=v?ADOBEC[3]:WHITEC[0], fam=v?'adobe':'plaster', W=12.2, zb=-5.2, zf=0.9, yb=4.9, yf=3.55, t=0.4;
      F.box(0,0,zb+t/2, W,yb-0.1,t, 0, col,fam);
      [-1,1].forEach(function(s){ var xo=s*W/2, xi=s*(W/2-t);
        F.quad(fam,[xo,0,zb],[xo,0,zf],[xo,yf+0.5,zf],[xo,yb+0.5,zb], col, [s,0,0]); F.quad(fam,[xi,0,zb],[xi,0,zf],[xi,yf+0.5,zf],[xi,yb+0.5,zb], shade(col,-0.1), [-s,0,0]);
        F.quad(fam,[xo,yf+0.5,zf],[xi,yf+0.5,zf],[xi,yb+0.5,zb],[xo,yb+0.5,zb], shade(col,0.05), [0,1,0.2]); F.quad(fam,[xo,0,zf],[xi,0,zf],[xi,yf+0.5,zf],[xo,yf+0.5,zf], col, [0,0,1]); });
      F.arcade(fam, 0,0,zf-0.2, 0, 3, (W-2*t)/3, yf-0.15, 0.4, col, { pier:0.7, head:0.55, seg:7 });
      /* mono-pitch tile roof between the raised gable walls */
      var sl=Math.atan2(yb-yf, zf-zb); F.box(0,(yb+yf)/2-0.2,(zb+zf)/2, W-2*t+0.1,0.22,Math.hypot(yb-yf,zf-zb)+0.5, [sl,0,0], TILEC[v],'tile');
      for(var i=0;i<4;i++) F.beam(-4.2+i*2.8,yb-0.45,zb+0.3, -4.2+i*2.8,yf-0.42,zf+0.35, 0.16,0.2, TIMBERC[i%4],'timber');
      F.box(0,0,(zb+zf)/2, W-2*t,0.05,zf-zb-t, 0, PAL.lane[0],'adobe'); F.box(0,0.05,zb+t+0.04, W-2*t,3.3,0.05, 0, shade(col,-0.4),fam);
      if(!v){ /* WEAVER: an upright loom in the middle bay, a ground loom in the yard, hanks of dyed yarn under the eave, bolts */
        F.box(-0.9,0,-0.6, 0.14,2.6,0.14,0,TIMBERC[0],'timber'); F.box(0.9,0,-0.6, 0.14,2.6,0.14,0,TIMBERC[0],'timber'); F.box(0,2.5,-0.6, 2.2,0.14,0.14,0,TIMBERC[1],'timber'); F.box(0,0.5,-0.6, 2.2,0.14,0.14,0,TIMBERC[1],'timber');
        F.box(0,0.6,-0.62, 1.6,1.9,0.03,0,PAL.whitewash[1],'cloth'); F.box(0,0.6,-0.58, 1.6,0.8,0.03,0,CLOTHC[1],'cloth');
        var gx=3.2, gz=3.0; [[-0.6,-1.6],[0.6,-1.6],[-0.6,1.6],[0.6,1.6]].forEach(function(q){ F.box(gx+q[0],0,gz+q[1],0.1,0.35,0.1,0,TIMBERC[2],'timber'); });
        F.box(gx,0.28,gz-1.6, 1.5,0.1,0.1,0,TIMBERC[0],'timber'); F.box(gx,0.28,gz+1.6, 1.5,0.1,0.1,0,TIMBERC[0],'timber');
        F.quad('cloth',[gx-0.5,0.34,gz-1.6],[gx+0.5,0.34,gz-1.6],[gx+0.5,0.34,gz+0.2],[gx-0.5,0.34,gz+0.2], CLOTHC[0],[0,1,0]); F.quad('cloth',[gx-0.5,0.34,gz+0.2],[gx+0.5,0.34,gz+0.2],[gx+0.5,0.34,gz+1.6],[gx-0.5,0.34,gz+1.6], PAL.whitewash[0],[0,1,0]);
        for(i=0;i<7;i++) F.box(-5.0+i*0.55+ (i>3?6.2:0),yf-1.45,zf+0.12, 0.3,0.9,0.12, 0, CLOTHC[i%7],'cloth');
        for(i=0;i<4;i++) F.box(-3.6,i*0.26,2.6, 0.5,0.26,1.6, 0.15*i-0.2, CLOTHC[(i+2)%7],'plaster');
        F.box(-3.8,0,-2.4, 1.2,0.9,2.0, 0, PLANKC[1],'plank'); F.box(-3.8,0.9,-2.4, 1.0,0.3,1.7, 0.05, CLOTHC[4],'plaster');
      } else { /* CARPENTER: bench, plank stacks, a log on trestles, a new door leaning on the pier, logs */
        F.box(-3.6,0.75,-1.6, 2.6,0.12,0.9, 0, PLANKC[0],'plank'); [[-1.1,-0.35],[1.1,-0.35],[-1.1,0.35],[1.1,0.35]].forEach(function(q){ F.box(-3.6+q[0],0,-1.6+q[1],0.12,0.75,0.12,0,TIMBERC[0],'timber'); });
        for(i=0;i<5;i++) F.box(3.4,i*0.12,-2.2, 3.4-(i%2)*0.3,0.1,0.9-(i%3)*0.1, 0.03*i, PLANKC[i%4],'plank');
        [-1,1].forEach(function(s){ F.beam(-0.2+s*1.1,0,2.3, -0.2+s*1.1,0.85,2.8, 0.1,0.1, TIMBERC[1],'timber'); F.beam(-0.2+s*1.1,0,3.3, -0.2+s*1.1,0.85,2.8, 0.1,0.1, TIMBERC[1],'timber'); });
        F.rod(-2.0,1.05,2.8, 1.8,1.05,2.8, 0.22, PAL.trunk[2],'bark');
        F.box(2.05,0,zf+0.35, 1.1,2.2,0.08, [-0.18,0,0], PLANKC[2],'plank');
        for(i=0;i<5;i++) F.rod(3.2,0.2+(i>2?0.36:0),2.2+ (i>2?(i-3)*0.42+0.21:i*0.42), 5.9,0.2+(i>2?0.36:0),2.2+(i>2?(i-3)*0.42+0.21:i*0.42), 0.2, PAL.trunk[i%4],'bark');
        F.box(-4.6,0,3.2, 0.9,1.6,0.9, 0.2, PLANKC[3],'plank'); F.box(-4.6,0,3.2, 0.95,0.1,0.95, 0.2, TIMBERC[0],'timber');
      }
      F.lantern(-2.0*((v?1:-1)),2.7,zf+0.25,0.8,12,0);
    } });

  /* =================================================================== nomad tent (shared by the market tent and the caravanserai) */
  function tent(F,cx,cz,yaw,s,cA,cB,ropes){ var c=Math.cos(yaw), sn=Math.sin(yaw); function P(u,y,w){ return [cx+(u*c+w*sn)*s, y*s, cz+(-u*sn+w*c)*s]; }
    var rl=1.5, ex=2.1, ez=1.75, ry=2.15, ey=1.05, n=3, i;
    for(i=0;i<n;i++){ var t0=i/n, t1=(i+1)/n, col=i%2?cB:cA; [1,-1].forEach(function(sd){
        var a=P(-ex+2*ex*t0,ey,sd*ez), b=P(-ex+2*ex*t1,ey,sd*ez), d=P(-rl+2*rl*t0,ry,0), e=P(-rl+2*rl*t1,ry,0), h=[sd*sn*0.5,1,sd*c*0.5];
        F.quad('cloth',a,b,e,d,col,h); F.quad('cloth',[a[0],a[1]-0.03,a[2]],[b[0],b[1]-0.03,b[2]],[e[0],e[1]-0.03,e[2]],[d[0],d[1]-0.03,d[2]],shade(col,-0.45),[-h[0],-1,-h[2]]); }); }
    [1,-1].forEach(function(sd){ var a=P(sd*ex,ey,ez), b=P(sd*ex,ey,-ez), r=P(sd*rl,ry,0), h=[sd*c,0.6,-sd*sn]; F.tri('cloth',a,b,r,cB,h); F.tri('cloth',[a[0],a[1]-0.03,a[2]],[b[0],b[1]-0.03,b[2]],[r[0],r[1]-0.03,r[2]],shade(cB,-0.45),[-h[0],-0.6,-h[2]]);
      /* end wall cloths down to the ground, and the back wall */
      var a0=P(sd*ex,0,ez*0.2), b0=P(sd*ex,0,-ez), am=P(sd*ex,ey,ez*0.2); F.quad('cloth',b0,a0,am,b,cA,[sd*c,0,-sd*sn]); F.quad('cloth',P(sd*ex-sd*0.03,0,-ez),P(sd*ex-sd*0.03,0,ez*0.2),P(sd*ex-sd*0.03,ey,ez*0.2),P(sd*ex-sd*0.03,ey,-ez),shade(cA,-0.45),[-sd*c,0,sd*sn]); });
    F.quad('cloth',P(-ex,0,-ez),P(ex,0,-ez),P(ex,ey,-ez),P(-ex,ey,-ez),cA,[-sn,0,-c]); F.quad('cloth',P(-ex,0,-ez+0.03),P(ex,0,-ez+0.03),P(ex,ey,-ez+0.03),P(-ex,ey,-ez+0.03),shade(cA,-0.5),[sn,0,c]);
    [[-rl,0,ry],[rl,0,ry],[-ex,ez,ey],[ex,ez,ey],[0,ez,ey]].forEach(function(q){ var a=P(q[0],0,q[1]), b=P(q[0],q[2]+0.12,q[1]); F.rod(a[0],a[1],a[2],b[0],b[1],b[2],0.04*s,TIMBERC[1]); });
    if(ropes!==false) [[-ex,ez,-2.45,2.35],[ex,ez,2.45,2.35],[-ex,-ez,-2.45,-2.35],[ex,-ez,2.45,-2.35]].forEach(function(q){ var a=P(q[0],ey,q[1]), b=P(q[2],0,q[3]); F.rod(a[0],a[1],a[2],b[0],b[1],b[2],0.015,PAL.thatch[3]); });
    /* a rug and a bundle inside */
    F.quad('cloth',P(-1.3,0.03,-1.2),P(1.3,0.03,-1.2),P(1.3,0.03,1.0),P(-1.3,0.03,1.0),CLOTHC[1],[0,1,0]); }
  /* a pack camel: swept body with a real hump, arched neck, small head, four legs. ~110 tris */
  function camel(F,cx,cz,yaw,col,load){ var c=Math.cos(yaw), sn=Math.sin(yaw); function P(u,w){ return [cx+u*c+w*sn, cz-u*sn+w*c]; }
    var body=[[-1.25,1.28,0.16],[-0.75,1.40,0.36],[-0.15,1.52,0.44],[0.35,1.62,0.42],[0.85,1.46,0.34],[1.20,1.36,0.22]];
    F.tube('adobe', body.map(function(b){ var q=P(b[0],0); return { x:q[0], y:b[1], z:q[1], r:b[2] }; }), col, { seg:7, cap:true });
    var hump=P(-0.15,0); F.edome(hump[0],1.86,hump[1], 0.42,0.46,0.34, yaw, shade(col,-0.06),'adobe');
    var neck=[[1.15,1.48,0.20],[1.55,1.90,0.16],[1.72,2.28,0.13],[1.62,2.52,0.12]];
    F.tube('adobe', neck.map(function(b){ var q=P(b[0],0); return { x:q[0], y:b[1], z:q[1], r:b[2] }; }), shade(col,0.04), { seg:6, cap:true });
    var hd=P(1.78,0), ea=P(1.50,0); F.fr5(hd[0],2.40,hd[1], 0.30,0.34,0.52, yaw+Math.PI/2, shade(col,0.06),'adobe'); F.cone(ea[0],2.56,ea[1], 0.08,0.20, 0, shade(col,-0.1),'adobe');
    [[-0.85,-0.26],[-0.85,0.26],[0.75,-0.26],[0.75,0.26]].forEach(function(l){ var a=P(l[0],l[1]); F.rod(a[0],0,a[1], a[0],1.22,a[1], 0.09, shade(col,-0.08),'adobe'); });
    var t0=P(-1.28,0); F.rod(t0[0],1.30,t0[1], t0[0]-c*0.18,0.72,t0[1]+sn*0.18, 0.05, shade(col,-0.14),'adobe');
    if(load!==false){ var s0=P(-0.35,0); F.box(s0[0],1.72,s0[1], 1.15,0.30,0.95, yaw, F.pick(CLOTHC),'plaster');
      [[-0.35,-0.52],[-0.35,0.52]].forEach(function(l){ var a=P(l[0],l[1]); F.box(a[0],1.18,a[1], 0.62,0.62,0.44, yaw, PAL.thatch[1],'plaster'); }); } }

  /* =================================================================== 9. CARAVANSERAI (landmark, 96 x 72) */
  A({ key:'trade_caravanserai', name:'Caravanserai of the desert road', family:'trade', districts:['market'], wealth:[0.5,0.8], w:96, d:72, h:22, variants:1,
    build:function(F){
      var X=47, Z=35, RB=4.7, G=7.5, H1=4.4, H=8.2, col=WHITEC[0], c2=WHITEC[1], fam='plaster', GW=20, i, s;
      /* room ranges against the outer wall (front range split by the gate tower) */
      F.box(0,0,-Z+RB/2, 2*X,H,RB, 0,col,fam); [-1,1].forEach(function(s){ F.box(s*(GW/2+(X-GW/2)/2),0,Z-RB/2, X-GW/2,H,RB, 0,col,fam); F.box(s*(X-RB/2),0,0, RB,H-0.02,2*Z-2*RB, 0,c2,fam); });
      F.box(0,0,0, 2*(X-G)+0.4,0.06,2*(Z-G)+0.4, 0, PAL.lane[2],'adobe'); F.box(0,0,Z-5, 8.2,0.07,10.5, 0, PAL.paving[2],'rock');
      var Y0=0.06;   /* court level is raised on the plinth: everything inside stands on Y0 */
      /* outer parapet + blue tile band */
      F.box(0,H,-Z+0.3, 2*X,1.0,0.6,0,col,fam); [-1,1].forEach(function(s){ F.box(s*(GW/2+(X-GW/2)/2),H,Z-0.3, X-GW/2,1.0,0.6,0,col,fam); F.box(s*(X-0.3),H,0, 0.6,0.98,2*Z-1.2,0,col,fam); });
      F.box(0,H-1.3,-Z-0.05, 2*X-9,0.85,0.1,0,MOSBLUEC[0],'mosaic'); [-1,1].forEach(function(s){ F.box(s*(GW/2+(X-GW/2)/2-1.2),H-1.3,Z+0.05, X-GW/2-6.5,0.85,0.1,0,MOSBLUEC[0],'mosaic'); F.box(s*(X+0.05),H-1.3,0, 0.1,0.85,2*Z-9,0,MOSBLUEC[2],'mosaic'); });
      /* outer wall: few small high windows, toron rows */
      for(i=-4;i<=4;i++){ if(i===0) continue; F.window(i*9.5+(i>0?1:-1)*2,6.0,Z+0.03, 0,1, 0.7,1.0); }
      for(i=-3;i<=3;i++){ F.window(X+0.03,6.0,i*8.5, 1,0, 0.7,1.0); F.window(-X-0.03,6.0,i*8.5, -1,0, 0.7,1.0); }
      /* galleries: floor + roof slabs, two tiers of arcades to the court */
      var xi=X-G, zi=Z-G, gd=G-RB, LB=2*xi, LS=2*zi;
      function slabs(y,h,c){ F.box(0,y,-zi-gd/2+0.2, LB+2*gd,h,gd+0.4,0,c,fam); [-1,1].forEach(function(s){ F.box(s*(GW/2+(xi+gd-GW/2)/2),y,zi+gd/2-0.2, xi+gd-GW/2,h,gd+0.4,0,c,fam); F.box(s*(xi+gd/2-0.2),y,0, gd+0.4,h-0.01,LS-0.8,0,c,fam); }); }
      slabs(H1-0.3,0.3,c2); slabs(H-0.3,0.3,c2);
      var ao={ pier:1.0, head:0.7, seg:6, noTop:true };            /* back faces ON: the user walks into this court */
      [[Y0,H1-0.3-Y0],[H1,H-0.3-H1]].forEach(function(t,k){ var ac=k?WHITEC[2]:col;
        F.arcade(fam, 0,t[0],-zi, 0, 15, LB/15, t[1], 0.6, ac, ao);
        [-1,1].forEach(function(s){ var run=xi-GW/2; F.arcade(fam, s*(GW/2+run/2),t[0],zi, PI, 6, run/6, t[1], 0.6, ac, ao); F.arcade(fam, s*xi,t[0],0, -s*PI/2, 11, LS/11, t[1], 0.6, ac, ao); }); });
      /* parapet rail of the upper gallery + tile band over the court arcades */
      F.box(0,H,-zi+0.0, LB,0.9,0.4,0,col,fam); [-1,1].forEach(function(s){ F.box(s*(GW/2+(xi-GW/2)/2),H,zi, xi-GW/2,0.9,0.4,0,col,fam); F.box(s*xi,H,0, 0.4,0.88,LS,0,col,fam); });
      F.box(0,H-0.28,-zi+0.33, LB-1,0.5,0.06,0,MOSBLUEC[3],'mosaic'); [-1,1].forEach(function(s){ F.box(s*(xi-0.33),H-0.28,0, 0.06,0.5,LS-1,0,MOSBLUEC[3],'mosaic'); });
      /* room doors behind the galleries (not on the stable side's ground floor) */
      for(i=0;i<15;i+=2){ var dx=(i-7)*LB/15; F.box(dx,Y0,-Z+RB+0.03, 1.1,2.1,0.06,0,VOIDC[1],'dark'); if(i%4===0) F.box(dx,H1,-Z+RB+0.03, 1.1,2.1,0.06,0,VOIDC[1],'dark'); }
      for(i=0;i<11;i+=2){ var dz=(i-5)*LS/11; F.box(X-RB-0.03,Y0,dz, 0.06,2.1,1.1,0,VOIDC[1],'dark'); if(i%4===1) F.box(X-RB-0.03,H1,dz, 0.06,2.1,1.1,0,VOIDC[1],'dark'); if(i%4===1) F.box(-X+RB+0.03,H1,dz, 0.06,2.1,1.1,0,VOIDC[1],'dark'); }
      [-1,1].forEach(function(s){ for(i=0;i<3;i++){ var fx=s*(GW/2+3+i*10.5); F.box(fx,Y0,Z-RB-0.03, 1.1,2.1,0.06,0,VOIDC[1],'dark'); } });
      /* STABLES along the left (-x) range: rails between the piers, mangers, hay */
      F.box(-xi-0.0,Y0+1.0,0, 0.14,0.14,LS-2, 0, TIMBERC[0],'timber'); F.box(-xi,Y0+0.5,0, 0.12,0.12,LS-2, 0, TIMBERC[2],'timber');
      for(i=0;i<5;i++){ var sz=(i-2)*10; F.box(-X+RB+0.5,Y0,sz, 0.8,0.7,4.5,0,PLANKC[1],'plank'); F.box(-X+RB+0.5,Y0+0.7,sz, 0.7,0.25,4.2,0,THATCHC[0],'thatch'); F.box(-xi-1.4,Y0,sz+4.9, 2.4,1.5,0.12,0,PLANKC[3],'plank'); }
      F.box(-xi+1.5,Y0,-18, 2.2,1.3,2.8,0.2,THATCHC[2],'thatch'); F.box(-xi+1.8,Y0,-14.5, 1.6,0.9,1.6,0.5,THATCHC[1],'thatch');
      /* stairs up to the upper gallery, against the back range */
      [-1,1].forEach(function(s){ var x0=s*18, x1=s*27, zz=-zi+1.3; F.beam(x0,Y0-0.3,zz, x1,H1-0.2,zz, 1.7,0.5, c2,fam);
        F.tri(fam,[x0,Y0,zz+0.8],[x1,Y0,zz+0.8],[x1,H1-0.4,zz+0.8],col,[0,0,1]); F.tri(fam,[x0,Y0,zz-0.8],[x1,Y0,zz-0.8],[x1,H1-0.4,zz-0.8],col,[0,0,-1]); F.box(x1+s*1.5,Y0,zz, 3.0,H1-0.35-Y0,1.7,0,col,fam); });
      /* THE GATE TOWER: a monumental parabolic passage */
      var gz=Z-4.2, GT=10.0, GH=17.5, OW=8.6, OH=10.6;
      F.archwall(fam, 0,0,gz, 0, GW,GH,GT, OW,OH, col, { colIn:BLUELC[1], seg:10, pointed:3 });
      [1,-1].forEach(function(s){ F.archband('mosaic', 0,0,gz+s*(GT/2+0.05), s>0?0:PI, OW,OH, 0.42, 0.26, MOSBLUEC[0], { pointed:3 });
        F.archband('plaster', 0,0,gz+s*(GT/2+0.10), s>0?0:PI, OW+0.84,OH+0.42, 0.20, 0.18, WHITEC[2], { pointed:3 }); });
      F.box(0,15.3,gz+GT/2+0.06, GW-2.6,1.0,0.12,0,MOSBLUEC[2],'mosaic'); F.box(0,14.6,gz+GT/2+0.06, GW-2.6,0.5,0.12,0,MOSWARMC[0],'mosaic'); F.box(0,12.6,gz+GT/2+0.05, 6.5,1.5,0.1,0,0xf0e6d0,'paintcol');
      for(i=-2;i<=2;i++){ if(i) F.toron(i*3.4,13.6,gz+GT/2, 0,1, 0.8,0.1); }
      [-1,1].forEach(function(s){ parch(F, s*7.2,9.0,gz+GT/2, 0, 1.0,1.9, col,fam);
        F.fr5(s*(GW/2-0.2),0,gz+GT/2-0.35, 2.2,GH+1.5,2.0,0,col,fam); F.cone(s*(GW/2-0.2),GH+1.4,gz+GT/2-0.35, 0.72,2.4,0,col,fam);
        F.fr5(s*(GW/2-0.2),0,gz-GT/2+0.4, 2.0,GH+1.0,2.0,0,col,fam); F.cone(s*(GW/2-0.2),GH+0.9,gz-GT/2+0.4, 0.66,2.0,0,col,fam);
        F.box(s*4.1,0,gz+2.6, 0.18,7.0,3.6, s*0.12, PLANKC[3],'plank');                                  /* the great leaves, swung open */
        F.lantern(s*5.6,3.6,gz+GT/2+0.5,1.1,16,0); F.lamp(s*3.5,4.2,gz-GT/2-0.4,0.9,14); });
      parapet(F,0,gz,GW-1.2,GT-0.6,GH,1.1,0.5,col,fam); for(i=-2;i<=2;i++) F.fr5(i*3.6,GH+1.1,gz+GT/2-0.55, 0.7,0.9,0.5,0,col,fam);
      F.edome(0,GH,gz-0.5, 3.8,3.0,3.8, 0, MOSBLUEC[1],'mosaic'); F.cone(0,GH+2.9,gz-0.5,0.22,1.4,0,BRASSC[0],'metal');
      /* corner towers */
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ var tx=q[0]*(X-4.6), tz=q[1]*(Z-4.6); F.tower(tx,0,tz, 3.5,17.5, { fam:fam, col:col, band:MOSBLUEC[0], seg:10, windows:[], finial:false });
        F.cone(tx,17.9,tz,0.25,1.8,0,BRASSC[0],'metal'); for(var k=0;k<2;k++){ var a=Math.atan2(-q[1],-q[0])+(k?0.9:-0.9); F.box(tx+Math.cos(a)*3.2,10.6,tz+Math.sin(a)*3.2, 0.7,1.5,0.5, -a+PI/2, VOIDC[0],'dark'); } });
      /* THE COURT: well, trough, hitching rails, pack animals, nomad tents, trees */
      F.lathe('mosaic',0,-3,[[2.0,Y0],[2.0,Y0+0.85],[1.65,Y0+0.92]],MOSBLUEC[1],{seg:10}); F.lathe('glass',0,-3,[[1.95,Y0+0.6],[1.95,Y0+0.64]],GLASSC[2],{seg:10,cap:true});
      F.box(-2.3,Y0,-3, 0.25,2.9,0.25,0,TIMBERC[0],'timber'); F.box(2.3,Y0,-3, 0.25,2.9,0.25,0,TIMBERC[0],'timber'); F.box(0,Y0+2.8,-3, 5.2,0.25,0.25,0,TIMBERC[1],'timber'); F.rod(0,Y0+2.8,-3,0,Y0+1.7,-3,0.02,PAL.thatch[3]); F.fr5(0,Y0+1.7,-3,0.4,0.4,0.4,[PI,0,0],PLANKC[0],'plank');
      F.box(-9,Y0,4, 9,0.7,1.4,0,ROCKC[2],'rock'); F.box(-9,Y0+0.7,4, 8.6,0.02,1.0,0,GLASSC[2],'glass');
      [[-27,-10],[-27,8]].forEach(function(q,k){ F.box(q[0],Y0,q[1]-3.5,0.2,1.2,0.2,0,TIMBERC[0],'timber'); F.box(q[0],Y0,q[1]+3.5,0.2,1.2,0.2,0,TIMBERC[0],'timber'); F.box(q[0],Y0+1.05,q[1],0.14,0.14,7.4,0,TIMBERC[1],'timber');
        camel(F,q[0]+2.4,q[1]-1.7,PI-0.15,PAL.adobe[k?2:4],k===0); if(!k) camel(F,q[0]+2.5,q[1]+1.9,PI+0.2,PAL.adobe[0],false); else camel(F,q[0]+2.3,q[1]+2.0,PI+0.1,PAL.adobeDark[2],true); });
      /* (camels stand on the court level) */
      tent(F, 22,-12, 0.5, 1.25, PAL.paintBlack[1], PAL.adobeDark[1]); tent(F, 27,5, -0.4, 1.15, PAL.adobeDark[1], PAL.whitewash[3], false); tent(F, 13,13, 2.6, 1.1, PAL.paintBlack[0], PAL.adobeDark[2], false);
      F.fr8(19,Y0,0,1.3,0.2,1.3,0.4,ROCKC[3],'rock'); F.box(19,Y0+0.2,0,0.5,0.06,0.5,0.5,PAL.glowWarm,'glowmat'); F.lamp(19,Y0+0.8,0,1.2,14);
      [[-16,-19,'cypress',13],[16,-19,'cypress',13],[-13,15,'olive',7],[32,-20,'cypress',12],[-30,18,'olive',6.5]].forEach(function(t){ F.tree(t[0],t[1],t[2],t[3],Y0); });
      for(i=0;i<6;i++){ F.lamp((i%3-1)*26,3.0,(i<3?-1:1)*(zi+1.5),0.8,14); } F.lamp(-xi-0.3,3.6,0,0.9,14); F.lamp(xi+0.3,3.6,0,0.9,14); F.lantern(0,3.4,-zi+0.45,0.9,14,0);
      [[-26,zi-0.6],[26,zi-0.6],[-26,-zi+0.6],[26,-zi+0.6]].forEach(function(q){ F.lantern(q[0],3.3,q[1],0.8,13,0); });
      /* bales and jars of the caravans */
      for(i=0;i<6;i++) bale(F, 8+i%3*1.35, Y0+Math.floor(i/3)*0.62, -16+Math.floor(i/3)*0.15, 1.2,0.62,0.85, 0.08*i, CLOTHC[(i*3)%7]);
      for(i=0;i<4;i++) bale(F, -20+i*1.3, Y0+(i%2)*0.62, 15, 1.15,0.62,0.8, 0.1*i, PAL.thatch[i%4]);
      pot(F,12.5,Y0,-15.5,0.5,1.0,TILEC[0]);
      /* a second trough by the tents, sacks, and a two-wheeled cart under the gallery */
      F.box(21,Y0,-4.5, 4.4,0.62,1.2, 0, ROCKC[1],'rock'); F.box(21,Y0+0.62,-4.5, 4.1,0.02,0.85, 0, GLASSC[2],'glass');
      for(i=0;i<4;i++) F.fr5(30+ (i%2)*0.95, Y0, 12+Math.floor(i/2)*0.9, 0.72,0.85,0.6, 0.3*i, PAL.whitewash[3],'adobe');
      (function(){ var cx=-12, cz=-10; F.box(cx,Y0+0.95,cz, 2.9,0.22,1.7, 0.25, PLANKC[1],'plank');
        F.box(cx-0.1,Y0+1.17,cz+0.05, 2.5,0.5,1.35, 0.25, PLANKC[3],'plank');
        [[0.0,-0.95],[0.0,0.95]].forEach(function(w){ var wx=cx+w[0]*Math.cos(0.25)+w[1]*Math.sin(0.25), wz=cz-w[0]*Math.sin(0.25)+w[1]*Math.cos(0.25);
          F.disc(wx,Y0+0.72,wz, Math.sin(0.25+PI/2),Math.cos(0.25+PI/2), 0.72, 0.16, TIMBERC[1],'timber');
          F.disc(wx,Y0+0.72,wz, Math.sin(0.25+PI/2),Math.cos(0.25+PI/2), 0.28, 0.22, TIMBERC[3],'timber'); });
        F.rod(cx+1.45*Math.cos(0.25),Y0+0.95,cz-1.45*Math.sin(0.25), cx+3.3*Math.cos(0.25),Y0+0.45,cz-3.3*Math.sin(0.25), 0.07, TIMBERC[0]); })(); 
    } });

  /* =================================================================== 10a. MARKET STALL */
  A({ key:'prop_market_stall', name:'Market stall', family:'prop', districts:['market','prosper'], wealth:[0.2,0.7], w:3, d:3, h:3, variants:4,
    build:function(F){
      var v=F.variant, i; awning(F,-1.4,1.4,-1.3,2.75,1.4,2.15,4,AWNINGC[[0,1,2,4][v]],AWNINGC[3]); F.rod(-1.32,0,-1.25,-1.32,2.78,-1.25,0.05,TIMBERC[1]); F.rod(1.32,0,-1.25,1.32,2.78,-1.25,0.05,TIMBERC[1]);
      F.box(0,0.78,0.45, 2.4,0.08,1.0, 0, PLANKC[v],'plank'); F.box(-0.95,0,0.45, 0.1,0.78,0.85,0,TIMBERC[0],'timber'); F.box(0.95,0,0.45, 0.1,0.78,0.85,0,TIMBERC[0],'timber');
      if(v===0){ for(i=0;i<4;i++) jar(F,-0.85+i*0.57,0.86,0.45,0.4,TILEC[i]); pot(F,-0.7,0,-0.6,0.38,0.8,TILEC[0]); pot(F,0.4,0,-0.7,0.3,0.62,ADOBEREDC[1]); }
      if(v===1){ for(i=0;i<5;i++) F.box(-0.9+i*0.45,0.86,0.45, 0.4,0.2+0.08*(i%3),0.8, 0, CLOTHC[(i*2)%7],'plaster'); for(i=0;i<3;i++) F.box(-0.8+i*0.8,1.2,-1.22, 0.6,1.4,0.03,0,CLOTHC[(i*2+1)%7],'cloth'); }
      if(v===2){ for(i=0;i<3;i++) crate(F,-0.8+i*0.8,0.86,0.45,0.7,[PAL.crop[0],PAL.flowerBed[1],PAL.paintRed[2]][i]); crate(F,-0.5,0,-0.6,0.8,PAL.crop[3],0.3); F.fr5(0.6,0,-0.6,0.55,0.7,0.5,0.4,PAL.whitewash[3],'adobe'); }
      if(v===3){ for(i=0;i<5;i++){ F.fr5(-0.9+i*0.45,0.86,0.5, 0.36,0.12,0.36,0,PLANKC[3],'plank'); F.pyr(-0.9+i*0.45,0.96,0.5, 0.3,0.32,0.3, 0, [MOSWARMC[0],MOSWARMC[1],MOSWARMC[2],PAL.paintYellow[0],MOSGREENC[0]][i],'adobe'); } F.lantern(0.85,0.86,0.42,0.6,8,0); F.box(0.2,0,-0.6,0.9,0.5,0.6,0.2,PLANKC[1],'plank'); }
    } });
  /* =================================================================== 10b. NOMAD MARKET TENT */
  A({ key:'prop_market_tent', name:"Nomad's goat-hair tent", family:'prop', districts:['market'], wealth:[0.1,0.6], w:5, d:5, h:3, variants:2,
    build:function(F){ var v=F.variant; tent(F,0,-0.1,0, 0.95, v?PAL.adobeDark[1]:PAL.paintBlack[1], v?PAL.whitewash[3]:PAL.adobeDark[0]);
      jar(F,-1.1,0,1.7,0.45,TILEC[1]); bale(F,1.0,0,1.8, 0.95,0.42,0.7, 0.3, CLOTHC[v?4:1]); bale(F,1.05,0.42,1.75, 0.7,0.34,0.55, -0.2, CLOTHC[2]);
      F.fr5(-0.3,0,1.9, 0.55,0.45,0.5, 0.4, PAL.thatch[1],'adobe'); } });
  /* =================================================================== 10c. MARKET HALL */
  A({ key:'trade_market_hall', name:'Arcaded market hall', family:'trade', districts:['market'], wealth:[0.4,0.8], w:22, d:14, h:10, variants:2,
    build:function(F){
      var v=F.variant, col=v?WHITEC[0]:ADOBEC[2], fam=v?'plaster':'adobe', W=21, D=13.2, AH=4.9, T=0.6, i, ao={ pier:1.1, head:0.8, seg:v?4:6 }, nb=v?4:5, nd=3;
      F.box(0,0,0, W+0.6,0.3,D+0.6, 0, PAL.paving[2],'rock');
      F.arcade(fam, 0,0.3,D/2-T/2, 0, nb, (W-1.2)/nb, AH, T, col, ao); F.arcade(fam, 0,0.3,-D/2+T/2, PI, nb, (W-1.2)/nb, AH, T, col, ao);
      [-1,1].forEach(function(s){ F.arcade(fam, s*(W/2-T/2),0.3,0, s*PI/2, nd, (D-1.2)/nd, AH, T, col, ao);
        [-1,1].forEach(function(t){ F.fr8(s*(W/2-0.45),0,t*(D/2-0.45), 1.5,AH+0.3,1.5,0,col,fam); F.cone(s*(W/2-0.45),v?AH+1.55:AH+0.75,t*(D/2-0.45),0.4,1.3,0,col,fam); }); });
      for(i=-1;i<=1;i++) F.fr8(i*6.5,0.3,0, 0.9,AH,0.9, 0, shade(col,-0.05),fam);
      F.box(0,AH+0.3,0, W-0.2,0.5,D-0.2, 0, shade(col,-0.04),fam);
      var y=AH+0.8;
      if(!v){ /* hipped tile roof with a raised ridge vent */
        var ex=W/2+0.35, ez=D/2+0.35, rx=5.2, ry=y+3.1;
        F.quad('tile',[-ex,y,ez],[ex,y,ez],[rx,ry,0],[-rx,ry,0],TILEC[0],[0,1,1]); F.quad('tile',[-ex,y,-ez],[ex,y,-ez],[rx,ry,0],[-rx,ry,0],TILEC[1],[0,1,-1]);
        F.tri('tile',[ex,y,ez],[ex,y,-ez],[rx,ry,0],TILEC[2],[1,1,0]); F.tri('tile',[-ex,y,ez],[-ex,y,-ez],[-rx,ry,0],TILEC[2],[-1,1,0]);
        F.box(0,y-0.06,0, 2*ex,0.06,2*ez,0,shade(TILEC[3],-0.3),'tile'); F.box(0,ry-0.25,0, 2*rx+0.6,0.5,0.7,0,col,fam); for(i=-1;i<=1;i++) F.cone(i*rx,ry+0.2,0,0.3,1.0,0,col,fam);
      } else { /* flat roof, parapet, three parabolic domes */
        parapet(F,0,0,W-0.2,D-0.2,y,0.8,0.4,col,fam); for(i=-1;i<=1;i++){ var pr=[[3.0,y]]; for(var k=1;k<=5;k++){ var t=k/5; pr.push([Math.max(0.06,3.0*Math.sqrt(1-t)),y+3.4*t]); }
          F.lathe(i?'plaster':'mosaic', i*6.6,0, pr, i?WHITEC[2]:MOSBLUEC[1], { seg:12 }); F.cone(i*6.6,y+3.3,0,0.16,0.9,0,BRASSC[0],'metal'); }
        F.box(0,y-0.7,D/2+0.04, W-3,0.5,0.08,0,MOSBLUEC[0],'mosaic'); }
      /* trading inside */
      [[-7.5,2.5],[-2.5,-2.5],[3.5,2.5],[8,-2.5]].forEach(function(q,k){ F.box(q[0],0.3,q[1], 2.6,0.8,1.1, 0, PLANKC[k],'plank');
        if(k%2) for(i=0;i<3;i++) crate(F,q[0]-0.8+i*0.8,1.1,q[1],0.7,[PAL.crop[0],PAL.flowerBed[1],PAL.paintRed[2]][i]); else for(i=0;i<4;i++) F.box(q[0]-0.9+i*0.6,1.1,q[1],0.5,0.25+0.1*(i%2),0.9,0,CLOTHC[(i+k)%7],'plaster'); });
      pot(F,-4.5,0.3,-3.5,0.5,1.0,TILEC[0]); pot(F,5.6,0.3,3.2,0.45,0.9,TILEC[2]);
      [-1,1].forEach(function(s){ F.lantern(s*5.2,3.9,0,1.0,14,0.9); F.lantern(s*2.2,3.0,D/2+0.4,0.8,12,0); });
    } });
  /* =================================================================== 11. PUBLIC FOUNTAIN / WELL-HOUSE */
  A({ key:'prop_fountain_kiosk', name:'Public fountain under a domed kiosk', family:'prop', districts:['core','prosper','market','poor'], wealth:[0.3,0.8], w:5, d:5, h:7, variants:2,
    build:function(F){
      var v=F.variant, col=WHITEC[v], S=3.7, AH=3.5, i;
      F.box(0,0,0, 4.7,0.22,4.7, 0, PAL.paving[1],'rock');
      for(i=0;i<4;i++){ var a=i*PI/2; F.archwall('plaster', Math.sin(a)*(S/2-0.2),0.22,Math.cos(a)*(S/2-0.2), a, S,AH,0.4, 2.3,2.85, col, { seg:6, pointed:2.4, colIn:v?BLUELC[1]:MOSBLUEC[3], famIn:v?'plaster':'mosaic' }); }
      F.box(0,AH+0.22,0, S+0.4,0.3,S+0.4, 0, v?BLUEDC[0]:MOSBLUEC[0], v?'plaster':'mosaic');
      var y=AH+0.52, pr=[[1.75,y]]; for(var k=1;k<=5;k++){ var t=k/5; pr.push([Math.max(0.05,1.75*Math.sqrt(1-t)),y+2.1*t]); }
      F.lathe(v?'plaster':'mosaic',0,0,pr, v?BLUELC[0]:MOSBLUEC[1], { seg:12 }); F.cone(0,y+2.0,0,0.12,0.8,0,BRASSC[1],'metal');
      [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(function(q){ F.cone(q[0]*(S/2-0.1),AH+0.5,q[1]*(S/2-0.1),0.22,0.8,0,col,'plaster'); });
      if(!v){ F.lathe('mosaic',0,0,[[1.2,0.22],[1.3,0.8],[1.08,0.86]],MOSBLUEC[0],{seg:8}); F.lathe('glass',0,0,[[1.22,0.66],[1.22,0.7]],GLASSC[3],{seg:8,cap:true});
        F.lathe('mosaic',0,0,[[0.22,0.7],[0.16,1.3],[0.5,1.55],[0.55,1.62]],MOSWARMC[0],{seg:8,cap:true,capCol:GLASSC[3]}); }
      else { F.lathe('rock',0,0,[[0.95,0.22],[0.95,1.05],[0.72,1.1]],ROCKC[0],{seg:8}); F.lathe('dark',0,0,[[0.9,0.85],[0.9,0.88]],VOIDC[0],{seg:8,cap:true});
        F.rod(-1.2,2.3,0,1.2,2.3,0,0.08,TIMBERC[0]); F.rod(0,2.3,0,0,1.65,0,0.02,PAL.thatch[3]); F.fr5(0,1.65,0,0.36,0.36,0.36,[PI,0,0],PLANKC[0],'plank'); jar(F,1.0,0.22,2.0,0.4,TILEC[1]); }
      F.lantern(0,3.2,S/2+0.2,0.8,12,0);
    } });
})();
