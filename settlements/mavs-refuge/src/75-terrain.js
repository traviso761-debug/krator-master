/* ============================== 20. EMIT + GROUND + RIVER ==============================
   PLANNER-OWNED. Emits every bucket, then builds the forest floor and the
   river. Nothing generative may push into the kit after this fragment.    */
reseed(750001);

var EMIT = emitBuckets(), EMITM = emitMerged();
KIT_EMITTED = true;   /* bake-order guard: any later push is reported on the error panel instead of silently vanishing */
window._stats = { instances:EMIT.instances, instMeshes:EMIT.meshes, mergedTris:EMITM.tris, mergedMeshes:EMITM.meshes };

/* ---- forest-floor colour: dark litter under closed canopy, red soil where
        bare (banks, clearings, root mounds), moss in the damp ---- */
function groundTone(x,z){
  var h = terrainH(x,z), rd = riverDist(x,z);
  var n = fbm(x*0.012+4, z*0.012-9), n2 = vn(x*0.11, z*0.11);
  var lit = new THREE.Color(PAL.litter[n2<0.33?0:n2<0.66?1:2]);
  var soil = new THREE.Color(PAL.soil[n2<0.5?0:2]), moss = new THREE.Color(PAL.moss[n2<0.5?0:1]);
  var c = lit.clone();
  c.lerp(moss, clamp(smooth(0.42,0.70,n)*0.8 + smooth(60,8,rd)*0.5, 0, 0.9));
  c.lerp(soil, clamp(smooth(0.60,0.30,n)*0.55 + smooth(14,0,rd)*0.8, 0, 0.9));
  if(rd < 0){ var d=clamp(-rd/18,0,1); c.lerp(new THREE.Color(0x4a4636), 0.6+0.3*d); }
  c.multiplyScalar(0.80 + 0.35*n2);
  return c;
}

var SEG = FAST ? 260 : 360;
function warp(u){ var a = 0.30; return HW * (a*u + (1-a)*u*u*u); }
var terrGeo = new THREE.PlaneGeometry(2, 2, SEG, SEG).rotateX(-Math.PI/2);
(function(){
  var p = terrGeo.attributes.position, a = p.array, col = new Float32Array(p.count*3), uv = terrGeo.attributes.uv.array;
  for(var i=0;i<p.count;i++){
    var x = warp(a[i*3])*1.12, z = warp(a[i*3+2])*1.12;
    a[i*3]=x; a[i*3+2]=z; a[i*3+1]=terrainH(x,z);
    var c = groundTone(x,z).convertSRGBToLinear();
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
    uv[i*2]=x/9; uv[i*2+1]=z/9;
  }
  terrGeo.setAttribute('color', new THREE.BufferAttribute(col,3));
  terrGeo.computeVertexNormals(); terrGeo.computeBoundingSphere();
})();
/* a litter detail texture, tiled in world units and multiplied over the vertex colour */
var terrTex = (function(){
  var S=256, a=texNoise(S,10,301), b=texNoise(S,48,302), c=texNoise(S,110,303);
  return texFinish(texFill(S,function(x,y){ return 0.62 + 0.30*(a(x,y)-0.5) + 0.34*(b(x,y)-0.5) + 0.28*(c(x,y)-0.5) + (c(x,y)>0.80?0.12:0); }));
})();
var terrMat = nlMaterial(new THREE.MeshLambertMaterial({ vertexColors:true, map:terrTex }), 'terrain');
var terrain = new THREE.Mesh(terrGeo, terrMat);
terrain.receiveShadow = !FAST; terrain.frustumCulled = false; terrain.userData.inspectLabel = 'Forest floor';
scene.add(terrain);

