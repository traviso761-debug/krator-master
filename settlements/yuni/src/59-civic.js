/* ============================== 16e. ASSETS: CIVIC, NEO-AFRICAN AND PARK PIECES ==============================
   Agent "civic". Families 'civic' (the Order's public buildings, Djenne/Sankore types, bathhouse, bell tower)
   and 'park' (the Parc-Guell-like kit). Geometry only through F (+ push/beamQuat for a wall-facing disc).  */
reseed(590001);
(function(){
  var PI=Math.PI;
  /* ---------- helpers (all LOCAL coordinates) ---------- */
  /* a disc / short cylinder whose axis is the horizontal LOCAL direction (nx,nz): round windows, medallions */
  function hdisc(F, lx,ly,lz, nx,nz, r, len, col, fam, sink){ var s=sink==null?0.3:sink, a=F.P(lx-nx*s,ly,lz-nz*s), b=F.P(lx+nx*len,ly,lz+nz*len);
    push('cyl', fam||'adobe', [a.x,a.y,a.z, r, Math.hypot(b.x-a.x,b.z-a.z), r, beamQuat(a.x,a.y,a.z,b.x,b.y,b.z), col]); }
  /* circular window: relief ring + dark disc + a pane that lights at night */
  function rwin(F, lx,ly,lz, nx,nz, r, ringCol){ hdisc(F,lx,ly,lz,nx,nz, r*1.38, 0.14, ringCol, 'relief'); hdisc(F,lx,ly,lz,nx,nz, r, 0.20, VOIDC[0], 'dark');
    var p=F.P(lx+nx*0.27,ly,lz+nz*0.27), n=F.dir(nx,nz); WINPANE(p.x,p.y,p.z, n[0],n[1], r*1.25, r*1.25, false); }
  /* a door at any height (F.door is ground-only) */
  function doorAt(F, lx,ly,lz, nx,nz, w,h, col){ return F.door(lx,lz, nx,nz, w,h, col, ly); }   /* the working, tagged door (53-assets.js) */
  /* brass studs on a door leaf facing +z */
  function studs(F, lx,ly,lz, w,h, col){ for(var i=0;i<3;i++) for(var j=0;j<4;j++) F.box(lx+(i-1)*w*0.3, ly+h*(0.14+j*0.22), lz+0.06, 0.10,0.10,0.09, 0, col!=null?col:GILDC[0], 'metal'); }
  /* parameters at equal arc length round an ellipse */
  function ellT(a,b,n){ var M=720, L=[0], i, px=a, pz=0; for(i=1;i<=M;i++){ var t=i/M*TAU, x=a*Math.cos(t), z=b*Math.sin(t); L.push(L[i-1]+Math.hypot(x-px,z-pz)); px=x; pz=z; }
    var out=[], j=0; for(i=0;i<n;i++){ var s=L[M]*i/n; while(L[j+1]<s) j++; out.push((j+(s-L[j])/(L[j+1]-L[j]))/M*TAU); } return out; }
  function ewall(F, fam, cx,cz, a,b, y0,y1, seg, col){ var ts=ellT(a,b,seg); for(var i=0;i<seg;i++){ var t0=ts[i], t1=ts[(i+1)%seg], tm=(t0+(i+1<seg?t1:TAU))/2;
    F.quad(fam, [cx+a*Math.cos(t0),y0,cz+b*Math.sin(t0)], [cx+a*Math.cos(t1),y0,cz+b*Math.sin(t1)], [cx+a*Math.cos(t1),y1,cz+b*Math.sin(t1)], [cx+a*Math.cos(t0),y1,cz+b*Math.sin(t0)], col, [Math.cos(tm)/a,0,Math.sin(tm)/b]); } }
  /* a thin roof plate with a WAVY rim (flat-shaded, closed): the CCSE roof and the louvre rings */
  function wavyRoof(F, fam, cx,cz, a,b, y, th, crown, amp,k,ph, seg, colTop, colUnder, famUnder){
    function rim(i){ var t=i/seg*TAU, m=1+amp*Math.cos(k*t+ph); return [cx+a*m*Math.cos(t), cz+b*m*Math.sin(t)]; }
    for(var i=0;i<seg;i++){ var p=rim(i), q=rim(i+1), tm=(i+0.5)/seg*TAU;
      F.tri(fam, [cx,y+th+crown,cz], [p[0],y+th,p[1]], [q[0],y+th,q[1]], colTop, [0,1,0]);
      F.quad(fam, [p[0],y,p[1]], [q[0],y,q[1]], [q[0],y+th,q[1]], [p[0],y+th,p[1]], shade(colTop,-0.06), [Math.cos(tm),0,Math.sin(tm)]);
      F.tri(famUnder||fam, [cx,y,cz], [p[0],y,p[1]], [q[0],y,q[1]], colUnder, [0,-1,0]); } }
  function palm(F, lx,lz, h){ F.tree(lx,lz,'palm',h); }
  function shrub(F, lx,lz, s){ F.tree(lx,lz,'shrub',s); }
  function cypress(F, lx,lz, h){ F.tree(lx,lz,'cypress',h); }
  function mosCol(F,i){ var S=[MOSBLUEC[0],MOSWARMC[0],MOSGREENC[0],PAL.mosaicWhite[0],MOSBLUEC[3],MOSWARMC[1],MOSGREENC[1],MOSWARMC[3],MOSBLUEC[1],MOSWARMC[2]]; return S[((i%S.length)+S.length)%S.length]; }
  var STONEW = shade(PAL.adobe[2],0.18);                                   /* warm rough stone for the Guell pieces */

  /* =====================================================================================================
     1. ARCHIVE OF THE ORDER  (CCSE-inspired)
     ===================================================================================================== */
  ASSET({ key:'civic_archive', name:'Archive of the Order', family:'civic', districts:['core','prosper'], wealth:[0.6,1], w:60, d:44, h:35, variants:1,
    build:function(F){
      var cz=-4, a=27, b=15.5, H=6.4, red=ADOBEREDC[0], red2=ADOBEREDC[2], pale=PAL.whitewash[1];
      ewall(F,'dark', 0,cz, a-0.95,b-0.95, 0,H, 44, VOIDC[1]);                               /* the recessed dark glazing line */
      ewall(F,'adobe', 0,cz, a-0.2,b-0.2, 0,0.7, 44, shade(red,-0.2));                         /* brick plinth */
      ewall(F,'adobe', 0,cz, a-0.2,b-0.2, H-1.0,H, 44, red);                                   /* brick head band under the roof */
      var n=38, ts=ellT(a,b,n);
      for(var i=0;i<n;i++){ var t=ts[i], nx=Math.cos(t)/a, nz=Math.sin(t)/b, nl=Math.hypot(nx,nz); nx/=nl; nz/=nl;
        var px=a*Math.cos(t), pz=cz+b*Math.sin(t), front=Math.abs(t-PI/2)<0.10;
        if(!front) F.fr8(px-nx*0.45, 0, pz-nz*0.45, 1.45, H, 1.5, Math.atan2(nx,nz), (i%2)?red:red2, 'adobe');   /* the fin-piers */
        if(i%2===1 && !front){ var t2=(ts[i]+ts[(i+1)%n])/2; if(i+1===n) t2=(ts[i]+TAU)/2; var wx=(a-0.9)*Math.cos(t2), wz=cz+(b-0.9)*Math.sin(t2), mx=Math.cos(t2)/a, mz=Math.sin(t2)/b, ml=Math.hypot(mx,mz);
          F.window(wx,3.0,wz, mx/ml,mz/ml, 1.0,4.2); } }
      /* portal */
      F.archwall('adobe', 0,0,cz+b+0.1, 0, 7.0,H-0.1,1.8, 3.8,5.0, red2, { colIn:shade(red,-0.3) });
      F.archband('plaster', 0,0,cz+b+1.03, 0, 3.8,5.0, 0.4,0.15, pale);
      F.door(0, cz+b-0.75, 0,1, 3.0,3.4, PLANKC[1]); studs(F, 0,0,cz+b-0.71, 3.0,3.4);
      F.lantern(-2.6,3.2,cz+b+1.35, 0.9,14,0); F.lantern(2.6,3.2,cz+b+1.35, 0.9,14,0);
      /* the broad wavy roof: pale top, timber-slat soffit */
      wavyRoof(F,'plaster', 0,cz, 28.7,17.2, H, 0.75, 1.7, 0.03,14,0, 56, pale, PLANKC[2], 'plank');
      ewall(F,'adobe', -7,cz, 11.5,7.0, H+1.2,H+3.6, 28, red2); ewall(F,'dark', -7,cz, 11.56,7.06, H+2.0,H+3.0, 28, VOIDC[1]);
      for(var cl=0;cl<14;cl++){ var ct=cl/14*TAU+0.2, cnx=Math.cos(ct)/11.5, cnz=Math.sin(ct)/7.0, cnl=Math.hypot(cnx,cnz); F.box(-7+11.5*Math.cos(ct),H+1.9,cz+7.0*Math.sin(ct), 1.5,1.2,0.5, Math.atan2(cnx/cnl,cnz/cnl), red, 'adobe'); }
      wavyRoof(F,'plaster', -7,cz, 12.8,8.2, H+3.6, 0.5, 0.9, 0.04,9,0.5, 36, pale, PLANKC[2], 'plank');
      /* the drum tower with its stack of wavy louvre rings */
      var tx=9, tz=cz-1.5;
      F.lathe('adobe', tx,tz, [[3.5,5.5],[3.4,14],[3.2,24],[3.0,31.0],[2.4,31.8]], red, { seg:18 });
      for(var r=0;r<8;r++){ var ry=9.6+r*2.85, rr2=6.3-r*0.30, ph=r*0.95;
        wavyRoof(F,'metal', tx+Math.cos(ph)*0.55, tz+Math.sin(ph)*0.55, rr2,rr2, ry, 0.6, 0.25, 0.085,3,ph*1.7, 24, METALC[r%4], TARNC[r%4], 'metal'); }
      for(var s=0;s<8;s++){ var sa=s/8*TAU+0.3; F.window(tx+Math.cos(sa)*3.35, 7.9+ (s%2)*0.0, tz+Math.sin(sa)*3.35, Math.cos(sa),Math.sin(sa), 0.7,1.5); }
      wavyRoof(F,'metal', tx,tz, 4.3,4.3, 31.6, 0.7, 0.5, 0.06,3,1.0, 24, METALC[2], TARNC[0], 'metal');
      F.cyl(tx,32.5,tz, 0.12,2.0, 0, BRASSC[0], 'metal'); F.ball(tx,34.6,tz, 0.3, BRASSC[1], 'metal');
      /* planted forecourt */
      F.box(0,0,17.0, 5.2,0.07,9.6, 0, PAL.pavingRich[0], 'adobe');
      [-1,1].forEach(function(sg){ F.edome(sg*13.5,0,17.6, 9.5,0.45,3.6, 0, PAL.shrub[1], 'leafy');
        palm(F, sg*8, 18.4, F.rr(6,7.5), sg*0.06); palm(F, sg*18.5, 17.2, F.rr(5,6.5), -sg*0.05);
        for(var k=0;k<5;k++) shrub(F, sg*(5.5+k*3.6), 16.4+((k*7)%3)*1.3, F.rr(0.9,1.5), k%2?PAL.flowerBed[k%4]:null);
        F.box(sg*3.4,0,19.5, 0.9,0.5,2.6, 0, shade(red,-0.1), 'adobe'); });
    } });

  /* =====================================================================================================
     2. CHAPTER HOUSE OF THE HISTORIANS  (Obieze-inspired drum compound)
     ===================================================================================================== */
  ASSET({ key:'civic_chapter_house', name:'Chapter house of the Historians', family:'civic', districts:['core','prosper'], wealth:[0.55,1], w:56, d:48, h:16, variants:1,
    build:function(F){
      var C=[0,2], red=ADOBEREDC[0], red2=ADOBEREDC[2], dk=ADOBEREDC[3], rel=shade(ADOBEREDC[2],0.14), tile=TILEC[0];
      function pol(r,a){ return [C[0]+r*Math.cos(a), C[1]+r*Math.sin(a)]; }
      /* courtyard paving */
      F.sector('adobe', C[0],C[1], 0,20.6, 0,TAU, 0,0.06, PAL.pavingRich[2], { faces:'t' });
      /* drum halls */
      function drum(x,z,R,H,big){
        F.lathe('adobe', x,z, [[R*1.04,0],[R,1.2],[R*0.985,H-0.5],[R*1.03,H]], red, { seg:20 });
        F.lathe('relief', x,z, [[R+0.06,H-2.0],[R+0.06,H-0.9]], rel, { seg:20 });
        var rb=R+0.85, rt=R*0.42, rh=big?2.7:2.2; F.mcone('tile', x,H,z, rb,rt,rh, tile, 20, { under:true, underDy:0.0 });
        F.cyl(x,H+rh-0.25,z, rt+0.25,0.3, 0, dk, 'adobe');                                  /* lantern floor closes the frustum */
        var lr=rt*0.82, lh=big?2.4:1.8; for(var i=0;i<8;i++){ var a=i/8*TAU; F.cyl(x+Math.cos(a)*lr, H+rh, z+Math.sin(a)*lr, 0.2,lh, 0, red2, 'adobe'); }
        F.cyl(x,H+rh,z, lr*0.45,lh, 0, VOIDC[1], 'dark');
        F.mcone('tile', x,H+rh+lh,z, rt+0.9,0,(big?2.2:1.7), TILEC[2], 12, { under:true });
        F.ball(x,H+rh+lh+(big?2.3:1.8),z, 0.22, BRASSC[1], 'metal');
        return H+rh+lh; }
      drum(0,-15.5, 7.5, 8.6, true); drum(-19,2, 6,6.6,false); drum(19,2, 6,6.6,false);
      /* round windows + door on the drums */
      [-0.9,-0.45,0.45,0.9].forEach(function(o){ var a=PI/2+o; rwin(F, 7.5*Math.cos(a)*0.99, 6.0, -15.5+7.5*Math.sin(a)*0.99, Math.cos(a),Math.sin(a), 0.75, rel); });
      F.door(0,-15.5+7.62, 0,1, 1.7,2.5, PLANKC[0]); F.archband('relief', 0,0,-15.5+7.72, 0, 2.1,2.9, 0.45,0.2, rel); studs(F,0,0,-15.5+7.66,1.7,2.5);
      [-1,1].forEach(function(sg){ [0.35,1.05].forEach(function(o){ var a=(sg<0?PI:0)+sg*o; a = sg<0 ? PI-o : o; rwin(F, sg*19+6*Math.cos(a)*0.99, 4.6, 2+6*Math.sin(a)*0.99, Math.cos(a),Math.sin(a), 0.6, rel); });
        var da = sg<0 ? -0.35 : PI+0.35; F.door(sg*19+6.08*Math.cos(da), 2+6.08*Math.sin(da), Math.cos(da),Math.sin(da), 1.3,2.3, PLANKC[2]); });
      /* curved two-storey gallery wings */
      [[PI+0.31, PI+1.14],[TAU-1.14, TAU-0.31]].forEach(function(w){
        F.sector('adobe', C[0],C[1], 16.5,21.5, w[0],w[1], 0,3.3, red, { faces:'io', colInner:VOIDC[1] });
        F.sector('adobe', C[0],C[1], 16.5,21.5, w[0],w[1], 3.3,6.6, red2, { faces:'io' });
        F.sector('adobe', C[0],C[1], 16.25,21.75, w[0],w[1], 6.6,7.05, dk, { faces:'tbio' });
        F.sector('relief', C[0],C[1], 16.38,21.62, w[0],w[1], 3.15,3.5, rel, { faces:'bio' });
        var nb=4, da=(w[1]-w[0])/nb, bw=2*16.2*Math.tan(da/2)+0.06;
        for(var i=0;i<nb;i++){ var a=w[0]+da*(i+0.5), p=pol(16.22,a); F.archwall('adobe', p[0],0,p[1], Math.atan2(-Math.cos(a),-Math.sin(a)), bw,3.2,0.5, bw-1.0,2.65, red, { noBack:true, colIn:dk }); }
        for(var j=0;j<3;j++){ var a2=w[0]+(w[1]-w[0])*(j+0.5)/3, pi=pol(16.5,a2), po=pol(21.5,a2);
          rwin(F, pi[0],5.0,pi[1], -Math.cos(a2),-Math.sin(a2), 0.6, rel); rwin(F, po[0],5.0,po[1], Math.cos(a2),Math.sin(a2), 0.6, rel); rwin(F, po[0],1.9,po[1], Math.cos(a2),Math.sin(a2), 0.5, rel); }
        var am=(w[0]+w[1])/2, pl=pol(15.6,am); F.lantern(pl[0],2.7,pl[1], 0.8,12,0); });
      /* the carved forecourt wall and the round gate */
      [[0.30,1.395],[PI-1.395,PI-0.30]].forEach(function(w,wi){
        F.sector('relief', C[0],C[1], 20.5,21.5, w[0],w[1], 0,4.0, rel, { faces:'ios', step:2.5 });
        F.sector('adobe', C[0],C[1], 20.3,21.7, w[0],w[1], 4.0,4.3, dk, { faces:'tbios', step:2.5 });
        for(var g=0;g<4;g++){ var a=w[0]+(w[1]-w[0])*(g+0.5)/4, nx=Math.cos(a), nz=Math.sin(a), p=pol(21.5,a), yaw=Math.atan2(nx,nz), m=(g+wi)%4, hi=shade(rel,0.12);
          F.box(p[0]+nx*0.02,0.75,p[1]+nz*0.02, 2.7,2.7,0.24, yaw, red2, 'relief');                       /* glyph panel */
          var q=pol(21.62,a);
          if(m===0){ hdisc(F,q[0],2.1,q[1],nx,nz, 1.05,0.16, hi,'relief'); hdisc(F,q[0],2.1,q[1],nx,nz, 0.62,0.22, dk,'adobe'); hdisc(F,q[0],2.1,q[1],nx,nz, 0.25,0.30, hi,'relief'); }
          else if(m===1){ F.box(q[0]+nx*0.05,1.1,q[1]+nz*0.05, 1.5,1.5,0.16, [0,yaw,PI/4], hi,'relief'); F.box(q[0]+nx*0.10,1.62,q[1]+nz*0.10, 0.75,0.75,0.16, [0,yaw,PI/4], dk,'adobe'); }
          else if(m===2){ for(var bq=0;bq<3;bq++) F.box(q[0]+nx*0.05,1.05+bq*0.75,q[1]+nz*0.05, 2.0-bq*0.5,0.4,0.16, yaw, hi,'relief'); }
          else { hdisc(F,q[0],2.6,q[1],nx,nz, 0.6,0.16, hi,'relief'); F.box(q[0]+nx*0.05,1.0,q[1]+nz*0.05, 0.4,1.3,0.16, yaw, hi,'relief'); F.box(q[0]+nx*0.05,1.0,q[1]+nz*0.05, 1.7,0.4,0.16, yaw, hi,'relief'); } } });
      F.archwall('adobe', 0,0,23.0, 0, 7.6,6.0,1.7, 3.7,4.7, red, { pointed:2.7, colIn:dk, seg:16 });
      F.archband('relief', 0,0,23.88, 0, 3.7,4.7, 0.55,0.12, rel, { pointed:2.7 });
      hdisc(F, 0,5.35,23.85, 0,1, 0.42,0.12, shade(rel,0.1), 'relief', 0.1);
      F.edome(0,6.0,23.0, 3.8,0.8,0.85, 0, red, 'adobe');
      F.lantern(-2.7,3.0,24.0-0.0, 0.9,14,0); F.lantern(2.7,3.0,24.0, 0.9,14,0);
      /* reflecting pool, court rotunda, planting */
      F.sector('adobe', -8.5,9, 4.4,5.0, 0,TAU, 0,0.45, red2, { faces:'tio' }); F.sector('mosaic', -8.5,9, 0,4.4, 0,TAU, 0,0.3, MOSBLUEC[0], { faces:'t' });
      for(var i=0;i<8;i++){ var a=i/8*TAU; F.cyl(8.5+Math.cos(a)*3.3, 0, 8+Math.sin(a)*3.3, 0.24,3.2, 0, red2, 'adobe'); }
      F.cyl(8.5,0,8, 3.9,0.3, 0, red, 'adobe'); F.mcone('tile', 8.5,3.2,8, 4.5,0,2.2, tile, 16, { under:true });
      palm(F,-14,12,7,0.05); palm(F,14.5,13,6.2,-0.05); palm(F,-3,-3,7.5,0.04); shrub(F,-4.5,14.5,1.3); shrub(F,4,16,1.1); shrub(F,-12,4,1.4); shrub(F,13,1,1.2,PAL.flowerBed[1]);
    } });

  /* =====================================================================================================
     3. HALL OF RECORDS  (Djenne-type great hall)
     ===================================================================================================== */
  ASSET({ key:'civic_hall_records', name:'Hall of Records', family:'civic', districts:['core','prosper','market'], wealth:[0.4,1], w:50, d:40, h:19, variants:1,
    build:function(F){
      var mud=ADOBEC[0], mud2=ADOBEC[2], P=1.4, W=42, D=28, H=11, bz=-3, zf=bz+D/2, zb=bz-D/2;
      F.fr8(0,0,-0.7, 48,P,36.6, 0, ADOBEC[3], 'adobe');                                  /* plinth z -19..17.6 */
      /* a real flight of treads with a shadow line under each nose, between two painted pylons */
      for(var s=0;s<5;s++){ var ty=P-0.28*(s+1), tz=17.15+s*0.52;
        F.box(0,0,tz, 14.6,ty,0.56, 0, ADOBEC[1], 'adobe'); F.box(0,ty-0.09,tz+0.30, 14.6,0.10,0.10, 0, PAL.adobeDark[1], 'adobe'); }
      [-8.4,8.4].forEach(function(px){ F.fr8(px,0,17.9, 2.3,P+2.3,2.3, 0, mud2, 'adobe');
        F.box(px,0.25,19.06, 1.5,2.2,0.18, 0, 0xf0e6d0, 'paintcol'); F.box(px,P+2.2,17.9, 2.5,0.4,2.5, 0, MOSBLUEC[0], 'mosaic');
        F.cone(px,P+2.55,17.9, 0.7,1.5, 0, mud2,'adobe'); F.ball(px,P+4.3,17.9, 0.32, GILDC[0],'metal'); });
      F.box(0,P,bz, W,H,D, 0, mud, 'adobe');
      /* --- COLOUR: a blue-and-white tiled dado round the plinth --- */
      for(var dq=0;dq<16;dq++){ var dc=(dq%2)?MOSBLUEC[0]:PAL.mosaicWhite[0];
        F.box(-22.5+dq*3.0, 0.18, 17.35, 2.9,0.95,0.4, 0, dc, 'mosaic'); F.box(-22.5+dq*3.0, 0.18, -18.75, 2.9,0.95,0.4, 0, (dq%2)?PAL.mosaicWhite[0]:MOSBLUEC[0], 'mosaic'); }
      for(var dr=0;dr<12;dr++){ var dz=-18.4+dr*3.0, dc2=(dr%2)?MOSBLUEC[2]:PAL.mosaicWhite[1];
        F.box(23.4,0.18,dz, 0.4,0.95,2.9, 0, dc2, 'mosaic'); F.box(-23.4,0.18,dz, 0.4,0.95,2.9, 0, dc2, 'mosaic'); }
      F.box(0,P+H,bz, W-1.2,0.12,D-1.2, 0, PAL.lane[1], 'adobe');                          /* roof deck */
      [[0,zf-0.4,W,0.8],[0,zb+0.4,W,0.8]].forEach(function(q){ F.box(q[0],P+H,q[1], q[2],1.0,q[3], 0, mud, 'adobe'); });
      [-1,1].forEach(function(sg){ F.box(sg*(W/2-0.4),P+H,bz, 0.8,1.0,D-1.6, 0, mud, 'adobe'); });
      /* --- COLOUR: polychrome painted panels between the pilasters, front, back and sides --- */
      var TOWX=[-12.25,0,12.25];
      for(var pq=0;pq<12;pq++){ var px2=-W/2+(pq+0.5)*W/12, clear=TOWX.every(function(tx){ return Math.abs(px2-tx)>3.5; });
        if(clear){ F.box(px2,P+2.5,zf+0.13, 2.05,5.0,0.16, 0, 0xf0e6d0, 'paintcol');
                   F.box(px2,P+2.3,zf+0.20, 2.35,0.30,0.16, 0, MOSWARMC[0], 'mosaic'); F.box(px2,P+7.6,zf+0.20, 2.35,0.30,0.16, 0, MOSWARMC[0], 'mosaic'); }
        F.box(px2,P+2.5,zb-0.13, 2.05,5.0,0.16, 0, 0xf0e6d0, (pq%2)?'paintbw':'paintcol'); }
      for(var ps=0;ps<8;ps++){ var pz=zb+(ps+0.5)*D/8; [-1,1].forEach(function(sg){
        F.box(sg*(W/2+0.13),P+2.5,pz, 0.16,5.0,2.05, 0, 0xf0e6d0, (ps%2)?'paintcol':'paintbw'); }); }
      /* --- COLOUR: mosaic string-courses at the floor line and round the parapet --- */
      [P+8.3, P+H+0.55].forEach(function(sy,si){ var sc=si?MOSWARMC[3]:MOSBLUEC[0], sc2=si?MOSBLUEC[0]:MOSGREENC[0];
        for(var sq=0;sq<14;sq++){ var sx=-W/2+(sq+0.5)*W/14, cc=(sq%2)?sc:sc2;
          F.box(sx,sy,zf+0.12, W/14-0.06,0.42,0.18, 0, cc, 'mosaic'); F.box(sx,sy,zb-0.12, W/14-0.06,0.42,0.18, 0, cc, 'mosaic'); }
        for(var sr=0;sr<10;sr++){ var sz2=zb+(sr+0.5)*D/10, cc2=(sr%2)?sc:sc2;
          F.box(W/2+0.12,sy,sz2, 0.18,0.42,D/10-0.06, 0, cc2, 'mosaic'); F.box(-W/2-0.12,sy,sz2, 0.18,0.42,D/10-0.06, 0, cc2, 'mosaic'); } });
      /* engaged pilasters with pinnacle tips, all round */
      function pil(x,z,k){ F.fr8(x,P,z, 1.5*k,H+1.0,1.5*k, 0, mud2, 'adobe'); F.cone(x,P+H+0.95,z, 0.62*k,1.7*k, 0, mud2, 'adobe'); F.ball(x,P+H+2.75*k,z, 0.19, GILDC[1], 'metal'); }
      var xs=[], i; for(i=0;i<=12;i++) xs.push(-W/2+i*W/12);
      xs.forEach(function(x,ix){ var k=(ix===0||ix===12)?1.25:1; pil(x,zb,k); pil(x,zf,k); });
      for(var vx=0;vx<6;vx++) for(var vz=0;vz<3;vz++) F.blob(-15+vx*6, P+H+0.1, bz-7+vz*7, 0.42,0.5, 0, (vx+vz)%2?TILEC[1]:mud2, (vx+vz)%2?'tile':'adobe');
      for(i=1;i<8;i++){ pil(-W/2, zb+i*D/8, 1); pil(W/2, zb+i*D/8, 1); }
      /* the three great tower-buttresses */
      [[-12.25,14.2],[0,16.2],[12.25,14.2]].forEach(function(t,ti){ var x=t[0], th=t[1], tz=zf+2.0, tw=5.6, td=5.0;
        F.fr8(x,P,tz, tw,th,td, 0, mud, 'adobe');
        function fz(y){ return tz+td/2*(1-0.16*y/th); } function fx(y){ return tw/2*(1-0.16*y/th); }
        [-1,1].forEach(function(sg){ F.fr8(x+sg*1.55,P,tz+td/2-0.25, 0.8,th+0.5,0.9, 0, mud2, 'adobe'); F.cone(x+sg*1.4,P+th+0.35,tz+td/2-0.62, 0.36,1.1, 0, mud2,'adobe'); });
        F.fr5(x,P+th,tz, 3.0,1.9,2.8, 0, mud2, 'adobe'); F.box(x,P+th+0.1,tz, 3.15,0.45,2.95, 0, (ti%2)?MOSGREENC[0]:MOSWARMC[0], 'mosaic');
        F.cone(x,P+th+1.8,tz, 0.7,1.5, 0, mud2, 'adobe'); F.cyl(x,P+th+3.05,tz, 0.30,0.28, 0, GILDC[0], 'metal'); F.ball(x,P+th+3.62,tz, 0.30, PAL.whitewash[2], 'plaster');
        for(var r=0;r<4;r++){ var y=3.2+r*(th-4.5)/3; for(var c=-1;c<=1;c++) F.toron(x+c*0.62, P+y, fz(y)-0.1, 0,1, 1.15);
          if(r%2===0) [-1,1].forEach(function(sg){ F.toron(x+sg*(fx(y)-0.1), P+y, tz, sg,0, 1.0); }); }
        F.box(x, P+th*0.45, fz(th*0.45)-0.12, 0.5,1.3,0.3, 0, VOIDC[0], 'dark');
        /* glazed tile set into the recessed panels of the tower face */
        for(var gt=0;gt<3;gt++){ var gy=P+2.6+gt*3.4, gzz=fz(gy)-0.06;
          F.box(x-1.35, gy, gzz, 0.9,1.5,0.12, 0, (gt%2)?MOSBLUEC[0]:MOSGREENC[0], 'mosaic');
          F.box(x+1.35, gy, gzz, 0.9,1.5,0.12, 0, (gt%2)?MOSWARMC[0]:MOSBLUEC[3], 'mosaic'); } });
      /* toron rows on the walls */
      for(i=0;i<12;i++) for(var k=1;k<4;k++){ var x=-W/2+(i+k/4)*W/12; [8.6,4.9].forEach(function(y,yi){ if((k+yi)%2===0 || yi===0){ F.toron(x,P+y,zb, 0,-1, 1.0); if(Math.abs(Math.abs(x)-12.25)>3.0 && Math.abs(x)>3.0) F.toron(x,P+y,zf, 0,1, 1.0); } }); }
      for(i=0;i<8;i++) for(k=1;k<3;k++){ var z=zb+(i+k/3)*D/8; [-1,1].forEach(function(sg){ F.toron(sg*W/2,P+8.6,z, sg,0, 1.0); if(k===1) F.toron(sg*W/2,P+4.9,z, sg,0, 1.0); }); }
      /* doors between the towers, windows */
      [-6.1,6.1].forEach(function(x){ doorAt(F, x,P,zf+0.02, 0,1, 1.9,3.0, PLANKC[3]); studs(F,x,P,zf+0.06,1.9,3.0); F.archband('mosaic', x,P,zf+0.22, 0, 2.4,3.5, 0.34,0.2, MOSBLUEC[0]); F.lantern(x+ (x<0?1.9:-1.9), P+3.0, zf+0.45, 0.9,14,0); });
      [-18.4,-15.6,15.6,18.4].forEach(function(x){ F.window(x,P+6.5,zf+0.03, 0,1, 0.7,1.5); });
      for(i=0;i<8;i+=1){ var wz=zb+(i+0.5)*D/8; if(i%2===0){ F.window(W/2+0.03,P+6.5,wz, 1,0, 0.7,1.5); F.window(-W/2-0.03,P+6.5,wz, -1,0, 0.7,1.5); } }
      doorAt(F, W/2+0.02,P,bz+1.75, 1,0, 1.5,2.5, PLANKC[1]);
    } });

