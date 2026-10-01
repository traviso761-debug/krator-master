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
    /* the ruin: nothing grows through a tower or its deck */
    for(var tw=0; tw<TOWERS.length; tw++){ var TW=TOWERS[tw];
      if(p.y < TW.top+14+p.r && Math.abs(p.x-TW.x) < TW.deck.half+6+p.r && Math.abs(p.z-TW.z) < TW.deck.half+6+p.r) return true; }
    for(var k=0;k<0;k++){
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

window._branches = { total:BRANCHES.length, limbs:BRANCHES.length };
