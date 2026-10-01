/* ========================= THE BESPOKE SILT STRIDER MODEL =================
   The stand-in is GONE. Every note above about "strider cars REUSE
   lifeCaravanMesh, scaled 2.3x and retinted" describes what this file used
   to do and is kept only as the record of the compromise; what actually
   renders below is a purpose-built creature on its own two InstancedMeshes,
   and the 60 borrowed slots on lifeCaravanMesh have been handed back (see
   78-life.js's own LIFE_CARAVAN_N, now 90 — real caravans only).

   TWO new draw calls, inside the 3 this pass was allowed:
     1. striderMesh     — one merged rigid body per creature (carapace,
                          thorax, segmented snout, howdah, driver).
     2. striderLegMesh  — every leg segment of every creature, one shared
                          unit bar, repositioned per frame. THE LEGS WALK.

   Built the way the life layer builds all its vehicles: a flat list of
   stock THREE primitives, each with its own baked colour, welded by
   lifeMergeGeoms() (78-life.js) into one vertex-coloured buffer. The
   static kit's BOX/FR6/CYL/CONE/DOME wrappers can NOT be used here — they
   push into BUCKET, which 75-terrain.js already drained long before this
   fragment runs — so these are the same primitive shapes SHAPES itself is
   made of (BoxGeometry / CylinderGeometry / ConeGeometry / half-
   SphereGeometry = the DOME shape / full SphereGeometry = the BLOB shape),
   called directly.

   LOCAL FRAME, and why ground clearance is now honest: +z is forward
   (lifeCaravanMesh's own convention, which yaw = atan2(dirX,dirZ)
   assumes), and y = 0 is the FOOT/GROUND CONTACT PLANE — the model is
   authored standing on y=0, at true world scale, with no uniform rescale
   applied at instancing time. The old code had to add
   `0.15*LIFE_STRIDER_SCALE + 1.6` because it was scaling a cart template
   2.3x about a pivot that wasn't at wheel-ground contact, so the gap grew
   with the scale. There is no such gap here: the strider's y offset is
   simply lifeGroundY() + STRIDER_GROUND_EPS (0.15, the same epsilon every
   other citizen in the city stands on), with one deliberate extra rule for
   water — see STRIDER_WADE_DEPTH. */

/* ---- dimensions (world units; a citizen is 2.94 tall, a station shelter
   ~14 to its roof peak, for scale) -----------------------------------------
     overall height   24.9  (carapace crest) / 26.8 (howdah canopy apex)
     overall length   40.7  (snout tip z=+26.1 back to abdomen tip z=-14.6;
                            the snout was trimmed at the owner's request)
     body width       13.4  across the shell, 19.8 across planted feet
     hip height       12.6, leg reach 13.5 straight-line hip-to-foot        */
var STRIDER_HIP_Y   = 12.6;                 /* hip sockets above the foot plane */
var STRIDER_HIP_X   = 4.7;                  /* hips, half-width                 */
var STRIDER_HIP_Z   = [6.0, 0.4, -5.6];     /* three pairs, front to back       */
var STRIDER_FOOT_X  = 9.9;                  /* planted feet splay wider than the hips */
var STRIDER_LEGS    = STRIDER_HIP_Z.length*2;   /* 6 */
var STRIDER_LEG_SEGS = 2;                   /* femur + tibia, one bent knee     */
var STRIDER_BARS_PER_BODY = STRIDER_LEGS*STRIDER_LEG_SEGS;   /* 12 */

/* baked colours are deliberately LIGHT: the per-instance pax/cargo tint
   below multiplies them (vertexColors material), so authoring the chitin at
   its final tone would come out muddy once tinted. */
var STRIDER_CHIT      = 0xd2b888;   /* carapace: warm bone                    */
var STRIDER_CHIT_MID  = 0xae9068;   /* thorax barrel, a shade under the shell */
var STRIDER_CHIT_DARK = 0x866848;   /* belly, hips, alternating snout rings   */
var STRIDER_CHIT_LITE = 0xf0dcb4;   /* ribs, crest, spikes — the highlights   */
var STRIDER_SHELL_IN  = 0x4a3a2c;   /* the shell hollow's own shadowed lining */
var STRIDER_WOOD      = 0xae7e52;
var STRIDER_WOOD_DARK = 0x785232;
var STRIDER_CANVAS    = 0xffffff;   /* pure white == carries the instance tint unmodified */
var STRIDER_EYE       = 0x2a2118;

var striderParts = [];
function striderPart(geo, col){ striderParts.push({ geo: geo, color: col }); }

/* --- thorax: a segmented tube lying along the travel axis --------------- */
striderPart(new THREE.CylinderGeometry(4.4,5.0,17,8).rotateX(Math.PI/2).translate(0,14.2,-3.0), STRIDER_CHIT_MID);
striderPart(new THREE.CylinderGeometry(3.3,3.7,15,8).rotateX(Math.PI/2).translate(0,11.7,-3.0), STRIDER_CHIT_DARK);   /* keeled underbelly */
/* five chitin ribs, slightly proud of the tube — the segmentation reads
   from a long way off, which a smooth barrel does not. */
[[5.2,4.6],[1.6,5.3],[-2.2,5.6],[-6.2,5.3],[-9.8,4.4]].forEach(function(r){
  striderPart(new THREE.CylinderGeometry(r[1],r[1],1.1,10).rotateX(Math.PI/2).translate(0,14.2,r[0]), STRIDER_CHIT_LITE);
});
/* abdomen, tapering to a point behind */
striderPart(new THREE.ConeGeometry(4.3,6.5,8).rotateX(-Math.PI/2).translate(0,14.0,-14.6), STRIDER_CHIT_MID);

/* --- the tall arched carapace ------------------------------------------ */
striderPart(new THREE.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI*0.5)
              .scale(5.9,9.4,8.6).translate(0,14.6,0.2), STRIDER_CHIT);
striderPart(new THREE.BoxGeometry(1.1,2.0,13.5).translate(0,23.6,0.2), STRIDER_CHIT_LITE);   /* crest spine */
[3.8,0.6,-2.6,-5.6].forEach(function(z){
  striderPart(new THREE.ConeGeometry(0.85,2.4,6).translate(0,25.4,z), STRIDER_CHIT_LITE);    /* ridge spikes */
});
/* the hollow carved into each flank of the shell — a dark recessed panel,
   the cue that this creature is something you ride INSIDE, not just on. */
