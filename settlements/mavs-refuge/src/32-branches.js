/* ============================== 6. BRANCH SKELETONS ==============================
   PLANNER-OWNED. The limbs of every near hypertree as polylines with radii:
     BRANCHES[] = { id, tree, kind:'limb'|'under'|'over', pts:[{x,y,z,r}], sat? }
   Skeleton only — 60-trees.js skins them, adds twigs and hangs the foliage;
   the spider-riders walk and leap between them; the flyers steer round them.
   Three kinds:
     limb  : the tree's own natural boughs (species habit)
     under : a bough grown out BENEATH a satellite platform, which sits on it
     over  : a bough arched ABOVE a satellite, which hangs from it on ropes
             (used when the satellite is tucked in close to its tree's own
             main platform, or belongs to a baobab, whose boughs are all at
             the crown). P.support / P.supPts tell 50-structure.js which.    */
reseed(320001);

var BRANCHES = [];
function bz3(a,b,c,d,t){ var u=1-t; return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d; }
/* does the polyline foul a platform (other than `skip`) or a bridge? */
function limbFouls(pts, skip){
  for(var i=0;i<pts.length;i++){
    var p=pts[i];
    for(var k=0;k<PLATS.length;k++){
      var P=PLATS[k]; if(P===skip) continue;
      var rr0 = P.R*Math.max(P.sx,P.sz) + p.r + 3;
      if(p.y > P.yBottom-4-p.r && p.y < P.y+(P.kind==='council'?40:17)+p.r && Math.hypot(p.x-P.x,p.z-P.z) < rr0) return true;
    }
    for(var b=0;b<BRIDGES.length;b++){
      var br=BRIDGES[b], dx=br.b.x-br.a.x, dz=br.b.z-br.a.z, LL=dx*dx+dz*dz;
      var t=clamp(((p.x-br.a.x)*dx+(p.z-br.a.z)*dz)/LL,0,1), by=bridgeY(br,t);
      if(Math.hypot(p.x-br.a.x-dx*t, p.z-br.a.z-dz*t) < p.r+3.5 && p.y > by-p.r-2.5 && p.y < by+4+p.r) return true;
    }
  }
  return false;
}
function densify(ctrl, n){
  /* ctrl: 4 bezier points {x,y,z}; radii interpolated r0->r1 with a slight belly */
  var out=[];
  for(var i=0;i<=n;i++){ var t=i/n;
    out.push({ x:bz3(ctrl[0].x,ctrl[1].x,ctrl[2].x,ctrl[3].x,t), y:bz3(ctrl[0].y,ctrl[1].y,ctrl[2].y,ctrl[3].y,t), z:bz3(ctrl[0].z,ctrl[1].z,ctrl[2].z,ctrl[3].z,t), r:0 }); }
  return out;
}

/* ---- natural limbs, by species habit ---- */
var LIMB_HABIT = [
  /* count, start band (fraction of H), length as fraction of crownR, launch elevation (rad), droop */
  { n:[10,13], band:[0.50,0.90], len:[0.55,1.00], elev:[0.10,0.45], droop:0.10 },   /* Ironbark: tiers, shortening upward */
  { n:[7,9],   band:[0.46,0.86], len:[0.60,0.95], elev:[0.55,0.95], droop:-0.05 },  /* Ghostwood: ascending, vase-shaped */
  { n:[6,8],   band:[0.52,0.78], len:[0.80,1.05], elev:[0.25,0.55], droop:0.22 },   /* Prism gum: long, spreading, umbrella */
  { n:[8,11],  band:[0.80,0.92], len:[0.55,1.00], elev:[0.15,0.60], droop:0.05 }    /* Baobab: a stubby crown of roots-in-the-air */
];
TREES.forEach(function(T){
  var Hb = LIMB_HABIT[T.sp], want = ri(Hb.n[0],Hb.n[1]), made=0, tries=0, a = rr(0,TAU);
  var P = T.plat, yMin = T.y0 + T.H*Hb.band[0], yMax = T.y0 + T.H*Hb.band[1];
  if(P) yMin = Math.max(yMin, P.y + 27);
  while(made < want && tries++ < want*7){
    a += 2.399963 + rr(-0.35,0.35);                                  /* golden-angle phyllotaxis, jittered */
    var f = (made + rr(0,0.8))/want, ys = mix(yMin, yMax, f);
    if(T===T_C && ys > P_CC.yBottom-24 && ys < P_CC.y+44) ys = P_CC.y + 44 + rr(0,40)*f;
    if(ys > T.y0 + T.H*0.94) continue;
    var topK = (ys - yMin)/Math.max(1,(yMax-yMin));
    var len = T.crownR*rr(Hb.len[0],Hb.len[1])*(T.sp===0 ? (1-0.55*topK) : (1-0.25*topK));
    var el = rr(Hb.elev[0],Hb.elev[1]) + (T.sp===1 ? 0.2*topK : 0);
    var r0 = trunkR(T,ys), ca=Math.cos(a), sa=Math.sin(a), bend = rr(-0.5,0.5);
    var rise = Math.sin(el)*len, reach = Math.cos(el)*len;
    var S = { x:T.x+ca*(r0-1), y:ys, z:T.z+sa*(r0-1) };
    var E = { x:T.x+Math.cos(a+bend*0.5)*(r0+reach), y:ys+rise*(1-Hb.droop*2.2), z:T.z+Math.sin(a+bend*0.5)*(r0+reach) };
    var C1 = { x:T.x+ca*(r0+reach*0.33), y:ys+rise*0.50, z:T.z+sa*(r0+reach*0.33) };
    var C2 = { x:T.x+Math.cos(a+bend*0.3)*(r0+reach*0.70), y:ys+rise*(0.98+Hb.droop), z:T.z+Math.sin(a+bend*0.3)*(r0+reach*0.70) };
    var pts = densify([S,C1,C2,E], 9), rb = clamp(r0*rr(0.22,0.32), 2.2, 8.5);
    pts.forEach(function(p,i){ var t=i/9; p.r = mix(rb, 0.55, Math.pow(t,0.8)); });
    if(limbFouls(pts.slice(1), null)) continue;
    BRANCHES.push({ id:BRANCHES.length, tree:T, kind:'limb', pts:pts, ang:a });
    made++;
  }
});

