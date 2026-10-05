/* ============================== 20. EMIT + GROUND + WATER — LOCUS ==============================
   PLANNER-OWNED. Emits every kit bucket, then builds the ground (one mesh: 5 m cells under the town,
   8 m over the delta and the countryside, growing geometrically out to the horizon), drapes the
   painted ground canvas over it, adds the highway ribbons beyond the canvas, and lays THE WATER: one
   sheet at y = 0 that is the lake, the river, the delta, the canal and every marsh pool at once. Its
   colour is the lake's own hue (EASTABYSS_LAKE) in the salt, and a fresh river green in the channels.
   Nothing generative may push into the kit after this fragment.                                     */
reseed(750001);

(window.YUNI_FINISHERS||[]).forEach(function(fn){ try{ fn(); }catch(e){ ERR('finisher: '+(e&&e.stack||e)); } });
var EMIT = emitBuckets(), EMITM = emitMerged();
KIT_EMITTED = true;
window._stats = { instances:EMIT.instances, instMeshes:EMIT.meshes, mergedTris:EMITM.tris, mergedMeshes:EMITM.meshes };

var TERR_LINES = (function(){
  if(SHEET){ var o=[], EX=CITY_EXT+120, ST2=CATALOG?6:(KIT?10:40); for(var s=-EX;s<=EX;s+=ST2) o.push(s); return o; }
  var half=[0], c=5, x=0;
  while(x < 560){ x+=c; half.push(x); }
  c=8; while(x < 1600){ x+=c; half.push(x); }
  c=12; while(x < 2800){ x+=c; half.push(x); }
  while(x < HW*1.08){ c*=1.12; x+=c; half.push(x); }
  var out=[]; for(var i=half.length-1;i>0;i--) out.push(-half[i]); return out.concat(half);
})();
var TERR_N = TERR_LINES.length, TERR_H = new Float32Array(TERR_N*TERR_N);
function terrLineIdx(v){ var lo=0, hi=TERR_N-1; if(v<=TERR_LINES[0]) return 0; if(v>=TERR_LINES[hi]) return hi-1; while(lo<hi-1){ var m=(lo+hi)>>1; if(TERR_LINES[m]<=v) lo=m; else hi=m; } return lo; }
function terrMeshH(x,z){ var i=terrLineIdx(x), j=terrLineIdx(z), u=clamp((x-TERR_LINES[i])/(TERR_LINES[i+1]-TERR_LINES[i]),0,1), v=clamp((z-TERR_LINES[j])/(TERR_LINES[j+1]-TERR_LINES[j]),0,1);
  var a=TERR_H[j*TERR_N+i], b=TERR_H[j*TERR_N+i+1], c=TERR_H[(j+1)*TERR_N+i], d=TERR_H[(j+1)*TERR_N+i+1];
  return a*(1-u)*(1-v)+b*u*(1-v)+c*(1-u)*v+d*u*v; }