[1,-1].forEach(function(s){
  striderPart(new THREE.BoxGeometry(0.7,4.0,6.4).translate(s*5.35,15.6,-0.6), STRIDER_SHELL_IN);
  striderPart(new THREE.BoxGeometry(1.0,0.7,7.2).translate(s*5.1,17.8,-0.6), STRIDER_CHIT_LITE);   /* its lintel */
});

/* --- head and the long segmented snout/proboscis ------------------------ */
striderPart(new THREE.SphereGeometry(1,10,6).scale(3.4,3.2,3.6).translate(0,14.6,7.8), STRIDER_CHIT);
[1,-1].forEach(function(s){
  striderPart(new THREE.SphereGeometry(1,6,4).scale(0.95,0.95,0.95).translate(s*2.2,16.3,9.4), STRIDER_EYE);
  /* antenna, sweeping up and forward */
  striderPart(new THREE.CylinderGeometry(0.11,0.30,6.4,5).rotateX(Math.PI/2-0.55).rotateY(s*0.22)
                .translate(s*1.9,17.4,11.4), STRIDER_CHIT_DARK);
});
/* seven pieces: four tapering tubes with a joint collar between each pair,
   marching forward and downward on one straight line from the head. */
(function(){
  /* owner: "make the strider proboscis a bit smaller" — was dz 4.0 / dy -1.30
     with radii [2.75 .. 0.45], giving a 16-unit reach and a tip at z=+28.9.
     Trimmed to ~17% shorter and ~15% slimmer. dy is scaled with dz so
     dy/dz stays -0.324 (was -0.325) and the nose-down pitch of every segment
     is unchanged — only the reach and the girth come down, so the joint
     collars still line up on the same straight line as before. */
  var z0 = 10.9, y0 = 13.9, dz = 3.3, dy = -1.07;   /* per step along the snout */
  var r  = [2.35, 1.92, 1.50, 1.02, 0.38];          /* radius at each joint     */
  for(var i=0;i<4;i++){
    var tilt = Math.atan2(-dy, dz);                 /* nose-down pitch of this segment */
    var cz = z0 + dz*(i+0.5), cy = y0 + dy*(i+0.5);
    var len = Math.hypot(dz,dy)*1.02;
    striderPart(new THREE.CylinderGeometry(r[i+1],r[i],len,8).rotateX(Math.PI/2+tilt).translate(0,cy,cz),
                (i%2) ? STRIDER_CHIT_MID : STRIDER_CHIT_DARK);
    if(i<3){
      var jz = z0 + dz*(i+1), jy = y0 + dy*(i+1);
      striderPart(new THREE.CylinderGeometry(r[i+1]*1.16,r[i+1]*1.16,0.9,8).rotateX(Math.PI/2+tilt).translate(0,jy,jz),
                  STRIDER_CHIT_LITE);
    }
  }
})();

/* --- hip sockets: a nub per leg, so the animated bars below emerge from
   something instead of floating out of a smooth flank. ------------------- */
STRIDER_HIP_Z.forEach(function(hz){
  [1,-1].forEach(function(s){
    striderPart(new THREE.SphereGeometry(1,7,5).scale(1.55,1.55,1.55).translate(s*STRIDER_HIP_X,STRIDER_HIP_Y,hz), STRIDER_CHIT_DARK);
  });
});

/* --- the howdah: passenger pod slung over the rear of the shell --------- */
var STRIDER_HOWDAH_Z = -7.8, STRIDER_HOWDAH_FLOOR = 20.2;
striderPart(new THREE.BoxGeometry(8.4,0.9,8.8).translate(0,STRIDER_HOWDAH_FLOOR-0.45,STRIDER_HOWDAH_Z), STRIDER_WOOD_DARK);
/* the cradle: a deep block strapped down INTO the shell (its underside
   reaches 16.6, well inside the thorax barrel whose top is 19.2 here), so
   the pod reads as seated in a hollow rather than perched on the back. */
striderPart(new THREE.BoxGeometry(6.6,3.8,7.0).translate(0,18.5,STRIDER_HOWDAH_Z), STRIDER_WOOD_DARK);
[3.2,-3.2].forEach(function(sx){   /* lashing straps over the shell */
  striderPart(new THREE.BoxGeometry(0.6,3.0,1.0).translate(sx,18.9,STRIDER_HOWDAH_Z+2.6), STRIDER_WOOD);
});
[[3.6,3.8],[3.6,-3.8],[-3.6,3.8],[-3.6,-3.8]].forEach(function(p){
  striderPart(new THREE.CylinderGeometry(0.34,0.34,4.4,6).translate(p[0],STRIDER_HOWDAH_FLOOR+2.2,STRIDER_HOWDAH_Z+p[1]), STRIDER_WOOD);
});
striderPart(new THREE.BoxGeometry(8.4,0.55,0.45).translate(0,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z+4.0), STRIDER_CANVAS);
striderPart(new THREE.BoxGeometry(8.4,0.55,0.45).translate(0,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z-4.0), STRIDER_CANVAS);
striderPart(new THREE.BoxGeometry(0.45,0.55,8.8).translate(3.8,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z), STRIDER_CANVAS);
striderPart(new THREE.BoxGeometry(0.45,0.55,8.8).translate(-3.8,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z), STRIDER_CANVAS);
/* the canopy is the loudest white surface on the model on purpose: it is
   what actually carries the jade(passenger)/grey(cargo) instance tint. */
striderPart(new THREE.ConeGeometry(6.8,3.2,6).translate(0,STRIDER_HOWDAH_FLOOR+5.0,STRIDER_HOWDAH_Z), STRIDER_CANVAS);
striderPart(new THREE.CylinderGeometry(0.22,0.22,1.2,6).translate(0,STRIDER_HOWDAH_FLOOR+7.1,STRIDER_HOWDAH_Z), STRIDER_WOOD);

