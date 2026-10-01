// ---------- Deep Space 9 ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// here is this project's own geometry, built from the published dimensions and the silhouette.
//
// A Cardassian ore-processing station, built over somebody else's planet by people who were not asked, and
// afterwards towed to the mouth of a wormhole and left there. 1,451 m across the docking ring, 968 m from
// the tip of one upper pylon to the tip of a lower one.
//
// The design language is the opposite of Starfleet's and that is the point of drawing it. Starfleet builds
// smooth pale hulls out of curves that flow into each other. This is dark brown, it is ribbed, it is
// symmetrical in threes and sixes rather than about a keel, and every section is a hexagon with hard
// bevels on every corner. Nothing on it is trying to look fast, because it is a building.
//
// The layout, from the middle out - and the first pass left the second ring out entirely, which is most of
// why it read as a spider rather than as a station:
//
//   the core          a spindle standing on end: Ops on top, the habitat levels under it, the Promenade as
//                     a drum round the middle, the reactor levels below that, and a spire at each end
//   the crossovers    three bridges at a hundred and twenty degrees, out to
//   the habitat ring  the inner ring, where everybody who is not working actually lives
//   the supports      six arms at sixty degrees, out to
//   the docking ring  the outer ring, 1,451 m across, carrying the six ore-processing units and the
//                     docking ports
//   the pylons        six horns off the docking ring, three up and three down, each curving out, up and
//                     then back in towards the axis, with a docking clamp on the end - the silhouette
import {lathe,sweep,windowRing,SECT} from '../starship/parts.js';

