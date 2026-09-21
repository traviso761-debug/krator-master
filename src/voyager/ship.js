// ---------- Intrepid class ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// here is this project's own geometry, built from the published dimensions and the silhouette.
//
// 344 m long, 133 across, fifteen decks and about a hundred and fifty aboard - a fifth of the length of a
// Galaxy class and less than a sixth of the crew. The differences that matter to a model all come from
// that. The saucer is not a separate hull bolted to a neck: it flows into the engineering section as one
// body and the join is a fairing. There is no dorsal. And the nacelles are on pylons that MOVE - they lie
// out and down in normal space and swing up and forward before the ship goes to warp, which is the only
// animated mechanism on any of these three pages.
//
// The two things the first pass got wrong were both about plan view. The saucer was a lemon - pointed at
// the bow AND pointed at the stern - where an Intrepid is a teardrop with a broad transom across the back
// of it. And the pylons were built with their chord and their thickness the wrong way round, so instead of
// two broad fins the ship had two knitting needles. Both are in the tables below.
//
// The bow towards +x, as with the others.
import {lathe,tube,sweep,windowRing,windowRow,bussard,SECT} from '../starship/parts.js';

export function model(api){
  const {THREE,scene,animHooks,fold,palette}=api;
  const m=palette({hull:0xcdd1ca,panelA:0xc0c5bf,panelB:0xd6dad2});
  const G=new THREE.Group();
  const parts=[];
  const LEN=344;

  // ---------- the primary hull ----------
  // `rz` is the half-width, so this column is the plan outline: out fast from a blunt nose, widest a bit
  // forward of midships, then a long easy taper to a station that is still 52 m across - and the cap the
  // tube puts on that last station is the transom, with the impulse engines in it.
  const SAU=[
    {x: 172, rz:  5, ry: 2.2, ryb: 2.0},
    {x: 169, rz: 17, ry: 3.6, ryb: 3.2},
    {x: 163, rz: 30, ry: 5.2, ryb: 4.4},
    {x: 154, rz: 42, ry: 6.8, ryb: 5.6},
    {x: 140, rz: 53, ry: 8.6, ryb: 7.0},
    {x: 124, rz: 61, ry:10.2, ryb: 8.4},
    {x: 104, rz: 67.5,ry:11.4,ryb: 9.4},
    {x:  81, rz: 69, ry:12.2, ryb:10.0},
    {x:  56, rz: 68, ry:12.6, ryb:10.4},
    {x:  30, rz: 64, ry:12.4, ryb:10.2},
    {x:   6, rz: 57, ry:11.6, ryb: 9.4},
    {x: -13, rz: 47, ry:10.2, ryb: 8.0},
    {x: -27, rz: 36, ry: 8.6, ryb: 6.4},
    {x: -35, rz: 26, ry: 6.8, ryb: 4.8},
  ];
  const topAt=s=>s.ry*0.80, botAt=s=>-s.ryb*0.80, sideAt=s=>s.rz*0.86;
  parts.push(tube(THREE,SAU,0,m.hull,true,true,SECT.saucer));
  {
    // two rows of windows in the rim band, following the outline
    for(let i=1;i<SAU.length-1;i++){
      const a=SAU[i],b=SAU[i+1];
      for(const sd of [-1,1]){
        const ang=-Math.atan2(sd*(b.rz-a.rz),b.x-a.x);
        for(let k=0;k<4;k++){
          const t=(k+0.5)/4;
          if(((i*7+k)%9)===0)continue;
          const x=a.x+(b.x-a.x)*t, rz=a.rz+(b.rz-a.rz)*t;
          const ry=a.ry+(b.ry-a.ry)*t, ryb=a.ryb+(b.ryb-a.ryb)*t;
          for(const y of [ry*0.30,-ryb*0.30]){
            const w=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.3,1.3),m.lit);
            w.position.set(x,y,sd*rz*1.003);w.rotation.y=ang;parts.push(w);
          }
        }
        // the escape pod hatches, in a line above the rim
        for(let k=0;k<2;k++){
          const t=(k+0.5)/2;
          const x=a.x+(b.x-a.x)*t, rz=a.rz+(b.rz-a.rz)*t, ry=a.ry+(b.ry-a.ry)*t;
          const h=new THREE.Mesh(new THREE.BoxGeometry(7.5,0.9,2.6),m.panelB);
          h.position.set(x,ry*0.58,sd*rz*0.96);h.rotation.y=ang;parts.push(h);
        }
      }
    }
    // the phaser strips, above and below, round the outline
    for(let i=1;i<SAU.length-2;i++){
      const a=SAU[i],b=SAU[i+1];
      for(const sd of [-1,1]){
        const ang=-Math.atan2(sd*(b.rz-a.rz),b.x-a.x);
        const len=Math.hypot(b.x-a.x,b.rz-a.rz);
        for(const up of [1,-1]){
          const s=new THREE.Mesh(new THREE.BoxGeometry(len*1.02,0.8,3.0),m.strip);
          s.position.set((a.x+b.x)/2, up>0?(topAt(a)+topAt(b))/2:(botAt(a)+botAt(b))/2,
                         sd*(sideAt(a)+sideAt(b))/2);
          s.rotation.y=ang;parts.push(s);
        }
      }
    }
    // the bridge: low and faired in, set forward of centre, with the dorsal spine running aft from it
    const b=lathe(THREE,[[0.001,20.4],[8,19.8],[13.6,18.2],[15.6,15.8],[15.6,12.6],[0.001,12.2]],28,m.hull);
    b.position.set(84,0,0);parts.push(b);
    windowRing(THREE,parts,m.lit,17.2,14.8,14.8,18,[1.1,1.4,1.1],0,Math.PI*2,84);
    const spine=lathe(THREE,[[0.001,14.4],[13,13.8],[22,12.6],[26,11.2],[0.001,10.8]],24,m.panelB);
    spine.scale.set(3.0,1,1);spine.position.set(50,0,0);parts.push(spine);
    // the sensor pallets on the roof either side of the spine
    for(const sd of [-1,1])for(let i=0;i<4;i++){
      const p=new THREE.Mesh(new THREE.BoxGeometry(12,0.9,6),m.panelA);
      p.position.set(106-i*25,10.4-i*0.5,sd*(24+i*4));parts.push(p);
    }
    // the impulse engines, in the transom
    for(const sd of [-1,1]){
      const box=new THREE.Mesh(new THREE.BoxGeometry(10,8,15),m.dark);
      box.position.set(-33,1.2,sd*14);parts.push(box);
      const gl=new THREE.Mesh(new THREE.BoxGeometry(2.2,5,11),m.impulse);
      gl.position.set(-38,1.2,sd*14);parts.push(gl);
    }
  }

  // ---------- the secondary hull ----------
  // No neck. The underside of the saucer runs back and down into the engineering section as one continuous
  // body: the forward stations are wide and shallow because at that end this is a FAIRING and has to leave
  // the saucer without a step, and it only gathers into a proper hull where it passes the transom.
  {
    const ST=[
      {x: 126, ry: 5, rz:13, cy: -9, ryb: 6},
      {x: 100, ry: 8, rz:19, cy:-13, ryb:10},
      {x:  66, ry:11, rz:23, cy:-17, ryb:12},
      {x:  26, ry:13, rz:24, cy:-20, ryb:14},
      {x: -16, ry:15, rz:24, cy:-23, ryb:15},
      {x: -58, ry:15, rz:23, cy:-24, ryb:15},
      {x:-100, ry:13, rz:20, cy:-24, ryb:13},
      {x:-140, ry:10, rz:16, cy:-23, ryb:10},
      {x:-168, ry: 7, rz:10, cy:-22, ryb: 7},
    ];
    parts.push(tube(THREE,ST,0,m.hull,true,true,SECT.nacelle));
    for(const sd of [-1,1])
      windowRow(THREE,parts,m.lit,[56,-19,sd*22],[-116,-21,sd*18],14,[2.4,1.2,1.2],[0,0,sd*2.0],true);
    // the deflector, tucked under the saucer's bow overhang
    const ring=lathe(THREE,[[7,0],[14,-1.2],[16,-4.4],[15,-8],[11,-10.6],[7,-11.4]],32,m.dark);
    ring.rotation.z=-Math.PI/2;ring.position.set(127,-11,0);parts.push(ring);
    const dish=lathe(THREE,[[0.001,-2.6],[5,-3.4],[9,-5.2],[12,-7.8],[14,-10.2]],32,m.deflector);
    dish.rotation.z=-Math.PI/2;dish.position.set(130,-11,0);parts.push(dish);
    const glow=new THREE.PointLight(0x9fd0ff,0.5,300);glow.position.set(156,-11,0);scene.add(glow);
    animHooks.push(now=>{glow.intensity=0.4+0.18*Math.sin(now*0.0015);});
    // the shuttlebay in the stern, and the strake down each flank
    const bay=new THREE.Mesh(new THREE.BoxGeometry(6,12,20),m.dark);
    bay.position.set(-169,-23,0);parts.push(bay);
    const bl=new THREE.Mesh(new THREE.BoxGeometry(2,8,15),m.lit);
    bl.position.set(-172,-23,0);parts.push(bl);
    for(const sd of [-1,1]){
      const st2=new THREE.Mesh(new THREE.BoxGeometry(150,1.6,1.4),m.panelA);
      st2.position.set(-52,-31,sd*21);parts.push(st2);
    }
    const belly=new THREE.Mesh(new THREE.BoxGeometry(120,0.9,3.0),m.strip);
    belly.position.set(-62,-39,0);parts.push(belly);
  }

  // ---------- the nacelles, on pylons that move ----------
  // Each nacelle hangs on a pylon that pivots where it meets the hull. Everything about a nacelle is built
  // in the pivot's own frame and the frame is what rotates, so the animation is one number.
  //
  // The pylon is a broad fin: about fifty metres of chord fore-and-aft and seven metres thick. Because it
  // runs outboard rather than fore-and-aft, `rz` is the chord here and `ry` is the thickness - the
  // opposite way round from the Galaxy's pylons, which run aft, and getting that backwards is what turned
  // these into knitting needles the first time.
  const wings=[];
  for(const sd of [-1,1]){
    const pivot=new THREE.Group();
    pivot.position.set(-84,-16,sd*16);
    G.add(pivot);
    const wp=[];

    const path=[];
    for(let i=0;i<=8;i++){
      const t=i/8;
      path.push({p:[t*8,t*2,sd*(t*44)],dir:[0.18,0.04,sd*0.98],
                 ry:4.6-t*1.4, rz:26-t*7});
    }
    wp.push(sweep(THREE,path,22,m.hull));
    // the fairing over the pivot itself, so the joint is a shoulder rather than a hinge in mid-air
    const sh=new THREE.Mesh(new THREE.BoxGeometry(44,8,13),m.hull);
    sh.position.set(2,-1,sd*4);sh.rotation.y=sd*0.06;wp.push(sh);

    // the nacelle on the end of it: 128 m, flat underneath
    const NX=8, NY=2, NZ=sd*46;
    const NST=[
      {x: 64, ry: 3.5, rz: 3.5, ryb: 3.0},
      {x: 58, ry: 7.5, rz: 6.5, ryb: 6.5},
      {x: 46, ry:10.0, rz: 8.5, ryb: 9.0},
      {x: 16, ry:11.0, rz: 9.5, ryb:10.0},
      {x:-22, ry:10.6, rz: 9.2, ryb: 9.6},
      {x:-50, ry: 8.6, rz: 7.6, ryb: 8.0},
      {x:-62, ry: 5.0, rz: 4.6, ryb: 4.4},
    ];
    const n=tube(THREE,NST,0,m.hull,true,true,SECT.nacelle);
    n.position.set(NX,NY,NZ);wp.push(n);
    bussard(THREE,wp,m,NX+63,NY+1,NZ,7.2,1);

    for(const face of [-1,1]){
      const back=new THREE.Mesh(new THREE.BoxGeometry(84,9,1.4),m.dark);
      back.position.set(NX-2,NY+1.4,NZ+face*9.7);wp.push(back);
      for(let i=0;i<12;i++){
        const s=new THREE.Mesh(new THREE.BoxGeometry(2.8,5.0,1.8),m.warp);
        s.position.set(NX+36-i*6.6,NY+1.4,NZ+face*10.0);wp.push(s);
      }
      for(const lip of [1,-1]){
        const l=new THREE.Mesh(new THREE.BoxGeometry(86,2.4,2.2),m.trim);
        l.position.set(NX-2,NY+1.4+lip*5.0,NZ+face*9.6);wp.push(l);
      }
    }
    const cap=new THREE.Mesh(new THREE.BoxGeometry(3.4,7,9),m.dark);
    cap.position.set(NX-63,NY,NZ);wp.push(cap);
    const nav=new THREE.Mesh(new THREE.SphereGeometry(1.2,8,6),sd>0?m.navG:m.nav);
    nav.position.set(NX-64,NY+5,NZ);wp.push(nav);

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
      // Positive x here swings the nacelle DOWN and positive y swings it AFT, so cruise is the non-zero
      // angle and warp is zero. The first pass had both signs the other way round, which had the ship
      // sitting with its nacelles raised and then lowering them to go to warp.
      w.pivot.rotation.x=w.sd*(0.46-e*0.46);           // down at cruise, level for warp
      w.pivot.rotation.y=w.sd*(-0.20+e*0.20);          // aft at cruise, forward for warp
    }
  });

  // ---------- running lights ----------
  const blinkers=[];
  for(const [x,y,z,mat] of [[173,0,0,m.lit],[-84,1.2,0,m.lit],[66,20.6,0,m.nav],[-168,-24,0,m.lit]]){
    const b=new THREE.Mesh(new THREE.SphereGeometry(1.0,8,6),mat);
    b.position.set(x,y,z);b.userData.noWire=true;scene.add(b);blinkers.push(b);
  }
  animHooks.push(now=>{const on=(now%1900)<950;for(const b of blinkers)b.visible=on;});

  fold(G,parts);
  scene.add(G);
  return {radius:LEN*0.5, group:G};
}
