// ---------- hover carts on the three boulevards, across the bridges and out into the jungle ----------
await stage('carts');
section('carts',()=>{
const bodyM=new THREE.MeshLambertMaterial({color:0xffffff});bodyM.userData.tex='metal';
const N=16,cartBody=new THREE.InstancedMesh(rectFrus(0.7,0.6),bodyM,N),cartTop=new THREE.InstancedMesh(hemiG,lamC(0x3a4a5a),N),
  jetM=new THREE.MeshBasicMaterial({color:0x7fe8ff}),cartJet=new THREE.InstancedMesh(boxG,jetM,N),headM=new THREE.MeshBasicMaterial({color:0xfff2c0}),cartLamp=new THREE.InstancedMesh(boxG,headM,N*2);
const CC=[0xc9442a,0x2f8f8a,0xe0a030,0xd9d1b0,0x7a3d8a,0x3b4a8a];
for(let i=0;i<N;i++)cartBody.setColorAt(i,col.set(xpick(CC)));
const ROUTE=GATES.map(g=>{const R=wallR(g),deg=Math.round(g*180/Math.PI);const lo=deg===315?168:deg===205?100:36;return {g,R,inLo:lo,inHi:R-14,outLo:R+62,outHi:560};});
const carts=[];for(let i=0;i<N;i++){const rt=ROUTE[i%3],out=xr()<0.4,r=out?xrr(rt.outLo,rt.outHi):xrr(rt.inLo,rt.inHi),dir=xr()<0.5?1:-1;
  carts.push({rt,r,dir,side:out?'out':'in',lane:dir*3.5,yaw:dir>0?0:Math.PI,v:xrr(8,11),hidden:0,ph:xr()*6.28,roll:0});}
const par=new THREE.Object3D(),kid=new THREE.Object3D();par.add(kid);
const put2=(im,i,ox,oy,oz,sx,sy,sz)=>{kid.position.set(ox,oy,oz);kid.scale.set(sx,sy,sz);kid.rotation.set(0,0,0);par.updateMatrixWorld(true);im.setMatrixAt(i,kid.matrixWorld);};
const hlPos=new Float32Array(N*6),hlG=new THREE.BufferGeometry();hlG.setAttribute('position',new THREE.BufferAttribute(hlPos,3));
const hlM=new THREE.ShaderMaterial({uniforms:{izNight:ENV.izNight,izPx:ENV.izPx},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`uniform float izNight;uniform float izPx;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float d=max(-mv.z,1.0);gl_PointSize=clamp(2.6*izPx/d,1.0,64.0);vA=izNight*exp(-d*0.003);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vA;void main(){float r=length(gl_PointCoord-0.5);float a=1.0-smoothstep(0.0,0.5,r);a*=a;if(a*vA<0.003)discard;gl_FragColor=vec4(vec3(1.0,0.93,0.72)*a*vA,a*vA);}`});
const headlights=new THREE.Points(hlG,hlM);headlights.frustumCulled=false;headlights.userData.life=true;scene.add(headlights);
const lampAt=(k,ox)=>{kid.position.set(ox,-0.1,1.9);kid.scale.set(1,1,1);kid.rotation.set(0,0,0);par.updateMatrixWorld(true);const e=kid.matrixWorld.elements;hlPos[k*3]=e[12];hlPos[k*3+1]=e[13];hlPos[k*3+2]=e[14];};
const closedAt=h=>h>=21.7||h<6.5;
let last=performance.now();
animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const h=ctx.hour||0,closed=closedAt(h),t=now/1000;
  for(let i=0;i<N;i++){const c=carts[i],rt=c.rt;
    if(c.hidden>0){c.hidden-=dt;if(c.hidden<=0){c.side='out';c.dir=-1;c.r=rt.outHi;c.lane=-3.5;c.yaw=Math.PI;}
      par.position.set(0,-500,0);par.rotation.set(0,0,0);[cartBody,cartTop,cartJet].forEach(im=>put2(im,i,0,0,0,0.001,0.001,0.001));put2(cartLamp,i*2,0,0,0,0.001,0.001,0.001);put2(cartLamp,i*2+1,0,0,0,0.001,0.001,0.001);lampAt(i*2,0);lampAt(i*2+1,0);continue;}
    const want=c.dir>0?0:Math.PI;let dy=want-c.yaw;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;c.yaw+=Math.sign(dy)*Math.min(Math.abs(dy),dt*2.2);
    const slow=1-0.8*Math.abs(dy)/Math.PI;c.r+=c.dir*c.v*slow*dt;
    if(c.side==='in'){if(c.dir>0&&c.r>=rt.inHi){if(closed){c.dir=-1;c.r=rt.inHi;}else c.side='gate';}else if(c.dir<0&&c.r<=rt.inLo){c.dir=1;c.r=rt.inLo;}}
    else if(c.side==='gate'){if(c.dir>0&&c.r>=rt.outLo)c.side='out';else if(c.dir<0&&c.r<=rt.inHi)c.side='in';}
    else{if(c.dir<0&&c.r<=rt.outLo){if(closed){c.dir=1;c.r=rt.outLo;}else c.side='gate';}else if(c.dir>0&&c.r>=rt.outHi){c.hidden=xrr(3,10);continue;}}
    const tl=c.dir*3.5,dl=(tl-c.lane)*Math.min(1,dt*1.2);c.lane+=dl;c.roll+=(-dl/Math.max(dt,1e-3)*0.05-c.roll)*Math.min(1,dt*3);
    const cg=Math.cos(rt.g),sg=Math.sin(rt.g),x=c.r*cg-sg*c.lane,z=c.r*sg+cg*c.lane;
    const onBridge=c.r>rt.R-4&&c.r<rt.R+56,gy=onBridge?Math.max(PLATEAU,meshH(x,z)):meshH(x,z);
    c.px=x;c.py=gy+3;c.pz=z;par.position.set(x,gy+3.2+Math.sin(t*2+c.ph)*0.12,z);par.rotation.set(0,Math.atan2(cg,sg)+c.yaw,c.roll,'YXZ');
    put2(cartBody,i,0,-0.5,0,2.2,1.0,3.6);put2(cartTop,i,0,0.45,-0.2,0.8,0.6,1.0);put2(cartJet,i,0,-0.62,0,1.6,0.12,2.8);
    put2(cartLamp,i*2,-0.6,-0.1,1.72,0.3,0.2,0.1);put2(cartLamp,i*2+1,0.6,-0.1,1.72,0.3,0.2,0.1);lampAt(i*2,-0.6);lampAt(i*2+1,0.6);}
  hlG.attributes.position.needsUpdate=true;
  for(const im of [cartBody,cartTop,cartJet,cartLamp])im.instanceMatrix.needsUpdate=true;
  const nf=nightF(h);headM.color.setRGB(0.35+0.65*nf,0.33+0.62*nf,0.25+0.5*nf);});
for(const im of [cartBody,cartTop,cartJet,cartLamp]){im.userData.life=true;im.userData.noShadow=im!==cartBody;im.frustumCulled=false;scene.add(im);}
ctx.carts=N;ctx.cartList=carts;
});
