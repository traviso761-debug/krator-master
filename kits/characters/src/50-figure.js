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
   fig.headWorld(v3)     the head joint's world position
   The bones are built from skeleton.json, so every piece binds to the same objects. Each piece keeps its own Skeleton
   (same bones, its own inverse binds): a slider's skin scale goes in as boneInverses[i] = S(s[i]) * IBM[i], scaling
   only that joint's own vertices, in its own frame, without passing down the hierarchy.
   A MakeHuman body (kit.style 'mpfb') has no such sliders: it morphs. Each piece's deltas (KMR1, tools/make_mpfb.py)
   are blended on the CPU by KCHAR.morphWeights; its normals are re-summed over the source mesh's vertices (so UV
   seams stay smooth); each joint's rest moves by KCHAR.morphJoints, and its inverse bind by the same amount
   (boneInverses[i] = IBM[i] * T(-d[i])). The feet are kept on the ground from the morphed skin's lowest point.
   Skin tone and hair colour multiply into the neutral textures make_mpfb made (kit.tint).
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
      var ibm = J.map(function(){ return new THREE.Matrix4(); });
      // three's loader turns 'mixamorig:Hips' into 'mixamorigHips' (MakeHuman's Mixamo rig); skeleton.json says 'Hips'
      // the piece's joints by name onto skeleton.json's order; one the skeleton lacks (an exporter's 'neutral_bone' for
      // unweighted vertices) follows the head
      var remap = s.skeleton.bones.map(function(b, k){
        var i = byName[b.name.replace(/^mixamorig:?/, '')];
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
      m.name = id; m.frustumCulled = false; m.castShadow = true;
      m.userData = { part:part, ibm:ibm, index0:geo.index ? geo.index.array.slice() : null, srcMaterial:s.material.name };
      m.bind(new THREE.Skeleton(bones, ibm.map(function(x){ return x.clone(); })), new THREE.Matrix4());
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

  var S = new THREE.Matrix4(), T = new THREE.Matrix4();
  function skinScale(m, pose, d){
    var inv = m.skeleton.boneInverses, ibm = m.userData.ibm;
    for(var i=0;i<inv.length;i++){
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
  var tint = new THREE.Color(), DEFAULT_SKIN = '#d6ad8f', DEFAULT_HAIR = '#4a3424';
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
            else {
              var dye = rec.dye && (part.role === 'armour' ? rec.dye[part.slot] : (part.role === 'hair' || part.role === 'beard') ? rec.dye.hair : null);
              m.material.color.set(dye || '#ffffff');
            }
          });
          if(!self.action) self.restPose();
        });
    });
  };

  this.restPose = function(){
    bones.forEach(function(b, i){ b.quaternion.fromArray(J[i].r); });
    self.hips.position.fromArray(self.pose.t[byName.Hips]);
    self.hips.position.y += self.pose.lift;
  };
  function hipsMorph(){
    var d = self.morphDelta && self.morphDelta[byName.Hips];
    if(d){ self.hips.position.x += d[0]; self.hips.position.y += d[1]; self.hips.position.z += d[2]; }
  }

  this.play = function(name){
    return ready.then(function(){
      var c = name && self.clips[name];
      if(self.action) self.action.fadeOut(0.25);
      if(!c){ self.action = null; self.mixer.stopAllAction(); self.restPose(); return; }
      var a = self.mixer.clipAction(c); a.reset().fadeIn(self.action ? 0.25 : 0).play();
      self.action = a;
    });
  };

  this.update = function(dt){
    if(!self.action) return;
    self.mixer.update(dt);
    self.hips.position.y += self.pose.lift;
    hipsMorph();
  };

  this.headWorld = function(v){ return self.headBone.getWorldPosition(v); };

  this.dispose = function(){ self.mixer.stopAllAction(); self.group.parent && self.group.parent.remove(self.group); };
}
