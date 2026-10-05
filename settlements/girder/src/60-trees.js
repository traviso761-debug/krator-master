/* ============================== 14. TREES ==============================
   The hyperjungle's giant trees: bark-skinned trunks that follow trunkR(),
   buttresses and surface roots, every BRANCHES[] skeleton skinned and then
   grown on into secondary boughs and twigs, instanced alpha-tested leaf
   clumps (one InstancedMesh per species), ghostwood racemes, baobab pods,
   immature hypertrees in the undergrowth and the impostor far forest.
   Exports window._trees.                                                   */
reseed(600001);
(function(){
/* Girder: hypertrees are ~0.58x the Mav's Refuge size; every absolute length below is scaled to suit. */
var TREE_T0 = performance.now();
var TREE_TIME = { value:0 }, TREE_SUN = { value:new THREE.Vector3(0.45,0.72,-0.52).normalize() };
TICKS.push(function(dt){ TREE_TIME.value += dt; if(typeof SKY_STATE!=='undefined' && SKY_STATE.keyDir) TREE_SUN.value.copy(SKY_STATE.keyDir); });

/* ------------------------------------------------------------ species habits */
var TREE_HAB = [
  /* Ironbark  */ { lobes:[6,8], butA:1.25, butH:8,   butP:9,  secGap:10,  secStart:0.20, secLen:[0.30,0.46], secUp:0.02, secCurve:-0.10, terGap:9,   clumps:2.2, size:[13,19], flat:0.50, lift:0.10, topN:[4,6], topLen:[0.14,0.24], topEl:[0.15,0.5], fillN:0 },
  /* Ghostwood */ { lobes:[4,6], butA:0.45, butH:5.5, butP:4,  secGap:14,  secStart:0.38, secLen:[0.34,0.52], secUp:0.55, secCurve:0.16,  terGap:11,  clumps:1.7, size:[10,15],  flat:0.80, lift:0.25, topN:[4,5], topLen:[0.25,0.40], topEl:[0.8,1.2],  fillN:3 },
  /* Prism gum */ { lobes:[5,7], butA:0.80, butH:7,   butP:6,  secGap:11,  secStart:0.32, secLen:[0.40,0.60], secUp:0.22, secCurve:-0.16, terGap:9.5, clumps:2.4, size:[15,23], flat:0.55, lift:0.40, topN:[4,6], topLen:[0.40,0.70], topEl:[0.35,0.7], fillN:4 },
  /* Baobab    */ { lobes:[8,11],butA:0.22, butH:6,   butP:3,  secGap:10,  secStart:0.50, secLen:[0.26,0.38], secUp:0.35, secCurve:0.08,  terGap:9,   clumps:1.3, size:[8,12],  flat:0.70, lift:0.30, topN:[0,0], topLen:[0,0],       topEl:[0,0],     fillN:0 }
];
function treeBarkCol(sp, k){ return sp===2 ? (k===0?0xffffff:(k===1?shade(0xffffff,-0.08):shade(0xffffff,-0.16))) : PAL.bark[sp][k%PAL.bark[sp].length]; }

/* ------------------------------------------------------------ keep-clear volumes */
var treePl = PLATS.map(function(P){ return { P:P, x:P.x, z:P.z, R:P.R, top:P.y+14, bot:(P.yBottom!=null?P.yBottom:P.y-4)-4 }; });
var treeBr = BRIDGES.map(function(b){ return { b:b, ax:b.a.x, az:b.a.z, bx:b.b.x, bz:b.b.z, w:b.w||3,
  ylo:Math.min(b.a.y,b.b.y)-(b.sag||0)-6, yhi:Math.max(b.a.y,b.b.y)+9 }; });
function treeCtx(T, x, z, R){
  return { T:T,
    pl: treePl.filter(function(q){ return Math.hypot(q.x-x,q.z-z) < R+q.R+40; }),
    br: treeBr.filter(function(q){ return segDist(x,z,q.ax,q.az,q.bx,q.bz) < R+40; }),
    tw: TOWERS.filter(function(W){ return Math.hypot(W.x-x,W.z-z) < R+W.half*1.5+40; }) };
}
/* is a blob of horizontal radius `rad`, vertical half-extent `vr`, clear of the roost decks, bridges and towers? */
function treeClear(C, x,y,z, rad, vr){
  var i,q;
  for(i=0;i<C.pl.length;i++){ q=C.pl[i];
    if(y-vr < q.top && y+vr > q.bot){ var dx=x-q.x, dz=z-q.z, rr0=q.R+rad+1; if(dx*dx+dz*dz < rr0*rr0) return false; } }
  for(i=0;i<C.br.length;i++){ q=C.br[i];
    if(y-vr > q.yhi || y+vr < q.ylo) continue;
    var ex=q.bx-q.ax, ez=q.bz-q.az, t=clamp(((x-q.ax)*ex+(z-q.az)*ez)/(ex*ex+ez*ez),0,1);
    if(Math.hypot(x-q.ax-ex*t, z-q.az-ez*t) < rad+q.w*0.5+2.5){ var by=bridgeY(q.b,t); if(y-vr < by+7 && y+vr > by-4) return false; } }
  for(i=0;i<C.tw.length;i++){ q=C.tw[i]; if(y-vr < q.top+16 && Math.abs(x-q.x) < q.half+8+rad && Math.abs(z-q.z) < q.half+8+rad) return false; }
  return true;
}

/* ---- the Prism gum's rainbow bark was too loud: pull the planner's colour texture (and the palette tints
        used on the far trunks) ~30 % toward its own luminance ---- */
var TREE_DESAT = 0.30;
function treeDesat(hex, k){ var c=new THREE.Color(hex), l=0.30*c.r+0.59*c.g+0.11*c.b; c.r=mix(c.r,l,k); c.g=mix(c.g,l,k); c.b=mix(c.b,l,k); return c.getHex(); }
(function(){
  var tx=FAMMAT.bark2 && FAMMAT.bark2.tex, cv=tx && tx.image;
  if(!cv || !cv.getContext) return;
  var g=cv.getContext('2d'), im=g.getImageData(0,0,cv.width,cv.height), d=im.data;
  for(var o=0;o<d.length;o+=4){ var l=0.30*d[o]+0.59*d[o+1]+0.11*d[o+2];
    d[o]=mix(d[o],l,TREE_DESAT); d[o+1]=mix(d[o+1],l,TREE_DESAT); d[o+2]=mix(d[o+2],l,TREE_DESAT); }
  g.putImageData(im,0,0); tx.needsUpdate=true;
})();

/* ------------------------------------------------------------ textures */
function treeAlphaTex(S, draw, fillRGB){
  var c=texCanvas(S), g=c.getContext('2d'); g.clearRect(0,0,S,S); draw(g,S);
  var d=g.getImageData(0,0,S,S).data, out=new Uint8Array(S*S*4);
  for(var o=0;o<out.length;o+=4){ var a=d[o+3];
    if(a<48){ out[o]=fillRGB[0]; out[o+1]=fillRGB[1]; out[o+2]=fillRGB[2]; } else { out[o]=d[o]; out[o+1]=d[o+1]; out[o+2]=d[o+2]; }
    out[o+3]=a; }
  var t=new THREE.DataTexture(out,S,S,THREE.RGBAFormat);
  t.encoding=THREE.sRGBEncoding; t.generateMipmaps=true; t.minFilter=THREE.LinearMipmapLinearFilter; t.magFilter=THREE.LinearFilter;
  t.anisotropy = FAST?1:4; t.needsUpdate=true; return t;
}
function treeGrey(l){ l=clamp(Math.round(l),0,255); return 'rgb('+l+','+l+','+l+')'; }
function treeLeafShape(g, x,y, len, wid, ang, lum, rib){
  g.save(); g.translate(x,y); g.rotate(ang);
  g.fillStyle=treeGrey(lum); g.beginPath(); g.moveTo(0,0); g.quadraticCurveTo(len*0.45,wid,len,0); g.quadraticCurveTo(len*0.45,-wid,0,0); g.fill();
  if(rib){ g.strokeStyle=treeGrey(lum*0.72); g.lineWidth=1; g.beginPath(); g.moveTo(0,0); g.lineTo(len*0.92,0); g.stroke(); }
  g.restore();
}
var treeCl=[];
function treeClusters(S, n, k){ treeCl=[]; for(var i=0;i<n;i++){ var a=i/n*TAU+rr(-0.3,0.3), r=S*0.5*k*(i%3===0?rr(0.0,0.35):rr(0.55,1.0)); treeCl.push([S/2+Math.cos(a)*r, S/2+Math.sin(a)*r]); } }
function treeClPt(S, sd, lim){ var c=treeCl[Math.floor(rnd()*treeCl.length)], a=rr(0,TAU), r=sd*S*Math.sqrt(-2*Math.log(1-rnd()*0.98))*0.6;
  var x=c[0]+Math.cos(a)*r, y=c[1]+Math.sin(a)*r, d=Math.hypot(x-S/2,y-S/2), m=S*0.5*lim; if(d>m){ x=S/2+(x-S/2)*m/d; y=S/2+(y-S/2)*m/d; }
  return [x,y,Math.atan2(y-c[1],x-c[0])]; }
function treeDiscPt(S, k){ var a=rr(0,TAU), r=S*0.5*k*Math.sqrt(rnd()); return [S/2+Math.cos(a)*r, S/2+Math.sin(a)*r, a]; }
var TREE_LEAFTEX = [
  /* 0 Ironbark: combed needle sprays */
  treeAlphaTex(512, function(g,S){
    g.lineCap='round'; treeClusters(S,9,0.62);
    for(var i=0;i<70;i++){ var p=treeClPt(S,0.085,0.60), a=p[2]+rr(-0.8,0.8), L=rr(60,100), lum=mix(105,235,i/70)+rr(-20,20);
      var ex=p[0]+Math.cos(a)*L, ey=p[1]+Math.sin(a)*L;
      g.strokeStyle=treeGrey(lum*0.5); g.lineWidth=3; g.beginPath(); g.moveTo(p[0],p[1]); g.lineTo(ex,ey); g.stroke();
      g.lineWidth=2.6;
      for(var s=0;s<L;s+=4.2){ var t=s/L, nl=mix(27,9,t*t), bx=p[0]+Math.cos(a)*s, by=p[1]+Math.sin(a)*s;
        g.strokeStyle=treeGrey(lum*rr(0.82,1.08));
        for(var sd=-1;sd<=1;sd+=2){ var na=a+sd*rr(0.85,1.05); g.beginPath(); g.moveTo(bx,by); g.lineTo(bx+Math.cos(na)*nl, by+Math.sin(na)*nl); g.stroke(); } } }
  }, [120,120,120]),
  /* 1 Ghostwood: small round leaves, airy */
  treeAlphaTex(512, function(g,S){
    g.strokeStyle=treeGrey(80); g.lineWidth=2;
    for(var k=0;k<16;k++){ var p=treeDiscPt(S,0.5), q=treeDiscPt(S,0.9); g.beginPath(); g.moveTo(p[0],p[1]); g.quadraticCurveTo(S/2+rr(-90,90),S/2+rr(-90,90),q[0],q[1]); g.stroke(); }
    treeClusters(S,10,0.70);
    for(var i=0;i<380;i++){ var c=treeClPt(S,0.11,0.93), lum=mix(120,245,i/380)+rr(-22,12);
      g.fillStyle=treeGrey(lum); g.beginPath(); g.ellipse(c[0],c[1],rr(10,15),rr(8,11),rr(0,TAU),0,TAU); g.fill();
      g.strokeStyle=treeGrey(lum*0.75); g.lineWidth=1; g.beginPath(); g.moveTo(c[0]-5,c[1]); g.lineTo(c[0]+5,c[1]); g.stroke(); }
  }, [170,170,170]),
  /* 2 Prism gum: long lance leaves in drooping fans */
  treeAlphaTex(512, function(g,S){
    treeClusters(S,9,0.58);
    for(var i=0;i<76;i++){ var c=treeClPt(S,0.10,0.66), base=c[2]+rr(-1.2,1.2), lum=mix(110,240,i/76);
      g.strokeStyle=treeGrey(85); g.lineWidth=2; g.beginPath(); g.moveTo(c[0],c[1]); g.lineTo(c[0]-Math.cos(base)*26,c[1]-Math.sin(base)*26); g.stroke();
      for(var k=0;k<6;k++) treeLeafShape(g,c[0],c[1],rr(48,78),rr(7,10.5),base+rr(-0.95,0.95),lum+rr(-25,15),true); }
  }, [165,165,165]),
  /* 3 Baobab: broad palmate leaves */
  treeAlphaTex(512, function(g,S){
    treeClusters(S,8,0.60);
    for(var i=0;i<48;i++){ var c=treeClPt(S,0.10,0.74), lum=mix(115,240,i/48)+rr(-15,10), n=ri(5,7), a0=rr(0,TAU);
      for(var k=0;k<n;k++) treeLeafShape(g,c[0],c[1],rr(42,58),rr(15,20),a0+(k-(n-1)/2)*0.62,lum*rr(0.9,1.04),true); }
  }, [170,170,170])
];
/* ghostwood raceme: a hanging chain of violet blossoms (COLOUR texture; v=0 is the hung end) */
var TREE_FLOWERTEX = treeAlphaTex(256, function(g,S){
  var cols=PAL.flower.map(function(h){ return '#'+new THREE.Color(h).getHexString(); });
  [[0.5,1.0],[0.24,0.72],[0.77,0.80]].forEach(function(st,si){
    var x0=S*st[0], L=S*st[1];
    g.strokeStyle='#'+new THREE.Color(PAL.leaf[1][2]).getHexString(); g.lineWidth=2.4; g.beginPath(); g.moveTo(x0,0); g.lineTo(x0+rr(-6,6),L*0.95); g.stroke();
    for(var i=0;i<(si?70:120);i++){ var t=Math.pow(rnd(),0.8), y=mix(10,L-6,t), wv=mix(S*0.17,3,Math.pow(t,1.3)), x=x0+rr(-wv,wv), r=mix(9.5,4,t);
      g.fillStyle=cols[i%cols.length]; for(var p=0;p<5;p++){ var a=p/5*TAU+i; g.beginPath(); g.ellipse(x+Math.cos(a)*r*0.55,y+Math.sin(a)*r*0.55,r*0.62,r*0.42,a,0,TAU); g.fill(); }
      g.fillStyle='#f4e8c0'; g.beginPath(); g.arc(x,y,r*0.22,0,TAU); g.fill(); }
  });
}, [0x9a,0x6a,0xd8]);

/* ------------------------------------------------------------ materials */
function treeFoliageHook(o){
  return function(sh){
    sh.uniforms.uTreeT = TREE_TIME; sh.uniforms.uTreeSun = TREE_SUN;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTreeT;\nvarying vec3 vTreeWP;\nvarying float vTreeD;\n' +
               (o.aN ? 'attribute vec3 aN;\nvarying vec3 vTreeN;\n' : '') + (o.irid ? 'attribute vec3 aC2;\nvarying vec3 vTreeC2;\n' : ''))
      .replace('#include <project_vertex>', [
        'vec4 mvPosition = vec4(transformed, 1.0);',
        '#ifdef USE_INSTANCING',
        '  mvPosition = instanceMatrix * mvPosition;',
        '  float _ph = dot(instanceMatrix[3].xyz, vec3(0.131,0.073,0.117));',
        '#else',
        '  float _ph = 0.0;',
        '#endif',
        'float _wg = ' + o.swayW + ';',
        'mvPosition.xyz += _wg * vec3( sin(uTreeT*0.9+_ph) + 0.45*sin(uTreeT*2.3+_ph*1.7+position.x*5.0),',
        '                              0.40*sin(uTreeT*1.6+_ph*0.6+position.z*5.0),',
        '                              cos(uTreeT*0.7+_ph*1.3) + 0.45*sin(uTreeT*2.9+_ph+position.y*5.0) ) * ' + o.swayA.toFixed(3) + ';',
        'vTreeWP = (modelMatrix * mvPosition).xyz;',
        o.aN ? 'vTreeN = aN;' : '',
        o.irid ? 'vTreeC2 = aC2;' : '',
        'mvPosition = modelViewMatrix * mvPosition;',
        'vTreeD = -mvPosition.z;',
        'gl_Position = projectionMatrix * mvPosition;' ].join('\n'));
    if(o.aN) sh.vertexShader = sh.vertexShader.replace('#include <defaultnormal_vertex>', 'vec3 transformedNormal = normalize(normalMatrix * aN);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uTreeT;\nuniform vec3 uTreeSun;\nvarying vec3 vTreeWP;\nvarying float vTreeD;\n' +
               (o.aN ? 'varying vec3 vTreeN;\n' : '') + (o.irid ? 'varying vec3 vTreeC2;\n' : ''))
      .replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.a *= 1.0 + clamp(vTreeD/650.0, 0.0, 1.1);');
    if(o.aN) sh.fragmentShader = sh.fragmentShader
      .replace('reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;', 'reflectedLight.indirectDiffuse += 0.72*vIndirectFront + 0.28*vIndirectBack;')
      .replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;', 'reflectedLight.directDiffuse = vLightFront + 0.30*vLightBack;');
    if(o.irid) sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', [
        '#include <color_fragment>',
        '{ vec3 _V = normalize(cameraPosition - vTreeWP); vec3 _N = normalize(vTreeN);',
        '  float _fr = 1.0 - abs(dot(_N,_V));',
        '  float _sf = dot(_N, uTreeSun)*0.5 + 0.5;',
        '  float _sh = 0.16*sin(uTreeT*0.8 + dot(vTreeWP, vec3(0.045,0.083,0.037))) + 0.08*sin(uTreeT*1.9 + dot(vTreeWP, vec3(-0.21,0.13,0.17)));',
        '  float _k = smoothstep(0.22, 0.78, _sf*1.15 - _fr*0.80 + 0.12 + _sh);',
        '  diffuseColor.rgb *= mix(vTreeC2, vColor, _k) / max(vColor, vec3(0.004)); }' ].join('\n'));
  };
}
/* ---- the library cards (materials.json leaf0..leaf3, flower): the painters above still run, so the random
        stream every later tree draws from is unchanged; ?mat=proc keeps the painted textures ---- */
