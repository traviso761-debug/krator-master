/* ============================== 10. BLOCK KIT ============================== */
reseed(450001);   /* fragment head seed — build.py enforces this. Each fragment
                   owns its own PRNG stream so an edit here cannot shift
                   anything generated in a later fragment. */

/* Everything the city is made of is pushed into buckets and emitted as a
   handful of InstancedMeshes at the end — one draw call per (shape, family). */

var BUCKET = {};
function push(shape, fam, rec){
  var k = shape+'|'+fam;
  (BUCKET[k] || (BUCKET[k] = { shape:shape, fam:fam, list:[] })).list.push(rec);
}
/* rec = [x, y(base), z, sx, sy, sz, ry, color] */
function BOX (x,y,z,w,h,d,ry,c,f){ push('box',  f||'stone',[x,y,z,w,h,d,ry||0,c]); }
function FR8 (x,y,z,w,h,d,ry,c,f){ push('fr8',  f||'stone',[x,y,z,w,h,d,ry||0,c]); }  // gentle batter
function FR6 (x,y,z,w,h,d,ry,c,f){ push('fr6',  f||'stone',[x,y,z,w,h,d,ry||0,c]); }  // strong taper
function FR3 (x,y,z,w,h,d,ry,c,f){ push('fr3',  f||'stone',[x,y,z,w,h,d,ry||0,c]); }  // spire
function DOME(x,y,z,r,h,ry,c,f)  { push('dome', f||'dome', [x,y,z,r,h,r,ry||0,c]); }
function BLOB(x,y,z,r,h,ry,c,f)  { push('blob', f||'leaf', [x,y,z,r,h,r,ry||0,c]); }
function STK (x,y,z,r,h,ry,c,f)  { push('stk',  f||'trunk',[x,y,z,r,h,r,ry||0,c]); }
function CYL (x,y,z,r,h,ry,c,f)  { push('cyl',  f||'stone',[x,y,z,r,h,r,ry||0,c]); }
function CONE(x,y,z,r,h,ry,c,f)  { push('cone', f||'roof', [x,y,z,r,h,r,ry||0,c]); }

function rectFrus(tx,tz){
  var b=0.5, X=tx*0.5, Z=tz*0.5;
  var v=[[-b,0,-b],[b,0,-b],[b,0,b],[-b,0,b],[-X,1,-Z],[X,1,-Z],[X,1,Z],[-X,1,Z]];
  var faces=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[3,2,1,0]];
  var uvOf=[function(p){return [p[0]+0.5,p[1]];},function(p){return [p[2]+0.5,p[1]];},
            function(p){return [p[0]+0.5,p[1]];},function(p){return [p[2]+0.5,p[1]];},
            function(p){return [p[0]+0.5,p[2]+0.5];},function(p){return [p[0]+0.5,p[2]+0.5];}];
  var pos=[],uv=[];
  faces.forEach(function(f,i){
    [[0,2,1],[0,3,2]].forEach(function(t){ t.forEach(function(k){
      pos.push(v[f[k]][0],v[f[k]][1],v[f[k]][2]);
      var q=uvOf[i](v[f[k]]); uv.push(q[0],q[1]);
    });});
  });
  var g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
  g.computeVertexNormals();
  return g;
}

var SHAPES = {
  box : function(){ return new THREE.BoxGeometry(1,1,1).translate(0,0.5,0); },
  fr8 : function(){ return rectFrus(0.86,0.86); },
  fr6 : function(){ return rectFrus(0.60,0.60); },
  fr3 : function(){ return rectFrus(0.26,0.26); },
  dome: function(){ return new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI*0.5); },
  blob: function(){ return new THREE.SphereGeometry(1,8,5,0,Math.PI*2,0,Math.PI*0.5); },
  cyl : function(){ return new THREE.CylinderGeometry(1,1,1,10).translate(0,0.5,0); },
  stk : function(){ return new THREE.CylinderGeometry(0.8,1,1,6).translate(0,0.5,0); },
  cone: function(){ return new THREE.ConeGeometry(1,1,6).translate(0,0.5,0); }
};
/* FAMMAT lives in 05-palette.js — the texturing pass owns that table. */

/* Tile a family's texture in WORLD units. Instance UVs are unit-space, so
   without this every building wears the same texture stretched to its own
   size and a warehouse reads as a cottage. The instance scale is recovered
   from instanceMatrix in the vertex shader; which pair of extents to use is
   chosen from the face normal. Applied via onBeforeCompile, composed with
   applyClothSway below rather than assigned directly to the material, since
   a bucket may need both. */
