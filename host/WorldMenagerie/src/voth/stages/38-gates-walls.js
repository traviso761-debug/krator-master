/* ==== 21. GATE SITE-FINDING & PLACEMENT ==== */
function facadeFindGateSite(anchorX, anchorZ, opt){
  opt = opt || {};
  var minH = (opt.minH != null) ? opt.minH : -1e9;
  var maxH = (opt.maxH != null) ? opt.maxH : 1e9;
  var maxSlope = (opt.maxSlope != null) ? opt.maxSlope : 16;
  var fx = (opt.fx != null) ? opt.fx : 12, fz = (opt.fz != null) ? opt.fz : 18;
  for(var ring=0; ring<28; ring++){
    var r = ring*16, tries = ring===0 ? 1 : 10;
    for(var t=0; t<tries; t++){
      var ang = (t/tries)*Math.PI*2 + ring*0.37;
      var x = anchorX + Math.cos(ang)*r, z = anchorZ + Math.sin(ang)*r;
      var h = terrainH(x,z);
      if(h < minH || h > maxH) continue;
      if(inRiver(x,z,24)) continue;
      var hs = [terrainH(x+18,z), terrainH(x-18,z), terrainH(x,z+18), terrainH(x,z-18)];
      var slope = Math.max(Math.abs(hs[0]-h), Math.abs(hs[1]-h), Math.abs(hs[2]-h), Math.abs(hs[3]-h));
      if(slope > maxSlope) continue;
      var claimed = claim(x, z, fx, fz, opt.ry || 0, opt.tag || 'gate');
      if(claimed) return { x:x, z:z };
    }
  }
  return null;
}

/* ==== 22. WATCHTOWER ==== */

