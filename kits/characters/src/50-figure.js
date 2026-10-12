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
  var ready = load(kit.body + '/anims').then(function(g){ g.animations.forEach(function(c){ self.clips[c.name] = c; }); });

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
      if((itemByKey[part.key] || {}).loose) pushOut(m.material);
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
          var hide = KCHAR.hidden(rec, kit), head = KCHAR.headOf(rec, kit);
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
          self.inner.scale.setScalar(p.root);
          self.inner.position.y = p.ground || 0;
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
     hold({ R:'sword', L:'shield' }): each prop's GLB goes under its hand bone at the grip frame skeleton.json 'hands'
     gives (the props are modelled in it), and that hand's fingers close round it in the prop's grip style (fist,
     trigger, wide): their local rotation becomes the rest one times the curl, every frame after the clip (a clip's own
     finger motion gives way to the grip). With both, the left hand takes hold of the right's prop too (twoHands); a
     prop with a string (the bow) gets it drawn live, and an arrow while the right hand draws it (bowString) */
  var held = { R:null, L:null, both:false }, holders = {}, propCache = {}, curlQ = new THREE.Quaternion();
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
    return Promise.all(['R', 'L'].map(function(side){
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
        if(side === 'L' && p.string) return makeBow(g, p);
      });
    }));
  };
  this.held = held;
  function grip(){
    if(!skel.hands) return;
    ['R', 'L'].forEach(function(side){
      var id = held[side] || (side === 'L' && held.both && support() ? held.R : null);
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
    var l1 = tE.distanceTo(tS), l2 = tT.distanceTo(tE), far = l1 + l2 + 0.05;
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
      if(Math.abs(t - o) < GAP) t = (t >= o ? o + GAP <= L : o - GAP < 0) ? o + GAP : o - GAP;
      t = THREE.MathUtils.clamp(t, 0, L);
    }
    tP.copy(tA).addScaledVector(tY, t);
    // the frame: Y along the handle (the clip's thumb side), Z (the fingers) away from the shoulder, X = Y x Z
    tX.setFromMatrixColumn(tM, 1);
    if(tX.dot(tY) < 0) tY.negate();
    tZ.subVectors(tP, tS).addScaledVector(tX.setFromMatrixColumn(tM, 2).normalize(), 0.3);
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
    var dW = tW.distanceTo(tS), lim = l1 + l2 - 0.01, rArm = skel.hands.R.arm;
    if(rArm) for(k = 0; k < 3; k++) saved[3 + k].copy(bones[rArm[k]].quaternion);
    if(dW > lim && rArm){
      tD.subVectors(tS, tW).normalize().multiplyScalar(Math.min(dW - lim, MOVE));
      var rh = bones[rArm[2]];
      reachArm(bones[rArm[0]], bones[rArm[1]], rh, rh.getWorldPosition(tR).add(tD), rh.getWorldQuaternion(qR));
      tW.add(tD);
    }
    reachArm(up, fore, hand, tW, qA);
    self.reach = hand.getWorldPosition(tT).distanceTo(tW);   // how far short the hand fell (0: it holds on)
    // a clip that keeps the hands too far apart for both to hold: the arms go back to the clip's pose (eased, so
    // they do not snap) rather than reach out stiff toward the handle
    var want2 = THREE.MathUtils.clamp((0.16 - self.reach) / 0.1, 0, 1);
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
     particle. fig.cloth = false: the chains hang rigid */
  this.cloth = true;
  this.clothState = function(){ return { items:clothItems, caps:caps }; };      // verify.py, the labs
  var GRAV = 7.4, DRAG = 1.6, DAMP = 0.04, STEP = 1 / 60, PAD = 0.022;
  var clothItems = {}, itemByKey = {}, caps = [], groundY = 0, clothAcc = 0;
  (kit.items || []).forEach(function(it){ itemByKey[KCHAR.key(it.glb)] = it; });
  // a joint's name as three's loader leaves it (PropertyBinding.sanitizeNodeName: no [ ] . : /, spaces to _)
  function clothKey(n){ return n.replace(/\s/g, '_').replace(/[\[\]\.:\/]/g, ''); }
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
      c.chains.push({ parent:byName[ch.parent], pts:ch.pts, bones:list, p:[], len:[], x:[], xp:[], tw:[], q0:new THREE.Quaternion(),
                      stiff:0.1 });
    });
    c.parts.forEach(function(pt){ pt.chains.forEach(function(g){ c.chains[g].stiff = pt.stiff; c.chains[g].layer = pt.layer || 0; }); });
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
        ch.len = ch.p.slice(1).map(function(q, k){ return q.distanceTo(ch.p[k]); });
        var pinv = m.skeleton.boneInverses[ch.parent];
        ch.bones.forEach(function(b, k){
          if(k === 0){
            cM.copy(pinv).multiply(cM2.makeTranslation(ch.p[0].x, ch.p[0].y, ch.p[0].z));
            cM.decompose(b.position, b.quaternion, cS);
            ch.q0.copy(b.quaternion);
          } else { b.position.subVectors(ch.p[k], ch.p[k - 1]); b.quaternion.identity(); }
          var bi = c.bones.indexOf(b);
          c.meshes.forEach(function(mm){ mm.skeleton.boneInverses[base + bi].makeTranslation(-ch.p[k].x, -ch.p[k].y, -ch.p[k].z); });
        });
      });
      // neighbours round each part, for the spacing constraint: rest distances between chains' points
      c.ring = [];
      c.parts.forEach(function(pt){
        var g = pt.chains, n = g.length;
        for(var a = 0; a < (pt.closed ? n : n - 1); a++){
          var A = c.chains[g[a]], Bc = c.chains[g[(a + 1) % n]], kk = Math.min(A.p.length, Bc.p.length);
          for(var k = 1; k < kk; k++) c.ring.push([A, Bc, k, A.p[k].distanceTo(Bc.p[k])]);
        }
      });
      c.reset = true;
    });
  }
  function rigidTargets(c, ch){
    var pb = bones[ch.parent];
    cM.multiplyMatrices(pb.matrixWorld, c.meshes[0].skeleton.boneInverses[ch.parent]);   // model -> world, riding the joint
    for(var k = 0; k < ch.p.length; k++) (ch.tw[k] = ch.tw[k] || new THREE.Vector3()).copy(ch.p[k]).applyMatrix4(cM);
    return cM;
  }
  function clothStep(dt){
    var items = Object.keys(clothItems).map(function(k){ return clothItems[k]; }).filter(function(c){ return c.on && c.chains.length && c.chains[0].p.length; });
    if(!items.length) return;
    self.group.updateMatrixWorld(true);
    var live = self.cloth && dt !== undefined;
    if(!live){
      items.forEach(function(c){ c.chains.forEach(function(ch){ ch.bones.forEach(function(b, k){ if(k === 0) b.quaternion.copy(ch.q0); else b.quaternion.identity(); }); }); c.reset = true; });
      return;
    }
    // the body's capsules, in the world, this frame
    var sc = self.group.getWorldScale(cS).x, W = caps.map(function(cp){
      return { a:bones[cp.a].getWorldPosition(new THREE.Vector3()), b:bones[cp.b].getWorldPosition(new THREE.Vector3()), r:cp.r * sc + PAD };
    });
    groundY = self.group.getWorldPosition(cV3).y + 0.008;
    // the air: still, or the wind of walking in place
    var meta0 = self.action && meta[self.action.getClip().name], wind = new THREE.Vector3();
    if(meta0 && meta0.loop !== false && meta0.root_speed) wind.fromArray(meta0.root_speed).applyQuaternion(self.group.getWorldQuaternion(cQ3)).multiplyScalar(-sc);
    items.forEach(function(c){
      c.chains.forEach(function(ch){
        rigidTargets(c, ch);
        if(c.reset || ch.x.length !== ch.p.length || ch.tw[0].distanceTo(ch.x[0]) > 0.4){
          ch.x = ch.tw.map(function(v){ return v.clone(); }); ch.xp = ch.tw.map(function(v){ return v.clone(); });
        }
      });
      c.reset = false;
    });
    clothAcc = Math.min(clothAcc + dt, 4 * STEP);
    var h = STEP;
    while(clothAcc >= h){
      clothAcc -= h;
      items.forEach(function(c){
        c.chains.forEach(function(ch){
          var kS = 1 - Math.pow(1 - ch.stiff, h * 60);
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
  function collide(ch, W){
    for(var k = 1; k < ch.x.length; k++){
      var x = ch.x[k];
      W.forEach(function(cp){
        cV.subVectors(cp.b, cp.a);
        var t = THREE.MathUtils.clamp(cV2.subVectors(x, cp.a).dot(cV) / Math.max(1e-9, cV.lengthSq()), 0, 1);
        cV2.copy(cp.a).addScaledVector(cV, t);
        var d = x.distanceTo(cV2);
        if(d < cp.r && d > 1e-6) x.sub(cV2).multiplyScalar(cp.r / d).add(cV2);
      });
      if(x.y < groundY) x.y = groundY;
    }
  }
  function keepLen(ch, k){
    var a = ch.x[k - 1], x = ch.x[k], L = ch.len[k - 1];
    cV.subVectors(x, a); var d = cV.length();
    if(d > 1e-9) x.copy(a).addScaledVector(cV, L / d);
  }

  /* layered: a cape, a cloak or a mantle (layer 2) lies over a robe's hem or a flap (1), which lies over a skirt (0):
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
     The capsules (legCaps) are the body's, in the figure's inner space, padded by the cloth's thickness */
  var pushU = { kcA:{ value:[0, 1, 2, 3].map(function(){ return new THREE.Vector4(); }) },
                kcB:{ value:[0, 1, 2, 3].map(function(){ return new THREE.Vector4(); }) } };
  function pushOut(mat){
    var prev = mat.onBeforeCompile;
    mat.onBeforeCompile = function(sh, r){
      if(prev) prev(sh, r);
      sh.uniforms.kcA = pushU.kcA; sh.uniforms.kcB = pushU.kcB;
      sh.vertexShader = 'uniform vec4 kcA[4];\nuniform vec4 kcB[4];\n' + sh.vertexShader.replace('#include <skinning_vertex>',
        '#include <skinning_vertex>\n\tfor(int ci = 0; ci < 4; ci++){\n' +
        '\t\tvec3 ca = kcA[ci].xyz, cab = kcB[ci].xyz - ca; float cr = kcA[ci].w;\n' +
        '\t\tfloat ct = clamp(dot(transformed - ca, cab) / max(dot(cab, cab), 1e-8), 0.0, 1.0);\n' +
        '\t\tvec3 cq = ca + cab * ct, cd = transformed - cq; float cl = length(cd);\n' +
        '\t\tif(cl < cr && cl > 1e-5) transformed = cq + cd * (cr / cl);\n\t}');
    };
    mat.customProgramCacheKey = function(){ return 'kchar-push'; };
    mat.needsUpdate = true;
  }
  var LEGS = [['LeftUpLeg', 'LeftLeg'], ['RightUpLeg', 'RightLeg'], ['LeftLeg', 'LeftFoot'], ['RightLeg', 'RightFoot']], legInv = new THREE.Matrix4();
  function legCaps(){
    if(!caps.length) return;
    self.inner.updateMatrixWorld(true);
    legInv.copy(self.inner.matrixWorld).invert();
    LEGS.forEach(function(lg, i){
      var a = byName[lg[0]], b = byName[lg[1]], cp = caps.filter(function(c){ return c.a === a && c.b === b; })[0];
      if(!cp) return;
      bones[a].getWorldPosition(cV).applyMatrix4(legInv); bones[b].getWorldPosition(cV2).applyMatrix4(legInv);
      pushU.kcA.value[i].set(cV.x, cV.y, cV.z, cp.r + 0.014); pushU.kcB.value[i].set(cV2.x, cV2.y, cV2.z, 0);
    });
  }

  /* bodyFix: clips retargeted from slighter bodies can put a hand in a broad body's hip or a thigh through the
     other: after the clip, an elbow or a hand inside the pelvis, chest or its own side's thigh turns its upper arm or
     forearm out until it clears; two thighs that overlap each turn out by half */
  var ARMS = [['LeftArm', 'LeftForeArm', 'LeftHand', 'LeftUpLeg'], ['RightArm', 'RightForeArm', 'RightHand', 'RightUpLeg']], fV = new THREE.Vector3(), fW = new THREE.Vector3();
  function depth(p, cp, out){
    var a = bones[cp.a].getWorldPosition(fV), b = bones[cp.b].getWorldPosition(fW);
    cV.subVectors(b, a);
    var t = THREE.MathUtils.clamp(cV2.subVectors(p, a).dot(cV) / Math.max(1e-9, cV.lengthSq()), 0, 1);
    out.copy(a).addScaledVector(cV, t);
    var d = p.distanceTo(out);
    out.subVectors(p, out).divideScalar(Math.max(d, 1e-6));    // the way out
    return cp.r + 0.012 - d;
  }
  function bodyFix(){
    if(!caps.length || !self.action) return;
    self.group.updateMatrixWorld(true);
    var sc = self.group.getWorldScale(cS).x, out = new THREE.Vector3(), q = new THREE.Quaternion();
    var body = caps.filter(function(c){ return c.a === byName.Hips || c.a === byName.Spine1; });
    ARMS.forEach(function(arm){
      var s0 = bones[byName[arm[0]]], s1 = bones[byName[arm[1]]], s2 = bones[byName[arm[2]]];
      var thigh = caps.filter(function(c){ return c.a === byName[arm[3]]; });
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
  function afterClip(dt){ bodyFix(); grip(); twoHands(dt); clothStep(dt); legCaps(); bowString(); }
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
      a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
      a.clampWhenFinished = once;
      a.reset().fadeIn(self.action ? 0.25 : 0).play();
      self.action = a;
    });
  };

  this.update = function(dt){
    if(!self.action) return;
    // the hips start each frame from the base body's rest: a clip with no hips position track (most in-place loops)
    // leaves it there, and the morph and lift below are added once, not once a frame
    self.hips.position.fromArray(J[byName.Hips].t);
    self.mixer.update(dt);
    self.hips.position.y += self.pose.lift;
    hipsMorph();
    afterClip(dt);
  };

  this.headWorld = function(v){ return self.headBone.getWorldPosition(v); };

  this.dispose = function(){ self.mixer.stopAllAction(); self.group.parent && self.group.parent.remove(self.group); };
}
KCharFigure.props = {};      // data/props.json by id (the page fills it)
