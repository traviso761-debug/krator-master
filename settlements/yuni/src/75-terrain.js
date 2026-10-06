/* ============================== 20. EMIT + GROUND + RIVER ==============================
   PLANNER-OWNED. Emits every kit bucket, then builds the valley floor (one
   mesh: 6 m cells under the town, growing toward the mountains), drapes the
   painted ground canvas over it, and adds the river and the highway ribbons.
   Nothing generative may push into the kit after this fragment.            */
reseed(750001);

/* late finishers (e.g. the Ancients port merges its meshes here) run before the kit is drained */
(window.YUNI_FINISHERS||[]).forEach(function(fn){ try{ fn(); }catch(e){ ERR('finisher: '+(e&&e.stack||e)); } });
var EMIT = emitBuckets(), EMITM = emitMerged();
KIT_EMITTED = true;
window._stats = { instances:EMIT.instances, instMeshes:EMIT.meshes, mergedTris:EMITM.tris, mergedMeshes:EMITM.meshes };

/* grid lines: uniform under the town, geometric beyond */
var TERR_LINES = (function(){
  if(SHEET){ var o=[], EX=CITY_EXT+120, ST=CATALOG?6:40; for(var s=-EX;s<=EX;s+=ST) o.push(s); return o; }
  var half=[0], c=6, x=0;
  while(x < 820){ x+=c; half.push(x); }                 /* the town: 6 m cells */
  c=9; while(x < 1520){ x+=c; half.push(x); }           /* the farm belt, the canal and the river: 9 m */
  while(x < HW*1.08){ c*=1.12; x+=c; half.push(x); }    /* the valley and the mountains: geometric */
  var out=[]; for(var i=half.length-1;i>0;i--) out.push(-half[i]); return out.concat(half);
})();
var TERR_N = TERR_LINES.length, TERR_H = new Float32Array(TERR_N*TERR_N);
function terrLineIdx(v){ var lo=0, hi=TERR_N-1; if(v<=TERR_LINES[0]) return 0; if(v>=TERR_LINES[hi]) return hi-1; while(lo<hi-1){ var m=(lo+hi)>>1; if(TERR_LINES[m]<=v) lo=m; else hi=m; } return lo; }
/* height of the terrain MESH (not the field) — for anything draped on coarse outer cells */
function terrMeshH(x,z){ var i=terrLineIdx(x), j=terrLineIdx(z), u=clamp((x-TERR_LINES[i])/(TERR_LINES[i+1]-TERR_LINES[i]),0,1), v=clamp((z-TERR_LINES[j])/(TERR_LINES[j+1]-TERR_LINES[j]),0,1);
  var a=TERR_H[j*TERR_N+i], b=TERR_H[j*TERR_N+i+1], c=TERR_H[(j+1)*TERR_N+i], d=TERR_H[(j+1)*TERR_N+i+1];
  return Math.max(a*(1-u)*(1-v)+b*u*(1-v)+c*(1-u)*v+d*u*v, Math.min(a,b,c,d)); }

