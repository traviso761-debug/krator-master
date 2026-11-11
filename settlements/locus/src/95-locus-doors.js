/* ============================== 31b. THE DOORS: core/door on the Yuni engine's leaves ==============================
   Every door a builder drew (53-assets.js F.door) is a record in core/door's KDOOR, its leaf an instance of the 'leaf'
   bucket hung from its hinge (45-kit.js SHAPES.leaf). The kits' bodies are solid, so the doors are drawn locked; with the
   interiors on (?interiors=1) a door that opens onto a room they planned is unlocked as built (66-locus-furnish.js), and the
   walker, E (98-start.js), an NPC or a quest (KDOOR.open / close by id) opens it. Here, once the kit is emitted (75-terrain.js):
   each leaf handed to the host (KDOORHOST.posed: its instance turned about the hinge as KDOOR eases it), each door's walk
   blocks put in core/walk (KDOOR.walk: shut = blocked) and any other block standing in an unlocked doorway switched off
   (KDOOR.clearDoorways: an interiors room wall), the "E: open the door" line, and the probe's counts (window._openings:
   doors, locked, leaves, panes, cards, and the voids left in the 'dark' family: vents' shade, flues, wells, pipes, pits).
   Mungo reads this fragment by name; a bundle with no core/door draws its leaves shut and registers nothing. */
var LDOOR = { on: typeof KDOOR !== 'undefined' && typeof KDOORHOST !== 'undefined' };
(function(){
  if(!LDOOR.on) return;
  var o = new THREE.Object3D();
  function poseLeaf(R){ var k = R._leaf, B = BUCKET[k.key]; if(!B || !B.mesh || !B.list[k.i]) return; var r = B.list[k.i];
    o.position.set(r[0], r[1], r[2]); o.scale.set(r[3], r[4], r[5]); o.rotation.set(0, r[6] + KDOOR.angle(R), 0, 'YXZ'); o.updateMatrix();
    B.mesh.setMatrixAt(k.i, o.matrix); B.mesh.instanceMatrix.needsUpdate = true; }
  KDOOR.list.forEach(function(R){ if(R._leaf) KDOORHOST.posed(R, poseLeaf); });
  if(typeof KWALK !== 'undefined'){ KDOOR.walk(KWALK); LDOOR.cleared = KDOOR.clearDoorways(KWALK); }
  TICKS.push(function(dt){ KDOORHOST.tick(dt); });
  LDOOR.walking = function(){ return !!(window.KHOST && KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.walk); };
  LDOOR.eye = function(){ return camera.position; };
  var tip = KDOORHOST.tip(LDOOR.eye, LDOOR.walking);
  TICKS.push(function(){ tip(); });
  var voids=0, cards=0; for(var k in BUCKET){ var B=BUCKET[k]; if(B.fam!=='dark') continue; B.list.forEach(function(r){ if(yopenIsCard(r[7])) cards++; else voids++; }); }   /* a card is a 'dark' instance in the room's colour */
  window._openings = { doors:KDOOR.list.length, locked:KDOOR.list.filter(function(R){ return R.locked; }).length, leaves:YOPEN.leaves,
    panes:YOPEN.panes, cards:cards, voids:voids, cleared:LDOOR.cleared || 0 };
  /* the reachability audit (core/walk): every floor the interiors registered, flooded from the step outside each unlocked door
     (the doors opened first, as a walker would); verify.py --eval "()=>LDOOR.reach()" on locus.html?interiors=1 */
  /* o.all: every door open, locked or not (the page as it was before core/door: its leaves stood in no walk) */
  LDOOR.reach = function(o){ var all = !!(o && o.all), by = {}, shut = [], seen = new Set(), hit = new Set(), out = { all:all, placements:0, starts:0, capped:0, nodes:0 };
    KDOOR.list.forEach(function(R){ if(R.locked && !all) return; shut.push(R); KWALK.setBlock(R.blocks, false);
      var pk = R.id.replace(/\.d\d+$/, ''); (by[pk] || (by[pk] = [])).push(R); });
    /* one flood per placement, over its own box (the doors' steps and 24 m round them), on the floors and the open ground */
    /* the starts: the street in front of each door, at the ground 1 to 7 m out (a raised house's entry flight starts there), and its step */
    for(var pk in by){ var L = by[pk], st = [];
      L.forEach(function(R){ var nx = Math.sin(R.yaw), nz = Math.cos(R.yaw); st.push([R.at[0] + nx*0.9, R.at[1], R.at[2] + nz*0.9]);
        [1, 2.5, 4, 5.5, 7].forEach(function(t){ var x = R.at[0] + nx*t, z = R.at[2] + nz*t; st.push([x, terrainH(x, z), z]); }); });
      var x0 = Math.min.apply(null, st.map(function(s){ return s[0]; })) - 24, x1 = Math.max.apply(null, st.map(function(s){ return s[0]; })) + 24,
          z0 = Math.min.apply(null, st.map(function(s){ return s[2]; })) - 24, z1 = Math.max.apply(null, st.map(function(s){ return s[2]; })) + 24;
      var res = KWALK.reach(st, { ground:terrainH, box:[x0, x1, z0, z1] });
      out.placements++; out.starts += L.length; out.nodes += res.nodes; if(res.capped) out.capped++;
      res.reached.forEach(function(f){ hit.add(f); seen.add(f); }); res.unreached.forEach(function(f){ seen.add(f); }); }
    shut.forEach(function(R){ if(R.open < 0.5 || R.locked) KWALK.setBlock(R.blocks, true); });
    var miss = []; seen.forEach(function(f){ if(!hit.has(f)) miss.push(f); });
    out.floors = KWALK.floors.length; out.near = seen.size; out.reached = hit.size; out.unreached = miss.length;
    out.never = KWALK.floors.length - seen.size;   /* floors no unlocked door's box takes in: a room behind a locked door */
    out.sample = miss.slice(0, 12).map(function(f){ return f.name || f.tag; }); return out; };
})();
window.LDOOR = LDOOR;