function watchtower(x,y,z,ry,health,col){
  col = col || pick(BASALTC);
  var S = 2;
  var baseW = 8.5*S, baseH = 11*S;
  var rubR = 6.4;   /* debris scatter cap — see the header above */

  if(health <= 0){
    /* destroyed: reduced to its base */
    FR8(x, y, z, baseW, rr(2.2,3.6)*S, baseW, ry, shade(col,-0.10));
    var nrub = ri(4,7);
    for(var i=0;i<nrub;i++){
      var rp = loc(x,z, rr(-rubR,rubR), rr(-rubR,rubR), ry);
      BOX(rp[0], y+rr(0,2.2*S), rp[1], rr(1.4,3.0)*S, rr(1.0,2.2)*S, rr(1.4,3.0)*S, rnd()*3, shade(col,-0.24+rr(-0.05,0.05)));
    }
    var nveg = ri(2,4);
    for(var v=0; v<nveg; v++){
      var vp = loc(x,z, rr(-rubR*1.1,rubR*1.1), rr(-rubR*1.1,rubR*1.1), ry);
      BLOB(vp[0], y+rr(0.4,2.4)*S, vp[1], rr(0.8,1.6)*S, rr(0.6,1.1)*S, rnd()*3, pick(LEAFC), 'leaf');
    }
    return;
  }

  /* storey 1 — present at both ruined and intact */
  FR8(x, y, z, baseW, baseH, baseW, ry, col);

  if(health === 1){

    var nfr = ri(2,4);
    for(var f=0; f<nfr; f++){
      var fp = loc(x,z, rr(-baseW*0.22,baseW*0.22), rr(-baseW*0.22,baseW*0.22), ry);
      BOX(fp[0], y+baseH+rr(-0.5,0.3)*S, fp[1], rr(2.4,4.2)*S, rr(0.7,1.6)*S, rr(2.4,4.2)*S, rnd()*3, shade(col,-0.20));
    }
    var nrub2 = ri(2,4);
    for(var r2=0;r2<nrub2;r2++){
      var rp2 = loc(x,z, rr(-rubR,rubR), rr(-rubR,rubR), ry);
      BOX(rp2[0], y+rr(-0.1,0.4)*S, rp2[1], rr(1.4,2.6)*S, rr(0.8,1.6)*S, rr(1.4,2.6)*S, rnd()*3, shade(col,-0.28));
    }
    if(chance(0.6)){
      var vp2 = loc(x,z, rr(-baseW*0.3,baseW*0.3), baseW*0.5+0.4, ry);
      BLOB(vp2[0], y+rr(2,baseH*0.7), vp2[1], rr(0.9,1.5)*S, rr(0.6,1.0)*S, rnd()*3, pick(LEAFC), 'leaf');
    }
    return;
  }

  var yy = y + baseH;
  BOX(x, yy-0.9*S, z, baseW*1.08, 1.1*S, baseW*1.08, ry, shade(col,-0.16));
  var w2 = baseW*0.72, h2 = 7.5*S;
  FR6(x, yy, z, w2, h2, w2, ry, shade(col,0.03));
  yy += h2;
  BOX(x, yy-0.7*S, z, w2*1.10, 0.9*S, w2*1.10, ry, shade(col,-0.14));

  /* ==== the sentry perch. A corbelled gallery deck riding on the second ==== */
  var pHw = baseW*0.52, deckH = 1.6;
  BOX(x, yy, z, pHw*2, deckH, pHw*2, ry, shade(col,-0.06));
  var pY = yy + deckH;                         /* the walking surface itself */

  var lSide = (Math.hypot(x + Math.cos(ry)*baseW, z - Math.sin(ry)*baseW) <
               Math.hypot(x - Math.cos(ry)*baseW, z + Math.sin(ry)*baseW)) ? 1 : -1;
  var ladX = lSide*(baseW*0.5 + 0.45), ladW = 1.9, ladTop = pY + 1.2;
  [-1,1].forEach(function(s){
    var lp = loc(x, z, ladX, s*ladW*0.5, ry);
    CYL(lp[0], y, lp[1], 0.22, ladTop-y, 0, shade(TRUNKC[0],-0.12), 'wood');
  });
  var nRung = Math.max(4, Math.round((pY-y)/1.6));
  var ladFoot = loc(x, z, ladX, 0, ry);
  for(var rg=1; rg<=nRung; rg++){
    BOX(ladFoot[0], y + rg*((pY-y)/(nRung+1)), ladFoot[1], 0.30, 0.18, ladW, ry, shade(TRUNKC[1],-0.05), 'wood');
  }

  var mw = 1.5, mh = 2.4, md = 1.8, perM = mw + 1.05;
  var nM = Math.max(3, Math.floor((pHw*2)/perM));
  [['x',pHw],['x',-pHw],['z',pHw],['z',-pHw]].forEach(function(e){
    for(var k=0;k<nM;k++){
      var t = (k+0.5)/nM*(pHw*2) - pHw;
      var lx = e[0]==='x' ? t : e[1];
      var lz = e[0]==='x' ? e[1] : t;
      if(e[0]==='z' && e[1]*lSide > 0 && Math.abs(t) < ladW*0.5+0.9) continue;
      var mp = loc(x,z, lx, lz, ry);
      BOX(mp[0], pY, mp[1], e[0]==='x'?mw:md, mh, e[0]==='x'?md:mw, ry, shade(col,-0.30));
    }
  });

  var w3 = baseW*0.46, h3 = 6.0*S;
  FR3(x, pY, z, w3, h3, w3, ry, shade(col,0.06));
  var yy3 = pY + h3;
  BOX(x, yy3-0.5*S, z, w3*1.14, 0.7*S, w3*1.14, ry, shade(col,-0.12));
  CONE(x, yy3, z, w3*0.55, 7.5*S, ry, 0x6c5e4a);   /* the legacy wall towers' own cap colour */

  return { perch: { y:pY, hw:pHw, side:-lSide } };
}