(function(){
  if(KMAT.mode !== 'lib') return;
  function card(name){ var L = KMAT.packed('girder', name); if(!L) return null;
    var t = KMAT.textures(L, { aniso: FAST ? 1 : 4, flipY: false }).map;
    t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; return t; }
  for(var sp=0; sp<4; sp++){ var t = card('leaf'+sp); if(t) TREE_LEAFTEX[sp] = t; }
  var fl = card('flower'); if(fl) TREE_FLOWERTEX = fl;
})();
function treeLeafMat(sp){
  var m = new THREE.MeshLambertMaterial({ color:0xffffff, map:TREE_LEAFTEX[sp], alphaTest:0.42, side:THREE.DoubleSide });
  return nlMaterial(m, 'treeleaf'+sp, treeFoliageHook({ aN:true, irid:sp===2, swayW:'1.0', swayA:0.20 }), 'vTreeWP');
}

/* leaf clump: a tripod of three tilted unit quads */
function treeClumpGeo(){
  var pos=[], uv=[], nor=[];
  for(var k=0;k<3;k++){
    var az=k/3*TAU+0.3, tilt=0.92, ca=Math.cos(az), sa=Math.sin(az);
    var n=[Math.sin(tilt)*ca, Math.cos(tilt), Math.sin(tilt)*sa], u=[-sa,0,ca], v=[-Math.cos(tilt)*ca, Math.sin(tilt), -Math.cos(tilt)*sa];
    var c=[n[0]*0.10, n[1]*0.10-0.04, n[2]*0.10];
    var P=[[-0.5,-0.5],[0.5,-0.5],[0.5,0.5],[-0.5,0.5]].map(function(q){ return [c[0]+u[0]*q[0]+v[0]*q[1], c[1]+u[1]*q[0]+v[1]*q[1], c[2]+u[2]*q[0]+v[2]*q[1], q[0]+0.5, q[1]+0.5]; });
    [0,1,2,0,2,3].forEach(function(i){ pos.push(P[i][0],P[i][1],P[i][2]); uv.push(P[i][3],P[i][4]); nor.push(n[0],n[1],n[2]); });
  }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  return g;
}
/* hanging raceme: two crossed quads, local y 0 (hung) .. -1 */
function treeRacemeGeo(){
  var pos=[], uv=[], nor=[];
  for(var k=0;k<2;k++){ var ca=Math.cos(k*Math.PI/2+0.4), sa=Math.sin(k*Math.PI/2+0.4);
    var P=[[-0.5,0],[0.5,0],[0.5,-1],[-0.5,-1]].map(function(q){ return [ca*q[0], q[1], sa*q[0], q[0]+0.5, -q[1]]; });
    [0,2,1,0,3,2].forEach(function(i){ pos.push(P[i][0],P[i][1],P[i][2]); uv.push(P[i][3],P[i][4]); nor.push(-sa,0,ca); }); }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  return g;
}
/* baobab pod on its stalk: local y 0 (hung) .. -1, vertex-coloured (stalk dark, pod white) */
function treePodGeo(){
  var parts=[ [new THREE.CylinderGeometry(0.012,0.012,0.50,3,1,true).translate(0,-0.25,0), 0.16],
              [new THREE.SphereGeometry(0.15,6,4).scale(1,1.75,1).translate(0,-0.735,0), 1.0] ];
  var pos=[], nor=[], col=[], uv=[];
  parts.forEach(function(p){ var g=p[0].toNonIndexed(), a=g.attributes.position.array, b=g.attributes.normal.array, u=g.attributes.uv.array;
    for(var i=0;i<a.length;i+=3){ pos.push(a[i],a[i+1],a[i+2]); nor.push(b[i],b[i+1],b[i+2]);
      var sh = p[1]===1.0 ? (0.78+0.22*Math.sin(Math.atan2(a[i+2],a[i])*5)) * mix(0.72,1.0,clamp((a[i+1]+1)/0.5,0,1)) : p[1]; col.push(sh,sh,sh); }
    for(var j=0;j<u.length;j++) uv.push(u[j]); });
  var g2=new THREE.BufferGeometry();
  g2.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g2.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g2.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g2.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  return g2;
}

