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

  /* =====================================================================================================
     4. SANKORE SPIRE
     ===================================================================================================== */
  ASSET({ key:'civic_sankore_spire', name:'Sankore spire', family:'civic', districts:['prosper','market','poor'], wealth:[0.2,0.8], w:16, d:16, h:22, variants:2,
    build:function(F){
      var white=F.variant===1, fam=white?'plaster':'adobe', c=white?WHITEC[0]:ADOBEC[1], c2=white?WHITEC[1]:ADOBEC[3], base=white?PAL.paintBlack[1]:PAL.adobeDark[0];
      var tz=-1.2, TW=7.8, TH=14.5;
      /* low prayer-hall / reading room behind, walled court in front */
      F.fr8(0,0,-4.2, 13.6,3.9,6.4, 0, c2, fam); F.box(0,3.85,-4.2, 10.6,0.1,4.6, 0, PAL.lane[0], 'adobe');
      [[-6.5,-7.1],[6.5,-7.1],[-6.5,-1.3],[6.5,-1.3]].forEach(function(p){ F.fr5(p[0]*0.97,0,p[1], 1.1,4.6,1.1, 0, c, fam); F.cone(p[0]*0.95,4.5,p[1], 0.36,1.0, 0, c, fam); });
      F.archwall(fam, 0,0,7.3, 0, 15.2,2.5,0.6, 1.9,2.2, c2, {});
      [-1,1].forEach(function(sg){ F.box(sg*7.3,0,0.2, 0.6,2.5,14.2, 0, c2, fam); F.fr5(sg*7.25,0,7.25, 1.0,3.2,1.0, 0, c, fam); F.cone(sg*7.2,3.1,7.2, 0.3,0.8,0,c,fam);
        F.fr5(sg*1.7,0,7.3, 0.9,3.1,0.9, 0, c, fam); F.cone(sg*1.68,3.0,7.28, 0.28,0.8,0,c,fam); });
      F.door(0,7.2, 0,1, 1.5,2.05, PLANKC[F.variant*2]); studs(F,0,0,7.24,1.5,2.05);
      if(white){ F.box(0,0,7.3, 15.3,0.7,0.72, 0, base, 'plaster'); }
      /* the pyramidal tower, two stages, bristling with toron */
      F.fr5(0,0,tz, TW,TH,TW, 0, c, fam); if(white) F.box(0,0,tz, TW+0.1,0.9,TW+0.1, 0, base, 'plaster');
      F.fr5(0,TH,tz, 3.4,4.8,3.4, 0, c, fam); F.cone(0,TH+4.7,tz, 0.95,2.2, 0, c, fam); F.ball(0,TH+7.05,tz, 0.24, PAL.whitewash[2], 'plaster');
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ F.cone(q[0]*1.72,TH-0.05,tz+q[1]*1.72, 0.3,0.9, 0, c, fam); });
      function hw(y){ return TW/2*(1-0.5*y/TH); }
      for(var r=0;r<7;r++){ var y=2.9+r*1.75, h=hw(y), n=Math.max(1,Math.floor(2*h/1.25)); for(var i=0;i<n;i++){ var o=(i-(n-1)/2)*1.2 + ((r%2)?0.3:-0.0)*(n>1?1:0);
        F.toron(o,y,tz+h-0.05, 0,1, 1.05); F.toron(o,y,tz-h+0.05, 0,-1, 1.05); F.toron(h-0.05,y,tz+o, 1,0, 1.05); F.toron(-h+0.05,y,tz+o, -1,0, 1.05); } }
      for(var r2=0;r2<2;r2++){ var y2=TH+1.4+r2*1.5, h2=1.7*(1-0.5*(y2-TH)/4.8); [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(nn){ F.toron(nn[0]*(h2-0.05), y2, tz+nn[1]*(h2-0.05), nn[0],nn[1], 0.9); }); }
      F.fr8(0,0,tz+hw(0)-0.1, 1.9,2.6,1.2, 0, c2, fam); F.door(0,tz+hw(0)+0.46, 0,1, 0.95,1.9, PLANKC[3]);
      F.box(0,8.2,tz+hw(8.2)-0.12, 0.45,1.0,0.3, 0, VOIDC[0],'dark');
      F.lantern(1.5,2.4,7.75, 0.8,12,0); shrub(F,-4.6,4.6,0.9); if(F.wealth>0.4) cypress(F,4.8,4.4,5.5);
    } });

  /* =====================================================================================================
     5. BATHHOUSE / CISTERN
     ===================================================================================================== */
  ASSET({ key:'civic_bathhouse', name:'Bathhouse of the mosaic domes', family:'civic', districts:['prosper','market'], wealth:[0.4,0.95], w:24, d:18, h:9, variants:1,
    build:function(F){
      var wash=WHITEC[1], H=3.5, bz=-2.6;
      F.box(0,0,bz, 18.4,H,10.4, 0, wash, 'plaster'); F.box(0,0,bz, 18.5,0.8,10.5, 0, BLUEDC[1], 'plaster');
      [[-9.2,bz-5.2],[9.2,bz-5.2],[-9.2,bz+5.2],[9.2,bz+5.2]].forEach(function(p){ F.cyl(p[0],0,p[1], 1.5,H+0.5, 0, wash,'plaster'); F.edome(p[0],H+0.5,p[1], 1.5,1.0,1.5, 0, MOSBLUEC[3],'mosaic'); F.cyl(p[0],0,p[1],1.54,0.8,0,BLUEDC[1],'plaster'); });
      F.box(0,H-0.02,bz, 18.6,0.45,10.6, 0, MOSBLUEC[2], 'mosaic');                               /* tile frieze / parapet */
      function dome(x,z,R,hh,col,nb){ F.cyl(x,H+0.3,z, R+0.15,0.75, 0, wash,'plaster'); F.edome(x,H+1.0,z, R,hh,R, 0, col,'mosaic');
        for(var i=0;i<nb;i++){ var a=i/nb*TAU+0.4, el=0.62; F.blob(x+Math.cos(a)*R*Math.cos(el)*0.97, H+1.0+hh*Math.sin(el)*0.97-0.05, z+Math.sin(a)*R*Math.cos(el)*0.97, 0.26,0.26, 0, GLASSC[i%4], 'glass'); }
        F.blob(x,H+1.0+hh-0.06,z, 0.34,0.3, 0, GLASSC[3],'glass'); }
      dome(0,bz, 4.3,3.7, MOSBLUEC[0], 8);
      dome(-6.4,bz-2.3, 2.3,2.1, MOSGREENC[0], 5); dome(6.4,bz-2.3, 2.3,2.1, MOSWARMC[0], 5);
      dome(-6.4,bz+2.5, 2.0,1.8, PAL.mosaicWhite[0], 5); dome(6.4,bz+2.5, 2.0,1.8, MOSBLUEC[4], 5);
      /* parabolic porch */
      F.archwall('plaster', 0,0,4.4, 0, 6.0,4.9,3.6, 3.3,4.0, wash, { colIn:BLUELC[0], seg:16 });
      F.archband('mosaic', 0,0,6.23, 0, 3.3,4.0, 0.5,0.12, MOSBLUEC[1]); F.edome(0,4.9,4.4, 3.0,1.1,1.8, 0, MOSBLUEC[3], 'mosaic');
      [-1,1].forEach(function(sg){ F.fr5(sg*3.1,0,6.0, 1.3,5.2,1.3, 0, wash,'plaster'); F.cone(sg*3.02,5.1,5.92, 0.4,1.2, 0, wash,'plaster'); F.box(sg*3.1,0,6.0, 1.36,0.8,1.36, 0, BLUEDC[1],'plaster'); });
      F.door(0,bz+5.22, 0,1, 1.6,2.4, PLANKC[0]); F.lantern(0,3.3,5.2, 0.9,12,0.6);
      [-6.2,6.2].forEach(function(x){ F.window(x,2.3,bz+5.23, 0,1, 0.7,1.2); F.archband('mosaic', x,1.55,bz+5.26, 0, 0.9,1.5, 0.22,0.06, MOSBLUEC[1]); });
      /* the cistern basin, furnace chimney, fuel stack */
      F.sector('mosaic', 8.2,5.6, 2.3,2.9, 0,TAU, 0,0.8, MOSBLUEC[1], { faces:'tio' }); F.sector('glass', 8.2,5.6, 0,2.3, 0,TAU, 0,0.55, GLASSC[2], { faces:'t' });
      F.lathe('plaster', -10.4,bz-3.0, [[1.0,0],[0.8,4],[0.55,7.6],[0.7,8.0],[0.45,8.4]], wash, { seg:10, cap:true }); F.cyl(-10.4,8.35,bz-3.0, 0.3,0.12, 0, VOIDC[0],'dark');
      for(var i=0;i<4;i++) F.rod(-9.6+i*0.0,0.2+i*0.32,3.6, -6.4,0.2+i*0.32,3.6+ (i%2)*0.2, 0.16, TIMBERC[i%4], 'timber');
      shrub(F,-8.6,6.4,1.0); F.cone(-4.6,0,6.6, 0.5,0.9,0, PAL.shrub[0],'leafy');
    } });

  /* =====================================================================================================
     6. WATCH-AND-BELL TOWER
     ===================================================================================================== */
  ASSET({ key:'civic_bell_tower', name:'Watch-and-bell tower', family:'civic', districts:['core','prosper','market','poor'], wealth:[0.2,1], w:8, d:8, h:22, variants:2,
    variantNames:['whitewashed','adobe'],
    build:function(F){
      var v=F.variant, col=v?ADOBEC[2]:WHITEC[0], fam=v?'adobe':'plaster', band=v?MOSWARMC[0]:MOSBLUEC[0], BH=v?6.2:5.0;
      var SH0=BH+0.9, SH1=SH0+7.2, BEL=SH1+3.4, R0=2.42, R1=1.92;        /* shaft foot, shaft head, belfry head */
      F.box(0,0,0, 6.4,0.18,6.4, 0, PAL.paving[1], 'adobe');
      /* ---- the arcaded base ---- */
      [0,PI/2,PI,-PI/2].forEach(function(f){ var sn=Math.sin(f), cs=Math.cos(f);
        F.arcade(fam, sn*2.95,0,cs*2.95, f, v?1:2, v?6.0:3.0,BH,0.8, col, { pier:v?1.9:0.9, head:1.1, colIn:shade(col,-0.3) });
        if(v) for(var tq=-2;tq<=2;tq++) F.toron(sn*3.3+cs*tq*0.9, BH-0.35, cs*3.3-sn*tq*0.9, sn,cs, 0.9); });
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ F.fr8(q[0]*3.1,0,q[1]*3.1, 1.5,BH+0.9,1.5, 0, col, fam); F.cone(q[0]*3.06,BH+0.85,q[1]*3.06, 0.5,1.2, 0, col, fam); });
      F.box(0,BH-0.02,0, 7.0,0.55,7.0, 0, band, 'mosaic'); F.box(0,BH+0.5,0, 6.6,0.2,6.6, 0, col, fam);
      /* ---- the shaft: two batters, a string course at the break, fluted, with slit lights ---- */
      F.lathe(fam, 0,0, [[R0+0.22,SH0-0.30],[R0,SH0],[R0-0.30,SH0+2.9],[R0-0.34,SH0+3.1],[R1+0.12,SH1-0.9],[R1,SH1],[R1+0.30,SH1+0.34]], col,
        { seg:18, rfn:function(q,ang){ return 1+0.045*Math.cos(ang*(v?6:8)); } });
      F.lathe('mosaic', 0,0, [[R0-0.16,SH0+2.95],[R0-0.16,SH0+3.55]], band, { seg:18 });                      /* the string course */
      F.lathe('relief', 0,0, [[R0+0.06,SH0+0.10],[R0+0.02,SH0+0.85]], shade(col,0.10), { seg:18 });
      F.lathe('mosaic', 0,0, [[R1+0.34,SH1+0.30],[R1+0.30,SH1+0.60]], PAL.mosaicWhite[0], { seg:18 });
      for(var sl=0;sl<4;sl++){ var sa=sl*1.32+0.4, sy=SH0+1.0+sl*1.75, sr=(sy<SH0+3.1?R0-0.22:R1+0.30);
        F.window(Math.cos(sa)*sr, sy, Math.sin(sa)*sr, Math.cos(sa),Math.sin(sa), 0.40,1.05, {noReveal:true});
        F.box(Math.cos(sa)*(sr+0.04), sy-0.78, Math.sin(sa)*(sr+0.04), 0.56,0.12,0.12, Math.atan2(Math.cos(sa),Math.sin(sa)), shade(col,0.08), fam); }
      /* ---- the BELFRY: a dark void behind four parabolic openings, with a bell you can read ---- */
      F.cyl(0, BEL-0.40, 0, R1-0.06, 0.42, 0, VOIDC[0], 'dark');                                             /* the dark ceiling of the belfry */
      F.cyl(0, SH1+0.22, 0, R1-0.06, 0.30, 0, VOIDC[1], 'dark');                                             /* and its dark floor */
      F.cyl(0, SH1+0.50, 0, 0.62, 2.1, 0, VOIDC[0], 'dark');                                                 /* a dark core behind the bell */
      [0,PI/2,PI,-PI/2].forEach(function(f){ var sn=Math.sin(f), cs=Math.cos(f);
        F.archwall(fam, sn*(R1-0.05), SH1+0.30, cs*(R1-0.05), f, 2.9,3.0,0.62, 2.05,2.45, col, { pointed:1.8, colIn:shade(col,-0.5), noTop:true });
        F.archband('mosaic', sn*(R1+0.26), SH1+0.30, cs*(R1+0.26), f, 2.05,2.45, 0.24,0.10, band);
        F.box(sn*(R1+0.05), SH1+0.22, cs*(R1+0.05), 3.0,0.26,0.26, f, PAL.mosaicWhite[0], 'mosaic');          /* belfry sill */
        F.fr8(sn*(R1+0.02)*1.02+cs*1.42, SH1+0.30, cs*(R1+0.02)*1.02-sn*1.42, 0.62,3.0,0.62, f, col, fam); });/* corner shafts */
      /* headstock, wheel and the bell itself, hung in the middle where every opening frames it */
      var BY=SH1+2.42;
      F.beam(-R1+0.2,BY,0, R1-0.2,BY,0, 0.30,0.34, TIMBERC[1], 'timber');
      F.box(0,BY-0.34,0, 1.05,0.34,0.62, 0, TIMBERC[0], 'timber');
      F.lathe('metal', 0,0, [[0.22,BY-0.52],[0.30,BY-0.40]], TARNC[0], { seg:8 });
      F.lathe('metal', 0,0, [[0.36,BY-2.05],[1.08,BY-1.86],[1.22,BY-1.05],[0.92,BY-0.58],[0.42,BY-0.38]], GILDC[0],
        { seg:14, rfn:function(q,ang){ return 1+0.02*Math.cos(ang*12); } });
      F.lathe('metal', 0,0, [[1.24,BY-1.94],[1.26,BY-1.74]], GILDC[2], { seg:14 });                           /* the sound bow catches the light */
      F.ball(0,BY-2.10,0, 0.22, GILDC[3],'metal');
      for(var wq=0;wq<2;wq++){ var wa=wq*PI/2; F.tube('timber', (function(){ var pts=[]; for(var k=0;k<=10;k++){ var t=k/10*TAU;
          pts.push({ x:Math.cos(wa)*0.78*Math.cos(t), y:BY-0.02+0.78*Math.sin(t), z:Math.sin(wa)*0.78*Math.cos(t), r:0.07 }); } return pts; })(), TIMBERC[2], { seg:5 }); }
      F.rod(0,BY-0.02,0, 0.0,BY-1.9,0.0, 0.03, TIMBERC[3], 'timber');
      /* ---- the cupola ---- */
      F.lathe('mosaic', 0,0, [[R1+0.34,BEL-0.20],[R1+0.30,BEL+0.20]], band, { seg:16 });
      F.edome(0, BEL+0.20, 0, R1+0.10, 2.1, R1+0.10, 0, band, 'mosaic');
      for(var cq=0;cq<10;cq++){ var ca=cq/10*TAU, el=0.55;
        F.blob(Math.cos(ca)*(R1+0.05)*Math.cos(el), BEL+0.20+2.1*Math.sin(el)-0.06, Math.sin(ca)*(R1+0.05)*Math.cos(el), 0.28,0.26, 0, (cq%2)?PAL.mosaicWhite[0]:MOSWARMC[0], 'mosaic'); }
      F.cyl(0, BEL+2.25, 0, 0.14,2.2, 0, BRASSC[0], 'metal'); F.ball(0, BEL+4.85, 0, 0.46, BRASSC[1], 'metal');
      /* ---- the stair turret, climbing to the belfry floor ---- */
      var TX=-2.62, TZ=0.0, TT=SH1+0.55;
      F.lathe(fam, TX,TZ, [[1.06,0],[1.00,BH],[1.04,BH+0.4],[0.96,SH0+3.0],[1.00,TT]], shade(col,-0.04), { seg:12, rfn:function(q,ang){ return 1+0.03*Math.cos(ang*5); } });
      F.lathe('mosaic', TX,TZ, [[1.08,BH+0.42],[1.08,BH+0.80]], band, { seg:12 });
      for(var tw=0;tw<6;tw++){ var ta=0.7+tw*1.15, ty=1.8+tw*2.0; if(ty>TT-1.0) break;
        F.window(TX+Math.cos(ta)*1.00, ty, TZ+Math.sin(ta)*1.00, Math.cos(ta),Math.sin(ta), 0.34,0.80, {noReveal:true}); }
      F.mcone('tile', TX,TT,TZ, 1.32,0.22,1.15, v?TILEC[2]:TILEC[0], 12, { under:true });
      F.ball(TX,TT+1.32,TZ, 0.16, GILDC[0], 'metal');
      F.door(TX+0.0, TZ+1.04, 0,1, 0.95,2.05, PLANKC[2]);
      F.lantern(2.0,3.3,3.55, 0.9,14,0); F.lantern(TX+1.3, 2.4, TZ+1.5, 0.7,10, 0);
    } });

  /* =====================================================================================================
     PARK  7. SERPENTINE BENCH TERRACE
     ===================================================================================================== */
  ASSET({ key:'park_serpentine_bench', name:'Serpentine bench terrace', family:'park', districts:['prosper'], wealth:[0.6,1], w:30, d:14, h:4, variants:1,
    build:function(F){
      var TH=1.3, N=64, X0=-14.4, X1=14.4, zb=-6.6, white=PAL.mosaicWhite[0];
      function cz(x){ return 2.6+2.3*Math.sin(x*TAU/9.6); }
      function pt(i){ var x=X0+(X1-X0)*i/N, z=cz(x), dz=2.3*TAU/9.6*Math.cos(x*TAU/9.6), l=Math.hypot(1,dz); return { x:x, z:z, nx:-dz/l, nz:1/l }; }   /* n = outward (front) normal */
      var top=[]; for(var i=0;i<N;i++){ var p=pt(i), q=pt(i+1), cA=mosCol(F,Math.floor(i/4)), cB=mosCol(F,Math.floor(i/4)+3), hint=[p.nx,0,p.nz], hin=[-p.nx,0,-p.nz];
        function o(P,d){ return [P.x-P.nx*d, P.z-P.nz*d]; }
        var p0=o(p,0), q0=o(q,0), p1=o(p,0.4), q1=o(q,0.4), p2=o(p,1.0), q2=o(q,1.0);
        F.quad('mosaic', [p0[0],0,p0[1]],[q0[0],0,q0[1]],[q0[0],TH,q0[1]],[p0[0],TH,p0[1]], white, hint);                     /* retaining face */
        F.quad('mosaic', [p0[0],TH,p0[1]],[q0[0],TH,q0[1]],[q0[0],TH+1.0,q0[1]],[p0[0],TH+1.0,p0[1]], cA, hint);             /* back of the bench, outside */
        F.quad('mosaic', [p1[0],TH+0.45,p1[1]],[q1[0],TH+0.45,q1[1]],[q1[0],TH+1.0,q1[1]],[p1[0],TH+1.0,p1[1]], cB, hin);   /* backrest */
        F.quad('mosaic', [p1[0],TH+0.45,p1[1]],[q1[0],TH+0.45,q1[1]],[q2[0],TH+0.45,q2[1]],[p2[0],TH+0.45,p2[1]], white, [0,1,0]);  /* seat */
        F.quad('mosaic', [p2[0],TH,p2[1]],[q2[0],TH,q2[1]],[q2[0],TH+0.45,q2[1]],[p2[0],TH+0.45,p2[1]], cA, hin);            /* seat front */
        F.quad('adobe', [p.x,TH,zb],[q.x,TH,zb],[q2[0],TH,q2[1]],[p2[0],TH,p2[1]], PAL.pavingRich[i%3===0?1:0], [0,1,0]);    /* terrace floor */
        top.push({ x:p.x-p.nx*0.2, y:TH+1.02, z:p.z-p.nz*0.2, r:0.27, col:cB }); }
      var e=pt(N); top.push({ x:e.x-e.nx*0.2, y:TH+1.02, z:e.z-e.nz*0.2, r:0.27 }); F.tube('mosaic', top, white, { seg:6, cap:true });
      /* ends and back */
      F.box(0,0,zb-0.2, 28.8,TH+0.9,0.4, 0, STONEW, 'rock');
      [X0,X1].forEach(function(x,k){ var z1=cz(x); F.box(x+(k?0.2:-0.2)*0,0,(zb+z1)/2, 0.4,TH+0.9,z1-zb, 0, STONEW, 'rock'); });
      for(var g=0;g<6;g++){ var gx=-12+g*4.8; F.cone(gx,TH+0.9,zb-0.2, 0.3,0.7,0, STONEW,'rock'); }
      /* life on the terrace */
      [-9.6,0,9.6].forEach(function(x,k){ F.lathe('mosaic', x,-3.4, [[0.5,TH],[0.75,TH+0.5],[0.6,TH+0.9]], mosCol(F,k*2+1), { seg:8 }); F.blob(x,TH+0.8,-3.4, 0.9,0.9, 0, PAL.shrub[k],'leafy'); });
      palm(F,-11.2,-4.6,6.5+TH,0.03); palm(F,11.2,-4.6,6+TH,-0.03);
      for(var d=0;d<3;d++){ var dx=-9.6+d*9.6+2.4; F.blob(dx, 0.75, cz(dx)+0.12, 0.22,0.3, 0, MOSBLUEC[2],'mosaic'); }                  /* drain spouts */
    } });

  /* =====================================================================================================
     PARK  8. HYPOSTYLE HALL
     ===================================================================================================== */
  ASSET({ key:'park_hypostyle', name:'Hypostyle hall of leaning columns', family:'park', districts:['prosper'], wealth:[0.6,1], w:24, d:18, h:8, variants:1,
    build:function(F){
      var CH=5.3, white=PAL.whitewash[0], tilew=PAL.mosaicWhite[1];
      F.box(0,0,0, 21.4,0.12,15.6, 0, PAL.pavingRich[1], 'adobe');
      for(var i=0;i<6;i++) for(var j=0;j<4;j++){ var x=-9+i*3.6, z=-5.1+j*3.4, ox=(i===0?-0.75:i===5?0.75:0), oz=(j===0?-0.75:j===3?0.75:0);
        F.tube('plaster', [{x:x+ox,y:0,z:z+oz,r:0.82,col:tilew},{x:x+ox*0.93,y:0.35,z:z+oz*0.93,r:0.74,col:tilew},{x:x+ox*0.7,y:1.6,z:z+oz*0.7,r:0.7,col:tilew},{x:x+ox*0.69,y:1.65,z:z+oz*0.69,r:0.68},
          {x:x+ox*0.12,y:4.5,z:z+oz*0.12,r:0.56},{x:x+ox*0.06,y:4.8,z:z+oz*0.06,r:0.62},{x:x,y:5.05,z:z,r:0.98},{x:x,y:CH,z:z,r:1.02}], white,
          { seg:10, rfn:function(q,ang){ return (q>=3&&q<=4) ? 1+0.035*Math.cos(ang*10) : 1; } }); }
      /* entablature + roof slab; the roof is a terrace, its wavy rim the bench */
      F.box(0,CH,0, 21.2,0.55,15.2, 0, white, 'plaster'); F.box(0,CH+0.55,0, 21.8,0.5,15.8, 0, tilew, 'mosaic');
      F.box(0,CH+1.04,0, 20.4,0.08,14.4, 0, PAL.pavingRich[0], 'adobe');
      var pts=[], M=96, hx=10.5, hz=7.4, rc=2.6, sx=hx-rc, sz2=hz-rc, per=4*sx+4*sz2+TAU*rc, nw=Math.round(per/4.4);
      function rrect(s){ s=((s%per)+per)%per; var segs=[[2*sz2,1,0],[PI/2*rc],[2*sx,0,1],[PI/2*rc],[2*sz2,-1,0],[PI/2*rc],[2*sx,0,-1],[PI/2*rc]];
        /* start at (hx,-sz2) going +z, corners turn toward -x, etc. */
        var cx=[0,sx,0,-sx,0,-sx,0,sx], czz=[0,sz2,0,sz2,0,-sz2,0,-sz2], a0=[0,0,0,PI/2,0,PI,0,-PI/2];
        var st=[[hx,-sz2,0,1,1,0],null,[sx,hz,-1,0,0,1],null,[-hx,sz2,0,-1,-1,0],null,[-sx,-hz,1,0,0,-1],null];
        for(var i=0;i<8;i++){ var L=segs[i][0]; if(s<=L){ if(st[i]){ var q=st[i]; return [q[0]+q[2]*s, q[1]+q[3]*s, q[4], q[5]]; } var a=a0[i]+s/rc; return [cx[i]+rc*Math.cos(a), czz[i]+rc*Math.sin(a), Math.cos(a), Math.sin(a)]; } s-=L; } return [hx,-sz2,1,0]; }
      for(var k=0;k<=M;k++){ var sp=k/M*per, R=rrect(sp), wv=0.42*Math.sin(sp/per*TAU*nw); pts.push({ x:R[0]+R[2]*wv, y:CH+1.45, z:R[1]+R[3]*wv, r:0.52, col:mosCol(F,Math.floor(k/4)) }); }
      F.tube('mosaic', pts, tilew, { seg:7 });
      for(var g=0;g<10;g++){ var gt=(g+0.5)/10; F.blob(-10.9+gt*21.8, CH+0.35, 7.95, 0.28,0.35, 0, tilew,'mosaic'); }       /* frieze drips */
      /* mosaic roundels on the soffit */
      [[-3.6,0],[3.6,0],[0,-3.4],[0,3.4]].forEach(function(p,k){ F.cyl(p[0],CH-0.1,p[1], 1.25,0.12, 0, mosCol(F,k*3), 'mosaic'); F.cyl(p[0],CH-0.16,p[1], 0.6,0.1, 0, mosCol(F,k*3+1), 'mosaic'); });
      F.lantern(0,4.2,5.1, 0.8,14,0.9);
    } });

  /* =====================================================================================================
     PARK  9. LIZARD STAIR
     ===================================================================================================== */
  ASSET({ key:'park_lizard_stair', name:'Lizard stair', family:'park', districts:['prosper'], wealth:[0.6,1], w:16, d:22, h:7, variants:1,
    build:function(F){
      var white=PAL.mosaicWhite[0], N=20, rise=0.25, run=0.85, z0=10.6, TOP=N*rise;
      for(var s=0;s<N;s++){ var z=z0-run*(s+0.5); [-1,1].forEach(function(sg){ F.box(sg*4.7,0,z, 4.5,rise*(s+1),run+0.02, 0, (s%2)?PAL.pavingRich[0]:PAL.pavingRich[2], 'adobe'); }); }
      F.box(0,0,-8.7, 15.8,TOP,4.5, 0, STONEW, 'rock'); F.box(0,TOP,-8.7, 15.7,0.06,4.4, 0, PAL.pavingRich[1], 'adobe');
      /* central island: four tiers of basins */
      for(var t=0;t<4;t++){ var zt=z0-4.25*t, h=TOP*(t+1)/4; F.box(0,0,zt-2.125, 4.85,h,4.25, 0, white, 'mosaic');
        F.archband('mosaic', 0,h-1.25+0.0,zt+0.03, 0, 2.2,0.95, 0.3,0.0, mosCol(F,t*2)); hdisc(F, 0,h-0.75,zt, 0,1, 0.42,0.06, mosCol(F,t+4), 'mosaic', 0.05);
        F.sector('mosaic', 0,zt-1.6, 1.0,1.3, 0,TAU, h,h+0.35, mosCol(F,t*3+1), { faces:'tio' }); F.sector('glass', 0,zt-1.6, 0,1.0, 0,TAU, h,h+0.22, GLASSC[1], { faces:'t' }); }
      /* the salamander, climbing from tier 1 to tier 2 */
      var y1=TOP/4, y2=TOP/2, zf2=z0-4.25;
      F.tube('mosaic', [{x:0,y:y1+0.62,z:z0-0.35,r:0.05},{x:0,y:y1+0.66,z:z0-0.7,r:0.30,col:MOSBLUEC[3]},{x:0,y:y1+0.72,z:z0-1.2,r:0.36,col:MOSWARMC[0]},{x:0.05,y:y1+0.75,z:z0-1.7,r:0.27,col:MOSGREENC[0]},
        {x:0.1,y:y1+0.85,z:z0-2.4,r:0.46,col:MOSBLUEC[0]},{x:0,y:y1+1.15,z:z0-3.3,r:0.52,col:MOSWARMC[1]},{x:-0.1,y:y2+0.35,z:zf2+0.35,r:0.48,col:MOSGREENC[1]},{x:-0.05,y:y2+0.55,z:zf2-0.5,r:0.40,col:MOSBLUEC[1]},
        {x:0.25,y:y2+0.5,z:zf2-1.3,r:0.28,col:MOSWARMC[3]},{x:0.7,y:y2+0.45,z:zf2-2.0,r:0.17,col:MOSBLUEC[3]},{x:1.2,y:y2+0.42,z:zf2-2.4,r:0.06,col:MOSWARMC[0]}], MOSBLUEC[0], { seg:8, rfn:function(){ return 1.22; } });
      [-1,1].forEach(function(sg){ F.ball(sg*0.2,y1+0.98,z0-1.05, 0.11, MOSWARMC[3],'mosaic');
        F.tube('mosaic', [{x:sg*0.3,y:y1+0.8,z:z0-2.2,r:0.17},{x:sg*0.95,y:y1+0.62,z:z0-1.95,r:0.14},{x:sg*1.2,y:y1+0.3,z:z0-1.5,r:0.12,col:MOSWARMC[0]}], MOSGREENC[0], { seg:5, cap:true });
        F.tube('mosaic', [{x:sg*0.35,y:y2+0.5,z:zf2-0.3,r:0.17},{x:sg*1.0,y:y2+0.5,z:zf2-0.1,r:0.14},{x:sg*1.25,y:y2+0.2,z:zf2+0.12,r:0.12,col:MOSWARMC[0]}], MOSBLUEC[0], { seg:5, cap:true }); });
      /* crenellated mosaic flank walls, stepping with the flights */
      for(var w=0;w<4;w++){ var zc=z0-4.25*w-2.125, hh=TOP*(w+1)/4+1.1; [-1,1].forEach(function(sg){ F.box(sg*7.45,0,zc, 0.9,hh,4.27, 0, white, 'mosaic');
        F.box(sg*7.45,hh-0.5,zc, 0.98,0.3,4.3, 0, mosCol(F,w+(sg>0?5:0)), 'mosaic');
        for(var m=0;m<3;m++){ F.box(sg*7.45,hh,zc+(m-1)*1.45, 0.9,0.6,0.75, 0, (m%2)?white:mosCol(F,w*2+m), 'mosaic'); F.blob(sg*7.45,hh+0.6,zc+(m-1)*1.45, 0.4,0.35, 0, white,'mosaic'); } }); }
      [-1,1].forEach(function(sg){ F.box(sg*7.45,0,-8.7, 0.9,TOP+1.1,4.5, 0, white,'mosaic'); for(var m=0;m<3;m++) F.box(sg*7.45,TOP+1.1,-8.7+(m-1)*1.5, 0.9,0.6,0.75, 0, mosCol(F,m+2),'mosaic'); });
      F.box(0,TOP,-10.75, 14.0,1.1,0.4, 0, white,'mosaic'); for(var b=0;b<7;b++) F.blob(-6+b*2,TOP+1.1,-10.75, 0.38,0.4, 0, mosCol(F,b),'mosaic');
      [-1,1].forEach(function(sg){ F.lathe('mosaic', sg*2.9,z0-0.5, [[0.45,0],[0.5,1.0],[0.3,1.3]], white, { seg:8 }); F.ball(sg*2.9,1.65,z0-0.5, 0.42, mosCol(F,sg+2),'mosaic'); });
    } });

  /* =====================================================================================================
     PARK  10. GATEHOUSE PAVILIONS
     ===================================================================================================== */
  ASSET({ key:'park_gatehouse', name:'Gingerbread gate lodge', family:'park', districts:['prosper'], wealth:[0.6,1], w:9, d:8, h:17, variants:2,
    build:function(F){
      var v=F.variant, white=PAL.mosaicWhite[0], ph=F.rr(0,6);
      function lump(n){ return function(q,ang){ return 1+0.05*Math.sin(ang*n+ph+q*1.3)+0.03*Math.sin(ang*7+q*2.1); }; }
      function roof(x,z,R,y,hh){ F.lathe('rock', x,z, [[R-0.35,y-0.5],[R+0.12,y-0.1],[R+0.05,y+0.2]], shade(STONEW,0.12), { seg:14, rfn:lump(5) });
        F.edome(x,y+0.15,z, R,hh,R, 0, white,'mosaic'); for(var i=0;i<10;i++){ var a=i/10*TAU; F.blob(x+Math.cos(a)*(R-0.12),y+0.12,z+Math.sin(a)*(R-0.12), 0.34,0.42, 0, (i%2)?MOSWARMC[0]:white,'mosaic'); } }
      function cross(x,y,z){ F.cyl(x,y,z, 0.09,1.5, 0, white,'mosaic'); F.box(x,y+0.85,z, 1.1,0.2,0.2, 0, white,'mosaic'); F.box(x,y+0.85,z, 0.2,0.2,1.1, 0, white,'mosaic'); F.ball(x,y+1.55,z,0.16,MOSWARMC[0],'mosaic'); }
      if(v===0){
        F.lathe('rock', 0,0, [[3.45,0],[3.3,1.0],[3.2,3.2],[3.35,4.3]], STONEW, { seg:16, rfn:lump(3) });
        roof(0,0, 3.7,4.3,2.5);
        /* the tall checkered spire with the four-armed cross */
        var pts=[], n=12; for(var i=0;i<=n;i++){ var t=i/n, y=5.6+t*8.2, r=1.25-0.75*t+(i===n-2?0.35:0)+(i===n-1?0.2:0); pts.push({ x:0.4,y:y,z:-0.3,r:r,col:(i%2)?MOSBLUEC[0]:white }); }
        pts.push({x:0.4,y:14.2,z:-0.3,r:0.12}); F.tube('mosaic', pts, white, { seg:10 }); cross(0.4,14.2,-0.3);
        F.door(0,3.5, 0,1, 1.1,2.1, PLANKC[1]); F.archband('mosaic', 0,0,3.62, 0, 1.4,2.4, 0.3,0.2, white);
        [-1,1].forEach(function(sg){ var a=PI/2+sg*0.75; F.window(Math.cos(a)*3.38,2.4,Math.sin(a)*3.38, Math.cos(a),Math.sin(a), 0.7,1.1, {noReveal:true}); });
        F.lantern(1.3,2.6,3.75, 0.7,10,0);
      } else {
        F.lathe('rock', -1.2,0, [[3.0,0],[2.85,1.0],[2.8,3.4],[2.95,4.4]], STONEW, { seg:16, rfn:lump(3) });
        F.lathe('rock', 2.2,0.4, [[2.2,0],[2.05,1.0],[2.0,2.6],[2.15,3.3]], shade(STONEW,-0.06), { seg:14, rfn:lump(4) });
        roof(-1.2,0, 3.25,4.4,2.2); roof(2.2,0.4, 2.3,3.3,1.5);
        /* amanita cupola */
        F.lathe('mosaic', -1.2,0, [[0.75,6.2],[0.6,7.6],[0.7,8.6]], white, { seg:10 }); F.edome(-1.2,8.3,0, 1.7,1.5,1.7, 0, MOSWARMC[2],'mosaic');
        F.cyl(-1.2,8.22,0, 1.66,0.1, 0, white,'mosaic');
        for(var k=0;k<7;k++){ var a=k/7*TAU+0.3, el=0.35+(k%2)*0.45; F.blob(-1.2+Math.cos(a)*1.7*Math.cos(el)*0.95, 8.3+1.5*Math.sin(el)*0.95-0.06, Math.sin(a)*1.7*Math.cos(el)*0.95, 0.24,0.2, 0, white,'mosaic'); }
        cross(-1.2,9.75,0);
        F.lathe('mosaic', 2.2,0.4, [[0.45,4.4],[0.35,5.6],[0.6,5.9],[0.1,6.5]], MOSBLUEC[0], { seg:8 });
        F.door(-1.2,3.04, 0,1, 1.1,2.1, PLANKC[2]); F.archband('mosaic', -1.2,0,3.14, 0, 1.4,2.4, 0.3,0.2, white);
        F.window(2.2,1.9,0.4+2.22, 0,1, 0.7,1.0, {noReveal:true}); var a2=PI/2+0.8; F.window(-1.2+Math.cos(a2)*2.9,2.4,Math.sin(a2)*2.9, Math.cos(a2),Math.sin(a2), 0.7,1.1, {noReveal:true});
        F.lantern(0.1,2.6,3.2, 0.7,10,0);
      }
    } });

  /* =====================================================================================================
     PARK  11. LEANING VIADUCT
     ===================================================================================================== */
  ASSET({ key:'park_viaduct', name:'Leaning stone viaduct', family:'park', districts:['prosper'], wealth:[0.5,1], w:30, d:8, h:8, variants:1,
    build:function(F){
      var DY=5.0, st=STONEW, st2=shade(STONEW,-0.12);
      F.box(0,DY,0, 29.4,0.75,5.0, 0, st, 'rock'); F.box(0,DY+0.75,0, 29.0,0.06,3.4, 0, PAL.lane[2], 'adobe');
      for(var i=0;i<8;i++){ var x=-12.95+i*3.7, ph=i*1.3;
        [-1,1].forEach(function(sg){ var pts=[]; for(var k=0;k<=5;k++){ var t=k/5; pts.push({ x:x+0.18*Math.sin(t*4+ph), y:t*DY-0.1+ (k===5?0.12:0), z:sg*(3.45-1.55*t-0.35*t*t), r:0.62-0.12*t+(k===5?0.35:0)+(k===0?0.15:0), col:(k%2)?st2:st }); }
          F.tube('rock', pts, st, { seg:7, rfn:function(q,ang){ return 1+0.10*Math.sin(ang*3+q*1.9+ph); } });
          /* planter crowning each column, with an agave */
          F.lathe('rock', x,sg*2.15, [[0.5,DY+0.7],[0.85,DY+1.3],[0.7,DY+1.75]], st2, { seg:8, rfn:function(q,ang){ return 1+0.08*Math.sin(ang*4+q); } });
          F.cone(x,DY+1.6,sg*2.15, 0.62,1.15, 0, PAL.shrub[(i+(sg>0?1:0))%4],'leafy'); F.blob(x,DY+1.55,sg*2.15, 0.8,0.5, i, PAL.olive[i%4],'leafy'); });
        if(i<7){ [-1,1].forEach(function(sg){ F.box(x+1.85,DY+0.7,sg*2.2, 2.3,0.75,0.5, 0, st2,'rock'); F.blob(x+1.85,DY+1.42,sg*2.2, 0.36,0.3, 0, st,'rock'); });
          F.archwall('rock', x+1.85,DY-1.6,2.15, 0, 3.7,1.62,0.7, 2.7,1.35, st2, { noTop:true }); F.archwall('rock', x+1.85,DY-1.6,-2.15, PI, 3.7,1.62,0.7, 2.7,1.35, st2, { noTop:true }); } }
    } });

  /* =====================================================================================================
     PARK  12. MOSAIC FOUNTAIN ROUNDEL
     ===================================================================================================== */
  ASSET({ key:'park_fountain_roundel', name:'Mosaic fountain roundel', family:'park', districts:['prosper','core'], wealth:[0.5,1], w:8, d:8, h:4, variants:2,
    build:function(F){
      var v=F.variant, white=PAL.mosaicWhite[0], c1=v?MOSWARMC[0]:MOSBLUEC[0], c2=v?MOSGREENC[0]:MOSBLUEC[3];
      F.sector('adobe', 0,0, 0,3.95, 0,TAU, 0,0.08, PAL.pavingRich[0], { faces:'t' });
      var pts=[]; for(var k=0;k<=24;k++){ var a=k/24*TAU; pts.push({ x:Math.cos(a)*3.1, y:0.5, z:Math.sin(a)*3.1, r:0.45, col:(k%3===0)?c1:((k%3===1)?white:c2) }); }
      F.tube('mosaic', pts, white, { seg:7 }); F.sector('mosaic', 0,0, 2.7,3.4, 0,TAU, 0,0.45, white, { faces:'io' });
      F.sector('glass', 0,0, 0,3.0, 0,TAU, 0,0.55, GLASSC[1], { faces:'t' });
      F.lathe('mosaic', 0,0, [[0.75,0.3],[0.5,0.9],[0.38,1.7],[0.55,1.95],[1.45,2.3],[1.5,2.45]], white, { seg:12, rfn:function(q,ang){ return q>=4 ? 1+0.07*Math.cos(ang*6) : 1; } });
      F.cyl(0,2.36,0, 1.38,0.06, 0, GLASSC[3],'glass');
      F.lathe('mosaic', 0,0, [[0.3,2.3],[0.22,2.9],[0.34,3.1]], c1, { seg:8 }); F.ball(0,3.35,0, 0.3, c2,'mosaic');
      for(var i=0;i<4;i++){ var a2=i/4*TAU+PI/4; F.blob(Math.cos(a2)*3.1,0.85,Math.sin(a2)*3.1, 0.34,0.32, 0, c1,'mosaic'); }
    } });

  /* =====================================================================================================
     13. THE LIBRARY OF YUNI   (Casa Batllo loggia + trencadis + scaled roof; Sagrada branching columns)
     ===================================================================================================== */
  ASSET({ key:'civic_library', name:'Library of Yuni', family:'civic', districts:['core','prosper'], wealth:[0.6,1], w:64, d:52, h:22, variants:1,
    build:function(F){
      var stone=STONEC[2], stone2=shade(STONEC[0],-0.04), mosw=PAL.mosaicWhite[0], pale=PAL.mosaicWhite[1], bone=shade(STONEC[2],0.16);
      var Y0=0.55, WT=10.6, HX=23.4, ZB=-19.0, ZF=13.4;         /* floor, wall head, half-width, back and front wall planes */
      var LOG=4.3, ARC=7.0, TER=7.05, FB=8.05, FT=16.0;         /* loggia capital / arch head / terrace / facade base & top */
      var BOOKS=[PLANKC[3],TILEC[0],BLUEDC[0],MOSWARMC[4],PAL.paintRed[0],TIMBERC[2],MOSGREENC[2],GILDC[3],BLUEDC[2],TILEC[3]];
      function chipCol(t){ return t<0.36 ? F.pick([MOSBLUEC[0],MOSBLUEC[2],MOSGREENC[0],MOSGREENC[2]])
                         : (t<0.70 ? F.pick([MOSGREENC[3],MOSBLUEC[3],MOSWARMC[3],MOSBLUEC[0]]) : F.pick([MOSWARMC[0],MOSWARMC[1],GILDC[0],GILDC[1]])); }
      function speckle(ax, plane, nrm, a0,a1, y0,y1, n){        /* finer trencadis chips than round 2 */
        for(var i=0;i<n;i++){ var t=F.rnd(), u=F.rr(a0,a1), y=mix(y0,y1,t*t*0.35+t*0.65), w2=F.rr(0.28,0.58), h2=F.rr(0.22,0.44), rl=F.rr(-0.7,0.7);
          if(ax==='z') F.box(u, y, plane+nrm*0.09, w2,h2,0.12, [0,0,rl], chipCol(t), 'mosaic');
          else F.box(plane+nrm*0.09, y, u, 0.12,h2,w2, [0,PI/2,rl], chipCol(t), 'mosaic'); } }
      /* the furniture is REGISTERED (see FURN, below): the hall places the catalogue pieces */
      var fseq=0;
      function bookcase(cx,cz, nx,nz, w,h, ly){ placeFurn(F,'order_bookcase', cx,cz, Math.atan2(nx,nz), ly==null?Y0:ly, ++fseq, h>4?0:1); }
      function table(cx,cz, yaw, ly){ placeFurn(F,'order_reading_table', cx,cz, yaw, ly==null?Y0:ly, ++fseq, (fseq%3===0)?1:0); }
      function lectern(cx,cz,yaw, ly){ placeFurn(F,'order_lectern', cx,cz, yaw, ly==null?Y0:ly, ++fseq, (fseq%2)?1:0); }
      function ladder(cx,cz,yaw,h, ly){ placeFurn(F,'order_library_ladder', cx,cz, yaw, ly==null?Y0:ly, ++fseq, 0); }
      /* branching column, Sagrada-style: trunk to `yb`, four limbs out to `yt` */
      function branchCol(cx,cz, r0, yb,yt, spread){
        F.tube('plaster', [{x:cx,y:Y0,z:cz,r:r0},{x:cx,y:Y0+0.9,z:cz,r:r0*0.78},{x:cx,y:yb-0.5,z:cz,r:r0*0.58},{x:cx,y:yb,z:cz,r:r0*0.68}], bone,
          { seg:12, rfn:function(q,ang){ return q>1?1+0.035*Math.cos(ang*8):1; } });
        [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(br){
          F.tube('plaster', [{x:cx,y:yb-0.1,z:cz,r:r0*0.40},{x:cx+br[0]*spread*0.45,y:(yb+yt)/2,z:cz+br[1]*spread*0.45,r:r0*0.30},{x:cx+br[0]*spread,y:yt,z:cz+br[1]*spread,r:r0*0.20}], bone, { seg:8 }); });
        F.disc(cx, yb-0.35, cz, 0,1, r0*0.55,0.12, F.pick([MOSBLUEC[0],MOSWARMC[0],MOSGREENC[0]]), 'mosaic'); }

      /* ================= 1. the hall: plinth, walls, front wall with its three arches ================= */
      F.box(0,0,-3.0, 50,Y0,34.2, 0, stone2, 'rock');
      [-1,1].forEach(function(sg){ F.box(sg*HX,Y0,-2.8, 1.2,3.0,33.4, 0, stone, 'plaster');
        F.box(sg*HX,3.55,-2.8, 1.1,WT-3.55,33.4, 0, pale, 'mosaic');
        speckle('x', sg*(HX+0.55), sg, -18.5,12.8, 3.7,WT-0.7, 92);
        F.box(sg*HX,WT-0.6,-2.8, 1.5,0.6,33.4, 0, MOSBLUEC[2], 'mosaic');
        /* clerestory-lit side windows high in the wall, over the cloister roof */
        [-14,-8,-2,4,10].forEach(function(wz){ F.window(sg*(HX+0.6), 8.4, wz, sg,0, 1.1,1.9, {noReveal:true});
          F.archband('relief', sg*(HX+0.62), 7.45, wz, sg*PI/2, 1.3,2.1, 0.3,0.1, stone); }); });
      F.box(0,Y0,ZB, 47,3.0,1.2, 0, stone, 'plaster'); F.box(0,3.55,ZB, 47,WT-3.55,1.1, 0, pale, 'mosaic');
      speckle('z', ZB-0.55, -1, -22,22, 3.7,WT-0.7, 52); F.box(0,WT-0.6,ZB, 47,0.6,1.5, 0, MOSBLUEC[2], 'mosaic');
      /* the front wall of the hall: a big open portal and two lobed openings you can see in through */
      [[-15.2,5.4,5.4],[15.2,5.4,5.4]].forEach(function(q){ F.archwall('plaster', q[0],Y0,ZF, 0, 15.2,7.5,1.2, q[1],q[2], stone, { pointed:1.6, colIn:stone2 }); });
      F.archwall('plaster', 0,Y0,ZF, 0, 15.2,7.5,1.2, 6.4,6.2, stone, { pointed:1.7, colIn:stone2 });
      F.archband('mosaic', 0,Y0,ZF+0.62, 0, 6.4,6.2, 0.45,0.16, MOSBLUEC[0], { pointed:1.7 });
      [-15.2,15.2].forEach(function(fx){ F.archband('mosaic', fx,Y0,ZF+0.62, 0, 5.4,5.4, 0.35,0.12, MOSGREENC[0], { pointed:1.6 }); });
      /* the great arch stands OPEN — its two leaves folded back against the reveal, so the hall is visible */
      [-1,1].forEach(function(sg){ F.box(sg*2.55, Y0, ZF-0.30, 0.14,3.9,1.5, sg*0.34, PLANKC[1], 'plank');
        for(var sd=0;sd<4;sd++) F.box(sg*2.62, Y0+0.6+sd*0.85, ZF-0.30, 0.1,0.12,0.12, sg*0.34, GILDC[0], 'metal'); });
      F.lantern(-2.9, 3.1, ZF-1.5, 1.0,14, 1.0); F.lantern(2.9, 3.1, ZF-1.5, 1.0,14, 1.0);
      F.door(-16.4,ZF, 0,1, 2.3,3.2, PLANKC[1], Y0); studs(F, -16.4,Y0,ZF+0.07, 2.3,3.2);
      F.disc(0, Y0+4.7, ZF+0.64, 0,1, 1.05,0.2, GILDC[0], 'relief'); F.disc(0, Y0+4.7, ZF+0.74, 0,1, 0.7,0.2, MOSBLUEC[0], 'mosaic');

      /* ================= 2. the covered reading hall: roof, clerestory monitor, interior ================= */
      var zEb=-19.85, zEf=ZF+0.55, zc0=-4.6, zc1=-1.4, zRm=-3.0, NX=22;
      var BAND=[[MOSGREENC[0],MOSBLUEC[0],MOSBLUEC[2]],[MOSWARMC[3],TILEC[0],MOSGREENC[3]],[MOSWARMC[0],GILDC[0],TILEC[2]]];
      function ye(x){ return WT+0.2-0.65*Math.sin(x*0.30+0.7); }
      function yc(x){ return 13.25+1.05*Math.sin(x*0.30+0.7); }
      function yrr(x){ return yc(x)+2.9; }
      function slope(x,zA,zC,t){ return mix(ye(x), yc(x), Math.pow(t,0.70)); }
      for(var i=0;i<NX;i++){ var xa=-24+i*48/NX, xb=-24+(i+1)*48/NX, xm=(xa+xb)/2;
        [[zEb,zc0,1],[zEf,zc1,-1]].forEach(function(e,si){
          for(var j=0;j<3;j++){ var t0=j/3, t1=(j+1)/3, za=mix(e[0],e[1],t0), zb2=mix(e[0],e[1],t1), cc=BAND[j][(i+si*2+(j===1?1:0))%3];
            F.quad('mosaic', [xa,slope(xa,0,0,t0),za],[xb,slope(xb,0,0,t0),za],[xb,slope(xb,0,0,t1),zb2],[xa,slope(xa,0,0,t1),zb2], cc, [0,1,e[2]*0.5]);
            if(j===0) F.quad('mosaic', [xa,slope(xa,0,0,t0)-0.24,za],[xb,slope(xb,0,0,t0)-0.24,za],[xb,slope(xb,0,0,t0),za],[xa,slope(xa,0,0,t0),za], (i%2)?mosw:MOSBLUEC[0], [0,-0.3,e[2]]); }
          F.quad('plaster', [xa,ye(xa)-0.3,e[0]],[xb,ye(xb)-0.3,e[0]],[xb,yc(xb),e[1]],[xa,yc(xa),e[1]], stone2, [0,-1,0]);          /* soffit */
          /* the clerestory band: a little lobed window in every other bay */
          F.quad('mosaic', [xa,yc(xa),e[1]],[xb,yc(xb),e[1]],[xb,yc(xb)+1.75,e[1]],[xa,yc(xa)+1.75,e[1]], pale, [0,0,-e[2]]);
          if(i%2===1){ F.archwall('mosaic', xm, yc(xm)+0.15, e[1]-e[2]*0.12, e[2]>0?PI:0, 48/NX-0.3,1.5,0.26, 1.15,1.25, pale, { pointed:1.6, colIn:VOIDC[0] });
            F.window(xm, yc(xm)+0.85, e[1]-e[2]*0.26, 0,-e[2], 1.1,1.2, {noReveal:true}); } });
        /* the monitor roof over the clerestory, with the mosaic spine */
        [[zc0,1],[zc1,-1]].forEach(function(e){ F.quad('mosaic', [xa,yc(xa)+1.75,e[0]],[xb,yc(xb)+1.75,e[0]],[xb,yrr(xb),zRm],[xa,yrr(xa),zRm], (i%2)?MOSWARMC[0]:GILDC[0], [0,1,e[1]*0.6]);
          F.quad('plaster', [xa,yc(xa)+1.70,e[0]],[xb,yc(xb)+1.70,e[0]],[xb,yrr(xb)-0.1,zRm],[xa,yrr(xa)-0.1,zRm], stone2, [0,-1,0]); });
        F.box(xm, yrr(xm)-0.18, zRm, 48/NX+0.04, 0.7, 1.7, 0, (i%2)?MOSWARMC[0]:mosw, 'mosaic');
        if(i%3===1) F.blob(xm, yrr(xm)+0.4, zRm, 0.5,0.55, 0, GILDC[0], 'mosaic'); }
      /* gable fills at the two ends, wall head up to the roof line */
      [-24,24].forEach(function(gx){
        [[zEb,zc0],[zEf,zc1]].forEach(function(e){ for(var j=0;j<3;j++){ var t0=j/3,t1=(j+1)/3, za=mix(e[0],e[1],t0), zb3=mix(e[0],e[1],t1);
          F.quad('mosaic', [gx,WT-0.35,za],[gx,WT-0.35,zb3],[gx,slope(gx,0,0,t1),zb3],[gx,slope(gx,0,0,t0),za], pale, [gx,0,0]); } });
        F.quad('mosaic', [gx,yc(gx),zc0],[gx,yc(gx),zc1],[gx,yrr(gx),zRm],[gx,yrr(gx),zRm], pale, [gx,0,0]);
        F.quad('mosaic', [gx,yc(gx),zc0],[gx,yc(gx)+1.75,zc0],[gx,yrr(gx),zRm],[gx,yc(gx)+1.75,zc1], pale, [gx,0,0]);
        F.quad('mosaic', [gx,yc(gx),zc1],[gx,yc(gx)+1.75,zc1],[gx,yrr(gx),zRm],[gx,yc(gx)+1.75,zc0], pale, [gx,0,0]); });
      /* ---- the interior: floor, branching columns, a gallery, shelving, tables ---- */
      F.box(0,Y0-0.06,-3.0, 45.4,0.14,31.6, 0, PAL.pavingRich[1], 'adobe');
      for(var mq=0;mq<7;mq++) F.box(0, Y0+0.02, -15+mq*5.2, 7.2,0.06,3.2, 0, (mq%2)?MOSBLUEC[0]:MOSGREENC[0], 'mosaic');   /* a mosaic runner down the nave */
      [-1,1].forEach(function(sg){
        [-16,-10,-4,2,8].forEach(function(cz2,ci){ branchCol(sg*12.6, cz2, 1.05, 6.9, 9.0, 2.6);
          if(ci%2===0) F.lantern(sg*12.6, 6.3, cz2+1.9, 0.9,14, 0.9); });
        /* gallery along each side wall, with its balustrade and its own shelves */
        F.box(sg*20.3,6.35,-3.2, 5.0,0.42,29.6, 0, stone, 'plaster'); F.box(sg*20.3,6.20,-3.2, 4.7,0.22,29.2, 0, shade(STONEC[2],-0.06), 'relief');
        F.box(sg*17.9,6.77,-3.2, 0.3,0.95,29.6, 0, mosw, 'mosaic');
        for(var bq=0;bq<12;bq++) F.blob(sg*17.9, 7.72, -17.2+bq*2.6, 0.26,0.3, 0, (bq%2)?MOSWARMC[0]:MOSBLUEC[0], 'mosaic');
        for(var g=0;g<7;g++) bookcase(sg*22.2, -16.4+g*4.6, -sg,0, 3.4,2.9, 6.77);                                        /* gallery shelves */
        for(var k=0;k<7;k++) bookcase(sg*22.2, -16.4+k*4.6, -sg,0, 3.4,5.1, Y0);                                          /* ground-floor ranges */
        for(var st=0;st<4;st++) bookcase(sg*7.4, -14.5+st*6.4, sg,0, 3.4,2.9, Y0);                                        /* free-standing stacks */
        table(sg*4.0, -12.0+0, 0); table(sg*4.0, 0.5, 0); table(sg*4.0, 9.0, 0);
        ladder(sg*22.0, -7.2, sg>0?-PI/2:PI/2, 4.2, Y0);
        F.lantern(sg*6.6, 2.6, -6.0, 0.8,12, 0.5); });
      for(var b2=0;b2<7;b2++) bookcase(-18+b2*6, ZB+1.3, 0,1, 3.4,5.1, Y0);                                               /* the back wall range */
      lectern(-3.2, 10.4, PI); lectern(3.2, 10.4, PI);
      /* things on the entrance axis, so the hall reads as a library from the doorway */
      [-1,1].forEach(function(sg){ bookcase(sg*5.7, -2.3, 0,1, 3.4,2.9, Y0); bookcase(sg*5.7, -1.4, 0,-1, 3.4,2.9, Y0);
        bookcase(sg*5.7, -9.1, 0,1, 3.4,2.9, Y0); bookcase(sg*5.7, -8.2, 0,-1, 3.4,2.9, Y0); });
      table(0, 5.0, PI/2); table(0, 1.2, PI/2);
      placeFurn(F,'order_globe_stand', 0,-13.5, PI, Y0, 91, 0);
      F.lantern(0, 3.4, -6.5, 1.0,15, 1.4);
      F.lantern(0, 3.4, 11.4, 1.0,15, 1.2);
      /* stairs up to the gallery, in the back corners */
      [-1,1].forEach(function(sg){ for(var st2=0;st2<9;st2++) F.box(sg*19.4, Y0, -17.0+st2*0.72, 3.4,0.68+st2*0.68,0.74, 0, stone, 'plaster'); });

      /* ================= 3. the cloister: a parabolic arcade on bone columns, three sides ================= */
      var CLX=29.6, CLZB=-23.6, CLZF=12.6, WALKY=5.5;
      function boneCol(cx,cz,h,r0){ F.tube('plaster', [{x:cx,y:Y0,z:cz,r:r0},{x:cx,y:Y0+0.75,z:cz,r:r0*0.72},{x:cx,y:h-0.9,z:cz,r:r0*0.50},{x:cx,y:h,z:cz,r:r0*0.68}], bone,
        { seg:10, rfn:function(q,ang){ return q===0?1+0.09*Math.cos(ang*5):1; } }); }
      [-1,1].forEach(function(sg){
        F.arcade('plaster', sg*CLX, Y0, -5.5, sg*PI/2, 7, 5.1, 5.0, 0.9, stone, { pier:1.7, head:1.0, colIn:stone2 });
        for(var c=0;c<8;c++){ var cz3=-23.35+c*5.1; boneCol(sg*(CLX-0.62), cz3, Y0+5.0, 0.62); }
        F.box(sg*26.7, WALKY, -5.5, 6.9,0.5,36.3, 0, stone, 'plaster');                                    /* the walk roof */
        F.box(sg*26.7, WALKY-0.16, -5.5, 6.5,0.2,35.9, 0, shade(STONEC[2],-0.08), 'relief');
        F.box(sg*26.7, WALKY+0.5, -5.5, 6.9,0.14,36.3, 0, PAL.pavingRich[0], 'adobe');
        F.box(sg*30.0, WALKY+0.5, -5.5, 0.9,0.42,36.7, 0, MOSBLUEC[2], 'mosaic');
        F.box(sg*23.6, WALKY+0.5, -5.5, 0.9,0.42,36.3, 0, MOSGREENC[0], 'mosaic');
        for(var pb=0;pb<13;pb++) F.blob(sg*30.0, WALKY+0.92, -22.0+pb*2.9, 0.34,0.36, 0, (pb%2)?MOSWARMC[0]:mosw, 'mosaic');
        for(var pv=0;pv<14;pv++){ var pz=-22.6+pv*2.7; F.box(sg*26.7, Y0, pz, 6.6,0.07,2.6, 0, (pv%2)?PAL.mosaicWhite[0]:MOSGREENC[0], 'mosaic'); }
        F.box(sg*24.4, Y0, -5.5, 0.95,0.5,32.0, 0, mosw, 'mosaic');                                        /* the bench along the hall wall */
        F.box(sg*24.9, Y0+0.5, -5.5, 0.35,0.55,32.0, 0, MOSWARMC[0], 'mosaic');
        for(var t2=0;t2<7;t2++) F.tree(sg*30.9, -22.0+t2*5.6, (t2%3===0)?'cypress':'shrub', (t2%3===0)?F.rr(6,7.4):F.rr(1.0,1.5));
        F.lantern(sg*25.4, 3.4, -16.0, 0.9,13, 1.0); F.lantern(sg*25.4, 3.4, 5.0, 0.9,13, 1.0); });
      F.arcade('plaster', 0, Y0, CLZB, PI, 9, 5.1, 5.0, 0.9, stone, { pier:1.7, head:1.0, colIn:stone2 });
      for(var cb=0;cb<10;cb++){ var cbx=-22.95+cb*5.1; boneCol(cbx, CLZB+0.62, Y0+5.0, 0.62); }
      F.box(0, WALKY, -21.5, 47.4,0.5,5.5, 0, stone, 'plaster'); F.box(0, WALKY-0.16, -21.5, 47.0,0.2,5.1, 0, shade(STONEC[2],-0.08), 'relief');
      F.box(0, WALKY+0.5, -21.5, 47.0,0.14,5.5, 0, PAL.pavingRich[0], 'adobe');
      F.box(0, WALKY+0.5, -23.9, 47.4,0.42,0.9, 0, MOSBLUEC[2], 'mosaic');
      F.box(0, WALKY+0.5, -19.2, 47.0,0.42,0.9, 0, MOSGREENC[0], 'mosaic');
      for(var pb2=0;pb2<16;pb2++) F.blob(-22.5+pb2*3.0, WALKY+0.92, -23.9, 0.34,0.36, 0, (pb2%2)?MOSWARMC[0]:mosw, 'mosaic');
      for(var pw=0;pw<16;pw++) F.box(-22.4+pw*3.0, Y0, -21.5, 2.9,0.07,5.1, 0, (pw%2)?PAL.mosaicWhite[0]:MOSGREENC[0], 'mosaic');
      F.box(0, Y0, -20.1, 40.0,0.5,0.95, 0, mosw, 'mosaic'); F.box(0, Y0+0.5, -20.6, 40.0,0.55,0.35, 0, MOSWARMC[0], 'mosaic');
      for(var t3=0;t3<9;t3++) F.tree(-22+t3*5.5, -25.2, (t3%4===1)?'olive':'shrub', (t3%4===1)?F.rr(3.6,4.4):F.rr(1.0,1.4));
      /* the corner piers where the three walks meet */
      [[-1,-1],[1,-1]].forEach(function(q){ F.box(q[0]*CLX, Y0, CLZB, 2.2,5.0,2.2, 0, stone, 'plaster'); F.box(q[0]*CLX, WALKY, CLZB, 2.6,0.6,2.6, 0, MOSWARMC[0], 'mosaic');
        F.cone(q[0]*CLX, WALKY+0.6, CLZB, 0.85,1.7, 0, mosw, 'mosaic'); });
      [-1,1].forEach(function(sg){ F.box(sg*CLX, Y0, CLZF, 2.2,5.0,2.2, 0, stone, 'plaster'); F.box(sg*CLX, WALKY, CLZF, 2.6,0.6,2.6, 0, MOSWARMC[0], 'mosaic');
        F.cone(sg*CLX, WALKY+0.6, CLZF, 0.85,1.7, 0, mosw, 'mosaic'); });

      /* ================= 4. the loggia porch, the terrace and the trencadis facade ================= */
      var CX=[-18.6,-11.2,-3.75,3.75,11.2,18.6];
      CX.forEach(function(cx,ci){
        F.tube('plaster', [{x:cx,y:Y0,z:15.9,r:1.45},{x:cx,y:1.25,z:15.9,r:1.02},{x:cx,y:2.2,z:15.9,r:0.76},{x:cx,y:3.6,z:15.9,r:0.72},{x:cx,y:LOG,z:15.9,r:0.98}], bone,
          { seg:12, rfn:function(q,ang){ return q===0?1+0.09*Math.cos(ang*5):1; } });
        F.box(cx,LOG-0.05,15.9, 2.4,0.4,2.4, 0, stone2, 'plaster');
        [-1,1].forEach(function(sg){ F.tube('plaster', [{x:cx,y:LOG+0.3,z:15.9,r:0.42},{x:cx+sg*1.15,y:LOG+1.3,z:15.9,r:0.32},{x:cx+sg*2.0,y:LOG+2.5,z:15.9,r:0.24}], bone, { seg:8 }); });
        if(ci<5){ var bx=(cx+CX[ci+1])/2, bw=CX[ci+1]-cx;
          F.archwall('plaster', bx,LOG+0.35,15.9, 0, bw,ARC-LOG-0.35,1.6, bw-1.2,2.35, stone, { pointed:1.7, colIn:stone2, noTop:true }); } });
      F.box(0,ARC,15.7, 45.5,0.34,4.6, 0, stone, 'plaster');                                    /* the loggia terrace deck */
      F.box(0,ARC-0.32,15.7, 45.0,0.34,4.9, 0, MOSWARMC[3], 'mosaic');
      F.box(0,TER+0.3,15.7, 44.6,0.08,4.2, 0, PAL.pavingRich[0], 'adobe');
      for(var lg=0;lg<6;lg++){ var lx2=-19+lg*7.6; F.box(lx2, Y0, 13.9+0.0, 0.9,0.07,2.1, 0, PAL.pavingRich[2], 'adobe'); }
      /* the mask parapet on the terrace edge, the Batllo profile */
      [-15.3,0,15.3].forEach(function(fx){
        F.box(fx,TER+0.35,17.75, 6.6,0.95,0.42, 0, mosw, 'relief');
        [-1.6,1.6].forEach(function(ex){ F.disc(fx+ex, TER+0.95, 17.95, 0,1, 0.40,0.18, VOIDC[0], 'dark'); });
        F.box(fx,TER+1.28,17.75, 6.8,0.26,0.56, 0, stone, 'relief'); });
      [-22.3,22.3].forEach(function(px){ F.box(px,TER+0.35,15.7, 0.8,1.2,4.6, 0, mosw, 'relief'); });
      /* the facade, rising from the hall's front wall */
      [-15.2,0,15.2].forEach(function(fx,fi){
        F.archwall('mosaic', fx,FB,ZF+0.15, 0, 15.2,FT-FB,1.0, 5.4,5.2, mosw, { pointed:1.6, colIn:shade(BLUEGREYC[0],-0.35) });
        F.archband('relief', fx,FB,ZF+0.67, 0, 5.4,5.2, 0.62,0.24, stone, { pointed:1.6 });
        speckle('z', ZF+0.65, 1, fx-7.4,fx-3.1, FB+0.4,FT-0.3, 44); speckle('z', ZF+0.65, 1, fx+3.1,fx+7.4, FB+0.4,FT-0.3, 44);
        speckle('z', ZF+0.65, 1, fx-2.9,fx+2.9, FB+5.6,FT-0.3, 20);
        F.window(fx, FB+2.6, ZF+0.70, 0,1, 4.4,4.2, {noReveal:true});
        [-1.5,0,1.5].forEach(function(mx){ F.box(fx+mx, FB+0.3, ZF+0.74, 0.22,4.3,0.2, 0, pale, 'relief'); });
        F.box(fx, FB+2.5, ZF+0.74, 5.0,0.22,0.2, 0, pale, 'relief'); });
      F.roundWindow(0, FT-1.6, ZF+0.76, 0,1, 1.8, mosw, 10);
      speckle('z', ZF+0.65, 1, -23,-22.1, FB+0.4,FT-0.4, 11); speckle('z', ZF+0.65, 1, 22.1,23, FB+0.4,FT-0.4, 11);
      for(var cq=0;cq<22;cq++){ var cx2=-23+cq*46/22, cy=FT+0.55*Math.sin(cq*0.9);
        F.box(cx2+1.0, cy, ZF+0.45, 46/22+0.1, 0.55, 2.2, [0,0,0.06*Math.cos(cq*0.9)], (cq%2)?MOSBLUEC[0]:MOSGREENC[0], 'mosaic');
        if(cq%3===0) F.blob(cx2+1.0, cy+0.5, ZF+0.45, 0.45,0.5, 0, GILDC[0], 'mosaic'); }
      /* ---- the bulbous corner turret, now the front-left corner of the cloister ---- */
      var tx=-26.4, tz=13.0;
      F.lathe('mosaic', tx,tz, [[2.35,0],[2.15,3.0],[2.45,6.5],[2.05,10.0],[2.35,13.0],[1.95,15.4],[1.35,17.4],[0.80,18.7],[0.40,19.4]], mosw,
        { seg:16, rfn:function(q,ang){ return 1+0.05*Math.sin(ang*7); } });
      for(var sc=0;sc<22;sc++){ var sa=sc/22*TAU*2.4, sy=2.0+sc*0.72; F.box(tx+Math.cos(sa)*2.1, sy, tz+Math.sin(sa)*2.1, 0.55,0.5,0.55, [0,-sa,0.3], F.pick([MOSBLUEC[0],MOSGREENC[0],MOSWARMC[0],GILDC[0]]), 'mosaic'); }
      F.window(tx, 8.2, tz+2.2, 0,1, 0.8,1.4, {noReveal:true}); F.window(tx, 12.6, tz+2.15, 0,1, 0.8,1.4, {noReveal:true});
      F.lathe('mosaic', tx,tz, [[0.55,19.4],[0.30,20.1]], GILDC[0], { seg:10 });
      F.cyl(tx,20.0,tz, 0.13,1.4, 0, mosw,'mosaic'); [0,PI/2].forEach(function(ca){ F.box(tx,20.8,tz, 1.5,0.22,0.22, ca, mosw,'mosaic'); });
      F.ball(tx,21.4,tz, 0.24, GILDC[0],'metal');
      /* forecourt */
      F.box(0,0,20.6, 9.0,0.12,8.0, 0, PAL.pavingRich[0], 'adobe');
      [-1,1].forEach(function(sg){ F.tree(sg*9.0, 20.6, 'cypress', F.rr(7,8.5)); F.tree(sg*16.5, 21.4, 'olive', F.rr(4,5)); F.tree(sg*24.5, 20.0, 'shrub', F.rr(1.1,1.5));
        F.lantern(sg*3.8, 3.2, 19.4, 1.0, 15, 0); F.lathe('mosaic', sg*6.4,19.0, [[0.62,0],[0.85,0.7],[0.70,1.1]], F.pick([MOSBLUEC[0],MOSWARMC[0]]), { seg:10 });
        F.blob(sg*6.4, 1.0, 19.0, 0.95,0.85, 0, PAL.shrub[1], 'leafy'); });
    } });

  /* =====================================================================================================
     14. THE SCHOOL   (Gaudi's Sagrada Familia Schools: undulating walls, warped conoid roof)
     ===================================================================================================== */
  ASSET({ key:'civic_school', name:'School of the Order', family:'civic', districts:['prosper','market','poor'], wealth:[0.2,0.8], w:46, d:30, h:11, variants:3,
    variantNames:['short wave','long wave','tight wave, whitewashed'],
    build:function(F){
      var v=F.variant, ph=(v===1)?PI:(v===2?PI/2:0), kk=TAU/(v===1?10.4:(v===2?6.0:7.2)), A=(v===1)?1.25:(v===2?0.78:0.92);
      var X=(v===1)?20.6:(v===2?19.4:18.0), N=(v===1)?56:48, ov=0.55;
      var wash=(v===2), red=wash?WHITEC[1]:ADOBEREDC[v?2:0], red2=wash?BLUEDC[1]:shade(ADOBEREDC[3],-0.05);
      var wfam=wash?'plaster':'adobe', white=WHITEC[0], tile=wash?TILEC[1]:TILEC[v?2:0], band=wash?MOSBLUEC[0]:MOSGREENC[0];
      var zF0=1.2, zB0=-12.2, zR=-5.5, DADO=1.15;
      function ws(x){ return A*Math.sin(kk*x+ph); }  function dws(x){ return A*kk*Math.cos(kk*x+ph); }
      function zF(x){ return zF0+ws(x); }  function zB(x){ return zB0+ws(x); }
      function hE(x){ return 4.05-0.62*Math.sin(kk*x+ph); }                    /* eaves wave DOWN where... */
      function hR(x){ return 5.60+0.80*Math.sin(kk*x+ph); }                    /* ...the ridge waves UP: the conoid */
      /* ---- the undulating walls, with reveals and parabolic heads on the openings ---- */
      for(var i=0;i<N;i++){
        var xa=-X+i*2*X/N, xb=-X+(i+1)*2*X/N, xm=(xa+xb)/2;
        [[zF,1],[zB,-1]].forEach(function(e,ei){
          var zf1=e[0](xa), zf2=e[0](xb), sg=e[1], d=dws(xm), nl=Math.hypot(d,1), hn=[-d/nl*sg,0,1/nl*sg], hin=[d/nl*sg,0,-1/nl*sg];
          var ya=hE(xa), yb2=hE(xb), cc=shade(red, ((i*7)%5-2)*0.018), yaw=Math.atan2(hn[0],hn[2]);
          F.quad(wfam, [xa,0,zf1],[xb,0,zf2],[xb,DADO,zf2],[xa,DADO,zf1], white, hn);                          /* whitewashed dado */
          F.quad(wfam, [xa,DADO,zf1],[xb,DADO,zf2],[xb,yb2,zf2],[xa,ya,zf1], cc, hn);                          /* brick above */
          var ix=-sg*0.45;
          F.quad(wfam, [xa,0,zf1+ix],[xb,0,zf2+ix],[xb,yb2,zf2+ix],[xa,ya,zf1+ix], shade(cc,-0.3), hin);       /* inner face */
          F.quad(wfam, [xa,ya,zf1],[xb,yb2,zf2],[xb,yb2,zf2+ix],[xa,ya,zf1+ix], shade(cc,0.06), [0,1,0]);      /* wall head */
          var open=(ei===0) ? (i%6===3 && Math.abs(xm)>3.6) : (i%6===0 && Math.abs(xm)>3.0);
          if(open){ var zw=e[0](xm), wW=(ei===0)?1.25:1.15, wH=(ei===0)?1.35:1.25;
            F.window(xm, 2.62, zw+sg*0.04, hn[0],hn[2], wW,wH);                                                /* WITH its reveal */
            F.archband(wfam, xm, 1.95, zw+sg*0.10, yaw, wW+0.30, wH+0.95, 0.26,0.10, white);                   /* parabolic head */
            F.box(xm, 1.86, zw+sg*0.10, wW+0.85,0.16,0.16, yaw, white, 'plaster');                             /* sill */
            F.box(xm, 1.90, zw+sg*0.13, wW+0.30,0.10,0.10, yaw, band, 'mosaic'); } });
        /* ---- the warped conoid roof: straight rulings from a waving eave to a waving ridge ---- */
        var ta=hE(xa), tb=hE(xb), ra=hR(xa), rb=hR(xb), tc=F.pick([tile, shade(tile,0.08), shade(tile,-0.08), TILEC[1]]);
        F.quad('tile', [xa,ta,zF(xa)+ov],[xb,tb,zF(xb)+ov],[xb,rb,zR],[xa,ra,zR], tc, [0,1,0.5]);
        F.quad('tile', [xa,ta-0.22,zF(xa)+ov],[xb,tb-0.22,zF(xb)+ov],[xb,rb-0.22,zR],[xa,ra-0.22,zR], shade(tc,-0.4), [0,-1,-0.4]);
        F.quad('tile', [xa,ra,zR],[xb,rb,zR],[xb,tb,zB(xb)-ov],[xa,ta,zB(xa)-ov], shade(tc,-0.05), [0,1,-0.5]);
        F.quad('tile', [xa,ra-0.22,zR],[xb,rb-0.22,zR],[xb,tb-0.22,zB(xb)-ov],[xa,ta-0.22,zB(xa)-ov], shade(tc,-0.4), [0,-1,0.4]);
        F.quad('tile', [xa,ta,zF(xa)+ov],[xb,tb,zF(xb)+ov],[xb,tb-0.22,zF(xb)+ov],[xa,ta-0.22,zF(xa)+ov], shade(tc,-0.15), [0,0,1]);
        F.quad('tile', [xa,ta,zB(xa)-ov],[xb,tb,zB(xb)-ov],[xb,tb-0.22,zB(xb)-ov],[xa,ta-0.22,zB(xa)-ov], shade(tc,-0.15), [0,0,-1]);
        /* ---- the scalloped ridge: a rolled mosaic crest with a shell in every other bay ---- */
        if(i%2===0){ var rm=hR(xm);
          F.box(xm, rm-0.10, zR, 2*X/N*2+0.06, 0.34, 1.05, 0, (i%4)?PAL.mosaicWhite[0]:band, 'mosaic');
          F.edome(xm, rm+0.22, zR, 0.62,0.55,0.62, 0, (i%4)?band:MOSWARMC[0], 'mosaic');
          if(i%8===0) F.ball(xm, rm+0.95, zR, 0.16, GILDC[0], 'metal'); } }
      /* ---- the two end walls: gable with a tile-mosaic tympanum ---- */
      [-1,1].forEach(function(sg){ var x=sg*X, zf1=zF(x), zb1=zB(x), h=hE(x), hr=hR(x);
        F.quad(wfam, [x,0,zb1],[x,0,zf1],[x,DADO,zf1],[x,DADO,zb1], white, [sg,0,0]);
        F.quad(wfam, [x,DADO,zb1],[x,DADO,zf1],[x,h,zf1],[x,h,zb1], red, [sg,0,0]);
        F.tri (wfam, [x,h,zf1],[x,hr,zR],[x,h,zb1], shade(red,0.05), [sg,0,0]);
        F.quad(wfam, [x-sg*0.4,0,zb1],[x-sg*0.4,0,zf1],[x-sg*0.4,h,zf1],[x-sg*0.4,h,zb1], shade(red,-0.3), [-sg,0,0]);
        /* the tympanum: a diamond field of tile mosaic under the gable, and a little roundel */
        for(var g=0;g<9;g++){ var gz=zR+(g-4)*1.5, gh=h+(hr-h)*(1-Math.abs(gz-zR)/((zf1-zR)));
          if(gh>h+0.35) F.box(x+sg*0.10, h+0.10, gz, 0.2,(gh-h-0.25),1.25, [0,sg*PI/2,PI/4], (g%2)?band:MOSWARMC[0], 'mosaic'); }
        F.disc(x+sg*0.14, h-1.0, zR, sg,0, 0.72,0.18, PAL.mosaicWhite[0], 'relief');
        F.disc(x+sg*0.22, h-1.0, zR, sg,0, 0.44,0.18, band, 'mosaic');
        F.box(x+sg*0.10, h+0.02, zR, 0.32,0.30,(zf1-zb1)*0.96, 0, white, 'plaster'); });
      /* ---- entrance porch ---- */
      var pz=zF(0);
      F.archwall(wfam, 0,0,pz+1.45, 0, 5.0,3.6,2.6, 2.4,3.0, red2, { colIn:shade(red,-0.3) });
      F.archband('mosaic', 0,0,pz+2.78, 0, 2.4,3.0, 0.32,0.12, MOSWARMC[0]);
      F.box(0,3.6,pz+1.45, 5.4,0.35,2.9, 0, white, 'plaster'); F.box(0,3.95,pz+1.45, 4.4,0.3,2.3, 0, MOSBLUEC[0], 'mosaic');
      for(var pk=0;pk<6;pk++) F.blob(-2.0+pk*0.8, 4.25, pz+1.45, 0.34,0.36, 0, (pk%2)?MOSWARMC[0]:PAL.mosaicWhite[0], 'mosaic');
      F.door(0, pz+0.05, 0,1, 1.9,2.5, PLANKC[2]); studs(F, 0,0,pz+0.09, 1.9,2.5);
      F.lantern(1.7, 2.9, pz+2.7, 0.9,13, 0.4);
      /* ---- the stair turret, with the bell on its wrought arch ---- */
      var tx=(v===1)?(X-2.6):(-X+2.6), tz=zR+0.6, TH=8.4;
      F.lathe(wfam, tx,tz, [[1.55,0],[1.45,2.2],[1.50,4.6],[1.40,7.0],[1.55,TH]], shade(red,0.05), { seg:14, rfn:function(q,ang){ return 1+0.035*Math.cos(ang*6); } });
      F.lathe('mosaic', tx,tz, [[1.62,1.10],[1.62,1.45]], band, { seg:14 });
      F.lathe('mosaic', tx,tz, [[1.64,TH-0.45],[1.64,TH]], PAL.mosaicWhite[0], { seg:14 });
      for(var sw=0;sw<5;sw++){ var sa=sw*1.25, sy=1.9+sw*1.25;                                   /* slit lights climbing the stair */
        F.window(tx+Math.cos(sa)*1.48, sy, tz+Math.sin(sa)*1.48, Math.cos(sa),Math.sin(sa), 0.42,0.95, {noReveal:true});
        F.box(tx+Math.cos(sa)*1.50, sy-0.72, tz+Math.sin(sa)*1.50, 0.62,0.10,0.10, Math.atan2(Math.cos(sa),Math.sin(sa)), white, 'plaster'); }
      F.mcone('tile', tx,TH,tz, 1.85,0.35,1.5, tile, 14, { under:true });
      F.ball(tx,TH+1.7,tz, 0.20, GILDC[0], 'metal');
      var bh=TH+0.1;
      F.tube('metal', [{x:tx-1.5,y:bh,z:tz+1.7,r:0.09},{x:tx-1.2,y:bh+1.4,z:tz+1.7,r:0.08},{x:tx,y:bh+2.05,z:tz+1.7,r:0.08},{x:tx+1.2,y:bh+1.4,z:tz+1.7,r:0.08},{x:tx+1.5,y:bh,z:tz+1.7,r:0.09}], TARNC[1], { seg:6 });
      F.box(tx,bh+1.78,tz+1.7, 1.5,0.16,0.18, 0, TIMBERC[1], 'timber');
      F.lathe('metal', tx,tz+1.7, [[0.16,bh+0.95],[0.52,bh+1.10],[0.58,bh+1.50],[0.42,bh+1.76]], GILDC[0], { seg:10 });
      F.ball(tx,bh+0.87,tz+1.7, 0.14, GILDC[2],'metal');
      /* ---- the walled teaching yard ---- */
      var YZ0=2.6, YZ1=14.0, YX=X+1.6;
      [-1,1].forEach(function(sg){ F.box(sg*YX,0,(YZ0+YZ1)/2, 0.5,1.05,YZ1-YZ0, 0, red, wfam); F.box(sg*YX,1.05,(YZ0+YZ1)/2, 0.68,0.26,YZ1-YZ0, 0, band, 'mosaic');
        for(var kp=0;kp<5;kp++) F.blob(sg*YX, 1.31, YZ0+1.4+kp*2.4, 0.32,0.34, 0, (kp%2)?MOSWARMC[0]:PAL.mosaicWhite[0], 'mosaic'); });
      F.box(0,0,YZ1, 2*YX,1.05,0.5, 0, red, wfam); F.box(0,1.05,YZ1, 2*YX+0.18,0.26,0.68, 0, band, 'mosaic');
      F.box(0,0,YZ1, 4.2,1.75,0.7, 0, red2, wfam); F.box(0,0,YZ1, 3.0,1.9,0.8, 0, VOIDC[1], 'dark');   /* the yard gate */
      for(var pq=0;pq<10;pq++) F.box(-18+pq*4.0, 0.02, YZ0+1.2, 3.4,0.07,2.6, 0, (pq%2)?PAL.pavingRich[0]:PAL.mosaicWhite[0], 'mosaic');
      F.box(0,0,YZ0-0.3, 2*YX,0.08,0.3, 0, PAL.paving[0], 'adobe');
      /* the well head */
      F.sector('mosaic', -13.0,10.6, 1.05,1.45, 0,TAU, 0,0.85, PAL.mosaicWhite[0], { faces:'tio' });
      F.sector('dark', -13.0,10.6, 0,1.05, 0,TAU, 0,0.55, VOIDC[0], { faces:'t' });
      [-1,1].forEach(function(sg){ F.rod(-13.0+sg*1.25,0.85,10.6, -13.0+sg*1.25,3.05,10.6, 0.09, TIMBERC[0], 'timber'); });
      F.rod(-14.25,3.05,10.6, -11.75,3.05,10.6, 0.09, TIMBERC[1], 'timber');
      F.cyl(-13.0,2.55,10.6, 0.10,0.45, 0, TIMBERC[3], 'timber'); F.lathe('plank', -13.0,10.6, [[0.26,2.05],[0.30,2.50]], PLANKC[1], { seg:8 });
      F.mcone('tile', -13.0,3.05,10.6, 1.9,0.25,1.1, tile, 12, { under:true });
      /* benches along the east wall, in the cloister idiom */
      F.box(YX-0.75,0,8.3, 0.95,0.5,9.0, 0, PAL.mosaicWhite[0], 'mosaic'); F.box(YX-0.30,0.5,8.3, 0.35,0.55,9.0, 0, MOSWARMC[0], 'mosaic');
      for(var bs=0;bs<5;bs++) F.blob(YX-0.75, 0.55, 4.6+bs*1.9, 0.3,0.28, 0, (bs%2)?band:MOSBLUEC[0], 'mosaic');
      /* teaching in the open: the registered school furniture under the shade tree */
      placeFurn(F,'order_writing_board', 4.6, 12.4, PI, 0, 1, (v===2)?1:0);
      placeFurn(F,'order_master_chair', 4.6, 10.6, PI, 0, 2, 0);
      placeFurn(F,'order_pupil_desk', 1.2, 8.2, PI, 0, 3, 1); placeFurn(F,'order_pupil_desk', 8.0, 8.2, PI, 0, 4, 0);
      placeFurn(F,'order_pupil_desk', 1.2, 5.8, PI, 0, 5, 0); placeFurn(F,'order_pupil_desk', 8.0, 5.8, PI, 0, 6, 1);
      placeFurn(F,'order_mat_rack', -3.4, 12.6, PI, 0, 7, (v===1)?1:0);
      F.tree(-8.2, 8.0, 'olive', 5.2); F.tree(13.0, 11.6, 'pine', 8.0); F.tree(-17.0, 5.0, 'shrub', 1.3); F.tree(16.0, 4.4, 'shrub', 1.1);
      F.lantern(-6.5, 2.6, 12.6, 0.8, 12, 0);
    } });

  /* =====================================================================================================
     15. FURNITURE  (culture 'order': the Historians' library and school fittings)
     Registered here so the catalogue and the buildings can never drift apart; the buildings place them
     with placeFurn() below.
     ===================================================================================================== */
  var BOOKC=[PLANKC[3],TILEC[0],BLUEDC[0],MOSWARMC[4],PAL.paintRed[0],TIMBERC[2],MOSGREENC[2],GILDC[3],BLUEDC[2],TILEC[3]];

  FURN({ key:'order_bookcase', name:'Library bookcase', culture:'order', room:'library', w:3.4, d:0.85, h:5.15, variants:2,
    variantNames:['tall range','gallery case'],
    build:function(F){ var h=F.variant?2.9:5.15, dep=0.80, nsh=F.variant?2:4, w=3.4, zb=-dep/2;
      /* an OPEN-FRONTED carcass: back, two sides, top and bottom, so the spines are seen */
      F.box(0,0,zb+0.06, w,h,0.12, 0, TIMBERC[1], 'timber');
      [-1,1].forEach(function(sg){ F.box(sg*(w/2-0.06),0,0, 0.12,h,dep, 0, TIMBERC[1], 'timber'); });
      F.box(0,0,0, w,0.16,dep, 0, TIMBERC[3], 'timber');
      F.box(0,h-0.18,0, w+0.14,0.18,dep+0.10, 0, TIMBERC[0], 'timber');                      /* cornice */
      F.box(0,0,dep/2-0.02, w+0.10,0.16,0.12, 0, TIMBERC[3], 'timber');                      /* plinth rail */
      for(var sh=0;sh<nsh;sh++){ var y=0.30+sh*1.05;
        F.box(0, y-0.09, 0, w-0.16,0.09,dep-0.10, 0, TIMBERC[3], 'timber');                  /* shelf board */
        for(var b=0;b<3;b++){ var off=(b-1)*(w/3);
          F.box(off, y, 0.05, w/3-0.14,0.66,0.46, 0, F.pick(BOOKC), 'plank');                /* a block of spines */
          F.box(off, y, 0.30, w/3-0.16,0.60,0.05, 0, F.pick(BOOKC), 'plank');
          if(F.chance(0.5)) F.box(off+F.rr(-0.35,0.35), y, 0.26, 0.12,0.52,0.20, F.rr(-0.3,0.3), F.pick(BOOKC), 'plank'); } }
      if(!F.variant) F.box(0,h-0.02,0, w-0.5,0.22,dep*0.7, 0, F.pick([MOSBLUEC[0],MOSWARMC[0]]), 'mosaic'); } });

  FURN({ key:'order_reading_table', name:'Reading table and benches', culture:'order', room:'library', w:2.9, d:3.0, h:0.82, variants:2,
    variantNames:['open books','with lamp'],
    build:function(F){
      F.box(0,0.72,0, 2.8,0.10,1.15, 0, PLANKC[1], 'plank');
      F.box(0,0.60,0, 2.5,0.12,0.40, 0, PLANKC[2], 'plank');                                  /* the stretcher shelf */
      [-1,1].forEach(function(sg){ F.box(sg*1.15,0,0, 0.18,0.72,0.90, 0, TIMBERC[0], 'timber');
        F.box(sg*1.05,0.42,0, 0.09,0.09,0.90, 0, TIMBERC[3], 'timber');
        F.box(0,0.42,sg*1.05, 2.4,0.09,0.34, 0, PLANKC[2], 'plank');                          /* bench */
        [-0.85,0.85].forEach(function(bx){ F.box(bx,0,sg*1.05, 0.14,0.42,0.30, 0, TIMBERC[0], 'timber'); }); });
      F.box(0.62,0.80,0.10, 0.52,0.06,0.38, 0.30, F.pick(BOOKC), 'plank');
      F.box(-0.70,0.80,-0.12, 0.46,0.07,0.34, -0.22, F.pick(BOOKC), 'plank');
      if(F.variant===1){ F.cyl(0,0.82,0, 0.10,0.34, 0, BRASSC[0], 'metal'); F.lantern(0, 1.30, 0, 0.55, 7, 0); }
      else F.box(0,0.80,0, 0.5,0.05,0.34, 0.1, PLANKC[0], 'plank'); } });

  FURN({ key:'order_lectern', name:'Reading lectern', culture:'order', room:'library', w:0.95, d:0.85, h:1.35, variants:2,
    variantNames:['plain','gilded'],
    build:function(F){ F.cyl(0,0,0, 0.30,0.10, 0, TIMBERC[3], 'timber');
      F.lathe('timber', 0,0, [[0.16,0.10],[0.10,0.40],[0.13,0.72],[0.09,1.00]], TIMBERC[0], { seg:8 });
      F.box(0,1.00,0, 0.86,0.10,0.66, [0.44,0,0], PLANKC[0], 'plank');
      F.box(0,1.12,0.02, 0.44,0.07,0.32, [0.44,0,0], F.pick(BOOKC), 'plank');
      F.box(0,0.96,0.30, 0.86,0.07,0.10, 0, TIMBERC[3], 'timber');
      if(F.variant===1){ F.box(0,1.04,-0.30, 0.90,0.06,0.10, 0, GILDC[0], 'metal'); F.ball(0,1.28,-0.30, 0.09, GILDC[0], 'metal'); } } });

  FURN({ key:'order_library_ladder', name:'Library ladder', culture:'order', room:'library', w:0.75, d:1.15, h:4.20, variants:1,
    build:function(F){ var lean=0.85, h=4.2;
      [-1,1].forEach(function(sg){ F.rod(sg*0.30,0,0.42, sg*0.30,h,0.42-lean, 0.055, TIMBERC[2], 'timber'); });
      for(var r=0;r<9;r++){ var t=r/9; F.box(0, 0.22+r*0.44, 0.42-lean*((0.22+r*0.44)/h), 0.60,0.05,0.10, 0, TIMBERC[2], 'timber'); }
      F.box(0,h-0.05,0.42-lean, 0.66,0.08,0.14, 0, TIMBERC[0], 'timber'); } });

  FURN({ key:'order_globe_stand', name:'Gilded globe on its pedestal', culture:'order', room:'library', w:2.4, d:2.4, h:3.85, variants:2,
    variantNames:['globe','armillary'],
    build:function(F){ F.lathe('plaster', 0,0, [[1.15,0],[0.85,0.5],[0.55,1.7],[0.80,2.0]], STONEC[2], { seg:12 });
      F.cyl(0,2.0,0, 0.90,0.12, 0, MOSBLUEC[0], 'mosaic');
      if(F.variant===0){ F.ball(0,2.95,0, 0.85, GILDC[0], 'metal');
        for(var b=0;b<3;b++) F.cyl(0,2.10+b*0.62,0, 0.87-Math.abs(b-1)*0.12, 0.05, 0, MOSBLUEC[2], 'mosaic'); }
      else { for(var r=0;r<3;r++){ var a=r*PI/3; F.tube('metal', (function(){ var pts=[]; for(var k=0;k<=12;k++){ var t=k/12*PI;
            pts.push({ x:Math.cos(a)*0.82*Math.sin(t), y:2.12+0.82-0.82*Math.cos(t), z:Math.sin(a)*0.82*Math.sin(t), r:0.05 }); } return pts; })(), GILDC[0], { seg:5 }); }
        F.ball(0,2.94,0, 0.22, GILDC[2], 'metal'); } } });

  FURN({ key:'order_pupil_desk', name:'Pupils’ bench-desk', culture:'order', room:'school', w:2.5, d:1.25, h:0.78, variants:2,
    variantNames:['two places','four places'],
    build:function(F){ var n=F.variant?4:2;
      F.box(0,0.62,-0.18, 2.4,0.08,0.62, [ -0.12,0,0], PLANKC[1], 'plank');                    /* sloped desk top */
      F.box(0,0.50,-0.46, 2.4,0.14,0.10, 0, PLANKC[0], 'plank');
      F.box(0,0.20,0.10, 2.4,0.42,0.08, 0, PLANKC[2], 'plank');                                /* the front apron */
      F.box(0,0.58,0.12, 2.4,0.10,0.12, 0, PLANKC[0], 'plank');
      [-1,1].forEach(function(sg){ F.box(sg*1.12,0,-0.18, 0.12,0.62,0.60, 0, TIMBERC[0], 'timber');
        F.box(sg*1.05,0,0.36, 0.10,0.40,0.30, 0, TIMBERC[0], 'timber'); });
      F.box(0,0.40,0.36, 2.4,0.08,0.32, 0, PLANKC[2], 'plank');                                /* the bench */
      for(var i=0;i<n;i++){ var lx=(i-(n-1)/2)*(2.2/n);
        F.box(lx,0.68,-0.30, 0.34,0.05,0.24, 0, F.pick(BOOKC), 'plank');
        if(F.chance(0.5)) F.box(lx+0.14,0.70,-0.10, 0.16,0.03,0.12, 0.2, PAL.mosaicWhite[0], 'plank'); } } });

  FURN({ key:'order_master_chair', name:'Master’s chair', culture:'order', room:'school', w:0.85, d:0.95, h:1.45, variants:1,
    build:function(F){ [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){ F.cyl(s[0]*0.33,0,s[1]*0.36, 0.055,0.46, 0, TIMBERC[0], 'timber'); });
      F.box(0,0.46,0, 0.80,0.09,0.80, 0, PLANKC[1], 'plank');
      F.box(0,0.55,-0.36, 0.80,0.85,0.10, 0, PLANKC[0], 'plank');
      F.box(0,0.70,-0.30, 0.56,0.50,0.05, 0, MOSBLUEC[0], 'mosaic');
      F.box(0,1.36,-0.36, 0.86,0.10,0.16, 0, TIMBERC[3], 'timber'); F.ball(0,1.52,-0.36, 0.09, GILDC[0], 'metal');
      [-1,1].forEach(function(sg){ F.box(sg*0.38,0.55,0, 0.07,0.26,0.72, 0, TIMBERC[0], 'timber'); }); } });

  FURN({ key:'order_writing_board', name:'Slate writing board', culture:'order', room:'school', w:2.3, d:0.75, h:1.95, variants:2,
    variantNames:['slate','slate with abacus'],
    build:function(F){ [-1,1].forEach(function(sg){ F.rod(sg*0.95,0,0.28, sg*0.80,1.85,-0.06, 0.06, TIMBERC[0], 'timber');
      F.rod(sg*0.95,0,-0.28, sg*0.80,1.85,-0.06, 0.06, TIMBERC[0], 'timber'); });
      F.box(0,0.70,-0.04, 2.20,1.20,0.10, [ -0.06,0,0], TIMBERC[1], 'timber');
      F.box(0,0.76,0.03, 2.00,1.05,0.06, [ -0.06,0,0], PAL.paintBlack[0], 'plaster');
      F.box(0,0.66,0.07, 2.10,0.10,0.16, 0, PLANKC[2], 'plank');
      for(var c=0;c<3;c++) F.box(-0.7+c*0.5,0.74,0.10, 0.12,0.04,0.04, 0, PAL.mosaicWhite[0], 'plank');
      if(F.variant===1){ for(var r=0;r<4;r++){ F.rod(-0.85,1.05+r*0.20,0.14, 0.85,1.05+r*0.20,0.14, 0.02, BRASSC[0], 'metal');
        for(var b=0;b<6;b++) F.ball(-0.75+b*0.28, 1.05+r*0.20, 0.14, 0.055, F.pick([MOSBLUEC[0],MOSWARMC[0],MOSGREENC[0]]), 'mosaic'); } } } });

  /* w covers x -1.20..+0.87 centred (the mat rolls grow from their base along -x and hang 0.29 m out of the
     left end: KNOWN_ISSUES.md); h covers the basket on variant 1. */
  FURN({ key:'order_mat_rack', name:'Rack of rolled mats', culture:'order', room:'school', w:2.4, d:0.70, h:1.70, variants:2,
    variantNames:['four mats','six mats and a basket'],
    build:function(F){ [-1,1].forEach(function(sg){ F.box(sg*0.82,0,0, 0.10,1.35,0.62, 0, TIMBERC[0], 'timber'); });
      F.box(0,0.55,0, 1.70,0.08,0.58, 0, PLANKC[2], 'plank'); F.box(0,1.25,0, 1.74,0.09,0.62, 0, PLANKC[0], 'plank');
      var n=F.variant?6:4;
      for(var i=0;i<n;i++){ var lx=(i-(n-1)/2)*(1.5/n), lo=i%2;
        F.cyl(lx,0.63+lo*0.0,0, 0.14,0.58, [0,0,PI/2], F.pick(CLOTHC), 'cloth');
        F.cyl(lx,0.10,0, 0.13,0.52, [0,0,PI/2], F.pick(CLOTHC), 'cloth'); }
      if(F.variant===1) F.lathe('thatch', 0.55,0, [[0.24,1.34],[0.30,1.52],[0.26,1.66]], THATCHC[1], { seg:10 }); } });

  /* place a registered piece from inside an ASSET's local frame */
  function placeFurn(F, key, lx,lz, yaw, ly, seedOff, variant){ var q=F.p(lx,lz);
    buildFurn(key, q[0], q[1], F.ry+(yaw||0), { y:F.y+(ly||0), seed:((F.seed||1)*31+(seedOff||0))|0, variant:variant||0, wealth:F.wealth }); }

})();