/* --- the handler, on a small deck at the base of the neck --------------- */
striderPart(new THREE.BoxGeometry(3.6,0.6,3.2).translate(0,20.4,7.2), STRIDER_WOOD_DARK);
striderPart(new THREE.CylinderGeometry(0.34,0.42,1.5,6).translate(0,21.5,7.2), 0x2b4a7a);
striderPart(new THREE.BoxGeometry(0.58,0.58,0.58).translate(0,22.5,7.2), LIFE_SKIN);
striderPart(new THREE.CylinderGeometry(0.72,0.72,0.14,8).translate(0,22.9,7.2), 0x1f3a63);

var striderBodyGeo = lifeMergeGeoms(striderParts);
var striderMesh = new THREE.InstancedMesh(striderBodyGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_STRIDER_CAR_SLOTS);
striderMesh.userData.life = true; striderMesh.userData.inspectLabel = 'Silt strider';
striderMesh.frustumCulled = false;
scene.add(striderMesh);

/* one shared unit bar for every leg segment of every strider — pivot at the
   base, tip at local y=1, exactly the trick 82-daynight.js's clock hands and
   65-facade.js's mill rotor already use, so a segment is placed by
   (start point, setFromUnitVectors(up, direction), scale(thickness, length,
   thickness)). Tapered and only 6-sided: spindly is the whole point. No
   instanceColor is ever touched on this mesh — chitin legs are one colour
   for both variants, which sidesteps the zero-initialised-buffer trap
   entirely for it (the body mesh below handles it properly instead). */
var striderLegGeo = new THREE.CylinderGeometry(0.42,0.62,1,6).translate(0,0.5,0);
var striderLegMesh = new THREE.InstancedMesh(striderLegGeo,
  new THREE.MeshLambertMaterial({ color: 0x4a3a28 }), LIFE_STRIDER_CAR_SLOTS*STRIDER_BARS_PER_BODY);
striderLegMesh.userData.life = true; striderLegMesh.userData.inspectLabel = 'Silt strider leg';
striderLegMesh.frustumCulled = false;
scene.add(striderLegMesh);

/* honest, live-readable cost of the bespoke model — no hand-counted numbers
   in the report: body template triangles x slots, plus leg bar triangles x
   every bar, plus the 2 draw calls the pair of meshes costs. */
window._striderModel = {
  drawCalls: 2,
  bodySlots: LIFE_STRIDER_CAR_SLOTS,
  bodyPartCount: striderParts.length,
  bodyTrisEach: striderBodyGeo.attributes.position.count/3,
  legBars: LIFE_STRIDER_CAR_SLOTS*STRIDER_BARS_PER_BODY,
  legTrisEach: striderLegGeo.index ? striderLegGeo.index.count/3 : striderLegGeo.attributes.position.count/3,
  instances: LIFE_STRIDER_CAR_SLOTS*(1+STRIDER_BARS_PER_BODY),
  height: 24.9, length: 40.7, hipY: STRIDER_HIP_Y, legs: STRIDER_LEGS
};
window._striderModel.triangles =
  window._striderModel.bodySlots*window._striderModel.bodyTrisEach +
  window._striderModel.legBars*window._striderModel.legTrisEach;
/* live positions of every creature currently on the map — diagnostic only
   (the render loop stamps car.wx/wy/wz/wyaw each frame), so an audit or a
   headless screenshot pass can aim a camera at a real strider instead of
   guessing a coordinate. */
/* where each route actually fords open water — lazy, so it costs nothing at
   load. striderBuildLeg() deliberately drops the water-avoidance branch
   every other cart in the city keeps, and updateStriders() drops to 75%
   speed wherever terrainH < 2; this answers "does any route really use
   that?" with sampled coordinates instead of an assumption. */
window._striders.waterCrossings = function(samples){
  samples = samples || 200;
  var out = [];
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      for(var i=0;i<=samples;i++){
        var t = i/samples, p = leg.getPointAt(t);
        if(terrainH(p.x,p.z) < 2) out.push({ route:ri, leg:li, t:t, x:p.x, z:p.z });
      }
    });
  });
  return out;
};
/* per-leg routing audit: straight-line distance vs the curve's real arc
   length (the detour ratio a road-following leg pays to find a bridge),
   alongside how much of the leg is actually over water and how much of
   THAT is a genuine swim rather than a bridge/causeway deck underfoot
   (lifeGroundY answers a deck; terrainH alone does not). This is the one
   number that says whether a strider is wading or queueing over a bridge,
   so it lives in the build rather than in a throwaway console paste. */
function striderSampleLeg(curve, straight, samples){
  var water=0, swim=0, ford=0, deepestWade=99, deepestAny=99;
  for(var i=0;i<=samples;i++){
    var p = curve.getPointAt(i/samples), h = terrainH(p.x,p.z);
    if(h < 2){
      water++;
      if(h < deepestAny) deepestAny = h;
      if(!striderOnDeck(p.x,p.z)){
        swim++;
        if(h < SEA) ford++;
        if(h < deepestWade) deepestWade = h;
      }
    }
  }
  var arc = curve.getLength();
  return { arc:+arc.toFixed(1), ratio:+(arc/straight).toFixed(3),
           water:water, swim:swim, ford:ford,
           deepestWade: swim? +deepestWade.toFixed(2) : null,
           deepestAny: water? +deepestAny.toFixed(2) : null };
}
/* the A* candidate for one leg, built ON DEMAND and memoised on that leg's
   own choice record. This is what keeps navValid/navBlocked/navArc/navFord
   working exactly as they did when the candidate was built at load — the
   caller just pays for the occupancy grid at the moment they ask. */
function striderNavCandidate(ch){
  if(ch.navDone) return ch;
  ch.navDone = true;
  var navCurve = striderRefineNav(ch.ax, ch.az, ch.bx, ch.bz);
  var navOK = !!navCurve && striderLegValid(navCurve, ch.ax,ch.az, ch.bx,ch.bz);
  ch.navCurve = navCurve;
  ch.navValid = navOK;
  ch.navBlocked = navCurve ? (navOK ? null : STRIDER_BAD_WHY) : ['no-nav-path',0,0,0];
  ch.navProf = navCurve ? striderLegProfile(navCurve) : null;
  ch.navArc = ch.navProf ? +ch.navProf.len.toFixed(1) : null;
  ch.navCost = ch.navProf ? +ch.navProf.cost.toFixed(1) : null;
  ch.navFord = ch.navProf ? +ch.navProf.fordFrac.toFixed(3) : null;
  return ch;
}
/* pass {nav:false} to skip the A* candidate and keep legStats cheap; by
   default it is evaluated, which builds the occupancy grid on first call. */
