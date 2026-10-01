// ---------- the work in the fields ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// The Shire is farmed: "a well-ordered and well-farmed countryside". tools/make-shire.py decides what is being
// done in each field, and places it where the field's outline is known (plan.work), so nothing stands in a hedge
// or strays into the next field:
//   stooks      sheaves stood up in sixes on the wheat that is being harvested, in lines along the rows
//   workers     hobbits reaping at the edge of the standing wheat, pitching hay onto a cart, hoeing the
//               market gardens (0, 1, 2)
//   teams       a pony and a plough and a hobbit behind it, working up and down the field, a furrow over each time
//   carts       a hay cart, loaded, the pony standing in the shafts
//   scarecrows  in the barley and the roots
// They all go home at dusk.
import { mkRng } from '../core/rng.js';

export function fields(api){
  const {THREE,ctx,scene,groundH,mergeParts,animHooks}=api;
  const V=ctx.plan;if(!V||!V.work)return;
  const W=V.work,R=mkRng(1401);
  const nf=()=>api.nightF?api.nightF(api.hour()):0;
  const o=new THREE.Object3D(),col=new THREE.Color();
  // merged meshes share a material per colour; instanced ones get their own (r128 recompiles a material that
  // is drawn both ways, and one with instance colours must not be shared with one without)
  const LM={},lam=c=>LM[c]||(LM[c]=new THREE.MeshLambertMaterial({color:c,flatShading:true})),lamI=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});

  // ---- stooks: six sheaves leant together, a tuft of ears on top ----
  {const n=W.stooks.length/3;
   const g=new THREE.ConeGeometry(0.55,1.4,6).translate(0,0.7,0);
   const m=new THREE.InstancedMesh(g,lamI(0xffffff),n);
   for(let i=0;i<n;i++){const x=W.stooks[i*3],z=W.stooks[i*3+1];o.position.set(x,groundH(x,z)-0.05,z);o.rotation.set((R()-0.5)*0.12,R()*6.28,(R()-0.5)*0.12);
     const s=0.85+R()*0.3;o.scale.set(s,s*(0.9+R()*0.2),s);o.updateMatrix();m.setMatrixAt(i,o.matrix);m.setColorAt(i,col.setHex([0xd8b85a,0xceac50,0xe0c068,0xc8a44a][Math.floor(R()*4)]));}
   m.instanceColor.needsUpdate=true;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.userData.wireCat='veg';m.name='stooks';scene.add(m);}

  // ---- the static pieces, merged by colour: carts, scarecrows ----
  const byC=new Map();
  const put=(geo,c,x,y,z,ry,rx)=>{const m=new THREE.Mesh(geo,null);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0,'YXZ');if(!byC.has(c))byC.set(c,[]);byC.get(c).push(m);};
  // a frame at (x, z) turned `a`: u along, w across
  const fr=(x,z,a)=>{const c=Math.cos(a),s=Math.sin(a);return (u,w)=>{const px=x+c*u-s*w,pz=z+s*u+c*w;return [px,groundH(px,pz),pz];};};
  const pony=(P,a,u,w)=>{const [x,y,z]=P(u,w),ry=-a+Math.PI/2;
    put(new THREE.BoxGeometry(0.55,0.6,1.3),0x8a6a4a,x,y+1.0,z,ry);
    const f=fr(x,z,a);const [hx,,hz]=f(-0.75,0);          // facing away from the cart
   put(new THREE.BoxGeometry(0.3,0.6,0.35),0x8a6a4a,hx,y+1.45,hz,ry,-0.5);
    for(const [lu,lw] of [[-0.5,-0.18],[-0.5,0.18],[0.5,-0.18],[0.5,0.18]]){const [lx,,lz]=f(lu,lw);put(new THREE.BoxGeometry(0.12,0.72,0.12).translate(0,0.36,0),0x6a4a3a,lx,y,lz,ry);}};
  for(let i=0;i<W.carts.length;i+=3){const x=W.carts[i],z=W.carts[i+1],a=W.carts[i+2],P=fr(x,z,a),[cx,cy,cz]=P(0,0),ry=-a+Math.PI/2;
    put(new THREE.BoxGeometry(1.8,0.3,3.2),0x8a6a48,cx,cy+1.0,cz,ry);
    for(const d of [-1,1]){const [wx,wy,wz]=P(0.3,d*1.0);put(new THREE.CylinderGeometry(0.75,0.75,0.1,12).rotateZ(Math.PI/2),0x4a3a2a,wx,wy+0.75,wz,ry);}
    put(new THREE.SphereGeometry(1,10,7).scale(1.3,1.1,2.0),0xd4b460,cx,cy+1.8,cz,ry);          // the load
    pony(P,a,-3.4,0);}
  for(let i=0;i<W.scarecrows.length;i+=3){const x=W.scarecrows[i],z=W.scarecrows[i+1],a=W.scarecrows[i+2],y=groundH(x,z);
    put(new THREE.BoxGeometry(0.1,2.3,0.1).translate(0,1.15,0),0x6a4a2a,x,y,z,a);
    put(new THREE.BoxGeometry(1.7,0.1,0.1),0x6a4a2a,x,y+1.75,z,a);
    put(new THREE.CylinderGeometry(0.2,0.42,0.9,6),[0x8a5a3a,0x5a6a8a,0x7a7a3a][i%3],x,y+1.45,z,a);   // the coat
    put(new THREE.SphereGeometry(0.2,7,5),0xd8c8a0,x,y+2.1,z,a);
    put(new THREE.CylinderGeometry(0.34,0.34,0.04,10),0x4a3a2a,x,y+2.26,z,a);put(new THREE.CylinderGeometry(0.15,0.2,0.28,8),0x4a3a2a,x,y+2.4,z,a);}
  for(const [c,list] of byC){const g=mergeParts(list,lam(c));if(g){g.castShadow=true;g.receiveShadow=true;scene.add(g);}}

  // ---- the plough teams: every part of a team is one instanced mesh across all the teams ----
  // along local -z: the pony leads, the plough behind it, the hobbit behind that; legs swing
  const PARTS=[[new THREE.BoxGeometry(0.55,0.6,1.3),0x7a5a3a,[0,1.0,-2.2]],[new THREE.BoxGeometry(0.3,0.6,0.35),0x7a5a3a,[0,1.45,-2.95],0.5],
    ...[[-0.18,-2.7],[0.18,-2.7],[-0.18,-1.7],[0.18,-1.7]].map(([lx,lz],k)=>[new THREE.BoxGeometry(0.12,0.72,0.12).translate(0,-0.36,0),0x5a3a2a,[lx,0.72,lz],0,k]),
    ...[-0.35,0.35].map(d=>[new THREE.BoxGeometry(0.05,0.05,1.4),0x4a3a2a,[d,0.8,-1.0]]),                   // the traces
    [new THREE.BoxGeometry(0.2,0.2,1.8),0x6a4a2a,[0,0.35,0.2],-0.25],[new THREE.BoxGeometry(0.08,0.5,0.4),0x5a5a5a,[0,0.1,-0.5]],   // beam, share
    ...[-0.3,0.3].map(d=>[new THREE.BoxGeometry(0.06,0.06,1.2),0x6a4a2a,[d,0.75,1.1],-0.5]),                 // handles
    [new THREE.CylinderGeometry(0.22,0.3,0.75,8).translate(0,0.55,0),0xffffff,[0,0,1.9],0,-1,true],[new THREE.SphereGeometry(0.17,8,6).translate(0,1.08,0),0xe8c8a8,[0,0,1.9]]];
  const NT=W.teams.length;
  const teamM=PARTS.map(([g,c,,,,tint])=>{const m=new THREE.InstancedMesh(g,lamI(tint?0xffffff:c),Math.max(1,NT));
    m.count=NT;m.castShadow=true;m.frustumCulled=false;m.userData.noFingerprint=true;m.userData.noWire=true;scene.add(m);
    if(tint){for(let i=0;i<NT;i++)m.setColorAt(i,col.setHex([0x4a8a3a,0xb85a3a,0x3a6a8a][i%3]));m.instanceColor.needsUpdate=true;}return m;});
  const teams=W.teams.map(([x,z,th,L,Wd])=>({x,z,th,L,Wd,ph:R()*1000}));
  const Mt=new THREE.Matrix4(),Ml=new THREE.Matrix4(),El=new THREE.Euler(),Ql=new THREE.Quaternion(),Pl=new THREE.Vector3(),S1=new THREE.Vector3(1,1,1);

  // ---- the hobbits at work ----
  const NW=W.workers.length/4;
  const CLOTH=[0xd8b83a,0x4a8a3a,0x8a5a2a,0x3a6a8a,0xb85a3a,0x6a8a2a,0xe0d0a0];
  const body=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22,0.3,0.75,8).translate(0,0.55,0),lamI(0xffffff),NW);
  const head=new THREE.InstancedMesh(new THREE.SphereGeometry(0.17,8,6).translate(0,1.08,0),lamI(0xe8c8a8),NW);
  const tool=new THREE.InstancedMesh(new THREE.BoxGeometry(0.05,0.05,1.5).translate(0,0,0.75),lamI(0x6a4a2a),NW);
  for(let i=0;i<NW;i++)body.setColorAt(i,col.setHex(CLOTH[Math.floor(R()*CLOTH.length)]));
  body.instanceColor.needsUpdate=true;
  for(const m of [body,head,tool]){m.frustumCulled=false;m.castShadow=true;m.userData.noFingerprint=true;m.userData.noWire=true;scene.add(m);}
  const workers=[];for(let i=0;i<NW;i++){const x=W.workers[i*4],z=W.workers[i*4+1];workers.push({x,z,y:groundH(x,z),a:W.workers[i*4+2]+(R()-0.5)*0.8,k:W.workers[i*4+3],ph:R()*6.28});}
  const q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s1=new THREE.Vector3(1,1,1),M=new THREE.Matrix4();

  animHooks.push(now=>{
    const t=now/1000,n=nf(),out=n<0.6;
    body.visible=head.visible=tool.visible=out;
    if(out){
      workers.forEach((w,i)=>{
        // reaping: a scythe swung low from side to side; pitching: a fork raised and lowered; hoeing: chopping
        const sw=Math.sin(t*(w.k===0?1.6:w.k===1?1.2:2.2)+w.ph),bend=w.k===2?0.25+0.15*sw:w.k===1?0.15:0.2;
        e.set(bend,w.a+(w.k===0?sw*0.6:0),0,'YXZ');q.setFromEuler(e);p.set(w.x,w.y,w.z);M.compose(p,q,s1);body.setMatrixAt(i,M);head.setMatrixAt(i,M);
        const ta=w.k===0?0.9+0.1*sw:w.k===1?-0.4-0.6*Math.max(0,sw):0.6+0.4*sw;
        e.set(ta,w.a+(w.k===0?sw*1.1:0),0,'YXZ');q.setFromEuler(e);p.set(w.x,w.y+0.85,w.z);M.compose(p,q,s1);tool.setMatrixAt(i,M);});
      body.instanceMatrix.needsUpdate=head.instanceMatrix.needsUpdate=tool.instanceMatrix.needsUpdate=true;}
    for(const m of teamM)m.visible=out;
    if(out){teams.forEach((T,ti)=>{
      // up the field and back, a furrow over each time: 0.9 m/s, a pass a metre and a half across
      const passes=Math.max(2,Math.floor(2*T.Wd/1.5)),per=2*T.L/0.9,tt=(t+T.ph)/per,k=Math.floor(tt)%passes,f=tt-Math.floor(tt);
      const dir=k%2?-1:1,along=(f*2-1)*T.L*dir,across=-T.Wd+k*1.5;
      const rx=-Math.sin(T.th),rz=Math.cos(T.th),ax=Math.cos(T.th),az=Math.sin(T.th);
      const x=T.x+rx*along+ax*across,z=T.z+rz*along+az*across;
      El.set(0,Math.atan2(-rx*dir,-rz*dir),0);Ql.setFromEuler(El);Pl.set(x,groundH(x,z),z);Mt.compose(Pl,Ql,S1);
      PARTS.forEach(([,,pos,rx0,leg],pi)=>{const sw=leg!==undefined&&leg>=0?Math.sin(t*5+(leg%2?Math.PI:0)+(leg>1?Math.PI:0))*0.35:0;
        El.set((rx0||0)+sw,0,0);Ql.setFromEuler(El);Pl.set(pos[0],pos[1],pos[2]);Ml.compose(Pl,Ql,S1);Ml.premultiply(Mt);teamM[pi].setMatrixAt(ti,Ml);});});
      for(const m of teamM)m.instanceMatrix.needsUpdate=true;}
  });
  ctx.details=Object.assign(ctx.details||{},{stooks:W.stooks.length/3,ploughTeams:teams.length,hayCarts:W.carts.length/3,scarecrows:W.scarecrows.length/3,fieldHands:NW});
}