/* ------------------------------------------------------------ instance stores */
function treeStore(){ return { m:[], c:[], n:[], c2:[], count:0 }; }
var treeFol=[treeStore(),treeStore(),treeStore(),treeStore()], treeFlw=treeStore(), treePod=treeStore();
var _tm=new THREE.Matrix4(), _tq=new THREE.Quaternion(), _te=new THREE.Euler(), _tp=new THREE.Vector3(), _ts=new THREE.Vector3(), _tc=new THREE.Color();
function treeInst(S, x,y,z, rx,ry,rz, sx,sy,sz, colHex, mul, nrm, col2Hex){
  _te.set(rx,ry,rz,'YXZ'); _tq.setFromEuler(_te); _tp.set(x,y,z); _ts.set(sx,sy,sz); _tm.compose(_tp,_tq,_ts);
  var e=_tm.elements; for(var i=0;i<16;i++) S.m.push(e[i]);
  _tc.set(colHex).convertSRGBToLinear(); S.c.push(Math.min(1,_tc.r*mul),Math.min(1,_tc.g*mul),Math.min(1,_tc.b*mul));
  if(nrm) S.n.push(nrm[0],nrm[1],nrm[2]);
  if(col2Hex!=null){ _tc.set(col2Hex).convertSRGBToLinear(); S.c2.push(Math.min(1,_tc.r*mul),Math.min(1,_tc.g*mul),Math.min(1,_tc.b*mul)); }
  S.count++;
}
function treeEmit(S, geo, mat, label, opt){
  if(!S.count) return null;
  opt=opt||{};
  if(S.n.length) geo.setAttribute('aN', new THREE.InstancedBufferAttribute(new Float32Array(S.n),3));
  if(S.c2.length) geo.setAttribute('aC2', new THREE.InstancedBufferAttribute(new Float32Array(S.c2),3));
  var im=new THREE.InstancedMesh(geo, mat, S.count);
  im.instanceMatrix.array.set(S.m); im.instanceMatrix.needsUpdate=true;
  im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(S.c),3);
  im.frustumCulled=false; im.receiveShadow=!FAST; im.castShadow=!FAST && !!opt.cast;
  if(opt.depthMap) im.customDepthMaterial=new THREE.MeshDepthMaterial({ depthPacking:THREE.RGBADepthPacking, map:opt.depthMap, alphaTest:0.42 });
  im.userData.inspectLabel=label; im.userData.trees=true;
  scene.add(im);
  var tris=geo.attributes.position.count/3*S.count; S.m=S.c=S.n=S.c2=null; return tris;
}

