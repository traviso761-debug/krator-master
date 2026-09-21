// ---------- Intrepid class ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// here is this project's own geometry, built from the published dimensions and the silhouette.
//
// 344 m long, 133 across, fifteen decks and about a hundred and fifty aboard - a fifth of the length of a
// Galaxy class and less than a sixth of the crew. The differences that matter to a model are all about
// that: the saucer is not a separate hull bolted to a neck, it flows into the engineering section as one
// body; there is no long dorsal; and the nacelles are on pylons that MOVE - they lie flat in normal space
// and swing up and forward before the ship goes to warp, which is the one animated thing on any of these
// three pages and the only reason this class is instantly recognisable in silhouette.
//
// The bow towards +x, as with the others.
import {lathe,tube,sweep,windowRing,windowRow} from '../starship/parts.js';

export function model(api){
  const {THREE,scene,animHooks,fold,palette}=api;
  const m=palette({hull:0xcdd1ca,panelA:0xc0c5bf,panelB:0xd6dad2});
  const G=new THREE.Group();
  const parts=[];
  const LEN=344;

  // ---------- the primary hull ----------
  // Not a disc with a nose glued on. An Intrepid saucer in plan is a teardrop - widest about two-fifths of
  // the way back, drawing forward to a blunt point and rounding off at the stern - and in section it is
  // very flat, about a third the depth of a Galaxy saucer for its span. Building it as a lathe and
  // grafting a cone on the front gets the plan wrong AND leaves a seam; building it as a table of
  // cross-sections gets both right and costs the same.
  const SAU=[
    {x: 176, ry: 1.6, rz:  2.4, cy:-0.4},
    {x: 170, ry: 4.4, rz: 11,   cy:-0.6},
    {x: 160, ry: 7.4, rz: 24,   cy:-0.8},
    {x: 146, ry:10.4, rz: 39,   cy:-1.0},
    {x: 128, ry:12.8, rz: 53,   cy:-1.2},
    {x: 108, ry:14.4, rz: 62,   cy:-1.3},
    {x:  84, ry:15.0, rz: 66,   cy:-1.4},
    {x:  58, ry:14.7, rz: 65,   cy:-1.4},
    {x:  34, ry:13.6, rz: 60,   cy:-1.3},
    {x:  14, ry:11.6, rz: 51,   cy:-1.2},
    {x:  -2, ry: 8.8, rz: 39,   cy:-1.0},
    {x: -14, ry: 5.4, rz: 24,   cy:-0.8},
    {x: -20, ry: 2.4, rz: 11,   cy:-0.6},
  ];
  {
    parts.push(tube(THREE,SAU,40,m.hull));
    // the rim: a band of a different value all the way round the outline, and two rows of windows in it
    for(let i=1;i<SAU.length-1;i++){
      const a=SAU[i],b=SAU[i+1];
      for(const sd of [-1,1]){
        const len=Math.hypot(b.x-a.x,b.rz-a.rz);
        const bd=new THREE.Mesh(new THREE.BoxGeometry(len*1.08,2.2,1.6),m.trim);
        bd.position.set((a.x+b.x)/2,-0.8,sd*(a.rz+b.rz)/2);
        bd.rotation.y=-Math.atan2(sd*(b.rz-a.rz),b.x-a.x);
        parts.push(bd);
        for(let k=0;k<4;k++){
          const t=(k+0.5)/4;
          if(((i*7+k)%9)===0)continue;
          for(const y of [1.6,-2.4]){
            const w=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.2,1.4),m.lit);
            w.position.set(a.x+(b.x-a.x)*t,y,sd*(a.rz+(b.rz-a.rz)*t)*0.995);
            w.rotation.y=-Math.atan2(sd*(b.rz-a.rz),b.x-a.x);
            parts.push(w);
          }
        }
      }
    }
    // the bridge: low, faired in, not a module standing on the roof
    const b=lathe(THREE,[[0.001,21],[8,20.4],[13,18.6],[15,16.2],[15,14.2],[0.001,14]],28,m.hull);
    b.position.set(74,0,0);parts.push(b);
    windowRing(THREE,parts,m.lit,17.6,14.4,14.4,18,[1.1,1.4,1.1],0,Math.PI*2,74);
    for(let k=0;k<10;k++){                      // panelling, radiating from the bridge
      const a=k/10*Math.PI*2+0.2;
      const p=new THREE.Mesh(new THREE.BoxGeometry(26,0.8,5),m.panelA);
      p.position.set(74+Math.cos(a)*42*1.1,13.2-Math.pow(42/66,2)*5,Math.sin(a)*42);
      p.rotation.y=-a;parts.push(p);
    }
    // the escape pod hatches, in two lines down the flanks of the saucer roof
    for(let i=2;i<10;i++){
      const a=SAU[i];
      for(const sd of [-1,1]){
        const h=new THREE.Mesh(new THREE.BoxGeometry(9,1.0,3.4),m.panelB);
        h.position.set(a.x,a.ry*0.72,sd*a.rz*0.72);parts.push(h);
      }
    }
  }

  // ---------- the secondary hull ----------
  // No neck. The underside of the saucer runs back and down into the engineering section as one continuous
  // body, and the join is a fairing rather than a joint. That is the whole idea of the class.
  {
    // The forward stations are wide and shallow, because this is a FAIRING at that end: it has to come out
    // of the saucer's underside without a step in it. It gathers into a proper hull only where it passes
    // the saucer's stern, and it is deepest where the shuttlebay is.
    const ST=[
      {x:  96, ry: 5, rz:44, cy: -9},
      {x:  64, ry: 9, rz:44, cy:-12},
      {x:  30, ry:14, rz:41, cy:-17},
      {x:  -6, ry:19, rz:38, cy:-21},
      {x: -48, ry:22, rz:36, cy:-24},
      {x: -92, ry:22, rz:34, cy:-25},
      {x:-130, ry:19, rz:29, cy:-24},
      {x:-158, ry:14, rz:22, cy:-23},
      {x:-168, ry: 8, rz:14, cy:-22},
    ];
    parts.push(tube(THREE,ST,30,m.hull));
    for(const sd of [-1,1])
      windowRow(THREE,parts,m.lit,[30,-16,sd*32],[-142,-16,sd*24],16,[2.4,1.2,1.2],[0,0,sd*2.2],true);
    // the deflector, tucked under the saucer's overhang
    const ring=lathe(THREE,[[8,0],[15,-1.2],[17,-4.4],[16,-8],[12,-10.6],[8,-11.4]],32,m.dark);
    ring.rotation.z=-Math.PI/2;ring.position.set(66,-13,0);parts.push(ring);
    const dish=lathe(THREE,[[0.001,-2.6],[5,-3.4],[9.6,-5.2],[13,-7.8],[15,-10.4]],32,m.deflector);
    dish.rotation.z=-Math.PI/2;dish.position.set(69,-13,0);parts.push(dish);
    const glow=new THREE.PointLight(0x9fd0ff,0.5,300);glow.position.set(96,-13,0);scene.add(glow);
    animHooks.push(now=>{glow.intensity=0.4+0.18*Math.sin(now*0.0015);});
    // the shuttlebay in the stern and the impulse engines over it
    const bay=new THREE.Mesh(new THREE.BoxGeometry(6,13,24),m.dark);
    bay.position.set(-170,-22,0);parts.push(bay);
    const bl=new THREE.Mesh(new THREE.BoxGeometry(2,9,18),m.lit);
    bl.position.set(-173,-22,0);parts.push(bl);
    for(const sd of [-1,1]){
      const g2=new THREE.Mesh(new THREE.BoxGeometry(3.2,6,12),m.impulse);
      g2.position.set(-158,-6,sd*14);parts.push(g2);
    }
    for(const sd of [-1,1])for(let i=0;i<5;i++){   // sensor pallets down each flank
      const p=new THREE.Mesh(new THREE.BoxGeometry(16,3.4,2.6),m.dark);
      p.position.set(14-i*34,-28,sd*31);parts.push(p);
    }
  }

  // ---------- the nacelles, on pylons that move ----------
  // Each nacelle hangs on a pylon that pivots where it meets the hull. At rest they lie out and down; for
  // warp they swing up and forward. Everything about a nacelle is built here in its own frame and the
  // frame is what rotates, so the animation is one number.
  const wings=[];
  for(const sd of [-1,1]){
    const pivot=new THREE.Group();
    pivot.position.set(-84,-16,sd*20);
    G.add(pivot);
    const wp=[];

    // the pylon, out from the pivot
    const path=[];
    for(let i=0;i<=8;i++){
      const t=i/8;
      path.push({p:[-t*10,t*9,sd*(t*52)],dir:[-0.18,0.17,sd*0.97],ry:8.4-t*2.2,rz:4-t*1.1});
    }
    wp.push(sweep(THREE,path,16,m.hull));

    // the nacelle itself, slung on the end of it
    const NX=-10, NY=9, NZ=sd*54;
    const NST=[
      {x: 58, ry: 4.5, rz: 4.5},
      {x: 50, ry: 8.6, rz: 8},
      {x: 34, ry:11,   rz:10},
      {x:  0, ry:11.4, rz:10.4},
      {x:-38, ry:10.6, rz: 9.6},
      {x:-64, ry: 8,   rz: 7.4},
      {x:-76, ry: 4,   rz: 4},
    ];
    const n=tube(THREE,NST,24,m.hull);
    n.position.set(NX,NY,NZ);wp.push(n);
    const bus=new THREE.Mesh(new THREE.SphereGeometry(8.4,18,12),m.bussard);
    bus.position.set(NX+54,NY,NZ);bus.scale.set(1.15,1,1);wp.push(bus);
    const cage=lathe(THREE,[[8.4,0],[8.6,-3],[7.6,-6],[5.4,-8]],18,m.dark);
    cage.rotation.z=-Math.PI/2;cage.position.set(NX+58,NY,NZ);wp.push(cage);
    for(const face of [-1,1]){
      for(let i=0;i<14;i++){
        const s=new THREE.Mesh(new THREE.BoxGeometry(3.6,8.4,1.6),m.warp);
        s.position.set(NX+24-i*4.8,NY+0.6,NZ+face*9.6);wp.push(s);
      }
      const back=new THREE.Mesh(new THREE.BoxGeometry(70,10.4,1.2),m.dark);
      back.position.set(NX-8,NY+0.6,NZ+face*10.4);wp.push(back);
    }
    const cap=new THREE.Mesh(new THREE.BoxGeometry(4,7,9),m.dark);
    cap.position.set(NX-74,NY,NZ);wp.push(cap);
    const nav=new THREE.Mesh(new THREE.SphereGeometry(2,8,6),sd>0?m.navG:m.nav);
    nav.position.set(NX-78,NY+4,NZ);wp.push(nav);

    fold(pivot,wp);
    wings.push({pivot,sd});
  }

  // At rest the pylons are down and out; at warp they come up and forward. The ship spends most of its time
  // in one or the other and about four seconds in between, so the motion is eased hard at both ends.
  const W={t:0,want:0};
  animHooks.push(now=>{
    const cycle=(now%26000)/26000;
    W.want=(cycle>0.45&&cycle<0.93)?1:0;
    W.t+=(W.want-W.t)*0.012;
    const e=W.t*W.t*(3-2*W.t);
    for(const w of wings){
      w.pivot.rotation.x=w.sd*(-0.30+e*0.30);          // up
      w.pivot.rotation.y=w.sd*(0.16-e*0.16);           // and forward
      w.pivot.rotation.z=(-0.10+e*0.10)*w.sd*0;        // (kept flat: the class does not roll them)
    }
  });

  // ---------- running lights ----------
  const blinkers=[];
  for(const [x,y,z,mat] of [[178,0,0,m.lit],[-174,-22,0,m.lit],[74,21,0,m.nav]]){
    const b=new THREE.Mesh(new THREE.SphereGeometry(1.8,8,6),mat);
    b.position.set(x,y,z);b.userData.noWire=true;scene.add(b);blinkers.push(b);
  }
  animHooks.push(now=>{const on=(now%1900)<950;for(const b of blinkers)b.visible=on;});

  fold(G,parts);
  scene.add(G);
  return {radius:LEN*0.5, group:G};
}
