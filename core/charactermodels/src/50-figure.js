/* ==== KCharFigure: one body's character, drawn from kit pieces on one shared skeleton. [draw] (Godot: kchar_figure.gd) ====
   new KCharFigure(body, sliders, load)
     body     { skeleton, kit } (data/<body>/skeleton.json, kit.json)
     sliders  data/sliders.json
     load     key -> Promise of a GLTFLoader result (key: a GLB's path under pieces/, no .glb), e.g. 'male/head_styv';
              load.raw(key) -> Promise of an ArrayBuffer (a MakeHuman piece's morph deltas: key + '.morph')
   fig.group             add to a scene; feet at its origin, facing +z
   fig.apply(record)     -> Promise: loads what the record needs (KCHAR.parts), shows it, leaves out the base triangles the
                         armour covers (KCHAR.hidden), poses the skeleton (KCHAR.pose) and dyes the armour and hair
   fig.play(name)        a clip from the body's anims.glb, or null for the bind (A) pose
   fig.update(dt)        once a frame
   fig.hold({R, L, both}) props in the hands (ids from data/props.json, which the page puts in KCharFigure.props), or
                         null; both: the left hand also holds the right's prop at its support (a clip's two_hands)
   fig.headWorld(v3)     the head joint's world position
   The bones are built from skeleton.json, so every piece binds to the same objects. Each piece keeps its own Skeleton
   (same bones, its own inverse binds): a slider's skin scale goes in as boneInverses[i] = S(s[i]) * IBM[i], scaling
   only that joint's own vertices, in its own frame, without passing down the hierarchy.
   A MakeHuman body (kit.style 'mpfb') has no such sliders: it morphs. Each piece's deltas (KMR1, tools/make_mpfb.py)
   are blended on the CPU by KCHAR.morphWeights; its normals are re-summed over the source mesh's vertices (so UV
   seams stay smooth); each joint's rest moves by KCHAR.morphJoints, and its inverse bind by the same amount
   (boneInverses[i] = IBM[i] * T(-d[i])). The feet are kept on the ground from the morphed skin's lowest point.
   Skin tone, hair colour and eye colour multiply into the neutral textures make_mpfb made (kit.tint); the eye colour
   only where the iris mask (the eye texture's alpha) says.
*/
function KCharFigure(body, sliders, load){
  var self = this, skel = body.skeleton, kit = body.kit, J = skel.joints;
  this.kit = kit;
  this.group = new THREE.Group();
  this.inner = new THREE.Group();
  this.group.add(this.inner);
  var bones = J.map(function(j){
    var b = new THREE.Bone(); b.name = j.name;
    b.position.fromArray(j.t); b.quaternion.fromArray(j.r);
    return b;
  });
  J.forEach(function(j, i){ (j.parent >= 0 ? bones[j.parent] : self.inner).add(bones[i]); });
  var byName = {}; bones.forEach(function(b, i){ byName[b.name] = i; });
  this.bones = bones;
  this.hips = bones[byName.Hips];
  this.headBone = bones[byName.Head];
  var gltfs = {}, live = {};        // key -> GLTF; 'key|mesh' -> SkinnedMesh
  this.live = live;
  this.mixer = new THREE.AnimationMixer(this.inner);
  this.clips = {};
  this.action = null;
  this.pose = KCHAR.pose(skel, sliders, {});
  var ready = load((kit.anims || kit.body) + '/anims').then(function(g){ g.animations.forEach(function(c){
    // the hips' position track comes out of the clip and update() applies it (hipsTrack)
    var k = c.tracks.findIndex(function(t){ return t.name === 'Hips.position'; });
    if(k >= 0){ c.hipsTrack = c.tracks[k]; c.tracks.splice(k, 1); }
    self.clips[c.name] = c; }); });
  // a giant (kit.scale, tools/giant.py) is the man's body made big: his clips play slower by the square root of the
  // scale (a pendulum's pace: a stride takes as long as a leg twice as long swings), so he walks like something heavy
  var SCALE = kit.scale || 1, CADENCE = 1 / Math.sqrt(SCALE);
  this.scale = SCALE; this.cadence = CADENCE;

  function need(k){
    if(!gltfs[k]) gltfs[k] = load(k);
    return gltfs[k];
  }

  /* the live meshes of a part: one per skinned mesh in its GLB when part.mesh is '*' (a MakeHuman piece: skin,
     brows, lashes, nails are separate meshes), else the one named part.mesh */
  function meshes(part, g){
    var src = [];
    g.scene.traverse(function(m){ if(m.isSkinnedMesh && (part.mesh === '*' || m.name === part.mesh)) src.push(m); });
    return src.map(function(s, n){
      var id = part.key + '|' + part.mesh + (part.mesh === '*' ? n : '');
      if(live[id]) return live[id];
      var cl = clothOf(part), extra = cl ? cl.bones : [];
      var ibm = J.map(function(){ return new THREE.Matrix4(); }).concat(extra.map(function(){ return new THREE.Matrix4(); }));
      // three's loader turns 'mixamorig:Hips' into 'mixamorigHips' (MakeHuman's Mixamo rig); skeleton.json says 'Hips'
      // the piece's joints by name onto skeleton.json's order; one the skeleton lacks (an exporter's 'neutral_bone' for
      // unweighted vertices) follows the head; a garment's cloth joints ('cloth:<item>:<chain>:<bone>', the loader
      // drops the colons) are its chain bones, after the skeleton's
      var remap = s.skeleton.bones.map(function(b, k){
        var i = byName[b.name.replace(/^mixamorig:?/, '')];
        if(i === undefined && cl){ var q = cl.byName[clothKey(b.name)]; if(q !== undefined) i = J.length + q; }
        if(i !== undefined) ibm[i].copy(s.skeleton.boneInverses[k]);
        return i === undefined ? -1 : i;
      });
      var geo = s.geometry;
      if(part.role === 'base' || kit.style === 'mpfb') geo = geo.clone();   // filtered or morphed per record
      if(remap.some(function(i, k){ return i !== k; })){
        if(geo === s.geometry) geo = geo.clone();
        var head = byName.Head, si = geo.attributes.skinIndex, arr = new Uint16Array(si.array.length);
        for(var q=0;q<arr.length;q++){ var r = remap[si.array[q]]; arr[q] = r === undefined || r < 0 ? head : r; }
        geo.setAttribute('skinIndex', new THREE.BufferAttribute(arr, 4));
      }
      var m = new THREE.SkinnedMesh(geo, s.material.clone());
      if(m.material.alphaTest > 0) m.material.onBeforeCompile = opaqueCutout;
      if(kit.tint && kit.tint.roles[s.material.name] === 'eye') irisTint(m.material);
      m.name = id; m.frustumCulled = false; m.castShadow = true;
      m.userData = { part:part, ibm:ibm, index0:geo.index ? geo.index.array.slice() : null, srcMaterial:s.material.name };
      m.bind(new THREE.Skeleton(bones.concat(extra), ibm.map(function(x){ return x.clone(); })), new THREE.Matrix4());
      if(cl) cl.meshes.push(m);
      if(part.role === 'armour' && (part.slot === 'torso' || part.slot === 'legs')){
        var it0 = itemByKey[part.key] || {};
        m.userData.pad = pushOut(m.material, it0.loose && part.slot === 'torso' ? PAD_TOP : 0, !!it0.loose, part.slot === 'legs');
      } else if(part.role === 'armour' && part.slot === 'feet') pushOut(m.material, 0, false, false, true);   // boots: the squeeze only
      self.inner.add(m);
      live[id] = m;
      return m;
    });
  }

  /* a cut-out (hair cards, brows, lashes) keeps the fragments that pass its alpha test fully opaque: left as is, their
     texture alpha reaches the page's transparent canvas and the background shows through the hair */
  function opaqueCutout(sh){
    sh.fragmentShader = sh.fragmentShader.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n\tdiffuseColor.a = 1.0;');
  }

  /* the eyes: make_mpfb.py greys the irises and puts their mask in the texture's alpha; the eye colour multiplies in
     by that mask, so the whites stay white */
  function irisTint(mat){
    var u = mat.userData.eyeTint = { value:new THREE.Color(1, 1, 1) };
    mat.onBeforeCompile = function(sh){
      sh.uniforms.eyeTint = u;
      sh.fragmentShader = 'uniform vec3 eyeTint;\n' + sh.fragmentShader.replace('#include <map_fragment>',
        '#ifdef USE_MAP\n\tvec4 texelColor = mapTexelToLinear( texture2D( map, vUv ) );\n' +
        '\tdiffuseColor.rgb *= texelColor.rgb * mix( vec3( 1.0 ), eyeTint, texelColor.a );\n#endif');
    };
  }

  var S = new THREE.Matrix4(), T = new THREE.Matrix4();
  function skinScale(m, pose, d){
    var inv = m.skeleton.boneInverses, ibm = m.userData.ibm;
    for(var i=0;i<J.length;i++){
      var s = pose.s[i]; inv[i].copy(S.makeScale(s[0], s[1], s[2]).multiply(ibm[i]));
      if(d) inv[i].multiply(T.makeTranslation(-d[i][0], -d[i][1], -d[i][2]));
    }
  }

  /* ---- morphs ---- */
  var morphs = {};                  // key -> Promise of the parsed KMR1 entries
  function parseMorph(buf){
    var dv = new DataView(buf), o = 4, out = [], n = dv.getUint16(o, true); o += 2;
    for(var e=0;e<n;e++){
      var nl = dv.getUint16(o, true); o += 2;
      var mats = new TextDecoder().decode(new Uint8Array(buf, o, nl)).split('\n'); o += nl;
      var nu = dv.getUint32(o, true); o += 4;
      var used = new Uint32Array(buf.slice(o, o + 4 * nu)); o += 4 * nu;
      var nt = dv.getUint16(o, true), targets = []; o += 2;
      for(var k=0;k<nt;k++){
        var t = dv.getUint16(o, true), c = dv.getUint32(o + 2, true); o += 6;
        var idx = null;
        if(c & 0x80000000) c = nu;
        else { idx = new Uint32Array(buf.slice(o, o + 4 * c)); o += 4 * c; }
        targets.push({ t:t, idx:idx || used, d:new Int16Array(buf.slice(o, o + 6 * c)) }); o += 6 * c;
      }
      out.push({ mats:mats, used:used, targets:targets });
    }
    return out;
  }
  /* per live mesh: its rest positions and normals, its source vertex per vertex, and per target the vertices that
     move (a source vertex split at a UV seam is several) and by how much */
  function morphSetup(m, entries){
    var g = m.geometry, vid = g.attributes._vidx || g.attributes._VIDX;
    var e = vid && entries.filter(function(x){ return x.mats.indexOf(m.userData.srcMaterial) >= 0; })[0];
    if(!e) return null;
    var n = g.attributes.position.count, src = new Int32Array(n), max = 0;
    for(var i=0;i<n;i++){ src[i] = Math.round(vid.getX(i)); if(src[i] > max) max = src[i]; }
    var cnt = new Int32Array(max + 2);
    for(i=0;i<n;i++) cnt[src[i] + 1]++;
    for(i=0;i<=max;i++) cnt[i + 1] += cnt[i];
    var fill = cnt.slice(), list = new Int32Array(n);
    for(i=0;i<n;i++) list[fill[src[i]]++] = i;
    var targets = e.targets.map(function(tg){
      var vs = [], ds = [];
      for(var k=0;k<tg.idx.length;k++){
        var v = tg.idx[k]; if(v > max) continue;
        for(var j=cnt[v];j<cnt[v + 1];j++){ vs.push(list[j]); ds.push(tg.d[3*k] * 1e-4, tg.d[3*k+1] * 1e-4, tg.d[3*k+2] * 1e-4); }
      }
      return { t:tg.t, v:new Int32Array(vs), d:new Float32Array(ds) };
    });
    return { pos0:g.attributes.position.array.slice(), nrm0:g.attributes.normal ? g.attributes.normal.array.slice() : null,
             src:src, nsrc:max + 1, targets:targets, key:'' };
  }
  function morphMesh(m, w, wkey){
    var M = m.userData.morph; if(!M || M.key === wkey) return;
    M.key = wkey;
    var g = m.geometry, P = g.attributes.position.array, any = false;
    P.set(M.pos0);
    M.targets.forEach(function(tg){
      var x = w[tg.t]; if(!x) return; any = true;
      var v = tg.v, d = tg.d;
      for(var k=0;k<v.length;k++){ var i = 3 * v[k]; P[i] += x * d[3*k]; P[i+1] += x * d[3*k+1]; P[i+2] += x * d[3*k+2]; }
    });
    g.attributes.position.needsUpdate = true;
    if(M.nrm0){
      var N = g.attributes.normal.array;
      if(!any) N.set(M.nrm0);
      else {
        // face normals summed per source vertex, so the halves of a UV seam agree
        var acc = new Float32Array(3 * M.nsrc), ix = g.index ? g.index.array : null, nt = ix ? ix.length : P.length / 3;
        var ax, ay, az, bx, by, bz;
        for(var t=0;t<nt;t+=3){
          var a = ix ? ix[t] : t, b = ix ? ix[t+1] : t + 1, c = ix ? ix[t+2] : t + 2;
          ax = P[3*b] - P[3*a]; ay = P[3*b+1] - P[3*a+1]; az = P[3*b+2] - P[3*a+2];
          bx = P[3*c] - P[3*a]; by = P[3*c+1] - P[3*a+1]; bz = P[3*c+2] - P[3*a+2];
          var nx = ay*bz - az*by, ny = az*bx - ax*bz, nz = ax*by - ay*bx;
          [a, b, c].forEach(function(q){ var s3 = 3 * M.src[q]; acc[s3] += nx; acc[s3+1] += ny; acc[s3+2] += nz; });
        }
        for(var i=0;i<N.length/3;i++){
          var s3 = 3 * M.src[i], x = acc[s3], y = acc[s3+1], z = acc[s3+2], l = Math.sqrt(x*x + y*y + z*z) || 1;
          N[3*i] = x / l; N[3*i+1] = y / l; N[3*i+2] = z / l;
        }
      }
      g.attributes.normal.needsUpdate = true;
    }
    g.computeBoundingSphere();
  }
  function lowest(m){
    var P = m.geometry.attributes.position.array, y = Infinity;
    for(var i=1;i<P.length;i+=3) if(P[i] < y) y = P[i];
    return y;
  }
  var tint = new THREE.Color(), DEFAULT_SKIN = '#d6ad8f', DEFAULT_HAIR = '#4a3424', DEFAULT_EYE = '#5a3a22';
  function tintOf(hexc, gain){ return tint.set(hexc).convertSRGBToLinear().multiplyScalar(gain); }

  /* leave out the triangles of a base region that `hide` (0/1 per triangle) marks */
  function filterBase(m, hide){
    var i0 = m.userData.index0; if(!i0 || !hide) return;
    var keep = [], n = i0.length / 3;
    for(var t=0;t<n;t++) if(!hide[t]) keep.push(i0[3*t], i0[3*t+1], i0[3*t+2]);
    m.geometry.setIndex(keep);
  }

  var token = 0;
  this.apply = function(rec){
    var my = ++token, parts = KCHAR.parts(rec, kit), mpfb = kit.style === 'mpfb' && kit.morph && kit.morph.targets;
    function needMorph(k){
      if(!mpfb || !load.raw) return Promise.resolve(null);
      if(!morphs[k]) morphs[k] = load.raw(k + '.morph').then(parseMorph, function(){ return null; });
      return morphs[k];
    }
    return Promise.all([ready].concat(parts.map(function(p){ return need(p.key); }), parts.map(function(p){ return needMorph(p.key); }))).then(function(){
      if(my !== token) return;              // a newer record came while this one loaded
      self.record = rec;
      var want = {};
      return Promise.all(parts.map(function(p){ return Promise.all([need(p.key), needMorph(p.key)]).then(function(r){
          meshes(p, r[0]).forEach(function(m){
            want[m.name] = m;
            if(r[1] && m.userData.morph === undefined) m.userData.morph = morphSetup(m, r[1]);
          });
        }); }))
        .then(function(){
          Object.keys(live).forEach(function(k){ live[k].visible = !!want[k]; });
          // a mod that grants a second pair of arms (tools/mods.py) brings their skin as a piece; the joints are there
          // on every body, and arms2() drives them only when it is worn
          self.fourArms = kit.style === 'mpfb' && KCHAR.arms(rec, kit) >= 4;
          var hide = KCHAR.hidden(rec, kit), head = KCHAR.headOf(rec, kit);
          var top = rec.armour && rec.armour.torso && kit.items && kit.items.filter(function(it){ return it.id === rec.armour.torso; })[0];
          pushU.kcT.value = top && top.tucks ? TUCK : 0;
          // trousers (legs, not loose) under a loose top: the top's push clears them too (PAD_OVER more)
          var legs = rec.armour && rec.armour.legs && kit.items && kit.items.filter(function(it){ return it.id === rec.armour.legs; })[0];
          // and under a loose top that reaches below the knees (kit item long: a robe, the kimono) they are drawn in to
          // the legs, so wide ones (harem pants) stay under it
          pushU.kcS.value = top && top.loose && top.long && legs && !legs.loose ? SQUEEZE : 0;
          // and boots under one, whatever the legs wear: their cuffs came through a kimono's hem at the shins
          pushU.kcSF.value = top && top.loose && top.long ? SQUEEZE_FEET : 0;
          Object.keys(want).forEach(function(k){ var u = want[k].userData.pad; if(u && u.base) u.value = u.base + (legs && !legs.loose ? PAD_OVER : 0); });
          var p = self.pose = KCHAR.pose(skel, sliders, kit.style === 'mpfb' ? {} : rec.sliders, head && head.face), mj = null;
          if(mpfb){
            var w = KCHAR.morphWeights(rec, kit), wkey = Array.prototype.join.call(w, ',');
            mj = KCHAR.morphJoints(skel, kit, w);
            p.t = mj.t;
            Object.keys(want).forEach(function(k){ morphMesh(want[k], w, wkey); });
            var base = Object.keys(want).filter(function(k){ return want[k].userData.part.role === 'base' && want[k].userData.srcMaterial === kit.base_material; })[0];
            if(base){
              var m0 = want[base].userData.morph;
              if(m0 && m0.low0 === undefined){ var P = m0.pos0, y = Infinity; for(var i=1;i<P.length;i+=3) if(P[i] < y) y = P[i]; m0.low0 = y; }
              p.ground = m0 ? m0.low0 - lowest(want[base]) : 0;
              var PP = want[base].geometry.attributes.position.array, top = -Infinity;
              for(var q=1;q<PP.length;q+=3) if(PP[q] > top) top = PP[q];
              p.stature = top - lowest(want[base]);
            }
          }
          self.morphDelta = mj ? mj.d : null;
          bones.forEach(function(b, i){ if(b !== self.hips) b.position.fromArray(p.t[i]); });
          self.inner.scale.setScalar(p.root * SCALE);
          self.inner.position.y = (p.ground || 0) * SCALE;
          if(p.stature) p.stature *= SCALE;
          var roles = (kit.tint && kit.tint.roles) || {}, gain = (kit.tint && kit.tint.gain) || {};
          Object.keys(want).forEach(function(k){
            var m = want[k], part = m.userData.part;
            skinScale(m, p, mj && mj.d);
            var role = roles[m.userData.srcMaterial];
            if(part.role === 'base'){
              // a MakeHuman base: only its skin primitive is masked; brows, lashes and nails stay
              if(kit.style !== 'mpfb') filterBase(m, hide[part.slot]);
              else if(m.userData.srcMaterial === kit.base_material) filterBase(m, hide.base);
            }
            if(role === 'skin') m.material.color.copy(tintOf(rec.skin || DEFAULT_SKIN, gain.skin));
            else if(role === 'hair') m.material.color.copy(tintOf(rec.hair_color || DEFAULT_HAIR, gain.hair));
            else if(role === 'eye'){ m.material.color.set('#ffffff'); if(m.material.userData.eyeTint) m.material.userData.eyeTint.value.copy(tintOf(rec.eye_color || DEFAULT_EYE, gain.eye || 1)); }
            else {
              var dye = rec.dye && (part.role === 'armour' ? rec.dye[part.slot] : (part.role === 'hair' || part.role === 'beard') ? rec.dye.hair : null);
              m.material.color.set(dye || '#ffffff');
            }
          });
          clothRest(want, mpfb ? KCHAR.morphWeights(rec, kit) : null);
          if(!self.action) self.restPose();
        });
    });
  };

  this.restPose = function(){
    bones.forEach(function(b, i){ b.quaternion.fromArray(J[i].r); });
    self.hips.position.fromArray(self.pose.t[byName.Hips]);
    self.hips.position.y += self.pose.lift;
    afterClip();
  };

  /* ---- holding props (data/props.json, tools/make_props.py) ----
     hold({ R:'sword', L:'shield' }) (and the lower hands of a four-armed body, R2 and L2): each prop's GLB goes under its hand bone at the grip frame skeleton.json 'hands'
     gives (the props are modelled in it), and that hand's fingers close round it in the prop's grip style (fist,
     trigger, wide): their local rotation becomes the rest one times the curl, every frame after the clip (a clip's own
     finger motion gives way to the grip). With both, the left hand takes hold of the right's prop too (twoHands); a
     prop with a string (the bow) gets it drawn live, and an arrow while the right hand draws it (bowString) */
  var held = { R:null, L:null, R2:null, L2:null, both:false }, holders = {}, propCache = {}, curlQ = new THREE.Quaternion();
  // every hand the skeleton has a grip for: R and L, and a giant's lower pair R2 and L2 (hidden with its arms)
  var HANDS = ['R', 'L', 'R2', 'L2'].filter(function(sd){ return skel.hands && skel.hands[sd]; });
  function prop(id){ return (id && KCharFigure.props[id]) || {}; }
  function holder(side){
    if(!holders[side]){
      var h = skel.hands[side], g = new THREE.Group();
      g.position.fromArray(h.grip.slice(0, 3)); g.quaternion.fromArray(h.grip.slice(3, 7));
      bones[h.bone].add(g);
      holders[side] = g;
    }
    return holders[side];
  }
  function propScene(id){
    if(!propCache[id]) propCache[id] = load('props/' + id).then(function(gl){ return gl.scene; });
    return propCache[id];
  }
  this.hold = function(want){
    if(!skel.hands) return Promise.resolve();
    held.both = !!(want && want.both);
    return Promise.all(HANDS.map(function(side){
      var id = (want && want[side]) || null;
      if(held[side] === id) return null;
      held[side] = id;
      var g = holder(side);
      while(g.children.length) g.remove(g.children[0]);
      if(side === 'L') bow = null;
      if(!id) return null;
      return propScene(id).then(function(scene){
        if(held[side] !== id) return;
        var m = scene.clone(true);
        m.traverse(function(o){ if(o.isMesh){ o.castShadow = true; o.frustumCulled = false; } });
        g.add(m);
        var p = prop(id);
        // in a lower hand (the forearm held forward in its guard) a prop with low_turn turns about its handle: the
        // shield stands up and faces outward instead of lying flat like a tray
        if(side.length > 1 && p.low_turn) m.rotation.y = (side.charAt(0) === 'L' ? 1 : -1) * p.low_turn * Math.PI / 180;
        if(side === 'L' && p.string) return makeBow(g, p);
      });
    }));
  };
  this.held = held;
  function grip(){
    if(!skel.hands) return;
    HANDS.forEach(function(side){
      var id = held[side] || (side === 'L' && held.both && support() ? held.R : null);
      if(side.length > 1 && holders[side]) holders[side].visible = !!self.fourArms;
      if(!id) return;
      var h = skel.hands[side], style = held[side] ? prop(id).grip : 'fist';
      var curl = h.curls ? h.curls[style] || h.curls.fist : h.curl;
      curl.forEach(function(c){
        bones[c[0]].quaternion.fromArray(J[c[0]].r).multiply(curlQ.set(c[1], c[2], c[3], c[4]));
      });
    });
  }

  /* twoHands: the left hand onto the right's prop. Its support is a segment of the handle (in the prop's frame); the
     hand's grip frame goes to the point of it nearest where the clip has the hand (kept a hand's width from the right
     one), its handle axis along the segment, thumb the way the clip has it, and turned round the segment so the
     fingers point away from the shoulder. The arm reaches it with a two-bone solve (upper arm and forearm; the elbow
     stays on the side the clip bends it), and the hand turns to the grip */
  var V = function(){ return new THREE.Vector3(); }, Q = function(){ return new THREE.Quaternion(); };
  var tA = V(), tB = V(), tO = V(), tP = V(), tX = V(), tY = V(), tZ = V(), tS = V(), tE = V(), tW = V(), tT = V(),
      tU = V(), tV = V(), tK = V(), tM = new THREE.Matrix4(), tM2 = new THREE.Matrix4(), tGL = null,
      qA = Q(), qB = Q(), qC = Q(), qD = Q(), GAP = 0.1;
  this.reach = 0;
  function support(){ var s = held.R && prop(held.R).support; return held.both && s && holders.R ? s : null; }
  function turnWorld(b, q){            // turn bone b by world rotation q about its own origin
    b.parent.getWorldQuaternion(qB);
    qC.copy(qB).invert().multiply(q).multiply(qB);
    b.quaternion.premultiply(qC);
    b.updateMatrixWorld(true);
  }
  var saved = [Q(), Q(), Q(), Q(), Q(), Q()], hold2 = 1, tD = V(), tR = V(), qR = Q(), MOVE = 0.45;
  function twoHands(dt){
    var sp = support();
    if(!sp){ hold2 = 1; return; }
    var h = skel.hands.L, arm = h.arm || [byName.LeftArm, byName.LeftForeArm, byName.LeftHand];
    var up = bones[arm[0]], fore = bones[arm[1]], hand = bones[arm[2]];
    self.group.updateMatrixWorld(true);
    if(!tGL) tGL = new THREE.Matrix4().compose(V().fromArray(h.grip), Q().fromArray(h.grip.slice(3, 7)), V().set(1, 1, 1));
    var R = holders.R.matrixWorld;
    tA.fromArray(sp, 0).applyMatrix4(R); tB.fromArray(sp, 3).applyMatrix4(R);
    tO.setFromMatrixPosition(R);
    // where the clip has the left hand's grip, and the segment's point nearest it
    tM.multiplyMatrices(hand.matrixWorld, tGL);
    tP.setFromMatrixPosition(tM);
    up.getWorldPosition(tS); fore.getWorldPosition(tE); hand.getWorldPosition(tT);
    // the distances below are a man's, in metres: u scales them to this figure (a giant's are twice as long)
    var u = self.group.getWorldScale(cS).x * SCALE;
    var l1 = tE.distanceTo(tS), l2 = tT.distanceTo(tE), far = l1 + l2 + 0.05 * u;
    for(var k = 0; k < 3; k++) saved[k].copy(bones[arm[k]].quaternion);
    tY.subVectors(tB, tA);
    var L = tY.length(), t = 0;
    if(L < 1e-4) tY.setFromMatrixColumn(R, 1).normalize();
    else {
      tY.divideScalar(L);
      t = THREE.MathUtils.clamp(tT.subVectors(tP, tA).dot(tY), 0, L);
      // but within the arm's reach when some of the segment is: the stretch of it round the shoulder's nearest point
      var ts = tT.subVectors(tS, tA).dot(tY), off = tT.addScaledVector(tY, -ts).length();
      if(off < far){ var hw = Math.sqrt(far * far - off * off); t = THREE.MathUtils.clamp(t, ts - hw, ts + hw); }
      var o = tT.subVectors(tO, tA).dot(tY);                  // the right hand's place on it
      var gap = GAP * u;
      if(Math.abs(t - o) < gap) t = (t >= o ? o + gap <= L : o - gap < 0) ? o + gap : o - gap;
      t = THREE.MathUtils.clamp(t, 0, L);
    }
    tP.copy(tA).addScaledVector(tY, t);
    // the frame: Y along the handle (the clip's thumb side), Z (the fingers) away from the shoulder, X = Y x Z
    tX.setFromMatrixColumn(tM, 1);
    if(tX.dot(tY) < 0) tY.negate();
    tZ.subVectors(tP, tS).addScaledVector(tX.setFromMatrixColumn(tM, 2).normalize(), 0.3 * u);
    tZ.addScaledVector(tY, -tZ.dot(tY));
    if(tZ.lengthSq() < 1e-8) tZ.setFromMatrixColumn(R, 2);
    tZ.normalize();
    tX.crossVectors(tY, tZ);
    tM2.makeBasis(tX, tY, tZ).setPosition(tP);
    tM.copy(tGL).invert();
    tM2.multiply(tM);                                         // the hand bone's world frame there
    tW.setFromMatrixPosition(tM2);
    qA.setFromRotationMatrix(tM2);
    // too far for the left arm: the right brings the prop toward the left shoulder by the shortfall (up to MOVE),
    // keeping its turn, and both arms reach
    var dW = tW.distanceTo(tS), lim = l1 + l2 - 0.01 * u, rArm = skel.hands.R.arm;
    if(rArm) for(k = 0; k < 3; k++) saved[3 + k].copy(bones[rArm[k]].quaternion);
    if(dW > lim && rArm){
      tD.subVectors(tS, tW).normalize().multiplyScalar(Math.min(dW - lim, MOVE * u));
      var rh = bones[rArm[2]];
      reachArm(bones[rArm[0]], bones[rArm[1]], rh, rh.getWorldPosition(tR).add(tD), rh.getWorldQuaternion(qR));
      tW.add(tD);
    }
    reachArm(up, fore, hand, tW, qA);
    self.reach = hand.getWorldPosition(tT).distanceTo(tW);   // how far short the hand fell (0: it holds on)
    // a clip that keeps the hands too far apart for both to hold: the arms go back to the clip's pose (eased, so
    // they do not snap) rather than reach out stiff toward the handle
    var want2 = THREE.MathUtils.clamp((0.16 * u - self.reach) / (0.1 * u), 0, 1);
    hold2 = dt === undefined ? want2 : hold2 + THREE.MathUtils.clamp(want2 - hold2, -dt * 4, dt * 4);
    if(hold2 < 1){
      var all = rArm ? arm.concat(rArm) : arm;
      for(k = 0; k < all.length; k++) bones[all[k]].quaternion.copy(saved[k].slerp(bones[all[k]].quaternion, hold2));
      self.bones[0].updateMatrixWorld(true);
    }
  }
  // the two-bone solve: open or close the elbow to the distance, swing the upper arm onto the target with the elbow
  // turned back to the side it was on, and turn the hand to q (world)
  var sS = V(), sE = V(), sT = V(), sU = V(), sV = V(), sK = V(), sPole = V(), sQ = Q();
  function reachArm(up, fore, hand, w, q){
    up.getWorldPosition(sS); fore.getWorldPosition(sE); hand.getWorldPosition(sT);
    var l1 = sE.distanceTo(sS), l2 = sT.distanceTo(sE);
    var d = THREE.MathUtils.clamp(w.distanceTo(sS), Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
    sU.subVectors(sS, sE); sV.subVectors(sT, sE);
    var cur = sU.angleTo(sV), want = Math.acos(THREE.MathUtils.clamp((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));
    sK.crossVectors(sU, sV);
    if(sK.lengthSq() < 1e-10) sK.set(0, 0, 1).cross(sU);
    turnWorld(fore, qD.setFromAxisAngle(sK.normalize(), want - cur));
    sPole.copy(sE);
    hand.getWorldPosition(sT);
    turnWorld(up, qD.setFromUnitVectors(sU.subVectors(sT, sS).normalize(), sV.subVectors(w, sS).normalize()));
    fore.getWorldPosition(sE);
    sK.copy(sV);                                              // shoulder -> target
    sU.subVectors(sE, sS); sU.addScaledVector(sK, -sK.dot(sU));
    sPole.sub(sS); sPole.addScaledVector(sK, -sK.dot(sPole));
    if(sU.lengthSq() > 1e-8 && sPole.lengthSq() > 1e-8){
      var a = sU.angleTo(sPole);
      if(sT.crossVectors(sU, sPole).dot(sK) < 0) a = -a;
      turnWorld(up, qD.setFromAxisAngle(sK, a));
    }
    hand.parent.getWorldQuaternion(sQ);
    hand.quaternion.copy(sQ.invert().multiply(q));
    hand.updateMatrixWorld(true);
  }

  /* ---- cloth: a garment's hanging parts as bone chains (kit item cloth, make_mpfb.py cloth_bones) ----
     Each chain hangs from a spine joint; its points are vertices of the garment, so their rest follows the morph
     (clothRest reads them off the morphed mesh). Every frame (clothStep) each point is a Verlet particle: the rigid
     rest it would have riding its joint pulls it by the part's stiffness; gravity (Krator's 7.4 m/s2), the dense
     lowland air's drag and, for a loop that walks or runs in place, the wind of its root_speed act on it; it keeps its
     length to the point above, keeps near its neighbours round a skirt, and stays out of the body's capsules
     (skeleton.json colliders, KCHAR.colliders) and above the floor. Each bone then turns to point at the next
     particle. fig.cloth = false: no swing; each frame the chains start from their rigid rest and only the collisions
     move them, so a stride still cannot open a skirt (with no clip playing they hang rigid) */
  this.cloth = true;
  this.clothState = function(){ return { items:clothItems, caps:caps }; };      // verify.py, the labs
  var GRAV = 7.4, DRAG = 1.6, DAMP = 0.04, STEP = 1 / 60, PAD = 0.022;
  var clothItems = {}, itemByKey = {}, caps = [], groundY = 0, clothAcc = 0;
  (kit.items || []).forEach(function(it){ itemByKey[KCHAR.key(it.glb)] = it; });
  // a joint's name as three's loader leaves it (PropertyBinding.sanitizeNodeName: no [ ] . : /, spaces to _)
  function clothKey(n){ return n.replace(/\s/g, '_').replace(/[\[\]\.:\/]/g, ''); }
  var SLOT_RANK = { legs:0, torso:1, head:2 };
  function clothOf(part){
    var it = itemByKey[part.key];
    if(!it || !it.cloth) return null;
    if(clothItems[part.key]) return clothItems[part.key];
    var c = { item:it, bones:[], byName:{}, meshes:[], chains:[], parts:it.cloth.parts, reset:true };
    it.cloth.chains.forEach(function(ch, g){
      var list = [];
      for(var k = 0; k < ch.pts.length - 1; k++){
        var b = new THREE.Bone(); b.name = 'cloth:' + it.id + ':' + g + ':' + k;
        (k === 0 ? bones[byName[ch.parent]] : list[k - 1]).add(b);
        c.byName[clothKey(b.name)] = c.bones.length;
        c.bones.push(b); list.push(b);
      }
      c.chains.push({ parent:byName[ch.parent], pts:ch.pts, bw:ch.bw || null, bones:list, p:[], r:[], rest:[], len:[], x:[], xp:[],
                      tw:[], q0:new THREE.Quaternion(), stiff:0.1 });
    });
    // a layer within its slot's: whatever hangs from the legs lies under whatever hangs from the torso, which lies under
    // the head's (a breechcloth under a shirt's skirt: both were layer 1, so neither stayed outside the other)
    var rank = 3 * (SLOT_RANK[it.slot] || 0);
    c.parts.forEach(function(pt){ pt.chains.forEach(function(g){ c.chains[g].stiff = pt.stiff; c.chains[g].layer = rank + (pt.layer || 0); }); });
    clothItems[part.key] = c;
    return c;
  }
  var cM = new THREE.Matrix4(), cM2 = new THREE.Matrix4(), cV = new THREE.Vector3(), cV2 = new THREE.Vector3(), cV3 = new THREE.Vector3(),
      cQ = new THREE.Quaternion(), cQ2 = new THREE.Quaternion(), cQ3 = new THREE.Quaternion(), cS = new THREE.Vector3();
  // the chains' rest from the morphed garment: each point at its vertex, each bone's inverse bind T(-p)
  function clothRest(want, w){
    caps = w ? KCHAR.colliders(skel, w) : [];
    Object.keys(clothItems).forEach(function(key){
      var c = clothItems[key], m = c.meshes.filter(function(x){ return want[x.name]; })[0];
      c.on = !!m;
      if(!m) return;
      var P = m.geometry.attributes.position.array, base = J.length;
      c.chains.forEach(function(ch){
        ch.p = ch.pts.map(function(i){ return new THREE.Vector3(P[3*i], P[3*i+1], P[3*i+2]); });
        ch.bones.forEach(function(b, k){
          var bi = c.bones.indexOf(b);
          c.meshes.forEach(function(mm){ mm.skeleton.boneInverses[base + bi].makeTranslation(-ch.p[k].x, -ch.p[k].y, -ch.p[k].z); });
        });
      });
      posedRests(c, m);
      c.posed = null;
      placeChains(c, !!self.action);         // and the ring's rest distances (neighbours round each part)
    });
  }
  // a capsule's ends in the world: its joints, or (the seat's) rest points riding them
  var cM4 = new THREE.Matrix4();
  function capEnds(cp, A, B){
    var bm = cp.pa && baseMesh();
    if(!bm){ bones[cp.a].getWorldPosition(A); bones[cp.b].getWorldPosition(B); return; }
    A.fromArray(cp.pa).applyMatrix4(cM4.multiplyMatrices(bones[cp.a].matrixWorld, bm.skeleton.boneInverses[cp.a]));
    B.fromArray(cp.pb).applyMatrix4(cM4.multiplyMatrices(bones[cp.b].matrixWorld, bm.skeleton.boneInverses[cp.b]));
  }
  function baseMesh(){
    for(var k in live) if(live[k].userData.part && live[k].userData.part.role === 'base') return live[k];
    return null;
  }
  function rigidTargets(c, ch){
    var pb = bones[ch.parent];
    cM.multiplyMatrices(pb.matrixWorld, c.meshes[0].skeleton.boneInverses[ch.parent]);   // model -> world, riding the joint
    for(var k = 0; k < ch.rest.length; k++) (ch.tw[k] = ch.tw[k] || new THREE.Vector3()).copy(ch.rest[k]).applyMatrix4(cM);
    return cM;
  }
  /* the chains' rest in the postured pose (HANDOFF-CLOTHING.md, 1): posture() turns the spine and draws the shoulders
     back after every clip, so a garment's true rest is the postured one. The skeleton is put in its bind pose and
     postured, each chain point is skinned by the garment's own body weights there (kit cloth.chains bw: the weights
     before the chains took the cloth), and carried back rigidly with its chain's parent joint (r). Read in the A-pose,
     a mantle's chains held by the spine stayed where they were while the tunic under it followed the drawn-back
     shoulders, and it tore at the shoulder blades. The inverse binds stay at the A-pose points (p) */
  var prM = new THREE.Matrix4(), prS = new THREE.Matrix4(), prV = new THREE.Vector3();
  function posedRests(c, m){
    if(!c.chains.some(function(ch){ return ch.bw; })){ c.chains.forEach(function(ch){ ch.r = ch.p; }); return; }
    var saved = bones.map(function(b){ return b.quaternion.clone(); });
    bones.forEach(function(b, i){ b.quaternion.fromArray(J[i].r); });
    self.group.updateMatrixWorld(true);
    posture(true);
    self.group.updateMatrixWorld(true);
    var inv = m.skeleton.boneInverses;
    c.chains.forEach(function(ch){
      if(!ch.bw){ ch.r = ch.p; return; }
      prM.multiplyMatrices(bones[ch.parent].matrixWorld, inv[ch.parent]).invert();
      ch.r = ch.p.map(function(p, k){
        var v = new THREE.Vector3(), tot = 0;
        (ch.bw[k] || []).forEach(function(nw){
          var j = byName[nw[0]]; if(j === undefined) return;
          v.addScaledVector(prV.copy(p).applyMatrix4(prS.multiplyMatrices(bones[j].matrixWorld, inv[j])), nw[1]); tot += nw[1];
        });
        return tot > 0 ? v.divideScalar(tot).applyMatrix4(prM) : p.clone();
      });
    });
    bones.forEach(function(b, i){ b.quaternion.copy(saved[i]); });
    self.group.updateMatrixWorld(true);
  }
  // the chains' bones at the postured rest while a clip plays, at the A-pose's otherwise (no posture there)
  function placeChains(c, posed){
    if(c.posed === posed) return;
    c.posed = posed;
    var pinv = c.meshes[0].skeleton.boneInverses;
    c.chains.forEach(function(ch){
      var R = ch.rest = posed ? ch.r : ch.p;
      ch.len = R.slice(1).map(function(q, k){ return q.distanceTo(R[k]); });
      ch.bones.forEach(function(b, k){
        if(k === 0){
          cM.copy(pinv[ch.parent]).multiply(cM2.makeTranslation(R[0].x, R[0].y, R[0].z));
          cM.decompose(b.position, b.quaternion, cS);
          ch.q0.copy(b.quaternion);
        } else { b.position.subVectors(R[k], R[k - 1]); b.quaternion.identity(); }
      });
    });
    c.ring = [];
    c.parts.forEach(function(pt){
      var g = pt.chains, n = g.length;
      for(var a = 0; a < (pt.closed ? n : n - 1); a++){
        var A = c.chains[g[a]], Bc = c.chains[g[(a + 1) % n]], kk = Math.min(A.rest.length, Bc.rest.length);
        for(var k = 1; k < kk; k++) c.ring.push([A, Bc, k, A.rest[k].distanceTo(Bc.rest[k])]);
      }
    });
    c.reset = true;
  }
  function clothStep(dt){
    var items = Object.keys(clothItems).map(function(k){ return clothItems[k]; }).filter(function(c){ return c.on && c.chains.length && c.chains[0].p.length; });
    if(!items.length) return;
    self.group.updateMatrixWorld(true);
    var dyn = self.cloth;
    if(dt === undefined){
      items.forEach(function(c){ c.chains.forEach(function(ch){ ch.bones.forEach(function(b, k){ if(k === 0) b.quaternion.copy(ch.q0); else b.quaternion.identity(); }); }); c.reset = true; });
      return;
    }
    // the body's capsules, in the world, this frame
    // not the arms: an elbow hanging at the waist pushed a single chain of a cape's edge out, and the cloth below it
    // swung away alone as a long spike (the push in the shader keeps every vertex out of the arms instead)
    var sc = self.group.getWorldScale(cS).x, W = caps.filter(function(cp){ return !/Arm/.test(bones[cp.a].name); }).map(function(cp){
      var A = new THREE.Vector3(), B = new THREE.Vector3();
      capEnds(cp, A, B);
      return { a:A, b:B, r:cp.r * sc + PAD };
    });
    groundY = self.group.getWorldPosition(cV3).y + 0.008;
    // the air: still, or the wind of walking in place
    var meta0 = self.action && meta[self.action.getClip().name], wind = new THREE.Vector3();
    if(meta0 && meta0.loop !== false && meta0.root_speed) wind.fromArray(meta0.root_speed).applyQuaternion(self.group.getWorldQuaternion(cQ3)).multiplyScalar(-sc);
    items.forEach(function(c){
      placeChains(c, !!self.action);
      c.chains.forEach(function(ch){
        rigidTargets(c, ch);
        if(c.reset || ch.x.length !== ch.p.length || ch.tw[0].distanceTo(ch.x[0]) > 0.4){
          ch.x = ch.tw.map(function(v){ return v.clone(); }); ch.xp = ch.tw.map(function(v){ return v.clone(); });
        }
      });
      c.reset = false;
    });
    clothAcc = dyn ? Math.min(clothAcc + dt, 4 * STEP) : STEP;
    var h = STEP;
    while(clothAcc >= h){
      clothAcc -= h;
      items.forEach(function(c){
        c.chains.forEach(function(ch){
          var kS = 1 - Math.pow(1 - ch.stiff, h * 60);
          if(!dyn){ ch.x.forEach(function(x, k){ x.copy(ch.tw[k]); ch.xp[k].copy(ch.tw[k]); }); return; }
          ch.x[0].copy(ch.tw[0]); ch.xp[0].copy(ch.tw[0]);
          for(var k = 1; k < ch.x.length; k++){
            var x = ch.x[k], xp = ch.xp[k];
            cV.subVectors(x, xp);                                     // velocity x h
            cV2.copy(wind).multiplyScalar(h).sub(cV).multiplyScalar(DRAG * h);   // drag toward the air's motion
            cV2.y -= GRAV * h * h;
            xp.copy(x);
            x.addScaledVector(cV, 1 - DAMP).add(cV2);
            x.lerp(ch.tw[k], kS);
          }
        });
        for(var it = 0; it < 2; it++){
          c.chains.forEach(function(ch){ for(var k = 1; k < ch.x.length; k++) keepLen(ch, k); });
          c.ring.forEach(function(r){
            var a = r[0].x[r[2]], b = r[1].x[r[2]], d = a.distanceTo(b), lo = r[3] * 0.6, hi = r[3] * 1.2;
            if(d > hi || (d < lo && d > 1e-6)){
              var want = d > hi ? hi : lo, f = (d - want) / d * 0.5;
              cV.subVectors(b, a).multiplyScalar(f); a.add(cV); b.sub(cV);
            }
          });
          c.chains.forEach(function(ch){ collide(ch, W); });
        }
        c.chains.forEach(function(ch){ for(var k = 1; k < ch.x.length; k++) keepLen(ch, k); collide(ch, W); });
        layered(c, items);
      });
    }
    // the bones turn to the particles
    items.forEach(function(c){
      c.chains.forEach(function(ch){
        var M = rigidTargets(c, ch);
        cQ.setFromRotationMatrix(cM2.extractRotation(M));               // the chain's rest rotation in the world
        var prev = bones[ch.parent].getWorldQuaternion(cQ2);
        ch.bones.forEach(function(b, k){
          cV.subVectors(ch.tw[k + 1], ch.tw[k]).normalize();
          cV2.subVectors(ch.x[k + 1], ch.x[k]).normalize();
          var Wq = new THREE.Quaternion().setFromUnitVectors(cV, cV2).multiply(cQ);
          b.quaternion.copy(prev).invert().multiply(Wq);
          prev = Wq;
        });
      });
    });
  }
  // out of the capsules and above the floor (last: a point may stretch its bone a little rather than sink in)
  var hipW = new THREE.Vector3(), cO = new THREE.Vector3(), cAx = new THREE.Vector3();
  function collide(ch, W){
    bones[byName.Hips].getWorldPosition(hipW);
    for(var k = 1; k < ch.x.length; k++){
      var x = ch.x[k], up = ch.x[k - 1];
      W.forEach(function(cp){
        cV.subVectors(cp.b, cp.a);
        var t = THREE.MathUtils.clamp(cV2.subVectors(x, cp.a).dot(cV) / Math.max(1e-9, cV.lengthSq()), 0, 1);
        cAx.copy(cV).normalize();
        cV2.copy(cp.a).addScaledVector(cV, t);
        var d = x.distanceTo(cV2);
        if(d < cp.r && d > 1e-6){
          // across a limb that lies across the cloth's fall (a seated thigh, a raised arm: nearer level than upright),
          // out on the side of the point above, so the chain drapes over it rather than passing under; along an
          // upright limb, out the side away from the body's axis, so cloth never ends up behind a leg in a stride
          cV.subVectors(x, cV2);
          cO.subVectors(up, cV2); cO.addScaledVector(cAx, -cO.dot(cAx));
          var ol = Math.abs(cAx.y) < 0.7 ? cO.length() : 0, cs = 0;
          if(ol > 1e-4){ cO.divideScalar(ol); cs = cV.dot(cO); if(cs < 0) cV.addScaledVector(cO, -2 * cs); }
          if(ol <= 1e-4){
            cO.set(cV2.x - hipW.x, 0, cV2.z - hipW.z);
            if(cO.lengthSq() > 1e-8){ cO.normalize(); cs = cV.dot(cO); if(cs < 0) cV.addScaledVector(cO, -2 * cs); }
          }
          x.copy(cV2).addScaledVector(cV.normalize(), cp.r);
        }
      });
      if(x.y < groundY) x.y = groundY;
    }
  }
  function keepLen(ch, k){
    var a = ch.x[k - 1], x = ch.x[k], L = ch.len[k - 1];
    cV.subVectors(x, a); var d = cV.length();
    if(d > 1e-9) x.copy(a).addScaledVector(cV, L / d);
  }

  /* layered: a cape, a cloak or a mantle (layer 2) lies over a robe's hem or a flap (1), which lies over a skirt (0),
     and a legs item's chains under a torso item's, under a head item's (clothOf: 3 x the slot's rank + the layer):
     a chain point stays outside the lower layers' chains near it, measured out from the body's vertical axis */
  var LGAP = 0.03;
  function layered(c, items){
    var hip = bones[byName.Hips].getWorldPosition(cV3), segs = [];
    items.forEach(function(o){ o.chains.forEach(function(ch){ for(var k = 0; k + 1 < ch.x.length; k++) segs.push([ch.x[k], ch.x[k + 1], ch.layer || 0]); }); });
    c.chains.forEach(function(ch){
      var L = ch.layer || 0;
      if(!L) return;
      for(var k = 1; k < ch.x.length; k++){
        var x = ch.x[k], best = null, bd = 0.14;
        segs.forEach(function(sg){
          if(sg[2] >= L) return;
          cV.subVectors(sg[1], sg[0]);
          var t = THREE.MathUtils.clamp(cV2.subVectors(x, sg[0]).dot(cV) / Math.max(1e-9, cV.lengthSq()), 0, 1);
          cV2.copy(sg[0]).addScaledVector(cV, t);
          var d = x.distanceTo(cV2);
          if(d < bd){ bd = d; best = cV2.clone(); }
        });
        if(!best) continue;
        var rx = x.x - hip.x, rz = x.z - hip.z, r = Math.hypot(rx, rz), rq = Math.hypot(best.x - hip.x, best.z - hip.z) + LGAP;
        if(r < rq && r > 1e-4){ x.x = hip.x + rx / r * rq; x.z = hip.z + rz / r * rq; }
      }
    });
  }

  /* pushOut: a garment that hangs loose over the legs (kit item loose: skirts, robes, the kimono) has each vertex
     pushed out of the thighs and shins on the GPU, after skinning, so no knee comes through between two cloth chains.
     The capsules (legCaps: thighs, shins, feet, and hard ones for the arms, so a raised arm lifts a mantle's hem) are
     the body's, in the figure's inner space, padded by the cloth's
     thickness, and a torso garment by 2 cm more (PAD_TOP), so a robe's hem lies over the skirt it covers, and 3.5 cm more again over
     trousers (PAD_OVER), which stand out of the capsules more than a skirt's chains do. The push is a thin band,
     not a projection: a vertex d from the bone within r + 1.5 cm lands at r - 1.5 cm + d * 3 cm / (r + 1.5 cm), so
     two tiers of one skirt keep their order instead of meeting on one surface, and cloth that already lies right
     barely moves */
  // NCAP capsules: the ten of LEGS, four more for a giant's lower arms (left at radius 0, so skipped, on other bodies)
  // and the two of the seat (14, 15: skeleton.json colliders with rest ends, soft like the legs')
  var NCAP = 16, capV = function(){ var a = []; for(var i = 0; i < NCAP; i++) a.push(new THREE.Vector4()); return a; };
  var pushU = { kcA:{ value:capV() }, kcR:{ value:new Array(NCAP).fill(0) },
                kcB:{ value:capV() }, kcH:{ value:new THREE.Vector3() },
                kcT:{ value:0 }, kcS:{ value:0 }, kcSF:{ value:0 } }, noTuck = { value:0 }, TUCK = 0.025, PAD_TOP = 0.02, PAD_OVER = 0.035,
      SQUEEZE = 0.008, SQUEEZE_FEET = 0.014;
  /* every top and every pair of trousers or skirt goes through here: loose ones (kcL) are pushed out of the limbs;
     under a top that closes round the waist (kit item tucks) trousers' and skirts' bands above the hips are drawn in
     toward the body's axis by up to TUCK (kcT), so a waistband stays under the top in any pose; under a loose top that
     reaches below the knees (kit item long) trousers below the hips are drawn in to within SQUEEZE of the legs'
     capsules (kcS: the first six, thighs, shins and feet), so wide ones stay under the robe. The radius is the tapered
     one (ra to rb): at one radius per capsule (a median of the leg's surface) the trousers sank into the calves and,
     the skin under them hidden, the court's legs read thin; a looser squeeze (2.5 cm) put them out through the robes'
     knees instead. Each vertex is drawn to its nearest capsule only: drawn to all six, a shin's was pulled into a ball
     round the knee (the thigh's end) and the inside of each leg toward the other, and the court's legs came out thin */
  function pushOut(mat, pad, loose, legs, feet){
    var prev = mat.onBeforeCompile, padU = { value:pad || 0, base:pad || 0 }, looseU = { value:loose ? 1 : 0 };
    mat.onBeforeCompile = function(sh, r){
      if(prev) prev(sh, r);
      sh.uniforms.kcA = pushU.kcA; sh.uniforms.kcB = pushU.kcB; sh.uniforms.kcR = pushU.kcR; sh.uniforms.kcH = pushU.kcH; sh.uniforms.kcP = padU;
      sh.uniforms.kcL = looseU; sh.uniforms.kcT = legs ? pushU.kcT : noTuck; sh.uniforms.kcS = legs ? pushU.kcS : feet ? pushU.kcSF : noTuck;
      // a vertex inside a leg goes out the side away from the body's axis (kcH), so a stride cannot leave the
      // cloth behind the knee; an arm's capsule (kcB.w 1) is hard: only what is inside it moves, to its surface. The
      // radius runs from kcA.w at a to kcR at b (a limb tapers: make_mpfb.py colliders ra, rb). A thigh pushes nothing
      // behind it in its top third: its capsule runs down the femur, toward the outside of the thigh, and at the radius
      // that covers the flesh within (12 cm) it took in the buttock and pushed a loincloth's back flap, a kilt's seat
      // and a robe's back out into wings (the seat covers the buttocks); in front it still pushes, or a kimono showed
      // wide harem pants at the hips. The soft push
      // is a thin band (1.5 cm either side of the capsule's surface: d in [0, r + 1.5 cm] lands in [r - 1.5, r + 1.5]),
      // so cloth that already lies right barely moves; the 4 cm shell outside it moved everything within 4 cm of a
      // capsule out by up to 3 cm, and a loincloth's flaps, a kilt's seat and a robe's back crumpled at rest
      sh.vertexShader = 'uniform vec4 kcA[' + NCAP + '];\nuniform vec4 kcB[' + NCAP + '];\nuniform float kcR[' + NCAP + '];\nuniform vec3 kcH;\nuniform float kcP;\nuniform float kcL;\nuniform float kcT;\nuniform float kcS;\n' + sh.vertexShader.replace('#include <skinning_vertex>',
        '#include <skinning_vertex>\n\tvec3 cbk = (kcA[14].xyz + kcA[15].xyz) * 0.5 - kcH; cbk.y = 0.0; cbk *= kcA[14].w > 0.0 ? 1.0 / max(length(cbk), 1e-5) : 0.0;\n' +
        '\tfor(int ci = 0; ci < ' + NCAP + '; ci++){\n\t\tif(kcL < 0.5 || kcA[ci].w <= 0.0) continue;\n' +
        '\t\tvec3 ca = kcA[ci].xyz, cab = kcB[ci].xyz - ca; float csh = kcB[ci].w > 0.5 ? 0.0 : 0.015;\n' +
        '\t\tfloat ct = dot(transformed - ca, cab) / max(dot(cab, cab), 1e-8);\n\t\tif(ci < 2 && ct < 0.3 && (dot(transformed - ca, cbk) > 0.0 || kcA[14].w <= 0.0)) continue;\n\t\tct = clamp(ct, 0.0, 1.0);\n' +
        '\t\tfloat cr = mix(kcA[ci].w, kcR[ci] > 0.0 ? kcR[ci] : kcA[ci].w, ct) + (csh > 0.0 ? kcP : 0.0), cR = cr + csh;\n' +
        '\t\tvec3 cq = ca + cab * ct, cd = transformed - cq; float cl = length(cd);\n' +
        '\t\tif(cl < cR && cl > 1e-5){\n' +
        '\t\t\tvec3 co = vec3(cq.x - kcH.x, 0.0, cq.z - kcH.z); float col = length(co);\n' +
        '\t\t\tif(cl < cr && csh > 0.0 && col > 1e-4){ co /= col; float cs = dot(cd, co); if(cs < 0.0) cd -= 2.0 * cs * co; }\n' +
        '\t\t\ttransformed = cq + normalize(cd) * (cr - csh + cl * 2.0 * csh / cR);\n\t\t}\n\t}\n' +
        '\tif(kcS > 0.0 && transformed.y < kcH.y){\n\t\tfloat sb = 1e9; vec3 sbq = vec3(0.0); float sbr = 0.0;\n' +
        '\t\tfor(int ci = 0; ci < 6; ci++){\n\t\t\tif(kcA[ci].w <= 0.0) continue;\n' +
        '\t\t\tvec3 sa = kcA[ci].xyz, sab = kcB[ci].xyz - sa; float st = clamp(dot(transformed - sa, sab) / max(dot(sab, sab), 1e-8), 0.0, 1.0);\n' +
        '\t\t\tfloat sr = mix(kcA[ci].w, kcR[ci] > 0.0 ? kcR[ci] : kcA[ci].w, st) + kcS;\n' +
        '\t\t\tvec3 sq = sa + sab * st; float sl = length(transformed - sq);\n' +
        '\t\t\tif(sl - sr < sb){ sb = sl - sr; sbq = sq; sbr = sr; }\n\t\t}\n' +
        '\t\tvec3 sd = transformed - sbq; float sl = length(sd);\n\t\tif(sb > 0.0 && sb < 0.15) transformed = sbq + sd * (sbr / sl);\n\t}\n' +
        '\tif(kcT > 0.0){\n\t\tfloat tf = smoothstep(kcH.y - 0.02, kcH.y + 0.06, transformed.y);\n' +
        '\t\tvec2 td = transformed.xz - kcH.xz; float tl = length(td);\n' +
        '\t\tif(tf > 0.0 && tl > 1e-4) transformed.xz = kcH.xz + td * (max(tl - kcT * tf, 0.5 * tl) / tl);\n\t}');
    };
    mat.customProgramCacheKey = function(){ return 'kchar-push'; };
    mat.needsUpdate = true;
    return padU;
  }
  var LEGS = [['LeftUpLeg', 'LeftLeg'], ['RightUpLeg', 'RightLeg'], ['LeftLeg', 'LeftFoot'], ['RightLeg', 'RightFoot'],
              ['LeftFoot', 'LeftToeBase'], ['RightFoot', 'RightToeBase'], ['LeftArm', 'LeftForeArm'], ['RightArm', 'RightForeArm'],
              ['LeftForeArm', 'LeftHand'], ['RightForeArm', 'RightHand'],
              ['Left2Arm', 'Left2ForeArm'], ['Right2Arm', 'Right2ForeArm'], ['Left2ForeArm', 'Left2Hand'], ['Right2ForeArm', 'Right2Hand']], legInv = new THREE.Matrix4();
  function legCaps(){
    if(!caps.length) return;
    self.inner.updateMatrixWorld(true);
    legInv.copy(self.inner.matrixWorld).invert();
    LEGS.forEach(function(lg, i){
      // a foot has no collider of its own: it takes its shin's radius
      var foot = i === 4 || i === 5, a = byName[lg[0]], b = byName[lg[1]], sh = foot ? byName[LEGS[i - 2][0]] : a;
      var cp = caps.filter(function(c){ return c.a === sh && c.b === (foot ? a : b); })[0];
      if(!cp || b === undefined || (i >= 10 && !self.fourArms)){ pushU.kcA.value[i].w = 0; return; }
      bones[a].getWorldPosition(cV).applyMatrix4(legInv); bones[b].getWorldPosition(cV2).applyMatrix4(legInv);
      // the radius at each end (a foot takes its shin's at the ankle, all along); an arm keeps one radius: its taper
      // measured the deltoid into the upper arm's, and the hard push crushed a tunic and the mantle over it together
      var ra = i >= 6 ? cp.r : foot ? cp.rb : cp.ra, rb = i >= 6 ? cp.r : cp.rb;
      pushU.kcA.value[i].set(cV.x, cV.y, cV.z, ra + 0.01); pushU.kcB.value[i].set(cV2.x, cV2.y, cV2.z, i >= 6 ? 1 : 0);
      pushU.kcR.value[i] = rb + 0.01;
    });
    // the seat: the buttocks, which neither the thighs' nor the trunk's capsule covers (a robe's back went through)
    var seat = caps.filter(function(c){ return c.pa; });
    for(var q = 0; q < 2; q++){
      var sp = seat[q];
      if(!sp){ pushU.kcA.value[14 + q].w = 0; continue; }
      capEnds(sp, cV, cV2); cV.applyMatrix4(legInv); cV2.applyMatrix4(legInv);
      pushU.kcA.value[14 + q].set(cV.x, cV.y, cV.z, sp.r + 0.01); pushU.kcB.value[14 + q].set(cV2.x, cV2.y, cV2.z, 0);
      pushU.kcR.value[14 + q] = sp.r + 0.01;
    }
    bones[byName.Hips].getWorldPosition(pushU.kcH.value).applyMatrix4(legInv);
  }

  /* bodyFix: clips retargeted from slighter bodies can put a hand in a broad body's hip or a thigh through the
     other: after the clip, an elbow or a hand inside the pelvis, chest or its own side's thigh turns its upper arm or
     forearm out until it clears; two thighs that overlap each turn out by half */
  var ARMS = [['LeftArm', 'LeftForeArm', 'LeftHand', 'LeftUpLeg'], ['RightArm', 'RightForeArm', 'RightHand', 'RightUpLeg'],
              ['Left2Arm', 'Left2ForeArm', 'Left2Hand', 'LeftUpLeg', 'LeftArm'], ['Right2Arm', 'Right2ForeArm', 'Right2Hand', 'RightUpLeg', 'RightArm']].filter(function(a){ return byName[a[0]] !== undefined; }),
      fV = new THREE.Vector3(), fW = new THREE.Vector3();
  function depth(p, cp, out){
    var a = bones[cp.a].getWorldPosition(fV), b = bones[cp.b].getWorldPosition(fW);
    cV.subVectors(b, a);
    var t = THREE.MathUtils.clamp(cV2.subVectors(p, a).dot(cV) / Math.max(1e-9, cV.lengthSq()), 0, 1);
    out.copy(a).addScaledVector(cV, t);
    var d = p.distanceTo(out);
    out.subVectors(p, out).divideScalar(Math.max(d, 1e-6));    // the way out
    return cp.r + 0.012 - d;
  }
  /* toesFlat: a clip that stands on the ball of a foot (the heel up) pitches the whole foot, toes and all, so the toes
     and a sandal's sole went down into the ground. After the clip each toe joint turns up until a point TOE ahead of it,
     along the toes' rest direction, is no lower than the ground: the foot rolls on its ball */
  var TOE = 0.06, toeLocal = null, tfW = new THREE.Vector3(), tfD = new THREE.Vector3(), tfT = new THREE.Vector3(), tfQ = new THREE.Quaternion();
  function toesFlat(){
    if(!toeLocal){
      var f = KCHAR.fk(skel, J.map(function(j){ return j.t; }));
      toeLocal = {};
      ['Left', 'Right'].forEach(function(sd){
        var ti = byName[sd + 'ToeBase'], fi = byName[sd + 'Foot'];
        if(ti === undefined || fi === undefined) return;
        var r = f.R[ti], fwd = new THREE.Vector3(f.P[ti][0] - f.P[fi][0], 0, f.P[ti][2] - f.P[fi][2]).normalize();
        toeLocal[sd] = fwd.applyQuaternion(new THREE.Quaternion(r[0], r[1], r[2], r[3]).invert());   // the toes' way, in the joint
      });
    }
    var sc = self.group.getWorldScale(cS).x, ground = self.group.getWorldPosition(cV3).y + 0.004 * sc, L = TOE * sc;
    ['Left', 'Right'].forEach(function(sd){
      var b = bones[byName[sd + 'ToeBase']];
      if(!b || !toeLocal[sd]) return;
      b.getWorldPosition(tfW);
      tfD.copy(toeLocal[sd]).applyQuaternion(b.getWorldQuaternion(tfQ));
      var dy = (ground - tfW.y) / L;
      if(tfW.y + tfD.y * L >= ground || dy >= 1 || dy <= -1) return;
      tfT.set(tfD.x, 0, tfD.z);
      if(tfT.lengthSq() < 1e-8) return;
      tfT.normalize().multiplyScalar(Math.sqrt(1 - dy * dy)); tfT.y = dy;
      turnWorld(b, tfQ.setFromUnitVectors(tfD, tfT));
    });
  }
  function bodyFix(){
    if(!caps.length || !self.action) return;
    self.group.updateMatrixWorld(true);
    var sc = self.group.getWorldScale(cS).x, out = new THREE.Vector3(), q = new THREE.Quaternion();
    var body = caps.filter(function(c){ return !c.pa && (c.a === byName.Hips || c.a === byName.Spine1); });   // the trunk, not the seat
    ARMS.forEach(function(arm){
      var s0 = bones[byName[arm[0]]], s1 = bones[byName[arm[1]]], s2 = bones[byName[arm[2]]];
      // a giant's lower arm keeps out of the upper arm of its side too (its upper arm and forearm capsules)
      var thigh = caps.filter(function(c){ return c.a === byName[arm[3]] || (arm[4] && (c.a === byName[arm[4]] || c.a === byName[arm[4].replace('Arm', 'ForeArm')])); });
      [[s0, s1], [s1, s2]].forEach(function(pr){
        var pivot = pr[0].getWorldPosition(new THREE.Vector3()), p = pr[1].getWorldPosition(new THREE.Vector3()), worst = 0, way = new THREE.Vector3();
        body.concat(thigh).forEach(function(cp){ var dd = depth(p, { a:cp.a, b:cp.b, r:cp.r * sc }, out); if(dd > worst){ worst = dd; way.copy(out); } });
        if(worst <= 0) return;
        var to = p.clone().addScaledVector(way, worst);
        q.setFromUnitVectors(p.clone().sub(pivot).normalize(), to.sub(pivot).normalize());
        turnWorld(pr[0], q);
      });
    });
    // the thighs: closest points of the two segments
    var tl = caps.filter(function(c){ return c.a === byName.LeftUpLeg; })[0], tr = caps.filter(function(c){ return c.a === byName.RightUpLeg; })[0];
    if(!tl || !tr) return;
    var hl = bones[tl.a].getWorldPosition(new THREE.Vector3()), kl = bones[tl.b].getWorldPosition(new THREE.Vector3());
    var hr = bones[tr.a].getWorldPosition(new THREE.Vector3()), kr = bones[tr.b].getWorldPosition(new THREE.Vector3());
    var need = (tl.r + tr.r) * sc + 0.004, gap = kl.distanceTo(kr);
    if(gap >= need) return;
    var sep = kl.clone().sub(kr); sep.y = 0;
    if(sep.lengthSq() < 1e-8) sep.set(1, 0, 0);
    sep.normalize().multiplyScalar((need - gap) / 2);
    q.setFromUnitVectors(kl.clone().sub(hl).normalize(), kl.clone().add(sep).sub(hl).normalize()); turnWorld(bones[tl.a], q);
    q.setFromUnitVectors(kr.clone().sub(hr).normalize(), kr.clone().sub(sep).sub(hr).normalize()); turnWorld(bones[tr.a], q);
  }

  /* bowString: the string between the bow's limb tips (data/props.json string, in the bow's frame), drawn through
     the right hand's grip point while that is behind the bow and near its middle, and an arrow from there to the bow
     hand once the string is pulled; straight and empty otherwise. The clips hold the bow hand at various turns, so
     the bow turns about its own handle to face the drawing hand */
  var bow = null, sMat = new THREE.MeshStandardMaterial({ color:0xd9ccad, roughness:0.9 });
  function makeBow(g, p){
    var cyl = new THREE.CylinderGeometry(0.0025, 0.0025, 1, 4, 1, true), pivot = new THREE.Group();
    while(g.children.length) pivot.add(g.children[0]);
    g.add(pivot);
    var b = { top:V().fromArray(p.string, 0), bot:V().fromArray(p.string, 3), a:new THREE.Mesh(cyl, sMat),
              c:new THREE.Mesh(cyl, sMat), arrow:null, pivot:pivot, turn:0 };
    pivot.add(b.a); pivot.add(b.c);
    bow = b;
    bowString();
    return p.arrow ? propScene(p.arrow).then(function(scene){
      if(bow !== b) return;
      b.arrow = scene.clone(true); b.arrow.visible = false; pivot.add(b.arrow);
    }) : null;
  }
  var yAx = new THREE.Vector3(0, 1, 0), zAx = new THREE.Vector3(0, 0, 1);
  function span(m, a, b){
    tU.subVectors(b, a);
    m.position.addVectors(a, b).multiplyScalar(0.5);
    m.scale.set(1, Math.max(1e-4, tU.length()), 1);
    m.quaternion.setFromUnitVectors(yAx, tU.normalize());
  }
  function bowString(){
    if(!bow) return;
    var mid = null, rest = (bow.top.z + bow.bot.z) / 2;
    if(skel.hands.R){
      self.group.updateMatrixWorld(true);
      tP.setFromMatrixPosition(holder('R').matrixWorld);
      bow.pivot.parent.worldToLocal(tP);                      // the drawing hand in the bow hand's grip frame
      var n = Math.hypot(tP.x, tP.z), turn = 0;
      if(Math.abs(tP.y) < 0.35 && n > 0.12 && n < 0.95) turn = Math.atan2(-tP.x, -tP.z);
      bow.turn = turn;
      bow.pivot.quaternion.setFromAxisAngle(yAx, turn);
      tP.applyAxisAngle(yAx, -turn);                          // into the turned bow's frame
      if(turn !== 0 && tP.z < rest - 0.02) mid = tP;
    }
    if(mid){
      span(bow.a, bow.top, mid); span(bow.c, mid, bow.bot);
      bow.c.visible = true;
    } else {
      span(bow.a, bow.top, bow.bot);
      bow.c.visible = false;
    }
    if(bow.arrow){
      var drawn = mid && mid.z < -0.2;
      bow.arrow.visible = !!drawn;
      if(drawn){
        bow.arrow.position.copy(mid);
        bow.arrow.quaternion.setFromUnitVectors(zAx, tV.set(0, 0.04 * Math.sign(mid.y || 1), 0).sub(mid).normalize());
      }
    }
    self.drawn = !!mid;
    // the drawing hand hooks three fingers on the string
    var hR = skel.hands && skel.hands.R, dc = mid && hR && hR.curls && hR.curls.draw;
    if(dc && !held.R) dc.forEach(function(q){ bones[q[0]].quaternion.fromArray(J[q[0]].r).multiply(curlQ.set(q[1], q[2], q[3], q[4])); });
  }
  /* ---- posture: after each clip the spine, neck and head are pitched (data/posture.json: degrees per joint in the
     figure's frame, negative forward) and the shoulders dropped and drawn back. The clips, retargeted onto
     MakeHuman's curved spine, stand with the chest pushed forward and the upper body leaning back ---- */
  // data/posture.json for this body (KCharFigure.posture: the page fills it; a body without an entry takes the man's),
  // copied, so a panel can change one figure's live
  var PJ = ['Spine', 'Spine1', 'Spine2', 'Neck', 'Head'], PD = KCharFigure.posture || {};
  var POSTURE = Object.assign({ Spine:0, Spine1:0, Spine2:0, Neck:0, Head:0, drop:0, back:0 }, PD[kit.body] || PD.mpfb_male || {});
  var pAx = V(), pQ = Q(), pG = Q(), pW = [Q(), Q()];
  var pArms = ['LeftArm', 'RightArm'].map(function(n){ return byName[n] !== undefined ? byName[n] : -1; });
  function posture(force){
    if(!self.action && !force) return;   // the rest pose (the A-pose clothes are fitted in) stays as it is
    self.group.getWorldQuaternion(pG);
    // the upper arms keep the way the clip points them: the torso straightens under them, and a thrust or a held
    // spear aims where the clip aims it
    pArms.forEach(function(k, i){ if(k >= 0) bones[k].getWorldQuaternion(pW[i]); });
    PJ.forEach(function(n){
      var b = byName[n] !== undefined && bones[byName[n]], a = +POSTURE[n] || 0; if(!b || !a) return;
      turnWorld(b, pQ.setFromAxisAngle(pAx.set(1, 0, 0).applyQuaternion(pG), -a * Math.PI / 180));
    });
    [['LeftShoulder', 1], ['RightShoulder', -1]].forEach(function(sh){
      var b = byName[sh[0]] !== undefined && bones[byName[sh[0]]]; if(!b) return;
      turnWorld(b, pQ.setFromAxisAngle(pAx.set(0, 0, 1).applyQuaternion(pG), -sh[1] * (+POSTURE.drop || 0) * Math.PI / 180));
      turnWorld(b, pQ.setFromAxisAngle(pAx.set(0, 1, 0).applyQuaternion(pG), sh[1] * (+POSTURE.back || 0) * Math.PI / 180));
    });
    pArms.forEach(function(k, i){
      if(k < 0) return;
      bones[k].parent.getWorldQuaternion(qB);
      bones[k].quaternion.copy(qB.invert().multiply(pW[i]));
      bones[k].updateMatrixWorld(true);
    });
  }
  this.posture = POSTURE;

  function afterClip(dt){ posture(); arms2(dt); bodyFix(); toesFlat(); grip(); twoHands(dt); clothStep(dt); legCaps(); bowString(); }

  /* arms2: the lower arms of a body with a second pair (a mod, tools/mods.py: Left2Arm..., copies of the upper pair's
     joints hung lower on the ribs, on every skeleton). No clip
     moves them: each frame they take a pose from the upper pair's. A clip's group picks how:
       guard  most clips: a resting pose of their own (GUARD: forward a little, elbows bent, the hands before the
              belly; the pair already hangs steeper than the upper at rest, tools/giant.py HANG) plus half the upper arms' motion over it, so they swing in a walk and shadow a blow
       copy   climbing, swimming, falling: the upper arms' motion whole, so the body moves as one
     with no clip (the A pose) they hang as the upper pair does. They follow with a lag (LAG), and bodyFix keeps them out
     of the body, the thighs and the upper arms */
  var LOW = [], LAG = 0.09, GUARD = { Arm:{ add:0, flex:6 }, ForeArm:{ flex:72 } }, COPY = { climb:1, swim:1, hurt:1 };
  // how much of the upper arms' motion the guard takes, by clip group: a blow, a shot or a drink stays with the upper
  // hands; a walk, a block or a dodge moves all four; the empty lower hands close as far as CLOSE of a fist
  var SHARE = { idle:0.4, move:0.55, melee:0.3, ranged:0.2, defend:0.6, life:0.25, work:0.35 }, CLOSE = 0.45;
  var lowW = 0, lowQ = [], qL = new THREE.Quaternion(), qL2 = new THREE.Quaternion(), qI = new THREE.Quaternion();
  (function(){
    J.forEach(function(j, i){
      var m = /^(Left|Right)2(.+)$/.exec(j.name), s = m && byName[m[1] + m[2]];
      if(s !== undefined && m) LOW.push({ s:s, d:i, part:m[2], sx:m[1] === 'Left' ? 1 : -1 });
    });
    if(!LOW.length) return;
    // each joint's rest orientation in the figure's space, and the guard pose as local turns: a turn given in the body's
    // terms (draw in about the forward axis, raise forward about the side axis; the elbow about its own hinge) put in
    // the joint's frame at rest
    var wq = J.map(function(){ return null; }), wp = J.map(function(){ return null; });
    J.forEach(function(j, i){
      var q = new THREE.Quaternion().fromArray(j.r), t = new THREE.Vector3().fromArray(j.t);
      if(j.parent >= 0){ t.applyQuaternion(wq[j.parent]).add(wp[j.parent]); q.premultiply(wq[j.parent]); }
      wq[i] = q; wp[i] = t;
    });
    var X = new THREE.Vector3(1, 0, 0), Z = new THREE.Vector3(0, 0, 1);
    LOW.forEach(function(L){
      var g = GUARD[L.part], R = new THREE.Quaternion();
      L.rest = new THREE.Quaternion().fromArray(J[L.d].r);
      if(g){
        var kid = J.map(function(j, i){ return j.parent === L.d ? i : -1; }).filter(function(i){ return i >= 0; })[0];
        var dir = kid !== undefined ? wp[kid].clone().sub(wp[L.d]).normalize() : new THREE.Vector3(L.sx, -1, 0).normalize();
        if(g.add) R.premultiply(new THREE.Quaternion().setFromAxisAngle(Z, -L.sx * g.add * Math.PI / 180));
        if(g.flex && L.part === 'Arm') R.premultiply(new THREE.Quaternion().setFromAxisAngle(X, -g.flex * Math.PI / 180));
        if(g.flex && L.part !== 'Arm') R.premultiply(new THREE.Quaternion().setFromAxisAngle(dir.clone().cross(Z).normalize(), g.flex * Math.PI / 180));
      }
      L.guard = wq[L.d].clone().invert().multiply(R).multiply(wq[L.d]);
      L.cur = L.rest.clone();
    });
  })();
  function arms2(dt){
    if(!LOW.length || !self.fourArms) return;
    var clip = self.action && meta[self.action.getClip().name], copy = clip && COPY[clip.group];
    var wantW = !self.action ? 0 : copy ? 0 : 1, k = !self.action ? 1 : copy ? 1 : (clip && SHARE[clip.group] !== undefined ? SHARE[clip.group] : 0.4);
    var a = dt === undefined ? 1 : 1 - Math.exp(-dt / LAG), aw = dt === undefined ? 1 : 1 - Math.exp(-dt / 0.3);
    lowW += (wantW - lowW) * aw;
    LOW.forEach(function(L){
      // the upper joint's turn from its rest, a share of it, over the guard turn (as much of it as the mode wants)
      qL.fromArray(J[L.s].r).invert().multiply(bones[L.s].quaternion);
      qL2.copy(qI).slerp(qL, k);
      qL.copy(qI).slerp(L.guard, lowW);
      qL.multiply(qL2).premultiply(L.rest);
      L.cur.slerp(qL, a);
      bones[L.d].quaternion.copy(L.cur);
    });
    // the empty lower hands close loosely while they guard (a held prop's grip comes after, in grip())
    ['L2', 'R2'].forEach(function(sd){
      var h = skel.hands && skel.hands[sd];
      if(!h || held[sd] || !lowW) return;
      (h.curls ? h.curls.fist : h.curl).forEach(function(c){
        curlQ.set(c[1], c[2], c[3], c[4]); qL.copy(qI).slerp(curlQ, CLOSE * lowW);
        bones[c[0]].quaternion.multiply(qL);
      });
    });
  }
  function hipsMorph(){
    var d = self.morphDelta && self.morphDelta[byName.Hips];
    if(d){ self.hips.position.x += d[0]; self.hips.position.y += d[1]; self.hips.position.z += d[2]; }
  }

  /* play(name): a clip from anims.glb, or null for the bind pose. A clip skeleton.json marks loop: false plays once
     and then fades back to the last looping clip (the idle by default) */
  var meta = {}; (skel.clips || []).forEach(function(c){ meta[c.name] = c; });
  this.looping = 'idle';
  this.mixer.addEventListener('finished', function(e){
    if(e.action === self.action) self.play(self.looping);
  });
  this.play = function(name){
    return ready.then(function(){
      var c = name && self.clips[name];
      if(self.action) self.action.fadeOut(0.25);
      if(!c){ self.action = null; self.mixer.stopAllAction(); self.restPose(); return; }
      var once = meta[name] && meta[name].loop === false;
      if(!once) self.looping = name;
      var a = self.mixer.clipAction(c);
      if(acts.indexOf(a) < 0) acts.push(a);
      a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
      a.clampWhenFinished = once;
      a.reset().fadeIn(self.action ? 0.25 : 0).play();
      self.action = a;
    });
  };

  /* the hips' position, from the base body's rest moved by each playing clip's hips track by its weight. The mixer
     does not apply that track: three writes a property only when its mixed value changes, and the hips start each
     frame from the rest, so a still or slow track (driving, kneeling to repair) was written on some frames and not on
     others and the figure shook between the clip and standing */
  var acts = [], hV = V(), hR = V();
  function hipsTrack(){
    var p = self.hips.position;
    hR.fromArray(J[byName.Hips].t); p.copy(hR);
    acts.forEach(function(a){
      var tr = a.getClip().hipsTrack, w = a.isScheduled() ? a.getEffectiveWeight() : 0;
      if(!tr || !(w > 0)) return;
      var it = tr._kInterp || (tr._kInterp = tr.createInterpolant());
      p.addScaledVector(hV.fromArray(it.evaluate(a.time)).sub(hR), w);
    });
  }

  /* each bone as the clips left it, before the passes after them (posture, the arms' fixes, grips) turned it: every
     frame starts from it. The mixer writes a bone only when its value changes, so a still frame (a paused or
     scrubbed clip, a held pose) kept last frame's turned bone and the passes turned it again, frame after frame */
  var clipQ = J.map(function(j){ return Q().fromArray(j.r); });

  this.update = function(dt){
    if(!self.action) return;
    for(var i = 0; i < bones.length; i++) bones[i].quaternion.copy(clipQ[i]);
    // the morph and lift below are added to the hips once, not once a frame: hipsTrack starts them from the rest
    self.mixer.update(dt * CADENCE);
    for(i = 0; i < bones.length; i++) clipQ[i].copy(bones[i].quaternion);
    hipsTrack();
    self.hips.position.y += self.pose.lift;
    hipsMorph();
    afterClip(dt);
  };

  this.headWorld = function(v){ return self.headBone.getWorldPosition(v); };

  this.dispose = function(){ self.mixer.stopAllAction(); self.group.parent && self.group.parent.remove(self.group); };
}
KCharFigure.props = {};      // data/props.json by id (the page fills it)
KCharFigure.posture = {};    // data/posture.json bodies (the page fills it)