var _gtA=new THREE.Color(), _gtB=new THREE.Color();
function groundTone(x,z,h,slope){
  var c=_gtA, n=fbm(x*0.004+4, z*0.004-9), n2=vn(x*0.06, z*0.06), r0=Math.hypot(x,z), rd=riverDist(x,z);
  c.set(PAL.soil[n2<0.33?0:n2<0.66?1:2]);
  c.lerp(_gtB.set(PAL.dryGrass[n2<0.5?0:2]), clamp(smooth(0.35,0.62,n)*0.85,0,1));
  c.lerp(_gtB.set(PAL.scrub[n2<0.5?0:1]), clamp(smooth(0.52,0.78,fbm(x*0.009-3,z*0.009+6))*0.6 + smooth(260,30,rd)*0.45,0,0.85));
  /* valley-floor farmland: a patchwork beyond the town */
  if(!SHEET){
    var fk = smooth(760, 900, r0)*(1-smooth(0.10,0.22,slope))*(1-smooth(90,170,h))*smooth(20,60,rd);
    if(fk > 0.02){ var cx=Math.floor((x+z*0.35)/150 + 0.6*sig(x,z,0.003)), cz=Math.floor((z-x*0.35)/115 + 0.6*sig(z,x,0.003)), id=h2(cx*7+3,cz*13+5);
      c.lerp(_gtB.set(PAL.field[Math.floor(id*4)%4]), fk*(0.55+0.35*h2(cx,cz))); }
    /* bare trodden earth under the town */
    c.lerp(_gtB.set(PAL.lane[1]), 0.55*(1-smooth(640,800,r0)));
    /* talus and rock */
    var bd=Math.hypot(x-BUTTE.x,z-BUTTE.z); if(bd<560 && r0>RW) c.lerp(_gtB.set(PAL.talus[n2<0.5?0:2]), 0.7*(1-smooth(330,540,bd))*smooth(0.95,1.5,angDist(Math.atan2(z-BUTTE.z,x-BUTTE.x),-Math.PI/2)));
  }
  c.lerp(_gtB.set(PAL.rock[n2<0.5?1:2]), clamp(smooth(0.30,0.62,slope) + smooth(260,520,h)*0.6, 0, 0.95));
  if(h > 640) c.lerp(_gtB.set(PAL.horizon.rim), smooth(640,900,h)*0.6);
  if(rd < 6){ c.lerp(_gtB.set(0x6a6450), 0.7*(1-smooth(-4,6,rd))); }
  c.multiplyScalar(0.84 + 0.30*n2);
  return c;
}

var terrGeo = new THREE.BufferGeometry();
(function(){
  var N=TERR_N, pos=new Float32Array(N*N*3), col=new Float32Array(N*N*3), uv=new Float32Array(N*N*2), idx=new Uint32Array((N-1)*(N-1)*6), k=0;
  for(var j=0;j<N;j++) for(var i=0;i<N;i++){ var x=TERR_LINES[i], z=TERR_LINES[j], h=terrainH(x,z), o=j*N+i; TERR_H[o]=h; pos[o*3]=x; pos[o*3+1]=h; pos[o*3+2]=z; uv[o*2]=x/9; uv[o*2+1]=z/9; }
  for(j=0;j<N;j++) for(i=0;i<N;i++){ var o2=j*N+i, i0=Math.max(0,i-1), i1=Math.min(N-1,i+1), j0=Math.max(0,j-1), j1=Math.min(N-1,j+1);
    var sx=(TERR_H[j*N+i1]-TERR_H[j*N+i0])/(TERR_LINES[i1]-TERR_LINES[i0]), sz=(TERR_H[j1*N+i]-TERR_H[j0*N+i])/(TERR_LINES[j1]-TERR_LINES[j0]);
    var c=groundTone(TERR_LINES[i], TERR_LINES[j], TERR_H[o2], Math.hypot(sx,sz)).convertSRGBToLinear(); col[o2*3]=c.r; col[o2*3+1]=c.g; col[o2*3+2]=c.b; }
  for(j=0;j<N-1;j++) for(i=0;i<N-1;i++){ var a=j*N+i, b=a+1, d=a+N, e=d+1; idx[k++]=a; idx[k++]=d; idx[k++]=b; idx[k++]=b; idx[k++]=d; idx[k++]=e; }
  terrGeo.setAttribute('position', new THREE.BufferAttribute(pos,3)); terrGeo.setAttribute('color', new THREE.BufferAttribute(col,3));
  terrGeo.setAttribute('uv', new THREE.BufferAttribute(uv,2)); terrGeo.setIndex(new THREE.BufferAttribute(idx,1));
  terrGeo.computeVertexNormals(); terrGeo.computeBoundingSphere();
})();
/* the valley floor's detail, tiled in world units (UVs are x/9 m) and multiplied over the vertex colour and the painted
   city ground: the library set materials.json names 'ground' (a MeshStandardMaterial with its normal and roughness),
   or the procedural TEX.def yuni.ground (47-texture.js) with ?mat=proc. */
