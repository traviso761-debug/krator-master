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
var paneMesh = null, _pnCol = new THREE.Color(), _pnLit = new THREE.Color(PAL.windowLit), _pnLitC = new THREE.Color(PAL.glowCool),
    _pnDark = new THREE.Color(PAL.windowDark), PANE_KEY = -1, PANE_LIT = 0, PANE_SETS = [];
/* two sets: GLASS over a real opening (W[11]: the wall behind is cut, 55-arch / 56-levels), where a dark pane is nearly
   clear so the room shows through by day and a lit one glows, its alpha rising with its colour; and the old opaque
   pane over a window drawn on a whole wall (the council chamber, the Crown's tiers, the gate carvings) */
(function(){
  var n=NL_WINDOWS.length; if(!n) return;
  var glass = new THREE.MeshBasicMaterial({ color:0xffffff, side:THREE.DoubleSide, transparent:true, depthWrite:false });
  glass.onBeforeCompile = function(sh){ sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>',
    '#include <color_fragment>\n  diffuseColor.a = 0.12 + 0.70*max(max(diffuseColor.r, diffuseColor.g), diffuseColor.b);'); };
  glass.customProgramCacheKey = function(){ return 'pane-glass'; };
  var solid = new THREE.MeshBasicMaterial({ color:0xffffff, side:THREE.DoubleSide });
  [[1, glass], [0, solid]].forEach(function(k){
    var idx=[]; NL_WINDOWS.forEach(function(W,i){ if((W[11]?1:0)===k[0]) idx.push(i); }); if(!idx.length) return;
    var m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1), k[1], idx.length), o=new THREE.Object3D();
    idx.forEach(function(wi,i){ var W=NL_WINDOWS[wi];
      o.position.set(W[0]+W[3]*0.07, W[1], W[2]+W[4]*0.07); o.rotation.set(0, Math.atan2(W[3],W[4]), 0); o.scale.set(W[5],W[6],1); o.updateMatrix();
      m.setMatrixAt(i,o.matrix); m.setColorAt(i,_pnDark); });
    m.frustumCulled=false; m.userData.inspectLabel='Window'; if(k[0]) m.renderOrder=4; scene.add(m);
    PANE_SETS.push({ mesh:m, idx:idx });
  });
  paneMesh = PANE_SETS[0] ? PANE_SETS[0].mesh : null;
})();
function updateGlow(dt, hour, nightK){
  haloMat.uniforms.uK.value = nightK; haloMat.uniforms.uTime.value += dt; haloMat.uniforms.uScale.value = innerHeight*0.5;
  haloPts.visible = nightK > 0.02;
  NLV_U.uNlNight.value = nightK;
  if(!PANE_SETS.length) return;
  var key = Math.floor(hour*12);                       /* re-evaluate every 5 sky-minutes */
  if(key === PANE_KEY) return; PANE_KEY = key;
  var t=nwT(hour), lit=0;
  PANE_SETS.forEach(function(S){
    S.idx.forEach(function(wi,i){ var W=NL_WINDOWS[wi], on=nwLit(t,W);
      if(on) lit++; S.mesh.setColorAt(i, on ? (W[10]?_pnLitC:_pnLit) : _pnDark); });
    S.mesh.instanceColor.needsUpdate = true; });
  PANE_LIT = lit;
  NLV_U.uNlWin.value = NL_WINDOWS.length ? lit/NL_WINDOWS.length : 0;
}
window._glow = { stats:glowStats, litNow:function(){ return PANE_LIT; }, litAt:function(h){ var t=nwT(h),c=0; NL_WINDOWS.forEach(function(W){ if(nwLit(t,W)) c++; }); return c; } };
