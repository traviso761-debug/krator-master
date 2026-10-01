/* ============================== 21. FINISH THE GROUND ============================== */
(function(){
  gx.globalAlpha = 0.30;
  gx.fillStyle = '#9e9179';
  PLACED.forEach(function(o){
    if(o.tag==='fixed' || !inCity(o.x,o.z)) return;
    gx.beginPath(); gx.arc(W2P(o.x,TEX), W2P(o.z,TEX), (o.rad+3)*(TEX/CE2), 0, Math.PI*2); gx.fill();
  });
  gx.globalAlpha = 1;
  gx.fillStyle = 'rgba(92,106,58,0.55)';
  COMPOUNDS.forEach(function(c){
    if(!inCity(c.x,c.z)) return;
    gx.beginPath(); gx.arc(W2P(c.x,TEX), W2P(c.z,TEX), Math.max(c.fx,c.fz)*(TEX/CE2), 0, Math.PI*2); gx.fill();
  });
})();

/* ============================== 22. EMIT THE CITY ============================== */
var EMIT = emitBuckets();
window._stats = { instances:EMIT.instances, meshes:EMIT.meshes };

/* ============================== 23. TERRAIN MESH ==============================
   One mesh reaches the horizon. The grid is warped so cells are a few metres
   across in the city and tens of metres at the map edge — seamless, where a
   coarse outer ring would crack along the join. */

var cityTex = new THREE.CanvasTexture(gcv);
cityTex.encoding = THREE.sRGBEncoding;
cityTex.wrapS = cityTex.wrapT = THREE.ClampToEdgeWrapping;
cityTex.anisotropy = FAST ? 1 : 8;

var SEG = FAST ? 300 : 400;
function warp(u){ var a = 0.17; return HW * (a*u + (1-a)*u*u*u); }

var terrGeo = new THREE.PlaneGeometry(2, 2, SEG, SEG).rotateX(-Math.PI/2);
(function(){
  var p = terrGeo.attributes.position, a = p.array;
  var col = new Float32Array(p.count*3);
  for(var i=0;i<p.count;i++){
    var x = warp(a[i*3])*1.26, z = warp(a[i*3+2])*1.26;
    a[i*3] = x; a[i*3+2] = z;
    a[i*3+1] = terrainH(x,z);
    var c = groundTone(x,z);
    col[i*3]   = Math.pow(c[0]/255, 2.2);       /* linear, to match sRGB output */
    col[i*3+1] = Math.pow(c[1]/255, 2.2);
    col[i*3+2] = Math.pow(c[2]/255, 2.2);
  }
  terrGeo.setAttribute('color', new THREE.BufferAttribute(col,3));
  terrGeo.computeVertexNormals();
  terrGeo.computeBoundingSphere();
})();

var terrMat = new THREE.MeshLambertMaterial({ vertexColors:true });
terrMat.onBeforeCompile = function(sh){
  sh.uniforms.uCity = { value: cityTex };
  sh.uniforms.uExt  = { value: CITY_EXT };
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix*vec4(position,1.0)).xyz;');
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>',
      '#include <common>\nvarying vec3 vWP;\nuniform sampler2D uCity;\nuniform float uExt;')
    .replace('#include <map_fragment>', [
      'vec2 cuv = vec2(vWP.x/(2.0*uExt) + 0.5, 0.5 - vWP.z/(2.0*uExt));',
      /* a wide, soft roll-off — the old 0.035 margin (~170 units) made the
         canvas/vertex-colour handoff read as a hard ring at CITY_EXT; this
         one spends ~700 units fading it, and there is nothing built that
         far out for the softer ground colour to visibly disturb */
      'float inb = smoothstep(0.0,0.07,cuv.x)*smoothstep(1.0,0.93,cuv.x)',
      '          * smoothstep(0.0,0.07,cuv.y)*smoothstep(1.0,0.93,cuv.y);',
      'if(inb > 0.001){',
      '  vec3 ct = texture2D(uCity, clamp(cuv,0.001,0.999)).rgb;',
      /* match the vertex path's exact sRGB->linear decode (pow 2.2) — the
         old ct*ct (pow 2.0) made the canvas side systematically brighter
         than the vertex-coloured ground it hands off to, on top of the hard
         ring above; together they read as a washed-out, grey seam */
      '  diffuseColor.rgb = mix(diffuseColor.rgb, pow(ct, vec3(2.2)), inb);',
      '}'
    ].join('\n'));
  /* the lantern/brazier/window light pools (45-kit.js) land on the GROUND
     as much as on the walls — that is most of what reads as "a light
     illuminating its surroundings" — so the terrain gets the same
     injection every static bucket gets. It already carries a world-position
     varying (vWP, just above), so it hands that over rather than paying for
     a second one. Must run last: it replaces '#include <common>' itself. */
  applyNightGlow(sh, 'vWP');
};
var terrain = new THREE.Mesh(terrGeo, terrMat);
terrain.receiveShadow = !FAST;
terrain.frustumCulled = false;
scene.add(terrain);

/* ============================== 24. WATER ============================== */

var watGeo = new THREE.PlaneGeometry(2, 2, FAST?190:250, FAST?190:250).rotateX(-Math.PI/2);
(function(){
  var p = watGeo.attributes.position, a = p.array;
  var dep = new Float32Array(p.count);
  for(var i=0;i<p.count;i++){
    var x = warp(a[i*3])*1.20, z = warp(a[i*3+2])*1.20;
    a[i*3] = x; a[i*3+2] = z;
    dep[i] = Math.max(0, -terrainH(x,z));
  }
  watGeo.setAttribute('aDepth', new THREE.BufferAttribute(dep,1));
  watGeo.computeBoundingSphere();
})();