/* ==== 23. WALL SEGMENT DAMAGE STATES ==== */
function wallSegRender(ax,az,bx,bz,state,col){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  if(L < 1) return;
  var mx=(ax+bx)/2, mz=(az+bz)/2, ry=Math.atan2(dx,dz);
  var f = footing(mx,mz, 5, L*0.5, ry);
  if(f.hi-f.lo > 30) return;   /* terrain too steep to read as a built wall */
  if(state <= 0){
    var stubH = rr(1.4,2.8);
    FR8(mx, f.lo-1, mz, 7.5, (f.hi-f.lo)+1+stubH, L*1.05, ry, shade(col,-0.22));
    var n = Math.max(2, Math.round(L/22));
    for(var i=0;i<n;i++){
      var t=(i+0.5)/n, lp = loc(mx,mz, rr(-4,4), (t-0.5)*L*0.9, ry);
      BOX(lp[0], f.hi+rr(0,1.6), lp[1], rr(1.6,3.2), rr(1.0,2.0), rr(1.6,3.2), rnd()*3, shade(col,-0.30));
    }
  }else if(state === 1){
    var h = rr(7,11);
    FR8(mx, f.lo-1, mz, 9.0, (f.hi-f.lo)+1+h, L*1.08, ry, shade(col,-0.10));
    var n2 = Math.max(1, Math.round(L/30));
    for(var j=0;j<n2;j++){
      var t2=(j+0.5)/n2, rp = loc(mx,mz, rr(-6,6), (t2-0.5)*L*0.7, ry);
      BOX(rp[0], f.hi+h-1+rr(-0.6,0.4), rp[1], rr(2.4,4.2), rr(1.0,1.8), rr(2.4,4.2), rnd()*3, shade(col,-0.24));
    }
  }else{
    wallSegmentBasalt(mx, f.lo-1, mz, ry, col, { len:L, h:(f.hi-f.lo)+1+rr(11,15) });
  }
}

function wallOBBCorners(cx,cz,fx,fz,ry){
  var out=[];
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(s){ out.push(loc(cx,cz, s[0]*fx, s[1]*fz, ry)); });
  return out;
}
function wallOBBOverlap(ax,az,afx,afz,ary, bx,bz,bfx,bfz,bry){
  if(Math.hypot(ax-bx,az-bz) > Math.hypot(afx,afz)+Math.hypot(bfx,bfz)) return false;
  var ca = wallOBBCorners(ax,az,afx,afz,ary), cb = wallOBBCorners(bx,bz,bfx,bfz,bry);
  var axes = [[Math.cos(ary),-Math.sin(ary)],[Math.sin(ary),Math.cos(ary)],
              [Math.cos(bry),-Math.sin(bry)],[Math.sin(bry),Math.cos(bry)]];
  for(var i=0;i<axes.length;i++){
    var ux=axes[i][0], uz=axes[i][1];
    var amin=1e18,amax=-1e18,bmin=1e18,bmax=-1e18;
    for(var j=0;j<4;j++){
      var da=ca[j][0]*ux+ca[j][1]*uz; if(da<amin)amin=da; if(da>amax)amax=da;
      var db=cb[j][0]*ux+cb[j][1]*uz; if(db<bmin)bmin=db; if(db>bmax)bmax=db;
    }
    if(amax<bmin || bmax<amin) return false;   /* separating axis found */
  }
  return true;
}
(function wallOverlapAudit(){
  var shapes = [];
  WNODES.forEach(function(n){
    if(n.builtX===undefined) return;   /* site search failed — nothing drawn there */
    if(n.kind==='tower') shapes.push({x:n.builtX,z:n.builtZ,fx:10,fz:10,ry:n.ry});
    else if(n.health>0) shapes.push({x:n.builtX,z:n.builtZ,fx:(n.named?11:10),fz:(n.named?19:17),ry:n.ry});
  });
  WSEGS.forEach(function(s){
    if(s.health<=0) return;
    var dx=s.bx-s.ax, dz=s.bz-s.az, L=Math.hypot(dx,dz);
    if(L<2) return;
    shapes.push({x:(s.ax+s.bx)/2, z:(s.az+s.bz)/2, fx:6, fz:L/2, ry:Math.atan2(dx,dz)});
  });
  var buildingTags = { town:1, compound:1, 'velothi-out':1, warehouse:1, manor:1 };
  var clips = [];
  PLACED.forEach(function(p){
    if(!buildingTags[p.tag]) return;
    for(var i=0;i<shapes.length;i++){
      var w = shapes[i];
      if(wallOBBOverlap(p.x,p.z,p.fx,p.fz,p.ry, w.x,w.z,w.fx,w.fz,w.ry)){
        clips.push({ x:p.x, z:p.z, tag:p.tag });
        break;
      }
    }
  });
  window._wallAudit = {
    checked: PLACED.filter(function(p){ return buildingTags[p.tag]; }).length,
    shapes: shapes.length, clips: clips.length, clipSample: clips.slice(0,8)
  };
})();