window._striders.legStats = function(samples, opt){
  samples = samples || 200;
  var wantNav = !(opt && opt.nav === false);
  var out = [];
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      var A = r.stops[li], B = r.stops[li+1];
      var straight = Math.hypot(B.x-A.x, B.z-A.z);
      var ch = STRIDER_LEG_CHOICE[out.length] || {};
      if(wantNav && ch.ax !== undefined) striderNavCandidate(ch);
      var rec = striderSampleLeg(leg, straight, samples);
      rec.route = ri; rec.leg = li; rec.straight = +straight.toFixed(1);
      rec.samples = samples+1;
      rec.why = ch.why; rec.fordFrom = ch.fordFrom;
      rec.directValid = ch.directValid; rec.directBlocked = ch.directBlocked;
      rec.navValid = ch.navValid; rec.navBlocked = ch.navBlocked;
      rec.roadCost = ch.roadCost; rec.directCost = ch.directCost;
      rec.navCost = ch.navCost; rec.navArc = ch.navArc;
      rec.navFord = ch.navFord; rec.directFord = ch.directFord; rec.roadFord = ch.roadFord;
      /* the same measurement against the ROAD candidate — bit for bit the
         leg this file used to ship — so before/after is one run, not a
         remembered number from a previous build. */
      rec.before = ch.roadCurve ? striderSampleLeg(ch.roadCurve, straight, samples) : null;
      out.push(rec);
    });
  });
  return out;
};
/* THE PROOF that dropping the A* candidate from striderBuildLeg changed
   nothing. Per leg it rebuilds the A* candidate on demand, then runs the
   SAME striderChoose the router runs — once with that candidate offered
   and once without — and reports whether the two agree on which curve
   ships. `identical` false anywhere means the candidate was doing
   something real and it should go back into the router. Expensive by
   construction (it builds the occupancy grid and 23 A* routes); it is a
   diagnostic, not a load-path cost. */
window._striders.navAbTest = function(samples){
  samples = samples || 200;
  var out = [], allSame = true, gi = 0;
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      var ch = STRIDER_LEG_CHOICE[gi++];
      var A = r.stops[li], B = r.stops[li+1];
      var straight = Math.hypot(B.x-A.x, B.z-A.z);
      striderNavCandidate(ch);
      var withoutNav = striderChoose(!!ch.roadCurve, ch.roadProf, ch.directValid, ch.directProf, false, null);
      var withNav    = striderChoose(!!ch.roadCurve, ch.roadProf, ch.directValid, ch.directProf, ch.navValid, ch.navProf);
      function pick(d){
        if(!d.useFord) return { src:'road', curve: ch.roadCurve };
        if(d.fordFrom === 'astar') return { src:'astar', curve: ch.navCurve };
        return { src:'straight', curve: ch.directCurve };
      }
      var a = pick(withoutNav), b = pick(withNav);
      var sa = a.curve ? striderSampleLeg(a.curve, straight, samples) : null;
      var sb = b.curve ? striderSampleLeg(b.curve, straight, samples) : null;
      var same = a.src === b.src && !!sa && !!sb &&
                 Math.abs(sa.arc - sb.arc) < 0.05 && sa.swim === sb.swim && sa.ford === sb.ford;
      if(!same) allSame = false;
      out.push({ leg:'R'+(ri+1)+'/L'+li, identical: same,
                 shipped: { src:a.src, why:withoutNav.why, arc:sa && sa.arc, swim:sa && sa.swim, ford:sa && sa.ford },
                 withAstar: { src:b.src, why:withNav.why, arc:sb && sb.arc, swim:sb && sb.swim, ford:sb && sb.ford },
                 navValid: ch.navValid, navArc: ch.navArc, navFord: ch.navFord, navBlocked: ch.navBlocked });
    });
  });
  return { allIdentical: allSame, legs: out.length,
           differing: out.filter(function(o){ return !o.identical; }).length, perLeg: out };
};
/* STRICT physical-overlap audit of the legs as shipped — no clearance
   margins, no road or deck exemption, no endpoint grace. striderBadSample
   answers "should the router have allowed this", which is a question about
   policy; this answers "is the creature inside something solid", which is
   a question about the world, and it is the one that decides whether a
   routing change was safe. Uses each obstacle's OWN extent: a claim()ed
   footprint's own rad, a chinampa bed at radius 0, a pier at its own half
   width, a canton at its own cap square, a bridge pylon at its own r. */
window._striders.clipAudit = function(samples, useRoad){
  samples = samples || 400;
  var out = [];
  function check(x,z,route,leg,t){
    if(gridHit(x,z,0)) out.push({ kind:'built', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 });
    else if(chinHit(x,z,0)) out.push({ kind:'chinampa', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 });
    else{
      var arrs = [PIERS, CPIERS, RPIERS, LIFE_EXTRA_PIERS], names = ['pier','cpier','rpier','ferry-pier'];
      for(var ai=0; ai<arrs.length; ai++){
        for(var pi=0; pi<arrs[ai].length; pi++){
          var p = arrs[ai][pi];
          if(lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1) < p.w*0.5){
            out.push({ kind:names[ai], route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 }); return;
          }
        }
      }
      for(var n2=0;n2<BRIDGE_SUPPORTS.length;n2++){
        var bs = BRIDGE_SUPPORTS[n2];
        if(Math.hypot(x-bs.x,z-bs.z) < bs.r){ out.push({ kind:'pylon', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 }); return; }
      }
      if(typeof LIFE_SHIP_STATIONARY_DOCKS !== 'undefined'){
        for(var q=0;q<LIFE_SHIP_STATIONARY_DOCKS.length;q++){
          var sd = LIFE_SHIP_STATIONARY_DOCKS[q];
          if(Math.hypot(x-sd.x, z-sd.z) < 26){ out.push({ kind:'moored-ship', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 }); return; }
        }
      }
      if(!striderOnDeck(x,z) && lifeNavCantonBlocked(x,z)) out.push({ kind:'canton', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 });
    }
  }
  /* useRoad audits the ROAD candidate of every leg instead — the leg this
     file shipped before any of this work — so "does the new route clip
     anything the old one did not" is a difference of two measured numbers
     rather than an absolute whose baseline nobody knows. It is not an
     absolute test: gridHit uses claim()'s own PADDED radius, so a curve
     running correctly along a street beside a house scores a hit here.
     The baseline is what makes it mean something. */
  var gi = 0;
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      var ch = STRIDER_LEG_CHOICE[gi++];
      var use = (useRoad && ch && ch.roadCurve) ? ch.roadCurve : leg;
      for(var i=0;i<=samples;i++){
        var t = i/samples, p = use.getPointAt(t);
        check(p.x, p.z, ri, li, t);
      }
    });
  });
  return out;
};
/* point-level "why is this blocked", so a stubborn refusal can be answered
   with a reading instead of a guess. */
