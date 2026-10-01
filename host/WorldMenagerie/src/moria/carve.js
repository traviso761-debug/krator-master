// ---------- carving: rooms and passages in the rock, and the floors you can walk on ----------
// Fan work from Tolkien; every shape is this project's own.
//
// halls.js and city.js both cut the mountain the same way: a room is a floor, a roof and four walls with holes
// cut where it opens into the next; a passage is lengths of tunnel along the legs of a polyline, stepped where it
// is a stair. Everything carved here also says where its floor is (ctx.moria.floors), and anything standing on a
// floor that you cannot walk through says so too (ctx.moria.blocks): the walking camera (walk.js) reads both,
// so it goes where the halls go and nowhere else.
//
//   floors  {name, rect:[x0,x1,z0,z1], y}                        a level floor
//           {name, a:[x,z,y], b:[x,z,y], w}                      a strip between two points, its floor rising
//                                                                along it (a passage, a stair, a bridge)
//   blocks  [x0,x1,z0,z1,y0,y1]                                  a pillar, a house, a hearth
export function makeCarver(api,{put,mats}){
  const {THREE,ctx}=api;
  const M=ctx.moria=ctx.moria||{};M.floors=M.floors||[];M.blocks=M.blocks||[];
  const plane=(w,h,mat)=>new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
  const floor=f=>{M.floors.push(f);return f;};
  const block=(x0,x1,z0,z1,y0,y1)=>{M.blocks.push([x0,x1,z0,z1,y0,y1]);};

  // ---- a room: floor, roof, and four walls, each wall cut round its openings ----
  // openings: {side:'w'|'e'|'n'|'s', u0,u1 (along the wall, in world x or z), y0,y1 (above the floor)}
  // o.walk: false for a room you do not walk the floor of (the chasm, a cistern under water); o.floor: false for
  // a room whose floor is laid by hand (the Delvings, round their pit)
  function room([x0,x1,z0,z1,fl,h],openings=[],o={}){
    const W=o.wall||mats.stone,F=o.floor||mats.floor;
    if(o.floor!==false){const f=plane(x1-x0,z1-z0,F);f.rotation.x=-Math.PI/2;f.position.set((x0+x1)/2,fl,(z0+z1)/2);put(f);}
    const c=plane(x1-x0,z1-z0,o.roof||W);c.rotation.x=Math.PI/2;c.position.set((x0+x1)/2,fl+h,(z0+z1)/2);put(c);
    const wall=(side,a0,a1,fixed)=>{   // a wall along x (n/s, at z=fixed) or along z (w/e, at x=fixed), split round openings
      const ops=openings.filter(q=>q.side===side).sort((p,q)=>p.u0-q.u0);
      const piece=(u0,u1,y0,y1)=>{if(u1-u0<0.01||y1-y0<0.01)return;const m=plane(u1-u0,y1-y0,W);
        if(side==='n'||side==='s'){m.position.set((u0+u1)/2,fl+(y0+y1)/2,fixed);}else{m.position.set(fixed,fl+(y0+y1)/2,(u0+u1)/2);m.rotation.y=Math.PI/2;}put(m);};
      let u=a0;for(const q of ops){piece(u,q.u0,0,h);piece(q.u0,q.u1,0,q.y0);piece(q.u0,q.u1,q.y1,h);u=q.u1;}piece(u,a1,0,h);};
    wall('n',x0,x1,z0);wall('s',x0,x1,z1);wall('w',z0,z1,x0);wall('e',z0,z1,x1);
    if(o.walk!==false&&o.floor!==false)floor({name:o.name,rect:[x0,x1,z0,z1],y:fl});
    return {x0,x1,z0,z1,fl,h};}
  const op=(side,c,w,y1,y0=0)=>({side,u0:c-w/2,u1:c+w/2,y0,y1});

  // ---- a passage: lengths of tunnel along each leg, stepped where it is a stair ----
  // {p:[[x,z,y],...], w, h, steps, gap, end}: gap, a fraction along the first leg where a fissure crosses the floor;
  // end, the last leg ends in fallen rock
  const stepMs=[];
  function passage(def,name){const {p,w,h,steps,gap,end}=def,R=def.rnd||Math.random;
    for(let s=0;s+1<p.length;s++){const [ax,az,ay]=p[s],[bx,bz,by]=p[s+1],run=Math.hypot(bx-ax,bz-az),N=Math.max(1,Math.ceil(run/160));
      const yaw=Math.atan2(bz-az,bx-ax);
      for(let i=0;i<N;i++){const t0=i/N,t1=(i+1)/N,x0=ax+(bx-ax)*t0,z0=az+(bz-az)*t0,y0=ay+(by-ay)*t0,x1=ax+(bx-ax)*t1,z1=az+(bz-az)*t1,y1=ay+(by-ay)*t1;
        const len=Math.hypot(x1-x0,z1-z0),pitch=Math.atan2(y1-y0,len),g=new THREE.Group();
        g.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);g.rotation.order='YZX';g.rotation.set(0,-yaw,pitch);
        const sl=len/Math.cos(pitch)+0.6;
        const fl=plane(sl,w,mats.floor);fl.rotation.x=-Math.PI/2;g.add(fl);const rf=plane(sl,w,mats.stone);rf.rotation.x=Math.PI/2;rf.position.y=h;g.add(rf);
        for(const sd of [-1,1]){const sw=plane(sl,h,mats.stone);sw.position.set(0,h/2,sd*w/2);g.add(sw);}
        g.updateMatrixWorld(true);for(const m of g.children){const mm=m.clone();mm.applyMatrix4(g.matrix);put(mm);}}
      // the stair: steps standing on the slope, each rising from the one below
      if(steps){const rise=(by-ay)/steps,tread=run/steps;
        for(let i=0;i<steps;i++){const t=(i+0.5)/steps,top=ay+rise*(rise>0?i+1:i);stepMs.push([ax+(bx-ax)*t,top,az+(bz-az)*t,yaw,tread,Math.abs(rise)+0.8,w-0.3]);}}
      // a fissure right across the floor, seven feet wide, black to the bottom
      if(gap&&s===0){const x=ax+(bx-ax)*gap,z=az+(bz-az)*gap,y=ay+(by-ay)*gap,c=plane(2.2,w-0.1,mats.void);c.rotation.set(-Math.PI/2,0,-yaw);c.position.set(x,y+0.08,z);put(c);}
      // the ways not taken end in fallen rock
      if(end&&s+2===p.length){const c=plane(w,h,mats.stone);c.rotation.y=-yaw+Math.PI/2;c.position.set(bx,by+h/2,bz);put(c);
        for(let k=0;k<14;k++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(0.6+R()*1.4,0),mats.stone);r.position.set(bx-Math.cos(yaw)*R()*6+(R()-0.5)*w*0.6*Math.sin(yaw),by+R()*1.5,bz-Math.sin(yaw)*R()*6+(R()-0.5)*w*0.6*Math.cos(yaw));put(r);}}
      // stop short of a rock-fall, so nobody walks into it
      const cut=end&&s+2===p.length?5/Math.max(1,run):0;
      floor({name,a:[ax,az,ay],b:[bx-(bx-ax)*cut,bz-(bz-az)*cut,by-(by-ay)*cut],w:w-1});}}
  // all the steps of every stair, as one instanced mesh; call once, after the last passage
  function steps(stepM){const D=new THREE.Object3D(),im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,-0.5,0),stepM,Math.max(1,stepMs.length));
    stepMs.forEach(([x,y,z,yaw,tr,ht,w],i)=>{D.position.set(x,y,z);D.rotation.set(0,-yaw,0);D.scale.set(tr+0.02,ht,w);D.updateMatrix();im.setMatrixAt(i,D.matrix);});
    im.count=stepMs.length;im.frustumCulled=false;im.receiveShadow=true;return im;}
  return {room,op,passage,steps,stepMs,floor,block,plane};
}