var waterUni = {
  uTime:   { value:0 },
  uSun:    { value:SUNDIR.clone() },
  uShallow:{ value:new THREE.Color(0x6d9c92) },
  uDeep:   { value:new THREE.Color(0x1d3c48) },
  uSky:    { value:new THREE.Color(0xc6c8c2) },
  uFogCol: { value:HAZE.clone() },
  uFogDen: { value:scene.fog.density },
  uCam:    { value:new THREE.Vector3() }
};

var waterMat = new THREE.ShaderMaterial({
  uniforms: waterUni,
  transparent: true,
  side: THREE.FrontSide,
  vertexShader: [
    'attribute float aDepth;',
    'uniform float uTime;',
    'varying vec3 vW; varying float vD; varying vec2 vP;',
    'float wv(vec2 p, vec2 d, float f, float s, float t){ return sin(dot(p,d)*f + t*s); }',
    'void main(){',
    '  vec3 pos = position;',
    '  vP = pos.xz; vD = aDepth;',
    '  float att = clamp(aDepth/7.0, 0.0, 1.0);',
    '  float t = uTime, h = 0.0;',
    '  h += 0.62*wv(pos.xz, normalize(vec2( 0.92, 0.39)), 0.0148, 1.35, t);',
    '  h += 0.44*wv(pos.xz, normalize(vec2(-0.36, 0.93)), 0.0221, 1.71, t);',
    '  h += 0.26*wv(pos.xz, normalize(vec2( 0.62,-0.78)), 0.0403, 2.30, t);',
    '  pos.y += h*att;',
    '  vec4 wp = modelMatrix * vec4(pos,1.0);',
    '  vW = wp.xyz;',
    '  gl_Position = projectionMatrix * viewMatrix * wp;',
    '}'
  ].join('\n'),
  fragmentShader: [
    'precision highp float;',
    'uniform float uTime, uFogDen;',
    'uniform vec3 uSun, uShallow, uDeep, uSky, uFogCol, uCam;',
    'varying vec3 vW; varying float vD; varying vec2 vP;',
    'vec2 wgrad(vec2 p, float t, float lod){',
    '  vec2 g = vec2(0.0);',
    '  vec2 d1=normalize(vec2( 0.92, 0.39)); g += 0.62*0.0148*cos(dot(p,d1)*0.0148 + t*1.35)*d1;',
    '  vec2 d2=normalize(vec2(-0.36, 0.93)); g += 0.44*0.0221*cos(dot(p,d2)*0.0221 + t*1.71)*d2;',
    '  vec2 d3=normalize(vec2( 0.62,-0.78)); g += 0.26*0.0403*cos(dot(p,d3)*0.0403 + t*2.30)*d3;',
    '  vec2 d4=normalize(vec2( 0.15, 0.99)); g += lod*0.11*0.1310*cos(dot(p,d4)*0.1310 + t*3.90)*d4;',
    '  vec2 d5=normalize(vec2(-0.87, 0.49)); g += lod*0.09*0.1870*cos(dot(p,d5)*0.1870 + t*4.70)*d5;',
    '  return g;',
    '}',
    'void main(){',
    '  float att = clamp(vD/7.0, 0.0, 1.0);',
    '  float vdist = length(uCam - vW);',
    '  float lod = 1.0 - smoothstep(260.0, 1500.0, vdist);',
    '  vec2 g = wgrad(vP, uTime, lod) * (12.0*att + 1.0) * mix(0.35, 1.0, lod);',
    '  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));',
    '  vec3 V = normalize(uCam - vW);',
    '  float fres = pow(1.0 - clamp(dot(N,V),0.0,1.0), 3.4);',
    '  float deepT = smoothstep(0.8, 20.0, vD);',
    '  vec3 body = mix(uShallow, uDeep, deepT);',
    '  float diff = clamp(dot(N, uSun), 0.0, 1.0);',
    '  body *= 0.66 + 0.44*diff;',
    '  vec3 H = normalize(uSun + V);',
    '  float spec = pow(clamp(dot(N,H),0.0,1.0), 190.0) * 1.5 * lod;',
    '  float glit = pow(clamp(dot(N,H),0.0,1.0), 34.0) * 0.10;',
    '  vec3 col = mix(body, uSky, clamp(fres*0.86,0.0,0.82));',
    '  col += vec3(1.0,0.95,0.84) * (spec + glit);',
    '  float foam = smoothstep(1.7, 0.15, vD) * (0.5 + 0.5*lod*sin(vP.x*0.18 + vP.y*0.13 + uTime*1.6));',
    '  col = mix(col, vec3(0.90,0.89,0.85), clamp(foam,0.0,0.58));',
    '  float alpha = mix(0.72, 0.96, deepT);',
    '  alpha = mix(alpha, 0.99, clamp(fres,0.0,1.0));',
    '  float fd = vdist * uFogDen;',
    '  float fog = 1.0 - exp(-fd*fd);',
    '  col = mix(col, uFogCol, clamp(fog,0.0,1.0));',
    '  gl_FragColor = vec4(col, mix(alpha, 1.0, clamp(fog,0.0,1.0)));',
    '}'
  ].join('\n')
});

var water = new THREE.Mesh(watGeo, waterMat);
water.position.y = SEA;
water.renderOrder = 2;
water.frustumCulled = false;
scene.add(water);

