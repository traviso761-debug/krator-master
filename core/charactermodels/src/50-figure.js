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
      if(s.morphTargetDictionary) m.morphTargetDictionary = Object.assign({}, s.morphTargetDictionary);   // its own targets by name (a lid's blink)
      if(m.material.alphaTest > 0) m.material.onBeforeCompile = opaqueCutout;
      if(kit.tint && kit.tint.roles[s.material.name] === 'eye') irisTint(m.material);
      m.name = id; m.frustumCulled = false; m.castShadow = true;
      m.userData = { part:part, ibm:ibm, index0:geo.index ? geo.index.array.slice() : null, srcMaterial:s.material.name };
      m.bind(new THREE.Skeleton(bones.concat(extra), ibm.map(function(x){ return x.clone(); })), new THREE.Matrix4());
      if(cl) cl.meshes.push(m);
      if(part.role === 'armour' && (part.slot === 'torso' || part.slot === 'legs')){
        var it0 = itemByKey[part.key] || {};
        var slot0 = it0.over || part.slot;      // pteruges push as the top they hang over does
        var l0 = it0.loose ? 1 : (it0.cloth && it0.cloth.parts && it0.cloth.parts[0] && it0.cloth.parts[0].layer >= 4 ? 0.25 : 0);
        m.userData.pad = pushOut(m.material, it0.loose ? (slot0 === 'torso' ? PAD_TOP : PAD_SKIRT) : 0, l0, slot0 === 'legs');
        m.userData.pad.slit.value = it0.cloth ? it0.cloth.parts.reduce(function(s, q){ return q.slit == null ? s : Math.max(s, q.slit); }, -1) : -1;
        geo.computeBoundingBox(); m.userData.hem0 = m.userData.pad.hem.value = geo.boundingBox.min.y;
        m.userData.pad.only.value = it0.loose && !it0.cloth ? 1 : 0;
      } else if(part.role === 'armour' && part.slot === 'feet') pushOut(m.material, 0, false, false, true);   // boots: the squeeze only
      if(part.role === 'armour' || part.role === 'mod') furShells(m, itemByKey[part.key]);
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

  /* ---- fur (data/fur.json; kit items' fur, make_garments.py fur_of, tools/fur.py) ----
     a garment's fur rows ([v0, v1, kind, mu, mv]: rows of its texture, the kind, the metres a unit of u and of v spans)
     drawn as shells: fur.layers copies of the triangles in those rows, children of the garment so they show and hide
     with it, sharing its attributes (the morphs, summed on the CPU, carry over) and its skeleton. Layer k of n stands
     k/n of the pile out along the skinned normal, after the push, its tips combed down (comb * pile * t^2), and keeps
     only the texels a strand passes through: strands on a grid of 'strand' metres in u and v (a whole number across u,
     so a tube's seam meets itself), each jittered in its cell, of its own length (clump), tapering to its tip. The
     roots are shaded (shade), the tips lit (tip) and each strand a little lighter or darker (vary); the colour is the
     garment's own (its texture, its dye). Godot: kchar_fur.gdshader, kchar_figure.gd _fur */
  // the way the tips lean: down (garments, coats); back along a head (a therian's: its fur lies from the nose to the
  // nape; combed down it stood up on the crown)
  var COMB_DOWN = new THREE.Vector3(0, -1, 0), COMB_BACK = new THREE.Vector3(0, -0.45, -0.9).normalize();
  var FUR_GLSL = 'vec3 kfHash(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }\n';
  function furShells(m, it){
    var F = KCharFigure.fur, rows = it && it.fur;
    if(!F || !rows || !rows.length) return;
    var scale = F.items && F.items[it.id] && F.items[it.id].pile != null ? F.items[it.id].pile : 1;
    if(!(scale > 0)) return;
    var n = F.layers == null ? 12 : F.layers, uv = m.geometry.attributes.uv, i0 = m.userData.index0;
    if(!uv || !i0) return;
    // a piece that carries its own cover and metres per UV (TEXCOORD_1: a therian's head, tools/heads.py) runs as a coat
    // does, its strands on its UV scaled per vertex; rows only pick the triangles
    var piece = m.geometry.attributes.uv2 ? 'uv2' : false;
    var byKind = {}, band = m.userData.furBand = { value:new THREE.Vector2(-1e3, 1e3) };
    rows.forEach(function(r){ if(F.kinds[r[2]]) (byKind[r[2]] = byKind[r[2]] || []).push(r); });
    Object.keys(byKind).forEach(function(kind){
      var K = F.kinds[kind], rs = byKind[kind].slice(0, 4), pile = K.pile * scale, idx = [], nk = piece && K.layers ? K.layers : n;
      // the triangles with a corner in the rows (a band's edge is cut in the shader)
      for(var t=0;t<i0.length;t+=3){
        for(var c=0;c<3;c++){
          var v = uv.getY(i0[t + c]);
          if(rs.some(function(r){ return v >= r[0] - 0.002 && v <= r[1] + 0.002; })){ idx.push(i0[t], i0[t+1], i0[t+2]); break; }
        }
      }
      if(!idx.length) return;
      var geo = new THREE.BufferGeometry();
      Object.keys(m.geometry.attributes).forEach(function(a){ geo.setAttribute(a, m.geometry.attributes[a]); });
      geo.setIndex(idx);
      // the garment's own shader changes (pushOut, opaqueCutout) carry over, keyed by its program
      var own = m.material.hasOwnProperty('onBeforeCompile'), key0 = own && m.material.customProgramCacheKey ? m.material.customProgramCacheKey() : 'own';
      var R = [0, 1, 2, 3].map(function(k){ var r = rs[k] || [2, 2, 0, 0]; return new THREE.Vector4(r[0], r[1], r[3], r[4]); });
      for(var k=1;k<=nk;k++){
        var tk = k / nk, mat = new THREE.MeshStandardMaterial({ map:m.material.map, roughness:1, metalness:0, side:THREE.DoubleSide, skinning:true,
                                                                 vertexColors:!!m.material.vertexColors });
        if(!m.material.map) mat.defines = { USE_UV:'' };
        mat.color = m.material.color;       // the same Color: apply()'s dye and tint reach the shells
        mat.onBeforeCompile = furShader(own ? m.material.onBeforeCompile : null, {
          kfH:{ value:pile * tk }, kfC:{ value:(K.comb || 0) * pile * tk * tk }, kfT:{ value:tk }, kfR:{ value:R },
          kfS:{ value:K.strand }, kfW:{ value:K.thick }, kfL:{ value:K.clump || 0 }, kfSh:{ value:K.shade == null ? 1 : K.shade },
          kfTp:{ value:K.tip == null ? 1 : K.tip }, kfV:{ value:K.vary || 0 }, kfF:band, kfU0:{ value:k === 1 && K.undercoat ? 1 : 0 },
          kfDir:{ value:piece ? COMB_BACK : COMB_DOWN } }, piece);
        mat.customProgramCacheKey = own ? function(){ return 'kchar-fur-' + key0 + (piece || ''); } : function(){ return 'kchar-fur' + (piece || ''); };
        var s = new THREE.SkinnedMesh(geo, mat);
        s.name = m.name + '|fur:' + kind + ':' + k; s.frustumCulled = false; s.castShadow = false;
        s.bind(m.skeleton, new THREE.Matrix4());
        s.userData.fur = true; s.userData.index0 = idx;
        m.add(s);
      }
    });
  }
  // body: 'coat', a coat's shells (coatShells): each vertex's cover (furK, under 1 thins the strands) and the metres one
  // unit of its UV spans (furM) are attributes, and the strands run on the body's UV map scaled by them, rather than in
  // rows; 'uv2', a piece's own (a therian's head): its second UV the fur's density and its length (of the pile), its
  // strands' UV in metres (tools/heads.py)
  function furShader(prev, U, body){
    return function(sh, r){
      if(prev) prev(sh, r);              // the push (pushOut) first: the fur stands on the cloth where it is pushed to
      Object.keys(U).forEach(function(k){ sh.uniforms[k] = U[k]; });
      // (kfF: a legs item's fur fades out below the top of the boots over it and above the hem of the top over it, kfK:
      // tucked in, it came out through the boots' shafts, and through a deel's skirt in a stride. position is the rest,
      // after the morphs, as the boots' top and the hem are)
      sh.vertexShader = 'uniform float kfH;\nuniform float kfC;\nuniform vec2 kfF;\nuniform vec3 kfDir;\nvarying float kfK;\n' +
        (body === 'uv2' ? 'attribute vec2 uv2;\nvarying float kfM;\n' : body ? 'attribute float furK;\nattribute float furM;\nvarying float kfM;\n' : '') + sh.vertexShader.replace('#include <project_vertex>',
        'vec3 kfN = normalize(objectNormal), kfD = kfDir;\n\tkfD -= kfN * dot(kfD, kfN);\n\tfloat kfLn = 1.0;\n' +
        (body === 'uv2' ? '\tkfK = uv2.x; kfLn = uv2.y; kfM = 1.0;\n' : body ? '\tkfK = furK; kfM = furM;\n' : '\tkfK = smoothstep(kfF.x, kfF.x + 0.03, position.y) * (1.0 - smoothstep(kfF.y - 0.03, kfF.y, position.y));\n') +
        '\ttransformed += (kfN * kfH + kfD * kfC) * (' + (body === 'uv2' ? 'kfLn' : 'kfK') + ');\n#include <project_vertex>');
      sh.fragmentShader = 'varying float kfK;\nuniform float kfT;\nuniform vec4 kfR[4];\nuniform float kfS;\nuniform float kfW;\nuniform float kfL;\nuniform float kfSh;\nuniform float kfTp;\nuniform float kfV;\n' +
        (body ? 'varying float kfM;\nuniform float kfU0;\n' : '') + FUR_GLSL + sh.fragmentShader.replace('#include <map_fragment>',
        (body ? 'if(kfK < 0.05) discard;\n\tfloat kfU = 1e6;\n\tvec4 kfR0 = vec4(0.0);\n\tvec2 kfG = vUv * kfM / kfS' :
        'vec4 kfR0 = vec4(0.0); bool kfIn = false;\n' +
        '\tfor(int i = 0; i < 4; i++){ if(!kfIn && vUv.y >= kfR[i].x && vUv.y <= kfR[i].y){ kfIn = true; kfR0 = kfR[i]; } }\n' +
        '\tif(!kfIn || kfK < 0.05) discard;\n' +
        '\tfloat kfU = max(1.0, floor(kfR0.z / kfS + 0.5));\n' +
        '\tvec2 kfG = vec2(vUv.x * kfU, vUv.y * kfR0.w / kfS)') + ', kfC0 = floor(kfG), kfFr = fract(kfG);\n' +
        '\tfloat kfD0 = 1e9, kfLen = 1.0, kfTone = 1.0, kfP = 0.0;\n' +
        '\tfor(int j = -1; j <= 1; j++) for(int i = -1; i <= 1; i++){\n' +
        '\t\tvec2 o = vec2(float(i), float(j)), cc = kfC0 + o; cc.x = mod(cc.x, kfU);\n' +
        '\t\tvec3 h = kfHash(vec3(cc, kfR0.x * 1024.0));\n' +
        '\t\tfloat d = length(o + 0.15 + 0.7 * h.xy - kfFr);\n' +
        '\t\tif(d < kfD0){ kfD0 = d; kfLen = 1.0 - kfL * h.z; kfTone = 1.0 + kfV * (fract(h.z * 7.13) - 0.5); kfP = fract(h.x * 5.37 + h.y * 3.11); }\n\t}\n' +
        // (a cover under 1 keeps that share of the strands)
        (body ? '\tif(!(kfU0 > 0.5 && kfK > 0.6) && (kfT > kfLen || kfD0 > 0.5 * kfW * (1.0 - kfT / kfLen) || kfP > kfK)) discard;\n' :
        '\tif(kfT > kfLen || kfD0 > 0.5 * kfW * (1.0 - kfT / kfLen)) discard;\n') +
        '#include <map_fragment>\n\tdiffuseColor.rgb *= mix(kfSh, kfTp, kfT) * kfTone;');
    };
  }

  /* ---- coats: a furred body (data/fur.json coats, a record's coat) ----
     the skin's fur, as shells of the base's skin primitive (furShader body). Each vertex's cover is its joints' covers
     summed by its skin weights (the joint's name without its side; 'fingers' for any finger, '*' for the rest), less
     the parts left bare, found in the rest pose: the face (an ellipse on the head's front; or in it only the eyes and
     the mouth, for a furred face), the palms (the hands'
     undersides, the A-pose's palms face down) and the soles. The shells take the skin the clothes leave (filterBase)
     and fade in over COAT_FADE rings of it from what is hidden, so the pile stops short of a garment's edge. The
     colour is the hair's; where the cover is dense a kind with undercoat has its first layer whole ( the skin between the strands
     made the pelt read as speckle) and the coat hides the skin's parts it lists (hide_parts: the nipples showed through).
     A UV seam splits vertices; the rings run through the source vertices so it does not show */
  // the eyes and the mouth on the face's ellipse (x, y of a centre, its half-width and half-height, in the ellipse's units)
  var EYE = [0.42, 0.48, 0.3, 0.22], MOUTH = [0, -0.3, 0.4, 0.2];
  var COAT_FADE = 3, FINGER = /^Hand(Index|Middle|Pinky|Ring|Thumb)/;
  function coverOf(coat, j){
    var n = J[j] ? J[j].name.replace(/^(Left|Right)2?/, '') : '', c = coat.cover || {};
    if(c[n] != null) return c[n];
    if(FINGER.test(n) && c.fingers != null) return c.fingers;
    return c['*'] == null ? 1 : c['*'];
  }
  function smooth(a, b, x){ var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function coatBuild(m, id, coat, K){
    var g = m.geometry, M = m.userData.morph, P = M ? M.pos0 : g.attributes.position.array;
    var Nn = M && M.nrm0 ? M.nrm0 : g.attributes.normal.array, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
    var uv = g.attributes.uv, n = P.length / 3, C = new Float32Array(n), hw = new Float32Array(n), aw = new Float32Array(n), fw = new Float32Array(n);
    var bare = {}; (coat.bare || []).forEach(function(b){ bare[b] = true; });
    var y0 = Infinity, y1 = -Infinity, x0 = Infinity, x1 = -Infinity, zs = 0, zn = 0;
    for(var i=0;i<n;i++){
      for(var k=0;k<4;k++){
        var j = si.getComponent ? si.getComponent(i, k) : si.array[4 * i + k], w = sw.array[4 * i + k];
        if(!w) continue;
        C[i] += w * coverOf(coat, j);
        var nm = J[j] ? J[j].name.replace(/^(Left|Right)2?/, '') : '';
        if(nm === 'Head') hw[i] += w;
        else if(nm === 'Hand' || FINGER.test(nm)) aw[i] += w;
        else if(nm === 'Foot' || nm === 'ToeBase') fw[i] += w;
      }
      if(hw[i] > 0.5){ y0 = Math.min(y0, P[3*i+1]); y1 = Math.max(y1, P[3*i+1]); x0 = Math.min(x0, P[3*i]); x1 = Math.max(x1, P[3*i]); zs += P[3*i+2]; zn++; }
    }
    // the face: an ellipse on the head's front, from the chin to the brow and three fifths of the head's width
    // (by the normal alone the eye sockets and the sides of the nose kept fur, and it hung over the eyes)
    var zc = zn ? zs / zn : 0, xc = (x0 + x1) / 2, hh = Math.max(y1 - y0, 1e-6), fy = y0 + 0.37 * hh, ay = 0.37 * hh, ax = 0.3 * (x1 - x0);
    for(i=0;i<n;i++){
      var ny = Nn[3*i+1], f = 0;
      if(hw[i] > 0 && P[3*i+2] > zc){
        var ex = (P[3*i] - xc) / ax, ey = (P[3*i+1] - fy) / ay;
        if(bare.face) f = Math.max(f, hw[i] * (1 - smooth(0.85, 1.15, Math.sqrt(ex * ex + ey * ey))));
        // a furred face's eyes and mouth (a coyote's): small ellipses in the face's own measure
        if(bare.eyes) f = Math.max(f, hw[i] * (1 - smooth(0.8, 1.2, Math.min(Math.hypot((ex - EYE[0]) / EYE[2], (ey - EYE[1]) / EYE[3]),
                                                                             Math.hypot((ex + EYE[0]) / EYE[2], (ey - EYE[1]) / EYE[3])))));
        if(bare.mouth) f = Math.max(f, hw[i] * (1 - smooth(0.8, 1.2, Math.hypot((ex - MOUTH[0]) / MOUTH[2], (ey - MOUTH[1]) / MOUTH[3]))));
      }
      if(bare.palms) f = Math.max(f, aw[i] * smooth(0.1, 0.45, -ny));
      if(bare.soles) f = Math.max(f, fw[i] * smooth(0.3, 0.6, -ny));
      C[i] = Math.min(1, Math.max(0, C[i] * (1 - f)));
    }
    // the metres one unit of UV spans at each vertex: its triangles' edges in metres over their length in UV
    var i0 = m.userData.index0, mm = new Float32Array(n), mc = new Float32Array(n), U = uv.array;
    for(var t=0;t<i0.length;t+=3){
      var l3 = 0, l2 = 0;
      for(k=0;k<3;k++){
        var a = i0[t + k], b = i0[t + (k + 1) % 3];
        l3 += Math.hypot(P[3*a] - P[3*b], P[3*a+1] - P[3*b+1], P[3*a+2] - P[3*b+2]);
        l2 += Math.hypot(U[2*a] - U[2*b], U[2*a+1] - U[2*b+1]);
      }
      if(l2 > 1e-9) for(k=0;k<3;k++){ mm[i0[t + k]] += l3 / l2; mc[i0[t + k]]++; }
    }
    for(i=0;i<n;i++) mm[i] = mc[i] ? mm[i] / mc[i] : 1;
    // the source vertices' neighbours, for the rings
    var src = M ? M.src : null, ns = M ? M.nsrc : n, nb = [];
    for(i=0;i<ns;i++) nb.push([]);
    for(t=0;t<i0.length;t+=3) for(k=0;k<3;k++){
      var p = src ? src[i0[t + k]] : i0[t + k], q = src ? src[i0[t + (k + 1) % 3]] : i0[t + (k + 1) % 3];
      if(nb[p].indexOf(q) < 0){ nb[p].push(q); nb[q].push(p); }
    }
    var geo = new THREE.BufferGeometry();
    Object.keys(g.attributes).forEach(function(a){ geo.setAttribute(a, g.attributes[a]); });
    geo.setAttribute('furK', new THREE.BufferAttribute(new Float32Array(n), 1));
    geo.setAttribute('furM', new THREE.BufferAttribute(mm, 1));
    var F = KCharFigure.fur, layers = K.layers || F.layers || 12, group = new THREE.Group(), color = new THREE.Color();
    for(var L=1;L<=layers;L++){
      var tk = L / layers, mat = new THREE.MeshStandardMaterial({ roughness:1, metalness:0, side:THREE.DoubleSide, skinning:true });
      mat.color = color; mat.defines = { USE_UV:'' };
      mat.onBeforeCompile = furShader(null, {
        kfH:{ value:K.pile * tk }, kfC:{ value:(K.comb || 0) * K.pile * tk * tk }, kfT:{ value:tk }, kfR:{ value:[0, 1, 2, 3].map(function(){ return new THREE.Vector4(); }) },
        kfS:{ value:K.strand }, kfW:{ value:K.thick }, kfL:{ value:K.clump || 0 }, kfSh:{ value:K.shade == null ? 1 : K.shade },
        kfTp:{ value:K.tip == null ? 1 : K.tip }, kfV:{ value:K.vary || 0 }, kfF:{ value:new THREE.Vector2() }, kfU0:{ value:L === 1 && K.undercoat ? 1 : 0 },
        kfDir:{ value:COMB_DOWN } }, 'coat');
      mat.customProgramCacheKey = function(){ return 'kchar-coat'; };
      var s = new THREE.SkinnedMesh(geo, mat);
      s.name = m.name + '|coat:' + id + ':' + L; s.frustumCulled = false; s.castShadow = false;
      s.bind(m.skeleton, new THREE.Matrix4());
      s.userData.fur = true;
      group.add(s);
    }
    m.add(group);
    return { id:id, C:C, src:src, nb:nb, ns:ns, geo:geo, group:group, color:color };
  }
  function coatEdge(rec){
    var furred = KCHAR.mods(rec, kit).filter(function(x){ return x.furred; }).map(function(x){ return x.id; });
    if(!furred.length) return null;
    return KCHAR.hidden(Object.assign({}, rec, { mods:(rec.mods || []).filter(function(id){ return furred.indexOf(id) < 0; }) }), kit).base;
  }
  function coatHides(rec){
    var F = KCharFigure.fur, c = F && F.coats && rec.coat ? F.coats[rec.coat] : null, out = {};
    ((c && c.hide_parts) || []).forEach(function(p){ out[p] = true; });
    return out;
  }
  function coatShells(m, rec, gain, hide, edge){
    var F = KCharFigure.fur, coat = F && F.coats && rec.coat ? F.coats[rec.coat] : null, S = m.userData.coat;
    var K = coat && F.kinds[coat.kind];
    if(S && (!K || S.id !== rec.coat)){ m.remove(S.group); S = m.userData.coat = null; }
    if(!K) return;
    if(!S) S = m.userData.coat = coatBuild(m, rec.coat, coat, K);
    // the rings from the hidden skin: 0 on a hidden triangle's corners, counting out through what shows
    var i0 = m.userData.index0, d = new Float32Array(S.ns).fill(Infinity), front = [], k, t;
    var sv = function(v){ return S.src ? S.src[v] : v; };
    // (edge: the hide without a furred mod's, whose head carries the fur on: no bare ring at the neck)
    edge = edge || hide;
    if(edge) for(t=0;t<i0.length/3;t++) if(edge[t]) for(k=0;k<3;k++){ var v = sv(i0[3*t+k]); if(d[v]) { d[v] = 0; front.push(v); } }
    for(var r=1;r<=COAT_FADE && front.length;r++){
      var next = [];
      front.forEach(function(v){ S.nb[v].forEach(function(q){ if(d[q] > r){ d[q] = r; next.push(q); } }); });
      front = next;
    }
    var A = S.geo.attributes.furK, n = S.C.length, idx = [];
    for(var i=0;i<n;i++) A.array[i] = S.C[i] * Math.min(1, d[sv(i)] / COAT_FADE);
    A.needsUpdate = true;
    for(t=0;t<i0.length/3;t++){
      if(hide && hide[t]) continue;
      if(A.array[i0[3*t]] > 0 || A.array[i0[3*t+1]] > 0 || A.array[i0[3*t+2]] > 0) idx.push(i0[3*t], i0[3*t+1], i0[3*t+2]);
    }
    S.geo.setIndex(idx);
    // the hair's colour, or (ink under 1) that far from the skin's toward it
    var ink = K.ink == null ? 1 : K.ink;
    S.color.copy(tintOf(rec.hair_color || DEFAULT_HAIR, gain.hair || 1));
    if(ink < 1) S.color.lerp(tintOf(rec.skin || DEFAULT_SKIN, gain.skin || 1).clone(), 1 - ink);
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

  /* a frog's skin in the record's colours (kit item pattern; tools/amphibian.py): kpC1 the skin, kpC2 the marks, kpC3
     the pale parts; the pattern's fields R (spots), G (a net), B (marbling) and the pale share A per vertex on the head's
     pieces (COLOR_0, a shade in TEXCOORD_1) or from the body's pattern texture at the skin's own UVs (kpMask); kpKind
     picks the field (0 none, 1 spots, 2 net, 3 marble), kpAmt how much of the skin the marks take. kpOn 0 leaves the
     material as it was (the base skin without a frog's head). The twin of kchar_pattern.gdshader and kchar_skin.gdshader */
  var KP_KIND = { none:0, spots:1, net:2, marble:3 };
  function patternMat(mat, fromMask){
    if(mat.userData.kp) return mat.userData.kp;
    var u = mat.userData.kp = { kpC1:{ value:new THREE.Color() }, kpC2:{ value:new THREE.Color() }, kpC3:{ value:new THREE.Color() },
                                kpKind:{ value:0 }, kpAmt:{ value:0.4 }, kpOn:{ value:0 }, kpMask:{ value:null } };
    if(!fromMask) mat.vertexColors = false;      // COLOR_0 is the pattern, not a colour
    mat.onBeforeCompile = function(sh){
      Object.keys(u).forEach(function(k){ sh.uniforms[k] = u[k]; });
      sh.vertexShader = (fromMask ? '' : 'attribute vec4 color;\nattribute vec2 uv2;\n') + 'varying vec4 vKpM;\nvarying float vKpS;\nvarying vec2 vKpUv;\n' +
        sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' +
          (fromMask ? '\tvKpUv = uv; vKpM = vec4(0.0); vKpS = 1.0;' : '\tvKpM = color; vKpS = uv2.x; vKpUv = uv;'));
      sh.fragmentShader = 'uniform vec3 kpC1;\nuniform vec3 kpC2;\nuniform vec3 kpC3;\nuniform float kpKind;\nuniform float kpAmt;\nuniform float kpOn;\n' +
        'uniform sampler2D kpMask;\nvarying vec4 vKpM;\nvarying float vKpS;\nvarying vec2 vKpUv;\n' +
        sh.fragmentShader.replace('#include <color_fragment>', ['#include <color_fragment>',
          '\tif(kpOn > 0.5){',
          fromMask ? '\t\tvec4 pm = texture2D(kpMask, vKpUv);' : '\t\tvec4 pm = vKpM;',
          '\t\tfloat m = 0.0;',
          '\t\tif(kpKind > 0.5 && kpKind < 1.5) m = 1.0 - smoothstep(0.6 * kpAmt, 0.6 * kpAmt + 0.05, pm.r);',
          '\t\telse if(kpKind > 1.5 && kpKind < 2.5) m = 1.0 - smoothstep(0.3 * kpAmt, 0.3 * kpAmt + 0.04, pm.g);',
          '\t\telse if(kpKind > 2.5) m = smoothstep(1.0 - kpAmt - 0.04, 1.0 - kpAmt + 0.04, pm.b);',
          '\t\tdiffuseColor.rgb *= mix(mix(kpC1, kpC2, m), kpC3, pm.a) * vKpS;',
          '\t}'].join('\n'));
    };
    mat.customProgramCacheKey = function(){ return fromMask ? 'kp-mask' : 'kp-vertex'; };
    mat.needsUpdate = true;
    return u;
  }
  // a colour held to a palette (kit item pattern palette: the frogmen's greens, browns, red-browns and creams, black
  // marks): the nearest of its entries, or the colour itself where there is none
  var snapA = new THREE.Color(), snapB = new THREE.Color();
  function snap(hex, list){
    if(!list || !list.length || !hex) return hex;
    snapA.set(hex);
    var best = list[0], bd = 1e9;
    list.forEach(function(c){ snapB.set(c); var d = Math.pow(snapA.r - snapB.r, 2) + Math.pow(snapA.g - snapB.g, 2) + Math.pow(snapA.b - snapB.b, 2); if(d < bd){ bd = d; best = c; } });
    return best;
  }
  // the record's skin colours under a patterned head: its own where it names them, the kit item's defaults otherwise,
  // each held to the item's palette
  function patternColours(rec, pat){
    var pal = pat.palette || {};
    return { skin:snap(rec.skin || DEFAULT_SKIN, pal.skin), skin2:snap(rec.skin2 || pat.skin2, pal.skin2), skin3:snap(rec.skin3 || pat.skin3, pal.skin3) };
  }
  // the pattern's uniforms from the record, the kit item's defaults where it names none
  function patternSet(u, rec, pat, gain, mask){
    var pc = patternColours(rec, pat);
    u.kpC1.value.copy(tintOf(pc.skin, gain.skin || 1));
    u.kpC2.value.copy(tintOf(pc.skin2, gain.skin || 1));
    u.kpC3.value.copy(tintOf(pc.skin3, gain.skin || 1));
    u.kpKind.value = KP_KIND[rec.pattern || pat.kind] || 0;
    u.kpAmt.value = rec.pattern_amount != null ? rec.pattern_amount : pat.amount;
    if(mask !== undefined) u.kpMask.value = mask;
    u.kpOn.value = 1;
  }

  /* ---- Face Paint & Makeup (rec.facepaint, rec.makeup) on the MakeHuman base skin mesh ---- */
  var FP_KIND = {
    none:0, woad_raider:1, eternian_court:2, voth_jaguar:3, skull_visage:4,
    tear_blades:5, shaman_dots:6, chichani_drow:7, half_split:8, jaw_fangs:9, cyber_circuit:10,
    opera_swirl:11, war_tears:12, harlequin_geo:13, labyrinth_mandala:14, frost_raider:15,
    island_boar:16, ghost_stripes:17, teal_chevron:18, sky_cat_stripes:19, ash_gold_pillar:20,
    seeker_chevrons:21, ochre_y_smudge:22, handprint_visor:23, lotus_tendrils:24, ancestral_comb:25,
    half_spiral_fret:26, blackwork_triskelion:27, maya_temple_fret:28, halo_star_dots:29, marigold_skull:30
  };
  var EYE_MAKEUP_KIND = { none:0, kohl:1, winged:2, smoky:3, court_gold:4, gothic:5 };
  function faceCosmeticsInit(m){
    var g = m.geometry, mat = m.material, isLips = m.userData.srcMaterial === 'Human.lips';
    if(!g.attributes.aFaceCoord){
      var M = m.userData.morph, P = M ? M.pos0 : g.attributes.position.array;
      var si = g.attributes.skinIndex, sw = g.attributes.skinWeight, n = P.length / 3;
      var sc = SCALE || 1, rx = 0.072 * sc, ry = 0.085 * sc;
      var ny, nz;
      if(n > 5250){
        ny = P[3 * 5250 + 1]; nz = P[3 * 5250 + 2];
        self.noseRef = { ny:ny, nz:nz };
      } else if(self.noseRef){
        ny = self.noseRef.ny; nz = self.noseRef.nz;
      } else {
        ny = (kit.body === 'mpfb_female' ? 1.4486 : 1.6238) * sc;
        nz = (kit.body === 'mpfb_female' ? 0.1485 : 0.1685) * sc;
      }
      var fc = new Float32Array(4 * n);
      for(var i = 0; i < n; i++){
        var hw = 0;
        if(isLips) hw = 1;
        else if(si && sw){
          for(var k = 0; k < 4; k++){
            var j = si.getComponent ? si.getComponent(i, k) : si.array[4 * i + k], w = sw.array[4 * i + k];
            if(w && J[j] && (J[j].name === 'Head' || J[j].name === 'Neck')) hw += w;
          }
        } else hw = 1;
        var fx = P[3 * i] / rx, fy = (P[3 * i + 1] - ny) / ry, fz = (P[3 * i + 2] - nz) / ry;
        var mask = 0;
        if(isLips) mask = 1;
        else if(hw > 0.25 && fz > -0.95 && fy > -0.78 && fy < 1.26 && Math.abs(fx) < 1.05){
          var mz = smooth(-0.90, -0.42, fz);
          var myBot = smooth(-0.72, -0.52, fy - 0.32 * fx * fx);
          var myTop = 1 - smooth(0.96, 1.20, fy + 0.15 * fx * fx);
          var mx = 1 - smooth(0.86, 1.02, Math.abs(fx));
          mask = hw * mz * myBot * myTop * mx;
        }
        fc[4 * i] = fx; fc[4 * i + 1] = fy; fc[4 * i + 2] = fz; fc[4 * i + 3] = mask;
      }
      g.setAttribute('aFaceCoord', new THREE.BufferAttribute(fc, 4));
    }
    if(mat.userData.kfc) return mat.userData.kfc;
    var u = mat.userData.kfc = {
      kfcOn:{ value:0 }, kfcIsLips:{ value:isLips ? 1 : 0 },
      kfcFpKind:{ value:0 }, kfcFpAmt:{ value:0 },
      kfcFpC1:{ value:new THREE.Color('#2b5b84') }, kfcFpC2:{ value:new THREE.Color('#e8e2d5') },
      kfcLipAmt:{ value:0 }, kfcLipCol:{ value:new THREE.Color('#a82438') },
      kfcEyeKind:{ value:0 }, kfcEyeAmt:{ value:0 }, kfcEyeCol:{ value:new THREE.Color('#1c1824') },
      kfcBlushAmt:{ value:0 }, kfcBlushCol:{ value:new THREE.Color('#c85a64') }
    };
    var prev = mat.onBeforeCompile;
    mat.onBeforeCompile = function(sh, r){
      if(prev && prev !== mat.onBeforeCompile) prev(sh, r);
      Object.keys(u).forEach(function(k){ sh.uniforms[k] = u[k]; });
      sh.vertexShader = 'attribute vec4 aFaceCoord;\nvarying vec4 vFaceCoord;\n' +
        sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvFaceCoord = aFaceCoord;');
      var fragHead = [
        'varying vec4 vFaceCoord;',
        'uniform float kfcOn, kfcIsLips, kfcFpKind, kfcFpAmt, kfcLipAmt, kfcEyeKind, kfcEyeAmt, kfcBlushAmt;',
        'uniform vec3 kfcFpC1, kfcFpC2, kfcLipCol, kfcEyeCol, kfcBlushCol;'
      ].join('\n') + '\n';
      var fragBody = [
        '#include <map_fragment>',
        '\tif(kfcOn > 0.5 && vFaceCoord.w > 0.005){',
        '\t\tfloat fx = vFaceCoord.x, afx = abs(fx), fy = vFaceCoord.y, fz = vFaceCoord.z, fm = clamp(vFaceCoord.w, 0.0, 1.0);',
        '\t\tfloat luma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));',
        '\t\tvec3 shade = clamp(diffuseColor.rgb / max(luma, 0.08), 0.55, 1.45) * (0.35 + 0.65 * clamp(luma * 1.4, 0.0, 1.2));',
        '\t\t// 1. Face Paint (15 procedural styles)',
        '\t\tif(kfcFpKind > 0.5 && kfcFpAmt > 0.01){',
        '\t\t\tfloat m1 = 0.0, m2 = 0.0, m3 = 0.0;',
        '\t\t\tif(kfcFpKind < 1.5){',
        '\t\t\t\t// 1: Woad Raider War Band & Drips',
        '\t\t\t\tfloat bandY = 0.30 + 0.04 * cos(fx * 4.5);',
        '\t\t\t\tm1 = (1.0 - smoothstep(0.14, 0.21, abs(fy - bandY))) * (1.0 - smoothstep(0.76, 0.90, afx));',
        '\t\t\t\tfloat drip = (1.0 - smoothstep(0.035, 0.065, abs(afx - 0.42))) * (1.0 - smoothstep(-0.28, -0.15, -fy)) * step(fy, 0.32);',
        '\t\t\t\tm1 = max(m1, drip * 0.9);',
        '\t\t\t\tm2 = (1.0 - smoothstep(0.025, 0.05, abs(fx))) * (1.0 - smoothstep(0.45, 0.85, abs(fy - 0.65))) * step(0.42, fy);',
        '\t\t\t} else if(kfcFpKind < 2.5){',
        '\t\t\t\t// 2: Eternian Sun Disc & Cheek Stripes',
        '\t\t\t\tfloat sunD = length(vec2(fx * 1.1, (fy - 0.68) * 1.2));',
        '\t\t\t\tm1 = 1.0 - smoothstep(0.13, 0.17, sunD);',
        '\t\t\t\tm2 = (1.0 - smoothstep(0.20, 0.24, sunD)) * step(0.15, sunD);',
        '\t\t\t\tfloat cLine = fy - (-0.02 - 0.28 * (afx - 0.28));',
        '\t\t\t\tfloat inCheek = step(0.22, afx) * (1.0 - smoothstep(0.72, 0.82, afx));',
        '\t\t\t\tfloat s1 = (1.0 - smoothstep(0.024, 0.042, abs(cLine))) * inCheek;',
        '\t\t\t\tfloat s2 = (1.0 - smoothstep(0.022, 0.040, abs(cLine + 0.11))) * inCheek;',
        '\t\t\t\tm1 = max(m1, s1); m2 = max(m2, s2);',
        '\t\t\t} else if(kfcFpKind < 3.5){',
        '\t\t\t\t// 3: Voth Jaguar Bridge Bar & Rosettes',
        '\t\t\t\tfloat bar = (1.0 - smoothstep(0.04, 0.07, abs(fy - 0.14))) * (1.0 - smoothstep(0.55, 0.72, afx));',
        '\t\t\t\tvec2 g = fract(vec2(afx * 4.2, (fy + 0.4) * 3.8)) - 0.5;',
        '\t\t\t\tfloat rSpot = length(g);',
        '\t\t\t\tfloat spotZone = smoothstep(0.24, 0.36, afx) * (1.0 - smoothstep(0.75, 0.88, afx)) * smoothstep(-0.35, -0.15, fy) * (1.0 - smoothstep(0.65, 0.85, fy));',
        '\t\t\t\tm1 = max(bar, (1.0 - smoothstep(0.24, 0.32, rSpot)) * step(0.12, rSpot) * spotZone);',
        '\t\t\t\tm2 = (1.0 - smoothstep(0.10, 0.15, rSpot)) * spotZone;',
        '\t\t\t} else if(kfcFpKind < 4.5){',
        '\t\t\t\t// 4: Ritual Skull Visage',
        '\t\t\t\tfloat eyeHole = 1.0 - smoothstep(0.15, 0.21, length(vec2((afx - 0.41) * 1.15, (fy - 0.31) * 1.45)));',
        '\t\t\t\tfloat noseHole = (1.0 - smoothstep(0.0, 0.09, afx - 0.08 * clamp(0.12 - fy, 0.0, 1.0))) * smoothstep(-0.06, 0.0, fy) * (1.0 - smoothstep(0.08, 0.15, fy));',
        '\t\t\t\tfloat skullShape = (1.0 - smoothstep(0.70, 0.84, length(vec2(fx * 0.95, (fy - 0.18) * 0.85))));',
        '\t\t\t\tfloat teeth = step(0.45, cos(fx * 38.0)) * (1.0 - smoothstep(0.14, 0.20, abs(fy + 0.29))) * (1.0 - smoothstep(0.32, 0.42, afx));',
        '\t\t\t\tm1 = clamp(skullShape - eyeHole - noseHole, 0.0, 1.0) * 0.85 + teeth * 0.25;',
        '\t\t\t\tm2 = max(eyeHole, noseHole);',
        '\t\t\t} else if(kfcFpKind < 5.5){',
        '\t\t\t\t// 5: Twin Eye-Blade Vertical Strikes',
        '\t\t\t\tfloat wBlade = 0.085 * (1.0 - 0.55 * clamp((0.35 - fy) / 0.85, 0.0, 1.0));',
        '\t\t\t\tm1 = (1.0 - smoothstep(wBlade, wBlade + 0.03, abs(afx - 0.41))) * smoothstep(-0.55, -0.38, fy) * (1.0 - smoothstep(0.68, 0.82, fy));',
        '\t\t\t\tm2 = (1.0 - smoothstep(0.018, 0.035, abs(afx - 0.41))) * smoothstep(-0.48, -0.35, fy) * (1.0 - smoothstep(0.62, 0.75, fy));',
        '\t\t\t} else if(kfcFpKind < 6.5){',
        '\t\t\t\t// 6: Shamanic Brow Arc & Ritual Dots',
        '\t\t\t\tfloat arcY = 0.64 - 0.22 * fx * fx;',
        '\t\t\t\tm1 = (1.0 - smoothstep(0.035, 0.06, abs(fy - arcY))) * (1.0 - smoothstep(0.62, 0.74, afx));',
        '\t\t\t\tfloat chinStripe = (1.0 - smoothstep(0.035, 0.06, afx)) * smoothstep(-0.65, -0.55, fy) * (1.0 - smoothstep(-0.36, -0.32, fy));',
        '\t\t\t\tm1 = max(m1, chinStripe);',
        '\t\t\t\tfor(int k = 0; k < 4; k++){',
        '\t\t\t\t\tfloat dx = 0.24 + float(k) * 0.13, dy = 0.08 - float(k) * 0.05;',
        '\t\t\t\t\tm2 = max(m2, 1.0 - smoothstep(0.028, 0.045, length(vec2(afx - dx, fy - dy))));',
        '\t\t\t\t}',
        '\t\t\t} else if(kfcFpKind < 7.5){',
        '\t\t\t\t// 7: Chichani Arachnid Sigil',
        '\t\t\t\tfloat web1 = (1.0 - smoothstep(0.022, 0.042, abs(fy - (0.52 + 0.35 * sin((afx - 0.15) * 6.0))))) * step(0.15, afx) * (1.0 - smoothstep(0.75, 0.85, afx));',
        '\t\t\t\tfloat fang = (1.0 - smoothstep(0.025, 0.048, abs(afx - (0.42 - 0.18 * (0.28 - fy))))) * smoothstep(-0.22, -0.10, fy) * step(fy, 0.28);',
        '\t\t\t\tfloat browGem = 1.0 - smoothstep(0.05, 0.08, abs(fx) + abs(fy - 0.62) * 0.7);',
        '\t\t\t\tm1 = max(web1, fang); m2 = browGem;',
        '\t\t\t} else if(kfcFpKind < 8.5){',
        '\t\t\t\t// 8: Half-Face Duality Split',
        '\t\t\t\tm1 = smoothstep(-0.02, 0.02, fx) * (1.0 - smoothstep(0.78, 0.92, length(vec2(fx * 0.9, (fy - 0.15) * 0.82))));',
        '\t\t\t\tm2 = (1.0 - smoothstep(-0.02, 0.02, fx)) * (1.0 - smoothstep(0.11, 0.16, length(vec2(fx + 0.41, fy - 0.31))));',
        '\t\t\t} else if(kfcFpKind < 9.5){',
        '\t\t\t\t// 9: Lower-Jaw War Fangs',
        '\t\t\t\tfloat jaw = (1.0 - smoothstep(-0.05, 0.05, fy - 0.12 * cos(fx * 9.0))) * smoothstep(-0.68, -0.52, fy - 0.25 * fx * fx);',
        '\t\t\t\tfloat tusk = (1.0 - smoothstep(0.03, 0.06, abs(afx - 0.28 + 0.08 * (fy + 0.25)))) * smoothstep(-0.35, -0.25, fy) * (1.0 - smoothstep(0.02, 0.08, fy));',
        '\t\t\t\tm1 = jaw; m2 = tusk;',
        '\t\t\t} else if(kfcFpKind < 10.5){',
        '\t\t\t\t// 10: Luminescent Cyber Circuit Traces',
        '\t\t\t\tfloat tr1 = (1.0 - smoothstep(0.018, 0.034, abs(fy - (0.04 + 0.35 * step(0.46, afx) * (afx - 0.46))))) * step(0.24, afx) * (1.0 - smoothstep(0.78, 0.88, afx));',
        '\t\t\t\tfloat tr2 = (1.0 - smoothstep(0.018, 0.034, abs(afx - 0.46))) * smoothstep(0.04, 0.06, fy) * (1.0 - smoothstep(0.55, 0.62, fy));',
        '\t\t\t\tfloat node = 1.0 - smoothstep(0.032, 0.052, length(vec2(afx - 0.24, fy - 0.04)));',
        '\t\t\t\tm1 = max(tr1, tr2); m2 = node;',
        '\t\t\t} else if(kfcFpKind < 11.5){',
        '\t\t\t\t// 11: Opera Monkey King Swirl Mask (Porcelain base + Crimson volutes + Black ink)',
        '\t\t\t\tm3 = 0.94;',
        '\t\t\t\tfloat heartY = 0.34 + 0.38 * smoothstep(0.0, 0.38, afx) - 0.22 * smoothstep(0.38, 0.78, afx);',
        '\t\t\t\tvec2 sp1 = vec2(afx - 0.38, fy - 0.72);',
        '\t\t\t\tfloat r1 = length(sp1), a1 = atan(sp1.y, sp1.x);',
        '\t\t\t\tfloat sw1 = (1.0 - smoothstep(0.22, 0.28, r1)) * smoothstep(-0.15, 0.35, sin(r1 * 34.0 - a1 * 1.5));',
        '\t\t\t\tvec2 sp2 = vec2(afx - 0.56, fy - 0.05);',
        '\t\t\t\tfloat r2 = length(sp2), a2 = atan(sp2.y, sp2.x);',
        '\t\t\t\tfloat sw2 = (1.0 - smoothstep(0.20, 0.25, r2)) * smoothstep(-0.15, 0.35, sin(r2 * 36.0 + a2 * 1.5));',
        '\t\t\t\tfloat eyeR = length(vec2((afx - 0.41) * 1.05, (fy - 0.30) * 1.35));',
        '\t\t\t\tfloat redOrb = (1.0 - smoothstep(0.18, 0.24, eyeR)) * smoothstep(0.08, 0.12, eyeR);',
        '\t\t\t\tfloat redCrown = smoothstep(heartY + 0.05, heartY + 0.12, fy) * (1.0 - 0.85 * sw1);',
        '\t\t\t\tfloat jawRibs = smoothstep(0.36, 0.48, afx) * (1.0 - smoothstep(-0.02, 0.10, fy)) * smoothstep(-0.10, 0.30, cos((afx - fy * 0.45) * 44.0));',
        '\t\t\t\tm1 = clamp(max(max(redCrown, redOrb), max(sw2, jawRibs)), 0.0, 1.0);',
        '\t\t\t\tfloat blkBrow = (1.0 - smoothstep(0.024, 0.048, abs(fy - heartY))) * (1.0 - smoothstep(0.74, 0.84, afx));',
        '\t\t\t\tfloat blkMid = (1.0 - smoothstep(0.08, 0.18, afx)) * smoothstep(0.36, 0.52, fy);',
        '\t\t\t\tfloat blkEye = (1.0 - smoothstep(0.11, 0.16, eyeR)) * smoothstep(0.06, 0.09, eyeR);',
        '\t\t\t\tfloat simMouth = (1.0 - smoothstep(0.022, 0.042, abs(length(vec2(afx - 0.15, (fy + 0.16) * 1.25)) - 0.14))) * step(-0.32, fy) * step(fy, 0.04);',
        '\t\t\t\tfloat blkLip = kfcIsLips > 0.5 ? 0.92 : (1.0 - smoothstep(0.05, 0.08, length(vec2(fx * 0.55, fy + 0.28))));',
        '\t\t\t\tm2 = clamp(max(max(blkBrow, blkMid * 0.85), max(max(blkEye, simMouth), blkLip)), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 12.5){',
        '\t\t\t\t// 12: Plains Red War-Mask, Black Lightning Tears & White Pearl Dots',
        '\t\t\t\tfloat maskBot = 0.08 + 0.22 * afx - 0.14 * cos(fx * 5.5) - 0.45 * smoothstep(0.46, 0.72, afx);',
        '\t\t\t\tfloat redMask = smoothstep(maskBot - 0.03, maskBot + 0.03, fy);',
        '\t\t\t\tfloat redChin = (1.0 - smoothstep(0.036, 0.055, abs(afx - 0.16))) * step(fy, -0.34) * smoothstep(-0.70, -0.62, fy);',
        '\t\t\t\tm1 = max(redMask, redChin);',
        '\t\t\t\tfloat s0 = (1.0 - smoothstep(0.024, 0.042, afx)) * (step(-0.02, fy) + step(fy, -0.34));',
        '\t\t\t\tfloat x1 = 0.27 + 0.035 * sin(fy * 8.5), x2 = 0.52 + 0.035 * cos(fy * 7.5);',
        '\t\t\t\tfloat s1 = (1.0 - smoothstep(0.022, 0.040, abs(afx - x1))) * smoothstep(-0.56, -0.44, fy);',
        '\t\t\t\tfloat s2 = (1.0 - smoothstep(0.022, 0.040, abs(afx - x2))) * smoothstep(-0.38, -0.26, fy);',
        '\t\t\t\tm2 = clamp(max(s0, max(s1, s2)), 0.0, 1.0);',
        '\t\t\t\tfloat dY = fract((fy + 0.65) * 5.2) - 0.5;',
        '\t\t\t\tfloat d0 = 1.0 - smoothstep(0.018, 0.030, length(vec2(fx, dY / 5.2))) * step(-0.62, fy);',
        '\t\t\t\tfloat d1 = 1.0 - smoothstep(0.018, 0.030, length(vec2(afx - x1, dY / 5.2))) * step(0.12, fy);',
        '\t\t\t\tfloat d2 = 1.0 - smoothstep(0.018, 0.030, length(vec2(afx - x2, dY / 5.2))) * step(0.02, fy);',
        '\t\t\t\tfloat dChin = (1.0 - smoothstep(0.018, 0.030, length(vec2(afx - 0.16, (fract((fy + 0.62) * 6.5) - 0.5) / 6.5)))) * step(fy, -0.36) * step(-0.62, fy);',
        '\t\t\t\tm3 = clamp(max(max(d0 * s0, d1 * s1), max(d2 * s2, dChin)), 0.0, 1.0);',
        '\t\t\t\tm1 = clamp(m1 - m2 - m3, 0.0, 1.0);',
        '\t\t\t\tm2 = clamp(m2 - m3, 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 13.5){',
        '\t\t\t\t// 13: Avant-Garde Asymmetric Geometric Harlequin',
        '\t\t\t\tfloat hairCut = 0.88 + 0.14 * afx - 0.24 * exp(-abs(fx + 0.22) * 11.0);',
        '\t\t\t\tm1 = 1.0 - smoothstep(hairCut - 0.03, hairCut + 0.03, fy);',
        '\t\t\t\tfloat cLine = (1.0 - smoothstep(0.020, 0.034, abs(fx))) * step(-0.68, fy);',
        '\t\t\t\tfloat archLo = 0.46 + 0.85 * (fx - 0.34) * (fx - 0.34);',
        '\t\t\t\tfloat archHi = 0.80 - 0.65 * (fx - 0.38) * (fx - 0.38);',
        '\t\t\t\tfloat lArch = step(0.02, fx) * (1.0 - smoothstep(0.74, 0.80, fx)) * smoothstep(archLo - 0.02, archLo + 0.02, fy) * (1.0 - smoothstep(archHi - 0.02, archHi + 0.02, fy));',
        '\t\t\t\tfloat chevY = -0.08 + 0.78 * abs(fx - 0.44);',
        '\t\t\t\tfloat lChev = step(0.02, fx) * (1.0 - smoothstep(0.76, 0.82, fx)) * (1.0 - smoothstep(0.055, 0.085, abs(fy - chevY)));',
        '\t\t\t\tfloat rTri = step(fx, -0.16) * smoothstep(0.0, 0.03, fy) * (1.0 - smoothstep(0.32, 0.36, fy)) * (1.0 - smoothstep(0.0, 0.03, abs(fx + 0.41) - 0.22 * clamp((fy - 0.02) / 0.32, 0.0, 1.0)));',
        '\t\t\t\tfloat rBolt = step(fx, -0.18) * smoothstep(0.32, 0.35, fy) * (1.0 - smoothstep(0.78, 0.82, fy)) * (1.0 - smoothstep(0.018, 0.032, abs(fx + 0.36 - 0.32 * (fy - 0.35) + 0.08 * step(0.56, fy))));',
        '\t\t\t\tfloat mDia = 1.0 - smoothstep(0.30, 0.34, abs(fx - 0.05) * 0.85 + abs(fy + 0.29) * 1.35);',
        '\t\t\t\tfloat wBars = (1.0 - smoothstep(0.018, 0.030, min(abs(fx + 0.06), abs(fx - 0.05)))) * smoothstep(-0.39, -0.36, fy) * (1.0 - smoothstep(-0.19, -0.16, fy));',
        '\t\t\t\tm2 = clamp(max(max(cLine, lArch), max(max(lChev, rTri), max(rBolt, mDia))) - wBars, 0.0, 1.0);',
        '\t\t\t\tm3 = wBars;',
        '\t\t\t} else if(kfcFpKind < 14.5){',
        '\t\t\t\t// 14: Solar Labyrinth & Third-Eye Mandala',
        '\t\t\t\tm3 = 0.90;',
        '\t\t\t\tvec2 mp = vec2(fx, fy - 0.60);',
        '\t\t\t\tfloat mr = length(mp), ma = atan(mp.y, mp.x);',
        '\t\t\t\tfloat gem = (1.0 - smoothstep(0.10, 0.125, mr)) * (0.78 + 0.22 * cos(fx * 85.0) * cos(fy * 85.0));',
        '\t\t\t\tfloat ringB = (1.0 - smoothstep(0.165, 0.195, mr)) * smoothstep(0.135, 0.155, mr);',
        '\t\t\t\tfloat mazeZone = smoothstep(0.21, 0.24, mr) * smoothstep(0.26, 0.32, fy);',
        '\t\t\t\tfloat mRings = smoothstep(-0.10, 0.20, sin(mr * 44.0));',
        '\t\t\t\tfloat mGates = smoothstep(-0.45, -0.15, cos(ma * 7.0 + floor(mr * 14.0) * 1.9));',
        '\t\t\t\tfloat mSpokes = (1.0 - mRings) * smoothstep(0.55, 0.75, cos(ma * 7.0 + floor(mr * 14.0 + 0.5) * 1.9));',
        '\t\t\t\tfloat maze = clamp((mRings * mGates + mSpokes) * mazeZone, 0.0, 1.0);',
        '\t\t\t\tfloat uEyeY = 0.18 - 0.20 * abs(afx - 0.42);',
        '\t\t\t\tfloat uTicks = (1.0 - smoothstep(0.035, 0.065, abs(fy - uEyeY - 0.03 * step(0.0, cos(afx * 38.0))))) * smoothstep(0.16, 0.22, afx) * (1.0 - smoothstep(0.68, 0.74, afx)) * smoothstep(-0.15, 0.15, cos(afx * 52.0));',
        '\t\t\t\tfloat darkLip = kfcIsLips > 0.5 ? 0.90 : 0.0;',
        '\t\t\t\tm1 = gem;',
        '\t\t\t\tm2 = clamp(max(max(ringB, maze), max(uTicks, darkLip)), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 15.5){',
        '\t\t\t\t// 15: Frost-Ash Raider Mask & Ochre Brow Tallies',
        '\t\t\t\tm3 = 0.88;',
        '\t\t\t\tfloat bBot = 0.05 + 0.24 * abs(afx - 0.36);',
        '\t\t\t\tfloat bTop = 0.45 - 0.08 * cos(fx * 5.0);',
        '\t\t\t\tfloat blkBand = smoothstep(bBot - 0.04, bBot + 0.03, fy) * (1.0 - smoothstep(bTop - 0.03, bTop + 0.04, fy)) * (1.0 - smoothstep(0.74, 0.86, afx));',
        '\t\t\t\tfloat blkNose = (1.0 - smoothstep(0.10, 0.16, afx)) * smoothstep(-0.05, 0.02, fy) * (1.0 - smoothstep(0.42, 0.48, fy));',
        '\t\t\t\tfloat blkPhil = (1.0 - smoothstep(0.025, 0.050, afx)) * smoothstep(-0.26, -0.20, fy) * (1.0 - smoothstep(-0.02, 0.04, fy));',
        '\t\t\t\tfloat blkCheek = 1.0 - smoothstep(0.08, 0.13, length(vec2((afx - 0.54) * 1.1, (fy + 0.18) * 1.35)));',
        '\t\t\t\tfloat blkLip = kfcIsLips > 0.5 ? 0.92 : (1.0 - smoothstep(0.045, 0.075, length(vec2(fx * 0.55, fy + 0.28))));',
        '\t\t\t\tm2 = clamp(max(max(blkBand, blkNose), max(max(blkPhil, blkCheek), blkLip)), 0.0, 1.0);',
        '\t\t\t\tfloat t1 = (1.0 - smoothstep(0.020, 0.038, abs(afx - (0.19 + 0.08 * (fy - 0.38))))) * smoothstep(0.36, 0.42, fy) * (1.0 - smoothstep(0.72, 0.78, fy));',
        '\t\t\t\tfloat t2 = (1.0 - smoothstep(0.022, 0.040, abs(afx - (0.43 + 0.20 * (fy - 0.38))))) * smoothstep(0.34, 0.40, fy) * (1.0 - smoothstep(0.82, 0.88, fy));',
        '\t\t\t\tm1 = max(t1, t2);',
        '\t\t\t} else if(kfcFpKind < 16.5){',
        '\t\t\t\t// 16: Island Boar Tusked Spirit Mask',
        '\t\t\t\tfloat redCheek = smoothstep(0.12, 0.18, afx) * (1.0 - smoothstep(0.74, 0.84, afx)) * smoothstep(-0.36, -0.28, fy) * (1.0 - smoothstep(0.24, 0.32, fy));',
        '\t\t\t\tfloat wNose = (1.0 - smoothstep(0.07, 0.11, afx)) * smoothstep(-0.04, 0.02, fy) * (1.0 - smoothstep(0.72, 0.80, fy));',
        '\t\t\t\tfloat wBrow = smoothstep(0.42, 0.48, fy) * (1.0 - smoothstep(0.76, 0.84, fy)) * (1.0 - smoothstep(0.55, 0.68, afx));',
        '\t\t\t\tfloat wStache = (1.0 - smoothstep(0.035, 0.060, abs(fy - (-0.11 - 0.24 * afx * afx)))) * (1.0 - smoothstep(0.38, 0.46, afx));',
        '\t\t\t\tfloat wJaw = (1.0 - smoothstep(0.028, 0.050, abs(fy - (-0.42 + 0.32 * afx)))) * smoothstep(0.18, 0.24, afx) * (1.0 - smoothstep(0.58, 0.66, afx));',
        '\t\t\t\tfloat wTusk = (1.0 - smoothstep(0.025, 0.045, abs(length(vec2(afx - 0.42, fy - 0.12)) - 0.10))) * step(fy, 0.14);',
        '\t\t\t\tm3 = clamp(max(max(wNose, wBrow), max(max(wStache, wJaw), wTusk)), 0.0, 1.0);',
        '\t\t\t\tfloat blkEye = smoothstep(0.20, 0.26, fy) * (1.0 - smoothstep(0.46, 0.54, fy)) * smoothstep(0.08, 0.14, afx) * (1.0 - smoothstep(0.70, 0.80, afx));',
        '\t\t\t\tfloat blkChin = (1.0 - smoothstep(-0.24, -0.18, fy)) * (1.0 - smoothstep(0.32, 0.42, afx));',
        '\t\t\t\tfloat blkNost = smoothstep(0.08, 0.11, afx) * (1.0 - smoothstep(0.18, 0.23, afx)) * smoothstep(0.0, 0.04, fy) * (1.0 - smoothstep(0.28, 0.34, fy));',
        '\t\t\t\tfloat blkRays = (1.0 - smoothstep(0.28, 0.48, abs(sin((fy - 0.24 - 0.25 * (afx - 0.35)) * 28.0)))) * smoothstep(0.34, 0.40, afx) * (1.0 - smoothstep(0.66, 0.74, afx)) * smoothstep(0.04, 0.10, fy) * (1.0 - smoothstep(0.34, 0.40, fy));',
        '\t\t\t\tm1 = clamp(redCheek - m3, 0.0, 1.0);',
        '\t\t\t\tm2 = clamp(max(max(blkEye, blkChin), max(blkNost, blkRays)) - wTusk, 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 17.5){',
        '\t\t\t\t// 17: Ghost-Face Band, Red Tear-Forks & Chin Stripes',
        '\t\t\t\tm3 = 0.92;',
        '\t\t\t\tfloat bTop = 0.58 - 0.12 * fx * fx, bBot = 0.16 + 0.12 * cos(fx * 5.0);',
        '\t\t\t\tfloat blkMask = smoothstep(bBot - 0.03, bBot + 0.03, fy) * (1.0 - smoothstep(bTop - 0.03, bTop + 0.03, fy)) * (1.0 - smoothstep(0.74, 0.84, afx));',
        '\t\t\t\tfloat topBars = smoothstep(bTop - 0.02, bTop + 0.02, fy) * smoothstep(0.35, 0.65, cos(fx * 28.0)) * (1.0 - smoothstep(0.68, 0.78, afx));',
        '\t\t\t\tfloat noseBar = (1.0 - smoothstep(0.030, 0.050, afx)) * smoothstep(-0.02, 0.02, fy) * (1.0 - smoothstep(0.24, 0.28, fy));',
        '\t\t\t\tfloat chinBars = (1.0 - smoothstep(-0.34, -0.30, fy)) * smoothstep(0.08, 0.12, afx) * (1.0 - smoothstep(0.38, 0.44, afx)) * smoothstep(0.30, 0.65, cos(afx * 46.0));',
        '\t\t\t\tfloat blkMouth = kfcIsLips > 0.5 ? 0.94 : (1.0 - smoothstep(0.055, 0.085, length(vec2(fx * 0.52, fy + 0.27))));',
        '\t\t\t\tm2 = clamp(max(max(blkMask, topBars), max(max(noseBar, chinBars), blkMouth)), 0.0, 1.0);',
        '\t\t\t\tfloat rTear1 = (1.0 - smoothstep(0.022, 0.042, abs(afx - (0.27 + 0.04 * sin(fy * 9.0))))) * smoothstep(-0.46, -0.38, fy) * (1.0 - smoothstep(0.22, 0.28, fy));',
        '\t\t\t\tfloat rTear2 = (1.0 - smoothstep(0.020, 0.038, abs(afx - (0.45 + 0.04 * cos(fy * 8.0))))) * smoothstep(-0.38, -0.30, fy) * (1.0 - smoothstep(0.20, 0.26, fy));',
        '\t\t\t\tfloat rChin = (1.0 - smoothstep(0.035, 0.055, afx)) * (1.0 - smoothstep(-0.34, -0.30, fy));',
        '\t\t\t\tm1 = clamp(max(max(rTear1, rTear2), rChin), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 18.5){',
        '\t\t\t\t// 18: Porcelain & Teal Cheek-Wedges with Tear Line',
        '\t\t\t\tm3 = 1.0 - smoothstep(0.34, 0.40, fy);',
        '\t\t\t\tfloat wDot1 = 1.0 - smoothstep(0.022, 0.036, length(vec2(afx - 0.48, fy - 0.16)));',
        '\t\t\t\tfloat wDot2 = 1.0 - smoothstep(0.022, 0.036, length(vec2(afx - 0.48, fy - 0.01)));',
        '\t\t\t\tfloat tealWedge = smoothstep(0.12, 0.16, afx) * (1.0 - smoothstep(0.68, 0.76, afx)) * (1.0 - smoothstep(0.26, 0.30, fy)) * smoothstep(-0.18, -0.14, fy - (-0.42 * (afx - 0.16)));',
        '\t\t\t\tfloat tDot1 = 1.0 - smoothstep(0.020, 0.034, length(vec2(afx - 0.46, fy + 0.18)));',
        '\t\t\t\tfloat tDot2 = 1.0 - smoothstep(0.020, 0.034, length(vec2(afx - 0.46, fy + 0.32)));',
        '\t\t\t\tm1 = clamp(max(tealWedge, max(tDot1, tDot2)) - max(wDot1, wDot2), 0.0, 1.0);',
        '\t\t\t\tfloat blkBrow = smoothstep(0.26, 0.30, fy) * (1.0 - smoothstep(0.42, 0.48, fy)) * (1.0 - smoothstep(0.70, 0.78, afx));',
        '\t\t\t\tfloat blkTear = (1.0 - smoothstep(0.018, 0.034, abs(afx - 0.35))) * smoothstep(-0.38, -0.32, fy) * (1.0 - smoothstep(0.30, 0.34, fy));',
        '\t\t\t\tfloat blkSide = (1.0 - smoothstep(0.020, 0.036, abs(afx - 0.68))) * smoothstep(-0.18, -0.12, fy) * (1.0 - smoothstep(0.32, 0.38, fy));',
        '\t\t\t\tfloat mDot = 1.0 - smoothstep(0.018, 0.032, length(vec2(afx - 0.25, fy + 0.27)));',
        '\t\t\t\tfloat blkLip = kfcIsLips > 0.5 ? 0.92 : (1.0 - smoothstep(0.04, 0.065, length(vec2(fx * 0.55, fy + 0.27))));',
        '\t\t\t\tm2 = clamp(max(max(blkBrow, blkTear), max(max(blkSide, mDot), blkLip)), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 19.5){',
        '\t\t\t\t// 19: Cerulean Sky-Mask & Feline Tribal Whiskers',
        '\t\t\t\tm1 = 0.92;',
        '\t\t\t\tfloat cPil = (1.0 - smoothstep(0.055, 0.085, afx)) * smoothstep(0.02, 0.06, fy) * (1.0 - smoothstep(0.88, 0.94, fy));',
        '\t\t\t\tfloat noseTip = (1.0 - smoothstep(0.10, 0.14, afx)) * smoothstep(-0.04, 0.0, fy) * (1.0 - smoothstep(0.05, 0.09, fy));',
        '\t\t\t\tfloat bTick1 = (1.0 - smoothstep(0.022, 0.040, abs(fy - (0.62 + 0.06 * cos((afx - 0.34) * 8.0))))) * smoothstep(0.18, 0.22, afx) * (1.0 - smoothstep(0.54, 0.60, afx));',
        '\t\t\t\tfloat bTick2 = (1.0 - smoothstep(0.020, 0.038, abs(fy - (0.74 + 0.05 * cos((afx - 0.34) * 8.0))))) * smoothstep(0.22, 0.26, afx) * (1.0 - smoothstep(0.50, 0.56, afx));',
        '\t\t\t\tfloat eyeWing = (1.0 - smoothstep(0.025, 0.048, abs(fy - (0.36 + 0.18 * (afx - 0.35))))) * smoothstep(0.16, 0.22, afx) * (1.0 - smoothstep(0.72, 0.78, afx));',
        '\t\t\t\tfloat whiskers = (1.0 - smoothstep(0.28, 0.48, abs(sin((fy + 0.06 - 0.42 * (afx - 0.35)) * 26.0)))) * smoothstep(0.28, 0.34, afx) * (1.0 - smoothstep(0.74, 0.80, afx)) * smoothstep(-0.22, -0.16, fy) * (1.0 - smoothstep(0.20, 0.26, fy));',
        '\t\t\t\tfloat jawBlock = smoothstep(0.20, 0.25, afx) * (1.0 - smoothstep(0.42, 0.48, afx)) * smoothstep(-0.34, -0.28, fy) * (1.0 - smoothstep(-0.02, 0.04, fy));',
        '\t\t\t\tm2 = clamp(max(max(cPil, noseTip), max(max(bTick1, bTick2), max(eyeWing, max(whiskers, jawBlock)))), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 20.5){',
        '\t\t\t\t// 20: Bone-Ash Visage, Center Gold Pillar & Hollow Pits',
        '\t\t\t\tm3 = 0.86;',
        '\t\t\t\tfloat pilW = 0.21 - 0.03 * cos(fy * 4.5);',
        '\t\t\t\tfloat goldPil = 1.0 - smoothstep(pilW - 0.03, pilW + 0.03, afx);',
        '\t\t\t\tfloat eyeShade = 1.0 - smoothstep(0.12, 0.22, length(vec2((afx - 0.38) * 1.05, (fy - 0.30) * 1.45)));',
        '\t\t\t\tfloat p1 = 1.0 - smoothstep(0.055, 0.095, length(vec2(afx - 0.62, fy - 0.30)));',
        '\t\t\t\tfloat p2 = 1.0 - smoothstep(0.060, 0.100, length(vec2(afx - 0.56, fy - 0.05)));',
        '\t\t\t\tfloat p3 = 1.0 - smoothstep(0.065, 0.105, length(vec2(afx - 0.48, fy + 0.19)));',
        '\t\t\t\tm1 = goldPil;',
        '\t\t\t\tm2 = clamp(max(eyeShade * 0.82, max(p1, max(p2, p3))), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 21.5){',
        '\t\t\t\t// 21: Seeker Asymmetric Woad Chevrons & Under-Eye Rim',
        '\t\t\t\tfloat uRim = (1.0 - smoothstep(0.75, 1.15, length(vec2((afx - 0.38) / 0.18, (fy - 0.24) / 0.065)))) * step(fy, 0.31);',
        '\t\t\t\tfloat lCorner = max(fx - 0.12, (0.48 - fy) * 0.85 + (fx - 0.24) * 0.55);',
        '\t\t\t\tfloat lStripes = (1.0 - smoothstep(0.30, 0.50, abs(sin(lCorner * 30.0)))) * step(0.10, fx) * (1.0 - smoothstep(0.62, 0.70, fx)) * smoothstep(0.32, 0.38, fy) * (1.0 - smoothstep(0.80, 0.88, fy));',
        '\t\t\t\tfloat rCorner = max(-fx - 0.30, (fy - 0.18) * 0.80 + (-fx - 0.36) * 0.60);',
        '\t\t\t\tfloat rStripes = (1.0 - smoothstep(0.30, 0.50, abs(sin(rCorner * 30.0)))) * step(fx, -0.26) * (1.0 - smoothstep(0.68, 0.76, -fx)) * smoothstep(-0.22, -0.14, fy) * (1.0 - smoothstep(0.22, 0.28, fy));',
        '\t\t\t\tm1 = clamp(max(uRim, max(lStripes, rStripes)), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 22.5){',
        '\t\t\t\t// 22: White Inverted-Y Wishbone & Red-Ochre Finger Stripes',
        '\t\t\t\tfloat wStem = (1.0 - smoothstep(0.040, 0.065, afx)) * smoothstep(0.30, 0.35, fy) * (1.0 - smoothstep(0.84, 0.90, fy));',
        '\t\t\t\tfloat wFork = (1.0 - smoothstep(0.038, 0.062, abs(fy - (0.34 - 0.68 * afx)))) * step(fy, 0.36) * (1.0 - smoothstep(0.54, 0.62, afx));',
        '\t\t\t\tm2 = clamp(max(wStem, wFork), 0.0, 1.0);',
        '\t\t\t\tfloat fBar1 = (1.0 - smoothstep(0.035, 0.060, abs(fy - (0.50 + 0.40 * (afx - 0.30))))) * smoothstep(0.20, 0.26, afx) * (1.0 - smoothstep(0.60, 0.68, afx));',
        '\t\t\t\tfloat fBar2 = (1.0 - smoothstep(0.035, 0.060, abs(fy - (0.68 + 0.40 * (afx - 0.34))))) * smoothstep(0.24, 0.30, afx) * (1.0 - smoothstep(0.62, 0.70, afx));',
        '\t\t\t\tfloat eyeSmudge = (1.0 - smoothstep(0.08, 0.14, abs(fy - 0.31))) * smoothstep(0.20, 0.28, afx) * (1.0 - smoothstep(0.66, 0.76, afx));',
        '\t\t\t\tfloat lowCheek = (1.0 - smoothstep(0.24 - 0.68 * afx, 0.28 - 0.68 * afx, fy)) * smoothstep(0.14, 0.20, afx) * (1.0 - smoothstep(0.64, 0.74, afx)) * smoothstep(-0.56, -0.44, fy) * (0.65 + 0.35 * cos(afx * 32.0));',
        '\t\t\t\tm1 = clamp(max(max(fBar1, fBar2), max(eyeSmudge, lowCheek)) * 0.88 - m2, 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 23.5){',
        '\t\t\t\t// 23: Crimson Eye-Visor & Black Handprint Over Mouth',
        '\t\t\t\tfloat vBot = 0.10 + 0.06 * cos(fx * 5.0), vTop = 0.46;',
        '\t\t\t\tfloat visor = smoothstep(vBot - 0.04, vBot + 0.03, fy) * (1.0 - smoothstep(vTop - 0.02, vTop + 0.03, fy)) * (1.0 - smoothstep(0.70, 0.80, afx));',
        '\t\t\t\tfloat palm = 1.0 - smoothstep(0.22, 0.27, length(vec2((fx + 0.06) * 0.92, (fy + 0.36) * 1.10)));',
        '\t\t\t\tfloat thumb = (1.0 - smoothstep(0.035, 0.058, abs(fx + 0.28 - 0.52 * (fy + 0.28)))) * smoothstep(-0.30, -0.24, fy) * (1.0 - smoothstep(0.14, 0.20, fy));',
        '\t\t\t\tvec2 hp = vec2(fx + 0.02, fy + 0.32);',
        '\t\t\t\tfloat hr = length(hp), ha = atan(hp.y, hp.x);',
        '\t\t\t\tfloat fingers = (1.0 - smoothstep(0.35, 0.58, abs(sin((ha - 0.15) * 11.5)))) * step(0.12, ha) * step(ha, 1.12) * smoothstep(0.18, 0.24, hr) * (1.0 - smoothstep(0.64, 0.72, hr));',
        '\t\t\t\tfloat blkHand = clamp(max(palm, max(thumb, fingers)), 0.0, 1.0);',
        '\t\t\t\tm1 = clamp(visor - blkHand, 0.0, 1.0);',
        '\t\t\t\tm2 = blkHand;',
        '\t\t\t} else if(kfcFpKind < 24.5){',
        '\t\t\t\t// 24: White Under-Eye Tendrils, Nasal Bars & Brow-Dot Triad',
        '\t\t\t\tfloat d1 = 1.0 - smoothstep(0.018, 0.030, length(vec2(fx, fy - 0.46)));',
        '\t\t\t\tfloat d2 = 1.0 - smoothstep(0.018, 0.030, length(vec2(fx, fy - 0.60)));',
        '\t\t\t\tfloat d3 = 1.0 - smoothstep(0.018, 0.030, length(vec2(fx, fy - 0.74)));',
        '\t\t\t\tfloat nBar = (1.0 - smoothstep(0.012, 0.024, abs(afx - 0.065))) * smoothstep(0.05, 0.08, fy) * (1.0 - smoothstep(0.26, 0.30, fy));',
        '\t\t\t\tfloat uLine = (1.0 - smoothstep(0.014, 0.026, abs(fy - (0.22 - 0.05 * sin((afx - 0.16) * 7.0))))) * smoothstep(0.15, 0.19, afx) * (1.0 - smoothstep(0.70, 0.76, afx));',
        '\t\t\t\tfloat tInner = (1.0 - smoothstep(0.015, 0.028, abs(afx - (0.24 + 0.08 * sin((0.20 - fy) * 9.0))))) * smoothstep(-0.08, -0.04, fy) * (1.0 - smoothstep(0.20, 0.24, fy));',
        '\t\t\t\tfloat tMid = (1.0 - smoothstep(0.014, 0.026, abs(fy - (0.12 - 0.25 * (afx - 0.22) + 0.04 * sin(afx * 16.0))))) * smoothstep(0.20, 0.24, afx) * (1.0 - smoothstep(0.66, 0.72, afx));',
        '\t\t\t\tfloat chinBar = (1.0 - smoothstep(0.024, 0.040, afx)) * smoothstep(-0.64, -0.58, fy) * (1.0 - smoothstep(-0.40, -0.36, fy));',
        '\t\t\t\tm1 = clamp(max(max(max(d1, d2), max(d3, nBar)), max(max(uLine, tInner), max(tMid, chinBar))), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 25.5){',
        '\t\t\t\t// 25: Ancestral Third-Eye Ring, Cheek Comb-Ticks & Maroon Forehead Stripe',
        '\t\t\t\tfloat mStripe = (1.0 - smoothstep(0.065, 0.095, afx)) * smoothstep(0.46, 0.52, fy);',
        '\t\t\t\tfloat cRingD = length(vec2(fx * 1.35, (fy - 0.37) * 0.95));',
        '\t\t\t\tfloat cRing = (1.0 - smoothstep(0.075, 0.098, cRingD)) * smoothstep(0.042, 0.060, cRingD);',
        '\t\t\t\tfloat bDots = (1.0 - smoothstep(0.018, 0.032, abs(fy - (0.45 + 0.05 * sin((afx - 0.14) * 6.0))))) * smoothstep(0.16, 0.20, afx) * (1.0 - smoothstep(0.62, 0.68, afx)) * smoothstep(0.45, 0.75, cos((afx - 0.18) * 48.0));',
        '\t\t\t\tfloat nDots = (1.0 - smoothstep(0.020, 0.034, afx)) * smoothstep(-0.02, 0.02, fy) * (1.0 - smoothstep(0.24, 0.28, fy)) * smoothstep(0.35, 0.70, cos(fy * 82.0));',
        '\t\t\t\tfloat cDots = (1.0 - smoothstep(0.022, 0.036, afx)) * smoothstep(-0.58, -0.54, fy) * (1.0 - smoothstep(-0.38, -0.34, fy)) * smoothstep(0.30, 0.65, cos(fy * 68.0));',
        '\t\t\t\tfloat combY = 0.19 - 0.09 * sin((afx - 0.16) * 5.5);',
        '\t\t\t\tfloat combSpine = (1.0 - smoothstep(0.012, 0.024, abs(fy - combY))) * smoothstep(0.16, 0.20, afx) * (1.0 - smoothstep(0.68, 0.74, afx));',
        '\t\t\t\tfloat combTeeth = smoothstep(combY - 0.11, combY - 0.08, fy) * step(fy, combY) * smoothstep(0.18, 0.22, afx) * (1.0 - smoothstep(0.66, 0.72, afx)) * smoothstep(0.40, 0.72, cos(afx * 68.0));',
        '\t\t\t\tfloat jRingD = length(vec2((afx - 0.46) * 1.45, (fy + 0.16) * 1.0));',
        '\t\t\t\tfloat jRing = (1.0 - smoothstep(0.048, 0.065, jRingD)) * smoothstep(0.025, 0.038, jRingD);',
        '\t\t\t\tm1 = clamp(max(max(cRing, bDots), max(max(nDots, cDots), max(max(combSpine, combTeeth), jRing))), 0.0, 1.0);',
        '\t\t\t\tm2 = clamp(mStripe - cRing, 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 26.5){',
        '\t\t\t\t// 26: Asymmetric White Half-Face Spiral & Temple Fret',
        '\t\t\t\tfloat nAng = (1.0 - smoothstep(0.018, 0.032, abs(fx - 0.25 * (fy - 0.02)))) * smoothstep(0.0, 0.03, fy) * (1.0 - smoothstep(0.22, 0.25, fy));',
        '\t\t\t\tfloat uEye = (1.0 - smoothstep(0.020, 0.036, abs(fy - (0.24 - 0.14 * (fx - 0.06))))) * smoothstep(0.04, 0.08, fx) * (1.0 - smoothstep(0.66, 0.72, fx));',
        '\t\t\t\tfloat tFrame = (1.0 - smoothstep(0.020, 0.036, abs(fx - 0.64))) * smoothstep(0.14, 0.18, fy) * (1.0 - smoothstep(0.62, 0.68, fy));',
        '\t\t\t\tfloat fFret = (1.0 - smoothstep(0.30, 0.50, abs(sin((fy - 0.44 - 0.35 * (fx - 0.12)) * 24.0)))) * smoothstep(0.08, 0.14, fx) * (1.0 - smoothstep(0.62, 0.68, fx)) * smoothstep(0.42, 0.48, fy) * (1.0 - smoothstep(0.84, 0.90, fy));',
        '\t\t\t\tvec2 sp = vec2(fx - 0.46, fy + 0.06);',
        '\t\t\t\tfloat sr = length(sp), sa = atan(sp.y, sp.x);',
        '\t\t\t\tfloat cSwirl = (1.0 - smoothstep(0.18, 0.22, sr)) * smoothstep(0.0, 0.40, sin(sr * 38.0 - sa * 1.5)) * step(0.12, fx);',
        '\t\t\t\tfloat jBlade = (1.0 - smoothstep(0.024, 0.042, abs(fy - (-0.46 + 0.95 * (fx - 0.22))))) * smoothstep(0.20, 0.24, fx) * (1.0 - smoothstep(0.58, 0.64, fx));',
        '\t\t\t\tfloat chinLine = (1.0 - smoothstep(0.022, 0.038, abs(fx))) * smoothstep(-0.66, -0.60, fy) * (1.0 - smoothstep(-0.38, -0.34, fy));',
        '\t\t\t\tm1 = clamp(max(max(max(nAng, uEye), max(tFrame, fFret)), max(cSwirl, max(jBlade, chinLine))), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 27.5){',
        '\t\t\t\t// 27: Ritual Blackwork Eye-Pillar, Triskelion & Crown Dots',
        '\t\t\t\tfloat rPil = smoothstep(-0.50, -0.46, fx) * (1.0 - smoothstep(-0.26, -0.22, fx)) * smoothstep(-0.56, -0.48, fy) * (1.0 - smoothstep(0.80, 0.86, fy));',
        '\t\t\t\tfloat rGap = smoothstep(-0.14, -0.10, fy) * (1.0 - smoothstep(0.06, 0.10, fy)) * smoothstep(0.20, 0.55, cos(fy * 72.0));',
        '\t\t\t\tfloat rFrame = (1.0 - smoothstep(0.012, 0.024, abs(abs(fx + 0.56) - 0.04))) * smoothstep(-0.36, -0.28, fy) * (1.0 - smoothstep(0.76, 0.82, fy));',
        '\t\t\t\tvec2 tp = vec2(fx, fy - 0.55);',
        '\t\t\t\tfloat tr = length(tp), ta = atan(tp.y, tp.x);',
        '\t\t\t\tfloat trisk = (1.0 - smoothstep(0.085, 0.105, tr)) * (smoothstep(0.065, 0.080, tr) + (1.0 - smoothstep(0.055, 0.070, tr)) * smoothstep(-0.10, 0.30, sin(tr * 48.0 - ta * 3.0)));',
        '\t\t\t\tfloat nLine = (1.0 - smoothstep(0.012, 0.024, abs(fx))) * smoothstep(-0.02, 0.02, fy) * (1.0 - smoothstep(0.40, 0.44, fy));',
        '\t\t\t\tfloat cLines = (1.0 - smoothstep(0.015, 0.028, min(abs(fx), abs(afx - 0.09)))) * (1.0 - smoothstep(-0.34, -0.30, fy));',
        '\t\t\t\tfloat lTemp = (1.0 - smoothstep(0.014, 0.026, abs(fy - (0.52 - 0.16 * (fx - 0.14))))) * smoothstep(0.12, 0.16, fx) * (1.0 - smoothstep(0.70, 0.76, fx));',
        '\t\t\t\tfloat cCrown = (1.0 - smoothstep(0.022, 0.038, abs(fy - (0.88 - 0.22 * fx * fx)))) * (1.0 - smoothstep(0.60, 0.70, afx)) * smoothstep(0.35, 0.70, cos(fx * 28.0));',
        '\t\t\t\tm1 = clamp(max(max(rPil * (1.0 - rGap), rFrame), max(max(trisk, nLine), max(cLines, max(lTemp, cCrown)))), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 28.5){',
        '\t\t\t\t// 28: Maya Stepped Temple-Spiral & Jaw Greca',
        '\t\t\t\tvec2 mp = vec2(afx - 0.48, fy - 0.46);',
        '\t\t\t\tfloat boxR = max(abs(mp.x), abs(mp.y)), ma = atan(mp.y, mp.x);',
        '\t\t\t\tfloat tSpiral = (1.0 - smoothstep(0.24, 0.27, boxR)) * smoothstep(-0.05, 0.30, cos(boxR * 46.0 - ma * 0.75)) * smoothstep(0.18, 0.22, afx);',
        '\t\t\t\tfloat cStep = smoothstep(0.42, 0.46, afx) * (1.0 - smoothstep(0.70, 0.74, afx)) * smoothstep(-0.04, 0.0, fy) * (1.0 - smoothstep(0.20, 0.24, fy));',
        '\t\t\t\tfloat jY = fy - (-0.22 - 0.22 * (0.56 - afx));',
        '\t\t\t\tvec2 jp = vec2(fract((afx - 0.16) * 5.5) - 0.5, jY * 5.5);',
        '\t\t\t\tfloat jBox = max(abs(jp.x), abs(jp.y));',
        '\t\t\t\tfloat jGreca = (1.0 - smoothstep(0.42, 0.48, jBox)) * smoothstep(-0.10, 0.30, cos(jBox * 18.0 - atan(jp.y, jp.x) * 0.75)) * smoothstep(0.18, 0.22, afx) * (1.0 - smoothstep(0.68, 0.74, afx));',
        '\t\t\t\tm1 = clamp(max(tSpiral, max(cStep, jGreca)), 0.0, 1.0);',
        '\t\t\t} else if(kfcFpKind < 29.5){',
        '\t\t\t\t// 29: White Forehead Halo-Arch, Nasal Pillar & Starburst Cheek Dots',
        '\t\t\t\tfloat haloY = 0.76 - 0.58 * fx * fx;',
        '\t\t\t\tfloat halo = (1.0 - smoothstep(0.026, 0.045, abs(fy - haloY))) * (1.0 - smoothstep(0.74, 0.82, afx));',
        '\t\t\t\tfloat bLine = (1.0 - smoothstep(0.018, 0.032, abs(fy - (0.48 - 0.08 * (afx - 0.18))))) * smoothstep(0.16, 0.20, afx) * (1.0 - smoothstep(0.56, 0.62, afx));',
        '\t\t\t\tfloat cPil = (1.0 - smoothstep(0.032, 0.052, afx)) * smoothstep(-0.66, -0.60, fy) * (1.0 - smoothstep(0.44, 0.48, fy));',
        '\t\t\t\tvec2 cp = vec2(afx - 0.14, fy - 0.10);',
        '\t\t\t\tfloat cr = length(cp), ca = atan(cp.y, cp.x);',
        '\t\t\t\tfloat sRays = (1.0 - smoothstep(0.28, 0.48, abs(sin((ca + 0.15) * 9.0)))) * step(-1.05, ca) * step(ca, -0.05) * smoothstep(0.08, 0.12, cr) * (1.0 - smoothstep(0.46, 0.52, cr)) * smoothstep(0.15, 0.55, cos(cr * 48.0));',
        '\t\t\t\tfloat wBars = (1.0 - smoothstep(0.018, 0.032, min(abs(fy + 0.10 - 0.12 * (afx - 0.50)), abs(fy + 0.20 - 0.12 * (afx - 0.50))))) * smoothstep(0.46, 0.50, afx) * (1.0 - smoothstep(0.72, 0.78, afx));',
        '\t\t\t\tm1 = clamp(max(max(halo, bLine), max(cPil, max(sRays, wBars))), 0.0, 1.0);',
        '\t\t\t} else {',
        '\t\t\t\t// 30: Graphic Marigold Cutout Skull Mask',
        '\t\t\t\tfloat uDome = 1.0 - smoothstep(0.60, 0.65, length(vec2(fx * 0.95, (fy - 0.36) * 0.92)));',
        '\t\t\t\tfloat cArch = smoothstep(0.0, 0.04, fy) * (1.0 - smoothstep(0.58, 0.63, afx)) * (1.0 - smoothstep(0.74, 0.80, fy));',
        '\t\t\t\tfloat jBox = (1.0 - smoothstep(0.32, 0.36, afx)) * smoothstep(-0.54, -0.48, fy) * (1.0 - smoothstep(0.04, 0.08, fy));',
        '\t\t\t\tfloat outerSkull = max(uDome * step(0.02, fy), max(cArch, jBox));',
        '\t\t\t\tfloat eyeCut = 1.0 - smoothstep(0.88, 1.02, max(abs(afx - 0.35) / 0.18, abs(fy - 0.27) / 0.12));',
        '\t\t\t\tfloat noseCut = (1.0 - smoothstep(0.0, 0.03, afx - 0.14 * clamp((0.18 - fy) / 0.24, 0.0, 1.0))) * smoothstep(-0.06, -0.02, fy) * (1.0 - smoothstep(0.16, 0.20, fy));',
        '\t\t\t\tfloat mouthCut = (1.0 - smoothstep(0.24, 0.27, afx)) * smoothstep(-0.44, -0.40, fy) * (1.0 - smoothstep(-0.14, -0.10, fy));',
        '\t\t\t\tfloat teeth = mouthCut * smoothstep(0.15, 0.45, cos(fx * 38.0)) * (1.0 - smoothstep(0.042, 0.060, min(abs(fy + 0.21), abs(fy + 0.36))));',
        '\t\t\t\tm1 = clamp(outerSkull - eyeCut - noseCut - mouthCut + teeth, 0.0, 1.0);',
        '\t\t\t}',
        '\t\t\tdiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.91, 0.88) * shade, clamp(m3 * fm * kfcFpAmt, 0.0, 1.0));',
        '\t\t\tdiffuseColor.rgb = mix(diffuseColor.rgb, kfcFpC1 * shade, clamp(m1 * fm * kfcFpAmt, 0.0, 1.0));',
        '\t\t\tdiffuseColor.rgb = mix(diffuseColor.rgb, kfcFpC2 * shade, clamp(m2 * fm * kfcFpAmt, 0.0, 1.0));',
        '\t\t}',
        '\t\t// 2. Makeup: Cheek Blush',
        '\t\tif(kfcBlushAmt > 0.01){',
        '\t\t\tfloat bDist = length(vec2((afx - 0.48) / 0.26, (fy - 0.02) / 0.20));',
        '\t\t\tfloat bMask = (1.0 - smoothstep(0.25, 1.0, bDist)) * fm * kfcBlushAmt * 0.65;',
        '\t\t\tdiffuseColor.rgb = mix(diffuseColor.rgb, kfcBlushCol * shade, clamp(bMask, 0.0, 1.0));',
        '\t\t}',
        '\t\t// 3. Makeup: Eye Shadow & Eyeliner',
        '\t\tif(kfcEyeKind > 0.5 && kfcEyeAmt > 0.01){',
        '\t\t\tvec2 ep = vec2(afx - 0.41, fy - 0.315);',
        '\t\t\tfloat er = length(vec2(ep.x / 0.16, ep.y / 0.085));',
        '\t\t\tfloat eMask = 0.0;',
        '\t\t\tif(kfcEyeKind < 1.5){',
        '\t\t\t\t// Kohl liner rim',
        '\t\t\t\teMask = (1.0 - smoothstep(0.88, 1.35, er)) * smoothstep(0.42, 0.72, er);',
        '\t\t\t} else if(kfcEyeKind < 2.5){',
        '\t\t\t\t// Winged cat-eye liner + upper lid',
        '\t\t\t\tfloat rim = (1.0 - smoothstep(0.85, 1.45, er)) * smoothstep(0.42, 0.70, er) * smoothstep(-0.03, 0.02, ep.y);',
        '\t\t\t\tfloat wing = (1.0 - smoothstep(0.016, 0.035, abs(ep.y - (0.01 + 0.35 * (ep.x - 0.12))))) * smoothstep(0.10, 0.13, ep.x) * (1.0 - smoothstep(0.24, 0.28, ep.x));',
        '\t\t\t\teMask = max(rim, wing);',
        '\t\t\t} else if(kfcEyeKind < 3.5){',
        '\t\t\t\t// Smoky orbital shadow',
        '\t\t\t\tfloat erSm = length(vec2((ep.x - 0.02) / 0.21, (ep.y - 0.025) / 0.12));',
        '\t\t\t\teMask = (1.0 - smoothstep(0.55, 1.45, erSm)) * smoothstep(0.35, 0.62, er);',
        '\t\t\t} else if(kfcEyeKind < 4.5){',
        '\t\t\t\t// Courtly upper-lid & brow highlight',
        '\t\t\t\tfloat erHi = length(vec2(ep.x / 0.19, (ep.y - 0.045) / 0.095));',
        '\t\t\t\teMask = (1.0 - smoothstep(0.50, 1.35, erHi)) * smoothstep(-0.01, 0.03, ep.y) * smoothstep(0.38, 0.65, er);',
        '\t\t\t} else {',
        '\t\t\t\t// Gothic dark orbital smudge',
        '\t\t\t\tfloat erGo = length(vec2(ep.x / 0.20, (ep.y + 0.01) / 0.13));',
        '\t\t\t\teMask = (1.0 - smoothstep(0.65, 1.50, erGo)) * smoothstep(0.35, 0.60, er);',
        '\t\t\t}',
        '\t\t\tdiffuseColor.rgb = mix(diffuseColor.rgb, kfcEyeCol * shade, clamp(eMask * fm * kfcEyeAmt * 0.90, 0.0, 1.0));',
        '\t\t}',
        '\t\t// 4. Makeup: Lipstick (locked to Human.lips primitive + vermilion contour)',
        '\t\tif(kfcLipAmt > 0.01){',
        '\t\t\tfloat lx = afx / 0.305;',
        '\t\t\tfloat lipMask = 0.0;',
        '\t\t\tif(kfcIsLips > 0.5){',
        '\t\t\t\tlipMask = 1.0 - smoothstep(0.92, 1.15, lx);',
        '\t\t\t} else {',
        '\t\t\t\tfloat cupidsBow = 0.038 * cos(min(lx * 3.14159, 3.14159)) - 0.016 * exp(-pow(lx / 0.22, 2.0));',
        '\t\t\t\tfloat lyUp = -0.258 + cupidsBow - 0.035 * lx * lx;',
        '\t\t\t\tfloat lyBot = -0.342 + 0.062 * pow(lx, 1.75);',
        '\t\t\t\tfloat inLipBox = step(lx, 1.05) * smoothstep(lyBot - 0.025, lyBot + 0.012, fy) * (1.0 - smoothstep(lyUp - 0.010, lyUp + 0.022, fy)) * (1.0 - smoothstep(0.88, 1.04, lx));',
        '\t\t\t\t#ifdef USE_MAP',
        '\t\t\t\tfloat lipRed = smoothstep(0.018, 0.055, (texelColor.r - texelColor.g) / max(texelColor.r, 0.05));',
        '\t\t\t\tlipMask = inLipBox * (0.45 + 0.55 * lipRed);',
        '\t\t\t\t#else',
        '\t\t\t\tlipMask = inLipBox;',
        '\t\t\t\t#endif',
        '\t\t\t}',
        '\t\t\tdiffuseColor.rgb = mix(diffuseColor.rgb, kfcLipCol * shade * 1.08, clamp(lipMask * fm * kfcLipAmt, 0.0, 1.0));',
        '\t\t}',
        '\t}'
      ].join('\n');
      sh.fragmentShader = fragHead + sh.fragmentShader.replace('#include <map_fragment>', fragBody);
    };
    mat.customProgramCacheKey = function(){ return 'kfc-skin' + (isLips ? '-lips' : '') + (mat.userData.kp ? '-kp' : ''); };
    mat.needsUpdate = true;
    return u;
  }
  function faceCosmeticsSet(m, rec, gain){
    var fp = rec.facepaint || {}, mk = rec.makeup || {};
    var fpKind = FP_KIND[fp.style || 'none'] || 0, fpAmt = fp.amount == null ? 0.85 : +fp.amount;
    var lipAmt = +(mk.lips_amount || 0), eyeKind = EYE_MAKEUP_KIND[mk.eyes_style || 'none'] || 0, eyeAmt = +(mk.eyes_amount || 0), blushAmt = +(mk.blush_amount || 0);
    var active = (fpKind > 0 && fpAmt > 0.01) || lipAmt > 0.01 || (eyeKind > 0 && eyeAmt > 0.01) || blushAmt > 0.01;
    if(!active){
      if(m.material.userData.kfc) m.material.userData.kfc.kfcOn.value = 0;
      return;
    }
    var u = faceCosmeticsInit(m);
    u.kfcOn.value = 1;
    u.kfcFpKind.value = fpKind;
    u.kfcFpAmt.value = fpAmt;
    u.kfcFpC1.value.set(fp.color1 || '#2b5b84').convertSRGBToLinear();
    u.kfcFpC2.value.set(fp.color2 || '#e8e2d5').convertSRGBToLinear();
    u.kfcLipAmt.value = lipAmt;
    u.kfcLipCol.value.set(mk.lips_color || '#a82438').convertSRGBToLinear();
    u.kfcEyeKind.value = eyeKind;
    u.kfcEyeAmt.value = eyeAmt;
    u.kfcEyeCol.value.set(mk.eyes_color || '#1c1824').convertSRGBToLinear();
    u.kfcBlushAmt.value = blushAmt;
    u.kfcBlushCol.value.set(mk.blush_color || '#c85a64').convertSRGBToLinear();
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
        // face normals summed per source vertex over the full unfiltered mesh (index0), so hidden regions keep valid normals when revealed
        var acc = new Float32Array(3 * M.nsrc), ix = m.userData.index0 || (g.index ? g.index.array : null), nt = ix ? ix.length : P.length / 3;
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
  function highest(m){
    var P = m.geometry.attributes.position.array, y = -Infinity;
    for(var i=1;i<P.length;i+=3) if(P[i] > y) y = P[i];
    return y;
  }
  function lowest(m){
    var P = m.geometry.attributes.position.array, y = Infinity;
    for(var i=1;i<P.length;i+=3) if(P[i] < y) y = P[i];
    return y;
  }
  var tint = new THREE.Color(), DEFAULT_SKIN = '#d6ad8f', DEFAULT_HAIR = '#4a3424', DEFAULT_EYE = '#5a3a22';
  /* the body's skin in a lizard head's scales (kit item skin_detail: the head's map and normal map, repeated across the
     skin's UVs so the scales are the head's size), or back in its own maps */
  function skinDetail(m, det, src){
    var mt = m.material, u = m.userData;
    if(!('ownMap' in u)){ u.ownMap = mt.map; u.ownNormal = mt.normalMap; }
    var map = u.ownMap, nrm = u.ownNormal;
    if(det){
      var key = (src.material.map ? src.material.map.uuid : '') + det.repeat;
      if(u.detailKey !== key){
        u.detail = [src.material.map, src.material.normalMap].map(function(t){
          if(!t) return null;
          var c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(det.repeat, det.repeat); c.needsUpdate = true;
          return c;
        });
        u.detailKey = key;
      }
      map = u.detail[0] || map; nrm = u.detail[1];
    }
    if(mt.map !== map || mt.normalMap !== nrm){ mt.map = map; mt.normalMap = nrm; mt.needsUpdate = true; }
  }
  function tintOf(hexc, gain){ return tint.set(hexc).convertSRGBToLinear().multiplyScalar(gain); }

  /* leave out the triangles of a base region that `hide` (0/1 per triangle) marks */
  function filterBase(m, hide){
    var i0 = m.userData.index0; if(!i0 || !hide) return;
    var keep = [], n = i0.length / 3;
    for(var t=0;t<n;t++) if(!hide[t]) keep.push(i0[3*t], i0[3*t+1], i0[3*t+2]);
    m.geometry.setIndex(keep);
  }
  var ARM_UP_BONE = /^(Left|Right)(Arm|ForeArm|Hand)/;
  function filterArmourMods(m, bareUp, hasTail){
    var key = (bareUp ? 'A' : '') + (hasTail ? 'T' : '');
    if((m.userData.cutKey || '') === key) return;
    m.userData.cutKey = key;
    var i0 = m.userData.index0, g = m.geometry;
    if(!i0) return;
    if(!key){
      g.setIndex(i0);
      m.children.forEach(function(s){ if(s.userData.fur && s.userData.index0) s.geometry.setIndex(s.userData.index0); });
      return;
    }
    var n = g.attributes.position.count, aw = m.userData.armW;
    if(bareUp && !aw){
      aw = m.userData.armW = new Float32Array(n);
      var si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
      if(si && sw) for(var i = 0; i < n; i++) for(var k = 0; k < 4; k++){
        var j = si.getComponent ? si.getComponent(i, k) : si.array[4 * i + k], w = sw.array[4 * i + k];
        if(w && J[j] && ARM_UP_BONE.test(J[j].name)) aw[i] += w;
      }
    }
    var P0 = m.userData.morph ? m.userData.morph.pos0 : g.attributes.position.array;
    function dropTri(a, b, c){
      if(bareUp && (aw[a] > 0.35 || aw[b] > 0.35 || aw[c] > 0.35)) return true;
      return false;
    }
    var keep = [];
    for(var t = 0; t < i0.length; t += 3) if(!dropTri(i0[t], i0[t+1], i0[t+2])) keep.push(i0[t], i0[t+1], i0[t+2]);
    if(keep.length) g.setIndex(keep);
    m.children.forEach(function(s){
      if(!s.userData.fur || !s.userData.index0) return;
      var si0 = s.userData.index0, sk = [];
      for(var t = 0; t < si0.length; t += 3) if(!dropTri(si0[t], si0[t+1], si0[t+2])) sk.push(si0[t], si0[t+1], si0[t+2]);
      s.geometry.setIndex(sk);
    });
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
          // a tail and an animal head's jaw (mods with tail, jaw: tools/mods.py) are driven after each clip (tail, jaw)
          var worn = kit.style === 'mpfb' ? KCHAR.mods(rec, kit) : [];
          var wt = worn.filter(function(m){ return m.tail; })[0];
          if(!TL || !wt || TL.spec !== wt.tail) tailSetup(wt);
          var wj = worn.filter(function(m){ return m.jaw; })[0];
          JAW = wj ? wj.jaw : null;
          var hide = KCHAR.hidden(rec, kit), hideParts = KCHAR.hiddenParts(rec, kit), head = KCHAR.headOf(rec, kit);
          var top = rec.armour && rec.armour.torso && kit.items && kit.items.filter(function(it){ return it.id === rec.armour.torso; })[0];
          pushU.kcT.value = top && top.tucks ? TUCK : 0;
          // trousers (legs, not loose) under a loose top: the top's push clears them too (PAD_OVER more)
          var legs = rec.armour && rec.armour.legs && kit.items && kit.items.filter(function(it){ return it.id === rec.armour.legs; })[0];
          var feet = rec.armour && rec.armour.feet && kit.items && kit.items.filter(function(it){ return it.id === rec.armour.feet; })[0];
          // and under a loose top they are drawn in to the legs, so wide ones (harem pants) stay under it: all the way
          // under one that reaches below the knees (kit item long: a robe, the kimono), else down to its hem (kit item
          // hem: a fraction of the hip-to-ankle length), so below a shirt's hem they are as wide as they are (the
          // festive shirt showed the trousers through its front in a stride)
          pushU.kcS.value = top && top.loose && legs && (!legs.loose || (top.long && !top.cloth)) ? SQUEEZE : 0;
          pushU.kcSH.value = top && top.long ? 1e3 : top && top.hem != null ? top.hem : 0;
          // and boots under one, whatever the legs wear: their cuffs came through a kimono's hem at the shins
          pushU.kcSF.value = top && top.loose && top.long ? SQUEEZE_FEET : 0;
          // (a loose top over a loose skirt by the skirt's own pad more, so its hem stays outside it)
          // (every loose layer takes the hull from the lowest hem worn: from its own, a gown left a skirt's tent to come through it)
          var hemLow = 1e3;
          Object.keys(want).forEach(function(k){ var u = want[k].userData.pad; if(u && u.base) hemLow = Math.min(hemLow, want[k].userData.hem0); });
          Object.keys(want).forEach(function(k){ var u = want[k].userData.pad, pt = want[k].userData.part;
            if(u && u.base){ u.value = u.base + (pt.slot === 'torso' && legs && legs.loose ? PAD_SKIRT : 0); u.over.value = pt.slot === 'torso' && ((legs && !legs.loose) || (feet && top && top.long)) ? PAD_OVER : 0; u.hem.value = hemLow; } });
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
          // a legs item's fur lies between the top of the boots and the lowest hem of the top (furShells kfF)
          var feetTop = -1e3, hem = 1e3;
          Object.keys(want).forEach(function(k){ var pt = want[k].userData.part; if(pt.role !== 'armour') return;
            if(pt.slot === 'feet') feetTop = Math.max(feetTop, highest(want[k]));
            else if(pt.slot === 'torso') hem = Math.min(hem, lowest(want[k])); });
          Object.keys(want).forEach(function(k){ var u = want[k].userData.furBand, legs = want[k].userData.part.slot === 'legs';
            if(u) u.value.set(legs ? feetTop : -1e3, legs ? hem : 1e3); });
          self.morphDelta = mj ? mj.d : null;
          bones.forEach(function(b, i){ if(b !== self.hips) b.position.fromArray(p.t[i]); });
          self.inner.scale.setScalar(p.root * SCALE);
          self.inner.position.y = (p.ground || 0) * SCALE;
          if(p.stature) p.stature *= SCALE;
          var roles = (kit.tint && kit.tint.roles) || {}, gain = (kit.tint && kit.tint.gain) || {};
          // a lizard's head draws the body's skin in its scales (kit item skin_detail: that material's maps, tiled)
          var det = null;
          var neckCrest = null, pat = null;
          if(mpfb) KCHAR.mods(rec, kit).forEach(function(it){ if(it.skin_detail) det = it.skin_detail; if(it.crest_neck) neckCrest = it.crest_neck; if(it.pattern) pat = it.pattern; });
          // a frog's head's pattern over the body (kit item skin_detail mask: the texture of a primitive with no area)
          var maskSrc = det && det.mask && Object.keys(want).map(function(k){ return want[k]; }).filter(function(x){ return x.userData.srcMaterial === det.mask; })[0];
          var detSrc = det && Object.keys(want).map(function(k){ return want[k]; }).filter(function(x){ return x.userData.srcMaterial === det.material; })[0];
          var bareUp = mpfb && worn.some(function(x){ return x.group === 'arms_up'; });
          Object.keys(want).forEach(function(k){
            var m = want[k], part = m.userData.part;
            skinScale(m, p, mj && mj.d);
            if(part.role === 'armour'){
              filterArmourMods(m, part.slot === 'torso' && bareUp, (part.slot === 'torso' || part.slot === 'legs') && !!wt && m.userData.hem0 !== undefined && m.userData.hem0 < 0.88 && !!(m.userData.pad && m.userData.pad.base));
            }
            var role = roles[m.userData.srcMaterial];
            if(part.role === 'base'){
              // a MakeHuman base: only its skin primitive is masked; brows, lashes and nails stay
              if(kit.style !== 'mpfb') filterBase(m, hide[part.slot]);
              else if(m.userData.srcMaterial === kit.base_material){
                filterBase(m, hide.base); skinDetail(m, detSrc ? det : null, detSrc); coatShells(m, rec, gain, hide.base, coatEdge(rec));
                if(pat && maskSrc && maskSrc.material.map) patternSet(patternMat(m.material, true), rec, pat, gain, maskSrc.material.map);
                else if(m.material.userData.kp) m.material.userData.kp.kpOn.value = 0;
                faceCosmeticsSet(m, rec, gain);
              }
              else if(hideParts[m.userData.srcMaterial] || coatHides(rec)[m.userData.srcMaterial]) m.visible = false;     // the nipples under a top (kit hide_parts) or a coat
              else if(m.userData.srcMaterial === 'Human.nipple') skinDetail(m, detSrc ? det : null, detSrc);    // (the skin has holes under them)
              else if(m.userData.srcMaterial === 'Human.lips') faceCosmeticsSet(m, rec, gain);
            }
            // a lizard's crest down the neck under a worn item that covers the skin there (kit item crest_neck) is left out
            if(neckCrest && m.userData.srcMaterial === neckCrest.material) m.visible = !neckCrest.under.some(function(t){ return hide.base[t]; });
            var kpOn = m.material.userData.kp && m.material.userData.kp.kpOn.value > 0.5;
            if(role === 'pattern'){ patternSet(patternMat(m.material, false), rec, pat || {}, gain); m.material.color.set('#ffffff'); }
            else if(role === 'iris') m.material.color.copy(tintOf(rec.eye_color || (pat && pat.eye_color) || DEFAULT_EYE, 1));   // an animal's eye (amphibian.iris_texture)
            else if(role === 'skin' && kpOn) m.material.color.set('#ffffff');      // the colours are the pattern's
            else if(role === 'skin') m.material.color.copy(tintOf(pat ? patternColours(rec, pat).skin : rec.skin || DEFAULT_SKIN, gain.skin));
            else if(role === 'hair') m.material.color.copy(tintOf(rec.hair_color || DEFAULT_HAIR, gain.hair));
            else if(role === 'coat') m.material.color.copy(tintOf(rec.hair_color || DEFAULT_HAIR, gain.coat || gain.hair));   // a therian's head (tools/heads.py)
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
  var held = { R:null, L:null, R2:null, L2:null, both:false }, holders = {}, hangs = {}, propCache = {}, curlQ = new THREE.Quaternion();
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
      delete hangs[side];
      if(!id) return null;
      return propScene(id).then(function(scene){
        if(held[side] !== id) return;
        var m = scene.clone(true);
        m.traverse(function(o){ if(o.isMesh){ o.castShadow = true; o.frustumCulled = false; } });
        g.add(m);
        var p = prop(id);
        // a prop that hangs (a bucket, a lantern) or stands level (a bowl) turns on a pivot at the grip (hang())
        if(p.hang && side.length === 1){
          var pv = new THREE.Group(); g.remove(m); pv.add(m); g.add(pv);
          hangs[side] = { pivot:pv, axis:new THREE.Vector3().fromArray(p.hang).normalize() };
        }
        // in a lower hand (the forearm held forward in its guard) a prop with low_turn turns about its handle: the
        // shield stands up and faces outward instead of lying flat like a tray
        if(side.length > 1 && p.low_turn) m.rotation.y = (side.charAt(0) === 'L' ? 1 : -1) * p.low_turn * Math.PI / 180;
        if(side === 'L' && p.string) return makeBow(g, p);
      });
    }));
  };
  this.held = held;
  // the playing clip's data/clips.json entry (KCharFigure.clipData, the page fills it) and its time
  function clipNow(){ var a = self.action; return a ? { info:KCharFigure.clipData[a.getClip().name] || {}, t:a.time, dur:a.getClip().duration } : null; }
  function grip(){
    if(!skel.hands) return;
    slide();
    HANDS.forEach(function(side){
      var id = held[side] || (side === 'L' && held.both && support() ? held.R : null);
      if(side.length > 1 && holders[side]) holders[side].visible = !!self.fourArms;
      if(!id) return;
      var h = skel.hands[side], style = held[side] ? prop(id).grip : 'fist';
      if(style === 'flat') return;                            // an open hand under a bowl: the clip's own fingers
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
  /* a clip whose data says lead_left (the two-handed parry: the clip's left hand is above the right, toward the blade)
     takes a prop with a one-point support (the sword: a hand's width below the right hand) the other way round: the
     prop slides half the support's offset up through the right hand, which then holds below, and the left hand
     holds above it, so the forearms do not cross */
  function leadLeft(){
    var sp = support(), c = clipNow();
    return !!(sp && c && c.info.lead_left && sp[0] === sp[3] && sp[1] === sp[4] && sp[2] === sp[5]);
  }
  function slide(){
    var m = holders.R && holders.R.children[0]; if(!m) return;
    if(leadLeft()) m.position.fromArray(support(), 0).multiplyScalar(-0.5); else m.position.set(0, 0, 0);
  }
  var twoY = 0;
  function twoHands(dt){
    var sp = support();
    if(!sp){ hold2 = 1; twoY = 0; return; }
    var h = skel.hands.L, arm = h.arm || [byName.LeftArm, byName.LeftForeArm, byName.LeftHand];
    var up = bones[arm[0]], fore = bones[arm[1]], hand = bones[arm[2]];
    self.group.updateMatrixWorld(true);
    if(!tGL) tGL = new THREE.Matrix4().compose(V().fromArray(h.grip), Q().fromArray(h.grip.slice(3, 7)), V().set(1, 1, 1));
    var R = holders.R.matrixWorld;
    if(leadLeft()){ tA.fromArray(sp, 0).negate(); tB.copy(tA); }
    else { tA.fromArray(sp, 0); tB.fromArray(sp, 3); }
    tA.applyMatrix4(R); tB.applyMatrix4(R);
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
    // the thumb side is the clip's at the hold's first frame, kept while the clip plays: chosen afresh each frame it
    // flipped the hand half a turn round the hilt as the clip's hand passed square to it (Two-handed parry, 0.47 s)
    if(!twoY) twoY = tX.dot(tY) < 0 ? -1 : 1;
    if(twoY < 0) tY.negate();
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

  /* the face's points (data/clips.json faces: per body, metres from the head joint in the figure's frame at rest, the
     man's for a body without its own, times a giant's scale): they turn with the head. mouth: the lips; sip: where a
     cup's or a bite's middle is when it is at the lips; anchor: where a drawn bow's string hand rests, under the jaw;
     head: the skull's middle and its radius */
  var fOff = {}, fH = V(), fQ = Q(), fT = V(), fP = V(), fU = V();
  function facePoint(name, out){
    var F = KCharFigure.faces || {}, o = (F[kit.body] || F.mpfb_male || {})[name];
    if(!o) return null;
    if(!fOff[name]) fOff[name] = V().fromArray(o).applyQuaternion(Q().copy(pRest[byName.Head]).invert());
    var u = self.group.getWorldScale(cS).x * SCALE;
    self.headBone.getWorldQuaternion(fQ);
    out.copy(fOff[name]).multiplyScalar(u).applyQuaternion(fQ).add(self.headBone.getWorldPosition(fH));
    return o.length > 3 ? o[3] * u : 0;
  }

  /* bladeClear: a weapon's striking part (data/props.json blade, along the handle) that a clip swings through the head
     or the neck (Block 2: retargeted onto a broader head than it was made on) turns the wrist until it passes them: the
     keep-out is the skull's sphere (faces head, with the hair), a taper from it down to the neck joint (NECK_R) and the
     trunk's capsules (skeleton.json colliders), each widened by EDGE (half a blade's width, and a margin) */
  var bQ = Q(), bQ0 = Q(), bI = Q(), NECK_R = 0.065, EDGE = 0.035, RELAX = 0.3, bN = V(), bC = V(), bT = V(), bT2 = V(), bladeS = {};
  this.bladeNeed = [];
  function bladeClear(dt){
    self.bladeNeed = [];
    ['R', 'L'].forEach(function(side){
      var id = held[side], bl = id && prop(id).blade, m = holders[side] && holders[side].children[0];
      if(!bl || !m || !self.action || byName.Neck === undefined){ delete bladeS[side]; return; }
      var hand = bones[skel.hands[side].bone], u = self.group.getWorldScale(cS).x * SCALE;
      // the turn kept from the frame before (in the hand's own frame), easing back to the clip's: pushing on from it
      // keeps the blade on the side it went round, where starting afresh each frame could flip it across the head
      var kept = bladeS[side] || (bladeS[side] = Q());
      if(dt > 0) kept.slerp(bI, 1 - Math.exp(-dt / RELAX));
      bQ0.copy(hand.quaternion);
      hand.quaternion.multiply(kept); hand.updateMatrixWorld(true);
      var trunk = caps.filter(function(c){ return !c.pa && (c.a === byName.Hips || c.a === byName.Spine1); });
      self.group.updateMatrixWorld(true);
      for(var k = 0; k < 3; k++){
        var r = facePoint('head', fT); if(!r) break;
        bones[byName.Neck].getWorldPosition(bN);
        tA.set(0, bl[0], 0).applyMatrix4(m.matrixWorld); tB.set(0, bl[1], 0).applyMatrix4(m.matrixWorld);
        tU.subVectors(tB, tA);
        // the deepest of five spheres from the neck up to the skull's middle, and of five along each of the trunk's
        // capsules (a sword hung over the back went in at the shoulder blades)
        var need = 0;
        function sphere(c, rad){
          var s = THREE.MathUtils.clamp(tV.subVectors(c, tA).dot(tU) / Math.max(1e-9, tU.lengthSq()), 0, 1);
          tW.copy(tA).addScaledVector(tU, s);
          var d = tW.distanceTo(c);
          if(rad - d > need && d > 1e-6){ need = rad - d; tP.copy(tW); tE.copy(c); }
        }
        for(var q = 0; q <= 4; q++) sphere(bC.lerpVectors(bN, fT, q / 4), THREE.MathUtils.lerp(NECK_R * u, r, q / 4) + EDGE * u);
        trunk.forEach(function(cp){
          bones[cp.a].getWorldPosition(bT); bones[cp.b].getWorldPosition(bT2);
          for(var q = 0; q <= 4; q++) sphere(bC.lerpVectors(bT, bT2, q / 4), cp.r * u + EDGE * u);
        });
        self.bladeNeed.push(need);
        if(need <= 0) break;
        hand.getWorldPosition(tO);
        tK.subVectors(tP, tO);                                      // the lever from the wrist
        tX.crossVectors(tK, tV.subVectors(tP, tE));
        if(tK.length() < 1e-4 || tX.lengthSq() < 1e-12) break;
        turnWorld(hand, bQ.setFromAxisAngle(tX.normalize(), Math.min(0.8, need / tK.length())));
      }
      kept.copy(bQ0).invert().multiply(hand.quaternion);
    });
  }

  /* toFace: a clip that brings a hand to the face (data/clips.json face: a cup to the lips, a bite to the mouth, a bow's
     string to the anchor under the jaw) has that hand's point (face.point, in its grip frame) moved onto the face's point
     (face.at) by a two-bone solve of the arm, the hand keeping its turn. With face.when (clip seconds) it does so in those
     spans, easing in over face.ease from a span's start and out over it after its end (a bow's full draw, held to the
     loose: its draw from the quiver passes the face too); without, only as near as the clip brings it: in full within face.near[0] of
     the point, not at all beyond face.near[1], so a reach elsewhere (a draw from the quiver) is left alone. face.level:
     the most degrees a bow's arrow may point up, from the string hand to the bow hand (the bow arm comes down to it) */
  var NEAR = [0.12, 0.3];
  function faceWeight(fc, c, d, u){
    if(fc.when){
      var e = fc.ease == null ? 0.2 : fc.ease, w = 0;
      // a span from a loop's start or to its end runs on round the loop: no easing there
      fc.when.forEach(function(s){ w = Math.max(w, Math.min(s[0] <= 0 ? 1 : THREE.MathUtils.smoothstep(c.t, s[0], s[0] + e),
                                                        s[1] >= c.dur - 1e-3 ? 1 : 1 - THREE.MathUtils.smoothstep(c.t, s[1], s[1] + e))); });
      return w;
    }
    var n = fc.near || NEAR;
    return THREE.MathUtils.smoothstep(n[1] * u - d, 0, (n[1] - n[0]) * u);
  }
  this.faceW = 0;
  function toFace(){
    self.faceW = 0;
    var c = clipNow(), fc = c && c.info.face, h = fc && skel.hands && skel.hands[fc.hand];
    if(!h || !h.arm) return;
    self.group.updateMatrixWorld(true);
    var u = self.group.getWorldScale(cS).x * SCALE;
    if(facePoint(fc.at, fT) === null) return;
    var g = holder(fc.hand);              // an empty hand too: a bow's string hand
    fP.fromArray(fc.point || [0, 0, 0]).applyMatrix4(g.matrixWorld);
    var w = self.faceW = faceWeight(fc, c, fP.distanceTo(fT), u);
    if(!(w > 0)) return;
    var hand = bones[h.arm[2]];
    hand.getWorldPosition(fH).addScaledVector(fU.subVectors(fT, fP), w);
    reachArm(bones[h.arm[0]], bones[h.arm[1]], hand, fH, hand.getWorldQuaternion(fQ));
    if(fc.level != null && fc.hand === 'R' && held.L && holders.L) level(fc.level + (1 - w) * 90, g);
  }
  // the bow arm lowers (about its shoulder) until the arrow, string hand to bow hand, points up no more than deg
  function level(deg, g){
    var arm = skel.hands.L.arm; if(!arm) return;
    var up = bones[arm[0]], u = self.group.getWorldScale(cS).x * SCALE;
    for(var k = 0; k < 2; k++){
      g.getWorldPosition(tA); holders.L.getWorldPosition(tB);
      tU.subVectors(tB, tA);
      var len = tU.length(), pitch = Math.asin(THREE.MathUtils.clamp(tU.y / Math.max(len, 1e-6), -1, 1)), over = pitch - deg * Math.PI / 180;
      if(over <= 1e-3) return;
      up.getWorldPosition(tO);
      tK.subVectors(tB, tO);
      tX.crossVectors(tK, tV.set(0, -1, 0));                       // turning about it takes the bow hand down
      if(tX.lengthSq() < 1e-10) return;
      // the bow hand must come down by about len * (sin pitch - sin max) over the arm's lever
      var drop = len * (Math.sin(pitch) - Math.sin(pitch - over)), lever = Math.max(0.1 * u, Math.hypot(tK.x, tK.z));
      turnWorld(up, bQ.setFromAxisAngle(tX.normalize(), Math.min(0.6, drop / lever)));
    }
  }

  /* carry: a prop with data/props.json carry (a bowl) is held in front of the belly: the hand's wrist goes to carry
     (metres from the lower spine joint in the figure's frame: out to the hand's side, up, forward; mirrored for the left
     hand; a giant's times its scale) by the arm's two-bone solve, the hand keeping its turn. The clip held the arm back
     and down, through the bowl */
  function carry(){
    if(byName.Spine === undefined) return;
    ['R', 'L'].forEach(function(side){
      var id = held[side], h = skel.hands[side], c = id && prop(id).carry;
      if(!c || !h || !h.arm) return;
      var hand = bones[h.arm[2]], u = self.group.getWorldScale(cS).x * SCALE;
      self.group.updateMatrixWorld(true);
      uF.set((side.charAt(0) === 'R' ? 1 : -1) * c[0], c[1], c[2]).multiplyScalar(u).applyQuaternion(self.group.getWorldQuaternion(uQ));
      bones[byName.Spine].getWorldPosition(uE).add(uF);
      reachArm(bones[h.arm[0]], bones[h.arm[1]], hand, uE, hand.getWorldQuaternion(uQ));
    });
  }

  /* standUp: a prop with data/props.json upright (its grip-frame axis that should point up: a cup's mouth, a bowl's
     opening) turns the wrist so it does, as far as the hand is not bringing it to the face (toFace's weight): the cup
     stands upright in the hand (the left hand held it upside down) and tips only to drink; the hand under a bowl turns
     palm up so the bowl sits on it */
  var uQ = Q(), uA = V(), uU = V(0, 1, 0), uF = V(), uE = V();
  function standUp(){
    carry();
    var c = clipNow(), fc = c && c.info.face;
    ['R', 'L'].forEach(function(side){
      var id = held[side], up = id && prop(id).upright, g = holders[side];
      if(!up || !g) return;
      var w = 1 - (fc && fc.hand === side ? self.faceW : 0);
      if(!(w > 0)) return;
      self.group.updateMatrixWorld(true);
      uA.fromArray(up).normalize().applyQuaternion(g.getWorldQuaternion(uQ));
      uQ.setFromUnitVectors(uA, uU.set(0, 1, 0));
      if(w < 1) uQ.slerp(bQ0.identity(), 1 - w);
      turnWorld(bones[skel.hands[side].bone], uQ);
    });
  }

  /* hang: a prop with data/props.json hang (its axis that points down) turns about the grip so that axis points down
     whatever the hand's turn: a bucket and a lantern hang from their bails, a bowl stands level on the palm */
  var hQ = Q(), hD = V();
  function hang(){
    var sides = Object.keys(hangs); if(!sides.length) return;
    self.group.updateMatrixWorld(true);
    sides.forEach(function(side){
      var h = hangs[side], g = holders[side]; if(!g) return;
      g.getWorldQuaternion(hQ);
      h.pivot.quaternion.setFromUnitVectors(h.axis, hD.set(0, -1, 0).applyQuaternion(hQ.invert()));
    });
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
  // the cloth as if the figure had just been dressed: the chains at their rigid rest, the clock and the step accumulator
  // at zero, so a shot (tools/shots.py, tools/garment_audit.py) is the same whatever ran before it
  this.clothReset = function(){ clothStep(); clothAcc = 0; nhT = 0; };
  this.pushState = function(){ return pushU; };                                  // tools: the push's capsules (w 0: off)
  var GRAV = 7.4, DRAG = 1.6, DAMP = 0.04, STEP = 1 / 60, PAD = 0.022;
  var clothItems = {}, itemByKey = {}, caps = [], groundY = 0, clothAcc = 0;
  (kit.items || []).forEach(function(it){ itemByKey[KCHAR.key(it.glb)] = it; });
  // a joint's name as three's loader leaves it (PropertyBinding.sanitizeNodeName: no [ ] . : /, spaces to _)
  function clothKey(n){ return n.replace(/\s/g, '_').replace(/[\[\]\.:\/]/g, ''); }
  var SLOT_RANK = { legs:0, torso:1, back:2, head:3 };
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
    // (an item worn over a higher slot's under-layers ranks with it: kit item over, tools/layers.py OVER: pteruges)
    var rank = 3 * (SLOT_RANK[it.over || it.slot] || 0);
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
      var hipY = new THREE.Vector3().setFromMatrixPosition(prS.copy(m.skeleton.boneInverses[byName.Hips]).invert()).y;
      c.chains.forEach(function(ch){
        ch.whole = ch.p.every(function(q){ return q.y > hipY; });
        ch.upCrest = ch.p.length > 1 && ch.p[ch.p.length - 1].y > ch.p[0].y + 0.005;
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
  var rtS = new THREE.Matrix4(), rtV = new THREE.Vector3(), rtM = new THREE.Matrix4(), rtH = new THREE.Matrix4(), rtN = new THREE.Matrix3(), rtW = new THREE.Vector3(), rtU = new THREE.Vector3(), rtX = new THREE.Vector3(), LEGJ = /UpLeg|Leg$|LegTwist|Foot|Toe/;
  function rigidTargets(c, ch){
    var pb = bones[ch.parent], inv = c.meshes[0].skeleton.boneInverses;
    cM.multiplyMatrices(pb.matrixWorld, inv[ch.parent]);   // model -> world, riding the joint
    if(!(ch.bw && self.action)){
      for(var k = 0; k < ch.rest.length; k++) (ch.tw[k] = ch.tw[k] || new THREE.Vector3()).copy(ch.rest[k]).applyMatrix4(cM);
      return cM;
    }
    /* while a clip plays, a chain's rest is where the garment's own body weights put each point in this pose (kit bw):
       held rigid by its parent joint, a mantle's back hanging from the chest stayed while the spine under it bent in
       the clip and the posture, and sank into the body under the tunic it covers. The chains add the motion only. Not
       the legs' weights (LEGJ): below the hips they are what a skirt's are, and a robe's skirt and cape followed the
       thighs round the front in a stride; what is left there is the hips'. A chain that reaches below the hip joint
       (a robe's skirt, a long cape) moves with its top point only and keeps the shape it was fitted in, turned with
       the hips (whole false): followed point by point, a robe's back bunched at the legs; turned with the spine joint
       it hangs from, which the retargeted clips pitch hard while the pelvis makes up for it, a cape's hem swung 0.7 m
       off the body and every bone of it measured as folded (the fold: 60 to 90 bones past 1.5 rad on the court robe).
       The frame returned is the one the bones turn in (clothStep), so the mesh keeps to the rest */
    var n = ch.whole ? ch.p.length : 1;
    for(var k = 0; k < n; k++){
      var t = ch.tw[k] = ch.tw[k] || new THREE.Vector3(), tot = 0;
      t.set(0, 0, 0);
      (ch.bw[k] || []).forEach(function(nw){
        // (the top point with all its weights: it is the body-weighted cloth's own vertex, and placed by the hips alone a
        // skirt's root at the back sank 10 cm between the thighs, which threw the point below it out sideways)
        var j = byName[nw[0]]; if(j === undefined || (k > 0 && LEGJ.test(nw[0]))) return;
        t.addScaledVector(rtV.copy(ch.p[k]).applyMatrix4(rtS.multiplyMatrices(bones[j].matrixWorld, inv[j])), nw[1]); tot += nw[1];
      });
      if(tot > 0) t.divideScalar(tot); else t.copy(ch.rest[k]).applyMatrix4(cM);
    }
    var F = cM;
    // a loose chain above the hips hangs: its fitted shape from its top point, turned with the hips' heading only, by
    // how loose it is (stiffness 0.1 and under wholly, 0.3 and over not at all: a mantle that lies on the shoulders
    // follows the body, or it tore at the shoulder blades). Followed point by point, the Chichani tilma's front tilted
    // out 45 degrees with the idle's forward lean and stood off like a shelf (its fitted shape hangs within 5)
    var GW = (ch.parent === byName.Head || ch.upCrest) ? 0 : THREE.MathUtils.clamp((0.3 - ch.stiff) / 0.2, 0, 1);
    if(ch.whole && GW > 0){
      var He = rtH.multiplyMatrices(bones[byName.Hips].matrixWorld, inv[byName.Hips]).elements;
      var hs = Math.hypot(He[8], He[9], He[10]), hh = Math.hypot(He[8], He[10]) || 1, hx = He[8] / hh * hs, hz = He[10] / hh * hs;
      rtN.set(hz, 0, hx, 0, hs, 0, -hx, 0, hz);
      rtX.copy(ch.tw[0]);
      for(var k = 1; k < ch.p.length; k++){
        rtX.add(rtW.subVectors(ch.p[k], ch.p[k - 1]).applyMatrix3(rtN));
        ch.tw[k].lerp(rtX, GW);
      }
    }
    if(!ch.whole){
      F = rtH.multiplyMatrices(bones[byName.Hips].matrixWorld, inv[byName.Hips]);
      // placed by the hips, turned with their heading only (keeping their scale): cloth below them hangs, and turned
      // with the whole pelvis, the idle's tilt of it swung a panel hanging 1 m from the chest into the legs. The top
      // point's own offset (the chest leans 10 cm ahead of the hips in an idle) fades out down to the hip joint: carried
      // whole, a back panel's lower points sank into the buttocks and the layering threw them out in front, through
      // the body, wide as a wing (the court robes, the chief's apron)
      var fe = F.elements, fs = Math.hypot(fe[8], fe[9], fe[10]), fh = Math.hypot(fe[8], fe[10]) || 1;
      var fx = fe[8] / fh * fs, fz = fe[10] / fh * fs;
      var Hm = rtW.setFromMatrixPosition(rtS.copy(inv[byName.Hips]).invert()), Hw = rtU.setFromMatrixPosition(bones[byName.Hips].matrixWorld);
      F.set(fz, 0, fx, 0, 0, fs, 0, 0, -fx, 0, fz, 0, 0, 0, 0, 1);
      rtX.copy(Hm).applyMatrix4(F); F.setPosition(Hw.x - rtX.x, Hw.y - rtX.y, Hw.z - rtX.z);
      var off = rtX.copy(ch.p[0]).applyMatrix4(F).negate().add(ch.tw[0]), y0 = ch.p[0].y, hy = Hm.y, span = Math.max(1e-4, y0 - hy, off.length() * 3.5);
      for(var k = 1; k < ch.p.length; k++){
        var fk = THREE.MathUtils.clamp(1 - (y0 - ch.p[k].y) / span, 0, 1);
        (ch.tw[k] = ch.tw[k] || new THREE.Vector3()).copy(ch.p[k]).applyMatrix4(F).addScaledVector(off, fk);
      }
    }
    // the root joint where its point is (a child of the parent joint: placed in its frame)
    var b0 = ch.bones[0];
    b0.position.copy(ch.tw[0]).applyMatrix4(rtM.copy(pb.matrixWorld).invert());
    b0.updateMatrixWorld(true);
    return F;
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
    var saved = bones.map(function(b){ return b.quaternion.clone(); }), hipsAt = self.hips.position.clone();
    bones.forEach(function(b, i){ b.quaternion.fromArray(J[i].r); });
    // and the hips at their rest, with the morph alone: left where the clip playing at dressing had them, the rests
    // came out a few ulps apart from one page load to the next (the frame they are taken back into cancels a
    // translation exactly on paper, not in floating point), and a run grew that into a shin through a skirt in one
    // audit sweep and not the next (REVIEW-GARMENTS-2026-11-06.md, section 6)
    self.hips.position.fromArray(J[byName.Hips].t); hipsMorph();
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
    self.hips.position.copy(hipsAt);
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
        // a slit's two lips part from its top down (make_mpfb.py gaps)
        var gp = (pt.gaps || []).filter(function(x){ return x[0] === a; })[0];
        if(gp) kk = Math.min(kk, gp[1]);
        for(var k = 1; k < kk; k++) c.ring.push([A, Bc, k, A.rest[k].distanceTo(Bc.rest[k])]);
      }
    });
    c.reset = true;
  }
  function clothStep(dt){
    var items = Object.keys(clothItems).map(function(k){ return clothItems[k]; }).filter(function(c){ return c.on && c.chains.length && c.chains[0].p.length; });
    if(!items.length) return;
    items.sort(function(a, b){ return (a.chains[0].layer || 0) - (b.chains[0].layer || 0); });
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
      var rMax = Math.max(cp.r, cp.ra || 0, cp.rb || 0);
      return { a:A, b:B, aBone:cp.a, r:rMax * sc + PAD, r0:cp.r * sc, ra:(cp.ra || cp.r) * sc, rb:(cp.rb || cp.r) * sc, leg:LEGJ.test(bones[cp.a].name), seat:!!cp.pa };
    });
    // the seat's two upright capsules as one across the buttocks, for the chains: a skirt's point at the back between
    // them went out of one toward the other and out of that, sideways, and its chain kinked at the top (the fold)
    var seats = W.filter(function(w){ return w.seat; });
    if(seats.length === 2){
      W = W.filter(function(w){ return !w.seat; });
      W.push({ a:seats[0].a.clone().add(seats[0].b).multiplyScalar(0.5), b:seats[1].a.clone().add(seats[1].b).multiplyScalar(0.5),
               r:seats[0].r, leg:false });
    }
    // and the feet (footEnds): a chain knew the shin and not the heel kicked up past it
    FOOTSIDE.forEach(function(sd, i){
      var cp = caps.filter(function(c){ return c.a === byName[sd + 'Leg'] && c.b === byName[sd + 'Foot']; })[0];
      if(!cp) return;
      var A = bones[byName[sd + 'Foot']].getWorldPosition(new THREE.Vector3()), B = bones[byName[sd + 'ToeBase']].getWorldPosition(new THREE.Vector3()), fr = footR(cp) * sc;
      footEnds(i, null, sc, A, B);
      W.push({ a:A, b:B, r:fr + PAD, r0:fr, ra:fr, rb:fr, leg:true, seat:false });
      var thW = W.filter(function(w){ return w.aBone === byName[sd + 'UpLeg']; })[0], shW = W.filter(function(w){ return w.aBone === byName[sd + 'Leg']; })[0];
      if(thW && shW && Math.abs(shW.b.y - shW.a.y) < 0.7 * shW.a.distanceTo(shW.b)){
        W.push({ a:thW.a.clone().add(thW.b).multiplyScalar(0.5), b:shW.a.clone().add(shW.b).multiplyScalar(0.5),
                 r:shW.rb + PAD, r0:shW.rb, ra:shW.ra, rb:shW.rb, leg:true, seat:false });
      }
    });
    groundY = self.group.getWorldPosition(cV3).y + 0.008;
    // the air: still, or the wind of walking in place, plus core/atmos wind (ATMOS.windAt / ATMOS.U.wind) or self.wind
    var meta0 = self.action && meta[self.action.getClip().name], wind = new THREE.Vector3();
    if(meta0 && meta0.loop !== false && meta0.root_speed) wind.fromArray(meta0.root_speed).applyQuaternion(self.group.getWorldQuaternion(cQ3)).multiplyScalar(-sc);
    if(self.wind){
      if(Array.isArray(self.wind)) wind.x += self.wind[0] || 0, wind.y += self.wind[1] || 0, wind.z += self.wind[2] || 0;
      else wind.add(self.wind);
    } else if(typeof window !== 'undefined' && window.ATMOS){
      var atm = window.ATMOS, tAtm = (atm.U && atm.U.time ? atm.U.time.value : nhT) || 0;
      if(typeof atm.windAt === 'function'){
        var w2 = atm.windAt(tAtm, cV3.x, cV3.z);
        if(w2){ wind.x += (w2[0] || 0) * sc; wind.z += (w2[1] || 0) * sc; }
      } else if(atm.U && atm.U.wind && atm.U.wind.value){
        wind.x += (atm.U.wind.value.x || 0) * sc; wind.z += (atm.U.wind.value.y || 0) * sc;
      }
    }
    // (no made-up breeze without ATMOS: one ran on the page's clock here from 2026-11-02 to 06, so robes never rested in
    // the lab and the audit's shots depended on how long the sweep had run: REVIEW-GARMENTS-2026-11-06.md, issue 10)
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
          var upCrest = !!ch.upCrest, dragK = upCrest ? DRAG * 2.2 : DRAG, gravK = upCrest ? GRAV * 0.14 : GRAV;
          ch.x[0].copy(ch.tw[0]); ch.xp[0].copy(ch.tw[0]);
          for(var k = 1; k < ch.x.length; k++){
            var x = ch.x[k], xp = ch.xp[k];
            cV.subVectors(x, xp);                                     // velocity x h
            cV2.copy(wind).multiplyScalar(h).sub(cV).multiplyScalar(dragK * h);  // drag toward the air's motion
            if(upCrest){
              var fl = (k / ch.x.length) * h * h;
              cV2.x += 1.4 * Math.sin(nhT * 4.6 + k * 0.7 + (ch.pts[0] || 0) * 0.3) * fl;
              cV2.z += 1.1 * Math.cos(nhT * 3.8 + k * 0.6) * fl;
            }
            cV2.y -= gravK * h * h;
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
        c.chains.forEach(function(ch){
          for(var k = 1; k < ch.x.length; k++) keepLen(ch, k);
          collide(ch, W);
          if(!ch.upCrest){
            for(var k2 = ch.x.length - 2; k2 > 0; k2--){
              if(ch.x[k2].y < ch.x[k2 + 1].y + 0.015) ch.x[k2].y = Math.min(ch.x[k2 - 1].y - 0.01, ch.x[k2 + 1].y + 0.015);
            }
          }
          collide(ch, W);
        });
        c.ring.forEach(function(r){
          var a = r[0].x[r[2]], b = r[1].x[r[2]], d = a.distanceTo(b), lo = r[3] * 0.6, hi = r[3] * 1.2;
          if(d > hi || (d < lo && d > 1e-6)){
            var want = d > hi ? hi : lo, f = (d - want) / d * 0.5;
            cV.subVectors(b, a).multiplyScalar(f); a.add(cV); b.sub(cV);
          }
        });
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
          // the joint where its point is: its offset from the rest (placeChains, the postured rest) turned by this frame, built
          // on the A-pose's, left it up to 30 cm off on the man at an idle, each joint a step: the skirts' staircase
          // (a segment the last collide stretched gives a third of the stretch to the joint: all of it, it fell in the two rows
          // of the weights' blend under the joint and smeared a cape's border; the rest of each segment keeps its length)
          if(k > 0){
            cV.subVectors(ch.x[k], ch.x[k - 1]);
            var dk = cV.length(), Lk = ch.len[k - 1];
            if(dk > Lk) cV.multiplyScalar((Lk + 0.35 * (dk - Lk)) / dk);
            b.position.copy(cV).applyQuaternion(cQ3.copy(prev).invert()).divideScalar(sc);
          }
          prev = Wq;
        });
      });
    });
  }
  // out of the capsules and above the floor (last: a point may stretch its bone a little rather than sink in)
  var hipW = new THREE.Vector3(), cO = new THREE.Vector3(), cAx = new THREE.Vector3(), cLat = new THREE.Vector3();
  function collide(ch, W){
    bones[byName.Hips].getWorldPosition(hipW);
    // across the hips, level: the side a leg's capsule lies on
    bones[byName.LeftUpLeg].getWorldPosition(cLat); bones[byName.RightUpLeg].getWorldPosition(cO);
    cLat.sub(cO).setY(0).normalize();
    for(var k = 1; k < ch.x.length; k++){
      var x = ch.x[k], up = ch.x[k - 1], rw = ch.tw[k];
      W.forEach(function(cp){
        cV.subVectors(cp.b, cp.a);
        var lsq = Math.max(1e-9, cV.lengthSq());
        // no further out than the point's own rest lies: a robe's chain roots sit inside the trunk's and hips' capsules
        // (the cloth there lies on the body), and the point below each was thrown out sideways to the capsule's
        // surface, a Z at every chain's top (the fold: 60 to 90 bones past 1.5 rad on the court robe)
        var rt = THREE.MathUtils.clamp(cV3.subVectors(rw, cp.a).dot(cV) / lsq, 0, 1);
        cV3.copy(cp.a).addScaledVector(cV, rt);
        // (on a leg, no less than the bare limb: a skirt's rest follows the hips, and the thigh swung forward in a stride
        // over it would take the cloth in)
        var t = THREE.MathUtils.clamp(cV2.subVectors(x, cp.a).dot(cV) / lsq, 0, 1);
        var rLimb = cp.leg ? (cp.ra !== undefined ? cp.ra + (cp.rb - cp.ra) * t : cp.r0) + 0.015 : 0;
        var r = Math.min(cp.r, Math.max(rw.distanceTo(cV3), rLimb));
        cAx.copy(cV).normalize();
        cV2.copy(cp.a).addScaledVector(cV, t);
        var d = x.distanceTo(cV2);
        if(d < r && d > 1e-6){
          // across a limb that lies across the cloth's fall (a seated thigh, a raised arm: nearer level than upright),
          // out on the side of the point above, so the chain drapes over it rather than passing under; along an
          // upright limb, out the side away from the body's axis, so cloth never ends up behind a leg in a stride
          cV.subVectors(x, cV2);
          cO.subVectors(up, cV2); cO.addScaledVector(cAx, -cO.dot(cAx));
          var ol = Math.abs(cAx.y) < 0.7 && cO.y > 0 ? cO.length() : 0, cs = 0;
          if(ol > 1e-4){ cO.divideScalar(ol); cs = cV.dot(cO); if(cs < 0) cV.addScaledVector(cO, -2 * cs); }
          if(cp.leg && cO.subVectors(rw, cV2).dot(cLat) * Math.sign((cV2.x - hipW.x) * cLat.x + (cV2.z - hipW.z) * cLat.z) > -0.5 * cp.r){
            // (the legs only: on the trunk's capsules, the chest leaning forward of the hips in a clip, it threw a
            // mantle's points at the back of the neck through the body to the front; and not for a point whose rest
            // lies on the thigh's inner side, between the legs: a skirt's back centre, thrown out through the thigh)
            var mid = 1.0 - THREE.MathUtils.smoothstep(Math.abs((rw.x - hipW.x) * cLat.x + (rw.z - hipW.z) * cLat.z), 0.03, 0.11);
            cO.set(cV2.x - hipW.x, 0, cV2.z - hipW.z);
            cO.addScaledVector(cLat, -cO.dot(cLat) * mid * 0.85);
            if(cO.lengthSq() > 9e-4){ cO.normalize(); cs = cV.dot(cO); if(cs < 0) cV.addScaledVector(cO, -2 * cs); }
            if(mid > 0) cV.addScaledVector(cLat, (cO.subVectors(rw, cV2).dot(cLat) - cV.dot(cLat)) * mid * 0.7);
          }
          x.copy(cV2).addScaledVector(cV.normalize(), r);
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
      if(!L || ch.upCrest) return;
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
     thickness, and a torso garment by 2 cm more (PAD_TOP), so a robe's hem lies over the skirt it covers, and up to 3.5 cm more again over
     trousers (PAD_OVER, as the limb swings), which stand out of the capsules more than a skirt's chains do. The push is a thin band,
     not a projection: a vertex d from the bone within r + 1.5 cm lands at r - 1.5 cm + d * 3 cm / (r + 1.5 cm), so
     two tiers of one skirt keep their order instead of meeting on one surface, and cloth that already lies right
     barely moves */
  // NCAP capsules: the ten of LEGS, four more for a giant's lower arms (left at radius 0, so skipped, on other bodies)
  // and the two of the seat (14, 15: skeleton.json colliders with rest ends, soft like the legs')
  var NCAP = 16, NHULL = 12, capV = function(n){ var a = []; for(var i = 0; i < (n || NCAP); i++) a.push(new THREE.Vector4()); return a; };
  var pushU = { kcA:{ value:capV() }, kcR:{ value:new Array(NCAP).fill(0) },
                kcB:{ value:capV() }, kcH:{ value:new THREE.Vector3() }, kcE:{ value:capV(NHULL) }, kcTl:{ value:new THREE.Matrix3() },
                kcT:{ value:0 }, kcS:{ value:0 }, kcSF:{ value:0 }, kcSH:{ value:0 }, kcM:{ value:0 }, kcK:{ value:0 }, kcU:{ value:new THREE.Vector3(0, 1, 0) } }, noTuck = { value:0 }, TUCK = 0.025, PAD_TOP = 0.02, PAD_SKIRT = 0.02, PAD_OVER = 0.035,
      SQUEEZE = 0.008, SQUEEZE_FEET = 0.014;
  /* every top and every pair of trousers or skirt goes through here: loose ones (kcL) are pushed out of the limbs;
     under a top that closes round the waist (kit item tucks) trousers' and skirts' bands above the hips are drawn in
     toward the body's axis by up to TUCK (kcT), so a waistband stays under the top in any pose; under a loose top
     trousers below the hips are drawn in to within SQUEEZE of the legs' capsules (kcS: the first six, thighs, shins and
     feet), so wide ones stay under it: all the way down under one that reaches below the knees (kit item long), else
     to its hem (kcSH, kit item hem), measured down the leg so a raised thigh keeps it. The radius is the tapered
     one (ra to rb): at one radius per capsule (a median of the leg's surface) the trousers sank into the calves and,
     the skin under them hidden, the court's legs read thin; a looser squeeze (2.5 cm) put them out through the robes'
     knees instead. Each vertex is drawn to its nearest capsule only: drawn to all six, a shin's was pulled into a ball
     round the knee (the thigh's end) and the inside of each leg toward the other, and the court's legs came out thin.
     Up to 30 cm out: at 15 cm a harem pants' bulge was left as it was below a kimono, and the boots' tops (drawn in
     to SQUEEZE_FEET, outside the trousers' SQUEEZE) came through it at the shin */
  var BACK_DEPTH = 0.01;
  var KNEE = 0.04;     // how far a fully bent knee's corner stands out of its two capsules (kchar_push.gdshader)
  function pushOut(mat, pad, loose, legs, feet){
    var prev = mat.onBeforeCompile, padU = { value:pad || 0, base:pad || 0, over:{ value:0 }, slit:{ value:-1 }, hem:{ value:0 }, only:{ value:0 } }, looseU = { value:typeof loose === 'number' ? loose : (loose ? 1 : 0) };
    mat.onBeforeCompile = function(sh, r){
      if(prev) prev(sh, r);
      sh.uniforms.kcA = pushU.kcA; sh.uniforms.kcB = pushU.kcB; sh.uniforms.kcR = pushU.kcR; sh.uniforms.kcH = pushU.kcH; sh.uniforms.kcU = pushU.kcU; sh.uniforms.kcP = padU; sh.uniforms.kcPO = padU.over; sh.uniforms.kcM = pushU.kcM; sh.uniforms.kcK = pushU.kcK; sh.uniforms.kcSl = padU.slit;
      sh.uniforms.kcE = pushU.kcE; sh.uniforms.kcHm = padU.hem; sh.uniforms.kcEO = padU.only; sh.uniforms.kcTl = pushU.kcTl;
      sh.uniforms.kcL = looseU; sh.uniforms.kcT = legs ? pushU.kcT : noTuck; sh.uniforms.kcS = legs ? pushU.kcS : feet ? pushU.kcSF : noTuck; sh.uniforms.kcSH = feet ? { value:1e3 } : pushU.kcSH;
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
      sh.vertexShader = 'uniform vec4 kcA[' + NCAP + '];\nuniform vec4 kcB[' + NCAP + '];\nuniform vec4 kcE[' + NHULL + '];\nuniform float kcHm;\nuniform float kcEO;\nuniform mat3 kcTl;\nuniform float kcR[' + NCAP + '];\nuniform vec3 kcH;\nuniform vec3 kcU;\nuniform float kcP;\nuniform float kcPO;\nuniform float kcM;\nuniform float kcK;\nuniform float kcSl;\nuniform float kcL;\nuniform float kcT;\nuniform float kcS;\nuniform float kcSH;\n' + sh.vertexShader.replace('#include <skinning_vertex>',
        '#include <skinning_vertex>\n\tvec3 cbk = (kcA[14].xyz + kcA[15].xyz) * 0.5 - kcH; cbk.y = 0.0; cbk *= kcA[14].w > 0.0 ? 1.0 / max(length(cbk), 1e-5) : 0.0; vec3 clat = vec3(cbk.z, 0.0, -cbk.x);\n' +
        '\tfloat cflap = kcL > 0.1 && kcL < 0.5 && kcS > 0.0 && kcSH < 1.0 && length(position.xz) > 0.142 && position.y > 0.45 && abs(dot(transformed - kcH, cbk)) > abs(dot(transformed - kcH, clat)) * 1.1 ? 1.0 : 0.0;\n' +
        '\tfloat cloose = (kcL > 0.5 && !(kcS > 0.0 && kcSH > 10.0)) || cflap > 0.5 ? 1.0 : 0.0, ceo = kcEO > 0.5 && cloose > 0.5 && (abs(position.x) < 0.22 || position.y < 0.88) ? 1.0 : 0.0, cstr = smoothstep(0.35, 0.85, kcM), cshort = smoothstep(0.32, 0.44, kcHm);\n' +
        '\tfloat crr = length(position.xz), ctier = clamp(crr - (0.24 - 0.12 * clamp(position.y, 0.0, 0.80)), 0.0, 0.16) * smoothstep(0.15, 0.32, position.y) * (1.0 - smoothstep(0.82, 1.04, position.y));\n' +
        '\tfor(int ci = 0; ci < ' + NCAP + '; ci++){\n\t\tif(cloose < 0.5 || kcA[ci].w <= 0.0 || (ceo > 0.5 && ci < 14) || (kcB[ci].w > 0.5 && (kcEO > 0.5 || abs(position.x) < 0.20 || position.y < 1.05))) continue;\n' +
        '\t\tvec3 ca = kcA[ci].xyz, cab = kcB[ci].xyz - ca; float csh = kcB[ci].w > 0.5 ? 0.0 : 0.015;\n' +
        // (faded, over 5 cm behind and down the thigh from a third to two fifths: cut off hard, the cloth either side of the
        // line was pushed and not, and a shirt over trousers tore down the side of the hip in a stride)
        // (a slit garment's cloth below the slit's top, kit part slit, metres above the knee, is not pushed off the legs: the leg
        // comes out through the slit, its chains keep off it as a flap's do, and pushed its lips tore and flew out like
        // wings; above the slit the hip still needs it)
        '\t\tfloat ct = dot(transformed - ca, cab) / max(dot(cab, cab), 1e-8), cup = 1.0;\n' +
        '\t\tfloat csl = kcSl > -0.5 && ci < 6 ? smoothstep(kcK + kcSl - 0.08, kcK + kcSl + 0.02, position.y) : 1.0;\n\t\tif(csl <= 0.0) continue;\n' +
        '\t\tint cth = ci < 2 ? ci : ci - 2; vec3 ctd = ci < 4 ? kcB[cth].xyz - kcA[cth].xyz : cab;\n' +
        '\t\tfloat clf = smoothstep(0.12, 0.4, 1.0 - abs(ctd.y) / max(length(ctd), 1e-5));\n' +
        '\t\tif(ci >= 2 && ci < 4) clf = max(clf, smoothstep(0.3, 0.6, 1.0 - abs(cab.y) / max(length(cab), 1e-5)));\n' +
        '\t\tif(ci < 2){ cup = kcA[14].w <= 0.0 ? 0.0 : 1.0 - smoothstep(-0.05, 0.0, dot(transformed - ca, cbk));\n' +
        '\t\t\tcup = max(cup, smoothstep(0.3, 0.4, ct)); if(cup <= 0.0) continue; }\n\t\tct = clamp(ct, 0.0, 1.0);\n' +
        '\t\tvec3 cq = ca + cab * ct, cd = transformed - cq; float cl = length(cd);\n' +
        '\t\tfloat ccr = ci < 2 ? smoothstep(0.42, 0.68, 1.0 - abs(cab.y) / max(length(cab), 1e-5)) * smoothstep(-0.04, 0.03, cd.y) : (ci >= 10 && kcB[ci].w < 0.5 ? smoothstep(-0.02, 0.04, position.y - 0.88) : 0.0);\n' +
        // how far the limb has left hanging (a shin takes its thigh's too: in a crouch it stands upright, the knee well forward).
        // Cloth round a hanging limb has not been passed through. And standing still the fit already clears the trousers, so
        // PAD_OVER (kcPO) comes in with the stride (kcM, legCaps), on both legs: at full strength at rest it held an open robe's
        // panels 5.5 cm off the thigh and they parted at the seam (the boubou, the agent's coat); per limb, the leg a
        // runner stands on took none, and the other leg's swing threw the cloth through it
        '\t\tfloat cpd = csh > 0.0 ? kcP + cflap * 0.035 + kcPO * kcM + (ci >= 14 ? (ctier + cflap * 0.035) * 0.9 * kcM : 0.0) + smoothstep(0.03, 0.04, kcP) * 0.075 * ccr : 0.0;\n' +
        '\t\tfloat cr = mix(kcA[ci].w, kcR[ci] > 0.0 ? kcR[ci] : kcA[ci].w, ct) + cpd;\n' +
        // a bent knee's corner, which the thigh's and the shin's capsules leave uncovered: the radius grows toward the knee
        // by up to KNEE as the leg bends (an Order robe's front showed the whole knee in a run)
        '\t\tif(ci < 4 && csh > 0.0){ int th = ci < 2 ? ci : ci - 2;\n' +
        '\t\t\tfloat bend = clamp(1.0 - dot(normalize(kcB[th].xyz - kcA[th].xyz), normalize(kcB[th + 2].xyz - kcA[th + 2].xyz)), 0.0, 1.0);\n' +
        '\t\t\tcr += ' + KNEE.toFixed(3) + ' * bend * (ci < 2 ? smoothstep(0.7, 1.0, ct) : 1.0 - smoothstep(0.0, 0.3, ct)); }\n' +
        '\t\tfloat cR = cr + csh;\n' +
        '\t\tif(cl < cR && cl > 1e-5){\n' +
        '\t\t\tfloat cmid = ci < 6 ? 1.0 - smoothstep(0.03, 0.11, abs(dot(transformed - kcH, clat))) : 0.0;\n' +
        '\t\t\tvec3 co = vec3(cq.x - kcH.x, 0.0, cq.z - kcH.z); co -= clat * dot(co, clat) * cmid * 0.85; float col = length(co);\n' +
        // and the deeper it lies the more it goes straight out that side: near the bone the way out from it is noise, and a
        // robe's front, left inside a raised thigh in a run, split left and right round the knee and showed it. The side
        // is the one the cloth faces (objectNormal, skinned): a leg swung back has the body's axis in front of it, and
        // a skirt's front, sent out the back, left the leg bare down its side
        // (deep is measured from the bare limb on a hanging leg: from the padded radius ordinary cloth round the leg counted as
        // deep, and the mirror folded the tube's inner half onto its outer, baring a calf through a court skirt and a
        // thigh through a coat in a walk)
        '\t\t\tfloat cr0 = cr - cpd * (1.0 - clf);\n' +
        '\t\t\tif(cl < cr0 && csh > 0.0 && col > 1e-4){ co = normalize(mix(co / col, vec3(0.0, 1.0, 0.0), ccr)); if(ci < 14 && dot(objectNormal, co) < 0.0 && ccr < 0.5) co = -co; float cs = dot(cd, co); if(cs < 0.0) cd -= 2.0 * cs * co;\n' +
        '\t\t\t\tfloat cw = 1.0 - cl / cr0; cw *= cw; cd = normalize(cd) * (1.0 - cw) + co * cw; }\n' +
        // (the legs' capsules hand over to the hull in a stride: the two together tore the cloth where they disagreed)
        // (held at full strength in a stride beside the hull, 2026-11-02 to 06, the two together put the trade skirt's shin
        // through its back in a run and the court gown's underskirt through the gown: the audit, REVIEW-GARMENTS-2026-11-06.md)
        '\t\t\ttransformed = mix(transformed, cq + normalize(cd) * (cr - csh + cl * 2.0 * csh / cR), cup * csl * (ci < 6 ? 1.0 - max(kcM, ceo) : 1.0));\n\t\t}\n\t}\n' +
        // the hull: pushed out of a capsule, cloth a limb has gone through opens round it like a collar and the limb stays
        // through (a run's shin kicked straight back through a robe, with the sole on the end of it). So the leg's points
        // (legCaps) also set how far out from the body's axis the cloth must reach at their bearing: the row of the point
        // and all below hang from it, the rows above run up to the waist, the bearings beside it fall away, as a sheet
        // over a raised foot. Out along the axis's radius, two panels at one bearing go together, and a front seam
        // stays shut. For a garment with no chains (kcEO: the kimono, the library's skirts) in place of the legs' capsules;
        // on garments with chains (ceo < 0.5), the chains and the legs' capsules carry the cloth so textures move with the folds
        '\tif(ceo > 0.5) transformed = mix(transformed, kcH + kcTl * (transformed - kcH), smoothstep(0.06, 0.58, kcH.y - transformed.y));\n' +
        '\tif(cloose > 0.5 && (abs(position.x) < 0.22 || position.y < 0.88)){\n\t\tvec2 ep = transformed.xz - kcH.xz; float er = length(ep), ew = 0.0, ehy = kcH.y + (ceo > 0.5 ? 0.06 : 0.12);\n' +
        '\t\tif(er > 1e-4 && transformed.y < ehy){\n\t\t\tvec2 eu = ep / er;\n\t\t\tfor(int ei = 0; ei < 18; ei++){\n' +
        '\t\t\t\tvec4 es = ei < 12 ? kcE[ei] : 0.5 * (kcE[ei - 12] + kcE[ei - 6]);\n' +
        '\t\t\t\tif(es.w <= 0.0) continue;\n' +
        '\t\t\t\tvec2 esp = es.xz - kcH.xz;\n' +
        '\t\t\t\tfloat esR = es.w + kcP + (ceo > 0.5 ? 0.020 : 0.022) + cflap * 0.035 + kcPO * max(kcM, 0.45);\n' +
        '\t\t\t\tfloat erpad = esR + 0.055, eproj = dot(esp, eu), eperp2 = max(0.0, dot(esp, esp) - eproj * eproj);\n' +
        '\t\t\t\tif(eperp2 >= erpad * erpad) continue;\n' +
        '\t\t\t\tfloat ehit = max(0.0, eproj + sqrt(max(0.0, erpad * erpad - eperp2)) - 0.055) * (1.0 - smoothstep(esR * esR * 0.65, erpad * erpad, eperp2));\n' +
        '\t\t\t\tint ej = ei >= 12 ? ei - 12 : ei >= 6 ? ei - 6 : ei;\n' +
        '\t\t\t\tfloat eytop = ceo > 0.5 && ej == 0 ? es.y + 0.42 * es.w : es.y + (1.0 - ceo * cshort) * es.w;\n' +
        '\t\t\t\tfloat ewy = 1.0 - smoothstep(0.0, max(ehy - eytop, 0.14), transformed.y - eytop);\n' +
        '\t\t\t\tfloat eh0 = kcHm - (ej == 0 ? 0.08 : 0.04);\n' +
        '\t\t\t\tew = max(ew, smoothstep(eh0, eh0 + 0.08, es.y + es.w) * ewy * ehit);\n\t\t\t}\n' +
        '\t\t\tif(ew > 0.0){ float elayer = clamp(length(position.xz) - 0.165, -0.045, 0.045) * 0.25;\n' +
        '\t\t\t\tfloat ed = (ew + elayer) - er;\n' +
        '\t\t\t\ttransformed.xz = kcH.xz + eu * (er + 0.5 * (ed + sqrt(ed * ed + 0.00025))); }\n\t\t}\n\t}\n' +
        '\tif(kcS > 0.0 && cflap < 0.5 && transformed.y < max(kcH.y + 0.08, max(kcB[0].y, kcB[1].y) + 0.08)){\n\t\tfloat sb = 1e9; vec3 sbq = vec3(0.0); float sbr = 0.0, sbt = 0.0; int sbi = 0;\n' +
        '\t\tfor(int ci = 0; ci < 6; ci++){\n\t\t\tif(kcA[ci].w <= 0.0) continue;\n' +
        '\t\t\tvec3 sa = kcA[ci].xyz, sab = kcB[ci].xyz - sa; float st = clamp(dot(transformed - sa, sab) / max(dot(sab, sab), 1e-8), 0.0, 1.0);\n' +
        '\t\t\tfloat sr = (mix(kcA[ci].w, kcR[ci] > 0.0 ? kcR[ci] : kcA[ci].w, st) - (kcSH > 10.0 ? 0.01 : 0.0)) * (ci >= 4 && kcSH > 10.0 && kcM > 0.3 ? 0.72 : (kcSH > 10.0 ? 0.92 : 1.0)) + kcS;\n' +
        '\t\t\tvec3 sq = sa + sab * st; float sl = length(transformed - sq);\n' +
        '\t\t\tif(sl - sr < sb){ sb = sl - sr; sbq = sq; sbr = sr; sbt = st; sbi = ci; }\n\t\t}\n' +
        // how far down the leg it is (thigh, then shin, then foot), against the top's hem (kcSH, of the hip to the ankle)
        '\t\tint sdi = sbi < 2 ? sbi : sbi < 4 ? sbi - 2 : sbi - 4;\n' +
        '\t\tfloat slt = length(kcB[sdi].xyz - kcA[sdi].xyz), sls = length(kcB[sdi + 2].xyz - kcA[sdi + 2].xyz);\n' +
        '\t\tfloat slift = sbi < 2 && kcSH < 1.0 ? smoothstep(0.1, 0.5, 1.0 - abs(kcB[sdi].y - kcA[sdi].y) / max(slt, 1e-5)) : 0.0;\n' +
        '\t\tfloat sdd = sbi < 2 ? sbt * slt : sbi < 4 ? slt + sbt * sls : slt + sls + sbt * 0.1, shm = (kcSH + slift * 0.28) * (slt + sls);\n' +
        '\t\tfloat sf = 1.0 - smoothstep(shm - 0.02, shm + 0.02, sdd);\n' +
        '\t\tvec3 sd = transformed - sbq; float sl = length(sd);\n\t\tif(sb > 0.0 && sb < 0.6) transformed = mix(transformed, sbq + sd * (sbr / sl), sf);\n\t}\n' +
        // (the way in is the trunk's, kcU (legCaps), not the world's, and the height above the hips the greater of the two:
        // in a forward bend, a heavy push or a swim, the band at the small of the back came out through a T-shirt, drawn
        // in level; measured up the trunk alone, the back of the band sat low in a crouch and stood out of the hem)
        '\tif(kcT > 0.0 && cflap < 0.5){\n\t\tvec3 tr = transformed - kcH; float th = dot(tr, kcU); vec3 tq = tr - th * kcU;\n' +
        '\t\tfloat tf = smoothstep(-0.02, 0.06, max(th, tr.y)), tl = length(tq);\n' +
        '\t\tif(tf > 0.0 && tl > 1e-4) transformed = kcH + th * kcU + tq * (max(tl - kcT * tf, 0.5 * tl) / tl);\n\t}');
      // a garment's back faces are drawn BACK_DEPTH further from the eye than they are: where the cloth folds over
      // itself (a stride's push, a chain's swing) its inside lay at the outside's depth and showed through it in
      // blue-grey patches (a shirt over the hips in a walk); an inside nothing covers (in a sleeve, under a hem) still
      // shows. gl_FrontFacing is the side the eye sees
      sh.fragmentShader = 'uniform mat4 projectionMatrix;\n' + sh.fragmentShader.replace('#include <dithering_fragment>',
        '#include <dithering_fragment>\n\tif(gl_FrontFacing) gl_FragDepth = gl_FragCoord.z;\n' +
        '\telse { vec4 kbc = projectionMatrix * vec4(-vViewPosition.xy, -vViewPosition.z - ' + BACK_DEPTH.toFixed(3) + ', 1.0);\n' +
        '\t\tgl_FragDepth = max(gl_FragCoord.z, clamp(kbc.z / kbc.w * 0.5 + 0.5, 0.0, 1.0)); }');
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
    var stride = 0;       // the most any leg joint has left hanging (kcM: how much of PAD_OVER is on)
    if(capRest !== self.pose){          // the knee at rest in this body (kcK: where a slit's height counts from)
      capRest = self.pose;
      pushU.kcK.value = KCHAR.fk(skel, self.pose.t).P[byName.LeftLeg][1];
    }
    LEGS.forEach(function(lg, i){
      // a foot has no collider of its own: footEnds
      var foot = i === 4 || i === 5, a = byName[lg[0]], b = byName[lg[1]], sh = foot ? byName[LEGS[i - 2][0]] : a;
      var cp = caps.filter(function(c){ return c.a === sh && c.b === (foot ? a : b); })[0];
      if(!cp || b === undefined || (i >= 10 && !self.fourArms)){
        if(i >= 10 && !self.fourArms && TL && TL.x && TL.x.length > 2 * (i - 10) + 1){
          var t0 = 2 * (i - 10), t1 = Math.min(t0 + 2, TL.x.length - 1), trad = TL.spec.radius || [];
          cV.copy(TL.x[t0]).applyMatrix4(legInv); cV2.copy(TL.x[t1]).applyMatrix4(legInv);
          var tra = (trad[Math.min(t0, trad.length - 1)] || 0.04) + 0.035, trb = (trad[Math.min(t1, trad.length - 1)] || 0.03) + 0.035;
          pushU.kcA.value[i].set(cV.x, cV.y, cV.z, tra); pushU.kcB.value[i].set(cV2.x, cV2.y, cV2.z, 0);
          pushU.kcR.value[i] = trb;
        } else pushU.kcA.value[i].w = 0;
        return;
      }
      bones[a].getWorldPosition(cV).applyMatrix4(legInv); bones[b].getWorldPosition(cV2).applyMatrix4(legInv);
      if(foot) footEnds(i - 4, legInv, 1, cV, cV2);
      // the radius at each end; an arm keeps one radius: its taper
      // measured the deltoid into the upper arm's, and the hard push crushed a tunic and the mantle over it together
      var ra = (i === 6 || i === 7) ? cp.r : foot ? footR(cp) : cp.ra, rb = i >= 6 ? cp.rb : foot ? ra : cp.rb;
      pushU.kcA.value[i].set(cV.x, cV.y, cV.z, ra + 0.01); pushU.kcB.value[i].set(cV2.x, cV2.y, cV2.z, i >= 6 ? 1 : 0);
      pushU.kcR.value[i] = rb + 0.01;
      if(i < 4) stride = Math.max(stride, 1 - Math.abs(cV2.y - cV.y) / Math.max(cV.distanceTo(cV2), 1e-5));
    });
    pushU.kcM.value = THREE.MathUtils.smoothstep(stride, 0.02, 0.1);
    // the hull's points (the shader, the hull), six a leg: mid-thigh, knee, mid-shin, ankle, heel, toes (the fourth
    // moved up the shin to 0.8, 2026-11-02 to 06, the hull stopped short of a kicked-back ankle and the shin came through
    // the trade skirt in a run: back at the ankle)
    for(var e = 0; e < 2; e++){
      var eT = [[e, 0.5], [e, 1], [2 + e, 0.5], [2 + e, 1], [4 + e, 0], [4 + e, 1]];
      eT.forEach(function(q, j){
        var ca = pushU.kcA.value[q[0]], cb = pushU.kcB.value[q[0]], o = pushU.kcE.value[e * 6 + j];
        o.set(ca.x + (cb.x - ca.x) * q[1], ca.y + (cb.y - ca.y) * q[1], ca.z + (cb.z - ca.z) * q[1],
              ca.w > 0 ? ca.w + (pushU.kcR.value[q[0]] - ca.w) * q[1] : 0);
      });
    }
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
    // what hangs a piece with no chains straight below the pelvis (kcTl). Standing: the hips' whole turn from their rest
    // undone, then turned the way the feet face, at most TILT_MAX; hung on the hips, a wide stance's roll lifted a kimono's
    // back off the calves and an idle's twist swung its hem round the legs. In a stride (kcM) it eases to the turn from
    // the way down between the hip joints now to its rest's: undone in full, a run's lean folded the cloth over itself
    // across the band it turns in, and capped, it drew the front back off the leading knee
    if(!tiltRest || tiltRest.pose !== self.pose){
      var tF = KCHAR.fk(skel, self.pose.t), tL = tF.P[byName.LeftUpLeg], tR = tF.P[byName.RightUpLeg], tS = tF.P[byName.Hips];
      tiltRest = { pose:self.pose, q:new THREE.Quaternion().fromArray(tF.R[byName.Hips]),
                   v:new THREE.Vector3((tL[0] + tR[0]) / 2 - tS[0], (tL[1] + tR[1]) / 2 - tS[1], (tL[2] + tR[2]) / 2 - tS[2]).normalize(),
                   f:footFace(function(n){ return new THREE.Vector3().fromArray(tF.P[byName[n]]); }) };
    }
    var fNow = footFace(function(n){ return bones[byName[n]].getWorldPosition(new THREE.Vector3()).applyMatrix4(legInv); });
    self.inner.getWorldQuaternion(tuckQ).invert();
    bones[byName.Hips].getWorldQuaternion(tiltQ).premultiply(tuckQ).multiply(tuckQ.copy(tiltRest.q).invert()).invert();
    tuckQ.setFromAxisAngle(tiltY, Math.atan2(fNow.x, fNow.z) - Math.atan2(tiltRest.f.x, tiltRest.f.z));
    tiltQ.premultiply(tuckQ);
    var tA = 2 * Math.acos(Math.min(1, Math.abs(tiltQ.w)));
    if(tA > TILT_MAX) tiltQ.copy(tuckQ.identity().slerp(tiltQ, TILT_MAX / tA));
    bones[byName.LeftUpLeg].getWorldPosition(cV).applyMatrix4(legInv); bones[byName.RightUpLeg].getWorldPosition(cV2).applyMatrix4(legInv);
    cV.add(cV2).multiplyScalar(0.5).sub(pushU.kcH.value).normalize();
    // (how far the thighs are apart fore and aft, the way the feet face: a stride. Not kcM, which a wide stance's thighs
    // set too, nor one thigh's lean, which a stance's bent knees set)
    var tSw = 0;
    for(var tk = 0; tk < 2; tk++){
      var ta = pushU.kcA.value[tk], tb = pushU.kcB.value[tk];
      tSw += (tk ? -1 : 1) * cV2.set(tb.x - ta.x, tb.y - ta.y, tb.z - ta.z).normalize().dot(fNow);
    }
    tiltQ.slerp(tuckQ.setFromUnitVectors(cV, tiltRest.v), THREE.MathUtils.smoothstep(Math.abs(tSw), 0.2, 0.5));
    pushU.kcTl.value.setFromMatrix4(tiltM.makeRotationFromQuaternion(tiltQ));
    // the trunk's up (kcU, for the tuck): the way from the hips to TUCK_UP, turned from its rest way, applied to +y; so
    // standing as at rest it is +y (the tuck as it was), and in a bend it leans with the small of the back
    if(byName[TUCK_UP] !== undefined){
      if(!tuckRest){ var f0 = KCHAR.fk(skel, J.map(function(j){ return j.t; })), a0 = f0.P[byName.Hips], b0 = f0.P[byName[TUCK_UP]];
        tuckRest = new THREE.Vector3(b0[0] - a0[0], b0[1] - a0[1], b0[2] - a0[2]).normalize(); }
      bones[byName[TUCK_UP]].getWorldPosition(tuckV).applyMatrix4(legInv);
      tuckV.sub(pushU.kcH.value).normalize();
      pushU.kcU.value.set(0, 1, 0).applyQuaternion(tuckQ.setFromUnitVectors(tuckRest, tuckV));
    }
  }
  var capRest = null, TUCK_UP = 'Spine1', tuckRest = null, tuckQ = new THREE.Quaternion(), tuckV = new THREE.Vector3(), tiltRest = null, tiltM = new THREE.Matrix4(), tiltQ = new THREE.Quaternion(), tiltY = new THREE.Vector3(0, 1, 0), TILT_MAX = 0.35;
  // the way the feet face, level: heel to toes, both feet (at gets a joint's position by name)
  function footFace(at){
    var hL = at('LeftUpLeg'), hR = at('RightUpLeg'), hF = new THREE.Vector3(hR.z - hL.z, 0, hL.x - hR.x);
    if(hF.lengthSq() > 1e-8) hF.normalize(); else hF.set(0, 0, 1);
    var v = new THREE.Vector3();
    ['Left', 'Right'].forEach(function(sd){
      var d = at(sd + 'ToeBase').sub(at(sd + 'Foot')); d.y = 0;
      if(d.dot(hF) > 0.02) v.add(d);
    });
    return v.lengthSq() > 1e-8 ? v.normalize() : hF;
  }
  /* A foot's capsule (0 left, 1 right): the bones run along the top of the foot, ankle to ball, so a capsule on them left
     the heel, the sole and the toes bare, and a run's kicked-up sole came through the back of every long robe as a flat
     patch. Moved down to the sole (the way the shin comes in, square to the foot; the shoe's sole counted) and out to
     the toes. fA, fB the ankle and the ball, in the frame M takes the world to (s its scale), become the capsule's ends */
  var FOOTSIDE = ['Left', 'Right'], FOOT_SOLE = 0.012, FOOT_TOE = 0.03, fN = new THREE.Vector3(), fF = new THREE.Vector3(), footY = null;
  function footR(cp){ return Math.max(cp.rb, 0.05); }
  function footEnds(sd, M, s, fA, fB){
    if(!footY || footY.pose !== self.pose){
      var rP = KCHAR.fk(skel, self.pose.t).P;
      footY = { pose:self.pose, a:rP[byName.LeftFoot][1], b:rP[byName.LeftToeBase][1] };
    }
    var cp = caps.filter(function(c){ return c.a === byName[FOOTSIDE[sd] + 'Leg'] && c.b === byName[FOOTSIDE[sd] + 'Foot']; })[0], r = footR(cp);
    bones[byName[FOOTSIDE[sd] + 'Leg']].getWorldPosition(fN);
    if(M) fN.applyMatrix4(M);
    fN.subVectors(fA, fN).normalize(); fF.subVectors(fB, fA).normalize();
    fN.addScaledVector(fF, -fN.dot(fF)).normalize();
    fA.addScaledVector(fN, (footY.a + FOOT_SOLE - r) * s).addScaledVector(fF, -0.022 * s);
    fB.addScaledVector(fN, (footY.b + FOOT_SOLE - r) * s).addScaledVector(fF, FOOT_TOE * s);
  }

  /* bodyFix: clips retargeted from slighter bodies (or made for none in particular) put limbs through the body. After
     the clip, each limb is a segment with its capsule's radius (skeleton.json colliders: the body's tapered ra to rb,
     an arm one radius) kept BF clear of the others':
       legs  a leg in the top of an upper arm (a knee raised to the shoulder in a climb or a crouch, which no turn
             of the arm clears) swings the thigh out to its side at the hip (LEGSWING at most: past it a clip's knee is
             not merely grazing); two thighs that overlap each turn out by half. A knee before the belly is left be: a
             sprint's raised knee and a crouch's thighs meet the trunk's capsule without going through the body
       arms  the upper arm (against the trunk its elbow's end only, UPLOW on, and not the top of the chest: the
             shoulder sits in it) turns at the shoulder,
             then the forearm and the hand to the knuckles at the elbow, out of the trunk and both legs' thighs and
             shins (a giant's lower arm out of its side's upper arm too), the deepest point each time, twice over */
  var ARMS = [['LeftArm', 'LeftForeArm', 'LeftHand', 'LeftHandMiddle1'], ['RightArm', 'RightForeArm', 'RightHand', 'RightHandMiddle1'],
              ['Left2Arm', 'Left2ForeArm', 'Left2Hand', 'Left2HandMiddle1', 'Left'], ['Right2Arm', 'Right2ForeArm', 'Right2Hand', 'Right2HandMiddle1', 'Right']].filter(function(a){ return byName[a[0]] !== undefined; }),
      BF = 0.008, LEGSWING = 0.35, UPLOW = 0.7, BFRELAX = 0.25, BFSPEED = 2.5, BFARM = 1.2, bfStep = 1e9, bfKept = {}, bfClip = {}, bfLast = null, bfI = new THREE.Quaternion(), fV = new THREE.Vector3(), fW = new THREE.Vector3(), fD1 = new THREE.Vector3(), fD2 = new THREE.Vector3(),
      fR = new THREE.Vector3(), fC1 = new THREE.Vector3(), fC2 = new THREE.Vector3(), fQb = new THREE.Quaternion();
  // the closest points of segments p1-q1 and p2-q2: fC1 at s along the first, fC2 at t along the second
  var near = { s:0, t:0, d:0 };
  function closest(p1, q1, p2, q2){
    fD1.subVectors(q1, p1); fD2.subVectors(q2, p2); fR.subVectors(p1, p2);
    var a = fD1.dot(fD1), e = fD2.dot(fD2), f = fD2.dot(fR), s = 0, t = 0;
    if(a > 1e-12 && e > 1e-12){
      var c = fD1.dot(fR), bb = fD1.dot(fD2), den = a * e - bb * bb;
      s = den > 1e-12 ? THREE.MathUtils.clamp((bb * f - c * e) / den, 0, 1) : 0;
      t = (bb * s + f) / e;
      if(t < 0){ t = 0; s = THREE.MathUtils.clamp(-c / a, 0, 1); }
      else if(t > 1){ t = 1; s = THREE.MathUtils.clamp((bb - c) / a, 0, 1); }
    } else if(e > 1e-12) t = THREE.MathUtils.clamp(f / e, 0, 1);
    else if(a > 1e-12) s = THREE.MathUtils.clamp(-fD1.dot(fR) / a, 0, 1);
    fC1.copy(p1).addScaledVector(fD1, s); fC2.copy(p2).addScaledVector(fD2, t);
    near.s = s; near.t = t; near.d = fC1.distanceTo(fC2);
    return near;
  }
  // turn bone b about its origin so that its point p moves by d along way
  // (the clip's own turn of each bone it turns, the first time in a frame, for bodyFix's kept turns)
  function pushTurn(b, p, way, d){
    var pivot = b.getWorldPosition(fV), from = fW.subVectors(p, pivot), L = from.length();
    if(L < 1e-4) return;
    if(!bfClip[b.name]) bfClip[b.name] = b.quaternion.clone();
    var to = fR.copy(from).addScaledVector(way, d);
    fQb.setFromUnitVectors(from.divideScalar(L), to.normalize());
    var a = 2 * Math.acos(Math.min(1, Math.abs(fQb.w)));
    if(a > bfStep) fQb.slerp(bfI, 1 - bfStep / a);           // a push turns at most BFSPEED a clip second; the kept turn carries it on
    turnWorld(b, fQb);
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
    if(!caps.length || !self.action || self.bodyFixOff){ bfKept = {}; bfLast = null; return; }   // bodyFixOff: tools compare the clip without it
    // the turns kept from the frame before (each bone's, on top of the clip's), easing back to the clip's as the clip
    // moves on (by its own time: the lab's frame steps set the time and update by nothing): pushing on from them keeps
    // a limb on the side it went round and slides it clear, where starting afresh each frame threw it across in a frame
    var tc = self.action.time, dur = self.action.getClip().duration, mv = bfLast == null ? 1e9 : Math.abs(tc - bfLast);
    if(mv > dur / 2) mv = Math.max(0, dur - mv);
    if(bfLast == null) mv = 1e9;
    bfLast = tc;
    var relax = 1 - Math.exp(-mv / BFRELAX);
    bfStep = mv * BFSPEED;
    bfClip = {};
    Object.keys(bfKept).forEach(function(n){
      var b = bones[byName[n]];
      bfClip[n] = b.quaternion.clone();
      b.quaternion.multiply(bfKept[n].slerp(bfI, relax));
    });
    self.group.updateMatrixWorld(true);
    // the skeleton's scale in the world (a giant's inner group is scaled): the capsules are in its units
    var sc = self.inner.getWorldScale(cS).x, trunk = [], legs = [], chest = null, way = new THREE.Vector3(), p = new THREE.Vector3();
    // a body without the mod carries the lower arms' joints unused (hidden, where no leg should meet them)
    var arms = ARMS.filter(function(a){ return !a[4] || self.fourArms; });
    function at(i){ return bones[i].getWorldPosition(new THREE.Vector3()); }
    function ends(o){ o.A = at(o.c.a); o.B = at(o.c.b); return o; }
    // a capsule's radius at t along it; a trunk section's (an ellipse, o.ell) the way the limb lies from its axis (the
    // gap fC2 to fC1 that closest() just found)
    function rad(o, t){
      if(!o.ell) return o.ra + (o.rb - o.ra) * t;
      var e = o.ell, a = e.w0 + (e.w1 - e.w0) * t, b = e.d0 + (e.d1 - e.d0) * t;
      fR.subVectors(fC1, fC2);
      var x = fR.dot(fD1.copy(e.S0).lerp(e.S1, t).normalize()), z = fR.dot(fD2.copy(e.F0).lerp(e.F1, t).normalize()), n = Math.hypot(x, z);
      return n > 1e-9 ? a * b / Math.sqrt(b * b * x * x / (n * n) + a * a * z * z / (n * n)) : b;
    }
    function thighOf(o){ return bones[byName[o.n.replace(/^(Left|Right)(Up)?Leg$/, '$1UpLeg')]]; }
    caps.forEach(function(c){
      if(c.pa) return;                                       // the seat: the trunk's capsule stands for the pelvis here
      var o = { c:c, ra:c.ra * sc, rb:c.rb * sc, n:bones[c.a].name };
      if(c.a === byName.Hips || c.a === byName.Spine1){ trunk.push(o); if(c.a === byName.Spine1) chest = o; }
      else if(/^(Left|Right)(UpLeg|Leg)$/.test(o.n)) legs.push(o);
    });
    // a leg clears by swinging out to its side at the hip (a knee goes beside a shoulder, not up into the face; always
    // out, so the push never jumps from one side to the other between frames): its point (fC1, which is
    // fC2 + gap) moves along the hips' side axis by the least k that makes the gap R long, and by no more than LEGSWING
    var side = byName.LeftUpLeg !== undefined && byName.RightUpLeg !== undefined ? at(byName.LeftUpLeg).sub(at(byName.RightUpLeg)).normalize() : null;
    function legOut(o, R){
      if(!side) return;
      way.copy(side).multiplyScalar(/^Left/.test(o.n) ? 1 : -1);
      // the depth over how far out the gap already points (at least 0.35): it falls to nothing as the leg clears, so the
      // push comes and goes smoothly, also where the knee lies inside the shoulder
      var gap = fR.subVectors(fC1, fC2), g = gap.length(), k = (R - g) / Math.max(0.35, g > 1e-6 ? gap.dot(way) / g : 0);
      if(k > 0){ p.copy(fC1); pushTurn(thighOf(o), p, way, k); }
    }
    // the legs, out of the top of each upper arm
    arms.forEach(function(arm){
      var cu = caps.filter(function(c){ return c.a === byName[arm[0]]; })[0];
      if(!cu) return;
      legs.forEach(function(o){
        ends(o);
        var s0 = at(byName[arm[0]]), top = s0.clone().lerp(at(byName[arm[1]]), 0.3), hit = closest(o.A, o.B, s0, top);
        var R = cu.r * sc + rad(o, hit.s) + BF;
        if(R > hit.d) legOut(o, R);
      });
    });
    // two thighs that overlap: closest points of the two segments
    var tl = legs.filter(function(o){ return o.n === 'LeftUpLeg'; })[0], tr = legs.filter(function(o){ return o.n === 'RightUpLeg'; })[0];
    if(tl && tr){
      var hl = at(tl.c.a), kl = at(tl.c.b), hr = at(tr.c.a), kr = at(tr.c.b), q = new THREE.Quaternion();
      var need = (tl.c.r + tr.c.r) * sc + 0.004, gap = kl.distanceTo(kr);
      if(gap < need){
        var sep = kl.clone().sub(kr); sep.y = 0;
        if(sep.lengthSq() < 1e-8) sep.set(1, 0, 0);
        sep.normalize().multiplyScalar((need - gap) / 2);
        q.setFromUnitVectors(kl.clone().sub(hl).normalize(), kl.clone().add(sep).sub(hl).normalize()); turnWorld(bones[tl.c.a], q);
        q.setFromUnitVectors(kr.clone().sub(hr).normalize(), kr.clone().sub(sep).sub(hr).normalize()); turnWorld(bones[tr.c.a], q);
      }
    }
    var hC = new THREE.Vector3(), hr = byName.Head !== undefined ? facePoint('head', hC) : 0;
    var skull = hr ? { A:hC, B:hC, ra:hr, rb:hr, n:'', head:true } : null;
    // the arms, out of the trunk and the legs as these now stand. Above the pelvis the trunk is the chain through
    // skeleton.json trunk (each spine joint's cross-section, an ellipse whose middle lies forward of the joint, which
    // is near the back), scaled as the chest capsule's radius by the morph; the hand (wrist to knuckles) keeps the
    // wrist's radius, so a palm can lie on the belly
    trunk.forEach(ends); legs.forEach(ends);
    if(chest && skel.trunk && skel.trunk.length > 1){
      var base = (skel.colliders || []).filter(function(c){ return c.a === chest.c.a && c.b === chest.c.b; })[0], kk = base ? chest.c.r / base.r : 1;
      var pts = skel.trunk.map(function(t){
        var w = bones[t.j].getWorldQuaternion(new THREE.Quaternion()).multiply(qB.copy(pRest[t.j]).invert());
        var F = new THREE.Vector3(0, 0, 1).applyQuaternion(w), S = new THREE.Vector3(1, 0, 0).applyQuaternion(w);
        return { p:at(t.j).addScaledVector(F, t.f * kk * sc), F:F, S:S, w:t.w * kk * sc, d:t.d * kk * sc };
      });
      trunk = trunk.filter(function(o){ return o !== chest; });
      for(var i = 1; i < pts.length; i++){
        var u = pts[i - 1], v = pts[i];
        trunk.push({ A:u.p, B:v.p, n:'', top:i === pts.length - 1, ell:{ w0:u.w, w1:v.w, d0:u.d, d1:v.d, F0:u.F, F1:v.F, S0:u.S, S1:v.S } });
      }
    }
    arms.forEach(function(arm){
      var cu = caps.filter(function(c){ return c.a === byName[arm[0]]; })[0], cf = caps.filter(function(c){ return c.a === byName[arm[1]]; })[0];
      if(!cu || !cf) return;
      var obs = trunk.concat(legs);
      // the skull (data/clips.json faces head, with the hair): the upper arm from 0.4 of its length keeps out of it
      // (idle 14 swung it across the head; its top lies by the head whenever the head tips that way); the forearm and
      // hand may come to it (a scratch, a palm on the brow, a fighter's guard at the chin)
      if(skull) obs.push(skull);
      if(arm[4]) caps.forEach(function(c){                   // a giant's lower arm: its side's upper arm too
        if(c.a === byName[arm[4] + 'Arm'] || c.a === byName[arm[4] + 'ForeArm']) obs.push(ends({ c:c, ra:c.r * sc, rb:c.r * sc, n:'' }));
      });
      for(var it = 0; it < 2; it++){
        var sA = at(byName[arm[0]]), sB = at(byName[arm[1]]), low = sA.clone().lerp(sB, UPLOW), mid = sA.clone().lerp(sB, 0.4), worst = 0;
        obs.forEach(function(o){
          // against the trunk only the elbow's end at its own (tapering) radius, and not the top of the chest: the
          // shoulder and the deltoid sit against the chest, and an arm raised before it is held there
          var tr = trunk.indexOf(o) >= 0;
          if(tr && o.top) return;
          if(o.head) tr = false;
          var hit = closest(tr ? low : o.head ? mid : sA, sB, o.A, o.B);
          var dep = (tr ? cu.ra + (cu.rb - cu.ra) * (UPLOW + (1 - UPLOW) * hit.s) : cu.r) * sc + rad(o, hit.t) + BF - hit.d;
          if(dep > worst && hit.d > 1e-6){ worst = dep; p.copy(fC1); way.subVectors(fC1, fC2).divideScalar(hit.d); }
        });
        if(worst > 0) pushTurn(bones[byName[arm[0]]], p, way, worst);
        var eA = at(byName[arm[1]]), eB = at(byName[arm[2]]), kn = byName[arm[3]] !== undefined ? at(byName[arm[3]]) : null;
        worst = 0;
        obs.forEach(function(o){
          if(o.head) return;
          [eB, kn].forEach(function(q2, k){
            if(!q2) return;
            var hit = closest(k ? eB : eA, q2, o.A, o.B), dep = (k ? cf.rb : cf.r) * sc + rad(o, hit.t) + BF - hit.d;
            if(dep > worst && hit.d > 1e-6){ worst = dep; p.copy(fC1); way.subVectors(fC1, fC2).divideScalar(hit.d); }
          });
        });
        // a point at the elbow is the upper arm's to clear
        if(worst > 0 && p.distanceTo(eA) > 0.05 * sc) pushTurn(bones[byName[arm[1]]], p, way, worst);
      }
    });
    // what this frame turned, kept for the next (a thigh's at most LEGSWING, an arm's BFARM)
    Object.keys(bfClip).forEach(function(n){
      var b = bones[byName[n]], k = bfKept[n] || (bfKept[n] = new THREE.Quaternion());
      k.copy(bfClip[n]).invert().multiply(b.quaternion);
      var lim = /UpLeg$/.test(n) ? LEGSWING : BFARM, ang = 2 * Math.acos(Math.min(1, Math.abs(k.w)));
      if(ang > lim){ k.slerp(bfI, 1 - lim / ang); b.quaternion.copy(bfClip[n]).multiply(k); }
    });
    self.bones[0].updateMatrixWorld(true);
  }

  /* bowString: the string between the bow's limb tips (data/props.json string, in the bow's frame), drawn through
     the right hand's grip point while that is behind the bow, and an arrow from there to the bow hand; straight and
     empty otherwise. The clips hold the bow hand at various turns, so the bow turns about its own handle to face the
     drawing hand. When the arrow is on the string comes from the clip (data/clips.json nock: spans of clip seconds,
     from nocking to the loose), so every body looses at once and a hand passing behind the bow later (the bow
     lowered, the clip looping back) draws nothing; a bow clip without nock spans guesses from the hand's place (behind
     the bow, near its middle; the arrow once the string is pulled 20 cm). The bow is canted about the arrow's line:
     at full draw (toFace's anchor), toward upright; and until its limbs are out of the legs (cant) */
  var bow = null, sMat = new THREE.MeshStandardMaterial({ color:0xd9ccad, roughness:0.9 });
  function makeBow(g, p){
    var cyl = new THREE.CylinderGeometry(0.0025, 0.0025, 1, 4, 1, true), pivot = new THREE.Group(), cant = new THREE.Group();
    while(g.children.length) cant.add(g.children[0]);
    pivot.add(cant); g.add(pivot);
    var b = { top:V().fromArray(p.string, 0), bot:V().fromArray(p.string, 3), a:new THREE.Mesh(cyl, sMat),
              c:new THREE.Mesh(cyl, sMat), arrow:null, pivot:pivot, cant:cant, cantA:0, turn:0 };
    cant.add(b.a); cant.add(b.c);
    bow = b;
    bowString();
    return p.arrow ? propScene(p.arrow).then(function(scene){
      if(bow !== b) return;
      b.arrow = scene.clone(true); b.arrow.visible = false; cant.add(b.arrow);
    }) : null;
  }
  var yAx = new THREE.Vector3(0, 1, 0), zAx = new THREE.Vector3(0, 0, 1);
  function span(m, a, b){
    tU.subVectors(b, a);
    m.position.addVectors(a, b).multiplyScalar(0.5);
    m.scale.set(1, Math.max(1e-4, tU.length()), 1);
    m.quaternion.setFromUnitVectors(yAx, tU.normalize());
  }
  // whether the clip has the arrow on the string now (null: the clip gives no spans)
  function nocked(){
    var c = clipNow(), n = c && c.info.nock;
    return n ? n.some(function(w){ return c.t >= w[0] && c.t <= w[1]; }) : null;
  }
  /* cant: the turn about the arrow's line (ax, in the turned bow's frame). At full draw the bow comes upright but for LEAN
     of the clip's own lean (Draw from quiver held it 40 degrees over, its lower limb at the hip); then the least of 0,
     +-10 ... +-80 degrees more that keeps the limbs out of the legs' capsules widened by CLEAR (the trousers and the
     limb's own thickness: the bare capsules let Bow aim and scan's limb through the thigh), else the one that goes in
     least */
  var LIMB = [0.12, 0.24, 0.36, 0.48, 0.6, 0.72], CANTS = [0], CLEAR = 0.045, LEAN = 15 * Math.PI / 180, cM3 = new THREE.Matrix4(), cQ4 = new THREE.Quaternion(),
      cW = new THREE.Vector3(), cO = new THREE.Vector3(), cA = new THREE.Vector3(), cB = new THREE.Vector3();
  for(var ci = 10; ci <= 80; ci += 10) CANTS.push(ci, -ci);
  // how far p is inside a bone capsule (kchar_figure.gd _cap_depth): its own copy, as bodyFix's depth() went with the
  // segment tests
  var dA = new THREE.Vector3(), dB = new THREE.Vector3(), dP = new THREE.Vector3();
  function depth(p, cp){
    bones[cp.a].getWorldPosition(dA); bones[cp.b].getWorldPosition(dB);
    dB.sub(dA);
    var t = THREE.MathUtils.clamp(dP.subVectors(p, dA).dot(dB) / Math.max(1e-9, dB.lengthSq()), 0, 1);
    return cp.r + 0.012 - p.distanceTo(dP.copy(dA).addScaledVector(dB, t));
  }
  function upright(ax){
    bow.pivot.getWorldQuaternion(cQ4);
    cB.set(0, 1, 0).applyQuaternion(cQ4.invert());               // world up in the turned bow's frame
    cA.set(0, 1, 0).addScaledVector(ax, -ax.y);
    cB.addScaledVector(ax, -cB.dot(ax));
    if(cA.lengthSq() < 1e-8 || cB.lengthSq() < 1e-8) return 0;
    var a = Math.atan2(cO.crossVectors(cA, cB).dot(ax), cA.dot(cB));
    if(Math.abs(a) > Math.PI / 2) a -= Math.sign(a) * Math.PI;    // the bow is the same either way up: the nearer
    return Math.sign(a) * Math.max(0, Math.abs(a) - LEAN);
  }
  function cantFor(ax, drawn){
    var base = drawn ? upright(ax) * self.faceW : 0;      // at full draw (the string hand at the anchor), not held low
    var legs = caps.filter(function(cp){ return !cp.pa && (cp.a === byName.LeftUpLeg || cp.a === byName.LeftLeg || cp.a === byName.RightUpLeg || cp.a === byName.RightLeg); });
    bow.inLegs = 0;
    if(!legs.length) return base;
    var sc = self.group.getWorldScale(cS).x * SCALE, best = base, least = Infinity;
    for(var k = 0; k < CANTS.length; k++){
      var a = base + CANTS[k] * Math.PI / 180, sum = 0;
      cM3.makeRotationFromQuaternion(cQ4.setFromAxisAngle(ax, a)).premultiply(bow.pivot.matrixWorld);
      LIMB.forEach(function(y){ [1, -1].forEach(function(sg){
        cW.set(0, sg * y, -0.09 * (y / 0.72) * (y / 0.72)).applyMatrix4(cM3);
        legs.forEach(function(cp){ sum += Math.max(0, depth(cW, { a:cp.a, b:cp.b, r:(cp.r + CLEAR) * sc })); });
      }); });
      if(sum <= 0){ bow.inLegs = 0; return a; }
      if(sum < least - 1e-6){ least = sum; best = a; }
    }
    bow.inLegs = least;
    return best;
  }
  this.bowState = function(){ return bow ? { turn:bow.turn, cant:bow.cantA, inLegs:bow.inLegs || 0, arrow:!!(bow.arrow && bow.arrow.visible), ahead:bow.ahead } : null; };   // the labs, tools
  /* the arrow's length follows the body: ARROW_ARM times the bow arm's length (shoulder to wrist), so a long-armed
     archer's draw (about 1.5 arms) leaves its head in front of the bow (a 78 cm arrow went behind it on the tall
     bodies); and while the clip has it nocked the string hand draws at most HEAD short of it (the right arm reaches in) */
  var HEAD = 0.05, aS = V(), aE = V(), aH = V();
  function arrowLength(){
    var p = prop(held.L), arm = skel.hands.L && skel.hands.L.arm;
    if(!p.arrow_arm || !arm) return (prop(p.arrow).length || 0.78);
    bones[arm[0]].getWorldPosition(aS); bones[arm[1]].getWorldPosition(aE); bones[arm[2]].getWorldPosition(aH);
    return p.arrow_arm * (aS.distanceTo(aE) + aE.distanceTo(aH)) / holder('L').getWorldScale(cS).x;
  }
  function bowString(dt){
    self.drawn = false;                                       // (a bow put away left it set)
    if(!bow) return;
    var mid = null, rest = (bow.top.z + bow.bot.z) / 2, nk = nocked(), len = arrowLength();
    if(skel.hands.R){
      self.group.updateMatrixWorld(true);
      tP.setFromMatrixPosition(holder('R').matrixWorld);
      bow.pivot.parent.worldToLocal(tP);                      // the drawing hand in the bow hand's grip frame
      var over = tP.length() - (len - HEAD), rArm = skel.hands.R.arm;
      if(nk && over > 0 && rArm){
        var gs = holder('L').getWorldScale(cS).x, rh = bones[rArm[2]];
        holder('L').getWorldPosition(tA); holder('R').getWorldPosition(tB);
        rh.getWorldPosition(tO).addScaledVector(tA.sub(tB).normalize(), over * gs);
        reachArm(bones[rArm[0]], bones[rArm[1]], rh, tO, rh.getWorldQuaternion(qR));
        tP.setFromMatrixPosition(holder('R').matrixWorld);
        bow.pivot.parent.worldToLocal(tP);
      }
      var n = Math.hypot(tP.x, tP.z), turn = 0;
      if(nk === null ? Math.abs(tP.y) < 0.35 && n > 0.12 && n < 0.95 : nk && n > 0.05) turn = Math.atan2(-tP.x, -tP.z);
      bow.turn = turn;
      bow.pivot.quaternion.setFromAxisAngle(yAx, turn);
      tP.applyAxisAngle(yAx, -turn);                          // into the turned bow's frame
      if(turn !== 0 && tP.z < rest - 0.02) mid = tP;
    }
    // the cant, about the arrow's line (through the string hand, so the string stays in it), eased while playing
    bow.pivot.updateMatrixWorld(true);
    var ax = mid ? tK.copy(mid).normalize() : tK.set(0, 0, -1);
    var want = self.action ? cantFor(ax, !!mid) : 0;
    bow.cantA = dt > 0 ? bow.cantA + (want - bow.cantA) * (1 - Math.exp(-dt / 0.12)) : want;
    bow.cant.quaternion.setFromAxisAngle(ax, bow.cantA);
    if(mid){
      span(bow.a, bow.top, mid); span(bow.c, mid, bow.bot);
      bow.c.visible = true;
    } else {
      span(bow.a, bow.top, bow.bot);
      bow.c.visible = false;
    }
    if(bow.arrow){
      var drawn = mid && (nk === null ? mid.z < -0.2 : true);
      bow.arrow.visible = !!drawn;
      if(drawn){
        bow.arrow.scale.set(1, 1, len / (prop(prop(held.L).arrow).length || 0.78));
        bow.arrow.position.copy(mid);
        bow.arrow.quaternion.setFromUnitVectors(zAx, tV.set(0, 0.04 * Math.sign(mid.y || 1), 0).sub(mid).normalize());
      }
    }
    self.drawn = !!mid;
    bow.ahead = mid ? len - mid.length() : null;           // how far the arrow's head is in front of the bow (its units)
    // the drawing hand hooks three fingers on the string
    var hR = skel.hands && skel.hands.R, dc = mid && hR && hR.curls && hR.curls.draw;
    if(dc && !held.R) dc.forEach(function(q){ bones[q[0]].quaternion.fromArray(J[q[0]].r).multiply(curlQ.set(q[1], q[2], q[3], q[4])); });
  }
  /* ---- posture: after each clip the spine, neck and head are pitched (data/posture.json: degrees per joint in the
     figure's frame, negative forward) and the shoulders dropped and drawn back. The clips, retargeted onto
     MakeHuman's curved spine, stand with the chest pushed forward and the upper body leaning back ---- */
  // data/posture.json for this body (KCharFigure.posture: the page fills it; a body without an entry takes the man's),
  // copied, so a panel can change one figure's live
  var PJ = ['Spine', 'Spine1', 'Spine2', 'Neck', 'Head'], PK = PJ.concat(['drop', 'back']), PD = KCharFigure.posture || {};
  var PB = PD[kit.body] ? kit.body : 'mpfb_male';
  var POSTURE = Object.assign({ Spine:0, Spine1:0, Spine2:0, Neck:0, Head:0, drop:0, back:0 }, PD[PB] || {});
  // a clip's own change on top (data/posture.json 'clips': degrees added, under the body whose values this one takes),
  // copied by clip name, so a panel can change one figure's live; blended by the playing clips' weights, so a
  // cross-fade carries it over too
  var PC = KCharFigure.postureClips || {}, CLIPP = {}, PF = KCharFigure.postureFrame || 'figure';
  Object.keys(PC).forEach(function(c){ var o = PC[c][PB]; if(o) CLIPP[c] = Object.assign({}, o); });
  var pAx = V(), pQ = Q(), pG = Q(), pW = [Q(), Q()], pS = {};
  // per joint, the inverse of its parent's rest orientation in the figure (the rest locals down from the hips)
  var pRest = J.map(function(){ return Q(); });
  J.forEach(function(j, i){ pRest[i].fromArray(j.r); if(j.parent >= 0) pRest[i].premultiply(pRest[j.parent]); });
  var pR = J.map(function(j){ return j.parent >= 0 ? pRest[j.parent].clone().invert() : Q(); });
  var pArms = ['LeftArm', 'RightArm'].map(function(n){ return byName[n] !== undefined ? byName[n] : -1; });
  function postureNow(bodyOnly){
    var sum = 0;
    PK.forEach(function(k){ pS[k] = 0; });
    if(!bodyOnly) acts.forEach(function(a){
      var w = a.isScheduled() ? a.getEffectiveWeight() : 0; if(!(w > 0)) return;
      var o = CLIPP[a.getClip().name] || {}; sum += w;
      PK.forEach(function(k){ pS[k] += w * (+o[k] || 0); });
    });
    PK.forEach(function(k){ pS[k] = (+POSTURE[k] || 0) + (sum > 0 ? pS[k] / sum : 0); });
    return pS;
  }
  function posture(force){
    if(!self.action && !force) return;   // the rest pose (the A-pose clothes are fitted in) stays as it is
    var P = postureNow(force);           // forced (the chains' rest): the body's angles alone
    self.group.getWorldQuaternion(pG);
    // the upper arms keep the way the clip points them: the torso straightens under them, and a thrust or a held
    // spear aims where the clip aims it
    pArms.forEach(function(k, i){ if(k >= 0) bones[k].getWorldQuaternion(pW[i]); });
    PJ.forEach(function(n){
      var b = byName[n] !== undefined && bones[byName[n]], a = P[n]; if(!b || !a) return;
      if(PF === 'joint'){
        // the side axis as the clip has turned the parent joint from its rest: a twisted or leaning torso bends
        // forward along its own facing, not about the figure's
        b.parent.getWorldQuaternion(qB);
        pAx.set(1, 0, 0).applyQuaternion(pR[byName[n]]).applyQuaternion(qB);
      } else pAx.set(1, 0, 0).applyQuaternion(pG);
      turnWorld(b, pQ.setFromAxisAngle(pAx, -a * Math.PI / 180));
    });
    [['LeftShoulder', 1], ['RightShoulder', -1]].forEach(function(sh){
      var b = byName[sh[0]] !== undefined && bones[byName[sh[0]]]; if(!b) return;
      turnWorld(b, pQ.setFromAxisAngle(pAx.set(0, 0, 1).applyQuaternion(pG), -sh[1] * P.drop * Math.PI / 180));
      turnWorld(b, pQ.setFromAxisAngle(pAx.set(0, 1, 0).applyQuaternion(pG), sh[1] * P.back * Math.PI / 180));
    });
    pArms.forEach(function(k, i){
      if(k < 0) return;
      bones[k].parent.getWorldQuaternion(qB);
      bones[k].quaternion.copy(qB.invert().multiply(pW[i]));
      bones[k].updateMatrixWorld(true);
    });
  }
  this.posture = POSTURE;
  this.postureClips = CLIPP;

  function afterClip(dt){ posture(); arms2(dt); bodyFix(); toesFlat(); grip(); bladeClear(dt); twoHands(dt); toFace(); standUp(); nhT += dt || 0; tail(dt); jaw(); clothStep(dt); legCaps(); bowString(dt); hang(); }

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
  /* the tail (a mod with a tail: tools/mods.py tail_piece; its joints Tail1... are on every skeleton, after the others,
     tools/tail.py). No clip moves it: each frame it runs as a spring chain, one point per joint and one at the tip, at
     60 Hz. Each point is pulled toward its rest carried by the hips (the joints' rest offsets, so a morphed body's
     longer tail too), swayed about the hips' up axis (kit tail.sway: degrees at the tip, a share of it at the root,
     a period), by its stiffness (kit tail.stiff, root to tip: what the pull leaves is the lag behind the hips), with
     a little gravity and damping; then each segment keeps its length, and each point keeps its radius (kit
     tail.radius) plus pad out of the thighs' and shins' capsules (the leg colliders bodyFix and the cloth use) and
     above the floor. The joints then turn to the points (as the cloth chains' bones do). With no clip it rests */
  var TL = null, tlV = V(), tlV2 = V(), tlQ = Q(), tlQ2 = Q(), tlM = new THREE.Matrix4(), nhT = 0;
  function tailSetup(it){
    if(!it || !it.tail){ if(TL) TL.ids.forEach(function(i, k){ bones[i].quaternion.fromArray(J[i].r); }); TL = null; return; }
    var spec = it.tail, ids = spec.joints.map(function(n){ return byName[n]; });
    if(ids.some(function(i){ return i === undefined; })){ TL = null; return; }
    TL = { spec:spec, ids:ids, x:[], xp:[], tw:[], rest:[], acc:0, reset:true };
  }
  function tailRest(){
    // the chain in the hips' frame: each joint's offset from its parent (its rest frame is the hips', turned by none)
    var r = TL.rest, p = V();
    TL.ids.forEach(function(i, k){ p.add(bones[i].position); (r[k] = r[k] || V()).copy(p); });
    var n = TL.ids.length, last = TL.ids[n - 1], lr = V().fromArray(J[last].t).length();
    (r[n] = r[n] || V()).copy(p).add(V().fromArray(TL.spec.tip).multiplyScalar(lr > 1e-6 ? bones[last].position.length() / lr : 1));
  }
  function tailTargets(sway){
    var hips = bones[byName.Hips], n = TL.rest.length, sw = TL.spec.sway || {}, deg = (sw.deg || 0) * sway;
    hips.updateMatrixWorld(true);
    for(var k = 0; k < n; k++){
      var a = deg * ((sw.root || 0) + (1 - (sw.root || 0)) * k / (n - 1)) * Math.PI / 180;
      tlV.copy(TL.rest[k]).sub(TL.rest[0]).applyAxisAngle(tlV2.set(0, 1, 0), a).add(TL.rest[0]);
      (TL.tw[k] = TL.tw[k] || V()).copy(tlV).applyMatrix4(hips.matrixWorld);
    }
  }
  function tail(dt){
    if(!TL) return;
    tailRest();
    var sw = TL.spec.sway || {}, per = sw.period || 3;
    self.group.updateMatrixWorld(true);
    tailTargets(self.action ? Math.sin(2 * Math.PI * nhT / per) : 0);
    var n = TL.tw.length, sc = self.inner.getWorldScale(tlV2).x, rad = TL.spec.radius, pad = TL.spec.pad || 0;
    var groundW = self.group.getWorldPosition(tlV).y;
    if(dt === undefined || TL.reset || TL.x.length !== n || TL.x[0].distanceTo(TL.tw[0]) > 0.4 * sc){
      TL.x = TL.tw.map(function(v){ return v.clone(); }); TL.xp = TL.tw.map(function(v){ return v.clone(); });
      TL.reset = false; TL.acc = 0;
    }
    // the legs' capsules in the world (thighs and shins: not the seat, which the tail's root lies in)
    var W = caps.filter(function(cp){ return !cp.pa && LEGJ.test(bones[cp.a].name); }).map(function(cp){
      var A = V(), B = V(); capEnds(cp, A, B);
      return { a:A, b:B, ra:(cp.ra || cp.r) * sc, rb:(cp.rb || cp.r) * sc };
    });
    var len = []; for(var k = 1; k < n; k++) len.push(TL.tw[k].distanceTo(TL.tw[k - 1]));
    var h = STEP, grav = TL.spec.grav || 0, damp = TL.spec.damp || 0;
    TL.acc = dt ? Math.min(TL.acc + dt, 4 * STEP) : 0;
    while(TL.acc >= h){
      TL.acc -= h;
      TL.x[0].copy(TL.tw[0]); TL.xp[0].copy(TL.tw[0]);
      for(k = 1; k < n; k++){
        var x = TL.x[k], xp = TL.xp[k], st = TL.spec.stiff[Math.min(k, TL.spec.stiff.length - 1)];
        tlV.subVectors(x, xp);
        xp.copy(x);
        x.addScaledVector(tlV, 1 - damp);
        x.y -= grav * h * h;
        x.lerp(TL.tw[k], 1 - Math.pow(1 - st, h * 60));
      }
      tailConstrain(W, len, sc, rad, pad, groundW);
    }
    if(dt === undefined) tailConstrain(W, len, sc, rad, pad, groundW);
    // the joints turn to the points: each segment's rest direction (no sway) in the world onto its direction now
    tailTargets(0);
    var prev = bones[byName.Hips].getWorldQuaternion(tlQ2).clone(), hq = prev.clone();
    TL.ids.forEach(function(i, k){
      tlV.subVectors(TL.tw[k + 1], TL.tw[k]).normalize();
      tlV2.subVectors(TL.x[k + 1], TL.x[k]).normalize();
      var Wq = Q().setFromUnitVectors(tlV, tlV2).multiply(hq);
      bones[i].quaternion.copy(prev).invert().multiply(Wq);
      prev = Wq;
    });
  }
  var tlA = V(), tlB = V(), tlC = V();
  function tailConstrain(W, len, sc, rad, pad, groundW){
    var n = TL.x.length;
    for(var it = 0; it < 2; it++){
      for(var k = 1; k < n; k++){
        var x = TL.x[k], up = TL.x[k - 1];
        tlA.subVectors(x, up); var d = tlA.length();
        if(d > 1e-9) x.copy(up).addScaledVector(tlA, len[k - 1] / d);
        var r = (rad[Math.min(k, rad.length - 1)] || 0) * sc + pad * sc;
        W.forEach(function(w){
          tlB.subVectors(w.b, w.a); var L2 = tlB.lengthSq(), t = L2 > 1e-12 ? Math.max(0, Math.min(1, tlC.subVectors(x, w.a).dot(tlB) / L2)) : 0;
          tlC.copy(w.a).addScaledVector(tlB, t);
          var want = w.ra + (w.rb - w.ra) * t + r; tlA.subVectors(x, tlC); var q = tlA.length();
          if(q < want){ if(q < 1e-6) tlA.set(0, 0, -1), q = 1; x.copy(tlC).addScaledVector(tlA, want / q); }
        });
        var floor = groundW + (rad[Math.min(k, rad.length - 1)] || 0) * sc;
        if(x.y < floor) x.y = floor;
      }
    }
  }
  this.tailState = function(){ return TL; };          // verify.py, the labs

  /* the jaw of an animal head (a mod with a jaw: tools/mods.py lizard_head, its lower jaw weighted to face_jaw, which
     no clip moves): opened about its hinge (kit jaw.pivot, in Head's frame) by up to jaw.deg, for a share (hold) of
     every period seconds, a breath taken with the mouth a little open; shut otherwise. self.jawOpen (0..1) holds it
     open instead (the labs) */
  var JAW = null;
  this.jawOpen = null;
  function jaw(){
    var j = byName.face_jaw; if(j === undefined) return;
    var b = bones[j];
    if(!JAW){ if(b.userData.nh){ b.quaternion.fromArray(J[j].r); b.position.fromArray(self.pose.t[j]); b.userData.nh = false; } return; }
    var ph = (nhT % JAW.period) / JAW.period, o = self.jawOpen != null ? self.jawOpen : (self.action && ph < JAW.hold ? Math.pow(Math.sin(Math.PI * ph / JAW.hold), 2) : 0);
    tlQ.setFromAxisAngle(tlA.set(1, 0, 0), o * JAW.deg * Math.PI / 180);
    b.quaternion.fromArray(J[j].r).multiply(tlQ);
    // about the hinge: the joint's rest place, moved so the pivot stays put
    tlB.fromArray(JAW.pivot); tlC.copy(tlB).applyQuaternion(tlQ);
    b.position.fromArray(self.pose.t[j]).add(tlB.sub(tlC));
    b.userData.nh = true;
  }

  this.play = function(name){
    return ready.then(function(){
      var c = name && self.clips[name];
      twoY = 0;
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

  /* ---- blinks: a piece with a 'blink' morph target (a therian's lids, tools/heads.py) shuts it every few seconds,
     a fifth of a second each (shut in 70 ms, held 30, open in 80), at intervals from the figure's own count (the same
     every run). blink() starts one now; blinkHold (0 to 1) holds the lids there (a still shot) ---- */
  var blinkAt = 2.0, blinkN = 0, blinkT = 0;
  function blinkWeight(t){ return t < 0.07 ? t / 0.07 : t < 0.1 ? 1 : t < 0.18 ? 1 - (t - 0.1) / 0.08 : 0; }
  function blinks(dt){
    blinkT += dt;
    if(blinkT > blinkAt + 0.18){ blinkN++; blinkAt = blinkT + 2.5 + 3.5 * ((blinkN * 0.6180339887) % 1); }
    var b = self.blinkHold != null ? self.blinkHold : blinkT >= blinkAt ? blinkWeight(blinkT - blinkAt) : 0;
    Object.keys(live).forEach(function(k){
      var m = live[k], d = m.morphTargetDictionary;
      if(d && d.blink !== undefined && m.visible) m.morphTargetInfluences[d.blink] = b;
    });
  }
  this.blink = function(){ blinkAt = blinkT; };

  this.update = function(dt){
    blinks(dt);
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
KCharFigure.clipData = {};   // data/clips.json clips by key: hold, two_hands, face, nock, lead_left (the page fills it)
KCharFigure.faces = {};      // data/clips.json faces: per body, the face's points (the page fills it)
KCharFigure.posture = {};    // data/posture.json bodies (the page fills it)
KCharFigure.postureClips = {};   // data/posture.json clips: per clip, per body, degrees added (the page fills it)
KCharFigure.postureFrame = 'figure';   // data/posture.json frame: 'joint' pitches about each joint's parent's side axis