function applyWorldUV(sh, sc){
  var su = sc[0].toFixed(2), sv = sc[1].toFixed(2);
  sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>',
    '#include <uv_vertex>\n' +
    '#ifdef USE_INSTANCING\n' +
    '  vec3 _isc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));\n' +
    '  float _ay = step(0.5, abs(normal.y));\n' +
    '  float _ax = step(0.5, abs(normal.x));\n' +
    '  float _u = mix(mix(_isc.x, _isc.z, _ax), _isc.x, _ay);\n' +
    '  float _v = mix(_isc.y, _isc.z, _ay);\n' +
    /* Real bug, not a tuning knob: this UV was derived ONLY from instance
       SCALE, never position — so every instance of a given family/size in
       the WHOLE CITY samples the identical texture from the identical
       local (0,0) corner. Any one-off feature in a texture (a macro
       blotch, a stain, anything not perfectly uniform) therefore lands in
       the same relative spot on every wall of that size, which is exactly
       what reads as "uniform and repetitive" / a visible fingerprint no
       amount of retuning the canvas alone can fix — the texture was never
       the problem, this hook was. Fixed with a per-instance UV offset
       hashed from the instance's own world position (instanceMatrix[3],
       the same trick applyClothSway already uses a few lines below for a
       per-instance sway phase), so two same-sized walls standing side by
       side sample two different regions of the same seamless-tileable
       canvas instead of the identical corner. Costs one hash in the
       vertex shader, no new attribute/instance/draw call. */
    '  vec2 _uoff = fract(sin(vec2(dot(instanceMatrix[3].xz, vec2(12.9898,78.233)),\n' +
    '                              dot(instanceMatrix[3].xz, vec2(39.3468,11.1352)))) * vec2(43758.5453, 24634.6345));\n' +
    '  vUv = uv * vec2(_u / ' + su + ', _v / ' + sv + ') + _uoff;\n' +
    '#endif\n');
}

/* Wind sway for the 'cloth' family — banners, sails, anything hung from a
   fixed edge. All cloth-family instances (any shape) share ONE clock, so a
   single frame() update in 80-camera.js animates every one of them; each
   instance gets its own phase (hashed from its world position) so a row of
   banners doesn't flap in lockstep. Displacement is in local space, scaled
   by (1-position.y)^2 so a BOX's local y=1 (top) stays anchored — that is
   the edge the thing hangs from — and y=0 (bottom/free edge) swings most.

   2nd real bug found here: the displacement used to go into transformed.x
   only. Local-space displacement is scaled by the INSTANCE matrix (which
   carries the BOX's own w/h/d as its scale) when project_vertex applies it
   afterward — so which local axis actually reads as motion depends on
   which of a banner's own w/d the caller happened to put on x vs z. Almost
   every banner in the build (bridge/gate/temple banners: w=0.16-ish
   "thin", d=3-6-ish "wide") puts the wide face on z, not x, so swaying
   only x moved them by (thin-dimension * amplitude) — a fraction of a
   world unit, invisible. Only 60-land.js's ship-mast sails happened to use
   the opposite order (w=wide, d=thin), which is the one case that was
   ever visibly confirmed swaying. Fixed by displacing BOTH transformed.x
   and transformed.z by the same amount: whichever axis is actually wide
   for a given instance dominates the visible motion, the thin axis
   contributes nothing either way — correct regardless of which of a box's
   own w/d a given call site treated as "wide". */
var CLOTH_TIME = { value: 0 };
function applyClothSway(sh){
  sh.uniforms.uWindTime = CLOTH_TIME;
  /* the uniform must be DECLARED in the shader source, not just registered
     in sh.uniforms — that only wires up the JS-side value. Without this the
     vertex shader fails to compile on 'undeclared identifier uWindTime' and
     every cloth instance in the scene silently fails to render (found via
     the facade agent's banners; also broke the ship sails, unrelated code
     that happened to share this bug). */
  sh.vertexShader = sh.vertexShader.replace('#include <common>',
    '#include <common>\nuniform float uWindTime;');
  sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\n' +
    '#ifdef USE_INSTANCING\n' +
    '  float _swayPhase = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898,78.233))) * 43758.5453) * 6.28318;\n' +
    '  float _swayAmt = (1.0 - position.y) * (1.0 - position.y);\n' +
    '  float _sway = sin(uWindTime * 1.6 + _swayPhase) * 0.16 + sin(uWindTime * 2.7 + _swayPhase * 1.3) * 0.07;\n' +
    '  transformed.x += _sway * _swayAmt;\n' +
    '  transformed.z += _sway * _swayAmt;\n' +
    '#endif\n');
}

