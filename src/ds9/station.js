// ---------- Deep Space 9 ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// here is this project's own geometry, built from the published dimensions and the silhouette.
//
// A Cardassian ore-processing station, built over somebody else's planet by people who were not asked, and
// afterwards towed to the mouth of a wormhole and left there. 1,451 m across the docking ring, 968 m from
// the tip of one upper pylon to the tip of a lower one.
//
// The design language is the opposite of Starfleet's and that is the point of drawing it. Starfleet builds
// smooth pale hulls out of curves that flow into each other. This is brown, it is ribbed, it is
// symmetrical in threes rather than about a keel, and every surface is either a segment of a circle or a
// hard bevel between two of them. Nothing on it is trying to look fast, because it is a building.
//
// The layout, from the middle out:
//
//   the core        a spindle standing on end: Ops on top, the habitat levels under it, the Promenade as a
//                   drum round the middle, the reactor levels below that, and a spire at each end
//   the ring        a torus at the core's waist, joined to it by three crossover bridges, with the
//                   ore-processing units built into it between them
//   the pylons      six horns off the ring, three up and three down, curving out and back in, with a
//                   docking clamp on the end of each - which is the whole silhouette
import {lathe,tube,sweep,windowRing,windowRow} from '../starship/parts.js';

export function model(api){
  const {THREE,scene,animHooks,fold,palette}=api;
  // Cardassian brown-grey: warmer and much darker than Starfleet, and the lights in it are amber rather
  // than white, which on its own does most of the work of saying who built it.
  const m=palette({hull:0x6e6450,panelA:0x635a49,panelB:0x7c7258,dark:0x3a352c,trim:0x55503f,
                   lit:0xffc46a,warp:0xffb04a,impulse:0xff9a3a,deflector:0xffb84a});
  const G=new THREE.Group();
  const parts=[];

  const RING_R=560, RING_T=34, CORE_R=112;

  // ---------- the core ----------
  // One lathe from the top spire to the bottom one. The Promenade is the wide drum at the waist; the
  // reactor levels below it are wider than the habitat levels above, which is why the whole thing looks
  // bottom-heavy from outside and is the right way up on the inside.
  {
    const P=[
      [0.001, 300],[10, 296],[16, 288],[18, 272],   // the upper spire
      [22, 250],[30, 240],[46, 232],[52, 224],      // Ops, on the top
      [50, 214],[40, 206],[36, 196],
      [44, 186],[52, 176],[56, 160],[58, 140],      // the habitat levels
      [62, 122],[70, 112],[86, 104],
      [104, 96],[112, 84],[112, 40],                // the Promenade drum
      [108, 26],[100, 14],[96, -4],
      [98, -24],[104, -44],[104, -74],              // the reactor levels
      [96, -96],[84, -116],[70, -132],
      [56, -150],[48, -172],[44, -196],
      [34, -220],[24, -246],[14, -272],[0.001, -300],
    ];
    const core=lathe(THREE,P,36,m.hull);
    parts.push(core);
    // the ribs: six of them all the way up, which is the thing that makes it Cardassian
    for(let k=0;k<6;k++){
      const a=k/6*Math.PI*2+0.26;
      for(let i=0;i<9;i++){
        const y=-150+i*46;
        const r=y>40?(y>104?68:112):(y>-74?104:80);
        const rib=new THREE.Mesh(new THREE.BoxGeometry(11,38,16),m.trim);
        rib.position.set(Math.cos(a)*r,y,Math.sin(a)*r);rib.rotation.y=-a;parts.push(rib);
      }
    }
    // the Promenade: three rows of windows round the drum, which is the only part of this station anybody
    // who does not work here ever sees
    for(const y of [74,58,44])windowRing(THREE,parts,m.lit,y,113,113,54,[2.6,5,4.6]);
    // Ops, and the light out of its dome
    const dome=lathe(THREE,[[0.001,236],[18,234],[30,229],[38,224]],28,m.dark);
    parts.push(dome);
    windowRing(THREE,parts,m.lit,228,47,47,20,[3,4,4]);
    // the habitat levels' windows
    for(const y of [188,168,148,128])windowRing(THREE,parts,m.lit,y,59,59,26,[2.2,3.4,3.4]);
    for(const y of [-40,-64,-88])windowRing(THREE,parts,m.lit,y,105,105,34,[2.4,3.6,3.8]);
  }

  // ---------- the docking ring ----------
  {
    const ring=new THREE.Mesh(new THREE.TorusGeometry(RING_R,RING_T,14,72),m.hull);
    ring.rotation.x=Math.PI/2;parts.push(ring);
    // the outer face is flat and ribbed rather than round: a segmented band round the whole thing
    for(let k=0;k<72;k++){
      const a=k/72*Math.PI*2;
      const seg=new THREE.Mesh(new THREE.BoxGeometry(RING_R*Math.PI*2/72*0.96,44,18),m.panelA);
      seg.position.set(Math.cos(a)*(RING_R+26),0,Math.sin(a)*(RING_R+26));
      seg.rotation.y=-a+Math.PI/2;parts.push(seg);
      if(k%3===0){
        const w=new THREE.Mesh(new THREE.BoxGeometry(6,4,5),m.lit);
        w.position.set(Math.cos(a)*(RING_R+36),6,Math.sin(a)*(RING_R+36));
        w.rotation.y=-a;parts.push(w);
      }
    }
    // the six docking ports on the inner face of the ring, between the pylon roots
    for(let k=0;k<6;k++){
      const a=k/6*Math.PI*2+Math.PI/6;
      const port=new THREE.Mesh(new THREE.BoxGeometry(46,54,30),m.dark);
      port.position.set(Math.cos(a)*(RING_R-40),0,Math.sin(a)*(RING_R-40));
      port.rotation.y=-a;parts.push(port);
      const lamp=new THREE.Mesh(new THREE.BoxGeometry(3,30,18),m.lit);
      lamp.position.set(Math.cos(a)*(RING_R-58),0,Math.sin(a)*(RING_R-58));
      lamp.rotation.y=-a;parts.push(lamp);
    }
  }

  // ---------- the crossover bridges ----------
  // Three of them, at a hundred and twenty degrees, and they are the only way between the ring and the
  // core. Square in section, ribbed, with a run of lit ports down each side.
  for(let k=0;k<3;k++){
    const a=k/3*Math.PI*2+0.5;
    const c=Math.cos(a),s=Math.sin(a);
    const len=RING_R-CORE_R-30;
    const br=new THREE.Mesh(new THREE.BoxGeometry(len,40,52),m.hull);
    br.position.set(c*(CORE_R+30+len/2),0,s*(CORE_R+30+len/2));br.rotation.y=-a;parts.push(br);
    for(let i=0;i<9;i++){
      const r=CORE_R+40+i*(len-20)/8;
      const rib=new THREE.Mesh(new THREE.BoxGeometry(12,52,62),m.trim);
      rib.position.set(c*r,0,s*r);rib.rotation.y=-a;parts.push(rib);
      for(const sd of [-1,1]){
        const w=new THREE.Mesh(new THREE.BoxGeometry(9,5,3),m.lit);
        w.position.set(c*r-s*sd*27,10,s*r+c*sd*27);w.rotation.y=-a;parts.push(w);
      }
    }
  }

  // ---------- the ore-processing units ----------
  // Six of them, standing on the ring between the pylons. This station was built to refine what was dug out
  // of the planet below it, and these are the only part of it that was ever used for that.
  for(let k=0;k<6;k++){
    const a=k/6*Math.PI*2+Math.PI/6;
    const c=Math.cos(a),s=Math.sin(a);
    for(const sd of [-1,1]){
      const u=new THREE.Mesh(new THREE.BoxGeometry(66,54,86),m.panelB);
      u.position.set(c*(RING_R-6),sd*52,s*(RING_R-6));u.rotation.y=-a;parts.push(u);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(44,16,64),m.dark);
      cap.position.set(c*(RING_R-6),sd*84,s*(RING_R-6));cap.rotation.y=-a;parts.push(cap);
      for(let i=0;i<3;i++){
        const v=new THREE.Mesh(new THREE.BoxGeometry(10,26,10),m.trim);
        v.position.set(c*(RING_R-6)-s*(i-1)*24,sd*98,s*(RING_R-6)+c*(i-1)*24);parts.push(v);
      }
    }
  }

  // ---------- the pylons ----------
  // Six horns: three up, three down, each in its own vertical plane, each rooted on the ring between two
  // ore units. They go out and up, and then the last third curves back in towards the axis, which is what
  // gives the station its shape from every angle. The clamp on the end is a fork.
  for(let k=0;k<3;k++)for(const sd of [-1,1]){
    const a=k/3*Math.PI*2+(sd>0?Math.PI/3:0);
    const c=Math.cos(a),s=Math.sin(a);
    const path=[];
    const N=14;
    for(let i=0;i<=N;i++){
      const t=i/N;
      // out, up, and back in at the top
      const r=RING_R+178*Math.sin(t*2.0)-58*Math.max(0,t-0.72)/0.28;
      const y=sd*(352*(1-Math.cos(t*Math.PI*0.94))/1.72);
      const dr=178*2.0*Math.cos(t*2.0)/N-(t>0.72?58/0.28/N:0);
      const dy=sd*352*Math.PI*0.94*Math.sin(t*Math.PI*0.94)/1.72/N;
      const dl=Math.hypot(dr,dy)||1;
      path.push({p:[c*r,y,s*r],dir:[c*dr/dl,dy/dl,s*dr/dl],
                 ry:30-t*10,rz:46-t*18});
    }
    parts.push(sweep(THREE,path,14,m.hull));
    // the ribs down the outside of it
    for(let i=2;i<N-1;i+=2){
      const q=path[i];
      const rib=new THREE.Mesh(new THREE.BoxGeometry(14,52-i*1.4,70-i*2),m.trim);
      rib.position.set(q.p[0],q.p[1],q.p[2]);rib.rotation.y=-a;parts.push(rib);
    }
    // the docking clamp: two arms and a lit throat between them
    {
      const q=path[N];
      const cx=q.p[0],cy=q.p[1],cz=q.p[2];
      for(const arm of [-1,1]){
        const b=new THREE.Mesh(new THREE.BoxGeometry(22,58,16),m.dark);
        b.position.set(cx-s*arm*26,cy+sd*28,cz+c*arm*26);b.rotation.y=-a;parts.push(b);
      }
      const throat=new THREE.Mesh(new THREE.BoxGeometry(18,14,40),m.lit);
      throat.position.set(cx,cy+sd*40,cz);throat.rotation.y=-a;parts.push(throat);
      const tip=new THREE.Mesh(new THREE.BoxGeometry(30,20,62),m.panelA);
      tip.position.set(cx,cy+sd*12,cz);tip.rotation.y=-a;parts.push(tip);
    }
  }

  // ---------- the running lights ----------
  const blinkers=[];
  for(let k=0;k<6;k++){
    const a=k/6*Math.PI*2;
    const b=new THREE.Mesh(new THREE.SphereGeometry(7,8,6),k%2?m.nav:m.navG);
    b.position.set(Math.cos(a)*(RING_R+44),0,Math.sin(a)*(RING_R+44));
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

  return {radius:1000, group:G};
}