/* ------------------------------------------------------------ polyline helpers */
function treeCum(pts){ var c=[0]; for(var i=1;i<pts.length;i++) c.push(c[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y,pts[i].z-pts[i-1].z)); return c; }
function treePolyAt(pts, cum, s){
  var i=1; while(i<pts.length-1 && cum[i]<s) i++;
  var a=pts[i-1], b=pts[i], L=(cum[i]-cum[i-1])||1, t=clamp((s-cum[i-1])/L,0,1);
  return { x:mix(a.x,b.x,t), y:mix(a.y,b.y,t), z:mix(a.z,b.z,t), r:mix(a.r,b.r,t), tx:(b.x-a.x)/L, ty:(b.y-a.y)/L, tz:(b.z-a.z)/L };
}
/* a bough from `o` along unit `d`: gentle gravity/phototropic curve and sideways wiggle */
function treeGrow(o, d, len, r0, r1, n, curve, wig){
  var sx=-d[2], sz=d[0], sl=Math.hypot(sx,sz)||1; sx/=sl; sz/=sl;
  var w1=rr(-1,1)*wig, w2=rr(-1,1)*wig, pts=[];
  for(var k=0;k<=n;k++){ var t=k/n, w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
    pts.push({ x:o.x+d[0]*len*t+sx*w, y:o.y+d[1]*len*t+curve*len*t*t, z:o.z+d[2]*len*t+sz*w, r:mix(r0,r1,Math.pow(t,0.8)) }); }
  return pts;
}
function treeDir(tx,ty,tz, side, a,b,c){
  var sx=-tz*side, sz=tx*side, sl=Math.hypot(sx,sz)||1; sx/=sl; sz/=sl;
  var x=tx*a+sx*b, y=ty*a+c, z=tz*a+sz*b, l=Math.hypot(x,y,z)||1; return [x/l,y/l,z/l];
}
/* TUBE with a constant texture repeat along its whole length (no shear bands where the radius changes) */
function treeTube(fam, pts, col, seg, cap, rfn){
  var rt = pts[Math.min(pts.length-1, Math.floor(pts.length*0.3))].r, P=pts.map(function(p){ return { x:p.x,y:p.y,z:p.z,r:rt,col:p.col,_r:p.r }; });
  TUBE(fam, P, col, { seg:seg, cap:cap, rfn:function(i,ang,pt){ return pt._r/rt*(rfn?rfn(i,ang,pt):1); } });
  return (pts.length-1)*seg*2 + (cap?seg*2:0);
}

/* A lathe surface written straight into the kit's merged bucket for `fam` (same path TUBE/MTRI take), but with
   true surface normals (so buttress fins shade), absolute v, and one texture repeat count per section.
   rings[i] = { x,y,z, yy, col }, radius = rad(ring, ang), ao = aof(ring, ang). */
var _lc=new THREE.Color();
function treeLathe(fam, rings, seg, rep, vs, rad, aof){
  var K=mbGet(fam), n=rings.length, P=[], i, s;
  for(i=0;i<n;i++){ var row=[]; for(s=0;s<seg;s++){ var a=s/seg*TAU, r=rad(rings[i],a); row.push([rings[i].x+Math.cos(a)*r, rings[i].y, rings[i].z+Math.sin(a)*r]); } P.push(row); }
  var V=[];
  for(i=0;i<n;i++){ var vr=[]; _lc.set(rings[i].col).convertSRGBToLinear();
    for(s=0;s<=seg;s++){ var s0=s%seg, pa=P[i][(s0+1)%seg], pb=P[i][(s0+seg-1)%seg], pu=P[Math.min(n-1,i+1)][s0], pd=P[Math.max(0,i-1)][s0];
      var ax=pa[0]-pb[0], ay=pa[1]-pb[1], az=pa[2]-pb[2], ux=pu[0]-pd[0], uy=pu[1]-pd[1], uz=pu[2]-pd[2];
      var nx=uy*az-uz*ay, ny=uz*ax-ux*az, nz=ux*ay-uy*ax, nl=Math.hypot(nx,ny,nz)||1, ao=aof?aof(rings[i],s0/seg*TAU):1;
      vr.push({ p:P[i][s0], n:[nx/nl,ny/nl,nz/nl], u:s/seg*rep, v:rings[i].yy/vs, c:[_lc.r*ao,_lc.g*ao,_lc.b*ao] }); }
    V.push(vr); }
  function pv(q){ K.pos.push(q.p[0],q.p[1],q.p[2]); K.nor.push(q.n[0],q.n[1],q.n[2]); K.uv.push(q.u,q.v); K.col.push(q.c[0],q.c[1],q.c[2]); }
  for(i=0;i<n-1;i++) for(s=0;s<seg;s++){ var a0=V[i][s], a1=V[i][s+1], b0=V[i+1][s], b1=V[i+1][s+1];
    pv(a0); pv(b1); pv(a1);  pv(a0); pv(b0); pv(b1); K.tris+=2; }
  return (n-1)*seg*2;
}

