/* Self-contained WebGL1 3D/2D interactive baked globe for Krator in gallery/krator-system.
   Consumes window.KRATOR_BAKED (composited equirectangular WebP layers + 512x256 meta PNG +
   256x128 env PNG + canonical pins & 5.1 Sinusoidal boundary). */
(function(){
  'use strict';
  const DATA = window.KRATOR_BAKED;
  const glCv = document.getElementById('kg-gl');
  const hudCv = document.getElementById('kg-hud');
  const stage = document.getElementById('kg-stage');
  if (!DATA || !glCv || !hudCv || !stage) return;

  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;
  const R_M = 4812845.5;

  const PRESETS = {
    crater:   { lat: -33.0, lon: -53.5, dist: 2.38 },
    nwsea:    { lat: -10.5, lon: -86.0, dist: 2.62 },
    subgiant: { lat:  -2.0, lon:  -4.0, dist: 2.68 },
    capsica:  { lat:  21.2, lon: -15.0, dist: 2.42 },
    rifts:    { lat: -39.5, lon:  20.0, dist: 2.48 },
    antipode: { lat:  34.5, lon: 127.5, dist: 2.48 }
  };

  function latLonToVec3(lat, lon) {
    const phi = lat * DEG, lam = lon * DEG, cp = Math.cos(phi);
    return [cp * Math.sin(lam), Math.sin(phi), cp * Math.cos(lam)];
  }

  function vec3ToLatLon(v) {
    const l = Math.hypot(v[0], v[1], v[2]);
    const inv = l > 1e-8 ? 1 / l : 1;
    const y = Math.max(-1, Math.min(1, v[1] * inv));
    return [Math.asin(y) * RAD, Math.atan2(v[0], v[2]) * RAD];
  }

  function fmtLatLon(lat, lon) {
    const ns = lat >= 0 ? 'N' : 'S';
    const ew = lon >= 0 ? 'E' : 'W';
    return Math.abs(lat).toFixed(2) + '°' + ns + ', ' + Math.abs(lon).toFixed(2) + '°' + ew;
  }

  function decodeElevByte(q) {
    if (q <= 180) return -4500.0 + q * 60.0;
    return 6300.0 + (q - 180) * 250.0;
  }

  function mat4Perspective(fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad * 0.5), nf = 1.0 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ]);
  }

  function mat4LookAt(eye, center, up) {
    let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
    const zl = Math.hypot(zx, zy, zz);
    const izl = zl > 1e-8 ? 1 / zl : 1;
    zx *= izl; zy *= izl; zz *= izl;
    let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    const xl = Math.hypot(xx, xy, xz);
    if (xl < 1e-5) { xx = 1; xy = 0; xz = 0; } else { xx /= xl; xy /= xl; xz /= xl; }
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
      1
    ]);
  }

  function mat4Mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }

  function projectVec3(v, mvp, w, h) {
    const x = v[0], y = v[1], z = v[2];
    const cx = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12];
    const cy = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13];
    const cz = mvp[2] * x + mvp[6] * y + mvp[10] * z + mvp[14];
    const cw = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];
    if (cw <= 0.0001) return null;
    return [(cx / cw * 0.5 + 0.5) * w, (-cy / cw * 0.5 + 0.5) * h, cz / cw];
  }

  function loadImg(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });
  }

  function getImagePixels(im) {
    const c = document.createElement('canvas');
    c.width = im.width;
    c.height = im.height;
    const g = c.getContext('2d');
    g.drawImage(im, 0, 0);
    return g.getImageData(0, 0, im.width, im.height).data;
  }

  const gl = glCv.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: true });
  const hud = hudCv.getContext('2d');
  if (!gl) {
    const fb = document.querySelector('[data-body="krator"]');
    if (fb) fb.hidden = false;
    return;
  }

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function makeProg(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }

  function makeTex(im, linear, repeatS) {
    const t = gl.createTexture();
    const isPot = (im.width & (im.width - 1)) === 0 && (im.height & (im.height - 1)) === 0;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, (repeatS && isPot) ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (linear && isPot) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR : gl.NEAREST);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
    return t;
  }

  const HALO_VS = [
    'attribute vec2 aC;uniform mat4 uP;uniform float uD;varying vec2 vC;',
    'void main(){vC=aC;float r=1.14;gl_Position=uP*vec4(aC*r,-uD,1.0);}'
  ].join('\n');
  const HALO_FS = [
    'precision mediump float;varying vec2 vC;',
    'void main(){float d=length(vC);float a=smoothstep(1.13,0.96,d)*smoothstep(0.84,1.01,d)*0.48;',
    'gl_FragColor=vec4(0.32,0.58,0.96,a);}'
  ].join('\n');

  const GLOBE_VS = [
    'attribute vec3 aPos;attribute float aElev;attribute vec2 aUV;',
    'uniform mat4 uMVP;uniform float uVex;uniform float uView2D;',
    'varying vec3 vP;varying vec2 vUV;',
    'void main(){if(uView2D>0.5){vP=aPos;vUV=aUV;gl_Position=vec4(aPos.xy,0.0,1.0);return;}',
    'float r=1.0+uVex*(aElev/4812845.5);vP=aPos;vUV=aUV;gl_Position=uMVP*vec4(aPos*r,1.0);}'
  ].join('\n');

  const GLOBE_FS = [
    'precision highp float;varying vec3 vP;varying vec2 vUV;',
    'uniform sampler2D uMap;uniform sampler2D uMeta;',
    'uniform float uView2D;uniform float uSunlit;uniform float uMapIdx;',
    'uniform vec3 uSun;uniform vec3 uCam;uniform vec4 uRect2D;uniform vec2 uPan2D;uniform float uZoom2D;',
    'const float DEG=0.01745329252;',
    'void main(){vec3 P;vec2 uv;float latDeg;',
    'if(uView2D>0.5){float vx=(vP.x-uRect2D.x)/uRect2D.z,vy=(vP.y-uRect2D.y)/uRect2D.w;',
    'if(abs(vx)>1.0||abs(vy)>1.0){gl_FragColor=vec4(0.02,0.03,0.065,1.0);return;}',
    'float lonDeg=uPan2D.x+vx*(180.0/uZoom2D);latDeg=uPan2D.y+vy*(90.0/uZoom2D);',
    'if(abs(latDeg)>90.0||abs(lonDeg)>180.0){gl_FragColor=vec4(0.02,0.03,0.065,1.0);return;}',
    'float cp=cos(latDeg*DEG);P=vec3(cp*sin(lonDeg*DEG),sin(latDeg*DEG),cp*cos(lonDeg*DEG));',
    'uv=vec2(fract((lonDeg+180.0)/360.0),clamp((90.0-latDeg)/180.0,0.001,0.999));}',
    'else{P=normalize(vP);latDeg=asin(clamp(P.y,-1.0,1.0))*57.2957795;uv=vUV;}',
    'vec3 col=texture2D(uMap,uv).rgb;float wCov=texture2D(uMeta,uv).g;',
    'if(uMapIdx<0.5&&uView2D<0.5&&wCov<0.5){',
    'float natBio=max(0.0,col.b-col.r*0.72)+max(0.0,(col.r+col.b)*0.52-col.g);',
    'if(natBio>0.035&&max(col.r,max(col.g,col.b))<0.78){vec3 V=normalize(uCam-P);',
    'float g=sin((1.0-max(0.0,dot(P,V)))*5.2+latDeg*0.08);',
    'col+=vec3(-0.020*g,0.024*g,0.028*abs(g))*(1.0-wCov)*clamp(natBio*2.6,0.0,1.0);}}',
    'if(uSunlit>0.5){float ndl=dot(P,normalize(uSun));float dayT=smoothstep(-0.16,0.20,ndl);',
    'float diff=0.14+0.90*max(0.0,ndl);float gFace=max(0.0,P.z);float gLit=0.5*(1.0-uSun.z);',
    'vec3 gShine=vec3(0.18,0.38,0.62)*gFace*(0.16+0.34*gLit);',
    'vec3 lit=col*(diff*vec3(1.0,0.98,0.95)+gShine*(1.0-0.50*dayT));',
    'float twi=exp(-pow(ndl/0.12,2.0));lit+=col*vec3(0.24,0.09,0.03)*twi;',
    'if(uView2D<0.5){vec3 V=normalize(uCam-P);if(wCov>0.04){vec3 H=normalize(normalize(uSun)+V);',
    'lit+=vec3(0.30,0.35,0.42)*pow(max(0.0,dot(P,H)),40.0)*max(0.0,ndl)*wCov;}',
    'float rim=pow(clamp(1.0-max(0.0,dot(P,V)),0.0,1.0),3.2);',
    'lit+=mix(vec3(0.12,0.28,0.58),vec3(0.30,0.58,0.96),dayT+0.25*gFace)*rim*0.40;}col=lit;}',
    'else if(uView2D<0.5){vec3 V=normalize(uCam-P);float nv=max(0.0,dot(P,V));',
    'vec3 keyDir=normalize(uCam+vec3(-0.45,0.55,0.20));float kd=max(0.0,dot(P,keyDir));',
    'col*=(0.74+0.30*kd);if(wCov>0.05&&uMapIdx<0.5){vec3 H=normalize(keyDir+V);',
    'col+=vec3(0.16,0.20,0.26)*pow(max(0.0,dot(P,H)),36.0)*wCov;}',
    'float rim=pow(clamp(1.0-nv,0.0,1.0),3.4);col+=vec3(0.22,0.44,0.78)*rim*0.32;}',
    'gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);}'
  ].join('\n');

  const progHalo = makeProg(HALO_VS, HALO_FS);
  const progGlobe = makeProg(GLOBE_VS, GLOBE_FS);

  const state = {
    layer: 'sat',
    layerIdx: 0,
    view2D: false,
    show51: true,
    showLabels: true,
    showStation: true,
    sunlit: false,
    camLat: -33.0,
    camLon: -53.5,
    camDist: 2.38,
    tgtLat: -33.0,
    tgtLon: -53.5,
    tgtDist: 2.38,
    pan2D: [0.0, 0.0],
    zoom2D: 1.0,
    sunLon: -64.0,
    sunLat: -14.0,
    selected: null,
    hoverPin: null
  };

  const LAYER_ORDER = ['sat', 'rel', 'clim', 'rain', 'temp'];
  const LEGENDS = {
    sat: [
      ['#3a6844', '5.1 & Lake Capsica green'],
      ['#266c70', 'Iridescent blue-green'],
      ['#682c6e', 'Retinol-purple native'],
      ['#ba9ea8', 'Salt rifts & soda pans']
    ],
    rel: [
      ['#18405c', '−4.1 km abyssal sea'],
      ['#6a9e62', '0 m basin'],
      ['#b58c58', '+3–6 km tableland'],
      ['#ececec', '>+9 km airless rim']
    ],
    clim: [
      ['#c92a8a', 'XD deadly Twb ≥35°C'],
      ['#1e88e5', 'Af/XA wet jungle'],
      ['#66bb6a', 'Cwb/Cfb sky-bench'],
      ['#b0bec5', 'HT/HF/O hypobaric']
    ],
    rain: [
      ['#b87344', '<250 mm arid'],
      ['#d8c26a', '600 mm steppe'],
      ['#48a878', '1,600 mm humid'],
      ['#1d55a8', '3,500+ mm deluge']
    ],
    temp: [
      ['#2a4a9e', '−40°C polar/rim'],
      ['#7fd4e0', '−5°C tundra'],
      ['#f0a94a', '+25°C warm'],
      ['#b81f1f', '+45°C hyperbaric']
    ]
  };

  const texByKey = {};
  let texMeta = null, metaPx = null, envPx = null;
  let sphereVBO = null, sphereIBO = null, sphereCount = 0, quadVBO = null, haloVBO = null;
  let dirty = true;
  let animRaf = 0;

  /* Seeded starfield for 3D backdrop */
  const stars = [];
  for (let i = 0; i < 140; i++) {
    const s1 = Math.sin(i * 12.9898 + 1.7) * 43758.5453;
    const s2 = Math.sin(i * 78.233 + 4.3) * 29432.1731;
    const u = (s1 - Math.floor(s1)) * 2 - 1;
    const th = (s2 - Math.floor(s2)) * Math.PI * 2;
    const rq = Math.sqrt(Math.max(0, 1 - u * u));
    stars.push({ v: [rq * Math.cos(th) * 18, u * 18, rq * Math.sin(th) * 18], r: (i % 5 === 0) ? 1.25 : 0.85, w: (i % 7 === 0) });
  }

  /* Precompute 52-deg inclined broken station orbit points (r = 7000 km = 1.454 R_Krator) */
  const stationRing = [];
  {
    const inc = 52 * DEG, asc = 40 * DEG, rSt = 7000.0 / 4812.85;
    const ci = Math.cos(inc), si = Math.sin(inc), ca = Math.cos(asc), sa = Math.sin(asc);
    for (let k = 0; k <= 120; k++) {
      const u = (k / 120) * Math.PI * 2;
      const x0 = Math.cos(u) * rSt, z0 = -Math.sin(u) * rSt;
      const y1 = -z0 * si, z1 = z0 * ci;
      const x2 = x0 * ca + z1 * sa, z2 = -x0 * sa + z1 * ca;
      stationRing.push([x2, y1, z2, u]);
    }
  }

  function sampleBaked(latDeg, lonDeg) {
    if (!metaPx || !envPx) return null;
    const u = ((((lonDeg + 180.0) % 360.0) + 360.0) % 360.0) / 360.0;
    const v = Math.max(0.0, Math.min(1.0, (90.0 - latDeg) / 180.0));
    const mx = Math.min(511, Math.max(0, Math.floor(u * 512)));
    const my = Math.min(255, Math.max(0, Math.floor(v * 256)));
    const mi = (my * 512 + mx) * 4;

    /* Bilinear elevation for smooth 3D mesh & hover readout */
    const gx = u * 512 - 0.5, gy = Math.max(0, Math.min(254.999, v * 256 - 0.5));
    const x0 = (Math.floor(gx) + 512) & 511, x1 = (x0 + 1) & 511, fx = gx - Math.floor(gx);
    const y0 = Math.floor(gy), y1 = Math.min(255, y0 + 1), fy = gy - y0;
    const e00 = decodeElevByte(metaPx[(y0 * 512 + x0) * 4]);
    const e10 = decodeElevByte(metaPx[(y0 * 512 + x1) * 4]);
    const e01 = decodeElevByte(metaPx[(y1 * 512 + x0) * 4]);
    const e11 = decodeElevByte(metaPx[(y1 * 512 + x1) * 4]);
    const elev = (e00 * (1 - fx) + e10 * fx) * (1 - fy) + (e01 * (1 - fx) + e11 * fx) * fy;

    const ex = Math.min(255, Math.max(0, Math.floor(u * 256)));
    const ey = Math.min(127, Math.max(0, Math.floor(v * 128)));
    const ei = (ey * 256 + ex) * 4;
    const tb = envPx[ei + 1];
    return {
      elev: elev,
      wCov: metaPx[mi + 1] / 255.0,
      climIdx: metaPx[mi + 2],
      rainMm: Math.round((envPx[ei] / 255.0) * 4000),
      tempC: tb === 0 ? null : (tb - 90),
      isOcean: envPx[ei + 2] > 127
    };
  }

  function buildMeshes() {
    const segLon = 180, segLat = 90;
    const verts = [];
    const idx = [];
    for (let j = 0; j <= segLat; j++) {
      const v = j / segLat;
      const lat = 90.0 - v * 180.0;
      for (let i = 0; i <= segLon; i++) {
        const u = i / segLon;
        const lon = -180.0 + u * 360.0;
        const p = latLonToVec3(lat, lon);
        const sb = sampleBaked(lat, lon);
        const surfElev = (sb && !sb.isOcean) ? sb.elev : 0.0;
        verts.push(p[0], p[1], p[2], surfElev, u, v);
      }
    }
    const stride = segLon + 1;
    for (let j = 0; j < segLat; j++) {
      for (let i = 0; i < segLon; i++) {
        const a = j * stride + i, b = a + 1, c = a + stride, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    sphereVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    sphereIBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    sphereCount = idx.length;

    quadVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 0, 0, 0, 0,
       1, -1, 0, 0, 1, 0,
      -1,  1, 0, 0, 0, 1,
      -1,  1, 0, 0, 0, 1,
       1, -1, 0, 0, 1, 0,
       1,  1, 0, 0, 1, 1
    ]), gl.STATIC_DRAW);

    haloVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, haloVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  }

  function get2DRect(W, H) {
    const pad = 10;
    const aw = Math.max(40, W - pad * 2), ah = Math.max(30, H - pad * 2);
    let mw = aw, mh = aw * 0.5;
    if (mh > ah) { mh = ah; mw = ah * 2.0; }
    const x0 = (W - mw) * 0.5, y0 = (H - mh) * 0.5;
    return [0.0, 0.0, mw / W, mh / H, x0, y0, mw, mh];
  }

  let curMVP = null, curEye = [0, 0, 2.4], curW = 520, curH = 390, screenPins = [];

  function projectLatLon(lat, lon, elevM, W, H, mvp, eyeUnit, minDot, r2d) {
    if (state.view2D) {
      const vx = (lon - state.pan2D[0]) / (180.0 / state.zoom2D);
      const vy = (lat - state.pan2D[1]) / (90.0 / state.zoom2D);
      if (Math.abs(vx) > 1.02 || Math.abs(vy) > 1.02) return null;
      return [r2d[4] + (vx * 0.5 + 0.5) * r2d[6], r2d[5] + (-vy * 0.5 + 0.5) * r2d[7]];
    }
    const p = latLonToVec3(lat, lon);
    if (p[0] * eyeUnit[0] + p[1] * eyeUnit[1] + p[2] * eyeUnit[2] < minDot) return null;
    const r = 1.0 + 7.5 * (elevM / R_M);
    return projectVec3([p[0] * r, p[1] * r, p[2] * r], mvp, W, H);
  }

  function drawPolyline(pts, W, H, mvp, eyeUnit, minDot, r2d) {
    hud.beginPath();
    let pen = false, prevX = 0;
    for (let i = 0; i < pts.length; i++) {
      const pr = projectLatLon(pts[i][0], pts[i][1], 0, W, H, mvp, eyeUnit, minDot, r2d);
      if (!pr) { pen = false; continue; }
      if (pen && state.view2D && Math.abs(pr[0] - prevX) > W * 0.42) pen = false;
      if (!pen) { hud.moveTo(pr[0], pr[1]); pen = true; } else hud.lineTo(pr[0], pr[1]);
      prevX = pr[0];
    }
    hud.stroke();
  }

  function updateLegend() {
    const el = document.getElementById('kg-legend');
    if (!el) return;
    const items = LEGENDS[state.layer] || LEGENDS.sat;
    el.innerHTML = items.map(it =>
      '<span class="kg-sw"><i style="background:' + it[0] + '"></i>' + it[1] + '</span>'
    ).join('');
  }

  function updateReadout(lat, lon, pin) {
    const sb = sampleBaked(lat, lon);
    if (!sb) return;
    const titleEl = document.getElementById('kg-ro-title');
    const badgeEl = document.getElementById('kg-ro-badge');
    const llEl = document.getElementById('kg-ro-ll');
    const elEl = document.getElementById('kg-ro-elev');
    const clEl = document.getElementById('kg-ro-clim');
    const swEl = document.getElementById('kg-ro-sw');
    const rtEl = document.getElementById('kg-ro-rt');
    const notesEl = document.getElementById('kg-ro-notes');

    let nearProv = null;
    if (!pin) {
      const pv = latLonToVec3(lat, lon);
      let best = 999;
      for (let i = 0; i < DATA.pins.length; i++) {
        const q = DATA.pins[i];
        if (q.g !== 'prov') continue;
        const qv = latLonToVec3(q.la, q.lo);
        const deg = Math.acos(Math.max(-1, Math.min(1, pv[0] * qv[0] + pv[1] * qv[1] + pv[2] * qv[2]))) * RAD;
        const sc = deg / (q.r == null ? 10 : q.r);
        if (sc < best) { best = sc; nearProv = q; }
      }
      if (best > 1.32) nearProv = null;
    }

    const active = pin || nearProv;
    titleEl.textContent = active ? active.n : (sb.wCov > 0.5 ? 'Open Water' : 'Krator Surface');
    badgeEl.textContent = active
      ? (active.g === '5.1' ? '5.1 · ' + active.k : active.g === 'capsica' ? 'ANCIENT ENCLAVE' : active.k)
      : 'SURFACE';

    llEl.textContent = fmtLatLon(lat, lon);
    const elevM = pin ? pin.el : sb.elev;
    const atm = sb.isOcean ? 1.60 : 1.60 * Math.exp(-elevM / 8000.0);
    const eKm = (elevM >= 0 ? '+' : '') + (elevM / 1000.0).toFixed(2) + ' km';
    elEl.textContent = sb.isOcean
      ? eKm + ' depth · 1.60 atm'
      : (elevM > 9000 ? eKm + ' · <0.52 atm (O)' : eKm + ' · ' + atm.toFixed(2) + ' atm');

    const cc = DATA.climClasses[sb.climIdx] || ['?', 'unknown', '#888888'];
    swEl.style.background = cc[2];
    clEl.textContent = cc[0] + ' · ' + cc[1];
    rtEl.textContent = sb.rainMm.toLocaleString() + ' mm/yr · ' + (sb.tempC == null ? 'airless' : (sb.tempC >= 0 ? '+' : '') + sb.tempC + '°C');

    if (active && active.d) {
      notesEl.textContent = active.d;
    } else {
      notesEl.textContent = 'Canonical Scale Model 5.1 (12.55M km² around the Throne impact at 35.6°S, 53.2°W) and Lake Capsica\'s Ancient Enclave host naturalized Earthly green flora; across the wider 291M km² moon, native Kratorian iridescent blue-green and retinol-purple life predominates.';
    }
  }

  async function ensureLayer(key) {
    if (texByKey[key]) return;
    const im = await loadImg(DATA[key]);
    texByKey[key] = makeTex(im, true, true);
    requestDraw();
  }

  function stepCamera() {
    const dLat = state.tgtLat - state.camLat;
    let dLon = state.tgtLon - state.camLon;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    const dDist = state.tgtDist - state.camDist;
    if (Math.abs(dLat) > 0.02 || Math.abs(dLon) > 0.02 || Math.abs(dDist) > 0.002) {
      state.camLat += dLat * 0.22;
      state.camLon = ((state.camLon + dLon * 0.22 + 540) % 360) - 180;
      state.camDist += dDist * 0.22;
      return true;
    }
    state.camLat = state.tgtLat;
    state.camLon = state.tgtLon;
    state.camDist = state.tgtDist;
    return false;
  }

  function renderFrame() {
    animRaf = 0;
    const moving = stepCamera();
    if (!sphereVBO || !texByKey[state.layer] || !texMeta) {
      if (moving) requestDraw();
      return;
    }

    const dpr = Math.min(2, window.devicePixelRatio == null ? 1 : window.devicePixelRatio);
    const W = stage.clientWidth > 0 ? stage.clientWidth : 520;
    const H = stage.clientHeight > 0 ? stage.clientHeight : 390;
    curW = W; curH = H;
    const pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (glCv.width !== pw || glCv.height !== ph) {
      glCv.width = pw; glCv.height = ph;
      hudCv.width = pw; hudCv.height = ph;
    }

    gl.viewport(0, 0, pw, ph);
    gl.clearColor(0.018, 0.028, 0.062, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = W / Math.max(1, H);
    const eyeUnit = latLonToVec3(state.camLat, state.camLon);
    curEye = [eyeUnit[0] * state.camDist, eyeUnit[1] * state.camDist, eyeUnit[2] * state.camDist];
    const proj = mat4Perspective(38 * DEG, aspect, 0.05, 36.0);
    const view = mat4LookAt(curEye, [0, 0, 0], [0, 1, 0]);
    curMVP = mat4Mul(proj, view);

    if (!state.view2D) {
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(progHalo);
      gl.bindBuffer(gl.ARRAY_BUFFER, haloVBO);
      const lc = gl.getAttribLocation(progHalo, 'aC');
      gl.enableVertexAttribArray(lc);
      gl.vertexAttribPointer(lc, 2, gl.FLOAT, false, 8, 0);
      gl.uniformMatrix4fv(gl.getUniformLocation(progHalo, 'uP'), false, proj);
      gl.uniform1f(gl.getUniformLocation(progHalo, 'uD'), state.camDist);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disableVertexAttribArray(lc);
      gl.disable(gl.BLEND);
    }

    const r2d = get2DRect(W, H);
    const sunDir = latLonToVec3(state.sunLat, state.sunLon);

    gl.useProgram(progGlobe);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texByKey[state.layer]);
    gl.uniform1i(gl.getUniformLocation(progGlobe, 'uMap'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texMeta);
    gl.uniform1i(gl.getUniformLocation(progGlobe, 'uMeta'), 1);

    gl.uniformMatrix4fv(gl.getUniformLocation(progGlobe, 'uMVP'), false, curMVP);
    gl.uniform1f(gl.getUniformLocation(progGlobe, 'uVex'), 7.5);
    gl.uniform1f(gl.getUniformLocation(progGlobe, 'uView2D'), state.view2D ? 1.0 : 0.0);
    gl.uniform1f(gl.getUniformLocation(progGlobe, 'uSunlit'), state.sunlit ? 1.0 : 0.0);
    gl.uniform1f(gl.getUniformLocation(progGlobe, 'uMapIdx'), state.layerIdx);
    gl.uniform3fv(gl.getUniformLocation(progGlobe, 'uSun'), sunDir);
    gl.uniform3fv(gl.getUniformLocation(progGlobe, 'uCam'), curEye);
    gl.uniform4f(gl.getUniformLocation(progGlobe, 'uRect2D'), r2d[0], r2d[1], r2d[2], r2d[3]);
    gl.uniform2fv(gl.getUniformLocation(progGlobe, 'uPan2D'), state.pan2D);
    gl.uniform1f(gl.getUniformLocation(progGlobe, 'uZoom2D'), state.zoom2D);

    const lp = gl.getAttribLocation(progGlobe, 'aPos');
    const le = gl.getAttribLocation(progGlobe, 'aElev');
    const lu = gl.getAttribLocation(progGlobe, 'aUV');
    const B = 24;

    if (state.view2D) {
      gl.disable(gl.DEPTH_TEST);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
      gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 3, gl.FLOAT, false, B, 0);
      gl.enableVertexAttribArray(le); gl.vertexAttribPointer(le, 1, gl.FLOAT, false, B, 12);
      gl.enableVertexAttribArray(lu); gl.vertexAttribPointer(lu, 2, gl.FLOAT, false, B, 16);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else {
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      gl.bindBuffer(gl.ARRAY_BUFFER, sphereVBO);
      gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 3, gl.FLOAT, false, B, 0);
      gl.enableVertexAttribArray(le); gl.vertexAttribPointer(le, 1, gl.FLOAT, false, B, 12);
      gl.enableVertexAttribArray(lu); gl.vertexAttribPointer(lu, 2, gl.FLOAT, false, B, 16);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIBO);
      gl.drawElements(gl.TRIANGLES, sphereCount, gl.UNSIGNED_SHORT, 0);
      gl.disable(gl.CULL_FACE);
    }

    /* ---- 2D HUD Overlays ---- */
    hud.setTransform(dpr, 0, 0, dpr, 0, 0);
    hud.clearRect(0, 0, W, H);
    const minDot = state.view2D ? -2.0 : Math.min(0.88, (1.0 / state.camDist) - 0.015);

    if (state.view2D) {
      hud.strokeStyle = 'rgba(142,197,255,0.28)';
      hud.lineWidth = 1;
      hud.strokeRect(r2d[4], r2d[5], r2d[6], r2d[7]);
    } else {
      const cc = projectVec3([0, 0, 0], curMVP, W, H);
      const eh = Math.hypot(curEye[0], curEye[2]);
      const eDen = eh > 1e-5 ? eh : 1;
      const ev = projectVec3([curEye[2] / eDen, 0, -curEye[0] / eDen], curMVP, W, H);
      const gR = (cc && ev) ? Math.hypot(ev[0] - cc[0], ev[1] - cc[1]) : 0;
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        const pr = projectVec3(st.v, curMVP, W, H);
        if (!pr) continue;
        if (cc && Math.hypot(pr[0] - cc[0], pr[1] - cc[1]) < gR + 2) continue;
        hud.fillStyle = st.w ? 'rgba(233,184,114,0.48)' : 'rgba(200,214,242,0.38)';
        hud.beginPath(); hud.arc(pr[0], pr[1], st.r, 0, Math.PI * 2); hud.fill();
      }
    }

    /* Subtle equator & Prime Meridian (0 deg Sub-Giant) */
    hud.strokeStyle = 'rgba(142,197,255,0.22)';
    hud.lineWidth = 0.85;
    {
      const eq = [], pm = [];
      for (let lon = -180; lon <= 180; lon += 5) eq.push([0, lon]);
      for (let lat = -88; lat <= 88; lat += 4) pm.push([lat, 0]);
      drawPolyline(eq, W, H, curMVP, eyeUnit, minDot, r2d);
      drawPolyline(pm, W, H, curMVP, eyeUnit, minDot, r2d);
    }

    /* 52-deg Inclined Broken Station Orbit in 3D */
    if (state.showStation && !state.view2D) {
      const cp = curEye;
      const cLen2 = cp[0] * cp[0] + cp[1] * cp[1] + cp[2] * cp[2];
      const occ = p => {
        const dx = p[0] - cp[0], dy = p[1] - cp[1], dz = p[2] - cp[2];
        const L = Math.hypot(dx, dy, dz);
        if (L < 1e-5) return false;
        const tc = -(cp[0] * dx + cp[1] * dy + cp[2] * dz) / L;
        if (tc < 0 || tc > L) return false;
        return (cLen2 - tc * tc) < 0.995;
      };
      hud.save();
      hud.setLineDash([4, 4]);
      hud.strokeStyle = 'rgba(216,212,204,0.38)';
      hud.lineWidth = 1.1;
      hud.beginPath();
      let pen = false;
      for (let i = 0; i < stationRing.length; i++) {
        const sp = stationRing[i];
        if (occ(sp)) { pen = false; continue; }
        const pr = projectVec3(sp, curMVP, W, H);
        if (!pr) { pen = false; continue; }
        if (!pen) { hud.moveTo(pr[0], pr[1]); pen = true; } else hud.lineTo(pr[0], pr[1]);
      }
      hud.stroke();
      hud.restore();

      /* Station icon at u = 1.05 rad */
      const stPt = stationRing[20];
      if (!occ(stPt)) {
        const pr = projectVec3(stPt, curMVP, W, H);
        if (pr && pr[0] > 16 && pr[0] < W - 56 && pr[1] > 14 && pr[1] < H - 14) {
          hud.strokeStyle = '#d8d4cc';
          hud.lineWidth = 1.5;
          hud.beginPath(); hud.arc(pr[0], pr[1], 3.5, 0.4, Math.PI * 1.85); hud.stroke();
          hud.font = '500 10px "IBM Plex Mono", ui-monospace, monospace';
          hud.fillStyle = 'rgba(216,212,204,0.86)';
          hud.fillText('Station (52°)', pr[0] + 6, pr[1] + 3);
        }
      }
    }

    const boxes = [];

    /* Sub-Giant (0, 0) marker */
    {
      const sg = projectLatLon(0, 0, 0, W, H, curMVP, eyeUnit, minDot + 0.04, r2d);
      if (sg && sg[0] > 14 && sg[0] < W - 14 && sg[1] > 14 && sg[1] < H - 14) {
        hud.strokeStyle = '#8ec5ff';
        hud.lineWidth = 1.3;
        hud.beginPath(); hud.arc(sg[0], sg[1], 5.5, 0, Math.PI * 2); hud.stroke();
        hud.fillStyle = '#8ec5ff';
        hud.beginPath(); hud.arc(sg[0], sg[1], 2, 0, Math.PI * 2); hud.fill();
        if (state.showLabels && sg[0] + 92 < W - 8) {
          hud.font = '500 10px "IBM Plex Mono", ui-monospace, monospace';
          hud.fillStyle = 'rgba(7,11,20,0.85)';
          hud.fillText('0°,0° Sub-Giant', sg[0] + 9, sg[1] + 4);
          hud.fillStyle = '#8ec5ff';
          hud.fillText('0°,0° Sub-Giant', sg[0] + 8, sg[1] + 3);
          boxes.push([sg[0] - 8, sg[1] - 9, sg[0] + 94, sg[1] + 6]);
        }
      }
    }

    /* Scale Model 5.1 Sinusoidal Collar */
    if (state.show51 && DATA.bounds51) {
      hud.strokeStyle = 'rgba(233,184,114,0.86)';
      hud.lineWidth = 1.5;
      drawPolyline(DATA.bounds51, W, H, curMVP, eyeUnit, minDot, r2d);
      const nw = projectLatLon(DATA.bounds51[0][0], DATA.bounds51[0][1], 0, W, H, curMVP, eyeUnit, minDot + 0.02, r2d);
      if (nw && state.showLabels && nw[0] > 10 && nw[0] < W - 96 && nw[1] > 18 && nw[1] < H - 10) {
        hud.font = '500 10px "IBM Plex Mono", ui-monospace, monospace';
        hud.fillStyle = 'rgba(7,11,20,0.88)';
        hud.fillText('Scale Model 5.1', nw[0] + 5, nw[1] - 4);
        hud.fillStyle = '#e9b872';
        hud.fillText('Scale Model 5.1', nw[0] + 4, nw[1] - 5);
        boxes.push([nw[0], nw[1] - 15, nw[0] + 96, nw[1] + 2]);
      }
    }

    /* Canonical Pins & Decluttered Labels */
    screenPins = [];
    if (state.showLabels) {
      const zoomed = state.camDist < 2.05 || state.zoom2D > 1.8;
      const major51 = { 'Voth': 1, 'The Throne': 1, 'Godthrone': 1, 'Farport': 1, 'Ria': 1, 'Ys': 1, 'Jimjam': 1, 'The Dome': 1, 'Carnelian Pass': 1 };

      for (let i = 0; i < DATA.pins.length; i++) {
        const p = DATA.pins[i];
        const isProv = p.g === 'prov';
        const isCaps = p.g === 'capsica';
        if (!isProv && !isCaps && !zoomed && !major51[p.n] && state.selected !== p) continue;

        const pt = projectLatLon(p.la, p.lo, isProv ? 0 : p.el, W, H, curMVP, eyeUnit, minDot + (isProv ? 0.14 : 0.04), r2d);
        if (!pt || pt[0] < 14 || pt[0] > W - 14 || pt[1] < 14 || pt[1] > H - 16) continue;
        screenPins.push({ x: pt[0], y: pt[1], pin: p });

        const isSel = state.selected === p || state.hoverPin === p;
        if (!isProv) {
          const r = isSel ? 4.4 : 2.9;
          if (isSel) {
            hud.strokeStyle = '#e9b872';
            hud.lineWidth = 1.8;
            hud.beginPath(); hud.arc(pt[0], pt[1], r + 3, 0, Math.PI * 2); hud.stroke();
          }
          hud.fillStyle = isCaps ? '#a78bfa' : p.k === 'volcano' ? '#fb923c' : p.k === 'arcology' ? '#5fd1c0' : '#f8fafc';
          hud.strokeStyle = '#070b14';
          hud.lineWidth = 1.1;
          hud.beginPath(); hud.arc(pt[0], pt[1], r, 0, Math.PI * 2); hud.fill(); hud.stroke();
        }

        const labelTxt = p.n;
        const wEst = labelTxt.length * (isProv ? 5.7 : 6.0) + 8;
        const bx0 = isProv ? pt[0] - wEst * 0.5 : pt[0] + 6;
        const box = [bx0, pt[1] - 8, bx0 + wEst, pt[1] + 5];
        let hit = (box[0] < 8 || box[2] > W - 8 || box[1] < 8 || box[3] > H - 8);
        if (!hit && !isSel) {
          for (let b = 0; b < boxes.length; b++) {
            const q = boxes[b];
            if (box[0] < q[2] && box[2] > q[0] && box[1] < q[3] && box[3] > q[1]) { hit = true; break; }
          }
        }
        if (!hit) {
          boxes.push(box);
          hud.font = isProv ? '500 10px "Instrument Sans", system-ui, sans-serif' : '600 10.5px "Instrument Sans", system-ui, sans-serif';
          hud.textAlign = isProv ? 'center' : 'left';
          const tx = isProv ? pt[0] : pt[0] + 6;
          hud.fillStyle = 'rgba(5,8,16,0.86)';
          hud.fillText(labelTxt, tx + 1, pt[1] + 3.5);
          hud.fillStyle = isSel ? '#e9b872' : isCaps ? '#ddd6fe' : isProv ? 'rgba(200,214,236,0.82)' : '#eef2f9';
          hud.fillText(labelTxt, tx, pt[1] + 2.5);
          hud.textAlign = 'left';
        }
      }
    }

    dirty = false;
    if (moving) requestDraw();
  }

  function requestDraw() {
    dirty = true;
    if (!animRaf) animRaf = requestAnimationFrame(renderFrame);
  }

  function screenToLatLon(sx, sy) {
    const r2d = get2DRect(curW, curH);
    if (state.view2D) {
      const vx = ((sx - r2d[4]) / r2d[6]) * 2 - 1;
      const vy = 1 - ((sy - r2d[5]) / r2d[7]) * 2;
      if (Math.abs(vx) > 1 || Math.abs(vy) > 1) return null;
      const lon = state.pan2D[0] + vx * (180.0 / state.zoom2D);
      const lat = state.pan2D[1] + vy * (90.0 / state.zoom2D);
      if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
      return [lat, lon];
    }
    /* Raycast unit sphere from curEye */
    const aspect = curW / Math.max(1, curH);
    const tFov = Math.tan(19 * DEG);
    const nx = (sx / curW * 2 - 1) * aspect * tFov;
    const ny = (1 - sy / curH * 2) * tFov;
    let fx = -curEye[0], fy = -curEye[1], fz = -curEye[2];
    const fl = Math.hypot(fx, fy, fz);
    fx /= fl; fy /= fl; fz /= fl;
    let rx = -fz, ry = 0, rz = fx;
    const rl = Math.hypot(rx, rz);
    if (rl < 1e-5) { rx = 1; rz = 0; } else { rx /= rl; rz /= rl; }
    const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
    let dx = fx + rx * nx + ux * ny, dy = fy + ry * nx + uy * ny, dz = fz + rz * nx + uz * ny;
    const dl = Math.hypot(dx, dy, dz);
    dx /= dl; dy /= dl; dz /= dl;
    const b = curEye[0] * dx + curEye[1] * dy + curEye[2] * dz;
    const c = curEye[0] * curEye[0] + curEye[1] * curEye[1] + curEye[2] * curEye[2] - 1.0;
    const disc = b * b - c;
    if (disc < 0) return null;
    const t = -b - Math.sqrt(disc);
    if (t <= 0) return null;
    return vec3ToLatLon([curEye[0] + dx * t, curEye[1] + dy * t, curEye[2] + dz * t]);
  }

  /* Pointer interaction: drag to rotate / pan, wheel to zoom, hover & click to inspect */
  let drag = null, moved = false;
  hudCv.addEventListener('pointerdown', e => {
    drag = [e.clientX, e.clientY];
    moved = false;
    hudCv.setPointerCapture(e.pointerId);
  });
  hudCv.addEventListener('pointermove', e => {
    const rect = hudCv.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    if (drag) {
      const dx = e.clientX - drag[0], dy = e.clientY - drag[1];
      if (Math.hypot(dx, dy) > 2.5) moved = true;
      if (state.view2D) {
        const r2d = get2DRect(curW, curH);
        state.pan2D[0] = Math.max(-180, Math.min(180, state.pan2D[0] - (dx / r2d[6]) * (360 / state.zoom2D)));
        state.pan2D[1] = Math.max(-85, Math.min(85, state.pan2D[1] + (dy / r2d[7]) * (180 / state.zoom2D)));
      } else {
        const sens = 0.24 * (state.camDist / 2.5);
        state.tgtLon = state.camLon = ((state.camLon - dx * sens + 540) % 360) - 180;
        state.tgtLat = state.camLat = Math.max(-86, Math.min(86, state.camLat + dy * sens));
      }
      drag = [e.clientX, e.clientY];
      requestDraw();
      return;
    }
    let bestP = null, bestD = 14;
    for (let i = 0; i < screenPins.length; i++) {
      const sp = screenPins[i];
      const d = Math.hypot(sp.x - sx, sp.y - sy);
      if (d < bestD) { bestD = d; bestP = sp.pin; }
    }
    if (bestP !== state.hoverPin) {
      state.hoverPin = bestP;
      requestDraw();
    }
    if (bestP) {
      updateReadout(bestP.la, bestP.lo, bestP);
    } else if (!state.selected) {
      const ll = screenToLatLon(sx, sy);
      if (ll) updateReadout(ll[0], ll[1], null);
    }
  });
  hudCv.addEventListener('pointerup', e => {
    if (drag && !moved) {
      const rect = hudCv.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      let hit = null, bestD = 15;
      for (let i = 0; i < screenPins.length; i++) {
        const sp = screenPins[i];
        const d = Math.hypot(sp.x - sx, sp.y - sy);
        if (d < bestD) { bestD = d; hit = sp.pin; }
      }
      state.selected = hit;
      if (hit) {
        state.tgtLat = hit.la;
        state.tgtLon = hit.lo;
        updateReadout(hit.la, hit.lo, hit);
      } else {
        const ll = screenToLatLon(sx, sy);
        if (ll) updateReadout(ll[0], ll[1], null);
      }
      requestDraw();
    }
    drag = null;
  });
  hudCv.addEventListener('pointercancel', () => { drag = null; });
  hudCv.addEventListener('wheel', e => {
    e.preventDefault();
    const k = e.deltaY > 0 ? 1.11 : 1 / 1.11;
    if (state.view2D) {
      state.zoom2D = Math.max(1.0, Math.min(7.0, state.zoom2D / k));
      if (state.zoom2D <= 1.02) state.pan2D = [0, 0];
    } else {
      state.tgtDist = Math.max(1.32, Math.min(4.2, state.tgtDist * k));
    }
    requestDraw();
  }, { passive: false });

  /* Toolbar controls */
  document.querySelectorAll('[data-kg-layer]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.getAttribute('data-kg-layer');
      state.layer = k;
      state.layerIdx = Math.max(0, LAYER_ORDER.indexOf(k));
      document.querySelectorAll('[data-kg-layer]').forEach(b => b.classList.toggle('on', b === btn));
      updateLegend();
      ensureLayer(k);
      requestDraw();
    });
  });

  document.querySelectorAll('[data-kg-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pr = PRESETS[btn.getAttribute('data-kg-preset')];
      if (!pr) return;
      state.view2D = false;
      const vBtn = document.getElementById('kg-btn-2d');
      if (vBtn) { vBtn.classList.remove('on'); vBtn.textContent = '2D map'; }
      state.tgtLat = pr.lat;
      state.tgtLon = pr.lon;
      state.tgtDist = pr.dist;
      updateReadout(pr.lat, pr.lon, null);
      requestDraw();
    });
  });

  const bindToggle = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => { fn(el); requestDraw(); });
  };
  bindToggle('kg-btn-2d', el => {
    state.view2D = !state.view2D;
    el.classList.toggle('on', state.view2D);
    el.textContent = state.view2D ? '3D globe' : '2D map';
  });
  bindToggle('kg-btn-51', el => {
    state.show51 = !state.show51;
    el.classList.toggle('on', state.show51);
  });
  bindToggle('kg-btn-labels', el => {
    state.showLabels = !state.showLabels;
    el.classList.toggle('on', state.showLabels);
  });
  bindToggle('kg-btn-sun', el => {
    state.sunlit = !state.sunlit;
    el.classList.toggle('on', state.sunlit);
  });

  window.addEventListener('resize', requestDraw);

  /* Boot: decode meta + env + initial sat texture, build displaced 3D sphere, render */
  Promise.all([loadImg(DATA.meta), loadImg(DATA.env), loadImg(DATA.sat)]).then(([mIm, eIm, sIm]) => {
    metaPx = getImagePixels(mIm);
    envPx = getImagePixels(eIm);
    texMeta = makeTex(mIm, true, true);
    texByKey.sat = makeTex(sIm, true, true);
    buildMeshes();
    updateLegend();
    /* Default readout on Voth (39.95S, 56.25W) */
    const voth = DATA.pins.find(p => p.n === 'Voth');
    updateReadout(-39.95, -56.25, voth || null);
    requestDraw();

    /* Support URL query ?kg_layer=clim&kg_preset=capsica for deterministic testing */
    try {
      const qs = new URLSearchParams(location.search);
      if (qs.has('kg_layer')) {
        const b = document.querySelector('[data-kg-layer="' + qs.get('kg_layer') + '"]');
        if (b) b.click();
      }
      if (qs.has('kg_preset')) {
        const b = document.querySelector('[data-kg-preset="' + qs.get('kg_preset') + '"]');
        if (b) { b.click(); state.camLat = state.tgtLat; state.camLon = state.tgtLon; state.camDist = state.tgtDist; requestDraw(); }
      }
      if (qs.get('kg_2d') === '1') {
        const b = document.getElementById('kg-btn-2d');
        if (b) b.click();
      }
      if (qs.get('kg_sun') === '1') {
        const b = document.getElementById('kg-btn-sun');
        if (b) b.click();
      }
    } catch (_) {}
  });
})();