/* ---- boughs that carry the satellites ---- */
BRANCH_REQ.length = 0;
SATS.forEach(function(P){
  /* candidate trees, nearest first; a baobab can only ever hold one from above */
  var cands = TREES.map(function(T){ return { T:T, d:Math.hypot(T.x-P.x,T.z-P.z) }; })
                   .filter(function(c){ return c.d < 330 && c.d > 40; }).sort(function(p,q){ return p.d-q.d; });
  var done=false;
  for(var ci=0; ci<cands.length && !done; ci++){
    var T=cands[ci].T, d=cands[ci].d, a=Math.atan2(P.z-T.z, P.x-T.x), ca=Math.cos(a), sa=Math.sin(a);
    var MP = T.plat, modes = [];
    var crownTop = T.y0 + T.H*0.90;
    if(T.sp!==3 && !(MP && d < MP.R + 75)) modes.push('under');
    if(P.y + 30 < crownTop) modes.push('over');
    for(var mi=0; mi<modes.length && !done; mi++){
      for(var attempt=0; attempt<5 && !done; attempt++){
        var mode = modes[mi], jit = attempt*0.09*(attempt%2?1:-1), pts, sup=null;
        var a2=a+jit, c2=Math.cos(a2), s2=Math.sin(a2);
        if(mode==='under'){
          var yE = P.yBottom - 1.3, yS = yE - Math.max(24, d*0.33) - attempt*6;
          if(MP) yS = Math.min(yS, MP.yBottom - 44);
          if(yS < T.y0 + T.H*0.18) continue;
          var r0 = trunkR(T,yS);
          var S={x:T.x+c2*(r0-1),y:yS,z:T.z+s2*(r0-1)}, E={x:P.x,y:yE,z:P.z};
          var C1={x:T.x+c2*(r0+d*0.45),y:yS+(yE-yS)*0.10,z:T.z+s2*(r0+d*0.45)};
          var C2={x:P.x-ca*d*0.16,y:yE-(yE-yS)*0.30,z:P.z-sa*d*0.16};
          pts = densify([S,C1,C2,E], 10);
          /* carry on past the platform and turn up into a leafy end */
          pts.push({x:P.x+ca*9,y:yE+3,z:P.z+sa*9,r:0},{x:P.x+ca*17,y:yE+11,z:P.z+sa*17,r:0});
          var rb = clamp(3.0 + d*0.018, 3.2, 8.0), rs = Math.max(1.7, P.R*0.15);
          pts.forEach(function(p,i){ p.r = i<=10 ? mix(rb, rs, Math.pow(i/10,0.85)) : (i===11?rs*0.65:0.5); });
        }else{
          var yOver = P.y + rr(24,32) + attempt*4;
          var yS2 = T.sp===3 ? T.y0+T.H*rr(0.80,0.88) : Math.max(yOver + d*0.10, (MP?MP.y+27:0));
          if(T===T_C && yS2 > P_CC.yBottom-24 && yS2 < P_CC.y+44) yS2 = P_C.y + rr(27,36);
          if(yS2 > crownTop) continue;
          var r02 = trunkR(T,yS2);
          var S2={x:T.x+c2*(r02-1),y:yS2,z:T.z+s2*(r02-1)}, E2={x:P.x+ca*14,y:yOver-5,z:P.z+sa*14};
          var C12={x:T.x+c2*(r02+d*0.40),y:yS2+Math.max(6,d*0.10),z:T.z+s2*(r02+d*0.40)};
          var C22={x:P.x-ca*d*0.22,y:yOver+6,z:P.z-sa*d*0.22};
          pts = densify([S2,C12,C22,E2], 10);
          var rb2 = clamp(2.8 + d*0.016, 3.0, 7.0);
          pts.forEach(function(p,i){ p.r = mix(rb2, 0.9, Math.pow(i/10,0.8)); });
          /* two hanging points on the bough, either side of the platform centre */
          sup = [8,9].map(function(i){ return [pts[i].x, pts[i].y - pts[i].r*0.7, pts[i].z]; });
        }
        if(limbFouls(pts.slice(1), P)) continue;
        var B = { id:BRANCHES.length, tree:T, kind:mode, pts:pts, sat:P, ang:a2 };
        BRANCHES.push(B); P.support = mode; P.supTree = T; P.supBranch = B; P.supPts = sup;
        BRANCH_REQ.push(B); done = true;
      }
    }
  }
  if(!done){ P.support = 'hang'; P.supTree = null; }
});
window._branches = { total:BRANCHES.length, limbs:BRANCHES.filter(function(b){return b.kind==='limb';}).length,
  under:BRANCHES.filter(function(b){return b.kind==='under';}).length, over:BRANCHES.filter(function(b){return b.kind==='over';}).length,
  unsupported:SATS.filter(function(s){ return s.support==='hang'; }).length };