window._striders.probePoint = function(x,z){
  return { terrainH:+terrainH(x,z).toFixed(2), onDeck:striderOnDeck(x,z), onRoad:striderOnRoad(x,z),
           navBlocked:striderNavBlocked(x,z), navPassable:striderNavPassable(x,z),
           gridHit:gridHit(x,z,STRIDER_CLEAR), gridHitRaw:gridHit(x,z,0),
           chin:chinHit(x,z,STRIDER_CLEAR), chinRaw:chinHit(x,z,0),
           canton:lifeNavCantonBlocked(x,z), solid:striderSolidAt(x,z),
           pushClear:striderPushClear(x,z) };
};
/* pass built:false to ask whether the occupancy grid has been built yet
   WITHOUT building it — the whole point of the laziness is that reading
   this does not silently cost 1.4s. Any other call builds it. */
window._striders.nav = function(opt){
  var base = { w:STRIDER_NAV_W, h:STRIDER_NAV_H, cell:STRIDER_NAV_CELL,
               cells:STRIDER_NAV_W*STRIDER_NAV_H, lazy:true,
               grid: STRIDER_NAV_GRID ? 'built' : 'not built yet',
               roadMs:+STRIDER_NAV_ROAD_MS.toFixed(1),
               buildMs:+STRIDER_NAV_BUILD_MS.toFixed(1) };
  if(opt && opt.built === false) return base;
  var g = striderNavGrid(), open=0, road=0;
  for(var i=0;i<g.length;i++){ if(!g[i]) open++; if(STRIDER_NAV_ROAD[i]) road++; }
  base.grid = 'built'; base.open = open; base.roadCells = road;
  base.buildMs = +STRIDER_NAV_BUILD_MS.toFixed(1);
  return base;
};
window._striders.navPath = function(ax,az,bx,bz){
  var p = striderNavAStar(ax,az,bx,bz);
  return p ? { raw:p.length, simplified:striderNavSimplify(p) } : null;
};
window._striders.live = function(){
  var out = [];
  LIFE_STRIDERS.forEach(function(cv){
    cv.cars.forEach(function(car, k){
      if(car.wx === undefined) return;
      out.push({ slot: cv.slot*LIFE_STRIDER_CARS_PER_CONVOY+k, car: k, variant: car.variant,
                 state: cv.state, onboard: car.onboard||0,
                 x: car.wx, y: car.wy, z: car.wz, yaw: car.wyaw,
                 h: terrainH(car.wx, car.wz) });
    });
  });
  return out;
};

/* ---- gait -------------------------------------------------------------
   Alternating tripod: the two sides of a pair are half a cycle apart, and
   consecutive pairs are a third of a cycle apart, so three feet are always
   planted. A foot's fore/aft position is cos(phase)*STRIDE and it lifts by
   sin(phase)*LIFT only on the forward half — i.e. it is on the ground for
   exactly the half-cycle it is travelling backwards relative to the body.
   The cycle RATE is derived from the convoy's own speed rather than picked
   by eye: over a stance half-cycle the mean backward foot speed is
   STRIDE*omega*2/pi, so omega = pi*speed/(2*STRIDE) makes planted feet
   track the ground at the creature's actual travel speed instead of
   skating. */
var STRIDER_STRIDE = 7.5, STRIDER_LIFT = 3.0;
var STRIDER_GAIT_PAIR = Math.PI*2/3;
var STRIDER_KNEE_OUT = 3.6, STRIDER_KNEE_UP = 3.9;
var STRIDER_FEMUR_W = 1.15, STRIDER_TIBIA_W = 0.78;
var STRIDER_BOB = 0.38, STRIDER_ROLL = 0.030;
/* STRIDER_FOOT_DROP / STRIDER_FOOT_RISE (how far a foot may hunt below and
   above the body's own ground plane before it is clamped — stops a foot
   disappearing down a canton edge or a riverbank while the body is still on
   the road above it) and STRIDER_WADE_DEPTH (how far the body origin may
   sink) are declared in the WADING block at the TOP of this file, because
   the router up there derives STRIDER_WADE_MAX from them and runs at load
   time, long before this line. */
var STRIDER_GROUND_EPS = 0.15;   /* the same epsilon every citizen stands on */

var STRIDER_LANTERN_Y = STRIDER_HOWDAH_FLOOR + 2.8;   /* on the howdah's front rail */
var STRIDER_SEAT_Y = STRIDER_HOWDAH_FLOOR + 1.5;      /* person geometry is centred, not footed */

/* ---- rendering scratch ---- */
var lifeStriderLeadPos = new THREE.Vector3();
var lifeStriderCarPos = new THREE.Vector3();
var lifeStriderCarDir = new THREE.Vector3();
var lifeStriderTmpDir = new THREE.Vector3();
var lifeStriderTmpPos = new THREE.Vector3();
var lifeStriderTmpQuat = new THREE.Quaternion();
var lifeStriderRollQuat = new THREE.Quaternion();
var lifeStriderFwd = new THREE.Vector3(0,0,1);
var lifeStriderTmpMat = new THREE.Matrix4();
var lifeStriderScale1 = new THREE.Vector3(1,1,1);
var lifeStriderScaleZero = new THREE.Vector3(0,0,0);
var striderLegP = new THREE.Vector3(), striderLegDir = new THREE.Vector3();
var striderLegQ = new THREE.Quaternion(), striderLegS = new THREE.Vector3();
var striderLegM = new THREE.Matrix4();
/* per-instance tints. setColorAt multiplies the baked vertex colour, so
   these are lifted well toward white: the canopy/rails (baked pure white)
   come out frankly jade or frankly grey, while the chitin underneath only
   takes a tinge instead of going muddy. PAL-sourced per this project's
   colour rule. */
