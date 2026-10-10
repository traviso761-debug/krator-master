/* ==== KCharFigure: one body's character, drawn from kit pieces on one shared skeleton. [draw] (Godot: kchar_figure.gd) ====
   new KCharFigure(body, sliders, load)
     body     { skeleton, kit } (data/<body>/skeleton.json, kit.json)
     sliders  data/sliders.json
     load     key -> Promise of a GLTFLoader result (key: a GLB's path under pieces/, no .glb), e.g. 'male/head_styv'
   fig.group             add to a scene; feet at its origin, facing +z
   fig.apply(record)     -> Promise: loads what the record needs (KCHAR.parts), shows it, leaves out the base triangles the
                         armour covers (KCHAR.hidden), poses the skeleton (KCHAR.pose) and dyes the armour and hair
   fig.play(name)        a clip from the body's anims.glb, or null for the bind (A) pose
   fig.update(dt)        once a frame
   fig.headWorld(v3)     the head joint's world position
   The bones are built from skeleton.json, so every piece binds to the same objects. Each piece keeps its own Skeleton
   (same bones, its own inverse binds): a slider's skin scale goes in as boneInverses[i] = S(s[i]) * IBM[i], scaling
   only that joint's own vertices, in its own frame, without passing down the hierarchy.
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

  function mesh(part, g){
    var id = part.key + '|' + part.mesh;
    if(live[id]) return live[id];
    var src = null;
    g.scene.traverse(function(m){ if(m.isSkinnedMesh && m.name === part.mesh) src = m; });
    if(!src) return null;
    var ibm = J.map(function(){ return new THREE.Matrix4(); });
    src.skeleton.bones.forEach(function(b, k){ var i = byName[b.name]; if(i !== undefined) ibm[i].copy(src.skeleton.boneInverses[k]); });
    var geo = src.geometry;
    if(part.role === 'base') geo = geo.clone();          // its index is filtered per record; keep the whole one aside
    var m = new THREE.SkinnedMesh(geo, src.material.clone());
    m.name = id; m.frustumCulled = false; m.castShadow = true;
    m.userData = { part:part, ibm:ibm, index0:geo.index ? geo.index.array.slice() : null };
    m.bind(new THREE.Skeleton(bones, ibm.map(function(x){ return x.clone(); })), new THREE.Matrix4());
    self.inner.add(m);
    live[id] = m;
    return m;
  }

  var S = new THREE.Matrix4();
  function skinScale(m, pose){
    var inv = m.skeleton.boneInverses, ibm = m.userData.ibm;
    for(var i=0;i<inv.length;i++){ var s = pose.s[i]; inv[i].copy(S.makeScale(s[0], s[1], s[2]).multiply(ibm[i])); }
  }

  /* leave out the triangles of a base region that `hide` (0/1 per triangle) marks */
  function filterBase(m, hide){
    var i0 = m.userData.index0; if(!i0 || !hide) return;
    var keep = [], n = i0.length / 3;
    for(var t=0;t<n;t++) if(!hide[t]) keep.push(i0[3*t], i0[3*t+1], i0[3*t+2]);
    m.geometry.setIndex(keep);
  }

  var token = 0;
  this.apply = function(rec){
    var my = ++token, parts = KCHAR.parts(rec, kit);
    return Promise.all([ready].concat(parts.map(function(p){ return need(p.key); }))).then(function(){
      if(my !== token) return;              // a newer record came while this one loaded
      self.record = rec;
      var want = {};
      return Promise.all(parts.map(function(p){ return need(p.key).then(function(g){ var m = mesh(p, g); if(m) want[m.name] = m; }); }))
        .then(function(){
          Object.keys(live).forEach(function(k){ live[k].visible = !!want[k]; });
          var hide = KCHAR.hidden(rec, kit), head = KCHAR.headOf(rec, kit);
          var p = self.pose = KCHAR.pose(skel, sliders, rec.sliders, head && head.face);
          bones.forEach(function(b, i){ if(b !== self.hips) b.position.fromArray(p.t[i]); });
          self.inner.scale.setScalar(p.root);
          Object.keys(want).forEach(function(k){
            var m = want[k], part = m.userData.part;
            skinScale(m, p);
            if(part.role === 'base') filterBase(m, hide[part.slot]);
            var dye = rec.dye && (part.role === 'armour' ? rec.dye[part.slot] : (part.role === 'hair' || part.role === 'beard') ? rec.dye.hair : null);
            m.material.color.set(dye || '#ffffff');
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
  };

  this.headWorld = function(v){ return self.headBone.getWorldPosition(v); };

  this.dispose = function(){ self.mixer.stopAllAction(); self.group.parent && self.group.parent.remove(self.group); };
}