var terrLib = KMAT.mode === 'lib' ? KMAT.packed('yuni', 'ground') : null;
var terrTex, terrLibTex = null;
if(terrLib){
  terrLibTex = KMAT.textures(terrLib, { aniso: FAST ? 1 : 8 });
  [terrLibTex.map, terrLibTex.normalMap, terrLibTex.roughnessMap].forEach(function(t){ if(t) t.repeat.set(9/terrLib.scale[0], 9/terrLib.scale[1]); });
  terrTex = terrLibTex.map;
} else terrTex = texFinish(texFill(YTEX.ground.size, TEX.fn(YTEX.ground)));
var groundTex = new THREE.CanvasTexture(GROUND_CANVAS);
groundTex.encoding = THREE.sRGBEncoding; groundTex.anisotropy = FAST?2:8; groundTex.wrapS = groundTex.wrapT = THREE.ClampToEdgeWrapping;
var terrMat = nlMaterial(terrLib ? famMaterial({ lib:terrLib, libTex:terrLibTex }, { vertexColors:true }) : new THREE.MeshLambertMaterial({ vertexColors:true, map:terrTex }),
                         'terrain' + (terrLib ? '|std'+KMAT.libKey(terrLib) : ''), function(sh){
  if(terrLib) KMAT.libHooks(sh, terrLib);
  sh.uniforms.uGround = { value:groundTex };
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uGround;')
    .replace('#include <color_fragment>', [ '#include <color_fragment>',
      '{ vec2 _guv = (vNlWP.xz + ' + CITY_EXT.toFixed(1) + ') / ' + (2*CITY_EXT).toFixed(1) + ';',
      '  if(_guv.x > 0.0 && _guv.x < 1.0 && _guv.y > 0.0 && _guv.y < 1.0){',
      '    vec4 _gc = texture2D(uGround, vec2(_guv.x, 1.0 - _guv.y));',
      '    vec3 _gl = pow(max(_gc.rgb, vec3(0.0)), vec3(2.2));',
      '    float _dt = 0.80 + 0.40*texture2D(map, vUv*2.3).r;',
      '    diffuseColor.rgb = mix(diffuseColor.rgb, _gl*_dt, _gc.a); } }' ].join('\n'));
});
var terrain = new THREE.Mesh(terrGeo, terrMat);
terrain.receiveShadow = !FAST; terrain.frustumCulled = false; terrain.userData.inspectLabel = SHEET ? 'Inspection ground' : 'Valley floor'; terrain.userData.isTerrain = true;
scene.add(terrain);

/* ---- THE CANAL: a fine strip mesh for the channel, its banks and its towpaths, laid over the
        coarse terrain (which terrainH has already pressed into roughly the same shape), plus the
        water ribbon, the diversion weir, the basin and an avenue of trees along the towpath. ---- */