function striderTint(hex, toWhite){
  var c = new THREE.Color(hex);
  c.r += (1-c.r)*toWhite; c.g += (1-c.g)*toWhite; c.b += (1-c.b)*toWhite;
  return c;
}
var lifeStriderPaxColor = striderTint(JADEC[2], 0.30);
var lifeStriderCargoColor = striderTint(GREYC[1], 0.30);
var LIFE_STRIDER_CAR_GAP = 50.0;   /* arc-length spacing between creatures in a convoy — the model is 40.7 long nose to tail after the snout trim, so this is a real gap, not an overlap */

/* park every slot hidden before the first real frame runs, so an unused
   3rd-creature/partial-rider slot never flashes a stray instance at the
   world origin.

   THE INSTANCE-COLOUR TRAP, still guarded: THREE allocates a mesh's
   instanceColor buffer lazily, ZERO-initialised (= black), on the first
   setColorAt() call anywhere on that mesh — which once turned every real
   merchant caravan black the moment strider tinting was added to the mesh
   they were sharing. striderMesh is no longer shared with anything, but the
   trap is identical in kind: any slot this file tints must have every OTHER
   slot on the same mesh explicitly white first, or a hidden slot that later
   becomes visible inherits black. So: white the whole mesh up front, once.
   lifeCaravanMesh is now touched by NOTHING in this file — no setColorAt,
   no setMatrixAt — so its instanceColor buffer is never allocated at all
   and the real caravans are back to their own plain baked colours. */
(function(){
  var k, white = new THREE.Color(0xffffff);
  for(k=0;k<LIFE_STRIDER_CAR_SLOTS;k++){
    striderMesh.setColorAt(k, white);
    lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
    striderMesh.setMatrixAt(k, lifeStriderTmpMat);
  }
  for(k=0;k<LIFE_STRIDER_CAR_SLOTS*STRIDER_BARS_PER_BODY;k++){
    lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
    striderLegMesh.setMatrixAt(k, lifeStriderTmpMat);
  }
  for(k=0;k<LIFE_STRIDER_RIDER_SLOTS;k++){
    lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
    lifePedMesh.setMatrixAt(LIFE_STRIDER_RIDER_BASE+k, lifeStriderTmpMat);
  }
  striderMesh.instanceColor.needsUpdate = true;
  striderMesh.instanceMatrix.needsUpdate = true;
  striderLegMesh.instanceMatrix.needsUpdate = true;
  lifePedMesh.instanceMatrix.needsUpdate = true;
})();

/* place one leg segment: a unit bar stood from a to b. */
function striderBar(idx, ax,ay,az, bx,by,bz, w){
  var dx=bx-ax, dy=by-ay, dz=bz-az;
  var len = Math.sqrt(dx*dx+dy*dy+dz*dz) || 0.001;
  striderLegDir.set(dx/len, dy/len, dz/len);
  striderLegQ.setFromUnitVectors(LIFE_UP, striderLegDir);
  striderLegP.set(ax,ay,az);
  striderLegS.set(w, len, w);
  striderLegM.compose(striderLegP, striderLegQ, striderLegS);
  striderLegMesh.setMatrixAt(idx, striderLegM);
}

/* walk one creature's six legs. gIdx is its global creature slot (0..59);
   cx/cy/cz is its body origin (cy IS the foot/ground plane, see the model
   comment), yaw its heading, gait its own cycle phase. */
function striderPlaceLegs(gIdx, cx, cy, cz, yaw, gait){
  var cs = Math.cos(yaw), sn = Math.sin(yaw);
  var base = gIdx*STRIDER_BARS_PER_BODY;
  for(var i=0;i<STRIDER_LEGS;i++){
    var pair = i>>1, side = (i&1) ? -1 : 1;
    var hzl = STRIDER_HIP_Z[pair];
    /* local->world for a yaw-only frame: +z is forward, +x is to the right */
    var hx = cx + side*STRIDER_HIP_X*cs + hzl*sn;
    var hz = cz - side*STRIDER_HIP_X*sn + hzl*cs;
    var hy = cy + STRIDER_HIP_Y;
    var ph = gait + pair*STRIDER_GAIT_PAIR + (side<0 ? Math.PI : 0);
    var fzl = hzl + Math.cos(ph)*STRIDER_STRIDE;
    var fxl = side*STRIDER_FOOT_X;
    var fx = cx + fxl*cs + fzl*sn;
    var fz = cz - fxl*sn + fzl*cs;
    var fg = lifeGroundY(fx,fz);
    if(fg < cy-STRIDER_FOOT_DROP) fg = cy-STRIDER_FOOT_DROP;
    if(fg > cy+STRIDER_FOOT_RISE) fg = cy+STRIDER_FOOT_RISE;
    var fy = fg + Math.max(0, Math.sin(ph))*STRIDER_LIFT;
    /* knee: push the hip->foot midpoint up and outward, giving the high
       bent spider knee that makes a long leg read as jointed rather than
       as a stick. Segment lengths fall out of the geometry (each bar is
       scaled to whatever it actually spans), so nothing has to be solved. */
    var kx = (hx+fx)*0.5 + cs*side*STRIDER_KNEE_OUT;
    var ky = (hy+fy)*0.5 + STRIDER_KNEE_UP;
    var kz = (hz+fz)*0.5 - sn*side*STRIDER_KNEE_OUT;
    striderBar(base+i*2,   hx,hy,hz, kx,ky,kz, STRIDER_FEMUR_W);
    striderBar(base+i*2+1, kx,ky,kz, fx,fy,fz, STRIDER_TIBIA_W);
  }
}
function striderHideLegs(gIdx){
  var base = gIdx*STRIDER_BARS_PER_BODY;
  for(var i=0;i<STRIDER_BARS_PER_BODY;i++){
    striderLegM.compose(striderLegP.set(0,0,0), striderLegQ.identity(), lifeStriderScaleZero);
    striderLegMesh.setMatrixAt(base+i, striderLegM);
  }
}

