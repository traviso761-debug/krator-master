/* ==== KCHAR: the character record and its pose. [G data]: no THREE, no DOM. Godot twin: godot/krator/character/kchar.gd ====
   A character is a record (the kit is data/<body>/kit.json, made by tools/make_kit.py):
     { body:'male',                                        which kit
       head:'styv', hair:'hair_m_long', beard:null,        a head; hair and a beard only on a bald or base head
       armour: { torso:'bronze', legs:null, feet:'bone' }, an outfit id per armour slot, or none: the base body shows
       sliders: { height:0.3, jaw:-0.5, ... },             -1..1, missing = 0 (data/sliders.json)
       dye: { torso:'#a04030', hair:'#c08040' } }          optional colour multiplied into an armour slot or the hair
   KCHAR.pose(skel, sliders, values, faceRest) turns the slider values into what the renderer sets on the shared skeleton:
     t[i]     the joint's rest offset from its parent (parent frame), replacing the bind one
     s[i]     the joint's skin scale (its own frame): the renderer folds it into that joint's inverse bind matrix, so it
              scales only the vertices the joint carries and is not passed down the hierarchy (no shear)
     root     a uniform scale for the whole figure
     lift     metres to raise the hips so the feet stay on the ground when the legs change length
   faceRest: { face_nose:[x,y,z], ... } the equipped head piece's face joints (outfits.json face, in mesh space); they are
   turned into offsets from Head here, since each head was made with its own face.
   KCHAR.parts(record, kit) the meshes to draw: the base body's regions, the head, hair and beard, the armour.
   KCHAR.hidden(record, kit) per base region, which triangles the worn armour covers (the renderer leaves them out).
   KCHAR.random(seed, sliders, kit) a record drawn from KRAND (core/rand).
*/
var KCHAR = (function(){
  function qmul(a, b){ return [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1], a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],
                               a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3], a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]]; }
  function qrot(q, v){ var x=q[0], y=q[1], z=q[2], w=q[3];
    var ix = w*v[0]+y*v[2]-z*v[1], iy = w*v[1]+z*v[0]-x*v[2], iz = w*v[2]+x*v[1]-y*v[0], iw = -x*v[0]-y*v[1]-z*v[2];
    return [ix*w+iw*-x+iy*-z-iz*-y, iy*w+iw*-y+iz*-x-ix*-z, iz*w+iw*-z+ix*-y-iy*-x]; }
  function qinv(q){ return [-q[0], -q[1], -q[2], q[3]]; }

  /* world (bind) rotation and position of every joint, from local offsets t and the bind rotations */
  function fk(skel, t){
    var J = skel.joints, R = [], P = [];
    for(var i=0;i<J.length;i++){
      var p = J[i].parent;
      if(p < 0){ R[i] = J[i].r.slice(); P[i] = t[i].slice(); continue; }
      var o = qrot(R[p], t[i]);
      R[i] = qmul(R[p], J[i].r); P[i] = [P[p][0]+o[0], P[p][1]+o[1], P[p][2]+o[2]];
    }
    return { R:R, P:P };
  }

  function index(skel){
    if(!skel._ix){ skel._ix = {}; skel.joints.forEach(function(j, i){ skel._ix[j.name] = i; }); }
    return skel._ix;
  }

  function faceOffsets(skel, faceRest){
    /* faceRest is in mesh space; the face joints hang from Head with Head's rotation, so offset = inv(R_head) (p - P_head) */
    var ix = index(skel), t = skel.joints.map(function(j){ return j.t.slice(); });
    if(!faceRest) return t;
    var w = fk(skel, t), h = ix.Head, qi = qinv(w.R[h]);
    Object.keys(faceRest).forEach(function(n){
      if(ix[n] === undefined) return;
      var p = faceRest[n], d = [p[0]-w.P[h][0], p[1]-w.P[h][1], p[2]-w.P[h][2]];
      t[ix[n]] = qrot(qi, d);
    });
    return t;
  }

  function pose(skel, sliders, values, faceRest){
    var J = skel.joints, ix = index(skel), n = J.length;
    var bind = faceOffsets(skel, faceRest), t = bind.map(function(v){ return v.slice(); });
    var s = J.map(function(){ return [1, 1, 1]; }), root = 1, kids = J.map(function(){ return []; });
    J.forEach(function(j, i){ if(j.parent >= 0) kids[j.parent].push(i); });
    function sub(i, out){ out.push(i); kids[i].forEach(function(c){ sub(c, out); }); return out; }
    values = values || {};
    sliders.sliders.forEach(function(sl){
      var v = +values[sl.id] || 0;
      if(!v) return;
      v = Math.max(-1, Math.min(1, v));
      sl.ops.forEach(function(op){
        if(op.op === 'root'){ root *= Math.pow(op.f, v); return; }
        (op.joints || []).forEach(function(name){
          var i = ix[name]; if(i === undefined) return;
          var k, a;
          if(op.op === 'scale'){ for(a=0;a<3;a++) s[i][a] *= Math.pow(op.s[a], v); }
          else if(op.op === 'girth'){ k = Math.pow(op.f, v); s[i][0] *= k; s[i][2] *= k; }
          else if(op.op === 'len'){ k = Math.pow(op.f, v); s[i][1] *= k;
            kids[i].forEach(function(c){ for(a=0;a<3;a++) t[c][a] *= k; }); }
          else if(op.op === 'grow'){ k = Math.pow(op.f, v);
            sub(i, []).forEach(function(c){ for(a=0;a<3;a++) s[c][a] *= k; if(c !== i) for(a=0;a<3;a++) t[c][a] *= k; }); }
          else if(op.op === 'move'){ for(a=0;a<3;a++) t[i][a] += v * op.d[a]; }
        });
      });
    });
    /* feet on the ground: the mean foot height in the bind pose minus the same with the new offsets */
    var feet = ['LeftFoot', 'RightFoot'].map(function(nm){ return ix[nm]; }).filter(function(i){ return i !== undefined; });
    var lift = 0;
    if(feet.length){
      var a0 = fk(skel, bind).P, a1 = fk(skel, t).P;
      feet.forEach(function(i){ lift += (a0[i][1] - a1[i][1]) / feet.length; });
    }
    return { t:t, s:s, root:root, lift:lift, n:n };
  }

  /* ---- the kit (data/<body>/kit.json): what to draw for a record, and what of the base body to leave out ---- */
  function key(glb){ return glb.replace(/^pieces\//, '').replace(/\.glb$/, ''); }
  function byId(list, id){ for(var i=0;i<list.length;i++) if(list[i].id === id) return list[i]; return null; }
  function headOf(rec, kit){
    if(kit.style === 'mpfb') return { id:'base', name:'Base', style:'base', face:null };   // the head is the base's
    return byId(kit.heads, rec.head) || byId(kit.heads, kit.base);
  }
  var MPFB_SLOTS = ['feet', 'legs', 'torso', 'hair', 'beard'];
  function mpfbItem(rec, kit, slot){
    var id = (slot === 'hair' || slot === 'beard') ? rec[slot] : (rec.armour || {})[slot];
    var it = id && byId(kit.items, id);
    return it && it.slot === slot ? it : null;
  }
  function takesHair(head){ return !!head && (head.style === 'bald' || head.style === 'base'); }
  function hairFor(kit, id, head, kind){
    for(var i=0;i<kit.hair.length;i++){ var h = kit.hair[i]; if(h.id === id && h.head === head && h.kind === kind) return h; }
    return null;
  }

  /* every mesh to draw: { key, mesh, role, slot } (key = the GLB's path under pieces/, without .glb) */
  function parts(rec, kit){
    var out = [], head = headOf(rec, kit);
    if(kit.style === 'mpfb'){
      /* a MakeHuman body: the base (skin, brows, lashes, nails), then each item; mesh '*' is every mesh in the GLB */
      out.push({ key:key(kit.base_glb), mesh:'*', role:'base', slot:'base' });
      MPFB_SLOTS.forEach(function(slot){
        var it = mpfbItem(rec, kit, slot);
        if(it) out.push({ key:key(it.glb), mesh:'*', role:(slot === 'hair' || slot === 'beard') ? slot : 'armour', slot:slot });
      });
      return out;
    }
    kit.regions.forEach(function(r){ out.push({ key:key('pieces/' + kit.body + '/base.glb'), mesh:'base_' + r, role:'base', slot:r }); });
    out.push({ key:key(head.glb), mesh:'head', role:'head', slot:'head' });
    if(takesHair(head)){
      ['hair', 'beard'].forEach(function(kind){
        var h = rec[kind] && hairFor(kit, rec[kind], head.id, kind);
        if(h) out.push({ key:key(h.glb), mesh:kind, role:kind, slot:kind });
      });
    }
    var arm = rec.armour || {};
    ['feet', 'legs', 'torso'].forEach(function(slot){
      var a = arm[slot] && byId(kit.armour, arm[slot]);
      if(a && a.slots[slot]) out.push({ key:key(a.glb), mesh:slot, role:'armour', slot:slot });
    });
    return out;
  }

  /* a base64 bitset (make_kit.bits) as an array of 0/1 per triangle */
  function unbits(b64, n){
    var bin = atob(b64), out = new Uint8Array(n);
    for(var i=0;i<n;i++) out[i] = (bin.charCodeAt(i >> 3) >> (i & 7)) & 1;
    return out;
  }

  /* per base region, 1 for each triangle some worn armour covers */
  function hidden(rec, kit){
    var out = {}, arm = rec.armour || {};
    if(kit.style === 'mpfb'){
      var o = new Uint8Array(kit.base_tris);
      MPFB_SLOTS.forEach(function(slot){
        var it = mpfbItem(rec, kit, slot); if(!it || !it.hide) return;
        var b = unbits(it.hide, kit.base_tris);
        for(var i=0;i<b.length;i++) o[i] |= b[i];
      });
      return { base:o };
    }
    kit.regions.forEach(function(r){ out[r] = new Uint8Array(kit.base_tris[r]); });
    Object.keys(arm).forEach(function(slot){
      var a = arm[slot] && byId(kit.armour, arm[slot]), s = a && a.slots[slot];
      if(!s) return;
      Object.keys(s.hide).forEach(function(r){
        var b = unbits(s.hide[r], kit.base_tris[r]), o = out[r];
        for(var i=0;i<b.length;i++) o[i] |= b[i];
      });
    });
    return out;
  }

  function blank(kit){
    if(kit.style === 'mpfb') return { body:kit.body, hair:null, beard:null, armour:{ torso:null, legs:null, feet:null }, sliders:{},
                                      morph:{}, ancestry:null, skin:null, hair_color:null, people:null, dye:{} };
    return { body:kit.body, head:kit.base, hair:null, beard:null, armour:{ torso:null, legs:null, feet:null },
             sliders:{}, dye:{} };
  }

  function random(seed, sliders, kit, spread){
    var st = KRAND.stream(seed), r = st.next, rec = blank(kit);
    spread = spread === undefined ? 0.6 : spread;
    function pick(list){ return list[Math.floor(r() * list.length)]; }
    if(kit.style === 'mpfb') return stranger(seed, kit, null, spread);
    rec.head = pick(kit.heads).id;
    var hairs = kit.hair.filter(function(h){ return h.head === rec.head && h.kind === 'hair'; });
    var beards = kit.hair.filter(function(h){ return h.head === rec.head && h.kind === 'beard'; });
    rec.hair = hairs.length && r() < 0.85 ? pick(hairs).id : null;
    rec.beard = beards.length && r() < 0.5 ? pick(beards).id : null;
    ['torso', 'legs', 'feet'].forEach(function(slot){
      var have = kit.armour.filter(function(a){ return a.slots[slot]; });
      rec.armour[slot] = have.length && r() < 0.9 ? pick(have).id : null;
    });
    sliders.sliders.forEach(function(sl){ rec.sliders[sl.id] = Math.round((r() * 2 - 1) * spread * 100) / 100; });
    return rec;
  }

  /* ---- a MakeHuman body's morphs (kit.morph, tools/make_mpfb.py) ----
     rec.morph     { <slider id>: -1..1 }: a slider at v < 0 weighs its minus target by -v, at v > 0 its plus target by v
                   (times the slider's reach, when it has one)
     rec.ancestry  { african, asian, caucasian } shares (normalised here): each race target weighs (share - the base's)
     morphWeights(rec, kit) -> one weight per target (kit.morph.targets)
     morphJoints(skel, kit, w) -> { d: per joint, how far its rest moves (model space), t: the new rest offsets }
     The meshes move by the same weights (the figure blends each piece's deltas); the bones keep their bind
     rotations, so a vertex's skinned rest is exactly its morphed position */
  var RACES = ['african', 'asian', 'caucasian'];
  function morphWeights(rec, kit){
    var M = kit.morph, w = new Float32Array(M.targets.length), mv = rec.morph || {};
    M.morphs.forEach(function(s){
      var v = (+mv[s.id] || 0) * (s.reach || 1);
      if(v < 0 && s.minus !== undefined) w[s.minus] = -v;
      else if(v > 0 && s.plus !== undefined) w[s.plus] = v;
    });
    var a = rec.ancestry, A = M.ancestry;
    if(a){
      var sum = RACES.reduce(function(x, r){ return x + Math.max(0, +a[r] || 0); }, 0);
      var bsum = A.base[0] + A.base[1] + A.base[2];       // MakeHuman's own shares (0.33 each) need not sum to 1
      if(sum > 0) RACES.forEach(function(r, k){ if(A[r] !== undefined && A[r] !== null) w[A[r]] = Math.max(0, +a[r] || 0) / sum - A.base[k] / bsum; });
    }
    return w;
  }
  function morphJoints(skel, kit, w){
    var M = kit.morph, J = skel.joints, d = J.map(function(){ return [0, 0, 0]; });
    Object.keys(M.morph_joints).forEach(function(t){
      var x = w[+t]; if(!x) return;
      M.morph_joints[t].forEach(function(r){ var v = d[r[0]]; v[0] += x * r[1]; v[1] += x * r[2]; v[2] += x * r[3]; });
    });
    M.follow.forEach(function(i){ if(J[i].parent >= 0) d[i] = d[J[i].parent].slice(); });
    var bind = J.map(function(j){ return j.t.slice(); }), R = fk(skel, bind).R;
    var t = J.map(function(j, i){
      var p = j.parent; if(p < 0) return [j.t[0] + d[i][0], j.t[1] + d[i][1], j.t[2] + d[i][2]];
      var o = qrot(qinv(R[p]), [d[i][0] - d[p][0], d[i][1] - d[p][1], d[i][2] - d[p][2]]);
      return [j.t[0] + o[0], j.t[1] + o[1], j.t[2] + o[2]];
    });
    return { d:d, t:t };
  }

  /* ---- peoples (data/peoples.json): the range a culture's strangers are drawn from ----
     people { id, name, ancestry:{ african:[lo,hi], asian:[lo,hi], caucasian:[lo,hi] }, skin:[stops], hair:[colours],
              grey: age above which hair greys, beard: odds (male), morph: { <id>:[lo,hi] }, styles: { male:[ids], female:[ids] } }
     skin is drawn along its stops (sRGB hex, light to dark), hair from its list; every slider not named in morph is
     drawn from -spread..spread (age from its own default range) */
  function hex(c){ return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function tohex(v){ return '#' + v.map(function(x){ x = Math.max(0, Math.min(255, Math.round(x))); return (x < 16 ? '0' : '') + x.toString(16); }).join(''); }
  function along(stops, u){
    if(stops.length === 1) return stops[0];
    var f = u * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(f)), k = f - i, a = hex(stops[i]), b = hex(stops[i + 1]);
    return tohex([0, 1, 2].map(function(c){ return a[c] + (b[c] - a[c]) * k; }));
  }
  function mix(a, b, k){ var x = hex(a), y = hex(b); return tohex([0, 1, 2].map(function(c){ return x[c] + (y[c] - x[c]) * k; })); }
  var AGE = [-0.6, 0.9];
  function stranger(seed, kit, people, spread){
    var r = KRAND.stream(seed).next, rec = blank(kit), P = people || {};
    spread = spread === undefined ? 0.45 : spread;
    function pick(list){ return list[Math.floor(r() * list.length)]; }
    function range(lr){ return lr[0] + (lr[1] - lr[0]) * r(); }
    var styles = (P.styles || {})[kit.body.replace(/^mpfb_/, '')];
    MPFB_SLOTS.concat(['beard']).forEach(function(slot){
      var have = kit.items.filter(function(it){ return it.slot === slot; });
      if(slot === 'hair' && styles){ var pref = have.filter(function(it){ return styles.indexOf(it.id) >= 0; }); if(pref.length && r() < 0.75) have = pref; }
      var odds = slot === 'beard' ? (P.beard === undefined ? 0.4 : P.beard) : slot === 'hair' ? 0.92 : 0.9;
      var id = have.length && r() < odds ? pick(have).id : null;
      if(slot === 'hair' || slot === 'beard') rec[slot] = id; else rec.armour[slot] = id;
    });
    rec.morph = {};
    var bias = P.morph || {};
    kit.morph.morphs.forEach(function(s){
      var v = bias[s.id] ? range(bias[s.id]) : s.id === 'age' ? range(AGE) : (r() * 2 - 1) * spread * (s.group === 'Face' ? 1 : 0.8);
      v = Math.round(v * 100) / 100; if(v) rec.morph[s.id] = v;
    });
    var A = P.ancestry || { african:[0, 1], asian:[0, 1], caucasian:[0, 1] };
    rec.ancestry = {};
    RACES.forEach(function(k){ rec.ancestry[k] = Math.round(range(A[k] || [0, 0]) * 100) / 100; });
    rec.skin = along(P.skin || ['#f1d2bd', '#c58c63', '#5a3a26'], r());
    var hair = pick(P.hair || ['#2a1d15', '#5a3a22', '#8a6238', '#c9a35a']);
    var age = rec.morph.age || 0, grey = P.grey === undefined ? 0.45 : P.grey;
    if(age > grey) hair = mix(hair, '#b8b4ae', Math.min(1, (age - grey) / (1 - grey) * (0.6 + 0.6 * r())));
    rec.hair_color = hair;
    rec.people = P.id || null;
    return rec;
  }

  return { pose:pose, parts:parts, hidden:hidden, unbits:unbits, headOf:headOf, takesHair:takesHair, key:key,
           random:random, blank:blank, fk:fk, morphWeights:morphWeights, morphJoints:morphJoints, stranger:stranger,
           along:along };
})();
if(typeof module !== 'undefined') module.exports = KCHAR;
