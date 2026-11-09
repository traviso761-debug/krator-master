/* ============================== 26. NIGHT GLOW ==============================
   PLANNER-OWNED. Bakes the light volume (45-kit.js) once every fragment has
   registered its lamps and windows, then owns the two things that visibly
   switch on at dusk:
     - halos: one additive Points cloud over every registered lamp
     - panes: one InstancedMesh of window panes, lit on a STAGGERED schedule
       (first lamps ~17:10, most lit by 21:00, going out from ~20:50 so that
       nearly all are dark by midnight; 1 in 20 burn till dawn)
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
/* the panes are glass (core/door KGLASS, the owner's "real glass", 2026-11-03), no longer an opaque plate that was a dark
   void by day (here a near-clear basic pane since 2026-10-05): a pane over a real opening (W[11]: 55-arch / 56-levels cut the
   wall) stands in the opening and the room shows through it; one on a solid body (the Crown's tiers, the council's drums, the
   gate carvings) stands before a room card. The same as Girder's (settlements/girder/src/81-glow.js). By night a lit window is
   the 'lit' glass at the page's night strength (warm, or cool for the silk houses and spider levels), the room still seen through it; an unlit
   one stays clear glass. Each pane is an instance of two sets, shown in the one its schedule wants (the other's instance
   folded to nothing). Draw calls: the glass, the lit glass (warm, cool) and the cards. */
var paneMesh = null, PANE_KEY = -1, PANE_LIT = 0, PANE = { glass:null, lit:[null,null], card:null, M:[], hid:null, n:0 };
(function(){
  var n=NL_WINDOWS.length; if(!n) return;
  var o=new THREE.Object3D(), geo=new THREE.PlaneGeometry(1,1), M=PANE.M, nCard=0;
  PANE.hid = new THREE.Matrix4().makeScale(0,0,0); PANE.n = n;
  for(var i=0;i<n;i++){ var W=NL_WINDOWS[i], d = W[11] ? -0.03 : 0.035;
    o.position.set(W[0]+W[3]*d, W[1], W[2]+W[4]*d); o.rotation.set(0, Math.atan2(W[3],W[4]), 0); o.scale.set(W[5],W[6],1); o.updateMatrix();
    M.push(o.matrix.clone()); if(!W[11]) nCard++; }
  function set(mat, name){ var m=new THREE.InstancedMesh(geo, mat, n); m.name=name; m.frustumCulled=false; m.userData.inspectLabel='Window'; m.userData.lodSkip=true; m.renderOrder=4; scene.add(m); return m; }
  PANE.glass = set(KGLASS.material(THREE,'clear'), 'window glass');
  /* the lit glass: KGLASS's 'lit' kind, brighter and denser than its default so a lit window still reads as lit across the town */
  [PAL.windowLit, PAL.glowCool].forEach(function(c, k){
    if(k && !NL_WINDOWS.some(function(W){ return W[10]; })) return;
    var m=KGLASS.material(THREE,'lit').clone(); m.color.set(c); m.emissive.set(c); m.emissiveIntensity=1.0; m.opacity=0.72; m.name='kglass:lit:mavs'+(k?':cool':'');
    PANE.lit[k] = set(m, 'window glass, lit'+(k?' (cool)':'')); });
  for(var i2=0;i2<n;i2++){ PANE.glass.setMatrixAt(i2, M[i2]); PANE.lit.forEach(function(m){ if(m) m.setMatrixAt(i2, PANE.hid); }); }
  if(nCard){   /* the room a pane on a solid body stands before: KGLASS's dim card, 2 cm behind the glass */
    var cm=new THREE.InstancedMesh(geo, KGLASS.material(THREE,'room'), nCard), c=0, q=new THREE.Matrix4();
    for(var i3=0;i3<n;i3++){ var W3=NL_WINDOWS[i3]; if(W3[11]) continue;
      o.position.set(W3[0]+W3[3]*0.015, W3[1], W3[2]+W3[4]*0.015); o.rotation.set(0, Math.atan2(W3[3],W3[4]), 0); o.scale.set(W3[5],W3[6],1); o.updateMatrix();
      cm.setMatrixAt(c++, o.matrix); }
    cm.name='window room cards'; cm.frustumCulled=false; cm.userData.lodSkip=true; cm.userData.inspectLabel='Window'; cm.receiveShadow=true; scene.add(cm); PANE.card=cm; }
  paneMesh = PANE.glass;
  window._panes = { panes:n, cut:NL_WINDOWS.filter(function(W){ return W[11]; }).length, cards:nCard };
})();
function updateGlow(dt, hour, nightK){
  haloMat.uniforms.uK.value = nightK; haloMat.uniforms.uTime.value += dt; haloMat.uniforms.uScale.value = innerHeight*0.5;
  haloPts.visible = nightK > 0.02;
  NLV_U.uNlNight.value = nightK;
  if(!PANE.glass) return;
  var key = Math.floor(hour*12);                       /* re-evaluate every 5 sky-minutes */
  if(key === PANE_KEY) return; PANE_KEY = key;
  var t=nwT(hour), lit=0;
  for(var i=0;i<NL_WINDOWS.length;i++){ var W=NL_WINDOWS[i], on=nwLit(t,W), k=W[10]?1:0;
    if(on) lit++;
    PANE.glass.setMatrixAt(i, on ? PANE.hid : PANE.M[i]);
    PANE.lit.forEach(function(m, j){ if(m) m.setMatrixAt(i, on && j===k ? PANE.M[i] : PANE.hid); }); }
  PANE.glass.instanceMatrix.needsUpdate = true; PANE.lit.forEach(function(m){ if(m) m.instanceMatrix.needsUpdate = true; });
  PANE_LIT = lit;
  NLV_U.uNlWin.value = NL_WINDOWS.length ? lit/NL_WINDOWS.length : 0;
}
window._glow = { stats:glowStats, litNow:function(){ return PANE_LIT; }, litAt:function(h){ var t=nwT(h),c=0; NL_WINDOWS.forEach(function(W){ if(nwLit(t,W)) c++; }); return c; } };
