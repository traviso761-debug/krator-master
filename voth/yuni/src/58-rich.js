/* ============================== 16d. ASSETS: WEALTHY COMPOUNDS + THE EMIR'S PALACE ==============================
   Agent "rich". Gaudi x Burmecia x Sahel: parabolic portals, undulating parapets, trencadis caps, Hausa polychrome
   relief, Tiebele painted drums, horn pinnacles (zanko), toron posts, cloisters. Geometry only through F (+ push for
   one flattened blob), colours only from PAL. */
reseed(580001);
(function(){
  var PI=Math.PI, TRI={ box:12, fr8:12, fr5:12, pyr:12, cyl:40, cyl6:10, cone:20, dome:132, blob:49, ball:63 };
  var WHITE=0xffffff, WARM=0xf0e6d0;
  var BLUEGREY=BLUEGREYC[2], BLUEGREY2=BLUEGREYC[0];   /* Burmecia rain-washed stone, now a palette entry */
  /* triangle bookkeeping (window._richTris) so the budgets in API.md can be checked */
  function triNow(){ var n=0,k; for(k in BUCKET) n+=BUCKET[k].list.length*(TRI[BUCKET[k].shape]||12); for(k in MBK) n+=MBK[k].tris; return n; }
  function counted(fn){ return function(F){ var t0=triNow(); fn(F); (window._richTris||(window._richTris={}))[F.asset.key+'/'+F.variant]=triNow()-t0; }; }
  function ang(nx,nz){ return Math.atan2(nx,nz); }
  function TREE(F,kind,lx,lz,h){ F.tree(lx,lz,kind,h); }   /* trees now come from F's own stream */

  /* ---------- shared vocabulary ---------- */
  /* a flattened leafy / bowl blob (kit 'blob' with non-uniform scale) */
  function eblob(F,lx,ly,lz,sx,sy,sz,rot,c,f){ var q=F.p(lx,lz); push('blob', f||'leafy', [q[0],F.y+ly,q[1],sx,sy,sz, (typeof rot==='number'||rot==null)?F.ry+(rot||0):[rot[0],F.ry+rot[1],rot[2]], c]); }
  /* tall PARABOLIC window: lit pane behind a moulded parabolic frame that stands proud of the wall */
  function pwin(F,x,y,z,nx,nz,w,h,col,fam,noRev){
    F.window(x,y,z,nx,nz,w,h, noRev?{ noReveal:true }:null);
    F.archwall(fam||'relief', x+nx*0.15, y-h/2, z+nz*0.15, ang(nx,nz), w+0.5, h+0.4, 0.24, w-0.04, h-0.02, col, { seg:5, noBack:true, colIn:shade(col,-0.35) });
  }
  /* a bulging Gaudi/Burmecia balcony: slab, bowl underside, three rails */
  function balcony(F,x,y,z,nx,nz,w,col,railCol,railFam){
    var a=ang(nx,nz), dpt=1.1, cx=x+nx*dpt/2, cz=z+nz*dpt/2, tx=nz, tz=-nx;
    F.box(cx,y-0.18,cz, w,0.18,dpt, a, col,'plaster');
    eblob(F, cx-nx*0.25, y-0.18, cz-nz*0.25, (Math.abs(tx)>0.5?w*0.46:dpt*0.62), 0.75, (Math.abs(tx)>0.5?dpt*0.62:w*0.46), [PI,0,0], shade(col,-0.10), 'plaster');
    F.box(x+nx*(dpt-0.06), y, z+nz*(dpt-0.06), w,0.85,0.10, a, railCol, railFam||'relief');
    F.box(x+nx*dpt/2+tx*(w/2-0.05), y, z+nz*dpt/2+tz*(w/2-0.05), 0.10,0.85,dpt, a, railCol, railFam||'relief');
    F.box(x+nx*dpt/2-tx*(w/2-0.05), y, z+nz*dpt/2-tz*(w/2-0.05), 0.10,0.85,dpt, a, railCol, railFam||'relief');
  }
  /* engaged buttress that ends in a horn pinnacle (zanko): one 6-sided lathe */
  function butt(F,x,z,r,h,col,fam,tip,y0){ y0=y0||0;
    F.lathe(fam||'adobe', x,z, [[r*1.25,y0],[r*0.8,y0+h],[r*0.62,y0+h+0.02,tip],[0.03,y0+h+r*2.8,tip]], col, { seg:5 }); }
  /* a horn pinnacle on a parapet */
  function horn(F,x,y,z,s,col,fam){ F.cone(x,y,z, 0.30*s, 1.5*s, 0, col, fam||'plaster'); }
  function hornRow(F,ax,az,bx,bz,y,n,s,col,fam,skipEnds,col2,fam2){ for(var i=0;i<n;i++){ var t=n>1?i/(n-1):0.5; if(skipEnds&&(i===0||i===n-1)) continue;
    var alt=(col2!=null && i%2===1); F.pyr(ax+(bx-ax)*t, y, az+(bz-az)*t, 0.55*s,1.5*s,0.55*s, 0, alt?col2:col, alt?(fam2||'mosaic'):(fam||'plaster')); } }
  /* UNDULATING parapet: a wall strip whose top edge is a wave (Casa Mila). (nx,nz) = outward normal */
  function wavy(F,fam,ax,az,bx,bz,y0,h0,amp,waves,T,col,nx,nz,n,phase){
    n=n||10; var px=nx*T/2, pz=nz*T/2, i;
    function hh(t){ return y0+h0+amp*(0.5-0.5*Math.cos(t*waves*2*PI+(phase||0))); }
    for(i=0;i<n;i++){ var t0=i/n, t1=(i+1)/n, x0=ax+(bx-ax)*t0, z0=az+(bz-az)*t0, x1=ax+(bx-ax)*t1, z1=az+(bz-az)*t1, h0_=hh(t0), h1_=hh(t1);
      F.quad(fam,[x0+px,y0,z0+pz],[x1+px,y0,z1+pz],[x1+px,h1_,z1+pz],[x0+px,h0_,z0+pz],col,[nx,0,nz]);
      F.quad(fam,[x0-px,y0,z0-pz],[x1-px,y0,z1-pz],[x1-px,h1_,z1-pz],[x0-px,h0_,z0-pz],col,[-nx,0,-nz]);
      F.quad(fam,[x0+px,h0_,z0+pz],[x1+px,h1_,z1+pz],[x1-px,h1_,z1-pz],[x0-px,h0_,z0-pz],shade(col,0.06),[0,1,0]); }
    F.quad(fam,[ax+px,y0,az+pz],[ax-px,y0,az-pz],[ax-px,hh(0),az-pz],[ax+px,hh(0),az+pz],col,[ax-bx,0,az-bz]);
    F.quad(fam,[bx+px,y0,bz+pz],[bx-px,y0,bz-pz],[bx-px,hh(1),bz-pz],[bx+px,hh(1),bz+pz],col,[bx-ax,0,bz-az]);
  }
  /* curved wall, local polar angle phi: dir = (sin phi, cos phi), 0 = front */
  function curveWall(F,fam,cx,cz,R,a0,a1,y0,h,T,col,n,hfn){
    n=n||8; for(var i=0;i<n;i++){ var A=a0+(a1-a0)*i/n, B=a0+(a1-a0)*(i+1)/n, sa=Math.sin(A), ca=Math.cos(A), sb=Math.sin(B), cb=Math.cos(B), ri=R-T/2, ro=R+T/2;
      var ha=y0+h*(hfn?hfn(i/n):1), hb=y0+h*(hfn?hfn((i+1)/n):1), m=[(sa+sb)/2,0,(ca+cb)/2];
      F.quad(fam,[cx+sa*ro,y0,cz+ca*ro],[cx+sb*ro,y0,cz+cb*ro],[cx+sb*ro,hb,cz+cb*ro],[cx+sa*ro,ha,cz+ca*ro],col,m);
      F.quad(fam,[cx+sa*ri,y0,cz+ca*ri],[cx+sb*ri,y0,cz+cb*ri],[cx+sb*ri,hb,cz+cb*ri],[cx+sa*ri,ha,cz+ca*ri],shade(col,-0.08),[-m[0],0,-m[2]]);
      F.quad(fam,[cx+sa*ro,ha,cz+ca*ro],[cx+sb*ro,hb,cz+cb*ro],[cx+sb*ri,hb,cz+cb*ri],[cx+sa*ri,ha,cz+ca*ri],shade(col,0.06),[0,1,0]); }
  }
  /* Casa Mila "warrior" chimney: a twisted little lathe under a trencadis helmet */
  function warrior(F,x,y,z,s,col,cap){
    F.lathe('plaster', x,z, [[0.42*s,y],[0.32*s,y+1.0*s],[0.50*s,y+1.6*s],[0.40*s,y+1.8*s]], col, { seg:5 });
    F.cone(x,y+1.7*s,z, 0.52*s,0.95*s, 0, cap, 'mosaic'); }
  /* light blunt tower for compounds (same profile as the city wall's BLUNT_TOWER, a quarter of the triangles) */
  function ltower(F,x,z,R,h,o){
    o=o||{}; var fam=o.fam||'plaster', col=o.col, fl=o.flutes||6, amp=0.06, pts=[], n=7, i, seg=o.seg||12;
    for(i=0;i<=n;i++){ var t=i/n; t=t<0.5?t:0.5+0.5*Math.pow((t-0.5)/0.5,0.8); if(t>0.93) t=0.93; pts.push([bluntR(R,t), h*t, i<1?shade(col,-0.12):col]); }
    F.lathe(fam, x,z, pts, col, { seg:seg, rfn:function(q,a){ return 1+amp*Math.cos(a*fl); } });   /* rfn's angle is the asset's own, so the flutes turn with the building */
    var bf=o.bandFam||'mosaic';
    [0.50,0.74].forEach(function(t,k){ var r=bluntR(R,t)*(1+amp)+0.08; F.lathe(bf, x,z, [[r,h*t-0.5],[r*0.985,h*t+0.5]], k&&bf==='mosaic'?MOSBLUEC[3]:o.band, { seg:seg }); });
    var rc=bluntR(R,0.93)+0.10;
    var g1=o.cap, g2=o.cap2!=null?o.cap2:MOSGREENC[1], g3=o.cap3!=null?o.cap3:GILDC[0];   /* trencadis that shifts colour up the cap */
    if(o.bulb){ F.lathe('mosaic', x,z, [[rc*0.9,h*0.93-0.1,g1],[rc*1.28,h*0.93+rc*0.7,g1],[rc*1.1,h*0.93+rc*1.5,g2],[rc*0.35,h*0.93+rc*2.3,g3],[0.05,h*0.93+rc*3.3,g3]], g1, { seg:seg }); }
    else F.lathe('mosaic', x,z, [[rc,h*0.93-0.1,g1],[rc*0.8,h*0.93+rc*0.62,g2],[0.04,h*0.93+rc*1.15,g3]], g1, { seg:seg });
    var top=h*0.93+(o.bulb?rc*3.3:rc*1.15); F.rod(x,top-0.2,z, x,top+1.4,z, 0.06, GILDC[0],'metal'); F.pyr(x,top+1.3,z, 0.42,0.6,0.42, PI/4, GILDC[2],'metal'); F.pyr(x,top+1.32,z, 0.42,0.3,0.42, [PI,PI/4,0], GILDC[2],'metal');
    (o.win||[0.34,0.58]).forEach(function(t,k){ for(var w=0;w<(o.nwin||3);w++){ var a=(w/(o.nwin||3))*2*PI+(o.winA||0)+k*0.6, a8=Math.round(a/(2*PI/fl))*(2*PI/fl), r=bluntR(R,t)*(1+amp)+0.02;
      F.window(x+Math.sin(a8)*r, h*t, z+Math.cos(a8)*r, Math.sin(a8),Math.cos(a8), 0.6,1.5, { noReveal:true });
      F.archband(o.bandFam==='paintbw'?'paintbw':'mosaic', x+Math.sin(a8)*(r+0.03), h*t-0.75, z+Math.cos(a8)*(r+0.03), a8, 0.62,1.05, 0.22,0, o.band, { seg:6 }); } });
  }
  /* a battered round drum house with a rolled parapet and a flat roof inside it */
  /* inward-facing ring (the inside of a round parapet) */
  function ringIn(F,fam,x,z,r,y0,y1,col,seg){ for(var i=0;i<seg;i++){ var A=i/seg*2*PI, B=(i+1)/seg*2*PI, m=(A+B)/2;
    F.quad(fam,[x+Math.sin(A)*r,y0,z+Math.cos(A)*r],[x+Math.sin(B)*r,y0,z+Math.cos(B)*r],[x+Math.sin(B)*r,y1,z+Math.cos(B)*r],[x+Math.sin(A)*r,y1,z+Math.cos(A)*r],col,[-Math.sin(m),0,-Math.cos(m)]); } }
  function drum(F,x,z,R,H,col,fam,seg){ seg=seg||14; ringIn(F,fam||'adobe',x,z,R*0.84,H-0.05,H+0.5,shade(col,-0.1),seg); F.lathe(fam||'adobe',x,z,[[R*0.84,H-0.05],[0.02,H-0.02]],PAL.lane[1],{ seg:seg });
    F.lathe(fam||'adobe', x,z, [[R*1.07,0,shade(col,-0.1)],[R,1.0],[R*0.93,H],[R*0.9,H+0.5],[R*0.84,H+0.54]], col, { seg:seg }); }
  function drumBand(F,x,z,R,H,y0,y1,fam,col,seg){ function rr_(y){ return R*(1.0-0.07*(y-1)/(H-1))+0.05; } F.lathe(fam, x,z, [[rr_(y0),y0],[rr_(y1),y1]], col, { seg:seg||14 }); }
  function drumR(R,H,y){ return y<1 ? R*(1.07-0.07*y) : R*(1.0-0.07*(y-1)/(H-1)); }
  function gatePoint(F,lx,lz){ var q=F.p(lx,lz); (F.doors||(F.doors=[])).unshift([q[0],F.y,q[1]]); }

  /* =====================================================================================
     1. FAMILY COMPOUND  30 x 26 */
  ASSET({ key:'rich_family_compound', name:'Prominent family compound', family:'rich', districts:['core','prosper'], wealth:[0.72,1.0], w:30, d:26, h:16, variants:4,
    build:counted(function(F){
      var v=F.variant, TR=[
        { wall:WHITEC[0],  fam:'plaster', accF:'mosaic',  acc:MOSBLUEC[0], acc2:MOSBLUEC[3], tint:MOSBLUEC[0], cap:MOSBLUEC[1] },
        { wall:ADOBEC[2],  fam:'adobe',   accF:'paintcol',acc:WHITE,       acc2:MOSWARMC[0], tint:WHITE,       cap:MOSWARMC[0] },
        { wall:ADOBEC[0],  fam:'adobe',   accF:'paintbw', acc:WARM,        acc2:ADOBEREDC[0],tint:WARM,        cap:MOSWARMC[1] },
        { wall:BLUEGREY,   fam:'plaster', accF:'mosaic',  acc:MOSBLUEC[2], acc2:MOSBLUEC[4], tint:MOSBLUEC[2], cap:MOSBLUEC[2] } ][v];
      var wall=TR.wall, fam=TR.fam, gx=[-4.5,0,0,6][v], FZ=12.3, PH=3.0, i;
      /* perimeter wall (front wall split round the gatehouse) */
      F.box(0,0,-12.6, 29.6,PH,0.55, 0, wall,fam); F.box(-14.55,0,0, 0.55,PH,24.8, 0, wall,fam); F.box(14.55,0,0, 0.55,PH,24.8, 0, wall,fam);
      var xl=-14.8, xr=14.8, g0=gx-3.6, g1=gx+3.6;
      F.box((xl+g0)/2,0,FZ, g0-xl,PH,0.55, 0, wall,fam); F.box((xr+g1)/2,0,FZ, xr-g1,PH,0.55, 0, wall,fam);
      F.box(0,PH,-12.6, 29.8,0.22,0.8, 0, shade(wall,0.05),fam);
      [[-14.3,FZ-0.1],[14.3,FZ-0.1]].forEach(function(c){ butt(F,c[0],c[1],0.5,PH+0.5,wall,fam, v===0||v===3?TR.cap:shade(wall,0.1)); });
      /* gatehouse: deep slab, parabolic portal, accent archivolt, melting one-hump parapet */
      var GW=7.2, GH=6.0, GT=2.6, gz=FZ-GT/2+0.2;
      F.archwall(fam, gx,0,gz, 0, GW,GH,GT, 3.2,4.5, wall, { colIn:shade(wall,-0.2), seg:10, pointed:2.2 });
      F.archband(TR.accF, gx,0,gz+GT/2+0.05, 0, 3.2,4.5, 0.6,0, TR.acc, { seg:12, pointed:2.2 });
      if(v===1||v===2) F.box(gx,GH-1.0,gz+GT/2+0.03, GW-0.3,0.8,0.08, 0, TR.acc,TR.accF);
      wavy(F,fam, gx-GW/2,gz+GT/2-0.25, gx+GW/2,gz+GT/2-0.25, GH,0.35,1.25,1, 0.5, wall, 0,1, 8);
      F.box(gx,GH,gz-GT/2+0.25, GW,0.5,0.5, 0, wall,fam);
      butt(F,gx-GW/2,gz+GT/2-0.35,0.55,GH+0.4,wall,fam,TR.cap); butt(F,gx+GW/2,gz+GT/2-0.35,0.55,GH+0.4,wall,fam,TR.cap);
      F.lantern(gx-2.5,2.7,gz+GT/2+0.32, 0.9,13,0); F.lantern(gx+2.5,2.7,gz+GT/2+0.32, 0.9,13,0);
      gatePoint(F,gx,FZ+1.2);

      if(v!==2){
        /* rectangular main house, battered (fr8) except the tall Burmecia one */
        var hx=[-2.5,0,0,3][v], hz=[-7.6,-8,0,-7.0][v], hw=[20,17,0,15][v], hd=[8.6,8,0,9.6][v], H=[7.0,7.2,0,10.2][v], st=v===3?3:2, box=(v===3), k=box?0:0.16;
        var zf=function(y){ return hz+hd/2*(1-k*y/H); }, xf=function(y){ return hw/2*(1-k*y/H); };
        if(box){ F.box(hx,0,hz, hw,H,hd, 0, wall,fam); [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(function(c){ butt(F,hx+c[0]*hw/2,hz+c[1]*hd/2,0.75,H+0.3,BLUEGREY2,fam,TR.cap); }); }
        else F.fr8(hx,0,hz, hw,H,hd, 0, wall,fam);
        var tw=hw*(1-k), td=hd*(1-k);
        wavy(F,fam, hx-tw/2,hz+td/2-0.22, hx+tw/2,hz+td/2-0.22, H-0.02,0.45,0.8,v===1?3:4, 0.44, wall, 0,1, 12, PI);
        F.box(hx,H-0.02,hz-td/2+0.22, tw,0.7,0.44, 0, wall,fam); F.box(hx-tw/2+0.22,H-0.02,hz, 0.44,0.7,td-0.5, 0, wall,fam); F.box(hx+tw/2-0.22,H-0.02,hz, 0.44,0.7,td-0.5, 0, wall,fam);
        /* accent frieze under the parapet + (polychrome variant) the whole upper facade */
        F.box(hx,H-1.0,zf(H-0.6)+0.0, tw+0.2,0.6,0.12, 0, TR.acc,TR.accF);
        if(v===1) F.box(hx,3.9,zf(5.2)+0.04, hw*0.9,2.5,0.10, [-0.0,0,0], WHITE,'paintcol');
        if(v===3) F.box(hx,3.5,hz+hd/2, hw+0.1,0.4,0.14, 0, MOSBLUEC[0],'mosaic'), F.box(hx,6.8,hz+hd/2, hw+0.1,0.4,0.14, 0, MOSBLUEC[3],'mosaic');
        /* cloister along the court side, roofed */
        var nb=v===3?4:5, bw=(hw-1.5)/nb, az=hz+hd/2+2.7;
        F.arcade(v===3?'plaster':fam, hx,0,az, 0, nb,bw,3.7,0.6, v===0?WHITEC[2]:wall, { pier:0.9, head:0.75, seg:5, noBack:true, colIn:TR.acc2 });
        F.box(hx,3.7,az-1.45, nb*bw,0.28,3.5, 0, shade(wall,-0.04),fam);
        F.box(hx,3.98,az+0.12, nb*bw,0.5,0.3, 0, wall,fam);
        F.door(hx,zf(0)+0.02, 0,1, 1.3,2.3, PLANKC[v%4]);
        /* windows */
        for(var s=1;s<st;s++){ var wy=s*3.4+1.9, nw=v===3?3:5; for(i=0;i<nw;i++){ var wx=hx+(i-(nw-1)/2)*(hw*0.8/nw+0.6);
          if(v===3||v===0) pwin(F,wx,wy,zf(wy)+0.02,0,1, 0.8,v===3?2.0:1.6, v===3?BLUEGREY2:TR.acc2, v===3?'relief':'mosaic'); else F.window(wx,wy,zf(wy)+0.03,0,1, 0.8,1.2); } }
        if(v===3){ balcony(F,hx,7.55,hz+hd/2,0,1, 2.8, BLUEGREY2, MOSBLUEC[0],'mosaic'); }
        F.window(hx-xf(5)-0.03,5.2,hz, -1,0, 0.8,1.2); F.window(hx+xf(5)+0.03,5.2,hz, 1,0, 0.8,1.2);
        F.window(hx-3,2.0,zf(2)+0.03,0,1,0.8,1.1); F.window(hx+3,2.0,zf(2)+0.03,0,1,0.8,1.1);
        /* warrior chimneys */
        for(i=0;i<2;i++) warrior(F, hx+(i-0.5)*tw*0.5+F.rr(-0.5,0.5), H-0.05, hz-td*0.18+F.rr(-0.6,0.6), F.rr(0.9,1.15), v===3?BLUEGREY2:WHITEC[1], i%2?TR.cap:TR.acc2===WHITE?MOSWARMC[2]:TR.acc2);
        /* wings */
        if(v===0){ F.fr8(-10.6,0,2.2, 6.6,4.0,11, 0, wall,fam); F.box(-10.6,4.0,2.2, 5.0,0.5,8.8, 0, shade(wall,-0.03),fam); F.window(-10.6+3.1,2.1,2.2,1,0,0.8,1.1); F.window(-10.6+3.12,2.1,5,1,0,0.8,1.1); F.door(-10.6+3.22,-0.8,1,0,1.1,2.2,PLANKC[1]); warrior(F,-10.6,4.4,4.5,0.9,WHITEC[1],TR.cap); }
        if(v===1){ [-1,1].forEach(function(sd){ F.fr8(sd*11,0,1.2, 6.2,3.9,11.5, 0, wall,fam); F.box(sd*11-sd*2.62,2.6,1.2, 0.1,0.9,9, 0, WHITE,'paintcol'); F.window(sd*11-sd*2.95,1.9,-1.5,-sd,0,0.8,1.0); F.window(sd*11-sd*2.95,1.9,3.5,-sd,0,0.8,1.0); hornRow(F,sd*11-2.3,1.2-4.3,sd*11-2.3,1.2+4.3,3.85,2,0.8,wall,fam); hornRow(F,sd*11+2.3,1.2-4.3,sd*11+2.3,1.2+4.3,3.85,2,0.8,wall,fam); }); }
        if(v===3){ F.box(-9.5,0,-7.5, 9,4.2,7, 0, wall,fam); F.box(-9.5,4.2,-7.5, 9.3,0.35,7.3, 0, BLUEGREY2,fam); pwin(F,-10.5,2.3,-3.98,0,1,0.8,1.9,BLUEGREY2,'relief'); pwin(F,-7.5,2.3,-3.98,0,1,0.8,1.9,BLUEGREY2,'relief'); }
        /* the blunt tower */
        if(v===0) ltower(F, 11.2,8.6, 2.5,13.5, { col:wall, band:TR.acc, cap:MOSBLUEC[1], winA:PI });
        if(v===1) ltower(F, -7.6,-9.3, 2.4,14.5, { fam:'adobe', col:wall, band:WHITE, bandFam:'paintcol', cap:MOSWARMC[0], winA:0 });
        if(v===3) ltower(F, hx-hw/2-0.6,hz+hd/2+0.4, 2.3,15.0, { col:BLUEGREY2, band:MOSBLUEC[0], cap:MOSBLUEC[2], bulb:true, winA:0, flutes:8 });
        /* garden */
        if(v===0){ TREE(F,'olive',5,4.5,5.5); }
        if(v===1){ TREE(F,'olive',4,6.5,5.8); }
        if(v===3){ TREE(F,'cypress',-11.5,6,9); TREE(F,'cypress',-8.5,8,8); F.box(-3,0,5, 5,0.35,3.4, 0, BLUEGREY2,fam); F.box(-3,0.3,5, 4.2,0.1,2.6, 0, MOSBLUEC[3],'mosaic'); }
      } else {
        /* (c) TIEBELE: painted ochre drums round a court, low curved forecourt walls */
        var R0=5.6, H0=6.8, mz=-6.4;
        drum(F,0,mz,R0,H0,wall,fam,16); drumBand(F,0,mz,R0,H0,1.2,3.0,'paintbw',WARM,16); drumBand(F,0,mz,R0,H0,H0-1.7,H0-0.1,'paintbw',WARM,16);
        [-1,1].forEach(function(sd){ var dx=sd*9.0, dz=-2.2, R1=3.7, H1=4.3; drum(F,dx,dz,R1,H1,sd<0?ADOBEC[4]:ADOBEC[1],fam,10); drumBand(F,dx,dz,R1,H1,H1-2.2,H1-0.15,'paintbw',WARM,10);
          F.door(dx-sd*Math.sin(0.9)*drumR(R1,H1,1),dz+Math.cos(0.9)*drumR(R1,H1,1), -sd*Math.sin(0.9),Math.cos(0.9), 1.0,2.1, PLANKC[2]);
          F.window(dx+sd*0.0,2.9,dz+drumR(R1,H1,2.9)+0.02, 0,1, 0.7,0.8, { noReveal:true }); });
        F.box(0,0,mz+0.5, 16,3.6,4.2, 0, ADOBEREDC[0],fam); F.box(0,3.6,mz+0.5, 16.2,0.3,4.4, 0, wall,fam);
        var dr=drumR(R0,H0,1.0); F.door(0,mz+dr+0.0, 0,1, 1.3,2.3, PLANKC[0]); F.archband('paintbw', 0,0,mz+drumR(R0,H0,1.6)+0.12, 0, 1.7,2.75, 0.45,0.1, WARM, { seg:10 });
        for(i=0;i<4;i++){ var a=[-0.75,0.75,-2.2,2.2][i], wy2=4.6; F.window(Math.sin(a)*(drumR(R0,H0,wy2)+0.02),wy2,mz+Math.cos(a)*(drumR(R0,H0,wy2)+0.02), Math.sin(a),Math.cos(a), 0.7,0.9, { noReveal:true }); }
        /* cloister between the side drums */
        F.arcade(fam, 0,0,mz+R0+2.3, 0, 3,3.4,3.4,0.55, ADOBEC[4], { pier:0.9, head:0.7, seg:5, noBack:true, colIn:ADOBEREDC[1] });
        F.box(0,3.4,mz+R0+0.9, 10.2,0.26,3.2, 0, ADOBEC[3],fam);
        /* low curved forecourt walls (Tiebele) with painted faces */
        curveWall(F,'paintbw', -9.0,-2.2, 5.6, -0.2,1.35, 0,1.25,0.4, WARM, 6, function(t){ return 1-0.45*t; });
        curveWall(F,'paintbw',  9.0,-2.2, 5.6, -1.35,0.2, 0,1.25,0.4, WARM, 6, function(t){ return 0.55+0.45*t; });
        warrior(F,-2.2,H0-0.05,mz-1.5,1.0,ADOBEC[4],MOSWARMC[1]); warrior(F,2.0,H0-0.05,mz+0.8,1.1,ADOBEC[4],MOSWARMC[2]); warrior(F,-9,4.25,-2.6,0.85,ADOBEC[4],MOSWARMC[0]);
        ltower(F, -11.3,8.4, 2.4,13.0, { fam:'adobe', col:ADOBEC[2], band:WARM, bandFam:'paintbw', cap:MOSWARMC[1], winA:PI/2 });
        TREE(F,'olive',8.5,7.5,5.5); TREE(F,'shrub',-4,8.5,1.1);
      }
    }) });

  /* round window: coloured ring, dark disc, lit pane */
  function roundWin(F,x,y,z,nx,nz,r,col,fam){ F.roundWindow(x,y,z, nx,nz, r, col, 6); }
  function torons(F,x0,z0,x1,z1,y,n,nx,nz,len){ for(var i=0;i<n;i++){ var t=(i+0.5)/n; F.toron(x0+(x1-x0)*t,y,z0+(z1-z0)*t,nx,nz,len||0.9); } }

  /* =====================================================================================
     2. MERCHANT PRINCE'S HOUSE  20 x 16 : loggia of giant parabolic arches, piano nobile, roof pavilion, toron flanks */
  ASSET({ key:'rich_merchant_palace', name:"Merchant prince's town palace", family:'rich', districts:['core','prosper','market'], wealth:[0.7,1.0], w:20, d:16, h:18, variants:3,
    build:counted(function(F){
      var v=F.variant, TR=[
        { wall:WHITEC[0], wall2:WHITEC[1], fam:'plaster', accF:'mosaic',  acc:MOSBLUEC[0], acc2:MOSBLUEC[3], cap:MOSBLUEC[1] },
        { wall:ADOBEC[2], wall2:ADOBEREDC[0], fam:'adobe', accF:'paintcol',acc:WHITE,     acc2:MOSWARMC[0], cap:MOSWARMC[1] },
        { wall:BLUEGREY,  wall2:BLUEGREY2, fam:'plaster', accF:'mosaic',  acc:MOSBLUEC[2], acc2:MOSBLUEC[4], cap:MOSBLUEC[2] } ][v];
      var wall=TR.wall, fam=TR.fam, W=18, GH=5.0, UH=6.8, TOP=GH+UH, zb=-7.5, zfr=6.8, i;
      /* ground: rear block + paved loggia behind the giant arcade */
      F.box(0,0,-2.75, W-0.4,GH,9.5, 0, TR.wall2,fam);
      F.box(0,0,4.4, W-0.6,0.22,5.0, 0, PAL.pavingRich[0],'adobe');
      var n=[3,4,2][v], bw=[5.8,4.4,6.3][v], ax=v===2?2.4:0;
      F.arcade(fam, ax,0,zfr-0.45, 0, n,bw,GH,0.9, wall, { pier:v===1?1.3:1.6, head:0.7, seg:10, pointed:2.1, colIn:TR.acc2, famIn:v===1?'adobe':'mosaic' });
      for(i=0;i<n;i++) F.archband(TR.accF, ax+(i-(n-1)/2)*bw,0,zfr+0.04, 0, bw-(v===1?1.3:1.6),GH-0.7, 0.45,0, TR.acc, { seg:10, pointed:2.1 });
      [-1,1].forEach(function(sd){ if(v===2&&sd<0) return; F.archwall(fam, sd*(W/2-0.45),0,4.25, sd*PI/2, 4.5,GH,0.9, 2.6,3.9, wall, { seg:8, colIn:TR.acc2 }); });
      if(v===2) F.box(-7.4,0,4.25, 2.6,GH,4.5, 0, wall,fam);
      var dox=ax+(n%2?0:-bw/2); F.door(dox,2.0+0.02, 0,1, 1.5,2.5, PLANKC[v]); F.archband(TR.accF, dox,0,2.0+0.1, 0, 1.9,3.0, 0.4,0, TR.acc, { seg:8 });
      for(i=0;i<n;i++){ var bx=ax+(i-(n-1)/2)*bw; if(Math.abs(bx-dox)>1) F.window(bx,2.2,2.03,0,1, 1.4,1.6); }
      F.lantern(dox,3.4,4.6, 1.0,14, 1.2); F.lantern(ax-(n>2?bw:bw/2),2.9,zfr+0.35, 0.8,12,0); F.lantern(ax+(n>2?bw:bw/2),2.9,zfr+0.35, 0.8,12,0);
      /* the upper block (piano nobile + attic storey) rides on the arcade */
      F.box(0,GH,-0.35, W,UH,14.3, 0, wall,fam);
      F.box(0,GH-0.05,zfr+0.03, W+0.1,0.5,0.12, 0, TR.acc,TR.accF);
      F.box(0,GH+3.7,zfr+0.03, W+0.1,v===1?1.1:0.45,0.12, 0, TR.acc,TR.accF);
      var nw=[5,4,4][v], sp=[3.3,4.2,3.6][v], ox=v===2?1.6:0;
      for(i=0;i<nw;i++){ var wx=ox+(i-(nw-1)/2)*sp; pwin(F,wx,GH+1.95,zfr+0.02,0,1, 0.95,2.3, v===1?ADOBEREDC[1]:TR.wall2, v===0?'mosaic':'relief');
        if(v===0?(i===2):v===1?(i===1||i===2):(i===1||i===3)) balcony(F,wx,GH+0.75,zfr,0,1, v===0?4.4:2.2, TR.wall2, v===1?PLANKC[1]:TR.acc, v===1?'plank':'mosaic');
        F.window(wx,GH+5.2,zfr+0.03,0,1, 0.8,1.0); }
      [-1,1].forEach(function(sd){ for(i=0;i<3;i++){ F.window(sd*(W/2+0.03),GH+2.0,-5+i*4.2, sd,0, 0.8,1.4); }
        torons(F, sd*W/2,-6.8, sd*W/2,6.4, GH+4.1, 6, sd,0); torons(F, sd*W/2,-6.8, sd*W/2,6.4, TOP-0.7, 6, sd,0); });
      for(i=0;i<3;i++) F.window(-5+i*5,GH+2.0,zb-0.03, 0,-1, 0.8,1.4);
      /* rounded corners: engaged buttress-columns that end in horns */
      [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(function(c){ if(v===2&&c[0]<0&&c[1]>0) return; butt(F,c[0]*(W/2-0.1),c[1]>0?zfr-0.25:zb+0.2,0.8,TOP+0.9,wall,fam,TR.cap); });
      /* parapets: undulating front and back, horned flanks */
      wavy(F,fam, -W/2,zfr-0.25, W/2,zfr-0.25, TOP,0.5,0.85,v===1?4:3, 0.5, wall, 0,1, 12, PI);
      F.box(0,TOP,zb+0.25, W,0.8,0.5, 0, wall,fam);
      [-1,1].forEach(function(sd){ F.box(sd*(W/2-0.25),TOP,-0.28, 0.5,0.8,13.4, 0, wall,fam); hornRow(F, sd*(W/2-0.25),-5, sd*(W/2-0.25),4.5, TOP+0.78, 4,0.9, v===1?wall:TR.cap, v===1?fam:'mosaic'); });
      /* roof pavilion */
      var pz=-2.2, PW=7.6, PD=5.2, PH=3.1, py=TOP-0.02;
      F.arcade(fam, 0,py,pz+PD/2-0.25, 0, 2,PW/2,PH,0.5, TR.wall2, { pier:1.0, head:0.6, seg:6, colIn:TR.acc2 });
      F.box(-PW/2+0.25,py,pz, 0.5,PH,PD, 0, TR.wall2,fam); F.box(PW/2-0.25,py,pz, 0.5,PH,PD, 0, TR.wall2,fam); F.window(-PW/2-0.03,py+1.6,pz,-1,0,0.8,1.3); F.window(PW/2+0.03,py+1.6,pz,1,0,0.8,1.3);
      F.box(0,py,pz-PD/2+0.25, PW,PH,0.5, 0, TR.wall2,fam); F.box(0,py+PH,pz, PW+0.5,0.3,PD+0.5, 0, wall,fam);
      if(v===1){ hornRow(F,-PW/2,pz+PD/2,PW/2,pz+PD/2,py+PH+0.28,4,0.9,wall,fam); hornRow(F,-PW/2,pz-PD/2,PW/2,pz-PD/2,py+PH+0.28,4,0.9,wall,fam); F.box(0,py+PH+0.3,pz+PD/2+0.2, PW,0.6,0.1, 0, WHITE,'paintcol'); }
      else { F.lathe('mosaic',0,pz,[[2.5,py+PH+0.28,TR.cap],[2.1,py+PH+1.3,TR.acc2],[1.1,py+PH+2.1,TR.cap],[0.05,py+PH+2.5,TR.cap]],TR.cap,{ seg:10 }); finial(F,0,py+PH+2.45,pz,0.8); }
      warrior(F,-6.2,TOP,-4.8,1.15,TR.wall2,TR.cap); warrior(F,6.4,TOP,2.6,1.1,TR.wall2,TR.acc2===WHITE?MOSWARMC[2]:TR.acc2);
      /* the roof terrace is living space: stair head, pots, a vine awning, a water jar */
      F.box(-6.4,TOP,-0.6, 2.4,2.3,2.6, 0, TR.wall2,fam); F.box(-6.4,TOP+2.3,-0.6, 2.7,0.3,2.9, 0, wall,fam);
      F.door(-6.4,-0.6+1.32, 0,1, 1.0,2.0, PLANKC[1], TOP); F.lantern(-5.0,TOP+2.2,-0.6, 0.7,11,0);
      [[-6.0,4.4],[-3.2,5.0],[7.0,-1.0]].forEach(function(q,qi){ F.lathe('tile', q[0],q[1], [[0.42,TOP],[0.52,TOP+0.5],[0.34,TOP+0.75]], TILEC[qi%4], { seg:7 });
        eblob(F,q[0],TOP+0.7,q[1], 0.75,0.75,0.75, qi, PAL.shrub[qi%4],'leafy'); });
      [-1,1].forEach(function(sd){ F.rod(2.0,TOP,sd*2.6+2.6, 2.0,TOP+2.4,sd*2.6+2.6, 0.09, TIMBERC[0],'timber'); F.rod(7.2,TOP,sd*2.6+2.6, 7.2,TOP+2.4,sd*2.6+2.6, 0.09, TIMBERC[0],'timber'); });
      F.beam(2.0,TOP+2.4,0.0, 7.2,TOP+2.4,0.0, 0.14,0.14, TIMBERC[1],'timber'); F.beam(2.0,TOP+2.4,5.2, 7.2,TOP+2.4,5.2, 0.14,0.14, TIMBERC[1],'timber');
      for(i=0;i<5;i++) F.beam(2.2+i*1.25,TOP+2.5,0.0, 2.2+i*1.25,TOP+2.5,5.2, 0.10,0.10, TIMBERC[2],'timber');
      F.box(4.6,TOP+2.52,2.6, 5.4,0.06,5.2, 0, AWNINGC[v%6],'cloth');
      F.lathe('adobe', 8.0,3.6, [[0.85,TOP],[1.05,TOP+0.9],[0.7,TOP+1.5],[0.78,TOP+1.65]], ADOBEC[1], { seg:9 });
      eblob(F,-5.6,TOP,3.4, 1.0,0.9,0.8, 0.3, PAL.shrub[1],'leafy');
      if(v===2) ltower(F, -6.7,4.9, 2.1,17.2, { col:BLUEGREY2, band:MOSBLUEC[0], cap:MOSBLUEC[2], bulb:true, winA:0.5, nwin:2, win:[0.30,0.50,0.66] });
    }) });

  /* =====================================================================================
     3. PAINTED TERRACE APARTMENTS ('afrobldg')  34 x 22 : four stepped earth storeys on fat parabolic arches */
  ASSET({ key:'rich_terrace_apartments', name:'Painted terrace apartments', family:'rich', districts:['core','prosper'], wealth:[0.55,0.95], w:34, d:22, h:19, variants:2,
    build:counted(function(F){
      var v=F.variant, LH=3.5, zb=-10.4, i, L, reds=ADOBEREDC;
      for(L=0;L<4;L++){
        var y=L*LH, zf=10.3-3.5*L, x0,x1;
        if(v===0){ x0=-(15.2-1.9*L); x1=15.2-1.9*L; } else { x0=-10.6; x1=15.4-4.6*L; }
        var Wd=x1-x0, cx=(x0+x1)/2, nb=Math.max(2,Math.round(Wd/5.6)), bw=Wd/nb, col=reds[L%4], pf=(L%2===0)?'paintbw':'paintcol', pt=(L%2===0)?WARM:WHITE;
        F.box(cx,y,(zb+zf-1.6)/2, Wd,LH,(zf-1.6)-zb, 0, shade(col,-0.05),'adobe');
        F.arcade('adobe', cx,y,zf-0.8, 0, nb,bw,LH,1.6, col, { pier:1.5, head:0.75, seg:6, pointed:2.7, noBack:true, colIn:shade(col,-0.25) });
        for(i=0;i<nb;i++){ var bx=cx+(i-(nb-1)/2)*bw;
          F.archband(pf, bx,y,zf+0.04, 0, bw-1.5,LH-0.75, 0.42,0, pt, { seg:8, pointed:2.7 });
          if(L===0&&i===Math.floor(nb/2)) F.door(bx,zf-1.6+0.02,0,1, 1.4,2.3, PLANKC[2]); else F.window(bx,y+1.55,zf-1.57,0,1, 1.5,1.7);
          if(i>0 && (L+i)%2===1 && L>0) roundWin(F, bx-bw/2,y+2.2,zf, 0,1, 0.55, (L%2===0)?MOSWARMC[2]:MOSGREENC[2],pf); }
        /* the painted parapet band of the terrace above + a rolled earth coping */
        F.box(cx,y+LH-0.05,zf+0.02, Wd+0.2,0.95,0.5, 0, pt,pf);
        F.tube('adobe', [{x:x0-0.2,y:y+LH+0.95,z:zf+0.02,r:0.36},{x:x1+0.2,y:y+LH+0.95,z:zf+0.02,r:0.36}], shade(col,0.08), { seg:6, cap:true });
        /* rounded ends: fat painted drums that swallow the corners */
        [x0,x1].forEach(function(ex,k){ if(v===1&&k===0) return; var rr0=1.55; F.lathe((L%2===0)?'paintcol':'paintbw', ex,zf-1.5, [[rr0*1.05,y],[rr0,y+LH+0.5]], pt, { seg:8 }); F.lathe('adobe', ex,zf-1.5, [[rr0,y+LH+0.5],[rr0*0.8,y+LH+1.15],[0.03,y+LH+1.5]], shade(col,0.05), { seg:8 }); });
        /* side parapets of this terrace + planting */
        if(L<3){ var zn=zf-3.5; F.box(x0+0.25,y+LH,(zf+zn)/2-0.8, 0.5,0.9,3.5-1.6, 0, col,'adobe'); F.box(x1-0.25,y+LH,(zf+zn)/2-0.8, 0.5,0.9,3.5-1.6, 0, col,'adobe'); }
        var np=2; for(i=0;i<np;i++){ var px=x0+2.5+(Wd-5)*(i+F.rr(0.2,0.8))/np; eblob(F,px,y+LH+0.5,zf-0.5, F.rr(1.0,1.6),F.rr(0.7,1.0),0.9, F.rr(0,3), PAL.palm[(i+L)%3],'leafy');
          if(F.chance(0.4)) eblob(F,px+0.3,y+LH-0.4,zf+0.22, 0.7,1.1,0.25, 0, PAL.crop[2],'leafy'); }
      }
      /* top: roof parapet, warrior chimneys, back wall windows */
      var xt0=v===0?-9.5:-10.6, xt1=v===0?9.5:1.6, yT=4*LH;
      F.box((xt0+xt1)/2,yT,zb+0.25, xt1-xt0,0.8,0.5, 0, reds[1],'adobe');
      warrior(F,xt0+2,yT,-6,1.2,reds[2],MOSWARMC[0]); warrior(F,xt1-2.5,yT,-7.5,1.0,reds[2],MOSGREENC[0]);
      for(L=0;L<4;L++) for(i=L%2;i<4;i+=2){ var wx=(xt0+xt1)/2+(i-1.5)*((xt1-xt0)/4.4); F.window(wx,L*LH+1.7,zb-0.03, 0,-1, 0.8,1.1); }
      F.lantern(-2.9,2.6,10.3+0.4, 0.9,13,0); F.lantern(2.9,2.6,10.3+0.4, 0.9,13,0);
      if(v===1){ /* the painted stair drum */
        var dx=-13.0, dz=3.2, R=3.5, H=16.0; drum(F,dx,dz,R,H,reds[0],'adobe',14);
        drumBand(F,dx,dz,R,H,2.6,3.6,'paintbw',WARM,14); drumBand(F,dx,dz,R,H,6.0,7.0,'paintcol',WHITE,14); drumBand(F,dx,dz,R,H,9.4,10.4,'paintbw',WARM,14); drumBand(F,dx,dz,R,H,13.2,15.4,'paintcol',WHITE,14);
        for(i=0;i<5;i++){ var a=-0.9+i*0.55, yy=1.8+i*2.75, r=drumR(R,H,yy)+0.02; if(i===0) continue; roundWin(F,dx+Math.sin(a)*r,yy+0.9,dz+Math.cos(a)*r, Math.sin(a),Math.cos(a), 0.5, MOSGREENC[2],'paintbw'); }
        F.door(dx,dz+drumR(R,H,1)+0.0, 0,1, 1.2,2.2, PLANKC[0]); F.archband('paintbw', dx,0,dz+drumR(R,H,1.5)+0.12, 0, 1.6,2.6, 0.4,0.08, WARM, { seg:8 });
        F.lathe('mosaic', dx,dz, [[R*0.84,H+0.4,MOSWARMC[1]],[R*0.62,H+1.3,MOSGREENC[0]],[R*0.3,H+1.9,GILDC[0]],[0.04,H+2.2,GILDC[2]]], MOSWARMC[1], { seg:14 });
        F.box(-13.8,0,-5.2, 5.6,2*LH,10.2, 0, reds[3],'adobe'); F.box(-13.8,2*LH,-5.2, 5.9,0.7,10.5, 0, WARM,'paintbw');
      }
    }) });

  function finial(F,x,y,z,s){ F.rod(x,y-0.3,z, x,y+1.7*s,z, 0.07*s, GILDC[0],'metal');
    F.pyr(x,y+0.75*s,z, 0.62*s,0.5*s,0.62*s, PI/4, GILDC[2],'metal'); F.pyr(x,y+0.77*s,z, 0.62*s,0.45*s,0.62*s, [PI,PI/4,0], GILDC[2],'metal');
    F.pyr(x,y+1.45*s,z, 0.3*s,0.95*s,0.3*s, PI/4, GILDC[2],'metal'); }
  /* a coping of broken tile along a straight run: the parapet caps of the palace */
  function coping(F,ax,az,bx,bz,y,t,col,col2){ var L=Math.hypot(bx-ax,bz-az), n=Math.max(2,Math.round(L/5.5)), i;
    for(i=0;i<n;i++){ var t0=i/n, t1=(i+1)/n, x0=ax+(bx-ax)*t0, z0=az+(bz-az)*t0, x1=ax+(bx-ax)*t1, z1=az+(bz-az)*t1;
      F.tube('mosaic', [{x:x0,y:y,z:z0,r:t},{x:x1,y:y,z:z1,r:t}], (i%2)?(col2!=null?col2:col):col, { seg:4 }); } }
  /* a waist-high tiled dado along a wall run */
  function dado(F,ax,az,bx,bz,y,h,th,col,nx,nz){ var mx=(ax+bx)/2, mz=(az+bz)/2, L=Math.hypot(bx-ax,bz-az), a=Math.atan2(bx-ax,bz-az);
    F.box(mx+nx*th*0.5, y, mz+nz*th*0.5, L, h, th, a+PI/2, col, 'mosaic'); }

  /* =====================================================================================
     4. THE EMIR'S PALACE  70 x 56 : gate block + fluted towers, domed audience hall, two cloistered courts, private wing, cypress garden */
  ASSET({ key:'rich_emir_palace', name:"The Emir's Palace", family:'rich', districts:['core'], wealth:[0.9,1.0], w:70, d:56, h:26, variants:1,
    build:counted(function(F){
      var OCH=ADOBEC[4], OCH2=ADOBEC[2], RED=ADOBEREDC[0], WH=WHITEC[0], i, PH=4.6;
      /* ---- perimeter, horned ---- */
      F.box(0,0,-27.3, 69.2,PH,0.8, 0, OCH,'adobe'); F.box(-34.3,0,-0.4, 0.8,PH,54.4, 0, OCH,'adobe'); F.box(34.3,0,-0.4, 0.8,PH,54.4, 0, OCH,'adobe');
      [-1,1].forEach(function(sd){ F.box(sd*26.2,0,26.5, 17,PH,0.8, 0, OCH,'adobe'); F.box(sd*26.2,PH-1.1,26.92, 16.4,0.8,0.08, 0, WHITE,'paintcol');
        F.box(sd*26.2,1.0,26.92, 16.4,0.5,0.10, 0, MOSGREENC[0],'mosaic');
        hornRow(F, sd*19.5,26.5, sd*32,26.5, PH-0.02, 5,1.0, OCH,'adobe', false, MOSWARMC[0],'mosaic');
        hornRow(F, sd*34.3,-23, sd*34.3,22.5, PH-0.02, 10,1.0, OCH,'adobe', false, MOSBLUEC[0],'mosaic');
        butt(F, sd*33.3,26.0, 1.25,PH+1.6, OCH2,'adobe', MOSBLUEC[0]); butt(F, sd*33.3,-26.3, 1.25,PH+1.6, OCH2,'adobe', MOSBLUEC[0]);
        coping(F, sd*34.3,-26.6, sd*34.3,26.0, PH+0.16, 0.34, MOSBLUEC[0], MOSGREENC[0]);
        coping(F, sd*18.2,26.5, sd*34.0,26.5, PH+0.16, 0.34, MOSWARMC[0], MOSBLUEC[3]); });
      hornRow(F, -30,-27.3, -16,-27.3, PH-0.02, 5,1.0, OCH,'adobe', false, MOSGREENC[0],'mosaic');
      hornRow(F, 16,-27.3, 30,-27.3, PH-0.02, 5,1.0, OCH,'adobe', false, MOSGREENC[0],'mosaic');
      coping(F, -34.0,-27.3, 34.0,-27.3, PH+0.16, 0.34, MOSBLUEC[0], MOSWARMC[0]);
      /* ---- the gate block: deep parabolic portal, polychrome relief front, mosaic archivolt ---- */
      var GW=21, GH=13, GT=7, gz=23.1, gf=gz+GT/2;
      F.archwall('adobe', 0,0,gz, 0, GW,GH,GT, 6.2,9.4, OCH, { seg:14, pointed:2.15, colIn:OCH2 });
      F.archwall('paintcol', 0,0.02,gf+0.08, 0, GW-0.5,GH-0.5,0.2, 6.2,9.4, WHITE, { seg:14, pointed:2.15, noBack:true, noTop:true, colIn:MOSBLUEC[0], famIn:'mosaic' });
      F.archband('mosaic', 0,0,gf+0.22, 0, 6.2,9.4, 0.75,0.12, MOSBLUEC[0], { seg:16, pointed:2.15 });
      F.archband('mosaic', 0,0,gf+0.26, 0, 7.7,10.15, 0.3,0.05, MOSWARMC[0], { seg:16, pointed:2.15 });
      /* relief bands above and below the polychrome front, a green tiled dado, a gilded sunburst over the arch */
      [-1,1].forEach(function(sd){ F.box(sd*(GW/4+1.5),0,gf+0.16, GW/2-3.2,1.1,0.34, 0, MOSGREENC[0],'mosaic');
        F.box(sd*(GW/4+1.5),1.1,gf+0.2, GW/2-3.2,0.55,0.26, 0, shade(OCH,0.16),'relief'); });
      F.box(0,GH-2.6,gf+0.18, GW-0.5,0.8,0.3, 0, shade(OCH,0.18),'relief');
      F.box(0,GH-0.8,gf+0.22, GW-0.5,0.4,0.26, 0, MOSWARMC[0],'mosaic');
      F.disc(0,GH-1.15,gf+0.34, 0,1, 1.15, 0.30, GILDC[0],'metal');           /* the sunburst rides clear above the balcony */
      for(i=0;i<12;i++){ var sa=i/12*2*PI, r0=1.25, r1=2.05;
        F.beam(Math.sin(sa)*r0,GH-1.15+Math.cos(sa)*r0,gf+0.32, Math.sin(sa)*r1,GH-1.15+Math.cos(sa)*r1,gf+0.32, 0.15,0.15, GILDC[i%2?2:1],'metal'); }
      /* the gilded gate leaves, set deep in the passage */
      [-1,1].forEach(function(sd){ F.box(sd*1.5,0,gz-GT/2+0.25, 2.9,7.0,0.24, 0, GILDC[sd>0?0:1],'metal');
        F.disc(sd*1.5,4.6,gz-GT/2+0.4, 0,1, 0.62, 0.18, GILDC[2],'metal'); });
      wavy(F,'adobe', -GW/2,gf-0.35, GW/2,gf-0.35, GH,0.5,1.3,5, 0.7, OCH, 0,1, 20, PI);
      for(i=0;i<5;i++) horn(F, -GW/2+GW*(i+0.5)/5, GH+1.7, gf-0.35, 1.25, [MOSWARMC[3],MOSGREENC[0],MOSBLUEC[0],MOSGREENC[0],MOSWARMC[3]][i],'mosaic');
      coping(F, -GW/2,gf-0.35, GW/2,gf-0.35, GH+1.75, 0.38, MOSBLUEC[0], MOSWARMC[0]);
      F.box(0,GH,gz-GT/2+0.35, GW,1.1,0.7, 0, OCH,'adobe'); hornRow(F,-GW/2+1,gz-GT/2+0.35,GW/2-1,gz-GT/2+0.35,GH+1.08,6,1.0,OCH,'adobe', false, MOSBLUEC[0],'mosaic');
      F.box(0,GH-1.4,gz-GT/2+0.36, GW-2,0.7,0.12, 0, WHITE,'paintcol');   /* the court face of the gate is painted too */
      for(i=0;i<4;i++){ var wx=[-8.2,-5.2,5.2,8.2][i]; pwin(F,wx,7.2,gf+0.2,0,1, 0.8,1.9, PAL.paintGreen[0],'plaster'); F.window(wx,3.0,gf+0.2,0,1,0.7,1.0); }
      balcony(F,0,9.9,gf+0.1,0,1, 4.6, OCH2, GILDC[0],'metal'); pwin(F,0,10.7,gf+0.2,0,1, 1.1,1.7, MOSBLUEC[0],'mosaic');
      F.lantern(-4.3,3.4,gf+0.5, 1.2,18,0); F.lantern(4.3,3.4,gf+0.5, 1.2,18,0); F.lantern(0,6.6,gz, 1.0,16,1.6); F.lantern(0,5.0,gz-GT/2-0.6, 0.8,14,0);
      gatePoint(F,0,27.6);
      /* ---- two blunt fluted towers ---- */
      [-1,1].forEach(function(sd){ ltower(F, sd*14.4,22.4, 3.6,22, { fam:'adobe', col:OCH2, band:MOSGREENC[0], cap:MOSBLUEC[1], cap2:MOSGREENC[1], cap3:GILDC[0], flutes:8, seg:16, nwin:4, win:[0.30,0.45,0.62], winA:sd*0.3 });
        F.lathe('paintcol', sd*14.4,22.4, [[bluntR(3.6,0.10)*1.06+0.06,1.2],[bluntR(3.6,0.2)*1.06+0.05,4.4]], WHITE, { seg:16 }); });
      /* ---- first court: a tiled pool, a cypress pair, a colonnade against the gate's inner face ---- */
      F.box(0,0,13.0, 13.6,0.5,6.6, 0, STONEC[0],'plaster'); F.box(0,0.42,13.0, 12.4,0.16,5.4, 0, MOSBLUEC[0],'mosaic');
      F.box(0,0.30,13.0, 11.4,0.16,4.4, 0, MOSBLUEC[3],'mosaic');
      [-1,1].forEach(function(sd){ F.lathe('mosaic', sd*5.4,13.0, [[0.55,0.5],[0.72,1.0],[0.5,1.35]], MOSGREENC[0], { seg:8 });
        F.tree(sd*8.6,17.6,'cypress',11); F.tree(sd*9.4,8.6,'olive',5.5); });
      F.arcade('plaster', 0,0,19.0, PI, 5,3.6,4.2,0.7, WH, { pier:1.0, head:0.85, seg:6, noBack:true, colIn:MOSBLUEC[3], famIn:'mosaic' });
      for(i=0;i<5;i++) F.archband('mosaic', (i-2)*3.6,0,18.62, PI, 2.6,3.35, 0.3,0, i%2?MOSGREENC[0]:MOSWARMC[0], { seg:8 });
      F.box(0,4.2,19.35, 18.4,0.4,1.4, 0, WHITEC[1],'plaster'); coping(F, -9.0,19.35, 9.0,19.35, 4.66, 0.3, MOSBLUEC[0], MOSGREENC[0]);
      F.lantern(-9.6,3.0,19.2, 0.9,14,0); F.lantern(9.6,3.0,19.2, 0.9,14,0);
      /* ---- first court: cloistered side ranges ---- */
      [-1,1].forEach(function(sd){ var rx=sd*21.6;
        F.box(rx,0,12.6, 6.2,5.6,13.6, 0, OCH,'adobe'); F.box(rx,5.6,12.6, 6.5,0.5,13.9, 0, OCH2,'adobe');
        F.arcade('plaster', sd*16.4,0,12.6, -sd*PI/2, 4,3.4,4.3,0.6, WH, { pier:0.9, head:0.8, seg:6, noBack:true, colIn:MOSBLUEC[3], famIn:'mosaic' });
        F.box(sd*17.5,4.3,12.6, 2.6,0.3,13.6, 0, WHITEC[1],'plaster'); F.box(sd*16.3,4.6,12.6, 0.4,0.45,13.6, 0, WH,'plaster');
        for(i=0;i<4;i++) F.archband('mosaic', sd*16.4,0,12.6-(i-1.5)*3.4, -sd*PI/2, 2.5,3.5, 0.3,0, i%2?MOSBLUEC[0]:MOSGREENC[0], { seg:8 });
        coping(F, sd*16.3,5.9, sd*16.3,19.3, 5.08, 0.30, MOSBLUEC[0], MOSWARMC[0]);
        coping(F, rx,5.8, rx,19.4, 6.16, 0.34, MOSGREENC[0], MOSBLUEC[3]);
        hornRow(F, rx-sd*3,6.4, rx-sd*3,18.8, 6.08, 5,0.9, OCH,'adobe', false, MOSWARMC[0],'mosaic');
        dado(F, sd*15.2,6.2, sd*15.2,19.0, 0, 1.1, 0.16, MOSGREENC[0], -sd,0);   /* the tiled dado of the cloister */
        for(i=0;i<3;i++) F.window(rx-sd*3.13,2.2,8.4+i*4.2, -sd,0, 0.8,1.3);
        F.door(rx-sd*3.12,12.6-2.1, -sd,0, 1.2,2.3, GILDC[1]); });
      /* ---- the audience hall and its mosaic dome ---- */
      var HW=27, HD=18, HH=9.6, hz=-3, k=0.16;
      function hzf(y){ return hz+HD/2*(1-k*y/HH); } function hxf(y){ return HW/2*(1-k*y/HH); }
      F.fr8(0,0,hz, HW,HH,HD, 0, WH,'plaster'); F.box(0,0,hz, HW+0.3,1.15,HD+0.3, 0, MOSGREENC[2],'mosaic');   /* a tiled dado all round the hall */
      F.box(0,1.15,hz, HW+0.24,0.34,HD+0.24, 0, MOSWARMC[0],'mosaic');
      F.arcade('plaster', 0,0,hz+HD/2+1.7, 0, 5,4.5,7.4,0.9, WHITEC[2], { pier:1.2, head:1.0, seg:8, pointed:2.15, colIn:MOSBLUEC[3], famIn:'mosaic' });
      for(i=0;i<5;i++) F.archband('mosaic', (i-2)*4.5,0,hz+HD/2+2.2, 0, 3.3,6.4, 0.4,0, i%2?MOSGREENC[0]:MOSBLUEC[0], { seg:10, pointed:2.15 });
      F.box(0,7.4,hz+HD/2+0.2, 22.5,0.4,3.9, 0, WHITEC[1],'plaster'); F.box(0,7.8,hz+HD/2+1.95, 22.5,0.7,0.4, 0, MOSBLUEC[2],'mosaic');
      F.door(0,hzf(0)+0.02, 0,1, 2.4,3.4, GILDC[0]); F.archband('mosaic', 0,0,hzf(1.8)+0.2, 0, 3.0,4.2, 0.55,0.2, MOSWARMC[0], { seg:12 });
      [-1,1].forEach(function(sd){ for(i=0;i<3;i++){ var wz=hz-5+i*5; F.window(sd*(hxf(4.2)+0.03),4.2,wz, sd,0, 1.0,2.6); }
        F.window(sd*7.5,4.0,hzf(4.0)+0.03,0,1, 1.0,2.2); F.window(sd*4.2,4.0,hzf(4.0)+0.03,0,1, 1.0,2.2);
        butt(F, sd*(HW/2-0.7),hz+HD/2-0.7, 1.2,HH+1.2, WH,'plaster', MOSBLUEC[0]); butt(F, sd*(HW/2-0.7),hz-HD/2+0.7, 1.2,HH+1.2, WH,'plaster', MOSBLUEC[0]); });
      var tw=HW*(1-k), td=HD*(1-k);
      wavy(F,'plaster', -tw/2,hz+td/2-0.3, tw/2,hz+td/2-0.3, HH-0.02,0.5,1.0,6, 0.6, WH, 0,1, 18, PI);
      F.box(0,HH-0.02,hz-td/2+0.3, tw,0.9,0.6, 0, WH,'plaster');
      [-1,1].forEach(function(sd){ F.box(sd*(tw/2-0.3),HH-0.02,hz, 0.6,0.9,td-0.6, 0, WH,'plaster'); hornRow(F, sd*(tw/2-0.3),hz-td/2+2, sd*(tw/2-0.3),hz+td/2-2, HH+0.85, 5,1.0, MOSBLUEC[0],'mosaic', false, MOSWARMC[0],'mosaic');
        coping(F, sd*(tw/2-0.3),hz-td/2+0.4, sd*(tw/2-0.3),hz+td/2-0.4, HH+0.92, 0.34, MOSGREENC[0], MOSBLUEC[3]); });
      for(i=0;i<6;i++) horn(F, -tw/2+tw*(i+0.5)/6, HH+1.45, hz+td/2-0.3, 1.1, i%2?MOSWARMC[0]:MOSGREENC[0],'mosaic');
      coping(F, -tw/2,hz-td/2+0.3, tw/2,hz-td/2+0.3, HH+0.92, 0.34, MOSBLUEC[0], MOSGREENC[0]);
      F.lathe('plaster', 0,hz, [[7.5,HH-0.1],[7.3,HH+2.0],[7.55,HH+2.3]], WHITEC[2], { seg:20 });
      for(i=0;i<8;i++){ var a=(i+0.5)/8*2*PI; F.window(Math.sin(a)*7.42,HH+1.15,hz+Math.cos(a)*7.42, Math.sin(a),Math.cos(a), 0.9,1.1, { noReveal:true }); }
      F.lathe('mosaic', 0,hz, [[7.62,HH+0.0],[7.5,HH+0.7]], MOSWARMC[0], { seg:20 });   /* a tiled band round the drum's foot */
      F.lathe('mosaic', 0,hz, [[7.55,HH+2.3,MOSBLUEC[2]],[7.2,HH+3.3,MOSBLUEC[0]],[6.3,HH+4.5,MOSBLUEC[4]],[4.9,HH+5.5,MOSGREENC[0]],[3.1,HH+6.25,MOSGREENC[3]],[1.3,HH+6.7,GILDC[0]],[0.5,HH+7.3,GILDC[2]],[0.3,HH+8.0,GILDC[2]]], MOSBLUEC[0], { seg:20, cap:true });
      finial(F,0,HH+8.0,hz,1.6);
      /* ---- second court: the private wing rides on its own cloister, balconies over the court ---- */
      var pwx=9.5, PW=47, pz0=-27.0, pz1=-22.0, PY=4.3, P2=11.2;   /* the wing is shallower, so the private court is 10 m, not 8 */
      F.box(pwx,0,-25.6, PW,PY,2.8, 0, RED,'adobe');
      F.arcade('adobe', pwx,0,pz1-0.35, 0, 12,PW/12,PY,0.7, ADOBEREDC[2], { pier:1.0, head:0.75, seg:6, noBack:true, colIn:OCH });
      F.box(pwx,PY,(pz0+pz1)/2, PW,P2-PY,pz1-pz0, 0, RED,'adobe'); F.box(pwx,PY-0.1,pz1+0.03, PW+0.1,0.55,0.1, 0, WHITE,'paintcol'); F.box(pwx,P2-1.0,pz1+0.03, PW+0.1,0.7,0.1, 0, WHITE,'paintcol');
      for(i=0;i<8;i++){ var bx=pwx+(i-3.5)*5.4; pwin(F,bx,PY+1.9,pz1+0.02,0,1, 0.9,2.2, OCH,'relief'); F.window(bx,PY+5.0,pz1+0.03,0,1,0.8,1.0);
        if(i===2||i===5) balcony(F,bx,PY+0.7,pz1,0,1, 2.4, OCH, PLANKC[1],'plank'); }
      F.box(pwx,P2,pz1-0.3, PW,0.8,0.5, 0, RED,'adobe'); hornRow(F, pwx-PW/2+0.5,pz1-0.3, pwx+PW/2-0.5,pz1-0.3, P2+0.78, 12,1.0, OCH,'adobe', false, MOSWARMC[0],'mosaic');
      coping(F, pwx-PW/2,pz1-0.3, pwx+PW/2,pz1-0.3, P2+0.9, 0.34, MOSBLUEC[0], MOSGREENC[0]);
      dado(F, pwx-PW/2+0.5,pz1, pwx+PW/2-0.5,pz1, 0, 1.1, 0.16, MOSGREENC[0], 0,1);
      for(i=0;i<12;i++) F.archband('mosaic', pwx+(i-5.5)*(PW/12),0,pz1-0.02, 0, PW/12-1.0,PY-0.75, 0.26,0, i%2?MOSBLUEC[0]:MOSWARMC[0], { seg:5 });
      /* the private court between the hall and the wing: a tiled water channel, palms, lanterns */
      var cz0=-19.6; F.box(2.0,0,cz0, 26,0.4,2.6, 0, STONEC[0],'plaster'); F.box(2.0,0.34,cz0, 24.6,0.14,1.7, 0, MOSBLUEC[0],'mosaic');
      for(i=0;i<4;i++){ F.tree(-8.5+i*7.0, cz0-2.6, 'palm', F.rr(6.5,8.0)); }
      F.tree(-13.5,cz0+1.2,'olive',5.2); F.lantern(-12.5,3.0,pz1-0.6, 0.8,13,0); F.lantern(14.0,3.0,pz1-0.6, 0.8,13,0);
      F.box(0,0,hz-td/2-0.28, tw-2,1.15,0.2, 0, MOSGREENC[2],'mosaic'); F.box(0,4.6,hz-td/2-0.26, tw-3,0.8,0.14, 0, WHITE,'paintcol');
      for(i=0;i<4;i++) F.window((i-1.5)*5.4,2.9,hz-td/2-0.3, 0,-1, 0.9,1.6);
      butt(F, pwx-PW/2,pz1-0.4, 1.0,P2+1.0, RED,'adobe', MOSWARMC[0]); butt(F, pwx+PW/2,pz1-0.4, 1.0,P2+1.0, RED,'adobe', MOSBLUEC[0]);
      
      warrior(F,pwx-12,P2,-24,1.3,OCH,MOSWARMC[1]); warrior(F,pwx+16,P2,-23.8,1.3,OCH,MOSWARMC[2]);
      F.door(pwx+2.0,pz1-0.4, 0,1, 1.3,2.3, GILDC[1]); F.lantern(pwx+2.0,3.2,pz1-1.4, 0.8,12,0.7);
      /* east of the hall: the bath-house drum and the cloister that closes the second court */
      F.arcade('plaster', 16.6,0,-13.2, PI/2, 3,3.4,4.0,0.6, WH, { pier:0.9, head:0.8, seg:6, noBack:true, colIn:MOSBLUEC[3] });
      for(i=0;i<3;i++) F.archband('mosaic', 16.9,0,-13.2-(i-1)*3.4, PI/2, 2.5,3.2, 0.28,0, i%2?MOSGREENC[0]:MOSWARMC[0], { seg:8 });
      drum(F, 26.5,-5.5, 4.6,5.2, OCH2,'adobe',14); F.lathe('mosaic',26.5,-5.5,[[3.85,5.2,MOSBLUEC[0]],[3.3,6.6,MOSGREENC[0]],[1.8,7.6,MOSGREENC[3]],[0.05,7.95,GILDC[0]]],MOSGREENC[0],{ seg:14 }); finial(F,26.5,7.7,-5.5,0.8);
      drumBand(F,26.5,-5.5,4.6,5.2, 3.2,4.9,'paintcol',WHITE,14); F.door(26.5-Math.sin(1.0)*4.62,-5.5+Math.cos(1.0)*4.62, -Math.sin(1.0),Math.cos(1.0), 1.1,2.2, GILDC[1]);
      drumBand(F,26.5,-5.5,4.6,5.2, 1.0,1.9,'mosaic',MOSGREENC[0],14);
      TREE(F,'olive',28.5,2.5,5.5);
      /* ---- the walled garden (west): cypress walk, pool ---- */
      F.box(-16.2,0,-7.5, 0.6,3.2,25, 0, OCH,'adobe');
      F.archwall('adobe', -16.2,0,-19.2, PI/2, 3.4,4.2,0.8, 1.6,2.9, OCH2, { seg:8 });
      F.box(-25,0,-6, 5.2,0.45,16, 0, STONEC[0],'plaster'); F.box(-25,0.38,-6, 4.2,0.12,15, 0, MOSBLUEC[3],'mosaic'); F.box(-25,0.26,-6, 3.2,0.12,14, 0, MOSGREENC[0],'mosaic');
      for(i=0;i<4;i++){ TREE(F,'cypress',-30.2,-19+i*7,F.rr(10,13)); if(i<3) TREE(F,'cypress',-19.8,-15.5+i*7,F.rr(10,13)); }
      TREE(F,'olive',-25,-22.5,6);
      F.box(-25,0,5.0, 17.4,3.2,0.6, 0, OCH,'adobe'); coping(F, -33.7,5.0, -16.3,5.0, 3.3, 0.3, MOSGREENC[0], MOSWARMC[0]);
      F.tree(-21.5,1.0,'shrub',1.3); F.tree(-29,1.2,'shrub',1.2);
      /* forecourt yards left and right of court one */
      TREE(F,'olive',29.5,16,6);
      F.fr8(-29.5,0,21.5, 6,3.8,5, 0, OCH2,'adobe'); F.door(-29.5+3.02,21.5,1,0,1.0,2.1,PLANKC[1]);
    }) });

  /* =====================================================================================
     5. OLIGARCH'S TOWER-HOUSE  14 x 14, ~24 m to the eave: battered fluted shaft, look-out gallery, mosaic crown */
  ASSET({ key:'rich_tower_house', name:"Oligarch's tower-house", family:'rich', districts:['core','prosper'], wealth:[0.75,1.0], w:14, d:14, h:29, variants:3,
    build:counted(function(F){
      var v=F.variant, TR=[
        { wall:WHITEC[0], wall2:WHITEC[1], fam:'plaster', accF:'mosaic', acc:MOSBLUEC[0], cap:MOSBLUEC[1], cap2:MOSBLUEC[3], fl:8, seg:16 },
        { wall:ADOBEC[0], wall2:ADOBEC[4], fam:'adobe',   accF:'paintbw', acc:WARM,       cap:MOSWARMC[1], cap2:MOSWARMC[0], fl:4, seg:16 },
        { wall:BLUEGREY,  wall2:BLUEGREY2, fam:'plaster', accF:'mosaic', acc:MOSBLUEC[2], cap:MOSBLUEC[2], cap2:MOSBLUEC[4], fl:6, seg:12 } ][v];
      var wall=TR.wall, fam=TR.fam, fl=TR.fl, amp=v===1?0.085:0.05, GY=[17.5,15.6,18.6][v], i, s;
      function rB(y){ return 3.5+1.1*Math.pow(Math.max(0,1-y/GY),1.6)+0.7*Math.exp(-y/0.9); }
      /* flutes and lobes: rfn's angle is the asset's own frame, so crests and the windows on them agree */
      function rf(q,a){ return 1+amp*Math.cos(a*(v===1?4:fl)); }
      function crest(a){ var st=2*PI/(v===1?4:fl); return Math.round(a/st)*st; }
      var pts=[]; [0,0.6,1.5,3.5,7,10.5,14,GY].forEach(function(y,j){ if(y<=GY) pts.push([rB(y),y, j===0?shade(wall,-0.12):wall]); });
      /* the corbelled look-out gallery grows out of the shaft and folds back in as its own parapet and floor */
      pts.push([4.2,GY+0.7],[4.75,GY+1.25],[4.75,GY+2.2],[4.45,GY+2.25]);
      ringIn(F,fam,0,0,4.4,GY+1.35,GY+2.25,shade(wall,-0.1),TR.seg); F.lathe('adobe',0,0,[[4.6,GY+1.35],[3.0,GY+1.37]],PAL.lane[1],{ seg:TR.seg });
      F.lathe(fam, 0,0, pts, wall, { seg:TR.seg, rfn:rf });
      F.lathe(TR.accF, 0,0, [[4.86,GY+1.3],[4.86,GY+2.05]], TR.acc, { seg:TR.seg, rfn:rf });
      /* upper drum, posts, mushroom crown */
      var UY=GY+1.35, UH=3.4;
      F.lathe(fam, 0,0, [[3.25,UY],[3.05,UY+UH]], TR.wall2, { seg:TR.seg });
      for(i=0;i<8;i++){ var a=(i+0.5)/8*2*PI, sx=Math.sin(a), cz=Math.cos(a); F.rod(sx*4.5,GY+2.2,cz*4.5, sx*4.4,UY+UH-0.3,cz*4.4, 0.10, TORONC[0],'timber');
        if(i%2===0) F.window(sx*3.2,UY+1.5,cz*3.2, sx,cz, 0.9,1.9, { noReveal:true }); }
      var CY=UY+UH-0.45;
      if(v===1){ F.mcone('adobe', 0,CY,0, 5.0,3.6,0.9, TR.wall2, 16, { under:true }); F.lathe('adobe',0,0,[[3.6,CY+0.9],[3.5,CY+1.9],[3.2,CY+1.95]], wall, { seg:16, cap:true, capCol:PAL.lane[1] });
        F.lathe('paintbw',0,0,[[3.66,CY+0.95],[3.58,CY+1.8]], WARM, { seg:16 });
        for(i=0;i<8;i++){ var a2=i/8*2*PI; horn(F,Math.sin(a2)*3.35,CY+1.9,Math.cos(a2)*3.35, 1.3, i%2?MOSWARMC[1]:wall, i%2?'mosaic':'adobe'); }
        F.edome(0,CY+1.9,0, 2.3,2.4,2.3, 0, MOSWARMC[0],'mosaic'); finial(F,0,CY+4.2,0,1.0); }
      else if(v===2){ F.mcone('mosaic', 0,CY,0, 4.9,3.2,0.8, TR.cap, 12, { under:true });
        F.lathe('mosaic',0,0,[[3.2,CY+0.8,TR.cap],[3.9,CY+2.2,TR.cap2],[3.5,CY+3.8,MOSGREENC[1]],[1.9,CY+5.2,MOSGREENC[3]],[0.7,CY+6.4,GILDC[0]],[0.06,CY+8.0,GILDC[2]]], TR.cap, { seg:12 }); finial(F,0,CY+7.9,0,1.0); }
      else { F.mcone('mosaic', 0,CY,0, 5.0,3.9,0.9, TR.cap, 16, { under:true });
        F.lathe('mosaic',0,0,[[3.9,CY+0.9,TR.cap],[3.3,CY+2.3,TR.cap2],[2.5,CY+3.7,MOSGREENC[1]],[1.5,CY+4.9,PAL.mosaicWhite[0]],[0.6,CY+5.6,GILDC[0]],[0.05,CY+5.9,GILDC[2]]], TR.cap, { seg:16 }); finial(F,0,CY+5.8,0,1.0); }
      /* accent bands up the shaft, windows on the flute crests, toron rings */
      var st=Math.floor(GY/3.5);
      for(s=1;s<st;s++){ var by=s*3.5+0.1; F.lathe(TR.accF,0,0,[[rB(by-(v===1?0.55:0.3))*(1+amp)+0.06,by-(v===1?0.55:0.3)],[rB(by+(v===1?0.55:0.3))*(1+amp)+0.06,by+(v===1?0.55:0.3)]], s%2?TR.acc:(v===1?WARM:TR.cap2), { seg:TR.seg, rfn:v===1?rf:null }); }
      for(s=0;s<st;s++){ var wy=s*3.5+2.1, as=s===0?[-0.9,0.9,PI]:[0,(s%2?1:-1)*PI/2,(s%2?-1:1)*PI/4*3];
        as.forEach(function(a0,j){ var a=crest(a0), r=rB(wy)*(1+amp)+0.02, sx=Math.sin(a), cz=Math.cos(a);
          if(j===0&&s>0&&v!==1) pwin(F,sx*r,wy,cz*r,sx,cz, 0.8,1.9, v===2?BLUEGREY2:TR.cap2, v===2?'relief':'mosaic', true); else F.window(sx*r,wy,cz*r,sx,cz, 0.75,s===0?1.0:1.4, { noReveal:true }); }); }
      if(v===2||v===0) balcony(F, 0,GY-3.5*1+1.0-0.2, rB(GY-3.5)*(1+amp)-0.15, 0,1, 2.4, TR.wall2, TR.acc,'mosaic');
      if(v!==2) for(i=0;i<16;i++){ var ta=v===1?i/8*2*PI:crest(i/8*2*PI+0.01), ty=i<8?GY-1.0:GY-4.4, tr=rB(ty)*(1+amp*(v===1?Math.cos(4*ta):1)); F.toron(Math.sin(ta)*tr,ty,Math.cos(ta)*tr, Math.sin(ta),Math.cos(ta), 1.0); }
      /* porch with the door, lantern, low curved forecourt walls */
      var pz=rB(0)*(1+amp)-0.5;
      F.archwall(fam, 0,0,pz, 0, 3.6,3.5,1.7, 1.7,2.75, TR.wall2, { seg:8, colIn:shade(wall,-0.2) });
      F.archband(TR.accF, 0,0,pz+0.9, 0, 1.7,2.75, 0.45,0, TR.acc, { seg:8 });
      wavy(F,fam, -1.8,pz+0.55, 1.8,pz+0.55, 3.5,0.2,0.8,1, 0.6, TR.wall2, 0,1, 6);
      F.door(0,pz+0.2, 0,1, 1.4,2.4, PLANKC[v]); F.lantern(1.45,2.6,pz+1.15, 0.9,13,0);
      curveWall(F,v===1?'paintbw':fam, 0,0, 6.4, 0.42,1.25, 0,1.3,0.4, v===1?WARM:TR.wall2, 5, function(t){ return 1-0.4*t; });
      curveWall(F,v===1?'paintbw':fam, 0,0, 6.4, -1.25,-0.42, 0,1.3,0.4, v===1?WARM:TR.wall2, 5, function(t){ return 0.6+0.4*t; });
      if(v===2){ /* stair turret with its own bulb */
        var tx=-4.3, tz=-2.2; F.lathe(fam, tx,tz, [[1.75,0],[1.45,2],[1.3,GY+3.2]], BLUEGREY2, { seg:8 });
        F.lathe('mosaic', tx,tz, [[1.3,GY+3.1],[1.75,GY+4.0],[1.4,GY+5.2],[0.5,GY+6.2],[0.04,GY+7.4]], MOSBLUEC[0], { seg:8 });
        for(i=0;i<4;i++) F.window(tx-1.42*0.94,3+i*4.2,tz-0.0, -1,0, 0.5,1.3, { noReveal:true }); }
    }) });
})();
