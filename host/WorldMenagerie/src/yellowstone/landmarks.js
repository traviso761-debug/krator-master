// Yellowstone's landmarks: the geysers and the hot springs, Mammoth's terraces, the falls, the lodges, the
// arch at the North Entrance, the lookout on Washburn, the herds, and the caldera. The map carries the roads and
// the ordinary buildings; nothing on it says that a patch of white ground in the Upper Geyser Basin throws forty
// metres of water in the air every hour and a half, so that is what this file is for. Nothing else on the site
// uses any of it, so it travels with this page and reaches the engine as ctx.models (src/yellowstone/main.js).
//
// Each model is handed (L,x,z) like one of the engine's own: L is the landmark's entry in the city file, which
// tools/make-yellowstone.py writes, and x, z are where it stands. Steam is not drawn here: a model says where it
// wants some on ctx.ysSteam and the nature stage (nature.js) draws all of it in one set of points.
import { hash3, mkRng } from '../core/rng.js';

// ---- points that are drawn as soft discs, sized in metres, and fogged like everything else ----
export function softPoints(THREE,vertex,uniforms){
  const U=Object.assign({uTime:{value:0},uScale:{value:600},uLight:{value:1}},THREE.UniformsLib.fog,uniforms||{});
  return new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,fog:true,
    vertexShader:`uniform float uTime;uniform float uScale;varying float vA;varying vec3 vC;
#include <fog_pars_vertex>
${vertex}`,
    fragmentShader:`uniform float uLight;varying float vA;varying vec3 vC;
#include <fog_pars_fragment>
void main(){vec2 d=gl_PointCoord-0.5;float r=length(d)*2.0;if(r>1.0)discard;
 float a=vA*(1.0-r*r)*(1.0-r*0.35);gl_FragColor=vec4(vC*uLight,a);
#include <fog_fragment>
}`});
}

// The ground's height, with the fine patches over the coarse grid (tools/make-yellowstone.py). The engine's own
// groundH knows only the grid; everything this page places in the canyon asks this instead.
export function patchHeight(ctx,groundH){
  const P=((ctx.ysLand&&ctx.ysLand.patches)||[]).map(p=>({x0:p.x0/10,z0:p.z0/10,step:p.step,nx:p.nx,nz:p.nz,h:Float32Array.from(p.h,v=>v/10),
    x1:p.x0/10+(p.nx-1)*p.step,z1:p.z0/10+(p.nz-1)*p.step}));
  const f=(x,z)=>{for(const p of P){if(x<p.x0||x>p.x1||z<p.z0||z>p.z1)continue;
      const fx=(x-p.x0)/p.step,fz=(z-p.z0)/p.step,i=Math.min(p.nx-2,Math.floor(fx)),j=Math.min(p.nz-2,Math.floor(fz)),tx=fx-i,tz=fz-j,h=p.h,n=p.nx;
      return (h[j*n+i]*(1-tx)+h[j*n+i+1]*tx)*(1-tz)+(h[(j+1)*n+i]*(1-tx)+h[(j+1)*n+i+1]*tx)*tz;}
    return groundH(x,z);};
  f.patches=P;return f;
}