/* ============================== NIGHT ILLUMINATION ========================
   Owner: "i wish lights had a visible illuminatory effect on their
   surroundings at night... lanterns, braziers, and streetlights should have
   this illuminating glow proportional to size and number of lights in a
   close area. Also, add a weaker lighting effect to windows at night."

   WHY A BAKED 2D LIGHTMAP AND NOT A UNIFORM ARRAY OF LIGHT POSITIONS.
   The natural first answer — inject `uniform vec4 uLamps[N]` and loop the
   nearest N in the fragment shader — is the idiom applyWorldUV/
   applyClothSway above already establish, and it is the right shape for a
   handful of lights. It does not survive this city:

     * there are 316 static flames as measured (the fixed head of
       82-daynight.js's NIGHT_LIGHTS, which includes all 131 STATIC_LANTERNS
       from 72-lanterns.js, plus every street brazier 68-props.js and
       69-district-content.js scatter along the road graph — window.
       _nightGlow.lamps reports the live count), and a per-fragment loop
       over 316 vec4s is not a shader anyone should ship;
     * "the nearest N" cannot be chosen per object, because there IS no per
       object. emitBuckets() below merges the whole city into ONE
       InstancedMesh per (shape, family) — a single box|stone draw call
       spans the entire map, so every fragment in it would have to search
       the same global array anyway. The usual fix (light culling per draw
       call) is unavailable precisely because the draw-call count is what
       this build optimises for.

   So the light field is precomputed instead of searched: every lamp splats
   a soft radial kernel into one 1024x1024 RGBA texture indexed by world XZ,
   and the shader does ONE texture fetch. Cost: zero draw calls, zero
   instances, one texel fetch, 4 MB of texture. Density scaling then falls
   out for free — the splats SUM, so a plaza with a dozen lanterns reads
   brighter and wider than a lone bracket on a wall without anyone coding a
   "cluster" rule; and size scaling is just the per-lamp amp/radius (a
   temple brazier splats 3x the amplitude over 2x the radius of a torch).

   Channels:  R = lamp pool intensity          G = mean lamp height
              B = window pool intensity        A = mean window height
   The height channels give the pool a vertical falloff, so a lantern on a
   canton deck 40 units up does not wash the sea floor underneath it and a
   street brazier does not light the parapet of the tower above it.

   The lamp colour now comes from PAL.flame.warm — it started as a local
   literal here because 05-palette.js is planner-owned, and was promoted on
   request once it turned out to be used in two places. It is the only
   LINEAR-space entry in the palette: it multiplies into reflectedLight
   before the sRGB encode, so a hex would be wrong by a gamma. */
var NLM_RES  = 1024;                 /* ~7.6 world units per texel over CITY_EXT */
var NLM_EXT  = CITY_EXT;
/* byte 255 == this much summed lamp intensity, so this is also a deliberate
   CEILING on how bright density can make a place: the temple platform
   actually sums to 11.3 (measured, window._nightGlow.peakLampPool) and is
   clamped to 3. Without the ceiling a dense plaza blows out to flat white,
   which is exactly the electric-light look the owner ruled out; with it, a
   crowd of lanterns still reads as brighter than a lone one (3x) AND as a
   far wider pool, which is the cue that actually carries at a distance. */
var NLM_LAMP_MAX = 3.0;
var NLM_WIN_MAX  = 1.2;
var NLM_Y0 = -12, NLM_YSPAN = 268;   /* height-channel encode range, world units */
var NLM_WARM = PAL.flame.warm;       /* LINEAR-space flame colour (~#ffc480 after sRGB out) */
/* Tuned against screenshots, not guessed. Full night here sits at
   hemi 0.16 + ambient 0.11 (82-daynight.js's own HEMI_NIGHT_I/AMB_NIGHT_I),
   so ~0.27 of irradiance is the "unlit night" reference: a LONE lantern
   (pool 1.0) adding 0.48 roughly triples the light on the ground it stands
   on, and a dense plaza (pool clamped at NLM_LAMP_MAX 3.0) adds 1.44. That
   is a strong, obviously-firelit pool without reaching the flat white an
   electric lamp would give — the owner's "less powerful than... electric". */
