/* ==== KCharFigure: a character drawn from pieces on one shared skeleton. [draw] (Godot: kchar.gd builds the same on a Skeleton3D) ====
   new KCharFigure(data, gltfs)
     data   KCHAR_DATA: { skeleton, sliders, outfits } (data/*.json)
     gltfs  { anims: <GLTFLoader result of pieces/anims.glb>, <outfit id>: <result of pieces/<id>.glb>, ... }
   fig.group                the object to add to a scene; feet at its origin, facing +z
   fig.apply(record)        shows the record's pieces (KCHAR.visible), poses the skeleton (KCHAR.pose), dyes the slots
   fig.play(name)           'idle' | 'walk' | 'run' | null (the bind pose, which is the A-pose every piece was fitted in)
   fig.update(dt)           advances the clip; call once a frame
   fig.headWorld(v3)        the head joint's world position (for a face camera)
   fig.slotMeshes(id, slot) a lone copy of one outfit's slot, for a thumbnail
   The bones are built from skeleton.json, not taken from a GLB, so every piece binds to the same objects. Each piece keeps
   its own Skeleton (same bones, its own inverse bind matrices): the pose's skin scale s[i] is folded in as
   boneInverses[i] = S(s[i]) * IBM[i], so it scales only that joint's vertices, in its own frame, and is not inherited.
*/
function KCharFigure(data, gltfs){
  var self = this, skel = data.skeleton, J = skel.joints;
  this.data = data;
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

  /* the pieces: per outfit, per mesh name, the geometry, material and inverse bind matrices in skeleton.json order */
  var pieces = {};
  data.outfits.outfits.forEach(function(o){
    var g = gltfs[o.id]; if(!g) return;
    pieces[o.id] = {};
    g.scene.traverse(function(m){
      if(!m.isSkinnedMesh) return;
      var ibm = J.map(function(){ return new THREE.Matrix4(); });
      m.skeleton.bones.forEach(function(b, k){ var i = byName[b.name]; if(i !== undefined) ibm[i].copy(m.skeleton.boneInverses[k]); });
      pieces[o.id][m.name] = { geometry:m.geometry, material:m.material, ibm:ibm };
    });
  });
  this.pieces = pieces;
  var live = {};          // 'outfit|mesh' -> SkinnedMesh, made on first use
  this.live = live;

  this.mixer = new THREE.AnimationMixer(this.inner);
  this.clips = {};
  (gltfs.anims ? gltfs.anims.animations : []).forEach(function(c){ self.clips[c.name] = c; });
  this.action = null;
  this.pose = KCHAR.pose(skel, data.sliders, {});

  function mesh(outfit, name){
    var key = outfit + '|' + name;
    if(live[key]) return live[key];
    var p = pieces[outfit] && pieces[outfit][name]; if(!p) return null;
    var mat = p.material.clone();
    var m = new THREE.SkinnedMesh(p.geometry, mat);
    m.name = key; m.frustumCulled = false; m.castShadow = true;
    m.userData = { outfit:outfit, slot:name.split('~')[0], ibm:p.ibm };
    m.bind(new THREE.Skeleton(bones, p.ibm.map(function(x){ return x.clone(); })), new THREE.Matrix4());
    self.inner.add(m);
    live[key] = m;
    return m;
  }

  var S = new THREE.Matrix4();
  function skinScale(m, pose){
    var inv = m.skeleton.boneInverses, ibm = m.userData.ibm;
    for(var i=0;i<inv.length;i++){ var s = pose.s[i]; inv[i].copy(S.makeScale(s[0], s[1], s[2]).multiply(ibm[i])); }
  }

  this.apply = function(rec){
    self.record = rec;
    var vis = KCHAR.visible(rec, data.outfits), want = {};
    vis.forEach(function(v){ var m = mesh(v.outfit, v.mesh); if(m) want[m.name] = m; });
    Object.keys(live).forEach(function(k){ live[k].visible = !!want[k]; });
    var head = data.outfits.outfits.filter(function(o){ return o.id === rec.slots.head; })[0];
    var p = self.pose = KCHAR.pose(skel, data.sliders, rec.sliders, head && head.face);
    bones.forEach(function(b, i){ if(b !== self.hips) b.position.fromArray(p.t[i]); });
    self.inner.scale.setScalar(p.root);
    Object.keys(want).forEach(function(k){
      var m = want[k]; skinScale(m, p);
      var dye = rec.dye && rec.dye[m.userData.slot];
      m.material.color.set(dye || '#ffffff');
    });
    if(!self.action) self.restPose();
  };

  this.restPose = function(){
    bones.forEach(function(b, i){ b.quaternion.fromArray(J[i].r); });
    self.hips.position.fromArray(self.pose.t[byName.Hips]);
    self.hips.position.y += self.pose.lift;
  };

  this.play = function(name){
    var c = name && self.clips[name];
    if(self.action){ self.action.fadeOut(0.25); }
    if(!c){ self.action = null; self.mixer.stopAllAction(); self.restPose(); return; }
    var a = self.mixer.clipAction(c); a.reset().fadeIn(self.action ? 0.25 : 0).play();
    self.action = a;
  };

  this.update = function(dt){
    if(!self.action) return;
    self.mixer.update(dt);
    /* the clips move the hips for Styv's legs; longer or shorter legs lift or drop them */
    self.hips.position.y += self.pose.lift;
  };

  this.headWorld = function(v){ return self.headBone.getWorldPosition(v); };

  /* one outfit's slot on its own, posed like the figure, for a thumbnail: a throwaway group sharing nothing that moves */
  this.slotMeshes = function(outfit, slot){
    var p = pieces[outfit] && pieces[outfit][slot]; if(!p) return null;
    var m = new THREE.Mesh(p.geometry, p.material);
    return m;
  };
}