var canalMesh = (function(){
  if(SHEET) return null;
  var LAT=[0,2.2,4.2,5.0,6.6,8.4,11.0,13.0,15.0,18.0,23.0,27.0], cols=[];
  for(var k=LAT.length-1;k>0;k--) cols.push(-LAT[k]); for(k=0;k<LAT.length;k++) cols.push(LAT[k]);
  var nc=cols.length, S=[], s=0;
  while(s < CANAL_LEN-0.01){ S.push(s); s += 5.5; } S.push(CANAL_LEN-0.01);
  var pos=[], col=[], uv=[], idx=[], c=new THREE.Color(), cWet=new THREE.Color(0x4e4a38).convertSRGBToLinear();
  for(var i=0;i<S.length;i++){
    var C=canalAt(S[i]), Ca=canalAt(S[i]-9), Cb=canalAt(S[i]+9), tx=Cb.x-Ca.x, tz=Cb.z-Ca.z, tl=Math.hypot(tx,tz)||1; tx/=tl; tz/=tl;
    var L=canalLevel(S[i]);
    for(var j=0;j<nc;j++){
      var lat=cols[j], px=C.x-tz*lat, pz=C.z+tx*lat, ad=Math.abs(lat);
      var gOut=terrMeshH(px,pz), y = ad>=CANAL_W[3] ? gOut : canalShape(ad, L, gOut);
      pos.push(px, y+0.02, pz); uv.push(px/9, pz/9);
      c.copy(groundTone(px,pz,y,0.1)).convertSRGBToLinear();
      if(ad < CANAL_HALF+1.6) c.lerp(cWet, 0.85);                        /* wet silt in the channel */
      else if(ad < CANAL_W[1]) c.lerp(cWet, 0.34*(1-smooth(CANAL_HALF+1.6, CANAL_W[1], ad)));
      if(ad > CANAL_W[1] && ad < CANAL_W[2]) c.multiplyScalar(1.10);      /* the trodden towpath */
      col.push(c.r,c.g,c.b);
    }
  }
  for(var i2=0;i2<S.length-1;i2++) for(var j2=0;j2<nc-1;j2++){ var a=i2*nc+j2, b=a+1, d=a+nc, e=d+1; idx.push(a,d,b, b,d,e); }
  var g2=new THREE.BufferGeometry();
  g2.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g2.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
  g2.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g2.setIndex(idx); g2.computeVertexNormals(); g2.computeBoundingSphere();
  var mm=new THREE.Mesh(g2, terrMat); mm.receiveShadow=!FAST; mm.frustumCulled=false; mm.userData.inspectLabel='Canal bank';
  scene.add(mm); window._canal = { stripTris:idx.length/3, stations:S.length, len:Math.round(CANAL_LEN), lift:+(CANAL_L0-riverLevel(polyNear(CANAL_WEIR.x,CANAL_WEIR.z,RIVER,RIVER_CUM).t)).toFixed(2) };
  return mm;
})();

/* ---- highway ribbons beyond the painted box, draped on the terrain mesh ---- */
(function(){
  if(SHEET) return;
  var pos=[], col=[], uv=[], idx=[], c=new THREE.Color(PAL.paving[3]).convertSRGBToLinear(), c2=new THREE.Color(PAL.lane[2]).convertSRGBToLinear();
  HIGHWAYS.forEach(function(H){
    var w=ST_CLASS[H.cls].w*0.5, cc = H.cls==='highway' ? c : c2, started=false, cum=0;
    for(var i=0;i<H.pts.length-1;i++){
      var A=H.pts[i], B=H.pts[i+1], L=Math.hypot(B[0]-A[0],B[1]-A[1]), n=Math.max(1,Math.ceil(L/10)), tx=(B[0]-A[0])/L, tz=(B[1]-A[1])/L;
      for(var k=0;k<=n;k++){ if(k===0 && started) continue;
        var t=k/n, x=mix(A[0],B[0],t), z=mix(A[1],B[1],t); cum+=L/n;
        if(Math.max(Math.abs(x),Math.abs(z)) < CITY_EXT-14){ started=false; continue; }
        var lx=x-tz*w, lz=z+tx*w, rx=x+tz*w, rz=z-tx*w, v0=pos.length/3;
        pos.push(lx, Math.max(terrMeshH(lx,lz),terrainH(lx,lz))+0.35, lz, rx, Math.max(terrMeshH(rx,rz),terrainH(rx,rz))+0.35, rz);
        col.push(cc.r,cc.g,cc.b, cc.r,cc.g,cc.b); uv.push(0,cum/9, 1.5,cum/9);
        if(started) idx.push(v0-2,v0,v0-1, v0-1,v0,v0+1);
        started=true; }
    }
  });
  if(!pos.length) return;
  var g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals();
  var m=new THREE.Mesh(g, nlMaterial(new THREE.MeshLambertMaterial({ vertexColors:true, map:terrTex, side:THREE.DoubleSide, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 }), 'hwy'));
  m.frustumCulled=false; m.receiveShadow=!FAST; m.userData.inspectLabel='Highway'; scene.add(m);
})();