/* the palisaded clearing and the two gate tracks stay free of roots and saplings */
function treeKeepOut(x,z,pad){
  var i; for(i=0;i<CLEARINGS.length;i++){ var c=CLEARINGS[i]; if(Math.hypot(x-c[0],z-c[1]) < c[2]+pad) return true; }
  for(i=0;i<GATES.length;i++){ var g=GATES[i]; if(segDist(x,z,g.x,g.z,g.x*2.3,g.z*2.3) < 7+pad) return true; }
  return false;
}
/* ------------------------------------------------------------ near trees */
var TS = { trunkTris:0, limbTris:0, boughTris:0, twigTris:0, rootTris:0, boughs:0, twigs:0, roots:0, topBoughs:0, saplings:0, sapTris:0, farTris:0, spots:0 };
var treeLimbsOf = TREES.map(function(){ return []; });
BRANCHES.forEach(function(B){ treeLimbsOf[TREES.indexOf(B.tree)].push({ pts:B.pts, kind:B.kind, mine:false }); });

TREES.forEach(function(T, ti){
  var sp=T.sp, Hb=TREE_HAB[sp], fam='bark'+sp, vs=(FAMMAT[fam].scale||[10,20])[1];
  var C=treeCtx(T, T.x, T.z, T.crownR+40);
  REGISTER({ name:SPECIES[sp].name, kind:'tree', label:'Hypertree'+(SPECIES[sp].harvest ? ', bears '+SPECIES[sp].harvest.fruit.toLowerCase()+'s' : ''),
    harvest:SPECIES[sp].harvest||null, x:T.x, z:T.z, y:T.y0, h:T.H, r:trunkR(T,T.y0+60)+2 });

  /* ---- trunk: sections between multiples of the texture height, each with a constant repeat ---- */
  var topU = sp===3 ? 0.925 : 0.985, Hend=T.H*topU, half=vs*0.5, ys=[], k;
  for(k=0;k*half<Hend-3;k++) ys.push(k*half);
  [1.2,3,5.5,8.5,11,14,16.5,21,27].forEach(function(v){ if(Math.abs(v/half-Math.round(v/half))*half > 1.0) ys.push(v); });
  ys.push(Hend); ys.sort(function(a,b){ return a-b; });
  var nl=ri(Hb.lobes[0],Hb.lobes[1]), lobes=[], la=rr(0,TAU);
  for(k=0;k<nl;k++) lobes.push({ a:la+k/nl*TAU+rr(-0.22,0.22), amp:rr(0.55,1.2), p:Hb.butP*rr(0.8,1.3) });
  var ph1=rr(0,TAU), ph2=rr(0,TAU), leanA=rr(0,TAU), leanK=sp===3?0:rr(2,5);
  function lobeSum(ang){ var sm=0; for(var j=0;j<lobes.length;j++){ var c=Math.cos(ang-lobes[j].a); if(c>0) sm+=lobes[j].amp*Math.pow(c,lobes[j].p); } return sm; }
  function butF(yy){ return yy<27 ? Hb.butA*Math.exp(-yy/Hb.butH)*clamp((27-yy)/11,0,1) : 0; }
  function trunkMul(yy, ang){
    var m = 1 + 0.010*Math.sin(3*ang+yy*0.045+ph1) + 0.007*Math.sin(7*ang-yy*0.10+ph2);
    if(yy<27) m += butF(yy)*lobeSum(ang);
    return m;
  }
  function trunkPt(yy){
    var u=yy/T.H, r=trunkR(T,T.y0+yy), off=0;
    if(sp!==3){ r *= 1 - 0.72*smooth(0.93,0.985,u); off = leanK*Math.pow(clamp((u-0.88)/0.105,0,1),2); }
    var moss=smooth(21,2.5,yy), c=treeBarkCol(sp,(Math.floor(yy/22)+ti)%3);
    if(moss>0.01){ var c1=new THREE.Color(c), c2=new THREE.Color(sp===2?shade(PAL.moss[1],0.45):PAL.moss[ti%3]); c=c1.lerp(c2, moss*(sp===1?0.35:0.55)).getHex(); }
    return { x:T.x+Math.cos(leanA)*off, y:T.y0+yy, z:T.z+Math.sin(leanA)*off, r:Math.max(0.3,r), col:c, yy:yy };
  }
  var rings=ys.map(trunkPt), rtop=rings[rings.length-1];
  if(sp===3) [[1.8,0.93],[3.6,0.74],[5.1,0.45],[6,0.12],[6.3,0.004]].forEach(function(d){ var q=trunkPt(Hend); q.y+=d[0]; q.yy+=d[0]; q.r=rtop.r*d[1]; rings.push(q); });
  else { var q9=trunkPt(Hend); q9.y+=1.0; q9.yy+=1.0; q9.r=0.03; rings.push(q9); }
  var i0=0, sc0=(FAMMAT[fam].scale||[10,20])[0];
  while(i0 < rings.length-1){
    var i1=i0+1; while(i1<rings.length-1 && rings[i1].r/rings[i0].r > 0.78 && rings[i1].r/rings[i0].r < 1.25) i1++;
    var rm=(rings[i0].r+rings[i1].r)*0.5, seg=rm>2.2?28:14;
    TS.trunkTris += treeLathe(fam, rings.slice(i0,i1+1), seg, Math.max(1,Math.round(TAU*rm/sc0)), vs,
      function(R,ang){ return R.r*trunkMul(R.yy,ang); },
      function(R,ang){ var f=clamp(butF(R.yy)*1.6,0,1); return f>0 ? mix(1, 0.50+0.50*clamp(lobeSum(ang)*1.4,0,1), f) : 1; });
    i0=i1;
  }

  /* ---- surface roots, one off each buttress ---- */
  var rootCol = trunkPt(1.5).col;   /* a root takes the trunk's own tint at its height above the ground (band and moss): where it leaves the trunk it matches the trunk there, and on the ground it matches the mossy base */
  lobes.forEach(function(L){
    if(sp===3 && chance(0.45)) return;
    var ang=L.a;
    var R0=trunkR(T,T.y0+7)*(1+Hb.butA*0.35*L.amp), len=rr(26,70)*(sp===3?0.6:1)*(0.6+0.4*L.amp), rr0=clamp(T.rb*0.17*L.amp,1.0,3.2), pts=[], a=ang, wob=rr(0,TAU);
    for(var k=0;k<=9;k++){ var t=k/9, d=R0*0.72+len*t; a=ang+0.32*Math.sin(wob+t*5.2)*t+0.10*Math.sin(wob*2+t*11);
      var x=T.x+Math.cos(a)*d, z=T.z+Math.sin(a)*d; if(k>1 && (riverDist(x,z)<3.5 || treeKeepOut(x,z,2))) break;
      var r=mix(rr0,0.22,Math.pow(t,0.75)); pts.push({ x:x, y:terrainH(x,z)+r*(k===0?1.6:0.22)+(k===0?3:0), z:z, r:r, col:trunkPt(r*(k===0?1.6:0.22)+(k===0?3:0)).col }); }
    if(pts.length>3){ TS.rootTris += treeTube(fam, pts, rootCol, 6, false); TS.roots++; }
  });

  /* ---- top boughs and crown fillers of my own ---- */
  var mine=[], nTop=ri(Hb.topN[0],Hb.topN[1]), a0=rr(0,TAU);
  function ownBough(u, ang, len, el, curve, rScale){
    var ys0=T.y0+T.H*u, r0=trunkR(T,ys0)*(u>0.93?0.6:1), rb=clamp(r0*rScale,0.55,3.3);
    var o={ x:T.x+Math.cos(ang)*Math.max(0,r0-1), y:ys0, z:T.z+Math.sin(ang)*Math.max(0,r0-1) };
    var d=[Math.cos(ang)*Math.cos(el), Math.sin(el), Math.sin(ang)*Math.cos(el)];
    var pts=treeGrow(o,d,len,rb,0.3,7,curve,0.06);
    for(var i=1;i<pts.length;i++) if(!treeClear(C,pts[i].x,pts[i].y,pts[i].z,pts[i].r+3,pts[i].r+3)) return;
    mine.push({ pts:pts, kind:'limb', mine:true });
  }
  for(k=0;k<nTop;k++) ownBough(rr(0.855,0.955), a0+k*2.399963+rr(-0.3,0.3), T.crownR*rr(Hb.topLen[0],Hb.topLen[1]), rr(Hb.topEl[0],Hb.topEl[1]), sp===1?0.10:-0.12, 0.62);
  for(k=0;k<Hb.fillN;k++) ownBough(rr(0.72,0.86), a0+1.2+k*2.399963+rr(-0.3,0.3), T.crownR*rr(0.55,0.85), sp===1?rr(0.7,1.0):rr(0.3,0.55), sp===1?0.04:-0.14, 0.42);
  TS.topBoughs += mine.length;
  var limbs = treeLimbsOf[ti].concat(mine);

  /* ---- skin the limbs; grow boughs and twigs; collect foliage spots ---- */
  var yMinFol = T.y0+T.H*T.crown0-17;
  var spots=[], hangs=[];
  limbs.forEach(function(Lm){
    var pts=Lm.pts, r0=pts[0].r, n=pts.length;
    var lc = trunkPt(clamp(pts[0].y - T.y0, 0, Hend)).col;   /* the trunk's tint where this limb leaves it, kept along the limb and its boughs and twigs */
    var cpts=pts.map(function(p,i){ return { x:p.x,y:p.y,z:p.z,r:p.r, col:lc }; });
    TS.limbTris += treeTube(fam, cpts, lc, r0>=4.5?10:(r0>=2.6?8:6), true);
    var cum=treeCum(pts), L=cum[n-1], sStart=L*Hb.secStart, side=chance(0.5)?1:-1;
    for(var s=sStart+rr(0,Hb.secGap*0.5); s<L*0.985; s+=Hb.secGap*rr(0.75,1.3)){
      var at=treePolyAt(pts,cum,s), t=s/L; side=-side;
      var len1=Math.max(8.5, L*rr(Hb.secLen[0],Hb.secLen[1])*(1-0.5*t)) * (sp===3?0.8:1);
      var d1=treeDir(at.tx,at.ty,at.tz, side, rr(0.45,0.8), rr(0.7,1.1), Hb.secUp+rr(-0.12,0.18));
      var rS=clamp(Math.min(at.r*0.62, len1*0.032),0.25,1.6);
      var sec=treeGrow(at,d1,len1,rS,0.14,4,Hb.secCurve+rr(-0.05,0.05),0.07), ok=true;
      for(var q=1;q<sec.length;q++) if(!treeClear(C,sec[q].x,sec[q].y,sec[q].z,sec[q].r+2.5,sec[q].r+2.5)){ ok=false; break; }
      if(!ok) continue;
      TS.boughTris += treeTube(fam, sec, lc, rS>0.9?5:4, false); TS.boughs++;
      var sprd=clamp(len1*0.26,5,12);
      spots.push({ p:sec[2], s:sprd, inner:true }, { p:sec[3], s:sprd }, { p:sec[4], s:sprd*0.9, tip:true });
      if(sp===3 && chance(0.8)) hangs.push({ x:sec[1].x, y:sec[1].y-sec[1].r*0.7, z:sec[1].z });
      if(sp===3 && chance(0.6)) hangs.push({ x:sec[2].x, y:sec[2].y-sec[2].r*0.7, z:sec[2].z });
      /* twigs */
      var cum1=treeCum(sec), L1=cum1[4], sd2=chance(0.5)?1:-1;
      for(var s2=L1*0.3+rr(0,Hb.terGap*0.5); s2<L1*0.95; s2+=Hb.terGap*rr(0.8,1.3)){
        var a2=treePolyAt(sec,cum1,s2); sd2=-sd2;
        var len2=Math.max(5, len1*rr(0.3,0.5)*(1-0.4*s2/L1));
        var d2=treeDir(a2.tx,a2.ty,a2.tz, sd2, rr(0.5,0.9), rr(0.6,1.0), Hb.secUp*0.8+rr(-0.15,0.25));
        var tw=treeGrow(a2,d2,len2,Math.max(0.15,a2.r*0.6),0.08,2,Hb.secCurve,0.05);
        if(!treeClear(C,tw[2].x,tw[2].y,tw[2].z,2.5,2.5) || !treeClear(C,tw[1].x,tw[1].y,tw[1].z,2.5,2.5)) continue;
        TS.twigTris += treeTube(fam, tw, lc, 3, false); TS.twigs++;
        spots.push({ p:tw[1], s:clamp(len2*0.4,3.6,8) }, { p:tw[2], s:clamp(len2*0.45,3.6,8.5), tip:true });
        if(sp===1 && chance(0.55)) hangs.push({ x:tw[2].x, y:tw[2].y-0.5, z:tw[2].z });
        if(sp===1 && chance(0.30)) hangs.push({ x:tw[1].x, y:tw[1].y-0.5, z:tw[1].z });
      }
    }
    var tip=pts[n-1]; spots.push({ p:tip, s:6.5, tip:true }, { p:pts[n-2], s:6 });
    if(sp===3) for(var h=0;h<3;h++){ var ah=treePolyAt(pts,cum,L*rr(0.35,0.95)); hangs.push({ x:ah.x, y:ah.y-ah.r*0.8, z:ah.z }); }
  });
  /* leader tuft */
  if(sp!==3){ var tp=trunkPt(Hend); for(k=0;k<3;k++) spots.push({ p:{x:tp.x,y:tp.y-k*5.5,z:tp.z}, s:6+k*2, tip:k===0 }); }
  else spots.push({ p:{x:T.x,y:T.y0+Hend+7,z:T.z}, s:8.5, tip:true });
  TS.spots += spots.length;

  /* ---- foliage ---- */
  var bb=[1e9,-1e9,1e9,-1e9,1e9,-1e9];
  spots.forEach(function(s){ var p=s.p; bb[0]=Math.min(bb[0],p.x); bb[1]=Math.max(bb[1],p.x); bb[2]=Math.min(bb[2],p.y); bb[3]=Math.max(bb[3],p.y); bb[4]=Math.min(bb[4],p.z); bb[5]=Math.max(bb[5],p.z); });
  var cx=T.x, cz=T.z, cy=mix(bb[2],bb[3],0.42), ex=Math.max(24,(bb[1]-bb[0])*0.5,(bb[5]-bb[4])*0.5), ey=Math.max(18,(bb[3]-bb[2])*0.58);
  var F=treeFol[sp], LC=PAL.leaf[sp];
  spots.forEach(function(s){
    var nC = Hb.clumps*(s.tip?1.15:1)*(s.inner?0.8:1), cnt=Math.floor(nC)+(chance(nC-Math.floor(nC))?1:0);
    for(var c=0;c<cnt;c++){
      var size=rr(Hb.size[0],Hb.size[1])*(s.inner?1.12:1), a=rr(0,TAU), rd=s.s*Math.sqrt(rnd());
      var x=s.p.x+Math.cos(a)*rd, z=s.p.z+Math.sin(a)*rd, y=s.p.y+s.s*(Hb.lift+rr(-0.35,0.45))*(s.inner?0.5:1);
      if(y < yMinFol && !(s.tip && y > yMinFol-18)) continue;
      if(!treeClear(C,x,y,z,size*0.55,size*0.5*Hb.flat+2)) continue;
      var dx=(x-cx)/ex, dy=(y-cy)/ey, dz=(z-cz)/ex, q=Math.hypot(dx,dy,dz);
      var ao=mix(0.42,1.0,smooth(0.30,0.95,q))*mix(0.78,1.0,smooth(-0.6,0.35,dy))*(s.inner?0.72:1)*rr(0.86,1.12);
      var nx=dx*0.9+rr(-0.3,0.3), ny=dy*0.7+0.75+rr(-0.15,0.2), nz=dz*0.9+rr(-0.3,0.3), nn=Math.hypot(nx,ny,nz)||1;
      var ci = sp===2 ? ri(0,1) : ri(0,LC.length-1);
      treeInst(F, x,y,z, rr(-0.3,0.3),a*3.1,rr(-0.3,0.3), size,size*Hb.flat,size, LC[ci], 1.25*ao, [nx/nn,ny/nn,nz/nn], sp===2?LC[2+ri(0,1)]:null);
    }
  });
  /* ---- flowers / fruit ---- */
  hangs.forEach(function(h){
    if(h.y < yMinFol-12) return;
    if(sp===1){ var Lr=rr(6,11); if(!treeClear(C,h.x,h.y-Lr*0.5,h.z,3,Lr*0.5+1)) return;
      treeInst(treeFlw, h.x,h.y,h.z, 0,rr(0,TAU),0, Lr*0.42,Lr,Lr*0.42, 0xffffff, rr(0.8,1.0), [rr(-0.3,0.3),0.9,rr(-0.3,0.3)]); }
    else { var Lp=rr(9,14); if(!treeClear(C,h.x,h.y-Lp*0.5,h.z,3,Lp*0.5+1)) return;
      treeInst(treePod, h.x,h.y,h.z, rr(-0.08,0.08),rr(0,TAU),rr(-0.08,0.08), Lp,Lp,Lp, pick(PAL.fruit), rr(0.9,1.1)); }
  });
});

