// ---------------------------------------------------------------- materials
const DS=THREE.DoubleSide;
const MAT={
 // metalness/roughness come from the packed map (G=rough, B=metal); the scalars
 // are 1 so the map is not scaled down. See rmTex in 20-textures.js.
 white:new THREE.MeshStandardMaterial({map:TEX.panel,roughnessMap:TEX.panelRM,metalnessMap:TEX.panelRM,color:0xffffff,metalness:1,roughness:1,side:DS}),
 rust:new THREE.MeshStandardMaterial({map:TEX.rust,roughnessMap:TEX.rustRM,metalnessMap:TEX.rustRM,color:0xffffff,metalness:1,roughness:1,side:DS}),
 verdigris:new THREE.MeshStandardMaterial({map:TEX.verdigris,roughnessMap:TEX.verdigrisRM,metalnessMap:TEX.verdigrisRM,color:0xffffff,metalness:1,roughness:1,side:DS}),
 glass:new THREE.MeshStandardMaterial({color:0x3f9fe6,transparent:true,opacity:.48,metalness:.2,roughness:.08,emissive:0x0b2c4e,emissiveIntensity:.6,side:DS,depthWrite:false}),
 winIntact:new THREE.MeshStandardMaterial({color:0x143a5c,metalness:.6,roughness:.15,emissive:0x0a2238,emissiveIntensity:.8}),
 winDead:new THREE.MeshStandardMaterial({color:0x07090c,roughness:1}),
 dark:new THREE.MeshStandardMaterial({color:0x1a1d22,roughness:.95,side:DS}),
 guts:new THREE.MeshStandardMaterial({color:0x2a2622,roughness:.9,metalness:.4,side:DS}),
 pipe:new THREE.MeshStandardMaterial({color:0x7a4a2a,roughness:.55,metalness:.7}),
 pipeRust:new THREE.MeshStandardMaterial({color:0x4e3324,roughness:.9,metalness:.3}),
 strip:new THREE.MeshBasicMaterial({color:0xffffff}),
 dot:new THREE.MeshBasicMaterial({color:0xffffff}),
 moss:new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),
 vine:new THREE.MeshStandardMaterial({color:0x2c4a22,roughness:1}),
 rubble:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95}),
 fig:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),
 ground:new THREE.MeshStandardMaterial({map:TEX.ground,roughness:1}),
 slab:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),
 stain:new THREE.MeshBasicMaterial({map:TEX.stain,transparent:true,blending:THREE.MultiplyBlending,depthWrite:false,side:DS}),
};
// GLASS FRESNEL. Real glass turns reflective and pale at grazing angles; a flat
// transparent colour reads as blue plastic, which is what these curtain walls
// were doing. Injected into the stock standard-material shader rather than
// replacing it, so lights, fog and tone mapping all still apply.
//
// r128 has no <output_fragment> chunk — that arrived later — so the anchor is
// the literal final assignment. Verified against the pinned three.min.js.
//
// The cube is written out rather than pow(): a negative base in pow() yields NaN,
// and SwiftShader silently swallows it, so it would look perfect in verify.py
// and blow up on a real GPU. Everything feeding it is clamped anyway.
MAT.glass.onBeforeCompile=sh=>{
 sh.fragmentShader=sh.fragmentShader.replace(
  'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
  ['float _fr = 1.0 - clamp( abs( dot( normalize( normal ), normalize( vViewPosition ) ) ), 0.0, 1.0 );',
   '_fr = clamp( _fr, 0.0, 1.0 );',
   '_fr = _fr * _fr * _fr;',
   'vec3 _lit = outgoingLight + vec3( 0.30, 0.44, 0.58 ) * _fr * 0.85;',
   'gl_FragColor = vec4( _lit, clamp( diffuseColor.a + _fr * 0.42, 0.0, 1.0 ) );'].join('\n'));};
const SHELL=d=>d>0?MAT.rust:MAT.white;      // exterior skin by decay
const WIN=d=>d>0?MAT.winDead:MAT.winIntact;
const CYAN=new THREE.Color(0x7ff4ff), WARM=new THREE.Color(0xffd28a), DEAD=new THREE.Color(0x0a0c0e);

