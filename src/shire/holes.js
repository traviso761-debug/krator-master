// ---------- the holes ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// "In a hole in the ground there lived a hobbit. ... It had a perfectly round door like a porthole, painted
// green, with a shiny yellow brass knob in the exact middle." The best rooms have "deep-set round windows
// looking over his garden, and meadows beyond, sloping down to the river".
//
// A hole is dug into a slope, so what you see of it is a face: a curved front of stone set into the hill, a
// lip of turf over it, the round door in the middle with its knob, round windows either side, a step, and in
// front a garden - a gate in a low fence, a path, flowers. The chimneys come up out of the grass further back
// up the hill, which is the only sign from above that anybody lives there. Tolkien paints the doors in rows
// up the Hill in every colour; Bag End, near the top, is the biggest, and its garden the best.
//
// Every hole is built in its own frame: f is out of the hill (downhill), r is to the right as you face the
// door. All the parts are merged by material, so fifty holes are a dozen draw calls.

export function holes(api){
  const {THREE,ctx,scene,groundH,mergeParts}=api;
  const V=ctx.plan;if(!V)return;
  const R=mkR(1937);
  const mats={};const matOf=(c,o)=>{const k=c+(o?JSON.stringify(o):'');return mats[k]||(mats[k]=new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{})));};
  const byMat=new Map();
  const put=(geo,c,x,y,z,ry,rx,o)=>{const m=new THREE.Mesh(geo,matOf(c,o));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0,'YXZ');m.updateMatrix();
    const mt=m.material;if(!byMat.has(mt))byMat.set(mt,[]);byMat.get(mt).push(m);return m;};
  const glass=0x2a2a26,frame=0x5e4633,stone=0xcfc3a6,turf=0x6a9c44,brick=0x9a5a42,brass=0xd8b04a,fence=0xe8e2d0;
  const FLOW=[0xd84a5a,0xe8c84a,0x9a6ac8,0xf0f0e8,0xe07a3a,0xc8507a];
  const smoke=[];
  const info=[];

  for(const h of V.holes){
    const s=h.size||1,a=h.face,fx=Math.sin(a),fz=Math.cos(a),rx=Math.cos(a),rz=-Math.sin(a);
    const at=(u,w)=>[h.x+rx*u+fx*w,h.z+rz*u+fz*w];        // u to the right, w out of the hill
    const y0=h.y;const ry=a;                                 // a mesh turned by `a` faces +z = out of the hill
    // ---- the face: a shallow curve of stone set into the slope, and turf over it ----
    const W=(3.8+h.windows*1.05)*s,Hf=2.7*s;
    const face=new THREE.CylinderGeometry(W*0.62,W*0.62,Hf,18,1,false,-0.95,1.9);    // a curved front, concave side out
    // the face bulges gently: its front is at wf(u), and it turns by ang(u), so windows sit on it, not in the air
    const RF=W*0.62,CF=-RF-0.12,wf=u=>CF+Math.sqrt(Math.max(0,RF*RF-u*u)),ang=u=>Math.asin(Math.max(-1,Math.min(1,u/RF)));
    {const [x,z]=at(0,CF);put(face,stone,x,y0-0.3+Hf/2,z,ry);}
    {const g=new THREE.CylinderGeometry(W*0.64,W*0.66,0.5,18,1,false,-1.0,2.0);const [x,z]=at(0,-W*0.64+0.45);put(g,turf,x,y0-0.3+Hf+0.05,z,ry);}
    // the ground behind the face, built up to meet the hill where the slope is not steep enough to hide it
    // the hill closes over it: a turf berm behind and round the face, so that the hole is dug in, not set down
    // (its front is kept just behind the face at every height, so it rises over the brow and never over the door)
    {const a2=W*0.55,[x,z]=at(0,-a2-0.15);const g=new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2);
      const m=put(g,0x6a9c44,x,y0-0.6,z,ry);m.scale.set(W*0.8,Hf+2.4,a2);m.updateMatrix();}
    // ---- the door: round, painted, a brass knob in the exact middle, a frame, a step ----
    const dr=0.85*s,dy=y0+dr+0.12;
    {const [x,z]=at(0,0.02);put(new THREE.CylinderGeometry(dr,dr,0.14,28).rotateX(Math.PI/2),parseInt(h.door.slice(1),16),x,dy,z,ry);
     put(new THREE.TorusGeometry(dr+0.08,0.1,6,28),frame,x,dy,z,ry);
     const [kx,kz]=at(0,0.12);put(new THREE.SphereGeometry(0.075*s,8,6),brass,kx,dy,kz,ry,0,{emissive:0x302000});
     const [sx,sz]=at(0,0.55);put(new THREE.BoxGeometry(1.6*s,0.22,0.9),stone,sx,y0-0.02,sz,ry);}
    // ---- round windows either side ----
    for(let k=0;k<h.windows;k++){const side=k%2?1:-1,rank=Math.floor(k/2)+1,u=side*(dr+0.9+rank*1.5)*s;
      if(Math.abs(u)>RF*0.92)continue;
      const wr=(h.bagEnd?0.5:0.44)*s,wy=y0+1.25*s,wa=ry+ang(u),[x,z]=at(u,wf(u)+0.02);
      put(new THREE.CylinderGeometry(wr,wr,0.1,20).rotateX(Math.PI/2),glass,x,wy,z,wa);
      put(new THREE.TorusGeometry(wr+0.04,0.07,5,20),frame,x,wy,z,wa);
      // the glazing bars
      put(new THREE.BoxGeometry(wr*2,0.05,0.06),frame,x,wy,z,wa);put(new THREE.BoxGeometry(0.05,wr*2,0.06),frame,x,wy,z,wa);
      if(R()<0.6){const [bx,bz]=at(u,wf(u)+0.3);put(new THREE.BoxGeometry(wr*2.2,0.25,0.4),0x7a5a3a,bx,wy-wr-0.1,bz,wa);   // a window box, and what is in it
        for(let f=0;f<4;f++){const [px,pz]=at(u-wr+f*wr*0.66,wf(u)+0.36);put(new THREE.IcosahedronGeometry(0.08,0),FLOW[(f+k)%FLOW.length],px,wy-wr+0.1,pz,0);}}}
    // ---- the chimneys, up the hill ----
    for(let k=0;k<(h.bagEnd?3:1);k++){const [x,z]=at((k-(h.bagEnd?1:0))*3.5*s,-4.5*s-k%2*1.5);const g=groundH(x,z);
      put(new THREE.BoxGeometry(0.55,1.5,0.55).translate(0,0.75,0),brick,x,g-0.2,z,ry);put(new THREE.CylinderGeometry(0.16,0.2,0.5,8).translate(0,1.55,0),0x8a4a36,x,g-0.2,z,0);
      smoke.push([x,g+1.9,z]);}
    // ---- the garden: a path to a gate in a low white fence, and flowers either side ----
    const GD=(h.bagEnd?9:6)*s,GW=(W*0.9);
    for(let u=-GW/2;u<=GW/2+0.01;u+=0.5){if(Math.abs(u)<0.8)continue;const [x,z]=at(u,GD);const g=groundH(x,z);
      put(new THREE.BoxGeometry(0.08,0.8,0.08).translate(0,0.4,0),fence,x,g,z,ry);}
    for(const sd of [-1,1]){const [x,z]=at(sd*(GW/4+0.4),GD);put(new THREE.BoxGeometry(GW/2-0.8,0.07,0.06),fence,x,groundH(x,z)+0.65,z,ry);}
    {const [x,z]=at(0,GD);for(let k=-3;k<=3;k++){const [gx,gz]=at(k*0.2,GD);put(new THREE.BoxGeometry(0.07,0.85,0.06).translate(0,0.42,0),fence,gx,groundH(x,z),gz,ry);}
     put(new THREE.BoxGeometry(1.4,0.07,0.06),fence,x,groundH(x,z)+0.62,z,ry);}
    for(let w=0.8;w<GD;w+=0.9){const [x,z]=at((R()-0.5)*0.2,w);put(new THREE.CylinderGeometry(0.42,0.42,0.08,7),0xbdb4a0,x,groundH(x,z)+0.02,z,0);}
    // flowers in clumps: a green cushion with points of colour on it
    for(let k=0;k<(h.bagEnd?26:10);k++){const sd=R()<0.5?-1:1,u=sd*(0.9+R()*(GW/2-1.2)),w=1.2+R()*(GD-1.8),[x,z]=at(u,w),gy=groundH(x,z);
      put(new THREE.IcosahedronGeometry(0.28,0).scale(1,0.55,1),0x4f7a34,x,gy+0.1,z,0);
      const fc=FLOW[Math.floor(R()*FLOW.length)];for(let f=0;f<5;f++)put(new THREE.IcosahedronGeometry(0.06,0),fc,x+(R()-0.5)*0.45,gy+0.3+R()*0.12,z+(R()-0.5)*0.45,0);}
    if(h.bagEnd){
      // "No admittance except on party business", on the gate
      const [x,z]=at(0.9,GD+0.1);put(new THREE.BoxGeometry(0.7,0.4,0.05),0xe8e0c8,x,groundH(x,z)+1.05,z,ry);
      // and the bench by the door
      const [bx,bz]=at(-2.8*s,wf(-2.8*s)+0.9);put(new THREE.BoxGeometry(1.6,0.12,0.45),frame,bx,y0+0.45,bz,ry);
      info.push({name:'Bag End',x:h.x,z:h.z,info:'Bag End, Under-Hill: "a very comfortable tunnel without smoke". The round green door with its brass knob in the exact middle, the deep-set round windows of the best rooms looking over the garden and the meadows down to the Water, and the notice on the gate.'});
    }
  }
  const group=new THREE.Group();group.name='holes';
  for(const [m,list] of byMat){const g=mergeParts(list,m);if(g){g.castShadow=true;g.receiveShadow=true;group.add(g);}}
  scene.add(group);
  ctx.shireSmoke=(ctx.shireSmoke||[]).concat(smoke);
  ctx.shireCards=(ctx.shireCards||[]).concat(info);
  ctx.details=Object.assign(ctx.details||{},{holes:V.holes.length});
}

function mkR(s){return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