export function landmarks(api){
  const {ctx,THREE,animHooks,scene,camera,renderer,nightF,hour,box,group,mergeParts,inWater,WATERWAYS,C}=api;
  const gh=ctx.ysHeight=patchHeight(ctx,api.groundH);
  ctx.ysSteam=ctx.ysSteam||[];
  const steam=(x,y,z,s,size,rise,tint)=>ctx.ysSteam.push({x,y,z,s,size:size||8,rise:rise||30,tint:tint||null});
  const lam=c=>new THREE.MeshLambertMaterial({color:c});
  // The time the geysers keep. Seconds since the page opened, so every visitor's Old Faithful goes on the same
  // beat relative to when they arrived, and a probe that waits twenty seconds sees the same thing every time.
  const secs=now=>now/1000;
  // one uniform everything that sizes a point in metres reads: pixels per metre at a distance of one metre
  const scaleU={value:600};
  animHooks.push(()=>{scaleU.value=renderer.domElement.clientHeight/(2*Math.tan(camera.fov*Math.PI/360));});
  const lightNow=()=>0.32+0.68*(1-nightF(hour()));

  // ---- canvas textures: the pools are painted rather than modelled, because what they are is colour ----
  function canvasTex(size,paint){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');paint(g,size);
    const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
  const PALETTES={
    // centre to rim: the blue is water too hot for anything to live in; each ring outward is the bacteria that
    // can stand the temperature there
    prismatic:[[0,'#0b2f66'],[0.3,'#15609f'],[0.5,'#2a93c4'],[0.62,'#6fc2c0'],[0.7,'#cfe08a'],[0.76,'#f2c94a'],[0.84,'#ec8a2c'],[0.93,'#b9542a'],[1,'#8b5a3c']],
    blue:[[0,'#0d3f7a'],[0.45,'#1d78b4'],[0.75,'#58b8d0'],[0.9,'#b8e2e0'],[1,'#e8e2d0']],
    glory:[[0,'#1b6a8a'],[0.35,'#3f9a8a'],[0.55,'#c8c050'],[0.72,'#e8a238'],[0.88,'#d0662c'],[1,'#a05a3a']],
    emerald:[[0,'#0e5a58'],[0.45,'#2a8a62'],[0.7,'#9ab848'],[0.88,'#e0b43c'],[1,'#b87a44']],
    opal:[[0,'#3f7f9a'],[0.5,'#7fb6c0'],[0.85,'#d0e0d8'],[1,'#e8e2d4']],
  };
  function springTex(pal,poolFrac,rays,seed){
    return canvasTex(512,(g,S)=>{const c=S/2,R=mkRng(seed);g.clearRect(0,0,S,S);
      // the sinter apron: pale grey-white, fading out at the edge
      const ap=g.createRadialGradient(c,c,c*poolFrac,c,c,c);ap.addColorStop(0,'rgba(226,220,204,1)');ap.addColorStop(0.75,'rgba(214,206,188,0.85)');ap.addColorStop(1,'rgba(200,192,172,0)');
      g.fillStyle=ap;g.fillRect(0,0,S,S);
      // the mats: bacteria in rings outward from the pool, each at the temperature it can stand, orange, rust
      // and brown, laid down in fine ridges that run away from the water like the grain in wood
      if(rays){const mg=g.createRadialGradient(c,c,c*poolFrac,c,c,c*Math.min(1,poolFrac+(1-poolFrac)*0.85));
        mg.addColorStop(0,'rgba(236,196,82,0.95)');mg.addColorStop(0.18,'rgba(236,146,52,0.92)');mg.addColorStop(0.5,'rgba(196,102,48,0.8)');mg.addColorStop(0.8,'rgba(150,100,70,0.45)');mg.addColorStop(1,'rgba(150,120,90,0)');
        g.fillStyle=mg;g.beginPath();for(let k=0;k<=120;k++){const a=k/120*Math.PI*2,r=c*(poolFrac+(1-poolFrac)*(0.55+0.3*Math.sin(a*3+seed)+0.12*Math.sin(a*7+seed*2)));k?g.lineTo(c+Math.cos(a)*r,c+Math.sin(a)*r):g.moveTo(c+Math.cos(a)*r,c+Math.sin(a)*r);}g.fill();
        for(let k=0;k<rays*6;k++){const a=R()*Math.PI*2,len=c*(poolFrac+(1-poolFrac)*(0.25+R()*0.6));
          g.strokeStyle=['rgba(120,70,40,0.22)','rgba(250,210,120,0.22)','rgba(200,110,50,0.25)'][k%3];g.lineWidth=0.6+R()*1.6;g.beginPath();
          g.moveTo(c+Math.cos(a)*c*poolFrac,c+Math.sin(a)*c*poolFrac);g.lineTo(c+Math.cos(a+(R()-0.5)*0.05)*len,c+Math.sin(a+(R()-0.5)*0.05)*len);g.stroke();}}
      // the pool
      const pg=g.createRadialGradient(c,c,0,c,c,c*poolFrac);for(const [t,col] of pal)pg.addColorStop(t,col);
      g.fillStyle=pg;g.beginPath();g.arc(c,c,c*poolFrac,0,Math.PI*2);g.fill();
      // and the scalloped sinter lip round it
      g.strokeStyle='rgba(240,236,224,0.8)';g.lineWidth=3;g.beginPath();
      for(let k=0;k<=90;k++){const a=k/90*Math.PI*2,r=c*poolFrac*(1+0.012*Math.sin(k*1.7));k?g.lineTo(c+Math.cos(a)*r,c+Math.sin(a)*r):g.moveTo(c+Math.cos(a)*r,c+Math.sin(a)*r);}g.stroke();});
  }
  // the highest ground under a disc, so a flat thing laid over it is not swallowed by the grid's interpolation
  function topOf(x,z,r){let m=-1e9;for(let k=0;k<9;k++){const a=k/9*Math.PI*2,rr=k?r*0.6:0;m=Math.max(m,gh(x+Math.cos(a)*rr,z+Math.sin(a)*rr));}return m;}
  function flatDisc(tex,x,y,z,rx,rz,rot){const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2),
      new THREE.MeshLambertMaterial({map:tex,transparent:true,alphaTest:0.03,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
    m.scale.set(rx,1,rz);m.rotation.y=rot||0;m.position.set(x,y,z);m.receiveShadow=true;return m;}
  // a glossy skin over a pool: the sky in it is most of what a pool looks like from the boardwalk
  const glossM=new THREE.MeshPhongMaterial({color:0xffffff,specular:0xffffff,shininess:140,transparent:true,opacity:0.16,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-12});

  // ---- the geyser column: water thrown up and falling back, and the steam off it, all on the GPU ----
  // Each drop is launched, flies a parabola and lands, over and over; the eruption's strength (uAmp) says how
  // many of them are in the air and how high they get, so one set of points serves the pre-play splashing,
  // the full column and the dying away.
  function geyserPoints(x,y,z,H,opts){
    const N=opts.fountain?420:300,seeds=new Float32Array(N),rnd=new Float32Array(N*3),pos=new Float32Array(N*3),R=mkRng(Math.floor(x*7+z*13));
    for(let i=0;i<N;i++){seeds[i]=R();rnd[i*3]=R();rnd[i*3+1]=R();rnd[i*3+2]=R();}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    g.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));g.setAttribute('aRnd',new THREE.BufferAttribute(rnd,3));
    g.boundingSphere=new THREE.Sphere(new THREE.Vector3(x,y+H/2,z),H*1.2+30);
    const lean=opts.lean||0,turn=opts.turn||0;
    const m=softPoints(THREE,`attribute float aSeed;attribute vec3 aRnd;uniform float uAmp;uniform float uH;uniform vec3 uO;uniform vec2 uLean;uniform float uFount;
void main(){
 float v0=sqrt(2.0*9.8*uH),T=2.0*v0/9.8;
 float u=fract(uTime/T+aSeed);
 // most of the water goes most of the way up; a fountain throws it in bursts at every height
 float k=mix(mix(0.62,1.0,sqrt(aRnd.x)),mix(0.2,1.0,aRnd.x),uFount)*uAmp;
 float v=v0*k,t=u*T;
 float yy=max(0.0,v*t-4.9*t*t);
 float ang=aRnd.y*6.2832,sp=(aRnd.z-0.5)*(1.2+uFount*4.0)+t*(0.4+uFount*1.8)*(aRnd.z-0.5)*4.0;
 vec3 p=uO+vec3(cos(ang)*sp,yy,sin(ang)*sp)+vec3(uLean.x,0.0,uLean.y)*v*t;
 vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;
 gl_PointSize=clamp((1.4+uH*0.03)*(1.0+t*0.5)*uScale/-mvPosition.z,0.0,64.0);
 vA=step(0.02,uAmp)*0.85*(1.0-smoothstep(0.85,1.0,u))*step(0.001,yy+0.0001);vC=vec3(0.93,0.96,1.0);
 #include <fog_vertex>
}`,{uAmp:{value:0},uH:{value:H},uO:{value:new THREE.Vector3(x,y,z)},uLean:{value:new THREE.Vector2(Math.cos(turn)*lean,Math.sin(turn)*lean)},uFount:{value:opts.fountain?1:0},uScale:scaleU});
    const pts=new THREE.Points(g,m);pts.frustumCulled=true;pts.userData.noShadow=true;pts.userData.noWire=true;scene.add(pts);return m;
  }
  function cloudPoints(x,y,z,H,n,tint){
    const N=n||90,seeds=new Float32Array(N),rnd=new Float32Array(N*3),pos=new Float32Array(N*3),R=mkRng(Math.floor(x*3+z*5));
    for(let i=0;i<N;i++){seeds[i]=R();rnd[i*3]=R();rnd[i*3+1]=R();rnd[i*3+2]=R();}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    g.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));g.setAttribute('aRnd',new THREE.BufferAttribute(rnd,3));
    g.boundingSphere=new THREE.Sphere(new THREE.Vector3(x,y+H,z),H*3+60);
    const m=softPoints(THREE,`attribute float aSeed;attribute vec3 aRnd;uniform float uAmp;uniform float uH;uniform vec3 uO;uniform vec3 uTint;
void main(){
 float life=9.0+aRnd.x*6.0,u=fract(uTime/life+aSeed);
 vec3 p=uO+vec3((aRnd.y-0.5)*uH*0.25+u*uH*0.9,uH*(0.35+aRnd.z*0.4)+u*uH*1.4,(aRnd.z-0.5)*uH*0.25+u*uH*0.35);
 vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;
 gl_PointSize=clamp(uH*(0.25+0.9*u)*uScale/-mvPosition.z,0.0,900.0);
 vA=uAmp*0.42*smoothstep(0.0,0.1,u)*pow(1.0-u,1.4);vC=uTint;
 #include <fog_vertex>
}`,{uAmp:{value:0},uH:{value:H},uO:{value:new THREE.Vector3(x,y,z)},uTint:{value:new THREE.Color(tint||0xf4f6f8)},uScale:scaleU});
    const pts=new THREE.Points(g,m);pts.userData.noShadow=true;pts.userData.noWire=true;scene.add(pts);return m;
  }
  const sinterM=new THREE.MeshLambertMaterial({color:0xd8d0bc,flatShading:true});
  const ventM=new THREE.MeshBasicMaterial({color:0x2a3a40});

  // ---- the caldera: shared between the model that draws it and the button that shows it ----
  const CAL={on:false,parts:[],rim:null,set:null};

  return {
  geyser(L,x,z){
    const g0=gh(x,z),H=L.height||30,C0=L.cone||4,AP=L.apron||Math.max(16,C0*3.5),parts=[];
    // the apron: sinter the geyser has laid down round itself, with the runoff channels stained by bacteria
    const tex=springTex([[0,'#dcd6c6'],[1,'#dcd6c6']],0.02,26,Math.floor(x+z));
    const y0=topOf(x,z,AP)+0.15;
    parts.push(flatDisc(tex,x,y0,z,AP,AP,hash3(x,z,1)*6));
    // the cone: lumpy geyserite, built up in beads
    const cg=new THREE.CylinderGeometry(C0*0.22,C0,Math.max(0.6,C0*0.34),14,3);
    {const p=cg.attributes.position;for(let i=0;i<p.count;i++){const px=p.getX(i),pz=p.getZ(i),n=0.82+0.3*hash3(Math.round(px*3),Math.round(pz*3),p.getY(i)*5);p.setX(i,px*n);p.setZ(i,pz*n);}cg.computeVertexNormals();}
    cg.translate(0,Math.max(0.6,C0*0.34)/2,0);
    const cone=new THREE.Mesh(cg,sinterM);cone.position.set(x,y0-0.1,z);parts.push(cone);
    const vent=new THREE.Mesh(new THREE.CircleGeometry(Math.max(0.4,C0*0.12),10).rotateX(-Math.PI/2),ventM);vent.position.set(x,y0+Math.max(0.6,C0*0.34)-0.08,z);parts.push(vent);
    const top=y0+Math.max(0.6,C0*0.34);
    const grp=group(L,parts);
    if(L.inlake){steam(x,top,z,0.4,4,12);return grp;}
    const water=geyserPoints(x,top,z,H,{fountain:!!L.fountain,lean:L.lean,turn:L.turn}),cloud=cloudPoints(x,top,z,H,Math.round(60+H),null);
    steam(x,top,z,0.35,Math.max(3,C0),Math.max(10,H*0.3));   // it steams between eruptions too
    const I=L.interval||120,D=L.duration||20,PH=L.phase||0;
    animHooks.push(now=>{const t=secs(now)+PH,tt=((t%I)+I)%I;
      // the eruption: up to strength in a few seconds, hold, die away; and splashing for a minute before it
      let amp=0,cl=0;
      if(tt<D){amp=Math.min(1,tt/3)*(1-Math.max(0,(tt-(D-6))/6)*0.85);cl=Math.min(1,tt/4);}
      else{const after=tt-D;cl=Math.max(0,1-after/40);const before=I-tt;if(before<50)amp=0.08+0.12*Math.max(0,Math.sin(t*2.3))*(1-before/50);}
      water.uniforms.uAmp.value=amp;water.uniforms.uTime.value=t;water.uniforms.uLight.value=lightNow();
      cloud.uniforms.uAmp.value=cl*(0.6+0.8*(1-nightF(hour()))*(hour()<10?1.3:1));cloud.uniforms.uTime.value=t;cloud.uniforms.uLight.value=lightNow();});
    return grp;},

  hotspring(L,x,z){
    const R0=L.r||10,RX=L.rx||R0,AP=L.apron||R0*2.4,pal=PALETTES[L.palette||'blue'],parts=[],rot=hash3(x,z,4)*6.28;
    const tex=springTex(pal,R0/AP,L.ring?70:22,Math.floor(x*3+z));
    const y0=topOf(x,z,AP)+0.2;
    parts.push(flatDisc(tex,x,y0,z,AP*RX/R0,AP,rot));
    const gloss=new THREE.Mesh(new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),glossM);gloss.scale.set(RX,1,R0);gloss.rotation.y=rot;gloss.position.set(x,y0+0.05,z);parts.push(gloss);
    if(L.wall){   // a crater: the pool sits down in it, with a pale broken wall round
      const w=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,40,1,true),new THREE.MeshLambertMaterial({color:0xcfc6b0,side:THREE.DoubleSide}));
      w.scale.set(RX*1.02,L.wall,R0*1.02);w.rotation.y=rot;w.position.set(x,y0-L.wall/2+0.4,z);parts.push(w);}
    const tint=L.palette==='prismatic'?0xdfeff4:null;
    const n=Math.max(1,Math.round((L.steam||0.5)*Math.max(1,RX*R0/200)));
    for(let k=0;k<n;k++){const a=hash3(x,z,k)*6.28,rr=Math.sqrt(hash3(z,x,k))*0.7;steam(x+Math.cos(a)*RX*rr,y0,z+Math.sin(a)*R0*rr,L.steam||0.5,Math.max(6,R0*0.6),Math.max(20,R0*1.5),tint);}
    return group(L,parts);},

  terraces(L,x,z){   // Mammoth: travertine laid down in steps down the hillside
    const W=L.w||500,D=L.d||380,NS=L.steps||7,parts=[],R=mkRng(1872);
    // downhill: the direction the ground falls away fastest from here
    let best=0,bd=1e9;for(let k=0;k<16;k++){const a=k/16*Math.PI*2,h=gh(x+Math.cos(a)*220,z+Math.sin(a)*220);if(h<bd){bd=h;best=a;}}
    const dx=Math.cos(best),dz=Math.sin(best),px=-dz,pz=dx;
    const topM=new THREE.MeshLambertMaterial({color:0xece6d8}),dryM=new THREE.MeshLambertMaterial({color:0xd4d0c8}),
      faceM=new THREE.MeshLambertMaterial({color:0xd89458}),faceDryM=new THREE.MeshLambertMaterial({color:0xbdb4a4}),poolM=new THREE.MeshPhongMaterial({color:0x5fb8c8,specular:0xffffff,shininess:90});
    const tops=[],faces=[],dryT=[],dryF=[],pools=[];
    function lobed(rx,rz,seed){const s=new THREE.Shape();const n=56;
      for(let k=0;k<n;k++){const a=k/n*Math.PI*2,f=1+0.13*Math.sin(a*5+seed)+0.07*Math.sin(a*11+seed*2)+0.04*Math.sin(a*19+seed*3);
        const X=Math.cos(a)*rx*f,Y=Math.sin(a)*rz*f;k?s.lineTo(X,Y):s.moveTo(X,Y);}return s;}
    for(let k=0;k<NS;k++){
      const along=-D/2+(k+0.5)*D/NS,lat=(R()-0.5)*W*0.3,cx=x+dx*along+px*lat,cz=z+dz*along+pz*lat;
      const rx=W*(0.2+R()*0.18),rz=D/NS*(0.75+R()*0.35);
      const active=k<3||R()<0.3;   // the upper terraces are the live ones this decade
      // each is a flight of three rimstone steps, each lip standing proud of the one below
      for(let s=0;s<3;s++){
        const sx=cx+dx*(s-1)*rz*0.55,sz=cz+dz*(s-1)*rz*0.55,sr=1-s*0.22;
        const up=gh(sx-dx*rz*sr,sz-dz*rz*sr),dn=gh(sx+dx*rz*sr,sz+dz*rz*sr),topY=Math.max(up,gh(sx,sz))+1.2-s*0.4;
        const thick=Math.max(2.5,topY-Math.min(dn,gh(sx,sz))+2);
        const eg=new THREE.ExtrudeGeometry(lobed(rx*sr,rz*sr*0.7,k*3+s),{depth:thick,bevelEnabled:false,curveSegments:2});
        eg.rotateX(Math.PI/2);eg.rotateY(-best+Math.PI/2);eg.translate(sx,topY,sz);
        const m=new THREE.Mesh(eg,[active?topM:dryM,active?faceM:faceDryM]);
        (active?tops:dryT).push(m);
        if(active&&R()<0.8){const pool=new THREE.Mesh(new THREE.CircleGeometry(1,20).rotateX(-Math.PI/2),poolM);pool.scale.set(rx*sr*0.55,1,rz*sr*0.35);pool.rotation.y=-best;pool.position.set(sx,topY+0.06,sz);pools.push(pool);
          steam(sx,topY,sz,0.35,10,28);}
      }
    }
    for(const m of [...tops,...dryT])parts.push(m);for(const m of pools)parts.push(m);
    return group(L,parts);},

  sintercone(L,x,z){   // Liberty Cap: one vent's cone, left standing when it stopped
    const H=L.height||11,g0=gh(x,z),pts=[];
    for(let k=0;k<=12;k++){const t=k/12;pts.push(new THREE.Vector2(H*0.28*(1-t*0.75)*(0.9+0.15*Math.sin(k*2.1)),t*H));}
    const m=new THREE.Mesh(new THREE.LatheGeometry(pts,12),new THREE.MeshLambertMaterial({color:new THREE.Color(L.colour||'#d8cbb0'),flatShading:true}));
    m.position.set(x,g0-0.5,z);return group(L,[m]);},

  mudpots(L,x,z){   // mud boiling: acid ground with too little water to make a spring
    const R0=L.r||30,y0=topOf(x,z,R0)+0.15,parts=[];
    const tex=canvasTex(256,(g,S)=>{const R=mkRng(Math.floor(x));const gr=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);gr.addColorStop(0,'rgba(170,150,136,1)');gr.addColorStop(0.7,'rgba(190,172,156,0.9)');gr.addColorStop(1,'rgba(200,190,170,0)');g.fillStyle=gr;g.fillRect(0,0,S,S);
      for(let k=0;k<160;k++){g.fillStyle=['rgba(214,160,150,0.5)','rgba(120,110,104,0.5)','rgba(226,214,196,0.5)'][k%3];g.beginPath();g.arc(S/2+(R()-0.5)*S*0.7,S/2+(R()-0.5)*S*0.7,2+R()*9,0,6.3);g.fill();}});
    parts.push(flatDisc(tex,x,y0,z,R0,R0,0));
    const bubM=new THREE.MeshLambertMaterial({color:0x9a8c80}),bubs=[];
    for(let k=0;k<14;k++){const a=hash3(x,z,k)*6.28,r=Math.sqrt(hash3(z,x,k))*R0*0.55;
      const b=new THREE.Mesh(new THREE.SphereGeometry(1,8,5,0,Math.PI*2,0,Math.PI/2),bubM);b.position.set(x+Math.cos(a)*r,y0,z+Math.sin(a)*r);parts.push(b);bubs.push({b,ph:hash3(k,x,z)*10,s:0.4+hash3(x,k,z)*R0*0.04});}
    steam(x,y0,z,0.6,R0*0.5,R0*1.4,0xe8e4dc);
    animHooks.push(now=>{if(camera.position.distanceTo(bubs[0].b.position)>3000)return;const t=now/1000;
      for(const q of bubs){const u=((t*0.7+q.ph)%1.6)/1.6;const s=u<1?q.s*Math.sin(u*Math.PI):0.001;q.b.scale.set(s,s*0.8,s);}});
    return group(L,parts);},

  waterfall(L,x,z){
    // Which way the water goes is the river's business: OSM draws a waterway downstream, so the nearest one
    // says. The drop, the width and whether it is a cascade or a clean fall come from the city file.
    let dir=null,bestD=450;
    for(const w of WATERWAYS){if(L.river&&w.name!==L.river)continue;const p=w.pts;
      for(let i=0;i+1<p.length;i++){const ax=p[i][0],az=p[i][1],bx=p[i+1][0],bz=p[i+1][1],ddx=bx-ax,ddz=bz-az,l2=ddx*ddx+ddz*ddz;if(!l2)continue;
        const t=Math.max(0,Math.min(1,((x-ax)*ddx+(z-az)*ddz)/l2)),d=Math.hypot(x-ax-t*ddx,z-az-t*ddz);if(d<bestD){bestD=d;const l=Math.sqrt(l2);dir=[ddx/l,ddz/l];}}}
    if(!dir)dir=[Math.cos(L.turn||0),Math.sin(L.turn||0)];
    const DROP=L.drop||30,Wd=L.width||15,CAS=!!L.cascade,[dx,dz]=dir,px=-dz,pz=dx;
    const top=Math.max(gh(x,z),gh(x-dx*40,z-dz*40)),rows=16,cols=6,pos=[],uv=[],idx=[];
    for(let r=0;r<=rows;r++){const v=r/rows,fwd=CAS?DROP*1.1*v:DROP*0.14*Math.sqrt(v)+2*v,y=top-DROP*v;
      for(let c=0;c<=cols;c++){const u=c/cols-0.5,w=Wd*(1+0.25*v);pos.push(x+dx*fwd+px*u*w,y,z+dz*fwd+pz*u*w);uv.push(c/cols,v);}}
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=r*(cols+1)+c;idx.push(a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,fog:true,
      uniforms:Object.assign({uTime:{value:0},uLight:{value:1},uLen:{value:DROP/Wd}},THREE.UniformsLib.fog),
      vertexShader:`varying vec2 vUv;
#include <fog_pars_vertex>
void main(){vUv=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
      fragmentShader:`uniform float uTime;uniform float uLight;uniform float uLen;varying vec2 vUv;
#include <fog_pars_fragment>
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){
 // streaks running down the face, faster at the bottom, and a green heart where the water is deepest
 float s=n(vec2(vUv.x*22.0,vUv.y*uLen*3.0-uTime*(2.5+vUv.y*3.0)))*0.6+n(vec2(vUv.x*60.0,vUv.y*uLen*8.0-uTime*6.0))*0.4;
 float edge=smoothstep(0.0,0.14,vUv.x)*smoothstep(1.0,0.86,vUv.x);
 vec3 c=mix(vec3(0.72,0.82,0.80),vec3(0.98,0.99,1.0),smoothstep(0.35,0.75,s));
 c=mix(c,vec3(0.45,0.66,0.58),(1.0-smoothstep(0.0,0.25,abs(vUv.x-0.5)))*(1.0-vUv.y)*0.45*(1.0-s));
 gl_FragColor=vec4(c*uLight,edge*mix(0.75,0.95,s)*(0.55+0.45*(1.0-vUv.y*0.5)));
#include <fog_fragment>
}`});
    const sheet=new THREE.Mesh(g,m);sheet.userData.noShadow=true;
    const fwdEnd=CAS?DROP*1.1:DROP*0.14+2,bx=x+dx*fwdEnd,bz=z+dz*fwdEnd,by=top-DROP;
    const foam=new THREE.Mesh(new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xf2f6f6,transparent:true,opacity:0.8,depthWrite:false}));
    foam.scale.set(Wd*0.9,1,Wd*0.6);foam.rotation.y=-Math.atan2(dz,dx);foam.position.set(bx+dx*Wd*0.3,Math.max(by,gh(bx,bz))+0.4,bz+dz*Wd*0.3);
    const mist=L.mist||0.5;steam(bx+dx*Wd*0.3,by,bz+dz*Wd*0.3,0.55*mist,Wd*0.5+DROP*0.15,DROP*0.8,0xf4f8fa);
    animHooks.push(now=>{m.uniforms.uTime.value=now/1000;m.uniforms.uLight.value=lightNow();foam.material.opacity=0.65+0.2*Math.sin(now*0.004);});
    return group(L,[sheet,foam]);},

  inn(L,x,z){   // the Old Faithful Inn, 1904: the Old House under its great roof, and the two wings
    const T=L.turn||0,c=Math.cos(T),s=Math.sin(T),g0=gh(x,z)-0.5,log=[],roof=[],stone=[],red=[],white=[];
    const at=(u,v)=>[x+u*c-v*s,z+u*s+v*c];
    const blk=(arr,u,v,w,h,d,y)=>{const [bx,bz]=at(u,v);const b=box(bx,g0+(y||0),bz,w,h,d);b.rotation.y=-T;arr.push(b);return b;};
    function gable(arr,u,v,len,span,wall,rise){   // a roof: a triangular prism along u
      const sh=new THREE.Shape([new THREE.Vector2(-span/2-0.8,0),new THREE.Vector2(span/2+0.8,0),new THREE.Vector2(0,rise)]);
      const gg=new THREE.ExtrudeGeometry(sh,{depth:len+1.6,bevelEnabled:false});gg.translate(0,0,-(len+1.6)/2);gg.rotateY(Math.PI/2);
      const m=new THREE.Mesh(gg,null);const [bx,bz]=at(u,v);m.position.set(bx,g0+wall,bz);m.rotation.y=-T;arr.push(m);return m;}
    // the Old House: two storeys of log wall and a roof that is most of the building
    blk(log,0,0,56,7,30);gable(roof,0,0,56,30,7,23);
    // dormers down both slopes, three rows of them
    for(let row=0;row<3;row++)for(let k=-3;k<=3;k++)for(const sd of [-1,1]){const v=sd*(11-row*3.6),y=7+row*5.2+1;
      const d=blk(log,k*7.2,v,3.4,3.2,3,y);gable(roof,k*7.2,v,3,3.6,y+3.2,2).rotation.y=-T+Math.PI/2;}
    // the widow's walk on the ridge, and the stone chimney up through the middle of it
    blk(log,0,0,10,1.6,5,30);blk(white,0,0,10.4,0.4,5.4,31.6);blk(stone,4,0,4,34,4);
    for(const u of [-4,0.5])blk(white,u,0,0.2,8,0.2,31.6);
    // the wings, lower and plainer, and the porte-cochere
    blk(log,-64,2,76,11,18);blk(roof,-64,2,77,1.2,19,11);blk(log,58,6,64,14,18);blk(roof,58,6,65,1.2,19,14);
    blk(log,0,-19,14,5,9);gable(roof,0,-19,9,14,5,5).rotation.y=-T+Math.PI/2;
    // windows, red-framed, in rows along both wings
    for(const [u0,v0,n,fl] of [[-64,-7.05,11,3],[58,-3.05,9,4]])for(let f=0;f<fl;f++)for(let k=0;k<n;k++)blk(red,u0-(n-1)*3.4+k*6.8,v0,2.2,1.8,0.25,1.8+f*3.2);
    const M=[[log,lam(0x6a4a30)],[roof,lam(0x5a3a2c)],[stone,lam(0x8c8478)],[red,new THREE.MeshLambertMaterial({color:0x9a2a1c,emissive:0x000000})],[white,lam(0xe8e2d4)]];
    const parts=M.filter(([a])=>a.length).map(([a,mat])=>mergeParts(a,mat));
    const win=M[3][1];animHooks.push(()=>{const w=nightF(hour());win.emissive.setRGB(w*0.9,w*0.55,w*0.2);});
    return group(L,parts);},

  lakehotel(L,x,z){   // the Lake Hotel: lemon yellow, and the porticos facing the water
    // the front faces the lake: whichever way from here there is water soonest
    let T=L.turn||0;{let bd=1e9;for(let k=0;k<24;k++){const a=k/24*Math.PI*2;for(let r=60;r<600;r+=30)if(inWater(x+Math.cos(a)*r,z+Math.sin(a)*r)){if(r<bd){bd=r;T=a-Math.PI/2;}break;}}}
    const c=Math.cos(T),s=Math.sin(T),g0=gh(x,z)-0.5,yel=[],white=[],roof=[],win=[];
    const at=(u,v)=>[x+u*c-v*s,z+u*s+v*c];
    const blk=(arr,u,v,w,h,d,y)=>{const [bx,bz]=at(u,v);const b=box(bx,g0+(y||0),bz,w,h,d);b.rotation.y=-T;arr.push(b);return b;};
    blk(yel,0,0,150,15,20);blk(roof,0,0,151,3.5,21,15);blk(roof,0,0,146,2.2,14,18.5);
    blk(yel,-95,-4,42,12,16);blk(roof,-95,-4,43,3,17,12);
    // white string courses and cornice
    for(const y of [4.6,9.2,14.6])blk(white,0,10.05,150.4,0.5,0.3,y);
    // three porticos: a pediment on columns, three storeys tall
    for(const u of [-45,0,45]){for(let k=0;k<4;k++){const [bx,bz]=at(u-6+k*4,15);const col=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.65,13,10).translate(0,6.5,0),null);col.position.set(bx,g0,bz);white.push(col);}
      blk(white,u,15.5,16,1.6,2.2,13);
      const sh=new THREE.Shape([new THREE.Vector2(-8.5,0),new THREE.Vector2(8.5,0),new THREE.Vector2(0,4.2)]);const pg=new THREE.ExtrudeGeometry(sh,{depth:1.6,bevelEnabled:false});
      const pm=new THREE.Mesh(pg,null);const [bx,bz]=at(u,14.8);pm.position.set(bx,g0+14.6,bz);pm.rotation.y=-T;white.push(pm);}
    // windows: rows along the lake front
    for(let f=0;f<4;f++)for(let k=0;k<30;k++)blk(win,-72.5+k*5,10.05,1.6,2,0.3,1.4+f*3.6);
    // dormers
    for(let k=0;k<14;k++)blk(yel,-65+k*10,7,3,2.6,3,16.5);
    const winM=new THREE.MeshLambertMaterial({color:0x3a4a56,emissive:0x000000});
    const parts=[mergeParts(yel,lam(0xe8cf6a)),mergeParts(white,lam(0xf4f2ea)),mergeParts(roof,lam(0x5c6860)),mergeParts(win,winM)];
    animHooks.push(()=>{const w=nightF(hour());winM.emissive.setRGB(w*0.95,w*0.75,w*0.4);});
    return group(L,parts);},

  arch(L,x,z){   // the Roosevelt Arch: columnar basalt, a round arch, the tablet across the top
    const T=L.turn||0,g0=gh(x,z)-0.3,W=17,H=15.5,Dp=4.5,parts=[];
    const sh=new THREE.Shape([new THREE.Vector2(-W/2,0),new THREE.Vector2(W/2,0),new THREE.Vector2(W/2,H*0.86),new THREE.Vector2(W/4,H*0.86),new THREE.Vector2(W/4,H),new THREE.Vector2(-W/4,H),new THREE.Vector2(-W/4,H*0.86),new THREE.Vector2(-W/2,H*0.86)]);
    const hole=new THREE.Path();hole.moveTo(-3.2,0);hole.lineTo(3.2,0);hole.lineTo(3.2,7.2);hole.absarc(0,7.2,3.2,0,Math.PI,false);hole.lineTo(-3.2,0);sh.holes.push(hole);
    const g=new THREE.ExtrudeGeometry(sh,{depth:Dp,bevelEnabled:false});g.translate(0,0,-Dp/2);
    const basalt=new THREE.MeshLambertMaterial({color:0x5c554e,flatShading:true});
    const a=new THREE.Mesh(g,basalt);a.position.set(x,g0,z);a.rotation.y=T;parts.push(a);
    // the tablet, and the caps on the towers
    const tab=new THREE.Mesh(new THREE.BoxGeometry(W*0.46,1.6,0.3),lam(0xc8c0b0));tab.position.set(x,g0+H*0.8,z);tab.rotation.y=T;tab.translateZ(Dp/2+0.1);parts.push(tab);
    for(const sd of [-1,1]){const cp=new THREE.Mesh(new THREE.ConeGeometry(2.8,2.2,4),basalt);cp.position.set(x,g0+H*0.86+1.1,z);cp.rotation.y=T+Math.PI/4;cp.translateX(0);cp.position.x+=Math.cos(T)*sd*W*0.38;cp.position.z-=Math.sin(T)*sd*W*0.38;parts.push(cp);
      // the low walls curving away either side
      for(let k=1;k<=6;k++){const u=sd*(W/2+k*2.6),v=-k*k*0.18;const w=box(x+Math.cos(T)*u+Math.sin(T)*v,gh(x+Math.cos(T)*u,z-Math.sin(T)*u)-0.3,z-Math.sin(T)*u+Math.cos(T)*v,2.8,3.6-k*0.25,1.6,basalt);w.rotation.y=T;parts.push(w);}}
    return group(L,parts);},

  lookout(L,x,z){   // Mount Washburn: a stone tower with the glass cab on top, and the radio mast
    const g0=gh(x,z)-0.5,stone=lam(0x8a8276),parts=[];
    parts.push(box(x,g0,z,10,9,10,stone));
    const glass=new THREE.MeshLambertMaterial({color:0x6a8898,emissive:0x000000});parts.push(box(x,g0+9,z,8,3.2,8,glass));
    const rf=new THREE.Mesh(new THREE.ConeGeometry(6.8,2.6,4).translate(0,1.3,0),lam(0x5a4a3c));rf.rotation.y=Math.PI/4;rf.position.set(x,g0+12.2,z);parts.push(rf);
    parts.push(box(x+3,g0+14,z+3,0.5,16,0.5,api.steelM||stone));
    animHooks.push(()=>{const w=nightF(hour());glass.emissive.setRGB(w*0.5,w*0.4,w*0.25);});
    return group(L,parts);},

  herd(L,x,z){   // bison: a herd in loose groups, grazing, walking on slowly
    const N=L.count||200,RX=L.rx||4000,RZ=L.rz||2000,T=L.turn||0,c=Math.cos(T),s=Math.sin(T),R=mkRng(Math.floor(x*11+z*7));
    // one bison: a body, the hump over the shoulders, the head held low, legs; about three metres nose to tail
    const bits=[[0,1.25,0,2.4,1.1,1.1],[0.75,1.55,0,1.1,1.25,1.25],[1.55,1.05,0,0.7,0.8,0.7],[-0.8,0.45,0.35,0.25,0.9,0.25],[-0.8,0.45,-0.35,0.25,0.9,0.25],[0.8,0.45,0.35,0.28,0.9,0.28],[0.8,0.45,-0.35,0.28,0.9,0.28]];
    const bm=bits.map(([bx,by,bz,w,h,d])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d));m.position.set(bx,by,bz);return m;});
    const geo=mergeParts(bm,null).geometry,mat=new THREE.MeshLambertMaterial({color:0x3b2a1e});
    const im=new THREE.InstancedMesh(geo,mat,N);im.castShadow=true;im.receiveShadow=true;
    const groups=[];for(let k=0;k<Math.max(3,Math.round(N/40));k++){const u=(R()-0.5)*2*RX*0.8,v=(R()-0.5)*2*RZ*0.8;groups.push({u,v,a:R()*6.28,sp:0.15+R()*0.2});}
    const B=[];for(let i=0;i<N;i++){const g=groups[i%groups.length],r=Math.sqrt(R())*(60+N*0.6),a=R()*6.28;B.push({g,du:Math.cos(a)*r,dv:Math.sin(a)*r,h:R()*6.28,ph:R()*100});}
    let grow=1;const d=new THREE.Object3D(),place=t=>{for(let i=0;i<N;i++){const b=B[i],g=b.g;
        const gu=g.u+Math.cos(g.a+t*0.004)*120,gv=g.v+Math.sin(g.a+t*0.004)*80,u=gu+b.du,v=gv+b.dv,wx=x+u*c-v*s,wz=z+u*s+v*c;
        d.position.set(wx,gh(wx,wz),wz);d.rotation.set(0,b.h+Math.sin(t*0.05+b.ph)*0.6,0);d.scale.setScalar((0.9+0.2*((i*37)%10)/10)*grow);d.updateMatrix();im.setMatrixAt(i,d.matrix);}
      im.instanceMatrix.needsUpdate=true;};
    place(0);
    // bounds for the herd as a whole, or it is culled by the bounds of one bison at the origin
    im.geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(x,gh(x,z),z),Math.max(RX,RZ)+1200);
    // A bison is three metres long, and from the road across the valley that is less than a pixel: they are grown
    // with distance, up to four times, so a herd reads as a herd rather than as nothing. Close to, they are life size.
    let last=0;animHooks.push(now=>{if(now-last<250)return;last=now;const dist=camera.position.distanceTo(im.geometry.boundingSphere.center);if(dist>RX+30000)return;
      grow=Math.max(1,Math.min(4,(dist-Math.max(RX,RZ)*0.5)/900));place(now/1000);});
    return group(L,[im]);},

  calderamark(L,x,z){
    // The caldera, drawn: the rim as a band laid over the ground, the two resurgent domes, and under it all the
    // magma reservoir the seismologists have mapped, five to seventeen kilometres down. The rim and the domes
    // are always there, faintly, because you should be able to tell you are in it; the Caldera button in the bar
    // brings them up, turns the ground to glass and shows what is under it.
    const land=ctx.ysLand&&ctx.ysLand.caldera;if(!land)return null;
    const rim=[];for(let i=0;i<land.rim.length;i+=2)rim.push([land.rim[i]/10,land.rim[i+1]/10]);
    // a closed ring, smoothed (Catmull-Rom) and resampled every 200 m
    const sm=[];for(let i=0;i<rim.length;i++){const p0=rim[(i-1+rim.length)%rim.length],p1=rim[i],p2=rim[(i+1)%rim.length],p3=rim[(i+2)%rim.length],L2=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),n=Math.max(1,Math.ceil(L2/200));
      for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;const f=(a,b,cc,dd)=>0.5*((2*b)+(-a+cc)*t+(2*a-5*b+4*cc-dd)*t2+(-a+3*b-3*cc+dd)*t3);sm.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}
    const band=(pts,w,lift)=>{const pos=[],idx=[];for(let i=0;i<pts.length;i++){const a=pts[(i-1+pts.length)%pts.length],b=pts[(i+1)%pts.length],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;
        const [px,pz]=pts[i];for(const sd of [-1,1]){const qx=px+nx*sd*w/2,qz=pz+nz*sd*w/2;pos.push(qx,gh(qx,qz)+lift,qz);}
        const j=(i+1)%pts.length;idx.push(i*2,j*2,i*2+1,i*2+1,j*2,j*2+1);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;};
    const rimM=new THREE.MeshBasicMaterial({color:0xff6a2a,transparent:true,opacity:0.35,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-16});
    const rimMesh=new THREE.Mesh(band(sm,200,8),rimM);rimMesh.userData.noShadow=true;rimMesh.renderOrder=3;
    // a curtain standing up off the rim, only in the caldera view: from a hundred kilometres a band on the ground is a line
    const cpos=[],cidx=[];for(let i=0;i<sm.length;i++){const [px,pz]=sm[i],y=gh(px,pz);cpos.push(px,y,pz,px,y+1800,pz);const j=(i+1)%sm.length;cidx.push(i*2,j*2,i*2+1,i*2+1,j*2,j*2+1);}
    const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(cpos,3));
    const cu=[];for(let i=0;i<sm.length;i++)cu.push(0,0,0,1);cg.setAttribute('uv',new THREE.Float32BufferAttribute(cu,2));cg.setIndex(cidx);
    const curtM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uA:{value:0}},
      vertexShader:'varying float vV;void main(){vV=uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'uniform float uA;varying float vV;void main(){gl_FragColor=vec4(1.0,0.45,0.15,uA*(1.0-vV)*(1.0-vV)*0.55);}'});
    const curtain=new THREE.Mesh(cg,curtM);curtain.visible=false;curtain.userData.noShadow=true;curtain.userData.noWire=true;curtain.renderOrder=4;scene.add(curtain);
    const domeM=new THREE.MeshBasicMaterial({color:0xffb040,transparent:true,opacity:0.25,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-16});
    const domes=land.domes.map(d=>{const cx=d.x/10,cz=d.z/10,pts=[];for(let k=0;k<72;k++){const a=k/72*Math.PI*2;pts.push([cx+Math.cos(a)*d.r,cz+Math.sin(a)*d.r*0.7]);}
      const m=new THREE.Mesh(band(pts,140,8),domeM);m.userData.noShadow=true;m.renderOrder=3;m.visible=false;return m;});
    // the reservoir: a lumpy lens of partly molten rock under the caldera, longer than the caldera, north-east
    // to south-west; and far under that the bigger, fainter lower-crust body
    const C2=C.yellowstone||{},top=-(C2.magmaTop||5000),bot=-(C2.magmaBottom||17000);
    const [ccx,ccz]=[sm.reduce((a,p)=>a+p[0],0)/sm.length,sm.reduce((a,p)=>a+p[1],0)/sm.length],gy=gh(ccx,ccz);
    function blob(rx,ry,rz,seed,col,op){const g=new THREE.SphereGeometry(1,48,24),p=g.attributes.position;
      for(let i=0;i<p.count;i++){const vx=p.getX(i),vy=p.getY(i),vz=p.getZ(i),n=1+0.14*Math.sin(vx*4.1+seed)*Math.cos(vz*3.3+seed*2)+0.08*Math.sin(vy*7+vx*5+seed);p.setXYZ(i,vx*rx*n,vy*ry*n*(vy>0?0.8:1.1),vz*rz*n);}
      g.computeVertexNormals();
      const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uC:{value:new THREE.Color(col)},uA:{value:0},uT:{value:0}},
        vertexShader:'varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vec4 mvPosition=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-mvPosition.xyz);vP=position;gl_Position=projectionMatrix*mvPosition;}',
        fragmentShader:'uniform vec3 uC;uniform float uA;uniform float uT;varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){float f=1.0-abs(dot(vN,vV));float pulse=0.85+0.15*sin(uT*0.8+vP.x*0.0004);gl_FragColor=vec4(uC*(0.6+0.8*f)*pulse,uA*(0.25+0.75*f*f));}'});
      const mesh=new THREE.Mesh(g,m);mesh.visible=false;mesh.userData.noShadow=true;mesh.userData.noWire=true;scene.add(mesh);return mesh;}
    const upper=blob(46000,(bot-top)/2,17000,1.3,0xff5a14,0.8);upper.position.set(ccx+4000,gy+(top+bot)/2,ccz-3000);upper.rotation.y=-0.62;
    const lower=blob(60000,15000,30000,4.1,0xb0301a,0.5);lower.position.set(ccx-2000,gy-35000,ccz+2000);lower.rotation.y=-0.5;
    const grp=group(L,[rimMesh,...domes]);
    // a band laid over the ground is not a thing that throws a shadow; group() makes every part of a landmark one
    for(const m of [rimMesh,...domes])m.castShadow=false;
    CAL.parts=[curtain,upper,lower];
    // turning the ground to glass: the terrain, the far ring and the lakes see through, the fog thins so the
    // reservoir is not lost in it from a hundred kilometres
    let terr=null,fog0=null;
    CAL.set=on=>{CAL.on=on;curtain.visible=upper.visible=lower.visible=on;for(const d of domes)d.visible=on;
      if(!terr){terr=[];scene.traverse(o=>{if(o.isMesh&&(o.name==='terrain'||o.name==='water'))terr.push(o);});}
      for(const o of terr){const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){m.transparent=on;m.opacity=on?(o.name==='water'?0.3:0.4):1;m.depthWrite=!on;m.needsUpdate=true;}}
      if(fog0===null)fog0=scene.fog.density;scene.fog.density=on?fog0*0.25:fog0;
      ctx.details=Object.assign(ctx.details||{},{caldera:on?'shown':'hidden'});};
    animHooks.push(now=>{const t=now/1000,k=CAL.on?1:0;
      // the rim is always there from high enough up to see it as a line, and not from the ground, where it would be
      // an orange stripe across somebody's campground
      const above=camera.position.y-gh(camera.position.x,camera.position.z);
      rimM.opacity=CAL.on?0.8:0.4*Math.max(0,Math.min(1,(above-2500)/6000));rimMesh.visible=rimM.opacity>0.01;domeM.opacity=0.6;
      curtM.uniforms.uA.value+=(k-curtM.uniforms.uA.value)*0.08;
      for(const b of [upper,lower]){b.material.uniforms.uA.value+=(k*(b===upper?0.75:0.4)-b.material.uniforms.uA.value)*0.06;b.material.uniforms.uT.value=t;}});
    api.onUI(A=>{const btn=A.mkBtn('Caldera',A.ui,()=>{CAL.set(!CAL.on);btn.setAttribute('aria-pressed',String(CAL.on));
        if(CAL.on&&A.VIEWS&&A.VIEWS['The caldera from above'])A.setView(...A.VIEWS['The caldera from above']);});
      btn.setAttribute('aria-pressed','false');btn.title='Show the rim of the caldera and the magma reservoir under it';
      if(/(^|&)caldera(&|$)/.test(api.HASH0||'')){CAL.set(true);btn.setAttribute('aria-pressed','true');}});
    ctx.caldera=on=>CAL.set&&CAL.set(on===undefined?!CAL.on:!!on);
    return grp;},
  };
}