var LAKE_COL = new THREE.Color().setHSL(EASTABYSS_LAKE.hue, 0.85, 0.45);
var _gtA=new THREE.Color(), _gtB=new THREE.Color(), GT = PAL.ground;
function groundTone(x,z,h,slope){
  var c=_gtA, n=nfb(x*0.004+4, z*0.004-9), n2=vn(x*0.06, z*0.06), nn=clamp(0.5+(n-0.5)*1.6,0,1);
  if(SHEET){ c.set(PAL.soil[1]); return c; }
  /* the marsh: dark mud and algal green */
  c.set(GT.mud).lerp(_gtB.set(GT.alga), nn);
  /* the hill: laterite soil, dry grass on the slopes, trodden town earth */
  var hk=hillK(x,z); if(hk > 0.02){ _gtB.set(GT.hill).lerp(new THREE.Color(GT.hillGrass), smooth(0.45,0.75,n)*0.7).lerp(new THREE.Color(GT.hillDry), smooth(0.6,0.2,n2)*0.4); c.lerp(_gtB, smooth(0.02,0.35,hk)); }
  /* the ridge and the levees: drier, grassier */
  var rk=Math.max(ridgeK(x,z), hummockK(x,z)); if(rk > 0.02) c.lerp(_gtB.set(GT.hillGrass), 0.55*rk);
  /* the east: jungle litter toward the shelf */
  var ek=smooth(1500,2600,x); if(ek > 0) c.lerp(_gtB.set(GT.litter).lerp(new THREE.Color(GT.litterRed), nn), ek*0.8);
  /* the salt crust round the lake, faintly tinted with the lake's colour; silt and delta mud at the banks */
  var ld=lakeDist(x,z), rd=riverDist(x,z);
  c.lerp(_gtB.set(GT.crust).lerp(LAKE_COL, 0.10), 0.85*smooth(110, 8, ld)*smooth(-20, 12, ld));
  c.lerp(_gtB.set(GT.silt), 0.6*smooth(40, 6, rd)); c.lerp(_gtB.set(GT.delta), 0.5*smooth(18, 2, rd));
  if(h < 0.1) c.lerp(_gtB.set(GT.bed), 0.8);
  c.lerp(_gtB.set(PAL.rock[1]), clamp(smooth(0.35,0.7,slope),0,0.8));
  c.multiplyScalar(0.86 + 0.26*n2);
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
var terrTex = (function(){
  var S=256, a=texNoise(S,10,301), b=texNoise(S,48,302), c=texNoise(S,110,303);
  return texFinish(texFill(S,function(x,y){ return 0.80 + 0.16*(a(x,y)-0.5) + 0.20*(b(x,y)-0.5) + 0.18*(c(x,y)-0.5) + (c(x,y)>0.84?0.08:0); }));
})();
var groundTex = new THREE.CanvasTexture(GROUND_CANVAS);
groundTex.encoding = THREE.sRGBEncoding; groundTex.anisotropy = FAST?2:8; groundTex.wrapS = groundTex.wrapT = THREE.ClampToEdgeWrapping;
var terrMat = nlMaterial(new THREE.MeshLambertMaterial({ vertexColors:true, map:terrTex }), 'terrain', function(sh){
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
terrain.receiveShadow = !FAST; terrain.frustumCulled = false; terrain.userData.inspectLabel = SHEET ? 'Inspection ground' : 'The delta floor'; terrain.userData.isTerrain = true;
scene.add(terrain);

/* ---- road ribbons beyond the painted box, draped on the terrain mesh (the highways run on to the horizon) ---- */
(function(){
  if(SHEET) return;
  var pos=[], col=[], uv=[], idx=[], cH=new THREE.Color(PAL.paving[3]).convertSRGBToLinear(), cT=new THREE.Color(PAL.lane[0]).convertSRGBToLinear();
  function ribbon(pts, w, cc){ var started=false, cum=0;
    for(var i=0;i<pts.length-1;i++){ var A=pts[i], B=pts[i+1], L=Math.hypot(B[0]-A[0],B[1]-A[1]); if(L<0.01) continue; var n=Math.max(1,Math.ceil(L/10)), tx=(B[0]-A[0])/L, tz=(B[1]-A[1])/L;
      for(var k=0;k<=n;k++){ if(k===0 && started) continue; var t=k/n, x=mix(A[0],B[0],t), z=mix(A[1],B[1],t); cum+=L/n;
        if(Math.max(Math.abs(x),Math.abs(z)) < CITY_EXT-14){ started=false; continue; }
        var lx=x-tz*w, lz=z+tx*w, rx=x+tz*w, rz=z-tx*w, v0=pos.length/3, bd=bridgeDeckAt(x,z);
        var yl = bd!=null ? bd+0.05 : Math.max(terrMeshH(lx,lz),terrainH(lx,lz),0.2)+0.3, yr = bd!=null ? bd+0.05 : Math.max(terrMeshH(rx,rz),terrainH(rx,rz),0.2)+0.3;
        pos.push(lx, yl, lz, rx, yr, rz); col.push(cc.r,cc.g,cc.b, cc.r,cc.g,cc.b); uv.push(0,cum/9, 1.5,cum/9);
        if(started) idx.push(v0-2,v0,v0-1, v0-1,v0,v0+1); started=true; } } }
  HIGHWAYS.forEach(function(H){ var pts=H.pts.slice(); if(H.cls==='highway'){ var a=pts[pts.length-2], b=pts[pts.length-1], dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz)||1; pts.push([b[0]+dx/L*1800, b[1]+dz/L*1800]); }
    ribbon(pts, ST_CLASS[H.cls].w*0.5, H.cls==='highway'?cH:cT); });
  PUMPJACKS.forEach(function(P){ if(P.track){ var p0=loc(P.x,P.z,0,P.d/2-1,P.ry); ribbon([p0].concat(P.track.map(function(n){ return [n.x,n.z]; })), ST_CLASS.track.w*0.5, cT); } });
  if(!pos.length) return;
  var g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals();
  var m=new THREE.Mesh(g, nlMaterial(new THREE.MeshLambertMaterial({ vertexColors:true, map:terrTex, side:THREE.DoubleSide, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 }), 'hwy'));
  m.frustumCulled=false; m.receiveShadow=!FAST; m.userData.inspectLabel='Road'; scene.add(m);
})();

/* ---- THE WATER: one sheet at y 0, vertex-coloured by depth and by salt vs fresh ---- */
var waterUni = {
  uTime:{value:0}, uSun:{value:new THREE.Vector3(0.4,0.8,-0.4)}, uCam:{value:new THREE.Vector3()},
  uSky:{value:new THREE.Color(0xd2dcd6)}, uFogCol:{value:new THREE.Color(PAL.haze)}, uFogDen:{value:PAL.fogDensity}, uDay:{value:1}
};
var WATER_SHALLOW=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.78,.47), WATER_MID=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.80,.33), WATER_DEEP=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.68,.14), WATER_PALE=new THREE.Color().setHSL(EASTABYSS_LAKE.hue+.02,.50,.70);
var RIVER_COL=new THREE.Color().setHSL((EASTABYSS_LAKE.hue+.5)%1,.38,.30), POOL_COL=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.5,.30).lerp(new THREE.Color(0x3a3a26),.68);
/* how much of the shared wave field (core/atmos, 90-atmos-host.js) a point of water takes: the open lake, away from the
   shore, the river's fresh water and the pools. The river and the pools keep the sheet's own ripple (a flow is not a sea). */