/* ---- the river ---- */
var waterUni = {
  uTime:{value:0}, uSun:{value:new THREE.Vector3(0.4,0.8,-0.4)}, uCam:{value:new THREE.Vector3()},
  uShallow:{value:new THREE.Color(PAL.riverShallow)}, uDeep:{value:new THREE.Color(PAL.riverDeep)},
  uSky:{value:new THREE.Color(0xa8c4d8)}, uFoam:{value:new THREE.Color(PAL.foam)},
  uFogCol:{value:new THREE.Color(PAL.haze)}, uFogDen:{value:PAL.fogDensity}, uDay:{value:1}
};
var water = (function(){
  if(SHEET) return null;
  var across=6, pos=[], aux=[], fall=[], idx=[], WS=[], s=0;
  while(s < RIVER_LEN-0.02){ WS.push(s); var R0=riverAt(s); s += Math.hypot(R0.x,R0.z) < 2200 ? 8 : 30; } WS.push(RIVER_LEN-0.02);
  var ns=WS.length-1;
  for(var i=0;i<=ns;i++){
    var R=riverAt(WS[i]), Ra=riverAt(WS[i]-20), Rb=riverAt(WS[i]+20), tx=Rb.x-Ra.x, tz=Rb.z-Ra.z, tl=Math.hypot(tx,tz)||1; tx/=tl; tz/=tl;
    var half=riverHalfAt(WS[i])+7, y=riverLevel(WS[i]);
    for(var j=0;j<=across;j++){ var v=j/across*2-1; pos.push(R.x - tz*half*v, y, R.z + tx*half*v); aux.push(WS[i], v, 0); fall.push(0); }
  }
  for(var i2=0;i2<ns;i2++) for(var j2=0;j2<across;j2++){ var a=i2*(across+1)+j2, b=a+1, c=a+across+1, d=c+1; idx.push(a,c,b, b,c,d); }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('aAux', new THREE.Float32BufferAttribute(aux,3));
  g.setAttribute('aFall', new THREE.Float32BufferAttribute(fall,1));
  g.setIndex(idx); g.computeBoundingSphere();
  var mat = new THREE.ShaderMaterial({ uniforms:waterUni, transparent:true, side:THREE.DoubleSide,
    vertexShader:[
      'attribute vec3 aAux; attribute float aFall; uniform float uTime; varying vec3 vW; varying vec3 vAux; varying float vFall;',
      'void main(){ vec3 p=position; vAux=aAux; vFall=aFall;',
      '  p.y += 0.025*sin(aAux.x*0.9 - uTime*2.2 + aAux.y*3.0) + aAux.z*0.05*sin(aAux.x*2.3 - uTime*7.0 + aAux.y*9.0);',
      '  vec4 wp=modelMatrix*vec4(p,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }'].join('\n'),
    fragmentShader:[
      'precision highp float;',
      'uniform float uTime,uFogDen,uDay; uniform vec3 uSun,uCam,uShallow,uDeep,uSky,uFoam,uFogCol;',
      'varying vec3 vW; varying vec3 vAux; varying float vFall;',
      'float hsh(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }',
      'float nz(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);',
      '  return mix(mix(hsh(i),hsh(i+vec2(1,0)),f.x), mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),f.x), f.y); }',
      'void main(){',
      '  float s=vAux.x, v=vAux.y, ck=vAux.z, edge=abs(v);',
      '  float flow = uTime*(1.6+6.0*ck);',
      '  vec2 q = vec2(s*0.45 - flow*0.45, v*3.0);',
      '  float r1 = nz(q*vec2(1.0,2.2)), r2 = nz(q*vec2(2.7,5.0)+3.1);',
      '  vec3 N = normalize(vec3((r1-0.5)*0.55, 1.0, (r2-0.5)*0.55));',
      '  vec3 V = normalize(uCam - vW);',
      '  float fres = pow(max(1.0-clamp(dot(N,V),0.0,1.0),0.0), 3.0);',
      '  vec3 body = mix(uShallow, uDeep, smoothstep(1.0,0.25,edge));',
      '  vec3 col = mix(body*(0.35+0.65*uDay), uSky, clamp(fres*0.8,0.0,0.75));',
      '  vec3 H = normalize(uSun+V); col += vec3(1.0,0.95,0.85)*pow(clamp(dot(N,H),0.0,1.0),90.0)*0.8*uDay;',
      '  float foam = ck*0.6*smoothstep(0.40,0.80, nz(vec2(s*1.1 - flow*0.9, v*7.0)) + 0.35*r2)',
      '             + vFall*(0.55 + 0.45*nz(vec2(s*0.7 - flow*1.4, v*16.0)))',
      '             + smoothstep(0.78,0.97,edge)*0.30*nz(vec2(s*1.6 - flow*0.4, v*5.0));',
      '  col = mix(col, uFoam*(0.4+0.6*uDay), clamp(foam,0.0,0.9));',
      '  float alpha = mix(0.34, 0.74, smoothstep(1.0,0.30,edge)) + 0.30*fres; alpha = max(alpha, clamp(foam,0.0,1.0));',
      '  alpha *= smoothstep(1.0,0.90,edge);',
      '  float fd = length(uCam-vW)*uFogDen, fog = 1.0-exp(-fd*fd);',
      '  gl_FragColor = vec4(mix(col,uFogCol,clamp(fog,0.0,1.0)), alpha);',
      '}'].join('\n') });
  var m = new THREE.Mesh(g, mat); m.renderOrder=2; m.frustumCulled=false; m.userData.inspectLabel='The river';
  scene.add(m); return m;
})();

