/* ============================== 26. NIGHT GLOW ==============================
   PLANNER-OWNED. Bakes the light volume (45-kit.js) once every fragment has
   registered its lamps and windows, then owns the two things that visibly
   switch on at dusk:
     - halos: one additive Points cloud over every registered lamp
     - panes: real glass (core/door's KGLASS; the owner, 2026-11-03): every window a
       clear pane over the room card (53-assets.js ROOMC), and in front of it a lit
       pane on a STAGGERED schedule (first lamps ~17:10, most lit by 21:00, going out
       from ~20:50 so that nearly all are dark by midnight; 1 in 20 burn till dawn)
   Reads DAYNIGHT_NIGHT_K (0 day .. 1 night) from the day/night fragment.   */
var glowStats = nlvBake();

var haloTex = (function(){
  var S=64, c=document.createElement('canvas'); c.width=c.height=S; var g=c.getContext('2d');
  var gr=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.18,'rgba(255,255,255,0.55)');
  gr.addColorStop(0.5,'rgba(255,255,255,0.13)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr; g.fillRect(0,0,S,S); return new THREE.CanvasTexture(c);
})();
var haloMat = new THREE.ShaderMaterial({
  uniforms:{ uTex:{value:haloTex}, uK:{value:0}, uTime:{value:0}, uScale:{value:innerHeight*0.5} },
  transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
  vertexShader:[
    'attribute vec3 aCol; attribute float aSize; uniform float uK,uTime,uScale; varying vec3 vCol; varying float vA;',
    'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0);',
    '  float ph=fract(sin(dot(position.xz,vec2(12.9898,78.233)))*43758.5453)*6.2832;',
    '  float fl=0.86+0.14*sin(uTime*7.0+ph)*sin(uTime*3.1+ph*1.7);',
    '  float d=-mv.z; vCol=aCol; vA=uK*fl*exp(-d*0.00035);',
    '  gl_PointSize=clamp(aSize*fl*uScale/d, 2.0, 180.0); gl_Position=projectionMatrix*mv; }'].join('\n'),
  fragmentShader:[
    'uniform sampler2D uTex; varying vec3 vCol; varying float vA;',
    'void main(){ float a=texture2D(uTex,gl_PointCoord).r*vA; if(a<0.004) discard; gl_FragColor=vec4(vCol*a,a); }'].join('\n')
});
var haloPts = (function(){
  var n=NL_LAMPS.length, pos=new Float32Array(n*3), col=new Float32Array(n*3), size=new Float32Array(n);
  var cw=new THREE.Color(PAL.glowWarm), cc=new THREE.Color(PAL.glowCool);
  for(var i=0;i<n;i++){ var L=NL_LAMPS[i], c=L[5]?cc:cw;
    pos[i*3]=L[0]; pos[i*3+1]=L[1]; pos[i*3+2]=L[2]; col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; size[i]=2.2+1.8*L[3]; }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('aCol',new THREE.BufferAttribute(col,3));
  g.setAttribute('aSize',new THREE.BufferAttribute(size,1));
  var p=new THREE.Points(g,haloMat); p.frustumCulled=false; p.renderOrder=5; p.visible=false; scene.add(p); return p;
})();

/* ---- window panes ---- */
var NWIN_ON0 = 17.15, NWIN_ONS = 3.9, NWIN_OFF0 = 20.8, NWIN_OFFS = 4.2, NWIN_OFFP = 1.6, NWIN_DAWN = 30.0;
function nwT(hour){ return hour >= 12 ? hour : hour + 24; }
function nwLit(t, W){ var on = NWIN_ON0 + NWIN_ONS*W[7], off = NWIN_OFF0 + NWIN_OFFS*Math.pow(W[8], NWIN_OFFP);
  return t >= on && (t < off || (W[9] && t < NWIN_DAWN)); }
/* the glass: one shared material per kind (KGLASS.material), a plain see-through pane where a bundle has no core/door.
   paneMesh: every window's clear pane, then the glass a builder laid itself (53-assets.js YOPEN.glass: F.paneBox, F.pane) of
   that kind; a builder's other kinds get a mesh each. litMesh / litCool: the warm and the electric windows' lit panes, a
   hair in front of the clear one, each window's instance shrunk to nothing while it is dark. */
