// ---------- Kai Tak, and why the block stops at fourteen storeys ----------
// The approach to runway 13 came in over Kowloon City: aircraft crossed the rooftops a couple of hundred
// feet up, made the right turn at the checkerboard on the hillside, and were on the ground forty seconds
// later. That approach is the reason nothing here is taller - it is the only planning rule the Walled City
// ever obeyed. One aeroplane, on the circuit, every half minute or so.
export function kaitak(api){
  const {THREE,C,ctx,scene,animHooks,groundH}=api;
  const K=C.kaitak;if(!K)return;
  const white=new THREE.MeshLambertMaterial({color:0xe8e6e0});
  const dark=new THREE.MeshLambertMaterial({color:0x3a4048});
  const glass=new THREE.MeshLambertMaterial({color:0x2a3038});
  const g=new THREE.Group();
  const L=K.length||36,W=K.span||30;
  const body=new THREE.Mesh(new THREE.CylinderGeometry(L*0.055,L*0.05,L,10).rotateZ(Math.PI/2),white);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(L*0.055,L*0.12,10).rotateZ(-Math.PI/2),white);
  nose.position.x=L*0.56;
  const tail=new THREE.Mesh(new THREE.BoxGeometry(L*0.16,L*0.22,L*0.02),dark);tail.position.set(-L*0.46,L*0.14,0);
  const stab=new THREE.Mesh(new THREE.BoxGeometry(L*0.14,L*0.012,L*0.3),white);stab.position.set(-L*0.44,L*0.03,0);
  const wing=new THREE.Mesh(new THREE.BoxGeometry(L*0.2,L*0.015,W),white);wing.position.set(-L*0.02,-L*0.02,0);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(L*0.9,L*0.02,L*0.11),dark);stripe.position.set(0,L*0.01,0);
  g.add(body,nose,tail,stab,wing,stripe);
  for(const sd of [-1,1]){
    const eng=new THREE.Mesh(new THREE.CylinderGeometry(L*0.045,L*0.045,L*0.13,8).rotateZ(Math.PI/2),glass);
    eng.position.set(L*0.02,-L*0.06,sd*W*0.28);g.add(eng);
  }
  scene.add(g);
  // the checkerboard on the hillside, which is what the turn was made at
  if(K.checker){
    const [cx,cz]=K.checker;
    const red=new THREE.MeshLambertMaterial({color:0xb4322a}),cream=new THREE.MeshLambertMaterial({color:0xe8dfc8});
    const rock=new THREE.MeshLambertMaterial({color:0x5f6a54,flatShading:true});
    const gy=groundH(cx,cz), turn=K.checkerTurn||0;
    // ---- the hill it is painted on ----
    // The board was not a sign on a post, it was paint on the side of a hill at Kowloon Tsai, and this map
    // has no hill there: without one the thing hangs in the air over the rooftops with nothing holding it
    // up, which was the single most obviously wrong object on the page.
    for(let k=0;k<9;k++){
      const w=120-k*10, h=14, d=54-k*4;
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),rock);
      m.position.set(cx+(Math.sin(k*2.1))*5,gy+k*8,cz+16+k*3.4);
      m.rotation.y=turn+(k%2?0.05:-0.05);scene.add(m);
    }
    for(let k=0;k<16;k++){                              // scrub on it, so it is a hill and not a ramp
      const m=new THREE.Mesh(new THREE.IcosahedronGeometry(3+(k%4)*1.6,0),
        new THREE.MeshLambertMaterial({color:k%3?0x4c6a3e:0x56724a,flatShading:true}));
      m.position.set(cx+((k*37)%90)-45,gy+8+((k*53)%60),cz+22+((k*29)%26));scene.add(m);
    }
    // the board, standing just proud of the face
    for(let i=0;i<6;i++)for(let j=0;j<6;j++){
      const p=new THREE.Mesh(new THREE.BoxGeometry(6,6,0.6),(i+j)%2?red:cream);
      p.position.set(cx+(i-2.5)*6,gy+30+(5-j)*6,cz);p.rotation.y=turn;scene.add(p);
    }
  }
  const A=K.from||[-1400,-900,420],Bp=K.to||[900,700,20],period=K.period||34000;
  animKaiTak();
  function animKaiTak(){
    animHooks.push(now=>{
      const t=(now%period)/period;
      const ease=t<0.86?t/0.86:1;
      const x=A[0]+(Bp[0]-A[0])*ease,z=A[1]+(Bp[1]-A[1])*ease,y=A[2]+(Bp[2]-A[2])*ease;
      g.position.set(x,y,z);
      g.rotation.set(0,-Math.atan2(Bp[1]-A[1],Bp[0]-A[0]),t>0.55?-0.34*Math.min(1,(t-0.55)*4):0);
      g.visible=t<0.95;
    });
  }
  ctx.details=Object.assign(ctx.details||{},{kaitak:'one aircraft on the approach'});
}