var NLM_LAMP_GAIN  = 0.48;           /* irradiance added per unit of pooled lamp intensity */
var NLM_WIN_GAIN   = 0.22;           /* windows read distinctly weaker than a flame, per the ask */
var NLM_VFALL_LAMP = 0.050;          /* e-folding height, 1/world-units */
var NLM_VFALL_WIN  = 0.070;
var NLM_WIN_AMP = 0.55, NLM_WIN_RAD = 14;
var NLM_ALLNIGHT_FRAC = 0.05;        /* owner: "maybe 1 in 20 stay on throughout the entire night" */

/* [x, y, z, amp, radius] — every static flame in the city. Moving lanterns
   (boats, carts, ordinators) are deliberately NOT here: the map is baked
   once, and a light that travels cannot be baked into it. */
var NL_LAMPS = [];
/* [x, yCentre, z, ry, lx, ly, lz, hOn, hOff, allNight] — every window. */
var NL_WINDOWS = [];

/* Deterministic per-position hash — the same sin/dot idiom applyWorldUV()
   and plasterHash() (65-facade.js) already use. Explicitly NOT rnd(): which
   windows stay lit all night must survive a rebuild and must not be
   reshuffled by an unrelated edit upstream advancing the shared stream. */
function nlHash(x,y,z,salt){
  var v = Math.sin(x*12.9898 + z*78.233 + y*37.719 + salt*93.9898) * 43758.5453;
  return v - Math.floor(v);
}
function nlLampAdd(x,y,z,amp,rad){
  NL_LAMPS.push([x,y,z, amp==null?1:amp, rad==null?17:rad]);
}
/* ---- COLOURED lamps ------------------------------------------------------
   The map above carries exactly one flame colour for the whole city
   (NLM_WARM, baked into the shader as a constant) because until now every
   flame in Voth was a warm one. The Fortress's four ornamental tower flames
   are green, and a green flame that pools warm light on the stone under it
   is worse than no pool at all — so this is a second, deliberately TINY
   source type that rides alongside the baked map instead of in it.

   Not a second texture: the RGBA of nlmTex is fully spoken for (lamp
   intensity/height, window intensity/height), a fifth channel would mean a
   whole second 1024x1024 DataTexture and a second sampler in every material
   in the city, and there are FOUR of these lights, all within 110 units of
   each other. Four analytic point sources evaluated straight in the
   fragment shader are far cheaper than that and exactly as correct: same
   quartic falloff the bake's own splat() uses, same exponential height
   falloff (NLM_VFALL_LAMP) and the same NLM_LAMP_GAIN/uNlNight gating, so a
   green flame pools light on its tower by precisely the rules a warm one
   pools light on its quay.

   NLM_GREEN_MAX is a hard cap: the loop bound is a compile-time constant in
   GLSL ES 1.0, and this is meant to stay a handful of special lights, not
   become a second general lamp system. Extra registrations past it are
   dropped rather than silently reshaping the shader. */
var NLM_GREEN_MAX = 4;
var NLM_GREEN_COL = PAL.flame.green;      /* LINEAR-space, like NLM_WARM — a saturated flame green */
var NL_GREEN = [];                        /* [x,y,z,amp,rad] */
function nlGreenAdd(x,y,z,amp,rad){
  if(NL_GREEN.length >= NLM_GREEN_MAX) return false;
  NL_GREEN.push([x,y,z, amp==null?1:amp, rad==null?24:rad]);
  return true;
}
/* Registered from the window helpers themselves (wallWindow/addWindows/
   guildHallWindows3 in 65-facade.js, monasteryWindow in 61-monastery.js),
   never from a call site — that is what makes this cover buildings nobody
   has written yet, and the defined-but-unplaced granary/windmill/watermill/
   beetleRanch the moment someone places them.
   lx/ly/lz are the window BOX's own full local extents; whichever of lx/lz
   is the thin one is the wall normal, so the glow needs no separate facing
   argument (and monasteryWindow, which genuinely does not know which side
   of the wall it is on, still works). */
function nlWinAdd(x,yCentre,z,ry,lx,ly,lz){
  NL_WINDOWS.push([x,yCentre,z,ry,lx,ly,lz,
                   nlHash(x,yCentre,z,1.7), nlHash(x,yCentre,z,5.3),
                   nlHash(x,yCentre,z,11.9) < NLM_ALLNIGHT_FRAC]);
}

/* THE CHOKEPOINT. A window opening is the same BOX it has always been, plus
   one registration. Every window emitter in the build — wallWindow(),
   addWindows(), guildHallWindows3(), townFacade()'s own guaranteed plaster
   windows (65-facade.js) and monasteryWindow() (61-monastery.js) — calls
   this instead of BOX, and every building present or future inherits lit
   windows for free by routing through one of those five, including the
   defined-but-unplaced granary()/windmill()/watermill()/beetleRanch(),
   which already do. Identical signature to BOX so a call site swaps one
   identifier and nothing else. */
