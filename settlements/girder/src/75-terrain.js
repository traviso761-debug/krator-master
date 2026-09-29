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
/* ---- BROOK fine-strip parameters (forest pass) ---- */
var BROOK_FINE = (function(){
  var ext=1200, s0=1e9, s1=-1e9;
  for(var s=0;s<RIVER_LEN;s+=5){ var R=riverAt(s); if(Math.abs(R.x)<ext && Math.abs(R.z)<ext){ s0=Math.min(s0,s); s1=Math.max(s1,s); } }
  return { ext:ext, s0:s0, s1:s1, W:30, taper:70 };
})();
function brookSink(d, s){
  if(typeof JUNGLE_BROOK==='undefined' || !JUNGLE_BROOK) return 0;
  var k = smooth(BROOK_FINE.s0, BROOK_FINE.s0+BROOK_FINE.taper, s) * (1-smooth(BROOK_FINE.s1-BROOK_FINE.taper, BROOK_FINE.s1, s));
  return k * (2.4*(1-smooth(10,20,d)) + 0.3*(1-smooth(BROOK_FINE.W-8, BROOK_FINE.W+6, d)));
}
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
  /* BROOK: this grid (7-13 m cells) cannot hold a 6.5 m channel. Along the reach that the fine bed strip
     (below) covers, press the coarse vertices down so they can never poke through the strip or the water. */
  for(var i2=0;i2<p.count;i2++){
    var bx=a[i2*3], bz=a[i2*3+2]; if(Math.abs(bx)>BROOK_FINE.ext+60 || Math.abs(bz)>BROOK_FINE.ext+60) continue;
    var rv=polyNear(bx,bz,RIVER,RIVER_CUM); if(rv.d > BROOK_FINE.W+8) continue;
    a[i2*3+1] -= brookSink(rv.d, rv.t);
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

/* ---- BROOK bed strip: a fine mesh (0.5-1 m across the channel, 0.4-4 m along it) that follows the RIVER
        polyline: bed, cut banks and the first 30 m of the vale on either side. Its outer edge is laid on the
        coarse mesh's own interpolated surface, so there is no seam; inside that it carries the true field
        (JUNGLE_BROOK.ground from 62-jungle.js: stepped cascade, pools, bank lip). ---- */
function brookWarpInv(x){ var t=x/(HW*1.12), lo=-1, hi=1; for(var k=0;k<40;k++){ var m=(lo+hi)/2; if(0.30*m+0.70*m*m*m < t) lo=m; else hi=m; } return (lo+hi)/2; }
function brookCoarse(x, z, out){          /* height (+ colour) of the coarse terrain mesh's surface at (x,z) */
  var P=terrGeo.attributes.position.array, C=terrGeo.attributes.color.array, n1=SEG+1;
  var fx=(brookWarpInv(x)+1)/2*SEG, fz=(brookWarpInv(z)+1)/2*SEG, ix=clamp(Math.floor(fx),0,SEG-1), iz=clamp(Math.floor(fz),0,SEG-1);
  var A=iz*n1+ix, B=(iz+1)*n1+ix, Cc=(iz+1)*n1+ix+1, D=iz*n1+ix+1;
  var u=clamp((x-P[A*3])/((P[D*3]-P[A*3])||1),0,1), v=clamp((z-P[A*3+2])/((P[B*3+2]-P[A*3+2])||1),0,1), wa,wb,wc,wd;
  if(u+v<=1){ wa=1-u-v; wd=u; wb=v; wc=0; } else { wc=u+v-1; wb=1-u; wd=1-v; wa=0; }
  if(out){ for(var k=0;k<3;k++) out[k]=wa*C[A*3+k]+wb*C[B*3+k]+wc*C[Cc*3+k]+wd*C[D*3+k]; }
  return wa*P[A*3+1]+wb*P[B*3+1]+wc*P[Cc*3+1]+wd*P[D*3+1];
}
function brookStations(sA, sB, fine){     /* arc-length stations: dense at the cascade, fine near the village */
  var out=[], s=sA, c=CATARACTS[0];
  while(s<sB){ out.push(s); var R=riverAt(s), dO=Math.hypot(R.x,R.z), dc=Math.abs(s-c.s);
    s += dc<c.run*0.8 ? 0.4 : (dc<c.run*1.6 ? 0.8 : (dO<450 ? 1.25 : (dO<800 ? 2.5 : (fine||dO<1700 ? 4 : 12)))); }
  out.push(sB); return out;
}
var brookBR = (typeof JUNGLE_BROOK!=='undefined' && JUNGLE_BROOK) ? JUNGLE_BROOK : null;
function brookLevelAt(s){ return brookBR ? brookBR.level(s) : riverLevel(s); }
var brookBed = (function(){
  if(!brookBR) return null;
  var LAT=[0,0.7,1.4,2.1,2.7,3.2,3.7,4.2,4.8,5.5,6.4,7.5,9,11,13.5,16.5,20,23.5,27,BROOK_FINE.W], cols=[];
  for(var k=LAT.length-1;k>0;k--) cols.push(-LAT[k]); for(k=0;k<LAT.length;k++) cols.push(LAT[k]);
  var S=brookStations(BROOK_FINE.s0, BROOK_FINE.s1, true), nc=cols.length, pos=[], col=[], uv=[], idx=[], cc=[0,0,0];
  var cBed=new THREE.Color(0x46432f).convertSRGBToLinear(), cBed2=new THREE.Color(0x6a6450).convertSRGBToLinear(), cMud=new THREE.Color(0x3a2a1c).convertSRGBToLinear(), cRock=new THREE.Color(PAL.rock[1]).convertSRGBToLinear(), tc=new THREE.Color();
  for(var i=0;i<S.length;i++){
    var s=S[i], R=riverAt(s), Ra=riverAt(s-14), Rb=riverAt(s+14), tx=Rb.x-Ra.x, tz=Rb.z-Ra.z, tl=Math.hypot(tx,tz)||1; tx/=tl; tz/=tl;
    var endK = Math.max(1-smooth(BROOK_FINE.s0, BROOK_FINE.s0+BROOK_FINE.taper, s), smooth(BROOK_FINE.s1-BROOK_FINE.taper, BROOK_FINE.s1, s));
    for(var j=0;j<nc;j++){
      var lat=cols[j], x=R.x-tz*lat, z=R.z+tx*lat, rv=polyNear(x,z,RIVER,RIVER_CUM), d=rv.d, st=rv.t, half=riverHalfAt(st), ck=cataractK(st);
      var yc=brookCoarse(x,z,cc)+0.10, bl=Math.max(smooth(BROOK_FINE.W-8, BROOK_FINE.W-0.5, Math.abs(lat)), endK);
      var det=(1-smooth(half+4,half+10,d)), yf=brookBR.ground(x,z) + det*(0.07*vn(x*1.7,z*1.7)+0.05*vn(x*4.3+9,z*4.3)-0.03);
      var y=Math.max(mix(yf,yc,bl), bl>0.999?yc:-1e9); if(d>half+9) y=Math.max(y,yc);
      pos.push(x,y,z); uv.push(x/9,z/9);
      tc.copy(groundTone(x,z)).convertSRGBToLinear();
      var wet=1-smooth(half+0.5, half+1.9, d), sub=1-smooth(half-0.2, half+0.8, d), pn=vn(x*2.3+5,z*2.3-7);
      tc.lerp(cMud, 0.75*wet); tc.lerp(tc.clone().copy(cBed).lerp(cBed2,pn), 0.92*sub); tc.lerp(cRock, 0.55*ck*(1-smooth(half+1,half+5,d)));
      tc.multiplyScalar(0.9+0.2*pn);
      col.push(mix(tc.r,cc[0],bl), mix(tc.g,cc[1],bl), mix(tc.b,cc[2],bl));
    }
  }
  for(var i3=0;i3<S.length-1;i3++) for(var j3=0;j3<nc-1;j3++){ var a=i3*nc+j3, b=a+1, c=a+nc, e=c+1; idx.push(a,c,b, b,c,e); }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
  var m=new THREE.Mesh(g, terrMat); m.receiveShadow=!FAST; m.frustumCulled=false; m.userData.inspectLabel='Brook bed'; m.userData.brookBed=true;
  scene.add(m); window._brook = { bedTris:idx.length/3, rows:S.length, cols:nc, s0:BROOK_FINE.s0, s1:BROOK_FINE.s1 };
  return m;
})();

/* ---- the river: a ribbon that follows the channel and steps down the cataracts ---- */
var waterUni = {
  uTime:{value:0}, uSun:{value:new THREE.Vector3(0.4,0.8,-0.4)}, uCam:{value:new THREE.Vector3()},
  uShallow:{value:new THREE.Color(PAL.riverShallow)}, uDeep:{value:new THREE.Color(PAL.riverDeep)},
  uSky:{value:new THREE.Color(0xa8c0b0)}, uFoam:{value:new THREE.Color(PAL.foam)},
  uFogCol:{value:new THREE.Color(PAL.haze)}, uFogDen:{value:PAL.fogDensity}, uDay:{value:1}
};
var water = (function(){
  var across = 6, pos=[], aux=[], fall=[], idx=[];
  var WS = brookStations(0, RIVER_LEN-0.02, false), ns = WS.length-1;
  for(var i=0;i<=ns;i++){
    var s=WS[i], R=riverAt(s), half=riverHalfAt(s)+(typeof RIVER_EDGE!=='undefined'?RIVER_EDGE:7), y=brookLevelAt(s), ck=cataractK(s), fk=brookBR?brookBR.fallK(s):0;
    for(var j=0;j<=across;j++){
      var v=j/across*2-1;
      pos.push(R.x - R.tz*half*v, y, R.z + R.tx*half*v);
      aux.push(s, v, ck); fall.push(fk);
    }
  }
  for(var i2=0;i2<ns;i2++) for(var j2=0;j2<across;j2++){
    var a=i2*(across+1)+j2, b=a+1, c=a+across+1, d=c+1;
    idx.push(a,c,b, b,c,d);
  }
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
      '  float fres = pow(1.0-clamp(dot(N,V),0.0,1.0), 3.0);',
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
  var m = new THREE.Mesh(g, mat); m.renderOrder=2; m.frustumCulled=false; m.userData.inspectLabel='Brook'; if(window._brook) window._brook.waterTris=idx.length/3;
  scene.add(m); return m;
})();
