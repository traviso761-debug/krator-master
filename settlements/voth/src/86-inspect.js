/* ============================== 27. DEV INSPECTOR ==============================
   Toggleable hover tool, per the owner's ask: turn it on, mouse over any
   citizen, building or tree, and a small tooltip names the most specific
   thing known about whatever is under the cursor. Off by default.

   Pure read-only UI — writes nothing back into the sim, adds no geometry,
   so it costs nothing against the draw-call/triangle budget. It reads
   registries other fragments already built:
     - 45-kit.js tags every static-bake InstancedMesh with userData.shape/
       fam (one mesh per (shape,family) bucket) — the material-level
       fallback label, always available.
     - 78-life.js tags every citizen/vehicle InstancedMesh with
       userData.inspectLabel (a role, e.g. 'Ordinator', 'Pedestrian').
     - CIDX (30-layout.js), window._newGates/_standaloneShrineDebug and
       TEMPLE_ALTAR (65-facade.js) give real landmark names+positions.
     - PLACED (60-land.js) gives every claimed footprint's oriented
       rectangle + tag ('compound','temple','shop', ...), for a
       type-level label when no landmark is close enough.
   No fragment after this one is required to exist for the tool to work;
   it only reads things fragments before it already populated. */

var FAM_LABEL = { stone:'Stone masonry', plaster:'Plaster wall', roof:'Roof',
  wood:'Timber', dome:'Dome', leaf:'Foliage', trunk:'Tree trunk',
  fungus:'Fungus growth', metal:'Metalwork', cloth:'Banner' };
function inspectMatLabel(shape, fam){
  if(fam==='leaf'   && shape==='blob') return 'Tree canopy';
  if(fam==='trunk') return 'Tree trunk';
  if(fam==='fungus' && shape==='blob') return 'Giant fungus cap';
  if(fam==='fungus' && shape==='stk')  return 'Giant fungus stalk';
  if(fam==='roof')  return 'Roof';
  if(fam==='dome')  return 'Dome';
  if(fam==='cloth') return 'Banner';
  return FAM_LABEL[fam] || (shape+' / '+fam);
}
var TAG_LABEL = { barn:'Barn', compound:'Walled compound', customs:'Customs house',
  farm:'Farmstead', field:'Farm field', fixed:'Structure', gate:'Gate', manor:'Manor house',
  prop:'Roadside structure', rdock:'River dock', rshed:'River-pier shed',
  shed:'Shed', shop:'Shop', shrine:'Shrine', stall:'Market stall',
  temple:'Funerary temple', tower:'Watchtower', town:'Town building', warehouse:'Warehouse',
  /* owner: "taverns, house of healing, and other recent placements don't
     have this" — every claim() tag actually in use was audited against this
     table (grep the claim() call sites for the live list); these eight were
     claiming footprints but had no label, so the inspector fell through to
     showing only the material. */
  tavern:'Tavern', houseOfHealing:'House of Healing', fishdock:"Fisherman's dock",
  industry:'Industrial site', grave:'Grave', tomb:'Family tomb',
  monument:'Monument', exotic:'Ornamental tree' };

/* owner: "all current (and future!) objects should pop up the top level
   name". A hand-maintained table can only ever cover tags that existed when
   it was written, so an unknown tag is no longer dropped: it is prettified
   into a readable label instead (camelCase and snake/kebab split, sentence
   case). A future pass adding claim(..., 'beetleRanch') therefore shows
   "Beetle ranch" with no edit here at all. */