function WINBOX(x,y,z,w,h,d,ry,c,f){
  BOX(x,y,z,w,h,d,ry,c,f);
  nlWinAdd(x, y + h*0.5, z, ry||0, w, h, d);
}

var nlmTex = new THREE.DataTexture(new Uint8Array(NLM_RES*NLM_RES*4), NLM_RES, NLM_RES, THREE.RGBAFormat);
nlmTex.minFilter = nlmTex.magFilter = THREE.LinearFilter;
nlmTex.wrapS = nlmTex.wrapT = THREE.ClampToEdgeWrapping;
nlmTex.generateMipmaps = false;
nlmTex.flipY = false;                /* row 0 of the data is v=0; the row<->z map below assumes it */
nlmTex.needsUpdate = true;

/* one shared uniform object per name, handed to every material's compiled
   shader — so the per-frame update in 82-daynight.js writes ONE value and
   every bucket in the city sees it, exactly like CLOTH_TIME above. */
var NLM_U = { uNlMap:{ value:nlmTex }, uNlExt:{ value:NLM_EXT },
              uNlNight:{ value:0 }, uNlWin:{ value:0 },
              /* the coloured (green) lamps: xyz + radius per slot, amplitude
                 alongside. w<=0 means "slot unused", which is the shader's
                 own early-out, so an unregistered slot costs one compare.
                 Filled by nlmBake() once every fragment has registered. */
              uNlG:{ value: (function(){ var a=[]; for(var i=0;i<NLM_GREEN_MAX;i++) a.push(new THREE.Vector4(0,0,0,0)); return a; })() },
              uNlGAmp:{ value: (function(){ var a=[]; for(var i=0;i<NLM_GREEN_MAX;i++) a.push(0); return a; })() } };

/* Bake. Called once from 82-daynight.js, after every fragment that can
   register a lamp has run. Accumulates in float, then encodes to bytes. */
function nlmBake(){
  var N = NLM_RES, S = N/(2*NLM_EXT), NN = N*N;
  var la = new Float32Array(NN), ly = new Float32Array(NN);
  var wa = new Float32Array(NN), wy = new Float32Array(NN);
  function splat(acc, accY, x, y, z, amp, rad){
    var cx = (x + NLM_EXT)*S, cz = (NLM_EXT - z)*S, pr = Math.max(1.0, rad*S);
    var i0 = Math.max(0, Math.floor(cx-pr)), i1 = Math.min(N-1, Math.ceil(cx+pr));
    var j0 = Math.max(0, Math.floor(cz-pr)), j1 = Math.min(N-1, Math.ceil(cz+pr));
    var pr2 = pr*pr;
    for(var j=j0;j<=j1;j++){
      var dz = (j+0.5)-cz, row = j*N;
      for(var i=i0;i<=i1;i++){
        var dx = (i+0.5)-cx, d2 = dx*dx + dz*dz;
        if(d2 >= pr2) continue;
        var t = 1 - d2/pr2, w = amp*t*t;          /* smooth quartic pool, 0 at the rim */
        acc[row+i] += w; accY[row+i] += w*y;
      }
    }
  }
  NL_LAMPS.forEach(function(L){ splat(la, ly, L[0], L[1], L[2], L[3], L[4]); });
  NL_WINDOWS.forEach(function(W){ splat(wa, wy, W[0], W[1], W[2], NLM_WIN_AMP, NLM_WIN_RAD); });
  var d = nlmTex.image.data, peakL = 0, peakW = 0;
  for(var k=0;k<NN;k++){
    var av = la[k], bv = wa[k];
    if(av > peakL) peakL = av;
    if(bv > peakW) peakW = bv;
    d[k*4]   = av > 0 ? Math.min(255, Math.round(av/NLM_LAMP_MAX*255)) : 0;
    d[k*4+1] = av > 0 ? Math.max(0, Math.min(255, Math.round(((ly[k]/av)-NLM_Y0)/NLM_YSPAN*255))) : 0;
    d[k*4+2] = bv > 0 ? Math.min(255, Math.round(bv/NLM_WIN_MAX*255)) : 0;
    d[k*4+3] = bv > 0 ? Math.max(0, Math.min(255, Math.round(((wy[k]/bv)-NLM_Y0)/NLM_YSPAN*255))) : 0;
  }
  nlmTex.needsUpdate = true;
  /* the coloured lamps are NOT splatted into the map (see nlGreenAdd) —
     they are handed to the shader as points, here, at the same moment the
     baked map is finalised. */
  for(var gi=0; gi<NLM_GREEN_MAX; gi++){
    var G = NL_GREEN[gi];
    NLM_U.uNlG.value[gi].set(G?G[0]:0, G?G[1]:0, G?G[2]:0, G?G[4]:0);
    NLM_U.uNlGAmp.value[gi] = G ? G[3] : 0;
  }
  return { lamps:NL_LAMPS.length, windows:NL_WINDOWS.length, green:NL_GREEN.length, res:NLM_RES,
           peakLampPool:+peakL.toFixed(2), peakWinPool:+peakW.toFixed(2) };
}