/* ------------------------------------------------------------ immature hypertrees */
var TREE_SAPLINGS=[];
(function(){
  var tries=0;
  while(TREE_SAPLINGS.length<70 && tries++<6000){
    var x=rr(-1400,1400), z=rr(-1400,1400);
    if(tries<2500 && Math.hypot(x,z)>800) continue;                        /* favour the village's neighbourhood first */
    var H=15+50*Math.pow(rnd(),1.5), near=null, nd=1e9, ok=true, i;
    for(i=0;i<TREES.length;i++){ var T=TREES[i], d=Math.hypot(T.x-x,T.z-z); if(d<nd){ nd=d; near=T; } if(d < trunkR(T,T.y0+5)*1.5+36) ok=false; }
    if(!ok) continue;
    var sp = chance(0.65) ? near.sp : ri(0,3), cr=H*[0.20,0.24,0.34,0.24][sp]+2, g=terrainH(x,z);
    if(riverDist(x,z) <= cr*0.6+8) continue;
    if(treeKeepOut(x,z,cr+4)) continue;
    for(i=0;i<TREE_SAPLINGS.length && ok;i++){ var S=TREE_SAPLINGS[i]; if(Math.hypot(S.x-x,S.z-z) < (S.cr+cr)*0.9+4) ok=false; }
    if(!ok) continue;
    TREE_SAPLINGS.push({ x:x, z:z, y0:g-1, H:H, sp:sp, cr:cr });
  }
  var sapLeaf=PAL.sapling;
  TREE_SAPLINGS.forEach(function(S, si){
    var sp=S.sp, fam='bark'+sp, H=S.H, rb=H*(sp===3?0.085:0.032)+0.25, lean=rr(0,TAU), lk=rr(0,0.06)*H, pts=[], k;
    for(k=0;k<=7;k++){ var u=k/7, r = sp===3 ? rb*(u<0.55?mix(1,1.1,u/0.55):mix(1.1,0.18,smooth(0.55,1,u))) : rb*mix(1.0,0.12,Math.pow(u,0.85))*(1+0.6*Math.exp(-u*H/4));
      pts.push({ x:S.x+Math.cos(lean)*lk*u*u+Math.sin(u*5+si)*0.4, y:S.y0+H*u*(sp===3?0.9:1), z:S.z+Math.sin(lean)*lk*u*u, r:Math.max(0.15,r) }); }
    TS.sapTris += treeTube(fam, pts, treeBarkCol(sp,si%3), 7, true);
    REGISTER({ name:'Young '+SPECIES[sp].name.toLowerCase(), kind:'tree', label:'Immature hypertree', x:S.x, z:S.z, y:S.y0, h:H, r:rb+1.5 });
    var Hb=TREE_HAB[sp], nB=ri(5,8), a=rr(0,TAU), spots=[], LC=PAL.leaf[sp];
    var band = sp===0?[0.30,0.92]:sp===1?[0.42,0.9]:sp===2?[0.55,0.9]:[0.78,0.9];
    for(k=0;k<nB;k++){ a+=2.399963+rr(-0.3,0.3); var u2=mix(band[0],band[1],(k+rr(0,0.8))/nB), i2=Math.min(6,Math.floor(u2*7)), bp=pts[i2], bq=pts[i2+1], f=u2*7-i2;
      var o={ x:mix(bp.x,bq.x,f), y:mix(bp.y,bq.y,f), z:mix(bp.z,bq.z,f) }, tk=(u2-band[0])/(band[1]-band[0]);
      var len=S.cr*(sp===0?mix(1.0,0.35,tk):rr(0.7,1.0)), el=sp===0?rr(0.0,0.3):sp===1?rr(0.7,1.1):sp===2?rr(0.35,0.7):rr(0.2,0.6);
      var br=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,Math.max(0.12,mix(bp.r,bq.r,f)*0.5),0.06,3,Hb.secCurve,0.08);
      TS.sapTris += treeTube(fam, br, treeBarkCol(sp,si%3), 4, false);
      spots.push(br[1],br[2],br[3],br[3]); if(sp!==3 && sp!==1) spots.push(br[2]); }
    var tp=pts[7]; spots.push(tp,tp,{x:tp.x,y:tp.y-H*0.07,z:tp.z}); if(sp===3) spots.push(tp,tp);
    var cy=S.y0+H*mix(band[0],1,0.5), size0=clamp(H*0.15,3.2,8.5);
    spots.forEach(function(p){
      var size=size0*rr(0.8,1.25), s=size*0.45, x=p.x+rr(-s,s), y=p.y+rr(-0.2,0.5)*s, z=p.z+rr(-s,s);
      var dx=(x-S.x)/S.cr, dy=(y-cy)/(H*0.35), dz=(z-S.z)/S.cr, q=Math.hypot(dx,dy,dz);
      var ao=mix(0.55,1.0,smooth(0.25,0.9,q))*rr(0.88,1.12), nx=dx+rr(-0.3,0.3), ny=dy*0.6+0.8, nz=dz+rr(-0.3,0.3), nn=Math.hypot(nx,ny,nz)||1;
      var c1=new THREE.Color(LC[sp===2?ri(0,1):ri(0,LC.length-1)]).lerp(new THREE.Color(sapLeaf[si%2]), sp===1?0.2:0.4).getHex();
      treeInst(treeFol[sp], x,y,z, rr(-0.3,0.3),rr(0,TAU),rr(-0.3,0.3), size,size*Hb.flat,size, c1, 1.3*ao, [nx/nn,ny/nn,nz/nn], sp===2?LC[2+ri(0,1)]:null);
    });
  });
  TS.saplings=TREE_SAPLINGS.length;
})();