/* the canal's own water ribbon, on the river's shader so it ripples and takes the same sky */
var canalWater = (function(){
  if(SHEET || !water) return null;
  var across=4, pos=[], aux=[], fall=[], idx=[], WS=[], s=0;
  while(s < CANAL_LEN-0.01){ WS.push(s); s += 7; } WS.push(CANAL_LEN-0.01);
  var ns=WS.length-1;
  for(var i=0;i<=ns;i++){
    var C=canalAt(WS[i]), Ca=canalAt(WS[i]-9), Cb=canalAt(WS[i]+9), tx=Cb.x-Ca.x, tz=Cb.z-Ca.z, tl=Math.hypot(tx,tz)||1; tx/=tl; tz/=tl;
    var half=CANAL_HALF+0.5, y=canalLevel(WS[i]);
    for(var j=0;j<=across;j++){ var v=j/across*2-1; pos.push(C.x - tz*half*v, y, C.z + tx*half*v); aux.push(WS[i], v, 0); fall.push(0); }
  }
  for(var i2=0;i2<ns;i2++) for(var j2=0;j2<across;j2++){ var a=i2*(across+1)+j2, b=a+1, c=a+across+1, d=c+1; idx.push(a,c,b, b,c,d); }
  /* the basin's own sheet of water, on the same ribbon so it ripples with the canal */
  (function(){ var B=CANAL_BASIN, L=canalLevel(CANAL_LEN), v0=pos.length/3, NX=6, NZ=4;
    for(var jj=0;jj<=NZ;jj++) for(var ii=0;ii<=NX;ii++){
      var q=loc(B.x,B.z, (ii/NX-0.5)*(B.w-1.2), (jj/NZ-0.5)*(B.d-1.2), B.ry);
      pos.push(q[0], L, q[1]); aux.push(CANAL_LEN*0.5 + ii*11, (jj/NZ)*2-1, 0); fall.push(0); }
    for(jj=0;jj<NZ;jj++) for(ii=0;ii<NX;ii++){ var a2=v0+jj*(NX+1)+ii, b2=a2+1, c2=a2+NX+1, d2=c2+1; idx.push(a2,c2,b2, b2,c2,d2); }
  })();
  var g3=new THREE.BufferGeometry();
  g3.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  g3.setAttribute('aAux', new THREE.Float32BufferAttribute(aux,3));
  g3.setAttribute('aFall', new THREE.Float32BufferAttribute(fall,1));
  g3.setIndex(idx); g3.computeBoundingSphere();
  var mw=new THREE.Mesh(g3, water.material); mw.renderOrder=2; mw.frustumCulled=false; mw.userData.inspectLabel='The canal';
  scene.add(mw); return mw;
})();