export function model(api){
  const {THREE,scene,animHooks,fold,palette}=api;
  // Cardassian brown-grey: much darker and warmer than Starfleet, and the lights in it are amber rather
  // than white, which on its own does most of the work of saying who built it. The first version of this
  // was two stops too light and came out the colour of a biscuit.
  const m=palette({hull:0x3c3529,panelA:0x322c23,panelB:0x473f32,dark:0x191511,trim:0x281f18,
                   lit:0xffbe5e,warp:0xffb04a,impulse:0xff9a3a,deflector:0xffb84a,
                   pennant:0x534b3e,strip:0x6a5a3a,
                   // flat shading, because every corner on this station is meant to be a corner: with the
                   // normals smoothed the hexagonal pylons came out as round tubes
                   flat:true, specular:0x241d14, shininess:6});
  const G=new THREE.Group();
  const parts=[];

  const RING_R=725, HAB_R=402, CORE_R=162, PY_TIP=484;

  // ---------- the core ----------
  // One lathe from the top spire to the bottom one. The Promenade is the wide drum at the waist; the
  // reactor levels below it are wider than the habitat levels above, which is why the whole thing looks
  // bottom-heavy from outside and is the right way up on the inside.
  {
    const P=[
      [0.001, 334],[16, 330],[26, 320],[30, 302],       // the upper spire
      [36, 278],[48, 266],[72, 256],[82, 246],          // Ops, on the top
      [78, 234],[62, 226],[56, 214],
      [70, 202],[82, 190],[88, 172],[92, 150],          // the habitat levels
      [98, 130],[112, 118],[136, 108],
      [178, 98],[186, 84],[186, 30],                    // the Promenade drum
      [182, 14],[168, 0],[160, -18],
      [164, -40],[174, -62],[174, -96],                 // the reactor levels
      [162,-120],[140,-142],[116,-160],
      [94, -180],[80, -204],[72, -230],
      [56, -258],[40, -288],[24, -312],[0.001, -330],
    ];
    parts.push(lathe(THREE,P,24,m.hull));
    // the ribs: six of them all the way up, which is the thing that makes it Cardassian
    for(let k=0;k<6;k++){
      const a=k/6*Math.PI*2+0.26;
      for(let i=0;i<10;i++){
        const y=-190+i*54;
        const r=y>30?(y>108?110:186):(y>-96?174:126);
        const rib=new THREE.Mesh(new THREE.BoxGeometry(17,46,24),m.trim);
        rib.position.set(Math.cos(a)*r,y,Math.sin(a)*r);rib.rotation.y=-a;parts.push(rib);
      }
      // a buttress down the outside of the reactor levels
      const bu=new THREE.Mesh(new THREE.BoxGeometry(20,150,34),m.panelA);
      bu.position.set(Math.cos(a)*168,-62,Math.sin(a)*168);bu.rotation.y=-a;parts.push(bu);
    }
    // the Promenade: three rows of windows round the drum, which is the only part of this station anybody
    // who does not work here ever sees
    for(const y of [68,46,24])windowRing(THREE,parts,m.lit,y,188,188,68,[3.0,7,6.0]);
    // Ops, and the light out of its dome
    const dome=lathe(THREE,[[0.001,262],[30,259],[50,253],[64,246]],24,m.dark);
    parts.push(dome);
    windowRing(THREE,parts,m.lit,250,76,76,22,[3.6,5,5]);
    for(const y of [206,182,158,134])windowRing(THREE,parts,m.lit,y,92,92,28,[2.6,4,4]);
    for(const y of [-40,-66,-92])windowRing(THREE,parts,m.lit,y,176,176,38,[3,4.4,4.6]);
  }

  // ---------- the two rings ----------
  // A torus with six radial segments is a hexagonal tube bent into a circle, which is exactly what both of
  // these are, and costs nothing over a round one.
  const hexRing=(R,t,seg,mat)=>{
    const g=new THREE.Mesh(new THREE.TorusGeometry(R,t,6,seg),mat);
    g.rotation.x=Math.PI/2;g.rotation.z=Math.PI/6;   // a flat face up, a flat face out
    return g;
  };
  parts.push(hexRing(HAB_R,50,60,m.hull));
  parts.push(hexRing(RING_R,66,96,m.hull));

  // the habitat ring: windows all the way round, top and bottom, because that is what it is for
  for(const y of [20,-20])windowRing(THREE,parts,m.lit,y,HAB_R+48,HAB_R+48,72,[5,5,7]);
  for(let k=0;k<24;k++){
    const a=k/24*Math.PI*2;
    const b=new THREE.Mesh(new THREE.BoxGeometry(26,66,30),m.trim);
    b.position.set(Math.cos(a)*HAB_R,0,Math.sin(a)*HAB_R);b.rotation.y=-a;parts.push(b);
  }

  // the docking ring: the outer face is flat and ribbed rather than round, a segmented band all the way
  // round with a lit port every third segment
  for(let k=0;k<72;k++){
    const a=k/72*Math.PI*2;
    const seg=new THREE.Mesh(new THREE.BoxGeometry(RING_R*Math.PI*2/72*0.94,96,34),m.panelA);
    seg.position.set(Math.cos(a)*(RING_R+50),0,Math.sin(a)*(RING_R+50));
    seg.rotation.y=-a+Math.PI/2;parts.push(seg);
    if(k%3===0){
      const w=new THREE.Mesh(new THREE.BoxGeometry(9,7,8),m.lit);
      w.position.set(Math.cos(a)*(RING_R+68),11,Math.sin(a)*(RING_R+68));
      w.rotation.y=-a;parts.push(w);
    }
    if(k%6===3){
      const rib=new THREE.Mesh(new THREE.BoxGeometry(19,120,56),m.trim);
      rib.position.set(Math.cos(a)*(RING_R+20),0,Math.sin(a)*(RING_R+20));
      rib.rotation.y=-a;parts.push(rib);
    }
  }
  // the six docking ports on the inner face, between the pylon roots: an airlock and a lit throat
  for(let k=0;k<6;k++){
    const a=k/6*Math.PI*2+Math.PI/6;
    const c=Math.cos(a),s=Math.sin(a);
    const port=new THREE.Mesh(new THREE.BoxGeometry(62,74,44),m.dark);
    port.position.set(c*(RING_R-56),0,s*(RING_R-56));port.rotation.y=-a;parts.push(port);
    const lamp=new THREE.Mesh(new THREE.BoxGeometry(4,40,26),m.lit);
    lamp.position.set(c*(RING_R-84),0,s*(RING_R-84));lamp.rotation.y=-a;parts.push(lamp);
  }

  // ---------- the crossover bridges ----------
  // Three of them, at a hundred and twenty degrees, and they are the only way between the core and the
  // habitat ring. Hexagonal in section, ribbed, with a run of lit ports down each side.
  for(let k=0;k<3;k++){
    const a=k/3*Math.PI*2+0.5;
    const c=Math.cos(a),s=Math.sin(a);
    const r0=CORE_R+14, r1=HAB_R+8;
    const path=[];
    for(let i=0;i<=4;i++){
      const r=r0+(r1-r0)*i/4;
      path.push({p:[c*r,0,s*r],dir:[c,0,s],ry:26,rz:34});
    }
    parts.push(sweep(THREE,path,0,m.hull,SECT.hex));
    for(let i=0;i<8;i++){
      const r=r0+18+i*(r1-r0-30)/7;
      const rib=new THREE.Mesh(new THREE.BoxGeometry(16,62,80),m.trim);
      rib.position.set(c*r,0,s*r);rib.rotation.y=-a;parts.push(rib);
      for(const sd of [-1,1]){
        const w=new THREE.Mesh(new THREE.BoxGeometry(11,6,4),m.lit);
        w.position.set(c*r-s*sd*36,14,s*r+c*sd*36);w.rotation.y=-a;parts.push(w);
      }
    }
  }

  // ---------- the docking-ring supports ----------
  // Six arms out from the habitat ring to the docking ring, at sixty degrees, lined up with the pylons.
  for(let k=0;k<6;k++){
    const a=k/6*Math.PI*2;
    const c=Math.cos(a),s=Math.sin(a);
    const r0=HAB_R+20, r1=RING_R-30;
    const path=[];
    for(let i=0;i<=3;i++){
      const r=r0+(r1-r0)*i/3;
      path.push({p:[c*r,0,s*r],dir:[c,0,s],ry:22,rz:28});
    }
    parts.push(sweep(THREE,path,0,m.hull,SECT.hex));
    for(let i=0;i<5;i++){
      const r=r0+16+i*(r1-r0-32)/4;
      const rib=new THREE.Mesh(new THREE.BoxGeometry(14,50,64),m.trim);
      rib.position.set(c*r,0,s*r);rib.rotation.y=-a;parts.push(rib);
    }
  }

  // ---------- the ore-processing units ----------
  // Six of them, standing on the docking ring above and below it between the pylons. This station was
  // built to refine what was dug out of the planet below it, and these are the only part of it that was
  // ever used for that.
  for(let k=0;k<6;k++){
    const a=k/6*Math.PI*2+Math.PI/6;
    const c=Math.cos(a),s=Math.sin(a);
    for(const sd of [-1,1]){
      const u=new THREE.Mesh(new THREE.BoxGeometry(96,86,132),m.panelB);
      u.position.set(c*(RING_R-8),sd*76,s*(RING_R-8));u.rotation.y=-a;parts.push(u);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(66,26,98),m.dark);
      cap.position.set(c*(RING_R-8),sd*128,s*(RING_R-8));cap.rotation.y=-a;parts.push(cap);
      for(let i=0;i<3;i++){
        const v=new THREE.Mesh(new THREE.BoxGeometry(16,46,16),m.trim);
        v.position.set(c*(RING_R-8)-s*(i-1)*36,sd*156,s*(RING_R-8)+c*(i-1)*36);parts.push(v);
        const vt=new THREE.Mesh(new THREE.BoxGeometry(11,5,11),m.lit);
        vt.position.set(c*(RING_R-8)-s*(i-1)*36,sd*180,s*(RING_R-8)+c*(i-1)*36);parts.push(vt);
      }
      // the glow out of the refinery throat, which is the only warm thing on the outside of this station
      const th=new THREE.Mesh(new THREE.BoxGeometry(42,7,70),m.warp);
      th.position.set(c*(RING_R-8),sd*30,s*(RING_R-8));th.rotation.y=-a;parts.push(th);
    }
  }

  // ---------- the pylons ----------
  // Six horns: three up, three down, each in its own vertical plane, each rooted on the docking ring
  // between two ore units. They go out and up, and the last third curves back in towards the axis, which
  // is what gives the station its shape from every angle. The clamp on the end is a fork.
  //
  // These were round tubes in the first pass and looked like bent drinking straws. They are hexagonal
  // blades, deep in the plane they curve in and flat across it, and they taper by half from root to tip.
  const smooth=(a,b,t)=>{const u=Math.min(1,Math.max(0,(t-a)/(b-a)));return u*u*(3-2*u);};
  const pylonR=t=>RING_R+170*Math.sin(t*2.1)-230*smooth(0.55,1,t);
  const pylonY=t=>PY_TIP*(1-Math.cos(t*1.45))/(1-Math.cos(1.45));
  for(let k=0;k<3;k++)for(const sd of [-1,1]){
    const a=k/3*Math.PI*2+(sd>0?Math.PI/3:0);
    const c=Math.cos(a),s=Math.sin(a);
    const path=[];
    const N=16;
    for(let i=0;i<=N;i++){
      const t=i/N, h=0.004;
      const r=pylonR(t), y=sd*pylonY(t);
      const dr=(pylonR(Math.min(1,t+h))-pylonR(Math.max(0,t-h)));
      const dy=sd*(pylonY(Math.min(1,t+h))-pylonY(Math.max(0,t-h)));
      const dl=Math.hypot(dr,dy)||1;
      path.push({p:[c*r,y,s*r],dir:[c*dr/dl,dy/dl,s*dr/dl],ry:56-t*32,rz:48-t*28});
    }
    parts.push(sweep(THREE,path,0,m.hull,SECT.hex));
    // the ribs down the outside of it
    for(let i=2;i<N-1;i+=3){
      const q=path[i],t=i/N;
      const rib=new THREE.Mesh(new THREE.BoxGeometry(18,74-t*38,106-t*56),m.trim);
      rib.position.set(q.p[0],q.p[1],q.p[2]);rib.rotation.y=-a;parts.push(rib);
    }
    // the docking clamp: a fork carried on past the tip, built in the tip's own frame so the prongs point
    // where the pylon points instead of standing off it at whatever angle the tip happened to reach
    {
      const q=path[N],d=q.dir;
      const up=[0,1,0];
      const rx=[d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]];
      const rl=Math.hypot(rx[0],rx[1],rx[2])||1;
      const R=[rx[0]/rl,rx[1]/rl,rx[2]/rl];
      const at=(along,across,off)=>new THREE.Vector3(
        q.p[0]+d[0]*along+R[0]*across, q.p[1]+d[1]*along+R[1]*across+off, q.p[2]+d[2]*along+R[2]*across);
      const face=new THREE.Euler(0,-a,0);
      const box=(w,h,l,pos,mat)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),mat);
        b.position.copy(pos);b.setRotationFromEuler(face);parts.push(b);return b;};
      box(52,42,104,at(24,0,0),m.panelB);               // the collar the prongs come out of
      for(const arm of [-1,1])box(30,30,34,at(72,arm*36,0),m.dark);
      for(const arm of [-1,1])box(22,22,26,at(104,arm*36,0),m.trim);
      const th=new THREE.Mesh(new THREE.BoxGeometry(30,12,60),m.lit);
      th.position.copy(at(62,0,0));th.setRotationFromEuler(face);parts.push(th);
    }
  }

  // ---------- the running lights ----------
  const blinkers=[];
  for(let k=0;k<6;k++){
    const a=k/6*Math.PI*2;
    const b=new THREE.Mesh(new THREE.SphereGeometry(5,8,6),k%2?m.nav:m.navG);
    b.position.set(Math.cos(a)*(RING_R+70),0,Math.sin(a)*(RING_R+70));
    b.userData.noWire=true;scene.add(b);blinkers.push(b);
  }
  animHooks.push(now=>{const on=(now%2400)<1200;for(const b of blinkers)b.visible=on;});

  fold(G,parts);
  scene.add(G);

  // ---------- the wormhole ----------
  // It is not there most of the time. Something goes through, it opens - a blue-white iris with a funnel
  // behind it - and then it is not there again. Nothing else in this collection has an event in it, and it
  // is the only reason this particular station is parked where it is.
  const WH=new THREE.Group();
  {
    const K=(api.C.space&&api.C.space.wormhole)||{};
    const at=K.at||[-1.1,0.06,9000];
    WH.position.set(Math.cos(at[0])*Math.cos(at[1])*at[2],Math.sin(at[1])*at[2],
                    Math.sin(at[0])*Math.cos(at[1])*at[2]);
    WH.lookAt(0,0,0);
    const coreM=new THREE.MeshBasicMaterial({color:0xdfeeff,transparent:true,opacity:0,
      blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const ringM=new THREE.MeshBasicMaterial({color:0x6fb4ff,transparent:true,opacity:0,
      blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const R0=K.size||1500;
    const disc=new THREE.Mesh(new THREE.CircleGeometry(R0*0.42,40),coreM);
    WH.add(disc);
    const rings=[];
    for(let i=0;i<7;i++){
      const r=new THREE.Mesh(new THREE.RingGeometry(R0*(0.42+i*0.10),R0*(0.50+i*0.10),44),ringM);
      r.position.z=-i*R0*0.16;WH.add(r);rings.push(r);
    }
    // the funnel behind it, which is the bit that reads as depth rather than as a hole punched in the sky
    const funnel=new THREE.Mesh(new THREE.CylinderGeometry(R0*0.42,R0*0.06,R0*2.2,28,1,true),ringM);
    funnel.rotation.x=Math.PI/2;funnel.position.z=-R0*1.1;WH.add(funnel);
    WH.traverse(o=>{o.userData.noWire=true;o.frustumCulled=false;});
    scene.add(WH);
    const PERIOD=K.period||34000, OPEN=K.open||7000;
    animHooks.push(now=>{
      const t=now%PERIOD;
      let f=0;
      if(t<OPEN){
        const u=t/OPEN;
        f=Math.sin(u*Math.PI);                      // it blooms and closes
        f=f*f;
      }
      coreM.opacity=0.95*f;ringM.opacity=0.55*f;
      WH.scale.setScalar(0.35+0.65*f);
      rings.forEach((r,i)=>{r.rotation.z=now*0.0004*(i%2?1:-1)+i;});
      funnel.material.opacity=0.28*f;
    });
  }

  return {radius:1300, group:G};
}
