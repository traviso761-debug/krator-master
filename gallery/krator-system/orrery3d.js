<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
(function(){
  const box=document.getElementById('orrery'),cv=document.getElementById('orr'),labels=document.getElementById('orr-labels'),play=document.getElementById('orr-play');
  const D=Math.PI/180,TAU=Math.PI*2,KR=194000;
  const BODIES=[
    {k:'day',n:'Day',P:0.5,a:122200,t0:6.279224,R:1820},
    {k:'companion',n:'Companion',P:1,a:KR,trojan:60,R:470,lump:0.24},
    {k:'two-day',n:'Two-Day',P:2,a:307950,t0:3.137631,R:1500},
    {k:'four-day',n:'Four-Day',P:4,a:488840,t0:4.708428,R:3400},
    {k:'week',n:'Week',P:6.87,a:700000,t0:3.594923,R:4000},
    {k:'thirteen',n:'Thirteen',P:12.55,a:1050000,t0:3.387957,R:4600},
    {k:'krator',n:'Krator',P:1,a:KR,R:4800,home:true}];
  const MONTHS=["Janavari","Pepravari","Mārccu","Ēpral","Mē","Jūn","Julai","Ākasṭu","Ceppaṭampar","Akṭōpar","Navampar","Ṭicampar"],MD=[31,28,31,30,31,30,31,31,30,31,30,31];
  const WD=["Sanḍē","Manḍē","Ṭyūsḍē","Vensḍē","Tarsḍē","Firaiḍē","Sa'arḍē"],NUM=["Van","Ṭū","Tirī","Fōr","Faiv","Siks","Cevan","Eyiṭ","Nain","Ṭen","Ilevan","Ṭvelv","Tarṭīn"];
  /* the sky model's frame (core/atmos/sky): the sun's ecliptic place through the year, Krator's longitude from the
     sidereal time at the sub-giant meridian, each moon from its epoch. Krator's equator is the plane of the orbits */
  const sunLonDec=t=>{const l=(270+360*(259+t-350)/365)*D,e=23*D;return[Math.atan2(Math.cos(e)*Math.sin(l),Math.cos(l)),Math.asin(Math.sin(e)*Math.sin(l))];};
  const kratorAng=t=>{const h=((t%1)+1)%1*24;return 15*(h-12)*D+sunLonDec(t)[0]+Math.PI;};
  const date=t=>{const yd=Math.floor(((259+t)%365+365)%365);let m=0,d=yd;while(d>=MD[m]){d-=MD[m];m++;}const c=((Math.floor(t+1)%91)+91)%91,h=((t%1)+1)%1*24;
    return (d+1)+' '+MONTHS[m]+' · '+NUM[c%13]+' '+WD[c%7]+' · '+String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor(h%1*60)).padStart(2,'0');};
  let t=0.25,speed=6,scale='sqrt',playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=null,raf=0,built=false;
  /* cloud shells (the owner, 2026-10-26): a transparent sphere just over a body, its cloud from 3D noise on the sphere,
     turning at its own rate (faster at the equator), lit by the sun with a soft terminator. kind 0 the giant's high wisps,
     1 Krator's weather, 2 Four-Day's banded acid decks, 3 Thirteen's sparse smog and white wisps */
  const CLOUD_U={uT:{value:0},uSun:{value:null}},cloudShells=[];
  const CLOUD_V='varying vec3 vP;varying vec3 vN;void main(){vP=position;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
  const CLOUD_F=['uniform float uT,uKind,uRate;uniform vec3 uSun,uCol,uShade;varying vec3 vP;varying vec3 vN;',
   'float h3(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
   'float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}',
   'float fbm(vec3 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*vn(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return clamp((v/0.9375-0.5)*2.0+0.5,0.0,1.0);}',
   'void main(){vec3 P=normalize(vP);float la=asin(clamp(P.y,-1.0,1.0)),lo=atan(P.z,P.x)+uT*uRate*(1.0+0.35*cos(la*2.0));',
   ' vec3 Q=vec3(cos(lo)*cos(la),P.y,sin(lo)*cos(la));float a=0.0;',
   ' if(uKind<0.5){float n=fbm(vec3(Q.x*3.0,Q.y*14.0,Q.z*3.0)+vec3(0.0,0.0,uT*0.02));a=smoothstep(0.58,0.80,n)*0.55*smoothstep(0.1,0.6,abs(sin(la*9.0+1.4)));}',
   ' else if(uKind<1.5){vec3 w=vec3(fbm(Q*2.0),fbm(Q*2.0+vec3(5.2)),fbm(Q*2.0+vec3(9.1)));float n=fbm(Q*2.4+w*1.6+vec3(uT*0.05));a=smoothstep(0.48,0.66,n)*0.85;}',
   ' else if(uKind<2.5){vec3 w=vec3(fbm(Q*1.3),fbm(Q*1.3+vec3(4.1)),0.0)-0.5;float n=fbm(vec3(Q.x*1.3+w.x*0.8,Q.y*4.5+w.y*1.2,Q.z*1.3)+vec3(uT*0.01));float hf=smoothstep(0.35,0.65,fbm(Q*0.7+vec3(3.0)));a=smoothstep(0.50,0.78,n)*(0.12+0.88*hf)*0.95;}',
   ' else if(uKind>3.5){vec3 g=Q*4.0+vec3(20.0),fl=floor(g);float glow=0.0,flow=0.0,ash=0.0;',
   ' for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++)for(int k=-1;k<=1;k++){vec3 c=fl+vec3(i,j,k);float hs=h3(c);if(hs>0.55)continue;',
   '  vec3 vp=c+vec3(h3(c+3.1),h3(c+7.3),h3(c+11.7));float d=length(g-vp),act=smoothstep(0.35,1.0,sin(uT*(1.5+4.0*h3(c+5.0))+40.0*h3(c+9.0)));',
   '  flow=max(flow,(1.0-smoothstep(0.10,0.42,d+0.10*vn(g*3.0)))*(0.55+0.45*act));glow=max(glow,act*(1.0-smoothstep(0.0,0.13,d)));',
   '  vec3 dr=vec3(0.18,0.0,0.10)*sin(uT*0.7+hs*20.0);ash=max(ash,act*(1.0-smoothstep(0.20,0.95,length(g-vp-dr)+0.25*vn(g*2.0+uT))));}',
   ' float l0=dot(normalize(vN),normalize(uSun)),night=1.0-smoothstep(-0.15,0.25,l0),lit0=smoothstep(-0.12,0.35,l0);',
   ' vec3 c=vec3(0.08,0.04,0.03)*flow;c=mix(c,vec3(0.86,0.82,0.70)*(0.30+0.85*lit0),ash*0.9);c+=vec3(1.0,0.42,0.08)*glow*(1.4+2.0*night);',
   ' gl_FragColor=vec4(c,clamp(max(flow*0.85,max(ash*0.85,glow)),0.0,1.0));return;}',
   ' else{float n=fbm(Q*1.4+vec3(11.0,0.0,uT*0.01));float wisp=pow(1.0-abs(fbm(vec3(Q.x*2.0,Q.y*6.0,Q.z*2.0)+vec3(2.0))*2.0-1.0),8.0);a=smoothstep(0.52,0.68,n)*0.45+wisp*0.45;}',
   ' float l=dot(normalize(vN),normalize(uSun)),lit=smoothstep(-0.12,0.35,l);vec3 c=mix(uShade,uCol,lit)*(0.25+0.85*lit);',
   ' gl_FragColor=vec4(c,a*(0.35+0.65*smoothstep(-0.3,0.1,l)));}'].join('\n');
  const addClouds=(m,kind,rate,col,shade,lift)=>{const mat=new THREE.ShaderMaterial({uniforms:{uT:CLOUD_U.uT,uSun:CLOUD_U.uSun,uKind:{value:kind},uRate:{value:rate},
    uCol:{value:new THREE.Color(col)},uShade:{value:new THREE.Color(shade)}},vertexShader:CLOUD_V,fragmentShader:CLOUD_F,transparent:true,depthWrite:false});
   const c=new THREE.Mesh(new THREE.SphereGeometry(1+lift,64,48),mat);m.add(c);cloudShells.push(c);return c;};
  let renderer,scene,camera,sun,giant,ring,mesh={},orbitLines=[],lab={},sta,staPlane,debris;
  let yaw=0.6,pitch=0.55,dist=190,focus=null,fdist=6;const tgt=new THREE.Vector3();
  const R0=100,rad=a=>scale==='lin'?R0*a/1.06e6:R0*Math.sqrt(a/1.06e6);
  const bodyR=b=>scale==='lin'?0.35+b.R/1800:0.9+b.R/1100;
  /* a seeded value noise, so the giant's bands are the same on every visit */
  function hash(i,j){let h=(i*374761393+j*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;}
  function vnoise(x,y){const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
    return(hash(i,j)*(1-u)+hash(i+1,j)*u)*(1-v)+(hash(i,j+1)*(1-u)+hash(i+1,j+1)*u)*v;}
  function giantTexture(){const w=1024,h=512,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),im=g.createImageData(w,h);
    for(let y=0;y<h;y++){const lat=(0.5-y/h)*Math.PI;for(let x=0;x<w;x++){const nx=x/w*16,ny=y/h*8;
      const warp=vnoise(nx*0.7,ny*2.0)*0.6+vnoise(nx*1.7,ny*4)*0.25,b=Math.sin(lat*9+warp*2.2),pale=Math.max(0,Math.sin(lat*4.5+0.8));
      const cl=Math.max(0,vnoise(nx*1.3+warp*3,ny*6)-0.55)*2.4*Math.max(0,Math.sin(lat*9+1.4)),eq=Math.exp(-((lat/0.32)**2));
      let r=0.07+0.16*(b*0.5+0.5)+0.25*pale*0.5,gg=0.19+0.24*(b*0.5+0.5)+0.24*pale*0.5,bb=0.55+0.31*(b*0.5+0.5)+0.2*pale*0.4;
      r=r*(1-0.35*eq)+0.0*eq;gg=gg*(1-0.1*eq)+0.10*eq;bb=bb*(1-0.15*eq);   /* the blue-green of the equator, its sky-plankton */
      r+=(0.94-r)*cl;gg+=(0.97-gg)*cl;bb+=(1-bb)*cl;const k=(y*w+x)*4;im.data[k]=r*255;im.data[k+1]=gg*255;im.data[k+2]=bb*255;im.data[k+3]=255;}}
    g.putImageData(im,0,0);const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;return tx;}
  function ringTexture(){const w=512,c=document.createElement('canvas');c.width=w;c.height=4;const g=c.getContext('2d');
    for(let x=0;x<w;x++){const f=x/w;let a=0.10*(f>0.0&&f<0.22)+(0.55+0.45*Math.min(1,Math.max(0,(f-0.30)/0.18)))*(f>=0.22&&f<0.605)+0.03*(f>=0.605&&f<0.678)+0.5*(f>=0.678&&f<0.925)*(Math.abs(f-0.868)<0.005?0.05:1)+0.4*Math.exp(-(((f-0.982)/0.004)**2));
      a*=0.75+0.5*vnoise(f*150,0.5);const col=f<0.22?[150,150,158]:[226,214,193];g.fillStyle='rgba('+col.join(',')+','+Math.min(1,a).toFixed(3)+')';g.fillRect(x,0,1,4);}
    const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;return tx;}
  function build(){renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});renderer.outputEncoding=THREE.sRGBEncoding;renderer.setClearColor(0x04060c);
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(42,1,0.1,4000);
    scene.add(new THREE.AmbientLight(0x1a2233,0.9));sun=new THREE.DirectionalLight(0xfff1dc,1.45);scene.add(sun);scene.add(sun.target);
    /* a field of stars, seeded */
    const sg=new THREE.BufferGeometry(),sp=[];for(let i=0;i<1600;i++){const u=hash(i,1)*2-1,th=hash(i,2)*TAU,r=1600;sp.push(r*Math.sqrt(1-u*u)*Math.cos(th),r*u,r*Math.sqrt(1-u*u)*Math.sin(th));}
    sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xc8d4ee,size:1.6,sizeAttenuation:false})));
    giant=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),new THREE.MeshStandardMaterial({map:giantTexture(),roughness:0.9,metalness:0}));scene.add(giant);CLOUD_U.uSun.value=sun.position;addClouds(giant,0,1.2,0xf4f8ff,0x4a5a7a,0.012);
    const rg=new THREE.RingGeometry(1.30,2.12,256,1),pos=rg.attributes.position,uv=rg.attributes.uv;
    for(let i=0;i<pos.count;i++){const r=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(r-1.30)/0.82,0.5);}
    ring=new THREE.Mesh(rg,new THREE.MeshStandardMaterial({map:ringTexture(),transparent:true,side:THREE.DoubleSide,roughness:1,depthWrite:false}));ring.rotation.x=-Math.PI/2;scene.add(ring);
    const loader=new THREE.TextureLoader();
    for(const b of BODIES){const geo=new THREE.SphereGeometry(1,48,32);
      if(b.lump){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
        const n=1+b.lump*(0.55*Math.sin(3.1*x+1.7*z)*Math.cos(2.3*y+0.4)+0.3*Math.sin(5.7*z-2.1*x+y))-(y<-0.62?0.35*b.lump*(y+0.62)*(y+0.62)*-4:0);
        p.setXYZ(i,x*n,y*n*0.82,z*n);}geo.computeVertexNormals();}   /* Vesta: lopsided, squashed, a basin at its south pole */
      const tx=loader.load(ORR_MAPS[b.k]);tx.encoding=THREE.sRGBEncoding;
      const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tx,roughness:0.95,metalness:0}));scene.add(m);mesh[b.k]=m;
      if(b.k==='krator')addClouds(m,1,0.6,0xffffff,0x5a6a80,0.03);else if(b.k==='four-day')addClouds(m,2,0.35,0xf2e2b4,0x6a5a3a,0.035);else if(b.k==='thirteen')addClouds(m,3,0.25,0xe6d2b0,0x5a4a38,0.03);else if(b.k==='day')addClouds(m,4,0.0,0xffffff,0x000000,0.015);   /* Day: vents that wake and sleep, lava flows, ash */
      const l=document.createElement('div');l.className='orr-lab'+(b.home?' home':'');l.textContent=b.n;labels.appendChild(l);lab[b.k]=l;}
    const gl=document.createElement('div');gl.className='orr-lab';gl.textContent='giant';labels.appendChild(gl);lab.giant=gl;
    /* the broken station round Krator (drawn far larger than life): a torus with a sector torn out, its wreckage trailing
       behind it along an orbit inclined 52 degrees to Krator's equator, 2.47 h a lap */
    staPlane=new THREE.Object3D();staPlane.rotation.order='YXZ';staPlane.rotation.x=52*D;scene.add(staPlane);
    sta=new THREE.Mesh(new THREE.TorusGeometry(1,0.16,8,40,TAU-1.1),new THREE.MeshStandardMaterial({color:0xd8d4cc,roughness:0.6,metalness:0.3}));staPlane.add(sta);
    {const pts=[];for(let i=0;i<160;i++){const f=Math.pow(i/160,1.3),a=-0.06-0.9*f,w=0.04+0.5*f,h=(s=>{const x=Math.sin(i*12.9898+s)*43758.5453;return x-Math.floor(x)-0.5;});
      pts.push(new THREE.Vector3(Math.cos(a)+h(1)*w*0.5,h(2)*w*0.6,-Math.sin(a)+h(3)*w*0.5));}
     debris=new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts),new THREE.PointsMaterial({color:0xcfcac2,size:2,sizeAttenuation:false}));staPlane.add(debris);}
    const sl=document.createElement('div');sl.className='orr-lab';sl.textContent='Station';labels.appendChild(sl);lab.station=sl;
    built=true;rescale();}
  function rescale(){for(const l of orbitLines)scene.remove(l);orbitLines=[];
    for(const b of BODIES){if(b.k==='companion')continue;const r=rad(b.a),pts=[];for(let i=0;i<=180;i++){const a=i/180*TAU;pts.push(new THREE.Vector3(Math.cos(a)*r,0,-Math.sin(a)*r));}
      const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:b.home?0x8ec5ff:0x3a4a66,transparent:true,opacity:b.home?0.8:0.55}));scene.add(ln);orbitLines.push(ln);}
    const gr=rad(50211);giant.scale.setScalar(gr);ring.scale.setScalar(rad(2.12*50211)/2.12);   /* the outer edge through the orbits' distance map, so Day stays outside it (compressed, the faint inner ring tucks behind the disc) */for(const b of BODIES)mesh[b.k].scale.setScalar(bodyR(b));
    dist=scale==='lin'?70:190;}
  function size(){const w=box.clientWidth||900,h=Math.round(Math.min(w*0.62,640));renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(w,h,false);cv.style.height=h+'px';camera.aspect=w/h;camera.updateProjectionMatrix();}
  function place(){const [sl,sd]=sunLonDec(t),ka=kratorAng(t),v=new THREE.Vector3();
    /* the sun: its longitude in the plane of the orbits and its height above it (the season) */
    sun.position.set(Math.cos(sl)*Math.cos(sd)*500,Math.sin(sd)*500,-Math.sin(sl)*Math.cos(sd)*500);
    giant.rotation.y=TAU*((t*24/10)%1);
    CLOUD_U.uT.value=t;
    for(const b of BODIES){const ang=b.home?ka:b.trojan?ka+b.trojan*D:b.t0+TAU*t/b.P,r=rad(b.a),m=mesh[b.k];m.position.set(Math.cos(ang)*r,0,-Math.sin(ang)*r);
      m.rotation.y=ang+Math.PI;   /* every moon here is tidally locked: one face to the giant */}
    {const kp=mesh.krator.position,sr=bodyR(BODIES[6])*2.1,u=TAU*t*24/2.47;staPlane.position.copy(kp);staPlane.rotation.y=40*D-1.57*D*t;staPlane.scale.setScalar(sr);
     sta.position.set(Math.cos(u),0,-Math.sin(u));sta.scale.setScalar(0.22);sta.rotation.set(Math.PI/2+0.45,0,u);debris.rotation.y=u;}
    const w=cv.clientWidth,h=cv.clientHeight;
    const GR=rad(50211),cp=camera.position,hidden=p=>{const d=p.clone().sub(cp),L=d.length();d.divideScalar(L);const tc=-cp.dot(d);if(tc<0||tc>L)return false;return cp.lengthSq()-tc*tc<GR*GR*0.98;};   /* behind the giant's disc */
    const show=(el,p,dy)=>{v.copy(p).project(camera);if(v.z>1||(el!==lab.giant&&hidden(p))){el.hidden=true;return;}el.hidden=false;el.style.transform='translate('+((v.x*0.5+0.5)*w+8)+'px,'+((-v.y*0.5+0.5)*h-8-dy)+'px)';};
    for(const b of BODIES)show(lab[b.k],mesh[b.k].position,bodyR(b)*2);show(lab.station,sta.getWorldPosition(new THREE.Vector3()),0);show(lab.giant,new THREE.Vector3(0,rad(50211)*1.1,0),0);
    document.getElementById('orr-date').textContent='Day '+(t>=0?'+':'')+Math.floor(t)+' · '+date(t);}
  function frame(ts){if(last!=null&&playing)t+=Math.min(0.1,(ts-last)/1000)*speed/24;last=ts;
    place();if(focus)focus.getWorldPosition(tgt);else tgt.set(0,0,0);const dd=focus?fdist:dist;   /* following a body: double-click it */
    camera.position.set(tgt.x+Math.cos(pitch)*Math.sin(yaw)*dd,tgt.y+Math.sin(pitch)*dd,tgt.z+Math.cos(pitch)*Math.cos(yaw)*dd);camera.lookAt(tgt);
    renderer.render(scene,camera);raf=requestAnimationFrame(frame);}
  /* drag to turn, wheel or pinch to zoom */
  let drag=null,pinch=null;
  cv.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId);});
  cv.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*0.006;pitch=Math.max(-1.45,Math.min(1.45,pitch+(e.clientY-drag[1])*0.006));drag=[e.clientX,e.clientY];});
  cv.addEventListener('pointerup',()=>{drag=null;});cv.addEventListener('pointercancel',()=>{drag=null;});
  cv.addEventListener('wheel',e=>{if(focus){fdist=Math.max(1.6,Math.min(60,fdist*(e.deltaY>0?1.1:1/1.1)));e.preventDefault();return;}dist=Math.max(scale==='lin'?8:30,Math.min(scale==='lin'?160:420,dist*(e.deltaY>0?1.1:1/1.1)));e.preventDefault();},{passive:false});
  cv.addEventListener('touchmove',e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    if(pinch)dist=Math.max(8,Math.min(420,dist*pinch/d));pinch=d;e.preventDefault();}},{passive:false});
  cv.addEventListener('touchend',()=>{pinch=null;});
  /* double-click (or double-tap) a body to follow it close up; on the giant or empty space, back to the whole system */
  cv.addEventListener('dblclick',e=>{if(!built)return;const r=cv.getBoundingClientRect(),p=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),rc=new THREE.Raycaster();
   rc.setFromCamera(p,camera);const hits=rc.intersectObjects([giant].concat(BODIES.map(b=>mesh[b.k]),[sta]),false);const o=hits.length?hits[0].object:null;
   if(!o||o===giant){focus=null;return;}focus=o;const b=BODIES.find(q=>mesh[q.k]===o);fdist=b?bodyR(b)*5:2.5;});
  document.getElementById('orr-btn').addEventListener('click',function(){const open=box.hidden;box.hidden=!open;this.setAttribute('aria-expanded',String(open));
    this.textContent=open?'Hide the model':'Show the system in motion';
    if(open){if(!built){if(!window.THREE){document.getElementById('orr-date').textContent='The 3D library did not load.';return;}build();}size();last=null;raf=requestAnimationFrame(frame);}else cancelAnimationFrame(raf);});
  play.textContent=playing?'Pause':'Play';
  play.addEventListener('click',()=>{playing=!playing;play.textContent=playing?'Pause':'Play';});
  document.getElementById('orr-speed').addEventListener('change',e=>{speed=+e.target.value;});
  document.getElementById('orr-scale').addEventListener('change',e=>{scale=e.target.value;if(built)rescale();});
  addEventListener('resize',()=>{if(built&&!box.hidden)size();});
})();
</script>
