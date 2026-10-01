/* ============================== 16c. ASSETS: POOR QUARTERS — mud and thatch ==============================
   Agent "poor". Musgum shell houses, painted egg huts, Mandara thatched-cone clusters, flat-roofed banco houses,
   poor family compounds, and the small things: granary, shade hangar, animal pen, well, lean-to shack.
   One IIFE; colours only from PAL; geometry only through F.                                                  */
reseed(570001);
(function(){
  var PI=Math.PI;
  /* ---------------------------------------------------------------- helpers */
  /* the hut mouths are drawn by hand below; register each as a leafless opening (tagged, exported, walkable) */
  function doorPt(F,lx,lz,nx,nz,w,h,ly,to){ F.opening(lx,lz, nx,nz, w||0.8, h||1.6, ly||0, { style:'open', to:to||'interior' }); }
  function pot(F,x,y,z,s,col){ F.lathe('adobe',x,z,[[0.15*s,y],[0.34*s,y+0.24*s],[0.27*s,y+0.52*s],[0.13*s,y+0.64*s],[0.19*s,y+0.72*s]],col,{seg:6,cap:true,capCol:VOIDC[1]}); }
  function rockAt(F,x,z,s,F2){ F.fr5(x,-0.05,z, s*1.3,s*0.8,s, F.rr(0,3), F.pick(ROCKC), 'rock'); }
  function fire(F,x,z){
    for(var i=0;i<3;i++){ var a=i*TAU/3+0.4; F.fr5(x+Math.cos(a)*0.42,0,z+Math.sin(a)*0.42, 0.34,0.3,0.3, a, ROCKC[3], 'rock'); }
    F.ball(x,0.12,z,0.2,PAL.glowWarm,'glowmat'); pot(F,x,0.27,z,0.8,PAL.paintBlack[1]); F.lamp(x,0.5,z,0.9,11);
  }
  function ladder(F,ax,az,bx,bz,h,nx,nz){ /* from the ground at a to the wall top at b; (nx,nz) = unit vector ALONG the wall */
    [-0.26,0.26].forEach(function(s){ F.rod(ax+nx*s,0,az+nz*s, bx+nx*s,h,bz+nz*s, 0.045, TIMBERC[2], 'timber'); });
    for(var i=1;i<=4;i++){ var t=i/5.2, x=ax+(bx-ax)*t, z=az+(bz-az)*t, y=h*t; F.rod(x-nx*0.33,y,z-nz*0.33, x+nx*0.33,y,z+nz*0.33, 0.035, TIMBERC[0], 'timber'); }
  }
  function forkPost(F,x,z,h,ax,az){ /* a forked post: the fork opens along (ax,az) */
    F.rod(x,0,z, x,h,z, 0.085, TIMBERC[1], 'timber');
    F.rod(x,h-0.05,z, x+ax*0.2,h+0.32,z+az*0.2, 0.055, TIMBERC[1], 'timber'); F.rod(x,h-0.05,z, x-ax*0.2,h+0.32,z-az*0.2, 0.055, TIMBERC[1], 'timber');
  }
  /* a granary: mud jar on legs under a removable thatch cap */
  function granary(F,x,z,s,y0,col,stone){
    y0=y0||0; var L=0.85*s;
    for(var i=0;i<4;i++){ var a=i*TAU/4+0.6, c=Math.cos(a), sn=Math.sin(a);
      if(stone) F.fr5(x+c*0.62*s,y0,z+sn*0.62*s, 0.42*s,L,0.42*s, a, ROCKC[i%4], 'rock');
      else F.rod(x+c*0.8*s,y0,z+sn*0.8*s, x+c*0.55*s,y0+L,z+sn*0.55*s, 0.08*s, TIMBERC[i%4], 'timber'); }
    F.box(x,y0+L,z, 1.5*s,0.12*s,1.5*s, 0.5, PLANKC[3], 'plank');
    F.lathe('adobe',x,z,[[0.62*s,y0+L+0.1*s],[0.98*s,y0+L+0.7*s],[1.02*s,y0+L+1.4*s],[0.78*s,y0+L+2.0*s],[0.55*s,y0+L+2.25*s]],col,{seg:8});
    F.mcone('thatch',x,y0+L+2.05*s,z, 1.0*s,0,1.25*s, THATCHC[1], 8, {under:true});
    F.rod(x,y0+L+3.2*s,z, x,y0+L+3.55*s,z, 0.07*s, THATCHC[4], 'thatch');
    F.box(x,y0+L+1.15*s,z+0.95*s, 0.42*s,0.42*s,0.2*s, 0, PLANKC[1], 'plank');          /* the little hatch */
  }
  /* a round drum hut under a steep ragged thatch cone */
  function coneHut(F,x,z,r,hd,hc,y0,da,col,fam,o){
    o=o||{};
    if(y0>0.05) F.lathe('rock',x,z,[[r+0.62,0],[r+0.42,y0*0.7],[r+0.12,y0+0.02]],F.pick(ROCKC),{seg:7, rfn:function(i,a){ return 1+0.10*Math.sin(a*3+x)+0.06*Math.sin(a*5+z); }});
    F.cyl(x,y0,z, r,hd, 0, col, fam||'adobe');
    if(o.stone) F.cyl(x,y0,z, r+0.07,hd*0.45, 0.3, F.pick(ROCKC), 'rock');                /* stone lower courses */
    var ry0=y0+hd-0.4, tc=o.tcol!=null?o.tcol:F.pick(THATCHC);
    F.mcone('thatch',x,ry0,z, r+0.42,0,hc, tc, 9, {under:true});
    F.mcone('thatch',x,ry0-0.18,z, r+0.62,r*0.5,hc*0.42, shade(tc,-0.14), 7);              /* the ragged lower skirt */
    F.rod(x,ry0+hc-0.75,z, x,ry0+hc-0.45,z, 0.17, THATCHC[4], 'thatch');                   /* binding */
    F.cone(x,ry0+hc-0.5,z, 0.13,0.85, 0, shade(tc,-0.2), 'thatch');                        /* topknot */
    var c=Math.cos(da), s=Math.sin(da);
    F.box(x+c*(r-0.12),y0,z+s*(r-0.12), 0.72,1.5,0.34, PI/2-da, VOIDC[1], 'dark');
    if(o.doorReg!==false) doorPt(F, x+c*r, z+s*r, c, s, 0.72, 1.5, y0);     /* every hut mouth is a doorway (51-fixtures.js) */
  }
  /* a flat-roofed battered mud room. Local room frame: +z = its front, turned by yaw. o:{door:x|null, par, horns, torons, spouts, win, band} */
  function mudRoom(F,cx,cz,yaw,W,D,H,col,o){
    o=o||{}; var cy=Math.cos(yaw), sy=Math.sin(yaw), par=o.par===false?0:0.45, Hb=H-par;
    function rp(lx,lz){ return [cx+lx*cy+lz*sy, cz-lx*sy+lz*cy]; }
    function zf(y){ return D/2*(1-0.16*y/Hb); }  function xf(y){ return W/2*(1-0.16*y/Hb); }
    var n=[sy,cy], tx=[cy,-sy];
    F.fr8(cx,0,cz, W,Hb,D, yaw, col, 'adobe');
    F.box(cx,0,cz, W+0.1,0.6,D+0.1, yaw, shade(col,-0.24), 'adobe');                     /* splash-darkened foot */
    var Wt=W*0.84, Dt=D*0.84, pc=shade(col,0.04);
    if(par){
      [[0,Dt/2-0.16,Wt,0.32],[0,-Dt/2+0.16,Wt,0.32]].forEach(function(b){ var q=rp(b[0],b[1]); F.box(q[0],Hb-0.02,q[1], b[2],par,b[3], yaw, pc, 'adobe'); });
      [[Wt/2-0.16,0],[-Wt/2+0.16,0]].forEach(function(b){ var q=rp(b[0],b[1]); F.box(q[0],Hb-0.02,q[1], 0.32,par-0.01,Dt-0.6, yaw, pc, 'adobe'); });
    }
    if(o.horns!==false) [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(function(k){ var q=rp(k[0]*W*0.45,k[1]*D*0.45);
      F.fr5(q[0],0,q[1], 1.1,Hb+par+0.1,1.1, yaw, pc, 'adobe');                               /* corner buttress-pier */
      if(!(o.horns==='front' && k[1]<0)) F.cone(q[0],Hb+par+0.05,q[1], 0.29,0.8, 0, pc, 'adobe'); });
    if(o.door!=null){ var dq=rp(o.door, zf(1.0)+0.02); F.door(dq[0],dq[1], n[0],n[1], 0.95,2.0, PLANKC[(F.variant+1)%4]);
      if(o.bench!=null){ var eq=rp(o.bench, D/2+0.3); F.box(eq[0],0,eq[1], 2.2,0.42,0.55, yaw, shade(col,-0.1), 'adobe'); }
      if(o.band!=null){ var bq=rp(o.door, D/2+0.05); F.archband('plaster', bq[0],0,bq[1], yaw, 1.32,2.34, 0.26,0.62, o.band, {seg:10}); } }
    if(o.win!=null){ var wq=rp(o.win, zf(1.9)+0.03); F.window(wq[0],1.9,wq[1], n[0],n[1], 0.55,0.6); }
    if(o.torons){ for(var t=0;t<o.torons;t++){ var ty=Hb-0.55, q2=rp((t-(o.torons-1)/2)*0.85+(o.toronX||0), zf(ty)); F.toron(q2[0],ty,q2[1], n[0],n[1], 0.7, 0.07); } }
    if(o.spouts){ [-1,1].forEach(function(s){ if(o.spouts===1 && s<0) return; var a=rp(s*(xf(Hb)-0.3), -D*0.18), b=rp(s*(xf(Hb)+0.75), -D*0.18);
      F.beam(a[0],Hb+0.02,a[1], b[0],Hb-0.16,b[1], 0.2,0.14, PLANKC[3], 'plank'); }); }
    return { rp:rp, zf:zf, xf:xf, Hb:Hb, n:n, tx:tx, Wt:Wt, Dt:Dt };
  }

  /* ---------------------------------------------------------------- 1. MUSGUM SHELL HOUSE */
  function musgum(F,cx,cz,R,H,col,doorReg,nrows){
    function rS(y){ return R*Math.sqrt(Math.max(0.0001,1-Math.pow(clamp(y/H,0,1),1.35))); }
    var ts=[0.045,0.2,0.38,0.56,0.72,0.85,0.94], prof=[[R*1.07,0]], yTop=H;
    ts.forEach(function(t){ prof.push([rS(t*H),t*H]); });
    prof.push([0.46,H*0.985]); yTop=H*0.985;
    F.lathe('adobe',cx,cz,prof,col,{seg:12});
    F.cyl(cx,yTop-0.5,cz, 0.47,0.46, 0, VOIDC[2], 'dark');                                   /* smoke hole */
    F.lathe('adobe',cx,cz,[[0.5,yTop-0.12],[0.6,yTop+0.06],[0.47,yTop+0.16]],shade(col,0.05),{seg:8});   /* its lip */
    /* dense raised finger-ridges running the full height, in horizontal courses (the climbing footholds) */
    var rc=shade(col,0.07), rc2=shade(col,-0.03), nRib=Math.max(11,Math.round(TAU*R/1.6)), dHalf=1.35/R+0.18;
    for(var j=0;j<nRib;j++){
      var a=PI/2+(j+0.5)/nRib*TAU, front=angDist(a,PI/2)<dHalf;
      var y0=front?3.05:0.16, y1=H*0.955, np=front?9:14, pts=[], cw=(H*0.94-0.16)/6;
      for(var q=0;q<=np;q++){ var t=q/np, y=y0+(y1-y0)*t, rr=rS(y), rad=mix(0.21,0.06, Math.pow(y/H,0.7));
        rad *= 1 + 0.42*Math.pow(Math.max(0,Math.cos(PI*(y-0.16)/cw)),3) - 0.22*Math.pow(Math.max(0,-Math.cos(PI*(y-0.16)/cw)),2);
        pts.push({ x:cx+Math.cos(a)*(rr+rad*0.26), y:y, z:cz+Math.sin(a)*(rr+rad*0.26), r:rad }); }
      F.tube('adobe', pts, (j%2)?rc:rc2, {seg:5});
    }
    for(var k=2;k<6;k++){ var yc=0.16+k*(H*0.94-0.16)/6, rr2=rS(yc);
      F.lathe('adobe',cx,cz,[[rr2+0.01,yc-0.10],[rr2+0.10,yc],[rr2+0.01,yc+0.10]],rc,{seg:12}); }
    /* keyhole doorway in a moulded, projecting surround */
    var zf=cz+R*1.07;
    F.fr5(cx,0,zf-0.55, 2.0,2.75,1.7, 0, shade(col,0.03), 'adobe');
    F.tube('adobe',[[-0.98,0],[-0.9,1.1],[-0.66,2.1],[-0.3,2.62],[0,2.76],[0.3,2.62],[0.66,2.1],[0.9,1.1],[0.98,0]].map(function(p){ return {x:cx+p[0],y:p[1],z:zf+0.12-p[1]*0.085,r:0.27}; }),shade(col,0.09),{seg:5});
    F.box(cx,0,zf+0.06, 0.62,1.45,0.5, 0, VOIDC[2], 'dark');
    F.cyl(cx,1.62,zf+0.19, 0.5,0.7, [-PI/2,0,0], VOIDC[2], 'dark');
    F.box(cx,-0.02,zf+0.55, 1.5,0.14,0.5, 0, shade(col,-0.08), 'adobe');                     /* sill */
    if(doorReg) doorPt(F,cx,zf+0.3,0,1);
  }
  ASSET({ key:'poor_musgum', name:'Musgum shell house', family:'poor', districts:['poor'], wealth:[0,0.3], w:12, d:11, h:9, variants:3,
    build:function(F){
      var v=F.variant, col=F.pick(ADOBEC);
      if(v===0){ musgum(F,0,-0.6, F.rr(3.7,3.95), F.rr(8.3,8.9), col, true, 4); pot(F,-3.2,0,3.9,1.1,ADOBEREDC[1]); }
      else if(v===1){ /* a pair joined by a low curved wall */
        musgum(F,-2.85,-1.3, 2.7, F.rr(6.6,7.1), col, true, 3); musgum(F,3.0,-0.5, 2.35, F.rr(5.6,6.0), shade(col,-0.05), false, 3);
        [[0.08*PI,PI/2-0.17],[PI/2+0.17,0.92*PI]].forEach(function(a){ F.sector('adobe',0.1,0.5, 4.55,4.9, a[0],a[1], 0,1.15, shade(col,-0.04), {faces:'tios',step:1.6}); });
        fire(F,0.1,3.3); }
      else { musgum(F,0,-0.7, F.rr(4.2,4.4), F.rr(6.2,6.6), F.pick(ADOBEREDC), true, 3); granary(F,-4.9,3.6,0.62,0,col,true); }
    } });

  /* ---------------------------------------------------------------- 2. PAINTED EGG HUT */
  ASSET({ key:'poor_egg_hut', name:'Painted egg hut', family:'poor', districts:['poor','market'], wealth:[0,0.45], w:8, d:9, h:7.5, variants:3,
    build:function(F){
      var v=F.variant, painted=F.wealth>0.2, R=F.rr(2.7,2.95), H=[5.6,6.4,7.0][v]+F.rr(-0.2,0.2), cz=-0.9, col=F.pick(ADOBEC);
      function rE(t){ return t<0.3 ? R*(0.78+0.22*Math.sin(t/0.3*PI/2)) : R*Math.sqrt(Math.max(0.0004,1-Math.pow((t-0.3)/0.7,1.8))); }
      var ts=[0,0.15,0.3,0.45,0.6,0.75,0.88,0.96,1.0];
      function band(fam,c,i0,i1,l){ var p=[]; for(var i=i0;i<=i1;i++) p.push([rE(ts[i])+(l||0),ts[i]*H]); F.lathe(fam,0,cz,p,c,{seg:12}); }
      var white=WHITEC[1], warm=0xf0e6d0;
      if(v===0){ band('adobe',col,0,4); /* bare mud under a thatch hood */
        var tc=F.pick(THATCHC), p=[[rE(0.5)+0.38,0.5*H-0.25],[rE(0.5)+0.30,0.5*H-0.12]]; for(var i=4;i<ts.length;i++) if(ts[i]*H+0.1 > 0.5*H-0.1) p.push([rE(ts[i])+0.16,ts[i]*H+0.1]);
        F.lathe('thatch',0,cz,p,tc,{seg:12});
        if(painted) F.lathe('plaster',0,cz,[[rE(0)+0.03,0],[rE(0.08)+0.03,0.08*H]],white,{seg:12}); }
      else if(v===1){ band('plaster',white,0,2); if(painted) band('paintbw',0xffffff,2,4); else band('adobe',shade(col,0.05),2,4); band('adobe',col,4,8); }
      else { if(painted){ band('paintcol',warm,0,3); band('paintbw',0xffffff,3,5); band('adobe',F.pick(ADOBEREDC),5,8); }
             else { band('adobe',F.pick(ADOBEREDC),0,3); band('plaster',white,3,4); band('adobe',col,4,8); } }
      if(v>0){ F.cone(0,H-0.35,cz, 0.2,0.9, 0, shade(col,-0.1), 'adobe'); }
      /* the porch: a moulded mud hood growing out of the shell, over a parabolic door */
      var zF=cz+R+0.62, zB=cz+R*0.52, ow=1.15, oh=2.05,
          pcol = v===1 ? white : (v===2 ? shade(col,0.05) : col), pfam = v===1 ? 'plaster' : 'adobe';
      F.box(0,0,cz+R*0.86, ow+0.15,oh+0.05,0.7, 0, VOIDC[1], 'dark');                     /* the dark interior */
      F.archband(pfam,0,0,zF,0, ow,oh, 0.50, zF-zB, pcol, {seg:14});                       /* the hood, swept back into the shell */
      F.archband(pfam,0,0,zF+0.17,0, ow+1.0,oh+0.50, 0.36, 0.34, shade(pcol,-0.05), {seg:14});  /* its flared outer roll */
      F.archband('adobe',0,0,zF+0.22,0, ow,oh, 0.13, 0, shade(col,-0.16), {seg:14});       /* the dark lip at the mouth */
      var spr=1.30;                                                                        /* the outer rolls spring from waist height */
      [-1,1].forEach(function(sd){ F.fr8(sd*(ow/2+0.78),0,(zF+zB)/2+0.25, 1.05,spr+0.12,zF-zB+0.3, 0, shade(pcol,-0.02), pfam); });
      if(v===0){ var tc=F.pick(THATCHC);                                                    /* a thatch eyebrow over the mouth */
        F.archband('thatch',0,spr,zF+0.30,0, ow+1.66,oh+0.86-spr, 0.34, 0.55, tc, {seg:12});
        F.archband('thatch',0,spr+0.1,zF+0.34,0, ow+2.34,oh+1.20-spr-0.1, 0.22, 0.24, shade(tc,-0.14), {seg:12}); }
      if(v===2) F.archband(painted?'paintbw':'adobe',0,spr,zF+0.25,0, ow+1.66,oh+0.86-spr, 0.30,0.2, painted?0xffffff:shade(col,-0.1), {seg:12});
      [-1,1].forEach(function(sd){ F.lathe('adobe', sd*(ow/2+0.60), zF-0.16,
        [[0.26,0],[0.31,0.7],[0.22,1.9]], shade(pcol,-0.04), {seg:6}); });                  /* the two jamb rolls */
      doorPt(F,0,zF,0,1, ow-0.1, oh-0.1);
      if(F.chance(0.7)) pot(F,2.6,0,zF-0.6,1.0,ADOBEREDC[2]);
    } });

  /* ---------------------------------------------------------------- 3. THATCHED CONE HUT CLUSTER (Mandara) */
  ASSET({ key:'poor_cone_cluster', name:'Thatched cone hut cluster', family:'poor', districts:['poor'], wealth:[0,0.25], w:14, d:12, h:8, variants:3,
    build:function(F){
      var v=F.variant, L=[
        { huts:[[-3.7,-1.6,1.9],[0.3,-2.7,1.6],[3.9,-0.9,2.0],[-0.5,1.9,1.45]], gran:[[3.1,3.3]] },
        { huts:[[-4.3,-2.5,1.55],[-1.3,-3.3,1.4],[2.1,-2.9,1.7],[4.75,0.3,1.3],[-3.5,1.6,1.75],[0.5,0.7,1.45]], gran:[[3.3,3.7]] },
        { huts:[[-3.4,-1.3,2.05],[1.3,-2.3,2.0],[3.7,2.0,1.65]], gran:[[-0.4,2.9],[-4.4,3.5]] } ][v];
      var ovX=6.25, ovZ=5.3;
      function oval(i,a){ var c=Math.cos(a), sn=Math.sin(a);
        return (1+0.045*Math.sin(a*3+v)+0.03*Math.sin(a*5)) / Math.sqrt(Math.pow(c/ovZ,2)+Math.pow(sn/ovX,2)); }
      F.lathe('rock',0,0,[[1,0],[0.94,0.3],[0.80,0.44]],ROCKC[1],{seg:20,cap:true, rfn:oval});
      L.huts.forEach(function(h,i){ var r=h[2], y0=0.4+F.rr(0.05,0.55), da=Math.atan2(1.2-h[1], 0.2-h[0]);
        coneHut(F,h[0],h[1],r, F.rr(1.7,2.1), r*F.rr(2.0,2.5)+0.6, y0, da, i%2?F.pick(ADOBEC):PAL.adobeDark[i%3], 'adobe', {stone:i%2===0, doorReg:true}); });
      L.gran.forEach(function(g){ granary(F,g[0],g[1],0.72,0.38,F.pick(ADOBEC),true); });
      for(var k=0;k<6;k++){ var a=F.rr(0,TAU), rr2=F.rr(5.0,5.5); rockAt(F,Math.cos(a)*rr2,Math.sin(a)*rr2,F.rr(0.5,0.9)); }
    } });

  /* ---------------------------------------------------------------- 4. FLAT-ROOFED MUD HOUSE */
  ASSET({ key:'poor_mud_house', name:'Flat-roofed mud house', family:'poor', districts:['poor','market'], wealth:[0.05,0.4], w:11, d:9, h:5, variants:4,
    build:function(F){
      var v=F.variant, col=F.pick(ADOBEC), band=F.wealth>0.25?WHITEC[1]:null, M, q;
      function roofLife(M,cx0,shelter){ var a=M.rp(-M.Wt/2+0.9, -M.Dt/2+0.9); pot(F,a[0],M.Hb,a[1],1.0,ADOBEREDC[0]); var b=M.rp(-M.Wt/2+1.6,-M.Dt/2+0.8); pot(F,b[0],M.Hb,b[1],0.7,ADOBEREDC[3]);
        var m=M.rp(M.Wt/2-1.6, -0.2); F.box(m[0],M.Hb,m[1], 1.9,0.06,0.95, F.rr(-0.3,0.3), THATCHC[2], 'thatch');
        if(shelter){ var sx=M.Wt/2-1.5; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(k){ var p=M.rp(sx+k[0]*1.0,-0.2+k[1]*0.8); F.rod(p[0],M.Hb,p[1],p[0],M.Hb+1.7,p[1],0.05,TIMBERC[2],'timber'); });
          var s0=M.rp(sx,-1.25), s1=M.rp(sx,0.85); F.beam(s0[0],M.Hb+1.78,s0[1], s1[0],M.Hb+1.62,s1[1], 2.5,0.12, THATCHC[3], 'thatch'); } }
      if(v===0){ M=mudRoom(F,0,-0.6,0, 7.2,5.0,3.3,col,{door:-1.2,torons:4,toronX:1.6,spouts:1,band:band,bench:0.9});
        ladder(F,2.0,-0.6+2.5+1.2, 2.0,-0.6+M.zf(M.Hb)+0.06, M.Hb+0.55, 1,0); roofLife(M,0,false); }
      else if(v===1){ M=mudRoom(F,0,-0.8,0, 8.8,5.6,3.5,col,{door:0.8,torons:5,toronX:-1.8,spouts:2,win:-2.9,band:band,bench:-1.2});
        ladder(F,2.8,-0.8+2.8+1.2, 2.8,-0.8+M.zf(M.Hb)+0.06, M.Hb+0.55, 1,0); roofLife(M,0,true); }
      else if(v===2){ /* L-shape: main range + a lower wing coming forward */
        M=mudRoom(F,0.3,-1.8,0, 8.6,4.6,3.4,col,{door:1.6,torons:4,toronX:1.7,spouts:1,band:band});
        var W2=mudRoom(F,-2.6,1.9,0, 4.0,4.0,2.8,shade(col,-0.04),{horns:'front',win:0,par:true});
        ladder(F,0.6,2.2, -2.6+W2.xf(W2.Hb)+0.06,2.2, W2.Hb+0.5, 0,1); roofLife(M,0,false);
        q=W2.rp(0.4,0); pot(F,q[0],W2.Hb,q[1],1.2,ADOBEREDC[1]); }
      else { /* two rooms and a walled yard */
        M=mudRoom(F,-2.5,-2.1,0, 4.9,4.0,3.3,col,{door:0.3,torons:3,band:band});
        var R2=mudRoom(F,2.2,-2.4,0, 4.6,3.7,2.8,shade(col,-0.05),{door:-0.2,horns:false,par:false,win:1.5,spouts:1});
        var wc=shade(col,-0.02), x0=-5.0, x1=4.6, zY=3.9;
        F.box(x0,0,0.9, 0.34,1.35,6.3, 0, wc,'adobe'); F.box(x1,0,1.0, 0.34,1.35,6.1, 0, wc,'adobe');
        F.box((x0-0.9)/2,0,zY, -0.9-x0,1.35,0.34, 0, wc,'adobe'); F.box((x1+0.7)/2,0,zY, x1-0.7,1.35,0.34, 0, wc,'adobe');
        F.dome(-0.9,1.3,zY, 0.34,0.4, 0, wc,'adobe'); F.dome(0.7,1.3,zY, 0.34,0.4, 0, wc,'adobe');
        F.box(-0.1,0,zY, 1.4,0.3,0.3, 0, shade(wc,-0.1),'adobe');                           /* stile sill */
        ladder(F,-3.9,1.3, -3.9,-2.1+M.zf(M.Hb)+0.06, M.Hb+0.5, 1,0); roofLife(M,0,false);
        fire(F,2.6,1.6); pot(F,3.8,0,0.2,1.3,ADOBEREDC[2]); }
    } });

  /* ---------------------------------------------------------------- 5. POOR FAMILY COMPOUND */
  ASSET({ key:'poor_compound', name:'Mud-walled family compound', family:'poor', districts:['poor'], wealth:[0,0.35], w:18, d:16, h:7, variants:2,
    build:function(F){
      var v=F.variant, col=F.pick(ADOBEC), wc=shade(col,-0.03), g=0.17, RW=7.45;
      F.sector('adobe',0,0, RW-0.4,RW, PI/2+g,PI/2+TAU-g, 0,1.4, wc, {faces:'tios',step:2.0});
      F.sector('adobe',0,0, RW-0.36,RW-0.04, PI/2-g,PI/2+g, 0,0.4, shade(wc,-0.1), {faces:'tio',step:2.0});       /* the stile */
      [-1,1].forEach(function(s){ var a=PI/2+s*(g+0.035); F.fr5(Math.cos(a)*(RW-0.2),0,Math.sin(a)*(RW-0.2), 0.8,1.7,0.8, 0, wc,'adobe'); F.dome(Math.cos(a)*(RW-0.2),1.62,Math.sin(a)*(RW-0.2),0.3,0.34,0,wc,'adobe'); });
      if(F.wealth>0.2) F.sector('paintbw',0,0, RW,RW+0.03, PI/2+g+0.12,PI/2+1.25, 0.45,1.15, 0xffffff, {faces:'o',step:2.0}), F.sector('paintbw',0,0, RW,RW+0.03, PI/2-1.25,PI/2-g-0.12, 0.45,1.15, 0xffffff, {faces:'o',step:2.0});
      doorPt(F,0,RW,0,1, 1.2,1.8,0,'court');                                   /* the stile into the yard */
      if(v===0){ [[-PI/2,2.3,4.4],[PI+0.35,2.0,4.6],[-0.3,1.85,4.75]].forEach(function(h,i){ var x=Math.cos(h[0])*h[2], z=Math.sin(h[0])*h[2];
          coneHut(F,x,z,h[1], 2.1, h[1]*2.0+0.8, 0, h[0]+PI, i===1?F.pick(ADOBEREDC):col, 'adobe', {}); });
        granary(F,3.8,-4.8,0.72,0,shade(col,0.05),false); }
      else { var A=mudRoom(F,0.3,-4.5,0, 5.2,3.2,3.0,col,{door:-0.8,torons:3,toronX:1.2,spouts:1});
        mudRoom(F,-4.7,0.4,PI/2, 4.2,2.9,2.7,shade(col,-0.05),{door:0.5,horns:'front',par:true});
        coneHut(F,4.4,0.6,1.85, 2.0,4.4, 0, PI+0.2, F.pick(ADOBEREDC), 'adobe', {});
        ladder(F,2.2,-1.6, 2.2,-4.5+A.zf(A.Hb)+0.06, A.Hb+0.5, 1,0);
        granary(F,-3.6,-4.4,0.72,0,shade(col,0.05),false); }
      fire(F,0.4,0.6);
      F.box(-1.3,0,1.6, 1.9,0.05,0.95, 0.5, THATCHC[2], 'thatch');                             /* sleeping mat */
      pot(F,1.9,0,1.3,1.2,ADOBEREDC[1]); pot(F,2.5,0,0.5,0.8,ADOBEREDC[3]);
      /* a little shade rack by the gate */
      [[2.6,4.2],[4.5,3.4],[3.2,5.5],[4.9,4.5]].forEach(function(p){ F.rod(p[0],0,p[1],p[0],1.9,p[1],0.06,TIMBERC[1],'timber'); });
      F.beam(2.95,1.95,4.9, 4.9,1.9,4.05, 1.9,0.14, THATCHC[3], 'thatch');
    } });

  /* ---------------------------------------------------------------- 6-10. PROPS */
  ASSET({ key:'prop_granary', name:'Granary on stilts', family:'prop', districts:['poor','market'], wealth:[0,0.4], w:3, d:3, h:4.6, variants:2,
    build:function(F){ granary(F,0,0,F.variant?1.0:1.12,0,F.variant?F.pick(ADOBEREDC):F.pick(ADOBEC),F.variant===1);
      if(F.variant===0){ F.rod(1.15,0,1.2, 0.75,2.3,0.55, 0.045,TIMBERC[2],'timber'); F.rod(1.25,0,0.75, 0.85,2.3,0.2, 0.045,TIMBERC[2],'timber'); } } });

  ASSET({ key:'prop_hangar', name:'Shade shelter (hangar)', family:'prop', districts:['poor','market'], wealth:[0,0.5], w:5, d:4, h:3, variants:1,
    build:function(F){
      [[-2.0,-1.5],[2.0,-1.5],[-2.0,1.5],[2.0,1.5],[0,-1.5],[0,1.5]].forEach(function(p){ forkPost(F,p[0],p[1],2.1+(p[1]<0?0.12:0),0,1); });
      [-2.0,0,2.0].forEach(function(x){ F.rod(x,2.36,-1.85, x,2.2,1.85, 0.06, TIMBERC[0],'timber'); });
      for(var i=0;i<5;i++){ var z=-1.6+i*0.8; F.rod(-2.3,2.42-(z+1.6)*0.04,z, 2.3,2.4-(z+1.6)*0.04,z+F.rr(-0.1,0.1), 0.04, TIMBERC[2],'timber'); }
      /* loose mats and thatch laid over the poles, each bundle sagging its own way */
      for(var m=0;m<6;m++){ var x=-1.95+m*0.78+F.rr(-0.05,0.05), sag=F.rr(0.06,0.22);
        F.beam(x,2.54-sag*0.4,-1.9-F.rr(0,0.2), x+F.rr(-0.1,0.1),2.40-sag,1.85+F.rr(0,0.25), F.rr(0.7,0.95),F.rr(0.1,0.16), F.pick(THATCHC),'thatch');
        if(F.chance(0.55)) F.beam(x+F.rr(-0.25,0.25),2.60-sag*0.3,F.rr(-1.4,-0.2), x+F.rr(-0.3,0.3),2.44-sag,F.rr(0.6,1.9), F.rr(0.35,0.6),0.07, shade(F.pick(THATCHC),-0.2),'thatch'); }
      F.box(-0.2,0.42,-1.0, 2.6,0.08,0.5, 0, PLANKC[1],'plank'); [-1.2,0.8].forEach(function(x){ F.rod(x,0,-1.0,x,0.42,-1.0,0.12,TIMBERC[3],'timber'); });
      pot(F,1.5,0,0.9,1.1,ADOBEREDC[0]);
    } });

  ASSET({ key:'prop_animal_pen', name:'Thorn-fenced animal pen', family:'prop', districts:['poor'], wealth:[0,0.4], w:8, d:8, h:2.4, variants:1,
    build:function(F){
      var g=0.22, R=3.7, kerb=F.pick(PAL.adobeDark);
      F.sector('adobe',0,0, R-0.55,R-0.05, PI/2+g,PI/2+TAU-g, 0,0.42, kerb, {faces:'tios',step:1.6});
      /* stakes driven into the kerb, leaning out, with cut thorn branches woven between them */
      var NS=17;
      for(var i=0;i<NS;i++){ var a=PI/2+g+0.06+(TAU-2*g-0.12)*i/(NS-1), r=R-0.3, hgt=F.rr(1.0,1.5), lean=F.rr(0.06,0.24);
        F.rod(Math.cos(a)*r,0.2,Math.sin(a)*r, Math.cos(a)*(r+lean),0.2+hgt,Math.sin(a)*(r+lean), 0.05, TIMBERC[i%4],'timber');
        for(var b=0;b<4;b++){ var a2=a+(TAU-2*g)/(NS-1)*F.rr(0.6,1.5), y1=0.2+b*0.32+F.rr(-0.08,0.12), y2=y1+F.rr(-0.22,0.22), rr3=r+F.rr(-0.16,0.26);
          F.beam(Math.cos(a)*r,0.2+y1,Math.sin(a)*r, Math.cos(a2)*rr3,0.2+y2,Math.sin(a2)*rr3, F.rr(0.18,0.34),F.rr(0.08,0.14), F.pick(THORNC),'thatch'); }
        if(F.chance(0.85)){ var ab=a+F.rr(-0.12,0.12), yb=0.2+F.rr(0.9,1.55);
          F.beam(Math.cos(ab)*(r-0.1),yb,Math.sin(ab)*(r-0.1), Math.cos(ab)*(r+F.rr(0.35,0.7)),yb+F.rr(0.15,0.5),Math.sin(ab)*(r+0.5), 0.09,0.07, F.pick(THORNC),'thatch'); } }
      var gx=Math.cos(PI/2-g)*(R-0.2), gz=Math.sin(PI/2-g)*(R-0.2);
      [0.5,0.95].forEach(function(y){ F.beam(-gx-0.1,y,gz, gx+0.1,y+0.06,gz, 0.12,0.08, F.pick(THORNC),'thatch'); });
      /* lean-to against the back of the ring */
      [[-1.5,-1.0],[1.5,-1.0]].forEach(function(p){ forkPost(F,p[0],p[1],1.7,1,0); }); F.rod(-1.8,2.0,-1.0, 1.8,2.0,-1.0, 0.055,TIMBERC[0],'timber');
      F.beam(0,1.25,-3.1, 0,2.12,-0.75, 3.6,0.14, THATCHC[2],'thatch');
      F.box(1.6,0,1.2, 1.5,0.32,0.5, 0.5, PLANKC[3],'plank'); F.box(1.6,0.26,1.2, 1.3,0.05,0.34, 0.5, VOIDC[0],'dark');       /* trough */
      F.edome(-1.3,0,0.6, 0.9,0.4,0.7, 0.3, THATCHC[0],'thatch');                                                         /* fodder heap */
    } });

  ASSET({ key:'prop_well', name:'Mud-kerbed well', family:'prop', districts:['poor','market'], wealth:[0,0.5], w:4, d:4, h:3, variants:1,
    build:function(F){
      var col=F.pick(ADOBEC);
      F.cyl(0,0,0, 1.85,0.07, 0, shade(col,-0.22),'adobe');
      F.sector('adobe',0,0, 0.62,1.0, 0,TAU, 0,0.62, col, {faces:'tio'});
      F.cyl(0,0,0, 0.66,0.3, 0, VOIDC[2],'dark');
      forkPost(F,-1.35,0,2.2,0,1); forkPost(F,1.35,0,2.2,0,1); F.rod(-1.6,2.3,0, 1.6,2.3,0, 0.06,TIMBERC[2],'timber');
      F.rod(0.1,2.3,0, 0.1,0.95,0, 0.02,PLANKC[2],'timber'); F.lathe('plank',0.1,0,[[0.13,0.62],[0.17,0.95]],PLANKC[3],{seg:6});
      pot(F,1.2,0.06,1.3,1.2,ADOBEREDC[1]); pot(F,0.55,0.06,1.6,0.9,ADOBEREDC[2]); pot(F,-1.3,0.06,1.2,1.0,ADOBEREDC[0]);
    } });

  ASSET({ key:'poor_shack', name:'Lean-to shack of salvage', family:'poor', districts:['poor'], wealth:[0,0.15], w:5, d:4, h:3, variants:2,
    build:function(F){
      var v=F.variant, col=F.pick(PAL.adobeDark);
      F.fr8(0,0,-1.55, 4.7,2.4,0.6, 0, col,'adobe');
      [-1.95,1.95].forEach(function(x){ F.rod(x,0,1.35, x,1.85,1.35, 0.06,TIMBERC[1],'timber'); }); F.rod(-2.2,1.82,1.35, 2.2,1.86,1.35, 0.05,TIMBERC[0],'timber');
      if(v===0){ /* a tarnished Ancient panel for a roof, matting for walls */
        F.beam(0,2.42,-1.6, 0,1.9,1.75, 4.4,0.07, F.pick(TARNC),'metal'); F.beam(0,2.47,-0.5, 0,2.29,0.55, 4.46,0.05, TARNC[3],'metal');
        F.box(-2.05,0,-0.05, 0.08,1.9,2.7, 0, THATCHC[3],'thatch'); F.box(2.05,0,-0.5, 0.08,1.85,1.7, 0, THATCHC[1],'thatch');
        F.box(-1.0,0,1.38, 1.9,1.7,0.07, 0, THATCHC[4],'thatch');
        F.box(1.05,0.75,1.4, 1.1,1.05,0.04, 0, F.pick(CLOTHC),'cloth');
        rockAt(F,-1.2,0.2,0.3); F.fr5(-1.3,2.1,0.4, 0.4,0.25,0.35, 0.4, ROCKC[0],'rock'); F.fr5(1.4,2.22,-0.3, 0.45,0.25,0.35, 1.0, ROCKC[2],'rock'); }
      else { /* rusted panels for walls, thatch thrown over poles */
        F.box(-2.05,0,-0.1, 0.07,2.1,2.8, 0, F.pick(RUSTC),'rust'); F.box(-2.0,0.9,-0.1, 0.1,0.12,2.84, 0, PAL.rustStain[0],'rust');
        F.box(1.0,0,1.38, 2.0,1.75,0.07, 0, RUSTC[3],'rust'); F.box(1.0,1.2,1.4, 2.04,0.1,0.1, 0, PAL.rustStain[1],'rust');
        F.box(2.05,0,-0.3, 0.08,1.85,2.2, 0, THATCHC[3],'thatch');
        /* loose thatch thrown over the poles: every strip sags and overhangs by a different amount */
        for(var t=0;t<7;t++){ var x=-1.80+t*0.60+F.rr(-0.05,0.05), wq=F.rr(0.55,0.82), sag=F.rr(0.10,0.30), ov=F.rr(0.0,0.30);
          F.beam(x,2.46-sag*0.5,-1.60-F.rr(0,0.22), x+F.rr(-0.10,0.10),2.02-sag,1.60+ov, wq,F.rr(0.09,0.16), F.pick(THATCHC),'thatch');
          if(F.chance(0.6)) F.beam(x+F.rr(-0.18,0.18),2.30-sag*0.4,F.rr(-0.9,0.3), x+F.rr(-0.22,0.22),1.94-sag,1.66+ov*0.5, F.rr(0.3,0.5),0.07, shade(F.pick(THATCHC),-0.18),'thatch'); }
        F.beam(-2.25,2.48,-1.0, 2.25,2.40,-1.05, 0.14,0.12, TIMBERC[0],'timber');                 /* the ridge pole, showing through */
        for(var t2=0;t2<4;t2++){ var xr=-1.5+t2*1.0; F.beam(xr,2.38-F.rr(0,0.1),1.50, xr+F.rr(-0.2,0.2),1.86,1.82+F.rr(0,0.14), F.rr(0.18,0.34),0.06, shade(F.pick(THATCHC),-0.28),'thatch'); }
        F.box(-1.0,0.8,1.4, 1.0,1.0,0.04, 0, F.pick(CLOTHC),'cloth'); }
      F.box(0,0,0, 3.6,0.04,2.2, 0, VOIDC[1],'dark');                                       /* the shadowed floor */
      pot(F,1.5,0,0.5,0.9,ADOBEREDC[1]); doorPt(F,v?-1.0:1.05,1.4,0,1);
    } });
})();