/* ------------------------------------------------------------ emit the instanced foliage */
var treeClump=null, folTris=[0,0,0,0], folN=[0,0,0,0];
for(var tsp=0;tsp<4;tsp++){ folN[tsp]=treeFol[tsp].count;
  folTris[tsp]=treeEmit(treeFol[tsp], treeClumpGeo(), treeLeafMat(tsp), SPECIES[tsp].name+' foliage', { cast:true, depthMap:TREE_LEAFTEX[tsp] })||0; }
var flwN=treeFlw.count, podN=treePod.count;
var flwTris=treeEmit(treeFlw, treeRacemeGeo(),
  nlMaterial(new THREE.MeshLambertMaterial({ color:0xffffff, map:TREE_FLOWERTEX, alphaTest:0.4, side:THREE.DoubleSide }), 'treeflower',
             treeFoliageHook({ aN:true, irid:false, swayW:'(-position.y)', swayA:0.9 }), 'vTreeWP'), 'Ghostwood flower racemes')||0;
/* the gatepods carry the library's velvet pod husk as a detail map (48-detail.js; materials.json `pod`) */
var podMat=new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), podDet=GDET.hook('pod', podMat),
    podSway=treeFoliageHook({ aN:false, irid:false, swayW:'(-position.y)', swayA:0.5 });