/* Shader injection, composed alongside applyWorldUV/applyClothSway exactly
   the way those two compose with each other. MeshLambertMaterial in r128 is
   Gouraud — the lighting is summed in the VERTEX shader into vLightFront —
   but the BRDF multiply and the final sum happen in the fragment shader, so
   `#include <aomap_fragment>` (the last line before outgoingLight is
   assembled) is the injection point: by then reflectedLight.indirectDiffuse
   has already been multiplied by diffuseColor, so the pool term carries its
   own `* diffuseColor.rgb` and therefore takes the colour of whatever wall
   or ground it lands on, as a real light would.
   `wpName` lets a material that ALREADY carries a world-position varying
   (terrMat, 75-terrain.js) hand its own over instead of paying for a
   second one. */
function applyNightGlow(sh, wpName){
  var wp = wpName || 'vNlWP';
  sh.uniforms.uNlMap   = NLM_U.uNlMap;
  sh.uniforms.uNlExt   = NLM_U.uNlExt;
  sh.uniforms.uNlNight = NLM_U.uNlNight;
  sh.uniforms.uNlWin   = NLM_U.uNlWin;
  sh.uniforms.uNlG     = NLM_U.uNlG;
  sh.uniforms.uNlGAmp  = NLM_U.uNlGAmp;
  if(!wpName){
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNlWP;')
      .replace('#include <project_vertex>',
        '#ifdef USE_INSTANCING\n' +
        '  vNlWP = (modelMatrix * instanceMatrix * vec4(transformed,1.0)).xyz;\n' +
        '#else\n' +
        '  vNlWP = (modelMatrix * vec4(transformed,1.0)).xyz;\n' +
        '#endif\n' +
        '#include <project_vertex>');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNlWP;');
  }
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>',
      '#include <common>\nuniform sampler2D uNlMap;\nuniform float uNlExt;\nuniform float uNlNight;\nuniform float uNlWin;\n' +
      'uniform vec4 uNlG[' + NLM_GREEN_MAX + '];\nuniform float uNlGAmp[' + NLM_GREEN_MAX + '];')
    .replace('#include <aomap_fragment>', [
      'if(uNlNight > 0.002){',
      '  vec2 _nuv = vec2((' + wp + '.x + uNlExt)/(2.0*uNlExt), (uNlExt - ' + wp + '.z)/(2.0*uNlExt));',
      '  if(_nuv.x > 0.0 && _nuv.x < 1.0 && _nuv.y > 0.0 && _nuv.y < 1.0){',
      '    vec4 _nlm = texture2D(uNlMap, _nuv);',
      '    float _lI = _nlm.r * ' + NLM_LAMP_MAX.toFixed(3) + ';',
      '    float _wI = _nlm.b * ' + NLM_WIN_MAX.toFixed(3) + ' * uNlWin;',
      '    float _lY = _nlm.g * ' + NLM_YSPAN.toFixed(1) + ' + (' + NLM_Y0.toFixed(1) + ');',
      '    float _wY = _nlm.a * ' + NLM_YSPAN.toFixed(1) + ' + (' + NLM_Y0.toFixed(1) + ');',
      '    float _lf = exp(-abs(' + wp + '.y - _lY) * ' + NLM_VFALL_LAMP.toFixed(4) + ');',
      '    float _wf = exp(-abs(' + wp + '.y - _wY) * ' + NLM_VFALL_WIN.toFixed(4) + ');',
      '    float _pool = _lI*_lf*' + NLM_LAMP_GAIN.toFixed(4) + ' + _wI*_wf*' + NLM_WIN_GAIN.toFixed(4) + ';',
      '    reflectedLight.indirectDiffuse += vec3(' + NLM_WARM[0].toFixed(3) + ',' + NLM_WARM[1].toFixed(3) + ',' + NLM_WARM[2].toFixed(3) + ')',
      '      * _pool * uNlNight * diffuseColor.rgb;',
      '  }',
      /* the coloured (green) lamps: analytic, outside the map-bounds test
         above because a point source needs no texture lookup and so has no
         reason to stop at the baked map's own edge. Same quartic pool and
         same height e-fold the bake uses, so a green flame lights its stone
         by the same rule a warm one lights its quay. */
      '  float _gp = 0.0;',
      '  for(int _gi=0; _gi<' + NLM_GREEN_MAX + '; _gi++){',
      '    vec4 _g = uNlG[_gi];',
      '    if(_g.w > 0.0){',
      '      vec2 _gd = vec2(' + wp + '.x - _g.x, ' + wp + '.z - _g.z);',
      '      float _gq = dot(_gd,_gd) / (_g.w*_g.w);',
      '      if(_gq < 1.0){',
      '        float _gt = 1.0 - _gq;',
      '        _gp += uNlGAmp[_gi] * _gt * _gt * exp(-abs(' + wp + '.y - _g.y) * ' + NLM_VFALL_LAMP.toFixed(4) + ');',
      '      }',
      '    }',
      '  }',
      '  if(_gp > 0.0){',
      '    reflectedLight.indirectDiffuse += vec3(' + NLM_GREEN_COL[0].toFixed(3) + ',' + NLM_GREEN_COL[1].toFixed(3) + ',' + NLM_GREEN_COL[2].toFixed(3) + ')',
      '      * _gp * ' + NLM_LAMP_GAIN.toFixed(4) + ' * uNlNight * diffuseColor.rgb;',
      '  }',
      '}',
      '#include <aomap_fragment>'
    ].join('\n'));
}

