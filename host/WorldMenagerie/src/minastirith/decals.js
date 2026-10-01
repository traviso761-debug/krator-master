// ---------- what the siege has done to the ground and the walls ----------
// Fan work from Tolkien; the geometry and the textures are this project's own, drawn on canvases here.
//
// A siege that has been going for days leaves marks, and a clean white city on clean green fields with an army
// in front of it reads as the moment before the siege rather than the siege. So: the Pelennor in front of the
// host is torn up - scorched where the city's own stones and fire came down on it, cratered, trodden to mud
// under every block and in the lane Grond was dragged up; the ground before the wall is stuck with spent
// arrows; the white walls are blackened where fire has been thrown against them and the black one is scarred
// pale where stones hit it; and where a lit stone comes down in a street now, it leaves a scorch.
//
// Every mark is a flat quad with a soft-edged texture, laid a hand's breadth off whatever it is on and drawn
// after it (polygon offset, no depth write), and one kind of mark is one instanced mesh: a few hundred marks
// are a handful of draw calls. All of it is the war's (ctx.warParts). ctx.decals.scorch(x, y, z, r) is how an
// event or the siege itself leaves one; the pool is a ring, so the oldest goes when it is full.
import { mkRng } from '../core/rng.js';

export function decals(api){
  const {THREE,C,ctx,scene,groundH,roofAt}=api;
  const R=mkRng(7717),D=new THREE.Object3D();
  const WAR=ctx.warParts=ctx.warParts||[];
  const S=(C.hosts&&C.hosts.siege)||{},K=C.life||{};
  const R_OUT=K.outer||520,STEP=K.step||60,TIERS=K.tiers||7,BASE=K.base||76,LIFT=K.lift||30;
  const [A0,A1]=S.arc||[-1.2,1.2];

  // ---- the textures ----
  // Each is a blotch with a ragged edge that fades to nothing, so where one mark ends and the ground begins
  // is never a line.
  const tex=(draw,w=128,h=128)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h,mkRng(w*7+h));
    const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;};
  const blotch=(rgb,core,rough)=>(g,w,h,r)=>{
    for(let k=0;k<26;k++){const a=r()*6.28,d=r()*w*0.26*rough,x=w/2+Math.cos(a)*d,y=h/2+Math.sin(a)*d,rr=w*(0.12+r()*0.22);
      const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,`rgba(${rgb},${core})`);gr.addColorStop(1,`rgba(${rgb},0)`);
      g.fillStyle=gr;g.beginPath();g.arc(x,y,rr,0,7);g.fill();}
    for(let k=0;k<160;k++){const a=r()*6.28,d=Math.pow(r(),0.6)*w*0.42;g.fillStyle=`rgba(${rgb},${0.15+r()*0.3})`;
      g.fillRect(w/2+Math.cos(a)*d,h/2+Math.sin(a)*d,1+r()*3,1+r()*3);}};
  const scorchT=tex(blotch('52,41,30',0.24,1));
  const craterT=tex((g,w,h,r)=>{blotch('92,76,56',0.35,0.8)(g,w,h,r);
    const gr=g.createRadialGradient(w/2,h/2,w*0.06,w/2,h/2,w*0.2);gr.addColorStop(0,'rgba(44,36,28,0.6)');gr.addColorStop(0.7,'rgba(110,94,70,0.35)');gr.addColorStop(1,'rgba(110,94,70,0)');
    g.fillStyle=gr;g.beginPath();g.arc(w/2,h/2,w*0.2,0,7);g.fill();});
  const mudT=tex((g,w,h,r)=>{
    for(let k=0;k<90;k++){const x=w*(0.1+r()*0.8),y=h*(0.1+r()*0.8),rr=w*(0.05+r()*0.12);
      const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,`rgba(${78+r()*20|0},${62+r()*14|0},44,0.5)`);gr.addColorStop(1,'rgba(80,64,44,0)');
      g.fillStyle=gr;g.beginPath();g.arc(x,y,rr,0,7);g.fill();}
    g.globalCompositeOperation='destination-in';const e=g.createRadialGradient(w/2,h/2,w*0.3,w/2,h/2,w*0.5);e.addColorStop(0,'rgba(0,0,0,1)');e.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=e;g.fillRect(0,0,w,h);});
  // soot on a wall: thick at the foot of the fire and thinning in tongues up the face
  const sootT=tex((g,w,h,r)=>{
    for(let k=0;k<22;k++){const x=w*(0.2+r()*0.6),y0=h*(0.55+r()*0.35),top=h*(0.05+r()*0.4),bw=w*(0.06+r()*0.12);
      const gr=g.createLinearGradient(0,y0,0,top);gr.addColorStop(0,'rgba(20,17,15,0.55)');gr.addColorStop(1,'rgba(20,17,15,0)');
      g.fillStyle=gr;g.beginPath();g.moveTo(x-bw,y0);g.quadraticCurveTo(x-bw*0.3,(y0+top)/2,x+(r()-0.5)*bw,top);g.quadraticCurveTo(x+bw*0.3,(y0+top)/2,x+bw,y0);g.fill();}
    const e=g.createRadialGradient(w/2,h*0.8,0,w/2,h*0.8,w*0.3);e.addColorStop(0,'rgba(15,12,10,0.6)');e.addColorStop(1,'rgba(15,12,10,0)');g.fillStyle=e;g.fillRect(0,0,w,h);},64,128);
  // a pale scar on the black wall where a stone hit it: chipped stone round a pit, and cracks out of it
  const scarT=tex((g,w,h,r)=>{blotch('128,122,112',0.28,1.1)(g,w,h,r);
    g.strokeStyle='rgba(140,135,125,0.45)';g.lineWidth=1.1;
    for(let k=0;k<6;k++){let x=w/2+(r()-0.5)*w*0.2,y=h/2+(r()-0.5)*h*0.2,a=r()*6.28;g.beginPath();g.moveTo(x,y);for(let s=0;s<7;s++){a+=(r()-0.5)*1.1;x+=Math.cos(a)*w*0.06;y+=Math.sin(a)*h*0.06;g.lineTo(x,y);}g.stroke();}});

  // one instanced mesh per kind; `flat` marks lie on the ground, the others stand on a wall face
  const kinds=[];
  const kind=(name,t,n,flat)=>{
    const m=new THREE.MeshLambertMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
    const geo=flat?new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2):new THREE.PlaneGeometry(1,1);
    const mesh=new THREE.InstancedMesh(geo,m,n);mesh.count=0;mesh.frustumCulled=false;mesh.renderOrder=1;
    mesh.userData.noWire=true;mesh.userData.noFingerprint=true;mesh.receiveShadow=true;
    scene.add(mesh);WAR.push(mesh);const k={name,mesh,n,i:0};kinds.push(k);return k;};
  const put=(k,x,y,z,sx,sz,rot,rx)=>{
    D.position.set(x,y,z);D.rotation.set(rx||0,rot,0);D.scale.set(sx,1,sz);D.updateMatrix();
    k.mesh.setMatrixAt(k.i%k.n,D.matrix);k.i++;k.mesh.count=Math.min(k.n,k.i);k.mesh.instanceMatrix.needsUpdate=true;};
  const onGround=(k,x,z,sx,sz,rot)=>put(k,x,groundH(x,z)+0.25,z,sx,sz,rot===undefined?R()*6.28:rot);
  const onWall=(k,x,y,z,w,h,facing)=>{D.position.set(x,y,z);D.rotation.set(0,facing,0);D.scale.set(w,h,1);D.updateMatrix();
    k.mesh.setMatrixAt(k.i%k.n,D.matrix);k.i++;k.mesh.count=Math.min(k.n,k.i);k.mesh.instanceMatrix.needsUpdate=true;};

  const mud=kind('mud',mudT,80,true),crater=kind('crater',craterT,260,true),scorch=kind('scorch',scorchT,340,true);
  const soot=kind('soot',sootT,160,false),scar=kind('scar',scarT,120,false);

  // ---- the field ----
  const rim=S.wall||560,R0=S.r0||1250;
  const inArc=a=>a>A0&&a<A1;
  // trodden mud under each block, the size of it and turned with it (ctx.siege, from hosts.js)
  for(const b of ((ctx.siege&&ctx.siege.blocks)||[])){
    const ry=b.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry),x=b.position.x-fx*45,z=b.position.z-fz*45;
    onGround(mud,x,z,130,125,ry);}
  // and the lane Grond was dragged up, from the host to the Gate
  {const G=S.grond&&S.grond.at;if(G)for(let d=0;d<900;d+=55){const x=G[0]+d,z=G[1]+(R()-0.5)*8;onGround(mud,x,z,70,80,0);}}
  // craters and scorches where the city's own engines have been throwing out at the host for days
  for(let k=0;k<220;k++){const a=A0+(A1-A0)*R(),r=rim+60+Math.pow(R(),0.8)*(R0*1.4-rim);const x=Math.cos(a)*r,z=Math.sin(a)*r,s=5+R()*9;
    onGround(crater,x,z,s,s);if(R()<0.6){const s2=s*(1.8+R()*2);onGround(scorch,x+(R()-0.5)*6,z+(R()-0.5)*6,s2,s2);}}
  // ---- the arrows ----
  // Spent, stuck in the ground in front of the wall at the angle they came down at: a band of them, thickest
  // under the wall where the defenders were shooting at men who were standing there.
  {const N=2600,sh=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03,0.03,1.0,3).translate(0,0.5,0),new THREE.MeshLambertMaterial({color:0x6a5a44}),N);
   let n=0;for(let k=0;k<N;k++){const a=A0+(A1-A0)*R();if(!inArc(a))continue;const r=R_OUT+12+Math.pow(R(),1.8)*420,x=Math.cos(a)*r,z=Math.sin(a)*r;
     D.position.set(x,groundH(x,z),z);D.rotation.set((R()-0.5)*0.9,R()*6.28,(R()-0.5)*0.9);D.scale.set(1,0.8+R()*0.4,1);D.updateMatrix();sh.setMatrixAt(n++,D.matrix);}
   sh.count=n;sh.frustumCulled=false;sh.userData.noFingerprint=true;scene.add(sh);WAR.push(sh);}

  // ---- the walls ----
  // Each circle's wall stands on the ground outside it and is 22 m over it (30 for the first); its outer face is
  // half its thickness out from the circle. The marks stand a hand's breadth off that face, and keep out of the
  // gateways and off the rock (ctx.keel), where the wall is not.
  const gateA=k=>k===0?0:(k%2?1:-1)*(0.62+0.20*k);
  const onRock=(x,z)=>{const Kl=ctx.keel;return Kl&&x>0&&x<Kl.EAST+Kl.OVER(Kl.EAST)+6&&Math.abs(z)<Kl.HW(Math.min(x,Kl.EAST))*1.15+8;};
  for(let k=0;k<TIERS;k++){
    const r=R_OUT-k*STEP+(k?4.5:6.5)+0.35,top=k?22:30;
    const n=k===0?55:Math.round(26-k*2);
    for(let i=0;i<n;i++){
      // the first wall is scarred most on the side the host is on; the others are burned all round
      const a=k===0?A0+(A1-A0)*Math.pow(R(),1)*1:R()*6.28;
      let da=Math.abs(((a-gateA(k))%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI);if(da<0.09)continue;
      const x=Math.cos(a)*r,z=Math.sin(a)*r;if(onRock(x,z))continue;
      const g=groundH(Math.cos(a)*(r+6),Math.sin(a)*(r+6)),facing=-a+Math.PI/2;
      if(k===0){const s=5+R()*9;onWall(scar,x,g+5+R()*(top-10),z,s*(0.8+R()*0.5),s,facing);}
      else{const w=6+R()*12,h=top*(0.7+R()*0.3);onWall(soot,x,g+h/2,z,w,h,facing);}}}
  // and the stones that hit the Gate's own towers and the wall either side of it hardest of all
  for(let i=0;i<12;i++){const a=(R()-0.5)*0.12,r=R_OUT+6.85;if(Math.abs(a)<0.018)continue;const x=Math.cos(a)*r,z=Math.sin(a)*r,s=5+R()*7;
    onWall(scar,x,groundH(x+8,z)+3+R()*24,z,s,s,-a+Math.PI/2);}

  // ---- what lands from now on ----
  // Fire where a lit stone came down in a street or a yard leaves a scorch (hosts.js calls ctx.onSiegeHit);
  // on a roof there is nothing flat to lay one on, and the roof is burning anyway.
  const scorchAt=(x,y,z,rr)=>{const g=groundH(x,z),rf=roofAt?roofAt(x,z)||0:0;if(rf>g+1.5&&Math.abs(y-rf)<3)return;
    const s=(rr||5)*(1.6+R()*0.8);put(scorch,x,Math.max(g,Math.min(y,g+2))+0.25,z,s,s,R()*6.28);};
  ctx.decals={scorch:scorchAt};
  ctx.onSiegeHit=(x,y,z)=>scorchAt(x,y,z,5);

  ctx.details=Object.assign(ctx.details||{},{decals:kinds.reduce((s,k)=>s+k.mesh.count,0)});
}