/* boarding, at an interior stop's own station door — a direct copy of
   lifeFerryBoard's own logic (78-life.js), against a strider CAR instead
   of a ferry. Cargo cars never call this (no passenger seats). */
function striderBoard(car, stationDoor){
  car.onboard = car.onboard || 0;
  var alight = Math.min(car.onboard, ri(1,3));
  car.onboard -= alight;
  var reactivated = 0;
  for(var i=0; i<LIFE_PEDS.length && reactivated<alight; i++){
    var pp = LIFE_PEDS[i];
    if(!pp || pp.state !== 'boarded' || pp.ferryRef !== car) continue;
    var newDest = lifePedPickDestination(stationDoor.x, stationDoor.z, 'strider');
    if(newDest){
      newDest.active++;
      pp.curve = lifePedBuildLeg(stationDoor.x, stationDoor.z, newDest.x, newDest.z);
      pp.len = pp.curve.getLength(); pp.dur = Math.max(3, pp.len/pp.speed);
      pp.destDoor = newDest; pp.state = 'walk'; pp.stateT = 0; pp.ferryRef = null;
    }else{
      LIFE_PEDS[i] = lifePedSpawn();
    }
    reactivated++;
  }
  var room = Math.max(0, LIFE_STRIDER_RIDER_PER_CAR - car.onboard);
  var boarding = Math.min(3, stationDoor.queueCount||0, room);
  stationDoor.queueCount = (stationDoor.queueCount||0) - boarding;
  var boarded = 0;
  for(var j=0; j<LIFE_PEDS.length && boarded<boarding; j++){
    var pq = LIFE_PEDS[j];
    if(!pq || pq.state !== 'queued' || pq.destDoor !== stationDoor) continue;
    pq.state = 'boarded'; pq.ferryRef = car; boarded++;
  }
  car.onboard += boarded;
}