var _dm = new THREE.Object3D(), _col = new THREE.Color();
function emitBuckets(){
  var total=0, meshes=0;
  for(var k in BUCKET){
    var B = BUCKET[k];
    if(!B.list.length) continue;
    var geo = SHAPES[B.shape]();
    var fm  = FAMMAT[B.fam] || {};
    var mat = new THREE.MeshLambertMaterial({ color:0xffffff, map: fm.tex || null });
    mat.userData.fam = B.fam;
    /* every bucket now needs a hook (the night-light pool is universal), so
       the old "no UV, no sway -> skip onBeforeCompile entirely" early-out
       is gone; the cache key still separates the UV/sway variants. */
    (function(needsUV, needsSway, sc){
      mat.onBeforeCompile = function(sh){
        if(needsUV) applyWorldUV(sh, sc);
        if(needsSway) applyClothSway(sh);
        applyNightGlow(sh);
      };
      mat.customProgramCacheKey = function(){
        return (needsUV ? 'wuv'+sc[0].toFixed(2)+'_'+sc[1].toFixed(2) : '') + (needsSway ? '|sway' : '') + '|nl';
      };
    })(!!fm.tex, B.fam === 'cloth', fm.scale || [4,4]);
    var im = new THREE.InstancedMesh(geo, mat, B.list.length);
    im.userData.shape = B.shape; im.userData.fam = B.fam;    /* dev inspector (86-inspect.js) reads these */
    im.castShadow = !FAST; im.receiveShadow = !FAST;
    for(var i=0;i<B.list.length;i++){
      var r = B.list[i];
      _dm.position.set(r[0],r[1],r[2]);
      _dm.scale.set(r[3],r[4],r[5]);
      _dm.rotation.set(0,r[6],0);
      _dm.updateMatrix();
      im.setMatrixAt(i,_dm.matrix);
      im.setColorAt(i,_col.set(r[7]).convertSRGBToLinear());
    }
    if(im.instanceColor) im.instanceColor.needsUpdate = true;
    im.instanceMatrix.needsUpdate = true;
    im.frustumCulled = false;
    scene.add(im);
    total += B.list.length; meshes++;
  }
  return { instances:total, meshes:meshes };
}

/* ---- palette ---- */
/* TONES / TONES_POOR / ROOFS / DOMEC live in 05-palette.js. */
function tone(){ return pick(TONES); }

/* ---- shared architectural vocabulary -------------------------------------
   kind: 'hlaalu'  stacked flat-roofed blocks with a parapet
         'velothi' battered tower, often capped by a cone or small dome
         'domed'   a block carrying a hemisphere
         'hovel'   one crude box, sometimes a lean-to                        */