var podTris=treeEmit(treePod, treePodGeo(),
  nlMaterial(podMat, 'treepod'+(podDet?'|det':''), podDet ? function(sh){ podSway(sh); podDet(sh); } : podSway, 'vTreeWP'), 'Gatepods (Gate baobab fruit)', { cast:true })||0;

/* ------------------------------------------------------------ the far forest: impostors */
(function(){
  var pos=[], nor=[], uv=[], col=[], ico=new THREE.IcosahedronGeometry(1,1), ip=ico.attributes.position.array, c=new THREE.Color(), c2=new THREE.Color();
  function vtx(x,y,z,nx,ny,nz,r,g,b){ pos.push(x,y,z); nor.push(nx,ny,nz); uv.push((x+z*0.45)/140,(y+z*0.3)/140); col.push(r,g,b); }
  function blob(x,y,z, rx,ry, colA, colB, sd){
    var ca=new THREE.Color(colA).convertSRGBToLinear(), cb=new THREE.Color(colB).convertSRGBToLinear(), k1=sd*7.3, k2=sd*3.1;
    for(var i=0;i<ip.length;i+=3){ var dx=ip[i], dy=ip[i+1], dz=ip[i+2];
      var m=1+0.20*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+0.14*Math.sin(dy*6.3+k2+dx*2.0)+0.10*Math.sin(dz*7.9+k1);
      var sh=(0.50+0.50*smooth(-0.7,0.8,dy))*(0.9+0.2*Math.sin(dx*9+dz*7+k1)), t=smooth(-0.2,0.7,dy+0.3*Math.sin(dx*5+k2));
      var ny=dy*0.7+0.45, nl=Math.hypot(dx,ny,dz)||1;
      vtx(x+dx*rx*m, y+dy*ry*m-(dy<0?ry*0.25*dy*dy:0), z+dz*rx*m, dx/nl,ny/nl,dz/nl, mix(cb.r,ca.r,t)*sh, mix(cb.g,ca.g,t)*sh, mix(cb.b,ca.b,t)*sh); }
  }
  FARTREES.forEach(function(T, fi){
    var sp=T.sp, Hend=T.H*(sp===3?0.92:0.95), us=[0,0.015,0.05,0.14,0.45,0.75,1], seg=7, bc=new THREE.Color(sp===2?treeDesat(PAL.bark[2][(fi%3)*2],TREE_DESAT+0.15):PAL.bark[sp][fi%3]).convertSRGBToLinear(), rings=[];
    us.forEach(function(u){ var y=T.y0+Hend*u, r=Math.max(0.8,trunkR(T,y))*(u<0.02?1.25:1), ring=[];
      for(var s=0;s<=seg;s++){ var a=s/seg*TAU; ring.push([T.x+Math.cos(a)*r, y, T.z+Math.sin(a)*r, Math.cos(a), Math.sin(a)]); } rings.push(ring); });
    for(var r2=0;r2<rings.length-1;r2++) for(var s2=0;s2<seg;s2++){
      var A=rings[r2][s2], B=rings[r2][s2+1], D=rings[r2+1][s2], E=rings[r2+1][s2+1], sh=0.75+0.25*(r2/rings.length);
      [A,D,E, A,E,B].forEach(function(p){ vtx(p[0],p[1],p[2], p[3],0.05,p[4], bc.r*sh,bc.g*sh,bc.b*sh); }); }
    var L=PAL.leaf[sp], R=T.crownR, yc0=T.y0+T.H*T.crown0, yTop=T.y0+T.H, k, a0=(T.seed%628)/100;
    if(sp===0){ for(k=0;k<4;k++){ var t=k/3; blob(T.x+Math.sin(k*2.4+a0)*R*0.06, mix(yc0+9,yTop-15,t), T.z+Math.cos(k*2.4+a0)*R*0.06, R*mix(0.80,0.20,t), mix(23,18,t), L[(k+fi)%4], L[2], fi+k); } }
    else if(sp===1){ for(k=0;k<4;k++){ var a=a0+k/4*TAU; blob(T.x+Math.cos(a)*R*0.46, mix(yc0,yTop,0.62)+((k*37)%18), T.z+Math.sin(a)*R*0.46, R*0.44, 37, L[(k+fi)%4], L[2], fi+k); }
                     blob(T.x, yTop-21, T.z, R*0.48, 33, L[3], L[0], fi+9); }
    else if(sp===2){ blob(T.x, yTop-23, T.z, R*0.72, 28, L[fi%2], L[2+fi%2], fi);
                     for(k=0;k<4;k++){ var a2=a0+k/4*TAU; blob(T.x+Math.cos(a2)*R*0.62, yTop-45-((k*53)%21), T.z+Math.sin(a2)*R*0.62, R*0.46, 24, L[k%2], L[2+(k+fi)%2], fi+k*3); } }
    else { for(k=0;k<3;k++){ var a3=a0+k/3*TAU; blob(T.x+Math.cos(a3)*R*0.42, T.y0+T.H*0.93+((k*11)%7), T.z+Math.sin(a3)*R*0.42, R*0.52, 15, L[k%3], L[2], fi+k); } }
  });
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.computeBoundingSphere();
  var mat=nlMaterial(new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true, map:FAMMAT.leafy.tex }), 'treefar');
  var m=new THREE.Mesh(g,mat); m.frustumCulled=false; m.castShadow=false; m.receiveShadow=false; m.userData.inspectLabel='Hyperjungle (far forest)'; m.userData.trees=true;
  scene.add(m); TS.farTris=pos.length/9;
})();

var barkTris=TS.trunkTris+TS.limbTris+TS.boughTris+TS.twigTris+TS.rootTris+TS.sapTris;
var leafTris=folTris[0]+folTris[1]+folTris[2]+folTris[3];
window._trees = { near:TREES.length, far:FARTREES.length, saplings:TS.saplings, topBoughs:TS.topBoughs, boughs:TS.boughs, twigs:TS.twigs, roots:TS.roots,
  clumps:folN, racemes:flwN, pods:podN,
  tris:{ trunk:TS.trunkTris, limbs:TS.limbTris, boughs:TS.boughTris, twigs:TS.twigTris, roots:TS.rootTris, saplingBark:TS.sapTris, bark:barkTris,
         leaves:leafTris, flowers:flwTris, pods:podTris, far:TS.farTris, total:barkTris+leafTris+flwTris+podTris+TS.farTris },
  drawCalls: 4 + folN.filter(function(n){ return n>0; }).length + (flwN?1:0) + (podN?1:0) + 1,
  ms: Math.round(performance.now()-TREE_T0) };
})();