function pnGlassMat(kind, opt){
  if(typeof KGLASS !== 'undefined') return KGLASS.material(THREE, kind, opt);
  var m = new THREE.MeshBasicMaterial({ color:kind==='lit' ? PAL.windowLit : 0xa9bfc4, transparent:true, opacity:kind==='lit' ? 0.5 : 0.25, depthWrite:false, side:THREE.DoubleSide });
  m.name = 'glass:'+kind; return m; }
var paneMesh = null, litMesh = null, litCool = null, glassMeshes = [], PANE_KEY = -1, PANE_LIT = 0,
    _pnO = new THREE.Object3D(), _pnM = new THREE.Matrix4(), _pnZero = new THREE.Matrix4().makeScale(0,0,0), PANE_GEO = new THREE.PlaneGeometry(1,1);
function pnMatrix(W, off){ _pnO.position.set(W[0]+W[3]*off, W[1], W[2]+W[4]*off); _pnO.rotation.set(0, Math.atan2(W[3],W[4]), 0); _pnO.scale.set(W[5],W[6],1); _pnO.updateMatrix(); return _pnO.matrix; }
function pnMesh(mat, n, name){ var m = new THREE.InstancedMesh(PANE_GEO, mat, Math.max(1,n)); m.count = n; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false;
  m.userData.inspectLabel = 'Window'; m.userData.glass = true; m.name = name; scene.add(m); return m; }
(function(){
  var n = NL_WINDOWS.length, G = (typeof YOPEN !== 'undefined') ? YOPEN.glass : [], byKind = {}, k, i;
  G.forEach(function(g){ var key = g[7] + (g[8]==null ? '' : ':'+g[8]); (byKind[key] || (byKind[key] = [])).push(g); });
  var clear = byKind.clear || []; delete byKind.clear;
  if(n + clear.length){
    paneMesh = pnMesh(pnGlassMat('clear'), n + clear.length, 'window glass');
    for(i=0;i<n;i++) paneMesh.setMatrixAt(i, pnMatrix(NL_WINDOWS[i], 0.07));
    for(i=0;i<clear.length;i++) paneMesh.setMatrixAt(n+i, pnMatrix(clear[i], 0));
    paneMesh.instanceMatrix.needsUpdate = true; }
  for(k in byKind){ var L = byKind[k], g0 = L[0], M = pnMesh(pnGlassMat(g0[7], g0[8]==null ? undefined : { color:g0[8] }), L.length, 'glass '+k);
    L.forEach(function(g, j){ M.setMatrixAt(j, pnMatrix(g, 0)); }); M.instanceMatrix.needsUpdate = true; glassMeshes.push(M); }
  var cool = NL_WINDOWS.filter(function(W){ return W[10]; }).length;
  if(n - cool) litMesh = pnMesh(pnGlassMat('lit'), n, 'lit windows');
  if(cool) litCool = pnMesh(pnGlassMat('lit', { color:PAL.glowCool, emissive:PAL.glowCool }), n, 'lit windows (electric)');
  for(i=0;i<n;i++){ if(litMesh) litMesh.setMatrixAt(i, _pnZero); if(litCool) litCool.setMatrixAt(i, _pnZero); }
})();
function updateGlow(dt, hour, nightK){
  haloMat.uniforms.uK.value = nightK; haloMat.uniforms.uTime.value += dt; haloMat.uniforms.uScale.value = innerHeight*0.5;
  haloPts.visible = nightK > 0.02;
  NLV_U.uNlNight.value = nightK;
  if(!litMesh && !litCool) return;
  var key = Math.floor(hour*12);                       /* re-evaluate every 5 sky-minutes */
  if(key === PANE_KEY) return; PANE_KEY = key;
  var t=nwT(hour), lit=0;
  for(var i=0;i<NL_WINDOWS.length;i++){ var W=NL_WINDOWS[i], on=nwLit(t,W), M=W[10] ? litCool : litMesh;
    if(on) lit++; if(M) M.setMatrixAt(i, on ? pnMatrix(W, 0.08) : _pnZero); }
  if(litMesh) litMesh.instanceMatrix.needsUpdate = true; if(litCool) litCool.instanceMatrix.needsUpdate = true; PANE_LIT = lit;
  NLV_U.uNlWin.value = NL_WINDOWS.length ? lit/NL_WINDOWS.length : 0;
}
window._glow = { stats:glowStats, litNow:function(){ return PANE_LIT; }, litAt:function(h){ var t=nwT(h),c=0; NL_WINDOWS.forEach(function(W){ if(nwLit(t,W)) c++; }); return c; } };