function prettyTag(tag){
  if(!tag) return null;
  if(TAG_LABEL[tag]) return TAG_LABEL[tag];
  var s = String(tag).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_\-]+/g, ' ').trim();
  if(!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/* named landmarks: every canton (resolved x/z/r off CIDX, so it holds for
   both 'mono' and 'plat' kinds), the Temple's sacrifice altar, every new
   gate, every standalone shrine that actually placed, and the abbey
   compound (its own owner-given coordinate, see 61-monastery.js's final
   call — no live registry exists for it beyond the plain instance count,
   so the position is repeated here rather than invented). */
var NAMED_SITES = [];
(function(){
  CANTONS.forEach(function(c){
    var cc = CIDX[c.n]; if(!cc || cc.x===undefined) return;
    NAMED_SITES.push({ name: cc.n+' canton', x:cc.x, z:cc.z, r:(cc.r||90) });
  });
  if(typeof TEMPLE_ALTAR !== 'undefined' && TEMPLE_ALTAR){
    NAMED_SITES.push({ name:'Sacrifice altar', x:TEMPLE_ALTAR.x, z:TEMPLE_ALTAR.z, r:16 });
  }
  (window._newGates||[]).forEach(function(g){ NAMED_SITES.push({ name:g.name, x:g.x, z:g.z, r:18 }); });
  (window._standaloneShrineDebug||[]).forEach(function(s){
    if(s.ok) NAMED_SITES.push({ name:s.name, x:s.x, z:s.z, r:16 });
  });
  NAMED_SITES.push({ name:'Abbey compound', x:-1289.5, z:-429.7, r:150 });
})();
function nearestNamedSite(x,z){
  var best=null, bestD=Infinity;
  for(var i=0;i<NAMED_SITES.length;i++){
    var s=NAMED_SITES[i], d=Math.hypot(x-s.x, z-s.z);
    if(d<=s.r && d<bestD){ best=s; bestD=d; }
  }
  return best;
}
/* ---- the inspect-only footprint registry ---------------------------------
   owner: "it would also be nice to be able to inspect guild halls and canton
   buildings independently of the canton". Two of the three causes of that
   are fixed above (TAG_LABEL gaps, and describeHit()'s ordering). The third
   is that canton-TOP buildings were never in the claim()/PLACED system at
   all: 50-cantons.js makes zero claim() calls, by design — a canton deck is
   built from fixed local offsets on a platform nothing else is ever placed
   on, so it never needed collision arbitration. Probed live before writing
   any of this: placedTagAt() at the Guild canton's centre returned null.

   So these footprints go into their own registry rather than into PLACED.
   That is a deliberate choice, not a shortcut: claim() is the LIVE collision
   system, and it is consulted by passes that run after the cantons are built
   (60-land.js's town/compound/warehouse scans, 69-district-content.js,
   71-industry.js, the wall). Retro-claiming ~100 canton-top rectangles would
   let those passes start rejecting candidates they previously accepted, on
   ground that is 40+ units up in the air on a platform they could never
   reach anyway — i.e. it would silently change the world to fix a tooltip.
   This registry feeds placedTagAt() and nothing else, so it cannot.

   Hoisted so canton/facade fragments (50, 65) can call it despite loading
   first; the array is created on the window at first call for the same
   reason (a `var` here would still be undefined when 50-cantons.js runs).
   `label` overrides the tag when a record knows its own name — "Blacksmith's
   guild hall" rather than the tag-derived "Guildhall". */
function inspectClaim(x, z, fx, fz, ry, tag, label){
  var A = window._inspectFP || (window._inspectFP = []);
  A.push({ x:x, z:z, fx:fx, fz:fz, ry:ry||0, rad:Math.hypot(fx,fz), tag:tag, label:label||null });
}

/* ---- per-INSTANCE identity on a SHARED InstancedMesh ---------------------
   The registry above answers "what is standing at this point on the ground".
   This one answers a different question the life layer keeps asking: "which
   ONE of the N things sharing this mesh did I just hover".

   Why it exists. userData.inspectLabel is per-MESH, and the life layer
   deliberately pools bespoke vehicles into shared meshes to stay inside the
   draw-call budget — the Fortress coast-guard junk is instance 9 of the same
   InstancedMesh that draws nine ordinary merchant junks (78-life.js), so the
   mesh-level label can only ever say "Ship hull" for all ten. The first fix
   for that reached back from fragment 78 and REBOUND describeHit itself,
   which worked only because a function declaration is instantiated once at
   scope entry rather than at its textual position — invisible action at a
   distance, silently broken by reordering the fragments or by turning that
   declaration into an assignment. This is the same thing done as a real
   extension point: 86-inspect.js owns the dispatch, and a fragment that has
   a bespoke instance only REGISTERS it, the builder-fills/consumer-reads
   idiom GUILD_WORK_POSTS, LIFE_RBARGE_DOCKS and LIFE_CGUARD_BERTHS already
   use. The next one-off hull to share a pooled mesh registers itself and
   never touches this file.

   Keyed on (mesh, instance index) — what the raycast hit actually carries
   (THREE sets intersection.instanceId on an InstancedMesh hit) — NOT on a
   proximity test against the thing's current position. A moving vehicle's
   position is a moving target and a radius around it is a guess; the
   instance index is exact and free.

   spec: { key, mesh, index, label, site }
     key    unique string; re-registering a key replaces it
     mesh   the InstancedMesh, or a function returning it (for a registrant
            whose mesh does not exist yet at registration time)
     index  the instance slot, or a function returning it (for a vehicle that
            can move between slots)
     label  the headline, or a function returning it
     site   optional context to use when nearestNamedSite() finds nothing.
            Needed because a thing can genuinely belong to a landmark while
            floating outside every NAMED_SITES radius: the coast-guard junk
            lies 245 units off the Fortress canton's centre against a 150
            radius, so the automatic lookup returns null for it.

   Hoisted, and the array is created on window at first call, for the same
   reason inspectClaim() above is: fragment 78 runs long before this file. */
function inspectInstance(spec){
  var A = window._inspectInst || (window._inspectInst = []);
  for(var i=0;i<A.length;i++){ if(A[i].key === spec.key){ A[i] = spec; return spec; } }
  A.push(spec);
  return spec;
}
function inspectInstanceAt(mesh, instanceId){
  var A = window._inspectInst;
  if(!A || instanceId === undefined || instanceId === null) return null;
  for(var i=0;i<A.length;i++){
    var s = A[i];
    var m = (typeof s.mesh === 'function') ? s.mesh() : s.mesh;
    if(m !== mesh) continue;
    var ix = (typeof s.index === 'function') ? s.index() : s.index;
    if(ix !== instanceId) continue;
    return s;
  }
  return null;
}

/* smallest footprint (oriented rectangle) containing (x,z) — same
   local-frame inversion loc() uses elsewhere (world->local: rotate the
   offset by +ry), guarded first by each claim's own bounding radius so
   most of PLACED's many thousand entries are skipped by a single hypot().
   Searches PLACED and the inspect-only registry above as one list: both
   carry the same {x,z,fx,fz,ry,rad,tag} shape, and smallest-area-wins
   picks the most specific thing standing at the point either way. */
function placedTagAt(x,z){
  var best=null, bestArea=Infinity;
  var lists=[PLACED, window._inspectFP || []];
  for(var L=0;L<lists.length;L++){
    var list=lists[L];
    for(var i=0;i<list.length;i++){
      var o=list[i], dx=x-o.x, dz=z-o.z;
      if(dx*dx+dz*dz > o.rad*o.rad) continue;
      var c=Math.cos(o.ry||0), s=Math.sin(o.ry||0);
      var lx=dx*c-dz*s, lz=dx*s+dz*c;
      if(Math.abs(lx)<=o.fx && Math.abs(lz)<=o.fz){
        var area=o.fx*o.fz;
        if(area<bestArea){ bestArea=area; best=o; }
      }
    }
  }
  return best;
}
/* owner: "it would also be nice to be able to inspect guild halls and canton
   buildings independently of the canton - right now it just pops up the
   canton name". Real cause: nearestNamedSite() was consulted BEFORE
   placedTagAt() and returned early, and every canton is a named site with a
   90-138 unit radius — so anything standing inside a canton could never
   report itself, the canton always answered first. Order is now
   specific-first: the smallest PLACED footprint containing the point wins
   the headline, and the named site it stands in becomes CONTEXT after it
   rather than replacing it, so a hit reads "Tavern — Market canton —
   Plaster" instead of just "Market canton". Anything with no footprint of
   its own still falls back to the site name exactly as before. */
function describeHit(mesh, point, instanceId){
  var site = nearestNamedSite(point.x, point.z);
  /* specific-before-general, one step further than before: a single named
     INSTANCE of a pooled mesh (inspectInstance() above) outranks that mesh's
     own role label, which by construction is the generic one shared by
     everything else in the pool. instanceId is optional — a caller that does
     not have one simply falls through to the mesh-level answer, unchanged. */
  var inst = inspectInstanceAt(mesh, instanceId);
  if(inst){
    var instLabel = (typeof inst.label === 'function') ? inst.label() : inst.label;
    var instSite = site ? site.name : (inst.site || null);
    return instLabel + (instSite ? '  —  '+instSite : '');
  }
  if(mesh.userData.inspectLabel){
    return mesh.userData.inspectLabel + (site ? '  —  '+site.name : '');
  }
  var matLabel = inspectMatLabel(mesh.userData.shape, mesh.userData.fam);
  var pl = placedTagAt(point.x, point.z);
  /* a registry record may name itself (inspectClaim()'s `label`, e.g.
     "Weaver's guild hall"); otherwise the tag is prettified as before. */
  var tagName = pl ? (pl.label || prettyTag(pl.tag)) : null;
  var parts = [];
  if(tagName) parts.push(tagName);
  if(site) parts.push(site.name);
  parts.push(matLabel);
  return parts.join('  —  ');
}

var INSPECT_ON = false;
var inspectRay = new THREE.Raycaster();
var inspectNdc = new THREE.Vector2();
var inspectTargets = null;
function inspectBuildTargets(){
  inspectTargets = scene.children.filter(function(o){
    return o.isInstancedMesh && (o.userData.shape || o.userData.inspectLabel);
  });
}
var inspectPending = false, inspectClientX = 0, inspectClientY = 0;
function inspectFrame(){
  inspectPending = false;
  if(!INSPECT_ON) return;
  if(!inspectTargets) inspectBuildTargets();
  inspectRay.setFromCamera(inspectNdc, camera);
  var hits = inspectRay.intersectObjects(inspectTargets, false);
  var tip = document.getElementById('inspectTip');
  if(!hits.length){ tip.style.display='none'; return; }
  /* .instanceId is what THREE's InstancedMesh.raycast() records on the
     intersection; it is what makes one pooled instance nameable (see
     inspectInstance()). Undefined on a non-instanced hit, which describeHit
     handles. */
  tip.innerHTML = '<b>'+describeHit(hits[0].object, hits[0].point, hits[0].instanceId)+'</b>';
  tip.style.left = (inspectClientX+14)+'px';
  tip.style.top  = (inspectClientY+14)+'px';
  tip.style.display = 'block';
}
(function(){
  var host = renderer.domElement;
  host.addEventListener('pointermove', function(e){
    if(!INSPECT_ON) return;
    var r = host.getBoundingClientRect();
    inspectNdc.x = ((e.clientX-r.left)/r.width)*2-1;
    inspectNdc.y = -((e.clientY-r.top)/r.height)*2+1;
    inspectClientX = e.clientX; inspectClientY = e.clientY;
    if(inspectPending) return;
    inspectPending = true;
    requestAnimationFrame(inspectFrame);
  });
  var btn = document.getElementById('inspectToggle');
  if(btn) btn.onclick = function(){
    INSPECT_ON = !INSPECT_ON;
    btn.textContent = 'Inspector: '+(INSPECT_ON?'On':'Off');
    btn.classList.toggle('on', INSPECT_ON);
    if(!INSPECT_ON) document.getElementById('inspectTip').style.display='none';
  };
})();
window._inspect = { get:function(){ return INSPECT_ON; }, set:function(v){ INSPECT_ON=!!v; },
                     describeHit:describeHit, nearestNamedSite:nearestNamedSite, placedTagAt:placedTagAt,
                     instanceAt:inspectInstanceAt,
                     namedInstances:(window._inspectInst||[]).length,   /* diagnostic: bespoke instances of pooled meshes */
                     footprints:(window._inspectFP||[]).length };   /* diagnostic: canton-top records registered */