function waterOpenAt(x,z){
  var ld=lakeDist(x,z), rd=riverDist(x,z), cd=canalDist(x,z);
  var fresh = Math.max(smooth(30, 2, rd)*(1-smooth(-60,-360,ld)), smooth(10,2,cd));
  return (1-fresh)*smooth(-8,-70,ld);
}
function waterColorAt(x,z,out){
  var h=terrainH(x,z), d=Math.max(0,-h), ld=lakeDist(x,z), rd=riverDist(x,z), cd=canalDist(x,z);
  var fresh = Math.max(smooth(30, 2, rd)*(1-smooth(-60,-360,ld)), smooth(10,2,cd));
  var shoal = nfb(x*0.0031+2, z*0.0031-4);
  out.copy(WATER_SHALLOW).lerp(WATER_PALE, Math.max(smooth(0.47,0.66,shoal)*smooth(2.2,0.3,d), smooth(0.5,0.08,d)*0.6)).lerp(WATER_MID, smooth(1.2,3.6,d)).lerp(WATER_DEEP, smooth(4,8.5,d));
  var pool = smooth(-30, 40, ld)*(1-fresh); out.lerp(POOL_COL, pool*0.85);
  out.lerp(RIVER_COL, fresh);
  return out;
}
var water = (function(){
  if(SHEET) return null;
  var L=[]; (function(){ var half=[0], c=18, x=0; while(x < 2900){ x+=c; half.push(x); } while(x < 13000){ c*=1.18; x+=c; half.push(x); } for(var i=half.length-1;i>0;i--) L.push(-half[i]); L=L.concat(half); })();
  var N=L.length, pos=new Float32Array(N*N*3), col=new Float32Array(N*N*3), H=new Float32Array(N*N), OPN=new Float32Array(N*N), idx=[], c=new THREE.Color();
  for(var j=0;j<N;j++) for(var i=0;i<N;i++){ var x=L[i], z=L[j], o=j*N+i, h = Math.abs(x)>HW*1.05||Math.abs(z)>HW*1.05 ? (lakeDist(x,z)<0 ? -10 : 5) : terrainH(x,z); H[o]=h;
    pos[o*3]=x; pos[o*3+1]=0; pos[o*3+2]=z; waterColorAt(Math.max(-HW,Math.min(HW,x)), Math.max(-HW,Math.min(HW,z)), c).convertSRGBToLinear(); col[o*3]=c.r; col[o*3+1]=c.g; col[o*3+2]=c.b;
    OPN[o] = Math.abs(x)>HW||Math.abs(z)>HW ? (lakeDist(x,z)<0 ? 1 : 0) : waterOpenAt(x,z); }
  /* only the quads where the ground actually dips under the plane */
  for(j=0;j<N-1;j++) for(i=0;i<N-1;i++){ var a=j*N+i, b=a+1, d=a+N, e=d+1; if(Math.min(H[a],H[b],H[d],H[e]) > 0.35) continue; idx.push(a,d,b, b,d,e); }
  var g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('color', new THREE.BufferAttribute(col,3)); g.setAttribute('aOpen', new THREE.BufferAttribute(OPN,1)); g.setIndex(idx); g.computeBoundingSphere();
  var mat = new THREE.ShaderMaterial({ uniforms:waterUni, transparent:false, vertexColors:true,
    vertexShader:['attribute float aOpen; varying vec3 vW; varying vec3 vCol; varying float vOpen;','void main(){ vCol=color; vOpen=aOpen; vec4 wp=modelMatrix*vec4(position,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }'].join('\n'),
    fragmentShader:['precision highp float;','#include <atmos_waves>','uniform float uTime,uFogDen,uDay; uniform vec3 uSun,uCam,uSky,uFogCol; varying vec3 vW; varying vec3 vCol; varying float vOpen;',
      'void main(){',
      '  float dcam=length(uCam-vW); float rk=1.0-smoothstep(120.0,420.0,dcam);',
      '  vec3 n=normalize(vec3(rk*(0.035*sin(vW.x*0.31+uTime*1.1)+0.02*sin(vW.z*0.53-uTime*0.7+vW.x*0.11)),1.0,rk*(0.035*cos(vW.z*0.27+uTime*0.9)+0.02*sin(vW.x*0.47+uTime*1.3))));',
      '  if(vOpen > 0.002) n=normalize(mix(n, atmWaveNormal(vW.xz, dcam, 2.0), vOpen));   /* the open lake: the shared wave field (shading only: no swell under the reed decks) */',
      '  vec3 V=normalize(uCam-vW); float fr=pow(1.0-max(dot(n,V),0.0),3.0);',
      '  vec3 col=mix(vCol*(0.30+0.70*uDay), uSky*(0.25+0.75*uDay), 0.08+fr*0.55);',
      '  vec3 Hh=normalize(uSun+V); col+=pow(max(dot(n,Hh),0.0),140.0)*0.75*vec3(1.0,0.96,0.86)*uDay;',
      '  float fd=dcam*uFogDen, fog=1.0-exp(-fd*fd);',
      '  gl_FragColor=vec4(mix(col,uFogCol,clamp(fog,0.0,1.0)),1.0);','}'].join('\n') });
  var m=new THREE.Mesh(g, mat); m.renderOrder=1; m.frustumCulled=false; m.userData.inspectLabel='The salt lake, the river and the delta (water)'; m.userData.isWater=true;
  scene.add(m); window._water = { verts:N*N, tris:idx.length/3 }; return m;
})();