function structure(x, yb, z, w, d, h, ry, kind, col, opt){
  opt = opt || {};
  var roof = opt.roof || pick(ROOFS);
  /* poor walls render in the 'plaster' family (stucco/mud-brick pattern)
     instead of defaulting to 'stone' (coursed ashlar) — wealthy/canton/
     large-structure kinds ('velothi','domed') never set opt.poor and are
     unaffected. Only the wall/cornice/parapet BOX calls in 'hovel' and
     'hlaalu' below read this; cap ornament (DOME/CYL) stays as it was. */
  var wallFam = opt.poor ? 'plaster' : undefined;
  if(kind === 'velothi'){
    var seg = Math.max(2, Math.round(h/13));
    var y = yb, cw = w, cd = d;
    for(var i=0;i<seg;i++){
      var sh = h/seg;
      FR8(x, y, z, cw, sh*1.02, cd, ry, col);
      y += sh;
      BOX(x, y-0.9, z, cw*0.90, 1.5, cd*0.90, ry, shade(col,-0.12));   // string course
      cw *= 0.87; cd *= 0.87;
    }
    if(opt.cap === 'dome' || (opt.cap===undefined && chance(0.22)))
      DOME(x, y, z, cw*0.56, cw*0.42, ry, pick(DOMEC), 'dome');
    else
      CONE(x, y, z, cw*0.60, cw*0.95, ry, roof);
    return;
  }
  if(kind === 'domed'){
    BOX(x, yb, z, w, h, d, ry, col);
    BOX(x, yb+h, z, w*1.06, 1.6, d*1.06, ry, shade(col,-0.10));
    var dr = Math.min(w,d)*0.42;
    CYL(x, yb+h+1.6, z, dr*1.10, Math.max(2.5,h*0.12), ry, shade(col,0.05));
    DOME(x, yb+h+1.6+Math.max(2.5,h*0.12), z, dr, dr*0.80, ry, pick(DOMEC), 'dome');
    return;
  }
  if(kind === 'hovel'){
    BOX(x, yb, z, w, h, d, ry, col, wallFam);
    if(chance(0.55)){
      var lw=w*rr(0.4,0.7), lh=h*rr(0.35,0.6);
      var o = loc(x,z, w*0.5+lw*0.5-0.6, 0, ry);
      BOX(o[0], yb, o[1], lw, lh, d*rr(0.5,0.85), ry, shade(col,-0.06), wallFam);
    }
    if(chance(0.4)) BOX(x, yb+h, z, w*1.04, 0.9, d*1.04, ry, shade(col,-0.14), wallFam);
    return;
  }
  /* hlaalu: stacked, stepping back, flat roofs with parapets */
  var lev = Math.max(1, Math.round(h/11));
  var y0 = yb, cw2 = w, cd2 = d;
  for(var L=0; L<lev; L++){
    var lh2 = h/lev;
    BOX(x, y0, z, cw2, lh2, cd2, ry, col, wallFam);
    BOX(x, y0+lh2-0.6, z, cw2*1.05, 1.4, cd2*1.05, ry, shade(col,-0.13), wallFam);  // cornice
    y0 += lh2;
    if(L < lev-1){
      /* step back, and jog the upper block off-centre */
      var jx = rr(-0.10,0.10)*cw2, jz = rr(-0.10,0.10)*cd2;
      var o2 = loc(x,z,jx,jz,ry);
      x = o2[0]; z = o2[1];
      cw2 *= rr(0.68,0.86); cd2 *= rr(0.68,0.86);
    }
  }
  BOX(x, y0, z, cw2*1.02, 1.1, cd2*1.02, ry, shade(col,-0.16), wallFam);            // parapet
  if(opt.cap === 'dome' || (opt.cap===undefined && chance(0.045))){
    var dr2 = Math.min(cw2,cd2)*0.36;
    DOME(x, y0+1.1, z, dr2, dr2*0.78, ry, pick(DOMEC), 'dome');
  }
  if(chance(0.30)) CYL(x+rr(-cw2*0.3,cw2*0.3), y0+1.1, z+rr(-cd2*0.3,cd2*0.3), rr(1.0,1.9), rr(3,7), 0, shade(col,-0.2));
}

function shade(hex, f){
  var c = new THREE.Color(hex);
  if(f>=0) c.lerp(new THREE.Color(0xffffff), f); else c.lerp(new THREE.Color(0x1a1712), -f);
  return c.getHex();
}
function loc(x,z,lx,lz,ry){
  return [ x + lx*Math.cos(ry) + lz*Math.sin(ry), z - lx*Math.sin(ry) + lz*Math.cos(ry) ];
}

