// ---------- Galaxy class ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// here is this project's own geometry, built from the published dimensions and the silhouette.
//
// 642.5 m long, 463.7 across the saucer, 195 deep from the top of the bridge to the bottom of the
// engineering hull. Everything below is in metres at those figures, and the ship sits with the bridge at
// the origin's height and the bow towards +x.
//
// The thing that makes this silhouette, and the thing a box-modeller gets wrong first, is that almost none
// of it is straight. The saucer is a double-curved dish with a rim, not a disc; the engineering hull is an
// egg that is widest a third of the way back; the pylons are swept in two planes at once and are aerofoils
// in section. So the hulls here are built from tables of cross-sections rather than from primitives, and
// the tables are the model.
import {lathe,tube,sweep,windowRing,windowRow,grille,hullPalette} from '../starship/parts.js';

export function model(api){
  const {THREE,scene,animHooks,fold,palette}=api;
  const m=palette({});
  const G=new THREE.Group();
  const parts=[];

  const LEN=642.5, SAU_R=232, SAU_Z=0.95;      // the saucer is a little narrower than it is long

  // ---------- the saucer ----------
  // A lathe profile from the top of the dome, out to the rim, and back under to the sensor dome. The
  // underside is shallower than the top and the rim is a band with a squared edge, which is what stops it
  // reading as a flying saucer and starts it reading as a hull.
  {
    const P=[[0.001,34],[36,33.4],[74,31.6],[112,28.6],[146,24.4],[176,19.4],[200,14],[218,8.6],
             [228,4.2],[232,0.6],[232,-4.6],[226,-10.6],[210,-17.4],[186,-23],[156,-27],[120,-29.6],
             [80,-31],[40,-31.6],[0.001,-31.8]];
    const s=lathe(THREE,P,72,m.hull);
    s.scale.set(1,1,SAU_Z);
    s.rotation.y=Math.PI/2;                    // so the lathe's x axis runs fore and aft
    parts.push(s);
    // the ribs: the Galaxy saucer has a set of raised panels radiating from the bridge, and they are most
    // of what tells you how big it is
    for(let k=0;k<12;k++){
      const a=k/12*Math.PI*2+0.13;
      for(let i=2;i<8;i++){
        const r=40+i*26, y=34-Math.pow(r/232,2.1)*33.6;
        const p=new THREE.Mesh(new THREE.BoxGeometry(22,1.1,7),m.panelA);
        p.position.set(Math.cos(a)*r,y,Math.sin(a)*r*SAU_Z);
        p.rotation.y=-a;p.rotation.z=-0.12*(r/232);
        parts.push(p);
      }
    }
    // the rim: a band of a different value all the way round, with three rows of windows in it
    const band=lathe(THREE,[[231,3.6],[233,2.2],[233,-3.2],[231,-4.8]],72,m.trim);
    band.scale.set(1,1,SAU_Z);band.rotation.y=Math.PI/2;parts.push(band);
    for(const y of [4.6,-0.6,-6.2])
      windowRing(THREE,parts,m.lit,y,231.5,231.5*SAU_Z,88,[1.6,1.5,3.2]);
    // two more rows further in on the underside, where the crew decks are
    windowRing(THREE,parts,m.lit,-16,206,206*SAU_Z,72,[1.6,1.4,3.0]);
    windowRing(THREE,parts,m.lit,-25,168,168*SAU_Z,56,[1.6,1.4,3.0]);
    // the lifeboat hatches: a grid of them round the rim, which nobody notices until they are missing
    for(let k=0;k<64;k++){
      const a=k/64*Math.PI*2;
      for(const y of [12.5,-12]){
        const h=new THREE.Mesh(new THREE.BoxGeometry(1,3.4,9),m.panelB);
        h.position.set(Math.cos(a)*225,y,Math.sin(a)*225*SAU_Z);h.rotation.y=-a;parts.push(h);
      }
    }
  }

  // ---------- the bridge ----------
  {
    const b=lathe(THREE,[[0.001,52],[9,51],[16,48.6],[20,44],[21,38],[21,34.6],[0.001,34.4]],36,m.hull);
    b.position.set(0,0,0);parts.push(b);
    // the deck under it, wider, and the ready room windows
    const d=lathe(THREE,[[0.001,38],[26,37.4],[32,35.6],[34,33.6],[0.001,33.4]],36,m.panelB);
    parts.push(d);
    windowRing(THREE,parts,m.lit,44.5,20.2,20.2,22,[1.3,2.0,1.3]);
    // the dome of the main sensor, underneath, which is the other end of the same axis
    const sd=lathe(THREE,[[0.001,-44],[14,-42.4],[22,-38],[25,-33.4],[0.001,-31.9]],36,m.trim);
    parts.push(sd);
    const lens=new THREE.Mesh(new THREE.SphereGeometry(13,20,12),m.deflector);
    lens.position.set(0,-42.5,0);lens.scale.set(1,0.4,1);parts.push(lens);
  }

  // ---------- the impulse engines ----------
  // Two of them in the aft rim of the saucer, set into a recess, plus the pair on the engineering hull.
  for(const sd of [-1,1]){
    const z=sd*58;
    const box=new THREE.Mesh(new THREE.BoxGeometry(14,13,52),m.dark);
    box.position.set(-222,-1,z*SAU_Z);parts.push(box);
    const glow=new THREE.Mesh(new THREE.BoxGeometry(3.4,9.5,44),m.impulse);
    glow.position.set(-228,-1,z*SAU_Z);parts.push(glow);
  }

  // ---------- the neck ----------
  // A blade, swept back, joining the underside of the saucer to the top of the engineering hull. In section
  // it is a long thin aerofoil; in profile it leans about thirty degrees off vertical.
  {
    const path=[];
    for(let i=0;i<=10;i++){
      const t=i/10;
      const x=-150-t*46, y=-26-t*74;
      path.push({p:[x,y,0],dir:[-0.52,-0.85,0],ry:6+t*3.6,rz:30-t*4});
    }
    parts.push(sweep(THREE,path,20,m.hull));
    // the windows down the leading edge, and the torpedo launcher at the top of it
    for(let i=0;i<9;i++){
      const t=i/8,x=-146-t*40,y=-30-t*70;
      const w=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.0,2.4),m.lit);
      w.position.set(x+6,y,0);parts.push(w);
    }
    const tl=new THREE.Mesh(new THREE.BoxGeometry(20,7,26),m.dark);
    tl.position.set(-146,-30,0);parts.push(tl);
    const tg=new THREE.Mesh(new THREE.BoxGeometry(3,4.2,18),m.deflector);
    tg.position.set(-137,-30,0);parts.push(tg);
  }

  // ---------- the engineering hull ----------
  // An egg, widest about a third of the way back, with the deflector in the nose and the shuttlebay in the
  // tail. The table is the shape; everything else here hangs off it.
  {
    const ST=[
      {x:  96, ry:14, rz:16, cy:-104},
      {x:  74, ry:26, rz:30, cy:-106},
      {x:  40, ry:38, rz:46, cy:-108},
      {x:   0, ry:45, rz:56, cy:-108},
      {x: -50, ry:48, rz:60, cy:-107},
      {x:-110, ry:46, rz:58, cy:-105},
      {x:-170, ry:41, rz:52, cy:-103},
      {x:-222, ry:34, rz:44, cy:-101},
      {x:-262, ry:26, rz:34, cy:-100},
      {x:-286, ry:18, rz:24, cy:-100},
    ];
    parts.push(tube(THREE,ST,32,m.hull));
    // the flat top of it, where the pylons come out and the shuttles land
    const deck=new THREE.Mesh(new THREE.BoxGeometry(250,5,74),m.panelB);
    deck.position.set(-90,-62,0);parts.push(deck);
    // three rows of windows down each side
    for(const sd of [-1,1])for(const [y,n] of [[-88,26],[-104,24],[-120,20]]){
      windowRow(THREE,parts,m.lit,[40,y,sd*54],[-230,y,sd*44],n,[3.2,1.5,1.5],[0,0,sd*3],true);
    }
    // the captain's yacht, clamped under the belly
    const y1=lathe(THREE,[[0.001,0],[10,-1.6],[20,-3.4],[26,-6],[24,-9],[12,-11],[0.001,-11.6]],28,m.trim);
    y1.rotation.y=Math.PI/2;y1.scale.set(1.9,1,1);y1.position.set(-40,-146,0);parts.push(y1);
    // the shuttlebay: doors in the stern, and the light from inside them
    const bay=new THREE.Mesh(new THREE.BoxGeometry(8,30,48),m.dark);
    bay.position.set(-288,-96,0);parts.push(bay);
    const baylight=new THREE.Mesh(new THREE.BoxGeometry(2,22,38),m.lit);
    baylight.position.set(-292,-96,0);parts.push(baylight);
    // the impulse pair on the engineering hull
    for(const sd of [-1,1]){
      const g2=new THREE.Mesh(new THREE.BoxGeometry(4,8,20),m.impulse);
      g2.position.set(-290,-70,sd*26);parts.push(g2);
    }
  }

  // ---------- the deflector ----------
  // A dish, dished: the profile is concave, the ring round it is machinery, and the whole thing throws a
  // glow forward that is the only light this ship makes that reaches anything.
  {
    const ring=lathe(THREE,[[16,0],[30,-2],[34,-8],[33,-16],[26,-22],[16,-24]],40,m.dark);
    ring.rotation.z=-Math.PI/2;ring.position.set(96,-104,0);parts.push(ring);
    const dish=lathe(THREE,[[0.001,-6],[10,-7],[18,-10],[26,-15],[30,-21]],40,m.deflector);
    dish.rotation.z=-Math.PI/2;dish.position.set(100,-104,0);parts.push(dish);
    const glow=new THREE.PointLight(0xc8a24a,0.8,600);
    glow.position.set(150,-104,0);scene.add(glow);
    animHooks.push(now=>{glow.intensity=0.6+0.25*Math.sin(now*0.0013);});
  }

  // ---------- the pylons and the nacelles ----------
  // Swept up and back in one plane and outward in another, and an aerofoil in section. The nacelles sit
  // above and outboard of the engineering hull, which is what gives the class its stance.
  for(const sd of [-1,1]){
    const path=[];
    for(let i=0;i<=12;i++){
      const t=i/12;
      const x=-108-t*78, y=-92+t*126, z=sd*(30+t*74);
      path.push({p:[x,y,z],dir:[-0.42,0.72,sd*0.4],ry:24-t*6,rz:7.5-t*2.2});
    }
    parts.push(sweep(THREE,path,18,m.hull));

    const NX=-186, NY=34, NZ=sd*104;
    const NST=[
      {x: 96, ry: 6, rz: 6},
      {x: 82, ry:15, rz:14},
      {x: 60, ry:20, rz:18},
      {x: 10, ry:21, rz:19},
      {x:-60, ry:20, rz:18},
      {x:-110,ry:17, rz:15},
      {x:-132,ry:11, rz:10},
      {x:-140,ry: 5, rz: 5},
    ];
    const n=tube(THREE,NST,26,m.hull);
    n.position.set(NX,NY,NZ);parts.push(n);
    // the Bussard collector in the nose: a red dome inside a cage
    const bus=new THREE.Mesh(new THREE.SphereGeometry(15,20,14),m.bussard);
    bus.position.set(NX+90,NY,NZ);bus.scale.set(1.1,1,1);parts.push(bus);
    const cage=lathe(THREE,[[15,0],[15.5,-6],[14,-12],[10,-16]],20,m.dark);
    cage.rotation.z=-Math.PI/2;cage.position.set(NX+96,NY,NZ);parts.push(cage);
    // the warp grille down each side of the nacelle, which is the part that glows
    for(const face of [-1,1]){
      const slats=[];
      for(let i=0;i<22;i++){
        const s=new THREE.Mesh(new THREE.BoxGeometry(5.4,15,2.6),m.warp);
        s.position.set(NX+42-i*7.2,NY+1,NZ+face*17.5);slats.push(s);
      }
      for(const s of slats)parts.push(s);
      const back=new THREE.Mesh(new THREE.BoxGeometry(168,19,2),m.dark);
      back.position.set(NX-34,NY+1,NZ+face*19);parts.push(back);
    }
    // the endcap, and the running light on it
    const cap=new THREE.Mesh(new THREE.BoxGeometry(7,13,17),m.dark);
    cap.position.set(NX-136,NY,NZ);parts.push(cap);
    const nav=new THREE.Mesh(new THREE.SphereGeometry(3.2,10,8),sd>0?m.navG:m.nav);
    nav.position.set(NX-144,NY+8,NZ);parts.push(nav);
  }

  // ---------- the pennant ----------
  // No lettering anywhere on this model - a hull number would be four pixels tall - but the two long
  // panels that carry it on the saucer are structure, so they are here.
  for(const sd of [-1,1]){
    const p=new THREE.Mesh(new THREE.BoxGeometry(150,1.2,26),m.pennant);
    p.position.set(30,32.2,sd*96*SAU_Z);p.rotation.z=-0.04;p.rotation.y=sd*0.12;parts.push(p);
  }

  // ---------- the running lights ----------
  const blinkers=[];
  for(const [x,y,z,mat] of [[232,0,0,m.lit],[-232,0,0,m.lit],
                            [0,52,0,m.nav],[0,-44,0,m.nav],
                            [-186,34,116,m.navG],[-186,34,-116,m.nav]]){
    const b=new THREE.Mesh(new THREE.SphereGeometry(3,8,6),mat);
    b.position.set(x,y,z);b.userData.noWire=true;scene.add(b);blinkers.push(b);
  }
  animHooks.push(now=>{const on=(now%1900)<950;for(const b of blinkers)b.visible=on;});

  fold(G,parts);
  scene.add(G);

  // She is normally drawn at the yaw the recognition shots use, so the model is turned rather than the
  // camera: it keeps the viewpoints in the city file simple.
  G.rotation.y=0;

  return {radius:LEN*0.5, group:G,
    buttons:{}};
}
