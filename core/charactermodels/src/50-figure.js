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
        var slot0 = it0.over || part.slot;      // pteruges push as the top they hang over does
        m.userData.pad = pushOut(m.material, it0.loose ? (slot0 === 'torso' ? PAD_TOP : PAD_SKIRT) : 0, !!it0.loose, slot0 === 'legs');
      } else if(part.role === 'armour' && part.slot === 'feet') pushOut(m.material, 0, false, false, true);   // boots: the squeeze only
      if(part.role === 'armour') furShells(m, itemByKey[part.key]);
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
  var FUR_GLSL = 'vec3 kfHash(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }\n';
  function furShells(m, it){
    var F = KCharFigure.fur, rows = it && it.fur;
    if(!F || !rows || !rows.length) return;
    var scale = F.items && F.items[it.id] && F.items[it.id].pile != null ? F.items[it.id].pile : 1;
    if(!(scale > 0)) return;
    var n = F.layers == null ? 12 : F.layers, uv = m.geometry.attributes.uv, i0 = m.userData.index0;
    if(!uv || !i0) return;
    var byKind = {}, band = m.userData.furBand = { value:new THREE.Vector2(-1e3, 1e3) };
    rows.forEach(function(r){ if(F.kinds[r[2]]) (byKind[r[2]] = byKind[r[2]] || []).push(r); });
    Object.keys(byKind).forEach(function(kind){
      var K = F.kinds[kind], rs = byKind[kind].slice(0, 4), pile = K.pile * scale, idx = [];
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
      for(var k=1;k<=n;k++){
        var tk = k / n, mat = new THREE.MeshStandardMaterial({ map:m.material.map, roughness:1, metalness:0, side:THREE.DoubleSide, skinning:true });
        mat.color = m.material.color;       // the same Color: apply()'s dye and tint reach the shells
        mat.onBeforeCompile = furShader(own ? m.material.onBeforeCompile : null, {
          kfH:{ value:pile * tk }, kfC:{ value:(K.comb || 0) * pile * tk * tk }, kfT:{ value:tk }, kfR:{ value:R },
          kfS:{ value:K.strand }, kfW:{ value:K.thick }, kfL:{ value:K.clump || 0 }, kfSh:{ value:K.shade == null ? 1 : K.shade },
          kfTp:{ value:K.tip == null ? 1 : K.tip }, kfV:{ value:K.vary || 0 }, kfF:band });
        mat.customProgramCacheKey = own ? function(){ return 'kchar-fur-' + key0; } : function(){ return 'kchar-fur'; };
        var s = new THREE.SkinnedMesh(geo, mat);
        s.name = m.name + '|fur:' + kind + ':' + k; s.frustumCulled = false; s.castShadow = false;
        s.bind(m.skeleton, new THREE.Matrix4());
        s.userData.fur = true;
        m.add(s);
      }
    });
  }
  // body: a coat's shells (coatShells): each vertex's cover (furK, under 1 thins the strands) and the metres one unit
  // of its UV spans (furM) are attributes, and the strands run on the body's UV map scaled by them, rather than in rows
  function furShader(prev, U, body){
    return function(sh, r){
      if(prev) prev(sh, r);              // the push (pushOut) first: the fur stands on the cloth where it is pushed to
      Object.keys(U).forEach(function(k){ sh.uniforms[k] = U[k]; });
      // (kfF: a legs item's fur fades out below the top of the boots over it and above the hem of the top over it, kfK:
      // tucked in, it came out through the boots' shafts, and through a deel's skirt in a stride. position is the rest,
      // after the morphs, as the boots' top and the hem are)
      sh.vertexShader = 'uniform float kfH;\nuniform float kfC;\nuniform vec2 kfF;\nvarying float kfK;\n' +
        (body ? 'attribute float furK;\nattribute float furM;\nvarying float kfM;\n' : '') + sh.vertexShader.replace('#include <project_vertex>',
        'vec3 kfN = normalize(objectNormal), kfD = vec3(0.0, -1.0, 0.0);\n\tkfD -= kfN * dot(kfD, kfN);\n' +
        (body ? '\tkfK = furK; kfM = furM;\n' : '\tkfK = smoothstep(kfF.x, kfF.x + 0.03, position.y) * (1.0 - smoothstep(kfF.y - 0.03, kfF.y, position.y));\n') +
        '\ttransformed += (kfN * kfH + kfD * kfC) * kfK;\n#include <project_vertex>');
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
        kfTp:{ value:K.tip == null ? 1 : K.tip }, kfV:{ value:K.vary || 0 }, kfF:{ value:new THREE.Vector2() }, kfU0:{ value:L === 1 && K.undercoat ? 1 : 0 } }, true);
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
  function coatHides(rec){
    var F = KCharFigure.fur, c = F && F.coats && rec.coat ? F.coats[rec.coat] : null, out = {};
    ((c && c.hide_parts) || []).forEach(function(p){ out[p] = true; });
    return out;
  }
  function coatShells(m, rec, gain, hide){
    var F = KCharFigure.fur, coat = F && F.coats && rec.coat ? F.coats[rec.coat] : null, S = m.userData.coat;
    var K = coat && F.kinds[coat.kind];
    if(S && (!K || S.id !== rec.coat)){ m.remove(S.group); S = m.userData.coat = null; }
    if(!K) return;
    if(!S) S = m.userData.coat = coatBuild(m, rec.coat, coat, K);
    // the rings from the hidden skin: 0 on a hidden triangle's corners, counting out through what shows
    var i0 = m.userData.index0, d = new Float32Array(S.ns).fill(Infinity), front = [], k, t;
    var sv = function(v){ return S.src ? S.src[v] : v; };
    if(hide) for(t=0;t<i0.length/3;t++) if(hide[t]) for(k=0;k<3;k++){ var v = sv(i0[3*t+k]); if(d[v]) { d[v] = 0; front.push(v); } }
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
          var hide = KCHAR.hidden(rec, kit), hideParts = KCHAR.hiddenParts(rec, kit), head = KCHAR.headOf(rec, kit);
          var top = rec.armour && rec.armour.torso && kit.items && kit.items.filter(function(it){ return it.id === rec.armour.torso; })[0];
          pushU.kcT.value = top && top.tucks ? TUCK : 0;
          // trousers (legs, not loose) under a loose top: the top's push clears them too (PAD_OVER more)
          var legs = rec.armour && rec.armour.legs && kit.items && kit.items.filter(function(it){ return it.id === rec.armour.legs; })[0];
          // and under a loose top they are drawn in to the legs, so wide ones (harem pants) stay under it: all the way
          // under one that reaches below the knees (kit item long: a robe, the kimono), else down to its hem (kit item
          // hem: a fraction of the hip-to-ankle length), so below a shirt's hem they are as wide as they are (the
          // festive shirt showed the trousers through its front in a stride)
          pushU.kcS.value = top && top.loose && legs && !legs.loose ? SQUEEZE : 0;
          pushU.kcSH.value = top && top.long ? 1e3 : top && top.hem != null ? top.hem : 0;
          // and boots under one, whatever the legs wear: their cuffs came through a kimono's hem at the shins
          pushU.kcSF.value = top && top.loose && top.long ? SQUEEZE_FEET : 0;
          // (a loose top over a loose skirt by the skirt's own pad more, so its hem stays outside it)
          Object.keys(want).forEach(function(k){ var u = want[k].userData.pad, pt = want[k].userData.part;
            if(u && u.base) u.value = u.base + (pt.slot !== 'torso' ? 0 : legs && !legs.loose ? PAD_OVER : legs && legs.loose ? PAD_SKIRT : 0); });
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
          Object.keys(want).forEach(function(k){
            var m = want[k], part = m.userData.part;
            skinScale(m, p, mj && mj.d);
            var role = roles[m.userData.srcMaterial];
            if(part.role === 'base'){
              // a MakeHuman base: only its skin primitive is masked; brows, lashes and nails stay
              if(kit.style !== 'mpfb') filterBase(m, hide[part.slot]);
              else if(m.userData.srcMaterial === kit.base_material){ filterBase(m, hide.base); coatShells(m, rec, gain, hide.base); }
              else if(hideParts[m.userData.srcMaterial] || coatHides(rec)[m.userData.srcMaterial]) m.visible = false;     // the nipples under a top (kit hide_parts) or a coat
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
  this.pushState = function(){ return pushU; };                                  // tools: the push's capsules (w 0: off)
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
      c.chains.forEach(function(ch){ ch.whole = ch.p.every(function(q){ return q.y > hipY; }); });
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
    var GW = THREE.MathUtils.clamp((0.3 - ch.stiff) / 0.2, 0, 1);
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
      var off = rtX.copy(ch.p[0]).applyMatrix4(F).negate().add(ch.tw[0]), y0 = ch.p[0].y, hy = Hm.y;
      for(var k = 1; k < ch.p.length; k++){
        var fk = THREE.MathUtils.clamp((ch.p[k].y - hy) / Math.max(1e-4, y0 - hy), 0, 1);
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
      return { a:A, b:B, r:cp.r * sc + PAD, r0:cp.r * sc, leg:LEGJ.test(bones[cp.a].name), seat:!!cp.pa };
    });
    // the seat's two upright capsules as one across the buttocks, for the chains: a skirt's point at the back between
    // them went out of one toward the other and out of that, sideways, and its chain kinked at the top (the fold)
    var seats = W.filter(function(w){ return w.seat; });
    if(seats.length === 2){
      W = W.filter(function(w){ return !w.seat; });
      W.push({ a:seats[0].a.clone().add(seats[0].b).multiplyScalar(0.5), b:seats[1].a.clone().add(seats[1].b).multiplyScalar(0.5),
               r:seats[0].r, leg:false });
    }
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
        var rt = cV3.subVectors(rw, cp.a).dot(cV) / lsq;
        cV3.copy(cp.a).addScaledVector(cV, THREE.MathUtils.clamp(rt, 0, 1));
        // (on a leg, no less than the bare limb: a skirt's rest follows the hips, and the thigh swung forward in a stride
        // over it would take the cloth in)
        var r = Math.min(cp.r, Math.max(rw.distanceTo(cV3), cp.leg ? cp.r0 : 0));
        var t = THREE.MathUtils.clamp(cV2.subVectors(x, cp.a).dot(cV) / lsq, 0, 1);
        cAx.copy(cV).normalize();
        cV2.copy(cp.a).addScaledVector(cV, t);
        var d = x.distanceTo(cV2);
        if(d < r && d > 1e-6){
          // across a limb that lies across the cloth's fall (a seated thigh, a raised arm: nearer level than upright),
          // out on the side of the point above, so the chain drapes over it rather than passing under; along an
          // upright limb, out the side away from the body's axis, so cloth never ends up behind a leg in a stride
          cV.subVectors(x, cV2);
          cO.subVectors(up, cV2); cO.addScaledVector(cAx, -cO.dot(cAx));
          var ol = Math.abs(cAx.y) < 0.7 ? cO.length() : 0, cs = 0;
          if(ol > 1e-4){ cO.divideScalar(ol); cs = cV.dot(cO); if(cs < 0) cV.addScaledVector(cO, -2 * cs); }
          if(ol <= 1e-4 && cp.leg && cO.subVectors(rw, cV2).dot(cLat) * Math.sign((cV2.x - hipW.x) * cLat.x + (cV2.z - hipW.z) * cLat.z) > -0.5 * cp.r){
            // (the legs only: on the trunk's capsules, the chest leaning forward of the hips in a clip, it threw a
            // mantle's points at the back of the neck through the body to the front; and not for a point whose rest
            // lies on the thigh's inner side, between the legs: a skirt's back centre, thrown out through the thigh)
            cO.set(cV2.x - hipW.x, 0, cV2.z - hipW.z);
            if(cO.lengthSq() > 9e-4){ cO.normalize(); cs = cV.dot(cO); if(cs < 0) cV.addScaledVector(cO, -2 * cs); }
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
                kcT:{ value:0 }, kcS:{ value:0 }, kcSF:{ value:0 }, kcSH:{ value:0 }, kcU:{ value:new THREE.Vector3(0, 1, 0) } }, noTuck = { value:0 }, TUCK = 0.025, PAD_TOP = 0.02, PAD_SKIRT = 0.02, PAD_OVER = 0.035,
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
     round the knee (the thigh's end) and the inside of each leg toward the other, and the court's legs came out thin */
  var BACK_DEPTH = 0.01;
  var KNEE = 0.04;      // how far a fully bent knee's corner stands out of its two capsules (kchar_push.gdshader)
  function pushOut(mat, pad, loose, legs, feet){
    var prev = mat.onBeforeCompile, padU = { value:pad || 0, base:pad || 0 }, looseU = { value:loose ? 1 : 0 };
    mat.onBeforeCompile = function(sh, r){
      if(prev) prev(sh, r);
      sh.uniforms.kcA = pushU.kcA; sh.uniforms.kcB = pushU.kcB; sh.uniforms.kcR = pushU.kcR; sh.uniforms.kcH = pushU.kcH; sh.uniforms.kcU = pushU.kcU; sh.uniforms.kcP = padU;
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
      sh.vertexShader = 'uniform vec4 kcA[' + NCAP + '];\nuniform vec4 kcB[' + NCAP + '];\nuniform float kcR[' + NCAP + '];\nuniform vec3 kcH;\nuniform vec3 kcU;\nuniform float kcP;\nuniform float kcL;\nuniform float kcT;\nuniform float kcS;\nuniform float kcSH;\n' + sh.vertexShader.replace('#include <skinning_vertex>',
        '#include <skinning_vertex>\n\tvec3 cbk = (kcA[14].xyz + kcA[15].xyz) * 0.5 - kcH; cbk.y = 0.0; cbk *= kcA[14].w > 0.0 ? 1.0 / max(length(cbk), 1e-5) : 0.0;\n' +
        '\tfor(int ci = 0; ci < ' + NCAP + '; ci++){\n\t\tif(kcL < 0.5 || kcA[ci].w <= 0.0) continue;\n' +
        '\t\tvec3 ca = kcA[ci].xyz, cab = kcB[ci].xyz - ca; float csh = kcB[ci].w > 0.5 ? 0.0 : 0.015;\n' +
        // (faded, over 5 cm behind and down the thigh from a third to two fifths: cut off hard, the cloth either side of the
        // line was pushed and not, and a shirt over trousers tore down the side of the hip in a stride)
        '\t\tfloat ct = dot(transformed - ca, cab) / max(dot(cab, cab), 1e-8), cup = 1.0;\n' +
        '\t\tif(ci < 2){ cup = kcA[14].w <= 0.0 ? 0.0 : 1.0 - smoothstep(-0.05, 0.0, dot(transformed - ca, cbk));\n' +
        '\t\t\tcup = max(cup, smoothstep(0.3, 0.4, ct)); if(cup <= 0.0) continue; }\n\t\tct = clamp(ct, 0.0, 1.0);\n' +
        '\t\tfloat cr = mix(kcA[ci].w, kcR[ci] > 0.0 ? kcR[ci] : kcA[ci].w, ct) + (csh > 0.0 ? kcP : 0.0);\n' +
        // a bent knee's corner, which the thigh's and the shin's capsules leave uncovered: the radius grows toward the knee
        // by up to KNEE as the leg bends (an Order robe's front showed the whole knee in a run)
        '\t\tif(ci < 4 && csh > 0.0){ int th = ci < 2 ? ci : ci - 2;\n' +
        '\t\t\tfloat bend = clamp(1.0 - dot(normalize(kcB[th].xyz - kcA[th].xyz), normalize(kcB[th + 2].xyz - kcA[th + 2].xyz)), 0.0, 1.0);\n' +
        '\t\t\tcr += ' + KNEE.toFixed(3) + ' * bend * (ci < 2 ? smoothstep(0.7, 1.0, ct) : 1.0 - smoothstep(0.0, 0.3, ct)); }\n' +
        '\t\tfloat cR = cr + csh;\n' +
        '\t\tvec3 cq = ca + cab * ct, cd = transformed - cq; float cl = length(cd);\n' +
        '\t\tif(cl < cR && cl > 1e-5){\n' +
        '\t\t\tvec3 co = vec3(cq.x - kcH.x, 0.0, cq.z - kcH.z); float col = length(co);\n' +
        // and the deeper it lies the more it goes straight out that side: near the bone the way out from it is noise, and a
        // robe's front, left inside a raised thigh in a run, split left and right round the knee and showed it. The side
        // is the one the cloth faces (objectNormal, skinned): a leg swung back has the body's axis in front of it, and
        // a skirt's front, sent out the back, left the leg bare down its side
        '\t\t\tif(cl < cr && csh > 0.0 && col > 1e-4){ co /= col; if(dot(objectNormal, co) < 0.0) co = -co; float cs = dot(cd, co); if(cs < 0.0) cd -= 2.0 * cs * co;\n' +
        '\t\t\t\tfloat cw = 1.0 - cl / cr; cw *= cw; cd = normalize(cd) * (1.0 - cw) + co * cw; }\n' +
        '\t\t\ttransformed = mix(transformed, cq + normalize(cd) * (cr - csh + cl * 2.0 * csh / cR), cup);\n\t\t}\n\t}\n' +
        '\tif(kcS > 0.0 && transformed.y < kcH.y){\n\t\tfloat sb = 1e9; vec3 sbq = vec3(0.0); float sbr = 0.0, sbt = 0.0; int sbi = 0;\n' +
        '\t\tfor(int ci = 0; ci < 6; ci++){\n\t\t\tif(kcA[ci].w <= 0.0) continue;\n' +
        '\t\t\tvec3 sa = kcA[ci].xyz, sab = kcB[ci].xyz - sa; float st = clamp(dot(transformed - sa, sab) / max(dot(sab, sab), 1e-8), 0.0, 1.0);\n' +
        '\t\t\tfloat sr = mix(kcA[ci].w, kcR[ci] > 0.0 ? kcR[ci] : kcA[ci].w, st) + kcS;\n' +
        '\t\t\tvec3 sq = sa + sab * st; float sl = length(transformed - sq);\n' +
        '\t\t\tif(sl - sr < sb){ sb = sl - sr; sbq = sq; sbr = sr; sbt = st; sbi = ci; }\n\t\t}\n' +
        // how far down the leg it is (thigh, then shin, then foot), against the top's hem (kcSH, of the hip to the ankle)
        '\t\tint sdi = sbi < 2 ? sbi : sbi < 4 ? sbi - 2 : sbi - 4;\n' +
        '\t\tfloat slt = length(kcB[sdi].xyz - kcA[sdi].xyz), sls = length(kcB[sdi + 2].xyz - kcA[sdi + 2].xyz);\n' +
        '\t\tfloat sdd = sbi < 2 ? sbt * slt : sbi < 4 ? slt + sbt * sls : slt + sls + sbt * 0.1, shm = kcSH * (slt + sls);\n' +
        '\t\tfloat sf = 1.0 - smoothstep(shm - 0.02, shm + 0.02, sdd);\n' +
        '\t\tvec3 sd = transformed - sbq; float sl = length(sd);\n\t\tif(sb > 0.0 && sb < 0.15) transformed = mix(transformed, sbq + sd * (sbr / sl), sf);\n\t}\n' +
        // (the way in is the trunk's, kcU (legCaps), not the world's, and the height above the hips the greater of the two:
        // in a forward bend, a heavy push or a swim, the band at the small of the back came out through a T-shirt, drawn
        // in level; measured up the trunk alone, the back of the band sat low in a crouch and stood out of the hem)
        '\tif(kcT > 0.0){\n\t\tvec3 tr = transformed - kcH; float th = dot(tr, kcU); vec3 tq = tr - th * kcU;\n' +
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
  var TUCK_UP = 'Spine1', tuckRest = null, tuckQ = new THREE.Quaternion(), tuckV = new THREE.Vector3();

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

  function afterClip(dt){ posture(); arms2(dt); bodyFix(); toesFlat(); grip(); bladeClear(dt); twoHands(dt); toFace(); standUp(); clothStep(dt); legCaps(); bowString(dt); hang(); }

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
KCharFigure.clipData = {};   // data/clips.json clips by key: hold, two_hands, face, nock, lead_left (the page fills it)
KCharFigure.faces = {};      // data/clips.json faces: per body, the face's points (the page fills it)
KCharFigure.posture = {};    // data/posture.json bodies (the page fills it)
KCharFigure.postureClips = {};   // data/posture.json clips: per clip, per body, degrees added (the page fills it)
KCharFigure.postureFrame = 'figure';   // data/posture.json frame: 'joint' pitches about each joint's parent's side axis