/* ---- the river: a ribbon that follows the channel and steps down the cataracts ---- */
var waterUni = {
  uTime:{value:0}, uSun:{value:new THREE.Vector3(0.4,0.8,-0.4)}, uCam:{value:new THREE.Vector3()},
  uShallow:{value:new THREE.Color(PAL.riverShallow)}, uDeep:{value:new THREE.Color(PAL.riverDeep)},
  uSky:{value:new THREE.Color(0xa8c0b0)}, uFoam:{value:new THREE.Color(PAL.foam)},
  uFogCol:{value:new THREE.Color(PAL.haze)}, uFogDen:{value:PAL.fogDensity}, uDay:{value:1}
};
var water = (function(){
  var step = 9, across = 10, pos=[], aux=[], idx=[];
  var ns = Math.floor(RIVER_LEN/step);
  for(var i=0;i<=ns;i++){
    var s=i*step, R=riverAt(s), half=riverHalfAt(s)+7, y=riverLevel(s), ck=cataractK(s);
    for(var j=0;j<=across;j++){
      var v=j/across*2-1;
      pos.push(R.x - R.tz*half*v, y, R.z + R.tx*half*v);
      aux.push(s, v, ck);
    }
  }
  for(var i2=0;i2<ns;i2++) for(var j2=0;j2<across;j2++){
    var a=i2*(across+1)+j2, b=a+1, c=a+across+1, d=c+1;
    idx.push(a,c,b, b,c,d);
  }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('aAux', new THREE.Float32BufferAttribute(aux,3));
  g.setIndex(idx); g.computeBoundingSphere();
  var mat = new THREE.ShaderMaterial({ uniforms:waterUni, transparent:true, side:THREE.DoubleSide,
    vertexShader:[
      'attribute vec3 aAux; uniform float uTime; varying vec3 vW; varying vec3 vAux;',
      'void main(){ vec3 p=position; vAux=aAux;',
      '  p.y += 0.10*sin(aAux.x*0.21 - uTime*2.2 + aAux.y*3.0) + aAux.z*0.35*sin(aAux.x*0.9 - uTime*7.0 + aAux.y*9.0);',
      '  vec4 wp=modelMatrix*vec4(p,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }'].join('\n'),
    fragmentShader:[
      'precision highp float;',
      'uniform float uTime,uFogDen,uDay; uniform vec3 uSun,uCam,uShallow,uDeep,uSky,uFoam,uFogCol;',
      'varying vec3 vW; varying vec3 vAux;',
      'float hsh(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }',
      'float nz(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);',
      '  return mix(mix(hsh(i),hsh(i+vec2(1,0)),f.x), mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),f.x), f.y); }',
      'void main(){',
      '  float s=vAux.x, v=vAux.y, ck=vAux.z, edge=abs(v);',
      '  float flow = uTime*(1.6+6.0*ck);',
      '  vec2 q = vec2(s*0.10 - flow*0.10, v*3.0);',
      '  float r1 = nz(q*vec2(1.0,2.2)), r2 = nz(q*vec2(2.7,5.0)+3.1);',
      '  vec3 N = normalize(vec3((r1-0.5)*0.55, 1.0, (r2-0.5)*0.55));',
      '  vec3 V = normalize(uCam - vW);',
      '  float fres = pow(1.0-clamp(dot(N,V),0.0,1.0), 3.0);',
      '  vec3 body = mix(uShallow, uDeep, smoothstep(1.0,0.25,edge));',
      '  vec3 col = mix(body*(0.35+0.65*uDay), uSky, clamp(fres*0.8,0.0,0.75));',
      '  vec3 H = normalize(uSun+V); col += vec3(1.0,0.95,0.85)*pow(clamp(dot(N,H),0.0,1.0),90.0)*0.8*uDay;',
      '  float foam = ck*smoothstep(0.35,0.75, nz(vec2(s*0.35 - flow*0.5, v*7.0)) + 0.35*r2)',
      '             + smoothstep(0.80,0.98,edge)*0.35*nz(vec2(s*0.6 - flow*0.2, v*5.0));',
      '  col = mix(col, uFoam*(0.4+0.6*uDay), clamp(foam,0.0,0.9));',
      '  float alpha = mix(0.80, 0.97, smoothstep(1.0,0.4,edge)); alpha = max(alpha, clamp(foam,0.0,1.0));',
      '  alpha *= smoothstep(1.0,0.90,edge);',
      '  float fd = length(uCam-vW)*uFogDen, fog = 1.0-exp(-fd*fd);',
      '  gl_FragColor = vec4(mix(col,uFogCol,clamp(fog,0.0,1.0)), alpha);',
      '}'].join('\n') });
  var m = new THREE.Mesh(g, mat); m.renderOrder=2; m.frustumCulled=false; m.userData.inspectLabel='River';
  scene.add(m); return m;
})();