function updateStriders(dt){
  LIFE_STRIDERS.forEach(function(cv, ci){
    cv.stateT += dt;
    var pos, yaw, wasTransit = false, transitLeg = null, transitUc = 0, transitDir = 1;

    if(cv.state === 'docked'){
      var st = cv.route.stops[cv.idx];
      pos = st; yaw = st.ry || 0;
      if(cv.stateT >= cv.dwell){
        var nextIdx = cv.idx + cv.dir;
        cv.legIdx = Math.min(cv.idx, nextIdx);
        cv.curveDir = cv.dir;
        cv.curveT = 0;
        cv.curve = cv.route.legs[cv.legIdx];
        cv.legLen = cv.curve.getLength();
        cv.state = 'transit'; cv.stateT = 0;
      }
    }else{
      var leg = cv.curve;
      var u = (cv.curveDir>0) ? cv.curveT : (1-cv.curveT);
      var uc = Math.min(0.998, Math.max(0.002, u));
      leg.getPointAt(uc, lifeStriderLeadPos);
      leg.getTangentAt(uc, lifeStriderTmpDir);
      var h = terrainH(lifeStriderLeadPos.x, lifeStriderLeadPos.z);
      var factor = (h < 2) ? 0.75 : 1.0;   /* wade, at 75% speed, in water — everywhere else, full speed on the road */
      cv.curveT = Math.min(1, cv.curveT + (cv.speed*factor*dt)/cv.legLen);
      pos = lifeStriderLeadPos;
      var dirx = lifeStriderTmpDir.x*cv.curveDir, dirz = lifeStriderTmpDir.z*cv.curveDir;
      yaw = Math.atan2(dirx, dirz);
      /* NOT the creature's ground clearance — only pos.x/pos.z are read
         below; each creature's own y is derived from its OWN lagged
         position further down (see STRIDER_GROUND_EPS / STRIDER_WADE_DEPTH
         at the matrix compose). Kept so the lead sample is a complete
         point for anything that inspects it. */
      pos.y = Math.max(LIFE_Y, lifeGroundY(pos.x,pos.z)+0.15);
      wasTransit = true; transitLeg = leg; transitUc = uc; transitDir = cv.curveDir;
      if(cv.curveT >= 1){
        var nextIdx2 = cv.idx + cv.dir;
        if(nextIdx2 <= 0 || nextIdx2 >= cv.route.stops.length-1){
          /* reached a terminus: respawn fresh, same route, same slot, same
             direction — keeps that route's own half/half split invariant
             true forever. */
          LIFE_STRIDERS[ci] = striderSpawnConvoy(cv.route, cv.slot, cv.dir, 0);
          return;
        }
        cv.idx = nextIdx2;
        cv.state = 'docked'; cv.stateT = 0; cv.dwell = rr(14,26);
        var stationDoor = cv.route.stops[cv.idx].door;
        if(stationDoor){
          cv.cars.forEach(function(car){ if(car.variant==='pax') striderBoard(car, stationDoor); });
        }
      }
    }

    var riderBase0 = LIFE_STRIDER_RIDER_BASE + cv.slot*LIFE_STRIDER_CARS_PER_CONVOY*LIFE_STRIDER_RIDER_PER_CAR;

    for(var k=0;k<LIFE_STRIDER_CARS_PER_CONVOY;k++){
      var car = cv.cars[k];
      var riderBase = riderBase0 + k*LIFE_STRIDER_RIDER_PER_CAR;
      var gIdx = cv.slot*LIFE_STRIDER_CARS_PER_CONVOY + k;   /* global creature slot, 0..LIFE_STRIDER_CAR_SLOTS-1 */
      if(!car){
        lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
        striderMesh.setMatrixAt(gIdx, lifeStriderTmpMat);
        striderHideLegs(gIdx);
        for(var rs0=0; rs0<LIFE_STRIDER_RIDER_PER_CAR; rs0++) lifePedMesh.setMatrixAt(riderBase+rs0, lifeStriderTmpMat);
        if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_STRIDER_BASE + gIdx, 0,0,0, false);
        continue;
      }
      /* owner: "they shouldn't all turn as a unit... should delay a
         fraction of a second before turning to actually follow them" —
         a trailing car used to reuse the LEAD car's own instantaneous
         yaw, just offset in position by arc length; every car in the
         convoy span a turn identically, in lockstep. Each car now
         samples the SAME curve at its OWN lagged arc-position instead
         (a real "where the leader was a moment ago", not a flat spatial
         offset applied to the leader's current heading) — its position
         AND heading both come from that lagged sample, so a trailing
         car only starts turning once it actually reaches the bend the
         leader already turned at. */
      var lag = k*LIFE_STRIDER_CAR_GAP;
      var carPos = pos, carYaw = yaw;
      if(wasTransit && k>0 && transitLeg){
        var uLag = Math.min(0.998, Math.max(0.002, transitUc - (transitDir>0 ? lag/cv.legLen : -lag/cv.legLen)));
        transitLeg.getPointAt(uLag, lifeStriderCarPos);
        transitLeg.getTangentAt(uLag, lifeStriderCarDir);
        var cdx = lifeStriderCarDir.x*transitDir, cdz = lifeStriderCarDir.z*transitDir;
        carYaw = Math.atan2(cdx, cdz);
        carPos = lifeStriderCarPos;
      }
      var cx, cz;
      if(wasTransit && k>0){
        cx = carPos.x + (-Math.cos(carYaw))*cv.laneOffset;
        cz = carPos.z + ( Math.sin(carYaw))*cv.laneOffset;
      }else{
        /* docked (or the lead car): no curve to sample, park spread out
           along the shared heading same as before */
        cx = pos.x - Math.sin(yaw)*lag + (-Math.cos(yaw))*cv.laneOffset;
        cz = pos.z - Math.cos(yaw)*lag + ( Math.sin(yaw))*cv.laneOffset;
      }
      /* GROUND CLEARANCE, derived from the real model rather than tuned:
         the creature is authored with y = 0 at its own foot/ground contact
         plane (see the model section's frame comment) and is instanced at
         scale 1, so the body origin sits at exactly lifeGroundY() plus the
         same 0.15 epsilon every citizen in the city stands on. The old
         `0.15*LIFE_STRIDER_SCALE + 1.6` fudge existed only because a cart
         template was being blown up 2.3x about a pivot that was not at
         wheel-ground contact; there is no such pivot error to compensate
         for now, and no scale factor to multiply it by.

         The one deliberate exception is water. Plain terrain height under
         a river is the BED, tens of units down — a strider is meant to
         WADE, so it stands on the real bed until the bed falls more than
         STRIDER_WADE_DEPTH below the surface, at which point the foot
         plane pins there and the legs simply go deeper into the water
         while the underbelly stays clear of it. (The old code clamped to
         LIFE_Y, which floated a cart ON the surface — wrong shape of fix
         for a creature that walks on the bottom.) */
      var cy = Math.max(lifeGroundY(cx,cz) + STRIDER_GROUND_EPS, LIFE_Y - STRIDER_WADE_DEPTH);

      /* gait: advance only while actually travelling, at the rate that
         makes planted feet track the ground at the creature's own speed
         (see STRIDER_STRIDE's comment for the omega derivation). Docked
         creatures hold their phase, so they stand still instead of
         marching on the spot at a station. */
      if(wasTransit) car.gait += dt * (Math.PI*cv.speed) / (2*STRIDER_STRIDE);
      var bob = wasTransit ? Math.sin(car.gait*2)*STRIDER_BOB : 0;
      var roll = wasTransit ? Math.sin(car.gait)*STRIDER_ROLL : 0;

      lifeStriderTmpPos.set(cx, cy + bob, cz);
      lifeStriderTmpQuat.setFromAxisAngle(LIFE_UP, carYaw);
      if(roll) lifeStriderTmpQuat.multiply(lifeStriderRollQuat.setFromAxisAngle(lifeStriderFwd, roll));
      lifeStriderTmpMat.compose(lifeStriderTmpPos, lifeStriderTmpQuat, lifeStriderScale1);
      striderMesh.setMatrixAt(gIdx, lifeStriderTmpMat);
      striderMesh.setColorAt(gIdx, car.variant==='pax' ? lifeStriderPaxColor : lifeStriderCargoColor);
      striderPlaceLegs(gIdx, cx, cy, cz, carYaw, car.gait);
      car.wx = cx; car.wy = cy; car.wz = cz; car.wyaw = carYaw;   /* diagnostic only — window._striders.live() */

      /* owner: "...and silt striders have a lantern" — one per creature, on
         the same shared nlMesh (82-daynight.js) every other moving lantern
         uses, hung off the howdah's own front rail. */
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_STRIDER_BASE + gIdx, cx, cy+STRIDER_LANTERN_Y, cz);

      if(car.variant === 'pax'){
        /* riders sit IN the howdah, two abreast in four rows — real seats
           on the real pod, not a ring of figures floating over a cart. */
        var onboard = Math.min(LIFE_STRIDER_RIDER_PER_CAR, car.onboard||0);
        var rcs = Math.cos(carYaw), rsn = Math.sin(carYaw);
        for(var s=0;s<LIFE_STRIDER_RIDER_PER_CAR;s++){
          if(s < onboard){
            var sxl = ((s&1) ? -1 : 1)*2.0;
            var szl = STRIDER_HOWDAH_Z + 3.0 - (s>>1)*2.1;
            lifeStriderTmpPos.set(cx + sxl*rcs + szl*rsn,
                                  cy + bob + STRIDER_SEAT_Y,
                                  cz - sxl*rsn + szl*rcs);
            lifeStriderTmpMat.compose(lifeStriderTmpPos, lifeStriderTmpQuat, lifeStriderScale1);
          }else{
            lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat, lifeStriderScaleZero);
          }
          lifePedMesh.setMatrixAt(riderBase+s, lifeStriderTmpMat);
        }
      }else{
        for(var s2=0;s2<LIFE_STRIDER_RIDER_PER_CAR;s2++){
          lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat, lifeStriderScaleZero);
          lifePedMesh.setMatrixAt(riderBase+s2, lifeStriderTmpMat);
        }
      }
    }
  });
  striderMesh.instanceMatrix.needsUpdate = true;
  striderMesh.instanceColor.needsUpdate = true;
  striderLegMesh.instanceMatrix.needsUpdate = true;
  lifePedMesh.instanceMatrix.needsUpdate = true;
}
